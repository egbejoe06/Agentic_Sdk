/**
 * Intent: swap tokens on a Raydium CPMM pool (devnet-compatible).
 *
 * Flow:
 *   1. Fetch pool state from chain and decode with CpmmPoolInfoLayout.
 *   2. Fetch pool config and decode with CpmmConfigInfoLayout.
 *   3. Convert human-readable amount → raw BN using on-chain decimal info.
 *   4. Compute minAmountOut via CurveCalculator.swapBaseInput + slippage.
 *   5. Build instructions: optional WSOL wrap → idempotent ATA create → swap → optional WSOL unwrap.
 *
 * The poolId must be supplied by the caller (no routing API on devnet).
 * For SOL pairs use the WSOL mint: So11111111111111111111111111111111111111112.
 */
import BN from "bn.js";
import { PublicKey, SystemProgram, } from "@solana/web3.js";
import { NATIVE_MINT, getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction, createSyncNativeInstruction, createCloseAccountInstruction, } from "@solana/spl-token";
import { CpmmPoolInfoLayout, CpmmConfigInfoLayout, makeSwapCpmmBaseInInstruction, CurveCalculator, getPdaPoolAuthority, } from "@raydium-io/raydium-sdk-v2";
import { RAYDIUM_CPMM_PROGRAM_ID, NATIVE_MINT_STR } from "../core/constants.js";
export function isSwapRaydiumIntent(intent) {
    return intent.type === "swap_raydium";
}
/**
 * Build the instruction list for a Raydium CPMM swap.
 * Fetches live pool/vault state so the price and minimum-out are always accurate.
 */
export async function buildSwapRaydiumInstructions(connection, payer, intent) {
    const { inputMint: inputMintStr, outputMint: outputMintStr, amount, slippageBps, poolId: poolIdStr } = intent;
    const inputMintPubkey = new PublicKey(inputMintStr);
    const outputMintPubkey = new PublicKey(outputMintStr);
    const poolId = new PublicKey(poolIdStr);
    const isInputSol = inputMintStr === NATIVE_MINT_STR;
    const isOutputSol = outputMintStr === NATIVE_MINT_STR;
    // ── 1. Fetch and decode pool account ────────────────────────────────────────
    const poolAccountInfo = await connection.getAccountInfo(poolId);
    if (!poolAccountInfo) {
        throw new Error(`Pool ${poolIdStr} not found on chain. Create a CPMM pool on devnet first.`);
    }
    const pool = CpmmPoolInfoLayout.decode(poolAccountInfo.data);
    // Verify the pool actually contains the requested mints
    const inputIsA = pool.mintA.equals(inputMintPubkey);
    const inputIsB = pool.mintB.equals(inputMintPubkey);
    if (!inputIsA && !inputIsB) {
        throw new Error(`Pool ${poolIdStr} does not contain mint ${inputMintStr}. ` +
            `Pool mints: A=${pool.mintA.toBase58()} B=${pool.mintB.toBase58()}`);
    }
    // ── 2. Fetch and decode config account ──────────────────────────────────────
    const configAccountInfo = await connection.getAccountInfo(pool.configId);
    if (!configAccountInfo) {
        throw new Error(`Pool config account ${pool.configId.toBase58()} not found.`);
    }
    const config = CpmmConfigInfoLayout.decode(configAccountInfo.data);
    // ── 3. Resolve vault directions and decimals ────────────────────────────────
    const inputVault = inputIsA ? pool.vaultA : pool.vaultB;
    const outputVault = inputIsA ? pool.vaultB : pool.vaultA;
    const inputDecimals = inputIsA ? pool.mintDecimalA : pool.mintDecimalB;
    // mintProgram for each side — supports Token-2022 pools if ever used on devnet
    const inputTokenProgram = inputIsA ? pool.mintProgramA : pool.mintProgramB;
    const outputTokenProgram = inputIsA ? pool.mintProgramB : pool.mintProgramA;
    // ── 4. Convert human-readable amount to raw lamports/base-units ─────────────
    const amountInRaw = new BN(Math.round(amount * Math.pow(10, inputDecimals)));
    // ── 5. Fetch live vault balances for accurate price computation ─────────────
    const [inputVaultInfo, outputVaultInfo] = await Promise.all([
        connection.getTokenAccountBalance(inputVault),
        connection.getTokenAccountBalance(outputVault),
    ]);
    const inputVaultAmount = new BN(inputVaultInfo.value.amount);
    const outputVaultAmount = new BN(outputVaultInfo.value.amount);
    // ── 6. Compute output amount with fees ──────────────────────────────────────
    // isCreatorFeeOnInput: FeeOn enum — 0=Both, 1=OnlyTokenA, 2=OnlyTokenB
    // Creator fee applies to the input side when the input mint carries that fee.
    const isCreatorFeeOnInput = inputIsA ? pool.feeOn !== 2 : pool.feeOn !== 1;
    const swapResult = CurveCalculator.swapBaseInput(amountInRaw, inputVaultAmount, outputVaultAmount, config.tradeFeeRate, config.creatorFeeRate, config.protocolFeeRate, config.fundFeeRate, isCreatorFeeOnInput);
    // Apply slippage: minAmountOut = outputAmount × (10000 − slippageBps) / 10000
    const minAmountOut = swapResult.outputAmount
        .mul(new BN(10_000 - slippageBps))
        .div(new BN(10_000));
    // ── 7. Derive pool authority (program-level PDA, same for all CPMM pools) ───
    const { publicKey: authority } = getPdaPoolAuthority(RAYDIUM_CPMM_PROGRAM_ID);
    // ── 8. User token accounts ──────────────────────────────────────────────────
    // For SOL-in swaps, the user's "input account" is their WSOL ATA.
    const userInputATA = getAssociatedTokenAddressSync(inputMintPubkey, payer);
    const userOutputATA = getAssociatedTokenAddressSync(outputMintPubkey, payer);
    const instructions = [];
    // ── 9. Wrap SOL → WSOL if input is native SOL ───────────────────────────────
    // Create the WSOL ATA if needed, then fund it and sync the native balance.
    if (isInputSol) {
        instructions.push(createAssociatedTokenAccountIdempotentInstruction(payer, userInputATA, payer, NATIVE_MINT), SystemProgram.transfer({
            fromPubkey: payer,
            toPubkey: userInputATA,
            lamports: amountInRaw.toNumber(),
        }), createSyncNativeInstruction(userInputATA));
    }
    // ── 10. Create output ATA (idempotent — safe to include even if it exists) ──
    instructions.push(createAssociatedTokenAccountIdempotentInstruction(payer, userOutputATA, payer, outputMintPubkey));
    // ── 11. Raydium CPMM swap instruction ───────────────────────────────────────
    instructions.push(makeSwapCpmmBaseInInstruction(RAYDIUM_CPMM_PROGRAM_ID, payer, authority, pool.configId, poolId, userInputATA, userOutputATA, inputVault, outputVault, inputTokenProgram, outputTokenProgram, inputMintPubkey, outputMintPubkey, pool.observationId, amountInRaw, minAmountOut));
    // ── 12. Unwrap WSOL → SOL after swap if input was SOL (recover rent) ────────
    if (isInputSol) {
        instructions.push(createCloseAccountInstruction(userInputATA, payer, payer));
    }
    // ── 13. Unwrap WSOL → SOL if output is SOL ──────────────────────────────────
    if (isOutputSol) {
        instructions.push(createCloseAccountInstruction(userOutputATA, payer, payer));
    }
    return instructions;
}
