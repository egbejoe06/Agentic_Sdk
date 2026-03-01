import { Keypair } from "@solana/web3.js";
import { AgenticWallet } from "./AgenticWallet.js";
/**
 * Programmatic wallet creation utility (Feature 1).
 * Creates a new AgenticWallet. Fund the wallet with devnet SOL before use.
 */
export async function createAgenticWallet(options) {
    const keypair = options.keypair ?? Keypair.generate();
    const policy = options.policy ?? { maxTxSol: 1 }; // Default safe policy
    return new AgenticWallet({
        connection: options.connection,
        keypair,
        policy,
    });
}
