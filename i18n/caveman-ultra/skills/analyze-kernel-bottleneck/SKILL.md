---
name: analyze-kernel-bottleneck
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Systematically identify whether a GPU kernel is compute-bound, memory-bound,
  or latency-bound using roofline analysis, occupancy calculations, compute/load
  ratio per tile, and SASS instruction inspection. Produces a decision matrix
  for optimization strategy selection (cp.async, warp interleaving, tiling,
  double-buffering, or CuAssembler hand-tuning).
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gpu-optimization
  complexity: advanced
  language: CUDA
  tags: gpu, roofline, occupancy, sass, tensor-core, bottleneck-analysis, compute-load-ratio
---

# Analyze Kernel Bottleneck

Identify GPU kernel = compute-bound, memory-bound, latency-bound. Baseline perf → roofline classify → occupancy + compute/load ratio/tile → SASS instr mix + stall codes → smem cliff → decision matrix → right opt strategy.

## Use When

- Pre-opt any CUDA kernel → baseline + classify
- After 1st working ver → ID opt path
- Underperforms vs theoretical peak
- Deciding cp.async vs larger tiles vs algorithmic restructure

## In

- **Required**: Compiled kernel (`.cubin` or `.cu` + build cmd)
- **Required**: Bench harness launching via CUDA event timing
- **Required**: Problem dims (M, N, K for GEMM; seq_len, heads, head_dim for attention)
- **Optional**: Target GPU arch (default: GA104 / sm_86 / RTX 3070 Ti)
- **Optional**: Expected peak util % for compare
- **Optional**: Prior profiling data (Nsight Compute)

## Do

### Step 1: Baseline Perf

Run kernel w/ CUDA events (`BenchTimer`), record ms. Calc effective throughput:

1. **Compile** if not built:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **Run** representative sizes, warmup pre-measurement:
   ```bash
   ./bench 4096 4096 4096
   ```
