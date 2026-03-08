import { PublicKey, StakeProgram, Authorized, Lockup, SystemProgram, } from "@solana/web3.js";
export function isStakeSolIntent(intent) {
    return intent.type === "stake_sol";
}
export async function buildStakeSolInstructions(payer, intent, connection) {
    const amountInLamports = intent.amount * 1e9;
    const seed = `stake-${Date.now()}`;
    const stakeAccountPubkey = await PublicKey.createWithSeed(payer, seed, StakeProgram.programId);
    let votePubkey;
    if (intent.validator) {
        votePubkey = new PublicKey(intent.validator);
    }
    else {
        const voteAccounts = await connection.getVoteAccounts();
        const candidate = (voteAccounts.current && voteAccounts.current[0]) ||
            (voteAccounts.delinquent && voteAccounts.delinquent[0]);
        if (!candidate) {
            throw new Error("No validator vote accounts available on this cluster");
        }
        votePubkey = new PublicKey(candidate.votePubkey);
    }
    const instructions = [];
    instructions.push(SystemProgram.createAccountWithSeed({
        fromPubkey: payer,
        newAccountPubkey: stakeAccountPubkey,
        basePubkey: payer,
        seed: seed,
        lamports: amountInLamports,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
    }));
    instructions.push(StakeProgram.initialize({
        stakePubkey: stakeAccountPubkey,
        authorized: new Authorized(payer, payer),
        lockup: Lockup.default,
    }));
    instructions.push(...StakeProgram.delegate({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: payer,
        votePubkey: votePubkey,
    }).instructions);
    return instructions;
}
