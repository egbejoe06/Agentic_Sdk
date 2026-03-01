/**
 * LangChain tools that call wallet.execute(intent).
 * Agent decides when to call these; wallet layer validates, simulates, signs.
 */
import * as z from "zod";
import type { AgenticWallet } from "../core/AgenticWallet.js";
import type { Intent } from "../core/types.js";
/**
 * Create LangChain tools that wrap the wallet's execute(intent) and getBalance().
 * Each tool returns a string result for the agent to read.
 */
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
}, string, "transfer_spl"> | import("langchain").DynamicStructuredTool<z.ZodObject<{}, z.core.$strip>, Record<string, never>, Record<string, never>, string, "get_balance">)[];
export type WalletToolIntent = Intent;
//# sourceMappingURL=walletTools.d.ts.map