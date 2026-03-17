---
name: interpret-ir-spectrum
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Infrarotspektren systematisch interpretieren um in einer Probe vorhandene
  funktionelle Gruppen zu identifizieren. Behandelt die Analyse des
  diagnostischen Bereichs (4000-1500 cm-1), die Bewertung des
  Fingerprintbereichs (1500-400 cm-1), Wasserstoffbrueckenbindungseffekte
  und die Erstellung eines Funktionelle-Gruppen-Inventars mit
  Vertrauensstufen.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, ir, infrared, functional-groups, absorption
---

# IR-Spektrum interpretieren

Infrarot-Absorptionsspektren analysieren um funktionelle Gruppen zu identifizieren, Wasserstoffbrueckenbindungen zu bewerten und ein umfassendes Inventar der in der Probe vorhandenen Strukturmerkmale zu erstellen.

## Wann verwenden

- Identifikation funktioneller Gruppen in einer unbekannten Verbindung als erster Screening-Schritt
- Bestaetigung der An- oder Abwesenheit bestimmter funktioneller Gruppen (z.B. Verifizierung dass eine Reaktion einen Alkohol in ein Keton umgewandelt hat)
- Ueberwachung des Reaktionsfortschritts durch Verfolgung des Erscheinens oder Verschwindens charakteristischer Absorptionen
- Unterscheidung aehnlicher Verbindungen die sich im Gehalt funktioneller Gruppen unterscheiden
- Ergaenzung von NMR- und Massenspektrometriedaten mit Schwingungsinformation

## Eingaben

- **Erforderlich**: IR-Spektrumdaten (Absorptionsfrequenzen in cm-1 mit Intensitaeten, entweder als %Transmission- oder Absorbanzplot)
- **Erforderlich**: Probenvorbereitungsmethode (KBr-Pressling, ATR, Nujol-Verreibung, Duennfilm, Loesungsmittelkuevette)
- **Optional**: Summenformel oder erwartete Verbindungsklasse
- **Optional**: Bekannte Strukturfragmente aus anderen spektroskopischen Daten
- **Optional**: Geraeteparameter (Aufloesung, Scanbereich, Detektortyp)

## Vorgehensweise

### Schritt 1: Spektrumqualitaet und Format ueberpruefen

Verifizieren dass das Spektrum fuer die Interpretation geeignet ist bevor Peaks analysiert werden:

1. **Y-Achsenformat pruefen**: Feststellen ob das Spektrum in %Transmission (%T, Peaks zeigen nach unten) oder Absorbanz (A, Peaks zeigen nach oben) dargestellt ist. Alle nachfolgenden Analysen setzen eine konsistente Konvention voraus.
2. **Wellenzahlbereich verifizieren**: Bestaetigen dass das Spektrum mindestens 4000--400 cm-1 fuer eine Standard-MIR-Analyse abdeckt. Etwaige Beschneidungen vermerken.
3. **Basislinie bewerten**: Eine gute Basislinie sollte relativ flach und nahe 100%T (oder 0 Absorbanz) in Bereichen ohne Absorption sein. Geneigte oder verrauschte Basislinien verringern die Zuverlaessigkeit.
4. **Aufloesung pruefen**: Benachbarte Peaks die weniger als die instrumentelle Aufloesung auseinanderliegen koennen nicht unterschieden werden. Typische FTIR-Aufloesung betraegt 4 cm-1.
5. **Praeparationsartefakte identifizieren**: KBr-Presslinge koennen eine breite O-H-Bande von absorbierter Feuchtigkeit zeigen (~3400 cm-1). Nujol-Verreibungen verdecken C-H-Streckschwingungen. ATR-Spektren zeigen Intensitaetsverzerrung bei niedrigen Wellenzahlen. Alle Artefakte vermerken die die Interpretation einschraenken.

**Erwartet:** Spektrum als fuer die Analyse geeignet bestaetigt, mit dokumentiertem Format, Bereich und Artefakten.

**Bei Fehler:** Wenn das Spektrum schwere Basislinienprobleme, Saettigung (flachbodige Peaks von zu konzentrierten Proben) oder Praeparationsartefakte aufweist die kritische Bereiche verdecken, die Einschraenkung vermerken und betroffene Spektralbereiche als unzuverlaessig kennzeichnen.

### Schritt 2: Den diagnostischen Bereich scannen (4000--1500 cm-1)

