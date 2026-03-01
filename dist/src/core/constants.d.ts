/**
 * Protocol constants for the Agentic Wallet SDK.
 */
import { PublicKey } from "@solana/web3.js";
/**
 * Raydium CPMM (Constant Product Market Maker) program ID.
 * Deployed at the same address on devnet and mainnet-beta.
 */
export declare const RAYDIUM_CPMM_PROGRAM_ID: PublicKey;
/** Native SOL mint (Wrapped SOL). Used to identify SOL-in or SOL-out swaps. */
export declare const NATIVE_MINT_STR = "So11111111111111111111111111111111111111112";
/**
 * Raydium CPMM create-pool fee account (SOL receives the one-time pool creation fee).
 * Same address on devnet and mainnet per Raydium docs.
 */
export declare const RAYDIUM_CPMM_CREATE_POOL_FEE_ACCOUNT: PublicKey;
//# sourceMappingURL=constants.d.ts.map