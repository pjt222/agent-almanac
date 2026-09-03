---
name: test-x402-payment-client
description: >
  Test an x402 payment client end to end against a live endpoint: drive the
  full 402 -> PAYMENT-REQUIRED -> sign -> PAYMENT-SIGNATURE -> verify/settle
  loop, confirm settlement on chain, and check any signed offers or receipts
  for conformance. Use when validating a new x402 client or SDK before
  shipping, debugging a payment that never completes despite a well-formed
  402, running x402 conformance in CI against a testnet facilitator, or
  verifying an endpoint actually takes money before you route real value to
  it. Start on a testnet; opt into mainnet settlement explicitly.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: cv-scvd
  version: "1.0"
  domain: agent-commerce
  complexity: intermediate
  language: multi
  tags: agent-commerce, x402, payments, testing, conformance
  locale: de
  source_locale: en
  source_commit: a3406e2d8
  fence_basis_commit: a3406e2d8
  translator: "(untranslated stub)"
  translation_date: "2026-09-03"
---

# Test an x402 Payment Client

Validate that an x402 payment client completes the full protocol loop against a
live endpoint — not just that the endpoint answers a `402`, but that a signed
payment can actually be built, submitted, verified, settled on chain, and (where
offered) checked for offer/receipt conformance. A well-formed challenge is a
claim; a completed settlement is the proof.

