---
name: create-work-breakdown-structure
description: >
  Einen Projektstrukturplan (PSP) und ein PSP-Woerterbuch aus den Lieferergebnissen
  des Projektauftrags erstellen. Umfasst hierarchische Zerlegung, PSP-Codierung,
  Aufwandsschaetzung, Abhaengigkeitsidentifikation und kritische Pfad-Kandidaten.
  Verwenden nach Genehmigung eines Projektauftrags, beim Planen eines klassischen
  oder Wasserfall-Projekts mit definierten Lieferergebnissen, beim Aufteilen einer
  grossen Initiative in handhabbare Arbeitspakete oder zum Aufbau einer Grundlage
  fuer Aufwandsschaetzung und Ressourcenplanung.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, wbs, work-breakdown-structure, classic, waterfall, planning
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Projektstrukturplan erstellen

Den Projektumfang in eine hierarchische Menge von Arbeitspaketen zerlegen, die geschaetzt, zugewiesen und verfolgt werden koennen. Der PSP bildet die Grundlage fuer Aufwandsschaetzung, Ressourcenplanung und Terminentwicklung, indem er komplexe Lieferergebnisse in handhabbare Komponenten aufschluesselt.

## Wann verwenden

- Nach Genehmigung eines Projektauftrags und Definition des Umfangs
- Planen eines klassischen/Wasserfall-Projekts mit definierten Lieferergebnissen
- Aufteilen einer grossen Initiative in handhabbare Arbeitspakete
- Aufbau einer Grundlage fuer Aufwandsschaetzung und Ressourcenplanung
- Schaffung eines gemeinsamen Verstaendnisses aller erforderlichen Arbeiten

## Eingaben

- **Erforderlich**: Genehmigter Projektauftrag (insbesondere Umfangs- und Lieferergebnisse-Abschnitte)
- **Erforderlich**: Projektmethode (klassisch/Wasserfall oder hybrid mit PSP fuer Planung)
- **Optional**: Historische Aufwandsdaten aus aehnlichen Projekten
- **Optional**: Teamzusammensetzung und verfuegbare Faehigkeiten
- **Optional**: Organisationsweite PSP-Vorlagen oder Standards

## Vorgehensweise

### Schritt 1: Lieferergebnisse aus dem Projektauftrag extrahieren

Den Projektauftrag lesen. Alle Lieferergebnisse und Abnahmekriterien auflisten. In 3-7 Oberkategorien gruppieren (diese werden zu PSP-Ebene-1-Elementen).

**Erwartet:** Liste der Ebene-1-PSP-Elemente entsprechend den Charter-Lieferergebnissen.

**Bei Fehler:** Wenn der Projektauftrag vage ist, zu `draft-project-charter` zurueckkehren, um den Umfang zu verfeinern.

### Schritt 2: In Arbeitspakete zerlegen

Fuer jedes Ebene-1-Element in Unterelemente zerlegen (Ebene 2, Ebene 3). Die 100%-Regel anwenden: Kindelemente muessen 100% des Elternumfangs repraesentieren. Die Zerlegung stoppen, wenn Arbeitspakete:
- Schaetzbar sind (Aufwand in Personentagen zuweisbar)
- Zuweisbar sind (eine Person oder ein Team ist Eigentuemer)
- Messbar sind (klare Fertig/Nicht-fertig-Kriterien)

Eine PSP-Gliederung erstellen:
```markdown
# Work Breakdown Structure: [Project Name]
## Document ID: WBS-[PROJECT]-[YYYY]-[NNN]

### WBS Hierarchy

1. [Level 1: Deliverable Category A]
   1.1 [Level 2: Sub-deliverable]
      1.1.1 [Level 3: Work Package]
      1.1.2 [Level 3: Work Package]
   1.2 [Level 2: Sub-deliverable]
2. [Level 1: Deliverable Category B]
   2.1 [Level 2: Sub-deliverable]
3. [Level 1: Project Management]
   3.1 Planning
   3.2 Monitoring & Control
   3.3 Closure
```

PSP-Codes anwenden (Format 1.1.1). Maximal 3-5 Ebenen tief sicherstellen. Immer einen "Project Management"-Zweig einbeziehen.

**Erwartet:** Vollstaendiger PSP mit 15-50 Arbeitspaketen, jedes mit einem eindeutigen PSP-Code.

**Bei Fehler:** Wenn die Zerlegung 5 Ebenen ueberschreitet, ist der Umfang zu gross — Aufteilen in Teilprojekte in Erwaegung ziehen.

### Schritt 3: PSP-Woerterbuch schreiben

Fuer jedes Arbeitspaket (Blattknoten) einen Woerterbuche-Eintrag schreiben:

```markdown
# WBS Dictionary: [Project Name]
## Document ID: WBS-DICT-[PROJECT]-[YYYY]-[NNN]

### WBS 1.1.1: [Work Package Name]
- **Description**: What this work package produces
- **Acceptance Criteria**: How to verify it's done
- **Responsible**: Person or role
- **Estimated Effort**: [T-shirt size or person-days]
- **Dependencies**: WBS codes this depends on
- **Assumptions**: Key assumptions for this work package

### WBS 1.1.2: [Work Package Name]
...
```

