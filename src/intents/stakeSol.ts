import {
  PublicKey,
  StakeProgram,
  Authorized,
  Lockup,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import type { Intent } from "../core/types.js";

export function isStakeSolIntent(intent: Intent): intent is Intent & { type: "stake_sol" } {
  return intent.type === "stake_sol";
}

/**
  * Builds instructions for Solana native staking.
  * Uses createAccountWithSeed to avoid needing a new Keypair.
  */
export async function buildStakeSolInstructions(
  payer: PublicKey,
  intent: Extract<Intent, { type: "stake_sol" }>,
  connection: any // Connection passed from wallet; used for rent + validator lookup
): Promise<TransactionInstruction[]> {
  const amountInLamports = intent.amount * 1e9;
  const seed = `stake-${Date.now()}`;
  const stakeAccountPubkey = await PublicKey.createWithSeed(
    payer,
    seed,
    StakeProgram.programId
  );

  // Resolve validator vote account:
  // - If caller specifies one, trust it.
  // - Otherwise, dynamically pick a real validator from the current cluster via getVoteAccounts().
  let votePubkey: PublicKey;
  if (intent.validator) {
    votePubkey = new PublicKey(intent.validator);
  } else {
    const voteAccounts = await connection.getVoteAccounts();
    const candidate =
      (voteAccounts.current && voteAccounts.current[0]) ||
      (voteAccounts.delinquent && voteAccounts.delinquent[0]);

    if (!candidate) {
      throw new Error("No validator vote accounts available on this cluster");
    }

    votePubkey = new PublicKey(candidate.votePubkey);
  }

  const instructions: TransactionInstruction[] = [];

  // 1. Create Account with Seed
  instructions.push(
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer,
      newAccountPubkey: stakeAccountPubkey,
      basePubkey: payer,
      seed: seed,
      lamports: amountInLamports,
      space: StakeProgram.space,
      programId: StakeProgram.programId,
    })
  );

  // 2. Initialize Stake
  instructions.push(
    StakeProgram.initialize({
      stakePubkey: stakeAccountPubkey,
      authorized: new Authorized(payer, payer),
      lockup: Lockup.default,
    })
  );

  // 3. Delegate Stake
  instructions.push(
    ...StakeProgram.delegate({
      stakePubkey: stakeAccountPubkey,
      authorizedPubkey: payer,
      votePubkey: votePubkey,
    }).instructions
  );

  return instructions;
}
