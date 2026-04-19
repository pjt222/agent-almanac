---
name: conduct-empirical-wire-capture
locale: caveman
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

Set up reproducible wire-capture harness for CLI tool outbound HTTP and telemetry. Match each observability target to cheapest channel that captures it.

## Scope and Ethics

Read this before configuring any capture.

- Wire capture is for **your own** requests against **your own** account, on **your own** machine. Capturing other users' traffic is exfiltration, not research, out of scope.
- Credentials almost always appear in raw wire output. Redact at capture time (Step 6) — never "capture now, redact later."
- Capture is *observation*, not modification. Do not use captured payloads to bypass server-side rate limits, replay another user session, or activate dark-launched capability without authorization.
- Output of this skill is internal artifact. Public publication of wire findings goes through `redact-for-public-disclosure` (Phase 5 of parent guide), not this skill.

## When Use

- Static finding (flag, endpoint reference, telemetry-event name) needs runtime confirmation it actually fires.
- Payload shape needed for client re-implementation, tracing instrumentation, or cross-version diff.
- Dark-vs-live disambiguation requires watching what binary actually sends, not what bundle suggests it might.
- Behavior changed silently between versions, want reproducible artifact to compare against future versions.

Do **not** use this skill for: version baselining (use `monitor-binary-version-baselines`), flag-state probing (use `probe-feature-flag-state`), or preparing redacted artifacts for public publication (use `redact-for-public-disclosure`).

## Inputs

- **Required**: CLI harness binary you can run locally against your own account.
- **Required**: Specific question to answer (e.g., "does endpoint X fire on event Y?", "what is payload shape for telemetry event Z?"). Capture without a question produces log nobody reads.
- **Optional**: Static findings from prior phases (marker catalog, candidate flag list, suspected endpoints) that scope capture targets.
- **Optional**: Private workspace path for capture artifacts. Default is `./captures/` — must be in `.gitignore`.

## Steps

### Step 1: Build Observability Table First

Before configuring any capture, enumerate questions you need to answer and map each to capture channel. One row per target.

| target | observable via | blocker |
|---|---|---|
| Outbound HTTP to endpoint X | verbose-fetch stderr | TUI noise pollutes terminal |
| Telemetry event Y on user action | hook-driven subprocess | requires harness hook surface |
| Token-refresh handshake | outbound HTTP proxy | cert trust required |
| Scheduled-task lifecycle event | long-running session capture | wallclock alignment |
| Local config mutation | on-disk state diff | none — cheapest channel |

Common channels, cheapest first:

