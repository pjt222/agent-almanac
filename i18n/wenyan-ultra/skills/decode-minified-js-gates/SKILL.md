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
  locale: wenyan-ultra
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# 解閘

讀 minified JS 中旗之 call-site 脈絡→生閘機之錄：何變體、何默、何合取、何用。`probe-feature-flag-state` 答「閘開抑閉？」，此技答先問——「閘何為？」

## 用

- `sweep-flag-namespace` 出之旗，名不能識
- binary 用一以上之閘讀函→須識某旗用何
- 閘之「默」似非布爾（`{}`、`null`、數字字面）→須解真讀者變體
- 疑為 kill-switch（倒閘）而名不能證
- predicate 以 `&&` 合多閘→須先列共閘乃可探之

## 入

- **必**：minified JS bundle（`.js`、`.mjs`、`.bun`）
- **必**：欲解之旗字串字面
- **可**：前次解出之已知讀函名單→助步二
- **可**：脈絡窗大小覆寫；默為旗前 300 字、後 200 字

## 行

### Step 1: Extract the Context Window

覓旗字串→於每出現取不對稱窗。前脈絡（旗前）藏讀函名；後脈絡（旗後）藏默值與合取。

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

速行之初掃，可用 `grep -oE` 配 Perl negative-lookbehind，一管捕同窗。

得：每出現一脈絡窗，各約 500 字。多次出現常共讀函而異於默或合取——各別察之。

敗：bundle 過巨而 `dd`-逐出現不堪（binary > 100MB 或出現繁）→改 `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` 為結構化近似。窗似亂→bundle 或為 UTF-16 或非 ASCII 分隔；用 `iconv` 或視為二進制。

### Step 2: Identify the Reader Variant

minified 閘庫常露 4–6 讀者變體，語義各異。讀函名為首兆；調簽為驗者。

變體之屬（合成名——以汝 bundle 中真 minified 識別替之）：

| Variant | Synthetic shape | Returns | Common usage |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` or `gate("flag", true)` | `boolean` | Standard on/off feature switches |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON object | Structured config (delays, allowlists, model names) |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean` (cached) | Startup-path gates before remote config arrives |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | Quick checks; no explicit default |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | Gates resolved post-bootstrap |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | Bridge/relay-channel gates with separate evaluation path |

各脈絡窗對變體 pattern 比之：

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

同旗現多變體（罕有實——啟動同步讀、bootstrap 後異步讀），則各出現別錄其變體。探之果或異。

得：每閘調出現有一變體標。掃中諸變體計→生 binary 級分布（如「60% sync boolean、30% config-object、10% TTL」）。

敗：脈絡窗無可識讀者 pattern→或非真閘調，重核 `sweep-flag-namespace` 步二之分類。窗有不在此屬之讀名→記為新變體於研究之物，斷其是否別處置。

### Step 3: Extract the Default Value

默乃讀者第二位參（truthy-only / async 變體則無）。捕字面——`false`、`true`、`null`、`0`、字串、JSON config 物。

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

config 物之默→察其 JSON 之構，鍵名常示閘之意（如 `{maxRetries: 3, timeoutMs: 5000}` 為 retry 政之 config，非功能 toggle）。

得：每出現一準確字面默。布爾無歧；config 物須人讀其構。

敗：config 物之配對大括號逾窗→增步一之後脈絡。默似變量引（如 `gate("flag", x)`）→默為運行時算，記為 DYNAMIC，以 `probe-feature-flag-state` 探真返值。

### Step 4: Detect Conjunctions and Kill Switches

多閘參於合 predicate。合取（`&&`）與倒（`!`）變閘之效用。

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

每見之合取→列其共閘旗名。其今入探之範圍——目標旗之決依共閘者，獨探目標生不全之態。

每見之倒→閘機錄中標其為 kill-switch。kill-switch 倒默之意：kill-switch 之 `default=false` 乃「默開」（`!false === true`），常閘之 `default=false` 乃「默閉」。

得：每出現有合取單（或空）與倒之布爾標。

敗：合取逾 2 共閘→predicate 繁，regex 失構。人讀脈絡窗→於閘機錄中字面記其 predicate 之形。

### Step 5: Classify the Gate's Role

