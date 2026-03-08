/**
 * AgenticWallet — core wallet: holds connection, keypair, policy; exposes execute(intent).
 * Flow: execute(intent) → PolicyEngine → Sandbox → SecureSigner → broadcast.
 */
import { Connection } from "@solana/web3.js";
import type { AgenticWalletConfig, ExecuteResult, Intent, WalletPolicy } from "./types.js";
export declare class AgenticWallet {
    private readonly config;
    private readonly policyEngine;
    private readonly sandbox;
    private readonly signer;
    constructor(config: AgenticWalletConfig);
    static loadFromPrivateKey(connection: Connection, privateKey: string | number[], policy?: WalletPolicy): Promise<AgenticWallet>;
    static loadFromEnv(connection: Connection, envVarName?: string, policy?: WalletPolicy): Promise<AgenticWallet>;
    execute(intent: Intent): Promise<ExecuteResult>;
    private buildTransaction;
    getBalance(): Promise<number>;
    getTokenBalance(mintAddress: string): Promise<number>;
    getTokenBalanceNative(mintAddress: string): Promise<string>;
    getPublicKey(): string;
}
//# sourceMappingURL=AgenticWallet.d.ts.map