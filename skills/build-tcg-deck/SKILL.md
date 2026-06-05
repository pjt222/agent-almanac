---
name: build-tcg-deck
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

Construct a trading card game deck from archetype selection through final optimization, following a structured process that works across Pokemon TCG, Magic: The Gathering, Flesh and Blood, and other major TCGs.

## When to Use

- Building a new deck for a specific tournament format or casual play
- Adapting an existing deck to a changed meta-game
- Evaluating whether a new card or set release warrants a deck change
- Teaching someone the principles of deck construction
- Converting a deck concept into a tournament-ready list

## Inputs

- **Required**: Card game (Pokemon TCG, MTG, FaB, etc.)
- **Required**: Format (Standard, Expanded, Modern, Legacy, Blitz, etc.)
- **Required**: Goal (competitive tournament, casual play, budget build)
- **Optional**: Preferred archetype or strategy (aggro, control, combo, midrange)
- **Optional**: Budget constraints (maximum spend, cards already owned)
- **Optional**: Current meta-game snapshot (top decks, expected field)

## Procedure

### Step 1: Define the Archetype

Choose the deck's strategic identity.

1. Identify the available archetypes in the current format:
   - **Aggro**: Win quickly through early pressure and efficient attackers
   - **Control**: Answer threats efficiently, win in the late game with card advantage
   - **Combo**: Assemble specific card combinations for powerful synergy or instant wins
   - **Midrange**: Flexible strategy that shifts between aggro and control as needed
   - **Tempo**: Gain resource advantage through efficient timing and disruption
2. Select an archetype based on:
   - Player preference and playstyle
   - Meta-game positioning (what beats the top decks?)
   - Budget constraints (combo decks often need specific expensive cards)
   - Format legality (check ban lists and rotation status)
3. Identify 1-2 primary win conditions:
   - How does this deck actually win the game?
   - What is the ideal game state this deck is trying to reach?
4. State the archetype selection and win condition clearly

**Expected:** A clear archetype with defined win conditions. The strategy is specific enough to guide card selection but flexible enough to adapt.

**On failure:** If no archetype feels right, start with the strongest individual cards available and let the archetype emerge from the card pool. Sometimes the best deck is built around a card, not a concept.

### Step 2: Build the Core

Select the cards that define the deck's strategy.

1. Identify the **core engine** (12-20 cards depending on game):
   - The cards that directly enable the win condition
   - Maximum legal copies of each core card
   - These are non-negotiable — the deck doesn't function without them
2. Add **support cards** (8-15 cards):
   - Cards that find or protect the core engine
   - Draw/search effects to improve consistency
   - Protection for key pieces (counters, shields, removal)
3. Add **interaction** (8-12 cards):
   - Removal for opponent's threats
   - Disruption for opponent's strategy
   - Defensive options appropriate to the format
4. Fill the **resource base** (game-specific):
   - MTG: Lands (typically 24-26 for 60-card, 16-17 for 40-card)
   - Pokemon: Energy cards (8-12 basic + special)
   - FaB: Pitch value distribution (balance red/yellow/blue)

**Expected:** A complete deck list at or near the minimum deck size for the format. Every card has a clear role (core, support, interaction, or resource).

**On failure:** If the deck list exceeds the format size, cut the weakest support cards first. If the core engine requires too many cards (>25), the strategy may be too fragile — simplify the win condition.

### Step 3: Analyze the Curve

Verify the deck's resource distribution supports its strategy.

1. Plot the **mana/energy/cost curve**:
   - Count cards at each cost point (0, 1, 2, 3, 4, 5+)
   - Verify the curve matches the archetype:
     - Aggro: peaks at 1-2, drops sharply after 3
     - Midrange: peaks at 2-3, moderate presence at 4-5
     - Control: flatter curve, more high-cost finishers
     - Combo: concentrated at combo-piece costs
