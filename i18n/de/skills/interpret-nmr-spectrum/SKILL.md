---
name: interpret-nmr-spectrum
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretiere 1H- und 13C-NMR-Spektren zur Strukturaufklaerung organischer
  Verbindungen durch systematische Analyse von chemischen Verschiebungen,
  Kopplungsmustern, Integralen und DEPT-Daten. Verwende diesen Skill beim
  Zuweisen von NMR-Signalen zu spezifischen Protonen oder Kohlenstoffen,
  beim Ableiten funktioneller Gruppen und Konnektivitaet aus Spektraldaten,
  beim Unterscheiden von Strukturisomeren und beim Kombinieren von NMR-Evidenz
  mit anderen Spektraldaten zur vollstaendigen Strukturbestimmung.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: advanced
  language: natural
  tags: spectroscopy, nmr, structure-elucidation, chemical-shift, coupling
---

# NMR-Spektrum interpretieren

Interpretiere 1H- und 13C-NMR-Spektren systematisch durch Analyse chemischer Verschiebungen und Referenzwerte, Entschluesseln von Kopplungsmustern und Integration von Multidimensional-NMR-Korrelationen, um die vollstaendige Protonenumgebung und Kohlenstoffgeruest der Verbindung zu bestimmen.

## Wann verwenden

- Zuweisen von 1H- oder 13C-NMR-Signalen zu spezifischen Atomen in einer vorgeschlagenen Struktur
- Ableiten von Konnektivitaet und Funktionsgruppen aus Spektraldaten, wenn die Struktur unbekannt ist
- Unterscheiden zwischen Strukturisomeren auf Basis von Spektralunterschieden
- Kombinieren von NMR mit IR-, MS- und UV-Daten fuer vollstaendige Strukturaufklaerung
- Verifizieren der Reinheit einer synthetisierten Verbindung durch Spektralvergleich

## Eingaben

- **Erforderlich**: 1H-NMR-Spektrum mit chemischen Verschiebungen (ppm), Multiplizitaeten und relativen Integralen
- **Erforderlich**: Molekuelformel oder Molmasse (fuer Berechnung des Ungesaettigtheitsgrads)
- **Optional**: 13C-NMR-Spektrum mit oder ohne DEPT-Daten
- **Optional**: 2D-NMR-Daten (COSY, HSQC, HMBC) fuer komplexe Strukturen
- **Optional**: Loesungsmittel und Temperatur der Messung

## Vorgehensweise

### Schritt 1: Molekuelformel und Ungesaettigtheitsgrad berechnen

Ermittle den Ungesaettigtheitsgrad (DoU) aus der Molekuelformel, bevor Spektren interpretiert werden:

1. **DoU-Formel**: DoU = (2C + 2 + N - H - X) / 2, wobei C = Kohlenstoffe, H = Wasserstoffe, N = Stickstoff, X = Halogene, O und S werden ignoriert.
2. **Interpretation des DoU-Werts**:
   - DoU = 0: acyclisch, keine Mehrfachbindungen
   - DoU = 1: eine Ringstruktur oder eine Doppelbindung
   - DoU = 4: Benzolring (3 Doppelbindungen + 1 Ring) oder bicyclisches System
   - DoU >= 5: aromatisches System oder mehrere ungesaettigte Einheiten

```markdown
## Ungesaettigtheitsgrad
- Molekuelformel: [Formel]
- Berechnung: DoU = (2*[C] + 2 + [N] - [H] - [X]) / 2 = [Wert]
- Interpretation: [Schlussfolgerungen ueber Ringe und Mehrfachbindungen]
```

**Erwartet:** Ein DoU-Wert der die Anzahl moeglicher Strukturmotive einschraenkt und aromatische Systeme ausschliesst oder einschliesst.

**Bei Fehler:** Falls die Molekuelformel aus anderen Spektraldaten abgeleitet werden muss, bestimme zuerst die Molmasse aus dem Massenspektrum und pruefe typische Isotopenverteilungen auf Halogene.

