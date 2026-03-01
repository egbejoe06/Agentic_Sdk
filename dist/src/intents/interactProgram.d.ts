/**
 * Intent: interact with an arbitrary program (CPI, custom instruction).
 * Used by wallet.execute({ type: "interact_program", programId, data }).
 */
import { TransactionInstruction } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
export declare function isInteractProgramIntent(intent: Intent): intent is Intent & {
    type: "interact_program";
};
export declare function buildInteractProgramInstruction(intent: Extract<Intent, {
    type: "interact_program";
}>): TransactionInstruction;
//# sourceMappingURL=interactProgram.d.ts.map