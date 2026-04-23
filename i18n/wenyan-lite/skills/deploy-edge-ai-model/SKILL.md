---
name: deploy-edge-ai-model
locale: wenyan-lite
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

# Deploy Edge AI Model

> 完整配置文件、量化腳本與基準模板，見 [Extended Examples](references/EXAMPLES.md)。

部署 ML 模型於邊緣設備，以優化推理、硬體加速及設備上模型管理。

## 適用時機

- 透過 Google AI Edge Gallery 部署 LLM（Gemma 4、Phi、Llama）於移動裝置
- 轉換模型為 TensorFlow Lite 或 ONNX 以於設備上推理
- 量化模型至 INT8/INT4 以減記憶體佔用、加速推理
- 建具本地 AI 能力之 Android/iOS 應用
- 擇硬體代理（GPU、NPU、DSP、Hexagon、CoreML）
- 於目標設備基準測推理延遲與記憶體
- 部署 MediaPipe 任務（視覺、文字、音訊）於移動或嵌入式平台

## 輸入

- **必需**：已訓練模型（SavedModel、PyTorch、ONNX 或 Hugging Face checkpoint）
- **必需**：目標平台（Android、iOS、Linux 嵌入式、瀏覽器）
- **必需**：目標設備約束（RAM、儲存、計算能力）
- **可選**：訓練後量化之校準資料集
- **可選**：Google AI Edge Gallery 之 LLM 部署配置
- **可選**：硬體代理偏好（GPU、NPU、僅 CPU）

## 步驟

### 步驟一：評估模型是否宜邊緣部署

評模型大小、延遲需求與目標設備能力。

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

| 模型大小 | 設備 RAM | 建議行動 |
|-----------|-----------|-------------------|
| < 50 MB | 2+ GB | 直接 TFLite 轉換 |
| 50-500 MB | 4+ GB | INT8 量化 + TFLite |
| 500 MB-2 GB | 6+ GB | INT4 量化 + AI Edge Gallery |
| 2-4 GB | 8+ GB | 以 AI Edge Gallery 及 INT4 部署 Gemma 4 |
| > 4 GB | 12+ GB | 權重串流或雲邊混合 |

**預期：** 模型評估完成，算出大小及 RAM 比例，依設備約束生量化建議。

**失敗時：** 驗 SavedModel 路徑有效（`ls saved_model/`），檢 TensorFlow 安裝（`python -c "import tensorflow"`），確保磁碟空間足以載模型，驗模型格式受支援。

### 步驟二：以 Google AI Edge Gallery 部署 LLM

用 Google AI Edge Gallery 將 Gemma 4 及其他 LLM 部署於 Android 裝置。

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

以 LLM Inference API 程式化設備上推理：

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

**預期：** AI Edge Gallery 應用成功建並裝，Gemma 4 模型下載至設備，設備上推理生連貫之回應，GPU 代理啟動以加速。

**失敗時：** 查 Android SDK 版本 >= 26（`adb shell getprop ro.build.version.sdk`），驗設備儲存足以下載模型，確 GPU 代理受支援（`adb logcat | grep -i delegate`），查 Hugging Face 模型存取權限，驗 ADB 連接（`adb devices`）。

### 步驟三：以 TFLite 轉換並量化模型

將標準模型轉為 TFLite 格式並作訓練後量化。

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

**預期：** 於指定路徑生 TFLite 模型，INT8 使模型大小減 2-4 倍，推理準確度於原模型 1-2% 之內，ONNX 量化生有效模型。

**失敗時：** 查 TensorFlow 版本 >= 2.15 以得最新量化支援，驗代表資料集形狀合模型輸入，確所有 op 於 TFLite 受支援（回退用 `converter.allow_custom_ops = True`），查 ONNX opset 版本相容性。

### 步驟四：配硬體代理

為目標設備擇並配硬體加速代理。

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

代理擇選指南：

