---
title: "Creating Skills"
description: "Authoring, evolving, and reviewing skills following the agentskills.io standard"
category: workflow
agents: [skill-reviewer]
teams: []
skills: [create-skill, evolve-skill, review-skill-format, refactor-skill-structure, update-skill-content]
---

# Creating Skills

Skills are the executable backbone of this system. Where guides provide background knowledge for humans and agents define personas, skills define *how* -- the concrete, step-by-step procedures that agentic systems consume and execute. This guide covers the full skill lifecycle from initial creation through evolution, review, and structural refactoring.

## When to Use This Guide

- Creating a new skill from scratch
- Evolving an existing skill after real-world usage reveals gaps
- Reviewing a skill for format compliance and content quality
- Understanding the agentskills.io standard and how skills fit into the broader system
- Refactoring a skill that has grown beyond the 500-line limit

## Prerequisites

- Familiarity with how skills, agents, teams, and guides relate to each other (see the [Architecture section](../CLAUDE.md) of the project CLAUDE.md)
- Write access to the repository
- A text editor that handles YAML frontmatter and markdown
- Node.js installed (for running `npm run update-readmes` after registry changes)

## Workflow Overview

The skill lifecycle follows a repeating cycle:

```text
create --> use --> evolve --> review --> refactor (if needed) --> use --> ...
```

Three skills drive this cycle:

1. **create-skill** ([SKILL.md](../skills/create-skill/SKILL.md)) -- authoring a new skill from scratch
2. **evolve-skill** ([SKILL.md](../skills/evolve-skill/SKILL.md)) -- refining or extending an existing skill
3. **review-skill-format** ([SKILL.md](../skills/review-skill-format/SKILL.md)) -- validating format compliance

Two additional skills handle maintenance:

- **update-skill-content** ([SKILL.md](../skills/update-skill-content/SKILL.md)) -- improving content quality in existing skills
- **refactor-skill-structure** ([SKILL.md](../skills/refactor-skill-structure/SKILL.md)) -- extracting bloated skills into the progressive disclosure pattern

The [skill-reviewer](../agents/skill-reviewer.md) agent is the designated persona for review work. It has access to all three review skills and uses severity levels (BLOCKING, SUGGEST, NIT) to prioritize feedback.

## The SKILL.md Format

Every skill lives at `skills/<skill-name>/SKILL.md`. The file has two parts: YAML frontmatter and standardized markdown sections.

### Frontmatter

```yaml
---
name: skill-name-here
description: >
  One to three sentences. Must be clear enough for an agent to decide
  whether to activate this skill. Max 1024 characters.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: R | TypeScript | Python | Docker | Rust | multi
  tags: comma, separated, lowercase, tags
---
```

**Required fields**: `name`, `description`, `allowed-tools`

**Metadata conventions**:

| Field | Values | Guidance |
|---|---|---|
| `complexity` | basic, intermediate, advanced | basic = under 5 steps, no edge cases; intermediate = 5-10 steps, some judgment; advanced = 10+ steps, significant domain knowledge |
| `language` | R, TypeScript, Python, Docker, Rust, multi | Primary language of the skill's code blocks; use `multi` for cross-language skills |
| `tags` | 3-6 lowercase tags | Include the domain name; used for discovery |

### Standardized Sections

Every SKILL.md must contain these six sections in order:

1. **When to Use** -- 3-5 trigger conditions written from the agent's perspective. These are the conditions an agent checks to decide whether to activate the skill.

2. **Inputs** -- Required and optional inputs with types and defaults. Separate required from optional clearly.

3. **Procedure** -- The core of the skill. Numbered steps (`### Step N: Title`), each with concrete code, an `**Expected:**` block describing success, and an `**On failure:**` block with recovery steps.

4. **Validation** -- A checklist of binary pass/fail criteria the agent runs after completing the procedure. Each item must be objectively verifiable. "Code is clean" is bad. "`devtools::check()` returns 0 errors" is good.

5. **Common Pitfalls** -- 3-6 pitfalls with cause and avoidance. Draw from real experience. The best pitfalls are ones that waste significant time and are non-obvious.

6. **Related Skills** -- 2-5 cross-references to skills commonly used before, after, or alongside this one. Use the skill `name` field (kebab-case).

## Creating a New Skill

This section walks through the process step by step. For the full machine-consumable procedure, see the [create-skill](../skills/create-skill/SKILL.md) skill.

