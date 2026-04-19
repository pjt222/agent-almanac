---
name: collect-preserve-specimens
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Collect and preserve insect specimens following museum-grade standards
  including legal compliance, collection methods, humane dispatch, dry pinning,
  wet preservation, labeling, storage, and curation. Covers permit requirements,
  protected species regulations, sweep nets, beating trays, pitfall traps, light
  traps, Malaise traps, aspirators, ethyl acetate killing jars, freezing, pin
  placement by order, wing spreading, ethanol preservation for soft-bodied
  specimens, specimen labeling with locality and date, storage with pest
  management, and database entry. Use when building a reference collection for
  taxonomic study, preserving voucher specimens for ecological research, preparing
  specimens for identification by specialists, or curating an existing collection.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: advanced
  language: natural
  tags: entomology, insects, collection, preservation, pinning, taxonomy, museum
---

# Collect and Preserve Specimens

Collect and preserve insect specimens to museum-grade standards for taxonomic study, reference collections, ecological research.

## When Use

- Need physical specimens for definitive taxonomic identification
- Building reference collection for habitat, region, or taxon
- Preserving voucher specimens for published ecological research
- Need to send specimens to taxonomic specialists for identification
- Curating or restoring existing insect collection

## Inputs

- **Required**: Legal authorization to collect at intended site (permits, landowner consent)
- **Required**: Collection equipment appropriate to target taxa
- **Required**: Preservation materials (pins, ethanol, or both)
- **Required**: Labeling materials (archival paper, fine-point pen or printer)
- **Optional**: Spreading boards for Lepidoptera, Odonata
- **Optional**: Relaxing chamber for rehydrating dried specimens
- **Optional**: Dissecting microscope for sorting, preparation
- **Optional**: Database or catalog system for specimen records
- **Optional**: Unit trays, drawers, storage cabinets

## Steps

### Step 1: Verify Legal Requirements

Before any collection activity, confirm you have legal right to collect at site, target taxa not protected.

```
FUNDAMENTAL RULE:
Never collect without proper authorization. Never collect from
protected areas without explicit permits. Never collect protected
species. The scientific value of a specimen is zero if it was
collected illegally — it cannot be published, deposited in a
museum, or used in formal research.

Legal Checklist:
+--------------------+------------------------------------------+
| Requirement        | Verify                                   |
+--------------------+------------------------------------------+
| Land access        | Written permission from landowner, or    |
|                    | site is publicly accessible for          |
|                    | collecting (many parks prohibit it)      |
+--------------------+------------------------------------------+
| Collection permit  | Required for most public lands, nature   |
|                    | reserves, national parks. Apply through  |
|                    | the managing agency. Specify taxa,       |
|                    | methods, dates, and quantities.          |
+--------------------+------------------------------------------+
| Protected species  | Check national and regional red lists,   |
|                    | CITES appendices, and local endangered   |
|                    | species legislation. Some butterflies,   |
|                    | beetles, and dragonflies are protected.  |
+--------------------+------------------------------------------+
| Export/import      | Moving specimens across international    |
|                    | borders requires phytosanitary           |
|                    | certificates and may require CITES       |
|                    | permits depending on the taxon.          |
+--------------------+------------------------------------------+
| Institutional      | If collecting for an institution, follow |
| protocols          | their collection policy and ethics       |
|                    | review requirements.                     |
+--------------------+------------------------------------------+

Minimizing Collection Impact:
- Collect only the minimum number of specimens needed
- Avoid collecting from small or isolated populations
- Do not collect gravid (egg-bearing) females if population is small
- Record the abundance at the site — if the species appears rare, photograph instead
- Prefer common and abundant species for teaching collections
```

**Got:** All required permits obtained, protected species lists checked, collector has clear understanding of what may and may not be collected at site.

**If fail:** Permits cannot be obtained? Do not collect. Photograph specimens in situ, use citizen science platforms for identification. Collected specimen turns out to be protected species? Consult relevant wildlife authority immediately. Do not discard specimen — accidental collection should be reported, not concealed.

