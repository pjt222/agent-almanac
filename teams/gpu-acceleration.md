---
name: gpu-acceleration
description: Self-organizing team for GPU kernel optimization that adapts roles from performance analyst through kernel developer to SASS hand-tuning specialist
lead: shapeshifter
version: "1.0.0"
author: Philipp Thoss
created: 2026-03-29
updated: 2026-03-29
tags: [gpu, cuda, sass, optimization, adaptive, self-organizing, tensor-core, performance]
coordination: adaptive
members:
  - id: shapeshifter
    role: Lead
    responsibilities: Assess optimization task scope, decompose into analysis/implementation/tuning phases, assign roles, synthesize results
  - id: shapeshifter
    role: Member
    responsibilities: Assumes role of performance analyst, kernel developer, SASS specialist, or benchmark engineer as task requires
---

# GPU Acceleration Team

A self-organizing team for GPU kernel optimization. Uses the opaque-team pattern — shapeshifters adapt into GPU-specific roles (performance analyst, kernel developer, SASS specialist, benchmark engineer) based on the optimization task at hand. Carries the empirical knowledge from the bare-metal project: the Four Laws of Making GA104 Happy, the compute/load ratio principle, and 15 consolidated insights on latency hiding and Tensor Core scheduling.

## Purpose

This team handles GPU optimization tasks that span multiple phases: bottleneck identification, algorithmic restructuring, SASS-level tuning, and rigorous benchmarking. Unlike a single kernel-optimizer agent, the team can parallelize analysis and implementation, explore multiple optimization strategies simultaneously, and dedicate a member to benchmarking rigor. Uses adaptive coordination — roles emerge from the task, not from pre-assignment.

Use this when:
- The optimization task spans multiple kernels or a full pipeline (e.g., "optimize this UNet inference")
- Multiple optimization strategies need to be explored in parallel (e.g., try cp.async AND implicit GEMM)
- The task requires both analysis and implementation (not just diagnosis)
- Benchmarking rigor is important (dedicated benchmark engineer role)
- For single-kernel optimization, prefer the `kernel-optimizer` agent directly

## Team Composition

| Member | Agent | Role | Focus |
|--------|-------|------|-------|
| Lead | `shapeshifter` #1 | Coordinator | Task decomposition, strategy selection, result synthesis |
| Member | `shapeshifter` #2-N | Adaptive | Performance analyst, kernel developer, SASS specialist, or benchmark engineer |

### GPU-Specific Role Emergence

When the lead assesses a GPU optimization task, members can assume these roles:

```
Shapeshifter #1 → Coordinator (strategy selection, result integration)
Shapeshifter #2 → Performance Analyst (roofline, occupancy, compute/load ratio, SASS inspection)
Shapeshifter #3 → Kernel Developer (CUDA C++ implementation, K-loop restructuring, cp.async)
Shapeshifter #4 → Benchmark Engineer (correctness verification, timing, comparison tables)
```

For deeper work, an additional role may emerge:
```
Shapeshifter #5 → SASS Specialist (CuAssembler hand-tuning, stall code editing, control code analysis)
```

## Coordination Pattern

Adaptive/emergent, following the opaque-team pattern. The lead manages coordination; internal role assignments are fluid and can shift mid-task.

```
External Interface (opaque boundary)
┌─────────────────────────────────────────────┐
│  Lead: Assess → Decompose → Assign         │
│  ┌─────────────────────────────────────┐    │
│  │ Performance Analyst                  │    │
│  │ → Roofline, occupancy, SASS         │    │
│  │ → Compute/load ratio → strategy     │    │
│  └──────────────┬──────────────────────┘    │
│                  ↓                            │
│  ┌──────────────┴──────────────────────┐    │
│  │ Kernel Developer(s)                  │    │
│  │ → cp.async variant                   │    │
│  │ → LDG-register variant              │    │
│  │ → Alternative algorithm             │    │
│  └──────────────┬──────────────────────┘    │
│                  ↓                            │
│  ┌──────────────┴──────────────────────┐    │
│  │ Benchmark Engineer                   │    │
│  │ → Correctness at 512³               │    │
│  │ → Performance at 4096³              │    │
│  │ → Comparison table across variants  │    │
│  └──────────────┬──────────────────────┘    │
│                  ↓                            │
│  Lead: Integrate → Select winner → Report   │
└─────────────────────────────────────────────┘
```

## Task Decomposition

### Phase 1: Assessment (Lead)
The lead applies `analyze-kernel-bottleneck` principles:
- Classify the kernel(s) on the roofline model
- Calculate compute/load ratio per tile
- Check smem cliff status
- Determine optimization strategies to explore
- Decide team size (2-5 members) and role assignments

