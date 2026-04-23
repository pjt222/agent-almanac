---
name: create-skill
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a new SKILL.md file following the Agent Skills open standard
  (agentskills.io). Covers frontmatter schema, section structure,
  writing effective procedures with Expected/On failure pairs,
  validation checklists, cross-referencing, and registry integration.
  Use when codifying a repeatable procedure for agents, adding a new
  capability to the skills library, converting a guide or runbook into
  agent-consumable format, or standardizing a workflow across projects
  or teams.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.2"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, standard, authoring
---

# Create a New Skill

Author SKILL.md file that agentic systems can consume to run a specific procedure.

## When Use

- Codifying repeatable procedure agents should follow
- Adding new capability to skills library
- Converting guide, runbook, or checklist into agent-consumable format
- Standardizing workflow across projects or teams

## Inputs

- **Required**: Task skill should accomplish
- **Required**: Domain classification — one of 48 domains in `skills/_registry.yml`:
  `r-packages`, `jigsawr`, `containerization`, `reporting`, `compliance`, `mcp-integration`,
  `web-dev`, `git`, `general`, `citations`, `data-serialization`, `review`, `bushcraft`,
  `esoteric`, `design`, `defensive`, `project-management`, `devops`, `observability`, `mlops`,
  `workflow-visualization`, `swarm`, `morphic`, `alchemy`, `tcg`, `intellectual-property`,
  `gardening`, `shiny`, `animal-training`, `mycology`, `prospecting`, `crafting`,
  `library-science`, `travel`, `relocation`, `a2a-protocol`, `geometry`, `number-theory`,
  `stochastic-processes`, `theoretical-science`, `diffusion`, `hildegard`, `maintenance`,
  `blender`, `visualization`, `3d-printing`, `lapidary`, `versioning`
- **Required**: Complexity level (basic, intermediate, advanced)
- **Optional**: Source material (existing guide, runbook, working example)
- **Optional**: Related skills to cross-reference

## Steps

### Step 1: Create Directory

Each skill lives in own directory:

```bash
mkdir -p skills/<skill-name>/
```

Naming conventions:
- Use lowercase kebab-case: `submit-to-cran`, not `SubmitToCRAN`
- Start with verb: `create-`, `setup-`, `write-`, `deploy-`, `configure-`
- Be specific: `create-r-dockerfile` not `create-dockerfile`

**Got:** Directory `skills/<skill-name>/` exists. Name follows lowercase kebab-case starting with verb.

**If fail:** Name does not start with verb? Rename directory. Check naming conflicts: `ls skills/ | grep <keyword>` to ensure no existing skill has overlapping name.

### Step 2: Write YAML Frontmatter

```yaml
---
name: skill-name-here
description: >
  One to three sentences plus key activation triggers. Must be clear
  enough for an agent to decide whether to activate this skill from
  the description alone. Max 1024 characters. Start with a verb.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob  # optional, experimental
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: R | TypeScript | Python | Docker | Rust | multi
  tags: comma, separated, lowercase, tags
---
```

**Required fields**: `name`, `description`

**Optional fields**: `license`, `allowed-tools` (experimental), `metadata`, `compatibility`

**Metadata conventions**:
- `complexity`: basic (< 5 steps, no edge cases), intermediate (5-10 steps, some judgment), advanced (10+ steps, big domain knowledge)
- `language`: primary language; use `multi` for cross-language skills
- `tags`: 3-6 tags for discovery; include domain name

**Got:** YAML frontmatter parses without errors, `name` matches directory name, `description` under 1024 characters with clear activation triggers.

**If fail:** Validate YAML. Check matching `---` delimiters, proper quoting of version strings (e.g., `"1.0"` not `1.0`), right `>` multi-line folding syntax for description field.

### Step 3: Write the Title and Introduction

```markdown
# Skill Title (Imperative Verb Form)

One paragraph: what this skill accomplishes and the value it provides.
```

