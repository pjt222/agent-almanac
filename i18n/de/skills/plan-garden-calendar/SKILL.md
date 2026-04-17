---
name: plan-garden-calendar
description: >
  Gartenaktivitaeten mit Solar-, Mond- und biodynamischen Kalendern planen. Umfasst
  USDA-Winterhaertezonen, Frostdatumsberechnung, Tagundnachtgleichen-/Sonnenwende-Verankerung,
  synodischen Mondzyklus (zunehmend/abnehmend), aufsteigenden/absteigenden Mond, Maria-Thun-
  biodynamischen Kalender (Wurzel-/Blatt-/Blueten-/Fruchttage), Staffelpflanzungsplaene
  und saisonale Aufgabenplanung. Verwenden beim Planen einer neuen Anbausaison
  und Benoetigen eines Pflanzplans, beim Integrieren von Mond- oder biodynamischem
  Timing in die Gartenpraxis, beim Berechnen von Frostdaten und Pflanzfenstern fuer
  eine bestimmte Zone, beim Einrichten von Staffelpflanzung fuer kontinuierliche
  Ernte oder bei der Saisonendauswertung.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gardening
  complexity: intermediate
  language: natural
  tags: gardening, calendar, lunar, biodynamic, solar, frost-dates, succession-planting
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Gartenkalender planen

Gartenaktivitaeten mit Solar-, Mond- und biodynamischen Kalendersystemen fuer optimales Timing planen.

## Wann verwenden

- Sie planen eine neue Anbausaison und benoetigen einen Pflanzplan
- Sie moechten Mond- oder biodynamisches Timing in Ihre Gartenpraxis integrieren
- Sie muessen Frostdaten und Pflanzfenster fuer Ihre Zone berechnen
- Sie moechten Staffelpflanzung fuer kontinuierliche Ernte einrichten
- Saisonendauswertung und Planung fuer das naechste Jahr

## Eingaben

- **Erforderlich**: USDA-Winterhaertezone oder geografischer Standort (fuer Frostdaten)
- **Erforderlich**: Kulturen oder Pflanzen, die eingeplant werden sollen
- **Optional**: Kalendersystem-Praeferenz (nur solar, lunar oder biodynamisch)
- **Optional**: Gartengroesse und Beetanzahl
- **Optional**: Gartentagebuch der vorherigen Saison

## Vorgehensweise

### Schritt 1: Solarrahmen festlegen

Der Solarkalender liefert die festen Grenzen — Frostdaten und Tageslaenge.

```
Solar Calendar Anchors:
1. Find your USDA Hardiness Zone:
   - Zone determines minimum winter temperature and which perennials survive
   - Also correlates with growing season length
   - Look up at: planthardiness.ars.usda.gov (US) or local equivalent

2. Determine frost dates:
   - Last spring frost (LSF): Date after which frost is unlikely (50% threshold)
   - First autumn frost (FAF): Date after which frost becomes likely
   - Growing season = FAF minus LSF (in days)

   Example (Zone 7b, mid-Atlantic US):
   - Last spring frost: April 15
   - First autumn frost: October 15
   - Growing season: ~180 days

3. Anchor seasonal milestones:
   ┌───────────────────┬───────────────┬────────────────────────────┐
   │ Event             │ Approx. Date  │ Garden Significance        │
   ├───────────────────┼───────────────┼────────────────────────────┤
   │ Winter solstice   │ Dec 21        │ Seed ordering, planning    │
   │ Spring equinox    │ Mar 20        │ Start indoor seeds (cool   │
   │                   │               │ crops: 6-8 wk before LSF)  │
   │ Last spring frost │ Zone-specific │ Direct sow tender crops    │
   │ Summer solstice   │ Jun 21        │ Peak day length, begin     │
   │                   │               │ autumn crop planning       │
   │ Autumn equinox    │ Sep 22        │ Harvest season, cover crop │
   │ First autumn frost│ Zone-specific │ Protect or harvest tender  │
   │                   │               │ crops before this date     │
   └───────────────────┴───────────────┴────────────────────────────┘
```

**Erwartet:** Klare Frostdaten und Vegetationsperiodendauer fuer Ihren spezifischen Standort.

**Bei Fehler:** Wenn Frostdaten unbekannt sind, konservative Schaetzungen verwenden (2 Wochen zum durchschnittlichen LSF hinzufuegen fuer sicheres Direktsaat-Datum). Lokale Gartenvereine oder landwirtschaftliche Beratungsstellen sind die besten regionalen Quellen.

### Schritt 2: Mondkalender ueberlagern

