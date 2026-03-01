# Agentic Wallet SDK (Solana)

Secure, policy-governed, multi-agent wallet SDK for AI agents on Solana devnet.

## Architecture

```
Agent → execute(intent) → PolicyEngine → Sandbox → SecureSigner → Solana Devnet
```

- **Core:** `AgenticWallet`, `PolicyEngine`, `Sandbox`, `SecureSigner` (see `src/core/`).
- **Intents:** `transfer_sol`, `transfer_spl`, `interact_program`, stake/unstake/withdraw, Whirlpool swap/add liquidity/harvest (see `src/intents/`).
- **Agent:** LangChain tools that call `wallet.execute(intent)` (see `src/agent/`).

## Project structure

```
src/
  core/       — AgenticWallet, PolicyEngine, SecureSigner, Sandbox, types
  intents/    — transferSol, transferSpl, interactProgram, stake, whirlpool*
  agent/      — walletTools (LangChain), LangChainAgent
demo/
  multiAgentDemo.ts           — two agents: A funds B, B sends SOL
  twoAgentSwapAndLpDemo.ts    — A swaps SOL→USDC, sends to B; B adds LP
  whirlpoolSwapDemo.ts        — single-wallet Whirlpool swap
SKILLS.md     — agent-readable commands + JSON schemas
```

## Setup

- Node 18+
- `npm install`
- Copy `.env.example` to `.env` and set `WALLET_SECRET_KEY` (JSON array of 64 numbers). For demos that use an LLM, set your API key (e.g. `GOOGLE_GENAI_API_KEY`).
- Fund the wallet with devnet SOL for demos: [Solana Faucet](https://faucet.solana.com/) (devnet).

```bash
npm run build
```

## Demo

```bash
# Single-wallet Whirlpool swap (devnet)
npm run demo:whirlpool

# Multi-agent: A funds B, B sends SOL
npm run demo:multi

# Two-agent: A swaps SOL→USDC and sends to B; B adds liquidity
npm run demo:two-agent
```

## Deep dive

For wallet design, security (key handling, policy, simulation), and how AI agents use the wallet (tools, intents, SKILLS.md, multi-agent setup), see **[docs/DEEP_DIVE.md](docs/DEEP_DIVE.md)**.

## Security

- Policy checks before every transaction.
- Sandbox simulation before signing.
- Private key never leaves `SecureSigner`.

