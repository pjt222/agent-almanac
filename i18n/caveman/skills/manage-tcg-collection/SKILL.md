---
name: manage-tcg-collection
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Organize, track, and value a trading card game collection. Covers inventory
  methods, storage best practices, grade-based valuation, want-list management,
  and collection analytics for Pokemon, MTG, Flesh and Blood, and Kayou cards.
  Use when starting a new collection and setting up inventory tracking, cataloging
  an existing collection that has grown beyond casual knowledge, valuing a
  collection for insurance or sale, or deciding which cards to submit for
  professional grading based on value potential.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: basic
  language: natural
  tags: tcg, collection, inventory, storage, valuation, pokemon, mtg, fab, kayou
---

# Manage TCG Collection

Organize, inventory, value card collection. Structured tracking, proper storage, data-driven valuation.

## When Use

- Start new collection, set up tracking from beginning
- Catalog existing collection grown beyond casual knowledge
- Value collection for insurance, sale, estate
- Manage want-lists, trade binders for target cards
- Decide which cards send for pro grading based on value

## Inputs

- **Required**: Card game(s) in collection (Pokemon, MTG, FaB, Kayou, etc.)
- **Required**: Collection scope (whole, specific sets, specific cards)
- **Optional**: Current inventory system (spreadsheet, app, binder org)
- **Optional**: Goal (complete sets, competitive play, investment, nostalgia)
- **Optional**: Budget for storage + grading supplies

## Steps

### Step 1: Set Inventory System

Pick tracking system to match collection size.

1. Choose method by size:

```
Collection Size Guide:
+-----------+-------+-------------------------------------------+
| Size      | Cards | Recommended System                        |
+-----------+-------+-------------------------------------------+
| Small     | <200  | Spreadsheet (Google Sheets, Excel)         |
| Medium    | 200-  | Dedicated app (TCGPlayer, Moxfield,        |
|           | 2000  | PokeCollector, Collectr)                   |
| Large     | 2000+ | Database + app combo with barcode scanning |
+-----------+-------+-------------------------------------------+
```

2. Define data fields per card:
   - **Identity**: Set, card number, name, variant (holo, reverse, full art)
   - **Condition**: Raw grade estimate (NM, LP, MP, HP, DMG) or numeric grade
   - **Quantity**: Copies owned
   - **Location**: Where stored (binder page, box label, graded slab)
   - **Acquisition**: Date, price paid, source (pack, purchase, trade)
   - **Value**: Current market value at condition, last update date
3. Set up system with these fields
4. Set update cadence (weekly active, monthly stable)

**Got:** Functional inventory system, fields defined, ready for entry. Matches scale — not over-engineered for small, not under-powered for large.

**If fail:** Ideal app missing for game/platform? Use spreadsheet. Format matters less than consistency. Simple spreadsheet kept current beats fancy app abandoned in week.

### Step 2: Catalog Collection

Enter cards into system.

1. Sort physically before digital entry:
   - By set (one set together)
   - Within set, by card number ascending
   - Variants grouped with base card
2. Enter cards:
   - Use bulk entry where available (barcode, set checklists)
   - Record condition honest — over-grading own cards causes valuation errors
   - Note special provenance (signed, first edition, tournament prizes)
3. Large collections, work in sessions:
   - One set or one box per session
   - Mark progress (which boxes/binders done)
   - Verify random sample each session for accuracy
4. Cross-reference set checklists, find completion percentages

**Got:** Every card entered with accurate condition + location. Completion known per set.

**If fail:** Too large for manual entry? Prioritize: rare/valuable cards first, bulk-enter commons by set with estimated quantities. 80% accurate inventory beats none.

### Step 3: Organize Physical Storage

Store cards by value + use.

1. Apply **storage tier system**:

```
Storage Tiers:
+----------+---------------+----------------------------------------------+
| Tier     | Card Value    | Storage Method                               |
+----------+---------------+----------------------------------------------+
| Premium  | >$50          | Top-loader + team bag, or penny sleeve in    |
|          |               | magnetic case. Stored upright in a box.       |
| Standard | $5-$50        | Penny sleeve + top-loader or binder with      |
|          |               | side-loading pages.                          |
| Bulk     | <$5           | Row box (BCW 800-count or similar), sorted    |
|          |               | by set. No individual sleeves needed.         |
| Graded   | Any (slabbed) | Upright in graded card box. Never stack heavy.|
+----------+---------------+----------------------------------------------+
```

