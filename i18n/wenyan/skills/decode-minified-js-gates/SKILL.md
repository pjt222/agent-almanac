---
name: decode-minified-js-gates
description: >
  類 minified JavaScript bundle 中之 gate 調用變體。涵旗出現處之脈絡窗提取、
  4–6 種 reader 變體之辨（sync boolean、sync config-object、bootstrap-aware
  TTL、truthy-only、async bootstrap、async bridge）、默認值之取
  （boolean/null/數值/config-object 字面）、`&&` 述語間之 conjunction 偵、
  kill-switch 反置之偵、及 gate-mechanics 錄之生（饋 probe-feature-flag-state）。
  旗行為不可由名而推、二進制用多 reader 庫、config-object gate 載結構之
  schema 異於 boolean gate 時用之。
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: wenyan
  source_locale: en
  source_commit: 90b159ab
  translator: Julius Brussee homage — caveman
  translation_date: "2026-05-04"
---

# Decode Minified JS Gates

讀 minified JavaScript bundle 中旗字周之調用脈絡，生 gate-mechanics 錄：何 reader 變、何默認、何 conjunction、何役。`probe-feature-flag-state` 答「此 gate 開或關」；此技則答其前提——「此 gate 究行何事」。

## 用時

- `sweep-flag-namespace` 所揭之旗，名不足以類者
- 二進制用 gate-reader 函數逾一，須知某旗呼何者
- gate 之「默認」現非 boolean（`{}`、`null`、數值字面），須解其實 reader 變
- 疑 kill-switch（反置之 gate），而旗名不足以確
- 述語以 `&&` 合多 gate，須先列其共 gate 再探之

## 入

- **必要**：minified JavaScript bundle 文件（`.js`、`.mjs`、`.bun`）
- **必要**：欲解之目標旗字，字面形
- **可選**：前番 decode 已知之 reader 函數名列，速第二步
- **可選**：脈絡窗大小之改；默旗出現處之前 300 字、後 200 字

## 法

### Step 1: Extract the Context Window

定旗字之位，每出現處取不對稱窗。前脈絡（旗前）藏 reader 函數名；後脈絡（旗後）藏默認值與 conjunction。

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

速首掃，可以 `grep -oE` 配 Perl-相容之負向後顧正則，一管收同窗。

得：每旗出現處一或多脈絡窗，各約 500 字。多次出現常共 reader 函數，而默認或 conjunction 或異——各審之。

敗則：若 bundle 過大不堪逐次 `dd`（>100MB 或出現次甚多），改 `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` 為結構輸出之近。窗似損者，bundle 或為 UTF-16 或有非 ASCII 之分隔；以 `iconv` 或視作二進制處之。

### Step 2: Identify the Reader Variant

minified gate 庫常出 4–6 種 reader 變，各語義異。reader 函數名為首示，調用簽名乃驗者。

變之分類（合成名——以 bundle 中實 minified 識別符代之）：

| Variant | Synthetic shape | Returns | Common usage |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` or `gate("flag", true)` | `boolean` | Standard on/off feature switches |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON object | Structured config (delays, allowlists, model names) |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean` (cached) | Startup-path gates before remote config arrives |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | Quick checks; no explicit default |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | Gates resolved post-bootstrap |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | Bridge/relay-channel gates with separate evaluation path |

每脈絡窗合於變之式：

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

同旗現多變者（罕而實有——一旗於啟動時 sync 讀，bootstrap 後又 async 讀），別錄每出現之變。探結果或異。

得：每 gate-call 出現皆繫一變。掃中各變之計成二進制層之分布（如「60% sync boolean、30% config-object、10% TTL」）。

敗則：脈絡窗無可識之 reader 式者，旗或本未被 gate 調用——重審 `sweep-flag-namespace` 第二步之調用點類。窗有此分類外之 reader 名者，於研究檔中錄為新變，斟酌其是否須別處之徑。

### Step 3: Extract the Default Value

默認乃 reader 之第二位置參（truthy-only/async 變則無）。取其精字面——`false`、`true`、`null`、`0`、字串或 JSON config 對象。

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

config-object 默認者，察其 JSON 結構——鍵常示 gate 之意（如 `{maxRetries: 3, timeoutMs: 5000}` 為重試-策略 config，非 feature toggle）。

得：每出現一精字面默認。boolean 無歧；config-object 須手讀其結構。

敗則：config-object 之配對大括號落於脈絡窗外者，於第一步增後脈絡之大。默認似為變參（如 `gate("flag", x)`）者，其默認運行時始算——標為 DYNAMIC，以 `probe-feature-flag-state` 探實返之值。

### Step 4: Detect Conjunctions and Kill Switches

多 gate 入合述語。conjunction（`&&`）與反置（`!`）變 gate 之實役。

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

每偵得之 conjunction，列其共 gate 旗名。其入探之範——若目標旗之求值賴於共 gate，獨探目標生不全之態。

