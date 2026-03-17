---
name: add-rcpp-integration
description: >
  高性能C++コードのためにRcppまたはRcppArmadilloをRパッケージに統合する。
  セットアップ、C++関数の記述、RcppExportsの生成、コンパイル済みコードのテスト、
  デバッグを網羅。プロファイリングでボトルネックが確認されたR関数が遅すぎる場合、
  既存のC/C++ライブラリとのインターフェースが必要な場合、またはコンパイル済みコードが
  有利なアルゴリズム（ループ、再帰、線形代数）を実装する時に使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: advanced
  language: R
  tags: r, rcpp, cpp, performance, compiled-code
---

# Rcpp統合の追加

パフォーマンスが重要な処理にRcppを使用してRパッケージにC++コードを統合する。

## 使用タイミング

- プロファイリングでボトルネックが確認されたR関数が遅すぎる時
- 既存のC/C++ライブラリとのインターフェースが必要な時
- コンパイル済みコードが有利なアルゴリズムを実装する時（ループ、再帰）
- 線形代数演算にRcppArmadilloを追加する時

## 入力

- **必須**: 既存のRパッケージ
- **必須**: C++で置き換えるまたは補完するR関数
- **任意**: インターフェースする外部C++ライブラリ
- **任意**: RcppArmadilloを使用するかどうか（デフォルト：プレーンRcpp）

## 手順

### ステップ1: Rcppインフラのセットアップ

```r
usethis::use_rcpp()
```

これにより：
- `src/`ディレクトリが作成される
- DESCRIPTIONのLinkingToとImportsに`Rcpp`が追加される
- `R/packagename-package.R`に`@useDynLib`と`@importFrom Rcpp sourceCpp`が作成される
- コンパイル済みファイル用に`.gitignore`が更新される

RcppArmadilloの場合：

```r
usethis::use_rcpp_armadillo()
```

**期待結果：** `src/`ディレクトリが作成される。DESCRIPTIONのLinkingToとImportsに`Rcpp`が追加される。`R/packagename-package.R`に`@useDynLib`ディレクティブが含まれる。

**失敗時：** `usethis::use_rcpp()`が失敗する場合、手動で`src/`を作成し、DESCRIPTIONに`LinkingTo: Rcpp`と`Imports: Rcpp`を追加し、パッケージレベルのドキュメントファイルに`#' @useDynLib packagename, .registration = TRUE`と`#' @importFrom Rcpp sourceCpp`を追加する。

### ステップ2: C++関数の記述

`src/my_function.cpp`を作成する：

```cpp
#include <Rcpp.h>
using namespace Rcpp;

//' Compute cumulative sum efficiently
//'
//' @param x A numeric vector
//' @return A numeric vector of cumulative sums
//' @export
// [[Rcpp::export]]
NumericVector cumsum_cpp(NumericVector x) {
  int n = x.size();
  NumericVector out(n);
  out[0] = x[0];
  for (int i = 1; i < n; i++) {
    out[i] = out[i - 1] + x[i];
  }
  return out;
}
```

RcppArmadilloの場合：

```cpp
#include <RcppArmadillo.h>
// [[Rcpp::depends(RcppArmadillo)]]

//' Matrix multiplication using Armadillo
//'
//' @param A A numeric matrix
//' @param B A numeric matrix
//' @return The matrix product A * B
//' @export
// [[Rcpp::export]]
arma::mat mat_mult(const arma::mat& A, const arma::mat& B) {
  return A * B;
}
```

**期待結果：** `src/my_function.cpp`に有効な`// [[Rcpp::export]]`アノテーションとroxygen形式の`//'`ドキュメントコメントを持つC++ソースファイルが存在する。

**失敗時：** ファイルが`#include <Rcpp.h>`（Armadilloの場合は`<RcppArmadillo.h>`）を使用していること、エクスポートアノテーションが関数シグネチャの直上の独立した行にあること、戻り値の型が有効なRcpp型にマップされることを確認する。

### ステップ3: RcppExportsの生成

```r
Rcpp::compileAttributes()
devtools::document()
```

**期待結果：** `R/RcppExports.R`と`src/RcppExports.cpp`が自動的に生成される。

