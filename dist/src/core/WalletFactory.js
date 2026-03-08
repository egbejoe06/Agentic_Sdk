import { Keypair } from "@solana/web3.js";
import { AgenticWallet } from "./AgenticWallet.js";
export async function createAgenticWallet(options) {
    const keypair = options.keypair ?? Keypair.generate();
    const policy = options.policy ?? { maxTxSol: 1 }; // Default safe policy
    return new AgenticWallet({
        connection: options.connection,
        keypair,
        policy,
    });
}
