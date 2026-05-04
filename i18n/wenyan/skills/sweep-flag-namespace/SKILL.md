---
name: sweep-flag-namespace
description: >
  盡取二進制名空間中所有候選旗標，建提取簿冊，計每旗出現次數及調用類型，
  與已錄之集相校，歷次探勘以驗周備，至未錄之餘歸零而止。涵名空間前綴之採、
  調用點層之 gate-vs-telemetry 辨、周備之度、DEFAULT-TRUE 群之報、終了確認
  之掃。當需全錄而非抽樣，或前番波次campaign需可驗之終止條件時，
  置於 probe-feature-flag-state 之上游用之。
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: wenyan
  source_locale: en
  source_commit: 90b159ab
  translator: Julius Brussee homage — caveman
  translation_date: "2026-05-04"
---

# Sweep Flag Namespace

盡取二進制名空間中之每一旗候，分 gate 調用與 telemetry，與運行之已錄集校之，至未錄之餘歸零。`probe-feature-flag-state` 一旗一辨；此技則生其所據之錄，並驗其周備。

## 用時

- 旗探campaign行至中途，需可驗之停止條件，而非揣度旗已「足」否
- 二進制旗名空間甚大（候字數百），抽樣易漏要 gate
- 須將 DEFAULT-TRUE 與 DEFAULT-FALSE 分報——前者乃任名空間中信號最強之子集
- 多波文檔同行於一二進制，欲書之每波之周備度
- 疑前番campaign過早而止，欲以新掃確或駁之

## 入

- **必要**：可讀之二進制或 bundle 文件
- **必要**：名空間前綴（合成例：`acme_*`），辨識所究系統之旗
- **必要**：運行之文檔集——campaign 已書之旗錄
- **可選**：gate-reader 函數名（合成：`gate(...)`、`flag(...)`、`isEnabled(...)`），預備則速第二步
- **可選**：telemetry/emit 函數名，同理而反向
- **可選**：此二進制前版之掃出，以行差別析

## 法

### Step 1: Harvest All Strings Matching the Namespace Prefix

取二進制中合於前綴之每一字面，不論調用點之角色。此步求*覆*，非求類。

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

得：去重之候列，及按頻排之出現檔。次數甚高（≥10）者疑 gate 密；單次者多為 telemetry 事件名或靜態標籤。

敗則：若獨字數為零，前綴有誤（誤字、名空間界不合、調用約定異於所料）。若逾五千，前綴過寬——宜先收緊，否則簿冊不可治。

### Step 2: Disambiguate Gate Calls from Telemetry from Static Labels

同字異役。於調用點辨其役，乃簿冊可施行之由。沿用 `probe-feature-flag-state` 第二步之辨法。

每候之每次出現，類之：

- **gate-call**——字為 gate-reader 函數之首參（`gate("$FLAG", default)`、`flag("$FLAG", ...)`、`isEnabled("$FLAG")` 等）
- **telemetry-call**——字為 emit/log/track 函數之首參
- **env-var-check**——字現於 `process.env.X` 查或同類
- **static-label**——字現於登錄表、map 或注釋中，無行為之繫

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

得：每獨字一錄，形如 `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}`。gate-call 計乃可施行之欄；餘為噪濾。

敗則：若每候之 gate-call 皆零，gate-reader 之式有誤。或二進制用此正則所漏之 reader 函數，或此名空間純為 telemetry（非旗名空間）。先以 `decode-minified-js-gates` 試數候，得實際 reader 名再重行此步。

### Step 3: Build the Extraction Inventory

合每字之錄為一簿冊。CSV 或 JSONL——擇一而恆守，以利波次之差別。

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

二導出之計要焉：

- **`total_unique`**：前綴所合之每字（gate 濾前）
- **`gate_calls`**：至少一次 gate-call 之子集——此為 campaign 之工作集

得：每獨之 gate-bearing 旗一錄之檔。gate 計常為 `total_unique` 之一分（多為 5–20%），二數宜顯異。

敗則：若簿冊空，或 `gate_calls` ≈ `total_unique`，第二步之 gate-vs-telemetry 辨產無意義之分。重審 reader-name 正則。

### Step 4: Cross-Reference Against the Documented Set

周備之度賴於文檔集——campaign 於研究檔中已書之旗。校之而報其餘。

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

