---
name: validate-statistical-output
description: >
  通过双编程、独立验证和参考比较来验证统计分析输出。涵盖比较方法、
  容差定义及受监管环境中的偏差处理。适用于验证法规申报的主要或
  次要终点分析、执行双编程（R 与 SAS 或独立 R 实现），或在代码或
  环境变更后重新验证时使用。
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
  tags: validation, statistics, double-programming, verification, pharma
---

# 验证统计输出

通过独立计算和系统性比较验证统计分析结果。

## 适用场景

- 验证法规申报的主要和次要终点分析
- 执行双编程（R 与 SAS，或独立 R 实现）
- 验证分析代码产生正确结果
- 代码或环境变更后重新验证

## 输入

- **必填**：主要分析代码和结果
- **必填**：参考结果（独立计算、已发布值或已知测试数据）
- **必填**：数值比较的容差标准
- **可选**：法规申报上下文

## 步骤

### 第 1 步：定义比较框架

```r
# 定义不同统计量的容差水平
tolerances <- list(
  counts = 0,           # 整数精确匹配
  proportions = 1e-4,   # 比例精度 0.01%
  means = 1e-6,         # 均值的数值精度
  p_values = 1e-4,      # p 值保留 4 位小数
  confidence_limits = 1e-3  # 置信区间保留 3 位小数
)
```

**预期结果：** 已为每个统计量类别定义容差水平，整数计数采用更严格的容差（精确匹配），浮点统计量（p 值、置信区间）采用较宽松的容差。

**失败处理：** 若容差水平存在争议，记录每个阈值的依据并在继续之前获得统计负责人的签字确认。法规申报请参考 ICH E9 指南。

### 第 2 步：创建比较函数

```r
#' 使用基于容差的匹配比较两组结果
#'
#' @param primary 主要分析的结果
#' @param reference 独立计算的结果
#' @param tolerances 容差值的命名列表
#' @return 包含比较结果的数据框
compare_results <- function(primary, reference, tolerances) {
  stopifnot(names(primary) == names(reference))

  comparison <- data.frame(
    statistic = names(primary),
    primary_value = unlist(primary),
    reference_value = unlist(reference),
    stringsAsFactors = FALSE
  )

  comparison$absolute_diff <- abs(comparison$primary_value - comparison$reference_value)
  comparison$tolerance <- sapply(comparison$statistic, function(s) {
    # 匹配到容差类别或使用默认值
    tol <- tolerances[[s]]
    if (is.null(tol)) tolerances$means  # 默认容差
    else tol
  })

  comparison$pass <- comparison$absolute_diff <= comparison$tolerance

  comparison
}
```

**预期结果：** `compare_results()` 返回包含统计量名称、主要值、参考值、绝对差异、容差及通过/失败状态的数据框。

**失败处理：** 若函数因名称不匹配而报错，验证两个结果列表是否使用了相同的统计量名称。若容差映射失败，为未识别的统计量名称添加默认容差。

### 第 3 步：实施双编程

编写通过不同代码路径得到相同结果的独立实现：

```r
# 主要分析（位于 R/primary_analysis.R）
primary_analysis <- function(data) {
  model <- lm(endpoint ~ treatment + baseline + sex, data = data)
  coefs <- summary(model)$coefficients

  list(
    treatment_estimate = coefs["treatmentActive", "Estimate"],
    treatment_se = coefs["treatmentActive", "Std. Error"],
    treatment_p = coefs["treatmentActive", "Pr(>|t|)"],
    n_subjects = nobs(model),
    r_squared = summary(model)$r.squared
  )
}

# 独立验证（位于 validation/independent_analysis.R）
# 由不同分析人员编写或使用不同方法
independent_analysis <- function(data) {
  # 使用矩阵代数代替 lm()
  X <- model.matrix(~ treatment + baseline + sex, data = data)
  y <- data$endpoint

  beta <- solve(t(X) %*% X) %*% t(X) %*% y
  residuals <- y - X %*% beta
  sigma2 <- sum(residuals^2) / (nrow(X) - ncol(X))
  var_beta <- sigma2 * solve(t(X) %*% X)
  se <- sqrt(diag(var_beta))

  t_stat <- beta["treatmentActive"] / se["treatmentActive"]
  p_value <- 2 * pt(-abs(t_stat), df = nrow(X) - ncol(X))

  list(
    treatment_estimate = as.numeric(beta["treatmentActive"]),
    treatment_se = se["treatmentActive"],
    treatment_p = as.numeric(p_value),
    n_subjects = nrow(data),
    r_squared = 1 - sum(residuals^2) / sum((y - mean(y))^2)
  )
}
```

**预期结果：** 存在两个使用不同代码路径（如 `lm()` 与矩阵代数）得出相同统计结果的独立实现。这两个实现由不同分析人员编写或使用本质上不同的方法。

