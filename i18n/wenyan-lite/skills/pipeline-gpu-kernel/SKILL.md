---
name: pipeline-gpu-kernel
locale: wenyan-lite
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

# GPU 核函式管線化

對分塊 GPU 核函式施以軟體管線化（雙緩衝），令 N+1 塊之全域記憶體載入與第 N 塊之 Tensor Core 運算重疊。將「載入—同步—運算—同步」之循序 K 迴圈重構為前奏／主迴圈／尾聲三段；依運算／載入比擇 LDG 暫存器或 cp.async（LDGSTS）變體；驗證共享記憶體未越過架構之佔用斷崖；最終於 SASS 中確認載入與運算之重疊。

## 適用時機

- `analyze-kernel-bottleneck` 判定核函式為記憶體瓶頸，且每塊運算／載入比偏低時
- 僅以 warp 交錯不足以隱藏 DRAM 延遲時（GA104 約 300 週期）
- 核函式具可重構之循序「載入—同步—運算—同步」K 迴圈時
- 運算／載入比甚高（>20:1）且活躍 warp 達 8 個以上時，無此必要

## 輸入

- **必要**：含分塊 K 迴圈、且載入與運算階段分明之 CUDA 核函式原始碼（`.cu`）
- **必要**：目標 GPU 架構（如 GA104 / sm_86，決定 smem 斷崖與佔用上限）
- **必要**：當前分塊大小（BM、BN、BK）與資料型別（FP16、FP32、INT8）
- **選擇性**：每塊運算／載入比（取自 `analyze-kernel-bottleneck`；未提供則估算）
- **選擇性**：基準效能（目標規模下未管線化之效能）

## 步驟

### 步驟一：驗證前置條件

確認核函式具分塊 K 迴圈，載入與運算階段以 `__syncthreads()` 區隔。計算雙倍共享記憶體成本，並驗證仍低於架構之佔用斷崖。

1. 於核函式中定位 K 迴圈。其結構必為：自全域載入 A 與 B 塊至共享記憶體、`__syncthreads()`、於共享記憶體塊上執行運算（HMMA/IMMA/FFMA）、`__syncthreads()`。
2. 記錄單緩衝共享記憶體大小：`smem_a_size = BM * BK * sizeof(T)` 與 `smem_b_size = BK * BN * sizeof(T)`。
3. 計算雙緩衝成本：`smem_doubled = smem_a_size * 2 + smem_b_size * 2`。
4. 與架構斷崖相較。GA104（sm_86）：每 SM 上限 100 KB smem，斷崖位於 50 KB/block（超過 50 KB 即每 SM 僅 1 block，4 warps，佔用率減半）。

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. 驗證迴圈次數：`num_tiles = K / BK`。管線化要求 `num_tiles >= 2`（至少一前奏加一主迴圈迭代）。

**預期：** 一份共享記憶體預算表，列出單緩衝與雙緩衝成本，確認雙倍配置仍低於斷崖且每 SM 至少 2 blocks 佔用率。

**失敗時：** 若雙緩衝越過斷崖，縮減塊大小（將 BK 或 BM 折半）直至 GA104 之 `smem_doubled <= 50 KB`。或改用僅暫存器之預取（LDG 變體），不雙倍共享記憶體——將預取資料置於暫存器，於 `__syncthreads()` 後再寫入同一單緩衝。

### 步驟二：擇定變體

依每塊運算／載入比，於 LDG 暫存器與 cp.async（LDGSTS）之間擇一。

1. 計算運算／載入比：對類 GEMM 核函式，`ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))`（每次乘加 2 FLOPs；分母為每塊載入位元組數）。
2. 適用判則：

**LDG 暫存器變體**（ratio >= 5 或 CUDA < 11.0）：
- 將 N+1 塊以 LDG 載入暫存器（非阻塞之全域載入）。
- 於 `buf[N % 2]` 上運算（與飛行中之 LDG 重疊）。
- `__syncthreads()`，再以 STS 將暫存器寫入 `buf[(N+1) % 2]`，`__syncthreads()`。
- 實作較簡，無需仰賴管線 API。
- 增加暫存器壓力：每執行緒約 `(BM * BK + BK * BN) / BLOCK_SIZE` 個暫存器作中繼。

**cp.async（LDGSTS）變體**（ratio < 5，CUDA >= 11.0）：
- 以 `__pipeline_memcpy_async` 將 N+1 塊直接非同步搬至 `buf[(N+1) % 2]`（繞過暫存器檔案）。
- 運算前呼叫 `__pipeline_commit()`。
- 於 `buf[N % 2]` 上運算。
- 運算後呼叫 `__pipeline_wait_prior(0)` 與 `__syncthreads()`。
- 重疊更佳，預取無暫存器壓力。需 `#include <cuda_pipeline.h>`。

