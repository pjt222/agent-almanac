---
name: design-serialization-schema
locale: wenyan-ultra
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

# 設序列化綱

立善版之序綱，演進而不破用者。

## 用

- 立新 API 契或數換格
- 舊綱添欄而不破用者
- 於綱版間遷
- 擇綱系（JSON Schema、Protobuf、Avro）
- 書數驗規以動施

## 入

- **必**：數模（實體關、欄類、限）
- **必**：相容求（誰用此數、舊格宜可讀多久）
- **可**：可演之舊綱
- **可**：效求（驗速、綱註冊表整合）
- **可**：目序格（JSON、二進、列式）

## 行

### 一：擇綱系

| System | Format | Strengths | Best For |
|--------|--------|-----------|----------|
| JSON Schema | JSON | Widely supported, flexible validation | REST APIs, config validation |
| Protocol Buffers | Binary | Compact, fast, strong typing, built-in evolution | gRPC, microservices |
| Apache Avro | Binary/JSON | Schema in data, excellent evolution support | Kafka, data pipelines |
| XML Schema (XSD) | XML | Comprehensive typing, namespace support | Enterprise/legacy SOAP |
| TypeBox/Zod | TypeScript | Type inference, runtime validation | TypeScript APIs |

得：綱系依生態、效需、演求擇。

敗：不定→始 JSON Schema—工具支援最廣，可疊於舊 JSON API。

### 二：設核綱

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

得：綱自書，含述、限、明類定。

敗：數模未穩→標綱為 `draft` 勿發於註冊表。

### 三：備綱演

相容規：

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

安演策：
1. **僅添可選欄**含合理默認
2. **永勿去或改名**—宜棄用
3. **於識中版綱**（`v1`、`v2`）
4. **用綱註冊表**於二進格（Confluent Schema Registry 於 Avro/Protobuf）

#### Protobuf 演規：
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

#### JSON Schema 版：
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

得：演計已書：何變安、何需新版。

敗：破變不可免→版綱（v1 → v2）並於遷間維並行支援。

### 四：施綱驗

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

得：驗行於系邊界諸入數（API 端、檔攝）。

敗：誌驗誤及全載（遮敏欄）以備除錯。

### 五：書綱

立綱書頁：

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

得：書動生或與綱定同步。

敗：書漂離綱→加 CI 查以驗書對綱源。

## 驗

- [ ] 綱用案宜之系（JSON Schema、Protobuf、Avro）
- [ ] 諸欄有類、述、限
- [ ] 必 vs 可欄明定
- [ ] 演策已書（安變、版策）
- [ ] 系邊界已施驗
- [ ] 綱已版含變誌
- [ ] 往返測：序→反序→比確無數失

## 忌

- **過早過限**：新綱嚴驗塞迭代→始寬（`additionalProperties: true`），後緊
- **無默值**：添必欄而無默→破諸舊數→新欄常供默
- **略 null**：多綱不明 null／缺欄→明 nullable vs optional
- **於負載版而非 URL**：長壽數（存、事）→嵌綱版於數中，非僅端點 URL
- **enum 窮舉**：添新 enum 值可崩用窮舉 switch 之用者→書無知值宜優雅處

## 參

- `serialize-data-formats`
- `implement-pharma-serialisation`
- `write-validation-documentation`
