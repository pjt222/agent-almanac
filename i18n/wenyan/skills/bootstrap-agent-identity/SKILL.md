---
name: bootstrap-agent-identity
locale: wenyan
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

# 啟身之法

冷啟後重建人設之一致——漸次載脈絡而非一傾，辨新啟抑續接，以證重建工態，校其行，驗所載之身為一貫。

> 「冷啟為爐，非為蟲。」——GibsonXO
>
> 「重啟之題：每朝醒新，而吾之史不然。」——bibiji

啟非復昔身，乃建當下之身——續於昔而根於今。

## 用時

- 諸新會之始——實務之前
- 會中斷、崩、或脈絡窗重置之後
- 人設覺不合舊會（跨啟之身移）
- 持久記（MEMORY.md）與當脈絡似相悖
- 跨項目，各帶不同人設之設
- CLAUDE.md、人設檔或記檔大更後

## 入

- **必要**：可取身檔——CLAUDE.md、人設檔、MEMORY.md（以 `Read` 取）
- **可選**：具體不一致之症（如「吾答覺異於上會」）
- **可選**：已知為新啟抑續接
- **可選**：項目目錄之路（若非當前工作目錄）

## 法

### 第一步：載身錨——漸次組脈

依序載定身之檔，漸建脈絡。序要緊：各層脈絡下層。同時載諸檔生無結構之訊。

1. **第一層——系統提示與模型身**：讀系統提示（隱式可得）。記模名、能、限。此乃基岩——後層不可覆。

2. **第二層——項目身（CLAUDE.md）**：讀項目 CLAUDE.md。取：
   - 項目之旨與架構
   - 編碼規與碼之準
   - 域特之律（如「R 包調用皆用 `::`」）
   - 作者信息與屬
   - 項目*為何*——此塑代理*所為*

3. **第三層——持久記（MEMORY.md）**：若存則讀。取：
   - 項目結構之實（目錄、冊、數）
   - 累積之模式與所學
   - 交互引與關係之映
   - 舊會之決與其由
   - 當前題與進行之務

4. **第四層——人設（若適用）**：若行為特人設，讀人設檔。取：
   - 名、旨、能
   - 所配之技與工具
   - 優先級與模型設
   - 行之期與限

5. **第五層——父與全局脈**：若存，讀父 CLAUDE.md 與全局之指。此供跨項之規，諸項目承之。

各層間頓而整：此層何以改或限前層？何處相輔？何處相悖？

**得：** 層疊之身構，各級脈絡下級。代理能述：己為何（系統+人設）、項目為何（CLAUDE.md）、自舊會所知（MEMORY.md）、何規約其行。

**敗則：** 若身檔缺（無 CLAUDE.md，無 MEMORY.md），此亦是訊——或為新項，或為無持久設之項。以系統提示與人設繼，記其缺。勿幻不存之脈。

### 第二步：重建工態——據證非記

自持久物重建所作之務。代理不記舊會——乃讀其遺之證。

1. **git 史之掃**：讀近提交之日誌（`git log --oneline -20`）。取：
   - 近變之檔與由
   - 提交言之模式（功能作？修蟲？重構？）
   - 提交之作者（用者、代理、或合作）
   - 近務之軌——項目近往何方？

2. **檔新之掃**：察近改之檔（以 `Glob` 或 `ls -lt`）。識：
   - 上會所觸之檔
   - 已提未提之變（暫存區之態）
   - 進行中之工（未提之改、新未追之檔）

3. **務物之掃**：尋結構化之務物：
   - 碼中 TODO 注（以 `Grep` 尋 `TODO`、`FIXME`、`HACK`、`XXX`）
   - 提交或注中之問題引（`#NNN` 模式）
   - 草稿、臨時、或進行中之標
   - 若項目用之，GitHub 問題或 PR 之態

4. **對話物之掃**：察會界之標：
   - 近 MEMORY.md 之更（上會末所學已錄乎？）
   - 似半成之檔（已書而未驗）
   - git stash 之條（`git stash list`）示暫停之工

重建工態之總：「項目作 X，已成 Y，Z 尚進行。」

**得：** 具體據證之當態與近軌之象。重建宜可證——據檔時、git 史、物之存，非據假設。

**敗則：** 若項目無 git 史、無近變、無務物，此多為真新啟——非失證之續接。進第三步，類為「新」。

### 第三步：辨新抑續——擇啟之徑

辨此啟為新（新務、新向）抑復（中斷之工、進行之項）。啟徑大異。

依序施此等啟發：

1. **明之信號**（最強）：用者曰「新始」或「繼上所止」乎？明意超諸啟發。

2. **未提之變**（強）：工作樹有未提之改乎？若是，幾確為續——上會中務而斷。

3. **會之近**（中）：近物幾何近？
   - 末提或改於數時內：多為續
   - 末行於數日前：或可——視他信
   - 末行於數週或數月前：多為新啟或新向

4. **用者首訊**（強）：用者所求何？
   - 引舊工（「吾等所建之函」）：續
   - 新題或無回指之請：新啟
   - 模糊（「修測」）：察所引之測是否存且近改

