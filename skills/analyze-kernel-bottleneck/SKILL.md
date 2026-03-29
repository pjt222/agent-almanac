---
name: analyze-kernel-bottleneck
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

Systematically identify whether a GPU kernel is compute-bound, memory-bound, or latency-bound by measuring baseline performance, classifying on the roofline, computing occupancy and compute/load ratio per tile, inspecting SASS instruction mix and stall codes, checking the shared memory cliff, and applying a decision matrix to select the right optimization strategy.

## When to Use

- Before optimizing any CUDA kernel -- establish baseline and classify bottleneck type
- After writing a first working version of a kernel to identify the optimization path
- When a kernel underperforms expectations relative to theoretical peak
- When deciding between cp.async, larger tiles, or algorithmic restructuring

## Inputs

- **Required**: Compiled kernel (`.cubin` or `.cu` source with build command)
- **Required**: Benchmark harness that launches the kernel with CUDA event timing
- **Required**: Problem dimensions (e.g., M, N, K for GEMM; seq_len, heads, head_dim for attention)
- **Optional**: Target GPU architecture (default: GA104 / sm_86 / RTX 3070 Ti)
- **Optional**: Expected peak utilization percentage for comparison
- **Optional**: Prior profiling data (Nsight Compute reports)

## Procedure

### Step 1: Measure Baseline Performance

Run the kernel with CUDA events (`BenchTimer`), record time in milliseconds. Calculate effective throughput metrics:

1. **Compile** the kernel if not already built:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **Run** with representative problem sizes, ensuring warmup runs precede measurement:
   ```bash
   ./bench 4096 4096 4096
   ```
