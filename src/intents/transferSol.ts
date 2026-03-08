import { PublicKey, SystemProgram } from "@solana/web3.js";
import type { Intent } from "../core/types.js";

export function isTransferSolIntent(intent: Intent): intent is Intent & { type: "transfer_sol" } {
  return intent.type === "transfer_sol";
}

export function buildTransferSolInstruction(fromPubkey: PublicKey, intent: Intent & { type: "transfer_sol" }) {
  return SystemProgram.transfer({
    fromPubkey,
    toPubkey: new PublicKey(intent.to),
    lamports: intent.amount * 1e9, 
  });
}
