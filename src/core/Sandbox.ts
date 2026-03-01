/**
 * Sandbox — dry-run simulation before signing.
 * Flow: build transaction → simulateTransaction → reject on error, else continue.
 */

import type { Connection, Transaction } from "@solana/web3.js";

export class Sandbox {
  constructor(private readonly connection: Connection) {}

  /** Simulate the transaction. Reject if simulation fails. */
  async simulate(transaction: Transaction): Promise<{ ok: boolean; error?: string }> {
    try {
      const { value } = await this.connection.simulateTransaction(transaction);
      if (value.err) {
        return { ok: false, error: JSON.stringify(value.err) };
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message ?? "Simulation failed" };
    }
  }
}
