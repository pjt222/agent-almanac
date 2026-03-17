---
name: draft-project-charter
description: >
  Einen Projektauftrag erstellen, der Umfang, Stakeholder, Erfolgskriterien
  und ein erstes Risikoregister definiert. Umfasst Problemdarstellung, RACI-Matrix,
  Meilensteinplanung und Scope-Grenzen fuer agile und klassische Methoden.
  Verwenden beim Start eines neuen Projekts, beim Formalisieren des Umfangs nach
  informellem Beginn, beim Ausrichten von Stakeholdern vor der Detailplanung
  oder beim Uebergang von der Ideenfindung zur aktiven Projektarbeit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, charter, scope, stakeholders, raci, risk-register
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Projektauftrag erstellen

Erstellt einen strukturierten Projektauftrag, der Projektgrenzen, Stakeholder-Vereinbarungen und Erfolgskriterien festlegt, bevor die Detailplanung beginnt. Produziert ein umfassendes Dokument zu Umfang, RACI-Zuweisungen, Meilensteinplanung und einem ersten Risikoregister, geeignet fuer agile, klassische oder hybride Projektmethoden.

## Wann verwenden

- Start eines neuen Projekts oder einer Initiative
- Formalisieren des Umfangs nach einem informellen Projektstart
- Ausrichten von Stakeholdern vor Beginn der Detailplanung
- Erstellen eines Referenzdokuments fuer Umfangsentscheidungen waehrend der Durchfuehrung
- Uebergang von Entdeckung/Ideenfindung zur aktiven Projektarbeit

## Eingaben

- **Erforderlich**: Projektname und kurze Beschreibung
- **Erforderlich**: Hauptstakeholder oder Auftraggeber
- **Optional**: Vorhandene Dokumentation (Vorschlaege, Briefings, E-Mails)
- **Optional**: Bekannte Einschraenkungen (Budget, Deadline, Teamgroesse)
- **Optional**: Methodenpraeferenz (agil, klassisch, hybrid)

## Vorgehensweise

### Schritt 1: Projektkontext erfassen und Charter-Vorlage erstellen

Vorhandene Dokumentation (Vorschlaege, E-Mails, Briefings) lesen, um den Projekthintergrund zu verstehen. Das zentrale Problem oder die Chance identifizieren, die das Projekt adressiert. Die Charter-Datei mit einer strukturierten Vorlage erstellen, die in den folgenden Schritten ausgefuellt wird.

Eine Datei namens `PROJECT-CHARTER-[PROJECT-NAME].md` mit dieser Vorlage erstellen:

```markdown
# Project Charter: [Project Name]
## Document ID: PC-[PROJECT]-[YYYY]-[NNN]

### 1. Problem Statement
[2-3 sentences describing the problem or opportunity this project addresses]

### 2. Project Purpose
[What the project will achieve and why it matters]

### 3. Scope
#### In Scope
- [Deliverable 1]
- [Deliverable 2]

#### Out of Scope
- [Exclusion 1]
- [Exclusion 2]

### 4. Deliverables
| # | Deliverable | Acceptance Criteria | Target Date |
|---|------------|---------------------|-------------|
| 1 | | | |

### 5. Stakeholders & RACI
| Stakeholder | Role | D1 | D2 | D3 |
|-------------|------|----|----|-----|
| | | | | |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

### 6. Success Criteria
| # | Criterion | Measure | Target |
|---|-----------|---------|--------|
| 1 | | | |

### 7. Milestones
| Milestone | Target Date | Dependencies |
|-----------|-------------|--------------|
| | | |

### 8. Risk Register
| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner |
|----|------|------------|--------|----------|------------|-------|
| R1 | | | | | | |

*Likelihood/Impact: Low, Medium, High*
*Severity = Likelihood × Impact*

### 9. Assumptions and Constraints
#### Assumptions
- [Key assumption 1]

#### Constraints
- [Key constraint 1]

### 10. Approval
| Role | Name | Date |
|------|------|------|
| Sponsor | | |
| Project Lead | | |
```

Die Dokument-ID im Format PC-[PROJECT]-[YYYY]-[NNN] (z.B. PC-WEBSITE-2026-001) ausfuellen. Eine Problemdarstellung (2-3 Saetze) schreiben, die die aktuelle Situation, die Luecke und die Auswirkung beschreibt. Eine Projektzweck-Aussage (1 Absatz) schreiben, die erklaert, was erreicht werden soll.

