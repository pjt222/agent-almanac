---
name: evaluate-levitation-mechanism
locale: wenyan-lite
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

# 評浮升機制

為特定應用擇最宜之浮升機制：定需求、以硬約束篩候選、以軟標準評倖存者，並於可復現之權衡研究矩陣中記其決定。

## 適用時機

- 為新產或實驗擇浮升法
- 為無接觸處理系統比磁、聲、氣動、靜電諸選
- 於技術審或提案中證設計之決
- 需求變時（如新負載、環境或成本目標）再評既有浮升系統
- 於投入詳設計前行可行性研究

## 輸入

- **必要**：應用描述（所浮者為何、何以需無接觸懸浮）
- **必要**：負載屬性（質量範圍、材料、幾何、溫感）
- **必要**：運行環境（溫度範圍、氣氛、潔淨度、振動）
- **選擇性**：功率預算（可用瓦）
- **選擇性**：成本目標（原型與量產）
- **選擇性**：精度需求（定位準、剛度、隔振）
- **選擇性**：壽命與維護約束

## 步驟

### 步驟一：定應用需求

於評任何機制前定全需求之集：

1. **負載規範**：質量（自最小至最大之範圍）、尺寸、材料組成、磁性（是否鐵磁？導電？抗磁？）、溫度限（可耐低溫？加熱？）、表面敏感（接觸是否致污染或損）。
2. **效能需求**：浮升間距（mm 至 m）、承載、定位準、剛度（N/m）、阻尼、動態範圍（靜持 vs 受控動）。
3. **環境約束**：運行環境之溫度範圍、大氣組成（空氣、真空、惰氣、液）、潔淨等級（半導體 fab、生物、工業）、聲噪限、電磁相容（EMC）需求。
4. **運行約束**：可用功率、物理封包（浮升系統本身之大小與重）、維護間隔、壽命、操作者技能等。
5. **經濟約束**：原型成本、量產單位成本、開發時程。

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

**預期：** 需求表，每需求分為「Must have」（硬約束，過/敗）或「Want」（軟標準，以分標評）。至少定 5 需求。

**失敗時：** 若應用定義過泛不能設定量需求，訪利害關係人或行邊界分析：定各參數可接受之最寬範圍。無已定需求而行之導致權衡研究武斷或有偏。

### 步驟二：錄候選機制

列待評之浮升機制及其運行原理與基本限：

1. **被動抗磁浮升**：用所浮物（或抗磁穩定器）於永磁場中之抗磁磁化率。無需功率。限於小負載（毫克至克）且強抗磁材料（熱解石墨、鉍）。室溫運行。

2. **主動電磁反饋**：帶位置感測器與實時控制器之電磁鐵。處理自克至數百噸之負載（maglev 列車）。需連續功率與控制系統。適用於鐵磁與導電負載。

3. **超導浮升**：帶磁通釘扎之 II 型超導體提供被動、無功之浮升，具本徵穩定。需低溫冷卻（YBCO 77 K 需液氮，常規超導體需液氦）。負載限於超導體尺寸與臨界電流。極剛。

4. **聲駐波**：超聲換能器建壓力節點以陷小物。負載限於次波長物（於 40 kHz 空氣中典型 < 5 mm）。需連續驅動功率。不論磁或電性皆可。生可聞諧波與聲流。

5. **聲相控陣**：駐波浮升之擴，用多獨立控之換能器。可行三維操作與重定位。複雜與成本較高但靈活得多。

6. **氣動（空氣軸承）**：加壓空氣之薄膜支物。用於精密臺、氣墊桌、氣墊船。需連續供氣。極低摩。精密軸承間距典型 5-25 微米，氣墊船更大。

7. **氣動（Coanda/Bernoulli）**：空氣射流導向曲面建低壓區以懸物。簡便而廉。精度與剛度低。用於演示與某工業處理。

8. **靜電（庫侖）**：帶電電極懸帶電或介電物。力極低（微至毫牛）但可於真空用。用於空間應用（引力波探測、慣性感測）與 MEMS。

9. **靜電（離子陷阱）**：振蕩電場（Paul trap）或合靜磁場（Penning trap）限帶電粒子。用於單離子至奈米顆粒。主要為原子物理與質譜之實驗室技。

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

**預期：** 含所有物理上可行之機制之目錄，其基本特性已摘。至少 4 機制跨至少 2 不同物理原理。

**失敗時：** 若機制之基本限不定，查文獻或用相關分析技（analyze-magnetic-levitation、design-acoustic-levitation）以定之，然後進篩選。勿以猜度而篩。

### 步驟三：對硬約束篩

汰任「Must have」之需求不過之機制：

1. **將各硬約束為過/敗濾**：對目錄中之每一機制，檢各「Must have」需求。一敗即汰之。
2. **常篩標準**：
   - **質量範圍**：若負載逾機制之基本質量限則汰（如聲浮不能處理公斤負載）。
   - **材料相容**：若負載非磁而機制需磁性材料則汰（如鐵磁物之被動抗磁浮升不可行）。
   - **溫度**：若低溫於運行環境不可行，汰超導浮升。
   - **真空/大氣**：若環境為真空，汰氣動機制。若 EMC 需無磁場，汰磁機制。
   - **接觸**：空氣軸承需近平面（準接觸）。若真無接觸所需則汰之。
