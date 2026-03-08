import { setWhirlpoolsConfig, setNativeMintWrappingStrategy, swapInstructions } from "@orca-so/whirlpools";
import { createSolanaRpc, devnet, createKeyPairSignerFromBytes, address } from "@solana/kit";
import { kitInstructionsToWeb3 } from "../utils/kitInstructionToWeb3.js";
export function isWhirlpoolSwapIntent(intent) {
    return intent.type === "whirlpool_swap";
}
const DEVNET_CONFIG_KEY = "solanaDevnet";
export async function buildWhirlpoolSwapInstructions(connection, authorityKeypair, intent) {
    await setWhirlpoolsConfig(DEVNET_CONFIG_KEY);
    setNativeMintWrappingStrategy("ata");
    const rpc = createSolanaRpc(devnet(connection.rpcEndpoint));
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(authorityKeypair.secretKey));
    const poolAddress = address(intent.poolAddress);
    const mint = address(intent.mint);
    const slippageBps = intent.slippageToleranceBps ?? 100;
    const hasIn = intent.inputAmount !== undefined && intent.inputAmount !== "";
    const hasOut = intent.outputAmount !== undefined && intent.outputAmount !== "";
    if (!hasIn && !hasOut) {
        throw new Error("whirlpool_swap intent requires either inputAmount (exact-in) or outputAmount (exact-out).");
    }
    const params = hasIn
        ? { inputAmount: BigInt(intent.inputAmount), mint }
        : { outputAmount: BigInt(intent.outputAmount), mint };
    const { instructions } = await swapInstructions(rpc, params, poolAddress, slippageBps, signer);
    return kitInstructionsToWeb3(instructions);
}
