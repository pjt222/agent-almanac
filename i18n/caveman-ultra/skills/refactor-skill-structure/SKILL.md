---
name: refactor-skill-structure
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Refactor over-long or poorly structured SKILL.md → extract examples to
  references/EXAMPLES.md, split compound procs, reorg for progressive
  disclosure. Use → skill > 500-line CI limit, code blocks dominate, proc step
  has multi unrelated ops, or update pushed over limit.
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

Refactor SKILL.md exceeded 500-line limit or w/ structural problems. Extract code examples to `references/EXAMPLES.md`, split compound procs into focused sub-procs, add cross-refs for progressive disclosure, verify skill complete + valid after restructure.

## Use When

- Skill > 500-line CI limit
- Single proc step has multi unrelated ops → should be separate
- Code blocks > 15 lines dominate → could extract
- Skill accumulated ad-hoc sections breaking standard 6-section
- After update pushed over limit
- Review flagged structural issues beyond content

## In

- **Required**: Path to SKILL.md
- **Optional**: Target line count (default 80% of 500 = ~400)
- **Optional**: Create `references/EXAMPLES.md`? (default yes if extractable)
- **Optional**: Split into multi skills? (default no, prefer extract first)

## Do

### Step 1: Measure + ID Bloat

Read skill + create section line budget → ID bloat.

```bash
# Total line count
wc -l < skills/<skill-name>/SKILL.md

# Line count per section (approximate)
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

Classify bloat:
- **Extractable**: Code blocks > 15 lines, full configs, multi-variant examples
- **Splittable**: Compound proc steps doing 2+ unrelated ops
- **Trimable**: Redundant explanations, verbose ctx
- **Structural**: Ad-hoc sections not in standard 6

→ Line budget showing oversized sections + bloat category. Largest = primary refactor targets.

If err: skill < 500 lines + no structural issues → skill not needed. Verify request justified.

### Step 2: Extract Code → references/EXAMPLES.md

Move code blocks > 15 lines to `references/EXAMPLES.md`, leave brief inline (3-10 lines) in main.

1. Create dir:
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. For each extractable block:
   - Copy full block to `references/EXAMPLES.md` w/ descriptive heading
   - Replace block in SKILL.md w/ brief 3-5 line snippet
   - Add cross-ref: `See [EXAMPLES.md](references/EXAMPLES.md#heading) for the complete configuration.`

3. Structure `references/EXAMPLES.md` w/ clear headings:
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

→ All blocks > 15 lines extracted. Main SKILL.md keeps brief inline. Cross-refs link to extracted. `references/EXAMPLES.md` well-organized.

If err: extracting doesn't reduce enough (still > 500) → Step 3 splitting. Few code blocks (natural-lang skill) → focus Steps 3 + 4.

### Step 3: Split Compound → Focused Steps

ID proc steps doing multi unrelated ops + split.

Signs compound step:
- Title contains "and" ("Configure Database and Set Up Caching")
- Step has multi Expected/On failure blocks (or should)
- Step > 30 lines
- Could skip or do diff order from sub-parts

For each compound:
1. ID distinct ops in step
2. Create new `### Step N:` for each
3. Renumber subsequent
4. Each new step → own Expected + On failure
5. Add transition ctx between new steps

→ Each proc step does one thing. No step > 30 lines. Step count may grow but each indep verifiable.

If err: splitting → too granular (20+ total) → group related micro-steps under single step w/ numbered sub. Sweet spot 5-12 steps.

### Step 4: Add Cross-Refs

Ensure main SKILL.md maintains readability + discoverability after extract.

For each extraction:
1. Inline snippet in SKILL.md self-sufficient for common case
2. Cross-ref explains additional content available
3. Use relative paths: `[EXAMPLES.md](references/EXAMPLES.md#section-anchor)`

Patterns:
- After brief snippet: `See [EXAMPLES.md](references/EXAMPLES.md#full-configuration) for the complete configuration with all options.`
- For multi-variant: `See [EXAMPLES.md](references/EXAMPLES.md#variants) for development, staging, and production variants.`
- For extended troubleshooting: `See [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) for additional error scenarios.`

→ Every extraction has cross-ref. Reader follows main for common case, drills into refs for detail.

If err: cross-refs make text awkward → consolidate multi refs into single note at end of step: `For extended examples including [X], [Y], and [Z], see [EXAMPLES.md](references/EXAMPLES.md).`

### Step 5: Verify Line Count

Re-measure SKILL.md after changes.

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

→ SKILL.md < 500. Ideal < 400 → room future growth. `references/EXAMPLES.md` no limit.

If err: still > 500 after extract + split → skill should decompose into 2 separate skills. Too much ground = scope creep. Use `create-skill` for second + update Related Skills cross-refs both.

### Step 6: Validate All Sections

After refactor, verify skill has all required sections + frontmatter intact.

Run `review-skill-format` checklist:
1. YAML frontmatter parses
2. All 6 required sections (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
3. Every proc step has Expected + On failure
4. No orphaned cross-refs (all links resolve)

```bash
# Quick section check
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

→ All sections present. No content accidentally deleted during extract. Cross-refs in SKILL.md resolve to actual headings in EXAMPLES.md.

If err: section accidentally removed → restore from git: `git diff skills/<skill-name>/SKILL.md`. Cross-refs broken → verify heading anchors in EXAMPLES.md match links in SKILL.md (GitHub anchor: lowercase, hyphens for spaces, strip punctuation).

## Check

- [ ] SKILL.md line count ≤ 500
- [ ] All code blocks in SKILL.md ≤ 15 lines
- [ ] Extracted in `references/EXAMPLES.md` w/ descriptive headings
- [ ] Every extraction has cross-ref in main SKILL.md
- [ ] No compound proc steps remain (each step one thing)
- [ ] All 6 required sections present after refactor
- [ ] Every proc step has **Expected:** + **On failure:**
- [ ] YAML frontmatter intact + parseable
- [ ] Cross-ref links resolve to actual headings in EXAMPLES.md
- [ ] `review-skill-format` validation passes

## Traps

- **Extract too aggressive**: All code → refs makes main unreadable. Keep 3-10 line snippets inline for common case. Only extract > 15 lines or multi-variant.
- **Broken anchors**: GitHub markdown anchors case-sensitive some renderers. Lowercase headings in EXAMPLES.md, match exact in cross-refs. Test `grep -c "heading-text" references/EXAMPLES.md`.
- **Lose Expected/On failure during split**: Each new step gets own Expected + On failure. Easy to leave one w/o blocks after split.
- **Too many tiny steps**: Splitting → 5-12 steps. End up 15+ → split too aggressive. Merge related micro back to logical groups.
- **Forget update EXAMPLES.md headings**: Rename section → all cross-ref anchors in SKILL.md must update. Grep old anchor to catch all refs.

## →

- `review-skill-format` — run format validation after refactor → confirm compliant
- `update-skill-content` — content updates often trigger structural refactor when push over limit
- `create-skill` — reference canonical structure when deciding how to organize extracted
- `evolve-skill` — split into 2 separate skills → use evolution to create derivative
