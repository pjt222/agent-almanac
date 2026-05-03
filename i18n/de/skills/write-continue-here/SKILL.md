---
name: write-continue-here
description: >
  Write a CONTINUE_HERE.md file capturing current session state so a fresh
  Claude Code session can pick up where this one left off. Covers assessing
  recent work, structuring the continuation file with objective, completed,
  in-progress, next-steps, and context sections, and verifying the file is
  actionable. Use when ending a session with unfinished work, handing off
  context between sessions, or preserving task state that git alone cannot
  capture.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, write
  locale: de
  source_locale: en
  source_commit: 025eea68
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Continue-Here schreiben

Eine strukturierte Continuation-Datei schreiben damit die naechste Sitzung mit vollem Kontext beginnt.

## Wann verwenden

- Eine Sitzung mit Arbeit noch in Bearbeitung beenden
- Eine komplexe Aufgabe zwischen Sitzungen uebergeben
- Absicht, fehlgeschlagene Ansaetze und naechste Schritte erhalten die Git nicht erfassen kann
- Vor Schliessen von Claude Code mitten in der Aufgabe

## Eingaben

- **Erforderlich**: Eine aktive Sitzung mit aktueller Arbeit zum Zusammenfassen
- **Optional**: Spezifische Anweisungen darueber was im Handoff zu betonen ist

## Vorgehensweise

### Schritt 1: Sitzungs-Zustand bewerten

Fakten ueber aktuelle Arbeit sammeln:

```bash
git log --oneline -5
git status
git diff --stat
```

Den Konversations-Kontext reviewen: was war das Objective, was wurde abgeschlossen, was ist teilweise erledigt, was wurde versucht und scheiterte, welche Entscheidungen wurden getroffen.

**Erwartet:** Klares Verstaendnis des aktuellen Aufgaben-Zustands — abgeschlossene Items, In-Progress-Items und geplante naechste Schritte.

**Bei Fehler:** Wenn nicht in einem Git-Repository, Git-Befehle ueberspringen. Die Continuation-Datei kann immer noch konversationelle Kontexte und Aufgaben-Zustand erfassen.

### Schritt 2: CONTINUE_HERE.md schreiben

Die Datei in den Projekt-Root schreiben mit der unten stehenden Struktur. Jeder Abschnitt muss umsetzbaren Inhalt enthalten, keine Platzhalter.

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: current-branch-name

## Objective
One-paragraph description of what we are trying to accomplish and why.

## Completed
- [x] Finished item with key file paths (e.g., `src/feature.R`)
- [x] Decisions made and their rationale

## In Progress
- [ ] Partially complete work — describe current state (branch, file:line)
- [ ] Known issues with partial work

## Next Steps
1. Immediate next action (most important)
2. Subsequent actions in priority order
3. **[USER]** Items needing user input or decision

## Context
- Failed approaches and why they did not work
- Key constraints or trade-offs discovered
- Relevant issue/PR links
```

Anleitungen:
- **Objective**: Das WARUM erfassen — Git-Log zeigt was sich aenderte, nicht warum
- **Completed**: Items klar als erledigt markieren um Re-Work zu verhindern
- **In Progress**: Dies ist der wertvollste Abschnitt — partieller Zustand ist am schwersten zu rekonstruieren
- **Next Steps**: Nach Prioritaet nummerieren. Benutzer-abhaengige Items mit `**[USER]**` praefixen
- **Context**: Negativen Raum aufzeichnen — was versucht und abgelehnt wurde und warum

**Erwartet:** Eine CONTINUE_HERE.md-Datei am Projekt-Root mit allen 5 Abschnitten mit echtem Inhalt aus der aktuellen Sitzung befuellt. Der Zeitstempel und Branch sind akkurat.

**Bei Fehler:** Wenn Write scheitert, Datei-Berechtigungen pruefen. Die Datei sollte im Projekt-Root erstellt werden (selbes Verzeichnis wie `.git/`). Verifizieren dass `.gitignore` `CONTINUE_HERE.md` enthaelt — falls nicht, hinzufuegen.

### Schritt 3: Die Datei verifizieren

CONTINUE_HERE.md zurueckslesen und bestaetigen:
- Zeitstempel ist aktuell (innerhalb der letzten paar Minuten)
- Branchname entspricht `git branch --show-current`
- Alle 5 Abschnitte enthalten echten Inhalt (keine Template-Platzhalter)
- Next Steps sind nummeriert und umsetzbar
- In-Progress-Items beschreiben aktuellen Zustand spezifisch genug zum Fortsetzen

**Erwartet:** Die Datei liest sich als klarer, umsetzbarer Handoff den eine frische Sitzung nutzen koennte um sofort Arbeit fortzusetzen.

**Bei Fehler:** Abschnitte editieren die Platzhalter-Text enthalten oder zu vage sind. Jeder Abschnitt sollte den Test bestehen: "Koennte eine frische Sitzung darauf handeln ohne Klaerungs-Fragen zu stellen?"

## Validierung

- [ ] CONTINUE_HERE.md existiert am Projekt-Root
- [ ] Datei enthaelt alle 5 Abschnitte mit echtem Inhalt (keine Platzhalter)
- [ ] Zeitstempel und Branch sind akkurat
- [ ] `.gitignore` enthaelt `CONTINUE_HERE.md`
- [ ] Next Steps sind nummeriert und umsetzbar
- [ ] In-Progress-Items spezifizieren genuegend Detail um ohne Fragen fortzusetzen

## Haeufige Stolperfallen

- **Platzhalter statt Inhalt schreiben**: "TODO: spaeter ausfuellen" besiegt den Zweck. Jeder Abschnitt muss echte Information aus der aktuellen Sitzung enthalten.
- **Git-State duplizieren**: Nicht jede geaenderte Datei auflisten — Git verfolgt das bereits. Auf Absicht, partiellen Zustand und naechste Schritte fokussieren.
- **Den Context-Abschnitt vergessen**: Fehlgeschlagene Ansaetze sind das wertvollste was aufzuzeichnen ist. Ohne sie wird die naechste Sitzung dieselben Sackgassen erneut versuchen.
- **Ueberschreiben ohne Lesen**: Wenn CONTINUE_HERE.md bereits aus einer vorigen Sitzung existiert, sie zuerst lesen — sie kann unfertige Arbeit aus einem fruehere Handoff enthalten.
- **Veraltete Dateien lassen**: CONTINUE_HERE.md ist ephemeral. Nachdem die naechste Sitzung sie konsumiert, sie loeschen. Veraltete Dateien verursachen Verwirrung.

## Verwandte Skills

- `read-continue-here` — das Komplement: die Continuation-Datei am Sitzungs-Start lesen und darauf handeln
- `bootstrap-agent-identity` — Cold-Start-Identitaets-Rekonstruktion die die von diesem Skill produzierte Continuation-Datei konsumiert
- `manage-memory` — dauerhaftes sitzungsuebergreifendes Wissen (komplementiert diesen ephemeren Handoff)
- `commit-changes` — Arbeit in Git speichern bevor die Continuation-Datei geschrieben wird
- `write-claude-md` — Projekt-Anweisungen wo optionale Continuity-Anleitung lebt
