---
name: scale-colony
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scale distributed systems and organizations through colony budding, role
  differentiation, and growth-triggered architectural transitions. Covers
  growth phase recognition, age polyethism, fission protocols, inter-colony
  coordination, and scaling limit detection. Use when a team or system that
  worked at 10 agents breaks down at 50, when communication overhead grows
  faster than productive output, when planning a growth phase proactively, or
  when coordination failures correlate with size such as lost messages, duplicated
  work, or unclear ownership.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: advanced
  language: natural
  tags: swarm, scaling, colony-budding, role-differentiation
---

# 規群擴

以群之分蜂、角之分化、與生長所觸之構轉，擴分布之系與組織——當群增逾初設之容，仍守協之質。

## 用時

- 十員可行之團或系，五十員乃壞乃用
- 通訊之耗增速於生產之出乃用
- 隱之協需顯化乃用
- 計生長之期，欲主動而擴乃用
- 協敗與大小相關（失訊、重工、所屬不明）乃用
- 既系需分為半自治之子群乃用

## 入

- **必要**：當前群之大與目標生長（或生長率）
- **必要**：當前協之機與其壓點
- **可選**：群之構（平、層、簇）
- **可選**：已有之角分化
- **可選**：生長之時程與限
- **可選**：群間協之需（若分）

## 法

### 第一步：識生長之期

識群處何擴之期，以施宜之策。

1. 分當前生長之期：

```
Colony Growth Phases:
┌───────────┬──────────────┬───────────────────────────────────────────┐
│ Phase     │ Size Range   │ Characteristics                           │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Founding  │ 1-7 agents   │ Everyone does everything, direct comms,   │
│           │              │ implicit coordination, high agility       │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Growth    │ 8-30 agents  │ Roles emerge, some specialization, comms  │
│           │              │ overhead increases, need for structure     │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Maturity  │ 30-100 agents│ Formal roles, layered coordination,       │
│           │              │ sub-groups form, inter-group coordination  │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Fission   │ 100+ agents  │ Colony too large for single coordination  │
│           │              │ framework, must bud into sub-colonies     │
└───────────┴──────────────┴───────────────────────────────────────────┘
```

2. 識生長之壓信：
   - **通訊過載**：每員每日之訊增速於群之大
   - **決之延**：自議至決之時增
   - **協之敗**：重工、棄務、衝行增
   - **知之稀**：新員生產之時延
   - **身之失**：員不能一致述群之旨

3. 定群將跨期界、或已跨之

得：明識當前生長之期，與群將近或已跨期界之具體壓信。

敗則：期不明，量三具體之指：每員之通訊量、決延、協敗率。繪其於時。轉折處示期之變。指不可得，群多在創立之期（指未需）。

### 第二步：施角分化（齡角分業）

引漸進之專化——員依驗與群需擔異角。

1. 定角進之路：
   - **新者**：察、學、簡務（自治低、引導高）
   - **工者**：標務之行、循信號（自治中）
   - **專者**：域之專、繁務、引新者（自治高）
   - **食/偵者**：探、新、外面（參 `forage-resources`）
   - **協者**：群間之通、衝之解、票之治

2. 施角之轉：
   - 轉觸於驗之閾，非於任命
   - 員成閾數之務，乃轉至下角（依務之繁與群之長率校閾——如簡角 5-10 務，專角 20-30）
   - 反轉可（專者於新域返為工）
   - 群之角分依當前需而適：
     - 長中之群 → 多新者位、活之引
     - 穩之群 → 諸角均
     - 危之群 → 多守者、少偵（參 `defend-colony`）

3. 守角之彈：
   - 無員永鎖於一角
   - 急協可暫派任員至任角
   - 跨訓使員可代鄰角

得：員自簡漸至繁之角構，群之角分反映當前之需與期。

敗則：角分化致剛之孤倉，增跨訓之求與輪轉之頻。新者難進，引制不足——配每新者於專者治其首 N 務。員聚一角過繁，轉觸校誤——依群全角之需調閾。

### 第三步：重構協以擴

依群之大，調 `coordinate-swarm` 之機。

1. 以層之信代直之通：
   - 創立期：人人皆通（N×N 之通）
   - 生長期：聚為 5-8 之隊；隊內直通，隊間信號
   - 成熟期：隊組部；隊內直、隊間信、部間廣播

