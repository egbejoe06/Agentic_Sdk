"use strict";
/**
 * Multi-agent demo: 2 independent AgenticWallets, each with its own policy,
 * LangChain agents autonomously execute transfer_sol / transfer_spl intents.
 * Every action: PolicyEngine → Sandbox → SecureSigner. Devnet only.
 *
 * TODO: Phase 4+ — wire up createLangChainAgent, run loop, log balances + Explorer links.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// import { AgenticWallet } from "../src/core/AgenticWallet.js";
// import { Connection, Keypair } from "@solana/web3.js";
async function main() {
    console.log("Multi-agent demo — not yet implemented. Run after Phase 3/4.");
}
main().catch(console.error);
