import { Connection, Keypair } from "@solana/web3.js";
import { AgenticWallet } from "./AgenticWallet.js";
import type { WalletPolicy } from "./types.js";

export interface CreateWalletOptions {
  connection: Connection;
  policy?: WalletPolicy;
  keypair?: Keypair;
}

export async function createAgenticWallet(options: CreateWalletOptions): Promise<AgenticWallet> {
  const keypair = options.keypair ?? Keypair.generate();
  const policy = options.policy ?? { maxTxSol: 1 }; // Default safe policy

  return new AgenticWallet({
    connection: options.connection,
    keypair,
    policy,
  });
}
