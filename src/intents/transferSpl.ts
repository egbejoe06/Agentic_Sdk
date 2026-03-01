/**
 * Intent: transfer SPL tokens to a recipient.
 * Used by wallet.execute({ type: "transfer_spl", mint, to, amount }).
 */

import { PublicKey } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import type { Intent } from "../core/types.js";

export function isTransferSplIntent(intent: Intent): intent is Intent & { type: "transfer_spl" } {
  return intent.type === "transfer_spl";
}

/** Build an SPL token transfer instruction from the intent. Amount is in token base units (smallest decimals). */
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
