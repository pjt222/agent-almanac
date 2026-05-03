---
name: serialize-data-formats
locale: wenyan-lite
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

# 序列化資料格式

為使用情境選擇並實作正確之資料序列化格式，附正確之編碼/解碼與效能意識。

## 適用時機

- 為 API 通訊選擇傳輸格式
- 將結構化資料持久化至磁碟或物件儲存
- 於以不同語言所寫之系統間交換資料
- 優化資料傳輸大小或解析速度
- 從一序列化格式遷移至另一

## 輸入

- **必要**：待序列化之資料結構（架構或範例）
- **必要**：使用情境（API、儲存、串流、分析）
- **選擇性**：效能要求（大小、速度、架構強制）
- **選擇性**：目標語言/執行環境限制
- **選擇性**：人類可讀要求

## 步驟

### 步驟一：選擇正確之格式

| 格式 | 人類可讀 | 架構 | 大小 | 速度 | 最適 |
|--------|---------------|--------|------|-------|----------|
| JSON | 是 | 選擇性（JSON Schema） | 中 | 中 | REST API、配置、廣互通 |
| XML | 是 | XSD、DTD | 大 | 慢 | 企業/遺留、SOAP、文件 |
| YAML | 是 | 選擇性 | 中 | 慢 | 配置文件、CI/CD、Kubernetes |
| Protocol Buffers | 否 | 必須（.proto） | 小 | 快 | gRPC、微服務、行動 |
| MessagePack | 否 | 無 | 小 | 快 | 即時、嵌入式、Redis |
| Arrow/Parquet | 否 | 內建 | 極小 | 極快 | 分析、列式查詢、資料湖 |

決策樹：
1. **需人工編輯？** → YAML（配置）或 JSON（資料）
2. **需嚴格架構 + 快速 RPC？** → Protocol Buffers
3. **需最小傳輸大小？** → MessagePack 或 Protobuf
4. **需列式分析？** → Apache Parquet
5. **需記憶體內交換？** → Apache Arrow
6. **遺留企業整合？** → XML

**預期：** 格式已選，附符合使用情境要求之書面理由。
**失敗時：** 若要求衝突（如人類可讀且快），優先處理主要使用情境並記錄權衡。

### 步驟二：實作 JSON 序列化

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

**預期：** 往返序列化準確保留所有資料類型。
**失敗時：** 若類型遺失（如日期變字串），於反序列化步驟中加入明確類型轉換。

### 步驟三：實作 Protocol Buffers

定義架構（`.proto` 文件）：

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

生成並使用：

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

**預期：** 二進位輸出較等量 JSON 小 3-10 倍。
**失敗時：** 若 protoc 不可用，用語言原生之 protobuf 函式庫（如 Python 之 `betterproto`）。

### 步驟四：實作 MessagePack

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

**預期：** MessagePack 輸出對典型酬載較 JSON 小 15-30%。
**失敗時：** 若語言缺 MessagePack 支援，退回 JSON 加壓縮（gzip）。

### 步驟五：實作 Apache Parquet（列式）

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

**預期：** Parquet 文件對典型表格資料較 CSV 小 5-20 倍。
**失敗時：** 若 Arrow 不可用，用 `fastparquet`（Python）或 CSV 加 gzip 作後備。

### 步驟六：比較效能

對你之具體資料與使用情境跑基準：

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

**預期：** 基準結果引導生產用之格式選擇。
**失敗時：** 若效能對任何格式皆不足，考慮壓縮（zstd、snappy）作為正交優化。

## 驗證

- [ ] 所選格式符合使用情境要求（書面理由）
- [ ] 往返序列化保留所有資料類型
- [ ] 邊緣情況已處理：空集合、null/None 值、Unicode、大數
- [ ] 效能已對代表性酬載大小作基準
- [ ] 對畸形輸入有錯誤處理（優雅失敗，非崩潰）
- [ ] 架構已記錄（JSON Schema、.proto 或等效）

## 常見陷阱

- **浮點精度**：JSON 將所有數字表為 IEEE 754 倍精度。對金融/十進位精度用字串編碼。
- **日期/時間處理**：JSON 無原生 datetime 類型。應始終記錄格式（ISO 8601）與時區處理。
- **架構演進**：增刪欄位可能破壞消費者。Protobuf 處理之佳；JSON 需謹慎版本化。
- **JSON 中之二進位資料**：Base64 編碼將二進位資料膨脹約 33%。對二進位重之酬載用二進位格式。
- **YAML 安全**：YAML 解析器可能透過 `!!python/object` 標籤執行任意代碼。應始終用安全載入器。

## 相關技能

- `design-serialization-schema` — 架構設計、版本化與演進策略
- `implement-pharma-serialisation` — 製藥序列化（不同領域，同名）
- `create-quarto-report` — 報告之資料輸出格式
