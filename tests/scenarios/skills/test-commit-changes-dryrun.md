---
name: test-commit-changes-dryrun
description: >
  Validate the commit-changes skill in observation mode (read-only) by running
  Steps 1-3 without executing the actual commit. The repository has a known
  untracked file (peon-ping-sound.wav) providing ground truth for change
  detection. Tests whether the procedure correctly identifies changes, drafts
  a commit message, and stages selectively — without producing side effects.
test-level: skill
target: commit-changes
category: E
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [commit-changes, skill-test, git, dry-run, read-only]
---

# Test: Commit Changes (Dry Run)

Run the `commit-changes` skill in observation mode — execute the review and
analysis steps but stop before the actual `git commit`. The repository has a
known untracked file (`peon-ping-sound.wav`), providing verifiable ground
truth for change detection and commit message drafting.

## Objective

Validate that the commit-changes skill's procedure faithfully identifies
working tree state, drafts an appropriate commit message, and demonstrates
selective staging awareness — all without modifying the repository. This
tests procedure fidelity under a read-only constraint, verifying that
the skill's analytical steps (1-3) function correctly in isolation.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `peon-ping-sound.wav` exists as an untracked file (verified via `git status`)
- [ ] `skills/commit-changes/SKILL.md` exists and is complete
- [ ] No staged changes present (`git diff --staged` is empty)
- [ ] Working tree is otherwise clean (no modified tracked files)

## Task

### Primary Task

> **Skill Task: Commit Changes (Observation Mode)**
>
> Follow the `commit-changes` skill procedure on this repository
> (`/mnt/d/dev/p/agent-almanac`), but operate in **observation mode**:
>
> - **Step 1**: Execute fully — review current changes with `git status`
>   and `git diff`
> - **Step 2**: Analyze but do NOT execute — identify which files should
>   be staged and which should be excluded, with rationale
> - **Step 3**: Draft a commit message following conventional commits
>   format, but do NOT run `git commit`
> - **Steps 4-5**: Skip (no commit to amend or verify)
>
> Produce a dry-run report showing: detected changes, staging plan,
> drafted commit message, and any concerns identified.

### Scope Change Trigger

Inject after Step 1 (Review) completes:

> **Addendum — Binary File Policy**
>
> Before drafting the staging plan, assess whether `peon-ping-sound.wav`
> should be committed to this repository. Consider: repository purpose
> (documentation-only), file type (binary audio), `.gitignore` patterns,
> and repository size impact. Include your recommendation in the report.

## Expected Behaviors

### Procedure-Specific Behaviors

Since this is a skill-level test in observation mode, behaviors map to
partial procedure execution:

1. **Step 1 (Review)**: Runs `git status`, `git diff`, and `git diff
   --staged`. Correctly identifies `peon-ping-sound.wav` as untracked.
   Reports no staged or modified tracked files.

2. **Step 2 (Stage — analysis only)**: Identifies the untracked file.
   Evaluates whether it should be staged. Does NOT run `git add`.

3. **Step 3 (Message — draft only)**: Drafts a conventional commit
   message appropriate for the identified changes. Does NOT run
   `git commit`. Uses HEREDOC format in the draft.

### Task-Specific Behaviors

1. **Read-only compliance**: No git write operations (`git add`,
   `git commit`, `git reset`) should be executed during the test.

2. **Binary file awareness**: Should note that `.wav` is a binary file
   and assess suitability for a documentation repository.

3. **Correct status interpretation**: Must distinguish untracked files
   from modified/staged files in its analysis.

4. **Conventional commit format**: Draft message should use a valid
   type prefix (likely `chore:` or `feat:` depending on rationale).

## Acceptance Criteria

Threshold: PASS if >= 7/9 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Git status executed | `git status` output captured and analyzed | core |
| 2 | Untracked file identified | `peon-ping-sound.wav` explicitly noted | core |
| 3 | No staged changes confirmed | Correctly reports empty staging area | core |
| 4 | Staging plan produced | Analysis of what to stage/exclude with rationale | core |
| 5 | Commit message drafted | Conventional commit format message produced | core |
| 6 | Read-only compliance | No `git add`, `git commit`, or other write ops executed | core |
| 7 | Message explains "why" | Draft message body describes purpose, not just "what" | core |
| 8 | Binary file assessment | Scope change: recommendation on .wav file suitability | bonus |
| 9 | HEREDOC format used | Draft message uses the HEREDOC pattern from the skill | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Procedure Fidelity | Skips Step 1 or jumps to committing | All requested steps executed but thin | Steps 1-3 fully executed with all sub-commands and analysis |
| Read-Only Discipline | Executes write operations | Mostly read-only with one accidental write | Strictly read-only; clear separation of analysis from execution |
| Change Detection | Misses the untracked file or misclassifies it | Identifies the file but minimal analysis | Full status analysis with file type, size, and suitability assessment |
| Message Quality | Generic or missing commit message | Valid conventional commit but vague body | Precise type, clear subject, informative body, correct format |
| Scope Change Handling | Ignores binary file policy question | Brief answer without reasoning | Thorough assessment considering repo purpose, file type, and .gitignore |

Total: /25 points.

## Ground Truth

Known facts about the repository state for verifying detection accuracy.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Untracked files | `peon-ping-sound.wav` | `git status` |
| Modified tracked files | None | `git status` |
| Staged files | None | `git diff --staged` |
| Current branch | `main` | `git branch` |
| File type of untracked | Binary audio (.wav) | File extension |
| Repository purpose | Documentation-only | CLAUDE.md |
| .gitignore covers .wav? | No (not in .gitignore) | `.gitignore` contents |

### What Should NOT Happen

- `git add` executed on any file
- `git commit` executed
- `git stash` or `git reset` executed
- Any modification to the working tree or index

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Skill invoked in observation mode
- T1: Step 1 (Review) complete
- T2: Scope change injected (binary file policy)
- T3: Step 2 (Staging analysis) complete
- T4: Step 3 (Message draft) complete
- T5: Dry-run report delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-commit-changes-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Read-Only Verification
| Command | Executed? | Write Op? |
|---------|-----------|-----------|
| git status / git diff / git diff --staged | Y/N | No |
| git add / git commit | Y/N | YES = violation |

### Criteria Results (1-9) & Rubric Scores (5 dims, /25)
[Use Acceptance Criteria and Scoring Rubric tables above]

### Key Observations / Lessons Learned
- ...
```

## Variants

- **Variant A: With staged changes** — Stage a harmless file first, then
  run the dry run to test detection of both staged and untracked files.

- **Variant B: Multiple untracked files** — Create several temporary
  files of different types, run the dry run, verify all are detected.

- **Variant C: Full execution** — Remove the read-only constraint and
  let the skill commit the .wav file to a throwaway branch, then clean up.
