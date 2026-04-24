---
name: formulate-herbal-remedy
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Hildegard *Physica* remedy → match plant + prep + dose + safety.

## Use When

- Need remedy w/ Hildegardian pharmacopeia
- Want plant property from *Physica*
- Need prep method (tincture/poultice/infusion/decoction)
- Need dose + safety info
- Researching medieval herbal medicine
- Integrating Hildegard w/ holistic practice

## In

- **Required**: ailment (digestive upset, respiratory, skin inflammation)
- **Optional**: plant prefs / known contraindic.
- **Optional**: prep pref (tincture=chronic, infusion=acute)
- **Optional**: user temperament (sanguine/choleric/melancholic/phlegmatic)
- **Optional**: season + fresh vs dried avail.

## Do

### Step 1: ID plant in Physica

```
Ailments → Physica plants:
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

Selection:
1. Temp: cold cond → warming (fennel, ginger, galangal); hot → cooling (violet, plantain, lettuce)
2. Moisture: dry → moistening (mallow, linseed); damp → drying (yarrow, wormwood)
3. Temperament align w/ constitution
4. Season: fresh in growing, dried in winter
```

→ 1-3 plants match pattern (hot/cold, dry/damp) + constitution.

**If err:** unsure → gentle defaults (fennel, chamomile, yarrow).

### Step 2: Select prep method

```
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

Tree:
- Internal + acute → infusion/decoction
- Internal + chronic → tincture/daily decoction
- External + acute → poultice
- External + chronic → oil infusion/salve
```

→ Method matches plant part + use case + route.

**If err:** unsure → infusion (safest).

### Step 3: Prepare + dose

```
INFUSION (aerial: leaves, flowers):
1. 1 tbsp dried (or 2 tbsp fresh) per 8 oz water
2. Boil, remove heat
3. Add herb, cover, steep 10-15 min
4. Strain fine mesh/cheesecloth
5. Dose: 1 cup 2-3×/day

DECOCTION (roots, bark, seeds):
1. 1 tbsp dried root/bark per 8 oz water
2. Pot → boil
3. Simmer covered 20-30 min (up to 45 hard roots)
4. Strain hot
5. Dose: 1/2 cup 2-3×/day

TINCTURE (alcohol, 4-6 wk):
1. 1 part dried herb : 5 parts menstruum (40-60% alcohol)
2. Amber glass jar, seal
3. Shake daily, dark, 4-6 wk
4. Strain cheesecloth, press
5. Dose: 15-30 drops (1/2-1 dropper) 2-3×/day, dilute in water/tea

POULTICE (fresh or rehydrated):
1. Fresh: crush/chew → apply skin
2. Dried: rehydrate hot water → paste
3. Cover clean cloth
4. Replace 2-4 hr or when dry
5. Duration: inflammation 24-48 hr, wounds until healed

OIL INFUSION (external salves):
1. Jar 3/4 dried herb, cover w/ oil (olive/almond/sunflower)
2. Solar: seal, sunny window 2-4 wk, shake daily
3. Heat: water bath (double boiler), low 2-4 hr
4. Strain cheesecloth, press
5. Dark bottle, 6-12 months
```

→ Correct ratio + extract time. Clear dose internal/external.

**If err:** too strong (bitter/burn) → dilute ½. Too weak (no effect 3 days) → +50% herb next batch.

### Step 4: Contraindic.

```
EMMENAGOGUES: Pennyroyal, Rue, Mugwort, Tansy, Wormwood
- Avoid: pregnancy, breastfeeding
- Caution: heavy menstrual flow

PHYTOESTROGENS: Fennel, Anise, Hops, Red clover, Licorice
- Avoid: hormone-sensitive cancer, pregnancy
- Caution: hormonal meds / birth control

BLOOD THINNERS: Garlic, Ginger (high), Feverfew, Ginkgo
- Avoid: 2 wk pre-surgery
- Caution: warfarin/aspirin/anticoag

HEPATOTOXIC: Comfrey (internal), Pennyroyal, Kava
- Avoid: liver disease, alcohol use disorder
- Caution: long-term high-dose

PHOTOSENSITIZERS: St. John's wort, Angelica, Celery seed
- Avoid: sun exposure, photosensitizing meds
- Caution: fair skin, skin cancer hx

GENERAL:
- Pregnancy/BF: no safety data → avoid (except ginger, red raspberry leaf)
- <2: only gentle teas (chamomile, fennel)
- 2-12: 1/4-1/2 adult dose by age/weight
- Elderly: start 1/2 dose
- Chronic illness: consult provider
- Surgery: stop 2 wk prior
```

→ All contraindic. ID'd for selected plants; pregnancy/child/drug flagged.

**If err:** unsure → refer to herbalist/provider. Default: "No pregnancy/BF/<12 w/o pro guidance".

### Step 5: Safety review + integrate

```
Checklist:
- [ ] Plant ID'd (botanical name)
- [ ] Prep method matches part + cond
- [ ] Dose in safe range
- [ ] Contraindic. reviewed
- [ ] User knows: folk medicine, not medical advice
- [ ] Timeline: acute 1-3 days, chronic 2-4 wk

Monitor:
Days 1-3: note reactions (digestive, rash, headache); adverse → stop. Positive: symptom improvement, energy, sleep.
Days 4-14: improving? No by day 7 acute/14 chronic → reassess. Partial → continue, full 2-4 wk.

Integrate:
- Works best w/ sleep, whole foods, stress mgmt, nature
- Hildegard = holistic, not isolated pharma
- Journal: date, remedy, dose, effects
- Seasonal: warming winter, cooling summer
```

→ Complete info: prep, dose, contraindic., monitor, context. Disclaimers clear.

**If err:** user uncertain → trained herbalist first prep, replicate home.

## Check

- [ ] Plant ID'd w/ temp/moisture properties
- [ ] Prep method matches part (aerial=infusion, root=decoction)
- [ ] Dose + freq + duration
- [ ] Contraindic. documented
- [ ] Monitor protocol
- [ ] User knows: folk medicine, not dx/tx
- [ ] Timeline communicated

## Traps

1. **Misidentification**: common name confusion → always botanical Latin
2. **Over-extraction**: boiling aerial → destroys oils → infusion not decoction
3. **Under-dosing**: medieval > modern tea → follow trad ratios
4. **Ignoring contraindic.**: pregnancy/drugs serious → doubt = no
5. **Modern substitute**: Hildegard = European medieval flora; subs break temperament system
6. **Pharma speed expect.**: gradual → acute 1-3 days, chronic 2-4 wk min
7. **Solo focus**: holistic — integrate w/ diet, prayer, rest, seasons

## →

- `assess-holistic-health` — temperament → plant selection
- `practice-viriditas` — receptivity to plant medicine
- `consult-natural-history` — Physica cosmology context
- `heal` (esoteric) — post-remedy monitor
- `prepare-soil` (gardening) — growing medicinal herbs
- `maintain-hand-tools` (bushcraft) — harvest/processing
