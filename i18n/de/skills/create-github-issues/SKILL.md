---
name: create-github-issues
description: >
  Strukturierte GitHub-Issue-Erstellung aus Review-Befunden oder
  Aufgabenaufschluessen. Gruppiert zusammenhaengende Befunde in logische
  Issues, wendet Labels an und erstellt Issues mit Standardvorlagen
  einschliesslich Zusammenfassung, Befunden und Akzeptanzkriterien.
  Entwickelt, um die Ausgabe von review-codebase oder aehnlichen
  Review-Skills zu verarbeiten.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, github, project-management, issues, review, automation
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# GitHub-Issues erstellen

Strukturierte GitHub-Issue-Erstellung aus Review-Befunden oder Aufgabenaufschluessen. Konvertiert eine Liste von Befunden (aus `review-codebase`, `security-audit-codebase` oder manueller Analyse) in wohlgeformte GitHub-Issues mit Labels, Akzeptanzkriterien und Querverweisen.

## Wann verwenden

- Nachdem ein Codebase-Review eine Befundtabelle erzeugt hat, die verfolgt werden soll
- Nachdem eine Planungssitzung Arbeitselemente identifiziert hat, die zu Issues werden sollen
- Beim Konvertieren einer TODO-Liste oder eines Backlogs in verfolgbare GitHub-Issues
- Beim Stapelerstellen verwandter Issues, die einheitliche Formatierung und Labels benoetigen

## Eingaben

- **Erforderlich**: `findings` — eine Liste von Elementen, jedes mit mindestens einem Titel und einer Beschreibung. Idealerweise auch: Schweregrad, betroffene Dateien und vorgeschlagene Labels
- **Optional**:
  - `group_by` — wie Befunde zu Issues zusammengefasst werden: `severity`, `file`, `theme` (Standard: `theme`)
  - `label_prefix` — Praefix fuer automatisch erstellte Labels (Standard: keines)
  - `create_labels` — ob fehlende Labels erstellt werden sollen (Standard: `true`)
  - `dry_run` — Issues vorschau anzeigen ohne sie zu erstellen (Standard: `false`)

## Vorgehensweise

### Schritt 1: Labels vorbereiten

Sicherstellen, dass alle benoetigten Labels im Repository vorhanden sind.

1. Vorhandene Labels auflisten: `gh label list --limit 100`
2. Von den Befunden benoetigte Labels identifizieren (aus Schweregrad, Phase oder expliziten Label-Feldern)
3. Schweregrade auf Labels abbilden, falls noch nicht geschehen: `critical`, `high-priority`, `medium-priority`, `low-priority`
4. Phasen/Themen auf Labels abbilden: `security`, `architecture`, `code-quality`, `accessibility`, `testing`, `performance`
5. Wenn `create_labels` true ist, fehlende Labels erstellen: `gh label create "name" --color "hex" --description "desc"`
6. Einheitliche Farben verwenden: Rot fuer Critical/Security, Orange fuer High, Gelb fuer Medium, Blau fuer Architecture, Gruen fuer Testing

**Erwartet:** Alle von Befunden referenzierten Labels existieren im Repository. Keine doppelten Labels erstellt.

**Bei Fehler:** Wenn die `gh`-CLI nicht authentifiziert ist, den Nutzer anweisen, `gh auth login` auszufuehren. Wenn die Label-Erstellung abgelehnt wird (unzureichende Berechtigungen), ohne Label-Erstellung fortfahren und fehlende Labels notieren.

### Schritt 2: Befunde gruppieren

Verwandte Befunde in logische Issues buendeln, um Issue-Wildwuchs zu vermeiden.

1. Wenn `group_by` `theme` ist: Befunde nach Phase oder Kategorie gruppieren (alle Security-Befunde → 1-2 Issues, alle A11y-Befunde → 1 Issue)
2. Wenn `group_by` `severity` ist: Befunde nach Schweregrad gruppieren (alle CRITICAL → 1 Issue, alle HIGH → 1 Issue)
3. Wenn `group_by` `file` ist: Befunde nach der hauptsaechlich betroffenen Datei gruppieren
4. Innerhalb jeder Gruppe Befunde nach Schweregrad ordnen (CRITICAL zuerst)
5. Wenn eine Gruppe mehr als 8 Befunde hat, in Untergruppen nach Unterthema aufteilen
6. Jede Gruppe wird zu einem GitHub-Issue

**Erwartet:** Eine Menge von Issue-Gruppen, jede mit 1-8 verwandten Befunden. Die Gesamtzahl der Issues sollte ueberschaubar sein (typischerweise 5-15 fuer einen vollstaendigen Codebase-Review).

**Bei Fehler:** Wenn Befunde keine Gruppierungsmetadaten haben, auf ein Issue pro Befund zurueckfallen. Dies ist fuer kleine Befundmengen (< 10) akzeptabel, erzeugt aber fuer groessere Mengen zu viele Issues.

