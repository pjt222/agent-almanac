---
name: formulate-herbal-remedy
locale: wenyan
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

# 草藥之製

依 Hildegard von Bingen 《Physica》製傳統草藥，合中世紀草木之識與製法。

## 用時

- 依 Hildegard 藥典需特定疾之草藥乃用
- 欲明草藥於《Physica》之性乃用
- 需製法（酊、敷、浸、煎）之導引乃用
- 需傳統劑量與安全之識乃用
- 究中世紀草藥術乃用
- 欲融 Hildegard 草智於整體健康實踐乃用

## 入

- **必要**：所治之疾（如消化不調、呼吸壅塞、皮膚炎）
- **可選**：已知草偏好或禁忌
- **可選**：製法偏好（慢性用酊、急性用浸）
- **可選**：用者體質（多血、膽汁、憂鬱、黏液），以選適草
- **可選**：時令與鮮乾草藥之可得

## 法

### 第一步：於 Physica 識草

以疾配 Hildegard《Physica》之草（第一至九冊：草木、元素、樹、石、魚、鳥、獸、爬、金）。

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

**得：** 識一至三草，合疾之寒熱燥濕，宜用者體質。

**敗則：** 若疾型未明，默選平和之草（茴香、甘菊、蓍），Hildegard 謂其宜眾體質。

### 第二步：擇製法

依疾之位、緩急與草性，擇相應提取與施用之法。

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

**得：** 製法合草部（莖葉抑根）、疾況（急抑慢）、施途（內抑外）。

**敗則：** 若未定，默用浸——初學最安全而寬容。

### 第三步：製藥與定劑量

以精度量與技法施製。

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

**得：** 藥依法製成，草與溶媒比例正，浸提時間合。劑量明，內外皆清。

**敗則：** 若製過強（苦、灼），減半稀釋。若三日無效，下批增草量五成。

### 第四步：記禁忌

識安全之慮、藥互作、宜避之人群。

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

**得：** 所選草之相關禁忌皆識，特定人群（孕、幼、藥互作）皆標。

**敗則：** 若未定，勸用者求資格草藥師或醫者。默為「孕、哺、十二歲以下未得專業導引者不宜」。

### 第五步：安全核與整合

末核並導引，以觀效並融入健康實踐。

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

**得：** 用者得全識：製法、劑量、禁忌、監察、融入之境。安全聲明清。

**敗則：** 若用者疑自製，勸初次求資格草藥師製，熟後家中自為。

## 驗

- [ ] 自 Physica 識草，溫潤性相宜
- [ ] 製法合草部（莖葉浸、根煎等）
- [ ] 劑量明頻次與期限
- [ ] 禁忌有記（孕、藥互作、特定疾）
- [ ] 安全核畢，有監察協議
- [ ] 告用者此乃歷史民醫，非醫療診斷或治療
- [ ] 傳效期（急性對慢性）

## 陷

1. **誤識**：常名混淆而用錯草。必驗植物學（拉丁）名
2. **過提取**：煮沸嫩莖葉毀揮發油。用浸（泡），非煎
3. **劑量不足**：中世紀製劑常強於今日草茶。依傳統比例
4. **忽禁忌**：孕與藥互作重大。疑則勸勿用
5. **以今代古**：Hildegard 草乃歐洲中世紀植物。代用或不合其體質體系
6. **望藥速效**：草藥漸進。急性一至三日，慢性最少二至四週
7. **單藥獨重**：Hildegard 醫術整體也。藥與飲食、祈、息、時令合用最效

## 參

- `assess-holistic-health` — 體質察導引草選（寒體→溫草）
- `practice-viriditas` — 連 viriditas 以增草藥受感
- `consult-natural-history` — Physica 宇宙觀中草之更廣語境
- `heal` (esoteric domain) — 藥後健康察與康復監
- `prepare-soil` (gardening domain) — 若欲種藥草
- `maintain-hand-tools` (bushcraft domain) — 收採與製草
