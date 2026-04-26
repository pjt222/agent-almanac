---
name: manage-token-budget
locale: wenyan
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

# 治詞元預算

控代理系之費與脈絡跡，每周追詞元用、查何耗脈絡、限預算、迫時刪低值、入錄前用元數而行漸顯。要旨：脈絡中每詞元當應其位。助決者留，佔位無功者去。

群中之證：三十七時自運費 $13.74，由三十分心跳、繁系令、無控脈絡累而生。修法：心跳改四時、用通知模、廢餵流瀏。此技刻防斯類事之模。

## 用時

- 久運代理環（心跳、輪詢、自運），費隨時積
- 運間脈絡視窗異增
- API 費逾預計，宜後察
- 設新代理流，欲始即立費衛
- 費事後審何誤以防再發
- 系令、記檔、工具規長至佔脈絡視窗主位

## 入

- **必**：所欲設預算之代理系或流（運中或謀中）
- **必**：預算頂（每期金額或每周詞元限）
- **可選**：當前費數（API 日誌、賬板出）
- **可選**：目標模之脈絡視窗大（默：察模文檔）
- **可選**：可接降級策（限至何可棄）

## 法

### 第一步：立每周費追

裝代理環，使每運界皆錄詞元用。

每周（心跳、輪、任）捕：

1. **入詞元**：系令 + 記 + 工具規 + 對話史 + 新用者/系內容
2. **出詞元**：模應含工具呼
3. **總費**：入詞元 × 入價 + 出詞元 × 出價
4. **周時戳**：周何時運
5. **周觸**：何啟（時、事、用者動）

存於結構日誌（JSON 行、CSV、庫）——非脈絡視窗中：

```
{"cycle": 47, "ts": "2026-03-12T14:30:00Z", "trigger": "heartbeat",
 "input_tokens": 18420, "output_tokens": 2105, "cost_usd": 0.0891,
 "cumulative_cost_usd": 3.42}
```

若系無裝，自 API 賬估：

- 總費 / 周數 = 每周均費
- 與預基線比（模價 × 預脈絡大）

**得：** 顯每周詞元數與費之日誌，粒度足以識何周貴與其因。日誌身居脈絡外。

**敗則：** 若準詞元數不可得（某 API 不返用元），用賬板導均。粗追（日費 / 日周數）亦顯勢。若全無追，赴第二步從脈絡審入手——可由脈絡大估費。

### 第二步：審脈絡視窗

量何佔脈絡視窗，依大序耗者。

分脈絡為其諸件量之：

1. **系令**：基令、CLAUDE.md、人格令
2. **記**：MEMORY.md、自記載之主檔
3. **工具規**：MCP 服器工具定、函呼規
4. **技法文**：載活技之全 SKILL.md
5. **對話史**：當前會早前輪
6. **動內容**：當周之工具出、檔內容、搜結

生脈絡預算表：

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

旗識比決策值不成比例之件。當前任不引之四千詞元記檔純為冗。

**得：** 序列表顯每脈絡耗者、其大、其視窗百分比。至少一件當顯為削之候——多為對話史或繁工具出。

**敗則：** 若每件準詞元數難得，英文用字數 / 4 估。結構數（JSON、YAML）用字數 / 3。要在相對序，非準量。

### 第三步：設預算限附行策

定硬軟限，明每限觸時為何。

1. **軟限**（警閾）：常為硬限六七至七五成。觸則：
   - 錄警附當前用與餘預算
   - 始志願刪（第四步）最低值脈絡
   - 若可，減周頻（如心跳由 30 分至 2 時）
   - 以降脈絡續運

2. **硬限**（停閾）：最大費或脈絡大。觸則：
   - 即停自運
   - 警人操作者（通知、郵、日誌）
   - 存當態之要以待續
   - 待人審准方再啟周

3. **每周限**：單周最大詞元或費。防一逸周耗整預算：
   - 若周將逾，截工具出或略低先行動
   - 錄截為後察

文檔限於工作流配：

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

**得：** 三層（軟、硬、每周）已文檔之預算限附明確施。策答「至限時為何」於至限前。

**敗則：** 若準金限未成熟（新流未知費形），先用脈絡百分限（軟 70%、硬 90%），追費 24-48 時後加金限。校驗期間勸告模（錄而非停）可。

### 第四步：施急刪

至限時系統棄低值脈絡以居預算內。

刪先序（最低值先去）：

1. **舊工具出**：前周已決後之繁搜結、檔內容、API 應。決留，證可去。
2. **冗對話輪**：早輪已被後修代。若三輪求 X 而七輪改 Y，三輪冗。
3. **繁式**：表、ASCII 畫、工具出之飾頭。以一行述出之內容代之。
4. **完成子任脈絡**：多步任中，已全完之子任脈絡，其出已存於要或檔。
5. **不活技法**：若技為前步載而不再循，其全文可棄。
6. **與當前任無關之記**：自載之關於別項或舊會之記。

每刪存一行墓碑：

```
[PRUNED: 2,400 tokens of npm audit output from cycle 12 — 3 vulnerabilities found, all patched]
```

墓碑費約二十詞元，然存決相關之結。

**得：** 刪後脈絡用降至軟限下。每刪有墓碑存其結。決關信息無失——只去已成決後之證。

**敗則：** 若刪至四級仍逾軟限，流於當前周頻根本太重。升至人操作者：「刪後脈絡用 N%。選：（甲）增周距，（乙）減每周範，（丙）分子流，（丁）受高費」。

