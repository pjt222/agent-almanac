---
name: refactor-skill-structure
description: >
  長すぎるまたは構造が悪いSKILL.mdを、例をreferences/EXAMPLES.mdに抽出し、
  複合的な手順を分割し、プログレッシブディスクロージャーのためにセクションを
  再構成することでリファクタリングする。スキルが500行のCI制限を超えた場合、
  コードブロックがスキル本文を占領している場合、手順ステップに複数の無関係な
  操作が含まれている場合、またはコンテンツ更新で行数制限を超えた後に使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: advanced
  language: multi
  tags: review, skills, refactoring, structure, progressive-disclosure
---

# Refactor Skill Structure

500行制限を超えた、または構造的な問題が生じたSKILL.mdをリファクタリングする。このスキルは拡張されたコード例を `references/EXAMPLES.md` に抽出し、複合的な手順を焦点を絞ったサブ手順に分割し、プログレッシブディスクロージャーのためにクロスリファレンスを追加し、再構成後もスキルが完全で有効であることを確認する。

## 使用タイミング

- CIで強制される500行制限をスキルが超えた場合
- 単一の手順ステップに別々のステップに分割すべき複数の無関係な操作が含まれている場合
- 15行より長いコードブロックがSKILL.mdを占領しており、抽出できる場合
- スキルが標準的な6セクション構造を壊すアドホックなセクションを蓄積した場合
- コンテンツ更新が行数制限を超えた後
- スキルレビューでコンテンツ品質を超えた構造的な問題が指摘された場合

## 入力

- **必須**: リファクタリングするSKILL.mdファイルへのパス
- **任意**: 目標行数（デフォルト：500行制限の80%を目指す、つまり〜400行）
- **任意**: `references/EXAMPLES.md` を作成するかどうか（デフォルト：yes、抽出可能なコンテンツがある場合）
- **任意**: 複数のスキルに分割するかどうか（デフォルト：no、まず抽出を優先）

## 手順

### ステップ1: 現在の行数の計測と肥大化ソースの特定

スキルを読み、セクションごとの行数バジェットを作成して肥大化の場所を特定する。

