---
name: pipeline-gpu-kernel
description: >
  对分块 GPU 内核应用软件流水（双缓冲），使全局内存加载与 Tensor Core
  计算重叠。涵盖 prologue/loop/epilogue 重构、基于计算/加载比的 LDG-register
  与 cp.async (LDGSTS) 变体选择、对照特定架构占用率悬崖的共享内存预算验证，
  以及加载/计算重叠的 SASS 级验证。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gpu-optimization
  complexity: advanced
  language: CUDA
  tags: gpu, software-pipelining, double-buffer, cp-async, ldgsts, tensor-core, smem, occupancy
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 流水化 GPU 内核

对分块 GPU 内核应用软件流水（双缓冲），使 tile N+1 的全局内存加载与 tile N 的 Tensor Core 计算重叠。将顺序的 load-sync-compute-sync K 循环转换为 prologue/loop/epilogue 结构，根据计算/加载比在 LDG-register 与 cp.async (LDGSTS) 变体之间选择，验证共享内存保持在架构占用率悬崖之下，并在最终 SASS 中确认加载/计算重叠。

## 适用场景

- 当 `analyze-kernel-bottleneck` 识别出每 tile 计算/加载比低的内存受限内核时
- 当 warp 交错本身无法隐藏 DRAM 延迟（GA104 上约 300 周期）时
- 当内核有可重构的顺序 load-sync-compute-sync K 循环时
- 当计算/加载比高（>20:1）且有 8+ 活跃 warp 时不需要

## 输入

- **必需**：含分块 K 循环（带分离的加载和计算阶段）的 CUDA 内核源文件（`.cu`）
- **必需**：目标 GPU 架构（如 GA104 / sm_86 —— 决定 smem 悬崖和占用率限制）
- **必需**：当前 tile 大小（BM、BN、BK）和数据类型（FP16、FP32、INT8）
- **可选**：每 tile 的计算/加载比（来自 `analyze-kernel-bottleneck`；若未提供则估计）
- **可选**：基准基线（目标问题大小下的非流水性能）

## 步骤

### 第 1 步：验证前提条件

确认内核有带通过 `__syncthreads()` 分离的不同加载和计算阶段的分块 K 循环。计算双倍的共享内存成本并验证其保持在架构占用率悬崖之下。

1. 在内核中定位 K 循环。它必须有此顺序结构：从全局加载 A 和 B 块到共享内存、`__syncthreads()`、在共享内存块上计算（HMMA/IMMA/FFMA）、`__syncthreads()`。
2. 记录单缓冲共享内存大小：`smem_a_size = BM * BK * sizeof(T)` 和 `smem_b_size = BK * BN * sizeof(T)`。
3. 计算双缓冲成本：`smem_doubled = smem_a_size * 2 + smem_b_size * 2`。
4. 与架构悬崖比较。GA104 (sm_86)：每 SM 最大 100 KB smem，每块 50 KB 处悬崖（高于 50 KB = 1 block/SM = 4 warps，2 倍占用率坍塌）。

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. 验证循环迭代计数：`num_tiles = K / BK`。流水化要求 `num_tiles >= 2`（至少一个 prologue + 一个主循环迭代）。

**预期结果：** 显示单缓冲和双缓冲成本的共享内存预算表，确认双倍分配保持在架构悬崖之下并至少有 2 blocks/SM 占用率。

**失败处理：** 若双缓冲超过悬崖，减小 tile 大小（折半 BK 或 BM）直到 GA104 上 `smem_doubled <= 50 KB`。或者，使用仅寄存器预取（LDG 变体）而不双倍共享内存 —— 将预取数据存储在寄存器中并在 `__syncthreads()` 后写到同一单缓冲。

### 第 2 步：选择变体

根据每 tile 的计算/加载比在 LDG-register 与 cp.async (LDGSTS) 之间选择。

1. 计算计算/加载比：对类 GEMM 内核 `ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))`（每乘加 2 FLOPs，每 tile 加载字节数）。
2. 应用决策规则：

**LDG-register 变体**（ratio >= 5 或 CUDA < 11.0）：
- LDG tile N+1 到寄存器（非阻塞全局加载）。
- 在 `buf[N % 2]` 上计算（与未完成 LDG 重叠）。
- `__syncthreads()`，然后 STS 寄存器到 `buf[(N+1) % 2]`、`__syncthreads()`。
- 实现更简单，无流水 API 依赖。
- 增加寄存器压力：每线程约 `(BM * BK + BK * BN) / BLOCK_SIZE` 个寄存器用于暂存。

**cp.async (LDGSTS) 变体**（ratio < 5，CUDA >= 11.0）：
- `__pipeline_memcpy_async` tile N+1 直接到 `buf[(N+1) % 2]`（异步，绕过寄存器文件）。
- 计算前 `__pipeline_commit()`。
- 在 `buf[N % 2]` 上计算。
- 计算后 `__pipeline_wait_prior(0)` + `__syncthreads()`。
- 更好重叠，预取零寄存器压力。需要 `#include <cuda_pipeline.h>`。

