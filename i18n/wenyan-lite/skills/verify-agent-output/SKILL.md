---
name: verify-agent-output
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Validate deliverables and build evidence trails when work passes between
  agents. Covers expected outcome specification before execution, structured
  evidence generation during execution, deliverable validation against
  external anchors after execution, fidelity checks for compressed or
  summarized outputs, trust boundary classification, and structured
  disagreement reporting on verification failure. Use when coordinating
  multi-agent workflows, reviewing cross-agent handoffs, producing
  external-facing outputs, or auditing whether an agent's summary
  faithfully represents its source material.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: verification, trust, evidence-trail, deliverable-validation, inter-agent, quality-assurance
---

# 驗證代理輸出

於代理間建立可驗之交付。當一代理產出由另一代理消費——或人類所依賴——之輸出時,該交接需勝於「看起來不錯」。本技能將以下實踐法典化：工作開始前定義可檢期望、將產生證據作為工作之副作用,並對外部錨點驗證交付而非自評。核心原則：保真不可內部測得。代理無法可靠驗證其自身壓縮輸出；驗證需外部參考點。

## 適用時機

- 多代理工作流自一代理向另一代理交付物
- 代理產出人類所依賴之對外輸出（報告、代碼、部署）
- 代理摘要、壓縮或變換資料,且摘要須忠實代表來源
- 團隊協調模式需於成員間結構化交接驗證
- 需建立信任邊界——決定何者需驗證、何者可信
- 為合規或可重現性需稽核軌跡

## 輸入

- **必要**：欲驗證之交付物（文件、產物、報告或結構化輸出）
- **必要**：預期結果規範（「完成」之樣貌）
- **選擇性**：原始材料（用於摘要或變換之保真檢查）
- **選擇性**：信任邊界分類（`cross-agent`、`external-facing`、`internal`）
- **選擇性**：驗證深度（`spot-check`、`full`、`sample-based`）

## 步驟

### 步驟一：定義預期結果規範

執行開始前,將「完成」之樣貌寫為一組具體可檢條件。避免主觀準則（「品質好」）,改用可驗證之斷言。

可檢條件之類別：

- **存在性**：路徑下文件存在、端點回應、資料庫中記錄存在
- **形狀**：輸出有 N 欄、JSON 匹配綱要、函式具預期簽章
- **內容**：值於範圍內、字串匹配模式、列表含必要項目
- **行為**：測試組通過、命令退出 0、API 返回預期狀態碼
- **一致性**：輸出雜湊匹配輸入雜湊、變換後行數保留、總和對帳

範例規範：

```yaml
expected_outcome:
  existence:
    - path: "output/report.html"
    - path: "output/data.csv"
  shape:
    - file: "output/data.csv"
      columns: ["id", "name", "score", "grade"]
      min_rows: 100
  content:
    - file: "output/data.csv"
      column: "score"
      range: [0, 100]
    - file: "output/report.html"
      contains: ["Summary", "Methodology", "Results"]
  behavior:
    - command: "Rscript -e 'testthat::test_dir(\"tests\")'"
      exit_code: 0
  consistency:
    - check: "row_count"
      source: "input/raw.csv"
      target: "output/data.csv"
      tolerance: 0
```

**預期：** 一份書面規範,每交付物至少一條可檢條件。每條件可機器驗證（可由腳本或命令檢查,非僅讀後判斷）。

**失敗時：** 若預期結果無法具體陳述,任務本身規範不足。進行前對任務定義反推——含糊期望產出不可驗之工作。

### 步驟二：執行中產生證據軌跡

工作進行時,將結構化證據作為工作之副作用發出。證據軌跡非分離之驗證步驟——其由執行本身產生。

欲擷取之證據類型：

