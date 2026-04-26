---
name: prune-agent-memory
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Audit, classify, and selectively forget stored memories. Covers memory
  enumeration and classification by type/age/access frequency, staleness
  detection for outdated references, fidelity checks using external anchors,
  a decision tree for selective deletion, preemptive filtering rules for what
  should never become memories, and an audit trail so forgetting itself is
  reviewable. Use when memory has grown large and uncurated, when project
  state has shifted significantly since memories were written, when retrieval
  quality has degraded, or as periodic maintenance alongside manage-memory.
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

# 修主憶

審、分、擇忘所存憶。憶為基。忘為策。此技定策。

`manage-memory` 聚於組與長憶（何留、何構），此技聚反：何棄、如何察衰、如何使忘為意非偶。二技互補、定期維時當共用。

## 用

- 憶檔大而無人察相關→用
- 案態大變（重構、庫易名、碑畢）、憶恐引舊境→用
- 取質衰——憶生噪非號→用
- 一陣動生多憶項而無理→用
- 排定維任（如每 10-20 會或案碑時）→用
- 多憶項涵同題含小異（重複漂）→用
- 接新合作前承憶境→用

## 入

- **必**：憶目徑（常 `~/.claude/projects/<project-path>/memory/`）
- **可**：留策覆（如「皆留布署」「激修除錯注」）
- **可**：末察以來知案變（如「庫易名」「自 Jest 遷至 Vitest」）
- **可**：前修審跡為勢析

## 行

### 一：枚並分憶

讀諸憶檔、各項按四維分。

```bash
# Inventory the memory directory
ls -la <memory-dir>/
wc -l <memory-dir>/*.md

# Count total entries (approximate by counting top-level bullets and headers)
grep -c "^- \|^## " <memory-dir>/MEMORY.md
for f in <memory-dir>/*.md; do echo "$f: $(grep -c '^- \|^## ' "$f") entries"; done
```

各憶項分為下型之一：

| Type | Description | Example | Default retention |
|------|-------------|---------|-------------------|
| **Project** | Facts about project structure, architecture, conventions | "skills/ has 310 SKILL.md files across 55 domains" | Keep until verified stale |
| **Decision** | Choices made and their rationale | "Chose hub-and-spoke over sequential for review teams because..." | Keep indefinitely |
| **Pattern** | Debugging solutions, workflow insights, recurring behaviors | "Exit code 5 means quoting error — use temp files" | Keep until superseded |
| **Reference** | Links, version numbers, external resources | "mcptools docs: https://..." | Keep until verified stale |
| **Feedback** | User preferences, corrections, style guidance | "User prefers kebab-case for file names" | Keep indefinitely |
| **Ephemeral** | Session-specific context that leaked into persistent memory | "Currently working on issue #42" | Prune immediately |

各項亦注：
- **齡**：何時書或末更？
- **取頻**：此項於近會用乎？（按題對近工之關估）

得：完錄含每憶項按型分、含齡與取頻估。Ephemeral 項已標即除。

敗：憶檔過大或無構不可逐項分→於段級行。分全段非各項。標為覆、非粒。

### 二：察舊

對今案態比憶述。舊為憶衰之最常式。

察下舊式：

1. **數漂**：檔、技、主、域、團數變
2. **徑漂**：移、易名、除之檔、目、URL
3. **態漂**：態（解事、畢碑、合 PR）仍述為開或進中
4. **決反**：後覆而原由仍於憶
5. **具/版漂**：版、API 簽、具名變（如包易名）

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

各舊項標其舊型與今正值。

得：舊項列含特變據。各舊項薦行：更（若知正值）、驗（若不確）、修（若全項已廢）。

敗：因外態（API、三方文、布署態）而不能驗→標為 `unverifiable` 勿假其正。未驗項為修候若無活用。

### 三：行誠檢

試憶取時否仍生用境。此最難——主不能驗己縮憶之誠——需外錨。

誠檢法：

1. **往返驗**：讀憶項、後察其述之實案態。憶引至正檔、正式、正結乎？

