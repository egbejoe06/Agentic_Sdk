/**
 * One-off script: generate a new keypair and print public key + secret for WALLET_SECRET_KEY.
 * Run: npx tsx demo/generateKeypair.ts
 * Then add to .env: WALLET_SECRET_KEY=[...] and USE_EXISTING_WALLET=1
 */
import { Keypair } from "@solana/web3.js";

const kp = Keypair.generate();
const secretJson = JSON.stringify(Array.from(kp.secretKey));

console.log("Public key (fund this on devnet):");
console.log(kp.publicKey.toBase58());
console.log("");
console.log("Add to .env as a single line:");
console.log(`WALLET_SECRET_KEY=${secretJson}`);
console.log("");
console.log("Then set USE_EXISTING_WALLET=1 and run the demo.");
