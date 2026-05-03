---
name: validate-piles-notation
locale: wenyan-lite
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

# 驗證 PILES 表示法

解析並驗證拼圖塊融合組之 PILES 表示法字串。

## 適用時機

- 將用戶提供之 PILES 字串傳予 `generate_puzzle()` 前先驗證
- 除錯融合組問題（合併之塊錯誤、預期外結果）
- 以白話為用戶解釋 PILES 表示法
- 測試往返保真：parse -> groups -> serialize -> parse

## 輸入

- **必要**：PILES 表示法字串（如 `"1-2-3,4-5"`）
- **選擇性**：拼圖結果物件（用於鄰接驗證與關鍵字解析）
- **選擇性**：拼圖類型（用於關鍵字支援如 `"center"`、`"ring1"`、`"R1"`）

## 步驟

### 步驟一：語法驗證

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# Returns TRUE if valid, error message if invalid
```

檢查常見語法錯誤：
- 不匹配之括號：`"1-2(-3)-4"` 中 `()` 不匹配
- 無效字元：僅允許數字、`-`、`,`、`:`、`(`、`)` 與關鍵字
- 空組：`"1-2,,3-4"`（雙逗號）

**預期：** 語法有效時為 `TRUE`,無效時為描述性錯誤。

**失敗時：** 印出確切之 PILES 字串與驗證錯誤訊息。

### 步驟二：解析為組

```r
groups <- parse_piles("1-2-3,4-5")
# Returns: list(c(1, 2, 3), c(4, 5))
```

對含範圍之字串：
```r
groups <- parse_piles("1:6,7-8")
# Returns: list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

**預期：** 整數向量之列表,每融合組一個,含正確之塊 ID 與組界。

**失敗時：** 先檢查 PILES 字串於步驟一已通過語法驗證。若解析返回意外之組,驗證 `-` 於組內分隔塊、`,` 分隔組,且範圍表示法（`:`）展開至包含端點。

### 步驟三：以白話解釋

為用戶描述各組：

- `"1-2-3,4-5"` -> 「組 1：融合塊 1、2 與 3。組 2：融合塊 4 與 5。」
- `"1:6"` -> 「組 1：融合塊 1 至 6（6 塊）。」
- `"center,ring1"` -> 「組 1：中心塊。組 2：環 1 中所有塊。」

**預期：** 各融合組以白話描述,含塊數與識別符,使非技術用戶得理解此表示法。

**失敗時：** 若關鍵字無法解釋（如 `"ring1"` 無清楚意義）,表示法可能需拼圖結果物件以提供上下文。建議用戶提供拼圖類型或改用數字塊 ID。

### 步驟四：對拼圖結果驗證（選擇性）

若有拼圖結果物件可用,驗證：

```r
# Generate the puzzle first
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# Parse with puzzle context (resolves keywords)
groups <- parse_fusion("center,ring1", puzzle)
```

檢查：
- 所有塊 ID 存於拼圖中
- 關鍵字解析為有效之塊集
- 融合塊實際相鄰（否則警告）

**預期：** 所有塊 ID 有效。相鄰塊融合潔淨。

**失敗時：** 列出無效之塊 ID 或不相鄰之配對。

### 步驟五：往返序列化

驗證 parse/serialize 之保真：

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip should equal original (or canonical equivalent)

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # Must be TRUE
```

**預期：** 往返產生相同之組列表,確認 `parse_piles()` 與 `to_piles()` 為互逆。

**失敗時：** 若往返結果不同,檢查序列化器是否將表示法規範化（如排序塊 ID 或將範圍轉為明列）。只要 `identical(groups, groups2)` 返回 `TRUE`,規範化差異可接受。

## PILES 速查

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

## 驗證

- [ ] `validate_piles_syntax()` 對有效字串返回 TRUE
- [ ] `parse_piles()` 返回正確之組列表
- [ ] 往返序列化保留組
- [ ] 關鍵字以拼圖上下文正確解析
- [ ] 無效語法產生清楚錯誤訊息

## 常見陷阱

- **無拼圖上下文之關鍵字**：諸如 `"center"` 之關鍵字需拼圖結果物件。將之傳予 `parse_fusion()`,非 `parse_piles()`
- **塊以 1 為基**：塊 ID 自 1 始,非 0
- **相鄰對非相鄰融合**：融合非相鄰塊可運作但可能產生意外視覺結果。盡可能驗證鄰接性
- **範圍表示法**：`"1:6"` 含兩端點（1、2、3、4、5、6）

## 相關技能

- `generate-puzzle` — 以融合組生成拼圖
- `add-puzzle-type` — 新類型需 PILES/融合支援
- `run-puzzle-tests` — 以完整測試組測試 PILES 解析
