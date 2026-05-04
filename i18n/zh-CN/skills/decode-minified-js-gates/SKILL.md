---
name: decode-minified-js-gates
description: >
  Classify gate call variants in a minified JavaScript bundle. Covers
  context-window extraction around a flag occurrence, identification of
  4–6 reader variants (sync boolean, sync config-object, bootstrap-aware
  TTL, truthy-only, async bootstrap, async bridge), default-value
  extraction (boolean / null / numeric / config-object literal),
  conjunction detection across `&&` predicates, kill-switch inversion
  detection, and production of a gate-mechanics record that feeds probe-
  feature-flag-state. Use when a flag's behavior cannot be inferred from
  its name alone, when the binary uses multiple reader libraries, or when
  config-object gates carry structured schemas distinct from boolean
  gates.
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: zh-CN
  source_locale: en
  source_commit: 90b159ab
  translator: "Claude + human review"
  translation_date: "2026-05-04"
---

# Decode Minified JS Gates

读取经过压缩的 JavaScript bundle 中某个标志字符串周围的调用现场上下文，并产出一份 gate 机制记录：使用的是哪种 reader 变体、默认值是什么、是否参与合取、扮演什么角色。`probe-feature-flag-state` 回答的是"这个 gate 是开还是关？"，而本技能回答的是其前置问题——"这个 gate 究竟做什么？"

## 适用场景

- 由 `sweep-flag-namespace` 浮现的标志无法仅凭名称分类。
- 二进制文件使用了不止一个 gate-reader 函数，你需要知道某个标志调用的是哪一个。
- 某个 gate 的"默认值"看起来不是布尔值（`{}`、`null`、数字字面量），你需要解码出其实际的 reader 变体。
- 你怀疑存在 kill-switch（反向 gate），但仅凭标志名无法确认。
- 某个谓词通过 `&&` 组合了多个 gate，在探测其中任何一个之前，你需要枚举所有共同 gate。

## 输入

- **必需**：一个经过压缩的 JavaScript bundle 文件（`.js`、`.mjs`、`.bun`）。
- **必需**：要解码的目标标志字符串，以字面量形式。
- **可选**：来自先前解码过程的已知 reader 函数名列表——可加速第 2 步。
- **可选**：上下文窗口大小覆盖值；默认是标志出现位置之前 300 字符、之后 200 字符。

## 步骤

### Step 1: 提取上下文窗口

定位标志字符串，并在每次出现处捕获一个非对称窗口。前置上下文（标志之前）是 reader 函数名所在之处；后置上下文（标志之后）是默认值与合取所在之处。

```bash
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3                   # synthetic placeholder
PRE=300
POST=200

# All byte offsets where the flag string occurs
grep -boE "\"${FLAG}\"" "$BUNDLE" | cut -d: -f1 > /tmp/decode-offsets.txt
wc -l /tmp/decode-offsets.txt

# Capture an asymmetric window per occurrence
while read -r offset; do
  start=$((offset - PRE))
  [ "$start" -lt 0 ] && start=0
  length=$((PRE + POST))
  echo "=== offset $offset ==="
  dd if="$BUNDLE" bs=1 skip="$start" count="$length" 2>/dev/null
  echo
done < /tmp/decode-offsets.txt > /tmp/decode-windows.txt

less /tmp/decode-windows.txt
```

如需快速首过，可用 `grep -oE` 加上 Perl 兼容正则的负向后行断言，在一个管道中得到相同的窗口。

**预期结果：** 每次标志出现对应一个或多个上下文窗口，每个窗口约 500 字符。多次出现通常共享同一个 reader 函数，但默认值或合取可能不同——应分别检查每一处。

**失败处理：** 如果 bundle 体积过大，无法对每次出现都使用 `dd`（二进制文件 > 100MB 或出现次数过多），可改用 `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` 作为结构化输出的近似方案。如果窗口看起来损坏，bundle 可能是 UTF-16 编码或包含非 ASCII 分隔符；可使用 `iconv` 或将其按二进制处理。

### Step 2: 识别 reader 变体

经过压缩的 gate 库通常暴露 4–6 种语义不同的 reader 变体。reader 函数名是首要线索；调用签名是验证依据。

变体分类（合成名称——请替换为你 bundle 中实际的压缩标识符）：