```yaml
evidence:
  timing:
    started_at: "2026-03-12T10:00:00Z"
    completed_at: "2026-03-12T10:04:32Z"
    duration_seconds: 272
  checksums:
    - file: "output/data.csv"
      sha256: "a1b2c3..."
    - file: "output/report.html"
      sha256: "d4e5f6..."
  test_results:
    total: 24
    passed: 24
    failed: 0
    skipped: 0
  diff_summary:
    files_changed: 3
    insertions: 47
    deletions: 12
  tool_versions:
    r: "4.5.2"
    testthat: "3.2.1"
```

產生證據之實用命令：

```bash
# Checksums
sha256sum output/data.csv output/report.html > evidence/checksums.txt

# Row counts
wc -l < input/raw.csv > evidence/input_rows.txt
wc -l < output/data.csv > evidence/output_rows.txt

# Test results (R)
Rscript -e "results <- testthat::test_dir('tests'); cat(format(results))" > evidence/test_results.txt

# Git diff summary
git diff --stat HEAD~1 > evidence/diff_summary.txt

# Timing (wrap the actual command)
start_time=$(date +%s)
# ... do the work ...
end_time=$(date +%s)
echo "duration_seconds: $((end_time - start_time))" > evidence/timing.txt
```

**預期：** 一個 `evidence/` 目錄（或結構化日誌）至少含每產出產物之雜湊與時間。證據作為工作之一部分產生,非事後重建。

**失敗時：** 若證據生成干擾執行,擷取可獲者而不阻塞工作。最低限度,完成後記錄文件雜湊——此使後續驗證得行,即便未即時擷取證據。

### 步驟三：對預期結果驗證交付物

執行後,對照步驟一之規範檢查交付物。用外部錨點——測試組、綱要驗證器、雜湊、行數——而非問產出代理「此正確否？」

依類別之驗證檢查：

```bash
# Existence
for file in output/report.html output/data.csv; do
  test -f "$file" && echo "PASS: $file exists" || echo "FAIL: $file missing"
done

# Shape (CSV column check)
head -1 output/data.csv | tr ',' '\n' | sort > /tmp/actual_cols.txt
echo -e "grade\nid\nname\nscore" > /tmp/expected_cols.txt
diff /tmp/expected_cols.txt /tmp/actual_cols.txt && echo "PASS: columns match" || echo "FAIL: column mismatch"

# Row count
actual_rows=$(wc -l < output/data.csv)
[ "$actual_rows" -ge 101 ] && echo "PASS: $actual_rows rows (>= 100 + header)" || echo "FAIL: only $actual_rows rows"

# Content range check (R)
Rscript -e '
  d <- read.csv("output/data.csv")
  stopifnot(all(d$score >= 0 & d$score <= 100))
  cat("PASS: all scores in [0, 100]\n")
'

# Behavior
Rscript -e "testthat::test_dir('tests')" && echo "PASS: tests pass" || echo "FAIL: tests fail"

# Consistency (row count preserved)
input_rows=$(wc -l < input/raw.csv)
output_rows=$(wc -l < output/data.csv)
[ "$input_rows" -eq "$output_rows" ] && echo "PASS: row count preserved" || echo "FAIL: $input_rows -> $output_rows"
```

**預期：** 所有檢查通過。結果以結構化輸出記錄（每條件 PASS/FAIL）,與步驟二之證據軌跡並列。

**失敗時：** 勿默默接受部分通過。任何 FAIL 觸發步驟六之結構化異議流程。記錄哪些檢查通過、哪些失敗——部分結果仍為寶貴證據。

### 步驟四：對壓縮輸出跑保真檢查

當代理摘要、壓縮或變換資料時,輸出按設計小於輸入。摘要不可僅讀摘要驗證——必對來源比較。用樣本式抽查驗證保真。

程序：

1. 自原始材料隨機選樣本（抽查 3-5 項、徹底檢查 10%）
2. 對每樣本項,驗證其於壓縮輸出中得正確呈現
3. 檢查捏造內容——輸出中之項目來源無對應

