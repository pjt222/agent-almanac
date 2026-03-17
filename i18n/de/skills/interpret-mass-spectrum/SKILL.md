---
name: interpret-mass-spectrum
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Massenspektren systematisch interpretieren um Summenformel zu bestimmen,
  Fragmentierungswege zu identifizieren und Molekuelstrukturen vorzuschlagen.
  Behandelt Ionisierungsmethoden-Bewertung, Molekuelion-Identifikation,
  Isotopenmuster-Analyse, haeufige Fragmentierungsverluste und
  Reinheitsbewertung.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: advanced
  language: natural
  tags: spectroscopy, mass-spectrometry, fragmentation, molecular-ion, isotope
---

# Massenspektrum interpretieren

Massenspektren aus jeder gaengigen Ionisierungsmethode analysieren um das Molekuelion, die Summenformel, Fragmentierungswege und Strukturmerkmale des Analyten zu bestimmen.

## Wann verwenden

- Bestimmung des Molekulargewichts und der Summenformel einer unbekannten Verbindung
- Bestaetigung der Identitaet eines Syntheseprodukts durch Molekuelion und Fragmentierung
- Identifikation von Verunreinigungen oder Abbauprodukten in einer Probe
- Vorschlag von Strukturmerkmalen aus charakteristischen Fragmentierungsverlusten
- Analyse von Isotopenmustern zum Nachweis von Halogenen, Schwefel oder Metallen

## Eingaben

- **Erforderlich**: Massenspektrumdaten (m/z-Werte mit relativen Intensitaeten, mindestens das Vollscan-Spektrum)
- **Erforderlich**: Verwendete Ionisierungsmethode (EI, ESI, MALDI, CI, APCI, APPI)
- **Optional**: Hochaufloesende Massendaten (exakte Masse, gemessen vs. berechnet)
- **Optional**: Summenformel aus anderen Quellen (Elementaranalyse, NMR)
- **Optional**: Tandem-MS/MS-Daten (Fragmentierung ausgewaehlter Vorlaeuferionen)
- **Optional**: Chromatographischer Kontext (LC-MS- oder GC-MS-Retentionszeit, Reinheit)

## Vorgehensweise

### Schritt 1: Ionisierungsmethode identifizieren und erwartete Ionentypen bestimmen

Bestimmen welche Spezies das Spektrum enthaelt bevor Peaks zugeordnet werden:

1. **Die Ionisierungsmethode klassifizieren**:

| Methode | Energie | Primaerion | Fragmentierung | Typische Anwendung |
|---------|---------|------------|----------------|--------------------|
| EI (70 eV) | Hart | M+. (Radikalkation) | Umfangreich | Kleine fluechtige Molekuele, GC-MS |
| CI | Weich | [M+H]+, [M+NH4]+ | Minimal | Molekulargewichtsbestaetigung |
| ESI | Weich | [M+H]+, [M+Na]+, [M-H]- | Minimal | Polare Molekuele, Biomolekuele, LC-MS |
| MALDI | Weich | [M+H]+, [M+Na]+, [M+K]+ | Minimal | Grosse Molekuele, Polymere, Proteine |
| APCI | Weich | [M+H]+, [M-H]- | Etwas | Mittlere Polaritaet, LC-MS |

2. **Polaritaetsmodus beachten**: Der Positivmodus erzeugt Kationen; der Negativmodus erzeugt Anionen. ESI verwendet haeufig beide.
3. **Auf Addukte und Cluster pruefen**: Weiche Ionisierung erzeugt oft [M+Na]+ (M+23), [M+K]+ (M+39), [2M+H]+ und [2M+Na]+ zusaetzlich zu [M+H]+. Diese identifizieren bevor das Molekuelion zugeordnet wird.
4. **Mehrfach geladene Ionen identifizieren**: Bei ESI erscheinen mehrfach geladene Ionen bei m/z = (M + nH) / n. Nach Peaks mit gebrochenen m/z-Abstaenden suchen (z.B. 0,5 Da Abstand zeigt z=2 an).

**Erwartet:** Ionisierungsmethode dokumentiert, erwartete Ionentypen aufgelistet und Addukte/Cluster identifiziert, sodass das wahre Molekuelion bestimmt werden kann.

**Bei Fehler:** Wenn die Ionisierungsmethode unbekannt ist, das Spektrum auf Hinweise untersuchen: umfangreiche Fragmentierung deutet auf EI, Adduktmuster auf ESI und Matrixpeaks auf MALDI hin. Falls verfuegbar das Geraeteprotokoll konsultieren.

