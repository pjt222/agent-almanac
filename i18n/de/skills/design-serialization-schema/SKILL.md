---
name: design-serialization-schema
description: >
  Serialisierungsschemata mit JSON Schema, Protocol-Buffer-Definitionen
  oder Apache Avro entwerfen. Umfasst Schema-Versionierung,
  Rueckwaertskompatibilitaet, Validierungsregeln und Evolutionsstrategien
  fuer langlebige Datenformate.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json-schema, protobuf, avro, schema-evolution, versioning, compatibility
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Serialisierungsschema entwerfen

Gut versionierte Serialisierungsschemata erstellen, die sich elegant weiterentwickeln, ohne Konsumenten zu brechen.

## Wann verwenden

- Einen neuen API-Vertrag oder ein Datenaustauschformat definieren
- Felder zu einem bestehenden Schema hinzufuegen, ohne Konsumenten zu brechen
- Zwischen Schema-Versionen migrieren
- Zwischen Schema-Systemen waehlen (JSON Schema, Protobuf, Avro)
- Datenvalidierungsregeln fuer automatisierte Durchsetzung dokumentieren

## Eingaben

- **Erforderlich**: Datenmodell (Entitaetsbeziehungen, Feldtypen, Beschraenkungen)
- **Erforderlich**: Kompatibilitaetsanforderungen (wer konsumiert diese Daten, wie lange muessen alte Formate lesbar sein)
- **Optional**: Bestehendes Schema zur Weiterentwicklung
- **Optional**: Performance-Anforderungen (Validierungsgeschwindigkeit, Schema-Registry-Integration)
- **Optional**: Zielserialisierungsformat (JSON, binaer, spaltenbasiert)

## Vorgehensweise

### Schritt 1: Ein Schema-System waehlen

| System | Format | Staerken | Am besten fuer |
|--------|--------|-----------|----------|
| JSON Schema | JSON | Breit unterstuetzt, flexible Validierung | REST-APIs, Konfigvalidierung |
| Protocol Buffers | Binaer | Kompakt, schnell, starke Typisierung, eingebaute Evolution | gRPC, Microservices |
| Apache Avro | Binaer/JSON | Schema in Daten, hervorragende Evolutionsunterstuetzung | Kafka, Datenpipelines |
| XML Schema (XSD) | XML | Umfassende Typisierung, Namespace-Unterstuetzung | Enterprise/Legacy SOAP |
| TypeBox/Zod | TypeScript | Typinferenz, Laufzeitvalidierung | TypeScript-APIs |

**Erwartet:** Schema-System basierend auf Oekosystem, Performance-Beduerfnissen und Evolutionsanforderungen ausgewaehlt.
**Bei Fehler:** Im Zweifelsfall mit JSON Schema beginnen -- es hat die breiteste Werkzeugunterstuetzung und kann auf bestehende JSON-APIs aufgesetzt werden.

### Schritt 2: Das Kernschema entwerfen

#### JSON-Schema-Beispiel:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/measurement/v1",
  "title": "Measurement",
  "description": "Eine Sensormessung",
  "type": "object",
  "required": ["sensor_id", "value", "unit", "timestamp"],
  "properties": {
    "sensor_id": {
      "type": "string",
      "pattern": "^[a-z]+-[0-9]+$",
      "description": "Eindeutige Sensorkennung (Kleinbuchstaben-Ziffern-Format)"
    },
    "value": {
      "type": "number",
      "description": "Messwert"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit", "kelvin", "percent", "ppm"],
      "description": "Masseinheit"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 Zeitstempel mit Zeitzone"
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true,
      "description": "Optionale Schluessel-Wert-Metadaten"
    }
  },
  "additionalProperties": false
}
```

#### Protocol-Buffers-Beispiel:

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

**Erwartet:** Schema ist selbstdokumentierend mit Beschreibungen, Beschraenkungen und klaren Typdefinitionen.
**Bei Fehler:** Falls das Datenmodell noch nicht stabil ist, das Schema als `draft` markieren und die Veroeffentlichung in einer Registry vermeiden.

### Schritt 3: Schema-Evolution planen

Kompatibilitaetsregeln:

| Aenderung | Rueckwaerts-kompatibel? | Vorwaerts-kompatibel? | Sicher? |
|--------|----------------------|---------------------|-------|
| Optionales Feld hinzufuegen | Ja | Ja | Ja |
| Pflichtfeld hinzufuegen | Nein | Ja | Nein (bricht bestehende Konsumenten) |
| Optionales Feld entfernen | Ja | Nein | Vorsicht (Produzenten senden moeglicherweise noch) |
| Pflichtfeld entfernen | Ja | Nein | Vorsicht |
| Feld umbenennen | Nein | Nein | Nein (Alias + Deprecation verwenden) |
| Feldtyp aendern | Nein | Nein | Nein (neues Feld hinzufuegen, altes deprecaten) |
| Enum-Wert hinzufuegen | Ja (wenn Konsumenten unbekannte ignorieren) | Nein | Implementierungsabhaengig |
| Enum-Wert entfernen | Nein | Ja | Nein |

Sichere Evolutionsstrategie:
1. **Nur optionale Felder hinzufuegen** mit sinnvollen Standardwerten
2. **Niemals entfernen oder umbenennen** -- stattdessen deprecaten
3. **Schema versionieren** im Bezeichner (`v1`, `v2`)
4. **Schema-Registry verwenden** fuer Binaerformate (Confluent Schema Registry fuer Avro/Protobuf)

**Erwartet:** Evolutionsplan dokumentiert: welche Aenderungen sicher sind, welche neue Versionen erfordern.
**Bei Fehler:** Falls eine brechende Aenderung unvermeidlich ist, das Schema versionieren (v1 -> v2) und parallele Unterstuetzung waehrend der Migration aufrechterhalten.

### Schritt 4: Schema-Validierung implementieren

```python
# JSON-Schema-Validierung (Python)
from jsonschema import validate, ValidationError
import json

