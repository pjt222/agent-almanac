---
name: manage-tcg-collection
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

Organize, inventory, and value a trading card game collection with structured tracking, proper storage, and data-driven valuation.

## When to Use

- Starting a new collection and setting up inventory tracking from the beginning
- Cataloging an existing collection that has grown beyond casual knowledge
- Valuing a collection for insurance, sale, or estate purposes
- Managing want-lists and trade binders for acquiring specific cards
- Deciding which cards to submit for professional grading based on value potential

## Inputs

- **Required**: Card game(s) in the collection (Pokemon, MTG, FaB, Kayou, etc.)
- **Required**: Collection scope (entire collection, specific sets, or specific cards)
- **Optional**: Current inventory system (spreadsheet, app, physical binder organization)
- **Optional**: Collection goal (complete sets, competitive play, investment, nostalgia)
- **Optional**: Budget for storage and grading supplies

## Procedure

### Step 1: Establish the Inventory System

Set up a tracking system appropriate to the collection's size.

1. Choose an inventory method based on collection size:

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

2. Define the data fields to track for each card:
   - **Identity**: Set, card number, name, variant (holo, reverse, full art)
   - **Condition**: Raw grade estimate (NM, LP, MP, HP, DMG) or numeric grade
   - **Quantity**: How many copies owned
   - **Location**: Where the card is stored (binder page, box label, graded slab)
   - **Acquisition**: Date acquired, price paid, source (pack, purchase, trade)
   - **Value**: Current market value at condition, last updated date
3. Set up the chosen system with these fields
4. Establish an update cadence (weekly for active collectors, monthly for stable collections)

**Expected:** A functional inventory system with defined fields, ready for data entry. The system matches the collection's scale — not over-engineered for a small collection, not under-powered for a large one.

**On failure:** If the ideal app isn't available for your game/platform, use a spreadsheet. The format matters less than consistency. A simple spreadsheet updated regularly beats a sophisticated app abandoned after a week.

### Step 2: Catalog the Collection

Enter existing cards into the inventory system.

1. Sort cards physically before entering digitally:
   - By set (all cards from one set together)
   - Within set, by card number (ascending)
   - Variants grouped with their base card
2. Enter cards into the system:
   - Use bulk entry where available (barcode scanning, set checklists)
   - Record condition honestly — over-grading your own cards leads to valuation errors
   - Note any cards with special provenance (signed, first edition, tournament prizes)
3. For large collections, work in sessions:
   - Process one set or one storage box per session
   - Mark progress clearly (which boxes/binders are done)
   - Verify a random sample from each session for accuracy
4. Cross-reference against set checklists to identify completion percentages

**Expected:** Every card in the collection entered with accurate condition and location data. Completion percentages known for each set being collected.

**On failure:** If the collection is too large for manual entry, prioritize: enter all rare/valuable cards first, then bulk-enter commons by set with estimated quantities. An 80% accurate inventory is far better than no inventory.

### Step 3: Organize Physical Storage

Store cards appropriately for their value and use.

1. Apply the **storage tier system**:

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

2. Environmental controls:
   - Store in a cool, dry, dark location (not attic, not basement)
   - Avoid direct sunlight, humidity, and temperature swings
   - Use silica gel packets in storage boxes for moisture control
3. Label everything:
   - Each box labeled with contents (set name, card range, date stored)
   - Each binder page corresponds to inventory location codes
   - Graded cards labeled with inventory ID matching digital system
4. Update the inventory system with storage locations

**Expected:** Every card stored appropriately for its value with location data in the inventory. Premium cards are protected, bulk cards are organized and accessible.

**On failure:** If premium storage supplies aren't available immediately, penny sleeves + top-loaders are always the minimum for any card worth >$10. Upgrade storage as supplies become available; the priority is getting valuable cards into some form of protection.

### Step 4: Value the Collection

Calculate current market values.

1. Choose a pricing source:
   - **TCGPlayer Market Price**: Most common for US market (MTG, Pokemon)
   - **CardMarket**: Standard for European market
   - **eBay Sold Listings**: Best for rare/unique items without standard pricing
   - **PSA/BGS Price Guide**: For graded cards specifically
2. Update values for all Standard and Premium tier cards
3. For bulk cards, use per-set bulk pricing rather than individual lookups
4. Calculate collection summary:

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

5. Identify grading candidates: cards where the grade-premium exceeds grading costs
   - Rule of thumb: grade if (expected graded value - raw value) > 2x grading cost

**Expected:** A current valuation of the collection with per-card values for significant cards and aggregate values for bulk. Grading candidates identified.

**On failure:** If pricing data is stale or unavailable, note the pricing date and source. For very rare cards, check multiple sources and use the median. Never rely on a single outlier sale.

### Step 5: Maintain and Optimize

Establish ongoing collection management routines.

1. **Regular updates** (match cadence from Step 1):
   - Enter new acquisitions immediately
   - Update values for Premium tier quarterly, Standard tier semi-annually
   - Re-assess storage tier as values change
2. **Want-list management**:
   - Maintain a list of desired cards with maximum prices
   - Cross-reference want-list against trade binder inventory
   - Set price alerts where supported by the inventory app
3. **Collection analytics**:
   - Track total value over time (monthly snapshots)
   - Monitor set completion percentages
   - Identify concentration risk (too much value in one card/set)
4. **Periodic audit** (annually):
   - Physical count vs. inventory count for a random sample
   - Verify storage conditions (check for humidity, pest damage)
   - Review and update grading candidates based on current values

**Expected:** A living collection management system that stays current and supports informed decisions about buying, selling, grading, and trading.

**On failure:** If maintenance lapses, prioritize: update Premium tier values first, then catch up on new acquisitions. The most important thing is knowing what your most valuable cards are worth today.

## Validation Checklist

- [ ] Inventory system established with appropriate data fields
- [ ] All cards cataloged with condition and location data
- [ ] Physical storage matches card value tiers
- [ ] Environmental controls in place (cool, dry, dark)
- [ ] Collection valued with current market prices and dates
- [ ] Grading candidates identified with cost/benefit analysis
- [ ] Maintenance cadence established and followed
- [ ] Want-list maintained for acquisition targets

## Common Pitfalls

- **Over-grading own cards**: Collectors consistently rate their own cards 1-2 grades higher than reality. Be honest or use `grade-tcg-card` for structured assessment
- **Ignoring bulk**: Bulk cards accumulate value collectively. A box of 800 commons at $0.10 each is $80 — worth tracking
- **Poor storage environment**: Humidity and temperature swings damage cards faster than handling. Environment matters more than sleeves
- **Stale valuations**: Card markets move. A valuation from 6 months ago may be wildly inaccurate, especially around set releases or ban announcements
- **No backup**: Digital inventory without backup is fragile. Export to CSV monthly. Photograph premium cards for insurance

## Related Skills

- `grade-tcg-card` — Structured card grading for accurate condition assessment
- `build-tcg-deck` — Deck construction using the collection inventory
