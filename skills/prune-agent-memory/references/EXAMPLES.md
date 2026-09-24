# Prune Agent Memory — Extended Examples

Templates that are too long for `SKILL.md`. Referenced from Step 4 (withdrawal) and Step 7 (audit trail).


## Step 4: Tombstone file

A tombstone is the withdrawn entry's body, moved out of the index's reach but not off disk. It lives at `<memory-dir>/deaccessioned/<original-name>.md`. The header is the only thing added; the body below it is preserved verbatim, including its original frontmatter if it had any.

### Header fields

| Field | Required | Meaning |
|---|---|---|
| `deaccessioned_at` | yes | ISO 8601 date of the withdrawal |
| `reason` | yes | The Step 4 decision-tree rule that fired, in plain words — not the rule number alone |
| `superseded_by` | if inoculated | Path to the SUPERSEDED counter-memory written in Step 5, or `N/A` |
| `register_id` | yes | The identifier of the register row in the pruning log. The register finds the body through this field; a tombstone without it is an orphan with a date on it |

### Worked tombstone

```markdown
---
deaccessioned_at: 2026-08-23
reason: Count drift — memory claimed 280 SKILL.md files, registry has 310
superseded_by: N/A
register_id: 2026-08-23-02
---

<!-- Original body preserved verbatim below this line -->

## Skill corpus

- skills/ has 280 SKILL.md files across 52 domains
- The flat directory structure was chosen over nesting so that discovery
  symlinks resolve in one hop
```

Note that the second bullet is the reason this entry was withdrawn rather than deleted: the count drifted, but the rationale beneath it did not, and a one-line register reason would not have preserved it. When a tombstone turns out to contain a still-true fact like this, the correct follow-up is to re-accession that fact as a fresh entry — not to restore the whole tombstone, which would reintroduce the stale count.


## Step 7: Pruning log with register

The log lives at `<memory-dir>/pruning-log.md`, or is appended to MEMORY.md when only one or two entries were withdrawn. Use plain markdown, never an HTML comment: block-level comments are stripped before the index reaches the model, so a log hidden in one is written into a void.

```markdown
## Pruning Log

### 2026-08-23 Audit
- **Entries audited**: 134
- **Entries withdrawn**: 9 (6.7%)
- **Entries updated**: 4
- **Snapshot manifest**: <snapshot-dir>/MANIFEST.sha256
- **Staleness found**: count drift (3), path drift after the repo rename (2)
- **Fidelity failures**: 1 contradiction against CLAUDE.md
- **Protected**: architecture decisions, user identity preferences, rename records

#### Deaccession register
| register_id | Entry (summary) | Type | Reason | Tombstone | superseded_by |
|---|---|---|---|---|---|
| 2026-08-23-01 | "Currently working on issue #42" | Ephemeral | Session-specific, stale by next session | deaccessioned/ephemeral_issue_42.md | — |
| 2026-08-23-02 | "skills/ has 280 SKILL.md files" | Project | Count drift: registry has 310 | deaccessioned/project_skill_count.md | — |
| 2026-08-23-03 | "Use acquaint::mcp_session()" | Pattern | Package renamed to mcptools | deaccessioned/pattern_acquaint.md | superseded_acquaint.md |
```

Three properties make this register usable rather than decorative:

- **Every row resolves.** `register_id` in the row equals `register_id` in the tombstone header, and the tombstone path in the row exists on disk. A row that resolves to nothing means a withdrawal was really a deletion — treat it as a finding, not a typo.
- **The reason is a sentence, not a code.** "Count drift" alone does not tell a future reader whether the entry was wrong or merely outdated.
- **Rows are never summarized away.** Prose sections of the log can be collapsed once old ("2025: 3 audits, 47 entries withdrawn"); a collapsed row strands the body it points at.


## Step 5 and Step 4 together: the three artifacts

A withdraw + inoculate outcome produces three files, and the register row is what ties them together:

| Artifact | Location | In retrieval? | Holds |
|---|---|---|---|
| SUPERSEDED counter-memory | `<memory-dir>/superseded_<id>.md` | yes | The lesson — do not re-derive this |
| Tombstone | `<memory-dir>/deaccessioned/<name>.md` | no | The content — the original body, verbatim |
| Register row | `<memory-dir>/pruning-log.md` | no (read on demand) | The link between the two, plus the reason |

The counter-memory stays reachable from the index on purpose, so that it surfaces when a similar signal arrives. The tombstone stays unreachable on purpose, so that withdrawn content does not compete for index budget. The reachability scan in Step 9 reads only the top level of the memory directory, so it sees the counter-memory and correctly ignores the tombstone.
