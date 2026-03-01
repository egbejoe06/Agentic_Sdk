# Agentic Wallet SDK — Agent-Readable Capabilities

This file describes what an AI agent can do with this wallet (structured list + JSON schema for parsing).

## Supported commands

| Command | Description |
|---------|-------------|
| `transfer_sol` | Send SOL to a recipient |
| `transfer_spl` | Send SPL tokens to a recipient (amount in native/base units) |
| `get_balance` | Get wallet SOL balance and public key |
| `get_token_balance` | Get SPL token balance by mint (human-readable and native units) |
| `stake_sol` | Stake SOL (native staking); optional validator |
| `unstake_sol` | Deactivate a stake account so it can be withdrawn later |
| `withdraw_stake_sol` | Withdraw SOL from an inactive stake account |
| `whirlpool_swap` | Swap tokens on Orca Whirlpools (exact-in or exact-out) |
| `whirlpool_add_liquidity` | Add liquidity to an Orca Whirlpool (full-range or concentrated) |
| `whirlpool_harvest` | Harvest fees/rewards from a Whirlpool position |
| `interact_program` | Call an on-chain program with custom instruction data and keys |

## Intent JSON schemas

Agents should send intents in this shape to `wallet.execute(intent)` (or use the LangChain tools which wrap these).

### transfer_sol

```json
{
  "type": "transfer_sol",
  "to": "<base58 recipient public key>",
  "amount": "<number, amount in SOL>"
}
```

### transfer_spl

```json
{
  "type": "transfer_spl",
  "mint": "<base58 token mint address>",
  "to": "<base58 recipient public key>",
  "amount": "<number, token amount in native (base) units; use get_token_balance native units>"
}
```

### get_balance

No intent (read-only). Returns SOL balance and wallet public key.

### get_token_balance

No intent (read-only). Parameters: `mint` (base58). Returns human-readable amount and native units (use native for `transfer_spl` amount).

### stake_sol

```json
{
  "type": "stake_sol",
  "amount": "<number, SOL to stake>",
  "validator": "<optional base58 validator vote account; omit for auto-select>"
}
```

### unstake_sol

```json
{
  "type": "unstake_sol",
  "stakeAccount": "<base58 stake account address to deactivate>"
}
```

### withdraw_stake_sol

```json
{
  "type": "withdraw_stake_sol",
  "stakeAccount": "<base58 stake account to withdraw from>",
  "amount": "<number, SOL to withdraw>",
  "to": "<optional base58 recipient; defaults to wallet>"
}
```

### whirlpool_swap

Provide either `inputAmount` (exact-in) or `outputAmount` (exact-out) in token native units.

```json
{
  "type": "whirlpool_swap",
  "poolAddress": "<base58 Orca Whirlpool address>",
  "mint": "<base58 input or output token mint>",
  "inputAmount": "<optional string or number, exact input in native units>",
  "outputAmount": "<optional string or number, exact output in native units>",
  "slippageToleranceBps": "<optional number, e.g. 100 = 1%>"
}
```

### whirlpool_add_liquidity

```json
{
  "type": "whirlpool_add_liquidity",
  "poolAddress": "<base58 Orca Whirlpool address>",
  "tokenAmountA": "<string or number, token A amount in native units>",
  "tokenAmountB": "<string or number, token B amount in native units>",
  "mode": "full_range | concentrated",
  "slippageToleranceBps": "<optional number, e.g. 100 = 1%>",
  "lowerPrice": "<optional number, concentrated only>",
  "upperPrice": "<optional number, concentrated only>"
}
```

### whirlpool_harvest

```json
{
  "type": "whirlpool_harvest",
  "positionMintAddress": "<base58 position NFT mint address>"
}
```

### interact_program

```json
{
  "type": "interact_program",
  "programId": "<base58 program id>",
  "data": "<buffer/bytes for instruction data>",
  "keys": [
    {
      "pubkey": "<base58>",
      "isSigner": "<boolean>",
      "isWritable": "<boolean>"
    }
  ]
}
```

## Capability summary

- **Network:** Solana devnet only.
- **Flow:** Intent → PolicyEngine (rules) → Sandbox (simulation) → SecureSigner → broadcast.
- **Policies:** maxTxSol (enforced).
- **Protocols:** Native SOL/SPL transfers, Solana stake/unstake/withdraw, Orca Whirlpools (swap, add liquidity, harvest).
