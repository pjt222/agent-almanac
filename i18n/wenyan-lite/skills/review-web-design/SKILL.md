---
name: review-web-design
locale: wenyan-lite
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

# 審查網頁設計

評估網頁設計於各設備之視覺品質、一致性與成效。

## 適用時機

- 開發前審查設計樣稿或原型
- 評估已實作之網站或網頁應用之設計品質
- 設計審查會議中對視覺設計提供反饋
- 評估多頁面或多區段之品牌一致性
- 檢查跨斷點之響應式設計行為

## 輸入

- **必要**：待審查之設計（URL、樣稿文件、截圖或源碼）
- **選擇性**：品牌指引或設計系統文件
- **選擇性**：目標受眾描述
- **選擇性**：參考設計或競品範例
- **選擇性**：特定關注領域

## 步驟

### 步驟一：評估視覺層級

視覺層級依重要程度引導用戶之視線穿越內容。

- [ ] **明確焦點**：每頁/每屏是否有顯著之入口點？
- [ ] **標題層級**：標題是否邏輯遞降（H1 → H2 → H3）？
- [ ] **尺寸對比**：重要元素是否大於支援元素？
- [ ] **顏色對比**：CTA 與關鍵行動是否視覺突出？
- [ ] **空白**：間距是否有效分隔邏輯分組？
- [ ] **閱讀流**：佈局是否遵循自然閱讀模式（F 模式、Z 模式）？

```markdown
## Visual Hierarchy Assessment
| Page/Section | Focal Point | Hierarchy Clear? | Issues |
|-------------|-------------|-----------------|--------|
| Homepage | Hero section CTA | Yes | Secondary CTA competes with primary |
| Product page | Product image | Mostly | Price not prominent enough |
| Contact form | Submit button | No | Form title same size as body text |
```

**預期：** 各主要頁面/區段已評估視覺層級之清晰度。
**失敗時：** 若樣稿不可用，依瀏覽器開發工具從實際代碼評估。

### 步驟二：評估字體

- [ ] **字體選擇**：字體是否適合品牌與內容類型？
- [ ] **字體配對**：標題與內文字體是否相配（最多 2-3 系列）？
- [ ] **字級階**：是否有一致之階（如 1.25 大二度、1.333 完全四度）？
- [ ] **行高**：內文 1.4-1.6 行高；標題 1.1-1.3
- [ ] **行長**：內文行長 45-75 字（最佳約 66）
- [ ] **字重**：字重變化用以指示層級且一致
- [ ] **字級**：內文基礎字級至少 16px

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

**預期：** 字體已評估一致性、可讀性與層級。
**失敗時：** 若設計用超過 3 系列字體，建議整合。

### 步驟三：審查顏色使用

- [ ] **配色和諧**：配色是否有意且有限（通常 3-5 色加中性色）？
- [ ] **品牌契合**：顏色是否符合品牌指引？
- [ ] **對比比**：文字符合 WCAG AA（普通文字 4.5:1，大字 3:1）
- [ ] **語義顏色**：顏色是否一致用於語意（紅=錯誤、綠=成功）？
- [ ] **色盲考量**：資訊是否非僅由顏色傳達？
- [ ] **暗/亮模式**：若支援，兩模式皆維持可讀性與品牌一致性

```markdown
## Colour Assessment
| Usage | Colour | Contrast Ratio | WCAG AA | Notes |
|-------|--------|----------------|---------|-------|
| Body text on white | #333333 | 12.6:1 | Pass | Good |
| Link text on white | #2563eb | 5.2:1 | Pass | Good |
| Muted text on light gray | #9ca3af on #f3f4f6 | 2.1:1 | FAIL | Increase contrast |
| CTA button text | #ffffff on #22c55e | 3.1:1 | FAIL for small text | Use darker green or larger text |
```

**預期：** 配色已審查和諧度、可及性與語義一致性。
**失敗時：** 用對比檢查工具（WebAIM）以驗證精確比值。

### 步驟四：評估佈局與間距

- [ ] **網格系統**：是否用一致網格（12 欄、自動佈局或自定）？
- [ ] **間距階**：間距是否系統化（4px/8px 基準或類 Tailwind 階）？
- [ ] **對齊**：元素是否對齊網格（無「幾乎對齊」之項）？
- [ ] **密度**：資訊密度是否適合內容類型（重數據 vs. 行銷）？
- [ ] **空白**：空白是否有意用於分組與分隔？
- [ ] **一致性**：相似區段是否間距相同？

