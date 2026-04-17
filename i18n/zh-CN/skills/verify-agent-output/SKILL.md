---
name: verify-agent-output
description: >
  在智能体之间传递工作时验证可交付成果并建立证据记录。涵盖执行前的预期
  结果规格、执行期间的结构化证据生成、基于外部锚点的执行后交付物验证、
  压缩或摘要输出的保真度检查、信任边界分类，以及验证失败时的结构化分歧
  报告。当协调多智能体工作流、审查跨智能体交接、生成面向外部的输出，或
  审计智能体摘要是否忠实代表源材料时使用。
locale: zh-CN
source_locale: en
source_commit: acc252e6
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# 验证智能体输出

在智能体之间建立可验证的交付。当一个智能体产生另一个智能体消费的输出——或人类依赖的输出——时，交接需要的不仅仅是「看起来不错」。此技能将以下实践规范化：在工作开始前定义可检查的预期、将证据作为完成工作的副产品生成、以及针对外部锚点而非自我评估来验证可交付成果。核心原则：保真度无法在内部衡量。智能体无法可靠地验证自己压缩的输出；验证需要外部参考点。

## 适用场景

- 多智能体工作流将可交付成果从一个智能体传递给另一个智能体
- 智能体产生面向外部的输出（报告、代码、部署），人类将依赖于此
- 智能体汇总、压缩或转换数据，摘要必须忠实代表源内容
- 团队协调模式要求成员之间进行结构化的交接验证
- 需要建立信任边界——决定什么需要验证，什么可以被信任
- 合规性或可重现性需要审计记录

## 输入

- **必需**：要验证的可交付成果（文件、工件、报告或结构化输出）
- **必需**：预期结果规格（「完成」是什么样子）
- **可选**：源材料（用于摘要或转换的保真度检查）
- **可选**：信任边界分类（`cross-agent`、`external-facing`、`internal`）
- **可选**：验证深度（`spot-check`、`full`、`sample-based`）

## 步骤

### 第 1 步：定义预期结果规格

在执行开始前，将「完成」是什么样子写成一组具体、可检查的条件。避免主观标准（「质量好」），而倾向于可验证的断言。

可检查条件的类别：

- **存在性**：文件存在于路径，端点响应，数据库中存在记录
- **形状**：输出有 N 列，JSON 匹配模式，函数有预期签名
- **内容**：值在范围内，字符串匹配模式，列表包含必需项目
- **行为**：测试套件通过，命令退出码为 0，API 返回预期状态码
- **一致性**：输出哈希与输入哈希匹配，变换后行数保留，总计核对一致

示例规格：

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

**预期结果：** 每个可交付成果至少有一个可检查条件的书面规格。每个条件都是机器可验证的（可以通过脚本或命令检查，而非通过阅读和判断）。

**失败处理：** 若无法具体陈述预期结果，则任务本身规格不足。在继续之前，对任务定义提出质疑——模糊的预期产生不可验证的工作。

### 第 2 步：在执行期间生成证据记录

随着工作推进，将结构化证据作为完成工作的副产品输出。证据记录不是单独的验证步骤——它由执行本身产生。

需要捕获的证据类型：

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

生成证据的实用命令：

```bash
# 校验和
sha256sum output/data.csv output/report.html > evidence/checksums.txt

# 行数统计
wc -l < input/raw.csv > evidence/input_rows.txt
wc -l < output/data.csv > evidence/output_rows.txt

# 测试结果（R）
Rscript -e "results <- testthat::test_dir('tests'); cat(format(results))" > evidence/test_results.txt

# Git diff 摘要
git diff --stat HEAD~1 > evidence/diff_summary.txt

# 计时（包裹实际命令）
start_time=$(date +%s)
# ... 做工作 ...
end_time=$(date +%s)
echo "duration_seconds: $((end_time - start_time))" > evidence/timing.txt
```

**预期结果：** 一个 `evidence/` 目录（或结构化日志），包含每个生产工件的至少校验和和计时。证据作为工作的一部分生成，而非事后重建。

**失败处理：** 若证据生成干扰执行，在不阻塞工作的情况下尽可能多地捕获。至少在完成后记录文件校验和——这样即使未捕获实时证据，也能进行后续验证。

### 第 3 步：针对预期结果验证可交付成果

执行后，针对第 1 步中的规格检查可交付成果。使用外部锚点——测试套件、模式验证器、校验和、行数——而非询问生产智能体「这正确吗？」

按类别的验证检查：