**Erwartet:** Charter-Datei erstellt mit Dokument-ID, Problemdarstellung und Zweck ausgefuellt. Die Problemdarstellung ist spezifisch und beschreibt eine messbare Luecke.

**Bei Fehler:** Wenn der Projektkontext unklar ist, spezifische Fragen fuer den Auftraggeber in einem QUESTIONS-Abschnitt am Anfang der Charter dokumentieren. Wenn vorhandene Dokumente widersprechen, Widersprueche in einem OPEN ISSUES-Abschnitt vermerken und zur Stakeholder-Klaerung markieren.

### Schritt 2: Scope-Grenzen definieren

Explizite Listen erstellen, was im Projektumfang enthalten ist und was nicht. 3-5 In-Scope-Lieferergebnisse mit spezifischen Abnahmekriterien schreiben. 3-5 Out-of-Scope-Punkte schreiben, um Scope Creep zu verhindern. Die Lieferergebnisse-Tabelle mit jedem Lieferergebnis, seinen Abnahmekriterien und einem Zieldatum ausfuellen.

**Erwartet:** Der Scope-Abschnitt hat ausgewogene In-Scope- und Out-of-Scope-Listen. Die Lieferergebnisse-Tabelle enthaelt 3-5 Eintraege mit spezifischen, testbaren Abnahmekriterien. Zieldaten sind realistisch und logisch sequenziert.

**Bei Fehler:** Wenn Lieferergebnisse vage sind, jedes in Teillieferergebnisse mit konkreten Outputs aufschluesseln. Wenn Abnahmekriterien fehlen, fragen: "Wie wuerden wir zeigen, dass dieses Lieferergebnis abgeschlossen ist?" Wenn Zieldaten nicht verfuegbar sind, als TBD markieren und fuer eine Meilenstein-Planungssitzung kennzeichnen.

### Schritt 3: Stakeholder identifizieren und RACI zuweisen

Alle Personen oder Gruppen auflisten, die vom Projekt betroffen sind, dazu beitragen oder Entscheidungsbefugnis haben. Ihre Organisationsrolle einbeziehen. Eine RACI-Matrix erstellen, die jeden Stakeholder jedem Lieferergebnis zuordnet:
- **R** (Responsible): Fuehrt die Arbeit aus
- **A** (Accountable): Endgueltige Entscheidungsbefugnis (nur ein A pro Lieferergebnis)
- **C** (Consulted): Gibt Feedback vor Entscheidungen
- **I** (Informed): Wird ueber den Fortschritt informiert

Sicherstellen, dass jedes Lieferergebnis genau ein A und mindestens ein R hat.

**Erwartet:** Die Stakeholder-Tabelle listet 5-10 Personen mit ihren Rollen. Die RACI-Matrix hat ein A pro Lieferergebnis-Spalte. Kein Lieferergebnis fehlt ein R oder hat mehrere As. Der Auftraggeber ist A fuer die endgueltige Genehmigung.

**Bei Fehler:** Wenn die Stakeholder-Liste unvollstaendig ist, Organigramm und Besprechungsteilnehmer aus der Entdeckungsphase abgleichen. Wenn mehrere As identifiziert werden, den Konflikt zur Klaerung der Entscheidungsbefugnis an den Auftraggeber eskalieren. Wenn kein R existiert, das Lieferergebnis als nicht zugewiesen markieren und Ressourcenzuweisung erfordern.

### Schritt 4: Erfolgskriterien und Meilensteine definieren

3-5 messbare Erfolgskriterien im SMART-Format schreiben (Spezifisch, Messbar, Erreichbar, Relevant, Termingebunden). Jedes Kriterium soll mit einem quantifizierbaren Massstab und Zielwert verknuepft sein. 4-6 Schluesselmeilensteine definieren, die wichtige Projektphasen oder Abschluesse von Lieferergebnissen repraesentieren, mit Zieldaten und Abhaengigkeiten zu vorherigen Meilensteinen.

**Erwartet:** Die Erfolgskriterien-Tabelle hat 3-5 Eintraege mit spezifischen Massen (z.B. "Systemverfuegbarkeit" gemessen als "% Verfuegbarkeit" mit Ziel "99,5%"). Die Meilenstein-Tabelle zeigt logische Projektphasen mit realistischen Zieldaten. Abhaengigkeiten sind klar angegeben.

