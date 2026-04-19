---
name: conduct-empirical-wire-capture
locale: wenyan
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

# 行實線之捕

設可復之線捕於 CLI 具之出 HTTP 與遙測，每察目對至廉之管以捕。

## 範與倫

設捕前讀之。

- 線捕乃為**己**求於**己**帳於**己**機。捕他人之流乃洩非研，不在範內。
- 原線出幾必含憑。於捕時除之（第六步）——勿「先捕後除」。
- 捕者*察*也，非改。勿以所捕之載繞服側之率限、重放他人之話、或未授而啟暗發之能。
- 此技之出乃內之品。公表線果經 `redact-for-public-disclosure`（父引第五段），非此技。

## 用時

- 靜得（旗、端、遙件名）需行時之確以證真發
- 需載之形為客重建、為跟蹤之儀、或為跨版之 diff
- 暗活之辨需察二真發者，非束之示
- 版間行默變而欲可復之品以比將來

**勿**用於：版基立（用 `monitor-binary-version-baselines`）、旗態探（用 `probe-feature-flag-state`）、備除品為公表（用 `redact-for-public-disclosure`）。

## 入

- **必**：可於己帳本地行之 CLI 具二進
- **必**：具體之問（如「端 X 於件 Y 發乎？」、「遙件 Z 之載形為何？」）。無問之捕生無人讀之誌。
- **可選**：前段靜得（標目、候旗列、疑端）以縮捕目
- **可選**：品之私處徑。默 `./captures/`——必於 `.gitignore`

## 法

### 第一步：先建察表

設捕前，列需答之問而每映於捕管。每目一行。

| target | observable via | blocker |
|---|---|---|
| Outbound HTTP to endpoint X | verbose-fetch stderr | TUI noise pollutes terminal |
| Telemetry event Y on user action | hook-driven subprocess | requires harness hook surface |
| Token-refresh handshake | outbound HTTP proxy | cert trust required |
| Scheduled-task lifecycle event | long-running session capture | wallclock alignment |
| Local config mutation | on-disk state diff | none — cheapest channel |

常管，自廉至貴：

- **碟上態之變**——具書其態於已知徑時，`diff` 攝間為免費
- **抄錄檔**——具自書話抄錄時，直解之。無儀
- **Verbose-fetch stderr**——捆包之環（如 bun 之 `BUN_CONFIG_VERBOSE_FETCH=curl`）路每取於 stderr。噪而捕每取
- **鉤驅子行**——具露生命鉤（`UserPromptSubmit`、`Stop` 等）時，每件生短捕子行
- **長行話捕**——一行跨話，附壁鐘標。用於序
- **出 HTTP 代**——清分，而需 CA 證信且於具釘證時破

擇至廉之管以捕目。三目捕答一具體問勝於二十目捕無答。

**得：** 察表每問一行，附管與已知之阻。無可行管之目標「此話外範」。

**敗則：** 若每目皆落代欄，表過大。縮至一二最值問而查低本管。

### 第二步：備棄之處

線捕污端末、留檔於外處、或洩憑入誌。

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

確捕話非汝主作話——verbose-fetch 與 TUI 渲染相擾。

**得：** 時戳之捕目，已 git 忽，離主作。

**敗則：** 若 `git check-ignore` 報目未忽，行任捕令前修 `.gitignore`。勿以憑冒險。

### 第三步：鉤驅之捕於每件之目

目為離件（具呼、問提、話止）時，用具之鉤面。每件生短子行；勿於行內坐。

式（例）：

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

每件子行之由：

- 無符態，無話耦——每呼獨
- 一捕敗不污下一
- 子行之冗可受，因件罕（每用動，非每位）

**得：** 每發件於 `events.jsonl` 一 JSONL 行，皆 `jq` 可析之 JSON。

**敗則：** 若 `jq` 報析誤，載含未逸控字或二進——經 `jq -R`（原入）而以 base64 編載欄代。

### 第四步：長行話捕於序態

目為序（多輪握、排任生命、試退之機）時，一捕行跨話附壁鐘標。

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

壁鐘前綴使序明於並行捕時。TSV 故意——於錯 JSON 引於 stderr 之殼仍存。

話畢後 TSV 化 JSONL（第五步），非行中。

**得：** TSV 誌附遞增時戳，每 stderr 一行。

**敗則：** 若時戳倒，具於緩 stderr——以 `stdbuf -oL -eL` 或等之行緩旗再行。

