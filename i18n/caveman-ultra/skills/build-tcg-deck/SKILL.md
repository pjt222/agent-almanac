---
name: build-tcg-deck
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build a competitive or casual trading card game deck. Covers archetype
  selection, mana/energy curve analysis, win condition identification,
  meta-game positioning, and sideboard construction for Pokemon TCG, Magic:
  The Gathering, Flesh and Blood, and other TCGs. Use when building a new deck
  for a tournament format or casual play, adapting an existing deck to a changed
  meta-game, evaluating whether a new set warrants a deck change, or converting
  a deck concept into a tournament-ready list.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: intermediate
  language: natural
  tags: tcg, deck-building, pokemon, mtg, fab, strategy, meta, archetype
---

# Build TCG Deck

Construct TCG deck archetype → final optimization. Works across Pokemon TCG, MTG, FaB, other major TCGs.

## Use When

- New deck for tournament format or casual
- Adapt existing deck to changed meta
- Eval whether new card/set warrants change
- Teach deck construction principles
- Convert concept → tournament-ready list

## In

- **Required**: Game (Pokemon TCG, MTG, FaB, etc.)
- **Required**: Format (Standard, Expanded, Modern, Legacy, Blitz, etc.)
- **Required**: Goal (competitive, casual, budget)
- **Optional**: Preferred archetype (aggro, control, combo, midrange)
- **Optional**: Budget constraints
- **Optional**: Current meta (top decks, expected field)

## Do

### Step 1: Define Archetype

Choose strategic identity.

1. ID available archetypes in format:
   - **Aggro**: Early pressure + efficient attackers
   - **Control**: Answer threats, win late via card advantage
   - **Combo**: Assemble card combos → powerful synergy / instant wins
   - **Midrange**: Flexible, shifts aggro ↔ control
   - **Tempo**: Resource advantage via efficient timing + disruption
2. Select based on:
   - Playstyle
   - Meta positioning (what beats top?)
   - Budget (combo needs specific expensive)
   - Format legality (bans, rotation)
3. ID 1-2 primary win conditions:
   - How does deck actually win?
   - Ideal game state to reach?
4. State archetype + win condition clearly

**→** Clear archetype + win conditions. Specific enough to guide selection, flexible to adapt.

**If err:** No archetype feels right → start w/ strongest individual cards, let archetype emerge from pool. Sometimes best deck built around a card, not concept.

### Step 2: Build Core

Select cards defining strategy.

1. **Core engine** (12-20 cards depending on game):
   - Directly enable win condition
   - Max legal copies
   - Non-negotiable — deck fails w/o
2. **Support** (8-15):
   - Find/protect core
   - Draw/search for consistency
   - Protection (counters, shields, removal)
3. **Interaction** (8-12):
   - Removal for opponent threats
   - Disruption for opponent strategy
   - Defensive opts appropriate to format
4. **Resource base** (game-specific):
   - MTG: Lands (24-26 for 60-card, 16-17 for 40-card)
   - Pokemon: Energy (8-12 basic + special)
   - FaB: Pitch value distribution (balance red/yellow/blue)

**→** Complete list at/near min deck size. Every card has role (core, support, interaction, resource).

**If err:** Exceeds format size → cut weakest support first. Core needs too many (>25) → strategy too fragile, simplify win condition.

### Step 3: Analyze Curve

Verify resource distribution supports strategy.

1. Plot **mana/energy/cost curve**:
   - Count cards at each cost (0, 1, 2, 3, 4, 5+)
   - Match archetype:
     - Aggro: peaks 1-2, drops after 3
     - Midrange: peaks 2-3, moderate at 4-5
     - Control: flatter, more high-cost finishers
     - Combo: concentrated at combo-piece costs
2. Check **color/type distribution** (MTG: color balance; Pokemon: energy coverage):
   - Resource base can reliably cast on curve?
   - Color-intensive cards need dedicated support?
3. Verify **card type balance**:
   - Enough creatures/attackers for pressure
   - Enough spells/trainers for interaction + consistency
   - No critical category missing
4. Adjust if curve doesn't support

**→** Smooth curve → deck executes strategy on time. Aggro fast, control survives early, combo assembles on schedule.

**If err:** Lumpy (too many expensive, not enough early) → swap expensive support for cheaper. Curve > any individual card.

### Step 4: Meta Positioning

Eval vs expected field.

1. ID top 5 decks in current meta (tournament results, tier lists)
2. Each top deck:
   - **Favorable**: Strategy counters theirs (+1)
   - **Even**: No structural advantage (0)
   - **Unfavorable**: Theirs counters yours (-1)
3. Calc expected win rate vs field:
   - Weight by opponent meta share
   - 60%+ vs top 5 = well-positioned
4. Poor positioning → consider:
   - Switch interaction to target worst matchups
   - Sideboard (if format allows) for unfavorable
   - Whether diff archetype better positioned

**→** Clear picture of where deck sits. Favorable + unfavorable matchups ID'd w/ specific reasons.

**If err:** Meta data unavailable → focus on versatility, interact w/ multiple strategies vs optimizing for one matchup.

### Step 5: Sideboard

Construct sideboard/side deck for format adaptation (if applicable).

1. Each unfavorable matchup (Step 4):
   - 2-4 cards significantly improve
   - High-impact, not marginal
2. Each sideboard card, know:
   - What matchup(s) it comes in against
   - What it replaces from main
   - Whether bringing it changes curve significantly
3. Verify sideboard ≤ format limits (MTG: 15, FaB: varies)
4. No sideboard card only relevant vs one fringe deck
   - Each slot covers ≥2 matchups if possible

**→** Focused sideboard meaningfully improves worst matchups w/o diluting main.

**If err:** Sideboard can't fix worst matchups → deck poorly positioned in meta. Core strategy may need adjust, not sideboard patches.

## Check

- [ ] Archetype + win conditions clearly defined
- [ ] Format legality met (bans, rotation, card count)
- [ ] Every card has defined role (core, support, interaction, resource)
- [ ] Curve supports strategy speed
- [ ] Resource base reliably casts on curve
- [ ] Meta matchups evaluated w/ specific reasoning
- [ ] Sideboard targets worst matchups w/ clear swap plans
- [ ] Budget satisfied (if applicable)

## Traps

- **Too many win conditions**: 3 ways to win → none done well. Focus 1-2
- **Curve blindness**: Powerful expensive cards w/o checking if deck casts on time
- **Ignore meta**: Building in vacuum. Best in theory loses to most common in practice
- **Emotional inclusion**: Pet card not serving strategy. Every slot earns place
- **Sideboard afterthought**: Last w/ leftover. Sideboard = part of deck, not appendix
- **Over-teching**: Narrow answers to specific decks vs proactive strategy

## →

- `grade-tcg-card` — card condition assessment for tournament legality + collection value
- `manage-tcg-collection` — inventory mgmt for tracking which cards available
