/**
 * Create a Raydium CPMM pool (SOL / custom token) on devnet.
 *
 * Run after createDevnetMint.js: you need a funded wallet and a token mint.
 * Set RAYDIUM_OUTPUT_MINT (or DEMO_MINT_B) in .env to the mint from createDevnetMint.
 *
 * Flow:
 *   1. Derive pool PDAs (poolId, vaults, lpMint, observationId, configId).
 *   2. Create WSOL ATA for user, fund it, sync native.
 *   3. Ensure user has token B ATA (create idempotent) and balance.
 *   4. Create user LP ATA (idempotent).
 *   5. Build create-pool instruction and send transaction.
 *
 * Run: npm run build && node dist/demo/createDevnetPool.js
 */
import "dotenv/config";
import BN from "bn.js";
import { Connection, PublicKey, SystemProgram, Transaction, } from "@solana/web3.js";
import { NATIVE_MINT, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction, createSyncNativeInstruction, getMint, } from "@solana/spl-token";
import { getCreatePoolKeys, getCpmmPdaAmmConfigId, makeCreateCpmmPoolInInstruction, } from "@raydium-io/raydium-sdk-v2";
import { loadKeypairFromEnv } from "../src/index.js";
import { RAYDIUM_CPMM_PROGRAM_ID, RAYDIUM_CPMM_CREATE_POOL_FEE_ACCOUNT, } from "../src/core/constants.js";
import { clusterApiUrl } from "@solana/web3.js";
const WSOL_DECIMALS = 9;
async function main() {
    const keypair = loadKeypairFromEnv();
    if (!keypair) {
        console.error("❌ WALLET_SECRET_KEY not set.");
        process.exit(1);
    }
    const mintBStr = process.env.RAYDIUM_OUTPUT_MINT ?? process.env.DEMO_MINT_B;
    if (!mintBStr) {
        console.error("❌ Set RAYDIUM_OUTPUT_MINT or DEMO_MINT_B to your token mint (from createDevnetMint).");
        process.exit(1);
    }
    const rpcUrl = process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet");
    const connection = new Connection(rpcUrl, "confirmed");
    const payer = keypair.publicKey;
    const mintB = new PublicKey(mintBStr);
    console.log("🔑 Payer:", payer.toBase58());
    console.log("🪙 Mint B (other token):", mintBStr);
    const mintBInfo = await getMint(connection, mintB);
    const decimalsB = mintBInfo.decimals;
    const balance = await connection.getBalance(payer);
    if (balance < 0.2 * 1e9) {
        console.error("❌ Need at least ~0.2 SOL. Fund the wallet on devnet.");
        process.exit(1);
    }
    // Config: index 0 is the default CPMM config on Raydium
    const configId = getCpmmPdaAmmConfigId(RAYDIUM_CPMM_PROGRAM_ID, 0)
        .publicKey;
    const poolKeys = getCreatePoolKeys({
        programId: RAYDIUM_CPMM_PROGRAM_ID,
        configId,
        mintA: NATIVE_MINT,
        mintB,
    });
    const { poolId, authority, lpMint, vaultA, vaultB, observationId, } = poolKeys;
    const userVaultA = getAssociatedTokenAddressSync(NATIVE_MINT, payer);
    const userVaultB = getAssociatedTokenAddressSync(mintB, payer);
    const userLpAccount = getAssociatedTokenAddressSync(lpMint, payer);
    const amountA = new BN(0.1 * 1e9); // 0.1 SOL (lamports)
    const amountB = new BN(1000 * Math.pow(10, decimalsB)); // 1000 tokens
    const openTime = new BN(Math.floor(Date.now() / 1000));
    const tx = new Transaction();
    tx.add(createAssociatedTokenAccountIdempotentInstruction(payer, userVaultA, payer, NATIVE_MINT), SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: userVaultA,
        lamports: amountA.toNumber(),
    }), createSyncNativeInstruction(userVaultA));
    tx.add(createAssociatedTokenAccountIdempotentInstruction(payer, userVaultB, payer, mintB));
    tx.add(createAssociatedTokenAccountIdempotentInstruction(payer, userLpAccount, payer, lpMint));
    tx.add(makeCreateCpmmPoolInInstruction(RAYDIUM_CPMM_PROGRAM_ID, payer, configId, authority, poolId, NATIVE_MINT, mintB, lpMint, userVaultA, userVaultB, userLpAccount, vaultA, vaultB, RAYDIUM_CPMM_CREATE_POOL_FEE_ACCOUNT, TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, observationId, amountA, amountB, openTime));
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;
    console.log("\n⏳ Sending create-pool transaction...");
    const sig = await connection.sendTransaction(tx, [keypair], {
        skipPreflight: false,
        preflightCommitment: "confirmed",
    });
    console.log("   Tx:", sig);
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
    console.log("✅ Pool created.");
    console.log("\n🎉 Add to .env for raydiumDemo:");
    console.log(`   RAYDIUM_POOL_ID=${poolId.toBase58()}`);
    console.log(`   RAYDIUM_OUTPUT_MINT=${mintBStr}`);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
