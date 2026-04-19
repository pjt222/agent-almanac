---
name: conduct-empirical-wire-capture
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Capture outbound HTTP and telemetry from a CLI harness at runtime.
  Covers capture-channel selection (transcript file vs verbose-fetch
  stderr vs outbound proxy vs on-disk state), hook-driven per-event
  capture vs long-running session capture, JSONL output format for
  diff-friendly artifacts, and the observability table that maps each
  target to the cheapest channel that captures it. Use when a static
  finding needs runtime confirmation, when a payload shape is needed
  for a client re-implementation, or when dark-vs-live disambiguation
  requires watching what the binary actually sends.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, wire-capture, http, telemetry, jsonl, observability
---

# 實測線捕

建可重現之線捕架，取 CLI 具之運時 HTTP 與遙測，配每觀察目標至最廉之捕道。

## 範與倫

配捕前必讀。

- 線捕為 **己** 之求、**己** 賬、**己** 機。捕他用流為竊非研——越範。
- 憑證幾必現於生線出。捕時即削（步六）——勿「先捕後削」。
- 捕為 *觀*，非變。勿以所捕繞服鏈限、重放他用會、或未授而啟暗功。
- 此技之出為內構件。線發現之公佈經 `redact-for-public-disclosure`（親導 Phase 5），非此技。

## 用

- 靜發現（旗、端、遙名）須運時確其實發
- 須載形於客重實、埋點、版差
- 暗活辨須觀二進實發之物，非束疑之物
- 版間默變→欲可重現構件以對後版

**勿**用於：版基線（用 `monitor-binary-version-baselines`）、旗態探（用 `probe-feature-flag-state`）、或備削以公佈（用 `redact-for-public-disclosure`）。

## 入

- **必**：可本地對己賬行之 CLI 具。
- **必**：具體問（如「端 X 於事 Y 發乎？」、「遙事 Z 之載形何？」）。無問之捕→無人讀之日誌。
- **可**：前階之靜發現（標目、候旗列、疑端）範捕標。
- **可**：構件之私工作區路徑。默 `./captures/`——須於 `.gitignore`。

## 行

### 一：先建觀察表

配捕前先列所須答之問，各配一捕道。每標一行。

| target | observable via | blocker |
|---|---|---|
| Outbound HTTP to endpoint X | verbose-fetch stderr | TUI noise pollutes terminal |
| Telemetry event Y on user action | hook-driven subprocess | requires harness hook surface |
| Token-refresh handshake | outbound HTTP proxy | cert trust required |
| Scheduled-task lifecycle event | long-running session capture | wallclock alignment |
| Local config mutation | on-disk state diff | none — cheapest channel |

常見道，廉者先：

- **磁態檔變**——具寫態於已知路→快照間 `diff` 免費。
- **謄本檔**——具已寫會謄本→直析之。無埋點。
- **verbose-fetch stderr**——束供環變（如 bun 之 `BUN_CONFIG_VERBOSE_FETCH=curl`）路每 fetch 至 stderr。噪而全捕。
- **hook 驅子進**——具露生命 hook（`UserPromptSubmit`、`Stop` 等）→每事生短捕子進。
- **長會捕**——一進程跨會，牆鐘標。用於序。
- **外 HTTP 代理**——淨分，然須 CA 證信任且遇證固定即破。

擇捕目之最廉道。三標捕答一問勝於二十標捕答無。

**得：** 觀察表每問一行，各注道與已知阻。無可行道之標→標「本會超範」。

**敗：** 諸標皆落代理列→表過雄。削至一二最高值之問，於彼再察低廉道。

### 二：備棄工作區

線捕污終端、遺檔於意外處、或洩憑於日誌。

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

確捕會非主工會——verbose-fetch 與 TUI 渲染相擾。

**得：** 時戳之捕目錄已 git-ignore，別於主工會。

**敗：** `git check-ignore` 報未 ignore→修 `.gitignore` 方行任捕。勿以憑險行。

### 三：hook 驅捕於每事標

目為離散事（工呼、提交、會停）→用具之 hook 面。每事生短命捕子進；勿於進中駐。

模（合成例）：

```bash
# Hook script, registered with the harness's hook config.
# Invoked once per event; writes one JSONL line; exits.
#!/usr/bin/env bash
set -euo pipefail
TS=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
EVENT="${1:-unknown}"
PAYLOAD=$(jq -c --arg ts "$TS" --arg ev "$EVENT" \
  '{ts:$ts, source:"hook", target:$ev, payload:.}' < /dev/stdin)
echo "$PAYLOAD" >> "$CAPTURE_DIR/events.jsonl"
```

子進每事之故：

- 無 token 態、無會耦——每呼獨。
- 一捕敗不污下。
- 子進負荷可——事罕（每用動，非每字節）。

**得：** 每發事之一 JSONL 行於 `events.jsonl`，皆 `jq` 可析。

**敗：** `jq` 報析錯→載含未轉義控字或二進。管 `jq -R`（生輸）且 base64 編載欄。

### 四：長會捕於序狀

目為序（多輪握手、計劃任務生命、退避態機）→一捕進跨會、牆鐘標。

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

牆鐘前綴使多並發捕之序無歧。TSV（制表分）故意——抗 shell 於 stderr 破 JSON 引號。

會終後轉 TSV 至 JSONL（步五），非行中。

**得：** TSV 日誌含單調增時戳，每 stderr 行一列。

**敗：** 時戳倒→具緩 stderr→重行加 `stdbuf -oL -eL` 或束等效之行緩旗。

### 五：歸一為 JSONL

JSONL 為構件格式：每行一 JSON 物，欄 `timestamp`、`source`、`target`、`payload`。利 diff、`jq` 可濾、編輯器重載穩。

