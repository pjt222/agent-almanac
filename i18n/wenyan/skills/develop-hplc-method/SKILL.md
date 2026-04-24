---
name: develop-hplc-method
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Develop a high-performance liquid chromatography method: define separation goals,
  select column chemistry and mobile phase, optimize gradient and flow conditions,
  choose the appropriate detector, and evaluate initial method performance for
  target analytes in solution or complex matrices.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: advanced
  language: natural
  tags: chromatography, hplc, liquid-chromatography, method-development, separation
---

# 高效液相色譜法之發展

系統發展高效液相色譜法：擇模式、柱、流動相與梯度、流速溫度之優化、檢測器之擇、及為不揮發、熱不穩或極性分析物之迭代精化。

## 用時

- 分析不揮發、熱不穩或過極性於 GC 之化合物
- 自始發展新 HPLC-UV、HPLC-熒光或 LC-MS 法
- 將文獻或藥典 HPLC 法適於他柱或儀器
- 改因分離不足、運行時長或靈敏度之弊之既有法
- 擇色譜模式（反相、HILIC、離子交換、SEC、手性）

## 入

### 必要

- **目標分析物**：化合物名、結構、分子量、pKa、logP/logD
- **樣品基質**：製劑、生物液、環境提取物或純溶液
- **性能目標**：所需分離、檢測限、定量範圍

### 可選

- **參考法**：以作起點之藥典或文獻法
- **可用柱**：現有 HPLC 柱之清單
- **儀器配置**：UHPLC 或常規 HPLC、可用檢測器、柱爐範圍
- **通量之要**：含再平衡之最大可接運行時
- **監管上下文**：ICH、USP、EPA 或他合規框架

## 法

### 第一步：定分離目標

1. 匯分析物性：分子量、pKa、logP（或相關 pH 下 logD）、發色團、熒光團、可離基
2. 識樣品基質與預期干擾（輔料、內源化合物、降解物）
3. 明性能準則：
   - 關鍵對分離（監管法 Rs >= 2.0）
   - 檢測限（LOD/LOQ）
   - 含梯度再平衡之可接運行時
4. 定法用於含量測定、雜質分析、溶出、含量均一性或清潔驗證——此定驗證之類
5. 等度與梯度之擇：諸分析物保留因子於 2 < k' < 10 內者用等度，否則用梯度

**得：** 規格文檔列分析物及理化性、基質述、性能準則、等度或梯度之定。

**敗則：** pKa 或 logP 未知則由結構以預測工具（ChemAxon、ACD/Labs）估之，或於 pH 3 與 pH 7 之 C18 柱上行掃描梯度以經驗評保留行為。

### 第二步：擇柱化學

依分析物之性擇色譜模式與柱。

| Mode | Column Chemistry | Mobile Phase | Best For |
|---|---|---|---|
| Reversed-phase (RP) | C18 (ODS) | Water/ACN or water/MeOH + acid/buffer | Non-polar to moderately polar, most small molecules |
| RP (extended) | C8, phenyl-hexyl, biphenyl | Water/organic + modifier | Shape selectivity, aromatic compounds, positional isomers |
| RP (polar-embedded) | Amide-C18, polar-endcapped C18 | Water/organic, compatible with high aqueous | Polar analytes that elute too early on standard C18 |
| HILIC | Bare silica, amide, zwitterionic | High organic (80-95% ACN) + aqueous buffer | Very polar, hydrophilic compounds (sugars, amino acids, nucleotides) |
| Ion-exchange (IEX) | SAX or SCX | Buffer with ionic strength gradient | Permanently charged species, proteins, oligonucleotides |
| Size-exclusion (SEC) | Diol-bonded silica, polymer | Isocratic aqueous or organic buffer | Protein aggregates, polymers, molecular weight distribution |
| Chiral | Polysaccharide (amylose/cellulose) | Normal-phase or polar organic mode | Enantiomeric separations, chiral purity |

