---
name: implement-pharma-serialisation
description: >
  Pharmazeutische Serialisierungs- und Track-and-Trace-Systeme konform
  mit EU-FMD, US-DSCSA und anderen globalen Vorschriften implementieren.
  Umfasst Generierung eindeutiger Identifikatoren, Aggregationshierarchie,
  EPCIS-Datenaustausch und Verifizierungs-Endpunkt-Integration. Anzuwenden
  bei der Serialisierungsimplementierung fuer einen neuen Produktlaunch,
  Integration mit EMVS/NMVS, Gestaltung DSCSA-konformer Transaktionsaustausche,
  Aufbau eines EPCIS-Ereignisrepositories oder Ausdehnung der Serialisierung
  auf zusaetzliche Maerkte (China, Brasilien, Russland).
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: serialisation, eu-fmd, dscsa, epcis, track-and-trace, pharma
---

# Pharmazeutische Serialisierung implementieren

Pharmazeutische Serialisierungssysteme fuer die regulatorische Konformitaet mit globalen Track-and-Trace-Mandaten einrichten.

## Wann verwenden

- Serialisierungsimplementierung fuer einen neuen Produktlaunch in der EU oder den USA
- Integration mit dem European Medicines Verification System (EMVS/NMVS)
- Gestaltung DSCSA-konformer Transaktionsinformationsaustausche
- Aufbau oder Integration eines EPCIS-Ereignisrepositories fuer Lieferkettentransparenz
- Ausdehnung der Serialisierung auf zusaetzliche Maerkte (China NMPA, Brasilien ANVISA usw.)

## Eingaben

- **Erforderlich**: Produktinformationen (GTIN, Produktcode, Darreichungsform, Packungsgroessen)
- **Erforderlich**: Zielmarktvorschriften (EU FMD, DSCSA oder beide)
- **Erforderlich**: Verpackungshierarchie (Einheit, Buendel, Karton, Palette)
- **Optional**: Details zu bestehenden ERP-/MES-Systemen fuer Integration
- **Optional**: Serialisierungsmoeglichkeiten des Lohnherstellers
- **Optional**: Verifizierungs-Endpunkt-Spezifikationen

## Vorgehensweise

### Schritt 1: Regulatorische Rahmenbedingungen verstehen

| Vorschrift | Region | Kernanforderungen | Frist |
|-----------|--------|------------------|----------|
| EU FMD (2011/62/EU) | EU/EEA | Eindeutiger Identifikator + Originalitaetsverschluss auf jeder Einheit | Seit Feb. 2019 in Kraft |
| DSCSA | USA | Elektronische, interoperable Rueckverfolgung auf Packungsebene | Volle Durchsetzung Nov. 2024+ |
| China NMPA | China | Eindeutiger Arzneimittelrueckverfolgungscode pro Mindestverkaufseinheit | Rollierend |
| Brasilien ANVISA (SNCM) | Brasilien | Serialisierung mit IUM | Rollierend |
| Russland MDLP | Russland | Krypto-Code pro Einheit, Pflichtscanning | In Kraft |

Schluesseldatenelemente pro Vorschrift:

**EU-FMD-Eindeutiger-Identifikator (gemaess Delegierter Verordnung 2016/161):**
- Produktcode (GTIN-14 von GS1)
- Seriennummer (bis zu 20 alphanumerische Zeichen, randomisiert)
- Charge-/Lotnummer
- Verfallsdatum

**DSCSA-Transaktionsinformationen:**
- Produktidentifikator (NDC/GTIN, Seriennummer, Lot, Verfall)
- Transaktionsinformationen (Datum, Unternehmen, Lieferdetails)
- Transaktionshistorie und Transaktionserklaerung
- Verifizierung auf Packungsebene

**Erwartet:** Klares Verstaendnis, welche Vorschriften fuer jede Produkt-Markt-Kombination gelten.
**Bei Fehler:** Regulatory Affairs zur Bestaetigung der Marktanforderungen hinzuziehen, bevor weitergemacht wird.

### Schritt 2: Serialisierungsdatenmodell konzipieren

```sql
-- Core serialisation data model
CREATE TABLE serial_numbers (
    id BIGSERIAL PRIMARY KEY,
    gtin VARCHAR(14) NOT NULL,          -- GS1 GTIN-14
    serial_number VARCHAR(20) NOT NULL,  -- Unique per GTIN
    batch_lot VARCHAR(20) NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, DECOMMISSIONED, DISPENSED, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gtin, serial_number)
);

-- Aggregation hierarchy
CREATE TABLE aggregation (
    id BIGSERIAL PRIMARY KEY,
    parent_code VARCHAR(50) NOT NULL,     -- SSCC or higher-level code
    parent_level VARCHAR(10) NOT NULL,    -- CASE, PALLET, BUNDLE
    child_code VARCHAR(50) NOT NULL,      -- GTIN+serial or child SSCC
    child_level VARCHAR(10) NOT NULL,     -- UNIT, BUNDLE, CASE
    aggregation_event_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EPCIS events
CREATE TABLE epcis_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(30) NOT NULL,      -- ObjectEvent, AggregationEvent, TransactionEvent
    action VARCHAR(10) NOT NULL,          -- ADD, OBSERVE, DELETE
    biz_step VARCHAR(100),               -- urn:epcglobal:cbv:bizstep:commissioning
    disposition VARCHAR(100),             -- urn:epcglobal:cbv:disp:active
    read_point VARCHAR(100),             -- urn:epc:id:sgln:location
    event_time TIMESTAMPTZ NOT NULL,
    event_timezone VARCHAR(6) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Aggregationshierarchie:

```
Pallet (SSCC)
  └── Case (SSCC)
       └── Bundle (GTIN + serial) [optional level]
            └── Unit (GTIN + serial)
