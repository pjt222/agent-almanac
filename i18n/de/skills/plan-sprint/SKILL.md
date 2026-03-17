---
name: plan-sprint
description: >
  Einen Sprint planen durch Verfeinern von Backlog-Eintraegen, Definieren eines
  Sprint-Ziels, Berechnen der Teamkapazitaet, Auswaehlen von Eintraegen und
  deren Zerlegung in Aufgaben. Erstellt eine SPRINT-PLAN.md mit Ziel, ausgewaehlten
  Eintraegen, Aufgabengliederung und Kapazitaetszuweisung. Verwenden beim Start
  eines neuen Sprints in einem Scrum- oder agilen Projekt, bei erneuter Planung
  nach wesentlicher Scope-Aenderung, beim Uebergang von Ad-hoc-Arbeit zu
  strukturiertem Sprint-Rhythmus oder nach Backlog-Grooming, wenn Eintraege
  bereit fuer die Aufnahme sind.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, sprint, agile, scrum, capacity, sprint-planning
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Sprint planen

Einen zeitbeschraenkten Sprint planen, indem verfeinerte Backlog-Eintraege bis zur Teamkapazitaet ausgewaehlt, ein klares Sprint-Ziel definiert und ausgewaehlte Eintraege in umsetzbare Aufgaben zerlegt werden. Dieser Skill erstellt einen vollstaendigen Sprint-Plan, der die Teamarbeit waehrend der Sprint-Iteration steuert.

## Wann verwenden

- Start eines neuen Sprints in einem Scrum- oder agilen Projekt
- Erneute Sprint-Planung nach wesentlicher Scope-Aenderung
- Uebergang von Ad-hoc-Arbeit zu strukturiertem Sprint-Rhythmus
- Nach Backlog-Grooming, wenn Eintraege fuer den Sprint bereit sind
- Planen des ersten Sprints nach Genehmigung des Projektauftrags

## Eingaben

- **Erforderlich**: Product Backlog (priorisiert, mit Schaetzungen)
- **Erforderlich**: Sprint-Dauer (typischerweise 1-2 Wochen)
- **Erforderlich**: Teammitglieder und ihre Verfuegbarkeit
- **Optional**: Velocity aus vorherigen Sprints (Story Points oder abgeschlossene Eintraege)
- **Optional**: Sprint-Nummer und Datumsbereich
- **Optional**: Uebertragene Eintraege aus dem vorherigen Sprint

## Vorgehensweise

### Schritt 1: Backlog-Eintraege ueberpruefen und verfeinern

Die aktuelle BACKLOG.md lesen. Fuer jeden Kandidaten-Eintrag nahe der Backlog-Spitze pruefen, ob er Folgendes hat:

- Klaren Titel und Beschreibung
- Abnahmekriterien (testbare Bedingungen)
- Schaetzung (Story Points oder T-Shirt-Groesse)
- Keine ungeloesten Blockaden

Eintraege ohne diese Elemente verfeinern. Eintraege, die auf mehr als die Haelfte der Sprint-Kapazitaet geschaetzt werden, in kleinere, handhabbare Teile aufteilen.

**Erwartet:** Die obersten 10-15 Backlog-Eintraege sind "sprint-bereit" mit Abnahmekriterien und Schaetzungen.

**Bei Fehler:** Wenn Eintraege keine Abnahmekriterien haben, diese jetzt schreiben. Wenn Eintraege nicht geschaetzt werden koennen, ein Verfeinerungsgespraech einplanen und nur bereite Eintraege auswaehlen.

### Schritt 2: Sprint-Ziel definieren

Ein einziges klares Sprint-Ziel schreiben — einen Satz, der beschreibt, was der Sprint erreichen wird. Das Ziel soll:

- Innerhalb der Sprint-Dauer erreichbar sein
- Wertvoll fuer Stakeholder sein
- Testbar sein (am Sprint-Ende verifizierbar)

```markdown
**Sprint Goal**: [One sentence describing the objective]
```

Beispiel: "Enable users to reset their password through email verification with two-factor authentication."

**Erwartet:** Sprint-Ziel als ein klarer, testbarer Satz formuliert.

