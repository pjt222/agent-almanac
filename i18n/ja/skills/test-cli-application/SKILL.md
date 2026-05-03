---
name: test-cli-application
description: >
  Write integration tests for a Node.js CLI application using the built-in
  node:test module. Covers the exec helper pattern, output assertions,
  filesystem state verification, cleanup hooks, JSON output parsing, error
  case testing, and state restoration after destructive tests. Use when
  adding tests to an existing CLI, testing a new command, verifying adapter
  behavior across frameworks, or setting up CI for a CLI tool.
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
    - testing
    - nodejs
    - node-test
    - integration
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Test a CLI Application

組込 `node:test` モジュールと `execSync` を使って Node.js CLI 用の統合テストを書く。

## 使用タイミング

- 既存 CLI アプリケーションへのテスト追加
- 新しく作成されたコマンドのテスト
- ターゲットフレームワーク間のアダプタ/プラグイン挙動の検証
- CLI 正確性を検証する CI のセットアップ
- CLI 内部リファクタリング後のリグレッション捕捉

## 入力

- **必須**: CLI エントリポイントへのパス（例: `cli/index.js`）
- **必須**: テストするコマンド
- **任意**: テストするフレームワークアダプタ（dry-run モード）
- **任意**: クリーンアップ要件（テストで作成されるファイル/symlink）

## 手順

### ステップ1: テストインフラをセットアップする

```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

const CLI = 'node cli/index.js';
const ROOT = process.cwd();

function run(args) {
  return execSync(`${CLI} ${args}`, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 10000,
  });
}
```

主要設計判断:
- `node:test` は組込 — テストランナー依存不要
- `execSync` は CLI をサブプロセスとして実行 — 内部関数ではなく実バイナリをテスト
- 10 秒タイムアウトが対話プロンプトでのハングを防ぐ
- `encoding: 'utf8'` が regex マッチング用に文字列出力を与える
- 再現性のためすべてのパスは `ROOT` 相対

**期待結果：** `node:test` からインポートし動く `run()` ヘルパーを持つテストファイル。

**失敗時：** `node:test` が利用不能なら、Node.js バージョンが 18 未満。アップグレードまたはポリフィルを使う。

### ステップ2: スモークテストを書く

スモークテストは CLI が起動し、引数を解析し、期待される出力形を生むことを検証する:

```javascript
describe('meta', () => {
  it('shows version', () => {
    const out = run('--version');
    assert.match(out, /\d+\.\d+\.\d+/);
  });

  it('shows help with all commands', () => {
    const out = run('--help');
    assert.match(out, /install/);
    assert.match(out, /list/);
    assert.match(out, /detect/);
  });
});

describe('registry', () => {
  it('list shows expected counts', () => {
    const out = run('list --domains');
    assert.match(out, /\d+ domains/);
  });

  it('search finds known items', () => {
    const out = run('search "docker"');
    assert.match(out, /result\(s\) for "docker"/);
  });

  it('search returns 0 for nonsense', () => {
    const out = run('search "xyzzy-nonexistent"');
    assert.match(out, /0 result/);
  });
});
```

スモークテストパターン:
- `--version` と `--help` は常に動く
- レジストリロードがデータ整合性を検証
- 既知と未知の用語での検索

**期待結果：** スモークテストが CLI が機能しデータがロードされていることを確認。

**失敗時：** レジストリカウントが頻繁に変わるなら、ハードコードされた数の代わりに `\d+` を使う。

### ステップ3: ライフサイクルテストを書く

ライフサイクルテストは create → verify → delete シーケンスをクリーンアップと共に検証する:

```javascript
describe('install', () => {
  const testPath = resolve(ROOT, '.agents/skills/commit-changes');

  after(() => {
    // Always clean up, even if tests fail
    try { rmSync(testPath); } catch {}
    try { rmSync(resolve(ROOT, '.agents/skills'), { recursive: true }); } catch {}
    try { rmSync(resolve(ROOT, '.agents'), { recursive: true }); } catch {}
  });

  it('dry-run does not create files', () => {
    const out = run('install commit-changes --dry-run');
    assert.match(out, /DRY RUN/);
    assert.ok(!existsSync(testPath));
  });

  it('installs creates the target', () => {
    run('install commit-changes');
    assert.ok(existsSync(testPath));
  });

  it('skips already installed', () => {
    const out = run('install commit-changes');
    assert.match(out, /skipped/);
  });

  it('uninstall removes the target', () => {
    run('uninstall commit-changes');
    assert.ok(!existsSync(testPath));
  });
});
```