2. 施協之層：
   - **本協**：隊內直信號交（stigmergy）
   - **域協**：同部諸隊間，聚之信號
   - **群協**：諸部間，廣播僅為群決

3. 設層間之面：
   - 每隊一指通者，聚而傳信號
   - 通者濾噪：非每本信號皆上傳
   - 群廣播稀，唯為票決、警升、大態變

4. 通訊耗之預：
   - 目：每員耗於協 <20%
   - 量實耗；超則加層或分過大之隊

得：層之協使通訊耗對群大之增為對數（非線性）。本協速直，群協慢但仍可用。

敗則：協層致信瓶（通者過載），增冗通者或減傳頻。層致孤（隊不知他隊何為），增層間信頻或立跨隊聯絡之角。

### 第四步：行群之分蜂（分裂）

群超單協之容，分為半自治之子群。

1. 識分裂之觸：
   - 群超 100 員（或協層數超 3）
   - 雖層化，通訊耗超員 30%
   - 決延超時敏之操之可受
   - 子群已生別身，可獨運

2. 計分裂：
   - 識自然之分線（既有簇、域界、地分）
   - 確各女群有可行之角分（不可分諸專者皆入一群）
   - 各女群必有：至少一協者、足之工者、共資之訪
   - 定群間之面：何信共、何信獨

3. 行其分：
   - 宣分計與時程（需共識——參 `build-consensus`）
   - 依既有簇之屬轉員入女群
   - 立群間通之渠（輕、異步）
   - 各女群自啟其本協（承父之模）

4. 分後之穩：
   - 監各女群之可行（能自持乎）
   - 群間協宜微（季同步，非日）
   - 女群敗，併入最近之可行群

得：二或數可行之女群，各半自治運其協，以輕之群間面相連。

敗則：女群過小不可行，分裂太早——重併再試於更大之群。群間協如分前之單群協般重，分線誤——群仍互依。沿自然獨之線重劃界。

### 第五步：監擴之限而適

續察當前構合於群之大與需否。

1. 跟擴健之指：
   - **協耗比**：協之時/產之時
   - **決吞**：每時決之數（隨長宜增或穩）
   - **員滿**：投入、留任、目之感（擴敗則降）
   - **誤率**：每時協敗之數（不應隨長線增）

2. 識擴限之示：
   - 耗比超 25% → 需更自動化或加層
   - 決吞降 → 治構需修
   - 員流失急升 → 擴致文化或構之患
   - 誤率加速 → 協機正敗

3. 觸適：
   - 察期變 → 施第一步之宜期策
   - 達擴限 → 升至下一構之介入（角分化 → 協重構 → 分裂）
   - 外之變（市變、技裂） → 或需群之變（參 `adapt-architecture`）

得：群自監其擴健，於擴壓未成擴敗前主動適其構。

敗則：擴健之指不可得，群乏可察——先建測，再建構。指示患而群不能適，阻在文化非技——先解人之素（變之恐、屬之執、信之缺），再重構。

## 驗

- [ ] 當前生長期已識，附具體壓信
- [ ] 角分化已定，附漸進之專化
- [ ] 協依群之大已適層
- [ ] 通訊耗在員 20-25% 之下
- [ ] 群超單協之容時，分裂之計已有
- [ ] 擴健指已跟，閾觸適
- [ ] 各女群（分後）有可行之角分

## 陷

- **未需而擴構**：早層化增耗無益。十人之團不需部協者。令壓信導構變
- **不顧一切守創立之文化**：五員可，五十員不可。擴需構之進；念創立期阻必之適
- **分裂無獨**：分群而日操仍互依，致二弊兼——協之耗加分之耗
- **角分齊一**：非每子群需同角比。研究之群需多偵；產之群需多工。依使命適角分
- **忽再併之選**：分有時敗，最佳之為再併。視分為不可逆，阻自誤分之復

## 參

- `coordinate-swarm` — 此技所擴之基協模
- `forage-resources` — 食擴異於產；角分化影偵之派
- `build-consensus` — 共識機需依大群而適
- `defend-colony` — 守必隨群擴
- `adapt-architecture` — 構之變之 morphic 技，由長壓觸
- `plan-capacity` — 為長之預算容
- `conduct-retrospective` — 反思助識擴壓於未成敗前
