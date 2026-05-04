---
name: sweep-flag-namespace
description: >
  Bulk-extract every candidate flag from a binary namespace, build an
  extraction inventory with occurrence counts and call-type tags, cross-
  reference against a documented set, and track completeness across probe
  campaigns until the undocumented remainder reaches zero. Covers namespace
  prefix harvesting, gate-vs-telemetry disambiguation at the call-site
  level, completeness metrics, DEFAULT-TRUE population reporting, and a
  final completion confirmation scan. Use upstream of probe-feature-flag-
  state when you need a complete catalog rather than a sample, or when a
  prior wave-based campaign needs a verifiable end condition.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: zh-CN
  source_locale: en
  source_commit: 90b159ab
  translator: "Claude + human review"
  translation_date: "2026-05-04"
---

# Sweep Flag Namespace

从二进制文件的命名空间中穷尽地提取每一个候选标志，将 gate 调用与遥测调用分离，并对照运行中的已记录集合追踪完整性，直到未记录的剩余项归零。`probe-feature-flag-state` 一次分类一个标志，而本技能则生成那些探测器所操作的目录，并确认目录何时完整。

## 适用场景

- 标志发现活动正在进行中，你需要一个可验证的停止条件，而不是猜测自己是否已经收集了"足够多"的标志。
- 二进制文件的标志命名空间很大（数百个候选字符串），基于抽样的方法存在遗漏关键 gate 的风险。
- 你需要将 DEFAULT-TRUE 标志与 DEFAULT-FALSE 分开报告——前者通常是任何命名空间中信号最强的子集。
- 你正在对某个二进制文件进行多轮记录工作，并希望以书面形式记录每一轮的完成度指标。
- 你怀疑此前的活动过早结束，需要通过新一次扫描来确认或反驳这一判断。

## 输入

- **必需**：你能读取的二进制文件或 bundle 文件。
- **必需**：用于识别所研究系统标志的命名空间前缀（合成示例：`acme_*`）。
- **必需**：工作中的记录集合——你的活动迄今为止产出的标志说明清单。
- **可选**：gate-reader 函数名（合成示例：`gate(...)`、`flag(...)`、`isEnabled(...)`）——预先准备好这些可以加速第 2 步。
- **可选**：遥测/emit 函数名——同理，但用途相反。
- **可选**：此二进制早期版本的扫描输出，用于差异分析。

## 步骤

### Step 1: 收集所有匹配命名空间前缀的字符串

提取二进制文件中所有匹配命名空间前缀的字面量，无论其在调用现场扮演何种角色。这一步的目标是*覆盖率*，而非分类。

```bash
BUNDLE=/path/to/cli/bundle.js
PREFIX=acme_                       # synthetic placeholder

# Pull every quoted string starting with the prefix
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort -u > /tmp/sweep-candidates.txt
wc -l /tmp/sweep-candidates.txt    # unique candidate count

# Per-string occurrence count (gives a first hint at gate-call density)
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort | uniq -c | sort -rn > /tmp/sweep-occurrences.txt
head /tmp/sweep-occurrences.txt
```

**预期结果：** 一份去重后的候选列表，以及一份按出现频率排序的发生次数文件。计数非常高（≥10）的字符串通常是 gate 密集型字符串；只出现一次的字符串更可能是遥测事件名或静态标签。

**失败处理：** 如果唯一计数为 0，说明前缀有误（拼写错误、命名空间边界不匹配，或代码中使用了与预期不同的约定）。如果计数超过约 5000，说明前缀过宽——在继续之前应当收窄，否则清单会变得难以管理。

### Step 2: 区分 gate 调用、遥测调用和静态标签

同一个字符串可能扮演不同的角色。在调用现场区分这些角色，才能让清单变得可操作。复用 `probe-feature-flag-state` 第 2 步中的区分准则。

对每个候选项，分类其每一次出现：

- **gate-call**——字符串作为 gate-reader 函数的第一个参数（`gate("$FLAG", default)`、`flag("$FLAG", ...)`、`isEnabled("$FLAG")` 等）。
- **telemetry-call**——字符串作为 emit/log/track 函数的第一个参数。
- **env-var-check**——字符串出现在 `process.env.X` 查找或等价表达式中。
- **static-label**——字符串出现在注册表、map 或注释中，没有任何行为挂钩。