### Step 2: Select Collection Method

Choose method that matches target taxa, habitat, research objectives. Different methods sample different portions of insect community.

```
Collection Methods:
+--------------------+------------------------------------------+
| Method             | Best For                                 |
+--------------------+------------------------------------------+
| Sweep net          | Flying and vegetation-dwelling insects    |
|                    | in grasslands, meadows, and low shrubs.  |
|                    | Technique: sweep in a figure-8 pattern   |
|                    | through vegetation; empty net into a     |
|                    | killing jar or collecting bag after      |
|                    | every 10-20 sweeps.                      |
+--------------------+------------------------------------------+
| Beating tray       | Arboreal insects on trees and shrubs.    |
|                    | Hold a white sheet or tray under a       |
|                    | branch; strike the branch sharply 3-5    |
|                    | times; collect dislodged insects with    |
|                    | an aspirator or forceps.                 |
+--------------------+------------------------------------------+
| Pitfall trap       | Ground-dwelling insects (beetles,        |
|                    | ants, crickets). Bury a cup flush with   |
|                    | the soil surface. Add a rain cover.      |
|                    | Check every 24-48 hours. Use propylene   |
|                    | glycol as preservative (non-toxic to     |
|                    | mammals; do not use ethylene glycol).    |
+--------------------+------------------------------------------+
| Light trap         | Nocturnal flying insects (moths, many    |
|                    | beetles, lacewings). Use a white sheet   |
|                    | illuminated by a mercury vapor or UV     |
|                    | light. Operate from dusk to midnight     |
|                    | or dawn. Most effective on warm, humid,  |
|                    | moonless nights.                         |
+--------------------+------------------------------------------+
| Malaise trap       | Flying insects, especially Hymenoptera   |
|                    | and Diptera. A tent-like mesh barrier    |
|                    | that intercepts insects in flight;       |
|                    | they walk upward into a collecting head  |
|                    | containing preservative. Runs            |
|                    | continuously; check weekly.              |
+--------------------+------------------------------------------+
| Aspirator (pooter) | Small, delicate insects that cannot be   |
|                    | handled with forceps. Suck the insect    |
|                    | into a vial through a tube (a mesh      |
|                    | filter prevents inhalation). Use only    |
|                    | mouth-operated aspirators with a filter. |
+--------------------+------------------------------------------+
| Pan trap           | Pollinators and small flying insects.    |
|                    | Colored bowls (yellow, white, blue)      |
|                    | filled with soapy water. Place at        |
|                    | vegetation height. The soap breaks       |
|                    | surface tension; insects fall in and     |
|                    | drown. Check every 24-48 hours.          |
+--------------------+------------------------------------------+
| Hand collection    | Large, slow, or sessile insects.         |
|                    | Pick directly with forceps or fingers.   |
|                    | Useful for bark-dwelling beetles,        |
|                    | caterpillars on host plants, aquatic     |
|                    | larvae under rocks.                      |
+--------------------+------------------------------------------+
```

**Got:** One or more collection methods selected based on target taxa and habitat, equipment assembled and ready before entering field.

**If fail:** Intended method not yielding specimens (e.g., sweep netting in heavy rain)? Switch to alternative method. Light trapping requires specific weather conditions — warm, humid, still, moonless nights optimal. Conditions poor? Reschedule rather than running traps inefficiently.

### Step 3: Dispatch Specimens Humanely

Kill collected insects as quickly, humanely as possible. Prolonged distress damages specimens (broken legs, lost scales), is ethically unacceptable.

