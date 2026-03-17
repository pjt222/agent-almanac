---
name: render-puzzle-docs
description: >
  jigsawRのQuartoドキュメントサイトをGitHub Pages用にレンダリングする。
  フレッシュレンダリング（キャッシュクリア）、キャッシュレンダリング（高速）、
  シングルページレンダリングをサポート。バンドルされたレンダースクリプトまたは
  WSLからの直接quarto.exe呼び出しを使用する。コンテンツ変更後のフルサイト
  ビルド、反復編集中のシングルページレンダリング、リリースやPR向けの
  ドキュメント準備、Quarto .qmdファイルのレンダーエラーデバッグに使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, quarto, documentation, github-pages, rendering
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# パズルドキュメントのレンダリング

jigsawRのQuartoドキュメントサイトをレンダリングする。

## 使用タイミング

- コンテンツ変更後のフルドキュメントサイトビルド
- 反復編集中のシングルページレンダリング
- リリースやPR向けのドキュメント準備
- Quarto .qmdファイルのレンダーエラーデバッグ

## 入力

- **必須**: レンダリングモード（`fresh`、`cached`、または`single`）
- **任意**: 特定の.qmdファイルパス（シングルページモード用）
- **任意**: ブラウザで結果を開くかどうか

## 手順

### ステップ1: レンダリングモードの選択

| モード | コマンド | 所要時間 | 使用場面 |
|------|---------|----------|----------|
| Fresh | `bash inst/scripts/render_quarto.sh` | 約5-7分 | コンテンツ変更、キャッシュが古い場合 |
| Cached | `bash inst/scripts/render_quarto.sh --cached` | 約1-2分 | 軽微な編集、キャッシュが有効な場合 |
| Single | 直接quarto.exe | 約30秒 | 1ページの反復作業 |

**期待結果：** 現在の状況に基づいてレンダリングモードが選択される：コンテンツ変更や古いキャッシュにはfresh、軽微な編集にはcached、1ページの反復にはsingle。

**失敗時：** キャッシュが古いかどうか不明な場合は、freshレンダリングをデフォルトにする。時間はかかるが正しい出力が保証される。

### ステップ2: レンダリングの実行

**フレッシュレンダリング**（`_freeze`と`_site`をクリアし、すべてのRコードを再実行）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**キャッシュレンダリング**（既存の`_freeze`ファイルを使用）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**シングルページ**（1つの.qmdファイルを直接レンダリング）：

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

**期待結果：** レンダリングがエラーなく完了する。出力は`quarto/_site/`に格納される。

**失敗時：**
- .qmdチャンクのRコードエラーを確認する（`#| label:`マーカーを探す）
- pandocが`RSTUDIO_PANDOC`環境変数経由で利用可能か確認する
- キャッシュをクリアしてみる：`rm -rf quarto/_freeze quarto/_site`
- .qmdファイルで使用されるすべてのRパッケージがインストールされているか確認する

### ステップ3: 出力の検証

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

サイト構造を確認する：
- `quarto/_site/index.html`が存在する
- ナビゲーションリンクが正しく解決される
- 画像とSVGファイルが正しくレンダリングされる

**期待結果：** `index.html`が存在し空でない。ナビゲーションリンクが解決され、画像/SVGがブラウザで正しくレンダリングされる。

**失敗時：** `index.html`が見つからない場合、レンダリングがサイレントに失敗した可能性がある。詳細出力で再実行し、`.qmd`チャンクのRコードエラーを確認する。一部のページのみ欠落している場合、それらの`.qmd`ファイルが`_quarto.yml`にリストされているか確認する。

### ステップ4: プレビュー（任意）

Windowsブラウザで開く：

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

**期待結果：** ドキュメントサイトがWindowsのデフォルトブラウザで目視検査のために開く。

**失敗時：** WSLから`cmd.exe /c start`コマンドが失敗する場合、代わりに`explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"`を試す。または、ブラウザでファイルに手動でナビゲートする。

## バリデーション

- [ ] `quarto/_site/index.html`が存在し空でない
- [ ] コンソール出力にレンダーエラーがない
- [ ] すべてのRコードチャンクが正常に実行された（エラーメッセージを確認）
- [ ] ページ間のナビゲーションが機能する
- [ ] すべての.qmdファイルがコードチャンクにクリーンな出力のための`#| label:`を持つ

## よくある落とし穴

- **古いフリーズキャッシュ**: Rコードが変更された場合、`_freeze`ファイルを再生成するためにfreshレンダリングを使用する
- **不足しているRパッケージ**: Quarto .qmdファイルがrenvにないパッケージを使用している場合がある。先にインストールする
- **pandocが見つからない**: `.Renviron`に`RSTUDIO_PANDOC`が設定されているか確認する
- **長いレンダリング時間**: freshレンダリングは5-7分かかる（R実行を伴う14ページ）。反復中はcachedモードを使用する
- **コードチャンクラベル**: すべてのRコードチャンクにクリーンなレンダリングのための`#| label:`が必要

## 関連スキル

- `generate-puzzle` — ドキュメントで参照されるパズル出力を生成する
- `run-puzzle-tests` — ドキュメント内のコード例が正しいことを確認する
- `create-quarto-report` — 一般的なQuartoドキュメント作成
