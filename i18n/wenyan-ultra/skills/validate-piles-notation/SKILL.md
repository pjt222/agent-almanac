---
name: validate-piles-notation
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Parse and validate PILES (Puzzle Input Line Entry System) notation for
  specifying piece fusion groups in jigsawR. Covers syntax validation,
  parsing into group lists, plain-language explanation, adjacency
  verification against puzzle results, and round-trip serialization. Use
  when validating user-supplied PILES strings before passing to
  generate_puzzle(), debugging fusion group issues, explaining the notation
  to users, or testing round-trip parse/serialize fidelity.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: intermediate
  language: R
  tags: jigsawr, piles, notation, fusion, parsing, dsl
---

# 驗 PILES

析驗 PILES 串以指拼塊融合組。

## 用

- 用予 PILES 串傳 `generate_puzzle()` 前驗→用
- 排融合組疾（誤塊合、果異）→用
- 以白話釋 PILES 於用→用
- 試環迴：析→組→序→析→用

## 入

- **必**：PILES 串（如 `"1-2-3,4-5"`）
- **可**：拼結果物（為鄰驗與關鍵字解）
- **可**：拼型（為關鍵字支持如 `"center"`、`"ring1"`、`"R1"`）

## 行

### 一：法驗

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# Returns TRUE if valid, error message if invalid
```

察常法誤：
- 不配括：`"1-2(-3)-4"` 含不配 `()`
- 違字：僅數、`-`、`,`、`:`、`(`、`)` 與關鍵字許
- 空組：`"1-2,,3-4"`（雙逗）

得：合法返 `TRUE`、違法返述誤。

敗：印確 PILES 串與驗誤訊。

### 二：析為組

```r
groups <- parse_piles("1-2-3,4-5")
# Returns: list(c(1, 2, 3), c(4, 5))
```

含範串：
```r
groups <- parse_piles("1:6,7-8")
# Returns: list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

得：整數向量列、每融組一、塊 ID 與組界正。

敗：先確 PILES 串過步一法驗。析返異組→驗 `-` 分組內塊、`,` 分組、範記（`:`）展為含端。

### 三：白話釋

為用述各組：

- `"1-2-3,4-5"` → 「組 1：融塊 1、2、3。組 2：融塊 4、5。」
- `"1:6"` → 「組 1：融塊 1 至 6（6 塊）。」
- `"center,ring1"` → 「組 1：中塊。組 2：環一諸塊。」

得：每融組以白話述附塊計與識，使非技用易解。

敗：關鍵字不能釋（如 `"ring1"` 無清意）→記或須拼結果物為境。勸用予拼型或用數塊 ID。

### 四：對拼結果驗（可）

若有拼結果物，驗：

```r
# Generate the puzzle first
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# Parse with puzzle context (resolves keywords)
groups <- parse_fusion("center,ring1", puzzle)
```

察：
- 諸塊 ID 存於拼
- 關鍵字解為效塊集
- 融塊實鄰（非乃警）

得：諸塊 ID 效。鄰塊融淨。

敗：列違塊 ID 或非鄰對。

### 五：環迴序化

驗析/序忠：

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip should equal original (or canonical equivalent)

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # Must be TRUE
```

得：環迴生同組列，確 `parse_piles()` 與 `to_piles()` 互逆。

敗：環迴異→察序化是否規範記（如塊 ID 排序或範轉顯列）。規範差可受惟須 `identical(groups, groups2)` 返 `TRUE`。

## PILES 速參

```
# Basic syntax
"1-2"           # Fuse pieces 1 and 2
"1-2-3,4-5"     # Two groups: (1,2,3) and (4,5)
"1:6"           # Range: pieces 1 through 6

# Keywords (require puzzle_result)
"center"        # Center piece (hex/concentric)
"ring1"         # All pieces in ring 1
"R1"            # Row 1 (rectangular)
"boundary"      # All boundary pieces

# Functions
parse_piles("1-2-3,4-5")                    # Parse PILES string
parse_fusion("1-2-3", puzzle)               # Auto-detect format
to_piles(list(c(1,2), c(3,4)))              # Convert to PILES
validate_piles_syntax("1-2(-3)-4")          # Validate syntax
```

## 驗

- [ ] `validate_piles_syntax()` 對效串返 TRUE
- [ ] `parse_piles()` 返正組列
- [ ] 環迴序化保組
- [ ] 關鍵字於拼境正解
- [ ] 違法生清誤訊

## 忌

- **無拼境之關鍵字**：如 `"center"` 須拼結果物。傳予 `parse_fusion()`、非 `parse_piles()`
- **塊一指**：塊 ID 始於 1、非 0
- **鄰與非鄰融**：融非鄰塊行而或生異視果。可時驗鄰
- **範記**：`"1:6"` 含二端（1、2、3、4、5、6）

## 參

- `generate-puzzle` — 生附融組之拼
- `add-puzzle-type` — 新型須 PILES/融支
- `run-puzzle-tests` — 以全套試 PILES 析
