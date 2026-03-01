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
    /**
     * Load an AgenticWallet from a private key (base58 or number array).
     */
    static loadFromPrivateKey(connection: Connection, privateKey: string | number[], policy?: WalletPolicy): Promise<AgenticWallet>;
    /**
     * Load an AgenticWallet from an environment variable.
     */
    static loadFromEnv(connection: Connection, envVarName?: string, policy?: WalletPolicy): Promise<AgenticWallet>;
    execute(intent: Intent): Promise<ExecuteResult>;
    private buildTransaction;
    getBalance(): Promise<number>;
    /**
     * Gets the balance of a specific SPL token (e.g. devUSDC).
     * Returns the human-readable amount (e.g. 5.5 USDC).
     */
    getTokenBalance(mintAddress: string): Promise<number>;
    getPublicKey(): string;
}
//# sourceMappingURL=AgenticWallet.d.ts.map