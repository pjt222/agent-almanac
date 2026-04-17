---
name: write-continue-here
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
  locale: zh-CN
  source_locale: en
  source_commit: 025eea68
  translator: scaffold
  translation_date: "2026-03-22"
---

# Write Continue Here

Write a structured continuation file so the next session starts with full context.

## When to Use

- Ending a session with work still in progress
- Handing off a complex task between sessions
- Preserving intent, failed approaches, and next steps that git cannot capture
- Before closing Claude Code when mid-task

## Inputs

- **Required**: An active session with recent work to summarize
- **Optional**: Specific instructions about what to emphasize in the handoff

## Procedure

### Step 1: Assess Session State

Gather facts about recent work:

```bash
git log --oneline -5
git status
git diff --stat
```

Review the conversation context: what was the objective, what was completed, what is partially done, what was tried and failed, what decisions were made.

**Expected:** Clear understanding of current task state — completed items, in-progress items, and planned next steps.

**On failure:** If not in a git repository, skip git commands. The continuation file can still capture conversational context and task state.

### Step 2: Write CONTINUE_HERE.md

Write the file to the project root using the structure below. Every section must contain actionable content, not placeholders.

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
- **Objective**: Capture the WHY — git log shows what changed, not why
- **Completed**: Mark items clearly done to prevent re-work
- **In Progress**: This is the highest-value section — partial state is hardest to reconstruct
- **Next Steps**: Number by priority. Prefix user-dependent items with `**[USER]**`
- **Context**: Record negative space — what was tried and rejected, and why

**Expected:** A CONTINUE_HERE.md file at the project root with all 5 sections populated with real content from the current session. The timestamp and branch are accurate.

**On failure:** If Write fails, check file permissions. The file should be created in the project root (same directory as `.git/`). Verify `.gitignore` contains `CONTINUE_HERE.md` — if not, add it.

### Step 3: Verify the File

Read back CONTINUE_HERE.md and confirm:
- Timestamp is current (within the last few minutes)
- Branch name matches `git branch --show-current`
- All 5 sections contain real content (no template placeholders)
- Next Steps are numbered and actionable
- In Progress items describe current state specifically enough to resume

**Expected:** The file reads as a clear, actionable handoff that a fresh session could use to immediately resume work.

**On failure:** Edit sections that contain placeholder text or are too vague. Each section should pass the test: "Could a fresh session act on this without asking clarifying questions?"

## Validation

- [ ] CONTINUE_HERE.md exists at the project root
- [ ] File contains all 5 sections with real content (not placeholders)
- [ ] Timestamp and branch are accurate
- [ ] `.gitignore` includes `CONTINUE_HERE.md`
- [ ] Next Steps are numbered and actionable
- [ ] In Progress items specify enough detail to resume without questions

## Common Pitfalls

- **Writing placeholders instead of content**: "TODO: fill in later" defeats the purpose. Every section must contain real information from the current session.
- **Duplicating git state**: Do not list every file changed — git already tracks that. Focus on intent, partial state, and next steps.
- **Forgetting the Context section**: Failed approaches are the most valuable thing to record. Without them, the next session will retry the same dead ends.
- **Overwriting without reading**: If CONTINUE_HERE.md already exists from a prior session, read it first — it may contain unfinished work from an earlier handoff.
- **Leaving stale files**: CONTINUE_HERE.md is ephemeral. After the next session consumes it, delete it. Stale files cause confusion.

## Related Skills

- `read-continue-here` — the complement: reading and acting on the continuation file at session start
- `bootstrap-agent-identity` — cold-start identity reconstruction that consumes the continuation file this skill produces
- `manage-memory` — durable cross-session knowledge (complements this ephemeral handoff)
- `commit-changes` — save work to git before writing the continuation file
- `write-claude-md` — project instructions where optional continuity guidance lives
