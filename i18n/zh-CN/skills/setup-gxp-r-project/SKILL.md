---
name: setup-gxp-r-project
description: >
  搭建符合 GxP 法规（21 CFR Part 11、EU Annex 11）的 R 项目结构。
  涵盖已验证环境、确认文档、变更控制及电子记录要求。适用于在受监管
  环境（制药、生物技术、医疗器械）中启动 R 分析项目、为临床试验分析
  配置 R 环境、创建用于法规申报的已验证计算环境，或实施
  21 CFR Part 11 或 EU Annex 11 要求时使用。
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
  domain: compliance
  complexity: advanced
  language: R
  tags: gxp, validation, regulatory, pharma, 21-cfr-part-11
---

# 搭建 GxP R 项目

创建满足 GxP 法规要求的 R 项目结构，用于已验证计算环境。

## 适用场景

- 在受监管环境（制药、生物技术、医疗器械）中启动 R 分析项目
- 配置 R 以用于临床试验分析
- 为法规申报创建已验证计算环境
- 实施 21 CFR Part 11 或 EU Annex 11 要求

## 输入

- **必填**：项目范围及适用法规框架（FDA、EMA 或两者均适用）
- **必填**：待验证的 R 版本及软件包版本
- **必填**：验证策略（基于风险的方法）
- **可选**：现有的计算机化系统 SOP
- **可选**：质量管理系统集成要求

## 步骤

### 第 1 步：创建已验证项目结构

```
gxp-project/
├── R/                          # 分析脚本
│   ├── 01_data_import.R
│   ├── 02_data_processing.R
│   └── 03_analysis.R
├── validation/                 # 验证文档
│   ├── validation_plan.md      # VP：范围、策略、角色
│   ├── risk_assessment.md      # 风险分类
│   ├── iq/                     # 安装确认
│   │   ├── iq_protocol.md
│   │   └── iq_report.md
│   ├── oq/                     # 操作确认
│   │   ├── oq_protocol.md
│   │   └── oq_report.md
│   ├── pq/                     # 性能确认
│   │   ├── pq_protocol.md
│   │   └── pq_report.md
│   └── traceability_matrix.md  # 需求到测试的追溯矩阵
├── tests/                      # 自动化测试套件
│   ├── testthat.R
│   └── testthat/
│       ├── test-data_import.R
│       └── test-analysis.R
├── data/                       # 输入数据（受控）
│   ├── raw/                    # 不可变原始数据
│   └── derived/                # 已处理数据集
├── output/                     # 分析输出
├── docs/                       # 支持文档
│   ├── sop_references.md       # 相关 SOP 链接
│   └── change_log.md           # 手动变更记录
├── renv.lock                   # 锁定的依赖项
├── DESCRIPTION                 # 项目元数据
├── .Rprofile                   # 会话配置
└── CLAUDE.md                   # AI 助手说明
```

**预期结果：** 完整目录结构已创建，包含 `R/`、`validation/`（含 `iq/`、`oq/`、`pq/` 子目录）、`tests/testthat/`、`data/raw/`、`data/derived/`、`output/` 和 `docs/` 目录。

**失败处理：** 若目录缺失，使用 `mkdir -p` 创建。确认当前位于正确的项目根目录。对于已有项目，仅创建缺失目录，不覆盖现有结构。

### 第 2 步：创建验证计划

创建 `validation/validation_plan.md`：

```markdown
# 验证计划

## 1. 目的
本计划定义使用 R [版本] 的 [项目名称] 的验证策略。

## 2. 范围
- R 版本：4.5.0
- 软件包：[列出版本号]
- 分析：[描述]
- 法规框架：21 CFR Part 11 / EU Annex 11

## 3. 风险评估方法
采用 GAMP 5 基于风险的分类：
- Category 3：非配置产品（R 基础包）
- Category 4：已配置产品（使用默认设置的 R 软件包）
- Category 5：自定义应用（自定义 R 脚本）

## 4. 验证活动
| 活动 | Category 3 | Category 4 | Category 5 |
|------|-----------|-----------|-----------|
| IQ | 必需 | 必需 | 必需 |
| OQ | 简化 | 标准 | 增强 |
| PQ | 不适用 | 标准 | 增强 |

## 5. 角色与职责
- 验证负责人：[姓名]
- 开发人员：[姓名]
- QA 审核员：[姓名]
- 批准人：[姓名]

## 6. 验收标准
所有测试必须通过并有记录证据。
```

**预期结果：** `validation/validation_plan.md` 已完成，包含范围、GAMP 5 风险分类、验证活动矩阵、角色职责及验收标准，并引用具体 R 版本和法规框架。

**失败处理：** 若法规框架不明确，请咨询组织的 QA 部门以获取适用 SOP。在计划审核和批准之前，不得启动验证活动。

### 第 3 步：使用 renv 锁定依赖项

```r
# 使用精确版本初始化 renv
renv::init()

# 安装特定已验证版本
renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

# 快照
renv::snapshot()
```

`renv.lock` 文件作为受控软件包清单。

**预期结果：** `renv.lock` 存在，包含所有必需软件包的精确版本号。`renv::status()` 报告无问题。每个软件包版本均已固定（如 `dplyr@1.1.4`），无浮动版本。

