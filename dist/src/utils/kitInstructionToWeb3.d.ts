/**
 * Converts a single @solana/kit Instruction to a legacy web3.js TransactionInstruction.
 * Only supports instructions whose accounts are AccountMeta (no address lookup table refs).
 */
import type { Instruction } from "@solana/kit";
import { TransactionInstruction } from "@solana/web3.js";
/**
 * Convert one Kit Instruction to a web3.js v1 TransactionInstruction.
 * Throws if the instruction uses address lookup table accounts (not representable in a legacy tx).
 */
export declare function kitInstructionToWeb3(instruction: Instruction): TransactionInstruction;
/**
 * Convert an array of Kit Instructions to web3.js v1 TransactionInstruction[].
 */
export declare function kitInstructionsToWeb3(instructions: Instruction[]): TransactionInstruction[];
//# sourceMappingURL=kitInstructionToWeb3.d.ts.map