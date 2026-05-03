---
name: analyze-kernel-bottleneck
description: >
  系统化识别 GPU 内核是计算受限、内存受限还是延迟受限，使用 roofline 分析、
  占用率计算、按 tile 计算的计算/加载比以及 SASS 指令检查。产出用于优化
  策略选择（cp.async、warp 交错、tiling、双缓冲或 CuAssembler 手工调优）的
  决策矩阵。
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gpu-optimization
  complexity: advanced
  language: CUDA
  tags: gpu, roofline, occupancy, sass, tensor-core, bottleneck-analysis, compute-load-ratio
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 分析内核瓶颈

通过测量基线性能、在 roofline 上分类、计算占用率与每 tile 的计算/加载比、检查 SASS 指令组合与停顿码、检查共享内存悬崖以及应用决策矩阵选择正确的优化策略，系统化识别 GPU 内核是计算受限、内存受限还是延迟受限。

## 适用场景

- 在优化任何 CUDA 内核之前 —— 建立基线并对瓶颈类型进行分类
- 在编写内核的首个可工作版本后，识别优化路径
- 当内核相对于理论峰值表现不佳时
- 在选择 cp.async、更大 tile 或算法重构之间进行决策时

## 输入

- **必需**：已编译的内核（`.cubin` 或带构建命令的 `.cu` 源码）
- **必需**：使用 CUDA 事件计时启动内核的基准测试支架
- **必需**：问题维度（如 GEMM 的 M、N、K；attention 的 seq_len、heads、head_dim）
- **可选**：目标 GPU 架构（默认：GA104 / sm_86 / RTX 3070 Ti）
- **可选**：用于比较的预期峰值利用率百分比
- **可选**：先前的性能分析数据（Nsight Compute 报告）

## 步骤

### 第 1 步：测量基线性能

使用 CUDA 事件（`BenchTimer`）运行内核，记录毫秒级时间。计算有效吞吐量指标：

1. **编译**内核（如未构建）：
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **运行**具有代表性的问题规模，确保预热运行先于测量：
   ```bash
   ./bench 4096 4096 4096
   ```
