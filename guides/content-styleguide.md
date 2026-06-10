---
title: "Content Styleguide"
description: "Canonical markdown formatting conventions for skills, agents, teams, and guides — tables, code fences, headings, lists, and links"
category: reference
agents: [skill-reviewer]
teams: []
skills: [create-skill, review-skill-format]
---

# Content Styleguide

This guide defines the canonical **markdown formatting** conventions for every content file in the repository — skills (`skills/*/SKILL.md`), agents (`agents/*.md`), teams (`teams/*.md`), and guides (`guides/*.md`). The four `_template.md` files cover *structure* (required sections, frontmatter fields); this guide covers *formatting* (how the markdown inside those sections is written).

The rules below codify the **dominant existing style** so the corpus reads consistently and renders cleanly everywhere it is consumed — GitHub, the static site, and the CLI page renderer. They are not aspirational: where a convention is already near-universal (leading-pipe tables, `-` bullets), this guide records it rather than inventing a new one.

## When to Use This Guide

- Authoring a new skill, agent, team, or guide and wanting the formatting right the first time
- Reviewing a content PR and needing an objective formatting reference
- Editing an existing file and unsure which table or fence style to use
- Writing or extending a CI check that validates content formatting
- Resolving a disagreement about "which style is correct"

## Prerequisites

