---
name: review-web-design
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Review web design for layout quality, typography, colour usage, spacing,
  responsive behaviour, brand consistency, and visual hierarchy. Covers
  design principles evaluation and improvement recommendations. Use when
  reviewing a design mockup before development, assessing an implemented
  site for design quality, providing feedback during a design review session,
  evaluating brand consistency, or checking responsive behaviour across breakpoints.
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

Judge web design for visual quality, consistency, effectiveness across devices.

## When Use

- Review mockup or prototype before dev
- Judge implemented site for design quality
- Give feedback in design review
- Check brand consistency across pages
- Test responsive behaviour at breakpoints

## Inputs

- **Required**: Design (URL, mockup, screenshots, source)
- **Optional**: Brand guidelines or design system docs
- **Optional**: Target audience description
- **Optional**: Reference designs or competitors
- **Optional**: Areas of concern

## Steps

### Step 1: Assess Visual Hierarchy

Hierarchy guides eye through content by importance.

- [ ] **Focal point**: Obvious entry point per page?
- [ ] **Heading hierarchy**: H1 → H2 → H3 logical?
- [ ] **Size contrast**: Important elements bigger?
- [ ] **Colour contrast**: CTAs prominent?
- [ ] **Whitespace**: Spacing separates groups?
- [ ] **Reading flow**: F-pattern, Z-pattern?

```markdown
## Visual Hierarchy Assessment
| Page/Section | Focal Point | Hierarchy Clear? | Issues |
|-------------|-------------|-----------------|--------|
| Homepage | Hero section CTA | Yes | Secondary CTA competes with primary |
| Product page | Product image | Mostly | Price not prominent enough |
| Contact form | Submit button | No | Form title same size as body text |
```

**Got:** Each page assessed for hierarchy.

**If fail:** No mockups? Assess from live code via dev tools.

### Step 2: Evaluate Typography

- [ ] **Font selection**: Right for brand, content?
- [ ] **Font pairing**: Heading + body fit (max 2-3 families)?
- [ ] **Type scale**: Consistent (1.25 major second, 1.333 perfect fourth)?
- [ ] **Line height**: Body 1.4-1.6; headings 1.1-1.3
- [ ] **Line length**: Body 45-75 chars (~66 best)
- [ ] **Font weight**: Used consistent for hierarchy
- [ ] **Font size**: Base ≥ 16px for body

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

**Got:** Typography assessed for consistency, readability, hierarchy.

**If fail:** More than 3 font families? Recommend consolidation.

### Step 3: Review Colour Usage

- [ ] **Palette coherence**: Intentional, limited (3-5 + neutrals)?
- [ ] **Brand alignment**: Match guidelines?
- [ ] **Contrast ratios**: WCAG AA (4.5:1 normal, 3:1 large)
- [ ] **Semantic colour**: Consistent meaning (red=err, green=ok)?
- [ ] **Colour blindness**: Info conveyed by more than colour?
- [ ] **Dark/light mode**: Both modes readable, on-brand?

```markdown
## Colour Assessment
| Usage | Colour | Contrast Ratio | WCAG AA | Notes |
|-------|--------|----------------|---------|-------|
| Body text on white | #333333 | 12.6:1 | Pass | Good |
| Link text on white | #2563eb | 5.2:1 | Pass | Good |
| Muted text on light gray | #9ca3af on #f3f4f6 | 2.1:1 | FAIL | Increase contrast |
| CTA button text | #ffffff on #22c55e | 3.1:1 | FAIL for small text | Use darker green or larger text |
```

**Got:** Palette reviewed for coherence, accessibility, semantic consistency.

**If fail:** Use contrast checker (WebAIM) for exact ratios.

### Step 4: Assess Layout and Spacing

- [ ] **Grid system**: Consistent grid (12-col, auto, custom)?
- [ ] **Spacing scale**: Systematic (4px/8px base, Tailwind-like)?
- [ ] **Alignment**: Elements on grid (no "almost aligned")?
- [ ] **Density**: Right for content (data-heavy vs marketing)?
- [ ] **Whitespace**: Used to group, separate?
- [ ] **Consistency**: Similar sections spaced same?

