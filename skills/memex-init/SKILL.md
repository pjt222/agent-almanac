---
name: memex-init
description: >
  Run the memex session-init ritual at the start of a fresh session:
  load the bias-log, read the persistent-self trail in order, run the
  verification scoreboard, and surface the next slice from the docs.
  Use at the very start of any session that operates on the memex repo,
  when reconstructing context before doing work, or when an interrupted
  session needs to re-orient. NOT the `memex init` CLI command (which
  initializes the store/db) — this is the reconstruct-context ritual.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: memex
  complexity: basic
  language: multi
  tags: memex, session-init, bias-log, observability, reconstruction
---

# Initialize a memex Session

Reconstruct working context before doing any work on the memex project.
A fresh instance has no memory of prior sessions; the persistent self is
*documentary*. This ritual loads the bias-log, walks the document trail
in its authoritative order, runs the verification scoreboard, and lands
on the next slice the docs propose — not an assumed one.

## When to Use

- **At the very start of any session operating on the memex repo.** Run
  this before reading code, before planning, before any substantive work.
- **When re-orienting after an interrupted session.** Reconstruct where
  the prior instance left off from the doc trail rather than from memory.
- **When you catch yourself assuming the project state.** The docs are
  ground truth; assumptions about "where we are" are the thing this
  ritual replaces.

<!-- These triggers also appear in the description field for discovery. -->

## Inputs

- **Required**: The memex repo checked out, with cwd = repo root (a
  checkout of github.com/pjt222/memex). All doc and command paths below
  are repo-relative.
- **Required for the bias-log step**: either a registered `memex` MCP
  server in the active harness, OR (CLI fallback) a built `memex` binary
  plus `$MEMEX_STORE_PATH`, `$MEMEX_PG_URL`, and — because the CLI
  fallback uses semantic mode — `$MEMEX_EMBED_PROVIDER=voyage` +
  `$VOYAGE_API_KEY`.
- **Required for the verification scoreboard**: a Rust toolchain on
  `$PATH` (`export PATH="$HOME/.cargo/bin:$PATH"`). The live-pg leg
  additionally needs Docker plus `$MEMEX_PG_URL` and the embed key.
- **Note**: `adapters/session-init.txt` is the authoritative ritual. The
  doc order echoed in Step 2 is a convenience copy; if it ever disagrees
  with `session-init.txt`, the file wins.

## Procedure

### Step 1: Load the bias-log first

Load prior-session observations before reading anything else, so the
biases the project has already caught are in view while you read.

If a `memex` MCP server is registered, call:

```text
mcp__memex__recent_observations(limit=20)
```

CLI fallback (no MCP server). `--node-type` is **silently ignored** in
keyword mode, so use semantic mode — which needs the Voyage embed key:

```bash
memex query "bias-log" --node-type observation --mode semantic
```

**Expected:** A list of `observation` nodes — biases (anchoring,
confirmation, trust-the-DB), pace tells, and verification gaps logged by
prior instances. Read every one.

**On failure:** If the MCP tool is "not found", the server isn't
registered — fall back to the CLI. If the CLI returns 0 hits, the
extractor pass hasn't populated the store on this machine yet; run the
end-to-end smoke (CONTINUE_HERE.md §5 step 4) to populate it, or read
`docs/OBSERVATIONS.md` directly as a last resort.

### Step 2: Read the doc trail in order

`adapters/session-init.txt` is the authoritative ritual — open it and
follow it. It directs you to read these docs in this order:

1. `docs/PERSISTENT_SELF.md` — *why* the project exists (load-bearing).
2. `docs/OBSERVATIONS.md` — the bias-log / vipassana history.
3. `docs/AGENT_OPERATING_NOTES.md` — *how* to operate on the project,
   including the "verify system prompt against filesystem" rule.
4. `docs/CONTINUE_HERE.md` — *where we are* now.
5. `docs/ROADMAP.md` — *what's next* at the milestone level.

```bash
cat adapters/session-init.txt   # the authoritative ritual; follow it
```

**Expected:** After reading, you can state in one sentence each: why
memex exists, what the last shipped milestone was, and what the next one
is. The OBSERVATIONS read overlaps Step 1 — that redundancy is intended.

