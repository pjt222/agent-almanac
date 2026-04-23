---
name: defend-colony
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Implement layered collective defense using alarm signaling, role mobilization,
  and proportional response. Covers threat detection, alert propagation, immune
  response patterns, escalation tiers, and post-incident recovery for distributed
  systems and organizations. Use when designing defense-in-depth where no single
  guardian covers all threats, building incident response that scales with severity,
  or when current defense is over-reactive to every alert or under-reactive to
  genuine threats.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: advanced
  language: natural
  tags: swarm, defense, immune-response, threat-detection
---

# 守巢

以警信、角動、比例應施分系、團、組之層群禦——取自社蟲巢禦與生免系。

## 用

- 為無單守可涵諸威之分系設深禦
- 築按威嚴擴之事應
- 保單件不能獨禦之系
- 現禦過應（每警全動）或不應（威未察至害成）
- 築員須自組應事之組韌
- 補 `coordinate-swarm` 含具威應調模

## 入

- **必**：所守巢（系、組、團）之述
- **必**：知威類（攻、敗、爭、境險）
- **可**：現禦機與敗模
- **可**：可守型與其能
- **可**：每威層可應延
- **可**：事後復需

## 行

### 一：映威景與禦界

識何須守、自何、界於何。

1. 定巢關資：
   - 不惜代價須守何？（核數、產系、要人）
   - 何可忍暫損？（分期境、非關服）
   - 極威時何可棄？（快、副、非要能）
2. 按型與嚴分威：
   - **Probes**：低級察或試（口掃、復敗登）
   - **Incursions**：活界違（未權訪、注試）
   - **Infestations**：界內持威（受損節、內威）
   - **Existential**：巢生威（數損、災敗、DDoS）
3. 映禦界：
   - 外界：首察機（牆、速限、監）
   - 內界：關資界（訪控、加密、隔）
   - 核：末禦（備、殺關、斷）

**得：** 資（優先）、威（按嚴分）、禦界（層）之明圖。此圖導諸後禦設。

**敗：** 威景感蓋→始於頂 3 關資與頂 3 威型。全覆不及覆要。界不明→默「信無、驗諸」（零信姿）而隨觀實流定界。

### 二：設警信網

築察威傳警之通系。

1. 各禦層置哨：
   - 外哨：輕、高感察（或生偽陽）
   - 內哨：重、高特察（少偽陽、慢）
   - 核哨：關資監（零忍漏威）
2. 定漸強警信：
   - **Yellow**：察異、增監、無動
   - **Orange**：確威模、地守動、斥察
   - **Red**：活破或嚴威、全禦動、非要暫
   - **Black**：生威、諸資至禦、需則棄可棄資
3. 施警傳：
   - 地：哨直警鄰守
   - 域：哨簇聚信、達閾則升
   - 巢廣：域升觸廣警
   - 各傳步加確——單哨不觸巢廣警
4. 築警疲防：
   - 自抑復同警（時窗去重）
   - 需獨哨升確
   - 追警威比——偽陽過 50%→哨再校

```
Alarm Propagation:
┌──────────────────────────────────────────────────────────┐
│ Sentinel detects anomaly ──→ Yellow alert (local)        │
│        │                                                 │
│        ↓ (confirmed by 2nd sentinel)                     │
│ Orange alert ──→ Local defenders mobilize                │
│        │                                                 │
│        ↓ (pattern matches known threat + 3rd sentinel)   │
│ Red alert ──→ Full defense mobilization                  │
│        │                                                 │
│        ↓ (critical asset under active attack)            │
│ Black alert ──→ All resources to defense, circuit break  │
└──────────────────────────────────────────────────────────┘
```

**得：** 威嚴定應強之漸警系。多獨哨確防單點偽警。警疲以去重與校管。

**敗：** 警系生過多偽陽→升哨閾或升前需更確。威漏→於被破層加哨或降察閾。警傳過慢→減確需、接高偽陽率為換。

### 三：動角基守

