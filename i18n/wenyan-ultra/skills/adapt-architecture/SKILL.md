---
name: adapt-architecture
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Execute structural metamorphosis using strangler fig migration, chrysalis
  phases, and interface preservation. Covers transformation planning, parallel
  running, progressive cutover, rollback design, and post-metamorphosis
  stabilization for system architecture evolution. Use when assess-form has
  classified the system as READY for transformation, when migrating from
  monolith to microservices, when replacing a core subsystem while dependents
  continue operating, or when any architectural change must be gradual rather
  than big-bang.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, adaptation, architecture, migration, strangler-fig
---

# 變構

形變不輟運也。絞榕、蛹、護介為法。

## 用

- `assess-form` 判 READY→用
- 須變構而不停→用
- 整→微服或反→用
- 換核而依者續行→用
- 數模演而存後容→用
- 凡變宜漸非驟→用

## 入

- **必**：今形評（自 `assess-form`）
- **必**：標構
- **必**：運續之要（不可斷者）
- **可**：變預（時、人、算）
- **可**：退求（退至何處）
- **可**：並行之久

## 行

### 一：謀

繪自今至標之路。

1. 列中間諸形：今→中一→…→標
   - 各中形必可運（受流、過驗）
   - 中形不得難於今
2. 識縫：何處可剖以入新
   - 自然縫：介、模界、數分
   - 人工縫：為剖而設之介（防腐層）
3. 擇變式：
   - **絞榕**：新繞舊漸代
   - **蛹**：包舊以新殼，內換而殼存外介
   - **芽**：新與舊並，流漸移（見 `scale-colony`）
   - **遞變**：依序代之（葉先根後）
4. 設護介層：
   - 外用者不擾
   - API 版、後容、配器
   - 護介乃暫——預其去

```
Metamorphosis Patterns:
┌───────────────┬───────────────────────────────────────────────────┐
│ Strangler Fig │ New code intercepts routes one by one;            │
│               │ old code handles everything else until replaced   │
│               │ ┌──────────┐                                     │
│               │ │ Old ████ │ → │ Old ██ New ██ │ → │ New ████ │  │
│               │ └──────────┘                                     │
├───────────────┼───────────────────────────────────────────────────┤
│ Chrysalis     │ Wrap old system in new interface; replace         │
│               │ internals while external shell stays stable       │
│               │ ┌──────────┐     ┌──[new]───┐     ┌──[new]───┐  │
│               │ │ old core │ → │ old core │ → │ new core │  │
│               │ └──────────┘     └──────────┘     └──────────┘  │
├───────────────┼───────────────────────────────────────────────────┤
│ Budding       │ New system runs in parallel; traffic shifts       │
│               │ ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐         │
│               │ │ Old  │ │ New  │  →  │ Old  │ │ New  │         │
│               │ │ 100% │ │  0%  │     │  0%  │ │ 100% │         │
│               │ └──────┘ └──────┘     └──────┘ └──────┘         │
└───────────────┴───────────────────────────────────────────────────┘
```

得：藍圖明中形、縫、式、護介，步皆具體可驗。

敗：無縫→先 `dissolve-form` 以造縫。中形不可運→步太大，析之為小增。

### 二：搭架

築變所賴之暫構。

1. 造防腐層：
   - 新舊間之薄譯層
   - 按遷態路請求至應者
   - 譯舊新之數式
   - 此層即護蛹
2. 設並行：
   - 新舊可同部
   - 旗控何流入何
   - 比機驗新舊果同
3. 立退點：
   - 各中形驗可退前
   - 退須速於進
   - 數遷可逆，或過渡時雙寫
4. 建驗夾：
   - 自動驗各中形運續
   - 性能基準察退化
   - 數整驗捕遷誤

得：防腐層、並行、退、驗皆備而後變起。架本身已驗。

敗：架太貴→簡之：最小架=旗+退法。防腐與並行加安但小變不必。

### 三：漸換

逐部自舊遷新。

1. 排部之序：
   - 始自最鬆最輕者（建信）
   - 進至要而緊者
   - 最緊要者末（時隊已熟）
2. 各部：
   a. 新版於防腐層後
   b. 並行：新舊同入
   c. 比果——應同（異則預期且記）
   d. 信則翻旗移流
   e. 監異（換後加感）
   f. 穩期後撤舊
3. 全程持續交付：
   - 各換為常部，非特事
   - 系恆於知、驗、運態
   - 換致誤→退前態（仍可運）

得：功逐部遷，各步皆驗。系恆運。各換育次信。

敗：並行見異→新有蟲，先修。換致退化→新部宜優或防腐層過重。隊失信→停而穩，半遷之系勝倉促全遷。

### 四：理蛹

度最脆之期——形之間。

1. 認蛹實：
   - 遷時系半舊半新
   - 此雜態本繁於純態
   - 繁峰於遷之中，後減
2. 蛹律：
   - 蛹期無新功（唯變）
   - 外變最少（凍非要部）
   - 加監加值
   - 日察進與健
3. 中蛹評：
   - 半時評：標仍對乎
   - 市、需、隊有變影標乎
   - 續、停、改向
4. 護蛹：
   - 退路恆通
   - 厚記今雜態（後人除錯需）
   - 抗除暫架之誘——遷未畢

得：蛹期為自覺、限時之期，律加監加。隊知暫繁乃安變之代。

敗：蛹拖久→雜態為新常，劣於兩端。設限。至限則速畢餘遷或受雜為新形而穩。

### 五：畢變而穩

成變、撤架。

1. 末換：
   - 末部遷新
   - 全驗套行新系
   - 性能驗於擬產之載
2. 撤架：
   - 撤防腐層（無需矣）
   - 去遷之旗
   - 清並行設
   - 存（勿刪）舊碼以參
3. 後變穩：
   - 新形運 2-4 週加監
   - 解實況下新症
   - 更文以反新構
4. 回顧：
   - 何處善
   - 何處難於預
   - 下次何改
   - 更隊變譜

得：變畢。系於新形運。架已撤。文已更。隊得學以備後變。

敗：換後新形不穩→存退路續穩。穩過期→新構恐有設誤，考定修或部退最劣者。

## 驗

- [ ] 藍圖示中形可運
- [ ] 架（防腐、退、驗夾）於遷起前已備
- [ ] 部按低至高險之序遷
- [ ] 並行各步驗同
- [ ] 蛹期限時且凍新功
- [ ] 變畢架皆撤
- [ ] 後變穩期無大症
- [ ] 回顧得學

## 忌

- **驟遷**：欲一舉變盡。棄漸換之安，最大爆域。必漸遷
- **架不撤**：防腐層、旗久存→技債。撤架預入變謀，非後想
- **否蛹**：偽稱雜為常→於不穩築新功。認蛹期、行其律
- **執標**：執新構而忽更佳之兆。中蛹評即為此
- **變疲**：久遷耗隊。步小至日畢，非週。記里程以續勢

## 參

- `assess-form` — 前置評：判系可變否
- `dissolve-form` — 系剛不可直變者：溶之以造縫
- `repair-damage` — 變致損之復技
- `shift-camouflage` — 表變或足無須深構變
- `coordinate-swarm` — 群協告分散系變之序
- `scale-colony` — 長壓常為構變之發
- `implement-gitops-workflow` — GitOps 為漸換之部設
- `review-software-architecture` — 評標構之伴技
