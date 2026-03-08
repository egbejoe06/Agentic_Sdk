import { PublicKey } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
export declare function isTransferSplIntent(intent: Intent): intent is Intent & {
    type: "transfer_spl";
};
export declare function buildTransferSplInstruction(fromPubkey: PublicKey, intent: Intent & {
    type: "transfer_spl";
}): import("@solana/web3.js").TransactionInstruction;
//# sourceMappingURL=transferSpl.d.ts.map