| Variant | Synthetic shape | Returns | Common usage |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` or `gate("flag", true)` | `boolean` | Standard on/off feature switches |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON object | Structured config (delays, allowlists, model names) |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean` (cached) | Startup-path gates before remote config arrives |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | Quick checks; no explicit default |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | Gates resolved post-bootstrap |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | Bridge/relay-channel gates with separate evaluation path |

将每个上下文窗口与变体模式进行匹配：

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

如果同一个标志出现了多种变体（罕见但确实存在——例如某标志在启动时被同步读取，并在引导后被异步读取），则分别记录每次出现的变体。探测结果可能不同。

**预期结果：** 每个 gate-call 出现都会被打上一种变体标签。整次扫描中各变体的计数构成二进制级别的分布（例如，"60% 同步布尔，30% 配置对象，10% TTL"）。

**失败处理：** 如果某个上下文窗口中没有可识别的 reader 模式，则该标志可能并未真正被 gate 调用——应回头复核 `sweep-flag-namespace` 第 2 步的调用现场分类。如果某个窗口中包含此分类法之外的 reader 名称，应在你的研究产物中将其记录为新变体，并决定其是否值得单独的处理路径。

### Step 3: 提取默认值

默认值是 reader 的第二个位置参数（对于 truthy-only 和 async 变体则不存在）。捕获精确的字面量——`false`、`true`、`null`、`0`、字符串或 JSON 配置对象。

```bash
# Boolean default extraction (sync boolean and TTL variants)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*(true|false)' /tmp/decode-windows.txt

# Config-object default — match the opening brace and capture until the
# matching brace at the same nesting depth. For minified bundles this is
# usually safe with a non-greedy match because objects rarely span lines.
grep -oE 'fvReader\("acme_widget_v3",\s*\{[^}]*\}' /tmp/decode-windows.txt

# Numeric default (rare but real for TTL or threshold gates)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*[0-9]+' /tmp/decode-windows.txt
```

对于配置对象默认值，应检查其 JSON 结构——键名常常暗示该 gate 的用途（例如 `{maxRetries: 3, timeoutMs: 5000}` 是重试策略配置，而非功能开关）。

**预期结果：** 每次出现都对应一个精确的字面量默认值。布尔值含义明确；配置对象需要手动阅读其结构。

**失败处理：** 如果某个配置对象的匹配花括号落在上下文窗口之外，请在第 1 步增加后置上下文的大小。如果默认值看起来是变量引用（例如 `gate("flag", x)`），则该默认值是在运行时计算的——将其记录为 DYNAMIC，并通过 `probe-feature-flag-state` 探测实际返回值。

### Step 4: 检测合取与 kill switch

许多 gate 都参与到复合谓词中。合取（`&&`）与反转（`!`）会改变 gate 的实际作用。

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

对每个被检测到的合取，列出其共同 gate 的标志名。它们现在也属于探测范围——如果目标标志的求值依赖于共同 gate，仅探测目标本身会得到不完整的状态。

对每个被检测到的反转，将该标志在 gate 机制记录中标记为 kill switch。kill switch 会颠倒默认值的含义：默认值为 `false` 的 kill switch 表示"功能默认开启"（因为 `!false === true`），而默认值为 `false` 的普通 gate 则表示"功能默认关闭"。

**预期结果：** 每次出现对应一个合取列表（可能为空）和一个反转标记（布尔值）。

**失败处理：** 如果某个合取包含超过 2 个共同 gate，则该谓词复杂到正则无法捕捉其结构。手动阅读上下文窗口，并在 gate 机制记录中逐字记录该谓词的形态。

### Step 5: 分类 gate 的角色

将第 2–4 步综合为角色分类。不同角色驱动不同的探测策略和不同的集成风险。

| Role | Signature | Implication |
|---|---|---|
| **Feature switch** | sync boolean, no inversion, no conjunction | Standard on/off; probe directly |
| **Config provider** | sync config-object (`fvReader`) | Read returned object; default-empty `{}` ≠ feature off |
| **Lifecycle guard** | bootstrap-aware TTL or async bootstrap | State depends on bootstrap timing; probe at multiple points |
| **Kill switch** | inverted gate, default-false | Feature on for users by default; flag flips it OFF |
| **Conjunction member** | any variant with `&&` co-gate | Cannot evaluate alone; co-gates are part of the probe scope |
| **Bridge gate** | async bridge variant | Probe must occur over the bridge channel, not the main path |

