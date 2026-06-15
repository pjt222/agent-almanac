---
name: redact-wire-capture
description: >
  Redact a network/MITM capture directory — JSONL, JSON, logs, HAR-style dumps
  — in place before it can be referenced publicly, scrubbing credential tokens,
  API keys, service ids, UUIDs, emails, home paths, usernames, and device or
  session hashes while preserving token-class prefixes for analysis and leaving
  public identifiers untouched. Covers class-preserving substitution, an
  idempotent re-runnable pass, distinguishing a secret from a public id, and
  verifying the scrubbed capture through the redaction gate. Use when a wire
  capture from a sanctioned probe must enter notes, a guide, or a public repo
  without leaking the session that produced it.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, wire-capture, mitm, secrets, pii, idempotent
---

# Redact Wire Capture

A wire capture is the highest-density leak surface in any investigation: a single `.jsonl` from a proxied session can carry the bearer token, the account email, the device hash, and the home path all in one request frame. This skill scrubs those in place with class-preserving substitutions — keeping enough of each secret's *shape* to stay analytically useful (`Bearer sk-vendor-oat01-<REDACTED>` still reads as "an OAuth bearer") — runs idempotently so re-redaction is a no-op, and finishes by verifying the directory through `enforce-redaction-gate`.

## When to Use

- Exporting a MITM/proxy capture (`mitmproxy`, HAR, raw request/response logs) from a sanctioned probe into notes or a guide
- Moving capture artifacts (`.jsonl`, `.json`, `.log`, `.stdout`) toward a public mirror
- Sanitizing a wire dump before attaching it to a bug report or upstream disclosure
- Re-running redaction on a capture dir that may already be partly scrubbed (must be safe to repeat)

## Inputs

- **Required**: A capture directory containing text-mode artifacts
- **Required**: The secret-class list (token prefixes, id formats, the personal identifiers to scrub) — kept private
- **Optional**: An allow-list of public identifiers (marketplace/skill names, public usernames) that must be left intact
- **Optional**: The redaction gate (`enforce-redaction-gate`) for the verification step

## Procedure

### Step 1: Enumerate Secret Classes, Keep the Class Marker

For each secret, decide what to strip and what to keep. The goal is *class-preserving* redaction: remove the secret, keep the prefix or shape that tells a reader what class it was, so the capture stays analytically legible.

| Class | Synthetic shape | Redact to | Keep |
|---|---|---|---|
| OAuth bearer | `sk-vendor-oat01-<base64…>` | `sk-vendor-oat01-<REDACTED-BEARER>` | prefix (token class) |
| API key | `sk-vendor-api03-<…>` | `sk-vendor-api-<REDACTED-KEY>` | prefix |
| service id | `srv_<20+ alnum>` | `srv_<REDACTED>` | prefix |
| UUID | `8-4-4-4-12 hex` | `<REDACTED-UUID>` | shape only |
| email | `usr@example.com` | `<REDACTED-EMAIL>` | nothing |
| home path | `/home/<user>/…` | `/home/<REDACTED-USER>/…` | path structure |
| device/session hash | 64-hex under `"deviceId"` | `<REDACTED-DEVICE-HASH>` | the key, not the value |

**Expected:** Every secret class has a from-shape and a to-form; the to-form preserves the class marker but not the secret.

**On failure:** If a value's class is ambiguous (could be a public id or a session id), treat it as secret. A false redaction is recoverable from the private source; a false keep is a leak.

### Step 2: Apply Class-Preserving, Idempotent Substitutions In Place

Scrub the text-mode files in place. Every substitution must be **idempotent** — the to-form must not re-match the from-shape, so a second run changes nothing.

```bash
#!/usr/bin/env bash
set -euo pipefail
CAP="${1:?capture dir required}"
mapfile -t FILES < <(find "$CAP" -type f \( -name '*.jsonl' -o -name '*.json' \
  -o -name '*.log' -o -name '*.txt' -o -name '*.stdout' -o -name '*.stderr' \))
[ "${#FILES[@]}" -gt 0 ] || { echo "no text files under $CAP"; exit 0; }

sed -i -E 's/sk-vendor-oat01-[A-Za-z0-9_-]+/sk-vendor-oat01-<REDACTED-BEARER>/g' "${FILES[@]}"
sed -i -E 's/sk-vendor-api[0-9]+-[A-Za-z0-9_-]+/sk-vendor-api-<REDACTED-KEY>/g'  "${FILES[@]}"
sed -i -E 's/srv_[A-Za-z0-9]{20,}/srv_<REDACTED>/g'                              "${FILES[@]}"
sed -i -E 's/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<REDACTED-UUID>/g' "${FILES[@]}"
sed -i -E 's/[A-Za-z0-9._-]+@example\.com/<REDACTED-EMAIL>/g'                    "${FILES[@]}"
sed -i -E 's#/home/[A-Za-z0-9_-]+/#/home/<REDACTED-USER>/#g'                     "${FILES[@]}"
sed -i -E 's/"deviceId":"[0-9a-f]{64}"/"deviceId":"<REDACTED-DEVICE-HASH>"/g'    "${FILES[@]}"
```

