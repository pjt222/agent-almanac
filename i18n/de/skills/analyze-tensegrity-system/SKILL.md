---
name: analyze-tensegrity-system
description: >
  Analyze a tensegrity system by identifying compression struts and tension
  cables, classifying type (class 1/2, biological/architectural), computing
  prestress equilibrium, verifying stability via Maxwell's rigidity criterion,
  and mapping biological tensegrity (microtubules, actin, intermediate
  filaments). Use when evaluating tensegrity in architecture, robotics,
  cell biology, or any system with isolated compression in continuous tension.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tensegrity
  complexity: advanced
  language: natural
  tags: tensegrity, structural-integrity, prestress, biomechanics, cytoskeleton, force-balance
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Tensegrity-System analysieren

Ein Tensegrity-System (Tensional Integrity) analysieren -- eine Struktur in der isolierte Druckelemente (Streben) durch ein kontinuierliches Zugnetz (Seile/Sehnen) stabilisiert werden. Die Kraftbalance, das Vorspannungs-Gleichgewicht, die strukturelle Stabilitaet und die skalenuebergreifende Kohaerenz vom molekularen Zytoskelett bis zur architektonischen Form bestimmen.

## Wann verwenden

- Bewerten ob eine Struktur echtes Tensegrity (Druck-Zug-Trennung) zeigt oder ein konventioneller Rahmen ist
- Strukturelle Stabilitaet eines Tensegrity-Designs in Architektur, Robotik oder entfaltbaren Strukturen analysieren
- Donald Ingbers zellulaeres Tensegrity-Modell auf Zytoskelett-Mechanik (Mikrotubuli, Actin, Intermediaerfilamente) anwenden
- Belastungskapazitaet und Versagensmodi eines existierenden Tensegrity-Systems einschaetzen
- Bestimmen ob eine biologische Struktur (Zelle, Gewebe, muskuloskelettales System) als Tensegrity modelliert werden kann
- Vorspannungsanforderungen fuer ein Tensegrity berechnen um Steifheit zu erreichen trotz mehr Mechanismen als ein konventionelles Fachwerk

## Eingaben

