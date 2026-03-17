---
name: develop-hplc-method
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Entwickle und optimiere HPLC-Trennmethoden fuer polare, ionische und
  hochmolekulare Verbindungen. Waehle stationaere Phasen (Umkehrphase,
  Normalphase, Ionenaustausch, Groessenausschluss), Laufmittelsysteme,
  Gradientenprogramme und UV/MS-Detektion aus. Verwende diesen Skill beim
  Entwickeln einer neuen Methode fuer Wirkstoffe oder Biomolekuele, beim
  Optimieren von Trennselektivitaet, beim Umstellen auf UHPLC oder beim
  Transfer von HPLC auf SFC.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: advanced
  language: natural
  tags: chromatography, hplc, method-development, reversed-phase, gradient
---

# HPLC-Methode entwickeln

Entwickle eine HPLC-Trennmethode durch systematische Auswahl der stationaeren Phase und des Eluenten, Entwicklung eines Gradientenprogramms, Optimierung der Trennbedingungen und Validierung der Systemeignung.

## Wann verwenden

- Entwickeln einer neuen HPLC-Methode fuer polare, ionische oder biologische Verbindungen
- Optimieren einer bestehenden Methode fuer bessere Trennung oder Laufzeit
- Methodenentwicklung fuer Reinheitspruefung oder Stabilitaetsuntersuchungen nach ICH
- Umstellung von HPLC auf UHPLC fuer hoehere Effizienz
- Planung einer HPLC-MS-Kopplungsmethode

## Eingaben

- **Erforderlich**: Analytenliste mit chemischen Eigenschaften (pKa, logP, Molmasse)
- **Erforderlich**: Probenmatrix und ungefaehre Konzentrationsbereiche
- **Optional**: Anforderungen an Nachweisgrenzen und Selektivitaet
- **Optional**: Verfuegbare stationaere Phasen und Eluenten
- **Optional**: Referenzmethode oder regulatorische Anforderungen

## Vorgehensweise

### Schritt 1: Trennmodus auswaehlen

Waehle den geeigneten chromatographischen Modus basierend auf Analyteneigenschaften:

1. **Umkehrphasenchromatographie (RPLC)**: Fuer neutrale bis maessig polare Verbindungen (logP > -1); C18 oder C8 als stationaere Phase mit wasserorganischem Eluenten.
2. **Normalphase (NP)**: Fuer unpolare oder geometrische Isomere auf Kieselgel mit organischen Eluenten; selten, aber nuetzlich fuer Lipide und Vitamine.
3. **Ionenaustauschchromatographie (IEC)**: Fuer Aminosaeuren, Nukleotide, anorganische Ionen; saure oder basische stationaere Phase.
4. **Groessenausschlusschromatographie (SEC/GPC)**: Fuer Polymere und Proteine; Trennung nach Molmasse.
5. **HILIC (Hydrophilic Interaction Chromatography)**: Fuer sehr hydrophile, polare Verbindungen (logP < -2); Gegenteil von RPLC.
6. **Ionenpaar-HPLC**: Fuer ionische Verbindungen, die per RPLC nicht retendiert werden; Ionenpaarreagenz (z.B. TBAHS) im Eluenten.

```markdown
## Trennmodus
- Ausgewaehlter Modus: [RPLC/NP/IEC/SEC/HILIC/Ionenpaar]
- Begruendung: [Analystenpolaaritaet, pKa, logP-Werte]
- Stationaere Phase: [Bezeichnung, Partikelgroesse, Dimensionen]
```

**Erwartet:** Begruendeter Trennmodus mit geeigneter stationaerer Phase und Spezifikation.

**Bei Fehler:** Falls Analyt sowohl hydrophil als auch ionisch ist, pruefe HILIC oder Ionenpaar-Chromatographie. Falls unklar, mache Scouting mit Umkehrphase und modifiziertem pH.

### Schritt 2: Eluenten und pH optimieren

Entwickle das optimale Eluenten-System:

1. **Umkehrphase Eluenten**:
   - Waessrige Komponente: Wasser oder Puffer (10-100 mM Ammoniumacetat, Ammoniumformiat, Phosphatpuffer)
   - Organische Komponente: Methanol (protisch, geringere Trennkraft), Acetonitril (aprotisch, hoehere Trennkraft), Tetrahydrofuran (stark, sparsam verwenden)
   - pH-Einfluss: pH < pKa-2 fuer saure Analyten (protoniert, besser retendiert auf RPLC); pH > pKa+2 fuer basische Analyten
2. **pH-Optimierung**:
   - Fuer Sauren: niederer pH (2-3) unterdruckt Ionisierung, verbessert RPLC-Retention
   - Fuer Basen: hoeherer pH (7-9) unterdruckt Ionisierung oder Verwendung von Ammoniak/TEA
   - Kompatibilitaet mit stationaerer Phase beachten (C18 stabil pH 2-9)
3. **MS-Kompatibilitaet**: Falls ESI-MS Detektion, nicht-flueichtige Puffer vermeiden; Ammoniumacetat oder Ammoniumformiat bevorzugen.

```markdown
## Eluenten-System
- Eluent A: [Zusammensetzung, pH]
- Eluent B: [Zusammensetzung]
- pH-Begrandung: [Analyteneigenschaften]
- Pufferkonzentration: [mM]
```

**Erwartet:** Eluenten-System das Analytenretention und -trennung sicherstellt und mit Detektion kompatibel ist.

**Bei Fehler:** Falls Analyten nicht retendiert werden, erhoehere organische Modifikatoren oder prueffe pH-Einfluss auf Ionisierungsgrad. Falls Peaktailing bei basischen Verbindungen, erhoehe pH oder verwende Additiv (TEA, TFA).