3. **Record** kernel ms from CUDA events (not wall-clock).
4. **Calc** effective GFLOPS + BW:
   - GEMM: `effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - BW-limited: `effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention: `effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

**→** Baseline: kernel ms, effective GFLOPS, effective BW.

**If err:** Check launches no err (`CHECK_CU`). Warmup pre-measurement. Dims large enough saturate GPU (small → launch overhead bottleneck).

### Step 2: Roofline Classify

Arithmetic intensity vs machine balance → classify:

1. **Calc AI**: `AI = FLOPs / bytes_loaded_from_global_memory`. Count only unique bytes from DRAM (not shared mem or register reuse).
2. **Lookup balance**: `balance = peak_compute / peak_bandwidth`.
3. **Classify**: `AI < balance` → memory-bound. `AI > balance` → compute-bound.

**GA104 (RTX 3070 Ti) Reference:**

| Resource | Peak | Unit |
|----------|------|------|
| FP32 FFMA | 21.7 | TFLOPS |
| FP16 Tensor Core (HMMA) | 174 | TFLOPS |
| INT8 Tensor Core (IMMA) | 696 | TOPS |
| DRAM Bandwidth | 608 | GB/s |
| L2 Cache | 4 | MB |
| SMs | 48 | |

**Derived Balance Points:**

| Precision | Balance Point (FLOP/byte) |
|-----------|--------------------------|
| FP32 FFMA | 21700 / 608 = 35.7 |
| FP16 TC | 174000 / 608 = 286.2 |
| INT8 TC | 696000 / 608 = 1144.7 |

4. **Compute attained**: `attained = effective_throughput / peak_throughput`. Memory-bound → compare effective BW to 608 GB/s. Compute-bound → compare effective GFLOPS to relevant peak.

**→** Classification: compute-bound, memory-bound, latency-bound (low occupancy → neither saturated) + numerical justification.

**If err:** Recheck byte counting. Watch redundant re-reads (e.g., 9x in direct conv2d no im2col). Neither saturated → latency-bound (Step 3).

### Step 3: Occupancy

Active warps/SM from launch config + resource usage:

1. **Extract resource usage**:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **Launch config**: `warps_per_block = threads_per_block / 32`.
3. **Blocks/SM per limiting factor**:
   - Register: `floor(65536 / (registers_per_thread * threads_per_block))`
   - Smem: `floor(available_smem_per_SM / smem_per_block)` → see Step 6 cliff
   - Warp: `floor(48 / warps_per_block)` (GA104 max: 48 warps/SM)
   - Block: 16 blocks/SM max GA104
4. **Actual blocks/SM** = `min(register_limit, smem_limit, warp_limit, block_limit)`.
5. **Active warps/SM** = `blocks_per_SM * warps_per_block`.
6. **Key threshold**: 8 warps/SM enough latency hiding GA104. <8 = structural → latency-bound.

**→** Occupancy table: blocks/SM, active warps/SM, limiting factor (registers, smem, warps).

**If err:** Check `cuFuncSetAttribute` for dynamic smem. Verify `--resource-usage` matches actual launch config. High register → `--maxrregcount=N` (trade spills for occupancy).

### Step 4: Compute/Load Ratio/Tile

Count compute instrs + load bytes/K-tile from SASS (not src):

1. **Disassemble**:
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **Count compute/tile** (inner K-tile loop):
   - `grep -c 'HMMA' kernel.sass` → FP16 TC ops
   - `grep -c 'IMMA' kernel.sass` → INT8 TC ops
   - `grep -c 'FFMA' kernel.sass` → FP32 FMA
3. **Count global loads/tile**:
   - `grep -c 'LDG' kernel.sass` → global mem loads
   - Multiply bytes/load (typically 16 bytes for LDG.128)
4. **Ratio**: `compute_ops / load_ops` per tile.
5. **Classify** (cp.async threshold, gpu_reflections.md Insight 2):
   - **High** (>20:1): cp.async net-neg; warp interleaving already hides DRAM latency. Focus algorithmic. Ref: Flash Attention 64 HMMA/tile = high, cp.async -5%.
   - **Medium** (5-20:1): cp.async may help, benchmark both paths.
   - **Low** (<5:1): cp.async strongly beneficial; loads dominate, async copy hides latency. Ref: IGEMM 8 IMMA/tile = low, cp.async +35%.

**→** Compute/load ratio + classification (high/medium/low) + cp.async rec.

**If err:** Count from SASS not src — compiler may fuse, eliminate, reorder. Inner loop only (K-tile iter) not entire kernel.

### Step 5: SASS Instr Inspect

Full SASS instr mix + stall codes:

1. **Disassemble** (if not Step 4):
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **Count instr types**:
   ```bash
   grep -c 'HMMA.16816' kernel.sass      # FP16 Tensor Core
   grep -c 'IMMA.16816' kernel.sass      # INT8 Tensor Core
   grep -c 'FFMA' kernel.sass            # FP32 fused multiply-add
   grep -c 'LDGSTS' kernel.sass          # cp.async (global->shared)
   grep -c 'LDG' kernel.sass             # Global load
   grep -c 'STS' kernel.sass             # Shared store
   grep -c 'LDS' kernel.sass             # Shared load
   grep -c 'BAR.SYNC' kernel.sass        # Barrier synchronization
   grep -c 'SHFL' kernel.sass            # Warp shuffle (reductions)
   grep -c 'MUFU' kernel.sass            # Special function unit
   ```
3. **Stall codes critical instrs**:
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **ID opt targets**:
   - HMMA S08: hardware min Ampere, no reduce. Focus elsewhere.
   - IMMA S04: compiler conservative. CuAssembler → S02 (15-20% gain).
   - FFMA S04: independent → S01 via CuAssembler.
   - Excessive BAR.SYNC: over-sync between pipeline stages.

**→** Instr count table + stall code summary + ID'd opt targets.

**If err:** `cuobjdump` arch matches kernel compile target (both sm_86). SASS out empty → cubin corrupt → recompile.

### Step 6: Smem Cliff

Smem usage crosses arch-specific occupancy cliff?

1. **Read smem/block** from `--resource-usage` (Step 3) or `cuobjdump --res-usage kernel.sm_86.cubin`.
2. **Vs cliff**:
   - GA104 (sm_86): 100 KB max smem/SM. Cliff at 50 KB/block.
   - Confirmed: 48 KB/block → 2 blocks/SM (good), 56 KB/block → 1 block/SM (2x regression).
3. **Above cliff** (smem >50 KB/block):
   - Blocks/SM drops to 1, active warps drop to warps_per_block (typically 4).
   - 2x regression from exposed DRAM stalls.
4. **Double-buffering impact**: Doubles smem. 30 KB current → 60 KB double-buf → crosses cliff. Eval async benefit vs occupancy loss.
5. **Record** smem/block, blocks/SM, cliff crossed?

**→** Smem/block + blocks/SM + explicit statement cliff crossed.

**If err:** Above cliff + occupancy bottleneck → change strategy: reduce tile → smem <50 KB, or accept 1 block/SM + compensate higher compute/load ratio (more register reuse, longer K-tiles).

### Step 7: Decision Matrix

Synthesize Steps 2-6 → opt strategy:

| Condition | Strategy |
|-----------|----------|
| Memory-bound + low compute/load (<5:1) + smem under cliff | SW pipelining cp.async (LDGSTS). Overlap global loads w/ compute. |
| Memory-bound + high compute/load (>20:1) + 8+ warps | Warp interleaving already hides. Focus algorithmic: implicit GEMM, split-Q, im2col. |
| Compute-bound + FFMA-heavy | CuAssembler stall tighten: S04 → S01 on independent FFMAs. |
| Compute-bound + HMMA-heavy | S08 hardware min, no reduce. Increase tile reuse (larger M/N, longer K-loop). |
| Compute-bound + IMMA-heavy | CuAssembler: S04 → S02 on IMMA (compiler conservative). |
| Latency-bound (low occupancy) | Reduce smem/registers → more blocks/SM. >8 warps/SM. |
| Smem above cliff | Reduce tile or restructure → smem/block <50 KB (GA104). |

1. **Rank** strategies by expected gain, via compute/load + occupancy data.
2. **Estimate gain range** per strategy, how far from relevant ceiling.
3. **Flag conflicts**: cp.async doubles smem (may cross cliff), larger tiles → register pressure (may reduce occupancy).

**→** Ranked list recommended opts + predicted gain + conflicts.

**If err:** No clear winner → micro-benchmarks isolate each (cp.async alone, reduced tile alone) → measure actual pre-combine.

### Step 8: Doc Findings

Structured bottleneck report:

1. **Baseline**: kernel ms, effective GFLOPS + BW, problem dims.
2. **Roofline**: AI, classification, attained fraction.
3. **Occupancy**: blocks/SM, active warps/SM, limiting factor.
4. **Compute/load**: ratio, classification, cp.async rec.
5. **SASS summary**: instr counts, stall findings, CuAssembler targets.
6. **Smem cliff**: smem/block, blocks/SM, status.
7. **Rec**: ranked opt strategies + gain estimates.

```markdown
## Bottleneck Analysis Report: [kernel_name]

