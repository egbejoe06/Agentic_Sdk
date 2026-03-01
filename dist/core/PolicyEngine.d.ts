/**
 * PolicyEngine — validates intents against wallet policy before signing.
 * Responsibilities: maxTxAmount, maxDailyAmount, allowedRecipients,
 * cooldownSeconds, allowedPrograms. Rejects intent if any rule fails.
 */
import type { Intent, WalletPolicy } from "./types.js";
export declare class PolicyEngine {
    private readonly policy;
    constructor(policy: WalletPolicy);
    /** Returns true if the intent is allowed by policy. */
    validate(intent: Intent): {
        allowed: boolean;
        reason?: string;
    };
}
//# sourceMappingURL=PolicyEngine.d.ts.map