---
name: monitor-binary-version-baselines
locale: wenyan
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

# 察二進文件版本基線

建並養版本對照之記，察 CLI 二進文件中各功能標記之有無，以機械之法察諸版間之增、刪、暗放。

## 用時

- 跨多版閉源 CLI 之功能生滅軌跡欲察乃用
- 暗放（已發而未啟）或暗刪之能欲探乃用
- 標記掃器於舊文件能否察已知標記欲驗（自察其器）乃用
- 第一階基底欲建（後階如旗識、暗察、線聞用之）乃用
- 凡一時之 `grep` 答「今有 X 否」不足，須察「X、Y、Z 之系統諸版間如何遷」者乃用

## 入

- **必要**：同一 CLI 一或多裝版（或解包之物）
- **必要**：標記目錄之工作文件（首次運行時建，跨版擴之）
- **可選**：先前掃描所留之基線文件（原地擴，勿改寫）
- **可選**：未發版本之名單（跳發者、撤回者）
- **可選**：已在察之功能系統列表，以擴而非重發

## 法

### 第一步：依類選標記

選經重建尚存之字串。取穩固有義之識別，勿取打包器下次必改之短名。

六類可選：

- **API** — 端路、CLI 網絡面所示之方法名
- **識別** — 內部產品名、代號、版本標識
- **配置** — 用者配置文件中可識之鍵
- **遙測** — 上報分析管道之事件名
- **旗** — 功能門所讀之鍵
- **函** — 特定處理器中所用之知名字串（錯訊、日誌標籤）

避之：似縮短之識別（如 `_a1`、`bX`、二字母加數字者）、隨文修而變之內聯字面、合打包器內部命名規則者。

**得：** 各候標記皆有類別標識與簡短依據（「見於用者文檔」「跨 N 版穩定」之屬）。常初次得每系統 20-50 標記。

**敗則：** 標記於連續小版間消失者，目錄所收乃重建即變之字串，非穩固識別。刪此類，改取更長、更具語義之子串。

### 第二步：依功能系統聚標記

每一獨立演化之能聚為一**系統表**。「系統」者，標記之有無共進退者也，蓋共一功能生滅週期（如假想之 `acme_widget_v3` 諸標記）。

聚之何要：依系統評分防混染。一系統標記之缺不可抑另一系統之察，跨無關系統之總計亦無意。

工作目錄之形（偽碼）：

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

**得：** 各系統有獨立標記列；無一標記同屬二系統。增新系統者，加新頂層條目——勿事後將標記於系統間遷。

**敗則：** 標記難歸一系統者（重疊、含混），系統定義過粗。分之，或承認某些標記為「共享底層」並將其排於系統評分之外。

### 第三步：依信號強度賦權

各標記賦一權，以示其單獨呈現足以證系統之程度：

- **10 = 單獨即診** — 獨特至此標記一見即足證系統存在（如長而系統獨有之字串，無他路徑能發）
- **3-5 = 僅佐證** — 單獨過泛，然合計則有助（如 CLI 跨功能複用之短遙測後綴）

教其法，非教其數。「診」與「佐」之差距比具體整數重——所重者，第五步之閾可分辨「一強信號」與「多弱信號」。

**得：** 各標記有權。目錄之權分布偏向佐證者（3-5），每系統有少量單獨即診者（10）。

**敗則：** 凡標記皆權 10 者，評分失辨——部分呈現之察無從。降跨系統重複出現或現於無關處理器者之權。

### 第四步：記每版基線

每版掃之，記**呈現**與**缺席**之標記，依版為鍵。二者皆證：版 N 之缺席標記，當版 N+1 復引時，與呈現者同樣有報。

基線之形：

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

未發版本明示註解，勿默略。默略之版於後人視為失據。

**得：** 各版生一記，每受察系統有 `present`、`absent`、`score`，或明示 `_annotation` 為未發。

**敗則：** 掃描得零標記於先前有者，勿即定為刪除——先驗二進路徑無誤、`strings` 命有出、標記識別與目錄完全合。假零腐蝕長記。

### 第五步：定全察與部分察之閾

每系統定二門，施於合計分：

- **`full`** — 此分以上者，系統於此版視為呈現且活
- **`partial`** — 此分以上者，系統視為已發未全（標記部分呈，然在 `full` 之下）

`partial` 以下者 = 缺席（或未至，視軌跡方向）。

```
thresholds:
  acme_widget_v3:
    full:    25
    partial: 10
```

定閾之法：`full` 設為健全裝置應發之權合；`partial` 設為一診標記加一佐證信號。得多版證據後再校。

