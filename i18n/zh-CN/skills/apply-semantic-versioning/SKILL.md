---
name: apply-semantic-versioning
description: >
  应用语义化版本控制（SemVer 2.0.0）根据变更分析确定正确的版本号升级。
  涵盖主版本/次版本/修订版本分类、预发布标识符、构建元数据和破坏性变更检测。
  适用于准备新发布以确定正确版本号时、合并变更后打标签前、评估变更是否构成
  破坏性变更时、添加预发布标识符时，或解决关于适当版本升级的分歧时。
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, semver, version-bump, breaking-changes
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 应用语义化版本控制

通过分析上次发布以来的变更来确定并应用正确的语义化版本升级。本技能读取版本文件，将变更分类为破坏性（主版本）、功能（次版本）或修复（修订版本），计算新版本号，并更新相应文件。遵循 [SemVer 2.0.0](https://semver.org/) 规范。

## 适用场景

- 准备新发布，需要确定正确的版本号
- 合并一组变更后，打标签发布前
- 评估变更是否构成破坏性变更
- 向版本添加预发布标识符（alpha、beta、rc）
- 解决关于适当版本升级的分歧

## 输入

- **必需**：包含版本文件（DESCRIPTION、package.json、Cargo.toml、pyproject.toml 或 VERSION）的项目根目录
- **必需**：上次发布以来的 Git 历史（标签或提交）
- **可选**：使用的提交约定（规范化提交、自由格式）
- **可选**：要应用的预发布标签（alpha、beta、rc）
- **可选**：如果无法从文件读取，提供先前版本

## 步骤

### 第 1 步：读取当前版本

在项目根目录中定位并读取版本文件。

```bash
# R packages
grep "^Version:" DESCRIPTION

# Node.js
grep '"version"' package.json

# Rust
grep '^version' Cargo.toml

# Python
grep 'version' pyproject.toml

# Plain file
cat VERSION
```

将当前版本解析为 major.minor.patch 组件。如果版本包含预发布后缀（如 `1.2.0-beta.1`），单独记录。

**预期结果：** 当前版本识别为 `MAJOR.MINOR.PATCH[-PRERELEASE]`。

**失败处理：** 如果未找到版本文件，检查 VERSION 文件或 git 标签（`git describe --tags --abbrev=0`）。如果完全没有版本，初始开发从 `0.1.0` 开始，如果项目有稳定的公共 API 则从 `1.0.0` 开始。

### 第 2 步：分析上次发布以来的变更

获取上次带标签发布以来的变更列表。

```bash
# Find the last version tag
git describe --tags --abbrev=0

# List commits since that tag
git log --oneline v1.2.3..HEAD

# If using Conventional Commits, filter by type
git log --oneline v1.2.3..HEAD | grep -E "^[a-f0-9]+ (feat|fix|BREAKING)"
```

如果没有标签，与初始提交或已知基线进行比较。

**预期结果：** 具有可按变更类型分类的消息的提交列表。

**失败处理：** 如果 git 历史不可用或标签缺失，请开发者手动描述变更。根据他们的描述进行分类。

### 第 3 步：分类变更

应用 SemVer 分类规则：

| 变更类型 | 版本升级 | 示例 |
|---|---|---|
| **破坏性**（不兼容的 API 变更） | 主版本（MAJOR） | 重命名/移除公共函数、更改返回类型、移除参数、更改默认行为 |
| **功能**（新的向后兼容功能） | 次版本（MINOR） | 新导出函数、带默认值的新参数、新文件格式支持 |
| **修复**（向后兼容的缺陷修复） | 修订版本（PATCH） | 缺陷修复、文档修正、保持相同 API 的性能改进 |

分类规则：
1. 如果任何变更是破坏性的，升级为主版本（将次版本和修订版本重置为 0）
2. 如果没有破坏性变更但有任何新功能，升级为次版本（将修订版本重置为 0）
3. 如果只有修复，升级为修订版本

特殊情况：
- **1.0.0 之前**：在初始开发期间（`0.x.y`），次版本升级可能包含破坏性变更。需清楚记录。
- **弃用**：弃用一个函数是次版本变更（它仍然有效）。移除它是主版本变更。
- **内部变更**：不改变公共 API 的重构是修订版本变更。

**预期结果：** 每个变更被分类为破坏性/功能/修复，并确定整体升级级别。

**失败处理：** 如果变更不明确，倾向于更高级别的升级。保守的主版本升级好于破坏下游代码的次版本升级。

### 第 4 步：计算新版本

将升级应用于当前版本：

| 当前版本 | 升级 | 新版本 |
|---|---|---|
| 1.2.3 | 主版本 | 2.0.0 |
| 1.2.3 | 次版本 | 1.3.0 |
| 1.2.3 | 修订版本 | 1.2.4 |
| 0.9.5 | 次版本 | 0.10.0 |
| 2.0.0-rc.1 | （发布） | 2.0.0 |

如果请求预发布标签：
- `1.3.0-alpha.1` 用于即将到来的 1.3.0 的第一个 alpha
- `1.3.0-beta.1` 用于第一个 beta
- `1.3.0-rc.1` 用于第一个发布候选

预发布优先级：`alpha < beta < rc < （发布）`。

**预期结果：** 按照 SemVer 规则计算的新版本号。

**失败处理：** 如果当前版本格式错误或不符合 SemVer，先进行规范化。例如，`1.2` 变为 `1.2.0`。

### 第 5 步：更新版本文件

将新版本写入相应的文件。

```r
# R: Update DESCRIPTION
# Change "Version: 1.2.3" to "Version: 1.3.0"
```

```json
// Node.js: Update package.json
// Change "version": "1.2.3" to "version": "1.3.0"
// Also update package-lock.json if present
```

```toml
# Rust: Update Cargo.toml
# Change version = "1.2.3" to version = "1.3.0"
```

如果项目有多个引用版本的文件（如 `_pkgdown.yml`、`CITATION`、`codemeta.json`），全部更新。

**预期结果：** 所有版本文件一致地更新到新版本号。

**失败处理：** 如果文件更新失败，回退所有更改以保持一致性。绝不要让版本文件处于部分更新状态。

### 第 6 步：创建版本标签

提交版本升级后，创建 git 标签。

```bash
# Annotated tag (preferred)
git tag -a v1.3.0 -m "Release v1.3.0"

# Lightweight tag (acceptable)
git tag v1.3.0
```

使用项目已建立的标签格式：
- `v1.3.0`（最常见）
- `1.3.0`（无前缀）
- `package-name@1.3.0`（monorepo）

**预期结果：** 创建与新版本匹配的 Git 标签。

**失败处理：** 如果标签已存在，说明版本未正确升级。用 `git tag -l "v1.3*"` 检查重复标签，并在继续之前解决。

## 验证清单

- [ ] 从正确的版本文件读取了当前版本
- [ ] 分析了上次发布以来的所有提交
- [ ] 每个变更都被分类为破坏性、功能或修复
- [ ] 升级级别匹配最高严重性的变更（破坏性 > 功能 > 修复）
- [ ] 新版本遵循 SemVer 2.0.0 格式：`MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`
- [ ] 项目中所有版本文件一致更新
- [ ] 没有跳过版本（如从 1.2.3 到 1.4.0 而 1.3.0 未发布）
- [ ] Git 标签匹配新版本和项目的标签格式约定
- [ ] 预发布后缀（如使用）遵循正确的优先级（alpha < beta < rc）

## 常见问题

- **跳过次版本号**：从 1.2.3 直接到 1.4.0 因为"我们添加了两个功能"。每次发布只有一个升级；功能数量不决定版本号
- **将弃用视为破坏性变更**：弃用一个函数（添加警告）是次版本变更。只有移除它才是破坏性变更
- **忘记 1.0.0 之前的规则**：在 1.0.0 之前，API 被认为是不稳定的。一些项目在此阶段用次版本升级表示破坏性变更，但应当记录清楚
- **不一致的版本文件**：更新了 package.json 但没更新 package-lock.json，或更新了 DESCRIPTION 但没更新 CITATION。所有版本引用必须保持同步
- **构建元数据混淆**：构建元数据（`+build.123`）不影响版本优先级。`1.0.0+build.1` 和 `1.0.0+build.2` 具有相同的优先级
- **不为发布打标签**：没有 git 标签，未来的版本升级无法确定变更分析的基线

## 相关技能

- `manage-changelog` -- 维护与版本升级配对的变更日志条目
- `plan-release-cycle` -- 规划确定何时进行版本升级的发布里程碑
- `release-package-version` -- 包含版本升级的 R 特定发布工作流
- `commit-changes` -- 用适当的消息提交版本升级
- `create-github-release` -- 从版本标签创建 GitHub 发布
