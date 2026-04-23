---
name: deploy-edge-ai-model
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Deploy machine learning models to edge devices using Google AI Edge Gallery,
  TensorFlow Lite, ONNX Runtime, and MediaPipe. Covers model quantization
  (INT8/INT4), on-device inference with Gemma 4 models, Android/iOS deployment
  via AI Edge Gallery, hardware delegate selection (GPU/NPU/DSP), and
  performance benchmarking on constrained devices. Use when deploying models
  to mobile phones, IoT devices, or embedded systems where cloud inference
  is impractical due to latency, cost, or connectivity constraints.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: edge-computing
  complexity: advanced
  language: multi
  tags: edge-ai, google-ai-edge, gemma, tflite, onnx, quantization, on-device
---

# 部署邊緣 AI 模型

> 詳例見 [Extended Examples](references/EXAMPLES.md)。

部署 ML 模型至邊緣裝置，優化推理、硬件加速、本地模型管理。

## 用

- LLM（Gemma 4、Phi、Llama）→移動裝置 via AI Edge Gallery
- 模型→TFLite/ONNX 本地推理
- 量化 INT8/INT4 減內存+提速
- 構 Android/iOS 本地 AI 應用
- 選硬件代理（GPU、NPU、DSP、Hexagon、CoreML）
- 測目標設備時延+內存
- 部署 MediaPipe 任務（視、文、音）

## 入

- **必**：訓好模型（SavedModel、PyTorch、ONNX、Hugging Face 檢查點）
- **必**：目標平台（Android、iOS、嵌入 Linux、瀏覽器）
- **必**：設備限（RAM、存儲、算力）
- **可**：校準數據集
- **可**：AI Edge Gallery 配
- **可**：硬件代理偏好

## 法

### 一：評模型堪邊緣

察模大小、時延要求、目標設備力。

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

邊緣部署決策矩陣：

| Model Size | Device RAM | Recommended Action |
|-----------|-----------|-------------------|
| < 50 MB | 2+ GB | Direct TFLite conversion |
| 50-500 MB | 4+ GB | INT8 quantization + TFLite |
| 500 MB-2 GB | 6+ GB | INT4 quantization + AI Edge Gallery |
| 2-4 GB | 8+ GB | Gemma 4 via AI Edge Gallery with INT4 |
| > 4 GB | 12+ GB | Weight streaming or cloud-edge hybrid |

**得：** 評估畢，大小+RAM 比計，量化建議生。

**敗：** 驗 SavedModel 路徑（`ls saved_model/`），查 TF 裝（`python -c "import tensorflow"`），確磁盤足，驗格式可支。

### 二：以 Google AI Edge Gallery 部署 LLM

部 Gemma 4 等至 Android。

```bash
# Clone AI Edge Gallery
git clone https://github.com/nickoala/ai-edge-gallery.git
cd ai-edge-gallery

# Build the Android app
./gradlew assembleDebug

# Install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

配 Gemma 4 模型：

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

以 LLM Inference API 程式化本地推理：

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

**得：** Gallery 構+裝成，Gemma 4 下載至設備，本地推理生連貫應答，GPU 代理啟。

**敗：** 查 Android SDK ≥ 26（`adb shell getprop ro.build.version.sdk`），驗存儲足，確 GPU 代理可支（`adb logcat | grep -i delegate`），查 HF 訪問權，驗 ADB 連（`adb devices`）。

### 三：TFLite 轉+量化

標模→TFLite+訓後量化。

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

ONNX Runtime 量化替代：

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

**得：** TFLite 模生於指定路，INT8 縮 2-4x，精度失 1-2% 內，ONNX 量化有效。

**敗：** 查 TF ≥ 2.15，驗代表數據集入形匹，確所有 op 可支（`converter.allow_custom_ops = True` 備），查 ONNX opset 相容。

### 四：配硬件代理

擇配目標設備之硬件加速。

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

代理擇指南：

| Device | Best Delegate | Fallback | Notes |
|--------|--------------|----------|-------|
| Android (Qualcomm) | NNAPI -> Hexagon DSP | GPU -> XNNPACK | Check `nnapi_accelerator_name` |
| Android (MediaTek) | NNAPI -> APU | GPU -> XNNPACK | Dimensity chips have dedicated APU |
| Android (Samsung) | NNAPI -> NPU | GPU -> XNNPACK | Exynos NPU via NNAPI |
| iOS | CoreML delegate | Metal GPU | Use `coreml_delegate` for ANE |
| Linux embedded | GPU (if available) | XNNPACK | RPi uses XNNPACK CPU |
| Browser | WebGL / WebGPU | WASM SIMD | Via TensorFlow.js |

**得：** 代理載無錯，推理於目標加速器跑，時延較 CPU-only 快 2-10x。

**敗：** 驗代理庫存於設備，查設備支持（`adb shell cat /proc/cpuinfo`），GPU/NPU 不可用→退 XNNPACK，查 OpenCL 支持，驗 NNAPI 版本（`adb shell getprop ro.android.ndk.version`）。

### 五：測本地性能

測目標設備推理時延、內存、能耗。

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

Python 測：

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

**得：** 測生時延百分位、內存、吞吐；視覺模型 GPU 代理較 CPU 快 2-5x；Gemma 4 2B 旗艦機達 10-30 tokens/sec。

**敗：** 確測二進制匹設備架構（arm64-v8a），驗模型推至設備（`adb shell ls /data/local/tmp/`），查存儲足，殺背景應用減內存壓，驗熱節流未啟（`adb shell cat /sys/class/thermal/thermal_zone*/temp`）。

### 六：打包生產部署

構終移動應用，含內嵌或可下載模型。

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

模型下載+緩存策略：

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

**得：** Android 應用以 MediaPipe 依賴構，首啟載模型，推理於時延預算內，首下後緩存，不支設備優雅退。

**敗：** 查 `build.gradle` minSdk ≥ 26，驗 MediaPipe 版本，確模檔未損（查 SHA256），驗存儲足，查 ProGuard 規則保 MediaPipe 類，測多級設備。

## 驗

- [ ] 模型轉 TFLite/ONNX 無 op 相容錯
- [ ] 量化精度於可容忍內（< 2% 劣化）
- [ ] 硬件代理載並加速
- [ ] 測時延達目標（視覺 < 100ms，LLM < 50ms/token）
- [ ] 內存於設備預算內
- [ ] AI Edge Gallery 成載跑 Gemma 4
- [ ] 本地 LLM 生連貫應答
- [ ] 應用處模下載、緩存、更新
- [ ] 不支設備優雅退
- [ ] 電耗於用例可容範內

## 忌

- **TFLite op 不支**：自定義 op 轉失→`converter.allow_custom_ops = True` 或替，查相容表
- **量化精度失**：INT4 敏感任務劣→混精、代表數據校準、邊緣專測
- **代理初始化失敗**：GPU 代理舊機崩→常備 CPU 退，載前查相容
- **設備內存壓**：模+應超 RAM→用 mmap 模、卸載、批 1
- **熱節流**：續推過熱→工作週期、降頻、監熱區
- **模下載大**：蜂窩大模→限 WiFi、續傳、漸進載
- **版本碎片**：此機行彼不行→代表機陣測、NNAPI 版檢、維相容庫

## 參

- `deploy-ml-model-serving`
- `monitor-model-drift`
- `register-ml-model`
- `create-dockerfile`
- `create-multistage-dockerfile`
