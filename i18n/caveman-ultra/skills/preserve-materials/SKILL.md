---
name: preserve-materials
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Preserve + conserve library + archival materials. Environmental controls
  (temp, humidity, light), handling, book repair (torn pages, loose spines,
  foxing), acid-free storage, digitization for preservation, disaster recovery.
  Use → establish preservation for new/existing collection, materials show
  deterioration, set up environmental controls for storage, plan digitization
  for fragile originals, create disaster recovery plan.
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

Preserve + conserve library + archival materials via environmental control, proper handling, repair, disaster prep.

## Use When

- Establish preservation for new/existing collection
- Materials show deterioration (foxing, brittleness, loose bindings)
- Set up environmental controls for storage/display
- Plan digitization for fragile originals
- Disaster recovery plan for library/archive

## In

- **Required**: Materials (books, manuscripts, photos, maps, media)
- **Required**: Current storage conditions (temp, humidity, light exposure)
- **Optional**: Budget for supplies + equipment
- **Optional**: Digitization equipment (scanner, camera, software)
- **Optional**: Condition survey of existing collection

## Do

### Step 1: Assess Current Conditions

Survey environment + materials → baseline.

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

→ Baseline data for environmental + material health, ID immediate risks + long-term trends.

If err: monitoring equipment unavailable → basic thermometer/hygrometer from hardware store. Imprecise data >> no data. Prioritize humidity → most damaging environmental factor.

### Step 2: Establish Environmental Controls

Conditions slow deterioration.

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

→ Conditions in target ranges, monitored continuously, doc'd response procedures for excursions.

If err: HVAC not controllable (rental, historic building) → focus microenvironments: archival boxes, silica gel, sealed display cases create local control even when room can't be managed.

### Step 3: Handle Materials Properly

Prevent damage from top source: human handling.

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

→ All users + staff follow handling. No new damage from routine use.

If err: damage from handling → repair promptly (Step 4) + retrain. Most handling damage cumulative — single headcap pull won't destroy, but daily will.

### Step 4: Repair Damaged Materials

Conservation treatments matched to damage level.

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

→ Damaged items stabilized via reversible treatments, doc'd in catalog record.

If err: repair exceeds skill level → stabilize (wrap in acid-free tissue, place in protective box) + flag for professional. Bad repair > no repair.

### Step 5: Store in Archival Materials

Replace harmful storage materials w/ acid-free alts.

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

→ All materials in archival-quality containers, free from acidic/harmful enclosures.

If err: archival supplies > budget → prioritize most valuable + fragile first. Even acid-free tissue between book + cardboard significantly slows acid migration.

### Step 6: Plan for Disasters

Response plan for water, fire, mold, other emergencies.

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

→ Written disaster plan, pre-positioned supplies, trained response team (even if "team" = one person).

If err: disaster w/o plan → 48-hour rule for water damage = critical knowledge. Wet materials → air-drying or frozen w/in 48 hrs. Everything else can wait.

## Check

- [ ] Environmental baseline established (temp, humidity, light)
- [ ] Monitoring in place (continuous datalogger or daily readings)
- [ ] Handling procedures doc'd + followed
- [ ] Damaged items triaged + repaired or stabilized
- [ ] Harmful storage replaced w/ acid-free alts
- [ ] Disaster plan written w/ priority list + emergency contacts
- [ ] High-value/fragile items prioritized

## Traps

- **Humidity neglect**: Temp gets attention, but humidity = primary driver of mold, foxing, warping, pests. Monitor humidity first.
- **Irreversible repairs**: Superglue, pressure-sensitive tape, rubber cement permanently damage paper. Always reversible (wheat starch paste, PVA).
- **Over-handle during preservation**: Zealous efforts → more handling damage than benign neglect. Sometimes best preservation = leave undisturbed in good environment.
- **Treat foxing aggressively**: Bleaching removes spots but weakens fibers. Accept cosmetic imperfections unless they threaten legibility.
- **No disaster plan**: Most libraries losing collections to water damage had no plan + no pre-positioned supplies. Plan costs nothing; loss costs everything.

## →

- `catalog-collection` — catalog records note preservation actions + condition
- `curate-collection` — weeding decisions consider condition alongside use
- `maintain-hand-tools` — tool care principles (clean, oil, store) parallel material care
