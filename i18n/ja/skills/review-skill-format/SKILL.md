---
name: review-skill-format
description: >
  SKILL.mdファイルのagentskills.io標準への準拠をレビューする。YAMLフロントマター
  フィールド、必須セクション、行数制限、手順ステップのフォーマット、レジストリの
  同期を確認する。新しいスキルのマージ前フォーマット検証、既存スキルの変更後の
  再検証、ドメイン内のスキルのバッチ監査、またはプルリクエストでの投稿者の
  スキル提出レビューに使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, format, validation, agentskills, quality
---

# Review Skill Format

SKILL.mdファイルをagentskills.ioオープン標準に対して検証する。このスキルはYAMLフロントマターの完全性、必須セクションの存在、手順ステップのフォーマット（Expected/On failureブロック）、行数制限、レジストリの同期を確認する。新しいまたは変更されたスキルをマージする前にこのスキルを使用すること。

## 使用タイミング

- 新しいスキルが作成され、マージ前にフォーマット検証が必要な場合
- 既存のスキルが変更され、再検証が必要な場合
- ドメイン内のすべてのスキルのバッチ監査を実施する場合
- `create-skill` メタスキルで作成されたスキルを検証する場合
- プルリクエストで投稿者のスキル提出をレビューする場合

## 入力

- **必須**: SKILL.mdファイルへのパス（例：`skills/setup-vault/SKILL.md`）
- **任意**: 厳密度レベル（`lenient` または `strict`、デフォルト：`strict`）
- **任意**: レジストリの同期を確認するかどうか（デフォルト：yes）

## 手順

### ステップ1: ファイルの存在確認とコンテンツの読み込み

SKILL.mdファイルが期待されるパスに存在することを確認し、完全なコンテンツを読み込む。

```bash
# Verify file exists
test -f skills/<skill-name>/SKILL.md && echo "EXISTS" || echo "MISSING"

# Count lines
wc -l < skills/<skill-name>/SKILL.md
```

**期待結果：** ファイルが存在し、コンテンツが読み込める。行数が表示される。

**失敗時：** ファイルが存在しない場合は、パスのタイポを確認する。`ls skills/<skill-name>/` でスキルディレクトリが存在するか確認する。ディレクトリが存在しない場合は、スキルがまだ作成されていない — まず `create-skill` を使用すること。

### ステップ2: YAMLフロントマターフィールドの確認

YAMLフロントマターブロック（`---` デリミタ間）を解析し、必須および推奨フィールドがすべて存在するか確認する。

必須フィールド：
- `name` — ディレクトリ名と一致する（ケバブケース）
- `description` — 1024文字未満、動詞で始まる
- `license` — 通常 `MIT`
- `allowed-tools` — カンマ区切りまたはスペース区切りのツールリスト

推奨メタデータフィールド：
- `metadata.author` — 著者名
- `metadata.version` — セマンティックバージョン文字列
- `metadata.domain` — `skills/_registry.yml` に記載されているドメインのいずれか
- `metadata.complexity` — `basic`、`intermediate`、`advanced` のいずれか
- `metadata.language` — 主要言語または `multi`
- `metadata.tags` — カンマ区切り、3〜6タグ、ドメイン名を含む

```bash
# Check required frontmatter fields exist
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: MISSING"
```

**期待結果：** 4つの必須フィールドすべてが存在する。6つのメタデータフィールドすべてが存在する。`name` がディレクトリ名と一致する。`description` が1024文字未満である。

**失敗時：** 欠落している各フィールドをBLOCKINGとして報告する。`name` がディレクトリ名と一致しない場合は、期待される値を添えてBLOCKINGとして報告する。`description` が1024文字を超える場合は、現在の長さを添えてSUGGESTとして報告する。

### ステップ3: 必須セクションの確認

スキルの本文（フロントマターの後）に6つの必須セクションがすべて存在するか確認する。

必須セクション：
1. `## When to Use`
2. `## Inputs`
3. `## Procedure`（`### Step N:` サブセクションを含む）
4. `## Validation`（`## Validation Checklist` としても可）
5. `## Common Pitfalls`
6. `## Related Skills`

```bash
# Check each required section
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done

# Validation section may use either heading
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

**期待結果：** 6つのセクションすべてが存在する。Procedureセクションに少なくとも1つの `### Step` サブ見出しが含まれている。

**失敗時：** 欠落している各セクションをBLOCKINGとして報告する。6つのセクションすべてが揃っていないスキルはagentskills.io標準に準拠していない。`create-skill` メタスキルのセクションテンプレートを提供する。

### ステップ4: 手順ステップフォーマットの確認