Title should match `name` but in human-readable form. "Submit to CRAN" not "submit-to-cran".

**Got:** Top-level `#` heading in imperative form followed by concise paragraph stating what skill accomplishes.

**If fail:** Title reads as noun phrase, not verb phrase? Rewrite. "Package Submission" becomes "Submit to CRAN."

### Step 4: Write "When to Use"

List 3-5 trigger conditions — concrete scenarios where agent should activate this skill:

```markdown
## When to Use

- Starting a new R package from scratch
- Converting loose R scripts into a package
- Setting up a package skeleton for collaborative development
```

Write from agent's perspective. These are conditions agent checks to decide activation.

> **Note**: Most important trigger conditions should also appear in `description` frontmatter field. Read during discovery phase before full body loaded. `## When to Use` section gives extra detail and context.

**Got:** 3-5 bullet points describing concrete, observable conditions under which agent should activate this skill.

**If fail:** Triggers feel vague ("when something needs to be done")? Rewrite from agent's perspective: what observable state or user request would trigger activation?

### Step 5: Write "Inputs"

Separate required from optional. Be specific about types and defaults:

```markdown
## Inputs

- **Required**: Package name (lowercase, no special characters except `.`)
- **Required**: One-line description of the package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Whether to initialize renv (default: yes)
```

**Got:** Inputs section clearly separates required from optional params. Each has type hint and default value where applicable.

**If fail:** Parameter's type ambiguous? Add concrete example in parentheses: "Package name (lowercase, no special characters except `.`)".

### Step 6: Write "Procedure"

Core of skill. Each step follows this pattern:

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific — file created, output matches pattern, command exits 0.

**On failure:** Recovery steps. Don't just say "fix it" — provide the most common failure cause and its resolution.
```

**Writing effective steps**:
- Each step independently verifiable
- Include actual code, not pseudocode
- Put most common path first, edge cases in "On failure"
- 5-10 steps is sweet spot. Under 5 may be too vague; over 12 should split into multiple skills.
- Reference real tools and real commands, not abstract descriptions

**Writing for translation**:
- Target ~400 lines maximum for English skills. German expands 10-20%, some CJK translations expand more — 400-line English source stays under 500 after translation.
- Dodge idioms and culturally-specific examples that translate poorly.
- Keep prose concise and direct — shorter sentences translate better.

**Got:** Procedure section has 5-12 numbered steps, each with concrete code, `**Expected:**` outcome, `**On failure:**` recovery action.

**If fail:** Step lacks code? Add actual command or configuration. Expected/On failure missing? Write now — every step that can fail needs both.

### Step 7: Write "Validation"

Checklist agent runs after completing procedure:

```markdown
## Validation

- [ ] Criterion 1 (testable, binary pass/fail)
- [ ] Criterion 2
- [ ] No errors or warnings in output
```

Each item must be objectively verifiable. "Code is clean" is bad. "`devtools::check()` returns 0 errors" is good.

**Got:** Markdown checklist (`- [ ]`) with 3-8 binary pass/fail criteria agent can verify programmatically or by inspection.

**If fail:** Replace subjective criteria with measurable ones. "Well-documented" becomes "All exported functions have `@param`, `@return`, `@examples` roxygen tags."

### Step 8: Write "Common Pitfalls"

3-6 pitfalls with cause and avoidance:

```markdown
## Common Pitfalls

- **Pitfall name**: What goes wrong and how to avoid it. Be specific about the symptom and the fix.
```

Draw from real experience. Best pitfalls are ones wasting big time, non-obvious.

**Got:** 3-6 pitfalls, each with bold name, description of what goes wrong, how to dodge it.

**If fail:** Pitfalls feel generic ("be careful with X")? Make specific: name symptom, cause, fix. Draw from actual failure scenarios met during development or testing.

### Step 9: Write "Related Skills"

Cross-reference 2-5 skills commonly used before, after, or alongside this one:

```markdown
## Related Skills

