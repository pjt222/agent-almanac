---
name: install-almanac-content
description: >
  Install skills, agents, and teams from agent-almanac into any supported
  agentic framework using the CLI. Covers framework detection, content
  search, installation with dependency resolution, health auditing, and
  manifest-based syncing. Use when setting up a new project with agentic
  capabilities, installing specific skills or entire domains, targeting
  multiple frameworks simultaneously, or maintaining a declarative
  manifest of installed content.
license: MIT
allowed-tools:
  - Bash
  - Read
  - Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: basic
  language: multi
  tags:
    - cli
    - installation
    - framework-integration
    - discovery
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Install Almanac Content

`agent-almanac` CLI を使って、agent-almanac のスキル、エージェント、チームを任意のサポートされたエージェントフレームワークにインストールする。

## 使用タイミング

- 新規プロジェクトをセットアップしてエージェントスキル、エージェント、チームをインストールする必要がある
- 特定ドメイン（例: `r-packages`、`devops`）からすべてのスキルをインストール
- 複数フレームワーク（Claude Code、Cursor、Copilot 等）を同時にターゲット
- 再現可能なセットアップ用に宣言的 `agent-almanac.yml` マニフェストを作成または同期
- インストール済みコンテンツを壊れた symlink または古い参照について監査

## 入力

- **必須**: インストールするコンテンツ -- 1 つ以上のスキル、エージェント、チーム ID（例: `create-skill`、`r-developer`、`r-package-review`）
- **任意**: `--domain <domain>` -- 個々の ID を名指す代わりにドメインからすべてのスキルをインストール
- **任意**: `--framework <id>` -- 特定フレームワークをターゲット（既定: すべて自動検出）
- **任意**: `--with-deps` -- エージェントのスキルとチームのエージェント+スキルもインストール
- **任意**: `--dry-run` -- ディスクへの書き込みなしに変更をプレビュー
- **任意**: `--global` -- プロジェクトスコープではなくグローバルスコープにインストール
- **任意**: `--force` -- 既存コンテンツを上書き
- **任意**: `--source <path>` -- agent-almanac ルートへの明示的パス（既定: 自動検出）

## 手順

### ステップ1: フレームワークを検出する

カレントプロジェクトに存在するエージェントツールを見るためフレームワーク検出を実行する:

```bash
agent-almanac detect
```

これは作業ディレクトリを設定ファイルとディレクトリ（`.claude/`、`.cursor/`、`.github/copilot-instructions/`、`.agents/` 等）でスキャンし、どのフレームワークがアクティブかを報告する。

**期待結果：** 出力は 1 つ以上の検出されたフレームワークをアダプタステータスと共に列挙する。フレームワークが検出されなければ、ユニバーサルアダプタ（`.agents/skills/`）がフォールバックとして使われる。

**失敗時：** CLI が見つからなければ、インストールされて PATH 上にあることを保証する。検出が何も返さずフレームワークが存在することを知っているなら、`--framework <id>` を使って明示的に指定する。`agent-almanac list --domains` を実行して CLI がレジストリに到達できるか検証する。

### ステップ2: コンテンツを検索する

キーワードでスキル、エージェント、チームを見つける:

```bash
agent-almanac search <keyword>
```

カテゴリで browsing するには:

```bash
agent-almanac list --domains          # List all domains with skill counts
agent-almanac list -d r-packages      # List skills in a specific domain
agent-almanac list --agents           # List all agents
agent-almanac list --teams            # List all teams
```

**期待結果：** 検索結果またはフィルタリングされたリストが、ID と説明と共に一致するコンテンツを表示する。

**失敗時：** 結果が現れないなら、より広いキーワードを試す。almanac ルートが到達可能か検証: `agent-almanac list` がフルスキルカウントを示すべき。ルートが見つからなければ、`--source /path/to/agent-almanac` を渡す。

### ステップ3: コンテンツをインストールする

名前で 1 つ以上のアイテムをインストールする:

```bash
# Install specific skills
agent-almanac install create-skill write-testthat-tests

# Install all skills from a domain
agent-almanac install --domain devops

# Install an agent with its skills
agent-almanac install --agent r-developer --with-deps

# Install a team with its agents and their skills
agent-almanac install --team r-package-review --with-deps

# Target a specific framework
agent-almanac install create-skill --framework cursor

# Preview without writing
agent-almanac install --domain esoteric --dry-run

# Install to global scope
agent-almanac install create-skill --global
```

CLI はレジストリからコンテンツを解決し、各検出されたフレームワーク用に適切なアダプタを選び、ファイルをフレームワーク固有パス（例: Claude Code には `.claude/skills/`、Cursor には `.cursor/rules/`）に書く。

**期待結果：** 出力はインストールされたアイテム数とターゲットフレームワークを確認する。インストールされたコンテンツが正しいフレームワークディレクトリに現れる。

**失敗時：** アイテムが見つからなければ、ID がレジストリの `name` フィールドに一致するか検証する（`skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml`）。ファイルが既に存在しインストールがスキップされたら、`--force` を使って上書きする。

### ステップ4: インストールを検証する

すべてのインストール済みコンテンツに健全性チェックを実行する:

```bash
agent-almanac audit
```

特定のフレームワークまたはスコープを監査するには:

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

現在何がインストールされているか見るには:

```bash
agent-almanac list --installed
```

**期待結果：** 監査がすべてのインストール済みアイテムを健全と報告し、壊れた参照がない。`--installed` 一覧は各アイテムをタイプとフレームワークと共に表示する。

**失敗時：** 監査が壊れたアイテムを報告したら、`--force` で再インストールする。symlink が壊れていたら、almanac ソースパスが移動していないか検証する。`agent-almanac install <broken-id> --force` を実行して修復する。

