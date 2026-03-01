"use strict";
/**
 * Sandbox — dry-run simulation before signing.
 * Flow: build transaction → simulateTransaction → reject on error, else continue.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sandbox = void 0;
class Sandbox {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    /** Simulate the transaction. Reject if simulation fails. */
    async simulate(transaction) {
        try {
            const { value } = await this.connection.simulateTransaction(transaction);
            if (value.err) {
                return { ok: false, error: JSON.stringify(value.err) };
            }
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: err.message ?? "Simulation failed" };
        }
    }
}
exports.Sandbox = Sandbox;
