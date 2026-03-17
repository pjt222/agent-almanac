---
name: review-data-analysis
description: >
  Ueberprueft eine Datenanalyse auf Qualitaet, Korrektheit und Reproduzierbarkeit.
  Umfasst Datenqualitaetsbewertung, Annahmenprüfung, Modellvalidierung, Data-Leakage-
  Erkennung und Reproduzierbarkeitsverifikation. Verwenden beim Review einer Kollegen-
  Analyse vor der Publikation, bei der Validierung einer ML-Pipeline vor dem
  Produktionseinsatz, beim Audit eines Berichts fuer regulatorische oder
  geschaeftliche Entscheidungen oder bei einem Zweitanalysten-Review in einer
  regulierten Umgebung.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: data-quality, model-validation, leakage, reproducibility, statistics, review
---

# Datenanalyse reviewen

Eine Datenanalyse-Pipeline auf Korrektheit, Robustheit und Reproduzierbarkeit ueberpruefen.

## Wann verwenden

- Review der Analyse-Notebooks oder Skripte eines Kollegen vor der Publikation
- Validierung einer Machine-Learning-Pipeline vor dem Produktionseinsatz
- Audit eines Analyseberichts fuer regulatorische oder geschaeftliche Entscheidungen
- Einschaetzung, ob eine Analyse ihre formulierten Schlussfolgerungen stuetzt
- Zweitanalysten-Review in einer regulierten Umgebung

## Eingaben

- **Erforderlich**: Analysecode (Skripte, Notebooks oder Pipeline-Definitionen)
- **Erforderlich**: Analyseausgabe (Ergebnisse, Tabellen, Abbildungen, Modellmetriken)
- **Optional**: Rohdaten oder Datenlexikon
- **Optional**: Analyseplan oder Protokoll (vorab registriert oder ad-hoc)
- **Optional**: Zielgruppe und Entscheidungskontext

## Vorgehensweise

### Schritt 1: Datenqualitaet bewerten

Die Eingabedaten vor der Bewertung der Analyse ueberpruefen:

```markdown
## Datenqualitaetsbewertung

### Vollstaendigkeit
- [ ] Fehlende Daten quantifiziert (% pro Spalte und pro Zeile)
- [ ] Mechanismus fehlender Daten beruecksichtigt (MCAR, MAR, MNAR)
- [ ] Imputationsmethode angemessen (falls verwendet) oder Vollfall-Analyse begruendet

### Konsistenz
- [ ] Datentypen entsprechen den Erwartungen (Datumsangaben sind Datum, Zahlen sind Zahlen)
- [ ] Werteranges sind plausibel (keine negativen Altersangaben, Zukunftsdaten in historischen Daten)
- [ ] Kategorische Variablen haben erwartete Auspraegungen (keine Tippfehler, einheitliche Kodierung)
- [ ] Einheiten sind ueber alle Datensaetze konsistent

### Eindeutigkeit
- [ ] Duplikate identifiziert und behandelt
- [ ] Primaerschluessel sind wo erwartet eindeutig
- [ ] Join-Operationen liefern erwartete Zeilenanzahl (kein Fan-out oder Verlust)

### Aktualitaet
- [ ] Datenvintage fuer die Analysefrage angemessen
- [ ] Zeitliche Abdeckung entspricht dem Studienzeitraum
- [ ] Kein Look-ahead-Bias in Zeitreihendaten

### Herkunft
- [ ] Datenquelle dokumentiert
- [ ] Extraktionsdatum/-version festgehalten
- [ ] Alle Transformationen zwischen Quelle und Analyseeingabe dokumentiert
```

**Erwartet:** Datenqualitaetsprobleme mit ihrem potenziellen Einfluss auf die Ergebnisse dokumentiert.
**Bei Fehler:** Wenn die Daten fuer den Review nicht zugaenglich sind, die Qualitaet aus dem Code beurteilen (welche Pruefungen und Transformationen werden angewendet).

### Schritt 2: Annahmen pruefen

Fuer jede verwendete statistische Methode oder jedes Modell:

| Methode | Wesentliche Annahmen | Wie pruefen |
|--------|----------------|-------------|
| Lineare Regression | Linearitaet, Unabhaengigkeit, Normalverteilung der Residuen, Homoskedastizitaet | Residualplots, Q-Q-Plot, Durbin-Watson, Breusch-Pagan |
| Logistische Regression | Unabhaengigkeit, keine Multikollinearitaet, lineares Logit | VIF, Box-Tidwell, Residualdiagnostik |
| t-Test | Unabhaengigkeit, Normalverteilung (oder grosses n), gleiche Varianz | Shapiro-Wilk, Levene-Test, visuelle Inspektion |
| ANOVA | Unabhaengigkeit, Normalverteilung, Varianzgleichheit | Shapiro-Wilk pro Gruppe, Levene-Test |
| Chi-Quadrat | Unabhaengigkeit, erwartete Haeufigkeit ≥ 5 | Tabelle der erwarteten Haeufigkeiten |
| Random Forest | Ausreichende Trainingsdaten, Feature-Relevanz | OOB-Fehler, Feature-Importance, Lernkurven |
| Neuronales Netz | Ausreichende Daten, geeignete Architektur, kein Data Leakage | Validierungskurven, Ueberpruefung auf Overfitting |

