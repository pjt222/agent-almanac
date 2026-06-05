---
name: preserve-materials
description: >
  Preserve and conserve library and archival materials. Covers environmental
  controls (temperature, humidity, light), handling procedures, book repair
  techniques (torn pages, loose spines, foxing), acid-free storage, digitization
  for preservation, and disaster recovery planning. Use when establishing
  preservation practices for a new or existing collection, when materials show
  signs of deterioration, when setting up environmental controls for storage,
  when planning digitization to preserve fragile originals, or when creating a
  disaster recovery plan for a library or archive.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: library-science
  complexity: advanced
  language: natural
  tags: library-science, preservation, conservation, book-repair, archival, acid-free, digitization
---

# Preserve Materials

Preserve and conserve library and archival materials through environmental control, proper handling, repair techniques, and disaster preparedness.

## When to Use

- You are establishing preservation practices for a new or existing collection
- Materials show signs of deterioration (foxing, brittleness, loose bindings)
- You need to set up environmental controls for a storage or display area
- You are planning digitization to preserve fragile originals
- You need a disaster recovery plan for a library or archive

## Inputs

- **Required**: Materials to preserve (books, manuscripts, photographs, maps, media)
- **Required**: Current storage conditions (temperature, humidity, light exposure)
- **Optional**: Budget for preservation supplies and equipment
- **Optional**: Digitization equipment (scanner, camera, software)
- **Optional**: Condition survey of existing collection

## Procedure

### Step 1: Assess Current Conditions

Survey the environment and the materials to establish a baseline.

```
Environmental Assessment Checklist:
+-----------------------+------------------+---------------------+
| Factor                | Ideal Range      | Measure With        |
+-----------------------+------------------+---------------------+
| Temperature           | 18-21°C          | Thermometer with    |
|                       | (65-70°F)        | min/max recording   |
+-----------------------+------------------+---------------------+
| Relative Humidity     | 30-50% RH        | Hygrometer or       |
|                       |                  | datalogger          |
+-----------------------+------------------+---------------------+
| Light (storage)       | <50 lux          | Light meter         |
|                       | No UV            |                     |
+-----------------------+------------------+---------------------+
| Light (display)       | <200 lux         | Light meter +       |
|                       | UV filtered      | UV filter readings  |
+-----------------------+------------------+---------------------+
| Air quality           | Low dust, no     | Visual inspection,  |
|                       | pollutants       | HVAC filter check   |
+-----------------------+------------------+---------------------+

Material Condition Survey (sample 10% of collection):
- Excellent: No visible damage, binding intact, pages flexible
- Good: Minor wear, slight yellowing, binding sound
- Fair: Moderate foxing, some loose pages, spine cracked
- Poor: Brittle pages, detached covers, active mold or pest damage
- Critical: Pages fragmenting, structural failure, immediate intervention needed

Record the percentage in each condition category.
```

**Expected:** Baseline data for environmental conditions and material health, identifying immediate risks and long-term trends.

**On failure:** If monitoring equipment is unavailable, use a basic thermometer/hygrometer from a hardware store. Imprecise data is far better than no data. Prioritize humidity monitoring — it is the single most damaging environmental factor.

### Step 2: Establish Environmental Controls

Create and maintain the conditions that slow deterioration.

```
Environmental Control Priorities (in order of impact):

1. HUMIDITY CONTROL (most critical)
   - Target: 30-50% RH, with <5% daily fluctuation
   - Too high (>60%): mold growth, foxing, warping
   - Too low (<25%): brittleness, cracking, flaking
   - Solutions: dehumidifier, humidifier, HVAC control, silica gel
   - Monitor continuously with datalogger

2. TEMPERATURE CONTROL
   - Target: 18-21°C (65-70°F), with <3°C daily fluctuation
   - Lower is better for long-term preservation (slows chemical decay)
   - Stability matters more than exact temperature
   - Never store near exterior walls, heating vents, or pipes

3. LIGHT MANAGEMENT
   - UV radiation causes irreversible fading and embrittlement
   - Filter all windows with UV film (blocks >99% UV)
   - Use LED lighting (no UV emission) instead of fluorescent
   - Keep lights off in storage areas when not in use
   - Display items on rotation (3-6 months on, then rest)

4. AIR QUALITY
   - HVAC filters: minimum MERV 8, ideally MERV 13
   - No food or drink near materials
   - Avoid off-gassing materials (fresh paint, new carpet, cardboard)
   - Ensure air circulation to prevent microclimate pockets

5. PEST MANAGEMENT (IPM)
   - Inspect incoming materials before shelving
   - Sticky traps at floor level, checked monthly
   - No cardboard boxes (pest habitat) — use archival containers
   - If pests found: isolate affected items, freeze treatment
     (-20°C for 72 hours kills most book pests)
```

