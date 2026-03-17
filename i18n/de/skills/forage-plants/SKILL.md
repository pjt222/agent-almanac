---
name: forage-plants
description: >
  Essbare und nuetzliche Wildpflanzen identifizieren und sicher sammeln. Umfasst
  Sicherheitsregeln und Erkennung toedlicher Pflanzen, Lebensraum-Erkundung,
  Mehrfachmerkmal-Bestimmungsmethodik, den universellen Essbarkeitstest,
  nachhaltige Erntepraktiken, Zubereitungsmethoden, Reaktionsueberwachung und
  Wissensaufbau mit anfaengerfreundlichen universellen Arten. Verwenden beim
  Ergaenzen der Nahrungsversorgung in einer Wildnis- oder Ueberlebenssituation,
  beim Benoetigen von Heil- oder Nutzpflanzen, beim Identifizieren von Pflanzen
  im Lagerbereich zur Sicherheit oder in Langzeitszenarien, in denen Sammeln
  die verfuegbaren Rationen erweitert.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: advanced
  language: natural
  tags: bushcraft, foraging, plants, edible, survival, wilderness, botany
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Pflanzen sammeln

Essbare und nuetzliche Wildpflanzen in Wildnisumgebungen identifizieren und sicher sammeln.

## Wann verwenden

- Sie muessen die Nahrungsversorgung in einer Wildnis- oder Ueberlebenssituation ergaenzen
- Sie benoetigen Heil- oder Nutzpflanzen (Schnurmaterial, Zunder, Insektenschutz)
- Sie moechten Pflanzen im Lagerbereich zur Sicherheit identifizieren (giftige Arten vermeiden)
- Langzeit-Wildnisszenario, in dem Sammeln die verfuegbaren Rationen erweitert

## Eingaben

- **Erforderlich**: Ein Lebensraum zum Sammeln (Wald, Wiese, Feuchtgebiet, Kueste)
- **Erforderlich**: Faehigkeit, feine Pflanzendetails zu beobachten (Blattform, Anordnung, Bluetenstruktur)
- **Optional**: Bestimmungsbuch oder Referenzmaterial fuer die Region
- **Optional**: Behaelter fuer gesammelte Pflanzen
- **Optional**: Messer zum Ernten
- **Optional**: Feuer und Wasser zur Zubereitung (siehe `make-fire`, `purify-water`)

## Vorgehensweise

### Schritt 1: Zuerst die toedlichen Pflanzen kennen

Bevor man lernt, was essbar ist, lernen, was toedlich ist. Diese Hochrisiko-Familien und -Arten fuer die eigene Region einpraegen.

```
Critical "Never Eat" Plants (Northern Hemisphere):
┌─────────────────────┬────────────────────────────────┬─────────────────────┐
│ Plant               │ Key Identification             │ Danger              │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Water hemlock       │ Hollow, chambered stem base;   │ Deadly in minutes.  │
│ (Cicuta)            │ smells like carrot/parsnip;    │ Seizures, death.    │
│                     │ wet habitats; compound leaves  │ No safe dose.       │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Poison hemlock      │ Smooth stem with purple        │ Deadly. Ascending   │
│ (Conium maculatum)  │ blotches; musty smell;         │ paralysis.          │
│                     │ finely divided leaves          │                     │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Destroying angel /  │ White mushroom; white gills;   │ Deadly (liver       │
│ Death cap (Amanita) │ ring on stem; cup (volva)      │ failure in 3-5      │
│                     │ at base; grows near trees      │ days). No antidote. │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Castor bean         │ Large star-shaped leaves;      │ Seeds contain ricin. │
│ (Ricinus communis)  │ spiny seed pods                │ Deadly if chewed.   │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Foxglove            │ Tall spike of tubular flowers; │ Cardiac glycosides. │
│ (Digitalis)         │ fuzzy, wrinkled leaves         │ Heart failure.      │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Nightshade family   │ Some edible (tomato, pepper),  │ Berries and foliage │
│ (Solanum, Atropa)   │ many toxic; 5-petaled flowers; │ of wild species can │
│                     │ alternate leaves               │ be lethal.          │
└─────────────────────┴────────────────────────────────┴─────────────────────┘

Absolute Rules:
1. NEVER eat a plant you cannot positively identify
2. NEVER eat white or red berries unless specifically identified as safe
3. NEVER eat mushrooms in a survival situation unless expert-level confident
4. NEVER eat plants with milky or discolored sap (exceptions exist but require expertise)
5. NEVER eat plants from the carrot/parsley family (Apiaceae) unless certain — this family contains the deadliest plants alongside the most common herbs
```