schema = json.load(open("measurement_v1.json"))

def validate_measurement(data: dict) -> list[str]:
    """Messung gegen das Schema validieren. Gibt Liste von Fehlern zurueck."""
    errors = []
    try:
        validate(instance=data, schema=schema)
    except ValidationError as e:
        errors.append(f"{e.json_path}: {e.message}")
    return errors

# Verwendung
errors = validate_measurement({"sensor_id": "s-01", "value": "not_a_number"})
# -> ["$.value: 'not_a_number' is not of type 'number'"]
```

```typescript
// TypeScript mit Zod (Laufzeit + Kompilierzeit)
import { z } from 'zod';

const MeasurementSchema = z.object({
  sensor_id: z.string().regex(/^[a-z]+-[0-9]+$/),
  value: z.number(),
  unit: z.enum(['celsius', 'fahrenheit', 'kelvin', 'percent', 'ppm']),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string()).optional(),
});

type Measurement = z.infer<typeof MeasurementSchema>;

// Validierung
const result = MeasurementSchema.safeParse(inputData);
if (!result.success) {
  console.error(result.error.issues);
}
```

**Erwartet:** Validierung laeuft auf allen eingehenden Daten an Systemgrenzen (API-Endpunkte, Dateieinlesung).
**Bei Fehler:** Validierungsfehler mit vollstaendiger Nutzlast (sensible Felder schwaeraen) fuer Debugging protokollieren.

### Schritt 5: Schema dokumentieren

Eine Schema-Dokumentationsseite erstellen mit Uebersicht, Feldbeschreibungen, Aenderungsprotokoll und Kompatibilitaetsrichtlinie.

**Erwartet:** Dokumentation ist automatisch generiert oder bleibt mit der Schema-Definition synchron.
**Bei Fehler:** Falls Dokumentation vom Schema abweicht, einen CI-Check hinzufuegen, der die Dokumentation gegen die Schema-Quelle validiert.

## Validierung

- [ ] Schema verwendet ein dem Anwendungsfall angemessenes System (JSON Schema, Protobuf, Avro)
- [ ] Alle Felder haben Typen, Beschreibungen und Beschraenkungen
- [ ] Pflicht- vs. optionale Felder sind explizit definiert
- [ ] Evolutionsstrategie dokumentiert (sichere Aenderungen, Versionierungsrichtlinie)
- [ ] Validierung an Systemgrenzen implementiert
- [ ] Schema ist mit einem Aenderungsprotokoll versioniert
- [ ] Roundtrip-Test: serialisieren -> deserialisieren -> vergleichen bestaetigt keinen Datenverlust

## Haeufige Fehler

- **Zu fruehes Ueberbeschraenken**: Strikte Validierung auf einem neuen Schema blockiert Iteration. Permissiv starten (`additionalProperties: true`), spaeter verschaerfen.
- **Keine Standardwerte**: Hinzufuegen eines Pflichtfelds ohne Standard bricht alle bestehenden Daten. Immer Standards fuer neue Felder bereitstellen.
- **Null ignorieren**: Viele Schemata behandeln null/fehlende Felder nicht klar. Explizit sein ueber nullable vs. optional.
- **Version in der Nutzlast, nicht der URL**: Fuer langlebige Daten (Speicherung, Events) die Schema-Version in die Daten selbst einbetten, nicht nur in die Endpunkt-URL.
- **Enum-Vollstaendigkeit**: Hinzufuegen eines neuen Enum-Werts kann Konsumenten zum Absturz bringen, die erschoepfende Switch-Anweisungen verwenden. Dokumentieren, dass unbekannte Werte graceful behandelt werden sollten.

## Verwandte Skills

- `serialize-data-formats` -- Formatauswahl und Kodierungs-/Dekodierungsimplementierung
- `implement-pharma-serialisation` -- Pharmazeutische Serialisierung (regulatorische Schemata)
- `write-validation-documentation` -- Validierungsdokumentation fuer regulierte Schemata
