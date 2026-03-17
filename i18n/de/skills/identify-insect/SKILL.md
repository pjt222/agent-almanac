---
name: identify-insect
description: >
  Insekten anhand von Koerperplananalyse, dichotomen Bestimmungsschluesseln
  bis zur Ordnung, Fluegelvenenation, Mundwerkzeugtyp, Antennenform, Bein-
  und Tarsalstruktur sowie Konfidenzgraden identifizieren. Umfasst die
  grundlegende Hexapoden-Koerperplan-Verifizierung, einen vereinfachten
  dichotomen Schluessel zu den wichtigsten Ordnungen, Fluegeladerungs- und
  Typanalyse, Mundwerkzeug-Klassifikation, Antennenmorphologie,
  Beinspezialisierung und Tarsalformel sowie ein strukturiertes
  Konfidenzbewertungs-Rahmenwerk. Verwenden wenn ein unbekanntes Insekt
  ueber die vorlaefige Ordnungszuordnung hinaus identifiziert werden muss,
  ein Exemplar fuer taxonomische Studien bearbeitet wird, aehnliche
  Ordnungen oder Familien unterschieden werden sollen oder einem
  Feldbestimmung ein Konfidenzgrad zugewiesen werden muss.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: intermediate
  language: natural
  tags: entomology, insects, identification, taxonomy, dichotomous-key, morphology
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Insekt identifizieren

Insekten anhand systematischer morphologischer Untersuchung, dichotomer Bestimmungsschluessel und strukturierter Konfidenzbewertung identifizieren.

## Wann verwenden

- Sie haben ein unbekanntes Insekt (lebend, fotografiert oder konserviert) und muessen es identifizieren
- Sie moechten ueber die Ordnungszuordnung hinaus zur Familie oder Gattung gelangen
- Sie bearbeiten eine Exemplarsammlung und benoetigen konsistente Bestimmungsmethoden
- Sie muessen visuell aehnliche Ordnungen oder Familien unterscheiden
- Sie unterrichten oder erlernen Insektenbestimmung und wuenschen einen strukturierten Ansatz

## Eingaben

- **Erforderlich**: Ein Insektenexemplar oder eine klare Beobachtung (lebend, fotografiert oder konserviert)
- **Erforderlich**: Faehigkeit zur Untersuchung feiner morphologischer Details (Fluegel, Mundwerkzeuge, Antennen, Beine)
- **Optional**: Handlupe (10x) oder Binokularmikroskop fuer Feindetails
- **Optional**: Entomologischer Feldfuehrer oder dichotomer Bestimmungsschluessel fuer die Region
- **Optional**: Pinzette und Nadeln zur Manipulation konservierter Exemplare
- **Optional**: Fotos aus mehreren Winkeln (dorsal, lateral, ventral, frontal)

## Vorgehensweise

### Schritt 1: Den grundlegenden Koerperplan verifizieren

Bestaetigen, dass es sich um ein Insekt und nicht um einen anderen Arthropoden handelt. Dieser Schritt verhindert Fehlbestimmungen auf der grundlegendsten Ebene.

```
Arthropod Verification:
+--------------------+------------------------------------------+
| Feature            | Insect (Class Insecta)                   |
+--------------------+------------------------------------------+
| Legs               | Exactly 6 (3 pairs), attached to thorax  |
+--------------------+------------------------------------------+
| Body regions       | 3 distinct: head, thorax, abdomen        |
+--------------------+------------------------------------------+
| Antennae           | 1 pair on the head                       |
+--------------------+------------------------------------------+
| Eyes               | Typically 2 compound eyes + 0-3 ocelli   |
+--------------------+------------------------------------------+
| Wings              | 0, 2, or 4 (attached to thorax)          |
+--------------------+------------------------------------------+

Not an insect if:
- 8 legs → Arachnida (spiders, scorpions, ticks, mites)
- 10+ legs → Crustacea (isopods, amphipods) or Myriapoda
- No distinct head → likely a mite or tick
- 2 pairs antennae → Crustacea
- No antennae → Arachnida
```

**Erwartet:** Bestaetigung, dass der Organismus ein Insekt mit 6 Beinen, 3 Koerperregionen, 1 Paar Antennen und 0-4 Fluegeln ist.