### Schritt 2: Molekuelion und Summenformel bestimmen

Den Molekuelionenpeak identifizieren und die Summenformel ableiten:

1. **Das Molekuelion (M) lokalisieren**: Bei EI ist M+. der Peak mit dem hoechsten m/z und einem chemisch sinnvollen Isotopenmuster (er kann bei labilen Verbindungen schwach oder fehlend sein). Bei weicher Ionisierung [M+H]+ oder [M+Na]+ identifizieren und das Addukt subtrahieren um M zu erhalten.
2. **Die Stickstoffregel anwenden**: Ein ungerades Molekulargewicht zeigt eine ungerade Anzahl Stickstoffatome an. Ein gerades Molekulargewicht zeigt null oder eine gerade Anzahl Stickstoffatome an.
3. **Doppelbindungsaequivalente (DBE) berechnen**: DBE = (2C + 2 + N - H - X) / 2, wobei X = Halogene. Jeder Ring oder jede Pi-Bindung traegt ein DBE bei. Benzol = 4 DBE, Carbonyl = 1 DBE.
4. **Hochaufloesende Daten verwenden**: Wenn die exakte Masse verfuegbar ist, die Summenformel ueber den Massendefekt berechnen. Die gemessene Masse mit allen Kandidatenformeln innerhalb des Massengenauigkeitsfensters vergleichen (typischerweise < 5 ppm bei modernen Instrumenten).
5. **Mit dem Isotopenmuster abgleichen**: Das beobachtete Isotopenmuster muss zur vorgeschlagenen Summenformel passen (siehe Schritt 3).

**Erwartet:** Molekuelion identifiziert, Molekulargewicht bestimmt, Stickstoffregel angewandt und eine Summenformel vorgeschlagen (bestaetigt durch HRMS falls verfuegbar).

**Bei Fehler:** Wenn kein Molekuelion im EI sichtbar ist (haeufig bei thermisch labilen oder stark verzweigten Verbindungen), eine weichere Ionisierungsmethode versuchen. Wenn das Molekuelion mehrdeutig ist, auf den Verlust haeufiger kleiner Fragmente vom Peak mit dem hoechsten m/z pruefen (z.B. M-1, M-15, M-18 koennen helfen M zu identifizieren).

### Schritt 3: Isotopenmuster analysieren

Isotopensignaturen verwenden um bestimmte Elemente nachzuweisen:

1. **Monoisotopische Elemente**: H, C, N, O, F, P, I haben charakteristische natuerliche Haeufigkeitsmuster. Fuer Molekuele die nur C, H, N, O enthalten betraegt der M+1-Peak etwa 1,1% pro Kohlenstoff.
2. **Halogenmuster**:

| Element | Isotope | M : M+2 Verhaeltnis | Visuelles Muster |
|---------|---------|----------------------|------------------|
| 35Cl / 37Cl | 35, 37 | 3 : 1 | Dublett, 2 Da Abstand |
| 79Br / 81Br | 79, 81 | 1 : 1 | Gleiches Dublett, 2 Da Abstand |
| 2 Cl | -- | 9 : 6 : 1 | Triplett |
| 2 Br | -- | 1 : 2 : 1 | Triplett |
| 1 Cl + 1 Br | -- | 3 : 4 : 1 | Charakteristisches Quartett-aehnliches Muster |

3. **Schwefeldetektion**: 34S traegt 4,4% bei M+2 bei. Ein M+2-Peak von ungefaehr 4--5% relativ zu M (nach Korrektur fuer den Beitrag von 13C2) deutet auf ein Schwefelatom hin.
4. **Siliziumdetektion**: 29Si (5,1%) und 30Si (3,4%) erzeugen charakteristische M+1- und M+2-Beitraege.
5. **Mit berechneten Mustern vergleichen**: Die vorgeschlagene Summenformel verwenden um das theoretische Isotopenmuster zu berechnen. Mit dem beobachteten Muster ueberlagern um die Formel zu bestaetigen oder zu widerlegen.

**Erwartet:** Isotopenmuster analysiert, An- oder Abwesenheit von Cl, Br, S, Si bestimmt und Muster konsistent mit der vorgeschlagenen Summenformel.

