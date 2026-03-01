/**
 * Intent guards for Raydium CPMM intents (create pool, swap).
 * Transaction building is done in AgenticWallet using the Raydium SDK.
 */
import type { Intent } from "../core/types.js";
export declare function isCreateCpmmPoolIntent(intent: Intent): intent is Intent & {
    type: "create_cpmm_pool";
};
export declare function isSwapCpmmIntent(intent: Intent): intent is Intent & {
    type: "swap_cpmm";
};
//# sourceMappingURL=raydiumCpmm.d.ts.map