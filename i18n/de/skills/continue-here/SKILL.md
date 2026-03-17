---
name: continue-here
description: >
  Eine CONTINUE_HERE.md-Datei schreiben, die den aktuellen Sitzungsstatus
  erfasst, damit eine neue Claude-Code-Sitzung dort weitermachen kann, wo
  diese aufgehoert hat. Umfasst das Bewerten der kuerzlichen Arbeit,
  Strukturierung der Fortsetzungsdatei und optionale Konfiguration eines
  SessionStart-Hooks fuer automatische Uebernahme. Verwenden beim Beenden
  einer Sitzung mit unvollendeter Arbeit, beim Uebergeben von Kontext
  zwischen Sitzungen oder beim Bewahren von Aufgabenstatus, den Git allein
  nicht erfassen kann.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow
---

# Hier fortfahren

Eine strukturierte Fortsetzungsdatei schreiben, damit die naechste Sitzung mit vollem Kontext beginnt.

## Wann verwenden

- Sitzung mit noch laufender Arbeit beenden
- Eine komplexe Aufgabe zwischen Sitzungen uebergeben
- Intent, fehlgeschlagene Ansaetze und naechste Schritte bewahren, die Git nicht erfassen kann
- Bevor Claude Code bei laufender Aufgabe geschlossen wird

## Eingaben

- **Erforderlich**: Eine aktive Sitzung mit kuerzlicher Arbeit zum Zusammenfassen
- **Optional**: Spezifische Anweisungen, was in der Uebergabe betont werden soll

## Vorgehensweise

### Schritt 1: Sitzungsstatus bewerten

Fakten ueber kuerzliche Arbeit zusammentragen:

```bash
git log --oneline -5
git status
git diff --stat
```

Den Konversationskontext ueberpruefen: Was war das Ziel, was wurde erledigt, was ist teilweise fertig, was wurde versucht und ist gescheitert, welche Entscheidungen wurden getroffen.

**Erwartet:** Klares Verstaendnis des aktuellen Aufgabenstatus — erledigte Elemente, laufende Elemente und geplante naechste Schritte.

**Bei Fehler:** Wenn kein Git-Repository vorhanden, Git-Befehle ueberspringen. Die Fortsetzungsdatei kann weiterhin Konversationskontext und Aufgabenstatus erfassen.

### Schritt 2: CONTINUE_HERE.md schreiben

Die Datei im Projektstamm mit der folgenden Struktur schreiben. Jeder Abschnitt muss handlungsrelevante Inhalte enthalten, keine Platzhalter.

```markdown
# Hier fortfahren

> Zuletzt aktualisiert: JJJJ-MM-TTTHH:MM:SSZ | Branch: aktueller-branch-name

## Ziel
Einabsaetzige Beschreibung, was wir zu erreichen versuchen und warum.

## Erledigt
- [x] Abgeschlossenes Element mit Schluessel-Dateipfaden (z. B. `src/feature.R`)
- [x] Getroffene Entscheidungen und ihre Begruendung

## In Arbeit
- [ ] Teilweise abgeschlossene Arbeit — aktuellen Zustand beschreiben (Branch, Datei:Zeile)
- [ ] Bekannte Probleme mit teilweiser Arbeit

## Naechste Schritte
1. Unmittelbar naechste Aktion (wichtigste)
2. Nachfolgende Aktionen in Prioritaetsreihenfolge
3. **[NUTZER]** Elemente, die Nutzereingabe oder Entscheidung benoetigen

## Kontext
- Fehlgeschlagene Ansaetze und warum sie nicht funktionierten
- Entdeckte Schluesseleinschraenkungen oder Kompromisse
- Relevante Issue-/PR-Links
```

Richtlinien:
- **Ziel**: Das WARUM erfassen — Git-Log zeigt was geaendert wurde, nicht warum
- **Erledigt**: Elemente klar als fertig markieren, um Wiederholung zu vermeiden
- **In Arbeit**: Dies ist der wertvollste Abschnitt — partieller Zustand ist am schwersten zu rekonstruieren
- **Naechste Schritte**: Nach Prioritaet nummerieren. Nutzerabhaengige Elemente mit `**[NUTZER]**` praefixen
- **Kontext**: Negativen Raum aufzeichnen — was versucht und abgelehnt wurde, und warum

