---
name: interpret-mass-spectrum
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretiere Elektronenstoss- und Elektrospray-Massenspektren zur
  Bestimmung von Molekularmasse, Molekuelformel und Strukturfragmenten.
  Verwende diesen Skill beim Bestimmen des Molekuelionenpeaks und der
  Molekuelformel aus Hochaufloesungs-MS, beim Erklaeren charakteristischer
  Fragmentierungsmuster, beim Identifizieren von Isotopenmustern fuer
  Halogene und Schwefel oder beim Kombinieren von MS-Daten mit anderen
  spektroskopischen Methoden zur Strukturaufklaerung.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: advanced
  language: natural
  tags: spectroscopy, mass-spectrometry, fragmentation, molecular-ion, isotope-pattern
---

# Massenspektrum interpretieren

Interpretiere Massenspektren systematisch durch Identifizierung des Molekuelionensignals, Analyse des Isotopenmusters, Bestimmung der Molekuelformel aus Hochaufloesungsdaten und Zuordnung charakteristischer Fragmentionen zur Strukturaufklaerung.

## Wann verwenden

- Bestimmen des Molekulargewichts und der Molekuelformel einer unbekannten Verbindung
- Erklaeren von Fragmentierungsmustern zur Ableitung struktureller Merkmale
- Identifizieren von Halogen- oder Schwefelgehalt aus Isotopenmustern
- Bestaetigen einer vorgeschlagenen Struktur durch Vergleich mit berechnetem Spektrum
- Kombinieren von MS-Daten mit IR- und NMR-Evidenz fuer vollstaendige Strukturaufklaerung

## Eingaben

- **Erforderlich**: Massenspektrum mit m/z-Werten und relativen Intensitaeten
- **Erforderlich**: Ionisierungsmethode (EI, ESI, APCI, MALDI)
- **Optional**: Hochaufloesungs-MS-Daten (HRMS) fuer genaue Massenbestimmung
- **Optional**: MS/MS-Daten fuer strukturelle Fragmentierungsanalyse
- **Optional**: Vorgeschlagene Struktur zur Bestaetigung

## Vorgehensweise

### Schritt 1: Molekuelionenpeak identifizieren

Lokalisiere den Molekuelionenpeak (M+) oder die entsprechende Ionenform:

1. **EI-Massenspektrometrie**: M+ ist der Peak hoechster Masse (ausser Isotopenpeaks). Pruefe ob M+ sichtbar ist; manche Verbindungen zeigen nur M-1 oder kein M+.
2. **ESI-Massenspektrometrie**:
   - Positive Mode: [M+H]+, [M+Na]+, [M+K]+, Addukte oder mehrfach geladene Ionen [M+nH]n+
   - Negative Mode: [M-H]-, [M+Cl]-, Addukte
3. **Basiswissen**: Der schwerste Nicht-Isotopen-Peak ist der Kandidat fuer M+ (EI) oder entsprechendes Addukt (ESI).
4. **Pruefen auf charakteristische Verluste** vom hoechsten m/z-Peak:
   - M-15: Verlust von CH3
   - M-18: Verlust von H2O
   - M-28: Verlust von CO oder C2H4
   - M-35/M-37: Verlust von Cl

```markdown
## Molekuelion
- Ionisierungsmethode: [EI/ESI/andere]
- Hauptionstyp: [M+/[M+H]+/[M+Na]+]
- m/z des Molekuelions: [wert]
- Berechnetes Molekulargewicht: [wert]
```

**Erwartet:** Eindeutig identifizierter Molekuelionenpeak oder entsprechendes Adduktion mit zugeordnetem Molekulargewicht.

**Bei Fehler:** Falls kein M+ sichtbar (haeufig bei labilen EI-Verbindungen), pruefe auf chemische Ionisierung (CI) oder Weichionisierungsmethoden. Bei ESI pruefe verschiedene Addukte.

### Schritt 2: Isotopenverteilung auswerten

Das Isotopenmuster liefert wertvolle Information zur Elementzusammensetzung:

1. **Reine C/H/N/O-Verbindungen**: M und M+1 und M+2 gemaess binomialer Verteilung; M+1 ca. 1,1% pro Kohlenstoffatom.
2. **Chlor-Isotopenmuster**:
   - 1 Cl: M:M+2 = 3:1
   - 2 Cl: M:M+2:M+4 = 9:6:1
3. **Brom-Isotopenmuster**:
   - 1 Br: M:M+2 = 1:1
   - 2 Br: M:M+2:M+4 = 1:2:1
4. **Schwefel**: M+2 um 4,4% erhoeht pro S-Atom (34S).
5. **Stickstoffregel**: Verbindungen mit ungerader Stickstoffanzahl haben ungerade Molekularmasse (EI, M+).

```markdown
## Isotopenanalyse
| Ion | m/z | Relative Intensitaet | Interpretation |
|-----|-----|---------------------|----------------|
| M   | [wert] | 100% | Molekuelion |
| M+1 | [wert] | [%] | 13C-Anteil (~1,1% pro C) |
| M+2 | [wert] | [%] | Halogen/S-Indikator |
```

**Erwartet:** Ermittlung der Anzahl von Halogenen oder Schwefelheteroatomen aus Isotopenverhaeltnis.

**Bei Fehler:** Falls Isotopenmuster nicht dem erwarteten Muster entspricht, pruefe auf Verunreinigungen oder Addukte.

