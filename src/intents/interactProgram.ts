import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { Intent } from "../core/types.js";

export function isInteractProgramIntent(intent: Intent): intent is Intent & { type: "interact_program" } {
  return intent.type === "interact_program";
}

export function buildInteractProgramInstruction(intent: Extract<Intent, { type: "interact_program" }>): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(intent.programId),
    data: intent.data,
    keys: intent.keys.map(k => ({
      pubkey: new PublicKey(k.pubkey),
      isSigner: k.isSigner,
      isWritable: k.isWritable,
    })),
  });
}
