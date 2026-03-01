import type { Connection } from "@solana/web3.js";
import type { Keypair } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
import type { TransactionInstruction } from "@solana/web3.js";
export declare function isWhirlpoolAddLiquidityIntent(intent: Intent): intent is Intent & {
    type: "whirlpool_add_liquidity";
};
/**
 * Build add-liquidity instructions for Orca Whirlpools (devnet).
 * Uses the instruction-based Orca API and converts to web3.js v1 for use with AgenticWallet.
 */
export declare function buildWhirlpoolAddLiquidityInstructions(connection: Connection, authorityKeypair: Keypair, intent: Extract<Intent, {
    type: "whirlpool_add_liquidity";
}>): Promise<TransactionInstruction[]>;
//# sourceMappingURL=whirlpoolAddLiquidity.d.ts.map