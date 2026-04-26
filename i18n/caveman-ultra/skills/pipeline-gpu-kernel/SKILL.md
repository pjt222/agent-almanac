---
name: pipeline-gpu-kernel
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Software pipelining (double-buffer) on tiled GPU kernel → overlap global mem
  loads w/ Tensor Core compute. Covers prologue/loop/epilogue restructure,
  LDG-reg vs cp.async (LDGSTS) variant pick by compute/load ratio, smem budget
  vs arch occupancy cliff, SASS-level overlap verify.
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

Double-buffer tiled GPU kernel → tile N+1 global load overlaps tile N Tensor Core compute. Sequential load-sync-compute-sync K-loop → prologue/loop/epilogue. Pick LDG-reg vs cp.async (LDGSTS) by compute/load ratio. Verify smem under arch cliff. Confirm overlap in SASS.

## Use When

- `analyze-kernel-bottleneck` flags mem-bound kernel, low compute/load per tile
- Warp interleave alone can't hide DRAM latency (~300 cyc GA104)
- Sequential load-sync-compute-sync K-loop → restructurable
- Skip → ratio >20:1 + 8+ warps active

## In

- **Required**: CUDA kernel `.cu` w/ tiled K-loop, separate load + compute phases
- **Required**: GPU arch (e.g., GA104 / sm_86 → smem cliff + occupancy)
- **Required**: Tile sizes (BM, BN, BK) + dtype (FP16, FP32, INT8)
- **Optional**: Compute/load ratio per tile (from `analyze-kernel-bottleneck`)
- **Optional**: Baseline (non-pipelined perf at target size)

## Do

### Step 1: Verify Preconditions

K-loop has load + compute phases split by `__syncthreads()`. Calc doubled smem cost vs arch cliff.

1. Locate K-loop. Structure: load A+B tiles global→smem, `__syncthreads()`, compute (HMMA/IMMA/FFMA) on smem tiles, `__syncthreads()`.
2. Single-buffer smem: `smem_a_size = BM * BK * sizeof(T)`, `smem_b_size = BK * BN * sizeof(T)`.
3. Double-buffer cost: `smem_doubled = smem_a_size * 2 + smem_b_size * 2`.
4. Vs arch cliff. GA104 (sm_86): 100 KB max smem/SM, cliff 50 KB/block (>50 KB = 1 block/SM = 4 warps, 2x occupancy collapse).

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. Loop count: `num_tiles = K / BK`. Pipelining needs `num_tiles >= 2`.

→ Smem budget table: single + double cost, doubled under cliff, ≥2 blocks/SM.

If err: doubled > cliff → halve BK or BM until `smem_doubled <= 50 KB` GA104. Or use reg-only prefetch (LDG variant), no smem doubling — stage in regs, write same single buffer after `__syncthreads()`.

### Step 2: Choose Variant

LDG-reg vs cp.async (LDGSTS) by compute/load ratio per tile.

1. Ratio: `ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))` (GEMM-like: 2 FLOPs/MAD, bytes/tile).
2. Decide:

**LDG-register** (ratio >= 5 or CUDA < 11.0):
- LDG tile N+1 → regs (non-blocking global loads).
- Compute on `buf[N % 2]` (overlaps outstanding LDGs).
- `__syncthreads()`, STS regs → `buf[(N+1) % 2]`, `__syncthreads()`.
- Simpler, no pipeline API dep.
- Reg pressure: ~`(BM * BK + BK * BN) / BLOCK_SIZE` regs/thread for staging.

**cp.async (LDGSTS)** (ratio < 5, CUDA >= 11.0):
- `__pipeline_memcpy_async` tile N+1 → `buf[(N+1) % 2]` (async, bypass reg file).
- `__pipeline_commit()` before compute.
- Compute on `buf[N % 2]`.
- `__pipeline_wait_prior(0)` + `__syncthreads()` after compute.
- Better overlap, zero reg pressure for prefetch. Needs `#include <cuda_pipeline.h>`.

3. Thresholds (GA104 IGEMM 4096x4096x4096):
   - <5:1 → cp.async (+35% on IGEMM).
   - 5-20:1 → impl both, bench.
   - >20:1 → likely no gain (warp interleave enough).

→ Variant + justification (ratio + arch).

If err: ambiguous (5-20:1) → impl both, bench. cp.async = safer default if CUDA supports.

### Step 3: Restructure K-Loop

Sequential load-sync-compute-sync → prologue/loop/epilogue.

1. **Three sections**:
   - **Prologue**: load tile 0 → `buf[0]`, sync, enter loop.
   - **Main loop**: tiles 1 to `num_tiles - 1`, overlap load N+1 w/ compute N.
   - **Epilogue**: compute last tile (loaded by final main iter).

2. **LDG-register**:

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

3. **cp.async**:

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

4. Loop count: main loop runs `num_tiles - 1` iters. Epilogue computes tile from last iter.

→ Restructured K-loop w/ clear prologue, loop, epilogue.

If err: most common bug → off-by-one buf index or skipped epilogue. Verify: prologue → `buf[0]`, first iter compute `buf[0]` + load `buf[1]`, second compute `buf[1]` + load `buf[0]`, etc. Epilogue → `buf[(num_tiles - 1) & 1]`.

### Step 4: Implement Double-Buffer

Declare double-buffered smem + load fns.

1. Single → double:

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. cp.async load fn (pipeline API):

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

3. LDG variant: reg staging arrays + store fns:

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

4. Keep `__launch_bounds__(BLOCK_SIZE)` → accurate occupancy info to compiler.
5. Compile: `nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`.

