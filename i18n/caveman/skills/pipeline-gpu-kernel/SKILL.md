---
name: pipeline-gpu-kernel
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Apply software pipelining (double-buffering) to a tiled GPU kernel to overlap
  global memory loads with Tensor Core computation. Covers prologue/loop/epilogue
  restructuring, LDG-register vs cp.async (LDGSTS) variant selection based on
  compute/load ratio, shared memory budget verification against architecture-specific
  occupancy cliffs, and SASS-level verification of load/compute overlap.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gpu-optimization
  complexity: advanced
  language: CUDA
  tags: gpu, software-pipelining, double-buffer, cp-async, ldgsts, tensor-core, smem, occupancy
---

# Pipeline GPU Kernel

Apply software pipelining (double-buffer) to tiled GPU kernel. Global loads for tile N+1 overlap Tensor Core compute on tile N. Convert sequential load-sync-compute-sync K-loop into prologue/loop/epilogue. Pick LDG-register or cp.async (LDGSTS) by compute/load ratio. Verify shared mem stays below occupancy cliff. Confirm overlap in SASS.

## When Use

- `analyze-kernel-bottleneck` flagged memory-bound kernel, low compute/load ratio per tile
- Warp interleave alone won't hide DRAM latency (~300 cycles on GA104)
- Kernel has sequential load-sync-compute-sync K-loop, can restructure
- Skip when compute/load ratio high (>20:1) and 8+ warps active

## Inputs

- **Required**: CUDA kernel source (`.cu`) with tiled K-loop, separate load and compute phases
- **Required**: Target GPU arch (e.g. GA104 / sm_86 — sets smem cliff and occupancy)
- **Required**: Current tile sizes (BM, BN, BK) and dtype (FP16, FP32, INT8)
- **Optional**: Compute/load ratio per tile (from `analyze-kernel-bottleneck`; estimate if missing)
- **Optional**: Benchmark baseline (non-pipelined perf at target size)

## Steps

### Step 1: Verify Preconditions

Confirm tiled K-loop has distinct load and compute phases split by `__syncthreads()`. Compute doubled smem cost. Verify under architecture cliff.

1. Find K-loop in kernel. Must follow: load A and B tiles global → shared, `__syncthreads()`, compute (HMMA/IMMA/FFMA) on shared tiles, `__syncthreads()`.
2. Record single-buffer smem sizes: `smem_a_size = BM * BK * sizeof(T)` and `smem_b_size = BK * BN * sizeof(T)`.
3. Compute double-buffer cost: `smem_doubled = smem_a_size * 2 + smem_b_size * 2`.
4. Compare to architecture cliff. GA104 (sm_86): 100 KB max smem/SM, cliff at 50 KB/block (above 50 KB → 1 block/SM = 4 warps, 2x occupancy collapse).

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. Verify loop count: `num_tiles = K / BK`. Pipelining needs `num_tiles >= 2` (one prologue + one main iteration min).

**Got:** Smem budget table — single-buffer and double-buffer costs. Doubled allocation under architecture cliff. At least 2 blocks/SM occupancy.

**If fail:** Doubled smem above cliff? Shrink tile (halve BK or BM) until `smem_doubled <= 50 KB` for GA104. Or use register-only prefetch (LDG variant) — no double smem, stage in registers, write same single buffer after `__syncthreads()`.

### Step 2: Pick Variant

Choose LDG-register or cp.async (LDGSTS) by compute/load ratio per tile.

1. Compute ratio: `ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))` for GEMM-like kernels (2 FLOPs per multiply-add, bytes loaded per tile).
2. Apply rule:

**LDG-register variant** (ratio >= 5 or CUDA < 11.0):
- LDG tile N+1 to registers (non-blocking global loads).
- Compute on `buf[N % 2]` (overlaps outstanding LDGs).
- `__syncthreads()`, then STS registers to `buf[(N+1) % 2]`, `__syncthreads()`.
- Simpler. No pipeline API dependency.
- Adds register pressure: ~`(BM * BK + BK * BN) / BLOCK_SIZE` registers per thread for staging.

**cp.async (LDGSTS) variant** (ratio < 5, CUDA >= 11.0):
- `__pipeline_memcpy_async` tile N+1 directly to `buf[(N+1) % 2]` (async, bypass register file).
- `__pipeline_commit()` before compute.
- Compute on `buf[N % 2]`.
- `__pipeline_wait_prior(0)` + `__syncthreads()` after compute.
- Better overlap, zero register pressure for prefetch. Needs `#include <cuda_pipeline.h>`.

