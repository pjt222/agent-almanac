---
name: serialize-data-formats
description: >
  Daten ueber gaengige Formate serialisieren und deserialisieren, darunter
  JSON, XML, YAML, Protocol Buffers, MessagePack und Apache Arrow/Parquet.
  Umfasst Formatauswahlkriterien, Kodierungs-/Dekodierungsmuster,
  Performance-Abwaegungen und Interoperabilitaetsueberlegungen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json, xml, yaml, protobuf, messagepack, parquet, arrow, serialization
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Datenformate serialisieren

Das richtige Datenserialisierungsformat fuer den Anwendungsfall auswaehlen und implementieren, mit korrekter Kodierung/Dekodierung und Performance-Bewusstsein.

## Wann verwenden

- Ein Wire-Format fuer API-Kommunikation waehlen
- Strukturierte Daten auf Festplatte oder Objektspeicher persistieren
- Daten zwischen Systemen austauschen, die in verschiedenen Sprachen geschrieben sind
- Datenuebertragungsgroesse oder Parsing-Geschwindigkeit optimieren
- Von einem Serialisierungsformat zu einem anderen migrieren

## Eingaben

- **Erforderlich**: Zu serialisierende Datenstruktur (Schema oder Beispiel)
- **Erforderlich**: Anwendungsfall (API, Speicherung, Streaming, Analytik)
- **Optional**: Performance-Anforderungen (Groesse, Geschwindigkeit, Schema-Durchsetzung)
- **Optional**: Zielsprache/Laufzeitbeschraenkungen
- **Optional**: Anforderungen an menschliche Lesbarkeit

## Vorgehensweise

### Schritt 1: Das richtige Format waehlen

| Format | Menschenlesbar | Schema | Groesse | Geschw. | Am besten fuer |
|--------|---------------|--------|------|-------|----------|
| JSON | Ja | Optional (JSON Schema) | Mittel | Mittel | REST-APIs, Konfig, breite Interop |
| XML | Ja | XSD, DTD | Gross | Langsam | Enterprise/Legacy, SOAP, Dokumente |
| YAML | Ja | Optional | Mittel | Langsam | Konfigdateien, CI/CD, Kubernetes |
| Protocol Buffers | Nein | Erforderlich (.proto) | Klein | Schnell | gRPC, Microservices, Mobil |
| MessagePack | Nein | Keines | Klein | Schnell | Echtzeit, Embedded, Redis |
| Arrow/Parquet | Nein | Eingebaut | Sehr Klein | Sehr Schnell | Analytik, spaltenbasierte Abfragen, Data Lakes |

Entscheidungsbaum:
1. **Menschliche Bearbeitung noetig?** -> YAML (Konfig) oder JSON (Daten)
2. **Striktes Schema + schnelles RPC noetig?** -> Protocol Buffers
3. **Kleinste Wire-Groesse noetig?** -> MessagePack oder Protobuf
4. **Spaltenbasierte Analytik noetig?** -> Apache Parquet
5. **In-Memory-Austausch noetig?** -> Apache Arrow
6. **Legacy-Enterprise-Integration?** -> XML

**Erwartet:** Format mit dokumentierter Begruendung ausgewaehlt, die den Anforderungen des Anwendungsfalls entspricht.
**Bei Fehler:** Falls Anforderungen konfligieren (z.B. menschenlesbar UND schnell), den primaeren Anwendungsfall priorisieren und den Kompromiss dokumentieren.

### Schritt 2: JSON-Serialisierung implementieren

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

# Benutzerdefinierter Encoder fuer Nicht-Standardtypen
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

# Serialisieren
measurement = Measurement("sensor-01", 23.5, "celsius", datetime.now())
json_str = json.dumps(asdict(measurement), cls=CustomEncoder, indent=2)

# Deserialisieren
data = json.loads(json_str)
```

```r
# R: JSON mit jsonlite
library(jsonlite)

# Serialisieren
df <- data.frame(sensor_id = "sensor-01", value = 23.5, unit = "celsius")
json_str <- jsonlite::toJSON(df, auto_unbox = TRUE, pretty = TRUE)

# Deserialisieren
df_back <- jsonlite::fromJSON(json_str)
```

**Erwartet:** Roundtrip-Serialisierung bewahrt alle Datentypen akkurat.
**Bei Fehler:** Falls ein Typ verloren geht (z.B. Daten werden zu Strings), explizite Typkonvertierung im Deserialisierungsschritt hinzufuegen.

### Schritt 3: Protocol Buffers implementieren

Schema (`.proto`-Datei) definieren:

```protobuf
syntax = "proto3";
package sensors;

message Measurement {
  string sensor_id = 1;
  double value = 2;
  string unit = 3;
  int64 timestamp_ms = 4;  // Unix-Millisekunden
}

message MeasurementBatch {
  repeated Measurement measurements = 1;
}
```

Generieren und verwenden:

```bash
# Python-Code generieren
protoc --python_out=. sensors.proto

# Go-Code generieren
protoc --go_out=. sensors.proto
```

```python
from sensors_pb2 import Measurement, MeasurementBatch
import time

# Serialisieren
m = Measurement(
    sensor_id="sensor-01",
    value=23.5,
    unit="celsius",
    timestamp_ms=int(time.time() * 1000)
)
binary = m.SerializeToString()  # Kompaktes Binaerformat

