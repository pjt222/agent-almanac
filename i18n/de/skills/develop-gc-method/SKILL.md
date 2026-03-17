---
name: develop-gc-method
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Entwickle und optimiere gaschromatographische Methoden fuer flueichtige
  und halbflueichtige organische Verbindungen. Waehle stationaere Phasen,
  Trenntemperaturprogramme und Detektoren aus, optimiere Injektions-
  und Trennparameter und validiere Peakidentifizierung durch Retentionszeit
  und MS-Referenz. Verwende diesen Skill bei der Entwicklung einer neuen
  GC-Methode, Optimierung der Trennung bei Coelutionen oder Peakabfall,
  Methodentransfer zwischen GC-Systemen oder Planung einer GC-MS-Strategie.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: advanced
  language: natural
  tags: chromatography, gc, method-development, temperature-programming, detector
---

# GC-Methode entwickeln

Entwickle eine gaschromatographische Trennmethode durch systematische Auswahl der stationaeren Phase, Optimierung des Temperaturprogramms, Einstellung der Injektions- und Traegergasparameter sowie Validierung der Peaktrennung und -identifizierung.

## Wann verwenden

- Entwickeln einer neuen GC-Methode fuer flueichtige oder halbflueichtige Analyten
- Optimieren einer bestehenden Methode bei unbefriedigender Trennung oder langer Laufzeit
- Transfer einer Methode auf ein anderes GC-System oder andere Saeule
- Auswahl des geeigneten Detektors (FID, MS, ECD, NPD, FPD)
- Planung einer GC-MS-Trennstrategie fuer unbekannte Probengemische

## Eingaben

- **Erforderlich**: Analytenliste mit bekannter oder geschaetzter Fluechtigkeit (Siedepunkt oder logP)
- **Erforderlich**: Probenmatrix und Loesungsmittel
- **Optional**: Anforderungen an Nachweisgrenzen und Linearitaet
- **Optional**: Vorhandene Saeulen und Detektoren
- **Optional**: Referenz- oder Normmethoode (z.B. EPA-Methode, Pharmakopoe)

## Vorgehensweise

### Schritt 1: Analyten charakterisieren und stationaere Phase auswaehlen

Bestimme Analystenpolaaritaet und Siedepunktsbereich fuer die Saeulenwahl:

1. **Analytenpolaritaet abschaetzen**: Benutze logP-Werte oder Siedepunkte als Richtwerte.
2. **Stationaere Phasen auswaehlen** (Aehnlichkeitsprinzip: aehnliches loest aehnliches):
   - Apolare Analyten: 100% Polydimethylsiloxan (DB-1, HP-1, BP-1) oder 5% Phenyl-Polysiloxan (DB-5, HP-5)
   - Maessig polare Analyten: 35% Phenyl-Polysiloxan (DB-35, HP-35) oder Polyethylenglykol (Wax, DB-WAX)
   - Polare Analyten: Polyethylenglykol (FFAP, DB-FFAP) fuer Carbonsaeuren und Alkohole
   - Chirale Analyten: Cyclodextrin-basierte stationaere Phasen (beta-DEX, Lipodex)
3. **Saeulenabmessungen festlegen**:
   - Routineanalytik: 30 m x 0,25 mm x 0,25 microm (gutes Gleichgewicht Aufloesung/Zeit)
   - Schnellmethoden: 15 m oder kuerzere Saeulen mit engem Innendurchmesser
   - Hohe Aufloesung: 60 m-Sauelen oder geringere Filmdicke

```markdown
## Saeulenwahl
- Stationaere Phase: [Beschreibung]
- Polaaritaet (McReynolds-Konstanten): [Werte]
- Dimensionen: [Laenge] m x [ID] mm x [Filmdicke] microm
- Traegergasfluss: [mL/min] bei [Starttemperatur]
```

**Erwartet:** Eine begrundete Saeulenwahl mit Angabe der Polaaritaet und kommerziellen Bezeichnung.

