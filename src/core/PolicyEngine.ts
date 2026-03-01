import type { Intent, WalletPolicy } from "./types.js";

export class PolicyEngine {
  constructor(private readonly policy: WalletPolicy) {}

  validate(intent: Intent): { allowed: boolean; reason?: string } {
    if (intent.type === "transfer_sol") {
      if (this.policy.maxTxSol !== undefined && intent.amount > this.policy.maxTxSol) {
        return {
          allowed: false,
          reason: `Transfer amount ${intent.amount} SOL exceeds maximum allowed per transaction (${this.policy.maxTxSol} SOL)`,
        };
      }
    }

    return { allowed: true };
  }
}
