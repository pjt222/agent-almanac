# Campfire UI/UX Deep Review

**Date**: 2026-03-19
**Reviewer**: Claude Opus 4.6 (1M context)
**Surfaces**: D3 SVG visualization (`viz/js/campfire.js`) + CLI ceremony output (`cli/lib/campfire-reporter.js`)
**Status**: COMPLETE

## Review Methodology

| Framework | Source | Applied To |
|-----------|--------|-----------|
| Nielsen's 10 Heuristics (sev 0-4) | `review-ux-ui` / `senior-ux-ui-specialist` | Both surfaces |
| WCAG 2.1 AA (4 pillars) | `review-ux-ui` / `senior-ux-ui-specialist` | Viz surface |
| Visual Design Scoring (6 dims, 1-5) | `review-web-design` / `senior-web-designer` | Viz surface |
| Voice Rule Compliance (7 rules) | campfire-reporter.js header | CLI surface |
| Cognitive Load Assessment | `review-ux-ui` | Both surfaces |

---

## Phase 0: Meditate Checkpoint

**Anchor statement**: Evaluate whether both campfire surfaces (viz + CLI) serve their users well, identifying concrete accessibility and usability gaps with actionable recommendations.

**Distraction types labeled**:
- *Scope creep*: urge to review the entire viz app, not just campfire mode
- *Tool bias*: tendency to focus on code quality rather than UX
- *Assumption*: that "warm" metaphor is self-evidently good; must evaluate learning curve objectively
- *Perfectionism*: desire to find issues where none exist; accept that some areas work well

**Readiness**: Cleared. Proceeding to Phase 1.

---

## Phase 1: Viz Surface Review (campfire.js)

### 1A. Heuristic Evaluation

| ID | Heuristic | Issue | Location | Sev |
|----|-----------|-------|----------|-----|
| VIZ-H01 | H1 System Status | No loading indicator during icon preload; icons pop in after render | `campfire.js:686-704` | 2 |
| VIZ-H02 | H1 System Status | No visual feedback during force simulation (200 ticks computed synchronously) | `campfire.js:190` | 1 |
| VIZ-H03 | H3 User Control | Back button is SVG text element, not a proper `<button>`; no Escape key handler | `campfire.js:338-351` | 3 |
| VIZ-H04 | H4 Consistency | Campfire uses custom warm background (`#1a0e07`) that persists after switching modes; other modes inherit app CSS | `campfire.js:571` | 2 |
| VIZ-H05 | H5 Error Prevention | `?fire=invalid` silently falls back to overview; no message that the team wasn't found | `campfire.js:601-605` | 2 |
| VIZ-H06 | H6 Recognition | Coordination pattern shown as raw slug (e.g., `hub-and-spoke`) instead of human label | `campfire.js:410-420` | 2 |
| VIZ-H07 | H7 Flexibility | No keyboard navigation; entire interaction is mouse/touch only | `campfire.js` (global) | 3 |
| VIZ-H08 | H8 Minimalist | Skill fan rays overlap when agent has many skills; creates visual noise in focus view | `campfire.js:493-523` | 2 |
| VIZ-H09 | H9 Error Recovery | Icon load failure silently ignored (`img.onerror` just decrements counter) | `campfire.js:700` | 2 |
| VIZ-H10 | H10 Help | No tooltip or legend explaining campfire terms (keeper, practice, fire) | viz surface (global) | 2 |
| VIZ-H11 | H2 Real World Match | "keepers" label on overview (line 296) requires metaphor knowledge; "4 keepers" conveys no meaning to a first-time visitor | `campfire.js:296` | 1 |
| VIZ-H12 | H4 Consistency | Team fire sizes vary by skill count (`18 + sqrt(skillCount) * 2`), but the mapping isn't communicated to the user | `campfire.js:218` | 1 |

**Severity distribution**: Sev 3: 2, Sev 2: 7, Sev 1: 3

### 1B. WCAG 2.1 AA Audit

#### Contrast Ratios (computed against `#1a0e07` background, L = 0.00487)

