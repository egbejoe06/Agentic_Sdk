/**
 * Raydium swap demo on devnet.
 *
 * 1. Checks balance (always).
 * 2. If RAYDIUM_POOL_ID + RAYDIUM_OUTPUT_MINT are set: runs a programmatic swap
 *    (0.01 SOL → output token), then asks the agent to do the same via natural language.
 * 3. If not set: prints instructions to create a pool and set env vars.
 *
 * Prereqs:
 *   - WALLET_SECRET_KEY in .env (funded on devnet)
 *   - GOOGLE_GENERATIVE_AI_API_KEY for the agent path
 *   - Optional: RAYDIUM_POOL_ID + RAYDIUM_OUTPUT_MINT for real swaps
 *
 * Run: npm run build && node dist/demo/raydiumDemo.js
 */
import "dotenv/config";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createAgenticWallet, loadKeypairFromEnv, } from "../src/index.js";
import { createLangChainAgent } from "../src/agent/LangChainAgent.js";
import { HumanMessage } from "@langchain/core/messages";
import { NATIVE_MINT_STR } from "../src/core/constants.js";
const SOL_MINT = NATIVE_MINT_STR;
async function main() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is not set.");
        console.log("  Set it in .env or: $env:GOOGLE_GENERATIVE_AI_API_KEY='your-key'");
        process.exit(1);
    }
    const keypair = loadKeypairFromEnv();
    if (!keypair) {
        console.error("❌ WALLET_SECRET_KEY not set. Run generateKeypair and add to .env.");
        process.exit(1);
    }
    const rpcUrl = process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet");
    const connection = new Connection(rpcUrl, "confirmed");
    console.log("🚀 Raydium Swap Demo (devnet)");
    console.log("   Wallet:", keypair.publicKey.toBase58());
    console.log("   RPC:", rpcUrl);
    const wallet = await createAgenticWallet({
        connection,
        keypair,
        policy: { maxTxSol: 0.1 },
    });
    const agent = await createLangChainAgent(wallet);
    console.log("   Agent: ready\n");
    // ─── 1. Balance via agent ─────────────────────────────────────────────────
    console.log("--- 1. Balance ---");
    const balanceResult = await agent.invoke({
        messages: [new HumanMessage("What is my current SOL balance?")],
    });
    const balanceMsg = balanceResult.messages[balanceResult.messages.length - 1];
    console.log("👤 User: What is my current SOL balance?");
    console.log("🤖 Agent:", typeof balanceMsg.content === "string" ? balanceMsg.content : "(tool response)\n");
    const poolId = process.env.RAYDIUM_POOL_ID;
    const outputMint = process.env.RAYDIUM_OUTPUT_MINT;
    if (!poolId || !outputMint) {
        console.log("--- Swap skipped (no pool config) ---");
        console.log("To run a real swap on devnet:");
        console.log("  1. Create a token: node dist/demo/createDevnetMint.js");
        console.log("  2. Create a Raydium CPMM pool (SOL / your mint) and note the pool ID.");
        console.log("  3. Set in .env:");
        console.log("     RAYDIUM_POOL_ID=<your-pool-id>");
        console.log("     RAYDIUM_OUTPUT_MINT=<output-token-mint>");
        console.log("  4. Run this demo again.");
        return;
    }
    // ─── 2. Programmatic swap (no LLM) ──────────────────────────────────────────
    console.log("--- 2. Programmatic swap (0.01 SOL → output token) ---");
    const swapIntent = {
        type: "swap_raydium",
        inputMint: SOL_MINT,
        outputMint,
        amount: 0.01,
        slippageBps: 100,
        poolId,
    };
    try {
        const result = await wallet.execute(swapIntent);
        if (result.success) {
            console.log("✅ Swap succeeded. Signature:", result.signature ?? "n/a");
        }
        else {
            console.log("❌ Swap failed:", result.error);
        }
    }
    catch (err) {
        console.log("❌ Swap error:", err instanceof Error ? err.message : err);
    }
    // ─── 3. Agent-driven swap (natural language) ───────────────────────────────
    console.log("\n--- 3. Agent swap (natural language) ---");
    const prompt = `Swap 0.005 SOL for the token with mint ${outputMint} on Raydium. Use pool id ${poolId}. Use 1% slippage.`;
    console.log("👤 User:", prompt);
    try {
        const agentResult = await agent.invoke({
            messages: [new HumanMessage(prompt)],
        });
        const last = agentResult.messages[agentResult.messages.length - 1];
        const content = last.content;
        console.log("🤖 Agent:", typeof content === "string" ? content : JSON.stringify(content));
    }
    catch (err) {
        console.log("❌ Agent error:", err instanceof Error ? err.message : err);
    }
    console.log("\n✅ Demo finished.");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
