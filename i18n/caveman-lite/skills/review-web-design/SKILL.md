---
name: review-web-design
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Review web design for layout, typography, colour, spacing, responsive
  behaviour, brand consistency, and visual hierarchy. Covers design
  principles and improvement recommendations. Use for mockup review before
  development, implemented site assessment, design review feedback, brand
  consistency check, or responsive behaviour at breakpoints.
license: MIT
allowed-tools: Read Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: intermediate
  language: multi
  tags: web-design, layout, typography, colour, responsive, visual-hierarchy, branding
---

# Review Web Design

Evaluate a web design for visual quality, consistency, and effectiveness across devices.

## When to Use

- Reviewing a design mockup or prototype before development
- Assessing an implemented site for design quality
- Design review feedback session
- Brand consistency across pages or sections
- Responsive design behaviour across breakpoints

## Inputs

- **Required**: Design to review (URL, mockup, screenshots, or source)
- **Optional**: Brand guidelines or design system docs
- **Optional**: Target audience description
- **Optional**: Reference designs or competitor examples
- **Optional**: Specific areas of concern

## Procedure

### Step 1: Assess Visual Hierarchy

Visual hierarchy guides the user's eye through content by importance.

- [ ] **Clear focal point**: Obvious entry point on each page?
- [ ] **Heading hierarchy**: Headings descend logically (H1 → H2 → H3)?
- [ ] **Size contrast**: Important elements larger than supporting elements?
- [ ] **Colour contrast**: CTAs and key actions visually prominent?
- [ ] **Whitespace**: Spacing separates logical groups effectively?
- [ ] **Reading flow**: Layout follows natural reading pattern (F-pattern, Z-pattern)?

```markdown
## Visual Hierarchy Assessment
| Page/Section | Focal Point | Hierarchy Clear? | Issues |
|-------------|-------------|-----------------|--------|
| Homepage | Hero section CTA | Yes | Secondary CTA competes with primary |
| Product page | Product image | Mostly | Price not prominent enough |
| Contact form | Submit button | No | Form title same size as body text |
```

**Got:** Each major page/section assessed for clear visual hierarchy.
**If fail:** Without mockups, assess from live code using browser dev tools.

### Step 2: Evaluate Typography

- [ ] **Font selection**: Fonts appropriate for brand and content?
- [ ] **Font pairing**: Heading and body fonts complement (max 2-3 families)?
- [ ] **Type scale**: Consistent scale (e.g., 1.25 major second, 1.333 perfect fourth)?
- [ ] **Line height**: Body 1.4-1.6; headings 1.1-1.3
- [ ] **Line length**: Body 45-75 characters (optimal ~66)
- [ ] **Font weight**: Weight variations consistent for hierarchy
- [ ] **Font size**: Base ≥ 16px for body text

```css
/* Example well-structured type scale (1.25 ratio) */
:root {
  --text-xs: 0.64rem;    /* 10.24px */
  --text-sm: 0.8rem;     /* 12.8px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.25rem;    /* 20px */
  --text-xl: 1.563rem;   /* 25px */
  --text-2xl: 1.953rem;  /* 31.25px */
  --text-3xl: 2.441rem;  /* 39.06px */
}
```

**Got:** Typography assessed for consistency, readability, and hierarchy.
**If fail:** With more than 3 font families, recommend consolidation.

### Step 3: Review Colour Usage

- [ ] **Palette coherence**: Intentional and limited (3-5 colours + neutrals)?
- [ ] **Brand alignment**: Colours match brand guidelines?
- [ ] **Contrast ratios**: Text meets WCAG AA (4.5:1 normal, 3:1 large)
- [ ] **Semantic colour**: Colours used consistently for meaning (red=error, green=success)?
- [ ] **Colour blindness**: Information conveyed by more than colour alone?
- [ ] **Dark/light mode**: Both modes maintain readability and brand

```markdown
## Colour Assessment
| Usage | Colour | Contrast Ratio | WCAG AA | Notes |
|-------|--------|----------------|---------|-------|
| Body text on white | #333333 | 12.6:1 | Pass | Good |
| Link text on white | #2563eb | 5.2:1 | Pass | Good |
| Muted text on light gray | #9ca3af on #f3f4f6 | 2.1:1 | FAIL | Increase contrast |
| CTA button text | #ffffff on #22c55e | 3.1:1 | FAIL for small text | Use darker green or larger text |
```

**Got:** Colour palette reviewed for coherence, accessibility, and semantic consistency.
**If fail:** Use a contrast checker (WebAIM) to verify exact ratios.

### Step 4: Assess Layout and Spacing

- [ ] **Grid system**: Consistent grid (12-column, auto-layout, custom)?
- [ ] **Spacing scale**: Systematic (4px/8px base, or Tailwind-like scale)?
- [ ] **Alignment**: Elements aligned to the grid (no "almost aligned" items)?
- [ ] **Density**: Appropriate for content type (data-heavy vs. marketing)?
- [ ] **Whitespace**: Used intentionally to group and separate?
- [ ] **Consistency**: Similar sections spaced identically?

