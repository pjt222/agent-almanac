---
name: identify-insect
locale: caveman-ultra
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

Systematic morphological exam + dichotomous keys + structured confidence.

## Use When

- Unknown insect (live, photo, preserved) → ID
- Beyond order → family / genus
- Specimen collection → consistent methods
- Distinguish similar orders/families
- Teaching/learning structured approach

## In

- **Required**: specimen or clear observation
- **Required**: ability to examine morphology (wings, mouthparts, antennae, legs)
- **Optional**: 10× loupe / dissecting microscope
- **Optional**: field guide / dichotomous key
- **Optional**: forceps + pins for preserved
- **Optional**: photos from multiple angles (dorsal, lateral, ventral, frontal)

## Do

### Step 1: Verify body plan

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

→ Confirmed insect: 6 legs + 3 regions + 1 pair antennae + 0-4 wings.

**If err:** 8 legs → arachnid, don't proceed w/ insect keys. Leg count ambiguous (lost on preserved) → check thoracic coxae (3 pairs on pro-, meso-, metathorax). Body plan unclear → "Arthropoda — class uncertain" + features visible.

### Step 2: Key to order

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

→ ID to order w/ path documented (e.g., "1a → 2b → 3a = Coleoptera").

**If err:** no clear match → may be wingless form of winged order (worker ants = wingless Hymenoptera; female bagworm moth = wingless Lepidoptera). Note ambiguous couplet + features. Consult regional key or photo for expert review.

### Step 3: Wing venation + type

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
- Count major longitudinal veins (costa, subcosta, radius, media, cubitus, anal)
- Branching pattern = family-diagnostic
- Cross-veins form cells — number + shape distinguish families
- Wing coupling (hamuli Hymenoptera, frenulum Lepidoptera) → link front + hind
```

→ Wing type classified + major venation noted. May confirm/refine order ID.

**If err:** damaged/missing/folded → note what visible ("elytra present, hind wings not examined"). Venation most useful at family level; order doesn't need detailed venation.

### Step 4: Mouthparts

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

→ Mouthpart classified + consistent w/ Step 2 order.

**If err:** difficult on live/small w/o mag → skip + "mouthparts not examined". Photos frontal view may show. Confirmatory, not mandatory for order.

### Step 5: Antennae

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

→ Antenna form ID'd. Consistent w/ Step 2 order (lamellate → Scarabaeidae in Coleoptera; capitate → butterfly not moth in Lepidoptera).

**If err:** broken/missing/obscured → note "appeared [filiform/clubbed] from observation". Reliable for family → loss reduces confidence. Proceed Step 6.

### Step 6: Legs + tarsal structure

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
- Count tarsal segments on front, middle, hind
- Express 3 numbers (5-5-5 = 5 on all)
- Common:
  5-5-5: Most Coleoptera, Hymenoptera, Neuroptera
  5-5-4: Cerambycidae, Chrysomelidae (apparent — cryptic 5th)
  4-4-4: Smaller beetle families
  3-3-3: Some flies (Diptera)
  Variable: check all 3 — asymmetry diagnostic
```

→ Leg specialization + tarsal formula recorded. Narrows within order.

**If err:** too small for tarsal segments → note overall leg shape + specialization (jumping, digging). Tarsal most useful Coleoptera; other orders → general shape sufficient.

### Step 7: Confidence level

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

→ Complete ID record: order min + family/genus if possible + confidence + features examined + uncertain.

**If err:** stall at order → valid outcome. Record all + submit to expert forums / citizen science. Many insects need specialist / genital dissection for species — normal, not failure.

## Check

- [ ] Confirmed insect (6 legs, 3 regions, 1 pair antennae)
- [ ] Dichotomous key worked systematic, path documented
- [ ] Wing type + venation noted where visible
- [ ] Mouthpart ID'd or unexamined noted
- [ ] Antenna form standard terminology
- [ ] Leg specialization + tarsal formula recorded where possible
- [ ] Confidence level explicit (Certain/Probable/Possible/Unknown)
- [ ] Similar taxa considered + exclusion documented

## Traps

- **Skip body plan check**: 8-leg arachnid mistaken for insect. Always count legs. Ticks/mites/harvestmen commonly confused.
- **Color alone**: least reliable. Variable + mimicry. Use structural primary.
- **Not checking both couplet sides**: rushing → wrong branch. Neither fits → back up.
- **Ignore sexual dimorphism**: M/F same species dramatically differ. Male moth bipectinate vs female filiform. Male stag beetle huge mandibles vs female. Consider both sexes.
- **Larval vs adult confusion**: immatures look nothing like adult. Caterpillars >6 true legs. Grubs may lack visible legs. Adult keys don't work for larvae.
- **Force species-level**: many families need genital morphology / DNA. Honest genus/family > wrong species.

## →

- `document-insect-sighting` — record w/ photos + metadata
- `observe-insect-behavior` — behavioral supplements morphology
- `collect-preserve-specimens` — physical specimen for definitive ID under mag
- `survey-insect-population` — ID skills across multiple → population survey