間距審計：

```markdown
## Spacing Consistency Check
| Element Pair | Expected Gap | Actual Gap | Consistent? |
|-------------|-------------|------------|-------------|
| Section title to content | 24px | 24px | Yes |
| Card to card | 16px | 16px/24px | No — inconsistent |
| Form label to input | 8px | 4px/8px/12px | No — varies |
```

**預期：** 佈局一致使用系統化網格與間距階。
**失敗時：** 若間距不一致，建議採用間距階（如 Tailwind 之 `space-*`）。

### 步驟五：評估響應式設計

跨關鍵斷點測試：

| 斷點 | 寬度 | 代表 |
|-----------|-------|-----------|
| 手機 | 375px | iPhone SE / 小型手機 |
| 大手機 | 428px | iPhone 14 / 大型手機 |
| 平板 | 768px | iPad 直向 |
| 桌面 | 1280px | 標準筆電 |
| 寬螢幕 | 1536px+ | 桌上型顯示器 |

於各斷點檢查：
- [ ] **佈局適應**：佈局是否適當重排（手機堆疊、桌面並列）？
- [ ] **觸控目標**：互動元素於手機是否至少 44x44px？
- [ ] **文字可讀**：字級是否適合視窗？
- [ ] **圖片縮放**：圖片是否無變形或溢出地縮放？
- [ ] **導航**：手機導航是否可及（漢堡、底部導航等）？
- [ ] **無水平捲動**：內容不水平溢出視窗

```markdown
## Responsive Review
| Breakpoint | Layout | Touch Targets | Text | Images | Navigation | Issues |
|-----------|--------|---------------|------|--------|------------|--------|
| 375px | OK | OK | OK | Overflow on hero | Hamburger | Hero image clips |
| 768px | OK | OK | OK | OK | Hamburger | None |
| 1280px | OK | N/A | OK | OK | Full nav | None |
| 1536px | OK | N/A | Line length too long | OK | Full nav | Add max-width to content |
```

**預期：** 設計於所有關鍵斷點已測試，問題已記錄。
**失敗時：** 若無響應式測試工具，審查 CSS 媒體查詢以查涵蓋。

### 步驟六：檢查品牌一致性

- [ ] **Logo 使用**：Logo 渲染正確（尺寸、間距、淨空區）
- [ ] **顏色準確**：品牌色符合規格（hex 值，非「相近即可」）
- [ ] **字體匹配**：字體符合品牌指引
- [ ] **語調/聲音**：UI 文案符合品牌個性
- [ ] **圖示**：圖示來自一致集合（風格、字重、網格）
- [ ] **攝影風格**：圖片符合品牌指引（如適用）

**預期：** 品牌元素已對照指引驗證，具體偏差已記錄。
**失敗時：** 若無品牌指引，記為建議並改評估內部一致性。

### 步驟七：撰寫設計審查

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

**預期：** 審查提供具體、有視覺參考之反饋並按優先級排序之改進。
**失敗時：** 若評分感覺武斷，改用更簡單之通過/關注/失敗系統。

## 驗證

- [ ] 所有主要頁面/區段之視覺層級已評估
- [ ] 字體已評估可讀性、一致性與字級
- [ ] 顏色對比已對照 WCAG AA 最低值驗證
- [ ] 佈局與間距已檢查網格一致性
- [ ] 響應式設計於 3 個以上斷點已測試
- [ ] 品牌一致性已對照指引驗證（或評估內部一致性）
- [ ] 反饋具體並附視覺參考（頁面、區段、元素）

## 常見陷阱

- **無理由之主觀**：「我不喜歡這顏色」不可執行。應說明理由（對比、品牌不符、可及性）。
- **忽視可及性**：視覺設計審查須含 WCAG 對比檢查。排除用戶之美麗設計非好設計。
- **僅審樣稿**：應測試響應行為、懸停狀態與過渡——非僅靜態佈局。
- **直接指定方案**：應描述問題（「此背景上文字難讀」）而非規定修法（「用 #333」）。
- **遺忘情境**：銀行應用與遊戲網站之設計標準不同。應依適當情境審查。

## 相關技能

- `review-ux-ui` — 可用性、互動模式與可及性（與視覺設計互補）
- `setup-tailwind-typescript` — Tailwind CSS 用於設計系統實作
- `scaffold-nextjs-app` — Next.js 應用腳手架
