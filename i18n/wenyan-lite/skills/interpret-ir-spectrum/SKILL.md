---
name: interpret-ir-spectrum
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematically interpret infrared spectra to identify functional groups
  present in a sample. Covers diagnostic region analysis (4000-1500 cm-1),
  fingerprint region assessment (1500-400 cm-1), hydrogen bonding effects,
  and compilation of a functional group inventory with confidence levels.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, ir, infrared, functional-groups, absorption
---

# 解讀紅外光譜

分析紅外吸收光譜以識別官能團、評氫鍵，並編樣品所含結構特徵之完整清單。

## 適用時機

- 首篩未知化合物中之官能團
- 確特定官能團之存或缺（如驗反應將醇轉為酮）
- 以特徵吸收之現或失監反應進度
- 別官能團內容異之相似化合物
- 以振動信息補 NMR 與質譜數據

## 輸入

- **必要**：IR 光譜數據（cm-1 之吸收頻率與強度，為 %透射或吸光度圖）
- **必要**：樣品製備法（KBr 壓片、ATR、Nujol 糊、薄膜、溶液池）
- **選擇性**：分子式或預期化合物類
- **選擇性**：自他光譜數據得之已知結構片段
- **選擇性**：儀器參數（分辨率、掃描範圍、檢測器類）

## 步驟

### 步驟一：立光譜品質與格式

分析峰之前，驗光譜適於解讀：

1. **查 y 軸格式**：定光譜繪為 %透射（%T，峰向下）或吸光度（A，峰向上）。後續分析皆假定一致慣例
2. **驗波數範圍**：確光譜涵標準中紅外分析之至少 4000--400 cm-1。記任何截斷
3. **評基線**：好基線於無吸收域當相對平而近 100%T（或 0 吸光度）。傾斜或噪基線降可靠度
4. **查分辨率**：鄰峰距小於儀器分辨率者不能分辨。常 FTIR 分辨率為 4 cm-1
5. **識製備偽影**：KBr 壓片或顯吸濕之寬 O-H 帶（~3400 cm-1）。Nujol 糊遮 C-H 伸縮。ATR 光譜於低波數示強度失真。記任何限解讀之偽影

**預期：** 確光譜適分析，格式、範圍與偽影已記錄。

**失敗時：** 若光譜有嚴重基線問題、飽和（過濃樣品之平底峰），或遮關鍵域之製備偽影，記此限並標受影響光譜域為不可靠。

### 步驟二：掃診斷區（4000--1500 cm-1）

系統分析多數官能團產特徵吸收之高頻區：

1. **O-H 伸縮（3200--3600 cm-1）**：尋寬吸收。近 3600 cm-1 之尖峰示自由 O-H；3200--3400 cm-1 中心之寬帶示氫鍵之 O-H（醇、羧酸、水）
2. **N-H 伸縮（3300--3500 cm-1）**：一級胺示二峰（對稱與反對稱伸縮）；二級胺示一峰。常較 O-H 帶尖
3. **C-H 伸縮（2800--3300 cm-1）**：

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 3300 | sp C-H (alkyne, sharp) |
| 3000--3100 | sp2 C-H (aromatic, vinyl) |
| 2850--3000 | sp3 C-H (alkyl, multiple peaks) |
| 2700--2850 | Aldehyde C-H (two peaks from Fermi resonance) |

4. **三鍵區（2000--2300 cm-1）**：

| Frequency (cm-1) | Assignment | Notes |
|-------------------|------------|-------|
| 2100--2260 | C triple-bond C | Weak or absent if symmetric |
| 2200--2260 | C triple-bond N | Medium to strong |
| ~2350 | CO2 | Atmospheric artifact, disregard |

5. **羰基區（1650--1800 cm-1）**——IR 中最具診斷之單區：

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 1800--1830, 1740--1770 | Acid anhydride (two C=O stretches) |
| 1770--1780 | Acid chloride |
| 1735--1750 | Ester |
| 1700--1725 | Carboxylic acid |
| 1705--1720 | Aldehyde |
| 1705--1720 | Ketone |
| 1680--1700 | Conjugated ketone / alpha-beta unsaturated |
| 1630--1690 | Amide (amide I band) |

6. **C=C 與 C=N 伸縮（1600--1680 cm-1）**：烯烴 C=C 於 1620--1680 cm-1（弱至中）。芳香 C=C 於近 1450--1600 cm-1 示多峰。C=N（亞胺）於 1620--1660 cm-1

**預期：** 診斷區所有吸收已識別，附官能團指派與信心級（強、暫定、缺）。

**失敗時：** 若羰基區被遮（如 KBr 中水吸收、大氣 CO2），記此缺口。若預期之官能團吸收缺，於確定真缺之前以第二製備法確認。

### 步驟三：分析指紋區（1500--400 cm-1）

察低頻區尋確認與結構細節：

