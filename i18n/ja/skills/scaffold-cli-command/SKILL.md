---
name: scaffold-cli-command
description: >
  Scaffold a new CLI command using Commander.js with options, action handler,
  three output modes (human-readable, quiet, JSON), and optional ceremony
  variant. Covers command naming, option design, shared context patterns,
  error handling, and integration testing. Use when adding a command to an
  existing Commander.js CLI, designing a new CLI tool from scratch, or
  standardizing command structure across a multi-command CLI.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: intermediate
  language: TypeScript
  tags:
    - cli
    - commander
    - nodejs
    - terminal
    - command-pattern
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Scaffold a CLI Command

一貫したオプション処理、3 出力モード、統合テスト付きで Commander.js CLI アプリケーションに新しいコマンドを加える。

## 使用タイミング

- 既存 Commander.js CLI に新コマンドを加える
- ゼロからマルチコマンド CLI ツールを設計
- すべてのコマンドが同じパターンに従うようコマンド構造を標準化
- マシン出力を温かい物語出力に置き換える「セレモニー」バリアントを加える

## 入力

- **必須**: コマンド名と動詞（例: `gather`、`audit`、`sync`）
- **必須**: コマンドが何をするか（一文）
- **必須**: CLI エントリポイントへのパス（例: `cli/index.js`）
- **任意**: コマンドがセレモニーバリアント（温かい物語出力）を必要とするか
- **任意**: 標準セットを超えるカスタムオプション
- **任意**: サブコマンド引数（`<name>` または `[names...]` のような位置引数）

## 手順

### ステップ1: コマンド名とカテゴリを選ぶ

コマンドの行動を伝える動詞を選ぶ。コマンドをカテゴリにグループ化する:

| Category | Verbs | Pattern |
|----------|-------|---------|
| CRUD | `install`, `uninstall`, `list`, `search` | Operates on content |
| Lifecycle | `init`, `sync`, `audit` | Manages project state |
| Ceremony | `gather`, `scatter`, `tend`, `campfire` | Warm narrative output |

命名慣習:
- 単一動詞を使う（`install-skill` ではなく — 何かはオプションに指定させる）
- 小文字を使い、コマンド名自体にハイフンなし
- 位置引数: `<required>` または `[optional]` または `[variadic...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

**期待結果：** コマンド名、説明、位置引数が定義された。

**失敗時：** 動詞が既存コマンドと重複するなら、組み合わせる（既存コマンドにオプションを加える）か説明で明確に区別する。

### ステップ2: オプションを定義する

すべてのコマンドは標準共有オプションセットとコマンド固有のものをサポートすべき。

**標準オプション**（必要に応じて含める）:

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**コマンド固有オプション** — コマンドに必要なものだけ加える:

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

設計ルール:
- 頻繁に使われるオプションには短いフラグ（`-n`）
- 明確さには長いフラグ（`--dry-run`）
- 適切な場所に第 3 引数として既定値
- トグルにはブール値フラグ（引数なし）

**期待結果：** 標準とカスタムオプション両方を持つ完全なオプションチェーン。

**失敗時：** あまりに多くのオプションが蓄積（>8）したら、サブコマンドに分割するか関連オプションをグループ化することを検討する。

### ステップ3: アクションハンドラを実装する

アクションハンドラは一貫したパターンに従う:

```javascript
.action(async (name, options) => {
  // 1. Get shared context (registries, adapters, paths)
  const ctx = getContext(options);

  // 2. Resolve what to operate on
  const items = resolveItems(ctx, name, options);
  if (!items || items.length === 0) {
    reporter.error('Nothing found.');
    process.exit(1);
  }

  // 3. Preview if dry-run
  if (options.dryRun) reporter.printDryRun();

  // 4. Execute the operation
  const results = await executeOperation(items, ctx, options);

  // 5. Output results (3 modes)
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else if (options.quiet) {
    reporter.printResults(results);
  } else {
    printHumanOutput(results, options);
  }
})
```

`getContext()` 共有ヘルパーが集約する:
- ルートディレクトリ検出
- レジストリロード
- フレームワーク検出または明示的選択
- スコープ解決

**期待結果：** 5 ステップパターンに従うアクションハンドラ: context → resolve → preview → execute → output。

**失敗時：** コマンドが resolve-then-execute パターンに合わない（例: `detect` のように純粋に情報的）なら、簡略化: context → compute → output。

### ステップ4: 3 つの出力モードを加える

すべてのコマンドは 3 出力モードをサポートすべき:

**Default (human-readable):**
```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**Quiet (`--quiet`):**
標準レポーター出力 — ステータスアイコン（`+`、`-`、`=`、`!`）付きの簡潔な行、セレモニーなし、装飾なし。

**JSON (`--json`):**
```json
{
  "command": "install",
  "items": 3,
  "installed": 2,
  "skipped": 1,
  "failed": 0
}
```

実装パターン:

```javascript
if (options.json) {
  console.log(JSON.stringify(data, null, 2));
  return;
}
if (options.quiet) {
  reporter.printResults(results);
  return;
}
// Default: human-readable output
printHumanReadable(results, options);
```

**期待結果：** 3 モードすべてが有用な出力を生む。JSON は解析可能。Quiet は簡潔。Default は情報的。

**失敗時：** コマンドに意味のある JSON 表現がない（例: `detect`）なら、JSON モードをスキップして理由を文書化する。

