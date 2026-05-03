---
name: validate-analytical-method
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Validate a chromatographic analytical method per ICH Q2(R2) guidelines:
  define the validation scope by method category, establish specificity through
  forced degradation, determine linearity and range, assess accuracy and precision,
  and establish detection limits and robustness for regulatory submission.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: advanced
  language: natural
  tags: chromatography, validation, ich-q2, accuracy, precision, linearity, regulatory
---

# Validate Analytical Method

Formal valid of chromatographic method per ICH Q2(R2) → scope by category → specificity via forced degradation → linearity + range → accuracy + precision → LOD/LOQ + robustness → regulatory compliance.

## Use When

- New chromatographic method developed → must validate before routine
- Compendial method verified for suitability in specific lab
- Validated method significant changes → partial|full re-valid
- Prep validation pkg for regulatory submission (NDA, ANDA, MAA, IND)
- Transferring method to new lab|instrument platform

## In

### Required

- **Developed method**: Fully optimized + documented (col, mobile phase, gradient, detector, etc.)
- **Method category**: Assay active, quant impurity, limit impurity, ID test
- **Analyte ref stds**: Primary refs w/ COA + assigned purity
- **Sample matrix**: Representative samples + placebo|blank for specificity

### Optional

- **Regulatory guidance**: Beyond ICH Q2 (USP <1225>, FDA, EMA)
- **Forced degradation samples**: Pre-stressed (acid, base, ox, heat, light) if not prepared
- **Validation protocol**: Pre-approved w/ acceptance criteria (req in GMP)
- **Transfer pkg**: If method transfer → originating lab's report

## Do

### Step 1: Define Scope per ICH Q2(R2)

ID method category + required validation params.

| Parameter | Cat I: Assay | Cat II: Impurity (Quant) | Cat III: Impurity (Limit) | Cat IV: Identification |
|---|---|---|---|---|
| Specificity | Yes | Yes | Yes | Yes |
| Linearity | Yes | Yes | No | No |
| Range | Yes | Yes | No | No |
| Accuracy | Yes | Yes | No | No |
| Precision (repeatability) | Yes | Yes | No | No |
| Precision (intermediate) | Yes | Yes | No | No |
| LOD | No | May be needed | Yes | No |
| LOQ | No | Yes | No | No |
| Robustness | Yes | Yes | Yes | No |

1. Classify method → 4 ICH categories per intended purpose
2. Per table, ID required params
3. Define acceptance criteria per param before exp work. Typical:
   - Linearity: R² >= 0.999 (assay), >= 0.99 (impurity)
   - Accuracy: recovery 98.0-102.0% (assay), 80-120% at LOQ
   - Repeatability: RSD <= 2.0% (assay), <= 10% at LOQ
   - Intermediate: RSD <= 3.0% (assay)
4. Draft protocol w/ all params, designs, criteria
5. GMP → protocol approval before exp work

**Got:** Approved protocol w/ method category, required params, designs, pre-defined criteria.

**If err:** Method category ambiguous (combined assay + impurity) → validate for most stringent. Consult regulatory guidance per submission type.

### Step 2: Specificity + Selectivity

1. Prep solutions:
   - Blank (solvent|diluent)
   - Placebo (matrix w/o analyte, e.g., excipients)
   - Ref std at working conc
   - Spiked placebo (matrix + ref)
   - Forced degradation samples (if not avail)
2. Forced degradation → potential degradation products:

| Stress Condition | Typical Treatment | Target Degradation |
|---|---|---|
| Acid hydrolysis | 0.1-1 N HCl, 60-80 C, 1-24 h | 5-20% |
| Base hydrolysis | 0.1-1 N NaOH, 60-80 C, 1-24 h | 5-20% |
| Oxidation | 0.3-3% H2O2, RT-60 C, 1-24 h | 5-20% |
| Thermal | 60-80 C, solid state, 1-7 days | 5-20% |
| Photolytic | ICH Q1B (1.2M lux-hours, 200 Wh/m^2 UV) | 5-20% |

