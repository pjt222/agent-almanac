---
name: decode-minified-js-gates
description: >
  Classify gate call variants in a minified JavaScript bundle. Covers
  context-window extraction around a flag occurrence, identification of
  4–6 reader variants (sync boolean, sync config-object, bootstrap-aware
  TTL, truthy-only, async bootstrap, async bridge), default-value
  extraction (boolean / null / numeric / config-object literal),
  conjunction detection across `&&` predicates, kill-switch inversion
  detection, and production of a gate-mechanics record that feeds probe-
  feature-flag-state. Use when a flag's behavior cannot be inferred from
  its name alone, when the binary uses multiple reader libraries, or when
  config-object gates carry structured schemas distinct from boolean
  gates.
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: wenyan-lite
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# 解讀壓縮 JS 閘調用

讀壓縮 JavaScript 包中旗標字串四周之調用點脈絡，以產一閘機制記錄：何讀者變體、何預設、何連接、何角色。`probe-feature-flag-state` 答「此閘為開為關」之問，本技能則答其前置之問——「此閘究竟為何而為」。

## 適用時機

- 由 `sweep-flag-namespace` 浮現之旗標，依其名不可分類。
- 二進位用不止一閘讀函式，須知某旗標所調者為何。
- 閘之「預設」似非布林（`{}`、`null`、數字字面），須解其實際讀者變體。
- 疑為斷路閘（反向閘）而依旗標名不可確證。
- 述詞以 `&&` 合多閘，須先列出共閘再行任一探查。

## 輸入

- **必要**：壓縮之 JavaScript 包檔（`.js`、`.mjs`、`.bun`）。
- **必要**：欲解之目標旗標字串，字面形。
- **選擇性**：先前解讀所得之已知讀函式名清單——可加速步驟二。
- **選擇性**：脈絡視窗大小覆蓋；預設為旗標出現處之前 300 字、後 200 字。

## 步驟

### 步驟一：取脈絡視窗

定旗標字串，於每一出現處取一不對稱視窗。前段（旗標之前）為讀函式名所居；後段（旗標之後）為預設值與連接所居。

```bash
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3                   # synthetic placeholder
PRE=300
POST=200

# All byte offsets where the flag string occurs
grep -boE "\"${FLAG}\"" "$BUNDLE" | cut -d: -f1 > /tmp/decode-offsets.txt
wc -l /tmp/decode-offsets.txt

# Capture an asymmetric window per occurrence
while read -r offset; do
  start=$((offset - PRE))
  [ "$start" -lt 0 ] && start=0
  length=$((PRE + POST))
  echo "=== offset $offset ==="
  dd if="$BUNDLE" bs=1 skip="$start" count="$length" 2>/dev/null
  echo
done < /tmp/decode-offsets.txt > /tmp/decode-windows.txt

less /tmp/decode-windows.txt
```

欲速行首遍，`grep -oE` 配 Perl 相容正則之負向後查可一管捕得同樣視窗。

**預期：** 每一旗標出現處得一或多脈絡視窗，各約 500 字。多次出現通常共讀函式而於預設或連接或異——當逐一獨檢。

**失敗時：** 若包過大，逐次出現行 `dd` 不勝（二進位 > 100MB 或出現甚多），改用 `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` 以求結構化輸出之近似。若視窗似有壞，包或為 UTF-16 或含非 ASCII 之分隔符；用 `iconv` 或視為二進位。

### 步驟二：辨讀者變體

壓縮之閘庫常露 4–6 讀者變體，語義各異。讀函式名為首示，調用簽名為驗者。

變體分類（合成名——以實際包中壓縮之識別符代之）：

| 變體 | 合成形 | 返回 | 常見用途 |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` or `gate("flag", true)` | `boolean` | 標準開關之功能切換 |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON 物件 | 結構化 config（延遲、白名單、模型名） |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean` (cached) | 啟動路徑之閘，遠端 config 抵達之前 |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | 速查；無顯式預設 |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | 啟動後解析之閘 |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | 橋／中繼通道閘，自有評估路徑 |

對每一脈絡視窗，配變體之模式：

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

若同旗標出多變體（罕而真有——如旗標於啟動同步讀，亦於啟動後異步讀），則各出現分記其變體。探查結果或異。

**預期：** 每一閘調用出現皆標一變體。掃覽全段中變體計數產出二進位級之分布（如「60% sync boolean、30% config-object、10% TTL」）。

**失敗時：** 若脈絡視窗無可辨之讀者模式，則此旗標或非真為閘調用——重核 `sweep-flag-namespace` 步驟二之調用點分類。若視窗中讀者名不在此分類中，於研究工件中文檔為新變體，並判其應否獨成一處理路徑。

### 步驟三：取預設值

預設為讀者之第二位置參數（truthy-only 與 async 變體則無）。捕其字面之確——`false`、`true`、`null`、`0`、字串、或 JSON config 物件。

```bash
# Boolean default extraction (sync boolean and TTL variants)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*(true|false)' /tmp/decode-windows.txt

# Config-object default — match the opening brace and capture until the
# matching brace at the same nesting depth. For minified bundles this is
# usually safe with a non-greedy match because objects rarely span lines.
grep -oE 'fvReader\("acme_widget_v3",\s*\{[^}]*\}' /tmp/decode-windows.txt

# Numeric default (rare but real for TTL or threshold gates)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*[0-9]+' /tmp/decode-windows.txt
```

對 config 物件預設，當察其 JSON 結構——鍵常暗示閘之用（如 `{maxRetries: 3, timeoutMs: 5000}` 為重試策略 config，非功能切換）。

**預期：** 每一出現得一字面之確預設。布林之意明；config 物件須手讀其結構。