3. Decision thresholds (measured GA104, IGEMM 4096x4096x4096):
   - Ratio < 5:1 — pick cp.async (+35% measured on IGEMM).
   - Ratio 5-20:1 — implement both, benchmark.
   - Ratio > 20:1 — pipelining likely won't help (warp interleave enough).

**Got:** Picked variant with reason — based on compute/load ratio and target arch.

**If fail:** Ratio ambiguous (5-20:1)? Implement both, benchmark. cp.async safer default when CUDA version supports.

### Step 3: Restructure K-Loop

Convert sequential load-sync-compute-sync loop into pipelined prologue/loop/epilogue.

1. **Identify three sections**: Original loop body splits into three:
   - **Prologue**: Load tile 0 to `buf[0]`, sync, enter main loop.
   - **Main loop**: For tiles 1 through `num_tiles - 1`, overlap loading tile N+1 with computing tile N.
   - **Epilogue**: Compute last tile (already loaded by final main iteration).

2. **LDG-register variant structure**:

```c
// === LDG-register variant ===
// Prologue: load tile 0 into buf[0]
cooperative_load_tile(smem_a[0], smem_b[0], global_a, global_b, /*k_offset=*/0);
__syncthreads();

for (int tile = 0; tile < num_tiles - 1; tile++) {
    int cur_buf = tile & 1;
    int next_buf = 1 - cur_buf;

    // Phase 1: LDG next tile into registers (non-blocking)
    float reg_a[ELEMS_PER_THREAD_A], reg_b[ELEMS_PER_THREAD_B];
    prefetch_tile_to_registers(reg_a, reg_b, global_a, global_b,
                               (tile + 1) * BK);

    // Phase 2: Compute on current buffer (overlaps with LDG flight)
    tensor_core_mma(smem_a[cur_buf], smem_b[cur_buf], acc);

    // Phase 3: Drain registers into next buffer
    __syncthreads();
    store_registers_to_smem(smem_a[next_buf], smem_b[next_buf],
                            reg_a, reg_b);
    __syncthreads();
}

// Epilogue: compute last tile
tensor_core_mma(smem_a[(num_tiles - 1) & 1], smem_b[(num_tiles - 1) & 1], acc);
```

3. **cp.async variant structure**:

```c
// === cp.async variant ===
#include <cuda_pipeline.h>

// Prologue: async load tile 0 into buf[0]
cpasync_load_tile(smem_a[0], smem_b[0], global_a, global_b, /*k_offset=*/0);
__pipeline_commit();
__pipeline_wait_prior(0);
__syncthreads();

for (int tile = 0; tile < num_tiles - 1; tile++) {
    int cur_buf = tile & 1;
    int next_buf = 1 - cur_buf;

    // Phase 1: cp.async next tile into next buffer (async, direct to smem)
    cpasync_load_tile(smem_a[next_buf], smem_b[next_buf],
                      global_a, global_b, (tile + 1) * BK);
    __pipeline_commit();

    // Phase 2: Compute on current buffer (overlaps with LDGSTS in flight)
    tensor_core_mma(smem_a[cur_buf], smem_b[cur_buf], acc);

    // Phase 3: Wait for async copies to complete
    __pipeline_wait_prior(0);
    __syncthreads();
}

// Epilogue: compute last tile
tensor_core_mma(smem_a[(num_tiles - 1) & 1], smem_b[(num_tiles - 1) & 1], acc);
```

4. Verify loop count: main loop runs `num_tiles - 1` iterations (tiles 0 through `num_tiles - 2` indexing compute, loading tiles 1 through `num_tiles - 1`). Epilogue computes tile loaded last iteration.

**Got:** Restructured K-loop source with clear prologue, main loop, epilogue for picked variant.

**If fail:** Most common bug: off-by-one in buffer indexing or forget epilogue compute pass. Verify: prologue loads `buf[0]`, first main iteration computes `buf[0]` and loads `buf[1]`, second iteration computes `buf[1]` and loads `buf[0]`. Epilogue computes `buf[(num_tiles - 1) & 1]`.

### Step 4: Implement Double-Buffer

Declare double-buffered smem. Implement load functions.