**Bei Fehler:** Falls Analystenpolaaritaet unbekannt, beginne mit einer mittleren Polaaritaet (DB-5) als Universalphase und passe nach ersten Ergebnissen an.

### Schritt 2: Temperaturprogramm entwickeln

Entwickle ein Temperaturprogramm fuer optimale Trennung und kurze Laufzeit:

1. **Starttemperatur waehlen**: 10-20 degC unter dem Siedepunkt des leichtflueichtigsten Analyten; oder 40 degC fuer typische organische Verbindungen.
2. **Endtemperatur waehlen**: 20-50 degC ueber dem Siedepunkt des schwerstflueichtigsten Analyten; unter dem maximalen Betriebspunkt der stationaeren Phase.
3. **Heizrate optimieren**:
   - Schnell (20-30 degC/min): Kurze Laufzeit, moeglicherweise schlechtere Aufloesung
   - Moderat (10 degC/min): Ausgeglichenes Verhaeltnis
   - Langsam (2-5 degC/min): Bessere Aufloesung, laengere Laufzeit
4. **Isothermen einplanen**: Falls Peaks sehr unterschiedlich spaet eluieren, Haltezeit bei bestimmten Temperaturen einplanen.
5. **Spuelprogramm**: Endreinigungsschritt bei maximaler Betriebstemperatur fuer 5-10 Minuten.

```markdown
## Temperaturprogramm
| Stufe | Starttemperatur (degC) | Heizrate (degC/min) | Endtemperatur (degC) | Haltezeit (min) |
|-------|----------------------|--------------------|--------------------|----------------|
| 1 | [T_start] | - | [T_start] | [t_hold_1] |
| 2 | [T_start] | [Rate_1] | [T_2] | [t_hold_2] |
| 3 | [T_2] | [Rate_2] | [T_max] | [t_hold_3] |
```

**Erwartet:** Ein vollstaendiges Temperaturprogramm, das Aufloesung und Laufzeit optimal abwaegt.

**Bei Fehler:** Falls fruehe Peaks ungetrennt eluieren, verlaengere Haltezeit bei Starttemperatur. Falls spaete Peaks zu lange brauchen, erhoehe Heizrate im hoeheren Temperaturbereich.

### Schritt 3: Injektionsparameter optimieren

Waehle den Injektionsmodus und optimiere Parameter:

1. **Injektionsmodus**:
   - Split-Injektion: Fuer konzentrierte Proben; Split-Verhaeltnis 10:1 bis 100:1 einstellbar
   - Splitless-Injektion: Fuer verdueannte Proben und hohe Empfindlichkeit
   - On-column-Injektion: Fuer thermisch labile Verbindungen ohne Verdampfungsschritt
   - PTV (Programmable Temperature Vaporization): Flexibel, insbesondere fuer Headspace-GC
2. **Injektionsvolumen**: Typisch 1-2 microliter fuer fluessige Proben.
3. **Injektortemperatur**: 250-300 degC fuer flueichtige Verbindungen; hoeher fuer schwerstflueichtige; niedriger fuer thermisch labile Substanzen.
4. **Splitless-Zeit**: Typisch 0,5-1,5 min; dann Split oeffnen um Loesungsmittelspitze zu reduzieren.

**Erwartet:** Injektionsmodus und -parameter begruendet ausgewaehlt; Loesungsmittelpeak gut getrennt von den ersten Analytenpeaks.

**Bei Fehler:** Falls Peakform schlecht (breite Peaks), pruefe Liners und Dichtungen. Falls Loesungsmittel Analyten maskiert, verlaengere Splitless-Zeit oder erhoehe Starttemperatur.

### Schritt 4: Detektor auswaehlen und optimieren

Passe Detektionsparameter an Analyse und Analyt an:

1. **Flammenionisationsdetektor (FID)**: Universell fuer organische Verbindungen; linear ueber 7 Groessenordnungen; nicht sensitiv fuer Wasser, CO2, CO.
2. **Massenspektrometerdetektor (MS)**: Strukturinformation durch Fragmentierungsmuster; Bibliotheksidentifizierung; Selective Ion Monitoring (SIM) fuer Spurenanalyse.
3. **Elektroneneinfangdetektor (ECD)**: Sehr empfindlich fuer Halogene und Nitroverbindungen; ideal fuer Pestizidrueckstands- und PCB-Analytik.
4. **Stickstoff-Phosphor-Detektor (NPD)**: Selektiv fuer N und P; ideal fuer Pestizide und Amine.
5. **Flammphotometerdetektor (FPD)**: Fuer Schwefel und Phosphorverbindungen.

```markdown
## Detektorparameter
- Detektoretyp: [FID/MS/ECD/NPD/FPD]
- Temperatur: [degC]
- Spezifische Parameter: [Spannung/Gasfluesse/MS-Scan-Bereich]
```

**Erwartet:** Detektorwahl begruendet; Nachweisgrenzen abgeschaetzt oder gemessen.

**Bei Fehler:** Falls Empfindlichkeit ungenuegend, pruefe Detektorzustand (Leckagen, Kontamination), Injektionsparameter und Probenanreicherung.

### Schritt 5: Methode validieren und dokumentieren

Bestaetige Methodenguete anhand von Systemeignungsparametern:

1. **Retentionszeit-Reproduzierbarkeit**: RSD < 0,5% fuer qualitative Identifizierung.
2. **Aufloesung (Rs)**: Rs >= 1,5 fuer benachbarte Peaks (Basislinienseparation).
3. **Peaksymmetrie**: Tailing-Faktor zwischen 0,8 und 1,5.
4. **Linearitaet und Nachweisgrenzen**: Kalibrierkurven mit mindestens 5 Punkten; R2 > 0,999.
5. **Wiederfindung**: Falls Matrixeffekte erwartet, mit markierten Standards oder Standardaddition pruefen.

**Erwartet:** Validierungsprotokoll mit allen Systemeignungsparametern innerhalb der Spezifikation.

**Bei Fehler:** Falls Aufloesung zu gering, optimiere Temperaturprogramm, wechsle stationaere Phase oder erhoehe Saeulenlaenge. Falls Tailing auftritt, pruefe Saeulenkonditionierung und Liners.

## Validierung

- [ ] Stationaere Phase anhand Analystenpolaaritaet ausgewaehlt
- [ ] Temperaturprogramm optimiert (Heizrate, Starttemperatur, Endtemperatur)
- [ ] Injektionsparameter auf Probenkonzentration abgestimmt
- [ ] Detektor mit begruendetem Selektivitaets-Empfindlichkeits-Trade-off ausgewaehlt
- [ ] Rs >= 1,5 fuer alle kritischen Peakpaare
- [ ] Retentionszeit-Reproduzierbarkeit dokumentiert (RSD < 0,5%)

## Haeufige Stolperfallen

- **Falsche stationaere Phase**: Die stationaere Phase sollte chemisch aehnlich zu den Analyten sein; eine zu unpolare Phase fuer polare Analyten fuehrt zu schlechter Trennung und Peaktailing.
- **Zu hohe Starttemperatur**: Fruehe Peaks werden komprimiert oder gehen verloren; Starttemperatur unter dem Siedepunkt des leichtflueichtigsten Analyten waehlen.
- **Kontaminierter Liner**: Nicht-gereinigter oder falscher Liner fuehrt zu Peaktailing und Materialverlust; regelmaessig wechseln.
- **Matrixeffekte ignorieren**: Komplexe Probenmatrizes koennen Peakform und Retentionszeit beeinflussen; Matrixkalibrierung oder Standardaddition erwaegen.

## Verwandte Skills

- `develop-hplc-method` -- HPLC-Methoden fuer nicht-flueichtige Verbindungen
- `troubleshoot-separation` -- Diagnose und Behebung chromatographischer Probleme
- `validate-analytical-method` -- ICH-konforme Methodenvalidierung
