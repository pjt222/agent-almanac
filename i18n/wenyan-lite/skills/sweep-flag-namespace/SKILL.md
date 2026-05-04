---
name: sweep-flag-namespace
description: >
  Bulk-extract every candidate flag from a binary namespace, build an
  extraction inventory with occurrence counts and call-type tags, cross-
  reference against a documented set, and track completeness across probe
  campaigns until the undocumented remainder reaches zero. Covers namespace
  prefix harvesting, gate-vs-telemetry disambiguation at the call-site
  level, completeness metrics, DEFAULT-TRUE population reporting, and a
  final completion confirmation scan. Use upstream of probe-feature-flag-
  state when you need a complete catalog rather than a sample, or when a
  prior wave-based campaign needs a verifiable end condition.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: wenyan-lite
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# 旗標命名空間掃覽

自二進位之命名空間中窮舉每一旗標候選，分閘調用與遙測兩類，並對照既有之文檔集追蹤完整度，直至未文檔之餘額為零。`probe-feature-flag-state` 一次判別一旗標，本技能則產生其賴以為據之目錄——並確認目錄已完。

## 適用時機

- 旗標發現之役進行半途，須一可驗證之終止條件，而非揣度旗標已「足」與否。
- 二進位之旗標命名空間龐大（數百候選字串），抽樣之法恐漏要閘。
- 須將 DEFAULT-TRUE 旗標與 DEFAULT-FALSE 分報——前者通常為命名空間中高訊號之子集。
- 對二進位行多波文檔，欲將每波之完成度量明文記錄。
- 疑前役早終，欲以新一輪掃覽證實或反駁。

## 輸入

- **必要**：可讀之二進位或包檔。
- **必要**：命名空間前綴（合成例：`acme_*`），標識所研系統之旗標。
- **必要**：作業中之文檔集——即此役至今所產之旗標寫作清單。
- **選擇性**：閘讀函式之名（合成：`gate(...)`、`flag(...)`、`isEnabled(...)`）——預先計算可加速步驟二。
- **選擇性**：遙測或發送函式之名——同理，反向。
- **選擇性**：此二進位早版之掃覽輸出，供差分析之用。

## 步驟

### 步驟一：拾取所有合命名空間前綴之字串

提取二進位中合命名空間前綴之每一字面，不論其調用點角色為何。此步之旨在*覆蓋*而非分類。

```bash
BUNDLE=/path/to/cli/bundle.js
PREFIX=acme_                       # synthetic placeholder

# Pull every quoted string starting with the prefix
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort -u > /tmp/sweep-candidates.txt
wc -l /tmp/sweep-candidates.txt    # unique candidate count

# Per-string occurrence count (gives a first hint at gate-call density)
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort | uniq -c | sort -rn > /tmp/sweep-occurrences.txt
head /tmp/sweep-occurrences.txt
```

**預期：** 一去重之候選清單，並一按頻率排序之出現檔。極高計數（≥10）暗示閘重之字串；單次出現者更可能為遙測事件名或靜態標籤。

**失敗時：** 若獨立計數為 0，則前綴有誤（拼寫、命名空間界錯、harness 用約定異於所期）。若計數逾約 5000，則前綴過寬——須先收緊，否則庫存難管。

### 步驟二：分閘調用、遙測、與靜態標籤

同字串而異角色。於調用點區別其角色，正使庫存可資操作。重用 `probe-feature-flag-state` 步驟二之消歧之法。

對每一候選，逐一出現分類其為：

- **gate-call** —— 字串為閘讀函式之首參數（`gate("$FLAG", default)`、`flag("$FLAG", ...)`、`isEnabled("$FLAG")` 等）。
- **telemetry-call** —— 字串為 emit/log/track 函式之首參數。
- **env-var-check** —— 字串出現於 `process.env.X` 查找或同等。
- **static-label** —— 字串出現於登錄、映射或註釋中而無行為勾掛。

