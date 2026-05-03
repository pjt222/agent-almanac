---
name: review-ux-ui
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Review user experience and interface design using Nielsen's heuristics,
  WCAG 2.1 accessibility guidelines, keyboard and screen reader audit, user
  flow analysis, cognitive load assessment, and form usability evaluation.
  Use when conducting a usability review before release, assessing WCAG 2.1
  accessibility compliance, evaluating user flows for efficiency, reviewing
  form design, or performing a heuristic evaluation of an existing interface.
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

Judge UX and UI for usability, accessibility, effectiveness.

## When Use

- Usability review before release
- Check WCAG 2.1 AA or AAA compliance
- Judge user flows for efficiency, error prevention
- Review form design for usability, conversion
- Heuristic eval of existing interface
- Assess cognitive load, info architecture

## Inputs

- **Required**: App to review (URL, prototype, source code)
- **Required**: Target user description (roles, skill, context)
- **Optional**: User research findings (interviews, surveys, analytics)
- **Optional**: WCAG target (A, AA, AAA)
- **Optional**: Specific flows or tasks
- **Optional**: Assistive tech to test (screen reader, switch)

## Steps

### Step 1: Heuristic Eval (Nielsen 10)

Rate interface against each heuristic.

| # | Heuristic | Key Question | Rating |
|---|-----------|-------------|--------|
| 1 | **Visibility of system status** | Does the system always inform users about what is happening? | |
| 2 | **Match between system and real world** | Does the system use familiar language and concepts? | |
| 3 | **User control and freedom** | Can users easily undo, redo, or exit unwanted states? | |
| 4 | **Consistency and standards** | Do similar elements behave the same way throughout? | |
| 5 | **Error prevention** | Does the design prevent errors before they occur? | |
| 6 | **Recognition rather than recall** | Are options, actions, and information visible or easily retrievable? | |
| 7 | **Flexibility and efficiency of use** | Are there shortcuts for experienced users without confusing novices? | |
| 8 | **Aesthetic and minimalist design** | Does every element serve a purpose? Is there unnecessary clutter? | |
| 9 | **Help users recognize, diagnose, and recover from errors** | Are error messages clear, specific, and constructive? | |
| 10 | **Help and documentation** | Is help available and easy to find when needed? | |

Rate severity per violation.

| Severity | Description |
|----------|-------------|
| 0 | No problem |
| 1 | Cosmetic — fix if time |
| 2 | Minor — low priority |
| 3 | Major — important fix |
| 4 | Catastrophic — must fix before release |

```markdown
## Heuristic Evaluation Findings
| # | Heuristic | Severity | Finding | Location |
|---|-----------|----------|---------|----------|
| 1 | System status | 3 | No loading indicator during data fetch — users click repeatedly | Dashboard page |
| 3 | User control | 2 | No undo for item deletion — only a confirmation dialog | Item list |
| 5 | Error prevention | 3 | Date field accepts invalid dates (Feb 30) | Booking form |
| 9 | Error recovery | 4 | Form submission error clears all fields | Registration |
```

**Got:** All 10 heuristics rated with findings and severity.

**If fail:** Time short? Focus on heuristics 1, 3, 5, 9 — biggest impact.

### Step 2: Accessibility Audit (WCAG 2.1)

#### Perceivable
- [ ] **1.1.1 Non-text content**: All images have alt text (decorative `alt=""`)
- [ ] **1.3.1 Info and relationships**: Semantic HTML (headings, lists, tables, landmarks)
- [ ] **1.3.2 Meaningful sequence**: DOM order matches visual
- [ ] **1.4.1 Use of colour**: Color not sole info carrier
- [ ] **1.4.3 Contrast**: Text contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)
- [ ] **1.4.4 Resize text**: Text resizes to 200% without breaking
- [ ] **1.4.11 Non-text contrast**: UI components, graphics ≥ 3:1
- [ ] **1.4.12 Text spacing**: Works with line height 1.5x, letter 0.12em, word 0.16em

#### Operable
- [ ] **2.1.1 Keyboard**: All function works via keyboard
- [ ] **2.1.2 No keyboard trap**: Focus never trapped
- [ ] **2.4.1 Skip links**: Skip nav for keyboard users
- [ ] **2.4.3 Focus order**: Tab order logical, predictable
- [ ] **2.4.7 Focus visible**: Focus indicator clearly visible
- [ ] **2.4.11 Focus not obscured**: Focused element not hidden behind sticky/overlays
- [ ] **2.5.5 Target size**: Targets ≥ 24x24px (44x44px touch)

