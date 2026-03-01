import "dotenv/config";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createAgenticWallet, loadKeypairFromEnv } from "../src/index.js";
/**
 * Two-agent demo: A swaps SOL → USDC, sends USDC to B; B adds liquidity to earn rewards.
 *
 * Prerequisites:
 * - WALLET_SECRET_KEY in .env (Wallet A) — funded with devnet SOL
 * - WALLET_SECRET_KEY_B in .env (Wallet B) — can be 0 balance; A will send SOL + USDC
 *
 * Flow:
 * 1. A sends a small amount of SOL to B (so B can pay fees and provide SOL side of the pool).
 * 2. A swaps SOL → USDC on Orca Whirlpool, then sends the USDC to B.
 * 3. B adds liquidity (SOL + USDC) to the same pool in full-range mode to earn rewards.
 */
const DEVNET_POOL_SOL_USDC = "3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt";
const MINT_SOL = "So11111111111111111111111111111111111111112";
const DEV_USDC_MINT = "BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k";
const SOL_DECIMALS = 9;
const USDC_DECIMALS = 6;
async function main() {
    console.log("🔄 Two-Agent Demo: A (swap + send USDC) → B (add liquidity)\n");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const keypairA = loadKeypairFromEnv("WALLET_SECRET_KEY");
    if (!keypairA) {
        console.error("❌ Set WALLET_SECRET_KEY in .env (Wallet A).");
        process.exit(1);
    }
    const keypairB = loadKeypairFromEnv("WALLET_SECRET_KEY_B");
    if (!keypairB) {
        console.error("❌ Set WALLET_SECRET_KEY_B in .env (Wallet B).");
        process.exit(1);
    }
    const walletA = await createAgenticWallet({
        connection,
        keypair: keypairA,
        policy: { maxTxSol: 0.5 },
    });
    const walletB = await createAgenticWallet({
        connection,
        keypair: keypairB,
        policy: { maxTxSol: 0.5 },
    });
    const pubkeyA = walletA.getPublicKey();
    const pubkeyB = walletB.getPublicKey();
    const balanceA = await walletA.getBalance();
    const balanceB = await walletB.getBalance();
    console.log(`✅ Wallet A: ${pubkeyA}`);
    console.log(`   SOL: ${balanceA}\n`);
    console.log(`✅ Wallet B: ${pubkeyB}`);
    console.log(`   SOL: ${balanceB}\n`);
    if (balanceA < 0.02) {
        console.error("❌ Wallet A needs at least ~0.02 SOL (swap + send SOL to B + fees).");
        process.exit(1);
    }
    // --- Step 1: A sends SOL to B so B can pay fees and provide SOL for the pool ---
    const solToSendB = 0.04;
    console.log(`--- Step 1: A sends ${solToSendB} SOL to B ---\n`);
    let result = await walletA.execute({
        type: "transfer_sol",
        to: pubkeyB,
        amount: solToSendB,
    });
    if (!result.success) {
        console.error("❌ A → B SOL transfer failed:", result.error);
        process.exit(1);
    }
    console.log("✅ SOL sent. Tx:", result.signature);
    await new Promise((r) => setTimeout(r, 3000));
    // --- Step 2: A swaps SOL → USDC ---
    const swapLamports = 10_000_000; // 0.01 SOL
    console.log("\n--- Step 2: A swaps 0.01 SOL → USDC ---\n");
    result = await walletA.execute({
        type: "whirlpool_swap",
        poolAddress: DEVNET_POOL_SOL_USDC,
        mint: MINT_SOL,
        inputAmount: String(swapLamports),
        slippageToleranceBps: 100,
    });
    if (!result.success) {
        console.error("❌ Swap failed:", result.error);
        process.exit(1);
    }
    console.log("✅ Swap done. Tx:", result.signature);
    await new Promise((r) => setTimeout(r, 3000));
    const usdcBalanceA = await walletA.getTokenBalance(DEV_USDC_MINT);
    const usdcBaseUnits = Math.floor(usdcBalanceA * 10 ** USDC_DECIMALS);
    if (usdcBaseUnits <= 0) {
        console.error("❌ A has no USDC after swap. Check pool/liquidity on devnet.");
        process.exit(1);
    }
    // --- Step 3: A sends USDC to B ---
    console.log("\n--- Step 3: A sends USDC to B ---\n");
    result = await walletA.execute({
        type: "transfer_spl",
        mint: DEV_USDC_MINT,
        to: pubkeyB,
        amount: usdcBaseUnits,
    });
    if (!result.success) {
        console.error("❌ A → B USDC transfer failed:", result.error);
        process.exit(1);
    }
    console.log("✅ USDC sent. Tx:", result.signature);
    await new Promise((r) => setTimeout(r, 3000));
    // --- Step 4: B adds liquidity (SOL + USDC) to the pool ---
    const balanceBSol = await walletB.getBalance();
    const balanceBUsdc = await walletB.getTokenBalance(DEV_USDC_MINT);
    if (balanceBSol < 0.005 || balanceBUsdc <= 0) {
        console.error("❌ B has insufficient SOL or USDC for add liquidity.");
        process.exit(1);
    }
    const solNative = BigInt(Math.floor((balanceBSol * 0.9) * 10 ** SOL_DECIMALS));
    const usdcNative = BigInt(Math.floor(balanceBUsdc * 0.9 * 10 ** USDC_DECIMALS));
    if (solNative <= 0n || usdcNative <= 0n) {
        console.error("❌ Computed amounts too small for add liquidity.");
        process.exit(1);
    }
    console.log("\n--- Step 4: B adds liquidity to pool (full range) ---\n");
    result = await walletB.execute({
        type: "whirlpool_add_liquidity",
        poolAddress: DEVNET_POOL_SOL_USDC,
        tokenAmountA: String(solNative),
        tokenAmountB: String(usdcNative),
        mode: "full_range",
        slippageToleranceBps: 100,
    });
    if (!result.success) {
        console.error("❌ B add liquidity failed:", result.error);
        process.exit(1);
    }
    console.log("✅ Liquidity added. Tx:", result.signature);
    console.log("\n--- Done ---");
    console.log("   A swapped SOL → USDC and sent USDC to B.");
    console.log("   B added SOL + USDC to the pool to earn rewards.");
}
main().catch(console.error);
