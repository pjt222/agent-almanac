---
name: design-serialization-schema
description: >
  JSON Schema、Protocol Buffer定義、またはApache Avroを使用してシリアライゼーション
  スキーマを設計する。スキーマのバージョニング、後方互換性、バリデーションルール、
  長期間使用されるデータフォーマットの進化戦略をカバー。新しいAPIコントラクトや
  データ交換フォーマットの定義、コンシューマーを壊さない既存スキーマへのフィールド
  追加、スキーマバージョン間の移行、スキーマシステム間の選択、自動適用のための
  データバリデーションルールの文書化に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: data-serialization
  complexity: intermediate
  language: multi
  tags: json-schema, protobuf, avro, schema-evolution, versioning, compatibility
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# シリアライゼーションスキーマの設計

コンシューマーを壊すことなく優雅に進化するバージョン管理されたシリアライゼーションスキーマを作成する。

## 使用タイミング

- 新しいAPIコントラクトやデータ交換フォーマットを定義する場合
- コンシューマーを壊さずに既存スキーマにフィールドを追加する場合
- スキーマバージョン間を移行する場合
- スキーマシステム（JSON Schema、Protobuf、Avro）を選択する場合
- 自動適用のためのデータバリデーションルールを文書化する場合

## 入力

- **必須**: データモデル（エンティティ関係、フィールド型、制約）
- **必須**: 互換性要件（誰がこのデータを消費するか、古いフォーマットをどのくらい読み取れる必要があるか）
- **任意**: 進化させる既存スキーマ
- **任意**: パフォーマンス要件（検証速度、スキーマレジストリ統合）
- **任意**: ターゲットシリアライゼーションフォーマット（JSON、バイナリ、カラムナ）

## 手順

### ステップ1: スキーマシステムの選択

| システム | フォーマット | 強み | 最適な用途 |
|--------|--------|-----------|----------|
| JSON Schema | JSON | 広くサポート、柔軟な検証 | REST API、設定検証 |
| Protocol Buffers | バイナリ | コンパクト、高速、強い型付け、組み込み進化 | gRPC、マイクロサービス |
| Apache Avro | バイナリ/JSON | データ内スキーマ、優れた進化サポート | Kafka、データパイプライン |
| XML Schema (XSD) | XML | 包括的な型付け、名前空間サポート | エンタープライズ/レガシーSOAP |
| TypeBox/Zod | TypeScript | 型推論、ランタイム検証 | TypeScript API |

**期待結果:** エコシステム、パフォーマンスニーズ、進化要件に基づいてスキーマシステムが選択される。
**失敗時:** 不確実な場合、JSON Schemaから始める — 最も広範なツーリングサポートがあり、既存のJSON APIに重ねることができる。

### ステップ2: コアスキーマの設計

#### JSON Schemaの例:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/measurement/v1",
  "title": "Measurement",
  "description": "A sensor measurement reading",
  "type": "object",
  "required": ["sensor_id", "value", "unit", "timestamp"],
  "properties": {
    "sensor_id": {
      "type": "string",
      "pattern": "^[a-z]+-[0-9]+$",
      "description": "Unique sensor identifier (lowercase-digits format)"
    },
    "value": {
      "type": "number",
      "description": "Measured value"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit", "kelvin", "percent", "ppm"],
      "description": "Unit of measurement"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp with timezone"
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true,
      "description": "Optional key-value metadata"
    }
  },
  "additionalProperties": false
}
```

#### Protocol Buffersの例:

```protobuf
syntax = "proto3";
package sensors.v1;

import "google/protobuf/timestamp.proto";

