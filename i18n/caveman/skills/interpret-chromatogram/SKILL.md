---
name: interpret-chromatogram
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Interpret a chromatogram from GC or HPLC analysis: verify system suitability
  parameters, identify peaks by retention time and spectral matching, perform
  accurate peak integration, calculate chromatographic figures of merit, and
  assess overall peak quality for reliable quantitation.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, peak-analysis, resolution, integration, system-suitability
---

# Interpret Chromatogram

Systematic read of GC and HPLC chromatograms. Cover system suitability, peak ID, integration, chromatographic figures, peak quality. For confident qual and quant results.

## When Use

- Reviewing chromatographic data before reporting
- Verify system suitability test passes before sample sequence
- Identify unknown peaks. Confirm known analytes by retention time or spectra
- Troubleshoot unexpected peaks, baseline anomalies, integration artifacts
- Training analysts on chromatogram interpretation

## Inputs

### Required

- **Chromatogram data**: Digital or printed. Time axis + detector response axis
- **Reference standard data**: Retention times and responses of known analytes under same method
- **Method parameters**: Column, mobile phase/carrier gas, temperature/gradient, detector settings

### Optional

- **Spectral data**: UV-Vis spectra (DAD), mass spectra (MS), other spectra for peak confirmation
- **Previous chromatograms**: Historical data from same method for trend compare
- **System suitability criteria**: Acceptance limits from method or regulatory standard
- **Sample prep details**: Dilution factors, extraction recovery, internal standard conc

## Steps

### Step 1: Verify System Suitability

Confirm chromatographic system performs within spec before interpreting sample data.