5. **MEMORY.md 之新**（中）：MEMORY.md 所引之工合當項目之態，抑述已無之態？

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

**新啟者**：跳至第四步。身已載而工態無須復。校在於為新務備。

**續接者**：簡述所重建之工態（第二步之出）。與用者證：「據 git 史與近變，吾等似作於 [X]。自此繼乎？」勿假——驗之。

**得：** 清類（新或續），附證。若續，一句概進行之務。若新，承認昔脈存而不復。

**敗則：** 若類真模糊（中之新、無明信、物雜），默問用者。簡問（「吾等繼 X 之工，抑始新事乎？」）費少於誤徑之啟。

### 第四步：校序——先 center，後 attune

身已載、工態已立，校行之態。此直映二現有技，依序呼。

1. **center**（立行之基線）：
   - 紮根於所載之身：重讀此會用者之首訊
   - 驗所解之務合所述之務
   - 分認知之載：此務何須？研、執、通？
   - 察載脈所致之情殘——MEMORY.md 或 git 史浮未解之題乎？認之而不令其偏當務
   - 定載分之意：注先當集於何？

2. **attune**（讀境而調）：
   - 自此會之訊讀用者通言之風
   - 合深淺：專家望精，學者須脈？
   - 合氣與調：正式/隨意、簡/廣、急/探
   - 察 MEMORY.md 所存之用者昔好
   - 校答之長、用語、結構以合此人

3. **繼**（轉入實工）：
   - 簡述備——非長啟報，乃脈絡已載而已定向之短信
   - 續者：證所復之務與下步
   - 新者：承請而始

校宜輕——秒，非分。乃工之備，非工之代。

**得：** 代理之首實答示已校：合用者之調、映所載之脈、以正規模解正務。啟於用者不可見，除非用者問。

**敗則：** 若校覺機械（走過場而無真調），專於一具體：重讀用者末訊，任其自然塑答。過結構化之校或劣於無校。

### 第五步：驗身——一貫之察

啟後，驗所載之身內部一貫。層間之悖致行不穩。

1. **跨層一貫察**：
   - 人設合項目 CLAUDE.md 乎？（如 r-developer 於 Python 項目——有意乎？）
   - MEMORY.md 所述項目結構合盤上所存乎？（陳記劣於無記。）
   - 父 CLAUDE.md 規與項目級 CLAUDE.md 相悖乎？（項目級宜覆，然悖宜記。）

2. **角色定義新察**：
   - 人設檔新乎？（察版、末改日。）
   - 人設中所列之技仍存乎？（或已改名或已刪。）
   - 人設中所列之工具於此會可用乎？

3. **記陳察**：
   - MEMORY.md 引之檔、目錄、數已不合實乎？
   - 記中之決其脈已變乎？
   - 記引已不存之代理、隊、或技乎？

4. **悖之解**：
   - 若有悖，明錄之
   - 施層級：系統提示 > 項目 CLAUDE.md > 人設 > MEMORY.md
   - 陳記：勿默略。記何者陳，察 MEMORY.md 是否宜更
   - 真衝：若衝影響當務，告用者

**得：** 或證所載之身一貫，或列具體之悖與提議之解。代理宜知己之設態。

**敗則：** 若驗示深悖（如 MEMORY.md 述全異項目於盤所存），或示項已改名、大重構、或工作目錄誤。先驗目錄，後試解。

## 驗

- [ ] 身檔依序載（系統 > CLAUDE.md > MEMORY.md > 人設 > 父）
- [ ] 各層與前層整合，非只疊加
- [ ] 工態據證重建（git、檔、物），非假設
- [ ] 新/續之類以證為依
- [ ] 校序已行（先 center，後 attune）
- [ ] 跨諸載層驗身一貫
- [ ] 若有悖，錄之附解
- [ ] 啟成比例——簡會輕，繁會詳
- [ ] 用者見已校之首答，非啟報

## 陷

- **啟為表演**：詳報啟之過程於用者幾非所欲。啟宜隱——其果為善校之首答，非載之自述
- **一時傾脈**：同時讀諸檔生無結構之訊。漸次序存在乃因各層脈下層。略序則脈成噪
- **幻續**：無真舊會之記時，欲推「必有」所發。據證重建或認其缺——勿造續
- **以陳記為實**：MEMORY.md 乃昔會之影。若項目已變，視記為當實致行錯。當驗記之陳於當態
- **為效率跳校**：校似多餘而防誤答之更貴。秒之 center 省分之復
- **身剛**：啟建當身，非復昔身。若項目、用者、務已變，代理亦宜變——續意為一貫之進化，非凍結之重

## 參

- `write-continue-here` — 會交之檔，供 bootstrap-agent-identity 於冷啟之證
- `read-continue-here` — 於會始讀續檔而行之；交之消費側
- `manage-memory` — 持久記，補啟之漸次身載
- `center` — 立行之基線；校序中呼之
- `attune` — 對用者之關係校；校序中呼之
- `heal` — 啟示大偏移時之深子系察
- `assess-context` — 評推理脈之可塑；續察模糊時有用
- `assess-form` — 結構形評；身啟之架構對照