```
Dispatch Methods:
+--------------------+------------------------------------------+
| Method             | Procedure and Notes                      |
+--------------------+------------------------------------------+
| Ethyl acetate      | Place a wad of absorbent material        |
| killing jar        | (plaster of Paris or tissue) in the      |
|                    | bottom of a wide-mouth jar. Saturate     |
|                    | with ethyl acetate. Place insects in     |
|                    | the jar; death occurs within 1-5        |
|                    | minutes for most species.                |
|                    | Caution: ethyl acetate is flammable and  |
|                    | an irritant. Use in well-ventilated     |
|                    | areas. Do not inhale.                    |
+--------------------+------------------------------------------+
| Freezing           | Place live insects in a container in a   |
|                    | freezer at -20C for 24 hours. Suitable   |
|                    | for specimens brought back alive.        |
|                    | Produces well-relaxed specimens ideal    |
|                    | for pinning.                             |
+--------------------+------------------------------------------+
| Ethanol drowning   | Immerse directly in 70-95% ethanol.      |
|                    | Used for soft-bodied insects that will   |
|                    | be wet-preserved (larvae, aphids, small  |
|                    | Diptera). Not suitable for Lepidoptera   |
|                    | (destroys scales) or specimens intended  |
|                    | for dry pinning.                         |
+--------------------+------------------------------------------+

NEVER use:
- Cyanide jars (potassium cyanide) — extremely toxic to humans;
  obsolete in modern entomology
- Crushing or squeezing — destroys morphological features
- Prolonged suffocation — slow and damages specimens from struggling
```

**Got:** Specimens dispatched quickly (within minutes) with minimal damage to morphological features. Lepidoptera kept separate to prevent scale loss from contact with other specimens.

**If fail:** Ethyl acetate unavailable? Freezing is best alternative for most taxa. In field without either? Place specimens in individual vials or envelopes (for Lepidoptera, use glassine envelopes with wings folded), freeze upon return. Do not leave live insects in sealed container without killing agent — they will damage themselves.

### Step 4: Pin Specimens (Dry Preservation)

Pin each specimen through correct location for its order. Proper pin placement essential for both access to diagnostic features and long-term structural integrity.

```
Pin Placement by Order:
+--------------------+------------------------------------------+
| Order              | Pin Position                             |
+--------------------+------------------------------------------+
| Coleoptera         | Through the RIGHT ELYTRON (front wing    |
| (beetles)          | cover), approximately 1/3 from the       |
|                    | anterior edge, so the pin emerges        |
|                    | between the middle and hind legs.        |
+--------------------+------------------------------------------+
| Lepidoptera        | Through the CENTER OF THE THORAX         |
| (butterflies/moths)| (mesothorax), between the wing bases.    |
|                    | Wings must be spread on a spreading      |
|                    | board before the specimen dries.         |
+--------------------+------------------------------------------+
| Hymenoptera        | Through the RIGHT SIDE OF THE THORAX     |
| (bees/wasps/ants)  | (mesothorax), between the wing bases.    |
+--------------------+------------------------------------------+
| Diptera            | Through the RIGHT SIDE OF THE THORAX     |
| (flies)            | (mesothorax), between the wing bases.    |
+--------------------+------------------------------------------+
| Hemiptera          | Through the RIGHT SIDE OF THE            |
| (true bugs)        | SCUTELLUM (triangular plate between      |
|                    | wing bases), slightly to the right of    |
|                    | center.                                  |
+--------------------+------------------------------------------+
| Orthoptera         | Through the RIGHT SIDE OF THE            |
| (grasshoppers)     | PRONOTUM (just behind the head), to      |
|                    | the right of the midline.                |
+--------------------+------------------------------------------+
| Odonata            | Through the CENTER OF THE THORAX.        |
| (dragonflies)      | Wings must be spread. Alternatively,     |
|                    | store in glassine envelopes.             |
+--------------------+------------------------------------------+
| All other orders   | Through the RIGHT SIDE OF THE THORAX     |
|                    | unless order-specific guidance is        |
|                    | available.                               |
+--------------------+------------------------------------------+

Pin Selection:
- Standard entomological pins: stainless steel, sizes 0-7
- Size 3 (0.50mm) is the most commonly used general-purpose size
- Size 1-2 for small beetles and flies; size 4-5 for large beetles
- Specimens under 5mm: mount on a paper point (triangular card
  glued to a standard pin) rather than pinning directly

Pin Height:
- The specimen should sit approximately 2/3 up the pin (leaving
  room below for 2 labels and above for handling)
- Use a pinning block (stepped block with 3 heights) to ensure
  consistent specimen and label heights across the collection

Spreading Wings (Lepidoptera, Odonata):
1. Pin the specimen through the thorax
2. Place on the spreading board with the body in the groove
3. Use paper strips to hold wings in position
4. Adjust wings so the hind margin of the forewing is perpendicular
   to the body axis
5. Leave on the board for 3-7 days until completely dry
6. Remove paper strips carefully
```

