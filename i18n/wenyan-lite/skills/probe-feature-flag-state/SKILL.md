---
name: probe-feature-flag-state
locale: wenyan-lite
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

# 探查功能旗標狀態

依四叉證據流程，判定 CLI 二進位中之具名旗標為 LIVE、DARK、INDETERMINATE 或 UNKNOWN，每項狀態主張皆配對一具體觀察。

## 適用時機

- 某能力出於傳聞、文件或推論，須驗證閘門於當前會話中是否真的觸發。
- 稽核暗發布功能——隨包出貨而被閘斷者——以負責任地擬整合。
- 先前探查之結論須對照新二進位版本更新（旗標可能已翻、已移除或已併入連接體）。
- 跟進 Phase 1（`monitor-binary-version-baselines`）之標記，於進入 Phase 4 之線路抓包前，先為各候選旗標分類其推出狀態。
- 用戶可見之行為已變，須知是旗標翻轉或程式變更所致。

## 輸入

- **必要**：旗標於二進位中所出現之字串字面名稱。
- **必要**：可讀且可調用之 CLI 二進位或包檔。
- **必要**：對 harness 一般後端之已認證會話（自有帳號；切勿他人之帳號）。
- **選擇性**：二進位版本識別碼——強烈建議，俾證據表可與未來探查相 diff。
- **選擇性**：疑似共閘之清單（其他可能與本旗標構成連接之名）。
- **選擇性**：相同旗標之先前探查工件，作差異分析。

## 步驟

### 步驟一：確認旗標名稱於二進位中存在（叉 A——二進位字串）

自包中提取候選旗標名稱，以確認其確為字串字面存在。否則後續諸叉皆探虛無。

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

檢視 `/tmp/flag-context.txt`，將每一出現處標為下列其一：

- **gate-call** —— 作為閘形函式之首參數（`gate("$FLAG", default)`、`isEnabled("$FLAG")`、`flag("$FLAG", ...)`）。
- **telemetry-call** —— 作為 emit/log/track 函式之首參數。
- **env-var-check** —— 出現於 `process.env.X`（或同等）查找。
- **string-table** —— 出現於角色不明之靜態映射或登錄。

**預期：** 旗標字串於包中至少一處出現，且每處皆已標其調用點角色。

**失敗時：** 若 `grep -c` 為 0，此版本中無此旗標。或輸入名有誤（拼寫、命名空間錯）或本版已移除。重審 Phase 1 之標記輸出，再或修輸入或歸 `REMOVED` 並止。

### 步驟二：將閘、事件、環境變數消歧

同一字串可同時為閘、遙測事件名、env var——分類取決於調用點，非取決於字串。將遙測名誤為閘將產生荒謬之推理（「此閘必關」），而本非閘。

對步驟一中每一已標出現處：

- **gate-call** 出現使該字串可入 LIVE / DARK / INDETERMINATE 之分類。記錄傳予閘之**預設值**（`gate("$FLAG", false)` 預設關；`gate("$FLAG", true)` 預設開）。記錄字面預設值與閘函式名稱。
- **telemetry-call** 出現**不**使該字串成為閘。其為他閘已過後所發之標籤。若*僅*出現於 telemetry-call，該字串為純事件，終分類為 `UNKNOWN`（名存而非閘）。
- **env-var-check** 出現通常表停用開關（預設開之能力被 env var 關）或顯式開關（預設關之能力被 env var 開）。記極性——`if (process.env.X) { return null; }` 為停用開關；`if (process.env.X) { enable(); }` 為開關。
- **string-table** 出現須交叉參照——觀其下游被消費之方式。

**預期：** 每一出現皆有確定之調用點角色，且 gate-call 者皆已記預設值。

**失敗時：** 若某 gate-call 之上下文過於壓縮以致難讀預設值，擴展 grep 上下文（`-C 10`）並檢全 callee。若仍無從定，記為 `default=?` 並將任何 LIVE/DARK 結論降為 INDETERMINATE。

### 步驟三：觀察當場調用之行為（叉 B——執行期探查）

於自有認證會話中執行 harness，並觀察被閘控之能力是否浮現。此叉為最高訊號者：包說*能*發生何事，執行期顯示*確*發生何事。

