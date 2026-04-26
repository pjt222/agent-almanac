---
name: prune-agent-memory
locale: wenyan-lite
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

# 修剪代理記憶

稽核、分類並擇要遺忘所存之記憶。記憶為基礎設施，遺忘為政策。本技能即定該政策。

`manage-memory` 聚焦於組織與生長記憶（留何、如何結構化），本技能聚焦於其反面：捨何、如何偵衰、並使遺忘為刻意而非意外。二者互補，宜於定期維護中並用。

## 適用時機

- 記憶檔已龐大且無人稽核其相關性
- 專案狀態已顯著推移（重大重構、改名倉庫、完成里程碑），記憶恐指向過時脈絡
- 取回品質下降——記憶產出雜訊而非訊號
- 一陣活動產生大量未經整理之記憶條目後
- 作為排程之維護任務（如每 10-20 個會話或於專案里程碑）
- 多筆記憶覆蓋同一主題且略有出入（重複漂移）
- 將為新協作者引入記憶脈絡之前

## 輸入

- **必要**：記憶目錄之路徑（通常為 `~/.claude/projects/<project-path>/memory/`）
- **選擇性**：保留政策之覆寫（如「保留所有部署相關」、「積極修剪除錯註」）
- **選擇性**：自上次稽核以來已知之專案狀態變動（如「倉庫已改名」、「自 Jest 遷至 Vitest」）
- **選擇性**：先前修剪稽核軌跡，供趨勢分析

## 步驟

### 步驟一：列舉並分類記憶

讀全部記憶檔，並依四維分類每條目。

```bash
# Inventory the memory directory
ls -la <memory-dir>/
wc -l <memory-dir>/*.md

# Count total entries (approximate by counting top-level bullets and headers)
grep -c "^- \|^## " <memory-dir>/MEMORY.md
for f in <memory-dir>/*.md; do echo "$f: $(grep -c '^- \|^## ' "$f") entries"; done
```

將每一記憶條目歸為下列類型之一：

| Type | Description | Example | Default retention |
|------|-------------|---------|-------------------|
| **Project** | Facts about project structure, architecture, conventions | "skills/ has 310 SKILL.md files across 55 domains" | Keep until verified stale |
| **Decision** | Choices made and their rationale | "Chose hub-and-spoke over sequential for review teams because..." | Keep indefinitely |
| **Pattern** | Debugging solutions, workflow insights, recurring behaviors | "Exit code 5 means quoting error — use temp files" | Keep until superseded |
| **Reference** | Links, version numbers, external resources | "mcptools docs: https://..." | Keep until verified stale |
| **Feedback** | User preferences, corrections, style guidance | "User prefers kebab-case for file names" | Keep indefinitely |
| **Ephemeral** | Session-specific context that leaked into persistent memory | "Currently working on issue #42" | Prune immediately |

亦記每條目之：
- **年齡**：何時所寫或末次更新？
- **存取頻率**：近期會話中是否有用？（依與近期工作之主題相關性估）

**預期：** 一份完整盤點，每條目皆已分類且附年齡與存取頻率估。Ephemeral 條目已標為立即移除。

**失敗時：** 若記憶檔過大或缺結構難以逐條分類，於章節層次作之。將整節分類，而非逐項。目標為涵蓋，非粒度。

### 步驟二：偵測陳舊

將記憶主張與當前專案狀態相較。陳舊為記憶衰退之最常型。

檢下列陳舊模式：

1. **計數漂移**：檔案、技能、代理、領域、團隊成員之計數已變
2. **路徑漂移**：檔案、目錄或 URL 已搬、改名或刪除
3. **狀態漂移**：狀態（已解之 issue、已完之里程碑、已關之 PR）仍被描述為開或進行中
4. **決策反轉**：決策後被推翻，惟原理由仍存於記憶
5. **工具／版本漂移**：版本號、API 簽名或工具名已變（如套件改名）

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

對每一陳舊條目註其陳舊類型與當前正確值。

