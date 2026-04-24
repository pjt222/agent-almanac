---
name: design-serialization-schema
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Design serialization schemas using JSON Schema, Protocol Buffer definitions,
  or Apache Avro. Covers schema versioning, backwards compatibility, validation
  rules, and evolution strategies for long-lived data formats. Use when defining
  a new API contract or data interchange format, adding fields to an existing
  schema without breaking consumers, migrating between schema versions, choosing
  between schema systems, or documenting data validation rules for automated
  enforcement.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json-schema, protobuf, avro, schema-evolution, versioning, compatibility
---

# 序列化模式之設

立版本清明之序列化模式，使之隨時演進而不破消費者。

## 用時

- 定新 API 契約或資料交換格式
- 於既有模式加欄而不破消費者
- 於模式版本間遷移
- 擇模式系統（JSON Schema、Protobuf、Avro）
- 書用於自動執行之資料驗證規則

## 入

- **必要**：資料模型（實體關係、欄類型、約束）
- **必要**：相容之要（誰消費此資料，舊格式須可讀多久）
- **可選**：欲演進之既有模式
- **可選**：性能之要（驗證速度、模式註冊表整合）
- **可選**：目標序列化格式（JSON、二進制、列式）

## 法

### 第一步：擇模式系統

| System | Format | Strengths | Best For |
|--------|--------|-----------|----------|
| JSON Schema | JSON | Widely supported, flexible validation | REST APIs, config validation |
| Protocol Buffers | Binary | Compact, fast, strong typing, built-in evolution | gRPC, microservices |
| Apache Avro | Binary/JSON | Schema in data, excellent evolution support | Kafka, data pipelines |
| XML Schema (XSD) | XML | Comprehensive typing, namespace support | Enterprise/legacy SOAP |
| TypeBox/Zod | TypeScript | Type inference, runtime validation | TypeScript APIs |

**得：** 依生態、性能之要與演進之需而擇模式系統。
**敗則：** 不確則始於 JSON Schema——工具支持最廣，可疊於既有 JSON API 之上。

### 第二步：設核心模式

#### JSON Schema 例：

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

#### Protocol Buffers 例：

```protobuf
syntax = "proto3";
package sensors.v1;

import "google/protobuf/timestamp.proto";

// Measurement represents a single sensor reading.
message Measurement {
  string sensor_id = 1;         // Unique sensor identifier
  double value = 2;             // Measured value
  Unit unit = 3;                // Unit of measurement
  google.protobuf.Timestamp timestamp = 4;
  map<string, string> metadata = 5; // Optional key-value metadata
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

#### Apache Avro 例：

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

**得：** 模式自帶說明，含描述、約束、類型之明定。
**敗則：** 資料模型未穩則記為 `draft` 而勿發至註冊表。

### 第三步：謀模式之演進

相容規則：

| Change | Backwards Compatible? | Forwards Compatible? | Safe? |
|--------|----------------------|---------------------|-------|
| Add optional field | Yes | Yes | Yes |
| Add required field | No | Yes | No (breaks existing consumers) |
| Remove optional field | Yes | No | Careful (producers may still send) |
| Remove required field | Yes | No | Careful |
| Rename a field | No | No | No (use alias + deprecation) |
| Change field type | No | No | No (add new field, deprecate old) |
| Add enum value | Yes (if consumers ignore unknown) | No | Depends on implementation |
| Remove enum value | No | Yes | No |

穩演進之策：
1. **僅加可選欄**，附合理默認值
2. **勿除勿改名**——棄用之可也
3. **標識符中標版本**（`v1`、`v2`）
4. **用模式註冊表**以處二進制格式（Avro/Protobuf 之 Confluent Schema Registry）

#### Protobuf 演進規則：
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
  // NEW: added in v2 — old clients ignore this field
  google.protobuf.Timestamp timestamp = 4;
  // DEPRECATED: use sensor_id instead
  reserved 6;
  reserved "old_sensor_name";
}
```

#### JSON Schema 版本化：
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

**得：** 演進之謀已書：何改穩、何改須新版。
**敗則：** 破壞性改不可避則升版（v1 → v2），遷移期並行支持。

### 第四步：施模式驗證

```python
# JSON Schema validation (Python)
from jsonschema import validate, ValidationError
import json

schema = json.load(open("measurement_v1.json"))

def validate_measurement(data: dict) -> list[str]:
    """Validate a measurement against the schema. Returns list of errors."""
    errors = []
    try:
        validate(instance=data, schema=schema)
    except ValidationError as e:
        errors.append(f"{e.json_path}: {e.message}")
    return errors

# Usage
errors = validate_measurement({"sensor_id": "s-01", "value": "not_a_number"})
# → ["$.value: 'not_a_number' is not of type 'number'"]
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

// Validation
const result = MeasurementSchema.safeParse(inputData);
if (!result.success) {
  console.error(result.error.issues);
}
```

**得：** 系統邊界（API 端點、文件攝入）處之入資料皆行驗證。
**敗則：** 記驗證錯誤及全負載（遮蔽敏感欄）以利排查。

### 第五步：書模式之文檔

立模式文檔頁：

```markdown
# Measurement Schema (v1)

## Overview
Represents a single sensor reading with metadata.

## Fields
| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| sensor_id | string | Yes | Unique sensor ID | Pattern: `^[a-z]+-[0-9]+$` |
| value | number | Yes | Measured value | Any valid IEEE 754 double |
| unit | enum | Yes | Unit of measurement | One of: celsius, fahrenheit, kelvin, percent, ppm |
| timestamp | string | Yes | Reading time | ISO 8601 with timezone |
| metadata | object | No | Key-value pairs | String keys and values |

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| v1 | 2025-03-01 | Initial schema |

## Compatibility
- **Backwards**: Consumers of v1 will continue to work with future versions
- **Policy**: Only additive, optional field changes between minor versions
```

**得：** 文檔自動生成或隨模式定義同步。
**敗則：** 文檔與模式偏離則於 CI 中加察驗文檔對模式源之合。

## 驗

- [ ] 模式用合於用例之系統（JSON Schema、Protobuf、Avro）
- [ ] 諸欄皆有類型、描述、約束
- [ ] 必選欄與可選欄明分
- [ ] 演進之策已書（穩改、版本化政策）
- [ ] 系統邊界處已施驗證
- [ ] 模式已版本化且有變更日誌
- [ ] 往返測試：序列化 → 反序列化 → 比對，證無資料失

## 陷

- **過早過嚴**：新模式嚴驗阻迭代。始時寬（`additionalProperties: true`），後漸收緊
- **無默認值**：加必選欄而無默認則破諸既有資料。新欄恆備默認
- **略 null**：諸模式不明處 null/缺欄。明分可空與可選
- **版本於負載而非 URL**：長存資料（儲存、事件）將模式版本嵌於資料中，勿僅於端點 URL
- **枚舉之盡**：加新枚舉值或使用窮盡 switch 之消費者崩。書明未知值宜優雅處之

## 參

- `serialize-data-formats` — 格式之擇與編解碼之實現
- `implement-pharma-serialisation` — 藥業序列化（監管模式）
- `write-validation-documentation` — 監管模式之驗證文檔
