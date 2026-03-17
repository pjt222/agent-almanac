---
name: render-puzzle-docs
description: >
  渲染 jigsawR 的 Quarto 文档站点用于 GitHub Pages。支持全新渲染（清除缓存）、
  缓存渲染（更快）和单页渲染。使用捆绑的渲染脚本或从 WSL 直接调用 quarto.exe。
  适用于内容更改后构建完整站点、迭代编辑时渲染单页、为发布或 PR 准备文档，
  以及调试 Quarto .qmd 文件中的渲染错误。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, quarto, documentation, github-pages, rendering
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 渲染拼图文档

渲染 jigsawR 的 Quarto 文档站点。

## 适用场景

- 内容更改后构建完整文档站点
- 迭代编辑时渲染单个页面
- 为发布或 PR 准备文档
- 调试 Quarto .qmd 文件中的渲染错误

## 输入

- **必需**：渲染模式（`fresh`、`cached` 或 `single`）
- **可选**：指定 .qmd 文件路径（用于单页模式）
- **可选**：是否在浏览器中打开结果

## 步骤

### 第 1 步：选择渲染模式

| 模式 | 命令 | 耗时 | 使用时机 |
|------|------|------|---------|
| 全新 | `bash inst/scripts/render_quarto.sh` | ~5-7 分钟 | 内容更改、缓存过时 |
| 缓存 | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 分钟 | 微调编辑、缓存有效 |
| 单页 | 直接调用 quarto.exe | ~30 秒 | 迭代编辑单个页面 |

**预期结果：** 根据当前情况选择渲染模式：内容更改或缓存过时时选全新渲染，微调编辑时选缓存渲染，迭代编辑单个页面时选单页渲染。

**失败处理：** 如果不确定缓存是否过时，默认使用全新渲染。耗时更长但保证输出正确。

### 第 2 步：执行渲染

**全新渲染**（清除 `_freeze` 和 `_site`，重新执行所有 R 代码）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**缓存渲染**（使用现有 `_freeze` 文件）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**单页渲染**（直接渲染一个 .qmd 文件）：

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

**预期结果：** 渲染完成无错误。输出在 `quarto/_site/`。

**失败处理：**
- 检查 .qmd 代码块中的 R 代码错误（查找 `#| label:` 标记）
- 验证 pandoc 是否可通过 `RSTUDIO_PANDOC` 环境变量访问
- 尝试清除缓存：`rm -rf quarto/_freeze quarto/_site`
- 检查 .qmd 文件中使用的所有 R 包是否已安装

### 第 3 步：验证输出

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

确认站点结构：
- `quarto/_site/index.html` 存在
- 导航链接正确解析
- 图片和 SVG 文件正确渲染

**预期结果：** `index.html` 存在且非空。导航链接可解析，图片/SVG 在浏览器中正确渲染。

**失败处理：** 如果 `index.html` 缺失，渲染可能静默失败。使用详细输出重新运行并检查 `.qmd` 代码块中的 R 代码错误。如果只有部分页面缺失，验证那些 `.qmd` 文件是否列在 `_quarto.yml` 中。

### 第 4 步：预览（可选）

在 Windows 浏览器中打开：

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

**预期结果：** 文档站点在 Windows 默认浏览器中打开以供视觉检查。

**失败处理：** 如果从 WSL 执行 `cmd.exe /c start` 命令失败，尝试 `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"`。或者在浏览器中手动导航到该文件。

## 验证清单

- [ ] `quarto/_site/index.html` 存在且非空
- [ ] 控制台输出中无渲染错误
- [ ] 所有 R 代码块成功执行（检查错误消息）
- [ ] 页面间导航正常
- [ ] 所有 .qmd 文件的代码块都有 `#| label:` 以获得干净输出

## 常见问题

- **过时的 freeze 缓存**：如果 R 代码更改了，使用全新渲染重新生成 `_freeze` 文件
- **缺少 R 包**：Quarto .qmd 文件可能使用了不在 renv 中的包；先安装它们
- **找不到 Pandoc**：确保 `.Renviron` 中设置了 `RSTUDIO_PANDOC`
- **渲染时间长**：全新渲染需要 5-7 分钟（14 页含 R 执行）；迭代时使用缓存模式
- **代码块标签**：所有 R 代码块应有 `#| label:` 以获得干净渲染

## 相关技能

- `generate-puzzle` — 生成文档中引用的拼图输出
- `run-puzzle-tests` — 确保文档中的代码示例正确
- `create-quarto-report` — 通用 Quarto 文档创建