**失敗時：** 若 config 物件之配對大括號落於脈絡視窗之外，於步驟一加大後段大小。若預設似為變數引用（如 `gate("flag", x)`），則預設於執行期計算——標其為 DYNAMIC，並以 `probe-feature-flag-state` 探實際所返之值。

### 步驟四：察連接與斷路開關

多閘參與複合述詞。連接（`&&`）與反向（`!`）變閘之有效角色。

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

對所察之每一連接，列其共閘之旗標名。其今為探查範圍之一部——若目標旗標之求值賴乎共閘，則孤探目標將產不全之狀。

對所察之每一反向，於閘機制記錄中標旗標為斷路開關。斷路開關翻預設之意：斷路開關之 `default=false` 乃「預設功能開」（蓋 `!false === true`），而尋常閘之 `default=false` 乃「預設功能關」。

**預期：** 每一出現得一連接清單（或空）與一反向旗標（布林）。

**失敗時：** 若連接含逾 2 共閘，述詞已複雜至正則漏其結構。手讀脈絡視窗，於閘機制記錄中逐字文檔其述詞之形。

### 步驟五：分閘之角色

合步驟二至四為一角色分類。角色驅不同之探查策略與不同之整合風險。

| 角色 | 簽名 | 含義 |
|---|---|---|
| **Feature switch** | sync boolean，無反向、無連接 | 標準開關；可直探 |
| **Config provider** | sync config-object（`fvReader`） | 讀所返物件；空預設 `{}` ≠ 功能關 |
| **Lifecycle guard** | bootstrap-aware TTL 或 async bootstrap | 狀態賴乎啟動時序；於多點探查 |
| **Kill switch** | 反向閘，預設為 false | 用戶側預設功能開；旗標翻其 OFF |
| **Conjunction member** | 任一變體配 `&&` 共閘 | 不可孤評；共閘為探查範圍之一部 |
| **Bridge gate** | async bridge 變體 | 探查須經橋通道，非主路 |

**預期：** 每一閘調用出現恰得一主角色。某些旗標跨出現顯多角色（如此調用點為 feature switch、彼調用點為 conjunction member）——當各記其角色。

**失敗時：** 若角色不入此表，則二進位用本技能尚未文檔之閘庫。以合成識別符添一行，將此變體回饋於本技能（或項目擴展）以助後來之查者。

### 步驟六：產閘機制記錄

合各旗標之發現為一結構化記錄。JSONL 為便，蓋每一旗標一行，易與 `sweep-flag-namespace` 庫存合併。

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

閘機制記錄餵 `probe-feature-flag-state` 步驟二（閘對事件之消歧）：變體 + 角色 + 連接清單決何觀察當算為 LIVE / DARK / INDETERMINATE 狀態之證。

**預期：** 每一旗標一 JSONL 記錄（或一旗標含多異機制時，每一旗標出現一條）。記錄可重——對同一二進位再行此程，產同一記錄。

**失敗時：** 若記錄跨次運行有異，則上游某步非確定。多為步驟一之正則漏取或超取出現。役期間鎖正則。

## 驗證

- [ ] 步驟一為每一旗標出現產一脈絡視窗；視窗約 500 字。
- [ ] 步驟二為每一出現恰標分類中之一讀者變體。
- [ ] 步驟三捕字面之確預設（布林、config 物件、或 DYNAMIC）。
- [ ] 步驟四浮現視窗中所有連接與斷路反向。
- [ ] 步驟五為每一出現自角色表中派一角色。
- [ ] 步驟六產一 JSONL 閘機制記錄，跨次運行可清 diff。
- [ ] 諸示例皆用合成占位符（`acme_*`、`gate`、`fvReader` 等）——無實旗標名、實讀者名或實 config 物件 schema。
- [ ] 記錄可由 `probe-feature-flag-state` 消費（同旗標識別符、相容之欄位名）。

## 常見陷阱

- **讀「預設」為「行為」**：`default=true` 之閘於*此二進位中*為預設開，然服務端覆蓋或翻之。預設言基線；執行期之探查（`probe-feature-flag-state`）言狀態。
- **混 config 物件空預設與功能關**：`fvReader("flag", {})` 之預設返空物件——然旗標為*開*（閘求值為 truthy）。視 `{}` 為「關」，乃將 config 提供者誤分為功能切換。
- **漏斷路開關**：閘調用之前一 `!` 反其意。跳步驟四，記錄將言「default=false，預設功能關」，而真為「default=false，因反向故預設功能開」。
- **探連接之半**：若述詞為 `acme_widget_v3 && acme_user_in_cohort`，孤探 `acme_widget_v3` 而見其 LIVE 不足以言功能在用——連接或仍由群組旗標將其關。
- **跨版信讀者名**：壓縮之識別符於主版間或更。步驟二之分類以*簽名*（調用形、返回類型、預設位置）為據，非以名為據。二進位版改時，當自新解讀以重得讀者名。
- **視窗過窄**：200/100 之分漏跨 300+ 字之 config 物件預設。300/200 或 400/300 為穩；唯包極大且視窗成本要時方收緊。
- **泄漏實讀者名**：壓縮之讀者名常如無義（`a`、`b`、`Yc1`），易令人逐字貼入。然其仍為發現——發布方法之前，當以合成占位符代之。

## 相關技能

- `probe-feature-flag-state` —— 用閘機制記錄以解執行期之觀察
- `sweep-flag-namespace` —— 產本技能所解讀之候選旗標集
- `monitor-binary-version-baselines` —— 跨二進位版本追蹤讀者名變更；基線翻時，當重得步驟二之模式
- `redact-for-public-disclosure` —— 如何發布閘解讀之方法而不露實讀者名或 schema
- `conduct-empirical-wire-capture` —— 對閘機制記錄行執行期行為之驗證
