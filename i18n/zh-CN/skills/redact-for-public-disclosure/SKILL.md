---
name: redact-for-public-disclosure
description: >
  Redact reverse-engineering findings for public disclosure while preserving
  methodology, generalizable patterns, and teaching value. Covers the
  private-vs-public repo split, deny-list pattern maintenance, orphan-commit
  publish pattern that prevents `git log` leaks, category-based redaction
  calibration (methodology/pattern/version-finding/internal), and the
  `check-redaction.sh`-style CI gate that blocks merges when a deny-listed
  pattern appears. Use when publishing findings about a CLI harness you don't
  own, when preparing upstream proposals to an unrelated project, or when
  archiving a private research repo for public reference.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, disclosure, deny-list, orphan-commit, ci-gate, research-publishing
  locale: zh-CN
  source_locale: en
  source_commit: b9570f58
  translator: "Claude Sonnet 4.6"
  translation_date: "2026-04-17"
---

# 为公开披露做脱敏

借助脱敏检查器、模式拒绝清单与孤立提交发布模式，把一个逆向研究仓库拆分为私有的权威来源与公开披露的子集。方法论可以流传，具体发现则留在私有仓库里。

## 何时使用

- 发布关于你所集成的闭源 CLI 测试台的方法论发现
- 准备向你并不拥有的项目提交上游提案或缺陷报告
- 将一个私有研究仓库归档为公开参考资料
- 把调查笔记（第 1-4 阶段的工件）提升为一份公开指南
- 在发现积累之前就建立发布管线，避免泄漏风险积压
- 在某次"草稿差点发出了敏感标识符"的险情之后进行清理

## 输入

- **必需**：一个混合敏感度内容的私有研究仓库（权威来源）
- **必需**：一个作为公开镜像的目标（独立仓库，或一个 `public/` 工作区），脱敏后的内容将发布到这里
- **可选**：一份计划发布的现有草稿
- **可选**：版本滞后策略（默认："当前版本加前一个版本保持私有"）
- **可选**：已知敏感的厂商标识符、标志位前缀或命名空间清单

## 步骤

### 步骤 1：对每一条候选事实做分类

在撰写或提升任何内容之前，把每一条事实归入以下四类之一。类别决定它是否以及何时可以发布。

| 类别 | 定义 | 可分享？ |
|---|---|---|
| **methodology（方法论）** | 调查*如何*进行，独立于任何具体发现 | 始终 |
| **generic pattern（通用模式）** | 类别层面的观察（例如"测试台普遍使用单一前缀的标志位命名空间"） | 可以 |
| **version-specific finding（版本特定发现）** | 与具体发布绑定的具体观察（例如"在 vN.M 中，闸门默认关闭"） | 仅在版本滞后冷却期之后 |
| **live internal（在用的内部内容）** | 压缩名、字节偏移、暗标志位名、当前版本闸门逻辑、PRNG/盐常量、内部代号 | 绝不 |

在撰写或发布前审阅时，为每一段草稿、每一条抓包日志、每一则笔记都打上类别标签。混合类别的段落应拆分 — 方法论干净地剥离出来，其余留在私有仓库。

**预期：** 每一条候选事实都有类别标签。打算发布到公开镜像的草稿只包含方法论与通用模式条目（外加冷却期之后的版本特定发现）。

**失败时：** 如果某条事实难以归类，默认把它当作"在用的内部内容"。只有在对照版本滞后策略做了显式审阅之后才重新归类。

### 步骤 2：设定版本滞后冷却策略

预先决定"当前"与"可分享"之间相隔多少个版本。两个版本是典型值：当前加前一个版本保持私有，更早的模式可以讨论。把该策略写进私有仓库（例如 `REDACTION_POLICY.md`），使未来的你不必重新推导一次。

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

"当前"版本必须是经验性的（从已安装的二进制读取），而不是行政定义。把策略挂钩到基线扫描器的输出，而不是挂钩到日历。

**预期：** 私有仓库中有一份已提交的 `REDACTION_POLICY.md`，带有显式冷却期与责任人。

**失败时：** 若相关方对冷却期达不成一致，默认采用最保守的提议。冷却期可以后续缩短；一次泄漏则无法召回。

### 步骤 3：构建拒绝清单扫描器

