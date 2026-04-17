---
name: probe-feature-flag-state
description: >
  Probe the runtime state of a named feature flag in a CLI binary. Covers
  the four-pronged evidence protocol (binary strings, live invocation,
  on-disk state, platform cache), the four-state classification (LIVE /
  DARK / INDETERMINATE / UNKNOWN), gate-vs-event disambiguation,
  conjunction-gate handling, and skill-substitution scenarios where a
  flag appears DARK but the capability is delivered by other means. Use
  when verifying whether a documented or inferred capability has rolled
  out, when auditing dark-launched features, or when a prior probe's
  conclusions need refreshing against a new binary version.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, dark-launch, classification, evidence
  locale: zh-CN
  source_locale: en
  source_commit: b9570f58
  translator: "Claude Sonnet 4.6"
  translation_date: "2026-04-17"
---

# 探测特性标志位状态

使用四路证据协议，为每一个状态断言配上具体观察结果，判定一个已发布 CLI 二进制中的具名特性标志位究竟是 LIVE、DARK、INDETERMINATE 还是 UNKNOWN。

## 何时使用

- 某个能力被传闻、文档或推断出来，你需要核实闸门在当前会话中是否真的触发
- 你正在审计暗启动特性 — 随二进制发布但被闸门关闭的代码 — 以便负责任地规划集成
- 针对一个新的二进制版本需要刷新先前探测的结论（标志位可能被翻转、被移除，或被合并进一个合取闸门）
- 你正在跟进第 1 阶段（`monitor-binary-version-baselines`）的标记，需要先对每个候选标志位的推广状态进行分类，再进入第 4 阶段的线路抓包
- 用户可见的行为发生了变化，你需要知道是一次标志位翻转驱动的，还是一次代码变更驱动的

## 输入

- **必需**：标志位在二进制中出现的名称（字符串字面量形式）。
- **必需**：你能读取并调用的 CLI 二进制或打包文件。
- **必需**：面向测试台常规后端、已认证的会话（使用你自己的账户，绝不能是别人的）。
- **可选**：二进制版本标识 — 强烈推荐，这样证据表才能与未来的探测做 diff。
- **可选**：疑似共闸门的清单（可能与本标志位形成合取的其他标志位名）。
- **可选**：同一个标志位在不同版本下的先前探测工件，用于做差分分析。

## 步骤

### 步骤 1：确认标志位名称在二进制中存在（证据支线 A — 二进制字符串）

从打包产物中抽取候选标志位名，确认它确实以字符串字面量形式存在。没有这一步，其他所有支线都是在打空气。

```bash
# Locate the bundle (common shapes: .js, .mjs, .bun, packaged binary)
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3   # synthetic placeholder — replace with the candidate

# Confirm the literal exists
grep -c "$FLAG" "$BUNDLE"

# Capture every line where it appears, with surrounding context for Step 2
grep -n -C 3 "$FLAG" "$BUNDLE" > /tmp/flag-context.txt
wc -l /tmp/flag-context.txt
```

检视 `/tmp/flag-context.txt`，并把每一处出现标记为以下之一：

- **gate-call（闸门调用）** — 以闸门形状函数的首个参数出现（`gate("$FLAG", default)`、`isEnabled("$FLAG")`、`flag("$FLAG", ...)`）。
- **telemetry-call（遥测调用）** — 以 emit/log/track 函数的首个参数出现。
- **env-var-check（环境变量检查）** — 出现在 `process.env.X`（或同类）的查找中。
- **string-table（字符串表）** — 出现在一个用途不明的静态映射或注册表中。

**预期：** 该标志位字符串在打包产物中至少出现一次，且每一处出现都已被打上调用点角色的标签。

**失败时：** 如果 `grep -c` 返回 0，说明该标志位不在本次构建里。要么输入名称错了（错别字、错误命名空间），要么该标志位在本版本已被移除。回到第 1 阶段的标记输出重新核对，随后要么修正输入、要么将其分类为 `REMOVED` 并停止。

### 步骤 2：区分闸门、事件与环境变量

