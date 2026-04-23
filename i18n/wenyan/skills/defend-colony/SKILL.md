---
name: defend-colony
locale: wenyan
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

# 禦巢

以警訊、角調、比例應，施層之集體禦於散系、團、組——汲社昆禦與生免疫之式。

## 用時

- 為散系設深禦，無一護可覆諸脅
- 建依脅之嚴而尺之事應流
- 守個構件不能獨禦之系
- 現禦過應（每警全調）或應不足（脅害乃察）
- 建組韌性，團於事時自組
- 補 `coordinate-swarm` 以脅應專協式

## 入

- **必要**：所禦巢（系、組、團）之述
- **必要**：既知脅類（攻、敗、競、環險）
- **可選**：當禦與其敗模
- **可選**：可用禦者類與其能
- **可選**：每脅級可容應遲
- **可選**：事後復需

## 法

### 第一步：映脅景與禦界

識所禦者、禦之何、界何在。

1. 定巢之要資：
   - 何皆需護？（核數、產系、要人）
   - 何可臨時損？（臺境、非要服）
   - 何可於極脅棄？（緩、副、非要能）
2. 按類與嚴別脅：
   - **探**：低級偵或試（端掃、重複敗登）
   - **侵**：活界犯（未授訪、注試）
   - **已居**：已於界內之持脅（陷節、內鬼）
   - **存**：危巢存之脅（數腐、災敗、DDoS）
3. 映禦界：
   - 外界：首察機（防火、率限、監）
   - 內界：要資之界（訪控、加密、隔）
   - 核：末禦（備、斷、斷路）

**得：** 清圖示資（優先）、脅（按嚴別）、禦界（層）。此圖導後禦設。

**敗則：** 若脅景壓，始以前三要資與前三脅。全覆不如覆要。若界不清，默「不信一切、皆驗」（零信態）而依實流式定界。

### 第二步：設警訊網

建察脅而播警之通系。

1. 於每禦層置哨：
   - 外哨：輕、高感（或生偽陽）
   - 內哨：重、高特（少偽陽、較慢）
   - 核哨：要資監（零容漏）
2. 定警訊以漸強：
   - **黃**：察異常，增監，無調
   - **橙**：確脅式，本禦調，偵察之
   - **紅**：活破或嚴脅，全禦調，非要事停
   - **黑**：存脅，諸資至禦，需則棄可棄資
3. 施警播：
   - 本：哨直警近禦
   - 區：哨簇聚訊，過閾則升
   - 巢域：區升觸廣警
   - 每播加確——單哨不能觸巢域警
4. 防警疲：
   - 自抑重警（時窗內去重）
   - 需獨哨確而升
   - 追警對脅比——若偽陽過 50%，重校哨

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

**得：** 漸警系，脅嚴定應強。多獨哨確防單點偽警。以去重與校管警疲。

**敗則：** 若警系生偽陽過，升哨閾或需多確而升。若脅漏，於穿層加哨或降察閾。若警播過慢，減確——而受偽陽率增為換。

### 第三步：調角禦

派禦角與與脅級成比之調法。

1. 定禦角：
   - **哨**：察專（常活，低資費）
   - **衛**：首應（閒至調，速應）
   - **兵**：重禦（調費，高能）
   - **醫**：損修復（參 `repair-damage`）
   - **使**：跨巢區調禦
2. 映角至警級：
   - 黃：哨增頻，衛待
   - 橙：衛調至脅位，兵待
   - 紅：兵調，非要工轉禦
   - 黑：諸角至禦，巢事懸
3. 施比例應：
   - 勿為探調兵（費且洩能）
   - 勿獨哨禦侵（應不足）
   - 應合脅級——當前級敗乃升，脅退乃降
4. 角轉法：
   - 工可成衛（急臨時升）
   - 衛可成兵（持脅需重應）
   - 脅過後反轉復常

**得：** 尺於脅嚴之禦力。常事用最小禦資。脅時巢可速調比例禦，無過應或應不足。

**敗則：** 若調過慢，預置衛近已知脅向。若調過費，減永衛而賴工至衛轉。若調時角混，簡為三角（察、應、復）非五角。

### 第四步：施免疫記憶與適應

由每脅學以改後禦。

1. 每事後建脅簽：
   - 攻式（脅察之法）
   - 攻向（由何入）
   - 有效應（何止之）
   - 敗應（何不行）
2. 存簽於巢免疫記憶：
   - 哨之速查式庫
   - 更禦者劇本含已知有效應
   - 標偽陽式以減後警疲
3. 施適免疫：
   - 新脅簽播至諸哨（巢域學）
   - 察脅之哨先更（本地學）
   - 周期察剔陳簽（不再適之脅）
4. 壓試免疫記憶：
   - 周期再模擬昔脅驗禦猶行
   - 紅隊練引新脅試適應
   - 量已知與未知脅之察時

**得：** 每遭強之禦系。已知脅察速而應效。新脅由漸警系處，其解入免疫記憶。

**敗則：** 若記憶過大而緩察，按頻嚴排簽，存罕微。若禦過專於已知而失新，守「通巡」不賴式配——純異常察為基。

### 第五步：協事後復

由禦轉常含損修與韌增。

1. 脅除驗：
   - 確脅中和（非唯壓）
   - 掃主事時可入之次脅
   - 驗無陷行者留活
2. 損察：
   - 記損、劣、失
   - 按要排修（核資先）
   - 估復時與所需資
3. 復執：
   - 布醫於損域（詳參 `repair-damage`）
   - 按優復服
   - 復時守增哨活（脆弱期）
4. 降級法：
   - 漸降警級（紅→橙→黃→常）
   - 返轉工至主角
   - 兵下而衛返巡
   - 24 小時內作事後察，憶尚新

**得：** 禦至復至常之順轉。復時增監捕次脅。事後察饋免疫記憶。

**敗則：** 若復過慢，為最可能損景預建復劇。若復時現次脅，降過急——守高級久。若事後察略（時壓常然），排為不可議曆事。

## 驗

- [ ] 要資已識排優先
- [ ] 脅按類與嚴別
- [ ] 禦界有多層各有哨
- [ ] 警訊有漸級含多哨確
- [ ] 禦者角定含調映警級
- [ ] 比例應防過與不足應
- [ ] 免疫記憶捕而施每事之教
- [ ] 事後復法安復常

## 陷

- **馬奇諾禦**：過投一禦層而他不護。禦須層——單層可破
- **警疲**：警多實脅少則禦注降。嚴校哨；漏偽陽廉於漏實脅
- **對稱應**：每脅同強應費資且顯全能。應合脅——需乃升
- **無免疫記憶**：反復禦同脅而不學費而脆。每事須更巢禦知
- **常戰態**：持高警耗禦而降常巢能。脅過則慎降

## 參

- `coordinate-swarm` — 支警訊與調之基協式
- `build-consensus` — 時壓下之速集體禦決共識
- `scale-colony` — 禦系須尺於巢長
- `repair-damage` — 禦事後再生復之變形技
- `configure-alerting-rules` — 施警訊式之實警配
- `conduct-post-mortem` — 為饋免疫記憶之結構事後析
