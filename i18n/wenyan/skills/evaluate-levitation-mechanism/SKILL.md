---
name: evaluate-levitation-mechanism
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evaluate and compare levitation mechanisms for a given application through
  a structured trade study. Covers magnetic (passive diamagnetic, active
  feedback, superconducting), acoustic (standing wave, phased array),
  aerodynamic (hovercraft, air bearings, Coanda effect), and electrostatic
  (Coulomb suspension, ion traps) mechanisms. Use when selecting the most
  appropriate levitation approach for transport, sample handling, display,
  bearings, or precision measurement applications.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: levitation
  complexity: intermediate
  language: natural
  tags: levitation, mechanism-selection, trade-study, magnetic, acoustic, aerodynamic, electrostatic
---

# 評浮制

於某用擇最宜浮制：立求、以硬限篩選、以軟準評留者、記決於可復之權衡表。

## 用時

- 為新品或新試擇浮制
- 較磁、聲、氣、靜電之選於無觸操系
- 技審或擬議中證設計之擇
- 需易時（新載、環、費）再評現系
- 於詳設前作可行研

## 入

- **必要**：用述（浮何、何以須無觸懸）
- **必要**：載之性（質域、材、形、溫敏）
- **必要**：運環（溫域、氣、潔、振）
- **可選**：功率預（可用瓦）
- **可選**：費目標（樣與產）
- **可選**：精求（位精、剛、隔振）
- **可選**：壽與維之限

## 法

### 第一步：立用求

評制前先立全求：

1. **載規**：質（最小至最大）、尺、材、磁性（鐵磁乎？導乎？逆磁乎？）、溫限（耐冷溫乎？耐熱乎？）、面敏（觸致污或損乎？）
2. **性能求**：浮距（mm 至 m）、載能、位精、剛（N/m）、阻、動域（靜持對控動）
3. **環限**：運環之溫域、氣成（空氣、真空、惰氣、液）、潔級（半導體廠、生物、工業）、聲限、電磁兼容（EMC）求
4. **運限**：可用功、形包絡（浮系自身之大與重）、維隔、壽、操者技級
5. **經限**：樣費、產單位費、開程

```markdown
## Requirements Summary
| Category | Requirement | Value | Priority |
|----------|------------|-------|----------|
| Payload mass | Range | [min - max] kg | Must have |
| Payload material | Magnetic class | [ferro/para/dia/non-magnetic] | Must have |
| Gap | Levitation height | [value] mm | Must have |
| Precision | Position accuracy | [value] um | Want |
| Temperature | Operating range | [min - max] C | Must have |
| Power | Budget | [value] W | Want |
| Cost | Unit cost target | [value] | Want |
| Environment | Cleanliness | [class or none] | Must have |
| Noise | Acoustic limit | [value] dB | Want |
| EMC | Field emission limit | [value or none] | Want |
```

**得：** 求之表，各求類為「必」（硬限，過/不過）或「欲」（軟準，按尺評）。至少五求。

**敗則：** 若用述過模糊而不能立量求，訪相關者或作邊界析：各參立最鬆可接域。無求即作權衡，致任意或偏。

### 第二步：列制候選

列欲評諸浮制及其原理與本限：

1. **被動逆磁**：用物（或逆磁穩者）於永磁場之逆磁率。無需功。唯小載（毫克至克）及強逆磁材（熱解石墨、鉍）。室溫運

2. **主動電磁反饋**：電磁附位感與實時控。載克至百噸（磁浮車）。需續功與控系。鐵磁或導載

3. **超導浮**：II 型超導以磁通釘提被動無功浮，本穩。需冷凍（YBCO 用液氮 77K，常超導用液氦）。載限於超導大與臨界流。極剛

4. **聲駐波**：超聲換能器生壓節捕小物。載限於亞波長（空氣 40 kHz 時通常 < 5 mm）。需續驅功。諸材皆可，不論磁電。生可聽諧與聲流

5. **聲相陣**：駐波之擴，多獨控換能器。能 3D 操與再置。繁費高而靈