同一个字符串可以同时扮演闸门、遥测事件名、环境变量，或三者皆是。分类取决于调用点，而不是字符串本身。把遥测名误当成闸门会产生无意义的推理（"这个闸门一定是关着的"），尽管它从来就不是闸门。

对第 1 步中每一个被打标签的出现：

- 一个 **gate-call** 出现使该字符串有资格被划入 LIVE / DARK / INDETERMINATE 分类。记录传入闸门的**默认值**（`gate("$FLAG", false)` 将标志位默认设为关；`gate("$FLAG", true)` 将其默认设为开）。把字面默认值与闸门函数名都记下来。
- 一个 **telemetry-call** 出现**不**使该字符串成为闸门。它是当其他闸门已经通过时所触发的标签。如果*仅有*遥测调用的出现，则该字符串是"纯事件"，最终分类为 `UNKNOWN`（名称存在但不是闸门）。
- 一个 **env-var-check** 出现通常意味着一个杀停开关（默认开启的能力被环境变量禁用），或一个显式主动启用（默认关闭的能力由环境变量启用）。注意极性 — `if (process.env.X) { return null; }` 是杀停开关；`if (process.env.X) { enable(); }` 是主动启用。
- 一个 **string-table** 出现必须做交叉引用 — 查看该表在下游如何被消费。

**预期：** 每一处出现都有确定的调用点角色；对 gate-call 类型的出现还记录了默认值。

**失败时：** 如果某个 gate-call 周围的上下文被压缩得太紧以至于读不出默认值，把 grep 上下文扩大（`-C 10`）并检视完整的被调函数。如果仍无法确定默认值，就记录为 `default=?`，并把任何 LIVE/DARK 结论降级为 INDETERMINATE。

### 步骤 3：观察实时调用行为（证据支线 B — 运行时探测）

在你能控制的已认证会话里运行测试台，观察被闸门守护的能力是否浮现。这是信号最强的一条支线：打包产物说明了*能发生什么*，运行时展示了*确实发生了什么*。

挑一个能揭示闸门放行的探测动作 — 通常就是闸门所守护的用户可见行为（工具在工具列表中出现、命令标志位变得合法、UI 元素渲染、响应中多出一个输出字段）。

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

记录以下三种结果之一：

- **观察到闸门放行** — 能力在会话中浮现。候选分类：`LIVE`。
- **未观察到闸门放行** — 能力未浮现。候选分类取决于第 2 步的默认值（默认 false → `DARK`；默认 true → 重新核查，这很可疑）。
- **闸门放行取决于此处无法复现的特定输入或上下文** — 记录该条件；候选分类：`INDETERMINATE`。

**预期：** 一个被记录的探测动作、观察到的结果，以及它所指向的候选分类。

**失败时：** 如果探测动作本身就报错（认证失败、网络不可达、错误的子命令），本轮的运行时支线无法使用。修复会话或换一个探测动作；绝不要从一次从未运行过的运行时推断出 DARK。

### 步骤 4：检查磁盘状态（证据支线 C — 配置、缓存、会话）

许多测试台会把闸门求值结果或覆盖值持久化到磁盘，以免反复抓取。检视这些状态能看出测试台在上一次求值时对该标志位的认知。

常见位置（按测试台实际情况调整 — 以下是形态，不是具体路径）：

```bash
# User-level config
ls ~/.config/<harness>/ 2>/dev/null
ls ~/.<harness>/ 2>/dev/null

# Per-project state
ls .<harness>/ 2>/dev/null

# Cache directories
ls ~/.cache/<harness>/ 2>/dev/null

# Search any of these for the flag name
grep -r "$FLAG" ~/.config/<harness>/ ~/.cache/<harness>/ .<harness>/ 2>/dev/null
```

记录每一次命中的路径、与该标志位关联的值，以及文件的最近修改时间。一条最近修改的缓存条目覆盖了二进制默认值，是两侧最强的证据。

**预期：** 要么有带时间戳的确定覆盖值，要么确认不存在（磁盘上没有任何状态提到此标志位）。

**失败时：** 如果你找到了标志位的提及，但无法判断所记录的值是缓存的服务端响应、用户覆盖，还是过期值，就把该条目标记为待第 5 步（平台缓存）进行对账，而不要靠猜。

