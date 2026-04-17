---
name: select-print-material
locale: de
source_locale: en
source_commit: 902f69ec
translator: claude
translation_date: "2026-03-17"
description: >
  3D-Druckmaterialien basierend auf mechanischen, thermischen und chemischen
  Anforderungen auswaehlen. Umfasst PLA, PETG, ABS, ASA, TPU, Nylon und
  Harzvarianten mit Eigenschaftsvergleichen. Anwenden bei der Materialauswahl
  fuer Teile mit spezifischen mechanischen oder thermischen Anforderungen,
  bei der Auswahl fuer Aussen- oder Chemikalienexposition, bei der Bewertung
  lebensmittelsicherer oder biokompatibler Anwendungen, beim Abwaegen von
  Druckbarkeit gegen Leistung oder bei der Fehlersuche bei materialbedingten
  Druckfehlern.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: 3d-printing
  complexity: intermediate
  language: multi
  tags: 3d-printing, materials, fdm, sla, material-selection, properties
---

# Druckmaterial auswaehlen

Geeignete 3D-Druckmaterialien auswaehlen indem Materialeigenschaften mit funktionalen Anforderungen abgeglichen werden. Dieser Skill umfasst FDM-Filamente (PLA, PETG, ABS, ASA, TPU, Nylon) und SLA-Harze (Standard, Zaeh, Flexibel, Giessbar, Hochtemperatur) mit detaillierten Eigenschaftsvergleichen fuer mechanische Festigkeit, Temperaturbestaendigkeit, Chemikalienbestaendigkeit, Flexibilitaet und Nachbearbeitungsoptionen.

## Wann verwenden

- Materialauswahl fuer ein Teil mit spezifischen mechanischen Anforderungen (Zugfestigkeit, Schlagfestigkeit, Flexibilitaet)
- Materialauswahl fuer temperaturempfindliche Anwendungen (heisse Umgebung, kalte Umgebung)
- Teile die Chemikalien, UV-Licht oder Aussenbewitterung ausgesetzt sind
- Lebensmittelsichere oder biokompatible Anwendungen
- Druckbarkeit gegen Leistung abwaegen fuer Prototypen vs. Serienteile
- Fehlersuche bei materialbedingten Druckfehlern oder Teilversagen
- Kosten-Eigenschafts-Optimierung fuer Produktionslaeufe

## Eingaben

- **functional_requirements**: Lasttyp (Zug, Druck, Biegung, Torsion), Groesse, Lastzyklus
- **environmental_conditions**: Betriebstemperaturbereich, UV-Belastung, Chemikalienkontakt, Feuchtigkeit
- **mechanical_properties_needed**: Festigkeit, Flexibilitaet, Schlagfestigkeit, Ermuedungsfestigkeit
- **surface_finish**: Oberflaechenanforderungen, geplante Nachbearbeitung
- **printability_constraints**: Druckerfaehigkeiten (Heizbett, Einhausung), Erfahrungsstufe
- **special_requirements**: Lebensmittelsicherheit, Biokompatibilitaet, elektrische Isolation, Transparenz

## Vorgehensweise

### Schritt 1: Primaere Anforderungskategorie identifizieren

Die dominierende Anforderung bestimmen die die Materialauswahl bestimmt:

**Mechanische Leistung**:
- Hohe Festigkeit unter Last
- Schlag-/Stossabsorption
- Flexibilitaet oder elastisches Verhalten
- Ermuedungsfestigkeit (wiederholte Belastung)

**Umgebungsbestaendigkeit**:
- Hoch-/Niedrigtemperaturexposition
- UV-/Aussenbewitterung
- Chemikalienbestaendigkeit (Loesungsmittel, Oele, Saeuren)
- Feuchtigkeits-/Wasserexposition

**Spezielle Anwendungen**:
- Lebensmittelkontaktsicherheit
- Biokompatibilitaet (medizinisch)
- Elektrische Eigenschaften (Isolation, Leitfaehigkeit)
- Optische Eigenschaften (Transparenz, Farbe)

