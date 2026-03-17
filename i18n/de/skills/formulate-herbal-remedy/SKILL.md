---
name: formulate-herbal-remedy
description: >
  Kraeuterheilmittel nach Hildegard von Bingens Physica zubereiten. Umfasst
  Pflanzenbestimmung, Zubereitungsmethoden (Tinkturen, Umschlaege, Aufguesse,
  Abkochungen), Dosierungsanleitung, Kontraindikationen und Sicherheitspruefung
  basierend auf mittelalterlicher Pharmakopoe des 12. Jahrhunderts. Verwenden
  beim Benoetigen eines Kraeuterheilmittels fuer ein bestimmtes Leiden unter
  Verwendung der hildegardischen Pharmakopoe, beim Suchen nach Anleitungen zu
  Zubereitungsmethoden und Dosierung, beim Erforschen mittelalterlicher
  Kraeutermedizin oder beim Integrieren von Hildegards Pflanzenwissen in
  ganzheitliche Gesundheitspraxis.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, herbal, physica, remedy, tincture, poultice, infusion, medieval-medicine
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Kraeuterheilmittel formulieren

Traditionelle Kraeuterheilmittel nach Hildegard von Bingens *Physica* zubereiten, wobei mittelalterliches Pflanzenwissen mit Zubereitungstechniken verbunden wird.

## Wann verwenden

- Sie benoetigen ein Kraeuterheilmittel fuer ein bestimmtes Leiden unter Verwendung der hildegardischen Pharmakopoe
- Sie moechten die Eigenschaften einer Pflanze aus der Perspektive der *Physica* verstehen
- Sie benoetigen Anleitung zu Zubereitungsmethoden (Tinktur, Umschlag, Aufguss, Abkochung)
- Sie benoetigen Dosierungs- und Sicherheitsinformationen fuer ein traditionelles Heilmittel
- Sie erforschen mittelalterliche Kraeutermedizin-Praktiken
- Sie moechten Hildegards Pflanzenwissen in ganzheitliche Gesundheitspraxis integrieren

## Eingaben

- **Erforderlich**: Leiden oder Zustand, der behandelt werden soll (z.B. Verdauungsbeschwerden, Atemwegsstauung, Hautentzuendung)
- **Optional**: Bekannte Pflanzenpraeferenzen oder Kontraindikationen
- **Optional**: Zubereitungspraeferenz (Tinktur fuer Langzeitanwendung, Aufguss fuer akute Faelle usw.)
- **Optional**: Temperament des Anwenders (sanguinisch, cholerisch, melancholisch, phlegmatisch) fuer massgeschneiderte Auswahl
- **Optional**: Jahreszeit und Verfuegbarkeit frischer vs. getrockneter Kraeuter

## Vorgehensweise

### Schritt 1: Die Pflanze in der Physica identifizieren

Das Leiden den passenden Pflanzen aus Hildegards *Physica* (Buecher I-IX: Pflanzen, Elemente, Baeume, Steine, Fische, Voegel, Tiere, Reptilien, Metalle) zuordnen.

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

**Erwartet:** Ein bis drei Pflanzen identifiziert, die zum Muster des Leidens (heiss/kalt, trocken/feucht) passen und fuer die Konstitution des Anwenders geeignet sind.

**Bei Fehler:** Wenn das Muster des Zustands unsicher ist, auf ausgewogene, sanfte Pflanzen (Fenchel, Kamille, Schafgarbe) zurueckgreifen, die Hildegard als fuer die meisten Konstitutionen geeignet beschreibt.

### Schritt 2: Zubereitungsmethode waehlen

Die geeignete Extraktions- und Anwendungsmethode basierend auf Ort des Leidens, Akutheit und Pflanzeneigenschaften waehlen.

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

**Erwartet:** Zubereitungsmethode gewaehlt, die zum Pflanzenteil (oberirdisch vs. Wurzel), Anwendungsfall (akut vs. chronisch) und Anwendungsweg (innerlich vs. aeusserlich) passt.

**Bei Fehler:** Im Zweifelsfall auf Aufguss zurueckgreifen — es ist die sicherste und fehlerverzeihendste Methode fuer Anfaenger.

### Schritt 3: Das Heilmittel mit Dosierung zubereiten

Die Zubereitung mit praezisen Messungen und Technik ausfuehren.

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

**Erwartet:** Heilmittel gemaess der Methode zubereitet, mit korrektem Kraut-zu-Menstruum-Verhaeltnis und angemessener Zieh-/Extraktionszeit. Dosierungsrichtlinien fuer innerliche oder aeusserliche Anwendung klar.

**Bei Fehler:** Wenn die Zubereitung zu stark scheint (bitter, Brenngefuehl), um die Haelfte verduennen. Wenn zu schwach (keine spuerbare Wirkung nach 3 Tagen bei korrekter Dosierung), Krautmenge in der naechsten Charge um 50% erhoehen.

