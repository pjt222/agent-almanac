---
name: scale-colony
locale: wenyan-ultra
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

# 擴群

擴系、組於蕊裂、職分、長觸構遷—保協於群超始設容。

## 用

- 10 工成而 50 破→用
- 通負長過產→用
- 隱協需顯→用
- 預擴而非反擴→用
- 協敗與大相關（失訊、重工、權不明）→用
- 既系需裂為半自子群→用

## 入

- **必**：當群大與標長（或率）
- **必**：當協機與其壓點
- **可**：群構（平、層、簇）
- **可**：既職分
- **可**：長期與限
- **可**：群間協需（裂時）

## 行

### 一：識長期

定當擴期施宜策。

1. 分當長期：

```
Colony Growth Phases:
┌───────────┬──────────────┬───────────────────────────────────────────┐
│ Phase     │ Size Range   │ Characteristics                           │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Founding  │ 1-7 agents   │ Everyone does everything, direct comms,   │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Growth    │ 8-30 agents  │ Roles emerge, some specialization         │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Maturity  │ 30-100       │ Formal roles, layered coordination        │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Fission   │ 100+         │ Colony too large; bud into sub-colonies   │
└───────────┴──────────────┴───────────────────────────────────────────┘
```

2. 識長壓信：
   - **通溢**：日訊/工長過群大
   - **決延**：自議至決時長
   - **協敗**：重工、棄務、衝動增
   - **知稀**：新工成熟久
   - **失我**：工不能一致述群旨

3. 定群將過或已過期界

得：明識當期與具壓信指群近或已過期界。

敗：期不明→量三具指：通量/工、決延、協敗率。繪時序，拐點示期遷。無指→群似於建期（指未需）。

### 二：行職分（齡別）

引漸專—工按驗與群需任異職。

1. 定職進路：
   - **新者**：察、學、簡務（低自、高導）
   - **工**：標務行、信循（中自）
   - **專**：域知、複務、導新（高自）
   - **覓/偵**：探、新、外接（見 `forage-resources`）
   - **協**：群間通、衝解、量管

2. 行職遷：
   - 遷觸於驗門，非任命
   - 工成 N 務後遷次職（按複校門—簡 5-10、專 20-30）
   - 反遷可（專返工於新域）
   - 群職分適當需：
     - 長群→多新位、活導
     - 穩群→諸職衡分
     - 危群→多衛少偵（見 `defend-colony`）

3. 保職靈：
   - 無工永鎖一職
   - 急協可暫任何工於任職
   - 跨訓使工可代鄰職

得：職構工自簡至複進、群職分映當需與期。

敗：職分生硬筒→增跨訓與輪頻。新者難進→導不足，每新者配專於首 N 務。一職集太多→遷觸失校，按群職需調門。

### 三：重構協以擴

適 `coordinate-swarm` 之機以理擴大。

1. 代直通以層信：
   - 建期：諸通諸（N×N）
   - 長期：簇為 5-8 隊；隊內直、隊間信
   - 熟期：隊成部；隊內直、隊間信、部間播

2. 行協層：
   - **地協**：隊內直信交（stigmergy）
   - **域協**：同部隊間聚信
   - **群協**：部間播僅為群決

3. 設層間介：
   - 各隊一指通工聚轉信
   - 通工濾噪：非每地信轉上
   - 群播罕、留為量決、警升、大態變

4. 通負預：
   - 標：各工 < 20% 容於協
   - 量實負；超→加層或裂大隊

得：層協構通負對群大為對數（非線）。地協速直；群協緩而仍可用。

敗：協層生瓶（通工溢）→加冗通工或減轉頻。層生隔（隊不知他隊）→增層間信頻或建跨隊聯。

### 四：行群裂

群超單協容→裂為半自子群。

1. 識裂觸：
   - 群超 100 工（或協層超 3）
   - 通負超 30% 雖層
   - 決延超時敏操之忍
   - 子組已有別我可獨運

2. 計裂：
   - 識自然裂線（既簇、域界、地隔）
   - 確各女群有可活職分（不可諸專入一群）
   - 各女群必有：≥ 1 協、足工、共資達
   - 定群間介：何訊共、何獨

3. 行裂：
   - 宣裂計與時（共識需—見 `build-consensus`）
   - 工按既簇成轉至女群
   - 立群間通道（輕、異步）
   - 各女群啟自地協（承父式）

4. 裂後穩：
   - 察各女群可活否（自承否？）
   - 群間協宜小（季、非日）
   - 女群敗→收於最近可活群

得：≥ 2 可活女群、各半自運自協、輕介連。

敗：女群過小→裂早，重併大時再試。群間協如裂前單群協→裂線誤，群過互依。沿自然獨線重畫界。

### 五：察擴限與適

續評當構合群大與需否。

1. 追擴健指：
   - **協負比**：協時/產時
   - **決通量**：決/時（隨長宜增或穩）
   - **工足**：投入、留、旨感（擴敗時降）
   - **誤率**：協敗/時（不宜線增）

2. 識擴限示：
   - 負比超 25%→需多自動或加層
   - 決通量降→治構需修
   - 工流失躍→擴生文化或構問題
   - 誤率加速→協機敗

3. 觸適：
   - 期遷察→施宜期策
   - 達擴限→升次構介入（職分→協重構→裂）
   - 外變（市、技）→或需群變（見 `adapt-architecture`）

得：群察自擴健、預適構於擴壓成擴敗前。

敗：擴指無→群缺察，先建量再建構。指示問題而群不能適→拒文化非技，先理人因（懼變、權執、信缺）再重構。

## 驗

- [ ] 當長期識附具壓信
- [ ] 職分定附漸專
- [ ] 協層宜配群大
- [ ] 通負 < 20-25% 工容
- [ ] 群超單協容之裂計存
- [ ] 擴健指追、限觸適
- [ ] 各女群（裂後）有可活職分

## 忌

- **未需先擴構**：早層加負無利。10 人不需部協。讓壓信導構變
- **不惜保建文化**：5 工成者於 50 不成。擴需構演；念建期阻必適
- **裂無獨**：子群仍日依→兩世之劣—協負加離負
- **均職分**：非每子群同職比。研群多偵；產群多工。職分按使
- **忽重併為選**：時裂敗，最善為重併。視裂不可逆阻自惡裂復

## 參

- `coordinate-swarm`
- `forage-resources`
- `build-consensus`
- `defend-colony`
- `adapt-architecture`
- `plan-capacity`
- `conduct-retrospective`