**Bei Fehler:** Wenn die Isotopenaufloesung ungenuegend ist (niederauflosendes Instrument), koennte das M+2-Muster nicht aufloesbar sein. Die Einschraenkung vermerken und sich fuer die Elementzusammensetzung auf exakte Masse und andere spektroskopische Daten stuetzen.

### Schritt 4: Fragmentierungsverluste und Schluesselfragement-Ionen identifizieren

Die Fragmentierungswege kartieren um Strukturinformation zu extrahieren:

1. **Hauptfragmente katalogisieren**: Alle Peaks ueber 5--10% relativer Intensitaet mit ihren m/z-Werten auflisten.
2. **Neutralverluste vom Molekuelion berechnen**:

| Verlust (Da) | Verlorenes Neutral | Strukturelle Implikation |
|--------------|-------------------|--------------------------|
| 1 | H. | Labiler Wasserstoff |
| 15 | CH3. | Methylgruppe |
| 17 | OH. | Hydroxyl |
| 18 | H2O | Alkohol, Carbonsaeure |
| 27 | HCN | Stickstoffheterozyklus, Amin |
| 28 | CO oder C2H4 | Carbonyl oder Ethyl |
| 29 | CHO. oder C2H5. | Aldehyd oder Ethyl |
| 31 | OCH3. oder CH2OH. | Methoxy oder Hydroxymethyl |
| 32 | CH3OH | Methylester |
| 35/36 | Cl./HCl | Chlorierte Verbindung |
| 44 | CO2 | Carbonsaeure, Ester |
| 45 | OC2H5. | Ethoxy |
| 46 | NO2. | Nitroverbindung |

3. **Charakteristische Fragment-Ionen identifizieren**:

| m/z | Ion | Herkunft |
|-----|-----|----------|
| 77 | C6H5+ | Phenylkation |
| 91 | C7H7+ | Tropylium (Benzyl-Umlagerung) |
| 105 | C6H5CO+ | Benzoylkation |
| 43 | CH3CO+ oder C3H7+ | Acetyl oder Propyl |
| 57 | C4H9+ oder C3H5O+ | tert-Butyl oder Acrolein |
| 149 | Phthalat-Fragment | Weichmacher-Kontaminant |

4. **Fragmentierungswege kartieren**: Fragment-Ionen durch aufeinanderfolgende Verluste verbinden um einen Fragmentierungsbaum von M hinunter zu niedrigmassigen Fragmenten aufzubauen.
5. **Umlagerungsionen identifizieren**: Die McLafferty-Umlagerung (gamma-Wasserstoff-Transfer mit beta-Spaltung) erzeugt Ionen mit geradem Elektronenpaar aus carbonylhaltigen Verbindungen. Retro-Diels-Alder-Fragmentierung ist charakteristisch fuer Cyclohexen-Systeme.

**Erwartet:** Alle Hauptfragement-Ionen zugeordnet, Neutralverluste berechnet und mit Strukturmerkmalen korreliert, Fragmentierungsbaum konstruiert.

**Bei Fehler:** Wenn Fragmente nicht einfachen Verlusten vom Molekuelion entsprechen, Umlagerungsprozesse in Betracht ziehen. Nicht zugeordnete Fragmente koennen auf unerwartete funktionelle Gruppen, Verunreinigungen oder Matrix-/Hintergrundpeaks hinweisen.

### Schritt 5: Reinheit bewerten und Struktur vorschlagen

Das Gesamtspektrum auf Reinheitsindikatoren evaluieren und einen Strukturvorschlag zusammenstellen:

1. **Reinheitspruefung**: Bei GC-MS oder LC-MS das Chromatogramm auf zusaetzliche Peaks untersuchen. Bei Direktinfusions-MS nach unerwarteten Ionen suchen die keine Fragmente oder Addukte des Hauptanalyten sind.
2. **Hintergrund- und Kontaminantenpeaks**: Haeufige Kontaminanten sind Phthalatweichmacher (m/z 149, 167, 279), Saeulenbluten (Siloxane bei m/z 207, 281, 355, 429 im GC-MS) und Loesungsmittelcluster.
3. **Strukturvorschlag**: Summenformel (Schritt 2), Isotopenmuster (Schritt 3) und Fragmentierung (Schritt 4) kombinieren um eine Struktur oder eine Reihe von Kandidatenstrukturen vorzuschlagen.
4. **Kandidaten rangieren**: Den Fragmentierungsbaum verwenden um Strukturkandidaten zu rangieren. Die beste Struktur erklaert die meisten Fragment-Ionen mit den wenigsten Ad-hoc-Annahmen.
5. **Kreuzvalidieren**: Die vorgeschlagene Struktur mit Daten aus anderen Techniken (NMR, IR, UV-Vis) vergleichen. Das Massenspektrum allein liefert selten eine eindeutige Struktur fuer neuartige Verbindungen.