**Erwartet:** Sie koennen die gefaehrlichsten Pflanzen Ihrer Region auf Anhieb erkennen und werden sie nicht mit essbaren Arten verwechseln.

**Bei Fehler:** Wenn bei einer Pflanze aus diesen Familien Unsicherheit besteht, nicht essen. Die Kosten eines falsch Positiven (eine toedliche Pflanze essen) sind der Tod. Die Kosten eines falsch Negativen (eine sichere Pflanze ueberspringen) sind eine verpasste Mahlzeit. Immer zur Vorsicht neigen.

### Schritt 2: Den Lebensraum lesen

Verschiedene Lebensraeume erzeugen verschiedene Ressourcen. Das Gebiet vor dem Sammeln erkunden.

```
Habitat-to-Resource Mapping:
┌──────────────────┬─────────────────────────────┬──────────────────────────┐
│ Habitat          │ Common Edible Plants        │ Look for                 │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Open meadow /    │ Dandelion, clover, plantain,│ Sunny, disturbed ground  │
│ field edges      │ chicory, wild onion,        │ with diverse low plants  │
│                  │ lamb's quarters             │                          │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Forest floor     │ Wood sorrel, ramps (spring),│ Dappled shade; look near │
│                  │ violets, fiddleheads (spring│ logs and clearings       │
│                  │ only), nuts (fall)          │                          │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Forest edge /    │ Berries (blackberry,        │ Transitional zone with   │
│ hedgerow         │ raspberry, elderberry),     │ maximum species diversity │
│                  │ rose hips, hawthorn         │                          │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Wetland / stream │ Cattail, watercress,        │ Moist soil, standing or  │
│ bank             │ wild rice, arrowhead        │ slow water               │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Shoreline /      │ Seaweed (kelp, dulse, nori),│ Rocky intertidal zones,  │
│ coastal          │ sea lettuce, glasswort      │ salt marshes             │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Disturbed ground │ Lamb's quarters, amaranth,  │ Trailsides, old fields, │
│ (ruderal)        │ purslane, chickweed,        │ roadsides (avoid        │
│                  │ stinging nettle             │ herbicide areas)        │
└──────────────────┴─────────────────────────────┴──────────────────────────┘
```

**Erwartet:** Sie identifizieren, in welchem Lebensraumtyp Sie sich befinden, und haben eine Auswahlliste wahrscheinlich essbarer Arten zum Suchen.

**Bei Fehler:** Wenn der Lebensraum unbekannt ist oder die Pflanzenvielfalt gering (dichter Nadelwald, Wueste), auf die universellen Arten in Schritt 8 konzentrieren. In trockenen Umgebungen nach Kakteenpolstern (Opuntia), Mesquite-Schoten oder Eicheln suchen. Im tiefen Wald nach Innenrinde (Kambium) von Kiefer, Birke oder Linde als Notkalorien suchen.

### Schritt 3: Anhand mehrerer Merkmale identifizieren

Eine Pflanze niemals anhand eines einzelnen Merkmals identifizieren. Die Mehrfachmerkmal-Methode verwenden.

