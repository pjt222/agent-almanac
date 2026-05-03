---
name: write-continue-here
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write a CONTINUE_HERE.md file capturing current session state so a fresh
  Claude Code session can pick up where this one left off. Covers assessing
  recent work, structuring the continuation file with objective, completed,
  in-progress, next-steps, and context sections, and verifying the file is
  actionable. Use when ending a session with unfinished work, handing off
  context between sessions, or preserving task state that git alone cannot
  capture.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, write
---

# Write Continue Here

Write structured continuation file → next sess starts w/ full ctx.

## Use When

- Ending sess w/ work in progress
- Hand off complex task across sess
- Preserve intent, failed approaches, next steps git can't capture
- Pre-close Claude Code mid-task

## In

- **Required**: Active sess w/ recent work to summarize
- **Optional**: Specific instructions on what to emphasize

## Do

### Step 1: Assess State

Gather facts:

```bash
git log --oneline -5
git status
git diff --stat
```

Review conv ctx: objective, done, partial, tried+failed, decisions.

**Got:** Clear task state — done, in-progress, next steps.

**If err:** Not in repo → skip git. File still captures conv ctx + task state.

### Step 2: Write CONTINUE_HERE.md

Write to project root w/ structure below. Every section actionable, no placeholders.

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: current-branch-name

## Objective
One-paragraph description of what we are trying to accomplish and why.

## Completed
- [x] Finished item with key file paths (e.g., `src/feature.R`)
- [x] Decisions made and their rationale

## In Progress
- [ ] Partially complete work — describe current state (branch, file:line)
- [ ] Known issues with partial work

## Next Steps
1. Immediate next action (most important)
2. Subsequent actions in priority order
3. **[USER]** Items needing user input or decision

## Context
- Failed approaches and why they did not work
- Key constraints or trade-offs discovered
- Relevant issue/PR links
```

Guidelines:
- **Objective**: WHY → git log shows what changed, not why
- **Completed**: Mark clearly done → prevent re-work
- **In Progress**: Highest-value section → partial state hardest to reconstruct
- **Next Steps**: Number by priority. User-dep → prefix `**[USER]**`
- **Context**: Negative space → tried+rejected, why

**Got:** CONTINUE_HERE.md at project root, all 5 sections w/ real content. Timestamp + branch accurate.

**If err:** Write fails → check perms. Create in project root (same dir as `.git/`). Verify `.gitignore` has `CONTINUE_HERE.md` → if not, add.

### Step 3: Verify

Read back CONTINUE_HERE.md, confirm:
- Timestamp current (last few min)
- Branch matches `git branch --show-current`
- All 5 sections real content (no placeholders)
- Next Steps numbered + actionable
- In Progress items specific enough to resume

**Got:** Reads as clear actionable handoff → fresh sess can resume.

**If err:** Edit placeholder/vague sections. Each must pass: "Could fresh sess act w/o clarifying?"

## Check

- [ ] CONTINUE_HERE.md at project root
- [ ] All 5 sections real content (no placeholders)
- [ ] Timestamp + branch accurate
- [ ] `.gitignore` has `CONTINUE_HERE.md`
- [ ] Next Steps numbered + actionable
- [ ] In Progress items specific enough to resume

## Traps

- **Placeholders not content**: "TODO: fill later" defeats purpose. Real info from current sess.
- **Duplicate git state**: Don't list every file → git tracks. Focus intent, partial, next.
- **Forget Context**: Failed approaches most valuable. W/o them, next sess retries dead ends.
- **Overwrite w/o read**: Existing CONTINUE_HERE.md → read first → may have unfinished from prior.
- **Stale files**: Ephemeral → after consume, delete. Stale → confusion.

## →

- `read-continue-here` — complement: read+act on continuation file at sess start
- `bootstrap-agent-identity` — cold-start identity reconstruction → consumes file this produces
- `manage-memory` — durable cross-sess knowledge (complements ephemeral handoff)
- `commit-changes` — save to git before writing continuation
- `write-claude-md` — project instructions where optional continuity guidance lives
