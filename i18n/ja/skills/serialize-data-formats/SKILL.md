---
name: serialize-data-formats
description: >
  JSON、XML、YAML、Protocol Buffers、MessagePack、Apache Arrow/Parquetを含む
  一般的なフォーマット間でデータをシリアライズ・デシリアライズする。
  フォーマット選択基準、エンコード/デコードパターン、パフォーマンスの
  トレードオフ、相互運用性の考慮事項をカバー。API通信のワイヤーフォーマット
  選択、構造化データのディスク永続化、異なる言語で書かれたシステム間の
  データ交換、転送サイズや解析速度の最適化、シリアライゼーション
  フォーマット間の移行に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json, xml, yaml, protobuf, messagepack, parquet, arrow, serialization
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# データフォーマットのシリアライズ

ユースケースに適したデータシリアライゼーションフォーマットを選択し、正しいエンコード/デコードとパフォーマンス意識を持って実装する。

## 使用タイミング

- API通信のワイヤーフォーマットを選択する場合
- 構造化データをディスクやオブジェクトストレージに永続化する場合
- 異なる言語で書かれたシステム間でデータを交換する場合
- データ転送サイズや解析速度を最適化する場合
- シリアライゼーションフォーマット間を移行する場合

## 入力

- **必須**: シリアライズするデータ構造（スキーマまたは例）
- **必須**: ユースケース（API、ストレージ、ストリーミング、分析）
- **任意**: パフォーマンス要件（サイズ、速度、スキーマ強制）
- **任意**: ターゲット言語/ランタイムの制約
- **任意**: 人間可読性の要件

## 手順

### ステップ1: 適切なフォーマットの選択

| フォーマット | 人間可読 | スキーマ | サイズ | 速度 | 最適な用途 |
|--------|-------|--------|------|------|----------|
| JSON | はい | 任意（JSON Schema） | 中 | 中 | REST API、設定、広範な相互運用 |
| XML | はい | XSD、DTD | 大 | 遅い | エンタープライズ/レガシー、SOAP、文書 |
| YAML | はい | 任意 | 中 | 遅い | 設定ファイル、CI/CD、Kubernetes |
| Protocol Buffers | いいえ | 必須（.proto） | 小 | 速い | gRPC、マイクロサービス、モバイル |
| MessagePack | いいえ | なし | 小 | 速い | リアルタイム、組み込み、Redis |
| Arrow/Parquet | いいえ | 内蔵 | 非常に小 | 非常に速い | 分析、カラムナクエリ、データレイク |

決定ツリー:
1. **人間による編集が必要?** -> YAML（設定）またはJSON（データ）
2. **厳格なスキーマ + 高速RPC?** -> Protocol Buffers
3. **最小ワイヤーサイズ?** -> MessagePackまたはProtobuf
4. **カラムナ分析?** -> Apache Parquet
5. **インメモリ交換?** -> Apache Arrow
6. **レガシーエンタープライズ統合?** -> XML

**期待結果:** ユースケース要件に合致する根拠を文書化してフォーマットが選択される。
**失敗時:** 要件が矛盾する場合（例: 人間可読かつ高速）、主要なユースケースを優先し、トレードオフを記録する。

### ステップ2: JSONシリアライゼーションの実装

```python
import json
from datetime import datetime, date
from dataclasses import dataclass, asdict

@dataclass
class Measurement:
    sensor_id: str
    value: float
    unit: str
    timestamp: datetime

# 非標準型のカスタムエンコーダ
class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, date):
            return obj.isoformat()
        if isinstance(obj, bytes):
            import base64
            return base64.b64encode(obj).decode('ascii')
        return super().default(obj)

# シリアライズ
measurement = Measurement("sensor-01", 23.5, "celsius", datetime.now())
json_str = json.dumps(asdict(measurement), cls=CustomEncoder, indent=2)

# デシリアライズ
data = json.loads(json_str)
```

```r
# R: jsonliteによるJSON
library(jsonlite)

# シリアライズ
df <- data.frame(sensor_id = "sensor-01", value = 23.5, unit = "celsius")
json_str <- jsonlite::toJSON(df, auto_unbox = TRUE, pretty = TRUE)

# デシリアライズ
df_back <- jsonlite::fromJSON(json_str)
```

**期待結果:** ラウンドトリップシリアライゼーションがすべてのデータ型を正確に保持する。
**失敗時:** 型が失われる場合（例: 日付が文字列になる）、デシリアライゼーションステップで明示的な型変換を追加する。

### ステップ3: Protocol Buffersの実装

スキーマ（`.proto`ファイル）を定義する:

```protobuf
syntax = "proto3";
package sensors;

message Measurement {
  string sensor_id = 1;
  double value = 2;
  string unit = 3;
  int64 timestamp_ms = 4;  // Unixミリ秒
}

message MeasurementBatch {
  repeated Measurement measurements = 1;
}
```

生成して使用する:

```bash
# Pythonコードを生成
protoc --python_out=. sensors.proto

# Goコードを生成
protoc --go_out=. sensors.proto
```

```python
from sensors_pb2 import Measurement, MeasurementBatch
import time

# シリアライズ
m = Measurement(
    sensor_id="sensor-01",
    value=23.5,
    unit="celsius",
    timestamp_ms=int(time.time() * 1000)
)
binary = m.SerializeToString()  # コンパクトなバイナリ

# デシリアライズ
m2 = Measurement()
m2.ParseFromString(binary)
```

