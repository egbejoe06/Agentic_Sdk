import { Connection, Keypair } from "@solana/web3.js";
import { AgenticWallet } from "./AgenticWallet.js";
import type { WalletPolicy } from "./types.js";
export interface CreateWalletOptions {
    connection: Connection;
    policy?: WalletPolicy;
    keypair?: Keypair;
    airdropAmount?: number;
}
/**
 * Programmatic wallet creation utility (Feature 1).
 * Creates a new AgenticWallet, optionally airdropping devnet SOL.
 */
export declare function createAgenticWallet(options: CreateWalletOptions): Promise<AgenticWallet>;
//# sourceMappingURL=WalletFactory.d.ts.map