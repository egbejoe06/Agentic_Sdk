import type { Keypair, Transaction } from "@solana/web3.js";
export declare class SecureSigner {
    private readonly keypair;
    constructor(keypair: Keypair);
    sign(transaction: Transaction): void;
}
//# sourceMappingURL=SecureSigner.d.ts.map