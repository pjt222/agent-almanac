---
name: manage-renv-dependencies
description: >
  使用 renv 管理 R 包依赖以实现可重现的环境。涵盖初始化、
  快照/恢复工作流、常见问题排查及 CI/CD 集成。适用于为新 R
  项目初始化依赖管理、添加或更新包、在新机器上恢复环境、
  排查恢复失败问题，或将 renv 与 CI/CD 流水线集成。
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
  complexity: intermediate
  language: R
  tags: r, renv, dependencies, reproducibility, lockfile
---

# 管理 renv 依赖

使用 renv 为 R 包环境设置和维护可重现性。

## 适用场景

- 为新 R 项目初始化依赖管理
- 添加或更新包依赖
- 在新机器上恢复项目环境
- 排查 renv 恢复失败问题
- 将 renv 与 CI/CD 流水线集成

## 输入

- **必需**：R 项目目录
- **可选**：现有的 `renv.lock` 文件（用于恢复）
- **可选**：私有包的 GitHub PAT

## 步骤

### 第 1 步：初始化 renv

```r
renv::init()
```

此步骤创建：
- `renv/` 目录（库、设置、激活脚本）
- `renv.lock`（依赖快照）
- 更新 `.Rprofile` 以在加载时激活 renv

**预期结果：** 项目本地库已创建。`renv/` 目录和 `renv.lock` 存在。`.Rprofile` 已更新激活脚本。

**失败处理：** 若进程挂起，检查网络连接。若某个特定包安装失败，先用 `install.packages()` 手动安装该包，再重新运行 `renv::init()`。

### 第 2 步：添加依赖

按常规方式安装包：

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

然后创建快照以记录当前状态：

```r
renv::snapshot()
```

**预期结果：** `renv.lock` 已更新，包含新包及其版本。`renv::status()` 显示无不同步的包。

**失败处理：** 若 `renv::snapshot()` 报告验证错误，运行 `renv::dependencies()` 检查实际使用的包，然后用 `renv::snapshot(force = TRUE)` 绕过验证。

### 第 3 步：在其他机器上恢复

```r
renv::restore()
```

**预期结果：** 所有包按 `renv.lock` 中记录的确切版本安装。

**失败处理：** 常见问题：GitHub 包安装失败（在 `.Renviron` 中设置 `GITHUB_PAT`）、Linux 上缺少系统依赖（用 `apt-get` 安装）、大包超时（恢复前设置 `options(timeout = 600)`）、二进制包不可用（renv 从源码编译，确保已安装构建工具）。

### 第 4 步：更新依赖

```r
# 更新特定包
renv::update("dplyr")

# 更新所有包
renv::update()

# 更新后创建快照
renv::snapshot()
```

**预期结果：** 目标包已更新至最新兼容版本。快照后 `renv.lock` 反映新版本。

**失败处理：** 若 `renv::update()` 对某个包失败，尝试直接用 `renv::install("package@version")` 安装，然后创建快照。

### 第 5 步：检查状态

```r
renv::status()
```

**预期结果：** 显示"No issues found"或列出不同步包及可操作的指导信息。

**失败处理：** 若状态报告包已使用但未记录，运行 `renv::snapshot()`。若包已记录但未安装，运行 `renv::restore()`。

### 第 6 步：配置 `.Rprofile` 的条件激活

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

此设置确保即使未安装 renv 的环境（CI 环境、协作者机器）也能正常使用项目。

**预期结果：** R 会话在项目目录中启动时自动激活 renv。未安装 renv 的会话也能无错误地启动。

**失败处理：** 若 `.Rprofile` 导致错误，确认 `file.exists()` 保护已存在。切勿无条件调用 `source("renv/activate.R")`。

### 第 7 步：Git 配置

需跟踪以下文件：

```
renv.lock           # 始终提交
renv/activate.R     # 始终提交
renv/settings.json  # 始终提交
.Rprofile           # 提交（包含 renv 激活代码）
```

忽略以下文件（renv 的 `.gitignore` 已处理）：

```
renv/library/       # 机器特定
renv/staging/       # 临时文件
renv/cache/         # 机器特定缓存
```

**预期结果：** `renv.lock`、`renv/activate.R` 和 `renv/settings.json` 已被 Git 跟踪。机器特定目录（`renv/library/`、`renv/cache/`）已被忽略。

**失败处理：** 若 `renv/library/` 意外被提交，使用 `git rm -r --cached renv/library/` 将其移除，并添加至 `.gitignore`。

### 第 8 步：CI/CD 集成

在 GitHub Actions 中使用 renv 缓存 action：

```yaml
- uses: r-lib/actions/setup-renv@v2
```

此 action 自动从 `renv.lock` 恢复依赖并启用缓存。

**预期结果：** CI 流水线从 `renv.lock` 恢复包并启用缓存。后续运行因缓存而更快。

**失败处理：** 若 CI 恢复失败，检查 `renv.lock` 是否已提交且为最新。对于私有 GitHub 包，确认 `GITHUB_PAT` 已设置为仓库密钥。

## 验证清单

- [ ] `renv::status()` 报告无问题
- [ ] `renv.lock` 已提交至版本控制
- [ ] `renv::restore()` 在干净的检出上可正常工作
- [ ] `.Rprofile` 条件性地激活 renv
- [ ] CI/CD 使用 `renv.lock` 进行依赖解析

## 常见问题

- **在错误目录中运行 `renv::init()`**：始终先确认 `getwd()`
- **混用 renv 与系统库**：运行 `renv::init()` 后，只使用项目库
- **忘记创建快照**：安装包后始终运行 `renv::snapshot()`
- **`--vanilla` 标志**：`Rscript --vanilla` 跳过 `.Rprofile`，导致 renv 不激活
- **锁文件差异较大**：属正常情况，`renv.lock` 设计为可差异化的 JSON
- **Bioconductor 包**：使用 `renv::install("bioc::PackageName")` 并确认 BiocManager 已配置

## 相关技能

- `create-r-package` — 包含 renv 初始化
- `setup-github-actions-ci` — renv 的 CI 集成
- `submit-to-cran` — CRAN 包的依赖管理
