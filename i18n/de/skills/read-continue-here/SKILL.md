---
name: read-continue-here
description: >
  Read a CONTINUE_HERE.md continuation file at session start and resume
  from where the prior session left off. Covers detecting the file, assessing
  freshness, parsing the structured handoff, confirming the resumption plan
  with the user, and cleaning up after consumption. Optionally configures a
  SessionStart hook and CLAUDE.md instruction for automatic pickup. Use at the
  start of a session when a continuation file exists, when bootstrapping after
  an interrupted session, or when setting up automatic continuation detection.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, read
  locale: de
  source_locale: en
  source_commit: 025eea68
  fence_basis_commit: c248c5f0c
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Continue-Here lesen

Eine strukturierte Continuation-Datei lesen und Arbeit von dort fortsetzen wo die vorige Sitzung aufgehoert hat.

## Wann verwenden

- Eine neue Sitzung beginnen und CONTINUE_HERE.md existiert im Projekt-Root
- Nachdem ein SessionStart-Hook Continuation-Kontext injiziert
- Bootstrappen von Identitaet und Erkennen frueher Sitzungs-Artefakte
- Automatische Continuation-Detection fuer ein Projekt einrichten (einmalige Infrastruktur)

## Eingaben

- **Erforderlich**: Ein Projektverzeichnis (Default: aktuelles Arbeitsverzeichnis)
- **Optional**: Ob Infrastruktur konfiguriert werden soll (SessionStart-Hook + CLAUDE.md-Anweisung)
- **Optional**: Ob die Datei nach Konsumierung geloescht werden soll (Standard: ja)

## Vorgehensweise

### Schritt 1: Continuation-Datei erkennen und lesen

Auf `CONTINUE_HERE.md` im Projekt-Root pruefen:

```bash
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || ROOT=$PWD
CONTINUE_FILE=
for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do
  if [ -f "$ROOT/$candidate" ]; then CONTINUE_FILE="$ROOT/$candidate"; break; fi
done
if [ -n "$CONTINUE_FILE" ]; then
  echo "handoff: $CONTINUE_FILE"
else
  ELSEWHERE=$(find "$ROOT" -maxdepth 3 -name 'CONTINUE_HERE.md' \
    -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -5)
  if [ -n "$ELSEWHERE" ]; then
    echo "no handoff at a resolved path, but one exists elsewhere:"
    echo "$ELSEWHERE"
  else
    echo "no handoff"
  fi
fi
```

Wenn abwesend, anmutig beenden — es gibt nichts wovon fortzusetzen ist.

Wenn praesent, die Datei-Inhalte lesen. Die 5 Abschnitte parsen: Objective, Completed, In Progress, Next Steps, Context. Den Zeitstempel und Branch aus der Header-Zeile extrahieren.

**Erwartet:** Die Datei wird gelesen und ihre Abschnitte werden in ein klares mentales Modell des vorigen Sitzungs-Zustands geparst.

**Bei Fehler:** Wenn die Datei existiert aber missgebildet ist (fehlende Abschnitte, leer), als partielles Signal behandeln — extrahieren was praesent ist und vermerken was fehlt fuer den Benutzer.

### Schritt 2: Frische bewerten

Den Zeitstempel der Datei mit der aktuellen Zeit vergleichen:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

Frische klassifizieren:
- **Frisch** (< 24 Stunden, gleicher Branch): sicher direkt zu handeln
- **Veraltet** (> 24 Stunden oder anderer Branch): den Benutzer markieren bevor fortgefahren wird
- **Ueberholt** (neue Commits existieren nach dem Handoff-Zeitstempel): jemand hat seit dem Handoff am Projekt gearbeitet

Branch-Ausrichtung pruefen:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

**Erwartet:** Eine Frische-Bewertung mit Klassifikation (frisch, veraltet oder ueberholt) und unterstuetzender Evidenz.

**Bei Fehler:** Wenn nicht in einem Git-Repo, Branch- und Commit-Pruefungen ueberspringen. Sich allein auf den Zeitstempel im Datei-Header verlassen.

### Schritt 3: Zusammenfassen und Resumption bestaetigen

Den Continuation-Zustand dem Benutzer praegnant praesentieren:
- "Vorige Sitzung Objective: [Objective]"
- "Erledigt: [Zusammenfassung]"
- "In Bearbeitung: [Zusammenfassung]"
- "Vorgeschlagene naechste Aktion: [Next Steps Item 1]"

