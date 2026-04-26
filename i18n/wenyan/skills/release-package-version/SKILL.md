---
name: release-package-version
locale: wenyan
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

# 釋包之版

行 R 包之全版釋之循環。

## 用時

- 已備釋新版（修訛、增功、破變）乃用
- CRAN 受後立對應之 GitHub 釋乃用
- 釋後立設發之版乃用

## 入

- **必要**：包附已備釋之變
- **必要**：釋類：修（0.1.0 -> 0.1.1）、次（0.1.0 -> 0.2.0）、主（0.1.0 -> 1.0.0）
- **可選**：是否投 CRAN（默：否，獨用 `submit-to-cran` 技）

## 法

### 第一步：定版升

循語意之版：

| 變類 | 版升 | 例 |
|-------------|-------------|---------|
| 唯修訛 | 修 | 0.1.0 -> 0.1.1 |
| 新功（向後相容） | 次 | 0.1.0 -> 0.2.0 |
| 破變 | 主 | 0.1.0 -> 1.0.0 |

得：依自前釋來變之性，定正升類（修、次、主）。

敗則：若不確，閱 `git log` 自前標而分各變。任何破 API 之變需主升。

### 第二步：更版

```r
usethis::use_version("minor")  # or "patch" or "major"
```

此更 DESCRIPTION 中 `Version` 之欄並加首於 NEWS.md。

得：DESCRIPTION 之版已更。NEWS.md 有釋版之新段首。

敗則：若 `usethis::use_version()` 不可得，手更 DESCRIPTION 之 `Version` 欄並加 `# packagename x.y.z` 首於 NEWS.md。

### 第三步：更 NEWS.md

於新版首下填釋之記：

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

用問題/PR 號以資追溯。

得：NEWS.md 含對用者所見之變之全摘，以類組之，附問題/PR 號以資追。

敗則：若變難復，用 `git log --oneline v<previous>..HEAD` 列自前釋之諸提交而分之。

### 第四步：終察

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

得：`devtools::check()` 返 0 誤、0 警、0 注。拼察與 URL 察無患。

敗則：釋前修諸誤與警。加假陽詞於 `inst/WORDLIST` 供拼察。代斷 URL。

### 第五步：提交釋

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

得：單提交含 DESCRIPTION 之版升與更之 NEWS.md。

敗則：若有他未提之變，獨入 DESCRIPTION 與 NEWS.md。釋之提交宜獨含版相關之變。

### 第六步：標其釋

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

得：注解之標 `v0.2.0` 已立並推至遠端。`git tag -l` 示其於本地；`git ls-remote --tags origin` 確之於遠。

敗則：若推敗，察是否有書之權。若標已存，以 `git show v0.2.0` 驗其指正提交。

### 第七步：立 GitHub 之釋

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

或用：

```r
usethis::use_github_release()
```

得：GitHub 之釋已立，釋之記現於庫之 Releases 頁。

敗則：若 `gh release create` 敗，確 `gh` CLI 已認證（`gh auth status`）。若 `usethis::use_github_release()` 敗，於 GitHub 手立其釋。

### 第八步：設發之版

釋後升至發之版：

```r
usethis::use_dev_version()
```

此化版為 `0.2.0.9000` 表發中。

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

得：DESCRIPTION 之版今為 `0.2.0.9000`（發版）。NEWS.md 有發版之新首。變已推至遠端。

敗則：若 `usethis::use_dev_version()` 不可得，手化版為 `x.y.z.9000` 於 DESCRIPTION 並加 `# packagename (development version)` 首於 NEWS.md。

## 驗

- [ ] DESCRIPTION 之版合所欲釋
- [ ] NEWS.md 有全且確之釋記
- [ ] `R CMD check` 過
- [ ] git 標合版（如 `v0.2.0`）
- [ ] GitHub 之釋存附釋之記
- [ ] 釋後發版已設（x.y.z.9000）

## 陷

- **忘推標**：獨 `git push` 不推標。用 `--tags` 或 `git push origin v0.2.0`
- **NEWS.md 之式**：用 markdown 之首合 pkgdown/CRAN 望之式
- **標誤提交**：必於版升提交後標，非前
- **CRAN 版已存**：CRAN 不受已示之版。必增之
- **釋中之發版**：永勿投 `.9000` 版於 CRAN

## 參

- `submit-to-cran` — 版釋後投 CRAN
- `create-github-release` — 通用 GitHub 釋之立
- `setup-github-actions-ci` — 釋觸 pkgdown 之重建
- `build-pkgdown-site` — 文站映新版
