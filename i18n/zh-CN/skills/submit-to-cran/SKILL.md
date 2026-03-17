---
name: submit-to-cran
description: >
  将 R 包提交至 CRAN 的完整流程，包括提交前检查（本地、win-builder、
  R-hub）、cran-comments.md 准备、URL 与拼写检查，以及提交操作本身。
  涵盖首次提交与更新提交。适用于准备首次发布至 CRAN、提交已有 CRAN 包的
  更新版本，或在收到 CRAN 审核反馈后重新提交的场景。
locale: zh-CN
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
  tags: r, cran, submission, release, publishing
---

# 提交至 CRAN

执行完整的 CRAN 提交工作流，从预检查到正式提交。

## 适用场景

- 软件包已准备好首次发布至 CRAN
- 提交已有 CRAN 包的更新版本
- 收到 CRAN 审核反馈后重新提交

## 输入

- **必需**：R 包在本地 `R CMD check` 中通过，零错误、零警告
- **必需**：DESCRIPTION 中已更新版本号
- **必需**：NEWS.md 已包含本版本的变更记录
- **可选**：CRAN 审核人员的历史意见（用于重新提交）

## 步骤

### 第 1 步：版本与 NEWS 检查

确认 DESCRIPTION 中的版本号正确：

```r
desc::desc_get_version()
```

确认 NEWS.md 包含本版本的条目，条目应概括面向用户的变更内容。

**预期结果：** 版本号遵循语义化版本规范。NEWS.md 有与本版本匹配的条目。

**失败处理：** 使用 `usethis::use_version()`（选择 "major"、"minor" 或 "patch"）更新版本号。在 NEWS.md 中添加概述面向用户变更的条目。

### 第 2 步：本地 R CMD Check

```r
devtools::check()
```

**预期结果：** 0 个错误、0 个警告、0 个注记（首次提交时 1 个注记"New submission"可接受）。

**失败处理：** 继续之前修复所有错误和警告。查阅 `<pkg>.Rcheck/00check.log` 获取详情。在 cran-comments.md 中说明各项注记。

### 第 3 步：拼写检查

```r
devtools::spell_check()
```

将合法单词添加至 `inst/WORDLIST`（每行一个，按字母排序）。

**预期结果：** 无意外拼写错误。所有被标记的词已被更正或添加至 `inst/WORDLIST`。

**失败处理：** 修正真正的拼写错误。对于合法的技术术语，将其添加至 `inst/WORDLIST`（每行一个，按字母排序）。

### 第 4 步：URL 检查

```r
urlchecker::url_check()
```

**预期结果：** 所有 URL 返回 HTTP 200。无失效或被重定向的链接。

**失败处理：** 替换失效的 URL。对 DOI 链接使用 `\doi{}` 而非裸 URL。删除指向已不存在资源的链接。

### 第 5 步：Win-Builder 检查

```r
devtools::check_win_devel()
devtools::check_win_release()
```

等待邮件返回结果（通常需 15–30 分钟）。

**预期结果：** Win-builder release 和 devel 均为 0 个错误、0 个警告。结果在 15–30 分钟内通过邮件送达。

**失败处理：** 处理平台特定问题。常见原因：不同编译器警告、缺少系统依赖、路径分隔符差异。在本地修复后重新提交至 Win-builder。

### 第 6 步：R-hub 检查

```r
rhub::rhub_check()
```

此步骤在多个平台（Ubuntu、Windows、macOS）上进行检查。

**预期结果：** 所有平台通过，0 个错误、0 个警告。

**失败处理：** 若某特定平台失败，查看 R-hub 构建日志中的平台特定错误。对平台相关行为使用 `testthat::skip_on_os()` 或条件代码。

### 第 7 步：准备 cran-comments.md

在包根目录创建或更新 `cran-comments.md`：

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

对于更新提交，应包括：
- 变更概述（简要）
- 对此前审核人员反馈的回应
- 若适用，提供反向依赖检查结果

**预期结果：** `cran-comments.md` 准确概述所有测试环境的检查结果，并对各项注记作出说明。

**失败处理：** 若不同平台检查结果存在差异，记录所有差异。CRAN 审核人员会对照自己的测试来核实这些信息。

### 第 8 步：最终预检

```r
# 最后一次检查
devtools::check()

# 验证构建的 tarball
devtools::build()
```

**预期结果：** 最终 `devtools::check()` 通过且无异常。在上级目录中生成 `.tar.gz` 压缩包。

**失败处理：** 若最后时刻出现问题，修复后从第 2 步重新执行所有检查。存在已知失败时不得提交。

### 第 9 步：提交

```r
devtools::release()
```

此命令运行交互式检查并执行提交。如实回答所有问题。

也可手动提交：访问 https://cran.r-project.org/submit.html 上传 tarball 文件。

**预期结果：** 几分钟内收到 CRAN 确认邮件。点击邮件中的确认链接完成提交。

**失败处理：** 查看邮件中的拒绝原因。常见问题：示例运行过慢、缺少 `\value` 标签、代码不可移植。修复问题后重新提交，并在 cran-comments.md 中说明所做更改。

### 第 10 步：提交后处理

获得接受后：

```r
# 打标签创建发布版本
usethis::use_github_release()

# 切换至开发版本
usethis::use_dev_version()
```

**预期结果：** GitHub release 以已接受版本的标签创建。DESCRIPTION 已切换至开发版本（`x.y.z.9000`）。

**失败处理：** 若 GitHub release 创建失败，使用 `gh release create` 手动创建。若 CRAN 接受有延迟，等待确认邮件后再打标签。

## 验证清单

- [ ] `R CMD check` 在本地机器上返回 0 个错误、0 个警告
- [ ] Win-builder 通过（release + devel）
- [ ] R-hub 在所有测试平台上通过
- [ ] `cran-comments.md` 准确描述各检查结果
- [ ] 所有 URL 有效
- [ ] 无拼写错误
- [ ] 版本号正确且已递增
- [ ] NEWS.md 已更新
- [ ] DESCRIPTION 元数据完整且准确

## 常见问题

- **示例运行过慢**：将耗时示例包裹在 `\donttest{}` 中。CRAN 执行时间限制严格。
- **非标准文件或目录名**：避免触发 CRAN 注记的文件（检查 `.Rbuildignore`）
- **文档缺少 `\value`**：所有导出函数需要 `@return` 标签
- **Vignette 构建失败**：确保 vignette 能在不依赖 `.Renviron` 的干净环境中构建
- **DESCRIPTION 标题格式**：必须为标题大小写（Title Case），末尾无句点，不以"A Package for..."开头
- **忘记反向依赖检查**：对于更新提交，运行 `revdepcheck::revdep_check()`

## 示例

```r
# 完整的提交前工作流
devtools::spell_check()
urlchecker::url_check()
devtools::check()
devtools::check_win_devel()
rhub::rhub_check()
# 等待结果...
devtools::release()
```

## 相关技能

- `release-package-version` — 版本号递增与 git 标签管理
- `write-roxygen-docs` — 确保文档符合 CRAN 标准
- `setup-github-actions-ci` — 与 CRAN 期望一致的 CI 检查
- `build-pkgdown-site` — 已接受包的文档站点
