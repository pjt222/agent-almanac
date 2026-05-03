---
name: build-cli-plugin
description: >
  Build a plugin or adapter for a CLI tool using the abstract base class
  pattern. Covers defining the contract (static fields, required methods),
  choosing an installation strategy (symlink, copy, append-to-file),
  implementing detection, install/uninstall with idempotency, listing,
  auditing, and registering the plugin. Use when adding support for a
  new framework to a CLI installer, building a plugin system for any
  multi-target tool, or extending an existing adapter architecture.
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
    - plugin
    - adapter
    - architecture
    - nodejs
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Build a CLI Plugin

抽象基底クラスパターンを使って、CLI ツールのプラグ可能なアーキテクチャに新しいプラグインまたはアダプタを追加する。

## 使用タイミング

- CLI インストーラに新しい対象フレームワークのサポートを追加するとき
- 複数ターゲットのコマンドラインツール用のプラグインシステムを構築するとき
- 既存のアダプタアーキテクチャを新しい戦略バリアントで拡張するとき
- 異なるファイルレイアウトを使うフレームワークへコンテンツ配信を移植するとき

## 入力

- **必須**: プラグインがサポートするフレームワークまたはターゲット（名前、設定パス、慣習）
- **必須**: 基底クラスまたはプラグイン契約のパス
- **必須**: インストール戦略: `symlink`、`copy`、`file-per-item`、`append-to-file` のいずれか
- **任意**: プラグインが扱うコンテンツタイプ（例: skills のみ、skills + agents、フルサポート）
- **任意**: スコープサポート（プロジェクトレベル、グローバル、両方）

## 手順

### ステップ1: 契約を定義する

基底クラスはすべてのプラグインが実装すべきインターフェースを確立する:

```javascript
export class FrameworkAdapter {
  static id = 'base';            // Unique identifier
  static displayName = 'Base';   // Human-readable name
  static strategy = 'symlink';   // Installation strategy
  static contentTypes = ['skill']; // What this adapter handles

  async detect(projectDir) { return false; }
  getTargetPath(projectDir, scope) { throw new Error('Not implemented'); }
  async install(item, projectDir, scope, options) { throw new Error('Not implemented'); }
  async uninstall(item, projectDir, scope, options) { throw new Error('Not implemented'); }
  async listInstalled(projectDir, scope) { return []; }
  async audit(projectDir, scope) { return { framework: this.constructor.displayName, ok: [], warnings: [], errors: [] }; }
  supports(contentType) { return this.constructor.contentTypes.includes(contentType); }
}
```

**静的フィールド** はプラグインの識別と能力を定義する:
- `id`: `--framework <id>` オプションと結果レポートで使われる
- `displayName`: 人間可読な出力で表示される
- `strategy`: コンテンツがターゲットへ届く方法を決定する
- `contentTypes`: このアダプタが受け取るアイテムをフィルタする

基底クラスがまだ存在しない場合、まずそれを作成する。このパターンは任意の数のプラグインへスケールする。

**期待結果：** 静的識別フィールドと抽象メソッドを持つ基底クラス。

**失敗時：** 基底クラスにすべてのプラグインに当てはまらないメソッドがある場合（例: すべてのフレームワークが `audit` をサポートするわけではない）、合理的な no-op を返すデフォルト実装を提供する。

### ステップ2: インストール戦略を選ぶ

| Strategy | When to use | Example |
|----------|------------|---------|
| **symlink** | Target reads source files directly. Cheapest, stays in sync. | Claude Code reads `.claude/skills/<name>/` symlinks |
| **copy** | Target needs files in its own directory. Modifications don't propagate. | Some IDEs index only their own dirs |
| **file-per-item** | Target expects one file per item with specific format. | Cursor `.mdc` rules files |
| **append-to-file** | Target reads a single instructions file. | Aider `CONVENTIONS.md`, Codex `AGENTS.md` |

