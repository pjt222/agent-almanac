---
name: validate-analytical-method
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Validiere analytische Methoden nach ICH Q2(R1)-Richtlinien durch Bestimmung
  von Spezifitaet, Linearitaet, Richtigkeit, Praezision, Nachweis- und
  Bestimmungsgrenze sowie Robustheit. Verwende diesen Skill bei der Validierung
  einer HPLC- oder GC-Methode fuer Arzneimittel, bei der Entwicklung einer
  Validierungsstrategie nach regulatorischen Anforderungen, beim Erstellen
  eines Validierungsplans fuer pharmazeutische Qualitaetskontrolle oder bei
  der Ueberleitung einer validierten Methode in ein anderes Labor.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: advanced
  language: natural
  tags: chromatography, validation, ICH, accuracy, precision, linearity
---

# Analytische Methode validieren

Validiere eine analytische Methode systematisch nach ICH Q2(R1) durch Nachweis aller relevanten Validierungsparameter: Spezifitaet, Linearitaet, Richtigkeit, Praezision (Wiederholbarkeit und Zwischenpraezision), Nachweisgrenze, Bestimmungsgrenze und Robustheit.

## Wann verwenden

- Validierung einer neuen HPLC- oder GC-Methode fuer Arzneimittelanalyse
- Entwicklung einer Validierungsstrategie nach ICH Q2(R1), EMA oder FDA-Anforderungen
- Methodentransfer zwischen Laboren (muessen Validierungsparameter verifiziert werden)
- Erweiterung einer validierten Methode auf neue Matrizen oder Konzentrationsbereiche
- Dokumentation der Methodenleistung fuer regulatorische Einreichungen

## Eingaben

- **Erforderlich**: Methodenbeschreibung (Saeule, Eluent, Detektion, Probenvorbereitung)
- **Erforderlich**: Analyt und Matrix (pharmazeutische Form, biologisches Material, Umweltmatrix)
- **Erforderlich**: Art der Methode (Gehaltsbestimmung, Verunreinigungsbestimmung, Identifizierung)
- **Optional**: Regulatorische Anforderungen (ICH, USP, Ph. Eur., FDA-Richtlinie)
- **Optional**: Zielspezifikationen aus entwickelter Methode

## Vorgehensweise

### Schritt 1: Validierungsplan erstellen

Lege Umfang und Strategie der Validierung fest:

1. **Validierungsparameter nach Methodentyp**:

| Parameter | Identifizierung | Gehaltsbestimmung | Verunreinigungen |
|-----------|----------------|------------------|-----------------|
| Spezifitaet | Ja | Ja | Ja |
| Linearitaet | Nein | Ja | Ja |
| Richtigkeit | Nein | Ja | Ja |
| Wiederholbarkeit | Nein | Ja | Ja |
| Zwischenpraezision | Nein | Ja | Ja |
| LOD | Nein | Nein | Ja |
| LOQ | Nein | Nein | Ja |
| Robustheit | Nein | Ja | Ja |

2. **Standardmengen planen**: Wieviele Standardloesungen pro Konzentration; wieviele Replikate.
3. **Probenplanung**: Welche Matrices? Welche Konzentrationsbereiche?
4. **Akzeptanzkriterien festlegen**: Was muss jeder Parameter erreichen um die Validierung zu bestehen?

```markdown
## Validierungsplan
- Methode: [Bezeichnung]
- Analyt: [Name, CAS-Nr.]
- Matrix: [Art der Probe]
- Regulatorische Basis: [ICH Q2(R1)/USP/andere]
- Geplante Konzentrationsbereiche: [min - max mg/L oder %]
```

**Erwartet:** Vollstaendiger Validierungsplan mit allen Parametern und Akzeptanzkriterien vor Beginn der experimentellen Arbeit.

**Bei Fehler:** Falls Akzeptanzkriterien unklar, konsultiere ICH Q2(R1) und interne SOPs; definiere Kriterien vor Beginn des Experiments.

### Schritt 2: Spezifitaet und Systemeignung pruefen

Zeige, dass die Methode selektiv fuer den Analyten ist:

