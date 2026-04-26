---
name: monitor-binary-version-baselines
locale: wenyan-lite
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

# 監測二進位版本基線

建立並維護版本鍵控之記錄，標記何種特徵系統存於 CLI 工具二進位中，使新增、移除及暗中發布之能力，可於各版本間機械式偵測。

## 適用時機

- 跨多版本追蹤封閉源 CLI 工具中某一特徵之生命週期
- 探測暗中發布之能力（已交付但門禁關閉）或悄然移除者
- 驗證標記掃描器於舊二進位仍能偵測已知良好標記（即掃描器自身之回歸測試）
- 建立第一階段之基底，供後續階段（旗標發現、暗發布偵測、線路捕獲）所用
- 任何臨時 `grep` 僅能答「X 今日是否存在」，但實需「由 X、Y、Z 組成之系統如何跨版本變遷」之情境

## 輸入

- **必要**：同一 CLI 工具之一或多個已安裝二進位版本（或解出之套件）
- **必要**：標記定義之工作型錄檔（首次運行時建立，跨版本擴展）
- **選擇性**：先前運行所記之基線檔（原地擴展，不可重寫）
- **選擇性**：已知從未發布之版本清單（跳過之版次、撤回之構建）
- **選擇性**：已在追蹤之特徵系統清單，以便擴展而非重新發現

## 步驟

### 步驟一：依類別擇取標記

擇選能於重建中倖存之字串。取穩定且具語意之識別符——非打包工具下次重建即會更名之最小化名稱。

六類建議：

- **API** — 端點路徑、工具網路面所暴露之方法名
- **Identity** — 內部產品名、代號、版本哨兵
- **Config** — 用戶端配置檔中所識之鍵
- **Telemetry** — 發送至分析管道之事件名
- **Flag** — 門禁謂詞所消費之特徵閘鍵
- **Function** — 處理器內所用之知名字串常量（錯誤訊息、日誌標籤）

避之：看似最小化之短識別符（如 `_a1`、`bX`、二字母接數字者）、隨任何文字修訂即變之內聯字面值、合於打包工具自身命名慣例者。

**預期：** 每候選標記皆有類別標籤與短理據（「見於用戶文件」、「於 N 個前版本穩定」等）。首輪通常每系統得 20-50 標記。

**失敗時：** 若標記跨連續次版本消失，則型錄所擷者乃重建易變之字串，而非穩定識別符。捨此項；改取更長、語意更牢之子串。

### 步驟二：依特徵系統分群

將標記捆為一**系統表**，每表對應一獨立演化之能力。所謂「系統」乃一相干之標記集，其有無共同移動，因其共享一特徵生命週期（例如，假設之 `acme_widget_v3` 能力下所有標記）。

何以分群至要：每系統獨立評分可防交叉污染。一系統之標記缺席不應抑制他系統之偵測；不相干系統間之合計亦無意義。

工作型錄之形（偽碼）：

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

**預期：** 每系統有獨立標記表；無標記同時隸於兩系統。新增系統乃增頂層條目——絕非追溯間將標記移於系統之間。

**失敗時：** 若標記難以歸於單一系統（重疊、模糊），則系統定義過粗。或拆分系統，或承認某些標記為「共享底層」並排除於每系統評分外。

### 步驟三：依信號強度為標記賦權

為每標記賦一權重，反映其單獨出現可確認系統存在之程度：

- **10 = 單獨診斷** — 唯一性足夠，發現此標記本身即可確認系統存在（如長且系統特定之字串，無他代碼路徑會發出者）
- **3-5 = 僅佐證** — 過於通用，單獨不能確認，但貢獻於合計分數（如工具於多特徵間重用之短遙測後綴）

教其慣例，非具體數字。「診斷」與「佐證」之間距比所擇之確切整數更要——關鍵在於步驟五之閾值能分辨「一強信號」與「眾弱信號」。

**預期：** 每標記皆有權重。型錄之權重分布偏向佐證標記（3-5），每系統有少數單獨診斷標記（10）。

**失敗時：** 若每標記皆權 10，則評分失辨識度——不可能有部分存在之發現。將跨多系統重複出現或於不相干處理器中出現之標記降權。

### 步驟四：記錄各版本基線

每掃描一版本，皆記錄**存**與**缺**之標記，以版本為鍵。二者皆為證：版本 N 中缺之標記，於版本 N+1 重新引入時，與存者同樣具信息量。

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

從未發布之版本得明確註記，而非默然省略。默然跳過之版本於下次讀者眼中如同資料遺失。

**預期：** 每版本對每追蹤系統皆有一記錄，含 `present`、`absent`、`score`，或對未發布者有明確 `_annotation`。

**失敗時：** 若基線掃描對先前存在之系統得零標記，勿驟斷已移除；先確認二進位路徑正確、`strings` 命令確有輸出、標記 ID 與型錄精確相符。假零會敗壞縱向記錄。

### 步驟五：設定全與部分偵測之閾值

每系統定義二門檻，套用於合計分：

- **`full`** — 分數高於此者，系統視為於此版本存在且活躍
- **`partial`** — 分數高於此者，系統視為已交付但不完整（部分標記存，但未及 `full` 閾值）

低於 `partial` = 缺席（或尚未存在，視走向而定）。

```
thresholds:
  acme_widget_v3:
    full:    25
    partial: 10
```

