---
name: run-puzzle-tests
locale: wenyan-lite
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

# 執行拼圖測試

執行 jigsawR 測試套件並解讀結果。

## 適用時機

- 修改套件中任何 R 源碼後
- 新增拼圖類型或功能後
- 提交變更前以確認無故障
- 對特定測試失敗進行除錯

## 輸入

- **必要**：測試範圍（`full`、`filtered` 或 `single`）
- **選擇性**：過濾模式（用於 filtered 模式，如 `"snic"`、`"rectangular"`）
- **選擇性**：特定測試文件路徑（用於 single 模式）

## 步驟

### 步驟一：選擇測試範圍

| 範圍 | 適用時機 | 時長 |
|-------|----------|----------|
| Full | 提交前、重大變更後 | 約 2-5 分 |
| Filtered | 處理單一拼圖類型 | 約 30 秒 |
| Single | 對特定測試文件除錯 | 約 10 秒 |

**預期：** 依當前工作流程選擇測試範圍：提交前用全套件、處理特定拼圖類型時用過濾、除錯單一測試時用單文件。

**失敗時：** 若不確定用何範圍，預設用全套件。較久但可捕跨類型回歸。

### 步驟二：建立並執行測試腳本

**全套件**：

建立腳本文件（如 `/tmp/run_tests.R`）：

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**依模式過濾**：

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**單一文件**：

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

**預期：** 測試輸出含通過/失敗/跳過計數。

**失敗時：**
- 切勿用 `--vanilla` 旗標；renv 需 `.Rprofile` 以啟動
- 若 renv 出錯，先執行 `renv::restore()`
- 若複雜命令以 Exit code 5 失敗，改寫至腳本文件

### 步驟三：解讀結果

尋找摘要行：

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**：成功之測試
- **FAIL**：失敗之測試（需調查）
- **SKIP**：跳過之測試（通常因缺少選擇性套件如 `snic`）
- **WARN**：測試中之警告（審視但不阻塞）

**預期：** 摘要行已解析以識別 PASS、FAIL、SKIP 與 WARN 計數。乾淨之執行 FAIL = 0。

**失敗時：** 若摘要行不可見，測試執行器可能於完成前崩潰。檢查摘要上方之 R 級錯誤。若輸出截斷，重定向至文件：`"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`。

### 步驟四：調查失敗

若測試失敗：

1. 讀失敗訊息——其含文件、行與預期 vs 實際
2. 檢查為新失敗或既有
3. 對斷言失敗，讀測試與被測函數
4. 對錯誤失敗，檢查函數簽章是否變更

```bash
# Run just the failing test with verbose output
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

**預期：** 各失敗測試之根因已識別。失敗或為真實回歸（代碼需修）或為測試環境問題（缺依賴、路徑問題）。

**失敗時：** 若失敗訊息不清，於測試中加入 `browser()` 或 `print()` 語句並以 `testthat::test_file()` 重新執行作互動除錯。

### 步驟五：驗證跳過原因

當缺選擇性依賴時跳過測試屬正常：

- `snic` 套件測試以 `skip_if_not_installed("snic")` 跳過
- 須特定 OS 之測試以 `skip_on_os()` 跳過
- 僅 CRAN 之跳過以 `skip_on_cran()`

確認跳過原因合理，未掩蓋真實失敗。

**預期：** 所有跳過皆有合理理由（選擇性依賴未安裝、平台特定跳過、僅 CRAN 跳過）。無跳過掩蓋實際測試失敗。

**失敗時：** 若某跳過可疑，暫時移除 `skip_if_*()` 呼叫並執行測試以見其通過或揭露隱藏失敗。

## 驗證

- [ ] 所有測試通過（FAIL = 0）
- [ ] 無非預期警告
- [ ] 跳過計數符合預期（僅選擇性依賴之跳過）
- [ ] 測試計數未減少（無測試誤刪）

## 常見陷阱

- **使用 `--vanilla`**：破壞 renv 啟動。對 jigsawR 切勿用之。
- **複雜 `-e` 字串**：Shell 跳脫問題引發 Exit code 5。改用腳本文件。
- **過時之套件狀態**：若變更 NAMESPACE 影響之代碼，測試前執行 `devtools::load_all()` 或 `devtools::document()`。
- **缺測試依賴**：部分測試需建議套件。檢查 `DESCRIPTION` 之 Suggests 欄。
- **平行測試問題**：若測試相互干擾，以 `testthat::test_file()` 順序執行。

## 相關技能

- `generate-puzzle` — 產生拼圖以驗證行為符合測試
- `add-puzzle-type` — 新類型需全面測試套件
- `write-testthat-tests` — 撰寫 R 測試之通用模式
- `validate-piles-notation` — 獨立測試 PILES 解析
