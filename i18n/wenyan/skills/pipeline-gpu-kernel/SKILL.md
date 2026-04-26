---
name: pipeline-gpu-kernel
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  施軟體流水（雙緩衝）於分塊 GPU 核，使全域記憶體之載入與 Tensor Core 之算覆於一時。
  含序章/環/尾章之重構、依算載比擇 LDG 寄存器或 cp.async (LDGSTS) 之變體、
  對架構占用懸崖驗共享記憶體之預算、及於 SASS 層驗載算之覆。
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

# 流水 GPU 核

施軟體流水（雙緩衝）於分塊 GPU 核，使第 N+1 塊之全域記憶體載入與第 N 塊之 Tensor Core 算覆於一時。化序之載-同步-算-同步 K 環為序章/環/尾章之構，依算載比擇 LDG 寄存器或 cp.async (LDGSTS) 之變體，驗共享記憶體不逾架構占用懸崖，終於 SASS 確載算之覆。

## 用時

- `analyze-kernel-bottleneck` 識為記憶體受限之核、每塊算載比低乃用
- 唯倚 warp 交錯不足以掩 DRAM 延遲（GA104 約 300 週期）乃用
- 核含序之載-同步-算-同步 K 環、可重構乃用
- 算載比高（>20:1）且 8+ warp 活者，不需

## 入

- **必要**：CUDA 核源文件（`.cu`），含分塊 K 環，載與算分立
- **必要**：目標 GPU 架構（如 GA104 / sm_86 — 定 smem 懸崖與占用上限）
- **必要**：當前塊大小（BM, BN, BK）及數據型（FP16, FP32, INT8）
- **可選**：每塊算載比（自 `analyze-kernel-bottleneck`；闕則估之）
- **可選**：基準（目標問題大小下未流水之效）

## 法

### 第一步：驗前提

確認核含分塊 K 環、載與算二相隔以 `__syncthreads()`。算雙倍共享記憶體之費，驗其不逾架構占用懸崖。

1. 於核中尋 K 環。其當有此序之構：自全域載 A B 二塊入共享記憶體、`__syncthreads()`、於共享記憶體塊上算（HMMA/IMMA/FFMA）、`__syncthreads()`。
2. 記單緩衝共享記憶體之大小：`smem_a_size = BM * BK * sizeof(T)` 及 `smem_b_size = BK * BN * sizeof(T)`。
3. 算雙緩衝之費：`smem_doubled = smem_a_size * 2 + smem_b_size * 2`。
4. 對架構懸崖比之。GA104 (sm_86)：每 SM 最大 100 KB smem，懸崖在每塊 50 KB（逾 50 KB = 每 SM 1 塊 = 4 warp，占用減半）。

```
單緩衝：smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
雙緩衝：smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB 懸崖 -> 每 SM 2 塊 -> 8 warp
```

5. 驗環迭次：`num_tiles = K / BK`。流水需 `num_tiles >= 2`（至少一序章 + 一主環迭）。

得：共享記憶體預算之表，列單緩衝與雙緩衝之費，確認雙倍配置不逾架構懸崖、每 SM 至少 2 塊占用。

敗則：若雙緩衝逾懸崖，減塊大小（BK 或 BM 減半）至 `smem_doubled <= 50 KB`（GA104）。或用唯寄存器之預取（LDG 變體）不雙倍共享記憶體——預取數據存於寄存器，於 `__syncthreads()` 後寫入同一單緩衝。

### 第二步：擇變體

依每塊算載比於 LDG 寄存器與 cp.async (LDGSTS) 間擇之。

1. 算算載比：GEMM 類核之 `ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))`（每乘加 2 FLOP，每塊載入字節）。
2. 用此規則：

**LDG 寄存器變體**（ratio >= 5 或 CUDA < 11.0）：
- LDG 第 N+1 塊入寄存器（非阻塞之全域載入）。
- 於 `buf[N % 2]` 算（與飛行中之 LDG 覆）。
- `__syncthreads()`，後 STS 寄存器入 `buf[(N+1) % 2]`，`__syncthreads()`。
- 實作較簡，無流水 API 之依。
- 增寄存器壓力：每線程約 `(BM * BK + BK * BN) / BLOCK_SIZE` 寄存器供暫存。

