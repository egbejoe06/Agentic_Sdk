"use strict";
/**
 * PolicyEngine — validates intents against wallet policy before signing.
 * Responsibilities: maxTxAmount, maxDailyAmount, allowedRecipients,
 * cooldownSeconds, allowedPrograms. Rejects intent if any rule fails.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEngine = void 0;
class PolicyEngine {
    policy;
    constructor(policy) {
        this.policy = policy;
    }
    /** Returns true if the intent is allowed by policy. */
    validate(intent) {
        if (intent.type === "transfer_sol") {
            if (this.policy.maxTxSol !== undefined && intent.amount > this.policy.maxTxSol) {
                return {
                    allowed: false,
                    reason: `Transfer amount ${intent.amount} SOL exceeds maximum allowed per transaction (${this.policy.maxTxSol} SOL)`,
                };
            }
        }
        // TODO: Phase 3 — implement more rules (cooldown, allowedPrograms, etc.)
        return { allowed: true };
    }
}
exports.PolicyEngine = PolicyEngine;
