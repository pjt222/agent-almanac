---
name: interpret-uv-vis-spectrum
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematically interpret ultraviolet-visible absorption spectra to identify
  chromophores, classify electronic transitions, apply Woodward-Fieser rules
  for conjugated systems, and perform quantitative analysis using the
  Beer-Lambert law.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, uv-vis, chromophore, beer-lambert, electronic-transitions
---

# 解讀 UV-Vis 光譜

分析紫外-可見吸收光譜以識發色團、分類電子躍遷、對共軛系統用 Woodward-Fieser 規則，並用朗伯-比爾定律作定量分析。

## 適用時機

- 識有機化合物之發色團與共軛程度
- 確芳香環、共軛二烯，或烯酮之存
- 行定量分析（自吸光度定濃度）
- 以隨時吸光度變化監反應動力學
- 經 d-d 與電荷轉移躍遷刻畫金屬-配體絡合物
- 評溶劑對電子躍遷之效（溶致變色）

## 輸入

- **必要**：UV-Vis 光譜數據（nm 波長 vs. 吸光度或摩爾吸光率）
- **必要**：所用溶劑
- **選擇性**：濃度與光程（供朗伯-比爾計算）
- **選擇性**：lambda-max 之摩爾吸光率（epsilon）值
- **選擇性**：多溶劑之光譜（供溶致變色分析）
- **選擇性**：他光譜法之結構信息

## 步驟

### 步驟一：驗儀器參數與光譜品質

解讀吸收帶之前確數據可靠：

1. **波長範圍**：確光譜涵相關範圍。標準 UV-Vis 涵 190--800 nm。溶劑限低波截止：

| Solvent | UV Cutoff (nm) | Notes |
|---------|----------------|-------|
| Water | 190 | Excellent UV transparency |
| Hexane | 195 | Non-polar, minimal solvent effects |
| Methanol | 205 | Protic, may cause blue shifts |
| Acetonitrile | 190 | Good general-purpose UV solvent |
| Dichloromethane | 230 | Absorbs below 230 nm |
| Chloroform | 245 | Absorbs below 245 nm |
| Acetone | 330 | Absorbs strongly, poor UV solvent |

2. **吸光度範圍**：可靠測量需吸光度於 0.1 至 1.0 之間。下於 0.1 噪主導；高於 1.0 雜光致非線性響應。標任何此外之 lambda-max 值
3. **基線與空白**：驗溶劑空白已減。殘溶劑吸收或比色皿偽影於短波呈升基線
4. **狹縫寬**：窄狹縫得更佳分辨而較低信噪。若期精細結構（電子帶上之振動級數），確狹縫寬適（常 1--2 nm）

**預期：** 儀器參數已記錄，溶劑截止已敬，吸光度值於線性範圍內，基線已確淨。

**失敗時：** 若 lambda-max 處吸光度超 1.0，樣品須稀釋再測。若溶劑於關心區吸收，建議於更透明溶劑中再獲取。

### 步驟二：識 lambda-max 與帶特徵

定並刻所有吸收帶：

1. **定 lambda-max 值**：識每吸收極大（lambda-max）並記其波長（nm）與吸光度（或摩爾吸光率 epsilon 若已知）
2. **測帶形**：記每帶是否寬而無特徵（溶液相電子躍遷之典型）或示振動精細結構（剛性發色團如多環芳香之典型）
3. **記肩**：吸收肩示重疊躍遷。記其約波長與強度
4. **以摩爾吸光率分類**：

| epsilon (L mol-1 cm-1) | Transition Type | Example |
|-------------------------|-----------------|---------|
| < 100 | Forbidden (n -> pi*) | Ketone ~280 nm |
| 100--10,000 | Weakly allowed | Aromatic 250--270 nm |
| 10,000--100,000 | Fully allowed (pi -> pi*) | Conjugated diene ~220 nm |
| > 100,000 | Charge transfer | Metal complexes, dyes |

**預期：** 所有吸收極大與肩已列表附波長、吸光度/epsilon 與定性帶形。

**失敗時：** 若光譜不示明確極大（單調升），化合物或於所測範圍內缺發色團，或濃度或過低。增濃度或擴波長範圍。

### 步驟三：分類電子躍遷

指派每吸收帶於特定電子躍遷類型：

1. **sigma -> sigma* 躍遷**（< 200 nm）：僅於真空 UV 觀。關於飽和烴與 C-C/C-H 鍵。標準 UV-Vis 常不測
2. **n -> sigma* 躍遷**（150--250 nm）：孤對至 sigma 反鍵。觀於雜原子（O、N、S、鹵素）。飽和胺吸收近 190--200 nm；醇/醚近 175--185 nm
3. **pi -> pi* 躍遷**（200--500 nm）：成鍵 pi 至反鍵 pi*。此為有機化合物之最強吸收。強度與波長隨共軛擴而增
4. **n -> pi* 躍遷**（250--400 nm）：孤對至 pi 反鍵。形式禁阻（低 epsilon，常 10--100）。C=O（簡單酮 270--280 nm）、N=O、C=S 之特徵
5. **電荷轉移躍遷**：供體與受體間，或金屬與配體間之電子轉移。常甚強（epsilon > 10,000）而寬。見於金屬絡合物與供-受有機分子
6. **d-d 躍遷**（供過渡金屬絡合物）：弱、寬之可見區帶自晶場或配體場裂生

**預期：** 每吸收帶已指派於躍遷類型附支據（位、強度、溶劑敏感性）。

