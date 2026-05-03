---
name: review-ux-ui
locale: wenyan-ultra
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

# 察介

評介之用、達、效也。

## 用

- 釋前察用→用
- WCAG 2.1 達合→用
- 流之效→用
- 表設→用
- 啟發評既介→用

## 入

- **必**：所察之介（URL、原型、源碼）
- **必**：標用述（職、技、境）
- **可**：研果（訪、問、析）
- **可**：WCAG 標（A、AA、AAA）
- **可**：所察之流
- **可**：助技（讀屏、開關）

## 行

### 一：啟發評（Nielsen 十則）

逐則察介：

| # | 則 | 問 |
|---|----|---|
| 1 | **狀顯** | 系恆告用所事乎？|
| 2 | **介合實** | 用熟語熟念乎？|
| 3 | **用控自由** | 易撤、復、退乎？|
| 4 | **一致規範** | 同元同行乎？|
| 5 | **防誤** | 設防誤先發乎？|
| 6 | **識勝憶** | 選、行、訊皆顯乎？|
| 7 | **靈效** | 有捷徑而不亂初乎？|
| 8 | **簡美** | 元皆有用乎？無冗乎？|
| 9 | **助識診復誤** | 誤訊明、具、建乎？|
| 10 | **助文** | 助易尋乎？|

各則評重：

| 級 | 述 |
|----|---|
| 0 | 非問題 |
| 1 | 飾 — 暇修 |
| 2 | 微 — 低先 |
| 3 | 大 — 必修 |
| 4 | 災 — 釋前必修 |

```markdown
## Heuristic Evaluation Findings
| # | Heuristic | Severity | Finding | Location |
|---|-----------|----------|---------|----------|
| 1 | System status | 3 | No loading indicator during data fetch — users click repeatedly | Dashboard page |
| 3 | User control | 2 | No undo for item deletion — only a confirmation dialog | Item list |
| 5 | Error prevention | 3 | Date field accepts invalid dates (Feb 30) | Booking form |
| 9 | Error recovery | 4 | Form submission error clears all fields | Registration |
```

得：十則皆評，各有具體發現與重級。

敗：時迫→重 1、3、5、9。

### 二：達察（WCAG 2.1）

#### 可知

- [ ] **1.1.1 非文容**：圖皆有 alt（飾圖 `alt=""`）
- [ ] **1.3.1 訊關**：用語意 HTML
- [ ] **1.3.2 序意**：DOM 序合視序
- [ ] **1.4.1 色用**：色非唯傳訊
- [ ] **1.4.3 對比**：文 ≥ 4.5:1（常）、≥ 3:1（大）
- [ ] **1.4.4 縮文**：可縮 200% 不失功
- [ ] **1.4.11 非文對**：UI 元 ≥ 3:1
- [ ] **1.4.12 文距**：增距仍可用

#### 可操

- [ ] **2.1.1 鍵**：諸功皆鍵可操
- [ ] **2.1.2 無鍵困**：焦不困
- [ ] **2.4.1 跳鏈**：有跳導鏈
- [ ] **2.4.3 焦序**：Tab 序合理
- [ ] **2.4.7 焦顯**：焦印明顯
- [ ] **2.4.11 焦不蔽**：焦元不藏
- [ ] **2.5.5 標尺**：互動 ≥ 24x24px

#### 可解

- [ ] **3.1.1 頁語**：`<html>` 設 `lang`
- [ ] **3.2.1 焦時**：焦不引意外
- [ ] **3.2.2 入時**：入不引意外
- [ ] **3.3.1 誤識**：誤明述於文
- [ ] **3.3.2 標令**：表入有顯標
- [ ] **3.3.3 誤建**：誤訊建修法

#### 健

- [ ] **4.1.1 解析**：HTML 有效
- [ ] **4.1.2 名色值**：自定元有 ARIA
- [ ] **4.1.3 狀訊**：動容變宣告

得：WCAG 2.1 AA 系察、各條過/敗。

敗：先用 axe-core、Lighthouse 自動掃，後人評需判者。

### 三：鍵與讀屏察

#### 鍵導測

僅用 Tab、Shift+Tab、Enter、Space、箭、Esc：

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

#### 讀屏測

NVDA、VoiceOver、TalkBack 測：

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

得：全流以鍵獨、讀屏皆測。

敗：無讀屏→察 ARIA 與語意 HTML 為代。

### 四：流析

繪要流：

```markdown
## User Flow: Complete a Purchase

### Steps
1. Browse products → 2. View product → 3. Add to cart → 4. View cart →
5. Enter shipping → 6. Enter payment → 7. Review order → 8. Confirm
```

得：要流繪、摩擦點識別評級。

敗：無分析→按複雜與步數評。

### 五：認負察

- [ ] **訊密**：屏訊量適乎？
- [ ] **漸顯**：複訊漸顯乎？
- [ ] **塊**：相關視覺成組乎？
- [ ] **識勝憶**：見而非憶乎？
- [ ] **一致式**：同務同式乎？
- [ ] **決疲**：選過多乎？
- [ ] **工憶**：跨步需憶乎？

得：認負察、過載/不足區明。

敗：難客評→「眯測」（眯眼察結構顯否）。

### 六：表用察

各表：

- [ ] **標**：每入有顯關標
- [ ] **占文**：僅作例非標
- [ ] **入型**：HTML 入型正
- [ ] **驗時**：失焦或提交時誤
- [ ] **誤訊**：具非泛
- [ ] **必欄**：明標
- [ ] **欄組**：相關視覺組
- [ ] **自完**：`autocomplete` 設
- [ ] **Tab 序**：合視覺
- [ ] **多步表**：進度顯
- [ ] **持**：離返保

得：每表察、具體問題錄。

敗：表多→重高量者（註冊、結算、聯）。

### 七：書察報

```markdown
## UX/UI Review Report
### Executive Summary
[2-3 sentences]
### Top 5 Improvements (Prioritised)
1. **[Issue]** — Severity: [N] — [Specific recommendation]
```

得：察給優先可行建、附重級。

敗：問題過多→分「必修」（3-4）「宜修」（1-2）。

## 驗

- [ ] 十則皆評
- [ ] WCAG 2.1 至少 1.1.1、1.4.3、2.1.1、2.4.7、3.3.1、4.1.2 察
- [ ] 鍵導要流測
- [ ] 讀屏測（或 ARIA/語意 HTML 代）
- [ ] 至少一要流析摩擦
- [ ] 認負察
- [ ] 表用察
- [ ] 發現按重排可行建

## 忌

- **混 UX 與視設**：UX 為何運、視為何貌。美而 UX 劣可有
- **僅測順路**：誤、空、載、邊例為 UX 問題藏處
- **忽真機**：瀏覽器代之。真機觸、性、視口問題
- **達為後思**：晚發貴修。早續察
- **私好為 UX 反**：「吾偏好…」非 UX 反。引則、研、規

## 參

- `review-web-design`
- `scaffold-nextjs-app`
- `setup-tailwind-typescript`