**Got:** Each specimen pinned through correct position for its order, at correct height on pin, with wings spread where required (Lepidoptera, Odonata). Specimens allowed to dry fully before handling.

**If fail:** Specimen too dry and brittle to pin (legs snapping, wings cracking)? Needs relaxing first. Place specimen in relaxing chamber (sealed container with damp sand or paper towels and few drops of phenol to prevent mold) for 24-48 hours until limbs are pliable. Pin placed in wrong position? Better to carefully re-pin while specimen still fresh than leave incorrectly mounted.

### Step 5: Preserve in Ethanol (Wet Preservation)

Soft-bodied specimens that would shrivel or distort if dried must be preserved in liquid.

```
Wet Preservation Protocol:
+--------------------+------------------------------------------+
| Category           | Procedure                                |
+--------------------+------------------------------------------+
| Preservative       | 70-80% ethanol for morphological study.  |
|                    | 95-100% ethanol for DNA-grade            |
|                    | preservation (change ethanol after 24    |
|                    | hours to remove dilution from body       |
|                    | fluids).                                 |
+--------------------+------------------------------------------+
| Suitable specimens | Larvae (caterpillars, grubs, maggots),   |
|                    | soft-bodied adults (aphids, termites,    |
|                    | some small Diptera), aquatic insects,    |
|                    | immature stages (nymphs, pupae)          |
+--------------------+------------------------------------------+
| Containers         | Glass vials with screw caps or           |
|                    | polyethylene snap-cap vials. Avoid       |
|                    | rubber stoppers (ethanol dissolves       |
|                    | them). Label goes INSIDE the vial.       |
+--------------------+------------------------------------------+
| Fluid ratio        | At least 3 parts preservative to 1 part  |
|                    | specimen volume. Too little fluid        |
|                    | results in poor preservation.            |
+--------------------+------------------------------------------+
| Long-term storage  | Check fluid levels every 6-12 months.    |
|                    | Ethanol evaporates even through sealed   |
|                    | caps. Top up as needed. Store in a cool, |
|                    | dark location.                           |
+--------------------+------------------------------------------+

Do NOT use:
- Formaldehyde/formalin for routine insect preservation (destroys DNA,
  poses health risks, requires special disposal). Some historical
  collections used it; modern practice strongly discourages it.
- Isopropanol as a substitute — it causes excessive hardening and
  color loss compared to ethanol.
```

**Got:** Soft-bodied specimens preserved in 70-80% ethanol (or 95%+ for DNA work) in labeled vials with sufficient fluid volume.

**If fail:** Ethanol unavailable in field? Specimens can be temporarily stored in high-proof clear spirits (vodka, Everclear) as emergency measure. Transfer to laboratory-grade ethanol as soon as possible. Specimens stored too long in weak preservative, show decomposition? May still be identifiable but unsuitable for molecular work.

### Step 6: Label Every Specimen

Every specimen must carry labels providing minimum data needed for scientific use. Unlabeled specimen has no scientific value.

