import { PublicKey, StakeProgram } from "@solana/web3.js";
export function isWithdrawStakeSolIntent(intent) {
    return intent.type === "withdraw_stake_sol";
}
export function buildWithdrawStakeSolInstructions(authority, intent) {
    const stakePubkey = new PublicKey(intent.stakeAccount);
    const toPubkey = new PublicKey(intent.to ?? authority.toBase58());
    const lamports = intent.amount * 1e9;
    const tx = StakeProgram.withdraw({
        stakePubkey,
        authorizedPubkey: authority,
        toPubkey,
        lamports,
    });
    return tx.instructions;
}