**Erwartet:** Eine CONTINUE_HERE.md-Datei im Projektstamm mit allen 5 Abschnitten, die mit echtem Inhalt aus der aktuellen Sitzung befuellt sind. Zeitstempel und Branch sind korrekt.

**Bei Fehler:** Wenn Write fehlschlaegt, Dateiberechtigungen pruefen. Die Datei sollte im Projektstamm erstellt werden (gleiches Verzeichnis wie `.git/`). Pruefen ob `.gitignore` `CONTINUE_HERE.md` enthaelt — wenn nicht, hinzufuegen.

### Schritt 3: Datei verifizieren

CONTINUE_HERE.md zuruecklesen und bestaetigen:
- Zeitstempel ist aktuell (innerhalb der letzten paar Minuten)
- Branch-Name stimmt mit `git branch --show-current` ueberein
- Alle 5 Abschnitte enthalten echte Inhalte (keine Template-Platzhalter)
- Naechste Schritte sind nummeriert und handlungsrelevant
- In-Arbeit-Elemente beschreiben den aktuellen Zustand spezifisch genug zum Wiederaufnehmen

**Erwartet:** Die Datei liest sich als klare, handlungsrelevante Uebergabe, die eine neue Sitzung sofort verwenden koennte, um die Arbeit wieder aufzunehmen.

**Bei Fehler:** Abschnitte bearbeiten, die Platzhaltertext enthalten oder zu vage sind. Jeder Abschnitt sollte den Test bestehen: "Koennte eine neue Sitzung darauf handeln, ohne klaerende Fragen zu stellen?"

### Schritt 4: SessionStart-Hook konfigurieren (Optional)

Falls noch nicht konfiguriert, automatisches Lesen von CONTINUE_HERE.md beim Sitzungsstart einrichten.

Hook-Skript erstellen:

```bash
mkdir -p ~/.claude/hooks/continue-here

cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'
#!/bin/bash
# SessionStart hook: CONTINUE_HERE.md in Sitzungskontext einspeisen
# Plattformunabhaengig: funktioniert auf nativem Linux, WSL, macOS und Windows (Git Bash/MSYS)
set -uo pipefail

# --- Plattformerkennung ---
detect_platform() {
  case "$(uname -s)" in
    Darwin) echo "mac" ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}
PLATFORM=${PLATFORM:-$(detect_platform)}

CONTINUE_FILE="$PWD/CONTINUE_HERE.md"

if [ ! -f "$CONTINUE_FILE" ]; then
  exit 0
fi

# CRLF entfernen (Dateien auf NTFS haben oft Windows-Zeilenenden)
CONTENT=$(sed 's/\r$//' "$CONTINUE_FILE")

# JSON-Escaping: bevorzugt jq, Fallback zu portablem awk
if command -v jq >/dev/null 2>&1; then
  ESCAPED=$(printf '%s' "$CONTENT" | jq -Rsa .)
else
  ESCAPED=$(printf '%s' "$CONTENT" | awk '
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

cat << EOF
{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":$ESCAPED}}}
EOF
SCRIPT

chmod +x ~/.claude/hooks/continue-here/read-continuation.sh
```

In `~/.claude/settings.json` zum SessionStart-Hooks-Array hinzufuegen:

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

**Erwartet:** Das Hook-Skript existiert, ist ausfuehrbar und in settings.json registriert. Beim naechsten Sitzungsstart, wenn CONTINUE_HERE.md existiert, wird ihr Inhalt in den Sitzungskontext eingespeist.

**Bei Fehler:** Pruefen, dass settings.json nach der Bearbeitung gueltiges JSON ist. Den Hook manuell testen: `cd /dein/projekt && ~/.claude/hooks/continue-here/read-continuation.sh`. Das Skript faellt auf `awk` zurueck, wenn `jq` nicht installiert ist, daher wird `jq` empfohlen aber ist nicht erforderlich.

