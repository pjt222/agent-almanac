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
  locale: wenyan-ultra
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# 掃旗

盡取命名空間之旗→錄→對照已記者→驗其全。`probe-feature-flag-state` 取樣，此則盡掃，且驗其終。

## 用

- campaign 中途→需可驗終止之據，非揣測「足矣」
- 命名空間繁（候選逾百）→取樣恐失要閘
- 須分報 DEFAULT-TRUE 與 DEFAULT-FALSE
- 多波文書化→每波之終須有定量
- 疑前 campaign 早終→須掃以證之

## 入

- **必**：可讀之 binary 或 bundle
- **必**：命名空間前綴（合成例：`acme_*`）
- **必**：已記之集（campaign 至今所成之單）
- **可**：閘讀函名（`gate(...)`、`flag(...)`、`isEnabled(...)`）→助步二
- **可**：遙測/emit 函名→反向同理
- **可**：前版掃出→以資差異

## 行

### Step 1: Harvest All Strings Matching the Namespace Prefix

盡取合前綴之字串，不論其用。此步求廣，非分。

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

得：去重之候選單與按頻排序之出現檔。頻甚高（≥10）→疑為閘；單見者→多為遙測事件名或靜態標籤。

敗：唯一數為 0→前綴誤（typo、邊界錯、harness 慣不符）。逾 5000→前綴過廣，宜縮之，否則錄不可治。

### Step 2: Disambiguate Gate Calls from Telemetry from Static Labels

同字異用。於 call-site 別其用乃錄之可行所在。沿 `probe-feature-flag-state` 步二之分辨之法。

各候選，分其每出現：

- **gate-call**——字串為閘讀函首參（`gate("$FLAG", default)`、`flag("$FLAG", ...)`、`isEnabled("$FLAG")` 等）。
- **telemetry-call**——字串為 emit/log/track 函首參。
- **env-var-check**——字串現於 `process.env.X` 或同類。
- **static-label**——字串現於 registry、map、注釋而無行為掛接。

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

得：每唯一字串一錄，形如 `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}`。閘調數乃可行之列；餘為噪濾。

敗：諸候選皆無閘調→閘讀函式之 pattern 誤。或 binary 用此 regex 不及之讀函；或此空間純為遙測（非旗也）。先以 `decode-minified-js-gates` 試數候選，識真讀函名，再復此步。

### Step 3: Build the Extraction Inventory

合各字串之錄為一錄物。CSV 或 JSONL——擇一而守，以利波間 diff。

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

二派生數要：

- **`total_unique`**：前綴所中之全字串（未濾閘前）
- **`gate_calls`**：至少一閘調者之子集——campaign 之工作集

得：每閘旗一錄之檔。閘數常為 `total_unique` 之分（5–20%），二數宜顯異。

敗：錄空或 `gate_calls` ≈ `total_unique`→步二之分辨無義。重審讀函 regex。

### Step 4: Cross-Reference Against the Documented Set

完備之度依已記之集——campaign 既書之研究之物中所載之旗。對照→報所餘。

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

完備之度乃 `remaining`——歸 0 時，已記之集盡覆此空間之閘旗。

得：三數。campaign 初，`remaining` 應為 `extracted` 之大分。每波減 `remaining` 至 0。察其軌跡以識停滯（重議已記之旗者）。

敗：`documented` 逾 `extracted`→已記者含舊跡（此版已除之旗）。改用 `comm -13` 以見廢名；archive 為 REMOVED 於下波。

### Step 5: Report the DEFAULT-TRUE Population

於閘旗集中，分 binary 默 `true` 者與默 `false`（或非布爾）者。DEFAULT-TRUE 旗乃無 server 覆寫即開於諸用者，乃最高信號之子集。

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

非布爾默之旗（config 物、TTL 讀者、async 讀者），用 `decode-minified-js-gates` 分讀者變體——其默形不同，宜入別桶。

得：常分為 10–20% DEFAULT-TRUE，80–90% DEFAULT-FALSE。極端者（90%+ TRUE 或 90%+ FALSE）罕，宜察——或為發布期之慣（盡開以試、盡閉以漸推）。

敗：DEFAULT-TRUE 與 DEFAULT-FALSE 合不覆閘旗錄→餘者用非布爾讀者。對缺口運 `decode-minified-js-gates` 以分用之變體。

### Step 6: Confirm Completion

步四得 `remaining = 0` 時，行末掃：覓合命名空間而不在已記者之閘調。此捕步一所漏（如串接所隱字面）。

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

對閘調之中與 `/tmp/sweep-documented.txt` 對。若有指未記者→返步一精化（如治動構之例）。空→campaign 畢。

得：末掃返空（campaign 畢）或小餘（常 <5，多為動構或別讀者）。

敗：步四言 `remaining = 0` 而末掃返大餘→步一系統性少取。察所漏之 pattern（動字串、別引號、別讀函）→以緊 regex 自步一復行。

## 驗

- [ ] Step 1 unique count is non-zero and within an order of magnitude of expectation
- [ ] Step 2 produces a meaningful gate-vs-telemetry split (gate-call count is a fraction, not all or none, of total occurrences)
- [ ] Step 3 inventory is one record per gate-bearing flag, in CSV or JSONL
- [ ] Step 4 reports `total_unique`, `gate_calls`, `documented`, `remaining` — and the metric reaches 0 by end of campaign
- [ ] Step 5 DEFAULT-TRUE and DEFAULT-FALSE are reported separately
- [ ] Step 6 final scan returns empty before declaring the campaign complete
- [ ] All worked examples use synthetic placeholders (`acme_*`, `gate(...)`, etc.); no real flag names or reader names leaked into the artifact
- [ ] Sweep output is diff-able against a prior version's sweep (same shape, same fields)

## 忌

- **止於樣，非掃**：campaign 以「已記足矣」終而不算 `remaining` 者，乃取樣，非掃。此技之要在可驗終止之據。
- **混閘旗與全取**：空間中多字非閘。以 `total_unique` 為分母→誇工而貶完備之顯率。當以 `gate_calls` 為分母。
- **信一 regex 越版**：閘讀函名或主版間更。新 binary 之新掃，宜重驗步二之 pattern。
- **略步六**：於 `remaining = 0` 即宣畢而略動掃→失串接所構之旗。末掃廉而捕辱。
- **泄真名**：易誤貼錄中真名於技之示例。`acme_*` 之佔位之律存焉——存方法異於發現。
- **對舊已記集**：已記集若據舊 binary 而成→已除之旗似「已記」而實已不取，真未記之旗則似餘。對照前先以今 binary 更已記集。

## 參

- `probe-feature-flag-state` — per-flag classification (downstream of this skill's inventory)
- `decode-minified-js-gates` — when reader-variant classification is needed mid-sweep
- `monitor-binary-version-baselines` — longitudinal tracking across binary versions; sweeps can be re-run against each baseline
- `redact-for-public-disclosure` — how to publish methodology from a sweep without leaking the inventory itself
- `conduct-empirical-wire-capture` — empirical validation of flags surfaced by the sweep