**预期结果：** 每次 gate-call 出现都恰好有一个主要角色。某些标志在不同出现处会扮演不同角色（例如在某调用现场是功能开关，在另一处是合取成员）——分别记录每个角色。

**失败处理：** 如果某个角色不在该表中，说明二进制使用了本技能尚未记录的 gate 库。用合成标识符添加一行，并将该变体回馈到本技能（或某项目专属扩展）中，以便未来的调查者使用。

### Step 6: 产出 gate 机制记录

将每个标志的发现合并为一条结构化记录。JSONL 很方便，因为每个标志变成一行，便于与 `sweep-flag-namespace` 清单合并。

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

gate 机制记录会喂给 `probe-feature-flag-state` 第 2 步（gate 与事件的区分）：变体 + 角色 + 合取列表共同决定了哪些观察可作为 LIVE / DARK / INDETERMINATE 状态的证据。

**预期结果：** 每个标志（或当某标志具有多种不同机制时，每次标志出现）一条 JSONL 记录。该记录可重现——对同一二进制再次运行流程会产出相同记录。

**失败处理：** 如果记录在多次运行间出现差异，说明上游某个步骤是非确定性的。最常见的原因是第 1 步中的正则遗漏或过度匹配出现处。在整个活动期间锁定正则。

## 验证清单

- [ ] 第 1 步对每次标志出现产出一个上下文窗口；窗口约 500 字符
- [ ] 第 2 步将每次出现打上分类法中恰好一种 reader 变体的标签
- [ ] 第 3 步捕获精确的字面量默认值（布尔、配置对象或 DYNAMIC）
- [ ] 第 4 步浮现窗口中所有的合取与 kill switch 反转
- [ ] 第 5 步从角色表中为每次出现指派一个角色
- [ ] 第 6 步产出一份在多次运行间能干净比对的 JSONL gate 机制记录
- [ ] 所有示例都使用合成占位符（`acme_*`、`gate`、`fvReader` 等）——没有真实标志名、真实 reader 名或真实配置对象 schema
- [ ] 该记录可被 `probe-feature-flag-state` 消费（相同的标志标识、兼容的字段名）

## 常见问题

- **将"默认值"读作"行为"**：默认值为 `true` 的 gate 在*本二进制中*默认开启，但服务器端覆盖可能将其翻转。默认值告诉你基线；运行时探测（`probe-feature-flag-state`）告诉你状态。
- **将配置对象的空默认值与功能关闭混为一谈**：`fvReader("flag", {})` 返回空对象作为默认值——但该标志是*开启*的（gate 求值为 truthy）。把 `{}` 当作"关闭"会把 config-provider 误分类为 feature switch。
- **遗漏 kill switch**：gate 调用之前的 `!` 会反转其含义。跳过第 4 步会产出"默认 false，功能默认关闭"的记录，而真相却是"默认 false，由于反转，功能默认开启"。
- **只探测合取的一半**：如果谓词是 `acme_widget_v3 && acme_user_in_cohort`，只探测 `acme_widget_v3` 并发现其为 LIVE 并不意味着该功能上线了——合取可能仍然通过 cohort 标志将其关闭。
- **跨版本信任 reader 名称**：经过压缩的标识符可能在主要版本之间发生变化。第 2 步的分类法是基于*签名*（调用形态、返回类型、默认值位置），而不是基于名称。当二进制版本变化时，应通过一次新的解码过程重新推导出 reader 名称。
- **窗口过窄**：200/100 的拆分会漏掉跨越 300+ 字符的配置对象默认值。300/200 或 400/300 更安全；只在 bundle 体积巨大且窗口成本明显时才收紧。
- **泄露真实 reader 名称**：经过压缩的 reader 名称有时看起来像无意义字符（`a`、`b`、`Yc1`），让人觉得直接粘贴也没事。但它们仍然属于发现成果——在公开方法之前，请用合成占位符替换。

## 相关技能

- `probe-feature-flag-state` — uses the gate-mechanics record to interpret runtime observations
- `sweep-flag-namespace` — produces the candidate flag set this skill decodes
- `monitor-binary-version-baselines` — tracks reader-name changes across binary versions; re-derive Step 2 patterns when baselines flip
- `redact-for-public-disclosure` — how to publish gate-decoding methodology without exposing real reader names or schemas
- `conduct-empirical-wire-capture` — validates the gate-mechanics record against runtime behavior
