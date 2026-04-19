---
name: chrysopoeia
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Extract maximum value from existing code — performance optimization, API
  surface refinement, and dead weight elimination. The art of turning base code
  into gold through systematic identification and amplification of value-bearing
  patterns. Use when optimizing a working but sluggish codebase, refining an
  API surface that has accumulated cruft, reducing bundle size or memory
  footprint, or preparing code for open-source release — when code works
  correctly but doesn't shine and needs polish rather than a full rewrite.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, optimization, value-extraction, performance, refinement, gold
---

# 點金術

系統性抽取既有代碼之極價——辨何者為金（高價、良設計）、何者為鉛（耗重、失最適）、何者為渣（死重）。後揚其金、化其鉛、除其渣。

## 適用時機

- 優化可行而遲緩之代碼庫，求性能
- 整頓迭代積穢之 API 介面
- 減小打包體積、記憶體足跡、啟動時間
- 備代碼以開源發布（抽其有價之核）
- 代碼行而不耀——須磨非重寫

## 輸入

- **必要**：欲優化之代碼庫或模組（檔案路徑）
- **必要**：價之度量（性能、API 清晰、打包大小、可讀性）
- **選擇性**：性能剖析數據或基準
- **選擇性**：預算或目標（如「打包減四成」、「回應少於 100 ms」）
- **選擇性**：約束（不可改公開 API、須保向後相容）

## 步驟

### 步驟一：驗——分其材

系統性依價之貢獻分每一元素。

1. 由輸入定價之度量（性能、清晰、大小等）
2. 盤點代碼庫之元素（函數、模組、匯出、依賴）
3. 分類每一元素：

```
Value Classification:
+--------+---------------------------------------------------------+
| Gold   | High value, well-designed. Amplify and protect.         |
| Silver | Good value, minor imperfections. Polish.                |
| Lead   | Functional but heavy — poor performance, complex API.   |
|        | Transmute into something lighter.                       |
| Dross  | Dead code, unused exports, vestigial features.          |
|        | Remove entirely.                                        |
+--------+---------------------------------------------------------+
```

4. 性能優化先剖析：
   - 辨熱徑（時之所耗）
   - 辨冷徑（罕行或為渣）
   - 度記憶體配置之模式
5. 出**驗之報告**：元素逐一分類並附證

**預期：** 每一要元已分類並附證。金元已辨以備優化時護之。鉛元以影響排序。

**失敗時：** 若剖析工具不可用，以靜態分析代：函數複雜度（循環）、依賴數、代碼大小為代理。若代碼庫過大，先專於關鍵徑。

### 步驟二：精——揚其金

護且強化最高價之元素。

1. 每一金元：
   - 確有完備測試（此乃最有價之資產）
   - 若未有，明文其介面
   - 慮其可否抽為可復用之模組
2. 每一銀元：
   - 行有的之改進（佳命名、清類型、小優化）
   - 令測試覆蓋升至金級
   - 解小異味而不重構
3. 勿改金銀之行為——僅進其磨與護

**預期：** 金銀元得更佳測試、文件與護。無行為之改，僅質之進。

**失敗時：** 若「金」元近察顯隱患，重新分類。誠於價勝於護瑕疵之代碼。

### 步驟三：化——鉛成金

化重而拙之元為優化之等效。

1. 鉛元依影響排序（耗資最重者先）
2. 每一鉛元擇化之策：
   - **算法優化**：以 O(n log n) 代 O(n^2)，除冗算
   - **快取/記憶化**：存屢求之昂貴結果
   - **惰性求值**：推遲至結果確需時
   - **批次處理**：合多小為少大
   - **結構簡化**：減循環複雜度、平深嵌套
3. 行策並度其進：
   - 性能改之前後基準
   - 複雜度改之前後行數
   - 耦合改之前後依賴數
4. 每次化後驗行為等效

**預期：** 目標度量可測之進。每一化後之元勝其鉛前身，而行為不變。

**失敗時：** 若鉛元於當前介面內拒絕優化，慮介面本身是否即問題。有時化需改其被呼之方，非僅其實現。

### 步驟四：清——除其渣

系統性除死重。

1. 每一渣元，驗確無用：
   - 搜所有引用（grep、IDE 尋用處）
   - 查動態引用（以字串之派發、反射）
   - 查外部使用者（若代碼為庫）
2. 除已證之渣：
   - 刪死代碼、未用匯出、痕跡功能
   - 除包管中未用之依賴
   - 清已除功能之配置
3. 每次除後驗無損（行測試）
4. 記所除及其因（於提交訊息，非代碼內）

**預期：** 代碼庫變輕。打包、依賴數、代碼量可測之減。所有測試通過。

**失敗時：** 若除一元破某事，其非渣——重新分類。若動態引用令驗用處難，除前暫增記錄以確無運行時訪問。

### 步驟五：驗——秤其金

度總體之進。

1. 行步驟一所用之同基準／度量
2. 比前後於目標價之度量
3. 記點金術之果：
   - 已精元（金銀之進）
   - 已化元（鉛→金並附度量）
   - 已清元（渣除並附大小/數量之影響）
   - 總度量之進（如「快 47%」、「打包小 32%」）

**預期：** 目標度量可測且已記之進。代碼庫較前明顯更值。

**失敗時：** 若總進微，原代碼或較所設更佳。記所學——知代碼已近最適本身即有價。

## 驗證

- [ ] 驗之報告以證分所有要元
- [ ] 金元有完備測試與文件
- [ ] 鉛之化有可測前後之進
- [ ] 渣之除於刪前已以引用檢查證
- [ ] 各階段後所有測試通過
- [ ] 總進已度且記
- [ ] 無行為回歸
- [ ] 輸入之約束已滿

## 常見陷阱

- **過早優化**：未剖析而優化。先度，後優其熱徑
- **磨渣**：費力改本該刪之代碼。先分類後精化
- **破金**：優化令最佳之代碼退步。金元只宜更佳，不宜更劣
- **未度之論**：「感覺更快」非點金術。每進須量化
- **優化冷徑**：於啟動時僅行一次之代碼費力，而瓶頸在請求迴圈

## 相關技能

- `athanor` — 點金術示需重構非僅優化時之完整四階段轉化
- `transmute` — 鉛元需範式轉換時之有的之化
- `review-software-architecture` — 與代碼級點金術互補之架構級評估
- `review-data-analysis` — 數據管線優化與代碼優化並行
