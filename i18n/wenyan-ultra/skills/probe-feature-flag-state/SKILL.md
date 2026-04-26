---
name: probe-feature-flag-state
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Probe the runtime state of a named feature flag in a CLI binary. Covers
  the four-pronged evidence protocol (binary strings, live invocation,
  on-disk state, platform cache), the four-state classification (LIVE /
  DARK / INDETERMINATE / UNKNOWN), gate-vs-event disambiguation,
  conjunction-gate handling, and skill-substitution scenarios where a
  flag appears DARK but the capability is delivered by other means. Use
  when verifying whether a documented or inferred capability has rolled
  out, when auditing dark-launched features, or when a prior probe's
  conclusions need refreshing against a new binary version.
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

# 探功旗態

定 CLI 二進中之名功旗為 LIVE、DARK、INDETERMINATE 或 UNKNOWN，用四叉據則：每態主配特察。

## 用

- 能傳、文或推、需驗閘為當會發否→用
- 審暗發功——碼於包而閉——以負責計合→用
- 前探結對新版需更（旗或翻、除、合於合取）→用
- 隨 Phase 1 (`monitor-binary-version-baselines`) 標、需於入 Phase 4 線捕前各候旗發態歸→用
- 用見行變、需知為旗翻或碼變致之→用

## 入

- **必**：旗名如於二進（字面式）
- **必**：CLI 二進或包檔可讀、可呼
- **必**：對架常後之認會（己戶；勿他戶）
- **可**：二進版識——強薦使據表可對未來探差
- **可**：疑共閘列（恐合取與此者之他旗）
- **可**：同旗異版前探物為差析

## 行

### 一：確旗名於二進中（叉 A——二進字串）

自包出候旗名以確其為字面存。無此、後諸叉皆探虛。

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

察 `/tmp/flag-context.txt` 標各為下之一：

- **gate-call**——為閘形函首參（`gate("$FLAG", default)`、`isEnabled("$FLAG")`、`flag("$FLAG", ...)`）
- **telemetry-call**——為發/錄/追函首參
- **env-var-check**——於 `process.env.X`（或等）查
- **string-table**——於靜映或庫、用未明

得：包中至少一旗串、各標其呼點職。

敗：`grep -c` 返 0→旗不於此建。入名誤（拼、命名）或旗於此版除。重察 Phase 1 標出、後或正入或歸 `REMOVED` 而止。

### 二：別閘異於事異於環變

同串可為閘、遙標事、環變或皆。歸依呼點、非串。誤遙名為閘生謬理（「此閘必閉」）於非閘者。

各步一之標項：

- **gate-call** 項使此串可入 LIVE/DARK/INDETERMINATE 歸。記閘所傳**默值**（`gate("$FLAG", false)` 默為閉；`gate("$FLAG", true)` 默為開）。記面默與閘函名
- **telemetry-call** 項**不**使此串為閘。為他閘已過時發之標。若**唯**項皆 telemetry-call、串為事唯、末歸 `UNKNOWN`（名存而非閘）
- **env-var-check** 項常示殺鈕（默開能由環變閉）或顯選入（默閉能由環變開）。注極性——`if (process.env.X) { return null; }` 為殺鈕；`if (process.env.X) { enable(); }` 為選入
- **string-table** 項必交對——察表下游如何用

得：諸項皆有定呼點職與（閘者）記默值。

敗：閘呼境過縮不可讀默→展 grep 境（`-C 10`）察全呼。默仍不定→記 `default=?` 並降 LIVE/DARK 結為 INDETERMINATE。

### 三：察活呼為（叉 B——時探）

於己控之認會行架、察閘能浮否。此為單最高號叉：包述**可**為、時示**已**為。

擇探動以露閘過——常為閘護之用見行（具現於具列、命旗成有效、UI 元呈、應出現新欄）。

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

記三果之一：

- **閘過察**——能於會浮。歸候：`LIVE`
- **閘過未察**——能未浮。歸候依步二默（默假→`DARK`；默真→重察、可疑）
- **閘過依不可重之入或境**——記件；歸候：`INDETERMINATE`

得：記探動、察果、其指歸候。

敗：探動自誤（認敗、網不通、誤子命）→時叉於此回不用。修會或擇他探動；勿自未行之時推 DARK。

### 四：察盤態（叉 C——配、緩、會）

多架持閘評或覆值於盤以免重取。察此態示架於末評時所信於旗。

常處（合架——此為形非定徑）：

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

各擊記徑、與旗合值、檔末改時。近改之緩項覆二進默為任向最強據。

得：確覆值含時、或確無（無盤態提此旗）。

敗：見旗提而不知記值為緩服應、用覆或陳值→標項為步五（平緩）和、勿猜。

### 五：察平旗服緩（叉 D）

