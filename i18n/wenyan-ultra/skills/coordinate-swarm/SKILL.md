---
name: coordinate-swarm
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Apply collective intelligence coordination patterns — stigmergy, local rules,
  and quorum sensing — to organize distributed systems, teams, or workflows
  without centralized control. Covers signal design, agent autonomy boundaries,
  emergent behavior cultivation, and feedback loop tuning. Use when designing
  distributed systems without a coordination bottleneck, organizing teams that
  must self-coordinate, building event-driven architectures with shared state
  communication, or replacing fragile centralized orchestration with resilient
  emergent coordination.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: basic
  language: natural
  tags: swarm, coordination, stigmergy, emergent-behavior
---

# 調群

以 stigmergy（改境間通）、局互規、quorum 感，立分代間調——無中控而生協同群行。

## 用

- 分系設、無單點為調瓶
- 團工須自調而無常督
- 事驅架、以共態通非直訊
- 三代行而三十代潰之法
- 新群域之調模引（見 `forage-resources`、`build-consensus`）
- 代脆中組以韌生調

## 入

- **必**：須調代（工、服、員）之述
- **必**：群目或所求生行
- **可**：現調機與敗模
- **可**：代數（影模選——小群與大巢）
- **可**：延忍（實時或終至調）
- **可**：境限（共態可用、通頻寬）

## 行

### 一：別調問類

分調挑以選合模。

1. 繪現態：代為誰、獨行為何、調於何處潰
2. 分問：
   - **Foraging** — 代搜與用分資（見 `forage-resources`）
   - **Consensus** — 代須同意一集決（見 `build-consensus`）
   - **Construction** — 代漸築或守共構
   - **Defense** — 代群察與應威（見 `defend-colony`）
   - **Division of labor** — 代須自組為專角
3. 識現調之敗模：
   - 單點敗（中控）
   - 通瓶（直訊過多）
   - 協失（代無饋而漂）
   - 剛（不能適變）

**得：** 問類與所治具敗模之明分。此定施何群模。

**敗：** 問不合單類→可為合。分為子問、各以合模治。代過雜→考層調：同質簇以簇間 stigmergy 調。

### 二：設 stigmergic 信號

設代間接通道以相影行。

1. 定共境（庫、訊隊、檔系、物空、共板）
2. 設代沉於境之信號：
   - **Trail signals**：積於成徑之標（如蟻 pheromones）
   - **Threshold signals**：過閾觸行變之計
   - **Inhibition signals**：斥代離竭區之標
3. 定信號性：
   - **Decay rate**：信號速衰（防陳態主）
   - **Reinforcement**：成果強信號
   - **Visibility radius**：信號傳遠
4. 映信號至代行：
   - 代測信號 X 過閾 T→行動 A
   - 代成動 A→沉信號 Y
   - 無信號→代默探行

```
Signal Design Template:
┌──────────────┬───────────────────┬──────────────┬────────────────────┐
│ Signal Name  │ Deposited When    │ Decay Rate   │ Agent Response     │
├──────────────┼───────────────────┼──────────────┼────────────────────┤
│ success-trail│ Task completed OK │ 50% per hour │ Follow toward      │
│ busy-marker  │ Agent starts task │ On completion│ Avoid / pick other │
│ help-signal  │ Agent stuck >5min │ 25% per hour │ Assist if nearby   │
│ danger-flag  │ Error detected    │ 10% per hour │ Retreat & report   │
└──────────────┴───────────────────┴──────────────┴────────────────────┘
```

**得：** 映境標至沉件、衰率、應行之信號表。信號當簡、可組、獨義。

**敗：** 設感過繁→減為二：正（success trail）與負（danger flag）。多調可以吸斥引。基系行後加細。

### 三：定局互規

以局信息（己態+鄰信號）定各代循之簡規。

1. 定代感半徑（何可感？）
2. 按優先書 3-7 局規：
   - 規一（安）：測 danger-flag→離
   - 規二（應）：測 help-signal 且閒→趨
   - 規三（用）：測 success-trail→趨最強
   - 規四（探）：無信號→偏未探區隨動
   - 規五（沉）：畢任→於處沉 success-trail
3. 各規須：
   - **局**：依只代可感
   - **簡**：一 if-then 句達
   - **無態**（宜）：無須代憶過態
4. 心試：諸代循此規，所求群行生乎？

**得：** 各代獨行之優先規集。施於全群→生目標群行（foraging、construction、defense 等）。

**敗：** 心擬不生所求生行→規需饋環——代須可觀群動之果。加代群態之信號（如「任成率」）與按之調行之規。

### 四：校 quorum 感

立閾以代足同時觸群態變。

1. 識須集同意之決（非僅個應）：
   - 探轉用
   - 承新工地或棄舊
   - 自常升急應
2. 各集決定：
   - **Quorum threshold**：須同意代之數或率
   - **Sensing window**：計信號之時段
   - **Hysteresis**：活與止之異閾（防震）
3. 以信號積實 quorum：
   - 贊決之代沉 vote-signal
   - 窗內積票過 quorum 閾→決活
   - 票低於止閾→決反

**得：** 允群無首為集決之 quorum 閾。Hysteresis 隙防態速震。

**敗：** 群態震→廣 hysteresis 隙（如活於 70%、止於 30%）。群不達 quorum→降閾或廣窗。決過慢→縮窗，慎早共識。

### 五：測調生行

驗局規生所求群行，後調參。

1. 以少代（5-10）行擬或試
2. 觀：
   - 群收斂於意行乎？
   - 收斂幾久？
   - 任中態變時何？
   - 代敗或增時何？
3. 調參：
   - 信號衰率：過速→無調憶；過緩→陳信號主
   - Quorum 閾：過低→早集決；過高→癱
   - 探用衡：過探→效低；過用→局優
4. 壓測：
   - 忽去 30% 代→群復乎？
   - 倍代→仍調乎？
   - 引悖信號→解或死鎖？

**得：** 調參集，群自組趨目行、復擾、優擴。

**敗：** 群敗壓測→信號設過耦。簡之：減信號、增衰率（更鮮信息），保代無信號時有穩默行。零信號行理者勝依信號者。

## 驗

- [ ] 調問已分為識模（foraging、consensus、construction、defense、division of labor）
- [ ] Stigmergic 信號表定，含沉件、衰率、代應
- [ ] 局互規簡、局、優先（3-7 規）
- [ ] Quorum 閾含 hysteresis 以防震
- [ ] 小測顯生行合群目
- [ ] 壓測（代去、加、信號擾）顯優雅降級

## 忌

- **過設信號**：始過多信號型生惑。起於二信號（吸斥）、證要方加
- **隱中思**：「局規」求代知全態→非局。重構至各規依代直感
- **忽衰**：永不衰之信號生化石調態。各信號須合任時尺之半衰
- **零 hysteresis**：活與止無隙之 quorum 閾生態速震。止當低於活
- **設同質**：代異能→單規集敗。考角異規（見 `scale-colony`）

## 參

- `forage-resources` — 群調特於資搜及探用權衡
- `build-consensus` — 分意機深探，擴此技之 quorum 感
- `defend-colony` — 群禦模，築於此信號與規架
- `scale-colony` — 群過初調設時之擴法
- `adapt-architecture` — 架變 morphic 技，群調觸構變時補
- `deploy-to-kubernetes` — 實分系部，群調模施於此
- `plan-capacity` — 知於群擴動之容謀
- `coordinate-reasoning` — AI 自施變；映 stigmergic 信號至脈管，含信息衰率與局協