Spacing audit.

```markdown
## Spacing Consistency Check
| Element Pair | Expected Gap | Actual Gap | Consistent? |
|-------------|-------------|------------|-------------|
| Section title to content | 24px | 24px | Yes |
| Card to card | 16px | 16px/24px | No — inconsistent |
| Form label to input | 8px | 4px/8px/12px | No — varies |
```

**Got:** Layout uses systematic grid, spacing scale.

**If fail:** Spacing inconsistent? Recommend spacing scale (Tailwind `space-*`).

### Step 5: Evaluate Responsive Design

Test at key breakpoints.

| Breakpoint | Width | Represents |
|-----------|-------|-----------|
| Mobile | 375px | iPhone SE / small phones |
| Mobile L | 428px | iPhone 14 / large phones |
| Tablet | 768px | iPad portrait |
| Desktop | 1280px | Standard laptop |
| Wide | 1536px+ | Desktop monitor |

Per breakpoint check.
- [ ] **Layout adaptation**: Reflow right (stack mobile, side-by-side desktop)?
- [ ] **Touch targets**: ≥ 44x44px on mobile?
- [ ] **Text readability**: Font size right for viewport?
- [ ] **Image scaling**: Resize without distortion or overflow?
- [ ] **Navigation**: Mobile nav accessible (hamburger, bottom)?
- [ ] **No horizontal scroll**: Content does not overflow horizontal

```markdown
## Responsive Review
| Breakpoint | Layout | Touch Targets | Text | Images | Navigation | Issues |
|-----------|--------|---------------|------|--------|------------|--------|
| 375px | OK | OK | OK | Overflow on hero | Hamburger | Hero image clips |
| 768px | OK | OK | OK | OK | Hamburger | None |
| 1280px | OK | N/A | OK | OK | Full nav | None |
| 1536px | OK | N/A | Line length too long | OK | Full nav | Add max-width to content |
```

**Got:** Design tested at all key breakpoints, issues documented.

**If fail:** No responsive tools? Review CSS media queries for coverage.

### Step 6: Check Brand Consistency

- [ ] **Logo usage**: Right size, spacing, clear zone
- [ ] **Colour accuracy**: Brand colors match spec (hex values, not "close")
- [ ] **Typography match**: Fonts match brand
- [ ] **Tone/voice**: UI copy matches brand personality
- [ ] **Iconography**: Consistent set (style, weight, grid)
- [ ] **Photography style**: Match brand if applicable

**Got:** Brand elements verified vs guidelines, deviations noted.

**If fail:** No brand guidelines? Note as recommendation, assess internal consistency.

### Step 7: Write Design Review

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

**Got:** Review gives specific, visual-reference feedback with prioritized improvements.

**If fail:** Scoring feels arbitrary? Use simpler pass/concern/fail.

## Checks

- [ ] Visual hierarchy assessed for all major pages
- [ ] Typography evaluated for readability, consistency, scale
- [ ] Colour contrast verified vs WCAG AA min
- [ ] Layout and spacing checked for grid consistency
- [ ] Responsive design tested at 3+ breakpoints
- [ ] Brand consistency verified vs guidelines (or internal consistency)
- [ ] Feedback specific with visual refs (page, section, element)

## Pitfalls

- **Subjective without reasoning**: "I don't like the colour" not actionable. Explain why (contrast, brand mismatch, accessibility).
- **Ignore accessibility**: Visual review must include WCAG contrast. Beautiful designs that exclude users not good.
- **Review mockups only**: Test responsive, hover states, transitions — not just static layouts.
- **Prescribe solutions**: Describe problem ("text hard to read") not dictate fix ("use #333").
- **Forget context**: Banking app and gaming site have different standards. Review against right context.

## See Also

- `review-ux-ui` — usability, interaction, accessibility
- `setup-tailwind-typescript` — Tailwind CSS for design systems
- `scaffold-nextjs-app` — Next.js scaffolding
