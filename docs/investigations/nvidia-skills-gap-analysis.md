# NVIDIA/skills vs agent-almanac vs bare-metal — Gap Analysis

**Scope:** NVIDIA `nvidia/skills` catalog (321 skills @ main) vs agent-almanac (369 skills, 66 domains) vs bare-metal (unpackaged GA104 SASS layer). Severity anchored to a single-laptop GA104 sm_86, library-free, hand-SASS/cuasmR workflow. Claims below have been adversarially verified against live repos; refuted absolutes are corrected inline.

---

## 1. Executive summary

- **The three ecosystems stack cleanly by abstraction altitude and barely overlap in mechanism.** NVIDIA's entire catalog lives at framework-config / GPU-library-API / tile-DSL. almanac sits one rung lower (roofline + SASS-stall *reading*). bare-metal owns the rung below that — SASS/cubin *authoring* — which is clean whitespace, but it is **completely unpackaged** as skills.
- **Corrected key finding:** NVIDIA does *not* "never touch SASS." `tilegym-improve-cutile-kernel-perf` ships a SASS **read/diagnose** playbook (`references/ir-dump-guide.md`: `cuobjdump --dump-sass`, MUFU counts, `STG.E.128`→`STG.E.U16` regression checks) targeting even sm_120/Blackwell. The real whitespace is the **write side**: byte-level cubin patching and hand-authored control-code encoding. No NVIDIA skill authors or patches machine code.
- **cuTile/TileGym (7 skills) is NVIDIA's *only* GPU-kernel-authoring family** and the exact rung above hand-SASS. It autotunes tile sizes/occupancy/TMA/IR but stops at its own IR; conversion seams go *sideways* (`converting-cutile-to-triton`, `converting-cutile-to-julia`), never down to SASS. This is the single highest-value NVIDIA-shaped gap: an autotuned cuTile baseline is the ideal upstream generator feeding a cuasmR last-mile hand-edit.
- **bare-metal's four flagship packageable skills are pure whitespace** (`hand-edit-sass-cuasm`, `encode-ampere-control-codes`, `measure-gpu-kernel-under-power-cap`, `grid-sweep-clock-locked-bench`) — but the power-cap methodology is **narrower than first claimed**: NVIDIA *does* lock clocks (`tilegym-cutile-autotuning` prescribes `nvidia-smi -lgc`) and *does* do power-mode-aware gating (Jetson `nvpmodel`/`jetson_clocks`, `jetson-llm-benchmark` MAXN warnings). bare-metal's genuine edge is the `clocks_throttle_reasons` **bitmask decode + live mid-run hard-invalidation + the WSL `nvidia-smi.exe -lgc` host-boundary** propagation.
- **Governance is the mirror image:** NVIDIA enforces a heavy per-skill trust contract (SKILL.md + skill-card.md + `skill.oms.sig` + `evals/evals.json`, gated by SkillSpector). almanac has *richer body/procedure spec* (mandated Step→Expected/On-failure, binary Validation, capped Pitfalls) but *lighter, structural* governance.
- **Two governance gaps are real and cheap to close:** (1) no **content-security self-gate** over skill bodies despite `security-audit-codebase` already shipping *as a skill* and content flowing outward via **369 symlinks** into bare-metal + `install-almanac-content`; (2) eval **coverage/automation** — almanac is *not* eval-less (it has `tests/scenarios/`, 30 scenarios incl. 8 activation + 5 negative with rubrics), but only ~2% of skills are covered, scoring is human-observation not machine-scored-in-CI, and there is no uplift-vs-baseline.
- **NVIDIA's two biggest families are irrelevant here:** DOCA networking (60, #1) and Jetson (33, #4 — *not* #2; TAO=56 and NeMo=41 both exceed it) are hardware-gated (BlueField/Jetson board) — a genuine ~93-skill gap that a bare-metal GA104-on-WSL dev should record as intentionally out-of-scope, not chase.
- **Net strategic move:** package what bare-metal exclusively owns (SASS authoring + throttle-bitmask methodology), build the one missing bridge (cuTile-autotune → hand-SASS), and borrow two NVIDIA governance controls (content-scan self-gate, per-skill eval coverage) — *layered on top of* almanac's superior body contract, not traded for it.

