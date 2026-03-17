---
name: add-puzzle-type
description: >
  jigsawRの10以上のパイプライン統合ポイントにまたがる新しいパズルタイプを
  スキャフォールドする。コアパズルモジュールを作成し、統合パイプライン
  （生成、配置、レンダリング、隣接）に接続し、ggpuzzleのgeom/statレイヤーを
  追加し、DESCRIPTIONとconfig.ymlを更新し、Shinyアプリを拡張し、包括的な
  テストスイートを作成する。パッケージに完全に新しいパズルタイプを追加する場合や、
  10ポイント統合チェックリストに従ってエンドツーエンドで漏れがないようにする場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: advanced
  language: R
  tags: jigsawr, puzzle-type, pipeline, integration, scaffold
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# パズルタイプの追加

jigsawRのすべてのパイプライン統合ポイントにまたがる新しいパズルタイプをスキャフォールドする。

## 使用タイミング

- パッケージに完全に新しいパズルタイプを追加する場合
- 確立された統合チェックリスト（CLAUDE.md 10ポイントパイプライン）に従う場合
- 新しいタイプをエンドツーエンドで接続する際に漏れがないようにする場合

## 入力

- **必須**: 新しいタイプ名（小文字、例：`"triangular"`）
- **必須**: ジオメトリの説明（ピースの形状/配置方法）
- **必須**: 外部パッケージが必要かどうか（Suggestsに追加）
- **任意**: 標準パラメータ（grid、size、seed、tabsize、offset）以外のパラメータリスト
- **任意**: 参照実装またはアルゴリズムソース

## 手順

### ステップ1: コアパズルモジュールの作成

内部生成関数を持つ`R/<type>_puzzle.R`を作成する：

```r
#' Generate <type> puzzle pieces (internal)
#' @noRd
generate_<type>_pieces_internal <- function(params, seed) {
  # 1. RNG状態の初期化
  # 2. ピースジオメトリの生成
  # 3. エッジパスの構築（SVGパスデータ）
  # 4. 隣接関係の計算
  # 5. リストを返す: pieces, edges, adjacency, metadata
}
```

構造については`R/voronoi_puzzle.R`または`R/snic_puzzle.R`のパターンに従う。

**期待結果：** 関数が`$pieces`、`$edges`、`$adjacency`、`$metadata`を含むリストを返す。

**失敗時：** `generate_voronoi_pieces_internal()`の返却構造と比較して、不足しているリスト要素や不正な型を特定する。

### ステップ2: jigsawR_clean.Rへの接続

`R/jigsawR_clean.R`を編集する：

1. `valid_types`ベクトルに`"<type>"`を追加
2. paramsセクションにタイプ固有のパラメータ抽出を追加
3. タイプ固有の制約のバリデーションロジックを追加
4. ファイル名プレフィックスマッピングを追加（例：`"<type>"` -> `"<type>_"`）

```r
# valid_typesに追加
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**期待結果：** `generate_puzzle(type = "<type>")`が「unknown type」エラーなく受け入れられる。

**失敗時：** タイプ文字列が正確なスペルで`valid_types`に追加されているか、パラメータ抽出が必要なタイプ固有引数をすべてカバーしているか確認する。

### ステップ3: unified_piece_generation.Rへの接続

`R/unified_piece_generation.R`を編集する：

1. `generate_pieces_internal()`にディスパッチケースを追加
2. タイプがPILES記法をサポートする場合、フュージョン処理を追加

```r
# switch/dispatchに追加
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**期待結果：** タイプがディスパッチされるとピースが生成される。

**失敗時：** ディスパッチケース文字列がタイプ名と正確に一致し、`generate_<type>_pieces_internal`がパズルモジュールから定義・エクスポートされているか確認する。

### ステップ4: piece_positioning.Rへの接続

`R/piece_positioning.R`を編集する：

新しいタイプの配置ディスパッチを追加する。ほとんどのタイプは共有配置ロジックを使用するが、カスタム処理が必要なものもある。

**期待結果：** `apply_piece_positioning()`が新しいタイプをエラーなく処理し、ピースが正しい座標に配置される。

**失敗時：** 新しいタイプにカスタム配置ロジックが必要か、共有配置パスを再利用できるか確認する。デフォルトパスが適用されない場合はディスパッチケースを追加する。

### ステップ5: unified_renderer.Rへの接続

`R/unified_renderer.R`を編集する：

1. `render_puzzle_svg()`にレンダリングケースを追加
2. エッジパス関数を追加：`get_<type>_edge_paths()`
3. ピース名関数を追加：`get_<type>_piece_name()`

**期待結果：** 正しいピース輪郭とエッジパスを持つ新しいタイプのSVG出力が生成される。

**失敗時：** `get_<type>_edge_paths()`が有効なSVGパスデータを返し、`get_<type>_piece_name()`が各ピースに一意の識別子を生成しているか確認する。

### ステップ6: adjacency_api.Rへの接続

`R/adjacency_api.R`を編集する：

`get_neighbors()`と`get_adjacency()`が新しいタイプで動作するようにネイバーディスパッチを追加する。

**期待結果：** `get_neighbors(result, piece_id)`がパズル内の任意のピースに対して正しいネイバーを返す。

**失敗時：** 隣接ディスパッチが正しいデータ構造を返しているか確認する。小さなグリッドでテストし、ジオメトリに対してネイバー関係を手動で検証する。

### ステップ7: ggpuzzle Geomレイヤーの追加

`R/geom_puzzle.R`を編集する：

`make_puzzle_layer()`ファクトリーを使用して`geom_puzzle_<type>()`を作成する：

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**期待結果：** `ggplot() + geom_puzzle_<type>(aes(...))`がエラーなくレンダリングされる。

