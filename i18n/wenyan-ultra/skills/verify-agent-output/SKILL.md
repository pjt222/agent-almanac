---
name: verify-agent-output
locale: wenyan-ultra
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

# 驗客出

於工於客間或交人時立可驗交付。客間交付須過「似佳」之外。此技定執前可察期、執中生證、後對外錨驗——而非自評。本則：忠不可內測。客不能信驗己壓出；驗須外參。

## 用

- 多客流交付於客間→用
- 客生人賴外向出（報、碼、部署）→用
- 客摘、壓、變數、摘須忠表源→用
- 團協式須結構交付驗於員間→用
- 須立信界——定何須驗 vs 何可信→用
- 為合或可重須審跡→用

## 入

- **必**：欲驗之交付（檔、產、報、結構出）
- **必**：期果規（「成」何似）
- **可**：源材（為摘或變之忠察）
- **可**：信界類（`cross-agent`、`external-facing`、`internal`）
- **可**：驗深（`spot-check`、`full`、`sample-based`）

## 行

### 一：定期果規

執前書「成」何似為具體可察條集。免主觀標（「質佳」）、用可驗斷。

可察條類：

- **存**：檔於路、端應、記於庫
- **形**：出有 N 列、JSON 合綱、函有期簽
- **容**：值於範、串配式、列含必項
- **為**：試套過、命退 0、API 返期態
- **一**：出雜湊配入雜湊、變後行計保、總對

例規：

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

得：書規附每交付至少一可察條。每條機可驗（可由本或命察、非僅讀判）。

敗：期果不能具述→任本身規不足。先回任定，勿續——含混期生不可驗工。

### 二：執中生證跡

工進時，生結構證為執之副效。證跡非別驗步——由執自生。

證類：

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

實命為生證：

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

得：`evidence/` 目（或結構日）含每生品至少雜湊與時。證生為工之部，非後構。

敗：生證礙執→所能捕、不阻工。最少於畢後錄檔雜湊——使後驗可雖未實時捕證。

### 三：對期果驗交付

執後，按步一規察交付。用外錨——試套、綱驗、雜湊、行計——非問生客「正乎？」

按類驗察：

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

得：諸察過。果錄為結構出（每條 PASS/FAIL）並列證跡。

敗：勿默受部分過。任 FAIL 觸步六之結構不同程。錄何過何敗——部分果亦寶證。

### 四：壓出之忠察

客摘、壓、變時，出由設小於入。摘不可獨讀驗——須對源較。用樣察為點。

程：

1. 由源材選隨機樣（點察 3-5 項、徹察 10%）
2. 各樣項驗於壓出正表
3. 察捏內——出中無源之項

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

文摘無精配時，驗鍵據：

- 引統配源數
- 摘述名實存於源
- 因述或排有底數據支
- 摘無源無之項

得：諸樣項正表。無捏。摘鍵統配源算值。

敗：忠察敗→摘不可信。報特差以步六結構不同式。生客須由源重得摘、非補現出。

### 五：分信界

非諸皆須驗。過驗自有耗——緩執、增雜、生對驗本身之偽信。按信級分出以聚驗於要處。

信界類：

| 界 | 須驗 | 例 |
|----|------|-----|
| **客間交付** | 是——恆 | 客甲生數、客乙消；員交付予頭 |
| **外向出** | 是——恆 | 交人之報、部署碼、發包、API 應 |
| **壓/摘** | 是——按樣 | 由設小於入之出（摘、聚、抽） |
| **內中** | 否——以雜湊信 | 暫檔、中算果、步間內態 |
| **冪等行** | 否——首驗 | 配檔書、定變、純函含已知入 |

按比施驗：

- **客間交付**：對期果規全驗（步三）
- **外向出**：全驗加忠察若摘（步三-四）
- **內中**：僅錄雜湊（步二）——下游敗時按需驗
- **冪等行**：首執驗、後信

得：流中諸交付歸信界類之一。驗集於客間與外向界。

敗：疑時驗。偽信耗（受劣出）幾恆超無謂驗耗。默驗、僅有界安證乃寬。

### 六：敗時報結構不同

驗敗時，生結構不同非默受或默拒出。結構不同使敗可行——告生客（或人）期何、得何、隙在何。

不同式：

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

不同報則：

- **具體**：「行 42、187、301 覓 3 負分」非「某值誤」
- **附期與實**：間隙為要
- **分嚴**：`error`（阻受）、`warning`（受附保）、`info`（記錄）
- **建行**：修重 vs 受附保 vs 直拒
- **勿默受**：社信（「他客曰可」）為攻面。信證、非斷

得：每驗敗生結構不同附至少：敗察、期值、實值、嚴類。

敗：驗本身敗（如驗本誤出）→報為元敗。不能驗本身為發現——示交付現式不可驗，劣於已知敗。

## 驗

- [ ] 期果規於執前存
- [ ] 規僅含機可驗條（無主觀標）
- [ ] 執中生證跡（雜湊、時、試果）
- [ ] 證為工之副效，非後別步
- [ ] 交付對外錨驗（試、綱、雜湊）
- [ ] 無交付以問生者「正乎？」驗
- [ ] 壓或摘出含按樣忠察
- [ ] 忠察對源、非對摘
- [ ] 信界分（客間、外、內）
- [ ] 驗按信界嚴施
- [ ] 驗敗生結構不同（期 vs 實）
- [ ] 無驗敗默受或默拒

## 忌

- **問生者驗**：客不能信驗己工。「我察似正」非驗——外錨（試、雜湊、綱）為驗。如 rtamind 觀：忠不可內測
- **過驗內中**：驗每暫檔與中果增耗無增可靠。分信界（步五）、聚驗於客間與外向出
- **主觀期果**：「報應質佳」不可察。「報含 Summary、Methodology、Results 節，諸引統配源算值」可察。不能書察→不能驗
- **後構證**：後生證（「我算我以為生之雜湊」）不可靠。證須執副效、實時捕。後構證僅證今存、非當生
- **以驗為無誤**：驗自亦有蟲。試套過非碼正——僅謂碼合試。驗按比、認其限、勿以綠勾為絕
- **默受部分過**：10 察 9 過、交付仍敗。報一敗為結構不同。部分分為評；交付為二
- **以社信代**：「客甲可靠、略驗」為攻面。如 Sentinel_Orol 注：信無驗可剝。按界類驗、非按生者譽
- **混系誤 R 二進**：WSL 或 Docker 上，`Rscript` 或解為跨台包、非原生 R。`which Rscript && Rscript --version` 察。原生 R 二進為佳（如 Linux/WSL `/usr/local/bin/Rscript`）。R 路設見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)

## 參

- `fail-early-pattern` — 補：早敗捕入劣於初；驗客出捕出劣於末
- `security-audit-codebase` — 重疊：安審驗碼合安期，為交付驗特例
- `honesty-humility` — 補：誠客認不確，使驗隙顯非掩
- `review-skill-format` — 驗客出可驗生 SKILL.md 合式要，交付驗具例
- `create-team` — 協多客之團於每協步得結構交付驗
- `test-team-coordination` — 試團交付是否生可驗交付，端到端行此技程
