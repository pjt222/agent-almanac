---
name: analyze-kernel-bottleneck
locale: wenyan-lite
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

# 析核心瓶頸

藉量基線效能、於 roofline 分類、計算每瓦片之佔用率與計算／載入比、檢查 SASS 指令組合與停滯碼、檢查共享記憶體懸崖，並施決策矩陣以擇優化策略，系統化辨 GPU 核心為計算受限、記憶體受限或延遲受限。

## 適用時機

- 優化任 CUDA 核心前——立基線並分類瓶頸類型
- 寫一首工版核心後以辨優化路徑
- 核心相對理論峰之表現低於預期時
- 於 cp.async、更大瓦片、或演算法重構之間決策時

## 輸入

- **必要**：已編譯核心（`.cubin` 或 `.cu` 源附建構命令）
- **必要**：以 CUDA event 計時啟核心之基準工具
- **必要**：問題維度（如 GEMM 之 M、N、K；attention 之 seq_len、heads、head_dim）
- **選擇性**：目標 GPU 架構（預設：GA104 / sm_86 / RTX 3070 Ti）
- **選擇性**：比對之預期峰用率
- **選擇性**：先前剖析資料（Nsight Compute 報告）

## 步驟

### 步驟一：量基線效能

以 CUDA event（`BenchTimer`）行核心，記時於毫秒。計算有效吞吐量指標：

1. **編譯**核心（若未建）：
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **行**代表性問題規模，確保暖機先於量測：
   ```bash
   ./bench 4096 4096 4096
   ```
