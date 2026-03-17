---
name: plan-spectroscopic-analysis
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Plane eine spektroskopische Analysestrategie durch systematische Auswahl
  komplementaerer Methoden basierend auf Probentyp, analytischer Fragestellung
  und verfuegbarer Ausstattung. Verwende diesen Skill beim Auswahlen der
  geeigneten Spektroskopiemethoden fuer Strukturaufklaerung oder
  Qualitaetskontrolle, beim Priorisieren von Messungen nach
  Informationsgehalt und Kosten, beim Erstellen eines Messplans oder beim
  Entscheiden zwischen komplementaeren Methoden wie NMR, IR, MS und UV-Vis.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, analysis-planning, method-selection, characterization
---

# Spektroskopische Analyse planen

Entwickle eine systematische Analysestrategie durch Bewertung der analytischen Fragestellung, Charakterisierung der Probe, Auswahl komplementaerer Spektralmethoden und Erstellung eines priorisierten Messplans mit Erwartungsaussagen zu jedem Experiment.

## Wann verwenden

- Auswahl der geeignetsten Spektroskopiemethoden fuer eine unbekannte Verbindung
- Planung einer effizienten Messsequenz fuer Strukturaufklaerung
- Entscheiden zwischen komplementaeren Methoden (NMR vs. IR vs. MS)
- Entwickeln einer Analysestrategie fuer ein Qualitaetskontrollprogramm
- Budgetierung und Priorisierung von Messungen nach Informationsgehalt

## Eingaben

- **Erforderlich**: Analytische Fragestellung (Identifizierung, Reinheitspruefung, Konzentrationsbestimmung, Strukturaufklaerung)
- **Erforderlich**: Verfuegbare Probenmenge und physikalische Form (Feststoff, Fluessigkeit, Gas, Loesung)
- **Optional**: Vorwissen ueber die Verbindung (Verbindungsklasse, Molmasse, Loeslichkeit)
- **Optional**: Verfuegbare Geraete und Budget
- **Optional**: Zeitliche Constraints

## Vorgehensweise

### Schritt 1: Analytische Fragestellung praezisieren

Definiere das Analyseziel klar, bevor Methoden ausgewaehlt werden:

1. **Fragestellungstypen**:
   - Identifizierung unbekannter Verbindung (welche Struktur?)
   - Reinheitspruefung (wieviel Verunreinigung vorhanden?)
   - Quantifizierung (wieviel der Zielverbindung liegt vor?)
   - Strukturbestaetigung (stimmt die synthetisierte Verbindung mit dem Syntheseziel ueberein?)
   - Stabilitaetspruefung (aendert sich die Verbindung ueber die Zeit?)
2. **Anforderungen spezifizieren**: Erforderliche Empfindlichkeit, Genauigkeit, Aufloesung und Durchsatz.
3. **Erwartetes Ergebnis**: Was wird das Ergebnis der Analyse sein? Wie wird es verwendet?

```markdown
## Analytische Fragestellung
- Fragestellung: [Identifizierung/Reinheit/Quantifizierung/Strukturbestaetigung]
- Probe: [Beschreibung, Menge, Zustand]
- Erwartetes Ergebnis: [Aussage oder Entscheidung]
- Genauigkeitsanforderung: [qualitativ/semiquantitativ/quantitativ]
```

**Erwartet:** Eindeutige Formulierung der analytischen Fragestellung und Kriterien fuer ein erfolgreiches Analyseergebnis.

**Bei Fehler:** Falls die Fragestellung zu vage ist ("Was ist in der Probe?"), erarbeite mit dem Auftraggeber eine spezifischere Formulierung basierend auf vermutetem Probenursprung und Verwendungszweck.

### Schritt 2: Probe charakterisieren und Methodeneignung bewerten

Bewerte die Probe auf Eignung fuer verschiedene Methoden:

1. **Loeslichkeit**: NMR und UV-Vis erfordern Loesungen; IR und Raman koennen Feststoffe messen.
2. **Probenmenge**: NMR erfordert typisch 1-10 mg; MS kann mit Nanogramm arbeiten; IR und Raman sind flexibel.
3. **Stabilitaet**: Thermisch labile Verbindungen koennen unter NMR-Messbedingungen (Raumtemperatur) stabil sein, aber nicht unter GC-Bedingungen.
4. **Toxizitaet und Fluechtigkeit**: Beeinflusst Handhabung und Probenaufbereitung.
5. **Loesungsmittelkompatibilitaet**: Wasserhaltige Proben fuer NMR erfordern deuteriertes Loesungsmittel oder spezielle Messtechniken.

```markdown
## Probencharakterisierung
| Eigenschaft | Wert | Methodenrelevanz |
|-------------|------|-----------------|
| Aggregatzustand | [fest/fluessig/Gas] | IR/Raman vs. NMR/UV |
| Loeslichkeit | [polar/apolar/wassermischbar] | Loesungsmittelwahl |
| Probenmenge | [mg] | Empfindlichkeitsanforderung |
| Stabilitaet | [stabil/labil] | Messreihenfolge |
```

**Erwartet:** Einschraenkungsliste, die bestimmte Methoden ausschliesst oder priorisiert.

**Bei Fehler:** Falls Loeslichkeit oder Stabilitaet unbekannt sind, fuehre zuerst einfache Tests durch (Loeslichkeitstests in gaengigen Loesungsmitteln).

### Schritt 3: Geeignete Methoden auswaehlen und priorisieren

Erstelle einen priorisierten Methodenplan basierend auf Fragestellung und Probe:

1. **Methoden nach Informationsgehalt bewerten**:

| Methode | Staerke | Schwaeche | Typische Anwendung |
|---------|---------|-----------|-------------------|
| 1H-NMR | Protonenkonnektivitaet, Stereochemie | Begrenzte Empfindlichkeit | Struktur organischer Verbindungen |
| 13C-NMR | Kohlenstoffgeruest | Zeit, Empfindlichkeit | Vollstaendige Strukturzuweisung |
| IR | Funktionelle Gruppen | Komplexer Fingerprint | Schnelle Gruppenidentifizierung |
| Raman | Symmetrische Schwingungen, Feststoffe | Fluoreszenzproblem | Mineralien, Polymere, C-Materialien |
| MS (EI) | Molmasse, Fragmente | Ionisierung | Fluechtiges, niedermolekulares |
| MS (ESI) | Biomolekuele, Ionen | Adduktbildung | Peptide, Lipide, polare Verbindungen |
| UV-Vis | Chromophore, Konzentration | Keine Strukturdetails | Konjugation, Quantifizierung |
| HRMS | Exakte Masse, Formel | Kosten | Unbekannte Verbindungen |

2. **Sequenz planen**:
   - Zuerst zerstoerungsfreie Methoden (NMR, IR, Raman)
   - Dann destruktive/verbrauchende Methoden (MS, Elementaranalyse)
   - Massenspektrometrie fuer Molmasse fruehzeitig, falls unbekannt

**Erwartet:** Priorisierter Messplan mit Begruendung fuer jede ausgewaehlte Methode.

**Bei Fehler:** Falls mehrere Methoden aehnliche Information liefern, priorisiere nach Kosten, Verfuegbarkeit und Probenverbrauch.

### Schritt 4: Messplan erstellen

Erstelle einen detaillierten Messplan mit Erwartungsaussagen:

1. **Reihenfolge festlegen**: Welche Messung zuerst? Wann sind Ergebnisse einer Messung Voraussetzung fuer die naechste?
2. **Probenaufbereitung spezifizieren**: Konzentration fuer NMR, Probenpraeparation fuer IR (KBr, ATR), Verduennung fuer UV-Vis.
3. **Erwartete Ergebnisse formulieren**: Was wird in jedem Experiment erwartet, wenn die Hypothese stimmt?
4. **Entscheidungsbaum erstellen**: Falls Ergebnis A erhalten wird, fuehre Experiment X durch; falls Ergebnis B, fuehre Y durch.

```markdown
## Messplan
| Prioritaet | Methode | Probenvorbereitung | Erwartetes Ergebnis | Entscheidung |
|-----------|---------|-------------------|--------------------|----|
| 1 | [Methode] | [Vorbereitung] | [Erwartung] | [naechster Schritt] |
| 2 | [Methode] | [Vorbereitung] | [Erwartung] | [naechster Schritt] |
```

**Erwartet:** Vollstaendiger Messplan der alle analytischen Fragestellungen adressiert und klare Entscheidungskriterien fuer den naechsten Schritt enthält.

**Bei Fehler:** Falls der Plan zu viele Methoden benoetigt, pruefe ob einige Fragestellungen redundant sind oder durch eine Methode beantwortet werden koennen.

### Schritt 5: Ressourcen und Zeitplan abschaetzen

Kalkuliere den Aufwand fuer den Analyseplan:

1. **Zeitaufwand**: NMR (15-60 Min.), IR (5-15 Min.), MS (10-30 Min.), UV-Vis (5-15 Min.) pro Probe.
2. **Kosten**: Abschaetzung nach internem Preisverzeichnis oder externer Auftragsmessung.
3. **Alternativen bei Ressourcenmangel**: Welche Abstriche sind moeglich? Welche Information ist unverzichtbar?
4. **Qualitaetssicherung**: Plant der Messplan Wiederholmessungen und Referenzsubstanzen ein?

**Erwartet:** Realistischer Zeit- und Kostenplan, der Priorisierung erlaubt falls Ressourcen begrenzt sind.

## Validierung

- [ ] Analytische Fragestellung klar formuliert
- [ ] Probeneigenschaften erhoben und methodenrelevante Einschraenkungen identifiziert
- [ ] Methoden nach Informationsgehalt und Komplementaritaet ausgewaehlt
- [ ] Messsequenz mit Begruendung festgelegt
- [ ] Erwartungsaussagen fuer jede Methode formuliert
- [ ] Zeit- und Kostenaufwand abgeschaetzt

## Haeufige Stolperfallen

- **Methodenauswahl ohne klare Fragestellung**: Ohne definiertes Analyseziel werden zu viele Methoden eingesetzt und die Ergebnisse schwer interpretierbar.
- **Ignorieren der Probenkompatibilitaet**: Methoden auswaehlen ohne Probe auf Eignung zu pruefen fuehrt zu Fehlmessungen.
- **Destruktive Methoden zuerst**: Wenn eine destruktive Methode zuerst eingesetzt wird, sind keine weiteren Messungen moeglich.
- **Keine Referenzsubstanzen eingeplant**: Ohne Referenzsubstanzen koennen Ergebnisse nicht verifiziert werden.

## Verwandte Skills

- `interpret-nmr-spectrum` -- NMR-Daten interpretieren
- `interpret-ir-spectrum` -- IR-Daten auswerten
- `interpret-mass-spectrum` -- Massenspektren analysieren
- `interpret-uv-vis-spectrum` -- UV-Vis-Daten interpretieren