### Schritt 4: Kontraindikationen dokumentieren

Sicherheitsbedenken, Arzneimittelwechselwirkungen und Personengruppen identifizieren, die das Heilmittel meiden sollten.

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

**Erwartet:** Alle relevanten Kontraindikationen fuer die ausgewaehlte(n) Pflanze(n) identifiziert, mit spezifischen Personengruppen gekennzeichnet (Schwangerschaft, Kinder, Arzneimittelwechselwirkungen).

**Bei Fehler:** Bei Unsicherheit ueber Kontraindikationen den Anwender anweisen, vor der Anwendung einen qualifizierten Kraeuterkundigen oder Gesundheitsdienstleister zu konsultieren. Standardmaessig "Nicht empfohlen waehrend Schwangerschaft, Stillzeit oder fuer Kinder unter 12 Jahren ohne professionelle Begleitung" angeben.

### Schritt 5: Sicherheitspruefung und Integration

Abschlusspruefung und Anleitung zur Wirkungsueberwachung und Integration in die Gesundheitspraxis.

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

**Erwartet:** Der Anwender hat vollstaendige Informationen: Heilmittelzubereitung, Dosierung, Kontraindikationen, Ueberwachungsplan und Integrationskontext. Sicherheitshinweise klar formuliert.

**Bei Fehler:** Wenn der Anwender Unsicherheit bei der Selbstzubereitung aeussert, empfehlen, fuer die erste Zubereitung einen ausgebildeten Kraeuterkundigen zu konsultieren und dann zu Hause zu replizieren, sobald Vertrauen besteht.

## Validierung

- [ ] Pflanze aus der Physica mit passenden Temperatur-/Feuchtigkeitseigenschaften identifiziert
- [ ] Zubereitungsmethode passt zum Pflanzenteil (oberirdisch = Aufguss, Wurzel = Abkochung usw.)
- [ ] Dosierungsrichtlinien mit Haeufigkeit und Dauer bereitgestellt
- [ ] Kontraindikationen dokumentiert (Schwangerschaft, Arzneimittelwechselwirkungen, spezifische Erkrankungen)
- [ ] Sicherheitspruefung mit Ueberwachungsprotokoll abgeschlossen
- [ ] Anwender informiert, dass es sich um historische Volksmedizin handelt, nicht um medizinische Diagnose oder Behandlung
- [ ] Erwarteter Zeithorizont fuer die Wirkung kommuniziert (akut vs. chronisch)

## Haeufige Stolperfallen

1. **Fehlbestimmung**: Die falsche Pflanze aufgrund von Verwechslung des Trivialnamens verwenden. Immer den botanischen (lateinischen) Namen bestaetigen
2. **Ueberextraktion**: Das Kochen empfindlicher oberirdischer Teile zerstoert aetherische Oele. Aufguss (Ziehen), nicht Abkochung verwenden
3. **Unterdosierung**: Mittelalterliche Zubereitungen waren oft staerker als moderne Kraeutertees. Traditionelle Verhaeltnisse befolgen
4. **Kontraindikationen ignorieren**: Schwangerschaft und Arzneimittelwechselwirkungen sind ernst zu nehmen. Im Zweifelsfall von der Anwendung abraten
5. **Modern durch Mittelalterlich ersetzen**: Hildegards Pflanzen spiegeln die europaeische mittelalterliche Flora wider. Substitutionen passen moeglicherweise nicht zu ihrem Temperamentsystem
6. **Pharmazeutische Geschwindigkeit erwarten**: Kraeutermedizin wirkt schrittweise. Akute Zustande: 1-3 Tage. Chronisch: mindestens 2-4 Wochen
7. **Fokus auf Einzelmittel**: Hildegards Medizin ist ganzheitlich. Heilmittel wirken am besten integriert mit Ernaehrung, Gebet, Ruhe und saisonalen Rhythmen

## Verwandte Skills

- `assess-holistic-health` — Temperamentbewertung informiert die Pflanzenauswahl (kalte Konstitution → waermende Pflanzen)
- `practice-viriditas` — Verbindung mit Viriditas verstaerkt die Empfaenglichkeit fuer Pflanzenmedizin
- `consult-natural-history` — Breiterer Kontext der Pflanzen in der Kosmologie der Physica
- `heal` (esoterische Domaene) — Gesundheitsbewertung und Genesungsueberwachung nach dem Heilmittel
- `prepare-soil` (Gartendomaene) — Wenn Heilkraeuter angebaut werden
- `maintain-hand-tools` (Bushcraft-Domaene) — Fuer die Ernte und Verarbeitung von Kraeutern
