---
name: manage-token-budget
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Monitor, cap, and recover from context accumulation in agentic systems.
  Covers per-cycle cost tracking, context window auditing, budget caps with
  enforcement policies, emergency pruning when approaching limits, and
  progressive disclosure integration to minimize token spend on routing.
  Use when running long-lived agent loops (heartbeats, polling, autonomous
  workflows), when context windows are growing unpredictably between cycles,
  when API costs spike beyond expected baselines, when designing new agentic
  workflows that need cost guardrails from the start, or when post-mortem
  analysis reveals a cost incident caused by context accumulation.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: token-management, cost-optimization, context-window, budget, progressive-disclosure
---

# 管理 Token 預算

控制代理系統之成本與上下文佔用：逐周期追蹤 token 用量，稽核何物耗上下文空間，執行預算上限，於壓力下修剪低值上下文，並於載入完整程序前先經元資料路由。核心原則：上下文窗口中每個 token 皆當有其位。能影響決策之 token 留之；佔位而不影響輸出之 token 修剪之。

社群實證：一段三十七小時之自主會話因三十分心跳間隔配以冗長系統指令與不受控之上下文累積，耗去十三點七四美元。修法乃將心跳改為四小時間隔、改為僅通知模式、自迴圈中除去訊息流瀏覽。本技能將防此等事故之模式編成法則。

## 適用時機

- 運行長存代理迴圈（心跳、輪詢、自主工作流）成本隨時積累
- 上下文窗口於執行週期間無預測地增長
- API 成本激增超預期基線而需事後檢討
- 設計新代理工作流，欲自始即內建成本護欄
- 成本事故後稽核出錯與防再發
- 系統提示、記憶檔或工具結構增至主導上下文窗口

## 輸入

- **必要**：欲設預算之代理系統或工作流（運行中或計畫中）
- **必要**：預算上限（按期之金額或每周期之 token 上限）
- **選擇性**：當前成本資料（API 日誌、計費儀表板匯出）
- **選擇性**：目標模型之上下文窗口大小（預設：查模型文件）
- **選擇性**：可接受之降級策略（達上限時何物可棄）

## 步驟

### 步驟一：建立逐周期成本追蹤

於代理迴圈中布建儀器，於每個執行邊界記錄 token 用量。

每週期（心跳、輪詢、任務執行）擷取：

1. **輸入 tokens**：系統提示 + 記憶 + 工具結構 + 對話歷史 + 新使用者或系統內容
2. **輸出 tokens**：模型回應含工具呼叫
3. **總成本**：輸入 tokens × 輸入單價 + 輸出 tokens × 輸出單價
4. **週期時戳**：週期執行之時
5. **週期觸發**：何物啟動之（計時器、事件、用戶動作）

存於結構化日誌（JSON lines、CSV 或資料庫）——勿置於上下文窗口本身：

```
{"cycle": 47, "ts": "2026-03-12T14:30:00Z", "trigger": "heartbeat",
 "input_tokens": 18420, "output_tokens": 2105, "cost_usd": 0.0891,
 "cumulative_cost_usd": 3.42}
```

若系統無儀器，自 API 計費估之：

- 總成本 / 週期數 = 每週期平均成本
- 對照預期基線（模型定價 × 預期上下文大小）

**預期：** 顯示每週期 token 數與成本之日誌，粒度足以辨何週期昂貴及其因。日誌本身存於上下文窗口之外。

**失敗時：** 若精確 token 計數不可得（某些 API 不返回用量元資料），用計費儀表板推導平均值。即使粗略追蹤（每日成本 / 每日週期數）亦可顯趨勢。若全無追蹤可行，進入步驟二自上下文稽核入手——可由上下文大小估成本。

### 步驟二：稽核上下文窗口

度量何物佔上下文窗口，依大小排消耗者。

將上下文分解為其組件並逐一度量：

1. **系統提示**：基礎指令、CLAUDE.md 內容、人格指令
2. **記憶**：MEMORY.md，經自動記憶載入之主題檔
3. **工具結構**：MCP 伺服器工具定義、函數呼叫結構
4. **技能程序**：為活躍技能載入之完整 SKILL.md 內容
5. **對話歷史**：當前會話之先前回合
6. **動態內容**：本週期之工具輸出、檔案內容、搜尋結果

