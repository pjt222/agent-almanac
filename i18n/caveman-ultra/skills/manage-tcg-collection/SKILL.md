---
name: manage-tcg-collection
locale: caveman-ultra
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

Organize, inventory, value TCG collection → structured tracking + storage + data-driven valuation.

## Use When

- New collection → set up tracking
- Existing collection grew past casual knowledge
- Value for insurance/sale/estate
- Manage want-lists + trade binders
- Decide grading candidates by value potential

## In

- **Required**: Game(s) (Pokemon, MTG, FaB, Kayou)
- **Required**: Scope (entire / sets / specific cards)
- **Optional**: Current system (sheet, app, binder)
- **Optional**: Goal (sets, play, invest, nostalgia)
- **Optional**: Budget for supplies/grading

## Do

### Step 1: Inventory System

Tracking system matched to size.

1. Method by size:

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

2. Fields per card:
   - **Identity**: Set, num, name, variant (holo, reverse, full art)
   - **Condition**: Raw grade (NM, LP, MP, HP, DMG) or numeric
   - **Qty**: Copies owned
   - **Location**: Binder page, box label, slab
   - **Acquisition**: Date, price paid, source
   - **Value**: Market value at condition, last update
3. Set up system w/ fields
4. Cadence (weekly active, monthly stable)

→ Working system + fields, ready for entry. Matches scale.

If err: ideal app missing → sheet. Consistency > format. Sheet updated > app abandoned.

### Step 2: Catalog

Enter cards into system.

1. Sort physically first:
   - By set
   - Within set, by num ascending
   - Variants w/ base
2. Enter:
   - Bulk where possible (barcode, set checklists)
   - Honest condition — over-grade → valuation err
   - Note provenance (signed, 1st ed, prizes)
3. Large → sessions:
   - One set/box per session
   - Mark progress
   - Random sample verify
4. Cross-ref set checklists → completion %

→ All cards entered w/ condition + location. Completion % known.

If err: too large → priority: rares first, bulk-enter commons w/ est qty. 80% accurate > none.

### Step 3: Physical Storage

Store by value + use.

1. **Storage tier system**:

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

2. Env controls:
   - Cool, dry, dark (not attic/basement)
   - No direct sun, humidity, temp swings
   - Silica gel in boxes
3. Label all:
   - Box: contents (set, range, date)
   - Binder pages → location codes
   - Graded: ID matches digital
4. Update locations in system

→ All cards stored by tier w/ location in inventory. Premium protected, bulk accessible.

If err: no premium supplies → penny sleeve + top-loader min for >$10. Upgrade as available.

### Step 4: Value Collection

Current market values.

1. Pricing source:
   - **TCGPlayer Market Price**: US (MTG, Pokemon)
   - **CardMarket**: EU
   - **eBay Sold Listings**: Rare/unique
   - **PSA/BGS Price Guide**: Graded
2. Update Standard + Premium values
3. Bulk → per-set bulk pricing
4. Summary:

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

5. Grading candidates: grade-premium > grading cost
   - Rule: grade if (graded value - raw) > 2x grading cost

→ Current valuation, per-card for significant + aggregate bulk. Grading candidates flagged.

If err: stale pricing → note date + source. Rare → multi-source median. Never trust outlier.

### Step 5: Maintain + Optimize

Ongoing routines.

1. **Updates** (Step 1 cadence):
   - New acquisitions immediately
   - Premium quarterly, Standard semi-annually
   - Re-tier as values shift
2. **Want-list**:
   - Desired cards + max price
   - Cross-ref vs. trade binder
   - Price alerts if supported
3. **Analytics**:
   - Monthly value snapshots
   - Set completion %
   - Concentration risk (one card/set heavy)
4. **Annual audit**:
   - Physical vs. inventory random sample
   - Storage check (humidity, pests)
   - Re-eval grading candidates

→ Living system, current, supports buy/sell/grade/trade decisions.

If err: lapse → Premium values first, then new acquisitions. Know top values today.

## Check

- [ ] System established w/ fields
- [ ] All cards cataloged + condition + location
- [ ] Storage matches tiers
- [ ] Env controls (cool, dry, dark)
- [ ] Valued w/ current prices + dates
- [ ] Grading candidates flagged w/ cost/benefit
- [ ] Maintenance cadence followed
- [ ] Want-list maintained

## Traps

- **Over-grade own cards**: Collectors rate own +1-2 grades. Honest or use `grade-tcg-card`
- **Ignore bulk**: 800 commons @ $0.10 = $80. Track
- **Bad env**: Humidity + temp swings damage > handling. Env > sleeves
- **Stale values**: 6 months old → wildly off, esp. set release/ban
- **No backup**: Export CSV monthly. Photograph premium for insurance

## →

- `grade-tcg-card` — structured grading
- `build-tcg-deck` — deck from inventory