1. 小分子 logP > 0 默用反相 C18
2. logP < 0 者評 HILIC 或離子交換
3. 擇粒徑：UHPLC 用亞 2 um（效率高但背壓高），常規 HPLC 用 3-5 um
4. 擇柱尺寸：長 50-150 mm，ID 2.1-4.6 mm。窄者省溶劑且增 MS 靈敏度
5. 手性分離至少篩 3-4 種不同選擇子之手性固定相

**得：** 柱化學、尺寸、粒徑已擇且有理，依分析物之性。

**敗則：** 初掃描示 C18 保留差則換更強保留相（芳香物用 phenyl-hexyl）或他模式（極性物用 HILIC）。

### 第三步：設流動相與梯度

1. 擇有機改性劑：
   - 乙腈（ACN）：黏度低、峰銳、210 nm 以下 UV 透射佳
   - 甲醇（MeOH）：選擇性異、極性分析物時更佳、黏度較高
2. 擇水相與 pH：
   - 中性分析物：水加 0.1% 甲酸（MS 相容）或磷酸鹽緩衝（僅 UV）
   - 可離分析物：流動相緩衝於分析物 pKa 之外 2 pH 單位以確單一離子形式
   - pH 2-3（甲／磷酸）：抑酸之離子化，一般起點佳
   - pH 6-8（甲／乙酸銨）：鹼性分析物或低 pH 選擇性不足時
   - pH 9-11（碳酸氫銨、BEH 柱）：極鹼化合物於高 pH 穩柱上
3. 設梯度：
   - 初掃於 10-20 分內由 5-10% 有機升至 90-95%
   - 評掃描譜圖以識有用有機範圍
   - 將梯度收窄以僅跨感興趣洗脫窗
   - 梯度斜率：陡者快然分離低；緩者分離佳然運行長
4. 加柱洗滌（95% 有機，2-3 分）與再平衡（初始條件，5-10 柱體積）
5. 等度法目標 k' = 3-8 於感興趣分析物

**得：** 流動相組成（有機、水、緩衝／添加、pH）與梯度剖面已定，掃描證分析物於所設窗內洗脫。

**敗則：** 選擇性差（雖調梯度諸分析物仍共洗脫）則換有機改性劑（ACN 至 MeOH 或反之）、調 pH 二單位，或為帶電分析物加離子對試劑。

### 第四步：優化流速與溫度

1. 依柱尺寸設初始流速：
   - 4.6 mm ID：1.0 mL/min
   - 3.0 mm ID：0.4-0.6 mL/min
   - 2.1 mm ID：0.2-0.4 mL/min
2. 驗背壓在儀器與柱之限內（常規 < 400 bar，UHPLC < 1200 bar）
3. 優化柱溫：
   - 始於 30 C 以保重現性（避環境波動）
   - 升至 40-60 C 以減黏度、降背壓、銳峰
   - 手性柱溫於對映選擇性影響常強——篩 15-45 C
4. 評流速對分離之影響：於 van Deemter 最小附近小增流速可增通量而分離不顯降
5. 書最優流速、柱溫、所得背壓

**得：** 流速與柱溫已優化，背壓在限內，分離較初始條件保或改。

**敗則：** 背壓過高則減流速、升溫，或換更寬或大粒徑柱。高溫下分離退化則返 30 C 且接更長運行時。

### 第五步：擇檢測器

| Detector | Principle | Sensitivity | Selectivity | Key Considerations |
|---|---|---|---|---|
| UV (single wavelength) | Absorbance at fixed lambda | ng range | Compounds with chromophores | Simple, robust, most common |
| DAD (diode array) | Full UV-Vis spectrum | ng range | Chromophores + spectral ID | Peak purity assessment, library matching |
| Fluorescence (FLD) | Excitation/emission | pg range (10-100x more sensitive than UV) | Native fluorophores or derivatized | Excellent selectivity, requires fluorescent analytes |
| Refractive index (RI) | Bulk property | ug range | Universal (no chromophore needed) | Temperature-sensitive, gradient-incompatible |
| Evaporative light scattering (ELSD) | Nebulization + light scattering | ng range | Universal, non-volatile analytes | Semi-quantitative, non-linear response |
| Charged aerosol (CAD) | Nebulization + corona discharge | ng range | Universal, non-volatile analytes | More uniform response than ELSD |
| Mass spectrometry (MS) | m/z detection | pg-fg range | Structural, highest selectivity | Requires MS-compatible mobile phases |

