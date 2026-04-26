---
name: manage-memory
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Organize, extract, prune, and verify Claude Code persistent memory files.
  Covers MEMORY.md as a concise index, topic extraction to dedicated files,
  staleness detection, accuracy verification against project state, and
  the 200-line truncation constraint. Use when MEMORY.md is approaching the
  200-line limit, after a session produces durable insights worth preserving,
  when a topic section has grown beyond 10-15 lines and should be extracted,
  or when project state has changed and memory entries may be stale.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, claude-code, organization, maintenance, auto-memory
---

# 管記憶

維 Claude Code 持久記憶目錄以跨會話保準、簡、用。MEMORY.md 於每對話載入系統提示——200 行後將截，故此文件當為精索，指向供細之主題文件。

## 適用時機

- MEMORY.md 近 200 行截止閾
- 會話產值存之持久洞見（新模式、架構決、除錯解）
- MEMORY.md 中之主題節超 10-15 行，當抽出
- 項目態變（改名文件、新域、更新計數），記憶條目或陳
- 始新工作域並查相關記憶是否已存
- 會話間之週期維護以保記憶目錄健

## 輸入

- **必要**：訪記憶目錄之權（常為 `~/.claude/projects/<project-path>/memory/`）
- **選擇性**：特定觸發（如「MEMORY.md 過長」、「剛成大重構」）
- **選擇性**：待加、更或抽之主題

## 步驟

### 步驟一：評當前態

讀 MEMORY.md 並列記憶目錄中之所有文件：

```bash
wc -l <memory-dir>/MEMORY.md
ls -la <memory-dir>/
```

查行數對 200 行限。清點既有主題文件。

**預期：** 總行數、主題文件數，與 MEMORY.md 中所存節之清晰畫面。

**失敗時：** 若記憶目錄不存，創之。若 MEMORY.md 不存，創具 `# Project Memory` 標頭與 `## Topic Files` 節之最簡者。

### 步驟二：識陳條目

比記憶主張於當前項目態。常陳模式：

1. **計數漂**：加減後變之文件計數、技能計數、域計數
2. **改名路徑**：移或改名之文件或目錄
3. **被取代之模式**：修後已不需之繞行
4. **矛盾**：同主題而兩條目言異者

用 Grep 抽查關鍵主張：

```bash
# Example: verify a skill count claim
grep -c "^      - id:" skills/_registry.yml
# Example: verify a file still exists
ls path/claimed/in/memory.md
```

**預期：** 陳條目清單附當前正值。

**失敗時：** 若不能驗主張（如其指外態不可查），留之而附 `(unverified)` 記，勿默保潛誤信息。

### 步驟三：定何所加

對新條目，寫前用此濾：

1. **持久**：下會話仍真？避會話特上下文（當前任、進行中工作、臨時態）
2. **非重**：CLAUDE.md 或項目文檔已涵？勿重——記憶為他處未捕者
3. **已驗**：此已跨多互確認，抑僅單觀？單觀者於寫前驗於項目文檔
4. **可行**：知此是否變行為？「天為藍」無用。「退碼 5 示引號誤——用臨文件」變汝工作法

例外：若用戶明請記某事，立存之——無需待多次確認。

**預期：** 已濾清單，每條目合持久 + 非重 + 已驗 + 可行之標準。

**失敗時：** 若未定條目是否值留，偏向於 MEMORY.md 中簡留之——後刪較重新發現易。

### 步驟四：抽過大主題

當 MEMORY.md 中之節超約 10-15 行，抽至專屬主題文件：

