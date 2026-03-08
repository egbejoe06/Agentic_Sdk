import "dotenv/config";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { AgenticWallet } from "../src/index.js";
async function testStaking() {
    console.log("🚀 Initializing Agentic Wallet for Staking Test...");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const wallet = await AgenticWallet.loadFromEnv(connection, "WALLET_SECRET_KEY", { maxTxSol: 0.1 });
    console.log(`✅ Using wallet: ${wallet.getPublicKey()}`);
    const balance = await wallet.getBalance();
    console.log(`💰 Current Balance: ${balance} SOL`);
    if (balance < 0.05) {
        console.log("❌ Balance too low for staking test (need ~0.05 SOL). Fund this address with devnet SOL.");
        return;
    }
    // Test: Stake 0.01 SOL
    console.log("\n[Test] Attempting to stake 0.01 SOL...");
    const result = await wallet.execute({
        type: "stake_sol",
        amount: 0.01
    });
    if (result.success) {
        console.log(`✅ Staking Successful!`);
        console.log(`🔗 Transaction: https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);
    }
    else {
        console.log(`❌ Staking Failed: ${result.error}`);
    }
    const finalBalance = await wallet.getBalance();
    console.log(`\n💰 Final Balance: ${finalBalance} SOL`);
}
testStaking().catch(console.error);
