---
name: shift-camouflage
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Implement cuttlefish-inspired adaptive interfaces — polymorphic APIs,
  context-aware behavior, feature flags, and attack surface reduction.
  Covers environmental assessment, chromatophore mapping, dynamic interface
  generation, behavioral polymorphism, and pattern disruption for systems
  that must present different faces to different observers. Use when a system
  must present different interfaces to different consumers, when reducing attack
  surface by exposing only what each observer needs, when implementing feature
  flags or progressive rollouts at the interface level, or when adapting behavior
  to environmental context without core changes.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: advanced
  language: natural
  tags: morphic, camouflage, polymorphism, feature-flags
---

# 易其偽

仿烏賊之色胞，行能變之表面——多態之介、隨境之行、動之顯。系之表能應其境而其核恆穩，攻面減而與諸觀者之交宜。

## 用時

- 系須顯異介於異用者（API 之版、多租、依角）乃用
- 各觀者唯顯所須，以減攻面乃用
- 介層立旗、漸推、A/B 之試乃用
- 系須隨境而變行，不動其核乃用
- 護內構於外耦（觀者耦於表，非耦於構）乃用
- 補 `adapt-architecture`：表變足而深變不必乃用

## 入

- **必要**：須變表之系
- **必要**：諸觀者及其所須之介
- **可選**：當前介之設與其限
- **可選**：威脅之模（何宜隱於何觀者？）
- **可選**：旗之系或漸推之施
- **可選**：性能之限（動表之生有耗）

## 法

### 第一步：圖觀者之地

識誰交於系，各觀者所須見為何。

1. 列諸觀者：
   - 外用者（終用、API 用者、夥伴）
   - 內服（微服、背景之務、管理之器）
   - 敵者（攻者、爬者、競者）
   - 規者（審者、合規之察）
2. 各觀者定：
   - 所須見（必要之表）
   - 不宜見（隱之表）
   - 所期見（兼容之表——或異於所須）
   - 何以交（協、頻、敏）
3. 立觀者—表之矩陣：

```
Observer-Surface Matrix:
┌──────────────┬────────────────────────┬─────────────────┬──────────────┐
│ Observer     │ Required Surface       │ Hidden Surface  │ Threat Level │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ End users    │ Public API v2, UI      │ Internal APIs,  │ Low          │
│              │                        │ admin endpoints │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Partner API  │ Partner API, webhooks  │ Internal logic, │ Medium       │
│              │                        │ user data       │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Admin tools  │ Full API, debug        │ Raw data store  │ Low          │
│              │ endpoints              │ access          │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Adversaries  │ Nothing (minimal)      │ Everything      │ High         │
│              │                        │ possible        │              │
└──────────────┴────────────────────────┴─────────────────┴──────────────┘
```

得：觀者之全景已圖，各觀者之表所須亦定。此為後續諸偽之本。

敗則：若觀者之識未全，自二極始：最尊者（管理）與最限者（敵）。先設此二之表，再內插他者之表。

### 第二步：設色胞之圖

立觀者之境與表之顯之對映——「色胞」之層也。

1. 定境之信：
   - 驗身之人 → 定其權級
   - 求之源 → 地、網、應之境
   - 旗 → 啟閉特定表元
   - 時／階 → 部署之段、業時、維護之窗
   - 載／健 → 降模或減表
2. 設表生之則：
   - 各境信之合，定何元為：
     - **顯**：入應／介
     - **隱**：全棄（誤辭亦不洩其存）
     - **變**：在而為此觀者改（異模、簡資）
     - **誘**：故誤導之元，為敵者之境
3. 立色胞之層：
   - 薄之中介／代理，置於核與觀者間
   - 每求察境之信
   - 施所宜之表設
   - 不動核之行——唯篩變表

```
Chromatophore Architecture:
┌──────────────────────────────────────────────────────┐
│ Observer Request                                      │
│        │                                              │
│        ↓                                              │
│ ┌─────────────────┐                                   │
│ │ Context Extract  │ ← Auth, origin, flags, time      │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Surface Select   │ ← Observer-surface matrix lookup  │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Core System      │ ← Processes request normally      │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Surface Filter   │ ← Remove/transform/add elements   │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ Observer Response (adapted surface)                    │
└──────────────────────────────────────────────────────┘
```

得：色胞之圖譯境之信為表之設。圖明、可審，與核之邏輯離。