**得：** 各掃為各系統生標籤之察：`full | partial | absent`。`partial` 者宜深察——暗放與暗刪之候選。

**敗則：** 凡系統凡版皆報 `partial` 者，閾過敏（多設高於標記和能達者）。對已知活版重校之。

### 第六步：以 `strings -n 8` 掃

以 `strings` 加最短長過濾為提取之器。`-n 8` 之底濾大半雜（短片、墊、地址表渣）而不失有義之識別，蓋識別常逾八字。

```bash
strings -n 8 path/to/binary > /tmp/binary-strings.txt
```

繼以目錄對 `/tmp/binary-strings.txt` 匹（任行向匹配器：`grep -F -f markers.txt`、`ripgrep`、或小腳本）。

警：

- 較低（`-n 4`、`-n 6`）淹輸出於二進渣與縮符雜；診與佐之分崩
- 較高（`-n 12+`）失短旗識與配置鍵
- 某些打包器壓或編字串；若 `strings` 出近空，文件或須先解包（此技之外）

**得：** 一行一字之輸出，自千行至十萬行，視文件之大。前百行手察應見可識識別。

**敗則：** 輸出空或不可識者，文件或為打包、加密、或字節碼之屬，`strings` 無能讀。止於提取層解之；勿從不可讀之掃記基線。

### 第七步：基線向前擴而不改寫舊記

新系統或新標記入目錄者，**唯掃前向版本**。舊版記如初書留之。

何以然：舊版基線者，當時所掃之經驗證據，非舊版內容之當前模型。事後以新發之標記改寫，混「今所知」與「彼時所察」。二者皆有用；唯一可居基線文件。

事後掃確需者（如察新標記是否現於 N-3 版），記為**獨立附**：

```
addenda:
  "1.4.0":
    scan_date: "2026-04-15"
    catalog_revision: "v7"
    findings:
      acme_new_system:
        present: ["..."]
```

原 `baselines["1.4.0"]` 條不動。讀者可見原記與後事後掃，連同各自目錄版本。

**得：** 基線文件單向前增；舊記僅追加，附以可選附塊。目錄版本有版識，每掃可繫於當時所用之目錄狀。

**敗則：** 若覺欲直改舊版 `present` 列，止。改加附。改舊記者失察器退化之能（後掃器驗證之第八步依賴歷史不可變）。

## 驗

- [ ] 目錄每標記皆有明示類標識（API / identity / config / telemetry / flag / function 之一）
- [ ] 每標記恰歸一系統；無同屬二系統者
- [ ] 權跨真實範圍（有 10 有 3-5）；勿全同
- [ ] 每受掃版有記，每受察系統有 `present`、`absent`、`score`
- [ ] 未發版本明示註解，勿默略
- [ ] 每系統有 `full` 與 `partial` 二閾；察依此標籤
- [ ] `strings -n 8` 為提取之器（或非文文件之等效記錄）
- [ ] 舊版記不為新掃所改；事後新發歸附塊

## 陷

- **以具體所察為目錄。** 目錄宜述標記類與形，勿列版鎖之字面。滿是察形之目錄速朽，且若誤公佈為最大泄漏之險。
- **收縮符識別。** `_p3a`、`q9X` 之屬，每重建即更名。今合明日為雜。守有義之識別。
- **混遙測事件與功能旗。** 多 CLI 中二者命名相近然功能各異。依類標之（第一步）以使依類分析清。
- **默略未發版本。** 版序之缺無註解者似漏掃。明示之：`_annotation: "never-published"`。
- **無基線數據前先設閾。** 首掃定經驗權合計；依此校閾，勿先設。
- **目錄擴時改寫舊版記。** 舊記乃證；附為事後掃之支持模式。
- **信空掃出。** 零標記不必為「缺」。先驗文件可讀、目錄識完合，再宣刪。
- **以 `strings -n 4` 較 `-n 8` 為詳。** 較低之底加雜速於信號。診標記幾必逾八字。

## 參

- `security-audit-codebase` — 共學；二管道皆視標記呈現為察，下游消費者異
- `audit-dependency-versions` — 同樣版本軌跡之嚴施於外部依賴清單；此技施於二進物
- `probe-feature-flag-state` — 第二三階後續；用基線分類旗鋪展態（live / opt-in / dark / removed）
- `conduct-empirical-wire-capture` — 第四階後續；以實際 CLI 流量驗推斷行為
- `redact-for-public-disclosure` — 第五階後續；管何察可離私域
