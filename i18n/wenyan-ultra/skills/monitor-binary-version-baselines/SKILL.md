---
name: monitor-binary-version-baselines
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Establish and maintain longitudinal baselines of CLI binary contents
  across versions. Covers marker selection by category (API / identity /
  config / telemetry / flag / function), weighted scoring, threshold-based
  system-presence detection, and per-version baseline records. Use when
  tracking a feature's lifecycle across releases, when probing for
  dark-launched or removed capabilities, or when verifying that a scanning
  tool itself still catches known-good markers on old binaries.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, baseline, binary-analysis, version-tracking, markers
---

# 監二進位版基線

築持版鍵之 CLI 工具二進位中特系標之比錄，以機械跨版識增、刪、暗發之能。

## 用

- 追特功於閉源 CLI 工具諸版之命周
- 探暗發（出而閉）或默刪
- 驗標掃器仍識舊二進位中之知善標（自身退化試）
- 築一期基供二三四期（旗探、暗測、線捕）用
- `grep` 答「今 X 在乎」而實需「X、Y、Z 之系跨版如何動」之諸境

## 入

- **必**：同 CLI 工具之一或多裝二進位（或解組）
- **必**：標定之工目錄檔（首行造，跨版擴）
- **可**：先行之基線檔（原處擴，勿重書）
- **可**：知未發之版列（略發、撤建）
- **可**：已追之特系列以擴非再尋

## 行

### 一：按類擇標

擇耐重建之串。取穩、語義之識——非組者下版重命之縮名。

六建類：

- **API**——端徑、工具網之露法名
- **身**——內品名、代碼名、版哨
- **配**——用面配檔之識鍵
- **遙**——析管之發事名
- **旗**——閘謂消之特閘鍵
- **函**——特處內之知串常（誤訊、記標）

避：似縮之短識（如 `_a1`、`bX`、二字後數）、隨文修必變之內字、合組者內名約者。

得：各候標含類標與短理（「現於用面文」、「跨 N 先版穩」等）。典首掃得每系 20-50 標。

敗：標於連次小版消→目錄捕重建易變串非穩識。棄之；廣至更長更語義之子串。

### 二：按特系群標

合標為一**系表**每獨進之能。「系」乃同行之標群，因共特命周（如假 `acme_widget_v3` 能之諸標）。

何故群：每系評防交污。一系標缺不抑他系識，且無關系之聚計無告。

工目錄形（偽碼）：

```
catalog:
  acme_widget_v3:
    markers:
      - { id: "acme_widget_v3_init",         category: function, weight: 10 }
      - { id: "acme.widget.v3.dialog.open",  category: telemetry, weight: 5 }
      - { id: "ACME_WIDGET_V3_DISABLE",      category: flag,     weight: 10 }
  acme_other_system:
    markers:
      - ...
```

得：各系有己標列；無標於二系。加新系即加頂入——勿溯動標於系間。

敗：標難分一系（重、含糊）→系定過粗。拆系，或受某標為「共底」而排於每系評。

### 三：按信強加權

各標賦權反其單在以證系：

- **10 = 獨診**——獨足，僅見此即足證系在（如長、系專之串無他碼徑發）
- **3-5 = 唯佐**——獨不足證，於聚評有貢（如工具於諸特復用之短遙後綴）

教約勿教具數。「診」「佐」之距勝具整數——關鍵為五之閾可分「一強信」與「諸弱信」。

得：各標有權。目錄之權偏佐標（3-5），各系有少獨診標（10）。

敗：諸標皆 10→評失分——部現之果不能。降跨多系或現於無關處之標。

### 四：記每版基線

各掃版，記**現**與**缺**標皆按版鍵。皆為證：版 N 之缺標如版 N+1 重引時亦告。

基線形：

```
baselines:
  "1.4.0":
    acme_widget_v3:
      present: ["acme_widget_v3_init", "ACME_WIDGET_V3_DISABLE"]
      absent:  ["acme.widget.v3.dialog.open"]
      score:   20
  "1.5.0":
    acme_widget_v3:
      present: ["acme_widget_v3_init", "ACME_WIDGET_V3_DISABLE", "acme.widget.v3.dialog.open"]
      absent:  []
      score:   25
  "1.4.1":
    _annotation: "never-published; skipped from upstream release timeline"
```

未發版宜明標非默略。默略似後讀者之數失。

