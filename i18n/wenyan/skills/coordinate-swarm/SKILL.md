---
name: coordinate-swarm
locale: wenyan
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

# 協群

以遺跡之通（改環境而間接通）、局部之規、法定人數之察，立諸散處之群之協，無中央之司而生諧調之集體行。

## 用時

- 設散處之系，無一節宜為協之瓶頸
- 團隊或流程宜自協，不賴監管常督
- 建事件驅動之構，構件以共享狀態通而不直傳
- 三人之法推至三十人則潰
- 群式新域之協初建（參 `forage-resources`、`build-consensus`）
- 以韌之湧現協代脆弱之中央調度

## 入

- **必要**：需協之諸行者（工、服、人）之述
- **必要**：集體之志或所欲湧現之行
- **可選**：當前協法及其敗模
- **可選**：行者之數（影響法之選——小群與大巢異）
- **可選**：延遲之容（即時與終究之別）
- **可選**：環境之限（共享狀態之可得、通信之寬）

## 法

### 第一步：定協題之類

別協之難以選合宜之法。

1. 圖當前之狀：行者何人、各為何事、協於何處潰
2. 別題：
   - **覓食** — 行者尋散處之資而用之（參 `forage-resources`）
   - **共識** — 行者宜合於集體之決（參 `build-consensus`）
   - **建構** — 行者逐步建或守共享之構
   - **禦** — 行者集體察而應之（參 `defend-colony`）
   - **分工** — 行者宜自組為專角
3. 識當前協之敗模：
   - 單點之敗（中央之司）
   - 通之瓶頸（直傳過繁）
   - 諧之失（行者無饋而相離）
   - 僵（不能應變）

**得：** 協題之別明，所處敗模清。此定所施群法。

**敗則：** 若題不歸一類，或為合成。分為子題，各以合宜之法應。若行者異質過甚，一法難行，宜層協——同質之簇內協，簇間以遺跡協。

### 第二步：設遺跡之訊

建間接之通道，行者以之相影響。

1. 定共享之環境（庫、隊列、文件系、物理空間、共板）
2. 設行者置於環境之訊：
   - **徑訊**：成功之徑所積之標（如蟻之費洛蒙）
   - **閾訊**：計數過閾則觸行變
   - **抑訊**：斥行者離已竭之域之標
3. 定訊之性：
   - **衰率**：訊褪之速（防陳狀獨霸）
   - **增**：成之果強訊
   - **視半徑**：訊播之遠
4. 訊映行者之行：
   - 行者察訊 X 過閾 T，則行 A
   - 行者成 A，則置訊 Y
   - 無訊可察，行者依默之探行

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

**得：** 訊表映環境之標至行者置之條件、衰率、應之行。訊宜簡、可組、各有獨立之義。

**敗則：** 訊設過繁，減至二：正（成徑）與負（險旗）。多協題以引斥之動可初建。證之必要後再增微妙。

### 第三步：定局部交互之規

每一行者所循之簡規，唯用局部之訊（己之狀加近之訊）。

1. 定行者察之半徑（能感何物？）
2. 書三至七局部規，按優先列：
   - 規一（安）：察險旗則避
   - 規二（應）：察助訊且閒則近
   - 規三（用）：察成徑則循最強之訊
   - 規四（探）：無訊可察則隨動，偏於未探之域
   - 規五（置）：成任務則置成徑於所在
3. 每規宜：
   - **局部**：唯依行者所能直接察者
   - **簡**：一「若—則」可表
   - **無狀**（宜）：不賴行者記過去之狀
4. 心試諸規：若眾行者皆循此規，所欲之集體行湧現乎？

**得：** 按優先之規集，每行者獨立執之。施於群，局部之規生所欲之集體行（覓食、建構、禦等）。

**敗則：** 若心模不生所欲湧現，規當缺反饋環——行者宜能察集體行之果。增一訊表集體之狀（如「任務成率」），增一規依之調行。

### 第四步：校法定人數之察

設閾以觸集體狀變，於足數行者合時。

1. 識需集體合（非個別應）之決：
   - 由探轉用
   - 擇新工所或棄舊者
   - 由常升至急應
2. 每集體之決，定：
   - **法定閾**：宜合者之數或百分比
   - **察窗**：計訊之時段
   - **遲滯**：啟閾與停閾異（防震盪）
3. 以訊積為法定：
   - 每支持者置票訊
   - 察窗內累票過閾則啟決
   - 票降至停閾下則反決

**得：** 法定閾使群無首而決。遲滯之差防狀速盪。

**敗則：** 若群盪於狀間，闊遲滯差（如 70% 啟、30% 停）。若群永不達法定，降閾或增察窗。若決過遲，減窗——然防早熟共識。

### 第五步：試而調湧現之行

驗局部之規生所欲之集體行，而後調參。

1. 以小數行者（五至十）模擬或試運
2. 察：
   - 群聚於所欲之行乎？
   - 聚需幾時？
   - 條件中變則如何？
   - 行者敗或增則如何？
3. 調參：
   - 訊衰率：過速則協無記；過遲則陳訊獨霸
   - 法定閾：過低則集體決早熟；過高則癱
   - 探用之衡：探過則效低；用過則陷局部
4. 壓試：
   - 驟去 30% 行者——群復乎？
   - 倍增行者——群猶協乎？
   - 引衝突之訊——群解或鎖？

**得：** 調好之參集，群自組向所欲之行，能復於擾，優雅而擴。

**敗則：** 若群敗於壓試，訊設過緊。簡之：減訊數、增衰率（訊鮮）、確保行者於無訊時有堅默之行。零訊仍為合理者之群比依訊者韌。

## 驗

- [ ] 協題別入既知之類（覓食、共識、建構、禦、分工）
- [ ] 遺跡訊表已定，含置條件、衰率、行者應
- [ ] 局部交互規簡、局部、有優先（三至七規）
- [ ] 法定閾有遲滯以防盪
- [ ] 小規模試顯湧現合集體之志
- [ ] 壓試（去、增、擾訊）顯優雅降級

## 陷

- **訊過度工程**：訊型初多則生惑。始於二訊（引／斥），證必要再增
- **隱中央之思**：若「局部規」需知全局之狀，非局部也。重構至每規唯依行者可直察者
- **忽衰**：訊永不衰則生化石之協狀。每訊需半衰期合任務之時尺
- **無遲滯**：法定閾無啟停之差則速盪。宜設停低於啟
- **設同質**：若行者能異，一規集難行。考異角之規（參 `scale-colony`）

## 參

- `forage-resources` — 將群協專施於資源尋與探用之衡
- `build-consensus` — 深究散處合之法，延本技之法定察
- `defend-colony` — 集體禦之法，建於此之訊規架上
- `scale-colony` — 當群逾其初協設之擴法
- `adapt-architecture` — 變形之技以轉系構，與群協觸結構變時相補
- `deploy-to-kubernetes` — 散系之實地布，群協之法可施
- `plan-capacity` — 依群擴之動而劃容
- `coordinate-reasoning` — AI 自施之變；映遺跡之訊至脈絡管理，含信息衰率與局部規
