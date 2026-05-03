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
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Deploy Edge AI Model

> 完全な設定ファイル、量子化スクリプト、ベンチマークテンプレートは [Extended Examples](references/EXAMPLES.md) を参照。

最適化された推論、ハードウェアアクセラレーション、デバイス上モデル管理を伴う ML モデルをエッジデバイスへデプロイする。

## 使用タイミング

- Google AI Edge Gallery 経由で LLM（Gemma 4、Phi、Llama）をモバイルデバイスへデプロイするとき
- デバイス上推論のためにモデルを TensorFlow Lite または ONNX へ変換するとき
- メモリ削減と高速推論のためにモデルを INT8/INT4 へ量子化するとき
- ローカル AI 機能を持つ Android/iOS アプリを構築するとき
- ハードウェアデリゲート（GPU、NPU、DSP、Hexagon、CoreML）を選ぶとき
- ターゲットデバイスで推論レイテンシとメモリをベンチマークするとき
- MediaPipe タスク（vision、text、audio）をモバイルまたは組込プラットフォームへデプロイするとき

## 入力

- **必須**: 訓練済モデル（SavedModel、PyTorch、ONNX、Hugging Face チェックポイント）
- **必須**: ターゲットプラットフォーム（Android、iOS、Linux 組込、ブラウザ）
- **必須**: ターゲットデバイスの制約（RAM、ストレージ、計算能力）
- **任意**: 訓練後量子化のためのキャリブレーションデータセット
- **任意**: LLM デプロイ用の Google AI Edge Gallery 設定
- **任意**: ハードウェアデリゲートの優先順位（GPU、NPU、CPU のみ）

## 手順

### ステップ1: エッジデプロイ用にモデルを評価する

モデルサイズ、レイテンシ要件、ターゲットデバイス能力を評価する。

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

エッジデプロイ意思決定マトリクス:

| Model Size | Device RAM | Recommended Action |
|-----------|-----------|-------------------|
| < 50 MB | 2+ GB | Direct TFLite conversion |
| 50-500 MB | 4+ GB | INT8 quantization + TFLite |
| 500 MB-2 GB | 6+ GB | INT4 quantization + AI Edge Gallery |
| 2-4 GB | 8+ GB | Gemma 4 via AI Edge Gallery with INT4 |
| > 4 GB | 12+ GB | Weight streaming or cloud-edge hybrid |

**期待結果：** モデル評価が完了し、サイズと RAM 比が計算され、デバイス制約に基づく量子化推奨が生成される。

**失敗時：** SavedModel パスが有効か検証（`ls saved_model/`）、TensorFlow インストール確認（`python -c "import tensorflow"`）、モデルロードに十分なディスク容量を確保、モデル形式がサポートされているか検証。

### ステップ2: Google AI Edge Gallery 経由で LLM をデプロイする

Google AI Edge Gallery を使って Gemma 4 や他の LLM を Android デバイスへデプロイする。