2. Check **color/type distribution** (MTG: color balance; Pokemon: energy type coverage):
   - Can the resource base reliably cast cards on curve?
   - Are there color-intensive cards that need dedicated resource support?
3. Verify **card type balance**:
   - Sufficient creatures/attackers to apply pressure
   - Sufficient spells/trainers for interaction and consistency
   - No critical category completely missing
4. Adjust if the curve doesn't support the strategy

**Expected:** A smooth curve that lets the deck execute its strategy on time. Aggro plays out fast, control survives early, combo assembles on schedule.

**On failure:** If the curve is lumpy (too many expensive cards, not enough early plays), swap expensive support cards for cheaper alternatives. The curve is more important than any individual card.

### Step 4: Meta-Game Positioning

Evaluate the deck against the expected field.

1. Identify the top 5 decks in the current meta (use tournament results, tier lists)
2. For each top deck, evaluate:
   - **Favorable**: Your strategy naturally counters theirs (score: +1)
   - **Even**: Neither deck has a structural advantage (score: 0)
   - **Unfavorable**: Their strategy naturally counters yours (score: -1)
3. Calculate the expected win rate against the field:
   - Weight matchups by the opponent's meta share
   - A deck with 60%+ expected win rate against the top 5 is well-positioned
4. If positioning is poor, consider:
   - Switching interaction cards to target the worst matchups
   - Adding sideboard (if the format allows) for unfavorable matchups
   - Whether a different archetype is better positioned

**Expected:** A clear picture of where the deck sits in the meta. Favorable and unfavorable matchups identified with specific reasons.

**On failure:** If meta data isn't available, focus on versatility — ensure the deck can interact with multiple strategies rather than being optimized for one matchup.

### Step 5: Build the Sideboard

Construct sideboard/side deck for format-specific adaptation (if applicable).

1. For each unfavorable matchup from Step 4:
   - Identify 2-4 cards that improve the matchup significantly
   - These should be high-impact cards, not marginal improvements
2. For each card in the sideboard, know:
   - What matchup(s) it comes in against
   - What it replaces from the main deck
   - Whether bringing it in changes the deck's curve significantly
3. Verify sideboard doesn't exceed format limits (MTG: 15 cards, FaB: varies)
4. Ensure no sideboard card is only relevant against one fringe deck
   - Each sideboard slot should cover at least 2 matchups if possible

**Expected:** A focused sideboard that meaningfully improves the worst matchups without diluting the main strategy.

**On failure:** If the sideboard can't fix the worst matchups, the deck may be poorly positioned in the current meta. Consider whether the core strategy needs adjustment rather than sideboard patches.

## Validation Checklist

- [ ] Archetype and win conditions clearly defined
- [ ] Deck meets format legality (ban list, rotation, card count)
- [ ] Every card has a defined role (core, support, interaction, resource)
- [ ] Mana/energy curve supports the strategy's speed
- [ ] Resource base can reliably cast cards on curve
- [ ] Meta matchups evaluated with specific reasoning
- [ ] Sideboard targets the worst matchups with clear swap plans
- [ ] Budget constraints satisfied (if applicable)

## Common Pitfalls

- **Too many win conditions**: A deck with 3 different ways to win usually does none of them well. Focus on 1-2
- **Curve blindness**: Adding powerful expensive cards without checking if the deck can cast them on time
- **Ignoring the meta**: Building in a vacuum. The best deck in theory loses to the most common deck in practice
- **Emotional card inclusion**: Keeping a pet card that doesn't serve the strategy. Every slot must earn its place
- **Sideboard afterthought**: Building the sideboard last with leftover cards. The sideboard is part of the deck, not an appendix
- **Over-teching**: Filling the deck with narrow answers to specific decks instead of proactive strategy

## Related Skills

- `grade-tcg-card` — Card condition assessment for tournament legality and collection value
- `manage-tcg-collection` — Inventory management for tracking which cards are available for deck building