**期待結果:** バイナリ出力が同等のJSONより3-10倍小さい。
**失敗時:** protocが利用できない場合、言語ネイティブのprotobufライブラリ（例: Pythonの`betterproto`）を使用する。

### ステップ4: MessagePackの実装

```python
import msgpack
from datetime import datetime

# datetimeのカスタムパッキング
def encode_datetime(obj):
    if isinstance(obj, datetime):
        return {"__datetime__": True, "s": obj.isoformat()}
    return obj

def decode_datetime(obj):
    if "__datetime__" in obj:
        return datetime.fromisoformat(obj["s"])
    return obj

data = {"sensor_id": "sensor-01", "value": 23.5, "ts": datetime.now()}

# シリアライズ（JSONより小さく、JSONより速い）
packed = msgpack.packb(data, default=encode_datetime)

# デシリアライズ
unpacked = msgpack.unpackb(packed, object_hook=decode_datetime, raw=False)
```

**期待結果:** MessagePack出力が一般的なペイロードでJSONより15-30%小さい。
**失敗時:** 言語がMessagePackをサポートしない場合、圧縮付きJSON（gzip）にフォールバックする。

### ステップ5: Apache Parquet（カラムナ）の実装

```python
import pyarrow as pa
import pyarrow.parquet as pq
import pandas as pd

# データ作成
df = pd.DataFrame({
    "sensor_id": ["s-01", "s-02", "s-01", "s-03"] * 1000,
    "value": [23.5, 18.2, 24.1, 19.8] * 1000,
    "unit": ["celsius"] * 4000,
    "timestamp": pd.date_range("2025-01-01", periods=4000, freq="min")
})

# Parquet書き込み（カラムナ、圧縮）
table = pa.Table.from_pandas(df)
pq.write_table(table, "measurements.parquet", compression="snappy")

# Parquet読み込み（全データをロードせずに特定カラムを読み取れる）
table_back = pq.read_table("measurements.parquet", columns=["sensor_id", "value"])
df_subset = table_back.to_pandas()
```

```r
# R: arrowによるParquet
library(arrow)

# 書き込み
df <- data.frame(sensor_id = rep("s-01", 1000), value = rnorm(1000))
arrow::write_parquet(df, "measurements.parquet")

# 読み込み（カラム選択付き — 選択されたカラムのみディスクから読み込む）
df_back <- arrow::read_parquet("measurements.parquet", col_select = c("value"))
```

**期待結果:** Parquetファイルが一般的な表形式データでCSVより5-20倍小さい。
**失敗時:** Arrowが利用できない場合、`fastparquet`（Python）またはgzip付きCSVをフォールバックとして使用する。

### ステップ6: パフォーマンスの比較

特定のデータとユースケースでベンチマークを実行する:

```python
import json, msgpack, time
import pyarrow as pa, pyarrow.parquet as pq

data = [{"id": i, "value": i * 0.1, "label": f"item-{i}"} for i in range(10000)]

# JSON
start = time.perf_counter()
json_bytes = json.dumps(data).encode()
json_time = time.perf_counter() - start

# MessagePack
start = time.perf_counter()
msgpack_bytes = msgpack.packb(data)
msgpack_time = time.perf_counter() - start

print(f"JSON:    {len(json_bytes):>8} bytes, {json_time*1000:.1f} ms")
print(f"MsgPack: {len(msgpack_bytes):>8} bytes, {msgpack_time*1000:.1f} ms")
```

**期待結果:** ベンチマーク結果が本番使用のフォーマット選択を導く。
**失敗時:** いずれのフォーマットでもパフォーマンスが不十分な場合、圧縮（zstd、snappy）を直交する最適化として検討する。

## バリデーション

- [ ] 選択したフォーマットがユースケース要件に合致する（根拠が文書化されている）
- [ ] ラウンドトリップシリアライゼーションがすべてのデータ型を保持する
- [ ] エッジケースが処理される: 空コレクション、null/None値、Unicode、大きな数値
- [ ] 代表的なペイロードサイズでパフォーマンスがベンチマークされている
- [ ] 不正入力のエラーハンドリング（クラッシュではなく優雅な失敗）
- [ ] スキーマが文書化されている（JSON Schema、.proto、または同等物）

## よくある落とし穴

- **浮動小数点精度**: JSONはすべての数値をIEEE 754倍精度で表現する。金融/10進数精度には文字列エンコーディングを使用する。
- **日付/時刻処理**: JSONにはネイティブのdatetime型がない。フォーマット（ISO 8601）とタイムゾーン処理を常に文書化する。
- **スキーマ進化**: フィールドの追加や削除はコンシューマーを壊す可能性がある。Protobufはこれをうまく処理する; JSONには慎重なバージョニングが必要。
- **JSONでのバイナリデータ**: Base64エンコーディングはバイナリデータを約33%膨張させる。バイナリ重視のペイロードにはバイナリフォーマットを使用する。
- **YAMLのセキュリティ**: YAMLパーサーは`!!python/object`タグで任意のコードを実行する場合がある。常にセーフローダーを使用する。

## 関連スキル

- `design-serialization-schema` — スキーマ設計、バージョニング、進化戦略
- `implement-pharma-serialisation` — 医薬品シリアライゼーション（異なるドメイン、同じ名称）
- `create-quarto-report` — レポート用データ出力フォーマッティング