```bash
# Clone AI Edge Gallery
git clone https://github.com/nickoala/ai-edge-gallery.git
cd ai-edge-gallery

# Build the Android app
./gradlew assembleDebug

# Install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

AI Edge Gallery 用の Gemma 4 モデルを設定:

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

LLM Inference API を使ったプログラム的デバイス上推論:

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

**期待結果：** AI Edge Gallery アプリがビルド・インストールに成功し、Gemma 4 モデルがデバイスへダウンロードされ、デバイス上推論が一貫した応答を生成し、GPU デリゲートがアクセラレーションのためアクティブになる。

**失敗時：** Android SDK バージョン >= 26 を確認（`adb shell getprop ro.build.version.sdk`）、デバイスにモデルダウンロード用の十分なストレージがあるか検証、GPU デリゲートがサポートされているか確認（`adb logcat | grep -i delegate`）、Hugging Face モデルアクセス権限を確認、ADB 接続を検証（`adb devices`）。

### ステップ3: TFLite でモデルを変換し量子化する

訓練後量子化を伴う TFLite 形式に標準モデルを変換する。

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

ONNX Runtime 量子化の代替:

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

**期待結果：** TFLite モデルが指定パスに生成、INT8 でモデルサイズが 2-4 倍縮小、推論精度が原モデルから 1-2% 以内、ONNX 量子化が有効モデルを生成する。

**失敗時：** 最新の量子化サポートに TensorFlow バージョン >= 2.15 を確認、代表データセットがモデル入力形状と一致するか検証、TFLite ですべての op がサポートされているか確認（フォールバックとして `converter.allow_custom_ops = True`）、ONNX opset バージョン互換性を確認。

### ステップ4: ハードウェアデリゲートを設定する

ターゲットデバイス用のハードウェアアクセラレーションデリゲートを選択・設定する。

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

デリゲート選択ガイド:

| Device | Best Delegate | Fallback | Notes |
|--------|--------------|----------|-------|
| Android (Qualcomm) | NNAPI -> Hexagon DSP | GPU -> XNNPACK | Check `nnapi_accelerator_name` |
| Android (MediaTek) | NNAPI -> APU | GPU -> XNNPACK | Dimensity chips have dedicated APU |
| Android (Samsung) | NNAPI -> NPU | GPU -> XNNPACK | Exynos NPU via NNAPI |
| iOS | CoreML delegate | Metal GPU | Use `coreml_delegate` for ANE |
| Linux embedded | GPU (if available) | XNNPACK | RPi uses XNNPACK CPU |
| Browser | WebGL / WebGPU | WASM SIMD | Via TensorFlow.js |

**期待結果：** デリゲートがエラーなくロード、推論がターゲットアクセラレータ上で実行、モデルとデバイスに依存し CPU のみより 2-10 倍レイテンシ改善。

**失敗時：** デバイスにデリゲートライブラリが存在するか検証、デバイスが要求デリゲートをサポートするか確認（CPU 機能は `adb shell cat /proc/cpuinfo`）、GPU/NPU 不可なら XNNPACK へフォールバック、GPU デリゲートには OpenCL サポートを確認、NNAPI バージョンを検証（`adb shell getprop ro.android.ndk.version`）。

### ステップ5: デバイス上の性能をベンチマークする

ターゲットデバイス上で推論レイテンシ、メモリ使用量、消費電力を計測する。

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

Python ベンチマーキング:

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

**期待結果：** ベンチマークがレイテンシパーセンタイル、メモリ使用量、スループット指標を出力する; vision モデルで GPU デリゲートが CPU より 2-5 倍速度向上を示す; Gemma 4 2B が旗艦スマホで 10-30 トークン/秒を達成する。

**失敗時：** ベンチマークバイナリがデバイスアーキテクチャ（arm64-v8a）と一致するか確認、モデルがデバイスへ push されたか検証（`adb shell ls /data/local/tmp/`）、十分なデバイスストレージを確認、メモリ圧を減らすためバックグラウンドアプリを終了、サーマルスロットリングが起きていないか検証（`adb shell cat /sys/class/thermal/thermal_zone*/temp`）。

### ステップ6: 本番デプロイ用にパッケージする

埋め込みまたはダウンロード可能モデルを伴う最終モバイルアプリケーションを構築する。

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

モデルダウンロードとキャッシング戦略:

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

**期待結果：** Android アプリが MediaPipe 依存と共にビルド、初回起動時にモデルがロード、推論がレイテンシ予算内で実行、初回ダウンロード後にモデルがキャッシュされる、未対応デバイスで優雅にフォールバック。

**失敗時：** `build.gradle` で minSdk >= 26 を確認、MediaPipe 依存バージョンを検証、モデルファイルが破損していないか確認（SHA256 をチェック）、モデル用の十分なデバイスストレージを検証、ProGuard ルールが MediaPipe クラスを保持するか確認、複数デバイスティアでテスト。

## バリデーション

- [ ] モデルが op 互換性エラーなく TFLite/ONNX へ変換される
- [ ] 量子化モデル精度が許容公差内（< 2% 劣化）
- [ ] ハードウェアデリゲートがロードし推論を加速する
- [ ] ベンチマークレイテンシがターゲットを満たす（例: vision で < 100ms、LLM で < 50ms/トークン）
- [ ] メモリ使用量がデバイス予算内に収まる
- [ ] AI Edge Gallery が Gemma 4 モデルを正しくロード・実行する
- [ ] デバイス上 LLM が一貫した応答を生成する
- [ ] アプリケーションがモデルダウンロード、キャッシュ、更新を扱う
- [ ] 未対応デバイスで優雅な劣化
- [ ] ターゲット用途に許容される範囲のバッテリー影響

## よくある落とし穴

- **TFLite で未対応の op**: カスタム op が変換失敗 - `converter.allow_custom_ops = True` を使うかサポート対替に置換、op 互換性リストを確認
- **量子化精度損失**: INT4 が敏感タスクで品質を劣化 - 混合精度を使う、代表データでキャリブレーション、エッジ固有テストセットで評価
- **デリゲート初期化失敗**: 旧型デバイスで GPU デリゲートがクラッシュ - 常に CPU フォールバックを実装、ロード前にデリゲート互換性を確認
- **デバイスのメモリ圧**: モデル + アプリが利用可能 RAM を超える - メモリマップトモデルを使う、モデルアンロードを実装、バッチサイズを 1 へ縮小
- **サーマルスロットリング**: 持続推論がデバイス過熱を引き起こす - デューティサイクリングを実装、推論頻度を減らす、サーマルゾーンを監視
- **モデルダウンロードサイズ**: セルラーデータでの大きいモデル - Wi-Fi のみダウンロードを提供、再開可能ダウンロードを実装、漸進的モデルロードを使う
- **バージョン断片化**: 一部デバイスでは動くが他では動かない - 代表的デバイスマトリクスでテスト、NNAPI バージョンチェックを使う、デバイス互換性データベースを維持

## 関連スキル

- `deploy-ml-model-serving` - クラウドベースモデルサービング（エッジへの補完）
- `monitor-model-drift` - 時間とともにモデル品質を監視
- `register-ml-model` - エッジデプロイ前にモデルを登録
- `create-dockerfile` - エッジモデル変換パイプラインをコンテナ化
- `create-multistage-dockerfile` - モデル変換パイプライン用のマルチステージビルド