3. **記汰之原因**：記各已汰機制為何敗，以便於需求變時重審決定。

```markdown
## Screening Results
| # | Mechanism | Pass/Fail | Eliminating Constraint | Reason |
|---|-----------|-----------|----------------------|--------|
| 1 | Passive diamagnetic | [P/F] | [constraint or N/A] | [reason] |
| 2 | Active EM feedback | [P/F] | [constraint or N/A] | [reason] |
| ... | ... | ... | ... | ... |
```

**預期：** 縮減之候選機制清單，各已過所有硬約束。至少一機制過篩；理想 2-4 留供評分。

**失敗時：** 若無機制過所有硬約束，則需求相互矛盾。鬆最不關鍵之「Must have」需求（改為「Want」）並再篩。若需鬆多需求，應用或需合二機制之混合法（如磁主力配氣動穩定）。

### 步驟四：以軟標準評分

以加權評分矩陣排倖存之機制：

1. **定評分標準與權**：將各「Want」需求轉為評分標準。賦權以示相對重要（如 1-5 標，或加至 100% 之百分比權）。常標含：
   - **成本**（原型與單位）：以經濟敏感度加權
   - **複雜**：組件數、控電子、對齊關鍵性
   - **精度**：定位準、剛度、隔振品質
   - **功耗**：運行瓦、待機瓦
   - **可擴**：處理負載範圍或量產之能
   - **可控**：動態調間距、位置或剛度之易
   - **成熟**：技術成熟度等級、商用組件之可得
   - **噪**：聲、電磁或振動排放
2. **評各機制**：以一致之標（如 1 = 差、3 = 可、5 = 優）評各倖存機制於各標準。若可則依步驟一至三之定量數據，非主觀偏好。
3. **算加權總**：對各機制，乘各標準分以其權並加之。加權分最高者乃首候選。
4. **靈敏度分析**：使首 2-3 權 +/- 20% 並察排序是否變。若排序敏於權之擇，標之並呈替代於決策者。

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

**預期：** 完整評分矩陣，所有標準已加權且所有機制已評分。明排序呈現，首候選已識。靈敏度分析確排序穩健（或記其脆處）。

**失敗時：** 若二機制分相差 10% 內，紙上決定過近。建議原型化兩者並依實驗效能擇之，或識一可破平之辨別性測試。

### 步驟五：記建議與權衡研究

出最終權衡研究報告：

1. **建議**：以一段式理由陳所建議之機制，引評分結果與關鍵辨別標準。
2. **次位**：識次位機制並解其於何條件變時會成首選（此為回退計）。
3. **已汰機制**：略列已汰機制及其失格約束以求完整。
4. **風險與緩解**：為所建議之機制識首三技術風險及建議之緩解。
5. **下一步**：指所需之詳設計工作（引合適之分析技：磁性用 analyze-magnetic-levitation、聲用 design-acoustic-levitation 等）。

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

**預期：** 自足之權衡研究文檔，另一工程師可審、質、行之。建議可追於需求與評分，非於未明之偏好。

**失敗時：** 若建議不能唯以評分證（如首分機制有已知之破局而標準未捕之），回步驟一加缺需求。勿越評分而不記其因。

## 驗證

- [ ] 應用需求以定量值與優先分類已定
- [ ] 至少 4 浮升機制跨 2+ 物理原理已錄
- [ ] 硬約束篩已一致施，汰已記
- [ ] 至少 2 機制過篩以為有意之比
- [ ] 評分標準有明權，所有分已證
- [ ] 對首 2-3 權因子已行靈敏度分析
- [ ] 建議含可追於評分矩陣之理由
- [ ] 次位與回退條件已記
- [ ] 為所建議之機制已識風險與緩解
- [ ] 權衡研究完整至獨立審者可驗之度

## 常見陷阱

- **於權衡研究前錨於所偏好之機制**：以結論始而逆工程需求或權以支之。解為於評任何機制前定需求與權。若爾已知欲何機制，則權衡研究為驗證之演練，非選擇——於此宜誠。
- **略不熟域之機制**：具磁背景之工程師忽聲選項，反之亦然。恒於初始目錄中納四大族（磁、聲、氣動、靜電）各至少一機制，縱多將遭篩。
- **混硬軟約束**：以偏好為硬約束則過早汰可行選。唯真不可議之需求（安全、物理限、監管）方為硬約束。餘皆應評分。
- **預設平均加權**：予所有標準同權亦為決定——其意所有標準同等重要。利害關係人應明排序。若拒，用成對比（AHP）以誘隱權。
- **忽系統級交互**：浮升機制不獨存。聲浮生可能影響近器之噪。主動磁浮射時變場可能違 EMC 需求。超導浮升需低溫基礎設施。於其系統語境內評之。
- **無不確性之單點評分**：評機制於成本為「4」意假精度。若可，分以範圍（如「3-5」）表之並傳不確性至最終排序。若二機制分範圍重疊，則排序非決定性。

## 相關技能

- `analyze-magnetic-levitation` — 當磁浮為所建議或候選機制時之詳析
- `design-acoustic-levitation` — 擇聲浮時之詳設計
- `analyze-magnetic-field` — 算磁浮評估所需之磁場剖面
- `argumentation` — 可用於權衡研究之結構化推理與決定之證明技