**Druckbarkeit/Kosten**:
- Einfache Druckbarkeit fuer Prototypen
- Minimales Warping/Stuetzstrukturbedarf
- Niedrige Materialkosten fuer grosse Teile
- Breite Verfuegbarkeit

**Erwartet:** Primaere Anforderung identifiziert (z.B. "UV-Bestaendigkeit im Aussenbereich" oder "hohe Schlagfestigkeit").

**Bei Fehler:** Wenn mehrere Anforderungen gleich kritisch sind, Entscheidungsmatrix verwenden um Materialien ueber Anforderungen hinweg zu bewerten (siehe Schritt 6).

### Schritt 2: Materialauswahlfilter anwenden

Anforderung nutzen um Materialkandidaten zu filtern:

**Filter 1: Prozesstyp**
- FDM verfuegbar: Alle Thermoplaste (PLA, PETG, ABS, ASA, TPU, Nylon)
- SLA verfuegbar: Alle Harze (Standard, Zaeh, Flexibel, Giessbar, Hochtemperatur)
- Druckereinschraenkungen: Heizbett (60-110°C) erforderlich fuer ABS/ASA/Nylon; Einhausung erforderlich fuer ABS/ASA

**Filter 2: Temperaturbereich**
```
Betriebstemperatur -> Minimale Glasuebergangstemperatur (Tg):

< 45°C:  PLA, PLA+, Standardharz, Zaehharz
< 60°C:  PETG, Flexibles Harz
< 80°C:  ABS, ASA, CPE
< 100°C: Nylon, Polycarbonat, Hochtemperaturharz
> 100°C: PEEK, PEI (Ultem) - nur Spezialdrucker
```

**Filter 3: Mechanische Anforderungen**
```
Hohe Zugfestigkeit:     Nylon > ABS/ASA > PETG > PLA > TPU
Hohe Schlagfestigkeit:  Nylon > PETG > ABS > ASA > PLA
Flexibilitaet:          TPU > Flex. Harz > PLA (sproede)
Ermuedungsfestigkeit:   Nylon > PETG > ABS > PLA
```

**Filter 4: Umgebung**
```
UV-Bestaendigkeit:        ASA > PETG > ABS > PLA (schlecht)
Chemikalienbestaendigkeit: Nylon > PETG > ABS/ASA > PLA
Aussenbestaendigkeit:     ASA > Nylon > PETG > PLA (degradiert)
Feuchtigkeitsbestaendig.: ABS/ASA > PETG > PLA > Nylon (hygroskop.)
```

**Erwartet:** 2-5 Materialkandidaten verbleiben nach der Filterung.

**Bei Fehler:** Wenn kein Material alle Filter besteht, die am wenigsten kritische Anforderung lockern oder Nachbearbeitung in Betracht ziehen (z.B. UV-Beschichtung fuer PLA).

### Schritt 3: Materialeigenschaften vergleichen

Materialeigenschaftstabelle fuer detaillierten Vergleich konsultieren:

## FDM-Filament-Eigenschaften

| Material | Drucktemp. | Betttemp. | Zugfestigkeit | Dehnung | Tg/HDT | UV-Best. | Schwiergk. | Hygroskop. |
|----------|------------|-----------|---------------|---------|--------|----------|------------|------------|
| **PLA** | 190-220°C | 50-60°C | 50-70 MPa | 5-7% | 55-60°C | Schlecht | Leicht | Niedrig |
| **PLA+** | 200-230°C | 50-60°C | 60-75 MPa | 10-15% | 60-65°C | Schlecht | Leicht | Niedrig |
| **PETG** | 220-250°C | 70-85°C | 50-60 MPa | 15-20% | 75-80°C | Gut | Mittel | Mittel |
| **ABS** | 230-260°C | 95-110°C | 40-50 MPa | 20-40% | 95-105°C | Maessig | Schwer | Niedrig |
| **ASA** | 240-260°C | 95-110°C | 45-55 MPa | 15-30% | 95-105°C | Exzellent | Schwer | Niedrig |
| **TPU** | 210-230°C | 40-60°C | 30-50 MPa | 400-600% | 60-80°C | Gut | Mittel | Niedrig |
| **Nylon** | 240-270°C | 70-90°C | 70-80 MPa | 50-150% | 75-90°C | Exzellent | Schwer | Sehr hoch |