### ステップ5: マニフェストで管理する（任意）

再現可能なセットアップのため、宣言的 `agent-almanac.yml` マニフェストを使う:

```bash
# Generate a starter manifest
agent-almanac init
```

これは検出されたフレームワークとプレースホルダコンテンツリストと共にカレントディレクトリに `agent-almanac.yml` を作成する。望むスキル、エージェント、チームを宣言するためファイルを編集する:

```yaml
source: /path/to/agent-almanac
frameworks:
  - claude-code
  - cursor
skills:
  - create-skill
  - domain:r-packages
agents:
  - r-developer
teams:
  - r-package-review
```

それからマニフェストで宣言されたすべてをインストール:

```bash
agent-almanac install
```

インストール状態をマニフェストと整合させる（欠落をインストール、余剰を削除）には:

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

**期待結果：** 引数なしで `install` を実行するとマニフェストを読み、宣言されたすべてのコンテンツをインストールする。`sync` の実行はインストール状態をマニフェストと整合させ、欠落アイテムを加え未宣言を削除する。

**失敗時：** `sync` が "No agent-almanac.yml found" を報告したら、まず `agent-almanac init` を実行する。マニフェストが 0 アイテムに解決したら、スキル/エージェント/チーム ID がレジストリエントリと正確に一致するか確認する。`#` で始まるコメント行は無視される。

### ステップ6: チームをキャンプファイアとして管理する（任意）

campfire コマンドは `install --team` への温かいチーム指向の代替を提供する:

```bash
# Browse all available team circles
agent-almanac campfire --all

# Inspect a specific circle (members, practices, pattern)
agent-almanac campfire tending

# See shared agents between teams (hearth-keepers)
agent-almanac campfire --map

# Gather a team (install with arrival ceremony)
agent-almanac gather tending
agent-almanac gather tending --ceremonial    # Show each skill arriving
agent-almanac gather tending --only mystic,gardener  # Partial gathering

# Check fire health (burning / embers / cold)
agent-almanac tend

# Scatter a team (uninstall with farewell)
agent-almanac scatter tending
```

キャンプファイア状態は `.agent-almanac/state.json`（git 無視、プロジェクトに局所）で追跡される。火には熱状態がある: **burning**（過去 7 日以内に使用）、**embers**（30 日以内）、**cold**（30+ 日）。`tend` を実行するとすべての火を温め、健全性を報告する。

共有スキルは scatter 中に保護される — スキルが別の集めた火に必要なら、インストールされたままになる。共有エージェントは複製ではなく火の間を歩く。

すべての campfire コマンドはスクリプティング用に `--quiet`（標準レポーター出力）と `--json`（マシン解析可能）をサポートする。

**期待結果：** チームが状態追跡と共に集められ管理される。`campfire --all` が火状態を示す。`tend` が健全性を報告する。

**失敗時：** キャンプファイア状態が壊れたら、`.agent-almanac/state.json` を削除してチームを再 gather する。`gather` が失敗したら、チーム名が `teams/_registry.yml` のエントリと一致するか確認する。

## バリデーション

- [ ] `agent-almanac detect` が期待されるフレームワークを示す
- [ ] `agent-almanac list --installed` がすべての意図されたコンテンツを示す
- [ ] `agent-almanac audit` が壊れたアイテムを報告しない
- [ ] インストールされたスキルがターゲットフレームワークで解決する（例: Claude Code で `/skill-name` が動く）
- [ ] マニフェストを使うなら、`agent-almanac sync --dry-run` が変更不要を報告する

## よくある落とし穴

- **エージェントとチームに `--with-deps` を忘れる**: `--with-deps` なしでエージェントをインストールすると、エージェント定義のみがインストールされ、参照されるスキルはインストールされない。エージェントは存在するがそのスキル手順に従えない。依存を別々にインストールしていない限り、常にエージェントとチームに `--with-deps` を使う。
- **マニフェストドリフト**: コンテンツを手動でインストールまたは削除した後、マニフェストは実際のインストール状態から外れる。定期的に `agent-almanac sync` を実行するか、整合を保つために常にマニフェストを通じてインストールする。
- **スコープ混乱（プロジェクト vs グローバル）**: `--global` でインストールされたコンテンツは `~/.claude/skills/`（または同等物）に行き、プロジェクトスコープコンテンツはカレントディレクトリの `.claude/skills/` に行く。スキルが見つからなければ、間違ったスコープでインストールされていないか確認する。
- **古いソースパス**: agent-almanac リポジトリが移動またはリネームされたら、マニフェストと自動検出の `--source` パスが壊れる。`agent-almanac.yml` の `source` フィールドを更新するか、`agent-almanac init` を再実行する。
- **フレームワークが検出されない**: 検出器は特定のファイルとディレクトリを探す。新しく初期化されたプロジェクトはまだこれらを持たないかもしれない。プロジェクトが期待される構造を持つまで `--framework <id>` を明示的に使うか、ユニバーサルアダプタに依存する。
- **キャンプファイア熱状態混乱**: 火は使用なし 30 日後に冷める。`agent-almanac tend` を実行するとすべての集められた火のタイマーがリセットされる。火が "cold" として表示されるなら、それはまだフルにインストールされている — 熱状態は使用の最近性を反映し、インストール健全性ではない。

## 関連スキル

- `create-skill` -- インストール前に almanac に加える新しいスキルを作成する
- `configure-mcp-server` -- インストール後にエージェントが必要とするかもしれない MCP サーバーをセットアップ
- `write-claude-md` -- インストールされたスキルを参照するよう CLAUDE.md を設定
- `audit-discovery-symlinks` -- Claude Code スキル検出のための symlink 問題を診断
- `design-cli-output` -- CLI のレポーターと campfire セレモニーが使うターミナル出力パターン