6. **氣（空氣軸承）**：壓氣薄膜托物。用於精台、氣墊球、氣墊船。需續氣供。極低摩。精軸承距 5-25 微米，氣墊船更大

7. **氣（Coanda/伯努利）**：氣射過曲面生低壓懸物。簡廉。精剛低。用於示與某些工操

8. **靜電（庫侖）**：帶電極懸帶電或介質物。力極低（微牛至毫牛）而可於真空。用於空間（引力波測、慣性感）與 MEMS

9. **靜電（離子阱）**：振電場（Paul 阱）或靜與磁場（Penning 阱）限帶電粒。用於單離子至納粒。主為原子物理與質譜之實驗技

```markdown
## Candidate Mechanisms
| # | Mechanism | Payload Range | Power | Temperature | Any Material? |
|---|-----------|--------------|-------|-------------|--------------|
| 1 | Passive diamagnetic | mg - g | None | Room temp | No (diamagnetic only) |
| 2 | Active EM feedback | g - 100+ t | Continuous | Room temp | No (ferro/conductive) |
| 3 | Superconducting | g - kg | Cryocooler | < 77 K | No (above SC) |
| 4 | Acoustic standing wave | ug - g | Continuous | Room temp | Yes |
| 5 | Acoustic phased array | ug - g | Continuous | Room temp | Yes |
| 6 | Air bearing | g - t | Air supply | Room temp | Yes |
| 7 | Coanda/Bernoulli | g - kg | Air supply | Room temp | Yes |
| 8 | Electrostatic Coulomb | ug - mg | Minimal | Any (vacuum ok) | No (charged/dielectric) |
| 9 | Ion trap | atoms - ug | RF power | Any (vacuum) | No (ions only) |
```

**得：** 諸物理合理之制之清單，附其本性摘。至少四制跨二物理原理。

**敗則：** 若制之本限不確，查獻或用相關析技（analyze-magnetic-levitation、design-acoustic-levitation）立之，再進篩。勿以猜篩。

### 第三步：以硬限篩

去諸失「必」求之制：

1. **各硬限以過/不過濾**：於各制察各「必」求。一敗即去
2. **常篩準**：
   - **質域**：若載逾制之本質限，去之（如聲浮不能處千克）
   - **材兼容**：若載非磁而制需磁材，去之（如不能以被動逆磁浮鐵磁物）
   - **溫**：若環不能用冷凍，去超導浮
   - **真空/氣**：若環為真空，去氣制。若 EMC 禁磁場，去磁制
   - **觸**：空氣軸承需近平面（近觸）。若需真無觸，去之
3. **記去者附因**：記各去制何以敗，以便求易時復察

```markdown
## Screening Results
| # | Mechanism | Pass/Fail | Eliminating Constraint | Reason |
|---|-----------|-----------|----------------------|--------|
| 1 | Passive diamagnetic | [P/F] | [constraint or N/A] | [reason] |
| 2 | Active EM feedback | [P/F] | [constraint or N/A] | [reason] |
| ... | ... | ... | ... | ... |
```

**得：** 減後之候制，各過諸硬限。至少一存；理想留 2-4 供評。

**敗則：** 若無制過諸硬限，求互斥。鬆最不關之「必」為「欲」再篩。若多求須鬆，用或需混法（如磁主力與氣穩）。

### 第四步：以軟準評

以權重評表排留制：

1. **定評準與權**：轉各「欲」求為評準。賦權反重（如 1-5 級或百分權和 100%）。常準含：
   - **費**（樣與單位）：按經敏權
   - **繁**：件數、控電、校敏
   - **精**：位精、剛、隔振質
   - **功**：運瓦、待機瓦
   - **可擴**：處諸載域或量產之能
   - **可控**：動調距、位、剛之易
   - **成熟**：TRL、商件可得
   - **噪**：聲、電磁、振之放
2. **各制評**：於各準以齊尺評（如 1 = 劣、3 = 足、5 = 優）。基於一至三步之量數，非主觀
3. **算權分**：各制各準分乘權和之。最高者為首候
4. **敏析**：首 2-3 權 +/- 20% 變，察排是否易。若排敏於權，標之並呈替於決者

