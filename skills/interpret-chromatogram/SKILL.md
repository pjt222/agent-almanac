---
name: interpret-chromatogram
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

# Interpret a Chromatogram

Systematic interpretation of GC and HPLC chromatograms covering system suitability verification, peak identification, integration, calculation of chromatographic parameters, and assessment of peak quality for confident qualitative and quantitative results.

## When to Use

- Reviewing chromatographic data before reporting analytical results
- Verifying that a system suitability test passes before running a sample sequence
- Identifying unknown peaks or confirming known analytes by retention time or spectral data
- Troubleshooting unexpected peaks, baseline anomalies, or integration artifacts
- Training analysts on chromatographic data interpretation

## Inputs

### Required

- **Chromatogram data**: Digital or printed chromatogram with time axis and detector response axis
- **Reference standard data**: Retention times and responses of known analytes under the same method conditions
- **Method parameters**: Column, mobile phase/carrier gas, temperature/gradient program, detector settings

### Optional

- **Spectral data**: UV-Vis spectra (DAD), mass spectra (MS), or other spectral information for peak confirmation
- **Previous chromatograms**: Historical data from the same method for trend comparison
- **System suitability criteria**: Acceptance limits from the method or regulatory standard
- **Sample preparation details**: Dilution factors, extraction recovery, internal standard concentration

## Procedure

### Step 1: Verify System Suitability

Confirm that the chromatographic system is performing within specification before interpreting sample data.

