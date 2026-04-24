---
name: design-serialization-schema
locale: caveman-ultra
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

# Design Serialization Schema

Versioned schemas → evolve w/o breaking consumers.

## Use When

- New API contract / data format
- Add fields w/o break consumers
- Migrate schema versions
- Pick schema sys (JSON Schema, Protobuf, Avro)
- Doc valid. rules → auto-enforce

## In

- **Required**: Data model (entities, types, constraints)
- **Required**: Compat reqs (consumers, old format lifetime)
- **Optional**: Existing schema → evolve
- **Optional**: Perf reqs (valid. speed, registry)
- **Optional**: Target format (JSON, binary, columnar)

## Do

### Step 1: Pick Schema Sys

| Sys | Format | Strength | Best |
|-----|--------|----------|------|
| JSON Schema | JSON | Broad support, flex valid. | REST, config |
| Protocol Buffers | Binary | Compact, fast, typed, evo built-in | gRPC, micro |
| Apache Avro | Binary/JSON | Schema in data, great evo | Kafka, pipelines |
| XML Schema (XSD) | XML | Deep typing, namespaces | Enterprise/SOAP |
| TypeBox/Zod | TypeScript | Type inference + runtime valid. | TS APIs |

→ Schema sys picked → ecosystem + perf + evo reqs.
If err: unsure → start JSON Schema (broadest tooling, layers on JSON APIs).

### Step 2: Core Schema

#### JSON Schema ex:

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

#### Protocol Buffers ex:

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

#### Apache Avro ex:

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

→ Schema self-doc → descriptions + constraints + clear types.
If err: data model unstable → mark `draft`, skip registry.

### Step 3: Plan Evolution

Compat rules:

| Change | Back Compat? | Fwd Compat? | Safe? |
|--------|--------------|-------------|-------|
| Add optional field | Yes | Yes | Yes |
| Add required field | No | Yes | No (breaks consumers) |
| Remove optional field | Yes | No | Careful (producers may still send) |
| Remove required field | Yes | No | Careful |
| Rename field | No | No | No (use alias + deprecate) |
| Change field type | No | No | No (add new, deprecate old) |
| Add enum value | Yes (if consumers ignore unknown) | No | Depends on impl |
| Remove enum value | No | Yes | No |

Safe evo:
1. **Only add optional fields** w/ defaults
2. **Never remove/rename** → deprecate
3. **Version schema** in id (`v1`, `v2`)
4. **Schema registry** for binary (Confluent for Avro/Protobuf)

#### Protobuf evo rules:
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

#### JSON Schema versioning:
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

→ Evo plan documented: safe changes + version reqs.
If err: break unavoidable → version (v1 → v2), parallel support during migration.

### Step 4: Implement Valid.

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

→ Valid. on all incoming data at boundaries (API, ingestion).
If err: log valid. errs w/ full payload (redact sensitive) for debug.

### Step 5: Doc Schema

Schema doc page:

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

→ Docs auto-gen or in sync w/ schema.
If err: docs drift → CI check valid. docs vs schema source.

## Check

- [ ] Schema sys matches use case (JSON Schema, Protobuf, Avro)
- [ ] All fields: types + desc + constraints
- [ ] Required vs optional explicit
- [ ] Evo strategy documented (safe changes, versioning)
- [ ] Valid. at boundaries
- [ ] Versioned + changelog
- [ ] Round-trip: serialize → deserialize → compare, no data loss

## Traps

- **Over-constrain early**: Strict valid. on new schema → blocks iteration. Start permissive (`additionalProperties: true`), tighten later.
- **No defaults**: Add required field w/o default → breaks existing data. Always defaults for new fields.
- **Null ignored**: Many schemas sloppy on null/missing. Explicit nullable vs optional.
- **Version in URL not payload**: Long-lived data (storage, events) → embed ver in data, not just endpoint URL.
- **Enum exhaustive**: New enum val crashes consumers w/ exhaustive switches. Doc unknown → handle gracefully.

## →

- `serialize-data-formats` — format pick + encode/decode
- `implement-pharma-serialisation` — pharma (regulatory schemas)
- `write-validation-documentation` — valid. docs for regulated schemas
