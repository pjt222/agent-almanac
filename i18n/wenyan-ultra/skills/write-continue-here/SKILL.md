---
name: write-continue-here
locale: wenyan-ultra
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

# 書續此

書結構續檔使後會以全境始。

## 用

- 結會而工未畢→用
- 會間交複任→用
- 存意、敗法、下步——git 不能捕者→用
- 任中閉 Claude Code 前→用

## 入

- **必**：含近工可摘之活會
- **可**：交付中欲強何之特指

## 行

### 一：評會態

集近工事實：

```bash
git log --oneline -5
git status
git diff --stat
```

審話境：意何、何畢、何半成、何試敗、何決。

得：今任態清——畢項、進中項、計下步。

敗：非於 git 庫→略 git 命。續檔仍可捕話境與任態。

### 二：書 CONTINUE_HERE.md

按下構書檔於案根。每節須含可行容、非佔位。

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

則：
- **意**：捕「以何」——git log 示變、非以何
- **畢**：明標畢以免重工
- **進中**：最值節——半態最難重構
- **下步**：按先排數。用賴項前綴 `**[USER]**`
- **境**：錄負空——何試而拒、以何

得：CONTINUE_HERE.md 於案根、五節皆以今會真容填。時與枝準。

敗：Write 敗→察檔權。檔當建於案根（同 `.git/`）。驗 `.gitignore` 含 `CONTINUE_HERE.md`——無乃加。

### 三：驗檔

讀回 CONTINUE_HERE.md 確：
- 時為今（近數分內）
- 枝名配 `git branch --show-current`
- 五節含真容（無模佔位）
- 下步附號可行
- 進中項述今態足以續

得：檔讀為清可行交付，新會可即用以續工。

敗：改含佔位或過泛之節。每節應過試：「新會可不問釋而行此乎？」

## 驗

- [ ] CONTINUE_HERE.md 於案根
- [ ] 含五節真容（非佔位）
- [ ] 時與枝準
- [ ] `.gitignore` 含 CONTINUE_HERE.md
- [ ] 下步附號可行
- [ ] 進中項詳足以續無問

## 忌

- **書佔位代容**：「TODO: fill in later」廢用。每節須含今會真信
- **複 git 態**：勿列每改檔——git 已跡。聚於意、半態、下步
- **忘境節**：敗法為最值。無之，後會將重試同死路
- **覆而不讀**：CONTINUE_HERE.md 已存於前會→先讀——或含早交付未畢工
- **留舊檔**：CONTINUE_HERE.md 為暫。後會消後刪。舊檔致惑

## 參

- `read-continue-here` — 補：會始讀並行續檔
- `bootstrap-agent-identity` — 冷啟身重構，消此技生之續檔
- `manage-memory` — 持久跨會知（補此暫交付）
- `commit-changes` — 書續檔前存工於 git
- `write-claude-md` — 案指中可選續性建居