# Deserialisieren
m2 = Measurement()
m2.ParseFromString(binary)
```

**Erwartet:** Binaerausgabe 3-10x kleiner als aequivalentes JSON.
**Bei Fehler:** Falls protoc nicht verfuegbar ist, eine sprachspezifische Protobuf-Bibliothek verwenden (z.B. `betterproto` fuer Python).

### Schritt 4: MessagePack implementieren

```python
import msgpack
from datetime import datetime

# Benutzerdefiniertes Packen fuer datetime
def encode_datetime(obj):
    if isinstance(obj, datetime):
        return {"__datetime__": True, "s": obj.isoformat()}
    return obj

def decode_datetime(obj):
    if "__datetime__" in obj:
        return datetime.fromisoformat(obj["s"])
    return obj

data = {"sensor_id": "sensor-01", "value": 23.5, "ts": datetime.now()}

# Serialisieren (kleiner als JSON, schneller als JSON)
packed = msgpack.packb(data, default=encode_datetime)

# Deserialisieren
unpacked = msgpack.unpackb(packed, object_hook=decode_datetime, raw=False)
```

**Erwartet:** MessagePack-Ausgabe ist 15-30% kleiner als JSON fuer typische Nutzlasten.
**Bei Fehler:** Falls eine Sprache keine MessagePack-Unterstuetzung hat, auf JSON mit Komprimierung (gzip) zurueckfallen.

### Schritt 5: Apache Parquet (spaltenbasiert) implementieren

```python
import pyarrow as pa
import pyarrow.parquet as pq
import pandas as pd

# Daten erstellen
df = pd.DataFrame({
    "sensor_id": ["s-01", "s-02", "s-01", "s-03"] * 1000,
    "value": [23.5, 18.2, 24.1, 19.8] * 1000,
    "unit": ["celsius"] * 4000,
    "timestamp": pd.date_range("2025-01-01", periods=4000, freq="min")
})

# Parquet schreiben (spaltenbasiert, komprimiert)
table = pa.Table.from_pandas(df)
pq.write_table(table, "measurements.parquet", compression="snappy")

# Parquet lesen (kann bestimmte Spalten lesen ohne alle Daten zu laden)
table_back = pq.read_table("measurements.parquet", columns=["sensor_id", "value"])
df_subset = table_back.to_pandas()
```

```r
# R: Parquet mit arrow
library(arrow)

# Schreiben
df <- data.frame(sensor_id = rep("s-01", 1000), value = rnorm(1000))
arrow::write_parquet(df, "measurements.parquet")

# Lesen (mit Spaltenauswahl -- liest nur ausgewaehlte Spalten von der Festplatte)
df_back <- arrow::read_parquet("measurements.parquet", col_select = c("value"))
```

**Erwartet:** Parquet-Dateien 5-20x kleiner als CSV fuer typische tabellarische Daten.
**Bei Fehler:** Falls Arrow nicht verfuegbar ist, `fastparquet` (Python) oder CSV mit gzip als Fallback verwenden.

### Schritt 6: Performance vergleichen

Benchmarks fuer die spezifischen Daten und den Anwendungsfall ausfuehren:

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

**Erwartet:** Benchmark-Ergebnisse leiten die Formatauswahl fuer den Produktionseinsatz.
**Bei Fehler:** Falls die Performance fuer kein Format ausreicht, Komprimierung (zstd, snappy) als orthogonale Optimierung in Betracht ziehen.

## Validierung

- [ ] Ausgewaehltes Format passt zu Anwendungsfallanforderungen (dokumentierte Begruendung)
- [ ] Roundtrip-Serialisierung bewahrt alle Datentypen
- [ ] Grenzfaelle behandelt: leere Sammlungen, null/None-Werte, Unicode, grosse Zahlen
- [ ] Performance fuer repraesentative Nutzlastgroessen gemessen
- [ ] Fehlerbehandlung fuer fehlerhaften Input (graceful Failures, keine Abstuerze)
- [ ] Schema dokumentiert (JSON Schema, .proto oder Aequivalent)

## Haeufige Fehler

- **Gleitkomma-Praezision**: JSON stellt alle Zahlen als IEEE 754 Doubles dar. String-Kodierung fuer finanzielle/dezimale Praezision verwenden.
- **Datum/Zeit-Behandlung**: JSON hat keinen nativen Datetime-Typ. Format (ISO 8601) und Zeitzonen-Behandlung immer dokumentieren.
- **Schema-Evolution**: Hinzufuegen oder Entfernen von Feldern kann Konsumenten brechen. Protobuf handhabt dies gut; JSON erfordert sorgfaeltige Versionierung.
- **Binaerdaten in JSON**: Base64-Kodierung blaest Binaerdaten um ~33% auf. Ein Binaerformat fuer binaer-lastige Nutzlasten verwenden.
- **YAML-Sicherheit**: YAML-Parser koennen ueber `!!python/object`-Tags beliebigen Code ausfuehren. Immer sichere Loader verwenden.

## Verwandte Skills

- `design-serialization-schema` -- Schema-Design, Versionierung und Evolutionsstrategien
- `implement-pharma-serialisation` -- Pharmazeutische Serialisierung (andere Domaene, gleiche Benennung)
- `create-quarto-report` -- Datenausgabeformatierung fuer Berichte
