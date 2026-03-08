import type { Intent, WalletPolicy } from "./types.js";
export declare class PolicyEngine {
    private readonly policy;
    constructor(policy: WalletPolicy);
    validate(intent: Intent): {
        allowed: boolean;
        reason?: string;
    };
}
//# sourceMappingURL=PolicyEngine.d.ts.map