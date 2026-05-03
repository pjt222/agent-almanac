---
name: write-continue-here
locale: wenyan
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

# 書 Continue Here

書結構之續文，俾次會以全脈絡始。

## 用時

- 會將終而工尚未畢
- 複任於會間交
- 存意、敗法、下步——git 不能捕者
- 任中閉 Claude Code 前

## 入

- **必要**：有近工可摘之活會
- **可選**：交中宜重者之特囑

## 法

### 第一步：察會態

聚近工之事：

```bash
git log --oneline -5
git status
git diff --stat
```

察對話脈絡：目何、何畢、何半畢、何試而敗、何決已立。

得：當前任態明——已畢項、進中項、計下步。

敗則：非於 git 庫者，略 git 命。續文仍可捕對話脈絡與任態。

### 第二步：書 CONTINUE_HERE.md

書文於項目根，依下結構。每段必含可行內，非代。

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

囑：
- **Objective**：捕*故*——git log 示何變，非何故
- **Completed**：明標已畢以免重工
- **In Progress**：此為最值段——半態最難重構
- **Next Steps**：依先後數。用者所賴項前綴 `**[USER]**`
- **Context**：錄反空——何試而拒、何故

得：CONTINUE_HERE.md 於項目根，五段皆以當前會之實內充。時與枝皆準。

敗則：Write 敗者，察文權。文宜立於項目根（與 `.git/` 同域）。驗 `.gitignore` 含 `CONTINUE_HERE.md`——否則加之。

### 第三步：驗其文

重讀 CONTINUE_HERE.md 而確：
- 時為當前（近數分內）
- 枝名配 `git branch --show-current`
- 五段皆含實內（無模代）
- Next Steps 已數且可行
- In Progress 項述當前態足以續

得：文讀為清、可行之交，新會可即據之續工。

敗則：含代或過糊之段宜改。每段宜過試：「新會無需問澄而可行此乎？」

## 驗

- [ ] CONTINUE_HERE.md 存於項目根
- [ ] 文含五段皆實內（非代）
- [ ] 時與枝皆準
- [ ] `.gitignore` 含 `CONTINUE_HERE.md`
- [ ] Next Steps 已數且可行
- [ ] In Progress 項詳足以無問而續

## 陷

- **書代而非內**：「TODO：後填」敗其用。每段必含當前會之實信
- **複 git 態**：勿列諸變文——git 已追之。專於意、半態、下步
- **忘 Context 段**：敗法為最值錄者。無之，次會重試同死巷
- **覆而不讀**：CONTINUE_HERE.md 已存於前會者，先讀之——或含早交未畢之工
- **留陳文**：CONTINUE_HERE.md 為暫。次會用之後，刪之。陳文致亂

## 參

- `read-continue-here` — 補：會始時讀且依續文行
- `bootstrap-agent-identity` — 冷始臣識重構，用此術所生之續文
- `manage-memory` — 持跨會知（補此暫交）
- `commit-changes` — 書續文前存工於 git
- `write-claude-md` — 項目囑，可選續囑居此
