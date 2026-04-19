---
name: render-icon-pipeline
description: >
  既存のグリフからアイコンをレンダリングするためにvizパイプラインを実行する。パレット
  生成、データ構築、マニフェスト作成、スキル・エージェント・チームのアイコンレンダリングを
  カバーするvizサブプロジェクトのエントリポイント。常に build.sh をパイプラインの
  エントリポイントとして使用し、Rscript を直接呼び出さない。
license: MIT
allowed-tools: Read Bash Grep Glob
locale: ja
source_locale: en
source_commit: 640725b5
translator: claude
translation_date: "2026-03-18"
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# アイコンパイプラインレンダリング

既存のグリフからアイコンをレンダリングするためにvizパイプラインをエンドツーエンドで実行する。パレット生成、データ構築、マニフェスト作成、スキル・エージェント・チームのアイコンレンダリングをカバーする。

**正規のエントリポイント**: プロジェクトルートから `bash viz/build.sh [flags]`、または `viz/` から `bash build.sh [flags]`。このスクリプトはプラットフォーム検出（WSL、Docker、ネイティブ）、Rバイナリの選択、ステップの順序付けを処理する。ビルドスクリプトに対して `Rscript` を直接呼び出してはならない — そのパスは MCP サーバー構成専用である。

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

1. `viz/build.sh` の存在を確認する:
   ```bash
   ls -la viz/build.sh
   ```
2. Node.jsが利用可能であることを確認する:
   ```bash
   node --version
   ```
3. `viz/config.yml` が存在することを確認する（プラットフォーム固有のRパスプロファイル）:
   ```bash
   ls viz/config.yml
   ```

`build.sh` はRバイナリの解決を自動的に処理する — Rパスを手動で検証する必要はない。WSL では `/usr/local/bin/Rscript`（WSL ネイティブ R）を使用し、Docker ではコンテナの R を使用し、ネイティブの Linux/macOS では PATH から `Rscript` を使用する。

**期待される結果：** `build.sh`、Node.js、`config.yml` が存在する。

**失敗時：** `config.yml` が不足している場合、パイプラインはシステムデフォルトにフォールバックする。Node.jsが不足している場合はnvm経由でインストールする。

### ステップ 2: パイプラインの実行

`build.sh` は 5 つのステップを順番に実行する:
1. パレットカラーの生成（R） → `palette-colors.json` + `colors-generated.js`
2. データの構築（Node） → `skills.json`
3. マニフェストの構築（Node） → `icon-manifest.json`、`agent-icon-manifest.json`、`team-icon-manifest.json`
4. アイコンのレンダリング（R） → `icons/` および `icons-hd/` の WebP ファイル
5. ターミナルグリフの生成（Node） → `cli/lib/glyph-data.json`

**フルパイプライン（全タイプ、全パレット、標準 + HD）:**
```bash
bash viz/build.sh
```

**インクリメンタル（ディスク上に既に存在するアイコンをスキップ）:**
```bash
bash viz/build.sh --skip-existing
```

**単一ドメイン（スキルのみ）:**
```bash
bash viz/build.sh --only design
```

**単一エンティティタイプ:**
```bash
bash viz/build.sh --type skill
bash viz/build.sh --type agent
bash viz/build.sh --type team
```

**ドライラン（レンダリングなしのプレビュー）:**
```bash
bash viz/build.sh --dry-run
```

**標準サイズのみ（HDをスキップ）:**
```bash
bash viz/build.sh --no-hd
```

`build.sh` の後のすべてのフラグは `build-all-icons.R` にパススルーされる。

**期待される結果：** アイコンが `viz/public/icons/<palette>/` と `viz/public/icons-hd/<palette>/` にレンダリングされる。

**失敗時：**
- **NTFS 上の renv ハング**: viz の `.Rprofile` は `renv/activate.R` をバイパスし、`.libPaths()` を直接設定する。`viz/` から実行することを確認する（build.sh は `cd "$(dirname "$0")"` により自動的にこれを行う）
- **Rパッケージ不足**: `build.sh` が選択する R 環境から `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"` を実行する
- **No glyph mapped**: エンティティにグリフ関数が必要 — レンダリング前に `create-glyph` スキルを使用する