```
Identification Checklist — Confirm ALL of the following:

1. LEAF SHAPE AND MARGIN
   - Simple or compound?
   - Smooth, toothed, or lobed?
   - Pointed or rounded?

2. LEAF ARRANGEMENT
   - Alternate, opposite, or whorled on the stem?
   - Basal rosette?

3. STEM CHARACTERISTICS
   - Round, square, or ridged?
   - Hollow or solid?
   - Hairy, smooth, or thorny?

4. FLOWER STRUCTURE (if present)
   - Number of petals
   - Color
   - Symmetry (radial or bilateral)
   - Arrangement (spike, cluster, umbel, single)

5. SMELL
   - Crush a leaf: minty, oniony, bitter, no scent?
   - Some families have distinctive smells (mint = square stem + aromatic)

6. HABITAT AND SEASON
   - Where is it growing? (wet, dry, sun, shade)
   - What time of year? (confirms seasonal species)

7. ROOT/RHIZOME (dig one sample)
   - Bulb, taproot, fibrous, or rhizome?
   - Color and smell of the root

Rule: You need a match on ALL features, not just some.
      A single mismatch means you have the wrong plant.
```

**Erwartet:** Positive Bestimmung basierend auf mindestens 5 uebereinstimmenden Merkmalen. Sie koennen die Art benennen und erklaeren, warum es kein gefaehrlicher Doppelgaenger ist.

**Bei Fehler:** Wenn ein Merkmal nicht mit der Referenz uebereinstimmt, die Pflanze nicht essen. Beiseitelegen und zu einem anderen Kandidaten weitergehen. Doppelgaenger sind die Hauptursache fuer Sammelvergiftungen — Wilde Moehre (essbar) vs. Gefleckter Schierling (toedlich) unterscheiden sich in Stielmarkierungen und Geruch, teilen aber die Blattform.

### Schritt 4: Den universellen Essbarkeitstest anwenden (nur im Notfall)

Dieser Test ist ein letzter Ausweg fuer voellig unbekannte Pflanzen, wenn kein Referenzmaterial vorhanden ist und Hunger droht. Er dauert 24+ Stunden und birgt Risiken.

```
Universal Edibility Test Protocol:
(Only use when: no field guide, no known species, genuinely starving)

1. SEPARATE the plant into parts: leaves, stems, roots, flowers, seeds
   (each part must be tested independently)

2. SMELL the plant part — reject if strongly bitter or acrid

3. SKIN CONTACT: rub the plant part on inner wrist
   Wait 15 minutes — reject if burning, rash, or numbness

4. LIP TEST: touch plant part to corner of lip
   Wait 15 minutes — reject if burning, tingling, or numbness

5. TONGUE TEST: place on tongue, do not chew
   Wait 15 minutes — reject if unpleasant reaction

6. CHEW TEST: chew and hold in mouth, do not swallow
   Wait 15 minutes — reject if bitter, soapy, burning

7. SWALLOW TEST: swallow a small amount (teaspoon)
   Wait 8 hours — eat nothing else during this time
   Reject if nausea, cramps, diarrhea, or any ill effect

8. If no reaction after 8 hours: eat a small handful
   Wait another 8 hours
   If still no reaction: the plant part is likely safe

CRITICAL WARNINGS:
- Test ONLY ONE plant part at a time
- Do NOT test mushrooms with this method (toxins can be delayed 24-72 hrs)
- Do NOT test plants with milky sap
- Stay hydrated throughout the test
- This test does NOT detect all toxins (cumulative toxins, carcinogens)
```

**Erwartet:** Nach dem vollstaendigen Testprotokoll haben Sie eine vorlaeufig essbare Pflanze, wenn auch mit weniger Sicherheit als bei einer positiven Bestimmung.

**Bei Fehler:** Wenn in irgendeiner Phase eine Reaktion auftritt, ausspucken oder Erbrechen ausloesen, falls geschluckt. Wasser trinken. Dieselbe Pflanze nicht erneut testen. Zu einer anderen Art wechseln. Bei Erbrechen oder Durchfall auf Fluessigkeitszufuhr und Ruhe konzentrieren, bevor der Test mit einer anderen Pflanze fortgesetzt wird.

### Schritt 5: Nachhaltig ernten

Nur nehmen, was benoetigt wird, und die Pflanzenpopulation erhalten.

