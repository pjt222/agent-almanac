---
name: develop-gc-method
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Develop a gas chromatography method from scratch: define analytical objectives,
  select column chemistry, optimize temperature programming, choose carrier gas
  and detector, and validate initial system performance for target analytes in
  a given matrix.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: advanced
  language: natural
  tags: chromatography, gc, gas-chromatography, method-development, separation
---

# 氣相色譜法之發展

為定基質中所標揮發與半揮發分析物，系統發展氣相色譜法：擇柱、調溫程、擇載氣與檢測器、驗初始性能。

## 用時

- 為揮發或半揮發化合物始新 GC 分析
- 將已發表之法適於他儀器或基質
- 更舊法不再合性能之要
- 為已知沸點與極性之化合物發展法
- 由填充柱法轉毛細柱法

## 入

### 必要

- **目標分析物**：化合物及其 CAS 號、分子量、沸點
- **樣品基質**：樣品類型之述（如空氣、水提取物、溶劑溶液、生物液體）
- **檢測限**：各分析物所需 LOD/LOQ

### 可選

- **參考法**：以作起點之已發表法（EPA、ASTM、藥典）
- **可用柱**：現有柱之清單
- **儀器配置**：GC 型號、可用檢測器、自動進樣器型
- **通量之要**：單樣最大可接之運行時
- **監管框架**：GLP、GMP、EPA 或他合規上下文

## 法

### 第一步：定分析目標

1. 列諸目標分析物及物性（沸點、極性、分子量）
2. 識樣品基質及預期干擾或共提取物
3. 明所需檢測限、定量範圍、關鍵對之可接分離
4. 定法是否須合監管標準（EPA 8260、USP 等）
5. 書通量之需：最大運行時、進樣量、樣品製備之限

**得：** 書面規格列分析物、基質、檢測限、分離要求、諸監管或通量之限。

**敗則：** 揮發性資料缺則由結構類似物估沸點，或於中極性柱上作掃描以定洗脫序。

### 第二步：擇柱

依分析物極性與分離之難擇柱尺寸與固定相。

| Column Type | Stationary Phase | Polarity | Typical Use Cases |
|---|---|---|---|
| DB-1 / HP-1 | 100% dimethylpolysiloxane | Non-polar | Hydrocarbons, solvents, general screening |
| DB-5 / HP-5 | 5% phenyl-methylpolysiloxane | Low polarity | Semi-volatiles, EPA 8270, drugs of abuse |
| DB-1701 | 14% cyanopropylphenyl | Mid polarity | Pesticides, herbicides |
| DB-WAX / HP-INNOWax | Polyethylene glycol | Polar | Alcohols, fatty acids, flavors, essential oils |
| DB-624 | 6% cyanopropylphenyl | Mid polarity | Volatile organics, EPA 624/8260 |
| DB-FFAP | Modified PEG (nitroterephthalic acid) | Highly polar | Organic acids, free fatty acids |
| DB-35 | 35% phenyl-methylpolysiloxane | Mid-low polarity | Polychlorinated biphenyls, confirmatory column |

1. 分析物極性配固定相：相似者溶之
2. 擇柱長（15-60 m）：長者塔板更多然運行時亦長
3. 擇內徑（0.25-0.53 mm）：窄者效率佳，寬者容量大
4. 擇膜厚（0.25-5.0 um）：厚膜留揮發物更久
5. 基質複雜則考保護柱或保留間隙

**得：** 柱規格（相、長、ID、膜厚）已定，其理繫於分析物之性與分離之要。

**敗則：** 無單柱能分諸關鍵對則謀具正交選擇性之確認柱（如主 DB-1，確認 DB-WAX）。

### 第三步：調溫程

1. 初始爐溫於最揮發分析物之沸點或以下（保 1-2 分以聚焦溶劑）
2. 用線性升溫。一般起點：
   - 簡單混合物：10-20 C/min
   - 複雜混合物：3-8 C/min 以得更好分離
   - 超快篩選：短薄膜柱上 25-40 C/min
3. 終溫設於最不揮發分析物沸點之上 10-20 C
4. 加終保（2-5 min）以確保全洗脫與柱烘乾
5. 關鍵對共洗脫者於其洗脫前插入恆溫保持，或於該區減慢升溫率
6. 驗總運行時合通量之要

**得：** 溫程（初溫、保、升溫率、終溫、終保）已定，可於可接運行時內分諸目標分析物。

**敗則：** 升溫優化後關鍵對仍不分則重察柱擇（第二步），或用多斜率程於問題區以更慢率。

### 第四步：擇載氣

| Property | Helium (He) | Hydrogen (H2) | Nitrogen (N2) |
|---|---|---|---|
| Optimal linear velocity | 20-40 cm/s | 30-60 cm/s | 10-20 cm/s |
| Efficiency at high flow | Good | Best (flat van Deemter) | Poor |
| Speed advantage | Baseline | 1.5-2x faster than He | Slowest |
| Safety | Inert | Flammable (needs leak detection) | Inert |
| Cost / availability | Expensive, supply concerns | Low cost, generator option | Very low cost |
| Detector compatibility | All detectors | Not with ECD; caution with some MS | All detectors |

