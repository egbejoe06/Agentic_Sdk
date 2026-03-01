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
    keys: {
        pubkey: string;
        isSigner: boolean;
        isWritable: boolean;
    }[];
} | {
    type: "stake_sol";
    amount: number;
    validator?: string;
} | {
    type: "unstake_sol";
    stakeAccount: string;
} | {
    type: "withdraw_stake_sol";
    stakeAccount: string;
    amount: number;
    to?: string;
} | {
    type: "whirlpool_swap";
    poolAddress: string;
    mint: string;
    inputAmount?: string | number;
    outputAmount?: string | number;
    slippageToleranceBps?: number;
} | {
    type: "whirlpool_add_liquidity";
    poolAddress: string;
    /** Amount of token A to add (native units, e.g. smallest decimals). */
    tokenAmountA: string | number;
    /** Amount of token B to add (native units). */
    tokenAmountB: string | number;
    slippageToleranceBps?: number;
    /** "full_range" or "concentrated". Concentrated requires lowerPrice and upperPrice. */
    mode: "full_range" | "concentrated";
    lowerPrice?: number;
    upperPrice?: number;
} | {
    type: "whirlpool_harvest";
    /** Position NFT mint address (identifies the Whirlpool position). */
    positionMintAddress: string;
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