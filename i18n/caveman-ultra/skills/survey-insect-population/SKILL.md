---
name: survey-insect-population
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Design + exec insect pop surveys: design, sampling methods, field exec,
  ID, diversity indices (Shannon-Wiener, Simpson), stats, reporting.
  Covers objectives, sites, sampling intensity + replication, methods per
  taxa, standardize effort, env covariates, ID to lowest taxonomic, species
  richness, H', 1-D, evenness, rarefaction curves, multivariate ordination,
  reports w/ species lists + conservation implications. Use → baseline
  biodiv assessments, monitor over time, compare across habitats/treatments,
  env impact, conservation planning.
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

# Survey Insect Population

Systematic surveys w/ standardized sampling, diversity analysis, quantitative reporting.

## Use When

- Baseline biodiv assessment of area
- Monitor pop changes over time (annual, before-after)
- Compare communities across habitats, treatments, gradients
- Env impact (construction, pesticide, restoration)
- Quantitative ecological data → conservation planning | mgmt decisions
- Contributing to regional/national biodiv monitoring

## In

- **Required**: Defined objectives (what question?)
- **Required**: Site(s) w/ legal access (see `collect-preserve-specimens`)
- **Required**: Sampling equipment per taxa + habitat
- **Required**: ID resources (keys, guides, taxonomic specialists)
- **Optional**: GPS → georeference points
- **Optional**: Env monitoring (thermometer, hygrometer, anemometer)
- **Optional**: Stats sw (R, PAST, EstimateS)
- **Optional**: Prev survey data (baseline cmp)

## Do

### Step 1: Design Survey

What learn, where sample, how much effort. Determines stat power + ecological validity.

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

**Got:** Written protocol w/ objectives, target taxa, site desc, design (random/stratified/systematic), replicates, temporal, effort.

**If err:** Vague objectives ("see what's here") → refine to testable question first. Site access restricted → modify within constraints, don't reduce replication < 3 per group.

### Step 2: Choose Methods

Per taxa, habitat, objectives. Diff methods → diff capture biases.

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
- Same method, equipment, effort at every point
- Record start + end times every event
- Traps: deploy + retrieval times exact
- Weather-dep methods (sweep, transect) → only OK conditions
  (no heavy rain, T above activity threshold for taxa)
```

**Got:** Method(s) selected + justified for taxa, effort standardized across all replicates + points.

**If err:** Single method too few specimens → add complementary. But analyze separately — don't pool pitfall + sweep in same diversity analysis (different communities, different capture probs).

### Step 3: Execute Fieldwork

Deploy, collect, record all metadata.

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

**Got:** All planned samples collected w/ standardized effort, each in separate labeled container, full metadata per event.

**If err:** Compromised sample (trap disturbed, heavy rain) → record + discard | flag as outlier. 1 fewer replicate > including bad data. Weather prevents → reschedule nearest suitable, don't sample under bad conditions.

### Step 4: ID Specimens

Sort + ID all to lowest practical taxonomic level. Most time-consuming step.

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

**Got:** All sorted + ID'd to ≥ morphospecies, recorded in species-by-sample abundance matrix, voucher specimens preserved.

**If err:** Some groups can't even reach morphospecies (very small Diptera all alike) → record as aggregate ("Diptera spp. unsorted"), note limit. Exclude poorly resolved from diversity analyses vs introducing uncertainty. Stalled → send to specialists, normal + expected for pro surveys.

### Step 5: Calculate Diversity Indices

Convert matrix → quantitative diversity measures.

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

**Got:** S, H', 1-D, J' per sample + site/treatment. Rarefaction plotted → assess sampling completeness.

**If err:** Sample too small (< 30 individuals) → report raw species counts vs computed indices. Small samples → unreliable indices w/ wide CIs. Note + recommend more sampling.

### Step 6: Stats Analysis

Compare across sites, treatments, time.

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

**Got:** Comparisons w/ appropriate tests, results w/ statistics + p, ecological interpretation.

**If err:** Insufficient replication (< 3 per group) → descriptive stats (means, ranges) + rarefaction curves, no hypothesis tests. Acknowledge + recommend more replication. Descriptive from well-executed > p-values from underpowered.

### Step 7: Report Results

Compile → structured report → mgmt decisions, publication, baseline for future monitoring.

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

**Got:** Complete report w/ methods, results (species list, diversity indices, stats), discussion, recommendations. Raw data archived.

**If err:** Survey incomplete (not all ID'd, insufficient replicates) → preliminary report w/ what's avail, label preliminary clearly. ID gaps + timeline. Preliminary w/ honest limits > no report.

## Check

- [ ] Objectives defined before fieldwork
- [ ] Design has replication (min 3 per group)
- [ ] Effort standardized across all
- [ ] Each sample separate + labeled w/ full metadata
- [ ] Env covariates recorded per event
- [ ] Specimens ID'd to consistent taxonomic level w/ vouchers
- [ ] Species-by-sample matrix built
- [ ] Diversity indices (Shannon, Simpson, richness, evenness) calc'd
- [ ] Rarefaction curves plotted
- [ ] Stats use appropriate tests w/ reported test statistics
- [ ] Compiled to structured report w/ species list + recommendations

## Traps

- **No effort standardization**: 10-sweep vs 50-sweep confounds effort w/ diversity. Same effort every sample.
- **Pool diff methods**: Pitfall + sweep sample diff communities. Pooled = neither accurate. Analyze each method separately.
- **Too few replicates**: Single sample → no within-site variability est, no stats basis. Min 3 per group; 5-10 better.
- **Inconsistent taxonomy**: Some species, some order in same analysis → inflates richness one level, obscures other. Consistent resolution applied uniform.
- **Ignore seasonality**: Insect communities change dramatically across seasons. Spring vs autumn confounds w/ treatment. Cmp same-season.
- **Indices w/o sample size**: H'=2.5 from 500 individuals >> H'=2.5 from 20. Always report sample sizes alongside, use rarefaction across diff abundances.

## →

- `collect-preserve-specimens` — collection, preservation, labeling for survey specimens
- `identify-insect` — morphological ID for sorting + IDing
- `document-insect-sighting` — photographic documentation complementing physical collection
- `observe-insect-behavior` — behavioral methods supplementing pop data w/ ecological context