把模式维护在一份单一的可执行脚本中，这份脚本即脱敏策略的权威来源。脚本放在私有仓库（`tools/check-redaction.sh`），对公开镜像运行。

```bash
#!/usr/bin/env bash
set -u
PUBLIC_REPO="${1:-./public}"
LEAKS=0

PATTERNS=(
  "minified identifier shape|<regex matching short bundle-style identifiers>"
  "vendor-prefixed flag|<regex matching the vendor's flag prefix>"
  "PRNG/salt constant|<regex matching the specific constants>"
)

for entry in "${PATTERNS[@]}"; do
  desc="${entry%%|*}"
  pattern="${entry##*|}"
  if rg -q "$pattern" "$PUBLIC_REPO"; then
    echo "LEAK: $desc"; LEAKS=$((LEAKS+1))
  fi
done
exit $LEAKS
```

每个条目包含一个人类可读的标签与一个正则。每个敏感标识符的*形态*一条（不是每个字面量一条 — 形态能在版本迭代中幸存）。退出码等于泄漏条数；干净的运行以 0 退出。

**预期：** 对一个小仓库运行 `tools/check-redaction.sh ./public-mirror` 一秒内完成；无匹配时以 0 退出。

**失败时：** 如果 `rg` 不可用，退回到 `grep -rqE`。如果模式太宽泛（每次运行都报告泄漏），从源头收紧它们，而不是新增抑制项。

### 步骤 4：在动笔前维护拒绝清单

当第 1-4 阶段的某个发现可能通过草稿泄漏时，应在草稿落笔*之前*就扩展扫描器。草稿便宜；教会扫描器新模式才是长期有效的做法。

工作流：

1. 新发现落入私有仓库（例如一个新发现的标志位前缀）。
2. 自问："如果它泄漏了，我希望扫描器捕获什么？"
3. 把一个模式条目（标签 + 正则）加入 `tools/check-redaction.sh`。
4. 对整个公开镜像运行扫描器，确认这个新模式不会已被合法内容误触发。
5. 只有在此之后，才开始撰写任何涉及该领域的公开内容。

这把通常的顺序颠倒过来：先更新扫描器，后写草稿。扫描器成为"什么过于敏感不能发布"的可执行规范，草稿也就无法不小心跑到它前面。

**预期：** `tools/check-redaction.sh` 中的模式条目在任何可能匹配到它们的公开镜像内容之前就已就位。`git log tools/check-redaction.sh` 显示扫描器更新先于相关草稿提交落地。

**失败时：** 如果扫描器更新落后于草稿，立即对公开镜像跑一遍新模式进行审计。先脱敏，再提交扫描器更新，并附注说明发现的模式。

### 步骤 5：建立私有/公开文件集拆分

为同步到公开镜像的文件定义一份显式的白名单。新文件默认为私有；提升需要通过脱敏检查。

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

一个 `tools/sync-to-public.sh` 读取白名单，只把清单中的文件复制到公开镜像；若白名单引用了不存在的文件，则以非零退出（捕获拼写错误）。

```bash
#!/usr/bin/env bash
set -eu
PRIVATE_ROOT="${1:?private repo path required}"
PUBLIC_ROOT="${2:?public mirror path required}"
ALLOWLIST="$PRIVATE_ROOT/tools/public-allowlist.txt"

while IFS= read -r path; do
  [ -z "$path" ] && continue
  case "$path" in \#*) continue ;; esac
  src="$PRIVATE_ROOT/$path"
  dst="$PUBLIC_ROOT/$path"
  if [ ! -e "$src" ]; then
    echo "MISSING: $path"; exit 2
  fi
  mkdir -p "$(dirname "$dst")"
  cp -a "$src" "$dst"
done < "$ALLOWLIST"
```

提升操作按顺序需要三件事：文件被加入白名单、文件通过脱敏检查、审阅者确认第 1 步的类别标签。

**预期：** 公开镜像中恰好包含 `tools/public-allowlist.txt` 列出的文件。没有任何不在白名单上的文件出现在公开镜像。

**失败时：** 如果某个文件出现在公开镜像却不在白名单中，把它视为一次泄漏事件 — 调查它是如何到达那里的，然后要么移除它，要么在完成脱敏审阅后正式提升它。

