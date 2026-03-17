---
name: assess-holistic-health
description: >
  Temperamentbasierte Gesundheitsbewertung nach Hildegard von Bingens
  Causae et Curae durchfuehren. Bewertet die vier Temperamente (sanguinisch,
  cholerisch, melancholisch, phlegmatisch), elementare Entsprechungen
  (Luft, Feuer, Erde, Wasser) und gibt Ernaehrungs- und Lebensstil-
  Empfehlungen zur Wiederherstellung des Gleichgewichts. Verwenden beim
  Verstaendnis des konstitutionellen Typs nach Hildegard, bei Ungleichgewicht
  (Muedigkeit, Verdauungsprobleme, geistiger Nebel), bei Ernaehrungs-
  Empfehlungen nach Temperament oder bei der Erforschung mittelalterlicher
  Humoralmedizin.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, temperament, humors, causae-et-curae, holistic-health, elements
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Ganzheitliche Gesundheit bewerten

Gesundheit durch Hildegard von Bingens Temperamentsystem aus *Causae et Curae* bewerten, die vier Temperamente und das elementare Gleichgewicht erfassen und Ernaehrungs- und Lebensstil-Empfehlungen geben.

## Wann verwenden

- Den eigenen konstitutionellen Typ (Temperament) in hildegardianischen Begriffen verstehen
- Ungleichgewicht erleben (Muedigkeit, Reizbarkeit, Verdauungsprobleme, geistiger Nebel) und ganzheitliche Anleitung benoetigen
- Ernaehrungsempfehlungen basierend auf dem Temperament benoetigen
- Hildegards Gesundheitsprinzipien in eine Wellnesspraxis integrieren
- Die Beziehung zwischen Temperament, Elementen und Gesundheit verstehen
- Mittelalterliche Humoralmedizin erforschen

## Eingaben

- **Erforderlich**: Aktuelle Symptome oder Gesundheitsanliegen (koerperlich, geistig, emotional)
- **Erforderlich**: Antworten auf Temperament-Bewertungsfragen (Konstitution, Gewohnheiten, Vorlieben)
- **Optional**: Alter, Geschlecht und allgemeine Gesundheitsgeschichte (fuer den Kontext)
- **Optional**: Aktuelle Jahreszeit (fuer saisonale Anpassungsempfehlungen)
- **Optional**: Bestehende Ernaehrungseinschraenkungen oder -vorlieben
- **Optional**: Bekanntes Temperament aus frueherer Bewertung

## Vorgehensweise

### Schritt 1: Temperamentbewertung

Das vorherrschende Temperament durch Beobachtung und strukturierte Fragen bestimmen.

```
The Four Temperaments in Causae et Curae:
┌──────────────┬──────────┬────────────┬─────────────┬──────────────┐
│ Temperament  │ Element  │ Qualities  │ Physiology  │ Psychology   │
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ SANGUINE     │ Air      │ Hot, Moist │ Ruddy face, │ Cheerful,    │
│              │          │            │ plump build,│ sociable,    │
│              │          │            │ good sleep  │ optimistic   │
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ CHOLERIC     │ Fire     │ Hot, Dry   │ Lean, wiry, │ Ambitious,   │
│              │          │            │ quick pulse,│ irritable,   │
│              │          │            │ warm skin   │ decisive     │
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ MELANCHOLIC  │ Earth    │ Cold, Dry  │ Thin, dark  │ Analytical,  │
│              │          │            │ features,   │ introspective│
│              │          │            │ slow pulse  │ prone to fear│
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ PHLEGMATIC   │ Water    │ Cold, Moist│ Pale, soft  │ Calm, slow,  │
│              │          │            │ skin, heavy │ apathetic,   │
│              │          │            │ build       │ easygoing    │
└──────────────┴──────────┴────────────┴─────────────┴──────────────┘

Assessment Questions (score 0-3 per statement: 0=never, 1=rarely, 2=often, 3=always):

SANGUINE (Air):
[ ] I am naturally optimistic and sociable
[ ] I have a ruddy complexion and rarely feel cold
[ ] I sleep well and wake refreshed
[ ] I enjoy variety and new experiences
[ ] I gain weight easily but can also lose it
TOTAL: ___/15

CHOLERIC (Fire):
[ ] I am driven, goal-oriented, and impatient with delays
[ ] I have a lean build and high metabolism
[ ] I run warm and prefer cool environments
[ ] I make quick decisions and am often irritated by slowness
[ ] I have strong digestion and rarely feel cold
TOTAL: ___/15

MELANCHOLIC (Earth):
[ ] I am introspective, analytical, and prone to worry
[ ] I have a thin frame and struggle to gain weight
[ ] I feel cold easily and prefer warm environments
[ ] I am detail-oriented and perfectionistic
[ ] I have irregular digestion (constipation or sluggishness)
TOTAL: ___/15

PHLEGMATIC (Water):
[ ] I am calm, easygoing, and avoid conflict
[ ] I have a soft, pale complexion and retain water easily
[ ] I sleep long hours and still feel tired
[ ] I move slowly and prefer routine
[ ] I have slow digestion and feel heavy after meals
TOTAL: ___/15

Scoring:
- Dominant: Highest score (usually 9-15)
- Secondary: Second highest (usually 6-9)
- Most people are a blend of 1-2 temperaments
- Scores within 2-3 points indicate balanced type (rare)
```