若架用外功旗服（LaunchDarkly、Statsig、GrowthBook、商內等）、地緩之服應為今發態權威。可則察。

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

記緩值、緩時、（若有）緩 TTL。平緩 `false` 覆二進默 `true`；平緩 `true` 覆二進默 `false`。

得：定緩值含時、或確無此架旗服緩。

敗：架無旗服或不能找緩→此叉無獻——可。注「叉 D：不適」於據表；勿猜。

### 六：處合取閘

某能由多旗皆真護：`gate("A") && gate("B") && gate("C")`。一者 DARK 即使能 DARK、然各旗歸仍各自。

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

各浮共閘串：

- 重步一至五於該旗（各為己探）
- 記各旗歸
- 算**能級**歸：諸合取皆 LIVE 則 LIVE；任合取 DARK 則 DARK；無 DARK 而至少一 INDETERMINATE 則 INDETERMINATE

得：諸合取識並各歸、加導出之能級歸。

敗：謂過縮不淨枚（呼點內聯或裹）→記合取為「≥1 加閘、構不可讀」並降能級歸為 INDETERMINATE 即首旗似 LIVE 亦然。

### 七：察技代

旗可實 DARK 而其用面能由異全支徑可至——異命、用呼技、他 API。誠發「旗 DARK、能 LIVE 由代」常重；忘之生慌暗發報於用實有之能。

任 DARK 或 INDETERMINATE 候歸：

- 有文之用呼命、斜命或技達同末用果乎？
- 有他 API 面（異端、異具名）返等資乎？
- 架發用面延點（插件、自具、鉤）使用自組等乎？

任一是→於據行加 `substitution:` 注記他徑與其可察（用如何至、有文乎）。

得：諸 DARK/INDETERMINATE 歸、明代察——或徑、或明注「無代徑識」。

敗：疑代存而不能確徑→標「代疑；未確」勿任向斷。

### 八：合據表與末歸

合四叉為單表。每態主必配支察；新版重探生可差物。

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

施歸則：

- **LIVE**——至少一叉於此會察閘過、且無叉反
- **DARK**——旗串存、閘呼默 `false`、無叉察閘過、無覆翻之
- **INDETERMINATE**——閘過依不可重之入或境、或閘默不可定、或一合取為 INDETERMINATE
- **UNKNOWN**——串存而非閘用（telemetry 唯、string-table 唯、env-var 唯標）

存表為探物（如 `probes/<flag>-<version>.md`）以使未來探差之。

得：完據表涵四叉、合取態、代態、單末歸。

敗：無叉生用號（二進不可讀、時不可呼、盤與平緩皆無）→勿造歸。記 `INDETERMINATE` 由「無叉生號」並止。

## 驗

- [ ] 據表諸態主配特察（無裸斷）
- [ ] 旗閘呼默值記（或明注不可讀）
- [ ] Telemetry 事項不算閘據
- [ ] 合取閘有各旗歸**並**能級歸
- [ ] 諸 DARK/INDETERMINATE 行有明代察
- [ ] 物記二進版以使未來探可差
- [ ] 無實品名、版定識、暗唯旗名於發物中（見 `redact-for-public-disclosure`）

## 忌

- **混遙事為閘**：於 `emit("$FLAG", ...)` 之串為標非閘。「遙唯」旗無發態當歸 UNKNOWN 非 DARK
- **略叉 B（活呼）**：靜據單（二進述 `default=false`）異於時據（能未現）。二進默假可由服覆翻真；唯時探示會實得
- **失合取**：因首旗單項示 `default=true` 歸 LIVE 而忽周 `&& gate("B") && gate("C")`→生假信 LIVE 於實由 B 或 C 閘之能
- **無代察而稱 DARK**：多 DARK 旗實不可至、然多有全支用呼徑。代察使「驚暗發」轉「誠發」
- **探陳二進版**：無版印之物無用——不可分為今或末季態。必記版、未來探對物差
- **激閘以驗**：翻旗以試非此技。某暗閘為安關（能未全、規押、遷未畢）。記；勿越
- **捕他用態**：叉 C、D 察**己**盤態與**己**緩。讀他用緩為流出、出範
- **視 INDETERMINATE 為敗**：非也——為據半時誠歸。迫 INDETERMINATE 為 LIVE 或 DARK 以使報似決為最速誤路

## 參

- `monitor-binary-version-baselines` — 父引 Phase 1；此技建之標追供候旗錄
- `conduct-empirical-wire-capture` — Phase 4；叉 B 表面探不足時之深時據（網捕、生命鉤）
- `security-audit-codebase` — 暗發碼為攻面考古之分；此技為彼審之發半
- `redact-for-public-disclosure` — Phase 5；定何探物可離私工區之減密律
