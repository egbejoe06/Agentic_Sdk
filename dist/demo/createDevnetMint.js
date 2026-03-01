/**
 * Helper script: creates a new SPL token mint on Devnet and mints some tokens to your wallet.
 * Run ONCE to get a DEMO_MINT_B address for raydiumDemo.ts.
 *
 * Run: npm run build && node dist/demo/createDevnetMint.js
 */
import "dotenv/config";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, } from "@solana/spl-token";
import { loadKeypairFromEnv } from "../src/index.js";
async function main() {
    const keypair = loadKeypairFromEnv();
    if (!keypair) {
        console.error("❌ WALLET_SECRET_KEY not set in .env");
        process.exit(1);
    }
    const rpcUrl = process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet");
    const connection = new Connection(rpcUrl, "confirmed");
    console.log("🔑 Wallet:", keypair.publicKey.toBase58());
    const balance = await connection.getBalance(keypair.publicKey);
    console.log("💰 Balance:", balance / 1e9, "SOL");
    if (balance < 0.1 * 1e9) {
        console.error("❌ Not enough SOL. Fund your devnet wallet first (need ~0.1 SOL).");
        process.exit(1);
    }
    // 1. Create a new SPL mint (6 decimals)
    console.log("\n⏳ Creating new SPL token mint (6 decimals)...");
    const mint = await createMint(connection, keypair, // payer
    keypair.publicKey, // mint authority
    null, // freeze authority (none)
    6 // decimals
    );
    console.log("✅ Mint created:", mint.toBase58());
    // 2. Create ATA for wallet
    console.log("\n⏳ Creating associated token account...");
    const ata = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey);
    console.log("✅ ATA:", ata.address.toBase58());
    // 3. Mint 1,000,000 tokens (1,000,000 * 10^6 raw)
    const AMOUNT = 1_000_000;
    console.log(`\n⏳ Minting ${AMOUNT} tokens to your wallet...`);
    await mintTo(connection, keypair, mint, ata.address, keypair, // mint authority
    BigInt(AMOUNT) * BigInt(10 ** 6));
    console.log("✅ Minted", AMOUNT, "tokens to", ata.address.toBase58());
    console.log("\n🎉 Done! Paste this into raydiumDemo.ts:");
    console.log(`   const DEMO_MINT_B = "${mint.toBase58()}";`);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
