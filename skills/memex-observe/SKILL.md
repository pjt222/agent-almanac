---
name: memex-observe
description: >
  Log a bias-log / vipassana observation to the memex store the moment a
  reasoning pattern surfaces, mid-session or at close. Use when you catch a
  bias in your own reasoning (anchoring, confirmation, trust-the-summary),
  when a pace tell or verification gap appears, or when meditate/observe
  produces a reflection worth persisting across sessions. Primary path pipes
  the body to `memex add` over stdin (`--title` required) then runs the
  `meditate-vipassana` extractor to make it queryable; secondary path
  appends a numbered bullet to `docs/OBSERVATIONS.md`.
license: MIT
allowed-tools: Read Edit Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: memex
  complexity: basic
  language: multi
  tags: memex, observation, bias-log, vipassana, memory
---

# Log a Memex Observation

Capture a bias-log / vipassana reflection — a pattern you noticed in your own
reasoning — into the canonical memex store while the context is still fresh.
This is the focused wrapper for the umbrella `memex` skill's "log an
observation" step: use it when the task is purely *record this bias*, not the
full session-start-to-close flow.

## When to Use

- **Immediately when a bias surfaces in your reasoning.** Anchoring on an
  early decision, confirming a hypothesis instead of testing it, trusting a
  summary over source truth — log it the moment you catch it, not at session
  end where it is reconstructed from memory and loses specificity.
- **When a pace tell or verification gap appears.** Rushing past a confusing
  measurement, re-deriving something that already exists, skipping a check
  you know matters.
- **At session close, after `meditate` or `observe`.** Either reflection
  skill can surface a new pattern worth persisting; this skill deposits it.
- **When backfilling.** Several observations accumulated in notes and need to
  land in the canonical store in one pass — use the secondary path.

## Inputs

- **Required**: The memex repo checked out (a checkout of
  `github.com/pjt222/memex`) with **cwd = repo root**. The `extract` step
  defaults its registry path to `extractors/sources.yml` relative to cwd.
- **Required**: `$MEMEX_STORE_PATH` set (every `memex` command hard-errors
  without it).
- **Required for the db write**: `$MEMEX_PG_URL` set, and a running Postgres.
  Pass `--no-db` to skip the db and write only the markdown store.
- **Required**: a built binary — `cargo build --release -p memex-cli`
  produces `./target/release/memex` (not on `PATH` by default).
- **Optional**: `$MEMEX_EMBED_PROVIDER=voyage` + `$VOYAGE_API_KEY` if you
  intend to query the observation back via semantic/hybrid search afterward.

## Procedure

### Step 1: Shape the observation body

Read the authoritative "Two paths to add an observation" block in
`docs/OBSERVATIONS.md` (lines 10-21) and the existing entries below it for
voice. An observation has three parts: what the bias was, what to do next
time, and where it came from. The shape (example, current as of v0.4.0;
`docs/OBSERVATIONS.md` is the source of truth and is parsed by
`crates/memex-extract/src/meditate_vipassana.rs`):

```text
<Description of the bias as it surfaced>. Mitigation: <what to do next time>. Origin: <date> + <context>.
```

**Expected:** A one-to-few-sentence body ending in a `Mitigation:` clause and
an `Origin:` clause. A short bias name (the `--title`) distinct from the body.

**On failure:** If you cannot name the mitigation, the observation is not yet
ripe — keep observing. A bias with no "what to do next time" is a complaint,
not a logged pattern.

### Step 2 (Path A, primary): Add via the CLI over stdin

The body is **read from stdin** and `--title` is **required** (there is no
default). Pipe the body in:

```bash
echo "<body>. Mitigation: <...>. Origin: <date> + <context>." \
  | ./target/release/memex add \
      --type observation \
      --title "<short bias name>" \
      --tags bias-log,vipassana
```

Add `--no-db` to write only the markdown store (skips the `$MEMEX_PG_URL`
requirement). A concrete example:

```bash
echo "Anchored on the first store layout and never re-opened it after scope grew. Mitigation: schedule a re-check beat at the next milestone boundary. Origin: 2026-06-17 + M5 watcher scoping." \
  | ./target/release/memex add \
      --type observation \
      --title "Anchoring on initial store layout" \
      --tags bias-log,vipassana
```

**Expected:** The command exits 0 and prints the new node's UUID and store
path (tab-separated). The entry now exists in the store (and the db, unless
`--no-db`).

