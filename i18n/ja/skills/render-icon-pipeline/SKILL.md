---
name: render-icon-pipeline
description: >
  既存のグリフからアイコンをレンダリングするためにvizパイプラインを実行する。パレット
  生成、データ構築、マニフェスト作成、スキル・エージェント・チームのアイコンレンダリングを
  カバーするvizサブプロジェクトのエントリポイント。
license: MIT
allowed-tools: Read Bash Grep Glob
locale: ja
source_locale: en
source_commit: 41c6956b
translator: claude
translation_date: "2026-03-18"
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# アイコンパイプラインレンダリング

既存のグリフからアイコンをレンダリングするためにvizパイプラインをエンドツーエンドで実行する。パレット生成、データ構築、マニフェスト作成、スキル・エージェント・チームのアイコンレンダリングをカバーする。

## 使用する場面

- グリフ関数を作成または変更した後
- レジストリに新しいスキル、エージェント、またはチームを追加した後
- 新しいパレットまたは更新されたパレットのためにアイコンの再レンダリングが必要な場合
- フルパイプラインの再構築（例: インフラ変更後）
- viz環境を初めてセットアップする場合

## 入力

- **任意**: エンティティタイプ — `skill`、`agent`、`team`、または `all`（デフォルト: `all`）
- **任意**: パレット — 特定のパレット名または `all`（デフォルト: `all`）
- **任意**: ドメインフィルタ — スキルアイコン用の特定ドメイン（例: `git`、`design`）
- **任意**: レンダリングモード — `full`、`incremental`、または `dry-run`（デフォルト: `incremental`）

## 手順

### ステップ 1: 前提条件の確認

レンダリングのための環境が整っていることを確認する。

1. 作業ディレクトリが `viz/` であることを確認する（またはそこに移動する）:
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   ```
2. Rパッケージが利用可能であることを確認する:
   ```bash
   Rscript -e "requireNamespace('ggplot2'); requireNamespace('ggforce'); requireNamespace('ggfx'); requireNamespace('ragg'); requireNamespace('magick')"
   ```
3. Node.jsが利用可能であることを確認する:
   ```bash
   node --version
   ```
4. `config.yml` が存在することを確認する（OS対応のRパス選択）

**期待される結果:** すべての前提条件がエラーなく通過する。

**失敗時の対応:** 不足しているRパッケージは `install.packages()` でインストールする。Node.jsが不足している場合はnvm経由でインストールする。`config.yml` が不足している場合、パイプラインはシステムデフォルトにフォールバックする。

### ステップ 2: パレットカラーの生成

Rパレット定義からJSONおよびJSのパレットデータを生成する。

```bash
Rscript generate-palette-colors.R
```

**期待される結果:** `viz/public/data/palette-colors.json` と `viz/js/palette-colors.js` が更新される。

**失敗時の対応:** `viz/R/palettes.R` が有効なRコードであることを確認する。よくある問題: 新しいドメインカラーエントリの構文エラー。

### ステップ 3: データの構築

レジストリからスキル/エージェント/チームのデータファイルを生成する。

```bash
node build-data.js
```

**期待される結果:** `viz/public/data/skills.json` が現在のレジストリデータで更新される。

**失敗時の対応:** `skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml` が有効なYAMLであることを確認する。

### ステップ 4: マニフェストの構築

データファイルからアイコンマニフェストを生成する。

```bash
node build-icon-manifest.js
```

**期待される結果:** 3つのマニフェストファイルが更新される:
- `viz/public/data/icon-manifest.json`
- `viz/public/data/agent-icon-manifest.json`
- `viz/public/data/team-icon-manifest.json`

**失敗時の対応:** マニフェストが古い場合は削除して再実行する。`build-data.js` が先に実行されたことを確認する。

### ステップ 5: アイコンのレンダリング

適切なフラグを付けてアイコンレンダラーを実行する。

**フルパイプライン（全タイプ、全パレット、標準 + HD）:**
```bash
Rscript build-all-icons.R
```

**インクリメンタル（変更なしのグリフをスキップ）:**
```bash
Rscript build-all-icons.R --skip-existing
```

**単一エンティティタイプ:**
```bash
Rscript build-all-icons.R --type skill
Rscript build-all-icons.R --type agent
Rscript build-all-icons.R --type team
```

**単一ドメイン（スキルのみ）:**
```bash
Rscript build-icons.R --only design
```

**単一エージェントまたはチーム:**
```bash
Rscript build-agent-icons.R --only mystic
Rscript build-team-icons.R --only r-package-review
```

**ドライラン（レンダリングなしのプレビュー）:**
```bash
Rscript build-all-icons.R --dry-run
```

**標準サイズのみ（HDをスキップ）:**
```bash
Rscript build-all-icons.R --no-hd
```

**CLIリファレンス:**

| フラグ | デフォルト | 説明 |
|------|---------|-------------|
| `--type <types>` | `all` | カンマ区切り: skill, agent, team |
| `--palette <name>` | `all` | 単一パレットまたは `all`（9パレット） |
| `--only <filter>` | なし | ドメイン（スキル）またはエンティティID（エージェント/チーム） |
| `--skip-existing` | オフ | 既存のWebPファイルがあるアイコンをスキップ |
| `--dry-run` | オフ | 生成されるものを一覧表示 |
| `--size <n>` | `512` | 出力寸法（ピクセル） |
| `--glow-sigma <n>` | `4` | グローぼかし半径 |
| `--workers <n>` | 自動 | 並列ワーカー数（detectCores()-1） |
| `--no-cache` | オフ | コンテンツハッシュキャッシュを無視 |
| `--hd` | オン | HDバリアント（1024px）を有効化 |
| `--no-hd` | オフ | HDバリアントをスキップ |
| `--strict` | オフ | 最初のサブスクリプト失敗時に終了 |

**期待される結果:** アイコンが `viz/public/icons/<palette>/` と `viz/public/icons-hd/<palette>/` にレンダリングされる。

**失敗時の対応:**
- **renvのハング**: `viz/` ディレクトリから実行し、`.Rprofile` がライブラリパスの回避策を有効にするようにする
- **パッケージ不足**: `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick", "future", "furrr", "digest"))`
- **終了コード5**: 通常はグリフ関数がエラーになったことを意味する — ログで具体的なスキル/エージェント/チームIDを確認する
- **No glyph mapped**: エンティティにグリフ関数が必要 — `create-glyph` スキルを使用する

