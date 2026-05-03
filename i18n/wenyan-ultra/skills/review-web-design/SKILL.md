---
name: review-web-design
locale: wenyan-ultra
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

# 察網設

評視之質、一致、跨機之效也。

## 用

- 察樣稿前→用
- 察既釋之網→用
- 設察會予反→用
- 評跨頁牌一致→用
- 跨段點察應變→用

## 入

- **必**：所察之設（URL、稿、截、源）
- **可**：牌則或設系文
- **可**：標眾述
- **可**：參設或競例
- **可**：所慮處

## 行

### 一：察視階

視階導目歷重要之容。

- [ ] **焦點明**：每屏有明入點乎？
- [ ] **題階**：題降序合理乎（H1 → H2 → H3）？
- [ ] **尺對**：要素大於輔乎？
- [ ] **色對**：CTA 顯著乎？
- [ ] **白**：間隔組分有效乎？
- [ ] **讀流**：合自然式（F、Z）乎？

```markdown
## Visual Hierarchy Assessment
| Page/Section | Focal Point | Hierarchy Clear? | Issues |
|-------------|-------------|-----------------|--------|
| Homepage | Hero section CTA | Yes | Secondary CTA competes with primary |
```

得：各要頁皆察。

敗：無稿→活碼以開發工具察。

### 二：察字體

- [ ] **字選**：合牌與容乎？
- [ ] **字配**：題體相得（≤2-3 族）乎？
- [ ] **字階**：一致比例乎？
- [ ] **行高**：體 1.4-1.6、題 1.1-1.3
- [ ] **行長**：體 45-75 字（佳 ~66）
- [ ] **重**：權變一致表階
- [ ] **大**：體 ≥ 16px

```css
:root {
  --text-xs: 0.64rem;
  --text-sm: 0.8rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.563rem;
  --text-2xl: 1.953rem;
  --text-3xl: 2.441rem;
}
```

得：字察一致、可讀、階。

敗：> 3 族→宜整。

### 三：察色用

- [ ] **盤合**：盤有意而限（3-5 + 中）乎？
- [ ] **牌合**：色合牌則乎？
- [ ] **對比**：文達 WCAG AA
- [ ] **語色**：紅誤、綠成一致乎？
- [ ] **色盲**：訊不僅賴色乎？
- [ ] **明暗模**：兩模可讀且牌一致乎？

```markdown
## Colour Assessment
| Usage | Colour | Contrast Ratio | WCAG AA |
|-------|--------|----------------|---------|
| Body text on white | #333333 | 12.6:1 | Pass |
| Muted text on light gray | #9ca3af on #f3f4f6 | 2.1:1 | FAIL |
```

得：盤察合、達、語一致。

敗：用對比器（WebAIM）驗確比。

### 四：察排與間

- [ ] **格系**：用一致格乎？
- [ ] **間階**：4px/8px 基乎？
- [ ] **對齊**：諸元齊格乎？
- [ ] **密**：適容類乎？
- [ ] **白**：有意組分乎？
- [ ] **一致**：同段間同乎？

得：排用系格與間階一致。

敗：間不一→宜採間階（如 Tailwind `space-*`）。

### 五：察應變

跨段點測：

| 段點 | 寬 | 代 |
|------|----|---|
| 行 | 375px | iPhone SE |
| 行 L | 428px | iPhone 14 |
| 板 | 768px | iPad |
| 桌 | 1280px | 標筆 |
| 廣 | 1536px+ | 桌屏 |

各段點查：
- [ ] **排適**：合理重排乎？
- [ ] **觸標**：行上 ≥ 44x44px 乎？
- [ ] **文讀**：字大適視口乎？
- [ ] **圖縮**：不形變不溢乎？
- [ ] **導**：行導可達乎？
- [ ] **無橫卷**：容不橫溢

得：諸段點測、問題錄。

敗：無應變測工→察 CSS 媒詢覆蓋。

### 六：察牌一致

- [ ] **徽用**：徽繪正（大、間、淨）
- [ ] **色準**：牌色合譜（hex 值）
- [ ] **字合**：合牌則
- [ ] **語**：UI 文合牌格
- [ ] **圖**：來自一致集
- [ ] **影**：合牌則（如有）

得：牌元驗、具偏錄。

敗：無牌則→記為建、察內一致代。

### 七：書設察

```markdown
## Web Design Review
### Overall Impression
[2-3 sentences]
### Visual Hierarchy: [Score/5]
### Typography: [Score/5]
### Colour: [Score/5]
### Layout & Spacing: [Score/5]
### Responsive Design: [Score/5]
### Brand Consistency: [Score/5]
### Priority Improvements
1. [Most impactful change]
```

得：察予具體視參反、優先修改。

敗：評分主觀→改用過/慮/敗制。

## 驗

- [ ] 諸要頁視階察
- [ ] 字評可讀、一致、階
- [ ] 色對 WCAG AA 驗
- [ ] 排間查格一致
- [ ] 應變測 ≥ 3 段點
- [ ] 牌一致驗（或內一致察）
- [ ] 反具體含視參

## 忌

- **主觀無理**：「不喜此色」非可行。釋因（對、牌、達）
- **忽達**：視察必含 WCAG 對。美而排用者非佳設
- **僅察稿**：測應變、懸停、過渡，非僅靜排
- **規方**：述問題非斷方
- **忘境**：銀行與遊戲設標異。按境察

## 參

- `review-ux-ui`
- `setup-tailwind-typescript`
- `scaffold-nextjs-app`
