---
name: audit-dependency-versions
description: >
  审计项目依赖项的版本过时性、安全漏洞和兼容性问题。涵盖锁文件分析、升级路径
  规划和破坏性变更评估。适用于发布前确保依赖项是最新和安全的、定期维护审查、
  收到安全通告后、升级到新语言版本时、提交到 CRAN 或 npm 之前，或接手项目
  评估其依赖健康度时。
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, dependencies, audit, security, upgrades
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 审计依赖版本

审计项目依赖项的版本过时性、已知安全漏洞和兼容性问题。本技能从锁文件中清点所有依赖项，对照最新可用版本检查每一个，分类过时级别，识别安全问题，并生成带有建议操作的优先级升级报告。

## 适用场景

- 发布前确保依赖项是最新和安全的
- 定期维护期间（每月或每季度依赖审查）
- 收到影响项目依赖项的安全通告后
- 将项目升级到新语言版本时（例如 R 4.4 到 4.5）
- 向 CRAN、npm 或 crates.io 提交包之前
- 接手项目并评估其依赖健康度时

## 输入

- **必需**：包含依赖/锁文件的项目根目录
- **可选**：如果无法自动检测的生态系统类型（R、Node.js、Python、Rust）
- **可选**：仅安全模式标志（跳过过时性检查，专注于 CVE）
- **可选**：要跳过的依赖项允许列表（已知可接受的旧版本）
- **可选**：兼容性目标日期（例如"必须兼容 R 4.4.x"）

## 步骤

### 第 1 步：清点所有依赖项

定位并解析依赖文件以构建完整清单。

**R 包：**
```bash
# Direct dependencies from DESCRIPTION
grep -A 100 "^Imports:" DESCRIPTION | grep -B 100 "^[A-Z]" | head -50
grep -A 100 "^Suggests:" DESCRIPTION | grep -B 100 "^[A-Z]" | head -50

# Pinned versions from renv.lock
cat renv.lock | grep -A 3 '"Package"'
```

**Node.js：**
```bash
# Direct dependencies
cat package.json | grep -A 100 '"dependencies"' | grep -B 100 "}"
cat package.json | grep -A 100 '"devDependencies"' | grep -B 100 "}"

# Pinned versions from lock file
cat package-lock.json | grep '"version"' | head -20
```

**Python：**
```bash
# From requirements or pyproject
cat requirements.txt
cat pyproject.toml | grep -A 50 "dependencies"

# Pinned versions
cat requirements.lock 2>/dev/null || pip freeze
```

**Rust：**
```bash
# From Cargo.toml
grep -A 50 "\[dependencies\]" Cargo.toml
# Pinned versions
cat Cargo.lock | grep -A 2 "name ="
```

构建清单表：

```markdown
| Package | Pinned Version | Type | Ecosystem |
|---|---|---|---|
| dplyr | 1.1.4 | Import | R |
| testthat | 3.2.1 | Suggests | R |
| express | 4.18.2 | dependency | Node.js |
| pytest | 8.0.0 | dev | Python |
```

**预期结果：** 所有直接（以及可选的传递）依赖项的完整清单，附有锁定版本。

**失败处理：** 如果锁文件缺失，项目存在可复现性问题。将此记为发现，并从清单文件（DESCRIPTION、package.json）使用声明的版本约束而非锁定版本来清点。

### 第 2 步：检查最新可用版本

对于每个依赖项，确定最新可用版本。

**R：**
```r
# Check available versions
available.packages()[c("dplyr", "testthat"), "Version"]

# Or via CLI
Rscript -e 'cat(available.packages()["dplyr", "Version"])'
```

**Node.js：**
```bash
# Check outdated packages
npm outdated --json

# Or individual package
npm view express version
```

**Python：**
```bash
# Check outdated
pip list --outdated --format=json

# Or individual
pip index versions requests 2>/dev/null
```

**Rust：**
```bash
# Check outdated
cargo outdated

# Or individual
cargo search serde --limit 1
```

用最新版本更新清单：