3. 判定門檻（GA104、IGEMM、4096x4096x4096 實測）：
   - Ratio < 5:1：偏好 cp.async（IGEMM 實測 +35%）。
   - Ratio 5-20:1：兩者皆實作並基準測試以決。
   - Ratio > 20:1：管線化恐無益（warp 交錯已足）。

**預期：** 已擇定變體，並依運算／載入比與目標架構提出佐證。

**失敗時：** 若比值落於模糊區間（5-20:1），兩者皆實作並基準測試。CUDA 版本支援時，cp.async 為較穩妥之預設。

### 步驟三：重構 K 迴圈

將循序「載入—同步—運算—同步」之迴圈，重構為管線化之前奏／主迴圈／尾聲結構。

1. **辨識三段**：原迴圈體分為三部分：
   - **前奏**：將第 0 塊載入 `buf[0]`、同步，再進入主迴圈。
   - **主迴圈**：對第 1 至第 `num_tiles - 1` 塊，令 N+1 塊之載入與第 N 塊之運算重疊。
   - **尾聲**：運算最後一塊（已於主迴圈最末次迭代中載入）。

2. **LDG 暫存器變體結構**：

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

3. **cp.async 變體結構**：

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

4. 驗證迴圈次數：主迴圈執行 `num_tiles - 1` 次（以索引 0 至 `num_tiles - 2` 表示運算之塊，同時載入第 1 至第 `num_tiles - 1` 塊）。尾聲運算最末次迭代所載入之塊。

**預期：** 重構後之 K 迴圈原始碼，依擇定變體清楚劃分前奏、主迴圈與尾聲。

**失敗時：** 最常見之錯為緩衝索引差一或遺漏尾聲運算。驗證：前奏載入 `buf[0]`；主迴圈第一次運算 `buf[0]` 並載入 `buf[1]`；第二次運算 `buf[1]` 並載入 `buf[0]`，依此類推。尾聲運算 `buf[(num_tiles - 1) & 1]`。

### 步驟四：實作雙緩衝

宣告雙緩衝共享記憶體並實作載入函式。

1. 將單緩衝共享記憶體宣告替換為雙緩衝陣列：

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. cp.async 變體下，以管線 API 實作非同步載入函式：

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

3. LDG 變體下，實作暫存器中繼陣列與寫回函式：

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

4. 保留 `__launch_bounds__(BLOCK_SIZE)` 於核函式上，使編譯器獲得準確之佔用資訊。
5. 編譯：`nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`。

**預期：** 可編譯之核函式，含雙緩衝共享記憶體與所擇之載入機制。cubin 生成成功，無錯誤。

**失敗時：** 若管線 API 編譯失敗，確認已 `#include <cuda_pipeline.h>` 且 CUDA toolkit >= 11.0。若出現暫存器溢出（以 `nvcc --resource-usage` 檢查），增大 BLOCK_SIZE 或縮減 BK，以縮小暫存器中繼陣列。

### 步驟五：驗證正確性

將管線化核函式與 CPU 參考結果相對照，確認數值輸出一致。

1. 編譯基準程式：`nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`。
2. 先以小規模（512x512x512）執行，俾於放大前捕捉索引錯誤。
3. 依資料型別套用適當容差：
   - INT8 Tensor Core（IMMA）：`abs=0.5, rel=0.1`
   - FP16 Tensor Core（HMMA）：`abs=1e-2, rel=1e-2`
   - FP32 純量（FFMA）：`abs=1e-3, rel=1e-3`
4. 管線化不改變算術——僅重排載入。若正確性失敗，錯在緩衝索引，非運算邏輯。
5. 於目標規模（如 4096x4096x4096）測試以驗邊界處理。

**預期：** 於小規模與目標規模皆 PASS，誤差界限與未管線化基準一致。

**失敗時：** 緩衝索引錯為最常見之因。驗證：運算自 `buf[tile & 1]` 讀取，載入則寫至 `buf[1 - (tile & 1)]`。檢查尾聲處理之緩衝索引為 `(num_tiles - 1) & 1`，非 `num_tiles & 1`。cp.async 下，驗證 `__pipeline_wait_prior(0)` 於 `__syncthreads()` 前完成——否則運算可能讀取尚未完成寫入之資料。

### 步驟六：基準測試與比較

於目標規模量測管線化核函式相對於未管線化基準之效能。

1. 執行未管線化基準，記錄 GFLOPS 或頻寬（依核函式而定）。
2. 執行各管線化變體，記錄相同指標。
3. 計算加速比：`speedup = pipelined_metric / baseline_metric`。
4. 依運算／載入比之預期增益（GA104 實測）：
   - 低比值（<5:1）：cp.async +15-35%（IGEMM 實測：4096x4096x4096 下 LDG +18%、cp.async +35%）。
   - 中比值（5-20:1）：+5-15%。
   - 高比值（>20:1）：0-5% 或反退化。
5. 若兩變體皆已實作，擇較快者用於正式版。

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

**預期：** 顯示改善之效能對照表。所擇之變體應呈現與運算／載入比預測相符之可量測加速。