產生上下文預算表：

```
Context Budget Audit:
+------------------------+--------+------+-----------------------------------+
| Component              | Tokens | %    | Notes                             |
+------------------------+--------+------+-----------------------------------+
| System prompt          | 4,200  | 21%  | Includes CLAUDE.md chain          |
| Memory (auto-loaded)   | 3,800  | 19%  | MEMORY.md + 4 topic files         |
| Tool schemas           | 2,600  | 13%  | 3 MCP servers, 47 tools           |
| Active skill procedure | 1,900  |  9%  | Full SKILL.md loaded              |
| Conversation history   | 5,100  | 25%  | 12 prior turns                    |
| Current cycle content  | 2,400  | 12%  | Tool outputs from this cycle      |
+------------------------+--------+------+-----------------------------------+
| TOTAL                  | 20,000 | 100% | Model limit: 200,000             |
| Remaining headroom     |180,000 |      |                                   |
+------------------------+--------+------+-----------------------------------+
```

標出相對其決策價值不成比例之大組件。當前任務從不引用之四千 token 記憶檔純為負擔。

**預期：** 排序表顯示各上下文消耗者、其大小及佔窗口之百分比。至少一組件將顯為削減候選——最常見者乃對話歷史或冗長之工具輸出。

**失敗時：** 若難得各組件之精確 token 計數，英文文本以字元數除以四為粗略近似。結構化資料（JSON、YAML）以字元數除以三。目標為相對排序，非精確度量。

### 步驟三：設預算上限與執行政策

定軟硬上限，明示達各上限時所為何事。

1. **軟上限**（警告閾值）：通常為硬上限之百分之六十至七十五。達時：
   - 記下警告連同當前用量與剩餘預算
   - 於最低值上下文上始自願修剪（步驟四）
   - 適用時降低週期頻率（如心跳間隔自三十分變為兩小時）
   - 以降級之上下文續行

2. **硬上限**（停止閾值）：絕對最大花費或上下文大小。達時：
   - 立即停止自主運行
   - 通知人類操作員（通知、電郵、日誌）
   - 保存當前狀態之摘要以供恢復
   - 待人類審查並授權前不啟下一週期

3. **每週期上限**：任一週期之最大 token 或成本。防單一失控週期耗盡整體預算：
   - 若週期將超此上限，截斷工具輸出或略過低優先動作
   - 記錄截斷以供事後分析

於工作流配置中載明上限：

```yaml
token_budget:
  soft_limit_usd: 5.00        # warn and begin pruning
  hard_limit_usd: 10.00       # halt and alert
  per_cycle_cap_usd: 0.50     # max per individual cycle
  soft_limit_pct: 70           # % of context window triggering pruning
  hard_limit_pct: 90           # % of context window triggering halt
  enforcement: strict          # strict = halt on hard limit; advisory = log only
  alert_channel: notification  # how to notify the operator
```

**預期：** 記錄三層級之預算上限（軟、硬、每週期），各有明確之執行動作。政策在達上限前即答「達上限時將如何」。

**失敗時：** 若設精確美元上限尚早（成本概況未知之新工作流），先僅以上下文百分比上限始（軟七成、硬九成），俟二十四至四十八小時成本追蹤資料後再加美元上限。校準期間建議模式（記日誌但不停）可接受。

### 步驟四：行緊急修剪

接近上限時，系統化棄低值上下文以守預算。

修剪優先序（先棄最低值）：

1. **舊工具輸出**：先前週期之冗長搜尋結果、檔案內容或 API 回應，已促成決策者。決策留下；證據可棄。
2. **冗餘對話回合**：已被後續修正取代之早期回合。若回合三求 X 而回合七修為 Y，則回合三冗餘。
3. **冗長格式**：表格、ASCII 藝術、工具輸出之裝飾標題。以一行描述其內容摘之。
4. **完成子任務之上下文**：多步任務中，已全完且輸出已記於摘要或檔之子任務上下文。
5. **未啟用之技能程序**：若技能為前一步而載但已不再依循，其完整程序文本可棄。
6. **與當前任務無關之記憶段**：自動載入之關於不相關專案或過往會話之記憶。