---

## 2. Spec / governance comparison

| Dimension | NVIDIA/skills | agent-almanac | bare-metal |
|---|---|---|---|
| **Catalog size** | 321 skills, ~36 product families, 16 buckets | 369 skills, 66 domains (+75 agents, 22 teams, workflows) | 0 project-local GPU SKILL.md; 369 symlinks into almanac + 4 `peon-ping-*` locals |
| **Required artifacts/skill** | SKILL.md + `skill-card.md` + `skill.oms.sig` + `evals/evals.json` (+ optional BENCHMARK.md) | SKILL.md only | — (knowledge lives in `docs/*.md`, `AGENTS.md`, cuasmR pkg, `scripts/`) |
| **Frontmatter** | `name`+`description` req; `license` (SPDX), `version` inconsistent (present on tilegym 1.3.0, absent on cuDF), `metadata.{author,tags}` | `name`+`description` req; mandated `metadata.{version(semver),domain(registry-validated),complexity,language,tags}`, `allowed-tools` (advisory) | n/a |
| **Body contract** | Minimal/discovery; Tier-1 only flags missing `## Instructions`/`## Examples` | **Mandated**: imperative title, When-to-Use, Inputs, Procedure w/ per-Step **Expected:/On failure:**, binary Validation checklist, capped 3–6 Pitfalls (evict-not-append), Related Skills; ≤500 lines | n/a |
| **Content-security scan** | SkillSpector: **68 patterns / 17 categories** (inventory said 64/16), static+LLM+OSV.dev; high/critical gate (fix-or-record-acceptance) | **None** as a self-gate. `validate-integrity.sh` is structural. Owns the capability as user-facing skills (`security-audit-codebase`, `assess-github-repo-security`) but never applies it | n/a |
| **Eval contract** | `evals/evals.json` per skill: positive + ≥1 negative (`expected_skill:null`), starter workspace, `ground_truth` rubric; machine-scored (Security/Correctness/Discoverability/Effectiveness/Efficiency) w/ **uplift vs no-skill baseline** in BENCHMARK.md (cuDF: 13 tasks, 2 attempts, 50% threshold, Disc. 84% = +26%) | `tests/scenarios/` (registry v2.0, 30 scenarios: ~8 activation + 5 negative + 3 integration), Ground-Truth tables, weighted Acceptance Criteria + PASS threshold, 5-dim rubric — but **human-observation**, ~2% coverage, no uplift baseline, not machine-scored in CI | n/a |
| **Inter-skill dedup** | NVSkills-Eval Tier-2 (context + inter-skill) | None (has `coverage-matrix.js` harness, unused for dedup) | n/a |
| **Signing / integrity** | OMS detached `skill.oms.sig` (Sigstore dir-tree bundle), verify vs `nv-agent-root-cert.pem`; integrity+authenticity only ("does not prove safe") | `validate-integrity.sh` (structural) + line-endings; **no crypto signing** | n/a |
| **Capability control** | Declared in frontmatter, reviewed declared-vs-actual, SkillSpector MCP least-privilege | `allowed-tools` experimental/advisory; no least-privilege review | n/a |
| **Distribution** | Synced catalog + Claude Code plugin + `npx skills add nvidia/skills` + Skills.sh/ClawHub/Hermes syndication; `metadata.schema.json` controlled enums (~350 products/6 cats) | Symlink farm (project+global) via `sync-discovery-symlinks.sh` → slash-commands; first-party JS/Rust CLI + `install-almanac-content`; `.claude-plugin/` manifest present, unpublished | Consumes almanac via symlink farm |
| **CI enforcement** | 10-step pipeline (sync→author→scan→integrity→card→eval→sign→verify→marketplace→syndicate) | `validate-{skills,content-style,integrity,line-endings,translations,tests,locales}.yml` — structural/procedural | pre-push gate: make-test smoke + `bench_regress` (standalone bench scripts ungated) |
| **Distinctive** | Trust/authenticity + machine eval + marketplace reach | Procedural rigor, 5 integrated content types, R/ggplot2 glyph viz, de/zh/ja/es i18n freshness gates, 29-skill self-regulation corpus | Raw-ISA authoring: cuasmR byte-patch, sm_86 control codes, WSL power-cap rig |