擇一能揭出閘已過之探測動作——通常即被閘所守之用戶可見行為（工具列表中出現某工具、某指令旗標生效、某 UI 元素呈現、某輸出欄出現於回應中）。

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

記下三種結果之一：

- **觀察到閘已過** —— 該能力於會話中出現。分類候選：`LIVE`。
- **未觀察到閘已過** —— 能力未出現。分類候選依步驟二之預設而定（default-false → `DARK`；default-true → 重檢，可疑）。
- **閘已過取決於本處不可重現之輸入或脈絡** —— 記下該條件；分類候選：`INDETERMINATE`。

**預期：** 已記之探測動作、所觀結果與其指向之分類候選。

**失敗時：** 若探測動作本身出錯（認證失敗、網路不可達、子命令錯），執行期叉本回合不可用。修會話或另擇探測動作；切勿從未行之執行期推得 DARK。

### 步驟四：檢視磁碟上之狀態（叉 C——設定、快取、會話）

許多 harness 會將閘評估或覆寫值持久化於磁碟，俾免重抓。檢之即知 harness 於上次評估時對該旗標之認知。

常見位置（依 harness 而調整——下為形式而非具體路徑）：

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

對每一命中，記其路徑、與該旗標關聯之值、以及檔案最近修改時間。覆蓋二進位預設之最近修改快取項，為任一向之最強證據。

**預期：** 或一已確認之覆寫值與時戳，或已確認之缺席（磁碟上無狀態提及該旗標）。

**失敗時：** 若旗標被提及但無從判定其值為快取之伺服器回應、用戶覆寫或舊值，將該項標為待步驟五（平台快取）對齊，而非臆測。

### 步驟五：檢視平台旗標服務快取（叉 D）

若 harness 用外部旗標服務（LaunchDarkly、Statsig、GrowthBook、廠內等），本地快取之服務回應為當前推出狀態之權威。可得時即檢之。

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

記快取值、快取時戳、以及（若有）快取 TTL。平台快取為 `false` 即覆蓋二進位預設之 `true`；為 `true` 即覆蓋預設之 `false`。

**預期：** 或一明確之快取值與時戳，或已確認之無此 harness 之旗標服務快取。

**失敗時：** 若 harness 無旗標服務或無從尋其快取，本叉不貢獻——可接受。於證據表中記「Prong D: not applicable」；勿臆測。

### 步驟六：處理連接閘

某些能力被多旗標守住，須全為真：`gate("A") && gate("B") && gate("C")`。任一為 DARK 即足以使該能力為 DARK，惟各旗標仍各有其分類。

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

對每一浮現之共閘字串：

- 對該旗標重作步驟一至五（視為一獨立探查）。
- 記其各別分類。
- 計**能力層級**之分類：所有合取項皆 LIVE 才為 LIVE；任一合取項為 DARK 即為 DARK；無合取項為 DARK 而至少一為 INDETERMINATE 時，則為 INDETERMINATE。

**預期：** 每一合取項皆已辨識並分類，加上推得之能力層級分類。

**失敗時：** 若述語過於壓縮以致無法清楚列舉（調用點被內聯或包裝），記該連接為「至少一額外閘，結構不可讀」，並將能力層級分類降為 INDETERMINATE，即便主旗標看似 LIVE。

### 步驟七：檢視技能替代

旗標可能合理地為 DARK，惟其本擬解鎖之用戶可見能力可由另一受支援之路徑（不同指令、可由用戶調用之技能、替代 API）達成。誠實之發現「旗標 DARK，能力經替代為 LIVE」常見且重要；漏之則致對用戶實有之能力作恐慌之暗發布報告。

對任一 DARK 或 INDETERMINATE 之候選分類，問：

- 是否有可由用戶調用、有文件之指令、斜槓指令或技能，能達同樣之終端結果？
- 是否有替代 API 表面（不同端點、不同工具名）能回傳等效資料？
- harness 是否公布用戶層之擴展點（外掛、自訂工具、鉤子），讓用戶得以自行組合等效物？

任一為是，於證據列上附 `substitution:` 註，記替代路徑及其可觀察性（用戶如何達之、是否有文件）。