| Parameter | Typical Specification | Calculation |
|---|---|---|
| Retention time RSD | <= 1.0% | RSD of tR over n >= 5 injections |
| Peak area RSD | <= 2.0% (assay), <= 5.0% (impurity) | RSD of area over n >= 5 injections |
| Tailing factor (T) | 0.8-2.0 (USP), ideally 0.9-1.2 | T = W0.05 / (2 * f) where W0.05 = width at 5% height, f = front half-width |
| Resolution (Rs) | >= 1.5 (baseline), >= 2.0 (regulated) | Rs = 2(tR2 - tR1) / (w1 + w2) |
| Theoretical plates (N) | Per column spec (e.g., >= 2000) | N = 16(tR / w)^2 or N = 5.54(tR / w0.5)^2 |
| Capacity factor (k') | 2.0-10.0 for primary analyte | k' = (tR - t0) / t0 |

1. Locate system suitability injections (usually 5-6 replicates of reference standard at start of sequence)
2. Calculate each parameter from table
3. Compare calculated values vs method's acceptance criteria
4. Any parameter fails? System not suitable. Do not proceed until issue fixed
5. Document all system suitability results in batch record

**Got:** All system suitability parameters within spec. System fit for purpose.

**If fail:** Retention time RSD fails? Check temperature stability, mobile phase prep errors, column degradation. Tailing factor fails? Inspect inlet liner (GC) or column frit (HPLC). Resolution fails? Check column with dedicated test mix, replace if needed.

### Step 2: Identify Peaks

1. Compare each peak's retention time (tR) vs reference standard chromatogram
   - Acceptable match: within +/- 2% of reference tR (or +/- 0.1 min for short runs)
2. Ambiguous IDs? Use co-injection (spiking): add reference standard to sample, re-inject. Target peak should grow without broadening or shouldering
3. DAD-equipped HPLC: compare UV-Vis spectrum of each peak vs spectral library
   - Spectral match index >= 990 (out of 1000) for positive ID
   - Check spectral purity across peak (front, apex, tail spectra should overlay)
4. MS-equipped: confirm molecular ion (m/z) and key fragment ions vs reference spectra
5. Flag any peak not identifiable. Report as "unknown" with retention time and relative response

**Got:** All target analytes identified by retention time, with spectral confirmation where available. Unknown peaks flagged with retention time and area.

**If fail:** Retention times shifted uniformly? Systematic change happened (column aging, temperature drift, mobile phase error). Re-inject reference standard to establish current retention times before re-evaluating.

### Step 3: Integrate Peaks

1. Select integration mode:
   - Automatic integration with data system defaults as starting point
   - Manual adjust only when automatic demonstrably misplaces baseline or peak boundaries
2. Set integration parameters:
   - Baseline detection sensitivity (slope sensitivity / threshold)
   - Minimum peak area or height to reject noise
   - Peak width parameter matching narrowest expected peak
3. Verify baseline placement:
   - Baseline connects start and end of each peak at true chromatographic baseline
   - Overlapping peaks: use valley-to-valley or perpendicular drop per method spec
   - Gradient methods: baseline may rise — use tangent skim or exponential skim for peaks on rising baseline
4. Check for integration errors:
   - Split peaks integrated as two when they should be one
   - Shoulder peaks merged into main peak when should be separate
   - Noise spikes integrated as peaks
   - Baseline drawn through peak (negative peak clipping)
5. Record final integration parameters and any manual adjustments with justification in audit trail

**Got:** All target peaks integrated with correct baseline. No artifacts. All manual adjustments documented with rationale.

**If fail:** Automatic integrator consistently mishandles particular peak shape? Create timed-events integration method with custom parameters for that retention window. Never manually adjust integration to get desired result — adjustments must be scientifically justified.

### Step 4: Calculate Chromatographic Parameters

Calculate for all reported peaks:

1. **Resolution (Rs)** between adjacent peaks:
   - Rs = 2(tR2 - tR1) / (w1 + w2)
   - Rs >= 1.5 = baseline separation. Rs >= 2.0 = margin for routine use
2. **Tailing factor (T)** at 5% peak height:
   - T = W0.05 / (2f)
   - T = 1.0 = perfectly symmetric. T > 2.0 = significant tailing
3. **Theoretical plates (N)**:
   - N = 16(tR / w)^2 using baseline width, or N = 5.54(tR / w0.5)^2 using half-height width
   - Higher N = better column efficiency
4. **Capacity factor (k')**:
   - k' = (tR - t0) / t0 where t0 = dead time (void volume / flow rate)
   - Ideal range: 2-10 for good separation with reasonable run time
5. **Selectivity factor (alpha)** between critical pair:
   - alpha = k'2 / k'1
   - alpha > 1.05 needed for adequate separation
6. Tabulate results for all analytes. Compare vs method specs

**Got:** All chromatographic parameters calculated, tabulated, compared to acceptance criteria. Critical pair resolution and plate count documented.

**If fail:** Calculated plates much below column spec? Column maybe degraded — test with fresh standard, compare to historical data. Parameters drift within sequence? Investigate instrument stability.

### Step 5: Assess Peak Quality

1. **Symmetry**: Peaks should be Gaussian or near-Gaussian. Significant fronting (T < 0.8) = column overload. Tailing (T > 1.5) = secondary interactions or dead volume
2. **Baseline separation**: Quant work — critical pairs must be baseline-resolved. Valley between peaks not returning to baseline? Note percentage valley, assess impact on accuracy
3. **Peak width consistency**: Peaks much broader than expected (vs standard) → on-column degradation, extra-column band broadening, or injection issues
4. **Spectral purity** (DAD/MS): Purity index shows spectral inhomogeneity across peak? Co-eluting impurity likely present. Adjust method for better resolution
5. **Negative peaks or baseline disturbances**: Negative peaks in UV = sample solvent absorbs more than mobile phase at detection wavelength — normal for solvent front, abnormal elsewhere
6. **Ghost peaks**: Peaks in blank injection = carryover, contaminated mobile phase, or column bleed. Identify source before reporting sample results
7. Summarize overall chromatographic quality. Note any limitations on reported results

**Got:** Peak quality assessed for all target analytes. Any anomalies (tailing, co-elution, ghost peaks) documented with potential impact on data quality.

**If fail:** Significant quality issues found (co-elution confirmed by spectral impurity, ghost peaks at analyte retention times)? Data may not be reportable. Flag results, investigate root cause, re-run after corrective action.

## Checks

- [ ] System suitability parameters calculated and within spec
- [ ] All target analytes identified by retention time (+/- spectral confirmation)
- [ ] Unknown peaks flagged with retention time and area
- [ ] Integration done with correct baseline. Manual adjustments documented
- [ ] Resolution, tailing, plates, capacity factor calculated for all peaks
- [ ] Peak quality assessed — no unresolved co-elutions affecting quantitation
- [ ] Ghost peaks and carryover evaluated via blank injection
- [ ] Results tabulated and compared vs method acceptance criteria

## Pitfalls

- **Accept automatic integration without review**: Data systems misplace baselines, especially for shoulders, small peaks near large ones, gradient baselines. Every chromatogram needs visual review.
- **Confuse retention time shift with new peak**: Uniform shifts (all peaks move together) = systematic change, not new compounds. Re-inject standard to recalibrate before making ID calls.
- **Report peaks below noise**: Peaks with S/N below 3 (detection) or 10 (quantitation) should not be identified or quantitated. Calculate S/N explicitly for trace-level peaks.
- **Ignore solvent front**: Void volume peak not an analyte. Ensure t0 correctly identified and excluded from analyte reporting.
- **Manual integration to hit target result**: Adjusting integration to make result pass spec = data falsification. All integration changes must be scientifically justified, audit-trailed.
- **Neglect spectral purity checks**: Clean-looking peak can hide co-eluting impurity. Always check peak purity when DAD or MS data available.

## See Also

- `develop-gc-method` — method dev for GC technique making chromatogram
- `develop-hplc-method` — method dev for HPLC technique making chromatogram
- `troubleshoot-separation` — diagnose problems found during chromatogram interpretation
- `validate-analytical-method` — formal validation of method generating chromatographic data
- `interpret-mass-spectrum` — detailed interpretation of MS data for GC-MS and LC-MS peak confirmation