### 1. Choose a Domain and Name

Skills are organized by domain. Check the existing domains in `skills/_registry.yml` to find the right fit. If no domain matches, you can create a new one.

Naming conventions:
- Use lowercase kebab-case: `submit-to-cran`, not `SubmitToCRAN`
- Start with a verb: `create-`, `setup-`, `write-`, `deploy-`, `configure-`, `diagnose-`
- Be specific: `create-r-dockerfile` not `create-dockerfile`

### 2. Create the Directory and File

```bash
mkdir -p skills/<skill-name>/
```

Write `SKILL.md` with the frontmatter and all six required sections. Use existing skills as models -- basic skills like `write-vignette` run about 80-120 lines, intermediate skills like `write-testthat-tests` run 120-180 lines, and advanced skills like `submit-to-cran` run 180-250 lines.

### 3. Write Effective Procedure Steps

The procedure is the heart of a skill. Each step follows this pattern:

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific.

**On failure:** Recovery steps. Provide the most common failure cause and its resolution.
```

Guidelines for writing good steps:
- Each step should be independently verifiable
- Include actual code, not pseudocode
- Put the common path first, edge cases in "On failure"
- 5-10 steps is the sweet spot; under 5 may be too vague, over 12 should be split

### 4. Update the Registry

Edit `skills/_registry.yml` and add the new skill under the appropriate domain:

```yaml
- id: skill-name-here
  path: domain/skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

Increment the `total_skills` count at the top of the registry file.

### 5. Regenerate READMEs

```bash
npm run update-readmes
```

This updates the auto-generated sections in README files from the registries. CI will also auto-commit README updates when registry files change on `main`, but running locally ensures you catch errors early.

### 6. Validate Before Committing

```bash
# Check line count (must be 500 or fewer)
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# Check required frontmatter fields
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

### 7. Create Slash Command Symlinks (Optional)

To make the skill discoverable as a `/slash-command` in Claude Code:

```bash
# Project-level (available in this project)
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# Global (available in all projects)
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

## The Progressive Disclosure Pattern

SKILL.md files must stay under 500 lines. CI enforces this limit on all PRs touching `skills/`. When a skill grows beyond this limit, extract extended content to a `references/` subdirectory.

### Directory Structure

```text
skills/<skill-name>/
  SKILL.md                     # Main file (500 lines max)
  references/
    EXAMPLES.md                # Extended code examples, full configs
    CITATIONS.bib              # BibTeX references (optional)
    CITATIONS.md               # Human-readable references (optional)
```

### What to Extract

Move these to `references/EXAMPLES.md`:
- Code blocks longer than 15 lines
- Full configuration files with all options
- Multi-variant examples (development, staging, production)
- Extended troubleshooting scenarios

Keep these inline in SKILL.md:
- Brief 3-10 line snippets for the common case
- Essential one-liners that define a step

After extracting, add a cross-reference in the main SKILL.md pointing to the extracted content. For the full extraction process, see the [refactor-skill-structure](../skills/refactor-skill-structure/SKILL.md) skill.

## Evolving Skills

Skills improve through use. When real-world usage reveals gaps, stale content, or missing edge cases, the skill needs evolution. The [evolve-skill](../skills/evolve-skill/SKILL.md) skill documents this process in full.

### When to Evolve

- Procedure steps reference outdated tools or APIs
- Users report unclear or incomplete steps
- A skill needs to grow from basic to intermediate complexity
- New related skills were added and cross-references are stale
- Common failure modes are not documented in Common Pitfalls

### Refinement vs. Variant

The key decision during evolution is whether to refine in-place or create an advanced variant:

| Criteria | Refinement | Advanced Variant |
|---|---|---|
| Skill identity | Unchanged | New ID: `<skill>-advanced` |
| File location | Same SKILL.md | New directory |
| Version | Bump patch/minor | Starts at 1.0 |
| Registry | No new entry | New entry added |
| Original skill | Modified directly | Left intact |

**Default to refinement.** You can always extract a variant later; merging one back is harder.

### Version Bumping

Update the `version` field in frontmatter to track changes:

| Change Type | Version Bump | Example |
|---|---|---|
| Typo, wording fix | Patch: 1.0 to 1.1 | Fixed unclear sentence in Step 3 |
| New step, new pitfall | Minor: 1.0 to 2.0 | Added Step 7 for edge case handling |
| Restructured procedure | Major: 1.0 to 2.0 | Reorganized from 5 to 8 steps |

