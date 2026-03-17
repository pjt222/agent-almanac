---
name: interpret-ir-spectrum
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretiere Infrarotspektren zur Identifizierung funktioneller Gruppen
  in organischen und anorganischen Verbindungen durch systematische Analyse
  von Absorptionsbanden, Wellenzahlen und Bandenformen. Verwende diesen Skill
  beim Identifizieren von Carbonyl-, Hydroxyl-, Amino- und anderen Gruppen
  aus IR-Daten, beim Unterscheiden von Verbindungsklassen, beim Vergleich
  von Spektren mit Referenzdaten oder beim Unterstuetzen der Strukturaufklaerung
  in Kombination mit NMR und MS.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, infrared, functional-groups, absorption, wavenumber
---

# IR-Spektrum interpretieren

Interpretiere IR-Absorptionsspektren systematisch durch Analyse charakteristischer Banden in definierten Wellenzahlbereichen, Bestimmung des Bandenmusters und Zuordnung zu funktionellen Gruppen, um die molekulare Zusammensetzung und Verbindungsklasse zu identifizieren.

## Wann verwenden

- Identifizieren funktioneller Gruppen (Carbonyl, Hydroxyl, Amino, Ether) aus IR-Daten
- Unterscheiden von Verbindungsklassen (Aldehyd vs. Keton, primaeres vs. sekundaeres Amin)
- Bestaetigen des Reaktionsverlaufs durch Verschwinden oder Erscheinen charakteristischer Banden
- Vergleichen eines unbekannten Spektrums mit einer Referenzbibliothek
- Unterstuetzen der Strukturaufklaerung zusammen mit NMR- und Massendaten

## Eingaben

- **Erforderlich**: IR-Spektrum als Transmissions- oder Absorptionskurve (400-4000 cm-1)
- **Erforderlich**: Aggregatzustand der Probe (KBr-Pressling, Nujol-Mull, Fluessigfilm, ATR)
- **Optional**: Molekuelformel oder Verbindungsklasse (bekannte Information)
- **Optional**: Vergleichsspektren aus Bibliothek oder Literatur

## Vorgehensweise

### Schritt 1: Uebersicht des Spektrums gewinnen

Analysiere das Spektrum zunaechst in groben Zuegen:

1. **Fingerprintbereich (400-1500 cm-1)**: Komplex, verbindungsspezifisch; Vergleich mit Bibliothek sinnvoll.
2. **Funktionsgruppenbereich (1500-4000 cm-1)**: Systematisch auswerten; wenige diagnostische Banden.
3. **Bandensstaerke und -breite**: Starke, breite Banden auf OH oder NH hinweisend; scharfe starke Banden typisch fuer C=O; schwache Banden koennen auf symmetrische oder schwach polare Bindungen hinweisen.

```markdown
## Spektrumueberblick
- Messbedingung: [KBr/ATR/Fluessigfilm]
- Auffaelligste Banden: [Liste der dominierenden Absorptionen]
- Allgemeiner Charakter: [polar/unpolar, organisch/anorganisch]
```

**Erwartet:** Eine erste Einordnung des Spektrums und Identifizierung der diagnostisch wichtigsten Regionen.

**Bei Fehler:** Falls das Spektrum zu verrauscht oder schlecht kalibriert ist, bitte um eine Neumessung unter optimierten Bedingungen (richtige Konzentration, geeignete Probentechnik).

### Schritt 2: OH- und NH-Bereiche auswerten (2500-3700 cm-1)

Dieser Bereich gibt wichtige Informationen ueber Wasserstoffbruecken:

1. **Breite OH-Bande um 3200-3550 cm-1**: Alkohol oder Wasser; durch Wasserstoffbruecken verbreitert.
2. **Scharfe OH-Bande um 3580-3650 cm-1**: Freie OH-Gruppe (in verduennter Loesung oder gasfoermig).
3. **Breite COOH-Absorption 2500-3300 cm-1**: Carbonsaeure; ueberlagert oft CH-Banden.
4. **NH-Banden**:
   - Primaeres Amin: zwei NH-Banden (3300-3500 cm-1, Streckschwingung)
   - Sekundaeres Amin: eine NH-Bande
   - Tertiares Amin: keine NH-Bande

**Erwartet:** Entscheidung ob OH, NH oder beides vorhanden; erste Hinweise auf Alkohol, Amin, Saeure oder Amid.

**Bei Fehler:** Breite Banden durch Feuchtigkeitsschwingungen von Wasser (1630 cm-1 und 3400 cm-1) verwechseln. Probe trocknen und neu messen oder ATR-Technik einsetzen.

### Schritt 3: CH-Banden analysieren (2700-3100 cm-1)