```bash
# Count gate-call occurrences for the candidate set, using a synthetic
# reader-name pattern. Adapt the regex to the actual reader names found.
GATE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_'
grep -coE "$GATE_PATTERN" "$BUNDLE"

# Per-flag gate-call count
while read -r flag; do
  flag_no_quotes="${flag//\"/}"
  count=$(grep -coE "(gate|flag|isEnabled)\(\s*\"${flag_no_quotes}\"" "$BUNDLE")
  echo -e "${flag_no_quotes}\t${count}"
done < /tmp/sweep-candidates.txt > /tmp/sweep-gate-counts.tsv
```

**预期结果：** 每个唯一字符串对应一条形如 `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}` 的清单记录。gate-call 计数是可操作的列；其余列是噪声过滤器。

**失败处理：** 如果每个候选项的 gate-call 命中数都是 0，说明 gate-reader 模式有误。要么二进制文件使用了此正则未覆盖的 reader 函数，要么该命名空间纯属遥测（根本不是标志命名空间）。在重跑此步骤之前，先对几个候选项运行 `decode-minified-js-gates`，以了解实际的 reader 函数名。

### Step 3: 构建提取清单

将每个字符串的记录合并为一份清单产物。CSV 或 JSONL 都可以——选定一种并坚持使用，以便跨轮次进行差异比较。

```bash
# JSONL inventory
{
  while IFS=$'\t' read -r flag gate_count; do
    [ "$gate_count" -gt 0 ] || continue   # skip strings with no gate-call evidence
    total=$(grep -c "\"${flag}\"" "$BUNDLE")
    telem=$((total - gate_count))         # rough; refine if other call types matter
    printf '{"flag":"%s","total":%d,"gate_calls":%d,"telemetry":%d,"documented":false}\n' \
      "$flag" "$total" "$gate_count" "$telem"
  done < /tmp/sweep-gate-counts.tsv
} > /tmp/sweep-inventory.jsonl

wc -l /tmp/sweep-inventory.jsonl    # gate-bearing flag count
```

两个派生计数很重要：

- **`total_unique`**：所有匹配前缀的字符串（gate 过滤之前）
- **`gate_calls`**：至少有一次 gate-call 出现的子集——这是该活动的工作集

**预期结果：** 一份清单文件，每个唯一的承载 gate 的标志对应一条记录。gate 计数通常是 `total_unique` 的一小部分（常见为 5–20%），所以这两个数字应该有明显差异。

**失败处理：** 如果清单为空，或 `gate_calls` ≈ `total_unique`，说明第 2 步的 gate 与遥测区分产生了无意义的拆分。重新审视 reader 名称的正则。

### Step 4: 与已记录集合交叉对照

完整性指标依赖于一个已记录集合——你的活动已经在研究产物中写入的标志。先做交叉对照，再报告剩余项。

```bash
DOCUMENTED=/path/to/research/documented-flags.txt   # one flag name per line

# Extract gate-bearing flag names from the inventory
jq -r '.flag' /tmp/sweep-inventory.jsonl | sort -u > /tmp/sweep-extracted.txt

# Compute the documented and remaining sets
sort -u "$DOCUMENTED" > /tmp/sweep-documented.txt
comm -23 /tmp/sweep-extracted.txt /tmp/sweep-documented.txt > /tmp/sweep-remaining.txt

echo "Extracted (gate-bearing):  $(wc -l < /tmp/sweep-extracted.txt)"
echo "Documented:                $(wc -l < /tmp/sweep-documented.txt)"
echo "Remaining (undocumented):  $(wc -l < /tmp/sweep-remaining.txt)"
```

完整性指标即 `remaining`——当其归零时，已记录集合覆盖了命名空间中所有承载 gate 的标志。

**预期结果：** 三项计数。在活动早期，`remaining` 应当占 `extracted` 相当大的一部分。每一轮都会缩小 `remaining`，直至收敛到 0。跨轮次跟踪其轨迹，以便发现停滞（某轮次反复重新调查已记录的标志而陷入瓶颈）。

**失败处理：** 如果 `documented` 大于 `extracted`，说明已记录集合中存在过时条目（在本版本二进制中已被移除的标志）。改用 `comm -13` 找出这些已废弃的已记录名，在下一份活动产物中将它们归档为 REMOVED。

### Step 5: 报告 DEFAULT-TRUE 群体

在承载 gate 的标志集合中，将二进制中默认值为 `true` 的标志与默认值为 `false`（或非布尔）的标志分开。DEFAULT-TRUE 标志在没有服务器端覆盖的情况下对所有用户都是开启状态，因此是任何命名空间中信号最强的子集。

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

