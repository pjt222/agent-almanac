---
name: conduct-empirical-wire-capture
description: >
  Capture outbound HTTP and telemetry from a CLI harness at runtime.
  Covers capture-channel selection (transcript file vs verbose-fetch
  stderr vs outbound proxy vs on-disk state), hook-driven per-event
  capture vs long-running session capture, JSONL output format for
  diff-friendly artifacts, and the observability table that maps each
  target to the cheapest channel that captures it. Use when a static
  finding needs runtime confirmation, when a payload shape is needed
  for a client re-implementation, or when dark-vs-live disambiguation
  requires watching what the binary actually sends.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, wire-capture, http, telemetry, jsonl, observability
  locale: zh-CN
  source_locale: en
  source_commit: b9570f58
  translator: "Claude Sonnet 4.6"
  translation_date: "2026-04-17"
---

# 开展实证线路抓包

为 CLI 工具的出站 HTTP 与遥测搭建可复现的线路抓包测试台，将每一个可观测性目标匹配到能够捕获它的最廉价通道。

## 适用范围与伦理准则

在配置任何抓包之前，请先阅读本节。

- 线路抓包仅限针对**你自己**的账户，在**你自己**的机器上，抓取**你自己**发出的请求。捕获其他用户的流量属于数据外泄而非研究，不在本技能范围内。
- 凭证几乎总会出现在原始线路输出中。请在抓包时就进行脱敏（第 6 步），绝不要"先抓包、后脱敏"。
- 抓包是*观察*行为，不是*修改*行为。不要使用捕获到的载荷去绕过服务端限流、重放其他用户的会话，或在未经授权的情况下激活暗启动能力。
- 本技能的产物是内部工件。若需将线路抓包发现公开发布，应走 `redact-for-public-disclosure`（父指南的第 5 阶段），而不是本技能。

## 何时使用

- 某个静态发现（一个标志位、一个端点引用、一个遥测事件名）需要运行时确认它确实会触发。
- 为了重新实现客户端、添加追踪埋点或做跨版本对比，需要获知载荷的结构。
- 需要区分"暗启动 vs 已上线"时，必须观察二进制实际发送了什么，而不是仅看打包产物可能包含什么。
- 某个行为在版本间悄然发生了变化，你希望留下一个可复现的工件以便与将来的版本对比。

**不要**将本技能用于：版本基线记录（使用 `monitor-binary-version-baselines`）、标志位状态探测（使用 `probe-feature-flag-state`）或为公开发布准备脱敏工件（使用 `redact-for-public-disclosure`）。

## 输入

- **必需**：一个你可以在本地使用自己账户运行的 CLI 测试台二进制文件。
- **必需**：一个具体要回答的问题（例如："端点 X 在事件 Y 上是否触发？"、"遥测事件 Z 的载荷结构是什么？"）。没有问题的抓包只会产生无人阅读的日志。
- **可选**：来自前期阶段的静态发现（标记目录、候选标志位清单、可疑端点），用于界定抓包目标。
- **可选**：存放抓包工件的私有工作区路径。默认为 `./captures/` — 必须写入 `.gitignore`。

## 步骤

### 步骤 1：先构建可观测性表

在配置任何抓包之前，枚举你需要回答的问题，并把每一个问题对应到一个抓包通道。每个目标一行。

| 目标 | 可观测途径 | 障碍 |
|---|---|---|
| 出站 HTTP 到端点 X | verbose-fetch stderr | TUI 噪声会污染终端 |
| 用户操作触发的遥测事件 Y | 钩子驱动子进程 | 需要测试台提供钩子接口 |
| 令牌刷新握手 | 出站 HTTP 代理 | 需要信任 CA 证书 |
| 定时任务生命周期事件 | 长期会话抓包 | 需要墙钟对齐 |
| 本地配置变动 | 磁盘状态对比 | 无 — 最廉价通道 |

常见通道，按成本从低到高：