**失败处理：** 若独立实现产生不同结果，首先验证两者是否使用相同的输入数据（比较 `digest::digest(data)`）。然后检查缺失值处理、对比编码或自由度计算的差异。

### 第 4 步：运行比较

```r
# 执行两种分析
primary_results <- primary_analysis(study_data)
independent_results <- independent_analysis(study_data)

# 比较
comparison <- compare_results(primary_results, independent_results, tolerances)

# 报告
cat("验证比较报告\n")
cat("============\n")
cat(sprintf("日期：%s\n", Sys.time()))
cat(sprintf("总体结论：%s\n\n",
  ifelse(all(comparison$pass), "全部通过", "发现差异")))

print(comparison)
```

**预期结果：** 比较报告显示所有统计量均在容差范围内，"总体结论"行显示"全部通过"。

**失败处理：** 若发现差异，不要立即假设主要分析有误。对两种实现都进行调查：检查中间计算、验证输入数据是否相同，并比较缺失值和边界情况的处理方式。

### 第 5 步：与外部参考（SAS）比较

将 R 输出与 SAS 进行比较时：

```r
# 加载 SAS 结果（以 CSV 导出或来自 .sas7bdat）
sas_results <- list(
  treatment_estimate = 1.2345,  # 来自 SAS PROC GLM 输出
  treatment_se = 0.3456,
  treatment_p = 0.0004,
  n_subjects = 200,
  r_squared = 0.4567
)

comparison <- compare_results(primary_results, sas_results, tolerances)

# R 与 SAS 已知的差异来源：
# - 默认对比编码（R：处理对比，SAS：GLM 参数化）
# - 中间计算的舍入
# - 缺失值处理（na.rm 与列表删除）
```

**预期结果：** R 与 SAS 的比较结果在容差范围内，任何已知的系统性差异（对比编码、舍入）均已记录并说明。

**失败处理：** 若 R 和 SAS 产生超出容差的不同结果，检查三个最常见的差异来源：默认对比编码（R 使用处理对比，SAS 使用 GLM 参数化）、缺失值处理，以及中间计算的舍入。记录每个差异及其根本原因。

### 第 6 步：记录结果

创建验证报告：

```r
# validation/output_comparison_report.R
sink("validation/output_comparison_report.txt")

cat("输出验证报告\n")
cat("============\n")
cat(sprintf("项目：%s\n", project_name))
cat(sprintf("日期：%s\n", format(Sys.time())))
cat(sprintf("主要分析人员：%s\n", primary_analyst))
cat(sprintf("独立分析人员：%s\n", independent_analyst))
cat(sprintf("R 版本：%s\n\n", R.version.string))

cat("比较结果\n")
cat("--------\n")
print(comparison, row.names = FALSE)

cat(sprintf("\n总体结论：%s\n",
  ifelse(all(comparison$pass), "已验证", "发现差异——需要调查")))

cat("\n会话信息\n")
print(sessionInfo())

sink()
```

**预期结果：** `validation/output_comparison_report.txt` 中存在完整的验证报告，包含项目元数据、比较结果、总体结论和会话信息。

**失败处理：** 若 `sink()` 失败或生成空文件，检查输出目录是否存在（`dir.create("validation", showWarnings = FALSE)`），并确认没有先前的 `sink()` 调用仍处于活动状态（使用 `sink.number()` 检查）。

### 第 7 步：处理差异

当结果不匹配时：

1. 验证两个实现使用相同的输入数据（哈希比较）
2. 检查缺失值处理的差异
3. 逐步比较中间计算
4. 记录根本原因
5. 确定差异是否可接受（在容差范围内）或需要代码修正

**预期结果：** 所有差异均已调查，找到根本原因，每个差异均被归类为可接受（在容差范围内并有记录理由）或需要代码修正。

**失败处理：** 若无法解释某个差异，升级至统计负责人。不要忽视无法解释的差异，因为它们可能表明某个实现存在真实错误。

## 验证清单

- [ ] 独立分析产生在容差范围内的结果
- [ ] 所有比较统计量均已记录
- [ ] 差异（如有）已调查并解决
- [ ] 输入数据完整性已验证（哈希匹配）
- [ ] 容差标准已预先规定并有理由支撑
- [ ] 验证报告已完成并签署

## 常见问题

- **同一分析人员编写两个实现**：双编程需要独立分析人员才能进行真正的验证
- **在实现之间共享代码**：独立版本不得从主要版本复制代码
- **容差不当**：过于宽松会隐藏真实错误；过于严格会标记浮点噪声
- **忽视系统性差异**：即使在容差范围内，小的一致性偏差也可能表示真实错误
- **不验证验证程序**：用已知输入验证比较代码本身是否正常工作

## 相关技能

- `setup-gxp-r-project` — 已验证工作的项目结构
- `write-validation-documentation` — 协议和报告模板
- `implement-audit-trail` — 追踪验证过程本身
- `write-testthat-tests` — 用于持续验证的自动化测试套件