The `<REDACTED-…>` suffix replaces the variable part, so the pattern `[A-Za-z0-9_-]+` no longer matches `<REDACTED-BEARER>` on a second pass. That is what makes the script a safe no-op to re-run.

**Expected:** After one pass, every secret is replaced by its class-preserving form; a second pass reports zero changes.

**On failure:** If a second run keeps changing files, a substitution is non-idempotent (its to-form still matches its from-shape) — anchor or narrow it so the redacted form is inert.

### Step 3: Protect Public Identifiers

Not everything that looks like an identifier is a secret. Public marketplace names, public skill names, and an intentionally-public username are part of the finding and must survive. Apply the allow-list *before* any broad catch-all so a generic rule does not eat a legitimate public name.

**Expected:** Public identifiers on the allow-list appear unchanged in the redacted capture; only private values are scrubbed.

**On failure:** If a public identifier was scrubbed, the catch-all ran too early or too broad — move the allow-list ahead of it and re-derive the redacted output from the private source.

### Step 4: Verify Through the Redaction Gate

Re-run a verification pass that greps each secret shape and fails on any non-`REDACTED` hit, then hand the directory to `enforce-redaction-gate` for the structure-aware tier (a token nested in a JSON body that a flat grep skipped).

```bash
bash tools/enforce-redaction-gate.sh "$CAP" || {
  echo "capture still leaks; extend the secret-class list"; exit 1; }
```

**Expected:** Both the inline verification and `enforce-redaction-gate` exit 0 on the scrubbed directory.

**On failure:** A surviving hit means a secret class is unhandled — add it to Step 1/Step 2, re-run the scrub from the private source, and re-verify. Never delete the offending line by hand; the next capture will reproduce it.

## Validation

- [ ] Every secret class is replaced by a class-preserving form (prefix kept, secret gone)
- [ ] The scrub is idempotent — a second run changes nothing
- [ ] Public allow-list identifiers are intact
- [ ] No UUID, token, email, home path, or device hash survives outside a `<REDACTED-…>` form
- [ ] `enforce-redaction-gate` exits 0 on the scrubbed directory, including the structure-aware tier
- [ ] The redacted capture is reproducible from the private source (re-running yields the same result)

## Common Pitfalls

- **Non-idempotent substitutions.** If the redacted form still matches the pattern, re-runs keep mutating and CI flaps. Make every to-form inert.
- **Stripping the class marker.** Replacing a whole bearer with `<REDACTED>` loses the analytical signal that it *was* an OAuth bearer. Keep the prefix, drop the secret.
- **Catch-all before allow-list.** A broad rule that runs first will scrub the public marketplace name you meant to keep. Allow-list first.
- **Forgetting binary/secondary artifacts.** Captures often include `.har`, `.stdout`, and nested attachments. Enumerate every text-mode type, not just `.jsonl`.
- **Hand-deleting leaking lines.** The capture is a function of the probe; editing the output by hand desyncs it from the source and the leak returns next run.
- **Encoding ≠ redaction.** A base64'd token in a request body is still the token; the gate's structure tier must treat the decoded shape as a leak.

## Related Skills

- `enforce-redaction-gate` — the verification step this skill ends on; supplies the structure-aware tier for tokens nested in request/response bodies
- `conduct-empirical-wire-capture` — produces the captures this skill scrubs; redaction is the mandatory step between capture and any public reference
- `redact-for-public-disclosure` — the methodology umbrella governing what may be referenced publicly at all
- `redact-visualization-for-disclosure` — the sibling transform for rendered diagrams rather than wire dumps
- `security-audit-codebase` — overlapping secret-scanning techniques, oriented to live-credential leakage rather than capture sanitization