```
Sustainable Harvesting Rules:
1. Never take more than 1/3 of any plant stand
2. Never pull entire plants when leaves or fruits will do
3. Cut cleanly with a knife rather than tearing
4. Spread harvesting across a wide area
5. Leave root systems intact for perennials
6. Never harvest rare or protected species
7. Avoid plants near roads (exhaust contamination),
   agricultural fields (pesticides), or industrial areas

Harvest by Plant Part:
┌──────────────┬───────────────────────────────────────────────┐
│ Plant Part   │ Harvest Method                                │
├──────────────┼───────────────────────────────────────────────┤
│ Leaves       │ Pick individual leaves; leave at least 2/3    │
│              │ of the plant's foliage                        │
├──────────────┼───────────────────────────────────────────────┤
│ Roots/tubers │ Dig carefully; replant any root crown or      │
│              │ small tubers to regenerate                    │
├──────────────┼───────────────────────────────────────────────┤
│ Berries/fruit│ Pick ripe fruit only; leave some for wildlife │
│              │ and seed dispersal                            │
├──────────────┼───────────────────────────────────────────────┤
│ Bark/cambium │ Only harvest from downed or already damaged   │
│              │ trees; never ring-bark a living tree          │
├──────────────┼───────────────────────────────────────────────┤
│ Seeds/nuts   │ Collect from the ground when possible;        │
│              │ leave enough for wildlife and regeneration    │
└──────────────┴───────────────────────────────────────────────┘
```

**Erwartet:** Eine angemessene Menge positiv bestimmten Pflanzenmaterials, geerntet ohne die Quellpopulation zu zerstoeren.

**Bei Fehler:** Wenn der Pflanzenbestand zu klein ist (weniger als 10 Individuen), nur eine symbolische Probe nehmen oder eine groessere Population anderswo suchen. Uebermaessiges Ernten in einer Ueberlebenssituation ist verstaendlich, aber in Kurzzeitszenarien stellt Schonung sicher, dass die Ressource in den kommenden Tagen verfuegbar ist.

### Schritt 6: Zur Verwendung zubereiten

Viele essbare Wildpflanzen profitieren von einer Zubereitung oder erfordern diese.

```
Preparation Methods:
┌──────────────┬──────────────────────────────┬──────────────────────────┐
│ Method       │ When to Use                  │ How                      │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Raw          │ Known-safe species like       │ Wash in purified water;  │
│              │ dandelion, wood sorrel, most  │ eat fresh               │
│              │ berries, watercress           │                          │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Boiled       │ Reduces bitterness, breaks   │ Boil 5-15 min; discard  │
│              │ down mild toxins; required    │ water for bitter plants  │
│              │ for nettle, dock, fiddleheads │ (leaching)              │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Double-boiled│ Plants with significant      │ Boil 10 min, discard    │
│ (leached)    │ oxalates or tannins (acorns, │ water; boil again in    │
│              │ dock)                        │ fresh water              │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Roasted      │ Roots, tubers, seeds, nuts   │ Place in coals or near  │
│              │                              │ fire; cook until soft    │
│              │                              │ or dry                   │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Dried        │ Preservation for later use;  │ Air dry in sun/wind or  │
│              │ concentrates calories in      │ near fire (not in       │
│              │ seeds and roots              │ direct flame)            │
└──────────────┴──────────────────────────────┴──────────────────────────┘

Key Preparation Rules:
- Always wash plants in purified water before eating
- Cook any plant from wet or contaminated habitats
- Boil stinging nettle for 2+ minutes to neutralize stinging hairs
- Boil fiddlehead ferns thoroughly (raw fiddleheads are mildly toxic)
- Leach acorns in multiple changes of water until bitterness is gone
```

**Erwartet:** Pflanzenmaterial ist sauber, artgerecht zubereitet und verzehrbereit.

**Bei Fehler:** Wenn kein Feuer zum Kochen vorhanden ist (siehe `make-fire`), das Sammeln auf Arten beschraenken, die roh sicher essbar sind. Wenn der Geschmack nach der Zubereitung extrem bitter ist, kann die Pflanze hohe Gehalte an Tanninen oder Alkaloiden enthalten — sich nicht zwingen, sie zu essen. Entsorgen und eine andere Art versuchen.

