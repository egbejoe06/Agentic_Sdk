/**
 * AgenticWallet — core wallet: holds connection, keypair, policy; exposes execute(intent).
 * Flow: execute(intent) → PolicyEngine → Sandbox → SecureSigner → broadcast.
 */
import { PublicKey, Transaction } from "@solana/web3.js";
import { PolicyEngine } from "./PolicyEngine.js";
import { Sandbox } from "./Sandbox.js";
import { SecureSigner } from "./SecureSigner.js";
import { buildTransferSolInstruction, isTransferSolIntent } from "../intents/transferSol.js";
import { buildTransferSplInstruction, isTransferSplIntent } from "../intents/transferSpl.js";
import { buildInteractProgramInstruction, isInteractProgramIntent } from "../intents/interactProgram.js";
import { buildStakeSolInstructions, isStakeSolIntent } from "../intents/stakeSol.js";
import { buildUnstakeSolInstructions, isUnstakeSolIntent } from "../intents/unstakeSol.js";
import { buildWithdrawStakeSolInstructions, isWithdrawStakeSolIntent } from "../intents/withdrawStakeSol.js";
import { buildWhirlpoolSwapInstructions, isWhirlpoolSwapIntent } from "../intents/whirlpoolSwap.js";
import { buildWhirlpoolAddLiquidityInstructions, isWhirlpoolAddLiquidityIntent } from "../intents/whirlpoolAddLiquidity.js";
import { buildWhirlpoolHarvestInstructions, isWhirlpoolHarvestIntent } from "../intents/whirlpoolHarvest.js";
import { createAssociatedTokenAccountIdempotentInstructionWithDerivation, getAssociatedTokenAddress } from "@solana/spl-token";
import { loadKeypairFromPrivateKey, loadKeypairFromEnv } from "../utils/keypair.js";
export class AgenticWallet {
    config;
    policyEngine;
    sandbox;
    signer;
    constructor(config) {
        this.config = config;
        this.policyEngine = new PolicyEngine(config.policy);
        this.sandbox = new Sandbox(config.connection);
        this.signer = new SecureSigner(config.keypair);
    }
    /**
     * Load an AgenticWallet from a private key (base58 or number array).
     */
    static async loadFromPrivateKey(connection, privateKey, policy) {
        const keypair = loadKeypairFromPrivateKey(privateKey);
        return new AgenticWallet({ connection, keypair, policy: policy ?? { maxTxSol: 1 } });
    }
    /**
     * Load an AgenticWallet from an environment variable.
     */
    static async loadFromEnv(connection, envVarName, policy) {
        const keypair = loadKeypairFromEnv(envVarName);
        if (!keypair) {
            throw new Error(`Failed to load keypair from environment variable: ${envVarName ?? "WALLET_SECRET_KEY"}`);
        }
        return new AgenticWallet({ connection, keypair, policy: policy ?? { maxTxSol: 1 } });
    }
    async execute(intent) {
        // 1. Policy Check
        const validation = this.policyEngine.validate(intent);
        if (!validation.allowed) {
            return { success: false, error: validation.reason ?? "Policy rejected" };
        }
        // 2. Build Transaction
        let transaction;
        let lastValidBlockHeight;
        try {
            const built = await this.buildTransaction(intent);
            transaction = built.transaction;
            lastValidBlockHeight = built.lastValidBlockHeight;
        }
        catch (err) {
            return { success: false, error: `Failed to build transaction: ${err.message}` };
        }
        // 3. Sandbox Simulation (Dry Run)
        const sim = await this.sandbox.simulate(transaction);
        if (!sim.ok) {
            return { success: false, error: sim.error ?? "Simulation failed" };
        }
        // 4. Secure Signing
        try {
            this.signer.sign(transaction);
        }
        catch (err) {
            return { success: false, error: `Signing failed: ${err.message}` };
        }
        // 5. Broadcast (Confirm)
        try {
            const signature = await this.config.connection.sendRawTransaction(transaction.serialize());
            await this.config.connection.confirmTransaction({
                signature,
                blockhash: transaction.recentBlockhash,
                lastValidBlockHeight,
            }, "confirmed");
            return { success: true, signature };
        }
        catch (err) {
            return { success: false, error: `Broadcast failed: ${err.message}` };
        }
    }
    async buildTransaction(intent) {
        const transaction = new Transaction();
        if (isTransferSolIntent(intent)) {
            transaction.add(buildTransferSolInstruction(this.config.keypair.publicKey, intent));
        }
        else if (isTransferSplIntent(intent)) {
            const mint = new PublicKey(intent.mint);
            const toPubkey = new PublicKey(intent.to);
            transaction.add(createAssociatedTokenAccountIdempotentInstructionWithDerivation(this.config.keypair.publicKey, toPubkey, mint));
            transaction.add(buildTransferSplInstruction(this.config.keypair.publicKey, intent));
        }
        else if (isStakeSolIntent(intent)) {
            const ixs = await buildStakeSolInstructions(this.config.keypair.publicKey, intent, this.config.connection);
            transaction.add(...ixs);
        }
        else if (isUnstakeSolIntent(intent)) {
            const ixs = buildUnstakeSolInstructions(this.config.keypair.publicKey, intent);
            transaction.add(...ixs);
        }
        else if (isWithdrawStakeSolIntent(intent)) {
            const ixs = buildWithdrawStakeSolInstructions(this.config.keypair.publicKey, intent);
            transaction.add(...ixs);
        }
        else if (isWhirlpoolSwapIntent(intent)) {
            const ixs = await buildWhirlpoolSwapInstructions(this.config.connection, this.config.keypair, intent);
            transaction.add(...ixs);
        }
        else if (isWhirlpoolAddLiquidityIntent(intent)) {
            const ixs = await buildWhirlpoolAddLiquidityInstructions(this.config.connection, this.config.keypair, intent);
            transaction.add(...ixs);
        }
        else if (isWhirlpoolHarvestIntent(intent)) {
            const ixs = await buildWhirlpoolHarvestInstructions(this.config.connection, this.config.keypair, intent);
            transaction.add(...ixs);
        }
        else if (isInteractProgramIntent(intent)) {
            transaction.add(buildInteractProgramInstruction(intent));
        }
        else {
            // Exhaustiveness guard for future intent types
            const _exhaustiveCheck = intent;
            throw new Error(`Intent type "${intent.type}" not yet supported in this version.`);
        }
        const { blockhash, lastValidBlockHeight } = await this.config.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = this.config.keypair.publicKey;
        return { transaction, lastValidBlockHeight };
    }
    async getBalance() {
        const balance = await this.config.connection.getBalance(this.config.keypair.publicKey);
        return balance / 1e9;
    }
    /**
     * Gets the balance of a specific SPL token (e.g. devUSDC).
     * Returns the human-readable amount (e.g. 5.5 USDC).
     */
    async getTokenBalance(mintAddress) {
        const mint = new PublicKey(mintAddress);
        const ata = await getAssociatedTokenAddress(mint, this.config.keypair.publicKey);
        try {
            const balanceInfo = await this.config.connection.getTokenAccountBalance(ata);
            return balanceInfo.value.uiAmount ?? 0;
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            if (msg.includes("could not find account")) {
                return 0;
            }
            throw new Error(`Failed to fetch token balance: ${msg}`);
        }
    }
    getPublicKey() {
        return this.config.keypair.publicKey.toBase58();
    }
}
