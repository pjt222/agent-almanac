---
name: implement-pharma-serialisation
description: >
  Implementar sistemas de serialización y trazabilidad farmacéutica conformes
  con EU FMD, US DSCSA y otras regulaciones globales. Cubre la generación de
  identificadores únicos, jerarquía de agregación, intercambio de datos EPCIS
  e integración de endpoints de verificación. Usar al implementar serialización
  para un nuevo lanzamiento de producto, al integrar con el EMVS/NMVS, al
  diseñar el intercambio de transacciones conforme a DSCSA, al construir un
  repositorio de eventos EPCIS, o al extender la serialización a mercados
  adicionales (China, Brasil, Rusia).
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
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

# Implementar Serialización Farmacéutica

Configurar sistemas de serialización farmacéutica para el cumplimiento regulatorio con los mandatos globales de seguimiento y trazabilidad.

## Cuándo Usar

- Al implementar serialización para un nuevo lanzamiento de producto en el mercado de la UE o los EE.UU.
- Al integrar con el Sistema Europeo de Verificación de Medicamentos (EMVS/NMVS)
- Al diseñar el intercambio de información de transacciones conforme a DSCSA
- Al construir o integrar un repositorio de eventos EPCIS para visibilidad de la cadena de suministro
- Al extender la serialización a mercados adicionales (China NMPA, Brasil ANVISA, etc.)

## Entradas

- **Requerido**: Información del producto (GTIN, código de producto, forma farmacéutica, tamaños de envase)
- **Requerido**: Regulaciones del mercado objetivo (EU FMD, DSCSA, o ambas)
- **Requerido**: Jerarquía de envase (unidad, paquete, caja, palé)
- **Opcional**: Detalles del sistema ERP/MES existente para integración
- **Opcional**: Capacidades de serialización del fabricante por contrato
- **Opcional**: Especificaciones del endpoint de verificación

## Procedimiento

### Paso 1: Comprender el Panorama Regulatorio

| Regulación | Región | Requisitos Clave | Fecha de Vigencia |
|-----------|--------|------------------|----------|
| EU FMD (2011/62/EU) | UE/EEE | Identificador único + característica antimanipulación en cada unidad | Vigente desde feb 2019 |
| DSCSA | EE.UU. | Trazabilidad electrónica e interoperable a nivel de envase | Aplicación completa nov 2024+ |
| China NMPA | China | Código único de trazabilidad de medicamentos por unidad mínima vendible | Gradual |
| Brasil ANVISA (SNCM) | Brasil | Serialización de medicamentos con IUM | Gradual |
| Rusia MDLP | Rusia | Código criptográfico por unidad, escaneo obligatorio | Vigente |

Elementos de datos clave por regulación:

**Identificador único EU FMD (conforme al Reglamento Delegado 2016/161):**
- Código de producto (GTIN-14 de GS1)
- Número de serie (hasta 20 caracteres alfanuméricos, aleatorio)
- Número de lote
- Fecha de caducidad

**Información de transacción DSCSA:**
- Identificador de producto (NDC/GTIN, número de serie, lote, caducidad)
- Información de transacción (fecha, entidades, detalles del envío)
- Historial de transacciones y declaración de transacción
- Verificación a nivel de envase

**Esperado:** Comprensión clara de qué regulaciones aplican a cada combinación producto-mercado.
**En caso de fallo:** Consultar a asuntos regulatorios para confirmar los requisitos del mercado antes de proceder.

### Paso 2: Diseñar el Modelo de Datos de Serialización

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

Jerarquía de agregación:

```
Pallet (SSCC)
  └── Case (SSCC)
       └── Bundle (GTIN + serial) [optional level]
            └── Unit (GTIN + serial)
```

**Esperado:** El modelo de datos admite la jerarquía completa de envases con seguimiento de eventos EPCIS.
**En caso de fallo:** Si el esquema ERP existente entra en conflicto, diseñar una capa de integración en lugar de modificar el ERP directamente.

### Paso 3: Implementar la Generación de Números de Serie

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

**Esperado:** Los números de serie son criptográficamente aleatorios, únicos por GTIN y almacenados antes de la impresión.
**En caso de fallo:** Si ocurre una colisión de unicidad, regenerar el número de serie en conflicto y registrar el evento.

### Paso 4: Implementar la Codificación GS1 DataMatrix

El código de barras 2D DataMatrix codifica la cadena de elementos GS1:

```
(01)GTIN(21)Serial(10)Batch(17)Expiry
```

