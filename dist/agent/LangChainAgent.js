"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LANGCHAIN_MODEL = void 0;
exports.createLangChainAgent = createLangChainAgent;
const langchain_1 = require("langchain");
const walletTools_js_1 = require("./walletTools.js");
exports.DEFAULT_LANGCHAIN_MODEL = "google-genai:gemini-2.5-flash";
const DEFAULT_SYSTEM_PROMPT = `You are a wallet assistant. You have tools to:
- get_balance: check SOL balance and wallet address
- transfer_sol: send SOL to a recipient address
- transfer_spl: send SPL tokens to a recipient (mint, to, amount)

Use these tools to fulfill user requests. Always confirm amounts and addresses before transferring.`;
function createLangChainAgent(wallet, options) {
    const tools = (0, walletTools_js_1.createWalletTools)(wallet);
    const prompt = options.prompt ?? DEFAULT_SYSTEM_PROMPT;
    const model = options.model ?? exports.DEFAULT_LANGCHAIN_MODEL;
    return (0, langchain_1.createAgent)({
        model,
        tools,
        systemPrompt: prompt,
    });
}