Wenn Frische "veraltet" oder "ueberholt" ist, die Evidenz praesentieren und fragen ob mit dem Handoff fortzufahren oder frisch zu beginnen ist.

Wenn irgendwelche Next-Steps-Items mit `**[USER]**` markiert sind, diese explizit an die Oberflaeche bringen — sie erfordern Benutzer-Entscheidungen bevor Arbeit fortschreiten kann.

**Erwartet:** Der Benutzer bestaetigt den Resumption-Plan, moeglicherweise mit Anpassungen. Der Agent hat ein klares Mandat fuer was als naechstes zu tun ist.

**Bei Fehler:** Wenn der Benutzer "frisch beginnen" oder "diese Datei ignorieren" sagt, anerkennen und ohne den Continuation-Kontext fortfahren. Anbieten die Datei zu loeschen um zukuenftige Verwirrung zu verhindern.

### Schritt 4: Auf den Handoff handeln

Mit Arbeit von Next Steps Item 1 beginnen (oder wo immer der Benutzer hingelenkt hat):
- In-Progress-Items referenzieren um partiellen Zustand zu verstehen
- Den Context-Abschnitt nutzen um nicht erneut fehlgeschlagene Ansaetze zu versuchen
- Completed-Items als erledigt behandeln — nicht erneut verifizieren ausser der Benutzer fragt

**Erwartet:** Der Agent arbeitet produktiv an der richtigen Aufgabe, informiert durch die Continuation-Datei.

**Bei Fehler:** Wenn die Next Steps mehrdeutig sind oder der In-Progress-Zustand unklar ist, den Benutzer um Klaerung bitten statt zu raten.

### Schritt 5: Aufraeumen

Nachdem der Handoff konsumiert wurde und Arbeit im Gange ist, CONTINUE_HERE.md loeschen:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  # Tracked: the deletion is recoverable, which is what makes it safe.
  git rm -q "$CONTINUE_FILE" && git commit -qm 'chore: consume the session handoff'
else
  # Untracked, ignored, or no repository at all — all three land here, and for
  # all three an ordinary delete is the right and only option.
  rm -- "$CONTINUE_FILE"
fi
```

Veraltete Continuation-Dateien verursachen Verwirrung in zukuenftigen Sitzungen.

**Erwartet:** Die Datei ist entfernt. Der Projekt-Root ist sauber.

**Bei Fehler:** Wenn der Benutzer die Datei behalten will (z.B. als Referenz waehrend der Sitzung), sie lassen aber vermerken dass sie vor Sitzungs-Ende geloescht werden sollte um zu verhindern dass die naechste Sitzung sie erneut konsumiert.

### Schritt 6: SessionStart-Hook konfigurieren (Optional)

Wenn noch nicht konfiguriert, automatisches Lesen von CONTINUE_HERE.md beim Sitzungs-Start einrichten.

Das Hook-Skript erstellen:

```bash
mkdir -p ~/.claude/hooks/continue-here

cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'
#!/usr/bin/env bash
# SessionStart hook: inject the resolved CONTINUE_HERE.md into session context.
# OS-aware: works on native Linux, WSL, macOS, and Windows (Git Bash/MSYS).
set -uo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || ROOT=$PWD
CONTINUE_FILE=
for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do
  if [ -f "$ROOT/$candidate" ]; then CONTINUE_FILE="$ROOT/$candidate"; break; fi
done

emit() {
  # additionalContext sits DIRECTLY under hookSpecificOutput. Nesting it inside a
  # "sessionStartContext" object — the shape this hook shipped until 2.0 — names a
  # key Claude Code does not know, so the whole object is discarded and the failure
  # is reported nowhere the user will look (#844). stdout carries the JSON and
  # nothing else.
  if command -v jq >/dev/null 2>&1; then
    ESCAPED=$(printf '%s' "$1" | jq -Rsa .)
  else
    ESCAPED=$(printf '%s' "$1" | awk '
      BEGIN { ORS=""; print "\"" }
      {
        gsub(/\\/, "\\\\")
        gsub(/"/, "\\\"")
        gsub(/\t/, "\\t")
        if (NR > 1) print "\\n"
        print
      }
      END { print "\"" }
    ')
  fi
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}' "$ESCAPED"
}

if [ -n "$CONTINUE_FILE" ]; then
  # Strip CRLF (files on NTFS often have Windows line endings)
  emit "$(sed 's/\r$//' "$CONTINUE_FILE")"
  exit 0
fi

