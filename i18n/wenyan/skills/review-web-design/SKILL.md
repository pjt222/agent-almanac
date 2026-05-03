---
name: review-web-design
locale: wenyan
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

# 審網頁設計

察網頁之視覺、其一致、其於諸器之效。

## 用時

- 設計樣稿或原型，於開發之前審之乃用
- 既成之網或應用，量其設計之質乃用
- 設計審會中提反饋於視覺之設乃用
- 多頁多段間量其品牌之一乃用
- 諸斷點之響應之行察之乃用

## 入

- **必要**：所審之設計（網址、樣稿、截圖、或源碼）
- **可選**：品牌指南或設計系統文檔
- **可選**：目標受眾之述
- **可選**：參考之設計或競者之例
- **可選**：欲特察之處

## 法

### 第一步：量視覺層次

視覺層次導用者目，依重輕之序歷其內。

- [ ] **明焦點**：每頁有顯然之入處乎？
- [ ] **題之層**：題降序合理乎（H1 → H2 → H3）？
- [ ] **大小對比**：要者大於輔者乎？
- [ ] **色之對比**：CTA 與要行視覺顯著乎？
- [ ] **空白**：空白有效分組乎？
- [ ] **讀之流**：布合自然之讀模乎（F 模、Z 模）？

```markdown
## Visual Hierarchy Assessment
| Page/Section | Focal Point | Hierarchy Clear? | Issues |
|-------------|-------------|-----------------|--------|
| Homepage | Hero section CTA | Yes | Secondary CTA competes with primary |
| Product page | Product image | Mostly | Price not prominent enough |
| Contact form | Submit button | No | Form title same size as body text |
```

得：每要頁要段皆量其視覺層次之明。
敗則：樣稿不可得，則自實碼以瀏覽器之開發者工具察之。

### 第二步：量字體

- [ ] **擇字**：字合品牌與內容之類乎？
- [ ] **配字**：題與本之字相成乎（最多二三族）？
- [ ] **字級**：有一致之比例乎（如 1.25 大二度、1.333 完全四度）？
- [ ] **行高**：本文 1.4-1.6，題 1.1-1.3
- [ ] **行長**：本文行 45-75 字（最佳約 66）
- [ ] **字重**：重之變一致以示層
- [ ] **字大**：本文基大至少 16px

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

得：字體已量其一致、其可讀、其層。
敗則：用三族以上之字，宜議合之。

### 第三步：審色之用

- [ ] **色板之諧**：色板有意而少（常 3-5 色加中性）乎？
- [ ] **品牌之合**：色合品牌指南乎？
- [ ] **對比比**：文合 WCAG AA（常文 4.5:1，大文 3:1）
- [ ] **語義之色**：色一致以示義（紅=誤、綠=成）乎？
- [ ] **色盲**：信息傳於色之外乎？
- [ ] **明暗模**：若支，二模皆保可讀與品牌之一

```markdown
## Colour Assessment
| Usage | Colour | Contrast Ratio | WCAG AA | Notes |
|-------|--------|----------------|---------|-------|
| Body text on white | #333333 | 12.6:1 | Pass | Good |
| Link text on white | #2563eb | 5.2:1 | Pass | Good |
| Muted text on light gray | #9ca3af on #f3f4f6 | 2.1:1 | FAIL | Increase contrast |
| CTA button text | #ffffff on #22c55e | 3.1:1 | FAIL for small text | Use darker green or larger text |
```

得：色板審之諧、可達、語義之一。
敗則：用對比之器（WebAIM）以驗其確比。

### 第四步：量布與間距

- [ ] **格網**：用一致之格網乎（12 欄、自動布、或自定）？
- [ ] **間距級**：間距有系統乎（4px/8px 基，或 Tailwind 之級）？
- [ ] **對齊**：諸件對齊於格乎（無「將齊」者）？
- [ ] **密度**：信息之密合內容之類乎（數據密 vs. 營銷）？
- [ ] **空白**：空白有意以聚以分乎？
- [ ] **一致**：相似之段間距同乎？

