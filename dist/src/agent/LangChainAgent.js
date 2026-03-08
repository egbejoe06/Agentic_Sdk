import "dotenv/config";
import { createAgent, initChatModel } from "langchain";
import { DEV_USDC_MINT } from "../constants.js";
import { createWalletTools } from "./walletTools.js";
export const DEFAULT_LANGCHAIN_MODEL = "google-genai:gemini-2.5-flash";
const DEFAULT_SYSTEM_PROMPT = `You are a helpful Solana wallet assistant on Solana devnet.
When the user asks for USDC balance, use get_token_balance with mint: ${DEV_USDC_MINT}.
You can check balances and transfer SOL or SPL tokens.
You can also interact with Orca Whirlpools:
- Swap: use whirlpool_swap with pool address, mint address, and either inputAmount or outputAmount in token native units.
- Add liquidity: use whirlpool_add_liquidity with pool address, tokenAmountA and tokenAmountB (native units), and mode "full_range" or "concentrated" (concentrated requires lowerPrice and upperPrice).
- Harvest fees/rewards: use whirlpool_harvest with the position NFT mint address (positionMintAddress) of the user's Whirlpool position.
Use the provided tools to interact with the blockchain.
Always confirm details with the user before executing transfers, swaps, or liquidity operations.
For staking, if the user does not care about a specific validator, you may omit the validator parameter and rely on the wallet to automatically choose a safe validator.
Your public key is available via get_balance.`;
export async function createLangChainAgent(wallet, options = {}) {
    const tools = createWalletTools(wallet);
    const prompt = options.prompt ?? DEFAULT_SYSTEM_PROMPT;
    const model = typeof options.model === "string" || !options.model
        ? await initChatModel(options.model ?? DEFAULT_LANGCHAIN_MODEL)
        : options.model;
    return createAgent({
        model,
        tools,
        systemPrompt: prompt,
    });
}