# No handoff at a resolved path. Exiting silently here is what made a misplaced
# handoff indistinguishable from a project that has none, so look once more, cheaply,
# and say what was found.
ELSEWHERE=$(find "$ROOT" -maxdepth 3 -name 'CONTINUE_HERE.md' \
  -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -5)
if [ -n "$ELSEWHERE" ]; then
  emit "A CONTINUE_HERE.md exists in this project but not where the continuation hook resolves it. The hook looks for CONTINUE_HERE.md, docs/CONTINUE_HERE.md and .claude/CONTINUE_HERE.md, relative to the repository root. Found instead:
$ELSEWHERE
Read it if it is a handoff for this session, or move it to one of the resolved paths."
fi
exit 0
SCRIPT

chmod +x ~/.claude/hooks/continue-here/read-continuation.sh
```

Zu `~/.claude/settings.json` im SessionStart-Hooks-Array hinzufuegen:

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

**Erwartet:** Das Hook-Skript existiert, ist ausfuehrbar und ist in settings.json registriert. Beim naechsten Sitzungs-Start, wenn CONTINUE_HERE.md existiert, wird ihr Inhalt in den Sitzungs-Kontext injiziert.

**Bei Fehler:** Pruefen dass settings.json gueltiges JSON nach Bearbeitung ist. Den Hook manuell testen: `cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`. Das Skript faellt auf `awk` zurueck wenn `jq` nicht installiert ist, also wird `jq` empfohlen aber nicht verlangt.

### Schritt 7: CLAUDE.md-Anweisung hinzufuegen (Optional)

Eine kurze Anweisung zu CLAUDE.md des Projekts hinzufuegen damit Claude den Zweck der Datei versteht:

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**Erwartet:** CLAUDE.md enthaelt die Anweisung. Zukuenftige Sitzungen werden CONTINUE_HERE.md lesen und darauf handeln auch wenn der SessionStart-Hook nicht konfiguriert ist.

**Bei Fehler:** Wenn CLAUDE.md nicht existiert, sie mit nur diesem Abschnitt erstellen. Wenn die Datei zu lang ist, die Anweisung nahe am Anfang hinzufuegen wo sie nicht abgeschnitten wird.

## Validierung

- [ ] CONTINUE_HERE.md wurde erkannt (oder Abwesenheit wurde anmutig behandelt)
- [ ] Frische wurde bewertet (Zeitstempel, Branch, Post-Handoff-Commits)
- [ ] Resumption-Plan wurde dem Benutzer praesentiert und bestaetigt
- [ ] Arbeit begann vom korrekten Next-Steps-Item
- [ ] Die Datei wurde nach Konsumierung aufgeraeumt
- [ ] (Optional) SessionStart-Hook-Skript existiert und ist ausfuehrbar
- [ ] (Optional) CLAUDE.md enthaelt die Sitzungs-Continuity-Anweisung

## Haeufige Stolperfallen

- **Handeln ohne Bestaetigung**: Den Resumption-Plan immer dem Benutzer praesentieren. Er kann seine Meinung geaendert haben worueber zu arbeiten ist, auch wenn die Datei frisch ist.
- **Veralteten Dateien blind vertrauen**: Eine Continuation-Datei aelter als 24 Stunden oder von einem anderen Branch ist ein Vorschlag, kein Mandat. Immer Frische pruefen.
- **Den Context-Abschnitt ignorieren**: Der wertvollste Teil der Datei sind oft die fehlgeschlagenen Ansaetze. Diesen Abschnitt zu ueberspringen fuehrt zum erneuten Versuchen von Sackgassen.
- **Aufraeumen vergessen**: CONTINUE_HERE.md nach Konsumierung zu lassen verursacht Verwirrung in der naechsten Sitzung, die versuchen wird erneut darauf zu handeln.
- **Completed-Items als unverifiziert behandeln**: Ausser der Benutzer fragt spezifisch, abgeschlossene Arbeit nicht erneut machen. Der Bewertung der vorigen Sitzung vertrauen.

## Verwandte Skills

- `write-continue-here` — das Komplement: die Continuation-Datei am Sitzungs-Ende schreiben
- `bootstrap-agent-identity` — volle Identitaets-Rekonstruktion die Continuation-Detection als eine Heuristik einschliesst
- `manage-memory` — dauerhaftes sitzungsuebergreifendes Wissen (komplementiert diesen ephemeren Handoff)
- `write-claude-md` — Projekt-Anweisungen wo die optionale Continuity-Anleitung lebt