Ejemplo:
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

Donde:
- AI(01) = GTIN-14
- AI(21) = Número de serie
- AI(10) = Número de lote
- AI(17) = Fecha de caducidad (YYMMDD)

El DataMatrix GS1 usa FNC1 como separador (carácter GS, ASCII 29) entre campos de longitud variable.

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

**Esperado:** Las cadenas codificadas se verifican escaneando impresiones de prueba con un verificador certificado por GS1 (grado ISO 15415 C o superior).
**En caso de fallo:** Si la verificación del escaneo falla, verificar la calidad de impresión, las zonas tranquilas y el orden de codificación.

### Paso 5: Integrar con los Sistemas Nacionales de Verificación

#### EU FMD — Integración EMVS/NMVS

```
MAH → Upload serial data → EU Hub → Distribute to National Systems (NMVS)
                                      ├── Germany (securPharm)
                                      ├── France (CTS)
                                      ├── Italy (AIFA)
                                      └── ... 31 markets
```

Operaciones API:
1. **Carga** (MAH → EU Hub): Carga masiva de números de serie puestos en circulación
2. **Verificación** (Farmacia → NMVS): Verificar el estado del número de serie antes de dispensar
3. **Desactivación** (Farmacia → NMVS): Marcar como dispensado en el punto de venta
4. **Reactivación** (MAH → NMVS): Revertir una desactivación accidental

#### DSCSA — Servicio de Enrutamiento de Verificación

```
Trading Partner A → VRS Request → Verification Router → MAH's VRS → Response
```

Implementar un endpoint respondedor VRS:

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

**Esperado:** Los endpoints de verificación responden en menos de 1 segundo con el estado correcto.
**En caso de fallo:** Si la carga al sistema nacional falla, reintentar con retardo exponencial y alertar a operaciones.

### Paso 6: Implementar la Captura de Eventos EPCIS

Registrar los eventos de la cadena de suministro en formato EPCIS 2.0:

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

Pasos de negocio clave en la cadena de suministro farmacéutica:
- `commissioning` — número de serie asignado a la unidad física
- `packing` — agregación en cajas/palés
- `shipping` — salida de una ubicación
- `receiving` — llegada a una ubicación
- `dispensing` — suministrado al paciente (desencadenador de desactivación)

**Esperado:** Cada cambio de estado genera un evento EPCIS con marcas de tiempo y ubicaciones correctas.
**En caso de fallo:** La captura de eventos fallida debe ponerse en cola y reintentarse; nunca descartarse silenciosamente.

## Validación

- [ ] Los números de serie son aleatorios y únicos por GTIN
- [ ] La codificación GS1 DataMatrix verificada por escáner de código de barras (grado ISO 15415 C+)
- [ ] La jerarquía de agregación vincula correctamente unidades → paquetes → cajas → palés
- [ ] La integración con el sistema de verificación nacional probada (carga, verificación, desactivación)
- [ ] Eventos EPCIS capturados para todos los pasos de negocio
- [ ] El endpoint de verificación responde en menos de 1 segundo
- [ ] El manejo de excepciones cubre fallos de carga, fallos de escaneo y errores de red

## Errores Comunes

- **Números de serie secuenciales**: EU FMD requiere explícitamente la aleatorización para prevenir la falsificación. Nunca usar numeración secuencial.
- **Errores de agregación**: La desagregación (ruptura de una caja) debe actualizar la jerarquía. Enviar una caja con asociaciones de contenido incorrectas causa fallos de verificación aguas abajo.
- **Gestión de zona horaria**: Los eventos EPCIS deben incluir el desplazamiento de zona horaria. Usar la hora local sin desplazamiento causa ambigüedad en el orden de eventos entre sedes.
- **Cargas tardías**: Los datos de números de serie deben cargarse a los sistemas nacionales antes de que el producto entre en la cadena de suministro. Carga tardía = producto señalado como sospechoso en la farmacia.
- **Ignorar excepciones**: Los productos legítimos se señalan con frecuencia (falsas alertas). Un proceso para investigar y resolver alertas es esencial.

## Habilidades Relacionadas

- `perform-csv-assessment` — validar el sistema de serialización como un sistema informatizado
- `conduct-gxp-audit` — auditar los procesos de serialización
- `implement-audit-trail` — registro de auditoría para eventos de serialización
- `serialize-data-formats` — serialización de datos general (dominio diferente, conceptos complementarios)
- `design-serialization-schema` — diseño de esquema para formatos de intercambio de datos