**失败处理：** 若 `renv::install()` 无法安装特定版本，检查该版本是否在 CRAN 归档中存在。对于已归档版本，使用 `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")`。

### 第 4 步：实施版本控制

```bash
git init
git add .
git commit -m "Initial validated project structure"

# 使用签名提交以确保可追溯性
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

**预期结果：** 项目已纳入 git 版本控制并启用签名提交。初始提交包含已验证项目结构和 `renv.lock`。

**失败处理：** 若 GPG 签名失败，使用 `gpg --list-secret-keys` 验证 GPG 密钥配置。对于无 GPG 的环境，记录偏差并在 `docs/change_log.md` 中使用未签名提交加手动审计追踪条目。

### 第 5 步：创建 IQ 协议

`validation/iq/iq_protocol.md`：

```markdown
# 安装确认协议

## 目标
验证 R 及所需软件包已正确安装。

## 测试用例

### IQ-001：R 版本验证
- **要求**：已安装 R 4.5.0
- **步骤**：执行 `R.version.string`
- **预期结果：** "R version 4.5.0 (date)"
- **结果**：[ 通过 / 失败 ]

### IQ-002：软件包安装验证
- **要求**：renv.lock 中的所有软件包均已安装
- **步骤**：执行 `renv::status()`
- **预期结果：** "No issues found"
- **结果**：[ 通过 / 失败 ]

### IQ-003：软件包版本验证
- **步骤**：执行 `installed.packages()[, c("Package", "Version")]`
- **预期结果：** 版本与 renv.lock 完全一致
- **结果**：[ 通过 / 失败 ]
```

**预期结果：** `validation/iq/iq_protocol.md` 包含 R 版本验证、软件包安装验证和软件包版本验证的测试用例，每个测试用例均有明确的预期结果和通过/失败字段。

**失败处理：** 若 IQ 协议模板不符合组织 SOP 要求，在保留必填字段（要求、步骤、预期结果、实际结果、通过/失败）的前提下调整格式。请咨询 QA 获取已批准的模板。

### 第 6 步：编写自动化 OQ/PQ 测试

```r
# tests/testthat/test-analysis.R
test_that("primary analysis produces validated results", {
  # 已知输入 -> 已知输出（双编程验证）
  test_data <- read.csv(test_path("fixtures", "validation_dataset.csv"))

  result <- primary_analysis(test_data)

  # 与独立计算的预期值进行比较
  expect_equal(result$estimate, 2.345, tolerance = 1e-3)
  expect_equal(result$p_value, 0.012, tolerance = 1e-3)
  expect_equal(result$ci_lower, 1.234, tolerance = 1e-3)
})
```

**预期结果：** `tests/testthat/` 中存在自动化测试文件，涵盖 OQ（每个函数的操作验证）和 PQ（与独立计算参考值的端到端验证）。测试使用明确的数值容差。

**失败处理：** 若参考值尚未通过独立计算（如 SAS）获得，创建带有 `skip("Awaiting independent reference values")` 的占位测试，并在追溯矩阵中记录。

### 第 7 步：创建追溯矩阵

```markdown
# 追溯矩阵

| 需求 ID | 需求描述 | 测试 ID | 测试描述 | 状态 |
|--------|---------|---------|---------|------|
| REQ-001 | 正确导入 CSV 数据 | OQ-001 | 验证数据维度和类型 | 通过 |
| REQ-002 | 计算主要终点 | PQ-001 | 与参考结果比较 | 通过 |
| REQ-003 | 生成报告输出 | PQ-002 | 验证报告包含所有章节 | 通过 |
```

**预期结果：** `validation/traceability_matrix.md` 将每个需求链接到至少一个测试用例，每个测试用例均链接到一个需求。无孤立需求或测试。

**失败处理：** 若需求未被测试，为其创建测试用例或记录基于风险的排除理由。若测试无关联需求，将其链接到现有需求或作为超出范围删除。

## 验证清单

- [ ] 项目结构遵循文档模板
- [ ] renv.lock 包含所有依赖项的精确版本
- [ ] 验证计划完整且已获批准
- [ ] IQ 协议执行成功
- [ ] OQ 测试用例覆盖所有已配置功能
- [ ] PQ 测试与独立计算结果进行验证
- [ ] 追溯矩阵将需求链接到测试
- [ ] 变更控制流程已记录

## 常见问题

- **使用 `install.packages()` 时未固定版本**：始终使用带锁定版本的 renv
- **缺少审计追踪**：每次变更均须记录，使用 git 签名提交
- **过度验证**：采用基于风险的方法，并非每个 CRAN 软件包都需要 Category 5 验证
- **忽略系统级确认**：操作系统和 R 安装也需要 IQ
- **无独立验证**：PQ 应与独立计算结果（SAS、手动计算）进行比较

## 相关技能

- `write-validation-documentation` — 详细的验证文档创建
- `implement-audit-trail` — 电子记录和审计追踪
- `validate-statistical-output` — 双编程和输出验证
- `manage-renv-dependencies` — 已验证环境的依赖项锁定