**On failure:** `"$MEMEX_STORE_PATH not set"` → export it. A db connection
error → export `$MEMEX_PG_URL` and confirm Postgres is up, or re-run with
`--no-db`. `"--title is required"` → supply `--title`; it has no default.
Empty/hung on stdin → you did not pipe a body; `memex add` blocks waiting for
stdin.

### Step 3 (Path A, primary): Make it queryable

The `add` deposits the node, but the vipassana index is rebuilt by the
extractor. Run it from the repo root (the command is **cwd-sensitive** — the
`--registry` default is `extractors/sources.yml` relative to cwd):

```bash
./target/release/memex extract meditate-vipassana --registry extractors/sources.yml
```

`meditate-vipassana` is the **extractor** name; `extract` matches registry
entries on their `extractor:` field, so this re-runs the `observations`
source. Use `--dry-run` first to preview without writing.

**Expected:** Exits 0; prints extraction stats (nodes/edges touched). The
observation is now queryable, e.g.
`./target/release/memex query "bias-log" --node-type observation --mode semantic`.

**On failure:** `"no registry entries match extractor meditate-vipassana"` →
you are not at the repo root, or passed the wrong `--registry`; `cd` to the
repo root and pass `--registry extractors/sources.yml` explicitly. Semantic
query returns nothing → embeddings are not configured; set
`$MEMEX_EMBED_PROVIDER=voyage` + `$VOYAGE_API_KEY`, or query with
`--mode keyword` (but note `--node-type` is silently ignored in keyword mode).

### Step 4 (Path B, secondary): Append a numbered bullet

For batch backfill, or when you prefer editing the canonical markdown
directly, append to the `## Vipassana observations` block in
`docs/OBSERVATIONS.md`. Numbering is **monotonic**: read the current maximum
entry number (9 at v0.4.0) and use `max + 1`. The bullet shape:

```text
N. **Title.** body. Mitigation: <what to do next time>. Origin: <date> + <context>.
```

Then run the extractor (Step 3) to index the new bullet into the store and db.

**Expected:** A new entry numbered one above the prior maximum, ending in
`Mitigation:` and `Origin:` clauses, indexed by the Step 3 extract.

**On failure:** Extractor skips your bullet → the parser only accepts entries
under `## Vipassana observations`, `## Bias log`, `## Bias-log observations`,
or `## Vipassana` (case-insensitive), in the `N. **Title.** ...` shape;
confirm the heading and the bold-title marker. Duplicate or non-monotonic
number → renumber so the sequence has no gaps or repeats.

## Validation

- [ ] The body ends with a `Mitigation:` clause and an `Origin:` clause
- [ ] Path A: `memex add` exited 0 and printed a UUID; `--title` was supplied
- [ ] Path A: `memex extract meditate-vipassana` exited 0 after the add
- [ ] Path B: the new bullet number is exactly the prior maximum + 1, with no
      gaps or repeats, under a parser-recognized heading
- [ ] The observation describes the agent's own reasoning pattern, not a
      reusable architectural fact (that belongs in a `concept` node)
- [ ] The observation is logged before session end, not silently dropped

## Common Pitfalls

- **Forgetting stdin.** `memex add` reads the body from stdin and blocks if
  nothing is piped. Always `echo "..." | memex add ...` (or redirect a file);
  there is no `--body` flag.
- **Omitting `--title`.** It is required and has no default. The short bias
  name is the title; the full context is the piped body.
- **Running `extract` from the wrong directory.** `--registry` defaults to
  `extractors/sources.yml` relative to cwd. Run from the repo root or pass
  `--registry` explicitly, or the extractor finds no entries.
- **Confusing this with `memex init`.** `memex init` is CLI store/db setup —
  it is **not** part of logging an observation and **not** the `memex-init`
  session ritual. Never run `memex init` here.
- **Logging at session end only.** Biases caught at close are reconstructed
  from memory and lose specificity. Log them the moment they surface.
- **Logging a concept as an observation.** Observations are about *your
  reasoning patterns*. A reusable fact about the system is a `concept` node.
- **Expecting `--node-type` to filter keyword queries.** It is silently
  ignored in `keyword` mode (tracked tech-debt); only `semantic`/`hybrid`
  honor it, and those need embeddings configured.

## Related Skills

- `memex` — the umbrella skill; this is the focused wrapper for its
  "log an observation" step. Use the umbrella for the full session flow.
- `memex-wrap` — session-close counterpart; flushes mid-session observations
  to the canonical store and verifies the trail before handoff.
- `meditate` — full reflective close; its vipassana output is exactly what
  this skill persists.
- `observe` — sustained neutral pattern recognition; when it surfaces a
  recurring reasoning pattern, log it here.
