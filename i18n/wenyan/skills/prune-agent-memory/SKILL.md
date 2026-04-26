---
name: prune-agent-memory
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  審、分、擇之忘儲憶。含憶之列與依型/齡/取頻分、識陳訊之朽、以外錨行真實察、
  選刪之決樹、防未來憶污染之先濾規、忘本身可審之留跡。
  憶長大未理、項狀自憶書時已大變、取質衰、或為與 manage-memory 並之定期維時用之。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, pruning, forgetting, retention-policy, maintenance, auto-memory
---

# 修剪劑之憶

審、分、擇之忘儲憶。憶為基設。忘為策。此技定策。

`manage-memory` 焦於組織與長憶（何留、如何結構），此技焦於反：何棄、如何測朽、如何確忘為刻意非偶然。二技互補，定期維時當共用。

## 用時

- 憶文已長大而無人審其關
- 項狀已大變（大重構、庫重命、里程碑畢）而憶或引陳脈
- 取質衰——憶生噪非訊
- 突發後生多憶條而未理
- 排定維任（如每 10-20 會或項里程碑）
- 多憶條涵同題附微異（重複漂）
- 將承憶脈之新協者前

## 入

- **必要**：憶目之徑（常 `~/.claude/projects/<project-path>/memory/`)
- **可選**：留策覆（如「諸關部署皆留」、「激修除錯注」）
- **可選**：上審以來知之項狀變（如「庫已重命」、「自 Jest 遷至 Vitest」）
- **可選**：往修剪審跡為趨析

## 法

### 第一步：列並分憶

讀諸憶文並各條依四維分。

```bash
# Inventory the memory directory
ls -la <memory-dir>/
wc -l <memory-dir>/*.md

# Count total entries (approximate by counting top-level bullets and headers)
grep -c "^- \|^## " <memory-dir>/MEMORY.md
for f in <memory-dir>/*.md; do echo "$f: $(grep -c '^- \|^## ' "$f") entries"; done
```

各憶條分為下型之一：

| Type | Description | Example | Default retention |
|------|-------------|---------|-------------------|
| **Project** | Facts about project structure, architecture, conventions | "skills/ has 310 SKILL.md files across 55 domains" | Keep until verified stale |
| **Decision** | Choices made and their rationale | "Chose hub-and-spoke over sequential for review teams because..." | Keep indefinitely |
| **Pattern** | Debugging solutions, workflow insights, recurring behaviors | "Exit code 5 means quoting error — use temp files" | Keep until superseded |
| **Reference** | Links, version numbers, external resources | "mcptools docs: https://..." | Keep until verified stale |
| **Feedback** | User preferences, corrections, style guidance | "User prefers kebab-case for file names" | Keep indefinitely |
| **Ephemeral** | Session-specific context that leaked into persistent memory | "Currently working on issue #42" | Prune immediately |

各條另注：
- **齡**：何時書或末更？
- **取頻**：此條於近會有用乎？（依題與近作之關估之）

得：完之列，每憶條皆依型、齡、取頻分。瞬條已標待即除。

敗則：若憶文過大或不結構不能逐條分，於節級行。分整節非個別點。目為涵，非粒。

### 第二步：測朽

對當前項狀比憶聲。朽為憶衰之最常形。

察此朽之模：

1. **計漂**：文、技能、劑、域、隊員之計變
2. **徑漂**：移、重命、刪之文、目、URL
3. **狀漂**：仍述為開或進中之狀（解之議、畢之里程、合之 PR）
4. **決反**：後被覆然原因仍於憶之決
5. **具/版漂**：版號、API 簽、具名變（如包重命）