**Bei Fehler:** Wenn kein kohaerentes Ziel entsteht, koennen die Backlog-Prioritaeten verstreut sein — den Product Owner konsultieren, um sich auf ein einziges wertvolles Ergebnis zu konzentrieren.

### Schritt 3: Teamkapazitaet berechnen

Verfuegbare Personentage fuer jedes Teammitglied berechnen:

```markdown
## Team Capacity
| Team Member | Available Days | Overhead (%) | Net Capacity |
|-------------|---------------|-------------|--------------|
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| **Total** | | | **[Sum] person-days** |
```

Overhead beruecksichtigt Besprechungen, Reviews, Ad-hoc-Anfragen (typischerweise 15-25%).

Bei Story Points: Velocity aus dem vorherigen Sprint als Kapazitaet verwenden. Beim ersten Sprint 60-70% des theoretischen Maximums verwenden.

**Erwartet:** Kapazitaet in Personentagen oder Story Points berechnet mit dokumentierten Annahmen.

**Bei Fehler:** Wenn keine historische Velocity existiert, konservativ planen — auf 60% Kapazitaet planen und nach dem Sprint anpassen. Besser weniger versprechen und liefern als zu viel versprechen und scheitern.

### Schritt 4: Eintraege auswaehlen und Sprint-Backlog zusammenstellen

Eintraege von der Spitze des Product Backlogs auswaehlen, bis die Kapazitaet erreicht ist. Jeden ausgewaehlten Eintrag in Aufgaben zerlegen (je 2-8 Stunden):

```markdown
# Sprint Plan: Sprint [N]
## Document ID: SP-[PROJECT]-S[NNN]

### Sprint Details
- **Sprint Goal**: [From Step 2]
- **Duration**: [Start date] to [End date]
- **Capacity**: [From Step 3] person-days / [N] story points
- **Team**: [List team members]

### Sprint Backlog
| ID | Item | Points | Tasks | Assignee | Status |
|----|------|--------|-------|----------|--------|
| B-001 | [Item title] | 5 | 4 | [Name] | To Do |
| B-002 | [Item title] | 3 | 3 | [Name] | To Do |
| B-003 | [Item title] | 8 | 6 | [Name] | To Do |
| **Total** | | **16** | **13** | | |

### Task Breakdown

#### B-001: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (4h, [Assignee])
- [ ] Task 2: [Description] (2h, [Assignee])
- [ ] Task 3: [Description] (4h, [Assignee])
- [ ] Task 4: [Description] (2h, [Assignee])

#### B-002: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])

#### B-003: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])
- [ ] Task 4: [Description] (3h, [Assignee])
- [ ] Task 5: [Description] (4h, [Assignee])
- [ ] Task 6: [Description] (2h, [Assignee])

### Risks and Dependencies
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [Risk 1] | [Impact] | [Mitigation] |
| [Risk 2] | [Impact] | [Mitigation] |

### Carry-Over from Previous Sprint
| ID | Item | Reason | Remaining Effort |
|----|------|--------|-----------------|
| B-XXX | [Item] | [Reason] | [Hours/points] |
```

**Erwartet:** Sprint-Backlog mit bis zur Kapazitaet ausgewaehlten Eintraegen, jeder in Aufgaben mit Zeitschaetzungen zerlegt.

**Bei Fehler:** Wenn die Gesamtpunkte die Kapazitaet ueberschreiten, den niedrigst-priorisierten Eintrag entfernen. Die Kapazitaet nie um mehr als 10% ueberschreiten. Wenn Abhaengigkeiten die Sequenzierung blockieren, Eintraege neu anordnen oder verschieben.

### Schritt 5: Verpflichtungen dokumentieren und speichern

Den Sprint-Plan in `SPRINT-PLAN.md` (oder `SPRINT-PLAN-S[NNN].md` fuer die Archivierung) schreiben. Bestaetigen:

- Sprint-Ziel ist mit ausgewaehlten Eintraegen erreichbar
- Kein Teammitglied ist ueberbelastet (>100% Kapazitaet)
- Abhaengigkeiten zwischen Eintraegen sind korrekt sequenziert
- Uebertragene Eintraege sind in der Kapazitaet beruecksichtigt
- Alle Abnahmekriterien aus Backlog-Eintraegen kopiert