### ステップ5: セレモニーバリアントを加える（任意）

トランザクション報告ではなく温かい物語出力から利益を受けるコマンドのため:

```javascript
if (options.json) {
  ceremonyReporter.printJson(data);
} else if (options.quiet) {
  reporter.printResults(results);
} else {
  ceremonyReporter.printArrival({
    teamId: name,
    agents,
    results: { installed, skipped, failed },
    ceremonial: options.ceremonial || false,
  });
}
```

セレモニー出力はボイスルールに従う:
1. 現在形、能動態（「mystic arrives」、「mystic was installed」ではなく）
2. 感嘆符なし
3. メタファーで専門用語を置換（「practices」、「dependencies」ではなく）
4. 失敗は正直に、破滅的にではなく（「a spark was lost」）
5. 終わりの行が状態を反映（「The fire burns.」）
6. 絵文字なし — Unicode グリフを使う（✦ ◉ ◎ ○ ✗）
7. すべての単語が情報を運ばねばならない

詳細なターミナル出力パターンは `design-cli-output` スキルを参照。

**期待結果：** すべてのボイスルールに従い温かく情報的な物語を生むセレモニー出力。

**失敗時：** セレモニー出力が強制に感じる、または標準出力を超えて情報を加えないなら、スキップする。すべてのコマンドがセレモニーバリアントを必要とするわけではない。

### ステップ6: エラーとエッジケースを扱う

```javascript
// Unknown item
if (!item) {
  reporter.error(`Unknown: ${name}. Use 'tool list' to browse.`);
  process.exit(1);
}

// Confirmation for destructive actions
if (!options.yes && !options.quiet && !options.dryRun) {
  const answer = await askYesNo('Proceed?');
  if (!answer) {
    console.log('  Cancelled.');
    return;
  }
}

// State validation
if (!state.fires[name]) {
  reporter.error(`Not active. Nothing to remove.`);
  process.exit(1);
}
```

エラー設計原則:
- エラーメッセージは是正措置を提案する
- 回復不能エラーには `process.exit(1)`
- 破壊的操作には確認プロンプト（`--yes` で迂回）
- Dry-run は常に成功する（決して確認でブロックしない）

**期待結果：** すべてのエラーパスが助けになるメッセージを生む。破壊的操作は確認を要求する。

**失敗時：** 確認プロンプトがスクリプトに干渉するなら、`--yes` と `--quiet` の両方が迂回することを保証する。

### ステップ7: 統合テストを書く

```javascript
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';

const CLI = 'node cli/index.js';
function run(args) {
  return execSync(`${CLI} ${args}`, { encoding: 'utf8', timeout: 10000 });
}

describe('new-command', () => {
  after(() => { /* cleanup created files/state */ });

  it('dry-run shows preview', () => {
    const out = run('new-command arg --dry-run');
    assert.match(out, /DRY RUN/);
  });

  it('--json outputs valid JSON', () => {
    const out = run('new-command arg --json');
    const start = out.indexOf('{');
    const data = JSON.parse(out.slice(start));
    assert.equal(data.command, 'new-command');
  });

  it('rejects unknown input', () => {
    assert.throws(() => run('new-command nonexistent'), /Unknown/);
  });
});
```

包括的な CLI テストパターンは `test-cli-application` スキルを参照。

**期待結果：** 少なくとも 3 テスト: dry-run、JSON 出力、エラーケース。複雑コマンドにはより多く。

**失敗時：** `execSync` がタイムアウトしたら、タイムアウトを増やすかコマンドをブロックする対話プロンプトを確認する。

## バリデーション

- [ ] コマンドが CLI エントリポイントに登録され `--help` に現れる
- [ ] 標準オプション（`--dry-run`、`--quiet`、`--json`）が正しく動く
- [ ] Default 出力が人間可読で情報的
- [ ] JSON 出力が有効で解析可能
- [ ] エラーメッセージが是正措置を提案する
- [ ] 破壊的操作が確認を要求（`--yes` で迂回）
- [ ] 少なくとも 3 統合テストがパス
- [ ] コマンドが getContext → resolve → execute → output パターンに従う

## よくある落とし穴

- **JSON モードを忘れる**: マシン消費者（スクリプト、CI）は構造化出力に依存する。コマンドが対話のみに見えても常に `--json` を実装する。
- **確認プロンプトがスクリプトをブロック**: 入力をプロンプトする任意のコマンドは非対話文脈でハングする。破壊的コマンドには常に `--yes` を提供し `--quiet` がプロンプトを抑制することを保証する。
- **不一致なエラー終了コード**: すべてのエラーに `process.exit(1)` を使う。CLI 出力を解析するツールはまず終了コードを確認する。
- **既定なしのオプション**: `--scope` のようなオプションはユーザーが毎回指定する必要がないよう合理的な既定を持つべき。
- **quiet モードへのセレモニーリーク**: `--quiet` フラグは「マシン用の最小出力」を意味する。セレモニーテキストが quiet モードに漏れたら、スクリプトは予期しない出力で壊れる。

## 関連スキル

- `build-cli-plugin` — コマンドが操作するアダプタ/プラグインを構築
- `test-cli-application` — ステップ7 の基本を超える包括的 CLI テストパターン
- `design-cli-output` — すべての冗長度レベルのターミナル出力設計
- `install-almanac-content` — よく構造化された CLI コマンドスキルの例
