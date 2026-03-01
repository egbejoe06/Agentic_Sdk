"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgenticWallet = createAgenticWallet;
const web3_js_1 = require("@solana/web3.js");
const AgenticWallet_js_1 = require("./AgenticWallet.js");
/**
 * Programmatic wallet creation utility (Feature 1).
 * Creates a new AgenticWallet, optionally airdropping devnet SOL.
 */
async function createAgenticWallet(options) {
    const keypair = options.keypair ?? web3_js_1.Keypair.generate();
    const policy = options.policy ?? { maxTxSol: 1 }; // Default safe policy
    if (options.airdropAmount && options.airdropAmount > 0) {
        try {
            const signature = await options.connection.requestAirdrop(keypair.publicKey, options.airdropAmount * web3_js_1.LAMPORTS_PER_SOL);
            const { blockhash, lastValidBlockHeight } = await options.connection.getLatestBlockhash();
            await options.connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            });
        }
        catch (err) {
            console.warn(`Airdrop failed (might be rate-limited): ${err.message}`);
        }
    }
    return new AgenticWallet_js_1.AgenticWallet({
        connection: options.connection,
        keypair,
        policy,
    });
}
