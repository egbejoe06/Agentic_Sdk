import { PublicKey, StakeProgram, TransactionInstruction } from "@solana/web3.js";
import type { Intent } from "../core/types.js";

export function isUnstakeSolIntent(intent: Intent): intent is Intent & { type: "unstake_sol" } {
  return intent.type === "unstake_sol";
}

export function buildUnstakeSolInstructions(
  authority: PublicKey,
  intent: Extract<Intent, { type: "unstake_sol" }>
): TransactionInstruction[] {
  const stakePubkey = new PublicKey(intent.stakeAccount);

  const tx = StakeProgram.deactivate({
    stakePubkey,
    authorizedPubkey: authority,
  });

  return tx.instructions;
}

