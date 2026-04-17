---
name: refactor-skill-structure
description: >
  通过将示例提取到 references/EXAMPLES.md、拆分复合步骤，并重组章节以实现
  渐进式披露，对过长或结构不良的 SKILL.md 进行重构。适用于技能超过 500 行的
  CI 限制、代码块主导技能正文、步骤包含多个不相关操作，或内容更新将技能推过
  行数限制后。
locale: zh-CN
source_locale: en
source_commit: 902f69ec
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: advanced
  language: multi
  tags: review, skills, refactoring, structure, progressive-disclosure
---

# 重构技能结构

对超过 500 行限制或出现结构性问题的 SKILL.md 进行重构。此技能将扩展代码示例提取到 `references/EXAMPLES.md`，将复合步骤拆分为聚焦的子步骤，添加渐进式披露的交叉引用，并在重构后验证技能是否仍然完整有效。

## 适用场景

- 技能超过 CI 强制执行的 500 行限制
- 单个步骤包含多个不相关的操作，应该拆分为独立步骤
- 超过 15 行的代码块主导了 SKILL.md 且可以提取
- 技能积累了打破标准六章节结构的临时章节
- 内容更新将技能推过行数限制后
- 技能评审发现了超出内容质量的结构性问题

## 输入

- **必填**：要重构的 SKILL.md 文件路径
- **可选**：目标行数（默认：目标为 500 行限制的 80%，即约 400 行）
- **可选**：是否创建 `references/EXAMPLES.md`（默认：是，若存在可提取内容）
- **可选**：是否拆分为多个技能（默认：否，优先提取）

## 步骤

### 第 1 步：测量当前行数并识别臃肿来源

阅读技能并创建逐章节的行数预算，以识别臃肿所在。