Den Hochfrequenzbereich systematisch analysieren, in dem die meisten funktionellen Gruppen charakteristische Absorptionen erzeugen:

1. **O-H-Streckschwingungen (3200--3600 cm-1)**: Nach breiten Absorptionen suchen. Ein scharfer Peak nahe 3600 cm-1 zeigt freies O-H an; eine breite Bande zentriert bei 3200--3400 cm-1 zeigt wasserstoffbrueckengebundenes O-H an (Alkohole, Carbonsaeuren, Wasser).
2. **N-H-Streckschwingungen (3300--3500 cm-1)**: Primaere Amine zeigen zwei Peaks (symmetrische und asymmetrische Streckschwingung); sekundaere Amine zeigen einen Peak. Diese sind typischerweise schaerfer als O-H-Banden.
3. **C-H-Streckschwingungen (2800--3300 cm-1)**:

| Frequenz (cm-1) | Zuordnung |
|------------------|-----------|
| 3300 | sp-C-H (Alkin, scharf) |
| 3000--3100 | sp2-C-H (aromatisch, Vinyl) |
| 2850--3000 | sp3-C-H (Alkyl, mehrere Peaks) |
| 2700--2850 | Aldehyd-C-H (zwei Peaks durch Fermi-Resonanz) |

4. **Dreifachbindungsbereich (2000--2300 cm-1)**:

| Frequenz (cm-1) | Zuordnung | Anmerkungen |
|------------------|-----------|-------------|
| 2100--2260 | C-Dreifachbindung-C | Schwach oder fehlend bei Symmetrie |
| 2200--2260 | C-Dreifachbindung-N | Mittel bis stark |
| ~2350 | CO2 | Atmosphaerisches Artefakt, ignorieren |

5. **Carbonylbereich (1650--1800 cm-1)** -- der diagnostisch ergiebigste einzelne Bereich im IR:

| Frequenz (cm-1) | Zuordnung |
|------------------|-----------|
| 1800--1830, 1740--1770 | Saeureanhydrid (zwei C=O-Streckschwingungen) |
| 1770--1780 | Saeurechlorid |
| 1735--1750 | Ester |
| 1700--1725 | Carbonsaeure |
| 1705--1720 | Aldehyd |
| 1705--1720 | Keton |
| 1680--1700 | Konjugiertes Keton / alpha-beta-ungesaettigt |
| 1630--1690 | Amid (Amid-I-Bande) |

6. **C=C- und C=N-Streckschwingungen (1600--1680 cm-1)**: Alken-C=C erscheint bei 1620--1680 cm-1 (schwach bis mittel). Aromatisches C=C zeigt mehrere Peaks nahe 1450--1600 cm-1. C=N (Imin) erscheint bei 1620--1660 cm-1.

**Erwartet:** Alle Absorptionen im diagnostischen Bereich identifiziert, mit Zuordnungen funktioneller Gruppen und Vertrauensstufen (sicher, vorlaefig, fehlend).

**Bei Fehler:** Wenn der Carbonylbereich verdeckt ist (z.B. Wasserabsorption in KBr, atmosphaerisches CO2), die Luecke vermerken. Wenn eine erwartete Absorption einer funktionellen Gruppe fehlt, mit einer zweiten Praeparationsmethode bestaetigen bevor auf tatsaechliches Fehlen geschlossen wird.

### Schritt 3: Den Fingerprintbereich analysieren (1500--400 cm-1)

Den Niederfrequenzbereich auf bestaetigendes und strukturelles Detail untersuchen:

1. **C-O-Streckschwingungen (1000--1300 cm-1)**: Ether, Ester, Alkohole und Carbonsaeuren erzeugen starke C-O-Streckschwingungsabsorptionen. Ester zeigen zusaetzlich zur Carbonylbande eine charakteristische starke Bande nahe 1000--1100 cm-1.
2. **C-N-Streckschwingungen (1000--1250 cm-1)**: Amine und Amide; Ueberlappung mit C-O macht die Zuordnung ohne weitere Belege vorlaefig.
3. **C-F-, C-Cl-, C-Br-Streckschwingungen**:

| Frequenz (cm-1) | Zuordnung |
|------------------|-----------|
| 1000--1400 | C-F (stark) |
| 600--800 | C-Cl |
| 500--680 | C-Br |

4. **Aromatisches Substitutionsmuster (700--900 cm-1)**: Die Out-of-plane-C-H-Deformationsschwingung verraet das Substitutionsmuster:

| Frequenz (cm-1) | Muster |
|------------------|--------|
| 730--770 | Monosubstituiert (+ 690--710) |
| 735--770 | Ortho-disubstituiert |
| 750--810, 860--900 | Meta-disubstituiert |
| 790--840 | Para-disubstituiert |

5. **Gesamtvergleich des Fingerprintbereichs**: Der Fingerprintbereich ist fuer jede Verbindung einzigartig. Wenn ein Referenzspektrum verfuegbar ist, diesen Bereich ueberlagern und vergleichen fuer die Identitaetsbestaetigung.

**Erwartet:** Bestaetigendes Zuordnungen fuer in Schritt 2 identifizierte funktionelle Gruppen, plus zusaetzliches strukturelles Detail (Substitutionsmuster, C-O/C-N-Zuordnungen).

**Bei Fehler:** Der Fingerprintbereich ist inhaerent komplex und ueberlappend. Wenn Zuordnungen mehrdeutig sind, sie als vorlaefig kennzeichnen und sich fuer endgueltige Schlussfolgerungen auf den diagnostischen Bereich und andere spektroskopische Daten stuetzen.

### Schritt 4: Wasserstoffbrueckenbindungen und intermolekulare Effekte bewerten

Evaluieren wie Probenzustand und intermolekulare Wechselwirkungen das Spektrum beeinflussen:

1. **Verbreiterung durch Wasserstoffbrueckenbindung**: Breite und Position der O-H- und N-H-Banden vergleichen. Freies O-H ist scharf und nahe 3600 cm-1; wasserstoffbrueckengebundenes O-H ist breit und nach 3200--3400 cm-1 verschoben. Carbonsaeuredimere zeigen ein sehr breites O-H von 2500--3300 cm-1.
2. **Konzentrations- und Zustandseffekte**: Loesungsspektren bei verschiedenen Konzentrationen koennen intramolekulare (konzentrationsunabhaengige) von intermolekularen (konzentrationsabhaengigen) Wasserstoffbrueckenbindungen unterscheiden.
3. **Fermi-Resonanz**: Zwei ueberlappende Banden koennen wechselwirken und in ein Dublett aufspalten. Das klassische Beispiel ist das Aldehyd-C-H-Paar nahe 2720 und 2820 cm-1. Fermi-Resonanz erkennen um zusaetzliche Peaks nicht als getrennte funktionelle Gruppen fehlzuordnen.
4. **Festkoerpereffekte**: KBr-Presslinge und Nujol-Verreibungen spiegeln die Festkoerperpackung wider, die Banden verbreitert und Frequenzen um 10--20 cm-1 relativ zu Loesungsspektren verschieben kann. ATR-Spektren entsprechen am ehesten dem reinen Fluessigkeitszustand.

**Erwartet:** Wasserstoffbrueckenbindungszustand charakterisiert, Praeparationsmethoden-Artefakte beruecksichtigt und anomale Bandenformen erklaert.

**Bei Fehler:** Wenn Wasserstoffbrueckenbindungseffekte nicht aufgeloest werden koennen (z.B. ueberlappende O-H- und N-H-Banden), die Mehrdeutigkeit vermerken. Ein D2O-Austauschexperiment oder eine temperaturabhaengige Studie kann helfen, erfordert aber zusaetzliche Daten.

### Schritt 5: Funktionelle-Gruppen-Inventar erstellen

Alle Befunde zu einem strukturierten Bericht zusammenfassen:

1. **Bestaetigte funktionelle Gruppen auflisten**: Gruppen mit starken, eindeutigen Absorptionen im diagnostischen Bereich (z.B. scharfes C=O bei 1715 cm-1 = Keton oder Aldehyd).
2. **Vorlaefige Zuordnungen auflisten**: Gruppen mit schwaeecherer Evidenz oder ueberlappenden Absorptionen die durch mehr als eine funktionelle Gruppe erklaerbar sind.
3. **Abwesende funktionelle Gruppen auflisten**: Gruppen deren charakteristische starke Absorptionen eindeutig im Spektrum fehlen (z.B. keine breite O-H-Bande bedeutet kein freier Alkohol oder keine Carbonsaeure).
4. **Diskrepanzen vermerken**: Absorptionen die nicht zum vorgeschlagenen Satz funktioneller Gruppen passen, oder erwartete Absorptionen die fehlen.
5. **Quervergleich**: Das IR-abgeleitete Funktionelle-Gruppen-Inventar mit Informationen aus anderen Techniken (NMR, MS, UV-Vis) vergleichen falls verfuegbar.

