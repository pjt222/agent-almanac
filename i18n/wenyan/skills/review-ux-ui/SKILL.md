---
name: review-ux-ui
locale: wenyan
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

# 審用者經驗與介面

察用者所歷與其介面之設，以驗其便用、其可達、其有效。

## 用時

- 應用發布之前，行便用之審乃用
- 驗其合於 WCAG 2.1 AA 或 AAA 之可達標準乃用
- 量用者之流，求其速而少誤乃用
- 審其表單，便用而利其成乃用
- 行啟發式評估於既成之介面乃用
- 量其認知之負與其信息之構乃用

## 入

- **必要**：所審之物（網址、原型、或源碼）
- **必要**：目標用者之述（其職、其技、其用之境）
- **可選**：用者研究之得（訪談、問卷、分析）
- **可選**：WCAG 之目標等次（A、AA、AAA）
- **可選**：欲審之特定流或務
- **可選**：所試之輔器（屏讀、鍵切換）

## 法

### 第一步：啟發式評估（尼爾森十則）

依各則察其介面：

| # | 啟發則 | 要問 | 評 |
|---|-----------|-------------|--------|
| 1 | **系統狀態之顯** | 系統常告用者所為之事乎？ | |
| 2 | **系統與真實之合** | 用熟語熟念乎？ | |
| 3 | **用者之控與自由** | 易撤、易復、易脫不欲之態乎？ | |
| 4 | **一致與規範** | 同物同行乎？ | |
| 5 | **防誤** | 設計能於其發前防之乎？ | |
| 6 | **識而非憶** | 選項、行止、信息可見或易得乎？ | |
| 7 | **彈性與效能** | 有捷徑供熟者，而不惑生者乎？ | |
| 8 | **簡素之美** | 每物皆有用乎？無冗繁乎？ | |
| 9 | **助用者識誤、診誤、復其誤** | 誤辭明、特、有助乎？ | |
| 10 | **助與文檔** | 需時可得乎？ | |

各則之違，依重評之：

| 重 | 述 |
|----------|-------------|
| 0 | 非便用之患 |
| 1 | 微疵——有暇則修 |
| 2 | 小——優先甚低 |
| 3 | 大——宜修，優先高 |
| 4 | 巨——發布前必修 |

```markdown
## Heuristic Evaluation Findings
| # | Heuristic | Severity | Finding | Location |
|---|-----------|----------|---------|----------|
| 1 | System status | 3 | No loading indicator during data fetch — users click repeatedly | Dashboard page |
| 3 | User control | 2 | No undo for item deletion — only a confirmation dialog | Item list |
| 5 | Error prevention | 3 | Date field accepts invalid dates (Feb 30) | Booking form |
| 9 | Error recovery | 4 | Form submission error clears all fields | Registration |
```

得：十則皆評，各有具體之發現與重評。
敗則：時迫，則專察一、三、五、九（於用者之經驗最重）。

### 第二步：可達性審（WCAG 2.1）

#### 可感

- [ ] **1.1.1 非文之內容**：圖皆有替文（飾圖則 `alt=""`）
- [ ] **1.3.1 義與系**：用語義之 HTML（題、列、表、地標）
- [ ] **1.3.2 有義之序**：DOM 之序合於視之序
- [ ] **1.4.1 色之用**：色非傳義之唯一手段
- [ ] **1.4.3 對比**：常文 ≥ 4.5:1，大文 ≥ 3:1
- [ ] **1.4.4 文可放**：放至二倍而不失其用
- [ ] **1.4.11 非文對比**：UI 件與圖之對比 ≥ 3:1
- [ ] **1.4.12 文間距**：增間距（行高 1.5x，字距 0.12em，詞距 0.16em）而仍可用

#### 可操

- [ ] **2.1.1 鍵盤**：諸功能皆可以鍵操
- [ ] **2.1.2 無鍵陷**：焦點不困於件
- [ ] **2.4.1 跳鏈**：供鍵盤用者之跳導鏈
- [ ] **2.4.3 焦序**：Tab 之序合理可預
- [ ] **2.4.7 焦顯**：焦點之示明可見
- [ ] **2.4.11 焦不掩**：焦元不為粘題或浮層所掩
- [ ] **2.5.5 標大**：交互標 ≥ 24x24px（觸屏宜 44x44px）

#### 可解

