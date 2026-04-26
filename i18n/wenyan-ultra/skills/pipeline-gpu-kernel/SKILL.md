---
name: pipeline-gpu-kernel
locale: wenyan-ultra
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

# 管核

雙緩→載算疊也。轉序載-同-算-同 K-環為前-環-後三段，按算/載比擇 LDG 暫存或 cp.async (LDGSTS)，驗共存於占崖下，視 SASS 證疊。

## 用

- `analyze-kernel-bottleneck` 識為憶束、低算/載比→用
- 束交不掩 DRAM 遲（GA104 約 300 週期）→用
- 核有序載-同-算-同 K-環可重構→用
- 算/載比高（>20:1）且 ≥8 束活→不需

## 入

- **必**：CUDA 核源（`.cu`）含 K-環、載算分段
- **必**：標 GPU 架（如 GA104 / sm_86，定共存崖與占限）
- **必**：當前塊大小（BM、BN、BK）、型（FP16、FP32、INT8）
- **可**：每塊算/載比（自 `analyze-kernel-bottleneck`，未給則估）
- **可**：基準（未管時於標問題大小之效）

## 行

### 一：驗前提

確核含 K-環、載算分以 `__syncthreads()` 隔。算雙共存，驗於架占崖下。

1. 尋 K-環。當有此序：自全域載 A、B 塊入共存、`__syncthreads()`、於共存塊算（HMMA/IMMA/FFMA）、`__syncthreads()`。
2. 記單緩共存大小：`smem_a_size = BM * BK * sizeof(T)`、`smem_b_size = BK * BN * sizeof(T)`。
3. 算雙緩本：`smem_doubled = smem_a_size * 2 + smem_b_size * 2`。
4. 對架崖。GA104 (sm_86)：每 SM 100 KB 共存頂、崖於每塊 50 KB（過 50 KB = 每 SM 1 塊 = 4 束、占減半）。

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. 驗環次：`num_tiles = K / BK`。管需 `num_tiles >= 2`（至少前一+主環一）。

得：共存表示單雙緩本，雙配於崖下、每 SM ≥2 塊。

敗：雙緩過崖→減塊（半 BK 或 BM）至 `smem_doubled <= 50 KB`（GA104）。或用純暫存預取（LDG 變）不雙共存——預取於暫存，`__syncthreads()` 後寫同單緩。

### 二：擇變

按每塊算/載比擇 LDG 暫存或 cp.async (LDGSTS)。

1. 算比：`ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))`（GEMM 類核：每乘加 2 FLOP，每塊載字節）。
2. 施判則：

**LDG 暫存變**（比 ≥5 或 CUDA <11.0）：
- LDG N+1 塊入暫存（非阻全域載）。
- 算於 `buf[N % 2]`（與在飛 LDG 疊）。
- `__syncthreads()`、STS 暫存入 `buf[(N+1) % 2]`、`__syncthreads()`。
- 簡也，無管 API 依。
- 增暫存壓：每束約 `(BM * BK + BK * BN) / BLOCK_SIZE` 暫存。

**cp.async (LDGSTS) 變**（比 <5、CUDA ≥11.0）：
- `__pipeline_memcpy_async` N+1 塊直入 `buf[(N+1) % 2]`（異步、繞暫存檔）。
- `__pipeline_commit()` 於算前。
- 算於 `buf[N % 2]`。
- `__pipeline_wait_prior(0)` + `__syncthreads()` 於算後。
- 疊優、預取無暫存壓。需 `#include <cuda_pipeline.h>`。

3. 判限（GA104 IGEMM 4096x4096x4096 測）：
   - 比 <5:1——宜 cp.async（IGEMM 測 +35%）。
   - 比 5-20:1——皆建、測擇。
   - 比 >20:1——管恐無益（束交足）。

得：擇變、據算/載比與標架。

敗：比模糊（5-20:1）→皆建、測。CUDA 支則 cp.async 為穩擇。

### 三：重構 K-環

化序載-同-算-同環為管前-環-後構。

1. **識三段**：原環體分三：
   - **前**：載塊 0 入 `buf[0]`、同、入主環。
   - **主環**：塊 1 至 `num_tiles - 1`、疊載 N+1 與算 N。
   - **後**：算末塊（末主環次已載）。

2. **LDG 暫存變構**：

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

3. **cp.async 變構**：

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

4. 驗環次：主環行 `num_tiles - 1` 次（塊 0 至 `num_tiles - 2` 算、塊 1 至 `num_tiles - 1` 載）。後算末次所載塊。

得：重構源碼，前、主環、後段明於擇變。

敗：常誤為緩索差一或忘後算。驗：前載入 `buf[0]`、首主環次算 `buf[0]` 載入 `buf[1]`、次次算 `buf[1]` 載入 `buf[0]`、餘類推。後算 `buf[(num_tiles - 1) & 1]`。

### 四：實雙緩

宣雙緩共存、實載函。

1. 易單緩共存宣為雙緩陣：

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. cp.async 變、用管 API 實異載函：

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

3. LDG 變、實暫存暫陣與儲函：

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

4. 留 `__launch_bounds__(BLOCK_SIZE)` 於核以授譯器準占信息。
5. 譯：`nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`。

得：可譯之核、雙緩共存與擇載機。cubin 成而無誤。

