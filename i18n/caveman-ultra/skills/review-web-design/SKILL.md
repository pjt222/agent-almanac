---
name: review-web-design
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Review web design → layout, typo, color, spacing, responsive, brand, hierarchy. Use → mockup pre-dev, implemented site quality, design review, brand check, breakpoint test.
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

Eval web design → visual quality, consistency, cross-device.

## Use When

- Mockup|prototype pre-dev review
- Implemented site|app design quality
- Design review session feedback
- Brand consistency multi-page
- Responsive behavior across breakpoints

## In

- **Required**: Design (URL|mockup|screenshot|src)
- **Optional**: Brand guidelines|design system
- **Optional**: Target audience
- **Optional**: Reference|competitor designs
- **Optional**: Concerns

## Do

### Step 1: Visual Hierarchy

Guides eye → importance.

- [ ] **Focal point**: Obvious entry per page?
- [ ] **Heading hierarchy**: H1→H2→H3 logical?
- [ ] **Size contrast**: Important > supporting?
- [ ] **Color contrast**: CTAs prominent?
- [ ] **Whitespace**: Separates groups?
- [ ] **Reading flow**: F|Z pattern?

```markdown
## Visual Hierarchy Assessment
| Page/Section | Focal Point | Hierarchy Clear? | Issues |
|-------------|-------------|-----------------|--------|
| Homepage | Hero section CTA | Yes | Secondary CTA competes with primary |
| Product page | Product image | Mostly | Price not prominent enough |
| Contact form | Submit button | No | Form title same size as body text |
```

→ Each page assessed.

If err: no mockups → live code via dev tools.

### Step 2: Typography

- [ ] **Font selection**: Right for brand+content?
- [ ] **Pairing**: Heading+body complement (max 2-3 families)?
- [ ] **Scale**: Consistent (1.25 maj 2nd, 1.333 4th)?
- [ ] **Line height**: Body 1.4-1.6, headings 1.1-1.3
- [ ] **Line length**: 45-75 chars (~66 optimal)
- [ ] **Weight**: Used for hierarchy
- [ ] **Size**: ≥16px body

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

→ Typo consistent, readable, hierarchical.

If err: >3 families → consolidate.

### Step 3: Color

- [ ] **Palette**: Limited (3-5 + neutrals)?
- [ ] **Brand**: Matches guidelines?
- [ ] **Contrast**: WCAG AA (4.5:1 normal, 3:1 large)
- [ ] **Semantic**: Consistent (red=err, green=ok)?
- [ ] **Color blind**: Not sole means?
- [ ] **Dark/light**: Both readable + brand consistent?

```markdown
## Colour Assessment
| Usage | Colour | Contrast Ratio | WCAG AA | Notes |
|-------|--------|----------------|---------|-------|
| Body text on white | #333333 | 12.6:1 | Pass | Good |
| Link text on white | #2563eb | 5.2:1 | Pass | Good |
| Muted text on light gray | #9ca3af on #f3f4f6 | 2.1:1 | FAIL | Increase contrast |
| CTA button text | #ffffff on #22c55e | 3.1:1 | FAIL for small text | Use darker green or larger text |
```

→ Palette coherent + accessible + semantic.

If err: contrast checker tool (WebAIM).

### Step 4: Layout + Spacing

- [ ] **Grid**: Consistent (12-col, auto, custom)?
- [ ] **Spacing scale**: Systematic (4|8px base, Tailwind)?
- [ ] **Alignment**: To grid (no "almost")?
- [ ] **Density**: Right for content?
- [ ] **Whitespace**: Intentional?
- [ ] **Consistency**: Similar = same spacing?

```markdown
## Spacing Consistency Check
| Element Pair | Expected Gap | Actual Gap | Consistent? |
|-------------|-------------|------------|-------------|
| Section title to content | 24px | 24px | Yes |
| Card to card | 16px | 16px/24px | No — inconsistent |
| Form label to input | 8px | 4px/8px/12px | No — varies |
```

→ Systematic grid + spacing.

If err: inconsistent → adopt scale (Tailwind `space-*`).

### Step 5: Responsive

| Breakpoint | Width | Represents |
|-----------|-------|-----------|
| Mobile | 375px | iPhone SE / small phones |
| Mobile L | 428px | iPhone 14 / large phones |
| Tablet | 768px | iPad portrait |
| Desktop | 1280px | Standard laptop |
| Wide | 1536px+ | Desktop monitor |

Per breakpoint:
- [ ] **Layout adapt**: Reflows (stack mobile, side desktop)?
- [ ] **Touch targets**: ≥44x44 mobile?
- [ ] **Text**: Right size?
- [ ] **Images**: Scale w/o distortion?
- [ ] **Nav**: Mobile accessible?
- [ ] **No h-scroll**

```markdown
## Responsive Review
| Breakpoint | Layout | Touch Targets | Text | Images | Navigation | Issues |
|-----------|--------|---------------|------|--------|------------|--------|
| 375px | OK | OK | OK | Overflow on hero | Hamburger | Hero image clips |
| 768px | OK | OK | OK | OK | Hamburger | None |
| 1280px | OK | N/A | OK | OK | Full nav | None |
| 1536px | OK | N/A | Line length too long | OK | Full nav | Add max-width to content |
```

→ All breakpoints tested + documented.

If err: no tools → review CSS media queries.

### Step 6: Brand Consistency

- [ ] **Logo**: Right size, spacing, clear zone
- [ ] **Color**: Matches spec (hex, not "close")
- [ ] **Typo**: Matches guidelines
- [ ] **Tone**: UI copy matches personality
- [ ] **Icons**: Consistent set
- [ ] **Photo**: Matches brand

→ Brand verified vs guidelines.

If err: no guidelines → note + assess internal consistency.

### Step 7: Write Review

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

→ Specific, visual-reference feedback + prioritized improvements.

If err: scoring arbitrary → pass|concern|fail.

## Check

- [ ] Visual hierarchy all major pages
- [ ] Typo readable + consistent + scaled
- [ ] Color contrast vs WCAG AA
- [ ] Layout + spacing grid consistent
- [ ] Responsive 3+ breakpoints
- [ ] Brand vs guidelines (or internal)
- [ ] Specific feedback w/ visual refs

## Traps

- **Subjective no reason**: "Don't like color" → not actionable. Explain why.
- **Ignore access**: Must include WCAG contrast. Beautiful + excludes ≠ good.
- **Mockups only**: Test responsive, hover, transitions — not static.
- **Prescribe**: Describe problem, not specific fix.
- **No context**: Banking ≠ gaming. Review against context.

## →

- `review-ux-ui` — usability + interaction + access
- `setup-tailwind-typescript` — Tailwind CSS impl
- `scaffold-nextjs-app` — Next.js scaffold
