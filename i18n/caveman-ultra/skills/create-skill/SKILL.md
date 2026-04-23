---
name: create-skill
locale: caveman-ultra
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

Author SKILL.md → agents execute procedure.

## Use When

- Codify repeatable proc for agents
- New cap → skills lib
- Guide/runbook → agent-consumable
- Std workflow across projects/teams

## In

- **Required**: Task
- **Required**: Domain — 1 of 48 in `skills/_registry.yml`:
  `r-packages`, `jigsawr`, `containerization`, `reporting`, `compliance`, `mcp-integration`,
  `web-dev`, `git`, `general`, `citations`, `data-serialization`, `review`, `bushcraft`,
  `esoteric`, `design`, `defensive`, `project-management`, `devops`, `observability`, `mlops`,
  `workflow-visualization`, `swarm`, `morphic`, `alchemy`, `tcg`, `intellectual-property`,
  `gardening`, `shiny`, `animal-training`, `mycology`, `prospecting`, `crafting`,
  `library-science`, `travel`, `relocation`, `a2a-protocol`, `geometry`, `number-theory`,
  `stochastic-processes`, `theoretical-science`, `diffusion`, `hildegard`, `maintenance`,
  `blender`, `visualization`, `3d-printing`, `lapidary`, `versioning`
- **Required**: Complexity (basic/intermediate/advanced)
- **Optional**: Src (guide/runbook/working example)
- **Optional**: Related skills

## Do

### Step 1: Create Dir

Each skill → own dir:

```bash
mkdir -p skills/<skill-name>/
```

Naming:
- Kebab-case lowercase: `submit-to-cran`, not `SubmitToCRAN`
- Start w/ verb: `create-`, `setup-`, `write-`, `deploy-`, `configure-`
- Specific: `create-r-dockerfile` not `create-dockerfile`

**Got:** Dir exists, name = kebab-case + verb.

**If err:** No verb → rename. Check conflicts: `ls skills/ | grep <keyword>`.

### Step 2: YAML Frontmatter

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

**Required**: `name`, `description`

**Optional**: `license`, `allowed-tools` (experimental), `metadata`, `compatibility`

**Metadata**:
- `complexity`: basic (<5 steps), intermediate (5-10), advanced (10+)
- `language`: primary; `multi` for cross-lang
- `tags`: 3-6, include domain

**Got:** YAML parses, `name` = dir, `description` <1024 chars + triggers.

**If err:** Validate — `---` matched, `"1.0"` (not `1.0`), `>` multi-line fold for desc.

### Step 3: Title + Intro

```markdown
# Skill Title (Imperative Verb Form)

One paragraph: what this skill accomplishes and the value it provides.
```

Title = `name` in readable. "Submit to CRAN" not "submit-to-cran".

**Got:** `#` heading imperative + concise para.

**If err:** Noun phrase → rewrite verb. "Package Submission" → "Submit to CRAN."

### Step 4: When to Use

3-5 triggers — concrete scenarios:

```markdown
## When to Use

- Starting a new R package from scratch
- Converting loose R scripts into a package
- Setting up a package skeleton for collaborative development
```

Agent perspective → conditions for activation.

> **Note**: Top triggers also in `description` frontmatter (read pre-body-load). `## When to Use` = extra detail.

**Got:** 3-5 bullets w/ concrete observable conds.

**If err:** Vague ("when something needs doing") → rewrite agent perspective: observable state / user req?

### Step 5: Inputs

Required vs optional. Types + defaults:

```markdown
## Inputs

- **Required**: Package name (lowercase, no special characters except `.`)
- **Required**: One-line description of the package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Whether to initialize renv (default: yes)
```

**Got:** Required/optional separated w/ types + defaults.

**If err:** Ambiguous type → add example: "Package name (lowercase, no special characters except `.`)".

### Step 6: Procedure

Core. Each step:

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific — file created, output matches pattern, command exits 0.

**On failure:** Recovery steps. Don't just say "fix it" — provide the most common failure cause and its resolution.
```

**Effective steps**:
- Each independently verifiable
- Real code, not pseudocode
- Common path first, edge cases in "On failure"
- 5-10 steps sweet spot. <5 vague; >12 split skills.
- Real tools + cmds, not abstract

**For translation**:
- Target ~400 lines EN. German +10-20%, CJK more → 400 EN stays <500 translated.
- No idioms / culture-specific.
- Concise prose, short sentences translate better.

**Got:** 5-12 numbered steps, each w/ concrete code + `**Expected:**` + `**On failure:**`.

**If err:** No code → add real cmd/config. No Expected/On failure → write now. Every fail-able step needs both.

### Step 7: Validation

Checklist agent runs post-proc:

```markdown
## Validation

- [ ] Criterion 1 (testable, binary pass/fail)
- [ ] Criterion 2
- [ ] No errors or warnings in output
```

Objectively verifiable. "Code clean" bad. "`devtools::check()` returns 0 errors" good.

**Got:** Markdown checklist w/ 3-8 binary pass/fail.

**If err:** Subjective → measurable. "Well-documented" → "All exported fns have `@param`, `@return`, `@examples` roxygen tags."

### Step 8: Common Pitfalls

3-6 pitfalls w/ cause + avoidance:

```markdown
## Common Pitfalls

- **Pitfall name**: What goes wrong and how to avoid it. Be specific about the symptom and the fix.
```

Real experience. Best = waste time + non-obvious.

**Got:** 3-6 pitfalls, each w/ bold name + desc + avoidance.

**If err:** Generic ("be careful w/ X") → specific: symptom + cause + fix. Draw from real fails.

### Step 9: Related Skills

Xref 2-5 used before/after/alongside:

```markdown
## Related Skills