### Phase 2: Role Assignment (Lead)
Map strategies to shapeshifters:
- Each member gets the relevant skill context and domain knowledge
- Multiple kernel developers can explore different strategies in parallel
- Roles are documented but can shift if the optimization landscape changes

### Phase 3: Execution (All Members)
Members execute their assigned roles:
- Performance analyst produces bottleneck reports
- Kernel developers write and test variant implementations
- SASS specialist hand-tunes control codes if needed
- Benchmark engineer measures everything with CUDA events, verifies correctness

### Phase 4: Integration (Lead)
The lead integrates results:
- Select the winning kernel variant based on benchmark data
- Produce final performance report with complete hierarchy
- Archive rejected variants with explanations for why they lost
- Update documentation (README, gpu_reflections if applicable)

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: gpu-acceleration
  lead: shapeshifter
  coordination: adaptive
  members:
    - agent: shapeshifter
      role: Lead
      subagent_type: shapeshifter
    - agent: shapeshifter
      role: Member
      subagent_type: shapeshifter
      count: variable
  spawn_config:
    min_members: 2
    max_members: 5
    default_members: 3
  tasks:
    - name: analyze-bottleneck
      assignee: shapeshifter
      description: Run kernel bottleneck analysis using roofline, occupancy, compute/load ratio, and SASS inspection
    - name: implement-optimization
      assignee: shapeshifter
      description: Implement the chosen optimization strategy in CUDA C++
      blocked_by: [analyze-bottleneck]
    - name: benchmark-and-verify
      assignee: shapeshifter
      description: Benchmark all kernel variants, verify correctness, produce comparison report
      blocked_by: [implement-optimization]
    - name: synthesize-results
      assignee: shapeshifter
      description: Select winning variant, produce final report, archive findings
      blocked_by: [benchmark-and-verify]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Multi-Strategy Exploration
```
User: Get maximum INT8 IGEMM throughput on my 3070 Ti
Team: 4 shapeshifters
  #1 (Lead): Assess → memory-bound, low compute/load ratio
  #2 (Analyst): SASS inspection confirms 8 IMMA/tile, S04 stalls
  #3 (Developer): Implements cp.async + LDG double-buffer variants
  #4 (Benchmarker): Measures at 512³ and 4096³, produces comparison
  Result: cp.async pipelined = 20,688 TOPS (+35% vs baseline)
```

### Scenario 2: Pipeline-Wide Optimization
```
User: Optimize this Stable Diffusion UNet inference pipeline
Team: 5 shapeshifters
  #1 (Lead): Profiles full pipeline, identifies conv2d as bottleneck (70% of time)
  #2: Implements implicit GEMM for conv2d (eliminates col buffer)
  #3: Fuses GroupNorm into conv2d epilogue
  #4: Software-pipelines the attention kernels
  #5: End-to-end benchmarking with batch=1 and batch=8
```

### Scenario 3: Smem Cliff Investigation
```
User: My Flash Attention is 3x slower than expected
Team: 3 shapeshifters
  #1 (Lead): Diagnoses → 80 KB smem crosses 50 KB cliff → 1 block/SM
  #2: Implements Bc=64 variant (48 KB, under cliff)
  #3: Benchmarks across seq_len=256..2048
  Result: Bc=64 variant 17-20% faster despite half the tile size
```

## Design Principles

- **Empirical Over Theoretical**: Every optimization recommendation must be backed by a benchmark
- **The Four Laws**: Feed Tensor Cores, read each byte once, fill warp schedulers, respect smem cliff
- **Shorter Is Faster**: On GA104, shorter inner loops beat higher per-warp density at 8 warps/SM
- **Measure Twice, Optimize Once**: Always establish baseline before optimizing
- **Opacity**: External interface sees unified results, not internal role shuffling

## Limitations

- **Generalist Depth**: Shapeshifters playing GPU specialist roles are less deep than a dedicated kernel-optimizer agent for complex SASS hand-tuning
- **Architecture Specificity**: Empirical knowledge anchored to GA104/Ampere; other architectures need fresh empirical data
- **Single-GPU Scope**: No multi-GPU, NVLink, or distributed optimization strategies
- **Coordination Overhead**: Team overhead is not justified for simple single-kernel optimizations — use kernel-optimizer agent directly
- **No Profiler Replacement**: Does not replace Nsight Compute for sampling-based profiling

## See Also

- [kernel-optimizer](../agents/kernel-optimizer.md) — Single-agent alternative for focused kernel optimization
- [opaque-team](opaque-team.md) — The base pattern this team extends
- [physical-computing](physical-computing.md) — Related team for digital logic and electromagnetic design
- [shapeshifter](../agents/shapeshifter.md) — The agent type that composes this team
- [Skills Library](../skills/) — Full catalog including `analyze-kernel-bottleneck` and `pipeline-gpu-kernel`

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-03-29