3. Inject all + eval:
   - No interfering peaks from blank|placebo at analyte RT
   - Degradation products resolved from main analyte (Rs >= 1.5)
   - Peak purity → DAD spectral purity index|MS
4. Mass balance: assay + impurities + degradation = 95-105% initial
5. Doc specificity w/ chromatograms from all conditions

**Got:** Method specific: no interferences, degradation resolved, peak purity confirmed, mass balance 95-105%.

**If err:** Degradation co-elutes w/ analyte → method not stability-indicating. Return to method dev → improve selectivity (pH, gradient, col chem) before validation.

### Step 3: Linearity + Range

1. 5+ conc levels spanning intended range:
   - Assay: 80-120% of target
   - Impurity: LOQ → 120-200% of spec limit
   - Dissolution: 10-120% of label claim
2. Each conc independent (not serial dilution) → best practice
3. Inject each in triplicate (min duplicate)
4. Linear regression of response (area|height) vs conc:
   - Report slope, intercept, R²
   - R² >= 0.999 assay; >= 0.99 impurity
5. Eval residual plots:
   - Random distribution around zero, no systematic pattern
   - Curved → non-linearity → quadratic fit or narrower range
6. Calc y-intercept as % of response at 100%:
   - <= 2% of 100% response for assay
7. Validated range = interval between low + high concs w/ linearity, accuracy, precision

**Got:** Linear regression R² >= 0.999 (assay)|>= 0.99 (impurity), random residuals, intercept <= 2% target, range defined.

**If err:** R² below criterion → check prep errors, detector non-linearity (too high conc), analyte instability. Repeat w/ fresh prep. Inherent non-linearity → polynomial calibration|narrow range.

### Step 4: Accuracy

1. Prep accuracy samples at 3 conc (80%, 100%, 120% target for assay; LOQ, mid, high for impurity)
2. Per level → 3 independent replicates (min 9 determinations total)
3. Drug substance: compare found vs known (gravimetric)
4. Drug product: spiked placebo → add known to placebo + measure recovery
5. % recovery per level:
   - Recovery (%) = (found / added) x 100
6. Acceptance:

| Method Type | Recovery Range | RSD at Each Level |
|---|---|---|
| Assay (drug substance) | 98.0-102.0% | <= 2.0% |
| Assay (drug product) | 98.0-102.0% | <= 2.0% |
| Impurity (quantitation) | 80-120% at LOQ, 90-110% at higher levels | <= 10% at LOQ, <= 5% at higher |
| Cleaning validation | 70-130% (or tighter per company SOP) | <= 15% |

7. Report individual recoveries, mean, RSD per level

**Got:** Mean recovery within criteria all levels, RSD within limits.

**If err:** Recovery consistently high|low all levels → systematic err in ref std, sample prep, method (matrix effect → ion suppression in LC-MS). Erratic → investigate prep technique + analyte stability.

### Step 5: Precision

3 levels:

1. **Repeatability (intra-day)**:
   - 1 analyst, 1 instrument, 1 day
   - 6 determinations at 100% or 3 levels x 3 replicates (same as accuracy)
   - RSD <= 2.0% assay, <= 10% at LOQ for impurity
2. **Intermediate (inter-day|inter-analyst)**:
   - Repeat repeatability w/ different analyst, day, (if avail) instrument
   - Overall RSD combining both
   - Overall RSD <= 3.0% assay
   - Intermediate >> repeatability → investigate source (analyst, instrument cal, env)
3. **Reproducibility** (method transfer|multi-site):
   - Receiving lab → same protocol
   - Compare across labs
   - F-test (variance) + t-test (mean) or equivalence

| Precision Level | Design | Acceptance (Assay) | Acceptance (Impurity Quant) |
|---|---|---|---|
| Repeatability | n >= 6 at 100%, 1 analyst, 1 day | RSD <= 2.0% | RSD <= 10% at LOQ, <= 5% above |
| Intermediate | 2 analysts, 2 days (or 2 instruments) | RSD <= 3.0% | RSD <= 15% at LOQ, <= 10% above |
| Reproducibility | Multi-laboratory | Per protocol / transfer criteria | Per protocol / transfer criteria |