**失敗時：** 若效能反退，檢查三事：(1) SASS 是否出現非預期之指令開銷（多餘 BAR.SYNC、暫存器溢出）。(2) 共享記憶體未越過佔用斷崖——以 `nvcc --resource-usage` 或 `cuobjdump -res-usage` 驗證。(3) 問題規模是否生成足夠塊數（`K / BK >= 4`），俾管線化能攤銷前奏／尾聲開銷。

### 步驟七：驗證 SASS 重疊

檢視已編譯之 SASS，確認主迴圈體內全域載入與 Tensor Core 指令確有重疊。

1. 反組譯：`cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`。
2. 於主迴圈體中驗證下列順序：
   - `LDGSTS` 或 `LDG` 指令出現於 `HMMA` 或 `IMMA` 之**前**。
   - 載入指令與運算指令之間無 `BAR.SYNC`（兩者須能於 warp 排程器內自由重疊）。
   - `BAR.SYNC` 出現於運算區塊**之後**，以閘控下次迭代對載入資料之使用。
3. 檢視 HMMA/IMMA 指令之 stall 代碼——HMMA 出現 S08 管線延遲屬預期且不可避；IMMA 出現 S01-S04 屬常見。LDG/LDGSTS 之 stall 應低（S01），蓋 warp 排程器可於載入飛行中切至運算。
4. 計每次主迴圈迭代之 HMMA/IMMA 指令總數——應與未管線化版本相同（管線化不應改變運算量）。

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

**預期：** 標註後之 SASS 摘錄，顯示「載入先於運算」且無中介障礙之模式。零暫存器溢出。

**失敗時：** 若編譯器將載入重排至運算之後（破壞重疊），可嘗試：(1) 於主迴圈加 `#pragma unroll 1`，避免過度展開。(2) 將載入與運算分至獨立之 inline 函式，作為排序提示。(3) 以 `asm volatile("" ::: "memory")` 作為載入與運算間之編譯器圍籬（最後手段——可能抑制其他最佳化）。

## 驗證

- [ ] 雙緩衝 smem 仍低於架構斷崖（GA104：50 KB/block）
- [ ] 兩緩衝交替使用（`buf[tile & 1]` 模式）
- [ ] 前奏將第 0 塊載入 `buf[0]`
- [ ] 尾聲自 `buf[(num_tiles - 1) & 1]` 運算最末塊
- [ ] 於小規模與目標規模對 CPU 參考皆 PASS
- [ ] SASS 確認載入與運算重疊（LDGSTS/LDG 與 IMMA/HMMA 之間無 `BAR.SYNC`）
- [ ] 效能優於未管線化基準
- [ ] LDG 變體無暫存器溢出（以 `nvcc --resource-usage` 檢查）

## 常見陷阱

- **雙倍緩衝越過 smem 斷崖** —— GA104 斷崖為 50 KB/block，非 64 KB。實作前務必先計算 `smem_doubled`。一核函式若單緩衝用 28 KB，雙倍即跳至 56 KB，越過斷崖、佔用率減半。可將 +20% 之管線化增益反轉為 -50% 之佔用退化。
- **遺漏尾聲運算** —— 主迴圈最末次迭代所載入之塊，需於迴圈外另行運算。若無此步，K 維最末 BK 行將靜默遭棄，導致結果錯誤——表現為小幅數值誤差，而非顯著失敗。
- **緩衝索引差一** —— 當前運算用 `buf[tile & 1]`，下次載入用 `buf[1 - (tile & 1)]`。常見錯為以 `buf[(tile + 1) & 1]` 表下一緩衝；於緩衝數為 2 時雖等價於 `buf[1 - (tile & 1)]`，然若誤用於運算索引則讀取錯誤。
- **cp.async 之 commit/wait 順序** —— `__pipeline_commit()` 須於運算前呼叫（封存該批非同步搬移）；`__pipeline_wait_prior(0)` 須於運算後呼叫（阻塞至所提交搬移完成）。兩者顛倒則非同步搬移退化為同步，盡失重疊之利。
- **缺少 __syncthreads** —— LDG 變體中，運算與 STS 寫回之間需一 `__syncthreads()`（俾運算讀完當前緩衝再被覆寫）；STS 寫回之後再需一 `__syncthreads()`（俾全執行緒完成寫入再進入下次迭代）。cp.async 變體中，`__pipeline_wait_prior(0)` 後之 `__syncthreads()` 確保全執行緒見到已完成之非同步搬移。
- **cp.async 之邊界處理** —— `__pipeline_memcpy_async` 要求來源位址有效且對齊。當矩陣邊緣 `K` 非 `BK` 倍數時，最末塊可能讀越界。對最末塊回退至帶邊界檢查之純量載入，或將輸入矩陣補齊至 BK 之倍數。

## 相關技能

- `analyze-kernel-bottleneck` —— 判定核函式是否為記憶體瓶頸，並計算驅動變體擇定之運算／載入比
