---
name: design-serialization-schema
description: >
  使用 JSON Schema、Protocol Buffer 定义或 Apache Avro 设计序列化模式。涵盖模式
  版本管理、向后兼容性、验证规则和长期数据格式的演进策略。适用于定义新的 API 合约
  或数据交换格式、在不破坏消费者的情况下向现有模式添加字段、在模式版本之间迁移、
  在模式系统之间选择，以及记录自动化执行的数据验证规则。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json-schema, protobuf, avro, schema-evolution, versioning, compatibility
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 设计序列化模式

创建版本管理良好的序列化模式，使其能够优雅地演进而不破坏消费者。

## 适用场景

- 定义新的 API 合约或数据交换格式
- 在不破坏消费者的情况下向现有模式添加字段
- 在模式版本之间迁移
- 在模式系统（JSON Schema、Protobuf、Avro）之间选择
- 记录自动化执行的数据验证规则

## 输入

- **必需**：数据模型（实体关系、字段类型、约束）
- **必需**：兼容性要求（谁消费此数据、旧格式必须可读多久）
- **可选**：要演进的现有模式
- **可选**：性能要求（验证速度、模式注册中心集成）
- **可选**：目标序列化格式（JSON、二进制、列式）

## 步骤

### 第 1 步：选择模式系统

| 系统 | 格式 | 优势 | 最适用于 |
|------|------|------|----------|
| JSON Schema | JSON | 广泛支持、灵活验证 | REST API、配置验证 |
| Protocol Buffers | 二进制 | 紧凑、快速、强类型、内置演进 | gRPC、微服务 |
| Apache Avro | 二进制/JSON | 模式在数据中、优秀的演进支持 | Kafka、数据管道 |
| XML Schema (XSD) | XML | 全面的类型系统、命名空间支持 | 企业/遗留 SOAP |
| TypeBox/Zod | TypeScript | 类型推断、运行时验证 | TypeScript API |

**预期结果：** 根据生态系统、性能需求和演进要求选择模式系统。
**失败处理：** 如果不确定，从 JSON Schema 开始——它拥有最广泛的工具支持，可以叠加到现有的 JSON API 上。

### 第 2 步：设计核心模式

#### JSON Schema 示例：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/measurement/v1",
  "title": "Measurement",
  "description": "A sensor measurement reading",
  "type": "object",
  "required": ["sensor_id", "value", "unit", "timestamp"],
  "properties": {
    "sensor_id": {
      "type": "string",
      "pattern": "^[a-z]+-[0-9]+$",
      "description": "Unique sensor identifier (lowercase-digits format)"
    },
    "value": {
      "type": "number",
      "description": "Measured value"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit", "kelvin", "percent", "ppm"],
      "description": "Unit of measurement"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp with timezone"
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true,
      "description": "Optional key-value metadata"
    }
  },
  "additionalProperties": false
}
```

#### Protocol Buffers 示例：

```protobuf
syntax = "proto3";
package sensors.v1;

import "google/protobuf/timestamp.proto";

message Measurement {
  string sensor_id = 1;
  double value = 2;
  Unit unit = 3;
  google.protobuf.Timestamp timestamp = 4;
  map<string, string> metadata = 5;
}

enum Unit {
  UNIT_UNSPECIFIED = 0;
  UNIT_CELSIUS = 1;
  UNIT_FAHRENHEIT = 2;
  UNIT_KELVIN = 3;
  UNIT_PERCENT = 4;
  UNIT_PPM = 5;
}
```

#### Apache Avro 示例：

```json
{
  "type": "record",
  "name": "Measurement",
  "namespace": "com.example.sensors",
  "doc": "A sensor measurement reading",
  "fields": [
    {"name": "sensor_id", "type": "string", "doc": "Unique sensor identifier"},
    {"name": "value", "type": "double", "doc": "Measured value"},
    {"name": "unit", "type": {"type": "enum", "name": "Unit", "symbols": ["CELSIUS", "FAHRENHEIT", "KELVIN", "PERCENT", "PPM"]}},
    {"name": "timestamp", "type": {"type": "long", "logicalType": "timestamp-millis"}},
    {"name": "metadata", "type": ["null", {"type": "map", "values": "string"}], "default": null}
  ]
}
```

**预期结果：** 模式具有自文档化的描述、约束和清晰的类型定义。
**失败处理：** 如果数据模型尚不稳定，将模式标记为 `draft` 并避免发布到注册中心。

### 第 3 步：规划模式演进

兼容性规则：

| 变更 | 向后兼容？ | 向前兼容？ | 安全？ |
|------|-----------|-----------|--------|
| 添加可选字段 | 是 | 是 | 是 |
| 添加必需字段 | 否 | 是 | 否（破坏现有消费者） |
| 删除可选字段 | 是 | 否 | 谨慎（生产者可能仍在发送） |
| 删除必需字段 | 是 | 否 | 谨慎 |
| 重命名字段 | 否 | 否 | 否（使用别名 + 弃用） |
| 更改字段类型 | 否 | 否 | 否（添加新字段，弃用旧字段） |
| 添加枚举值 | 是（如果消费者忽略未知值） | 否 | 取决于实现 |
| 删除枚举值 | 否 | 是 | 否 |

安全演进策略：
1. **只添加可选字段**，带有合理的默认值
2. **永远不要删除或重命名**——改为弃用
3. **在标识符中包含版本**（`v1`、`v2`）
4. **使用模式注册中心**处理二进制格式（Confluent Schema Registry 用于 Avro/Protobuf）

#### Protobuf 演进规则：
```protobuf
// v1 — original
message Measurement {
  string sensor_id = 1;
  double value = 2;
  Unit unit = 3;
}

