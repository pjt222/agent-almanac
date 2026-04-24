---
name: develop-gc-method
locale: wenyan-ultra
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

# 立氣相層析之法

從始建氣相層析法：定析標、擇柱化、優溫程、擇載氣與檢、驗初效於定基質之分析物。

## 用

- 新立易揮或半揮化合物之 GC 析
- 改published 法至異器或基質
- 替舊法已不足之效
- 為已知沸點與極性之物立法
- 由填充柱法轉毛細管法

## 入

### 必

- **目分析物**：化合物名單（CAS 號、分子量、沸點）
- **樣基質**：樣類述（空氣、水萃、溶劑液、生液）
- **檢測限**：各分析物所需 LOD/LOQ

### 可

- **參考法**：published 法（EPA、ASTM、藥典）為起點
- **可用柱**：已有之柱錄
- **儀配**：GC 型、可用檢、自動進樣
- **通量求**：單樣可接之最長運時
- **規約**：GLP、GMP、EPA 或他合規

## 行

### 一：定析標

1. 列諸目分析物及其物性（沸點、極性、分子量）
2. 識樣基質及預期干擾或共萃物
3. 定檢限、定量域、及關鍵對之分辨求
4. 斷法宜符規範（EPA 8260、USP 等）
5. 記通量需：最長運時、進樣量、樣備之限

得：書定規格，列分析物、基質、檢限、分辨求、諸規或通量之限。

敗：揮性數缺→由結構類推沸點或用中極柱探行以立洗脫序。

### 二：擇柱

依分析物極性及分離難度擇柱尺與固定相。

| Column Type | Stationary Phase | Polarity | Typical Use Cases |
|---|---|---|---|
| DB-1 / HP-1 | 100% dimethylpolysiloxane | Non-polar | Hydrocarbons, solvents, general screening |
| DB-5 / HP-5 | 5% phenyl-methylpolysiloxane | Low polarity | Semi-volatiles, EPA 8270, drugs of abuse |
| DB-1701 | 14% cyanopropylphenyl | Mid polarity | Pesticides, herbicides |
| DB-WAX / HP-INNOWax | Polyethylene glycol | Polar | Alcohols, fatty acids, flavors, essential oils |
| DB-624 | 6% cyanopropylphenyl | Mid polarity | Volatile organics, EPA 624/8260 |
| DB-FFAP | Modified PEG (nitroterephthalic acid) | Highly polar | Organic acids, free fatty acids |
| DB-35 | 35% phenyl-methylpolysiloxane | Mid-low polarity | Polychlorinated biphenyls, confirmatory column |

1. 分析物極性配固定相：相似者溶相似者
2. 擇柱長（15-60 m）：長則塔數多但運時長
3. 擇內徑（0.25-0.53 mm）：窄則效佳，寬則容大
4. 擇膜厚（0.25-5.0 um）：厚則留揮物更久
5. 複雜基質→考護柱或保留間隙

得：柱規（相、長、ID、膜厚），由分析物性及分離求而證。

敗：無單柱能分諸關鍵對→計正交選擇性之確認柱（如 DB-1 主，DB-WAX 確）。

### 三：優溫程

1. 初爐溫置於最揮分析物沸點之下（留 1-2 分以聚焦溶劑）
2. 施線升：
   - 簡合：10-20 C/分
   - 雜合：3-8 C/分以勝分辨
   - 超快篩：短薄膜柱 25-40 C/分
3. 末溫設於最不揮分析物沸點之上 10-20 C
4. 末留（2-5 分）以保全洗脫及柱烘
5. 共洗關鍵對→於洗脫前插等溫留，或減該區升率
6. 驗總運時符通量

得：溫程（初、留、升率、末、末留）分諸分析物於可接運時內。

敗：關鍵對升率優後仍不分→返步二重擇柱，或用多升率（問題區慢）。

### 四：擇載氣

| Property | Helium (He) | Hydrogen (H2) | Nitrogen (N2) |
|---|---|---|---|
| Optimal linear velocity | 20-40 cm/s | 30-60 cm/s | 10-20 cm/s |
| Efficiency at high flow | Good | Best (flat van Deemter) | Poor |
| Speed advantage | Baseline | 1.5-2x faster than He | Slowest |
| Safety | Inert | Flammable (needs leak detection) | Inert |
| Cost / availability | Expensive, supply concerns | Low cost, generator option | Very low cost |
| Detector compatibility | All detectors | Not with ECD; caution with some MS | All detectors |

