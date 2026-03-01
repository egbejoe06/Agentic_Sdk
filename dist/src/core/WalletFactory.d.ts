import { Connection, Keypair } from "@solana/web3.js";
import { AgenticWallet } from "./AgenticWallet.js";
import type { WalletPolicy } from "./types.js";
export interface CreateWalletOptions {
    connection: Connection;
    policy?: WalletPolicy;
    keypair?: Keypair;
}
/**
 * Programmatic wallet creation utility (Feature 1).
 * Creates a new AgenticWallet. Fund the wallet with devnet SOL before use.
 */
export declare function createAgenticWallet(options: CreateWalletOptions): Promise<AgenticWallet>;
//# sourceMappingURL=WalletFactory.d.ts.map