**Got:** Repeatability + intermediate RSDs within criteria. No statistically significant diff between analysts|days|instruments beyond allowed RSD.

**If err:** Intermediate >> repeatability → ID variable driving variance (analyst prep, ambient temp, instrument cal drift) → control before repeating.

### Step 6: LOD, LOQ, Robustness

**LOD + LOQ**:

1. Calc via S/N or std dev approach:
   - LOD = 3.3 x (σ / S) → σ = SD of response at low conc, S = slope of cal
   - LOQ = 10 x (σ / S)
   - Alt: S/N → LOD = S/N >= 3, LOQ = S/N >= 10
2. Confirm experimentally → prep solutions at calc'd LOD + LOQ + inject:
   - LOD: detectable, not necessarily quantifiable w/ acceptable precision
   - LOQ: 6 replicates → RSD <= 10% + accuracy 80-120%
3. Report LOD + LOQ w/ method used

**Robustness**:

4. ID critical params (5-7 factors):
   - Mobile phase comp (+/- 2% organic)
   - MP pH (+/- 0.2 units)
   - Col temp (+/- 5 C)
   - Flow rate (+/- 10%)
   - Detection wavelength (+/- 2 nm)
   - Col lot|batch (if avail)
5. Vary each within range while holding others (or fractional factorial design for efficiency)
6. Eval impact on sys suitability (RT, resolution, tailing, area)
7. Params causing sys suitability fail w/in tested range → tightly control + doc as critical
8. Summarize robustness in table: each varied param, range tested, impact on responses

**Got:** LOD + LOQ experimentally confirmed. Robustness done w/ critical params ID'd + control limits.

**If err:** LOQ precision > 10% RSD → method sensitivity insufficient. Options: increase inj volume, concentrate sample, improve cleanup, more sensitive detector. Param shows not robust (fails SST w/ small variation) → tighten control + flag during transfer.

## Check

- [ ] Method category ID'd + all params per ICH Q2(R2)
- [ ] Validation protocol w/ pre-defined criteria
- [ ] Specificity demonstrated: no interferences, degradation resolved, peak purity
- [ ] Mass balance 95-105% for forced degradation
- [ ] Linearity R² >= 0.999 (assay)|>= 0.99 (impurity), residuals random
- [ ] Accuracy at 3 levels, recovery within criteria
- [ ] Repeatability RSD within limits (<= 2.0% assay)
- [ ] Intermediate RSD within limits (<= 3.0% assay)
- [ ] LOD + LOQ experimentally confirmed (LOQ precision <= 10% RSD)
- [ ] Robustness w/ critical params ID'd
- [ ] All raw data, calc, chromatograms in validation report

## Traps

- **Exp before protocol approval**: GMP → data before protocol approval may not be acceptable to regulators. Always approve first.
- **Serial dilutions for linearity**: Propagates pipetting errs. Each conc independent from common stock for accurate linearity.
- **Insufficient forced degradation**: < 5% misses important products. > 30% → secondary products complicate. Target 5-20% per condition.
- **Confuse repeatability + intermediate**: Repeatability = same-day, same-analyst, same-instrument. Intermediate must vary one. Both required Cat I + II.
- **Neglect LOQ verify step**: Calc LOQ from cal curve insufficient. Must experimentally confirm acceptable precision + accuracy.
- **Robustness late**: Discovering method not robust after accuracy + precision wastes time + materials. Quick screen early → catch fragile params.
- **Incomplete reports**: Reviewers expect all raw data, chromatograms (not just tabulated nums), stat analysis, explicit pass/fail per param. Missing → deficiency letters.

## →

- `develop-gc-method` — GC method dev preceding validation
- `develop-hplc-method` — HPLC method dev preceding validation
- `interpret-chromatogram` — reading chromatograms during validation
- `troubleshoot-separation` — resolve issues during validation
- `conduct-gxp-audit` — auditing completed validation for GxP
- `write-standard-operating-procedure` — doc validated method as SOP
