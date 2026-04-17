---
name: conduct-empirical-wire-capture
description: >
  Erfasst ausgehenden HTTP-Verkehr und Telemetrie eines CLI-Harness zur
  Laufzeit. Behandelt die Auswahl des Erfassungskanals (Transkriptdatei
  vs. Verbose-Fetch-stderr vs. ausgehender Proxy vs. Zustand auf Platte),
  hook-getriebene Einzelereignis-Erfassung vs. langlaufende Sitzungs-
  erfassung, JSONL-Ausgabeformat für diff-freundliche Artefakte sowie
  die Observability-Tabelle, die jedes Ziel dem kostengünstigsten Kanal
  zuordnet, der es erfasst. Einzusetzen, wenn ein statischer Befund eine
  Laufzeitbestätigung benötigt, wenn eine Payload-Form für eine Client-
  Neuimplementierung gebraucht wird oder wenn eine Dark-vs-Live-
  Unterscheidung erfordert, tatsächlich zu beobachten, was das Binary
  sendet.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, wire-capture, http, telemetry, jsonl, observability
  locale: de
  source_locale: en
  source_commit: b9570f58
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# Conduct Empirical Wire Capture

Einen reproduzierbaren Wire-Capture-Harness für den ausgehenden HTTP-Verkehr und die Telemetrie eines CLI-Werkzeugs einrichten und dabei jedes Observability-Ziel dem kostengünstigsten Kanal zuordnen, der es erfasst.

## Geltungsbereich und Ethik

Vor der Konfiguration jeglicher Erfassung lesen.

- Wire Capture ist ausschließlich für **eigene** Anfragen gegen das **eigene** Konto auf der **eigenen** Maschine gedacht. Das Erfassen des Datenverkehrs anderer Nutzer ist Exfiltration, keine Forschung, und liegt außerhalb des Geltungsbereichs.
- In rohen Wire-Ausgaben tauchen fast immer Zugangsdaten auf. Redaktion zum Zeitpunkt der Erfassung durchführen (Schritt 6) — niemals nach dem Motto „erst erfassen, später redigieren".
- Erfassung ist *Beobachtung*, keine Modifikation. Erfasste Payloads nicht dazu nutzen, serverseitige Rate-Limits zu umgehen, die Sitzung eines anderen Nutzers zu replayen oder eine dunkel ausgerollte Fähigkeit ohne Autorisierung zu aktivieren.
- Das Ergebnis dieses Skills ist ein internes Artefakt. Die öffentliche Veröffentlichung von Wire-Befunden läuft über `redact-for-public-disclosure` (Phase 5 des übergeordneten Leitfadens), nicht über diesen Skill.

## Wann verwenden

- Ein statischer Befund (ein Flag, eine Endpunkt-Referenz, ein Telemetrie-Ereignisname) benötigt eine Laufzeitbestätigung, dass er tatsächlich ausgelöst wird.
- Eine Payload-Form wird für eine Client-Neuimplementierung, eine Tracing-Instrumentierung oder einen versionsübergreifenden Diff benötigt.
- Eine Dark-vs-Live-Unterscheidung erfordert die Beobachtung dessen, was das Binary tatsächlich sendet — nicht dessen, was das Bundle nahelegt.
- Ein Verhalten hat sich zwischen Versionen stillschweigend geändert und ein reproduzierbares Artefakt wird benötigt, um gegen zukünftige Versionen zu vergleichen.

Diesen Skill **nicht** verwenden für: Versions-Baselining (dafür `monitor-binary-version-baselines`), Flag-Zustandsprüfung (dafür `probe-feature-flag-state`) oder das Vorbereiten redigierter Artefakte zur öffentlichen Veröffentlichung (dafür `redact-for-public-disclosure`).

## Eingaben