### Schritt 7: Auf Reaktionen ueberwachen

Selbst korrekt bestimmte Pflanzen koennen individuelle Reaktionen verursachen.

```
Reaction Monitoring Protocol:
1. Eat a small quantity first (a few leaves or one berry)
2. Wait 1-2 hours before eating more
3. Watch for:
   - Nausea or stomach cramps → stop eating, drink water
   - Tingling or numbness in mouth → spit out, rinse mouth
   - Skin rash or hives → possible contact allergy
   - Diarrhea → stop eating, focus on hydration
   - Dizziness or vision changes → possible toxic reaction,
     seek help immediately

If a reaction occurs:
- Stop eating the plant immediately
- Drink large amounts of water
- If severe (difficulty breathing, confusion), this is a medical emergency
- Note which plant and which part caused the reaction
- Do not re-eat that plant
```

**Erwartet:** Keine unerwuenschte Reaktion nach 1-2 Stunden. Sie koennen dann eine normale Portion essen.

**Bei Fehler:** Bei einer leichten Reaktion (Magenbeschwerden, leichte Uebelkeit) die Pflanze nicht weiter essen, hydrieren und ruhen. Die Reaktion sollte innerhalb weniger Stunden abklingen. Bei einer schweren Reaktion (Schwellung, Atemnot, Verwirrung, schneller Herzschlag) handelt es sich um einen medizinischen Notfall — sofort Hilfe suchen. Erbrechen nur ausloesen, wenn medizinisch angeleitet und die Aufnahme innerhalb von 1 Stunde erfolgte.

### Schritt 8: Wissen aufbauen — Die universellen Fuenf

Mit fuenf Pflanzen beginnen, die in den meisten Teilen der gemaessigten noerdlichen Hemispaere vorkommen. Diese beherrschen, bevor das Repertoire erweitert wird.

```
The Universal Five (Beginner-Friendly Edible Plants):

1. DANDELION (Taraxacum officinale)
   Habitat: Lawns, fields, disturbed ground (nearly everywhere)
   ID: Basal rosette of toothed leaves; hollow stem; yellow
       composite flower; milky sap (exception to the milky sap rule)
   Edible: Entire plant — leaves (raw/cooked), flowers (raw/fried),
           roots (roasted as coffee substitute)
   Season: Year-round; best in spring before flowering

2. BROADLEAF PLANTAIN (Plantago major)
   Habitat: Lawns, paths, disturbed ground
   ID: Basal rosette of oval leaves with parallel veins;
       tall seed spike; leaves are tough and fibrous
   Edible: Young leaves (raw in salads, older leaves boiled);
           seeds (edible raw or ground)
   Medicinal: Crushed leaves used as poultice for insect bites/stings
   Season: Spring through fall

3. WHITE CLOVER (Trifolium repens)
   Habitat: Lawns, meadows, roadsides
   ID: Three round leaflets (sometimes four); white round flower
       heads; creeping ground cover
   Edible: Flowers (raw or dried for tea); young leaves (raw or
           cooked — cook to improve digestibility)
   Season: Flowers in spring/summer; leaves year-round in mild climates

4. CATTAIL (Typha latifolia / T. angustifolia)
   Habitat: Wetlands, pond edges, ditches, marshes
   ID: Tall (1-3 m); long flat sword-like leaves; distinctive brown
       cigar-shaped seed head
   Edible: Shoot base/heart (raw, spring); pollen (flour substitute,
           summer); rhizome (starchy, peeled and boiled/roasted,
           year-round); young flower spike (boiled, early summer)
   Utility: Fluff = tinder and insulation; leaves = weaving material
   Season: Different parts edible year-round

5. WOOD SORREL (Oxalis spp.)
   Habitat: Forest floor, shaded areas, gardens
   ID: Three heart-shaped leaflets (resembles clover but leaflets are
       notched/heart-shaped); small 5-petaled yellow, white, or pink
       flowers; leaves fold at night
   Edible: Leaves and flowers (raw — pleasant lemony/sour taste)
   Caution: Contains oxalic acid; eat in moderation (not as a staple)
   Season: Spring through fall

Progression:
  Master these 5 → Add 5 regional species → Add 5 more → Build to 20+
  (20 positively known species provides meaningful foraging capability)
```

