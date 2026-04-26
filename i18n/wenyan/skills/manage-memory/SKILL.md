---
name: manage-memory
locale: wenyan
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

護 Claude Code 持記之目，令其精、簡、跨會有益。MEMORY.md 每對話皆載入系統提示——200 行後截，故此檔須為指向題檔之瘦索引。

## 用時

- MEMORY.md 近 200 行截閾
- 會生值保之久見（新型、架決、除錯解）
- MEMORY.md 中節逾 10-15 行，宜取之
- 項目態變（檔重名、新域、計更）而記條或陳
- 啟新工域，察相關記是否已存
- 會間定期之養以保記目健

## 入

- **必要**：記目之訪（常為 `~/.claude/projects/<project-path>/memory/`）
- **可選**：具體觸（如「MEMORY.md 過長」、「剛畢大重構」）
- **可選**：待加、更、或取之題

## 法

### 第一步：察當前態

讀 MEMORY.md 並列記目諸檔：

```bash
wc -l <memory-dir>/MEMORY.md
ls -la <memory-dir>/
```

比行數於 200 行之限。清既題檔。

**得：**總行、題檔數、MEMORY.md 中何節存之清圖。

**敗則：**若記目不存，建之。若 MEMORY.md 不存，以 `# Project Memory` 頭與 `## Topic Files` 節建微者。

### 第二步：辨陳條

比記之言於當前項目態。常陳之型：

1. **計漂**：加除後變之檔計、技計、域計
2. **重名路**：已移或重名之檔或目
3. **超之型**：修後不需之繞法
4. **矛盾**：同題二條相悖

以 Grep 抽察關鍵言：

```bash
# Example: verify a skill count claim
grep -c "^      - id:" skills/_registry.yml
# Example: verify a file still exists
ls path/claimed/in/memory.md
```

**得：**陳條之列，附當前正值。

**敗則：**若言不可驗（如參不可察之外態），留之而加 `(unverified)` 註，勿靜留或誤之息。

### 第三步：決何加

為新條，書前施此諸濾：

1. **久**：次會此將真乎？避會專之脈絡（當任、進行中之工、暫態）
2. **不重**：CLAUDE.md 或項目文已覆此乎？勿重——記為他處未捕者
3. **已驗**：此已於多互證乎，或為單察？單察者，書前驗於項目文
4. **可行**：知此改行乎？「天藍」無益。「退碼 5 意引之誤——用暫檔」改汝工法

例外：若用者明求記，即存之——無需候多證。

**得：**濾後值加之條列，每符久／不重／已驗／可行之準。

**敗則：**若不確條是否值留，寧短留於 MEMORY.md——剪較重發為易。

### 第四步：取過大題

MEMORY.md 中節逾 ~10-15 行者，取至專題檔：

1. 建 `<memory-dir>/<topic-name>.md` 具述之頭
2. 移細內容自 MEMORY.md 至題檔
3. 以 1-2 行總與連替 MEMORY.md 中之節：

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Brief description of contents
```

題檔之命名慣：
- 用小寫之 kebab-case：`viz-architecture.md`，非 `VizArchitecture.md`
- 依題而命，非依時：`patterns.md`，非 `session-2024-12.md`
- 聚相關：合「R 除錯」與「WSL 奇」於 `patterns.md`，勿每事一檔

**得：**MEMORY.md 持於 200 行下。每題檔自足，無需 MEMORY.md 脈絡可讀。

**敗則：**若題檔少於 5 行，或不值取——留於 MEMORY.md 內。

### 第五步：更 MEMORY.md

施諸變：除陳條、加新條、更計、確 Topic Files 節列諸專檔。

MEMORY.md 之結構當循此式：

```markdown
# Project Memory

## Section 1 — High-level context
- Bullet points, concise

## Section 2 — Another topic
- Key facts only

## Topic Files
- [file.md](file.md) — What it covers
```

則：
- 每點至多 1-2 行
- 以行內格式（`code`、**bold**）便掃
- 最常需之脈絡先
- Topic Files 節恆末

**得：**MEMORY.md 於 200 行下，精，並具通連至諸題檔。

**敗則：**取後仍不下 200 行，辨最少用之節而取之。諸節皆可——即項目結構之概亦可至題檔，留 1 行之總。

### 第六步：驗整

行終察：

1. **行計**：確 MEMORY.md 下 200 行
2. **連**：驗 MEMORY.md 所參諸題檔存
3. **孤**：察 MEMORY.md 未參之題檔
4. **精**：抽察 2-3 事實言於項目態

```bash
wc -l <memory-dir>/MEMORY.md
# Check for broken links
for f in $(grep -oP '\[.*?\]\(\K[^)]+' <memory-dir>/MEMORY.md); do
  ls <memory-dir>/$f 2>/dev/null || echo "BROKEN: $f"
done
# Check for orphan files
ls <memory-dir>/*.md | grep -v MEMORY.md
```

**得：**行計下 200，無斷連，無孤檔，抽察之言精。

**敗則：**修斷連（更或除）。孤檔者，或於 MEMORY.md 加參，或若不復相關則刪之。

## 驗

- [ ] MEMORY.md 於 200 行下
- [ ] MEMORY.md 中諸題檔皆存於盤
- [ ] 記目中無孤 `.md` 檔（每檔於 MEMORY.md 皆有連）
- [ ] 諸記檔無陳計或重名路
- [ ] 新條符久／不重／已驗／可行之準
- [ ] 題檔具述頭而自足
- [ ] MEMORY.md 讀為益之速參，非變誌

## 陷

- **記檔污**：每會察皆書於記。多發現會專而不需久留。書前施四濾（第三步）
- **陳計**：更碼而未更記。計（技、代理、域、檔）靜漂。信記前恆驗計於真源
- **時序組**：依「何時學」組，勿依「於何」。題式組（`patterns.md`、`viz-architecture.md`）較時式檔為益取
- **重 CLAUDE.md**：CLAUDE.md 為項目指令之權檔。記當捕 CLAUDE.md 未含者——除錯見、架決、工作流好、跨項目型
- **過取**：為每 3 行節建題檔。唯節逾 ~10-15 行乃取。小節於內佳
- **忘 200 行之限**：MEMORY.md 每系統提示皆載。200 行後靜截。若檔逾此，底容實不見

## 參

- `write-claude-md` — CLAUDE.md 捕項目指令；記捕跨會之學
- `prune-agent-memory` — manage-memory 之反：審、類、擇忘之記
- `write-continue-here` — 為會交接書結構續檔；為短期脈絡橋以補記
- `read-continue-here` — 會啟時讀並行續檔；交接之受側
- `create-skill` — 新技或生值記之型
- `heal` — 自愈或於合步更記
- `meditate` — 冥思會或現值久之見
