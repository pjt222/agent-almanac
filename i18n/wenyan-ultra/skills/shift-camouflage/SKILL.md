---
name: shift-camouflage
locale: wenyan-ultra
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

# 變形

仿烏賊色細胞之適表也——多態介、隨境之為、旗、減攻面。表隨境變、核恆穩、減攻面、宜異觀者。

## 用

- 系需異介於異客（API 版、多租、按角）→用
- 減攻面、各觀者唯見所需→用
- 旗、漸放、A/B 測於介→用
- 系隨境變為而核不變→用
- 護內構於外耦（觀者耦表非構）→用
- 補 `adapt-architecture`：表變足而深變不需→用

## 入

- **必**：待適之系
- **必**：諸觀者及其異介需
- **可**：今介設與限
- **可**：威脅模（何宜匿何觀者？）
- **可**：旗系或漸放基
- **可**：性能限（動表生有耗）

## 行

### 一：圖觀者域

識誰交而各需何見。

1. 籍諸觀者：
   - 外用（終用、API 客、夥）
   - 內服（微服、背工、管工）
   - 敵（攻、爬、競）
   - 監（審、合規）
2. 各觀者定：
   - 所需見（必介）
   - 所不見（匿面）
   - 所期見（容介——或異於所需）
   - 何交（協、率、敏）
3. 建觀者-面陣：

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

得：全觀者域與各面需。為後設之本。

敗：觀者識不全→始於兩端：最權（管）與最限（敵）。設此二之面、後內推餘者。

### 二：設色細胞圖

建觀者境與面之配——「色細胞」層。

1. 定境訊：
   - 認身→定權級
   - 請來→地、網、應境
   - 旗→啟閉某面元
   - 時/段→部署期、營業時、維護窗
   - 載/健→降模或減面
2. 設面生則：
   - 各境訊組合定面元為：
     - **顯**：含於應/介
     - **匿**：全除（誤訊亦不洩存）
     - **變**：存而異（異模、簡資）
     - **餌**：故誤面元、敵境用
3. 行色細胞層：
   - 薄中介/代於核與觀者間
   - 各請評境訊
   - 施宜面配
   - 永不變核——唯濾、變表

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

得：色細胞圖譯境為面配。圖明、可審、與核分。

敗：圖過繁（境組過多）→簡為按角面：定 3-5 面（公、夥、管、內、最少）映諸觀者。

### 三：行為態變

使系為亦適境、非唯表。

1. 識境變之行為：
   - 應詳級（管詳、公簡）
   - 限率（夥寬、無名嚴）
   - 誤訊（內詳、外泛）
   - 資新（高即時、標緩存）
   - 功可用（測者全、通常穩）
2. 行為變體：
   - 各體為全測之路
   - 境定行體
   - 諸體共核而異於表與策
3. 旗整合：
   - 旗控啟某行體
   - 漸放：新為示某率觀者、漸增
   - 斷：自復安全為若新體致誤

得：系為適境——同核生宜異眾應。旗啟新為之漸放。

敗：態變致路過繁→合為流模：核→策層→表層。態變唯居策表、核保一。

### 四：減攻面

減敵可察、可交者。

1. 行最小面則：
   - 各觀者唯見所需——無多
   - 未認觀者見最少面
   - 誤訊勿洩內構（無棧、內路、版號）
2. 行主動減面：
   - 除默頁、頭、端口、揭技
   - 隨非要應特（時抖、頭序）
   - 全閉未用 API 端口（非匿——真關）
3. 行模式擾：
   - 變應特擊指紋
   - 入控不測於非功
   - 確功為定而面特變
4. 監偵察：
   - 偵探匿面之請模（列舉攻）
   - 警復訪不存端口（路模糊）
   - 跨會追、聯偵模（見 `defend-colony`）

得：最小攻面、敵不易定技、內構、匿能。偵察察追。

敗：減面害合客→觀者-面陣不全、合需被匿。覆步一更陣。隨致禍→唯隨非功（時、頭）、保功定。

### 五：保面恆

確動面恆、可調、可養。

1. 面測：
   - 各觀者面明測（管見管面？公見公面？）
   - 測面換（觀者境會中變何如？）
   - 測面敗模（色細胞層敗則何面顯？）
2. 面文：
   - 文各觀者面與其配
   - 文境訊與其於擇面之效
   - 文與真為齊（測文於實）
3. 調支：
   - 管/調模顯何面活、何故
   - 日記捕各請所施面配
   - 可重請於某面為調
4. 面演：
   - 加新面元：加於宜面、測、部
   - 除面元：警期、後除
   - 變面為：旗控、漸放

得：可養、可測、文全之適面系。動性不害調、文、演介之能。

敗：色細胞層成調夢魘→加透：各應含追頭（唯管/調可見）示何面施、何境訊定之。

## 驗

- [ ] 觀者域圖含各觀者面需
- [ ] 色細胞圖譯境為面配
- [ ] 態變使應適觀者境
- [ ] 攻面減於敵
- [ ] 各觀者面明測
- [ ] 面敗模顯安默（最少面）
- [ ] 調/管模可察活面配
- [ ] 面文與實為合

## 忌

- **面繁爆**：觀者面過多、變過繁。合至 3-5 面為極。多觀者皆入廣類
- **核污**：適面理入核業務。色細胞層必分——若於核加觀者類之 if，構誤也
- **唯靠遮掩**：減面為深防一層、非代正安控。匿端口仍需認、授
- **面不恆**：觀者甲見應 v1、乙見 v2——而本應同。明測面、保陣為憑
- **忘敗面**：色細胞層自敗、觀者見何面？默必安（最少面）非開（全面）

## 參

- `assess-form` — 適面或解所識壓而不需深變
- `adapt-architecture` — 深構變、適面不足時
- `repair-damage` — 適面或掩傷於修中（慎——勿匿真患）
- `defend-colony` — 減攻面為防一層；偵察識入防
- `coordinate-swarm` — 散系隨境之為需協適面
- `configure-api-gateway` — API 網實多色細胞層之能
- `deploy-to-kubernetes` — Kubernetes 服與入口啟網層面控
