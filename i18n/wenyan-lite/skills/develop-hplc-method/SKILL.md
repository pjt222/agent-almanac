---
name: develop-hplc-method
locale: wenyan-lite
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

# 開發 HPLC 方法

系統開發高效液相層析法：含模式擇、柱化學、流動相與梯度之設計、流量與溫度之優化、檢測器之擇、迭代精調，俾非揮發、熱不穩或極性分析物可分析之。

## 適用時機

- 分析非揮發、熱不穩或太極性而不宜 GC 之化合物
- 自零開發 HPLC-UV、HPLC-螢光、LC-MS 之新法
- 將文獻或藥典 HPLC 法改適於他柱或他儀器
- 改既有法之病：分離差、運行久、靈敏不足
- 擇合宜之層析模式（反相、HILIC、離子交換、SEC、手性）

## 輸入

### 必要

- **目標分析物**：化合物名、結構、分子量、pKa 值、logP/logD
- **樣品基質**：配方、生物流體、環境萃取、純溶液
- **性能目標**：所需分離度、檢測限、定量範圍

### 選擇

- **參考法**：用作起點之藥典或文獻法
- **現有柱**：現有 HPLC 柱之清單
- **儀器配置**：UHPLC 對比傳統 HPLC、可用檢測器、柱烘箱範圍
- **通量要求**：最大可受之運行時間（含再平衡）
- **監管背景**：ICH、USP、EPA 或他合規框架

## 步驟

### 步驟一：定分離目標

1. 編分析物屬性：分子量、pKa、logP（或相關 pH 下之 logD）、發色團、螢光團、可電離基。
2. 辨樣品基質與預期干擾物（輔料、內源性化合物、降解產物）。
3. 定性能標準：
   - 關鍵對之分離度（規範法 Rs >= 2.0）
   - 檢測限（LOD/LOQ）
   - 含梯度再平衡之可受運行時間
4. 定法為含量、雜質分析、溶出、含量均一性或清潔驗證——此決驗證類別。
5. 擇等度與梯度洗脫：所有分析物保留因子 2 < k' < 10 內皆洗脫時用等度，否則用梯度。

**預期：** 規格文件，列分析物及其物化屬性、基質描述、性能標準、等度對梯度之決。

**失敗時：** pKa 或 logP 闕時，以結構預測工具（ChemAxon、ACD/Labs）估之，或於 C18 柱上 pH 3 與 pH 7 行偵察梯度以經驗評其保留行為。

### 步驟二：擇柱化學

依分析物屬性擇層析模式與柱。

| Mode | Column Chemistry | Mobile Phase | Best For |
|---|---|---|---|
| Reversed-phase (RP) | C18 (ODS) | Water/ACN or water/MeOH + acid/buffer | Non-polar to moderately polar, most small molecules |
| RP (extended) | C8, phenyl-hexyl, biphenyl | Water/organic + modifier | Shape selectivity, aromatic compounds, positional isomers |
| RP (polar-embedded) | Amide-C18, polar-endcapped C18 | Water/organic, compatible with high aqueous | Polar analytes that elute too early on standard C18 |
| HILIC | Bare silica, amide, zwitterionic | High organic (80-95% ACN) + aqueous buffer | Very polar, hydrophilic compounds (sugars, amino acids, nucleotides) |
| Ion-exchange (IEX) | SAX or SCX | Buffer with ionic strength gradient | Permanently charged species, proteins, oligonucleotides |
| Size-exclusion (SEC) | Diol-bonded silica, polymer | Isocratic aqueous or organic buffer | Protein aggregates, polymers, molecular weight distribution |
| Chiral | Polysaccharide (amylose/cellulose) | Normal-phase or polar organic mode | Enantiomeric separations, chiral purity |

1. 小分子 logP > 0 者預設為反相 C18。
2. logP < 0 之分析物，評 HILIC 或離子交換。
3. 擇粒徑：UHPLC 用亞 2 um（效率高、背壓高），傳統 HPLC 用 3-5 um。
4. 擇柱尺寸：長 50-150 mm、內徑 2.1-4.6 mm。窄柱省溶劑並增 MS 靈敏度。
5. 手性分離者，至少篩 3-4 種具不同選擇子之手性固定相。

