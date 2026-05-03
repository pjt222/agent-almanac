---
name: deploy-edge-ai-model
description: >
  使用 Google AI Edge Gallery、TensorFlow Lite、ONNX Runtime 和 MediaPipe
  将机器学习模型部署到边缘设备。涵盖模型量化（INT8/INT4）、使用 Gemma 4
  模型的设备端推理、通过 AI Edge Gallery 进行 Android/iOS 部署、硬件代理
  选择（GPU/NPU/DSP），以及在受限设备上的性能基准测试。在因延迟、成本或
  连接性约束使云推理不切实际时，将模型部署到手机、IoT 设备或嵌入式系统时使用。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: edge-computing
  complexity: advanced
  language: multi
  tags: edge-ai, google-ai-edge, gemma, tflite, onnx, quantization, on-device
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 部署边缘 AI 模型

> 完整的配置文件、量化脚本和基准测试模板见 [扩展示例](references/EXAMPLES.md)。

将 ML 模型部署到边缘设备，包括优化推理、硬件加速和设备端模型管理。

## 适用场景

- 通过 Google AI Edge Gallery 将 LLM（Gemma 4、Phi、Llama）部署到移动设备
- 将模型转换为 TensorFlow Lite 或 ONNX 以进行设备端推理
- 将模型量化为 INT8/INT4 以减少内存和加快推理
- 构建具有本地 AI 能力的 Android/iOS 应用
- 选择硬件代理（GPU、NPU、DSP、Hexagon、CoreML）
- 在目标设备上对推理延迟和内存进行基准测试
- 将 MediaPipe 任务（视觉、文本、音频）部署到移动或嵌入式平台

## 输入

- **必需**：训练好的模型（SavedModel、PyTorch、ONNX 或 Hugging Face 检查点）
- **必需**：目标平台（Android、iOS、Linux 嵌入式、浏览器）
- **必需**：目标设备约束（RAM、存储、计算能力）
- **可选**：用于训练后量化的校准数据集
- **可选**：LLM 部署的 Google AI Edge Gallery 配置
- **可选**：硬件代理偏好（GPU、NPU、仅 CPU）

## 步骤

### 第 1 步：评估边缘部署模型

评估模型大小、延迟要求和目标设备能力。

```python
# assess_model.py
import os
import tensorflow as tf

def assess_model_for_edge(saved_model_path, target_ram_mb=4096):
    """Evaluate whether a model is suitable for edge deployment."""
    model = tf.saved_model.load(saved_model_path)

    # Check model size on disk
    model_size_mb = sum(
        os.path.getsize(os.path.join(dp, f))
        for dp, _, filenames in os.walk(saved_model_path)
        for f in filenames
    ) / (1024 * 1024)

    print(f"Model size: {model_size_mb:.1f} MB")
    print(f"Target RAM: {target_ram_mb} MB")
    print(f"Size/RAM ratio: {model_size_mb / target_ram_mb:.2%}")

    if model_size_mb > target_ram_mb * 0.25:
        print("WARNING: Model exceeds 25% of device RAM - quantization recommended")
        return False
    return True
```

边缘部署决策矩阵：

| 模型大小 | 设备 RAM | 推荐操作 |
|-----------|-----------|-------------------|
| < 50 MB | 2+ GB | 直接 TFLite 转换 |
| 50-500 MB | 4+ GB | INT8 量化 + TFLite |
| 500 MB-2 GB | 6+ GB | INT4 量化 + AI Edge Gallery |
| 2-4 GB | 8+ GB | 通过 AI Edge Gallery 用 INT4 部署 Gemma 4 |
| > 4 GB | 12+ GB | 权重流式或云-边混合 |

**预期结果：** 完成模型评估，计算大小和 RAM 比例，根据设备约束生成量化建议。

**失败处理：** 验证 SavedModel 路径有效（`ls saved_model/`）、检查 TensorFlow 安装（`python -c "import tensorflow"`）、确保有足够磁盘空间加载模型、验证模型格式受支持。

### 第 2 步：通过 Google AI Edge Gallery 部署 LLM

使用 Google AI Edge Gallery 将 Gemma 4 和其他 LLM 部署到 Android 设备。

