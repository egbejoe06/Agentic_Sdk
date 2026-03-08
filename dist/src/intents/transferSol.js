import { PublicKey, SystemProgram } from "@solana/web3.js";
export function isTransferSolIntent(intent) {
    return intent.type === "transfer_sol";
}
export function buildTransferSolInstruction(fromPubkey, intent) {
    return SystemProgram.transfer({
        fromPubkey,
        toPubkey: new PublicKey(intent.to),
        lamports: intent.amount * 1e9,
    });
}
