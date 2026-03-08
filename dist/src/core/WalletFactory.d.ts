import { Connection, Keypair } from "@solana/web3.js";
import { AgenticWallet } from "./AgenticWallet.js";
import type { WalletPolicy } from "./types.js";
export interface CreateWalletOptions {
    connection: Connection;
    policy?: WalletPolicy;
    keypair?: Keypair;
}
export declare function createAgenticWallet(options: CreateWalletOptions): Promise<AgenticWallet>;
//# sourceMappingURL=WalletFactory.d.ts.map