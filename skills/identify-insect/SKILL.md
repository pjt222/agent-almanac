---
name: identify-insect
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

Identify insects using systematic morphological examination, dichotomous keys, and structured confidence assessment.

## When to Use

- You have an unknown insect (live, photographed, or preserved) and need to identify it
- You want to move beyond order-level placement to family or genus
- You are working through a specimen collection and need consistent identification methods
- You need to distinguish between visually similar orders or families
- You are teaching or learning insect identification and want a structured approach

## Inputs

- **Required**: An insect specimen or clear observation (live, photographed, or preserved)
- **Required**: Ability to examine fine morphological details (wings, mouthparts, antennae, legs)
- **Optional**: Hand lens (10x) or dissecting microscope for fine detail
- **Optional**: Entomological field guide or dichotomous key for the region
- **Optional**: Forceps and pins for manipulating preserved specimens
- **Optional**: Photographs from multiple angles (dorsal, lateral, ventral, frontal)

## Procedure

### Step 1: Verify the Basic Body Plan

Confirm you are looking at an insect and not another arthropod. This step prevents misidentification at the most fundamental level.

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

**Expected:** Confirmation that the organism is an insect with 6 legs, 3 body regions, 1 pair of antennae, and 0-4 wings.

**On failure:** If the specimen has 8 legs, it is an arachnid — do not proceed with insect keys. If leg count is ambiguous (e.g., legs lost on preserved specimen), examine thoracic leg attachments — insects have 3 pairs of coxae on the pro-, meso-, and metathorax. If the body plan is genuinely unclear, record "Arthropoda — class uncertain" and note what features are visible.

### Step 2: Key to Order Using the Dichotomous Key

Work through the following simplified key one couplet at a time. At each couplet, choose the option that matches your specimen and follow the lead number.

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

**Expected:** Identification to order with a clear path through the key documented (e.g., "1a to 2b to 3a = Coleoptera").

**On failure:** If the specimen does not clearly match any couplet, it may be a wingless form of a normally winged order (e.g., worker ants are wingless Hymenoptera, female bagworm moths are wingless Lepidoptera). Note which couplet caused difficulty and what features are ambiguous. Consult a more detailed regional key or photograph the specimen for expert review.

### Step 3: Examine Wing Venation and Type

Wings carry diagnostic information at family and genus level beyond what the dichotomous key captures.

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

**Expected:** Wing type classified and major venation features noted. For common orders, this may confirm or refine the order-level identification.

**On failure:** If wings are damaged, missing, or folded such that venation is not visible, note what can be seen (e.g., "elytra present, hind wings not examined") and proceed to the next step. Wing venation is most useful at the family level — order-level identification usually does not require detailed venation.

### Step 4: Examine Mouthparts

Mouthpart type reflects feeding ecology and is diagnostic at the order level.

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

**Expected:** Mouthpart type classified (chewing, piercing-sucking, siphoning, sponging, or chewing-lapping) and noted as consistent or inconsistent with the order identification from Step 2.

**On failure:** Mouthparts are often difficult to see on live or small specimens without magnification. If mouthparts cannot be examined, skip this step and note "mouthparts not examined." For photographs, a frontal view may reveal the mouthpart type. This step is confirmatory, not mandatory for order-level identification.

### Step 5: Examine Antennae

Antennal form is one of the most visually accessible features and is diagnostic at the family level in many orders.

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

**Expected:** Antenna form identified and recorded. The antennal type should be consistent with the order identified in Step 2 (e.g., lamellate antennae confirm Scarabaeidae within Coleoptera; capitate antennae confirm butterfly rather than moth within Lepidoptera).

**On failure:** If antennae are broken, missing, or obscured in photographs, note "antennae not fully visible — appeared [filiform/clubbed/etc.] from what was observed." Antennal form is one of the most reliable features for family-level identification, so the loss of this character reduces confidence. Proceed to Step 6.

### Step 6: Examine Legs and Tarsal Structure

Leg specialization reveals the insect's ecology, and tarsal formula (number of segments per tarsus) is diagnostic at the family level in several orders.

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

**Expected:** Leg specialization type recorded and tarsal formula counted (if specimen allows). These features narrow identification within the order.

**On failure:** If the specimen is too small for tarsal segments to be counted without a microscope, note the overall leg shape and any obvious specialization (jumping legs, digging legs). Tarsal formula is most useful for Coleoptera families — for other orders, general leg shape is sufficient.

### Step 7: Assign Confidence Level

Synthesize all observations into a final identification with an explicit confidence rating.

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

**Expected:** A completed identification record with order (minimum), family and genus (if possible), explicit confidence level, and documentation of which features were examined and which were uncertain.

**On failure:** If the identification stalls at order level, that is a valid outcome. Record all features observed and submit photographs to expert forums or citizen science platforms. Many insects require specialist knowledge or even genital dissection for species-level identification — this is normal, not a failure of the method.

## Validation

- [ ] The organism was confirmed as an insect (6 legs, 3 body regions, 1 pair antennae)
- [ ] The dichotomous key was worked through systematically, documenting the path taken
- [ ] Wing type was classified and venation features noted where visible
- [ ] Mouthpart type was identified or noted as unexamined
- [ ] Antenna form was identified using the standard terminology
- [ ] Leg specialization and tarsal formula were recorded where possible
- [ ] A confidence level was explicitly assigned (Certain/Probable/Possible/Unknown)
- [ ] Similar taxa were considered and reasons for exclusion documented

## Common Pitfalls

- **Skipping the body plan check**: Assuming an 8-legged arachnid is an insect because it "looks like a bug." Always count legs first. Ticks, mites, and harvestmen are commonly mistaken for insects
- **Relying on color alone**: Color is the least reliable identification character in entomology. Many species are variable in color, and unrelated species can be nearly identical in coloration (mimicry). Always use structural features (wings, mouthparts, antennae) as primary characters
- **Not checking both sides of a couplet**: In a dichotomous key, read both options before choosing. Rushing through leads to wrong branches. If neither option fits well, back up to the previous couplet
- **Ignoring sexual dimorphism**: Males and females of the same species can look dramatically different. Male moths may have bipectinate antennae while females have filiform. Male stag beetles have enormous mandibles while females do not. Consider both sexes
- **Confusing larval and adult forms**: Immature insects (larvae, nymphs) often look nothing like adults. Caterpillars (Lepidoptera larvae) have more than 6 true legs. Grubs (Coleoptera larvae) may lack visible legs entirely. Keys for adults do not work on larvae
- **Forcing a species-level identification**: Many insect families contain hundreds of similar-looking species distinguishable only by genital morphology or DNA barcoding. An honest genus-level or family-level identification is more valuable than a wrong species name

## Related Skills

- `document-insect-sighting` — record the sighting with photographs and metadata before or during identification
- `observe-insect-behavior` — behavioral observations that supplement morphological identification with ecological context
- `collect-preserve-specimens` — when a physical specimen is needed for definitive identification under magnification
- `survey-insect-population` — applying identification skills across multiple specimens in a population-level survey
