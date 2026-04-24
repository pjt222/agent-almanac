---
name: implement-pharma-serialisation
locale: wenyan-lite
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

# 實藥品序列化

為合全球追溯法令設藥品序列化系統。

## 適用時機

- 於歐美市場為新產品上市實序列化
- 與歐洲藥品驗證系統（EMVS/NMVS）整合
- 設計 DSCSA 合規之交易資訊交換
- 建或整合 EPCIS 事件庫以供應鏈可見
- 擴序列化至其他市場（中國 NMPA、巴西 ANVISA 等）

## 輸入

- **必要**：產品資訊（GTIN、產品碼、劑型、包裝尺寸）
- **必要**：目標市場法規（EU FMD、DSCSA 或兩者）
- **必要**：包裝層級（單位、捆、箱、棧板）
- **選擇性**：現有 ERP/MES 系統詳情以整合
- **選擇性**：委託製造商之序列化能力
- **選擇性**：驗證端點之規格

## 步驟

### 步驟一：解監管環境

| 法規 | 地區 | 關鍵要求 | 期限 |
|-----------|--------|------------------|----------|
| EU FMD (2011/62/EU) | 歐盟/EEA | 每單位附唯一識別符與防篡改特徵 | 2019 年 2 月上線 |
| DSCSA | 美國 | 電子、互操作之包裝級追溯 | 2024 年 11 月起全面執行 |
| China NMPA | 中國 | 每最小可售單位唯一藥品追溯碼 | 滾動 |
| Brazil ANVISA (SNCM) | 巴西 | 以 IUM 之藥品序列化 | 滾動 |
| Russia MDLP | 俄羅斯 | 每單位加密碼，強制掃描 | 上線 |

各法規之關鍵資料元素：

**EU FMD 唯一識別符（依授權條例 2016/161）：**
- 產品碼（GS1 之 GTIN-14）
- 序列號（最多 20 字母數字字元，隨機）
- 批號
- 有效期

**DSCSA 交易資訊：**
- 產品識別（NDC/GTIN、序列號、批號、有效期）
- 交易資訊（日期、實體、裝運詳情）
- 交易歷史與交易聲明
- 包裝級驗證

**預期：** 清解哪些法規適用於每產品-市場組合。
**失敗時：** 繼續前與監管事務確認市場要求。

### 步驟二：設計序列化資料模型

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

**預期：** 資料模型支持完整包裝層級附 EPCIS 事件追蹤。
**失敗時：** 若現 ERP 結構衝突，設計整合層而非直接改 ERP。

### 步驟三：實序列號生成

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

**預期：** 序列號為密碼學隨機、每 GTIN 唯一、印前已存。
**失敗時：** 若生唯一性碰撞，重生衝突之序列並記事件。

### 步驟四：實 GS1 DataMatrix 編碼

2D DataMatrix 條碼編 GS1 元素字串：

```
(01)GTIN(21)Serial(10)Batch(17)Expiry
```

例：
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

其中：
- AI(01) = GTIN-14
- AI(21) = 序列號
- AI(10) = 批號
- AI(17) = 有效期（YYMMDD）

GS1 DataMatrix 用 FNC1 為分隔符（GS 字元，ASCII 29）於變長欄位間。

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

**預期：** 編碼字串以 GS1 認證之驗證器掃描測試印刷（ISO 15415 C 級或以上）驗證。
**失敗時：** 若掃描驗證失敗，核印刷品質、靜區與編碼順序。

### 步驟五：與國家驗證系統整合

#### EU FMD —— EMVS/NMVS 整合

```
MAH → Upload serial data → EU Hub → Distribute to National Systems (NMVS)
                                      ├── Germany (securPharm)
                                      ├── France (CTS)
                                      ├── Italy (AIFA)
                                      └── ... 31 markets
```

API 操作：
1. **上傳**（MAH → EU Hub）：委託之序列號之批次上傳
2. **驗證**（藥局 → NMVS）：發放前核序列狀態
3. **撤銷**（藥局 → NMVS）：銷售點標為已分發
4. **重啟**（MAH → NMVS）：反轉意外撤銷

#### DSCSA —— Verification Router Service

```
Trading Partner A → VRS Request → Verification Router → MAH's VRS → Response
```

實 VRS 回應端點：

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

**預期：** 驗證端點於一秒內以正確狀態回應。
**失敗時：** 若國家系統上傳失敗，以指數退避重試並警示營運。

### 步驟六：實 EPCIS 事件捕獲

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

藥品供應鏈中關鍵業務步驟：
- `commissioning` — 序列號指派予實體單位
- `packing` — 聚合入箱/棧板
- `shipping` — 自一位置出發
- `receiving` — 至一位置抵達
- `dispensing` — 供予病患（撤銷觸發）

**預期：** 每狀態變生 EPCIS 事件附正確時間戳與位置。
**失敗時：** 失敗事件捕獲須排隊並重試；永勿默棄。

## 驗證

- [ ] 序列號為隨機且每 GTIN 唯一
- [ ] GS1 DataMatrix 編碼以條碼掃描器驗證（ISO 15415 C+ 級）
- [ ] 聚合層級正確連單位 → 捆 → 箱 → 棧板
- [ ] 國家驗證系統整合已測（上傳、驗證、撤銷）
- [ ] 所有業務步驟之 EPCIS 事件已捕獲
- [ ] 驗證端點於一秒內回應
- [ ] 異常處理涵蓋上傳失敗、掃描失敗與網路錯

## 常見陷阱

- **順序序列號**：EU FMD 明確要求隨機以防偽造。永勿用順序編號。
- **聚合錯**：解聚（破箱）須更新層級。以錯子關聯送箱致下游驗證失敗。
- **時區處理**：EPCIS 事件須含時區偏移。用本地時無偏移致跨站事件順序模糊。
- **晚上傳**：序列資料須於產品入供應鏈前上傳至國家系統。晚上傳 = 產品於藥局標為可疑。
- **忽視異常**：合法產品常被標（假警）。調查與解警之流程為要。

## 相關技能

- `perform-csv-assessment` — 將序列化系統驗證為電腦化系統
- `conduct-gxp-audit` — 稽核序列化流程
- `implement-audit-trail` — 序列化事件之稽核軌跡
- `serialize-data-formats` — 一般資料序列化（不同領域，補充概念）
- `design-serialization-schema` — 資料交換格式之結構設計