```

**Erwartet:** Datenmodell unterstuetzt vollstaendige Verpackungshierarchie mit EPCIS-Ereignisverfolgung.
**Bei Fehler:** Kollidiert das vorhandene ERP-Schema, eine Integrationsschicht entwerfen, anstatt das ERP direkt zu aendern.

### Schritt 3: Seriennummerngenerierung implementieren

```python
import secrets
import string

def generate_serial_number(length: int = 20, charset: str = None) -> str:
    """Generate a random serial number compliant with GS1 standards.

    EU FMD requires randomised serial numbers to prevent prediction.
    Max 20 characters, alphanumeric (GS1 Application Identifier 21).
    """
    if charset is None:
        # GS1 AI(21) allows: digits, uppercase, lowercase, and some special chars
        # Most implementations use alphanumeric only for interoperability
        charset = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(charset) for _ in range(length))


def generate_serial_batch(gtin: str, batch_lot: str, expiry: str, count: int) -> list:
    """Generate a batch of unique serial numbers for a production run."""
    serials = set()
    while len(serials) < count:
        serials.add(generate_serial_number())
    return [
        {
            "gtin": gtin,
            "serial_number": sn,
            "batch_lot": batch_lot,
            "expiry_date": expiry,
            "status": "COMMISSIONED"
        }
        for sn in serials
    ]
```

**Erwartet:** Seriennummern sind kryptografisch zufaellig, pro GTIN eindeutig und vor dem Druck gespeichert.
**Bei Fehler:** Tritt eine Eindeutigkeitskollision auf, die konfligierende Seriennummer neu generieren und das Ereignis protokollieren.

### Schritt 4: GS1-DataMatrix-Kodierung implementieren

Der 2D-DataMatrix-Barcode kodiert den GS1-Elementstring:

```
(01)GTIN(21)Serial(10)Batch(17)Expiry
```

Beispiel:
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

Dabei:
- AI(01) = GTIN-14
- AI(21) = Seriennummer
- AI(10) = Charge-/Lotnummer
- AI(17) = Verfallsdatum (JJMMTT)

Der GS1-DataMatrix verwendet FNC1 als Trennzeichen (GS-Zeichen, ASCII 29) zwischen Feldern variabler Laenge.

```python
def encode_gs1_element_string(gtin: str, serial: str, batch: str, expiry: str) -> str:
    """Encode GS1 element string for DataMatrix printing.

    FNC1 (GS character \\x1d) separates variable-length fields.
    AI(01) and AI(17) are fixed length, so no separator needed after them.
    AI(21) and AI(10) are variable length and need FNC1 terminator.
    """
    GS = '\x1d'  # GS1 FNC1 / Group Separator
    return f"01{gtin}21{serial}{GS}10{batch}{GS}17{expiry}"
```

**Erwartet:** Kodierte Strings durch Scannen von Testdrucken mit einem GS1-zertifizierten Verifier verifiziert (ISO 15415 Grad C oder besser).
**Bei Fehler:** Schlaegt die Scanverifizierung fehl, Druckqualitaet, ruhige Zonen und Kodierungsreihenfolge pruefen.

### Schritt 5: Integration mit nationalen Verifizierungssystemen

#### EU FMD — EMVS/NMVS-Integration

```
MAH → Upload serial data → EU Hub → Distribute to National Systems (NMVS)
                                      ├── Germany (securPharm)
                                      ├── France (CTS)
                                      ├── Italy (AIFA)
                                      └── ... 31 markets
