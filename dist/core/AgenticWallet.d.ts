/**
 * AgenticWallet — core wallet: holds connection, keypair, policy; exposes execute(intent).
 * Flow: execute(intent) → PolicyEngine → Sandbox → SecureSigner → broadcast.
 */
import type { AgenticWalletConfig, ExecuteResult, Intent } from "./types.js";
export declare class AgenticWallet {
    private readonly config;
    private readonly policyEngine;
    private readonly sandbox;
    private readonly signer;
    constructor(config: AgenticWalletConfig);
    execute(intent: Intent): Promise<ExecuteResult>;
    private buildTransaction;
    getBalance(): Promise<number>;
    getPublicKey(): string;
}
//# sourceMappingURL=AgenticWallet.d.ts.map