```bash
# Count gate-call occurrences for the candidate set, using a synthetic
# reader-name pattern. Adapt the regex to the actual reader names found.
GATE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_'
grep -coE "$GATE_PATTERN" "$BUNDLE"

# Per-flag gate-call count
while read -r flag; do
  flag_no_quotes="${flag//\"/}"
  count=$(grep -coE "(gate|flag|isEnabled)\(\s*\"${flag_no_quotes}\"" "$BUNDLE")
  echo -e "${flag_no_quotes}\t${count}"
done < /tmp/sweep-candidates.txt > /tmp/sweep-gate-counts.tsv
```

**預期：** 每一獨立字串得一庫存記錄，形如 `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}`。閘調用計數為可操作之欄；其餘為噪聲過濾。

**失敗時：** 若每一候選之閘調用命中皆為零，則閘讀模式有誤。或二進位用此正則所漏之讀函式，或此命名空間純屬遙測（根本非旗標命名空間）。先於數候選上行 `decode-minified-js-gates` 以習得實際之讀函式名，再重行此步。

### 步驟三：構建提取庫存

將各字串記錄合併為一庫存工件。CSV 或 JSONL——擇一而後波之間之 diff 一以貫之。

```bash
# JSONL inventory
{
  while IFS=$'\t' read -r flag gate_count; do
    [ "$gate_count" -gt 0 ] || continue   # skip strings with no gate-call evidence
    total=$(grep -c "\"${flag}\"" "$BUNDLE")
    telem=$((total - gate_count))         # rough; refine if other call types matter
    printf '{"flag":"%s","total":%d,"gate_calls":%d,"telemetry":%d,"documented":false}\n' \
      "$flag" "$total" "$gate_count" "$telem"
  done < /tmp/sweep-gate-counts.tsv
} > /tmp/sweep-inventory.jsonl

wc -l /tmp/sweep-inventory.jsonl    # gate-bearing flag count
```

兩衍生計數要：

- **`total_unique`**：前綴所中之每一字串（閘過濾之前）
- **`gate_calls`**：其中至少有一閘調用出現之子集——此即此役之作業集

**預期：** 一庫存檔，每一帶閘之獨立旗標一條記錄。閘計數通常為 `total_unique` 之一小部分（多見 5–20%），故二數應顯有差異。

**失敗時：** 若庫存為空或 `gate_calls` ≈ `total_unique`，則步驟二之閘對遙測之消歧產出無謂之分。重審讀函式名之正則。

### 步驟四：對照文檔集

完整度量賴乎文檔集——即此役已於研究工件中寫作之旗標。先對照，再報所餘。

```bash
DOCUMENTED=/path/to/research/documented-flags.txt   # one flag name per line

# Extract gate-bearing flag names from the inventory
jq -r '.flag' /tmp/sweep-inventory.jsonl | sort -u > /tmp/sweep-extracted.txt

# Compute the documented and remaining sets
sort -u "$DOCUMENTED" > /tmp/sweep-documented.txt
comm -23 /tmp/sweep-extracted.txt /tmp/sweep-documented.txt > /tmp/sweep-remaining.txt

echo "Extracted (gate-bearing):  $(wc -l < /tmp/sweep-extracted.txt)"
echo "Documented:                $(wc -l < /tmp/sweep-documented.txt)"
echo "Remaining (undocumented):  $(wc -l < /tmp/sweep-remaining.txt)"
```

完整度量即 `remaining`——此數歸零時，文檔集已覆命名空間中每一帶閘之旗標。

**預期：** 三計數。役之初，`remaining` 應為 `extracted` 之相當部分。每波遞減 `remaining`，直至收斂於 0。跨波追蹤其軌跡以察停滯（一波卡住，反覆查既已文檔之旗標）。

**失敗時：** 若 `documented` 逾 `extracted`，則文檔集中含陳舊條目（此版二進位中已移除之旗標）。改算 `comm -13` 以浮現過時之文檔名，於下一役工件中歸 REMOVED。

### 步驟五：報 DEFAULT-TRUE 之數

於帶閘之旗標集中，將二進位預設為 `true` 者與預設為 `false`（或非布林）者分開。DEFAULT-TRUE 旗標於無服務端覆蓋時對所有用戶為開，故為命名空間中訊號最高之子集。

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