### Schritt 2: 1H-NMR-Signale chemischen Umgebungen zuweisen

Analysiere jeden Peak im 1H-Spektrum systematisch:

1. **Chemische Verschiebungsbereiche**:
   - 0-2 ppm: Alkylprotonen (CH3, CH2, CH) an gesaettigten Kohlenstoffen
   - 2-3 ppm: Protonen benachbart zu Carbonyl- oder Arylgruppen
   - 3-5 ppm: Protonen an sauerstofftragendem Kohlenstoff, allylische Protonen
   - 5-6 ppm: Vinylprotonen (C=C-H)
   - 6-9 ppm: Aromatische Protonen
   - 9-10 ppm: Aldehydprotonen
   - 10-13 ppm: Carbonsaure-, Phenol- oder stark chelatisierte OH-Protonen
2. **Integrale**: Relative Integrale entsprechen der Protonenanzahl. Normiere auf die kleinste eindeutige Einheit und skaliere entsprechend der Molekuelformel.
3. **Multiplizitaet und Kopplungsmuster**: Wende die n+1-Regel an fuer aequivalente benachbarte Protonen; bei komplexen Systemen zaehle alle koppelnden Partner.

```markdown
## 1H-NMR-Zuweisungen
| δ (ppm) | Multiplizitaet | Integral | J (Hz) | Zuweisung |
|---------|----------------|---------|--------|-----------|
| [ppm]   | [s/d/t/q/m]    | [zahl H]| [wert] | [Proton]  |
```

**Erwartet:** Jedes Signal ist einer Protonenkategorie zugewiesen; das Gesamtintegral stimmt mit der Molekuelformel ueberein.

**Bei Fehler:** Falls Signale ueberlappen, nutze 2D-COSY um Kopplungspartner zu identifizieren, oder aendere das Loesungsmittel um Signaltrennung zu verbessern.

### Schritt 3: 13C-Signale und DEPT interpretieren

Ordne jeden Kohlenstoffpeak seiner Hybridisierung und Substitution zu:

1. **Chemische Verschiebungsbereiche fuer 13C**:
   - 0-50 ppm: sp3-Kohlenstoffe (Alkyl)
   - 50-90 ppm: Kohlenstoffe mit elektronegativen Substituenten (C-O, C-N, C-X)
   - 100-150 ppm: sp2-Kohlenstoffe (Vinyl, Aryl) und Alkinkohlenstoffe
   - 160-220 ppm: Carbonylkohlenstoffe (Ester/Saeure ~170, Aldehyd/Keton ~200)
2. **DEPT-Analyse**:
   - DEPT-135 positiv: CH und CH3
   - DEPT-135 negativ: CH2
   - Kein Signal in DEPT aber im 13C-Breitbandentkopplungsspektrum: quaternaerer C
3. **Zaehle unterschiedliche Kohlenstoffe** und vergleiche mit der Formel. Symmetrie reduziert die Signalanzahl.

**Erwartet:** Alle Kohlenstofftypen (CH3, CH2, CH, C) identifiziert, mit Karbonil- und aromatischen Kohlenstoffen zugeordnet.

**Bei Fehler:** Falls weniger 13C-Signale als erwartet vorliegen, pruefe auf Symmetrie oder ueberlagernde Peaks. Hoeheres Magnetfeld oder DEPT-Experimente koennen helfen.

### Schritt 4: Konnektivitaet aus 2D-NMR ableiten

Nutze COSY, HSQC und HMBC um das Kohlenstoffgeruest aufzubauen:

1. **COSY (1H-1H)**: Identifiziert geminale und vicinale Protonenkopplungen. Jeder COSY-Kreuzpeak verbindet Protonen an benachbarten Kohlenstoffen.
2. **HSQC (1H-13C, one-bond)**: Korreliert jedes Proton direkt mit seinem gebundenen Kohlenstoff. Essentiell bei Signalueberdeckung.
3. **HMBC (1H-13C, long-range)**: Zeigt 2-3-Bindungskorrelationen. Entscheidend fuer quaternaere Kohlenstoffe und Konnektivitaet ueber Heteroatome.