- Familiarity with [GitHub-Flavored Markdown](https://github.github.com/gfm/) (GFM)
- The relevant `_template.md` for the content type you are writing (structure comes first; this guide refines formatting)
- For skills: [create-skill](../skills/create-skill/SKILL.md) and [creating-skills](creating-skills.md)
- For agents and teams: [agent-best-practices](agent-best-practices.md) and [creating-agents-and-teams](creating-agents-and-teams.md)

## Workflow Overview

Apply these conventions while writing, not as a cleanup afterthought. The CI check (`validate-content-style.yml`) enforces the mechanically-detectable rules on content PRs — see [Enforcement](#enforcement). Structure (frontmatter, required sections) is owned by the templates and the type-specific validators; this guide owns the markdown formatting that sits inside that structure.

## Tables

Use GFM pipe tables. Three rules, all already followed by the majority of the corpus:

1. **Compact separator row** — exactly three dashes per column: `|---|---|---|`. Do **not** pad the dashes to match column width. Rendered output ignores the dash count, so width-matched "decorative" separators only bloat the source and create noisy diffs.
2. **Always use leading and trailing pipes** — `| a | b |`, never `a | b`. Both are GFM-legal; the leading-pipe form is the corpus standard.
3. **Alignment markers only when meaningful** — add `:---` (left), `---:` (right), or `:---:` (center) only when the alignment carries meaning (e.g. right-aligning a numeric column). Otherwise omit them.

Do:

```markdown
| Input | Type | Description |
|---|---|---|
| Layout spec | Configuration | Canvas dimensions and margins |
| Style params | CSS | Colors, fonts, stroke widths |
```

Don't:

```markdown
| Input        | Type          | Description                    |
|--------------|---------------|--------------------------------|
| Layout spec  | Configuration | Canvas dimensions and margins  |
Style params | CSS | Colors, fonts, stroke widths
```

The "don't" example shows both anti-patterns: width-matched decorative dashes (row 2) and a missing leading pipe (row 4).

## Code Fences

- **Always tag the language** on the opening fence: `bash`, `r`, `yaml`, `json`, `python`, `markdown`, `text`, `console`, `diff`. Use `text` (or `console` for shell sessions with prompts/output) when no language fits — never leave the tag empty.
- **Use fenced blocks** (` ``` `), not indented (4-space) code blocks. Fenced blocks carry a language tag and are unambiguous.
- **R code** uses package-qualified calls — `devtools::check()`, not `library(devtools); check()` — per the repository-wide R convention. This guide does not restate the R rules; see [creating-skills](creating-skills.md).
- To show a fenced block *inside* an example, wrap the example in a four-backtick fence so the inner triple-backticks render literally.

Do:

```bash
npm run update-readmes
```

Don't (untagged — loses syntax highlighting and is harder to scan):

````markdown
```
npm run update-readmes
```
````

## Headings

- **ATX style** (`#`), with a single space after the hashes: `## Section`, never `##Section` or Setext underlines.
- **One `#` (H1) per file**, reserved for the document title. All other headings are H2 or deeper.
- **No skipped levels** — an H2 is followed by H2 or H3, never jumping straight to H4.
- **No trailing hashes** — `## Section`, not `## Section ##`.
- Match the section names the relevant `_template.md` prescribes; this guide governs their *form*, not their *names*.

## Lists, Emphasis & Inline Code

- **Unordered lists use `-`** (hyphen), not `*` or `+`. The hyphen is the corpus standard by a wide margin.
- **Ordered lists use `1.`** with a period. For procedure steps, follow the template's numbered-step pattern.
- **Nested list items indent by two spaces** under their parent.
- **Bold** is `**text**`; *italic* is `*text*`. Do not use `__` or `_` for emphasis.
- **Inline code** uses single backticks for file paths, commands, identifiers, and field names: `skills/_registry.yml`, `total_skills`, `devtools::check()`.
- Skill procedure steps keep the `**Expected:**` / `**On failure:**` block convention defined by the skill template — this guide does not change it.

## Links

- **Inline links** are the default: `[label](path)`. Reference-style links are acceptable only when the same target is reused many times in one document.
- **Use relative paths** for in-repo links, anchored at the file's own location:
  - skill → skill: `[name](../other-skill/SKILL.md)`
  - guide → agent: `[name](../agents/name.md)`
  - guide → skill: `[name](../skills/name/SKILL.md)`
  - guide → guide: `[name](other-guide.md)`
- **Verify the target exists** before linking. Broken relative links are a content bug.
- Use descriptive link text, not bare URLs or "click here".

## Blockquotes & Callouts

- Use `>` blockquotes sparingly — for genuine quotations or short asides.
- Prefer **bold inline labels** for emphasis (`**Note:**`, `**Warning:**`) over heavy callout syntax, matching existing usage.

## Line & File Conventions

- **Line endings are LF** (`\n`). The repository's `.gitattributes` mandates `*.md text eol=lf`; git's clean filter normalizes CRLF to LF on every `git add`. Authoring with CRLF produces a near-full-file diff on the first commit (the "CRLF→LF normalization" diff) — author in LF to avoid it.
- **End every file with a single trailing newline.**
- **Frontmatter** is YAML delimited by `---`, kept in the order the template prescribes. Do not reorder or drop required fields.
- **No hard tabs** in markdown body text; use spaces.
- Soft-wrap prose at natural sentence boundaries. There is **no fixed column limit and no one-sentence-per-line rule** — do not rewrap existing paragraphs solely for line length.

## Enforcement

The `validate-content-style.yml` workflow runs on PRs touching `skills/`, `agents/`, `teams/`, `guides/`, or `i18n/`. It is intentionally split by how reliably each rule can be detected from a diff:

| Rule | Mode | Why |
|---|---|---|
| Decorative-dash separators | **Block** (on added lines) | Separator rows are self-identifying and context-free — line-local detection is reliable |
| Untagged code fences | **Block** (on added lines) | The full-file fence-state parser distinguishes openers from closers, so untagged openers on added lines are detected reliably |
| Missing leading pipe | Documented, not enforced | Already 100% followed across the corpus |

Blocking checks evaluate **added lines only**, so editing a legacy file does not force normalizing its pre-existing violations. The corpus-wide normalization pass (#272) compacted every decorative separator and tagged every code fence, so both rules now **block**: a newly-added decorative separator or untagged fence fails CI.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| Huge diff on a one-line edit | CRLF blob normalized to LF on `git add` | Expected; footnote it in the PR. Author in LF |
| CI flags a table you did not change | Added line happens to be a decorative separator | Convert that separator to `\|---\|---\|`; only added lines are checked |
| Fenced example renders as one block | Inner ` ``` ` not escaped | Wrap the example in a four-backtick fence |
| Broken relative link | Wrong number of `../` segments | Count segments from the file's own directory |

## Related Resources

- [create-skill](../skills/create-skill/SKILL.md) -- authoring skills (structure + procedure)
- [review-skill-format](../skills/review-skill-format/SKILL.md) -- validating skill formatting
- [creating-skills](creating-skills.md) -- skill authoring workflow and R conventions
- [creating-agents-and-teams](creating-agents-and-teams.md) -- agent and team authoring workflow
- [agent-best-practices](agent-best-practices.md) -- agent design and quality guidance
- [skill-reviewer](../agents/skill-reviewer.md) -- agent that reviews content formatting