1. 一般用及監管法指定 He 者默認用氦
2. 欲快或氦供緊則考氫；裝氫專用洩漏察與安全聯鎖
3. 氮僅用於簡單分離或以成本為首要
4. 載氣流設於所擇氣與柱 ID 之最優線速
5. 以未保留化合物（如 FID 上甲烷）測實線速

**得：** 載氣已擇，流率設於最優線速，以未保留峰證之。

**敗則：** 所設流下效率低於預期則用 5-7 流率生 van Deemter 曲線（塔板高對線速）以得真最優。

### 第五步：擇檢測器

| Detector | Selectivity | Sensitivity (approx.) | Linear Range | Best For |
|---|---|---|---|---|
| FID | C-H bonds (universal organic) | Low pg C/s | 10^7 | Hydrocarbons, general organics, quantitation |
| TCD | Universal (all compounds) | Low ng | 10^5 | Permanent gases, bulk analysis |
| ECD | Electronegative groups (halogens, nitro) | Low fg (Cl compounds) | 10^4 | Pesticides, PCBs, halogenated solvents |
| NPD/FPD | N, P (NPD); S, P (FPD) | Low pg | 10^4-10^5 | Organophosphorus pesticides, sulfur compounds |
| MS (EI) | Structural identification | Low pg (scan), fg (SIM) | 10^5-10^6 | Unknowns, confirmation, trace analysis |
| MS/MS | Highest selectivity | fg range | 10^5 | Complex matrices, ultra-trace, forensic |

1. 檢測器配分析物化學與所需靈敏度
2. 簡單基質之定量工作 FID 為默認（穩、線性、少維護）
3. 複雜基質中痕量分析宜用 SIM 模之 MS 或 MRM 模之 MS/MS
4. 痕量之鹵化合物 ECD 靈敏最佳
5. 檢測器溫於最高爐溫之上 20-50 C 以防凝結
6. 檢測器氣流按廠商建議優化

**得：** 檢測器已擇且配相當之溫與氣流以適目標分析物。

**敗則：** 檢測器靈敏於所需檢測限不足則考濃縮樣品（更大進樣量、溶劑蒸發）或換更靈敏／選擇性之檢測器。

### 第六步：驗初始性能

1. 備含諸目標分析物於中範圍濃度之系統適用性標液
2. 連續進樣 6 次
3. 評：
   - 保留時 RSD：須 < 1.0%
   - 峰面積 RSD：須 < 2.0%（痕量級 < 5.0%）
   - 關鍵對之分離：Rs >= 1.5（基線）或監管法 >= 2.0
   - 峰拖尾因子：0.8-1.5（USP 準 T <= 2.0）
   - 理論塔板（N）：驗對柱廠商規格
4. 進空白以證無殘留或幽靈峰
5. 進基質空白以識目標保留時之潛在干擾
6. 諸參於法摘要書之

**得：** 諸分析物於重複進樣中合系統適用性準則，無殘留或基質干擾於目標保留窗。

**敗則：** 觀得拖尾則察活性位點（重整柱、切入口 0.5 m、換襯管）。RSD 逾限則查自動進樣器精度與進樣技。分離不足則返第三步改溫程。

## 驗

- [ ] 諸目標分析物分離，關鍵對 Rs >= 1.5
- [ ] 6 次重複進樣保留時 RSD < 1.0%
- [ ] 6 次重複進樣峰面積 RSD < 2.0%
- [ ] 諸分析物峰拖尾因子在 0.8-1.5
- [ ] 空白進樣殘留不逾工作濃度之 0.1%
- [ ] 基質空白於目標保留窗無干擾
- [ ] 總運行時合通量之要
- [ ] 法參已全書（柱、溫、流、檢測器設置）

## 陷

- **略柱流失之溫限**：運行於固定相最大恆溫以上致基線升、幽靈峰、柱加速退化。恆察柱規格表
- **進樣量過大**：進樣過多溶劑致前沿峰與早洗脫物分離不佳。進樣量配柱容量（0.25 mm ID 柱分流模式常 0.5-2 uL）
- **襯管不合進樣模式**：分流預備需單錐或雙錐去活襯管；分流進樣用含玻璃棉襯管。不合致重複性差
- **略隔墊與襯管維護**：隔墊鑿孔與襯管污染為幽靈峰與拖尾之最常源。50-100 次進樣後換隔墊，按書定期換襯管
- **略 van Deemter 優化**：於廠商默認流率而非實測最優率致效率浪費，尤其換載氣時
- **柱調理不足**：新柱須調理（於載氣流下升至最高溫，無檢測器）以去製造殘渣始可作分析

## 參

- `develop-hplc-method` — 為不揮發或熱不穩分析物發展液相色譜法
- `interpret-chromatogram` — 讀並釋 GC 與 HPLC 色譜圖
- `troubleshoot-separation` — 診並修峰形、保留、分離之問題
- `validate-analytical-method` — 所發 GC 法之正式 ICH Q2 驗證
