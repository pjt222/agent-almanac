---
name: troubleshoot-separation
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

# Troubleshoot Chromatographic Separation

GC/HPLC sep diagnosis → symptom doc → peak shape diag → retention anomaly → matrix effects → verified fix via one-var-at-time.

## Use When

- Peaks tail|front|split|broaden
- Retention shifted|irreproducible
- Resolution between critical pairs degraded
- Baseline drift|ghost peaks|negative peaks
- Sensitivity drop|S/N worse
- Working method now fails sys suitability

## In

### Required

- **Problem chromatogram**: Current data → issue
- **Reference chromatogram**: Recent good, same method → compare
- **Method conditions**: Column, mobile phase|carrier gas, temp|gradient, detector, flow
- **System log**: Recent maint, col changes, mobile phase prep, instrument events

### Optional

- **Blank chromatogram**: Most recent blank|solvent inj
- **Sys suitability trends**: Historical tailing, resolution, plates, RT
- **Col history**: # injections, sample types, age
- **Instrument maint log**: Pump seal, lamp hrs, detector service

## Do

### Step 1: Doc Problem

1. Symptom precise: which peaks, how differ from ref
2. When started: gradual|sudden
3. All peaks or specific?
4. Standards|samples|both?
5. Current sys suitability vs historical
6. Photo|export problem chromatogram side-by-side w/ ref

**Got:** Problem statement w/ timeline, scope (all|specific peaks, std|sample), ref comparison.

**If err:** No ref → inject fresh standard prep under documented method → establish current baseline before troubleshoot.

### Step 2: Diag Peak Shape

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

1. Match symptom(s) → table
2. Narrow causes: all peaks|specific, sudden|gradual
3. Prioritize → sys history (recent changes, col age, maint)

**Got:** 1-2 most-likely causes from sym-cause map, prioritized by history.

**If err:** No table match or multi-symptom → compound problem (col degradation + leak). Address obvious first → re-eval.

### Step 3: Diag Retention

| Symptom | Possible Causes | Solutions |
|---|---|---|
| **All peaks shifted earlier** | Increased flow rate, higher column temperature, stronger mobile phase, column void | Check flow rate setting and actual delivery, verify temperature, remake mobile phase, inspect column |
| **All peaks shifted later** | Decreased flow rate, lower column temperature, weaker mobile phase, partially blocked tubing | Check for leaks (pressure drop), verify temperature, remake mobile phase, check inline filter |
| **Retention time drift (gradual)** | Column degradation, mobile phase evaporation (open reservoir), temperature fluctuation | Replace column, seal reservoir, stabilize oven, use column thermostat |
| **Retention time irreproducible** | Leak at fitting, check valve malfunction, autosampler timing error, inadequate re-equilibration | Pressure-test fittings, replace check valves, verify autosampler, increase equilibration volume |
| **Lost retention (k' near 0)** | Phase collapse (RP at high aqueous), column dewetting, wrong mobile phase, reversed connections | Use polar-embedded or AQ-type column, re-wet column with organic, verify mobile phase, check plumbing |
| **Co-elution (previously resolved)** | Column selectivity lost (bonded phase stripped), mobile phase composition changed, temperature changed | Replace column, verify mobile phase preparation, check temperature setpoint vs. actual |

1. Shifts uniform (all) or selective (specific)?
2. Uniform → systematic (flow, temp, mobile phase)
3. Selective → col chemistry|specific analyte
4. Check pressure trace: sudden change → leaks|blockage
5. Re-inject ref std → confirm sys vs sample

**Got:** Retention root cause categorized: systematic (instrument/MP) or col-related.

**If err:** Re-inject std on new col resolves → orig col = problem. Persists on new col → upstream (MP, instrument, method).

### Step 4: Matrix Effects

1. Std vs sample chromatogram:
   - Extra peaks in sample absent from std?
   - Baseline elevated|noisy in retention windows?
   - Analyte peaks differ in sample vs std (broader, more tailing)?
2. LC-MS → ion suppression/enhancement:
   - Post-col infusion: infuse analyte continuous while inject blank matrix → dips = suppression regions
   - Analyte RT coincides w/ suppression → shift elution
3. Col contamination:
   - Solvent blanks after sample seq → persistent peaks = col contamination
   - Flush col w/ strong solvent (100% organic for RP, or per mfr)
4. Sample prep:
   - Dirty injector (autosampler needle, GC liner) → replace|clean
   - Insufficient cleanup → add filter, SPE, protein precipitation
5. GC: non-volatile residue in inlet liner → causes tailing + ghost over time

**Got:** Matrix effects characterized (interferents, ion suppression zones for LC-MS, col contamination) w/ actions.

**If err:** Can't characterize → matrix-matched cal curve vs solvent cal curve. Slope diff > 15% → significant matrix effects → method mod.

### Step 5: Fix + Verify

1. One var at a time. Doc what + why.
2. Per change → re-inject sys suitability std vs ref
3. Sequence (least → most disruptive):
   - Fresh mobile phase | carrier gas tank
   - Replace consumables (septum, liner, frit, inline filter, lamp)
   - Tighten|replace fittings + tubing
   - Flush|regen col
   - Adjust method (temp, flow, gradient, pH)
   - Replace col
   - Service instrument (pump seals, check valves, detector)
4. Fix found → full sys suitability test (n >= 5 injections)
5. Compare all params (RT, area, resolution, tailing, plates) vs spec
6. Doc root cause, action, verify in instrument|col logbook
7. Recurs → preventive maint schedule

**Got:** Problem resolved, sys suitability params restored to spec. Root cause + action + verify documented.

**If err:** All single-var changes fail → multi simultaneous failures. Replace all consumables + col together → verify w/ fresh std → rebuild from new baseline. Persists after total replacement → escalate to instrument service.

## Check

- [ ] Problem documented w/ symptom, timeline, scope
- [ ] Root cause via sym-cause maps
- [ ] One var at a time
- [ ] Fix verified by sys suitability (n >= 5 replicate inj)
- [ ] All sys suitability params restored to spec
- [ ] Root cause + action in logbook
- [ ] Preventive measure ID'd

## Traps

- **Multi vars at once**: Can't ID root cause. One change → test → decide.
- **Col first**: Expensive, masks real problem (leak, wrong MP, contaminated inlet). Exhaust simpler first.
- **Ignore logbook**: Many problems → recent maint, MP batch, col swap. Check what changed.
- **Blame sample w/o evidence**: Run ref std first. Std also shows problem → sys, not sample.
- **Incompatible solvents**: Never flush RP w/ pure water (phase collapse) or silica HILIC w/ pure aqueous (irreversible). Per mfr protocol.
- **No documentation**: Failed attempts valuable. Record every change + outcome → avoid repeat + build knowledge.

## →

- `interpret-chromatogram` — understanding chromatographic data revealing sep problems
- `develop-gc-method` — GC method dev, relevant when troubleshooting requires redesign
- `develop-hplc-method` — HPLC method dev, relevant when troubleshooting requires redesign
- `validate-analytical-method` — re-validation may need after significant method changes
