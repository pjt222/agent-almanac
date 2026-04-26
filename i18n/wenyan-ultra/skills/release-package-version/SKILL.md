---
name: release-package-version
locale: wenyan-ultra
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

# 發包版

行 R 包版發全週。

## 用

- 新版備發（除錯、新功、破變）
- CRAN 受後、建應 GitHub 發
- 設發後開版

## 入

- **必**：包有變備發
- **必**：發類：patch（0.1.0 → 0.1.1）、minor（0.1.0 → 0.2.0）、major（0.1.0 → 1.0.0）
- **可**：投 CRAN 乎（默否、用 `submit-to-cran` 別行）

## 行

### 一：定版升

循語義版：

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Bug fixes only | Patch | 0.1.0 -> 0.1.1 |
| New features (backward compatible) | Minor | 0.1.0 -> 0.2.0 |
| Breaking changes | Major | 0.1.0 -> 1.0.0 |

得：升類（patch、minor、major）按末發以來變定。

敗：未定→察 `git log` 自末標、各變分。任破 API 變需 major。

### 二：更版

```r
usethis::use_version("minor")  # or "patch" or "major"
```

此更 DESCRIPTION `Version` 並加標於 NEWS.md。

得：DESCRIPTION 版已更。NEWS.md 有新發版段標。

敗：`usethis::use_version()` 不可用→手更 DESCRIPTION `Version`、加 `# packagename x.y.z` 標於 NEWS.md。

### 三：更 NEWS.md

填發注於新版標下：

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

用問題/PR 號以追溯。

得：NEWS.md 含完用對變摘按類組、含問題/PR 號可溯。

敗：變難重構→用 `git log --oneline v<previous>..HEAD` 列末發來諸提交、分類之。

### 四：終察

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

得：`devtools::check()` 返 0 錯、0 警、0 注。拼察與 URL 察無患。

敗：發前修諸錯與警。加假陽詞於 `inst/WORDLIST` 為拼察。代斷 URL。

### 五：提交發

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

得：一提交含 DESCRIPTION 版升與 NEWS.md 更。

敗：他未提交變存→唯擇 DESCRIPTION 與 NEWS.md。發提交應唯含版相關變。

### 六：標發

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

得：注標 `v0.2.0` 建且推遠。`git tag -l` 顯標於本；`git ls-remote --tags origin` 確於遠。

敗：推敗→察有寫權。標已存→驗其指正提交以 `git show v0.2.0`。

### 七：建 GitHub 發

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

或用：

```r
usethis::use_github_release()
```

得：GitHub 發已建、發注見於庫 Releases 頁。

敗：`gh release create` 敗→確 `gh` CLI 已認（`gh auth status`）。`usethis::use_github_release()` 敗→於 GitHub 手建發。

### 八：設開版

發後升開版：

```r
usethis::use_dev_version()
```

此變版為 `0.2.0.9000` 表開。

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

得：DESCRIPTION 版今為 `0.2.0.9000`（開版）。NEWS.md 有新開版標。變已推遠。

敗：`usethis::use_dev_version()` 不可用→手變版為 `x.y.z.9000` 於 DESCRIPTION、加 `# packagename (development version)` 標於 NEWS.md。

## 驗

- [ ] DESCRIPTION 版合意發
- [ ] NEWS.md 有完正發注
- [ ] `R CMD check` 過
- [ ] Git 標合版（如 `v0.2.0`）
- [ ] GitHub 發存含發注
- [ ] 發後開版設（x.y.z.9000）

## 忌

- **忘推標**：`git push` 獨不推標。用 `--tags` 或 `git push origin v0.2.0`
- **NEWS.md 格**：用 markdown 標合 pkgdown/CRAN 期格
- **標誤提交**：常於版升提交*後*標、非前
- **CRAN 版已存**：CRAN 不受已發版。常升
- **發中含開版**：永勿投 `.9000` 版至 CRAN

## 參

- `submit-to-cran` - 版發後投 CRAN
- `create-github-release` - 通 GitHub 發建
- `setup-github-actions-ci` - 觸 pkgdown 重建於發
- `build-pkgdown-site` - 文站映新版