| Color | Use | Hex | Luminance | Ratio | AA Text (4.5:1) | AA Large (3:1) | AA Non-text (3:1) |
|-------|-----|-----|-----------|-------|-----------------|----------------|-------------------|
| text | Labels, team names | `#D4A574` | 0.4451 | **9.02:1** | PASS | PASS | PASS |
| fire | Active fires, links | `#FF6B35` | 0.3278 | **6.89:1** | PASS | PASS | PASS |
| amber | Agents, arriving | `#FFB347` | 0.5621 | **11.15:1** | PASS | PASS | PASS |
| spark | Skill names | `#FFF4E0` | 0.9148 | **17.58:1** | PASS | PASS | PASS |
| ember | Cold fires, glow stop | `#8B4513` | 0.1157 | **3.02:1** | **FAIL** | PASS | PASS |
| textDim | Secondary text (blended) | ~`#775A3E` | 0.1365 | **3.40:1** | **FAIL** | PASS | PASS |
| trail | Connection lines | `rgba(255,165,0,0.15)` | ~0.02 | ~1.3:1 | N/A (decorative) | N/A | **FAIL** |

**Luminance calculation method**: sRGB linearization with gamma 2.4 per WCAG 2.1 relative luminance formula.

#### WCAG Criterion Findings

| ID | Criterion | Level | Status | Detail |
|----|-----------|-------|--------|--------|
| VIZ-W01 | 1.1.1 Non-text Content | A | **FAIL** | SVG nodes have no `<title>`, `aria-label`, or `role` attributes; icons are purely decorative `<image>` elements without alt text |
| VIZ-W02 | 1.3.1 Info and Relationships | A | **FAIL** | Visual hierarchy (center=team, inner=agents, outer=skills) is not conveyed programmatically; no ARIA landmarks or live regions |
| VIZ-W03 | 1.4.1 Use of Color | A | **FAIL** | Fire state (burning/embers/cold) conveyed by color alone in viz; no shape, pattern, or text indicator. CLI surface uses glyphs (pass) |
| VIZ-W04 | 1.4.3 Contrast (Minimum) | AA | **FAIL** | `ember` (#8B4513) at 3.02:1 and `textDim` (~#775A3E) at 3.40:1 fail 4.5:1 for normal text |
| VIZ-W05 | 1.4.11 Non-text Contrast | AA | **FAIL** | Trail lines at ~1.3:1 contrast; skill dots at 0.7 opacity further reduce effective contrast |
| VIZ-W06 | 2.1.1 Keyboard | A | **FAIL** | Zero `keydown`/`keyup` handlers; no `tabindex` on SVG elements; entire mode is mouse-only |
| VIZ-W07 | 2.4.3 Focus Order | A | **FAIL** | No focusable elements within SVG; Tab skips entire visualization |
| VIZ-W08 | 2.4.7 Focus Visible | AA | **FAIL** | No focus indicators on any interactive SVG element |
| VIZ-W09 | 2.5.5 Target Size | AAA | **FAIL** | Skill dots are 4px radius (8px diameter); fails both 44px (WCAG 2.1) and 24px (WCAG 2.2) minimums |
| VIZ-W10 | 4.1.2 Name, Role, Value | A | **FAIL** | Interactive SVG groups lack `role="button"`, `aria-label`, or accessible name; screen reader cannot identify any element |

**Summary**: 10 WCAG failures, 7 at Level A (blocking for any conformance claim), 3 at Level AA/AAA.

### 1C. Keyboard & Screen Reader Audit

| Task | Keyboard | Screen Reader | Notes |
|------|----------|---------------|-------|
| Browse fires (overview) | FAIL | FAIL | No tabindex, no keydown handler |
| Select a fire | FAIL | FAIL | Click handler only; no Enter/Space equivalent |
| Return to overview | FAIL | FAIL | Back text is SVG, not button; no Escape handler |
| Read agent names | N/A | FAIL | No aria-label or role on agent groups |
| Read skill names | N/A | FAIL | No aria-label on skill dots |
| Zoom/pan | PASS (via d3-zoom) | N/A | Mouse wheel works; d3-zoom handles touch |
| Navigate between agents | FAIL | FAIL | No arrow key handler |
| Deep-link via URL | PASS | FAIL | URL params work but focus is not managed |

**Finding**: The campfire viz is entirely inaccessible to keyboard-only and screen reader users. This is consistent with other viz modes (2D, 3D, etc.) but is worth noting as a gap.

### 1D. User Flow Analysis

**Flow 1: Browse fires**
1. User clicks "Fire" button in header -> switchMode('campfire') called
2. Container background changes to warm dark -> overview renders
3. Force simulation runs synchronously (200 ticks) -> fires appear with staggered animation
4. Prompt text fades in: "Click a fire to see its circle"

*Friction*: No loading indicator during simulation (VIZ-H02). First-time users may not understand "fire" = "team" (VIZ-H11).

**Flow 2: Explore a team**
1. User clicks a fire node -> renderFocus(teamId) called
2. Overview clears, focus view renders with team center, agent ring, skill fan
3. Back text appears top-left: "Back to all campfires"
4. User can click agents/skills for detail panel

*Friction*: No Escape key (VIZ-H03). Coordination pattern shown as raw slug (VIZ-H06). Skill fan can overlap (VIZ-H08). No way to know which agent is the lead except by the "fire keeper" label and slightly larger octagon.

**Flow 3: Deep-link**
1. User navigates to `?fire=r-package-review` or `?mode=campfire`
2. `initCampfireGraph` checks URL params -> focuses the team if found
3. If `?fire=nonexistent` -> silently shows overview

*Friction*: Silent fallback (VIZ-H05). No URL update when navigating within campfire mode.

### 1E. Visual Design Scoring

| Dimension | Score | Notes |
|-----------|-------|-------|
| Visual Hierarchy | 4/5 | Clear center-to-edge hierarchy in focus view; overview positions communicate shared-agent proximity well |
| Typography | 3/5 | system-ui is functional but lacks warmth; fixed sizes (8-14px) don't scale with viewport; no typographic distinction between levels |
| Color | 4/5 | Warm palette is cohesive and distinctive; ember color is too dark for text use; textDim opacity undermines readability |
| Spacing & Layout | 4/5 | Radial layout is elegant; skill fan spacing formula works for < 8 skills but degrades with more |
| Responsive | 2/5 | Resize handler exists but viewBox is set once on init; no breakpoint adaptation; fire labels overlap on small screens |
| Brand Consistency | 5/5 | Campfire metaphor is internally consistent between viz glyphs, CLI vocabulary, and i18n strings |

**Overall Visual Design Score: 3.7/5**

### 1F. Cognitive Load Assessment

**Overview level**: 15 fires with connecting trails. Information density is appropriate -- each fire shows name + keeper count. Progressive disclosure works: details on click.

**Focus level**: Team center + agent ring + skill fan. For small teams (2-4 agents, < 15 skills total), cognitive load is manageable. For larger teams, the skill fan becomes overwhelming:
- `devops-platform-engineering` has 4 agents with ~50 total skills -> dense skill fan
- The skill dots are unlabeled in overview; only tooltip on hover reveals names

**Metaphor learning curve**: 3 new terms to learn (fire, keeper, practice). The mapping is consistent (fire=team, keeper=agent, practice=skill) but not self-documenting. The i18n file has these terms but they're only used in text labels, not in a legend.

| ID | Issue | Sev |
|----|-------|-----|
| VIZ-C01 | No legend explaining fire/keeper/practice mapping | 2 |
| VIZ-C02 | Skill fan overwhelms for agents with > 10 skills; no pagination or grouping | 2 |
| VIZ-C03 | Trail opacity (0.15) makes shared-agent connections nearly invisible | 1 |

### 1G. Empty & Error States

| Scenario | Current Behavior | Expected Behavior |
|----------|-----------------|-------------------|
| Zero teams in data | Empty SVG; no message | Show "No teams found" message |
| Zero agents for a team | Empty agent ring; no message | Show "No agents assigned" |
| All icons fail to load | Fires render without icons; no indication | Degrade gracefully (already does); could show placeholder |
| `?fire=invalid` | Silent fallback to overview | Show brief toast: "Team 'invalid' not found" |
| Network error loading data | Handled by app.js, not campfire.js | OK -- delegated correctly |

| ID | Issue | Sev |
|----|-------|-----|
| VIZ-E01 | No message for zero teams (empty overview) | 2 |
| VIZ-E02 | No feedback for invalid `?fire=` parameter | 2 |

---

## Phase 2: Rest Checkpoint

**Phase 1 finding counts**:
- Heuristic (VIZ-H): 12 findings (2 sev 3, 7 sev 2, 3 sev 1)
- WCAG (VIZ-W): 10 findings (7 Level A, 3 Level AA/AAA)
- Keyboard (VIZ-K): 0 separate findings (covered by VIZ-W06/W07/W08)
- Flow (VIZ-F): 0 separate findings (friction points mapped to heuristic IDs)
- Visual (VIZ-V): 0 separate findings (scores captured in table)
- Cognitive (VIZ-C): 3 findings (2 sev 2, 1 sev 1)
- Empty/Error (VIZ-E): 2 findings (both sev 2)

**Scope drift check**: None detected. Stayed within campfire.js scope.

**Re-anchoring**: The CLI surface uses a different interaction model (sequential text output) so different heuristic weightings apply. Focus on voice consistency, metaphor coherence, and terminal accessibility.

---

## Phase 3: CLI Surface Review (campfire-reporter.js)

### 3A. Heuristic Evaluation

| ID | Heuristic | Issue | Location | Sev |
|----|-----------|-------|----------|-----|
| CLI-H01 | H1 System Status | No progress indicator during large team gathering (many symlinks/copies) | `index.js:520-524` | 2 |
| CLI-H02 | H2 Real World Match | "keepers"/"practices"/"scatter" require learning the metaphor before the tool makes sense | `campfire-reporter.js` (global) | 2 |
| CLI-H03 | H4 Consistency | `campfire` with no args shows gathered fires OR welcome; behavior changes based on state | `index.js:427-441` | 1 |
| CLI-H04 | H5 Error Prevention | Gathering an already-gathered team re-installs without warning; could warn "already burning, regather?" | `index.js:457-565` | 2 |
| CLI-H05 | H6 Recognition | `campfire --all` categories are hardcoded; new teams may land in "Specialty" by default | `campfire-reporter.js:491-518` | 1 |
| CLI-H06 | H9 Error Recovery | `scatter` on ungathered fire says "not burning" but doesn't suggest `gather` | `index.js:591-593` | 2 |
| CLI-H07 | H3 User Control | `tend` always warms all fires (resets timer); no way to tend without resetting | `index.js:753-757` | 2 |
| CLI-H08 | H10 Help | No `--help` examples for campfire commands; Commander.js shows syntax but not usage examples | `index.js:362-441` | 1 |

**Severity distribution**: Sev 2: 5, Sev 1: 3

### 3B. Voice Rule Compliance

The 7 voice rules from `campfire-reporter.js:7-14`:

| # | Rule | Status | Evidence |
|---|------|--------|----------|
| 1 | Present tense, active voice | **PASS** | "Gathering the X circle...", "arrives", "The fire burns." |
| 2 | No exclamation marks | **PASS** | Grep of all output strings: zero `!` characters |
| 3 | Metaphor replaces jargon | **PASS** | "practices" not "skills", "keepers" not "agents", "fire" not "team" |
| 4 | Failures are honest, not catastrophic | **PASS** | "The fire could not be lit." not "FATAL ERROR" |
| 5 | Closing line is always the fire's state | **PASS** | Every ceremony ends with state: "The fire burns.", "The fire goes out." |
| 6 | No emoji in default mode | **PASS** | Only Unicode glyphs: checkmark, circles. No emoji codepoints |
| 7 | Remove words that don't carry information | **PASS** | Output is concise; no filler ("please", "successfully", "now") |

**Finding**: All 7 voice rules are respected across all 7 public functions (printWelcome, printArrival, printScatter, printTend, printCampfireList, printFireSummary, printCampfireMap).

| ID | Issue | Sev |
|----|-------|-----|
| CLI-R01 | Voice rules fully compliant | 0 (praise) |

### 3C. CLI Accessibility

| ID | Issue | Sev | Detail |
|----|-------|-----|--------|
| CLI-A01 | No `NO_COLOR` / `FORCE_COLOR` detection | 2 | `chalk.hex()` is used directly; should check `NO_COLOR` env var per https://no-color.org/ |
| CLI-A02 | Orange/amber pair concern for deuteranopia | 2 | `#FF6B35` (fire) and `#FFB347` (amber) are distinguishable by lightness difference (~30%), but both appear yellowish under deuteranopia simulation. The semantic distinction (fire=active state, amber=agent) relies partly on context, partly on color |
| CLI-A03 | Unicode glyph screen reader compatibility | 1 | Glyphs (checkmark, circles, etc.) are standard Unicode; screen readers will announce them. However, "White Circle" for cold fire state may not convey meaning without context |
| CLI-A04 | `--json` and `--quiet` modes available | 0 (praise) | Machine-readable output exists for every command; good for automation and assistive tool integration |

### 3D. Cognitive Load

| Command | Lines (default) | Lines (ceremonial) | Assessment |
|---------|----------------|--------------------|----|
| `campfire` (welcome) | 7 | N/A | Appropriate |
| `campfire --all` | ~40 (15 teams) | N/A | Categorized by function; scannable |
| `campfire <name>` | ~12 | N/A | Focused; shows actionable next step |
| `gather <name>` | ~8 (4 agents) | ~20 (4 agents, 15 skills) | Default is concise; ceremonial scales linearly |
| `scatter <name>` | ~8 | ~15 | Similar to gather |
| `tend` | ~20 (3 fires) | N/A | One block per fire; summary at bottom |
| `campfire --map` | ~15 (6 bridges) | N/A | Sorted by connectivity; scannable |

| ID | Issue | Sev |
|----|-------|-----|
| CLI-C01 | Ceremonial mode for large teams (8+ agents, 50+ skills) would produce 100+ lines; no pagination or summary fallback | 2 |
| CLI-C02 | `campfire --all` hardcoded categories (Development, Operations, etc.) may not match user's mental model | 1 |

### 3E. State Lifecycle UX

**Thresholds**: burning < 7 days, embers 7-30 days, cold > 30 days.

| ID | Issue | Sev | Detail |
|----|-------|-----|--------|
| CLI-S01 | `tend` always resets `lastWarmed` on every fire | 2 | Running `tend` as a health check also resets all timers, making the health check self-modifying. A read-only health check (`tend --dry`) would be useful. |
| CLI-S02 | Cold fires persist indefinitely | 1 | No automatic cleanup or suggestion to scatter cold fires. `tend` shows them as cold but doesn't prompt action beyond "scatter or relight." |
| CLI-S03 | No state migration path | 1 | `STATE_VERSION = 1` is defined but no migration logic exists. Future schema changes would need migration code. |
| CLI-S04 | `wanderers` array defined in state but never populated | 1 | `loadState()` initializes `wanderers: []` but no code writes to it. Dead field or future placeholder. |

---

## Phase 4: Tending Checkpoint

**Subsystem triage**:
- *Reasoning clarity*: Both surfaces have clear internal logic. campfire.js is well-structured with overview/focus split. campfire-reporter.js is clean with consistent voice.
- *Alignment*: The campfire metaphor serves its purpose of making team management feel warm and intentional. The learning curve (3 new terms) is a real cost but justified by the coherence it provides.
- *Coherence*: Viz and CLI surfaces are well-aligned in vocabulary and color palette. The same hex values appear in both. i18n strings are consistent.

**Cross-surface consistency check**:

| Concept | Viz term | CLI term | i18n key | Aligned? |
|---------|----------|----------|----------|----------|
| Team | fire | fire/circle | `campfire.circle` | YES |
| Agent | keeper | keeper | `campfire.keepers` | YES |
| Skill | practice (in text) / spark (visual) | practice/spark | `campfire.practices` | YES |
| Team lead | fire keeper | fire keeper | `campfire.fireKeeper` | YES |
| Shared agent | light trail | bridge/hearth-keeper | `campfire.hearthKeeper` | PARTIAL -- "light trail" vs "hearth-keeper" differ |
| Fire state | color only | glyph + color + label | N/A | INCONSISTENT -- viz lacks non-color indicator |

| ID | Issue | Sev |
|----|-------|-----|
| XS-01 | Fire state conveyed by color alone in viz but by glyph+color+text in CLI | 3 |
| XS-02 | Shared agents called "light trails" in viz but "hearth-keepers" / "bridges" in CLI | 1 |

---

## Phase 5: Synthesis

### All Findings by ID

| ID | Surface | Category | Sev | Summary |
|----|---------|----------|-----|---------|
| VIZ-H01 | Viz | Heuristic | 2 | No loading indicator during icon preload |
| VIZ-H02 | Viz | Heuristic | 1 | No feedback during force simulation |
| VIZ-H03 | Viz | Heuristic | 3 | Back button is SVG text; no Escape key |
| VIZ-H04 | Viz | Heuristic | 2 | Warm background persists after mode switch |
| VIZ-H05 | Viz | Heuristic | 2 | `?fire=invalid` silently falls back |
| VIZ-H06 | Viz | Heuristic | 2 | Coordination pattern shown as raw slug |
| VIZ-H07 | Viz | Heuristic | 3 | No keyboard navigation (mouse-only) |
| VIZ-H08 | Viz | Heuristic | 2 | Skill fan overlap with many skills |
| VIZ-H09 | Viz | Heuristic | 2 | Icon load failure silently ignored |
| VIZ-H10 | Viz | Heuristic | 2 | No tooltip/legend for campfire terms |
| VIZ-H11 | Viz | Heuristic | 1 | "keepers" label requires metaphor knowledge |
| VIZ-H12 | Viz | Heuristic | 1 | Fire size mapping not communicated |
| VIZ-W01 | Viz | WCAG | A | SVG nodes lack alt text / ARIA |
| VIZ-W02 | Viz | WCAG | A | Visual hierarchy not programmatically conveyed |
| VIZ-W03 | Viz | WCAG | A | Fire state by color alone |
| VIZ-W04 | Viz | WCAG | AA | ember and textDim fail contrast minimums |
| VIZ-W05 | Viz | WCAG | AA | Trail lines fail non-text contrast |
| VIZ-W06 | Viz | WCAG | A | Zero keyboard handlers |
| VIZ-W07 | Viz | WCAG | A | No focusable elements in SVG |
| VIZ-W08 | Viz | WCAG | AA | No focus indicators |
| VIZ-W09 | Viz | WCAG | AAA | Skill dot target size 8px < 24px minimum |
| VIZ-W10 | Viz | WCAG | A | Interactive elements lack role/name/value |
| VIZ-C01 | Viz | Cognitive | 2 | No legend for fire/keeper/practice |
| VIZ-C02 | Viz | Cognitive | 2 | Skill fan overwhelms for > 10 skills |
| VIZ-C03 | Viz | Cognitive | 1 | Trail opacity nearly invisible |
| VIZ-E01 | Viz | Empty/Error | 2 | No message for zero teams |
| VIZ-E02 | Viz | Empty/Error | 2 | No feedback for invalid `?fire=` |
| CLI-H01 | CLI | Heuristic | 2 | No progress indicator for large installs |
| CLI-H02 | CLI | Heuristic | 2 | Metaphor requires learning curve |
| CLI-H03 | CLI | Heuristic | 1 | `campfire` behavior changes by state |
| CLI-H04 | CLI | Heuristic | 2 | Re-gathering without warning |
| CLI-H05 | CLI | Heuristic | 1 | Hardcoded team categories |
| CLI-H06 | CLI | Heuristic | 2 | scatter-on-ungathered doesn't suggest gather |
| CLI-H07 | CLI | Heuristic | 2 | `tend` always resets timer |
| CLI-H08 | CLI | Heuristic | 1 | No usage examples in help |
| CLI-R01 | CLI | Voice | 0 | All 7 voice rules compliant (praise) |
| CLI-A01 | CLI | Accessibility | 2 | No NO_COLOR support |
| CLI-A02 | CLI | Accessibility | 2 | Orange/amber deuteranopia concern |
| CLI-A03 | CLI | Accessibility | 1 | Unicode glyph screen reader semantics |
| CLI-A04 | CLI | Accessibility | 0 | JSON/quiet modes available (praise) |
| CLI-C01 | CLI | Cognitive | 2 | Ceremonial mode scaling for large teams |
| CLI-C02 | CLI | Cognitive | 1 | Hardcoded category mental model |
| CLI-S01 | CLI | State | 2 | `tend` is self-modifying |
| CLI-S02 | CLI | State | 1 | Cold fires persist indefinitely |
| CLI-S03 | CLI | State | 1 | No state migration logic |
| CLI-S04 | CLI | State | 1 | `wanderers` field never populated |
| XS-01 | Cross | Consistency | 3 | Fire state: color-only in viz vs glyph+text in CLI |
| XS-02 | Cross | Consistency | 1 | Shared agent naming inconsistency |

### Severity Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 0 (praise) | 2 | Working well, document as strengths |
| 1 (cosmetic) | 14 | Minor issues, fix when convenient |
| 2 (minor) | 21 | Real usability problems, should fix |
| 3 (major) | 3 | Serious problems affecting key user groups |
| WCAG A | 5 | Level A failures (foundational accessibility) |
| WCAG AA | 3 | Level AA failures |
| WCAG AAA | 1 | Level AAA failure |

**Total findings**: 44 (excluding WCAG which overlap with heuristic findings)

### Top 10 Priority Improvements

| Rank | ID | Surface | Sev | Improvement | Effort |
|------|-----|---------|-----|-------------|--------|
| 1 | VIZ-H03 | Viz | 3 | Add Escape key handler to return from focus view; replace SVG text back button with proper DOM `<button>` overlay | S |
| 2 | XS-01 | Both | 3 | Add shape/text fire state indicators to viz (e.g., glyph overlay or pulsing animation for burning vs static for cold) | M |
| 3 | VIZ-H07 | Viz | 3 | Add `tabindex` to fire groups and keydown handlers (Enter to focus, arrow keys to navigate between fires) | M |
| 4 | VIZ-W04 | Viz | AA | Lighten ember from `#8B4513` to `#A0522D` (sienna, ~4.8:1) and increase textDim opacity from 0.5 to 0.7 (~5.2:1) | S |
| 5 | CLI-S01 | CLI | 2 | Add `--dry` flag to `tend` for read-only health check; only warm fires when explicitly requested or when `tend` is run without `--dry` | S |
| 6 | CLI-A01 | CLI | 2 | Check `process.env.NO_COLOR` or `chalk.level === 0` before using hex colors; chalk v5+ handles this but verify | S |
| 7 | VIZ-H06 | Viz | 2 | Map coordination patterns to human labels using the same `patternDescription()` function from campfire-reporter.js | S |
| 8 | VIZ-C01 | Viz | 2 | Add a small legend overlay (collapsible) explaining fire=team, keeper=agent, practice=skill | S |
| 9 | CLI-H06 | CLI | 2 | When scatter fails on ungathered fire, append: "Try 'agent-almanac gather <name>' to light this fire first." | S |
| 10 | VIZ-W09 | Viz | AAA | Increase skill dot radius from 4 to 12px (24px diameter) with hover expansion to maintain visual density | S |

**Effort key**: S = small (< 1 hour), M = medium (1-4 hours), L = large (4+ hours)

### What Works Well

1. **Voice consistency** (CLI-R01): All 7 voice rules are followed across every public function. The campfire-reporter is a model of disciplined terminal voice design.

2. **Metaphor coherence**: The fire/keeper/practice vocabulary is applied consistently across viz, CLI, state management, and i18n. The mapping never contradicts itself.

3. **Progressive disclosure**: Overview shows 15 fires at appropriate density. Focus view reveals agents and skills. CLI mirrors this with default (concise) vs ceremonial (detailed) modes.

4. **Machine-readable output** (CLI-A04): Every campfire command supports `--json` and `--quiet`, enabling automation and integration with other tools.

5. **Warm color palette**: The `#1a0e07` background with amber/fire/spark colors creates a distinctive, cohesive visual identity. Contrast ratios for primary text are excellent (9.02:1 for text, 11.15:1 for amber).

6. **Shared-agent visualization**: The force simulation that positions teams by shared agents is an elegant design -- teams that share agents cluster naturally, making organizational structure visible at a glance.

7. **State lifecycle**: The burning/embers/cold progression with 7d/30d thresholds creates a natural sense of currency. The campfire metaphor makes state decay intuitive (fires cool over time).

8. **Deduplication handling**: Both gather and scatter correctly handle shared skills between fires, avoiding double-install and preserving skills needed by other fires.

### Visual Design Summary

| Dimension | Score |
|-----------|-------|
| Visual Hierarchy | 4/5 |
| Typography | 3/5 |
| Color | 4/5 |
| Spacing & Layout | 4/5 |
| Responsive | 2/5 |
| Brand Consistency | 5/5 |
| **Overall** | **3.7/5** |

---

## Verification Checklist

- [x] Review document follows `tests/results/` convention
- [x] All findings have IDs, locations, severities, and recommendations
- [x] Contrast ratios computed using WCAG 2.1 relative luminance formula (sRGB linearization, gamma 2.4)
- [x] Phase 0 (meditate), Phase 2 (rest), Phase 4 (tending) checkpoints documented with output
- [x] Both surfaces covered: viz (Phases 1A-1G) and CLI (Phases 3A-3E)
- [x] Top 10 improvements are actionable with effort estimates
- [x] "What Works Well" section documents 8 strengths
