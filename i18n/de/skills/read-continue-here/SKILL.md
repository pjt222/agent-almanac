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
  fence_basis_commit: 4244ca61b7f4bd7a4ddd90676f982a85121e590a
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

Zuerst eine Kopie behalten: Das naechste `write-continue-here` vergleicht seinen Entwurf mit dieser Ausgabe. Eine Zeile `Handoff archive: <dir>` in der CLAUDE.md des Projekts, in der CLAUDE.md eines uebergeordneten Verzeichnisses, in der nutzerweiten `~/.claude/CLAUDE.md` oder in der README (die naechstgelegene zuerst) benennt das Archiv; ohne sie bleibt ein nicht versioniertes Handoff als `CONTINUE_HERE.prev.md` daneben erhalten, ein versioniertes braucht keine Kopie. `ARCHIVE_STATE=consumed` setzen:

```bash
: "${CONTINUE_FILE:?set it to the path of the handoff, as the resolver printed it}"
: "${ARCHIVE_STATE:?set it to consumed when reading, superseded when replacing}"
case "$CONTINUE_FILE" in /*) ;; *) CONTINUE_FILE=$PWD/$CONTINUE_FILE ;; esac
HOME_DIR=${CONTINUE_FILE%/*} ARCHIVED=
ROOT=$(git -C "$HOME_DIR" rev-parse --show-toplevel 2>/dev/null) || ROOT=$HOME_DIR
PROJECT=$(git -C "$HOME_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || PROJECT=$ROOT
case "$PROJECT" in /*) ;; *) PROJECT=$ROOT ;; esac # git before 2.31 prints --path-format back, exit 0
PROJECT=${PROJECT%/.git}; PROJECT=${PROJECT##*/} # a linked worktree names its project, not itself
SEARCH=("$ROOT/CLAUDE.md" "$ROOT/.claude/CLAUDE.md") dir=${ROOT%/*} ARCHIVE=
while [ -n "$dir" ]; do SEARCH+=("$dir/CLAUDE.md"); dir=${dir%/*}; done
for f in "${SEARCH[@]}" "$HOME/.claude/CLAUDE.md" "$ROOT/README.md"; do # nearest first, builtins only
  [ -f "$f" ] && while IFS= read -r l || [ -n "$l" ]; do
    l=${l%$'\r'}; case "$l" in "Handoff archive: "*) ARCHIVE=${l#Handoff archive: }; break 2 ;; esac
  done < "$f"
done
case "$ARCHIVE" in '~/'*) ARCHIVE=$HOME/${ARCHIVE#'~/'} ;; ''|/*|'<dir>') ;; *) ARCHIVE=${f%/*}/$ARCHIVE ;; esac
STAMP=$(date -u +%Y-%m-%dT%H%M%SZ) KEEP=cp
[ "$ARCHIVE_STATE" = superseded ] && KEEP=mv
if [ "$ARCHIVE" = '<dir>' ]; then
  echo "REFUSED: $f carries the unedited 'Handoff archive: <dir>'; name a directory there" >&2; false
elif [ -n "$ARCHIVE" ]; then
  DEST=$ARCHIVE/${STAMP%%T*}/$PROJECT-CONTINUE_HERE.$STAMP.$ARCHIVE_STATE.md
  mkdir -p -- "${DEST%/*}" && "$KEEP" -- "$CONTINUE_FILE" "$DEST" && ARCHIVED=$DEST
elif git -C "$HOME_DIR" ls-files --error-unmatch -- "$CONTINUE_FILE" >/dev/null 2>&1; then
  if git -C "$HOME_DIR" diff --quiet HEAD -- "$CONTINUE_FILE"; then ARCHIVED="git history, tracked"
  else echo "REFUSED: $CONTINUE_FILE has uncommitted changes; read them before committing anything" >&2; false; fi
else
  "$KEEP" -- "$CONTINUE_FILE" "$HOME_DIR/CONTINUE_HERE.prev.md" && ARCHIVED=$HOME_DIR/CONTINUE_HERE.prev.md
fi
if [ -n "$ARCHIVED" ]; then echo "archive: $ARCHIVED"
else echo "REFUSED: $CONTINUE_FILE was not archived, so the cleanup will not delete it" >&2; false; fi
```

Nachdem der Handoff konsumiert wurde und Arbeit im Gange ist, CONTINUE_HERE.md loeschen:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
: "${ARCHIVED:?run the archive fence first in this shell call, or set ARCHIVED to the path it printed}"
SCOPE_LINE=$(while IFS= read -r l; do
  case "$l" in "Nobody runs:"*) printf '%s' "$l"; break ;; esac
done < "$CONTINUE_FILE")
if [ -n "$SCOPE_LINE" ]; then
  echo "WARNING: $CONTINUE_FILE carries a peer-session scope declaration the peer will no longer find:" >&2
  echo "  $SCOPE_LINE" >&2
  echo "Copy it where the peer will see it (an issue comment, a message to the peer)." >&2
fi
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  # The pathspec is load-bearing: without it, the commit also takes a peer's staged work.
  git rm -q "$CONTINUE_FILE" &&
    git commit -qm 'chore: consume the session handoff' -- "$CONTINUE_FILE"
else
  rm -- "$CONTINUE_FILE" # untracked, ignored, or no repository: an ordinary delete
fi
```

Veraltete Continuation-Dateien verursachen Verwirrung in zukuenftigen Sitzungen.

**Erwartet:** Die Datei ist entfernt. Der Projekt-Root ist sauber.

**Bei Fehler:** Wenn der Benutzer die Datei behalten will (z.B. als Referenz waehrend der Sitzung), sie lassen aber vermerken dass sie vor Sitzungs-Ende geloescht werden sollte um zu verhindern dass die naechste Sitzung sie erneut konsumiert.

### Schritt 6: SessionStart-Hook konfigurieren (Optional)

Der Hook fuegt das aufgeloeste Handoff in jede neue Sitzung ein. Das Skript, sein Eintrag in `settings.json` und wie seine Ausgabe zu pruefen ist, stehen in [references/session-start-hook.md](references/session-start-hook.md).

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
