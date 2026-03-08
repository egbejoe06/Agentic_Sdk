import { PublicKey } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddressSync, } from "@solana/spl-token";
export function isTransferSplIntent(intent) {
    return intent.type === "transfer_spl";
}
export function buildTransferSplInstruction(fromPubkey, intent) {
    const mint = new PublicKey(intent.mint);
    const source = getAssociatedTokenAddressSync(mint, fromPubkey);
    const destination = getAssociatedTokenAddressSync(mint, new PublicKey(intent.to));
    return createTransferInstruction(source, destination, fromPubkey, intent.amount);
}
