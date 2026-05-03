---
name: serialize-data-formats
locale: caveman
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

# Serialize Data Formats

Pick + implement right data serialization format for use case. Correct encoding/decoding + performance awareness.

## When Use

- Pick wire format for API comms
- Persist structured data to disk or object storage
- Exchange data between systems in different languages
- Optimize data transfer size or parse speed
- Migrate from one serialization format to another

## Inputs

- **Required**: Data structure to serialize (schema or example)
- **Required**: Use case (API, storage, streaming, analytics)
- **Optional**: Performance needs (size, speed, schema enforcement)
- **Optional**: Target language/runtime constraints
- **Optional**: Human readability needs

## Steps

### Step 1: Select Right Format

| Format | Human Readable | Schema | Size | Speed | Best For |
|--------|---------------|--------|------|-------|----------|
| JSON | Yes | Optional (JSON Schema) | Medium | Medium | REST APIs, config, broad interop |
| XML | Yes | XSD, DTD | Large | Slow | Enterprise/legacy, SOAP, documents |
| YAML | Yes | Optional | Medium | Slow | Config files, CI/CD, Kubernetes |
| Protocol Buffers | No | Required (.proto) | Small | Fast | gRPC, microservices, mobile |
| MessagePack | No | None | Small | Fast | Real-time, embedded, Redis |
| Arrow/Parquet | No | Built-in | Very Small | Very Fast | Analytics, columnar queries, data lakes |

Decision tree.
1. **Need human editing?** → YAML (config) or JSON (data)
2. **Need strict schema + fast RPC?** → Protocol Buffers
3. **Need smallest wire size?** → MessagePack or Protobuf
4. **Need columnar analytics?** → Apache Parquet
5. **Need in-memory interchange?** → Apache Arrow
6. **Legacy enterprise integration?** → XML

**Got:** Format selected with documented rationale matching use case.

**If fail:** Requirements conflict (human-readable AND fast)? Prioritize primary use case, note trade-off.

### Step 2: Implement JSON Serialization

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

**Got:** Round-trip serialization preserves all data types accurate.

**If fail:** Type lost (e.g., dates become strings)? Add explicit type conversion in deserialization step.

### Step 3: Implement Protocol Buffers

Define schema (`.proto` file).

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

Generate + use.

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

**Got:** Binary output 3-10x smaller than equivalent JSON.

**If fail:** protoc unavailable? Use language-native protobuf library (e.g., `betterproto` for Python).

### Step 4: Implement MessagePack

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

**Got:** MessagePack output 15-30% smaller than JSON for typical payloads.

**If fail:** Language lacks MessagePack support? Fall back to JSON with compression (gzip).

### Step 5: Implement Apache Parquet (Columnar)

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

**Got:** Parquet files 5-20x smaller than CSV for typical tabular data.

**If fail:** Arrow unavailable? Use `fastparquet` (Python) or CSV with gzip as fallback.

### Step 6: Compare Performance

Run benchmarks for your specific data + use case.

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

**Got:** Benchmark results guide format selection for prod use.

**If fail:** Performance insufficient for any format? Consider compression (zstd, snappy) as orthogonal optimization.

## Checks

- [ ] Selected format matches use case (documented rationale)
- [ ] Round-trip serialization preserves all data types
- [ ] Edge cases handled: empty collections, null/None values, Unicode, large numbers
- [ ] Performance benchmarked for representative payload sizes
- [ ] Error handling for malformed input (graceful failures, not crashes)
- [ ] Schema documented (JSON Schema, .proto, or equiv)

## Pitfalls

- **Floating-point precision**: JSON represents all numbers as IEEE 754 doubles. Use string encoding for financial/decimal precision.
- **Date/time handling**: JSON has no native datetime type. Always document format (ISO 8601) + timezone handling.
- **Schema evolution**: Adding or removing fields can break consumers. Protobuf handles this well; JSON needs careful versioning.
- **Binary data in JSON**: Base64 encoding inflates binary data by ~33%. Use binary format for binary-heavy payloads.
- **YAML security**: YAML parsers may execute arbitrary code via `!!python/object` tags. Always use safe loaders.

## See Also

- `design-serialization-schema` — schema design, versioning, evolution strategies
- `implement-pharma-serialisation` — pharmaceutical serialisation (different domain, same naming)
- `create-quarto-report` — data output formatting for reports