得：各版生每追系一錄含 `present`、`absent`、`score`，或未發版之明 `_annotation`。

敗：基線掃得先在系之零標，未確二進位徑正、`strings` 出有、標 ID 確同前勿假刪。偽零污長期錄。

### 五：設全部現之閾

各系於聚評定二閘：

- **`full`**——逾此分系於本版視為**現且活**
- **`partial`**——逾此分系視為**已出未全**（部標現而下 `full`）

下 `partial` = 缺（或未在，依向）。

```
thresholds:
  acme_widget_v3:
    full:    25
    partial: 10
```

擇閾：`full` 設健裝期發之權和；`partial` 設一診標加一佐信。有諸版證後重校。

得：各掃生每系標籤之果：`full | partial | absent`。`partial` 果值察——乃暗發與刪候。

敗：諸版諸系皆 `partial`→閾過敏（或設逾標可和）。對知善活版重校。

### 六：用 `strings -n 8` 掃

`strings` 含最小長過濾為提原。`-n 8` 底過諸噪（短片、襯、地表雜）而不失意識，幾皆逾 8 字。

```bash
strings -n 8 path/to/binary > /tmp/binary-strings.txt
```

後對 `/tmp/binary-strings.txt` 行目錄匹（任行匹器：`grep -F -f markers.txt`、`ripgrep`、或小本）。

注：

- 低底（`-n 4`、`-n 6`）洪二進位垃與縮符噪；診-佐分崩
- 高底（`-n 12+`）漏短旗識與配鍵
- 某組者壓或編串；`strings` 近空→二進位需先解組（此技範外）

得：行串出 1k-100k 行，依二進位大。手察前 100 行可顯識識。

敗：出空或不識→二進位或包、加密、或為 `strings` 不能讀之碼形。停於提層治；勿由不可讀掃記基線。

### 七：前擴基線勿重書過往

新系或標加目錄時，**唯前版**為之掃。過版錄留如初書。

何故：先版基線乃彼時所掃之經驗證，非過版含何之今模。溯改之以新識標混「今知」與「彼觀」。皆有用；唯一宜於基線檔。

若真需溯掃（如試新標於版 N-3 在乎）→記為**獨補**：

```
addenda:
  "1.4.0":
    scan_date: "2026-04-15"
    catalog_revision: "v7"
    findings:
      acme_new_system:
        present: ["..."]
```

原 `baselines["1.4.0"]` 不動。讀者可見原錄與後溯掃及各目錄修。

得：基線檔單向前增；過錄唯加含可選 `addenda` 塊。目錄修版以各掃可繫所用之目錄態。

敗：若欲改過版 `present` 列直→停。改加補。改過錄失識掃器退化之能（後掃器驗之八步倚史錄不變）。

## 驗

- [ ] 目錄各標明類標（API / identity / config / telemetry / flag / function 之一）
- [ ] 各標賦於精一系；無標於二系
- [ ] 權跨真範（某 10、某 3-5）；非皆同
- [ ] 各掃版有錄含每追系之 `present`、`absent`、`score`
- [ ] 未發版明標非默略
- [ ] 各系有 `full` 與 `partial` 閾；果按之標
- [ ] `strings -n 8` 為提原（或非文二進位之記等）
- [ ] 過版錄不變於最新掃；新果於溯時居 `addenda` 塊

## 忌

- **記具果為目錄**：目錄宜述標類形非列版固字。果形之目錄速腐且為公曝最高漏險
- **捕縮識**：如 `_p3a` 或 `q9X` 各重建重命。今合，明日為噪。留語義識
- **混遙事與旗**：諸工具中名約共而角異。按類標（步一）以分類析淨
- **默略未發版**：版序中無注之隙似漏掃。明注：`_annotation: "never-published"`
- **無基線即設閾**：首掃立經驗權和；對之校閾，非預
- **目錄擴時改先版錄**：過錄為證；補乃溯掃之支模
- **信空掃出**：零標非常意「缺」。聲刪前確二進位可讀且目錄 ID 確同
- **視 `strings -n 4` 較 `-n 8` 詳**：低底加噪速於信。診標幾恆 8+ 字

## 參

- `security-audit-codebase`
- `audit-dependency-versions`
- `probe-feature-flag-state`
- `conduct-empirical-wire-capture`
- `redact-for-public-disclosure`
