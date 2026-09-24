# repair-broken-references — Extended Examples

Progressive-disclosure companion to [SKILL.md](../SKILL.md). Everything here is index mode
(Steps 9-10): the corpus is a flat directory of markdown notes with one designated index, and an
orphan is a file the index does not link to.

The canonical reachability block lives in SKILL.md Step 9 and is deliberately **not** duplicated
here. It is byte-identical across `manage-memory`, `prune-agent-memory`,
`verify-memory-integrity`, and this skill, and `scripts/test/memory-blocks.test.js` fails the
build if any copy drifts. Paste it from SKILL.md; never retype it.

## Worked Run

An agent-memory store with 70 topic files and an index that has been compacted twice.

```text
$ # Step 9, canonical reachability block, DIR=<memory-dir>
topic files 70; linked 65
ORPHANS  5 = 7.1% of files, 12.4% of bytes
DANGLING 2 (linked, absent on disk)
  orphan   project_cli_phase1.md
  orphan   project_rust_cli_port.md
  orphan   feedback_grep_retry_loop.md
  orphan   reference_companion_repo.md
  orphan   session_2026_05_12_notes.md
  dangling project_v130_release.md
  dangling patterns_old.md
```

Read it in this order:

1. **Both denominators.** Five files is 7.1% of the store and 12.4% of its bytes — orphans skew
   large, because the entries most likely to be dropped from an index during compaction are the
   long ones. Reporting either number alone misstates the loss by a factor of nearly two.
2. **Dangling before orphan.** A dangling link is the index pointing at nothing: either the file
   was renamed (repair the link) or deleted (remove the link). It is cheap and unambiguous.
3. **Orphans last, and never automatically.** Each of the five is a file that still exists, still
   has content, and is now unreachable. The disposition is a judgment call, so run Step 10 for
   dates and then use the table below.

The two failure shapes this catches are not symmetric. A dangling link wastes a read. An orphan
loses the content entirely, silently, and a `git status` on the store shows nothing wrong.

## Disposition Table

| Finding | Evidence | Action |
|---|---|---|
| Dangling, file renamed | A same-stem file exists on disk | Repair the link to the new name |
| Dangling, file deleted | No candidate on disk | Remove the index line |
| Orphan, content still true | Verified against current project state | Re-link from the index under its topic |
| Orphan, content superseded | A newer topic file covers it | Remove the file; note the supersession in the survivor |
| Orphan, session-scoped | Names a task, branch, or date that has passed | Delete; it was never index material |
| Orphan, unclear | Nothing decides it | Re-link and mark for the next audit — an unread file costs a line, a deleted one costs the content |

The last row is deliberate. Re-linking is reversible and deletion is not, so the tie goes to
re-linking even though it grows the index.

## Degraded References

Step 9 rule 2 requires an exact filename match on a real link target. A prose mention is not
reachability — nothing follows it automatically — but it is evidence a human meant to link the
file, so report it separately rather than counting it either way.

```bash
# Degraded references: filenames mentioned in the index but not as link targets.
DIR=<memory-dir>
python3 - "$DIR" <<'PY'
import os, re, sys

d       = sys.argv[1]
text    = open(os.path.join(d, 'MEMORY.md'), 'rb').read().decode('utf-8', 'replace')
text    = re.sub(r'<!--.*?-->', '', text, flags=re.S)
linked  = {os.path.basename(m) for m in re.findall(r'\]\(([^)#\s]+\.md)', text)}
on_disk = {f for f in os.listdir(d) if f.endswith('.md') and f != 'MEMORY.md'}

for name in sorted(on_disk - linked):
    if name in text or name[:-3] in text:
        print(f"  degraded {name} (named in prose, not a link target)")
PY
```

A degraded reference stays in the orphan count. It is not reachable; it is an orphan whose repair
is one line of editing rather than a decision about content.

## Index-Mode Report Template

Replaces the source-mode report of Step 8. It records what was measured, not what was fixed,
because the caller decides dispositions.

```markdown
# Index Reachability Report

**Date**: YYYY-MM-DD
**Store**: <resolved absolute path of the directory measured>
**Index**: MEMORY.md
**Age source**: mtime (no version-control history) | git log

## Reachability

- Topic files: N
- Linked from the index: N
- Orphans: N (X% of files, Y% of bytes)
- Dangling links: N
- Degraded references: N

## Orphans

| File | Last written | Disposition | Reason |
|---|---|---|---|
| project_cli_phase1.md | 2026-02-14 | Re-link | Still accurate; dropped in compaction |
| session_2026_05_12_notes.md | 2026-05-12 | Delete | Session-scoped, superseded |

## Dangling Links

| Index line | Target | Action |
|---|---|---|
| 41 | project_v130_release.md | Repair — file renamed to project_v130.md |
| 88 | patterns_old.md | Remove — deleted deliberately |

## Caveats

- mtime measures writes, not reads. No file here is dated by when it was last useful.
- This is a reading taken when the skill last ran, not an invariant. Nothing enforces
  reachability at write time.
```

State the **resolved** store path, not the pattern it came from. A budget and an orphan count are
both perfectly accurate readings of the wrong store.

## Related

- [SKILL.md](../SKILL.md) — Steps 9-10 and the five rules the reachability block honors
- [manage-memory](../../manage-memory/SKILL.md) — Curates the index measured here
- [verify-memory-integrity](../../verify-memory-integrity/SKILL.md) — Runs reachability with the dual-cap budget check
