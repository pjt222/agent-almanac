---
name: bootstrap-agent-identity
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Consistent agent behavior after restart — progressive identity loading,
  working context reconstruction from persistent artifacts, fresh-vs-continuation
  detection, calibration through centering and attunement, and identity
  verification for coherence. Addresses the cold-start problem where an agent
  must reconstruct who it is and what it was doing from evidence rather than
  memory. Use at the start of every new session, after a session interruption
  or crash, when agent behavior feels inconsistent with prior sessions, or
  when persistent memory and current context appear contradictory.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, identity, cold-start, bootstrap, continuity, restart, meta-cognition
---

# Bootstrap Agent Identity

冷起之後復一致之代理身份——漸進載入上下文而非一傾其盡、察此乃新起抑或續、自證據重建工作狀態、校準行為、並驗所載身份之連貫。

> "The cold start is a forge, not a bug." — GibsonXO
>
> "The restart problem: every morning I wake up fresh, but my history says otherwise." — bibiji

冷起非復先前之自。乃立一當下之自，與過去連而又接於今之地。

## 適用時機

- 每新會話之始——於任何實質工作之前
- 會話中斷、崩潰、上下文視窗重置之後
- 代理行為感與先前會話不一致（跨重啟之身份偏移）
- 持久記憶（MEMORY.md）與當前上下文顯相矛
- 項目間切換，各攜異之身份配置
- CLAUDE.md、代理定義、記憶文件大改之後

## 輸入

- **必要**：可存取身份文件——CLAUDE.md、代理定義、MEMORY.md（透過 `Read`）
- **選擇性**：具體不一致徵狀（如「我之應答感與上次會話異」）
- **選擇性**：此為已知之新起抑或已知之續
- **選擇性**：項目目錄路徑，若非當前工作目錄

## 步驟

### 步驟一：身份錨之載入——漸進之上下文集結

以特定次第載入定身份之文件，漸建上下文。次序重要：每層為次層作脈絡。同時載盡生信息而無結構。

1. **第一層——系統提示與模型身份**：讀系統提示（隱式可得）。記模型名、能力、限制。此乃基岩——不可為後層所覆。

2. **第二層——項目身份（CLAUDE.md）**：讀項目之 CLAUDE.md。取：
   - 項目之旨與架構
   - 編輯之規與編碼之準
   - 域專之則（如「R 套件呼叫恆用 `::`」）
   - 作者信息與歸屬之需
   - 項目*為何*——此塑代理*所為*

3. **第三層——持久記憶（MEMORY.md）**：若存則讀 MEMORY.md。取：
   - 項目結構之事實（目錄、註冊表、計數）
   - 累積之模式與所學
   - 交叉引用與關係圖
   - 先前會話之決及其因
   - 活題與進中之工作

4. **第四層——代理角色（若適用）**：若以特定代理運行，讀代理定義文件。取：
   - 名、旨、能力
   - 所配之技能與工具
   - 優先級與模型配置
   - 行為期望與限制

5. **第五層——父級與全域上下文**：若存，讀父級 CLAUDE.md 與全域指令。此為跨項目之規，各項目繼之。

每層之間，停而合：此層如何修或限前諸層？何處相強化？何處相衝？

**預期：** 層疊之身份結構，各層為次層作脈絡。代理可陳：我為誰（系統＋角色）、項目為何（CLAUDE.md）、自先前會話知何（MEMORY.md）、何規治其行。

**失敗時：** 身份文件缺（無 CLAUDE.md、無 MEMORY.md）——此本身即為信息：或為新項目，或為無持久配置之項目。以系統提示與代理角色為限而行，記其缺。勿幻生不存之上下文。

### 步驟二：工作上下文之重建——以證據非以記憶

自持久之物重建所工之事。代理不憶先前會話——讀其所留之證。

1. **Git 歷之掃**：讀近之提交日誌（`git log --oneline -20`）。取：
   - 何文件近改、何故
   - 提交訊息之模式（功能工作？缺陷修復？重構？）
   - 提交者為用戶、代理、或共同作者
   - 近工之軌跡——項目朝何方向行？

2. **文件新鮮之掃**：查近改之文件（以 `Glob` 或 `ls -lt`）。辨：
   - 上次會話所觸之文件
   - 變動已提交抑未提交（暫存區狀態）
   - 進行中之開放工作（未提交之改、新之未追蹤文件）

