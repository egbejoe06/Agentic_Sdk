import { setWhirlpoolsConfig, harvestPositionInstructions } from "@orca-so/whirlpools";
import { createSolanaRpc, devnet, createKeyPairSignerFromBytes, address } from "@solana/kit";
import { kitInstructionsToWeb3 } from "../utils/kitInstructionToWeb3.js";
export function isWhirlpoolHarvestIntent(intent) {
    return intent.type === "whirlpool_harvest";
}
const DEVNET_CONFIG_KEY = "solanaDevnet";
/**
 * Build harvest (collect fees and rewards) instructions for an Orca Whirlpool position.
 * Uses the instruction-based Orca API and converts to web3.js v1 for use with AgenticWallet.
 */
export async function buildWhirlpoolHarvestInstructions(connection, authorityKeypair, intent) {
    await setWhirlpoolsConfig(DEVNET_CONFIG_KEY);
    const rpc = createSolanaRpc(devnet(connection.rpcEndpoint));
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(authorityKeypair.secretKey));
    const positionMintAddress = address(intent.positionMintAddress);
    const { instructions } = await harvestPositionInstructions(rpc, positionMintAddress, signer);
    return kitInstructionsToWeb3(instructions);
}
