---
name: implement-pharma-serialisation
description: >
  EU FMD、US DSCSA、その他のグローバル規制に準拠した医薬品シリアライゼーションと
  トラックアンドトレースシステムを実装します。固有識別子の生成、集積階層、EPCISデータ
  交換、検証エンドポイント統合を対象とします。新製品上市向けのシリアライゼーション実装、
  EMVS/NMVSとの統合、DSCSAに準拠した取引情報交換の設計、EPCISイベントリポジトリの
  構築、または追加市場（中国、ブラジル、ロシア）へのシリアライゼーション拡張時に使用します。
locale: ja
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

# 医薬品シリアライゼーションの実装

グローバルなトラックアンドトレース規制への規制準拠のために医薬品シリアライゼーションシステムを設定します。

## 使用タイミング

- EUまたは米国市場での新製品上市向けのシリアライゼーション実装時
- 欧州医薬品検証システム（EMVS/NMVS）との統合時
- DSCSAに準拠した取引情報交換の設計時
- サプライチェーン可視性のためのEPCISイベントリポジトリの構築または統合時
- 追加市場（中国NMPA、ブラジルANVISA等）へのシリアライゼーション拡張時

## 入力

- **必須**: 製品情報（GTIN、製品コード、剤形、包装サイズ）
- **必須**: 対象市場の規制（EU FMD、DSCSA、またはその両方）
- **必須**: 包装階層（単品、束、ケース、パレット）
- **任意**: 統合用の既存ERPまたはMESシステムの詳細
- **任意**: 受託製造業者のシリアライゼーション能力
- **任意**: 検証エンドポイント仕様

## 手順

### ステップ1: 規制環境の把握

| 規制 | 地域 | 主要要件 | 期限 |
|-----------|--------|------------------|----------|
| EU FMD (2011/62/EU) | EU/EEA | 各単品への固有識別子 + 改ざん防止機能 | 2019年2月より発効 |
| DSCSA | 米国 | パッケージレベルでの電子的・相互運用可能なトレーシング | 2024年11月以降完全施行 |
| China NMPA | 中国 | 最小販売単位ごとの固有薬品トレーサビリティコード | 段階的 |
| Brazil ANVISA (SNCM) | ブラジル | IUM付き医薬品のシリアライゼーション | 段階的 |
| Russia MDLP | ロシア | 単品ごとの暗号コード、必須スキャン | 発効済み |

規制ごとの主要データ要素:

**EU FMDの固有識別子（委任規則2016/161に基づく）:**
- 製品コード（GS1からのGTIN-14）
- シリアル番号（最大20桁の英数字、ランダム化）
- バッチ/ロット番号
- 有効期限

**DSCSAの取引情報:**
- 製品識別子（NDC/GTIN、シリアル番号、ロット、有効期限）
- 取引情報（日付、関係者、出荷の詳細）
- 取引履歴と取引声明
- パッケージレベルでの検証

**期待結果：** どの規制が各製品・市場の組み合わせに適用されるかを明確に把握していること。
**失敗時：** 進める前に市場要件を確認するために規制部門に相談します。

### ステップ2: シリアライゼーションデータモデルの設計

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

集積階層:

```
Pallet (SSCC)
  └── Case (SSCC)
       └── Bundle (GTIN + serial) [optional level]
            └── Unit (GTIN + serial)
```

**期待結果：** データモデルがEPCISイベント追跡付きの完全なパック階層をサポートしていること。
**失敗時：** 既存のERPスキーマと競合する場合は、ERP を直接変更するのではなく統合レイヤーを設計します。

### ステップ3: シリアル番号生成の実装

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

**期待結果：** シリアル番号が暗号論的にランダムで、GTINごとにユニークで、印刷前に保存されていること。
**失敗時：** ユニーク性の衝突が発生した場合は、競合するシリアルを再生成し、イベントをログに記録します。

### ステップ4: GS1 DataMatrixエンコーディングの実装

2D DataMatrixバーコードはGS1エレメント文字列をエンコードします:

```
(01)GTIN(21)Serial(10)Batch(17)Expiry
```

例:
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

各フィールドの意味:
- AI(01) = GTIN-14
- AI(21) = シリアル番号
- AI(10) = バッチ/ロット番号
- AI(17) = 有効期限（YYMMDD）