### 第五步：歸於 JSONL

JSONL 乃品式：每行一 JSON 物，欄 `timestamp`、`source`、`target`、`payload`。diff 友、`jq` 可濾、編輯重載仍穩。

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

常濾之用：

```bash
# Show only requests to a specific endpoint pattern.
jq -c 'select(.payload | tostring | test("/api/v1/example"))' session.jsonl

# Show timing between consecutive captures.
jq -r '.timestamp' session.jsonl | sort | uniq -c
```

**得：** `*.jsonl` 每行以 `jq -e .` 析；無 `BAD LINE` 警。

**敗則：** 若某行不過，源 TSV 載中有 tab——以他分隔再行第四步或 base64 編二欄。

### 第六步：於捕時除

剝認頭、話識、bearer 符、PII **先**於書碟。`events.jsonl` 與 `session.jsonl` 於初書不可有一秘。

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

`captured-then-redacted` 之品必漏。唯安式為 `redacted-as-captured`。若於終品發現未除之符，視整捕為已陷——刪之、輪換憑、再行。

**得：** `LEAK DETECTED` 察退 0（無配）。`grep` 於已知憑前綴無返。

**敗則：** 若察得中，勿就地改檔。刪整捕目，擴除正則以涵漏式類，自第三或第四步再行。

### 第七步：錄前分應類

HTTP 狀碼於異境有異義重。分於錄前以使下游 `jq` 濾於意非原碼。

| Observed status | Channel context | Classification |
|---|---|---|
| 200 / 201 | Any | success |
| 401 on token-refresh endpoint | Handshake | expected handshake step |
| 401 on data endpoint | After auth | auth failure (real) |
| 404 on lazy-loaded resource | First fetch | expected miss |
| 404 on documented endpoint | After feature gate | gate-induced absence |
| 429 | Any | rate-limit (back off; do not retry tight) |
| 5xx | Any | server failure (record, do not assume) |

於捕時加 `class` 欄：

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

符換管之 401 非敗——乃握之初半。誤分握步為敗生假陽得而耗察者之神。

**得：** `*.classified.jsonl` 每行有 `class` 欄附已知值。

**敗則：** 若分生多 `other`，上表於此具不全——每重現 `other` 式加一行後續析。

### 第八步：存捕之冊

捕行可復唯入與出同錄。書冊：

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

冊使捕可 diff 於將來之版。

**得：** `capture-manifest.json` 存、`jq` 可析、列捕目中每品檔。

**敗則：** 若具無版旗，錄二進之 `sha256sum` 代。無識之二生不可比之捕。

## 驗

- [ ] 察表於任捕令行前建
- [ ] 捕目已 git 忽且時戳
- [ ] 每 `*.jsonl` 檔逐行以 `jq -e .` 析
- [ ] 除漏察於已知憑前綴無配
- [ ] 每捕件有 `class` 欄附已知值
- [ ] `capture-manifest.json` 錄具版（或 sha256）、管、問
- [ ] 捕目只含第一步所列目（無他應之偶流）

## 陷

- **先捕後問**：無人讀之誌耗碟耗神。先建察表；只捕答具體問者
- **先取 `mitmproxy`**：出代最侵之管。需證信、於釘證時破、污具之境。唯於碟、抄錄、verbose-fetch、鉤皆阻時用
- **於主作話捕**：verbose-fetch stderr 滲入 TUI 渲染可漏他作之片入捕。永用棄殼
- **「後除」**：每捕後除之品曾漏憑。於捕時除或勿捕
- **一律視 4xx 為敗**：符換管之 401 乃握步，非敗。依管境分應類（第七步）於下結論前
- **長行於每件目**：話長行捕三離件耦符態跨捕，使一惡件毒下。件用鉤驅子行；話捕留於序
- **無冊**：無 `capture-manifest.json` 之 JSONL 檔不可復——不知何版所生，不可於來月二進 diff
- **捕他人之流**：外範。線捕為己帳己機。若偶錄他人請求，刪之而縮管

## 參

- `monitor-binary-version-baselines` — 父法第一段；生此技冊所引之版基
- `probe-feature-flag-state` — 第二至三段；線捕乃其證之一，此技教其捕半
- `instrument-distributed-tracing` — 共 JSONL-於-壁鐘之哲；此應於單二，非服網
- `redact-for-public-disclosure` — 第五段；此技只涵捕時除為內用，非離私處前之表檻除
