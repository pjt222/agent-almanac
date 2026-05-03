---
name: run-puzzle-tests
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Run the jigsawR test suite via WSL R execution. Supports full suite,
  filtered by pattern, or single file. Interprets pass/fail/skip counts
  and identifies failing tests. Never uses --vanilla flag (renv needs
  .Rprofile for activation). Use after modifying any R source code, after
  adding a new puzzle type or feature, before committing changes to verify
  nothing is broken, or when debugging a specific test failure.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, testing, testthat, renv, wsl
---

# 行拼測

行 jigsawR 測組釋果。

## 用

- 改 R 源後→用
- 增新拼類/功後→用
- 提前驗無破→用
- 除特測敗→用

## 入

- **必**：測範（`full`、`filtered`、`single`）
- **可**：濾式（`filtered` 模，如 `"snic"`、`"rectangular"`）
- **可**：特測檔徑（`single` 模）

## 行

### 一：擇範

| 範 | 用時 | 久 |
|----|-----|---|
| 全 | 提前、大改後 | ~2-5 分 |
| 濾 | 一拼類工 | ~30 秒 |
| 單 | 除特測 | ~10 秒 |

得：按工選範—提前用全、特類用濾、除錯用單。

敗：未定→默全。久而捕跨類退。

### 二：建行測本

**全組**：

建本檔（如 `/tmp/run_tests.R`）：

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**濾**：

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**單檔**：

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

得：測出含過/敗/跳。

敗：
- **勿**用 `--vanilla`；renv 需 `.Rprofile` 啟
- renv 誤→先 `renv::restore()`
- 複命 Exit 5→寫至本檔

### 三：解果

求總行：

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**：成
- **FAIL**：敗（須查）
- **SKIP**：跳（常因缺可選包如 `snic`）
- **WARN**：警（察非阻）

得：總行解 PASS、FAIL、SKIP、WARN。FAIL = 0 為清。

敗：總行不見→測器或於完前崩。察上 R 級誤。出截→重定至檔：`"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`。

### 四：查敗

若敗：

1. 讀敗訊—含檔、行、期 vs 實
2. 察新敗或舊存
3. 斷敗→讀測與被測函
4. 誤敗→查函簽改否

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

得：諸敗本因明。或為退（碼修）或為境問題（缺依、徑）。

敗：訊不明→測中加 `browser()`/`print()`、`testthat::test_file()` 互動除。

### 五：驗跳因

跳於缺可選依為常：

- `snic` 包測跳於 `skip_if_not_installed("snic")`
- 特 OS 跳於 `skip_on_os()`
- 僅 CRAN 跳於 `skip_on_cran()`

確跳因正當、非藏真敗。

得：諸跳有正因（可選不裝、平台、僅 CRAN）。無跳藏實敗。

敗：跳可疑→暫除 `skip_if_*()`、行測察過或露藏敗。

## 驗

- [ ] 諸測過（FAIL = 0）
- [ ] 無非期警
- [ ] 跳數合期（僅可選依跳）
- [ ] 測數不減（無誤除）

## 忌

- **用 `--vanilla`**：破 renv 啟。jigsawR 永勿用
- **複 `-e` 串**：殼義漏致 Exit 5。用本檔
- **舊包態**：改 NAMESPACE 影碼後先 `devtools::load_all()` 或 `devtools::document()`
- **缺測依**：察 `DESCRIPTION` Suggests
- **並測擾**：序行用 `testthat::test_file()`

## 參

- `generate-puzzle`
- `add-puzzle-type`
- `write-testthat-tests`
- `validate-piles-notation`