```markdown
| Package | Pinned | Latest | Gap |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | patch |
| ggplot2 | 3.4.0 | 3.5.1 | minor |
| Rcpp | 1.0.10 | 1.0.14 | patch |
| shiny | 1.7.4 | 1.9.1 | minor |
```

**预期结果：** 为每个依赖项识别最新版本，附有差距幅度（补丁/次要/主要）。

**失败处理：** 如果包注册表不可达，将该依赖项记为"无法检查"并继续处理其余部分。不要因为一个不可达的注册表而阻塞整个审计。

### 第 3 步：分类过时程度

为每个依赖项分配一个过时级别：

| 级别 | 定义 | 操作 |
|---|---|---|
| **最新** | 在最新版本或最新补丁内 | 无需操作 |
| **补丁落后** | 相同的主要.次要版本，较旧的补丁 | 低优先级升级，通常安全 |
| **次要版本落后** | 相同主要版本，较旧的次要版本 | 中优先级，查看变更日志了解新功能 |
| **主要版本落后** | 较旧的主要版本 | 高优先级，升级中可能有破坏性变更 |
| **停止维护/归档** | 包不再维护 | 关键：寻找替代品或分叉 |

生成过时摘要：

```markdown
### Staleness Summary

- **Current**: 12 packages (48%)
- **Patch behind**: 8 packages (32%)
- **Minor behind**: 3 packages (12%)
- **Major behind**: 1 package (4%)
- **EOL/Archived**: 1 package (4%)

**Overall health**: AMBER (major-behind and EOL packages present)
```

颜色编码：
- **GREEN**：所有包最新或仅补丁落后
- **AMBER**：存在次要版本落后或一个主要版本落后
- **RED**：多个主要版本落后或存在停止维护的包

**预期结果：** 每个依赖项按过时程度分类，并给出整体健康评级。

**失败处理：** 如果版本比较逻辑不明确（非 SemVer 版本、基于日期的版本），保守地分类为"次要版本落后"并注明非标准版本控制。

### 第 4 步：检查安全漏洞

运行生态系统特定的安全审计工具：

**R：**
```r
# No built-in audit tool; check manually
# Cross-reference with https://www.r-project.org/security.html
# Check GitHub advisories for each package
```

**Node.js：**
```bash
# Built-in audit
npm audit --json

# Severity levels: info, low, moderate, high, critical
npm audit --audit-level=moderate
```

**Python：**
```bash
# Using pip-audit
pip-audit --format=json

# Or safety
safety check --json
```

**Rust：**
```bash
# Using cargo-audit
cargo audit --json
```

记录发现：

```markdown
### Security Findings

| Package | Version | CVE | Severity | Fixed In | Description |
|---|---|---|---|---|---|
| express | 4.18.2 | CVE-2024-XXXX | High | 4.19.0 | Path traversal in static file serving |
| lodash | 4.17.20 | CVE-2021-23337 | Critical | 4.17.21 | Command injection via template |

**Security status**: RED (1 critical, 1 high)
```

**预期结果：** 识别出安全漏洞，附有 CVE、严重性、受影响版本和修复版本。

**失败处理：** 如果生态系统没有可用的审计工具，手动在 GitHub Security Advisories 中搜索每个依赖项。注明在没有工具的情况下审计是尽力而为的。

### 第 5 步：规划升级路径

根据风险和影响确定升级优先级：

```markdown
### Upgrade Plan

#### Priority 1: Security Fixes (do immediately)
| Package | Current | Target | Risk | Notes |
|---|---|---|---|---|
| lodash | 4.17.20 | 4.17.21 | Low (patch) | Fixes CVE-2021-23337 |
| express | 4.18.2 | 4.19.0 | Low (minor) | Fixes CVE-2024-XXXX |

#### Priority 2: EOL Replacements (plan within 1 month)
| Package | Current | Replacement | Migration Effort |
|---|---|---|---|
| request | 2.88.2 | node-fetch 3.x | Medium (API change) |

#### Priority 3: Major Version Upgrades (plan for next release cycle)
| Package | Current | Target | Breaking Changes |
|---|---|---|---|
| webpack | 4.46.0 | 5.90.0 | Config format, plugin API |

#### Priority 4: Minor/Patch Updates (batch in maintenance window)
| Package | Current | Target | Notes |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | Patch fixes only |
| ggplot2 | 3.4.0 | 3.5.1 | New geom functions added |
```