每偵得之反置，於 gate-mechanics 錄中標旗為 kill switch。kill switch 翻默認之意：`default=false` 之 kill switch 乃「默認 feature 開」（因 `!false === true`），而正 gate 之 `default=false` 乃「默認 feature 關」。

得：每出現一 conjunction 列（或空）及一反置標（boolean）。

敗則：conjunction 含逾二共 gate 者，述語繁過正則所及。手讀脈絡窗，於 gate-mechanics 錄中字面錄其述語形。

### Step 5: Classify the Gate's Role

合第二至四步為一役類。役驅異探策與異整合險。

| Role | Signature | Implication |
|---|---|---|
| **Feature switch** | sync boolean, no inversion, no conjunction | Standard on/off; probe directly |
| **Config provider** | sync config-object (`fvReader`) | Read returned object; default-empty `{}` ≠ feature off |
| **Lifecycle guard** | bootstrap-aware TTL or async bootstrap | State depends on bootstrap timing; probe at multiple points |
| **Kill switch** | inverted gate, default-false | Feature on for users by default; flag flips it OFF |
| **Conjunction member** | any variant with `&&` co-gate | Cannot evaluate alone; co-gates are part of the probe scope |
| **Bridge gate** | async bridge variant | Probe must occur over the bridge channel, not the main path |

得：每 gate-call 出現恰一主役。某旗於各出現現多役者（如某調用點為 feature switch，另一為 conjunction member）——各役別錄之。

敗則：役不合於表者，二進制用此技未錄之 gate 庫。以合成識別符添一行，以此變回饋此技（或項目專屬之擴）以利後察者。

### Step 6: Produce the Gate-Mechanics Record

合每旗之得為結構化錄。JSONL 便焉，每旗一行，易與 `sweep-flag-namespace` 簿冊合。

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

gate-mechanics 錄饋 `probe-feature-flag-state` 第二步（gate-vs-event 辨）：變+役+conjunction 列定何觀為 LIVE/DARK/INDETERMINATE 態之證。

得：每旗一 JSONL 錄（或同旗多異機者每出現一錄）。錄可重——同二進制再行此法，得同錄。

敗則：錄於各次行間異者，上游某步非定。多為第一步正則漏或過配。campaign 行間鎖正則。

## 驗

- [ ] 第一步每旗出現一脈絡窗；窗約 500 字
- [ ] 第二步每出現繫恰一 reader 變，自分類中
- [ ] 第三步取精默認字面（boolean、config-object 或 DYNAMIC）
- [ ] 第四步揭窗中所有 conjunction 與 kill-switch 反置
- [ ] 第五步每出現繫一役，自役表中
- [ ] 第六步生 JSONL gate-mechanics 錄，跨次行差別清
- [ ] 一切例皆用合成 placeholder（`acme_*`、`gate`、`fvReader` 等）——無實旗名、實 reader 名或實 config-object schema
- [ ] 錄可為 `probe-feature-flag-state` 所食（同旗識別符、相容欄名）

## 陷

- **以「默認」讀為「行為」**：`default=true` 之 gate 於*此二進制*默認開，而服務器側之蓋或翻之。默認言基線；運行時探（`probe-feature-flag-state`）言實態
- **混 config-object 空默認與 feature 關**：`fvReader("flag", {})` 默認返空對象——而旗*開*（gate 求值為 truthy）。視 `{}` 為「關」乃誤類 config-provider 為 feature switch
- **漏 kill switch**：gate-call 前領之 `!` 翻其義。跳第四步生「`default=false`，默認 feature 關」之錄，而實乃「`default=false`，因反置而默認 feature *開*」
- **探 conjunction 之半**：若述語為 `acme_widget_v3 && acme_user_in_cohort`，獨探 `acme_widget_v3` 而得 LIVE，未必 feature 真活——conjunction 或仍由 cohort 旗閉之
- **跨版恃 reader 名**：minified 識別符於主版間或變。第二步之分類乃按*簽名*（調用形、返類、默認位），非按名。版易則自新 decode 重得 reader 名
- **窗過窄**：200/100 之分漏 config-object 默認 300+ 字者。300/200 或 400/300 較安；唯 bundle 巨而窗代價要時始收
- **漏實 reader 名**：minified reader 名似無意（`a`、`b`、`Yc1`），易視為可貼。其仍為所獲——發法前以合成 placeholder 代之

## 參

- `probe-feature-flag-state`——用 gate-mechanics 錄解運行時觀
- `sweep-flag-namespace`——生此技所解之候旗集
- `monitor-binary-version-baselines`——跨版跟 reader 名之變；基線翻則重導第二步之式
- `redact-for-public-disclosure`——如何發 gate-decoding 法而不露實 reader 名或 schema
- `conduct-empirical-wire-capture`——以運行時行為驗 gate-mechanics 錄
