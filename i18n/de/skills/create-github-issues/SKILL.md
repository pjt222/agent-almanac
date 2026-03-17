---
name: create-github-issues
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Strukturierte GitHub-Issue-Erstellung aus Review-Befunden oder
  Aufgabenaufschluessen. Gruppiert zusammenhaengende Befunde in logische
  Issues, vergibt Labels und erzeugt Issues mit Standardvorlagen
  einschliesslich Zusammenfassung, Befunden und Abnahmekriterien. Konzipiert
  zum Verarbeiten von Ausgaben aus review-codebase oder aehnlichen
  Review-Skills.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, github, project-management, issues, review, automation
---

# GitHub-Issues erstellen

Strukturierte GitHub-Issue-Erstellung aus Review-Befunden oder Aufgabenaufschluessen. Wandelt eine Liste von Befunden (aus `review-codebase`, `security-audit-codebase` oder manueller Analyse) in wohlgeformte GitHub-Issues mit Labels, Abnahmekriterien und Querverweisen um.

## Wann verwenden

- Nach einem Codebase-Review das eine Befundtabelle erzeugt hat die nachverfolgt werden muss
- Nach einer Planungssitzung die Arbeitspakete identifiziert hat die zu Issues werden sollen
- Beim Umwandeln einer TODO-Liste oder eines Backlogs in nachverfolgbare GitHub-Issues
- Beim Massenerstellen zusammenhaengender Issues die einheitliche Formatierung und Labels benoetigen

## Eingaben

- **Erforderlich**: `findings` — eine Liste von Eintraegen, jeder mindestens mit Titel und Beschreibung. Idealerweise auch: Schweregrad, betroffene Dateien und vorgeschlagene Labels
- **Optional**:
  - `group_by` — wie Befunde in Issues zusammengefasst werden: `severity`, `file`, `theme` (Standard: `theme`)
  - `label_prefix` — Praefix fuer automatisch erstellte Labels (Standard: keines)
  - `create_labels` — ob fehlende Labels erstellt werden sollen (Standard: `true`)
  - `dry_run` — Issues in der Vorschau anzeigen ohne sie zu erstellen (Standard: `false`)

## Vorgehensweise

### Schritt 1: Labels vorbereiten

Sicherstellen dass alle benoetigten Labels im Repository vorhanden sind.

1. Vorhandene Labels auflisten: `gh label list --limit 100`
2. Von den Befunden benoetigte Labels identifizieren (aus Schweregrad, Phase oder expliziten Label-Feldern)
3. Schweregrade auf Labels abbilden falls noch nicht geschehen: `critical`, `high-priority`, `medium-priority`, `low-priority`
4. Phasen/Themen auf Labels abbilden: `security`, `architecture`, `code-quality`, `accessibility`, `testing`, `performance`
5. Wenn `create_labels` wahr ist, fehlende Labels erstellen: `gh label create "name" --color "hex" --description "desc"`
6. Einheitliche Farben verwenden: Rot fuer critical/security, Orange fuer high, Gelb fuer medium, Blau fuer architecture, Gruen fuer testing

**Erwartet:** Alle von Befunden referenzierten Labels existieren im Repository. Keine doppelten Labels erstellt.

**Bei Fehler:** Wenn `gh`-CLI nicht authentifiziert ist, den Benutzer anweisen `gh auth login` auszufuehren. Wenn Label-Erstellung verweigert wird (unzureichende Berechtigungen), ohne Label-Erstellung fortfahren und vermerken welche Labels fehlen.

### Schritt 2: Befunde gruppieren

Zusammenhaengende Befunde in logische Issues buendeln um Issue-Zersiedelung zu vermeiden.

1. Wenn `group_by` `theme` ist: Befunde nach Phase oder Kategorie gruppieren (alle Sicherheitsbefunde -> 1-2 Issues, alle a11y -> 1 Issue)
2. Wenn `group_by` `severity` ist: Befunde nach Schweregrad gruppieren (alle CRITICAL -> 1 Issue, alle HIGH -> 1 Issue)
3. Wenn `group_by` `file` ist: Befunde nach primaer betroffener Datei gruppieren
4. Innerhalb jeder Gruppe Befunde nach Schweregrad ordnen (CRITICAL zuerst)
5. Wenn eine Gruppe mehr als 8 Befunde hat, in Untergruppen nach Unterthema aufteilen
6. Jede Gruppe wird zu einem GitHub-Issue

**Erwartet:** Eine Reihe von Issue-Gruppen, jede mit 1-8 zusammenhaengenden Befunden. Die Gesamtzahl der Issues sollte ueberschaubar sein (typischerweise 5-15 fuer ein vollstaendiges Codebase-Review).

**Bei Fehler:** Wenn Befunde keine Gruppierungsmetadaten haben, auf ein Issue pro Befund zurueckfallen. Das ist akzeptabel fuer kleine Befundmengen (< 10), erzeugt aber zu viele Issues fuer groessere Mengen.

### Schritt 3: Issues formulieren

Jedes Issue mit einer Standardvorlage aufbauen.

