---
title: "Edge Computing Deployment"
description: "Deploy ML models to edge devices using Google AI Edge Gallery, Gemma 4, TFLite, and ONNX with quantization and hardware acceleration"
category: workflow
agents: [edge-ai-engineer, mlops-engineer]
teams: []
skills: [deploy-edge-ai-model, deploy-ml-model-serving, register-ml-model, monitor-model-drift]
---

# Edge Computing Deployment

This guide covers deploying machine learning models to edge devices -- smartphones, IoT devices, and embedded systems -- where inference runs locally without cloud connectivity. It focuses on Google AI Edge Gallery for LLM deployment (Gemma 4), TensorFlow Lite and ONNX Runtime for model optimization, and hardware-accelerated inference via GPU, NPU, and DSP delegates.

## When to Use This Guide

- You need on-device AI inference for privacy, latency, or offline requirements
- You want to deploy Gemma 4 or other small LLMs to Android/iOS devices
- You need to convert and quantize models for resource-constrained hardware
- You are building a mobile app with embedded AI capabilities
- You want to evaluate cloud vs edge trade-offs for your ML workload

## Prerequisites

- Trained model (TensorFlow SavedModel, PyTorch, ONNX, or Hugging Face checkpoint)
- Target device specifications (RAM, storage, compute capabilities)
- Android SDK (for Android targets) or Xcode (for iOS targets)
- TensorFlow >= 2.15 or ONNX Runtime >= 1.17 for model conversion
- ADB access to target device for benchmarking

## Workflow Overview

The edge deployment workflow involves the **edge-ai-engineer** agent as primary executor and **mlops-engineer** for model registry and drift monitoring:

```
1. Assess model suitability    (edge-ai-engineer)
2. Choose deployment path       (edge-ai-engineer)
3. Convert and quantize model   (edge-ai-engineer + deploy-edge-ai-model)
4. Configure hardware delegates (edge-ai-engineer)
5. Benchmark on target device   (edge-ai-engineer)
6. Package into application     (edge-ai-engineer)
7. Monitor fleet performance    (mlops-engineer + monitor-model-drift)
```

## Choosing a Deployment Path

### Path A: LLM via Google AI Edge Gallery

Best for deploying conversational AI (Gemma 4, Phi, Llama) to Android devices.

**When to choose**: You need a chat/instruction-following model on-device, your target devices have 4+ GB RAM, and you want a turnkey deployment solution.

```
Invoke: edge-ai-engineer

Prompt: Deploy Gemma 4 2B to Android via AI Edge Gallery.
        Target: phones with 4GB+ RAM.
        Requirements: streaming response, GPU acceleration, offline capable.
```

The agent will:
1. Configure AI Edge Gallery with the Gemma 4 2B IT INT4 model
2. Set up the GPU delegate for FP16 inference
3. Implement model download with progress tracking and caching
4. Benchmark tokens/second on representative devices
5. Create the Android integration code

**Gemma 4 model selection guide:**

| Model | Size (INT4) | Min RAM | Tokens/sec (flagship) | Best For |
|-------|------------|---------|----------------------|----------|
| Gemma 4 1B IT | ~700 MB | 3 GB | 30-50 | Simple Q&A, classification |
| Gemma 4 2B IT | ~1.4 GB | 4 GB | 15-30 | Conversation, summarization |
| Gemma 4 4B IT | ~2.5 GB | 6 GB | 8-15 | Complex reasoning, coding |

### Path B: TFLite for Vision/Audio/NLP Tasks

Best for task-specific models (image classification, object detection, text embedding).

**When to choose**: You have a trained task-specific model, need sub-100ms latency, and want maximum device compatibility.

```
Invoke: edge-ai-engineer

Prompt: Convert our MobileNetV3 classifier to TFLite with INT8 quantization.
        Target: Android devices with 2GB+ RAM.
        Latency budget: <50ms per inference.
```

### Path C: ONNX Runtime Mobile

Best for PyTorch models or cross-platform deployment (Android + iOS + Linux).

