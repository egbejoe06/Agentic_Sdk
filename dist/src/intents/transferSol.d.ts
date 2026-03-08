import { PublicKey } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
export declare function isTransferSolIntent(intent: Intent): intent is Intent & {
    type: "transfer_sol";
};
export declare function buildTransferSolInstruction(fromPubkey: PublicKey, intent: Intent & {
    type: "transfer_sol";
}): import("@solana/web3.js").TransactionInstruction;
//# sourceMappingURL=transferSol.d.ts.map