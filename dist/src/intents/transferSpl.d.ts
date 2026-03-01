/**
 * Intent: transfer SPL tokens to a recipient.
 * Used by wallet.execute({ type: "transfer_spl", mint, to, amount }).
 */
import { PublicKey } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
export declare function isTransferSplIntent(intent: Intent): intent is Intent & {
    type: "transfer_spl";
};
/** Build an SPL token transfer instruction from the intent. Amount is in token base units (smallest decimals). */
export declare function buildTransferSplInstruction(fromPubkey: PublicKey, intent: Intent & {
    type: "transfer_spl";
}): import("@solana/web3.js").TransactionInstruction;
//# sourceMappingURL=transferSpl.d.ts.map