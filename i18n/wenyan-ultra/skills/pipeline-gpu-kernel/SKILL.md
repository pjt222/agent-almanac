---
name: pipeline-gpu-kernel
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Apply software pipelining (double-buffering) to a tiled GPU kernel so that global memory loads for tile N+1 overlap with Tensor Core computation on tile N. Transform a sequential load-sync-compute-sync K-loop into a prologue/loop/epilogue structure, choose between LDG-register and cp.async (LDGSTS) variants based on compute/load ratio, verify shared memory stays under the architecture occupancy cliff, and confirm load/compute overlap in the final SASS.

## When to Use

- When `analyze-kernel-bottleneck` identifies a memory-bound kernel with low compute/load ratio per tile
- When warp interleaving alone cannot hide DRAM latency (~300 cycles on GA104)
- When the kernel has a sequential load-sync-compute-sync K-loop that can be restructured
- Not needed when compute/load ratio is high (>20:1) and 8+ warps are active

## Inputs

- **Required**: CUDA kernel source file (`.cu`) with a tiled K-loop containing separate load and compute phases
- **Required**: Target GPU architecture (e.g., GA104 / sm_86 — determines smem cliff and occupancy limits)
- **Required**: Current tile sizes (BM, BN, BK) and data type (FP16, FP32, INT8)
- **Optional**: Compute/load ratio per tile (from `analyze-kernel-bottleneck`; will be estimated if not provided)
- **Optional**: Benchmark baseline (non-pipelined performance at target problem size)

## Procedure

### Step 1: Verify Preconditions

Confirm the kernel has a tiled K-loop with distinct load and compute phases separated by `__syncthreads()`. Calculate the doubled shared memory cost and verify it stays under the architecture occupancy cliff.

1. Locate the K-loop in the kernel. It must have this sequential structure: load A and B tiles from global to shared memory, `__syncthreads()`, compute (HMMA/IMMA/FFMA) on the shared memory tiles, `__syncthreads()`.
2. Record the single-buffer shared memory sizes: `smem_a_size = BM * BK * sizeof(T)` and `smem_b_size = BK * BN * sizeof(T)`.
3. Calculate the double-buffer cost: `smem_doubled = smem_a_size * 2 + smem_b_size * 2`.
4. Compare against the architecture cliff. GA104 (sm_86): 100 KB max smem/SM, cliff at 50 KB/block (above 50 KB = 1 block/SM = 4 warps, 2x occupancy collapse).

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. Verify the loop iteration count: `num_tiles = K / BK`. Pipelining requires `num_tiles >= 2` (at least one prologue + one main loop iteration).

**Expected:** A shared memory budget table showing single-buffer and double-buffer costs, confirming the doubled allocation stays under the architecture cliff with at least 2 blocks/SM occupancy.

**On failure:** If double-buffer exceeds the cliff, reduce tile size (halve BK or BM) until `smem_doubled <= 50 KB` for GA104. Alternatively, use register-only prefetch (LDG variant) without doubling shared memory — store prefetched data in registers and write to the same single buffer after `__syncthreads()`.

### Step 2: Choose Variant

Select between LDG-register and cp.async (LDGSTS) based on the compute/load ratio per tile.

1. Calculate the compute/load ratio: `ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))` for GEMM-like kernels (2 FLOPs per multiply-add, bytes loaded per tile).
2. Apply the decision rule:

**LDG-register variant** (ratio >= 5 or CUDA < 11.0):
- LDG tile N+1 into registers (non-blocking global loads).
- Compute on `buf[N % 2]` (overlaps with outstanding LDGs).
- `__syncthreads()`, then STS registers into `buf[(N+1) % 2]`, `__syncthreads()`.
- Simpler implementation, no pipeline API dependency.
- Adds register pressure: ~`(BM * BK + BK * BN) / BLOCK_SIZE` registers per thread for staging.

**cp.async (LDGSTS) variant** (ratio < 5, CUDA >= 11.0):
- `__pipeline_memcpy_async` tile N+1 directly to `buf[(N+1) % 2]` (async, bypasses register file).
- `__pipeline_commit()` before compute.
- Compute on `buf[N % 2]`.
- `__pipeline_wait_prior(0)` + `__syncthreads()` after compute.
- Better overlap, zero register pressure for prefetch. Requires `#include <cuda_pipeline.h>`.

3. Decision thresholds (measured on GA104 with IGEMM at 4096x4096x4096):
   - Ratio < 5:1 — prefer cp.async (+35% measured on IGEMM).
   - Ratio 5-20:1 — implement both and benchmark to decide.
   - Ratio > 20:1 — pipelining likely not beneficial (warp interleaving sufficient).