```bash
# Total line count
wc -l < skills/<skill-name>/SKILL.md

# Line count per section (approximate)
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

肥大化ソースの分類：
- **抽出可能**: 15行超のコードブロック、完全な設定例、複数バリアントの例
- **分割可能**: 2つ以上の無関係な操作を行う複合的な手順ステップ
- **削減可能**: 冗長な説明、過度に詳細なコンテキスト文
- **構造的**: 標準的な6セクション構造に含まれないアドホックなセクション

**期待結果：** どのセクションが過大サイズで、どの肥大化カテゴリが各セクションに適用されるかを示す行数バジェット。最大のセクションが主なリファクタリング対象である。

**失敗時：** スキルが500行未満で構造的な問題がない場合、このスキルは不要かもしれない。続行する前にリファクタリングの要求が正当化されているか確認する。

### ステップ2: コードブロックをreferences/EXAMPLES.mdに抽出する

15行より長いコードブロックを `references/EXAMPLES.md` ファイルに移動し、簡潔なインラインスニペット（3〜10行）をメインSKILL.mdに残す。

1. referencesディレクトリを作成する：
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. 抽出可能な各コードブロックについて：
   - 完全なコードブロックを説明的な見出しの下に `references/EXAMPLES.md` にコピーする
   - SKILL.md内のコードブロックを3〜5行の簡潔なスニペットに置き換える
   - クロスリファレンスを追加する：`See [EXAMPLES.md](references/EXAMPLES.md#heading) for the complete configuration.`

3. `references/EXAMPLES.md` を明確な見出しで構成する：
   ```markdown
   # Examples

   ## Example 1: Full Configuration

   Complete configuration file for [context]:

   \```yaml
   # ... full config here ...
   \```

   ## Example 2: Multi-Variant Setup

   ### Variant A: Development
   \```yaml
   # ... dev config ...
   \```

   ### Variant B: Production
   \```yaml
   # ... prod config ...
   \```
   ```

**期待結果：** 15行超のすべてのコードブロックが抽出されている。メインSKILL.mdは可読性のための簡潔なインラインスニペットを保持している。クロスリファレンスが抽出されたコンテンツにリンクしている。`references/EXAMPLES.md` が説明的な見出しで整理されている。

**失敗時：** コードブロックの抽出で行数が十分に削減されない場合（依然として500行超）は、手順の分割についてステップ3に進む。スキルにコードブロックがほとんどない場合（例：自然言語スキル）は、代わりにステップ3と4に集中する。

### ステップ3: 複合的な手順を焦点を絞ったステップに分割する

複数の無関係な操作を実行している手順ステップを特定し、分割する。

複合ステップのサイン：
- ステップのタイトルに「and」が含まれている（例：「Configure Database and Set Up Caching」）
- ステップに複数のExpected/On failureブロックがある（またはあるべき）
- ステップが30行より長い
- ステップの一部が異なる順序でスキップまたは実行できる

各複合ステップについて：
1. ステップ内の個別の操作を特定する
2. 各操作に新しい `### Step N:` を作成する
3. 後続のステップを番号付けし直す
4. 各新しいステップに独自のExpectedとOn failureブロックを確保する
5. 新しいステップ間にトランジションコンテキストを追加する

**期待結果：** 各手順ステップが1つのことを実行する。どのステップも30行を超えない。ステップ数が増えるかもしれないが、各ステップが独立して検証可能である。

**失敗時：** ステップを分割すると細かすぎるステップになる場合（例：20以上の合計ステップ）は、関連するマイクロステップを番号付きサブステップを持つ単一のステップにグループ化することを検討する。スイートスポットは5〜12の手順ステップである。

### ステップ4: SKILL.mdから抽出されたコンテンツへのクロスリファレンスを追加する

抽出後もメインSKILL.mdが可読でディスカバラブルであることを確保する。

各抽出について：
1. SKILL.md内のインラインスニペットは一般的なケースで自己完結していること
2. クロスリファレンスはどのような追加コンテンツが利用可能かを説明すること
3. 相対パスを使用する：`[EXAMPLES.md](references/EXAMPLES.md#section-anchor)`

クロスリファレンスパターン：
- 簡潔なコードスニペットの後：`See [EXAMPLES.md](references/EXAMPLES.md#full-configuration) for the complete configuration with all options.`
- 複数バリアントの例：`See [EXAMPLES.md](references/EXAMPLES.md#variants) for development, staging, and production variants.`
- 拡張されたトラブルシューティング：`See [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) for additional error scenarios.`

**期待結果：** すべての抽出に対応するクロスリファレンスがある。読者はメインSKILL.mdで一般的なケースを辿り、詳細についてはreferencesを深掘りできる。

**失敗時：** クロスリファレンスがテキストの流れを不自然にする場合は、複数のリファレンスを手順ステップの末尾の1つの注記にまとめる：`For extended examples including [X], [Y], and [Z], see [EXAMPLES.md](references/EXAMPLES.md).`

### ステップ5: リファクタリング後の行数の確認

すべての変更後にSKILL.mdの行数を再計測する。

```bash
# Check main SKILL.md
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "SKILL.md: OK ($lines lines)" || echo "SKILL.md: STILL OVER ($lines lines)"

# Check references file if created
if [ -f skills/<skill-name>/references/EXAMPLES.md ]; then
  ref_lines=$(wc -l < skills/<skill-name>/references/EXAMPLES.md)
  echo "EXAMPLES.md: $ref_lines lines"
fi

# Total content
echo "Total content: $((lines + ${ref_lines:-0})) lines"
```

**期待結果：** SKILL.mdが500行以下である。将来の成長のスペースを残すために理想的には400行以下。`references/EXAMPLES.md` には行数制限がない。

**失敗時：** 抽出と分割後も500行を超える場合は、スキルを2つの別々のスキルに分解すべきか検討する。多くをカバーしているスキルはスコープクリープのサインである。2番目のスキルを作成するために `create-skill` を使用し、両方のRelated Skillsクロスリファレンスを更新する。

### ステップ6: すべてのセクションがまだ存在するかの検証

リファクタリング後に、スキルがまだ必須セクションをすべて持ちフロントマターが完全であることを確認する。

`review-skill-format` チェックリストを実行する：
1. YAMLフロントマターが正しく解析される
2. 6つの必須セクションがすべて存在する（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
3. すべての手順ステップにExpectedとOn failureブロックがある
4. 孤立したクロスリファレンスがない（すべてのリンクが解決される）

```bash
# Quick section check
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

**期待結果：** すべてのセクションが存在する。抽出中にコンテンツが誤って削除されていない。SKILL.md内のクロスリファレンスがEXAMPLES.mdの実際の見出しに解決される。

**失敗時：** セクションが誤って削除された場合は、gitの履歴から復元する：`git diff skills/<skill-name>/SKILL.md` で何が変更されたか確認する。クロスリファレンスが壊れている場合は、EXAMPLES.md内の見出しアンカーがSKILL.md内のリンクと一致していることを確認する（GitHub Flavored Markdownアンカールール：小文字、スペースはハイフン、句読点を除去）。

## バリデーション

- [ ] SKILL.mdの行数が500以下である
- [ ] SKILL.md内のすべてのコードブロックが15行以下である
- [ ] 抽出されたコンテンツが説明的な見出しを持つ `references/EXAMPLES.md` にある
- [ ] すべての抽出にメインSKILL.mdのクロスリファレンスがある
- [ ] 複合的な手順ステップが残っていない（各ステップが1つのことを行う）
- [ ] リファクタリング後に6つの必須セクションがすべて存在する
- [ ] すべての手順ステップが **Expected:** と **On failure:** ブロックを持っている
- [ ] YAMLフロントマターが完全で解析可能である
- [ ] クロスリファレンスリンクがEXAMPLES.mdの実際の見出しに解決される
- [ ] リファクタリングされたスキルで `review-skill-format` 検証が通過する

## よくある落とし穴

- **過度な積極的抽出**: すべてのコードをreferencesに移動するとメインSKILL.mdが読めなくなる。一般的なケースのために3〜10行のスニペットをインラインに保つ。15行超のブロックまたは複数バリアントを示すブロックのみを抽出する。
- **壊れたアンカーリンク**: GitHub Flavored Markdownのアンカーは一部のレンダラーでは大文字小文字が区別される。EXAMPLES.mdでは小文字の見出しを使用し、クロスリファレンスで正確に一致させる。`grep -c "heading-text" references/EXAMPLES.md` でテストする。
- **分割時のExpected/On failureの喪失**: 複合ステップを分割する際は、各新しいステップが独自のExpectedとOn failureブロックを取得することを確保する。分割後に1つのステップがこれらのブロックなしになりやすい。
- **小さすぎるステップの作りすぎ**: 分割は5〜12の手順ステップを生成するべきである。15以上になった場合は、分割しすぎである。関連するマイクロステップを論理的なグループに戻してマージする。
- **references/EXAMPLES.mdの見出しの更新を忘れる**: EXAMPLES.mdのセクションを名前変更した場合は、SKILL.md内のすべてのクロスリファレンスアンカーを更新する必要がある。古いアンカー名をgrepして参照をすべて捕捉する。

## 関連スキル

- `review-skill-format` — リファクタリング後にフォーマット検証を実行してスキルがまだ準拠しているか確認する
- `update-skill-content` — コンテンツ更新はスキルを行数制限を超えた場合に構造的リファクタリングのトリガーになることが多い
- `create-skill` — 抽出されたコンテンツの整理方法を決定する際に正規構造を参照する
- `evolve-skill` — スキルを2つの別々のスキルに分割する必要がある場合は、進化を使用して派生スキルを作成する
