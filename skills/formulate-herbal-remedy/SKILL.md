---
name: formulate-herbal-remedy
description: >
  Prepare herbal remedies from Hildegard von Bingen's Physica. Covers plant
  identification, preparation methods (tinctures, poultices, infusions, decoctions),
  dosage guidance, contraindications, and safety review based on 12th-century
  medieval pharmacopeia. Use when needing an herbal remedy for a specific
  ailment using Hildegardian pharmacopeia, seeking guidance on preparation
  methods and dosage, researching medieval herbal medicine, or integrating
  Hildegard's plant wisdom into holistic health practice.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, herbal, physica, remedy, tincture, poultice, infusion, medieval-medicine
---

# Formulate Herbal Remedy

Prepare traditional herbal remedies following Hildegard von Bingen's *Physica*, integrating medieval plant knowledge with preparation techniques.

## When to Use

- You need an herbal remedy for a specific ailment using Hildegardian pharmacopeia
- You want to understand a plant's properties from *Physica*'s perspective
- You need guidance on preparation methods (tincture, poultice, infusion, decoction)
- You require dosage and safety information for a traditional remedy
- You are researching medieval herbal medicine practices
- You want to integrate Hildegard's plant wisdom into holistic health practice

## Inputs

- **Required**: Ailment or condition to address (e.g., digestive upset, respiratory congestion, skin inflammation)
- **Optional**: Known plant preferences or contraindications
- **Optional**: Preparation preference (tincture for long-term use, infusion for acute, etc.)
- **Optional**: User's temperament (sanguine, choleric, melancholic, phlegmatic) for tailored selection
- **Optional**: Season and availability of fresh vs. dried herbs

## Procedure

### Step 1: Identify the Plant in Physica

Match the ailment to appropriate plants from Hildegard's *Physica* (Books I-IX: Plants, Elements, Trees, Stones, Fish, Birds, Animals, Reptiles, Metals).

```
Common Ailments → Physica Plants:
┌─────────────────────┬──────────────────────┬────────────────────┐
│ Ailment             │ Primary Plants        │ Physica Reference  │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Digestive upset     │ Fennel, Yarrow,      │ Book I, Ch. 1, 61  │
│ (cold pattern)      │ Ginger, Galangal     │                    │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Respiratory         │ Lungwort, Elecampane,│ Book I, Ch. 95, 164│
│ congestion          │ Hyssop, Anise        │                    │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Skin inflammation   │ Violet, Plantain,    │ Book I, Ch. 34, 28 │
│ (hot pattern)       │ Yarrow, Marigold     │                    │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Nervous agitation   │ Lavender, Lemon balm,│ Book I, Ch. 40, 123│
│                     │ Chamomile, Valerian  │                    │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Joint pain          │ Comfrey, St. John's  │ Book I, Ch. 21, 158│
│ (cold/damp)         │ wort, Nettle, Birch  │                    │
└─────────────────────┴──────────────────────┴────────────────────┘

Hildegard's Selection Principles:
1. Temperature: Match plant temperature to condition pattern
   - Cold conditions → warming plants (fennel, ginger, galangal)
   - Hot conditions → cooling plants (violet, plantain, lettuce)
2. Moisture: Match plant moisture to imbalance
   - Dry conditions → moistening plants (mallow, linseed)
   - Damp conditions → drying plants (yarrow, wormwood)
3. Temperament alignment: Choose plants harmonious with user's constitution
4. Seasonal availability: Fresh plants in growing season, dried in winter
```

**Expected:** One to three plants identified that match the ailment's pattern (hot/cold, dry/damp) and are appropriate for the user's constitution.

**On failure:** If unsure of the condition's pattern, default to balanced, gentle plants (fennel, chamomile, yarrow) which Hildegard describes as suitable for most constitutions.

### Step 2: Select Preparation Method

Choose the appropriate extraction and delivery method based on the ailment's location, acuity, and plant properties.