### 步骤 6：通过孤立提交发布

公开镜像是一个以 `git commit --orphan` 为根、在每次发布时重建的单一提交。这样能防止公开仓库的 `git log` 暴露脱敏前的草稿。

```bash
# In the public mirror (separate repo or worktree)
cd /path/to/public-mirror
git checkout --orphan publish-tmp
git rm -rf .                                    # Clear the index
# Sync from private using the allow-list
bash /path/to/private/tools/sync-to-public.sh /path/to/private .
git add -A
git commit -m "Publish: <date>"
git branch -D main 2>/dev/null || true
git branch -m main
git push --force origin main
```

公开仓库的 `git log` 恰好只有一个提交。先前的草稿以及任何脱敏迭代都留在私有仓库的历史中。公开仓库上的 `git log -p`、`git reflog` 或分支列表都无法恢复脱敏前的内容，因为那些内容从未提交到公开仓库。

**预期：** 公开镜像的 `git log --oneline` 每次发布显示恰好一个提交。不出现任何对私有仓库历史的引用（无父级 SHA、无合并提交、无来自私有仓库的标签）。

**失败时：** 如果 `git push --force` 被拒（分支保护），则从一个干净的孤立分支开一个单提交的 Pull Request。绝不通过推送私有历史来绕过拒绝。

### 步骤 7：接入 CI 闸门

对公开同步分支的每次提交都运行 `tools/check-redaction.sh`。检查失败应阻断发布，而不仅仅是警告。

```yaml
# .github/workflows/redaction-check.yml (in the public mirror repo)
name: redaction-check
on:
  push:
    branches: [main, publish-*]
  pull_request:
    branches: [main]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install ripgrep
        run: sudo apt-get update && sudo apt-get install -y ripgrep
      - name: Fetch redaction scanner
        env:
          GH_TOKEN: ${{ secrets.PRIVATE_REPO_TOKEN }}
        run: |
          gh api repos/<org>/<private-repo>/contents/tools/check-redaction.sh \
            --jq .content | base64 -d > check-redaction.sh
          chmod +x check-redaction.sh
      - name: Run scanner
        run: ./check-redaction.sh .
```

此处的两个设计选择：

- 扫描器在 CI 时从私有仓库拉取，这样拒绝清单本身永远不会存在于公开仓库（模式本身就是敏感的 — 发布它们等于告诉读者到二进制里搜什么）。
- 作业以扫描器的退出码退出；非零退出阻断工作流。

**预期：** 引入了被拒绝模式的推送会让 CI 失败；发布不会落地。维护者能看到失败标签（例如 `LEAK: vendor-prefixed flag`），但看不到正则本身。

**失败时：** 如果无法向公开 CI 授予私有仓库令牌，只在公开仓库内嵌扫描器的*最小泄漏*部分（不会暴露厂商身份的宽泛形态模式），并在私有仓库中推送之前运行完整扫描器。

### 步骤 8：诚实地处理误报

当扫描器被合法内容触发时，优先收紧模式，而不是新增忽略行。带有本地抑制的宽泛拒绝清单很快腐烂 — 半年之后没人记得某一行为何被抑制，而下一次泄漏就悄无声息地溜过去。

决策树：

1. **这次匹配真的安全吗？** 回到第 1 步重新分类。如果内容其实是乔装的"在用内部内容"，请脱敏；不要抑制扫描器。
2. **模式是不是太宽？** 收紧正则以让安全内容不再匹配。在 `check-redaction.sh` 中加注释记录收紧原因，并链接到促成它的案例。
3. **只有在 1 与 2 都不成立时** — 并且该模式与合法内容在结构上过于纠缠以至于无法进一步收窄 — 再使用单行抑制，配一行 `# REASON:` 注释说明*为什么*这次抑制安全。给注释打上日期。

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

**预期：** 每个扫描器模式有零条或一条解释收紧原因的行内注释。抑制（如有）都带有日期与理由。

**失败时：** 如果抑制开始堆积（每季度超过一条），说明拒绝清单的形状不对。安排一次脱敏策略回顾，并从分类过的事实清单出发重建模式。

### 步骤 9：周期性脱敏清扫

