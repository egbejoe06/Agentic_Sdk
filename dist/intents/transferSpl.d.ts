/**
 * Intent: transfer SPL tokens to a recipient.
 * Used by wallet.execute({ type: "transfer_spl", mint, to, amount }).
 */
import type { Intent } from "../core/types.js";
export declare function isTransferSplIntent(intent: Intent): intent is Intent & {
    type: "transfer_spl";
};
//# sourceMappingURL=transferSpl.d.ts.map