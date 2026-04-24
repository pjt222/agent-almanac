---
name: develop-gc-method
locale: wenyan-lite
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

# 開發 GC 方法

系統開發氣相層析法：含柱之擇、溫度程序之優化、載氣與檢測器之選、於給定基質中目標分析物之初始性能驗證，俾揮發與半揮發物可分析之。

## 適用時機

- 為揮發或半揮發化合物始新 GC 分析
- 將既刊之法改適於他儀器或他基質
- 取代既有不復滿性能要求之法
- 為已知沸點與極性之化合物開發法
- 由填充柱法過渡至毛細管法

## 輸入

### 必要

- **目標分析物**：化合物列（CAS 號、分子量、沸點）
- **樣品基質**：樣品類型之述（如空氣、水萃取、溶劑溶液、生物流體）
- **檢測限**：每分析物所需之 LOD/LOQ

### 選擇

- **參考法**：用作起點之既刊法（EPA、ASTM、藥典）
- **現有柱**：已有之柱清單
- **儀器配置**：GC 型號、可用檢測器、自動進樣器類型
- **通量要求**：每樣品最大可受之運行時間
- **監管框架**：GLP、GMP、EPA 或他合規背景

## 步驟

### 步驟一：定分析目標

1. 列所有目標分析物及其物理屬性（沸點、極性、分子量）。
2. 辨樣品基質及任何預期干擾或共萃物。
3. 定所需之檢測限、定量範圍、關鍵對之間可受之分離度。
4. 確定法是否須達監管標準（EPA 8260、USP 等）。
5. 錄通量所需：最大運行時間、進樣體積、樣品準備約束。

**預期：** 書面規格，列分析物、基質、檢測限、分離度要求、任何監管或通量約束。

**失敗時：** 分析物揮發性數據闕時，由結構類似物估沸點，或於中極性柱上行偵察運行以立洗脫序。

### 步驟二：擇柱

依分析物極性與分離難度擇柱之尺寸與固定相。

| Column Type | Stationary Phase | Polarity | Typical Use Cases |
|---|---|---|---|
| DB-1 / HP-1 | 100% dimethylpolysiloxane | Non-polar | Hydrocarbons, solvents, general screening |
| DB-5 / HP-5 | 5% phenyl-methylpolysiloxane | Low polarity | Semi-volatiles, EPA 8270, drugs of abuse |
| DB-1701 | 14% cyanopropylphenyl | Mid polarity | Pesticides, herbicides |
| DB-WAX / HP-INNOWax | Polyethylene glycol | Polar | Alcohols, fatty acids, flavors, essential oils |
| DB-624 | 6% cyanopropylphenyl | Mid polarity | Volatile organics, EPA 624/8260 |
| DB-FFAP | Modified PEG (nitroterephthalic acid) | Highly polar | Organic acids, free fatty acids |
| DB-35 | 35% phenyl-methylpolysiloxane | Mid-low polarity | Polychlorinated biphenyls, confirmatory column |

1. 分析物極性合固定相：相溶則擇。
2. 擇柱長（15-60 m）：長則多塔板然運行更久。
3. 擇內徑（0.25-0.53 mm）：窄則效率佳，寬則容量大。
4. 擇膜厚（0.25-5.0 um）：厚膜可多留揮發物。
5. 複雜基質者，考慮護柱或保留間隙。

**預期：** 柱規格（固定相、長、內徑、膜厚），由分析物屬性與分離要求為據。

**失敗時：** 單柱不能分解所有關鍵對時，擬具正交選擇性之確認柱（如主柱 DB-1、確認柱 DB-WAX）。

### 步驟三：優化溫度程序

1. 設初始爐溫至最揮發分析物之沸點或以下（保 1-2 分鐘以作溶劑聚焦）。
2. 施線性斜坡。一般起點：
   - 簡單混合物：10-20 C/min
   - 複雜混合物：3-8 C/min 以求更佳之分離
   - 超快速篩查：於短薄膜柱上 25-40 C/min
3. 設終溫高於最不揮發分析物沸點 10-20 C。
4. 加終保（2-5 分鐘）以確保完全洗脫與柱之烘烤。
5. 共洗脫之關鍵對，於其洗脫前之溫度插等溫保，或於該區減斜坡速率。
6. 驗總運行時間滿通量要求。

**預期：** 溫度程序（初溫、保、斜坡速率、終溫、終保）分離所有目標分析物於可受運行時間內。

**失敗時：** 斜坡優化後關鍵對仍不分時，重審柱之選（步驟二）或考慮多斜坡程序，於問題區用較慢之速率。

### 步驟四：擇載氣

| Property | Helium (He) | Hydrogen (H2) | Nitrogen (N2) |
|---|---|---|---|
| Optimal linear velocity | 20-40 cm/s | 30-60 cm/s | 10-20 cm/s |
| Efficiency at high flow | Good | Best (flat van Deemter) | Poor |
| Speed advantage | Baseline | 1.5-2x faster than He | Slowest |
| Safety | Inert | Flammable (needs leak detection) | Inert |
| Cost / availability | Expensive, supply concerns | Low cost, generator option | Very low cost |
| Detector compatibility | All detectors | Not with ECD; caution with some MS | All detectors |

