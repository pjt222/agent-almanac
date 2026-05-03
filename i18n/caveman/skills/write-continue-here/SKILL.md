---
name: write-continue-here
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write CONTINUE_HERE.md file capturing current session state so fresh
  Claude Code session can pick up where this one left off. Covers assessing
  recent work, structuring continuation file with objective, completed,
  in-progress, next-steps, context sections, verifying file actionable.
  Use when ending session with unfinished work, handing off context
  between sessions, or preserving task state git alone cannot capture.
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

Write structured continuation file so next session starts with full context.

## When Use

- Ending session with work still in progress
- Handing off complex task between sessions
- Preserving intent, failed approaches, next steps that git cannot capture
- Before closing Claude Code when mid-task

## Inputs

- **Required**: Active session with recent work to summarize
- **Optional**: Specific instructions about what to emphasize in handoff

## Steps

### Step 1: Assess Session State

Gather facts about recent work:

```bash
git log --oneline -5
git status
git diff --stat
```

Review conversation context: what was objective, what completed, what partially done, what tried and failed, what decisions made.

**Got:** Clear understanding of current task state — completed items, in-progress items, planned next steps.

**If err:** Not in git repository? Skip git commands. Continuation file can still capture conversational context, task state.

### Step 2: Write CONTINUE_HERE.md

Write file to project root using structure below. Every section must contain actionable content, not placeholders.

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
- **Objective**: Capture WHY — git log shows what changed, not why
- **Completed**: Mark items clear done to prevent re-work
- **In Progress**: Highest-value section — partial state hardest to reconstruct
- **Next Steps**: Number by priority. Prefix user-dependent items with `**[USER]**`
- **Context**: Record negative space — what tried and rejected, why

**Got:** CONTINUE_HERE.md file at project root with all 5 sections populated with real content from current session. Timestamp and branch accurate.

**If err:** Write fails? Check file permissions. File should be created in project root (same directory as `.git/`). Verify `.gitignore` contains `CONTINUE_HERE.md` — if not, add it.

### Step 3: Verify File

Read back CONTINUE_HERE.md. Confirm:
- Timestamp current (within last few minutes)
- Branch name matches `git branch --show-current`
- All 5 sections contain real content (no template placeholders)
- Next Steps numbered and actionable
- In Progress items describe current state specifically enough to resume

**Got:** File reads as clear, actionable handoff fresh session could use to immediately resume work.

**If err:** Edit sections containing placeholder text or too vague. Each section should pass test: "Could fresh session act on this without asking clarifying questions?"

## Check

- [ ] CONTINUE_HERE.md exists at project root
- [ ] File contains all 5 sections with real content (not placeholders)
- [ ] Timestamp and branch accurate
- [ ] `.gitignore` includes `CONTINUE_HERE.md`
- [ ] Next Steps numbered and actionable
- [ ] In Progress items specify enough detail to resume without questions

## Pitfalls

- **Write placeholders instead of content**: "TODO: fill in later" defeats purpose. Every section must contain real information from current session.
- **Duplicate git state**: Do not list every file changed — git already tracks that. Focus on intent, partial state, next steps.
- **Forget Context section**: Failed approaches most valuable thing to record. Without them, next session will retry same dead ends.
- **Overwrite without reading**: CONTINUE_HERE.md already exists from prior session? Read first — may contain unfinished work from earlier handoff.
- **Leave stale files**: CONTINUE_HERE.md ephemeral. After next session consumes, delete. Stale files cause confusion.

## See Also

- `read-continue-here` — complement: reading and acting on continuation file at session start
- `bootstrap-agent-identity` — cold-start identity reconstruction that consumes continuation file this skill produces
- `manage-memory` — durable cross-session knowledge (complements this ephemeral handoff)
- `commit-changes` — save work to git before writing continuation file
- `write-claude-md` — project instructions where optional continuity guidance lives
