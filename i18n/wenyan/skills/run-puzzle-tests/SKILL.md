---
name: run-puzzle-tests
locale: wenyan
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

# 行拼圖之試

行 jigsawR 之試套，並解其果。

## 用時

- 包中 R 之源已改乃用
- 新拼圖類或特徵已增乃用
- 提交之前驗無破乃用
- 察特試之敗乃用

## 入

- **必要**：試之範（`full`、`filtered`、或 `single`）
- **可選**：濾之模（為濾模，如 `"snic"`、`"rectangular"`）
- **可選**：特試文件之徑（為單模）

## 法

### 第一步：擇試之範

| 範 | 用時 | 時 |
|-------|----------|----------|
| Full | 提交之前、大變之後 | 約 2-5 分 |
| Filtered | 治一拼圖之類 | 約 30 秒 |
| Single | 察一試文件 | 約 10 秒 |

得：依當前所為擇範——提交之前用全套，治一類用濾，察一試用單。

敗則：不知擇何範，默用全套。雖久而能捕跨類之回退。

### 第二步：建並行試本

**全套**：

立本文件（如 `/tmp/run_tests.R`）：

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**依模濾之**：

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**單文件**：

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

得：試出附過/敗/略之數。

敗則：
- 勿用 `--vanilla` 旗；renv 需 `.Rprofile` 以啟
- renv 誤，先行 `renv::restore()`
- 繁命以退碼 5 敗者，書為本文件代之

### 第三步：解其果

察其總線：

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**：試之成
- **FAIL**：試之敗（須察）
- **SKIP**：試之略（常為缺選裝之包，如 `snic`）
- **WARN**：試中之警（察而不阻）

得：總線解之，識 PASS、FAIL、SKIP、WARN 之數。淨行則 FAIL = 0。

敗則：總線不見，試或於畢前崩。察其上之 R 級誤。出截斷者，重定於文件：`"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`。

### 第四步：察敗

試敗：

1. 讀敗辭——含文件、行、預期與實得
2. 察其為新敗或舊存
3. 斷言之敗，讀其試與所試之函
4. 誤之敗，察函之簽是否變

```bash
# Run just the failing test with verbose output
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

得：每敗試之根因已識。敗者，或實之回退（碼宜修），或試境之患（缺依、徑訛）。

敗則：敗辭不明，加 `browser()` 或 `print()` 於試，以 `testthat::test_file()` 重行為交互之察。

### 第五步：驗略之由

略之試，乃選依不存時之常：

- `snic` 包試以 `skip_if_not_installed("snic")` 略
- 需特 OS 之試以 `skip_on_os()` 略
- CRAN 唯之略以 `skip_on_cran()`

驗略之由皆正當，非掩實敗。

得：諸略皆有正當之由（選依未裝、平台特略、CRAN 唯略）。無略掩實之試敗。

敗則：略可疑，暫除其 `skip_if_*()` 而行其試，察其過或現藏敗。

## 驗

- [ ] 諸試皆過（FAIL = 0）
- [ ] 無意外之警
- [ ] 略數合預期（唯選依之略）
- [ ] 試數未降（無誤刪之試）

## 陷

- **用 `--vanilla`**：破 renv 之啟。jigsawR 永勿用之
- **繁之 `-e` 串**：殼轉義之患致退碼 5。用本文件
- **包之陳態**：改 NAMESPACE 之碼，試前先行 `devtools::load_all()` 或 `devtools::document()`
- **缺試依**：某試需 Suggests 之包。察 `DESCRIPTION` 之 Suggests
- **並試之患**：試相干，以 `testthat::test_file()` 序行

## 參

- `generate-puzzle` — 生拼圖以驗其行合試
- `add-puzzle-type` — 新類需備全試套
- `write-testthat-tests` — 寫 R 試之常模
- `validate-piles-notation` — 獨驗 PILES 之解
