---
name: deploy-edge-ai-model
locale: wenyan
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

> 詳見 [Extended Examples](references/EXAMPLES.md) 全備之配置文件、量化腳本與基準模板。

部署 ML 模型於邊緣設備，以優化推理、硬件加速、端上模型管理。

## 用時

- 以 Google AI Edge Gallery 將 LLM（Gemma 4、Phi、Llama）部至手機
- 以 TensorFlow Lite 或 ONNX 轉模型供端上推理
- 量化至 INT8/INT4 以減內存速推理
- 建 Android/iOS 應用具端上 AI
- 擇硬件代理（GPU、NPU、DSP、Hexagon、CoreML）
- 測目標設備推理延時與內存
- 部 MediaPipe 任務（視、文、音）至移動或嵌入平臺

## 入

- **必要**：已訓模型（SavedModel、PyTorch、ONNX、Hugging Face 檢查點）
- **必要**：目標平臺（Android、iOS、Linux 嵌入、瀏覽器）
- **必要**：目標設備之約（RAM、存、算力）
- **可選**：訓後量化之校準數據集
- **可選**：Google AI Edge Gallery 之 LLM 部署配置
- **可選**：硬件代理偏好（GPU、NPU、純 CPU）

## 法

### 第一步：察模型可否邊緣部署

量模型大小、延時求、目標設備力。

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

邊緣部署擇矩陣：

| 模型大小 | 設備 RAM | 宜行之事 |
|-----------|-----------|-------------------|
| < 50 MB | 2+ GB | 直轉 TFLite |
| 50-500 MB | 4+ GB | INT8 量化 + TFLite |
| 500 MB-2 GB | 6+ GB | INT4 量化 + AI Edge Gallery |
| 2-4 GB | 8+ GB | Gemma 4 經 AI Edge Gallery 用 INT4 |
| > 4 GB | 12+ GB | 權重流或雲邊合部 |

**得：** 察已畢，大小與 RAM 比已算，依設備約生量化建議。

**敗則：** 驗 SavedModel 路有效（`ls saved_model/`）、察 TensorFlow 已裝（`python -c "import tensorflow"`）、確有足磁空載模型、驗模型格式可支。

### 第二步：經 Google AI Edge Gallery 部 LLM

以 Google AI Edge Gallery 部 Gemma 4 與他 LLM 至 Android。