- **Erforderlich**: Ein CLI-Harness-Binary, das lokal gegen das eigene Konto ausgeführt werden kann.
- **Erforderlich**: Eine konkrete Frage, die beantwortet werden soll (z. B. „feuert Endpunkt X bei Ereignis Y?", „wie sieht die Payload-Form für Telemetrie-Ereignis Z aus?"). Eine Erfassung ohne Fragestellung erzeugt ein Log, das niemand liest.
- **Optional**: Statische Befunde aus vorangegangenen Phasen (Marker-Katalog, Kandidaten-Flag-Liste, verdächtige Endpunkte), die die Erfassungsziele eingrenzen.
- **Optional**: Ein privater Arbeitsbereich-Pfad für Erfassungsartefakte. Standard ist `./captures/` — muss in `.gitignore` stehen.

## Vorgehen

### Schritt 1: Zuerst die Observability-Tabelle aufbauen

Bevor irgendeine Erfassung konfiguriert wird, die zu beantwortenden Fragen auflisten und jede einem Erfassungskanal zuordnen. Eine Zeile pro Ziel.

| target | observable via | blocker |
|---|---|---|
| Outbound HTTP to endpoint X | verbose-fetch stderr | TUI noise pollutes terminal |
| Telemetry event Y on user action | hook-driven subprocess | requires harness hook surface |
| Token-refresh handshake | outbound HTTP proxy | cert trust required |
| Scheduled-task lifecycle event | long-running session capture | wallclock alignment |
| Local config mutation | on-disk state diff | none — cheapest channel |

Gängige Kanäle, kostengünstigster zuerst:

- **Mutation der Zustandsdatei auf Platte** — wenn der Harness seinen Zustand auf einen bekannten Pfad schreibt, ist `diff` zwischen Snapshots kostenlos.
- **Transkriptdatei** — wenn der Harness ohnehin ein Sitzungstranskript schreibt, dieses direkt parsen. Keine Instrumentierung nötig.
- **Verbose-Fetch-stderr** — vom Bundler bereitgestellte Umgebungsvariable (z. B. Buns `BUN_CONFIG_VERBOSE_FETCH=curl`) leitet jeden Fetch an stderr. Laut, erfasst aber jeden Fetch.
- **Hook-getriebener Subprozess** — wenn der Harness Lifecycle-Hooks exponiert (`UserPromptSubmit`, `Stop` usw.), für jedes Ereignis einen kurzen Erfassungs-Subprozess starten.
- **Langlaufende Sitzungserfassung** — ein Prozess über die gesamte Sitzung, mit Wallclock versehen. Für Sequenzen verwenden.
- **Ausgehender HTTP-Proxy** — saubere Trennung, erfordert aber CA-Zertifikatsvertrauen und bricht, wenn der Harness Zertifikate pinnt.

Den kostengünstigsten Kanal wählen, der das Ziel erfasst. Eine Erfassung mit 3 Zielen, die eine konkrete Frage beantwortet, schlägt eine Erfassung mit 20 Zielen, die keine beantwortet.

**Expected:** eine Observability-Tabelle mit einer Zeile pro Frage, jeweils mit Kanal und bekannten Blockern annotiert. Ziele ohne tragfähigen Kanal werden als „außerhalb des Geltungsbereichs dieser Sitzung" gekennzeichnet.

**On failure:** landet jedes Ziel in der Proxy-Spalte, ist die Tabelle zu ambitioniert. Auf die ein oder zwei wertvollsten Fragen reduzieren und für diese nochmals günstigere Kanäle prüfen.

### Schritt 2: Einen verwerflichen Arbeitsbereich vorbereiten

Wire Capture verschmutzt Terminals, hinterlässt Dateien an unerwarteten Orten und kann Zugangsdaten in Logs lecken.

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

Sicherstellen, dass die Erfassungssitzung nicht die primäre Arbeitssitzung ist — Verbose-Fetch und TUI-Rendering stören sich gegenseitig.

**Expected:** ein zeitgestempeltes Erfassungsverzeichnis, git-ignoriert, getrennt von der Arbeitssitzung.