CH-Streckschwingungen geben Hinweise auf Hybridisierung:

1. **sp3-CH**: 2850-3000 cm-1 (aliphatische CH3, CH2)
2. **sp2-CH**: 3000-3100 cm-1 (olefinische, aromatische CH)
3. **sp-CH**: 3300 cm-1 (Alkin-CH, scharf)
4. **Aldehyd-CH**: charakteristisches Dublett um 2720 und 2820 cm-1

**Erwartet:** Identifikation des dominierenden CH-Typs und Hinweise auf Aliphaten, Alkene, Aromaten oder Aldehyde.

### Schritt 4: Carbonylbanden auswerten (1650-1850 cm-1)

Die C=O-Streckschwingung ist oft die diagnostisch wichtigste Bande:

1. **Aldehyd**: ~1720-1740 cm-1 (plus Aldehyd-CH-Dublett)
2. **Keton**: ~1705-1725 cm-1
3. **Carbonsaeure**: ~1700-1725 cm-1 (zusammen mit breitem OH)
4. **Ester**: ~1735-1750 cm-1 (hoeher als Keton, kein OH)
5. **Amid**: ~1630-1690 cm-1 (tiefste Wellenzahl, durch Resonanz)
6. **Anhydrid**: zwei Carbonylbanden (~1800 und ~1850 cm-1)
7. **Saeurehalogenid**: ~1800 cm-1 (hoechste Wellenzahl)

```markdown
## Carbonylanalyse
| Wellenzahl (cm-1) | Intensitaet | Bandenform | Zuweisung |
|-------------------|-------------|------------|-----------|
| [wert]            | [stark/mittel/schwach] | [scharf/breit] | [Gruppe] |
```

**Erwartet:** Identifikation der Carbonylverbindungsklasse oder Ausschluss von Carbonylgruppen.

**Bei Fehler:** Bei sehr breiten oder ueberlagerten Carbonylbanden erwaege mehrere Komponenten oder unreine Probe; FTIR-Differenzspektroskopie oder Chromatographie vor Messung.

### Schritt 5: Fingerprint-Bereich und abschliessende Zuweisung

Nutze den Fingerprint-Bereich fuer die endgueltige Identifizierung:

1. **C-O-Einfachbindung** (1000-1300 cm-1): Unterscheidet Ether, Ester, Alkohole.
2. **Aromatische Banden** (1450-1600 cm-1): C=C-Streckschwingungen des Rings; out-of-plane CH-Biegung (700-900 cm-1) zeigt Substitutionsmuster.
3. **Nitro-Gruppe**: starke Banden bei ~1350 und ~1550 cm-1.
4. **Alkin C≡C**: 2100-2260 cm-1 (bei symmetrischen Alkinen IR-inaktiv).
5. **Bibliotheksvergleich**: Suche nach Treffern im Fingerprint-Bereich.

**Erwartet:** Vollstaendige Liste identifizierter funktioneller Gruppen und Vorschlag der Verbindungsklasse.

**Bei Fehler:** Falls keine eindeutige Zuweisung moeglich, kombiniere mit NMR und MS. Ueberlagernde Banden erfordern Entfaltung oder zusaetzliche Messung.

## Validierung

- [ ] Alle Hauptabsorptionsbanden zugewiesen
- [ ] OH/NH-Banden korrekt differenziert
- [ ] Carbonylklasse eindeutig bestimmt (falls Carbonyl vorhanden)
- [ ] Aromatische oder olefinische Systeme identifiziert (falls vorhanden)
- [ ] Ergebnis mit Molekuelformel konsistent
- [ ] Spektrum mit Referenz oder Bibliothek verglichen

## Haeufige Stolperfallen

- **Wasserverunreinigung**: Breite Bande bei 3400 cm-1 kann OH der Probe oder Feuchtigkeit sein; ATR-Technik oder Trocknung der Probe hilft.
- **Verwechslung Alkohol/Carbonsaeure**: Beide zeigen OH-Banden, aber Carbonsaeure hat tiefere C=O-Wellenzahl und breiteres OH.
- **Fehlinterpretation des Fingerprintbereichs**: Viele Ueberlagerungen; nicht einzelne Banden isoliert interpretieren, immer Gesamtbild betrachten.
- **Vernachlaessigung der Probentechnik**: ATR-, KBr- und Fluessigfilmmessungen koennen unterschiedliche relative Bandenintensitaeten zeigen.

## Verwandte Skills

- `interpret-nmr-spectrum` -- ergaenzende Strukturinformation aus NMR
- `interpret-mass-spectrum` -- Molmasse und Fragmentierungsmuster
- `plan-spectroscopic-analysis` -- optimale Messstrategie auswahlen
