---
name: design-cli-output
description: >
  Design terminal output for a CLI tool with chalk colors, Unicode glyphs,
  multiple verbosity levels (human, verbose, quiet, JSON), and consistent
  voice rules. Covers color palette selection, status indicator design,
  reporter function architecture, ceremony/narrative output variants, and
  cross-terminal compatibility. Use when building a new CLI reporter module,
  adding warm narrative output to an existing tool, standardizing output
  across multiple commands, or designing machine-readable JSON alongside
  human-readable text.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: basic
  language: TypeScript
  tags:
    - cli
    - terminal
    - ux
    - chalk
    - unicode
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Design CLI Output

コマンドラインツールのために、一貫したマルチレベルのターミナル出力を設計する。

## 使用タイミング

- CLI ツール用の新しいレポーターモジュールを構築するとき
- 標準的なトランザクション出力に加えて温かい・物語的な出力を追加するとき
- 複数コマンドにわたって出力フォーマットを標準化するとき
- 人間可読出力と並行する JSON マシン出力を設計するとき
- 新しいターミナルツールのカラー、グリフ、冗長度レベルを選ぶとき

## 入力

- **必須**: CLI ツール名と主な対象（開発者、運用者、エンドユーザー）
- **必須**: 出力フォーマットが必要なコマンド
- **任意**: 「セレモニー」または物語出力バリアントが望まれるか
- **任意**: ブランディング制約（カラーパレット、トーン）

## 手順

### ステップ1: カラーパレットを定義する

chalk を使って名前付きパレットオブジェクトを作成する:

**標準パレット**（トランザクション出力）:

```javascript
let chalk;
try { chalk = (await import('chalk')).default; }
catch { chalk = new Proxy({}, { get: () => (s) => s }); }

// Status colors
const ok = chalk.green;       // success
const fail = chalk.red;       // errors
const warn = chalk.yellow;    // warnings
const info = chalk.cyan;      // identifiers, names
const dim = chalk.dim;        // secondary info, paths
const bold = chalk.bold;      // headers
```

**温かいパレット**（セレモニー/物語出力）:

```javascript
const C = {
  flame: chalk.hex('#FF6B35'),   // active elements, fire
  amber: chalk.hex('#FFB347'),   // arriving items, warm highlights
  spark: chalk.hex('#FFF4E0'),   // individual items (sparks/skills)
  ember: chalk.hex('#8B4513'),   // cold/dormant states
  warm:  chalk.hex('#D4A574'),   // neutral warm text
  dim:   chalk.dim,              // background, secondary
  fail:  chalk.red,              // errors stay red (honest)
};
```

パレット設計ルール:
- 常に no-color フォールバックを提供する（上記 Proxy パターン）
- カスタムパレットには hex カラーを使う（`chalk.hex('#FF6B35')`）
- パレットテーマに関係なく fail/error カラーは赤を保つ
- パレットエントリは見た目ではなく意味的役割で命名する

**期待結果：** 名前付きエントリと no-color フォールバックを持つパレットオブジェクト。

**失敗時：** chalk が利用不能なら（パイプ出力、CI）、Proxy フォールバックは文字列を変えずに返す。`NO_COLOR=1` 環境変数でテストする。

### ステップ2: ステータスインジケーターを選ぶ

ステータス通信のための Unicode グリフまたは ASCII 文字を選ぶ:

**ASCII**（最大互換性）:

```
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode**（より豊か、UTF-8 ターミナルが必要）:

```
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

選択基準:
- CI またはパイプ文脈で動くツールには ASCII
- インタラクティブなターミナルユーザーがいるツールには Unicode
- `--ascii` フラグまたは `NO_COLOR` 検出を介して両方を提供
- グリフをテスト: macOS Terminal、Windows Terminal、VS Code terminal、SSH セッション

**期待結果：** カラーだけに頼らずに一目でステータスを伝えるグリフセット。

**失敗時：** テストでグリフが `?` または箱として描画されたら、ASCII 等価物に置き換える。`+/-/=/!` セットはどこでも動く。

### ステップ3: 冗長度レベルを設計する

すべてのコマンドは 4 つの出力レベルをサポートすべき:

| Level | Flag | Audience | Content |
|-------|------|----------|---------|
| **Default** | (none) | Human at terminal | Formatted, colored, informative |
| **Verbose** | `--verbose` or `--ceremonial` | Human wanting detail | Per-item breakdown, arrival sequences |
| **Quiet** | `--quiet` | Scripts, CI | Minimal lines, status icons, no decoration |
| **JSON** | `--json` | Machine consumers | Structured, parseable, complete |

実装パターン:

```javascript
function output(data, options) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (options.quiet) {
    for (const item of data.items) {
      const icon = item.ok ? '+' : '!';
      console.log(`${icon} ${item.id}`);
    }
    return;
  }
  // Default (or verbose) human output
  printFormatted(data, { verbose: options.verbose });
}
```

JSON 出力ルール:
- 常に有効な JSON（人間テキストと混在させない）
- 人間出力が示すすべてのデータ + マシン有用フィールドを含む
- コマンド間で一貫したキー命名を使う
- 出力モードに関係なく、成功は終了コード 0、エラーは 1

**期待結果：** コマンド間で一貫した挙動を持つ 4 つの明確な出力レベル。