```
Labeling Standards:

LABEL 1 (Locality label — placed closest to the specimen on the pin):
  Line 1: Country, State/Province
  Line 2: Specific locality (e.g., "3 km NE of Oakville, Elm Creek trail")
  Line 3: Latitude/Longitude (decimal degrees preferred)
  Line 4: Elevation (meters above sea level)
  Line 5: Date (e.g., 15.vi.2026 or 15-Jun-2026)
  Line 6: Collector name (e.g., "leg. P. Thoss")

LABEL 2 (Habitat/method label — below the locality label):
  Line 1: Habitat (e.g., "deciduous forest, oak canopy")
  Line 2: Collection method (e.g., "sweep net" or "light trap")
  Line 3: Additional ecological data if relevant

LABEL 3 (Determination label — lowest on the pin, added when identified):
  Line 1: Order Family
  Line 2: Genus species Author, Year
  Line 3: "det. [identifier name], [year]"

Label Format Rules:
- Use archival-quality paper (acid-free, resistant to fumigant chemicals)
- Print labels using a laser printer (inkjet fades; handwriting smudges)
- Labels should be small (approximately 13mm x 8mm) — do not obscure
  the specimen
- For wet specimens, the label goes INSIDE the vial on acid-free paper
  written in pencil or printed with a laser printer (ink dissolves in
  ethanol; pencil graphite does not)
- Pin labels below the specimen using the pinning block for consistent
  heights
```

**Got:** Every specimen carries at minimum a locality label with country, locality, coordinates, date, collector. Wet specimens have same data on internal label written in pencil or laser-printed.

**If fail:** GPS coordinates not recorded in field? Estimate from map using locality description. Date uncertain? Record best estimate, mark with question mark. Specimen with approximate data far more valuable than one with no label at all. Never move label from one specimen to another.

### Step 7: Store and Protect the Collection

Proper storage protects specimens from physical damage, pests, environmental degradation.

```
Dry Collection Storage:
+--------------------+------------------------------------------+
| Component          | Standard                                 |
+--------------------+------------------------------------------+
| Unit trays         | Cardboard or plastic trays with foam     |
|                    | bottoms (plastazote preferred — pinnable |
|                    | and chemically inert). Specimens pinned  |
|                    | into the foam in organized rows.         |
+--------------------+------------------------------------------+
| Drawers            | Tight-fitting drawers that exclude dust  |
|                    | and pests. Glass-topped drawers allow    |
|                    | viewing without opening.                 |
+--------------------+------------------------------------------+
| Cabinets           | Steel cabinets with tight seals.         |
|                    | Compressed-air gaskets are ideal.        |
+--------------------+------------------------------------------+
| Pest management    | Place pest strips (dichlorvos/DDVP) or   |
|                    | naphthalene/paradichlorobenzene crystals  |
|                    | in each drawer. Check and replace every  |
|                    | 6 months. Museum beetle (Anthrenus) and  |
|                    | book lice (Psocoptera) are the primary   |
|                    | pests — a single infestation can destroy |
|                    | an entire drawer.                        |
+--------------------+------------------------------------------+
| Climate control    | Target: 40-50% relative humidity,        |
|                    | 18-22C temperature. Fluctuations cause   |
|                    | expansion/contraction damage. Avoid      |
|                    | direct sunlight (fades color).           |
+--------------------+------------------------------------------+

Wet Collection Storage:
- Store vials upright in racks or jars
- Check fluid levels every 6-12 months; top up with fresh ethanol
- Store in a cool, dark, well-ventilated area (ethanol fumes)
- Keep away from ignition sources (ethanol is flammable)
- For long-term storage, use screw-cap glass vials; snap-cap
  plastic vials allow more evaporation
```

**Got:** Dry specimens stored in sealed drawers with pest deterrents. Wet specimens stored upright with adequate ethanol levels. Storage area has stable temperature, humidity.

**If fail:** Proper museum storage not available? Store pinned specimens in airtight plastic containers (tackle boxes, Tupperware) with foam inserts and pest deterrent. Adequate for personal collections and short-term storage. For long-term preservation of scientifically valuable specimens, deposit in recognized museum or university collection.

