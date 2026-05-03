---
name: deploy-edge-ai-model
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
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Deploy Edge AI Model

> Ver [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos, scripts de cuantización y plantillas de benchmark.

Desplegar modelos ML a dispositivos edge con inferencia optimizada, aceleración de hardware y gestión de modelos en el dispositivo.

## Cuándo Usar

- Desplegar LLMs (Gemma 4, Phi, Llama) a dispositivos móviles vía Google AI Edge Gallery
- Convertir modelos a TensorFlow Lite o ONNX para inferencia en el dispositivo
- Cuantizar modelos a INT8/INT4 para reducir memoria y acelerar la inferencia
- Construir apps Android/iOS con capacidades de IA local
- Seleccionar delegados de hardware (GPU, NPU, DSP, Hexagon, CoreML)
- Hacer benchmarks de latencia de inferencia y memoria en dispositivos objetivo
- Desplegar tareas de MediaPipe (visión, texto, audio) a plataformas móviles o embebidas

## Entradas

- **Requerido**: Modelo entrenado (SavedModel, PyTorch, ONNX o checkpoint de Hugging Face)
- **Requerido**: Plataforma objetivo (Android, iOS, Linux embebido, navegador)
- **Requerido**: Restricciones del dispositivo objetivo (RAM, almacenamiento, capacidad de cómputo)
- **Opcional**: Dataset de calibración para cuantización post-entrenamiento
- **Opcional**: Configuración de Google AI Edge Gallery para despliegue de LLM
- **Opcional**: Preferencias de delegado de hardware (GPU, NPU, solo-CPU)

## Procedimiento

### Paso 1: Evaluar el Modelo para Despliegue Edge

Evaluar el tamaño del modelo, los requisitos de latencia y las capacidades del dispositivo objetivo.

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

Matriz de decisión de despliegue edge:

| Tamaño del Modelo | RAM del Dispositivo | Acción Recomendada |
|-----------|-----------|-------------------|
| < 50 MB | 2+ GB | Conversión directa a TFLite |
| 50-500 MB | 4+ GB | Cuantización INT8 + TFLite |
| 500 MB-2 GB | 6+ GB | Cuantización INT4 + AI Edge Gallery |
| 2-4 GB | 8+ GB | Gemma 4 vía AI Edge Gallery con INT4 |
| > 4 GB | 12+ GB | Streaming de pesos o híbrido cloud-edge |

**Esperado:** La evaluación del modelo se completa, los ratios de tamaño y RAM se calculan, se genera la recomendación de cuantización basada en las restricciones del dispositivo.

**En caso de fallo:** Verificar que la ruta de SavedModel sea válida (`ls saved_model/`), verificar la instalación de TensorFlow (`python -c "import tensorflow"`), asegurar suficiente espacio en disco para cargar el modelo, verificar que el formato del modelo sea soportado.

### Paso 2: Desplegar LLMs vía Google AI Edge Gallery

Usar Google AI Edge Gallery para desplegar Gemma 4 y otros LLMs a dispositivos Android.

```bash
# Clone AI Edge Gallery
git clone https://github.com/nickoala/ai-edge-gallery.git
cd ai-edge-gallery

# Build the Android app
./gradlew assembleDebug

# Install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Configurar el modelo Gemma 4 para AI Edge Gallery:

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

Inferencia programática en el dispositivo con LLM Inference API:

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

**Esperado:** La app AI Edge Gallery compila e instala con éxito, el modelo Gemma 4 se descarga al dispositivo, la inferencia en el dispositivo produce respuestas coherentes, el delegado GPU se activa para aceleración.

**En caso de fallo:** Verificar versión de Android SDK >= 26 (`adb shell getprop ro.build.version.sdk`), verificar que el dispositivo tenga almacenamiento suficiente para descargar el modelo, asegurar que el delegado GPU sea soportado (`adb logcat | grep -i delegate`), verificar permisos de acceso al modelo de Hugging Face, verificar la conexión ADB (`adb devices`).

### Paso 3: Convertir y Cuantizar Modelos con TFLite

Convertir modelos estándar a formato TFLite con cuantización post-entrenamiento.

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

Alternativa de cuantización con ONNX Runtime:

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

**Esperado:** El modelo TFLite se genera en la ruta especificada, el tamaño del modelo se reduce 2-4x con INT8, la precisión de inferencia dentro del 1-2% del original, la cuantización ONNX produce un modelo válido.

**En caso de fallo:** Verificar versión de TensorFlow >= 2.15 para el último soporte de cuantización, verificar que el dataset representativo coincida con la forma de entrada del modelo, asegurar que todas las ops sean soportadas en TFLite (`converter.allow_custom_ops = True` como respaldo), verificar compatibilidad de versión de opset ONNX.

### Paso 4: Configurar Delegados de Hardware

Seleccionar y configurar delegados de aceleración de hardware para dispositivos objetivo.

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

Guía de selección de delegados:

| Dispositivo | Mejor Delegado | Respaldo | Notas |
|--------|--------------|----------|-------|
| Android (Qualcomm) | NNAPI -> Hexagon DSP | GPU -> XNNPACK | Verificar `nnapi_accelerator_name` |
| Android (MediaTek) | NNAPI -> APU | GPU -> XNNPACK | Los chips Dimensity tienen APU dedicada |
| Android (Samsung) | NNAPI -> NPU | GPU -> XNNPACK | NPU Exynos vía NNAPI |
| iOS | Delegado CoreML | Metal GPU | Usar `coreml_delegate` para ANE |
| Linux embebido | GPU (si disponible) | XNNPACK | RPi usa XNNPACK CPU |
| Navegador | WebGL / WebGPU | WASM SIMD | Vía TensorFlow.js |

**Esperado:** El delegado carga sin errores, la inferencia se ejecuta en el acelerador objetivo, la latencia mejora 2-10x sobre solo-CPU dependiendo del modelo y dispositivo.

**En caso de fallo:** Verificar que la librería del delegado exista en el dispositivo, verificar que el dispositivo soporte el delegado solicitado (`adb shell cat /proc/cpuinfo` para características de CPU), recurrir a XNNPACK si GPU/NPU no está disponible, verificar soporte de OpenCL para delegado GPU, verificar versión NNAPI (`adb shell getprop ro.android.ndk.version`).

### Paso 5: Hacer Benchmark del Rendimiento en el Dispositivo

Medir la latencia de inferencia, el uso de memoria y el consumo de energía en dispositivos objetivo.

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

Benchmarking en Python:

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

**Esperado:** El benchmark produce percentiles de latencia, uso de memoria y métricas de throughput; el delegado GPU muestra 2-5x speedup sobre CPU para modelos de visión; Gemma 4 2B alcanza 10-30 tokens/sec en teléfonos flagship.

**En caso de fallo:** Asegurar que el binario de benchmark coincida con la arquitectura del dispositivo (arm64-v8a), verificar que el modelo se haya enviado al dispositivo (`adb shell ls /data/local/tmp/`), verificar suficiente almacenamiento del dispositivo, matar apps en segundo plano para reducir presión de memoria, verificar que el throttling térmico no esté activo (`adb shell cat /sys/class/thermal/thermal_zone*/temp`).

### Paso 6: Empaquetar para Despliegue en Producción

Construir la aplicación móvil final con modelo embebido o descargable.

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

Estrategia de descarga y caché de modelos:

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

**Esperado:** La app Android compila con la dependencia de MediaPipe, el modelo carga al primer lanzamiento, la inferencia se ejecuta dentro del presupuesto de latencia, el modelo se cachea después de la primera descarga, respaldo elegante cuando el dispositivo no es soportado.

**En caso de fallo:** Verificar minSdk >= 26 en `build.gradle`, verificar la versión de la dependencia de MediaPipe, asegurar que el archivo del modelo no esté corrupto (verificar SHA256), verificar suficiente almacenamiento del dispositivo para el modelo, verificar que las reglas de ProGuard preserven las clases de MediaPipe, probar en múltiples niveles de dispositivos.

## Validación

- [ ] El modelo se convierte a TFLite/ONNX sin errores de compatibilidad de ops
- [ ] La precisión del modelo cuantizado dentro de tolerancia aceptable (< 2% de degradación)
- [ ] El delegado de hardware carga y acelera la inferencia
- [ ] La latencia del benchmark cumple el objetivo (p. ej., < 100ms para visión, < 50ms/token para LLM)
- [ ] El uso de memoria se mantiene dentro del presupuesto del dispositivo
- [ ] AI Edge Gallery carga y ejecuta con éxito el modelo Gemma 4
- [ ] El LLM en el dispositivo genera respuestas coherentes
- [ ] La aplicación maneja descarga, caché y actualizaciones del modelo
- [ ] Degradación elegante en dispositivos no soportados
- [ ] Impacto en la batería dentro del rango aceptable para el caso de uso objetivo

## Errores Comunes

- **Ops no soportadas en TFLite**: Las ops personalizadas fallan en la conversión - usar `converter.allow_custom_ops = True` o reemplazar con alternativas soportadas, verificar lista de compatibilidad de ops
- **Pérdida de precisión por cuantización**: INT4 degrada la calidad para tareas sensibles - usar precisión mixta, calibrar con datos representativos, evaluar en conjunto de pruebas específico de edge
- **Fallo de inicialización del delegado**: El delegado GPU falla en dispositivos antiguos - siempre implementar respaldo CPU, verificar compatibilidad del delegado antes de cargar
- **Presión de memoria en el dispositivo**: Modelo + app excede la RAM disponible - usar modelos mapeados en memoria, implementar descarga de modelo, reducir tamaño de batch a 1
- **Throttling térmico**: La inferencia sostenida causa sobrecalentamiento del dispositivo - implementar duty cycling, reducir frecuencia de inferencia, monitorizar zonas térmicas
- **Tamaño de descarga del modelo**: Modelos grandes sobre datos celulares - ofrecer descarga solo Wi-Fi, implementar descargas reanudables, usar carga progresiva del modelo
- **Fragmentación de versiones**: El modelo funciona en algunos dispositivos pero no en otros - probar en una matriz de dispositivos representativa, usar verificaciones de versión NNAPI, mantener una base de datos de compatibilidad de dispositivos

## Habilidades Relacionadas

- `deploy-ml-model-serving` - Servicio de modelos basado en cloud (complemento de edge)
- `monitor-model-drift` - Monitorizar la calidad del modelo a lo largo del tiempo
- `register-ml-model` - Registrar modelos antes del despliegue edge
- `create-dockerfile` - Containerizar el pipeline de conversión de modelos edge
- `create-multistage-dockerfile` - Builds multi-stage para pipelines de conversión de modelos
