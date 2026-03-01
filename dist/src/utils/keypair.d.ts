import { Keypair } from "@solana/web3.js";
/**
 * Loads a Keypair from a private key string (base58) or a number array.
 * @param key The private key as a base58 encoded string or an array of 64 numbers.
 * @returns The Solana Keypair.
 * @throws Error if the key format is invalid.
 */
export declare function loadKeypairFromPrivateKey(key: string | number[]): Keypair;
/**
 * Loads a Keypair from an environment variable.
 * Expects the environment variable to contain a JSON array of 64 numbers.
 * @param envVarName The name of the environment variable (default: "WALLET_SECRET_KEY").
 * @returns The Solana Keypair, or undefined if the environment variable is not set.
 */
export declare function loadKeypairFromEnv(envVarName?: string): Keypair | undefined;
//# sourceMappingURL=keypair.d.ts.map