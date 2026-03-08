import "dotenv/config";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createAgenticWallet, loadKeypairFromEnv } from "../src/index.js";
import { DEV_USDC_MINT } from "../src/constants.js";
/**
 * Orca Whirlpools swap demo (Solana Devnet).
 *
 * Prerequisites:
 * - WALLET_SECRET_KEY in .env (JSON array of 64 numbers)
 * - Wallet funded with devnet SOL (enough for swap + fees)
 *
 * Uses the SOL/devUSDC devnet pool. Swap a tiny amount of SOL (0.001 SOL) to demonstrate
 * the whirlpool_swap intent through the policy-governed wallet.
 */
// Devnet pool and mints (from Orca docs – adjust if devnet pool differs)
const DEVNET_POOL_SOL_USDC = "3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt";
const MINT_SOL = "So11111111111111111111111111111111111111112";
async function main() {
    console.log("🔄 Orca Whirlpools Swap Demo (Devnet)\n");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const keypair = loadKeypairFromEnv("WALLET_SECRET_KEY");
    if (!keypair) {
        console.error("❌ Set WALLET_SECRET_KEY in .env (JSON array of 64 numbers).");
        process.exit(1);
    }
    const wallet = await createAgenticWallet({
        connection,
        keypair,
        policy: { maxTxSol: 0.5 },
    });
    const balance = await wallet.getBalance();
    const usdcBalance = await wallet.getTokenBalance(DEV_USDC_MINT);
    console.log(`✅ Wallet: ${wallet.getPublicKey()}`);
    console.log(`   SOL balance: ${balance} SOL`);
    console.log(`   devUSDC balance: ${usdcBalance} devUSDC\n`);
    if (balance < 0.01) {
        console.error("❌ Fund this wallet with devnet SOL (e.g. 0.1 SOL) and retry.");
        process.exit(1);
    }
    // 0.001 SOL (1e6 lamports) – exact-in swap
    const inputAmountLamports = "1000000";
    const slippageBps = 100; // 1%
    console.log("📤 Executing whirlpool_swap (exact-in):");
    console.log(`   Pool: ${DEVNET_POOL_SOL_USDC}`);
    console.log(`   Input mint: ${MINT_SOL} (wrapped SOL)`);
    console.log(`   Input amount: ${inputAmountLamports} lamports (0.001 SOL)`);
    console.log(`   Slippage: ${slippageBps} bps\n`);
    const result = await wallet.execute({
        type: "whirlpool_swap",
        poolAddress: DEVNET_POOL_SOL_USDC,
        mint: MINT_SOL,
        inputAmount: inputAmountLamports,
        slippageToleranceBps: slippageBps,
    });
    if (result.success && result.signature) {
        console.log("✅ Swap sent successfully.");
        console.log(`   Signature: ${result.signature}`);
        console.log(`   Explorer: https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);
    }
    else {
        console.error("❌ Swap failed:", result.error ?? "Unknown error");
        process.exit(1);
    }
}
main().catch(console.error);
