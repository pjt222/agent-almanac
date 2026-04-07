# Deploy Edge AI Model - Extended Examples

## Complete TFLite Conversion Pipeline

```python
# full_conversion_pipeline.py
import os
import tensorflow as tf
import numpy as np

def convert_with_all_quantization_levels(saved_model_path, output_dir):
    """Convert a SavedModel to TFLite with multiple quantization levels for comparison."""
    os.makedirs(output_dir, exist_ok=True)

    configs = {
        "float32": {"optimizations": []},
        "dynamic_range": {"optimizations": [tf.lite.Optimize.DEFAULT]},
        "float16": {
            "optimizations": [tf.lite.Optimize.DEFAULT],
            "target_spec_types": [tf.float16],
        },
        "int8": {
            "optimizations": [tf.lite.Optimize.DEFAULT],
            "supported_ops": [tf.lite.OpsSet.TFLITE_BUILTINS_INT8],
            "inference_input_type": tf.int8,
            "inference_output_type": tf.int8,
        },
    }

    results = {}
    for name, config in configs.items():
        converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_path)
        converter.optimizations = config.get("optimizations", [])

        if "target_spec_types" in config:
            converter.target_spec.supported_types = config["target_spec_types"]

        if "supported_ops" in config:
            converter.target_spec.supported_ops = config["supported_ops"]
            converter.inference_input_type = config.get("inference_input_type", tf.float32)
            converter.inference_output_type = config.get("inference_output_type", tf.float32)

            def representative_dataset():
                for _ in range(200):
                    yield [np.random.randn(1, 224, 224, 3).astype(np.float32)]
            converter.representative_dataset = representative_dataset

        tflite_model = converter.convert()
        output_path = os.path.join(output_dir, f"model_{name}.tflite")
        with open(output_path, "wb") as f:
            f.write(tflite_model)

        size_mb = len(tflite_model) / (1024 * 1024)
        results[name] = {"path": output_path, "size_mb": size_mb}
        print(f"{name}: {size_mb:.1f} MB")

    return results
```

## AI Edge Gallery Custom Model Configuration

```json
{
  "app_config": {
    "name": "My Edge AI App",
    "version": "1.0.0",
    "min_sdk": 26
  },
  "models": [
    {
      "name": "Gemma 4 2B IT (INT4)",
      "description": "Lightweight conversational model optimized for mobile",
      "url": "https://huggingface.co/google/gemma-4-2b-it-gpu-int4",
      "format": "tflite",
      "backend": "gpu",
      "size_mb": 1400,
      "min_ram_mb": 4096,
      "config": {
        "max_tokens": 1024,
        "temperature": 0.7,
        "top_k": 40,
        "top_p": 0.95
      }
    },
    {
      "name": "Gemma 4 1B IT (INT4)",
      "description": "Ultra-lightweight model for low-end devices",
      "url": "https://huggingface.co/google/gemma-4-1b-it-gpu-int4",
      "format": "tflite",
      "backend": "gpu",
      "size_mb": 700,
      "min_ram_mb": 3072,
      "config": {
        "max_tokens": 512,
        "temperature": 0.7,
        "top_k": 40
      }
    }
  ],
  "delegate_config": {
    "preferred_order": ["gpu", "nnapi", "xnnpack"],
    "gpu_options": {
      "precision": "fp16",
      "allow_quantized_models": true,
      "serialized_model_dir": "/data/local/tmp/gpu_cache"
    }
  }
}
```

## Complete Android Integration

```kotlin
// build.gradle.kts (app-level)
dependencies {
    implementation("com.google.mediapipe:tasks-genai:0.10.21")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}

android {
    defaultConfig {
        minSdk = 26
        ndk {
            abiFilters += listOf("arm64-v8a")
        }
    }
}
```

```kotlin
// EdgeAIViewModel.kt
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class EdgeAIViewModel : ViewModel() {
    private val _response = MutableStateFlow("")
    val response: StateFlow<String> = _response

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private var llmInference: LlmInference? = null

    fun initializeModel(modelPath: String) {
        viewModelScope.launch(Dispatchers.IO) {
            _isLoading.value = true
            try {
                val options = LlmInference.LlmInferenceOptions.builder()
                    .setModelPath(modelPath)
                    .setMaxTokens(1024)
                    .setTemperature(0.7f)
                    .setTopK(40)
                    .build()
                llmInference = LlmInference.createFromOptions(options)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun generate(prompt: String) {
        viewModelScope.launch(Dispatchers.IO) {
            _isLoading.value = true
            _response.value = ""
            try {
                val result = llmInference?.generateResponse(prompt) ?: ""
                _response.value = result
            } finally {
                _isLoading.value = false
            }
        }
    }

    override fun onCleared() {
        llmInference?.close()
        super.onCleared()
    }
}
```

## ONNX Runtime Mobile Deployment

```python
# onnx_mobile_optimize.py
import onnx
from onnxruntime.quantization import (
    quantize_dynamic,
    quantize_static,
    CalibrationDataReader,
    QuantType,
    QuantFormat,
)

class ImageCalibrationReader(CalibrationDataReader):
    """Calibration data reader for static quantization."""

    def __init__(self, calibration_dir, input_name, input_shape):
        self.data_iter = iter(self._load_images(calibration_dir, input_shape))
        self.input_name = input_name

    def get_next(self):
        try:
            return {self.input_name: next(self.data_iter)}
        except StopIteration:
            return None

    def _load_images(self, directory, shape):
        import numpy as np
        from PIL import Image
        import glob

        for path in glob.glob(f"{directory}/*.jpg")[:200]:
            img = Image.open(path).resize((shape[2], shape[3]))
            arr = np.array(img).astype(np.float32) / 255.0
            arr = np.transpose(arr, (2, 0, 1))
            yield np.expand_dims(arr, axis=0)


def optimize_for_mobile(model_path, output_path):
    """Full ONNX optimization pipeline for mobile deployment."""
    # Step 1: Optimize graph
    from onnxruntime.transformers import optimizer
    optimized = optimizer.optimize_model(model_path, model_type="bert")
    optimized.save_model_to_file("optimized.onnx")

    # Step 2: Quantize
    quantize_dynamic(
        model_input="optimized.onnx",
        model_output=output_path,
        weight_type=QuantType.QInt8,
        per_channel=True,
    )

    original_size = os.path.getsize(model_path) / (1024 * 1024)
    final_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Optimization: {original_size:.1f} MB -> {final_size:.1f} MB ({original_size/final_size:.1f}x)")
```

## Benchmark Report Template

```markdown
# Edge AI Benchmark Report

## Device
- Model: [Device Model]
- SoC: [Chipset]
- RAM: [Total RAM]
- OS: [Android/iOS version]

## Model
- Name: [Model name]
- Format: [TFLite/ONNX]
- Quantization: [float32/float16/int8/int4]
- Size: [MB]

## Results

| Delegate | Latency (p50) | Latency (p95) | Memory | Throughput |
|----------|--------------|--------------|--------|------------|
| CPU (XNNPACK) | ms | ms | MB | inf/s |
| GPU | ms | ms | MB | inf/s |
| NNAPI | ms | ms | MB | inf/s |

## LLM-Specific (Gemma 4)

| Metric | Value |
|--------|-------|
| Time to first token | ms |
| Tokens per second | tok/s |
| Peak memory | MB |
| Model load time | s |
```