**Erwartet:** Sie koennen alle fuenf universellen Pflanzen auf Anhieb anhand mehrerer Merkmale identifizieren und wissen, welche Teile essbar sind und wie sie zubereitet werden.

**Bei Fehler:** Wenn keine dieser fuenf Pflanzen in Ihrem Gebiet vorhanden ist (z.B. Wueste, Hocharktis, Tropen), regionsspezifische Referenzen konsultieren. Diese fuenf sind spezifisch fuer gemaessigte Zonen. In tropischen Umgebungen nach Kokospalme, Banane/Kochbanane, Taro (muss gekocht werden), Brotfrucht und Moringa suchen. In trockenen Regionen nach Feigenkaktus (Opuntia), Mesquite und Agave suchen.

## Validierung

- [ ] Toedliche Pflanzen der Region sind bekannt und koennen auf Anhieb identifiziert werden
- [ ] Lebensraum wurde erkundet und wahrscheinlich essbare Arten wurden in eine Auswahlliste aufgenommen
- [ ] Jede Pflanze wurde anhand mindestens 5 Merkmalen identifiziert (Mehrfachmerkmal-Methode)
- [ ] Pflanze wurde als KEIN gefaehrlicher Doppelgaenger bestaetigt
- [ ] Ernte war nachhaltig (nicht mehr als 1/3 eines Bestandes)
- [ ] Zubereitungsmethode war fuer die Art angemessen
- [ ] Eine kleine Testportion wurde zuerst mit einer 1-2-stuendigen Ueberwachungsphase gegessen
- [ ] Keine unerwuenschten Reaktionen traten auf, bevor eine volle Portion gegessen wurde

## Haeufige Stolperfallen

- **Einzelmerkmal-Bestimmung**: "Es hat drei Blaetter wie Klee" reicht nicht aus. Viele giftige Pflanzen teilen einzelne Merkmale mit essbaren. Immer die vollstaendige Mehrfachmerkmal-Checkliste verwenden
- **Verwechslung in der Moehrenfamilie**: Die Familie Apiaceae (Moehre, Pastinake, Petersilie) enthaelt sowohl gaengige Nahrungsmittel als auch die toedlichsten Pflanzen der noerdlichen Hemispaere. Vermeiden, ausser bei Experten-Sicherheit
- **Pilzsammeln in Ueberlebenssituationen**: Pilze bieten wenig Kalorienwert und umfassen einige der toedlichsten Organismen der Erde. Das Risiko-Nutzen-Verhaeltnis ist in einem Ueberlebenskontext miserabel
- **Zu viel von einer neuen Pflanze essen**: Selbst sichere Pflanzen koennen in groesserer Menge Verdauungsbeschwerden verursachen, besonders wenn der Darm nicht daran gewoehnt ist. Klein anfangen
- **Zubereitungsanforderungen ignorieren**: Rohe Farnspitzen, rohe Holunderbeereen, ungelaugte Eicheln — einige Pflanzen, die gekocht essbar sind, sind roh leicht giftig
- **Sammeln in der Naehe kontaminierter Gebiete**: Strassenraender (Blei, Abgase), landwirtschaftliche Raender (Pestizide) und Industriegebiete koennen technisch essbare, aber kontaminierte Pflanzen aufweisen

## Verwandte Skills

- `make-fire` — erforderlich zum Kochen gesammelter Pflanzen; viele Arten muessen gekocht oder geroestet werden, um sicher oder schmackhaft zu sein
- `purify-water` — sauberes Wasser wird zum Waschen gesammelter Pflanzen und fuer die Auslaugungs-/Kochmethoden der Zubereitung benoetigt
