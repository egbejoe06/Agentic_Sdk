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
//# sourceMappingURL=createDevnetPool.d.ts.map