---

## 3. Coverage gaps

### 3a. NVIDIA has, we lack

| Gap | Severity | Relevance to bare-metal | Detail (corrected) |
|---|---|---|---|
| **cuTile / TileGym tile-DSL authoring** (7 skills) | **High** | High — exact rung above hand-SASS | Only GPU-kernel-authoring family: `tilegym-cutile-python`, `-adding-cutile-kernel`, `-improve-cutile-kernel-perf`, `-cutile-autotuning`, `-converting-cutile-to-triton`, `-converting-cutile-to-julia`, `-monkey-patch-kernels-to-transformers`. Autotunes tile sizes/occupancy/TMA/`num_ctas`/IR (sm80–sm120); **reads SASS diagnostically** but never emits/patches it. Conversion seams are sideways (Triton, Julia), never down to SASS. almanac gpu-optimization=2, bare-metal=raw cubin — **neither has any tile-DSL skill**. No cuTile↔SASS bridge exists anywhere. |
| **Distributed multi-GPU training-perf** (NeMo-MBridge, 20) | Medium | Low — single-GPU library-free | `nemo-mbridge-perf-{parallelism-strategies,cuda-graphs,megatron-fsdp,moe-optimization-workflow,moe-comm-overlap,tp-dp-comm-overlap,expert-parallel-overlap}`. Framework config only — **authors no kernels** (verified: `cuda_graph_impl`/TE `make_graphed_callables()`, `cfg.ddp.use_megatron_fsdp`). Out of scope except **CUDA-graph launch-latency amortization** — bare-metal has *zero* `cudaGraph` references today; directly transferable to one hand-tuned pipeline. |
| **General SWE git/CI craft** (Megatron-Core contributor) | Medium | Medium (concept only) | *Corrected:* the earlier "no git-as-craft/code-review" absolute is refuted. `mcore-split-pr` (split by CODEOWNERS, independently-mergeable, backward-compat shims), `mcore-create-issue` (GHA-failure triage→issue), `mcore-linting-and-formatting`, `mcore-testing` are real git/review craft — but **hardcoded to NVIDIA/Megatron-LM + Python**, so conceptually transferable to your stacked-PR/CI-diagnosis discipline, **not directly installable**, and **nothing for R** (the R gap is airtight — zero R/CRAN/renv/roxygen skills). |
| **GPU compute libraries** (14, not 11) | Low | Low — comparison baselines only | *Corrected count:* cuOpt **7** + cuPyNumeric 4 + cuDF 1 + DALI 1 + cuFolio 1 = **14** (+ DOCA GPUNetIO subset). `cupynumeric-migration-readiness` **explicitly declines** "Custom CUDA / kernel authoring" — the exact path bare-metal rejects. Needed only as measured-comparison ceiling. |
| **DOCA/DPU networking (60) + Jetson (33)** | Low | ~zero — hardware-gated | *Corrected:* DOCA=60 is #1, but **Jetson=33 is 4th-largest** (TAO=56 #2, NeMo=41 #3), *not* "two largest." ~93 skills gated on BlueField/Jetson hardware you don't have. almanac edge=1 (`deploy-edge-ai-model`, generic TFLite/ONNX, not a DPU/BSP substitute). **Record as intentionally out-of-scope.** |

### 3b. We have, NVIDIA lacks