```markdown
## Scoring Matrix
| Criterion | Weight | Mech A | Mech B | Mech C |
|-----------|--------|--------|--------|--------|
| Cost | [w1] | [s1A] | [s1B] | [s1C] |
| Complexity | [w2] | [s2A] | [s2B] | [s2C] |
| Precision | [w3] | [s3A] | [s3B] | [s3C] |
| Power | [w4] | [s4A] | [s4B] | [s4C] |
| Scalability | [w5] | [s5A] | [s5B] | [s5C] |
| Controllability | [w6] | [s6A] | [s6B] | [s6C] |
| Maturity | [w7] | [s7A] | [s7B] | [s7C] |
| **Weighted Total** | | **[T_A]** | **[T_B]** | **[T_C]** |
| **Rank** | | [rank] | [rank] | [rank] |
```

**得：** 全評表，諸準權諸制評。明排現，首候識。敏析確排穩（或記脆處）。

**敗則：** 若二制分差不足 10%，紙上難決。薦二者並樣，按實選，或識破平之辨試。

### 第五步：記薦與權衡報

生末權衡研報：

1. **薦**：述薦制附一段理，引評結與關辨準
2. **次者**：識次制並述何變下其為佳（為後備）
3. **去制**：簡列去制與其失限以全
4. **險與減**：於薦制識首三技險與擬減
5. **次步**：指詳設工（引適析技：analyze-magnetic-levitation 於磁、design-acoustic-levitation 於聲等）

```markdown
## Trade Study Summary

### Recommendation
**[Mechanism name]** is recommended for [application] because [2-3 sentence justification
referencing the key scoring advantages].

### Runner-Up
**[Mechanism name]** would be preferred if [condition changes, e.g., "cryogenics become
available" or "payload mass decreases below X grams"].

### Eliminated Mechanisms
- [Mechanism]: eliminated by [constraint]
- [Mechanism]: eliminated by [constraint]

### Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [action] |
| [Risk 2] | [H/M/L] | [H/M/L] | [action] |
| [Risk 3] | [H/M/L] | [H/M/L] | [action] |

### Next Steps
1. [Detailed analysis using specific skill]
2. [Prototype or simulation task]
3. [Experimental validation milestone]
```

**得：** 自含權衡文，另工得審、疑、行之。薦可溯至求與評，非隱偏。

**敗則：** 若薦僅評難證（如首制有評不能捕之致命），返一步加缺求。勿不記因而越評。

## 驗

- [ ] 用求以量值與優先類定
- [ ] 至少四制跨 2+ 物理原理列
- [ ] 硬限篩一致施附去記
- [ ] 至少二制過篩供較
- [ ] 評準有明權，諸評有理
- [ ] 首 2-3 權因作敏析
- [ ] 薦附理可溯評表
- [ ] 次者與後備條件已記
- [ ] 薦制之險與減已識
- [ ] 權衡報足以獨審驗

## 陷

- **先錨於偏制**：以結為始，反工求或權以援之。治：於評前立求與權。若已知欲何制，則為驗而非擇——誠實對此
- **略不熟域**：磁背景之工忽聲；反之亦然。始列必含四大家（磁、聲、氣、靜電）各至少一制，雖多將篩去
- **混硬軟**：視偏為硬限早去可行。唯真不可讓之求（安、物理限、法規）當為硬。餘當評
- **默齊權**：賦諸準同權即決也——意諸準同重。相關者宜明優先。若拒，以成對較（AHP）引隱權
- **略系級互動**：浮制不獨存。聲浮之噪或影鄰器。主動磁浮放時變場或違 EMC。超導浮需冷凍設施。於系脈絡評制
- **點評無不定**：評費為「4」示偽精。若可，以域（「3-5」）評並傳不定於末排。若二制分域疊，排非定

## 參

- `analyze-magnetic-levitation` — 磁浮為薦或候制時之詳析
- `design-acoustic-levitation` — 擇聲浮時之詳設
- `analyze-magnetic-field` — 算磁浮評所需磁場形
- `argumentation` — 結構推理與決證，適權衡研