→ Compilable kernel, double-buffered smem, chosen load mech. Cubin gen no errors.

If err: pipeline API fail → `#include <cuda_pipeline.h>` + CUDA >= 11.0. Reg spills (`nvcc --resource-usage`) → shrink reg staging via larger BLOCK_SIZE or smaller BK.

### Step 5: Verify Correctness

Pipelined kernel vs CPU ref → identical numerical out.

1. Compile bench: `nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`.
2. Small problem first (512x512x512) → catch index bugs before scale.
3. Tolerance per dtype:
   - INT8 Tensor Core (IMMA): `abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA): `abs=1e-2, rel=1e-2`
   - FP32 scalar (FFMA): `abs=1e-3, rel=1e-3`
4. Pipelining doesn't change arithmetic — reorders loads. Fail → bug in buf index, not compute.
5. Test target size (e.g., 4096x4096x4096) → verify boundary handling.

→ PASS at small + target sizes, error bounds = non-pipelined baseline.

If err: buf index bug = top suspect. Verify: compute reads `buf[tile & 1]`, loads write `buf[1 - (tile & 1)]`. Epilogue uses `(num_tiles - 1) & 1`, not `num_tiles & 1`. cp.async → `__pipeline_wait_prior(0)` before `__syncthreads()`, else compute reads partial.

### Step 6: Benchmark + Compare

Pipelined vs non-pipelined baseline at target size.

1. Run baseline → record GFLOPS or bandwidth.
2. Run each pipelined variant → same metric.
3. Speedup: `speedup = pipelined_metric / baseline_metric`.
4. Expected gains by ratio (GA104):
   - Low (<5:1): +15-35% from cp.async (IGEMM: LDG +18%, cp.async +35% at 4096x4096x4096).
   - Med (5-20:1): +5-15%.
   - High (>20:1): 0-5% or regress.
5. Both impl → pick faster for prod.

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

→ Perf table showing improvement. Chosen variant → measurable speedup matching ratio prediction.

If err: regress → check 3: (1) SASS for unexpected overhead (extra BAR.SYNC, reg spills). (2) Smem didn't cross cliff — `nvcc --resource-usage` or `cuobjdump -res-usage`. (3) Enough tiles (`K / BK >= 4`) → amortize prologue/epilogue.

### Step 7: Verify SASS Overlap

Inspect SASS → global loads + Tensor Core overlap in main loop.

1. Disassemble: `cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`.
2. Main loop pattern:
   - `LDGSTS` or `LDG` **before** `HMMA` or `IMMA`.
   - No `BAR.SYNC` between loads + compute (must overlap in warp scheduler).
   - `BAR.SYNC` **after** compute → gates next iter's use of loaded data.
3. Stall codes on HMMA/IMMA: S08 HMMA pipeline delay = expected. S01-S04 IMMA = normal. LDG/LDGSTS stalls low (S01) → scheduler switches to compute while loads in flight.
4. Count HMMA/IMMA per iter → should match non-pipelined (pipelining ≠ compute volume change).

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

→ SASS shows load-before-compute, no intervening barriers. Zero reg spills.

If err: compiler reordered loads after compute (overlap defeated) → (1) `#pragma unroll 1` on main loop → no over-aggressive unroll. (2) Split load + compute into distinct inline fns → sequencing hint. (3) `asm volatile("" ::: "memory")` as compiler fence (last resort, may inhibit other opts).

## Check

- [ ] Double-buffer smem under arch cliff (GA104: 50 KB/block)
- [ ] Both buffers alternate (`buf[tile & 1]`)
- [ ] Prologue → tile 0 in `buf[0]`
- [ ] Epilogue → compute `buf[(num_tiles - 1) & 1]`
- [ ] Correctness PASS vs CPU ref at small + target
- [ ] SASS confirms overlap (no `BAR.SYNC` between LDGSTS/LDG + IMMA/HMMA)
- [ ] Perf > non-pipelined baseline
- [ ] No reg spill (LDG variant) — check `nvcc --resource-usage`

## Traps

- **Cross smem cliff via doubling** — GA104 cliff 50 KB/block, not 64. Always calc `smem_doubled` before impl. 28 KB single → 56 KB doubled crosses cliff, halves occupancy. +20% pipelining gain → -50% occupancy regress.
- **Skip epilogue compute** — Last tile loaded in final iter needs own compute outside loop. Without → last BK cols of K silently dropped → incorrect results, may look like small numerical noise not obvious fail.
- **Buf index off-by-one** — Use `buf[tile & 1]` for compute, `buf[1 - (tile & 1)]` for next load. Common err: `buf[(tile + 1) & 1]` for next = same as `buf[1 - (tile & 1)]` only when 2 buffers — wrong if applied to compute index.
- **cp.async commit/wait order** — `__pipeline_commit()` BEFORE compute (seals async batch). `__pipeline_wait_prior(0)` AFTER compute (blocks until copies done). Swap → async becomes synchronous, kills overlap.
- **Missing __syncthreads** — LDG variant: `__syncthreads()` between compute + STS drain (compute finishes reading current buf before overwrite). Another after STS drain (all threads done writing before next iter reads). cp.async: `__syncthreads()` after `__pipeline_wait_prior(0)` → all threads see completed copies.
- **Boundary in cp.async** — `__pipeline_memcpy_async` needs valid + aligned src. Matrix edges where K not multiple of BK → last tile reads OOB. Fall back to scalar loads w/ bounds check for final, or pad inputs to BK multiple.

## →

- `analyze-kernel-bottleneck` — identify mem-bound, calc compute/load ratio for variant pick
