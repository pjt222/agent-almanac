---
name: serialize-data-formats
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Serialize+deserialize across JSON|XML|YAML|Protobuf|MessagePack|Arrow/Parquet. Format selection, encode/decode patterns, perf tradeoffs, interop. Use → choose wire format for API, persist structured data to disk, exchange between langs, optimize size|speed, migrate formats.
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

Select+impl right serialization format → correct encode/decode + perf awareness.

## Use When

- Wire format for API
- Persist structured data → disk|object storage
- Exchange between langs
- Optimize size|speed
- Migrate formats

## In

- **Required**: Data structure (schema|example)
- **Required**: Use case (API|storage|stream|analytics)
- **Optional**: Perf reqs (size|speed|schema enforce)
- **Optional**: Target lang|runtime constraints
- **Optional**: Human readability

## Do

### Step 1: Select Format

| Format | Human Readable | Schema | Size | Speed | Best For |
|--------|---------------|--------|------|-------|----------|
| JSON | Yes | Optional (JSON Schema) | Medium | Medium | REST APIs, config, broad interop |
| XML | Yes | XSD, DTD | Large | Slow | Enterprise/legacy, SOAP, documents |
| YAML | Yes | Optional | Medium | Slow | Config files, CI/CD, Kubernetes |
| Protocol Buffers | No | Required (.proto) | Small | Fast | gRPC, microservices, mobile |
| MessagePack | No | None | Small | Fast | Real-time, embedded, Redis |
| Arrow/Parquet | No | Built-in | Very Small | Very Fast | Analytics, columnar queries, data lakes |

Decision tree:
1. **Human edit?** → YAML (config) | JSON (data)
2. **Strict schema + fast RPC?** → Protobuf
3. **Smallest wire?** → MessagePack | Protobuf
4. **Columnar analytics?** → Parquet
5. **In-memory interchange?** → Arrow
6. **Legacy enterprise?** → XML

→ Format selected w/ documented rationale.

If err: reqs conflict (human + fast) → prioritize primary use case + note tradeoff.

### Step 2: JSON Serialize

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

→ Round-trip preserves all types accurately.

If err: type lost (dates → strings) → add explicit conversion in deserialize.

### Step 3: Protobuf

`.proto`:

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

Gen+use:

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

→ Binary 3-10x smaller than JSON.

If err: protoc unavail → lang-native lib (`betterproto` Py).

### Step 4: MessagePack

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

→ Output 15-30% smaller than JSON for typical payloads.

If err: lang lacks MessagePack → fallback JSON+gzip.

### Step 5: Parquet (Columnar)

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

→ Parquet 5-20x smaller than CSV for tabular.

If err: Arrow unavail → `fastparquet` (Py)|CSV+gzip fallback.

### Step 6: Compare Perf

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

→ Benchmarks guide format for prod.

If err: insufficient perf any format → consider compression (zstd, snappy) as orthogonal optimization.

## Check

- [ ] Format matches use case (rationale documented)
- [ ] Round-trip preserves all types
- [ ] Edge cases: empty, null, Unicode, large nums
- [ ] Perf benchmarked for representative sizes
- [ ] Err handling for malformed (graceful fail)
- [ ] Schema documented (JSON Schema|.proto|equiv)

## Traps

- **Float precision**: JSON = IEEE 754 doubles. String encoding for financial.
- **Date/time**: No native JSON datetime. Always document format (ISO 8601) + timezone.
- **Schema evolution**: Add|remove fields can break consumers. Protobuf good; JSON needs careful versioning.
- **Binary in JSON**: Base64 inflates ~33%. Binary format for binary-heavy.
- **YAML security**: Parsers may exec arbitrary code via `!!python/object` tags. Always safe loaders.

## →

- `design-serialization-schema` — schema design, versioning, evolution
- `implement-pharma-serialisation` — pharma serialisation (diff domain, same naming)
- `create-quarto-report` — data output for reports