1. 有 UV 發色團（芳環、共軛系）之分析物先用 DAD——同時得定量與峰純度
2. 複雜基質中痕量分析宜用 SIM 或 MRM 模式之 MS（ESI 或 APCI）
3. 無發色團化合物（糖、脂、聚合物）用 CAD、ELSD 或 RI
4. 檢測波長設於分析物吸收極大（lambda-max）以得最佳靈敏度，或於 210-220 nm 作一般篩選
5. 熒光用分析物光譜掃描以優化激發與發射波長
6. 確保流動相添加物相容：MS 勿用磷酸緩衝，低波長勿用 UV 吸收添加物

**得：** 檢測器已擇且配（波長、增益、採集率）合分析物化學與靈敏度之要。

**敗則：** UV 靈敏度於所需 LOQ 不足則考熒光衍生化（如胺用 OPA、氨基酸用 FMOC）或換 LC-MS/MS 以得最大靈敏度與選擇性。

### 第六步：評與精化

1. 進系統適用性標液 6 次並評：
   - 保留時 RSD < 1.0%
   - 峰面積 RSD < 2.0%
   - 關鍵對分離 >= 2.0
   - 諸峰拖尾因子 0.8-1.5
   - 理論塔板合柱規格
2. 進安慰劑／基質空白以察分析物保留時之干擾
3. 進應激或加標樣以驗法能將降解物與主分析物分開
4. 任一準則失則一次調一變量：
   - 分離差：改 pH、梯度斜率或柱化學
   - 拖尾：加胺改性劑（鹼性分析物用 TEA）、換緩衝或試他鍵合相
   - 靈敏度：增進樣量、濃縮樣、換檢測器
5. 鎖最終法參，書諸條件

**得：** 諸系統適用性準則合；法能將目標分析物與基質干擾及已知降解物分開；參已書以待轉移。

**敗則：** 迭代調未解則考根本不同之法（換色譜模式、2D-LC 或衍生化）並返第二步。

## 驗

- [ ] 諸目標分析物分離，關鍵對 Rs >= 2.0
- [ ] 6 次重複進樣保留時 RSD < 1.0%
- [ ] 6 次重複進樣峰面積 RSD < 2.0%
- [ ] 諸分析物峰拖尾因子 0.8-1.5
- [ ] 分析物保留時無基質干擾
- [ ] 降解物與主分析物分開
- [ ] 含再平衡之運行時合通量之要
- [ ] 流動相與所擇檢測器相容
- [ ] 法參已全書（柱、流動相、梯度、流速、溫度、檢測器）

## 陷

- **略可離分析物之流動相 pH**：運行於近分析物 pKa 之 pH 致峰分裂或重現性差，因化合物存於兩離子形式。緩衝於 pKa 之外至少 2 pH 單位
- **MS 檢測用磷酸緩衝**：磷酸不揮發且污染 MS 源。LC-MS 工作用甲／乙酸緩衝
- **梯度後再平衡不足**：下一進樣前柱須以至少 5-10 柱體積之初始流動相沖。再平衡不足致保留時漂移
- **複雜混合物用短柱**：短柱（50 mm）雖快，然或不足以供多組分分離之塔板。法發展始於 100-150 mm
- **略系統死體積**：死體積（混合器至柱頭）延梯度達柱。儀器間異致法轉移失敗。宜測並書之
- **HILIC 當反相運行**：HILIC 需高有機（80-95% ACN）與少量水。增水增洗脫強——與 RP 相反。再平衡時亦較長

## 參

- `develop-gc-method` — 為揮發與半揮發分析物發展氣相色譜法
- `interpret-chromatogram` — 讀並釋 HPLC 與 GC 色譜圖
- `troubleshoot-separation` — 診並修峰形、保留、分離之問題
- `validate-analytical-method` — 所發 HPLC 法之正式 ICH Q2 驗證
