---
name: verify-agent-output
locale: wenyan
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

# 驗臣之出

立可驗之交。一臣所生之出為他臣所用——或人所賴——之交需逾「似可」。此術定執之前定可察之期、行中為作之側產生證、後以外錨而非自評驗交之法。核則：忠不可內測。臣不能可信驗自壓之出；驗需外參。

## 用時

- 多臣流自一臣交於他臣
- 臣生人所賴之外向之出（報、碼、部）
- 臣摘、壓、變數，摘必忠表源
- 團合作模需員間結構交之驗
- 需立信之界——定何需驗、何可信
- 為合或可重需審跡

## 入

- **必要**：欲驗之交（文、物、報、結構出）
- **必要**：期果之規（「畢」何似）
- **可選**：源材（為摘或變之忠察）
- **可選**：信界分類（`cross-agent`、`external-facing`、`internal`）
- **可選**：驗深（`spot-check`、`full`、`sample-based`）

## 法

### 第一步：定期果之規

執前書「畢」何似為一組具、可察之條。避主觀之準（「良質」），用可驗之斷。

可察條之類：

- **存**：文於徑存、端應、錄存於庫
- **形**：出有 N 列、JSON 合綱、函有期之簽
- **內**：值於範、串配模、列含必項
- **行**：試套過、命退 0、API 返期狀碼
- **一致**：出雜湊配入雜湊、變後行數保、總協

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

得：書之規，每交至少有一可察條。每條機可驗（可由本或命察，非僅讀而判）。

敗則：期果不能具述者，任本身欠規。前進前推回任之定——糊期生不可驗之工。

### 第二步：執中生證跡

工進時，為作之側生結構證。證跡非別之驗步——乃執本身所生。

捕之證類：

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

生證之實命：

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

得：`evidence/` 域（或結構記）含每生物之少雜湊與時。證為作之側生，非事後重構。

敗則：生證礙執者，捕能捕者勿阻工。少於畢後錄文雜湊——此使後驗可，雖未即時捕。

### 第三步：對期果驗交

執後，對第一步之規察交。用外錨——試套、綱驗、雜湊、行數——而非問生臣「正乎？」。

依類之驗察：

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

得：諸察皆過。果以結構出（每條 PASS/FAIL）並第二步之證跡記。

敗則：勿默納部分過。任 FAIL 觸第六步之結構不合過。記何過何敗——部分果亦寶證。

### 第四步：行壓出之忠察

臣摘、壓、變數時，出本小於入。摘不能僅讀摘而驗——必對源較。用樣本點察驗忠。

法：

1. 自源材選隨樣（點察 3-5、徹察 10%）
2. 每樣項，驗其於壓出中正表
3. 察捏造之內——出中無源之項

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

文摘無精配可者，驗主斷：

- 引之統計配源
- 摘中名實存於源
- 因斷或排序賴底數
- 摘中無源所無之項

得：諸樣項皆正表。無捏造內。摘中主統計配源計值。

敗則：忠察敗者，摘不可信。以第六步之結構不合式報精差。生臣須自源重摘，非補現出。

### 第五步：分信界

非皆需驗。過驗自身有代——緩執、增複、且或於驗過自身生假信。以信層分出，焦驗於要處。

信界分：

| 界 | 需驗 | 例 |
|----------|----------------------|----------|
| **跨臣交** | 是——常 | 臣甲生數臣乙用；員交交於領 |
| **外向出** | 是——常 | 交人之報、部碼、發包、API 應 |
| **壓/摘** | 是——樣本 | 任何小於入之出（摘、聚、提）|
| **內中** | 否——以雜湊信 | 暫文、中算果、步間內態 |
| **冪等操** | 否——驗一次 | 設文寫、定變、知入之純函 |

依比施驗：

- **跨臣交**：對期果規全驗（第三步）
- **外向出**：全驗加忠察若摘（三四步）
- **內中**：唯錄雜湊（第二步）——下游敗時按需驗
- **冪等操**：首執驗，重信

得：流中每交分入一信界類。驗力集於跨臣與外向界。

敗則：疑時，驗之。假信之代（納劣出）幾恆逾無用驗之代。默驗，唯有界安之證方放。

### 第六步：敗時報結構不合

驗敗時，生結構不合而非默納或默拒。結構不合使敗可行——告生臣（或人）何期、何受、差於何。

不合之式：

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

不合報之要則：

- **具體**：「行 42、187、301 有 3 負分」非「某值誤」
- **含期與實**：差為要
- **分嚴重**：`error`（阻納）、`warning`（納而注）、`info`（記）
- **薦行**：修而再行 對 納而注 對 拒
- **勿默納**：社信（「他臣云此可」）為攻路。信證，非斷

得：每驗敗生結構不合，至少含：敗之察、期值、實值、嚴重分。

敗則：驗過自身敗者（如驗本訛出），報為元敗。不能驗自為發現——示交於現形不可驗，較知敗更劣。

## 驗

- [ ] 期果規於執前存
- [ ] 規含唯機可驗條（無主觀準）
- [ ] 證跡執中生（雜湊、時、試果）
- [ ] 證為作之側，非別之事後步
- [ ] 交對外錨驗（試、綱、雜湊）
- [ ] 無交以問生者「正乎？」驗
- [ ] 壓或摘出含樣忠察
- [ ] 忠察對源材較，非對摘自身
- [ ] 信界已分（跨臣、外、內）
- [ ] 驗力依信界嚴比
- [ ] 驗敗生結構不合（期 對 實）
- [ ] 無驗敗默納或默拒

## 陷

- **以問生者驗出**：臣不能可信驗自工。「我察似正」非驗——外錨（試、雜湊、綱）為驗。如 rtamind 觀：忠不可內測
- **過驗內中**：每暫文每中果皆驗增銷而不增可靠。分信界（第五步），焦驗於跨臣與外向出
- **主觀期果**：「報宜高質」不可察。「報含 Summary、Methodology、Results 段，諸引統計皆配源計值」可察。不能書察者，不能驗
- **事後重構證**：事後生證（「我計我所信生之雜湊」）不可信。證必為執之側，即時捕。重構之證僅證今存，非所生
- **視驗為無誤**：驗自身有蟲。試套過不謂碼正——謂碼足試。驗依比並認其限，勿視綠勾為絕真
- **默納部分過**：十察過九，交仍敗。報一敗為結構不合。部分分為評；交為二
- **以社信代之**：「臣甲可靠，故略驗」為攻路。如 Sentinel_Orol 注，無驗之信可被利。依界分驗，非依生者譽
- **混系上之 R 二進**：WSL 或 Docker 上，`Rscript` 或解為跨平包而非原 R。以 `which Rscript && Rscript --version` 察。為可靠用原 R 二進（如 Linux/WSL 上 `/usr/local/bin/Rscript`）。R 徑設見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)

## 參

- `fail-early-pattern` — 互補：早敗於始捕劣入；驗臣之出於終捕劣出
- `security-audit-codebase` — 重關：安審驗碼合安期，為交驗之特例
- `honesty-humility` — 互補：誠臣承不確，使驗缺顯而非掩
- `review-skill-format` — 驗臣之出可驗 SKILL.md 合格式，為交驗之具例
- `create-team` — 合多臣之團，每合作步益於結構交驗
- `test-team-coordination` — 試團交是否生可驗交，端到端行此術之法