Spacing audit:

```markdown
## Spacing Consistency Check
| Element Pair | Expected Gap | Actual Gap | Consistent? |
|-------------|-------------|------------|-------------|
| Section title to content | 24px | 24px | Yes |
| Card to card | 16px | 16px/24px | No — inconsistent |
| Form label to input | 8px | 4px/8px/12px | No — varies |
```

**Got:** Layout uses systematic grid and spacing scale consistently.
**If fail:** With inconsistent spacing, recommend a spacing scale (e.g., Tailwind's `space-*`).

### Step 5: Evaluate Responsive Design

Test across key breakpoints:

| Breakpoint | Width | Represents |
|-----------|-------|-----------|
| Mobile | 375px | iPhone SE / small phones |
| Mobile L | 428px | iPhone 14 / large phones |
| Tablet | 768px | iPad portrait |
| Desktop | 1280px | Standard laptop |
| Wide | 1536px+ | Desktop monitor |

At each breakpoint, check:
- [ ] **Layout adaptation**: Layout reflows (stack on mobile, side-by-side on desktop)?
- [ ] **Touch targets**: Interactive elements ≥ 44x44px on mobile?
- [ ] **Text readability**: Font size appropriate for viewport?
- [ ] **Image scaling**: Images resize without distortion or overflow?
- [ ] **Navigation**: Mobile nav accessible (hamburger, bottom nav)?
- [ ] **No horizontal scroll**: Content does not overflow viewport horizontally

```markdown
## Responsive Review
| Breakpoint | Layout | Touch Targets | Text | Images | Navigation | Issues |
|-----------|--------|---------------|------|--------|------------|--------|
| 375px | OK | OK | OK | Overflow on hero | Hamburger | Hero image clips |
| 768px | OK | OK | OK | OK | Hamburger | None |
| 1280px | OK | N/A | OK | OK | Full nav | None |
| 1536px | OK | N/A | Line length too long | OK | Full nav | Add max-width to content |
```

**Got:** Design tested at all key breakpoints with issues documented.
**If fail:** Without responsive testing tools, review CSS media queries for coverage.

### Step 6: Check Brand Consistency

- [ ] **Logo usage**: Logo rendered correctly (size, spacing, clear zone)
- [ ] **Colour accuracy**: Brand colours match spec (hex values, not "close enough")
- [ ] **Typography match**: Fonts match brand guidelines
- [ ] **Tone/voice**: UI copy matches brand personality
- [ ] **Iconography**: Icons from a consistent set (style, weight, grid)
- [ ] **Photography style**: Images match brand guidelines (if applicable)

**Got:** Brand elements verified against guidelines with deviations noted.
**If fail:** Without brand guidelines, note this as a recommendation and assess internal consistency instead.

### Step 7: Write the Design Review

```markdown
## Web Design Review

### Overall Impression
[2-3 sentences: overall quality, strongest and weakest aspects]

### Visual Hierarchy: [Score/5]
[Key findings with specific references]

### Typography: [Score/5]
[Key findings with specific references]

### Colour: [Score/5]
[Key findings with specific references]

### Layout & Spacing: [Score/5]
[Key findings with specific references]

### Responsive Design: [Score/5]
[Key findings with specific references]

### Brand Consistency: [Score/5]
[Key findings with specific references]

### Priority Improvements
1. [Most impactful change — specific and actionable]
2. [Second priority]
3. [Third priority]

### Positive Notes
1. [What works well and should be preserved]
```

**Got:** Review provides specific, visual-reference feedback with prioritized improvements.
**If fail:** If scoring feels arbitrary, use a simpler pass/concern/fail system.

## Validation

- [ ] Visual hierarchy assessed for all major pages/sections
- [ ] Typography evaluated for readability, consistency, and scale
- [ ] Colour contrast verified against WCAG AA minimums
- [ ] Layout and spacing checked for grid consistency
- [ ] Responsive design tested at 3+ breakpoints
- [ ] Brand consistency verified against guidelines (or internal consistency assessed)
- [ ] Feedback is specific with visual references (page, section, element)

## Pitfalls

- **Subjective without reasoning**: "I don't like the colour" is not actionable. Explain why (contrast, brand mismatch, accessibility).
- **Ignoring accessibility**: Visual design review must include WCAG contrast checks. Beautiful designs that exclude users are not good designs.
- **Reviewing mockups only**: Test responsive behaviour, hover states, and transitions — not just static layouts.
- **Prescribing solutions**: Describe the problem ("text is hard to read on this background") rather than dictating a fix ("use #333").
- **Forgetting context**: A banking app and a gaming site have different design standards. Review against the appropriate context.

## Related Skills

- `review-ux-ui` — usability, interaction patterns, accessibility
- `setup-tailwind-typescript` — Tailwind CSS for design systems
- `scaffold-nextjs-app` — Next.js application scaffolding
