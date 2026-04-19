---
name: analyze-kernel-bottleneck
locale: wenyan
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

# 析核瓶頸

系統察 GPU 核為算束、記束、或延束，以 roofline 析、占用算、每磚算/載比、SASS 指察為基。生擇優策之決矩（cp.async、warp 交織、分磚、雙緩、或 CuAssembler 手調）。

## 用時

- 調 CUDA 核前——立基線、分瓶類乃用
- 初版核寫成後識優路乃用
- 核低於期之理峰乃用
- 擇於 cp.async、大磚、或重構算法之間乃用

## 入

- **必要**：編核（`.cubin` 或 `.cu` 源附建命）
- **必要**：以 CUDA 事件計時之基準架
- **必要**：題維（如 GEMM 之 M、N、K；注意之 seq_len、heads、head_dim）
- **可選**：目 GPU 架構（默：GA104 / sm_86 / RTX 3070 Ti）
- **可選**：期峰用比以資比較
- **可選**：前剖析數（Nsight Compute 報）

## 法

### 第一步：量基線

以 CUDA 事件（`BenchTimer`）行核，記時於毫秒。算有效吞量：

1. **編**核若未建：
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **行**以代表之題大，確預熱先於量：
   ```bash
   ./bench 4096 4096 4096
   ```
