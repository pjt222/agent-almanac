---
name: serialize-data-formats
description: >
  跨常见格式进行数据序列化和反序列化，包括 JSON、XML、YAML、Protocol Buffers、
  MessagePack 和 Apache Arrow/Parquet。涵盖格式选择标准、编码/解码模式、性能权衡
  和互操作性考虑。适用于选择 API 通信的线路格式、将结构化数据持久化到磁盘、在不同
  语言编写的系统之间交换数据、优化传输大小或解析速度，以及从一种序列化格式迁移到另一种。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json, xml, yaml, protobuf, messagepack, parquet, arrow, serialization
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 序列化数据格式

为您的用例选择和实现正确的数据序列化格式，确保编码/解码正确且关注性能。

## 适用场景

- 选择 API 通信的线路格式
- 将结构化数据持久化到磁盘或对象存储
- 在不同语言编写的系统之间交换数据
- 优化数据传输大小或解析速度
- 从一种序列化格式迁移到另一种

## 输入

- **必需**：要序列化的数据结构（模式或示例）
- **必需**：用例（API、存储、流式、分析）
- **可选**：性能要求（大小、速度、模式强制）
- **可选**：目标语言/运行时约束
- **可选**：人类可读性要求

## 步骤

### 第 1 步：选择正确的格式

| 格式 | 人类可读 | 模式 | 大小 | 速度 | 最适用于 |
|--------|---------|------|------|------|----------|
| JSON | 是 | 可选（JSON Schema） | 中等 | 中等 | REST API、配置、广泛互操作 |
| XML | 是 | XSD、DTD | 大 | 慢 | 企业/遗留系统、SOAP、文档 |
| YAML | 是 | 可选 | 中等 | 慢 | 配置文件、CI/CD、Kubernetes |
| Protocol Buffers | 否 | 必需（.proto） | 小 | 快 | gRPC、微服务、移动端 |
| MessagePack | 否 | 无 | 小 | 快 | 实时、嵌入式、Redis |
| Arrow/Parquet | 否 | 内置 | 非常小 | 非常快 | 分析、列式查询、数据湖 |

决策树：
1. **需要人工编辑？** -> YAML（配置）或 JSON（数据）
2. **需要严格模式 + 快速 RPC？** -> Protocol Buffers
3. **需要最小线路大小？** -> MessagePack 或 Protobuf
4. **需要列式分析？** -> Apache Parquet
5. **需要内存中交换？** -> Apache Arrow
6. **遗留企业集成？** -> XML

**预期结果：** 格式已选择，并记录了与用例要求匹配的理由。
**失败处理：** 如果需求冲突（如既要人类可读又要快速），优先考虑主要用例并记录权衡。

### 第 2 步：实现 JSON 序列化

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

**预期结果：** 往返序列化准确保留所有数据类型。
**失败处理：** 如果类型丢失（如日期变成字符串），在反序列化步骤中添加显式类型转换。

### 第 3 步：实现 Protocol Buffers

定义模式（`.proto` 文件）：

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

生成和使用：

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

**预期结果：** 二进制输出比等效的 JSON 小 3-10 倍。
**失败处理：** 如果 protoc 不可用，使用语言原生的 protobuf 库（如 Python 的 `betterproto`）。

### 第 4 步：实现 MessagePack

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

**预期结果：** MessagePack 输出对于典型载荷比 JSON 小 15-30%。
**失败处理：** 如果某种语言缺乏 MessagePack 支持，退回到 JSON 加压缩（gzip）。

### 第 5 步：实现 Apache Parquet（列式）

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

**预期结果：** Parquet 文件对于典型表格数据比 CSV 小 5-20 倍。
**失败处理：** 如果 Arrow 不可用，使用 `fastparquet`（Python）或 CSV 加 gzip 作为后备。

### 第 6 步：比较性能

为您的特定数据和用例运行基准测试：

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

**预期结果：** 基准测试结果指导生产环境的格式选择。
**失败处理：** 如果任何格式的性能不足，考虑将压缩（zstd、snappy）作为正交优化手段。

## 验证清单

- [ ] 所选格式与用例需求匹配（有文档化的理由）
- [ ] 往返序列化保留所有数据类型
- [ ] 边缘情况已处理：空集合、null/None 值、Unicode、大数字
- [ ] 已针对代表性载荷大小进行性能基准测试
- [ ] 格式错误输入的错误处理（优雅失败，不崩溃）
- [ ] 模式已记录（JSON Schema、.proto 或等效物）

## 常见问题

- **浮点精度**：JSON 将所有数字表示为 IEEE 754 双精度浮点数。对于金融/十进制精度，使用字符串编码。
- **日期/时间处理**：JSON 没有原生的 datetime 类型。始终记录格式（ISO 8601）和时区处理方式。
- **模式演进**：添加或删除字段可能破坏消费者。Protobuf 很好地处理了这一点；JSON 需要仔细的版本管理。
- **JSON 中的二进制数据**：Base64 编码使二进制数据膨胀约 33%。对于二进制密集型载荷，使用二进制格式。
- **YAML 安全性**：YAML 解析器可能通过 `!!python/object` 标签执行任意代码。始终使用安全加载器。

## 相关技能

- `design-serialization-schema` — 模式设计、版本管理和演进策略
- `implement-pharma-serialisation` — 药品序列化（不同领域，相同命名）
- `create-quarto-report` — 报告的数据输出格式化
