---
name: probe-feature-flag-state
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  探 CLI 二進制中已名功能旗之運行狀。含四叉證協（二進制字串、活調、
  盤上狀、平台緩存）、四狀分類（LIVE / DARK / INDETERMINATE / UNKNOWN）、
  閘對事件之消歧、合取閘之處、技能替之情（旗似 DARK 然能由他途交付）。
  驗已記或推之能是否已展、審暗啟之能、或舊探結需對新二進制版更新時用之。
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, dark-launch, classification, evidence
---

# 探功能旗之狀

定已名功能旗於發行 CLI 二進制中為 LIVE、DARK、INDETERMINATE、UNKNOWN，以四叉證協配每狀聲於特定觀察。

## 用時

- 能傳、記、或推，需驗閘是否實於本會發
- 審暗啟之能——隨包發然關之碼——以負責謀整合
- 舊探結需對新二進制版更新（旗或翻、移、或入合取）
- 隨 Phase 1（`monitor-binary-version-baselines`）之標而行，需於 Phase 4 線捕前各候旗分類其展狀
- 用者見之行已變，需知為旗翻或碼變所驅

## 入

- **必要**：旗名於二進制中之形（字串字面）
- **必要**：可讀可調之 CLI 二進制或包文件
- **必要**：對工具常後端之認證會（汝己之戶；勿他人之）
- **可選**：二進制版識——強建議，使證表可對未來探之差
- **可選**：疑共閘之列（或合取參之他旗名）
- **可選**：同旗異版之舊探物，為差析

## 法

### 第一步：確旗名存於二進制（叉 A——二進制字串）

自包取候旗名以確其實為字串字面。無此，諸後叉皆探虛。

```bash
# Locate the bundle (common shapes: .js, .mjs, .bun, packaged binary)
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3   # synthetic placeholder — replace with the candidate

# Confirm the literal exists
grep -c "$FLAG" "$BUNDLE"

# Capture every line where it appears, with surrounding context for Step 2
grep -n -C 3 "$FLAG" "$BUNDLE" > /tmp/flag-context.txt
wc -l /tmp/flag-context.txt
```

察 `/tmp/flag-context.txt`，標各現為下一：

- **gate-call**——現為閘形函數之首參（`gate("$FLAG", default)`、`isEnabled("$FLAG")`、`flag("$FLAG", ...)`)
- **telemetry-call**——現為發/記/追函數之首參
- **env-var-check**——現於 `process.env.X`（或等）之查
- **string-table**——現於靜映或註冊，其角不明

得：旗字串於包中至少一現，各現皆標其呼點之角。

敗則：若 `grep -c` 返 0，旗不於此構。或入名誤（拼誤、誤名空）或旗於此版已移。重察 Phase 1 標出，再修入或分類為 `REMOVED` 而止。

### 第二步：消歧閘自事件自環境變

同字串可現為閘、遙測事件名、環境變、或皆然。分類依呼點，非字串。誤遙測名為閘致無稽推（「此閘必關」）於非閘者。

對第一步各標現：

- **gate-call** 現使此字串可入 LIVE / DARK / INDETERMINATE 之分類。記傳於閘之**默值**（`gate("$FLAG", false)` 默旗為關；`gate("$FLAG", true)` 默旗為開）。記字面默與閘函數名。
- **telemetry-call** 現**不**使字串為閘。乃他閘已過後所發之標。若*唯*有 telemetry-call 之現，字串為僅事件，終分類 `UNKNOWN`（名存而非閘）。
- **env-var-check** 現常示殺關（默開之能由環境變停）或顯選入（默關之能由環境變啟）。記極性——`if (process.env.X) { return null; }` 為殺關；`if (process.env.X) { enable(); }` 為選入。
- **string-table** 現必交叉參——察該表如何於下游消費。

得：每現皆有定呼點角與（gate-call 者）所記默值。

敗則：若 gate-call 之圍脈過縮不能讀默，擴 grep 脈絡（`-C 10`）並察全被呼者。若默仍不能定，記為 `default=?` 並降任 LIVE/DARK 結為 INDETERMINATE。

