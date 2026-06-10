---
name: troubleshoot-separation
description: >
  Systematically diagnose and resolve chromatographic separation problems:
  document symptoms, identify root causes for peak shape and retention anomalies,
  evaluate matrix effects, and implement targeted fixes using a one-variable-at-a-time
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

# Troubleshoot a Chromatographic Separation

Systematic diagnosis and resolution of GC and HPLC separation problems covering symptom documentation, peak shape diagnosis, retention anomaly investigation, matrix effect evaluation, and verified corrective action using controlled single-variable changes.

## When to Use

- Peaks are tailing, fronting, splitting, or broader than expected
- Retention times have shifted or become irreproducible
- Resolution between critical pairs has degraded
- Baseline drift, ghost peaks, or negative peaks have appeared
- Sensitivity has dropped or signal-to-noise has worsened
- A method that previously worked is now failing system suitability

## Inputs

### Required

- **Problem chromatogram**: Current data showing the issue
- **Reference chromatogram**: Recent good chromatogram from the same method for comparison
- **Method conditions**: Column, mobile phase/carrier gas, temperature/gradient, detector, flow rate
- **System log**: Recent maintenance, column changes, mobile phase preparations, instrument events

### Optional

- **Blank chromatogram**: Most recent blank or solvent injection
- **System suitability trend data**: Historical values for tailing, resolution, plates, retention time
- **Column history**: Number of injections, types of samples, age of column
- **Instrument maintenance log**: Pump seal replacements, lamp hours, detector service dates

## Procedure

### Step 1: Document the Problem

1. Describe the symptom precisely: which peaks are affected, how do they differ from the reference chromatogram.
2. Determine when the problem started: gradual degradation or sudden onset.
3. Record whether the problem affects all peaks or only specific ones.
4. Note whether the problem is present in standards, samples, or both.
5. Collect the current system suitability data and compare to historical trends.
6. Photograph or export the problem chromatogram alongside the reference for side-by-side comparison.

**Expected:** A documented problem statement with timeline, scope (all peaks vs. specific peaks, standards vs. samples), and comparison to reference data.

**On failure:** If no reference chromatogram is available, inject a fresh standard preparation under the documented method conditions to establish a current baseline before troubleshooting.

### Step 2: Diagnose Peak Shape Issues

Use the symptom table to identify likely root causes.

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

1. Match the observed symptom(s) to the table above.
2. Narrow the list of causes by checking whether the problem affects all peaks or specific ones, and whether it appeared suddenly or gradually.
3. Prioritize the most likely cause based on the system history (recent changes, column age, maintenance status).

**Expected:** One or two most-likely root causes identified from the symptom-cause mapping, prioritized by system history.

**On failure:** If the symptom does not match any row in the table, or multiple symptoms are present simultaneously, the problem may be compound (e.g., column degradation plus a leak). Address the most obvious issue first, then re-evaluate.

### Step 3: Diagnose Retention Time Issues

