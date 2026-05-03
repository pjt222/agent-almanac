---
name: troubleshoot-separation
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Diagnose, resolve chromatographic separation problems systematic:
  document symptoms, identify root causes for peak shape and retention anomalies,
  evaluate matrix effects, implement targeted fixes via one-variable-at-a-time
  approach for GC and HPLC systems.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, troubleshooting, peak-shape, resolution, matrix-effects
---

# Troubleshoot Chromatographic Separation

Systematic diagnosis, resolution of GC, HPLC separation problems. Cover symptom documentation, peak shape diagnosis, retention anomaly investigation, matrix effect evaluation, verified corrective action via controlled single-variable changes.

## When Use

- Peaks tail, front, split, or broader than expected
- Retention times shifted or irreproducible
- Resolution between critical pairs degraded
- Baseline drift, ghost peaks, negative peaks appeared
- Sensitivity dropped or signal-to-noise worsened
- Method that worked now fails system suitability

## Inputs

### Required

- **Problem chromatogram**: Current data showing issue
- **Reference chromatogram**: Recent good chromatogram from same method for comparison
- **Method conditions**: Column, mobile phase/carrier gas, temp/gradient, detector, flow rate
- **System log**: Recent maintenance, column changes, mobile phase preparations, instrument events

### Optional

- **Blank chromatogram**: Most recent blank or solvent injection
- **System suitability trend data**: Historical values for tailing, resolution, plates, retention time
- **Column history**: Number of injections, types of samples, age of column
- **Instrument maintenance log**: Pump seal replacements, lamp hours, detector service dates

## Steps

### Step 1: Document Problem

1. Describe symptom precise — which peaks affected, how differ from reference
2. Determine when problem started — gradual degradation or sudden onset
3. Record whether problem affects all peaks or only specific ones
4. Note whether problem present in standards, samples, or both
5. Collect current system suitability data, compare to historical trends
6. Photograph or export problem chromatogram alongside reference for side-by-side comparison

**Got:** Documented problem statement with timeline, scope (all peaks vs. specific peaks, standards vs. samples), comparison to reference data.

**If fail:** No reference chromatogram? Inject fresh standard preparation under documented method conditions. Establish current baseline before troubleshooting.

### Step 2: Diagnose Peak Shape Issues

Use symptom table to identify likely root causes.

| Symptom | Possible Causes | Solutions |
|---|---|---|
| **Tailing** (T > 1.5) | Secondary interactions (silanol activity), dead volume in fittings, contaminated column frit, overloaded active sites | Add amine modifier (HPLC), deactivate liner (GC), replace frit, trim column inlet, reduce injection mass |
| **Fronting** (T < 0.8) | Column overload (mass or volume), mismatch between sample solvent and mobile phase strength | Reduce injection volume or concentration, dilute in weaker solvent, use larger-bore column |
| **Split / double peaks** | Partially blocked frit, void at column head, two polymorphic forms, isomeric interconversion | Replace frit, repack column head, verify sample stability, adjust pH to lock one form |
| **Broad peaks (all)** | Extra-column band broadening, wrong tubing ID, large detector cell, old column, low plate count | Minimize post-column tubing length and ID, check connections, replace column |
| **Broad peaks (early eluters)** | Poor focusing at column head, injection solvent too strong (HPLC), cold on-column (GC) | Use weaker injection solvent, reduce injection volume, increase initial oven temp |
| **Broad peaks (late eluters)** | On-column diffusion, temperature too low (GC), insufficient gradient steepness (HPLC) | Increase final oven temperature, steepen gradient, add organic wash |
| **Negative peaks** | Sample solvent refractive index/absorbance differs from mobile phase, vacancy peaks (IEX) | Match sample solvent to mobile phase, use different detection wavelength |
| **Ghost peaks** | Carryover from previous injection, contaminated mobile phase, column bleed, septum bleed (GC) | Run blank to confirm, clean or replace injection system, filter/degas mobile phase, replace septum |
| **Baseline drift (upward)** | Column bleed (GC at high temp), gradient elution baseline shift (HPLC), lamp instability (UV) | Reduce max temp, use low-bleed column (GC), run blank gradient to characterize (HPLC), replace lamp |
| **Baseline noise (high-frequency)** | Electrical interference, pump pulsation, air bubbles in detector, contaminated detector | Ground instrument, replace pump seals, degas mobile phase, clean detector cell |

1. Match observed symptom(s) to table above
2. Narrow list of causes — check whether problem affects all peaks or specific ones, whether appeared sudden or gradual
3. Prioritize most likely cause based on system history (recent changes, column age, maintenance status)

**Got:** One or two most-likely root causes identified from symptom-cause mapping. Prioritized by system history.

**If fail:** Symptom matches no row, or multiple symptoms simultaneous? Problem may be compound (e.g., column degradation plus leak). Address most obvious issue first. Re-evaluate.

### Step 3: Diagnose Retention Time Issues

