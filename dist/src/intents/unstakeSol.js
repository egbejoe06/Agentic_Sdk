import { PublicKey, StakeProgram } from "@solana/web3.js";
export function isUnstakeSolIntent(intent) {
    return intent.type === "unstake_sol";
}
/**
 * Build a deactivate instruction for an existing stake account.
 */
export function buildUnstakeSolInstructions(authority, intent) {
    const stakePubkey = new PublicKey(intent.stakeAccount);
    const tx = StakeProgram.deactivate({
        stakePubkey,
        authorizedPubkey: authority,
    });
    return tx.instructions;
}