| Asset | Severity | Detail (corrected) |
|---|---|---|
| **Raw SASS/cubin byte-patch layer** | **High** | *Corrected framing:* NVIDIA **reads** SASS (tilegym `ir-dump-guide.md`, `STG.E.128` checks, sm_120) but **never authors or patches** it. bare-metal's exclusive whitespace is the **write side**: `cuasmR::cuasm_set(instr_hex, ctrl_hex)` + `cuasm_write()` indexing 16-byte `.text` slots (`slot_off <- base + (j-1)*16`), `parse_e_flags()` handling CUDA 12.x→13.x relayout — plus reverse-engineered sm_86 control-word semantics NVIDIA publishes no docs for. **Unpackaged** — lives only as `docs/cuasm_r.md`, `control_codes.md`, `ampere_sass_reference.md`. |
| **Throttle-bitmask + WSL clock-lock methodology** | Medium *(down from High)* | *Corrected:* NVIDIA *does* lock clocks (`tilegym-cutile-autotuning/references/search-strategies.md`: "`nvidia-smi -lgc`") and *does* power-mode-gate (Jetson `nvpmodel`/`jetson_clocks`; `jetson-llm-benchmark` warns on ≠MAXN). bare-metal's **genuine edge** is narrower: decoding `nvidia-smi clocks_throttle_reasons` bitmask (`cuasmR::decode_throttle`, SwPowerCap=0x0004), **hard-invalidating** runs where throttle fired mid-run (`classify_meta`, `require_no_throttle`), and the **WSL host-boundary** — elevated `nvidia-smi.exe -lgc` on Windows propagating into WSL-CUDA where plain-WSL `-lgc` is denied (150 W VBIOS cap). Docs: `benchmark_methodology.md`, `rebaseline_protocol.md`, `elevated_session_runbook.md`, `grid_sweep_methodology.md`. |
| **Corpus-scale static SASS census** | Medium | `reg_audit.R` (register/spill/theoretical-occupancy) + `sass_histogram.R` (`useful_pct = (HMMA+IMMA+FFMA+FMUL+FADD)/total`) over ~123 hand-written kernels. NVIDIA's unit of analysis is one tile-DSL kernel or a pipeline — no cross-kernel census. |
| **sm_86 microarch design laws** | Medium | Feed TC/overlap loads; read each DRAM byte once; fill 32 (ideal) / ≥8 schedulers; **never cross the 50 KB smem cliff** (2→1 block/SM = measured 2× regression); `64K/48 ≈ 42 reg/thread`. cuTile *hides* occupancy behind its autotuner, so no NVIDIA skill teaches microarch heuristics. Package as a shared **reference**, not a duplicate procedure. |
| **General SWE / R-toolchain domains** | Medium | `r-packages`(10), `git`(10), `review`(11), `devops`(13), `observability`(13), `containerization`(10), `versioning`(4) — directly serve the cuasmR R package (0.2.0, 20 exported fns) + `scripts/` tooling + stacked-PR discipline. NVIDIA has **zero R** and only bundled/Python-locked git craft. No new content needed — verify the symlink farm surfaces `submit-to-cran`, `write-testthat-tests`, `write-roxygen-docs`, `create-pull-request`, `review-codebase`. |
| **Self-regulation + broad science corpus** | Low | `esoteric`(29, largest domain: breathe/meditate/heal/rest/dream/gratitude) + `swarm`(9)/`morphic`(7)/`synoptic`(4) + spectroscopy/chromatography/entomology/number-theory. *Corrected:* NVIDIA is "product-scoped **except 2** catalog-infra meta skills" (`nvidia-skill-finder`, `skill-card-generator`; `nemoclaw-user-guide` is borderline docs-router). Your project-checked-in `bare-metal/CLAUDE.md` wires `/breathe /meditate /heal /rest` — self-regulation layer in active use. |

### 3c. Overlap in intent, diverges in mechanism