```bash
# Clone AI Edge Gallery
git clone https://github.com/nickoala/ai-edge-gallery.git
cd ai-edge-gallery

# Build the Android app
./gradlew assembleDebug

# Install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

为 AI Edge Gallery 配置 Gemma 4 模型：

```json
{
  "models": [
    {
      "name": "Gemma 4 2B IT",
      "url": "https://huggingface.co/google/gemma-4-2b-it-gpu-int4",
      "format": "tflite",
      "backend": "gpu",
      "config": {
        "max_tokens": 1024,
        "temperature": 0.7,
        "top_k": 40,
        "top_p": 0.95
      }
    },
    {
      "name": "Gemma 4 4B IT",
      "url": "https://huggingface.co/google/gemma-4-4b-it-gpu-int4",
      "format": "tflite",
      "backend": "gpu",
      "config": {
        "max_tokens": 2048,
        "temperature": 0.7
      }
    }
  ]
}
```

使用 LLM Inference API 进行编程化设备端推理：

```python
# gemma_edge_inference.py
from mediapipe.tasks.genai import llm_inference

# Configure the LLM
options = llm_inference.LlmInferenceOptions(
    model_path="/data/local/tmp/gemma-4-2b-it-int4.tflite",
    max_tokens=512,
    temperature=0.7,
    top_k=40,
    supported_lora_ranks=[4, 8, 16]  # Optional LoRA support
)

# Create inference engine
engine = llm_inference.LlmInference(options=options)

# Run inference
response = engine.generate_response("Explain edge computing in one sentence.")
print(response)

# Streaming inference
for chunk in engine.generate_response_async("List three benefits of on-device AI."):
    print(chunk, end="", flush=True)
```

**预期结果：** AI Edge Gallery 应用成功构建并安装，Gemma 4 模型下载到设备，设备端推理产出连贯响应，GPU 代理激活以加速。

**失败处理：** 检查 Android SDK 版本 >= 26（`adb shell getprop ro.build.version.sdk`）、验证设备有足够存储下载模型、确保 GPU 代理受支持（`adb logcat | grep -i delegate`）、检查 Hugging Face 模型访问权限、验证 ADB 连接（`adb devices`）。

### 第 3 步：使用 TFLite 转换并量化模型

将标准模型转换为 TFLite 格式，并进行训练后量化。

```python
# convert_tflite.py
import os
import tensorflow as tf
import numpy as np

def convert_to_tflite(saved_model_path, output_path, quantization="dynamic"):
    """Convert SavedModel to TFLite with quantization."""
    converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_path)

    if quantization == "dynamic":
        converter.optimizations = [tf.lite.Optimize.DEFAULT]

    elif quantization == "int8":
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_ops = [
            tf.lite.OpsSet.TFLITE_BUILTINS_INT8
        ]
        converter.inference_input_type = tf.int8
        converter.inference_output_type = tf.int8

        # Representative dataset for calibration
        def representative_dataset():
            for _ in range(100):
                yield [np.random.randn(1, 224, 224, 3).astype(np.float32)]
        converter.representative_dataset = representative_dataset

    elif quantization == "float16":
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]

    tflite_model = converter.convert()

    with open(output_path, "wb") as f:
        f.write(tflite_model)

    original_size = sum(
        os.path.getsize(os.path.join(dp, f))
        for dp, _, filenames in os.walk(saved_model_path)
        for f in filenames
    ) / (1024 * 1024)
    quantized_size = len(tflite_model) / (1024 * 1024)
    print(f"Original: {original_size:.1f} MB -> Quantized: {quantized_size:.1f} MB")
    print(f"Compression ratio: {original_size / quantized_size:.1f}x")

# Usage
convert_to_tflite("saved_model/", "model_int8.tflite", quantization="int8")
```

ONNX Runtime 量化替代方案：

```python
# quantize_onnx.py
from onnxruntime.quantization import quantize_dynamic, quantize_static, QuantType

# Dynamic quantization (no calibration data needed)
quantize_dynamic(
    model_input="model.onnx",
    model_output="model_int8.onnx",
    weight_type=QuantType.QInt8
)

# Static quantization (better accuracy, needs calibration)
# ... (see EXAMPLES.md for complete calibration workflow)
```

**预期结果：** 在指定路径生成 TFLite 模型，使用 INT8 时模型大小缩小 2-4 倍，推理精度在原始的 1-2% 以内，ONNX 量化产出有效模型。

**失败处理：** 检查 TensorFlow 版本 >= 2.15 以获得最新量化支持、验证代表性数据集匹配模型输入形状、确保所有 op 在 TFLite 中受支持（`converter.allow_custom_ops = True` 作为后备）、检查 ONNX opset 版本兼容性。

### 第 4 步：配置硬件代理

为目标设备选择并配置硬件加速代理。

```python
# configure_delegates.py
import tensorflow as tf