对于每个主要升级，通过检查依赖项的变更日志来记录已知的破坏性变更。

**预期结果：** 优先级升级计划，安全修复优先，然后是停止维护的替换、主要升级和次要/补丁批量更新。

**失败处理：** 如果依赖项没有明确的升级路径（已弃用且无分叉），记录风险并建议：(1) 将当前版本纳入供应商管理，(2) 寻找替代包，或 (3) 接受风险并进行监控。

### 第 6 步：记录兼容性风险

对于每个计划的升级，评估兼容性：

```markdown
### Compatibility Assessment

#### express 4.18.2 -> 4.19.0
- **API changes**: None (patch-level fix)
- **Node.js requirement**: Same (>=14)
- **Test impact**: Run full test suite; expect zero failures
- **Confidence**: HIGH

#### webpack 4.46.0 -> 5.90.0
- **API changes**: Config file format changed, several plugins removed
- **Node.js requirement**: >=10.13 (unchanged)
- **Test impact**: Build configuration must be rewritten; all tests need re-run
- **Confidence**: LOW (requires dedicated migration effort)
- **Migration guide**: https://webpack.js.org/migrate/5/
```

将完整审计报告写入 `DEPENDENCY-AUDIT.md` 或 `DEPENDENCY-AUDIT-2026-02-17.md`。

**预期结果：** 为每个重要升级记录了兼容性风险。完整审计报告已编写。

**失败处理：** 如果不进行测试无法评估兼容性，建议基于分支的升级方法：创建一个分支，应用升级，运行测试，在合并前评估结果。

## 验证清单

- [ ] 所有直接依赖项已从锁/清单文件中清点
- [ ] 已检查每个依赖项的最新可用版本
- [ ] 已分配过时级别（最新/补丁/次要/主要/停止维护）
- [ ] 已计算整体健康评级（GREEN / AMBER / RED）
- [ ] 已使用生态系统适当的工具运行安全审计
- [ ] 所有 CVE 已记录严重性、受影响版本和修复版本
- [ ] 升级计划已按优先级排列：安全 > 停止维护 > 主要 > 次要/补丁
- [ ] 已评估每个主要升级的兼容性风险
- [ ] 审计报告已写入 DEPENDENCY-AUDIT.md
- [ ] 没有依赖项在没有记录原因的情况下被留为"无法检查"

## 常见问题

- **忽视传递依赖项**：一个项目可能有 10 个直接依赖项但有 200 个传递依赖项。安全漏洞往往隐藏在传递依赖项中。使用 `npm ls` 或 `renv::dependencies()` 查看完整树
- **一次性升级所有依赖**：在一次提交中批量升级所有依赖项，使得无法识别是哪个升级导致了回归。按逻辑分组升级（先安全，然后逐个处理主要版本，再将次要/补丁作为批量处理）
- **混淆"过时"与"不安全"**：一个没有 CVE 的落后一个主要版本的包，风险低于一个有关键漏洞的当前版本包。始终将安全性优先于新鲜度
- **不阅读变更日志**：在不阅读变更日志的情况下盲目升级主要版本。依赖项中的破坏性变更会变成你项目中的破坏性变更
- **审计疲劳**：运行审计但不对发现采取行动。设定策略：安全发现必须在 1 个冲刺内解决，停止维护的在 1 个季度内解决
- **缺少锁文件**：没有锁文件的项目具有不可复现的构建。如果审计发现缺少锁文件，这本身就是在版本化升级之前需要解决的关键发现

## 相关技能

- `apply-semantic-versioning` -- 版本升级可能由依赖项升级触发
- `manage-renv-dependencies` -- R 特定的 renv 依赖管理
- `security-audit-codebase` -- 包含依赖漏洞的更广泛安全审计
- `manage-changelog` -- 在变更日志中记录依赖项升级
- `plan-release-cycle` -- 在发布时间线内安排依赖项升级