| Theme | NVIDIA altitude | almanac/bare-metal altitude | Verdict |
|---|---|---|---|
| "Make the GPU fast" | Above compiler: MBridge config (20), cuTile tile-DSL (7), `deepstream-profile-pipeline`, `omniverse-usd-performance-tuning` | At/below ISA: `analyze-kernel-bottleneck` (roofline + `long/short_scoreboard`/`mio`/`math_throttle`/`barrier` stall taxonomy), `pipeline-gpu-kernel` (cp.async/LDGSTS), cuasmR patch | **both-have-differ.** ~27 NVIDIA perf skills give a SASS dev almost nothing actionable at their layer. Position as an abstraction ladder, don't chase. |
| Kernel-perf analysis | `tilegym-improve-cutile-kernel-perf` (tile-DSL IR + SASS *read*) | `analyze-kernel-bottleneck` (ISA stall taxonomy, sm_86) | Complementary, non-intersecting. **Fold** the `profile-kernel-ncu-metrics-ga104` candidate (15 validated ga104 NCU metrics + `load_coalesce_bytes` cp.async under-count caveat) **into** `analyze-kernel-bottleneck`, not standalone. |
| SASS beyond sm_86 | **Reads** sm_120 SASS (tilegym); no authoring for any arch | Authors sm_86 only (`ampere_sass_reference.md`; `fragment_shfl_reductions.md` flags sm_89/90 "may differ") | **both-lack** SASS-*authoring* for post-Ampere. *Corrected:* not "neither covers SASS" — NVIDIA reads a *newer* arch than bare-metal authors. Low severity; note cuasmR's byte-patch layer already survived one e_flags relayout, so it's the portable asset. |
| PTX / inline-asm rung | cuTile "does NOT drop to PTX" | Workflow passes `.cu→PTX→ptxas→cubin→cuasmR` but no PTX-authoring skill | **both-lack**, mostly deliberate (SASS gives finer control). No action unless cross-SKU portability need appears. |

---

## 4. Spec & governance — adopt vs already-better

### Borrow from NVIDIA (in priority order)

1. **Content-security self-gate (highest value/cost).** Add `validate-security.yml` running `security-audit-codebase` (or a SkillSpector-style set: prompt-injection, undeclared shell/network, exfil, `curl|bash`, credential access, MCP least-privilege) + OSV.dev over any skill shipping `scripts/`. The scanner **already exists as a skill** — this is wiring, not building. Content propagates outward (369 symlinks + `install-almanac-content`), so an unsafe one-liner reaches every consumer today. Land report-only to baseline, then flip high/critical to blocking. *(Corrected: SkillSpector is 68/17, and its gate is "fix-or-record-acceptance," a recommended order — not a proven automated hard block — so mirror the intent, not an overstated mechanism.)*
2. **Eval coverage + automation.** almanac is **not** eval-less — extend the existing `tests/scenarios/` contract rather than adopt NVSkills from scratch. Close three real deficits: (a) coverage (~8/369 → per-skill), (b) machine-scoring in CI (scenarios are human-observation), (c) uplift-vs-no-skill baseline on ≥Discoverability+Correctness. Seed on `analyze-kernel-bottleneck`, `pipeline-gpu-kernel`, and the 8 bare-metal candidates; wire eval-authoring into `create-skill`/`evolve-skill` so nothing merges eval-less. Directly serves the "measurement before claim" mantra.
3. **Inter-skill dedup gate (Tier-2 equivalent).** Trigger-phrase/description embedding similarity across `_registry.yml` on new-skill creation, surfacing top-N nearest + requiring merge-or-justify. Overlap is *already realized* in the candidate set (`audit-sass-corpus` vs `analyze-kernel-bottleneck`; `profile-kernel-ncu-metrics-ga104` flagged "candidate for merge"; `apply-ga104-four-laws` "shared reference not duplicate"). Reuse `coverage-matrix.js`.
4. **Slim skill-card.** Not the 15-section NVIDIA card (owner/license/geo are uniform boilerplate for a single-author monorepo). Adopt the human-judgment subset — Risks+Mitigations, Output shape, Capability footprint, Version SHA, one-line Ethics — auto-generating boilerplate from `_registry.yml`+metadata. Emit as `references/SKILL-CARD.md` to ride existing progressive disclosure. Highest value for the 29 esoteric skills and anything that shells out/fetches web.
5. **Promote `allowed-tools` to linted (review-time, not runtime).** CI greps each body for Bash/WebFetch/network/file-write vs declared `allowed-tools`; flag excess. Neither system runtime-sandboxes — be explicit this is least-privilege *review*. Matters because bare-metal candidates shell heavily (grid-sweep spawns a Windows tree **and** `wsl.exe pkill`).
6. **Lightweight hash manifest (skip full OMS).** Single-author authenticity is low-value — don't build Sigstore/ICA/CA. Record a per-skill SHA in `_registry.yml` or a signed git tag over `skills/` so consumers cheaply detect drift/tamper across the symlink farm. Reserve real OMS for if the catalog ever takes third-party contributions.

