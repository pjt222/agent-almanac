---
name: conduct-empirical-wire-capture
locale: wenyan-lite
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

# 行實證之線路捕獲

為 CLI 工具之出站 HTTP 與遙測立可重現之線路捕獲架，將每觀察目標配以捕獲之最廉道。

## 範圍與倫理

配任何捕獲前讀此。

- 線路捕獲用於**自**之請求、於**自**之帳號、於**自**之機。捕他用戶流量乃外洩，非研究，不在此範。
- 憑證幾於生線路輸出中必現。於捕獲時遮（步驟六）——勿「先捕後遮」。
- 捕獲乃*觀察*，非改動。勿以捕得之載荷繞伺服器端速率限、重播他人會話、未授權而啟暗啟能力。
- 此技能之輸出為內部產物。線路發現之公開發布須經 `redact-for-public-disclosure`（父指南之第五階段），非此技能。

## 適用時機

- 靜態發現（旗標、端點引、遙測事件名）需運行時確認其確發
- 客戶端重實現、追蹤埋點、跨版差異需知載荷形
- 暗啟 vs 活之分辨需觀二進制實發之物，非打包之可能示
- 行為於版本間靜然改，需可重現之產物以比未來版

勿用此技能於：版本基線（用 `monitor-binary-version-baselines`）、旗標態探（用 `probe-feature-flag-state`）、備公開發布之遮蔽產物（用 `redact-for-public-disclosure`）。

## 輸入

- **必要**：可於本地以自己帳號行之 CLI 架二進制
- **必要**：具體問題（如「端點 X 於事件 Y 發否？」、「遙測事件 Z 之載荷形為何？」）。無問題之捕獲生無人讀之日誌
- **選擇性**：前階段之靜態發現（標記目錄、候選旗標清單、疑似端點）以限捕獲目標
- **選擇性**：捕獲產物之私有工作區路徑。預設 `./captures/`——須入 `.gitignore`

## 步驟

### 步驟一：先建觀察表

配任何捕獲前，枚舉需答之問題並各配以捕獲道。每目標一列。

| target | observable via | blocker |
|---|---|---|
| Outbound HTTP to endpoint X | verbose-fetch stderr | TUI noise pollutes terminal |
| Telemetry event Y on user action | hook-driven subprocess | requires harness hook surface |
| Token-refresh handshake | outbound HTTP proxy | cert trust required |
| Scheduled-task lifecycle event | long-running session capture | wallclock alignment |
| Local config mutation | on-disk state diff | none — cheapest channel |

常用道，由廉至昂：

- **磁碟態檔案變動** — 架將其態寫於已知路徑時，快照間之 `diff` 無費
- **轉錄檔** — 架已寫會話轉錄時，直解之。無需埋點
- **verbose-fetch stderr** — 打包器供之環境變數（如 bun 之 `BUN_CONFIG_VERBOSE_FETCH=curl`）將每一 fetch 導至 stderr。雜而捕每 fetch
- **鉤子驅動子進程** — 架暴生命週期鉤子（`UserPromptSubmit`、`Stop` 等）時，每事件生短捕獲子進程
- **長駐會話捕獲** — 跨會話一進程，附掛鐘標。用於序列
- **出站 HTTP 代理** — 分離清晰，然需 CA 憑信，且架釘憑證時破

取捕目標之最廉道。答一具體問題之三目標捕獲勝於答無之二十目標捕獲。

**預期：** 每問題一列之觀察表，各註其道與已知阻。無可行道之目標標為「此會話不在範」。

**失敗時：** 若每目標皆落代理欄，表過雄。修至一二最高價之問題並為其覓低廉道。

### 步驟二：備可棄工作區

線路捕獲污染終端、於意外處遺檔、或洩憑證於日誌。

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

確捕獲會話非主工作會話——verbose-fetch 與 TUI 渲染互擾。

**預期：** 帶時戳之捕獲目錄，已 git-ignore，與工作會話分。

**失敗時：** 若 `git check-ignore` 報目錄未被忽略，執任何捕獲前先修 `.gitignore`。勿於憑證有險下進行。

### 步驟三：鉤子驅動之每事件捕獲

目標為離散事件（工具呼叫、提示提交、會話停）時，用架之鉤子面。每事件生短命捕獲子進程；勿駐於進程內。

模式（合成示例）：

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

每事件一子進程之故：

- 無令牌態、無會話耦合——每次呼皆獨立
- 一捕之敗不污下次
- 子進程之負可接——事件稀（按用戶行動，非按字節）

**預期：** `events.jsonl` 中每發事件一 JSONL 行，各為可以 `jq` 解之妥 JSON。

**失敗時：** 若 `jq` 報解析錯，載荷含未跳之控制字元或二進制——通過 `jq -R`（原始輸入）並代以 base64 編其載荷欄。

### 步驟四：序列態之長駐會話捕獲

目標為序列（多輪握手、排程任務生命週期、重試/退讓狀態機）時，跨會話一捕獲進程，附掛鐘標。

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

掛鐘前綴令多捕並行時排序明確。TSV（制表符分）為故意——其於損 stderr 上 JSON 引號之 shell 中存。

會話終後（步驟五）再將 TSV 轉為 JSONL，非其間。

**預期：** 時戳單調遞增之 TSV 日誌，每 stderr 行一列。

**失敗時：** 若時戳倒行，架緩衝其 stderr——以 `stdbuf -oL -eL` 或打包器之行緩衝等效旗標重行。

### 步驟五：歸一為 JSONL

JSONL 為產物格式：每行一 JSON 物件，欄 `timestamp`、`source`、`target`、`payload`。易 diff、可 `jq` 篩、跨編輯器重載穩。