**Bei Fehler:** Wenn das Exemplar 8 Beine hat, ist es ein Spinnentier — nicht mit Insektenschluesseln fortfahren. Wenn die Beinzahl unklar ist (z.B. Beine an konserviertem Exemplar verloren), die thorakalen Beinansaetze untersuchen — Insekten haben 3 Paar Coxae am Pro-, Meso- und Metathorax. Wenn der Koerperplan tatsaechlich unklar ist, „Arthropoda — Klasse unsicher" notieren und festhalten, welche Merkmale sichtbar sind.

### Schritt 2: Bestimmung bis zur Ordnung mit dem dichotomen Schluessel

Den folgenden vereinfachten Schluessel Kopplungspunkt fuer Kopplungspunkt durcharbeiten. Bei jedem Kopplungspunkt die zum Exemplar passende Option waehlen und der Leitzahl folgen.

```
Simplified Dichotomous Key to Major Insect Orders:

1a. Wings present and visible ................................. go to 2
1b. Wings absent (apterous) .................................. go to 12

2a. One pair of wings (hind wings reduced to halteres) ....... DIPTERA
    (flies, mosquitoes, midges, crane flies)
2b. Two pairs of wings ........................................ go to 3

3a. Front wings hardened, meeting in a straight line
    down the back (elytra) ................................... COLEOPTERA
    (beetles, weevils, ladybugs, fireflies)
3b. Front wings not fully hardened as elytra ................. go to 4

4a. Wings covered in scales (powdery when rubbed) ............ LEPIDOPTERA
    (butterflies and moths)
4b. Wings membranous or partly membranous, no scales ......... go to 5

5a. Front wings half-leathery at base, membranous at
    tip (hemelytra) .......................................... HEMIPTERA
    (true bugs: stink bugs, assassin bugs, bed bugs)
5b. Front wings uniformly membranous or uniformly
    leathery ................................................. go to 6

6a. Narrow waist between thorax and abdomen; hind wings
    smaller than front wings; wings may hook together ........ HYMENOPTERA
    (bees, wasps, ants, sawflies)
6b. No narrow waist ........................................... go to 7

7a. Long, narrow body; very large eyes covering most of
    head; wings held out to sides or above body at rest ...... ODONATA
    (dragonflies and damselflies)
7b. Body not as above ......................................... go to 8

8a. Hind legs greatly enlarged for jumping ................... ORTHOPTERA
    (grasshoppers, crickets, katydids)
8b. Hind legs not enlarged for jumping ....................... go to 9

9a. Front wings straight, narrow, leathery (tegmina);
    cerci prominent at abdomen tip ........................... DERMAPTERA
    (earwigs) — if cerci are forceps-like
    or BLATTODEA (cockroaches) — if cerci are short
9b. Wings otherwise ........................................... go to 10

10a. Tiny insects (under 5mm); wings fringed with long
     hairs ................................................... THYSANOPTERA
     (thrips)
10b. Wings not fringed ........................................ go to 11

11a. Two pairs of similar-sized membranous wings with
     many veins; soft body; often near water ................. NEUROPTERA
     (lacewings, antlions) or EPHEMEROPTERA (mayflies —
     have 2-3 tail filaments) or PLECOPTERA (stoneflies —
     have 2 tail filaments, wings fold flat)
11b. Does not match above ..................................... record
     features and consult a comprehensive regional key

12a. Laterally flattened body; jumps .......................... SIPHONAPTERA
     (fleas)
12b. Pale, soft body; bead-like antennae; social,
     found in wood or soil ................................... BLATTODEA
     (termites, formerly Isoptera)
12c. Very small (under 2mm); elongate; found on hosts ........ PHTHIRAPTERA
     (lice)
12d. 6 legs, wingless, does not match above .................. record
     features and consult a comprehensive regional key
     (many wingless forms exist within winged orders)
```