Der Mond beeinflusst Saftfluss, Keimung und Bodenbiologie. Zwei Zyklen sind relevant.

```
Lunar Cycle 1: Synodic (Phase Cycle — 29.5 days)
┌─────────────────────┬────────────────────────────────────────────┐
│ Phase               │ Garden Activity                            │
├─────────────────────┼────────────────────────────────────────────┤
│ New Moon → 1st Qtr  │ Plant leafy crops (lettuce, spinach,      │
│ (Waxing crescent)   │ cabbage). Sap rises — good for above-     │
│                     │ ground vegetative growth.                  │
├─────────────────────┼────────────────────────────────────────────┤
│ 1st Qtr → Full Moon │ Plant fruiting crops (tomato, pepper,     │
│ (Waxing gibbous)    │ beans, squash). Strong light + rising sap  │
│                     │ = vigorous above-ground growth.            │
├─────────────────────┼────────────────────────────────────────────┤
│ Full Moon → 3rd Qtr │ Plant root crops (carrot, beet, potato,   │
│ (Waning gibbous)    │ onion). Sap descends — energy moves to    │
│                     │ roots. Good for transplanting.             │
├─────────────────────┼────────────────────────────────────────────┤
│ 3rd Qtr → New Moon  │ Rest period. No planting. Good for:       │
│ (Waning crescent)   │ weeding, composting, soil preparation,    │
│                     │ pruning, harvesting for storage.           │
└─────────────────────┴────────────────────────────────────────────┘

Lunar Cycle 2: Sidereal (Ascending/Descending — ~27.3 days)
- Ascending moon (moon moves higher in sky each night):
  Sap rises in plants. Good for: grafting, taking cuttings, harvesting
  fruit and aerial parts, sowing above-ground crops
- Descending moon (moon moves lower in sky each night):
  Sap descends to roots. Good for: planting, transplanting, root
  pruning, applying soil preparations, planting root crops

Note: Ascending/descending is NOT the same as waxing/waning.
Ascending = moon's position in the zodiac moving northward.
Check a biodynamic calendar for daily ascending/descending status.
```

**Erwartet:** Verstaendnis beider Mondzyklen und ihrer Gartenanwendungen.

**Bei Fehler:** Wenn der Mondkalender ueberfordernd wirkt, mit nur dem synodischen Zyklus beginnen (zunehmend = oberirdisch, abnehmend = unterirdisch) und die siderische Ebene in der zweiten Saison hinzufuegen.

### Schritt 3: Biodynamischen Kalender integrieren (Optional — Fortgeschritten)

Der Maria-Thun-biodynamische Kalender ordnet jeden Tag einem von vier Pflanzenorganen zu, basierend auf der Stellung des Mondes im Tierkreis.

```
Biodynamic Day Types:
┌───────────┬─────────────────┬──────────────────────────────────────┐
│ Day Type  │ Zodiac Signs    │ Favoured Activities                  │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Root      │ Taurus, Virgo,  │ Sow/transplant root crops (carrot,  │
│           │ Capricorn       │ beet, potato). Soil cultivation.     │
│           │ (Earth signs)   │ Compost turning.                     │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Leaf      │ Cancer, Scorpio,│ Sow/transplant leafy greens. Water  │
│           │ Pisces          │ plants. Lawn care. Prune for growth. │
│           │ (Water signs)   │                                      │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Flower    │ Gemini, Libra,  │ Sow/transplant flowering plants.    │
│           │ Aquarius        │ Harvest flowers and herbs. Apply     │
│           │ (Air signs)     │ preparation 501 (horn silica).       │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Fruit     │ Aries, Leo,     │ Sow/transplant fruiting crops       │
│           │ Sagittarius     │ (tomato, pepper, bean). Harvest      │
│           │ (Fire signs)    │ fruit. Collect seed.                 │
└───────────┴─────────────────┴──────────────────────────────────────┘

Using the Calendar:
1. Obtain the current year's Maria Thun biodynamic calendar
   (published annually, available from biodynamic associations)
2. Note which days are root/leaf/flower/fruit
3. Schedule your plantings to align day type with crop type
4. Avoid planting on "unfavourable" days (perigee, node crossings)
5. Combine with synodic phase: e.g., plant carrots on a root day
   during waning moon for strongest root growth signal

Practical Reality:
- Perfect alignment (right phase + right day type + good weather + you're free)
  happens 2-3 times per month. Don't wait for perfection.
- Match at least ONE calendar layer. Matching two is good. Three is ideal.
- Weather and your schedule always override calendar — a plant in the ground
  on the "wrong" day beats a seed in the packet on the "right" day.
```