Eine abschliessende Validierung durchfuehren:

```bash
# Check that total task hours align with capacity
grep -A 100 "Task Breakdown" SPRINT-PLAN.md | grep -o '([0-9]*h' | sed 's/[^0-9]//g' | awk '{sum+=$1} END {print "Total hours:", sum}'
```

**Erwartet:** SPRINT-PLAN.md erstellt mit vollstaendigem Sprint-Backlog und Aufgabengliederung. Gesamtstunden sollten kleiner gleich 80% der verfuegbaren Personentage multipliziert mit 8 Stunden sein.

**Bei Fehler:** Wenn Verpflichtungen nicht mit dem Ziel uebereinstimmen, die Eintragsauswahl in Schritt 4 ueberarbeiten. Wenn Aufgabenstunden die Kapazitaet ueberschreiten, den letzten Eintrag entfernen oder Aufgaben feingranularer zerlegen.

## Validierung

- [ ] Sprint-Ziel ist ein klarer, testbarer Satz
- [ ] Teamkapazitaet berechnet mit dokumentierten Annahmen (Overhead-%, Urlaub beruecksichtigt)
- [ ] Ausgewaehlte Eintraege ueberschreiten die Kapazitaet nicht (Punkte oder Personentage)
- [ ] Jeder ausgewaehlte Eintrag hat Abnahmekriterien in der Aufgabengliederung
- [ ] Jeder ausgewaehlte Eintrag ist in Aufgaben zerlegt (je 2-8 Stunden)
- [ ] Kein Teammitglied ueber 100% Kapazitaet belastet
- [ ] Uebertragene Eintraege aus dem vorherigen Sprint mit verbleibendem Aufwand dokumentiert
- [ ] Abhaengigkeiten zwischen Eintraegen korrekt sequenziert
- [ ] Risiken und Minderungsmassnahmen dokumentiert
- [ ] SPRINT-PLAN.md-Datei erstellt und gespeichert

## Haeufige Stolperfallen

- **Kein Sprint-Ziel**: Ohne Ziel ist der Sprint nur ein Beutel voller Aufgaben. Das Ziel gibt Fokus und eine Grundlage fuer Scope-Entscheidungen waehrend des Sprints.
- **Ueberprogrammierung**: Auf 100% Kapazitaet zu planen ignoriert Unterbrechungen, Fehler und Overhead. Auf 70-80% planen, um Puffer fuer Unerwartetes zu haben.
- **Aufgaben zu gross**: Aufgaben ueber 8 Stunden verbergen Komplexitaet und erschweren die Fortschrittsverfolgung. Zerlegen, bis Aufgaben 2-8 Stunden betragen.
- **Uebertragung ignorieren**: Unfertige Eintraege aus dem letzten Sprint verbrauchen Kapazitaet in diesem Sprint. Sie explizit in Kapazitaetsberechnungen beruecksichtigen.
- **Sprint-Ziel als Eintragliste**: "B-001, B-002, B-003 abschliessen" ist kein Ziel. Ein Ziel beschreibt das Ergebnis: "Benutzer koennen ihr Passwort per E-Mail-Verifikation zuruecksetzen."
- **Kein Aufgabeneigentuemer**: Jede Aufgabe sollte zur Planungszeit einen Verantwortlichen haben, um Kapazitaetskonflikte fruehzeitig aufzudecken.
- **Abnahmekriterien weglassen**: Aufgaben ohne Abnahmekriterien koennen nicht getestet werden. Abnahmekriterien aus Backlog-Eintraegen in den Aufgabengliederungsabschnitt kopieren.

## Verwandte Skills

- `manage-backlog` — Product Backlog pflegen und priorisieren, der die Sprint-Planung speist
- `draft-project-charter` — liefert Projektkontext und initialen Umfang fuer den ersten Sprint
- `generate-status-report` — Sprint-Fortschritt und Velocity an Stakeholder berichten
- `conduct-retrospective` — Sprint-Durchfuehrung ueberpruefen und Planungsprozess verbessern
- `create-work-breakdown-structure` — PSP-Arbeitspakete koennen den Backlog in hybriden Agil-Wasserfall-Ansaetzen speisen