敗則：若圖太繁（境之合過多），簡為依角之表：定三五之表型（公、夥、管、內、極簡），各觀者歸一型。

### 第三步：行為之多態

使系之行隨境變，不徒表變。

1. 識隨境之行：
   - 應之詳（管者繁，公者簡）
   - 限速（夥者寬，未知者嚴）
   - 誤辭（內者詳，外者泛）
   - 資新（尊者實時，常者緩存）
   - 能可得（測者全，常者唯穩）
2. 立行之諸變：
   - 各變為完整、已試之路
   - 境決何變執行
   - 諸變共核之邏輯，而異於顯與政
3. 與旗之合：
   - 旗控何行變為活
   - 漸推：新行先示於部分觀者，漸增之
   - 斷路：若新變致誤，自還於安行

得：系之行隨境變——同核之邏輯生宜異眾之應。旗使新行漸推。

敗則：若多態生過多碼路，合為流模：核 → 政層 → 顯層。多態唯居於政與顯之層，核之邏輯為一。

### 第四步：減攻面

最少所敵者可察可交。

1. 行最少表之則：
   - 各觀者唯見所須——無餘
   - 未驗身者見最少之表
   - 誤辭不洩內構（無棧追、無內路、無版號）
2. 行主動之減：
   - 除默頁、頭、端，以隱技堆
   - 雜化非要之應特性（時抖、頭序）
   - 全閉未用之 API 端（非隱——實閉）
3. 施模之擾：
   - 變應之特，敗指紋之識
   - 引控之不測於非功之面
   - 功之行恆定，表之特變
4. 察偵察：
   - 識探隱表之求模（枚舉之攻）
   - 警復取不存之端（路模糊）
   - 跨會話追偵察之模（參 `defend-colony`）

得：攻面極小，敵者難定技堆、內構、隱能。偵察之試已察而追。

敗則：若減表斷正當之用者，觀者—表之矩陣未全——正當之須被隱。回第一步而新之。若雜化致患，限雜化於非功之面（時、頭），功之應仍恆定。

### 第五步：守表之諧

使動之表恆一、可調、可維。

1. 表之試：
   - 各觀者型明試之（管者見管之表乎？公者見公之表乎？）
   - 試表之轉（觀者之境會話中變何如？）
   - 試表之敗模（色胞層敗則何表現？）
2. 表之文：
   - 各觀者型及其表設皆書之
   - 境之信與其於表選之效皆書之
   - 文與實行同步（試文以實）
3. 調之支：
   - 管／調模顯何表型活與其因
   - 日記何表設施於各求
   - 可重放求於特定表型以調
4. 表之化：
   - 加新表元：加於宜之型，試而部
   - 除表元：先期警退，後除
   - 變表行：旗控，漸推

得：可維、可試、有文之表變之系。動性不傷其調、其文、其化之能。

敗則：若色胞層為調試之夢魘，加透明：每應含追頭（唯管／調型可見），示何表型已施與何境之信定之。

## 驗

- [ ] 觀者之地已圖，各觀者之表所須已定
- [ ] 色胞之圖譯境為表之設
- [ ] 行之多態使應隨觀者之境
- [ ] 攻面為敵觀者已減
- [ ] 各觀者型明試之
- [ ] 表敗模顯安默（極簡之表）
- [ ] 調／管模可察活之表設
- [ ] 表之文合實行

## 陷

- **表繁之爆**：觀者型過多、變過繁。合為三五之型。多者皆入廣類。
- **核污**：使表變之邏滲入核業之邏。色胞層必離——若核中有依觀者之 if-else，構誤也。
- **唯隱之安**：減表為深防之一層，非代正之安控。隱端仍須驗身與授權。
- **表不一**：觀者甲見一版，觀者乙見二版——而本當同見。明試諸表，守觀者—表之矩陣為定本。
- **忘敗之表**：色胞層自敗，觀者見何表？默必安（極簡），非開（全表）。

## 參

- `assess-form` — 表之變或解形察之壓而不必深變
- `adapt-architecture` — 表變不足時之深構之變
- `repair-damage` — 表變可掩傷於修中（慎用——勿藏實患）
- `defend-colony` — 攻面減為防之一層；偵察之察入防
- `coordinate-swarm` — 分布之系隨境之行須協之表變
- `configure-api-gateway` — API 之關實多色胞層之能
- `deploy-to-kubernetes` — Kubernetes 之服與入使網層之表控