1. **Titel**: `[Schweregrad] Thema: Kurzbeschreibung` — z.B. `[HIGH] Security: innerHTML-Injektion in panel.js beseitigen`
2. **Inhalt** Struktur:
   ```
   ## Zusammenfassung
   Ein-Absatz-Ueberblick was dieses Issue behandelt und warum es wichtig ist.

   ## Befunde
   1. **[SCHWEREGRAD]** Befundbeschreibung (`datei.js:zeile`) — kurze Erklaerung
   2. **[SCHWEREGRAD]** Befundbeschreibung (`datei.js:zeile`) — kurze Erklaerung

   ## Abnahmekriterien
   - [ ] Kriterium abgeleitet aus Befund 1
   - [ ] Kriterium abgeleitet aus Befund 2
   - [ ] Alle Aenderungen bestehen vorhandene Tests

   ## Kontext
   Generiert aus Codebase-Review am JJJJ-MM-TT.
   Verwandt: #issue_nummern (falls zutreffend)
   ```
3. Labels zuweisen: Schweregrad-Label + Themen-Label + benutzerdefinierte Labels
4. Wenn Befunde bestimmte Dateien referenzieren, sie im Inhalt erwaehnen (nicht als Zugewiesene)

**Erwartet:** Jedes Issue hat einen klaren Titel, nummerierte Befunde mit Schweregrad-Markierungen, Checkbox-Abnahmekriterien und passende Labels.

**Bei Fehler:** Wenn der Inhalt GitHubs Issue-Groessenlimit (65536 Zeichen) ueberschreitet, das Issue in Teile aufteilen und gegenseitig referenzieren.

### Schritt 4: Issues erstellen

Die Issues mit dem `gh`-CLI erstellen und Ergebnisse berichten.

1. Wenn `dry_run` wahr ist, jeden Issue-Titel und Inhalt ausgeben ohne zu erstellen, dann stoppen
2. Fuer jedes formulierte Issue erstellen:
   ```bash
   gh issue create --title "titel" --body "$(cat <<'EOF'
   inhalt
   EOF
   )" --label "label1,label2"
   ```
3. Die URL jedes erstellten Issues festhalten
4. Nach Erstellung aller Issues eine Zusammenfassungstabelle ausgeben: `#Nummer | Titel | Labels | Befundanzahl`
5. Wenn Issues sequenziert werden sollen, Querverweise hinzufuegen: das erste Issue bearbeiten um "Blockiert von #X" oder "Siehe auch #Y" zu erwaehnen

**Erwartet:** Alle Issues erfolgreich erstellt. Eine Zusammenfassungstabelle mit Issue-Nummern und URLs wird ausgegeben.

**Bei Fehler:** Wenn ein einzelnes Issue nicht erstellt werden kann, den Fehler protokollieren und mit den verbleibenden Issues fortfahren. Fehlschlaege am Ende berichten. Haeufige Ursachen: Authentifizierung abgelaufen, Label nicht gefunden (wenn `create_labels` falsch war), Netzwerk-Timeout.

## Validierung

- [ ] Alle Befunde sind in mindestens einem Issue vertreten
- [ ] Jedes Issue hat mindestens ein Label
- [ ] Jedes Issue hat Checkbox-Abnahmekriterien
- [ ] Keine doppelten Issues wurden erstellt (Titel gegen vorhandene offene Issues pruefen)
- [ ] Issue-Anzahl ist angemessen fuer die Befundanzahl (nicht 1:1 fuer grosse Mengen)
- [ ] Zusammenfassungstabelle wurde mit allen Issue-URLs ausgegeben

## Haeufige Stolperfallen

- **Issue-Zersiedelung**: Ein Issue pro Befund erstellen erzeugt 20+ Issues die schwer zu verwalten sind. Aggressiv gruppieren — 5-10 Issues aus einem vollstaendigen Review sind ideal
- **Fehlende Abnahmekriterien**: Issues ohne Checkboxen koennen nicht als abgeschlossen verifiziert werden. Jeder Befund sollte auf mindestens eine Checkbox abgebildet werden
- **Label-Chaos**: Zu viele Labels erstellen macht Filtern nutzlos. Bei Schweregrad + Thema bleiben, nicht Labels pro Befund
- **Veraltete Referenzen**: Wenn Issues aus einem alten Review erstellt werden, vor dem Erstellen ueberpruefen ob die Befunde noch gelten. Der Code koennte sich geaendert haben
- **Trockenlauf vergessen**: Fuer grosse Befundmengen immer zuerst mit `dry_run: true` vorschauen. Es ist viel leichter einen Plan zu bearbeiten als 15 falsche Issues zu schliessen

## Verwandte Skills

- `review-codebase` — erzeugt die Befundtabelle die dieser Skill verarbeitet
- `review-pull-request` — erzeugt PR-bezogene Befunde die ebenfalls in Issues umgewandelt werden koennen
- `manage-backlog` — organisiert Issues nach der Erstellung in Sprints und Prioritaeten
- `create-pull-request` — erstellt PRs die die Issues referenzieren und schliessen
- `commit-changes` — committet die Korrekturen die die Issues aufloesen
