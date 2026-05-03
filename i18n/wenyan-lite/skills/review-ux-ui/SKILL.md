---
name: review-ux-ui
locale: wenyan-lite
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

# 審查 UX/UI

評估用戶體驗與介面設計之可用性、可及性與成效。

## 適用時機

- 應用於發佈前進行可用性審查
- 評估可及性合規（WCAG 2.1 AA 或 AAA）
- 評估用戶流程之效率與錯誤防範
- 審查表單設計之可用性與轉化優化
- 對既有介面進行啟發式評估
- 評估認知負荷與資訊架構

## 輸入

- **必要**：待審查之應用（URL、原型或源碼）
- **必要**：目標用戶描述（角色、技術熟練度、使用情境）
- **選擇性**：用戶研究發現（訪談、調查、分析）
- **選擇性**：WCAG 合規目標（A、AA 或 AAA）
- **選擇性**：欲評估之具體用戶流程或任務
- **選擇性**：用以測試之輔助技術（屏幕閱讀器、開關存取）

## 步驟

### 步驟一：啟發式評估（Nielsen 十項啟發式）

依各啟發式評估介面：

| # | 啟發式 | 關鍵問題 | 評分 |
|---|-----------|-------------|--------|
| 1 | **系統狀態之可見性** | 系統是否始終告知用戶當前發生何事？ | |
| 2 | **系統與現實世界之契合** | 系統是否使用熟悉之語言與概念？ | |
| 3 | **用戶控制與自由** | 用戶能否輕易撤銷、重做或退出非預期狀態？ | |
| 4 | **一致性與標準** | 相似元素是否始終以相同方式運作？ | |
| 5 | **錯誤防範** | 設計是否在錯誤發生前加以防範？ | |
| 6 | **識別重於回憶** | 選項、動作與資訊是否可見或易於擷取？ | |
| 7 | **使用之靈活性與效率** | 是否為熟手提供捷徑而不致困擾新手？ | |
| 8 | **美學與極簡設計** | 各元素是否皆有用途？是否有不必要之雜亂？ | |
| 9 | **協助用戶識別、診斷並從錯誤中恢復** | 錯誤訊息是否清晰、具體、有建設性？ | |
| 10 | **協助與文件** | 需要時協助是否可用且易於尋找？ | |

對各啟發式違反之嚴重度評級：

| 嚴重度 | 描述 |
|----------|-------------|
| 0 | 非可用性問題 |
| 1 | 表面 — 有時間時修正 |
| 2 | 輕微 — 低優先級修正 |
| 3 | 重大 — 應修正，高優先級 |
| 4 | 災難 — 發佈前必修 |

```markdown
## Heuristic Evaluation Findings
| # | Heuristic | Severity | Finding | Location |
|---|-----------|----------|---------|----------|
| 1 | System status | 3 | No loading indicator during data fetch — users click repeatedly | Dashboard page |
| 3 | User control | 2 | No undo for item deletion — only a confirmation dialog | Item list |
| 5 | Error prevention | 3 | Date field accepts invalid dates (Feb 30) | Booking form |
| 9 | Error recovery | 4 | Form submission error clears all fields | Registration |
```

**預期：** 全部十項啟發式皆已評估，並附具體發現與嚴重度評級。
**失敗時：** 若時間有限，聚焦於啟發式 1、3、5、9（對用戶體驗影響最大者）。

### 步驟二：可及性審計（WCAG 2.1）

#### 可感知

- [ ] **1.1.1 非文字內容**：所有圖片皆有 alt 文字（裝飾性圖片用 `alt=""`）
- [ ] **1.3.1 資訊與關係**：使用語義化 HTML（標題、列表、表格、地標）
- [ ] **1.3.2 有意義之順序**：DOM 順序與視覺順序一致
- [ ] **1.4.1 顏色之使用**：顏色非傳達資訊之唯一手段
- [ ] **1.4.3 對比**：文字對比比 ≥ 4.5:1（普通），≥ 3:1（大字）
- [ ] **1.4.4 縮放文字**：文字可縮放至 200% 而不喪失功能
- [ ] **1.4.11 非文字對比**：UI 元件與圖形對比 ≥ 3:1
- [ ] **1.4.12 文字間距**：內容於增大文字間距下仍可運作（行高 1.5x、字距 0.12em、詞距 0.16em）

#### 可操作

- [ ] **2.1.1 鍵盤**：所有功能皆可由鍵盤操作
- [ ] **2.1.2 無鍵盤陷阱**：焦點絕不被困於元件中
- [ ] **2.4.1 跳轉連結**：為鍵盤用戶提供跳轉導航連結
- [ ] **2.4.3 焦點順序**：Tab 順序遵循邏輯且可預測之序列
- [ ] **2.4.7 焦點可見**：鍵盤焦點指示器清晰可見
- [ ] **2.4.11 焦點未被遮蔽**：焦點元素未被黏性標頭/疊層遮擋
- [ ] **2.5.5 目標尺寸**：互動目標至少 24x24px（觸控建議 44x44px）

#### 可理解

- [ ] **3.1.1 頁面語言**：`<html>` 設置 `lang` 屬性
- [ ] **3.2.1 聚焦時**：聚焦不觸發非預期變化
- [ ] **3.2.2 輸入時**：輸入不觸發非預期變化而無警示
- [ ] **3.3.1 錯誤識別**：錯誤以文字清晰描述
- [ ] **3.3.2 標籤或指示**：表單輸入有可見標籤
- [ ] **3.3.3 錯誤建議**：錯誤訊息建議如何修復問題