**預期：** 一份陳舊條目清單，附具體之變動證據。每條皆有建議行動：更新（若知正確值）、驗證（若不確）、修剪（若整條已過時）。

**失敗時：** 若無法驗證某主張因其涉外部狀態（API、第三方文件、部署狀態），標為 `unverifiable`，勿假定其為正。Unverifiable 條目若非積極有用，即修剪候選。

### 步驟三：執行擬真度檢查

測試記憶被取回時是否仍能產出有用脈絡。此為最難之步，因代理無法驗證自身壓縮記憶之忠實性——須藉外部錨。

擬真度檢查之法：

1. **往返驗證**：讀一記憶條目，再檢其所述之專案實際狀態。記憶能否引你至正確之檔案、模式、結論？

2. **壓縮失真偵測**：將記憶摘要與原始來源相較。當 50 行討論被壓為 2 行記憶時，壓縮是否保留可行動之洞見，抑或僅留主題標籤？

   ```bash
   # Find the source that a memory entry was derived from
   # (git log, old PRs, original files)
   git log --oneline --all --grep="<keyword from memory entry>" | head -5
   ```

3. **矛盾掃描**：搜互相矛盾之記憶或與 CLAUDE.md／專案文件矛盾者。

   ```bash
   # Look for potential contradictions in counts
   grep -n "total" <memory-dir>/MEMORY.md
   grep -n "total" CLAUDE.md
   # Compare the values — they should agree
   ```

4. **效用測試**：對每條目問：「若此條被刪，未來 5 個會話中是否會出錯？」答若「大概不會」，即為低擬真度價值，無論其準確與否。

**預期：** 每記憶條目皆有擬真度評估：**高**（已驗為準且有用）、**中**（大概準、偶有用）、**低**（未驗或鮮有用）、**失**（已驗為不準或矛盾）。

**失敗時：** 若多條之擬真度檢查無定論，聚焦於潛在影響最大之條目。錯誤之專案架構記憶比錯誤之除錯訣竅危險。先檢骨架級事實，後檢細節。

### 步驟四：施擇要刪除

依下列決策樹定何者修剪，依優先序套：

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

對每一刪除，記其條目、分類與刪除理由（用於步驟六）。

**預期：** 一份明確之擬刪、擬更新、擬保留清單，每項皆附文件化理由。保留／刪除比視記憶健康而定；維護良好者修 5-10%，被忽略者可至 30-50%。

**失敗時：** 若決策樹對多項產生模糊結果，套更嚴篩：「以今日所知，是否仍會寫此條？」否則即為刪除候選。傾向修剪——重學一事比繞過錯誤記憶易。

### 步驟五：施先發過濾

定「不存何」之規以防未來之記憶污染。檢視既有記憶以辨應於寫入時即過濾之模式。

下列模式**永不**應入持久記憶：

| Pattern | Why | Example |
|---------|-----|---------|
| Session-specific task state | Stale by next session | "Currently debugging issue #42" |
| Intermediate reasoning | Not a conclusion | "Tried approach A, didn't work because..." |
| Debug output / stack traces | Ephemeral diagnostic data | "Error was: TypeError at line 234..." |
| Exact command sequences | Brittle, version-dependent | "Run `npm install foo@3.2.1 && ...`" |
| Emotional/tonal notes | Not actionable | "User seemed frustrated" |
| Duplicates of CLAUDE.md | Already in system prompt | "Project uses renv for dependencies" |
| Unverified single observations | May be wrong | "I think the API rate limit is 100/min" |

若既有記憶中見此等模式，加入步驟四之刪除清單。

將過濾規則記於 MEMORY.md 或 `retention-policy.md` 主題檔，俾未來會話寫入新記憶前可查。

**預期：** 一組記於記憶目錄之先發過濾規則。任何與此等模式吻合之既有條目皆已標待刪。

**失敗時：** 若記錄規則感覺過早（記憶尚小、污染輕微），跳過記錄但仍施過濾以捕獲既有違例。規則可待目錄更成熟時再形式化。

### 步驟六：寫稽核軌跡

