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
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Edge-KI-Modell deployen

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer komplette Konfigurationsdateien, Quantisierungsskripte und Benchmark-Templates.

ML-Modelle zu Edge-Geraeten mit optimierter Inferenz, Hardware-Beschleunigung und On-Device-Modell-Management deployen.

## Wann verwenden

- LLMs (Gemma 4, Phi, Llama) zu Mobilgeraeten via Google AI Edge Gallery deployen
- Modelle zu TensorFlow Lite oder ONNX fuer On-Device-Inferenz konvertieren
- Modelle zu INT8/INT4 fuer reduzierten Speicher und schnellere Inferenz quantisieren
- Android/iOS-Apps mit lokalen KI-Faehigkeiten bauen
- Hardware-Delegates auswaehlen (GPU, NPU, DSP, Hexagon, CoreML)
- Inferenz-Latenz und -Speicher auf Ziel-Geraeten benchmarken
- MediaPipe-Tasks (Vision, Text, Audio) zu mobilen oder eingebetteten Plattformen deployen

## Eingaben

- **Erforderlich**: Trainiertes Modell (SavedModel, PyTorch, ONNX oder Hugging-Face-Checkpoint)
- **Erforderlich**: Ziel-Plattform (Android, iOS, Linux-eingebettet, Browser)
- **Erforderlich**: Ziel-Geraet-Beschraenkungen (RAM, Speicher, Compute-Faehigkeit)
- **Optional**: Kalibrierungsdatensatz fuer Post-Training-Quantisierung
- **Optional**: Google-AI-Edge-Gallery-Konfiguration fuer LLM-Deployment
- **Optional**: Hardware-Delegate-Praeferenzen (GPU, NPU, nur CPU)

## Vorgehensweise

### Schritt 1: Modell fuer Edge-Deployment evaluieren

Modellgroesse, Latenzanforderungen und Ziel-Geraet-Faehigkeiten einschaetzen.

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

Edge-Deployment-Entscheidungsmatrix:

| Modellgroesse | Geraet-RAM | Empfohlene Aktion |
|---------------|------------|-------------------|
| < 50 MB | 2+ GB | Direkte TFLite-Konvertierung |
| 50-500 MB | 4+ GB | INT8-Quantisierung + TFLite |
| 500 MB-2 GB | 6+ GB | INT4-Quantisierung + AI Edge Gallery |
| 2-4 GB | 8+ GB | Gemma 4 via AI Edge Gallery mit INT4 |
| > 4 GB | 12+ GB | Weight-Streaming oder Cloud-Edge-Hybrid |

**Erwartet:** Modellbewertung abgeschlossen, Groessen- und RAM-Verhaeltnisse berechnet, Quantisierungs-Empfehlung basierend auf Geraet-Beschraenkungen erzeugt.

**Bei Fehler:** SavedModel-Pfad als gueltig verifizieren (`ls saved_model/`), TensorFlow-Installation pruefen (`python -c "import tensorflow"`), ausreichend Festplattenspeicher fuer Modell-Laden sicherstellen, verifizieren dass Modell-Format unterstuetzt wird.

### Schritt 2: LLMs via Google AI Edge Gallery deployen

Google AI Edge Gallery nutzen um Gemma 4 und andere LLMs zu Android-Geraeten zu deployen.

