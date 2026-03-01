import "dotenv/config";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { createAgenticWallet, loadKeypairFromEnv } from "../src/index.js";
import { createLangChainAgent } from "../src/agent/LangChainAgent.js";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Multi-agent demo: Wallet A (from env) and Wallet B (new keypair).
 * Scenario: B wants to send 0.1 SOL but has no balance → A sends 0.1 SOL to B → B completes the transfer.
 * Wallet B's keypair is printed so you can store it (e.g. in .env as WALLET_SECRET_KEY_B).
 */

async function main() {
  console.log("🔐 Multi-Agent Demo: A (from env) + B (new wallet)\n");

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // --- Wallet A: from environment ---
  const keypairA = loadKeypairFromEnv("WALLET_SECRET_KEY");
  if (!keypairA) {
    console.error("❌ Set WALLET_SECRET_KEY in .env (JSON array of 64 numbers). Wallet A must be funded on devnet.");
    process.exit(1);
  }

  const walletA = await createAgenticWallet({
    connection,
    keypair: keypairA,
    policy: { maxTxSol: 0.5 },
  });

  const balanceA = await walletA.getBalance();
  console.log(`✅ Wallet A: ${walletA.getPublicKey()}`);
  console.log(`   Balance: ${balanceA} SOL\n`);

  if (balanceA < 0.15) {
    console.error("❌ Wallet A needs at least ~0.15 SOL on devnet (0.1 to B + fees). Fund it and retry.");
    process.exit(1);
  }

  // --- Wallet B: new keypair (user stores it) ---
  const keypairB = Keypair.generate();
  const walletB = await createAgenticWallet({
    connection,
    keypair: keypairB,
    policy: { maxTxSol: 0.2 },
  });

  const pubkeyB = walletB.getPublicKey();
  const secretKeyArray = Array.from(keypairB.secretKey);

  console.log("📋 Wallet B (new) — store this keypair to reuse later:\n");
  console.log(`   Public key: ${pubkeyB}`);
  console.log(`   Private key (JSON array for .env):`);
  console.log(`   WALLET_SECRET_KEY_B=${JSON.stringify(secretKeyArray)}\n`);
  console.log("   Add the line above to your .env if you want to reuse Wallet B in another run.\n");

  const balanceB = await walletB.getBalance();
  console.log(`   Balance: ${balanceB} SOL (expected 0 for a new wallet)\n`);

  // Recipient for B's transfer: Wallet A (round-trip demo)
  const recipientAddress = walletA.getPublicKey();

  // --- Create agents ---
  const agentA = await createLangChainAgent(walletA);
  const agentB = await createLangChainAgent(walletB);

  // --- Step 1: B tries to send 0.1 SOL → will discover insufficient balance ---
  console.log("--- Step 1: Agent B tries to send 0.1 SOL (will see insufficient balance) ---\n");

  let resB = await agentB.invoke({
    messages: [
      new HumanMessage(
        `Send 0.1 SOL to ${recipientAddress}. Use get_balance first, then transfer_sol if you have enough.`
      ),
    ],
  });

  let lastContent = resB.messages[resB.messages.length - 1]?.content;
  if (typeof lastContent === "string") console.log("Agent B:", lastContent);
  console.log("");

  // --- Step 2: A sends 0.1 SOL to B ---
  console.log("--- Step 2: Agent A sends 0.1 SOL to Wallet B ---\n");

  const resA = await agentA.invoke({
    messages: [
      new HumanMessage(
        `Send exactly 0.1 SOL to ${pubkeyB} so the other agent (Wallet B) can complete a transaction.`
      ),
    ],
  });

  lastContent = resA.messages[resA.messages.length - 1]?.content;
  if (typeof lastContent === "string") console.log("Agent A:", lastContent);
  console.log("");

  // Brief wait for devnet confirmation
  await new Promise((r) => setTimeout(r, 4000));

  const balanceBAfter = await walletB.getBalance();
  console.log(`   Wallet B balance after A's transfer: ${balanceBAfter} SOL\n`);

  // --- Step 3: B completes the transfer to the recipient ---
  console.log("--- Step 3: Agent B now sends 0.1 SOL to the recipient ---\n");

  resB = await agentB.invoke({
    messages: [
      new HumanMessage(
        `You now have enough SOL. Send 0.1 SOL to ${recipientAddress}. Use transfer_sol.`
      ),
    ],
  });

  lastContent = resB.messages[resB.messages.length - 1]?.content;
  if (typeof lastContent === "string") console.log("Agent B:", lastContent);
  console.log("");

  const balanceBFinal = await walletB.getBalance();
  const balanceAFinal = await walletA.getBalance();
  console.log("--- Done ---");
  console.log(`   Wallet A balance: ${balanceAFinal} SOL`);
  console.log(`   Wallet B balance: ${balanceBFinal} SOL`);
}

main().catch(console.error);
