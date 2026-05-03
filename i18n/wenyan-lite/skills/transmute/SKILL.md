---
name: transmute
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Transform a single function, module, or data structure from one form to
  another while preserving its essential behavior. Lighter-weight than the full
  athanor cycle, suitable for targeted conversions where the input and output
  forms are well-understood. Use when converting a function between languages,
  shifting a module between paradigms, migrating an API consumer to a new
  version, converting data formats, or replacing a dependency — when the
  transformation scope is a single function, class, or module rather than a
  full system.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, transmutation, conversion, refactoring, transformation, targeted
---

# 嬗變

將特定一段代碼或資料自一形變為另一——語言譯、範式遷、格式轉或 API 遷——同時保留本質行為與語義。

## 適用時機

- 將函式自一語言轉至另一（Python 至 R、JavaScript 至 TypeScript）
- 將模組自一範式遷（類別制至函式式、回呼至 async/await）
- 將 API 消費者自外部服務之 v1 遷至 v2
- 於格式間轉資料（CSV 至 Parquet、REST 至 GraphQL 綱要）
- 將依賴替為等價物（moment.js 至 date-fns、jQuery 至原生 JS）
- 變換範圍為單一函式、類別或模組（非完整系統）時

## 輸入

- **必要**：源材（檔路徑、函式名或資料樣本）
- **必要**：目標形（語言、範式、格式或 API 版本）
- **選擇性**：行為合約（測試、類型簽名或預期 I/O 對）
- **選擇性**：限制（須維後相容、效能預算）

## 步驟

### 步驟一：分析源材

於試嬗變前準確理解源所為。

1. 完整讀源——每分支、邊界與錯誤路徑
2. 識別**行為合約**：
   - 接受何輸入？（類型、範圍、邊界）
   - 產何輸出？（回值、副作用、錯誤訊號）
   - 維何不變？（順序、唯一、引用完整性）
3. 編列依賴：源引入、叫或依何？
4. 若有測試，讀之以理解預期行為
5. 若無測試，於嬗變前寫行為刻畫測試

**預期：** 對源所為之完整理解（非如何為之）。行為合約明確且可測。

**失敗時：** 若源對單一嬗變過複，考慮拆為小塊或上報至完整 `athanor` 程序。若行為含混，求澄而非猜。

### 步驟二：將源映至目標形

設計變換映射。

1. 對源中每元素，識別目標等價：
   - 語言構造：迴圈 → map/filter、類別 → 閉包等
   - API 叫：舊端點 → 新端點、請求／回應形變
   - 資料類型：資料框欄 → 綱要欄位、巢狀 JSON → 平表
2. 識別**無直接等價**之元素：
   - 目標中缺之源特徵（如無模式匹配之語言中之模式匹配）
   - 源中不存之目標慣用（如 R 之向量化 vs. Python 迴圈）
3. 對每差，擇調適策略：
   - 模擬：以目標原生構造重現行為
   - 簡化：若源構造為變通，用目標之原生方案
   - 記錄：若行為略變，明示其差
4. 寫**變換映射**：源元素 → 目標元素，對每片段

**預期：** 完整映射且每源元素皆有目標目的。差已識別且調適策略已擇。

**失敗時：** 若太多元素無直接等價，變換或不適（如將高度物件導向設計嬗變至無類別之語言）。重思目標形或上報 `athanor`。

### 步驟三：執行變換

依映射寫目標形。

1. 建目標檔含適當結構與樣板
2. 依步驟二之映射嬗變每元素：
   - 保留行為合約——同輸入產同輸出
   - 用目標原生慣用而非字面翻譯
   - 維或改錯誤處理
3. 處依賴：
   - 將源依賴替為目標等價
   - 若依賴無等價，實小適配器

4. 僅於變換不顯處加行內註

**預期：** 完整目標實作從變換映射。代碼讀如以目標形原生寫，非機械翻譯。

**失敗時：** 若某具體元素抗變換，將之隔離。先變其餘，再以聚焦注意處理抗者。若實不可嬗變，記其因並提供變通。

### 步驟四：驗行為等價

確嬗變形保留原行為。

1. 對目標實作執行行為合約測試
2. 對每測試案例，驗：
   - 同輸入 → 同輸出（數值轉換之可接受容差內）
   - 同錯誤條件 → 等價錯誤訊號
   - 副作用（如有）已保留或記為已變
3. 明示檢邊界：
   - Null/NA/undefined 處理
   - 空集合
   - 邊界值（最大整數、空字串、零長陣列）
4. 若目標形加能力（如類型安全），亦驗之

**預期：** 所有行為合約測試通過。邊界等價處理。任何行為差已記且為意圖。

**失敗時：** 若測試失敗，將源與目標行為 diff 以尋分歧。修目標以配源合約。若分歧為意圖（如修原中之臭蟲），明示之。

## 驗證清單

- [ ] 源材已完整分析含明示行為合約
- [ ] 變換映射涵蓋每源元素
- [ ] 差已識別且調適策略已記
- [ ] 目標實作用原生慣用（非字面翻譯）
- [ ] 所有行為合約測試對目標通過
- [ ] 邊界已驗（null、空、邊界值）
- [ ] 依賴已以目標等價解決
- [ ] 任何行為差已記且為意圖

## 常見陷阱

- **字面翻譯**：以 R 寫 Python 或以 JavaScript 寫 Java 而非用目標慣用。結果應看似原生
- **跳過行為測試**：無測試之嬗變無法驗等價。先寫刻畫測試
- **忽略邊界**：快樂路徑易嬗變；邊界為臭蟲藏處
- **適配器過度工程**：若依賴需 200 行適配器，嬗變範圍過大
- **逐字嬗變註釋**：註應釋目標代碼，非回響源。重寫之

## 相關技能

- `athanor` — 對單一嬗變過大之系統之完整四階變換
- `chrysopoeia` — 為最大價值萃取優化嬗變後之代碼
- `review-software-architecture` — 較大轉換之嬗變後架構審查
- `serialize-data-formats` — 專門資料格式轉換程序