- **磁盘状态文件变动** — 当测试台把状态写入已知路径时，快照间的 `diff` 是免费的。
- **会话转录文件** — 当测试台本身就写入会话转录时，直接解析它，无需任何埋点。
- **Verbose-fetch stderr** — 打包器提供的环境变量（例如 bun 的 `BUN_CONFIG_VERBOSE_FETCH=curl`）会把每一次 fetch 路由到 stderr。噪声大，但能捕获每一次 fetch。
- **钩子驱动子进程** — 当测试台暴露了生命周期钩子（`UserPromptSubmit`、`Stop` 等）时，为每个事件派生一个短命的抓包子进程。
- **长期会话抓包** — 一个进程贯穿整个会话，用墙钟打时间戳。用于捕获序列。
- **出站 HTTP 代理** — 分离干净，但需要信任 CA 证书；当测试台对证书做钉扎时会失效。

选择能捕获目标的最廉价通道。一次围绕一个具体问题、只包含 3 个目标的抓包，胜过一次包含 20 个目标却什么问题都没回答的抓包。

**预期：** 得到一张可观测性表，每个问题占一行，标注所用通道与已知障碍。没有可行通道的目标应标记为"本次会话超出范围"。

**失败时：** 如果所有目标都落在了代理那一列，说明这张表过于雄心勃勃。精简为一两个价值最高的问题，并重新审视有没有成本更低的通道能覆盖它们。

### 步骤 2：准备一次性工作区

线路抓包会污染终端、把文件散落在意料之外的地方，还可能把凭证泄漏到日志中。

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

确认抓包会话不是你的主要工作会话 — verbose-fetch 与 TUI 渲染会互相干扰。

**预期：** 一个带时间戳、已被 git 忽略、独立于工作会话的抓包目录。

**失败时：** 如果 `git check-ignore` 报告该目录未被忽略，在运行任何抓包命令之前先修好 `.gitignore`。不要带着凭证风险继续。

### 步骤 3：按事件进行钩子驱动抓包

当目标是一个离散事件（一次工具调用、一次提示提交、一次会话停止）时，使用测试台的钩子接口。每个事件派生一个短命的抓包子进程，不要常驻进程内。

模式（示意示例）：

```bash
# Hook script, registered with the harness's hook config.
# Invoked once per event; writes one JSONL line; exits.
#!/usr/bin/env bash
set -euo pipefail
TS=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
EVENT="${1:-unknown}"
PAYLOAD=$(jq -c --arg ts "$TS" --arg ev "$EVENT" \
  '{ts:$ts, source:"hook", target:$ev, payload:.}' < /dev/stdin)
echo "$PAYLOAD" >> "$CAPTURE_DIR/events.jsonl"
```

为什么采用"每事件一个子进程"：

- 无令牌状态、无会话耦合 — 每次调用相互独立。
- 一次抓包失败不会污染下一次。
- 子进程开销是可以接受的，因为事件频率低（按用户操作计，不是按字节计）。

**预期：** `events.jsonl` 中每一次触发的事件占一行 JSONL，每一行都是 `jq` 能解析的良构 JSON。

**失败时：** 如果 `jq` 报解析错误，说明载荷中包含未转义的控制字符或二进制数据 — 改用 `jq -R`（原始输入）管道，并把 payload 字段改为 base64 编码后再写入。

### 步骤 4：按序列进行长期会话抓包

当目标是一个序列（多轮握手、定时任务生命周期、重试/退避状态机）时，用一个贯穿整个会话的抓包进程，附墙钟时间戳。

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

墙钟前缀让多次抓包并发时顺序也无歧义。使用 TSV（制表符分隔）是有意为之 — 它能在那些会错误转义 stderr JSON 引号的 shell 中幸存下来。

会话结束后（第 5 步）再把 TSV 转换为 JSONL，而不是在会话进行中转换。

**预期：** 一个 TSV 日志，时间戳单调递增，每一行 stderr 对应一行。

**失败时：** 如果时间戳出现倒退，说明测试台在缓冲 stderr — 用 `stdbuf -oL -eL` 重跑，或使用打包器对应的行缓冲开关。

