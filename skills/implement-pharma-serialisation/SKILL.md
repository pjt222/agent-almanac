---
name: implement-pharma-serialisation
description: >
  Implement pharmaceutical serialisation and track-and-trace systems compliant
  with EU FMD, US DSCSA, and other global regulations. Covers unique identifier
  generation, aggregation hierarchy, EPCIS data exchange, and verification
  endpoint integration. Use when implementing serialisation for a new product
  launch, integrating with the EMVS/NMVS, designing DSCSA-compliant transaction
  exchange, building an EPCIS event repository, or extending serialisation to
  additional markets (China, Brazil, Russia).
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

# Implement Pharmaceutical Serialisation

Set up pharmaceutical serialisation systems for regulatory compliance with global track-and-trace mandates.

## When to Use

- Implementing serialisation for a new product launch in the EU or US market
- Integrating with the European Medicines Verification System (EMVS/NMVS)
- Designing DSCSA-compliant transaction information exchange
- Building or integrating an EPCIS event repository for supply chain visibility
- Extending serialisation to additional markets (China NMPA, Brazil ANVISA, etc.)

## Inputs

- **Required**: Product information (GTIN, product code, dosage form, pack sizes)
- **Required**: Target market regulations (EU FMD, DSCSA, or both)
- **Required**: Packaging hierarchy (unit, bundle, case, pallet)
- **Optional**: Existing ERP/MES system details for integration
- **Optional**: Contract manufacturer serialisation capabilities
- **Optional**: Verification endpoint specifications

## Procedure

### Step 1: Understand the Regulatory Landscape

| Regulation | Region | Key Requirements | Deadline |
|-----------|--------|------------------|----------|
| EU FMD (2011/62/EU) | EU/EEA | Unique identifier + tamper-evident feature on each unit | Live since Feb 2019 |
| DSCSA | USA | Electronic, interoperable tracing at package level | Full enforcement Nov 2024+ |
| China NMPA | China | Unique drug traceability code per minimum saleable unit | Rolling |
| Brazil ANVISA (SNCM) | Brazil | Serialisation of pharmaceuticals with IUM | Rolling |
| Russia MDLP | Russia | Crypto-code per unit, mandatory scanning | Live |

Key data elements per regulation:

**EU FMD unique identifier (per Delegated Regulation 2016/161):**
- Product code (GTIN-14 from GS1)
- Serial number (up to 20 alphanumeric characters, randomised)
- Batch/lot number
- Expiry date

**DSCSA transaction information:**
- Product identifier (NDC/GTIN, serial number, lot, expiry)
- Transaction information (date, entities, shipment details)
- Transaction history and transaction statement
- Verification at package level

**Expected:** Clear understanding of which regulations apply to each product-market combination.
**On failure:** Engage regulatory affairs to confirm market requirements before proceeding.

### Step 2: Design the Serialisation Data Model

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

Aggregation hierarchy:

```
Pallet (SSCC)
  └── Case (SSCC)
       └── Bundle (GTIN + serial) [optional level]
            └── Unit (GTIN + serial)
```

**Expected:** Data model supports full pack hierarchy with EPCIS event tracking.
**On failure:** If existing ERP schema conflicts, design an integration layer rather than modifying ERP directly.

### Step 3: Implement Serial Number Generation

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

**Expected:** Serial numbers are cryptographically random, unique per GTIN, and stored before printing.
**On failure:** If a uniqueness collision occurs, regenerate the conflicting serial and log the event.

### Step 4: Implement GS1 DataMatrix Encoding

The 2D DataMatrix barcode encodes the GS1 element string:

```
(01)GTIN(21)Serial(10)Batch(17)Expiry
```

Example:
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

Where:
- AI(01) = GTIN-14
- AI(21) = Serial number
- AI(10) = Batch/lot number
- AI(17) = Expiry date (YYMMDD)

The GS1 DataMatrix uses FNC1 as a separator (GS character, ASCII 29) between variable-length fields.

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

**Expected:** Encoded strings verified by scanning test prints with a GS1-certified verifier (ISO 15415 grade C or above).
**On failure:** If scan verification fails, check print quality, quiet zones, and encoding order.

### Step 5: Integrate with National Verification Systems

#### EU FMD — EMVS/NMVS Integration

```
MAH → Upload serial data → EU Hub → Distribute to National Systems (NMVS)
                                      ├── Germany (securPharm)
                                      ├── France (CTS)
                                      ├── Italy (AIFA)
                                      └── ... 31 markets
```

API operations:
1. **Upload** (MAH → EU Hub): Batch upload of commissioned serial numbers
2. **Verify** (Pharmacy → NMVS): Check serial status before dispensing
3. **Decommission** (Pharmacy → NMVS): Mark as dispensed at point of sale
4. **Reactivate** (MAH → NMVS): Reverse accidental decommission

#### DSCSA — Verification Router Service

```
Trading Partner A → VRS Request → Verification Router → MAH's VRS → Response
```

Implement a VRS responder endpoint:

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

**Expected:** Verification endpoints respond within 1 second with correct status.
**On failure:** If national system upload fails, retry with exponential backoff and alert operations.

### Step 6: Implement EPCIS Event Capture

Record supply chain events in EPCIS 2.0 format:

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

Key business steps in the pharma supply chain:
- `commissioning` — serial number assigned to physical unit
- `packing` — aggregation into cases/pallets
- `shipping` — departure from a location
- `receiving` — arrival at a location
- `dispensing` — supplied to patient (decommission trigger)

**Expected:** Every status change generates an EPCIS event with correct timestamps and locations.
**On failure:** Failed event capture must be queued and retried; never silently dropped.

## Validation

- [ ] Serial numbers are randomised and unique per GTIN
- [ ] GS1 DataMatrix encoding verified by barcode scanner (ISO 15415 grade C+)
- [ ] Aggregation hierarchy correctly links units → bundles → cases → pallets
- [ ] National verification system integration tested (upload, verify, decommission)
- [ ] EPCIS events captured for all business steps
- [ ] Verification endpoint responds within 1 second
- [ ] Exception handling covers upload failures, scan failures, and network errors

## Common Pitfalls

- **Sequential serial numbers**: EU FMD explicitly requires randomisation to prevent counterfeiting. Never use sequential numbering.
- **Aggregation errors**: Disaggregation (breaking a case) must update the hierarchy. Shipping a case with wrong child associations causes verification failures downstream.
- **Timezone handling**: EPCIS events must include timezone offset. Using local time without offset causes event ordering ambiguity across sites.
- **Late uploads**: Serial data must be uploaded to national systems before product enters the supply chain. Late upload = product flagged as suspicious at pharmacy.
- **Ignoring exceptions**: Legitimate products get flagged (false alerts) regularly. A process for investigating and resolving alerts is essential.

## Related Skills

- `perform-csv-assessment` — validate serialisation system as a computerised system
- `conduct-gxp-audit` — audit serialisation processes
- `implement-audit-trail` — audit trail for serialisation events
- `serialize-data-formats` — general data serialisation (different domain, complementary concepts)
- `design-serialization-schema` — schema design for data exchange formats