### ステップ 3: 出力の確認

レンダリングが正常に完了したことを確認する。

1. ファイル数が期待値と一致することを確認する:
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. 適切なファイルサイズを確認する（アイコンあたり2〜80 KB）
3. 包括的なチェックのために `audit-icon-pipeline` スキルを実行する

**期待される結果：** ファイル数がマニフェストのエントリ数と一致する。ファイルサイズが想定範囲内。

**失敗時：** カウントが一致しない場合、レンダリング中に一部のグリフがエラーになった可能性がある。ビルドログの `[ERROR]` 行を確認する。

## CLIフラグリファレンス

すべてのフラグは `build.sh` を通じて `build-all-icons.R` にパススルーされる:

| Flag | Default | 説明 |
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

## build.sh の内部動作

参照のみ — これらのステップを手動で実行しないこと:

```
cd viz/
# 1. Platform detection: sets R_CONFIG_ACTIVE (wsl, docker, or unset)
# 2. R binary selection: WSL → /usr/local/bin/Rscript, Docker → same, native → Rscript
# 3. $RSCRIPT generate-palette-colors.R
# 4. node build-data.js
# 5. node build-icon-manifest.js --type all
# 6. $RSCRIPT build-all-icons.R "$@"  (flags passed through)
# 7. node build-terminal-glyphs.js
```

## Docker代替手段

パイプラインはDocker内でも実行可能:

```bash
cd viz
docker compose up --build
```

これは分離されたLinux環境でフルパイプラインを実行し、ポート8080で結果を提供する。

## 検証チェックリスト

- [ ] `bash viz/build.sh` を実行した（裸の `Rscript` ではない）
- [ ] パレットカラーが生成されている（JSON + JS）
- [ ] レジストリからデータファイルが構築されている
- [ ] データからマニフェストが生成されている
- [ ] 対象タイプとパレットのアイコンがレンダリングされている
- [ ] ファイル数が期待値と一致している
- [ ] ファイルサイズが想定範囲内（2〜80 KB）

## よくある落とし穴

- **Rscript を直接呼び出す**: `Rscript build-icons.R` や `Rscript generate-palette-colors.R` を手動で実行してはならない。常に `bash build.sh [flags]` を使用する。Rscript を直接呼び出すと、プラットフォーム検出がバイパスされ、誤ったRバイナリが使用される可能性がある（`/usr/local/bin/Rscript` の WSL ネイティブ R ではなく、`~/bin/Rscript` ラッパー経由の Windows R が使用される）。注意: CLAUDE.md およびガイド内の Windows R パスは**MCP サーバー構成専用**であり、ビルドスクリプト用ではない。
- **間違った作業ディレクトリ**: `build.sh` は自動的に自身のディレクトリに cd する（`cd "$(dirname "$0")"`）ため、どこからでも呼び出せる: プロジェクトルートからの `bash viz/build.sh` は正しく動作する。
- **古いマニフェスト**: `build.sh` はステップ 1-5 を順番に実行するため、マニフェストはレンダリング前に常に再生成される。レンダリングなしでマニフェストだけが必要な場合は、`node viz/build-data.js && node viz/build-icon-manifest.js` を使用する（Node のステップには R は不要）。
- **renvが有効化されていない**: `.Rprofile` の回避策は `viz/` からの実行を必要とする — `build.sh` がこれを処理する。`--vanilla` フラグの使用や別のディレクトリからの R の実行はスキップされる。
- **Windows上の並列処理**: Windowsはフォークベースの並列処理をサポートしない — パイプラインは `config.yml` を通じて `multisession` を自動選択する。

## 関連スキル

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — レンダリング前に欠落グリフとアイコンを検出する
- [create-glyph](../create-glyph/SKILL.md) — アイコンが欠落しているエンティティ用の新しいグリフ関数を作成する
- [enhance-glyph](../enhance-glyph/SKILL.md) — 再レンダリング前に既存グリフを改善する