**Expected:** Environmental conditions within target ranges, monitored continuously, with documented response procedures for excursions.

**On failure:** If HVAC is not controllable (rental space, historic building), focus on microenvironments: archival boxes, silica gel packets, and sealed display cases create local climate control even when the room cannot be managed.

### Step 3: Handle Materials Properly

Prevent damage from the most common source: human handling.

```
Handling Rules:
1. Clean, dry hands — no gloves for paper (reduces grip and
   dexterity; gloves are for photographs and metal objects)
2. Support the spine: never pull a book by the headcap
   - Push neighboring books back, then grip the desired book
     by both boards at the middle of the spine
3. Never force a book open past its natural opening angle
4. Use book cradles or foam wedges for fragile bindings
5. Pencils only near materials — never pen or ink
6. Flatwork (maps, prints): handle with two hands, support
   full sheet, never fold or roll unless already in that format
7. Photographs: handle by edges only, cotton gloves required
8. Transport: use book trucks with padded shelves, never stack
   more than 3 volumes, never carry more than you can control

Shelving Rules:
- Books upright, snug but not tight
- Oversize volumes flat (never leaning at an angle)
- No bookends that press into the text block
- Pamphlets in acid-free pamphlet binders, not loose on shelves
```

**Expected:** All users and staff follow handling procedures. No new damage from routine use.

**On failure:** If damage occurs from handling, repair promptly (Step 4) and retrain the person involved. Most handling damage is cumulative — a single instance of pulling by the headcap won't destroy a book, but doing it daily will.

### Step 4: Repair Damaged Materials

Perform conservation treatments matched to the damage level.

```
Repair Triage Matrix:
+---------------------+---------------------+----------------------------+
| Damage              | Severity            | Treatment                  |
+---------------------+---------------------+----------------------------+
| Torn page           | Minor               | Japanese tissue + wheat    |
|                     |                     | starch paste (reversible)  |
+---------------------+---------------------+----------------------------+
| Loose page          | Minor               | Tip-in with PVA adhesive   |
|                     |                     | along inner margin         |
+---------------------+---------------------+----------------------------+
| Detached cover      | Moderate            | Recase: new endsheets,     |
|                     |                     | reattach cover boards      |
+---------------------+---------------------+----------------------------+
| Cracked spine       | Moderate            | Spine repair with airplane |
|                     |                     | linen and adhesive         |
+---------------------+---------------------+----------------------------+
| Foxing (brown spots)| Cosmetic            | Do NOT bleach. Reduce      |
|                     |                     | humidity to prevent spread  |
+---------------------+---------------------+----------------------------+
| Brittle pages       | Severe              | Deacidification spray      |
|                     |                     | (Bookkeeper or Wei T'o)    |
+---------------------+---------------------+----------------------------+
| Mold (active)       | Critical            | Isolate immediately.       |
|                     |                     | Dry in moving air. Brush   |
|                     |                     | off when dry. HEPA vacuum. |
+---------------------+---------------------+----------------------------+
| Water damage        | Critical/Emergency  | Air dry within 48 hours    |
|                     |                     | or freeze for later drying |
+---------------------+---------------------+----------------------------+

Conservation Principles:
1. REVERSIBILITY: Any treatment should be undoable without
   damaging the original (use wheat starch paste, not superglue)
2. MINIMAL INTERVENTION: Do the least necessary to stabilize.
   Not every old book needs to look new
3. DOCUMENTATION: Photograph before and after. Record materials
   and methods used in the catalog record
4. KNOW YOUR LIMITS: Complex repairs (rebinding, leaf casting,
   leather treatment) require trained conservators

Essential Repair Supplies:
- Japanese tissue (various weights: 3-12 gsm)
- Wheat starch paste (cook fresh or use premixed)
- PVA adhesive (pH-neutral, archival grade)
- Bone folder
- Microspatula
- Waxed paper (for interleaving during drying)
- Book press or weights
```

**Expected:** Damaged items stabilized using reversible treatments, with documentation in the catalog record.

**On failure:** If a repair exceeds your skill level, stabilize the item (wrap in acid-free tissue, place in a protective box) and flag it for professional conservation. A bad repair is worse than no repair.

### Step 5: Store in Archival Materials

Replace harmful storage materials with acid-free alternatives.

