# Deep Dive: Agentic Wallet SDK

This document explains the wallet design, security model, and how AI agents use the Agentic Wallet SDK for autonomous transaction execution on Solana devnet.

---

## 1. Usage examples

As an SDK, the typical entry points are **create an agentic wallet** and **run intents** (programmatically or via a LangChain agent).

### Minimal setup: wallet + balance

```ts
import "dotenv/config";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import {
  createAgenticWallet,
  createLangChainAgent,
  loadKeypairFromEnv,
} from "agentic_sdk";

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Option 1: New wallet (keypair generated)
  const wallet = await createAgenticWallet({
    connection,
    policy: { maxTxSol: 0.5 },
  });

  // Option 2: Load existing from env (WALLET_SECRET_KEY)
  // const wallet = await createAgenticWallet({
  //   connection,
  //   keypair: loadKeypairFromEnv()!,
  //   policy: { maxTxSol: 0.5 },
  // });

  console.log("Wallet:", wallet.getPublicKey());
  console.log("Balance:", await wallet.getBalance(), "SOL");
}
main().catch(console.error);
```

### Programmatic execution (no LLM)

Call `wallet.execute(intent)` with a structured intent. The full pipeline (policy → sandbox → signer) runs; you get success/failure and optional signature.

```ts
const result = await wallet.execute({
  type: "transfer_sol",
  to: "SomeSolanaAddress...",
  amount: 0.01,
});
console.log(result); // { success: true, signature: "..." } or { success: false, error: "..." }
```

### LangChain agent with tools

The agent gets tools (`get_balance`, `transfer_sol`, `whirlpool_swap`, etc.) that call `wallet.execute(intent)` under the hood.

```ts
import { HumanMessage } from "@langchain/core/messages";

const agent = await createLangChainAgent(wallet);
const res = await agent.invoke({
  messages: [new HumanMessage("What is my SOL balance?")],
});
console.log(res.messages[res.messages.length - 1].content);
```

---

## 2. Wallet Design

The wallet follows a strict pipeline: every transaction flows through the same stages so that policy, simulation, and signing are never bypassed.

### High-level flow

```
Agent (or caller)  →  execute(intent)  →  PolicyEngine  →  Sandbox  →  SecureSigner  →  Broadcast
                         │                     │              │             │
                         │                     │              │             └── Signs tx; key never leaves
                         │                     │              └── Simulates on chain; reject if fail
                         │                     └── Validates against rules (e.g. max SOL per tx)
                         └── Structured intent (transfer_sol, whirlpool_swap, etc.)
```

### Role of each component

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **AgenticWallet** | `src/core/AgenticWallet.ts` | Single entry point. Holds connection, keypair, and policy. Receives an **intent** (e.g. “transfer 0.1 SOL to X”), orchestrates the pipeline, builds the Solana transaction from the intent, and returns success/failure and optional signature. |
| **PolicyEngine** | `src/core/PolicyEngine.ts` | Validates the intent **before** any transaction is built. Enforces configurable rules (e.g. `maxTxSol`). If validation fails, execution stops and no signing or broadcast occurs. |
| **Sandbox** | `src/core/Sandbox.ts` | After the transaction is built, runs `simulateTransaction` against the connected RPC. If simulation fails (revert, insufficient funds, bad program), the transaction is rejected and never signed. Ensures the wallet does not sign transactions that would fail on-chain. |
| **SecureSigner** | `src/core/SecureSigner.ts` | Holds the keypair and exposes only `sign(transaction)`. The private key never leaves this module; the agent or caller never receives key material. Signing happens only after policy and simulation have passed. |
| **Intent layer** | `src/intents/*.ts` | Translates typed intents (e.g. `whirlpool_swap`, `transfer_spl`) into Solana instructions. Keeps wallet logic independent of specific programs; new protocols plug in as new intent types. |

### Intent types

Intents are plain objects with a `type` and type-specific fields. The wallet supports:

- **SOL/SPL:** `transfer_sol`, `transfer_spl`
- **Staking:** `stake_sol`, `unstake_sol`, `withdraw_stake_sol`
- **Orca Whirlpools:** `whirlpool_swap`, `whirlpool_add_liquidity`, `whirlpool_harvest`
- **Generic program:** `interact_program` (custom instruction data and account keys)

Read-only operations (e.g. `get_balance`, `get_token_balance`) do not go through the execute pipeline; they call the RPC directly and never touch the signer.

---

## 3. Security

### Key handling

- **Storage:** The keypair is supplied at wallet creation (e.g. from `Keypair.generate()`, env var, or a private key string/array). The SDK does not persist keys; the host application decides where keys live (env, secret manager, HSM, etc.).
- **In memory:** Only `AgenticWallet` and `SecureSigner` hold a reference to the keypair. The keypair is passed into the constructor and stored in private fields; it is never returned or serialized for the caller.
- **Usage:** `SecureSigner` exposes only `sign(transaction)`. It runs `transaction.partialSign(this.keypair)` and does not expose the key. Agents and other callers only ever see `ExecuteResult` (success, signature, or error).

So: **the agent can never read or export the private key**; it can only request actions that the wallet may allow and sign.

### Policy limits