**Erwartet:** Kenntnis der biodynamischen Tagestypen und wie der Jahreskalender zu verwenden ist.

**Bei Fehler:** Wenn kein biodynamischer Kalender verfuegbar ist, erfasst der Mondphasenkalender (Schritt 2) die wichtigsten Timing-Signale. Biodynamische Tagestypen hinzufuegen, wenn Sie Zugang zum Jahreskalender haben.

### Schritt 4: Staffelpflanzungsplan erstellen

Aussaaten staffeln fuer kontinuierliche Ernte statt einer ueberwaeltigenden Schwemme.

```
Succession Planting Principles:
1. Same crop, staggered sowing:
   - Sow lettuce every 2 weeks from LSF to 8 weeks before FAF
   - Sow bush beans every 3 weeks from 2 weeks after LSF to 10 weeks before FAF
   - Sow radish every 2 weeks (spring and autumn — skip midsummer heat)

2. Different crops, same bed:
   - Spring: peas (harvest June) → Summer: beans (harvest Sept) → Autumn: garlic (harvest next June)
   - This is relay planting — each crop follows the previous with minimal gap

3. Example Succession Calendar (Zone 7b):
   ┌─────────┬────────────────┬───────────────────────────────┐
   │ Week    │ Sow Indoors    │ Direct Sow / Transplant      │
   ├─────────┼────────────────┼───────────────────────────────┤
   │ Feb 15  │ Tomato, pepper │                               │
   │ Mar 1   │ Brassica starts│ Peas, spinach (under cloche)  │
   │ Mar 15  │ Lettuce #1     │ Radish #1, carrots (early)    │
   │ Apr 1   │ Lettuce #2     │ Radish #2, beet #1            │
   │ Apr 15  │               │ Transplant brassicas out       │
   │ May 1   │ Lettuce #3     │ Bean #1, squash, cucumber      │
   │ May 15  │               │ Transplant tomato, pepper      │
   │ Jun 1   │               │ Bean #2, lettuce #4 (shade)    │
   │ Jun 15  │               │ Bean #3                        │
   │ Jul 1   │ Autumn brassica│ Beet #2, carrot (autumn)      │
   │ Jul 15  │               │ Transplant autumn brassicas    │
   │ Aug 1   │               │ Lettuce #5 (autumn), radish #3 │
   │ Aug 15  │               │ Spinach (autumn), cover crop   │
   │ Sep 1   │               │ Garlic (plant 4-6 wks pre FAF)│
   └─────────┴────────────────┴───────────────────────────────┘
```

**Erwartet:** Ein wochenweiser Pflanzkalender, angepasst an Ihre Zone, mit notierten Staffelintervallen.

**Bei Fehler:** Wenn der Zeitplan ueberfordernd wirkt, die 3 wichtigsten Kulturen auswaehlen und nur fuer diese Staffelungen planen. In der zweiten Saison weitere Kulturen hinzufuegen, sobald der Rhythmus etabliert ist.

### Schritt 5: Saisonaler Aufgabenplan

Ueber das Pflanzen hinaus hat der Garten zyklische Pflegeaufgaben.

```
Seasonal Task Framework:
┌───────────┬──────────────────────────────────────────────────────┐
│ Season    │ Tasks                                                │
├───────────┼──────────────────────────────────────────────────────┤
│ Winter    │ - Order seeds (January)                              │
│ (Dec-Feb) │ - Plan beds and crop rotation on paper               │
│           │ - Maintain tools (see maintain-hand-tools)           │
│           │ - Apply prep 500 if ground is workable (late Feb)    │
│           │ - Start earliest indoor seeds (Feb, 8-10 wk pre LSF)│
├───────────┼──────────────────────────────────────────────────────┤
│ Spring    │ - Soil assessment and amendment (see prepare-soil)   │
│ (Mar-May) │ - Direct sow cool crops after soil reaches 7°C      │
│           │ - Transplant warm crops after LSF                    │
│           │ - Mulch beds after soil warms                        │
│           │ - First compost turn of the year                     │
├───────────┼──────────────────────────────────────────────────────┤
│ Summer    │ - Succession sow every 2-3 weeks                    │
│ (Jun-Aug) │ - Water deeply, less frequently (morning preferred)  │
│           │ - Harvest regularly to encourage production           │
│           │ - Start autumn crop seeds indoors (July)             │
│           │ - Apply prep 501 on fruit days (biodynamic)          │
├───────────┼──────────────────────────────────────────────────────┤
│ Autumn    │ - Main harvest and preservation                     │
│ (Sep-Nov) │ - Plant garlic (4-6 weeks before FAF)               │
│           │ - Sow cover crops on empty beds                     │
│           │ - Apply prep 500 (late October)                     │
│           │ - Compost final additions, insulate pile for winter  │
│           │ - End-of-season reflection (meditate checkpoint)     │
└───────────┴──────────────────────────────────────────────────────┘
```

