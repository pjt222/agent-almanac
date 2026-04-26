---
name: manage-memory
locale: wenyan-ultra
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

維 Claude Code 之持記憶目以跨會話保精、簡、用。MEMORY.md 每對話載入系統提示——200 行後截——故此文件當為瘦索引指向題文件為細。

## 用

- MEMORY.md 近 200 行截閾
- 會話生值存之持見（新式、架決、調解）
- MEMORY.md 之題節 > 10-15 行當提
- 項態變（改名、新域、更計）→記憶或陳
- 啟新工區察相關記憶是否已存
- 會話間期維以保記憶目健

## 入

- **必**：記憶目訪（常 `~/.claude/projects/<project-path>/memory/`）
- **可**：具體觸（如「MEMORY.md 過長」「方畢大重構」）
- **可**：待加、更、或提之題

## 行

### 一：評當態

讀 MEMORY.md 並列記憶目諸文件：

```bash
wc -l <memory-dir>/MEMORY.md
ls -la <memory-dir>/
```

查行計對 200 行限。列現題文件。

得：總行、題文計、MEMORY.md 節之明圖。

敗：記憶目不存→造。MEMORY.md 不存→造最小版附 `# Project Memory` 頭與 `## Topic Files` 節。

### 二：識陳項

比記憶聲 vs 當項態。常陳式：

1. **計漂**：文計、技計、域計於增減後變
2. **改路**：移或改名之文件或目
3. **廢式**：修後無需之變通
4. **矛盾**：二項同題異言

以 Grep 點查關鍵聲：

```bash
# Example: verify a skill count claim
grep -c "^      - id:" skills/_registry.yml
# Example: verify a file still exists
ls path/claimed/in/memory.md
```

得：陳項列附當正值。

敗：不能驗聲（如引不可查之外態）→留而加 `(unverified)` 註非默存或誤信息。

### 三：決加何

新項寫前用此濾：

1. **持**：下會話仍真乎？避會話特脈（當任、行中工、臨態）
2. **非重**：CLAUDE.md 或項文已覆乎？勿重——記憶為他處未捕者
3. **驗**：跨交互證乎，或單察？單察→項文前驗
4. **可行**：知此改行乎？「天藍」無用。「退碼 5 為引誤——用臨文件」改汝工

例外：用者明請憶→即存，無需多證。

得：濾之可加項列，各合持+非重+驗+可行準。

敗：不確是否值留→偏於於 MEMORY.md 短留——易後修剪較重發現易。

### 四：提大題

MEMORY.md 節 ~10-15 行以上→提至專題文件：

1. 造 `<memory-dir>/<topic-name>.md` 附述頭
2. 移細容由 MEMORY.md 至題文件
3. MEMORY.md 中節換為 1-2 行總附鏈：

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Brief description of contents
```

題文件命約：
- 用小寫連字符：`viz-architecture.md`，非 `VizArchitecture.md`
- 按題非時命：`patterns.md`，非 `session-2024-12.md`
- 組相關項：合「R 調」與「WSL 怪」入 `patterns.md` 非各事一文件

得：MEMORY.md 於 200 行下。各題文件自含可無 MEMORY.md 脈讀。

敗：題文件 < 5 行→或不值提——留於 MEMORY.md 內。

### 五：更 MEMORY.md

施諸變：除陳項、加新項、更計、確 Topic Files 節列諸專文件。

MEMORY.md 結當循此式：

```markdown
# Project Memory

## Section 1 — High-level context
- Bullet points, concise

## Section 2 — Another topic
- Key facts only

## Topic Files
- [file.md](file.md) — What it covers
```

指：
- 各點 1-2 行最大
- 用內格（`code`、**bold**）為易掃
- 最常需脈於首
- Topic Files 節當恒末

得：MEMORY.md 於 200 行下、精、諸題文件之工鏈。

敗：提後仍 > 200 行→識最少用節並提。各節為候——即項結構覽亦可至題文件留 1 行總。

### 六：驗整

終查：

1. **行計**：證 MEMORY.md < 200 行
2. **鏈**：驗 MEMORY.md 引諸題文件存
3. **孤**：察 MEMORY.md 未引之題文件
4. **精**：點查 2-3 事聲 vs 項態

```bash
wc -l <memory-dir>/MEMORY.md
# Check for broken links
for f in $(grep -oP '\[.*?\]\(\K[^)]+' <memory-dir>/MEMORY.md); do
  ls <memory-dir>/$f 2>/dev/null || echo "BROKEN: $f"
done
# Check for orphan files
ls <memory-dir>/*.md | grep -v MEMORY.md
```

得：行計 < 200、無斷鏈、無孤文件、點查聲精。

敗：修斷鏈（更或除）。孤文件→或 MEMORY.md 加引或刪（若不相關）。

## 驗

- [ ] MEMORY.md < 200 行
- [ ] MEMORY.md 引諸題文件於盤存
- [ ] 記憶目無孤 `.md`（各文件由 MEMORY.md 鏈）
- [ ] 任記憶文件無陳計或改路
- [ ] 新項合持/非重/驗/可行準
- [ ] 題文件有述頭且自含
- [ ] MEMORY.md 讀為有用速參，非變錄

## 忌

- **記憶文件污**：諸會察皆寫記憶。多發現為會特而不需持。寫前用四濾（步三）
- **陳計**：更碼而未更記憶。計（技、代理、域、文件）默漂。必以真源驗計再信記憶
- **時排**：按「何時學」非「關於何」排。題排（`patterns.md`、`viz-architecture.md`）遠較日文件於取用
- **重 CLAUDE.md**：CLAUDE.md 為權威項指文件。記憶當捕 CLAUDE.md 外——調見、架決、流偏、跨項式
- **過提**：為各 3 行節造題文件。僅 ~10-15 行以上節提。小節於內良
- **忘 200 行限**：MEMORY.md 載入每系提。200 後默截。若過此→底容實不可見

## 參

- `write-claude-md` — CLAUDE.md 捕項指；記憶捕跨會學
- `prune-agent-memory` — manage-memory 之反：審、歸、擇忘
- `write-continue-here` — 寫結構繼續文件為會交；補記憶為短期脈橋
- `read-continue-here` — 會始讀並動繼續文件；交之消費側
- `create-skill` — 新技或生值憶式
- `heal` — 自癒或於整步更記憶
- `meditate` — 冥想會或出值持之見