2. Environment controls:
   - Cool, dry, dark place (not attic, not basement)
   - Avoid direct sun, humidity, temperature swings
   - Silica gel packets in boxes for moisture
3. Label everything:
   - Each box: contents (set name, card range, date)
   - Each binder page matches inventory location codes
   - Graded cards labeled with inventory ID matching digital system
4. Update inventory with storage locations

**Got:** Every card stored proper for value, location data in inventory. Premium protected, bulk organized + accessible.

**If fail:** Premium supplies missing now? Penny sleeves + top-loaders always minimum for any card worth >$10. Upgrade as supplies arrive — priority is valuable cards in some protection.

### Step 4: Value Collection

Calculate current market values.

1. Pick pricing source:
   - **TCGPlayer Market Price**: Common US market (MTG, Pokemon)
   - **CardMarket**: Standard EU market
   - **eBay Sold Listings**: Best for rare/unique without standard pricing
   - **PSA/BGS Price Guide**: Graded cards specifically
2. Update values for Standard + Premium tier cards
3. Bulk cards: use per-set bulk pricing not individual lookup
4. Calculate summary:

```
Collection Value Summary:
+------------------+--------+--------+
| Category         | Count  | Value  |
+------------------+--------+--------+
| Graded cards     |        | $      |
| Premium ungraded |        | $      |
| Standard cards   |        | $      |
| Bulk cards       |        | $      |
+------------------+--------+--------+
| TOTAL            |        | $      |
+------------------+--------+--------+
```

5. Find grading candidates: cards where grade-premium > grading cost
   - Rule of thumb: grade if (expected graded value - raw value) > 2x grading cost

**Got:** Current valuation, per-card values for significant cards, aggregate values for bulk. Grading candidates found.

**If fail:** Pricing data stale or missing? Note pricing date + source. Very rare cards: check multiple sources, use median. Never trust single outlier sale.

### Step 5: Maintain + Optimize

Set ongoing routines.

1. **Regular updates** (cadence from Step 1):
   - Enter new acquisitions immediately
   - Premium tier values quarterly, Standard semi-annually
   - Re-assess storage tier when values change
2. **Want-list management**:
   - List desired cards with max prices
   - Cross-reference want-list vs trade binder
   - Price alerts where app supports
3. **Collection analytics**:
   - Track total value over time (monthly snapshots)
   - Monitor set completion percentages
   - Find concentration risk (too much value in one card/set)
4. **Periodic audit** (annually):
   - Physical count vs inventory count for random sample
   - Verify storage conditions (humidity, pest damage)
   - Review + update grading candidates by current values

**Got:** Living management system stays current. Supports informed decisions on buy, sell, grade, trade.

**If fail:** Maintenance lapses? Prioritize: Premium tier values first, then catch up on new acquisitions. Most important: know what most valuable cards worth today.

## Checks

- [ ] Inventory system set with proper data fields
- [ ] All cards cataloged with condition + location
- [ ] Physical storage matches value tiers
- [ ] Environment controls in place (cool, dry, dark)
- [ ] Collection valued with current prices + dates
- [ ] Grading candidates found with cost/benefit
- [ ] Maintenance cadence set + followed
- [ ] Want-list maintained for acquisition targets

## Pitfalls

- **Over-grading own cards**: Collectors rate own cards 1-2 grades higher than reality. Be honest or use `grade-tcg-card` for structured assessment
- **Ignoring bulk**: Bulk cards stack value. Box of 800 commons at $0.10 each = $80 — worth tracking
- **Poor storage environment**: Humidity + temperature swings damage cards faster than handling. Environment matters more than sleeves
- **Stale valuations**: Card markets move. Valuation from 6 months ago wildly inaccurate, especially around set releases or ban announcements
- **No backup**: Digital inventory without backup is fragile. Export CSV monthly. Photograph premium cards for insurance

## See Also

- `grade-tcg-card` — Structured grading for accurate condition assessment
- `build-tcg-deck` — Deck construction from collection inventory