**預期：** 柱化學、尺寸、粒徑皆擇定，以分析物屬性為據。

**失敗時：** 初偵察示 C18 保留差時，換更強保留之固定相（芳香者用苯己基）或他模式（極性者用 HILIC）。

### 步驟三：設計流動相與梯度

1. 擇有機改質劑：
   - 乙腈（ACN）：黏度低、峰銳、210 nm 以下 UV 透明性較佳
   - 甲醇（MeOH）：選擇性異，極性分析物或較佳，黏度較高
2. 擇水相與 pH：
   - 中性分析物：水加 0.1% 甲酸（MS 相容）或磷酸鹽緩衝液（僅 UV）
   - 可電離分析物：流動相緩衝於分析物 pKa 外 2 pH 單位，以確保單一離子形
   - pH 2-3（甲酸/磷酸）：抑酸之電離，通用之良好起點
   - pH 6-8（甲酸銨/醋酸銨）：鹼性分析物或低 pH 選擇性不足者
   - pH 9-11（碳酸氫銨、BEH 柱）：極鹼性化合物於高 pH 穩定柱上
3. 設計梯度：
   - 始於 5-10% 有機，10-20 分鐘內斜升至 90-95% 有機以作初偵察
   - 評偵察圖譜以辨有用之有機範圍
   - 將梯度縮至僅跨所關心之洗脫窗
   - 梯度斜率：陡則快但分離度低；緩則分離度佳但運行久
4. 加柱洗步（95% 有機，2-3 分鐘）與再平衡（初始條件，5-10 柱體積）。
5. 等度法者，目標分析物之 k' 取 3-8。

**預期：** 流動相組成（有機、水、緩衝/添加、pH）與梯度輪廓俱定，偵察運行證分析物於所設窗內洗脫。

**失敗時：** 選擇性差（梯度優化後分析物仍共洗脫）時，換有機改質劑（ACN 與 MeOH 互換）、pH 調 2 單位、或為帶電分析物加離子對試劑。

### 步驟四：優化流量與溫度

1. 依柱尺寸設初始流量：
   - 4.6 mm 內徑：1.0 mL/min
   - 3.0 mm 內徑：0.4-0.6 mL/min
   - 2.1 mm 內徑：0.2-0.4 mL/min
2. 驗背壓於儀器與柱之限內（傳統常 < 400 bar，UHPLC < 1200 bar）。
3. 優化柱溫：
   - 始於 30 C 以求重現（避環境波動）
   - 升至 40-60 C 以減黏度、降背壓、銳峰
   - 手性柱溫度常強影響對映選擇性——篩 15-45 C
4. 評流量對分離度之效：若接 van Deemter 最小值運行，流量微增可增通量而不顯著損分離度。
5. 錄最佳流量、柱溫、所致背壓。

**預期：** 流量與柱溫已優化，背壓於限內，分離度保持或較初始條件改善。

**失敗時：** 背壓太高時，減流量、升溫、或換寬徑或大粒徑柱。高溫下分離度降時，回 30 C 並受運行較久。

### 步驟五：擇檢測器

| Detector | Principle | Sensitivity | Selectivity | Key Considerations |
|---|---|---|---|---|
| UV (single wavelength) | Absorbance at fixed lambda | ng range | Compounds with chromophores | Simple, robust, most common |
| DAD (diode array) | Full UV-Vis spectrum | ng range | Chromophores + spectral ID | Peak purity assessment, library matching |
| Fluorescence (FLD) | Excitation/emission | pg range (10-100x more sensitive than UV) | Native fluorophores or derivatized | Excellent selectivity, requires fluorescent analytes |
| Refractive index (RI) | Bulk property | ug range | Universal (no chromophore needed) | Temperature-sensitive, gradient-incompatible |
| Evaporative light scattering (ELSD) | Nebulization + light scattering | ng range | Universal, non-volatile analytes | Semi-quantitative, non-linear response |
| Charged aerosol (CAD) | Nebulization + corona discharge | ng range | Universal, non-volatile analytes | More uniform response than ELSD |
| Mass spectrometry (MS) | m/z detection | pg-fg range | Structural, highest selectivity | Requires MS-compatible mobile phases |

