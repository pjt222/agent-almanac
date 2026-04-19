---
name: conduct-empirical-wire-capture
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Capture outbound HTTP and telemetry from a CLI harness at runtime.
  Covers capture-channel selection (transcript file vs verbose-fetch
  stderr vs outbound proxy vs on-disk state), hook-driven per-event
  capture vs long-running session capture, JSONL output format for
  diff-friendly artifacts, and the observability table that maps each
  target to the cheapest channel that captures it. Use when a static
  finding needs runtime confirmation, when a payload shape is needed
  for a client re-implementation, or when dark-vs-live disambiguation
  requires watching what the binary actually sends.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, wire-capture, http, telemetry, jsonl, observability
---

# Conduct Empirical Wire Capture

Set up a reproducible wire-capture harness for a CLI tool's outbound HTTP and telemetry, matching each observability target to the cheapest channel that captures it.

## Scope and Ethics

Read this before configuring any capture.

- Wire capture is for **your own** requests against **your own** account, on **your own** machine. Capturing other users' traffic is exfiltration, not research, and is out of scope.
- Credentials almost always appear in raw wire output. Redact at capture time (Step 6) — never "capture now, redact later."
- Capture is *observation*, not modification. Do not use captured payloads to bypass server-side rate limits, replay another user's session, or activate a dark-launched capability without authorization.
- The output of this skill is an internal artifact. Public publication of wire findings goes through `redact-for-public-disclosure` (Phase 5 of the parent guide), not this skill.

## When to Use

- A static finding (a flag, an endpoint reference, a telemetry-event name) needs runtime confirmation that it actually fires.
- A payload shape is needed for a client re-implementation, a tracing instrumentation, or a cross-version diff.
- Dark-vs-live disambiguation requires watching what the binary actually sends, not what the bundle suggests it might.
- A behavior changed silently between versions and you want a reproducible artifact to compare against future versions.

Do **not** use this skill for: version baselining (use `monitor-binary-version-baselines`), flag-state probing (use `probe-feature-flag-state`), or preparing redacted artifacts for public publication (use `redact-for-public-disclosure`).

## Inputs

- **Required**: A CLI harness binary you can run locally against your own account.
- **Required**: A specific question to answer (e.g., "does endpoint X fire on event Y?", "what is the payload shape for telemetry event Z?"). Capture without a question produces a log that nobody reads.
- **Optional**: Static findings from prior phases (marker catalog, candidate flag list, suspected endpoints) that scope the capture targets.
- **Optional**: A private workspace path for capture artifacts. Default is `./captures/` — must be in `.gitignore`.

## Procedure

### Step 1: Build the Observability Table First

Before configuring any capture, enumerate the questions you need to answer and map each to a capture channel. One row per target.

| target | observable via | blocker |
|---|---|---|
| Outbound HTTP to endpoint X | verbose-fetch stderr | TUI noise pollutes terminal |
| Telemetry event Y on user action | hook-driven subprocess | requires harness hook surface |
| Token-refresh handshake | outbound HTTP proxy | cert trust required |
| Scheduled-task lifecycle event | long-running session capture | wallclock alignment |
| Local config mutation | on-disk state diff | none — cheapest channel |

Common channels, cheapest first:

- **On-disk state file mutation** — when the harness writes its state to a known path, `diff` between snapshots is free.
- **Transcript file** — when the harness already writes a session transcript, parse it directly. No instrumentation.
- **Verbose-fetch stderr** — bundler-provided env var (e.g., bun's `BUN_CONFIG_VERBOSE_FETCH=curl`) routes every fetch to stderr. Noisy but captures every fetch.
- **Hook-driven subprocess** — when the harness exposes lifecycle hooks (`UserPromptSubmit`, `Stop`, etc.), spawn a short capture subprocess per event.
- **Long-running session capture** — one process across a session, wallclock-tagged. Use for sequences.
- **Outbound HTTP proxy** — clean separation, but requires CA cert trust and breaks when the harness pins certificates.

Pick the cheapest channel that captures the target. A 3-target capture that answers one specific question beats a 20-target capture that answers none.

**Expected:** an observability table with one row per question, each annotated with channel and known blockers. Targets without a viable channel are flagged "out of scope this session."

**On failure:** if every target lands in the proxy column, the table is too ambitious. Trim to the one or two highest-value questions and revisit lower-cost channels for them.

### Step 2: Prepare a Disposable Workspace

Wire capture pollutes terminals, leaves files in unexpected places, and may leak credentials into logs.

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

Confirm the capture session is not your primary working session — verbose-fetch and TUI rendering interfere with each other.

**Expected:** a timestamped capture directory, git-ignored, separate from your working session.

**On failure:** if `git check-ignore` reports the directory as not ignored, fix `.gitignore` before running any capture command. Do not proceed with credentials at risk.

### Step 3: Hook-Driven Capture for Per-Event Targets

When the target is a discrete event (a tool invocation, a prompt submission, a session stop), use the harness's hook surface. Spawn a short-lived capture subprocess per event; do not sit in-process.

The pattern (synthetic example):

```bash
# Hook script, registered with the harness's hook config.
# Invoked once per event; writes one JSONL line; exits.
#!/usr/bin/env bash
set -euo pipefail
TS=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
EVENT="${1:-unknown}"
PAYLOAD=$(jq -c --arg ts "$TS" --arg ev "$EVENT" \
  '{ts:$ts, source:"hook", target:$ev, payload:.}' < /dev/stdin)
echo "$PAYLOAD" >> "$CAPTURE_DIR/events.jsonl"
```

Why subprocess-per-event:

- No token state, no session coupling — each invocation is independent.
- Failure of one capture does not contaminate the next.
- Subprocess overhead is acceptable because events are rare (per-user-action, not per-byte).

**Expected:** one JSONL line per fired event in `events.jsonl`, each well-formed JSON parseable with `jq`.

**On failure:** if `jq` reports parse errors, the payload contains unescaped control chars or binary data — pipe through `jq -R` (raw input) and base64-encode the payload field instead.

### Step 4: Long-Running Session Capture for Sequential State

When the target is a sequence (multi-turn handshake, scheduled-task lifecycle, retry/backoff state machine), one capture process across the session, wallclock-tagged.

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

The wallclock prefix makes ordering unambiguous when multiple captures run concurrently. TSV (tab-separated) is intentional — it survives shells that mangle JSON quoting on stderr.

Convert TSV to JSONL after the session ends (Step 5), not during.

**Expected:** a TSV log with monotonically increasing timestamps, one stderr line per row.

**On failure:** if timestamps go backwards, the harness is buffering stderr — re-run with `stdbuf -oL -eL` or the bundler's equivalent line-buffer flag.

### Step 5: Normalize to JSONL

JSONL is the artifact format: one JSON object per line, fields `timestamp`, `source`, `target`, `payload`. Diff-friendly, `jq`-filterable, and stable across editor reloads.

```bash
# Parse the TSV from Step 4 into JSONL.
awk -F'\t' '{
  printf "{\"timestamp\":\"%s\",\"source\":\"verbose-fetch\",\"target\":\"%s\",\"payload\":%s}\n",
    $1, "session", $2
}' < session.tsv | jq -c . > session.jsonl
```

Validate every line parses:

```bash
while IFS= read -r line; do
  echo "$line" | jq -e . > /dev/null || echo "BAD LINE: $line"
done < session.jsonl
```

Typical filter usage:

```bash
# Show only requests to a specific endpoint pattern.
jq -c 'select(.payload | tostring | test("/api/v1/example"))' session.jsonl

# Show timing between consecutive captures.
jq -r '.timestamp' session.jsonl | sort | uniq -c
```

**Expected:** every line of `*.jsonl` parses with `jq -e .`; no `BAD LINE` warnings.

**On failure:** if some lines fail validation, the source TSV had embedded tabs in the payload — re-run Step 4 with a different delimiter or base64-encode the second field.

### Step 6: Redact at Capture Time

Strip auth headers, session IDs, bearer tokens, and PII **before** writing to disk. The `events.jsonl` and `session.jsonl` files should not, on first write, contain a single secret.

```bash
# Stream the raw capture through a redactor before persisting.
redact() {
  sed -E \
    -e 's/(authorization:[[:space:]]*Bearer[[:space:]]+)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(x-api-key:[[:space:]]*)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(cookie:[[:space:]]*)[^;]+/\1<REDACTED>/gi' \
    -e 's/("password"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g' \
    -e 's/("token"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g'
}

cat raw-capture.txt | redact > session.tsv
```

After capture, verify nothing slipped through:

```bash
# Patterns that must not appear in any *.jsonl file.
grep -Ei 'bearer [A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' captures/ \
  && { echo "LEAK DETECTED"; exit 1; } \
  || echo "redaction clean"
```

The `captured-then-redacted` artifact always leaks something. The only safe pattern is `redacted-as-captured`. If you discover an unredacted token in a finalized artifact, treat the entire capture as compromised — delete it, rotate the credential, and re-run.

**Expected:** the `LEAK DETECTED` check exits 0 (no matches). `grep` for known credential prefixes returns nothing.

**On failure:** if the leak check finds a hit, do not edit the file in place. Delete the entire capture directory, extend the redactor regex to cover the leaked pattern category, and re-run from Step 3 or 4.

### Step 7: Classify Response Categories Before Recording

HTTP status codes carry different semantic weight in different contexts. Classify before recording so downstream `jq` filters operate on intent, not raw codes.

| Observed status | Channel context | Classification |
|---|---|---|
| 200 / 201 | Any | success |
| 401 on token-refresh endpoint | Handshake | expected handshake step |
| 401 on data endpoint | After auth | auth failure (real) |
| 404 on lazy-loaded resource | First fetch | expected miss |
| 404 on documented endpoint | After feature gate | gate-induced absence |
| 429 | Any | rate-limit (back off; do not retry tight) |
| 5xx | Any | server failure (record, do not assume) |

Add a `class` field at capture time:

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

A 401 on a token-refresh channel is not a failure — it is the first half of a handshake. Misclassifying handshake steps as failures produces false-positive findings that waste reviewer attention.

**Expected:** every line in `*.classified.jsonl` has a `class` field with a known value.

**On failure:** if classification produces many `other` entries, the table above is incomplete for this harness — extend it with one row per recurring `other` pattern before continuing analysis.

### Step 8: Persist the Capture Manifest

A capture run is reproducible only if the inputs are recorded alongside the outputs. Write a manifest:

```bash
cat > capture-manifest.json <<EOF
{
  "captured_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "harness_version": "$(harness-cli --version 2>/dev/null || echo unknown)",
  "channel": "verbose-fetch",
  "question": "Does endpoint X fire on event Y?",
  "targets": ["endpoint-X", "event-Y"],
  "files": ["session.jsonl", "session.classified.jsonl"],
  "redaction_check": "passed"
}
EOF
```

The manifest is what makes the capture diff-able against future versions.

**Expected:** `capture-manifest.json` exists, parses with `jq`, and lists every artifact file in the capture directory.

**On failure:** if the harness has no version flag, record the binary's `sha256sum` instead. An unidentified binary produces uncomparable captures.

## Validation

- [ ] Observability table built before any capture command was run
- [ ] Capture directory is git-ignored and timestamped
- [ ] Every `*.jsonl` file parses with `jq -e .` line-by-line
- [ ] Redaction leak-check returns no matches for known credential prefixes
- [ ] Each captured event has a `class` field with a known value
- [ ] `capture-manifest.json` records the harness version (or sha256), channel, and question
- [ ] The capture directory contains only the targets enumerated in Step 1 (no incidental traffic from other apps)

## Common Pitfalls

- **Capture-first, question-later**: a log nobody reads is wasted disk and wasted attention. Build the observability table first; capture only what answers a specific question.
- **Reaching for `mitmproxy` first**: outbound proxy is the most invasive channel. It requires cert trust, breaks on certificate pinning, and pollutes the harness's environment. Use it only when on-disk, transcript, verbose-fetch, and hook channels are all blocked.
- **Capturing in your primary working session**: verbose-fetch stderr bleeds into TUI rendering and can leak fragments of your other work into the capture. Always use a disposable shell.
- **"We'll redact later"**: every captured-then-redacted artifact has leaked a credential at least once. Redact at capture time or do not capture.
- **Treating 4xx as failure uniformly**: a 401 on a token-refresh channel is a handshake step, not a failure. Classify response categories per channel context (Step 7) before drawing conclusions.
- **Long-running capture for per-event targets**: a session-long process to capture three discrete events couples token state across captures and makes one bad event poison the next. Use hook-driven subprocesses for events; reserve session capture for sequences.
- **No manifest**: a JSONL file without `capture-manifest.json` is not reproducible — you cannot diff it against next month's binary if you do not know which version produced it.
- **Capturing other users' traffic**: out of scope. Wire capture is for your own account on your own machine. If a capture incidentally records another user's request, delete the capture and tighten the channel.

## Related Skills

- `monitor-binary-version-baselines` — Phase 1 of the parent methodology; produces the version baseline this skill's manifest references.
- `probe-feature-flag-state` — Phases 2-3; wire capture is one of its evidence prongs, and this skill teaches the capture half.
- `instrument-distributed-tracing` — shares the JSONL-over-wallclock philosophy; applied here to a single binary instead of a service mesh.
- `redact-for-public-disclosure` — Phase 5; this skill only covers capture-time redaction for internal use, not the publication-bar redaction needed before any capture leaves a private workspace.
