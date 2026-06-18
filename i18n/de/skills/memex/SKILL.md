---
name: memex
description: >
  Cross-session shared memory for agents. Use at session start to load the
  persistent bias-log via `mcp__memex__recent_observations`, mid-session
  to search prior context with `mcp__memex__search`, and immediately when
  a bias surfaces to log a new `observation` via `mcp__memex__add`. The
  six-layer reconstruction trail (raw → embedded → indexed → graphed →
  curated → reflexive) means memex stores facts AND the agent's own
  reasoning patterns across sessions. Prefer querying memex before
  re-deriving prior architectural decisions; re-derivation is itself
  evidence that the trail is incomplete.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "0.4.0"
  domain: general
  complexity: basic
  language: multi
  tags: memory, observability, vipassana, mcp, bias-log
  locale: de
  source_locale: en
  source_commit: a4ae3ac7
  translator: "Claude + human review"
  translation_date: "2026-05-22"
---

# Memex

Agent-native shared memory. Postgres + pgvector index over a canonical
markdown store, exposed over MCP. Lives at https://github.com/pjt222/memex.

## When to Use

- **At session start, always.** Call `mcp__memex__recent_observations`
  before substantive work. Loads the bias-log from prior sessions.
- **Mid-session, when about to make a non-trivial decision.** Call
  `mcp__memex__search "<topic>"` to check whether the project has
  converged on this before.
- **Immediately when a bias surfaces in your own reasoning.** Log an
  `observation` via `mcp__memex__add` while the context is fresh. Do
  NOT wait for session end.
- **When you catch yourself re-deriving something.** Re-derivation
  IS the signal that the trail is incomplete; capture the gap as an
  observation and link to whatever you re-derived.

## Inputs

- **Required**: A registered `memex` MCP server in the active harness.
  Verify with `claude mcp list | grep memex` (Claude Code) or the
  equivalent in your harness.
- **Required**: `$MEMEX_PG_URL` and `$MEMEX_STORE_PATH` in the
  server's environment.
- **Optional**: `$MEMEX_EMBED_PROVIDER=voyage` + `$VOYAGE_API_KEY`
  for semantic / hybrid search. Without these, `mode=keyword` still
  works.

## Procedure

### Step 1: Load the bias-log

Before any substantive work in a fresh session, call:

```text
mcp__memex__recent_observations(limit=20)
```

Read every returned entry. Each one is a pattern the agent (you, or a
prior instance) noticed in its own reasoning. Recurring patterns are
the most valuable; transient ones are still cheap to skim.

**Expected:** 5–30 observations covering biases (availability,
confirmation, anchoring), pace tells (rushing past confusing
measurements), and verification gaps (trusting summaries over source
truth).

**On failure:** If the call fails with "tool not found", the MCP
server isn't registered; run `adapters/claude-code/install.sh` (or
the per-harness equivalent) from the memex repo first.

### Step 2: Search before deriving

When a non-trivial decision approaches (architectural, naming,
algorithmic), search first:

```text
mcp__memex__search(query="<topic>", mode="hybrid", k=10)
```

For exact-wording lookups use `mode=keyword`. For purely conceptual
queries (topic unlikely to share tokens with indexed text) use
`mode=semantic`. Optional `node_type` filter restricts to one type
(e.g. `observation`).

**Expected:** 0–10 hits. Even 0 hits is useful — it tells you the
trail doesn't cover this decision, so your present reasoning becomes
the canonical record.

### Step 3: Log observations mid-session

When you notice a bias in your own reasoning:

```text
mcp__memex__add(
  node_type="observation",
  title="<short bias name>",
  body="<context, mitigation, origin date>",
  tags=["bias-log", "vipassana"]
)
```

Body convention (mirroring `docs/OBSERVATIONS.md` in the memex repo):

> `<Description of the bias as it surfaced>. Mitigation: <what to do
> next time>. Origin: <date> + <context>.`

### Step 4: Surface unknowns

If `recent_observations` is empty (fresh memex install), or
`search` returns nothing on a topic that clearly should have
coverage, that's a documentary trail gap. Either:

- Backfill: write the missing observations into the body of the next
  session-close `## Vipassana observations` block in the project's
  `OBSERVATIONS.md`, then `memex extract meditate-vipassana`.
- Or use `mcp__memex__add` directly during the session to deposit
  the entry into the canonical store on the spot.

## Validation

- [ ] `mcp__memex__recent_observations` returns ≥ 0 entries (call
      succeeded, not "tool not found")
- [ ] Each substantive decision in the session is preceded by either
      a `mcp__memex__search` call or an explicit "no prior context
      to check" note
- [ ] New biases noticed during the session are logged via
      `mcp__memex__add` before session end, not silently dropped
- [ ] At session end, the agent has either committed new bias entries
      to `docs/OBSERVATIONS.md` or confirmed there are none worth
      logging

## Common Pitfalls

- **Skipping the session-start call.** The single highest-value
  use of memex. Skipping it is the strongest tell that the agent is
  treating each session as starting from scratch.
- **Logging at session end only.** Biases caught at session end are
  reconstructed from memory and lose specificity. Log them
  immediately when they surface.
- **Logging an observation that's actually a concept.** Bias-log
  entries are about the agent's own reasoning patterns. Reusable
  architectural facts belong in `concept` nodes.
- **Trusting search results over reading them.** A title that
  matches your query isn't proof the body answers it. Fetch the
  full body with `mcp__memex__get` when in doubt.
- **Pipelining dependent MCP calls in one session.** rmcp dispatches
  tool calls concurrently. If a later call depends on a write from
  an earlier call (add → link → neighbors), await each response
  before issuing the next.

## Related Skills

- `breathe` — pair with memex at session boundaries: breathe to
  release prior-session residue, then `recent_observations` to load
  the next-session priors.
- `meditate` — full reflective close; outputs new observations
  worth logging via `mcp__memex__add`.
- `read-continue-here` — complementary; loads project-state
  pickup doc. Memex loads cross-project bias-log; CONTINUE_HERE
  loads project-specific milestone state.
