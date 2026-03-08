import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
export declare function isWithdrawStakeSolIntent(intent: Intent): intent is Intent & {
    type: "withdraw_stake_sol";
};
export declare function buildWithdrawStakeSolInstructions(authority: PublicKey, intent: Extract<Intent, {
    type: "withdraw_stake_sol";
}>): TransactionInstruction[];
//# sourceMappingURL=withdrawStakeSol.d.ts.map