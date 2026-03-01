import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
export declare function isUnstakeSolIntent(intent: Intent): intent is Intent & {
    type: "unstake_sol";
};
/**
 * Build a deactivate instruction for an existing stake account.
 */
export declare function buildUnstakeSolInstructions(authority: PublicKey, intent: Extract<Intent, {
    type: "unstake_sol";
}>): TransactionInstruction[];
//# sourceMappingURL=unstakeSol.d.ts.map