1. 通用及定指 He 之規範法→默認氦
2. 求快或氦供緊→考氫；裝氫專漏偵及安聯
3. 僅簡分離或價為主→用氮
4. 設載流至所擇氣及柱 ID 之最佳線速
5. 以無留化合物（如 FID 之甲烷）測實線速

得：載氣已擇，流設最佳線速，由無留峰驗。

敗：設流下效低預期→用 5-7 流率作 van Deemter 曲線（塔高 vs 線速）以得真最佳。

### 五：擇檢

| Detector | Selectivity | Sensitivity (approx.) | Linear Range | Best For |
|---|---|---|---|---|
| FID | C-H bonds (universal organic) | Low pg C/s | 10^7 | Hydrocarbons, general organics, quantitation |
| TCD | Universal (all compounds) | Low ng | 10^5 | Permanent gases, bulk analysis |
| ECD | Electronegative groups (halogens, nitro) | Low fg (Cl compounds) | 10^4 | Pesticides, PCBs, halogenated solvents |
| NPD/FPD | N, P (NPD); S, P (FPD) | Low pg | 10^4-10^5 | Organophosphorus pesticides, sulfur compounds |
| MS (EI) | Structural identification | Low pg (scan), fg (SIM) | 10^5-10^6 | Unknowns, confirmation, trace analysis |
| MS/MS | Highest selectivity | fg range | 10^5 | Complex matrices, ultra-trace, forensic |

1. 檢配分析物化學及所需靈敏
2. 簡基質定量→FID 為默認（堅、線、少修）
3. 複基質痕量析→SIM 之 MS 或 MRM 之 MS/MS
4. 鹵化痕量→ECD 最靈敏
5. 檢溫設於最高爐溫之上 20-50 C 以防凝
6. 檢氣流按廠商建議優

得：檢已擇並設合適溫與氣流以符目分析物。

敗：檢靈敏不足於所求限→考濃樣（大進量、溶發）或換更靈敏／選擇之檢。

### 六：驗初效

1. 備含諸目分析物於中濃之系統適用標
2. 連進 6 次
3. 評：
   - 留時 RSD：宜 < 1.0%
   - 峰面 RSD：宜 < 2.0%（痕量 < 5.0%）
   - 關鍵對分辨：Rs >= 1.5（基線）或規範法 >= 2.0
   - 峰拖因：0.8-1.5（USP T <= 2.0）
   - 塔數 (N)：驗符柱廠規
4. 進空白以確無殘留或鬼峰
5. 進基質空白以識潛在干擾於目留時
6. 諸參記於法摘

得：諸分析物符系統適用於重複進樣，目留窗無殘留或基質干擾。

敗：現拖尾→查活位（重調柱、剪進口 0.5 m、換內管）。RSD 超限→查自動進樣精及進法。分辨不足→返步三優溫程。

## 驗

- [ ] 諸目分析物分離，關鍵對 Rs >= 1.5
- [ ] 6 次重複留時 RSD < 1.0%
- [ ] 6 次重複峰面 RSD < 2.0%
- [ ] 諸分析物拖因在 0.8-1.5
- [ ] 空白進無殘留逾工作濃 0.1%
- [ ] 基質空白目留窗無干擾
- [ ] 總運時符通量
- [ ] 法參盡記（柱、溫、流、檢設）

## 忌

- **略柱流失溫限**：運行於固定相最高等溫之上→基線升、鬼峰、柱速降→常查柱規
- **進樣過大**：溶過多致早洗脫物前拖及分辨差→配進量於柱容（0.25 mm ID 柱分流常 0.5-2 uL）
- **錯內管配進模**：不分流須單錐或雙錐去活內管；分流用含玻棉內管。錯配致重現差
- **略墊片及內管維**：墊片心塊及內管污為鬼峰拖尾之首因→每 50-100 進換墊，內管按記排程換
- **略 van Deemter 優**：用廠商默認流率而非實測最佳→廢效，尤換載氣時
- **柱調不足**：新柱宜調（載氣下升至最高溫，無檢）以去製造殘前可用

## 參

- `develop-hplc-method`
- `interpret-chromatogram`
- `troubleshoot-separation`
- `validate-analytical-method`