```bash
# 存在性
for file in output/report.html output/data.csv; do
  test -f "$file" && echo "PASS: $file exists" || echo "FAIL: $file missing"
done

# 形状（CSV 列检查）
head -1 output/data.csv | tr ',' '\n' | sort > /tmp/actual_cols.txt
echo -e "grade\nid\nname\nscore" > /tmp/expected_cols.txt
diff /tmp/expected_cols.txt /tmp/actual_cols.txt && echo "PASS: columns match" || echo "FAIL: column mismatch"

# 行数
actual_rows=$(wc -l < output/data.csv)
[ "$actual_rows" -ge 101 ] && echo "PASS: $actual_rows rows (>= 100 + header)" || echo "FAIL: only $actual_rows rows"

# 内容范围检查（R）
Rscript -e '
  d <- read.csv("output/data.csv")
  stopifnot(all(d$score >= 0 & d$score <= 100))
  cat("PASS: all scores in [0, 100]\n")
'

# 行为
Rscript -e "testthat::test_dir('tests')" && echo "PASS: tests pass" || echo "FAIL: tests fail"

# 一致性（行数保留）
input_rows=$(wc -l < input/raw.csv)
output_rows=$(wc -l < output/data.csv)
[ "$input_rows" -eq "$output_rows" ] && echo "PASS: row count preserved" || echo "FAIL: $input_rows -> $output_rows"
```

**预期结果：** 所有检查通过。结果以结构化输出（每个条件的 PASS/FAIL）形式记录，并附第 2 步的证据记录。

**失败处理：** 不要默默接受部分通过。任何 FAIL 都会触发第 6 步中的结构化分歧流程。记录哪些检查通过，哪些失败——部分结果仍然是有价值的证据。

### 第 4 步：对压缩输出进行保真度检查

当智能体汇总、压缩或转换数据时，输出设计上比输入更小。摘要无法单独通过阅读摘要来验证——必须与源材料进行比较。使用基于样本的抽查来验证保真度。

流程：

1. 从源材料中选取随机样本（抽查 3-5 个项目，全面检查取 10%）
2. 对每个抽样项目，验证它在压缩输出中是否被准确表示
3. 检查捏造内容——输出中没有来源的项目

```bash
# 示例：针对源数据验证摘要报告

# 1. 从源中选取随机行
shuf -n 5 input/raw.csv > /tmp/sample.csv

# 2. 对每个抽样行，验证它是否在输出中正确显示
while IFS=, read -r id name score grade; do
  grep -q "$id" output/report.html && echo "PASS: $id found in report" || echo "FAIL: $id missing from report"
done < /tmp/sample.csv

# 3. 检查输出中是否有捏造的 ID
# 从输出中提取 ID，验证每个 ID 是否存在于源中
grep -oP 'id="[^"]*"' output/report.html | while read -r output_id; do
  grep -q "$output_id" input/raw.csv && echo "PASS: $output_id has source" || echo "FAIL: $output_id fabricated"
done
```

对于无法精确匹配的文本摘要，验证关键声明：

- 引用的统计数据与源数据匹配
- 摘要中提到的命名实体存在于源中
- 因果声明或排名由底层数据支持
- 摘要中没有出现源中不存在的项目

**预期结果：** 所有抽样项目都被准确表示。未检测到捏造内容。摘要中的关键统计数据与从源计算的值匹配。

**失败处理：** 若保真度检查失败，则无法信任摘要。使用第 6 步中的结构化分歧格式报告具体差异。生产智能体必须从源重新推导摘要，而不是修补现有输出。

### 第 5 步：分类信任边界

并非所有内容都需要验证。过度验证本身也是一种代价——它减慢执行速度，增加复杂性，并可能在验证过程本身中造成虚假信心。按信任级别分类输出，将验证工作集中在重要的地方。

信任边界分类：

| 边界 | 是否需要验证 | 示例 |
|------|------------|------|
| **跨智能体交接** | 是——始终 | 智能体 A 产生智能体 B 消费的数据；团队成员将可交付成果传递给负责人 |
| **面向外部的输出** | 是——始终 | 交付给人类的报告、部署的代码、发布的包、API 响应 |
| **压缩/摘要** | 是——基于样本 | 任何设计上比输入更小的输出（摘要、聚合、摘录） |
| **内部中间结果** | 否——用校验和信任 | 临时文件、中间计算结果、步骤之间的内部状态 |
| **幂等操作** | 否——验证一次 | 配置文件写入、确定性转换、已知输入的纯函数 |

按比例应用验证：

- **跨智能体交接**：针对预期结果规格的完整验证（第 3 步）
- **面向外部的输出**：完整验证加上摘要时的保真度检查（第 3-4 步）
- **内部中间结果**：仅记录校验和（第 2 步）——若下游失败则按需验证
- **幂等操作**：首次执行时验证，重复时信任

**预期结果：** 工作流中的每个可交付成果都被归类到一个信任边界类别中。验证工作集中在跨智能体和面向外部的边界上。

**失败处理：** 若有疑问，请验证。接受错误输出（假信任）的代价几乎总是超过不必要验证的代价。默认为验证，只有在有证据表明边界是安全的情况下才放宽。