**On failure:** meldet `git check-ignore` das Verzeichnis als nicht ignoriert, die `.gitignore` korrigieren, bevor ein Erfassungsbefehl ausgeführt wird. Nicht mit gefährdeten Zugangsdaten fortfahren.

### Schritt 3: Hook-getriebene Erfassung für Einzelereignis-Ziele

Wenn das Ziel ein diskretes Ereignis ist (ein Tool-Aufruf, eine Prompt-Einreichung, ein Sitzungsstopp), die Hook-Oberfläche des Harness nutzen. Für jedes Ereignis einen kurzlebigen Erfassungs-Subprozess starten; nicht in-process verweilen.

Das Muster (synthetisches Beispiel):

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

Warum Subprozess pro Ereignis:

- Kein Tokenzustand, keine Sitzungskopplung — jeder Aufruf ist unabhängig.
- Das Fehlschlagen einer Erfassung kontaminiert die nächste nicht.
- Der Subprozess-Overhead ist akzeptabel, weil Ereignisse selten sind (pro Nutzeraktion, nicht pro Byte).

**Expected:** eine JSONL-Zeile pro ausgelöstem Ereignis in `events.jsonl`, jede wohlgeformt und per `jq` parsebar.

**On failure:** meldet `jq` Parse-Fehler, enthält die Payload unescapte Steuerzeichen oder Binärdaten — stattdessen durch `jq -R` (raw input) leiten und das Payload-Feld base64-kodieren.

### Schritt 4: Langlaufende Sitzungserfassung für sequentiellen Zustand

Wenn das Ziel eine Sequenz ist (mehrstufiger Handshake, Lifecycle geplanter Aufgaben, Retry/Backoff-Zustandsautomat), einen Erfassungsprozess über die gesamte Sitzung, mit Wallclock versehen.

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

Das Wallclock-Präfix macht die Reihenfolge eindeutig, wenn mehrere Erfassungen gleichzeitig laufen. TSV (tab-getrennt) ist bewusst gewählt — es übersteht Shells, die JSON-Quoting auf stderr verstümmeln.

TSV erst nach Sitzungsende (Schritt 5) nach JSONL konvertieren, nicht währenddessen.

**Expected:** ein TSV-Log mit monoton steigenden Zeitstempeln, eine stderr-Zeile pro Reihe.

**On failure:** laufen Zeitstempel rückwärts, puffert der Harness stderr — mit `stdbuf -oL -eL` oder dem Line-Buffer-Flag des Bundlers neu ausführen.

### Schritt 5: Auf JSONL normalisieren

JSONL ist das Artefaktformat: ein JSON-Objekt pro Zeile, Felder `timestamp`, `source`, `target`, `payload`. Diff-freundlich, per `jq` filterbar und stabil über Editor-Reloads hinweg.

```bash
# Parse the TSV from Step 4 into JSONL.
awk -F'\t' '{
  printf "{\"timestamp\":\"%s\",\"source\":\"verbose-fetch\",\"target\":\"%s\",\"payload\":%s}\n",
    $1, "session", $2
}' < session.tsv | jq -c . > session.jsonl
```

Prüfen, ob jede Zeile parst:

```bash
while IFS= read -r line; do
  echo "$line" | jq -e . > /dev/null || echo "BAD LINE: $line"
done < session.jsonl
```

Typische Filter-Verwendung:

```bash
# Show only requests to a specific endpoint pattern.
jq -c 'select(.payload | tostring | test("/api/v1/example"))' session.jsonl

# Show timing between consecutive captures.
jq -r '.timestamp' session.jsonl | sort | uniq -c
```

**Expected:** jede Zeile von `*.jsonl` parst mit `jq -e .`; keine `BAD LINE`-Warnungen.

**On failure:** scheitern einzelne Zeilen an der Validierung, enthielt die Quell-TSV eingebettete Tabs in der Payload — Schritt 4 mit einem anderen Trennzeichen neu ausführen oder das zweite Feld base64-kodieren.

