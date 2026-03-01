/**
 * Intent: interact with an arbitrary program (CPI, custom instruction).
 * Used by wallet.execute({ type: "interact_program", programId, data }).
 */
import type { Intent } from "../core/types.js";
export declare function isInteractProgramIntent(intent: Intent): intent is Intent & {
    type: "interact_program";
};
//# sourceMappingURL=interactProgram.d.ts.map