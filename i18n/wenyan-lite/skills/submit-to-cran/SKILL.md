---
name: submit-to-cran
locale: wenyan-lite
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

# 提交至 CRAN

執行完整 CRAN 提交流程，自起飛前檢查至提交。

## 適用時機

- 套件已備好初次 CRAN 發布
- 提交既有 CRAN 套件之更新版
- 收 CRAN 審查者回饋後重新提交

## 輸入

- **必要**：通過本機 `R CMD check` 之 R 套件，0 錯誤、0 警告
- **必要**：DESCRIPTION 中之版本號已更新
- **必要**：NEWS.md 含此版本之變更
- **選擇性**：先前 CRAN 審查者意見（重新提交時）

## 步驟

### 步驟一：版本與 NEWS 檢查

驗 DESCRIPTION 含正確版本：

```r
desc::desc_get_version()
```

驗 NEWS.md 有此版本之條目。條目應總結用戶可見之變更。

**預期：** 版本遵循語義化版本控制。NEWS.md 含此版本之對應條目。

**失敗時：** 用 `usethis::use_version()` 更版本（擇「major」、「minor」或「patch」）。為 NEWS.md 加總結用戶可見變更之條目。

### 步驟二：本機 R CMD Check

```r
devtools::check()
```

**預期：** 0 錯誤、0 警告、0 註記（新提交可接受 1 註記：「New submission」）。

**失敗時：** 進行前修復所有錯誤與警告。閱讀 `<pkg>.Rcheck/00check.log` 之檢查日誌以了解詳情。註記應於 cran-comments.md 中說明。

### 步驟三：拼字檢查

```r
devtools::spell_check()
```

將合理之詞加入 `inst/WORDLIST`（一行一詞、字母序排）。

**預期：** 無意外拼字錯。所有標出之詞已修正或加入 `inst/WORDLIST`。

**失敗時：** 修真正之拼字錯。對合理之技術術語，加入 `inst/WORDLIST`（一行一詞、字母序排）。

### 步驟四：URL 檢查

```r
urlchecker::url_check()
```

**預期：** 所有 URL 回 HTTP 200。無損壞或重定向之連結。

**失敗時：** 替換損壞 URL。對 DOI 連結用 `\doi{}` 而非生 URL。移除已不存在之資源連結。

### 步驟五：Win-Builder 檢查

```r
devtools::check_win_devel()
devtools::check_win_release()
```

待郵件結果（通常 15-30 分鐘）。

**預期：** Win-builder release 與 devel 上 0 錯誤、0 警告。結果於 15-30 分鐘內以郵件抵達。

**失敗時：** 處理平台特有問題。常見因：不同編譯器警告、缺系統依賴、路徑分隔符差異。本機修復並重提至 Win-builder。

### 步驟六：R-hub 檢查

```r
rhub::rhub_check()
```

此於多平台檢查（Ubuntu、Windows、macOS）。

**預期：** 所有平台以 0 錯誤、0 警告通過。

**失敗時：** 若某平台失敗，檢 R-hub 建置日誌找平台特有錯。對平台依賴行為用 `testthat::skip_on_os()` 或條件碼。

### 步驟七：準備 cran-comments.md

於套件根建立或更新 `cran-comments.md`：

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

對更新，含：
- 變更為何（簡述）
- 對任何先前審查者回饋之回應
- 反向依賴檢查結果（如適用）

**預期：** `cran-comments.md` 準確總結跨所有測試環境之檢查結果並說明任何註記。

**失敗時：** 若檢查結果於平台間差，記錄所有差異。CRAN 審查者將以其自身測試核驗此等聲明。

### 步驟八：最終起飛前

```r
# One last check
devtools::check()

# Verify the built tarball
devtools::build()
```

**預期：** 最終 `devtools::check()` 乾淨通過。`.tar.gz` tarball 於父目錄建成。

**失敗時：** 若末刻問題現，修之並自步驟二重跑所有檢查。勿以已知失敗提交。

### 步驟九：提交

```r
devtools::release()
```

此跑互動式檢查並提交。誠實答所有問題。

或於 https://cran.r-project.org/submit.html 手動上傳 tarball 提交。

**預期：** CRAN 之確認郵件數分鐘內抵。點確認連結以完成提交。

**失敗時：** 檢郵件以求拒因。常見問題：例執行過慢、缺 `\value` 標籤、不可移植之代碼。修問題並重提，於 cran-comments.md 中註明變更。

### 步驟十：提交後

接受後：

```r
# Tag the release
usethis::use_github_release()

# Bump to development version
usethis::use_dev_version()
```

**預期：** GitHub 發布以接受版本之標籤建立。DESCRIPTION 升至開發版本（`x.y.z.9000`）。

**失敗時：** 若 GitHub 發布失敗，以 `gh release create` 手動建立。若 CRAN 接受延遲，待確認郵件再標籤。

## 驗證

- [ ] 本機 `R CMD check` 回 0 錯誤、0 警告
- [ ] Win-builder 通過（release + devel）
- [ ] R-hub 於所有測試平台通過
- [ ] `cran-comments.md` 準確描述檢查結果
- [ ] 所有 URL 有效
- [ ] 無拼字錯
- [ ] 版本號正確且已遞增
- [ ] NEWS.md 已更新
- [ ] DESCRIPTION 元資料完整且正確

## 常見陷阱

- **例執行過慢**：將昂貴之例包入 `\donttest{}`。CRAN 強制時間限制。
- **非標準檔／目錄名**：避免會觸發 CRAN 註記之檔（檢 `.Rbuildignore`）
- **文件缺 `\value`**：所有匯出函式需 `@return` 標籤
- **vignette 建置失敗**：確保 vignettes 於無你 `.Renviron` 之乾淨環境中建置
- **DESCRIPTION Title 格式**：須為 Title Case、結尾無句點、無「A Package for...」
- **遺忘反向依賴檢查**：對更新，跑 `revdepcheck::revdep_check()`

## 範例

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

## 相關技能

- `release-package-version` — 版本升級與 git 標籤
- `write-roxygen-docs` — 確保文件符合 CRAN 標準
- `setup-github-actions-ci` — 鏡像 CRAN 期望之 CI 檢查
- `build-pkgdown-site` — 已接受套件之文件站