**Erwartet:** Dominantes und sekundaeres Temperament identifiziert, mit Punkteprofil, das die primaeren konstitutionellen Tendenzen zeigt.

**Bei Fehler:** Wenn alle Punktzahlen innerhalb von 2-3 Punkten voneinander liegen, hat die Person ein ausgeglichenes Temperament (ungewoehnlich in Hildegards System). Mit allgemeinen Empfehlungen fortfahren, die Extreme vermeiden (keine sehr heissen oder sehr kalten Speisen).

### Schritt 2: Elementares Gleichgewicht bewerten

Bewerten, ob der aktuelle Zustand einen Ueberschuss, Mangel oder ein Gleichgewicht elementarer Qualitaeten widerspiegelt.

```
Elemental Imbalance Patterns:
┌─────────────────┬────────────────────┬─────────────────────────┐
│ Imbalance       │ Symptoms           │ Causation               │
├─────────────────┼────────────────────┼─────────────────────────┤
│ EXCESS AIR      │ Anxiety, gas,      │ Too much raw food,      │
│ (hot/moist)     │ scattered thoughts │ erratic schedule        │
├─────────────────┼────────────────────┼─────────────────────────┤
│ DEFICIENT AIR   │ Depression, rigid  │ Isolation, sedentary,   │
│                 │ thinking, isolation│ routine without joy     │
├─────────────────┼────────────────────┼─────────────────────────┤
│ EXCESS FIRE     │ Inflammation, acid │ Overwork, spicy foods,  │
│ (hot/dry)       │ reflux, anger      │ stimulants, summer heat │
├─────────────────┼────────────────────┼─────────────────────────┤
│ DEFICIENT FIRE  │ Cold extremities,  │ Sedentary, raw/cold     │
│                 │ low motivation,    │ foods, winter isolation │
│                 │ weak digestion     │                         │
├─────────────────┼────────────────────┼─────────────────────────┤
│ EXCESS EARTH    │ Stiffness, rigidity│ Overwork without rest,  │
│ (cold/dry)      │ constipation, fear │ dry foods, isolation    │
├─────────────────┼────────────────────┼─────────────────────────┤
│ DEFICIENT EARTH │ Ungrounded, flighty│ Lack of routine, travel,│
│                 │ anxious, diarrhea  │ insufficient protein    │
├─────────────────┼────────────────────┼─────────────────────────┤
│ EXCESS WATER    │ Edema, lethargy,   │ Sedentary, cold/damp    │
│ (cold/moist)    │ mucus, depression  │ foods, damp environment │
├─────────────────┼────────────────────┼─────────────────────────┤
│ DEFICIENT WATER │ Dry skin/mucous,   │ Dehydration, hot/dry    │
│                 │ hard stools, thirst│ climate, excess heat    │
└─────────────────┴────────────────────┴─────────────────────────┘

Assessment:
1. Match current symptoms to imbalance patterns
2. Consider season: Winter increases cold/dry (earth), Summer increases hot/dry (fire)
3. Note recent life changes: Travel, stress, diet shifts, illness
4. Determine if imbalance is acute (recent onset) or chronic (longstanding pattern)
```

