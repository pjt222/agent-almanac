---
name: survey-insect-population
locale: wenyan
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

# 察蟲群

設而行系之蟲群察——含察設、取樣法、野行、標本識、多樣指（含 Shannon-Wiener 與 Simpson）算、統計析、報之撰。

## 用時

- 行某地之基線生物多樣察乃用
- 監蟲群隨時之變（年察、前後比）乃用
- 比生境、處理、梯之蟲群乃用
- 評環境之衝（建造、農藥、生境復）乃用
- 須量生態資以支保育謀或治決乃用
- 助區域或國家生物多樣監之計乃用

## 入

- **必要**：定之察的（察答何問？）
- **必要**：有採法權之察地（參 `collect-preserve-specimens`）
- **必要**：合目分類群與生境之取樣具
- **必要**：識資（鑰、書、或分類師）
- **可選**：取樣點之 GPS 之地參器
- **可選**：環境監器（溫、濕、風）
- **可選**：多樣析之統計軟件（R、PAST、EstimateS）
- **可選**：此地前察之資（為比之基線）

## 法

### 第一步：設察

定欲學者、取樣地、所投之力。察設定統計力與後諸生態效。

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

得：書察規定的、目分類群、地述、取樣設（隨機／層／系統）、重複數、時域、各樣標力。

敗則：若察的模（「察此處有何蟲」），先精為可試之問而後續。無明的之察不可正設，所得資或無一問可答。若地之取受限，於限內改設而非減重複至每比組三以下。

### 第二步：擇取樣法

擇與目分類群、生境、察的合之法。諸法各有捕之偏。

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

得：一或數取樣法已擇而為目分類群定理，諸重複與點之力同。

敗則：若單法生標太少不足析，加補法。然各法之資宜分析——勿合 pitfall 與 sweep net 於同多樣析，蓋取群之異而捕概異。

### 第三步：行野工

部取樣之具，行採，記諸所須之資。

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

得：諸計樣以標力採，各於分標之器，每事之資皆全記。

敗則：若一樣壞（陷被擾、sweep 中大雨），記之而棄或標為潛異。少一重複勝於含壞資。若天阻計日之取，移至近合之日——勿於不宜之境取。

### 第四步：識諸標本

分而識諸採標本至實可分類之最低層。常為最費時之步。

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

得：諸標本皆分而識至少形態種層，記於種－樣豐之矩，各形態種留憑證標本。

敗則：若某群至形態種亦不可識（如諸小 Diptera 皆似），記為合分類群（如「Diptera spp. unsorted」）而注其限。析中除淺解之群，勿引不確之識。若識卡，送師——此於專察為常。

### 第五步：算多樣指

轉種－樣豐之矩為量之多樣度。

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

得：種豐、Shannon-Wiener、Simpson、均勻度為各樣與各地／處理算之。稀化曲已繪以察取之全。

敗則：若樣太小不足為信指算（每樣 30 個體以下），報生種計與豐而非算指。小樣生不信之指與大信區。注小樣為限而薦增來察之力。

### 第六步：行統計析

以宜法比諸地、處理、時段之多樣。

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

得：統計比已成，以宜試行之，報試計與 p 值，獻生態之釋。

敗則：若重複不足以為正試（每組 3 以下），報述計（均、範圍）與稀化曲，不行假設之試。承其限而薦增重複。良行之察之述資勝於力弱之 p 值。

### 第七步：報果

合察為構之報，可導治之決、支發版、或為來監之基。

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

得：完之察報含法、果（含種列、多樣指、統計試）、議、薦。生資存於庫。

敗則：若察未全（如未盡識、重複不足），出可得者之初報而明標為初。識其缺與成之期。誠陳限之初報勝於無報。

## 驗

- [ ] 察的於野工之前已定
- [ ] 取樣設含重複（每比組至少 3）
- [ ] 取樣力於諸樣已標一致
- [ ] 各樣分留並標其全資
- [ ] 環境共變於每事已記
- [ ] 標本識至同分類層而留憑證
- [ ] 種－樣豐矩已建
- [ ] 多樣指（Shannon、Simpson、豐、勻）已算
- [ ] 稀化曲已繪以察取之全
- [ ] 統計比用宜試而報試計
- [ ] 果合於構之報，含種列與薦

## 陷

- **無力之標**：比 10 sweep 與 50 sweep 之樣混力於多樣。每樣須同力——同 sweep 數、同陷時、同樣帶長。
- **合異法之資**：pitfall 與 sweep net 取異群。析合資生不真之數。各法之資分析。
- **重複太少**：每地一樣不能估地內變，無基為統計比。每比組至少 3，5-10 為佳。
- **不一之分類**：同析中某至種、某至目，誇一層之豐而蔽他層。擇一致解（如皆至科或皆至形態種）而通施。
- **忽季**：多蟲群隨季變。比春察與秋察混季效於處理或地之異。比同季資。
- **報指而無樣大**：500 個體之 Shannon H' 為 2.5 較 20 個體之 2.5 信。恆並報樣大於指，並用稀化以比異豐。

## 參

- `collect-preserve-specimens` — 採法、保、標之則為察中所聚之標本
- `identify-insect` — 形態識之程，分而識察之標本
- `document-insect-sighting` — 影記之則，補體採
- `observe-insect-behavior` — 行察之法，補群資以生態境