3. 决策阈值（在 GA104 上用 IGEMM 4096x4096x4096 测量）：
   - Ratio < 5:1 —— 优选 cp.async（IGEMM 上实测 +35%）。
   - Ratio 5-20:1 —— 实现两者并基准测试决定。
   - Ratio > 20:1 —— 流水化可能无益（warp 交错足够）。

**预期结果：** 选定的变体，附基于计算/加载比和目标架构的依据。

**失败处理：** 若比率不明（5-20:1 范围），实现两个变体并基准测试。当 CUDA 版本支持时，cp.async 变体是更安全的默认。

### 第 3 步：重构 K 循环

将顺序 load-sync-compute-sync 循环转换为流水化的 prologue/loop/epilogue 结构。

1. **识别三个部分**：原始循环体变成三块：
   - **Prologue**：将 tile 0 加载到 `buf[0]`、同步，然后进入主循环。
   - **主循环**：对 tile 1 到 `num_tiles - 1`，将加载 tile N+1 与计算 tile N 重叠。
   - **Epilogue**：计算最后一个 tile（已由最终主循环迭代加载）。

2. **LDG-register 变体结构**：

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

3. **cp.async 变体结构**：

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

4. 验证循环计数：主循环运行 `num_tiles - 1` 次迭代（tile 0 到 `num_tiles - 2` 索引计算哪些 tile，加载 tile 1 到 `num_tiles - 1`）。Epilogue 计算最后一次迭代加载的 tile。

**预期结果：** 重构的 K 循环源代码，对所选变体有清晰的 prologue、主循环和 epilogue 部分。

**失败处理：** 最常见 bug 是缓冲索引差一或忘记 epilogue 计算通行。验证：prologue 加载到 `buf[0]`，第一次主循环迭代计算 `buf[0]` 并加载到 `buf[1]`，第二次迭代计算 `buf[1]` 并加载到 `buf[0]`，依此类推。Epilogue 计算 `buf[(num_tiles - 1) & 1]`。

### 第 4 步：实现双缓冲

声明双缓冲共享内存并实现加载函数。

1. 用双缓冲数组替换单缓冲共享内存声明：

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. 对 cp.async 变体，使用 pipeline API 实现异步加载函数：

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

3. 对 LDG 变体，实现寄存器暂存数组和存储函数：

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

4. 在内核上保留 `__launch_bounds__(BLOCK_SIZE)` 以给编译器准确的占用率信息。
5. 编译：`nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`。

**预期结果：** 带双缓冲共享内存和所选加载机制的可编译内核。无错误的成功 cubin 生成。

**失败处理：** 若编译在 pipeline API 调用上失败，确保存在 `#include <cuda_pipeline.h>` 且 CUDA toolkit >= 11.0。若发生寄存器溢出（检查 `nvcc --resource-usage`），通过增加 BLOCK_SIZE 或减小 BK 减小寄存器暂存数组大小。

### 第 5 步：验证正确性

对照 CPU 参考运行流水化内核以确认相同的数值输出。

