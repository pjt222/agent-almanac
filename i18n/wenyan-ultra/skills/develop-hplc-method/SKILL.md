---
name: develop-hplc-method
locale: wenyan-ultra
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

# 立 HPLC 之法

系建高效液相層析法：模擇、柱化、流相與梯設、流與溫優、檢擇、迭代改進，為非揮、熱不穩、或極性分析物於液或複基質。

## 用

- 析非揮、熱不穩或過極（不宜 GC）之物
- 從始建 HPLC-UV、HPLC-螢光、或 LC-MS 法
- 改文獻或藥典 HPLC 法至異柱或儀
- 改分辨差、運時長、或靈敏不足之舊法
- 擇合適層析模（反相、HILIC、離子交換、SEC、手性）

## 入

### 必

- **目分析物**：名、結構、分子量、pKa、logP/logD
- **樣基質**：劑、生液、環萃、或淨液
- **效標**：分辨、檢限、定量域

### 可

- **參考法**：藥典或文獻法為起
- **可用柱**：HPLC 柱錄
- **儀配**：UHPLC vs 常 HPLC、可用檢、柱爐域
- **通量求**：含再平衡之最長運時
- **規約**：ICH、USP、EPA 或他合規

## 行

### 一：定分離標

1. 集分析物性：分子量、pKa、logP（或某 pH 下 logD）、發色、螢光、可離基
2. 識樣基質與預干擾（賦形、內源、降解物）
3. 定效：
   - 關鍵對分辨（規範法 Rs >= 2.0）
   - 檢限（LOD/LOQ）
   - 含梯再平衡之可接運時
4. 斷法為定量、雜析、溶出、均勻、清潔驗—此導驗類
5. 擇等度 vs 梯：諸分析物在 2 < k' < 10 之留因域→等度；否則梯

得：規格書，列分析物及物化性、基質述、效標、等度 vs 梯決。

敗：pKa 或 logP 未知→由結構以工具（ChemAxon、ACD/Labs）估，或於 C18 柱 pH 3、7 運探梯以驗留行。

### 二：擇柱化

依分析物性擇層析模與柱。

| Mode | Column Chemistry | Mobile Phase | Best For |
|---|---|---|---|
| Reversed-phase (RP) | C18 (ODS) | Water/ACN or water/MeOH + acid/buffer | Non-polar to moderately polar, most small molecules |
| RP (extended) | C8, phenyl-hexyl, biphenyl | Water/organic + modifier | Shape selectivity, aromatic compounds, positional isomers |
| RP (polar-embedded) | Amide-C18, polar-endcapped C18 | Water/organic, compatible with high aqueous | Polar analytes that elute too early on standard C18 |
| HILIC | Bare silica, amide, zwitterionic | High organic (80-95% ACN) + aqueous buffer | Very polar, hydrophilic compounds (sugars, amino acids, nucleotides) |
| Ion-exchange (IEX) | SAX or SCX | Buffer with ionic strength gradient | Permanently charged species, proteins, oligonucleotides |
| Size-exclusion (SEC) | Diol-bonded silica, polymer | Isocratic aqueous or organic buffer | Protein aggregates, polymers, molecular weight distribution |
| Chiral | Polysaccharide (amylose/cellulose) | Normal-phase or polar organic mode | Enantiomeric separations, chiral purity |

1. logP > 0 之小分子→反相 C18 為默認
2. logP < 0→評 HILIC 或離子交換
3. 擇粒徑：UHPLC 小於 2 um（高效、高背壓）；常 HPLC 3-5 um
4. 擇柱尺：長 50-150 mm，ID 2.1-4.6 mm。窄柱省溶並增 MS 靈敏
5. 手性分離→篩至少 3-4 異選擇基之手性固定相

得：柱化、尺、粒徑已擇並由分析物性證。

敗：初探於 C18 留差→換更留之相（芳香→phenyl-hexyl）或異模（極性→HILIC）。

### 三：設流相及梯

1. 擇有機改質：
   - 乙腈（ACN）：黏低、峰銳、UV 穿透（< 210 nm）
   - 甲醇（MeOH）：異選擇、時宜極性析物、黏較高
2. 擇水相及 pH：
   - 中性析物：水+0.1% 甲酸（MS 相容）或磷酸緩（僅 UV）
   - 可離析物：緩流相於析物 pKa 之外 2 pH 單位以保單離形
   - pH 2-3（甲／磷酸）：抑酸離，良通用起
   - pH 6-8（甲／乙酸銨）：鹼析或低 pH 選擇不足
   - pH 9-11（碳酸氫銨、BEH 柱）：極鹼於高 pH 穩柱
3. 設梯：
   - 始 5-10% 有機，10-20 分升至 90-95% 為初探
   - 評探層析以識有用有機域
   - 窄梯至僅涵興趣洗脫窗
   - 梯坡：陡→速但分辨低；緩→分辨佳但運長
4. 含柱洗（95% 有機 2-3 分）及再平衡（初條件 5-10 柱體積）
5. 等度法→目標分析物 k' = 3-8

得：流相組（有機、水、緩／添、pH）及梯廓已定，探行確認析物洗脫於程窗內。

