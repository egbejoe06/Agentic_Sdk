/**
 * Intent guards for Raydium CPMM intents (create pool, swap).
 * Transaction building is done in AgenticWallet using the Raydium SDK.
 */
export function isCreateCpmmPoolIntent(intent) {
    return intent.type === "create_cpmm_pool";
}
export function isSwapCpmmIntent(intent) {
    return intent.type === "swap_cpmm";
}
