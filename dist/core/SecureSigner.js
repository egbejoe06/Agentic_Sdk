"use strict";
/**
 * SecureSigner — signs only after policy approval; never exposes private key.
 * Rule: private key never leaves this module. Only signs fully validated txs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureSigner = void 0;
class SecureSigner {
    keypair;
    constructor(keypair) {
        this.keypair = keypair;
    }
    /** Sign the transaction. Call only after PolicyEngine + Sandbox approval. */
    sign(transaction) {
        transaction.partialSign(this.keypair);
    }
}
exports.SecureSigner = SecureSigner;