**Erwartet:** Identifikation von 1-2 elementaren Ungleichgewichten (z.B. "Ueberschuss Wasser mit Mangel Feuer" = kalt/feucht Muster mit geringer Vitalitaet).

**Bei Fehler:** Wenn das Symptommuster unklar oder widerspruchlich ist, auf die entgegengesetzten Qualitaeten des dominanten Temperaments zurueckgreifen. Beispiel: Choleriker (heiss/trocken), der sich unwohl fuehlt, hat wahrscheinlich Feuer-Ueberschuss → kuehlende/befeuchtende Massnahmen empfehlen.

### Schritt 3: Ernaehrungsempfehlungen

Lebensmittel zur Wiederherstellung des elementaren Gleichgewichts verschreiben, nach Hildegards *Physica* und *Causae et Curae*.

```
Hildegard's Dietary Principles:

FOODS BY ELEMENTAL QUALITY:
┌──────────────┬────────────────────────────────────────────┐
│ Quality      │ Foods                                      │
├──────────────┼────────────────────────────────────────────┤
│ WARMING      │ Spelt, fennel, ginger, galangal, cinnamon, │
│              │ nutmeg, lamb, chestnuts, cooked vegetables │
├──────────────┼────────────────────────────────────────────┤
│ COOLING      │ Lettuce, cucumber, pears, plums, barley,   │
│              │ fish, raw salads, diluted wine             │
├──────────────┼────────────────────────────────────────────┤
│ MOISTENING   │ Butter, cream, honey, figs, grapes, wine,  │
│              │ soups, stews, broths                       │
├──────────────┼────────────────────────────────────────────┤
│ DRYING       │ Rye, beans, lentils, roasted meats,        │
│              │ nuts (in moderation), aged cheese          │
└──────────────┴────────────────────────────────────────────┘

TEMPERAMENT-SPECIFIC DIETARY GUIDELINES:

SANGUINE (Air — Hot/Moist) — Generally Balanced:
- Maintain variety, avoid dietary extremes
- Favor: Whole grains (spelt, oats), balanced proteins, vegetables
- Moderate: Rich foods, sweets (tend toward weight gain)
- Avoid: Excessive cold or excessively hot foods

CHOLERIC (Fire — Hot/Dry) — Cooling/Moistening Diet:
- Cool the fire, prevent inflammation and irritability
- Favor: Lettuce, cucumber, pears, fish, barley, diluted wine
- Moderate: Lamb, roasted meats, aged cheese
- Avoid: Spicy foods, garlic (raw), strong wine, overeating meat

MELANCHOLIC (Earth — Cold/Dry) — Warming/Moistening Diet:
- Warm the constitution, ease constipation and fear
- Favor: Spelt, fennel, ginger, cooked vegetables, soups, butter
- Moderate: Raw foods, salads (only in summer)
- Avoid: Rye, beans, cold foods, fasting

PHLEGMATIC (Water — Cold/Moist) — Warming/Drying Diet:
- Dry the dampness, increase vitality and motivation
- Favor: Spelt, chestnuts, roasted meats, ginger, galangal, nutmeg
- Moderate: Dairy, sweet fruits, wine
- Avoid: Cold foods, raw salads, excess liquids, pork

SPELT (Dinkel) — Hildegard's Universal Grain:
"Spelt is the best grain. It is warm, nourishing, and strong.
Whoever eats it has good flesh and blood, a happy mind, and a joyful spirit."
(*Physica*, Book I, Chapter 2)
- Recommended for ALL temperaments as foundation grain
- Superior to wheat, which Hildegard considered inferior

GALANGAL — Universal Digestive Spice:
"Let one who has pain in the heart or who has become weak in the heart
eat galangal, and he will be restored to health."
(*Physica*, Book I, Chapter 157)
- Warming, stimulating, heart-supporting
- Especially for melancholic and phlegmatic types
```

**Erwartet:** Spezifische Lebensmittelempfehlungen, zugeschnitten auf Temperament und aktuelles Ungleichgewicht, mit klaren Kategorien "bevorzugen/maessigen/vermeiden".