### Step 8: Curate and Enter into Database

Maintain collection as living scientific resource through systematic curation, data management.

```
Curation Tasks:
+--------------------+------------------------------------------+
| Task               | Frequency                                |
+--------------------+------------------------------------------+
| Pest inspection    | Every 3-6 months. Look for frass (fine   |
|                    | powder under specimens), cast skins,     |
|                    | or live pests in drawers.                |
+--------------------+------------------------------------------+
| Fumigant refresh   | Every 6 months. Replace pest strips or   |
|                    | crystals. Ensure drawers seal tightly.   |
+--------------------+------------------------------------------+
| Ethanol top-up     | Every 6-12 months for wet collections.   |
+--------------------+------------------------------------------+
| Repair             | Re-pin loose specimens. Re-glue detached |
|                    | appendages (use water-soluble PVA glue). |
|                    | Replace damaged labels.                  |
+--------------------+------------------------------------------+
| Identification     | Send unidentified specimens to           |
| updates            | specialists. Update determination labels |
|                    | as IDs are returned — never remove old   |
|                    | determination labels; add new ones below.|
+--------------------+------------------------------------------+

Database Entry (minimum fields):
- Catalog number (unique identifier for each specimen)
- Taxon (order, family, genus, species)
- Locality (country, state, specific location, coordinates)
- Date of collection
- Collector
- Collection method
- Determiner and determination date
- Storage location (cabinet, drawer, row, position)
- Preservation type (pinned, ethanol, slide-mounted, point-mounted)

Database Standards:
- Use Darwin Core format for interoperability with global databases
  (GBIF, iDigBio)
- Record coordinates in decimal degrees (WGS84 datum)
- Use ISO 8601 date format (YYYY-MM-DD) in databases
- Assign a unique catalog number to every specimen, even if unidentified
```

**Got:** All specimens cataloged in database with unique identifiers, taxonomy, locality, date, collector, storage location. Collection on regular inspection and maintenance schedule.

**If fail:** Full database not feasible? Maintain at minimum a handwritten catalog or spreadsheet with catalog numbers corresponding to specimens. Catalog number links specimen to its data — without it, specimen and data become disconnected if labels are lost. Even simple numbered list better than no catalog.

## Checks

- [ ] Legal requirements verified, permits obtained before collecting
- [ ] Collection methods appropriate for target taxa and habitat
- [ ] Specimens dispatched humanely and promptly
- [ ] Dry specimens pinned through correct position for their order
- [ ] Lepidoptera and Odonata had wings properly spread before drying
- [ ] Soft-bodied specimens preserved in 70-80% ethanol
- [ ] Every specimen carries locality label with date, location, coordinates, collector
- [ ] Wet specimen labels written in pencil or laser-printed, placed inside vial
- [ ] Storage includes pest deterrents, stable environmental conditions
- [ ] Specimens cataloged in database or notebook with unique identifiers

## Pitfalls

- **No permits**: Illegal specimen has zero scientific value. Authorization first.
- **Over-collecting**: Minimum needed (5-10 per morphospecies per site).
- **Mixing sites in one container**: Locality data uncertain for batch. Separate container per collecting event with temp label.
- **Wrong pin position**: Obscures diagnostic features. Check order-specific position.
- **Low ethanol for DNA work**: Need 95%+ with change after 24h. 70% preserves morphology but degrades DNA.
- **No internal label in wet vial**: External labels detach. Always pencil-written or laser-printed label inside.
- **Neglected pest management**: Dermestid beetles destroy drawers in weeks. Regular monitoring, fumigant replacement mandatory.

## See Also

- `identify-insect` — morphological identification via keys
- `document-insect-sighting` — photo, contextual documentation
- `observe-insect-behavior` — behavioral observation protocols
- `survey-insect-population` — systematic population surveys
