---
title: "AgentSkills Alignment"
description: "Standards compliance audits using the agentskills-alignment team for format validation, spec drift detection, and registry integrity"
category: workflow
agents: [skill-reviewer, senior-researcher, senior-software-developer, librarian]
teams: [agentskills-alignment]
skills: [review-skill-format, refactor-skill-structure, create-skill, evolve-skill, update-skill-content, catalog-collection, review-software-architecture, review-research]
---

# AgentSkills Alignment

The [agentskills-alignment](../teams/agentskills-alignment.md) team audits skills, agents, and teams for compliance with the [agentskills.io open standard](https://agentskills.io). It uses hub-and-spoke coordination: the skill-reviewer lead distributes review tasks to three specialist reviewers who work in parallel, then synthesizes findings into a consolidated compliance report.

This guide covers how to run alignment audits, interpret the results, and act on findings.

## When to Use This Guide

- **After bulk additions** -- you added several new skills, agents, or teams and want to verify they all meet the standard before merging.
- **Before a release** -- periodic hygiene check ensuring the entire library is spec-compliant.
- **After spec changes** -- the agentskills.io specification was updated and you need to assess drift between local conventions and the new standard.
- **Post-refactor verification** -- a structural change (directory flattening, registry reorganization, frontmatter schema update) may have introduced inconsistencies.
- **Periodic maintenance** -- routine audit on a monthly or quarterly cadence to catch accumulated drift.

## Prerequisites

- This repository cloned locally with the `.claude/agents/` symlink pointing to `agents/` for agent discovery.
- Claude Code running with access to the repository.
- Familiarity with the SKILL.md format: YAML frontmatter, required sections (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills), procedure step patterns (`**Expected:**` / `**On failure:**`), and the 500-line limit. See [Creating Skills](creating-skills.md) for background.

## Workflow Overview

The team follows a hub-and-spoke pattern identical in structure to the [r-package-review](../teams/r-package-review.md) team:

```
         skill-reviewer (Lead)
        /        |        \
       /         |         \
senior-       senior-      librarian
researcher    software-    (Registry
(Standards)   developer    Auditor)
              (Structure)

     Parallel review phase
              |
              v
     skill-reviewer (Lead)
     Synthesis + report
```

The lead analyzes the scope, creates targeted tasks for each reviewer, waits for parallel results, then produces a single prioritized compliance report.

## Running a Full Audit

### Step 1: Initiate the Audit

Tell Claude Code to create the team and specify the scope:

```
Run a full agentskills alignment audit on the entire skills library
```

For a scoped audit after adding new content:

```
Use the agentskills-alignment team to review the 5 new entomology skills
and verify the registry is in sync
```

For a post-spec-update assessment:

```
The agentskills.io spec was updated last week -- run an alignment audit
to check for drift across all skills
```

### Step 2: Lead Analyzes Scope

The skill-reviewer lead examines the review request and creates targeted tasks:

- **Full audit**: All SKILL.md files, all registry entries, all cross-references
- **Scoped review**: Only the specified files plus their registry entries and cross-references
- **Spec update check**: Focus on fields or sections that changed in the upstream spec

The lead creates one task per reviewer, each scoped to their specialty.

### Step 3: Parallel Review

Three reviewers work simultaneously on their assigned areas:

**senior-researcher** (Standards):
- Checks the current agentskills.io specification for recent changes
- Compares local conventions against the published standard
- Flags fields, sections, or patterns that have drifted from spec
- Notes upcoming spec changes that may require future migration

**senior-software-developer** (Structure):
- Validates YAML frontmatter fields (`name`, `description`, `allowed-tools`, `metadata`)
- Checks required sections are present and correctly ordered
- Verifies procedure steps follow the `**Expected:**` / `**On failure:**` pattern
- Confirms SKILL.md files stay under 500 lines
- Checks that extended examples use `references/EXAMPLES.md` (progressive disclosure)

**librarian** (Registry):
- Verifies `_registry.yml` entries match files on disk (no orphans, no missing entries)
- Checks `total_skills`, `total_agents`, `total_teams` counts are accurate
- Validates cross-references between skills (Related Skills links resolve)
- Confirms `.claude/skills/` symlinks point to valid targets
- Audits agent skill lists against actual skill files

### Step 4: Lead Synthesizes Report

The skill-reviewer lead:

- Collects all reviewer findings
- Performs its own format validation pass on flagged files using [review-skill-format](../skills/review-skill-format/SKILL.md)
- Resolves conflicting recommendations between reviewers
- Produces a consolidated report organized by severity

## Interpreting the Compliance Report

The report uses three severity levels:

| Severity | Meaning | Action Required |
|----------|---------|-----------------|
| **BLOCKING** | Violates the spec in a way that breaks tooling or misleads consumers | Must fix before merge or release |
| **SUGGEST** | Deviates from best practice or local convention but does not break anything | Should fix this cycle |
| **NIT** | Minor style or consistency issue | Fix when convenient |

### Example Report Structure

```
## Alignment Audit Report
Scope: Full library (328 skills, 66 agents, 15 teams)
Date: 2026-02-20
Reviewers: senior-researcher, senior-software-developer, librarian

## BLOCKING (3)
- [Structure] skills/example-skill/SKILL.md missing "Validation" section
- [Registry] skills/_registry.yml lists 278 but 279 files exist on disk
- [Structure] skills/long-skill/SKILL.md is 523 lines (limit: 500)

## SUGGEST (7)
- [Standards] "metadata.complexity" uses "medium" but spec now uses "intermediate"
- [Structure] 4 skills use "## Failure Modes" instead of "## Common Pitfalls"
- [Registry] .claude/skills/new-skill symlink missing
- [Standards] 2 skills omit the "On failure:" block in procedure steps

## NIT (12)
- [Structure] Inconsistent blank lines before "## Related Skills" in 8 files
- [Registry] agents/_registry.yml has trailing whitespace on 4 lines
```

## Acting on Findings

### Batch Fixes

For systematic issues (e.g., "4 skills use the wrong section heading"), fix them in a batch rather than one at a time:

```
The alignment audit found 4 skills using "Failure Modes" instead of
"Common Pitfalls". Fix all of them.
```

The [update-skill-content](../skills/update-skill-content/SKILL.md) skill handles targeted content updates. For structural changes, use [refactor-skill-structure](../skills/refactor-skill-structure/SKILL.md).

### Registry Updates

After fixing content issues, update the registries:

```bash
# Verify registry sync
npm run check-readmes

# Regenerate READMEs from updated registries
npm run update-readmes
```

### Overlong Skills

Skills exceeding 500 lines need refactoring. Extract extended examples, large code blocks, and multi-variant configurations into `references/EXAMPLES.md`:

```
Use the refactor-skill-structure skill to split skills/long-skill/SKILL.md
into a main file and references/EXAMPLES.md
```

### Re-Running After Fixes

After implementing fixes, run a targeted re-audit to verify:

```
Re-run the agentskills-alignment team, focusing on the 10 issues
flagged in the previous audit
```

## Single-Agent Quick Checks

When a full team audit is overkill, use a single agent or skill directly.

### Format-Only Check

Validate a single skill's format without team coordination:

```
Use the review-skill-format skill on skills/my-new-skill/SKILL.md
```

This runs the [review-skill-format](../skills/review-skill-format/SKILL.md) procedure: frontmatter validation, required sections, procedure step format, and line count.

### Registry Sync Check

Use the librarian agent directly to audit registry consistency:

```
Use the librarian agent to verify that skills/_registry.yml
matches the files on disk
```

### Structural Spot Check

Use the senior-software-developer agent to review procedure patterns in a subset of files:

```
Use the senior-software-developer agent to check procedure step format
in the 5 newest skills
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Audit reports many false positives | Review scope too broad or conventions unclear | Narrow scope to a specific domain or provide context: "Our local convention for X is Y" |
| Registry counts always mismatched | Files added without registry update | Always update `_registry.yml` and `total_*` count when adding or removing content. Use the [create-skill](../skills/create-skill/SKILL.md) meta-skill which includes the registry step |
| Spec drift reviewer finds nothing | Offline environment or spec unchanged | The senior-researcher needs web access to fetch the current agentskills.io spec. In offline environments, structural and registry review still work |
| Symlink verification fails | Working on Windows without WSL symlink support | Symlinks require WSL or Git symlink support on Windows. Verify with `ls -la .claude/skills/` |
| Audit takes too long on full library | Reviewing 278+ skills in one pass | Split into domain-based batches: "Audit the r-packages domain skills" then "Audit the compliance domain skills" |
| Conflicting recommendations | Two reviewers flag the same issue differently | The lead resolves conflicts in synthesis. If recurring, document the local convention in CLAUDE.md |

## Related Resources

### Team
- [agentskills-alignment](../teams/agentskills-alignment.md) -- team definition with full configuration and task decomposition

### Agents
- [skill-reviewer](../agents/skill-reviewer.md) -- lead agent with format validation expertise
- [senior-researcher](../agents/senior-researcher.md) -- standards research and spec drift detection
- [senior-software-developer](../agents/senior-software-developer.md) -- structural pattern review
- [librarian](../agents/librarian.md) -- registry and cross-reference auditing

### Skills
- [review-skill-format](../skills/review-skill-format/SKILL.md) -- single-file format validation
- [refactor-skill-structure](../skills/refactor-skill-structure/SKILL.md) -- splitting overlong skills
- [create-skill](../skills/create-skill/SKILL.md) -- skill creation meta-skill (defines the format being validated)
- [evolve-skill](../skills/evolve-skill/SKILL.md) -- skill evolution and versioning
- [update-skill-content](../skills/update-skill-content/SKILL.md) -- targeted content updates
- [catalog-collection](../skills/catalog-collection/SKILL.md) -- cataloging and classification
- [review-software-architecture](../skills/review-software-architecture/SKILL.md) -- architecture review procedure
- [review-research](../skills/review-research/SKILL.md) -- research review procedure

### Guides
- [Creating Skills](creating-skills.md) -- how to author skills that pass alignment review
- [Understanding the System](understanding-the-system.md) -- how skills, agents, and teams compose
- [Running a Code Review](running-a-code-review.md) -- similar hub-and-spoke review workflow for code