### ステップ 6: 出力の確認

レンダリングが正常に完了したことを確認する。

1. ファイル数が期待値と一致することを確認する:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. 適切なファイルサイズを確認する（アイコンあたり2〜80 KB）
3. マニフェストが最新であることを確認する（完全なチェックには `audit-icon-pipeline` を実行する）

**期待される結果:** ファイル数がマニフェストのエントリ数と一致する。ファイルサイズが想定範囲内。

**失敗時の対応:** カウントが一致しない場合、レンダリング中に一部のグリフがエラーになった可能性がある。ビルドログの `[ERROR]` 行を確認する。

## Docker代替手段

パイプラインはDocker内でも実行可能:

```bash
cd viz
docker compose up --build
```

これは分離されたLinux環境でフルパイプラインを実行し、ポート8080で結果を提供する。

## 検証チェックリスト

- [ ] 作業ディレクトリが `viz/`
- [ ] パレットカラーが生成されている（JSON + JS）
- [ ] レジストリからデータファイルが構築されている
- [ ] データからマニフェストが生成されている
- [ ] 対象タイプとパレットのアイコンがレンダリングされている
- [ ] ファイル数が期待値と一致している
- [ ] ファイルサイズが想定範囲内（2〜80 KB）

## よくある落とし穴

- **間違った作業ディレクトリ**: Rスクリプトは `viz/` から実行されるか、プロジェクトルートからの相対パスで `viz/R/utils.R` を見つけることを期待している
- **renvが有効化されていない**: `.Rprofile` の回避策は `viz/` からの実行を必要とする — `--vanilla` フラグの使用や別のディレクトリからの実行はスキップされる
- **古いマニフェスト**: レジストリ変更後は、ステップ5（レンダリング）の前に必ずステップ2〜4（パレット→データ→マニフェスト）を実行すること
- **Windows上の並列処理**: Windowsはフォークベースの並列処理をサポートしない — パイプラインは `config.yml` を通じて `multisession` を自動選択する

## 関連スキル

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — レンダリング前に欠落グリフとアイコンを検出する
- [create-glyph](../create-glyph/SKILL.md) — アイコンが欠落しているエンティティ用の新しいグリフ関数を作成する
- [enhance-glyph](../enhance-glyph/SKILL.md) — 再レンダリング前に既存グリフを改善する
