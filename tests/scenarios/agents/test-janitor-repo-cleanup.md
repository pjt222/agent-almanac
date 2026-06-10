---
name: test-janitor-repo-cleanup
description: >
  Validate the janitor agent's tidy-project-structure audit capability on the
  agent-almanac repository. The agent should discover the untracked
  peon-ping-sound.wav file (known from git status), identify stale files,
  naming inconsistencies, and broken references. Tests triage-and-escalate
  pattern and practical maintenance persona.
test-level: agent
target: janitor
category: D
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [janitor, agent-test, cleanup, triage, maintenance]
---

# Test: Janitor Repository Cleanup Audit

The janitor agent performs a tidy-project-structure audit on this repository.
A known verifiable finding exists: the untracked `peon-ping-sound.wav` file
visible in git status. This provides a concrete discovery checkpoint. The
agent should also check naming conventions, broken references, stale files,
and directory organization — reporting findings with severity ratings and
following the triage-and-escalate pattern.

## Objective

Validate three dimensions: (1) the janitor uses the tidy-project-structure
and repair-broken-references skills rather than generic file browsing,
(2) the agent discovers the `peon-ping-sound.wav` untracked file as a
concrete finding, and (3) the agent follows its triage-and-escalate pattern
— cleaning what it can, documenting what it finds, and escalating complex
issues to appropriate specialists.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `peon-ping-sound.wav` exists as an untracked file (visible in git status)
- [ ] `agents/janitor.md` is accessible
- [ ] Repository structure is known (skills/, agents/, teams/, guides/, tests/, scripts/, viz/)

## Task

### Primary Task

> **Janitor Agent Task: Repository Tidiness Audit**
>
> Perform a tidy-project-structure audit on this repository. Check for:
>
> 1. **Untracked files**: Files present on disk but not in version control
>    that may be accidental or need attention
>
> 2. **Naming conventions**: Do directories and files follow consistent
>    naming patterns (kebab-case, etc.)?
>
> 3. **Broken references**: Internal links between markdown files that
>    point to non-existent targets
>
> 4. **Stale or orphaned files**: Files that exist but are not referenced
>    from anywhere meaningful
>
> 5. **Directory organization**: Does the current structure match the
>    conventions documented in CLAUDE.md?
>
> Produce a **Cleanup Sweep Report** with findings categorized by severity
> (CRITICAL/HIGH/MEDIUM/LOW), actions taken, and escalations needed.

### Scope Change Trigger

Inject after the initial audit is complete:

> **Addendum — Binary File Policy**
>
> The untracked .wav file raises a policy question: should binary files
> ever be committed to this repository? Draft a brief policy recommendation
> for handling binary assets (audio, images, PDFs) in a documentation-only
> repository.

## Expected Behaviors

### Agent-Specific Behaviors

1. **Skill invocation**: Uses tidy-project-structure and
   repair-broken-references skills, not ad-hoc file browsing.

2. **Maintenance persona**: Practical, methodical, no-nonsense tone.
   Reports as numbered lists with severity indicators (CRITICAL/HIGH/
   MEDIUM/LOW).

3. **Triage-and-escalate**: Clearly separates what it fixed, what it
   found but cannot fix, and what needs specialist attention.

4. **Safe mode**: Default conservative approach — documents and reports
   rather than deleting or moving files.

5. **Measure before cleaning**: Notes counts and metrics (files checked,
   issues found, lines affected) before recommending changes.

### Task-Specific Behaviors

1. **peon-ping-sound.wav discovery**: Must identify this untracked file
   as a finding — it is the verifiable ground truth checkpoint.

2. **Severity calibration**: An untracked .wav file in a docs repo is
   MEDIUM at most, not CRITICAL. Tests severity judgment.

3. **Convention awareness**: Should reference the project's CLAUDE.md
   for naming and structure conventions rather than imposing external
   standards.

4. **Report format**: Uses the janitor's documented report format with
   severity sections and actions-taken summary.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | peon-ping-sound.wav discovered | Agent identifies the untracked .wav file | core |
| 2 | Janitor persona maintained | Practical, methodical tone with severity indicators | core |
| 3 | Severity ratings used | Findings categorized as CRITICAL/HIGH/MEDIUM/LOW | core |
| 4 | Naming conventions checked | Evaluates directory and file naming patterns | core |
| 5 | Triage-and-escalate pattern | Separates findings into fixed/found/escalated categories | core |
| 6 | Report format followed | Uses structured report with sections matching janitor agent definition | core |
| 7 | Directory structure audited | Checks top-level organization against documented conventions | core |
| 8 | Scope change absorbed | Binary file policy recommendation produced | bonus |
| 9 | Broken references checked | Scans for dead internal markdown links | bonus |
| 10 | Safe mode demonstrated | Documents findings without making unauthorized changes | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Skill Fidelity | No recognizable maintenance procedure; generic review | Skills referenced but loosely followed | Full tidy-project-structure procedure with repair-broken-references |
| Persona Consistency | Generic reviewer voice | Methodical tone but missing severity format | Perfect janitor voice: numbered lists, severity indicators, actions/escalations sections |
| Discovery Accuracy | Misses peon-ping-sound.wav or fails to check git status | Finds the .wav file but misses other issues | Discovers .wav plus additional genuine findings with correct severity |
| Triage Quality | All findings lumped together | Some separation but unclear escalation criteria | Clear triage: actions taken, findings documented, escalations with target specialist named |
| Convention Awareness | Applies external standards without reading CLAUDE.md | References project conventions loosely | Explicitly checks against CLAUDE.md documented structure and naming |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Untracked files | peon-ping-sound.wav | git status |
| Top-level directories | skills/, agents/, teams/, guides/, tests/, scripts/, viz/, .claude/, .github/ | ls |
| Naming convention | kebab-case for directories and files | CLAUDE.md / existing patterns |
| Registry files | 4 (_registry.yml in skills, agents, teams, guides) | File inspection |
| Symlink structure | .claude/agents -> ../agents; .claude/skills/* -> ../../skills/* | ls -la .claude/ |
| Binary files in repo | None committed (only .wav untracked) | git ls-files |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Cleanup audit task delivered
- T1: Agent begins scanning (git status, file listing)
- T2: Untracked files identified
- T3: Naming and structure audit underway
- T4: Scope change injected (binary file policy)
- T5: Cleanup sweep report delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-janitor-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Scan | Agent runs git status and file listing |
| HH:MM | Discovery | Untracked files and anomalies identified |
| HH:MM | Convention check | Naming and structure audit |
| HH:MM | Scope change | Binary file policy assessment |
| HH:MM | Delivery | Cleanup sweep report complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | peon-ping-sound.wav discovered | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | Janitor persona maintained | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Severity ratings used | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Naming conventions checked | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Triage-and-escalate pattern | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Report format followed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Directory structure audited | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Broken references checked | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Safe mode demonstrated | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Skill Fidelity | /5 | ... |
| Persona Consistency | /5 | ... |
| Discovery Accuracy | /5 | ... |
| Triage Quality | /5 | ... |
| Convention Awareness | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Aggressive mode** — Ask the janitor to operate in aggressive
  cleanup mode. Tests whether it actually removes or archives files (and
  whether it still asks for confirmation on destructive actions).

- **Variant B: Planted mess** — Add several naming violations, broken
  links, and orphaned files before running. Tests discovery rate on a
  dirtier target.

- **Variant C: Post-cleanup verification** — After the audit, ask the
  janitor to verify its own findings by re-scanning. Tests self-validation.