1. Replace single-buffer smem decls with double-buffered arrays:

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. For cp.async variant, implement async load with pipeline API:

```c
__device__ void cpasync_load_tile(half* dst_a, half* dst_b,
                                  const half* src_a, const half* src_b,
                                  int k_offset) {
    // Each thread copies its portion (16 bytes = 8 half values per cp.async)
    int tid = threadIdx.x;
    int bytes_per_thread = 16;  // cp.async.cg supports 4, 8, or 16 bytes

    // A tile: BM * BK elements, distributed across BLOCK_SIZE threads
    int elems_a = BM * BK / BLOCK_SIZE;
    for (int i = 0; i < elems_a; i += 8) {
        int idx = tid * elems_a + i;
        __pipeline_memcpy_async(dst_a + idx,
                                src_a + k_offset * BM + idx,
                                bytes_per_thread);
    }

    // B tile: BK * BN elements, distributed similarly
    int elems_b = BK * BN / BLOCK_SIZE;
    for (int i = 0; i < elems_b; i += 8) {
        int idx = tid * elems_b + i;
        __pipeline_memcpy_async(dst_b + idx,
                                src_b + k_offset * BN + idx,
                                bytes_per_thread);
    }
}
```

3. For LDG variant, implement register staging arrays and store functions:

```c
// Declare register staging (size = elements per thread)
half reg_a[BM * BK / BLOCK_SIZE];
half reg_b[BK * BN / BLOCK_SIZE];

// Prefetch: LDG from global to registers (non-blocking, issued early)
for (int i = 0; i < BM * BK / BLOCK_SIZE; i++) {
    int idx = threadIdx.x * (BM * BK / BLOCK_SIZE) + i;
    reg_a[i] = global_a[k_offset * BM + idx];
}
// ... similarly for reg_b

// Store: STS from registers to shared memory (after __syncthreads)
for (int i = 0; i < BM * BK / BLOCK_SIZE; i++) {
    int idx = threadIdx.x * (BM * BK / BLOCK_SIZE) + i;
    smem_a[next_buf][idx] = reg_a[i];
}
```

4. Keep `__launch_bounds__(BLOCK_SIZE)` on kernel — gives compiler accurate occupancy info.
5. Compile: `nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`.

**Got:** Compilable kernel with double-buffered smem and picked load mechanism. Cubin builds, no errors.

**If fail:** Compile fails on pipeline API? Verify `#include <cuda_pipeline.h>` present, CUDA toolkit >= 11.0. Register spills (check `nvcc --resource-usage`)? Shrink register staging array sizes — bigger BLOCK_SIZE or smaller BK.

### Step 5: Verify Correctness

Run pipelined kernel against CPU reference. Confirm same numerical output.

