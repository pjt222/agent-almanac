---
name: run-puzzle-tests
description: >
  通过 WSL R 执行运行 jigsawR 测试套件。支持完整套件、按模式过滤或单文件运行。
  解读通过/失败/跳过计数并定位失败测试。绝不使用 --vanilla 标志（renv 需要
  .Rprofile 激活）。适用于修改 R 源代码后、添加新拼图类型或功能后、提交更改前
  验证无破坏，以及调试特定测试失败时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, testing, testthat, renv, wsl
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 运行拼图测试

运行 jigsawR 测试套件并解读结果。

## 适用场景

- 修改包中任何 R 源代码后
- 添加新拼图类型或功能后
- 提交更改前验证无破坏
- 调试特定测试失败

## 输入

- **必需**：测试范围（`full`、`filtered` 或 `single`）
- **可选**：过滤模式（用于 filtered 模式，如 `"snic"`、`"rectangular"`）
- **可选**：指定测试文件路径（用于 single 模式）

## 步骤

### 第 1 步：选择测试范围

| 范围 | 使用时机 | 耗时 |
|------|---------|------|
| 完整 | 提交前、重大更改后 | ~2-5 分钟 |
| 过滤 | 处理某个拼图类型时 | ~30 秒 |
| 单文件 | 调试特定测试文件 | ~10 秒 |

**预期结果：** 根据当前工作流选择测试范围：提交前选完整套件，处理特定拼图类型时选过滤，调试单个测试时选单文件。

**失败处理：** 如果不确定选哪个范围，默认使用完整套件。耗时更长但能捕获跨类型回归。

### 第 2 步：创建并执行测试脚本

**完整套件**：

创建脚本文件（如 `/tmp/run_tests.R`）：

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**按模式过滤**：

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**单文件**：

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

**预期结果：** 测试输出含通过/失败/跳过计数。

**失败处理：**
- 不要使用 `--vanilla` 标志；renv 需要 `.Rprofile` 来激活
- 如果 renv 报错，先运行 `renv::restore()`
- 对于因退出码 5 失败的复杂命令，写入脚本文件替代

### 第 3 步：解读结果

查找汇总行：

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**：通过的测试
- **FAIL**：失败的测试（需要排查）
- **SKIP**：跳过的测试（通常因缺少可选包如 `snic`）
- **WARN**：测试中的警告（需审查但非阻塞）

**预期结果：** 汇总行已解析，识别出 PASS、FAIL、SKIP 和 WARN 计数。干净测试运行应 FAIL = 0。

**失败处理：** 如果汇总行不可见，测试运行器可能在完成前崩溃。检查汇总行上方的 R 级错误。如果输出被截断，重定向到文件：`"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`。

### 第 4 步：排查失败

如果测试失败：

1. 阅读失败消息——包含文件、行号及预期与实际值
2. 检查是新故障还是已有的
3. 对于断言失败，阅读测试和被测函数
4. 对于错误失败，检查函数签名是否变更

```bash
# 使用详细输出运行失败的测试
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

**预期结果：** 每个失败测试的根因已识别。失败要么是真正的回归（代码需修复），要么是测试环境问题（缺少依赖、路径问题）。

**失败处理：** 如果失败消息不清楚，在测试中添加 `browser()` 或 `print()` 语句，使用 `testthat::test_file()` 重新运行以交互调试。

### 第 5 步：验证跳过原因

缺少可选依赖时跳过测试是正常的：

- `snic` 包的测试通过 `skip_if_not_installed("snic")` 跳过
- 要求特定操作系统的测试通过 `skip_on_os()` 跳过
- 仅 CRAN 的跳过通过 `skip_on_cran()` 实现

确认跳过原因合理，不是在掩盖真实故障。

**预期结果：** 所有跳过都有合理原因（可选依赖未安装、平台特定跳过、仅 CRAN 跳过）。没有跳过在掩盖实际测试失败。

**失败处理：** 如果某个跳过看起来可疑，临时移除 `skip_if_*()` 调用并运行测试，看它是通过还是暴露隐藏的失败。

## 验证清单

- [ ] 所有测试通过（FAIL = 0）
- [ ] 无意外警告
- [ ] 跳过计数与预期匹配（仅可选依赖跳过）
- [ ] 测试数量未减少（没有测试被意外删除）

## 常见问题

- **使用 `--vanilla`**：会破坏 renv 激活。jigsawR 中绝不使用。
- **复杂的 `-e` 字符串**：shell 转义问题导致退出码 5。使用脚本文件。
- **过时的包状态**：如果更改了影响 NAMESPACE 的代码，测试前运行 `devtools::load_all()` 或 `devtools::document()`。
- **缺少测试依赖**：某些测试需要 suggested 包。检查 `DESCRIPTION` 的 Suggests 字段。
- **并行测试问题**：如果测试互相干扰，使用 `testthat::test_file()` 顺序运行。

## 相关技能

- `generate-puzzle` — 生成拼图以验证行为是否与测试一致
- `add-puzzle-type` — 新类型需要全面的测试套件
- `write-testthat-tests` — 编写 R 测试的通用模式
- `validate-piles-notation` — 独立测试 PILES 解析