| 設備 | 最佳代理 | 回退 | 備註 |
|--------|--------------|----------|-------|
| Android (Qualcomm) | NNAPI -> Hexagon DSP | GPU -> XNNPACK | 查 `nnapi_accelerator_name` |
| Android (MediaTek) | NNAPI -> APU | GPU -> XNNPACK | Dimensity 晶片有專用 APU |
| Android (Samsung) | NNAPI -> NPU | GPU -> XNNPACK | Exynos NPU 透過 NNAPI |
| iOS | CoreML delegate | Metal GPU | 用 `coreml_delegate` 取 ANE |
| Linux embedded | GPU（若有） | XNNPACK | RPi 用 XNNPACK CPU |
| Browser | WebGL / WebGPU | WASM SIMD | 透過 TensorFlow.js |

**預期：** 代理載入無錯，推理於目標加速器上執行，延遲較僅用 CPU 改善 2-10 倍（視模型與設備而定）。

**失敗時：** 驗代理程式庫於設備上存在，查設備支援所請之代理（`adb shell cat /proc/cpuinfo` 查 CPU 特性），若 GPU/NPU 不可用則回退至 XNNPACK，查 OpenCL 支援以用 GPU 代理，驗 NNAPI 版本（`adb shell getprop ro.android.ndk.version`）。

### 步驟五：設備上性能基準測試

量目標設備上之推理延遲、記憶體用量與功耗。

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

Python 基準測試：

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

**預期：** 基準生延遲百分位、記憶體用量與吞吐量指標；GPU 代理於視覺模型較 CPU 示 2-5 倍加速；Gemma 4 2B 於旗艦手機達 10-30 token/秒。

**失敗時：** 保基準二進制合設備架構（arm64-v8a），驗模型已推至設備（`adb shell ls /data/local/tmp/`），查設備儲存充足，殺背景應用以減記憶體壓力，驗熱節流未啟（`adb shell cat /sys/class/thermal/thermal_zone*/temp`）。

### 步驟六：為生產部署打包

以嵌入或可下載之模型建最終移動應用。

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

模型下載與快取策略：

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

**預期：** Android 應用以 MediaPipe 依賴建成，模型首次啟動時載入，推理於延遲預算內運行，首次下載後模型已快取，設備不支援時優雅回退。

**失敗時：** 查 `build.gradle` 中 minSdk >= 26，驗 MediaPipe 依賴版本，確模型檔案未損（查 SHA256），驗設備儲存足以容模型，查 ProGuard 規則保留 MediaPipe 類別，於多級設備測之。

## 驗證

- [ ] 模型轉為 TFLite/ONNX 無 op 相容性錯誤
- [ ] 量化後模型準確度於可接受容差內（< 2% 退化）
- [ ] 硬體代理載入並加速推理
- [ ] 基準延遲達標（例如視覺 < 100ms，LLM < 50ms/token）
- [ ] 記憶體用量於設備預算內
- [ ] AI Edge Gallery 成功載入並執行 Gemma 4 模型
- [ ] 設備上 LLM 生連貫之回應
- [ ] 應用處理模型下載、快取與更新
- [ ] 於不支援之設備優雅降級
- [ ] 電池影響於目標使用情境之可接受範圍

## 常見陷阱

- **TFLite 不支援之 op**：自定 op 轉換失敗——用 `converter.allow_custom_ops = True` 或以受支援之替代，查 op 相容性清單
- **量化準確度損失**：INT4 降敏感任務之品質——用混合精度，以代表資料校準，於邊緣特定測試集評估
- **代理初始化失敗**：舊設備上 GPU 代理崩潰——恆實作 CPU 回退，載入前查代理相容性
- **設備記憶體壓力**：模型+應用超過可用 RAM——用記憶體映射模型，實作模型卸載，批次大小減至 1
- **熱節流**：持續推理致設備過熱——實作工作週期，減推理頻率，監熱區域
- **模型下載大小**：於蜂巢式網路下載大模型——提供僅 Wi-Fi 下載，實作可續下載，用漸進式模型載入
- **版本碎片化**：模型於某些設備可用而於另者不可——於代表性設備矩陣測，用 NNAPI 版本檢查，維設備相容性資料庫

## 相關技能

- `deploy-ml-model-serving` - 雲端模型服務（邊緣之補）
- `monitor-model-drift` - 監測模型品質隨時變化
- `register-ml-model` - 邊緣部署前註冊模型
- `create-dockerfile` - 容器化邊緣模型轉換管線
- `create-multistage-dockerfile` - 多階段建置於模型轉換管線