2. **縮失察**：憶撮對原源比。50 行討縮為 2 行憶、縮保行洞乎抑只題標？

   ```bash
   # Find the source that a memory entry was derived from
   # (git log, old PRs, original files)
   git log --oneline --all --grep="<keyword from memory entry>" | head -5
   ```

3. **矛盾掃**：搜憶相矛或矛 CLAUDE.md/案文。

   ```bash
   # Look for potential contradictions in counts
   grep -n "total" <memory-dir>/MEMORY.md
   grep -n "total" CLAUDE.md
   # Compare the values — they should agree
   ```

4. **用試**：各憶項問：「此項除、後 5 會何錯？」答「恐無」→項誠值低即正。

得：各憶項今有誠評：**高**（驗準用）、**中**（恐準偶用）、**低**（未驗或罕用）、**敗**（驗誤或矛）。

敗：諸項誠檢不決→聚最高效項。誤憶於案架險於誤憶於除錯。骨級實察先於肉級細。

### 四：施擇除

用此決樹按序定何修：

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

各除、記項、其分、除由（用於步六）。

得：明列除項、更項、留項——各含記由。留/除比依憶健；善養者修 5-10%、忽者修 30-50%。

敗：諸項決樹模→緊濾：「今知所知、今書此項乎？」否→修候。傾修——重學實易於繞誤憶。

### 五：施前濾

定「何不存」則防未來憶污。察現憶為書時當濾之式。

**永不**為持憶之式：

| Pattern | Why | Example |
|---------|-----|---------|
| Session-specific task state | Stale by next session | "Currently debugging issue #42" |
| Intermediate reasoning | Not a conclusion | "Tried approach A, didn't work because..." |
| Debug output / stack traces | Ephemeral diagnostic data | "Error was: TypeError at line 234..." |
| Exact command sequences | Brittle, version-dependent | "Run `npm install foo@3.2.1 && ...`" |
| Emotional/tonal notes | Not actionable | "User seemed frustrated" |
| Duplicates of CLAUDE.md | Already in system prompt | "Project uses renv for dependencies" |
| Unverified single observations | May be wrong | "I think the API rate limit is 100/min" |

現憶有此式者→加於步四除列。

濾則記於 MEMORY.md 或 `retention-policy.md` 題檔以使未會於書新憶前察。

得：憶目記之前濾則。現項合此式者標除。

敗：記濾則似早（憶小、污少）→略記而仍施濾以捉現違。則可後形於憶目熟時。

### 六：書審跡

各除錄使忘可察。立或更修誌。

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

修誌簡。為責、非考古。誌大→撮老項：「2025：3 審、47 項修（多數漂與 ephemeral 漏）」。

得：時印之修誌項記何除何由。誌存於憶目與憶共。

敗：分檔似過（唯 1-2 項修）→於 MEMORY.md 加短注：`<!-- Last pruned: YYYY-MM-DD, removed 2 stale entries -->`。任記優於默除。

### 七：定護憶

某憶項當免修不論齡、頻、誠分。為失即需大力重構之不可代境。

**護憶則**：

| Category | Examples | Why protected |
|----------|----------|---------------|
| Architecture decisions | "Chose flat skill directory over nested" | Rationale is lost if re-derived later |
| User identity preferences | "Always use kebab-case," "Never auto-commit" | Explicit user intent, not inferrable |
| Security audit results | "Last audit: 2025-12-13 — PASSED" | Compliance evidence with timestamps |
| Rename/migration records | "Repo renamed: X to Y on date Z" | Cross-reference integrity depends on this |

**標法**：護項以 `<!-- PROTECTED -->` 內標或於修誌持 `protected` 列。步四決樹必先察護態乃施除則。

**解護**：修護項→先明除標、於修誌記由。二步防偶除高值憶。

得：護項過諸修。修誌記任護加除。

敗：護集過大（>總 30%）→察則——護為不可代境、非「重」項。重而可重立之實當受常修。

