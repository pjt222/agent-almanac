---
name: serialize-data-formats
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Serialize and deserialize data across common formats including JSON, XML,
  YAML, Protocol Buffers, MessagePack, and Apache Arrow/Parquet. Covers
  format selection criteria, encoding/decoding patterns, performance
  trade-offs, and interoperability considerations. Use when choosing a wire
  format for API communication, persisting structured data to disk, exchanging
  data between systems written in different languages, optimizing transfer size
  or parsing speed, or migrating from one serialization format to another.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json, xml, yaml, protobuf, messagepack, parquet, arrow, serialization
---

# 序化諸數式

擇與施合用之數序化式，附正之編解與性能之識。

## 用時

- 為 API 通擇線之式乃用
- 結構數存於盤或對象存儲乃用
- 異語系統間交數乃用
- 優傳大或解速乃用
- 自一序化式遷至他乃用

## 入

- **必要**：序化之數結構（規或例）
- **必要**：用例（API、存、流、析）
- **可選**：性能之求（大、速、規強）
- **可選**：目標語/運行之限
- **可選**：人讀之求

## 法

### 第一步：擇正之式

| 式 | 人可讀 | 規 | 大 | 速 | 宜於 |
|--------|---------------|--------|------|-------|----------|
| JSON | 是 | 選（JSON Schema） | 中 | 中 | REST API、配、廣兼 |
| XML | 是 | XSD、DTD | 大 | 慢 | 企業/舊、SOAP、文 |
| YAML | 是 | 選 | 中 | 慢 | 配、CI/CD、Kubernetes |
| Protocol Buffers | 否 | 必（.proto） | 小 | 速 | gRPC、微服、移動 |
| MessagePack | 否 | 無 | 小 | 速 | 實時、嵌、Redis |
| Arrow/Parquet | 否 | 內建 | 甚小 | 甚速 | 析、列查、數湖 |

決樹：

1. **需人編乎？** → YAML（配）或 JSON（數）
2. **需嚴規與速 RPC 乎？** → Protocol Buffers
3. **需最小線大乎？** → MessagePack 或 Protobuf
4. **需列析乎？** → Apache Parquet
5. **需內存交換乎？** → Apache Arrow
6. **舊企業集乎？** → XML

得：式已擇，附書面之由合用例之求。

敗則：求衝（如人讀且速），先首用例，記其權衡。

### 第二步：施 JSON 之序化

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

# Custom encoder for non-standard types
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

# Serialize
measurement = Measurement("sensor-01", 23.5, "celsius", datetime.now())
json_str = json.dumps(asdict(measurement), cls=CustomEncoder, indent=2)

# Deserialize
data = json.loads(json_str)
```

```r
# R: JSON with jsonlite
library(jsonlite)

# Serialize
df <- data.frame(sensor_id = "sensor-01", value = 23.5, unit = "celsius")
json_str <- jsonlite::toJSON(df, auto_unbox = TRUE, pretty = TRUE)

# Deserialize
df_back <- jsonlite::fromJSON(json_str)
```

得：往返之序化保諸類確。

敗則：類失（如日成串），於解步加明之類轉。

### 第三步：施 Protocol Buffers

定規（`.proto` 文件）：

```protobuf
syntax = "proto3";
package sensors;

message Measurement {
  string sensor_id = 1;
  double value = 2;
  string unit = 3;
  int64 timestamp_ms = 4;  // Unix milliseconds
}

message MeasurementBatch {
  repeated Measurement measurements = 1;
}
```

生而用：

```bash
# Generate Python code
protoc --python_out=. sensors.proto

# Generate Go code
protoc --go_out=. sensors.proto
```

```python
from sensors_pb2 import Measurement, MeasurementBatch
import time

# Serialize
m = Measurement(
    sensor_id="sensor-01",
    value=23.5,
    unit="celsius",
    timestamp_ms=int(time.time() * 1000)
)
binary = m.SerializeToString()  # Compact binary

# Deserialize
m2 = Measurement()
m2.ParseFromString(binary)
```

得：二進制出小於等價 JSON 三至十倍。

敗則：protoc 不可得，用語原生之 protobuf 庫（如 Python 之 `betterproto`）。

### 第四步：施 MessagePack

```python
import msgpack
from datetime import datetime

# Custom packing for datetime
def encode_datetime(obj):
    if isinstance(obj, datetime):
        return {"__datetime__": True, "s": obj.isoformat()}
    return obj

def decode_datetime(obj):
    if "__datetime__" in obj:
        return datetime.fromisoformat(obj["s"])
    return obj

data = {"sensor_id": "sensor-01", "value": 23.5, "ts": datetime.now()}

# Serialize (smaller than JSON, faster than JSON)
packed = msgpack.packb(data, default=encode_datetime)

# Deserialize
unpacked = msgpack.unpackb(packed, object_hook=decode_datetime, raw=False)
```

得：MessagePack 之出於典型載小於 JSON 15-30%。

敗則：語無 MessagePack 之支，退至 JSON 加壓縮（gzip）。

### 第五步：施 Apache Parquet（列）

```python
import pyarrow as pa
import pyarrow.parquet as pq
import pandas as pd

# Create data
df = pd.DataFrame({
    "sensor_id": ["s-01", "s-02", "s-01", "s-03"] * 1000,
    "value": [23.5, 18.2, 24.1, 19.8] * 1000,
    "unit": ["celsius"] * 4000,
    "timestamp": pd.date_range("2025-01-01", periods=4000, freq="min")
})

# Write Parquet (columnar, compressed)
table = pa.Table.from_pandas(df)
pq.write_table(table, "measurements.parquet", compression="snappy")

# Read Parquet (can read specific columns without loading all data)
table_back = pq.read_table("measurements.parquet", columns=["sensor_id", "value"])
df_subset = table_back.to_pandas()
```

```r
# R: Parquet with arrow
library(arrow)

# Write
df <- data.frame(sensor_id = rep("s-01", 1000), value = rnorm(1000))
arrow::write_parquet(df, "measurements.parquet")

# Read (with column selection — only reads selected columns from disk)
df_back <- arrow::read_parquet("measurements.parquet", col_select = c("value"))
```

得：Parquet 文件於典型表數小於 CSV 5-20 倍。

敗則：Arrow 不可得，用 `fastparquet`（Python）或 CSV 加 gzip 為退。

### 第六步：比性能

為汝之數與用例行基準：

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

得：基準之果導生產用之式擇。

敗則：諸式皆性能不足，考壓縮（zstd、snappy）為正交之優。

## 驗

- [ ] 所擇式合用例之求（書面之由）
- [ ] 往返之序化保諸類
- [ ] 邊例已處：空集、null/None、Unicode、大數
- [ ] 性能於代表載大已基準
- [ ] 誤入之處（柔敗，非崩）
- [ ] 規已書（JSON Schema、.proto、或等者）

## 陷

- **浮點之精**：JSON 諸數皆為 IEEE 754 之雙。財/十之精用串編
- **日時之處**：JSON 無原生 datetime 之類。常書其式（ISO 8601）與時區之處
- **規進**：加減域可破消費者。Protobuf 處之佳；JSON 需慎之版
- **JSON 中之二進制**：Base64 編膨脹二進制約 33%。重二進制之載用二進制式
- **YAML 之安**：YAML 解器或於 `!!python/object` 標下行任意碼。常用安載

## 參

- `design-serialization-schema` — 規之設、版、進策
- `implement-pharma-serialisation` — 藥之序化（異域同名）
- `create-quarto-report` — 報之數出之式