```bash
# Example: verify a summary report against source data

# 1. Select random rows from source
shuf -n 5 input/raw.csv > /tmp/sample.csv

# 2. For each sampled row, verify it appears correctly in the output
while IFS=, read -r id name score grade; do
  grep -q "$id" output/report.html && echo "PASS: $id found in report" || echo "FAIL: $id missing from report"
done < /tmp/sample.csv

# 3. Check for fabricated IDs in the output
# Extract IDs from output, verify each exists in source
grep -oP 'id="[^"]*"' output/report.html | while read -r output_id; do
  grep -q "$output_id" input/raw.csv && echo "PASS: $output_id has source" || echo "FAIL: $output_id fabricated"
done
```

對精確匹配不可能之文字摘要,驗證關鍵主張：

- 引用之統計值匹配來源資料
- 摘要中提及之命名實體存於來源
- 因果主張或排序由底層資料支持
- 摘要中無來源所無之項目

**預期：** 所有樣本項目得正確呈現。未偵測捏造內容。摘要中之關鍵統計值匹配來源計算之值。

**失敗時：** 若保真檢查失敗,摘要不可信。以步驟六之結構化異議格式報告具體差異。產出代理須自來源重新導出摘要,非修補既有輸出。

### 步驟五：分類信任邊界

非一切皆需驗證。過度驗證自有代價——拖慢執行、增複雜度,並可能對驗證流程本身產生虛假信心。依信任水準分類輸出,以將驗證精力集中於要緊處。

信任邊界分類：

| 邊界 | 需驗證 | 範例 |
|----------|----------------------|----------|
| **跨代理交接** | 是——永遠 | 代理 A 產出資料供代理 B 消費；隊員傳交付物予主導者 |
| **對外輸出** | 是——永遠 | 交予人類之報告、已部署代碼、發布套件、API 回應 |
| **壓縮/摘要** | 是——樣本式 | 任何按設計小於其輸入之輸出（摘要、聚合、抽取）|
| **內部中間** | 否——以雜湊信任 | 暫存文件、中間計算結果、步驟間之內部狀態 |
| **冪等操作** | 否——驗證一次 | 配置文件寫入、確定性變換、已知輸入之純函式 |

按比例應用驗證：

- **跨代理交接**：對預期結果規範完整驗證（步驟三）
- **對外輸出**：完整驗證加保真檢查（若摘要）（步驟三-四）
- **內部中間**：僅記錄雜湊（步驟二）——下游失敗時按需驗證
- **冪等操作**：首次執行時驗證,重複時信任

**預期：** 工作流中每交付物皆分至信任邊界類別之一。驗證精力集中於跨代理與對外邊界。

**失敗時：** 若有疑,即驗證。虛信成本（接受不良輸出）幾乎永遠超過不必要驗證之成本。預設驗證,僅於有證據顯邊界安全時放鬆。

### 步驟六：失敗時報告結構化異議

驗證失敗時,產出結構化異議,而非默默接受或默默拒絕輸出。結構化異議使失敗可行——告訴產出代理（或人類）確切之預期、所收與差距所在。

異議格式：

```yaml
verification_result: FAIL
deliverable: "output/data.csv"
timestamp: "2026-03-12T10:04:32Z"
failures:
  - check: "row_count"
    expected: 500
    actual: 487
    severity: warning
    note: "13 rows dropped — investigate filter logic"
  - check: "score_range"
    expected: "[0, 100]"
    actual: "[-3, 100]"
    severity: error
    note: "3 negative scores found — data validation missing"
  - check: "column_presence"
    expected: "grade"
    actual: null
    severity: error
    note: "grade column missing from output"
passes:
  - check: "file_exists"
  - check: "checksum_stable"
  - check: "test_suite"
recommendation: >
  Re-run with input validation enabled. The score_range and column_presence
  failures suggest the transform step is not handling edge cases. Do not
  patch the output — fix the transform and re-execute from source.
```

異議報告之關鍵原則：