```bash
# Parse the TSV from Step 4 into JSONL.
awk -F'\t' '{
  printf "{\"timestamp\":\"%s\",\"source\":\"verbose-fetch\",\"target\":\"%s\",\"payload\":%s}\n",
    $1, "session", $2
}' < session.tsv | jq -c . > session.jsonl
```

驗每行可解：

```bash
while IFS= read -r line; do
  echo "$line" | jq -e . > /dev/null || echo "BAD LINE: $line"
done < session.jsonl
```

典型篩用：

```bash
# Show only requests to a specific endpoint pattern.
jq -c 'select(.payload | tostring | test("/api/v1/example"))' session.jsonl

# Show timing between consecutive captures.
jq -r '.timestamp' session.jsonl | sort | uniq -c
```

**預期：** `*.jsonl` 每行可以 `jq -e .` 解；無 `BAD LINE` 警告。

**失敗時：** 若某行驗證敗，源 TSV 載荷中含嵌入之制表——以不同分隔符重行步驟四或以 base64 編第二欄。

### 步驟六：於捕獲時遮

**寫磁碟前**剝 auth 頭、會話 ID、bearer 令牌、PII。`events.jsonl` 與 `session.jsonl` 於首次寫時不該含任何秘密。

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

捕獲後驗無漏：

```bash
# Patterns that must not appear in any *.jsonl file.
grep -Ei 'bearer [A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' captures/ \
  && { echo "LEAK DETECTED"; exit 1; } \
  || echo "redaction clean"
```

`先捕後遮`之產物總漏物。唯一安全模式乃`邊捕邊遮`。若於已定產物中發現未遮之令牌，視全捕為危——刪之、輪憑證、重行。

**預期：** `LEAK DETECTED` 檢以 0 退（無匹配）。對已知憑證前綴之 `grep` 無返。

**失敗時：** 若漏檢發現命中，勿於原檔編輯。刪全捕目錄，擴遮蔽之正則以涵漏之模式類，並自步驟三或四重行。

### 步驟七：記前分類回應類

HTTP 狀態碼於不同脈絡帶不同語意重。記前分類以令下游 `jq` 篩基於意圖而非原碼。

| Observed status | Channel context | Classification |
|---|---|---|
| 200 / 201 | Any | success |
| 401 on token-refresh endpoint | Handshake | expected handshake step |
| 401 on data endpoint | After auth | auth failure (real) |
| 404 on lazy-loaded resource | First fetch | expected miss |
| 404 on documented endpoint | After feature gate | gate-induced absence |
| 429 | Any | rate-limit (back off; do not retry tight) |
| 5xx | Any | server failure (record, do not assume) |

於捕獲時增 `class` 欄：

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

令牌刷新道上之 401 非失敗——乃握手之首半。誤將握手步視為敗生偽陽發現，耗審者之神。

**預期：** `*.classified.jsonl` 每行有 `class` 欄，值為已知者。

**失敗時：** 若分類生多 `other`，上表於此架不全——擴之，每重現之 `other` 模式一列，再續分析。

### 步驟八：存捕獲清單

唯當輸入與輸出同記時，捕獲次方可重現。寫清單：

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

清單令捕獲可對未來版本行 diff。

**預期：** `capture-manifest.json` 存、以 `jq` 解、列捕獲目錄中所有產物檔。

**失敗時：** 若架無版本旗標，代以二進制之 `sha256sum` 記之。未識之二進制生不可比之捕獲。

## 驗證

- [ ] 任何捕獲命令行前已建觀察表
- [ ] 捕獲目錄已 git-ignore 並帶時戳
- [ ] 每 `*.jsonl` 檔逐行以 `jq -e .` 可解
- [ ] 對已知憑證前綴之漏檢無匹配
- [ ] 每捕獲事件有 `class` 欄，值為已知
- [ ] `capture-manifest.json` 記架版本（或 sha256）、道、問題
- [ ] 捕獲目錄僅含步驟一枚舉之目標（無他應用之意外流量）

## 常見陷阱

- **先捕後問**：無人讀之日誌乃廢磁碟與廢神。先建觀察表；僅捕答具體問題者
- **先伸 `mitmproxy`**：出站代理為最入侵之道。需憑信、憑證釘處破、污架之環境。僅於磁碟、轉錄、verbose-fetch、鉤子諸道皆阻時用
- **於主工作會話中捕獲**：verbose-fetch stderr 滲入 TUI 渲染，可將他工作之片段洩入捕獲。總用可棄之 shell
- **「我們後再遮」**：每`先捕後遮`之產物至少漏過憑證一次。捕獲時遮或勿捕
- **一律視 4xx 為敗**：令牌刷新道上之 401 為握手步，非敗。先按道脈絡分類回應類（步驟七），再下結論
- **以長駐捕獲捕每事件目標**：跨會話進程捕三離散事件耦令牌態於諸捕間，令一壞事件毒其下。事件用鉤子驅動子進程；序列留長駐捕獲
- **無清單**：無 `capture-manifest.json` 之 JSONL 檔不可重現——若不知何版生之，則不能對下月之二進制 diff
- **捕他用戶流量**：不在範。線路捕獲用於自之帳號於自之機。若捕獲意外錄他用戶請求，刪之並緊其道

## 相關技能

- `monitor-binary-version-baselines` — 父方法論之第一階段；生此技能清單所引之版本基線
- `probe-feature-flag-state` — 第二至三階段；線路捕獲為其證據支之一，此技能教捕獲之半
- `instrument-distributed-tracing` — 共 JSONL-掛鐘之哲學；此處應於單一二進制而非服務網格
- `redact-for-public-disclosure` — 第五階段；此技能僅涵內部用之捕獲時遮，非任何捕獲離私工作區前所需之發布級遮
