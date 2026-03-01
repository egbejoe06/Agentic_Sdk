import type { Connection } from "@solana/web3.js";
import type { Keypair } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
import type { TransactionInstruction } from "@solana/web3.js";
export declare function isWhirlpoolHarvestIntent(intent: Intent): intent is Intent & {
    type: "whirlpool_harvest";
};
/**
 * Build harvest (collect fees and rewards) instructions for an Orca Whirlpool position.
 * Uses the instruction-based Orca API and converts to web3.js v1 for use with AgenticWallet.
 */
export declare function buildWhirlpoolHarvestInstructions(connection: Connection, authorityKeypair: Keypair, intent: Extract<Intent, {
    type: "whirlpool_harvest";
}>): Promise<TransactionInstruction[]>;
//# sourceMappingURL=whirlpoolHarvest.d.ts.map