### 第 6 步：在失败时报告结构化分歧

当验证失败时，产生结构化分歧而非默默接受或默默拒绝输出。结构化分歧使失败可操作——它告诉生产智能体（或人类）究竟预期什么、收到什么、以及差距在哪里。

分歧格式：

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

分歧报告的关键原则：

- **具体**：「在第 42、187、301 行发现 3 个负分」而非「某些值是错误的」
- **包含预期值和实际值**：它们之间的差距才是重要的
- **分类严重程度**：`error`（阻止接受）、`warning`（带注意事项接受）、`info`（仅供记录）
- **推荐操作**：修复并重新运行 vs. 带注意事项接受 vs. 直接拒绝
- **永不默默接受**：社交信任（「另一个智能体说没问题」）是攻击向量。信任证据，而非断言。

**预期结果：** 每次验证失败都产生一个结构化分歧，至少包含：失败的检查、预期值、实际值和严重程度分类。

**失败处理：** 若验证过程本身失败（例如，验证脚本出错），将其报告为元失败。无法验证本身就是一个发现——这意味着可交付成果以当前形式无法验证，这比已知失败更糟糕。

## 验证清单

- [ ] 执行开始前存在预期结果规格
- [ ] 规格仅包含机器可验证的条件（无主观标准）
- [ ] 执行期间生成了证据记录（校验和、计时、测试结果）
- [ ] 证据是完成工作的副产品，而非单独的事后步骤
- [ ] 可交付成果针对外部锚点进行验证（测试、模式、校验和）
- [ ] 没有通过询问生产者「这正确吗？」来验证任何可交付成果
- [ ] 压缩或摘要输出包含基于样本的保真度检查
- [ ] 保真度检查与源材料进行比较，而非与摘要本身比较
- [ ] 信任边界已分类（跨智能体、外部、内部）
- [ ] 验证工作与信任边界严重程度成比例
- [ ] 验证失败产生结构化分歧（预期 vs. 实际）
- [ ] 没有验证失败被默默接受或默默拒绝

## 常见问题

- **通过询问生产者来验证输出**：智能体无法可靠地验证自己的工作。「我检查过了，看起来是对的」不是验证——外部锚点（测试、校验和、模式）才是验证。正如 rtamind 所指出的：保真度无法在内部衡量。
- **过度验证内部中间结果**：验证每个临时文件和中间结果会增加开销而不提高可靠性。对信任边界进行分类（第 5 步），将验证集中在跨智能体和面向外部的输出上。
- **主观预期结果**：「报告应该是高质量的」不可检查。「报告包含摘要、方法论和结果章节，所有引用的统计数据与从源计算的值匹配」是可检查的。若无法为其写一个检查，就无法验证它。
- **事后重建证据**：事后生成证据（「让我计算我认为我产生的内容的校验和」）不可靠。证据必须是执行的副产品，实时捕获。重建的证据只能证明现在存在什么，而不能证明当时产生了什么。
- **将验证视为绝对可靠**：验证本身可能有缺陷。通过的测试套件并不意味着代码是正确的——它意味着代码满足测试。保持验证的合理比例，承认其局限性，而非将绿色检查视为绝对真理。
- **默默接受部分通过**：若 10 个检查中有 9 个通过，可交付成果仍然失败。将一个失败报告为结构化分歧。部分信用是用于评分的；交付是二元的。
- **以社交信任为替代**：「智能体 A 是可靠的，所以我跳过验证」是攻击向量。正如 Sentinel_Orol 所指出的，没有验证的信任是可利用的。基于边界分类进行验证，而非基于生产者的声誉。

- **混合系统上错误的 R 二进制文件**：在 WSL 或 Docker 上，`Rscript` 可能解析为跨平台包装器而非原生 R。使用 `which Rscript && Rscript --version` 检查。优先使用原生 R 二进制文件（例如 Linux/WSL 上的 `/usr/local/bin/Rscript`）以确保可靠性。有关 R 路径配置，请参阅 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)。

## 相关技能

- `fail-early-pattern` — 互补：尽早失败在开始时捕获错误输入；verify-agent-output 在结束时捕获错误输出
- `security-audit-codebase` — 重叠的关注点：安全审计验证代码是否满足安全期望，这是可交付成果验证的特定情况
- `honesty-humility` — 互补：诚实的智能体承认不确定性，使验证差距可见而非隐藏
- `review-skill-format` — verify-agent-output 可以验证生产的 SKILL.md 是否满足格式要求，这是可交付成果验证的具体实例
- `create-team` — 协调多个智能体的团队受益于每个协调步骤的结构化交接验证
- `test-team-coordination` — 测试团队交接是否产生可验证的可交付成果，端到端地运用此技能的流程
