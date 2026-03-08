import type { Connection, Keypair } from "@solana/web3.js";
export interface WalletPolicy {
    maxTxSol?: number;
    maxDailySol?: number;
    allowedRecipients?: string[];
    allowedPrograms?: string[];
    cooldownSeconds?: number;
}
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
    tokenAmountA: string | number;
    tokenAmountB: string | number;
    slippageToleranceBps?: number;
    mode: "full_range" | "concentrated";
    lowerPrice?: number;
    upperPrice?: number;
} | {
    type: "whirlpool_harvest";
    positionMintAddress: string;
};
export interface AgenticWalletConfig {
    connection: Connection;
    keypair: Keypair;
    policy: WalletPolicy;
}
export interface ExecuteResult {
    success: boolean;
    signature?: string;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map