| Parameter | Typical Specification | Calculation |
|---|---|---|
| Retention time RSD | <= 1.0% | RSD of tR over n >= 5 injections |
| Peak area RSD | <= 2.0% (assay), <= 5.0% (impurity) | RSD of area over n >= 5 injections |
| Tailing factor (T) | 0.8-2.0 (USP), ideally 0.9-1.2 | T = W0.05 / (2 * f) where W0.05 = width at 5% height, f = front half-width |
| Resolution (Rs) | >= 1.5 (baseline), >= 2.0 (regulated) | Rs = 2(tR2 - tR1) / (w1 + w2) |
| Theoretical plates (N) | Per column spec (e.g., >= 2000) | N = 16(tR / w)^2 or N = 5.54(tR / w0.5)^2 |
| Capacity factor (k') | 2.0-10.0 for primary analyte | k' = (tR - t0) / t0 |

1. Locate the system suitability injections (typically 5-6 replicates of a reference standard at the start of the sequence).
2. Calculate each parameter from the table above.
3. Compare calculated values against the method's acceptance criteria.
4. If any parameter fails, the system is not suitable -- do not proceed to sample interpretation until the issue is resolved.
5. Document all system suitability results in the batch record.

**Expected:** All system suitability parameters within specification, confirming the system is fit for purpose.

**On failure:** If retention time RSD fails, check for temperature instability, mobile phase preparation errors, or column degradation. If tailing factor fails, inspect the inlet liner (GC) or column frit (HPLC). If resolution fails, check column performance with a dedicated test mix and replace if necessary.

### Step 2: Identify Peaks

1. Compare each peak's retention time (tR) against the reference standard chromatogram.
   - Acceptable retention time match: within +/- 2% of the reference tR (or +/- 0.1 min for short runs).
2. For ambiguous identifications, use co-injection (spiking): add reference standard to the sample and re-inject. The target peak should increase without broadening or shouldering.
3. For DAD-equipped HPLC: compare the UV-Vis spectrum of each peak against a spectral library.
   - Spectral match index >= 990 (out of 1000) for positive identification.
   - Check spectral purity across the peak (front, apex, tail spectra should overlay).
4. For MS-equipped systems: confirm molecular ion (m/z) and key fragment ions against reference spectra.
5. Flag any peak that cannot be identified -- report it as "unknown" with its retention time and relative response.

**Expected:** All target analytes identified by retention time matching, with spectral confirmation where available. Unknown peaks flagged with retention time and area.

**On failure:** If retention times have shifted uniformly, a systematic change has occurred (column aging, temperature drift, mobile phase error). Re-inject the reference standard to establish current retention times before re-evaluating.

### Step 3: Perform Peak Integration

1. Select integration mode:
   - Automatic integration with data system defaults as a starting point
   - Manual adjustment only when automatic integration demonstrably misplaces baseline or peak boundaries
2. Set integration parameters:
   - Baseline detection sensitivity (slope sensitivity / threshold)
   - Minimum peak area or height to reject noise
   - Peak width parameter matching the narrowest expected peak
3. Verify baseline placement:
   - Baseline should connect the start and end of each peak at the true chromatographic baseline
   - For overlapping peaks, use valley-to-valley or perpendicular drop methods as specified by the method
   - For gradient methods, baseline may rise -- use a tangent skim or exponential skim for peaks on a rising baseline
4. Check for integration errors:
   - Split peaks integrated as two when they should be one
   - Shoulder peaks merged into the main peak when they should be separate
   - Noise spikes integrated as peaks
   - Baseline drawn through a peak (negative peak clipping)
5. Record the final integration parameters and any manual adjustments with justification in an audit trail.

**Expected:** All target peaks integrated with correct baseline placement, no artifacts included, and all manual adjustments documented with rationale.

**On failure:** If the automatic integrator consistently mishandles a particular peak shape, create a timed-events integration method with custom parameters for that retention window. Never manually adjust integration to achieve a desired result -- adjustments must be scientifically justified.

### Step 4: Calculate Chromatographic Parameters

Calculate the following for all reported peaks:

1. **Resolution (Rs)** between adjacent peaks:
   - Rs = 2(tR2 - tR1) / (w1 + w2)
   - Rs >= 1.5 indicates baseline separation; Rs >= 2.0 provides margin for routine use
2. **Tailing factor (T)** at 5% peak height:
   - T = W0.05 / (2f)
   - T = 1.0 is perfectly symmetric; T > 2.0 indicates significant tailing
3. **Theoretical plates (N)**:
   - N = 16(tR / w)^2 using baseline width, or N = 5.54(tR / w0.5)^2 using half-height width
   - Higher N means better column efficiency
4. **Capacity factor (k')**:
   - k' = (tR - t0) / t0 where t0 is the dead time (void volume / flow rate)
   - Ideal range: 2-10 for good separation with reasonable run time
5. **Selectivity factor (alpha)** between critical pair:
   - alpha = k'2 / k'1
   - alpha > 1.05 is generally needed for adequate separation
6. Tabulate results for all analytes and compare against method specifications.

**Expected:** All chromatographic parameters calculated, tabulated, and compared to acceptance criteria. Critical pair resolution and plate count documented.

**On failure:** If calculated plates are significantly below the column specification, the column may be degraded -- test with a fresh standard and compare to historical data. If parameters drift within a sequence, investigate instrument stability.

### Step 5: Assess Peak Quality

1. **Symmetry**: Peaks should be Gaussian or near-Gaussian. Significant fronting (T < 0.8) suggests column overload; tailing (T > 1.5) suggests secondary interactions or dead volume.
2. **Baseline separation**: For quantitative work, critical pairs must be baseline-resolved. If valley between peaks does not return to baseline, note the percentage valley and assess impact on accuracy.
3. **Peak width consistency**: Peaks that are significantly broader than expected (compared to the standard) may indicate on-column degradation, extra-column band broadening, or injection issues.
4. **Spectral purity** (DAD/MS): If the purity index indicates spectral inhomogeneity across the peak, a co-eluting impurity is likely present. Consider adjusting the method for better resolution.
5. **Negative peaks or baseline disturbances**: Negative peaks in UV indicate the sample solvent absorbs more than the mobile phase at the detection wavelength -- this is normal for the solvent front but abnormal elsewhere.
6. **Ghost peaks**: Peaks present in the blank injection indicate carryover, contaminated mobile phase, or column bleed. Identify the source before reporting sample results.
7. Summarize overall chromatographic quality and note any limitations on the reported results.

**Expected:** Peak quality assessed for all target analytes; any anomalies (tailing, co-elution, ghost peaks) documented with their potential impact on data quality.

**On failure:** If significant quality issues are found (co-elution confirmed by spectral impurity, ghost peaks at analyte retention times), the data may not be reportable. Flag the results, investigate root cause, and re-run after corrective action.

## Validation

- [ ] System suitability parameters calculated and within specification
- [ ] All target analytes identified by retention time (+/- spectral confirmation)
- [ ] Unknown peaks flagged with retention time and area
- [ ] Integration performed with correct baseline placement; manual adjustments documented
- [ ] Resolution, tailing, plates, and capacity factor calculated for all peaks
- [ ] Peak quality assessed -- no unresolved co-elutions affecting quantitation
- [ ] Ghost peaks and carryover evaluated via blank injection
- [ ] Results tabulated and compared against method acceptance criteria

## Common Pitfalls

- **Accepting automatic integration without review**: Data systems can misplace baselines, especially for shoulders, small peaks near large ones, and gradient baselines. Every chromatogram must be visually reviewed.
- **Confusing retention time shift with a new peak**: Uniform retention time shifts (all peaks move together) indicate a systematic change, not new compounds. Re-inject the standard to recalibrate before making identification calls.
- **Reporting peaks below the noise level**: Peaks with signal-to-noise ratio below 3 (detection) or 10 (quantitation) should not be identified or quantitated. Calculate S/N explicitly for trace-level peaks.
- **Ignoring the solvent front**: The void volume peak is not an analyte. Ensure t0 is correctly identified and excluded from analyte reporting.
- **Manual integration to achieve a target result**: Adjusting integration to make a result pass specification is data falsification. All integration changes must be scientifically justified and audit-trailed.
- **Neglecting spectral purity checks**: A clean-looking peak can hide a co-eluting impurity. Always check peak purity when DAD or MS data is available.

## Related Skills

- `develop-gc-method` -- method development for the GC technique producing the chromatogram
- `develop-hplc-method` -- method development for the HPLC technique producing the chromatogram
- `troubleshoot-separation` -- diagnosing problems identified during chromatogram interpretation
- `validate-analytical-method` -- formal validation of the method generating the chromatographic data
- `interpret-mass-spectrum` -- detailed interpretation of MS data for GC-MS and LC-MS peak confirmation