// Measurement represents a single sensor reading.
message Measurement {
  string sensor_id = 1;         // Unique sensor identifier
  double value = 2;             // Measured value
  Unit unit = 3;                // Unit of measurement
  google.protobuf.Timestamp timestamp = 4;
  map<string, string> metadata = 5; // Optional key-value metadata
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

#### Apache Avroの例:

```json
{
  "type": "record",
  "name": "Measurement",
  "namespace": "com.example.sensors",
  "doc": "A sensor measurement reading",
  "fields": [
    {"name": "sensor_id", "type": "string", "doc": "Unique sensor identifier"},
    {"name": "value", "type": "double", "doc": "Measured value"},
    {"name": "unit", "type": {"type": "enum", "name": "Unit", "symbols": ["CELSIUS", "FAHRENHEIT", "KELVIN", "PERCENT", "PPM"]}},
    {"name": "timestamp", "type": {"type": "long", "logicalType": "timestamp-millis"}},
    {"name": "metadata", "type": ["null", {"type": "map", "values": "string"}], "default": null}
  ]
}
```

**期待結果:** 説明、制約、明確な型定義を持つ自己文書化スキーマ。
**失敗時:** データモデルがまだ安定していない場合、スキーマを`draft`とマークし、レジストリへの公開を避ける。

### ステップ3: スキーマ進化の計画

互換性ルール:

| 変更 | 後方互換? | 前方互換? | 安全? |
|--------|------|------|-------|
| 任意フィールド追加 | はい | はい | はい |
| 必須フィールド追加 | いいえ | はい | いいえ（既存コンシューマーを壊す） |
| 任意フィールド削除 | はい | いいえ | 注意（プロデューサーがまだ送信する可能性） |
| 必須フィールド削除 | はい | いいえ | 注意 |
| フィールド名変更 | いいえ | いいえ | いいえ（エイリアス + 非推奨を使用） |
| フィールド型変更 | いいえ | いいえ | いいえ（新フィールドを追加し、古いものを非推奨に） |
| enum値追加 | はい（コンシューマーが未知を無視する場合） | いいえ | 実装依存 |
| enum値削除 | いいえ | はい | いいえ |

安全な進化戦略:
1. **任意フィールドのみ追加**（適切なデフォルト値付き）
2. **削除や名前変更は行わない** — 代わりに非推奨にする
3. **識別子でスキーマをバージョニング**する（`v1`、`v2`）
4. バイナリフォーマットには**スキーマレジストリを使用**する（Avro/ProtobufのConfluent Schema Registry）

**期待結果:** 進化計画が文書化: どの変更が安全か、どれが新バージョンを必要とするか。
**失敗時:** 破壊的変更が不可避な場合、スキーマをバージョニングし（v1 -> v2）、移行中は並行サポートを維持する。

### ステップ4: スキーマバリデーションの実装

```python
# JSON Schemaバリデーション（Python）
from jsonschema import validate, ValidationError
import json

schema = json.load(open("measurement_v1.json"))

def validate_measurement(data: dict) -> list[str]:
    """スキーマに対して測定値を検証する。エラーのリストを返す。"""
    errors = []
    try:
        validate(instance=data, schema=schema)
    except ValidationError as e:
        errors.append(f"{e.json_path}: {e.message}")
    return errors

# 使用例
errors = validate_measurement({"sensor_id": "s-01", "value": "not_a_number"})
# -> ["$.value: 'not_a_number' is not of type 'number'"]
```

```typescript
// TypeScript with Zod（ランタイム + コンパイルタイム）
import { z } from 'zod';

const MeasurementSchema = z.object({
  sensor_id: z.string().regex(/^[a-z]+-[0-9]+$/),
  value: z.number(),
  unit: z.enum(['celsius', 'fahrenheit', 'kelvin', 'percent', 'ppm']),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string()).optional(),
});

type Measurement = z.infer<typeof MeasurementSchema>;

// バリデーション
const result = MeasurementSchema.safeParse(inputData);
if (!result.success) {
  console.error(result.error.issues);
}
```

**期待結果:** システム境界（APIエンドポイント、ファイル取り込み）ですべての受信データにバリデーションが実行される。
**失敗時:** バリデーションエラーを完全なペイロード（機密フィールドはリダクト）とともにログに記録してデバッグに使用する。

### ステップ5: スキーマの文書化

スキーマドキュメントページを作成する:

```markdown
# Measurement Schema (v1)

## 概要
メタデータ付きの単一センサー読み取り値を表す。

## フィールド
| フィールド | 型 | 必須 | 説明 | 制約 |
|-------|------|----------|-------------|-------------|
| sensor_id | string | はい | 一意のセンサーID | パターン: `^[a-z]+-[0-9]+$` |
| value | number | はい | 測定値 | 任意の有効なIEEE 754倍精度 |
| unit | enum | はい | 測定単位 | celsius, fahrenheit, kelvin, percent, ppmのいずれか |
| timestamp | string | はい | 読み取り時刻 | タイムゾーン付きISO 8601 |
| metadata | object | いいえ | キー値ペア | 文字列キーと値 |

## 変更履歴
| バージョン | 日付 | 変更内容 |
|---------|------|---------|
| v1 | 2025-03-01 | 初期スキーマ |

## 互換性
- **後方**: v1のコンシューマーは将来のバージョンでも引き続き動作する
- **ポリシー**: マイナーバージョン間では追加的で任意のフィールド変更のみ
```

**期待結果:** ドキュメントが自動生成されるか、スキーマ定義と同期を保つ。
**失敗時:** ドキュメントがスキーマから乖離した場合、スキーマソースに対してドキュメントを検証するCIチェックを追加する。

## バリデーション

- [ ] スキーマがユースケースに適切なシステムを使用している（JSON Schema、Protobuf、Avro）
- [ ] すべてのフィールドに型、説明、制約がある
- [ ] 必須 vs 任意フィールドが明示的に定義されている
- [ ] 進化戦略が文書化されている（安全な変更、バージョニングポリシー）
- [ ] システム境界でバリデーションが実装されている
- [ ] スキーマが変更履歴付きでバージョニングされている
- [ ] ラウンドトリップテスト: シリアライズ -> デシリアライズ -> 比較でデータ損失がないことを確認

## よくある落とし穴

- **早すぎる過度な制約**: 新しいスキーマの厳格なバリデーションはイテレーションをブロックする。寛容に始め（`additionalProperties: true`）、後から厳しくする。
- **デフォルト値なし**: デフォルトなしで必須フィールドを追加すると既存データがすべて壊れる。新フィールドには常にデフォルトを提供する。
- **nullの無視**: 多くのスキーマがnull/欠落フィールドを明確に処理しない。nullable vs optionalについて明示的にする。
- **URLではなくペイロードにバージョンを**: 長期間保存されるデータ（ストレージ、イベント）には、エンドポイントURLだけでなくデータ自体にスキーマバージョンを埋め込む。
- **enumの網羅性**: 新しいenum値を追加すると、網羅的なswitch文を使用するコンシューマーがクラッシュする可能性がある。未知の値を優雅に処理すべきことを文書化する。

## 関連スキル

- `serialize-data-formats` — フォーマット選択とエンコード/デコード実装
- `implement-pharma-serialisation` — 医薬品シリアライゼーション（規制スキーマ）
- `write-validation-documentation` — 規制スキーマのバリデーション文書化
