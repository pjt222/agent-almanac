---
name: serialize-data-formats
description: >
  Serializar y deserializar datos en formatos comunes incluyendo JSON, XML,
  YAML, Protocol Buffers, MessagePack y Apache Arrow/Parquet. Cubre criterios
  de seleccion de formato, patrones de codificacion/decodificacion, compromisos
  de rendimiento y consideraciones de interoperabilidad. Usar al elegir un
  formato de transmision para comunicacion API, persistir datos estructurados
  en disco, intercambiar datos entre sistemas escritos en diferentes lenguajes,
  optimizar tamano de transferencia o velocidad de analisis, o migrar de un
  formato de serializacion a otro.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json, xml, yaml, protobuf, messagepack, parquet, arrow, serialization
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Serializar Formatos de Datos

Seleccionar e implementar el formato de serializacion de datos correcto para su caso de uso, con codificacion/decodificacion correcta y conciencia de rendimiento.

## Cuando Usar

- Elegir un formato de transmision para comunicacion API
- Persistir datos estructurados en disco o almacenamiento de objetos
- Intercambiar datos entre sistemas escritos en diferentes lenguajes
- Optimizar el tamano de transferencia de datos o la velocidad de analisis
- Migrar de un formato de serializacion a otro

## Entradas

- **Requerido**: Estructura de datos a serializar (esquema o ejemplo)
- **Requerido**: Caso de uso (API, almacenamiento, streaming, analitica)
- **Opcional**: Requisitos de rendimiento (tamano, velocidad, aplicacion de esquema)
- **Opcional**: Restricciones del lenguaje/runtime objetivo
- **Opcional**: Requisitos de legibilidad humana

## Procedimiento

### Paso 1: Seleccionar el Formato Correcto

| Formato | Legible | Esquema | Tamano | Velocidad | Mejor para |
|---------|---------|---------|--------|-----------|-----------|
| JSON | Si | Opcional (JSON Schema) | Medio | Media | APIs REST, config, interop amplia |
| XML | Si | XSD, DTD | Grande | Lenta | Empresarial/legado, SOAP, documentos |
| YAML | Si | Opcional | Medio | Lenta | Archivos de config, CI/CD, Kubernetes |
| Protocol Buffers | No | Requerido (.proto) | Pequeno | Rapida | gRPC, microservicios, movil |
| MessagePack | No | Ninguno | Pequeno | Rapida | Tiempo real, embebido, Redis |
| Arrow/Parquet | No | Integrado | Muy Pequeno | Muy Rapida | Analitica, consultas columnares, data lakes |

Arbol de decision:
1. **Necesita edicion humana?** -> YAML (config) o JSON (datos)
2. **Necesita esquema estricto + RPC rapido?** -> Protocol Buffers
3. **Necesita el tamano de transmision mas pequeno?** -> MessagePack o Protobuf
4. **Necesita analitica columnar?** -> Apache Parquet
5. **Necesita intercambio en memoria?** -> Apache Arrow
6. **Integracion empresarial legada?** -> XML

**Esperado:** Formato seleccionado con justificacion documentada que coincide con los requisitos del caso de uso.
**En caso de fallo:** Si los requisitos entran en conflicto (ej., legible por humanos Y rapido), priorizar el caso de uso principal y anotar el compromiso.

### Paso 2: Implementar Serializacion JSON

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

**Esperado:** La serializacion de ida y vuelta preserva todos los tipos de datos con precision.
**En caso de fallo:** Si un tipo se pierde (ej., fechas se convierten en cadenas), agregar conversion de tipo explicita en el paso de deserializacion.

### Paso 3: Implementar Protocol Buffers

Definir el esquema (archivo `.proto`):

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

Generar y usar:

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

**Esperado:** Salida binaria 3-10x mas pequena que el JSON equivalente.
**En caso de fallo:** Si protoc no esta disponible, usar una biblioteca protobuf nativa del lenguaje (ej., `betterproto` para Python).

### Paso 4: Implementar MessagePack

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

**Esperado:** La salida MessagePack es 15-30% mas pequena que JSON para cargas tipicas.
**En caso de fallo:** Si un lenguaje carece de soporte MessagePack, recurrir a JSON con compresion (gzip).

### Paso 5: Implementar Apache Parquet (Columnar)

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

# Read (with column selection -- only reads selected columns from disk)
df_back <- arrow::read_parquet("measurements.parquet", col_select = c("value"))
```

**Esperado:** Archivos Parquet 5-20x mas pequenos que CSV para datos tabulares tipicos.
**En caso de fallo:** Si Arrow no esta disponible, usar `fastparquet` (Python) o CSV con gzip como alternativa.

### Paso 6: Comparar Rendimiento

Ejecutar benchmarks para sus datos y caso de uso especificos:

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

**Esperado:** Los resultados del benchmark guian la seleccion de formato para uso en produccion.
**En caso de fallo:** Si el rendimiento es insuficiente para cualquier formato, considerar la compresion (zstd, snappy) como una optimizacion ortogonal.

## Validacion

- [ ] Formato seleccionado coincide con los requisitos del caso de uso (justificacion documentada)
- [ ] La serializacion de ida y vuelta preserva todos los tipos de datos
- [ ] Casos limite manejados: colecciones vacias, valores null/None, Unicode, numeros grandes
- [ ] Rendimiento evaluado para tamanos de carga representativos
- [ ] Manejo de errores para entrada malformada (fallos elegantes, no crashes)
- [ ] Esquema documentado (JSON Schema, .proto o equivalente)

## Errores Comunes

- **Precision de punto flotante**: JSON representa todos los numeros como dobles IEEE 754. Usar codificacion de cadena para precision financiera/decimal.
- **Manejo de fecha/hora**: JSON no tiene tipo datetime nativo. Siempre documentar el formato (ISO 8601) y el manejo de zona horaria.
- **Evolucion de esquema**: Agregar o eliminar campos puede romper consumidores. Protobuf maneja esto bien; JSON requiere versionado cuidadoso.
- **Datos binarios en JSON**: La codificacion Base64 infla los datos binarios en ~33%. Usar un formato binario para cargas con muchos binarios.
- **Seguridad de YAML**: Los analizadores YAML pueden ejecutar codigo arbitrario via etiquetas `!!python/object`. Siempre usar cargadores seguros.

## Habilidades Relacionadas

- `design-serialization-schema` -- diseno de esquema, versionado y estrategias de evolucion
- `implement-pharma-serialisation` -- serializacion farmaceutica (diferente dominio, misma nomenclatura)
- `create-quarto-report` -- formato de salida de datos para informes