**失敗時：** verbose モードがうるさすぎるなら、段階的冗長度レベルではなくオプトイン（`--ceremonial`）にする。

### ステップ4: ボイスルールを確立する

すべての出力関数が従うべきトーンとスタイルを定義する。これがコマンド間の不整合を防ぐ。

ボイスルール例（campfire レポーターより）:

1. **現在形、能動態**: 「mystic arrives」、「mystic has been installed」ではなく
2. **感嘆符なし**: 静かな自信。ツールは叫ばない。
3. **メタファーで専門用語を置換**: 「practices」、「dependencies」ではなく（セレモニーモードのみ）
4. **失敗は正直に、破滅的にではなく**: 「A spark was lost」、「ERROR: installation failed with exit code 1」ではなく
5. **終わりの行が状態を反映**: すべての操作はステータス概要で終わる
6. **絵文字なし**: Unicode グリフは装飾的でなく視覚的重みを持つ
7. **すべての単語が情報を運ぶ**: 単語が理解を加えないなら、削除する

標準（非セレモニー）出力のボイスルール:
- 簡潔な事実の行
- ステータスアイコン + アイテム ID + 文脈
- カウント付き概要行
- エラーメッセージは是正措置を提案する

**期待結果：** 出力関数が従うべき 3-7 のボイスルールの書き起こしセット。

**失敗時：** ルールが恣意的に感じられるなら、テストする: 各ルールあり/なしで同じ出力を書く。ルールを除いても出力品質が変わらないなら、そのルールは不要。

### ステップ5: レポーター関数を実装する

焦点を絞った関数を持つレポーターモジュールに出力を整理する:

```javascript
// reporter.js — standard output
export function printResults(results) { ... }
export function printItemTable(items) { ... }
export function printDetections(detections) { ... }
export function printAudit(auditResults) { ... }
export function printDryRun() { ... }
export function warn(msg) { ... }
export function error(msg) { ... }
export { chalk };
```

各関数は同じ構造に従う:
1. 空/null 入力を優雅に扱う
2. レイアウトを計算（カラム幅、パディング）
3. パレット色で出力
4. 一番下に概要行

セレモニー出力には別モジュールを作る:

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**期待結果：** 独立して使えるレポーター関数 — 各々は呼び出し元状態に依存せず自身のフォーマットを扱う。

**失敗時：** 関数が ~50 行を超えて成長したらヘルパーを抽出する。レポーター関数は単独でレビューしやすくあるべき。

### ステップ6: 環境間で出力をテストする

異なる文脈で出力が正しく描画されることを検証する:

```bash
# With colors (interactive terminal)
node cli/index.js list --domains

# Without colors (piped)
node cli/index.js list --domains | cat

# With NO_COLOR environment variable
NO_COLOR=1 node cli/index.js list --domains

# JSON mode (parseable)
node cli/index.js campfire --json | jq .

# In CI (typically no TTY)
CI=true node cli/index.js audit
```

確認事項:
- インタラクティブモードでカラーが正しく表示される
- パイプ/リダイレクト出力に ANSI エスケープコードが漏れない
- JSON が有効（`jq .` にパイプして検証）
- ターゲットターミナルで Unicode グリフが描画される
- 内容幅が変動してもカラム整列が保たれる

**期待結果：** 5 つの文脈すべてで出力が正しい。

**失敗時：** ANSI コードが漏れたら chalk が `NO_COLOR` を尊重するか確認する。Unicode が壊れたら ASCII フォールバックモードを提供する。

## バリデーション

- [ ] カラーパレットに no-color フォールバックがある
- [ ] ステータスインジケーターがカラー・no-color 両モードで動く
- [ ] 4 つの冗長度レベルすべてが有用な出力を生む
- [ ] JSON 出力が有効で `jq` で解析可能
- [ ] ボイスルールが文書化され一貫して従われる
- [ ] レポーター関数が空/null 入力を優雅に扱う
- [ ] 出力をテスト: terminal、piped、NO_COLOR、CI

## よくある落とし穴

- **人間テキストと JSON を混ぜる**: `--json` モードでは有効 JSON のみを出力。一行でも混じる（「DRY RUN」など）と JSON パーサーが壊れる。コマンドが両方を表示しなければならないなら、明確に分離するか JSON モードで人間テキストを抑制する。
- **ハードコードされたカラム幅**: 内容長は変動する。`Math.max(...items.map(i => i.id.length))` を使ってパディングを動的に計算する。
- **意味のないカラー**: カラーが成功と失敗を区別する唯一の方法なら、色覚多様性ユーザーとパイプ出力は情報を失う。常にカラーをテキストインジケーター（`+`、`OK`、`ERR`）と組み合わせる。
- **誤った文脈でのセレモニー**: 温かい物語出力はインタラクティブターミナルセッションに適している。CI、スクリプト、`--quiet` モードではノイズになる。セレモニー出力は明示的フラグでゲートする。
- **概要行を忘れる**: ユーザーは最後の行を最初にスキャンする。すべての操作は一行の概要（成功/失敗/スキップのカウント）で終わるべき。

## 関連スキル

- `scaffold-cli-command` — この出力を使うコマンド
- `test-cli-application` — 出力が期待に一致することのテスト
- `build-cli-plugin` — プラグインはこの出力システムを通じて結果をレポートする