### Schritt 6: Redaktion zum Erfassungszeitpunkt

Auth-Header, Sitzungs-IDs, Bearer-Tokens und PII **vor** dem Schreiben auf Platte entfernen. Die `events.jsonl`- und `session.jsonl`-Dateien sollen beim ersten Schreibvorgang kein einziges Geheimnis enthalten.

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

Nach der Erfassung verifizieren, dass nichts durchgerutscht ist:

```bash
# Patterns that must not appear in any *.jsonl file.
grep -Ei 'bearer [A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' captures/ \
  && { echo "LEAK DETECTED"; exit 1; } \
  || echo "redaction clean"
```

Das Muster „erst erfassen, dann redigieren" lässt immer etwas durchsickern. Das einzig sichere Muster ist „redigiert beim Erfassen". Wird ein nicht redigiertes Token in einem finalisierten Artefakt entdeckt, die gesamte Erfassung als kompromittiert behandeln — löschen, die Zugangsdaten rotieren und neu ausführen.

**Expected:** die `LEAK DETECTED`-Prüfung endet mit Exitcode 0 (keine Treffer). `grep` nach bekannten Zugangsdaten-Präfixen liefert nichts.

**On failure:** findet die Leck-Prüfung einen Treffer, die Datei nicht in-place editieren. Das gesamte Erfassungsverzeichnis löschen, die Redaktor-Regex um die geleckte Musterkategorie erweitern und ab Schritt 3 oder 4 neu ausführen.

### Schritt 7: Antwortkategorien vor dem Aufzeichnen klassifizieren

HTTP-Statuscodes tragen in verschiedenen Kontexten unterschiedliches semantisches Gewicht. Vor dem Aufzeichnen klassifizieren, damit nachgelagerte `jq`-Filter auf Intention und nicht auf Rohcodes operieren.

| Observed status | Channel context | Classification |
|---|---|---|
| 200 / 201 | Any | success |
| 401 on token-refresh endpoint | Handshake | expected handshake step |
| 401 on data endpoint | After auth | auth failure (real) |
| 404 on lazy-loaded resource | First fetch | expected miss |
| 404 on documented endpoint | After feature gate | gate-induced absence |
| 429 | Any | rate-limit (back off; do not retry tight) |
| 5xx | Any | server failure (record, do not assume) |

Ein `class`-Feld zum Erfassungszeitpunkt hinzufügen:

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

Ein 401 auf einem Token-Refresh-Kanal ist kein Fehler — es ist die erste Hälfte eines Handshakes. Handshake-Schritte fälschlich als Fehler zu klassifizieren produziert falsch-positive Befunde, die die Aufmerksamkeit der Reviewer verschwenden.

**Expected:** jede Zeile in `*.classified.jsonl` hat ein `class`-Feld mit einem bekannten Wert.

**On failure:** erzeugt die Klassifizierung viele `other`-Einträge, ist die obige Tabelle für diesen Harness unvollständig — vor weiterer Analyse um eine Zeile pro wiederkehrendem `other`-Muster erweitern.

### Schritt 8: Das Erfassungs-Manifest persistieren

Ein Erfassungslauf ist nur dann reproduzierbar, wenn die Eingaben neben den Ausgaben festgehalten sind. Ein Manifest schreiben:

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

Das Manifest ist das, was die Erfassung gegen künftige Versionen diff-fähig macht.

**Expected:** `capture-manifest.json` existiert, parst mit `jq` und listet jede Artefaktdatei im Erfassungsverzeichnis auf.

**On failure:** hat der Harness kein Versions-Flag, stattdessen den `sha256sum` des Binaries festhalten. Ein nicht identifiziertes Binary erzeugt nicht vergleichbare Erfassungen.

## Validierung

