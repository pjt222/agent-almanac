---
name: submit-to-cran
locale: wenyan
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

# 投於 CRAN

行 CRAN 投之全流——自前察至投。

## 用時

- 包備為 CRAN 之初發乃用
- 投既存 CRAN 包之新版乃用
- 接 CRAN 審者之回饋而再投乃用

## 入

- **必要**：本機 `R CMD check` 過 0 誤 0 警之 R 包
- **必要**：DESCRIPTION 中已新之版號
- **必要**：NEWS.md 已新此版之變
- **可選**：先 CRAN 審者之言（為再投）

## 法

### 第一步：察版與 NEWS

驗 DESCRIPTION 有正版：

```r
desc::desc_get_version()
```

驗 NEWS.md 有此版之條。條當總用者所見之變。

得：版合語意之則。NEWS.md 有合此版之條。

敗則：以 `usethis::use_version()` 更版（擇 "major"、"minor"、"patch"）。加 NEWS.md 條總用者所見之變。

### 第二步：本機 R CMD check

```r
devtools::check()
```

得：0 誤、0 警、0 注（新投可有 1 注：「New submission」）。

敗則：續前修諸誤與警。閱察日於 `<pkg>.Rcheck/00check.log`。注當於 cran-comments.md 釋之。

### 第三步：拼寫之察

```r
devtools::spell_check()
```

加正當之詞於 `inst/WORDLIST`（每詞一行，依字母序）。

得：無誤拼。諸警之詞或修或加於 `inst/WORDLIST`。

敗則：修真誤拼。正當之技術詞，加於 `inst/WORDLIST`（每詞一行，依字母序）。

### 第四步：URL 之察

```r
urlchecker::url_check()
```

得：諸 URL 返 HTTP 200。無斷或重定向之鏈。

敗則：替斷之 URL。DOI 用 `\doi{}` 而非裸 URL。除已不存之資源之鏈。

### 第五步：Win-Builder 之察

```r
devtools::check_win_devel()
devtools::check_win_release()
```

候郵之果（常 15-30 分）。

得：Win-builder release 與 devel 皆 0 誤 0 警。果於 15-30 分由郵至。

敗則：解臺特之患。常因：異編譯器之警、缺系依、路分隔之異。本機修而再投 Win-builder。

### 第六步：R-hub 之察

```r
rhub::rhub_check()
```

此察於多臺（Ubuntu、Windows、macOS）。

得：諸臺皆過，0 誤 0 警。

敗則：某臺敗，察 R-hub 之建日為臺特之誤。用 `testthat::skip_on_os()` 或條件碼為臺依之行。

### 第七步：備 cran-comments.md

於包根立或新 `cran-comments.md`：

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
- 何變（簡）
- 對前審者言之回應
- 反向依察之果（若適）

得：`cran-comments.md` 正總諸臺之察果而釋諸注。

敗則：若察果於諸臺異，書諸異。CRAN 審者將以己試驗此言。

### 第八步：終前察

```r
# One last check
devtools::check()

# Verify the built tarball
devtools::build()
```

得：終 `devtools::check()` 過淨。`.tar.gz` 之 tarball 建於父目。

敗則：若末刻有患，修之而自第二步重察。勿以已知敗投之。

### 第九步：投

```r
devtools::release()
```

此行交互之察而投。誠答諸問。

或於 https://cran.r-project.org/submit.html 手投，傳 tarball。

得：CRAN 之確認郵於分內至。點確認鏈以終投。

敗則：察郵以知拒因。常患：例太緩、缺 `\value`、不可移之碼。修而再投，於 cran-comments.md 注其變。

### 第十步：投後

接受後：

```r
# Tag the release
usethis::use_github_release()

# Bump to development version
usethis::use_dev_version()
```

得：GitHub 發以接之版標立。DESCRIPTION 升至開發之版（`x.y.z.9000`）。

敗則：若 GitHub 發敗，以 `gh release create` 手立。若 CRAN 接遲，候確認郵而後標。

## 驗

- [ ] `R CMD check` 本機返 0 誤 0 警
- [ ] Win-builder 過（release + devel）
- [ ] R-hub 過諸試臺
- [ ] `cran-comments.md` 正述察果
- [ ] 諸 URL 有效
- [ ] 無拼誤
- [ ] 版號正而已增
- [ ] NEWS.md 為新
- [ ] DESCRIPTION 之資全而正

## 陷

- **例太緩**：以 `\donttest{}` 包貴例。CRAN 限時。
- **非標之文件名**：避致 CRAN 注之文件（察 `.Rbuildignore`）
- **文檔缺 `\value`**：諸出函須 `@return` 標
- **vignette 建敗**：確 vignettes 於淨境（無爾 `.Renviron`）建之
- **DESCRIPTION Title 之格**：必標題式，末無句號，無「A Package for...」
- **忘反向依之察**：更時行 `revdepcheck::revdep_check()`

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

- `release-package-version` — 版升與 git 標
- `write-roxygen-docs` — 確文檔合 CRAN 之標
- `setup-github-actions-ci` — 鏡 CRAN 期之 CI 察
- `build-pkgdown-site` — 接受之包之文站