1. 通用工作與規定用 He 之監管法預設為 He。
2. 欲加速或 He 供應受限時考慮 H2；裝 H2 專用之洩漏偵測與安全聯鎖。
3. 唯簡單分離或以成本為主時用 N2。
4. 將載氣流量設至該氣與柱內徑之最佳線速度。
5. 以不保留化合物（如 FID 上之甲烷）測實際線速度。

**預期：** 載氣已擇，流量設至最佳線速度，以不保留峰測而證之。

**失敗時：** 設定流量下效率低於所期時，以 5-7 流量點生 van Deemter 曲線（塔板高度對線速度）以尋真正之最佳。

### 步驟五：擇檢測器

| Detector | Selectivity | Sensitivity (approx.) | Linear Range | Best For |
|---|---|---|---|---|
| FID | C-H bonds (universal organic) | Low pg C/s | 10^7 | Hydrocarbons, general organics, quantitation |
| TCD | Universal (all compounds) | Low ng | 10^5 | Permanent gases, bulk analysis |
| ECD | Electronegative groups (halogens, nitro) | Low fg (Cl compounds) | 10^4 | Pesticides, PCBs, halogenated solvents |
| NPD/FPD | N, P (NPD); S, P (FPD) | Low pg | 10^4-10^5 | Organophosphorus pesticides, sulfur compounds |
| MS (EI) | Structural identification | Low pg (scan), fg (SIM) | 10^5-10^6 | Unknowns, confirmation, trace analysis |
| MS/MS | Highest selectivity | fg range | 10^5 | Complex matrices, ultra-trace, forensic |

1. 檢測器合於分析物化學與所需靈敏度。
2. 簡單基質之定量工作以 FID 為預設（堅固、線性、維護少）。
3. 複雜基質之痕量分析，宜用 MS 之 SIM 模式或 MS/MS 之 MRM 模式。
4. 痕量之鹵代化合物，ECD 供最佳靈敏度。
5. 檢測器溫度設高於最高爐溫 20-50 C 以防冷凝。
6. 依製造商建議優化檢測器氣流。

**預期：** 檢測器已擇並配，溫度與氣流合於目標分析物。

**失敗時：** 靈敏度不足所需檢測限時，考慮濃縮樣品（增進樣體積、溶劑蒸發）或換更敏更選之檢測器。

### 步驟六：驗初始性能

1. 備系統適用性標準品，含中濃度之所有目標分析物。
2. 連續進標準品六次。
3. 評估：
   - 保留時間 RSD：須 < 1.0%
   - 峰面積 RSD：須 < 2.0%（痕量 < 5.0%）
   - 關鍵對之分離度：Rs >= 1.5（基線）或規範法 >= 2.0
   - 峰拖尾因子：0.8-1.5（USP 標準 T <= 2.0）
   - 理論塔板數（N）：對照柱製造商之規格驗之
4. 進空白以證無殘留或幽靈峰。
5. 進基質空白以辨目標保留時間之可能干擾物。
6. 於方法摘要表錄所有參數。

**預期：** 所有分析物於重複進樣中達系統適用性標準，目標保留窗內無殘留或基質干擾。

**失敗時：** 見拖尾時，查活性位（重調柱、切入口端 0.5 m、換襯管）。RSD 逾限時，查自動進樣器精度與進樣技術。分離度不足時，回步驟三以精調溫度程序。

## 驗證

- [ ] 所有目標分析物皆分離，關鍵對 Rs >= 1.5
- [ ] 六次重複進樣之保留時間 RSD < 1.0%
- [ ] 六次重複進樣之峰面積 RSD < 2.0%
- [ ] 所有分析物之峰拖尾因子於 0.8-1.5 內
- [ ] 空白進樣無殘留逾工作濃度 0.1%
- [ ] 基質空白於目標保留窗內無干擾物
- [ ] 總運行時間滿通量要求
- [ ] 方法參數俱錄（柱、溫、流、檢測器設定）

## 常見陷阱

- **忽柱流失溫度限**：運行高於固定相等溫最高溫致基線升、幽靈峰、柱加速降解。恆查柱規格表。
- **進樣體積過大**：溶劑過多致前沿峰與早洗脫者之分離差。進樣體積合柱容量（0.25 mm ID 柱分流模式常 0.5-2 uL）。
- **進樣模式與襯管不符**：無分流進樣需單錐或雙錐去活襯管；分流進樣用帶玻璃棉之襯管。不符則重現性差。
- **隔墊與襯管維護不足**：隔墊取心與襯管污染為幽靈峰與拖尾之最常源。每 50-100 次進樣換隔墊，依表更換襯管。
- **省略 van Deemter 優化**：用製造商預設流量而不用實測最佳者，損效率，換載氣時尤甚。
- **柱調節不足**：新柱須於載氣流下（無檢測器）升至最高溫以調節之，除製造殘留物，方可供分析用。

## 相關技能

- `develop-hplc-method` -- 非揮發或熱不穩定分析物之液相層析法開發
- `interpret-chromatogram` -- 讀並解 GC 與 HPLC 圖譜
- `troubleshoot-separation` -- 診斷並修峰形、保留、分離度之病
- `validate-analytical-method` -- 所開發 GC 法之 ICH Q2 正式驗證