1. 創 `<memory-dir>/<topic-name>.md` 附描述性標頭
2. 移 MEMORY.md 之詳內容至主題文件
3. 以 1-2 行總結與鏈接替 MEMORY.md 中之節：

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Brief description of contents
```

主題文件之命名慣：
- 用小寫 kebab-case：`viz-architecture.md`，非 `VizArchitecture.md`
- 按主題而非時序命名：`patterns.md`，非 `session-2024-12.md`
- 群相關項：合「R 除錯」與「WSL 怪癖」為 `patterns.md`，勿每事創一文件

**預期：** MEMORY.md 保於 200 行下。每主題文件自足，無 MEMORY.md 上下文亦可讀。

**失敗時：** 若主題文件少於 5 行，或不值抽——留於 MEMORY.md 內聯。

### 步驟五：更 MEMORY.md

應用所有變：除陳條目、加新條目、更計數，並確 Topic Files 節列所有專屬文件。

MEMORY.md 結構當循此模式：

```markdown
# Project Memory

## Section 1 — High-level context
- Bullet points, concise

## Section 2 — Another topic
- Key facts only

## Topic Files
- [file.md](file.md) — What it covers
```

指引：
- 每條最多 1-2 行
- 用內聯格式（`code`、**bold**）以易掃
- 最常需之上下文置於前
- Topic Files 節恒置末

**預期：** MEMORY.md 於 200 行下，準確，所有主題文件鏈接有效。

**失敗時：** 若抽後仍不能於 200 行下，識別最少用之節抽之。每節皆候——即使項目結構概覽亦可入主題文件，若需則僅留 1 行總結。

### 步驟六：驗整性

作終查：

1. **行數**：確 MEMORY.md 於 200 行下
2. **鏈接**：驗 MEMORY.md 中參之每主題文件存
3. **孤兒**：查未於 MEMORY.md 參之主題文件
4. **準確**：抽查 2-3 事實主張對項目態

```bash
wc -l <memory-dir>/MEMORY.md
# Check for broken links
for f in $(grep -oP '\[.*?\]\(\K[^)]+' <memory-dir>/MEMORY.md); do
  ls <memory-dir>/$f 2>/dev/null || echo "BROKEN: $f"
done
# Check for orphan files
ls <memory-dir>/*.md | grep -v MEMORY.md
```

**預期：** 行數於 200 下，無破鏈，無孤文件，抽查主張準。

**失敗時：** 修破鏈（更或除）。對孤文件，或於 MEMORY.md 加參，或若已不關則刪之。

## 驗證

- [ ] MEMORY.md 於 200 行下
- [ ] MEMORY.md 中參之所有主題文件存於磁
- [ ] 記憶目錄中無孤 `.md` 文件（每文件自 MEMORY.md 有鏈）
- [ ] 任何記憶文件中無陳計數或改名路徑
- [ ] 新條目合持久/非重/已驗/可行標準
- [ ] 主題文件具描述性標頭，自足
- [ ] MEMORY.md 讀如有用之速參，非更新日誌

## 常見陷阱

- **記憶文件污染**：將每會話觀寫至記憶。多發現為會話特而不需持。寫前用四濾（步驟三）
- **陳計數**：更碼而不更記憶。計數（技能、代理、域、文件）默漂。信記憶前恒對真源驗計數
- **按時序組織**：按「何時學」而非「關何」組織。主題基組織（`patterns.md`、`viz-architecture.md`）供檢索遠勝日期基文件
- **重 CLAUDE.md**：CLAUDE.md 為項目指令之權威文件。記憶當捕 CLAUDE.md 中所無者——除錯洞見、架構決、工作流好、跨項目模式
- **過抽**：為每 3 行節創主題文件。僅當節超約 10-15 行方抽。小節內聯即可
- **忘 200 行限**：MEMORY.md 載入每系統提示。200 行後默截。若文件過此長，底內容事實不可見

## 相關技能

- `write-claude-md` — CLAUDE.md 捕項目指令；記憶捕跨會話學習
- `prune-agent-memory` — manage-memory 之反：審、分類，並擇性忘所存記憶
- `write-continue-here` — 寫結構化之續文件供會話交接；補記憶為短期上下文橋
- `read-continue-here` — 於會話始讀並行續文件；交接之消費側
- `create-skill` — 新技能或產值記憶之模式
- `heal` — 自癒或於整合步更記憶
- `meditate` — 冥想會話或顯值持之洞見