```markdown
## Ergebnisse der Annahmenprüfung
| Analyseschritt | Methode | Annahme | Geprueft? | Ergebnis |
|---------------|--------|------------|----------|--------|
| Primaermodell | Lineare Regression | Normalverteilung der Residuen | Ja | Q-Q-Plot zeigt leichte Abweichung — akzeptabel fuer n>100 |
| Primaermodell | Lineare Regression | Homoskedastizitaet | Nein | Nicht geprueft — Breusch-Pagan-Test empfohlen |
```

**Erwartet:** Jede statistische Methode hat ihre Annahmen explizit geprueft oder anerkannt.
**Bei Fehler:** Wenn Annahmen verletzt sind, pruefen, ob die Autoren dies berucksichtigt haben (robuste Methoden, Transformationen, Sensitivitaetsanalyse).

### Schritt 3: Data Leakage erkennen

Data Leakage tritt auf, wenn Informationen ausserhalb des Trainingssets das Modell beeinflussen und zu uebertrieben optimistischer Leistung fuehren:

#### Haeufige Leakage-Muster:
- [ ] **Target Leakage**: Feature, das die Zielvariable direkt kodiert (z. B. "treatment_outcome" zur Vorhersage von "treatment_success")
- [ ] **Temporales Leakage**: Zukuenftige Informationen zur Vorhersage der Vergangenheit (Features aus Daten, die zum Prognosezeitpunkt nicht verfuegbar waeren)
- [ ] **Train-Test-Kontamination**: Vorverarbeitung (Skalierung, Imputation, Feature-Selektion) auf dem gesamten Datensatz vor dem Aufteilen
- [ ] **Gruppen-Leakage**: Verwandte Beobachtungen (gleicher Patient, gleiches Geraet) auf Train- und Testsets aufgeteilt
- [ ] **Feature-Engineering-Leakage**: Aggregate ueber den gesamten Datensatz statt innerhalb des Trainingsfolds berechnet

```markdown
## Leakage-Bewertung
| Pruefung | Status | Nachweis |
|-------|--------|----------|
| Target Leakage | Unbedenklich | Keine aus dem Ziel abgeleiteten Features |
| Temporales Leakage | BEDENKEN | Feature X verwendet 30-Tage-Vorwaertsanalyse |
| Train-Test-Kontamination | Unbedenklich | StandardScaler nur auf Train angepasst |
| Gruppen-Leakage | BEDENKEN | Patienten-IDs nicht fuer geschichtete Aufteilung verwendet |
```

**Erwartet:** Alle haeufigen Leakage-Muster mit klar/Bedenken-Status geprueft.
**Bei Fehler:** Wenn Leakage gefunden wird, dessen Auswirkung abschaetzen, indem ohne das durchgesickerte Feature neu ausgewertet wird (wenn moeglich), oder fuer den Analysten zur Untersuchung markieren.

### Schritt 4: Modellleistung validieren

#### Fuer Prognosemodelle:
- [ ] Angemessene Metriken fuer das Problem (nicht nur Genauigkeit — Praezision, Recall, F1, AUC, RMSE, MAE beruecksichtigen)
- [ ] Kreuzvalidierungs- oder Holdout-Strategie beschrieben und angemessen
- [ ] Leistung auf Trainings- vs. Test-/Validierungsset verglichen (Overfitting-Pruefung)
- [ ] Baseline-Vergleich angegeben (naives Modell, Zufallszufall, frueherer Ansatz)
- [ ] Konfidenzintervalle oder Standardfehler fuer Leistungsmetriken
- [ ] Leistung auf relevanten Untergruppen bewertet (Fairness, Grenzfaelle)