| Symptom | Possible Causes | Solutions |
|---|---|---|
| **All peaks shifted earlier** | Increased flow rate, higher column temperature, stronger mobile phase, column void | Check flow rate setting and actual delivery, verify temperature, remake mobile phase, inspect column |
| **All peaks shifted later** | Decreased flow rate, lower column temperature, weaker mobile phase, partially blocked tubing | Check for leaks (pressure drop), verify temperature, remake mobile phase, check inline filter |
| **Retention time drift (gradual)** | Column degradation, mobile phase evaporation (open reservoir), temperature fluctuation | Replace column, seal reservoir, stabilize oven, use column thermostat |
| **Retention time irreproducible** | Leak at fitting, check valve malfunction, autosampler timing error, inadequate re-equilibration | Pressure-test fittings, replace check valves, verify autosampler, increase equilibration volume |
| **Lost retention (k' near 0)** | Phase collapse (RP at high aqueous), column dewetting, wrong mobile phase, reversed connections | Use polar-embedded or AQ-type column, re-wet column with organic, verify mobile phase, check plumbing |
| **Co-elution (previously resolved)** | Column selectivity lost (bonded phase stripped), mobile phase composition changed, temperature changed | Replace column, verify mobile phase preparation, check temperature setpoint vs. actual |

1. Determine whether retention shifts uniform (all peaks) or selective (specific peaks)
2. Uniform shifts → systematic causes (flow, temp, mobile phase composition)
3. Selective shifts → column chemistry changes or specific analyte-related issues
4. Check instrument pressure trace — sudden pressure changes indicate leaks or blockages
5. Re-inject reference standard to confirm whether issue in system or sample

**Got:** Root cause of retention anomaly identified, categorized as systematic (instrument/mobile phase) or column-related.

**If fail:** Re-inject standard on new column resolves issue? Original column the problem. Issue persists on new column? Cause upstream (mobile phase, instrument, method parameters).

### Step 4: Evaluate Matrix Effects

1. Compare standard chromatogram to sample chromatogram:
   - Additional peaks in sample absent in standard?
   - Baseline elevated or noisy in specific retention windows?
   - Analyte peak shapes different in sample vs. standard (broader, tailing more)?
2. For LC-MS — evaluate ion suppression/enhancement:
   - Post-column infusion test — infuse analyte continuous while inject blank matrix extract. Dips in analyte signal indicate ion suppression regions
   - Analyte retention time coincides with suppression region? Modify method to shift analyte elution
3. Check column contamination:
   - Inject solvent blanks after sample sequence. Persistent peaks indicate column contamination
   - Flush column with strong solvent (100% organic for RP, or as recommended by column manufacturer)
4. Assess sample preparation:
   - Dirty injector (autosampler needle, injection port liner in GC) — replace or clean
   - Insufficient sample cleanup — add filtration, SPE, or protein precipitation step
5. For GC — check non-volatile residue buildup in inlet liner. Causes peak tailing, ghost peaks over time.

**Got:** Matrix effects characterized (presence/absence of interferents, ion suppression zones for LC-MS, column contamination status). Actionable recommendations.

**If fail:** Matrix effects can't be characterized adequately with available data? Prepare matrix-matched calibration curve. Compare slopes to solvent calibration curve. Slope difference > 15% indicates significant matrix effects requiring method modification.

### Step 5: Implement and Verify Fix

1. Change one variable at a time. Document what changed and why
2. After each change, re-inject system suitability standard. Compare to reference chromatogram
3. Sequence of changes (least to most disruptive):
   - Prepare fresh mobile phase / carrier gas tank
   - Replace consumables (septum, liner, frit, inline filter, lamp)
   - Tighten or replace fittings, tubing
   - Flush/regenerate column
   - Adjust method parameters (temp, flow, gradient, pH)
   - Replace column
   - Service instrument (pump seals, check valves, detector)
4. Once fix identified, run full system suitability test (n >= 5 injections)
5. Compare all parameters (retention time, area, resolution, tailing, plates) to historical specification
6. Document root cause, corrective action, verification results in instrument/column logbook
7. Same problem recurs? Establish preventive maintenance schedule. Address root cause proactive

**Got:** Problem resolved. System suitability parameters restored to specification. Root cause, corrective action, verification documented.

**If fail:** All single-variable changes fail to resolve issue? Problem may involve multiple simultaneous failures. Replace all consumables and column together. Verify with fresh standard. Rebuild troubleshooting from new baseline. Problem persists after total consumable replacement? Escalate to instrument service.

## Checks

- [ ] Problem documented with symptom description, timeline, scope
- [ ] Root cause identified using symptom-cause mapping tables
- [ ] One variable changed at a time during troubleshooting
- [ ] Fix verified by system suitability test (n >= 5 replicate injections)
- [ ] All system suitability parameters restored to within specification
- [ ] Root cause, corrective action documented in logbook
- [ ] Preventive measure identified to avoid recurrence

## Pitfalls

- **Change multiple variables simultaneous**: Makes impossible to identify actual root cause. Always change one thing, test, then decide whether to change another
- **Replace column as first step**: Column replacement expensive. May mask real problem (leak, wrong mobile phase, contaminated inlet). Exhaust simpler possibilities first
- **Ignore instrument logbook**: Many problems trace back to recent maintenance event, mobile phase batch change, column swap. Always check what changed recent
- **Blame sample without evidence**: Run reference standard first. Standard also shows problem? Issue in system, not sample
- **Flush column with incompatible solvents**: Never flush reversed-phase column with pure water (causes phase collapse) or silica HILIC column with pure aqueous buffer (irreversible damage). Follow manufacturer washing protocol
- **No document what tried**: Failed troubleshooting attempts valuable info. Record every change attempted, outcome. Avoid repeat unsuccessful fixes. Build institutional knowledge

## See Also

- `interpret-chromatogram` -- understanding chromatographic data that reveals separation problems
- `develop-gc-method` -- GC method development. Relevant when troubleshooting needs method redesign
- `develop-hplc-method` -- HPLC method development. Relevant when troubleshooting needs method redesign
- `validate-analytical-method` -- re-validation may be required after significant method changes during troubleshooting