- [ ] **3.1.1 頁之語**：`<html>` 設 `lang` 屬
- [ ] **3.2.1 焦時**：得焦不致意外之變
- [ ] **3.2.2 入時**：入而無預警則不致意外之變
- [ ] **3.3.1 誤之識**：誤以文明述
- [ ] **3.3.2 標與令**：表單入有見之標
- [ ] **3.3.3 誤之議**：誤辭示其修法

#### 強健

- [ ] **4.1.1 解析**：HTML 有效（無重 ID，巢正）
- [ ] **4.1.2 名、角、值**：自定件有 ARIA 角與屬
- [ ] **4.1.3 狀態之告**：動內容之變告於屏讀

得：WCAG 2.1 AA 諸則皆系統察之，每則記其過敗。
敗則：用自動之器（axe-core、Lighthouse）為初掃，後以人手測需人判之則。

### 第三步：鍵盤與屏讀之審

#### 鍵盤導之試

唯用 Tab、Shift+Tab、Enter、Space、方向、Escape：

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

#### 屏讀之試

以 NVDA（Windows）、VoiceOver（macOS/iOS）、或 TalkBack（Android）試之：

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

得：以鍵獨用、以屏讀，皆試其全務之流。
敗則：屏讀不可得，則察 ARIA 屬與語義之 HTML 為代。

### 第四步：析用者之流

繪而量其要流：

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

得：要流皆繪，阻處皆識而評。
敗則：用者分析不可得，則依務之繁與步之多以量之。

### 第五步：量其認知之負

- [ ] **信息之密**：每屏所載量適乎？
- [ ] **漸顯**：繁雜之信息漸示乎？
- [ ] **聚塊**：相關者視覺聚之乎（格式塔）？
- [ ] **識勝於憶**：用者見其選乎，抑須記之？
- [ ] **一致之模**：同務同模乎？
- [ ] **決疲**：一時呈過繁之選乎？（希克之律）
- [ ] **工作之憶**：步間須記信息乎？

得：認知負已量，過載與不足之處皆識。
敗則：難於客量者，行「眯眼之試」——眯目觀屏，其結構與層次仍見乎。

### 第六步：審表單之便用

每表皆察：

- [ ] **標**：每入有可見之標而與之關
- [ ] **占位**：唯用為例，非為標
- [ ] **入類**：用正之 HTML 入類（email、tel、number、date）以便手機鍵盤
- [ ] **驗時**：誤示於 blur 或提交（非每擊）
- [ ] **誤辭**：明特（「Email must include @」），非泛（「Invalid input」）
- [ ] **必填**：明示之（多必者，則選填者亦明示）
- [ ] **聚域**：相關之域視覺聚之（名、址、付段）
- [ ] **自完**：標準域設 `autocomplete` 屬（name、email、address、cc-number）
- [ ] **Tab 序**：合於視覺布之邏輯
- [ ] **多步**：示其進度——當前步與總步
- [ ] **持存**：用者離而返，表單之數仍存

得：每表皆依清單察，具體之患皆記。
敗則：表多者，先察流量最大者（註冊、結算、聯繫）。

### 第七步：書 UX/UI 審報

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

得：審報示先後之序，提具體可行之議，皆附其重之評。
敗則：審見之患過繁，則分為「必修」（重 3-4）與「宜修」（重 1-2）。

## 驗

- [ ] 尼爾森十則皆評，附重之等
- [ ] WCAG 2.1 諸則皆察（至少：1.1.1、1.4.3、2.1.1、2.4.7、3.3.1、4.1.2）
- [ ] 要流皆以鍵試之
- [ ] 屏讀已試（或察 ARIA 與語義 HTML 為代）
- [ ] 至少一要流析其阻
- [ ] 認知之負已量
- [ ] 表單之便用已評
- [ ] 發現依重序，附可行之議

## 陷

- **混 UX 與視覺設計**：UX 在其用，視覺在其貌。美可而 UX 劣。二皆評，宜分之
- **唯試正路**：誤態、空態、載態、邊例皆藏其患
- **忽真機之試**：瀏覽之響應模僅為代。真機方察觸、性能、視口之患
- **可達性之為後思**：晚得則修之費高。宜早察而續察
- **個好為 UX 反饋**：「吾欲...」非 UX 反饋也。宜引啟發則、研究、或既立之模

## 參

- `review-web-design` — 視覺設計之審（布、字、色——與 UX 互補）
- `scaffold-nextjs-app` — Next.js 應用之搭
- `setup-tailwind-typescript` — Tailwind CSS 為設計系統之施