- **On-disk state file mutation** — harness writes its state to known path? `diff` between snapshots is free.
- **Transcript file** — harness already writes session transcript? Parse directly. No instrumentation.
- **Verbose-fetch stderr** — bundler-provided env var (e.g., bun's `BUN_CONFIG_VERBOSE_FETCH=curl`) routes every fetch to stderr. Noisy but captures every fetch.
- **Hook-driven subprocess** — harness exposes lifecycle hooks (`UserPromptSubmit`, `Stop`, etc.)? Spawn short capture subprocess per event.
- **Long-running session capture** — one process across session, wallclock-tagged. Use for sequences.
- **Outbound HTTP proxy** — clean separation, but requires CA cert trust and breaks when harness pins certificates.

Pick cheapest channel that captures target. 3-target capture that answers one specific question beats 20-target capture that answers none.

**Got:** Observability table with one row per question, each annotated with channel, known blockers. Targets without viable channel flagged "out of scope this session."

**If fail:** Every target lands in proxy column? Table too ambitious. Trim to one or two highest-value questions, revisit lower-cost channels for them.

### Step 2: Prepare Disposable Workspace

Wire capture pollutes terminals, leaves files in unexpected places, may leak credentials into logs.

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

Confirm capture session not your primary working session — verbose-fetch and TUI rendering interfere with each other.

**Got:** Timestamped capture directory, git-ignored, separate from working session.

**If fail:** `git check-ignore` reports directory as not ignored? Fix `.gitignore` before running any capture command. Do not proceed with credentials at risk.

### Step 3: Hook-Driven Capture for Per-Event Targets

Target is discrete event (tool invocation, prompt submission, session stop)? Use harness hook surface. Spawn short-lived capture subprocess per event; do not sit in-process.

Pattern (synthetic example):

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

- No token state, no session coupling — each invocation independent.
- Failure of one capture does not contaminate next.
- Subprocess overhead acceptable because events rare (per-user-action, not per-byte).

**Got:** One JSONL line per fired event in `events.jsonl`, each well-formed JSON parseable with `jq`.

**If fail:** `jq` reports parse errors? Payload contains unescaped control chars or binary data — pipe through `jq -R` (raw input), base64-encode payload field instead.

### Step 4: Long-Running Session Capture for Sequential State

Target is sequence (multi-turn handshake, scheduled-task lifecycle, retry/backoff state machine)? One capture process across session, wallclock-tagged.

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

Wallclock prefix makes ordering unambiguous when multiple captures run concurrently. TSV (tab-separated) is intentional — survives shells that mangle JSON quoting on stderr.

Convert TSV to JSONL after session ends (Step 5), not during.

**Got:** TSV log with monotonically increasing timestamps, one stderr line per row.

**If fail:** Timestamps go backwards? Harness is buffering stderr — re-run with `stdbuf -oL -eL` or bundler equivalent line-buffer flag.

### Step 5: Normalize to JSONL

JSONL is artifact format: one JSON object per line, fields `timestamp`, `source`, `target`, `payload`. Diff-friendly, `jq`-filterable, stable across editor reloads.

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

**Got:** Every line of `*.jsonl` parses with `jq -e .`; no `BAD LINE` warnings.

**If fail:** Some lines fail validation? Source TSV had embedded tabs in payload — re-run Step 4 with different delimiter or base64-encode second field.

### Step 6: Redact at Capture Time

Strip auth headers, session IDs, bearer tokens, PII **before** writing to disk. `events.jsonl` and `session.jsonl` files should not, on first write, contain a single secret.

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

`captured-then-redacted` artifact always leaks something. Only safe pattern is `redacted-as-captured`. Discover unredacted token in finalized artifact? Treat entire capture as compromised — delete it, rotate credential, re-run.

**Got:** `LEAK DETECTED` check exits 0 (no matches). `grep` for known credential prefixes returns nothing.

**If fail:** Leak check finds hit? Do not edit file in place. Delete entire capture directory, extend redactor regex to cover leaked pattern category, re-run from Step 3 or 4.

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

Add `class` field at capture time:

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

A 401 on token-refresh channel is not failure — it is first half of handshake. Misclassifying handshake steps as failures produces false-positive findings that waste reviewer attention.

**Got:** Every line in `*.classified.jsonl` has `class` field with known value.

**If fail:** Classification produces many `other` entries? Table above incomplete for this harness — extend with one row per recurring `other` pattern before continuing analysis.

### Step 8: Persist the Capture Manifest

Capture run reproducible only if inputs recorded alongside outputs. Write manifest:

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

Manifest is what makes capture diff-able against future versions.

**Got:** `capture-manifest.json` exists, parses with `jq`, lists every artifact file in capture directory.

**If fail:** Harness has no version flag? Record binary `sha256sum` instead. Unidentified binary produces uncomparable captures.

## Checks

- [ ] Observability table built before any capture command was run
- [ ] Capture directory is git-ignored and timestamped
- [ ] Every `*.jsonl` file parses with `jq -e .` line-by-line
- [ ] Redaction leak-check returns no matches for known credential prefixes
- [ ] Each captured event has `class` field with known value
- [ ] `capture-manifest.json` records harness version (or sha256), channel, question
- [ ] Capture directory contains only targets enumerated in Step 1 (no incidental traffic from other apps)

## Pitfalls

- **Capture-first, question-later**: Log nobody reads is wasted disk and wasted attention. Build observability table first; capture only what answers specific question.
- **Reaching for `mitmproxy` first**: Outbound proxy is most invasive channel. Requires cert trust, breaks on certificate pinning, pollutes harness environment. Use it only when on-disk, transcript, verbose-fetch, and hook channels all blocked.
- **Capturing in your primary working session**: Verbose-fetch stderr bleeds into TUI rendering and can leak fragments of your other work into capture. Always use disposable shell.
- **"We'll redact later"**: Every captured-then-redacted artifact has leaked a credential at least once. Redact at capture time or do not capture.
- **Treating 4xx as failure uniformly**: 401 on token-refresh channel is handshake step, not failure. Classify response categories per channel context (Step 7) before drawing conclusions.
- **Long-running capture for per-event targets**: Session-long process to capture three discrete events couples token state across captures, makes one bad event poison next. Use hook-driven subprocesses for events; reserve session capture for sequences.
- **No manifest**: JSONL file without `capture-manifest.json` is not reproducible — cannot diff against next month's binary if you do not know which version produced it.
- **Capturing other users' traffic**: Out of scope. Wire capture is for your own account on your own machine. Capture incidentally records another user request? Delete capture, tighten channel.

## See Also

- `monitor-binary-version-baselines` — Phase 1 of parent methodology; produces version baseline this skill manifest references.
- `probe-feature-flag-state` — Phases 2-3; wire capture is one of its evidence prongs, this skill teaches capture half.
- `instrument-distributed-tracing` — shares JSONL-over-wallclock philosophy; applied here to single binary instead of service mesh.
- `redact-for-public-disclosure` — Phase 5; this skill only covers capture-time redaction for internal use, not publication-bar redaction needed before any capture leaves a private workspace.