- **具體**：「於第 42、187、301 行發現 3 個負分」,而非「某些值有誤」
- **預期與實際皆含**：兩者間之差距為要緊處
- **分類嚴重性**：`error`（阻接受）、`warning`（接受但有保留）、`info`（記錄備案）
- **建議行動**：修復重跑、接受附保留、或徹底拒絕
- **永不默默接受**：社交信任（「另一代理說沒事」）為攻擊向量。信任證據,非斷言

**預期：** 每驗證失敗皆產生結構化異議,至少含：失敗之檢查、預期值、實際值、嚴重性分類。

**失敗時：** 若驗證流程本身失敗（如驗證腳本出錯）,將之報為元失敗。無法驗證本身即為發現——其意為交付物於當前形式不可驗,此較已知失敗更糟。

## 驗證

- [ ] 執行開始前已存在預期結果規範
- [ ] 規範僅含可機器驗證之條件（無主觀準則）
- [ ] 證據軌跡於執行中產生（雜湊、時間、測試結果）
- [ ] 證據為工作之副作用,非事後分離步驟
- [ ] 交付物對外部錨點驗證（測試、綱要、雜湊）
- [ ] 無交付物經由問其產出者「此正確否？」驗證
- [ ] 壓縮或摘要輸出含樣本式保真檢查
- [ ] 保真檢查對來源材料比較,非對摘要本身
- [ ] 信任邊界已分類（跨代理、對外、內部）
- [ ] 驗證精力與信任邊界嚴重性成比例
- [ ] 驗證失敗產生結構化異議（預期對實際）
- [ ] 無驗證失敗被默默接受或默默拒絕

## 常見陷阱

- **問產出者驗證輸出**：代理無法可靠驗證其自身工作。「我檢查過,看起來正確」非驗證——外部錨點（測試、雜湊、綱要）方為驗證。如 rtamind 觀察：保真不可內部測得
- **過度驗證內部中間**：驗證每暫存文件與中間結果增加開銷而不改善可靠性。分類信任邊界（步驟五）並聚焦驗證於跨代理與對外輸出
- **主觀預期結果**：「報告應為高品質」不可檢。「報告含 Summary、Methodology、Results 三段,且所有引用之統計值匹配自來源計算之值」可檢。若不能為其寫檢查,則不能驗證之
- **事後重建證據**：事後產生證據（「讓我計算我認為我產出之物之雜湊」）不可靠。證據須為執行之副作用,即時擷取。重建證據僅證明當前存在者,非曾產出者
- **將驗證視為絕對**：驗證本身可能有錯。通過之測試組不意味代碼正確——意味代碼滿足測試。保持驗證按比例,並承認其限制,而非將綠勾視為絕對真理
- **默默接受部分通過**：若 10 個檢查中 9 個通過,交付物仍失敗。將該一失敗報為結構化異議。部分學分用於評分；交付為二元
- **以社交信任為替代**：「代理 A 可靠,故跳過驗證」為攻擊向量。如 Sentinel_Orol 所注,信任而不驗證可被利用。依邊界分類驗證,非依產出者之名譽
- **混合系統上之 R 二進制錯誤**：於 WSL 或 Docker,`Rscript` 可能解析至跨平台包裝器而非原生 R。以 `which Rscript && Rscript --version` 檢查。為可靠性偏好原生 R 二進制（如 Linux/WSL 上之 `/usr/local/bin/Rscript`）。R 路徑配置見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)

## 相關技能

- `fail-early-pattern` — 互補：fail-early 於開頭捕獲不良輸入；verify-agent-output 於結尾捕獲不良輸出
- `security-audit-codebase` — 重疊關注：安全稽核驗證代碼符合安全期望,為交付驗證之特定情況
- `honesty-humility` — 互補：誠實代理承認不確定性,使驗證缺口可見而非掩藏
- `review-skill-format` — verify-agent-output 可驗證所產生之 SKILL.md 符合格式要求,為交付驗證之具體實例
- `create-team` — 協調多代理之團隊受益於每協調步驟之結構化交接驗證
- `test-team-coordination` — 測試團隊交接是否產生可驗交付物,端到端鍛鍊本技能之程序