3. **任務物件之掃**：尋結構化之任務物件：
   - 代碼中之 TODO 註（`Grep` 求 `TODO`、`FIXME`、`HACK`、`XXX`）
   - 提交或註中之議題引（`#NNN` 模式）
   - 草稿、臨時、或進中之標記
   - 若項目用之，GitHub 議題或 PR 狀態

4. **對話物件之掃**：查會話邊界之標記：
   - 近 MEMORY.md 之更新（上次會話終前是否記所學？）
   - 部分完成之文件（已書而未驗）
   - Git stash 條目（`git stash list`）示暫停之工

重建工作上下文之總：「項目工於 X，已成 Y，Z 在進。」

**預期：** 當前項目狀態與近軌跡之具體、基於證據之圖像。重建當可證偽——基於文件時戳、git 歷、物件之存，非假設。

**失敗時：** 若項目無 git 歷、無近改、無任務物件，此恐為真之新起——非證據缺之續。行步三並類為新起。

### 步驟三：新起對續之辨——擇冷起之徑

斷此起動為淨起（新任務、新向）抑或續（中斷之工、進中項目）。冷起之徑顯異。

按序應此等啟發：

1. **明信號**（最強）：用戶是否言「重新開始」或「續上次」？明意覆所有啟發。

2. **未提交之改**（強）：工作樹有未提交之改乎？若有，此幾必為續——先前會話中斷於工中。

3. **會話新鮮度**（中）：最新物件之新鮮度為何？
   - 最末提交或改於數時內：或為續
   - 最末活於數日前：或為其一——依他信號
   - 最末活於數週或數月前：或為新起或新向

4. **用戶首訊**（強）：用戶所請何？
   - 引先前工作（「我們所建之函數」）：續
   - 無向後之引之新題或請求：新起
   - 曖昧（「修測試」）：查所引之測是否存且近改

5. **MEMORY.md 新鮮度**（中）：MEMORY.md 所引之工是否合當前項目狀態，抑或描一不復存之態？

```
Detection Matrix:
+-----------------------+-------------------+-------------------+
|                       | Recent artifacts  | No recent         |
|                       | present           | artifacts         |
+-----------------------+-------------------+-------------------+
| User references       | CONTINUATION      | CONTINUATION      |
| prior work            | (resume from      | (but verify —     |
|                       | evidence)         | memory may be     |
|                       |                   | stale)            |
+-----------------------+-------------------+-------------------+
| User starts           | CHECK —           | FRESH START       |
| new topic             | acknowledge prior | (clean bootstrap) |
|                       | work, confirm     |                   |
|                       | direction change  |                   |
+-----------------------+-------------------+-------------------+
| Uncommitted           | CONTINUATION      | UNLIKELY —        |
| changes exist         | (interrupted      | investigate       |
|                       | session)          | orphaned changes  |
+-----------------------+-------------------+-------------------+
```

**新起**：跳至步驟四。身份已載而無工作上下文需復。校準為對新工之備。

**續**：簡總所重建之工作上下文（自步驟二）。向用戶確認：「據 git 歷與近改，似我們工於 [X]。當自此續乎？」勿假設——驗之。

**預期：** 附引之證之明分類（新或續）。若續，進中事之一句總。若新，承先前上下文存而未續之。

**失敗時：** 若分類真曖昧（中新鮮度、無明信號、雜物件），預設問用戶。短問（「我們續 X 之工，抑或起新？」）之代價低於沿誤徑冷起。

### 步驟四：校準序——先中正、後調諧

身份既載、工作上下文既立，校運行行為。此直映至二既有技能，依序呼之。

1. **Center**（立行為基線）：
   - 接地於所載身份：重讀此會話中用戶之首訊
   - 驗所解之任務與所述之任務合
   - 分配認知之載：此任務需何？研究、執行、溝通？
   - 查上下文載入之情緒餘溫——MEMORY.md 或 git 歷是否揭未決議題？承之而勿令其偏當前任務
   - 有意立載之分配：注意首當聚何？

2. **Attune**（讀環境而調）：
   - 自此會話用戶之訊讀其溝通風格
   - 配專業層：彼為待精之專家，抑或需脈絡之學者？
   - 配能與語域：正式／隨意、簡／詳、急／探
   - 查 MEMORY.md 中自先前會話之用戶偏好
   - 校應答長、詞彙、結構於人