戦略は実装の形を決める:
- **Symlink**: `symlinkSync(source, target)` — 相対パスと絶対パスを扱う
- **Copy**: `cpSync(source, target, { recursive: true })` — 上書きを扱う
- **File-per-item**: `writeFileSync(target, transform(content))` — フォーマット変換が必要かも
- **Append-to-file**: 冪等な挿入/置換/削除のためにマーカーで囲む

**期待結果：** 戦略が、対象フレームワークがコンテンツを発見する方法に基づく明確な根拠とともに選択される。

**失敗時：** 不確かな場合、フレームワークのドキュメントで設定や指示ファイルをどう発見するかを確認する。フレームワークが任意のディレクトリを読むなら symlink を既定とする。

### ステップ3: 検出を実装する

検出は CLI にプロジェクトに存在するフレームワークを伝える:

```javascript
// In detector.js — each rule checks for a filesystem marker
const RULES = [
  {
    id: 'my-framework',
    displayName: 'My Framework',
    check: (dir) => existsSync(resolve(dir, '.myframework/')),
    marker: '.myframework/',
    scope: 'project',
  },
];
```

検出戦略:
- **ディレクトリの存在**: `.claude/`、`.cursor/`、`.gemini/`
- **設定ファイル**: `opencode.json`、`.aider.conf.yml`
- **指示ファイル**: `AGENTS.md`、`CONVENTIONS.md`
- **グローバルマーカー**: `~/.openclaw/`、`~/.hermes/`

ユーザーがフレームワークが検出された理由を理解できるよう、検出結果に必ずマーカーを返す。

**期待結果：** フレームワークを偽陽性なく確実に特定する検出ルール。

**失敗時：** フレームワークに固有マーカーがない（汎用ディレクトリ名）場合、複数マーカーの組み合わせを使うか、明示的な `--framework` 指定を要求する。

### ステップ4: 冪等性を伴うインストールを実装する

```javascript
async install(item, projectDir, scope, options) {
  const targetDir = this.getTargetPath(projectDir, scope);
  const targetPath = resolve(targetDir, item.id);

  // Idempotency: skip if already installed (unless force)
  if (existsSync(targetPath) && !options.force) {
    return { action: 'skipped', path: targetPath };
  }

  if (options.dryRun) {
    return { action: 'created', path: targetPath, details: 'dry-run' };
  }

  // Ensure parent directory exists
  mkdirSync(targetDir, { recursive: true });

  // Strategy-specific installation
  if (this.constructor.strategy === 'symlink') {
    const relPath = relative(targetDir, item.sourceDir);
    symlinkSync(relPath, targetPath);
  } else if (this.constructor.strategy === 'copy') {
    cpSync(item.sourceDir, targetPath, { recursive: true });
  }

  return { action: 'created', path: targetPath };
}
```

冪等性ルール:
- ターゲットが存在し `--force` が設定されていなければ **スキップ**
- `--force` が設定されていれば **上書き**（先に削除してからインストール）
- **Dry-run** は常に `action: 'created'` で成功する
- **戻り値** は常に `{ action, path, details? }` でなければならない

**期待結果：** インストールがターゲットパスにコンテンツを作成し、既に存在すればスキップし、`--force` と `--dry-run` を尊重する。

**失敗時：** Windows/NTFS で symlink 作成が失敗する場合、ディレクトリジャンクションまたはコピーへフォールバックする。フォールバックをログに記録する。

### ステップ5: クリーンアップを伴うアンインストールを実装する

```javascript
async uninstall(item, projectDir, scope, options) {
  const targetDir = this.getTargetPath(projectDir, scope);
  const targetPath = resolve(targetDir, item.id);

  if (!existsSync(targetPath)) {
    return { action: 'skipped', path: targetPath };
  }

  if (options.dryRun) {
    return { action: 'removed', path: targetPath };
  }

  // Remove the installed content
  rmSync(targetPath, { recursive: true });

  return { action: 'removed', path: targetPath };
}
```

クリーンアップの考慮事項:
- プラグインがインストールしたものだけを削除する — ユーザー作成ファイルは決して削除しない
- append-to-file の場合: ファイル全体ではなくマーカー区間だけを削除する
- 親ディレクトリは残す（他プラグインが使うかもしれない）