### 第五步：載技時融漸顯

載全技法前先過錄元數——費於路非閱。

模：

1. **先路**：任需技時，自 `_registry.yml` 讀技之錄條（id、述、域、難、籤）——約 3-5 行、約 50 詞元
2. **驗合**：錄述合當前所需乎？若否，察次候。每誤費約 50 詞元而非載誤 SKILL.md 之 500-2000 詞元
3. **合則載**：唯錄條驗合方載全 SKILL.md 法
4. **用後卸**：技法既畢，全文可刪（第四步、五級）——只留所行之要

施同模於他大脈絡載：

- **記檔**：先讀 MEMORY.md 索行；唯主合方載主檔
- **工具文**：用工具名與一行述為路；唯所呼工具方載全規
- **檔內容**：先讀檔列與函簽；唯所改函方載全檔內容

```
Without progressive disclosure:
  Load 5 candidate skills → 5 × 1,500 tokens = 7,500 tokens → use 1 skill

With progressive disclosure:
  Route through 5 registry entries → 5 × 50 tokens = 250 tokens
  Load 1 matched skill → 1 × 1,500 tokens = 1,500 tokens
  Total: 1,750 tokens (77% reduction)
```

**得：** 載技循二段模：經元數輕路，唯驗合方全載。同模施於記、工具規、檔內容。

**敗則：** 若錄元數不足以路（述太泛、籤缺），改錄條而非棄漸顯。修在元數佳，非載更多脈絡。

### 第六步：設費覺周距

依費數設運距，非依無據之程。

1. 算當前周距之每時費：
   - `cost_per_hour = avg_cost_per_cycle × cycles_per_hour`
   - 例：$0.09/周 × 2 周/時 = $0.18/時 = $4.32/日

2. 與預算比：
   - `hours_until_hard_limit = (hard_limit - cumulative_cost) / cost_per_hour`
   - 若至硬限之時 < 擬運時，延周距

3. 定最小有效距：
   - 監系最速變率為何？若數源每四時更，每三十分輪費八之七
   - 周距合數之刷新率，非合恐失事
   - 事驅系，可則以鉤或推通知代輪

4. 施距：

```
Before: 30-minute heartbeat, verbose processing
  → 48 cycles/day × $0.09/cycle = $4.32/day

After: 4-hour heartbeat, notification-only
  → 6 cycles/day × $0.04/cycle = $0.24/day
  → 94% cost reduction
```

**得：** 周距由費數證之，合監系刷新率。距-費衡已文檔以為後調基線。

**敗則：** 若系需低延而不容長距，改減每周費（縮系令、減載工具規、縮史）。預算式有二槓：頻與每周費。

### 第七步：驗預算控

確諸控皆作，系居預算內運。

1. **追驗**：運 3-5 周，驗每周日誌得書且詞元數準
2. **軟限試**：暫降軟限，驗警起且刪始
3. **硬限試**：暫降硬限，驗系停且警
4. **每周限試**：注大工具出，驗其被截而非破限
5. **漸顯試**：跡載技序，確其先過錄方載全 SKILL.md
6. **費投**：自驗數投：
   - 當設下日費
   - 當燒率下至硬限餘日
   - 預月費

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

**得：** 五控（追、軟限、硬限、每周限、漸顯）皆驗作。費投居擬預算內。

**敗則：** 若控不起，察施機嵌於實運環，非僅文檔。配無施為謀非控。若費投逾預算，回第六步調周距或每周費。

## 驗

- [ ] 每周費追為每周錄入詞元、出詞元、費、時戳
- [ ] 脈絡視窗審識諸耗者附約詞元數與百分比
- [ ] 預算限定於三層：軟限、硬限、每周限
- [ ] 每限有明確施動（警、刪、停、警報）
- [ ] 急刪循先序並存墓碑
- [ ] 漸顯經元數路而後載全內容
- [ ] 周距由費數證且合監系刷新率
- [ ] 驗試確諸控皆正起
- [ ] 費投居所定預算內
- [ ] 事後：根因已識且具體防措已置

## 陷

- **追於脈絡視窗中**：每周日誌存於對話史中即膨欲控之物。外錄（檔、庫、API），脈絡只留當前要
- **軟限無施**：無人見之警非控。軟限必觸可見動——刪、延距、警操作者。系若可默逾軟限，必逾
- **決前刪數**：決前棄工具出失信息。在所助之決後刪證，非前。墓碑模存結而棄證
- **周距合恐而非數刷**：每四時更之源每三十分輪費 87.5% 周。設距前測數源實刷率
- **為路而載全技**：讀四百行 SKILL.md 決「此為對技乎」費讀三行錄條 10-20 倍。先過元數路；唯驗合方載法
- **忽系令**：系令、CLAUDE.md 鏈、自載記為隱費——每周皆付。五千詞元系令於日 48 周環只為令日費 24 萬入詞元。先審削此
- **預算限無人升**：自運系至限默降（非警人）可累害。硬限必含人通知道

## 參

- `assess-context` — 評推理脈絡之構健；補第二步脈絡視窗審
- `metal` — 自庫提概念精；漸顯模施於 metal 之探階
- `chrysopoeia` — 提值與棄死重；於碼層施同每詞元值思
- `manage-memory` — 整與刪持久記檔；直減脈絡預算之記件
