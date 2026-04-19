---
name: build-consensus
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Achieve distributed agreement without central authority using bee democracy,
  threshold voting, and quorum sensing. Covers proposal generation, advocacy
  dynamics, commitment thresholds, deadlock resolution, and consensus quality
  assessment. Use when a group must decide between options without a designated
  leader, when centralized decision-making is a bottleneck, when stakeholders
  have different perspectives to integrate, or when designing automated systems
  that must reach consensus such as distributed databases or multi-agent AI.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, consensus, quorum-sensing, distributed-agreement
---

# 建共識

無中央而於散將間達共—以偵倡、閾法定、委動—模於蜂群決。

## 用

- 群當擇諸選而無定導
- 中央決成瓶或單點敗
- 當事人有異訊與視角當整
- 昔決受群思（早收）或析癱（無收）
- 設自動系需達共（散庫、多將 AI）
- 輔 `coordinate-swarm` 於協需顯群決時

## 入

- **必**：當決之事（二擇、N 中擇、參設）
- **必**：參將（隊員、服、投者）
- **可**：知選附初質評
- **可**：決急（時預）
- **可**：可容誤率（群偶擇次佳乎？）
- **可**：當決敗模（群思、困、振）

## 行

### 一：獨偵生議

顯倡前先充探決空。

1. 派偵獨探選空：
   - 每偵評選而不知他偵所得
   - 獨評防早聚於流而庸之選
   - 偵數：最少每嚴選三偵（以穩）
2. 偵出結構評：
   - 選 ID
   - 質分（歸一 0-100 或類：劣/普/優/卓）
   - 所識要強與險
   - 信級（此選多徹評？）
3. 合偵報而不濾—過最低質閾之諸選皆入倡階

**得：** 獨評諸議附質分與評。無選由單評除；視角多存。

**敗：** 偵聚同選而非獨評→偵非真獨。以顯訊障重行。太多選過倡階→升最低質閾。太少→降或加偵。

### 二：行倡動（搖擺舞）

令偵倡所愛選，倡強依質比。

1. 每偵倡己頂選：
   - 倡強比質分（佳選得更烈倡）
   - 倡公—諸將觀諸倡號
   - 倡呈證與質評，非但偏
2. 未委將觀倡而評：
   - 跟倡選而獨察
   - 己察證質→加入倡
   - 察揭質低於所宣→不加
3. 互察動：
   - 弱選倡自失從—將獨驗而棄
   - 強選倡因證質而得從
   - 程自修：誇倡敗於驗步

```
Advocacy Dynamics:
┌─────────────────────────────────────────────────────────┐
│ Scout A advocates Option 1 (quality 85) ──→ ◉◉◉◉◉     │
│ Scout B advocates Option 2 (quality 70) ──→ ◉◉◉        │
│ Scout C advocates Option 3 (quality 45) ──→ ◉           │
│                                                         │
│ Uncommitted agents inspect:                             │
│   Agent D inspects Option 1 → confirms → joins ◉◉◉◉◉◉  │
│   Agent E inspects Option 2 → confirms → joins ◉◉◉◉    │
│   Agent F inspects Option 3 → disagrees → inspects Opt 1│
│                               → confirms → joins ◉◉◉◉◉◉◉│
│                                                         │
│ Over time: Option 1 advocacy grows, Option 3 fades      │
└─────────────────────────────────────────────────────────┘
```

**得：** 佳選倡經時而長—將獨驗質。弱選倡因驗敗而衰。群自聚於強選而無將令擇。

**敗：** 倡不聚（兩選並駕）→選或真等—以閾進或用破平律。倡過速聚於庸選→增評獨（多偵、嚴訊障）加強互察步。

### 三：設法定閾而委

定觸集行之委閾。

1. 設法定閾：
   - **簡決**：將之五成 + 1 委一選
   - **重決**：66-75% 委一選
   - **危/不可逆**：80%+ 委一選
   - 大法：重→閾高→共緩而穩
2. 監委積：
   - 跟每選委將數經時
   - 透示委級（諸將見當態）
   - 週中勿允撤委（防振）
3. 法定達：
   - 勝選為集決而採
   - 敗選倡者認決（無叛將）
   - 施即始—共後延耗委

**得：** 清法定時—足將獨委一選。決正因生於獨評，非權或強。

**敗：** 時預內法定不達→升步四（困解）。法定達而將不悅→倡階過短—將未充評而委。共事後發現誤→獨偵不足—次週增偵異與評徹。

### 四：解困

自然共程滯→破決堵。

1. 斷困類：
   - **真平**：兩選等佳→擲錢；延價逾擇「誤」等選
   - **訊缺**：將不能充評→增偵而後重行倡
   - **派成**：固派拒互察→加必轉令倡者察對選
   - **選泛**：過多選散委→除底五成重行倡
2. 施宜解：
   - 真平：隨擇或合選若容
   - 訊缺：時限偵展
   - 派成：迫互察輪
   - 選泛：排名淘
3. 解後重置法定鐘，重行步三

**得：** 困以宜預解。解顯而群認為公程，雖個將欲異果。

**敗：** 同決反復困→決框或誤。退問：決可分小獨決乎？範可減乎？有「試兩觀之」選乎？時共之佳乃「行時限試」。

### 五：評共質

評程生佳決，非但決。

1. 決後評：
   - 勝選由至少 N 將獨驗乎？
   - 決速宜乎（不快/群思、不緩/癱）？
   - 程揭單決者或遺之訊乎？
   - 將委施乎，抑但從？
2. 跟共健指：
   - **達法定時**：經續決而減示學；增示繁或失能
   - **偵委比**：每委需多偵？高比 = 繁決或低信
   - **決後悔率**：群多欲擇異？
3. 學回程：
   - 依決要與昔準調法定閾
   - 依選繁調偵數
   - 依昔達法定時調時預

**得：** 回饋環經時改共質。群學更效偵、更誠倡、更信委。

**敗：** 共質指劣（高悔、緩決）→審程之構敗：偵異不足、倡無驗、閾低於決類。重建具敗階，非修全程。

## 驗

- [ ] 議以獨偵生（無隨群）
- [ ] 倡強依所評質比
- [ ] 未委將獨驗倡選
- [ ] 法定閾宜於決要
- [ ] 法定達且決速施
- [ ] 困解機可用（雖未用）
- [ ] 決後質評已行

## 忌

- **略獨偵**：直跳倡生群思。共質全依獨評之質
- **平倡不平選**：諸選無論質皆同倡→程退為隨擇。倡必比所評質
- **撤委**：允將撤委生振。週中委→諸將守至週解
- **混共與全同**：共需足同，非全同。候 100%→永困
- **略敗側**：倡敗選之將有群需之訊。其慮當導施，雖不阻決

## 參

- `coordinate-swarm` — 支號基共機之基協框
- `defend-colony` — 集護決常需威下速共
- `scale-colony` — 群大顯變時共機當適
- `dissolve-form` — 形技控解，解前共至要
- `plan-sprint` — 衝規涉隊共於委範
- `conduct-retrospective` — 復盤乃程改共之一
- `build-coherence` — AI 自用變；映蜂群democracy 於單將多路推附信閾與困解