對每修剪項，留一行墓誌：

```
[PRUNED: 2,400 tokens of npm audit output from cycle 12 — 3 vulnerabilities found, all patched]
```

墓誌耗約二十 token 而保決策相關之結論。

**預期：** 修剪後上下文用量降至軟上限以下。各修剪項皆有保結論之墓誌。無決策關鍵資訊遺失——僅棄已成決策之背後證據。

**失敗時：** 若修剪至優先級四仍留用量於軟上限之上，則此工作流根本上對當前週期頻率而言過於上下文沉重。上呈人類操作員：「修剪後上下文用量為百分之 N。選項：（甲）增大週期間隔；（乙）縮減每週期範圍；（丙）拆為子工作流；（丁）接受更高成本。」

### 步驟五：將漸進揭露融入技能載入

於載入完整技能程序前先經登記元資料路由——將 token 花於路由，非花於閱讀。

模式：

1. **先路由**：當任務需技能，自 `_registry.yml` 讀技能之登記項（id、description、domain、complexity、tags）——約三至五行，五十 token
2. **確認相關**：登記描述與當前所需相符乎？若否，查下個候選。每誤命約耗五十 token，遠勝載錯 SKILL.md 之五百至兩千 token
3. **匹配時載入**：唯當登記項確認相關，方載入完整 SKILL.md 程序
4. **用畢卸載**：技能程序一完，完整文本可修剪（步驟四，優先級五）——僅留所為之摘要

於其他大型上下文負載亦行此模式：

- **記憶檔**：先讀 MEMORY.md 索引行；唯主題相關時方載入主題檔
- **工具文件**：以工具名與一行描述為路由；唯欲呼叫之工具方載入完整結構
- **檔案內容**：先讀檔案清單與函數簽名；唯欲修改之函數方載入完整檔內容

```
Without progressive disclosure:
  Load 5 candidate skills → 5 × 1,500 tokens = 7,500 tokens → use 1 skill

With progressive disclosure:
  Route through 5 registry entries → 5 × 50 tokens = 250 tokens
  Load 1 matched skill → 1 × 1,500 tokens = 1,500 tokens
  Total: 1,750 tokens (77% reduction)
```

**預期：** 技能載入循兩階段模式：經元資料輕量路由，再僅於確認匹配時完整載入。同一模式適用於記憶、工具結構與檔內容。

**失敗時：** 若登記元資料不足以路由（描述過於模糊、標籤缺失），改善登記項，勿棄漸進揭露。修法在更佳之元資料，非更多之上下文載入。

### 步驟六：設成本感知之週期間隔

依成本資料而非任意排程設執行間隔。

1. 計算當前週期間隔之每小時成本：
   - `cost_per_hour = avg_cost_per_cycle × cycles_per_hour`
   - 例：每週期 $0.09 × 每小時兩週期 = 每小時 $0.18 = 每日 $4.32

2. 對照預算：
   - `hours_until_hard_limit = (hard_limit - cumulative_cost) / cost_per_hour`
   - 若 hours_until_hard_limit < 預定運行時長，則延長週期間隔

3. 定最低有效間隔：
   - 監測系統之最快變化率為何？若資料源每四小時更新，則每三十分輪詢將浪費八週期之七
   - 將週期間隔配資料更新率，勿配對錯失事件之焦慮
   - 對事件驅動系統，可改輪詢為 webhook 或推播通知

4. 行此間隔：

```
Before: 30-minute heartbeat, verbose processing
  → 48 cycles/day × $0.09/cycle = $4.32/day

After: 4-hour heartbeat, notification-only
  → 6 cycles/day × $0.04/cycle = $0.24/day
  → 94% cost reduction
```

**預期：** 週期間隔由成本資料證成，並合監測系統之更新率。間隔成本之取捨已記錄，使未來調整有基準。

**失敗時：** 若系統需低延遲回應而不能容更長間隔，改減每週期成本（更小之系統提示、少載工具結構、摘要歷史）。預算方程有兩個槓桿：頻率與每週期成本。