1. **Placebotests**: Messe die leere Matrix (Placebo ohne Wirkstoff) und pruefe ob signifikante Interferierende vorhanden sind.
2. **Bekannte Verunreinigungen**: Injiziere Loesung mit bekannten Verunreinigungen; zeige, dass diese von Wirkstoffpeak getrennt sind (Rs >= 2,0).
3. **Stresstest-Proben** (Stabilitaetspruefung): Saeure/Lauge/Hitze/Licht-degradierte Proben; zeige dass Degradationsprodukte separiert sind.
4. **Systemeignungsparameter** (vor jeder Messreihe):
   - Aufloesung (Rs): >= 2,0 fuer kritische Peakpaare
   - Tailing-Faktor: 0,8-1,5
   - Bodenzahl (N): >= [Spezifikationswert]
   - Retentionszeit-RSD: < 1%

```markdown
## Spezifitaetstest
| Test | Bedingung | Ergebnis | Akzeptiert? |
|------|-----------|----------|-------------|
| Placebo | Matrix ohne Analyt | kein Peak bei tR | Ja/Nein |
| Verunreinigung X | [conc] | Rs = [wert] | Ja/Nein |
| Stresstest | [Bedingung] | Degradationsprodukte separiert | Ja/Nein |
```

**Erwartet:** Keine Interferenz durch Placebo; alle Verunreinigungen und Abbauprodukte ausreichend getrennt.

**Bei Fehler:** Falls Spezifitaet unzureichend, modifiziere Trennbedingungen (pH, Gradient, stationaere Phase) und wiederhole.

### Schritt 3: Linearitaet bestimmen

Zeige, dass das Detektorsignal linear mit der Analytkonzentration korreliert:

1. **Kalibrierbereich**: Typisch 50-150% des nominalen Analytgehalts fuer Gehaltsbestimmung; 0,1-120% fuer Verunreinigungen.
2. **Anzahl Kalibrierstandards**: Mindestens 5 Konzentrationen; doppelt oder dreifach gemessen.
3. **Auswertung**:
   - Lineare Regression; Berechnung von R2
   - R2 >= 0,999 fuer Gehaltsbestimmung; >= 0,998 fuer Verunreinigungen
   - Y-Achsenabschnitt: Pruefe auf Signifikanz (t-Test); wenn signifikant, pruefe Ursache
4. **Residualplot**: Auftragen der Residuen (Abweichung vom Fit) gegen Konzentration; systematische Muster deuten auf Nichtlinearitaet.

```markdown
## Linearitaetsergebnis
| Konzentrationsbereich | Steigung | Y-Achsenabschnitt | R2 | LOF-Test |
|----------------------|---------|-------------------|-----|---------|
| [min] - [max] [Einheit] | [wert] | [wert] | [wert] | bestanden |
```

**Erwartet:** R2 >= 0,999 im gesamten Kalibrierbereich; Residualplot ohne systematische Muster.

**Bei Fehler:** Falls R2 < 0,999, pruefe auf Ausreisser, Detektor-Saettigung bei hohen Konzentrationen oder Adsorptionseffekte bei niedrigen Konzentrationen. Erweitere ggf. den Konzentrationsbereich.

### Schritt 4: Richtigkeit und Praezision bestimmen

Zeige, dass die Methode den wahren Wert richtig und reproduzierbar misst:

1. **Richtigkeit (Accuracy)**:
   - Dotiere Placebo mit bekannten Mengen Analyt (typisch 80, 100, 120% des nominalen Gehalts)
   - Berechne Wiederfindung = (gemessen / eingesetzt) * 100%
   - Akzeptanzkriterium: 98-102% fuer Gehaltsbestimmung; 80-120% fuer Verunreinigungen
2. **Wiederholbarkeit (Repeatability)**:
   - 6 Injektionen derselben Probe (gleicher Tag, gleicher Analyst, gleiches Geraet)
   - Berechne RSD der Peakflaechenverhaeltnisse
   - Akzeptanzkriterium: RSD <= 2% fuer Gehaltsbestimmung; <= 5-10% fuer Verunreinigungen
3. **Zwischenpraezision (Intermediate Precision)**:
   - Messungen an verschiedenen Tagen und/oder durch verschiedene Analysten
   - Berechne RSD ueber alle Messreihen
   - Zeigt Robustheit des Verfahrens unter normalen Laborbedingungen

```markdown
## Richtigkeit und Praezision
| Konzentration (%) | n | Wiederfindung (%) | RSD (%) | Akzeptiert |
|------------------|---|------------------|---------|------------|
| 80 | 3 | [wert] | [wert] | Ja/Nein |
| 100 | 6 | [wert] | [wert] | Ja/Nein |
| 120 | 3 | [wert] | [wert] | Ja/Nein |
```

