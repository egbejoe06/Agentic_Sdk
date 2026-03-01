import "dotenv/config";
import type { LanguageModelLike } from "@langchain/core/language_models/base";
import type { AgenticWallet } from "../core/AgenticWallet.js";
export declare const DEFAULT_LANGCHAIN_MODEL = "google-genai:gemini-2.5-flash";
export interface CreateLangChainAgentOptions {
    model?: string | LanguageModelLike;
    prompt?: string;
}
export declare function createLangChainAgent(wallet: AgenticWallet, options?: CreateLangChainAgentOptions): Promise<import("langchain").ReactAgent<import("langchain").AgentTypeConfig<import("langchain").ResponseFormatUndefined, undefined, import("langchain").AnyAnnotationRoot, readonly import("langchain").AgentMiddleware<any, any, any, readonly (import("@langchain/core/tools").ClientTool | import("@langchain/core/tools").ServerTool)[]>[], readonly (import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
    to: import("zod").ZodString;
    amount: import("zod").ZodNumber;
}, import("zod/v4/core").$strip>, {
    to: string;
    amount: number;
}, {
    to: string;
    amount: number;
}, string, "transfer_sol"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
    mint: import("zod").ZodString;
    to: import("zod").ZodString;
    amount: import("zod").ZodNumber;
}, import("zod/v4/core").$strip>, {
    mint: string;
    to: string;
    amount: number;
}, {
    mint: string;
    to: string;
    amount: number;
}, string, "transfer_spl"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, Record<string, never>, Record<string, never>, string, "get_balance"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
    amount: import("zod").ZodNumber;
    validator: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, {
    amount: number;
    validator?: string | undefined;
}, {
    amount: number;
    validator?: string | undefined;
}, string, "stake_sol"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
    stakeAccount: import("zod").ZodString;
}, import("zod/v4/core").$strip>, {
    stakeAccount: string;
}, {
    stakeAccount: string;
}, string, "unstake_sol"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
    stakeAccount: import("zod").ZodString;
    amount: import("zod").ZodNumber;
    to: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, {
    stakeAccount: string;
    amount: number;
    to?: string | undefined;
}, {
    stakeAccount: string;
    amount: number;
    to?: string | undefined;
}, string, "withdraw_stake_sol"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
    poolAddress: import("zod").ZodString;
    mint: import("zod").ZodString;
    inputAmount: import("zod").ZodOptional<import("zod").ZodString>;
    outputAmount: import("zod").ZodOptional<import("zod").ZodString>;
    slippageToleranceBps: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, {
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
}, string, "whirlpool_swap"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
    poolAddress: import("zod").ZodString;
    tokenAmountA: import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber]>;
    tokenAmountB: import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber]>;
    slippageToleranceBps: import("zod").ZodOptional<import("zod").ZodNumber>;
    mode: import("zod").ZodEnum<{
        full_range: "full_range";
        concentrated: "concentrated";
    }>;
    lowerPrice: import("zod").ZodOptional<import("zod").ZodNumber>;
    upperPrice: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, {
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
}, string, "whirlpool_add_liquidity"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
    positionMintAddress: import("zod").ZodString;
}, import("zod/v4/core").$strip>, {
    positionMintAddress: string;
}, {
    positionMintAddress: string;
}, string, "whirlpool_harvest">)[]>>>;
//# sourceMappingURL=LangChainAgent.d.ts.map