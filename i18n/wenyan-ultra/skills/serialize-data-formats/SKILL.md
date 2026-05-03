---
name: serialize-data-formats
locale: wenyan-ultra
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

# 序資式

選與行正資序式於用例、含正編解與性意。

## 用

- 擇 API 通線式→用
- 持結構資於盤或物儲→用
- 異語系間交資→用
- 優傳大或解速→用
- 自一序式遷他→用

## 入

- **必**：所序資結構（譜或例）
- **必**：用例（API、儲、流、析）
- **可**：性需（大、速、譜強）
- **可**：標語/運限
- **可**：人讀需

## 行

### 一：擇正式

| Format | Human Readable | Schema | Size | Speed | Best For |
|--------|---------------|--------|------|-------|----------|
| JSON | Yes | Optional (JSON Schema) | Medium | Medium | REST APIs, config |
| XML | Yes | XSD, DTD | Large | Slow | Enterprise/legacy, SOAP |
| YAML | Yes | Optional | Medium | Slow | Config, CI/CD, k8s |
| Protocol Buffers | No | Required | Small | Fast | gRPC, microservices |
| MessagePack | No | None | Small | Fast | Real-time, embedded |
| Arrow/Parquet | No | Built-in | Very Small | Very Fast | Analytics, columnar |

決樹：
1. **需人改？** → YAML（配）或 JSON（資）
2. **需嚴譜 + 速 RPC？** → Protocol Buffers
3. **需最小線大？** → MessagePack 或 Protobuf
4. **需列析？** → Apache Parquet
5. **需內存交？** → Apache Arrow
6. **舊企接？** → XML

得：式選附文錄理合用例需。

敗：需衝（如人讀且速）→重主用例、註衡。

### 二：行 JSON 序

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

measurement = Measurement("sensor-01", 23.5, "celsius", datetime.now())
json_str = json.dumps(asdict(measurement), cls=CustomEncoder, indent=2)

data = json.loads(json_str)
```

```r
library(jsonlite)

df <- data.frame(sensor_id = "sensor-01", value = 23.5, unit = "celsius")
json_str <- jsonlite::toJSON(df, auto_unbox = TRUE, pretty = TRUE)

df_back <- jsonlite::fromJSON(json_str)
```

得：往返序保諸型準。

敗：型失（如日成串）→解步加顯型轉。

### 三：行 Protocol Buffers

定譜（`.proto` 檔）：

```protobuf
syntax = "proto3";
package sensors;

message Measurement {
  string sensor_id = 1;
  double value = 2;
  string unit = 3;
  int64 timestamp_ms = 4;
}

message MeasurementBatch {
  repeated Measurement measurements = 1;
}
```

生並用：

```bash
protoc --python_out=. sensors.proto
protoc --go_out=. sensors.proto
```

```python
from sensors_pb2 import Measurement, MeasurementBatch
import time

m = Measurement(
    sensor_id="sensor-01",
    value=23.5,
    unit="celsius",
    timestamp_ms=int(time.time() * 1000)
)
binary = m.SerializeToString()

m2 = Measurement()
m2.ParseFromString(binary)
```

得：二制出較等 JSON 小 3-10 倍。

敗：protoc 無→用語原 protobuf 庫（如 Python `betterproto`）。

### 四：行 MessagePack

```python
import msgpack
from datetime import datetime

def encode_datetime(obj):
    if isinstance(obj, datetime):
        return {"__datetime__": True, "s": obj.isoformat()}
    return obj

def decode_datetime(obj):
    if "__datetime__" in obj:
        return datetime.fromisoformat(obj["s"])
    return obj

data = {"sensor_id": "sensor-01", "value": 23.5, "ts": datetime.now()}

packed = msgpack.packb(data, default=encode_datetime)

unpacked = msgpack.unpackb(packed, object_hook=decode_datetime, raw=False)
```

得：MessagePack 出於典載較 JSON 小 15-30%。

敗：語缺 MessagePack 支→退 JSON 加壓（gzip）。

### 五：行 Apache Parquet（列）

```python
import pyarrow as pa
import pyarrow.parquet as pq
import pandas as pd

df = pd.DataFrame({
    "sensor_id": ["s-01", "s-02", "s-01", "s-03"] * 1000,
    "value": [23.5, 18.2, 24.1, 19.8] * 1000,
    "unit": ["celsius"] * 4000,
    "timestamp": pd.date_range("2025-01-01", periods=4000, freq="min")
})

table = pa.Table.from_pandas(df)
pq.write_table(table, "measurements.parquet", compression="snappy")

table_back = pq.read_table("measurements.parquet", columns=["sensor_id", "value"])
df_subset = table_back.to_pandas()
```

```r
library(arrow)

df <- data.frame(sensor_id = rep("s-01", 1000), value = rnorm(1000))
arrow::write_parquet(df, "measurements.parquet")

df_back <- arrow::read_parquet("measurements.parquet", col_select = c("value"))
```

得：Parquet 檔較 CSV 小 5-20 倍於典表資。

敗：Arrow 無→用 `fastparquet`（Python）或 CSV + gzip 退。

### 六：較性

行基準於汝特資與用例：

```python
import json, msgpack, time
import pyarrow as pa, pyarrow.parquet as pq

data = [{"id": i, "value": i * 0.1, "label": f"item-{i}"} for i in range(10000)]

start = time.perf_counter()
json_bytes = json.dumps(data).encode()
json_time = time.perf_counter() - start

start = time.perf_counter()
msgpack_bytes = msgpack.packb(data)
msgpack_time = time.perf_counter() - start

print(f"JSON:    {len(json_bytes):>8} bytes, {json_time*1000:.1f} ms")
print(f"MsgPack: {len(msgpack_bytes):>8} bytes, {msgpack_time*1000:.1f} ms")
```

得：基準果導產用式選。

敗：諸式性不足→考壓（zstd、snappy）為正交優。

## 驗

- [ ] 所選式合用例需（文錄理）
- [ ] 往返序保諸資型
- [ ] 邊例理：空集、null/None、Unicode、大數
- [ ] 性基於代表載大基準
- [ ] 誤理為畸入（雅敗非崩）
- [ ] 譜文錄（JSON Schema、.proto 等）

## 忌

- **浮精**：JSON 諸數為 IEEE 754 雙。財/十進精用串編
- **日時理**：JSON 無原日型。恆文錄式（ISO 8601）與時區理
- **譜演**：加除欄可破消費。Protobuf 善理；JSON 需慎本
- **JSON 內二**：Base64 編脹二 ~33%。二重載用二式
- **YAML 安**：YAML 解器可執任碼經 `!!python/object`。恆用安載

## 參

- `design-serialization-schema`
- `implement-pharma-serialisation`
- `create-quarto-report`
