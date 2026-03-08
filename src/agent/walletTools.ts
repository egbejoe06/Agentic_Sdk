import { tool } from "langchain";
import * as z from "zod";
import type { AgenticWallet } from "../core/AgenticWallet.js";
import type { Intent } from "../core/types.js";

export function createWalletTools(wallet: AgenticWallet) {
  const transferSol = tool(
    async ({ to, amount }) => {
      const intent: Intent = { type: "transfer_sol", to, amount };
      const result = await wallet.execute(intent);
      if (result.success) {
        return result.signature
          ? `Transferred ${amount} SOL to ${to}. Signature: ${result.signature}`
          : `Transfer of ${amount} SOL to ${to} accepted (signature pending).`;
      }
      return `Transfer failed: ${result.error ?? "Unknown error"}`;
    },
    {
      name: "transfer_sol",
      description: "Transfer SOL (native token) to a recipient address.",
      schema: z.object({
        to: z.string().describe("Recipient Solana address (base58)"),
        amount: z.number().describe("Amount of SOL to send"),
      }),
    }
  );

  const transferSpl = tool(
    async ({ mint, to, amount }) => {
      const intent: Intent = { type: "transfer_spl", mint, to, amount };
      const result = await wallet.execute(intent);
      if (result.success) {
        return result.signature
          ? `Transferred ${amount} tokens (mint ${mint}) to ${to}. Signature: ${result.signature}`
          : `Transfer accepted (signature pending).`;
      }
      return `Transfer failed: ${result.error ?? "Unknown error"}`;
    },
    {
      name: "transfer_spl",
      description: "Transfer SPL (token) to a recipient address.",
      schema: z.object({
        mint: z.string().describe("Token mint address (base58)"),
        to: z.string().describe("Recipient Solana address (base58)"),
        amount: z.number().describe("Amount of tokens to send"),
      }),
    }
  );

  const getBalance = tool(
    async () => {
      const balance = await wallet.getBalance();
      const pubkey = wallet.getPublicKey();
      return `Current balance: ${balance} SOL. Wallet address: ${pubkey}`;
    },
    {
      name: "get_balance",
      description: "Get the current SOL balance and wallet public key.",
      schema: z.object({}),
    }
  );

  const getTokenBalance = tool(
    async ({ mint }) => {
      const uiAmount = await wallet.getTokenBalance(mint);
      const nativeAmount = await wallet.getTokenBalanceNative(mint);
      return `Token balance (mint ${mint}): ${uiAmount} (human-readable). Native units for transfer_spl: ${nativeAmount}. Use the native units value as the amount when calling transfer_spl.`;
    },
    {
      name: "get_token_balance",
      description:
        "Get the balance of an SPL token by mint address. Returns both human-readable amount and native (base) units. Use the native units value for transfer_spl amount.",
      schema: z.object({
        mint: z.string().describe("Token mint address (base58)"),
      }),
    }
  );

  const stakeSol = tool(
    async ({ amount, validator }) => {
      const intent: Intent = { type: "stake_sol", amount, validator };
      const result = await wallet.execute(intent);
      if (result.success) {
        return result.signature
          ? `Staked ${amount} SOL. Signature: ${result.signature}`
          : `Staking of ${amount} SOL accepted (signature pending).`;
      }
      return `Staking failed: ${result.error ?? "Unknown error"}`;
    },
    {
      name: "stake_sol",
      description:
        "Stake SOL (native staking). If no validator is provided, the wallet will automatically choose a validator.",
      schema: z.object({
        amount: z.number().describe("Amount of SOL to stake"),
        validator: z
          .string()
          .optional()
          .describe("Optional validator vote account address; if omitted, the wallet will auto-select a validator."),
      }),
    }
  );

  const unstakeSol = tool(
    async ({ stakeAccount }) => {
      const intent: Intent = { type: "unstake_sol", stakeAccount };
      const result = await wallet.execute(intent);
      if (result.success) {
        return result.signature
          ? `Unstake requested for stake account ${stakeAccount}. Signature: ${result.signature}`
          : `Unstake for stake account ${stakeAccount} accepted (signature pending).`;
      }
      return `Unstake failed: ${result.error ?? "Unknown error"}`;
    },
    {
      name: "unstake_sol",
      description: "Deactivate an existing SOL stake account so it can later be withdrawn.",
      schema: z.object({
        stakeAccount: z.string().describe("Stake account address to deactivate (base58)"),
      }),
    }
  );

  const withdrawStakeSol = tool(
    async ({ stakeAccount, amount, to }) => {
      const intent: Intent = { type: "withdraw_stake_sol", stakeAccount, amount, to };
      const result = await wallet.execute(intent);
      if (result.success) {
        return result.signature
          ? `Withdrew ${amount} SOL from stake account ${stakeAccount}${to ? ` to ${to}` : ""}. Signature: ${result.signature}`
          : `Withdrawal of ${amount} SOL from stake account ${stakeAccount} accepted (signature pending).`;
      }
      return `Withdrawal failed: ${result.error ?? "Unknown error"}`;
    },
    {
      name: "withdraw_stake_sol",
      description: "Withdraw SOL from an inactive/unlocked stake account.",
      schema: z.object({
        stakeAccount: z.string().describe("Stake account address to withdraw from (base58)"),
        amount: z.number().describe("Amount of SOL to withdraw"),
        to: z.string().optional().describe("Optional recipient address; defaults to wallet's main address"),
      }),
    }
  );

  const whirlpoolSwap = tool(
    async ({ poolAddress, mint, inputAmount, outputAmount, slippageToleranceBps }) => {
      if (inputAmount == null && outputAmount == null) {
        return "Whirlpool swap requires either inputAmount or outputAmount.";
      }
      const intent: Intent = {
        type: "whirlpool_swap",
        poolAddress,
        mint,
        ...(inputAmount != null && inputAmount !== "" && { inputAmount: String(inputAmount) }),
        ...(outputAmount != null && outputAmount !== "" && { outputAmount: String(outputAmount) }),
        ...(slippageToleranceBps != null && { slippageToleranceBps }),
      };
      const result = await wallet.execute(intent);
      if (result.success) {
        return result.signature
          ? `Whirlpool swap on pool ${poolAddress} completed. Signature: ${result.signature}`
          : `Whirlpool swap accepted (signature pending).`;
      }
      return `Whirlpool swap failed: ${result.error ?? "Unknown error"}`;
    },
    {
      name: "whirlpool_swap",
      description:
        "Swap tokens on Orca Whirlpools (concentrated liquidity AMM). Use devnet pool and mint addresses. Provide either inputAmount (exact-in) or outputAmount (exact-out) in token native units.",
      schema: z.object({
        poolAddress: z.string().describe("Orca Whirlpool address (base58)"),
        mint: z.string().describe("Input or output token mint address (base58)"),
        inputAmount: z
          .string()
          .optional()
          .describe("Exact input amount in token native units (e.g. 1000000 for 1 token with 6 decimals)"),
        outputAmount: z
          .string()
          .optional()
          .describe("Exact output amount in token native units (exact-out swap)"),
        slippageToleranceBps: z
          .number()
          .optional()
          .describe("Slippage tolerance in basis points (default 100 = 1%)"),
      }),
    }
  );

  const whirlpoolAddLiquidity = tool(
    async ({ poolAddress, tokenAmountA, tokenAmountB, slippageToleranceBps, mode, lowerPrice, upperPrice }) => {
      const intent: Intent = {
        type: "whirlpool_add_liquidity",
        poolAddress,
        tokenAmountA: String(tokenAmountA),
        tokenAmountB: String(tokenAmountB),
        mode,
        ...(slippageToleranceBps != null && { slippageToleranceBps }),
        ...(mode === "concentrated" && lowerPrice != null && upperPrice != null && { lowerPrice, upperPrice }),
      };
      const result = await wallet.execute(intent);
      if (result.success) {
        return result.signature
          ? `Added liquidity to pool ${poolAddress} (${mode}). Signature: ${result.signature}`
          : `Add liquidity accepted (signature pending).`;
      }
      return `Whirlpool add liquidity failed: ${result.error ?? "Unknown error"}`;
    },
    {
      name: "whirlpool_add_liquidity",
      description:
        "Add liquidity to an Orca Whirlpool to earn fees. Use full_range for full-range LP or concentrated with lowerPrice/upperPrice. Amounts in token native units.",
      schema: z.object({
        poolAddress: z.string().describe("Orca Whirlpool address (base58)"),
        tokenAmountA: z.union([z.string(), z.number()]).describe("Amount of token A in native units"),
        tokenAmountB: z.union([z.string(), z.number()]).describe("Amount of token B in native units"),
        slippageToleranceBps: z.number().optional().describe("Slippage in basis points (default 100)"),
        mode: z.enum(["full_range", "concentrated"]).describe("full_range or concentrated"),
        lowerPrice: z.number().optional().describe("Lower price bound (concentrated only)"),
        upperPrice: z.number().optional().describe("Upper price bound (concentrated only)"),
      }),
    }
  );

  const whirlpoolHarvest = tool(
    async ({ positionMintAddress }) => {
      const intent: Intent = { type: "whirlpool_harvest", positionMintAddress };
      const result = await wallet.execute(intent);
      if (result.success) {
        return result.signature
          ? `Harvested fees/rewards for position ${positionMintAddress}. Signature: ${result.signature}`
          : `Harvest accepted (signature pending).`;
      }
      return `Whirlpool harvest failed: ${result.error ?? "Unknown error"}`;
    },
    {
      name: "whirlpool_harvest",
      description: "Harvest accrued fees and rewards from an Orca Whirlpool position (position NFT mint address).",
      schema: z.object({
        positionMintAddress: z.string().describe("Position NFT mint address (base58)"),
      }),
    }
  );

  return [
    transferSol,
    transferSpl,
    getBalance,
    getTokenBalance,
    stakeSol,
    unstakeSol,
    withdrawStakeSol,
    whirlpoolSwap,
    whirlpoolAddLiquidity,
    whirlpoolHarvest,
  ];
}

export type WalletToolIntent = Intent;
