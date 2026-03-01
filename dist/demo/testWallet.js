import "dotenv/config";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { AgenticWallet, createAgenticWallet } from "../src/index.js";
async function test() {
    console.log("🚀 Initializing Agentic Wallet on Devnet...");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const useExisting = process.env.USE_EXISTING_WALLET?.trim() === "1";
    let wallet;
    if (useExisting) {
        try {
            wallet = await AgenticWallet.loadFromEnv(connection, "WALLET_SECRET_KEY", { maxTxSol: 0.05 });
            console.log(`✅ Using existing wallet: ${wallet.getPublicKey()}`);
        }
        catch (err) {
            console.error(`❌ USE_EXISTING_WALLET=1 but failed to load: ${err.message}`);
            process.exit(1);
        }
    }
    else {
        wallet = await createAgenticWallet({
            connection,
            policy: { maxTxSol: 0.05 }
        });
        console.log(`✅ Wallet created: ${wallet.getPublicKey()}`);
        console.log("   (Send devnet SOL to this address to run tests)");
    }
    let balance = await wallet.getBalance();
    console.log(`💰 Initial Balance: ${balance} SOL`);
    if (balance < 0.01) {
        console.log("❌ Balance too low for test. Fund this address with devnet SOL.");
        return;
    }
    // Create a random recipient
    const recipient = Keypair.generate().publicKey.toBase58();
    console.log(`➡️  Testing transfer to: ${recipient}`);
    // Test 1: Policy Violation (0.1 SOL > 0.05 SOL limit)
    console.log("\n[Test 1] Attempting transfer exceeding policy limit (0.06 SOL)...");
    const result1 = await wallet.execute({
        type: "transfer_sol",
        to: recipient,
        amount: 0.06
    });
    console.log(`Result: ${result1.success ? "Success (Incorrect!)" : "Failed (Correct!)"}`);
    if (!result1.success)
        console.log(`Reason: ${result1.error}`);
    // Test 2: Valid Transfer (0.01 SOL)
    console.log("\n[Test 2] Attempting valid transfer (0.01 SOL)...");
    const result2 = await wallet.execute({
        type: "transfer_sol",
        to: recipient,
        amount: 0.01
    });
    if (result2.success) {
        console.log(`✅ Transfer Successful!`);
        console.log(`🔗 Transaction: https://explorer.solana.com/tx/${result2.signature}?cluster=devnet`);
    }
    else {
        console.log(`❌ Transfer Failed: ${result2.error}`);
    }
    balance = await wallet.getBalance();
    console.log(`\n💰 Final Balance: ${balance} SOL`);
}
test().catch(console.error);
