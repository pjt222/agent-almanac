---
name: agentskills-alignment
description: Standards compliance team for maintaining alignment with the agentskills.io open standard across the skills library, agent definitions, and team compositions
lead: skill-reviewer
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-19
updated: 2026-02-19
tags: [standards, compliance, agentskills, quality, alignment]
coordination: hub-and-spoke
members:
  - id: skill-reviewer
    role: Lead
    responsibilities: Format validation, batch orchestration, final sign-off on spec compliance
  - id: senior-researcher
    role: Standards Researcher
    responsibilities: Standards research, spec drift detection, upstream changelog monitoring
  - id: senior-software-developer
    role: Structural Reviewer
    responsibilities: Structural pattern review, procedure consistency, frontmatter validation
  - id: librarian
    role: Registry Auditor
    responsibilities: Registry sync, cross-reference auditing, symlink verification
---

# AgentSkills Alignment Team

A four-agent team that ensures all skills, agents, and teams in the repository remain aligned with the [agentskills.io open standard](https://agentskills.io). The lead (skill-reviewer) orchestrates parallel reviews across standards research, structural patterns, and registry integrity, then synthesizes findings into a consolidated compliance report.

## Purpose

As the skills library grows and the agentskills.io specification evolves, format drift is inevitable. A single reviewer cannot simultaneously track upstream spec changes, validate structural patterns across hundreds of files, and audit registry consistency. This team decomposes alignment review into four complementary specialties:

- **Format validation**: YAML frontmatter correctness, required sections, line count limits, procedure step format
- **Standards research**: Upstream spec changes, changelog monitoring, drift detection between local conventions and the published standard
- **Structural patterns**: Procedure consistency (`Expected:`/`On failure:` blocks), progressive disclosure compliance, frontmatter field completeness
- **Registry integrity**: `_registry.yml` sync with files on disk, cross-reference validity, symlink health, total count accuracy

By running these reviews in parallel and synthesizing results, the team delivers thorough compliance feedback faster than sequential single-agent review.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `skill-reviewer` | Lead | Format validation, batch orchestration, final sign-off |
| Research | `senior-researcher` | Standards Researcher | Spec drift, upstream changes, changelog analysis |
| Structure | `senior-software-developer` | Structural Reviewer | Procedure patterns, frontmatter, section consistency |
| Registry | `librarian` | Registry Auditor | Registry sync, cross-references, symlinks |

## Coordination Pattern

Hub-and-spoke: the skill-reviewer lead distributes review tasks, each reviewer works independently, and the lead collects and synthesizes all findings.

```
           skill-reviewer (Lead)
          /        |        \
         /         |         \
senior-researcher  |     librarian
                   |
   senior-software-developer
```

**Flow:**

1. Lead receives review request and decomposes into parallel tasks
2. senior-researcher checks latest agentskills.io spec for changes and flags drift
3. senior-software-developer reviews structural patterns (frontmatter, sections, procedure format)
4. librarian audits registries, cross-references, and symlinks for consistency
5. Lead collects findings, resolves conflicts, produces consolidated report

## Task Decomposition

### Phase 1: Setup (Lead)

The skill-reviewer lead examines the review scope and creates targeted tasks:

- Determine review type: full audit, spot check, new content review, or spec update assessment
- Identify files in scope (all skills, a subset after refactor, or specific new additions)
- Create review tasks scoped to each reviewer's specialty

### Phase 2: Parallel Review

**senior-researcher** tasks:
- Fetch the current agentskills.io specification and changelog
- Compare local conventions against the published standard
- Flag any fields, sections, or patterns that have drifted from spec
- Note upcoming spec changes that may require future migration

**senior-software-developer** tasks:
- Validate YAML frontmatter fields (`name`, `description`, `allowed-tools`, `metadata`)
- Check required sections are present (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- Verify procedure steps follow the pattern: numbered step, sub-steps, `**Expected:**`, `**On failure:**`
- Confirm SKILL.md files stay under 500 lines with extended examples in `references/EXAMPLES.md`

**librarian** tasks:
- Verify `_registry.yml` entries match files on disk (no orphans, no missing entries)
- Check `total_skills`, `total_agents`, `total_teams` counts are accurate
- Validate cross-references between skills (Related Skills links resolve)
- Confirm `.claude/skills/` symlinks point to valid targets
- Audit agent skill lists against actual skill files

### Phase 3: Synthesis (Lead)

The skill-reviewer lead:
- Collects all reviewer findings
- Performs own format validation pass on flagged files
- Resolves conflicting recommendations
- Produces a prioritized report: critical > high > medium > low
- Recommends batch fix strategy for systematic issues

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: agentskills-alignment
  lead: skill-reviewer
  coordination: hub-and-spoke
  members:
    - agent: skill-reviewer
      role: Lead
      subagent_type: skill-reviewer
    - agent: senior-researcher
      role: Standards Researcher
      subagent_type: senior-researcher
    - agent: senior-software-developer
      role: Structural Reviewer
      subagent_type: senior-software-developer
    - agent: librarian
      role: Registry Auditor
      subagent_type: librarian
  tasks:
    - name: review-spec-alignment
      assignee: senior-researcher
      description: Check agentskills.io spec for changes and detect drift between local conventions and published standard
    - name: review-structural-patterns
      assignee: senior-software-developer
      description: Validate frontmatter fields, required sections, procedure step format, and line count limits
    - name: audit-registries
      assignee: librarian
      description: Verify registry sync, cross-references, symlinks, and total counts
    - name: synthesize-report
      assignee: skill-reviewer
      description: Collect all findings, resolve conflicts, and produce consolidated prioritized report
      blocked_by: [review-spec-alignment, review-structural-patterns, audit-registries]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Periodic Full Audit

Run a comprehensive review of the entire skills library against the current spec:

```
User: Run a full agentskills alignment audit on all 269 skills
```

The team reviews every SKILL.md for format compliance, checks registries for sync, and reports any drift from the agentskills.io standard.

### Scenario 2: Post-Refactor Spot Check

After a structural refactor (e.g., flattening the skills directory), verify nothing broke:

```
User: We just flattened the skills directory structure — run an alignment spot check
```

The team focuses on registry sync, symlink validity, and cross-reference integrity rather than full format review.

### Scenario 3: Pre-Merge Content Review

Before merging new skills, agents, or teams, validate they meet the standard:

```
User: Review these 5 new skills before I merge them to main
```

The team validates frontmatter, required sections, procedure format, and registry entries for the new additions only.

## Limitations

- Focused on format and structural compliance, not domain accuracy or correctness of procedure logic
- Requires upstream spec access (agentskills.io) for drift detection; offline environments get structural review only
- Best suited for batch reviews; single-file checks are more efficiently handled by the `review-skill-format` skill directly
- Does not execute skill procedures or test that they work — focuses on static format analysis
- Cannot automatically fix issues; produces a report that humans or agents act on

## See Also

- [skill-reviewer](../agents/skill-reviewer.md) — Lead agent with format validation expertise
- [senior-researcher](../agents/senior-researcher.md) — Standards research and analysis agent
- [senior-software-developer](../agents/senior-software-developer.md) — Structural pattern review agent
- [librarian](../agents/librarian.md) — Registry and cross-reference auditing agent
- [review-skill-format](../skills/review-skill-format/SKILL.md) — Single-file format validation skill
- [create-skill](../skills/create-skill/SKILL.md) — Skill creation meta-skill (defines the format being validated)

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-19
