import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Loads a Keypair from a private key string (base58) or a number array.
 * @param key The private key as a base58 encoded string or an array of 64 numbers.
 * @returns The Solana Keypair.
 * @throws Error if the key format is invalid.
 */
export function loadKeypairFromPrivateKey(key: string | number[]): Keypair {
  if (typeof key === "string") {
    try {
      return Keypair.fromSecretKey(bs58.decode(key));
    } catch (err: any) {
      throw new Error(`Invalid base58 private key: ${err.message}`);
    }
  } else if (Array.isArray(key)) {
    try {
      return Keypair.fromSecretKey(Uint8Array.from(key));
    } catch (err: any) {
      throw new Error(`Invalid private key array: ${err.message}`);
    }
  } else {
    throw new Error("Private key must be a base58 string or a number array.");
  }
}

/**
 * Loads a Keypair from an environment variable.
 * Expects the environment variable to contain a JSON array of 64 numbers.
 * @param envVarName The name of the environment variable (default: "WALLET_SECRET_KEY").
 * @returns The Solana Keypair, or undefined if the environment variable is not set.
 */
export function loadKeypairFromEnv(envVarName: string = "WALLET_SECRET_KEY"): Keypair | undefined {
  const raw = process.env[envVarName];
  if (!raw) return undefined;
  try {
    const arr = JSON.parse(raw) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(arr));
  } catch {
    console.warn(`Warning: Failed to parse environment variable "${envVarName}" as a Keypair.`);
    return undefined;
  }
}
