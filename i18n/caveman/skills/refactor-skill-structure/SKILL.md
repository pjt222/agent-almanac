---
name: refactor-skill-structure
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Refactor over-long or poorly structured SKILL.md. Extract examples to
  references/EXAMPLES.md, split compound procedures, reorganize sections
  for progressive disclosure. Use when skill exceeds 500-line CI limit,
  when code blocks dominate skill body, when a procedure step contains
  multiple unrelated operations, or after content update pushed skill
  over the line limit.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: advanced
  language: multi
  tags: review, skills, refactoring, structure, progressive-disclosure
---

# Refactor Skill Structure

Refactor SKILL.md that exceeded 500-line limit or developed structural problems. This skill extracts extended code examples to `references/EXAMPLES.md`, splits compound procedures into focused sub-procedures, adds cross-references for progressive disclosure, verifies skill stays complete and valid after restructure.

## When Use

- Skill exceeds 500-line limit enforced by CI
- Single procedure step contains multiple unrelated operations that should be separate steps
- Code blocks longer than 15 lines dominate SKILL.md and could be extracted
- Skill accumulated ad-hoc sections that break standard six-section structure
- After content update pushed skill over line limit
- Skill review flagged structural issues beyond content quality

## Inputs

- **Required**: Path to SKILL.md file to refactor
- **Optional**: Target line count (default: aim for 80% of 500-line limit, ~400 lines)
- **Optional**: Whether to create `references/EXAMPLES.md` (default: yes, if extractable content exists)
- **Optional**: Whether to split into multiple skills (default: no, prefer extraction first)

## Steps

### Step 1: Measure Current Line Count and Identify Bloat Sources

Read skill. Build section-by-section line budget to ID where bloat lives.