1. 有 UV 發色團之分析物（芳環、共軛系統），自 DAD 始——兼供定量與峰純度。
2. 複雜基質之痕量分析，宜用 MS（ESI 或 APCI）之 SIM 或 MRM 模式。
3. 無發色團之化合物（糖、脂、聚合物），用 CAD、ELSD 或 RI。
4. 偵測波長設於分析物之吸收最大（lambda-max）以求最靈敏，或於 210-220 nm 以作通用篩查。
5. 螢光者，以分析物之光譜掃描優化激發與發射波長。
6. 確保流動相添加劑相容：MS 不用磷酸鹽緩衝液，低波長不用吸 UV 之添加劑。

**預期：** 檢測器已擇並配（波長、增益、採集率），合於分析物化學與靈敏度要求。

**失敗時：** 所需 LOQ 下 UV 靈敏度不足時，考慮螢光衍生化（如胺之 OPA、胺基酸之 FMOC）或換 LC-MS/MS 以求最大靈敏度與選擇性。

### 步驟六：評並精調

1. 進系統適用性標準六次並評：
   - 保留時間 RSD < 1.0%
   - 峰面積 RSD < 2.0%
   - 關鍵對之分離度 >= 2.0
   - 所有峰之拖尾因子 0.8-1.5
   - 每柱理論塔板數達規格
2. 進安慰劑/基質空白以查分析物保留時間之干擾。
3. 進應力或加標樣品以驗法能分降解產物與主分析物。
4. 若任一標準失敗，每次調一變量：
   - 分離差：改 pH、梯度斜率、柱化學
   - 拖尾：加胺改質劑（鹼性者用 TEA）、換緩衝液、試他鍵合相
   - 靈敏度：增進樣體積、濃縮樣品、換檢測器
5. 鎖定最終法之參數並錄所有條件。

**預期：** 所有系統適用性標準達；法可分目標分析物與基質干擾及已知降解產物；參數俱錄以供轉移。

**失敗時：** 迭代調整不解時，考慮根本之別法（換層析模式、2D-LC、衍生化）並回步驟二。

## 驗證

- [ ] 所有目標分析物分離，關鍵對 Rs >= 2.0
- [ ] 六次重複進樣之保留時間 RSD < 1.0%
- [ ] 六次重複進樣之峰面積 RSD < 2.0%
- [ ] 所有分析物峰之拖尾因子 0.8-1.5
- [ ] 分析物保留時間上無基質干擾
- [ ] 降解產物與主分析物分離
- [ ] 運行時間（含再平衡）滿通量要求
- [ ] 流動相與所擇檢測器相容
- [ ] 方法參數俱錄（柱、流動相、梯度、流量、溫度、檢測器）

## 常見陷阱

- **可電離分析物忽流動相 pH**：於分析物 pKa 附近運行，致化合物存兩離子形而出裂峰或重現差。緩衝於 pKa 外至少 2 pH 單位。
- **MS 偵測用磷酸鹽緩衝液**：磷酸鹽非揮發，污染 MS 源。LC-MS 工作用甲酸或醋酸緩衝液。
- **梯度後再平衡不足**：柱於下次進樣前須以至少 5-10 柱體積之初始流動相沖之。再平衡不足致保留時間漂移。
- **複雜混合物擇太短之柱**：短柱（50 mm）雖速，然多組分分離之理論塔板或不足。方法開發自 100-150 mm 始。
- **忽系統死體積**：死體積（混合器至柱頭）延梯度至柱之時。儀器之間此異，致方法轉移失敗。須測並錄之。
- **HILIC 當作反相運行**：HILIC 需高有機（80-95% ACN）配少水。增水則增洗脫力——與 RP 相反。平衡時間亦較久。

## 相關技能

- `develop-gc-method` -- 揮發與半揮發分析物之氣相層析法開發
- `interpret-chromatogram` -- 讀並解 HPLC 與 GC 圖譜
- `troubleshoot-separation` -- 診斷並修峰形、保留、分離度之病
- `validate-analytical-method` -- 所開發 HPLC 法之 ICH Q2 正式驗證
