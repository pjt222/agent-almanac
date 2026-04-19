---
name: conduct-empirical-wire-capture
locale: caveman-ultra
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

Set up reproducible wire-capture harness for CLI tool's outbound HTTP + telemetry → match each observability target to cheapest channel that captures it.

## Scope and Ethics

Read this before configuring any capture.

- Wire capture = **your own** reqs vs. **your own** account, on **your own** machine. Capturing other users' traffic = exfiltration, not research, out of scope.
- Credentials almost always appear in raw wire out. Redact at capture time (Step 6) → never "capture now, redact later."
- Capture = *observation*, not modification. Don't use captured payloads to bypass server-side rate limits, replay another user's session, or activate dark-launched capability w/o auth.
- This skill's out = internal artifact. Public publication of wire findings goes through `redact-for-public-disclosure` (Phase 5 of parent guide), not this skill.

## Use When

- Static finding (flag, endpoint ref, telemetry-event name) needs runtime confirmation it actually fires.
- Payload shape needed for client re-impl, tracing instrumentation, or cross-version diff.
- Dark-vs-live disambiguation → watch what binary actually sends, not what bundle suggests.
- Behavior changed silently between vers → want reproducible artifact to compare vs. future vers.

Do **NOT** use for: version baselining (use `monitor-binary-version-baselines`), flag-state probing (use `probe-feature-flag-state`), or preparing redacted artifacts for public publication (use `redact-for-public-disclosure`).

## In

- **Required**: CLI harness binary runnable locally vs. own account.
- **Required**: Specific question (e.g., "does endpoint X fire on event Y?", "what payload shape for telemetry event Z?"). Capture w/o question → log nobody reads.
- **Optional**: Static findings from prior phases (marker catalog, candidate flag list, suspected endpoints) → scope capture targets.
- **Optional**: Private workspace path for capture artifacts. Default `./captures/` → must be in `.gitignore`.

## Do

### Step 1: Build Observability Table First

Before configuring any capture → enumerate questions + map each to capture channel. One row per target.

| target | observable via | blocker |
|---|---|---|
| Outbound HTTP to endpoint X | verbose-fetch stderr | TUI noise pollutes terminal |
| Telemetry event Y on user action | hook-driven subprocess | requires harness hook surface |
| Token-refresh handshake | outbound HTTP proxy | cert trust required |
| Scheduled-task lifecycle event | long-running session capture | wallclock alignment |
| Local config mutation | on-disk state diff | none — cheapest channel |

Common channels, cheapest first:

- **On-disk state file mutation** — harness writes state to known path → `diff` between snapshots = free.
- **Transcript file** — harness already writes session transcript → parse direct. No instrumentation.
- **Verbose-fetch stderr** — bundler-provided env var (e.g., bun's `BUN_CONFIG_VERBOSE_FETCH=curl`) routes every fetch to stderr. Noisy but captures every fetch.
- **Hook-driven subprocess** — harness exposes lifecycle hooks (`UserPromptSubmit`, `Stop`, etc.) → spawn short capture subprocess per event.
- **Long-running session capture** — one proc across session, wallclock-tagged. Use for sequences.
- **Outbound HTTP proxy** — clean separation, but requires CA cert trust + breaks when harness pins certs.

Pick cheapest channel capturing target. 3-target capture answering one specific question > 20-target capture answering none.

**→** Observability table w/ one row per question, each annotated w/ channel + known blockers. Targets w/o viable channel → flag "out of scope this session."

**If err:** Every target lands in proxy column → table too ambitious. Trim to 1-2 highest-value questions, revisit lower-cost channels for them.

### Step 2: Prepare Disposable Workspace

Wire capture pollutes terminals, leaves files in unexpected places, may leak credentials into logs.

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

Confirm capture session ≠ primary working session → verbose-fetch + TUI rendering interfere.

**→** Timestamped capture dir, git-ignored, separate from working session.

**If err:** `git check-ignore` reports dir not ignored → fix `.gitignore` before any capture cmd. Don't proceed w/ creds at risk.

### Step 3: Hook-Driven Capture for Per-Event Targets

Target = discrete event (tool invocation, prompt submit, session stop) → use harness's hook surface. Spawn short-lived capture subprocess per event; don't sit in-process.

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

- No token state, no session coupling → each invocation indep.
- Fail of one capture doesn't contaminate next.
- Subprocess overhead OK → events rare (per-user-action, not per-byte).

**→** One JSONL line per fired event in `events.jsonl`, each well-formed JSON parseable w/ `jq`.

**If err:** `jq` reports parse errs → payload has unescaped control chars / binary data → pipe through `jq -R` (raw in) + base64-encode payload field.

### Step 4: Long-Running Session Capture for Sequential State

Target = sequence (multi-turn handshake, scheduled-task lifecycle, retry/backoff state machine) → one capture proc across session, wallclock-tagged.

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

Wallclock prefix makes ordering unambiguous when multi captures run concurrent. TSV (tab-separated) intentional → survives shells that mangle JSON quoting on stderr.

Convert TSV → JSONL after session ends (Step 5), not during.

**→** TSV log w/ monotonic timestamps, one stderr line per row.

**If err:** Timestamps go backwards → harness buffering stderr → re-run w/ `stdbuf -oL -eL` or bundler's line-buffer flag.

### Step 5: Normalize to JSONL

JSONL = artifact format: one JSON object per line, fields `timestamp`, `source`, `target`, `payload`. Diff-friendly, `jq`-filterable, stable across editor reloads.

```bash
# Parse the TSV from Step 4 into JSONL.
awk -F'\t' '{
  printf "{\"timestamp\":\"%s\",\"source\":\"verbose-fetch\",\"target\":\"%s\",\"payload\":%s}\n",
    $1, "session", $2
}' < session.tsv | jq -c . > session.jsonl
```

Valid. every line parses:

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

**→** Every line of `*.jsonl` parses w/ `jq -e .`; no `BAD LINE` warns.

**If err:** Some lines fail valid. → source TSV had embedded tabs in payload → re-run Step 4 w/ diff delimiter or base64-encode second field.

### Step 6: Redact at Capture Time

Strip auth headers, session IDs, bearer tokens, PII **before** writing to disk. `events.jsonl` + `session.jsonl` should not, on first write, contain a single secret.

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

Post-capture, valid. nothing slipped through:

```bash
# Patterns that must not appear in any *.jsonl file.
grep -Ei 'bearer [A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' captures/ \
  && { echo "LEAK DETECTED"; exit 1; } \
  || echo "redaction clean"
```

`captured-then-redacted` artifact always leaks something. Only safe pattern = `redacted-as-captured`. Unredacted token found in finalized artifact → treat whole capture as compromised → delete, rotate credential, re-run.

**→** `LEAK DETECTED` check exits 0 (no matches). `grep` for known credential prefixes returns nothing.

**If err:** Leak check finds hit → don't edit file in place. Delete whole capture dir, extend redactor regex to cover leaked pattern category, re-run from Step 3 or 4.

### Step 7: Classify Response Categories Before Recording

HTTP status codes carry diff semantic weight in diff contexts. Classify before recording → downstream `jq` filters operate on intent, not raw codes.

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

401 on token-refresh channel ≠ failure → first half of handshake. Misclassifying handshake steps as failures produces false-positive findings wasting reviewer attention.

**→** Every line in `*.classified.jsonl` has `class` field w/ known value.

**If err:** Classification produces many `other` entries → table above incomplete for this harness → extend w/ one row per recurring `other` pattern before analysis.

### Step 8: Persist Capture Manifest

Capture run reproducible only if inputs recorded alongside outs. Write manifest:

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

Manifest = what makes capture diff-able vs. future vers.

**→** `capture-manifest.json` exists, parses w/ `jq`, lists every artifact file in capture dir.

**If err:** Harness has no ver flag → record binary's `sha256sum` instead. Unidentified binary → uncomparable captures.

## Check

- [ ] Observability table built before any capture cmd run
- [ ] Capture dir git-ignored + timestamped
- [ ] Every `*.jsonl` file parses w/ `jq -e .` line-by-line
- [ ] Redaction leak-check returns no matches for known credential prefixes
- [ ] Each captured event has `class` field w/ known value
- [ ] `capture-manifest.json` records harness ver (or sha256), channel, question
- [ ] Capture dir contains only targets enumerated in Step 1 (no incidental traffic from other apps)

## Traps

- **Capture-first, question-later**: Log nobody reads = wasted disk + attention. Build observability table first; capture only what answers specific question.
- **Reach for `mitmproxy` first**: Outbound proxy = most invasive channel. Requires cert trust, breaks on cert pinning, pollutes harness env. Use only when on-disk, transcript, verbose-fetch, hook channels all blocked.
- **Capture in primary working session**: Verbose-fetch stderr bleeds into TUI rendering → can leak fragments of other work into capture. Always use disposable shell.
- **"We'll redact later"**: Every captured-then-redacted artifact has leaked credential at least once. Redact at capture time or don't capture.
- **Treat 4xx as fail uniformly**: 401 on token-refresh channel = handshake step, not failure. Classify response categories per channel context (Step 7) before drawing conclusions.
- **Long-running capture for per-event targets**: Session-long proc to capture 3 discrete events couples token state across captures → one bad event poisons next. Use hook-driven subprocesses for events; reserve session capture for sequences.
- **No manifest**: JSONL file w/o `capture-manifest.json` not reproducible → can't diff vs. next month's binary if you don't know which ver produced it.
- **Capture other users' traffic**: Out of scope. Wire capture = own account on own machine. Capture incidentally records another user's req → delete capture + tighten channel.

## →

- `monitor-binary-version-baselines` — Phase 1 parent methodology; produces version baseline this skill's manifest references.
- `probe-feature-flag-state` — Phases 2-3; wire capture = one of its evidence prongs, this skill teaches capture half.
- `instrument-distributed-tracing` — shares JSONL-over-wallclock philosophy; applied here to single binary vs. service mesh.
- `redact-for-public-disclosure` — Phase 5; this skill covers only capture-time redaction for internal use, not publication-bar redaction needed before any capture leaves private workspace.