### Keep — almanac already does better (do NOT regress)

- **Per-Step Expected:/On failure: recovery grammar** — deterministic recovery vs NVIDIA's Tier-1 "flag missing `## Instructions`." Layer any adopted governance *on top*, don't trade rigor for artifact count.
- **Binary Validation checklist + capped-Pitfalls (evict-not-append)** — enforced by `review-skill-format`.
- **Mandatory in-frontmatter semver + registry-validated `domain`/`complexity`/`language`** — vs NVIDIA's inconsistent `version` (present on tilegym, absent on cuDF) living as a git-SHA in the card. *Borrow* only NVIDIA's controlled-enum *schema* idea (`metadata.schema.json`) to lint your enums, and add a git-SHA "version of record" alongside semver (bridges to the hash manifest above).
- **Five integrated content types** (skills+agents+teams+workflows+glyph viz), **i18n freshness gates**, **trace-driven `evolve-skill-from-traces`** — NVIDIA has no analogue. Optionally propose the Expected/On-failure grammar as an upstream NVSkills Tier-1 check.

---

## 5. GPU / CUDA / SASS deep-dive (the layering)

The three ecosystems form a clean abstraction ladder with **exactly one overlap rung (SASS read) and one exclusive rung (SASS author)**:

| Rung | Layer | NVIDIA/skills | agent-almanac | bare-metal |
|---:|---|---|---|---|
| 6 | Framework config | MBridge (20), Dynamo, DeepStream-profile, Omniverse-tuning | — | — |
| 5 | GPU library API | cuDF, cuOpt (7), cuPyNumeric (4), DALI, cuFolio | — | cuBLAS/cuDNN — *linked for measured comparison only* |
| 4 | Tile DSL (auto TC/TMA) | **TileGym/cuTile (7)** — autotune, occupancy, IR | — | — |
| 3 | PTX / inline asm | — (cuTile "does NOT drop to PTX") | — | pass-through (`.cu→PTX→ptxas`), not authored |
| 2 | **SASS read / diagnose** | `tilegym ir-dump-guide` (`cuobjdump --dump-sass`, MUFU, `STG.E.128`, **sm_120**) | `analyze-kernel-bottleneck` (stall taxonomy), `ncu_metrics` | `sass_histogram.R`, `ncu_profile_all.sh` |
| 1 | **SASS/cubin AUTHOR + byte-patch** | — **none** | — **none packaged** | **cuasmR byte-patch, sm_86 control-code encode** ← exclusive, unpackaged |

**Reading the ladder:**
- NVIDIA reaches *down* to rung 2 (SASS as a **diagnostic**, even on Blackwell) but never rung 1. almanac occupies rung 2. **bare-metal alone owns rung 1** — and it is entirely docs, zero packaged skills.
- The corrected finding matters: it's not "NVIDIA is SASS-blind." NVIDIA inspects SASS to decide *what tile-DSL config to change*; bare-metal inspects SASS to decide *what bytes to patch*. Same read, opposite write target. Rung 1 (the write) is the moat.

