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

# Deploy Edge AI Model

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files, quantization scripts, and benchmark templates.

Deploy ML models to edge devices with optimized inference, hardware acceleration, and on-device model management.

## When to Use

- Deploying LLMs (Gemma 4, Phi, Llama) to mobile devices via Google AI Edge Gallery
- Converting models to TensorFlow Lite or ONNX for on-device inference
- Quantizing models to INT8/INT4 for reduced memory and faster inference
- Building Android/iOS apps with local AI capabilities
- Selecting hardware delegates (GPU, NPU, DSP, Hexagon, CoreML)
- Benchmarking inference latency and memory on target devices
- Deploying MediaPipe tasks (vision, text, audio) to mobile or embedded platforms

## Inputs

- **Required**: Trained model (SavedModel, PyTorch, ONNX, or Hugging Face checkpoint)
- **Required**: Target platform (Android, iOS, Linux embedded, browser)
- **Required**: Target device constraints (RAM, storage, compute capability)
- **Optional**: Calibration dataset for post-training quantization
- **Optional**: Google AI Edge Gallery configuration for LLM deployment
- **Optional**: Hardware delegate preferences (GPU, NPU, CPU-only)

## Procedure

### Step 1: Evaluate Model for Edge Deployment

Assess model size, latency requirements, and target device capabilities.

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

Edge deployment decision matrix:

| Model Size | Device RAM | Recommended Action |
|-----------|-----------|-------------------|
| < 50 MB | 2+ GB | Direct TFLite conversion |
| 50-500 MB | 4+ GB | INT8 quantization + TFLite |
| 500 MB-2 GB | 6+ GB | INT4 quantization + AI Edge Gallery |
| 2-4 GB | 8+ GB | Gemma 4 via AI Edge Gallery with INT4 |
| > 4 GB | 12+ GB | Weight streaming or cloud-edge hybrid |

**Expected:** Model assessment completes, size and RAM ratios calculated, quantization recommendation generated based on device constraints.

**On failure:** Verify SavedModel path is valid (`ls saved_model/`), check TensorFlow installation (`python -c "import tensorflow"`), ensure sufficient disk space for model loading, verify model format is supported.

### Step 2: Deploy LLMs via Google AI Edge Gallery

Use Google AI Edge Gallery to deploy Gemma 4 and other LLMs to Android devices.

