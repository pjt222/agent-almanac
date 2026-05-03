---
name: survey-insect-population
locale: caveman
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

# Survey Insect Population

Design and execute systematic insect population surveys with standardized sampling, diversity analysis, quantitative reporting.

## When Use

- Conducting baseline biodiversity assessment of area
- Need monitor insect population changes over time (annual surveys, before-after studies)
- Comparing insect communities across habitats, treatments, or gradients
- Assessing environmental impact (construction, pesticide use, habitat restoration)
- Need quantitative ecological data to support conservation planning or management decisions
- Contributing to regional or national biodiversity monitoring programs

## Inputs

- **Required**: Defined study objectives (what question is survey answering?)
- **Required**: Study site(s) with legal access for collection (see `collect-preserve-specimens`)
- **Required**: Sampling equipment appropriate to target taxa and habitat
- **Required**: Identification resources (keys, guides, or access to taxonomic specialists)
- **Optional**: GPS device for georeferencing sampling points
- **Optional**: Environmental monitoring equipment (thermometer, hygrometer, anemometer)
- **Optional**: Statistical software for diversity analysis (R, PAST, EstimateS)
- **Optional**: Previous survey data for site (baseline for comparison)

## Steps

### Step 1: Design Survey

Define what you want learn, where you will sample, how much effort you will invest. Survey design determines statistical power and ecological validity of everything that follows.

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

**Got:** Written survey protocol specifying objectives, target taxa, site description, sampling design (random/stratified/systematic), number of replicates, temporal scope, standardized effort per sample.

**If fail:** Survey objectives vague ("see what insects are here")? Refine into testable question before proceeding. Survey without clear objectives cannot be properly designed; resulting data may not answer any question well. Site access restricted? Modify design to work within constraints rather than reducing replication below 3 per comparison group.

### Step 2: Choose Sampling Methods

Select methods appropriate to target taxa, habitat, survey objectives. Different methods have different capture biases.

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

**Got:** One or more sampling methods selected and justified for target taxa, with effort standardized across all replicates and sample points.

**If fail:** Single method produces too few specimens for meaningful analysis? Consider adding complementary method. Data from different methods should be analyzed separate — never pool pitfall trap data with sweep net data in same diversity analysis. Sample different portions of community with different capture probabilities.

### Step 3: Execute Fieldwork

Deploy sampling equipment, conduct collections, record all metadata needed for analysis.

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

**Got:** All planned samples collected with standardized effort, each sample in separate labeled container, with full metadata recorded for every sampling event.

**If fail:** Sample compromised (trap disturbed, heavy rain during sweep netting)? Record issue and either discard sample or note as potential outlier. Better to have one fewer replicate than include compromised data. Weather prevents sampling on planned date? Reschedule to nearest suitable day — never attempt to sample under inappropriate conditions.

### Step 4: Identify Specimens

Sort and identify all collected specimens to lowest practical taxonomic level. Typical most time-consuming step.

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

**Got:** All specimens sorted and identified to at least morphospecies level, recorded in species-by-sample abundance matrix, with voucher specimens preserved for each morphospecies.

**If fail:** Certain groups cannot be identified even to morphospecies (e.g., very small Diptera that all look alike)? Record as aggregate taxon (e.g., "Diptera spp. unsorted"), note limitation. Exclude poorly resolved groups from diversity analyses rather than introducing uncertain identifications. Identification stalls? Send specimens to specialists — normal and expected for professional surveys.

### Step 5: Calculate Diversity Indices

Convert species-by-sample abundance matrix into quantitative diversity measures.

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

**Got:** Species richness, Shannon-Wiener index, Simpson index, evenness calculated for each sample and each site/treatment. Rarefaction curves plotted to assess sampling completeness.

**If fail:** Sample sizes too small for reliable diversity calculation (fewer than 30 individuals per sample)? Report raw species counts and abundances rather than computed indices. Small samples produce unreliable index values with large confidence intervals. Note small sample size as limitation and recommend increased sampling effort for future surveys.

### Step 6: Conduct Statistical Analysis

Compare diversity across sites, treatments, or time periods using appropriate statistical methods.

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

**Got:** Statistical comparisons completed with appropriate tests, results reported with test statistics and p-values, ecological interpretation provided.

**If fail:** Replication insufficient for formal statistical testing (fewer than 3 replicates per group)? Report descriptive statistics (means, ranges) and rarefaction curves without hypothesis tests. Acknowledge limitation, recommend increased replication for future surveys. Descriptive data from well-executed survey more valuable than p-values from underpowered design.

### Step 7: Report Results

Compile survey into structured report that can inform management decisions, support publication, or serve as baseline for future monitoring.

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

**Got:** Complete survey report with methods, results (including species list, diversity indices, statistical tests), discussion, recommendations. Raw data archived in repository.

**If fail:** Survey incomplete (e.g., not all specimens identified, insufficient replicates for statistics)? Produce preliminary report with what is available, clear label as preliminary. Identify gaps and timeline for completing them. Preliminary report with honest limitations more useful than no report at all.

## Checks

- [ ] Survey objectives defined before fieldwork began
- [ ] Sampling design included replication (minimum 3 per comparison group)
- [ ] Sampling effort standardized across all samples
- [ ] Each sample kept separate and labeled with full metadata
- [ ] Environmental covariates recorded for every sampling event
- [ ] Specimens identified to consistent taxonomic level with vouchers preserved
- [ ] Species-by-sample abundance matrix constructed
- [ ] Diversity indices (Shannon, Simpson, richness, evenness) calculated
- [ ] Rarefaction curves plotted to assess sampling completeness
- [ ] Statistical comparisons used appropriate tests with reported test statistics
- [ ] Results compiled into structured report with species list and recommendations

## Pitfalls

- **No standardization of effort**: Comparing 10-sweep sample to 50-sweep sample confounds effort with diversity. Every sample must receive same effort — same number of sweeps, same trap duration, same transect length
- **Pool data from different methods**: Pitfall traps and sweep nets sample different insect communities. Analyzing pooled data produces number that does not represent either community accurate. Analyze each method's data separate
- **Too few replicates**: Single sample per site provides no estimate of within-site variability and no basis for statistical comparison. Minimum 3 replicates per comparison group; 5-10 is better
- **Inconsistent taxonomy**: Identifying some specimens to species and others to order in same analysis inflates apparent richness at one level and obscures at another. Choose consistent resolution (e.g., all to family, or all to morphospecies) and apply uniform
- **Ignore seasonality**: Most insect communities change dramatic across seasons. Comparing spring survey to autumn survey confounds seasonal effects with any treatment or site differences. Compare same-season data
- **Report diversity indices without sample size**: Shannon H' of 2.5 from 500 individuals far more reliable than H' of 2.5 from 20 individuals. Always report sample sizes alongside indices, use rarefaction for comparisons across different abundances

## See Also

- `collect-preserve-specimens` — collection methods, preservation, labeling standards for specimens gathered during surveys
- `identify-insect` — morphological identification procedures for sorting and identifying survey specimens
- `document-insect-sighting` — photographic documentation protocols complement physical collection
- `observe-insect-behavior` — behavioral observation methods for supplementing population data with ecological context