1. **C-O 伸縮（1000--1300 cm-1）**：醚、酯、醇與羧酸產強 C-O 伸縮吸收。酯除羰基外於近 1000--1100 cm-1 示特徵強帶
2. **C-N 伸縮（1000--1250 cm-1）**：胺與醯胺；與 C-O 重疊使指派於無他證時暫定
3. **C-F、C-Cl、C-Br 伸縮**：

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 1000--1400 | C-F (strong) |
| 600--800 | C-Cl |
| 500--680 | C-Br |

4. **芳香取代模式（700--900 cm-1）**：面外 C-H 彎曲露取代：

| Frequency (cm-1) | Pattern |
|-------------------|---------|
| 730--770 | Mono-substituted (+ 690--710) |
| 735--770 | Ortho-disubstituted |
| 750--810, 860--900 | Meta-disubstituted |
| 790--840 | Para-disubstituted |

5. **整體指紋比較**：指紋區為每化合物獨有。若參考光譜可得，疊此區以確認同一

**預期：** 步驟二所識官能團之確認指派，加附結構細節（取代模式、C-O/C-N 指派）。

**失敗時：** 指紋區本質複而重疊。若指派模糊，標為暫定並依診斷區與他光譜數據作最終結論。

### 步驟四：評氫鍵與分子間效應

評樣品態與分子間互作如何影響光譜：

1. **氫鍵寬化**：比 O-H 與 N-H 帶之寬與位。自由 O-H 尖而近 3600 cm-1；氫鍵之 O-H 寬而移至 3200--3400 cm-1。羧酸二聚體自 2500--3300 cm-1 示甚寬 O-H
2. **濃度與態效應**：異濃之溶液光譜能別分子內（濃度無關）與分子間（濃度相關）氫鍵
3. **費米共振**：二重疊帶可作用而裂為雙峰。經典例為近 2720 與 2820 cm-1 之醛 C-H 對。識費米共振以避誤將多峰指派為別官能團
4. **固態效應**：KBr 壓片與 Nujol 糊反映固態堆積，寬化帶並相對溶液光譜移頻 10--20 cm-1。ATR 光譜最近純液態

**預期：** 氫鍵態已刻畫，製備法偽影已考量，任何異常帶形已釋。

**失敗時：** 若氫鍵效應不能解（如重疊之 O-H 與 N-H 帶），記此模糊。D2O 交換實驗或變溫研究可助，然此需附加數據。

### 步驟五：編官能團清單

合所有發現為結構化報告：

1. **列已確認官能團**：於診斷區有強、明確吸收者（如 1715 cm-1 之尖 C=O = 酮或醛）
2. **列暫定指派**：有較弱證據或重疊吸收、可由多於一官能團釋者
3. **列缺官能團**：其特徵強吸收明缺於光譜者（如無寬 O-H 帶謂無自由醇或羧酸）
4. **記不符**：任何不合擬議官能團集之吸收，或預期缺之吸收
5. **交叉參考**：若可得，比 IR 所得官能團清單於他技術（NMR、MS、UV-Vis）之信息

**預期：** 完整官能團清單按信心級分類，每指派以具體頻率與強度為據。

**失敗時：** 若清單不全或相悖，識別何附加實驗（ATR vs. KBr 比較、變濃、D2O 交換）可解模糊。

## 驗證

- [ ] 光譜品質已評（基線、分辨率、偽影、y 軸格式）
- [ ] 溶劑、製備法與大氣偽影已識別並排除
- [ ] 診斷區（4000--1500 cm-1）所有吸收已指派或標
- [ ] 羰基區已分析並於可能處作具體子類指派
- [ ] 指紋區已察以尋確認證據
- [ ] 氫鍵效應已評並記其對峰形/位之影響
- [ ] 官能團清單已編附信心級
- [ ] 缺官能團已明記之（負證據有信息）
- [ ] 指派已與他可得光譜數據交叉參考

## 常見陷阱

- **忽製備偽影**：KBr 水（寬 3400 cm-1）、Nujol C-H（2850--2950 cm-1）與 ATR 低波數強度失真皆擬或遮真樣吸收。恒考製備法
- **過解指紋區**：1500 cm-1 下之區複而重疊。用以確認，非主要識別。避每峰皆指派
- **混大氣 CO2 與樣峰**：近 2350 cm-1 之尖雙峰幾皆為大氣 CO2，非樣吸收。背景減應除之，然當驗
- **忽帶強與寬**：強寬吸收較同頻之弱尖峰有異診斷值。以強度（強/中/弱）與形（尖/寬）連同頻報之
- **單峰指派**：絕勿以單吸收識別官能團。如羰基當有附加帶支之（酯之 C-O、醯胺之 N-H、醛之 C-H）
- **以弱吸收假缺**：某些官能團本產弱 IR 吸收（對稱 C=C、對稱炔之三鍵）。峰缺不必謂團缺

## 相關技能

- `interpret-nmr-spectrum` — 定詳連接性與氫環境
- `interpret-mass-spectrum` — 立分子式與裂片模式
- `interpret-uv-vis-spectrum` — 刻畫發色團以補 IR 官能團數據
- `interpret-raman-spectrum` — 獲 IR 非活模式之互補振動數據
- `plan-spectroscopic-analysis` — 於數據獲取前擇並排序光譜技術