間距之審：

```markdown
## Spacing Consistency Check
| Element Pair | Expected Gap | Actual Gap | Consistent? |
|-------------|-------------|------------|-------------|
| Section title to content | 24px | 24px | Yes |
| Card to card | 16px | 16px/24px | No — inconsistent |
| Form label to input | 8px | 4px/8px/12px | No — varies |
```

得：布用系統格網與間距級，皆一致。
敗則：間距不一，宜議採間距之級（如 Tailwind 之 `space-*`）。

### 第五步：量響應設計

於諸要斷點試之：

| 斷點 | 寬 | 代之器 |
|-----------|-------|-----------|
| 手機 | 375px | iPhone SE / 小機 |
| 大手機 | 428px | iPhone 14 / 大機 |
| 平板 | 768px | iPad 縱 |
| 桌機 | 1280px | 標準筆電 |
| 寬 | 1536px+ | 桌面顯示 |

每斷點察之：

- [ ] **布之適**：布適而流（手機疊，桌機並）乎？
- [ ] **觸標**：交互件於手機至少 44x44px 乎？
- [ ] **文可讀**：字大合視口乎？
- [ ] **圖縮**：圖縮放而不變形不溢乎？
- [ ] **導**：手機導可達乎（漢堡、底導等）？
- [ ] **無橫滾**：內容不橫溢視口

```markdown
## Responsive Review
| Breakpoint | Layout | Touch Targets | Text | Images | Navigation | Issues |
|-----------|--------|---------------|------|--------|------------|--------|
| 375px | OK | OK | OK | Overflow on hero | Hamburger | Hero image clips |
| 768px | OK | OK | OK | OK | Hamburger | None |
| 1280px | OK | N/A | OK | OK | Full nav | None |
| 1536px | OK | N/A | Line length too long | OK | Full nav | Add max-width to content |
```

得：諸要斷點皆試，諸患皆記。
敗則：響應之器不可得，察 CSS 媒體查詢之覆。

### 第六步：察品牌之一

- [ ] **標識之用**：標識繪正（大、距、淨域）乎？
- [ ] **色之確**：品牌色合規（hex 值，非「近矣」）乎？
- [ ] **字之合**：字合品牌指南乎？
- [ ] **語調**：UI 文合品牌人格乎？
- [ ] **圖標**：圖標出於一致之集（風、重、格）乎？
- [ ] **影像之風**：圖合品牌指南（若適）乎？

得：品牌諸件皆驗於指南，具體之偏皆記。
敗則：品牌指南不存，記為議，且察其內之一致。

### 第七步：書設計審

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

得：審提具體之反饋，附視覺之引，先後有序。
敗則：評分若覺武斷，用簡之過/患/敗之系代之。

## 驗

- [ ] 諸要頁要段視覺層次皆量
- [ ] 字體量其可讀、一致、級
- [ ] 色之對比驗於 WCAG AA 之最低
- [ ] 布與間距察其格之一
- [ ] 響應設計於三以上斷點試之
- [ ] 品牌之一驗於指南（或察內之一致）
- [ ] 反饋具體，附視覺之引（頁、段、件）

## 陷

- **主觀無理**：「吾不喜其色」非可行之言。宜述其故（對比、品牌之違、可達）
- **忽可達**：視覺設計之審必含 WCAG 對比之察。美而排用者，非佳設計
- **唯審樣稿**：宜試響應之行、懸停之態、轉之效，非唯靜布
- **代議解法**：述其患（「文於此底難讀」），勿令其特修（「用 #333」）
- **忘其境**：銀行應用與遊戲網有異之標。宜依適當之境而審

## 參

- `review-ux-ui` — 便用、交互、可達（與視覺互補）
- `setup-tailwind-typescript` — Tailwind CSS 為設計系統之施
- `scaffold-nextjs-app` — Next.js 應用之搭