```bash
# Total line count
wc -l < skills/<skill-name>/SKILL.md

# Line count per section (approximate)
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

Classify bloat sources:
- **Extractable**: Code blocks >15 lines, full configuration examples, multi-variant examples
- **Splittable**: Compound procedure steps doing 2+ unrelated operations
- **Trimable**: Redundant explanations, overly verbose context sentences
- **Structural**: Ad-hoc sections not in standard six-section structure

**Got:** Line budget showing which sections over-sized and which bloat category applies to each. Largest sections = primary refactoring targets.

**If fail:** Skill under 500 lines and no structural issues apparent? This skill may not be needed. Verify refactoring request justified before proceed.

### Step 2: Extract Code Blocks to references/EXAMPLES.md

Move code blocks longer than 15 lines to `references/EXAMPLES.md` file. Keep brief inline snippets (3-10 lines) in main SKILL.md.

1. Create references directory:
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. For each extractable code block:
   - Copy full code block to `references/EXAMPLES.md` under descriptive heading
   - Replace code block in SKILL.md with brief 3-5 line snippet
   - Add cross-reference: `See [EXAMPLES.md](references/EXAMPLES.md#heading) for the complete configuration.`

3. Structure `references/EXAMPLES.md` with clear headings:
   ```markdown
   # Examples

   ## Example 1: Full Configuration

   Complete configuration file for [context]:

   \```yaml
   # ... full config here ...
   \```

   ## Example 2: Multi-Variant Setup

   ### Variant A: Development
   \```yaml
   # ... dev config ...
   \```

   ### Variant B: Production
   \```yaml
   # ... prod config ...
   \```
   ```

**Got:** All code blocks >15 lines extracted. Main SKILL.md keeps brief inline snippets for readability. Cross-references link to extracted content. `references/EXAMPLES.md` well-organized with descriptive headings.

**If fail:** Extract code blocks no reduces line count enough (still over 500)? Proceed to Step 3 for procedure splitting. Skill has very few code blocks (e.g., natural-language skill)? Focus on Steps 3 and 4 instead.

### Step 3: Split Compound Procedures into Focused Steps

Identify procedure steps that perform multiple unrelated operations. Split them.

Signs of compound step:
- Step title contains "and" (e.g., "Configure Database and Set Up Caching")
- Step has multiple Expected/On failure blocks (or should have)
- Step longer than 30 lines
- Step could be skipped or done in different order from sub-parts

For each compound step:
1. ID distinct operations within step
2. Create new `### Step N:` for each operation
3. Renumber subsequent steps
4. Ensure each new step has own Expected and On failure blocks
5. Add transition context between new steps

**Got:** Each procedure step does one thing. No step exceeds 30 lines. Step count may rise but each step independently verifiable.

**If fail:** Splitting step creates too granular steps (e.g., 20+ total)? Group related micro-steps under single step with numbered sub-steps. Sweet spot = 5-12 procedure steps.

### Step 4: Add Cross-References from SKILL.md to Extracted Content

Ensure main SKILL.md keeps readability and discoverability after extraction.

For each extraction:
1. Inline snippet in SKILL.md self-sufficient for common case
2. Cross-reference explains what additional content available
3. Use relative paths: `[EXAMPLES.md](references/EXAMPLES.md#section-anchor)`

Cross-reference patterns:
- After brief code snippet: `See [EXAMPLES.md](references/EXAMPLES.md#full-configuration) for the complete configuration with all options.`
- For multi-variant examples: `See [EXAMPLES.md](references/EXAMPLES.md#variants) for development, staging, and production variants.`
- For extended troubleshooting: `See [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) for additional error scenarios.`

**Got:** Every extraction has corresponding cross-reference. Reader can follow main SKILL.md for common case and drill into references for details.

**If fail:** Cross-references make text flow awkward? Consolidate multiple references into single note at end of procedure step: `For extended examples including [X], [Y], and [Z], see [EXAMPLES.md](references/EXAMPLES.md).`

### Step 5: Verify Line Count After Refactoring

Re-measure SKILL.md line count after all changes.

```bash
# Check main SKILL.md
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "SKILL.md: OK ($lines lines)" || echo "SKILL.md: STILL OVER ($lines lines)"

# Check references file if created
if [ -f skills/<skill-name>/references/EXAMPLES.md ]; then
  ref_lines=$(wc -l < skills/<skill-name>/references/EXAMPLES.md)
  echo "EXAMPLES.md: $ref_lines lines"
fi

# Total content
echo "Total content: $((lines + ${ref_lines:-0})) lines"
```

**Got:** SKILL.md under 500 lines. Ideally under 400 lines to leave room for future growth. `references/EXAMPLES.md` no line limit.

**If fail:** Still over 500 lines after extraction and splitting? Consider whether skill should split into two separate skills. Skill covering too much ground = sign of scope creep. Use `create-skill` to author second skill. Update Related Skills cross-references in both.

### Step 6: Validate All Sections Still Present

After refactoring, verify skill still has all required sections and frontmatter intact.

Run `review-skill-format` checklist:
1. YAML frontmatter parses correctly
2. All six required sections present (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
3. Every procedure step has Expected and On failure blocks
4. No orphaned cross-references (all links resolve)

```bash
# Quick section check
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

**Got:** All sections present. No content accidentally deleted during extraction. Cross-references in SKILL.md resolve to actual headings in EXAMPLES.md.

**If fail:** Section accidentally removed? Restore from git history: `git diff skills/<skill-name>/SKILL.md` to see what changed. Cross-references broken? Verify heading anchors in EXAMPLES.md match links in SKILL.md (GitHub-flavored markdown anchor rules: lowercase, hyphens for spaces, strip punctuation).

## Checks

- [ ] SKILL.md line count is 500 or fewer
- [ ] All code blocks in SKILL.md are 15 lines or fewer
- [ ] Extracted content in `references/EXAMPLES.md` with descriptive headings
- [ ] Every extraction has cross-reference in main SKILL.md
- [ ] No compound procedure steps remain (each step does one thing)
- [ ] All six required sections present after refactoring
- [ ] Every procedure step has **Expected:** and **On failure:** blocks
- [ ] YAML frontmatter intact and parseable
- [ ] Cross-reference links resolve to actual headings in EXAMPLES.md
- [ ] `review-skill-format` validation passes on refactored skill

## Pitfalls

- **Extract too aggressive**: Moving all code to references makes main SKILL.md unreadable. Keep 3-10 line snippets inline for common case. Only extract blocks >15 lines or show multiple variants.
- **Broken anchor links**: GitHub-flavored markdown anchors case-sensitive in some renderers. Use lowercase headings in EXAMPLES.md and match exactly in cross-references. Test with `grep -c "heading-text" references/EXAMPLES.md`.
- **Lose Expected/On failure during splits**: When split compound steps, ensure each new step gets own Expected and On failure blocks. Easy to leave one step without these blocks after split.
- **Create too many tiny steps**: Splitting should produce 5-12 procedure steps. End up with 15+? Split too aggressive. Merge related micro-steps back into logical groups.
- **Forget update references/EXAMPLES.md headings**: Rename section in EXAMPLES.md? All cross-reference anchors in SKILL.md must update. Grep for old anchor name to catch all references.

## See Also

- `review-skill-format` — Run format validation after refactoring to confirm skill still compliant
- `update-skill-content` — Content updates often trigger structural refactoring when they push skill over line limit
- `create-skill` — Reference canonical structure when decide how to organize extracted content
- `evolve-skill` — When skill needs split into two separate skills, use evolution to create derivative
