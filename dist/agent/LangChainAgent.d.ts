import type { LanguageModelLike } from "@langchain/core/language_models/base";
import type { AgenticWallet } from "../core/AgenticWallet.js";
export declare const DEFAULT_LANGCHAIN_MODEL = "google-genai:gemini-2.5-flash";
export interface CreateLangChainAgentOptions {
    model?: string | LanguageModelLike;
    prompt?: string;
}
export declare function createLangChainAgent(wallet: AgenticWallet, options: CreateLangChainAgentOptions): import("langchain").ReactAgent<import("langchain").AgentTypeConfig<import("langchain").ResponseFormatUndefined, undefined, import("langchain").AnyAnnotationRoot, readonly import("langchain").AgentMiddleware<any, any, any, readonly (import("@langchain/core/tools").ClientTool | import("@langchain/core/tools").ServerTool)[]>[], readonly (import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
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
}, string, "transfer_spl"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, Record<string, never>, Record<string, never>, string, "get_balance">)[]>>;
//# sourceMappingURL=LangChainAgent.d.ts.map