```bash
# Spot-check counts against source of truth
grep -oP '\d+ skills' <memory-dir>/MEMORY.md
grep -c "^      - id:" skills/_registry.yml

# Check for references to files that no longer exist
grep -oP '`[^`]+\.(md|yml|R|js|ts)`' <memory-dir>/MEMORY.md | sort -u | while read f; do
  path="${f//\`/}"
  [ ! -f "$path" ] && echo "STALE: $path referenced but not found"
done

# Check for references to old names/paths
grep -i "old-name\|previous-name\|renamed-from" <memory-dir>/*.md
```

各陳條以朽之型與當前正值標。

得：附特定變證之陳條列。各陳條附建動：更（若知正值）、驗（若不確）、修（若全條已廢）。

敗則：若不能驗某聲因引外狀（API、第三方文、部署狀），標為 `unverifiable` 而非假其正。未驗條若非積極有用為修候。

### 第三步：行真實察

試憶於取時是否仍生有用脈。此為最難步因劑不能驗其自之壓憶是否忠——需外錨。

真實察法：

1. **往返驗**：讀一憶條，後察其述之實項狀。憶導汝至正文、正模、正結乎？

2. **壓損測**：對原源料比憶要。50 行論壓為 2 行憶時，壓保可行洞察或唯題標？

   ```bash
   # Find the source that a memory entry was derived from
   # (git log, old PRs, original files)
   git log --oneline --all --grep="<keyword from memory entry>" | head -5
   ```

3. **矛盾掃**：搜互矛或與 CLAUDE.md / 項文矛之憶。

   ```bash
   # Look for potential contradictions in counts
   grep -n "total" <memory-dir>/MEMORY.md
   grep -n "total" CLAUDE.md
   # Compare the values — they should agree
   ```

4. **效用試**：對各憶條問：「若此條刪，下 5 會何誤？」若答「或無」，此條真值低不論其準。

得：諸憶條今有真實評：**高**（驗準且有用）、**中**（或準、偶有用）、**低**（未驗或罕用）、**敗**（驗不準或矛）。

敗則：若多條真實察不決，焦於最高潛影響之條。誤項架憶險於誤除錯訣憶。優察骨級事勝肉級細。

### 第四步：施擇刪

依優先序用此決樹定何修：

```
Pruning Decision Tree (apply in order):

1. EPHEMERAL entries (Step 1 classification)
   → Delete immediately. These should never have been persisted.

2. FAILED fidelity entries (Step 3)
   → Delete immediately. Inaccurate memories are worse than no memories.

3. DUPLICATES
   → Keep the most complete/accurate version, delete others.
   → If duplicates span MEMORY.md and a topic file, keep the topic file version.

4. STALE entries with known corrections (Step 2)
   → UPDATE if the entry is otherwise useful (change the stale value to current).
   → DELETE if the entire entry is obsolete (the topic no longer matters).

5. LOW fidelity, low access frequency entries
   → Delete. These are taking space without providing value.

6. MEDIUM fidelity entries about completed/closed work
   → Archive or delete. Past sprint details, resolved incidents, merged PRs.
   → Exception: keep if the resolution contains a reusable pattern.

7. REFERENCE entries with freely available sources
   → Delete if the reference is a Google search away.
   → Keep if the reference is hard to find or has project-specific context.
```

各刪皆記條、其分、刪因（用於第六步）。

得：明列：欲刪、欲更、欲留之條——各附記之因。留/刪之比依憶健；維良憶或修 5-10%，棄者或修 30-50%。

敗則：若決樹於多條生模糊果，施緊濾：「今知所知，今日仍書此條乎？」若否，為刪候。傾向修——重學一事易於繞誤憶。

### 第五步：施先濾

定「何不存」之規以防未來憶污。察既憶尋當寫時應濾之模。

**永不**當為持久憶之模：

| Pattern | Why | Example |
|---------|-----|---------|
| Session-specific task state | Stale by next session | "Currently debugging issue #42" |
| Intermediate reasoning | Not a conclusion | "Tried approach A, didn't work because..." |
| Debug output / stack traces | Ephemeral diagnostic data | "Error was: TypeError at line 234..." |
| Exact command sequences | Brittle, version-dependent | "Run `npm install foo@3.2.1 && ...`" |
| Emotional/tonal notes | Not actionable | "User seemed frustrated" |
| Duplicates of CLAUDE.md | Already in system prompt | "Project uses renv for dependencies" |
| Unverified single observations | May be wrong | "I think the API rate limit is 100/min" |

若既憶有此模，加之第四步刪列。

記濾規於 MEMORY.md 或 `retention-policy.md` 題文，未來會於書新憶前可參。

得：記於憶目之先濾規集。任既條合此模者標待刪。

敗則：若記濾規覺早（憶小、污微），略記而仍施濾以捕既違。規後可正規化，憶目較熟時。

### 第六步：書審跡

記每刪以使忘本身可審。立或更修剪記。

```markdown
<!-- In <memory-dir>/pruning-log.md or appended to MEMORY.md -->

## Pruning Log

### YYYY-MM-DD Audit
- **Entries audited**: N
- **Entries pruned**: M (X%)
- **Entries updated**: K
- **Staleness found**: [list of stale patterns detected]
- **Fidelity failures**: [list of entries that failed verification]

#### Deletions
| Entry (summary) | Type | Reason |
|-----------------|------|--------|
| "Currently working on issue #42" | Ephemeral | Session-specific, stale |
| "skills/ has 280 SKILL.md files" | Project | Count drift: actual is 310 |
| "Use acquaint::mcp_session()" | Pattern | Package renamed to mcptools |
```

修剪記簡。為責，非考古。若記自長大，要早條：「2025：3 審、47 總條修（多計漂與瞬漏）」。

得：時戳修剪記條，記何刪何因。記存於憶目，與憶同處。

敗則：若立分文覺過（唯 1-2 條修），加簡注於 MEMORY.md：`<!-- Last pruned: YYYY-MM-DD, removed 2 stale entries -->`。任記勝默刪。

### 第七步：指護憶

某憶條當免於修，不論齡、取頻、真實分。其代不可替之脈，若失需大力以重立。

**護憶之準**：

| Category | Examples | Why protected |
|----------|----------|---------------|
| Architecture decisions | "Chose flat skill directory over nested" | Rationale is lost if re-derived later |
| User identity preferences | "Always use kebab-case," "Never auto-commit" | Explicit user intent, not inferrable |
| Security audit results | "Last audit: 2025-12-13 — PASSED" | Compliance evidence with timestamps |
| Rename/migration records | "Repo renamed: X to Y on date Z" | Cross-reference integrity depends on this |

**指法**：護條內聯標 `<!-- PROTECTED -->` 或於修剪記維 `protected` 列。第四步決樹必於施任刪規前察護狀。

**解護**：欲修護條，先顯去指並於修剪記記因。此二步程防偶刪高值憶。

得：護條過諸修。修剪記記任護加減。

敗則：若護集過大（>30% 總條），察準——護為不可替脈，非「要」條。要而可重立之事仍當受常修。

### 第八步：修後重綜

刪後，餘憶或碎——交叉引指刪條、題文失連貫、MEMORY.md 或有缺。重綜復結構完整。

**重綜清單**：

1. **解破引**：掃餘條為刪內容之連結。去或重指引。
2. **合相關碎**：若修留二條涵同題重疊面，合為一連貫條。
3. **更題文構**：若題文失 >50% 內容，考折餘入 MEMORY.md 並刪題文。
4. **分冷憶**：察過修而近未取之條：
   - **冷自不用**：題合活項目然生其特相已過。留——其相再活時或再相關（如活開發中之 CRAN 提交注）
   - **冷自不關**：題始終邊緣——一次實驗、旁查、被覆之法。標下修週期中刪
5. **驗 MEMORY.md 連貫**：自頂至底讀 MEMORY.md。其當述項之連貫故事，非讀為事之隨集。

得：修後憶結構穩——無孤引、無冗碎、無不連貫題文。冷條為未來修決而分。

敗則：若重綜揭修過激（要脈失），察修剪記並自審跡重立。此乃審跡存之因。

### 第九步：自憶漂復

憶漂發於儲事默靜變誤——非始終誤，乃底實已變而憶未更。漂復試於原處修憶非修。

**漂測觸**：

- 憶聲與當具出或文容相違
- 憶中之計或版號不合註冊或鎖文
- 憶中徑返「文不在」
- 關依之憶引重命或棄之包

**復程序**：

1. **識漂**：對當地真比憶聲（git log、註冊、實文）
2. **評可復**：正值能自當前項狀定乎？
   - 是 → 原處更憶條附當值與 `[corrected YYYY-MM-DD]` 注
   - 否 → 標條為 `unverifiable` 並標待修
3. **追因**：此為漸漂（計緩偏）或離散事（重命、遷）？離散事常影多條——尋兄弟。
4. **防再**：若漂影頻變值（計、版），考憶當追值或代引真源：「見 skills/_registry.yml 為當前計」勝「317 技」。

得：漂憶可時於原處修，保脈。不能修者標待修。防規減未來漂。

敗則：若漂廣（>20% 條），憶或需全重建非漸修。爾時，存當前憶目、自零始、選擇重入過驗之條。

## 驗

- [ ] 諸憶文已列且諸條依型分
- [ ] 對當項狀行朽察
- [ ] 至少一真實察法已施（往返、壓損、矛盾掃、效用試）
- [ ] 刪決循決樹之優序
- [ ] 無條無記因而刪
- [ ] 先濾規已記或施
- [ ] 修剪記記何刪、何時、何因
- [ ] 修後 MEMORY.md 仍 < 200 行
- [ ] 餘憶準（對項狀點察）
- [ ] 自 MEMORY.md 修引未生孤題文
- [ ] 護條已指並過諸修
- [ ] 修後重綜解破交叉引並合碎
- [ ] 冷條為未來修決而分為不用對不關
- [ ] 漂條可時於原處修，非僅刪

## 陷

- **不驗而修**：因條「似舊」而刪而不察其是否仍準與有用。齡單非刪準——某些最值之憶為仍真之老架構決。
- **自驗真實**：劑讀其自壓憶並結「是、似正」非真實察。真實需外錨：項文、git 史、註冊計、實具出。無錨，汝察一致非準。
- **激修無審跡**：刪條而不記何刪。當未來會需修之事，審跡釋何發生並或含足脈以重立憶。
- **修決為憶**：勿書「決修 X 因 Y」為常憶條。其唯入修剪記。關於憶管之憶條為元污染。
- **忽先濾**：修既條而不立規以防同模再發。無濾，下 10 會將再造汝剛刪之同瞬條。
- **諸型同視**：決憶與反饋憶幾不當修——其代用者意與因。項與引憶為主修目，其追變之狀。
- **混壓與壞**：要題以一行壓之憶為壓非壞。唯標為真實敗若壓失可行洞察非僅細。
- **過釘**：標過多條為護敗修之目。若 >30% 條為護，準過鬆。護不可替脈，非僅要事。
- **重綜環**：重綜時合碎或生新條本身需下週修。合最少——唯合明涵同題者。修中勿綜新洞察。

## 參

- `manage-memory` — 組織與長憶之互補技；共用為完整憶維
- `meditate` — 清與接地或揭何憶生噪
- `rest` — 有時最佳憶維為不行憶維
- `assess-context` — 評推脈絡之健，憶質直影之
