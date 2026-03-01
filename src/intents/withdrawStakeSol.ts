import { PublicKey, StakeProgram, TransactionInstruction } from "@solana/web3.js";
import type { Intent } from "../core/types.js";

export function isWithdrawStakeSolIntent(
  intent: Intent
): intent is Intent & { type: "withdraw_stake_sol" } {
  return intent.type === "withdraw_stake_sol";
}

export function buildWithdrawStakeSolInstructions(
  authority: PublicKey,
  intent: Extract<Intent, { type: "withdraw_stake_sol" }>
): TransactionInstruction[] {
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

