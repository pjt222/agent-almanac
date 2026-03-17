---
name: generate-puzzle
description: >
  generate_puzzle()またはgeom_puzzle_*()を使用してジグソーパズルを生成し、
  inst/config.ymlに対するパラメータバリデーションを実行する。矩形、六角形、
  同心円、ボロノイ、snicパズルタイプをサポートし、グリッド、サイズ、シード、
  オフセット、レイアウトのパラメータを設定可能。特定のタイプと設定でパズル
  SVGファイルを作成する場合、異なるパラメータで生成をテストする場合、
  ドキュメントやデモ用のサンプル出力を生成する場合、またはggplot2パズル
  可視化を作成する場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, puzzle, svg, generation, ggplot2
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# パズル生成

jigsawRパッケージの統合APIを使用してジグソーパズルを生成する。

## 使用タイミング

- 特定のタイプと設定でパズルSVGファイルを作成する場合
- 異なるパラメータでパズル生成をテストする場合
- ドキュメントやデモ用のサンプル出力を生成する場合
- geom_puzzle_*()を使用してggplot2パズル可視化を作成する場合

## 入力

- **必須**: パズルタイプ (`"rectangular"`, `"hexagonal"`, `"concentric"`, `"voronoi"`, `"random"`, `"snic"`)
- **必須**: グリッド寸法（タイプ依存：`c(cols, rows)`または`c(rings)`）
- **任意**: サイズ（mm単位、デフォルトはタイプにより異なる）
- **任意**: シード（再現性のため、デフォルト：42）
- **任意**: オフセット（0 = 連結、>0 = 分離ピース）
- **任意**: レイアウト（矩形の場合`"grid"`または`"repel"`）
- **任意**: フュージョングループ（PILES記法文字列）

## 手順

### ステップ1: 設定制約の確認

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

または`inst/config.yml`を直接読み取り、選択したタイプの有効範囲を確認する。

**期待結果：** 選択したパズルタイプのgrid、size、tabsize、その他のパラメータの最小/最大値が判明する。

**失敗時：** `config.yml`が見つからないかタイプキーが存在しない場合、jigsawRプロジェクトのルートにいるか、パッケージが少なくとも一度ビルドされているか確認する。

### ステップ2: タイプとパラメータの決定

ユーザーのリクエストを有効な`generate_puzzle()`引数にマッピングする：

| タイプ | grid | size | 追加パラメータ |
|------|------|------|-------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

**期待結果：** ユーザーリクエストがconfig.ymlの範囲内の正しい`type`、`grid`寸法、`size`値を持つ有効な`generate_puzzle()`引数にマッピングされる。

**失敗時：** どのパラメータ形式を使用するか不明な場合は、上記の表を参照する。矩形とボロノイタイプはgridに`c(cols, rows)`を使用し、六角形と同心円タイプは`c(rings)`を使用する。

### ステップ3: Rスクリプトの作成

スクリプトファイルを作成する（複雑なコマンドの場合は`-e`より推奨）：

```r
library(jigsawR)

result <- generate_puzzle(
  type = "rectangular",
  seed = 42,
  grid = c(3, 4),
  size = c(400, 300),
  offset = 0,
  layout = "grid"
)

cat("Pieces:", length(result$pieces), "\n")
cat("SVG length:", nchar(result$svg_content), "\n")
cat("Files:", paste(result$files, collapse = ", "), "\n")
```

一時スクリプトファイルに保存する。

**期待結果：** `library(jigsawR)`、すべてのパラメータを含む`generate_puzzle()`呼び出し、診断出力行を含むRスクリプトファイルが一時的な場所に保存される。

**失敗時：** スクリプトに構文エラーがある場合、すべての文字列引数が引用符で囲まれ、数値ベクトルが`c()`を使用しているか確認する。常にスクリプトファイルを使用して複雑なシェルエスケープを回避する。

### ステップ4: WSL Rによる実行

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

**期待結果：** スクリプトがエラーなく完了する。SVGファイルが`output/`に書き込まれる。

**失敗時：** renvが復元されているか確認する（`renv::restore()`）。パッケージがロードされているか確認する（`devtools::load_all()`）。`--vanilla`フラグは使用しないこと（renvは.Rprofileが必要）。

### ステップ5: 出力の検証

- SVGファイルが`output/`ディレクトリに存在する
- SVGコンテンツが`<?xml`または`<svg`で始まる
- ピース数が期待値と一致する：cols * rows（矩形）、リング公式（hex/concentric）
- ggplot2アプローチの場合、プロットオブジェクトがエラーなくレンダリングされることを確認する

**期待結果：** SVGファイルが`output/`に存在し、コンテンツが`<?xml`または`<svg`で始まり、ピース数がグリッド仕様と一致する（矩形はcols * rows、hex/concentricはリング公式）。

**失敗時：** SVGファイルが見つからない場合、`output/`ディレクトリが存在するか確認する。ピース数が間違っている場合、グリッド寸法がパズルタイプの期待される公式と一致するか確認する。ggplot2出力の場合、`tryCatch()`でラップしてプロットがエラーなくレンダリングされるか確認する。

### ステップ6: 出力の保存

生成されたファイルはデフォルトで`output/`に保存される。`result`オブジェクトには以下が含まれる：
- `$svg_content` — 生のSVG文字列
- `$pieces` — ピースデータのリスト
- `$canvas_size` — 寸法
- `$files` — 書き込まれたファイルのパス

**期待結果：** `result`オブジェクトに`$svg_content`、`$pieces`、`$canvas_size`、`$files`フィールドが含まれる。`$files`にリストされたファイルがディスク上に存在する。

**失敗時：** `$files`が空の場合、パズルはメモリ内のみで生成された可能性がある。`writeLines(result$svg_content, "output/puzzle.svg")`で明示的に保存する。

## バリデーション

- [ ] スクリプトがエラーなく実行される
- [ ] SVGファイルが整形式のXMLである
- [ ] ピース数がグリッド仕様と一致する
- [ ] 同じシードで同一の出力が生成される（再現性）
- [ ] パラメータがconfig.ymlの制約内にある

## よくある落とし穴

- **`--vanilla`フラグの使用**: renvの有効化を破壊する。絶対に使用しないこと。
- **複雑な`-e`コマンド**: 代わりにスクリプトファイルを使用する。シェルエスケープがExit code 5を引き起こす。
- **グリッドとサイズの混同**: グリッドはピース数、サイズはmm単位の物理的寸法。
- **オフセットの意味**: 0 = 組み立てられたパズル、正の値 = 展開/分離されたピース。
- **snicにパッケージが必要**: snicタイプには`snic`パッケージのインストールが必要。

## 関連スキル

- `add-puzzle-type` — 新しいパズルタイプをエンドツーエンドでスキャフォールドする
- `validate-piles-notation` — generate_puzzle()に渡す前にフュージョングループ文字列を検証する
- `run-puzzle-tests` — 生成変更後にテストスイートを実行する
- `write-testthat-tests` — 新しい生成シナリオのテストを追加する