### 第三步：觀活調行（叉 B——運行探）

於汝控之認證會行工具，察閘守之能是否現。此為單最高訊之叉：包言*能*發，運行示*實*發。

擇一探動以揭閘過——常為閘所守用者見之行（具現於具列、命令旗變有效、UI 元素渲、應答中現輸出域）。

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

記三果之一：

- **觀閘過**——能現於會。分類候：`LIVE`。
- **未觀閘過**——能未現。分類候依第二步之默（默假 → `DARK`；默真 → 重察，此可疑）。
- **閘過繫於此處不能再現之特定入或脈絡**——記其條件；分類候：`INDETERMINATE`。

得：所記探動、所觀果、其指之分類候。

敗則：若探動本誤（認證敗、網不可達、誤子命令），運行叉於本輪不可用。修會或擇異探動；勿自未行之運行推 DARK。

### 第四步：察盤上狀（叉 C——配、緩、會）

多工具持閘評或覆值於盤以免重取。察此狀示工具於上次評時對旗之信。

常處（依工具調——此為形非具徑）：

```bash
# User-level config
ls ~/.config/<harness>/ 2>/dev/null
ls ~/.<harness>/ 2>/dev/null

# Per-project state
ls .<harness>/ 2>/dev/null

# Cache directories
ls ~/.cache/<harness>/ 2>/dev/null

# Search any of these for the flag name
grep -r "$FLAG" ~/.config/<harness>/ ~/.cache/<harness>/ .<harness>/ 2>/dev/null
```

記各中之徑、與旗關之值、文之末改時。新改之緩條覆二進制默為任何方向之最強證。

得：或確覆值附時戳，或確不在（無盤上狀提此旗）。

敗則：若見旗提而不能辨記值為緩之服器應、用者覆、或陳值，標待第五步（平台緩）對證而非猜。

### 第五步：察平台旗服緩（叉 D）

若工具用外功能旗服（LaunchDarkly、Statsig、GrowthBook、廠內等），本地緩之服應為當前展狀之權威。可得處察之。

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

記緩值、緩時戳、（若有）緩 TTL。平台緩言 `false` 覆二進制默 `true`；平台緩言 `true` 覆二進制默 `false`。

得：或定緩值附時戳，或確此工具無旗服緩。

敗則：若工具無旗服或汝不能尋緩，此叉無貢——可受。注「叉 D：不適」於證表；勿猜。

### 第六步：處合取閘

某能由多旗共守，必皆真：`gate("A") && gate("B") && gate("C")`。一者為 DARK 即令能 DARK，然各旗分類仍各別屬之。

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

各浮共閘字串者：

- 對該旗重第 1-5 步（各為自之探）
- 記旗別分類
- 算**能級**分類：諸合取皆 LIVE 則 LIVE；任合取為 DARK 則 DARK；若無合取為 DARK 而至少一為 INDETERMINATE 則 INDETERMINATE

得：諸合取皆識並別分類，加導之能級分類。

敗則：若謂過縮不能淨列（呼點內聯或裹），記合取為「≥1 額外閘，結構不可讀」並降能級分類為 INDETERMINATE，雖主旗似 LIVE。

### 第七步：察技能替

旗或正當為 DARK 然其欲開之用者面能可由異全支之途至——異命令、用者可呼之技、替 API。誠之發現「旗 DARK，能 LIVE 透替」常且要；漏之致關於用者實有之能之恐慌暗啟報。

對任何 DARK 或 INDETERMINATE 之候分類，問：

- 有記之用者可呼之命令、斜命、或技能達同末端用者果乎？
- 有替 API 面（異端點、異具名）返等同數乎？
- 工具發用者面之擴點（插件、自定具、鉤）使用者自組等乎？

若任一是，加 `substitution:` 注於證行記替途與其可觀（用者如何達、是否記）。

得：每 DARK / INDETERMINATE 分類皆有顯替察——或途，或顯注「未識替途」。