3. **Record** kernel time in ms from CUDA events (not wall-clock).
4. **Calculate** effective GFLOPS and effective bandwidth:
   - GEMM: `effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - Bandwidth-limited kernels: `effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention: `effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

**Expected:** Baseline numbers: kernel time in ms, effective GFLOPS, and effective bandwidth.

**On failure:** Check that the kernel launches without error (`CHECK_CU` macro). Verify warmup runs precede measurement. Ensure problem dimensions are large enough to saturate the GPU (small problems may bottleneck on launch overhead).

### Step 2: Classify on the Roofline

Compute arithmetic intensity and compare against the machine balance point to classify the kernel:

1. **Calculate arithmetic intensity**: `AI = FLOPs / bytes_loaded_from_global_memory`. Count only unique bytes loaded from DRAM (not shared memory or register reuse).
2. **Look up machine balance point**: `balance = peak_compute / peak_bandwidth`.
3. **Classify**: If `AI < balance`, the kernel is memory-bound. If `AI > balance`, the kernel is compute-bound.

**GA104 (RTX 3070 Ti) Reference Values:**

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

4. **Compute attained fraction**: `attained = effective_throughput / peak_throughput`. If memory-bound: compare effective bandwidth to 608 GB/s. If compute-bound: compare effective GFLOPS to the relevant peak.

**Expected:** Classification as compute-bound, memory-bound, or latency-bound (low occupancy causing neither compute nor memory saturation) with numerical justification.

**On failure:** Recheck byte counting. Watch for redundant re-reads (e.g., 9x in direct conv2d without im2col). If neither compute nor memory is saturated, the kernel is likely latency-bound (see Step 3).

### Step 3: Calculate Occupancy

Determine active warps per SM from the launch configuration and resource usage:

1. **Extract resource usage**:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **From launch config**: `warps_per_block = threads_per_block / 32`.
3. **Compute blocks/SM** from each limiting factor:
   - Register limit: `floor(65536 / (registers_per_thread * threads_per_block))`
   - Smem limit: `floor(available_smem_per_SM / smem_per_block)` -- see Step 6 for cliff
   - Warp limit: `floor(48 / warps_per_block)` (GA104 max: 48 warps/SM)
   - Block limit: 16 blocks/SM max on GA104
4. **Actual blocks/SM** = `min(register_limit, smem_limit, warp_limit, block_limit)`.
5. **Active warps/SM** = `blocks_per_SM * warps_per_block`.
6. **Key threshold**: 8 warps/SM is sufficient for latency hiding on GA104. Below 8 = structural problem causing latency-bound behavior.

**Expected:** Occupancy table showing blocks/SM, active warps/SM, and the limiting factor (registers, smem, or warps).

**On failure:** Check `cuFuncSetAttribute` for dynamic shared memory. Verify `--resource-usage` reports match the actual launch configuration. If register count is unexpectedly high, try `--maxrregcount=N` to cap registers (trading register spills for occupancy).

### Step 4: Compute the Compute/Load Ratio Per Tile

Count compute instructions and load bytes per K-tile from SASS (not source code):

1. **Disassemble**:
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **Count compute instructions per tile** (the inner loop over one K-tile):
   - `grep -c 'HMMA' kernel.sass` -- FP16 Tensor Core ops
   - `grep -c 'IMMA' kernel.sass` -- INT8 Tensor Core ops
   - `grep -c 'FFMA' kernel.sass` -- FP32 fused multiply-add
3. **Count global loads per tile**:
   - `grep -c 'LDG' kernel.sass` -- global memory loads
   - Multiply by bytes per load (typically 16 bytes for LDG.128)
4. **Calculate ratio**: `compute_ops / load_ops` per tile.
5. **Classify** using the cp.async decision threshold (from gpu_reflections.md Insight 2):
   - **High** (>20:1): cp.async is net-negative; warp interleaving already hides DRAM latency. Focus on algorithmic changes. Reference: Flash Attention has 64 HMMA per tile = high ratio, cp.async measured -5%.
   - **Medium** (5-20:1): cp.async may help, benchmark both paths.
   - **Low** (<5:1): cp.async strongly beneficial; loads dominate and async copy hides latency. Reference: IGEMM has 8 IMMA per tile = low ratio, cp.async measured +35%.

**Expected:** Compute/load ratio with classification (high/medium/low) and cp.async recommendation.

**On failure:** Count from SASS disassembly, not source code -- the compiler may fuse, eliminate, or reorder instructions. Ensure you are counting instructions within the inner loop only (the K-tile iteration), not the entire kernel.

### Step 5: Inspect SASS Instructions

Examine the full SASS instruction mix and stall codes:

1. **Disassemble** (if not done in Step 4):
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **Count key instruction types**:
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
3. **Check stall codes** on critical instructions:
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **Identify optimization targets**:
   - HMMA S08 stalls: hardware minimum on Ampere, cannot be reduced. Focus elsewhere.
   - IMMA S04 stalls: compiler is conservative. CuAssembler can tighten to S02 (measured 15-20% gain).
   - FFMA S04 stalls: if independent, reducible to S01 via CuAssembler.
   - Excessive BAR.SYNC: may indicate over-synchronization between pipeline stages.

**Expected:** Instruction count table and stall code summary with identified optimization targets.

**On failure:** Ensure `cuobjdump` architecture matches the kernel compilation target (both must be sm_86). If SASS output is empty, the cubin may be corrupt -- recompile.

### Step 6: Check the Smem Cliff

Determine whether shared memory usage crosses the architecture-specific occupancy cliff:

1. **Read smem/block** from `--resource-usage` output (Step 3) or `cuobjdump --res-usage kernel.sm_86.cubin`.
2. **Compare against cliff threshold**:
   - GA104 (sm_86): 100 KB max smem/SM. Cliff at 50 KB/block.
   - Confirmed empirically: 48 KB/block -> 2 blocks/SM (good), 56 KB/block -> 1 block/SM (2x regression).
3. **If above cliff** (smem > 50 KB/block):
   - Blocks/SM drops to 1, active warps drop to warps_per_block (typically 4).
   - 2x performance regression expected from exposed DRAM stalls.
4. **Check double-buffering impact**: Double-buffering doubles smem usage. If current smem is 30 KB, double-buffered = 60 KB, which crosses the cliff. Evaluate whether the async benefit outweighs the occupancy loss.
5. **Record** smem/block, blocks/SM, and whether the cliff is crossed.

**Expected:** Smem/block value with blocks/SM count and explicit statement of whether the 50 KB cliff is crossed.

**On failure:** If above cliff and occupancy is the bottleneck, the optimization strategy must change: reduce tile size to get smem under 50 KB, or accept 1 block/SM and compensate with higher compute/load ratio per tile (more register reuse, longer K-tiles).

### Step 7: Build the Decision Matrix

Synthesize findings from Steps 2-6 into an optimization strategy:

| Condition | Strategy |
|-----------|----------|
| Memory-bound + low compute/load ratio (<5:1) + smem under cliff | Software pipelining with cp.async (LDGSTS). Overlap global loads with compute. |
| Memory-bound + high compute/load ratio (>20:1) + 8+ warps | Warp interleaving already hides latency. Focus on algorithmic changes: implicit GEMM, split-Q, im2col. |
| Compute-bound + FFMA-heavy | CuAssembler stall code tightening: S04 -> S01 on independent FFMAs. |
| Compute-bound + HMMA-heavy | S08 is hardware minimum, cannot reduce. Increase tile reuse (larger M/N tiles, longer K-loop). |
| Compute-bound + IMMA-heavy | CuAssembler: S04 -> S02 on IMMA instructions (compiler is conservative). |
| Latency-bound (low occupancy, neither saturated) | Reduce smem or registers to get more blocks/SM. Get above 8 warps/SM. |
| Smem above cliff | Reduce tile size or restructure to get smem/block under 50 KB (GA104). |

1. **Rank** applicable strategies by expected gain, using the compute/load ratio and occupancy data.
2. **Estimate gain range** for each strategy based on how far the kernel is from the relevant ceiling.
3. **Flag conflicts**: e.g., cp.async doubles smem (may cross cliff), larger tiles increase register pressure (may reduce occupancy).

**Expected:** Ranked list of recommended optimizations with predicted gain range and potential conflicts.

**On failure:** If no clear winner emerges, run micro-benchmarks isolating each strategy (e.g., test cp.async alone, test reduced tile size alone) to measure actual impact before combining.

### Step 8: Document Findings

Produce a structured bottleneck report:

1. **Baseline**: kernel time, effective GFLOPS, effective bandwidth, problem dimensions.
2. **Roofline position**: arithmetic intensity, classification, attained fraction of peak.
3. **Occupancy**: blocks/SM, active warps/SM, limiting factor.
4. **Compute/load ratio**: ratio value, classification (high/medium/low), cp.async recommendation.
5. **SASS summary**: instruction counts table, stall code findings, CuAssembler targets.
6. **Smem cliff**: smem/block, blocks/SM, cliff status.
7. **Recommendation**: ranked optimization strategies with gain estimates.

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

**Expected:** Complete markdown report consumable by a kernel-optimizer agent or human developer.

**On failure:** Re-run with different problem sizes (e.g., 1024, 2048, 4096, 8192) to confirm findings are not size-specific. Small problems may appear latency-bound when the real bottleneck at scale is memory bandwidth.

## Validation

- [ ] Baseline measured with CUDA events (not wall-clock)
- [ ] Roofline classification determined (compute/memory/latency bound)
- [ ] Occupancy computed with limiting factor identified
- [ ] Compute/load ratio per tile calculated from SASS
- [ ] SASS instruction mix and stall codes documented
- [ ] Smem cliff checked against architecture threshold
- [ ] Decision matrix applied with strategy recommendation
- [ ] Findings documented in structured report

## Common Pitfalls

- **Re-read multiplication**: Direct conv2d reads each weight 9x without im2col, inflating the byte count by 9x. Use actual unique bytes loaded from DRAM, not total load instructions, when computing arithmetic intensity.
- **Confusing FP16 Tensor Core peak with FP32 peak**: FP16 TC peak is 174 TFLOPS, FP32 FFMA peak is 21.7 TFLOPS -- an 8x difference. Using the wrong peak makes roofline classification meaningless.
- **Using 64 KB as smem cliff instead of 50 KB on GA104**: GA104 (sm_86) has 100 KB max smem/SM. The cliff is at 100/2 = 50 KB/block, not 64 KB. This is architecture-specific; other GPUs differ.
- **Ignoring warp interleaving when evaluating cp.async**: 8 warps with long compute phases (high compute/load ratio) already hide DRAM latency through warp scheduling. Adding cp.async in this regime adds smem pressure and barrier overhead for no benefit (measured -5% on Flash Attention).
- **Counting instructions from source code instead of SASS**: The compiler may fuse operations, eliminate dead code, unroll loops differently, or reorder instructions. Always count from `cuobjdump -sass` output.
- **Not running warmup iterations**: The first kernel launch includes JIT compilation overhead and cold cache effects. Always run 2-5 warmup iterations before the measured run.

## Related Skills

- `pipeline-gpu-kernel` -- implement software pipelining with cp.async when analysis identifies a memory-bound kernel with low compute/load ratio
- `simulate-cpu-architecture` -- complementary architecture analysis for CPU-side bottlenecks in host-device workflows
