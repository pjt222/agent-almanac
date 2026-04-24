---
name: identify-insect
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Identify insects using body plan analysis, dichotomous keys to order, wing
  venation, mouthpart type, antennae form, leg and tarsal structure, and
  confidence levels. Covers the fundamental hexapod body plan verification,
  a simplified dichotomous key to major orders, wing venation and type analysis,
  mouthpart classification, antennae morphology, leg specialization and tarsal
  formula, and a structured confidence assessment framework. Use when you need
  to identify an unknown insect beyond preliminary order placement, are working
  through a specimen for taxonomic study, want to distinguish between similar
  orders or families, or need to assign a confidence level to a field identification.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: intermediate
  language: natural
  tags: entomology, insects, identification, taxonomy, dichotomous-key, morphology
---

# Identify Insect

ID insects with systematic morphological examination, dichotomous keys, structured confidence assessment.

## When Use

- Unknown insect (live, photo, preserved) needs ID
- Want to move beyond order-level to family or genus
- Working through specimen collection, need consistent ID methods
- Tell between visually similar orders or families
- Teaching or learning insect ID, want structured approach

## Inputs

- **Required**: Insect specimen or clear observation (live, photo, preserved)
- **Required**: Can examine fine morphological details (wings, mouthparts, antennae, legs)
- **Optional**: Hand lens (10x) or dissecting microscope for fine detail
- **Optional**: Entomological field guide or dichotomous key for region
- **Optional**: Forceps + pins for manipulating preserved specimens
- **Optional**: Photos from multiple angles (dorsal, lateral, ventral, frontal)

## Steps

### Step 1: Verify Basic Body Plan

Confirm looking at insect not other arthropod. Prevents misidentification at most fundamental level.

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

**Got:** Confirmation organism is insect with 6 legs, 3 body regions, 1 pair antennae, 0-4 wings.

**If fail:** Specimen has 8 legs → arachnid, don't proceed with insect keys. Leg count ambiguous (legs lost on preserved specimen)? Examine thoracic leg attachments — insects have 3 pairs of coxae on pro-, meso-, metathorax. Body plan genuinely unclear? Record "Arthropoda — class uncertain", note visible features.

### Step 2: Key to Order Using Dichotomous Key

Work through simplified key one couplet at a time. Each couplet → choose option matching specimen + follow lead number.

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

**Got:** ID to order with clear path through key documented ("1a to 2b to 3a = Coleoptera").

**If fail:** Specimen doesn't match any couplet? May be wingless form of normally winged order (worker ants = wingless Hymenoptera, female bagworm moths = wingless Lepidoptera). Note which couplet caused difficulty + what features ambiguous. Consult more detailed regional key or photograph specimen for expert review.

### Step 3: Examine Wing Venation + Type

Wings carry diagnostic info at family + genus level beyond dichotomous key.

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
- Count major longitudinal veins (costa, subcosta, radius, media,
  cubitus, anal veins) — number + branching pattern family-diagnostic
- Note cross-veins forming cells — number + shape of closed cells
  help distinguish families
- Wing coupling mechanisms (hamuli in Hymenoptera, frenulum in
  Lepidoptera) indicate how front + hind wings link during flight