周備之度乃 `remaining`——歸零則文檔集已盡覆名空間中所有 gate-bearing 旗。

得：三計。campaign 初，`remaining` 宜為 `extracted` 之大分。每波削之至零。觀其軌跡以察停滯（一波反覆查已錄之旗）。

敗則：若 `documented` 逾 `extracted`，則文檔集含陳舊之條（此版已去之旗）。改用 `comm -13` 以顯廢名；下波檔中標為 REMOVED 而存之。

### Step 5: Report the DEFAULT-TRUE Population

於 gate-bearing 旗集中，分二進制默認為 `true` 與默認為 `false`（或非 boolean）者。DEFAULT-TRUE 旗於所有用者皆開而無服務器側之蓋，乃最高信號之子集。

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

旗之默認非 boolean 者（config 對象、TTL reader、async reader），以 `decode-minified-js-gates` 類其 reader 之變——其默認形異，宜別桶報之。

得：常分 10–20% DEFAULT-TRUE，80–90% DEFAULT-FALSE。極端者（≥90% TRUE 或 ≥90% FALSE）異常而宜察——或示某發布期之約（試驗皆默認開、分批推時皆默認關）。

敗則：若 DEFAULT-TRUE 與 DEFAULT-FALSE 之合不覆 gate-bearing 簿冊，餘者用非 boolean reader。以 `decode-minified-js-gates` 對其缺處類之。

### Step 6: Confirm Completion

第四步 `remaining = 0` 時，行終掃：尋名空間相合之字之 gate-call 出現，而*不在*文檔集中者。此可獲第一步漏採之旗（如字串拼接藏其字面，逃簡易 grep）。

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

以 gate-call 之得校 `/tmp/sweep-documented.txt`。若有合於文檔集外之旗，回第一步以精提取（如治動態構造）。空則 campaign 周備矣。

得：終掃返空（campaign 周備）或返微餘（常 <5 旗，多為動態構造或別 reader）。

敗則：若第四步稱 `remaining = 0` 而終掃返大餘，則第一步系統性失採。察所漏之式（動態字、異引號、別 reader 函數），以更緊之正則自第一步重行之。

## 驗

- [ ] 第一步獨字數非零，且於預期之數量級內
- [ ] 第二步生有意義之 gate-vs-telemetry 分（gate-call 數為一分，非全有或全無）
- [ ] 第三步簿冊每 gate-bearing 旗一錄，CSV 或 JSONL
- [ ] 第四步報 `total_unique`、`gate_calls`、`documented`、`remaining`——其度於 campaign 終時歸零
- [ ] 第五步 DEFAULT-TRUE 與 DEFAULT-FALSE 別報之
- [ ] 第六步終掃返空乃稱 campaign 周備
- [ ] 一切例皆用合成之 placeholder（`acme_*`、`gate(...)` 等），無實旗名或 reader 名漏入檔
- [ ] sweep 之出可與前版之 sweep 相差（同形同欄）

## 陷

- **止於樣，非掃**：campaign 至「已錄足旗」而止，未算 `remaining`，乃抽樣非掃。此技之要在可驗之終止條件
- **混 gate-bearing 與全提取**：名空間中多字非 gate。以 `total_unique` 為 campaign 分母，膨其工而抑其表觀完成率。當以 `gate_calls` 為分母
- **跨版恃單一正則**：gate-reader 函數名於主版間或變。掃新二進制始時宜重驗第二步之式
- **跳第六步**：未行終動態掃即稱 `remaining = 0` 達周備，可漏字串拼接之旗。終掃廉而捕窘
- **漏實名**：易誤將實旗名自簿冊貼入此技之例。`acme_*` placeholder 之律有由——法與所獲宜分
- **以陳舊文檔集行校**：若文檔集建於舊二進制，已去之旗顯為「已錄」而非提取，真未錄者顯為餘。先以當前二進制刷新文檔集再校

## 參

- `probe-feature-flag-state`——一旗一類（此技簿冊之下游）
- `decode-minified-js-gates`——掃中需 reader-變類時用之
- `monitor-binary-version-baselines`——版間之長時跟蹤；每基線可重掃
- `redact-for-public-disclosure`——如何發掃法而不漏簿冊本身
- `conduct-empirical-wire-capture`——以實驗驗 sweep 所揭之旗
