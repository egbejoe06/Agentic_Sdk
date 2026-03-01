"use strict";
/**
 * AgenticWallet — core wallet: holds connection, keypair, policy; exposes execute(intent).
 * Flow: execute(intent) → PolicyEngine → Sandbox → SecureSigner → broadcast.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenticWallet = void 0;
const web3_js_1 = require("@solana/web3.js");
const PolicyEngine_js_1 = require("./PolicyEngine.js");
const Sandbox_js_1 = require("./Sandbox.js");
const SecureSigner_js_1 = require("./SecureSigner.js");
const transferSol_js_1 = require("../intents/transferSol.js");
class AgenticWallet {
    config;
    policyEngine;
    sandbox;
    signer;
    constructor(config) {
        this.config = config;
        this.policyEngine = new PolicyEngine_js_1.PolicyEngine(config.policy);
        this.sandbox = new Sandbox_js_1.Sandbox(config.connection);
        this.signer = new SecureSigner_js_1.SecureSigner(config.keypair);
    }
    async execute(intent) {
        // 1. Policy Check
        const validation = this.policyEngine.validate(intent);
        if (!validation.allowed) {
            return { success: false, error: validation.reason ?? "Policy rejected" };
        }
        // 2. Build Transaction
        let transaction;
        try {
            transaction = await this.buildTransaction(intent);
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
            const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.config.connection, transaction, [this.config.keypair]);
            return { success: true, signature };
        }
        catch (err) {
            return { success: false, error: `Broadcast failed: ${err.message}` };
        }
    }
    async buildTransaction(intent) {
        const transaction = new web3_js_1.Transaction();
        if ((0, transferSol_js_1.isTransferSolIntent)(intent)) {
            transaction.add((0, transferSol_js_1.buildTransferSolInstruction)(this.config.keypair.publicKey, intent));
        }
        else {
            throw new Error(`Intent type "${intent.type}" not yet supported in this version.`);
        }
        const { blockhash } = await this.config.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = this.config.keypair.publicKey;
        return transaction;
    }
    async getBalance() {
        const balance = await this.config.connection.getBalance(this.config.keypair.publicKey);
        return balance / 1e9;
    }
    getPublicKey() {
        return this.config.keypair.publicKey.toBase58();
    }
}
exports.AgenticWallet = AgenticWallet;