```

**Got:** Wing type classified + major venation features noted. Common orders → may confirm or refine order-level ID.

**If fail:** Wings damaged, missing, or folded such that venation not visible? Note what can be seen ("elytra present, hind wings not examined") + proceed. Wing venation most useful at family level — order-level ID usually doesn't need detailed venation.

### Step 4: Examine Mouthparts

Mouthpart type reflects feeding ecology + diagnostic at order level.

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

**Got:** Mouthpart type classified (chewing, piercing-sucking, siphoning, sponging, chewing-lapping) + noted consistent or inconsistent with order ID from Step 2.

**If fail:** Mouthparts often hard to see on live or small specimens without magnification. Can't examine? Skip + note "mouthparts not examined." Photos → frontal view may reveal mouthpart type. Step confirmatory, not mandatory for order-level ID.

### Step 5: Examine Antennae

Antennal form one of most visually accessible features + diagnostic at family level in many orders.

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

**Got:** Antenna form identified + recorded. Antennal type consistent with order ID from Step 2 (lamellate confirms Scarabaeidae within Coleoptera; capitate confirms butterfly not moth within Lepidoptera).

**If fail:** Antennae broken, missing, obscured in photos? Note "antennae not fully visible — appeared [filiform/clubbed/etc.] from what observed." Antennal form most reliable for family-level ID, so loss reduces confidence. Proceed to Step 6.

### Step 6: Examine Legs + Tarsal Structure

Leg specialization reveals insect ecology + tarsal formula (number of segments per tarsus) diagnostic at family level in several orders.

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
- Count tarsal segments on front, middle, hind legs
- Express as 3 numbers (5-5-5 = 5 segments on all legs)
- Common formulas:
  5-5-5: Most Coleoptera families, Hymenoptera, Neuroptera
  5-5-4: Cerambycidae, Chrysomelidae (apparent — actually cryptic 5th)
  4-4-4: Some smaller beetle families
  3-3-3: Some flies (Diptera)
  Variable: Check all three pairs — asymmetry diagnostic
```

**Got:** Leg specialization type recorded + tarsal formula counted (if specimen allows). Features narrow ID within order.

**If fail:** Specimen too small for tarsal segments without microscope? Note overall leg shape + any obvious specialization (jumping legs, digging legs). Tarsal formula most useful for Coleoptera families — other orders, general leg shape enough.

### Step 7: Assign Confidence Level

Synthesize all observations into final ID with explicit confidence rating.

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

**Got:** Completed ID record with order (minimum), family + genus (if possible), explicit confidence level, documentation of features examined + uncertain.

**If fail:** ID stalls at order level? Valid outcome. Record all features observed + submit photos to expert forums or citizen science platforms. Many insects need specialist knowledge or genital dissection for species-level ID — normal, not method failure.

## Checks

- [ ] Organism confirmed as insect (6 legs, 3 body regions, 1 pair antennae)
- [ ] Dichotomous key worked through systematic, documenting path taken
- [ ] Wing type classified + venation features noted where visible
- [ ] Mouthpart type identified or noted as unexamined
- [ ] Antenna form identified using standard terminology
- [ ] Leg specialization + tarsal formula recorded where possible
- [ ] Confidence level explicit assigned (Certain/Probable/Possible/Unknown)
- [ ] Similar taxa considered + reasons for exclusion documented

## Pitfalls

- **Skipping body plan check**: Assuming 8-legged arachnid is insect because "looks like bug." Always count legs first. Ticks, mites, harvestmen commonly mistaken for insects
- **Relying on color alone**: Color least reliable ID character in entomology. Many species variable in color, unrelated species can be nearly identical in coloration (mimicry). Always use structural features (wings, mouthparts, antennae) as primary
- **Not checking both sides of couplet**: Dichotomous key → read both options before choosing. Rushing leads to wrong branches. Neither option fits well? Back up to previous couplet
- **Ignoring sexual dimorphism**: Males + females of same species can look dramatic different. Male moths may have bipectinate antennae while females have filiform. Male stag beetles have enormous mandibles while females don't. Consider both sexes
- **Confusing larval + adult forms**: Immature insects (larvae, nymphs) often look nothing like adults. Caterpillars (Lepidoptera larvae) have more than 6 true legs. Grubs (Coleoptera larvae) may lack visible legs entire. Keys for adults don't work on larvae
- **Forcing species-level ID**: Many insect families contain hundreds of similar-looking species distinguishable only by genital morphology or DNA barcoding. Honest genus-level or family-level ID more valuable than wrong species name

## See Also

- `document-insect-sighting` — record sighting with photos + metadata before or during ID
- `observe-insect-behavior` — behavioral observations supplement morphological ID with ecological context
- `collect-preserve-specimens` — physical specimen needed for definitive ID under magnification
- `survey-insect-population` — apply ID skills across multiple specimens in population-level survey