對非布林預設之旗標（config 物件、TTL 讀者、async 讀者），用 `decode-minified-js-gates` 以分讀者變體——此類產出不同形之預設，宜各自為桶。

**預期：** 典型分布為 DEFAULT-TRUE 10–20%、DEFAULT-FALSE 80–90%。若極端（90%+ TRUE 或 90%+ FALSE）為異常，值得考察——或暗示某發布階段之約定（測試期皆預設開、分階段推出期皆預設關）。

**失敗時：** 若 DEFAULT-TRUE 與 DEFAULT-FALSE 計數合不蓋帶閘庫存，則餘者用非布林讀者。對此缺口行 `decode-minified-js-gates` 以分所用讀者變體。

### 步驟六：確認完成

由步驟四 `remaining = 0` 時，再行終掃：搜命名空間所中之字串之閘調用出現，凡不在文檔集中者皆查。此可捕步驟一拾取所漏之旗標（如字串拼接致字面隱於樸素 grep）。

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

將閘調用命中與 `/tmp/sweep-documented.txt` 對照。若有任一命中指文檔集外之旗標，回步驟一以更精提取（例如處理動態構造之況）。若空：此役完。

**預期：** 終掃返回或空（役完）或一小餘額（多 <5 旗標，常為動態構造或替代讀者所致）。

**失敗時：** 若步驟四言 `remaining = 0` 而終掃返回大餘額，則步驟一系統性提取不足。考察所漏之模式（動態字串、替代引號字、替代讀函式），以更緊之正則自步驟一重行。

## 驗證

- [ ] 步驟一之獨立計數為非零，且於所期之數量級內。
- [ ] 步驟二產出有意義之閘對遙測之分（閘調用計數為總出現之一部，非盡有或盡無）。
- [ ] 步驟三庫存為每一帶閘之旗標一條記錄，CSV 或 JSONL。
- [ ] 步驟四報 `total_unique`、`gate_calls`、`documented`、`remaining`——役終時度量歸 0。
- [ ] 步驟五分報 DEFAULT-TRUE 與 DEFAULT-FALSE。
- [ ] 步驟六之終掃返回為空，方宣役完。
- [ ] 諸示例皆用合成占位符（`acme_*`、`gate(...)` 等）；實旗標名與實讀者名未泄入工件。
- [ ] 掃覽輸出可與前版掃覽 diff（同形、同欄）。

## 常見陷阱

- **止於抽樣，非掃**：一役止於「我們已文檔了夠多旗標」而不算 `remaining`，此乃抽樣，非掃。本技能之全旨即在可驗證之終止條件。
- **混帶閘與全部所提取**：命名空間中多數字串非閘。以 `total_unique` 為役之分母，膨脹工作量而壓低表面完成率。當以 `gate_calls` 為分母。
- **跨版信一正則**：閘讀函式名於主版間或更替。對新二進位行新掃時，當重驗步驟二之模式。
- **跳步驟六**：止於 `remaining = 0` 而不行終動態掃，可漏由字串拼接構成之旗標。終掃廉而能免顯失。
- **泄漏實名**：易誤將庫存中真旗標名貼入技能之示例。占位符之紀（`acme_*`）正為此而設——當令方法與發現分明。
- **對照陳舊文檔集**：若文檔集成於舊二進位，已移除之旗標將顯為「已文檔」而不再被提取，而真未文檔之旗標卻顯為餘。對照之前，當以當前二進位刷新文檔集。

## 相關技能

- `probe-feature-flag-state` —— 逐旗標之分類（本技能庫存之下游）
- `decode-minified-js-gates` —— 掃中需讀者變體分類時用
- `monitor-binary-version-baselines` —— 跨二進位版本之縱向追蹤；可對各基線重行掃覽
- `redact-for-public-disclosure` —— 如何發布掃覽方法而不泄庫存本身
- `conduct-empirical-wire-capture` —— 對掃所浮現旗標之經驗驗證