对于具有非布尔默认值的标志（配置对象、TTL reader、async reader），使用 `decode-minified-js-gates` 来分类 reader 变体——它们产出不同的默认值形态，应单独归类报告。

**预期结果：** 典型分布是 10–20% DEFAULT-TRUE，80–90% DEFAULT-FALSE。处于极端值的二进制文件（90% 以上 TRUE 或 90% 以上 FALSE）较为罕见，值得调查——这可能意味着某种发布阶段约定（测试期全部默认开启，分阶段发布期全部默认关闭）。

**失败处理：** 如果 DEFAULT-TRUE 与 DEFAULT-FALSE 的总数没有覆盖整个承载 gate 的清单，说明剩余部分使用了非布尔 reader。对差距部分运行 `decode-minified-js-gates`，以分类正在使用的 reader 变体。

### Step 6: 确认完成

当第 4 步的 `remaining = 0` 时，运行最后一次扫描：搜索匹配命名空间但*不在*已记录集合中的字符串的 gate-call 出现处。这能捕获在第 1 步收集中被遗漏的任何标志（例如，字符串拼接将字面量隐藏起来，使得简单 grep 难以发现）。

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

将 gate-call 命中与 `/tmp/sweep-documented.txt` 比对。如果有任何命中引用了不在已记录集合中的标志，则带着更精细的提取方式（例如处理动态构造的情形）回到第 1 步。如果为空：活动完成。

**预期结果：** 最后扫描要么返回空结果（活动完成），要么返回少量剩余（通常少于 5 个标志，常常是动态构造或备用 reader 的痕迹）。

**失败处理：** 如果第 4 步称 `remaining = 0`，但最终扫描却返回了大量剩余项，说明第 1 步系统性地提取不足。调查被遗漏的模式（动态字符串、备用引号字符、备用 reader 函数），然后用更严密的正则从第 1 步重新开始。

## 验证清单

- [ ] 第 1 步的唯一计数非零，且与预期处于同一数量级
- [ ] 第 2 步产出有意义的 gate 与遥测拆分（gate-call 计数是总出现次数的一部分，而不是全部或全无）
- [ ] 第 3 步的清单为每个承载 gate 的标志记录一条，采用 CSV 或 JSONL 格式
- [ ] 第 4 步报告 `total_unique`、`gate_calls`、`documented`、`remaining`——并且该指标在活动结束时归零
- [ ] 第 5 步分别报告 DEFAULT-TRUE 与 DEFAULT-FALSE
- [ ] 第 6 步的最终扫描在宣布活动完成前返回空结果
- [ ] 所有示例都使用合成占位符（`acme_*`、`gate(...)` 等）；产物中没有泄露任何真实标志名或 reader 名
- [ ] 扫描输出可与早期版本的扫描进行差异比较（相同形态、相同字段）

## 常见问题

- **止于抽样而非扫描**：一个在"我们已经记录了足够多标志"之后就结束、却没有计算 `remaining` 的活动，是抽样而非扫描。本技能的全部要点正是那个可验证的结束条件。
- **将承载 gate 与全部提取混为一谈**：命名空间中的大多数字符串都不是 gate。把 `total_unique` 报告为活动分母会夸大工作量并压低表面完成率。应使用 `gate_calls` 作为分母。
- **跨版本信任同一个正则**：gate-reader 函数名有时会在主要版本之间发生变化。在针对新二进制开始新一次扫描时，应重新校验第 2 步中的正则。
- **跳过第 6 步**：在 `remaining = 0` 时直接宣布完成而不进行最后的动态扫描，可能漏掉通过字符串拼接构造的标志。最终扫描成本低廉，却能避免尴尬。
- **泄露真实名称**：很容易不小心将清单中的真实标志名粘贴到本技能的示例里。`acme_*` 占位符约定的存在是有原因的——保持方法与发现相互分离。
- **对照过时的已记录集合**：如果已记录集合是基于较旧的二进制构建的，则被移除的标志会以"已记录"出现，但已不再被提取，而真正未记录的标志却出现在剩余项中。在交叉对照前，先针对当前二进制刷新已记录集合。

## 相关技能

- `probe-feature-flag-state` — per-flag classification (downstream of this skill's inventory)
- `decode-minified-js-gates` — when reader-variant classification is needed mid-sweep
- `monitor-binary-version-baselines` — longitudinal tracking across binary versions; sweeps can be re-run against each baseline
- `redact-for-public-disclosure` — how to publish methodology from a sweep without leaking the inventory itself
- `conduct-empirical-wire-capture` — empirical validation of flags surfaced by the sweep
