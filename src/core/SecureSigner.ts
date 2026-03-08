
import type { Keypair, Transaction } from "@solana/web3.js";

export class SecureSigner {
  constructor(private readonly keypair: Keypair) {}
  sign(transaction: Transaction): void {
    transaction.partialSign(this.keypair);
  }
}