**Erwartet:** Reinheit bewertet, Kontaminanten identifiziert falls vorhanden, und ein Strukturvorschlag (oder eine gerankte Kandidatenliste) konsistent mit allen MS-Daten und kreuzvalidiert wo moeglich.

**Bei Fehler:** Wenn das Spektrum mehrere Komponenten zu enthalten scheint und keine chromatographische Trennung verwendet wurde, das Gemisch kennzeichnen und LC-MS- oder GC-MS-Reanalyse empfehlen. Wenn kein zufriedenstellender Strukturvorschlag entsteht, identifizieren welche zusaetzlichen Daten (HRMS, MS/MS, NMR) die Mehrdeutigkeit aufloesen wuerden.

## Validierung

- [ ] Ionisierungsmethode identifiziert und erwartete Ionentypen dokumentiert
- [ ] Molekuelion lokalisiert und von Addukten, Fragmenten und Clustern unterschieden
- [ ] Stickstoffregel angewandt und konsistent mit vorgeschlagener Formel
- [ ] Doppelbindungsaequivalente berechnet und in der Struktur beruecksichtigt
- [ ] Isotopenmuster stimmt mit vorgeschlagener Summenformel ueberein
- [ ] Hauptfragement-Ionen mit Neutralverlusten und struktureller Begruendung zugeordnet
- [ ] Fragmentierungsbaum vom Molekuelion zu niedrigmassigen Fragmenten konstruiert
- [ ] Haeufige Kontaminanten- und Hintergrundpeaks identifiziert und ausgeschlossen
- [ ] Strukturvorschlag mit anderen spektroskopischen Daten kreuzvalidiert

## Haeufige Stolperfallen

- **Das Molekuelion falsch identifizieren**: Bei EI ist der Basispeak oft ein Fragment, nicht das Molekuelion. Das Molekuelion ist der Peak mit dem hoechsten m/z und einem chemisch sinnvollen Isotopenmuster. Addukt-Ionen im ESI ([M+Na]+, [2M+H]+) koennen ebenfalls mit dem Molekuelion verwechselt werden.
- **Die Stickstoffregel ignorieren**: Ein ungerades Molekulargewicht erfordert eine ungerade Anzahl Stickstoffatome. Das zu vergessen fuehrt zu unmoeglichen Summenformeln.
- **Isobare Verluste verwechseln**: Ein Verlust von 28 Da koennte CO oder C2H4 sein; ein Verlust von 29 koennte CHO oder C2H5 sein. Hochaufloesende MS oder zusaetzliche Fragmentierungsdaten werden benoetigt um isobare Verluste zu unterscheiden.
- **Mehrfach geladene Ionen uebersehen**: Bei ESI erscheinen zweifach oder dreifach geladene Ionen bei der Haelfte bzw. einem Drittel des erwarteten m/z. Auf nichtganzzahlige Abstaende zwischen Isotopenpeaks als Diagnostik fuer Mehrfachladung achten.
- **Niedrigintensitaetspeaks ueberinterpretieren**: Peaks unter 1--2% relativer Intensitaet koennen Rauschen, Isotopenbeitraege oder geringfuegige Kontaminanten sein statt aussagekraeftiger Fragmente.
- **Reine Probe voraussetzen**: Viele reale Spektren sind Gemische. Immer die chromatographische Reinheit pruefen und nach Ionen suchen die nicht zur vorgeschlagenen Struktur passen.

## Verwandte Skills

- `interpret-nmr-spectrum` -- Konnektivitaet und Wasserstoffumgebungen fuer die Strukturbestaetigung bestimmen
- `interpret-ir-spectrum` -- Funktionelle Gruppen identifizieren die die beobachtete Fragmentierung erklaeren
- `interpret-uv-vis-spectrum` -- Chromophore im Analyten charakterisieren
- `interpret-raman-spectrum` -- Komplementaere Schwingungsanalyse
- `plan-spectroscopic-analysis` -- Analytische Techniken vor der Datenerfassung auswaehlen und sequenzieren
- `interpret-chromatogram` -- GC- oder LC-Chromatographiedaten gekoppelt mit MS analysieren