各手順ステップが必須パターンに従っているか確認する：番号付きステップタイトル、コンテキスト、コードブロック、**Expected:**/**On failure:** ブロック。

各 `### Step N:` サブセクションについて確認する：
1. ステップに説明的なタイトルがある（「Step N」だけではない）
2. 少なくとも1つのコードブロックまたは具体的な指示が存在する
3. `**Expected:**` ブロックが存在する
4. `**On failure:**` ブロックが存在する

**期待結果：** すべての手順ステップが **Expected:** と **On failure:** ブロックの両方を持っている。ステップには曖昧な説明ではなく、具体的なコードまたは指示が含まれている。

**失敗時：** Expected/On failureが欠落している各ステップをBLOCKINGとして報告する。ステップが曖昧な指示のみを含む場合（「システムを適切に設定する」）、具体的なコマンドを追加するように注記を添えてSUGGESTとして報告する。

### ステップ5: 行数の確認

SKILL.mdが500行制限内であることを確認する。

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "OVER LIMIT ($lines lines > 500)"
```

**期待結果：** 行数が500以下である。

**失敗時：** 500行を超える場合はBLOCKINGとして報告する。15行を超えるコードブロックを `references/EXAMPLES.md` に抽出するために `refactor-skill-structure` スキルの使用を推奨する。一般的な削減：拡張例を抽出することで20〜40%の削減。

### ステップ6: レジストリの同期確認

スキルが正しいドメインの下で一致するメタデータを持って `skills/_registry.yml` にリストされているか確認する。

確認事項：
1. スキルの `id` が正しいドメインセクションの下に存在する
2. `path` が `<skill-name>/SKILL.md` と一致する
3. `complexity` がフロントマターと一致する
4. `description` が存在する（省略可）
5. レジストリ上部の `total_skills` カウントが実際のスキル数と一致する

```bash
# Check if skill is in registry
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: FOUND" || echo "Registry: NOT FOUND"

# Check path
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Path: OK" || echo "Path: MISMATCH"
```

**期待結果：** スキルが正しいドメインの下で一致するパスとメタデータを持ってレジストリにリストされている。合計カウントが正確である。

**失敗時：** レジストリに見つからない場合はBLOCKINGとして報告する。レジストリエントリテンプレートを提供する：
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description
```

## バリデーション

- [ ] SKILL.mdファイルが期待されるパスに存在する
- [ ] YAMLフロントマターがエラーなしに解析される
- [ ] 4つの必須フロントマターフィールドすべてが存在する（`name`、`description`、`license`、`allowed-tools`）
- [ ] 6つのメタデータフィールドすべてが存在する（`author`、`version`、`domain`、`complexity`、`language`、`tags`）
- [ ] `name` フィールドがディレクトリ名と一致する
- [ ] `description` が1024文字未満である
- [ ] 6つの必須セクションすべてが存在する（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- [ ] すべての手順ステップが **Expected:** と **On failure:** ブロックを持っている
- [ ] 行数が500以下である
- [ ] スキルが正しいドメイン、パス、メタデータを持って `_registry.yml` にリストされている
- [ ] レジストリの `total_skills` カウントが正確である

## よくある落とし穴

- **正規表現のみでフロントマターを確認する**: YAMLの解析は微妙な場合がある。`description: >` の複数行ブロックは `description: "インライン"` とは異なる見た目をする。フィールドを検索する際は両方のパターンを確認すること。
- **Validationセクションのバリアントを見逃す**: 一部のスキルは `## Validation` の代わりに `## Validation Checklist` を使用する。どちらも許容される；どちらの見出しも確認すること。
- **レジストリの合計カウントを忘れる**: レジストリにスキルを追加した後、上部の `total_skills` 番号もインクリメントする必要がある。これはPRでよく見逃される。
- **nameとtitleの混同**: `name` フィールドはディレクトリ名と一致するケバブケースでなければならない。`# Title` 見出しは人間が読めるもので異なることができる（例：name: `review-skill-format`、title: `# Review Skill Format`）。
- **lenientモードでのblockerのスキップ**: lenientモードでも、必須セクションとフロントマターフィールドの欠落はフラグを立てるべきである。lenientモードはスタイルとメタデータの推奨事項のみを緩和する。

## 関連スキル

- `create-skill` — 正規フォーマット仕様；有効なSKILL.mdがどのように見えるべきかの権威ある参照として使用する
- `update-skill-content` — フォーマット検証が通過した後、このスキルを使用してコンテンツ品質を向上させる
- `refactor-skill-structure` — スキルが行数チェックで失敗した場合、このスキルを使用して抽出・再構成する
- `review-pull-request` — スキルを追加または変更するPRをレビューする際に、PRレビューとフォーマット検証を組み合わせる