**Erwartet:** Ein saisonaler Rahmen, der den woechentlichen Pflanzplan ergaenzt.

**Bei Fehler:** Wenn Aufgaben konsistent verpasst werden, ist der Zeitplan moeglicherweise zu ambitioniert. Die Anzahl der Beete oder Kulturen reduzieren, bis sich der Rhythmus tragbar anfuehlt.

### Schritt 6: Meditationspruefpunkt — Saisonend-Reflexion

Am Ende der Anbausaison (nach dem ersten Frost) mit dem Gartentagebuch hinsetzen.

```
End-of-Season Reflection (20-30 minutes):
1. Find a quiet spot in or overlooking the garden
2. Bring your garden journal and this year's calendar

3. Review without judgment:
   - What grew well? (Note varieties and planting dates)
   - What struggled? (Was it timing, soil, weather, or neglect?)
   - Which calendar alignments felt meaningful?
   - What surprised you?

4. Note three things to carry forward:
   - One success to repeat
   - One failure to investigate
   - One new thing to try

5. Close the journal. Sit quietly for 5 minutes.
   The garden is resting now. You should rest too.
   Planning begins after solstice — not before.

This reflection becomes the first page of next year's plan.
```

**Erwartet:** Eine reflektierende Zusammenfassung, die die Planung des naechsten Jahres in der Realitaet dieses Jahres verankert.

**Bei Fehler:** Wenn Reflexion sich wie Selbstkritik anfuehlt, umrahmen: Der Garten ist der Lehrer. Jedes "Scheitern" sind Daten. Das einzige wirkliche Scheitern ist, nicht zu beobachten.

## Validierung

- [ ] USDA-Zone und Frostdaten fuer Ihren Standort identifiziert
- [ ] Solarkalender-Ankerpunkte markiert (Tagundnachtgleichen, Sonnenwenden, Frostdaten)
- [ ] Mondzyklus verstanden (mindestens: zunehmend/abnehmend = oberirdisch/unterirdisch)
- [ ] Pflanzplan mit Staffelintervallen erstellt
- [ ] Plan beruecksichtigt Vorkultur-Startzeiten (Wochen vor LSF)
- [ ] Saisonaler Aufgabenrahmen an lokale Bedingungen angepasst
- [ ] Gartentagebuch begonnen oder mit dem diesjaehrigen Kalender aktualisiert
- [ ] Meditationspruefpunkt am Ende der Anbausaison durchgefuehrt

## Haeufige Stolperfallen

1. **Zu frueh pflanzen**: Eifriges Fruehjahrspflanzen in kalten Boden verschwendet Saatgut. Bodentemperatur ist wichtiger als Lufttemperatur — ein Bodenthermometer verwenden
2. **Mikroklimate ignorieren**: Suedwaende sind waermer, Senken sammeln Frost. Ihr Garten hat Zonen innerhalb von Zonen
3. **Kalender-Starrheit**: Der Kalender ist ein Leitfaden, kein Befehl. Wenn das Wetter falsch ist, warten. Pflanzen lesen keine Kalender
4. **Keine Staffelpflanzung**: Eine einzige grosse Aussaat erzeugt eine einzige ueberwaeltigende Ernte, gefolgt von nichts. Staffeln fuer Kontinuitaet
5. **Reflexion ueberspringen**: Ohne zu ueberpruefen, was passiert ist, plant man aus Hoffnung statt aus Evidenz. Das Tagebuch ist das wichtigste Werkzeug
6. **Ueberplanung**: Ein vollgepackter Kalender fuehrt zu Burnout. Freiraeume lassen — der Garten wird sie fuellen

## Verwandte Skills

- `read-garden` — Beobachtungsfaehigkeiten, die Kalenderanpassungen waehrend der Saison informieren
- `prepare-soil` — Bodenverbesserungszeitpunkt haengt vom saisonalen Kalender ab
- `cultivate-bonsai` — Bonsai-Saisonpflege folgt dem gleichen Solar-/Mond-Rahmen
- `meditate` — Saisonend-Reflexionspruefpunkt (vollstaendiges Protokoll)
- `maintain-hand-tools` — Winterwerkzeugpflege ist eine geplante saisonale Aufgabe