#### Understandable
- [ ] **3.1.1 Language of page**: `lang` attr set on `<html>`
- [ ] **3.2.1 On focus**: Focus no surprise changes
- [ ] **3.2.2 On input**: Input no surprise changes without warning
- [ ] **3.3.1 Error identification**: Errors clear in text
- [ ] **3.3.2 Labels or instructions**: Form inputs have visible labels
- [ ] **3.3.3 Error suggestion**: Error msgs suggest fix

#### Robust
- [ ] **4.1.1 Parsing**: HTML valid (no dup IDs, proper nesting)
- [ ] **4.1.2 Name, role, value**: Custom components have ARIA roles
- [ ] **4.1.3 Status messages**: Dynamic changes announced to screen readers

**Got:** WCAG 2.1 AA criteria checked pass/fail per criterion.

**If fail:** Use auto tools (axe-core, Lighthouse) for first scan, then manual for human-judgment criteria.

### Step 3: Keyboard and Screen Reader Audit

#### Keyboard Navigation Test
With Tab, Shift+Tab, Enter, Space, Arrow, Escape only.

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

#### Screen Reader Test
Test with NVDA (Win), VoiceOver (mac/iOS), TalkBack (Android).

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

**Got:** Full task flows tested with keyboard and screen reader.

**If fail:** No screen reader? Inspect ARIA attrs, semantic HTML as proxy.

### Step 4: Analyse User Flows

Map and judge key flows.

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

**Got:** Critical flows mapped with friction points, ratings.

**If fail:** No analytics? Judge flows by task complexity, step count.

### Step 5: Assess Cognitive Load

- [ ] **Info density**: Right amount per screen?
- [ ] **Progressive disclosure**: Complex info revealed gradual?
- [ ] **Chunking**: Related items grouped visual (Gestalt)?
- [ ] **Recognition over recall**: Users see options vs remember?
- [ ] **Consistent patterns**: Similar tasks use similar interactions?
- [ ] **Decision fatigue**: Too many choices at once? (Hick's law)
- [ ] **Working memory**: Need remember info across steps?

**Got:** Cognitive load assessed with overload/underload areas named.

**If fail:** Hard to judge objective? Use "squint test" — squint at screen, check structure and hierarchy still apparent.

### Step 6: Review Form Usability

For each form.

- [ ] **Labels**: Every input has visible, associated label
- [ ] **Placeholder text**: Examples only, not labels
- [ ] **Input types**: Right HTML types (email, tel, number, date) for mobile
- [ ] **Validation timing**: Errors on blur or submit, not every keystroke
- [ ] **Error messages**: Specific ("Email must include @") not generic ("Invalid input")
- [ ] **Required fields**: Marked clear (mark optional if most required)
- [ ] **Field grouping**: Related fields grouped visual (name, address, payment)
- [ ] **Autocomplete**: `autocomplete` attrs set for standard fields
- [ ] **Tab order**: Logical, matches visual layout
- [ ] **Multi-step forms**: Progress indicator shows current, total steps
- [ ] **Persistence**: Form data preserved if user navigates away

**Got:** Each form checked against list with issues documented.

**If fail:** Many forms? Prioritize highest-traffic (registration, checkout, contact).

### Step 7: Write UX/UI Review

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

**Got:** Review gives prioritized, actionable recs with severity.

**If fail:** Too many issues? Split into "must fix" (severity 3-4) and "should fix" (1-2).

## Checks

- [ ] All 10 Nielsen heuristics rated
- [ ] WCAG 2.1 criteria checked (min: 1.1.1, 1.4.3, 2.1.1, 2.4.7, 3.3.1, 4.1.2)
- [ ] Keyboard nav tested for key flows
- [ ] Screen reader tested (or ARIA/semantic HTML as proxy)
- [ ] At least one critical flow analyzed
- [ ] Cognitive load assessed
- [ ] Form usability evaluated
- [ ] Findings prioritized by severity, actionable recs

## Pitfalls

- **Confuse UX with visual design**: UX = how it works; visual = how it looks. Beautiful UI can have bad UX. Eval both but distinguish.
- **Test only happy path**: Error states, empty states, loading, edge cases — UX problems hide there.
- **Ignore real devices**: Dev tools responsive = proxy. Real devices catch touch, performance, viewport issues.
- **Accessibility as afterthought**: Late = expensive. Evaluate early, continuous.
- **Personal preference as feedback**: "I would prefer..." not UX feedback. Cite heuristics, research, patterns.

## See Also

- `review-web-design` — visual review (layout, typography, color)
- `scaffold-nextjs-app` — Next.js scaffolding
- `setup-tailwind-typescript` — Tailwind CSS design system
