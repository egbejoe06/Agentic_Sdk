import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { Intent } from "../core/types.js";
export declare function isStakeSolIntent(intent: Intent): intent is Intent & {
    type: "stake_sol";
};
export declare function buildStakeSolInstructions(payer: PublicKey, intent: Extract<Intent, {
    type: "stake_sol";
}>, connection: any): Promise<TransactionInstruction[]>;
//# sourceMappingURL=stakeSol.d.ts.map