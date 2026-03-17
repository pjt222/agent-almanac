---
name: interpret-raman-spectrum
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretiere Raman-Spektren zur Charakterisierung chemischer Bindungen,
  Kristallstruktur und Materialzusammensetzung. Verwende diesen Skill beim
  Identifizieren von Raman-aktiven Schwingungsmoden, beim Unterscheiden von
  Raman- und IR-komplementaerer Information, beim Analysieren von
  Kohlenstoffmaterialien (D- und G-Banden), beim Charakterisieren
  anorganischer Materialien oder beim Nutzen von SERS fuer
  Ultrasensitivitaetsdetektierung.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, raman, vibrational, polarizability, carbon-materials
---

# Raman-Spektrum interpretieren

Interpretiere Raman-Streuspektren durch Identifizierung charakteristischer Schwingungsmoden, Auswertung von Intensitaetsverhaeltnissen und Bandenpositionen sowie Ableitung von Strukturinformation ueber chemische Bindungen, Materialkomposition und Kristallgueite.

## Wann verwenden

- Identifizieren von Raman-aktiven Schwingungsmoden organischer oder anorganischer Verbindungen
- Charakterisieren von Kohlenstoffmaterialien (Graphen, CNT, Diamant, amorphes C) ueber D- und G-Banden
- Analysieren kristalliner Materialien und Polymorphe
- Nutzen der Komplementaritaet zur IR-Spektroskopie (Raman aktiv: symmetrische Moden; IR aktiv: asymmetrische Moden)
- Oberflaechenverstaerkte Raman-Spektroskopie (SERS) fuer Spurenanalytik

## Eingaben

- **Erforderlich**: Raman-Spektrum mit Wellenzahl (cm-1) und Intensitaet (Streulicht)
- **Erforderlich**: Anregungswellenlaenge des Lasers (typisch 532, 633, 785, 1064 nm)
- **Optional**: Polarisationsabhaengigkeitsdaten (Depolarisierungsverhaeltnis)
- **Optional**: Vergleichsdaten aus Bibliothek oder Literatur

## Vorgehensweise

### Schritt 1: Basislinienkorrektur und Spektrenueberblick

Bereite das Raman-Spektrum fuer die Interpretation vor:

1. **Fluoreszenzuntergrund**: Raman-Spektren haben oft starken Fluoreszenzuntergrund; dieser muss subtrahiert werden (Polynom-Fit oder adaptive Basislinienkorrektur).
2. **Wellenzahlkalibrierung**: Pruefe gegen bekannte Referenzbanden (z.B. Silizium bei 520 cm-1, Cyclohexan-Banden).
3. **Hauptbandenpositionen dokumentieren**: Liste alle Stokes-Raman-Banden mit ihren Wellenzahlen auf.
4. **Signal-Rausch-Verhaeltnis bewerten**: Signifikante Banden muessen S/N > 3 haben.

```markdown
## Spektrenueberblick
- Anregungswellenlaenge: [nm]
- Hauptbanden (cm-1): [Liste]
- Fluoreszenzuntergrund: [niedrig/mittel/stark]
- Kalibrierungsreferenz: [Substanz, Wellenzahl]
```

**Erwartet:** Korrigiertes Spektrum mit identifizierten Hauptbanden und bewerteter Datenqualitaet.

**Bei Fehler:** Bei starker Fluoreszenz wechsle zu laengerer Anregungswellenlaenge (785 oder 1064 nm) oder wende NIR-Raman an.

### Schritt 2: Charakteristische Raman-Banden organischer Verbindungen zuordnen

Ordne Banden strukturellen Merkmalen zu:

1. **Streckschwingungsbereiche**:
   - OH/NH: 3200-3600 cm-1 (schmaeler als in IR bei Raman-aktiven Systemen)
   - CH (sp3): 2850-3000 cm-1
   - CH (sp2/aromatisch): 3000-3100 cm-1
   - C≡C und C≡N: 2100-2260 cm-1 (stark in Raman, schwach in IR)
   - C=O: 1650-1800 cm-1 (oft schwaecher als in IR)
   - C=C: 1600-1680 cm-1 (stark in Raman, stark konjugierte Systeme)
2. **Deformationsschwingungen** (Fingerprint):
   - CH2-Scissoring: ~1460 cm-1
   - CH3-Umbrella: ~1375 cm-1
   - Ring-Atembewegung (Benzol): ~992 cm-1 (sehr charakteristisch, stark)
3. **Skelettchwingungen** (unterhalb 1000 cm-1): Verbindungsspezifisch.

**Erwartet:** Hauptbanden organischer Verbindungen identifiziert und funktionellen Gruppen zugeordnet.

**Bei Fehler:** Falls Banden nicht zugeordnet werden koennen, nutze Raman-Spektrenbibliotheken (RRUFF, SDBS) fuer Vergleich.

### Schritt 3: Kohlenstoffmaterialien charakterisieren