3. **記**核時於毫秒，以 CUDA 事件（非牆鐘）。
4. **算**有效 GFLOPS 與有效帶寬：
   - GEMM：`effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - 帶寬限核：`effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention：`effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

**得：** 基線：核時於毫秒、有效 GFLOPS、有效帶寬。

**敗則：** 察核啟無訛（`CHECK_CU` 宏）。驗預熱先於量。確題維大以飽 GPU（小題或瓶於啟耗）。

### 第二步：分 roofline 類

算算強度且對機衡點分類：

1. **算算強度**：`AI = FLOPs / bytes_loaded_from_global_memory`。只計自 DRAM 載之獨字節（非共記或寄存器之重用）。
2. **查機衡點**：`balance = peak_compute / peak_bandwidth`。
3. **分類**：若 `AI < balance`，核為記束。若 `AI > balance`，核為算束。

**GA104（RTX 3070 Ti）參值：**

| Resource | Peak | Unit |
|----------|------|------|
| FP32 FFMA | 21.7 | TFLOPS |
| FP16 Tensor Core (HMMA) | 174 | TFLOPS |
| INT8 Tensor Core (IMMA) | 696 | TOPS |
| DRAM Bandwidth | 608 | GB/s |
| L2 Cache | 4 | MB |
| SMs | 48 | |

**導衡點：**

| Precision | Balance Point (FLOP/byte) |
|-----------|--------------------------|
| FP32 FFMA | 21700 / 608 = 35.7 |
| FP16 TC | 174000 / 608 = 286.2 |
| INT8 TC | 696000 / 608 = 1144.7 |

4. **算達比**：`attained = effective_throughput / peak_throughput`。若記束：比有效帶寬於 608 GB/s。若算束：比有效 GFLOPS 於相關峰。

**得：** 分為算束、記束、或延束（低占用致非算非記飽）附數據之由。

**敗則：** 再核字節計。察重讀（如直卷二無 im2col 有 9 倍）。若非算非記飽，核或延束（見第三步）。

### 第三步：算占用

依啟配與資源用定每 SM 之活躍 warp：

1. **取資源用**：
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **啟配**：`warps_per_block = threads_per_block / 32`。
3. **算每 SM 塊數**自各限因：
   - 寄存器限：`floor(65536 / (registers_per_thread * threads_per_block))`
   - 共記限：`floor(available_smem_per_SM / smem_per_block)` — 見第六步之崖
   - warp 限：`floor(48 / warps_per_block)`（GA104 最：48 warp/SM）
   - 塊限：GA104 最 16 塊/SM
4. **實每 SM 塊數** = `min(register_limit, smem_limit, warp_limit, block_limit)`。
5. **活躍 warp/SM** = `blocks_per_SM * warps_per_block`。
6. **要閾**：GA104 藏延需 8 warp/SM。低於 8 = 結構之患致延束行。

**得：** 占用表顯每 SM 塊數、活躍 warp/SM、限因（寄存器、共記、warp）。

**敗則：** 察 `cuFuncSetAttribute` 為動共記。驗 `--resource-usage` 報合實啟配。若寄存器計異高，試 `--maxrregcount=N` 以限（換寄存器溢為占用）。

### 第四步：算每磚之算/載比

自 SASS（非源碼）計每 K 磚之算指與載字節：

1. **反彙**：
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **每磚算指**（於一 K 磚之內環）：
   - `grep -c 'HMMA' kernel.sass` — FP16 Tensor Core 操
   - `grep -c 'IMMA' kernel.sass` — INT8 Tensor Core 操
   - `grep -c 'FFMA' kernel.sass` — FP32 融乘加
3. **每磚全域載**：
   - `grep -c 'LDG' kernel.sass` — 全域記載
   - 乘以每載字節（LDG.128 典為 16 字節）
4. **算比**：每磚 `compute_ops / load_ops`。
5. **分類** 以 cp.async 決閾（自 gpu_reflections.md 洞見 2）：
   - **高**（>20:1）：cp.async 淨負；warp 交織已藏 DRAM 延。注算法之變。參：Flash Attention 每磚 64 HMMA = 高比，cp.async 量測 -5%。
   - **中**（5-20:1）：cp.async 或助，測二路。
   - **低**（<5:1）：cp.async 強助；載主而異步複藏延。參：IGEMM 每磚 8 IMMA = 低比，cp.async 量測 +35%。

**得：** 算/載比附分類（高/中/低）與 cp.async 薦。

**敗則：** 自 SASS 反彙計，非源碼——編譯或融、除、重排指。確只計內環（K 磚迭）內之指，非全核。

### 第五步：察 SASS 指

察全 SASS 指混與停碼：

1. **反彙**（若第四步未為）：
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **計要指類**：
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
3. **察關鍵指之停碼**：
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **識優目**：
   - HMMA S08 停：Ampere 硬件最，不可減。注他處。
   - IMMA S04 停：編譯器保守。CuAssembler 可緊至 S02（量測 15-20% 益）。
   - FFMA S04 停：若獨，可經 CuAssembler 減至 S01。
   - BAR.SYNC 過多：或示管段間過度同步。

**得：** 指計表與停碼要，附所識之優目。

**敗則：** 確 `cuobjdump` 架構合核編之目（皆 sm_86）。若 SASS 空，cubin 或損——再編。

### 第六步：察共記之崖

定共記用是否越架構之占用崖：

1. **讀每塊共記**自 `--resource-usage` 出（第三步）或 `cuobjdump --res-usage kernel.sm_86.cubin`。
2. **比崖閾**：
   - GA104（sm_86）：每 SM 最 100 KB 共記。崖於每塊 50 KB。
   - 實測：每塊 48 KB → 2 塊/SM（佳），每塊 56 KB → 1 塊/SM（二倍退）。
3. **若越崖**（共記 > 每塊 50 KB）：
   - 每 SM 塊降為 1，活躍 warp 降為 warps_per_block（典 4）。
   - 期二倍退自暴露之 DRAM 停。
4. **察雙緩之影**：雙緩倍增共記用。若當前共記 30 KB，雙緩 = 60 KB 越崖。評異步之益是否勝占用之失。
5. **記**每塊共記、每 SM 塊數、是否越崖。

**得：** 每塊共記值附每 SM 塊數、明述 50 KB 崖是否越。

**敗則：** 若越崖而占用為瓶，優策必變：減磚使共記於 50 KB 下，或納 1 塊/SM 而以更高算/載比補（更多寄存器重用、更長 K 磚）。

### 第七步：建決矩

合二至六步之發現為優策：

| Condition | Strategy |
|-----------|----------|
| Memory-bound + low compute/load ratio (<5:1) + smem under cliff | Software pipelining with cp.async (LDGSTS). Overlap global loads with compute. |
| Memory-bound + high compute/load ratio (>20:1) + 8+ warps | Warp interleaving already hides latency. Focus on algorithmic changes: implicit GEMM, split-Q, im2col. |
| Compute-bound + FFMA-heavy | CuAssembler stall code tightening: S04 -> S01 on independent FFMAs. |
| Compute-bound + HMMA-heavy | S08 is hardware minimum, cannot reduce. Increase tile reuse (larger M/N tiles, longer K-loop). |
| Compute-bound + IMMA-heavy | CuAssembler: S04 -> S02 on IMMA instructions (compiler is conservative). |
| Latency-bound (low occupancy, neither saturated) | Reduce smem or registers to get more blocks/SM. Get above 8 warps/SM. |
| Smem above cliff | Reduce tile size or restructure to get smem/block under 50 KB (GA104). |

1. **排**諸可策按期益，用算/載比與占用數。
2. **估益**每策依核距頂之遠。
3. **標衝**：如 cp.async 倍共記（或越崖）、大磚增寄存器壓（或減占用）。

**得：** 排序之薦優列附預益與潛衝。

**敗則：** 若無明勝者，行微基準獨測各策（如獨試 cp.async、獨試小磚）以量實影而後合。

### 第八步：書發現

生結構化瓶頸報：

1. **基線**：核時、有效 GFLOPS、有效帶寬、題維。
2. **Roofline 位**：算強度、分類、達比。
3. **占用**：每 SM 塊、活躍 warp/SM、限因。
4. **算/載比**：比值、分類（高/中/低）、cp.async 薦。
5. **SASS 要**：指計表、停碼發現、CuAssembler 目。
6. **共記崖**：每塊共記、每 SM 塊、崖狀。
7. **薦**：排序之優策附益估。

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

**得：** 全 markdown 報，核優吏或人開可食。

**敗則：** 以異題大（如 1024、2048、4096、8192）再行以確發現非大特。小題或顯延束而尺度上實瓶乃記帶寬。

## 驗

- [ ] 基線以 CUDA 事件量（非牆鐘）
- [ ] Roofline 分類已定（算/記/延束）
- [ ] 占用已算附限因
- [ ] 每磚算/載比自 SASS 算
- [ ] SASS 指混與停碼已書
- [ ] 共記崖對架構閾已察
- [ ] 決矩施而薦策
- [ ] 發現書於結構化報

## 陷

- **重讀之乘**：直卷二無 im2col 每權讀 9 次，虛字節計 9 倍。算算強度用實自 DRAM 載之獨字節，非載指總
- **混 FP16 TC 峰與 FP32 峰**：FP16 TC 峰 174 TFLOPS，FP32 FFMA 峰 21.7 TFLOPS——八倍異。用誤峰使 roofline 分類無義
- **GA104 用 64 KB 代 50 KB 為共記崖**：GA104（sm_86）每 SM 最 100 KB 共記。崖於 100/2 = 每塊 50 KB，非 64 KB。此架構特；他 GPU 異
- **評 cp.async 時忽 warp 交織**：8 warp 附長算段（高算/載比）經 warp 調度已藏 DRAM 延。此境加 cp.async 增共記壓與屏障耗而無益（Flash Attention 量測 -5%）
- **自源碼計指代 SASS**：編譯或融、除、展環不同、重排指。恆自 `cuobjdump -sass` 出計
- **不行預熱**：首啟含 JIT 編譯耗與冷緩之影。恆行 2-5 預熱前於量

## 參

- `pipeline-gpu-kernel` — 若析識記束核且算/載比低，實軟件管與 cp.async
- `simulate-cpu-architecture` — 主機端瓶之補架構析
