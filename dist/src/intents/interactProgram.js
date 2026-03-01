/**
 * Intent: interact with an arbitrary program (CPI, custom instruction).
 * Used by wallet.execute({ type: "interact_program", programId, data }).
 */
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
export function isInteractProgramIntent(intent) {
    return intent.type === "interact_program";
}
export function buildInteractProgramInstruction(intent) {
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