**Erwartet:** Woerterbuch-Eintrag fuer jedes Blattknoten-Arbeitspaket.

**Bei Fehler:** Fehlende Woerterbuch-Eintraege weisen auf unvollstaendige Zerlegung hin — Schritt 2 erneut durchfuehren.

### Schritt 4: Aufwand schaetzen

Fuer jedes Arbeitspaket eine Schaetzungsmethode anwenden:
- **T-Shirt-Groessen** (XS/S/M/L/XL) fuer fruehe Planungsphasen
- **Personentage** fuer Detailplanung
- **Drei-Punkte-Schaetzung** (optimistisch/wahrscheinlichst/pessimistisch) fuer Arbeit mit hoher Unsicherheit

Eine Zusammenfassungstabelle erstellen:
```markdown
## Effort Summary
| WBS Code | Work Package | Estimate | Method | Confidence |
|----------|-------------|----------|--------|------------|
| 1.1.1 | [Name] | 5 pd | person-days | High |
| 1.1.2 | [Name] | M | t-shirt | Medium |
```

Gesamtaufwand = Summe aller Arbeitspakete.

**Erwartet:** Jedes Arbeitspaket hat eine Aufwandsschaetzung mit angegebenem Vertrauen.

**Bei Fehler:** Wenn das Vertrauen bei mehr als 30% der Pakete Niedrig ist, eine Verfeinerungssitzung mit Fachexperten einplanen.

### Schritt 5: Abhaengigkeiten und kritische Pfad-Kandidaten identifizieren

Abhaengigkeiten zwischen Arbeitspaketen abbilden:
```markdown
## Dependencies
| WBS Code | Depends On | Type | Notes |
|----------|-----------|------|-------|
| 1.2.1 | 1.1.1 | Finish-to-Start | Output of 1.1.1 is input to 1.2.1 |
| 2.1.1 | 1.1.2 | Finish-to-Start | |
```

Die laengste Kette abhaengiger Arbeitspakete identifizieren — dies ist der kritische Pfad-Kandidat.

**Erwartet:** Abhaengigkeitstabelle mit mindestens identifizierten Finish-to-Start-Beziehungen.

**Bei Fehler:** Wenn Abhaengigkeiten Zyklen bilden, hat die Zerlegung Fehler — Schritt 2 erneut durchfuehren.

### Schritt 6: Pruefen und Basislinie festlegen

PSP und Woerterbuch zu Abschlussdokumenten zusammenfassen. Die 100%-Regel auf jeder Ebene verifizieren. Stakeholder-Abzeichnung einholen.

**Erwartet:** WBS.md- und WBS-DICTIONARY.md-Dateien erstellt und geprueft.

**Bei Fehler:** Wenn Stakeholder fehlenden Umfang identifizieren, Arbeitspakete hinzufuegen und neu schaetzen.

## Validierung

- [ ] PSP-Datei mit Dokument-ID und PSP-Codes erstellt
- [ ] 100%-Regel erfuellt: Kinder repraesentieren vollstaendig den Elternumfang auf jeder Ebene
- [ ] Jeder Blattknoten hat einen PSP-Woerterbuch-Eintrag
- [ ] Alle Arbeitspakete haben Aufwandsschaetzungen
- [ ] Abhaengigkeiten ohne zirkulaere Referenzen identifiziert
- [ ] Project-Management-Zweig enthalten
- [ ] Kritische Pfad-Kandidaten identifiziert
- [ ] PSP-Tiefe ueberschreitet nicht 5 Ebenen

## Haeufige Stolperfallen

- **Lieferergebnisse mit Aktivitaeten verwechseln**: PSP-Elemente sollten Substantive (Lieferergebnisse) sein, keine Verben (Aktivitaeten). "User Authentication Module" nicht "Implement Authentication".
- **100%-Regel verletzen**: Wenn Kinder nicht 100% des Elternumfangs ergeben, wird Arbeit uebersehen.
- **Zu flach oder zu tief**: 2 Ebenen sind zu vage fuer Planung; 6+ Ebenen sind Mikromanagement. Ziel sind 3-5 Ebenen.
- **Project-Management-Zweig weglassen**: PM-Arbeit (Planung, Besprechungen, Berichte) ist echte Arbeit, die Aufwand verbraucht.
- **Vor der Zerlegung schaetzen**: Arbeitspakete schaetzen, nicht Kategorien. Eine Ebene-1-Schaetzung ist unzuverlaessig.
- **Kein Woerterbuch**: Ein PSP ohne Woerterbuch ist ein Baum von Bezeichnungen — das Woerterbuch liefert die Definition von "fertig".

## Verwandte Skills

- `draft-project-charter` — liefert den Umfang und die Lieferergebnisse, die die PSP-Zerlegung speisen
- `manage-backlog` — PSP-Arbeitspakete in Backlog-Elemente zur Verfolgung uebersetzen
- `generate-status-report` — Fortschritt gegen PSP-%-Abschluss berichten
- `plan-sprint` — bei hybridem Ansatz Sprint-Planung aus PSP-Arbeitspaketen
- `conduct-retrospective` — Schaetzungsgenauigkeit und Zerlegungsqualitaet ueberpruefen
