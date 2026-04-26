---
name: manage-token-budget
locale: wenyan-ultra
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

# 理 token 預

控代理系之費與脈絡跡：每周追用、審何占脈絡、執預限、限近時剪低值、入元前繞註經。要旨：脈絡之諸 token 必有其位。助決者留；占位無影者剪。

證：37 時自運費 $13.74，緣半時心跳+繁系令+脈絡無檢之積。修：心跳改 4 時，僅通知，去訂閱瀏覽。此技載防範之模。

## 用

- 長活代理環（心跳、輪詢、自運），費隨時積
- 周間脈絡無常增
- API 費超基線→驗事
- 設新代理流欲先植費欄
- 費事後審何誤防再
- 系令、記檔、工具註已大占脈絡

## 入

- **必**：欲限之代理系或流（行或謀）
- **必**：預上限（期內金額或周內 token 限）
- **可**：今費數（API 記、賬板導）
- **可**：模脈絡窗大（默：察文）
- **可**：許劣化策（限觸時何可棄）

## 行

### 一：立每周費追

於代理環各執界，記 token 用。

各周（心跳、輪、任務行）獲：

1. **入 token**：系令+記+工具註+對話史+新輸入
2. **出 token**：模回含工具呼
3. **總費**：入×入價+出×出價
4. **周時戳**：何時行
5. **周觸**：何啟之（時、事、用）

存於結構化記（JSON 行、CSV、庫）——非脈絡內：

```
{"cycle": 47, "ts": "2026-03-12T14:30:00Z", "trigger": "heartbeat",
 "input_tokens": 18420, "output_tokens": 2105, "cost_usd": 0.0891,
 "cumulative_cost_usd": 3.42}
```

無器→由 API 賬估：

- 總費 / 周數 = 均周費
- 對基線（模價×期脈絡量）

得：每周 token 與費記，足細以辨何周貴何故。記居脈絡外。

敗：精數無（某 API 不返用元）→用賬板取均。粗追（日費/日周）亦顯勢。全無追→赴二，由脈絡審估費。

### 二：審脈絡窗

量脈絡之占用，按大排各占。

分脈絡為部，各量：

1. **系令**：基令、CLAUDE.md 鏈、性令
2. **記**：MEMORY.md、自載主題檔
3. **工具註**：MCP 服工具定、函呼註
4. **技程**：活技之全 SKILL.md
5. **對話史**：本會先輪
6. **動容**：本周之工具出、檔容、搜結

成脈絡預表：

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

標決值不稱之大者。4000-token 記檔本任不引者乃純荷。

得：排序表顯各占、其大、其窗百。至少一部宜減——常為對話史或繁工具出。

敗：精數難得→以字符數/4 估英文。結構數據（JSON、YAML）用/3。意在相對排序，非精測。

### 三：設預上限與執策

定硬軟限，明各觸時何為。

1. **軟限**（警閾）：常硬限六七五成。觸：
   - 警含今用與餘預
   - 始低值剪（步四）
   - 減周頻（如心跳 30 分→2 時）
   - 降脈絡續行

2. **硬限**（停閾）：絕極費或脈絡。觸：
   - 即停自運
   - 報人（通、郵、記）
   - 存態摘以續
   - 待人審授前不啟下周

3. **每周限**：單周最多。防一周失控耗全預：
   - 將逾→截工具出或略次行
   - 記截以後審

於流配記限：

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

得：三層限（軟、硬、每周）皆記含執行。策答「觸限則何」於觸前。

敗：精金限早（新流費未明）→先用百分限（軟 70%、硬 90%），24-48 時追費後加金限。校期間諮模可。

### 四：施急剪

近限時系剪低值容於預內。

剪先（最低先棄）：

1. **舊工具出**：先周之繁搜、檔、API 答，所決已成。決留；證可去。
2. **冗對話輪**：前輪已被後修取代。輪 3 求 X、輪 7 改為 Y→輪 3 冗。
3. **繁式**：表、ASCII 畫、飾首於工具出。一句述其容。
4. **完子任脈絡**：多步任之子任已全成且出存於摘或檔者。
5. **歇技程**：先步用而今不從之技，全文可棄。
6. **無關記節**：自載與本任無關之記。

各剪存一行碑：

```
[PRUNED: 2,400 tokens of npm audit output from cycle 12 — 3 vulnerabilities found, all patched]
```

碑費約 20 token 而存決相關之結。

得：剪後脈絡用降至軟限下。各剪有碑存其結。決關信息不失——僅去已成決之證。

敗：剪至四級仍超軟限→流本就周頻過重。報人：「剪後脈絡 N%。選：(a) 增周距、(b) 減每周範、(c) 拆子流、(d) 受高費」。