Analysiere spezifische Merkmale fuer Kohlenstoffallotrope:

1. **G-Bande (~1580 cm-1)**: E2g-Mode graphitischer Kohlenstoffe; scharf und stark in Graphen und Graphit; verbreitert in amorphem C.
2. **D-Bande (~1350 cm-1)**: A1g-Mode, aktiviert durch Defekte und Unordnung; verschwindet in perfektem Graphen.
3. **ID/IG-Verhaeltnis**: Indikator fuer Defektdichte in Graphen, CNT oder Graphit; hoeher = mehr Defekte.
4. **2D-Bande (~2700 cm-1)**: Zweite Ordnung, besonders in Graphen ausgepraegt; Form und Position zeigen Lagenanzahl.
5. **Diamant**: charakteristische Bande bei 1332 cm-1 (Td-Symmetrie, erste Ordnung TO-Phonon).

```markdown
## Kohlenstoffanalyse
| Bande | Position (cm-1) | Halbwertsbreite | ID/IG | Interpretation |
|-------|----------------|-----------------|-------|----------------|
| D | [wert] | [wert] | - | Defekte |
| G | [wert] | [wert] | - | Graphitisch |
| 2D | [wert] | [wert] | - | Lagenanzahl |
```

**Erwartet:** Charakterisierung des Kohlenstoffmaterials (Graphen, CNT, amorph) mit Defektdichte-Abschaetzung.

**Bei Fehler:** Bei stark fluoreszierenden Proben koennen D- und G-Banden schwer trennbar sein; Basislinienkorrektur verfeinern.

### Schritt 4: Anorganische Materialien und Polymorphe

Nutze Raman zur Phasen- und Kristallstrukturcharakterisierung:

1. **Gitterschwingungen** (< 400 cm-1): Charakteristisch fuer Kristallstruktur und Ionenbindung; TiO2-Polymorphe (Anatas 144 cm-1, Rutil 447 cm-1).
2. **Carbonat/Sulfat/Phosphat-Verbindungen**: Starke Streckschwingungen des Anions.
3. **Mineralidentifikation**: Raman-Bibliotheken wie RRUFF bieten ueber 10000 Mineralspektren.
4. **Polymorphe unterscheiden**: Unterschiedliche Kristallsymmetrie fuehrt zu unterschiedlichen Raman-Mustern (z.B. Calcit vs. Aragonit).

**Erwartet:** Phase und Polymorph des anorganischen Materials identifiziert.

**Bei Fehler:** Bei Mehrphasensystemen koennen ueberlagernde Banden auftreten; ortsaufgeloeste Raman-Kartierung ermoeglicht Phasenverteilungsanalyse.

### Schritt 5: Strukturelle Schlussfolgerungen zusammenfuehren

Kombiniere alle Raman-Informationen zu einer Gesamtauswertung:

1. **Komplementaritaet zur IR**: Raman bevorzugt symmetrische Schwingungen, IR bevorzugt asymmetrische; bei Inversionssymmetrie schliessen sich Aktivitaeten aus (Ausschlussprinzip).
2. **Quantitative Auswertung**: Banden-Flaechenverhaeltnisse fuer Kompositionsanalyse; Kalibrierung mit Standards.
3. **Strukturbericht verfassen**: Dokumentiere alle Bandenzuweisungen, Vergleichsdaten und Schlussfolgerungen.

**Erwartet:** Vollstaendige strukturelle Charakterisierung mit explizitem Verweis auf komplementaere Spektralmethoden.

## Validierung

- [ ] Fluoreszenzuntergrund subtrahiert und Kalibrierung geprueft
- [ ] Alle Hauptbanden zugeordnet
- [ ] Komplementaritaet zur IR-Spektroskopie beruecksichtigt
- [ ] Fuer Kohlenstoffmaterialien: ID/IG berechnet
- [ ] Ergebnis mit Referenzspektren oder Bibliothek verglichen

## Haeufige Stolperfallen

- **Fluoreszenz ueberdeckt Raman-Signal**: Wechsel zu laengerer Anregungswellenlaenge (785 nm oder 1064 nm) notwendig.
- **Verwechslung Stokes- und Anti-Stokes-Linien**: Anti-Stokes-Linien (blauverschoben) sind intensitaetsschwaecher und temperaturabhaengig.
- **Reabsorption bei SERS**: Sehr hohe lokale Feldverstaerkung kann zu nichtlinearen Effekten fuehren.
- **Thermische Schaeden durch zu hohe Laserleistung**: Probe kann durch Laserheizung degradieren; Leistung reduzieren oder Probe bewegen.

## Verwandte Skills

- `interpret-ir-spectrum` -- komplementaere Schwingungsinformation
- `interpret-uv-vis-spectrum` -- elektronische Uebergaenge und Resonanz-Raman
- `plan-spectroscopic-analysis` -- Messstrategie und Methodenauswahl