**失敗時：** `make_puzzle_layer()`が正しいタイプ文字列を受け取り、geom関数が`@export`経由でNAMESPACEにエクスポートされているか確認する。

### ステップ8: Statディスパッチの追加

`R/stat_puzzle.R`を編集する：

1. タイプ固有のデフォルトパラメータを追加
2. `compute_panel()`にディスパッチケースを追加

**期待結果：** statレイヤーがパズルジオメトリを正しく計算し、期待される数のポリゴンを生成する。

**失敗時：** `compute_panel()`ディスパッチケースが必要なカラム（`x`、`y`、`group`、`piece_id`）を含むデータフレームを返し、デフォルトパラメータが新しいタイプに適切か確認する。

### ステップ9: DESCRIPTIONの更新

`DESCRIPTION`を編集する：

1. Descriptionフィールドのテキストに新しいタイプを追加
2. 新しいパッケージを`Suggests:`に追加（外部依存がある場合）
3. `Collate:`を更新して新しいRファイルを含める（アルファベット順）

**期待結果：** `devtools::document()`が成功する。リストされていないファイルに関するNOTEがない。

**失敗時：** 新しいRファイルが`Collate:`フィールドにアルファベット順でリストされており、新しいSuggestsパッケージがバージョン制約とともに正しくスペルされているか確認する。

### ステップ10: config.ymlの更新

`inst/config.yml`を編集する：

新しいタイプのデフォルトと制約を追加する：

```yaml
<type>:
  grid:
    default: [3, 3]
    min: [2, 2]
    max: [20, 20]
  size:
    default: [300, 300]
    min: [100, 100]
    max: [2000, 2000]
  tabsize:
    default: 20
    min: 5
    max: 50
  # タイプ固有のパラメータをここに追加
```

**期待結果：** 設定が有効なYAMLである。デフォルト値が`generate_puzzle()`で使用されたとき動作するパズルを生成する。

**失敗時：** `yaml::yaml.load_file("inst/config.yml")`でYAMLを検証する。デフォルトのgridとsize値が適切なパズルを生成するか確認する（小さすぎず大きすぎず）。

### ステップ11: Shinyアプリの拡張

`inst/shiny-app/app.R`を編集する：

1. UIタイプセレクターに新しいタイプを追加
2. タイプ固有パラメータの条件付きUIパネルを追加
3. サーバーサイドの生成ロジックを追加

**期待結果：** Shinyアプリのドロップダウンに新しいタイプが表示され、選択するとパズルが生成される。

**失敗時：** UIセレクターの`choices`引数にタイプが追加されており、タイプ固有パラメータの条件付きパネルが`conditionalPanel(condition = "input.type == '<type>'")`を使用し、サーバーサイドハンドラーが正しいパラメータを渡しているか確認する。

### ステップ12: テストスイートの作成

`tests/testthat/test-<type>-puzzles.R`を作成する：

```r
test_that("<type> puzzle generates correct piece count", { ... })
test_that("<type> puzzle respects seed reproducibility", { ... })
test_that("<type> adjacency returns valid neighbors", { ... })
test_that("<type> fusion merges pieces correctly", { ... })
test_that("<type> geom layer renders without error", { ... })
test_that("<type> SVG output is well-formed", { ... })
test_that("<type> config constraints are enforced", { ... })
```

タイプが外部パッケージを必要とする場合、テストを`skip_if_not_installed()`でラップする。

**期待結果：** すべてのテストがパスする。外部依存が欠落していない限りスキップはない。

**失敗時：** 各統合ポイントを個別にチェックする。最も一般的な問題はディスパッチケースの欠落である — `grep -rn "switch\|valid_types" R/`を実行してすべてのディスパッチ場所を見つける。

## バリデーション

- [ ] `generate_puzzle(type = "<type>")`が有効な出力を生成する
- [ ] 10のすべての統合ポイントが正しく接続されている
- [ ] `devtools::test()`が新しいテストでパスする
- [ ] `devtools::check()`が0エラー、0警告を返す
- [ ] Shinyアプリが新しいタイプをレンダリングする
- [ ] 設定制約が強制される（最小/最大バリデーション）
- [ ] 隣接関係とフュージョンが正しく動作する
- [ ] ggpuzzle geomレイヤーがエラーなくレンダリングされる
- [ ] `devtools::document()`が成功する（NAMESPACEが更新される）

## よくある落とし穴

- **ディスパッチケースの欠落**: 10以上のファイルのうち1つを忘れるとサイレントな失敗や「unknown type」エラーが発生する
- **負の数でのstrsplit**: `paste(a, b, sep = "-")`で隣接キーを作成する際、負のピースラベルが`"1--1"`のようなキーを生成する。代わりに`"|"`セパレータを使用し、`"\\|"`で分割する
- **出力に`cat()`を使用**: 常に`cli`パッケージのロギングラッパー（`log_info`、`log_warn`など）を使用する
- **Collate順**: DESCRIPTIONのCollateフィールドはアルファベット順または依存関係順でなければならない
- **Config.yml形式**: YAMLが有効か確認する。`yaml::yaml.load_file("inst/config.yml")`でテストする

## 関連スキル

- `generate-puzzle` — スキャフォールド後に新しいタイプをテストする
- `run-puzzle-tests` — 統合を検証するための完全なテストスイートを実行する
- `validate-piles-notation` — 新しいタイプでフュージョンをテストする
- `write-testthat-tests` — テスト記述の一般的なパターン
- `write-roxygen-docs` — 新しいgeom関数のドキュメントを作成する
