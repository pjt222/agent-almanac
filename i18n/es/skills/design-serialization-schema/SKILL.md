---
name: design-serialization-schema
description: >
  Disenar esquemas de serializacion usando JSON Schema, definiciones de
  Protocol Buffer o Apache Avro. Cubre versionado de esquemas, compatibilidad
  hacia atras, reglas de validacion y estrategias de evolucion para formatos
  de datos de larga duracion. Usar al definir un nuevo contrato de API o
  formato de intercambio de datos, agregar campos a un esquema existente sin
  romper consumidores, migrar entre versiones de esquema, elegir entre
  sistemas de esquema, o documentar reglas de validacion de datos para
  aplicacion automatizada.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json-schema, protobuf, avro, schema-evolution, versioning, compatibility
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Disenar Esquema de Serializacion

Crear esquemas de serializacion bien versionados que evolucionan elegantemente sin romper consumidores.

## Cuando Usar

- Definir un nuevo contrato de API o formato de intercambio de datos
- Agregar campos a un esquema existente sin romper consumidores
- Migrar entre versiones de esquema
- Elegir entre sistemas de esquema (JSON Schema, Protobuf, Avro)
- Documentar reglas de validacion de datos para aplicacion automatizada

## Entradas

- **Requerido**: Modelo de datos (relaciones entre entidades, tipos de campos, restricciones)
- **Requerido**: Requisitos de compatibilidad (quien consume estos datos, cuanto tiempo deben ser legibles los formatos antiguos)
- **Opcional**: Esquema existente a evolucionar
- **Opcional**: Requisitos de rendimiento (velocidad de validacion, integracion con registro de esquemas)
- **Opcional**: Formato de serializacion objetivo (JSON, binario, columnar)

## Procedimiento

### Paso 1: Elegir un Sistema de Esquema

| Sistema | Formato | Fortalezas | Mejor para |
|---------|---------|-----------|-----------|
| JSON Schema | JSON | Ampliamente soportado, validacion flexible | APIs REST, validacion de config |
| Protocol Buffers | Binario | Compacto, rapido, tipado fuerte, evolucion integrada | gRPC, microservicios |
| Apache Avro | Binario/JSON | Esquema en datos, excelente soporte de evolucion | Kafka, pipelines de datos |
| XML Schema (XSD) | XML | Tipado completo, soporte de namespaces | Empresarial/legado SOAP |
| TypeBox/Zod | TypeScript | Inferencia de tipos, validacion en runtime | APIs TypeScript |

**Esperado:** Sistema de esquema seleccionado basado en ecosistema, necesidades de rendimiento y requisitos de evolucion.
**En caso de fallo:** Si hay incertidumbre, comenzar con JSON Schema -- tiene el soporte de herramientas mas amplio y puede agregarse sobre APIs JSON existentes.

### Paso 2: Disenar el Esquema Central

#### Ejemplo de JSON Schema:

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

#### Ejemplo de Protocol Buffers:

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

**Esperado:** Esquema auto-documentado con descripciones, restricciones y definiciones claras de tipos.
**En caso de fallo:** Si el modelo de datos aun no es estable, marcar el esquema como `draft` y evitar publicarlo en un registro.

### Paso 3: Planificar la Evolucion del Esquema

Reglas de compatibilidad:

| Cambio | Compatible hacia atras? | Compatible hacia adelante? | Seguro? |
|--------|------------------------|---------------------------|---------|
| Agregar campo opcional | Si | Si | Si |
| Agregar campo requerido | No | Si | No (rompe consumidores existentes) |
| Eliminar campo opcional | Si | No | Con cuidado (productores aun pueden enviar) |
| Eliminar campo requerido | Si | No | Con cuidado |
| Renombrar campo | No | No | No (usar alias + deprecacion) |
| Cambiar tipo de campo | No | No | No (agregar nuevo campo, deprecar antiguo) |
| Agregar valor enum | Si (si consumidores ignoran desconocidos) | No | Depende de la implementacion |
| Eliminar valor enum | No | Si | No |

Estrategia de evolucion segura:
1. **Solo agregar campos opcionales** con valores predeterminados razonables
2. **Nunca eliminar ni renombrar** -- deprecar en su lugar
3. **Versionar el esquema** en el identificador (`v1`, `v2`)
4. **Usar un registro de esquemas** para formatos binarios (Confluent Schema Registry para Avro/Protobuf)

**Esperado:** Plan de evolucion documentado: que cambios son seguros, cuales requieren nuevas versiones.
**En caso de fallo:** Si un cambio incompatible es inevitable, versionar el esquema (v1 -> v2) y mantener soporte paralelo durante la migracion.

### Paso 4: Implementar Validacion de Esquema

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
# -> ["$.value: 'not_a_number' is not of type 'number'"]
```

**Esperado:** La validacion se ejecuta en todos los datos entrantes en los limites del sistema (endpoints API, ingestion de archivos).
**En caso de fallo:** Registrar errores de validacion con la carga completa (redactando campos sensibles) para depuracion.

### Paso 5: Documentar el Esquema

Crear una pagina de documentacion del esquema con: resumen, tabla de campos (campo, tipo, requerido, descripcion, restricciones), registro de cambios (version, fecha, cambios) y politica de compatibilidad.

**Esperado:** La documentacion se genera automaticamente o se mantiene sincronizada con la definicion del esquema.
**En caso de fallo:** Si la documentacion se desvia del esquema, agregar una verificacion CI que valide la documentacion contra la fuente del esquema.

## Validacion

- [ ] El esquema usa el sistema apropiado para el caso de uso (JSON Schema, Protobuf, Avro)
- [ ] Todos los campos tienen tipos, descripciones y restricciones
- [ ] Campos requeridos vs opcionales estan definidos explicitamente
- [ ] Estrategia de evolucion documentada (cambios seguros, politica de versionado)
- [ ] Validacion implementada en los limites del sistema
- [ ] El esquema esta versionado con un registro de cambios
- [ ] Prueba de ida y vuelta: serializar -> deserializar -> comparar confirma sin perdida de datos

## Errores Comunes

- **Restringir demasiado temprano**: Validacion estricta en un esquema nuevo bloquea la iteracion. Comenzar permisivo (`additionalProperties: true`), restringir despues.
- **Sin valores predeterminados**: Agregar un campo requerido sin predeterminado rompe todos los datos existentes. Siempre proporcionar predeterminados para nuevos campos.
- **Ignorar null**: Muchos esquemas no manejan campos null/faltantes claramente. Ser explicito sobre nullable vs opcional.
- **Version en la carga, no en la URL**: Para datos de larga duracion (almacenamiento, eventos), incrustar la version del esquema en los datos mismos, no solo en la URL del endpoint.
- **Exhaustividad de enum**: Agregar un nuevo valor enum puede causar crashes en consumidores que usan sentencias switch exhaustivas. Documentar que los valores desconocidos deben manejarse elegantemente.

## Habilidades Relacionadas

- `serialize-data-formats` -- seleccion de formato e implementacion de codificacion/decodificacion
- `implement-pharma-serialisation` -- serializacion farmaceutica (esquemas regulados)
- `write-validation-documentation` -- documentacion de validacion para esquemas regulados
