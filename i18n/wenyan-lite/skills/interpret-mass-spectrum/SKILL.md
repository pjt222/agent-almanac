---
name: interpret-mass-spectrum
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematically interpret mass spectra to determine molecular formula,
  identify fragmentation pathways, and propose molecular structures. Covers
  ionization method assessment, molecular ion identification, isotope pattern
  analysis, common fragmentation losses, and purity evaluation.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: advanced
  language: natural
  tags: spectroscopy, mass-spectrometry, fragmentation, molecular-ion, isotope
---

# 解讀質譜

分析任何常用電離法之質譜以定分子離子、分子式、裂片路徑與分析物之結構特徵。

## 適用時機

- 定未知化合物之分子量與分子式
- 以分子離子與裂片確合成產物之同一
- 於樣品中識別雜質或降解產物
- 自特徵裂片損失擬議結構特徵
- 分析同位素模式以檢鹵素、硫或金屬

## 輸入

- **必要**：質譜數據（m/z 值附相對強度，至少全掃光譜）
- **必要**：所用電離法（EI、ESI、MALDI、CI、APCI、APPI）
- **選擇性**：高分辨質量數據（精確質量，測 vs. 計）
- **選擇性**：自他源得之分子式（元素分析、NMR）
- **選擇性**：串級 MS/MS 數據（所選前驅離子之裂片）
- **選擇性**：色譜上下文（LC-MS 或 GC-MS 保留時間、純度）

## 步驟

### 步驟一：識電離法與預期離子類型

指派峰之前定光譜所含物種：

1. **分類電離法**：

| Method | Energy | Primary Ion | Fragmentation | Typical Use |
|--------|--------|-------------|---------------|-------------|
| EI (70 eV) | Hard | M+. (radical cation) | Extensive | Small volatile molecules, GC-MS |
| CI | Soft | [M+H]+, [M+NH4]+ | Minimal | Molecular weight confirmation |
| ESI | Soft | [M+H]+, [M+Na]+, [M-H]- | Minimal | Polar, biomolecules, LC-MS |
| MALDI | Soft | [M+H]+, [M+Na]+, [M+K]+ | Minimal | Large molecules, polymers, proteins |
| APCI | Soft | [M+H]+, [M-H]- | Some | Medium polarity, LC-MS |

2. **記極性模式**：正模式產陽離子；負模式產陰離子。ESI 常兩用
3. **查加合與簇**：軟電離除 [M+H]+ 外常產 [M+Na]+（M+23）、[M+K]+（M+39）、[2M+H]+ 與 [2M+Na]+。指派分子離子之前識別此者
4. **識多電荷離子**：於 ESI，多電荷離子於 m/z = (M + nH) / n。尋分數 m/z 間距之峰（如 0.5 Da 間距示 z=2）

**預期：** 電離法已記錄，預期離子類型已列，加合/簇已識別，以便定真分子離子。

**失敗時：** 若電離法未知，察光譜尋線索：廣裂片示 EI，加合模式示 ESI，矩陣峰示 MALDI。可得則查儀器日誌。

### 步驟二：定分子離子與分子式

識分子離子峰並導分子式：

1. **定分子離子（M）**：於 EI，M+. 為有合理同位素模式之最高 m/z 峰（於不穩化合物或弱或缺）。於軟電離，識 [M+H]+ 或 [M+Na]+ 並減加合得 M
2. **用氮規則**：奇分子量示奇數氮原子。偶分子量示零或偶數氮
3. **算不飽和度（DBE）**：DBE = (2C + 2 + N - H - X) / 2，X = 鹵素。每環或 pi 鍵貢 1 DBE。苯 = 4 DBE，羰基 = 1 DBE
4. **用高分辨數據**：若精確質量可得，用質量缺陷算分子式。於質量精度窗內（今儀器常 < 5 ppm）比測量於所有候選式
5. **以同位素模式交叉查**：觀之同位素模式必合擬議分子式（見步驟三）

**預期：** 分子離子已識，分子量已定，氮規則已用，分子式已擬（若可得 HRMS 則已確）。

**失敗時：** 若 EI 中不見分子離子（熱不穩或高度支鏈化合物常如此），試較軟電離法。若分子離子模糊，查最高 m/z 峰之常小碎片損失（如 M-1、M-15、M-18 可助定 M）。

### 步驟三：分析同位素模式

用同位素特徵檢特定元素：

1. **單同位素元素**：H、C、N、O、F、P、I 有特徵自然豐度模式。僅含 C、H、N、O 者，M+1 峰約為每碳 1.1%
2. **鹵素模式**：

| Element | Isotopes | M : M+2 Ratio | Visual Pattern |
|---------|----------|----------------|----------------|
| 35Cl / 37Cl | 35, 37 | 3 : 1 | Doublet, 2 Da apart |
| 79Br / 81Br | 79, 81 | 1 : 1 | Equal doublet, 2 Da apart |
| 2 Cl | -- | 9 : 6 : 1 | Triplet |
| 2 Br | -- | 1 : 2 : 1 | Triplet |
| 1 Cl + 1 Br | -- | 3 : 4 : 1 | Characteristic quartet-like |

3. **硫檢測**：34S 於 M+2 貢 4.4%。相對 M 約 4--5%（校正 13C2 貢獻後）之 M+2 峰示一硫原子
4. **矽檢測**：29Si（5.1%）與 30Si（3.4%）產顯著 M+1 與 M+2 貢獻
5. **比計算模式**：用擬議分子式算理論同位素模式。疊於觀之模式以確或否分子式