```
Storage Material Standards:
+-------------------+---------------------------+---------------------------+
| Material          | Avoid                     | Use Instead               |
+-------------------+---------------------------+---------------------------+
| Boxes             | Corrugated cardboard      | Acid-free/lignin-free     |
|                   | (acidic, attracts pests)  | document boxes            |
+-------------------+---------------------------+---------------------------+
| Folders           | Manila folders (acidic)    | Acid-free folders         |
+-------------------+---------------------------+---------------------------+
| Tissue            | Regular tissue paper      | Acid-free, unbuffered     |
|                   |                           | tissue (for photos too)   |
+-------------------+---------------------------+---------------------------+
| Sleeves           | PVC plastic (off-gasses)  | Polyester (Mylar),        |
|                   |                           | polypropylene, or         |
|                   |                           | polyethylene              |
+-------------------+---------------------------+---------------------------+
| Envelopes         | Glassine (not all         | Acid-free paper or        |
|                   | archival grade)           | Tyvek envelopes           |
+-------------------+---------------------------+---------------------------+
| Labels/tape       | Pressure-sensitive tape,  | Linen tape (water-        |
|                   | rubber bands, paper clips | activated), cotton ties   |
+-------------------+---------------------------+---------------------------+

Special Format Storage:
- Photographs: individual sleeves, upright in acid-free boxes
- Newspapers: unfold, interleave with acid-free tissue, flat storage
- Maps/large prints: flat in map cabinets or rolled (face out) on
  acid-free tubes (minimum 4" diameter)
- Audio/video media: upright, in jewel cases, cool and dry
```

**Expected:** All materials housed in appropriate archival-quality containers, free from acidic or harmful enclosures.

**On failure:** If archival supplies are beyond budget, prioritize the most valuable and fragile items first. Even placing acid-free tissue between a book and a cardboard box significantly slows acid migration.

### Step 6: Plan for Disasters

Prepare a response plan for water, fire, mold, and other emergencies.

```
Disaster Preparedness Essentials:

1. PRIORITY LIST: Rank items for salvage priority (1-3)
   - Priority 1: Unique, irreplaceable items (manuscripts, archives)
   - Priority 2: Rare or expensive items
   - Priority 3: Replaceable items

2. EMERGENCY SUPPLIES KIT (pre-positioned):
   - Plastic sheeting and tarps
   - Mops, buckets, sponges
   - Fans (for air drying)
   - Freezer paper and plastic bags (for freeze-drying)
   - Flashlights and batteries
   - Contact list: conservators, freeze-drying services, insurers

3. WATER EMERGENCY PROTOCOL (most common disaster):
   - Stop the water source if possible
   - Remove materials from standing water immediately
   - Separate wet items: do not stack
   - Air dry paper materials within 48 hours (mold starts at 48 hrs)
   - If too many items to dry in 48 hours: freeze them
     (-20°C stops mold, preserves for later vacuum freeze-drying)
   - Interleave wet pages with absorbent paper, change regularly
   - Never use heat to dry (causes warping and cockling)

4. DOCUMENTATION: Photograph damage for insurance before cleaning.
   Record all affected items and their condition.
```

**Expected:** A written disaster plan, pre-positioned supplies, and a trained response team (even if the "team" is one person).

**On failure:** If a disaster occurs without a plan, the 48-hour rule for water damage is the critical knowledge: get wet materials air-drying or frozen within 48 hours. Everything else can wait.

## Validation

- [ ] Environmental baseline established (temperature, humidity, light)
- [ ] Monitoring in place (continuous datalogger or daily readings)
- [ ] Handling procedures documented and followed
- [ ] Damaged items triaged and repaired or stabilized
- [ ] Harmful storage materials replaced with acid-free alternatives
- [ ] Disaster plan written with priority list and emergency contacts
- [ ] High-value or fragile items prioritized for preservation attention

## Common Pitfalls

- **Humidity neglect**: Temperature gets all the attention, but humidity is the primary driver of mold, foxing, warping, and pest infestations. Monitor humidity first
- **Irreversible repairs**: Superglue, pressure-sensitive tape, and rubber cement permanently damage paper. Always use reversible adhesives (wheat starch paste, PVA)
- **Over-handling during preservation**: Ironically, zealous preservation efforts can cause more handling damage than benign neglect. Sometimes the best preservation is leaving an item undisturbed in a good environment
- **Treating foxing aggressively**: Bleaching removes foxing spots but weakens paper fibers. Accept cosmetic imperfections unless they threaten legibility
- **No disaster plan**: Most libraries that lose collections to water damage had no plan and no pre-positioned supplies. The plan costs nothing; the loss costs everything

## Related Skills

- `catalog-collection` — Catalog records should note preservation actions and condition
- `curate-collection` — Weeding decisions consider item condition alongside use
- `maintain-hand-tools` — Tool care principles (clean, oil, store properly) parallel material care