不是所有脱敏工作都靠事件驱动。做一次周期性清扫（月度为典型），对私有仓库最近的新增内容重新分类，并再次对公开镜像运行扫描器。漂移能在事件级别之前就被自行捕捉。

清扫核对清单：

- [ ] 重新阅读版本滞后策略；确认经验上的"当前"版本未变，或更新策略
- [ ] 审计过去一个月的私有仓库提交中是否有未被分类（第 1 步）的新增发现
- [ ] 对公开镜像运行 `tools/check-redaction.sh`（应仍然以 0 退出）
- [ ] 回顾自上次清扫以来新增的扫描器模式 — 是否有太宽的？若有则收紧
- [ ] 若某个版本已超出冷却期，标出如今可提升的发现
- [ ] 确认 `tools/public-allowlist.txt` 与公开镜像的实际文件集一致

**预期：** 私有仓库中每月一份简短的清扫日志（例如 `sweeps/2026-04.md`），记录核对结果与已采取的行动。

**失败时：** 如果清扫反复被跳过，则自动化一条日历提醒。如果清扫反复发现相同的漂移，问题出在它上游的工作流 — 调查为什么分类在草稿阶段被跳过。

## 校验

- [ ] 公开镜像中每一个文件都在 `tools/public-allowlist.txt` 上
- [ ] `tools/check-redaction.sh ./public-mirror` 以 0 退出
- [ ] 公开镜像的 `git log --oneline` 在每次发布后显示单一孤立提交
- [ ] 私有仓库中存在 `REDACTION_POLICY.md`，包含显式的版本滞后冷却期
- [ ] 每条第 1-4 阶段的发现都有类别标签（methodology / generic pattern / version-specific / live internal）
- [ ] 公开 CI 在每次推送上都运行扫描器；一个故意的测试模式会使构建失败
- [ ] 拒绝清单扫描器自身不存放于公开仓库
- [ ] 最近一次月度清扫日志的日期在过去 35 天内

## 常见陷阱

- **"就举一个例子让它更具体。"** 想要加入一个具体发现"以便落实方法论"的冲动，是最常见的泄漏路径。使用合成占位符（例如 `acme_widget_v3`、`widget_handler_42`）— 显然是虚构的，绝不可追溯到真实产品。
- **使用 `git rebase` 或 `git filter-branch` 在公开仓库就地抹除泄漏。** 强制推送重写历史后，克隆与派生仓库中仍留有痕迹。孤立提交发布模式是结构性修复；临时的历史重写不是。
- **用抑制代替收紧模式。** 带有二十条抑制的扫描器就是零有效覆盖的扫描器。每一条抑制都是未来的一次泄漏等待上下文淡忘。
- **公开 CI 只警告不失败。** 警告会被忽略。CI 闸门必须阻断发布（非零退出，禁止合并）。
- **白名单漂移。** 新加入私有仓库的文件不自动属于白名单。默认拒绝是唯一安全的姿态。
- **把加密误当作脱敏。** 对敏感标识符做编码、哈希或 rot13 再发布，仍然等于发布了它 — 原文是可恢复的。脱敏意味着"完全不出现"。
- **发布拒绝清单。** 模式本身就是一份发现目录：读到正则的人就会精确知道该在二进制里 grep 什么。让扫描器保持私有；只有它的标签（例如 `LEAK: vendor-prefixed flag`）才应出现在公开 CI 日志中。
- **把私有仓库当作草稿堆。** 它是研究的权威来源，不是临时工作区。对它施加与任何生产工件相同的版本、审阅与备份纪律。

## 相关技能

- `monitor-binary-version-baselines` — 第 1 阶段，基线为版本滞后策略供能：什么算"当前"是经验事实，而非日历事实
- `probe-feature-flag-state` — 第 2-3 阶段，这里的分类发现在第 1 步类别打标签处进入脱敏管线
- `conduct-empirical-wire-capture` — 第 4 阶段，抓包工件（线路日志、载荷 schema）在被任何公开引用之前都需要脱敏
- `security-audit-codebase` — 两条管线都受益于拒绝清单式扫描；本技能专攻研究披露，而非密钥泄漏
- `manage-git-branches` — 孤立提交发布模式是一个分支操作；安全执行依赖于那里所记录的分支卫生实践