**期待結果：** アンインストールがプラグインのコンテンツのみを削除し、それ以外は何も削除しない。

**失敗時：** 削除が失敗（権限、ロックファイル）する場合、例外を投げるのではなくエラー結果を返す。

### ステップ6: 一覧表示と監査を実装する

```javascript
async listInstalled(projectDir, scope) {
  const targetDir = this.getTargetPath(projectDir, scope);
  if (!existsSync(targetDir)) return [];

  const entries = readdirSync(targetDir);
  return entries.map(name => {
    const fullPath = resolve(targetDir, name);
    const broken = lstatSync(fullPath).isSymbolicLink()
      && !existsSync(fullPath);
    return { id: name, type: 'skill', broken };
  });
}

async audit(projectDir, scope) {
  const items = await this.listInstalled(projectDir, scope);
  const ok = items.filter(i => !i.broken);
  const broken = items.filter(i => i.broken);
  return {
    framework: this.constructor.displayName,
    ok: [`${ok.length} skills installed`],
    warnings: [],
    errors: broken.map(i => `Broken: ${i.id}`),
  };
}
```

**期待結果：** 一覧は壊れたリンク検出を伴ってインストール済みアイテムをすべて返す。監査は健全性を要約する。

**失敗時：** ターゲットディレクトリが存在しない場合、空の結果を返す（エラーではない — フレームワークに何もインストールされていないだけ）。

### ステップ7: プラグインを登録する

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

登録によりアダプタが利用可能になる:
- 自動検出（`detectFrameworks()` → `getAdaptersForDetections()`）
- 明示的選択（`--framework my-framework`）
- 一覧（`listAdapters()`）

**期待結果：** アダプタが `tool detect` 出力に現れ、`--framework` でターゲット指定できる。

**失敗時：** アダプタが現れない場合、`static id` が検出ルールの `id` と一致し、`register()` が呼ばれていることを確認する。

### ステップ8: テストを書く

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

最低限テストする内容: dry-run のパス、検出の存在、コンテンツタイプサポート。

**期待結果：** アダプタ固有のテストがインストールパスと挙動を確認する。

**失敗時：** CI でフレームワークが検出されない（マーカーディレクトリがない）場合、テストで `--framework` を明示的に使う。

## バリデーション

- [ ] プラグインが基底クラスを正しく拡張している
- [ ] 静的フィールド（`id`、`displayName`、`strategy`、`contentTypes`）が設定されている
- [ ] 検出ルールが偽陽性なくフレームワークを特定する
- [ ] `install()` が冪等である（存在すればスキップ、`--force` を尊重）
- [ ] `uninstall()` がプラグインが作成したコンテンツのみを削除する
- [ ] `listInstalled()` が壊れた symlink を検出する
- [ ] `audit()` が健全性を正確に報告する
- [ ] プラグインが登録され `tool detect` に現れる
- [ ] dry-run テストが通る

## よくある落とし穴

- **相対 vs 絶対 symlink を忘れる**: プロジェクトスコープの symlink は相対（移植可能）にすべき。グローバルスコープの symlink は絶対（cwd に依存しない）にすべき。
- **欠落親ディレクトリを扱わない**: コンテンツ作成前に常に `mkdirSync(dir, { recursive: true })`。
- **マーカーなしの append-to-file**: 冪等マーカー（`<!-- start:id -->` / `<!-- end:id -->`）なしでは、繰り返しインストールでコンテンツが重複する。追記コンテンツは常に囲む。
- **検出の偽陽性**: 汎用ディレクトリ名（例: `.config/`）は複数フレームワークに一致しうる。ディレクトリ内の特定ファイルマーカーを使う。
- **`supports()` チェックを忘れる**: インストーラはディスパッチ前に `supports(item.type)` を呼ぶ。`contentTypes` が誤っているとアダプタは静かにアイテムをスキップする。

## 関連スキル

- `scaffold-cli-command` — このプラグインを使う CLI コマンドを構築する
- `test-cli-application` — アダプタテストを含む CLI ツールのテストパターン
- `design-cli-output` — install/uninstall 結果のターミナル出力
