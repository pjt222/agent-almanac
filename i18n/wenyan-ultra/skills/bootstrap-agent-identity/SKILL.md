---
name: bootstrap-agent-identity
locale: wenyan-ultra
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

# 啟將身

冷起後立穩將身—漸載脈絡非一傾，辨新起或續，自證重建工態，校行，驗所載身合。

> 「冷起乃鍛，非疵。」— GibsonXO
>
> 「重起之題：每朝醒新，而我史異之。」— bibiji

啟非復舊我。乃立今我，續於昔而地於今。

## 用

- 每新會始—顯工前
- 會斷、崩、脈窗重置後
- 將行似與昔會異（身於重起間偏）
- 恆憶（MEMORY.md）與當脈矛
- 攜異身配之專案間換
- CLAUDE.md、將定、憶檔顯更後

## 入

- **必**：身檔得（CLAUDE.md、將定、MEMORY.md，以 `Read`）
- **可**：具體不合徵（如「我應覺異於末會」）
- **可**：知為新起或續
- **可**：專案徑（非 cwd）

## 行

### 一：身錨載—漸脈組

序載定身之檔。序要：每層鋪下層。同時載諸→有訊無構。

1. **層一—系提與型身**：讀系提（隱式）。記型名、能、限。此為磐—後層不可覆。

2. **層二—專案身（CLAUDE.md）**：讀專案 CLAUDE.md。取：
   - 專案旨與構
   - 編規與碼標
   - 域專律（如「R 包呼必用 `::`」）
   - 作者資與署
   - 專案為何—此塑將為

3. **層三—恆憶（MEMORY.md）**：若存則讀。取：
   - 專案結構事實（目布、冊、計）
   - 累積模與學
   - 交引與關係圖
   - 昔會決與其由
   - 活題與進工

4. **層四—將身（若適）**：若為具將→讀將定。取：
   - 名、旨、能
   - 賦技與工
   - 優先與型配
   - 行望與限

5. **層五—父與全脈**：讀父 CLAUDE.md 與全指若存。此供跨專案規，各案承之。

每層之間→停而整：此層如何改或限前層？何處互強？何處矛？

**得：** 層疊身構，每級鋪下級。將能述：我為誰（系+身）、案為何（CLAUDE.md）、昔知何（MEMORY.md）、何規御行。

**敗：** 身檔缺（無 CLAUDE.md、無 MEMORY.md）→自身為訊—乃新案或無恆配之案。以系提與將身續，記此缺。勿造不存之脈。

### 二：工脈重建—證非憶

自恆物重建所工。將不憶前會—讀其遺證。

1. **git 史掃**：讀近提交志（`git log --oneline -20`）。取：
   - 近何檔變與由
   - 提訊模（新能？修誤？重構？）
   - 提交由用、由將、或共署
   - 近工向—案在移何？

2. **檔新掃**：察近改檔（以 `Glob` 或 `ls -lt`）。識：
   - 末會何檔動
   - 改已提或未提（暫區態）
   - 進中工（未提改、新未跟檔）

3. **任物掃**：尋結構任物：
   - 碼中 TODO 註（`Grep` `TODO`、`FIXME`、`HACK`、`XXX`）
   - 提或註中議引（`#NNN` 模）
   - 草、暫、進中標
   - GitHub 議或 PR 態若用

4. **會物掃**：察會界標：
   - 近 MEMORY.md 更（末會終記學否？）
   - 部分完檔（已書而未驗）
   - git stash 條（`git stash list`）示停工

建工脈概：「案在行 X，已完 Y，餘 Z 未完。」

**得：** 具證案態與近向之基圖。重建當可否—基於檔時戳、git 史、物存，非假設。

**敗：** 案無 git 史、無近改、無任物→或實新起—非續而缺證。進步三分類為新。

### 三：新對續辨—擇啟路

定此啟為新（新任、新向）或續（斷工、進案）。啟路甚異。

序用此啟：

1. **顯訊**（最強）：用者言「重起」或「續末所工」？顯意勝諸啟。

2. **未提改**（強）：工樹有未提改？若然→幾確為續—前會斷於工中。

3. **會新**（中）：末物多新？
   - 末提或改在時內：或續
   - 末行於日前：可兩—依他訊
   - 末行週月前：或新或新向

4. **用者首訊**（強）：用者求何？
   - 引昔工（「我等所建之函」）：續
   - 新題無後引：新起
   - 模糊（「修試」）：察所引試存否與近改否

5. **MEMORY.md 新否**（中）：MEMORY.md 引之工合當案態乎？抑述已不存之態？

