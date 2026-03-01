import { setWhirlpoolsConfig, setNativeMintWrappingStrategy, openFullRangePositionInstructions, openPositionInstructions, } from "@orca-so/whirlpools";
import { createSolanaRpc, devnet, createKeyPairSignerFromBytes, address } from "@solana/kit";
import { kitInstructionsToWeb3 } from "../utils/kitInstructionToWeb3.js";
export function isWhirlpoolAddLiquidityIntent(intent) {
    return intent.type === "whirlpool_add_liquidity";
}
const DEVNET_CONFIG_KEY = "solanaDevnet";
/**
 * Build add-liquidity instructions for Orca Whirlpools (devnet).
 * Uses the instruction-based Orca API and converts to web3.js v1 for use with AgenticWallet.
 */
export async function buildWhirlpoolAddLiquidityInstructions(connection, authorityKeypair, intent) {
    await setWhirlpoolsConfig(DEVNET_CONFIG_KEY);
    setNativeMintWrappingStrategy("ata");
    const rpc = createSolanaRpc(devnet(connection.rpcEndpoint));
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(authorityKeypair.secretKey));
    const poolAddress = address(intent.poolAddress);
    const tokenMaxA = BigInt(intent.tokenAmountA);
    const tokenMaxB = BigInt(intent.tokenAmountB);
    const slippageBps = intent.slippageToleranceBps ?? 100;
    const withTokenMetadataExtension = false;
    const result = intent.mode === "full_range"
        ? await openFullRangePositionInstructions(rpc, poolAddress, { tokenMaxA, tokenMaxB }, slippageBps, withTokenMetadataExtension, signer)
        : await (async () => {
            if (intent.lowerPrice == null || intent.upperPrice == null) {
                throw new Error("whirlpool_add_liquidity in concentrated mode requires lowerPrice and upperPrice.");
            }
            return openPositionInstructions(rpc, poolAddress, { tokenMaxA, tokenMaxB }, intent.lowerPrice, intent.upperPrice, slippageBps, withTokenMetadataExtension, signer);
        })();
    return kitInstructionsToWeb3(result.instructions);
}