### Schritt 3: Issues verfassen

Jedes Issue anhand einer Standardvorlage aufbauen.

1. **Titel**: `[Schweregrad] Thema: Kurzbeschreibung` — z.B. `[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. **Koerper**-Struktur:
   ```
   ## Summary
   One-paragraph overview of what this issue addresses and why it matters.

   ## Findings
   1. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation
   2. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation

   ## Acceptance Criteria
   - [ ] Criterion derived from finding 1
   - [ ] Criterion derived from finding 2
   - [ ] All changes pass existing tests

   ## Context
   Generated from codebase review on YYYY-MM-DD.
   Related: #issue_numbers (if applicable)
   ```
3. Labels anwenden: Schweregrad-Label + Themen-Label + benutzerdefinierte Labels
4. Wenn Befunde auf bestimmte Dateien verweisen, diese im Koerper erwaehnen (nicht als Zugeordnete)

**Erwartet:** Jedes Issue hat einen klaren Titel, nummerierte Befunde mit Schweregradkennzeichnungen, Checkbox-Akzeptanzkriterien und geeignete Labels.

**Bei Fehler:** Wenn der Koerper GitHubs Issue-Groessenlimit (65536 Zeichen) ueberschreitet, das Issue aufteilen und die Teile mit Querverweisen verbinden.

### Schritt 4: Issues erstellen

Issues mit der `gh`-CLI erstellen und Ergebnisse berichten.

1. Wenn `dry_run` true ist, jeden Issue-Titel und -Koerper ausgeben ohne zu erstellen, dann stoppen
2. Fuer jedes verfasste Issue dieses erstellen:
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. Die URL jedes erstellten Issues aufzeichnen
4. Nach dem Erstellen aller Issues eine Zusammenfassungstabelle ausgeben: `#Nummer | Titel | Labels | Anzahl Befunde`
5. Wenn Issues in Reihenfolge gebracht werden sollen, Querverweise hinzufuegen: das erste Issue bearbeiten und "Blocked by #X" oder "See also #Y" erwaehnen

**Erwartet:** Alle Issues erfolgreich erstellt. Eine Zusammenfassungstabelle mit Issue-Nummern und URLs wird ausgegeben.

**Bei Fehler:** Wenn ein einzelnes Issue nicht erstellt werden kann, den Fehler protokollieren und mit den verbleibenden Issues fortfahren. Fehler am Ende melden. Haeufige Fehler: Authentifizierung abgelaufen, Label nicht gefunden (wenn `create_labels` false war), Netzwerk-Timeout.

## Validierung

- [ ] Alle Befunde sind in mindestens einem Issue vertreten
- [ ] Jedes Issue hat mindestens ein Label
- [ ] Jedes Issue hat Checkbox-Akzeptanzkriterien
- [ ] Keine doppelten Issues wurden erstellt (Titel gegen bestehende offene Issues pruefen)
- [ ] Issue-Anzahl ist angemessen fuer die Befundanzahl (nicht 1:1 fuer grosse Mengen)
- [ ] Zusammenfassungstabelle wurde mit allen Issue-URLs ausgegeben

## Haeufige Stolperfallen

- **Issue-Wildwuchs**: Ein Issue pro Befund zu erstellen erzeugt 20+ Issues, die schwer zu verwalten sind. Aggressiv gruppieren — 5-10 Issues aus einem vollstaendigen Review sind ideal
- **Fehlende Akzeptanzkriterien**: Issues ohne Checkboxen koennen nicht als vollstaendig verifiziert werden. Jeder Befund sollte mindestens einer Checkbox entsprechen
- **Label-Chaos**: Zu viele Labels erstellen macht das Filtern nutzlos. Bei Schweregrad + Thema bleiben, keine Labels pro Befund
- **Veraltete Referenzen**: Wenn Issues aus einem alten Review erstellt werden, pruefen ob die Befunde noch zutreffen, bevor Issues erstellt werden. Code kann sich geaendert haben
- **Trockenlauffunktion vergessen**: Fuer grosse Befundmengen immer zuerst mit `dry_run: true` vorschau anzeigen. Es ist viel einfacher, einen Plan zu bearbeiten als 15 falsche Issues zu schliessen

## Verwandte Skills

- `review-codebase` — erzeugt die Befundtabelle, die dieser Skill verarbeitet
- `review-pull-request` — erzeugt PR-bezogene Befunde, die ebenfalls in Issues konvertiert werden koennen
- `manage-backlog` — organisiert Issues nach der Erstellung in Sprints und Prioritaeten
- `create-pull-request` — erstellt PRs, die auf die Issues verweisen und sie schliessen
- `commit-changes` — checkt Fixes ein, die die Issues loesen