**預期：** 同位素模式已分析，Cl、Br、S、Si 之存否已定，模式與擬議分子式一致。

**失敗時：** 若同位素分辨不足（低分辨儀器），M+2 模式或不可分。記此限並依精確質量與他光譜數據定元素組成。

### 步驟四：識裂片損失與關鍵碎片離子

繪裂片路徑以抽結構信息：

1. **錄主要碎片**：列所有相對強度 > 5--10% 之峰與其 m/z 值
2. **自分子離子計中性損失**：

| Loss (Da) | Neutral Lost | Structural Implication |
|-----------|-------------|----------------------|
| 1 | H. | Labile hydrogen |
| 15 | CH3. | Methyl group |
| 17 | OH. | Hydroxyl |
| 18 | H2O | Alcohol, carboxylic acid |
| 27 | HCN | Nitrogen heterocycle, amine |
| 28 | CO or C2H4 | Carbonyl or ethyl |
| 29 | CHO. or C2H5. | Aldehyde or ethyl |
| 31 | OCH3. or CH2OH. | Methoxy or hydroxymethyl |
| 32 | CH3OH | Methyl ester |
| 35/36 | Cl./HCl | Chlorinated compound |
| 44 | CO2 | Carboxylic acid, ester |
| 45 | OC2H5. | Ethoxy |
| 46 | NO2. | Nitro compound |

3. **識特徵碎片離子**：

| m/z | Ion | Origin |
|-----|-----|--------|
| 77 | C6H5+ | Phenyl cation |
| 91 | C7H7+ | Tropylium (benzyl rearrangement) |
| 105 | C6H5CO+ | Benzoyl cation |
| 43 | CH3CO+ or C3H7+ | Acetyl or propyl |
| 57 | C4H9+ or C3H5O+ | tert-Butyl or acrolein |
| 149 | Phthalate fragment | Plasticizer contaminant |

4. **繪裂片路徑**：以連續損失連碎片離子，自 M 至低質量碎片構裂片樹
5. **識重排離子**：麥克拉弗蒂重排（γ 氫轉與 β 裂）自含羰化合物產偶電子離子。逆狄爾斯-阿爾德裂片為環己烯系之特徵

**預期：** 所有主要碎片離子已指派，中性損失已算並關於結構特徵，裂片樹已建。

**失敗時：** 若碎片不對應自分子離子之簡單損失，思重排過程。未指派之碎片或示意外官能團、雜質，或矩陣/背景峰。

### 步驟五：評純度並擬結構

評整體光譜以尋純度指標並合結構提議：

1. **純度查**：於 GC-MS 或 LC-MS 中察色譜尋附加峰。於直接進樣 MS 中尋非主分析物之碎片或加合之意外離子
2. **背景與污染峰**：常污染含酞酸酯增塑劑（m/z 149、167、279）、柱流失（GC-MS 之矽氧烷於 m/z 207、281、355、429），與溶劑簇
3. **結構提議**：合分子式（步驟二）、同位素模式（步驟三）與裂片（步驟四）以擬一結構或候選結構集
4. **排候選**：用裂片樹排結構候選。最佳結構以最少臨時假設釋最多碎片
5. **交叉驗證**：比擬議結構於他技術（NMR、IR、UV-Vis）之數據。質譜單獨鮮為新化合物供明確結構

**預期：** 純度已評，若存污染已識，結構提議（或已排之候選清單）與所有 MS 數據一致，可得處已交叉驗證。

**失敗時：** 若光譜似含多組分而未用色譜分離，標混合物並建議 LC-MS 或 GC-MS 再分析。若無令人滿意之結構提議現，識別何附加數據（HRMS、MS/MS、NMR）可解模糊。

## 驗證

- [ ] 電離法已識別並記錄預期離子類型
- [ ] 分子離子已定並與加合、碎片與簇別
- [ ] 氮規則已用並與擬議式一致
- [ ] 不飽和度已算並於結構中解
- [ ] 同位素模式合擬議分子式
- [ ] 主要碎片離子已指派附中性損失與結構理由
- [ ] 裂片樹已自分子離子建至低質量碎片
- [ ] 常污染與背景峰已識別並排除
- [ ] 結構提議已與他光譜數據交叉驗證

## 常見陷阱

- **誤識分子離子**：於 EI，基峰常為碎片，非分子離子。分子離子為有化學合理同位素模式之最高 m/z 峰。ESI 之加合離子（[M+Na]+、[2M+H]+）亦可誤作分子離子
- **忽氮規則**：奇質量分子離子需奇數氮。忘之致不可能之分子式
- **混同質量損失**：28 Da 損失可為 CO 或 C2H4；29 可為 CHO 或 C2H5。需高分辨 MS 或附加裂片數據別同質量損失
- **忽多電荷離子**：於 ESI，雙或三電荷離子於預期 m/z 之半或三分之一。尋同位素峰間非整數間距為多電荷之診斷
- **過解低豐度峰**：相對強度 < 1--2% 之峰或為噪音、同位素貢獻，或次污染，非有意義碎片
- **假純樣**：多現實光譜為混合物。恒查色譜純度並尋與擬議結構不合之離子

## 相關技能

- `interpret-nmr-spectrum` — 定連接性與氫環境供結構確認
- `interpret-ir-spectrum` — 識釋觀之裂片之官能團
- `interpret-uv-vis-spectrum` — 刻畫分析物中之發色團
- `interpret-raman-spectrum` — 互補振動分析
- `plan-spectroscopic-analysis` — 於數據獲取前擇並排序分析技術
- `interpret-chromatogram` — 分析與 MS 聯用之 GC 或 LC 色譜數據