### Schritt 3: Gradientenprogramm entwickeln

Entwerfe einen Gradienten fuer optimale Trennung und kurze Laufzeit:

1. **Scouting-Gradient**: Beginn mit breitem Gradienten (z.B. 5-95% B in 20 min) fuer erste Uebersicht aller Peaks.
2. **Gradienten-Steigung**: Typisch 1-5% B/min; flacher Gradient fuer bessere Aufloesung, steiler fuer kuerzere Laufzeit.
3. **Isokratische Bereiche**: Falls Peaks in bestimmten Bereichen schlecht getrennt sind, isokratischen Abschnitt einplanen.
4. **Reequilibrierungszeit**: Mindestens 5-10 Saeulenlvolumen nach Ende des Gradienten.
5. **Backpressure beachten**: Viskositaetsmaximum liegt bei ~50:50 Wasser/Methanol; ggf. Fluss reduzieren.

```markdown
## Gradientenprogramm
| Zeit (min) | %A | %B | Fluss (mL/min) |
|-----------|----|----|----------------|
| 0 | [%] | [%] | [wert] |
| [Zeit] | [%] | [%] | [wert] |
| [Zeit] | [%] | [%] | [wert] |
```

**Erwartet:** Gradientenprogramm mit allen Peaks innerhalb akzeptabler Laufzeit (< 30 min fuer Routinemethode).

**Bei Fehler:** Falls fruehe Peaks ueberlappen, reduziere den Anteil an organischem Loesungsmittel am Beginn. Falls spaete Peaks zu lang brauchen, erhoehe Gradienten-Steigung im mittleren Bereich.

### Schritt 4: Detektionsparameter einstellen

Waehle und optimiere die Detektionswellenlaenge oder MS-Parameter:

1. **UV-Detektion**:
   - Bestimme optimale Wellenlaenge aus UV-Spektrum des Analyten
   - 254 nm fuer Aromaten; 280 nm fuer aromatische Aminosaeuren; 210-220 nm fuer Verbindungen ohne starkes Chromophor
   - DAD (Dioden-Array-Detektor) fuer gleichzeitige Mehrwellenlangendetektion
2. **MS-Detektion (ESI)**:
   - Positive Mode fuer Ammonium-Addukte, Basen, Proteine
   - Negative Mode fuer Carbonsaeuren, Phosphate, Sulfonate
   - SRM (Selected Reaction Monitoring) fuer quantitative Bioanalytik (hohe Selektivitaet)
3. **ELSD/CAD**: Fuer Verbindungen ohne UV-Chromophor (Zucker, Lipide, Tenside).
4. **RI (Brechungsindex)**: Fuer Polymere und Zucker; nicht gradientenkompatibel.

**Erwartet:** Detektionswellenlaenge oder MS-Parameter optimiert; Empfindlichkeit und Linearitaet ausreichend.

**Bei Fehler:** Falls Empfindlichkeit ungenuegend, wechsle zu sensitiverer Wellenlaenge (kuerzer fuer UV) oder MS-Detektion.

### Schritt 5: Systemeignung und Methodenvalidierung

Pruefe Methode auf Eignung und dokumentiere Systemseignungsparameter:

1. **Aufloesung (Rs)**: Rs >= 1,5 fuer kritis-che Peakpaare; Rs >= 2,0 fuer regulatorische Methoden.
2. **Tailing-Faktor**: Asymmetriefaktor A zwischen 0,8 und 1,5.
3. **Bodenzahl (N)**: N >= 2000 fuer 150 mm Saeule; hoeher fuer laengere Sauelen.
4. **Peakkapazitaet**: Fuer Gradienten; Anzahl der trennbaren Peaks.
5. **Retentionszeit-Reproduzierbarkeit**: RSD < 1% fuer qualitative Zuordnung; < 0,5% fuer regulatorische Methoden.

**Erwartet:** Alle Systemeignungsparameter innerhalb der Spezifikation; Methode fuer geplanten Einsatz dokumentiert.

**Bei Fehler:** Falls Aufloesung zu gering, optimiere Gradient oder wechsle stationaere Phase. Falls Tailing bei basischen Verbindungen auftritt, optimiere pH oder verwende endgekapte C18-Phase.

## Validierung

- [ ] Trennmodus basierend auf Analyteneigenschaften ausgewaehlt
- [ ] Eluenten-System mit korrektem pH entwickelt
- [ ] Gradientenprogramm fuer alle Analyten optimiert
- [ ] Detektion auf Analytenstruktur abgestimmt
- [ ] Systemeignungsparameter dokumentiert (Rs, N, Tailing)
- [ ] Methode reproduzierbar (RSD Retentionszeit < 1%)

## Haeufige Stolperfallen

- **Pufferinkompatibilitaet mit MS**: Phosphatpuffer blockiert ESI-MS; immer flueichtige Puffer verwenden.
- **pH-Ignoranz bei Ionisation**: Basische oder saure Analyten zeigen starkes pH-abhaengiges Elutionsverhalten; pH-Einfluss systematisch erkunden.
- **Unzureichende Reequilibrierungszeit**: Unvollstaendige Reequilibrierung fuehrt zu Retentionszeitverschiebungen; mindestens 5 Saulenvolumina einplanen.
- **Falscher Saeulenflusswert bei UHPLC**: UHPLC-Saeulen erfordern hoehere Druecke; Systemdruck pruefen und ggf. Fluss anpassen.

## Verwandte Skills

- `develop-gc-method` -- GC-Methoden fuer flueichtige Verbindungen
- `troubleshoot-separation` -- Chromatographische Probleme diagnostizieren
- `validate-analytical-method` -- ICH-konforme Validierung durchfuehren