```bash
# Parse the TSV from Step 4 into JSONL.
awk -F'\t' '{
  printf "{\"timestamp\":\"%s\",\"source\":\"verbose-fetch\",\"target\":\"%s\",\"payload\":%s}\n",
    $1, "session", $2
}' < session.tsv | jq -c . > session.jsonl
```

驗每行可析：

```bash
while IFS= read -r line; do
  echo "$line" | jq -e . > /dev/null || echo "BAD LINE: $line"
done < session.jsonl
```

常用濾：

```bash
# Show only requests to a specific endpoint pattern.
jq -c 'select(.payload | tostring | test("/api/v1/example"))' session.jsonl

# Show timing between consecutive captures.
jq -r '.timestamp' session.jsonl | sort | uniq -c
```

**得：** `*.jsonl` 每行過 `jq -e .`；無 `BAD LINE` 警。

**敗：** 有行敗→源 TSV 之載嵌制表符→重行步四以異分或 base64 編次欄。

### 六：捕時削

寫磁前削驗頭、會 ID、bearer token、PII。`events.jsonl` 與 `session.jsonl` 首寫不當含一機。

```bash
# Stream the raw capture through a redactor before persisting.
redact() {
  sed -E \
    -e 's/(authorization:[[:space:]]*Bearer[[:space:]]+)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(x-api-key:[[:space:]]*)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(cookie:[[:space:]]*)[^;]+/\1<REDACTED>/gi' \
    -e 's/("password"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g' \
    -e 's/("token"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g'
}

cat raw-capture.txt | redact > session.tsv
```

捕後驗無漏：

```bash
# Patterns that must not appear in any *.jsonl file.
grep -Ei 'bearer [A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' captures/ \
  && { echo "LEAK DETECTED"; exit 1; } \
  || echo "redaction clean"
```

「捕後削」之構件必漏。唯安模為「捕即削」。成品中發未削 token→視全捕為洩——刪之、轉憑、重行。

**得：** `LEAK DETECTED` 檢退 0（無匹）。`grep` 於已知憑前綴無返。

**敗：** 漏檢中→勿就地改檔。刪全捕目錄、延削正則涵漏類、自步三或四重行。

### 七：記前分響類

HTTP 狀態碼於異脈有異義。記前分使下游 `jq` 濾於意，非生碼。

| Observed status | Channel context | Classification |
|---|---|---|
| 200 / 201 | Any | success |
| 401 on token-refresh endpoint | Handshake | expected handshake step |
| 401 on data endpoint | After auth | auth failure (real) |
| 404 on lazy-loaded resource | First fetch | expected miss |
| 404 on documented endpoint | After feature gate | gate-induced absence |
| 429 | Any | rate-limit (back off; do not retry tight) |
| 5xx | Any | server failure (record, do not assume) |

捕時加 `class` 欄：

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

token 刷道之 401 非敗——為握手首半。誤分握手步為敗→生假陽發現耗審者神。

**得：** `*.classified.jsonl` 每行有 `class` 欄有已知值。

**敗：** 多生 `other`→表不全於此具→每重現 `other` 模加一行方續析。

### 八：持捕清單

捕行可重現僅入與出俱記。寫清單：

```bash
cat > capture-manifest.json <<EOF
{
  "captured_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "harness_version": "$(harness-cli --version 2>/dev/null || echo unknown)",
  "channel": "verbose-fetch",
  "question": "Does endpoint X fire on event Y?",
  "targets": ["endpoint-X", "event-Y"],
  "files": ["session.jsonl", "session.classified.jsonl"],
  "redaction_check": "passed"
}
EOF
```

清單使捕可與後版 diff。

**得：** `capture-manifest.json` 在、`jq` 可析、列捕目錄諸構件檔。

**敗：** 具無版旗→改記二進之 `sha256sum`。無識之二進生不可比之捕。

## 驗

- [ ] 觀察表於行任捕令前已建
- [ ] 捕目錄 git-ignore 且時戳
- [ ] 每 `*.jsonl` 檔逐行過 `jq -e .`
- [ ] 削漏檢於已知憑前綴無匹
- [ ] 每捕事有 `class` 欄有已知值
- [ ] `capture-manifest.json` 記具版（或 sha256）、道、問
- [ ] 捕目錄只含步一所列標（無他應之附流）

## 忌

- **先捕後問**：無人讀之日誌為廢盤廢神。先建觀察表；只捕答具體問者。
- **先求 `mitmproxy`**：外代理為最侵之道。須證信任、遇證固定即破、污具環。僅磁、謄本、verbose-fetch、hook 皆阻時用。
- **於主工會捕**：verbose-fetch stderr 入 TUI 渲染→或洩他工片於捕。必用棄 shell。
- **「後削」**：捕後削之構件皆曾漏憑一次。捕即削，否則勿捕。
- **齊視 4xx 為敗**：token 刷道之 401 為握手步非敗。按道脈分響類（步七）方下結論。
- **長捕於每事標**：會長進捕三離散事→耦 token 態於捕間且一壞事毒下。每事用 hook 子進；序留長捕。
- **無清單**：無 `capture-manifest.json` 之 JSONL 不可重現——不知何版生即不可與下月二進 diff。
- **捕他用之流**：超範。線捕為己賬於己機。偶錄他用之求→刪捕、緊道。

## 參

- `monitor-binary-version-baselines` — 親法之 Phase 1；生此技清單所引之版基線
- `probe-feature-flag-state` — Phases 2-3；線捕為其證一股，此技教捕半
- `instrument-distributed-tracing` — 共 JSONL+牆鐘哲；應於一二進非服務網
- `redact-for-public-disclosure` — Phase 5；此技只涵捕時削於內用，非離私區前之公佈級削
