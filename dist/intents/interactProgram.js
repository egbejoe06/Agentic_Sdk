"use strict";
/**
 * Intent: interact with an arbitrary program (CPI, custom instruction).
 * Used by wallet.execute({ type: "interact_program", programId, data }).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInteractProgramIntent = isInteractProgramIntent;
function isInteractProgramIntent(intent) {
    return intent.type === "interact_program";
}
// TODO: Phase 3 — build transaction with instruction to programId + data