敗：選擇差（梯優後仍共洗脫）→換有機（ACN 與 MeOH 互換）、調 pH 2 單位、或為荷析物加離子對試。

### 四：優流率及溫

1. 依柱尺設初流率：
   - 4.6 mm ID：1.0 mL/分
   - 3.0 mm ID：0.4-0.6 mL/分
   - 2.1 mm ID：0.2-0.4 mL/分
2. 驗背壓在儀與柱限內（常 < 400 bar 常、< 1200 bar UHPLC）
3. 優柱溫：
   - 始 30 C 以重現（避環波）
   - 升至 40-60 C 以減黏、降背壓、銳峰
   - 手性柱溫常強影對映選擇→篩 15-45 C
4. 評流率對分辨之影：小增流可增通量而少損分辨，若近 van Deemter 谷
5. 記最佳流率、柱溫、所致背壓

得：流率與柱溫已優，背壓在限內，分辨維持或勝初條件。

敗：背壓過高→減流、增溫、或換寬徑或大粒柱。高溫降分辨→返 30 C 受較長運時。

### 五：擇檢

| Detector | Principle | Sensitivity | Selectivity | Key Considerations |
|---|---|---|---|---|
| UV (single wavelength) | Absorbance at fixed lambda | ng range | Compounds with chromophores | Simple, robust, most common |
| DAD (diode array) | Full UV-Vis spectrum | ng range | Chromophores + spectral ID | Peak purity assessment, library matching |
| Fluorescence (FLD) | Excitation/emission | pg range (10-100x more sensitive than UV) | Native fluorophores or derivatized | Excellent selectivity, requires fluorescent analytes |
| Refractive index (RI) | Bulk property | ug range | Universal (no chromophore needed) | Temperature-sensitive, gradient-incompatible |
| Evaporative light scattering (ELSD) | Nebulization + light scattering | ng range | Universal, non-volatile analytes | Semi-quantitative, non-linear response |
| Charged aerosol (CAD) | Nebulization + corona discharge | ng range | Universal, non-volatile analytes | More uniform response than ELSD |
| Mass spectrometry (MS) | m/z detection | pg-fg range | Structural, highest selectivity | Requires MS-compatible mobile phases |

1. 有 UV 發色基（芳、共軛）之析物→始 DAD—供定量及峰純
2. 複基質痕量→用 MS（ESI、APCI）於 SIM 或 MRM
3. 無發色（糖、脂、聚）→CAD、ELSD 或 RI
4. 檢波於析物吸收峰（lambda-max）最靈敏，或 210-220 nm 為通篩
5. 螢光→以析物光譜掃描優激／發波
6. 流相添加宜相容：MS 勿用磷酸緩，低波勿用 UV 吸收添

得：檢已擇並設（波、增益、取率）合析物化學與靈敏。

敗：UV 靈敏不足於所需 LOQ→考螢光衍生（胺用 OPA、胺酸用 FMOC）或換 LC-MS/MS 為最高靈敏選擇。

### 六：評並改

1. 進系統適用標 6 次並評：
   - 留時 RSD < 1.0%
   - 峰面 RSD < 2.0%
   - 關鍵對分辨 >= 2.0
   - 諸峰拖因 0.8-1.5
   - 塔數符柱規
2. 進安慰劑／基質空白以查析物留時之干擾
3. 進應激或添樣以驗法能分降解物與主析物
4. 某標不過→一次調一變：
   - 分辨差：變 pH、梯坡、或柱化
   - 拖尾：加胺改質（鹼析用 TEA）、變緩、或換鍵相
   - 靈敏：增進量、濃樣、或換檢
5. 鎖末法參並書諸條件

得：諸系統適用標過；法分目析物與基質干擾及已知降解；參已書以轉。

敗：迭調不能解→考根本異策（換層析模、2D-LC、或衍生）並返步二。

## 驗

- [ ] 諸目析物分離，關鍵對 Rs >= 2.0
- [ ] 6 次重複留時 RSD < 1.0%
- [ ] 6 次重複峰面 RSD < 2.0%
- [ ] 諸析物峰拖因 0.8-1.5
- [ ] 析物留時無基質干擾
- [ ] 降解物與主析物分
- [ ] 含再平衡之運時符通量
- [ ] 流相相容所擇檢
- [ ] 法參盡書（柱、流相、梯、流、溫、檢）

## 忌

- **略可離析物之流相 pH**：近 pKa 運行致峰裂或重現差（兩離形）→緩於 pKa 外至少 2 pH 單位
- **MS 用磷酸緩**：磷非揮污 MS 源→LC-MS 用甲酸或乙酸緩
- **梯後再平衡不足**：柱宜以初流相至少 5-10 柱體積沖→再平衡不足致留時漂
- **複合用過短柱**：短柱（50 mm）快但塔不足於多組分分離→法建始 100-150 mm
- **略系死體積**：死體積（混至柱頭）延梯達柱→儀異致法轉失敗→宜測並書
- **以反相之法運 HILIC**：HILIC 宜高有機（80-95% ACN）加少水→增水增洗脫強→與 RP 反。平衡時亦更長

## 參

- `develop-gc-method`
- `interpret-chromatogram`
- `troubleshoot-separation`
- `validate-analytical-method`