**Bei Fehler:** Wenn Ernaehrungseinschraenkungen die Befolgung von Empfehlungen verhindern (z.B. Vegetarier kann kein Lamm essen), innerhalb der gleichen elementaren Kategorie (waermend/kuehlend/befeuchtend/trocknend) substituieren. Die pflanzlichen Optionen innerhalb jeder Kategorie konsultieren.

### Schritt 4: Lebensstil- und Saisonanpassungen

Nicht-diaetetische Praktiken zur Unterstuetzung des Wiederausgleichs empfehlen: Schlaf, Bewegung, Gebet, saisonale Rhythmen.

```
Lifestyle Recommendations by Imbalance:

EXCESS AIR (scattered, anxious):
- Practice grounding: barefoot walking, gardening, repetitive handwork
- Reduce stimulation: Limit news, social media, multitasking
- Routine: Regular meal and sleep times
- Meditation: Breath-focused (shamatha), body scan

DEFICIENT AIR (depressed, isolated):
- Social engagement: Community, conversation, singing
- Variety: New experiences, travel, learning
- Movement: Dance, walks in nature (not isolated exercise)
- Meditation: Loving-kindness (metta), gratitude practice

EXCESS FIRE (inflammation, anger):
- Cooling practices: Swim, evening walks, avoid midday sun
- Rest: Prioritize sleep, avoid overwork
- Prayer/Meditation: Contemplative, slow-paced, non-goal-oriented
- Avoid: Competitive exercise, heated arguments, stimulants

DEFICIENT FIRE (cold, unmotivated):
- Warming practices: Morning sun exposure, moderate exercise, warming baths
- Challenge: Set achievable goals, take on new projects
- Social: Engage with energetic, positive people
- Movement: Brisk walking, dancing, labor

EXCESS EARTH (rigid, constipated):
- Flexibility: Yoga, stretching, massage
- Creativity: Art, music, play (non-structured)
- Moisture: Warm baths, soups, hydration
- Release: Journaling, confession, letting go of control

DEFICIENT EARTH (ungrounded, anxious):
- Grounding: Gardening, working with hands, routine
- Structure: Daily schedule, meal times, sleep rhythm
- Protein: Adequate protein at each meal
- Meditation: Walking meditation, mindful labor

EXCESS WATER (lethargic, damp):
- Movement: Daily exercise to promote circulation and sweating
- Warmth: Sauna, hot baths, warm clothing, avoid damp environments
- Stimulation: Engage with challenging tasks, avoid excessive rest
- Rhythm: Wake early, avoid napping

DEFICIENT WATER (dry, rigid):
- Hydration: Adequate water, broths, herbal teas
- Rest: Prioritize sleep, reduce activity if overworked
- Moisture: Humidifier in dry climates, oil massage
- Ease: Release pressure, practice self-compassion

SEASONAL ADJUSTMENTS (all temperaments):
- Spring (Air rising): Light diet, cleansing herbs, outdoor activity
- Summer (Fire peak): Cooling foods, swim, rest in heat of day
- Autumn (Earth settling): Harvest foods, prepare for winter, grounding practices
- Winter (Water depth): Warming foods, rest more, contemplation, less activity
```

**Erwartet:** 3-5 spezifische Lebensstilempfehlungen, die das identifizierte Ungleichgewicht adressieren und mit Hildegards ganzheitlicher Sicht (Koerper, Geist, Seele, Natur) uebereinstimmen.

**Bei Fehler:** Wenn Empfehlungen ueberfordernd wirken, EINE Ernaehrungsaenderung und EINE Lebensstilaenderung priorisieren. Vollstaendiges Wiederausgleichen dauert Wochen bis Monate — klein anfangen.

### Schritt 5: Integration und Ueberwachung

Zeitplan, Ueberwachungsrichtlinien und Kriterien fuer eine Neubewertung bereitstellen.