- `prerequisite-skill` - must be done before this skill
- `follow-up-skill` - commonly done after this skill
- `alternative-skill` - alternative approach to the same goal
```

Use skill `name` field (kebab-case), not title.

**Got:** 2-5 related skills listed with kebab-case IDs and brief descriptions of relationship (prerequisite, follow-up, alternative).

**If fail:** Verify each referenced skill exists: `ls skills/<skill-name>/SKILL.md`. Drop any references to skills renamed or removed.

### Step 10: Add to Registry

Edit `skills/_registry.yml`. Add new skill under right domain:

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

Update `total_skills` count at top of registry.

**Got:** New entry shows in `skills/_registry.yml` under right domain. `total_skills` count matches actual number of skill directories on disk.

**If fail:** Count skills on disk with `find skills -name SKILL.md | wc -l`. Compare against `total_skills` in registry. Verify `id` field matches directory name exactly.

### Step 11: Add Citations (Optional)

Skill based on established methodologies, research papers, software packages, standards? Add citation subfiles to `references/` directory:

```bash
mkdir -p skills/<skill-name>/references/
```

Create two files:

- **`references/CITATIONS.bib`** — Machine-readable BibTeX (source of truth)
- **`references/CITATIONS.md`** — Human-readable rendered references for GitHub browsing

```bibtex
% references/CITATIONS.bib
@article{author2024title,
  author  = {Author, First and Other, Second},
  title   = {Paper Title},
  journal = {Journal Name},
  year    = {2024},
  doi     = {10.xxxx/xxxxx}
}
```

```markdown
<!-- references/CITATIONS.md -->
# Citations

References underpinning the **skill-name** skill.

1. Author, F., & Other, S. (2024). *Paper Title*. Journal Name. https://doi.org/10.xxxx/xxxxx
```

Citations optional — add when provenance tracking matters (academic methods, published standards, regulatory frameworks).

**Handling `references/` in translations**: Prose descriptions in `references/EXAMPLES.md` should translate. `references/CITATIONS.bib` stays English (BibTeX is language-neutral). Translations may symlink to English `references/` directory if content is code-only.

**Got:** Both files exist. `.bib` parses as valid BibTeX.

**If fail:** Validate BibTeX syntax with `bibtool -d references/CITATIONS.bib` or online validator.

### Step 12: Validate Skill

Run local validation checks before committing:

```bash
# Check line count (must be ≤500)
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# Check required frontmatter fields
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**Got:** Line count ≤500. All required fields present.

**If fail:** Over 500 lines? Apply progressive disclosure — extract large code blocks (>15 lines) to `references/EXAMPLES.md`:

```bash
mkdir -p skills/<skill-name>/references/
```

Move extended code examples, full configuration files, multi-variant examples to `references/EXAMPLES.md`. Add cross-reference in SKILL.md: `See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` Keep brief inline snippets (3-10 lines) in main SKILL.md. CI workflow at `.github/workflows/validate-skills.yml` enforces these limits on all PRs.

### Step 13: Create Slash Command Symlinks

Create symlinks so Claude Code discovers skill as `/slash-command`:

```bash
# Project-level (available in this project)
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# Global (available in all projects)
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**Got:** `ls -la .claude/skills/<skill-name>/SKILL.md` resolves to skill file.

**If fail:** Verify relative path right. From `.claude/skills/`, path `../../skills/<skill-name>` should reach skill directory. Use `readlink -f` to debug symlink resolution. Claude Code expects flat structure at `.claude/skills/<name>/SKILL.md`.

### Step 14: Scaffold Translations

> **Required for all skills.** This step applies to both human authors and AI agents following this procedure. Do not skip — missing translations pile into stale backlog.

Scaffold translation files for all 4 supported locales right after committing new skill:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- skills <skill-name> "$locale"
done
```