#### 健壯

- [ ] **4.1.1 解析**：HTML 有效（無重複 ID、嵌套正確）
- [ ] **4.1.2 名稱、角色、值**：自定元件有 ARIA 角色與屬性
- [ ] **4.1.3 狀態訊息**：動態內容變化已告知屏幕閱讀器

**預期：** WCAG 2.1 AA 標準經系統化檢查，逐項通過/失敗。
**失敗時：** 用自動化工具（axe-core、Lighthouse）作初步掃描，再對需人類判斷之標準作手動測試。

### 步驟三：鍵盤與屏幕閱讀器審計

#### 鍵盤導航測試

僅用 Tab、Shift+Tab、Enter、Space、方向鍵與 Escape：

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

#### 屏幕閱讀器測試

以 NVDA（Windows）、VoiceOver（macOS/iOS）或 TalkBack（Android）測試：

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

**預期：** 完整任務流程皆以僅鍵盤與屏幕閱讀器測試。
**失敗時：** 若無屏幕閱讀器可用，檢視 ARIA 屬性與語義化 HTML 作代理。

### 步驟四：分析用戶流程

繪製並評估關鍵用戶流程：

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

**預期：** 關鍵用戶流程已繪製，摩擦點已識別並評級。
**失敗時：** 若無用戶分析數據，依任務複雜度與步驟數評估流程。

### 步驟五：評估認知負荷

- [ ] **資訊密度**：每屏資訊量是否適當？
- [ ] **漸進披露**：複雜資訊是否逐步揭示？
- [ ] **分塊**：相關項目是否視覺分組（格式塔原則）？
- [ ] **識別重於回憶**：用戶能否看見選項而非記住？
- [ ] **一致模式**：相似任務是否使用相似互動模式？
- [ ] **決策疲勞**：是否一次呈現過多選擇？（Hick 律）
- [ ] **工作記憶**：用戶是否需跨步驟記住資訊？

**預期：** 認知負荷已評估，並識別具體之過載或不足區域。
**失敗時：** 若認知負荷難以客觀評估，採「瞇眼測試」——瞇眼觀屏，看結構與層級是否仍清晰。

### 步驟六：審查表單可用性

對應用中各表單：

- [ ] **標籤**：每輸入皆有可見、關聯之標籤
- [ ] **佔位文字**：僅作示例，非作標籤
- [ ] **輸入類型**：用正確之 HTML 輸入類型（email、tel、number、date）以配合行動鍵盤
- [ ] **驗證時機**：錯誤於失焦或提交時顯示（非每次按鍵）
- [ ] **錯誤訊息**：具體（「Email 須含 @」）而非泛泛（「無效輸入」）
- [ ] **必填欄位**：清楚標示（若多數為必填則標示選填欄位）
- [ ] **欄位分組**：相關欄位視覺分組（姓名、地址、付款區塊）
- [ ] **自動完成**：標準欄位設置 `autocomplete` 屬性（name、email、address、cc-number）
- [ ] **Tab 順序**：邏輯流程符合視覺佈局
- [ ] **多步表單**：進度指示器顯示當前步驟與總步驟
- [ ] **持久性**：用戶離開後返回時表單資料保留

**預期：** 各表單依清單評估，具體問題已記錄。
**失敗時：** 若表單眾多，優先處理流量最高者（註冊、結帳、聯絡）。

### 步驟七：撰寫 UX/UI 審查

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

**預期：** 審查提供按優先級排序、可執行之建議，並附嚴重度評級。
**失敗時：** 若審查發現問題過多，分類為「必修」（嚴重度 3-4）與「應修」（嚴重度 1-2）。

## 驗證

- [ ] 全部十項 Nielsen 啟發式皆評估並附嚴重度評級
- [ ] WCAG 2.1 標準已檢查（最低限度：1.1.1、1.4.3、2.1.1、2.4.7、3.3.1、4.1.2）
- [ ] 關鍵用戶流程之鍵盤導航已測試
- [ ] 屏幕閱讀器已測試（或檢視 ARIA/語義化 HTML 作代理）
- [ ] 至少一個關鍵用戶流程已分析摩擦
- [ ] 認知負荷已評估
- [ ] 表單可用性已評估
- [ ] 發現按嚴重度排序並附可執行建議

## 常見陷阱

- **混淆 UX 與視覺設計**：UX 關乎運作方式；視覺設計關乎外觀。美麗介面可有可怕之 UX。兩者皆評估但須區分。
- **僅測試正常路徑**：錯誤狀態、空狀態、載入狀態與邊緣案例皆是 UX 問題隱藏之處。
- **忽視真實設備**：瀏覽器開發工具響應模式僅為代理。真實設備測試方能捕捉觸控、效能與視窗問題。
- **可及性事後處理**：可及性問題後期發現代價高昂。應早期持續評估。
- **以個人偏好作 UX 反饋**：「我偏好……」非 UX 反饋。應引用啟發式、研究或既有模式。

## 相關技能

- `review-web-design` — 視覺設計審查（佈局、字體、顏色——與 UX 互補）
- `scaffold-nextjs-app` — Next.js 應用腳手架
- `setup-tailwind-typescript` — Tailwind CSS 用於設計系統實作