**失敗時：** C++の構文エラーを確認する。エクスポートされる各関数の上に`// [[Rcpp::export]]`タグが存在することを確認する。

### ステップ4: コンパイルの確認

```r
devtools::load_all()
```

**期待結果：** パッケージがエラーなくコンパイルされて読み込まれる。

**失敗時：** コンパイラ出力のエラーを確認する。一般的な問題：
- システムヘッダの欠如：開発ライブラリをインストールする
- 構文エラー：C++コンパイラのメッセージが行を指示する
- RcppArmadilloの`Rcpp::depends`属性の欠如

### ステップ5: コンパイル済みコードのテスト

```r
test_that("cumsum_cpp matches base R", {
  x <- c(1, 2, 3, 4, 5)
  expect_equal(cumsum_cpp(x), cumsum(x))
})

test_that("cumsum_cpp handles edge cases", {
  expect_equal(cumsum_cpp(numeric(0)), numeric(0))
  expect_equal(cumsum_cpp(c(NA_real_, 1)), c(NA_real_, NA_real_))
})
```

**期待結果：** テストがパスし、C++関数がR相当の結果と同一の結果を生成し、エッジケース（空のベクトル、NA値）を正しく処理することが確認される。

**失敗時：** NAの処理でテストが失敗する場合、C++コードで`NumericVector::is_na()`を使用した明示的なNAチェックを追加する。空の入力でテストが失敗する場合、関数の先頭にゼロ長ベクトルに対するガード条件を追加する。

### ステップ6: クリーンアップスクリプトの追加

`src/Makevars`を作成する：

```makefile
PKG_CXXFLAGS = -O2
```

パッケージルートに`cleanup`を作成する（CRAN用）：

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

実行可能にする：`chmod +x cleanup`

**期待結果：** `src/Makevars`がコンパイラフラグを設定し、`cleanup`スクリプトがコンパイル済みオブジェクトを削除する。両ファイルがパッケージルートレベルに存在する。

**失敗時：** `cleanup`に実行権限があることを確認する（`chmod +x cleanup`）。Makefileスタイルのルールを追加する場合、`Makevars`がインデントにスペースではなくタブを使用していることを確認する。

### ステップ7: .Rbuildignoreの更新

コンパイル済みアーティファクトが処理されていることを確認する：

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**期待結果：** `.Rbuildignore`パターンが、ソースファイルとMakevarsを保持しながら、パッケージtarballにコンパイル済みオブジェクトファイルが含まれないようにする。

**失敗時：** `devtools::check()`を実行して`src/`内の予期しないファイルに関するNOTEを確認する。`.o`、`.so`、`.dll`ファイルのみを除外するように`.Rbuildignore`パターンを調整する。

## バリデーション

- [ ] `devtools::load_all()`が警告なくコンパイルされる
- [ ] コンパイル済み関数が正しい結果を生成する
- [ ] エッジケースのテストがパスする（NA、空の入力、大きな入力）
- [ ] `R CMD check`がコンパイル警告なしでパスする
- [ ] RcppExportsファイルが生成されてコミットされている
- [ ] ベンチマークでパフォーマンス向上が確認される

## よくある落とし穴

- **`compileAttributes()`の忘れ**: C++ファイルを変更した後はRcppExportsを再生成しなければならない
- **整数オーバーフロー**: 大きな数値には`int`ではなく`double`を使用する
- **メモリ管理**: RcppはRcpp型のメモリを自動的に処理する；手動で`delete`しないこと
- **NAの処理**: C++はRのNAを認識しない。`Rcpp::NumericVector::is_na()`でチェックする
- **プラットフォームの移植性**: プラットフォーム固有のC++機能を避ける。Windows、macOS、Linuxでテストする
- **`@useDynLib`の欠如**: パッケージレベルのドキュメントには`@useDynLib packagename, .registration = TRUE`が必要

## 関連スキル

- `create-r-package` - Rcpp追加前のパッケージセットアップ
- `write-testthat-tests` - コンパイル済み関数のテスト
- `setup-github-actions-ci` - CIにはC++ツールチェーンが必要
- `submit-to-cran` - コンパイル済みパッケージはCRANの追加チェックが必要