**cp.async (LDGSTS) 變體**（ratio < 5，CUDA >= 11.0）：
- `__pipeline_memcpy_async` 第 N+1 塊直入 `buf[(N+1) % 2]`（異步，繞寄存器檔）。
- 算前 `__pipeline_commit()`。
- 於 `buf[N % 2]` 算。
- 算後 `__pipeline_wait_prior(0)` + `__syncthreads()`。
- 覆更佳，預取無寄存器壓力。需 `#include <cuda_pipeline.h>`。

3. 決閾（測於 GA104，IGEMM 4096x4096x4096）：
   - 比 < 5:1 — 取 cp.async（IGEMM 測得 +35%）。
   - 比 5-20:1 — 二者皆實作而基準擇之。
   - 比 > 20:1 — 流水未必有益（warp 交錯已足）。

得：所擇變體並依算載比與目標架構之說明。

敗則：若比模糊（5-20:1 之間），二變體皆實作而基準。CUDA 版本支持時，cp.async 為較穩之預設。

### 第三步：重構 K 環

化序之載-同步-算-同步環為流水之序章/環/尾章構。

1. **識三段**：原環體化為三段：
   - **序章**：載第 0 塊入 `buf[0]`，同步，後入主環。
   - **主環**：第 1 塊至 `num_tiles - 1` 塊，使第 N+1 塊之載入與第 N 塊之算覆。
   - **尾章**：算最後一塊（已於主環末迭載入）。

2. **LDG 寄存器變體之構**：

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

3. **cp.async 變體之構**：

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

4. 驗環次：主環行 `num_tiles - 1` 迭（指算之第 0 至 `num_tiles - 2` 塊，載入第 1 至 `num_tiles - 1` 塊）。尾章算末迭所載之塊。

得：所擇變體之重構 K 環源碼，序章、主環、尾章三段分明。

敗則：最常見之誤為緩衝索引差一或忘尾章算。驗：序章載入 `buf[0]`，主環首迭算 `buf[0]` 而載入 `buf[1]`，次迭算 `buf[1]` 而載入 `buf[0]`，餘類推。尾章算 `buf[(num_tiles - 1) & 1]`。

### 第四步：實作雙緩衝

聲明雙緩衝共享記憶體並實作載入函數。

1. 易單緩衝共享記憶體聲明為雙緩衝陣列：

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. cp.async 變體者，以流水 API 實作異步載入函數：

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

3. LDG 變體者，實作寄存器暫存陣列與儲存函數：

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

4. 留 `__launch_bounds__(BLOCK_SIZE)` 於核，俾編譯器得占用之確息。
5. 編譯：`nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`。

得：可編譯之核，含雙緩衝共享記憶體與所擇載入機制。cubin 順生而無誤。

敗則：若編譯敗於流水 API，確 `#include <cuda_pipeline.h>` 在、CUDA toolkit >= 11.0。若寄存器溢（察 `nvcc --resource-usage`），減寄存器暫存陣列之大小，或增 BLOCK_SIZE 或減 BK。

### 第五步：驗正確

行流水核對 CPU 參考，確數值輸出相同。