**Erwartet:** Bestimmung bis zur Ordnung mit dokumentiertem Weg durch den Schluessel (z.B. „1a zu 2b zu 3a = Coleoptera").

**Bei Fehler:** Wenn das Exemplar keinem Kopplungspunkt eindeutig entspricht, kann es sich um eine fluegelllose Form einer normalerweise gefluegelten Ordnung handeln (z.B. Arbeiterinnen-Ameisen sind fluegelllose Hymenoptera, weibliche Sacktraeger-Motten sind fluegelllose Lepidoptera). Notieren, welcher Kopplungspunkt Schwierigkeiten bereitete und welche Merkmale mehrdeutig sind. Einen detaillierteren regionalen Schluessel konsultieren oder das Exemplar zur Expertenpruefung fotografieren.

### Schritt 3: Fluegelvenenation und -typ untersuchen

Fluegel tragen diagnostische Informationen auf Familien- und Gattungsebene, die ueber den dichotomen Schluessel hinausgehen.

```
Wing Types by Order:
+--------------------+------------------------------------------+
| Wing Type          | Orders                                   |
+--------------------+------------------------------------------+
| Elytra (hardened   | Coleoptera — front wings meet in a       |
| front wings)       | straight line; hind wings membranous,    |
|                    | folded beneath                           |
+--------------------+------------------------------------------+
| Hemelytra (partly  | Hemiptera — basal half leathery, distal  |
| hardened)          | half membranous                          |
+--------------------+------------------------------------------+
| Tegmina (leathery  | Orthoptera, Blattodea — uniformly        |
| front wings)       | leathery; hind wings membranous, folded  |
+--------------------+------------------------------------------+
| Scaled             | Lepidoptera — covered in overlapping     |
|                    | scales; venation visible when descaled   |
+--------------------+------------------------------------------+
| Membranous (both   | Hymenoptera, Odonata, Neuroptera,        |
| pairs)             | Ephemeroptera, Plecoptera                |
+--------------------+------------------------------------------+
| Halteres (reduced  | Diptera — hind wings reduced to knob-    |
| hind wings)        | like balancing organs                    |
+--------------------+------------------------------------------+
| Fringed            | Thysanoptera — narrow wings with long    |
|                    | marginal hairs                           |
+--------------------+------------------------------------------+

Venation Notes:
- Count the major longitudinal veins (costa, subcosta, radius, media,
  cubitus, anal veins) — number and branching pattern are family-diagnostic
- Note cross-veins forming cells — the number and shape of closed cells
  help distinguish families
- Wing coupling mechanisms (hamuli in Hymenoptera, frenulum in
  Lepidoptera) indicate how front and hind wings link during flight
```

**Erwartet:** Fluegeltyp klassifiziert und wesentliche Venenationsmerkmale notiert. Bei gaengigen Ordnungen kann dies die Ordnungsbestimmung bestaetigen oder verfeinern.

**Bei Fehler:** Wenn Fluegel beschaedigt oder fehlend sind oder so gefaltet, dass die Venenation nicht sichtbar ist, notieren was beobachtet werden kann (z.B. „Elytren vorhanden, Hinterfluegel nicht untersucht") und zum naechsten Schritt uebergehen. Fluegelvenenation ist am nuetzlichsten auf Familienebene — Ordnungsbestimmung erfordert normalerweise keine detaillierte Venenation.

### Schritt 4: Mundwerkzeuge untersuchen

Der Mundwerkzeugtyp spiegelt die Ernaehrungsoekologie wider und ist diagnostisch auf Ordnungsebene.

```
Mouthpart Types:
+--------------------+------------------------------------------+
| Type               | Description and Associated Orders        |
+--------------------+------------------------------------------+
| Chewing            | Mandibles with toothed or grinding       |
| (mandibulate)      | surfaces. Coleoptera, Orthoptera,        |
|                    | Hymenoptera (partially), Odonata larvae, |
|                    | Neuroptera                               |
+--------------------+------------------------------------------+
| Piercing-sucking   | Elongate stylets within a beak-like      |
|                    | rostrum. Hemiptera, Siphonaptera,        |
|                    | Phthiraptera, some Diptera (mosquitoes)  |
+--------------------+------------------------------------------+
| Siphoning          | Coiled proboscis (haustellum) unrolled   |
|                    | to feed on nectar. Lepidoptera (adults)  |
+--------------------+------------------------------------------+
| Sponging           | Fleshy labellum with pseudotracheal      |
|                    | channels. Many Diptera (house flies)     |
+--------------------+------------------------------------------+
| Chewing-lapping    | Mandibles for manipulating + tongue       |
|                    | (glossa) for lapping liquids.            |
|                    | Hymenoptera (bees)                       |
+--------------------+------------------------------------------+
| Rasping-sucking    | Asymmetric mouthparts that rasp tissue   |
|                    | and suck fluids. Thysanoptera            |
+--------------------+------------------------------------------+
```

**Erwartet:** Mundwerkzeugtyp klassifiziert (kauend, stechend-saugend, saugend, tupfend oder kauend-leckend) und als konsistent oder inkonsistent mit der Ordnungsbestimmung aus Schritt 2 notiert.

**Bei Fehler:** Mundwerkzeuge sind an lebenden oder kleinen Exemplaren ohne Vergroesserung oft schwer zu erkennen. Wenn die Mundwerkzeuge nicht untersucht werden koennen, diesen Schritt ueberspringen und „Mundwerkzeuge nicht untersucht" notieren. Bei Fotos kann eine Frontalansicht den Mundwerkzeugtyp offenbaren. Dieser Schritt ist bestaetigend, nicht zwingend fuer die Ordnungsbestimmung.

### Schritt 5: Antennen untersuchen

Die Antennenform ist eines der visuell am besten zugaenglichen Merkmale und diagnostisch auf Familienebene in vielen Ordnungen.

```
Antenna Types:
+--------------------+------------------------------------------+
| Form               | Description and Diagnostic Value         |
+--------------------+------------------------------------------+
| Filiform           | Thread-like, segments similar in size.   |
|                    | Many Orthoptera, some Coleoptera         |
+--------------------+------------------------------------------+
| Moniliform         | Bead-like, round segments. Termites,     |
|                    | some Coleoptera                          |
+--------------------+------------------------------------------+
| Clavate            | Gradually thickened toward tip.           |
|                    | Some Coleoptera (darkling beetles)       |
+--------------------+------------------------------------------+
| Capitate           | Abrupt terminal club. Butterflies        |
|                    | (Lepidoptera: Rhopalocera)               |
+--------------------+------------------------------------------+
| Serrate            | Saw-toothed segments. Some Coleoptera    |
|                    | (click beetles, jewel beetles)           |
+--------------------+------------------------------------------+
| Pectinate          | Comb-like branches on one side.          |
|                    | Some moths, some Coleoptera              |
+--------------------+------------------------------------------+
| Bipectinate        | Comb-like branches on both sides.        |
|                    | Many moths (especially males, for        |
|                    | detecting pheromones)                    |
+--------------------+------------------------------------------+
| Plumose            | Feathery, densely branched. Male         |
|                    | mosquitoes and midges (Diptera)          |
+--------------------+------------------------------------------+
| Lamellate          | Terminal segments expanded into flat      |
|                    | plates. Scarab beetles (Scarabaeidae)    |
+--------------------+------------------------------------------+
| Geniculate         | Elbowed — a long first segment (scape)   |
|                    | followed by an angle. Ants, weevils,     |
|                    | many Hymenoptera                         |
+--------------------+------------------------------------------+
| Aristate           | Short, 3-segmented with a bristle        |
|                    | (arista). Many Diptera (house flies,     |
|                    | fruit flies)                             |
+--------------------+------------------------------------------+
| Stylate            | Short, with a terminal style (finger-    |
|                    | like projection). Some Diptera           |
|                    | (horse flies, robber flies)              |
+--------------------+------------------------------------------+
```

**Erwartet:** Antennenform identifiziert und erfasst. Der Antennentyp sollte mit der in Schritt 2 bestimmten Ordnung konsistent sein (z.B. lamellate Antennen bestaetigen Scarabaeidae innerhalb Coleoptera; capitate Antennen bestaetigen Schmetterling statt Motte innerhalb Lepidoptera).

**Bei Fehler:** Wenn Antennen gebrochen, fehlend oder auf Fotos verdeckt sind, notieren: „Antennen nicht vollstaendig sichtbar — erschienen [fadenfoermig/gekeult/etc.] nach dem, was beobachtet wurde." Die Antennenform ist eines der zuverlaessigsten Merkmale fuer die Familienbestimmung, daher reduziert der Verlust dieses Merkmals die Konfidenz. Mit Schritt 6 fortfahren.

### Schritt 6: Beine und Tarsalstruktur untersuchen

Beinspezialisierung offenbart die Oekologie des Insekts, und die Tarsalformel (Anzahl der Segmente pro Tarsus) ist diagnostisch auf Familienebene in mehreren Ordnungen.

```
Leg Specializations:
+--------------------+------------------------------------------+
| Specialization     | Description and Examples                 |
+--------------------+------------------------------------------+
| Cursorial          | Long, slender, built for running.        |
| (running)          | Ground beetles (Carabidae), cockroaches  |
+--------------------+------------------------------------------+
| Saltatorial        | Enlarged hind femora for jumping.         |
| (jumping)          | Grasshoppers, fleas, flea beetles       |
+--------------------+------------------------------------------+
| Raptorial          | Front legs with spined femur and tibia    |
| (grasping)         | for seizing prey. Praying mantises,      |
|                    | some Hemiptera (ambush bugs)             |
+--------------------+------------------------------------------+
| Fossorial          | Front legs broad and flattened for        |
| (digging)          | digging. Mole crickets, scarab larvae    |
+--------------------+------------------------------------------+
| Natatorial         | Hind legs flattened and fringed with      |
| (swimming)         | hairs for rowing. Water beetles,         |
|                    | water boatmen                            |
+--------------------+------------------------------------------+
| Scansorial         | Tarsi with adhesive pads or claws for     |
| (climbing)         | gripping surfaces. Many beetles, flies   |
+--------------------+------------------------------------------+
| Corbiculate        | Hind tibiae with pollen basket (corbicula)|
|                    | Honey bees, bumble bees                  |
+--------------------+------------------------------------------+

Tarsal Formula:
- Count tarsal segments on front, middle, and hind legs
- Express as 3 numbers (e.g., 5-5-5 means 5 segments on all legs)
- Common formulas:
  5-5-5: Most Coleoptera families, Hymenoptera, Neuroptera
  5-5-4: Cerambycidae, Chrysomelidae (apparent — actually cryptic 5th)
  4-4-4: Some smaller beetle families
  3-3-3: Some flies (Diptera)
  Variable: Check all three pairs — asymmetry is diagnostic
```

**Erwartet:** Beinspezialisierungstyp erfasst und Tarsalformel gezaehlt (wenn das Exemplar es erlaubt). Diese Merkmale grenzen die Bestimmung innerhalb der Ordnung ein.

**Bei Fehler:** Wenn das Exemplar zu klein ist, um Tarsalsegmente ohne Mikroskop zu zaehlen, die allgemeine Beinform und offensichtliche Spezialisierungen (Sprungbeine, Grabbeine) notieren. Die Tarsalformel ist am nuetzlichsten fuer Coleoptera-Familien — bei anderen Ordnungen genuegt die allgemeine Beinform.

### Schritt 7: Konfidenzgrad zuweisen

Alle Beobachtungen zu einer endgueltigen Bestimmung mit expliziter Konfidenzbewertung zusammenfuehren.

```
Confidence Assessment:
+----------+---------------------------+---------------------------+
| Level    | Criteria                  | Action                    |
+----------+---------------------------+---------------------------+
| Certain  | All morphological features| Record as confirmed ID.   |
|          | match; keyed through      | Label specimen or          |
|          | dichotomous key cleanly;  | observation with species   |
|          | no similar species in     | name.                     |
|          | region could be confused  |                           |
+----------+---------------------------+---------------------------+
| Probable | Most features match;      | Record as probable ID.    |
|          | keyed to family or genus; | Note which features are   |
|          | 1-2 features uncertain or | uncertain. Seek additional|
|          | not examined              | references or expert      |
|          |                          | confirmation.              |
+----------+---------------------------+---------------------------+
| Possible | Some features match;      | Record as possible ID.    |
|          | keyed to order but not    | Photograph thoroughly.    |
|          | further; similar taxa not | Submit to expert forum or |
|          | fully eliminated          | citizen science platform  |
|          |                          | for community review.     |
+----------+---------------------------+---------------------------+
| Unknown  | Cannot key beyond class   | Record all visible        |
|          | Insecta; features not     | features. Photograph.     |
|          | matching available keys;  | Seek expert identification|
|          | specimen too damaged for  | or use molecular methods  |
|          | morphological ID          | (DNA barcoding).          |
+----------+---------------------------+---------------------------+

Record your identification in this format:
  Order: [name]
  Family: [name or "uncertain"]
  Genus: [name or "uncertain"]
  Species: [name or "uncertain"]
  Confidence: [Certain / Probable / Possible / Unknown]
  Features examined: [list which steps were completed]
  Features uncertain: [list any ambiguous characters]
  Similar taxa considered: [what else it might be and why rejected]
```

**Erwartet:** Ein vollstaendiger Bestimmungsdatensatz mit Ordnung (mindestens), Familie und Gattung (wenn moeglich), explizitem Konfidenzgrad und Dokumentation, welche Merkmale untersucht und welche unsicher waren.

**Bei Fehler:** Wenn die Bestimmung auf Ordnungsebene steckenbleibt, ist das ein gueltiges Ergebnis. Alle beobachteten Merkmale erfassen und Fotos an Expertenforen oder Citizen-Science-Plattformen einreichen. Viele Insekten erfordern Spezialistenwissen oder sogar Genitalpraeparation fuer die Artbestimmung — das ist normal, kein Versagen der Methode.

## Validierung

- [ ] Der Organismus wurde als Insekt bestaetigt (6 Beine, 3 Koerperregionen, 1 Paar Antennen)
- [ ] Der dichotome Schluessel wurde systematisch durchgearbeitet, mit dokumentiertem Weg
- [ ] Fluegeltyp wurde klassifiziert und Venenationsmerkmale notiert, wo sichtbar
- [ ] Mundwerkzeugtyp wurde identifiziert oder als nicht untersucht notiert
- [ ] Antennenform wurde anhand der Standardterminologie identifiziert
- [ ] Beinspezialisierung und Tarsalformel wurden erfasst, wo moeglich
- [ ] Ein Konfidenzgrad wurde explizit zugewiesen (Sicher/Wahrscheinlich/Moeglich/Unbekannt)
- [ ] Aehnliche Taxa wurden in Betracht gezogen und Ausschlussgruende dokumentiert

## Haeufige Stolperfallen

- **Die Koerperplan-Pruefung ueberspringen**: Einen 8-beinigen Spinnentier fuer ein Insekt halten, weil es „wie ein Kaefer aussieht." Immer zuerst Beine zaehlen. Zecken, Milben und Weberknechte werden haeufig mit Insekten verwechselt
- **Sich nur auf Farbe verlassen**: Farbe ist das unzuverlaessigste Bestimmungsmerkmal in der Entomologie. Viele Arten variieren in der Faerbung, und nicht verwandte Arten koennen in der Faerbung nahezu identisch sein (Mimikry). Immer strukturelle Merkmale (Fluegel, Mundwerkzeuge, Antennen) als primaere Merkmale verwenden
- **Nicht beide Seiten eines Kopplungspunkts pruefen**: In einem dichotomen Schluessel beide Optionen lesen, bevor man waehlt. Uebereiltes Durchgehen fuehrt zu falschen Zweigen. Wenn keine Option gut passt, zum vorherigen Kopplungspunkt zurueckgehen
- **Sexualdimorphismus ignorieren**: Maennchen und Weibchen derselben Art koennen dramatisch unterschiedlich aussehen. Maennliche Motten haben moeglicherweise bipektinate Antennen, waehrend Weibchen filiforme haben. Maennliche Hirschkaefer haben enorme Mandibeln, Weibchen nicht. Beide Geschlechter beruecksichtigen
- **Larven- und Adultenformen verwechseln**: Unreife Insekten (Larven, Nymphen) sehen oft voellig anders aus als Adulte. Raupen (Lepidoptera-Larven) haben mehr als 6 echte Beine. Engerlinge (Coleoptera-Larven) haben moeglicherweise keine sichtbaren Beine. Schluessel fuer Adulte funktionieren nicht bei Larven
- **Eine Artbestimmung erzwingen**: Viele Insektenfamilien enthalten Hunderte aehnlich aussehender Arten, die nur durch Genitalmorphologie oder DNA-Barcoding unterscheidbar sind. Eine ehrliche Gattungs- oder Familienbestimmung ist wertvoller als ein falscher Artname

## Verwandte Skills

- `document-insect-sighting` — Die Sichtung mit Fotos und Metadaten vor oder waehrend der Bestimmung dokumentieren
- `observe-insect-behavior` — Verhaltensbeobachtungen, die die morphologische Bestimmung um oekologischen Kontext ergaenzen
- `collect-preserve-specimens` — Wenn ein physisches Exemplar fuer definitive Bestimmung unter Vergroesserung benoetigt wird
- `survey-insect-population` — Bestimmungsfaehigkeiten auf mehrere Exemplare in einer Populationserhebung anwenden