**Bei Fehler:** Wenn Erfolgskriterien vage sind (z.B. "Qualitaet verbessern"), als messbare Ergebnisse mit Ausgangs- und Zielwerten umformulieren. Wenn Meilenstein-Termine unrealistisch sind, vom Endtermin rueckwaerts arbeiten und Puffer einplanen. Wenn Abhaengigkeiten eine zirkulaere Logik erzeugen, die Meilenstein-Sequenz umstrukturieren oder konfligierende Meilensteine aufteilen.

### Schritt 5: Erstes Risikoregister erstellen

5-10 Risiken identifizieren, die den Projekterfolg beeinflussen koennten. Fuer jedes Risiko Wahrscheinlichkeit (Low/Medium/High) und Auswirkung (Low/Medium/High) bewerten, dann Schweregrad berechnen. Fuer jedes Risiko eine spezifische Minderungsstrategie definieren und einen Risikoverantwortlichen zuweisen. Mindestens ein Risiko in jeder Kategorie einbeziehen: Umfang, Zeitplan, Ressourcen, Technik und extern.

**Erwartet:** Das Risikoregister hat 5-10 Eintraege, die Umfangs-, Zeitplan-, Ressourcen-, Technik- und externe Risiken abdecken. Jedes Risiko hat Wahrscheinlichkeit, Auswirkung und Schweregrad bewertet. Minderungsstrategien sind umsetzbar und spezifisch. Jedes Risiko hat einen zugewiesenen Verantwortlichen.

**Bei Fehler:** Wenn die Risikoliste unvollstaendig ist, Scope-Grenzen, Abhaengigkeiten, Stakeholder-Liste und Annahmen auf potenzielle Schwachstellen ueberpruefen. Wenn Minderungsstrategien generisch sind ("eng ueberwachen"), spezifizieren: Was wird ueberwacht? Wie oft? Was loest eine Massnahme aus? Wenn niemand die Risikouebernahme akzeptiert, dem Projektleiter vorlaeufig zuweisen und an den Auftraggeber eskalieren.

## Validierung

- [ ] Charter-Datei mit Dokument-ID erstellt
- [ ] Problemdarstellung ist spezifisch und messbar
- [ ] Scope hat sowohl In-Scope- als auch Out-of-Scope-Punkte
- [ ] RACI-Matrix deckt alle Lieferergebnisse ab
- [ ] Erfolgskriterien sind messbar (SMART)
- [ ] Mindestens 5 Risiken mit Minderungsstrategien identifiziert
- [ ] Meilensteine haben Zieldaten
- [ ] Genehmigungsabschnitt enthalten

## Haeufige Stolperfallen

- **Umfang ohne Grenzen**: Das Auflisten von In-Scope-Punkten ohne explizite Out-of-Scope-Punkte fuehrt zu Scope Creep. Immer definieren, was nicht getan wird.
- **Vage Erfolgskriterien**: "Performance verbessern" ist nicht messbar. Jedes Kriterium an eine Zahl mit Ausgangswert und Zielwert koppeln.
- **Fehlende Stakeholder**: Uebersehene Stakeholder tauchen spaet auf und bringen das Projekt aus der Bahn. Organigramme und frueherer Projektkommunikation abgleichen.
- **Risikoregister als Checkbox**: Risiken ohne umsetzbare Minderungsplaene aufzulisten schafft falsche Sicherheit. Jedes Risiko braucht eine spezifische Reaktionsstrategie.
- **Zu detaillierter Projektauftrag**: Der Projektauftrag ist ein Kompass, keine Landkarte. Auf 2-4 Seiten beschraenken. Detailplanung erfolgt spaeter.

## Verwandte Skills

- `create-work-breakdown-structure` — Charter-Lieferergebnisse in Arbeitspakete zerlegen
- `manage-backlog` — Charter-Umfang in einen priorisierten Backlog uebersetzen
- `plan-sprint` — Den ersten Sprint aus Charter-Lieferergebnissen planen
- `generate-status-report` — Fortschritt gegen Charter-Meilensteine berichten
- `conduct-retrospective` — Charter-Annahmen nach der Durchfuehrung ueberpruefen