### 步骤 5：归一化为 JSONL

JSONL 是最终的工件格式：每行一个 JSON 对象，字段为 `timestamp`、`source`、`target`、`payload`。对 diff 友好、可用 `jq` 过滤，且在编辑器重新加载时保持稳定。

```bash
# Parse the TSV from Step 4 into JSONL.
awk -F'\t' '{
  printf "{\"timestamp\":\"%s\",\"source\":\"verbose-fetch\",\"target\":\"%s\",\"payload\":%s}\n",
    $1, "session", $2
}' < session.tsv | jq -c . > session.jsonl
```

逐行校验每一行都能解析：

```bash
while IFS= read -r line; do
  echo "$line" | jq -e . > /dev/null || echo "BAD LINE: $line"
done < session.jsonl
```

典型的过滤用法：

```bash
# Show only requests to a specific endpoint pattern.
jq -c 'select(.payload | tostring | test("/api/v1/example"))' session.jsonl

# Show timing between consecutive captures.
jq -r '.timestamp' session.jsonl | sort | uniq -c
```

**预期：** `*.jsonl` 的每一行都能通过 `jq -e .` 解析；没有任何 `BAD LINE` 警告。

**失败时：** 如果有些行校验失败，说明源 TSV 的载荷中嵌入了制表符 — 用不同的分隔符重跑第 4 步，或把第二个字段改为 base64 编码。

### 步骤 6：在抓包时脱敏

在写盘**之前**剥除认证头、会话 ID、Bearer 令牌和 PII。`events.jsonl` 和 `session.jsonl` 文件在首次写入时就不应包含任何秘密。

```bash
# Stream the raw capture through a redactor before persisting.
redact() {
  sed -E \
    -e 's/(authorization:[[:space:]]*Bearer[[:space:]]+)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(x-api-key:[[:space:]]*)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(cookie:[[:space:]]*)[^;]+/\1<REDACTED>/gi' \
    -e 's/("password"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g' \
    -e 's/("token"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g'
}

cat raw-capture.txt | redact > session.tsv
```

抓包完成后，验证没有遗漏：

```bash
# Patterns that must not appear in any *.jsonl file.
grep -Ei 'bearer [A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' captures/ \
  && { echo "LEAK DETECTED"; exit 1; } \
  || echo "redaction clean"
```

"先抓后脱敏"产生的工件总会漏出点什么。唯一安全的模式是"抓时即脱敏"。如果你在成品工件中发现了未脱敏的令牌，请将整次抓包视为已污染 — 删除它、轮换凭证、重新抓取。

**预期：** `LEAK DETECTED` 检查以 0 退出（无匹配）。用已知凭证前缀做 `grep` 返回空。

**失败时：** 如果泄漏检查命中，不要就地编辑文件。删除整个抓包目录，扩展脱敏正则以覆盖泄漏的模式类别，然后从第 3 步或第 4 步重新开始。

### 步骤 7：在记录前对响应类别做分类

HTTP 状态码在不同上下文下语义权重不同。在记录之前就做好分类，这样下游的 `jq` 过滤器才能基于意图而不是原始状态码进行筛选。

| 观察到的状态 | 通道上下文 | 分类 |
|---|---|---|
| 200 / 201 | 任意 | 成功 |
| 令牌刷新端点的 401 | 握手 | 握手的预期一步 |
| 数据端点的 401 | 认证之后 | 真实的认证失败 |
| 懒加载资源的 404 | 首次抓取 | 预期的未命中 |
| 已文档化端点的 404 | 特性闸门之后 | 闸门造成的缺失 |
| 429 | 任意 | 限流（退避，不要紧凑重试） |
| 5xx | 任意 | 服务端失败（记录，不要臆测） |

在抓包时就添加一个 `class` 字段：

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

令牌刷新通道上出现的 401 不是失败 — 它是握手的前一半。把握手步骤误判为失败会产生假阳性发现，浪费审阅者的注意力。