```bash
# Clone AI Edge Gallery
git clone https://github.com/nickoala/ai-edge-gallery.git
cd ai-edge-gallery

# Build the Android app
./gradlew assembleDebug

# Install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

為 AI Edge Gallery 配 Gemma 4 模型：

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

以 LLM Inference API 行端上推理：

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

**得：** AI Edge Gallery 應用建成並裝妥；Gemma 4 模型下至設備；端上推理生連貫應答；GPU 代理活以加速。

**敗則：** 察 Android SDK 版 >= 26（`adb shell getprop ro.build.version.sdk`）；驗設備有足存下模型；確 GPU 代理可支（`adb logcat | grep -i delegate`）；察 Hugging Face 模型訪問許；驗 ADB 連（`adb devices`）。

### 第三步：以 TFLite 轉模型並量化

將標模型轉至 TFLite 格式，並行訓後量化。

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

**得：** TFLite 模型於指定路生；INT8 減模型大小 2-4 倍；推理之精度與原相差 1-2% 內；ONNX 量化生有效模型。

**敗則：** 察 TensorFlow 版 >= 2.15 以得最新量化支持；驗表數集合模型入形狀；確所有 op 皆 TFLite 可支（退路以 `converter.allow_custom_ops = True`）；察 ONNX opset 版兼容。

### 第四步：配硬件代理

擇與配目標設備之硬件加速代理。

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

代理擇之指南：

| 設備 | 最佳代理 | 退路 | 注 |
|--------|--------------|----------|-------|
| Android (Qualcomm) | NNAPI -> Hexagon DSP | GPU -> XNNPACK | 察 `nnapi_accelerator_name` |
| Android (MediaTek) | NNAPI -> APU | GPU -> XNNPACK | Dimensity 晶片有 APU |
| Android (Samsung) | NNAPI -> NPU | GPU -> XNNPACK | Exynos NPU 經 NNAPI |
| iOS | CoreML delegate | Metal GPU | `coreml_delegate` 接 ANE |
| Linux 嵌入 | GPU（若有） | XNNPACK | RPi 用 XNNPACK CPU |
| 瀏覽器 | WebGL / WebGPU | WASM SIMD | 經 TensorFlow.js |

**得：** 代理無錯載；推理於目標加速器行；延時較純 CPU 改 2-10 倍（依模型與設備）。

**敗則：** 驗代理庫存於設備；察設備支所求代理（`adb shell cat /proc/cpuinfo` 察 CPU 特性）；若 GPU/NPU 無，退至 XNNPACK；察 GPU 代理之 OpenCL 支持；驗 NNAPI 版（`adb shell getprop ro.android.ndk.version`）。

### 第五步：測端上性能

量目標設備之推理延時、內存用、耗電。

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

Python 測基：

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

**得：** 測出延時百分位、內存用、吞吐度；視覺模型 GPU 代理較 CPU 速 2-5 倍；Gemma 4 2B 旗艦手機達 10-30 tokens/秒。

**敗則：** 確測基二進匹設備架構（arm64-v8a）；驗模型已推至設備（`adb shell ls /data/local/tmp/`）；察設備有足存；殺背景應用減內存壓；驗熱節流不活（`adb shell cat /sys/class/thermal/thermal_zone*/temp`）。

### 第六步：封裝以產部署

建終移動應用，內嵌或可下之模型。

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

模型下載與緩存策略：

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

**得：** Android 應用以 MediaPipe 依賴建；模型於首啟載；推理於延時預算內；首下後模型緩存；不支之設備優雅退。

**敗則：** 察 `build.gradle` minSdk >= 26；驗 MediaPipe 依賴版；確模型文件無壞（察 SHA256）；驗設備有足存；察 ProGuard 律保 MediaPipe 類；於多階設備測。

## 驗

- [ ] 模型轉 TFLite/ONNX 無 op 兼容錯
- [ ] 量化模型精度於可容限內（< 2% 衰）
- [ ] 硬件代理載且加速推理
- [ ] 測基延時達標（如視 < 100ms、LLM < 50ms/token）
- [ ] 內存用於設備預算內
- [ ] AI Edge Gallery 成載 Gemma 4 模型
- [ ] 端上 LLM 生連貫應答
- [ ] 應用理模型下、緩、更
- [ ] 不支之設備優雅退
- [ ] 電池衝擊於可容內

## 陷

- **TFLite 不支之 op**：自定 op 轉敗——以 `converter.allow_custom_ops = True` 或替以可支者，察兼容清單
- **量化精度衰**：敏感任務 INT4 質劣——用混精度，以表數據校準，於邊緣測集評
- **代理始化敗**：舊設備 GPU 代理崩——恒行 CPU 退路，載前察代理兼容
- **設備內存壓**：模型+應用超 RAM——用內存映射模型，行模型卸載，批量減至 1
- **熱節流**：久推致設備過熱——行佔空比，降推理頻，察熱區
- **模型下載大**：過蜂窩數據下大模型——唯 Wi-Fi 下，行可續下，用漸進載
- **版散**：某設備可，某不可——於代表設備矩陣測，用 NNAPI 版察，維設備兼容庫

## Related Skills

- `deploy-ml-model-serving` - 雲端模型服（補邊緣之缺）
- `monitor-model-drift` - 久察模型質
- `register-ml-model` - 邊緣部前注冊模型
- `create-dockerfile` - 容器化邊緣模型轉流水
- `create-multistage-dockerfile` - 多階建以轉模型流水