**Anmerkungen**:
- **Zugfestigkeit**: Hoeher = staerker unter Zuglast
- **Dehnung**: Hoeher = flexibler vor dem Bruch
- **Tg/HDT**: Glasuebergangs-/Waermeformbestaendigkeitstemperatur (max. Betriebstemperatur)
- **Schwierigkeit**: Druckschwierigkeit (Warping, Haftung, Stringing, Stuetzstrukturen)
- **Hygroskopisch**: Wasseraufnahme aus der Luft (erfordert Trockenbox-Lagerung)

## SLA-Harz-Eigenschaften

| Harztyp | Belichtung | Zugfestigkeit | Dehnung | HDT | Haerte | Am besten fuer |
|---------|-----------|---------------|---------|-----|--------|----------------|
| **Standard** | 2-4s | 45-55 MPa | 6-8% | 60-70°C | 82-85 Shore D | Miniaturen, Prototypen |
| **Zaeh** | 4-6s | 55-65 MPa | 15-25% | 70-80°C | 80-85 Shore D | Funktionsteile, Clips |
| **Flexibel** | 6-8s | 5-10 MPa | 80-120% | 50-60°C | 60-70 Shore A | Dichtungen, Griffe |
| **Hochtemp.** | 8-12s | 60-70 MPa | 6-10% | 120-150°C | 85-88 Shore D | Hitzebestaendige Teile |
| **Giessbar** | 3-5s | 35-45 MPa | 8-12% | 60°C | 80 Shore D | Schmuck (Wachsausschmelz.) |

**Erwartet:** Materialeigenschaften verglichen, 1-3 Top-Kandidaten basierend auf Anforderungen identifiziert.

**Bei Fehler:** Wenn Eigenschaften unklar, technische Datenblaetter des Herstellers ueber das WebFetch-Tool konsultieren.

### Schritt 4: Druckbarkeits-Abwaegungen bewerten

Druckschwierigkeit gegen Leistung fuer Kandidaten abwaegen:

**Druckbarkeitsfaktoren**:

**Leicht (PLA, PLA+)**:
- Minimales Warping, gute Betthaftung
- Breite Temperaturtoleranz
- Geringes Stringing, Stuetzstrukturen leicht entfernbar
- Ideal fuer Anfaenger und Prototypen
- **Abwaegung**: Niedrigere Temperaturbestaendigkeit, UV-Degradation, sproede

**Mittel (PETG, TPU)**:
- Maessiges Warping (PETG braucht 70°C+ Bett)
- Etwas Stringing (Retraction abstimmen)
- TPU erfordert Direct-Drive-Extruder, langsame Geschwindigkeiten
- Gutes Festigkeits-zu-Einfachheits-Verhaeltnis
- **Abwaegung**: PETG neigt zu Stringing, TPU schwierig bei Ueberhängen

**Schwer (ABS, ASA, Nylon)**:
- Starkes Warping ohne Einhausung
- Starke Daempfe (ABS/ASA brauchen Belueftung)
- Nylon extrem hygroskopisch (Trockenbox erforderlich)
- Hohe Betttemperaturen (95-110°C) und Kammerheizung
- **Abwaegung**: Ausgezeichnete mechanische und Umgebungseigenschaften

**Kostenerwaegungen**:
```
Materialkosten pro kg (typisch):
PLA:    15-25€
PETG:   20-30€
ABS:    18-28€
ASA:    25-35€
TPU:    30-45€
Nylon:  35-55€
Standardharz: 30-50€/L
Spezialharz:  60-150€/L
```

**Erwartet:** Druckbarkeit relativ zu Druckerfaehigkeiten und Benutzererfahrung bewertet. Entscheidung balanciert Leistungsanforderungen gegen praktische Einschraenkungen.

**Bei Fehler:** Wenn Material zu schwierig fuer aktuelles Setup, einfachere Alternative waehlen und durch Designaenderungen kompensieren (dickere Waende, Verrundungen usw.).

### Schritt 5: Spezielle Anforderungen pruefen