### 步骤 5：检查平台标志位服务缓存（证据支线 D）

如果测试台使用了外部特性标志位服务（LaunchDarkly、Statsig、GrowthBook、厂商内部服务等），本地缓存的服务响应就是当前推广状态的权威来源。若可能，检视它。

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

记录缓存值、缓存时间戳，以及（若有）缓存 TTL。一个平台缓存若说 `false`，会覆盖 `true` 的二进制默认值；若说 `true`，则会覆盖 `false` 的二进制默认值。

**预期：** 要么得到一个确定的带时间戳的缓存值，要么确认该测试台不存在标志位服务缓存。

**失败时：** 如果测试台没有标志位服务，或你无法定位缓存，则本支线不贡献证据 — 这是可接受的。在证据表里注明"证据支线 D：不适用"；不要靠猜。

### 步骤 6：处理合取闸门

有些能力由多个标志位守护，必须同时为真：`gate("A") && gate("B") && gate("C")`。其中任一为 DARK 就足以使该能力整体为 DARK，但每个标志位个体的分类仍需各自独立进行。

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

对每一个浮出的共闸门字符串：

- 对它重复第 1-5 步（把它当作自身的探测对象）。
- 记录每个标志位的分类。
- 计算**能力级**分类：当且仅当所有合取项都为 LIVE 时才是 LIVE；只要有任一合取项为 DARK 就是 DARK；若无合取项为 DARK 且至少一个为 INDETERMINATE，则为 INDETERMINATE。

**预期：** 每一个合取项都被识别并单独分类，并给出推导出的能力级分类。

**失败时：** 若谓词被压缩得过紧以至于无法干净枚举（调用点被内联或包装），把该合取记录为"≥1 个额外闸门，结构不可读"，并将能力级分类降级为 INDETERMINATE，即使主标志位看起来是 LIVE。

### 步骤 7：检查技能替代

一个标志位可能合理地处于 DARK 状态，而它本应解锁的用户可见能力却可以通过另一条完全受支持的路径到达 — 不同的命令、用户可调用的技能、另一种 API。诚实的"标志位 DARK，能力通过替代路径 LIVE"结论很常见也很重要；遗漏它会造成"用户其实已有"的能力却被恐慌地上报为暗启动。

对任何候选分类为 DARK 或 INDETERMINATE 的情形，追问：

- 是否存在一个已记入文档的、用户可调用的命令、斜杠命令或技能，能交付相同的终端用户结果？
- 是否存在一个替代的 API 表面（不同端点、不同工具名）能返回等价数据？
- 测试台是否发布了用户可见的扩展点（插件、自定义工具、钩子），允许用户自行拼出等价物？

如任一答案为是，就在证据行上附加 `substitution:` 备注，记录替代路径及其可观测性（用户如何到达它、它是否有文档）。

**预期：** 每一个 DARK / INDETERMINATE 分类都有一次显式的替代检查 — 要么给出路径，要么显式写明"未识别到替代路径"。

**失败时：** 若你怀疑存在替代但无法确认路径，则标注"疑似存在替代；未能确认"，而不是武断做出任何一方的断言。

### 步骤 8：汇集证据表与最终分类

把四条支线合到一张表里。每一个状态断言都必须与支撑它的观察结果配对；在新版本上重跑探测便能产出可 diff 的工件。

| 字段 | 值 |
|---|---|
| 标志位 | `acme_widget_v3`（示意占位） |
| 二进制版本 | `<version-id>` |
| 探测日期 | `YYYY-MM-DD` |
| 证据支线 A — 字符串 | 存在（3 处：1 处 gate-call default=`false`，2 处遥测） |
| 证据支线 B — 运行时 | 能力清单中未观察到闸门放行 |
| 证据支线 C — 磁盘 | `~/.config/<harness>/` 中未找到覆盖 |
| 证据支线 D — 平台缓存 | 未发现服务缓存 / 不适用 |
| 合取 | 无 — 单闸门谓词 |
| 替代 | 用户可调用的 `widget` 斜杠命令交付了等价 UX |
| **最终状态** | **DARK（能力通过替代路径 LIVE）** |

应用分类规则：

