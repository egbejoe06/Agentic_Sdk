import { PublicKey } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import type { Intent } from "../core/types.js";

export function isTransferSplIntent(intent: Intent): intent is Intent & { type: "transfer_spl" } {
  return intent.type === "transfer_spl";
}

export function buildTransferSplInstruction(
  fromPubkey: PublicKey,
  intent: Intent & { type: "transfer_spl" }
) {
  const mint = new PublicKey(intent.mint);
  const source = getAssociatedTokenAddressSync(mint, fromPubkey);
  const destination = getAssociatedTokenAddressSync(mint, new PublicKey(intent.to));
  return createTransferInstruction(
    source,
    destination,
    fromPubkey,
    intent.amount
  );
}
