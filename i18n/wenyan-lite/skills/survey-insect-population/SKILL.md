---
name: survey-insect-population
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Design and execute insect population surveys covering survey design, sampling
  methods, field execution, specimen identification, diversity index calculation
  including Shannon-Wiener and Simpson indices, statistical analysis, and
  reporting. Covers defining survey objectives, selecting study sites, determining
  sampling intensity and replication, choosing sampling methods appropriate to
  target taxa, standardizing collection effort, recording environmental covariates,
  identifying specimens to the lowest practical taxonomic level, calculating species
  richness, Shannon-Wiener diversity (H'), Simpson diversity (1-D), evenness,
  rarefaction curves, multivariate ordination, and producing survey reports with
  species lists and conservation implications. Use when conducting baseline
  biodiversity assessments, monitoring insect populations over time, comparing
  insect communities across habitats or treatments, assessing environmental
  impact, or supporting conservation planning with quantitative ecological data.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: advanced
  language: natural
  tags: entomology, insects, population, survey, ecology, biodiversity, Shannon, Simpson
---

# 調查昆蟲族群

設計並執行系統化之昆蟲族群調查，含標準化取樣、多樣性分析與量化報告。

## 適用時機

- 進行某地區之基線生物多樣性評估
- 監測昆蟲族群隨時間之變化（年度調查、前後對比研究）
- 比較跨棲地、處理或梯度之昆蟲群落
- 評估環境衝擊（建設、農藥使用、棲地復育）
- 需量化生態資料以支援保育規劃或管理決策
- 為區域或國家生物多樣性監測計劃貢獻

## 輸入

- **必要**：明確之研究目標（調查在回答何問？）
- **必要**：具合法採集權限之研究地點（見 `collect-preserve-specimens`）
- **必要**：與目標分類群與棲地相符之取樣裝備
- **必要**：識別資源（檢索表、指南或可諮詢分類專家）
- **選擇性**：GPS 裝置以為取樣點地理參考
- **選擇性**：環境監測裝備（溫度計、濕度計、風速計）
- **選擇性**：多樣性分析之統計軟體（R、PAST、EstimateS）
- **選擇性**：該地之先前調查資料（比較之基線）

## 步驟

### 步驟一：設計調查

定義你欲學者、何處取樣、投入多少功夫。調查設計決定其後一切之統計力與生態效度。

```
Survey Design Framework:
+--------------------+------------------------------------------+
| Component          | Define Before Fieldwork                  |
+--------------------+------------------------------------------+
| Objectives         | What ecological question does this       |
|                    | survey answer? Examples:                 |
|                    | - "What is the species richness of       |
|                    |   ground beetles at Site A?"             |
|                    | - "How does pollinator diversity differ   |
|                    |   between restored and unrestored        |
|                    |   meadows?"                              |
|                    | - "Has moth diversity changed since the   |
|                    |   2020 baseline survey?"                 |
+--------------------+------------------------------------------+
| Target taxa        | All insects? A specific order (e.g.,     |
|                    | Coleoptera)? A functional group (e.g.,   |
|                    | pollinators)? Narrower focus = more      |
|                    | reliable identification and analysis.    |
+--------------------+------------------------------------------+
| Study site(s)      | Geographic boundaries of the survey      |
|                    | area. Map the site. Identify distinct    |
|                    | habitat types within the site.           |
+--------------------+------------------------------------------+
| Sampling design    | Random, stratified random, or systematic |
|                    | placement of sampling points/transects.  |
|                    | Stratify by habitat type if the site     |
|                    | is heterogeneous.                        |
+--------------------+------------------------------------------+
| Replication        | Minimum 3 replicates per habitat type    |
|                    | or treatment. More replicates increase   |
|                    | statistical power but require more       |
|                    | effort. For species accumulation curves  |
|                    | to stabilize, 5-10 replicates per       |
|                    | habitat are often needed.                |
+--------------------+------------------------------------------+
| Temporal scope     | Single survey (snapshot) or repeated     |
|                    | surveys (monitoring)? If monitoring,     |
|                    | define frequency (monthly, seasonal,     |
|                    | annual). Match frequency to the          |
|                    | phenology of target taxa.                |
+--------------------+------------------------------------------+
| Effort             | Define standardized effort per sample:   |
|                    | "20 sweep net sweeps per transect" or    |
|                    | "pitfall traps open for 72 hours" or     |
|                    | "light trap operated 20:00-02:00."       |
|                    | Consistent effort across samples is      |
|                    | essential for comparison.                |
+--------------------+------------------------------------------+
```

**預期：** 一書面調查協定，指明目標、目標分類群、地點描述、取樣設計（隨機／分層／系統）、重複次數、時間範圍與每樣本標準化之功夫。

**失敗時：** 若調查目標含混（「看此處有何昆蟲」），於進行前精煉為可測之問。無清楚目標之調查無法妥善設計，所得資料或無法答任何問。若地點存取受限，於限制內修改設計，而非將每比較組之重複降至 3 以下。

### 步驟二：選擇取樣方法

依目標分類群、棲地與調查目標選方法。不同方法有不同捕獲偏差。

```
Method Selection by Target Taxa:
+--------------------+------------------------------------------+
| Target             | Recommended Methods                      |
+--------------------+------------------------------------------+
| Ground-dwelling    | Pitfall traps (primary), hand collection |
| insects (Carabidae,| under rocks/logs, bark traps, Berlese    |
| Staphylinidae,     | funnels for soil fauna                   |
| ants, crickets)    |                                          |
+--------------------+------------------------------------------+
| Vegetation-        | Sweep netting (primary), beating trays,  |
| dwelling insects   | vacuum sampling (D-vac or G-vac),        |
| (Hemiptera,        | branch clipping for canopy               |
| Chrysomelidae,     |                                          |
| Orthoptera)        |                                          |
+--------------------+------------------------------------------+
| Flying insects     | Malaise traps (Diptera, Hymenoptera),    |
| (general)          | flight intercept traps, window traps     |
+--------------------+------------------------------------------+
| Pollinators        | Pan traps (yellow, white, blue bowls),   |
| (bees, hoverflies) | transect counts (visual observation),    |
|                    | sweep netting on floral resources        |
+--------------------+------------------------------------------+
| Nocturnal flying   | Light traps (mercury vapor or UV),       |
| insects (moths,    | sugar baiting (for moths), light sheets  |
| many beetles)      |                                          |
+--------------------+------------------------------------------+
| Aquatic insects    | Kick-net sampling (streams), D-frame     |
| (Ephemeroptera,    | net sampling, Surber sampler             |
| Plecoptera,        | (quantitative), artificial substrates    |
| Trichoptera)       |                                          |
+--------------------+------------------------------------------+
| Butterflies        | Pollard walk transect counts (standard   |
|                    | visual survey method for butterflies),   |
|                    | timed counts per habitat patch           |
+--------------------+------------------------------------------+

Standardization Rules:
- Use the same method, equipment, and effort at every sample point
- Record start and end times for every sampling event
- If using traps, record deployment and retrieval times exactly
- Weather-dependent methods (sweep netting, transect walks) should
  only run under acceptable conditions (no heavy rain, temperature
  above activity threshold for target taxa)
```

**預期：** 為目標分類群擇且論證一或多種取樣方法，跨所有重複與取樣點皆標準化功夫。

**失敗時：** 若單一方法產出標本過少而難分析，考慮加互補方法。然不同方法之資料應分別分析——勿於同一多樣性分析中將陷阱資料與掃網資料合併，因其取樣群落之不同部分且捕獲機率不同。

### 步驟三：執行田野工作

部署取樣裝備、行採集、記分析所需之全部後設資料。

```
Field Execution Checklist:

Before each sampling event:
- [ ] Record date, time, GPS coordinates of sample point
- [ ] Record environmental covariates (temperature, humidity, wind,
      cloud cover) — see observe-insect-behavior for details
- [ ] Verify equipment is clean and functional
- [ ] Label collection containers with site, date, replicate number

During sampling:
- [ ] Follow the standardized effort exactly (same number of sweeps,
      same trap duration, same transect length)
- [ ] Keep specimens from each sample point in separate, labeled
      containers — never mix samples
- [ ] Record any deviations from protocol (e.g., "trap knocked over
      by animal, collected after 48h instead of 72h")
- [ ] Note any unusual observations (mass emergence, swarming events,
      absence of expected taxa)

After each sampling event:
- [ ] Verify all containers are labeled
- [ ] Record end time and any changes in weather during sampling
- [ ] Preserve specimens promptly (kill jar or ethanol) — do not leave
      live specimens in collection bags for extended periods
- [ ] Store preserved specimens in a cool location until processing
```

**預期：** 所有計劃樣本皆以標準化功夫採集，每樣本於分離標籤容器中，每取樣事件皆記完整後設資料。

**失敗時：** 若某樣本受損（陷阱被擾、掃網時大雨），記問題並或棄該樣本或記其為潛在離群。少一重複勝於含受損資料。若天候阻計劃日之取樣，重排至最近合適日——勿於不合條件下嘗試取樣。

### 步驟四：識別標本

將所採標本分類並識至最低可行之分類層級。此通常為最耗時之步驟。

```
Identification Workflow:

1. SORT to order — separate beetles from flies from wasps etc.
   Use the dichotomous key in the identify-insect skill.

2. SORT to morphospecies within each order — group visually
   identical specimens together. Assign a temporary code
   (e.g., "Coleoptera sp. 01", "Diptera sp. 14").

3. IDENTIFY morphospecies to the lowest level achievable:
   - Family (achievable for most insects with general keys)
   - Genus (achievable for well-studied groups with regional keys)
   - Species (achievable for well-known groups; may require
     specialist confirmation for others)

4. VERIFY identifications by:
   - Cross-checking multiple specimens of each morphospecies
   - Comparing against reference collections
   - Sending representative specimens to taxonomic specialists
     for difficult groups

5. RECORD in a species-by-sample matrix:
   Rows = species (or morphospecies)
   Columns = sample points
   Cells = abundance (count of individuals)

   Example:
                   Site A    Site A    Site B    Site B
                   Rep 1     Rep 2     Rep 1     Rep 2
   Carabidae sp.01    12        8        3         5
   Carabidae sp.02     0        1        7         9
   Staphyl. sp.01      3        4        2         1
   ...

Taxonomic Resolution:
- For diversity comparisons, all specimens must be identified to
  the SAME taxonomic level. Do not mix species-level IDs with
  order-level IDs in the same analysis.
- Morphospecies sorting is acceptable and widely used in ecological
  surveys, especially in tropical regions or poorly known taxa.
- Keep voucher specimens for every morphospecies (see
  collect-preserve-specimens) so identifications can be verified later.
```

**預期：** 所有標本已分類並至少識至形態種層級，記於物種對樣本豐度矩陣中，每形態種保留憑證標本。

**失敗時：** 若某些群即使形態種亦無法識（如極小且皆似之雙翅目），記為集合分類群（如「Diptera spp. unsorted」）並註限。將解析不良之群排除於多樣性分析之外，勿引入不確定之識別。若識別停滯，將標本送專家——此於專業調查中正常且必然。

### 步驟五：計算多樣性指標

將物種對樣本豐度矩陣轉為量化多樣性度量。

```
Diversity Metrics:

1. SPECIES RICHNESS (S)
   The simplest measure: count of distinct species (or morphospecies)
   in a sample.
   Example: 23 morphospecies in Site A pitfall traps.

2. SHANNON-WIENER DIVERSITY INDEX (H')
   Accounts for both richness and evenness.

   H' = - SUM( pi * ln(pi) )

   where pi = proportion of total individuals belonging to species i
   (pi = ni / N, where ni = count of species i, N = total individuals)

   Interpretation:
   - Typical range: 1.5 to 3.5 for most ecological communities
   - Higher values = more diverse (more species, more evenly distributed)
   - H' = 0 when only one species is present
   - Maximum H' = ln(S) when all species are equally abundant

3. SIMPSON DIVERSITY INDEX (1 - D)
   Probability that two randomly chosen individuals belong to different
   species.

   D = SUM( pi^2 )
   Simpson diversity = 1 - D

   Interpretation:
   - Range: 0 to 1
   - Higher values = more diverse
   - Less sensitive to rare species than Shannon; dominated by
     common species
   - 1 - D = 0.9 means a 90% chance two random individuals are
     different species

4. EVENNESS (J')
   How equally individuals are distributed among species.

   J' = H' / ln(S)

   Interpretation:
   - Range: 0 to 1
   - J' = 1 means all species equally abundant
   - J' close to 0 means one or few species dominate

5. RAREFACTION
   Compares richness between samples with different total abundances
   by estimating how many species would be found if all samples had
   the same number of individuals.
   - Essential when sample sizes differ (they almost always do)
   - Plot rarefaction curves: species vs. individuals sampled
   - If the curve plateaus, sampling has captured most species
   - If the curve is still rising steeply, more sampling is needed
```

**預期：** 物種豐富度、Shannon-Wiener 指數、Simpson 指數與均勻度已為每樣本與每地點／處理計算。已繪稀疏化曲線以評估取樣完備度。

**失敗時：** 若樣本量過小而難求可靠之多樣性計算（每樣本少於 30 個體），報告原始物種計數與豐度，而非計算之指標。小樣本產生不可靠之指標值與大信賴區間。註小樣本量為限制並建議未來調查增加取樣功夫。

### 步驟六：行統計分析

以合適統計法比較跨地點、處理或時段之多樣性。

```
Analysis Approaches:

1. COMPARING TWO OR MORE SITES/TREATMENTS:
   - Shannon H' values: use Hutcheson's t-test for pairwise comparison
     of Shannon indices, which accounts for differences in sample size
   - Species richness: use rarefied richness for fair comparison
   - Abundance data: use Mann-Whitney U test (2 groups) or
     Kruskal-Wallis test (3+ groups) for non-normal count data

2. MULTIVARIATE COMMUNITY ANALYSIS:
   When comparing entire community composition (not just summary indices):
   - Bray-Curtis dissimilarity matrix: quantifies compositional
     difference between every pair of samples
   - NMDS (Non-metric Multidimensional Scaling): ordination that
     visualizes community similarity in 2D — samples close together
     have similar communities
   - PCoA (Principal Coordinates Analysis): alternative ordination
     based on distance matrices
   - PERMANOVA (permutational ANOVA): tests whether community
     composition differs significantly between groups
   - SIMPER: identifies which species contribute most to differences
     between groups

3. TEMPORAL TRENDS (monitoring data):
   - Plot species richness and diversity indices over time
   - Use linear regression or generalized linear models to test
     for trends
   - Account for seasonal variation by comparing same-season samples
     across years

4. SPECIES ACCUMULATION CURVES:
   - Plot cumulative species against cumulative samples
   - Use Chao1 or Chao2 estimators to predict total species richness
     (including undetected species)
   - If observed richness is far below the Chao estimate, more
     sampling is needed

Minimum Reporting:
- Sample sizes (number of individuals and number of samples)
- Diversity indices with confidence intervals or standard errors
- Statistical test used, test statistic, degrees of freedom, p-value
- Effect sizes where applicable
```

**預期：** 已完成統計比較且用合適之檢定，結果連同檢定統計量與 p 值報告，並提供生態詮釋。

**失敗時：** 若重複不足以行正式統計檢定（每組少於 3 重複），報告描述統計（均值、範圍）與稀疏化曲線而不行假設檢定。承認限制並建議未來調查增加重複。良好執行調查之描述資料勝於力不足設計之 p 值。

### 步驟七：報告結果

將調查匯為結構化報告，可告管理決策、支持發表，或為未來監測之基線。

```
Survey Report Structure:

1. SUMMARY
   - Survey objectives
   - Key findings (total species, dominant taxa, notable records)
   - Primary conclusion (1-2 sentences)

2. METHODS
   - Study site description (location, habitat, area, map)
   - Sampling design and methods
   - Sampling effort (number of samples, trap-nights, transect length)
   - Identification methods and taxonomic resolution
   - Statistical methods
   - Survey dates and environmental conditions

3. RESULTS
   - Total specimens collected and identified
   - Species list with abundances per site/treatment
   - Diversity indices table (S, H', 1-D, J' per site/treatment)
   - Rarefaction curves
   - Statistical comparison results
   - Ordination plots (if multivariate analysis performed)
   - Notable records (rare species, new records, invasive species)

4. DISCUSSION
   - How do results compare to previous surveys or nearby sites?
   - What ecological factors explain observed patterns?
   - What are the conservation implications?
   - What are the limitations of this survey?

5. RECOMMENDATIONS
   - Management actions (if applicable)
   - Future monitoring schedule
   - Suggested improvements to survey design

6. APPENDICES
   - Full species list with abundances
   - Raw data (species-by-sample matrix)
   - Environmental covariate data
   - Voucher specimen catalog numbers and repository
   - Photographs of notable specimens or habitats

Data Archiving:
- Deposit raw data in an appropriate repository (Dryad, Zenodo, GBIF)
- Deposit voucher specimens in a recognized museum collection
- Archive the survey report with the managing agency or institution
```

**預期：** 完整之調查報告，含方法、結果（含物種清單、多樣性指標、統計檢定）、討論與建議。原始資料已歸檔於存取庫。

**失敗時：** 若調查不完整（如未識所有標本、重複不足以行統計），以可得者出初步報告並明標為初步。識別差距與完成時程。誠實標註限制之初步報告勝於無報告。

## 驗證

- [ ] 田野工作前已定義調查目標
- [ ] 取樣設計含重複（每比較組至少 3）
- [ ] 跨所有樣本之取樣功夫已標準化
- [ ] 每樣本分離且含完整後設資料之標籤
- [ ] 每取樣事件皆記環境共變量
- [ ] 標本識至一致分類層級且憑證標本已保存
- [ ] 已建構物種對樣本之豐度矩陣
- [ ] 已計算多樣性指標（Shannon、Simpson、豐富度、均勻度）
- [ ] 已繪稀疏化曲線以評估取樣完備度
- [ ] 統計比較用合適檢定且報告檢定統計量
- [ ] 結果匯為含物種清單與建議之結構化報告

## 常見陷阱

- **未標準化功夫**：將 10 掃樣本與 50 掃樣本相比混淆功夫與多樣性。每樣本須受同等功夫——同掃次、同陷阱時長、同樣線長
- **匯不同方法之資料**：陷阱與掃網取樣不同昆蟲群落。分析合併資料產生既不準確代表任一群落之數。每方法資料分別分析
- **重複過少**：每地點單一樣本既無提供地點內變異之估計，亦無基於統計比較之依據。每比較組至少 3 重複；5-10 較佳
- **分類學不一致**：於同一分析中將某些識至種而其他至目，於一層膨脹明顯豐富度而於另一層遮蔽之。擇一致解析（如全至科、或全至形態種）並一致套用
- **忽略季節性**：多數昆蟲群落於季節間劇變。將春季調查與秋季調查相比混淆季節效應與任何處理或地點差異。比較同季資料
- **報告多樣性指標而無樣本量**：500 個體之 Shannon H' 為 2.5 遠較 20 個體之 H' 為 2.5 可靠。永遠連同樣本量報告指標，並對不同豐度之比較用稀疏化

## 相關技能

- `collect-preserve-specimens` — 調查期間所採標本之採集方法、保存與標籤標準
- `identify-insect` — 形態識別程序，用於分類與識別調查標本
- `document-insect-sighting` — 攝影記錄協定，補實體採集
- `observe-insect-behavior` — 行為觀察方法，以生態脈絡補族群資料