合步二至四為角色之分。角色驅異探策與異整合險。

| Role | Signature | Implication |
|---|---|---|
| **Feature switch** | sync boolean, no inversion, no conjunction | Standard on/off; probe directly |
| **Config provider** | sync config-object (`fvReader`) | Read returned object; default-empty `{}` ≠ feature off |
| **Lifecycle guard** | bootstrap-aware TTL or async bootstrap | State depends on bootstrap timing; probe at multiple points |
| **Kill switch** | inverted gate, default-false | Feature on for users by default; flag flips it OFF |
| **Conjunction member** | any variant with `&&` co-gate | Cannot evaluate alone; co-gates are part of the probe scope |
| **Bridge gate** | async bridge variant | Probe must occur over the bridge channel, not the main path |

得：每閘調出現一首要角色。某旗於諸出現中現多角（如此 call-site 為 feature switch、彼為合取員）→各別錄之。

敗：角色不入此表→binary 用未錄之閘庫。以合成識別添一行，貢此變體還此技（或項目擴展），以惠後察者。

### Step 6: Produce the Gate-Mechanics Record

合每旗之發現為結構化錄。JSONL 便也，每旗為一行，易與 `sweep-flag-namespace` 錄合。

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

閘機錄入 `probe-feature-flag-state` 步二（gate-vs-event 分辨）：變體+角色+合取單→決何觀為 LIVE / DARK / INDETERMINATE 之證。

得：每旗一 JSONL 錄（或每旗-出現一錄，若同旗有異機）。錄可重——同 binary 復行此法生同錄。

敗：諸行錄異→上游某步非定。多為步一之 regex 漏取或過取。campaign 期間鎖 regex。

## 驗

- [ ] Step 1 produces one context window per flag occurrence; windows are ~500 chars
- [ ] Step 2 tags each occurrence with exactly one reader variant from the taxonomy
- [ ] Step 3 captures the exact default literal (boolean, config-object, or DYNAMIC)
- [ ] Step 4 surfaces all conjunctions and kill-switch inversions present in the windows
- [ ] Step 5 assigns one role per occurrence, drawn from the role table
- [ ] Step 6 produces a JSONL gate-mechanics record that diffs cleanly across re-runs
- [ ] All worked examples use synthetic placeholders (`acme_*`, `gate`, `fvReader`, etc.) — no real flag names, real reader names, or real config-object schemas
- [ ] The record is consumable by `probe-feature-flag-state` (same flag identifiers, compatible field names)

## 忌

- **讀「默」為「為」**：`default=true` 之閘乃「此 binary 中默開」，server 覆寫或翻之。默告基線；運探（`probe-feature-flag-state`）告態。
- **混 config 物空默與功能閉**：`fvReader("flag", {})` 默返空物——而旗 *開*（閘為 truthy）。視 `{}` 為「閉」→誤分 config-provider 為 feature switch。
- **失 kill-switch**：閘調前之 `!` 倒其意。略步四→錄言「default=false，默閉」而真為「default=false，因倒故默開」。
- **探合取之半**：predicate 為 `acme_widget_v3 && acme_user_in_cohort`，獨探 `acme_widget_v3` 得 LIVE 不證功能 live——合取或仍以 cohort 旗閉之。
- **信讀名越版**：minified 識別主版間或更。步二之屬以 *簽*（調形、返型、默位）非以名分。binary 版更→新解中重導讀名。
- **窗過窄**：200/100 之分失逾 300 字之 config 物默。300/200 或 400/300 較安；唯 bundle 巨而窗費要時乃緊之。
- **泄真讀名**：minified 讀名似亂碼（`a`、`b`、`Yc1`）→似可字面貼。仍為發現，公開方法前以合成佔位替之。

## 參

- `probe-feature-flag-state` — uses the gate-mechanics record to interpret runtime observations
- `sweep-flag-namespace` — produces the candidate flag set this skill decodes
- `monitor-binary-version-baselines` — tracks reader-name changes across binary versions; re-derive Step 2 patterns when baselines flip
- `redact-for-public-disclosure` — how to publish gate-decoding methodology without exposing real reader names or schemas
- `conduct-empirical-wire-capture` — validates the gate-mechanics record against runtime behavior