擇閾之法：將 `full` 設為健康安裝預期所發權重之和；將 `partial` 設為一診斷標記加一佐證信號之和。有數版本之證後再行調校。

**預期：** 每次掃描對每系統產出一標籤化發現：`full | partial | absent`。`partial` 之發現值得追究——此乃暗發布與移除之候選。

**失敗時：** 若每系統於每版本皆報 `partial`，則閾值過於敏感（恐高於標記能合計之上限）。對照已知活躍之版本重新校準。

### 步驟六：以 `strings -n 8` 掃描

以 `strings` 並設最小長度過濾為擷取原語。`-n 8` 之底限濾去多數雜訊（短片段、填充、地址表廢料），而不失有意義之識別符（後者幾乎皆長於 8 字符）。

```bash
strings -n 8 path/to/binary > /tmp/binary-strings.txt
```

而後對 `/tmp/binary-strings.txt` 執行型錄匹配（任何按行比對之工具：`grep -F -f markers.txt`、`ripgrep` 或小腳本）。

注意：

- 較低底限（`-n 4`、`-n 6`）使輸出充斥二進位廢料與最小化符號雜訊；診斷與佐證之分崩潰
- 較高底限（`-n 12+`）漏失短旗標識別符與配置鍵
- 某些打包器壓縮或編碼字串；若 `strings` 返回近乎空白，則二進位恐須先解套件（超出本技能範圍）

**預期：** 按行字串輸出 1k-100k 行不等，視二進位大小。手檢前 100 行應見可識別之識別符。

**失敗時：** 若輸出空白或不可辨，二進位恐已封裝、加密或為 `strings` 不可讀之位元組碼格式。停而於解套層解之；勿從不可讀之掃描記錄基線。

### 步驟七：向前擴展基線而不重寫舊記錄

新系統或標記入型錄時，**僅於前向版本**掃描之。舊版本記錄保留原樣。

何以然：先前版本之基線乃當時所掃之經驗證據，非當前對舊版本內容之模型。追溯重寫以新發現之標記，會將「今所知」與「彼時所觀」相混。二者皆有用；唯其一應居基線檔。

若確需追溯掃描（如測試新標記是否於版本 N-3 中存在），記為**獨立補錄**：

```
addenda:
  "1.4.0":
    scan_date: "2026-04-15"
    catalog_revision: "v7"
    findings:
      acme_new_system:
        present: ["..."]
```

原 `baselines["1.4.0"]` 條目不動。讀者可同時見原始記錄與後來之追溯掃描，連同各自之型錄修訂。

**預期：** 基線檔單調向前生長；舊記錄為僅追加，可選之補錄區塊。型錄修訂版本化，使每次掃描可繫於所用之型錄狀態。

**失敗時：** 若曾感欲直接編輯舊版本之 `present` 表，止之。改加補錄。變更舊記錄即失偵測掃描器回歸之力（後續任何掃描器驗證之第八步皆賴歷史記錄不可變）。

## 驗證

- [ ] 型錄對每標記皆有明確類別標籤（API / identity / config / telemetry / flag / function 之一）
- [ ] 每標記僅隸於一系統；無標記同時居二系統
- [ ] 權重涵蓋實際範圍（部分為 10，部分為 3-5）；權重非全相同
- [ ] 每掃描版本皆對追蹤系統有 `present`、`absent`、`score` 之記錄
- [ ] 從未發布之版本明確註記，非默然省略
- [ ] 每系統皆有 `full` 與 `partial` 閾值；發現相應標籤
- [ ] `strings -n 8` 為擷取原語（或非文本二進位之同等記錄）
- [ ] 舊版本記錄不因最新掃描而變；追溯之新發現居於補錄區塊

## 常見陷阱

- **以具體發現為型錄。** 型錄當述標記類別與形貌，非列舉版本綁定之字面值。充滿發現形之條目衰敗速，且若意外公開乃最高洩漏風險。
- **擷取最小化識別符。** 如 `_p3a` 或 `q9X` 之名於每次重建即更。今日縱合，明日即雜。守其語意有意義之識別符。
- **混淆遙測事件與特徵旗標。** 二者於多工具中共享命名慣例，然職司不同。依類別標之（步驟一），以保每類別之分析清晰。
- **默然跳過從未發布之版本。** 版本序中無註記之缺口看似漏掃。明示註之：`_annotation: "never-published"`。
- **基線資料未存即設閾值。** 首掃建立經驗權重之合；對其調校，非預先設定。
- **型錄擴展時重寫先前版本記錄。** 舊記錄為證；補錄乃支持之追溯掃描模式。
- **信任空白掃描輸出。** 零標記不總意「缺席」。先確認二進位可讀且型錄 ID 精確相符，再宣告移除。
- **視 `strings -n 4` 較 `-n 8` 為更徹底。** 較低底限增雜訊速於增信號。診斷標記基本皆 8+ 字符。

## 相關技能

- `security-audit-codebase` — 共享之紀律；二者管道皆以標記存在為發現，下游消費者不同
- `audit-dependency-versions` — 將同一版本追蹤之嚴謹擴及外部依賴清單；本技能則施於二進位構件
- `probe-feature-flag-state` — 第二、三階段之後續；消費基線以分類旗標推出狀態（live / opt-in / dark / removed）
- `conduct-empirical-wire-capture` — 第四階段之後續；以實際工具流量驗證所推之行為
- `redact-for-public-disclosure` — 第五階段之後續；管轄何發現可離私有工作空間
