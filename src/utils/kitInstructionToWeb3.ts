/**
 * Converts a single @solana/kit Instruction to a legacy web3.js TransactionInstruction.
 * Only supports instructions whose accounts are AccountMeta (no address lookup table refs).
 */

import type { Instruction, AccountMeta, AccountLookupMeta } from "@solana/kit";
import { AccountRole } from "@solana/kit";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

function isAccountLookupMeta(account: AccountMeta | AccountLookupMeta): account is AccountLookupMeta {
  return "lookupTableAddress" in account && "addressIndex" in account;
}

/**
 * Convert one Kit Instruction to a web3.js v1 TransactionInstruction.
 * Throws if the instruction uses address lookup table accounts (not representable in a legacy tx).
 */
export function kitInstructionToWeb3(instruction: Instruction): TransactionInstruction {
  const programId = new PublicKey(instruction.programAddress as string);
  const data = instruction.data ? Buffer.from(instruction.data) : Buffer.alloc(0);

  const keys = (instruction.accounts ?? []).map((acc) => {
    if (isAccountLookupMeta(acc)) {
      throw new Error(
        "Orca instruction uses address lookup table; legacy transaction cannot represent it. Use a versioned transaction or different pool."
      );
    }
    const meta = acc as AccountMeta;
    const role = meta.role as AccountRole;
    const isSigner = role === AccountRole.READONLY_SIGNER || role === AccountRole.WRITABLE_SIGNER;
    const isWritable = role === AccountRole.WRITABLE || role === AccountRole.WRITABLE_SIGNER;
    return {
      pubkey: new PublicKey(meta.address as string),
      isSigner,
      isWritable,
    };
  });

  return new TransactionInstruction({
    programId,
    keys,
    data,
  });
}

/**
 * Convert an array of Kit Instructions to web3.js v1 TransactionInstruction[].
 */
export function kitInstructionsToWeb3(instructions: Instruction[]): TransactionInstruction[] {
  return instructions.map(kitInstructionToWeb3);
}