GS1 DataMatrixは可変長フィールドの区切り文字としてFNC1（GSキャラクター、ASCII 29）を使用します。

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

**期待結果：** エンコードされた文字列がGS1認定の検証機（ISO 15415グレードC以上）でスキャンテスト印刷を確認していること。
**失敗時：** スキャン検証が失敗した場合は、印刷品質、クワイエットゾーン、エンコーディング順序を確認します。

### ステップ5: 国内検証システムとの統合

#### EU FMD — EMVS/NMVS統合

```
MAH → Upload serial data → EU Hub → Distribute to National Systems (NMVS)
                                      ├── Germany (securPharm)
                                      ├── France (CTS)
                                      ├── Italy (AIFA)
                                      └── ... 31 markets
```

API操作:
1. **アップロード**（MAH → EUハブ）: コミッショニングされたシリアル番号のバッチアップロード
2. **検証**（薬局 → NMVS）: 調剤前のシリアルステータス確認
3. **デコミッショニング**（薬局 → NMVS）: 販売時点での調剤済みとしてマーク
4. **再有効化**（MAH → NMVS）: 誤ったデコミッショニングの取り消し

#### DSCSA — 検証ルーターサービス

```
Trading Partner A → VRS Request → Verification Router → MAH's VRS → Response
```

VRSレスポンダーエンドポイントを実装します:

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

**期待結果：** 検証エンドポイントが1秒以内に正しいステータスで応答すること。
**失敗時：** 国内システムへのアップロードが失敗した場合は、指数バックオフでリトライし、運用チームに警告します。

### ステップ6: EPCISイベントキャプチャの実装

EPCIS 2.0形式でサプライチェーンイベントを記録します:

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

医薬品サプライチェーンにおける主要なビジネスステップ:
- `commissioning` — シリアル番号が物理的な単品に割り当てられる
- `packing` — ケースまたはパレットへの集積
- `shipping` — ある場所からの出発
- `receiving` — ある場所への到着
- `dispensing` — 患者への提供（デコミッショニングのトリガー）

**期待結果：** すべてのステータス変更が正しいタイムスタンプと場所を含むEPCISイベントを生成すること。
**失敗時：** 失敗したイベントキャプチャはキューに入れてリトライする必要があります。サイレントに破棄してはなりません。

## バリデーション

- [ ] シリアル番号がランダム化され、GTINごとにユニークである
- [ ] GS1 DataMatrixエンコーディングがバーコードスキャナーで検証されている（ISO 15415グレードC以上）
- [ ] 集積階層が単品 → 束 → ケース → パレットを正しくリンクしている
- [ ] 国内検証システム統合がテストされている（アップロード、検証、デコミッショニング）
- [ ] すべてのビジネスステップでEPCISイベントがキャプチャされている
- [ ] 検証エンドポイントが1秒以内に応答する
- [ ] 例外処理がアップロード失敗、スキャン失敗、ネットワークエラーを対象としている

## よくある落とし穴

- **連番シリアル番号**: EU FMDは偽造防止のためにランダム化を明示的に要求しています。連番を使用しないこと
- **集積エラー**: ケースの分解（解集積）は階層を更新する必要があります。誤った子関連付けのケースを出荷すると下流で検証失敗が発生します
- **タイムゾーン処理**: EPCISイベントはタイムゾーンオフセットを含める必要があります。オフセットなしのローカル時刻を使用するとサイト間でイベントの順序に曖昧さが生じます
- **遅延アップロード**: シリアルデータは製品がサプライチェーンに入る前に国内システムにアップロードする必要があります。遅延アップロード = 薬局で疑わしいとフラグされる製品
- **例外の無視**: 正当な製品が（誤検知で）定期的にフラグされます。アラートを調査・解決するプロセスが不可欠です

## 関連スキル

- `perform-csv-assessment` — コンピューター化システムとしてのシリアライゼーションシステムのバリデーション
- `conduct-gxp-audit` — シリアライゼーションプロセスの監査
- `implement-audit-trail` — シリアライゼーションイベントの監査証跡
- `serialize-data-formats` — 一般的なデータシリアライゼーション（異なるドメイン、補完的な概念）
- `design-serialization-schema` — データ交換フォーマットのスキーマ設計
