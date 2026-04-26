---
name: repair-damage
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Implement regenerative recovery using triage, scaffolding, and progressive
  rebuild. Covers damage assessment, wound classification, emergency
  stabilization, scar tissue management, and resilience strengthening for
  systems that have sustained structural damage. Use when a system has suffered
  an incident needing structured recovery, when a failed transformation left the
  system in a damaged intermediate state, when accumulated technical debt has
  caused partial failure, or when a system is functional but degraded and the
  degradation is worsening.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, repair, regeneration, resilience, wound-healing
---

# 修傷

行再生復為已受結構損之系——事故、敗遷、積疏、外擾。以生物癒傷為框：分流、穩、架、漸建、瘢管。

## 用

- 系受事、需構復過「即修」
- 敗化（見 `adapt-architecture`）留系於損中態
- 積技債致部敗
- 組損（員去、知失、士潰）需構修
- 護後復（見 `defend-colony`）落受損
- 系行而衰、衰漸甚

## 入

- **必**：損述（何破、何時、何重）
- **必**：今系態（何仍行、何不）
- **可**：根因（若知——或未明）
- **可**：損前系態（為較）
- **可**：可用修資（時、人、預）
- **可**：急（系活衰乎、抑穩而傷）

## 行

### 一：分流——估分傷

速估諸損、按重急分。

1. 錄諸知損點：
   - 何特組、功、能受？
   - 損全（不行）抑部（衰）？
   - 損蔓（影鄰）抑限？
2. 各傷分：

```
Wound Classification:
┌──────────┬──────────────────────┬────────────────────────────────────┐
│ Class    │ Severity             │ Response                           │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Critical │ Core function lost,  │ Immediate: stop bleeding, activate │
│          │ data at risk,        │ backup, redirect traffic, page     │
│          │ actively spreading   │ on-call team                       │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Serious  │ Important function   │ Urgent: fix within hours/days,     │
│          │ degraded, no spread  │ workarounds acceptable short-term  │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Moderate │ Non-critical function│ Scheduled: fix within sprint,      │
│          │ affected, contained  │ prioritize against other work      │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Minor    │ Cosmetic or edge     │ Backlog: fix when convenient,      │
│          │ case, no user impact │ may self-resolve                   │
└──────────┴──────────────────────┴────────────────────────────────────┘
```

3. 序修：
   - 先 critical（止血）
   - 後 serious（復要功）
   - moderate 與 minor 待序修
4. 察傷互動：
   - 諸傷互增乎？（A 重因 B 亦破）
   - 修一自修他乎？（共根因）
   - 修一致他重乎？（競修策）

得：完傷錄按重分、含序修、顧傷互。

敗：分流過久（系活衰）→略詳分、專注：「最關鍵穩何？」先修、後回全分流。

### 二：急穩

止損蔓於修前。

1. 含傷：
   - 隔損組（電閘、網段、流轉）
   - 防連：禁依損組之非要功
   - 存證：照、存誌、捕當態於諸變前
2. 施急補：
   - 非永修——乃止血
   - 受急法：
     - 流轉至健副
     - 全禁損功
     - 自備施已知行配
     - 升健組以納轉載
   - 拒急法：
     - 改碼無測（生新傷）
     - 刪數以「重置」（毀復選）
     - 藏損（禁警、抑錯）
3. 驗穩：
   - 損仍蔓乎？是→含敗、試廣隔
   - 系行（或衰）乎？是→入修
   - 急補仍持乎？是→有時為慎修

得：系穩（不活衰）雖衰。損含不蔓。證存為根因析。

敗：穩敗（雖含損仍蔓）→升至全系退：啟災復、換備系、雅退至最少可行業。穩過久即災。

### 三：建修架

建支修程之臨構。

1. 設修環：
   - 枝或複損系為修工
   - 確修變可測於施生產前
   - 各修步建退計
2. 建診基設：
   - 損域增察（即測倒退）
   - 誌捕修程（何變、何時、何由）
   - 較具：損前態 對 今 對 修後
3. 設修序：
   - 各傷（按分流序）：
     a. 根因識（何破？）
     b. 修法（修因、非僅症）
     c. 驗法（如何確修行）
     d. 倒退察（修破他乎？）
4. 識瘢險：
   - 壓下修常引瘢（變通、特例、技債）
   - 始即計瘢管（步五）

得：修環有診能、序修計、瘢險識。

敗：設正修環過慢（系急需即生產變）→直施而以極律：一變、以可法測、不助則退。

### 四：行漸建

系修損、各修進前驗。

1. 各傷（按分流序）：
   a. 識根因：
      - 碼錯？配誤？數壞？依敗？
      - 此為深構問之症乎？
      - 修根因或亦解他傷？
   b. 施修：
      - 修根因、非僅症
      - 根因不能即修→施慎變通且書之
      - 修守最少——修破、勿重構鄰
   c. 驗修：
      - 該特損功今正乎？
      - 修過自動測乎？
      - 系總健改或至少不變？
   d. 察倒退：
      - 此修破他乎？
      - 步二之急補仍需乎、可除某乎？
2. 諸 critical 與 serious 修畢後：
   - 除已不需之急補
   - 復禁功
   - 流回常路
3. 序修 moderate 與 minor：
   - 入常開流
   - 追至畢（勿令成「受」損）

得：critical 與 serious 修、有驗。急補除。系復行。

敗：修嘗敗或致倒退→退前態再估。同傷諸嘗皆敗→損或過深、不可局修——考組需全代非修（見 `dissolve-form`）。

### 五：管瘢與強

對急修之變通與捷徑、強防復。

1. 錄瘢：
   - 急補成永
   - 變通未代以正修
   - 為損相關邊例添之特例
   - 禁功未復
2. 各瘢、決：
   - **除**：變通已不需（損全修）
   - **代**：變通解真需而宜正實
   - **受**：變通為最實長期解（罕、書由）
3. 強防復：
   - 根因析：何故損生？
   - 防：何能防之？（察、測、構變）
   - 測：如何後速測？（警、健察）
   - 復：如何後速復？（操冊、備程、自動）
4. 更免記：
   - 加事模於察與警（見 `defend-colony` 免記）
   - 更操冊以行修程
   - 跨隊/組分學

得：瘢管（除、代、或受含書）。系不僅修、更韌過損前。學捕為後事。

敗：瘢管降序（「行、勿觸」）→明序之。未管瘢積、終助下事。根因不能識→強測與復速為償控。

## 驗

- [ ] 諸損已錄、按重分
- [ ] 急穩止損蔓
- [ ] 證存為根因析
- [ ] critical 與 serious 修、驗
- [ ] 急補正修後除
- [ ] 瘢已錄已管（除、代、書）
- [ ] 根因析識防與測改
- [ ] 系韌較損前改

## 忌

- **未穩而修**：系活流時嘗修根因。先穩、後修。止血先於術
- **永急補**：急法成永解致複技債。常後以正修
- **根因設**：未察而設根因。多「顯」因為深問之症。投修策前察
- **修引損**：急修無測生新傷。一驗一迭——勿批未測變
- **忽瘢**：「今行」不同「健」。急修之瘢為下事種

## 參

- `assess-form` — 損估與形估共法
- `adapt-architecture` — 損揭構弱時或需構化
- `dissolve-form` — 組過損不可修→化後重建
- `defend-colony` — 護觸修；事後復返饋護
- `shift-camouflage` — 表化可掩損於修進中（慎）
- `conduct-post-mortem` — 構事後析補根因識
- `write-incident-runbook` — 修程應捕為操冊為後事