**On failure:** If `adapters/session-init.txt` is missing, you are not at
the memex repo root (or not in a memex checkout) — re-check cwd. If a
listed doc is missing, note the gap and continue; do not invent its
contents.

### Step 3: Run the verification scoreboard

Run the §5 verification commands from `docs/CONTINUE_HERE.md` and report
the result as a scoreboard. The compile + unit leg needs no services:

```bash
export PATH="$HOME/.cargo/bin:$PATH"
cargo check --workspace
cargo build --release -p memex-cli
cargo test --workspace          # assert exit 0 / "test result: ok"
```

Optional live-pg + Voyage leg (gated; needs Docker and the embed key):

```bash
docker start memex-pg
set -a; . ./.env; set +a
MEMEX_TEST_PG_URL=postgres://memex:memex@localhost:5433/memex \
  cargo test --workspace -- --include-ignored | grep "test result"
```

**Expected:** Each leg exits 0 and the test legs print `test result: ok`.
Counts are informational only (`~49` unit at v0.4.0, `~60` with
`--include-ignored`); they **grow per milestone**, so never treat a count
as a pass/fail threshold — assert exit 0 and `test result: ok` instead.

**On failure:** A non-zero exit or `FAILED` is a real regression — report
which leg failed and stop before doing new work. If the live-pg leg can't
reach Postgres, report the unit leg only and note the gap; do not silently
skip it.

### Step 4: Surface the next slice from the docs

Read the proposed next slice **out of** `docs/CONTINUE_HERE.md` (the
"Next milestone" section) and `docs/ROADMAP.md` — not from assumption.
Restate it back so the user can confirm or redirect.

```bash
grep -n "Next milestone" docs/CONTINUE_HERE.md
```

**Expected:** A concrete next slice quoted from the docs (e.g. the M5
watcher + ops tasks), with its definition-of-done, ready to confirm.

**On failure:** If the docs name no next slice, say so plainly and ask
the user for direction rather than inventing one.

## Validation

- [ ] The bias-log was loaded via `recent_observations` (MCP) or the
      semantic-mode CLI fallback — not skipped
- [ ] All five docs were read in the `session-init.txt` order
- [ ] The §5 verification legs exited 0 and printed `test result: ok`
      (counts reported as informational, not as a threshold)
- [ ] The proposed next slice was quoted from the docs and restated for
      confirmation
- [ ] `memex init` (the CLI store/db command) was **not** run as part of
      this ritual

## Common Pitfalls

- **Confusing this ritual with `memex init`.** `memex init` is the CLI
  command that lays out the store and runs db migrations — a one-time
  setup, destructive of a fresh store's assumptions. This skill never
  runs it. They share a word, nothing else.
- **Using keyword mode for the CLI bias-log fallback.** `--node-type` is
  silently ignored in keyword mode (CONTINUE_HERE.md §4 tech-debt), so it
  returns the wrong rows with no error. Use `--mode semantic` (or
  `hybrid`), which requires the Voyage embed key.
- **Asserting a test count as pass/fail.** Counts grow each milestone.
  Assert exit 0 and `test result: ok`; quote counts only as informational
  (`~N at v0.4.0`).
- **Reading the docs out of order.** PERSISTENT_SELF before CONTINUE_HERE:
  the *why* frames the *where-we-are*. Skipping to the roadmap loses the
  framing the prior instance reasoned from.
- **Proposing a next slice from memory.** The next slice lives in the
  docs. Inventing one re-derives state the trail already records — itself
  a signal the read was incomplete.

## Related Skills

- `memex` — the umbrella skill for agent-native shared memory; this is
  its session-start entry point.
- `memex-verify` — runs the verification scoreboard in depth; pair after
  this ritual when a fuller health check is warranted.
- `memex-wrap` — the session-close counterpart; confirms observations are
  logged (deferring to `memex-observe`) and writes the continuation trail
  this ritual reads next time.
- `read-continue-here` — generic project-state pickup; memex's
  `CONTINUE_HERE.md` is the concrete instance this ritual reads in Step 2.
- `breathe` — pair at the session boundary: breathe to release prior
  residue, then run this ritual to load the next-session priors.