**失敗時：** 若帶不能指派於標準躍遷類型，思電荷轉移性或雜質吸收之可能。多重疊躍遷或需解卷積。

### 步驟四：對共軛系統用 Woodward-Fieser 規則

預測共軛二烯與烯酮之 lambda-max 並比觀值：

1. **共軛二烯**（Woodward 規則）：

| Component | Increment (nm) |
|-----------|----------------|
| Base value (heteroannular diene) | 214 |
| Base value (homoannular diene) | 253 |
| Each additional conjugated C=C | +30 |
| Each exocyclic C=C | +5 |
| Each alkyl substituent on C=C | +5 |
| -OAcyl substituent | +0 |
| -OR substituent | +6 |
| -SR substituent | +30 |
| -Cl, -Br substituent | +5 |
| -NR2 substituent | +5 |

2. **α-β 不飽和羰基**（Woodward-Fieser 規則）：

| Component | Increment (nm) |
|-----------|----------------|
| Base value (alpha-beta unsat. ketone, 6-ring or acyclic) | 215 |
| Base value (alpha-beta unsat. aldehyde) | 208 |
| Each additional conjugated C=C | +30 |
| Each exocyclic C=C | +5 |
| Homoannular diene component | +39 |
| Alpha substituent (alkyl) | +10 |
| Beta substituent (alkyl) | +12 |
| Gamma and higher substituent (alkyl) | +18 |
| -OH (alpha) | +35 |
| -OH (beta) | +30 |
| -OAc (alpha, beta, gamma) | +6 |
| -OR (alpha) | +35 |
| -OR (beta) | +30 |
| -Cl (alpha) | +15 |
| -Cl (beta) | +12 |
| -Br (beta) | +25 |
| -NR2 (beta) | +95 |

3. **計預測 lambda-max**：和基值與所有適用增量
4. **比觀值**：於 +/- 5 nm 內之合支擬議發色團。偏差 > 10 nm 示不正確之結構指派或強溶劑/立體效應

**預期：** 預測 lambda-max 已算並比觀值，支或否擬議發色團結構。

**失敗時：** 若預測與觀值顯異，再審擬發色團結構。常誤：誤計取代基、忽外環雙鍵，或用錯基值（同環 vs. 異環）。

### 步驟五：應用朗伯-比爾定律作定量分析

用吸光度數據定濃度或刻畫摩爾吸光率：

1. **朗伯-比爾方程**：A = epsilon * b * c，A = 吸光度（無量綱）、epsilon = 摩爾吸光率（L mol-1 cm-1）、b = 光程（cm）、c = 濃度（mol L-1）
2. **定摩爾吸光率**：若濃度與光程已知，自 lambda-max 之測吸光度算 epsilon
3. **定濃度**：若 epsilon 已知（自文獻或校準曲線），自測吸光度算濃度
4. **查線性**：朗伯-比爾定律僅於線性範圍有效（常 A = 0.1--1.0）。高吸光度因雜光、分子互作與儀器限而偏差
5. **評溶劑效應**：比極性 vs. 非極性溶劑之光譜：
   - **紅移（長波移）**：lambda-max 移至長波。pi -> pi* 躍遷於更極性溶劑紅移；n -> pi* 躍遷於較少極性溶劑紅移
   - **藍移（短波移）**：lambda-max 移至短波。n -> pi* 躍遷於更極性/質子溶劑藍移（氫鍵穩孤對基態）
   - **增色/減色效應**：epsilon 增或減而無波長變

**預期：** 定量結果已以適有效數字計算，線性已驗，若多溶劑光譜可得則溶劑效應已記錄。

**失敗時：** 若朗伯-比爾線性敗，查樣降解、高濃聚集，或熒光干擾。稀樣再測以確。

## 驗證

- [ ] 溶劑截止已敬，吸光度於線性範圍（0.1--1.0）
- [ ] 所有 lambda-max 值與肩已列表附波長、吸光度與 epsilon
- [ ] 每吸收帶已指派於電子躍遷類型
- [ ] 於適用處已行 Woodward-Fieser 計算並比觀 lambda-max
- [ ] 朗伯-比爾定律已正確應用並驗線性
- [ ] 若多溶劑數據可得，溶劑效應已刻畫
- [ ] 發色團指派與他光譜法所得分子結構一致

## 常見陷阱

- **測於 A = 1.0 以上**：高吸光度值因雜光效應不可靠。若 lambda-max 吸光度超 1.0，恒稀再測
- **忽溶劑截止**：試解溶劑截止波長下之吸收產偽影，非真樣數據
- **僅以強度別躍遷類型**：近 280 nm 之弱帶可為羰基之 n -> pi* 或芳香之禁阻 pi -> pi*。需上下文與溶劑效應以別
- **誤用 Woodward-Fieser 規則**：此經驗規則僅適共軛二烯與 α-β 不飽和羰基。不能用於芳香系、孤立發色團，或金屬絡合物
- **忽雜質吸收**：即使少量強吸雜質可主光譜。若 lambda-max 不合期望，思雜質貢獻
- **假一帶 = 一躍遷**：寬 UV-Vis 帶常含多重疊躍遷。精確指派或需帶解卷積

## 相關技能

- `interpret-nmr-spectrum` — 定分子連接性以支發色團識別
- `interpret-ir-spectrum` — 識貢於發色團之官能團
- `interpret-mass-spectrum` — 立分子式並經裂片檢共軛
- `interpret-raman-spectrum` — 對稱發色團之互補振動數據
- `plan-spectroscopic-analysis` — 於數據獲取前擇並排序光譜技術
