---
name: implement-pharma-serialisation
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Pharma serialisation for global track-and-trace compliance.

## Use When

- New product launch EU / US market
- EMVS/NMVS integration
- DSCSA-compliant transaction exchange
- EPCIS event repo for supply chain visibility
- Extend to additional markets (China NMPA, Brazil ANVISA)

## In

- **Required**: product info (GTIN, code, dosage form, pack sizes)
- **Required**: target market regs (EU FMD, DSCSA, or both)
- **Required**: pack hierarchy (unit, bundle, case, pallet)
- **Optional**: existing ERP/MES details
- **Optional**: CMO serialisation capabilities
- **Optional**: verification endpoint specs

## Do

### Step 1: Regulatory landscape

| Regulation | Region | Key Requirements | Deadline |
|-----------|--------|------------------|----------|
| EU FMD (2011/62/EU) | EU/EEA | Unique identifier + tamper-evident feature on each unit | Live since Feb 2019 |
| DSCSA | USA | Electronic, interoperable tracing at package level | Full enforcement Nov 2024+ |
| China NMPA | China | Unique drug traceability code per minimum saleable unit | Rolling |
| Brazil ANVISA (SNCM) | Brazil | Serialisation of pharmaceuticals with IUM | Rolling |
| Russia MDLP | Russia | Crypto-code per unit, mandatory scanning | Live |

Data per reg:

**EU FMD unique ID (Delegated Regulation 2016/161):**
- Product code (GTIN-14 from GS1)
- Serial (up to 20 alphanum, randomised)
- Batch/lot
- Expiry date

**DSCSA transaction info:**
- Product ID (NDC/GTIN, serial, lot, expiry)
- Transaction info (date, entities, shipment)
- History + statement
- Verification at pkg level

→ Clear understanding of regs per product-market combo.

**If err:** engage regulatory affairs to confirm before proceeding.

### Step 2: Serialisation data model

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

Hierarchy:

```
Pallet (SSCC)
  └── Case (SSCC)
       └── Bundle (GTIN + serial) [optional level]
            └── Unit (GTIN + serial)
```

→ Model supports full pack hierarchy + EPCIS tracking.

**If err:** ERP schema conflicts → integration layer, don't modify ERP directly.

### Step 3: Serial number generation

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

→ Serials cryptographically random, unique per GTIN, stored before print.

**If err:** collision → regenerate conflicting + log.

### Step 4: GS1 DataMatrix encoding

2D DataMatrix encodes GS1 element string:

```
(01)GTIN(21)Serial(10)Batch(17)Expiry
```

Example:
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

Where:
- AI(01) = GTIN-14
- AI(21) = Serial
- AI(10) = Batch/lot
- AI(17) = Expiry (YYMMDD)

GS1 DataMatrix uses FNC1 separator (GS char, ASCII 29) between variable-length fields.

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

→ Encoded strings verified by scanning test prints (GS1-certified verifier ISO 15415 grade C+).

**If err:** scan fail → check print quality, quiet zones, encoding order.

### Step 5: Integrate national verification systems

#### EU FMD — EMVS/NMVS

```
MAH → Upload serial data → EU Hub → Distribute to National Systems (NMVS)
                                      ├── Germany (securPharm)
                                      ├── France (CTS)
                                      ├── Italy (AIFA)
                                      └── ... 31 markets
```

API ops:
1. **Upload** (MAH → EU Hub): batch commissioned serials
2. **Verify** (Pharmacy → NMVS): check status before dispense
3. **Decommission** (Pharmacy → NMVS): mark dispensed at POS
4. **Reactivate** (MAH → NMVS): reverse accidental decommission

#### DSCSA — Verification Router Service

```
Trading Partner A → VRS Request → Verification Router → MAH's VRS → Response
```

Impl VRS responder endpoint:

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

→ Endpoints respond <1 sec w/ correct status.

**If err:** national upload fail → retry exponential backoff + alert ops.

### Step 6: EPCIS event capture

EPCIS 2.0:

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

Key biz steps:
- `commissioning` — serial assigned to physical unit
- `packing` — aggregation into cases/pallets
- `shipping` — departure from location
- `receiving` — arrival at location
- `dispensing` — supplied to patient (decommission trigger)

→ Every status change → EPCIS event w/ correct timestamps + locations.

**If err:** failed event capture MUST queue + retry; never silently drop.

## Check

- [ ] Serials randomised + unique per GTIN
- [ ] DataMatrix verified by scanner (ISO 15415 grade C+)
- [ ] Aggregation links units → bundles → cases → pallets
- [ ] National verification tested (upload, verify, decommission)
- [ ] EPCIS events for all biz steps
- [ ] Verification <1 sec
- [ ] Exceptions covered (upload, scan, network)

## Traps

- **Sequential serials**: EU FMD requires randomisation. Never sequential.
- **Aggregation errors**: disaggregation (case break) must update hierarchy. Wrong child assoc → downstream verification fails.
- **TZ handling**: EPCIS must include TZ offset. Local time w/o offset → event ordering ambiguity across sites.
- **Late uploads**: must upload to national systems BEFORE product enters supply chain. Late → flagged suspicious at pharmacy.
- **Ignore exceptions**: legitimate products flagged (false alerts) regularly. Need process for investigating + resolving.

## →

- `perform-csv-assessment` — validate as computerised system
- `conduct-gxp-audit` — audit serialisation
- `implement-audit-trail` — audit for serialisation events
- `serialize-data-formats` — general data serialisation (complementary)
- `design-serialization-schema` — schema design for data exchange
