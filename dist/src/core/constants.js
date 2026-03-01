/**
 * Protocol constants for the Agentic Wallet SDK.
 */
import { PublicKey } from "@solana/web3.js";
/**
 * Raydium CPMM (Constant Product Market Maker) program ID.
 * Deployed at the same address on devnet and mainnet-beta.
 */
export const RAYDIUM_CPMM_PROGRAM_ID = new PublicKey("DRaycpLY18LhpbydsBWbVJtxpNv9oXPgjRSfpF2bWpYb");
/** Native SOL mint (Wrapped SOL). Used to identify SOL-in or SOL-out swaps. */
export const NATIVE_MINT_STR = "So11111111111111111111111111111111111111112";
/**
 * Raydium CPMM create-pool fee account (SOL receives the one-time pool creation fee).
 * Same address on devnet and mainnet per Raydium docs.
 */
export const RAYDIUM_CPMM_CREATE_POOL_FEE_ACCOUNT = new PublicKey("3oE58BKVt8KuYkGxx8zBojugnymWmBiyafWgMrnb6eYy");
