/**
 * AgenticWallet — core wallet: holds connection, keypair, policy; exposes execute(intent).
 * Flow: execute(intent) → PolicyEngine → Sandbox → SecureSigner → broadcast.
 */

import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import type { AgenticWalletConfig, ExecuteResult, Intent, WalletPolicy } from "./types.js";
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
  private readonly policyEngine: PolicyEngine;
  private readonly sandbox: Sandbox;
  private readonly signer: SecureSigner;

  constructor(private readonly config: AgenticWalletConfig) {
    this.policyEngine = new PolicyEngine(config.policy);
    this.sandbox = new Sandbox(config.connection);
    this.signer = new SecureSigner(config.keypair);
  }

  static async loadFromPrivateKey(
    connection: Connection,
    privateKey: string | number[],
    policy?: WalletPolicy
  ): Promise<AgenticWallet> {
    const keypair = loadKeypairFromPrivateKey(privateKey);
    return new AgenticWallet({ connection, keypair, policy: policy ?? { maxTxSol: 1 } });
  }

  static async loadFromEnv(
    connection: Connection,
    envVarName?: string,
    policy?: WalletPolicy
  ): Promise<AgenticWallet> {
    const keypair = loadKeypairFromEnv(envVarName);
    if (!keypair) {
      throw new Error(`Failed to load keypair from environment variable: ${envVarName ?? "WALLET_SECRET_KEY"}`);
    }
    return new AgenticWallet({ connection, keypair, policy: policy ?? { maxTxSol: 1 } });
  }

  async execute(intent: Intent): Promise<ExecuteResult> {
    const validation = this.policyEngine.validate(intent);
    if (!validation.allowed) {
      return { success: false, error: validation.reason ?? "Policy rejected" };
    }

    let transaction: Transaction;
    let lastValidBlockHeight: number;
    try {
      const built = await this.buildTransaction(intent);
      transaction = built.transaction;
      lastValidBlockHeight = built.lastValidBlockHeight;
    } catch (err: any) {
      return { success: false, error: `Failed to build transaction: ${err.message}` };
    }

    const sim = await this.sandbox.simulate(transaction);
    if (!sim.ok) {
      return { success: false, error: sim.error ?? "Simulation failed" };
    }

    try {
      this.signer.sign(transaction);
    } catch (err: any) {
      return { success: false, error: `Signing failed: ${err.message}` };
    }
    try {
      const signature = await this.config.connection.sendRawTransaction(
        transaction.serialize()
      );

      await this.config.connection.confirmTransaction({
        signature,
        blockhash: transaction.recentBlockhash!,
        lastValidBlockHeight,
      }, "confirmed");

      return { success: true, signature };
    } catch (err: any) {
      return { success: false, error: `Broadcast failed: ${err.message}` };
    }
  }

  private async buildTransaction(intent: Intent): Promise<{ transaction: Transaction; lastValidBlockHeight: number }> {
    const transaction = new Transaction();

    if (isTransferSolIntent(intent)) {
      transaction.add(buildTransferSolInstruction(this.config.keypair.publicKey, intent));
    } else if (isTransferSplIntent(intent)) {
      const mint = new PublicKey(intent.mint);
      const toPubkey = new PublicKey(intent.to);
      transaction.add(
        createAssociatedTokenAccountIdempotentInstructionWithDerivation(
          this.config.keypair.publicKey,
          toPubkey,
          mint
        )
      );
      transaction.add(buildTransferSplInstruction(this.config.keypair.publicKey, intent));
    } else if (isStakeSolIntent(intent)) {
      const ixs = await buildStakeSolInstructions(this.config.keypair.publicKey, intent, this.config.connection);
      transaction.add(...ixs);
    } else if (isUnstakeSolIntent(intent)) {
      const ixs = buildUnstakeSolInstructions(this.config.keypair.publicKey, intent);
      transaction.add(...ixs);
    } else if (isWithdrawStakeSolIntent(intent)) {
      const ixs = buildWithdrawStakeSolInstructions(this.config.keypair.publicKey, intent);
      transaction.add(...ixs);
    } else if (isWhirlpoolSwapIntent(intent)) {
      const ixs = await buildWhirlpoolSwapInstructions(
        this.config.connection,
        this.config.keypair,
        intent
      );
      transaction.add(...ixs);
    } else if (isWhirlpoolAddLiquidityIntent(intent)) {
      const ixs = await buildWhirlpoolAddLiquidityInstructions(
        this.config.connection,
        this.config.keypair,
        intent
      );
      transaction.add(...ixs);
    } else if (isWhirlpoolHarvestIntent(intent)) {
      const ixs = await buildWhirlpoolHarvestInstructions(
        this.config.connection,
        this.config.keypair,
        intent
      );
      transaction.add(...ixs);
    } else if (isInteractProgramIntent(intent)) {
      transaction.add(buildInteractProgramInstruction(intent));
    } else {
      const _exhaustiveCheck: never = intent;
      throw new Error(`Intent type "${(intent as any).type}" not yet supported in this version.`);
    }

    const { blockhash, lastValidBlockHeight } = await this.config.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.config.keypair.publicKey;

    return { transaction, lastValidBlockHeight };
  }

  async getBalance(): Promise<number> {
    const balance = await this.config.connection.getBalance(
      this.config.keypair.publicKey
    );
    return balance / 1e9;
  }

  async getTokenBalance(mintAddress: string): Promise<number> {
    const mint = new PublicKey(mintAddress);
    const ata = await getAssociatedTokenAddress(
      mint,
      this.config.keypair.publicKey
    );
    try {
      const balanceInfo = await this.config.connection.getTokenAccountBalance(ata);
      return balanceInfo.value.uiAmount ?? 0;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("could not find account")) {
        return 0;
      }
      throw new Error(`Failed to fetch token balance: ${msg}`);
    }
  }

  async getTokenBalanceNative(mintAddress: string): Promise<string> {
    const mint = new PublicKey(mintAddress);
    const ata = await getAssociatedTokenAddress(
      mint,
      this.config.keypair.publicKey
    );
    try {
      const balanceInfo = await this.config.connection.getTokenAccountBalance(ata);
      return balanceInfo.value.amount;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("could not find account")) {
        return "0";
      }
      throw new Error(`Failed to fetch token balance: ${msg}`);
    }
  }

  getPublicKey(): string {
    return this.config.keypair.publicKey.toBase58();
  }
}