### 步驟七：驗證預算控制

確認所有控制皆運作，系統於預算內運行。

1. **追蹤驗證**：執行三至五週期，驗每週期日誌已寫入並含準確 token 計數
2. **軟上限測試**：暫降軟上限，驗警告觸發且修剪始
3. **硬上限測試**：暫降硬上限，驗系統停止並通知
4. **每週期上限測試**：注入大型工具輸出，驗其被截斷而非衝破上限
5. **漸進揭露測試**：追蹤一技能載入序列，確認其在載入完整 SKILL.md 前先經登記
6. **成本投影**：自驗證資料投影：
   - 當前設定下之每日成本
   - 當前消耗率下達硬上限之天數
   - 預期月成本

```
Budget Validation Report:
+-----------------------+----------+--------+
| Check                 | Expected | Actual |
+-----------------------+----------+--------+
| Per-cycle logging     | Present  |        |
| Soft limit warning    | Fires    |        |
| Hard limit halt       | Halts    |        |
| Per-cycle cap         | Truncates|        |
| Progressive disclosure| Routes   |        |
| Daily cost projection | < $X.XX  |        |
+-----------------------+----------+--------+
```

**預期：** 五項控制（追蹤、軟上限、硬上限、每週期上限、漸進揭露）皆已驗運作。成本投影於預定預算內。

**失敗時：** 若控制不觸發，查執行機制是否實接於執行迴圈中，非僅文件記載。無執行之配置乃計畫，非控制。若成本投影超預算，回步驟六調整週期間隔或每週期成本。

## 驗證

- [ ] 逐週期成本追蹤每週期皆記輸入 token、輸出 token、成本與時戳
- [ ] 上下文窗口稽核辨識所有消耗者連同近似 token 計數與百分比
- [ ] 預算上限定於三層級：軟上限、硬上限、每週期上限
- [ ] 各上限有明確之執行動作（警告、修剪、停止、通知）
- [ ] 緊急修剪循優先序並保留墓誌
- [ ] 漸進揭露於載入完整內容前先經元資料路由
- [ ] 週期間隔由成本資料證成並合監測系統之更新率
- [ ] 驗證測試確認所有控制正確觸發
- [ ] 成本投影於既定預算內
- [ ] 事故後：根因已辨並有具體之防範措施

## 常見陷阱

- **於上下文窗口內追蹤**：將每週期日誌存於對話歷史中將膨脹欲控之物。應於外部記錄（檔、資料庫、API），上下文中僅留當前摘要。
- **無執行之軟上限**：無人見之警告非控制。軟上限須觸發可見之動作——修剪、間隔延長或通知操作員。若系統可悄悄超軟上限，必將如此。
- **棄資料於決策前**：在決策成立前棄工具輸出將失資訊。應於其所成決策之後修剪證據，非之前。墓誌模式保結論而棄證據。
- **配週期間隔於焦慮而非資料更新率**：每三十分輪詢每四小時更新之源浪費百分之八十七點五之週期。設間隔前先測資料源之實際更新率。
- **為路由而載完整技能**：讀四百行 SKILL.md 以決「此為對技能乎？」較讀三行登記項貴十至二十倍。先經元資料路由；唯確認匹配方載程序。
- **忽視系統提示**：系統提示、CLAUDE.md 鏈與自動載入記憶為隱形成本——每週期皆付。每日四十八週期之迴圈中五千 token 之系統提示僅指令日耗二十四萬輸入 token。先稽核並修剪此等。
- **無人類升級之預算上限**：達預算上限而悄悄降級（不通知人類）之自主系統可能積害。硬上限須含人類通知通道。

## 相關技能

- `assess-context` — 評估推理上下文之結構健康；補步驟二之上下文窗口稽核
- `metal` — 自代碼庫提取概念精髓；漸進揭露模式適用於 metal 之勘探階段
- `chrysopoeia` — 價值提取與棄重；於代碼層級行同樣之每 token 價值思維
- `manage-memory` — 組織並修剪持久記憶檔；直接縮減上下文預算之記憶組件