敗：管 API 譯敗→確 `#include <cuda_pipeline.h>` 在、CUDA ≥11.0。暫存溢出（察 `nvcc --resource-usage`）→增 BLOCK_SIZE 或減 BK 以縮暫存陣。

### 五：驗確

行管核對 CPU 參、確數同。

1. 譯基準：`nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`。
2. 先小問題（512x512x512）以捉索誤、後擴。
3. 施型對之容差：
   - INT8 Tensor Core (IMMA)：`abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA)：`abs=1e-2, rel=1e-2`
   - FP32 純 (FFMA)：`abs=1e-3, rel=1e-3`
4. 管不變算——只重序載。確敗→誤在緩索、非算邏。
5. 試於標問題（如 4096x4096x4096）以驗邊。

得：小、標問題皆 PASS，誤界同未管基準。

敗：緩索差最常因。驗：算讀 `buf[tile & 1]`、載寫 `buf[1 - (tile & 1)]`。確後處 `(num_tiles - 1) & 1`、非 `num_tiles & 1`。cp.async：驗 `__pipeline_wait_prior(0)` 完於 `__syncthreads()` 前——否則算讀半寫資料。

### 六：基測比

於標問題量管核對未管基準。

1. 行未管基準、記 GFLOPS 或帶寬（按核型）。
2. 行各管變、記同度。
3. 算速比：`speedup = pipelined_metric / baseline_metric`。
4. 按算/載比預期之得（GA104 測）：
   - 低比（<5:1）：cp.async +15-35%（IGEMM 測：LDG +18%、cp.async +35% 於 4096x4096x4096）。
   - 中比（5-20:1）：+5-15%。
   - 高比（>20:1）：0-5% 或退步。
5. 若皆建、擇速者用之。

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

得：效比表示進。擇變當示測速、合算/載比預。

敗：效退→察三：(1) SASS 有未期指令過載（多 BAR.SYNC、暫存溢）。(2) 共存未過占崖——`nvcc --resource-usage` 或 `cuobjdump -res-usage` 驗。(3) 問題大小生足塊（`K / BK >= 4`）以攤前後過載。

### 七：驗 SASS 疊

察譯 SASS、確全域載與 Tensor Core 指令於主環體疊。

1. 反譯：`cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`。
2. 主環體、驗此序：
   - `LDGSTS` 或 `LDG` 於 `HMMA` 或 `IMMA` **前**。
   - 載與算間無 `BAR.SYNC`（須束調度可疊）。
   - `BAR.SYNC` 於算後、閘下次用所載資料。
3. 察 HMMA/IMMA 滯碼——HMMA S08（管延）期之必然。IMMA S01-S04 常。LDG/LDGSTS 滯當低（S01）、束調度可於載飛換算。
4. 數每環次 HMMA/IMMA 指令——當合未管版（管不變算量）。

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

得：SASS 注釋示載-前-算式、無中閘。零暫存溢。

敗：譯器重序載於算後（破疊）→試：(1) `#pragma unroll 1` 於主環防展開過。(2) 分載算為獨函以授序提示。(3) `asm volatile("" ::: "memory")` 為譯器界於載算間（末計——恐抑他優）。

## 驗

- [ ] 雙緩共存於架崖下（GA104：每塊 50 KB）
- [ ] 二緩交用（`buf[tile & 1]` 式）
- [ ] 前載塊 0 入 `buf[0]`
- [ ] 後算末塊自 `buf[(num_tiles - 1) & 1]`
- [ ] 對 CPU 參、小、標皆 PASS
- [ ] SASS 證載算疊（LDGSTS/LDG 與 IMMA/HMMA 間無 `BAR.SYNC`）
- [ ] 效進於未管基準
- [ ] LDG 變無暫存溢（察 `nvcc --resource-usage`）

## 忌

- **雙緩過共存崖**——GA104 崖為每塊 50 KB、非 64 KB。必先算 `smem_doubled`。28 KB 單緩之核倍為 56 KB、過崖、占減半。可使 +20% 管得轉 -50% 占退。
- **忘後算**——末主環次所載末塊需自身算於環外。無之、末 BK 列默落、生誤果似小數誤非顯敗。
- **緩索差一**——當前算用 `buf[tile & 1]`、下載用 `buf[1 - (tile & 1)]`。常誤用 `buf[(tile + 1) & 1]` 為下緩、緩數 2 時等 `buf[1 - (tile & 1)]`、誤入算索則讀錯。
- **cp.async commit/wait 序**——`__pipeline_commit()` 必呼於算 BEFORE（封異拷批）。`__pipeline_wait_prior(0)` 必呼於算 AFTER（阻至所封拷完）。互換則異拷變同、疊益盡失。
- **缺 __syncthreads**——LDG 變、算與 STS 排間需 `__syncthreads()`（算讀畢當前緩、後覆寫）。STS 排後另需 `__syncthreads()`（諸束寫畢、後次讀）。cp.async 變、`__pipeline_wait_prior(0)` 後 `__syncthreads()` 確諸束見完拷。
- **cp.async 邊處**——`__pipeline_memcpy_async` 需源址有效對齊。陣邊 `K` 非 `BK` 倍、末塊恐越界。退用純載含界檢於末塊、或補入陣至 BK 倍。

## 參

- `analyze-kernel-bottleneck` — 識核為憶束乎、算驅變擇之算/載比