| Symptom | Possible Causes | Solutions |
|---|---|---|
| **All peaks shifted earlier** | Increased flow rate, higher column temperature, stronger mobile phase, column void | Check flow rate setting and actual delivery, verify temperature, remake mobile phase, inspect column |
| **All peaks shifted later** | Decreased flow rate, lower column temperature, weaker mobile phase, partially blocked tubing | Check for leaks (pressure drop), verify temperature, remake mobile phase, check inline filter |
| **Retention time drift (gradual)** | Column degradation, mobile phase evaporation (open reservoir), temperature fluctuation | Replace column, seal reservoir, stabilize oven, use column thermostat |
| **Retention time irreproducible** | Leak at fitting, check valve malfunction, autosampler timing error, inadequate re-equilibration | Pressure-test fittings, replace check valves, verify autosampler, increase equilibration volume |
| **Lost retention (k' near 0)** | Phase collapse (RP at high aqueous), column dewetting, wrong mobile phase, reversed connections | Use polar-embedded or AQ-type column, re-wet column with organic, verify mobile phase, check plumbing |
| **Co-elution (previously resolved)** | Column selectivity lost (bonded phase stripped), mobile phase composition changed, temperature changed | Replace column, verify mobile phase preparation, check temperature setpoint vs. actual |

1. Determine whether retention shifts are uniform (all peaks) or selective (specific peaks).
2. Uniform shifts point to systematic causes (flow, temperature, mobile phase composition).
3. Selective shifts point to column chemistry changes or specific analyte-related issues.
4. Check the instrument pressure trace: sudden pressure changes indicate leaks or blockages.
5. Re-inject the reference standard to confirm whether the issue is in the system or the sample.

**Expected:** Root cause of retention anomaly identified and categorized as systematic (instrument/mobile phase) or column-related.

**On failure:** If re-injecting the standard on a new column resolves the issue, the original column is the problem. If the issue persists on a new column, the cause is upstream (mobile phase, instrument, or method parameters).

### Step 4: Evaluate Matrix Effects

1. Compare the standard chromatogram to the sample chromatogram:
   - Are there additional peaks in the sample that are absent in the standard?
   - Is the baseline elevated or noisy in specific retention windows?
   - Are analyte peak shapes different in the sample vs. standard (broader, tailing more)?
2. For LC-MS: evaluate ion suppression/enhancement:
   - Post-column infusion test: infuse analyte continuously while injecting a blank matrix extract; dips in the analyte signal indicate ion suppression regions.
   - If analyte retention time coincides with a suppression region, modify the method to shift analyte elution.
3. Check for column contamination:
   - Inject solvent blanks after a sample sequence; persistent peaks indicate column contamination.
   - Flush the column with strong solvent (100% organic for RP, or as recommended by column manufacturer).
4. Assess sample preparation:
   - Dirty injector (autosampler needle, injection port liner in GC): replace or clean.
   - Insufficient sample cleanup: add a filtration, SPE, or protein precipitation step.
5. For GC: check for non-volatile residue buildup in the inlet liner, which causes peak tailing and ghost peaks over time.

**Expected:** Matrix effects characterized (presence/absence of interferents, ion suppression zones for LC-MS, column contamination status) with actionable recommendations.

**On failure:** If matrix effects cannot be adequately characterized with available data, prepare a matrix-matched calibration curve and compare slopes to a solvent calibration curve. A slope difference > 15% indicates significant matrix effects requiring method modification.

### Step 5: Implement and Verify the Fix

1. Change only one variable at a time. Document what was changed and why.
2. After each change, re-inject the system suitability standard and compare to the reference chromatogram.
3. Sequence of changes to try (from least to most disruptive):
   - Prepare fresh mobile phase / carrier gas tank
   - Replace consumables (septum, liner, frit, inline filter, lamp)
   - Tighten or replace fittings and tubing
   - Flush/regenerate the column
   - Adjust method parameters (temperature, flow, gradient, pH)
   - Replace the column
   - Service the instrument (pump seals, check valves, detector)
4. Once the fix is identified, run the full system suitability test (n >= 5 injections).
5. Compare all parameters (retention time, area, resolution, tailing, plates) to historical specification.
6. Document the root cause, corrective action, and verification results in the instrument/column logbook.
7. If the same problem recurs, establish a preventive maintenance schedule to address the root cause proactively.

**Expected:** Problem resolved with system suitability parameters restored to specification. Root cause, corrective action, and verification documented.

**On failure:** If all single-variable changes fail to resolve the issue, the problem may involve multiple simultaneous failures. Replace all consumables and the column together, verify with a fresh standard, and rebuild the troubleshooting from the new baseline. If the problem persists after total consumable replacement, escalate to instrument service.

## Validation

- [ ] Problem documented with symptom description, timeline, and scope
- [ ] Root cause identified using symptom-cause mapping tables
- [ ] Only one variable changed at a time during troubleshooting
- [ ] Fix verified by system suitability test (n >= 5 replicate injections)
- [ ] All system suitability parameters restored to within specification
- [ ] Root cause and corrective action documented in logbook
- [ ] Preventive measure identified to avoid recurrence

## Common Pitfalls

- **Changing multiple variables simultaneously**: Makes it impossible to identify the actual root cause. Always change one thing, test, then decide whether to change another.
- **Replacing the column as the first step**: Column replacement is expensive and may mask the real problem (e.g., a leak, wrong mobile phase, or contaminated inlet). Exhaust simpler possibilities first.
- **Ignoring the instrument logbook**: Many problems trace back to a recent maintenance event, mobile phase batch change, or column swap. Always check what changed recently.
- **Blaming the sample without evidence**: Run the reference standard first. If the standard also shows the problem, the issue is in the system, not the sample.
- **Flushing a column with incompatible solvents**: Never flush a reversed-phase column with pure water (causes phase collapse) or a silica HILIC column with pure aqueous buffer (irreversible damage). Follow the manufacturer's washing protocol.
- **Not documenting what was tried**: Failed troubleshooting attempts are valuable information. Record every change attempted and its outcome to avoid repeating unsuccessful fixes and to build institutional knowledge.

## Related Skills

- `interpret-chromatogram` -- understanding the chromatographic data that reveals separation problems
- `develop-gc-method` -- GC method development, relevant when troubleshooting requires method redesign
- `develop-hplc-method` -- HPLC method development, relevant when troubleshooting requires method redesign
- `validate-analytical-method` -- re-validation may be required after significant method changes during troubleshooting