#### Fuer inferenzielle/erklaerende Modelle:
- [ ] Modellanpassungsstatistiken berichtet (R², AIC, BIC, Devianz)
- [ ] Koeffizienten korrekt interpretiert (Richtung, Groesse, Signifikanz)
- [ ] Multikollinearitaet bewertet (VIF < 5–10)
- [ ] Einflussreiche Beobachtungen identifiziert (Cook's Distanz, Leverage)
- [ ] Modellvergleich wenn mehrere Spezifikationen getestet

**Erwartet:** Modellvalidierung angemessen fuer den Anwendungsfall (Prognose vs. Inferenz).
**Bei Fehler:** Wenn die Testset-Leistung verdaechtig nah an der Trainingsleistung ist, potenzielles Leakage markieren.

### Schritt 5: Reproduzierbarkeit bewerten

```markdown
## Reproduzierbarkeits-Checkliste
| Punkt | Status | Anmerkungen |
|------|--------|-------|
| Code laeuft fehlerfrei | [Ja/Nein] | Getestet auf [Umgebungsbeschreibung] |
| Zufallsseeds gesetzt | [Ja/Nein] | Zeile [N] in [Datei] |
| Abhaengigkeiten dokumentiert | [Ja/Nein] | requirements.txt / renv.lock vorhanden |
| Datenladen reproduzierbar | [Ja/Nein] | Pfad ist [relativ/absolut/URL] |
| Ergebnisse stimmen mit berichteten Werten ueberein | [Ja/Nein] | Verifiziert: Tabelle 1 ✓, Abbildung 2 ✗ (geringfuegige Abweichung) |
| Umgebung dokumentiert | [Ja/Nein] | Python 3.11 / R 4.5.0 angegeben |
```

**Erwartet:** Reproduzierbarkeit durch erneute Ausfuehrung der Analyse verifiziert (oder aus dem Code bewertet, wenn Daten nicht verfuegbar sind).
**Bei Fehler:** Wenn sich Ergebnisse nicht exakt reproduzieren lassen, bestimmen, ob Unterschiede innerhalb der Gleitkomma-Toleranz liegen oder auf ein Problem hinweisen.

### Schritt 6: Das Review verfassen

```markdown
## Datenanalyse-Review

### Gesamtbewertung
[1-2 Saetze: Ist die Analyse solide? Stuetzt sie die Schlussfolgerungen?]

### Datenqualitaet
[Zusammenfassung der Datenqualitaetsbefunde, Auswirkungen auf die Ergebnisse]

### Methodische Bedenken
1. **[Titel]**: [Beschreibung, Stelle im Code/Bericht, Vorschlag]
2. ...

### Staerken
1. [Was gut gemacht wurde]
2. ...

### Reproduzierbarkeit
[Stufenbewertung: Gold/Silber/Bronze/Undurchsichtig mit Begruendung]

### Empfehlungen
- [ ] [Spezifische Handlungsaufgaben fuer den Analysten]
```

**Erwartet:** Review liefert umsetzbare Rueckmeldungen mit spezifischen Verweisen auf Codestellen.
**Bei Fehler:** Bei Zeitdruck Datenqualitaet und Leakage-Prüfungen vor Stilproblemen priorisieren.

## Validierung

- [ ] Datenqualitaet in Bezug auf Vollstaendigkeit, Konsistenz, Eindeutigkeit, Aktualitaet, Herkunft bewertet
- [ ] Statistische Annahmen fuer jede verwendete Methode geprueft
- [ ] Data Leakage systematisch bewertet
- [ ] Modellleistung mit angemessenen Metriken und Baselines validiert
- [ ] Reproduzierbarkeit bewertet (Code laeuft, Ergebnisse stimmen ueberein)
- [ ] Rueckmeldungen sind spezifisch und verweisen auf Codezeilen oder Berichtsabschnitte
- [ ] Ton ist konstruktiv und kollaborativ

## Haeufige Stolperfallen

- **Nur den Code reviewen**: Analyseplan und Schlussfolgerungen sind ebenso wichtig wie die Implementierung.
- **Datenqualitaet ignorieren**: Anspruchsvolle Modelle auf schlechten Daten liefern selbstsichere falsche Antworten.
- **Korrektheit aus Komplexitaet annehmen**: Ein Random Forest mit 95% Genauigkeit koennte Data Leakage haben; ein einfacher t-Test koennte der richtige Ansatz sein.
- **Den Code nicht ausfuehren**: Wenn irgend moeglich, den Code ausfuehren, um die Reproduzierbarkeit zu verifizieren. Das Lesen von Code reicht nicht.
- **Den Wald vor lauter Baeumen nicht sehen**: Nicht in Codestilproblemen verlieren und dabei einen grundlegenden Analysefehler uebersehen.

## Verwandte Skills

- `review-research` — breitere Forschungsmethodik und Manuskript-Review
- `validate-statistical-output` — Doppelprogrammierungs-Verifikationsmethodik
- `generate-statistical-tables` — publikationsreife statistische Tabellen
- `review-software-architecture` — Codestruktur- und Design-Review
