/**
 * SecureSigner — signs only after policy approval; never exposes private key.
 * Rule: private key never leaves this module. Only signs fully validated txs.
 */
import type { Keypair, Transaction } from "@solana/web3.js";
export declare class SecureSigner {
    private readonly keypair;
    constructor(keypair: Keypair);
    /** Sign the transaction. Call only after PolicyEngine + Sandbox approval. */
    sign(transaction: Transaction): void;
}
//# sourceMappingURL=SecureSigner.d.ts.map