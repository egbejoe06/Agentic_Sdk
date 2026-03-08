import "dotenv/config";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { createAgenticWallet, loadKeypairFromEnv } from "../src/index.js";
import { createLangChainAgent } from "../src/agent/LangChainAgent.js";
import { DEV_USDC_MINT } from "../src/constants.js";
import { HumanMessage } from "@langchain/core/messages";
/**
 * Two-agent demo: Wallet A (from WALLET_SECRET_KEY or new) and Wallet B (from WALLET_SECRET_KEY_B or new).
 * Scenario: A swaps SOL → USDC, sends USDC (and some SOL) to B. After that, no need to add to liquidity pool.
 * If Wallet B is new, its keypair is printed for .env (WALLET_SECRET_KEY_B).
 */
const DEVNET_POOL_SOL_USDC = "3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt";
const MINT_SOL = "So11111111111111111111111111111111111111112";
async function main() {
    console.log("🔐 Two-Agent Demo: A (swap + send USDC) → B\n");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // --- Wallet A: from env or new (same pattern as agentDemo / testAgent) ---
    const keypairA = loadKeypairFromEnv("WALLET_SECRET_KEY");
    const walletA = await createAgenticWallet({
        connection,
        keypair: keypairA ?? undefined,
        policy: { maxTxSol: 0.5 },
    });
    if (keypairA) {
        console.log(`✅ Wallet A (from WALLET_SECRET_KEY): ${walletA.getPublicKey()}`);
    }
    else {
        console.log(`✅ Wallet A (new): ${walletA.getPublicKey()}`);
        console.log("   Set WALLET_SECRET_KEY in .env to reuse, and fund this address on devnet.\n");
    }
    const balanceA = await walletA.getBalance();
    console.log(`   Balance: ${balanceA} SOL\n`);
    if (balanceA < 0.02) {
        console.error("❌ Wallet A needs at least ~0.02 SOL on devnet (swap + send to B + fees). Fund it and retry.");
        process.exit(1);
    }
    // --- Wallet B: from WALLET_SECRET_KEY_B or new keypair ---
    let keypairB = loadKeypairFromEnv("WALLET_SECRET_KEY_B");
    if (!keypairB) {
        keypairB = Keypair.generate();
        const pubkeyBNew = keypairB.publicKey.toBase58();
        const secretKeyArray = Array.from(keypairB.secretKey);
        console.log("📋 Wallet B (new) — store this keypair to reuse later:\n");
        console.log(`   Public key: ${pubkeyBNew}`);
        console.log(`   WALLET_SECRET_KEY_B=${JSON.stringify(secretKeyArray)}\n`);
    }
    const walletB = await createAgenticWallet({
        connection,
        keypair: keypairB,
        policy: { maxTxSol: 0.5 },
    });
    const pubkeyB = walletB.getPublicKey();
    const balanceB = await walletB.getBalance();
    console.log(`   Wallet B: ${pubkeyB}, balance: ${balanceB} SOL\n`);
    // --- Create agents ---
    const agentA = await createLangChainAgent(walletA);
    const agentB = await createLangChainAgent(walletB);
    // --- Step 1: Agent A sends SOL to B, swaps SOL → USDC, then sends USDC to B ---
    console.log("--- Step 1: Agent A sends SOL to B, swaps SOL→USDC, sends USDC to B ---\n");
    const promptA = `Wallet B's address is ${pubkeyB}.

Do these in order:
1. Send 0.04 SOL to ${pubkeyB} (use transfer_sol).
2. Swap 0.01 SOL to USDC on Orca Whirlpool: use whirlpool_swap with poolAddress ${DEVNET_POOL_SOL_USDC}, mint ${MINT_SOL}, inputAmount "10000000" (that is 0.01 SOL in lamports).
3. Use get_token_balance with mint ${DEV_USDC_MINT} to see how much USDC you have. Then transfer all that USDC to ${pubkeyB} using transfer_spl with mint ${DEV_USDC_MINT}, to ${pubkeyB}, and amount equal to the native units value returned by get_token_balance.`;
    const resA = await agentA.invoke({
        messages: [new HumanMessage(promptA)],
    });
    let lastContent = resA.messages[resA.messages.length - 1]?.content;
    if (typeof lastContent === "string")
        console.log("Agent A:", lastContent);
    console.log("");
    // Brief wait for devnet confirmation
    await new Promise((r) => setTimeout(r, 4000));
    const balanceBAfter = await walletB.getBalance();
    const usdcBAfter = await walletB.getTokenBalance(DEV_USDC_MINT);
    console.log(`   Wallet B balance after A's actions: ${balanceBAfter} SOL, ${usdcBAfter} USDC\n`);
    if (balanceBAfter < 0.005 || usdcBAfter <= 0) {
        console.error("❌ B has insufficient SOL or USDC. Check Step 1 succeeded.");
        process.exit(1);
    }
    const balanceAFinal = await walletA.getBalance();
    const balanceBFinal = await walletB.getBalance();
    const usdcBFinal = await walletB.getTokenBalance(DEV_USDC_MINT);
    console.log("--- Done ---");
    console.log(`   Wallet A balance: ${balanceAFinal} SOL`);
    console.log(`   Wallet B balance: ${balanceBFinal} SOL, ${usdcBFinal} USDC`);
}
main().catch(console.error);
