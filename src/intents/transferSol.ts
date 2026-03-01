import { PublicKey, SystemProgram } from "@solana/web3.js";
import type { Intent } from "../core/types.js";

export function isTransferSolIntent(intent: Intent): intent is Intent & { type: "transfer_sol" } {
  return intent.type === "transfer_sol";
}

/** Build a SystemProgram.transfer instruction from the intent. */
export function buildTransferSolInstruction(fromPubkey: PublicKey, intent: Intent & { type: "transfer_sol" }) {
  return SystemProgram.transfer({
    fromPubkey,
    toPubkey: new PublicKey(intent.to),
    lamports: intent.amount * 1e9, // Convert SOL to lamports
  });
}