### 八：修後重合

除後餘憶恐碎——交引指除項、題檔失連、MEMORY.md 有缺。重合復構整。

**重合清單**：

1. **解破引**：掃餘項為連除容。除或轉引
2. **合相片**：修留二項涵同題之疊面→合為一連項
3. **更題檔構**：題檔失 >50% 容→計餘折回 MEMORY.md 而除題檔
4. **分冷憶**：察過修而近未取項：
   - **冷由不用**：題合活案標而生其之段已過。留——其段重時恐重相關（如活開時 CRAN 提注）
   - **冷由不關**：題本邊——一時驗、旁查、覆徑。次修週標除
5. **驗 MEMORY.md 連**：上下讀 MEMORY.md。當述案連故事、非為亂實集

得：修後憶構固——無孤引、無冗片、無不連題檔。冷項分為未來修決。

敗：重合顯修過激（要境失）→察修誌、自審跡重立。此為審跡所以存。

### 九：自憶漂復

憶漂於存實默誤——非始誤、實底變而憶未更。漂復試就地修憶非修除。

**漂察觸**：

- 憶述矛今具出或檔容
- 憶中數或版號不合錄或鎖檔
- 憶中徑返「檔未見」
- 依憶引易名或棄包

**復程**：

1. **識漂**：憶述對今地實（git log、錄、實檔）比
2. **評可復**：今案態可定正值乎？
   - 是→就地更憶含今值與 `[corrected YYYY-MM-DD]` 注
   - 否→標 `unverifiable` 而標修
3. **追因**：為漸漂（數緩異）或離散事（易名、遷）？離散事常影多項——掃同伴
4. **防再**：漂影常變值（數、版）→計憶當追值乎抑引源實：「見 skills/_registry.yml 為今數」非「317 技」

得：漂憶可則就地修保境。不可修者標修。防則減未來漂。

敗：漂廣（>20%）→憶恐需全重立非漸修。則檔當前憶目、自始、擇重入過驗者。

## 驗

- [ ] 諸憶檔錄、項按型分
- [ ] 對今案態行舊察
- [ ] 至少一誠檢法施（往返、縮失、矛掃、用試）
- [ ] 除決循決樹序
- [ ] 無項無記由而除
- [ ] 前濾則記或施
- [ ] 修誌記何除、何時、何由
- [ ] 修後 MEMORY.md 仍 <200 行
- [ ] 餘憶準（對案態點察）
- [ ] 修 MEMORY.md 引未生孤題檔
- [ ] 護項標而過諸修
- [ ] 修後重合解破交引並合片
- [ ] 冷項分為不用對不關為未來修決
- [ ] 漂項可則就地修、非僅除

## 忌

- **不驗而修**：因「似舊」除而不察其準否與用否。齡單非除則——某最寶憶為老架決仍真
- **自驗誠**：主讀己縮憶結「是、似正」非誠檢。誠需外錨：案檔、git 史、錄數、實具出。無錨則察一致非準
- **激修無審跡**：除而不錄何除。未會需修除實時、審跡述何發、可含足境重立憶
- **修決為憶**：勿書「我決修 X 由 Y」為常憶項。此唯入修誌。憶管之憶為元污
- **忽前濾**：修現項而不立則防同式再。無濾則後 10 會將重立汝甫除之同 ephemeral
- **諸型同處**：決憶與饋憶幾不當修——其表用意與由。案與引為主修標、其追變態
- **混縮為壞**：撮繁題為一行之憶為縮非壞。唯標為誠敗於縮失行洞、非但細
- **過釘**：標多項為護敗修旨。>30% 護則則寬。護不可代境、非僅重實
- **重合圈**：重合中合片可立新項其需次週修。少合——僅合明涵同題者。修中勿合新洞

## 參

- `manage-memory` — 組與長憶之補技；共用為全憶維
- `meditate` — 清接地可顯何憶生噪
- `rest` — 有時最佳憶維為不維
- `assess-context` — 推境健察、憶質直影
