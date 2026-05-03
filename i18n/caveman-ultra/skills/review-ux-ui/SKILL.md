---
name: review-ux-ui
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  UX/UI review → Nielsen heuristics + WCAG 2.1 + keyboard/screen reader + flow + cognitive load + form. Use → pre-release usability, WCAG audit, flow eval, form review, heuristic eval.
license: MIT
allowed-tools: Read Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: ux, ui, accessibility, wcag, heuristics, usability, user-flows, cognitive-load
---

# Review UX/UI

Eval UX/UI → usability|access|effectiveness.

## Use When

- Pre-release usability check
- WCAG 2.1 AA|AAA audit
- Flow eval → efficiency, err prevention
- Form review → conversion
- Heuristic eval existing UI
- Cognitive load + info arch

## In

- **Required**: App (URL|prototype|src)
- **Required**: Target user (role, skill, ctx)
- **Optional**: User research (interview|survey|analytics)
- **Optional**: WCAG target (A|AA|AAA)
- **Optional**: Flows to eval
- **Optional**: Assistive tech (screen reader|switch)

## Do

### Step 1: Heuristic Eval (Nielsen 10)

| # | Heuristic | Q | Rating |
|---|-----------|---|--------|
| 1 | **Status visibility** | Sys informs user? | |
| 2 | **Match real world** | Familiar lang/concepts? | |
| 3 | **User control/freedom** | Undo|redo|exit? | |
| 4 | **Consistency** | Similar elements behave same? | |
| 5 | **Err prevention** | Prevent before occur? | |
| 6 | **Recognition > recall** | Options visible? | |
| 7 | **Flex/efficiency** | Shortcuts for experts? | |
| 8 | **Aesthetic/minimal** | Every element serves purpose? | |
| 9 | **Err recovery** | Errs clear, specific, constructive? | |
| 10 | **Help/docs** | Easy find? | |

Severity:

| Sev | Desc |
|-----|------|
| 0 | Not problem |
| 1 | Cosmetic |
| 2 | Minor |
| 3 | Major |
| 4 | Catastrophic — fix pre-release |

```markdown
## Heuristic Evaluation Findings
| # | Heuristic | Severity | Finding | Location |
|---|-----------|----------|---------|----------|
| 1 | System status | 3 | No loading indicator during data fetch — users click repeatedly | Dashboard page |
| 3 | User control | 2 | No undo for item deletion — only a confirmation dialog | Item list |
| 5 | Error prevention | 3 | Date field accepts invalid dates (Feb 30) | Booking form |
| 9 | Error recovery | 4 | Form submission error clears all fields | Registration |
```

→ All 10 evaluated w/ findings + severity.

If err: time-tight → focus 1, 3, 5, 9.

### Step 2: Access Audit (WCAG 2.1)

#### Perceivable
- [ ] **1.1.1 Non-text**: Imgs have alt (decorative=`alt=""`)
- [ ] **1.3.1 Info/rels**: Semantic HTML (headings, lists, tables, landmarks)
- [ ] **1.3.2 Sequence**: DOM order=visual order
- [ ] **1.4.1 Color**: Not sole means
- [ ] **1.4.3 Contrast**: ≥4.5:1 normal, ≥3:1 large
- [ ] **1.4.4 Resize**: 200% no loss
- [ ] **1.4.11 Non-text contrast**: UI ≥3:1
- [ ] **1.4.12 Spacing**: line 1.5x, letter 0.12em, word 0.16em

#### Operable
- [ ] **2.1.1 Keyboard**: All operable
- [ ] **2.1.2 No trap**: Focus never trapped
- [ ] **2.4.1 Skip links**: Avail
- [ ] **2.4.3 Focus order**: Logical
- [ ] **2.4.7 Focus visible**: Indicator clear
- [ ] **2.4.11 Not obscured**: Not behind sticky
- [ ] **2.5.5 Target size**: ≥24x24px (44x44 touch)

#### Understandable
- [ ] **3.1.1 Lang**: `lang` on `<html>`
- [ ] **3.2.1 On focus**: No surprise
- [ ] **3.2.2 On input**: No surprise w/o warn
- [ ] **3.3.1 Err id**: Clear text
- [ ] **3.3.2 Labels**: Visible
- [ ] **3.3.3 Suggest**: Fix hint

#### Robust
- [ ] **4.1.1 Parsing**: Valid HTML
- [ ] **4.1.2 Name/role/val**: Custom → ARIA
- [ ] **4.1.3 Status msgs**: Announced

→ WCAG 2.1 AA checked w/ pass/fail.

If err: auto-tools first (axe-core, Lighthouse) → manual for judgement.

### Step 3: Keyboard + Screen Reader

#### Keyboard
Tab|Shift+Tab|Enter|Space|Arrow|Esc only:

```markdown
## Keyboard Navigation Audit
| Task | Completable? | Issues |
|------|-------------|--------|
| Navigate to main content | Yes — skip link works | None |
| Open dropdown menu | Yes | Arrow keys don't work within menu |
| Submit a form | Yes | Tab order skips the submit button |
| Close a modal | No | Escape doesn't close, no visible close button in tab order |
| Use date picker | No | Custom date picker not keyboard accessible |
```

