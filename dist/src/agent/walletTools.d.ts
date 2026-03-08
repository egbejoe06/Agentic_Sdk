import * as z from "zod";
import type { AgenticWallet } from "../core/AgenticWallet.js";
import type { Intent } from "../core/types.js";
export declare function createWalletTools(wallet: AgenticWallet): (import("langchain").DynamicStructuredTool<z.ZodObject<{
    to: z.ZodString;
    amount: z.ZodNumber;
}, z.core.$strip>, {
    to: string;
    amount: number;
}, {
    to: string;
    amount: number;
}, string, "transfer_sol"> | import("langchain").DynamicStructuredTool<z.ZodObject<{
    mint: z.ZodString;
    to: z.ZodString;
    amount: z.ZodNumber;
}, z.core.$strip>, {
    mint: string;
    to: string;
    amount: number;
}, {
    mint: string;
    to: string;
    amount: number;
}, string, "transfer_spl"> | import("langchain").DynamicStructuredTool<z.ZodObject<{}, z.core.$strip>, Record<string, never>, Record<string, never>, string, "get_balance"> | import("langchain").DynamicStructuredTool<z.ZodObject<{
    mint: z.ZodString;
}, z.core.$strip>, {
    mint: string;
}, {
    mint: string;
}, string, "get_token_balance"> | import("langchain").DynamicStructuredTool<z.ZodObject<{
    amount: z.ZodNumber;
    validator: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, {
    amount: number;
    validator?: string | undefined;
}, {
    amount: number;
    validator?: string | undefined;
}, string, "stake_sol"> | import("langchain").DynamicStructuredTool<z.ZodObject<{
    stakeAccount: z.ZodString;
}, z.core.$strip>, {
    stakeAccount: string;
}, {
    stakeAccount: string;
}, string, "unstake_sol"> | import("langchain").DynamicStructuredTool<z.ZodObject<{
    stakeAccount: z.ZodString;
    amount: z.ZodNumber;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, {
    stakeAccount: string;
    amount: number;
    to?: string | undefined;
}, {
    stakeAccount: string;
    amount: number;
    to?: string | undefined;
}, string, "withdraw_stake_sol"> | import("langchain").DynamicStructuredTool<z.ZodObject<{
    poolAddress: z.ZodString;
    mint: z.ZodString;
    inputAmount: z.ZodOptional<z.ZodString>;
    outputAmount: z.ZodOptional<z.ZodString>;
    slippageToleranceBps: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, {
    poolAddress: string;
    mint: string;
    inputAmount?: string | undefined;
    outputAmount?: string | undefined;
    slippageToleranceBps?: number | undefined;
}, {
    poolAddress: string;
    mint: string;
    inputAmount?: string | undefined;
    outputAmount?: string | undefined;
    slippageToleranceBps?: number | undefined;
}, string, "whirlpool_swap"> | import("langchain").DynamicStructuredTool<z.ZodObject<{
    poolAddress: z.ZodString;
    tokenAmountA: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    tokenAmountB: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    slippageToleranceBps: z.ZodOptional<z.ZodNumber>;
    mode: z.ZodEnum<{
        full_range: "full_range";
        concentrated: "concentrated";
    }>;
    lowerPrice: z.ZodOptional<z.ZodNumber>;
    upperPrice: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, {
    poolAddress: string;
    tokenAmountA: string | number;
    tokenAmountB: string | number;
    mode: "full_range" | "concentrated";
    slippageToleranceBps?: number | undefined;
    lowerPrice?: number | undefined;
    upperPrice?: number | undefined;
}, {
    poolAddress: string;
    tokenAmountA: string | number;
    tokenAmountB: string | number;
    mode: "full_range" | "concentrated";
    slippageToleranceBps?: number | undefined;
    lowerPrice?: number | undefined;
    upperPrice?: number | undefined;
}, string, "whirlpool_add_liquidity"> | import("langchain").DynamicStructuredTool<z.ZodObject<{
    positionMintAddress: z.ZodString;
}, z.core.$strip>, {
    positionMintAddress: string;
}, {
    positionMintAddress: string;
}, string, "whirlpool_harvest">)[];
export type WalletToolIntent = Intent;
//# sourceMappingURL=walletTools.d.ts.map