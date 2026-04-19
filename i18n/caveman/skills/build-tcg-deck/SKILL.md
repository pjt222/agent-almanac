---
name: build-tcg-deck
locale: caveman
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

Construct trading card game deck from archetype selection through final optimization. Follows structured process that works across Pokemon TCG, Magic: The Gathering, Flesh and Blood, other major TCGs.

## When Use

- Building new deck for specific tournament format or casual play
- Adapting existing deck to changed meta-game
- Evaluating whether new card or set release warrants deck change
- Teaching someone principles of deck construction
- Converting deck concept into tournament-ready list

## Inputs

- **Required**: Card game (Pokemon TCG, MTG, FaB, etc.)
- **Required**: Format (Standard, Expanded, Modern, Legacy, Blitz, etc.)
- **Required**: Goal (competitive tournament, casual play, budget build)
- **Optional**: Preferred archetype or strategy (aggro, control, combo, midrange)
- **Optional**: Budget constraints (maximum spend, cards already owned)
- **Optional**: Current meta-game snapshot (top decks, expected field)

## Steps

### Step 1: Define the Archetype

Choose deck's strategic identity.

1. Identify available archetypes in current format:
   - **Aggro**: Win quickly through early pressure and efficient attackers
   - **Control**: Answer threats efficiently, win in late game with card advantage
   - **Combo**: Assemble specific card combinations for powerful synergy or instant wins
   - **Midrange**: Flexible strategy shifting between aggro and control as needed
   - **Tempo**: Gain resource advantage through efficient timing and disruption
2. Select archetype based on:
   - Player preference and playstyle
   - Meta-game positioning (what beats top decks?)
   - Budget constraints (combo decks often need specific expensive cards)
   - Format legality (check ban lists and rotation status)
3. Identify 1-2 primary win conditions:
   - How does this deck actually win game?
   - What is ideal game state this deck is trying to reach?
4. State archetype selection and win condition clearly

**Got:** Clear archetype with defined win conditions. Strategy specific enough to guide card selection but flexible enough to adapt.

**If fail:** No archetype feels right? Start with strongest individual cards available, let archetype emerge from card pool. Sometimes best deck is built around a card, not a concept.

### Step 2: Build the Core

Select cards defining deck's strategy.

1. Identify **core engine** (12-20 cards depending on game):
   - Cards directly enabling win condition
   - Maximum legal copies of each core card
   - Non-negotiable — deck doesn't function without them
2. Add **support cards** (8-15 cards):
   - Cards finding or protecting core engine
   - Draw/search effects to improve consistency
   - Protection for key pieces (counters, shields, removal)
3. Add **interaction** (8-12 cards):
   - Removal for opponent's threats
   - Disruption for opponent's strategy
   - Defensive options appropriate to format
4. Fill **resource base** (game-specific):
   - MTG: Lands (typically 24-26 for 60-card, 16-17 for 40-card)
   - Pokemon: Energy cards (8-12 basic + special)
   - FaB: Pitch value distribution (balance red/yellow/blue)

**Got:** Complete deck list at or near minimum deck size for format. Every card has clear role (core, support, interaction, resource).

**If fail:** Deck list exceeds format size? Cut weakest support cards first. Core engine requires too many cards (>25)? Strategy may be too fragile — simplify win condition.

### Step 3: Analyze the Curve

Verify deck's resource distribution supports its strategy.

1. Plot **mana/energy/cost curve**:
   - Count cards at each cost point (0, 1, 2, 3, 4, 5+)
   - Verify curve matches archetype:
     - Aggro: peaks at 1-2, drops sharply after 3
     - Midrange: peaks at 2-3, moderate presence at 4-5
     - Control: flatter curve, more high-cost finishers
     - Combo: concentrated at combo-piece costs
2. Check **color/type distribution** (MTG: color balance; Pokemon: energy type coverage):
   - Can resource base reliably cast cards on curve?
   - Color-intensive cards needing dedicated resource support?
3. Verify **card type balance**:
   - Sufficient creatures/attackers to apply pressure
   - Sufficient spells/trainers for interaction and consistency
   - No critical category completely missing
4. Adjust if curve doesn't support strategy

**Got:** Smooth curve letting deck execute its strategy on time. Aggro plays out fast, control survives early, combo assembles on schedule.

**If fail:** Curve lumpy (too many expensive cards, not enough early plays)? Swap expensive support cards for cheaper alternatives. Curve more important than any individual card.

### Step 4: Meta-Game Positioning

Evaluate deck vs expected field.

1. Identify top 5 decks in current meta (use tournament results, tier lists)
2. For each top deck, evaluate:
   - **Favorable**: Your strategy naturally counters theirs (score: +1)
   - **Even**: Neither deck has structural advantage (score: 0)
   - **Unfavorable**: Their strategy naturally counters yours (score: -1)
3. Calculate expected win rate against field:
   - Weight matchups by opponent's meta share
   - Deck with 60%+ expected win rate against top 5 is well-positioned
4. Positioning poor? Consider:
   - Switching interaction cards to target worst matchups
   - Adding sideboard (if format allows) for unfavorable matchups
   - Whether different archetype is better positioned

**Got:** Clear picture of where deck sits in meta. Favorable and unfavorable matchups identified with specific reasons.

**If fail:** Meta data not available? Focus on versatility — ensure deck can interact with multiple strategies rather than being optimized for one matchup.

### Step 5: Build the Sideboard

Construct sideboard/side deck for format-specific adaptation (if applicable).

1. For each unfavorable matchup from Step 4:
   - Identify 2-4 cards improving matchup significantly
   - These should be high-impact cards, not marginal improvements
2. For each card in sideboard, know:
   - What matchup(s) it comes in against
   - What it replaces from main deck
   - Whether bringing it in changes deck's curve significantly
3. Verify sideboard doesn't exceed format limits (MTG: 15 cards, FaB: varies)
4. Ensure no sideboard card only relevant against one fringe deck
   - Each sideboard slot should cover at least 2 matchups if possible

**Got:** Focused sideboard meaningfully improves worst matchups without diluting main strategy.

**If fail:** Sideboard can't fix worst matchups? Deck may be poorly positioned in current meta. Consider whether core strategy needs adjustment rather than sideboard patches.

## Checks

- [ ] Archetype and win conditions clearly defined
- [ ] Deck meets format legality (ban list, rotation, card count)
- [ ] Every card has defined role (core, support, interaction, resource)
- [ ] Mana/energy curve supports strategy's speed
- [ ] Resource base can reliably cast cards on curve
- [ ] Meta matchups evaluated with specific reasoning
- [ ] Sideboard targets worst matchups with clear swap plans
- [ ] Budget constraints satisfied (if applicable)

## Pitfalls

- **Too many win conditions**: Deck with 3 different ways to win usually does none well. Focus on 1-2
- **Curve blindness**: Adding powerful expensive cards without checking if deck can cast them on time
- **Ignoring meta**: Building in vacuum. Best deck in theory loses to most common deck in practice
- **Emotional card inclusion**: Keeping pet card that doesn't serve strategy. Every slot must earn its place
- **Sideboard afterthought**: Building sideboard last with leftover cards. Sideboard is part of deck, not appendix
- **Over-teching**: Filling deck with narrow answers to specific decks instead of proactive strategy

## See Also

- `grade-tcg-card` — Card condition assessment for tournament legality and collection value
- `manage-tcg-collection` — Inventory management for tracking which cards are available for deck building