Materialkompatibilitaet mit speziellen Anwendungsfaellen verifizieren:

**Lebensmittelsicherheit**:
- **Sicher wenn korrekt gedruckt**: PLA, PETG (mit lebensmittelsicheren Additiven)
- **Nie lebensmittelsicher**: ABS, ASA (toxische Additive), Nylon (poroes, absorbiert Bakterien)
- **Anforderungen**: Lebensmittelsichere Duesen verwenden (Edelstahl, nicht Messing), Oberflaeche mit lebensmittelsicherem Epoxid versiegeln
- **Hinweis**: FDM-Schichtlinien fangen Bakterien ein — SLA-glattes Harz besser fuer Lebensmittelkontakt

**Biokompatibilitaet** (medizinisch/dental):
- **FDM**: Nylon (einige Grade), PLA (eingeschraenkt)
- **SLA**: Medizinische Harze (zertifiziert fuer Haut-/Gewebekontakt)
- **Warnung**: Heim-3D-Druck ist nicht steril; Vorschriften fuer Medizinprodukte beachten

**Elektrische Eigenschaften**:
- **Isolation**: PLA, PETG, ABS, ASA alle gute Isolatoren (>10^14 Ohm*m)
- **Leitfaehigkeit**: Leitfaehige Filamente verwenden (Kohlenstoff-gefuellt, Metall-gefuellt)
- **Erwaegungen**: Feuchtigkeitsaufnahme (Nylon) reduziert Isolation

**Transparenz**:
- **FDM**: Nahezu unmoeglich (Schichtlinien streuen Licht); sehr duenne Waende oder extensiv polieren
- **SLA**: Klare Harze koennen mit Nachbearbeitung Transparenz erreichen (schleifen/polieren/beschichten)

**UV-Bestaendigkeit**:
- **Exzellent**: ASA (fuer Aussenbereich konzipiert), Nylon
- **Gut**: PETG, TPU
- **Schlecht**: PLA (vergilbt und degradiert), ABS (vergilbt)

**Erwartet:** Spezielle Anforderungen gegen Materialfaehigkeiten verifiziert.

**Bei Fehler:** Wenn Material die spezielle Anforderung nicht erfuellt, Nachbearbeitung anwenden (z.B. UV-bestaendige Beschichtung auf PLA) oder anderes Material waehlen.

### Schritt 6: Endauswahl mit Entscheidungsmatrix treffen

Kandidaten ueber gewichtete Kriterien bewerten:

**Beispiel fuer funktionales Aussenteil**:

| Kriterium | Gewicht | PLA | PETG | ABS | ASA | Nylon |
|-----------|---------|-----|------|-----|-----|-------|
| UV-Bestaendigkeit | 30% | 1 | 6 | 5 | 10 | 9 |
| Festigkeit | 25% | 6 | 7 | 6 | 7 | 9 |
| Druckbarkeit | 20% | 10 | 7 | 4 | 3 | 3 |
| Temperatur | 15% | 2 | 6 | 8 | 8 | 9 |
| Kosten | 10% | 10 | 8 | 8 | 6 | 4 |
| **Gewichtete Summe** | | **5,35** | **6,80** | **5,90** | **7,25** | **7,45** |

**Bewertung**: 1 (schlecht) bis 10 (ausgezeichnet)

**Entscheidung**: Nylon erzielt die hoechste Punktzahl (7,45) aber ASA (7,25) nahezu gleichauf mit besserer Druckbarkeit. **ASA waehlen** wenn der Drucker eine Einhausung hat, oder **PETG** (6,80) wenn Druckbarkeit wichtig ist.

**Erwartet:** Endgueltiges Material mit dokumentierter Begruendung basierend auf gewichteten Prioritaeten ausgewaehlt.

**Bei Fehler:** Wenn die Entscheidung unklar ist, Standardwahl PETG fuer FDM oder Zaehharz fuer SLA (beste Allround-Kompromisse).

### Schritt 7: Materialeinstellungen dokumentieren

Materialspezifische Druckeinstellungen fuer kuenftigen Gebrauch festhalten:

**FDM-Einstellungsvorlage**:
```yaml
material: PETG
brand: "PolyMaker PolyLite"
color: "Blue"
nozzle_temp: 245°C
bed_temp: 80°C
chamber_temp: ambient
print_speed: 50mm/s
retraction_distance: 4.5mm
retraction_speed: 40mm/s
cooling: 50% (after layer 3)
notes: "Maessiges Stringing, Z-hop hilft. 6h bei 65°C getrocknet."
```

**SLA-Einstellungsvorlage**:
```yaml
resin: "Anycubic Tough Resin"
color: "Clear"
layer_height: 0.05mm
exposure_time: 6s
bottom_exposure: 40s
lift_distance: 6mm
lift_speed: 65mm/min
notes: "Nachhaerten 15min bei 60°C fuer volle Festigkeit. Ohne Haertung sproede."
```

**Erwartet:** Einstellungen in Projektnotizen oder Slicer-Profilbibliothek dokumentiert.

**Bei Fehler:** Mit den vom Hersteller empfohlenen Einstellungen beginnen, dann iterieren und erfolgreiche Aenderungen dokumentieren.

## Validierung

- [ ] Primaere funktionale Anforderung identifiziert (mechanisch, Umgebung, speziell)
- [ ] Materialkandidaten nach Prozess, Temperatur und Anforderungen gefiltert
- [ ] Materialeigenschaften ueber Referenztabelle oder Herstellerdatenblaetter verglichen
- [ ] Druckbarkeit relativ zu Druckerfaehigkeiten bewertet (Betttemperatur, Einhausung, Belueftung)
- [ ] Spezielle Anforderungen geprueft (Lebensmittelsicherheit, UV-Bestaendigkeit, Transparenz usw.)
- [ ] Endauswahl mit Entscheidungsmatrix und gewichteten Prioritaeten getroffen
- [ ] Materialspezifische Druckeinstellungen fuer Reproduzierbarkeit dokumentiert
- [ ] Kosten und Verfuegbarkeit fuer geplante Menge verifiziert

## Haeufige Stolperfallen

1. **PLA fuer alles waehlen**: PLA ist einfach aber ungeeignet fuer Temperaturen >50°C, Ausseneinsatz oder langfristige Haltbarkeit
2. **Hygroskopie ignorieren**: Nylon und TPU absorbieren Feuchtigkeit aus der Luft, was Blasenbildung, schlechte Haftung und Sproedie verursacht — Trockenbox verwenden
3. **ABS ohne Einhausung**: ABS warpt stark ohne beheizte Kammer; ASA etwas besser aber braucht ebenfalls Einhausung
4. **Lebensmittelsicherheit voraussetzen**: FDM-Teile sind poroes und fangen Bakterien ein; echte Lebensmittelsicherheit erfordert Versiegelung oder SLA-glattes Harz
5. **Festigkeit ueberentwerfen**: Teures Nylon verwenden wenn PETG ausreicht; Ueberdimensionierung verschwendet Geld und erhoeht Druckschwierigkeit
6. **Temperatur unterschaetzen**: Teile in der Naehe von Motoren, Heizbetten oder in Autos erreichen 60°C+ wo PLA erweicht
7. **UV-Exposition vernachlaessigen**: PLA und ABS vergilben und degradieren im Sonnenlicht innerhalb von Monaten; ASA verwenden oder mit UV-bestaendigem Finish beschichten
8. **Nasses Filament drucken**: Feuchtigkeit verursacht Dampfblasen im Extruder, schwache Schichthaftung, Stringing — hygroskopische Materialien immer trocknen
9. **Daempfe ignorieren**: ABS und ASA emittieren Styrolddaempfe; erfordert aktive Belueftung (nicht nur offenes Fenster)
10. **Harzhandhabung**: Ungehaertetes Harz ist Hautsensibilisator und toxisch; immer Handschuhe tragen und in belueftetem Bereich arbeiten

## Verwandte Skills

- `prepare-print-model` — Slicer-Einstellungen fuer gewaehltes Material konfigurieren
- `troubleshoot-print-issues` — Materialbedingte Druckfehler beheben (Stringing, Warping, Haftung)