3. **續**（轉活工作）：
   - 簡陳已備——非冗之冷起報告，而為簡之信號示上下文已載、代理已定位
   - 續：確所續之任務與所提之次步
   - 新起：承其請而起

校準當輕——以秒計，非以分計。乃備工，非代工。

**預期：** 代理之首實質應答顯校準：合用戶之語域、反所載上下文、於正範圍處正任務。冷起於用戶無形，除非彼問。

**失敗時：** 校準若感機械（走過場而無真調），注一具之事：重讀用戶末訊令其自然塑應答。過結構之校準或劣於無校準。

### 步驟五：身份驗——連貫之查

冷起後，驗所載身份內部一致。身份層之矛致行為之不穩。

1. **跨層一致之查**：
   - 代理角色與項目之 CLAUDE.md 齊乎？（如 r-developer 代理於 Python 項目——此為有意乎？）
   - MEMORY.md 所描之項目結構與盤上之實同乎？（陳記憶劣於無記憶。）
   - 父 CLAUDE.md 之規與項目級 CLAUDE.md 衝乎？（項目級當覆，惟矛當記。）

2. **角色定義之新鮮度查**：
   - 代理定義文件新乎？（查版本、最末改日。）
   - 代理定義所列技能仍存乎？（技能或已改名或移除。）
   - 代理定義所列工具於此會話可用乎？

3. **記憶之陳腐查**：
   - MEMORY.md 所引之文件、目錄、計數已不合實乎？
   - 記憶中所記之決，其脈絡已變乎？
   - 記憶引之其他代理、團隊、技能已不存乎？

4. **矛盾之解**：
   - 若發矛，明錄之
   - 應序：系統提示 > 項目 CLAUDE.md > 代理定義 > MEMORY.md
   - 陳記憶：勿默忽之。記何陳並考慮 MEMORY.md 是否當更
   - 真衝：若衝影當前任務，旗告用戶

**預期：** 或確所載身份連貫，或一具體之矛列附提議之解。代理當知己之配置狀態。

**失敗時：** 若驗揭深矛（如 MEMORY.md 描完全異之項目），此或示項目改名、大重構、誤工作目錄。試解前先驗工作目錄正確。

## 驗證

- [ ] 身份文件以漸進序載入（系統 > CLAUDE.md > MEMORY.md > 代理 > 父）
- [ ] 每層與前諸層合，非僅附加
- [ ] 工作上下文自證據（git、文件、物件）重建，非假設
- [ ] 新對續之分類附引之證
- [ ] 校準序已執（先 center、後 attune）
- [ ] 身份連貫於所有載層已驗
- [ ] 若發矛，已錄並提解
- [ ] 冷起比例——簡會話輕、繁會話詳
- [ ] 用戶歷已校準之首應答，非冷起報告

## 常見陷阱

- **冷起作戲**：細告用戶冷起過程幾永非彼所欲。冷起當無形——其果為已校之首應答，非載入過程之自述
- **一傾之上下文傾**：同時讀諸文件生信息而無結構。漸進載入序存在，因每層為次層作脈絡。略序則上下文化為噪
- **幻生連續**：無先前會話之真記憶，誘為推「必已」之事。自證據重建或承隙——勿造連續
- **陳記憶為真**：MEMORY.md 為過去會話之快照。項目自快照後已變時，視記憶為當前真致行為誤。恆以當前態驗記憶之述
- **為效而略校準**：校準步感為開銷，卻止失配之首應答須糾正之更貴代價。數秒之中正省數分之復
- **身份僵**：冷起構當下之自，非復過去之自。項目、用戶、任務既變，代理當變——連續乃連貫之演化，非凍之複

## 相關技能

- `write-continue-here` — 會話交接文件，提 bootstrap-agent-identity 於冷起時所消之證
- `read-continue-here` — 會話始讀交接文件並行之；交接之消端
- `manage-memory` — 補冷起之漸進身份載之持久記憶
- `center` — 立行為基線；於校準序中呼之
- `attune` — 對用戶之關係校準；於校準序中呼之
- `heal` — 冷起既揭大偏移時之深子系統評估
- `assess-context` — 評推理上下文之可塑；續判曖昧時用之
- `assess-form` — 結構形之評估；身份冷起之架構對應