def create_interpreter_with_delegate(model_path, delegate="gpu"):
    """Create TFLite interpreter with hardware delegate."""

    if delegate == "gpu":
        delegate_obj = tf.lite.experimental.load_delegate(
            "libtensorflowlite_gpu_delegate.so",
            options={"precision": "fp16", "allow_quantized_models": "true"}
        )
    elif delegate == "nnapi":
        # Android Neural Networks API - routes to NPU/DSP
        delegate_obj = tf.lite.experimental.load_delegate(
            "libtensorflowlite_nnapi_delegate.so"
        )
    elif delegate == "xnnpack":
        # Optimized CPU inference
        delegate_obj = None  # XNNPACK is default in TFLite

    interpreter = tf.lite.Interpreter(
        model_path=model_path,
        experimental_delegates=[delegate_obj] if delegate_obj else None,
        num_threads=4
    )
    interpreter.allocate_tensors()
    return interpreter
```

代理选择指南：

| 设备 | 最佳代理 | 后备 | 备注 |
|--------|--------------|----------|-------|
| Android (Qualcomm) | NNAPI -> Hexagon DSP | GPU -> XNNPACK | 检查 `nnapi_accelerator_name` |
| Android (MediaTek) | NNAPI -> APU | GPU -> XNNPACK | Dimensity 芯片有专用 APU |
| Android (Samsung) | NNAPI -> NPU | GPU -> XNNPACK | Exynos NPU 通过 NNAPI |
| iOS | CoreML 代理 | Metal GPU | 使用 `coreml_delegate` 用于 ANE |
| Linux 嵌入式 | GPU（如有） | XNNPACK | RPi 使用 XNNPACK CPU |
| 浏览器 | WebGL / WebGPU | WASM SIMD | 通过 TensorFlow.js |

**预期结果：** 代理无错误加载，推理在目标加速器上运行，相比仅 CPU 延迟改善 2-10 倍（取决于模型和设备）。

**失败处理：** 验证设备上代理库存在、检查设备支持请求的代理（`adb shell cat /proc/cpuinfo` 查看 CPU 特性）、若 GPU/NPU 不可用则回退到 XNNPACK、检查 GPU 代理的 OpenCL 支持、验证 NNAPI 版本（`adb shell getprop ro.android.ndk.version`）。

### 第 5 步：基准测试设备端性能

在目标设备上测量推理延迟、内存使用和功耗。

```bash
# Use TFLite benchmark tool
adb push model_int8.tflite /data/local/tmp/

# CPU benchmark
adb shell /data/local/tmp/benchmark_model \
  --graph=/data/local/tmp/model_int8.tflite \
  --num_threads=4 \
  --num_runs=50 \
  --warmup_runs=5

# GPU benchmark
adb shell /data/local/tmp/benchmark_model \
  --graph=/data/local/tmp/model_int8.tflite \
  --use_gpu=true \
  --num_runs=50

# NNAPI benchmark
adb shell /data/local/tmp/benchmark_model \
  --graph=/data/local/tmp/model_int8.tflite \
  --use_nnapi=true \
  --nnapi_accelerator_name=google-edgetpu \
  --num_runs=50
```

Python 基准测试：

```python
# benchmark_edge.py
import time
import numpy as np
import psutil

def benchmark_inference(interpreter, input_data, num_runs=100):
    """Benchmark TFLite model inference."""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    # Warmup
    for _ in range(10):
        interpreter.set_tensor(input_details[0]["index"], input_data)
        interpreter.invoke()

    # Benchmark
    latencies = []
    mem_before = psutil.Process().memory_info().rss / (1024 * 1024)
    for _ in range(num_runs):
        start = time.perf_counter()
        interpreter.set_tensor(input_details[0]["index"], input_data)
        interpreter.invoke()
        latencies.append((time.perf_counter() - start) * 1000)
    mem_after = psutil.Process().memory_info().rss / (1024 * 1024)

    print(f"Latency (p50): {np.percentile(latencies, 50):.1f} ms")
    print(f"Latency (p95): {np.percentile(latencies, 95):.1f} ms")
    print(f"Latency (p99): {np.percentile(latencies, 99):.1f} ms")
    print(f"Memory delta: {mem_after - mem_before:.1f} MB")
    print(f"Throughput: {1000 / np.mean(latencies):.1f} inferences/sec")
