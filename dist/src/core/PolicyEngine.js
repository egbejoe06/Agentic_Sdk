export class PolicyEngine {
    policy;
    constructor(policy) {
        this.policy = policy;
    }
    validate(intent) {
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
