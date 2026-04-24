---
name: evaluate-levitation-mechanism
locale: wenyan-ultra
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

# 估浮法

以結構權衡，擇特用之最適浮法：定求、篩硬約、於軟準計分、錄決於可複權衡矩。

## 用

- 擇新品或試之浮法
- 較磁、聲、氣、電四法於非接取系
- 於技閱或提中證設計
- 求變後（如新載、環、費）重估舊浮系
- 細設前行可行性查

## 入

- **必**：用述（所浮為何、何以須非接）
- **必**：載性（質域、材、幾、溫感）
- **必**：運境（溫域、氣、潔、震）
- **可**：功預（可用瓦）
- **可**：費標（原、產）
- **可**：精求（位準、剛、震隔）
- **可**：壽與維約

## 行

### 一：定用求

估前先立全求：

1. **載規**：質（最小至最大）、尺、材、磁性（鐵磁？導？抗磁？）、溫限（耐冷凍？熱？）、面感（接觸致污或損？）
2. **性求**：浮隙（毫米至米）、載容、位準、剛（N/m）、阻尼、動域（靜持對控動）
3. **環約**：運境之溫、氣組（空、真空、惰、液）、潔級（半導、生、工）、聲限、EMC 求
4. **運約**：可用功、殼（浮系自身大與重）、維週、壽、操員技
5. **經約**：原費、產單費、發期

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

得：求表，各標為「Must have」（硬約，過/敗）或「Want」（軟準，依刻分）。至少 5 求已定。

敗：用述過模不能設量求→訪利者或行邊析：各參定最寬可接域。無定求進行致權衡任意或偏。

### 二：列候浮法

列待估之浮法及其運理與本限：

1. **被動抗磁浮**：用浮物（或抗磁穩定者）於永磁場之抗磁感。無需功。僅小載（毫克至克）及強抗磁材（熱解石墨、鉍）。室溫運
2. **主動電磁反饋**：含位感與實時控之電磁。處克至百噸（maglev 列）。續需功與控系。適鐵磁與導載
3. **超導浮**：II 型超導以磁通釘被動無功浮並本穩。需冷凍（YBCO 於 77 K 用液氮，常規超導用液氦）。載限於超導大與臨流。極剛
4. **聲駐波**：超聲換能生壓節困小物。載限亞波長物（空氣 40 kHz 中常 <5 mm）。續需驅功。任材皆可無視磁電性。生可聞諧波與聲流
5. **聲相陣**：駐波浮之擴，多獨控換能。能 3D 操與重位。複與費高而活多
6. **氣（氣軸）**：薄壓氣膜持物。用於精臺、氣桌、氣墊船。續需氣源。摩極低。精軸隙常 5-25 微米，氣墊船較大
7. **氣（Coanda/Bernoulli）**：氣噴過曲面生低壓區以懸物。簡廉。精與剛低。用於示與工業搬
8. **電（Coulomb）**：帶電極懸帶電或介物。力極低（微至毫牛）但真空中可用。用於空（引力波探、慣感）與 MEMS
9. **電（離子阱）**：振電場（Paul 阱）或靜+磁（Penning 阱）困帶電粒。用於單離子至納粒。主為原子物理與質譜之實驗法

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

得：列諸物理可行浮法及其本性。含至少 4 法，跨至少 2 物理原理。

敗：某法本限不確→查文或用關析技（analyze-magnetic-levitation、design-acoustic-levitation）於篩前立之。勿依猜而篩。

### 三：篩硬約

去不合「Must have」之法：

1. **各硬約為過/敗濾**：諸法察每「Must have」求。單敗即去
2. **常篩準**：
   - **質域**：載逾本質限→去（如聲浮不能處公斤載）
   - **材容**：載非磁而法需磁→去（如鐵磁物不能被動抗磁浮）
   - **溫**：環不可冷凍→去超導浮
   - **真空/氣**：真空境→去氣法。EMC 禁磁場→去磁法
   - **接**：氣軸需近平面（準接）。須真非接→去之
