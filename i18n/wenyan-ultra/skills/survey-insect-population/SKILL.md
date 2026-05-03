---
name: survey-insect-population
locale: wenyan-ultra
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

設行系蟲群察、含標樣、多樣析、定量報。

## 用

- 行域基生多樣評→用
- 監蟲群隨時變（年察、前後）→用
- 比生境、處、梯之蟲群→用
- 評環影（建、藥、復）→用
- 需定量生態資以助保策→用
- 助域或國生多樣監計→用

## 入

- **必**：明察標（何問所答？）
- **必**：法允採之察地（見 `collect-preserve-specimens`）
- **必**：宜標物與境之取具
- **必**：識資（鑰、導、或專家）
- **可**：GPS 為樣點地參
- **可**：環監具（溫、濕、風）
- **可**：多樣析統軟（R、PAST、EstimateS）
- **可**：地前察資（比基）

## 行

### 一：設察

定欲學、何處取、何力。設定統力與生效。

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

得：書察議含標、目物、地述、設（隨/層/系）、複數、時範、各樣標力。

敗：標模糊（「察此地有何蟲」）→入前精為可測問。無標之察不能正設、所得資不能善答任問。地訪有限→於限內改設、勿減複至比組各 < 3。

### 二：擇樣法

擇配目物、境、標之法。異法異捕偏。

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

得：擇一或多法、為目物證、跨諸複與樣點力標一。

敗：單法標本太少→慮加補法。然異法之資當別析——勿合 pitfall 與 sweep 於同多樣析、其取群異、捕概異。

### 三：行野工

布具、行採、記析所需諸元。

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

得：諸計樣以標力採、各於別標器、各樣事全元記。

敗：樣損（陷擾、sweep 中大雨）→記事或棄、或為候異。少一複勝含損資。天阻計日→改至最近宜日——勿於不宜況取。

### 四：識本

分識諸採至最低實分類。常為最費時。

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

得：諸本至少分至形種、記於種-樣豐陣、各形種留證本。

敗：某群不可至形種（如極小 Diptera 皆似）→記為合分類（如「Diptera spp. unsorted」）並記限。除此自多樣析、勿引不確識。識卡→送專家——專察常事。

### 五：計多樣指

化種-樣豐陣為定量多樣量。

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

得：各樣各地/處之種豐、Shannon、Simpson、均度算。稀疏曲線繪以察取盡。

敗：樣過小可信計（每樣 < 30 個體）→報原種數與豐而非算指。小樣生不可信指、信區大。記為限、薦未來增取力。

### 六：行統析

以宜統法比地、處、時之多樣。

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

得：以宜測之統比畢、果含測統 p 值、生釋予。

敗：複不足正統測（每組 < 3 複）→報描統（均、範）與稀疏曲線、無假測。記限、薦未來增複。善行察之描資勝弱設之 p 值。

### 七：報果

合察為構報以助管、文、未察基。

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

得：全察報含法、果（種列、多樣指、統測）、論、薦。原資存於庫。

敗：察未全（如未識諸本、複不足統）→以所有作初報、明標為初。識缺與成期。誠限之初報勝無報。

## 驗

- [ ] 標於野工前定
- [ ] 設含複（每比組 ≥ 3）
- [ ] 取力跨諸樣標
- [ ] 各樣別存以全元標
- [ ] 各樣事記環元
- [ ] 諸本識至恆級而留證
- [ ] 種-樣豐陣構
- [ ] 算多樣指（Shannon、Simpson、種豐、均）
- [ ] 稀疏曲線繪以察取盡
- [ ] 統比用宜測而報統
- [ ] 果合為構報含種列與薦

## 忌

- **力不標**：比 10 sweep 與 50 sweep 混力於多樣。各樣必同力——同 sweep 數、同陷時、同線長
- **合異法資**：Pitfall 與 sweep 取異群。析合資生不準量。各法資別析
- **複過少**：各地一樣無內地差估、無統比基。每比組 ≥ 3 複；5-10 為佳
- **分類不恆**：某至種、某至目於同析、一級虛增、他級隱。擇恆級（如皆至科、皆至形種）一律施
- **忽季**：多蟲群跨季變甚。比春於秋察混季效於處或地差。比同季資
- **報指無樣大**：500 個體之 H' 2.5 較 20 個體之 H' 2.5 可信甚多。常報樣大於指、用稀疏為跨異豐比

## 參

- `collect-preserve-specimens` — 採法、保、標標於察採本
- `identify-insect` — 形識法為察本分識
- `document-insect-sighting` — 影文議補體採
- `observe-insect-behavior` — 為補群資以生態境之行察法