1. 編基準：`nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`。
2. 先以小問題（512x512x512）行之，捕索引之誤而後擴。
3. 依數據型用合宜之容差：
   - INT8 Tensor Core (IMMA)：`abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA)：`abs=1e-2, rel=1e-2`
   - FP32 標量 (FFMA)：`abs=1e-3, rel=1e-3`
4. 流水不變算術——唯重序載入。若正確敗，誤在緩衝索引、非算邏輯。
5. 於目標問題大小（如 4096x4096x4096）測之，驗邊界處理。

得：小與目標二大小皆 PASS，誤差界與未流水基準相同。

敗則：緩衝索引誤為最可能之因。驗：算讀自 `buf[tile & 1]`，載寫至 `buf[1 - (tile & 1)]`。察尾章處理之緩衝索引為 `(num_tiles - 1) & 1`、非 `num_tiles & 1`。cp.async 者，驗 `__pipeline_wait_prior(0)` 於 `__syncthreads()` 前畢——否則算或讀部分寫之數據。

### 第六步：基準與比

於目標問題大小，量流水核對未流水基準。

1. 行未流水基準，記 GFLOPS 或頻寬（依核型）。
2. 行各流水變體，記同指標。
3. 算加速：`speedup = pipelined_metric / baseline_metric`。
4. 依算載比之預期所得（測於 GA104）：
   - 低比（<5:1）：cp.async +15-35%（IGEMM 測：LDG +18%，cp.async +35% 於 4096x4096x4096）。
   - 中比（5-20:1）：+5-15%。
   - 高比（>20:1）：0-5% 或退步。
5. 若二變體皆實作，擇其速者用於生產。

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

得：效能比較表示提升。所擇變體當顯可量加速，與算載比之預測相合。

敗則：若效退，察三事：(1) SASS 有未料之指令額外開銷（額外 BAR.SYNC、寄存器溢）。(2) 共享記憶體未越占用懸崖——以 `nvcc --resource-usage` 或 `cuobjdump -res-usage` 驗。(3) 問題大小生足塊（`K / BK >= 4`）以攤序章/尾章之開銷。

### 第七步：驗 SASS 之覆

察編譯之 SASS，確全域載入與 Tensor Core 指令於主環體內覆。

1. 反組譯：`cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`。
2. 於主環體內，驗此序之模式：
   - `LDGSTS` 或 `LDG` 指令現於 `HMMA` 或 `IMMA` 指令**之前**。
   - 載入指令與算指令間無 `BAR.SYNC`（必使其於 warp 排程器中得覆）。
   - `BAR.SYNC` 現於算塊**之後**，閘下迭對所載數據之用。
3. 察 HMMA/IMMA 指令之停滯碼——HMMA 流水延遲之 S08 為預期不可避。IMMA 之 S01-S04 為常。LDG/LDGSTS 之停滯當低（S01），warp 排程器於載飛行中得切至算。
4. 計每環迭之 HMMA/IMMA 指令總數——當與未流水版相符（流水不當改算量）。

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

得：注釋 SASS 摘錄示載先算後之模式，無中介屏障。零寄存器溢。

敗則：若編譯器將載入重序於算後（破覆），試：(1) 主環上 `#pragma unroll 1` 防過激展開。(2) 將載與算分至獨立行內函數以為序之提示。(3) 用 `asm volatile("" ::: "memory")` 為載算塊間之編譯器籬笆（末手段——或抑他優化）。

## 驗

- [ ] 雙緩衝 smem 不逾架構懸崖（GA104：每塊 50 KB）
- [ ] 二緩衝交替而用（`buf[tile & 1]` 模式）
- [ ] 序章載第 0 塊入 `buf[0]`
- [ ] 尾章算末塊自 `buf[(num_tiles - 1) & 1]`
- [ ] 對 CPU 參考於小與目標大小皆 PASS
- [ ] SASS 確載算之覆（LDGSTS/LDG 與 IMMA/HMMA 間無 `BAR.SYNC`）
- [ ] 效優於未流水基準
- [ ] LDG 變體無寄存器溢（察 `nvcc --resource-usage`）

## 陷

- **倍緩衝越 smem 懸崖** — GA104 懸崖在每塊 50 KB、非 64 KB。實作前必算 `smem_doubled`。單緩衝用 28 KB 之核，雙倍後跳至 56 KB 越懸崖、占用減半。流水之 +20% 益可化為 -50% 之占用退。
- **忘尾章算** — 主環末迭所載之末塊，環外需自身之算相。闕之，K 維末 BK 列默墮，致誤而似小數值差、非顯敗。
- **緩衝索引差一** — 算用 `buf[tile & 1]`，載用 `buf[1 - (tile & 1)]`。常誤為以 `buf[(tile + 1) & 1]` 為下一緩衝，緩衝數為 2 時等同 `buf[1 - (tile & 1)]`——然若誤施於算索引則讀錯。
- **cp.async 提交/等待之序** — `__pipeline_commit()` 必於算相**前**呼之（封異步副本之批）。`__pipeline_wait_prior(0)` 必於算相**後**呼之（阻至所提之副本皆畢）。互換之，異步副本變同步，盡失覆益。
- **缺 __syncthreads** — LDG 變體者，算與 STS 排空間需 `__syncthreads()`（俾算先讀畢當前緩衝再被覆）。STS 排空後另需 `__syncthreads()`（俾諸線程寫畢，下迭再讀）。cp.async 變體者，`__pipeline_wait_prior(0)` 後之 `__syncthreads()` 確諸線程見畢之異步副本。
- **cp.async 之邊界處理** — `__pipeline_memcpy_async` 需源址有效且對齊。矩陣邊處 `K` 不為 `BK` 之倍時，末塊或越界讀。對末塊回退用標量載入並界檢，或將輸入矩陣補至 BK 之倍。

## 參

- `analyze-kernel-bottleneck` — 識核是否為記憶體受限，並算驅變體擇之算載比