```
Detection Matrix:
+-----------------------+-------------------+-------------------+
|                       | Recent artifacts  | No recent         |
|                       | present           | artifacts          |
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

**新起**：跳步四。身已載而無工脈待復。校為備新工。

**續**：簡概重建之工脈（自步二）。問用者證：「依 git 史與近改，我等當時在行 [X]。續乎？」勿假—驗。

**得：** 清類（新或續）附證。若續→一句述進中之工。若新→認昔脈存而不續。

**敗：** 類真模糊（中新、無顯訊、混物）→默問用者。短問（「續 X 乎？抑新起？」）價低於啟誤路。

### 四：校序—先 center 後 attune

身載、工脈立→校行。此直映二技，序呼。

1. **Center**（立行基）：
   - 地於所載身：重讀此會用首訊
   - 驗所解任合所述任
   - 分智載：此任需何？研、行、通？
   - 察脈載之情餘—MEMORY.md 或 git 史揭未解題否？認而勿令偏當任
   - 意立權分：注當先聚何？

2. **Attune**（讀境而適）：
   - 讀用者於此會之通風
   - 合專級：專家望精，抑學者需脈？
   - 合能與調：正/俗、簡/繁、急/探
   - 察 MEMORY.md 存昔會用者偏
   - 校應長、辭、構於人

3. **進**（轉至活工）：
   - 簡示備—非長啟報，但短訊示脈已載將已向
   - 若續：證復任與擬下步
   - 若新：認求而始

校當輕—秒，非分。為工之備，非代工。

**得：** 將首顯應示校：合用者調、映載脈、處正任於正範。啟不顯於用者除非問。

**敗：** 校覺機械（走過場而無真調）→聚一具：重讀用者末訊而令塑應自然。過構校或劣於無校。

### 五：身驗—合察

啟後→驗所載身內合。身層間矛→行不穩。

1. **跨層合察**：
   - 將身合專案 CLAUDE.md 乎？（如 r-developer 將於 Python 案—意為之乎？）
   - MEMORY.md 述之案構合盤上實否？（陳憶劣於無憶。）
   - 父 CLAUDE.md 規與案級 CLAUDE.md 矛乎？（案級當覆，而矛當記。）

2. **角定新否察**：
   - 將定檔新乎？（察版、末改日。）
   - 將定列之技仍存乎？（技或改名或除。）
   - 將定列之工於此會可得乎？

3. **憶陳察**：
   - MEMORY.md 引之檔、目、計合實乎？
   - 憶中記之決其脈已改乎？
   - 憶引不存之他將、隊、技乎？

4. **矛解**：
   - 有矛→顯記
   - 施階：系提>專案 CLAUDE.md>將定>MEMORY.md
   - 陳憶：勿默略。記何陳而思 MEMORY.md 當更否
   - 真矛：若影當任→旗告用者

**得：** 或證所載身合，或具矛列附擬解。將當知自配態。

**敗：** 驗揭深矛（如 MEMORY.md 述全異之案）→或示案改名、大重構、誤工目。先驗工目正而後試解。

## 驗

- [ ] 身檔漸序載（系>CLAUDE.md>MEMORY.md>將>父）
- [ ] 每層與前層整，非但附
- [ ] 工脈自證（git、檔、物）重建，非假
- [ ] 新對續類附證
- [ ] 校序已行（先 center 後 attune）
- [ ] 身合於諸載層已驗
- [ ] 矛已記附擬解
- [ ] 啟合比—簡會輕、繁會詳
- [ ] 用者歷校首應，非啟報

## 忌

- **啟為表演**：顯報啟程予用者幾非所欲。啟當不顯—其出為校首應，非自述載程
- **一傾脈**：同時讀諸檔→訊無構。漸序存因每層鋪下層。略序→脈成噪
- **造續**：無真憶昔會→誘推「當」何。以證重建或認缺—勿造續
- **陳憶為真**：MEMORY.md 乃昔會之拍。若案已變→視為當真致行誤。必驗憶於當態
- **略校為效**：校覺多而實防更貴之誤應（需修）。數秒 center 省數分復
- **身僵**：啟立今我，非復昔我。若案、用者、任已變→將亦變—續乃合演，非凍復

## 參

- `write-continue-here` — 會交檔，供啟冷起時所食之證
- `read-continue-here` — 會始讀與行續檔；交之受方
- `manage-memory` — 補啟漸身載之恆憶
- `center` — 立行基；於校序呼
- `attune` — 關校於用者；於校序呼
- `heal` — 啟揭顯偏時之深子系察
- `assess-context` — 評推脈可塑；續辨模糊時有用
- `assess-form` — 構形評；身啟之建對