```
Integration Protocol:
Week 1-2: Implement dietary changes gradually
- Replace 1-2 meals per day with temperament-appropriate foods
- Avoid abrupt elimination (can cause stress/imbalance)
- Note energy, digestion, sleep quality, mood daily

Week 3-4: Add lifestyle practices
- Choose 1-2 lifestyle recommendations to integrate
- Consistency matters more than intensity
- Continue dietary changes; they should feel habitual by now

Week 5-8: Assess progress
- Are original symptoms improving?
- Has energy/mood shifted?
- Any new imbalances emerging? (Sometimes correcting one reveals another)

Reassessment Triggers:
- No improvement after 4 weeks → Reassess temperament; may have misidentified
- Partial improvement → Continue current plan, allow more time (8-12 weeks)
- New symptoms → Overcorrection possible; reduce intensity of interventions
- Seasonal change → Adjust foods/practices for new season

Long-Term Practice:
Hildegard's system is preventive and lifelong. The goal is not to "fix" and return
to old habits, but to develop a sustainable, temperament-harmonious way of living.
```

**Erwartet:** Der Benutzer hat einen klaren Zeitplan fuer die Umsetzung von Aenderungen, Ueberwachungspraktiken und Kriterien fuer eine Neubewertung.

**Bei Fehler:** Wenn der Benutzer berichtet, dass es ihm nach 1-2 Wochen schlechter geht, auf Ueberkorrektur pruefen. Beispiel: Zu viele waermende Lebensmittel bei einem cholerischen Typ koennten Feuer-Ueberschuss verursachen. Voruebergehend auf neutrale Lebensmittel zurueckfahren.

## Validierung

- [ ] Temperamentbewertung mit identifiziertem dominantem und sekundaerem Typ abgeschlossen
- [ ] Elementare(s) Ungleichgewicht(e) identifiziert (Ueberschuss/Mangel von Luft/Feuer/Erde/Wasser)
- [ ] Ernaehrungsempfehlungen mit Kategorien "bevorzugen/maessigen/vermeiden" gegeben
- [ ] Dinkel und Galgant (Hildegards Universalmittel) eingeschlossen, sofern nicht kontraindiziert
- [ ] Lebensstilempfehlungen adressieren Ungleichgewicht (Erdung, Kuehlung, Stimulation usw.)
- [ ] Saisonale Anpassungen notiert, falls zutreffend
- [ ] Integrationszeitplan bereitgestellt (Wochen 1-2, 3-4, 5-8)
- [ ] Ueberwachungs- und Neubewertungsausloeser dokumentiert
- [ ] Benutzer informiert, dass dies ganzheitliche Anleitung ist, keine medizinische Diagnose

## Haeufige Stolperfallen

1. **Starre Typisierung**: Die meisten Menschen sind Mischformen. Nicht eine einzelne Temperament-Identitaet erzwingen
2. **Jahreszeit ignorieren**: Ein winterlicher Melancholiker braucht andere Lebensmittel als ein sommerlicher Melancholiker
3. **Ueberkorrigieren**: Uebermassiges Hinzufuegen entgegengesetzter Qualitaeten kann ein neues Ungleichgewicht schaffen. Schrittweise vorgehen
4. **Moderne Lebensmittelverwirrung**: Hildegards Lebensmittel spiegeln die europaeische Ernaehrung des 12. Jahrhunderts wider. An verfuegbare Lebensmittel mit gleichen elementaren Qualitaeten anpassen
5. **Schnelle Ergebnisse erwarten**: Temperament ist konstitutionell; Wiederausgleichen dauert Wochen bis Monate
6. **Ernaehrung isolieren**: Hildegards System ist ganzheitlich. Ernaehrung allein ohne Lebensstil-/spirituelle Integration ist unvollstaendig
7. **Spirituelle Komponente vernachlaessigen**: *Causae et Curae* integriert Koerper und Seele. Gebet, Meditation und Tugend sind Teil der Gesundheit

## Verwandte Skills

- `formulate-herbal-remedy` — Kraeuter zur Unterstuetzung der Temperament-Wiederherstellung verwenden (waermende/kuehlende Pflanzen)
- `practice-viriditas` — Spirituelle Praxis unterstuetzt die ganzheitliche Gesundheitsintegration
- `consult-natural-history` — Lebensmittel in *Physica* haben temperamentale und elementare Eigenschaften
- `meditate` (esoteric domain) — Meditationspraktiken, zugeschnitten auf Temperament-Ungleichgewicht
- `heal` (esoteric domain) — Heilungsmodalitaeten nach der Bewertung fuer spezifische Ungleichgewichte
- `plan-garden-calendar` (gardening domain) — Saisonaler Lebensmittelanbau im Einklang mit Hildegards Kalender
