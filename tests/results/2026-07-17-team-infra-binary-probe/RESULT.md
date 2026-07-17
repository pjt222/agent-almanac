## Run: 2026-07-17-team-infra-binary-probe

**Observer**: Claude (Opus 4.8, interactive Claude Code session) | **Issue**: #355 | **Relates**: #337, #352, #360

### Objective

Put the interactive team-infrastructure contract that #337 reconciled across the almanac's team docs on record with a **reproducible, version-stamped probe**, rather than the bare assertion it previously rested on. This run records the exact queries and their observed outputs so any future session can independently re-run them against a known binary version. (Epistemic status: the observer is the model, not a raw external log — this is a structured, reproducible self-report, a real improvement over an unqualified "verified" note, not an independently captured wire trace.)

### Environment

| Field | Value |
|-------|-------|
| Binary | Claude Code **v2.1.212** (`claude --version`) |
| Binary path | `/home/phtho/.local/bin/claude` |
| Session type | Interactive Claude Code session (the one running this capture) |
| Launch metadata | **Not independently captured** — permission-mode and any non-default launch flags are not observable from within the session. The "interactive" characterization rests on the standard deferred-tool surface observed below, not on captured launch metadata (disclosed limitation). |
| Date | 2026-07-17 |
| Contract source | `CLAUDE.md` team-activation note; `teams/` docs; #337 / #352 reconciliation |

Note: v2.1.212 is **10 patch releases newer** than the pinned v2.1.202, which is why #355's AC calls for a re-probe.

### Probes and Captures

All probes run in this interactive session via the `ToolSearch` deferred-tool loader and the live tool schemas. Load-bearing result strings are quoted verbatim.

| # | Probe | Expected (contract) | Observed on v2.1.212 | Verdict |
|---|-------|---------------------|----------------------|---------|
| 1 | `ToolSearch("select:SendMessage")` | surfaces | surfaced — full `SendMessage` schema (agent-to-agent messaging within the implicit team) | PASS |
| 2 | `ToolSearch("select:TaskCreate")` | surfaces | surfaced — full `TaskCreate` schema | PASS |
| 3 | `ToolSearch("select:TeamCreate")` | returns nothing | `No matching deferred tools found` | PASS |
| 3b | `ToolSearch("select:TeamCreate,TeamDelete")` | returns nothing | `No matching deferred tools found` | PASS |
| 4 | `ToolSearch("team create roster coordinate members")` (broad keyword) | no Team\* management tool | surfaced `TaskCreate` / `SendMessage` / `CronCreate` / worktree + design tools — **no `TeamCreate` / `TeamDelete` / any Team\* management tool** | PASS |
| 5 | Agent-tool `team_name` parameter (schema text) | deprecated / ignored; single implicit team | live `Agent` schema reads: *"Deprecated; ignored. The session has a single implicit team"* | PASS (documented) |

**Corroborating (not independent):** the deferred-tools list injected at session start enumerates `SendMessage, TaskCreate, TaskGet, TaskList, TaskOutput, TaskStop, TaskUpdate` but not `TeamCreate` / `TeamDelete`. This is the same deferred-tool registry surfaced a second way, so it corroborates probes 3–4 rather than serving as an independent source.

### Verdict

On the **interactive tool surface** of v2.1.212, the contract is satisfied — no change vs. the (asserted) v2.1.202 baseline:

- Single implicit team: the `Agent` tool (`subagent_type`), `SendMessage`, and the `Task*` tools are present.
- `TeamCreate` / `TeamDelete` are absent from the ordinary interactive surface under both exact `select:` (singular and combined) and a broad keyword search.
- `team_name` is **documented** as deprecated / ignored in the live `Agent` schema (schema-text evidence; a runtime "ignored" demonstration was not run — see Caveats).

This is a surface-and-schema result, not a runtime-behavior measurement, and v2.1.202 was itself never captured — so this is stated as "v2.1.212 independently satisfies the interactive contract," not as a measured A→B delta. No change to the interactive tool surface → **no re-reconciliation of the docs is warranted.**

### Acceptance Criteria (#355)

- [x] `select:SendMessage` and `select:TaskCreate` surface the tools; `select:TeamCreate` (singular and combined) returns nothing. (Probes 1–4)
- [x] `team_name` confirmed **documented as** ignored / "single implicit team" via the live schema; a behavioral demonstration is deferred (see Caveats / #360). (Probe 5)
- [x] Binary version recorded (v2.1.212); this capture linked from `CLAUDE.md`'s "verified against" note.
- [x] Interactive tool surface does not differ from the asserted baseline → no docs re-reconciliation opened. (Deferred non-interactive probes tracked in #360.)

### Reproduce

```text
claude --version                              # -> 2.1.212 (Claude Code)

# In an interactive Claude Code session:
ToolSearch("select:SendMessage")              # surfaces the SendMessage schema
ToolSearch("select:TaskCreate")               # surfaces the TaskCreate schema
ToolSearch("select:TeamCreate")               # "No matching deferred tools found"
ToolSearch("select:TeamCreate,TeamDelete")    # "No matching deferred tools found"
ToolSearch("team create roster coordinate members")   # no Team* management tool

# Inspect the Agent tool schema's `team_name` field
#   -> "Deprecated; ignored. The session has a single implicit team"
```

### Caveats and deferred probes (tracked in #360)

- **Interactive surface only.** The contract's FleetView / cloud fallback — where `TeamCreate` may surface as an environment-specific fallback — is **not** exercised here and remains an asserted, environment-specific claim.
- **`team_name` is documented-as-ignored, not demonstrated-as-ignored.** The behavioral demo (spawn an `Agent` with `team_name` set and observe no effect) was deliberately not run, to avoid unnecessary subagent side effects; the schema text is treated as the binary's own authoritative statement.
- **Launch metadata not captured** (see Environment). If tool gating can vary with permission-mode or experimental flags, this capture does not rule that out.