- **PolicyEngine** runs first. If the intent is disallowed, execution stops and no transaction is built or signed.
- **Currently enforced:** For `transfer_sol`, the policy can set `maxTxSol`. Any transfer above that amount is rejected with a clear reason (e.g. “Transfer amount X SOL exceeds maximum allowed per transaction (Y SOL)”).
- **Extensible:** The `WalletPolicy` type (`src/core/types.ts`) includes fields for future use: `maxDailySol`, `allowedRecipients`, `allowedPrograms`, `cooldownSeconds`. Adding checks for these in `PolicyEngine.validate()` would further restrict what the agent can do without changing the rest of the pipeline.

Policies are per-wallet. In multi-agent setups, each wallet can have its own policy (e.g. Agent A allowed 0.5 SOL per tx, Agent B 0.2 SOL).

### Simulation (sandbox)

- Before signing, every transaction is simulated via `connection.simulateTransaction(transaction)`.
- If the simulation returns an error (e.g. insufficient balance, program error, invalid accounts), the wallet returns failure and **does not sign**.
- This prevents “blind” signing: the wallet only signs transactions that are expected to succeed on the current chain state, within the limits of simulation.

### What the agent can and cannot do

**Can:**

- Request any supported intent (transfer, swap, stake, add liquidity, etc.) by calling tools that ultimately call `wallet.execute(intent)`.
- Observe outcomes: success/failure, signature, and tool return messages (e.g. “Transferred 0.1 SOL to …”).
- Read balances and token balances via `get_balance` and `get_token_balance` (no signing).

**Cannot:**

- Read, copy, or export the private key.
- Bypass the policy (e.g. send more than `maxTxSol` in one transfer_sol).
- Force the wallet to sign a transaction that failed simulation.
- Sign raw transactions or arbitrary bytes; only the intent-driven pipeline produces and signs transactions.

The separation is explicit: the **agent** decides *what* to request (intents); the **wallet** decides *whether* to allow it (policy), *whether* it would succeed (simulation), and *whether* to sign and broadcast.

---

## 4. How AI Agents Use the Wallet

### Tools and intents

Agents interact with the wallet through **tools** that map natural language or structured decisions to intents.

- **Implementation:** `createWalletTools(wallet)` in `src/agent/walletTools.ts` builds a set of LangChain tools. Each tool (e.g. `transfer_sol`, `whirlpool_swap`) takes parameters, builds the corresponding `Intent` object, and calls `wallet.execute(intent)`. The tool returns a string summary (e.g. “Transferred 0.1 SOL. Signature: …”) or an error message.
- **Model:** The LLM receives tool names, descriptions, and Zod schemas. It chooses which tool to call and with what arguments; the wallet executes and returns the result. The agent never sees the keypair or raw transactions.

So: **tools = agent-facing API; intents = wallet-facing API**. The same intents can be used by a script, a CLI, or another framework; the LangChain integration is one consumer.

### SKILLS.md

**SKILLS.md** is a human- and agent-readable reference for “what this wallet can do.”

- **Commands:** Table of supported actions (e.g. `transfer_sol`, `get_token_balance`, `whirlpool_swap`) with short descriptions.
- **Intent JSON schemas:** For each command, the expected shape of the intent (e.g. `type`, `to`, `amount` for `transfer_sol`). This allows:
  - Agents that parse structured docs to build intents correctly.
  - Other runtimes (non-LangChain) to call `wallet.execute(intent)` with the right format.
- **Capability summary:** Network (devnet), flow (intent → policy → sandbox → signer → broadcast), and supported protocols.

Agents can use SKILLS.md to discover capabilities and argument formats without depending solely on the tool definitions in code.

### Multi-agent setup

Multiple agents can each have their own wallet and policy.

- **Per-agent wallet:** Each agent gets its own `AgenticWallet` instance (its own keypair and policy). There is no shared keypair; each agent only signs for its own wallet.
- **Creation:** Wallets can be created from env (e.g. `WALLET_SECRET_KEY`, `WALLET_SECRET_KEY_B`), from `Keypair.generate()`, or from a private key. `createAgenticWallet({ connection, keypair, policy })` is the common factory.
- **Demos:**
  - **multiAgentDemo.ts:** Wallet A (from env) and Wallet B (new keypair). A funds B; B then sends SOL. Shows two independent agents with separate wallets and policies.
  - **twoAgentSwapAndLpDemo.ts:** Agent A swaps SOL → USDC and sends USDC (and SOL) to Agent B; Agent B adds liquidity to an Orca Whirlpool. Same pattern: two wallets, two agents, each with its own tools and `execute()` path.

In all cases, agent logic (prompts, tool choice, reasoning) lives in the agent; key handling, policy, simulation, and signing stay inside the wallet. This keeps the system scalable (many agents, many wallets) and secure (no key sharing, per-wallet policies).

---

## 5. Summary

| Topic | Summary |
|-------|---------|
| **Design** | Intent → PolicyEngine → build tx → Sandbox (simulate) → SecureSigner → broadcast. Each component has a single responsibility; intents keep the wallet protocol-agnostic. |
| **Security** | Key never leaves SecureSigner; policy enforced before build/sign; simulation prevents signing failing txs; agent can only request intents and see results. |
| **Agents** | LangChain tools call `wallet.execute(intent)`; SKILLS.md documents commands and intent schemas; multi-agent = one wallet (and optional policy) per agent, no key sharing. |