**Erwartet:** Wiederfindung 98-102% und RSD <= 2% (Gehaltsbestimmung) an allen Konzentrationspunkten.

**Bei Fehler:** Falls Wiederfindung systematisch zu hoch oder zu niedrig, pruefe Kalibrierung, Probenpraeparation und Matrixeffekte. Falls RSD zu gross, pruefe Injektorleistung und Probenhomoegnitaet.

### Schritt 5: LOD, LOQ und Robustheit bestimmen

Ermittle untere Nachweisgrenze und pruefe Methodenstabilitaet:

1. **Nachweisgrenze (LOD)**: Kleinste Menge, die mit S/N = 3 nachgewiesen werden kann.
   - LOD = 3,3 * sigma / S (sigma = Rauschen der Basislinie; S = Kalibrierkurvensteigung)
   - Alternativ experimentell durch Verduennen bis S/N = 3
2. **Bestimmungsgrenze (LOQ)**: Kleinste Menge, die mit angemessener Praezision und Richtigkeit bestimmt werden kann.
   - LOQ = 10 * sigma / S
   - Experimentell: S/N = 10 mit RSD <= 10% und Richtigkeit 80-120%
3. **Robustheit**: Kleine absichtliche Aenderungen der Methodenparameter:
   - pH +/- 0,2 Einheiten, Fluss +/- 0,1 mL/min, Temperatur +/- 5 degC
   - Pruefe ob Systemeignungsparameter weiterhin erfuellt werden
   - Dokument welche Parameter kritisch sind

```markdown
## Nachweis- und Bestimmungsgrenze
- LOD (S/N = 3): [Konzentration] [Einheit]
- LOQ (S/N = 10): [Konzentration] [Einheit]
- LOQ-Validierung: RSD = [%], Wiederfindung = [%]
```

**Erwartet:** LOD und LOQ bestimmt; alle Robustheitsstests im Akzeptanzbereich; kritische Parameter identifiziert.

**Bei Fehler:** Falls LOQ-Praezision unzureichend, prueffe Injektionspraezision bei niedrigen Konzentrationen (Adsorption, Verdampfung). Falls Robustheit unzureichend, identifiziere welcher Parameter kritisch ist und enge Toleranzen in Methodenbeschreibung ein.

## Validierung

- [ ] Validierungsplan mit allen Parametern und Akzeptanzkriterien erstellt
- [ ] Spezifitaet gegenueber Placebo, Verunreinigungen und Abbauprodukten gezeigt
- [ ] Linearitaet mit R2 >= 0,999 ueber den gesamten Kalibrierbereich bestimmt
- [ ] Richtigkeit an mindestens 3 Konzentrationspunkten geprueft
- [ ] Wiederholbarkeit (n = 6) und Zwischenpraezision dokumentiert
- [ ] LOD und LOQ experimentell bestimmt und verifiziert
- [ ] Robustheit gegenueber kleinen Parameteraenderungen geprueft
- [ ] Validierungsprotokoll erstellt und von verantwortlicher Person unterzeichnet

## Haeufige Stolperfallen

- **Akzeptanzkriterien erst nach Ergebnissen festlegen**: Kriterien muessen vor dem Experiment definiert sein; nachtraegliche Anpassung ist regulatorisch inakzeptabel.
- **Nur interne Standards fuer Gehaltsbestimmung**: Externe Standardkalibrierung ist fuer Gehaltsbestimmung akzeptiert, aber Matrixeffekte muessen ausgeschlossen werden.
- **Robustheit mit zu grossen Aenderungen**: Robustheitstests sollen kleine, praxisrelevante Aenderungen simulieren; zu grosse Aenderungen testen die Methode ausserhalb ihres Anwendungsbereichs.
- **Fehlende statistische Auswertung**: Alle Ergebnisse muessen statistisch ausgewertet werden (Mittelwert, SD, RSD, Konfidenzintervall).

## Verwandte Skills

- `develop-hplc-method` -- HPLC-Methoden entwickeln vor Validierung
- `develop-gc-method` -- GC-Methoden entwickeln vor Validierung
- `troubleshoot-separation` -- Probleme beheben die Validierungsergebnis beeinflussen