- **Erforderlich**: Beschreibung des Systems (physische Struktur, biologische Zelle, architektonisches Modell oder Robotermechanismus)
- **Erforderlich**: Identifikation von Kandidaten-Druck- und Zugelementen
- **Optional**: Materialeigenschaften (Young'scher Modul, Querschnitt, Laenge fuer jedes Element)
- **Optional**: Externe Lasten und Randbedingungen
- **Optional**: Skalierung von Interesse (molekular, zellulaer, Gewebe, architektonisch)
- **Optional**: Bekannte Topologie-Familie (Prisma, Oktaeder, Ikosaeder, X-Modul)

## Vorgehensweise

### Schritt 1: Das System charakterisieren

Die vollstaendige physische Beschreibung etablieren indem jedes Druckelement (Strebe) und Zugelement (Seil), ihre Konnektivitaet und die Randbedingungen identifiziert werden.

1. **Druck-Inventar**: Alle Streben auflisten -- starre Elemente die Druck widerstehen. Laenge, Querschnitt, Material und Young'schen Modul jeder Strebe aufzeichnen. In biologischen Systemen Mikrotubuli identifizieren (hohle Zylinder, ~25 nm Aussendurchmesser, 14 nm Innendurchmesser, E ~ 1,2 GPa, Persistenzlaenge ~ 5 mm).
2. **Zug-Inventar**: Alle Seile auflisten -- Elemente die nur Zug widerstehen und unter Druck schlaff werden. Ruhelaenge, Querschnittsflaeche und Zugsteifheit aufzeichnen. In biologischen Systemen: Actin-Filamente (helikal, ~7 nm Durchmesser, E ~ 2,6 GPa, Persistenzlaenge ~ 17 um) und Intermediaerfilamente (IFs, ~10 nm Durchmesser, hochdehnbar, dehnungsversteifend).
3. **Konnektivitaets-Topologie**: Dokumentieren welche Streben mit welchen Seilen an welchen Knoten (Gelenken) verbinden. Die Inzidenzmatrix C konstruieren (Zeilen = Mitglieder, Spalten = Knoten) die die Topologie kodiert.
4. **Randbedingungen**: Fixe Knoten (geerdete Gelenke), freie Knoten und externe Lasten identifizieren. Gravitationsbelastungsrichtung und -groesse vermerken.
5. **Skalen-Identifikation**: Klassifizieren als molekular (nm), zellulaer (um), architektonisch (m) oder robotisch (cm-m).

```markdown
## System Characterization
| ID | Type  | Length   | Cross-section | Material       | Stiffness     |
|----|-------|----------|---------------|----------------|---------------|
| S1 | strut | [value]  | [value]       | [material]     | E = [value]   |
| C1 | cable | [value]  | [value]       | [material]     | EA = [value]  |
- **Nodes**: [count], [fixed vs. free]
- **Scale**: [molecular / cellular / architectural / robotic]
- **Boundary conditions**: [description]
```

**Erwartet:** Ein vollstaendiges Inventar aller Druck- und Zugelemente mit Materialeigenschaften, eine Inzidenzmatrix und Randbedingungen die ausreichen um die Gleichgewichtsgleichungen aufzustellen.

**Bei Fehler:** Wenn Element-Eigenschaften unbekannt sind (haeufig in biologischen Systemen), publizierte Werte verwenden: Mikrotubuli (E ~ 1,2 GPa, Persistenzlaenge ~ 5 mm), Actin (E ~ 2,6 GPa, Persistenzlaenge ~ 17 um), Intermediaerfilamente (hoch nichtlinear, dehnungsversteifend mit niedrigem Anfangsmodul ~1 MPa steigend auf ~1 GPa bei hoher Dehnung). Wenn Konnektivitaet unklar ist, das System auf die einfachste Topologie reduzieren die die wesentlichen Kraftpfade erfasst.

### Schritt 2: Den Tensegrity-Typ klassifizieren

Bestimmen welcher Klasse Tensegrity das System angehoert und ob es biologisch oder konstruiert ist.

1. **Klassen-Bestimmung**:
   - **Klasse 1**: Streben beruehren einander nicht -- alle Streben sind isoliert, nur durch das Zugnetz verbunden. Die meisten Fuller-/Snelson-Strukturen sind Klasse 1.
   - **Klasse 2**: Streben koennen an gemeinsamen Knoten kontaktieren. Viele biologische Systeme sind Klasse 2 (Mikrotubuli teilen Zentrosom-Anheftungspunkte).
2. **Topologie-Identifikation**: b = gesamte Mitglieder zaehlen (Streben + Seile), j = Knoten. Identifizieren ob die Topologie zu einer bekannten Familie passt: Tensegrity-Prisma (3-Streben, 6-Seile triangulares Antiprisma), expandiertes Oktaeder (6-Streben, 24-Seile), ikosaedrische Tensegrity (30-Streben, 90-Seile) oder X-Modul (basische 2D-Einheitszelle).
3. **Biologisch vs. konstruiert**: Biologisches Tensegrity hat spezifische Merkmale: Druckelemente sind diskret und steif (Mikrotubuli), Zugnetz ist kontinuierlich (Actin-Cortex + IFs), Vorspannung wird aktiv erzeugt (Aktomyosin-Kontraktilitaet via ATP-Hydrolyse) und das System zeigt Mechanotransduktion (Kraft-zu-Signal-Umwandlung). Dokumentieren welche Merkmale vorhanden sind.
4. **Dimension**: Klassifizieren als 2D (planar) oder 3D.

```markdown
## Tensegrity Classification
- **Class**: [1 (isolated struts) / 2 (strut-strut contact)]
- **Dimension**: [2D / 3D]
- **Topology**: [prism / octahedron / icosahedron / X-module / irregular]
- **Category**: [biological / architectural / robotic / artistic]
- **b** (members): [value], **j** (nodes): [value]

### Biological Tensegrity Mapping (if applicable)
| Cell Component          | Tensegrity Role       | Key Properties                              |
|-------------------------|-----------------------|---------------------------------------------|
| Microtubules            | Compression struts    | 25 nm OD, E~1.2 GPa, dynamic instability    |
| Actin filaments         | Tension cables        | 7 nm, cortical network, actomyosin contract. |
| Intermediate filaments  | Deep tension/prestress| 10 nm, strain-stiffening, nucleus-to-membrane|
| Extracellular matrix    | External anchor       | Collagen/fibronectin, integrin attachment     |
| Focal adhesions         | Ground nodes          | Mechanosensitive, connect cytoskeleton to ECM |
| Nucleus                 | Internal compression  | Lamina network forms sub-tensegrity           |
```

**Erwartet:** Eine klare Klassifikation (Klasse, Dimension, Kategorie) mit der biologischen Mapping-Tabelle vervollstaendigt fuer biologische Systeme. Fuer konstruierte Systeme ist die Topologie-Familie identifiziert.

**Bei Fehler:** Wenn das System nicht sauber zu Klasse 1 oder Klasse 2 passt, kann es ein Hybrid oder ein konventioneller Rahmen sein. Ein echtes Tensegrity erfordert dass mindestens einige Elemente nur unter Zug arbeiten (Seile die unter Druck schlaff werden). Wenn keine Elemente nur-Zug sind, ist das System kein Tensegrity -- als konventionelles Fachwerk oder Rahmen reklassifizieren und Standard-Strukturanalyse anwenden.

### Schritt 3: Kraftbalance und Vorspannungs-Gleichgewicht analysieren

Statisches Gleichgewicht an jedem Knoten berechnen, den Vorspannungszustand bestimmen (interner Zug/Druck ohne externe Last) und verifizieren dass alle Seile unter Zug bleiben.

1. **Gleichgewichtsmatrix konstruieren**: Fuer b Mitglieder und j Knoten in d Dimensionen die Gleichgewichtsmatrix A (Groesse dj x b) bauen. Jede Spalte kodiert die Richtungskosinusse des Kraftbeitrags eines Mitglieds an seinen zwei Endknoten. Die Gleichgewichtsgleichung ist A * t = f_ext, wobei t der Vektor der Mitglied-Kraftdichten (Kraft/Laenge) und f_ext der externe Lastvektor ist.
2. **Self-Stress loesen**: Mit f_ext = 0 den Nullraum von A finden. Jeder Basisvektor von null(A) ist ein Self-Stress-Zustand -- interne Kraefte die Gleichgewicht ohne externe Last erfuellen. Die Anzahl unabhaengiger Self-Stress-Zustaende ist s = b - rank(A).
3. **Seil-Zug verifizieren**: In jedem gueltigen Tensegrity-Self-Stress muessen alle Seile positive Kraftdichte (Zug) und alle Streben negative Kraftdichte (Druck) haben. Ein Self-Stress der ein Seil unter Druck setzt ist nicht physikalisch realisierbar (das Seil wuerde schlaff werden).
4. **Vorspannungsniveau berechnen**: Die tatsaechliche Vorspannung ist eine Linearkombination von Self-Stress-Basisvektoren so gewaehlt dass alle Seil-Zugkraefte positiv sind. Die minimale Seil-Zugkraft t_min aufzeichnen (die Marge bevor ein Seil schlaff wird).
5. **Belastungskapazitaet**: Externe Lasten hinzufuegen und A * t = f_ext loesen. Die Last bei der die erste Seil-Zugkraft Null erreicht ist die kritische Last F_crit.

```markdown
## Prestress Equilibrium
- **Equilibrium matrix A**: [dj] x [b] = [size]
- **Rank of A**: [value]
- **Self-stress states (s)**: s = b - rank(A) = [value]
- **Self-stress feasibility**: [all cables in tension? Yes/No]
- **Minimum cable tension**: t_min = [value]
- **Critical external load**: F_crit = [value]

| Member | Type  | Force Density | Force   | Status      |
|--------|-------|---------------|---------|-------------|
| S1     | strut | [negative]    | [value] | compression |
| C1     | cable | [positive]    | [value] | tension     |
```

**Erwartet:** Self-Stress-Zustaende werden berechnet, eine physikalisch realisierbare Vorspannung (alle Seile unter Zug, alle Streben unter Druck) wird gefunden und die Belastungskapazitaet wird geschaetzt.

**Bei Fehler:** Wenn kein Self-Stress-Zustand alle Seile unter Zug haelt, unterstuetzt die Topologie keine Tensegrity-Vorspannung. Entweder (a) die Inzidenzmatrix hat Fehler, (b) das System braucht zusaetzliche Seile, oder (c) es ist ein Mechanismus statt eines Tensegrity. Fuer grosse Systeme die Force-Density-Methode (Schek, 1974) oder numerische Nullraum-Berechnung statt Handrechnung verwenden.

### Schritt 4: Stabilitaet mit Maxwells Kriterium pruefen

Bestimmen ob das Tensegrity steif ist (stabil gegen infinitesimale Stoerungen) oder ein Mechanismus (hat Null-Energie-Deformationsmoden).

1. **Erweiterte Maxwell-Regel anwenden**: Fuer ein punktverbundenes Tragwerk in d Dimensionen mit b Staeben, j Knoten, k kinematischen Beschraenkungen (Lager), s Self-Stress-Zustaenden und m infinitesimalen Mechanismen:

   **b - dj + k + s = m**

   Dies setzt Staebe, Gelenke und Beschraenkungen in Beziehung zur Balance zwischen Self-Stress- und Mechanismus-Zustaenden.

2. **Aus der Gleichgewichtsmatrix berechnen**: rank(A) = b - s. Die Anzahl der Mechanismen ist m = dj - k - rank(A). Wenn m = 0, ist die Struktur erstordnungssteif. Wenn m > 0, muss Vorspannungsstabilitaet geprueft werden.
3. **Vorspannungs-Stabilitaetstest**: Fuer jeden Mechanismusmodus q die Energie zweiter Ordnung E_2 = q^T * G * q berechnen, wobei G die geometrische Steifigkeitsmatrix (Spannungsmatrix) ist. Wenn E_2 > 0 fuer alle Mechanismusmoden, ist das Tensegrity vorspannungsstabil (Connelly und Whiteley, 1996). So erreicht Tensegrity Steifheit -- nicht durch Stabanzahl, sondern durch Vorspannungsstabilisierung von Mechanismen.
4. **Steifheit klassifizieren**:
   - **Kinematisch determiniert**: m = 0, s = 0 (selten fuer Tensegrity)
   - **Statisch unbestimmt und steif**: m = 0, s > 0
   - **Vorspannungsstabil**: m > 0, aber alle Mechanismen durch Vorspannung stabilisiert
   - **Mechanismus**: m > 0, nicht stabilisiert (Struktur kann sich verformen)

```markdown
## Stability Analysis (Maxwell's Criterion)
- **Bars (b)**: [value]
- **Joints (j)**: [value]
- **Dimension (d)**: [2 or 3]
- **Kinematic constraints (k)**: [value]
- **Rank of A**: [value]
- **Self-stress states (s)**: [value]
- **Mechanisms (m)**: [value]
- **Maxwell check**: b - dj + k + s = m --> [values]
- **Prestress stability**: [stable / unstable / N/A]
- **Rigidity class**: [determinate / indeterminate / prestress-stable / mechanism]
```

**Erwartet:** Maxwell-Zaehlung durchgefuehrt, Mechanismen bestimmt und fuer m > 0 Vorspannungsstabilitaet evaluiert. Die Struktur ist als steif, vorspannungsstabil oder Mechanismus klassifiziert.

**Bei Fehler:** Wenn die Struktur ein Mechanismus ist (m > 0 und nicht vorspannungsstabil), Optionen: (a) Seile hinzufuegen um b zu erhoehen und m zu reduzieren, (b) Vorspannung erhoehen, (c) Topologie modifizieren. In biologischen Systemen passt aktive Aktomyosin-Kontraktilitaet kontinuierlich Vorspannung an um Stabilitaet zu erhalten -- die Zelle ist ein selbstabstimmendes Tensegrity.

### Schritt 5: Biologisches Tensegrity abbilden (skalenuebergreifende Analyse)

Wenn das System eine biologische Interpretation hat, die Analyse auf Ingbers zellulaeres Tensegrity-Modell abbilden und skalenuebergreifende Kohaerenz pruefen. Diesen Schritt fuer rein konstruierte Systeme ueberspringen.

1. **Molekulare Skala (nm)**: Proteinfilamente als Tensegrity-Elemente identifizieren. Mikrotubuli (alpha/beta-Tubulin-Heterodimere, GTP-abhaengige Polymerisation, dynamische Instabilitaet mit Katastrophe/Rettung). Actin (G-Actin → F-Actin-Polymerisation, Treadmilling). Intermediaerfilamente (typabhaengig: Vimentin, Keratin, Desmin, nukleare Lamine).
2. **Zellulaere Skala (um)**: Das Ganzzell-Tensegrity abbilden. Actin-Cortex = kontinuierliche Zughuelle. Mikrotubuli vom Zentrosom ausstrahlend = Druckstreben gegen Cortex. IFs = sekundaerer Zugpfad der Kern mit Fokaladhesionen verbindet. Aktomyosin-Kontraktilitaet (Myosin-II-Motorproteine) = aktiver Vorspannungserzeuger.
3. **Gewebe-Skala (mm-cm)**: Zellen formen ein hoehergeordnetes Tensegrity. Jede Zelle wirkt als druckaufnehmendes Element, verbunden durch kontinuierliches EZM-Zugnetz (Kollagen, Elastin). Zell-Zell-Junktionen (Cadherine) und Zell-EZM-Junktionen (Integrine) dienen als Knoten.
4. **Skalenuebergreifende Kohaerenz**: Verifizieren dass Stoerung an einer Skala sich zu anderen ausbreitet. Externe Kraft an EZM uebertraegt durch Integrine zu Zytoskelett zu Kern -- dieser Mechanotransduktionspfad ist die Signatur von skalenuebergreifendem Tensegrity.

```markdown
## Cross-Scale Biological Tensegrity
| Scale      | Compression        | Tension              | Prestress Source      | Nodes              |
|------------|--------------------|----------------------|-----------------------|--------------------|
| Molecular  | Tubulin dimers     | Actin/IF subunits    | ATP/GTP hydrolysis    | Protein complexes  |
| Cellular   | Microtubules       | Actin cortex + IFs   | Actomyosin            | Focal adhesions    |
| Tissue     | Cells (turgor)     | ECM (collagen)       | Cell contractility    | Cell-ECM junctions |
| Organ      | Bones              | Muscles + fascia     | Muscle tone           | Joints             |

### Mechanotransduction Pathway
ECM --> integrin --> focal adhesion --> actin cortex --> IF --> nuclear lamina --> chromatin
```

**Erwartet:** Biologisches Tensegrity an jeder relevanten Skala abgebildet mit Druck, Zug, Vorspannungsquelle und identifizierten Knoten. Skalenuebergreifende Kraftuebertragung dokumentiert.

**Bei Fehler:** Wenn das skalenuebergreifende Mapping bricht (keine klare Zugkontinuitaet zwischen Skalen), die Luecke dokumentieren. Nicht alle biologischen Strukturen sind Tensegrity an allen Skalen. Die Wirbelsaeule ist Tensegrity auf muskuloskelettaler Ebene (Knochen=Streben, Muskeln/Faszien=Seile) aber individuelle Wirbel sind intern konventionelle Druckstrukturen.

### Schritt 6: Analyse synthetisieren und strukturelle Integritaet bewerten

Alle vorangegangenen Analysen zu einer abschliessenden Bewertung der tensionalen Integritaet des Systems kombinieren.

1. **Kraftbalance-Zusammenfassung**: Angeben ob Vorspannungs-Gleichgewicht erreicht ist, die Steifheits-Klassifikation und die Belastungskapazitaets-Marge.
2. **Verwundbarkeits-Analyse**: Das kritische Mitglied identifizieren -- das Seil dessen Versagen den groessten Integritaetsverlust verursacht (hoechste Kraftdichte relativ zu Festigkeit) und die Strebe deren Knicken Zusammenbruch verursachen wuerde (gegen Euler-Knicken pruefen: P_cr = pi^2 * EI / L^2).
3. **Redundanz-Bewertung**: Wie viele Seile koennen entfernt werden bevor s auf 0 faellt? Wie viele bevor das System ein nicht stabilisierter Mechanismus wird?
4. **Design-Empfehlungen** (konstruierte Systeme): Seil-Vorspannungsniveaus, Streben-Dimensionierung, Topologie-Modifikationen fuer verbesserte Margen.
5. **Biologische Implikationen** (biologische Systeme): Auf Pathophysiologie beziehen -- reduzierte Mikrotubuli-Stabilitaet (Colchicin/Taxol), gestoerte IF-Netze (Laminopathien), veraenderte Vorspannung (Krebszell-Mechanik mit erhoehter Kontraktilitaet).
6. **Integritaets-Bewertung**:
   - **ROBUST**: s >= 2, alle Seile gut ueber Schlaff-Schwellwert, kritisches Mitglied-Versagen verursacht keinen Zusammenbruch
   - **MARGINAL**: s = 1 oder minimale Seil-Zugkraft nahe Null unter erwarteten Lasten
   - **FRAGIL**: s = 0, oder kritisches Mitglied-Versagen verursacht System-Zusammenbruch

```markdown
## Structural Integrity Assessment
- **Prestress equilibrium**: [achieved / not achieved]
- **Rigidity**: [determinate / indeterminate / prestress-stable / mechanism]
- **Load capacity margin**: [value or qualitative]
- **Critical member**: [ID] -- failure causes [consequence]
- **Redundancy**: [cables removable before mechanism]
- **Integrity rating**: [ROBUST / MARGINAL / FRAGILE]

### Recommendations
1. [specific recommendation]
2. [specific recommendation]
3. [specific recommendation]
```

**Erwartet:** Vollstaendige strukturelle Integritaets-Bewertung mit Steifheits-Klassifikation, Verwundbarkeits-Identifikation, Redundanz-Analyse und Integritaets-Bewertung (ROBUST/MARGINAL/FRAGIL) mit umsetzbaren Empfehlungen.

**Bei Fehler:** Wenn die Analyse unvollstaendig ist (Gleichgewichtsmatrix zu gross, biologische Parameter unbekannt), die Bewertung als bedingt angeben: "MARGINAL bis numerische Verifikation" oder "Klassifikation erfordert experimentelle Messung des Vorspannungsniveaus." Partielle Bewertung mit expliziten Luecken ist wertvoller als keine Bewertung.

## Validierung

- [ ] Alle Druckelemente (Streben) und Zugelemente (Seile) sind mit Eigenschaften inventarisiert
- [ ] Konnektivitaets-Topologie ist dokumentiert (Inzidenzmatrix oder Aequivalent)
- [ ] Tensegrity-Klasse (1 oder 2) ist basierend auf Streben-Kontakt bestimmt
- [ ] Gleichgewichtsmatrix ist konstruiert und Rang berechnet
- [ ] Mindestens ein Self-Stress-Zustand ist mit allen Seilen unter Zug gefunden
- [ ] Maxwells erweiterte Regel ist angewendet: b - dj + k + s = m
- [ ] Infinitesimale Mechanismen (falls vorhanden) sind auf Vorspannungsstabilitaet geprueft
- [ ] Steifheits-Klassifikation ist zugewiesen
- [ ] Fuer biologische Systeme ist die skalenuebergreifende Mapping-Tabelle vervollstaendigt
- [ ] Strukturelle Integritaet ist als ROBUST, MARGINAL oder FRAGIL mit Begruendung bewertet

## Haeufige Stolperfallen

- **Tensegrity mit konventionellen Fachwerken verwechseln**: Ein Tensegrity erfordert dass einige Elemente nur unter Zug arbeiten (sie werden unter Druck schlaff). Wenn alle Elemente sowohl Zug als auch Druck tragen koennen, ist es ein konventioneller Rahmen, kein Tensegrity. Die Einbahn-Natur der Seile schafft die Nichtlinearitaet die Vorspannung fuer Stabilitaet erfordert.
- **Vorspannung in Stabilitaetsanalyse ignorieren**: Ein nicht vorgespanntes Tensegrity ist immer ein Mechanismus -- Seile in Ruhelaenge bieten keine Steifheit. Maxwells Zaehlung allein ergibt oft m > 0 fuer Tensegrity, was Instabilitaet vermuten laesst. Der Vorspannungs-Stabilitaetstest (Schritt 4) ist essenziell: Vorspannung macht Tensegrity steif.
- **Biologisches Tensegrity als statisch behandeln**: Zellulaeres Tensegrity wird aktiv durch ATP-abhaengige Myosin-II-Motoren gehalten die Kontraktilitaet auf Actin erzeugen. Die Vorspannung ist dynamisch, nicht fix. Statische Analyse erfasst das Strukturprinzip aber verfehlt aktive Regulation. Immer vermerken ob Vorspannung passiv (Seil-Vorspannung) oder aktiv (motor-erzeugt) ist.
- **Maxwells Regel ohne Beruecksichtigung von Seil-Erschlaffung anwenden**: Maxwells Regel nimmt an dass alle Mitglieder aktiv sind. Externe Lasten die Seile schlaff werden lassen reduzieren die effektive b und veraendern die Stabilitaetsberechnung. Verfolgen welche Seile unter jedem Lastfall straff bleiben.
- **Snelsons Skulpturen mit Ingbers Zellmodell verbinden**: Snelsons kuenstlerische Tensegrities verwenden starre Metallstreben und Stahlseile. Ingbers zellulaeres Tensegrity zeigt viskoelastische Elemente, aktive Regulation und dynamische Instabilitaet von Druckelementen (Mikrotubuli-Katastrophe). Das Strukturprinzip ist dasselbe; das Materialverhalten ist fundamental anders.
- **Streben-Knicken vernachlaessigen**: Tensegrity-Analyse behandelt Streben als starr. Schlanke Streben koennen knicken (Euler: P_cr = pi^2 * EI / L^2). Wenn die Druckkraft sich der Knicklast naehert, scheitert die Starre-Streben-Annahme und die tatsaechliche Belastungskapazitaet ist niedriger als vorhergesagt.

## Verwandte Skills

- `assess-form` -- Struktur-Inventar und Transformations-Bereitschaft; assess-form bewertet die Form eines Systems generisch, waehrend dieser Skill den spezifischen Tensegrity-Rahmen der Druck-Zug-Zerlegung anwendet
- `adapt-architecture` -- architektonische Metamorphose; Tensegrity-Analyse identifiziert ob Integritaet von Zugkontinuitaet abhaengt und informiert welche Elemente waehrend Transformation sicher modifiziert werden koennen
- `repair-damage` -- regenerative Wiederherstellung; in Tensegrity haben Seil-Versagen und Streben-Versagen unterschiedliche Konsequenzen, und die kritische Mitglied-Analyse (Schritt 6) informiert direkt die Reparatur-Prioritaet
- `center` -- dynamische Argumentationsbalance; Tensegritys Prinzip der Stabilitaet durch ausgeglichene Spannung (nicht starren Druck) ist die strukturelle Metapher die dem Zentrieren zugrunde liegt
- `integrate-gestalt` -- Spannungs-Resonanz-Mapping in Gestalt-Integration spiegelt Druck-Zug-Dualitaet; beide finden Kohaerenz durch produktives Zusammenspiel entgegengesetzter Kraefte
- `analyze-magnetic-levitation` -- Schwester-Analyse-Skill der dasselbe Strenge-Muster teilt (charakterisieren, klassifizieren, Stabilitaet verifizieren); Levitation erreicht kontaktlose Kraftbalance, Tensegrity erreicht kontaktbasierte Kraftbalance durch Zugkontinuitaet
- `construct-geometric-figure` -- geometrische Konstruktion von Tensegrity-Knotenpositionen; die geometrische Figur liefert die Anfangstopologie die Tensegrity-Analyse dann auf Stabilitaet verifiziert