```
Preparation Methods from Medieval Tradition:

┌──────────────┬────────────────────┬──────────────────┬──────────────┐
│ Method       │ Best For           │ Duration         │ Shelf Life   │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ INFUSION     │ Aerial parts       │ Acute conditions │ 24 hours     │
│ (hot water)  │ (leaves, flowers)  │ Internal use     │ refrigerated │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ DECOCTION    │ Roots, bark, seeds │ Chronic use      │ 24 hours     │
│ (boiled)     │ Hard plant parts   │ Deep ailments    │ refrigerated │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ TINCTURE     │ Long-term use      │ Chronic support  │ 2-5 years    │
│ (alcohol)    │ Concentrated dose  │ Travel-friendly  │              │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ POULTICE     │ External wounds    │ Acute topical    │ Use fresh    │
│ (crushed)    │ Skin conditions    │ Inflammation     │              │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ OIL INFUSION │ Massage, salves    │ Skin/muscle care │ 6-12 months  │
│ (oil carrier)│ External only      │ Long-term        │              │
└──────────────┴────────────────────┴──────────────────┴──────────────┘

Decision Tree:
- Internal + Acute → Infusion or decoction
- Internal + Chronic → Tincture or daily decoction
- External + Acute → Poultice
- External + Chronic → Oil infusion or salve
```

**Expected:** Preparation method selected that matches plant part (aerial vs. root), use case (acute vs. chronic), and application route (internal vs. external).

**On failure:** If uncertain, default to infusion — it is the safest and most forgiving method for beginners.

### Step 3: Prepare the Remedy with Dosage

Execute the preparation with precise measurements and technique.

```
INFUSION (for aerial parts: leaves, flowers):
1. Measure: 1 tablespoon dried herb (or 2 tablespoons fresh) per 8 oz water
2. Boil water, remove from heat
3. Add herb, cover (to preserve volatile oils), steep 10-15 minutes
4. Strain through fine mesh or cheesecloth
5. Dosage: 1 cup 2-3 times daily, or as specific ailment requires

DECOCTION (for roots, bark, seeds):
1. Measure: 1 tablespoon dried root/bark per 8 oz water
2. Combine in pot, bring to boil
3. Reduce heat, simmer covered 20-30 minutes (up to 45 for hard roots)
4. Strain while hot
5. Dosage: 1/2 cup 2-3 times daily (more concentrated than infusion)

TINCTURE (alcohol extraction, 4-6 week preparation):
1. Ratio: 1 part dried herb to 5 parts menstruum (40-60% alcohol)
2. Combine in amber glass jar, seal tightly
3. Shake daily, store in dark place for 4-6 weeks
4. Strain through cheesecloth, press to extract all liquid
5. Dosage: 15-30 drops (approximately 1/2 to 1 dropper) 2-3 times daily,
   diluted in water or tea

POULTICE (fresh or rehydrated dried herb):
1. Fresh: Crush or chew herb to release juices, apply directly to skin
2. Dried: Rehydrate with hot water to paste consistency
3. Apply to affected area, cover with clean cloth
4. Replace every 2-4 hours or when dry
5. Duration: Acute inflammation (24-48 hours), wounds (until healed)

OIL INFUSION (for external salves):
1. Ratio: Fill jar 3/4 with dried herb, cover completely with oil
   (olive, almond, or sunflower)
2. Method A (solar): Seal jar, place in sunny window 2-4 weeks, shake daily
3. Method B (heat): Place jar in water bath (double boiler), low heat 2-4 hours
4. Strain through cheesecloth, press herb matter to extract all oil
5. Store in dark bottle; use within 6-12 months
```

**Expected:** Remedy prepared according to method, with correct herb-to-menstruum ratio and appropriate steep/extraction time. Dosage guidelines clear for internal or external use.

**On failure:** If preparation seems too strong (bitter, burning sensation), dilute by half. If too weak (no noticeable effect after 3 days at proper dosage), increase herb quantity by 50% in next batch.

### Step 4: Document Contraindications

Identify safety concerns, drug interactions, and populations who should avoid the remedy.

```
Common Contraindications by Plant Category:

EMMENAGOGUES (stimulate menstruation):
- Plants: Pennyroyal, Rue, Mugwort, Tansy, Wormwood
- Avoid: Pregnancy (all trimesters), breastfeeding
- Caution: Heavy menstrual flow

PHYTOESTROGENS (estrogen-like activity):
- Plants: Fennel, Anise, Hops, Red clover, Licorice
- Avoid: Hormone-sensitive cancers, pregnancy
- Caution: If taking hormonal medications or birth control

BLOOD THINNERS (anticoagulant properties):
- Plants: Garlic, Ginger (high dose), Feverfew, Ginkgo
- Avoid: Before surgery (stop 2 weeks prior)
- Caution: If taking warfarin, aspirin, or other anticoagulants

HEPATOTOXIC (potential liver stress):
- Plants: Comfrey (internal use), Pennyroyal, Kava
- Avoid: Liver disease, alcohol use disorder
- Caution: Long-term high-dose use

PHOTOSENSITIZERS (increase sun sensitivity):
- Plants: St. John's wort, Angelica, Celery seed
- Avoid: Before sun exposure, with photosensitizing medications
- Caution: Fair skin, history of skin cancer

GENERAL CAUTIONS:
- Pregnancy/Breastfeeding: Most herbs lack safety data; avoid unless
  traditionally used for pregnancy (ginger, red raspberry leaf)
- Children under 2: Avoid all herbal preparations except gentle teas
  (chamomile, fennel)
- Children 2-12: Use 1/4 to 1/2 adult dose, depending on age and weight
- Elderly: Start with 1/2 dose; may be more sensitive to effects
- Chronic illness: Consult healthcare provider before use
- Surgery: Discontinue all herbs 2 weeks before scheduled surgery
```