```markdown
## 2D-NMR-Konnektivitaet
| Korrelation | Typ | Implikation |
|-------------|-----|-------------|
| H[a]-H[b] COSY | vicinal | C[a]-C[b] verbunden |
| H[x]-C[y] HMBC | 2-3 Bindungen | Geruest-Konnektivitaet |
```

**Erwartet:** Ein Konnektivitaetsdiagramm, das das vollstaendige Kohlenstoffgeruest mit Heteroatompositionen zeigt.

**Bei Fehler:** Falls HMBC-Korrelationen widerspruechen, pruefe auf Signalaliasing in der indirekten Dimension oder vergiss keine alternativen Konnektivitaeten durch Bindungsrotation.

### Schritt 5: Struktur zusammenfuehren und verifizieren

Kombiniere alle Spektralinformationen zur finalen Strukturaussage:

1. **Schreibe Teilstrukturen** aus sicheren Zuweisungen und verbinde sie.
2. **Pruefe die Konsistenz**: Stimmt jede Verschiebung mit der vorgeschlagenen Umgebung ueberein? Erklaert der DoU alle Ringstrukturen und Mehrfachbindungen?
3. **Vergleiche mit Literaturdaten** oder Spektraldatenbanken (SDBS, HMDB, NMRShiftDB).
4. **Bericht verfassen**: Dokumentiere alle Zuweisungen mit Begruendung.

**Erwartet:** Eine eindeutige Strukturformel, die alle Spektraldaten erklaert, mit vollstaendiger Zuweisung jedes Signals.

**Bei Fehler:** Falls mehrere Strukturen die Daten erklaeren, liste alle als Kandidaten auf und ermittle das diskriminierendste Experiment (z.B. NOE, spezifisches HMBC) zur Unterscheidung.

## Validierung

- [ ] DoU berechnet und mit Strukturmerkmalen abgeglichen
- [ ] Alle 1H-Signale chemischen Umgebungen zugewiesen
- [ ] Integrale stimmen mit Molekuelformel ueberein
- [ ] Alle 13C-Signale klassifiziert (CH3/CH2/CH/C)
- [ ] Konnektivitaet durch COSY/HMBC bestaetigt (falls verfuegbar)
- [ ] Vorgeschlagene Struktur erklaert alle beobachteten chemischen Verschiebungen
- [ ] Struktur mit Literaturdaten oder Datenbank verifiziert

## Haeufige Stolperfallen

- **Verwechslung von chemischer Verschiebung und Integral**: Die Position gibt die Umgebung an, das Integral die Protonenanzahl. Beide muessen konsistent mit der Formel sein.
- **Ignorieren von Loesungsmitteleffekten**: Loesungsmittelpeak (z.B. CDCl3 bei 7,26 ppm) nicht mit Probenpeaks verwechseln; OH/NH-Signale sind loesungsmittelabhaengig.
- **Fehlinterpretation komplexer Multiplizitaeten**: Bei mehr als zwei Kopplungspartnern entstehen Multipletts; nicht alle Linien entsprechen n+1-Aufspaltung.
- **Uebersehen quaternaerer Kohlenstoffe**: Diese erscheinen im 13C-Spektrum, aber nicht in DEPT. Fehlende Kohlenstoffe im DEPT deuten auf quaternaere Zentren hin.
- **Voreilige Strukturzuweisung**: Pruefe immer alle moeglichen Strukturen, nicht nur die erste plausible.

## Verwandte Skills

- `interpret-ir-spectrum` -- ergaenzende Identifizierung funktioneller Gruppen aus IR-Daten
- `interpret-mass-spectrum` -- Molekularmasse und Fragmentierungsmuster aus MS
- `plan-spectroscopic-analysis` -- Auswahl geeigneter Spektroskopiemethoden vor der Messung