## Reviewing Skills

The [skill-reviewer](../agents/skill-reviewer.md) agent handles skill review, using three specialized skills: `review-skill-format`, `update-skill-content`, and `refactor-skill-structure`.

### Review Checklist

When reviewing a skill (either your own or a contribution), verify:

**Format compliance**:
- [ ] YAML frontmatter parses without errors
- [ ] `name` field matches the directory name
- [ ] `description` is under 1024 characters
- [ ] All six required sections are present

**Procedure quality**:
- [ ] Every step has concrete code (not pseudocode)
- [ ] Every step has both `**Expected:**` and `**On failure:**` blocks
- [ ] Steps are independently verifiable
- [ ] Step count is between 5 and 12

**Cross-references**:
- [ ] Related Skills reference valid, existing skill names
- [ ] Skill is listed in `_registry.yml` with correct path and metadata
- [ ] `total_skills` count in registry matches actual skill count on disk

**Limits**:
- [ ] SKILL.md is 500 lines or fewer
- [ ] Inline code blocks are 15 lines or fewer (extract longer blocks to references/)

### Severity Levels

The skill-reviewer agent uses three severity levels:

- **BLOCKING** -- Must fix before merge. Missing frontmatter fields, absent sections, steps without On failure blocks.
- **SUGGEST** -- Should fix. Description over 1024 characters, thin validation section, vague pitfalls.
- **NIT** -- Optional. Tag improvements, wording polish, formatting consistency.

## Registry Integration

The `skills/_registry.yml` file is the machine-readable catalog of all skills. Every skill must have a corresponding entry.

### Registry Format

```yaml
version: "1.6"
generated: "2026-02-17"
standard: "agentskills.io/specification"
total_skills: 267

domains:
  r-packages:
    description: R package development lifecycle skills
    skills:
      - id: create-r-package
        path: r-packages/create-r-package/SKILL.md
        complexity: basic
        language: R
        description: Scaffold a new R package with complete structure
```

### Adding a New Entry

1. Find the correct domain section (or create a new domain block with a `description` field)
2. Add the skill entry with `id`, `path`, `complexity`, `language`, and `description`
3. Increment `total_skills` at the top of the file
4. Verify the count matches: `find skills -name SKILL.md | wc -l`

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| CI fails on skill validation | Missing frontmatter field or required section | Check the error log; run `head -20` on the SKILL.md to verify frontmatter, then grep for each required section heading |
| `total_skills` count mismatch | Registry was not updated after adding or removing a skill | Run `find skills -name SKILL.md \| wc -l` and update the `total_skills` field |
| Skill exceeds 500 lines | Too much inline content | Apply the [refactor-skill-structure](../skills/refactor-skill-structure/SKILL.md) procedure to extract examples to `references/EXAMPLES.md` |
| Wrong domain classification | Skill could fit multiple domains | Choose the domain that best matches the skill's primary audience; a Docker skill for R should go under `containerization`, not `r-packages` |
| Symlink does not resolve | Incorrect relative path | Use `readlink -f .claude/skills/<skill-name>/SKILL.md` to debug; remember the path from `.claude/skills/` needs `../../skills/<skill-name>` |
| README not updated after registry change | Did not run the generation script | Run `npm run update-readmes`; CI also auto-commits on pushes to `main` |
| Stale cross-references after rename | Old skill name still referenced in other skills | `grep -r "old-skill-name" skills/` to find all references and update them |

## Related Resources

- [Skill Reviewer Agent](../agents/skill-reviewer.md) -- the designated agent for skill quality review
- [create-skill](../skills/create-skill/SKILL.md) -- full machine-consumable procedure for authoring a new skill
- [evolve-skill](../skills/evolve-skill/SKILL.md) -- procedure for evolving existing skills
- [review-skill-format](../skills/review-skill-format/SKILL.md) -- format validation checklist
- [update-skill-content](../skills/update-skill-content/SKILL.md) -- content improvement procedure
- [refactor-skill-structure](../skills/refactor-skill-structure/SKILL.md) -- structural refactoring for over-long skills
- [Content Styleguide](content-styleguide.md) -- canonical markdown formatting for SKILL.md (tables, fences, headings)
- [CLAUDE.md "Adding a New Skill"](../CLAUDE.md) -- the abbreviated checklist in the project root
- [agentskills.io specification](https://agentskills.io/specification) -- the open standard this system follows