クリーンアップルール:
- `afterEach()` ではなく `after()` フックを使う — ライフサイクルテストは互いに構築する
- クリーンアップを `try/catch` で囲む — クリーンアップはテストスイートを失敗させてはならない
- 葉から根へクリーン（ファイル → 親ディレクトリ → 祖父ディレクトリ）
- テストが共有状態（symlink、設定ファイル）を変更したら、復元する

**期待結果：** テストが describe ブロック内で順次実行、失敗時もクリーンアップが実行される。

**失敗時：** テストが並列実行（node:test では非既定）したら、`{ concurrency: 1 }` で順次を強制する。

### ステップ4: 各アダプタの dry-run テストを書く

変更を加えずに各アダプタのターゲットパスをテストする:

```javascript
describe('adapter: cursor (dry-run)', () => {
  it('targets .cursor/skills/ path', () => {
    const out = run('install commit-changes --framework cursor --dry-run');
    assert.match(out, /\.cursor\/skills/i);
  });
});

describe('adapter: copilot (dry-run)', () => {
  it('targets .github/ path', () => {
    const out = run('install commit-changes --framework copilot --dry-run');
    assert.match(out, /\.github/i);
  });
});
```

このパターンは任意の数のアダプタにスケールする。各テスト:
- 自動検出を迂回するため `--framework` を使う
- ファイルが作成されないよう `--dry-run` を使う
- ターゲットパスが出力に現れることをアサート

**期待結果：** アダプタ毎に 1 つの describe ブロック、各々が少なくともパスアサーションを持つ。

**失敗時：** プロジェクトにアダプタが存在しなければ、テストは "Unknown framework" で失敗する。これは正しい — アダプタテストは実装されたアダプタに対してのみ存在すべき。

### ステップ5: エラーケーステストを書く

```javascript
describe('errors', () => {
  it('rejects unknown items', () => {
    assert.throws(
      () => run('install nonexistent-skill-xyz'),
      /No matching items|Unknown/,
    );
  });

  it('rejects unknown framework', () => {
    assert.throws(
      () => run('install commit-changes --framework nonexistent'),
      /Unknown framework/,
    );
  });

  it('handles missing state gracefully', () => {
    assert.throws(
      () => run('scatter nonexistent-team'),
      /not burning|Unknown/,
    );
  });
});
```

エラーテストパターン:
- `assert.throws` が `execSync` からの非ゼロ終了コードを捕える
- エラーメッセージ（stderr から取得）に regex マッチ
- 「アイテムが見つからない」と「無効オプション」エラーの両方をテスト
- エラーメッセージが是正措置を提案することを検証

**期待結果：** すべてのエラーパスが非ゼロ終了コードと助けになるメッセージを生む。

**失敗時：** `execSync` は非ゼロ終了で投げる。エラーの `stderr` または `stdout` がメッセージを含む。`assert.throws` regex がマッチしなければ `error.stdout` を確認する。

### ステップ6: JSON 出力テストを書く

```javascript
describe('json output', () => {
  it('campfire --json outputs valid JSON', () => {
    const out = run('campfire --json');
    const data = JSON.parse(out);
    assert.ok(typeof data.totalTeams === 'number');
    assert.ok(Array.isArray(data.fires));
  });

  it('gather --dry-run --json outputs structured data', () => {
    const out = run('gather tending --dry-run --json');
    // JSON may follow a DRY RUN header — extract from first '{'
    const jsonStart = out.indexOf('{');
    assert.ok(jsonStart >= 0, 'Should contain JSON');
    const data = JSON.parse(out.slice(jsonStart));
    assert.equal(data.team, 'tending');
  });
});
```

