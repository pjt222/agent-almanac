---
name: implement-pharma-serialisation
locale: wenyan-ultra
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

# 實藥序列化

立藥序列化系統以合全球追蹤法規。

## 用

- 為 EU 或 US 市新品上市實序列化
- 與歐藥驗系（EMVS/NMVS）集成
- 設 DSCSA 合之交易訊交
- 建或集 EPCIS 事件倉供供應鏈見
- 擴序列化至他市（中 NMPA、巴 ANVISA 等）

## 入

- **必**：產品訊（GTIN、產碼、劑型、包尺）
- **必**：目標市法規（EU FMD、DSCSA 或皆）
- **必**：包級（單、捆、箱、棧）
- **可**：既 ERP/MES 系統細供集成
- **可**：合同製商序列化能
- **可**：驗端規

## 行

### 一：知法規界

| Regulation | Region | Key Requirements | Deadline |
|-----------|--------|------------------|----------|
| EU FMD (2011/62/EU) | EU/EEA | Unique identifier + tamper-evident feature on each unit | Live since Feb 2019 |
| DSCSA | USA | Electronic, interoperable tracing at package level | Full enforcement Nov 2024+ |
| China NMPA | China | Unique drug traceability code per minimum saleable unit | Rolling |
| Brazil ANVISA (SNCM) | Brazil | Serialisation of pharmaceuticals with IUM | Rolling |
| Russia MDLP | Russia | Crypto-code per unit, mandatory scanning | Live |

諸法規之關鍵數據元：

**EU FMD 唯一識別（依 Delegated Regulation 2016/161）：**
- 產碼（GS1 之 GTIN-14）
- 序號（至多 20 字母數字，隨化）
- 批/批次號
- 有效期

**DSCSA 交易訊：**
- 產識（NDC/GTIN、序號、批、期）
- 交易訊（日期、實體、裝運詳）
- 交易史與交易聲明
- 包級驗

得：各產品-市合之法規明。
敗：用法規事務確市要再進。

### 二：設序列化數模

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

集級：

```
Pallet (SSCC)
  └── Case (SSCC)
       └── Bundle (GTIN + serial) [optional level]
            └── Unit (GTIN + serial)
```

得：數模支全包級與 EPCIS 事件追。
敗：既 ERP 架衝→設集成層而非改 ERP。

### 三：實序號生成

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

得：序號為密隨，於 GTIN 內唯一，印前已存。
敗：唯一性撞→重生衝突序並記事件。

### 四：實 GS1 DataMatrix 編

2D DataMatrix 條碼編 GS1 元串：

```
(01)GTIN(21)Serial(10)Batch(17)Expiry
```

例：
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

其中：
- AI(01) = GTIN-14
- AI(21) = 序號
- AI(10) = 批/批次號
- AI(17) = 有效期（YYMMDD）

GS1 DataMatrix 於變長欄間用 FNC1 為分（GS 字，ASCII 29）。

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

得：編串經 GS1 認驗器掃試印驗（ISO 15415 C 級以上）。
敗：掃驗敗→察印質、靜區、編序。

### 五：與國驗系集成

#### EU FMD——EMVS/NMVS 集成

```
MAH → Upload serial data → EU Hub → Distribute to National Systems (NMVS)
                                      ├── Germany (securPharm)
                                      ├── France (CTS)
                                      ├── Italy (AIFA)
                                      └── ... 31 markets
```

API 操作：
1. **上傳**（MAH → EU Hub）：批上傳已提交序號
2. **驗**（藥房 → NMVS）：發放前察序態
3. **退役**（藥房 → NMVS）：售點標為已配
4. **重啟**（MAH → NMVS）：撤意外退役

#### DSCSA——驗路由服務

```
Trading Partner A → VRS Request → Verification Router → MAH's VRS → Response
```

實 VRS 應端：

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

得：驗端於一秒內以正態應。
敗：國系統上傳敗→以指數退避重試並警運。

### 六：實 EPCIS 事件捕

以 EPCIS 2.0 格記供應鏈事件：

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

藥供應鏈之關鍵業務步：
- `commissioning`——序號分配予物理單
- `packing`——集成為箱/棧
- `shipping`——自位發
- `receiving`——至位抵
- `dispensing`——配患（觸發退役）

得：各態變生 EPCIS 事件含正時戳位。
敗：事件捕敗必隊並重試；絕勿默棄。

## 驗

- [ ] 序號隨化且於 GTIN 內唯
- [ ] GS1 DataMatrix 編經條碼掃驗（ISO 15415 C+）
- [ ] 集級正連單→捆→箱→棧
- [ ] 國驗系集成已試（上傳、驗、退役）
- [ ] 諸業務步之 EPCIS 事件捕
- [ ] 驗端於 1 秒應
- [ ] 異常處涵上傳敗、掃敗、網誤

## 忌

- **序號順**：EU FMD 明需隨化以防偽。絕勿用順號
- **集錯**：拆（破箱）必更級。發錯子關之箱致下游驗敗
- **時區處**：EPCIS 事件必含時區偏。用本地時無偏→跨地事件序曖
- **晚上傳**：序數據於產入供應鏈前必上傳至國系。晚上傳=產於藥房標可疑
- **忽異常**：合法產常被標（假警）。究解警之程必有

## 參

- `perform-csv-assessment`
- `conduct-gxp-audit`
- `implement-audit-trail`
- `serialize-data-formats`
- `design-serialization-schema`