敗則：若疑替存而不能證途，標「疑替；未證」勝聲任一。

### 第八步：組證表並終分類

合四叉於一表。每狀聲必配支之觀；於新版重探生可差物。

| Field | Value |
|---|---|
| Flag | `acme_widget_v3` (synthetic placeholder) |
| Binary version | `<version-id>` |
| Probe date | `YYYY-MM-DD` |
| Prong A — strings | present (3 occurrences: 1 gate-call default=`false`, 2 telemetry) |
| Prong B — runtime | gate-pass not observed in capability list |
| Prong C — on-disk | no override found in `~/.config/<harness>/` |
| Prong D — platform cache | service cache absent / not applicable |
| Conjunction | none — single-gate predicate |
| Substitution | user-invokable `widget` slash command delivers equivalent UX |
| **Final state** | **DARK (capability LIVE via substitution)** |

施分類規：

- **LIVE**——本會至少一叉觀閘過，且無叉相違
- **DARK**——旗字串存、gate-call 默為 `false`、無叉觀閘過、無覆翻之
- **INDETERMINATE**——閘過繫於此探不能再現之入或脈絡、或閘默不能定、或一合取為 INDETERMINATE
- **UNKNOWN**——字串存而不為閘用（僅遙測、僅字表、僅環境變之標）

存表為探物（如 `probes/<flag>-<version>.md`）以未來探對其差。

得：完證表涵四叉、合取狀、替狀、單終分類。

敗則：若無叉產可用訊（二進制不可讀、運行不可調、盤與平台緩皆不在），勿造分類。記 `INDETERMINATE` 附因「無叉產訊」而止。

## 驗

- [ ] 證表中每狀聲皆配特定觀（無裸聲）
- [ ] 旗之 gate-call 默值已記（或顯注不可讀）
- [ ] 遙測事件之現不計為閘證
- [ ] 合取閘有旗別分類**及**能級分類
- [ ] 每 DARK / INDETERMINATE 行皆有顯替察
- [ ] 物記二進制版以未來探可差
- [ ] 欲公佈之物中無實產品名、版定識、或暗唯旗名（見 `redact-for-public-disclosure`）

## 陷

- **混遙測事件與閘**：現於 `emit("$FLAG", ...)` 之字串為標非閘。「僅遙測」之旗無展狀，當分類 UNKNOWN，非 DARK。
- **略叉 B（活調）**：靜證單（二進制言 `default=false`）非同運行證（能未現）。二進制中默假之旗或由服器覆翻為真；唯運行探示會實得。
- **漏合取**：以單現示 `default=true` 而忽圍 `&& gate("B") && gate("C")` 而分類主旗為 LIVE，致對實由 B 或 C 所閘之能之偽信 LIVE。
- **無替察而呼 DARK**：多 DARK 旗實不可達，然多者有全支之用者可呼途。替察化「警暗啟」為「誠發現」。
- **探陳二進制版**：無版印之探物無用——不能辨其反映當前狀或上季狀。常記版，並對物差未來探。
- **啟閘以證之**：翻旗以試之非此技能之部。某暗閘為安關（能未全、合規待、未畢遷）。記之；勿越。
- **捕他用者狀**：叉 C 與叉 D 察*汝己*之盤上狀與*汝己*之緩。讀他用者之緩為竊取，不於範。
- **視 INDETERMINATE 為敗**：非也——此為證部分時之誠分類。強迫 INDETERMINATE 入 LIVE 或 DARK 以使報顯決，為錯之最速途。

## 參

- `monitor-binary-version-baselines`——父指之 Phase 1；此技所建之標追供候旗庫
- `conduct-empirical-wire-capture`——Phase 4；叉 B 表面探不足時之深運行證（網捕、生命週期鉤）
- `security-audit-codebase`——暗啟碼為攻擊面考古之部；此技為該審之發現半
- `redact-for-public-disclosure`——Phase 5；定何探物可離私工區之刪訊紀律