**預期：** 對每一 DARK / INDETERMINATE 之分類，皆有明示之替代檢查——或記路徑，或明示「未辨明替代路徑」。

**失敗時：** 若疑有替代但無從確認，記「疑有替代；未確認」而不作任一向之斷言。

### 步驟八：組合證據表與終分類

將四叉合為單表。每一狀態主張皆配以支撐之觀察；以新版本重作探查能產出可 diff 之工件。

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

套分類規則：

- **LIVE** —— 至少一叉於本會話中觀察到閘已過，且無叉相反。
- **DARK** —— 旗標字串存在、gate-call 預設為 `false`、無叉觀察到閘已過、無覆寫將其翻開。
- **INDETERMINATE** —— 閘已過取決於本探查中不可重現之輸入或脈絡，或 gate 預設無從定，或某合取項為 INDETERMINATE。
- **UNKNOWN** —— 字串存在但非用為閘（純遙測、純字串表、純 env-var 標籤）。

將表存為探查工件（如 `probes/<flag>-<version>.md`），俾未來探查可與之 diff。

**預期：** 一份完整之證據表，涵蓋四叉、連接狀態、替代狀態與單一終分類。

**失敗時：** 若無叉產出可用訊號（二進位無法讀、執行期無法調用、磁碟與平台快取皆無），勿臆造分類。記為 `INDETERMINATE`，理由「無叉產出訊號」並止。

## 驗證

- [ ] 證據表中每項狀態主張皆配以具體觀察（無裸斷言）。
- [ ] 旗標之 gate-call 預設值已記（或已明示無從讀）。
- [ ] 遙測事件之出現未被計為閘證據。
- [ ] 連接閘之每一旗標皆有分類，**並**有能力層級之分類。
- [ ] 每一 DARK / INDETERMINATE 列皆有明示之替代檢查。
- [ ] 工件已記二進位版本，俾未來探查可 diff。
- [ ] 無真實產品名、版本鎖定識別碼或僅暗發布之旗標名出現於擬公開之工件中（見 `redact-for-public-disclosure`）。

## 常見陷阱

- **將遙測事件混為閘**：出現於 `emit("$FLAG", ...)` 之字串為標籤，非閘。「純遙測」之旗標無推出狀態，應歸 UNKNOWN，非 DARK。
- **跳過叉 B（當場調用）**：純靜態證據（包說 `default=false`）不等於執行期證據（能力未現）。預設為 false 之旗標可能被伺服器側覆寫為 true；唯執行期探查能顯出本會話實得。
- **錯失連接**：因主旗標出現顯 `default=true` 而歸 LIVE，卻忽略其周圍之 `&& gate("B") && gate("C")`，將為實際被 B 或 C 閘之能力產出錯誤之自信 LIVE。
- **未作替代檢查即稱 DARK**：許多 DARK 旗標確實不可達，惟亦有許多有受支援之用戶可調用路徑。替代檢查使「警示性暗發布」變為「誠實發現」。
- **探查之二進位過時**：無版本戳之探查工件無用——無從知其反映當前狀態抑或上季狀態。永記版本，並 diff 未來探查。
- **為確認而啟用閘**：翻轉旗標以測之，不在本技能範圍內。某些暗閘為安全（能力未盡、法規凍結、遷移未完）而關。記之；勿繞之。
- **擷取他人之狀態**：叉 C 與叉 D 檢視*自有*磁碟狀態與*自有*快取。讀他人之快取為外洩，不在本技能範圍。
- **將 INDETERMINATE 視為失敗**：非也——當證據不全時，這是誠實之分類。將 INDETERMINATE 強塞入 LIVE 或 DARK 以使報告看似果決，乃出錯最快之路。

## 相關技能

- `monitor-binary-version-baselines` —— 母指南之 Phase 1；本技能所依之標記追蹤即提供候選旗標清單。
- `conduct-empirical-wire-capture` —— Phase 4；當叉 B 之表面探測不足時，提供更深之執行期證據（網路抓包、生命週期鉤子）。
- `security-audit-codebase` —— 暗發布之程式碼為攻擊面考古之一環；本技能即該稽核之發現半。
- `redact-for-public-disclosure` —— Phase 5；判定哪些探查工件可離私領域之遮蔽紀律。