### Baseline
- Problem: [dimensions]
- Kernel time: [X] ms
- Effective GFLOPS: [Y] | Effective BW: [Z] GB/s

### Roofline Classification
- Arithmetic intensity: [AI] FLOP/byte
- Balance point: [BP] FLOP/byte ([precision])
- Classification: **[compute|memory|latency]-bound**
- Attained fraction: [X]% of peak

### Occupancy
| Resource | Per Block | Limit/SM | Blocks/SM |
|----------|-----------|----------|-----------|
| Registers | [N]/thread | 65536 | [B] |
| Shared mem | [X] KB | 100 KB (cliff: 50 KB) | [B] |
| Warps | [W] | 48 | [B] |
| **Limiting** | | | **[min(B)]** |
- Active warps/SM: [W] ([sufficient|insufficient] for latency hiding)

### Compute/Load Ratio
- Compute ops/tile: [N] [HMMA|IMMA|FFMA]
- Load bytes/tile: [N] bytes ([N] LDG x [N] bytes)
- Ratio: [X]:1 — **[high|medium|low]**
- cp.async recommendation: [beneficial|neutral|detrimental]

### SASS Instruction Mix
| Instruction | Count | Notes |
|-------------|-------|-------|
| HMMA.16816 | [N] | Stall: S08 (hardware min) |
| IMMA.16816 | [N] | Stall: S04 (reducible to S02) |
| FFMA | [N] | Stall: S04 (reducible to S01) |
| LDG | [N] | |
| LDGSTS | [N] | cp.async |
| BAR.SYNC | [N] | |

### Smem Cliff
- Smem/block: [X] KB — [under|over] 50 KB cliff
- Blocks/SM: [B] — [no occupancy loss|occupancy halved]

### Recommended Optimizations (ranked)
1. [Strategy] — estimated [X-Y]% gain
2. [Strategy] — estimated [X-Y]% gain
3. [Strategy] — estimated [X-Y]% gain
```

**→** Complete MD report consumable by kernel-optimizer agent or dev.

**If err:** Re-run different sizes (1024, 2048, 4096, 8192) → confirm not size-specific. Small may appear latency-bound when real bottleneck at scale is BW.

## Check

- [ ] Baseline via CUDA events (not wall-clock)
- [ ] Roofline classification (compute/memory/latency bound)
- [ ] Occupancy + limiting factor
- [ ] Compute/load ratio/tile from SASS
- [ ] SASS instr mix + stall codes documented
- [ ] Smem cliff vs arch threshold
- [ ] Decision matrix + strategy rec
- [ ] Findings in structured report

## Traps

- **Re-read multiply**: Direct conv2d reads weight 9x no im2col → byte count inflated 9x. Use actual unique bytes from DRAM, not total load instrs, for AI.
- **Confuse FP16 TC peak w/ FP32**: FP16 TC peak 174 TFLOPS, FP32 FFMA 21.7 TFLOPS — 8x diff. Wrong peak → roofline meaningless.
- **Using 64 KB cliff not 50 KB GA104**: GA104 (sm_86) 100 KB max smem/SM. Cliff 100/2 = 50 KB/block, not 64 KB. Arch-specific; other GPUs differ.
- **Ignore warp interleaving when eval cp.async**: 8 warps long compute (high compute/load) already hide DRAM via warp sched. cp.async → smem pressure + barrier overhead no benefit (Flash Attention -5%).
- **Count instrs from src not SASS**: Compiler may fuse, eliminate dead, unroll differently, reorder. Always from `cuobjdump -sass`.
- **No warmup iters**: 1st launch → JIT compile overhead + cold cache. 2-5 warmup pre-measured run.

## →

- `pipeline-gpu-kernel` — impl SW pipelining cp.async when memory-bound + low compute/load
- `simulate-cpu-architecture` — complementary arch analysis CPU-side bottlenecks in host-device workflows