3. **記**核心時於 ms，自 CUDA event（非牆鐘）。
4. **計**有效 GFLOPS 與有效頻寬：
   - GEMM：`effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - 頻寬限核心：`effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention：`effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

**預期：** 基線數字：核心時於 ms、有效 GFLOPS、有效頻寬。

**失敗時：** 查核心啟動而無誤（`CHECK_CU` 巨集）。驗暖機先於量測。確保問題維度夠大以飽和 GPU（小問題或於啟動開銷瓶頸）。

### 步驟二：於 roofline 上分類

計算算術強度並對機器平衡點比，以分類核心：

1. **計算算術強度**：`AI = FLOPs / bytes_loaded_from_global_memory`。僅計自 DRAM 載入之獨特位元組（非共享記憶體或暫存器重用）。
2. **查機器平衡點**：`balance = peak_compute / peak_bandwidth`。
3. **分類**：若 `AI < balance`，則記憶體受限。若 `AI > balance`，則計算受限。

**GA104 (RTX 3070 Ti) 參考值：**

| Resource | Peak | Unit |
|----------|------|------|
| FP32 FFMA | 21.7 | TFLOPS |
| FP16 Tensor Core (HMMA) | 174 | TFLOPS |
| INT8 Tensor Core (IMMA) | 696 | TOPS |
| DRAM Bandwidth | 608 | GB/s |
| L2 Cache | 4 | MB |
| SMs | 48 | |

**衍生平衡點：**

| Precision | Balance Point (FLOP/byte) |
|-----------|--------------------------|
| FP32 FFMA | 21700 / 608 = 35.7 |
| FP16 TC | 174000 / 608 = 286.2 |
| INT8 TC | 696000 / 608 = 1144.7 |

4. **計算所達分數**：`attained = effective_throughput / peak_throughput`。若記憶體受限：比有效頻寬與 608 GB/s。若計算受限：比有效 GFLOPS 與相關峰。

**預期：** 以數值理由分類為計算受限、記憶體受限或延遲受限（低佔用使計算亦未飽和、記憶體亦未飽和）。

**失敗時：** 重查位元組計數。慎防冗餘重讀（如直接 conv2d 無 im2col 致 9 倍重讀）。若計算與記憶體皆未飽和，核心恐為延遲受限（見步驟三）。

### 步驟三：計算佔用率

由啟動配置與資源使用判定每 SM 之活躍 warp：

1. **提取資源使用**：
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **由啟動配置**：`warps_per_block = threads_per_block / 32`。
3. **計算 blocks/SM**，自各限制因素：
   - 暫存器限：`floor(65536 / (registers_per_thread * threads_per_block))`
   - Smem 限：`floor(available_smem_per_SM / smem_per_block)`——懸崖見步驟六
   - Warp 限：`floor(48 / warps_per_block)`（GA104 最大：48 warps/SM）
   - Block 限：GA104 最大 16 blocks/SM
4. **實際 blocks/SM** = `min(register_limit, smem_limit, warp_limit, block_limit)`。
5. **活躍 warps/SM** = `blocks_per_SM * warps_per_block`。
6. **關鍵閾值**：8 warps/SM 於 GA104 足以隱藏延遲。低於 8 = 結構問題致延遲受限行為。

**預期：** 佔用率表呈 blocks/SM、活躍 warps/SM、限制因素（暫存器、smem 或 warp）。

**失敗時：** 為動態共享記憶體查 `cuFuncSetAttribute`。驗 `--resource-usage` 之回報合於實際啟動配置。若暫存器數出乎意料地高，試 `--maxrregcount=N` 以限暫存器（以暫存器溢位換佔用率）。

### 步驟四：計算每瓦片之計算／載入比

自 SASS（非源碼）計算每 K 瓦片之計算指令與載入位元組：

1. **反組譯**：
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **計算每瓦片之計算指令**（內迴圈於一 K 瓦片）：
   - `grep -c 'HMMA' kernel.sass` — FP16 Tensor Core ops
   - `grep -c 'IMMA' kernel.sass` — INT8 Tensor Core ops
   - `grep -c 'FFMA' kernel.sass` — FP32 fused multiply-add
3. **計算每瓦片之全域載入**：
   - `grep -c 'LDG' kernel.sass` — global memory loads
   - 乘以每載入之位元組（典型 LDG.128 為 16 位元組）
4. **計算比**：每瓦片之 `compute_ops / load_ops`。
5. **以 cp.async 決策閾值分類**（自 gpu_reflections.md Insight 2）：
   - **高**（>20:1）：cp.async 淨負；warp interleaving 已隱藏 DRAM 延遲。重於演算法變動。參考：Flash Attention 每瓦片 64 HMMA = 高比，cp.async 量得 -5%。
   - **中**（5-20:1）：cp.async 或助，二路皆基準。
   - **低**（<5:1）：cp.async 大有助；載入主導，async copy 隱延遲。參考：IGEMM 每瓦片 8 IMMA = 低比，cp.async 量得 +35%。

**預期：** 計算／載入比附分類（高／中／低）與 cp.async 建議。

**失敗時：** 自 SASS 反組譯計，非源碼——編譯器或融合、消除或重排指令。確僅計內迴圈內之指令（K 瓦片迭代），非整核心。

### 步驟五：檢查 SASS 指令

審完整 SASS 指令組合與停滯碼：

1. **反組譯**（若於步驟四未行）：
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **計關鍵指令類型**：
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
3. **查關鍵指令之停滯碼**：
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **辨優化目標**：
   - HMMA S08 停滯：Ampere 上之硬體下限，不可降。重於他處
   - IMMA S04 停滯：編譯器保守。CuAssembler 可緊至 S02（量得 15-20% 增益）
   - FFMA S04 停滯：若獨立，經 CuAssembler 可降至 S01
   - 過量 BAR.SYNC：或表管線階段間過度同步

**預期：** 指令計數表與停滯碼摘要附辨識之優化目標。

**失敗時：** 確保 `cuobjdump` 之架構合於核心編譯之目標（皆須 sm_86）。若 SASS 輸出為空，cubin 或損——重編。

### 步驟六：檢查 Smem 懸崖

判共享記憶體用量是否越架構特有之佔用率懸崖：

1. **讀 smem/block** 自 `--resource-usage` 輸出（步驟三）或 `cuobjdump --res-usage kernel.sm_86.cubin`。
2. **比懸崖閾值**：
   - GA104 (sm_86)：100 KB 最大 smem/SM。懸崖於 50 KB/block。
   - 經驗確認：48 KB/block -> 2 blocks/SM（佳）、56 KB/block -> 1 block/SM（2 倍退化）。
3. **若於懸崖之上**（smem > 50 KB/block）：
   - Blocks/SM 降至 1，活躍 warp 降至 warps_per_block（典型 4）
   - 預期 2 倍效能退化，因 DRAM 停滯曝露
4. **查雙緩衝影響**：雙緩衝倍 smem 用量。若當前 smem 為 30 KB，雙緩衝 = 60 KB，越懸崖。評 async 益是否勝佔用損。
5. **記** smem/block、blocks/SM、是否越懸崖。

**預期：** smem/block 值附 blocks/SM 計與 50 KB 懸崖是否越之明確聲明。

**失敗時：** 若於懸崖之上且佔用為瓶頸，優化策略須變：減瓦片大以使 smem 低於 50 KB，或接 1 block/SM 而以每瓦片更高之計算／載入比補（更多暫存器重用、更長 K 瓦片）。

### 步驟七：建決策矩陣

將步驟二至六之發現綜為優化策略：

| Condition | Strategy |
|-----------|----------|
| Memory-bound + low compute/load ratio (<5:1) + smem under cliff | Software pipelining with cp.async (LDGSTS). Overlap global loads with compute. |
| Memory-bound + high compute/load ratio (>20:1) + 8+ warps | Warp interleaving already hides latency. Focus on algorithmic changes: implicit GEMM, split-Q, im2col. |
| Compute-bound + FFMA-heavy | CuAssembler stall code tightening: S04 -> S01 on independent FFMAs. |
| Compute-bound + HMMA-heavy | S08 is hardware minimum, cannot reduce. Increase tile reuse (larger M/N tiles, longer K-loop). |
| Compute-bound + IMMA-heavy | CuAssembler: S04 -> S02 on IMMA instructions (compiler is conservative). |
| Latency-bound (low occupancy, neither saturated) | Reduce smem or registers to get more blocks/SM. Get above 8 warps/SM. |
| Smem above cliff | Reduce tile size or restructure to get smem/block under 50 KB (GA104). |

1. **以預期增益排序**適用之策略，用計算／載入比與佔用資料。
2. **估各策略之增益範圍**，依核心離相關天花板之距。
3. **標衝突**：如 cp.async 倍 smem（或越懸崖），更大瓦片增暫存器壓力（或減佔用）。

**預期：** 排序之建議優化清單，附預測之增益範圍與潛在衝突。

**失敗時：** 若無明顯勝者現，行隔離各策略之微基準（如獨測 cp.async、獨測減瓦片大），合前以量實際影響。

### 步驟八：記錄發現

產結構化之瓶頸報告：

1. **基線**：核心時、有效 GFLOPS、有效頻寬、問題維度
2. **roofline 位置**：算術強度、分類、所達峰之分數
3. **佔用**：blocks/SM、活躍 warps/SM、限制因素
4. **計算／載入比**：比值、分類（高／中／低）、cp.async 建議
5. **SASS 摘要**：指令計數表、停滯碼發現、CuAssembler 目標
6. **Smem 懸崖**：smem/block、blocks/SM、懸崖狀態
7. **建議**：排序之優化策略附增益估計

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

**預期：** 完整 markdown 報告，可供核心優化代理或人類開發者消用。

**失敗時：** 以不同問題大（如 1024、2048、4096、8192）重行以證發現非規模特有。小問題或現延遲受限而真實規模上之瓶頸為記憶體頻寬。

## 驗證

- [ ] 基線以 CUDA event（非牆鐘）量
- [ ] roofline 分類已定（計算／記憶體／延遲受限）
- [ ] 佔用率已計，限制因素已辨
- [ ] 每瓦片計算／載入比自 SASS 計算
- [ ] SASS 指令組合與停滯碼已記
- [ ] Smem 懸崖已對架構閾值查
- [ ] 決策矩陣已施附策略建議
- [ ] 發現於結構化報告中已記

## 常見陷阱

- **重讀倍乘**：直接 conv2d 無 im2col 將每權重讀 9 次，膨脹位元組計數 9 倍。計算算術強度時用 DRAM 實際載入之獨特位元組，非載入指令總數
- **混 FP16 Tensor Core 峰與 FP32 峰**：FP16 TC 峰為 174 TFLOPS，FP32 FFMA 峰為 21.7 TFLOPS——8 倍之差。用錯峰使 roofline 分類無意義
- **GA104 上以 64 KB 為 smem 懸崖而非 50 KB**：GA104 (sm_86) 最大 100 KB smem/SM。懸崖於 100/2 = 50 KB/block，非 64 KB。此架構特有；他 GPU 異
- **評 cp.async 時忽 warp interleaving**：8 warp 附長計算階段（高計算／載入比）已透過 warp 排程隱 DRAM 延遲。於此區增 cp.async 增 smem 壓力與屏障開銷而無益（Flash Attention 量得 -5%）
- **自源碼計指令而非 SASS**：編譯器或融合操作、消死碼、不同地展開迴圈或重排指令。恆自 `cuobjdump -sass` 輸出計
- **未行暖機迭代**：首次核心啟含 JIT 編譯開銷與冷快取效應。量測前恆行 2-5 次暖機

## 相關技能

- `pipeline-gpu-kernel` — 分析辨記憶體受限低計算／載入比之核心時，以 cp.async 實作軟體管線
- `simulate-cpu-architecture` — 主機-裝置工作流中，CPU 端瓶頸之互補架構分析