```

**预期结果：** 基准测试产出延迟百分位、内存使用和吞吐量指标；对视觉模型，GPU 代理相比 CPU 显示 2-5 倍加速；Gemma 4 2B 在旗舰手机上达到 10-30 token/s。

**失败处理：** 确保基准二进制匹配设备架构（arm64-v8a）、验证模型推送到设备（`adb shell ls /data/local/tmp/`）、检查设备存储足够、关闭后台应用以减少内存压力、验证未启用热节流（`adb shell cat /sys/class/thermal/thermal_zone*/temp`）。

### 第 6 步：打包用于生产部署

构建带有嵌入或可下载模型的最终移动应用。

```kotlin
// Android: EdgeAIManager.kt
import com.google.mediapipe.tasks.genai.llminference.LlmInference

class EdgeAIManager(private val context: Context) {
    private var llmInference: LlmInference? = null

    fun initialize(modelPath: String) {
        val options = LlmInference.LlmInferenceOptions.builder()
            .setModelPath(modelPath)
            .setMaxTokens(512)
            .setTemperature(0.7f)
            .setTopK(40)
            .setResultListener { result, done ->
                // Handle streaming tokens
                onTokenReceived(result, done)
            }
            .build()

        llmInference = LlmInference.createFromOptions(context, options)
    }

    fun generateResponse(prompt: String): String {
        return llmInference?.generateResponse(prompt)
            ?: throw IllegalStateException("Model not initialized")
    }

    fun release() {
        llmInference?.close()
        llmInference = null
    }
}
```

模型下载和缓存策略：

```kotlin
// ModelDownloader.kt
class ModelDownloader(private val context: Context) {
    private val modelDir = File(context.filesDir, "models")

    suspend fun ensureModel(modelName: String, url: String): File {
        val modelFile = File(modelDir, modelName)
        if (modelFile.exists()) return modelFile

        modelDir.mkdirs()
        // Download with progress tracking
        // ... (see EXAMPLES.md for complete implementation)
        return modelFile
    }
}
```

**预期结果：** Android 应用与 MediaPipe 依赖一起构建，模型在首次启动时加载，推理在延迟预算内运行，模型在首次下载后缓存，设备不受支持时优雅回退。

**失败处理：** 检查 `build.gradle` 中 minSdk >= 26、验证 MediaPipe 依赖版本、确保模型文件未损坏（检查 SHA256）、验证设备存储足够、检查 ProGuard 规则保留 MediaPipe 类、在多设备等级上测试。

## 验证清单

- [ ] 模型转换为 TFLite/ONNX 时无 op 兼容性错误
- [ ] 量化模型精度在可接受容差内（< 2% 退化）
- [ ] 硬件代理加载并加速推理
- [ ] 基准延迟达到目标（如视觉 < 100ms，LLM < 50ms/token）
- [ ] 内存使用保持在设备预算内
- [ ] AI Edge Gallery 成功加载并运行 Gemma 4 模型
- [ ] 设备端 LLM 生成连贯响应
- [ ] 应用处理模型下载、缓存和更新
- [ ] 在不受支持的设备上优雅退化
- [ ] 电池影响在目标用例可接受范围内

## 常见问题

- **TFLite 中不支持的 op**：自定义 op 转换失败 —— 使用 `converter.allow_custom_ops = True` 或替换为支持的替代方案、检查 op 兼容性列表
- **量化精度损失**：INT4 在敏感任务上降低质量 —— 使用混合精度、用代表性数据校准、在边缘特定测试集上评估
- **代理初始化失败**：GPU 代理在旧设备上崩溃 —— 始终实现 CPU 后备、加载前检查代理兼容性
- **设备内存压力**：模型 + 应用超出可用 RAM —— 使用内存映射模型、实现模型卸载、将批大小减至 1
- **热节流**：持续推理导致设备过热 —— 实现占空比、降低推理频率、监视热区
- **模型下载大小**：通过蜂窝数据下载大模型 —— 提供仅 Wi-Fi 下载、实现可恢复下载、使用渐进式模型加载
- **版本碎片化**：模型在某些设备上工作但在其他设备上不工作 —— 在代表性设备矩阵上测试、使用 NNAPI 版本检查、维护设备兼容性数据库

## 相关技能

- `deploy-ml-model-serving` —— 基于云的模型服务（边缘的补充）
- `monitor-model-drift` —— 监视模型质量随时间变化
- `register-ml-model` —— 在边缘部署前注册模型
- `create-dockerfile` —— 容器化边缘模型转换流水线
- `create-multistage-dockerfile` —— 模型转换流水线的多阶段构建