1. 编译基准：`nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`。
2. 先以小问题大小（512x512x512）运行以在扩展前捕捉索引 bug。
3. 对数据类型应用正确的容差：
   - INT8 Tensor Core (IMMA)：`abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA)：`abs=1e-2, rel=1e-2`
   - FP32 标量 (FFMA)：`abs=1e-3, rel=1e-3`
4. 流水化不改变算术 —— 它只重排加载。若正确性失败，bug 在缓冲索引中，不在计算逻辑中。
5. 在目标问题大小（如 4096x4096x4096）测试以验证边界处理。

**预期结果：** 在小和目标问题大小下都 PASS，错误界与非流水基线相同。

**失败处理：** 缓冲索引 bug 是最可能原因。验证：计算从 `buf[tile & 1]` 读，而加载写入 `buf[1 - (tile & 1)]`。检查 epilogue 处理缓冲索引 `(num_tiles - 1) & 1`，而不是 `num_tiles & 1`。对 cp.async，验证 `__pipeline_wait_prior(0)` 在 `__syncthreads()` 前完成 —— 否则计算可能读取部分写入的数据。

### 第 6 步：基准测试和比较

在目标问题大小下测量流水化内核与非流水基线的对比。

1. 运行非流水基线并记录 GFLOPS 或带宽（取决于内核类型）。
2. 运行每个流水化变体并记录相同指标。
3. 计算加速：`speedup = pipelined_metric / baseline_metric`。
4. 按计算/加载比的预期增益（在 GA104 上测量）：
   - 低比率 (<5:1)：cp.async +15-35%（IGEMM 实测：在 4096x4096x4096，LDG +18%、cp.async +35%）。
   - 中比率 (5-20:1)：+5-15%。
   - 高比率 (>20:1)：0-5% 或回退。
5. 若两个变体都已实现，选择更快的用于生产。

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

**预期结果：** 显示改进的性能比较表。所选变体应显示与计算/加载比预测一致的可测量加速。

**失败处理：** 若性能回退，检查三件事：(1) SASS 中意外的指令开销（额外 BAR.SYNC、寄存器溢出）。(2) 共享内存未越过占用率悬崖 —— 用 `nvcc --resource-usage` 或 `cuobjdump -res-usage` 验证。(3) 问题大小产生足够 tile（`K / BK >= 4`）以使流水化摊销 prologue/epilogue 开销。

### 第 7 步：验证 SASS 重叠

检查编译的 SASS 以确认主循环体内全局加载和 Tensor Core 指令重叠。

1. 反汇编：`cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`。
2. 在主循环体中，验证此排序模式：
   - `LDGSTS` 或 `LDG` 指令出现**在** `HMMA` 或 `IMMA` 指令**之前**。
   - 加载指令和计算指令之间无 `BAR.SYNC`（它们必须自由在 warp 调度器中重叠）。
   - `BAR.SYNC` 出现**在**计算块**之后**，门控下次迭代对加载数据的使用。
3. 检查 HMMA/IMMA 指令的停顿码 —— HMMA 流水延迟 S08 是预期且不可避免。IMMA 的 S01-S04 是正常的。LDG/LDGSTS 上的停顿应低（S01），因为 warp 调度器可在加载飞行时切换到计算。
4. 计算每循环迭代的 HMMA/IMMA 指令总数 —— 这应匹配非流水版本（流水化不应改变计算量）。

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

**预期结果：** 注释 SASS 摘录显示无中间屏障的 load-before-compute 模式。零寄存器溢出。

**失败处理：** 若编译器将加载重排到计算后（破坏重叠），尝试：(1) 在主循环上 `#pragma unroll 1` 防止过度积极展开。(2) 将加载和计算分离到不同内联函数以创建排序提示。(3) 在加载和计算块之间使用 `asm volatile("" ::: "memory")` 作为编译器栅栏（最后手段 —— 可能抑制其他优化）。

## 验证清单

- [ ] 双缓冲 smem 保持在架构悬崖之下（GA104：每块 50 KB）
- [ ] 两个缓冲交替使用（`buf[tile & 1]` 模式）
- [ ] Prologue 加载 tile 0 到 `buf[0]`
- [ ] Epilogue 从 `buf[(num_tiles - 1) & 1]` 计算最后 tile
- [ ] 在小和目标大小下对照 CPU 参考正确性 PASS
- [ ] SASS 确认加载/计算重叠（LDGSTS/LDG 与 IMMA/HMMA 之间无 `BAR.SYNC`）
- [ ] 性能优于非流水基线
- [ ] LDG 变体无寄存器溢出（检查 `nvcc --resource-usage`）

## 常见问题

- **通过双倍缓冲跨越 smem 悬崖** —— GA104 悬崖是每块 50 KB，不是 64 KB。在实现前始终计算 `smem_doubled`。使用 28 KB 单缓冲的内核双倍后跳到 56 KB，跨越悬崖并将占用率减半。这可能将 +20% 流水化增益变成 -50% 占用率回退。
- **遗忘 epilogue 计算通行** —— 最终主循环迭代加载的最后 tile 需要其在循环外的自己的计算阶段。没有它，K 维的最后 BK 列被静默丢弃，产生可能表现为小数值错误而非明显失败的不正确结果。
- **缓冲索引差一** —— 用 `buf[tile & 1]` 作为当前计算缓冲，`buf[1 - (tile & 1)]` 作为下次加载缓冲。常见错误是用 `buf[(tile + 1) & 1]` 作为下个缓冲，仅当缓冲计数为 2 时等价于 `buf[1 - (tile & 1)]` —— 但若意外应用到计算索引则读错。
- **cp.async commit/wait 排序** —— `__pipeline_commit()` 必须在计算阶段**之前**调用（它密封异步复制批次）。`__pipeline_wait_prior(0)` 必须在计算阶段**之后**调用（它阻塞直到所有已提交复制完成）。交换这些会使异步复制同步，消除所有重叠收益。
- **缺失 __syncthreads** —— 在 LDG 变体中，计算和 STS 排出之间需要 `__syncthreads()`（使计算在被覆写前完成读取当前缓冲）。STS 排出后还需要另一个 `__syncthreads()`（使所有线程在下次迭代读取前完成写入）。在 cp.async 变体中，`__pipeline_wait_prior(0)` 后的 `__syncthreads()` 确保所有线程看到完成的异步复制。
- **cp.async 中的边界处理** —— `__pipeline_memcpy_async` 要求源地址有效且对齐。在 `K` 不是 `BK` 倍数的矩阵边缘，最后 tile 可能越界读取。对最后 tile 回退到带边界检查的标量加载，或将输入矩阵填充到 BK 的倍数。

## 相关技能

- `analyze-kernel-bottleneck` —— 识别内核是否内存受限并计算驱动变体选择的计算/加载比
