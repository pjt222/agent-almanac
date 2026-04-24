---
name: implement-pharma-serialisation
locale: wenyan
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

# 藥品序列化之實

為合 EU FMD、US DSCSA 及他全球法規之藥品追溯系統設序列化。

## 用時

- 為歐美新品上市實序列化
- 與歐洲藥驗系（EMVS/NMVS）整合
- 設合 DSCSA 之交易資訊交換
- 建或整合供應鏈可見之 EPCIS 事件庫
- 延序列化至他市（中 NMPA、巴西 ANVISA 等）

## 入

- **必要**：產品資（GTIN、產碼、劑型、包規）
- **必要**：目標市法規（EU FMD、DSCSA、或二者）
- **必要**：包層級（單、捆、箱、托盤）
- **可選**：整合用之 ERP/MES 系詳
- **可選**：合約製造商序列化能
- **可選**：驗端點規

## 法

### 第一步：識法規全景

| Regulation | Region | Key Requirements | Deadline |
|-----------|--------|------------------|----------|
| EU FMD (2011/62/EU) | EU/EEA | Unique identifier + tamper-evident feature on each unit | Live since Feb 2019 |
| DSCSA | USA | Electronic, interoperable tracing at package level | Full enforcement Nov 2024+ |
| China NMPA | China | Unique drug traceability code per minimum saleable unit | Rolling |
| Brazil ANVISA (SNCM) | Brazil | Serialisation of pharmaceuticals with IUM | Rolling |
| Russia MDLP | Russia | Crypto-code per unit, mandatory scanning | Live |

每法規之要資料元素：

**EU FMD 唯一識別（依委授規 2016/161）：**
- 產品碼（GS1 之 GTIN-14）
- 序列號（最多二十字母數字，隨機）
- 批/號
- 到期日

**DSCSA 交易資訊：**
- 產品識別（NDC/GTIN、序列、批、期）
- 交易資訊（日、實體、貨運詳）
- 交易歷與交易聲明
- 包級驗

**得：** 清識何法規於何產品市組合適用。

**敗則：** 繼前邀法規事務確市需。

### 第二步：設序列化資料模

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

聚合層級：

```
Pallet (SSCC)
  └── Case (SSCC)
       └── Bundle (GTIN + serial) [optional level]
            └── Unit (GTIN + serial)
```

**得：** 資料模支全包層級與 EPCIS 事件跟。

**敗則：** 若現 ERP 架構衝，設整合層而非直改 ERP。

### 第三步：實序列號生

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

**得：** 序列號加密隨機，每 GTIN 唯一，印前已存。

**敗則：** 若唯一性衝，重生衝序列並記事件。

### 第四步：實 GS1 DataMatrix 編碼

2D DataMatrix 條碼編 GS1 元素串：

```
(01)GTIN(21)Serial(10)Batch(17)Expiry
```

例：
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

中：
- AI(01) = GTIN-14
- AI(21) = 序列號
- AI(10) = 批/號
- AI(17) = 到期日（YYMMDD）

GS1 DataMatrix 用 FNC1 為變長欄間分隔（GS 字符，ASCII 29）。

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

**得：** 編串以 GS1 認證驗器掃試印驗（ISO 15415 C 級以上）。

**敗則：** 若掃驗敗，察印質、靜區、編碼序。

### 第五步：與國家驗系整合

#### EU FMD — EMVS/NMVS 整合

```
MAH → Upload serial data → EU Hub → Distribute to National Systems (NMVS)
                                      ├── Germany (securPharm)
                                      ├── France (CTS)
                                      ├── Italy (AIFA)
                                      └── ... 31 markets
```

API 操作：
1. **上傳**（MAH → EU Hub）：批上傳已配序列號
2. **驗**（藥房 → NMVS）：配前察序列狀態
3. **除役**（藥房 → NMVS）：售點處標為已配
4. **重激**（MAH → NMVS）：反誤除役

#### DSCSA — 驗路由服務

```
Trading Partner A → VRS Request → Verification Router → MAH's VRS → Response
```

實 VRS 響端點：

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

**得：** 驗端點於一秒內附正狀態響。

**敗則：** 若國家系上傳敗，指數退避重試並警運維。

### 第六步：實 EPCIS 事件捕

以 EPCIS 2.0 格式記供應鏈事件：

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

藥業供應鏈之要業務步：
- `commissioning` — 序列號賦物理單
- `packing` — 聚入箱/托盤
- `shipping` — 離場
- `receiving` — 達場
- `dispensing` — 供患（除役觸發）

**得：** 每狀態變生附正時戳與位之 EPCIS 事件。

**敗則：** 敗事件捕必入隊重試；勿默棄。

## 驗

- [ ] 序列號隨機且每 GTIN 唯一
- [ ] GS1 DataMatrix 編碼以掃器驗（ISO 15415 C 級以上）
- [ ] 聚合層級正連單→捆→箱→托盤
- [ ] 國家驗系整合已測（上傳、驗、除役）
- [ ] 所有業務步之 EPCIS 事件已捕
- [ ] 驗端點於一秒內響
- [ ] 異處涵上傳敗、掃敗、網誤

## 陷

- **序列號順序**：EU FMD 明求隨機防偽。勿用順序編號
- **聚合誤**：解聚（破箱）必更層級。誤子關之箱運致下游驗敗
- **時區處**：EPCIS 事件必含時區偏。無偏之本地時致跨場事件序模糊
- **遲上傳**：序列資料必於產品入供應鏈前上傳國家系。遲傳 = 藥房標疑
- **忽異常**：合法產品常被標（偽警）。察與解警之程要

## 參

- `perform-csv-assessment` — 驗序列化系為電算系
- `conduct-gxp-audit` — 審計序列化程
- `implement-audit-trail` — 序列化事件之審計軌
- `serialize-data-formats` — 通用資料序列化（異域，補概）
- `design-serialization-schema` — 資料交換格式之架構設