賦禦角與動協與威級比例。

1. 定守角：
   - **Sentinels**：察專（恆活、低資耗）
   - **Guards**：首應（動前閒、速應）
   - **Soldiers**：重守（動耗、高能）
   - **Healers**：損修與復專（見 `repair-damage`）
   - **Messengers**：跨巢域調禦
2. 映角至警級：
   - Yellow：哨增監頻、守備
   - Orange：守至威位動、兵備
   - Red：兵動、非要工轉禦
   - Black：諸角至禦、巢活暫
3. 施比例應：
   - 勿為探遣兵（費且露能）
   - 勿僅賴哨對侵（應不足）
   - 合應於威層——現層敗則升、威退則降
4. 角轉協：
   - 工可為守（急暫升）
   - 守可為兵（持威需重應）
   - 威過後反轉復常

**得：** 按威嚴擴之禦力。常操用最小禦資。威下巢可速動比例禦無過應亦無不應。

**敗：** 動過慢→預置守於知威徑近。動過耗→減常守力、更賴工至守轉。動中角惑→簡為 3 角（察、應、復）非 5。

### 四：行免憶與適

自每威遇學以進後禦。

1. 事後建威簽：
   - 攻模（如何察）
   - 攻徑（自何入）
   - 效應（何止）
   - 敗應（何無用）
2. 存簽於巢免憶：
   - 哨之速查模庫
   - 含知效應之守本
   - 標偽陽模以減後警疲
3. 施適免：
   - 新簽傳至諸哨（巢廣學）
   - 察威之哨先得更（地學）
   - 周評汰舊簽（不再適威）
4. 壓試免憶：
   - 周再擬過威驗禦仍行
   - 紅隊試引新威試適
   - 量知與未知威之察時

**得：** 每遇後更強之禦系。知威察更速應更效。新威以漸警系理、其解加於免憶。

**敗：** 免憶過大緩察→按頻與嚴優先簽、檔稀/輕威。禦過專知威而失新→守「泛巡」能不賴模配——純異察為基。

### 五：調事後復

自禦轉常操含損修與韌增。

1. 威除驗：
   - 確威消（非僅抑）
   - 察主事中或入之次威
   - 驗無受損代活
2. 損評：
   - 錄何損、退、失
   - 按關優先修（核資先）
   - 估復時與需資
3. 復行：
   - 遣癒至損區（見 `repair-damage`）
   - 按優先序復服
   - 復中保升哨活（脆期）
4. 降協：
   - 漸降警級（Red → Orange → Yellow → 常）
   - 轉工返主角
   - 止兵與守返巡
   - 憶鮮時 24 小時內事後評

**得：** 自禦至復至常操之順轉。復中升監接次威。事後評入學於免憶。

**敗：** 復過慢→為最可能損景預築復本。復中次威現→降過急、久保高警。事後評略（時壓下常）→排為不可議曆事。

## 驗

- [ ] 關資識與優先
- [ ] 威按型與嚴分
- [ ] 禦界含多層、各層含哨
- [ ] 警信含漸級與多哨確
- [ ] 守角定、動映至警級
- [ ] 比例應防過與不應
- [ ] 免憶取與施每事之教
- [ ] 事後復協安復常操

## 忌

- **Maginot 線禦**：過投單層禦而他層無守。禦須層——單層可破
- **警疲**：過多警含過少實威耗守注。校哨嚴；漏偽陽勝漏實威
- **對稱應**：每威以同強應費資露能。合應於威——需時方升
- **無免憶**：復對同威不學費而脆。每事須更巢禦知
- **恆戰姿**：持高警操耗守衰常巢能。威過則慎降

## 參

- `coordinate-swarm` — 支警信與動之基調模
- `build-consensus` — 時壓下集禦決之速共識
- `scale-colony` — 禦系須與巢長擴
- `repair-damage` — 禦事後生復之 morphic 技
- `configure-alerting-rules` — 施警信模之實警設
- `conduct-post-mortem` — 入免憶之結構事後析