將每一刪除記錄之，俾遺忘本身可審。建或更新修剪日誌。

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

修剪日誌宜簡。其為問責而存，非為考古。若日誌本身龐大，將舊條目摘述：「2025：3 次稽核，共修剪 47 條（多為計數漂移與短暫滲漏）。」

**預期：** 一份附時戳之修剪日誌條目，記何被刪、為何被刪。日誌與記憶並存於記憶目錄。

**失敗時：** 若另建日誌檔感覺過度（僅 1-2 條被剪），於 MEMORY.md 加簡註替之：`<!-- Last pruned: YYYY-MM-DD, removed 2 stale entries -->`。任何記錄勝於默默刪除。

### 步驟七：指定受保護之記憶

某些記憶條目應免於修剪，無論年齡、存取頻率或擬真度分數如何。其代表不可替代之脈絡，若失之需重大努力以重建。

**受保護記憶之準則**：

| Category | Examples | Why protected |
|----------|----------|---------------|
| Architecture decisions | "Chose flat skill directory over nested" | Rationale is lost if re-derived later |
| User identity preferences | "Always use kebab-case," "Never auto-commit" | Explicit user intent, not inferrable |
| Security audit results | "Last audit: 2025-12-13 — PASSED" | Compliance evidence with timestamps |
| Rename/migration records | "Repo renamed: X to Y on date Z" | Cross-reference integrity depends on this |

**標示法**：以 `<!-- PROTECTED -->` 內聯標保護條目，或於修剪日誌維 `protected` 清單。步驟四之決策樹於施任何刪除規則前須先檢保護狀態。

**解除保護**：欲修剪受保護條目，須先明示移除標示，並於修剪日誌記理由。此二步流程防高價值記憶之意外刪除。

**預期：** 受保護條目歷次修剪皆存。修剪日誌記任何保護之增刪。

**失敗時：** 若受保護集過大（>30% 條目），重審準則——保護是為不可替代之脈絡，非為「重要」條目。重要但可重建之事實仍應接受常態修剪。

### 步驟八：修剪後重新合成

刪除之後，殘存記憶恐成片段——交叉參照指向已刪條目、主題檔失連貫、MEMORY.md 出現缺口。重新合成恢復結構完整性。

**重新合成查核表**：

1. **解決斷連參照**：掃殘存條目中指向已刪內容之連結，移除或重定向。
2. **合併相關片段**：若修剪後留下兩條覆蓋同一主題重疊面者，合為一條連貫之條目。
3. **更新主題檔結構**：若主題檔失逾 50% 內容，考慮將餘者折回 MEMORY.md 並刪該主題檔。
4. **分類冷記憶**：審雖存而近期未取之條目：
   - **冷因不用**：主題與當前專案目標契合，惟其產生之特定階段已過。保留——當該階段重啟時或再相關（如積極開發期間之 CRAN 提交筆記）。
   - **冷因不關**：主題本即邊緣——一次性實驗、外圍調查或被取代之路徑。標為下次修剪週期之刪除候選。
5. **驗 MEMORY.md 連貫性**：自上至下讀之。應講述專案之連貫故事，而非讀如雜陳事實。

**預期：** 修剪後記憶結構健全——無孤立參照、無冗餘片段、無不連貫之主題檔。冷條目已分類以供未來修剪決策。

**失敗時：** 若重新合成顯示修剪過猛（關鍵脈絡已失），檢修剪日誌並自稽核軌跡重建。此即稽核軌跡存在之由。

### 步驟九：自記憶漂移中復原

記憶漂移發生於所存事實默默失真——非其本即錯，而是底層現實已變而記憶未更新。漂移復原試圖就地修復記憶，而非修剪之。

**漂移偵測之觸發**：

- 記憶主張與當前工具輸出或檔案內容矛盾
- 記憶中之計數或版本號與註冊或鎖定檔不符
- 記憶中之路徑回傳「找不到檔案」
- 記憶之相依參照已改名或棄用之套件

**復原程序**：