```bash
# Clone AI Edge Gallery
git clone https://github.com/nickoala/ai-edge-gallery.git
cd ai-edge-gallery

# Build the Android app
./gradlew assembleDebug

# Install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Configure Gemma 4 model for AI Edge Gallery:

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

Programmatic on-device inference with LLM Inference API:

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

**Expected:** AI Edge Gallery app builds and installs successfully, Gemma 4 model downloads to device, on-device inference produces coherent responses, GPU delegate activates for acceleration.

**On failure:** Check Android SDK version >= 26 (`adb shell getprop ro.build.version.sdk`), verify device has sufficient storage for model download, ensure GPU delegate is supported (`adb logcat | grep -i delegate`), check Hugging Face model access permissions, verify ADB connection (`adb devices`).

### Step 3: Convert and Quantize Models with TFLite

Convert standard models to TFLite format with post-training quantization.

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

ONNX Runtime quantization alternative:

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

**Expected:** TFLite model generated at specified path, model size reduced by 2-4x with INT8, inference accuracy within 1-2% of original, ONNX quantization produces valid model.

**On failure:** Check TensorFlow version >= 2.15 for latest quantization support, verify representative dataset matches model input shape, ensure all ops are supported in TFLite (`converter.allow_custom_ops = True` as fallback), check ONNX opset version compatibility.

### Step 4: Configure Hardware Delegates

Select and configure hardware acceleration delegates for target devices.

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

Delegate selection guide:

| Device | Best Delegate | Fallback | Notes |
|--------|--------------|----------|-------|
| Android (Qualcomm) | NNAPI -> Hexagon DSP | GPU -> XNNPACK | Check `nnapi_accelerator_name` |
| Android (MediaTek) | NNAPI -> APU | GPU -> XNNPACK | Dimensity chips have dedicated APU |
| Android (Samsung) | NNAPI -> NPU | GPU -> XNNPACK | Exynos NPU via NNAPI |
| iOS | CoreML delegate | Metal GPU | Use `coreml_delegate` for ANE |
| Linux embedded | GPU (if available) | XNNPACK | RPi uses XNNPACK CPU |
| Browser | WebGL / WebGPU | WASM SIMD | Via TensorFlow.js |

**Expected:** Delegate loads without errors, inference runs on target accelerator, latency improves 2-10x over CPU-only depending on model and device.

**On failure:** Verify delegate library exists on device, check device supports requested delegate (`adb shell cat /proc/cpuinfo` for CPU features), fall back to XNNPACK if GPU/NPU unavailable, check OpenCL support for GPU delegate, verify NNAPI version (`adb shell getprop ro.android.ndk.version`).

### Step 5: Benchmark On-Device Performance

Measure inference latency, memory usage, and power consumption on target devices.

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

Python benchmarking:

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

**Expected:** Benchmark produces latency percentiles, memory usage, and throughput metrics; GPU delegate shows 2-5x speedup over CPU for vision models; Gemma 4 2B achieves 10-30 tokens/sec on flagship phones.

**On failure:** Ensure benchmark binary matches device architecture (arm64-v8a), verify model pushed to device (`adb shell ls /data/local/tmp/`), check sufficient device storage, kill background apps to reduce memory pressure, verify thermal throttling not active (`adb shell cat /sys/class/thermal/thermal_zone*/temp`).

### Step 6: Package for Production Deployment

Build the final mobile application with embedded or downloadable model.

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

Model download and caching strategy:

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

**Expected:** Android app builds with MediaPipe dependency, model loads on first launch, inference runs within latency budget, model cached after first download, graceful fallback when device is unsupported.

**On failure:** Check minSdk >= 26 in `build.gradle`, verify MediaPipe dependency version, ensure model file not corrupted (check SHA256), verify sufficient device storage for model, check ProGuard rules preserve MediaPipe classes, test on multiple device tiers.

## Validation

- [ ] Model converts to TFLite/ONNX without op compatibility errors
- [ ] Quantized model accuracy within acceptable tolerance (< 2% degradation)
- [ ] Hardware delegate loads and accelerates inference
- [ ] Benchmark latency meets target (e.g., < 100ms for vision, < 50ms/token for LLM)
- [ ] Memory usage stays within device budget
- [ ] AI Edge Gallery successfully loads and runs Gemma 4 model
- [ ] On-device LLM generates coherent responses
- [ ] Application handles model download, caching, and updates
- [ ] Graceful degradation on unsupported devices
- [ ] Battery impact within acceptable range for target use case

## Common Pitfalls

- **Unsupported ops in TFLite**: Custom ops fail conversion - use `converter.allow_custom_ops = True` or replace with supported alternatives, check op compatibility list
- **Quantization accuracy loss**: INT4 degrades quality for sensitive tasks - use mixed precision, calibrate with representative data, evaluate on edge-specific test set
- **Delegate initialization failure**: GPU delegate crashes on older devices - always implement CPU fallback, check delegate compatibility before loading
- **Memory pressure on device**: Model + app exceeds available RAM - use memory-mapped models, implement model unloading, reduce batch size to 1
- **Thermal throttling**: Sustained inference causes device overheating - implement duty cycling, reduce inference frequency, monitor thermal zones
- **Model download size**: Large models over cellular data - offer Wi-Fi-only download, implement resumable downloads, use progressive model loading
- **Version fragmentation**: Model works on some devices but not others - test on representative device matrix, use NNAPI version checks, maintain device compatibility database

## Related Skills

- `deploy-ml-model-serving` - Cloud-based model serving (complement to edge)
- `monitor-model-drift` - Monitor model quality over time
- `register-ml-model` - Register models before edge deployment
- `create-dockerfile` - Containerize edge model conversion pipeline
- `create-multistage-dockerfile` - Multi-stage builds for model conversion pipelines