- `prerequisite-skill` - must be done before this skill
- `follow-up-skill` - commonly done after this skill
- `alternative-skill` - alternative approach to the same goal
```

Skill `name` field (kebab-case), not title.

**Got:** 2-5 related, kebab-case IDs + relationship.

**If err:** Verify: `ls skills/<skill-name>/SKILL.md`. Remove renamed/removed refs.

### Step 10: Registry

Edit `skills/_registry.yml`, add under domain:

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

Update `total_skills` at top.

**Got:** Entry under correct domain, `total_skills` = disk count.

**If err:** Count: `find skills -name SKILL.md | wc -l` vs registry. Verify `id` = dir exact.

### Step 11: Citations (Optional)

Based on methods/papers/pkgs/standards → add `references/`:

```bash
mkdir -p skills/<skill-name>/references/
```

2 files:

- **`references/CITATIONS.bib`** — BibTeX (src of truth)
- **`references/CITATIONS.md`** — rendered for GitHub

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

Optional — add when provenance matters (academic, standards, regulatory).

**Handling `references/` in translations**: Prose in `references/EXAMPLES.md` → translate. `references/CITATIONS.bib` → English (BibTeX lang-neutral). Translations may symlink to EN `references/` if code-only.

**Got:** Both files exist, `.bib` valid.

**If err:** Validate: `bibtool -d references/CITATIONS.bib` / online.

### Step 12: Validate

Local checks pre-commit:

```bash
# Check line count (must be ≤500)
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# Check required frontmatter fields
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**Got:** ≤500 lines, required fields present.

**If err:** >500 → progressive disclosure → extract code blocks (>15 lines) → `references/EXAMPLES.md`:

```bash
mkdir -p skills/<skill-name>/references/
```

Move extended examples, full configs, multi-variant → `references/EXAMPLES.md`. Xref in SKILL.md: `See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` Keep inline snippets (3-10 lines). CI (`.github/workflows/validate-skills.yml`) enforces on PRs.

### Step 13: Slash Command Symlinks

Symlinks → Claude Code discovers as `/slash-command`:

```bash
# Project-level (available in this project)
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# Global (available in all projects)
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**Got:** `ls -la .claude/skills/<skill-name>/SKILL.md` resolves.

**If err:** Rel path correct. From `.claude/skills/`, `../../skills/<skill-name>` reaches dir. Debug: `readlink -f`. Claude Code expects flat `.claude/skills/<name>/SKILL.md`.

### Step 14: Scaffold Translations

> **Required for all skills.** Human + AI authors. Do not skip → backlog.

4 locales post-commit:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- skills <skill-name> "$locale"
done
```

Translate prose (code + IDs EN). Regen:

```bash
npm run translation:status
```

**Got:** 4 files at `i18n/{de,zh-CN,ja,es}/skills/<skill-name>/SKILL.md`, `source_commit` = HEAD. `npm run validate:translations` → 0 stale.

**If err:** Scaffold fail → skill in `skills/_registry.yml` first (script reads registry). `translation:status` shows stale → `source_commit` = commit hash where EN src last modified.

## Check

- [ ] SKILL.md at `skills/<skill-name>/SKILL.md`
- [ ] YAML parses
- [ ] `name` = dir
- [ ] `description` <1024 chars
- [ ] Required sections: When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills
- [ ] Every step has code + Expected/On failure
- [ ] Related Skills = valid names
- [ ] In `_registry.yml` w/ correct path
- [ ] `total_skills` updated
- [ ] SKILL.md ≤500 lines (extract → `references/EXAMPLES.md` if over)
- [ ] EN src ≤~400 lines so translations <500
- [ ] Citations in `references/CITATIONS.bib` + `CITATIONS.md` if pub methods
- [ ] Symlink at `.claude/skills/<skill-name>` → dir
- [ ] Global symlink at `~/.claude/skills/<skill-name>` (if global)

## Traps

- **Vague procedures**: "Configure appropriately" useless to agent. Exact cmds + paths + values.
- **Missing On failure**: Every fail-able step needs recovery. Agents can't improvise.
- **Broad scope**: "Set up entire dev env" → 3-5 focused skills. 1 skill = 1 proc.
- **Untestable validation**: "Code quality good" → "Linter 0 warnings".
- **Stale xrefs**: Rename/remove → grep old name in Related Skills.
- **Desc too long**: Agents read → decide activation. <1024 chars, front-load key info.
- **Authoring @ 500-line limit for 1 lang**: 490 lines EN → exceeds 500 translated (+10-20% German, more CJK). Target ~400 EN + progressive disclosure.
- **Avoid `git mv` on NTFS (WSL)**: `/mnt/` paths → `git mv` dirs → broken perms (`d?????????`). Use `mkdir -p` + copy + `git rm` old. See [env guide](../../guides/setting-up-your-environment.md).

## Examples

Quality checklist:
1. Agent decides activation from desc alone
2. Proc mechanical, no ambiguity
3. Every step verifiable
4. Failure modes → concrete recovery
5. Composable w/ related

Size ref:
- Basic: ~80-120 lines (`write-vignette`, `configure-git-repository`)
- Intermediate: ~120-180 lines (`write-testthat-tests`, `manage-renv-dependencies`)
- Advanced: ~180-250 lines (`submit-to-cran`, `setup-gxp-r-project`)
- Extended: SKILL.md ≤500 + `references/EXAMPLES.md` for large configs

## →

- `evolve-skill` — evolve + refine skills
- `create-agent` — parallel agent proc
- `create-team` — parallel team proc
- `write-claude-md` — CLAUDE.md refs skills
- `configure-git-repository` — version-control skills
- `commit-changes` — commit skill + symlinks
- `security-audit-codebase` — review for secrets
