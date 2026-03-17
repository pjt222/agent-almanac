---
name: interpret-chromatogram
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretiere Chromatogramme aus GC, HPLC und CE zur qualitativen und
  quantitativen Auswertung von Trennergebnissen. Analysiere Peakform,
  Retentionszeiten, Aufloesung und Peakflaechensignal. Verwende diesen Skill
  beim Zuordnen von Peaks zu Substanzen, beim Erkennen von
  Trennproblemen aus Peakform und Retentionszeit, beim Quantifizieren von
  Analyten durch Peakflaeche oder Peakhoehe oder beim Diagnostizieren
  von Systemmerkmalen wie Totvolumen und Peakkapazitaet.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, peak-analysis, retention-time, resolution, quantification
---

# Chromatogramm interpretieren

Interpretiere chromatographische Trennungen durch systematische Analyse von Retentionszeiten, Peakformen und Aufloesung zur qualitativen Substanzzuordnung und quantitativen Auswertung.

## Wann verwenden

- Zuordnen von Chromatogramm-Peaks zu bekannten Substanzen
- Bewerten der Trennleistung (Aufloesung, Bodenzahl, Peakform)
- Quantifizieren von Analyten per Peakflaechenvergleich
- Diagnostizieren von Trennproblemen (Tailing, Fronting, Peakverbreiterung)
- Vergleichen von Chromatogrammen unterschiedlicher Proben oder Zeitpunkte

## Eingaben

- **Erforderlich**: Chromatogramm (Rohdaten oder digitalisiertes Bild) mit Peakpositionen und Signalintensitaet
- **Erforderlich**: Methode und Bedingungen (Saeulentyp, Eluent, Temperaturprogramm oder Gradient)
- **Optional**: Referenzsubstanzen oder Retentionszeitdatenbank
- **Optional**: Kalibrierloesungen fuer quantitative Auswertung

## Vorgehensweise

### Schritt 1: Chromatogramm sichten und Basislinie bewerten

Analysiere das Chromatogramm global bevor einzelne Peaks bewertet werden:

1. **Basislinie beurteilen**: Sollte flach und rauscharm sein. Ansteigendes Drift deutet auf Gradienteneffekte oder Columnausbluten hin.
2. **Signal-Rausch-Verhaeltnis (S/N)**: S/N > 3 fuer Nachweis (LOD); S/N > 10 fuer Quantifizierung (LOQ).
3. **Totzeit (t0) bestimmen**: Zeit des nicht-retenierten Peaks (Luft oder nicht-interagierendes Ion); Grundlage fuer Retentionsfaktor k'.
4. **Gesamtlaufzeit bewerten**: Sind alle Analyten innerhalb der Laufzeit eluiert?

```markdown
## Chromatogramm-Ueberblick
- Basislinie: [stabil/Drift/verrauscht]
- Gesamtlaufzeit: [min]
- Totzeit t0: [min]
- Anzahl sichtbarer Peaks: [n]
- S/N des kleinsten Peaks: [wert]
```

**Erwartet:** Erste Qualitaetsbewertung des Chromatogramms und Identifizierung potentieller Probleme.

**Bei Fehler:** Falls die Basislinie stark driftet, pruefe Loesungsmittelstabilitaet, Saeulentemperatur und Detektorkalibrierung.

### Schritt 2: Retentionszeiten bestimmen und Peaks zuordnen

Identifiziere und ordne jeden Peak einer Substanz zu:

1. **Retentionszeit (tR)**: Zeit vom Injektionszeitpunkt bis zum Peakmaximum.
2. **Retentionsfaktor (k')**: k' = (tR - t0) / t0; sollte fuer die meisten Analyten zwischen 1 und 10 liegen.
3. **Peakzuordnung**:
   - Vergleich mit Retentionszeiten aus Referenzloesungen oder Bibliotheken
   - Kovatssche Retentionsindizes fuer GC (normiert auf n-Alkane)
   - Co-Chromatographie: Spike der Probe mit bekannter Substanz; Peakvergroesserung bestaetigt Zuordnung
4. **Unbekannte Peaks**: Notiere Retentionszeit, Peakflaeche und eventuelle Spektraldaten (UV/MS).

```markdown
## Peakzuordnung
| Peak-Nr. | Retentionszeit tR (min) | k' | Zuordnung | Bestaetigung |
|----------|------------------------|------|-----------|-------------|
| 1 | [wert] | [wert] | [Substanz] | [Methode] |
```

**Erwartet:** Alle Peaks zugeordnet oder als unbekannt markiert; Retentionsfaktoren im erwarteten Bereich.

**Bei Fehler:** Falls Peaks nicht zugeordnet werden koennen, fuehre MS-Kopplung oder Bibliothekssuche durch. Falls Retentionszeiten stark variieren (> 1% RSD), pruefe Systemdruckstabilitaet und Pufferqualitaet.

### Schritt 3: Peakform analysieren

Bewerte die Form jedes signifikanten Peaks:

1. **Tailing-Faktor (As)**: As = b/a bei 10% der Peakhoehe; ideal 0,8-1,2; > 1,2 = Tailing.
2. **Ursachen fuer Peaktailing**:
   - Basische Verbindungen auf nicht-endgekappter C18-Saeule
   - Inaktive Silanolgruppen auf Kieselgel
   - Zu hohe Analytmenge (Saeulenueberlastung)
   - Tovolumen in Verbindungskapillaren
3. **Peakverbreiterung**: Breite Peaks deuten auf schlechte kinetische Effizienz; pruefe Flussrate, Temperatur, Partikelgroesse.
4. **Fronting**: Peakfront breiter als Flanke; typisch bei Saeulenueberlastung.
5. **Split-Peaks**: Zwei Maxima in einem Peak; deutet auf Phasentrennung, Matrixeffekte oder zwei Verbindungen.

```markdown
## Peakformanalyse
| Peak | tR (min) | Peakbreite w (min) | Tailing-Faktor As | Diagnose |
|------|----------|-------------------|-------------------|----------|
| [n] | [wert] | [wert] | [wert] | [Normal/Tailing/Fronting] |
```

**Erwartet:** Tailing-Faktoren zwischen 0,8 und 1,5; kein Split-Peak bei korrekt getrennten Analyten.

**Bei Fehler:** Tailing bei Basen: Erhoeher pH oder C18-Phase mit endgekappten Silanolgruppen. Fronting bei hoher Konzentration: Probe verduennen.

### Schritt 4: Trennleistung berechnen

Berechne quantitative Leistungsparameter des Chromatogramms:

1. **Bodenzahl (N)**: N = 5,545 * (tR / w_halbhoehe)^2; Effizienzmasszahl der Saeule.
2. **Aufloesung (Rs)**: Rs = 2 * (tR2 - tR1) / (w1 + w2); Rs >= 1,5 = Basislinientrennung.
3. **Selektivitaet (alpha)**: alpha = k'2 / k'1; alpha > 1 bedeutet Trennung; alpha nahe 1 erfordert hohe Bodenzahl.
4. **Peakkapazitaet (nc)**: Anzahl peaks die in einem Gradienten getrennt werden koennen; nc = 1 + (Gradientenbreite / w_halbhoehe).

```markdown
## Trennleistungsparameter
| Parameter | Berechnung | Wert | Bewertung |
|-----------|-----------|------|-----------|
| N (Bodenzahl) | 5,545*(tR/w_0.5)^2 | [wert] | [gut/mittel/schlecht] |
| Rs (Aufloesung) | 2*(tR2-tR1)/(w1+w2) | [wert] | [>=1.5: OK] |
| alpha (Selektivitaet) | k'2/k'1 | [wert] | [>1.0: getrennt] |
```

**Erwartet:** N > 5000 pro Meter fuer typische HPLC; Rs >= 1,5 fuer quantitative Auswertung.

**Bei Fehler:** Falls N zu niedrig, pruefe Saeulenzustand (Verstopfung, Degradierung) oder Systemtovolumen. Falls Rs unzureichend, optimiere Bedingungen oder wechsle stationaere Phase.

### Schritt 5: Quantitative Auswertung durchfuehren

Berechne Analytkonzentrationen aus Peakflaechen oder -hoehen:

1. **Kalibrierungsmethoden**:
   - Externe Standardkalibrierung: Kalibrierkurve aus Standardloesungen; einfach, aber anfaellig fuer Volumenungenauigkeiten
   - Interne Standardmethode: Bekannte Menge eines aehnlichen (nicht-interferierenden) Standards zugesetzt; kompensiert Volumenschwankungen
   - Standardaddition: Fuer komplexe Matrizen; Analyt der Probe in bekannter Menge zugesetzt
2. **Peakflaechenverhaeltnis**: Verhaeltnis Analyt/interner Standard fuer praezisere Quantifizierung.
3. **Kalibrierbereich**: Sollte den Konzentrationsbereich der Proben abdecken; R2 > 0,999 fuer lineare Regression.
4. **Wiederfindung**: Pruefe Wiederfindung mit dotierten Proben (Spike-Recovery); soll 80-120% sein.

**Erwartet:** Konzentrationsangaben mit Unsicherheitsintervall und dokumentierter Kalibriermethode.

**Bei Fehler:** Falls Kalibrierung nichtlinear ist, pruefe auf Detektorueberlastung, reduziere Konzentrationsbereich oder verwende quadratische Kurvenanpassung.

## Validierung

- [ ] Basislinie beurteilt und Totzeit bestimmt
- [ ] Alle Peaks mit Retentionszeit und Retentionsfaktor dokumentiert
- [ ] Peakzuordnung durch Referenzsubstanz oder Co-Injektion bestaetigt
- [ ] Tailing-Faktoren bestimmt und Auffaelligkeiten erklaert
- [ ] Aufloesung Rs zwischen kritischen Peakpaaren berechnet
- [ ] Quantitative Auswertung mit geeigneter Kalibriermethode

## Haeufige Stolperfallen

- **Peakzuordnung nur nach Retentionszeit**: Retentionszeiten koennen durch Matrixeffekte, Temperaurschwankungen oder Systemdruck variieren; bestaetigung durch Spike oder Spektrum notwendig.
- **Vernachlaessigung von Totvolumen**: Grosse Tovolumina im System verbreitern Peaks und verrinegern Aufloesung; besonders wichtig bei UHPLC.
- **Saeulenueberlastung**: Zu hohe Analytenmengen fuehren zu Fronting und nichtlinearer Kalibrierkurve; immer Linearitaetstest durchfuehren.
- **Basisliniendrift bei Quantifizierung**: Fehlerhafte Basislinienkorrektur durch Drift fuehrt zu falschen Peakflaechenwerten.

## Verwandte Skills

- `develop-gc-method` -- GC-Methodenentwicklung
- `develop-hplc-method` -- HPLC-Methodenentwicklung
- `troubleshoot-separation` -- Trennprobleme diagnostizieren und beheben