```

API-Operationen:
1. **Upload** (MAH → EU Hub): Stapelupload in Betrieb genommener Seriennummern
2. **Verifizieren** (Apotheke → NMVS): Seriennummerstatus vor Abgabe pruefen
3. **Ausser Betrieb setzen** (Apotheke → NMVS): Als abgegeben am Verkaufspunkt markieren
4. **Reaktivieren** (MAH → NMVS): Versehentliche Ausserbetriebnahme rueckgaengig machen

#### DSCSA — Verification Router Service

```
Trading Partner A → VRS Request → Verification Router → MAH's VRS → Response
```

Einen VRS-Responder-Endpunkt implementieren:

```python
# Simplified VRS endpoint (DSCSA verification)
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/verify/{gtin}/{serial}/{lot}/{expiry}")
async def verify_product(gtin: str, serial: str, lot: str, expiry: str):
    """DSCSA product verification endpoint."""
    record = await lookup_serial(gtin, serial)
    if record is None:
        return {"verified": False, "reason": "SERIAL_NOT_FOUND"}
    if record.batch_lot != lot or str(record.expiry_date) != expiry:
        return {"verified": False, "reason": "DATA_MISMATCH"}
    if record.status != "ACTIVE":
        return {"verified": False, "reason": f"STATUS_{record.status}"}
    return {"verified": True, "status": record.status}
```

**Erwartet:** Verifizierungs-Endpunkte antworten innerhalb von 1 Sekunde mit korrektem Status.
**Bei Fehler:** Schlaegt der Upload ins nationale System fehl, mit exponentiellem Backoff wiederholen und Betrieb alarmieren.

### Schritt 6: EPCIS-Ereigniserfassung implementieren

Lieferkettenevents im EPCIS-2.0-Format aufzeichnen:

```json
{
  "@context": "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
  "type": "ObjectEvent",
  "eventTime": "2025-03-15T10:30:00.000+01:00",
  "eventTimeZoneOffset": "+01:00",
  "epcList": ["urn:epc:id:sgtin:5012345.067890.A1B2C3D4E5"],
  "action": "ADD",
  "bizStep": "urn:epcglobal:cbv:bizstep:commissioning",
  "disposition": "urn:epcglobal:cbv:disp:active",
  "readPoint": {"id": "urn:epc:id:sgln:5012345.00001.0"},
  "bizLocation": {"id": "urn:epc:id:sgln:5012345.00001.0"}
}
```

Wichtige Geschaeftsschritte in der Pharma-Lieferkette:
- `commissioning` — Seriennummer wird der physischen Einheit zugewiesen
- `packing` — Aggregation in Kartons/Paletten
- `shipping` — Abgang von einem Standort
- `receiving` — Ankunft an einem Standort
- `dispensing` — An Patienten ausgegeben (Ausserbetriebnahme ausgeloest)

**Erwartet:** Jede Statusaenderung erzeugt ein EPCIS-Ereignis mit korrekten Zeitstempeln und Standorten.
**Bei Fehler:** Fehlgeschlagene Ereigniserfassung muss in die Warteschlange gestellt und erneut versucht werden; nie still verwerfen.

## Validierung

- [ ] Seriennummern sind randomisiert und pro GTIN eindeutig
- [ ] GS1-DataMatrix-Kodierung durch Barcode-Scanner verifiziert (ISO 15415 Grad C+)
- [ ] Aggregationshierarchie verknuepft korrekt Einheiten → Buendel → Kartons → Paletten
- [ ] Nationale Verifizierungssystem-Integration getestet (Upload, Verifizieren, Ausser Betrieb setzen)
- [ ] EPCIS-Ereignisse fuer alle Geschaeftsschritte erfasst
- [ ] Verifizierungs-Endpunkt antwortet innerhalb von 1 Sekunde
- [ ] Fehlerbehandlung deckt Upload-Fehler, Scan-Fehler und Netzwerkfehler ab

## Haeufige Stolperfallen

- **Sequenzielle Seriennummern**: EU FMD erfordert ausdruecklich Randomisierung zur Verhinderung von Faelschungen. Niemals sequenzielle Nummerierung verwenden.
- **Aggregationsfehler**: Disaggregation (Aufbrechen eines Kartons) muss die Hierarchie aktualisieren. Der Versand eines Kartons mit falschen Kinderzuordnungen verursacht Verifizierungsfehler nachgelagert.
- **Zeitzonenbehandlung**: EPCIS-Ereignisse muessen den Zeitzonenversatz enthalten. Die Verwendung von Ortszeit ohne Versatz verursacht Ereignisreihenfolge-Doppeldeutigkeiten standortuebereifend.
- **Spaete Uploads**: Seriennummerndaten muessen in nationale Systeme hochgeladen werden, bevor das Produkt in die Lieferkette gelangt. Spaeter Upload = Produkt wird in der Apotheke als verdaechtig markiert.
- **Ausnahmen ignorieren**: Legitime Produkte werden regelmaessig markiert (Fehlalarme). Ein Prozess zur Untersuchung und Auflosung von Warnmeldungen ist unerlaeesslich.

## Verwandte Skills

- `perform-csv-assessment` — Serialisierungssystem als computergestuetztes System validieren
- `conduct-gxp-audit` — Serialisierungsprozesse auditieren
- `implement-audit-trail` — Auditpfad fuer Serialisierungsereignisse
- `serialize-data-formats` — allgemeine Datenserialisierung (anderer Bereich, komplementaere Konzepte)
- `design-serialization-schema` — Schemagestaltung fuer Datenaustauschformate
