---
name: interpret-chromatogram
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Interpret chromatogram (GC/HPLC) — verify system suitability, id peaks by tR +
  spectral match, integrate, calc figures of merit, assess peak quality →
  reliable quant.
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

Systematic interpret GC/HPLC → system suitability, peak id, integration, param calc, peak quality → confident qual+quant.

## Use When

- Review chrom data before reporting
- Verify system suitability passes before sample seq
- ID unknown peaks / confirm analytes by tR / spectral
- Troubleshoot peaks, baseline anomalies, integration artifacts
- Train analysts → interpret

## In

### Req

- **Chromatogram**: Digital/printed w/ time + detector axes
- **Ref standard**: tR + response of known analytes (same method)
- **Method params**: Column, mobile phase/carrier, temp/gradient, detector

### Opt

- **Spectral**: UV-Vis (DAD), MS, or other → peak confirm
- **Prior chroms**: Historical data (same method) → trend
- **Suitability criteria**: Method / regulatory limits
- **Prep details**: Dilution, recovery, IS conc

## Do

### Step 1: Verify System Suitability

Confirm system in spec before interpret.

| Parameter | Typical Specification | Calculation |
|---|---|---|
| Retention time RSD | <= 1.0% | RSD of tR over n >= 5 injections |
| Peak area RSD | <= 2.0% (assay), <= 5.0% (impurity) | RSD of area over n >= 5 injections |
| Tailing factor (T) | 0.8-2.0 (USP), ideally 0.9-1.2 | T = W0.05 / (2 * f) where W0.05 = width at 5% height, f = front half-width |
| Resolution (Rs) | >= 1.5 (baseline), >= 2.0 (regulated) | Rs = 2(tR2 - tR1) / (w1 + w2) |
| Theoretical plates (N) | Per column spec (e.g., >= 2000) | N = 16(tR / w)^2 or N = 5.54(tR / w0.5)^2 |
| Capacity factor (k') | 2.0-10.0 for primary analyte | k' = (tR - t0) / t0 |

1. Locate suitability injections (usually 5-6 replicates ref std at seq start)
2. Calc each param
3. Compare vs acceptance criteria
4. Any fail → system not suitable → don't proceed till fixed
5. Doc results in batch record

→ All params in spec → system fit for purpose.

**If err:** tR RSD fails → check temp instability, mobile phase prep err, column degrade. Tailing fails → inspect inlet liner (GC) / column frit (HPLC). Res fails → test mix → replace column if needed.

### Step 2: ID Peaks

1. Compare peak tR vs ref std chrom
   - Acceptable: ±2% of ref tR (or ±0.1 min short runs)
2. Ambiguous → co-injection (spike): add std to sample, re-inject. Target peak increases w/o broaden/shoulder.
3. DAD HPLC: compare UV-Vis spectrum vs lib
   - Match index ≥ 990/1000 → positive ID
   - Check spectral purity across peak (front/apex/tail overlay)
4. MS: confirm molecular ion (m/z) + key frag ions vs ref
5. Flag unidentified → "unknown" w/ tR + rel response

→ All targets ID'd by tR match w/ spectral confirm where avail. Unknowns flagged w/ tR + area.

**If err:** tR uniformly shifted → systematic change (column age, temp drift, mobile phase err). Re-inject std → establish current tRs before re-eval.

### Step 3: Integrate

1. Select mode:
   - Auto w/ data sys defaults → start
   - Manual only when auto demonstrably misplaces baseline / peak boundary
2. Set params:
   - Baseline sensitivity (slope / threshold)
   - Min area/height → reject noise
   - Peak width matches narrowest expected
3. Verify baseline:
   - Connects start+end of peak at true baseline
   - Overlap → valley-to-valley / perpendicular drop per method
   - Gradient: rising baseline → tangent/exponential skim
4. Check integration errs:
   - Split peaks as 2 when should be 1
   - Shoulder merged into main peak when should be sep
   - Noise spikes as peaks
   - Baseline thru peak (neg clip)
5. Record final params + any manual + justification in audit trail

→ All targets integrated, correct baseline, no artifacts, manual docs w/ rationale.

**If err:** Auto consistently mishandles peak shape → timed-events integration w/ custom params for that window. Never adjust to achieve desired result → adjustments must be sci justified.

### Step 4: Calc Chrom Params

Calc for all reported peaks:

1. **Resolution (Rs)** adjacent:
   - Rs = 2(tR2 - tR1) / (w1 + w2)
   - Rs ≥ 1.5 → baseline sep; ≥ 2.0 → routine margin
2. **Tailing (T)** at 5% height:
   - T = W0.05 / (2f)
   - 1.0 symmetric; >2.0 → significant tail
3. **Plates (N)**:
   - N = 16(tR / w)^2 baseline w, or N = 5.54(tR / w0.5)^2 half-h
   - Higher → better efficiency
4. **Capacity (k')**:
   - k' = (tR - t0) / t0, t0 = dead time (void vol / flow)
   - Ideal 2-10 → good sep + reasonable run
5. **Selectivity (α)** critical pair:
   - α = k'2 / k'1
   - α > 1.05 → adequate sep
6. Tabulate all, compare vs method spec

→ All params calc, tabulated, compared vs criteria. Critical pair res + plate count documented.

**If err:** Plates below spec → column may be degraded → test fresh std, compare historical. Params drift in seq → investigate instrument stability.

### Step 5: Assess Peak Quality

1. **Symmetry**: Gaussian / near-Gaussian. Fronting (T < 0.8) → overload; tailing (T > 1.5) → secondary interactions / dead vol.
2. **Baseline sep**: Quant → critical pairs must be baseline-resolved. Valley no return → note % valley + assess accuracy impact.
3. **Peak width consistency**: Broader than expected (vs std) → on-column degradation, extra-column broadening, injection issues.
4. **Spectral purity** (DAD/MS): Purity index → inhomogeneity → co-eluting impurity likely. Consider method adj for better res.
5. **Neg peaks / baseline disturb**: Neg in UV → sample solvent absorbs more than mobile phase at λ → normal for solvent front, abnormal elsewhere.
6. **Ghost peaks**: In blank → carryover, contaminated mobile phase, column bleed. ID source before report.
7. Summarize quality + note limitations on reported results

→ Quality assessed per analyte. Anomalies (tail, co-elute, ghost) documented w/ data impact.

**If err:** Significant quality issues (co-elute confirmed by spectral impurity, ghost at analyte tR) → data may not be reportable. Flag, investigate root cause, re-run after corrective action.

## Check

- [ ] Suitability params calc + in spec
- [ ] All targets ID'd by tR (± spectral)
- [ ] Unknowns flagged w/ tR + area
- [ ] Integration correct baseline, manual docs
- [ ] Res, tail, plates, k' calc for all peaks
- [ ] Quality assessed → no unresolved co-elute affecting quant
- [ ] Ghost + carryover evaluated via blank
- [ ] Results tabulated vs method acceptance

## Traps

- **Accept auto integration w/o review**: Data sys misplaces baselines, esp shoulders, small peaks near large, gradient baselines. Visual review always.
- **Confuse tR shift w/ new peak**: Uniform tR shift (all move) → systematic change, not new compounds. Re-inject std → recalibrate before ID calls.
- **Report peaks below noise**: S/N < 3 (detection) / < 10 (quant) → don't ID / quant. Calc S/N explicit for trace peaks.
- **Ignore solvent front**: Void vol peak ≠ analyte. t0 correctly ID'd + excluded from reporting.
- **Manual integration → target result**: Adjust to pass spec = data falsification. Changes must be sci justified + audit-trailed.
- **Neglect spectral purity**: Clean peak can hide co-eluting impurity. Always check purity when DAD/MS avail.

## →

- `develop-gc-method` — method dev for GC producing chrom
- `develop-hplc-method` — method dev for HPLC producing chrom
- `troubleshoot-separation` — diagnose problems found during interpret
- `validate-analytical-method` — formal validation of method generating data
- `interpret-mass-spectrum` — detailed MS interpret for GC-MS / LC-MS peak confirm