3. **记录**来自 CUDA 事件的内核时间（毫秒），而非挂钟时间。
4. **计算**有效 GFLOPS 和有效带宽：
   - GEMM：`effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - 带宽受限内核：`effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention：`effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

**预期结果：** 基线数字：内核时间（毫秒）、有效 GFLOPS 和有效带宽。

**失败处理：** 检查内核启动是否无错误（`CHECK_CU` 宏）。验证预热运行先于测量。确保问题维度足够大以使 GPU 饱和（小问题可能在启动开销上形成瓶颈）。

### 第 2 步：在 Roofline 上分类

计算算术强度并与机器平衡点比较以对内核分类：

1. **计算算术强度**：`AI = FLOPs / bytes_loaded_from_global_memory`。仅计算从 DRAM 加载的唯一字节（不包括共享内存或寄存器复用）。
2. **查找机器平衡点**：`balance = peak_compute / peak_bandwidth`。
3. **分类**：若 `AI < balance`，内核为内存受限。若 `AI > balance`，内核为计算受限。

**GA104 (RTX 3070 Ti) 参考值：**

| 资源 | 峰值 | 单位 |
|----------|------|------|
| FP32 FFMA | 21.7 | TFLOPS |
| FP16 Tensor Core (HMMA) | 174 | TFLOPS |
| INT8 Tensor Core (IMMA) | 696 | TOPS |
| DRAM 带宽 | 608 | GB/s |
| L2 Cache | 4 | MB |
| SMs | 48 | |

**派生平衡点：**

| 精度 | 平衡点 (FLOP/byte) |
|-----------|--------------------------|
| FP32 FFMA | 21700 / 608 = 35.7 |
| FP16 TC | 174000 / 608 = 286.2 |
| INT8 TC | 696000 / 608 = 1144.7 |

4. **计算达到比例**：`attained = effective_throughput / peak_throughput`。若内存受限：将有效带宽与 608 GB/s 比较。若计算受限：将有效 GFLOPS 与相关峰值比较。

**预期结果：** 分类为计算受限、内存受限或延迟受限（占用率低导致计算和内存均未饱和），并附数值依据。

**失败处理：** 重新检查字节计数。注意冗余重读（如直接 conv2d 不使用 im2col 时为 9 倍）。若计算和内存均未饱和，内核很可能是延迟受限（见第 3 步）。

### 第 3 步：计算占用率

从启动配置和资源使用情况确定每个 SM 的活跃 warp 数：

1. **提取资源使用**：
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **从启动配置**：`warps_per_block = threads_per_block / 32`。
3. **从每个限制因素计算 blocks/SM**：
   - 寄存器限制：`floor(65536 / (registers_per_thread * threads_per_block))`
   - Smem 限制：`floor(available_smem_per_SM / smem_per_block)` —— 见第 6 步的悬崖
   - Warp 限制：`floor(48 / warps_per_block)`（GA104 最大：48 warps/SM）
   - Block 限制：GA104 上最多 16 blocks/SM
4. **实际 blocks/SM** = `min(register_limit, smem_limit, warp_limit, block_limit)`。
5. **活跃 warps/SM** = `blocks_per_SM * warps_per_block`。
6. **关键阈值**：在 GA104 上 8 warps/SM 足以隐藏延迟。低于 8 = 导致延迟受限行为的结构性问题。

**预期结果：** 显示 blocks/SM、活跃 warps/SM 以及限制因素（寄存器、smem 或 warps）的占用率表。

**失败处理：** 检查动态共享内存的 `cuFuncSetAttribute`。验证 `--resource-usage` 报告与实际启动配置匹配。若寄存器数量异常高，尝试 `--maxrregcount=N` 限制寄存器（以寄存器溢出换取占用率）。

### 第 4 步：计算每 tile 的计算/加载比

从 SASS（而非源代码）统计每个 K-tile 的计算指令和加载字节：

1. **反汇编**：
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **统计每 tile 的计算指令**（一个 K-tile 上的内层循环）：
   - `grep -c 'HMMA' kernel.sass` —— FP16 Tensor Core 操作
   - `grep -c 'IMMA' kernel.sass` —— INT8 Tensor Core 操作
   - `grep -c 'FFMA' kernel.sass` —— FP32 融合乘加
3. **统计每 tile 的全局加载**：
   - `grep -c 'LDG' kernel.sass` —— 全局内存加载
   - 乘以每次加载的字节数（LDG.128 通常为 16 字节）
4. **计算比率**：每 tile 的 `compute_ops / load_ops`。
5. **使用 cp.async 决策阈值分类**（来自 gpu_reflections.md 洞见 2）：
   - **高**（>20:1）：cp.async 净负面；warp 交错已隐藏 DRAM 延迟。专注于算法变更。参考：Flash Attention 每 tile 64 HMMA = 高比率，cp.async 测得 -5%。
   - **中**（5-20:1）：cp.async 可能有帮助，对两条路径进行基准测试。
   - **低**（<5:1）：cp.async 强烈有益；加载占主导，async copy 隐藏延迟。参考：IGEMM 每 tile 8 IMMA = 低比率，cp.async 测得 +35%。

**预期结果：** 计算/加载比及分类（高/中/低）和 cp.async 建议。

**失败处理：** 从 SASS 反汇编而非源代码统计 —— 编译器可能融合、消除或重排指令。确保只统计内层循环（K-tile 迭代）内的指令，而非整个内核。

### 第 5 步：检查 SASS 指令

检查完整的 SASS 指令组合和停顿码：

1. **反汇编**（若第 4 步未做）：
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **统计关键指令类型**：
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
3. **检查关键指令上的停顿码**：
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **识别优化目标**：
   - HMMA S08 停顿：Ampere 上的硬件最小值，无法降低。专注其他方面。
   - IMMA S04 停顿：编译器保守。CuAssembler 可收紧到 S02（实测增益 15-20%）。
   - FFMA S04 停顿：若独立，可通过 CuAssembler 降至 S01。
   - 过多 BAR.SYNC：可能表明流水线阶段间过度同步。

**预期结果：** 指令计数表和停顿码摘要，并识别出优化目标。

**失败处理：** 确保 `cuobjdump` 架构与内核编译目标匹配（两者都必须是 sm_86）。若 SASS 输出为空，cubin 可能损坏 —— 重新编译。

### 第 6 步：检查 Smem 悬崖

确定共享内存使用是否跨越特定架构的占用率悬崖：

1. 从第 3 步的 `--resource-usage` 输出或 `cuobjdump --res-usage kernel.sm_86.cubin` 中**读取 smem/block**。
2. **与悬崖阈值比较**：
   - GA104 (sm_86)：每 SM 最多 100 KB smem。每块 50 KB 处为悬崖。
   - 经验证实：48 KB/block -> 2 blocks/SM（良好），56 KB/block -> 1 block/SM（2 倍回退）。
3. **若高于悬崖**（smem > 50 KB/block）：
   - blocks/SM 降至 1，活跃 warps 降至 warps_per_block（通常 4）。
   - 由于暴露的 DRAM 停顿，预期 2 倍性能回退。
4. **检查双缓冲影响**：双缓冲使 smem 使用翻倍。若当前 smem 为 30 KB，双缓冲后 = 60 KB，跨越悬崖。评估异步收益是否超过占用率损失。
5. **记录** smem/block、blocks/SM 以及是否跨越悬崖。

**预期结果：** Smem/block 值与 blocks/SM 数量，并显式说明是否跨越 50 KB 悬崖。

**失败处理：** 若高于悬崖且占用率是瓶颈，必须改变优化策略：减小 tile 大小以使 smem 低于 50 KB，或接受 1 block/SM 并通过更高的每 tile 计算/加载比补偿（更多寄存器复用、更长的 K-tiles）。

### 第 7 步：构建决策矩阵

将第 2-6 步的发现综合为优化策略：

| 条件 | 策略 |
|-----------|----------|
| 内存受限 + 低计算/加载比 (<5:1) + smem 低于悬崖 | 使用 cp.async (LDGSTS) 进行软件流水。重叠全局加载与计算。 |
| 内存受限 + 高计算/加载比 (>20:1) + 8+ warps | warp 交错已隐藏延迟。专注算法变更：implicit GEMM、split-Q、im2col。 |
| 计算受限 + FFMA 密集 | CuAssembler 停顿码收紧：独立 FFMA 上 S04 -> S01。 |
| 计算受限 + HMMA 密集 | S08 是硬件最小值，无法降低。增加 tile 复用（更大 M/N tiles，更长 K-loop）。 |
| 计算受限 + IMMA 密集 | CuAssembler：IMMA 指令上 S04 -> S02（编译器保守）。 |
| 延迟受限（占用率低，均未饱和） | 减少 smem 或寄存器以获得更多 blocks/SM。达到 8 以上 warps/SM。 |
| Smem 高于悬崖 | 减小 tile 大小或重构以使 smem/block 低于 50 KB（GA104）。 |

1. **排序**适用策略（按预期增益），使用计算/加载比和占用率数据。
2. 根据内核与相关上限的距离**估计每个策略的增益范围**。
3. **标记冲突**：如 cp.async 使 smem 翻倍（可能跨越悬崖），更大 tile 增加寄存器压力（可能降低占用率）。

**预期结果：** 推荐优化的有序列表，附预测增益范围和潜在冲突。

**失败处理：** 若没有明确赢家，运行隔离每个策略的微基准（如单独测试 cp.async、单独测试减小的 tile 大小），在组合之前测量实际影响。

### 第 8 步：记录发现

产出结构化的瓶颈报告：

1. **基线**：内核时间、有效 GFLOPS、有效带宽、问题维度。
2. **Roofline 位置**：算术强度、分类、达到的峰值比例。
3. **占用率**：blocks/SM、活跃 warps/SM、限制因素。
4. **计算/加载比**：比率值、分类（高/中/低）、cp.async 建议。
5. **SASS 摘要**：指令计数表、停顿码发现、CuAssembler 目标。
6. **Smem 悬崖**：smem/block、blocks/SM、悬崖状态。
7. **建议**：带增益估计的有序优化策略。

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

**预期结果：** 完整的 markdown 报告，可被内核优化代理或人类开发者使用。

**失败处理：** 使用不同问题规模（如 1024、2048、4096、8192）重新运行以确认发现非规模特定。小问题可能看起来延迟受限，但实际规模化的瓶颈是内存带宽。

## 验证清单

- [ ] 使用 CUDA 事件（非挂钟）测量基线
- [ ] Roofline 分类已确定（计算/内存/延迟受限）
- [ ] 计算占用率并识别限制因素
- [ ] 从 SASS 计算每 tile 的计算/加载比
- [ ] 记录 SASS 指令组合和停顿码
- [ ] 对照架构阈值检查 smem 悬崖
- [ ] 应用决策矩阵并给出策略建议
- [ ] 在结构化报告中记录发现

## 常见问题

- **重读乘数**：直接 conv2d 不使用 im2col 会读取每个权重 9 次，使字节计数膨胀 9 倍。计算算术强度时使用从 DRAM 实际加载的唯一字节，而非加载指令总数。
- **混淆 FP16 Tensor Core 峰值与 FP32 峰值**：FP16 TC 峰值为 174 TFLOPS，FP32 FFMA 峰值为 21.7 TFLOPS —— 8 倍差异。使用错误的峰值会使 roofline 分类失去意义。
- **GA104 上使用 64 KB 而非 50 KB 作为 smem 悬崖**：GA104 (sm_86) 每 SM 最多 100 KB smem。悬崖位于 100/2 = 50 KB/block，而非 64 KB。这是架构特定的；其他 GPU 不同。
- **评估 cp.async 时忽略 warp 交错**：8 warps 配长计算阶段（高计算/加载比）已通过 warp 调度隐藏 DRAM 延迟。在此情况下添加 cp.async 增加 smem 压力和屏障开销，毫无益处（在 Flash Attention 上实测 -5%）。
- **从源代码而非 SASS 统计指令**：编译器可能融合操作、消除死代码、以不同方式展开循环或重排指令。始终从 `cuobjdump -sass` 输出统计。
- **未运行预热迭代**：首次内核启动包含 JIT 编译开销和冷缓存影响。在测量运行之前始终运行 2-5 次预热迭代。

## 相关技能

- `pipeline-gpu-kernel` —— 当分析识别出低计算/加载比的内存受限内核时，使用 cp.async 实现软件流水
- `simulate-cpu-architecture` —— 主机-设备工作流中 CPU 端瓶颈的互补架构分析
