---
name: validate-piles-notation
locale: wenyan
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

# 驗 PILES 之記

於 jigsawR 中析驗 PILES 之記之串，以指片融之群。

## 用時

- 用者所予之 PILES 串入 `generate_puzzle()` 前驗之
- 排融群之疾（誤合之片、意外之果）
- 以淺辭述 PILES 之記於用者
- 試往返之忠：析 -> 群 -> 序 -> 析

## 入

- **必要**：PILES 之記之串（如 `"1-2-3,4-5"`）
- **可選**：拼圖果之物（為鄰之驗與關鍵字之解）
- **可選**：拼圖之類（為關鍵字之支如 `"center"`、`"ring1"`、`"R1"`）

## 法

### 第一步：語法之驗

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# Returns TRUE if valid, error message if invalid
```

察常見語法之訛：
- 括不對：`"1-2(-3)-4"` 之 `()` 不配
- 字非允：唯數、`-`、`,`、`:`、`(`、`)` 與關鍵字
- 空群：`"1-2,,3-4"`（雙逗）

得：有效語法返 `TRUE`，無效返述訛之辭。

敗則：印 PILES 之串與驗訛之辭。

### 第二步：析為群

```r
groups <- parse_piles("1-2-3,4-5")
# Returns: list(c(1, 2, 3), c(4, 5))
```

含範之串：
```r
groups <- parse_piles("1:6,7-8")
# Returns: list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

得：整向之列，每融群一向，含正片 ID 與群之界。

敗則：先確 PILES 串已過第一步之語法驗。析返意外之群者，驗 `-` 分群內片、`,` 分群、範記（`:`）展為含端。

### 第三步：以淺辭述之

為用者述各群：

- `"1-2-3,4-5"` -> 「群一：合片 1、2、3。群二：合片 4 與 5。」
- `"1:6"` -> 「群一：合片 1 至 6（六片）。」
- `"center,ring1"` -> 「群一：中心片。群二：環一之諸片。」

得：每融群以淺辭述，含片數與識，使非技用者能解。

敗則：關鍵字不能述（如 `"ring1"` 無明意）者，記或需拼圖果之物為脈絡。囑用者予拼圖類或用數片 ID。

### 第四步：對拼圖果之驗（可選）

若拼圖果之物可得，驗：

```r
# Generate the puzzle first
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# Parse with puzzle context (resolves keywords)
groups <- parse_fusion("center,ring1", puzzle)
```

察：
- 諸片 ID 存於拼圖
- 關鍵字解為有效片集
- 合之片實鄰（否則警）

得：諸片 ID 有效。鄰片合而清。

敗則：列無效片 ID 或非鄰之對。

### 第五步：往返序之驗

驗析/序之忠：

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip should equal original (or canonical equivalent)

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # Must be TRUE
```

得：往返生同群列，確 `parse_piles()` 與 `to_piles()` 為逆。

敗則：往返異者，察序者是否規範化記（如片 ID 排序或範化為顯列）。範差可受，唯 `identical(groups, groups2)` 須返 `TRUE`。

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

- [ ] `validate_piles_syntax()` 對有效串返 TRUE
- [ ] `parse_piles()` 返正群列
- [ ] 往返序保群
- [ ] 關鍵字以拼圖脈絡正解
- [ ] 無效語法生明訛辭

## 陷

- **關鍵字無拼圖脈絡**：如 `"center"` 之關鍵字需拼圖果物。傳於 `parse_fusion()`，非 `parse_piles()`。
- **片始於一**：片 ID 始於 1，非 0。
- **鄰與非鄰之合**：合非鄰片可行而生意外之視果。可時驗鄰。
- **範之記**：`"1:6"` 含兩端（1, 2, 3, 4, 5, 6）。

## 參

- `generate-puzzle` — 生含融群之拼圖
- `add-puzzle-type` — 新類需 PILES/融之支
- `run-puzzle-tests` — 全套試 PILES 之析
