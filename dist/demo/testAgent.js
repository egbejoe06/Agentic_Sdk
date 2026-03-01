import "dotenv/config";
import * as readline from "readline";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createAgenticWallet, loadKeypairFromEnv } from "../src/index.js";
import { createLangChainAgent } from "../src/agent/LangChainAgent.js";
import { HumanMessage } from "@langchain/core/messages";
function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
async function runAgentDemo() {
    console.log("🤖 Initializing Agentic Wallet & LangChain Agent...");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const useExisting = process.env.USE_EXISTING_WALLET?.trim() === "1";
    const keypair = useExisting ? loadKeypairFromEnv() : undefined;
    const wallet = await createAgenticWallet({
        connection,
        keypair: keypair ?? undefined,
        policy: { maxTxSol: 0.5 }
    });
    console.log(`✅ Wallet: ${wallet.getPublicKey()}`);
    const balance = await wallet.getBalance();
    console.log(`💰 Balance: ${balance} SOL`);
    if (balance < 0.01) {
        console.log("❌ Balance too low for test. Fund this address with devnet SOL.");
        return;
    }
    const agent = await createLangChainAgent(wallet);
    console.log("\n--- Type your message to the agent (or 'quit' to exit) ---\n");
    const messages = [];
    while (true) {
        const userInput = await ask("You: ");
        if (!userInput)
            continue;
        if (userInput.toLowerCase() === "quit") {
            console.log("Bye.");
            break;
        }
        messages.push(new HumanMessage(userInput));
        const res = await agent.invoke({
            messages: messages
        });
        messages.length = 0; // Clear and replace with full history returned by agent if it returns full state
        messages.push(...res.messages);
        for (const msg of res.messages) {
            if (msg.additional_kwargs?.tool_calls) {
                console.log("🛠️  Agent proposed action:", JSON.stringify(msg.additional_kwargs.tool_calls, null, 2));
            }
        }
        const finalResponse = res.messages[res.messages.length - 1].content;
        console.log("Agent:", finalResponse);
        console.log("");
    }
}
runAgentDemo().catch(console.error);
