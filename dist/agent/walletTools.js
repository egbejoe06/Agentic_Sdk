"use strict";
/**
 * LangChain tools that call wallet.execute(intent).
 * Agent decides when to call these; wallet layer validates, simulates, signs.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletTools = createWalletTools;
const langchain_1 = require("langchain");
const z = __importStar(require("zod"));
/**
 * Create LangChain tools that wrap the wallet's execute(intent) and getBalance().
 * Each tool returns a string result for the agent to read.
 */
function createWalletTools(wallet) {
    const transferSol = (0, langchain_1.tool)(async ({ to, amount }) => {
        const intent = { type: "transfer_sol", to, amount };
        const result = await wallet.execute(intent);
        if (result.success) {
            return result.signature
                ? `Transferred ${amount} SOL to ${to}. Signature: ${result.signature}`
                : `Transfer of ${amount} SOL to ${to} accepted (signature pending).`;
        }
        return `Transfer failed: ${result.error ?? "Unknown error"}`;
    }, {
        name: "transfer_sol",
        description: "Transfer SOL (native token) to a recipient address.",
        schema: z.object({
            to: z.string().describe("Recipient Solana address (base58)"),
            amount: z.number().positive().describe("Amount of SOL to send"),
        }),
    });
    const transferSpl = (0, langchain_1.tool)(async ({ mint, to, amount }) => {
        const intent = { type: "transfer_spl", mint, to, amount };
        const result = await wallet.execute(intent);
        if (result.success) {
            return result.signature
                ? `Transferred ${amount} tokens (mint ${mint}) to ${to}. Signature: ${result.signature}`
                : `Transfer accepted (signature pending).`;
        }
        return `Transfer failed: ${result.error ?? "Unknown error"}`;
    }, {
        name: "transfer_spl",
        description: "Transfer SPL (token) to a recipient address.",
        schema: z.object({
            mint: z.string().describe("Token mint address (base58)"),
            to: z.string().describe("Recipient Solana address (base58)"),
            amount: z.number().positive().describe("Amount of tokens to send"),
        }),
    });
    const getBalance = (0, langchain_1.tool)(async () => {
        const balance = await wallet.getBalance();
        return `Balance: ${balance} SOL. Public key: ${wallet.getPublicKey()}`;
    }, {
        name: "get_balance",
        description: "Get the wallet's SOL balance and public key.",
        schema: z.object({}),
    });
    return [transferSol, transferSpl, getBalance];
}