**Erwartet:** Ein vollstaendiges Funktionelle-Gruppen-Inventar nach Vertrauensstufen kategorisiert, mit spezifischen Frequenzen und Intensitaeten als Beleg fuer jede Zuordnung.

**Bei Fehler:** Wenn das Inventar unvollstaendig oder widerspruechlich ist, identifizieren welche zusaetzlichen Experimente (ATR vs. KBr-Vergleich, variable Konzentration, D2O-Austausch) die Mehrdeutigkeiten aufloesen wuerden.

## Validierung

- [ ] Spektrumqualitaet bewertet (Basislinie, Aufloesung, Artefakte, Y-Achsenformat)
- [ ] Loesungsmittel-, Praeparationsmethoden- und atmosphaerische Artefakte identifiziert und ausgeschlossen
- [ ] Alle Absorptionen im diagnostischen Bereich (4000--1500 cm-1) zugeordnet oder markiert
- [ ] Carbonylbereich mit spezifischer Subtypzuordnung analysiert wo moeglich
- [ ] Fingerprintbereich auf bestaetigendes Evidenz untersucht
- [ ] Wasserstoffbrueckenbindungseffekte evaluiert und deren Einfluss auf Peakform/-position dokumentiert
- [ ] Funktionelle-Gruppen-Inventar mit Vertrauensstufen erstellt
- [ ] Abwesende funktionelle Gruppen explizit vermerkt (Negativevidenz ist informativ)
- [ ] Zuordnungen mit anderen verfuegbaren spektroskopischen Daten quervergleicht

## Haeufige Stolperfallen

- **Praeparationsartefakte ignorieren**: KBr-Feuchtigkeit (breite 3400 cm-1), Nujol-C-H (2850--2950 cm-1) und ATR-Intensitaetsverzerrung bei niedrigen Wellenzahlen imitieren oder verdecken alle echte Probenabsorptionen. Immer die Praeparationsmethode beruecksichtigen.
- **Den Fingerprintbereich ueberinterpretieren**: Der Bereich unter 1500 cm-1 ist komplex und ueberlappend. Ihn zur Bestaetigung verwenden, nicht zur Primaeridentifikation. Nicht jeden Peak zuordnen.
- **Atmosphaerisches CO2 mit Probenpeaks verwechseln**: Das scharfe Dublett nahe 2350 cm-1 ist fast immer atmosphaerisches CO2, keine Probenabsorption. Die Hintergrundsubtraktion sollte es entfernen, aber zur Sicherheit verifizieren.
- **Bandenintensitaet und -breite vernachlaessigen**: Eine starke, breite Absorption hat einen anderen diagnostischen Wert als ein schwacher, scharfer Peak bei der gleichen Frequenz. Intensitaet (stark/mittel/schwach) und Form (scharf/breit) neben der Frequenz angeben.
- **Einzelpeakzuordnungen**: Nie eine funktionelle Gruppe anhand einer einzelnen Absorption allein identifizieren. Carbonylgruppen zum Beispiel sollten durch zusaetzliche Banden unterstuetzt werden (C-O fuer Ester, N-H fuer Amide, C-H fuer Aldehyde).
- **Abwesenheit aus schwacher Absorption folgern**: Einige funktionelle Gruppen erzeugen inhaerent schwache IR-Absorptionen (symmetrisches C=C, Dreifachbindungen in symmetrischen Alkinen). Abwesenheit eines Peaks bedeutet nicht immer Abwesenheit der Gruppe.

## Verwandte Skills

- `interpret-nmr-spectrum` -- detaillierte Konnektivitaet und Wasserstoffumgebungen bestimmen
- `interpret-mass-spectrum` -- Summenformel und Fragmentierungsmuster ermitteln
- `interpret-uv-vis-spectrum` -- Chromophore charakterisieren als Ergaenzung zu IR-Funktionelle-Gruppen-Daten
- `interpret-raman-spectrum` -- komplementaere Schwingungsdaten fuer IR-inaktive Moden erhalten
- `plan-spectroscopic-analysis` -- spektroskopische Techniken vor der Datenerfassung auswaehlen und sequenzieren
