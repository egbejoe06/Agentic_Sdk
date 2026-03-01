/**
 * Sandbox — dry-run simulation before signing.
 * Flow: build transaction → simulateTransaction → reject on error, else continue.
 */
import type { Connection, Transaction } from "@solana/web3.js";
export declare class Sandbox {
    private readonly connection;
    constructor(connection: Connection);
    /** Simulate the transaction. Reject if simulation fails. */
    simulate(transaction: Transaction): Promise<{
        ok: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=Sandbox.d.ts.map