### Schritt 3: Molekuelformel aus Hochaufloesungs-MS bestimmen

Bei HRMS-Daten berechne die exakte Elementarzusammensetzung:

1. **Exakte Masse berechnen**: Nutze Massen der haeufigsten Isotope (1H = 1,007825, 12C = 12,000000, 14N = 14,003074, 16O = 15,994915).
2. **Datenbankabfrage**: Tools wie ChemCalc, Xcalibur oder MZmine vergleichen gemessene exakte Masse mit berechneten Formeln.
3. **Einschraenkungen anwenden**: Isotopenverteilung, Stickstoffregel, DoU muessen mit der Kandidatenformel konsistent sein.
4. **Toleranz**: Typisch 5 ppm fuer Hochaufloesungsmessungen (Orbitrap, Q-TOF).

**Erwartet:** Eindeutige Molekuelformel oder kurze Liste von Kandidatenformeln mit dem wahrscheinlichsten Treffer.

**Bei Fehler:** Falls Massengenauigkeit unter 5 ppm, pruefe Kalibrierung des Instruments. Falls viele Kandidatenformeln verbleiben, nutze Isotopenmuster oder bekannte Atombeschraenkungen zur Eingrenzung.

### Schritt 4: Fragmentierungsmuster interpretieren

Erklaere die Hauptfragmentionen strukturell:

1. **Alpha-Spaltung**: Bindungsbruch neben Heteroatom oder Doppelbindung; haeufig bei Carbonylverbindungen und Aminen.
2. **McLafferty-Umlagerung**: Gamma-Wasserstoffuebertragung auf Carbonyl; ergibt geradzahligen m/z-Wert.
3. **Benzylspaltung**: Stabilisiertes Benzyl- oder Tropyliumkation (m/z 91) bei Alkylaromaten.
4. **Retro-Diels-Alder**: Cyclische Verbindungen, Verlust von 4C-Dien- oder 2C-Dienophileinheit.
5. **Charakteristische Verluste** vom M+-Peak:
   - -15 (CH3), -17 (OH), -18 (H2O), -28 (CO), -32 (CH3OH), -35/37 (Cl)

```markdown
## Fragmentierungsinterpretation
| m/z | Relativer Anteil | Strukturzuweisung | Verlust von M+ |
|-----|-----------------|-------------------|----------------|
| [wert] | [%] | [Fragment] | [neutraler Verlust] |
```

**Erwartet:** Erklaerung der wichtigsten Fragmente und Rekonstruktion plausibler Struktureinheiten.

**Bei Fehler:** Falls Fragmente nicht erklaerbar, pruefe auf Verunreinigungen oder Umlagerungsreaktionen im Ionenstrahl. MS/MS-Experimente ermitteln praezise Vorlaeufer-Produkt-Beziehungen.

### Schritt 5: Strukturvorschlag ableiten und verifizieren

Kombiniere alle MS-Informationen mit anderen Spektraldaten:

1. **Tentative Struktur vorschlagen** basierend auf Molekuelformel, DoU, Isotopenverteilung und Fragmentierungsmustern.
2. **Konsistenzpruefung mit NMR und IR**: Stimmt die aus MS abgeleitete Struktur mit Signalanzahl, Verschiebungen und funktionellen Gruppen ueberein?
3. **Spektrenbibliothek abfragen**: NIST-Datenbank, SDBS oder ChemSpider fuer EI-Spektrenvergleich.
4. **Berechnung des theoretischen Spektrums** mit Softwaretools wie ACD/MS Manager oder mzCloud.

**Erwartet:** Bestaetigung oder Revision der vorgeschlagenen Struktur mit expliziter Erklaerung, wie alle MS-Daten zur Struktur passen.

**Bei Fehler:** Falls MS-Daten und NMR widersprechen, pruefe auf Isomere oder Gemisch mehrerer Verbindungen. Trenne gegebenenfalls mit LC-MS.

## Validierung

- [ ] Molekuelionenpeak oder Addukt korrekt identifiziert
- [ ] Stickstoffregel angewendet (gerade/ungerade Masse)
- [ ] Isotopenmuster fuer Halogene und Schwefel ausgewertet
- [ ] Bei HRMS: Molekuelformel aus exakter Masse bestimmt
- [ ] Hauptfragmente erklaert (mindestens 80% der Gesamtionenstromintensitaet)
- [ ] Vorgeschlagene Struktur mit Bibliotheksspektrum verglichen

## Haeufige Stolperfallen

- **Verwechslung M+ mit Fragmentionen**: Der hoechste m/z-Peak muss nicht M+ sein; pruefe auf typische Verluste.
- **ESI-Addukte vergessen**: Na- und K-Addukte liegen 22 und 38 Da hoeher als [M+H]+; unerkannte Addukte fuehren zu falschen Molekulargewichten.
- **Ignorieren der Stickstoffregel**: Verbindungen ohne N oder mit geradzahliger N-Zahl haben geradzahliges M+; ungerade M+ bei EI deutet auf ungerade Anzahl N-Atome.
- **McLafferty-Umlagerung uebersehen**: Wird haeufig als zunaechst unerklaerender geradzahliger Peak übersehen.

## Verwandte Skills

- `interpret-nmr-spectrum` -- ergaenzende Strukturinformation aus NMR
- `interpret-ir-spectrum` -- funktionelle Gruppen aus IR-Daten bestaetigen
- `plan-spectroscopic-analysis` -- systematische Messplanung vor der Analyse
