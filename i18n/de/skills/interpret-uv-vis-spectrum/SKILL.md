---
name: interpret-uv-vis-spectrum
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretiere UV-Vis-Absorptionsspektren zur Charakterisierung von
  Chromophoren, Konjugationssystemen und elektronischen Uebergaengen in
  organischen und anorganischen Verbindungen. Verwende diesen Skill beim
  Identifizieren von Chromophoren und Konjugationslaengen, beim Anwenden
  des Lambert-Beerschen Gesetzes fuer Konzentrationsbestimmungen, beim
  Vergleich experimenteller Spektren mit Woodward-Fieser-Regeln oder beim
  Unterscheiden elektronischer Uebergangstypen (pi-pi*, n-pi*, d-d).
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, uv-vis, chromophore, absorbance, electronic-transitions
---

# UV-Vis-Spektrum interpretieren

Interpretiere UV-Vis-Absorptionsspektren durch Analyse von Absorptionsmaxima (lambda_max), Extinktionskoeffizienten und Bandenformen zur Charakterisierung von Chromophoren, Konjugationssystemen und Verbindungsklassen.

## Wann verwenden

- Identifizieren von Chromophoren und dem Grad der pi-Konjugation
- Bestimmen der Konzentration einer Probe per Lambert-Beerschem Gesetz
- Unterscheiden elektronischer Uebergangstypen (pi-pi*, n-pi*, d-d-Uebergaenge)
- Anwenden empirischer Regeln (Woodward-Fieser) zur Vorhersage von lambda_max
- Unterstuetzen der Strukturaufklaerung organischer Verbindungen

## Eingaben

- **Erforderlich**: UV-Vis-Spektrum mit Absorptionswellenlange (nm) und Extinktion oder Transmission
- **Erforderlich**: Loesungsmittel und Probenkonzentration (falls Extinktionskoeffizient berechnet werden soll)
- **Optional**: Schichtdicke der Kuvette (Standard: 1 cm)
- **Optional**: Vergleichsspektren oder Literaturdaten

## Vorgehensweise

### Schritt 1: Absorptionsmaxima bestimmen und dokumentieren

Identifiziere alle Absorptionsmaxima im Spektrum:

1. **Nahes UV (200-400 nm)**: pi-pi*- und n-pi*-Uebergaenge organischer Verbindungen.
2. **Sichtbares Licht (400-700 nm)**: Ausgedehnte Konjugation, Uebergangsmetallkomplexe, organische Farbstoffe.
3. **Nahes Infrarot (700-1100 nm)**: Stark konjugierte Systeme, einige Porphyrine, Charge-Transfer-Komplexe.

```markdown
## Absorptionsmaxima
| lambda_max (nm) | Extinktion A | Epsilon (L mol-1 cm-1) | Zuordnung |
|----------------|-------------|----------------------|-----------|
| [wert] | [wert] | [berechnet] | [Uebergang] |
```

**Erwartet:** Liste aller signifikanten Absorptionsmaxima mit zugehoerigen Extinktionswerten und Uebergangszuordnung.

**Bei Fehler:** Falls das Spektrum stark verrauscht ist oder die Grundlinie schlecht definiert, pruefe auf Loesungsmitteleigenschaften (Loesungsmittelcutoff) und Probenreinheit.

### Schritt 2: Extinktionskoeffizient berechnen und Uebergangstyp bestimmen

Berechne den molaren Extinktionskoeffizienten und leite den Uebergangstyp ab:

1. **Lambert-Beersches Gesetz**: A = epsilon * c * l, wobei A = Extinktion, c = Konzentration (mol/L), l = Schichtdicke (cm).
2. **Uebergangstyp nach epsilon**:
   - epsilon > 10000 L mol-1 cm-1: erlaubter pi-pi*-Uebergang (Konjugation)
   - epsilon 100-10000 L mol-1 cm-1: pi-pi* mit geringer Symmetrieerlaubtheit
   - epsilon < 100 L mol-1 cm-1: verbotener n-pi*-Uebergang oder d-d-Uebergang
3. **Loesungsmitteleffekte**: n-pi*-Banden verschieben hypsochrom (blauverschiebend) in polaren Loesungsmitteln; pi-pi*-Banden verschieben bathochrom (rotverschiebend).

**Erwartet:** Berechneter Extinktionskoeffizient und Zuordnung zum Uebergangstyp basierend auf epsilon-Groessenordnung.

**Bei Fehler:** Falls Lambert-Beer-Linearitaet verletzt ist (Konzentration zu hoch), verduenne die Probe auf A < 2 und wiederhole.

### Schritt 3: Konjugationssystem analysieren

Leite Konjugationslaenge und Chromophorstruktur aus dem Spektrum ab:

1. **Woodward-Fieser-Regeln fuer Diene**:
   - Basiswert homoannulares Dien: 253 nm; heteroannulares Dien: 217 nm
   - Pro zusaetzliche Konjugation (Doppelbindung): +30 nm
   - Pro Alkylsubstituent oder Ringrest: +5 nm
   - Pro Exocyclo-Doppelbindung: +5 nm
2. **Woodward-Regeln fuer alpha-beta-ungesaettigte Carbonyle**:
   - Basiswert Cyclohex-2-enon: 215 nm
   - Pro alpha-Substituent: +10 nm; pro beta-Substituent: +12 nm
3. **Aromatische Verbindungen**: Benzol zeigt Banden bei 204 nm (epsilon ~60000), 254 nm (epsilon ~200). Substituenten verschieben und intensivieren.

**Erwartet:** Vorhergesagter lambda_max-Wert aus empirischen Regeln, verglichen mit gemessenem Wert (Abweichung < 5 nm akzeptabel).

**Bei Fehler:** Bei groesserer Abweichung pruefe auf fehlende Substituenten, sterische Verdrillung des Konjugationssystems oder Ladungsuebertragungscharakter.

### Schritt 4: Besondere Spektralphaaenomene interpretieren

Erkenne und erklaere ungewoehnliche Spektralmerkmale:

1. **Schultern**: Vibrationsstruktur auf dem elektronischen Uebergang oder zwei nah beieinander liegende Uebergaenge.
2. **Bathochrome Verschiebung (Rotverschiebung)**: Laengere Konjugation, saurere Loesungsmittel (bei basischen Chromophoren), Deprotonierung.
3. **Hypsochrome Verschiebung (Blauverschiebung)**: Verkuerzung der Konjugation, verdrillete Konformation, polares protisches Loesungsmittel (n-pi*-Banden).
4. **Isobestischer Punkt**: Gemeinsamer Schnittpunkt mehrerer Spektren bei Interkonversion zweier Spezies; wichtig fuer Gleichgewichts- oder Kinetikstudien.

**Erwartet:** Erklaerung aller auffaelligen Spektralmerkmale und deren physikalisch-chemische Ursache.

**Bei Fehler:** Falls isobestischer Punkt nicht auf einer Geraden liegt, liegt eine Dreikomponentenmischung oder eine Nebenreaktion vor.

### Schritt 5: Zusammenfassung und strukturelle Schlussfolgerung

Erstelle eine strukturelle Schlussfolgerung aus den UV-Vis-Daten:

1. **Chromophoridentifizierung**: Welche pi-Systeme oder Heteroatome erklaeren die beobachteten Absorptionen?
2. **Konsistenzpruefung mit NMR/IR**: UV-Vis-Daten ergaenzen; z.B. bestaetigt ein grosses pi-pi*-Band bei 300 nm ausgedehnte Konjugation, die auch im NMR sichtbar sein sollte.
3. **Quantitative Bestimmung**: Falls Konzentration gesucht, nutze Lambert-Beer bei bekanntem epsilon oder erstelle Kalibrierkurve.

**Erwartet:** Klare Aussage ueber Chromophorstruktur und Konjugationsgrad mit Begruendung.

## Validierung

- [ ] Alle Absorptionsmaxima dokumentiert und zugeordnet
- [ ] Extinktionskoeffizienten berechnet und mit Literatur verglichen
- [ ] Uebergangstyp (pi-pi*, n-pi*, d-d) anhand von epsilon bestimmt
- [ ] Woodward-Fieser-Regel angewendet (falls konjugiertes System)
- [ ] Loesungsmitteleffekte beruecksichtigt
- [ ] Schlussfolgerung konsistent mit anderen Spektraldaten

## Haeufige Stolperfallen

- **Lambert-Beer-Verletzung**: Zu hohe Konzentration fuehrt zu Abweichung von Linearitaet; pruefe bei A > 2.
- **Loesungsmittel-Cutoff ignorieren**: Polares aprotisches Loesungsmittel wie Acetonitril absorbiert unter 190 nm; Dichlormethan unter 240 nm.
- **n-pi*- und pi-pi*-Banden verwechseln**: Kleine epsilon-Werte (< 100) deuten auf n-pi*-Uebergang, auch wenn lambda_max im sichtbaren Bereich liegt.
- **Kuevettenreinheit**: Fingerabdruecke oder organische Verunreinigungen auf der Kuvette fuehren zu zusaetzlichen Absorptionen.

## Verwandte Skills

- `interpret-nmr-spectrum` -- Konjugationssystem aus NMR bestaetigen
- `interpret-raman-spectrum` -- ergaenzende Information zu pi-Systemen
- `plan-spectroscopic-analysis` -- geeignete Methode auswaehlen
