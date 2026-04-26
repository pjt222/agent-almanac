---
name: release-package-version
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Release a new version of an R package including version bumping,
  NEWS.md updates, git tagging, GitHub release creation, and
  post-release development version setup. Use when a package is ready
  for a new patch, minor, or major release, after CRAN acceptance to
  create the corresponding GitHub release, or when setting up the
  development version bump immediately after a release.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, versioning, release, git-tags, changelog
---

# 發布套件版本

執行 R 套件之完整版本發布週期。

## 適用時機

- 已備發布新版本（修錯、功能或破壞性變更）
- CRAN 接受之後，建立對應之 GitHub 發布
- 設置發布後之開發版本

## 輸入

- **必要**：含已備發布變更之套件
- **必要**：發布類型：patch（0.1.0 -> 0.1.1）、minor（0.1.0 -> 0.2.0）或 major（0.1.0 -> 1.0.0）
- **選擇性**：是否提交 CRAN（預設：否，宜獨用 `submit-to-cran` 技能）

## 步驟

### 步驟一：定版本變更

依語意化版本：

| 變更類型 | 版本變更 | 例 |
|---------|---------|-----|
| 僅修錯 | Patch | 0.1.0 -> 0.1.1 |
| 新功能（向後相容） | Minor | 0.1.0 -> 0.2.0 |
| 破壞性變更 | Major | 0.1.0 -> 1.0.0 |

**預期：** 依上次發布以來變更之性質，確定正確之變更類型（patch、minor 或 major）。

**失敗時：** 若不確，檢視上次標籤以來之 `git log` 並對每變更分類。任何破壞性 API 變更皆須 major 變更。

### 步驟二：更新版本

```r
usethis::use_version("minor")  # or "patch" or "major"
```

此將更新 DESCRIPTION 中之 `Version` 欄並於 NEWS.md 加標題。

**預期：** DESCRIPTION 之版本已更新。NEWS.md 有發布版本之新段標題。

**失敗時：** 若 `usethis::use_version()` 不可用，手動更新 DESCRIPTION 之 `Version` 欄並加 `# packagename x.y.z` 標題至 NEWS.md。

### 步驟三：更新 NEWS.md

於新版本標題下填入發布筆記：

```markdown
# packagename 0.2.0

## New Features
- Added `new_function()` for processing data (#42)
- Support for custom themes in `plot_results()` (#45)

## Bug Fixes
- Fixed crash when input contains all NAs (#38)
- Corrected off-by-one error in `window_calc()` (#41)

## Minor Improvements
- Improved error messages for invalid input types
- Updated documentation examples
```

用議題／PR 編號以資追蹤。

**預期：** NEWS.md 含按類組織之面向用戶變更之完整摘要，附議題／PR 編號以資追蹤。

**失敗時：** 若變更難以重建，用 `git log --oneline v<previous>..HEAD` 列上次發布以來之所有提交並分類之。

### 步驟四：最終檢查

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

**預期：** `devtools::check()` 返 0 錯誤、0 警告、0 注。拼寫檢查與 URL 檢查無問題。

**失敗時：** 發布前修所有錯誤與警告。將誤報詞加入 `inst/WORDLIST` 供拼寫檢查器。替換失效之 URL。

### 步驟五：提交發布

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

**預期：** 含 DESCRIPTION 之版本變更與更新後 NEWS.md 之單一提交。

**失敗時：** 若有他未提交變更，僅暫存 DESCRIPTION 與 NEWS.md。發布提交應僅含版本相關變更。

### 步驟六：標記發布

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

**預期：** 註解標籤 `v0.2.0` 已建並推至遠端。`git tag -l` 於本地顯示標籤；`git ls-remote --tags origin` 於遠端確認之。

**失敗時：** 若推送失敗，檢查是否有寫入權。若標籤已存在，以 `git show v0.2.0` 確認其指向正確提交。

### 步驟七：建立 GitHub 發布

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

或用：

```r
usethis::use_github_release()
```

**預期：** GitHub 發布已建，發布筆記可見於倉庫之 Releases 頁。

**失敗時：** 若 `gh release create` 失敗，確認 `gh` CLI 已認證（`gh auth status`）。若 `usethis::use_github_release()` 失敗，於 GitHub 手動建發布。

### 步驟八：設開發版本

發布後，變更至開發版本：

```r
usethis::use_dev_version()
```

此將版本改為 `0.2.0.9000` 表示開發中。

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

**預期：** DESCRIPTION 之版本現為 `0.2.0.9000`（開發版本）。NEWS.md 有開發版本之新標題。變更已推至遠端。

**失敗時：** 若 `usethis::use_dev_version()` 不可用，手動將版本改為 DESCRIPTION 中之 `x.y.z.9000` 並加 `# packagename (development version)` 標題至 NEWS.md。

## 驗證

- [ ] DESCRIPTION 中之版本與擬發布相符
- [ ] NEWS.md 有完整準確之發布筆記
- [ ] `R CMD check` 通過
- [ ] Git 標籤與版本相符（如 `v0.2.0`）
- [ ] GitHub 發布已存在，附發布筆記
- [ ] 發布後開發版本已設（x.y.z.9000）

## 常見陷阱

- **遺忘推送標籤**：`git push` 單獨不推標籤。用 `--tags` 或 `git push origin v0.2.0`
- **NEWS.md 格式**：用合 pkgdown／CRAN 預期格式之 markdown 標題
- **標錯提交**：務於版本變更提交之後標籤，勿之前
- **CRAN 版本已存在**：CRAN 不接受已發布之版本。務遞增
- **開發版本入發布**：永勿提交 `.9000` 版本至 CRAN

## 相關技能

- `submit-to-cran` — 版本發布後 CRAN 之提交
- `create-github-release` — 通用 GitHub 發布建立
- `setup-github-actions-ci` — 發布時觸發 pkgdown 重建
- `build-pkgdown-site` — 文件站反映新版本
