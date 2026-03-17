---
name: validate-piles-notation
description: >
  解析和验证 PILES（拼图输入行条目系统）表示法，用于指定 jigsawR 中的碎片
  融合组。涵盖语法验证、解析为组列表、自然语言解释、根据拼图结果进行邻接
  验证，以及往返序列化。适用于在传递给 generate_puzzle() 之前验证用户提供的
  PILES 字符串、调试融合组问题、向用户解释表示法，以及测试往返解析/序列化保真度。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: intermediate
  language: R
  tags: jigsawr, piles, notation, fusion, parsing, dsl
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 验证 PILES 表示法

解析和验证拼图碎片融合组的 PILES 表示法字符串。

## 适用场景

- 在传递给 `generate_puzzle()` 之前验证用户提供的 PILES 字符串
- 调试融合组问题（碎片合并错误、意外结果）
- 用自然语言向用户解释 PILES 表示法
- 测试往返保真度：解析 -> 组 -> 序列化 -> 解析

## 输入

- **必需**：PILES 表示法字符串（如 `"1-2-3,4-5"`）
- **可选**：拼图结果对象（用于邻接验证和关键字解析）
- **可选**：拼图类型（用于支持 `"center"`、`"ring1"`、`"R1"` 等关键字）

## 步骤

### 第 1 步：语法验证

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# 有效返回 TRUE，无效返回错误消息
```

检查常见语法错误：
- 不匹配的括号：`"1-2(-3)-4"` 中 `()` 不匹配
- 无效字符：只允许数字、`-`、`,`、`:`、`(`、`)` 和关键字
- 空组：`"1-2,,3-4"`（双逗号）

**预期结果：** 有效语法返回 `TRUE`，无效语法返回描述性错误。

**失败处理：** 打印确切的 PILES 字符串和验证错误消息。

### 第 2 步：解析为组

```r
groups <- parse_piles("1-2-3,4-5")
# 返回：list(c(1, 2, 3), c(4, 5))
```

对于包含范围的字符串：
```r
groups <- parse_piles("1:6,7-8")
# 返回：list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

**预期结果：** 整数向量列表，每个融合组一个，碎片 ID 和组边界正确。

**失败处理：** 首先检查 PILES 字符串是否通过了第 1 步的语法验证。如果解析返回意外的组，验证 `-` 分隔组内碎片、`,` 分隔组，以及范围表示法（`:`）扩展为包含端点。

### 第 3 步：自然语言解释

为用户描述每个组：

- `"1-2-3,4-5"` -> "第 1 组：融合碎片 1、2 和 3。第 2 组：融合碎片 4 和 5。"
- `"1:6"` -> "第 1 组：融合碎片 1 到 6（共 6 个碎片）。"
- `"center,ring1"` -> "第 1 组：中心碎片。第 2 组：第 1 环的所有碎片。"

**预期结果：** 每个融合组用自然语言描述，包含碎片数量和标识符，使非技术用户也能理解表示法。

**失败处理：** 如果关键字无法解释（如 `"ring1"` 含义不明确），表示法可能需要拼图结果对象提供上下文。建议用户提供拼图类型或改用数字碎片 ID。

### 第 4 步：根据拼图结果验证（可选）

如果有拼图结果对象可用，验证：

```r
# 首先生成拼图
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# 使用拼图上下文解析（解析关键字）
groups <- parse_fusion("center,ring1", puzzle)
```

检查：
- 所有碎片 ID 在拼图中存在
- 关键字解析为有效的碎片集
- 融合碎片实际相邻（不相邻时发出警告）

**预期结果：** 所有碎片 ID 有效。相邻碎片干净地融合。

**失败处理：** 列出无效的碎片 ID 或不相邻的配对。

### 第 5 步：往返序列化

验证解析/序列化保真度：

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip 应等于 original（或规范等价形式）

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # 必须为 TRUE
```

**预期结果：** 往返产生相同的组列表，确认 `parse_piles()` 和 `to_piles()` 互为逆操作。

**失败处理：** 如果往返结果不同，检查序列化器是否对表示法进行了规范化（如排序碎片 ID 或将范围转换为显式列表）。只要 `identical(groups, groups2)` 返回 `TRUE`，规范差异是可接受的。

## PILES 快速参考

```
# 基本语法
"1-2"           # 融合碎片 1 和 2
"1-2-3,4-5"     # 两组：(1,2,3) 和 (4,5)
"1:6"           # 范围：碎片 1 到 6

# 关键字（需要 puzzle_result）
"center"        # 中心碎片（六边形/同心圆）
"ring1"         # 第 1 环的所有碎片
"R1"            # 第 1 行（矩形）
"boundary"      # 所有边界碎片

# 函数
parse_piles("1-2-3,4-5")                    # 解析 PILES 字符串
parse_fusion("1-2-3", puzzle)               # 自动检测格式
to_piles(list(c(1,2), c(3,4)))              # 转换为 PILES
validate_piles_syntax("1-2(-3)-4")          # 验证语法
```

## 验证清单

- [ ] `validate_piles_syntax()` 对有效字符串返回 TRUE
- [ ] `parse_piles()` 返回正确的组列表
- [ ] 往返序列化保持组不变
- [ ] 关键字在拼图上下文中正确解析
- [ ] 无效语法产生清晰的错误消息

## 常见问题

- **无拼图上下文使用关键字**：`"center"` 等关键字需要拼图结果对象。传递给 `parse_fusion()`，而非 `parse_piles()`。
- **碎片从 1 开始索引**：碎片 ID 从 1 开始，不是 0。
- **相邻与不相邻融合**：融合不相邻碎片可行但可能产生意外视觉效果。尽可能验证邻接关系。
- **范围表示法**：`"1:6"` 包含两个端点（1、2、3、4、5、6）。

## 相关技能

- `generate-puzzle` — 使用融合组生成拼图
- `add-puzzle-type` — 新类型需要 PILES/融合支持
- `run-puzzle-tests` — 使用完整套件测试 PILES 解析