// v2 — safe evolution
message Measurement {
  string sensor_id = 1;
  double value = 2;
  Unit unit = 3;
  google.protobuf.Timestamp timestamp = 4;
  reserved 6;
  reserved "old_sensor_name";
}
```

#### JSON Schema 版本管理：
```json
{
  "$id": "https://example.com/schemas/measurement/v2",
  "allOf": [
    {"$ref": "https://example.com/schemas/measurement/v1"},
    {
      "properties": {
        "location": {
          "type": "string",
          "description": "Added in v2: GPS coordinates"
        }
      }
    }
  ]
}
```

**预期结果：** 演进计划已记录：哪些变更是安全的，哪些需要新版本。
**失败处理：** 如果破坏性变更不可避免，对模式进行版本升级（v1 -> v2）并在迁移期间维持并行支持。

### 第 4 步：实现模式验证

```python
# JSON Schema validation (Python)
from jsonschema import validate, ValidationError
import json

schema = json.load(open("measurement_v1.json"))

def validate_measurement(data: dict) -> list[str]:
    errors = []
    try:
        validate(instance=data, schema=schema)
    except ValidationError as e:
        errors.append(f"{e.json_path}: {e.message}")
    return errors

# Usage
errors = validate_measurement({"sensor_id": "s-01", "value": "not_a_number"})
```

```typescript
// TypeScript with Zod (runtime + compile-time)
import { z } from 'zod';

const MeasurementSchema = z.object({
  sensor_id: z.string().regex(/^[a-z]+-[0-9]+$/),
  value: z.number(),
  unit: z.enum(['celsius', 'fahrenheit', 'kelvin', 'percent', 'ppm']),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string()).optional(),
});

type Measurement = z.infer<typeof MeasurementSchema>;

const result = MeasurementSchema.safeParse(inputData);
if (!result.success) {
  console.error(result.error.issues);
}
```

**预期结果：** 验证在系统边界（API 端点、文件摄取）对所有传入数据运行。
**失败处理：** 记录验证错误及完整载荷（对敏感字段进行脱敏）以便调试。

### 第 5 步：记录模式

创建模式文档页面，包含概述、字段表、变更日志和兼容性策略。

**预期结果：** 文档自动生成或与模式定义保持同步。
**失败处理：** 如果文档与模式不同步，添加 CI 检查来验证文档与模式源的一致性。

## 验证清单

- [ ] 模式使用适合用例的系统（JSON Schema、Protobuf、Avro）
- [ ] 所有字段都有类型、描述和约束
- [ ] 必需与可选字段明确定义
- [ ] 演进策略已记录（安全变更、版本管理策略）
- [ ] 在系统边界实现了验证
- [ ] 模式已进行版本管理并有变更日志
- [ ] 往返测试：序列化 -> 反序列化 -> 比较确认无数据丢失

## 常见问题

- **过早过度约束**：对新模式进行严格验证会阻碍迭代。先宽松（`additionalProperties: true`），后收紧。
- **无默认值**：添加没有默认值的必需字段会破坏所有现有数据。新字段始终提供默认值。
- **忽略 null**：许多模式未清楚处理 null/缺失字段。明确区分可空与可选。
- **版本放在载荷中而非 URL 中**：对于长期数据（存储、事件），将模式版本嵌入数据本身，而不仅仅是端点 URL。
- **枚举完整性**：添加新枚举值可能导致使用穷举 switch 语句的消费者崩溃。记录未知值应优雅处理。

## 相关技能

- `serialize-data-formats` — 格式选择和编码/解码实现
- `implement-pharma-serialisation` — 药品序列化（监管模式）
- `write-validation-documentation` — 受监管模式的验证文档