JSON テスト落とし穴:
- 一部のコマンドは JSON を人間可読テキスト（例: DRY RUN ヘッダ）でプレフィックスする
- 最初の `{` 文字を見つけて JSON を抽出
- 構造（キーの存在、型）を検証、正確な値ではなく
- カウントなどの値はコンテンツが追加されると変わるかもしれない

**期待結果：** JSON 出力が解析可能で期待されたキーを含む。

**失敗時：** `JSON.parse` が失敗したら、コマンドが人間テキストと JSON を混ぜているかもしれない。コマンドを修正して `--json` モードで純粋 JSON を出力するか、JSON サブストリングを抽出する。

### ステップ7: クリーンアップと状態復元を扱う

```javascript
describe('stateful commands', () => {
  const stateDir = resolve(ROOT, '.agent-almanac');

  after(() => {
    // Remove state file created by tests
    try { rmSync(stateDir, { recursive: true }); } catch {}
  });

  // Tests that create/modify state...
});

// Restore symlinks that destructive tests may remove
describe('destructive tests', () => {
  after(() => {
    // Restore symlinks that scatter/uninstall removed
    const skills = ['heal', 'meditate', 'remote-viewing'];
    for (const skill of skills) {
      const link = resolve(ROOT, `.claude/skills/${skill}`);
      if (!existsSync(link)) {
        try {
          execSync(`ln -s ../../skills/${skill} ${link}`, { cwd: ROOT });
        } catch {}
      }
    }
  });
});
```

状態復元ルール:
- 状態ファイル（`.agent-almanac/state.json`）はテスト後にクリーンされなければならない
- `scatter`/`uninstall` で除去された symlink は復元されなければならない
- `init` で作成されたマニフェストファイル（`agent-almanac.yml`）は除去されなければならない
- 順序: `after()` フックは宣言の逆順で実行 — 復元フックを最後に宣言する

**期待結果：** テストスイートはプロジェクトを見つけたのと同じ状態で残す。

**失敗時：** CI がテスト実行後に残ったファイルを報告したら、クリーンアップを `after()` に加える。漏れた状態を検出するためテスト実行後に `git status` を使う。

## バリデーション

- [ ] テストファイルが `node --test cli/test/cli.test.js` で実行する
- [ ] すべてのテストがパス（0 失敗）
- [ ] スモークテストが `--version`、`--help`、レジストリロードをカバー
- [ ] ライフサイクルテストがクリーンアップ付きで create → verify → delete を検証
- [ ] 実装されたアダプタ毎に少なくとも 1 つの dry-run テストが存在
- [ ] エラーケースがメッセージマッチで非ゼロ終了コードをテスト
- [ ] JSON 出力テストが実出力（モックではない）を解析
- [ ] After フックがテストで変更されたすべての状態を復元

## よくある落とし穴

- **壊れるハードコードされたカウント**: レジストリ合計はコンテンツ追加で変わる。`329 skills` をアサートする代わりに `\d+` regex を使うかカウントを動的に読む。
- **実行順序に依存するテスト**: `node:test` は既定で宣言順にスイートを実行するが、スイート内のテストは順序通りでないかもしれない。順序を保証するため単一 `describe` 内のライフサイクルスイート（create → verify → delete）を使う。
- **テスト失敗時のクリーンアップ欠落**: テストがライフサイクル中に失敗しても、`after()` はなお実行する。しかし `before()` で投げると、後続テストと `after()` は実行しないかもしれない。`before()` を最小に保つ。
- **対話プロンプトがテストをハング**: 確認プロンプトを持つコマンドは `execSync` をハングする。`echo y |` をパイプするか、テストで常に `--yes` を渡すようにする。
- **CI で実インストールでテスト**: `.claude/skills/` または `.agents/skills/` でファイルを作成するテストは作業ツリーを変更する。CI は "dirty working directory" チェックで失敗するかもしれない。常にクリーンアップする。

## 関連スキル

- `scaffold-cli-command` — これらのテストが検証するコマンドを構築
- `build-cli-plugin` — ステップ4 でテストされるアダプタを構築
- `design-cli-output` — テストがアサートする出力パターン