**Expected:** Selected variant with justification based on compute/load ratio and target architecture.

**On failure:** If the ratio is ambiguous (5-20:1 range), implement both variants and benchmark. The cp.async variant is the safer default when CUDA version supports it.

### Step 3: Restructure the K-Loop

Transform the sequential load-sync-compute-sync loop into a pipelined prologue/loop/epilogue structure.

1. **Identify the three sections**: The original loop body becomes three pieces:
   - **Prologue**: Load tile 0 into `buf[0]`, synchronize, then enter the main loop.
   - **Main loop**: For tiles 1 through `num_tiles - 1`, overlap loading tile N+1 with computing tile N.
   - **Epilogue**: Compute the last tile (already loaded by the final main loop iteration).

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

4. Verify the loop count: the main loop runs `num_tiles - 1` iterations (tiles 0 through `num_tiles - 2` indexing which tiles to compute, loading tiles 1 through `num_tiles - 1`). The epilogue computes the tile loaded in the last iteration.

**Expected:** Restructured K-loop source code with clear prologue, main loop, and epilogue sections for the chosen variant.

**On failure:** The most common bug is an off-by-one in buffer indexing or forgetting the epilogue compute pass. Verify: prologue loads into `buf[0]`, first main loop iteration computes `buf[0]` and loads into `buf[1]`, second iteration computes `buf[1]` and loads into `buf[0]`, and so on. The epilogue computes `buf[(num_tiles - 1) & 1]`.

### Step 4: Implement Double-Buffer

Declare the double-buffered shared memory and implement the load functions.

1. Replace single-buffer shared memory declarations with double-buffered arrays:

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. For the cp.async variant, implement the async load function using the pipeline API:

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

3. For the LDG variant, implement register staging arrays and store functions:

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

4. Keep `__launch_bounds__(BLOCK_SIZE)` on the kernel to give the compiler accurate occupancy information.
5. Compile: `nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`.

**Expected:** Compilable kernel with double-buffered shared memory and the chosen load mechanism. Successful cubin generation with no errors.

**On failure:** If compilation fails on pipeline API calls, ensure `#include <cuda_pipeline.h>` is present and CUDA toolkit is >= 11.0. If register spills occur (check `nvcc --resource-usage`), reduce the register staging array sizes by increasing BLOCK_SIZE or reducing BK.

### Step 5: Verify Correctness

Run the pipelined kernel against the CPU reference to confirm identical numerical output.

1. Compile the benchmark: `nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`.
2. Run at a small problem size first (512x512x512) to catch indexing bugs before scaling up.
3. Apply the correct tolerance for the data type:
   - INT8 Tensor Core (IMMA): `abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA): `abs=1e-2, rel=1e-2`
   - FP32 scalar (FFMA): `abs=1e-3, rel=1e-3`
4. Pipelining does not change the arithmetic — it only reorders loads. If correctness fails, the bug is in buffer indexing, not in the compute logic.
5. Test at the target problem size (e.g., 4096x4096x4096) to verify boundary handling.

**Expected:** PASS at both small and target problem sizes with error bounds identical to the non-pipelined baseline.

**On failure:** Buffer indexing bug is the most likely cause. Verify: compute reads from `buf[tile & 1]` while loads write to `buf[1 - (tile & 1)]`. Check the epilogue processes buffer index `(num_tiles - 1) & 1`, not `num_tiles & 1`. For cp.async, verify `__pipeline_wait_prior(0)` completes before `__syncthreads()` — otherwise compute may read partially-written data.

### Step 6: Benchmark and Compare

Measure the pipelined kernel against the non-pipelined baseline at the target problem size.

1. Run the non-pipelined baseline and record GFLOPS or bandwidth (depending on kernel type).
2. Run each pipelined variant and record the same metric.
3. Calculate speedup: `speedup = pipelined_metric / baseline_metric`.
4. Expected gains by compute/load ratio (measured on GA104):
   - Low ratio (<5:1): +15-35% from cp.async (IGEMM measured: LDG +18%, cp.async +35% at 4096x4096x4096).
   - Medium ratio (5-20:1): +5-15%.
   - High ratio (>20:1): 0-5% or regression.
5. If both variants were implemented, select the faster one for production use.

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

**Expected:** Performance comparison table showing improvement. The chosen variant should show measurable speedup consistent with the compute/load ratio prediction.

**On failure:** If performance regresses, check three things: (1) SASS for unexpected instruction overhead (extra BAR.SYNC, register spills). (2) Shared memory did not cross the occupancy cliff — verify with `nvcc --resource-usage` or `cuobjdump -res-usage`. (3) The problem size produces enough tiles (`K / BK >= 4`) for pipelining to amortize the prologue/epilogue overhead.

### Step 7: Verify SASS Overlap

Inspect the compiled SASS to confirm that global loads and Tensor Core instructions overlap within the main loop body.

1. Disassemble: `cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`.
2. In the main loop body, verify this ordering pattern:
   - `LDGSTS` or `LDG` instructions appear **before** `HMMA` or `IMMA` instructions.
   - No `BAR.SYNC` between the load instructions and the compute instructions (they must be free to overlap in the warp scheduler).
   - `BAR.SYNC` appears **after** the compute block, gating the next iteration's use of the loaded data.
3. Check stall codes on HMMA/IMMA instructions — S08 for HMMA pipeline delay is expected and unavoidable. S01-S04 for IMMA is normal. Stalls on LDG/LDGSTS should be low (S01) since the warp scheduler can switch to compute while loads are in flight.
4. Count total HMMA/IMMA instructions per loop iteration — this should match the non-pipelined version (pipelining should not change compute volume).

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

**Expected:** Annotated SASS excerpt showing the load-before-compute pattern with no intervening barriers. Zero register spills.

**On failure:** If the compiler reordered loads after compute (defeating the overlap), try: (1) `#pragma unroll 1` on the main loop to prevent over-aggressive unrolling. (2) Separate load and compute into distinct inline functions to create a sequencing hint. (3) Use `asm volatile("" ::: "memory")` as a compiler fence between load and compute blocks (last resort — may inhibit other optimizations).

