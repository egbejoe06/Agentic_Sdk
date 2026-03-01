import "dotenv/config";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { AgenticWallet, createAgenticWallet, loadKeypairFromEnv } from "../src/index.js";
import { createLangChainAgent } from "../src/agent/LangChainAgent.js";
import { HumanMessage } from "@langchain/core/messages";

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in environment.");
    console.log("Please run: $env:GOOGLE_GENERATIVE_AI_API_KEY='your-key'; node dist/demo/agentDemo.js");
    return;
  }

  console.log("🚀 Initializing Agentic Wallet + AI Agent...");
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
  // 1. Load existing keypair from env, or generate a new one
  const keypair = loadKeypairFromEnv();
  const wallet = await createAgenticWallet({
    connection,
    keypair: keypair ?? undefined,
    policy: { maxTxSol: 0.1 }
  });

  if (keypair) {
    console.log(`🔑 Using existing wallet from WALLET_SECRET_KEY`);
  } else {
    console.log(`🔑 No WALLET_SECRET_KEY found — generating new wallet`);
  }

  // 2. Create Agent
  const agent = await createLangChainAgent(wallet);

  console.log(`✅ Agent ready for wallet: ${wallet.getPublicKey()}`);

  // 3. Ask Agent a question
  const userInput = "What is my current balance?";
  console.log(`\n👤 User: ${userInput}`);

  try {
    const result = await agent.invoke({
      messages: [new HumanMessage(userInput)]
    });

    const lastMessage = result.messages[result.messages.length - 1];
    console.log(`\n🤖 Agent: ${lastMessage.content}`);
    
    // Example 2: Requesting a transfer
    const userInput2 = "Send 0.001 SOL to 43B7f8Y1vY5v6v7v8v9v0v1v2v3v4v5v6v7v8v9v0v"; // Invalid addr but just to see logic
    console.log(`\n👤 User: ${userInput2}`);
    
    const result2 = await agent.invoke({
      messages: [new HumanMessage(userInput2)]
    });
    
    const lastMessage2 = result2.messages[result2.messages.length - 1];
    console.log(`\n🤖 Agent: ${lastMessage2.content}`);

  } catch (err: any) {
    console.error(`❌ Agent Error: ${err.message}`);
  }
}

main().catch(console.error);