### 五：技載入合漸顯

入元前繞註——費於繞而非讀。

模：

1. **先繞**：任需技→讀技註（id、述、域、難、標）於 `_registry.yml`——約 3-5 行 50 token
2. **驗合**：註述合今需乎？否→察次候。一誤約 50 token 而非 500-2000 token 載誤 SKILL.md
3. **合則載**：唯註驗合，方載全 SKILL.md
4. **用畢卸**：技程畢→全文可剪（步四級五）——只留所為之摘

同模施於他大脈絡載：

- **記檔**：先讀 MEMORY.md 索引；題合方載主題檔
- **工具文**：用工具名與一句述繞；唯被呼工具方載全註
- **檔容**：先讀檔列與函簽；唯改之函方載全文

```
Without progressive disclosure:
  Load 5 candidate skills → 5 × 1,500 tokens = 7,500 tokens → use 1 skill

With progressive disclosure:
  Route through 5 registry entries → 5 × 50 tokens = 250 tokens
  Load 1 matched skill → 1 × 1,500 tokens = 1,500 tokens
  Total: 1,750 tokens (77% reduction)
```

得：技載循二段：輕經元繞、驗合方全載。同模施於記、工具註、檔容。

敗：註元繞不足（述泛、標缺）→改註而非棄漸顯。修為更善之元，非更多脈絡載。

### 六：費覺周距

依費數設執距，非任意排。

1. 算今周距之時費：
   - `cost_per_hour = avg_cost_per_cycle × cycles_per_hour`
   - 例：$0.09/周於 2 周/時 = $0.18/時 = $4.32/日

2. 對預：
   - `hours_until_hard_limit = (hard_limit - cumulative_cost) / cost_per_hour`
   - 若小於欲行時→延周距

3. 定最小有效距：
   - 監系最快變率？源每 4 時更而每 30 分輪→八周浪費七
   - 周距宜匹數源更率，非緣懼漏事
   - 事驅系→以 webhook 或推通代輪詢

4. 施距：

```
Before: 30-minute heartbeat, verbose processing
  → 48 cycles/day × $0.09/cycle = $4.32/day

After: 4-hour heartbeat, notification-only
  → 6 cycles/day × $0.04/cycle = $0.24/day
  → 94% cost reduction
```

得：周距由費數證，匹監系更率。距費衡權記，後調有基。

敗：系需低延不容長距→改減每周費（系令小、工具註少、史摘）。預等有二桿：頻與每周費。

### 七：驗預控

確諸控行且系於預內運。

1. **追驗**：行 3-5 周→驗每周記書且 token 數正
2. **軟限試**：暫降軟限→驗警鳴、剪始
3. **硬限試**：暫降硬限→驗系停且報
4. **每周限試**：注大工具出→驗截而非破限
5. **漸顯試**：跡技載序→確繞註而後全載
6. **費投**：由驗數投：
   - 今設之日費
   - 今燒率距硬限之日
   - 期月費

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

得：五控（追、軟、硬、每周、漸顯）皆驗行。費投於預內。

敗：控不鳴→察執機已連入實環，非僅記。配無執乃謀，非控。費投超預→返步六調周距或每周費。

## 驗

- [ ] 每周費追記入出 token、費、時戳
- [ ] 脈絡窗審識諸占含估數與百
- [ ] 預限定於三層：軟、硬、每周
- [ ] 各限有明執（警、剪、停、報）
- [ ] 急剪循先序且存碑
- [ ] 漸顯先繞元而後載全
- [ ] 周距由費數證且匹監系更率
- [ ] 驗試確諸控正鳴
- [ ] 費投於預內
- [ ] 事後：根因識且具體防措已立

## 忌

- **追於脈絡**：每周記存於對話史中→脹欲控之物。記於外（檔、庫、API），脈絡僅留今摘
- **軟限無執**：無人見之警非控。軟限必觸顯動——剪、延距、報。可默超則必超
- **剪決於數前**：決前棄工具出失信。剪證於所助之決後。碑存結而棄證
- **周距匹懼非更率**：源每 4 時更而每 30 分輪→八七五成周浪。先測源實更率
- **載全技以繞**：讀 400 行 SKILL.md 以決「合此乎」費十至二十倍於讀 3 行註。先繞元，唯合方載
- **忽系令**：系令、CLAUDE.md 鏈、自載記為隱費——每周必付。5000-token 系令於 48 周/日環費 240k 入 token/日唯為令。先審減此
- **預限無人擴**：自運觸限默劣化（不報人）→積害。硬限必含通人之道

## 參

- `assess-context`
- `metal`
- `chrysopoeia`
- `manage-memory`