- **LIVE** — 本次会话至少有一条支线观察到闸门放行，且没有任何支线与之矛盾。
- **DARK** — 标志位字符串存在、gate-call 默认值为 `false`、没有任何支线观察到闸门放行、也没有任何覆盖将其翻转为 true。
- **INDETERMINATE** — 闸门放行取决于本次探测无法复现的输入或上下文，或闸门默认值无法判定，或某个合取项为 INDETERMINATE。
- **UNKNOWN** — 字符串存在但未被用作闸门（仅用于遥测、仅在字符串表中、仅作为环境变量标签）。

把表保存为一份探测工件（例如 `probes/<flag>-<version>.md`），以便将来的探测可以与之 diff。

**预期：** 一份覆盖四条支线、合取状态、替代状态与唯一最终分类的完整证据表。

**失败时：** 若没有任何支线产生可用信号（二进制无法读取、运行时无法调用、磁盘与平台缓存都缺席），不要凭空编造分类。把它记为 `INDETERMINATE`，原因写"无支线产生信号"，并停止。

## 校验

- [ ] 证据表中每一个状态断言都与一个具体观察结果配对（没有单纯的断言）。
- [ ] 标志位的 gate-call 默认值已被记录（或显式注明不可读）。
- [ ] 遥测事件的出现没有被计入闸门证据。
- [ ] 合取闸门既有每标志位的分类，**也有**一个能力级分类。
- [ ] 每一行 DARK / INDETERMINATE 都带有显式的替代检查。
- [ ] 工件记录了二进制版本，使未来的探测可 diff。
- [ ] 任何打算公开发布的工件中都不包含真实产品名、绑定版本的标识符或仅限暗启动的标志位名（见 `redact-for-public-disclosure`）。

## 常见陷阱

- **把遥测事件与闸门混为一谈。** 一个在 `emit("$FLAG", ...)` 中出现的字符串是标签而不是闸门。"纯遥测"的标志位没有推广状态，应分类为 UNKNOWN，而不是 DARK。
- **跳过证据支线 B（实时调用）。** 仅凭静态证据（二进制里写着 `default=false`）并不等同于运行时证据（能力未出现）。一个在二进制中默认为 false 的标志位，可能被服务端覆盖翻转为 true；只有运行时探测能展示当前会话实际拿到了什么。
- **漏掉合取。** 因为主标志位的唯一一处出现显示 `default=true` 就把它分类为 LIVE，而忽视它周围的 `&& gate("B") && gate("C")`，会对一个实际上由 B 或 C 守护的能力给出虚假自信的 LIVE。
- **未做替代检查就下 DARK 结论。** 许多 DARK 标志位确实不可达，但也有许多拥有完全受支持的用户可调用路径。替代检查正是让"恐慌性暗启动"变为"诚实发现"的一步。
- **对着一个过期的二进制版本做探测。** 没有版本戳的探测工件毫无用处 — 你无法判断它反映的是当前状态还是上季度的状态。始终记录版本，并让未来的探测与之 diff。
- **激活闸门以确认它。** 翻转标志位来测试并不属于本技能。有些暗闸门出于安全原因关闭（能力不完整、监管暂停、迁移未完成）。记录；绝不绕过。
- **抓取其他用户的状态。** 证据支线 C 与 D 检视的是*你自己*的磁盘状态与*你自己*的缓存。读取其他用户的缓存是数据外泄，超出范围。
- **把 INDETERMINATE 视为失败。** 它不是 — 它是证据不足时的诚实分类。为了让报告看起来更果断而把 INDETERMINATE 硬拉成 LIVE 或 DARK，是最快犯错的方式。

## 相关技能

- `monitor-binary-version-baselines` — 父指南的第 1 阶段；本技能所依赖的标记追踪为其提供候选标志位清单。
- `conduct-empirical-wire-capture` — 第 4 阶段；当证据支线 B 的表面探测不足时，提供更深的运行时证据（网络抓包、生命周期钩子）。
- `security-audit-codebase` — 暗启动代码是攻击面考古的一部分；本技能是该审计的发现那一半。
- `redact-for-public-disclosure` — 第 5 阶段；规定哪些探测工件可以离开私有工作区的脱敏纪律。
