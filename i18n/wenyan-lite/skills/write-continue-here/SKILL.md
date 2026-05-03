---
name: write-continue-here
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write a CONTINUE_HERE.md file capturing current session state so a fresh
  Claude Code session can pick up where this one left off. Covers assessing
  recent work, structuring the continuation file with objective, completed,
  in-progress, next-steps, and context sections, and verifying the file is
  actionable. Use when ending a session with unfinished work, handing off
  context between sessions, or preserving task state that git alone cannot
  capture.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, write
---

# 撰寫 Continue Here

撰寫一份結構化之續接文件,使下次會話得以完整上下文起。

## 適用時機

- 結束會話而工作仍進行中
- 於會話間交接複雜任務
- 保存 git 無法捕捉之意圖、失敗方法與下一步
- 任務中途關閉 Claude Code 前

## 輸入

- **必要**：含近期工作待摘要之活躍會話
- **選擇性**：交接中欲強調者之特定指示

## 步驟

### 步驟一：評估會話狀態

收集近期工作之事實：

```bash
git log --oneline -5
git status
git diff --stat
```

審查對話上下文：目標為何、何已完成、何部分完成、何已試而失敗、作了哪些決策。

**預期：** 對當前任務狀態之清晰理解——已完成項目、進行中項目與計畫之下一步。

**失敗時：** 若不在 git 倉庫中,跳過 git 命令。續接文件仍可捕捉對話上下文與任務狀態。

### 步驟二：撰寫 CONTINUE_HERE.md

依下方結構將文件寫入專案根。每段須含可行內容,非占位符。

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: current-branch-name

## Objective
One-paragraph description of what we are trying to accomplish and why.

## Completed
- [x] Finished item with key file paths (e.g., `src/feature.R`)
- [x] Decisions made and their rationale

## In Progress
- [ ] Partially complete work — describe current state (branch, file:line)
- [ ] Known issues with partial work

## Next Steps
1. Immediate next action (most important)
2. Subsequent actions in priority order
3. **[USER]** Items needing user input or decision

## Context
- Failed approaches and why they did not work
- Key constraints or trade-offs discovered
- Relevant issue/PR links
```

指引：
- **Objective**：捕捉「為何」——git log 顯示變了什麼,非為何
- **Completed**：明確標記已完成項目以防重做
- **In Progress**：此為最高價值之段——部分狀態最難重建
- **Next Steps**：依優先次序編號。將需用戶之項目以 `**[USER]**` 為前綴
- **Context**：記錄反空間——已試而拒之事與其因

**預期：** 專案根中存在 CONTINUE_HERE.md 文件,所有 5 段皆含當前會話之真實內容。時間戳與分支準確。

**失敗時：** 若 Write 失敗,檢查文件權限。文件應建於專案根（與 `.git/` 同目錄）。驗證 `.gitignore` 含 `CONTINUE_HERE.md`——若無,加之。

### 步驟三：驗證文件

讀回 CONTINUE_HERE.md 並確認：
- 時間戳為當前（最近數分鐘內）
- 分支名匹配 `git branch --show-current`
- 所有 5 段含真實內容（無範本占位符）
- Next Steps 已編號且可行
- In Progress 項目描述當前狀態之具體程度足以續行

**預期：** 文件讀如清晰、可行之交接,新會話可用以立即續行工作。

**失敗時：** 編輯含占位文字或過於模糊之段。各段應通過此測試：「新會話可依此行動而無須詢問澄清問題否？」

## 驗證

- [ ] CONTINUE_HERE.md 存於專案根
- [ ] 文件含所有 5 段之真實內容（非占位符）
- [ ] 時間戳與分支準確
- [ ] `.gitignore` 含 `CONTINUE_HERE.md`
- [ ] Next Steps 已編號且可行
- [ ] In Progress 項目指定足夠細節以無問題續行

## 常見陷阱

- **寫占位符而非內容**：「TODO：稍後填入」違背目的。每段須含當前會話之真實資訊
- **重複 git 狀態**：勿列出每個變更文件——git 已追蹤之。聚焦於意圖、部分狀態與下一步
- **忘 Context 段**：失敗方法為最寶貴之記錄物。若無,下次會話將重試同樣死路
- **未讀即覆蓋**：若 CONTINUE_HERE.md 已自先前會話存在,先讀之——可能含早期交接之未完工作
- **留陳舊文件**：CONTINUE_HERE.md 為短暫。下次會話消費後,刪除之。陳舊文件致混淆

## 相關技能

- `read-continue-here` — 互補：會話開始時讀並依續接文件行動
- `bootstrap-agent-identity` — 消費此技能所產續接文件之冷啟動身分重建
- `manage-memory` — 耐久跨會話知識（補此短暫交接）
- `commit-changes` — 撰寫續接文件前先將工作存至 git
- `write-claude-md` — 含選擇性連續性指引之專案指示