1. **辨明漂移**：將記憶主張與當前實況（git log、註冊、實際檔案）相較
2. **評估可復原性**：能否自當前專案狀態判正確值？
   - 能 → 就地以當前值更新該條，加 `[corrected YYYY-MM-DD]` 註
   - 否 → 標為 `unverifiable` 並列為修剪候選
3. **追因**：是漸進漂移（計數慢慢分歧），抑或離散事件（改名、遷移）？離散事件常影響多條——掃其手足。
4. **防再現**：若漂移影響頻變值（計數、版本），考慮記憶是否應追蹤該值，抑或改參照真理之源：「現用計數見 skills/_registry.yml」優於「317 skills」。

**預期：** 已漂移之記憶於可能處就地校正，保留脈絡。無從校正者標為修剪。預防規則減未來漂移。

**失敗時：** 若漂移已普遍（>20% 條目），記憶恐須整重建，而非逐項修補。彼時將當前記憶目錄存檔、自零開始、擇要重新匯入通過驗證之條目。

## 驗證

- [ ] 已盤點全部記憶檔並按類型分類條目
- [ ] 已對當前專案狀態執行陳舊檢
- [ ] 已施至少一種擬真度檢查法（往返、壓縮失真、矛盾掃描或效用測試）
- [ ] 刪除決策依決策樹之優先序
- [ ] 無條目於無文件化理由下被刪
- [ ] 已記錄或施先發過濾規則
- [ ] 修剪日誌已記何被刪、何時、為何
- [ ] MEMORY.md 修剪後仍 < 200 行
- [ ] 殘存記憶準確（已對專案狀態抽檢）
- [ ] 自 MEMORY.md 修剪參照後未產生孤立主題檔
- [ ] 受保護條目已指定，歷次修剪皆存
- [ ] 修剪後之重新合成已解斷連參照與片段合併
- [ ] 冷條目已分類為「不用」與「不關」以供未來修剪
- [ ] 漂移條目於可能處就地校正，非僅刪除

## 常見陷阱

- **未驗即修剪**：因條目「看似舊」即刪而未檢其是否仍準仍有用。年齡單獨非刪除準則——最有價值之記憶常為仍真之古老架構決策。
- **自我擬真度驗證**：代理讀其自身之壓縮記憶並結論「似乎沒問題」非擬真度檢查。擬真度需外部錨：專案檔、git 歷史、註冊計數、實際工具輸出。無錨即在檢一致性，非檢準確。
- **無稽核軌跡之猛剪**：刪條目而未記錄。當未來會話需被剪之事實時，稽核軌跡解釋之，並可能含足夠脈絡以重建記憶。
- **以修剪決策為記憶**：勿寫「我決定剪 X 因為 Y」為一般記憶條目。此入修剪日誌即可。記憶中之記憶管理條目為元污染。
- **忽略先發過濾**：刪既有條目而未立規以防同模式再現。無規則，未來 10 個會話將重造方才所剪之短暫條目。
- **一視同仁**：決策與回饋記憶幾乎不應修剪——其代表用戶意圖與理由。專案與參照記憶為主修剪目標，因其追蹤變化之狀態。
- **將壓縮誤為腐敗**：將複雜主題以一行摘述之記憶為壓縮，非腐敗。僅當壓縮失去可行動之洞見而非僅細節時，才標為擬真失敗。
- **過度釘住**：標太多條為受保護將敗修剪之初衷。若 >30% 條目受保護，準則過鬆。保護不可替代之脈絡，非僅重要事實。
- **重新合成迴圈**：重新合成期間之片段合併恐造出本身需下次修剪之新條目。合併宜少——僅合明顯覆蓋同一主題者。修剪期間勿合成新洞見。

## 相關技能

- `manage-memory` —— 組織與生長記憶之互補技能；二者並用以盡記憶維護
- `meditate` —— 清明與立基，可揭出哪些記憶在製造雜訊
- `rest` —— 有時最佳記憶維護即不作記憶維護
- `assess-context` —— 評估推理脈絡之健康，記憶品質直接影響之