- [ ] Observability-Tabelle vor jedem Erfassungsbefehl erstellt
- [ ] Erfassungsverzeichnis ist git-ignoriert und zeitgestempelt
- [ ] Jede `*.jsonl`-Datei parst zeilenweise mit `jq -e .`
- [ ] Redaktions-Leckprüfung liefert keine Treffer für bekannte Zugangsdaten-Präfixe
- [ ] Jedes erfasste Ereignis hat ein `class`-Feld mit bekanntem Wert
- [ ] `capture-manifest.json` hält Harness-Version (oder sha256), Kanal und Fragestellung fest
- [ ] Das Erfassungsverzeichnis enthält nur die in Schritt 1 aufgezählten Ziele (kein beiläufiger Verkehr anderer Apps)

## Häufige Fallstricke

- **Erst erfassen, später fragen**: ein Log, das niemand liest, ist verschwendeter Speicherplatz und verschwendete Aufmerksamkeit. Erst die Observability-Tabelle bauen; nur das erfassen, was eine konkrete Frage beantwortet.
- **Zuerst zu `mitmproxy` greifen**: ein ausgehender Proxy ist der invasivste Kanal. Er erfordert Zertifikatsvertrauen, bricht bei Certificate Pinning und verschmutzt die Umgebung des Harness. Nur einsetzen, wenn On-Disk-, Transkript-, Verbose-Fetch- und Hook-Kanäle allesamt blockiert sind.
- **Erfassen in der primären Arbeitssitzung**: Verbose-Fetch-stderr blutet ins TUI-Rendering und kann Fragmente anderer Arbeit in die Erfassung lecken. Stets eine verwerfliche Shell verwenden.
- **„Wir redigieren später"**: jedes „erst erfasste, dann redigierte" Artefakt hat mindestens einmal Zugangsdaten geleckt. Zum Erfassungszeitpunkt redigieren — oder gar nicht erfassen.
- **4xx pauschal als Fehler behandeln**: ein 401 auf einem Token-Refresh-Kanal ist ein Handshake-Schritt, kein Fehler. Antwortkategorien pro Kanalkontext klassifizieren (Schritt 7), bevor Schlüsse gezogen werden.
- **Langlaufende Erfassung für Einzelereignis-Ziele**: ein sitzungslanger Prozess zur Erfassung dreier diskreter Ereignisse koppelt den Tokenzustand über die Erfassungen hinweg und lässt ein schlechtes Ereignis das nächste vergiften. Für Ereignisse hook-getriebene Subprozesse; Sitzungserfassung für Sequenzen reservieren.
- **Kein Manifest**: eine JSONL-Datei ohne `capture-manifest.json` ist nicht reproduzierbar — sie lässt sich nicht gegen das Binary des nächsten Monats diffen, wenn unbekannt ist, welche Version sie erzeugt hat.
- **Datenverkehr anderer Nutzer erfassen**: außerhalb des Geltungsbereichs. Wire Capture gilt dem eigenen Konto auf der eigenen Maschine. Wird die Anfrage eines anderen Nutzers beiläufig aufgezeichnet, die Erfassung löschen und den Kanal enger fassen.

## Verwandte Skills

- `monitor-binary-version-baselines` — Phase 1 der übergeordneten Methodik; erzeugt die Versions-Baseline, auf die das Manifest dieses Skills verweist.
- `probe-feature-flag-state` — Phasen 2–3; Wire Capture ist einer ihrer Evidenz-Zweige, und dieser Skill lehrt die Erfassungshälfte.
- `instrument-distributed-tracing` — teilt die Philosophie „JSONL über Wallclock"; hier auf ein einzelnes Binary angewandt statt auf ein Service-Mesh.
- `redact-for-public-disclosure` — Phase 5; dieser Skill deckt nur die Erfassungszeit-Redaktion für den internen Gebrauch ab, nicht die Publikationsschwelle, die vor dem Verlassen eines privaten Arbeitsbereichs nötig ist.
