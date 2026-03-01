import "dotenv/config";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { AgenticWallet } from "../src/index.js";
async function testStakeLifecycle() {
    console.log("🚀 Initializing Agentic Wallet for Stake Lifecycle Test...");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const wallet = await AgenticWallet.loadFromEnv(connection, "WALLET_SECRET_KEY", {
        maxTxSol: 0.1,
    });
    console.log(`✅ Using wallet: ${wallet.getPublicKey()}`);
    const balance = await wallet.getBalance();
    console.log(`💰 Current Balance: ${balance} SOL`);
    if (balance < 0.05) {
        console.log("❌ Balance too low for staking test (need ~0.05 SOL). Fund this address with devnet SOL.");
        return;
    }
    // 1) Stake 0.01 SOL
    console.log("\n[1] Staking 0.01 SOL...");
    const stakeResult = await wallet.execute({
        type: "stake_sol",
        amount: 0.01,
    });
    if (!stakeResult.success || !stakeResult.signature) {
        console.log(`❌ Staking Failed: ${stakeResult.error}`);
        return;
    }
    console.log(`✅ Staking Successful!`);
    console.log(`🔗 Stake Tx: https://explorer.solana.com/tx/${stakeResult.signature}?cluster=devnet`);
    console.log("\nNOTE: This demo does not automatically derive the new stake account address.\n" +
        "To fully test unstake and withdraw, use a known stake account address created previously.\n");
    // Example-only placeholder for manually provided stake account:
    const exampleStakeAccount = "4GEJKHRrsdFcdmkx6Qb3e6vVdukNeYyvhoWPi1Lpr4PW";
    // 2) Unstake (deactivate) the stake account
    console.log("\n[2] Deactivating stake account...");
    const unstakeResult = await wallet.execute({
        type: "unstake_sol",
        stakeAccount: exampleStakeAccount,
    });
    if (!unstakeResult.success) {
        console.log(`❌ Unstake Failed: ${unstakeResult.error}`);
        return;
    }
    console.log(`✅ Unstake Transaction Submitted!`);
    if (unstakeResult.signature) {
        console.log(`🔗 Unstake Tx: https://explorer.solana.com/tx/${unstakeResult.signature}?cluster=devnet`);
    }
    console.log("\nWait for the deactivation period to complete before attempting withdrawal.\n");
    // 3) Withdraw from the (now inactive) stake account
    console.log("\n[3] Withdrawing 0.01 SOL from stake account...");
    const withdrawResult = await wallet.execute({
        type: "withdraw_stake_sol",
        stakeAccount: exampleStakeAccount,
        amount: 0.01,
    });
    if (!withdrawResult.success) {
        console.log(`❌ Withdraw Failed: ${withdrawResult.error}`);
        return;
    }
    console.log(`✅ Withdraw Transaction Submitted!`);
    if (withdrawResult.signature) {
        console.log(`🔗 Withdraw Tx: https://explorer.solana.com/tx/${withdrawResult.signature}?cluster=devnet`);
    }
    const finalBalance = await wallet.getBalance();
    console.log(`\n💰 Final Balance: ${finalBalance} SOL`);
}
testStakeLifecycle().catch(console.error);