```bash
# Clone AI Edge Gallery
git clone https://github.com/nickoala/ai-edge-gallery.git
cd ai-edge-gallery

# Build the Android app
./gradlew assembleDebug

# Install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Gemma-4-Modell fuer AI Edge Gallery konfigurieren:

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

Programmatische On-Device-Inferenz mit LLM-Inferenz-API:

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

**Erwartet:** AI-Edge-Gallery-App baut und installiert erfolgreich, Gemma-4-Modell laedt aufs Geraet, On-Device-Inferenz produziert kohaerente Antworten, GPU-Delegate aktiviert sich fuer Beschleunigung.

**Bei Fehler:** Android-SDK-Version >= 26 pruefen (`adb shell getprop ro.build.version.sdk`), verifizieren dass Geraet ausreichend Speicher fuer Modell-Download hat, sicherstellen dass GPU-Delegate unterstuetzt wird (`adb logcat | grep -i delegate`), Hugging-Face-Modell-Zugriffsberechtigungen pruefen, ADB-Verbindung verifizieren (`adb devices`).

### Schritt 3: Modelle mit TFLite konvertieren und quantisieren

Standardmodelle in TFLite-Format mit Post-Training-Quantisierung konvertieren.

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

ONNX-Runtime-Quantisierungs-Alternative:

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

**Erwartet:** TFLite-Modell am angegebenen Pfad erzeugt, Modellgroesse um 2-4x reduziert mit INT8, Inferenzgenauigkeit innerhalb 1-2% des Originals, ONNX-Quantisierung produziert gueltiges Modell.

**Bei Fehler:** TensorFlow-Version >= 2.15 fuer neueste Quantisierungs-Unterstuetzung pruefen, verifizieren dass repraesentativer Datensatz mit Modell-Eingabe-Form uebereinstimmt, sicherstellen dass alle Ops in TFLite unterstuetzt sind (`converter.allow_custom_ops = True` als Fallback), ONNX-Opset-Version-Kompatibilitaet pruefen.

### Schritt 4: Hardware-Delegates konfigurieren

Hardware-Beschleunigungs-Delegates fuer Ziel-Geraete auswaehlen und konfigurieren.

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

Delegate-Auswahl-Guide:

| Geraet | Bester Delegate | Fallback | Hinweise |
|--------|-----------------|----------|----------|
| Android (Qualcomm) | NNAPI -> Hexagon DSP | GPU -> XNNPACK | `nnapi_accelerator_name` pruefen |
| Android (MediaTek) | NNAPI -> APU | GPU -> XNNPACK | Dimensity-Chips haben dedizierte APU |
| Android (Samsung) | NNAPI -> NPU | GPU -> XNNPACK | Exynos NPU via NNAPI |
| iOS | CoreML-Delegate | Metal GPU | `coreml_delegate` fuer ANE nutzen |
| Linux-eingebettet | GPU (falls verfuegbar) | XNNPACK | RPi nutzt XNNPACK CPU |
| Browser | WebGL / WebGPU | WASM SIMD | Via TensorFlow.js |

**Erwartet:** Delegate laedt ohne Fehler, Inferenz laeuft auf Ziel-Beschleuniger, Latenz verbessert sich 2-10x ueber CPU-only abhaengig von Modell und Geraet.

**Bei Fehler:** Verifizieren dass Delegate-Bibliothek auf Geraet existiert, pruefen dass Geraet angeforderten Delegate unterstuetzt (`adb shell cat /proc/cpuinfo` fuer CPU-Features), auf XNNPACK fallen wenn GPU/NPU nicht verfuegbar, OpenCL-Unterstuetzung fuer GPU-Delegate pruefen, NNAPI-Version verifizieren (`adb shell getprop ro.android.ndk.version`).

### Schritt 5: On-Device-Performance benchmarken

Inferenz-Latenz, Speicherverbrauch und Stromverbrauch auf Ziel-Geraeten messen.

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

Python-Benchmarking:

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

**Erwartet:** Benchmark produziert Latenz-Perzentile, Speicherverbrauch und Durchsatz-Metriken; GPU-Delegate zeigt 2-5x Speedup ueber CPU fuer Vision-Modelle; Gemma 4 2B erreicht 10-30 Tokens/Sek auf Flagship-Telefonen.

**Bei Fehler:** Sicherstellen dass Benchmark-Binary mit Geraet-Architektur uebereinstimmt (arm64-v8a), verifizieren dass Modell aufs Geraet geschoben (`adb shell ls /data/local/tmp/`), ausreichenden Geraetespeicher pruefen, Hintergrund-Apps killen um Speicherdruck zu reduzieren, verifizieren dass Thermal-Throttling nicht aktiv (`adb shell cat /sys/class/thermal/thermal_zone*/temp`).

### Schritt 6: Fuer Production-Deployment paketieren

Die finale Mobile-Anwendung mit eingebettetem oder herunterladbarem Modell bauen.

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

Modell-Download- und Caching-Strategie:

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

**Erwartet:** Android-App baut mit MediaPipe-Abhaengigkeit, Modell laedt beim ersten Start, Inferenz laeuft innerhalb Latenzbudget, Modell nach erstem Download gecacht, anmutiger Fallback wenn Geraet nicht unterstuetzt wird.

**Bei Fehler:** minSdk >= 26 in `build.gradle` pruefen, MediaPipe-Abhaengigkeitsversion verifizieren, sicherstellen dass Modelldatei nicht korrupt (SHA256 pruefen), ausreichenden Geraetespeicher fuer Modell verifizieren, ProGuard-Regeln pruefen die MediaPipe-Klassen erhalten, auf mehreren Geraet-Stufen testen.

## Validierung

- [ ] Modell konvertiert zu TFLite/ONNX ohne Op-Kompatibilitaetsfehler
- [ ] Quantisierte Modellgenauigkeit innerhalb akzeptabler Toleranz (< 2% Verschlechterung)
- [ ] Hardware-Delegate laedt und beschleunigt Inferenz
- [ ] Benchmark-Latenz erfuellt Ziel (z.B. < 100 ms fuer Vision, < 50 ms/Token fuer LLM)
- [ ] Speicherverbrauch bleibt innerhalb Geraetbudget
- [ ] AI Edge Gallery laedt und betreibt Gemma-4-Modell erfolgreich
- [ ] On-Device-LLM erzeugt kohaerente Antworten
- [ ] Anwendung handhabt Modell-Download, -Caching und -Updates
- [ ] Anmutige Degradierung auf nicht unterstuetzten Geraeten
- [ ] Batterieauswirkung innerhalb akzeptablem Bereich fuer Ziel-Anwendungsfall

## Haeufige Stolperfallen

- **Nicht unterstuetzte Ops in TFLite**: Custom Ops scheitern an Konvertierung - `converter.allow_custom_ops = True` nutzen oder durch unterstuetzte Alternativen ersetzen, Op-Kompatibilitaetsliste pruefen
- **Quantisierungs-Genauigkeitsverlust**: INT4 verschlechtert Qualitaet fuer sensible Tasks - Mixed-Precision nutzen, mit repraesentativen Daten kalibrieren, auf Edge-spezifischem Test-Set evaluieren
- **Delegate-Initialisierungsfehler**: GPU-Delegate stuerzt auf aelteren Geraeten ab - immer CPU-Fallback implementieren, Delegate-Kompatibilitaet vor dem Laden pruefen
- **Speicherdruck auf Geraet**: Modell + App ueberschreitet verfuegbares RAM - speicher-mapped Modelle nutzen, Modell-Unloading implementieren, Batch-Groesse auf 1 reduzieren
- **Thermal-Throttling**: Anhaltende Inferenz verursacht Geraet-Ueberhitzung - Duty-Cycling implementieren, Inferenz-Frequenz reduzieren, Thermal-Zonen ueberwachen
- **Modell-Download-Groesse**: Grosse Modelle ueber Mobilfunkdaten - Wi-Fi-only-Download anbieten, fortsetzbare Downloads implementieren, progressives Modell-Laden nutzen
- **Versions-Fragmentierung**: Modell funktioniert auf manchen Geraeten aber nicht anderen - auf repraesentativer Geraet-Matrix testen, NNAPI-Versions-Pruefungen nutzen, Geraet-Kompatibilitaets-Datenbank pflegen

## Verwandte Skills

- `deploy-ml-model-serving` - Cloud-basiertes Modell-Serving (Komplement zu Edge)
- `monitor-model-drift` - Modell-Qualitaet ueber Zeit ueberwachen
- `register-ml-model` - Modelle vor Edge-Deployment registrieren
- `create-dockerfile` - Edge-Modell-Konvertierungs-Pipeline containerisieren
- `create-multistage-dockerfile` - Multi-Stage-Builds fuer Modell-Konvertierungs-Pipelines
