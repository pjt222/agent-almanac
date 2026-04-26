---
name: repair-damage
locale: wenyan
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

# 修損

施再生之復用分緩急、立架、漸建之法。涵損之察、傷之分、急穩、痕管、為已受構損之系強韌。

## 用時

- 系受事故需構之復，逾「即修」乃用
- 失之化（見 `adapt-architecture`）留系於損之中乃用
- 累積之技債致部敗乃用
- 組織之損（員去、知失、氣崩）需構之修乃用
- 守後復（見 `defend-colony`）若殖受損乃用
- 系行而衰，且衰愈深乃用

## 入

- **必要**：損之述（何破、何時、何重）
- **必要**：當前系之狀（何仍行、何不行）
- **可選**：根因（若知——或尚未明）
- **可選**：損前系之狀（為較）
- **可選**：可得之修源（時、人、預算）
- **可選**：急（系活衰乎、抑穩而損？）

## 法

### 第一步：分緩急——察而分傷

速察諸損而以重急分之。

1. 錄諸已知之損點：
   - 何件、何功、何能受影？
   - 損為全（不行）或部（衰）？
   - 損漫（影鄰件）或抑？
2. 各傷分之：

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

3. 排修之序：
   - 先 critical 之傷（止血）
   - 後 serious 之傷（復要功）
   - moderate 與 minor 之傷可待已排之修
4. 察傷之相互：
   - 諸傷相加乎？（A 重因 B 亦破）
   - 修一可自修他乎？（共根因）
   - 修一致他更壞乎？（修策相競）

得：諸傷之全錄依重分，附排序之修序，慮諸傷相互。

敗則：若分過久（系活衰），略詳分而專注：「最當穩之單事為何？」先修之，再返全分。

### 第二步：急穩

修之前止損漫。

1. 抑其傷：
   - 隔損件（斷器、網段、流轉）
   - 防連：禁依損件之非要功
   - 存證：留快照、存日誌、捕當前態於變前
2. 施急之補：
   - 此非永修——乃止血帶
   - 受之急法：
     - 流轉至健之副
     - 全禁損之功
     - 自備施已知行之配
     - 擴健件以納轉之載
   - 不受之急法：
     - 改碼而不試（生新傷）
     - 刪數以「重置」患（毀復選）
     - 隱損（禁警、抑誤）
3. 驗其穩：
   - 損仍漫乎？若是，抑敗——試廣隔
   - 系行乎（雖衰）？若是，進至修
   - 急補存乎？若是，有時行詳修

得：系穩（非活衰）雖衰。損已抑而不漫。證已存供根因之析。

敗則：若穩敗（雖抑而損仍漫），升至全系退：啟災復、轉至備系、或優雅衰至最少行。穩過久則自為災。

### 第三步：建修之架

立支修程之臨構。

1. 立修之境：
   - 為修勞分或複損之系
   - 確修之變可試後施於產
   - 為各修步立退計
2. 建診之基：
   - 強監於損區（立察反退）
   - 錄修程之日誌（何變、何時、何故）
   - 較之具：損前態 vs 當前 vs 修後
3. 設修之序：
   - 各傷（依分緩急之序）：
     a. 識根因（此為何破？）
     b. 修之徑（修因，非僅症）
     c. 驗之法（如何確修行）
     d. 反退之察（修破他乎？）
4. 識痕之險：
   - 壓下之修常致痕（變通、特例、技債）
   - 始即計痕之管（第五步）

得：修之境附診能、序之修計、痕險之察。

敗則：若立正修境過緩（系急需即時產變），直施變然以極律：一次一變，以可得之法試，若無助則退。

### 第四步：行漸建

系統修損，每修驗後再進。

1. 各傷（依分緩急之序）：
   a. 識根因：
      - 此為碼訛？配誤？數毀？依敗？
      - 此為深構患之症乎？
      - 修根因可解他傷乎？
   b. 施其修：
      - 修根因，非僅症
      - 若根因不能立修，施意之變通而書之
      - 修宜微——修破者，勿重構鄰
   c. 驗其修：
      - 具損之功今行乎？
      - 修過自動之試乎？
      - 系之整健改或至少未變乎？
   d. 察反退：
      - 此修破他乎？
      - 第二步之急補仍需，或可除某者？
2. 諸 critical 與 serious 之傷修後：
   - 除不再需之急補
   - 復禁之功
   - 流返常路
3. 排 moderate 與 minor 之傷之修：
   - 此入常發之流
   - 追之至畢（勿令成「受」之損）

得：critical 與 serious 之傷以驗修。急補已除。系復行。

敗則：若修嘗敗或致退，退至前態而再察。若同傷數修皆敗，損或過深不能局修——考受件需全代而非修（見 `dissolve-form`）。

### 第五步：管痕而強之

理急修時所引之變通與捷徑，強以防再。

1. 錄痕：
   - 急補成永
   - 變通未代以正修
   - 為損之邊例所加之特例
   - 禁之功未復
2. 各痕之決：
   - **除**：變通不再需（損已全修）
   - **代**：變通對實需，宜以正修施之
   - **受**：變通乃最實之長解（罕，書其故）
3. 強以防再：
   - 根因之析：此損為何發？
   - 防：何可防之？（監、試、構變）
   - 察：下次如何更速察？（警、健察）
   - 復：如何更速復？（行手、備程、自動）
4. 更免疫之記：
   - 加事故形於監警（見 `defend-colony` 之免疫記）
   - 更行手附行之修程
   - 共所學於團/組

得：痕已管（除、代、或書受）。系不獨修且勝損前韌。所學已捕為來事故。

敗則：若痕管被低排（「行矣，勿觸」），明排之。未管之痕積而終資下事故。若根因不能識，強察與復速為補之控。

## 驗

- [ ] 諸損已錄並依重分
- [ ] 急穩止損之漫
- [ ] 證存供根因之析
- [ ] critical 與 serious 之傷以驗修
- [ ] 急補於正修後已除
- [ ] 痕已錄而管（除、代、或書）
- [ ] 根因之析識防與察之改
- [ ] 系之韌勝損前

## 陷

- **修而不穩**：系活血時欲修根因。先穩後修。先止血帶後手術
- **永之急補**：成永之急法生複技債。必後續以正修
- **根因之假**：未察而假根因。多「明」因為深患之症。先察而後定修策
- **修致之損**：修而不試生新傷。每迭一驗修——勿批未試之變
- **忽痕**：「今行」非「健」。倉促修之痕為下事故之種

## 參

- `assess-form` — 損察與形察共法
- `adapt-architecture` — 損露構弱時或需構之化
- `dissolve-form` — 件損過深不能修；溶而重建
- `defend-colony` — 守觸修；事故後復返饋於守
- `shift-camouflage` — 表化可掩損而修進（慎）
- `conduct-post-mortem` — 構之事後析補根因之識
- `write-incident-runbook` — 修程宜捕為來事故之行手