```bash
# 总行数
wc -l < skills/<skill-name>/SKILL.md

# 每章节行数（近似）
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

对臃肿来源分类：
- **可提取**：超过 15 行的代码块、完整配置示例、多变体示例
- **可拆分**：执行 2+ 个不相关操作的复合步骤
- **可精简**：冗余解释、过于冗长的上下文句子
- **结构性**：不在标准六章节结构中的临时章节

**预期结果：** 行数预算显示哪些章节过大以及适用的臃肿类别。最大的章节是主要重构目标。

**失败处理：** 若技能在 500 行以下且无明显结构性问题，此技能可能不需要。在继续之前验证重构请求是否合理。

### 第 2 步：将代码块提取到 references/EXAMPLES.md

将超过 15 行的代码块移至 `references/EXAMPLES.md` 文件，在主 SKILL.md 中保留简短的内联片段（3-10 行）。

1. 创建 references 目录：
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. 对每个可提取的代码块：
   - 将完整代码块复制到 `references/EXAMPLES.md` 的描述性标题下
   - 在 SKILL.md 中用简短的 3-5 行片段替换代码块
   - 添加交叉引用：`See [EXAMPLES.md](references/EXAMPLES.md#heading) for the complete configuration.`

3. 用清晰标题组织 `references/EXAMPLES.md`：
   ```markdown
   # Examples

   ## Example 1: Full Configuration

   Complete configuration file for [context]:

   \```yaml
   # ... full config here ...
   \```

   ## Example 2: Multi-Variant Setup

   ### Variant A: Development
   \```yaml
   # ... dev config ...
   \```

   ### Variant B: Production
   \```yaml
   # ... prod config ...
   \```
   ```

**预期结果：** 所有超过 15 行的代码块已提取。主 SKILL.md 保留简短内联片段以确保可读性。交叉引用链接到提取的内容。`references/EXAMPLES.md` 以描述性标题良好组织。

**失败处理：** 若提取代码块不足以减少行数（仍然超过 500），继续第 3 步进行步骤拆分。若技能几乎没有代码块（如纯自然语言技能），重点关注第 3 步和第 4 步。

### 第 3 步：将复合步骤拆分为聚焦步骤

识别执行多个不相关操作的步骤并拆分。

复合步骤的迹象：
- 步骤标题包含"and"（如"Configure Database and Set Up Caching"）
- 步骤有多个预期结果/失败处理块（或应该有）
- 步骤超过 30 行
- 步骤的各子部分可以跳过或以不同顺序完成

对每个复合步骤：
1. 识别步骤中的不同操作
2. 为每个操作创建新的 `### Step N:`
3. 重新编号后续步骤
4. 确保每个新步骤有自己的预期结果和失败处理块
5. 在新步骤之间添加过渡性上下文

**预期结果：** 每个步骤只做一件事。没有步骤超过 30 行。步骤数量可能增加，但每个步骤可以独立验证。

**失败处理：** 若拆分步骤创建了太过细粒度的步骤（如 20+ 个总步骤），考虑将相关的微步骤归入一个带编号子步骤的单一步骤。理想范围是 5-12 个步骤。

### 第 4 步：从 SKILL.md 添加到提取内容的交叉引用

确保主 SKILL.md 在提取后仍保持可读性和可发现性。

对每次提取：
1. SKILL.md 中的内联片段应该对常见情况自给自足
2. 交叉引用应该解释有哪些额外内容可用
3. 使用相对路径：`[EXAMPLES.md](references/EXAMPLES.md#section-anchor)`

交叉引用模式：
- 在简短代码片段之后：`See [EXAMPLES.md](references/EXAMPLES.md#full-configuration) for the complete configuration with all options.`
- 对于多变体示例：`See [EXAMPLES.md](references/EXAMPLES.md#variants) for development, staging, and production variants.`
- 对于扩展的故障排除：`See [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) for additional error scenarios.`

**预期结果：** 每次提取都有对应的交叉引用。读者可以按照主 SKILL.md 处理常见情况，并深入 references 了解细节。

**失败处理：** 若交叉引用使文字流动变得尴尬，将多个引用合并为步骤末尾的单个注释：`For extended examples including [X], [Y], and [Z], see [EXAMPLES.md](references/EXAMPLES.md).`

### 第 5 步：重构后验证行数

所有更改完成后重新测量 SKILL.md 行数。

```bash
# 检查主 SKILL.md
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "SKILL.md: OK ($lines lines)" || echo "SKILL.md: STILL OVER ($lines lines)"

# 若已创建，检查 references 文件
if [ -f skills/<skill-name>/references/EXAMPLES.md ]; then
  ref_lines=$(wc -l < skills/<skill-name>/references/EXAMPLES.md)
  echo "EXAMPLES.md: $ref_lines lines"
fi

# 总内容
echo "Total content: $((lines + ${ref_lines:-0})) lines"
```

**预期结果：** SKILL.md 在 500 行以下。理想情况下在 400 行以下，为未来增长留有空间。`references/EXAMPLES.md` 没有行数限制。

**失败处理：** 若提取和拆分后仍超过 500 行，考虑技能是否应该分解为两个独立的技能。涵盖范围过广的技能是范围蔓延的迹象。使用 `create-skill` 编写第二个技能，并更新两个技能中的相关技能交叉引用。

### 第 6 步：验证所有章节仍然存在

重构后，验证技能仍然具有所有必需章节且前置元数据完整。

运行 `review-skill-format` 清单：
1. YAML 前置元数据正确解析
2. 全部六个必需章节存在（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
3. 每个步骤都有预期结果和失败处理块
4. 没有孤立的交叉引用（所有链接可解析）

```bash
# 快速章节检查
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

**预期结果：** 所有章节存在。提取过程中没有意外删除内容。SKILL.md 中的交叉引用解析到 EXAMPLES.md 中的实际标题。

**失败处理：** 若章节被意外删除，从 git 历史中恢复：`git diff skills/<skill-name>/SKILL.md` 查看更改的内容。若交叉引用损坏，验证 EXAMPLES.md 中的标题锚点与 SKILL.md 中的链接匹配（GitHub 风格 Markdown 锚点规则：小写，空格用连字符，去除标点）。

## 验证清单

- [ ] SKILL.md 行数为 500 行或更少
- [ ] SKILL.md 中的所有代码块为 15 行或更少
- [ ] 提取的内容在 `references/EXAMPLES.md` 中，有描述性标题
- [ ] 每次提取在主 SKILL.md 中都有交叉引用
- [ ] 没有剩余的复合步骤（每个步骤只做一件事）
- [ ] 重构后所有六个必需章节仍然存在
- [ ] 每个步骤都有 **Expected:** 和 **On failure:** 块
- [ ] YAML 前置元数据完整且可解析
- [ ] 交叉引用链接解析到 EXAMPLES.md 中的实际标题
- [ ] `review-skill-format` 验证在重构后的技能上通过

## 常见问题

- **提取过于激进**：将所有代码移到 references 会使主 SKILL.md 难以阅读。对常见情况保留 3-10 行的内联片段。只提取超过 15 行或显示多个变体的块。
- **锚点链接损坏**：GitHub 风格 Markdown 锚点在某些渲染器中区分大小写。在 EXAMPLES.md 中使用小写标题，并在交叉引用中精确匹配。用 `grep -c "heading-text" references/EXAMPLES.md` 测试。
- **拆分期间丢失预期结果/失败处理**：拆分复合步骤时，确保每个新步骤都有自己的预期结果和失败处理块。拆分后很容易让一个步骤缺少这些块。
- **创建过多微小步骤**：拆分应产生 5-12 个步骤。若最终有 15+ 个步骤，说明拆分过于激进。将相关的微步骤重新合并为逻辑组。
- **忘记更新 references/EXAMPLES.md 标题**：若重命名 EXAMPLES.md 中的章节，SKILL.md 中的所有交叉引用锚点都必须更新。搜索旧锚点名称以找到所有引用。

## 相关技能

- `review-skill-format` — 重构后运行格式验证以确认技能仍然合规
- `update-skill-content` — 内容更新通常是当内容将技能推过行数限制时进行结构重构的触发器
- `create-skill` — 在决定如何组织提取内容时参考规范结构
- `evolve-skill` — 当技能需要拆分为两个独立技能时，使用演进来创建衍生技能