### Schritt 5: CLAUDE.md-Anweisung hinzufuegen (Optional)

Eine kurze Anweisung zu dem Projekt-CLAUDE.md hinzufuegen, damit Claude den Zweck der Datei versteht:

```markdown
## Sitzungskontinuitaet

Wenn `CONTINUE_HERE.md` im Projektstamm existiert, beim Sitzungsstart lesen. Sie enthaelt eine strukturierte Uebergabe von einer vorherigen Sitzung: Ziel, erledigte Arbeit, In-Arbeit-Status, naechste Schritte und Kontext. Darauf handeln — Fortsetzung bestaetigen, vorherigen Status zusammenfassen und die Wiederaufnahme ab dem Naechste-Schritte-Abschnitt vorschlagen. Wenn die Datei aelter als 24 Stunden ist, dem Nutzer darauf hinweisen, bevor fortgefahren wird. Nachdem die Uebergabe verarbeitet wurde, kann die Datei geloescht werden.
```

**Erwartet:** CLAUDE.md enthaelt die Anweisung. Kuenftige Sitzungen werden CONTINUE_HERE.md lesen und darauf reagieren, selbst wenn der SessionStart-Hook nicht konfiguriert ist.

**Bei Fehler:** Wenn CLAUDE.md nicht existiert, sie mit nur diesem Abschnitt erstellen. Wenn die Datei zu lang ist, die Anweisung nahe dem Anfang hinzufuegen, wo sie nicht abgeschnitten wird.

## Validierung

- [ ] CONTINUE_HERE.md existiert im Projektstamm
- [ ] Datei enthaelt alle 5 Abschnitte mit echtem Inhalt (keine Platzhalter)
- [ ] Zeitstempel und Branch sind korrekt
- [ ] `.gitignore` enthaelt `CONTINUE_HERE.md`
- [ ] Naechste Schritte sind nummeriert und handlungsrelevant
- [ ] In-Arbeit-Elemente spezifizieren genug Detail zum Wiederaufnehmen ohne Fragen
- [ ] (Optional) SessionStart-Hook-Skript existiert und ist ausfuehrbar
- [ ] (Optional) CLAUDE.md enthaelt die Sitzungskontinuitaets-Anweisung

## Haeufige Stolperfallen

- **Platzhalter statt Inhalt schreiben**: "TODO: spaeter ausfuellen" macht den Zweck zunichte. Jeder Abschnitt muss echte Informationen aus der aktuellen Sitzung enthalten.
- **Git-Status duplizieren**: Nicht jede geaenderte Datei auflisten — Git trackt das bereits. Auf Intent, partiellen Zustand und naechste Schritte konzentrieren.
- **Den Kontext-Abschnitt vergessen**: Fehlgeschlagene Ansaetze sind das Wertvollste aufzuzeichnen. Ohne sie wird die naechste Sitzung dieselben Sackgassen wiederholen.
- **Ueberschreiben ohne Lesen**: Wenn CONTINUE_HERE.md bereits von einer vorherigen Sitzung existiert, zuerst lesen — sie koennte unvollendete Arbeit von einem frueheren Uebergang enthalten.
- **Veraltete Dateien hinterlassen**: CONTINUE_HERE.md ist ephemer. Nachdem die naechste Sitzung sie verarbeitet hat, loeschen. Veraltete Dateien verursachen Verwirrung.

## Verwandte Skills

- `bootstrap-agent-identity` — Kalt-Start-Identitaetsrekonstruktion, die die Fortsetzungsdatei verarbeitet, die dieser Skill produziert
- `manage-memory` — dauerhaftes sitzungsuebergreifendes Wissen (ergaenzt diese ephemere Uebergabe)
- `commit-changes` — Arbeit in Git speichern, bevor die Fortsetzungsdatei geschrieben wird
- `write-claude-md` — Projektanweisungen, wo die optionale Kontinuitaetsleitlinie lebt
