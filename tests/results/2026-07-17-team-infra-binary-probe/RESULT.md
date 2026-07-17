## Run: 2026-07-17-team-infra-binary-probe

**Observer**: Claude (Opus 4.8, ordinary interactive Claude Code session) | **Issue**: #355 | **Relates**: #337, #352

### Objective

Empirically verify — not merely assert — the interactive team-infrastructure contract that #337 reconciled across the almanac's team docs. That contract was *asserted* verified against Claude Code binary **v2.1.202** (2026-07-07); the provenance was an assertion, not a captured demonstration. This run re-verifies it against the currently-installed binary and puts the capture on record.

### Environment

| Field | Value |
|-------|-------|
| Binary | Claude Code **v2.1.212** (`claude --version`) |
| Binary path | `/home/phtho/.local/bin/claude` |
| Session type | Ordinary interactive session (the one running this capture) |
| Date | 2026-07-17 |
| Contract source | `CLAUDE.md` team-activation note; `teams/` docs; #337 / #352 reconciliation |

Note: v2.1.212 is **10 patch releases newer** than the pinned v2.1.202, which is precisely why #355's AC calls for a re-probe.

### Probes and Captures

All probes run in this interactive session via the `ToolSearch` deferred-tool loader and the live tool schemas.

| # | Probe | Expected (contract) | Observed on v2.1.212 | Verdict |
|---|-------|---------------------|----------------------|---------|
| 1 | `ToolSearch("select:SendMessage")` | surfaces | surfaced — full `SendMessage` schema (agent-to-agent messaging within the implicit team) | PASS |
| 2 | `ToolSearch("select:TaskCreate")` | surfaces | surfaced — full `TaskCreate` schema | PASS |
| 3 | `ToolSearch("select:TeamCreate,TeamDelete")` | returns nothing | `No matching deferred tools found` | PASS |
| 4 | `ToolSearch("team create roster coordinate members")` (broad keyword) | no Team\* management tool | surfaced `TaskCreate` / `SendMessage` / `CronCreate` / worktree + design tools — **no `TeamCreate` / `TeamDelete` / any Team\* management tool at all** | PASS |
| 5 | Agent-tool `team_name` parameter | deprecated / ignored; single implicit team | live `Agent` schema: *"Deprecated; ignored. The session has a single implicit team"* | PASS |

**Corroborating evidence:** the deferred-tools list injected at session start enumerates `SendMessage, TaskCreate, TaskGet, TaskList, TaskOutput, TaskStop, TaskUpdate` but **not** `TeamCreate` / `TeamDelete` — independently consistent with probes 3 and 4.

### Verdict

The interactive team-infrastructure contract **holds unchanged on v2.1.212**:

- Single implicit team; the `Agent` tool (`subagent_type`), `SendMessage`, and the `Task*` tools are available.
- `TeamCreate` / `TeamDelete` are gated out of the ordinary interactive surface — absent under both exact `select:` and a broad keyword search.
- `team_name` is deprecated / ignored per the live `Agent` schema.

No behavioral drift between v2.1.202 and v2.1.212 → **no re-reconciliation follow-up required** (AC bullet 4 satisfied).

### Acceptance Criteria (#355)

- [x] `select:SendMessage` and `select:TaskCreate` surface the tools; `select:TeamCreate` returns nothing. (Probes 1–4)
- [x] `team_name` confirmed ignored / "single implicit team". (Probe 5)
- [x] Binary version recorded (v2.1.212); this capture linked from `CLAUDE.md`'s "verified against" note.
- [x] Behavior does not differ on the newer binary → no follow-up opened.

### Reproduce

```text
claude --version                              # -> 2.1.212 (Claude Code)

# In an ordinary interactive Claude Code session:
ToolSearch("select:SendMessage")              # surfaces the SendMessage schema
ToolSearch("select:TaskCreate")               # surfaces the TaskCreate schema
ToolSearch("select:TeamCreate,TeamDelete")    # "No matching deferred tools found"
ToolSearch("team create roster coordinate members")   # no Team* management tool

# Inspect the Agent tool schema's `team_name` field
#   -> "Deprecated; ignored. The session has a single implicit team"
```

### Caveats

- This capture covers the **interactive** surface only. The contract's FleetView / cloud fallback (where `TeamCreate` may surface as an environment-specific fallback) is **not** exercised here — it remains an asserted, environment-specific claim, out of reach from an ordinary interactive session.
- `team_name` is confirmed *documented-as-ignored* via the live schema. A behavioral demonstration (spawning an `Agent` with `team_name` set and observing no effect) was deliberately not run, to avoid unnecessary subagent side effects; the schema documentation is treated as the binary's own authoritative statement.
