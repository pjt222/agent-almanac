---
name: analyze-kernel-bottleneck
locale: wenyan-ultra
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

# 析核瓶

定 GPU 核為算限、記限、或延限：roofline、佔、計/載比、SASS 察。

## 用

- 優 CUDA 核前——立基、分瓶類→用
- 初版核識優路→用
- 核負期不及理峰→用
- 決於 cp.async、大塊、算重構間→用

## 入

- **必**：編核（`.cubin` 或 `.cu` 附建命）
- **必**：以 CUDA 事計時之基台
- **必**：題維（如 GEMM 之 M、N、K；attention 之 seq_len、heads、head_dim）
- **可**：標 GPU 構（默：GA104 / sm_86 / RTX 3070 Ti）
- **可**：預期峰用百分以比
- **可**：先剖數（Nsight Compute 報）

## 行

### 一：量基

行核以 CUDA 事（`BenchTimer`），記時毫。算實效流：

1. **編** 核若未建：
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **行** 以代表題大，確熱身先：
   ```bash
   ./bench 4096 4096 4096
   ```
3. **記** 核時毫 by CUDA 事（非牆鐘）。
4. **算** 實效 GFLOPS 與帶寬：
   - GEMM：`effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - 帶限核：`effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention：`effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

得：基數：核時毫、實 GFLOPS、實帶寬。

敗：察核啟無誤（`CHECK_CU` 巨）。驗熱身先。題維足以飽 GPU（小題或瓶於啟頭）。

### 二：roofline 分

算算強而比機衡：

1. **算強**：`AI = FLOPs / bytes_loaded_from_global_memory`。唯計獨自 DRAM 載字（非共記或暫器重用）。
2. **查機衡**：`balance = peak_compute / peak_bandwidth`。
3. **分**：`AI < balance` 為記限。`AI > balance` 為算限。

**GA104 (RTX 3070 Ti) 參值：**

| Resource | Peak | Unit |
|----------|------|------|
| FP32 FFMA | 21.7 | TFLOPS |
| FP16 Tensor Core (HMMA) | 174 | TFLOPS |
| INT8 Tensor Core (IMMA) | 696 | TOPS |
| DRAM Bandwidth | 608 | GB/s |
| L2 Cache | 4 | MB |
| SMs | 48 | |

**衡點：**

| Precision | Balance Point (FLOP/byte) |
|-----------|--------------------------|
| FP32 FFMA | 21700 / 608 = 35.7 |
| FP16 TC | 174000 / 608 = 286.2 |
| INT8 TC | 696000 / 608 = 1144.7 |

4. **算達分**：`attained = effective_throughput / peak_throughput`。記限：比實帶於 608 GB/s。算限：比實 GFLOPS 於關峰。

得：分為算限、記限、或延限（低佔致兩皆未飽）附數由。

敗：重核位元數。察重讀（如直 conv2d 無 im2col 之 9x）。兩皆未飽→或延限（見三）。

### 三：算佔

由啟設與資用定每 SM 活 warp：

1. **取資用**：
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **由啟設**：`warps_per_block = threads_per_block / 32`。
3. **算 blocks/SM** 自各限：
   - 暫器限：`floor(65536 / (registers_per_thread * threads_per_block))`
   - smem 限：`floor(available_smem_per_SM / smem_per_block)`——見步六崖
   - warp 限：`floor(48 / warps_per_block)`（GA104 max：48 warps/SM）
   - 塊限：GA104 max 16 blocks/SM
4. **實 blocks/SM** = `min(register_limit, smem_limit, warp_limit, block_limit)`。
5. **活 warps/SM** = `blocks_per_SM * warps_per_block`。
6. **要閾**：8 warps/SM 足以隱延於 GA104。<8 為構題致延限。

得：佔表示 blocks/SM、活 warps/SM、限因（暫器、smem、或 warp）。

敗：察 `cuFuncSetAttribute` 為動共記。驗 `--resource-usage` 報配實啟設。暫器數意外高→試 `--maxrregcount=N` 限暫器（換溢以佔）。

### 四：算每塊計/載比

由 SASS（非源）計每 K 塊計指與載字：

1. **解**：
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **計每塊計指**（內環一 K 塊）：
   - `grep -c 'HMMA' kernel.sass` —— FP16 Tensor Core
   - `grep -c 'IMMA' kernel.sass` —— INT8 Tensor Core
   - `grep -c 'FFMA' kernel.sass` —— FP32 fused multiply-add
3. **計每塊全載**：
   - `grep -c 'LDG' kernel.sass` —— 全記載
   - 乘以每載字（典 LDG.128 為 16 字）
4. **算比**：`compute_ops / load_ops` 每塊。
5. **分** 用 cp.async 決閾（gpu_reflections.md Insight 2）：
   - **高**（>20:1）：cp.async 淨負；warp 交織已隱 DRAM 延。注算改。參：Flash Attention 64 HMMA/塊=高比，cp.async 量 -5%。
   - **中**（5-20:1）：cp.async 或助，兩路皆基。
   - **低**（<5:1）：cp.async 強益；載主而異步隱延。參：IGEMM 8 IMMA/塊=低比，cp.async 量 +35%。

得：計/載比附分（高/中/低）與 cp.async 薦。

敗：由 SASS 解非源計——編或融、消、或重序指。確唯計內環指（K 塊迭），非全核。

### 五：察 SASS 指

審全 SASS 指混與停碼：

1. **解**（若步四未行）：
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
3. **察停碼** 於關指：
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **識優標**：
   - HMMA S08 停：Ampere 硬最小，不可減。注他處
   - IMMA S04 停：編保守。CuAssembler 可緊至 S02（量 15-20% 益）
   - FFMA S04 停：若獨可減至 S01 經 CuAssembler
   - 過 BAR.SYNC：或示管階間過同

得：指數表與停碼要附識優標。

敗：確 `cuobjdump` 構配核編標（皆 sm_86）。SASS 出空→cubin 或壞，重編。

### 六：察 smem 崖

定共記用越構特佔崖否：

1. **讀 smem/塊** 自 `--resource-usage`（步三）或 `cuobjdump --res-usage kernel.sm_86.cubin`。
2. **比於崖閾**：
   - GA104 (sm_86)：100 KB max smem/SM。崖於 50 KB/塊
   - 經驗證：48 KB/塊 → 2 blocks/SM（善），56 KB/塊 → 1 block/SM（2x 退）
3. **若上崖**（smem > 50 KB/塊）：
   - blocks/SM 降為 1，活 warp 降為 warps_per_block（典 4）
   - 預期 2x 性退由顯 DRAM 停
4. **察雙緩影**：雙緩倍 smem 用。今 smem 30 KB → 雙 60 KB → 越崖。評異步益越佔失否。
5. **記** smem/塊、blocks/SM、崖越否。

得：smem/塊值附 blocks/SM 數與 50 KB 崖明越否。

敗：上崖且佔為瓶→優策須變：減塊大致 smem <50 KB，或受 1 block/SM 而以高計/載比補（更暫器重用、長 K 塊）。

### 七：建決矩

合二至六之發為優策：

| Condition | Strategy |
|-----------|----------|
| Memory-bound + low compute/load ratio (<5:1) + smem under cliff | Software pipelining with cp.async (LDGSTS). Overlap global loads with compute. |
| Memory-bound + high compute/load ratio (>20:1) + 8+ warps | Warp interleaving already hides latency. Focus on algorithmic changes: implicit GEMM, split-Q, im2col. |
| Compute-bound + FFMA-heavy | CuAssembler stall code tightening: S04 -> S01 on independent FFMAs. |
| Compute-bound + HMMA-heavy | S08 is hardware minimum, cannot reduce. Increase tile reuse (larger M/N tiles, longer K-loop). |
| Compute-bound + IMMA-heavy | CuAssembler: S04 -> S02 on IMMA instructions (compiler is conservative). |
| Latency-bound (low occupancy, neither saturated) | Reduce smem or registers to get more blocks/SM. Get above 8 warps/SM. |
| Smem above cliff | Reduce tile size or restructure to get smem/block under 50 KB (GA104). |

1. **排** 適策按預益，用計/載比與佔數。
2. **估益範** 於各策按核去關頂之距。
3. **標衝**：如 cp.async 倍 smem（或越崖），大塊增暫器壓（或減佔）。

得：薦優排列附預益範與潛衝。

敗：無明勝→行微基孤各策（如試 cp.async 獨、試減塊獨）以量真效再合。

### 八：文發

出構瓶報：

1. **基**：核時、實 GFLOPS、實帶寬、題維。
2. **roofline 位**：算強、分、達峰分。
3. **佔**：blocks/SM、活 warps/SM、限因。
4. **計/載比**：比值、分（高/中/低）、cp.async 薦。
5. **SASS 要**：指數表、停碼發、CuAssembler 標。
6. **smem 崖**：smem/塊、blocks/SM、崖態。
7. **薦**：排優策附益估。

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

得：完整 markdown 報，核優師或人開發可消。

敗：以異題大重行（如 1024、2048、4096、8192）以驗發非大專。小題或似延限而真瓶於大為記帶。

## 驗

- [ ] 基以 CUDA 事量（非牆鐘）
- [ ] roofline 分定（算/記/延限）
- [ ] 佔算附限因識
- [ ] 由 SASS 算每塊計/載比
- [ ] SASS 指混與停碼文
- [ ] smem 崖比於構閾
- [ ] 決矩施附策薦
- [ ] 發文於構報

## 忌

- **重讀乘**：直 conv2d 無 im2col 重讀各權 9x，膨字 9x。算算強用實獨自 DRAM 載字非全載指
- **混 FP16 TC 峰於 FP32 峰**：FP16 TC 174 TFLOPS、FP32 FFMA 21.7 TFLOPS——8x 差。誤峰致 roofline 分無意
- **GA104 用 64 KB 為 smem 崖代 50 KB**：GA104 (sm_86) max 100 KB smem/SM。崖於 100/2=50 KB/塊，非 64 KB。構特；他 GPU 異
- **評 cp.async 忽 warp 交織**：8 warp 長計階（高計/載比）已以 warp 排隱 DRAM 延。此境加 cp.async 加 smem 壓與屏負而無益（Flash Attention 量 -5%）
- **由源計指非 SASS**：編或融、除死碼、異展環、重序指。恆由 `cuobjdump -sass` 出計
- **不行熱身**：首啟含 JIT 編負與冷快效。恆行 2-5 熱身於量行前

## 參

- `pipeline-gpu-kernel` —— 析識記限低計/載比核時施軟管以 cp.async
- `simulate-cpu-architecture` —— 主機側瓶之構析補
