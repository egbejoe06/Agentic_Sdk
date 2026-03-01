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
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
export type SwapRaydiumIntent = Intent & {
    type: "swap_raydium";
};
export declare function isSwapRaydiumIntent(intent: Intent): intent is SwapRaydiumIntent;
/**
 * Build the instruction list for a Raydium CPMM swap.
 * Fetches live pool/vault state so the price and minimum-out are always accurate.
 */
export declare function buildSwapRaydiumInstructions(connection: Connection, payer: PublicKey, intent: SwapRaydiumIntent): Promise<TransactionInstruction[]>;
//# sourceMappingURL=swapRaydium.d.ts.map