"use strict";
/**
 * Intent: transfer SPL tokens to a recipient.
 * Used by wallet.execute({ type: "transfer_spl", mint, to, amount }).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransferSplIntent = isTransferSplIntent;
function isTransferSplIntent(intent) {
    return intent.type === "transfer_spl";
}
// TODO: Phase 3 — build SPL token transfer instruction from intent