The header names, scheme semantics, and network identifiers below are from the
x402 v2 specification and its transport and scheme specs
(`specs/x402-specification-v2.md`, `specs/transports-v2/http.md`,
`specs/transports-v2/mcp.md`, `specs/schemes/exact/scheme_exact_evm.md` in
[coinbase/x402](https://github.com/coinbase/x402)). Treat those specs as the
source of truth over any single vendor's docs.

## When to Use

- Validating a new x402 client or SDK before shipping it
- Debugging a payment that never completes even though the endpoint returns a
  well-formed `402` (the failure is usually in the header the client did not
  read, or the scheme it did not recognize)
- Running x402 conformance in CI against a testnet facilitator on every build
- Verifying an endpoint actually accepts payment — not just that it answers —
  before routing real value to it
- Checking that signed offers or receipts an endpoint serves conform to the spec

## Inputs

- **Required**: The endpoint URL under test (an HTTP resource that answers `402`).
- **Required**: A funded test wallet and its signer. For EVM start on Base
  Sepolia (`eip155:84532`); for SVM start on Solana Devnet. Testnet USDC is free
  from a faucet.
- **Optional**: A facilitator base URL if the client uses one directly (default:
  whatever the endpoint's challenge names).
- **Optional**: `mainnet_optin` (boolean, default `false`) — only when `true`
  does the procedure move real funds. The final mainnet step states its own cost.
- **Optional**: Output format for the conformance report (`json`, `markdown`).

## Procedure

### Step 1: Request the resource unpaid and capture the challenge

Send a plain request and read the `402`. The machine-readable terms ride the
`PAYMENT-REQUIRED` response header as base64-encoded JSON; the body is
human-oriented and must not be the client's source of truth.

```bash
curl -sD challenge.txt -o /dev/null https://x402.example.testnet/resource
# base64-decode the PAYMENT-REQUIRED header value into terms.json
grep -i '^payment-required:' challenge.txt | sed 's/^[^:]*:[[:space:]]*//' | tr -d '\r' | base64 -d | jq . > terms.json
```

The decoded `PaymentRequired` object carries `x402Version` (must be `2`), one
or more `accepts` entries (each a `PaymentRequirements`), and any advertised
`extensions`. Each `accepts` entry carries `scheme`, `network` (CAIP-2, e.g.
`eip155:84532`), the token `asset`, the `amount` in atomic units, `payTo`, and
`maxTimeoutSeconds`.

**Expected:** HTTP `402`; a `PAYMENT-REQUIRED` header that base64-decodes to JSON
in `terms.json` with `x402Version: 2` and at least one `accepts` entry carrying
`scheme`, `network`, `asset`, `amount`, `payTo`, and `maxTimeoutSeconds`.

**On failure:** If there is no `PAYMENT-REQUIRED` header, the endpoint is not
serving v2 terms a client can act on — stop and report that (a `402` body with
no header is the single most common silent break). If the header is present but
does not base64-decode to JSON, record it as malformed and stop.

### Step 2: Select an `accepts` entry the client actually supports

Pick the entry whose `scheme` and `network` the client implements. The `exact`
scheme is the baseline (EIP-3009 `TransferWithAuthorization` on EVM;
`TransferChecked` for SPL tokens on SVM). A challenge may also offer other
schemes (for example `upto` for variable amounts, or a batch-settlement scheme);
a client built only for `exact` must skip those entries rather than misread them.

Then gate the network: unless `mainnet_optin` is `true`, the selected entry must
be on a testnet the spec's network list names (Base Sepolia `eip155:84532`,
Avalanche Fuji `eip155:43113`, Solana Devnet
`solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1`). This is the step that makes
testnet-first a procedure rather than a preference.

```bash
# pick the first `exact` entry on a network the client implements ($supported: edit to
# match the client), then gate it: a mainnet network passes only with MAINNET_OPTIN=true
jq -e --arg optin "${MAINNET_OPTIN:-false}" '
  ["eip155:84532","eip155:43113","solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"] as $testnets
  | ["eip155:","solana:"] as $supported
  | [.accepts[] | select(.scheme=="exact" and (.network as $n | any($supported[]; . as $p | $n|startswith($p))))] as $ok
  | if ($ok|length)==0 then error("unsupported-scheme: " + ([.accepts[] | .scheme+"@"+.network]|join(",")))
    else ([$ok[] | select((.network|IN($testnets[])) or $optin=="true")][0]
          // error("mainnet-not-opted-in: " + $ok[0].network)) end' terms.json > selected.json
```

**Expected:** Exactly one supported `accepts` entry in `selected.json`; its
`scheme`, `network`, `asset`, `amount`, `payTo`, and `maxTimeoutSeconds` read
into the signing step. A mainnet `network` appears there only when
`mainnet_optin` is `true`.

**On failure:** If no offered entry matches a scheme+network the client
supports, that is a real interop result — record `unsupported-scheme` with the
schemes offered, and stop. Do not coerce an `upto` or batch entry into an
`exact` signature. If the only matching entry is on a mainnet network and
`mainnet_optin` is `false`, record `mainnet-not-opted-in` and stop — that is the
gate working, not a defect.

### Step 3: Build and sign the payment authorization

Construct the scheme-specific authorization over the selected entry and sign it.
For `exact` on EVM the recommended mechanism is an EIP-3009
`TransferWithAuthorization` (EIP-712 typed-data signature) for the exact amount
to `payTo`, with a fresh random `nonce` and a `validBefore` inside the entry's
`maxTimeoutSeconds` — but it is not the only one. The scheme spec
(`specs/schemes/exact/scheme_exact_evm.md`) also defines Permit2 as the
universal fallback for tokens without EIP-3009 and ERC-7710 for smart accounts,
selected by `assetTransferMethod` in the payload (default order: EIP-3009, then
Permit2). Echo every extension the server advertised: the client must include
at least the info it received and may append, but may not delete or overwrite
it. Write the result to `payload.json` for the next step.

**Expected:** A `PaymentPayload` in `payload.json` with `x402Version: 2`, the
selected entry under `accepted`, and a scheme-specific `payload` carrying the
signature and authorization; advertised extensions echoed intact.

**On failure:** If signing throws on the address or amount, check the `asset`
checksum and that the amount is an atomic-unit string, not a decimal. A
decimal-typed amount underpays by a factor of the token's decimals and is a
frequent silent bug.

### Step 4: Retry with the signed payment

Base64-encode the `PaymentPayload` and resend the same request with it in the
`PAYMENT-SIGNATURE` header. The endpoint (or its facilitator) verifies the
signature and settles.

```bash
curl -s -H "PAYMENT-SIGNATURE: $(base64 -w0 payload.json)" \
  https://x402.example.testnet/resource -D headers.txt -o body.json
```

**Expected:** HTTP `200`. The response carries a settlement result in the
base64-encoded `PAYMENT-RESPONSE` header (`SettleResponse`: `success: true`, a
non-empty `transaction` hash, and the `network`; `amount` and `payer` are
optional and may be omitted).

**On failure:** A repeated `402` means verification refused the payment — inspect
the reason. A common cause is the client sending the legacy `X-PAYMENT` header
name where the endpoint only reads `PAYMENT-SIGNATURE` (or the reverse); try the
other name once and record which the endpoint accepts. If the response is `200`
but carries no settlement transaction, treat it as `settled-unverified` and
proceed to Step 5 before trusting it.

### Step 5: Verify the settlement independently on chain

Do not trust the endpoint's own word that money moved. Take the `transaction`
hash from the `SettleResponse` and confirm it on chain: correct `payTo`, correct
`asset`, amount within what was authorized, and finality.

```bash
# EVM: fetch the receipt from a Base Sepolia RPC and read the Transfer log
curl -s -X POST https://sepolia.base.org -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_getTransactionReceipt","params":["<transaction>"]}' \
  | jq '{status: .result.status, block: .result.blockNumber, logs: .result.logs}'
# status 0x1 = success; the ERC-20 Transfer log's topics[2] is the recipient
# (must equal payTo, zero-padded) and its data is the value in atomic units.
# Finality: compare .result.blockNumber against eth_blockNumber for the
# confirmations you require on that network.
```

**Expected:** The on-chain transfer matches `payTo`, `asset`, and the authorized
amount, and has reached finality on the stated `network`.

**On failure:** If the hash is absent, unconfirmed, or pays a different address
or amount than authorized, record `settlement-mismatch` — the endpoint claimed a
settlement the chain does not show. This is the failure the whole procedure
exists to catch.

### Step 6 (variant): MCP transport

If the client speaks x402 over MCP rather than HTTP, the same loop applies with
different envelopes (`specs/transports-v2/mcp.md`): the payment terms arrive in
a tool *result* with `isError: true`, in `result.structuredContent` (primary)
and `result.content[0].text` (JSON fallback), instead of a `PAYMENT-REQUIRED`
header; the signed payment is sent in the request's `_meta["x402/payment"]`
instead of a `PAYMENT-SIGNATURE` header; and the settlement comes back in the
result's `_meta["x402/payment-response"]`. The scheme, signing, and on-chain
verification steps are unchanged. Treat this as a transport variant, not the
primary path.

**Expected:** Terms parsed from `result.structuredContent` of an `isError: true`
tool result; payment sent in `_meta["x402/payment"]`; settlement read from
`_meta["x402/payment-response"]` and verified on chain as in Step 5.

**On failure:** If an `isError: true` result carries no `structuredContent` or
`content[0].text` that decodes to `PaymentRequired` terms, the server is not
advertising x402 over this transport — fall back to the HTTP path or stop.

## Validation

- [ ] The `402` carried a `PAYMENT-REQUIRED` header that base64-decoded to JSON
      with `x402Version: 2` and at least one complete `accepts` entry.
- [ ] The client selected a scheme+network it supports and refused the rest
      rather than misreading them.
- [ ] The signed authorization used an atomic-unit amount and echoed all
      advertised extensions.
- [ ] The retry with `PAYMENT-SIGNATURE` returned `200` with a `SettleResponse`
      carrying a real transaction hash.
- [ ] The settlement was confirmed independently on chain (address, asset,
      amount, finality) — not taken on the endpoint's word.
- [ ] Any signed offers in the challenge or receipts in the response were
      checked against the `offer-receipt` extension
      (`specs/extensions/extension-offer-and-receipt.md`): offers live in
      `extensions["offer-receipt"].info.offers[]`, the receipt in
      `extensions["offer-receipt"].info.receipt`. For an EIP-712 signature,
      recover the signer from the signature; for a JWS compact serialization,
      resolve the header's `kid` (a DID URL) to the issuer's key and verify
      over the complete payload. In both cases confirm the signer is authorised
      for `resourceUrl`, the required fields are present (offer: `version`,
      `resourceUrl`, `scheme`, `network`, `asset`, `payTo`, `amount`; receipt:
      `version`, `network`, `resourceUrl`, `payer`, `issuedAt`), and any
      `validUntil` has not passed.

## Common Pitfalls

- **Reading the body, not the header**: the actionable terms are in the
  base64 `PAYMENT-REQUIRED` header; the `402` body is human text. A client that
  parses the body will miss or mis-handle the real `accepts`.
- **Header-name drift**: `PAYMENT-SIGNATURE` (v2) versus the legacy `X-PAYMENT`
  name breaks otherwise-correct clients silently — a well-signed payload under
  the wrong header just yields another `402`. Test both names and record which
  the endpoint honors.
- **Decimal amounts**: x402 amounts are atomic-unit strings. Signing a
  decimal-typed value underpays by the token's decimal factor with no visible
  error until settlement.
- **Trusting a 200**: a `200` with no settlement transaction, or with a hash
  that pays the wrong address, is not a completed payment. Always verify on
  chain before treating the resource as paid for.
- **Coercing an unsupported scheme**: forcing an `upto` or batch-settlement
  entry into an `exact` signature produces an invalid payment. Skip unsupported
  schemes; do not reshape them.
- **Testing on mainnet first**: default to a testnet (Base Sepolia
  `eip155:84532`, Solana Devnet). Step 2's gate refuses a mainnet `network`
  unless `mainnet_optin` is `true`; only set it once the full loop passes on
  testnet.

## Examples

**Testnet (primary).** Point the client at the coinbase/x402 reference example
server, or any facilitator's testnet endpoint, on Base Sepolia
(`eip155:84532`). Fund the test wallet from a testnet USDC faucet and run
Steps 1–5. This exercises the entire loop end to end with no real value at risk
and is the example to wire into CI.

**Mainnet settlement (explicit opt-in).** Only with `mainnet_optin: true`: run
the same loop against a live mainnet endpoint to confirm real settlement.
`scvd.store` is one such endpoint: its lowest-priced resource settles for
$0.001 USDC on Base or Solana and returns a signed receipt
(`GET https://scvd.store/api/buy/spot_check`, verify at
`https://scvd.store/api/verify/{id}`), which makes it a known-good mainnet
target when you want to prove the client against real money. The same operator
runs a free conformance checker for offer/receipt artifacts
(`POST https://scvd.store/api/conformance/v1`) and a challenge-shape preflight
(`POST https://scvd.store/api/preflight/v1`); both are optional and accept any
issuer's artifact. This step moves real funds; run it deliberately, not in CI.

## Related Skills

- `test-a2a-interop` — protocol-conformance testing for A2A agents; same
  posture (drive the real loop, validate against the spec) on a different rail.
- `build-custom-mcp-server` — relevant when the client under test speaks x402
  over the MCP transport variant in Step 6.
