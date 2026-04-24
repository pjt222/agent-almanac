---
name: design-serialization-schema
locale: wenyan-lite
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

# 設計序列化模式

建版本良好之序列化模式，俾其演化不傷使用者。

## 適用時機

- 定新 API 合約或數據交換格式
- 於既有模式增欄位而不傷使用者
- 於模式版本之間遷移
- 擇模式系統（JSON Schema、Protobuf、Avro）
- 錄數據驗證規則以便自動執行

## 輸入

- **必要**：數據模型（實體關係、欄位類型、約束）
- **必要**：相容要求（誰消費此數據、舊格式須讀多久）
- **選擇**：待演化之既有模式
- **選擇**：性能要求（驗證速度、模式註冊中心整合）
- **選擇**：目標序列化格式（JSON、二進、欄式）

## 步驟

### 步驟一：擇模式系統

| System | Format | Strengths | Best For |
|--------|--------|-----------|----------|
| JSON Schema | JSON | Widely supported, flexible validation | REST APIs, config validation |
| Protocol Buffers | Binary | Compact, fast, strong typing, built-in evolution | gRPC, microservices |
| Apache Avro | Binary/JSON | Schema in data, excellent evolution support | Kafka, data pipelines |
| XML Schema (XSD) | XML | Comprehensive typing, namespace support | Enterprise/legacy SOAP |
| TypeBox/Zod | TypeScript | Type inference, runtime validation | TypeScript APIs |

**預期：** 依生態、性能、演化需求擇定模式系統。
**失敗時：** 若未決，自 JSON Schema 始——工具支援最廣，可層疊於既有 JSON API 之上。

### 步驟二：設計核心模式

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

**預期：** 模式自帶文檔，有描述、約束、明確類型定義。
**失敗時：** 數據模型尚未穩定時，標模式為 `draft`，勿推至註冊中心。

### 步驟三：籌模式演化

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

安全演化策略：
1. **唯加可選欄位**，並附合理之預設值
2. **永勿除或改名**——棄用取而代之
3. **於識別符中加版本**（`v1`、`v2`）
4. **用模式註冊中心**（二進格式之 Confluent Schema Registry 供 Avro/Protobuf 用）

#### Protobuf 演化規則：
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

**預期：** 演化計劃有錄：何改為安、何須新版本。
**失敗時：** 破壞性變更不可免時，版本遞進（v1 → v2），遷移期間並行支援。

### 步驟四：實作模式驗證

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

**預期：** 所有入境數據於系統邊界（API 端點、文件攝取）皆行驗證。
**失敗時：** 錄驗證錯誤時附完整負載（敏感欄位刪之），以資除錯。

### 步驟五：錄模式

建模式文檔頁：

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

**預期：** 文檔自動生成或與模式定義同步。
**失敗時：** 文檔與模式偏離時，加 CI 檢查以對照模式原本驗證之。

## 驗證

- [ ] 模式系統合於用例（JSON Schema、Protobuf、Avro）
- [ ] 所有欄位皆有類型、描述、約束
- [ ] 必要與可選欄位皆明示
- [ ] 演化策略已錄（安全變更、版本化政策）
- [ ] 驗證已施於系統邊界
- [ ] 模式已版本化並有變更日誌
- [ ] 往返測試：序列化 → 反序列化 → 比對以證無數據丟失

## 常見陷阱

- **過早強約束**：新模式嚴驗阻迭代。初寬鬆（`additionalProperties: true`），後緊之。
- **無預設值**：加必要欄位而無預設即破壞所有舊數據。新欄位恆須預設。
- **忽 null**：許多模式未明理 null/缺失欄位。須明示可空與可選之別。
- **版本於負載非於 URL**：長壽數據（存儲、事件）之模式版本應嵌數據之中，非僅於端點 URL。
- **列舉窮盡性**：加新列舉值可致用窮盡 switch 之使用者崩潰。明示未知值須優雅處置。

## 相關技能

- `serialize-data-formats` — 格式之擇與編解實作
- `implement-pharma-serialisation` — 藥品序列化（法規模式）
- `write-validation-documentation` — 受管制模式之驗證文檔