**Expected:** All relevant contraindications identified for the selected plant(s), with specific populations flagged (pregnancy, children, drug interactions).

**On failure:** If uncertain about contraindications, advise the user to consult a qualified herbalist or healthcare provider before use. Default to "Not recommended during pregnancy, breastfeeding, or for children under 12 without professional guidance."

### Step 5: Safety Review and Integration

Final check and guidance for monitoring effects and integrating into health practice.

```
Safety Review Checklist:
- [ ] Plant correctly identified (botanical name confirmed)
- [ ] Preparation method matches plant part and condition
- [ ] Dosage is within traditional safe range
- [ ] Contraindications reviewed and documented
- [ ] User informed this is historical folk medicine, not medical advice
- [ ] Expected timeline for effect noted (acute: 1-3 days; chronic: 2-4 weeks)

Monitoring Protocol:
Days 1-3:
- Note any immediate reactions (digestive upset, skin rash, headache)
- If adverse reaction occurs, discontinue immediately
- Positive signs: Symptom improvement, increased energy, better sleep

Days 4-14:
- Assess effectiveness: Are symptoms improving?
- If no improvement by day 7 (acute) or day 14 (chronic), reassess plant selection
- If partial improvement, continue; full effect may take 2-4 weeks

Integration Notes:
- Herbal medicine works best in context: adequate sleep, whole foods diet,
  stress management, and connection to nature
- Hildegard's remedies are not isolated pharmaceutical interventions —
  they are part of a holistic health practice
- Record observations in a journal: date, remedy, dose, effects
- Seasonal adjustment: Some remedies are more effective in specific seasons
  (warming herbs in winter, cooling herbs in summer)
```

**Expected:** User has complete information: remedy preparation, dosage, contraindications, monitoring plan, and integration context. Safety disclaimers clear.

**On failure:** If user expresses uncertainty about self-preparation, recommend consulting a trained herbalist for first preparation, then replicating at home once confident.

## Validation Checklist

- [ ] Plant identified from Physica with appropriate temperature/moisture properties
- [ ] Preparation method matches plant part (aerial = infusion, root = decoction, etc.)
- [ ] Dosage guidelines provided with frequency and duration
- [ ] Contraindications documented (pregnancy, drug interactions, specific conditions)
- [ ] Safety review completed with monitoring protocol
- [ ] User informed this is historical folk medicine, not medical diagnosis or treatment
- [ ] Expected timeline for effect communicated (acute vs. chronic)

## Common Pitfalls

1. **Misidentification**: Using the wrong plant due to common name confusion. Always confirm botanical (Latin) name
2. **Over-extraction**: Boiling delicate aerial parts destroys volatile oils. Use infusion (steeping), not decoction
3. **Under-dosing**: Medieval preparations were often stronger than modern herbal teas. Follow traditional ratios
4. **Ignoring Contraindications**: Pregnancy and drug interactions are serious. When in doubt, advise against use
5. **Substituting Modern for Medieval**: Hildegard's plants reflect European medieval flora. Substitutions may not align with her temperament system
6. **Expecting Pharmaceutical Speed**: Herbal medicine works gradually. Acute conditions: 1-3 days. Chronic: 2-4 weeks minimum
7. **Solo Remedy Focus**: Hildegard's medicine is holistic. Remedies work best integrated with diet, prayer, rest, and seasonal rhythms

## Related Skills

- `assess-holistic-health` — Temperament assessment informs plant selection (cold constitution → warming plants)
- `practice-viriditas` — Connecting to viriditas enhances receptivity to plant medicine
- `consult-natural-history` — Broader context of plants in Physica's cosmology
- `heal` (esoteric domain) — Post-remedy health assessment and recovery monitoring
- `prepare-soil` (gardening domain) — If growing medicinal herbs
- `maintain-hand-tools` (bushcraft domain) — For harvesting and processing herbs