Then translate scaffolded prose in each file (code blocks and IDs stay English). Finally regenerate status files:

```bash
npm run translation:status
```

**Got:** 4 files created at `i18n/{de,zh-CN,ja,es}/skills/<skill-name>/SKILL.md`, all with `source_commit` matching current HEAD. `npm run validate:translations` shows 0 stale warnings for new skill.

**If fail:** Scaffold fails? Verify skill exists in `skills/_registry.yml` before scaffolding — script reads registry. `translation:status` shows new files as stale? Check `source_commit` matches commit hash where English source was last modified.

## Checks

- [ ] SKILL.md exists at `skills/<skill-name>/SKILL.md`
- [ ] YAML frontmatter parses without errors
- [ ] `name` field matches directory name
- [ ] `description` under 1024 characters
- [ ] All required sections present: When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills
- [ ] Every procedure step has concrete code and Expected/On failure pairs
- [ ] Related Skills reference valid skill names
- [ ] Skill listed in `_registry.yml` with right path
- [ ] `total_skills` count in registry updated
- [ ] SKILL.md ≤500 lines (extract to `references/EXAMPLES.md` if over)
- [ ] Estimated translation expansion acceptable (English source ≤~400 lines so translations stay <500)
- [ ] Citations added to `references/CITATIONS.bib` + `CITATIONS.md` if skill based on published methods
- [ ] Symlink exists at `.claude/skills/<skill-name>` pointing to skill directory
- [ ] Global symlink exists at `~/.claude/skills/<skill-name>` (if globally available)

## Pitfalls

- **Vague procedures**: "Configure the system appropriately" is useless to agent. Give exact commands, file paths, configuration values.
- **Missing On failure**: Every step that can fail needs recovery guidance. Agents can't improvise — they need fallback spelled out.
- **Overly broad scope**: Skill trying to cover "Set up entire development environment" should be 3-5 focused skills instead. One skill = one procedure.
- **Untestable validation**: "Code quality is good" can't be verified. "Linter passes with 0 warnings" can.
- **Stale cross-references**: When renaming or removing skills, grep for old name in all Related Skills sections.
- **Description too long**: Description field is what agents read to decide activation. Keep under 1024 characters. Front-load key info.
- **Authoring at 500-line limit for single language**: English skill at 490 lines will exceed 500 when translated to German (~10-20% expansion) or CJK languages. Target ~400 lines for English source. Use progressive disclosure (`references/EXAMPLES.md`) for rest.
- **Avoid `git mv` on NTFS-mounted paths (WSL)**: On `/mnt/` paths, `git mv` for directories can make broken permissions (`d?????????`). Use `mkdir -p` + copy files + `git rm` the old path instead. See [environment guide](../../guides/setting-up-your-environment.md) troubleshooting section.

## Examples

Well-structured skill follows this quality checklist:
1. Agent can decide whether to use it from description alone
2. Procedure can be followed mechanically without ambiguity
3. Every step has verifiable outcome
4. Failure modes have concrete recovery paths
5. Skill can be composed with related skills

Size reference from this library:
- Basic skills: ~80-120 lines (e.g., `write-vignette`, `configure-git-repository`)
- Intermediate skills: ~120-180 lines (e.g., `write-testthat-tests`, `manage-renv-dependencies`)
- Advanced skills: ~180-250 lines (e.g., `submit-to-cran`, `setup-gxp-r-project`)
- Skills with extended examples: SKILL.md ≤500 lines + `references/EXAMPLES.md` for large configs

## See Also

- `evolve-skill` - evolve and refine skills created with this procedure
- `create-agent` - parallel procedure for creating agent definitions
- `create-team` - parallel procedure for creating team compositions
- `write-claude-md` - CLAUDE.md can reference skills for project-specific workflows
- `configure-git-repository` - skills should be version-controlled
- `commit-changes` - commit new skill and its symlinks
- `security-audit-codebase` - review skills for accidentally included secrets or credentials