3. **去時注因**：錄去因以便求變時重估

```markdown
## Screening Results
| # | Mechanism | Pass/Fail | Eliminating Constraint | Reason |
|---|-----------|-----------|----------------------|--------|
| 1 | Passive diamagnetic | [P/F] | [constraint or N/A] | [reason] |
| 2 | Active EM feedback | [P/F] | [constraint or N/A] | [reason] |
| ... | ... | ... | ... | ... |
```

得：減候列，各過諸硬約。至少一存；宜 2-4 留待評分。

敗：無法過諸硬約→求相悖。鬆最不要「Must have」（改為「Want」）並重篩。須鬆多求→或須混法（如磁主氣穩）。

### 四：計分於軟準

以權矩排存法：

1. **定準與權**：各「Want」改為準。依相重賦權（如 1-5 或和為 100%）。常準：
   - **費**（原與單）
   - **繁**：件數、控電、對準要
   - **精**：位準、剛、震隔
   - **功耗**：運瓦、待瓦
   - **擴**：能處載域或大量產
   - **可控**：動調隙、位、剛之易
   - **熟**：技備度、商件可用
   - **噪**：聲、電、震
2. **各法計分**：各法於各準以一致刻（如 1=劣、3=足、4=善、5=優）。基量數於 1-3 步而勿主觀
3. **算權分**：各法各準分乘權後和。最高者為首候
4. **敏析**：前 2-3 權變 ±20%，察排變否。若排感於權擇→記並示替於決者

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

得：全分矩，諸準有權，諸法有分。排明，首候識。敏析證排韌（或記何脆）。

敗：兩法分差 <10%→紙上難定。建兩法皆原而依實選，或識破結之鑒試。

### 五：錄建與權衡

出末權衡報：

1. **建**：述建法，一段理引分與關鑒準
2. **次**：識次名並釋何況下為首選（此為退策）
3. **已去法**：簡列被去法與去約以全
4. **險與緩**：建法之前 3 技險與建緩
5. **下步**：定須何細設（引適析技：磁用 analyze-magnetic-levitation、聲用 design-acoustic-levitation 等）

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

得：自足之權衡文，他工可閱、質、行。建可追至求與分，非未述偏好。

敗：建不能僅依分證（如首法有準未捕之致命）→回一步加缺求。勿於不錄因時覆分。

## 驗

- [ ] 用求以量值與級分定
- [ ] 至少 4 法跨 2+ 物理原理已列
- [ ] 硬約篩一致施並錄去
- [ ] 至少 2 法存供有意較
- [ ] 準有明權且諸分有理
- [ ] 前 2-3 權因行敏析
- [ ] 建含可追至分矩之理
- [ ] 次與退策條件已錄
- [ ] 險與緩於建法已識
- [ ] 權衡足全使獨閱者可驗

## 忌

- **權衡前定錨於偏法**：自結起反推求或權以支之。治：定求與權於估任法前。若已知欲擇之法→權衡為驗非選——誠告之
- **漏生域**：磁背景工忽聲法反之亦然。初列必含四大族各至少一（磁、聲、氣、電），縱多將被篩去
- **硬軟約混**：以偏為硬約致可行法早去。唯真不可談之求（安、物理限、規）為硬約。餘皆計分
- **默平權**：諸準同權為決——意諸準同重。利者宜明定先級。若拒→用配對較（AHP）取隱權
- **忽系交互**：浮法不孤存。聲浮生噪或損鄰器。主磁浮發時變場或違 EMC。超導浮需冷凍基。於系境中估
- **無不確之單點分**：於費計「4」意假精。可則分為域（如「3-5」）並傳不確至末排。兩法分域重→排非定

## 參

- `analyze-magnetic-levitation` — 磁為建或候時之細析
- `design-acoustic-levitation` — 擇聲時之細設
- `analyze-magnetic-field` — 算磁估所需之磁場廓
- `argumentation` — 適權衡之結構推與決證技