#### Screen Reader
NVDA|VoiceOver|TalkBack:

```markdown
## Screen Reader Audit
| Element | Announced As | Expected | Issue |
|---------|-------------|----------|-------|
| Logo link | "link, image" | "Home, link" | Missing alt text on logo |
| Search input | "edit, search" | "Search products, edit" | Missing label association |
| Nav menu | "navigation, main" | Correct | None |
| Error message | (not announced) | "Error: email is required" | Missing live region |
| Loading spinner | (not announced) | "Loading, please wait" | Missing aria-live or role="status" |
```

→ Full flows tested keyboard + screen reader.

If err: no SR → inspect ARIA + semantic HTML as proxy.

### Step 4: Flow Analysis

```markdown
## User Flow: Complete a Purchase

### Steps
1. Browse products → 2. View product → 3. Add to cart → 4. View cart →
5. Enter shipping → 6. Enter payment → 7. Review order → 8. Confirm

### Assessment
| Step | Friction | Severity | Notes |
|------|---------|----------|-------|
| 1→2 | Low | - | Clear product cards |
| 2→3 | Medium | 2 | "Add to cart" button below the fold on mobile |
| 3→4 | Low | - | Cart icon updates with count |
| 4→5 | High | 3 | Must create account — no guest checkout |
| 5→6 | Low | - | Address autocomplete works well |
| 6→7 | Medium | 2 | Card number field doesn't auto-format |
| 7→8 | Low | - | Clear order summary |

### Flow Efficiency
- **Steps**: 8 (acceptable for e-commerce)
- **Required fields**: 14 (could reduce with address autocomplete + saved payment)
- **Decision points**: 2 (size selection, shipping method)
- **Potential drop-off points**: Step 4→5 (forced account creation)
```

→ Critical flows mapped, friction rated.

If err: no analytics → assess by step count + complexity.

### Step 5: Cognitive Load

- [ ] **Density**: Per-screen info appropriate?
- [ ] **Progressive disclosure**: Complex revealed gradual?
- [ ] **Chunking**: Related grouped (Gestalt)?
- [ ] **Recognition > recall**: See vs remember?
- [ ] **Consistency**: Similar tasks → similar patterns?
- [ ] **Decision fatigue**: Too many choices? (Hick)
- [ ] **Working memory**: Remember across steps?

→ Load assessed w/ overload|underload areas.

If err: hard objective → squint test (structure visible squinted?).

### Step 6: Form Usability

- [ ] **Labels**: Visible, associated
- [ ] **Placeholder**: Examples only, not labels
- [ ] **Input types**: Right (email|tel|number|date) for mobile
- [ ] **Validation timing**: Blur|submit, not keystroke
- [ ] **Err msgs**: Specific ("Email needs @") not generic
- [ ] **Required**: Marked clear
- [ ] **Grouping**: Related grouped
- [ ] **Autocomplete**: `autocomplete` set
- [ ] **Tab order**: Matches visual
- [ ] **Multi-step**: Progress indicator
- [ ] **Persistence**: Data preserved nav-away

→ Each form vs checklist + issues documented.

If err: many forms → prioritize high-traffic (registration|checkout|contact).

### Step 7: Write Report

```markdown
## UX/UI Review Report

### Executive Summary
[2-3 sentences: overall usability, most critical issues, strongest aspects]

### Heuristic Evaluation Summary
| Heuristic | Severity | Key Finding |
|-----------|----------|-------------|
[Summary table from Step 1]

### Accessibility Compliance
- **Target**: WCAG 2.1 AA
- **Status**: [X of Y criteria pass]
- **Critical failures**: [List]

### User Flow Analysis
[Key friction points with severity and recommendations]

### Top 5 Improvements (Prioritised)
1. **[Issue]** — Severity: [N] — [Specific recommendation]
2. ...

### What Works Well
1. [Specific positive observation]
2. ...
```

→ Prioritized, actionable recs w/ severity.

If err: too many issues → split "must fix" (3-4) vs "should fix" (1-2).

## Check

- [ ] All 10 Nielsen rated
- [ ] WCAG checked (min: 1.1.1, 1.4.3, 2.1.1, 2.4.7, 3.3.1, 4.1.2)
- [ ] Keyboard tested key flows
- [ ] SR tested (or ARIA proxy)
- [ ] ≥1 critical flow analyzed
- [ ] Cognitive load assessed
- [ ] Forms evaluated
- [ ] Findings prioritized + actionable

## Traps

- **UX vs visual**: UX=how works, visual=how looks. Beautiful UI ≠ good UX.
- **Happy path only**: Errs, empty, loading, edges = where bugs hide.
- **No real devices**: DevTools = proxy. Real catches touch, perf, viewport.
- **Access afterthought**: Late = expensive. Early + continuous.
- **Personal pref**: "I prefer..." ≠ UX feedback. Cite heuristics|research|patterns.

## →

- `review-web-design` — visual review (layout, typo, color)
- `scaffold-nextjs-app` — Next.js scaffold
- `setup-tailwind-typescript` — Tailwind CSS
