---
name: submit-to-cran
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Complete procedure for submitting an R package to CRAN, including
  pre-submission checks (local, win-builder, R-hub), cran-comments.md
  preparation, URL and spell checking, and the submission itself.
  Covers first submissions and updates. Use when a package is ready for
  initial CRAN release, when submitting an updated version of an existing
  CRAN package, or when re-submitting after receiving CRAN reviewer feedback.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: advanced
  language: R
  tags: r, cran, submission, release, publishing
---

# 投 CRAN

行全 CRAN 投流——自前察至投。

## 用

- 包備首投 CRAN→用
- 投既存 CRAN 包之更版→用
- 受 CRAN 審反饋後重投→用

## 入

- **必**：本地 `R CMD check` 0 誤 0 警之 R 包
- **必**：DESCRIPTION 更版號
- **必**：NEWS.md 更含此版改
- **可**：前 CRAN 審註（重投時）

## 行

### 一：版與 NEWS 察

驗 DESCRIPTION 版正：

```r
desc::desc_get_version()
```

驗 NEWS.md 有此版項。項當總用面之改。

得：版合語意。NEWS.md 含配項。

敗：以 `usethis::use_version()` 更版（擇 "major"、"minor"、"patch"）。加 NEWS.md 項總用面之改。

### 二：本地 R CMD check

```r
devtools::check()
```

得：0 誤、0 警、0 注（首投可 1 注「New submission」）。

敗：諸誤警先正乃進。讀 `<pkg>.Rcheck/00check.log` 詳。注於 cran-comments.md 釋。

### 三：拼察

```r
devtools::spell_check()
```

正詞加 `inst/WORDLIST`（一行一詞、字母序）。

得：無異拼。諸標詞或正或加 `inst/WORDLIST`。

敗：正真拼誤。正技詞加 `inst/WORDLIST`（一行一詞、字母序）。

### 四：URL 察

```r
urlchecker::url_check()
```

得：諸 URL 返 HTTP 200。無斷或重定向。

敗：換斷 URL。DOI 用 `\doi{}` 而非原 URL。除已不存資。

### 五：Win-Builder 察

```r
devtools::check_win_devel()
devtools::check_win_release()
```

待郵果（常 15-30 分）。

得：Win-builder release 與 devel 皆 0 誤 0 警。果於 15-30 分內郵至。

敗：理臺特問。常因：異編譯警、缺系依、路分隔差。本地正而再投 Win-builder。

### 六：R-hub 察

```r
rhub::rhub_check()
```

此察多臺（Ubuntu、Windows、macOS）。

得：諸臺皆過 0 誤 0 警。

敗：某臺敗→察 R-hub 構日為臺特誤。為臺依為用 `testthat::skip_on_os()` 或條件碼。

### 七：備 cran-comments.md

於包根建或更 `cran-comments.md`：

```markdown
## R CMD check results
0 errors | 0 warnings | 1 note

* This is a new release.

## Test environments
* local: Windows 11, R 4.5.0
* win-builder: R-release, R-devel
* R-hub: ubuntu-latest (R-release), windows-latest (R-release), macos-latest (R-release)

## Downstream dependencies
There are currently no downstream dependencies for this package.
```

更時含：
- 何改（簡）
- 答前審反饋
- 反依察果若可

得：`cran-comments.md` 準總諸臺察果與釋諸注。

敗：察果跨臺異→文諸異。CRAN 審將比此於己測。

### 八：末前察

```r
# One last check
devtools::check()

# Verify the built tarball
devtools::build()
```

得：末 `devtools::check()` 清過。`.tar.gz` 構於父目。

敗：末刻問現→正之、自步二再行諸察。勿以知敗投。

### 九：投

```r
devtools::release()
```

此行交互察而投。誠答諸問。

或於 https://cran.r-project.org/submit.html 手投上傳 tarball。

得：CRAN 確郵分內至。點確接以定投。

敗：察郵拒因。常因：例過緩、缺 `\value` 標、不可移碼。正而再投、於 cran-comments.md 記何改。

### 十：投後

受後：

```r
# Tag the release
usethis::use_github_release()

# Bump to development version
usethis::use_dev_version()
```

得：GitHub 發以受版標建。DESCRIPTION 升至開發版（`x.y.z.9000`）。

敗：GitHub 發敗→以 `gh release create` 手建。CRAN 受延→待確郵乃標。

## 驗

- [ ] `R CMD check` 本地返 0 誤 0 警
- [ ] Win-builder 過（release + devel）
- [ ] R-hub 諸測臺皆過
- [ ] `cran-comments.md` 準述察果
- [ ] 諸 URL 效
- [ ] 無拼誤
- [ ] 版號正而增
- [ ] NEWS.md 即時
- [ ] DESCRIPTION 元全準

## 忌

- **例過緩**：耗例裹 `\donttest{}`。CRAN 強時限
- **非標檔/目名**：避致 CRAN 注之檔（察 `.Rbuildignore`）
- **文缺 `\value`**：諸出函需 `@return` 標
- **vignette 構敗**：確 vignette 於清境構而無 `.Renviron`
- **DESCRIPTION 題式**：必 Title Case、末無點、無「A Package for...」
- **忘反依察**：更時行 `revdepcheck::revdep_check()`

## 例

```r
# Full pre-submission workflow
devtools::spell_check()
urlchecker::url_check()
devtools::check()
devtools::check_win_devel()
rhub::rhub_check()
# Wait for results...
devtools::release()
```

## 參

- `release-package-version` - 版升與 git 標
- `write-roxygen-docs` - 確文合 CRAN 標
- `setup-github-actions-ci` - CI 察反 CRAN 期
- `build-pkgdown-site` - 受包文站
