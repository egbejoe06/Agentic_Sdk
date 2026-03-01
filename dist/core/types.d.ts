/**
 * Shared types for the agentic wallet SDK.
 * Design: wallet understands intents only — no AI/agent logic here.
 */
import type { Connection, Keypair } from "@solana/web3.js";
/** Policy rules enforced before any transaction is signed. */
export interface WalletPolicy {
    maxTxSol?: number;
    maxDailySol?: number;
    allowedRecipients?: string[];
    allowedPrograms?: string[];
    cooldownSeconds?: number;
}
/** Supported intents the wallet can execute. */
export type Intent = {
    type: "transfer_sol";
    to: string;
    amount: number;
} | {
    type: "transfer_spl";
    mint: string;
    to: string;
    amount: number;
} | {
    type: "interact_program";
    programId: string;
    data: Buffer;
};
/** Configuration to create an AgenticWallet. */
export interface AgenticWalletConfig {
    connection: Connection;
    keypair: Keypair;
    policy: WalletPolicy;
}
/** Result of execute(intent). */
export interface ExecuteResult {
    success: boolean;
    signature?: string;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map