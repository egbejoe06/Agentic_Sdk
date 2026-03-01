/**
 * Raydium swap demo on devnet.
 *
 * 1. Checks balance (always).
 * 2. If RAYDIUM_POOL_ID + RAYDIUM_OUTPUT_MINT are set: runs a programmatic swap
 *    (0.01 SOL → output token), then asks the agent to do the same via natural language.
 * 3. If not set: prints instructions to create a pool and set env vars.
 *
 * Prereqs:
 *   - WALLET_SECRET_KEY in .env (funded on devnet)
 *   - GOOGLE_GENERATIVE_AI_API_KEY for the agent path
 *   - Optional: RAYDIUM_POOL_ID + RAYDIUM_OUTPUT_MINT for real swaps
 *
 * Run: npm run build && node dist/demo/raydiumDemo.js
 */
import "dotenv/config";
//# sourceMappingURL=raydiumDemo.d.ts.map