## Validation

- [ ] Double-buffer smem stays under architecture cliff (GA104: 50 KB/block)
- [ ] Both buffers used alternately (`buf[tile & 1]` pattern)
- [ ] Prologue loads tile 0 into `buf[0]`
- [ ] Epilogue computes last tile from `buf[(num_tiles - 1) & 1]`
- [ ] Correctness PASS against CPU reference at both small and target sizes
- [ ] SASS confirms load/compute overlap (no `BAR.SYNC` between LDGSTS/LDG and IMMA/HMMA)
- [ ] Performance improved over non-pipelined baseline
- [ ] No register spill from LDG variant (check `nvcc --resource-usage`)

## Common Pitfalls

- **Crossing the smem cliff by doubling buffers** — GA104 cliff is 50 KB/block, not 64 KB. Always calculate `smem_doubled` before implementing. A kernel using 28 KB single-buffered jumps to 56 KB doubled, crossing the cliff and halving occupancy. This can turn a +20% pipelining gain into a -50% occupancy regression.
- **Forgetting the epilogue compute pass** — The last tile loaded in the final main loop iteration needs its own compute phase outside the loop. Without it, the last BK columns of the K dimension are silently dropped, producing incorrect results that may appear as small numerical errors rather than obvious failures.
- **Buffer indexing off-by-one** — Use `buf[tile & 1]` for the current compute buffer and `buf[1 - (tile & 1)]` for the next load buffer. A common mistake is using `buf[(tile + 1) & 1]` for the next buffer, which is equivalent to `buf[1 - (tile & 1)]` only when the buffer count is 2 — but reads wrong if accidentally applied to the compute index.
- **cp.async commit/wait ordering** — `__pipeline_commit()` must be called BEFORE the compute phase (it seals the batch of async copies). `__pipeline_wait_prior(0)` must be called AFTER the compute phase (it blocks until all committed copies complete). Swapping these makes the async copies synchronous, eliminating all overlap benefit.
- **Missing __syncthreads** — In the LDG variant, a `__syncthreads()` is needed between compute and the STS drain (so compute finishes reading the current buffer before it gets overwritten). Another `__syncthreads()` is needed after the STS drain (so all threads finish writing before the next iteration reads). In the cp.async variant, `__syncthreads()` after `__pipeline_wait_prior(0)` ensures all threads see the completed async copies.
- **Boundary handling in cp.async** — `__pipeline_memcpy_async` requires the source address to be valid and aligned. At matrix edges where `K` is not a multiple of `BK`, the last tile may read out of bounds. Fall back to scalar loads with bounds checking for the final tile, or pad the input matrices to a multiple of BK.

## Related Skills

- `analyze-kernel-bottleneck` — identify whether the kernel is memory-bound and calculate the compute/load ratio that drives variant selection