**When to choose**: Your model is in PyTorch, you need a single format for multiple platforms, or you need specific ONNX operator support.

```
Invoke: edge-ai-engineer

Prompt: Optimize our PyTorch text classifier for mobile using ONNX Runtime.
        Targets: Android and iOS.
        Model size budget: <50MB.
```

## Quantization Strategy

Quantization reduces model size and inference latency at the cost of some accuracy. Choose based on your accuracy tolerance and device constraints:

| Method | Size Reduction | Accuracy Impact | Calibration Data | Best For |
|--------|---------------|-----------------|------------------|----------|
| Dynamic range | 2-3x | Minimal | No | Quick deployment, NLP models |
| Float16 | 2x | Negligible | No | GPU-only inference |
| INT8 (static) | 3-4x | Low (< 1%) | Yes (100-500 samples) | Vision models, production |
| INT4 | 4-8x | Moderate (1-3%) | Yes | LLMs on constrained devices |

```
Invoke: edge-ai-engineer

Prompt: Compare INT8 vs INT4 quantization for our model.
        Evaluate accuracy on our test set and latency on a Pixel 8.
        Provide a recommendation with the accuracy/speed trade-off.
```

## Hardware Acceleration

The edge-ai-engineer selects the optimal hardware delegate for each target device:

- **GPU delegate**: Best throughput for large models. Works on most Android/iOS devices with OpenCL or Metal
- **NNAPI delegate**: Routes to manufacturer NPU/DSP on Android. Best when available but support varies
- **CoreML delegate**: Apple Neural Engine on iOS. Excellent for iPhones with A14+ or M-series chips
- **XNNPACK**: Optimized CPU fallback. Universal compatibility, good for small models

Always implement a fallback chain: NPU/GPU -> XNNPACK (CPU). Never assume a specific delegate is available.

## Cloud-Edge Hybrid Pattern

For models too large for edge or tasks requiring high accuracy, use a hybrid approach:

```
1. Edge model handles common/simple queries (fast, offline capable)
2. Cloud model handles complex queries (accurate, needs connectivity)
3. Router decides based on query complexity and connectivity
```

```
Invoke: edge-ai-engineer

Prompt: Design a cloud-edge hybrid strategy for our customer support bot.
        Edge: Gemma 4 2B for FAQ and simple queries.
        Cloud: Full model via API for complex issues.
        Implement connectivity-aware routing.
```

The **mlops-engineer** monitors both paths and tracks accuracy differences between edge and cloud inference.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Model conversion fails with unsupported op | TFLite doesn't support all TF/PyTorch ops | Replace op with TFLite-compatible alternative, or use `allow_custom_ops` |
| GPU delegate crashes on launch | Device GPU driver incompatible | Fall back to XNNPACK CPU; check device OpenCL version |
| High latency despite GPU delegate | Model ops not GPU-compatible, falling back per-op | Check delegate logs for op fallbacks; restructure model |
| Out of memory on device | Model + runtime exceeds available RAM | Use more aggressive quantization; implement model memory mapping |
| Gemma 4 produces low-quality responses | INT4 quantization degrades complex reasoning | Use 4B variant, increase temperature, or route complex queries to cloud |
| Inference slows after extended use | Thermal throttling on device | Implement duty cycling; add cooldown periods between batches |
| NNAPI returns different results than CPU | NNAPI delegate numerical precision differs | Increase accuracy tolerance; validate outputs against reference |

## Related Resources

- [Edge AI Engineer](../agents/edge-ai-engineer.md) -- Primary agent for edge deployment
- [MLOps Engineer](../agents/mlops-engineer.md) -- Model registry and drift monitoring
- [deploy-edge-ai-model](../skills/deploy-edge-ai-model/SKILL.md) -- Core edge deployment skill
- [deploy-ml-model-serving](../skills/deploy-ml-model-serving/SKILL.md) -- Cloud serving counterpart
- [monitor-model-drift](../skills/monitor-model-drift/SKILL.md) -- Fleet-wide quality monitoring