**预期：** `*.classified.jsonl` 的每一行都带有一个取值已知的 `class` 字段。

**失败时：** 如果分类结果里 `other` 项很多，说明上表对该测试台不完整 — 在继续分析之前，每一种反复出现的 `other` 模式都应在表里新增一行。

### 步骤 8：持久化抓包清单

只有当输入与输出一起被记录下来时，一次抓包运行才是可复现的。写一份清单：

```bash
cat > capture-manifest.json <<EOF
{
  "captured_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "harness_version": "$(harness-cli --version 2>/dev/null || echo unknown)",
  "channel": "verbose-fetch",
  "question": "Does endpoint X fire on event Y?",
  "targets": ["endpoint-X", "event-Y"],
  "files": ["session.jsonl", "session.classified.jsonl"],
  "redaction_check": "passed"
}
EOF
```

有了清单，这次抓包才能与将来的版本做 diff。

**预期：** `capture-manifest.json` 存在、可被 `jq` 解析，并列出了抓包目录下的每一个工件文件。

**失败时：** 如果测试台没有版本标志，则记录该二进制的 `sha256sum` 作为替代。无法识别的二进制会产生无法对比的抓包。

## 校验

- [ ] 在运行任何抓包命令之前先构建了可观测性表
- [ ] 抓包目录被 git 忽略且带时间戳
- [ ] 每个 `*.jsonl` 文件都能用 `jq -e .` 逐行解析
- [ ] 脱敏泄漏检查对已知凭证前缀无匹配
- [ ] 每一条已抓取的事件都有一个取值已知的 `class` 字段
- [ ] `capture-manifest.json` 记录了测试台版本（或 sha256）、通道与问题
- [ ] 抓包目录只包含第 1 步枚举的目标（没有来自其他应用的偶然流量）

## 常见陷阱

- **先抓包、后提问**：无人阅读的日志就是浪费磁盘与浪费注意力。先构建可观测性表；只抓取能回答具体问题的内容。
- **上来就用 `mitmproxy`**：出站代理是最具侵入性的通道。它要求信任证书，会在证书钉扎时失效，还会污染测试台的环境。仅当磁盘、转录、verbose-fetch 与钩子通道全部被封死时再使用。
- **在主要工作会话里抓包**：verbose-fetch stderr 会混入 TUI 渲染，还可能把你其他工作的片段泄漏到抓包里。始终使用一次性 shell。
- **"之后再脱敏"**：每一次"先抓后脱敏"的工件都至少漏过一次凭证。要么在抓包时脱敏，要么就不要抓。
- **把所有 4xx 一视同仁视为失败**：令牌刷新通道上的 401 是握手步骤而不是失败。在下结论之前，按通道上下文对响应类别分类（第 7 步）。
- **对按事件目标使用长期抓包**：用一个会话级进程去捕获三个离散事件，会让令牌状态在多次抓包间耦合，并使一次坏事件毒化下一次。对事件用钩子驱动子进程；会话抓包留给序列。
- **没有清单**：没有 `capture-manifest.json` 的 JSONL 文件是不可复现的 — 你无法与下个月的二进制做 diff，因为你不知道它是由哪个版本产出的。
- **捕获其他用户的流量**：超出范围。线路抓包仅针对你自己的账户在自己的机器上进行。如果抓包意外记录了别人的请求，请删除抓包并收紧通道。

## 相关技能

- `monitor-binary-version-baselines` — 父方法论的第 1 阶段；本技能清单所引用的版本基线由它产出。
- `probe-feature-flag-state` — 第 2-3 阶段；线路抓包是它的一条证据支线，本技能讲授抓包那一半。
- `instrument-distributed-tracing` — 共享"JSONL 配墙钟"的哲学；本技能把它应用于单个二进制，而不是服务网格。
- `redact-for-public-disclosure` — 第 5 阶段；本技能仅涵盖内部使用所需的抓包时脱敏，不涵盖工件离开私有工作区前所需的发布级脱敏。