**The one bridge worth building (rung 4 → rung 1).** `tilegym-cutile-autotuning` is a systematic tile-size/occupancy search with **no almanac/bare-metal analogue** — `pipeline-gpu-kernel` is a manual double-buffering recipe; `grid-sweep-clock-locked-bench` sweeps *clocks* for a fixed kernel, not *configs* for a fixed goal. Two-stage flow, preserving the library-free hot-path invariant:

1. **Generate** a cuTile-autotuned baseline for the target shape → near-optimal TC/TMA cubin + an upper-bound reference number. Its SASS-diagnostic playbook (`ir-dump-guide.md`, `STG.E.128`→`STG.E.U16`) is the natural handoff point.
2. **Descend** with `hand-edit-sass-cuasm` + `encode-ampere-control-codes` for the sm_86 scheduling/control-word wins the tile DSL can't express (stall packing, scoreboard tuning, HMMA.16816 S08 / IMMA S04→S02).

Treat the autotuned kernel with the **same status as the existing cuBLAS/cuDNN comparison references** — non-hot-path, measured-comparison only. This captures NVIDIA's search discipline without contradicting the deliberately library-free thesis. Document it as a section in `analyze-kernel-bottleneck` or a companion skill, not as a hot-path dependency.

**Deliberate non-goals** (record so a future contributor doesn't mistake absence for oversight): cross-target conversion (`cutile→triton`/`→julia`, or Ampere→Hopper SASS) contradicts the last-mile sm_86 thesis; the PTX-authoring rung is skipped on purpose (SASS is finer); MBridge FSDP/comm-overlap is datacenter-only.

---

## 6. Prioritized recommendations

### (a) Governance / spec upgrades to borrow

| Pri | Action | Effort | Payoff |
|---|---|---|---|
| **P0** | `validate-security.yml` — run `security-audit-codebase`/SkillSpector-style pattern set + OSV.dev over `skills/` on every PR; report-only → block high/critical | Low (scanner ships as a skill) | High — closes the outward-propagation hole across 369 symlinks + `install-almanac-content` |
| **P1** | Extend `tests/scenarios/` → per-skill coverage + machine-scored-in-CI + uplift-vs-baseline; wire eval-authoring into `create-skill`/`evolve-skill`; seed on the 2 shipped GPU skills + 8 bare-metal candidates | Med | High — serves "measurement before claim"; catches over-triggering |
| **P1** | Inter-skill dedup gate on new-skill creation (embedding similarity via `coverage-matrix.js`, merge-or-justify) | Low–Med | Med — overlap already realized in candidate set |
| **P2** | Slim `references/SKILL-CARD.md` (Risks/Mitigations, Output, Capability footprint, Version SHA, Ethics; auto-gen boilerplate) | Low | Med — reviewer accepts without reading source; matters for esoteric-29 + shelling skills |
| **P2** | Lint `allowed-tools` declared-vs-actual (grep bodies for Bash/WebFetch/network) | Low | Med — review-time least-privilege; grid-sweep dual-kill footprint |
| **P2** | Per-skill SHA in `_registry.yml` / signed git tag (skip OMS) | Low | Low–Med — cheap drift/tamper evidence |

### (b) bare-metal skills worth packaging (NVIDIA will never ship these)

| Pri | Candidate skill | Source | Effort | Payoff |
|---|---|---|---|---|
| **P0** | `hand-edit-sass-cuasm` — byte-level cubin read/index/patch (`cuasm_set`/`cuasm_write`, 16-byte slot, round-trip byte-identical, CUDA-13.2 e_flags) | `docs/cuasm_r.md`, `AGENTS.md`, `R/cuasmR`, `control_codes.md` | Med | Highest — zero NVIDIA overlap; crown-jewel tooling |
| **P0** | `encode-ampere-control-codes` — sm_86 control-word fields (6-bit barrier, R0-5/W0-5 scoreboards, Y yield, S00-S15 stall); `stall = latency − pipeline_depth`; HMMA.16816 S08 / IMMA S04→S02 | `docs/control_codes.md`, `ampere_sass_reference.md`, `gpu_reflections.md` | Med | Load-bearing — wrong stall = silent wrong result or GPU hang |
| **P1** | `measure-gpu-kernel-under-power-cap` — `clocks_throttle_reasons` bitmask decode (`decode_throttle`/`classify_meta`), live-throttle hard-invalidation, WSL host-side `nvidia-smi.exe -lgc` | `benchmark_methodology.md`, `rebaseline_protocol.md`, `elevated_session_runbook.md`, `bench/bench_regress.R` | Med | Real (narrowed) whitespace — bitmask decode + live gate + WSL boundary |
| **P1** | `grid-sweep-clock-locked-bench` — R-planner/pwsh-lock split, JSONL-primary atomic store keyed `(git_head, clock_mhz, cell_id)`, C# CancelKeyPress, dual Windows-tree + `wsl.exe pkill` | `grid_sweep_methodology.md`, `elevated_session_runbook.md`, `convergence_152_design.md` | Med–High | Operational — encodes WSL-survives-tree-kill + bad-power-baseline tells |
| **P1** | `apply-ga104-four-laws` — design-time occupancy reference (50 KB smem cliff, `64K/48≈42 reg/thread`) — **shared ref, cross-ref'd**, not duplicate | `AGENTS.md`, `gpu_reflections.md`, `memory_hierarchy.md`, `register_audit.md` | Low | Med — cited by the two shipped skills + `hand-edit-sass-cuasm` |
| **P2** | `audit-sass-corpus` — `reg_audit.R` + `sass_histogram.R` census over ~123 kernels | `register_audit.md`, `sass_histogram.md`, `inventory.md` | Low–Med | Med — fleet-level spill/occupancy regressions |
| **P2** | *Fold* `profile-kernel-ncu-metrics-ga104` (15 ga104 NCU metrics + coalesce caveat) **into** `analyze-kernel-bottleneck` | `ncu_metrics.md`, `ncu_profile_all.sh` | Low | Med — avoid dedup-gate flag |
| **P2** | `fragment-shfl-warp-reduction` — SHFL.BFLY 5-instr 32-lane reduce for softmax/layernorm epilogues | `fragment_shfl_reductions.md`, `kernels/reductions/` | Low | Low — narrow but genuinely unique |

### (c) NVIDIA skills worth pulling in now

| Pri | Skill(s) | How to use | Note |
|---|---|---|---|
| **P1** | `tilegym-cutile-autotuning` + `tilegym-improve-cutile-kernel-perf` (install the 7-skill TileGym family) | Two-stage flow §5: autotuned cuTile baseline → SASS-diagnostic handoff → cuasmR hand-edit. **Non-hot-path, measured-comparison role only** | Directly installable via `npx skills add nvidia/skills --skill tilegym-*` |
| **P2** | `mcore-split-pr`, `mcore-create-issue` | **Mine the pattern, don't install** — hardcoded to NVIDIA/Megatron-LM + Python. Map PR-split (CODEOWNERS, independently-mergeable, compat shims) + CI-triage onto your stacked-PR / CI-diagnosis discipline | Not directly installable; useless for R |
| **P2** | MBridge `nemo-mbridge-perf-cuda-graphs` (concept) | Extract only **CUDA-graph launch-overhead amortization** as a Related-Skills note in `pipeline-gpu-kernel` — bare-metal has zero cudaGraph usage today | Ignore FSDP/comm-overlap/parallelism (datacenter-only) |
| — | DOCA (60), Jetson (33), gpu-compute-lib (14) | **Skip.** Hardware-gated or library-first paths bare-metal rejects; cuBLAS/cuDNN referenced as comparison ceiling only | Record DOCA+Jetson as intentionally out-of-scope so a coverage audit doesn't flag ~93 skills |