1. Compile bench: `nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`.
2. Run small first (512x512x512). Catch indexing bugs before scaling.
3. Apply tolerance for dtype:
   - INT8 Tensor Core (IMMA): `abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA): `abs=1e-2, rel=1e-2`
   - FP32 scalar (FFMA): `abs=1e-3, rel=1e-3`
4. Pipelining doesn't change arithmetic — only reorders loads. Correctness fails? Bug in buffer indexing, not compute logic.
5. Test at target size (e.g. 4096x4096x4096) — verify boundary handling.

**Got:** PASS at small and target sizes with same error bounds as non-pipelined baseline.

**If fail:** Buffer indexing bug most likely. Verify: compute reads `buf[tile & 1]`, loads write `buf[1 - (tile & 1)]`. Epilogue uses `(num_tiles - 1) & 1`, not `num_tiles & 1`. For cp.async: `__pipeline_wait_prior(0)` must finish before `__syncthreads()` — else compute reads partial data.

### Step 6: Benchmark and Compare

Measure pipelined vs non-pipelined baseline at target size.

1. Run non-pipelined baseline. Record GFLOPS or bandwidth (depends on kernel type).
2. Run each pipelined variant. Record same metric.
3. Compute speedup: `speedup = pipelined_metric / baseline_metric`.
4. Expected gains by compute/load ratio (measured on GA104):
   - Low ratio (<5:1): +15-35% from cp.async (IGEMM measured: LDG +18%, cp.async +35% at 4096x4096x4096).
   - Medium ratio (5-20:1): +5-15%.
   - High ratio (>20:1): 0-5% or regression.
5. Implemented both? Pick faster for production.

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

**Got:** Perf comparison table showing improvement. Picked variant shows measurable speedup matching compute/load ratio prediction.

**If fail:** Perf regresses? Check three things: (1) SASS for unexpected instruction overhead (extra BAR.SYNC, register spills). (2) Smem stayed below occupancy cliff — verify with `nvcc --resource-usage` or `cuobjdump -res-usage`. (3) Problem size produces enough tiles (`K / BK >= 4`) to amortize prologue/epilogue overhead.

### Step 7: Verify SASS Overlap

Inspect compiled SASS. Confirm global loads and Tensor Core instructions overlap in main loop body.

1. Disassemble: `cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`.
2. In main loop body, verify ordering:
   - `LDGSTS` or `LDG` instructions appear **before** `HMMA` or `IMMA`.
   - No `BAR.SYNC` between load and compute (must overlap freely in warp scheduler).
   - `BAR.SYNC` appears **after** compute block — gates next iteration's use of loaded data.
3. Check stall codes on HMMA/IMMA — S08 for HMMA pipeline delay expected, unavoidable. S01-S04 for IMMA normal. Stalls on LDG/LDGSTS should be low (S01) — warp scheduler can switch to compute while loads in flight.
4. Count total HMMA/IMMA per loop iteration — must match non-pipelined version (pipelining doesn't change compute volume).

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

**Got:** Annotated SASS showing load-before-compute pattern. No intervening barriers. Zero register spills.

**If fail:** Compiler reordered loads after compute (defeats overlap)? Try: (1) `#pragma unroll 1` on main loop — prevents over-aggressive unroll. (2) Split load and compute into distinct inline functions — sequencing hint. (3) Use `asm volatile("" ::: "memory")` as compiler fence between load and compute (last resort — may inhibit other opts).

## Checks

- [ ] Double-buffer smem under architecture cliff (GA104: 50 KB/block)
- [ ] Both buffers used alternately (`buf[tile & 1]` pattern)
- [ ] Prologue loads tile 0 into `buf[0]`
- [ ] Epilogue computes last tile from `buf[(num_tiles - 1) & 1]`
- [ ] Correctness PASS vs CPU reference at small and target sizes
- [ ] SASS confirms load/compute overlap (no `BAR.SYNC` between LDGSTS/LDG and IMMA/HMMA)
- [ ] Perf improved over non-pipelined baseline
- [ ] No register spill from LDG variant (check `nvcc --resource-usage`)

## Pitfalls

- **Cross smem cliff by doubling buffers** — GA104 cliff is 50 KB/block, not 64 KB. Always compute `smem_doubled` before implementing. Kernel using 28 KB single-buffered jumps to 56 KB doubled, crosses cliff, halves occupancy. Turns +20% pipelining gain into -50% occupancy regression.
- **Forget epilogue compute pass** — Last tile loaded in final main iteration needs own compute phase outside loop. Without it, last BK columns of K dimension silently dropped — wrong results may look like small numerical errors, not obvious failures.
- **Buffer indexing off-by-one** — Use `buf[tile & 1]` for current compute buffer, `buf[1 - (tile & 1)]` for next load buffer. Common mistake: `buf[(tile + 1) & 1]` for next buffer — equivalent to `buf[1 - (tile & 1)]` only when buffer count is 2 — but reads wrong if accidentally applied to compute index.
- **cp.async commit/wait order** — `__pipeline_commit()` BEFORE compute (seals batch of async copies). `__pipeline_wait_prior(0)` AFTER compute (blocks until committed copies complete). Swap them → async copies become synchronous → all overlap benefit gone.
- **Missing __syncthreads** — In LDG variant, need `__syncthreads()` between compute and STS drain (compute finishes reading current buffer before overwrite). Another `__syncthreads()` after STS drain (all threads finish writing before next iteration reads). In cp.async variant, `__syncthreads()` after `__pipeline_wait_prior(0)` ensures all threads see completed async copies.
- **Boundary handling in cp.async** — `__pipeline_memcpy_async` needs source address valid and aligned. At matrix edges where `K` not multiple of `BK`, last tile may read out of bounds. Fall back to scalar loads with bounds checking for final tile, or pad input matrices to multiple of BK.

## See Also

- `analyze-kernel-bottleneck` — identify if kernel is memory-bound. Compute the compute/load ratio that drives variant selection.
