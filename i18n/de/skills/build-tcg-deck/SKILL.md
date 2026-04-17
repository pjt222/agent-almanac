---
name: build-tcg-deck
locale: de
source_locale: en
source_commit: a87e5e03
translator: claude
translation_date: "2026-03-17"
description: >
  Ein kompetitives oder Freizeit-Sammelkartenspiel-Deck bauen. Behandelt
  Archetyp-Auswahl, Mana-/Energiekurvenanalyse, Siegbedingungsidentifikation,
  Metagame-Positionierung und Sideboard-Zusammenstellung fuer Pokemon TCG,
  Magic: The Gathering, Flesh and Blood und andere Sammelkartenspiele.
  Anwenden beim Bau eines neuen Decks fuer ein Turnierformat oder
  Freizeitspiel, bei der Anpassung eines bestehenden Decks an ein veraendertes
  Metagame, bei der Bewertung ob ein neues Set eine Deckaenderung rechtfertigt,
  oder bei der Umwandlung eines Deckkonzepts in eine turniertaugliche Liste.
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

# Sammelkartenspiel-Deck bauen

Ein Sammelkartenspiel-Deck von der Archetyp-Auswahl bis zur finalen Optimierung konstruieren, nach einem strukturierten Prozess der fuer Pokemon TCG, Magic: The Gathering, Flesh and Blood und andere grosse Sammelkartenspiele funktioniert.

## Wann verwenden

- Bau eines neuen Decks fuer ein bestimmtes Turnierformat oder Freizeitspiel
- Anpassung eines bestehenden Decks an ein veraendertes Metagame
- Bewertung ob eine neue Karte oder ein neues Set eine Deckaenderung rechtfertigt
- Jemanden in den Prinzipien des Deckbaus unterrichten
- Umwandlung eines Deckkonzepts in eine turniertaugliche Liste

## Eingaben

- **Erforderlich**: Kartenspiel (Pokemon TCG, MTG, FaB usw.)
- **Erforderlich**: Format (Standard, Expanded, Modern, Legacy, Blitz usw.)
- **Erforderlich**: Ziel (kompetitives Turnier, Freizeitspiel, Budget-Build)
- **Optional**: Bevorzugter Archetyp oder Strategie (Aggro, Control, Combo, Midrange)
- **Optional**: Budgetbeschraenkungen (Maximalausgabe, bereits vorhandene Karten)
- **Optional**: Aktuelle Metagame-Momentaufnahme (Top-Decks, erwartetes Feld)

## Vorgehensweise

### Schritt 1: Den Archetyp definieren

Die strategische Identitaet des Decks waehlen.

1. Die verfuegbaren Archetypen im aktuellen Format identifizieren:
   - **Aggro**: Schnell gewinnen durch fruehen Druck und effiziente Angreifer
   - **Control**: Bedrohungen effizient beantworten, im spaeten Spiel mit Kartenvorteil gewinnen
   - **Combo**: Bestimmte Kartenkombinationen fuer starke Synergie oder sofortige Siege zusammenstellen
   - **Midrange**: Flexible Strategie die nach Bedarf zwischen Aggro und Control wechselt
   - **Tempo**: Ressourcenvorteil durch effizientes Timing und Disruption erlangen
2. Einen Archetyp basierend auf folgenden Kriterien waehlen:
   - Spielervorliebe und Spielstil
   - Metagame-Positionierung (was schlaegt die Top-Decks?)
   - Budgetbeschraenkungen (Combo-Decks brauchen oft bestimmte teure Karten)
   - Formatlegales (Verbotslisten und Rotationsstatus pruefen)
3. 1-2 primaere Siegbedingungen identifizieren:
   - Wie gewinnt dieses Deck tatsaechlich das Spiel?
   - Welchen idealen Spielzustand versucht dieses Deck zu erreichen?
4. Archetyp-Auswahl und Siegbedingung klar formulieren

**Erwartet:** Ein klarer Archetyp mit definierten Siegbedingungen. Die Strategie ist spezifisch genug um die Kartenauswahl zu leiten, aber flexibel genug um sich anzupassen.

**Bei Fehler:** Wenn kein Archetyp sich richtig anfuehlt, mit den staerksten einzelnen verfuegbaren Karten beginnen und den Archetyp aus dem Kartenpool entstehen lassen. Manchmal wird das beste Deck um eine Karte herum gebaut, nicht um ein Konzept.

### Schritt 2: Den Kern aufbauen

Die Karten auswaehlen die die Strategie des Decks definieren.

1. Das **Kernmodul** identifizieren (12-20 Karten je nach Spiel):
   - Die Karten die direkt die Siegbedingung ermoeglichen
   - Maximale legale Kopien jeder Kernkarte
   - Diese sind nicht verhandelbar -- das Deck funktioniert ohne sie nicht
2. **Unterstuetzungskarten** hinzufuegen (8-15 Karten):
   - Karten die das Kernmodul finden oder schuetzen
   - Zieh-/Sucheffekte zur Verbesserung der Konsistenz
   - Schutz fuer Schluesselstuecke (Konter, Schilde, Removal)
3. **Interaktion** hinzufuegen (8-12 Karten):
   - Removal fuer gegnerische Bedrohungen
   - Disruption der gegnerischen Strategie
   - Dem Format angemessene defensive Optionen
4. Die **Ressourcenbasis** auffuellen (spielspezifisch):
   - MTG: Laender (typischerweise 24-26 fuer 60 Karten, 16-17 fuer 40 Karten)
   - Pokemon: Energiekarten (8-12 Basis + Spezial)
   - FaB: Pitch-Wert-Verteilung (Rot/Gelb/Blau ausbalancieren)

**Erwartet:** Eine vollstaendige Deckliste bei oder nahe der Mindestdeckgroesse fuer das Format. Jede Karte hat eine klare Rolle (Kern, Unterstuetzung, Interaktion oder Ressource).

**Bei Fehler:** Wenn die Deckliste die Formatgroesse ueberschreitet, die schwaechsten Unterstuetzungskarten zuerst streichen. Wenn das Kernmodul zu viele Karten erfordert (>25), ist die Strategie moeglicherweise zu fragil -- die Siegbedingung vereinfachen.

### Schritt 3: Die Kurve analysieren

Verifizieren dass die Ressourcenverteilung des Decks seine Strategie unterstuetzt.

1. Die **Mana-/Energie-/Kostenkurve** darstellen:
   - Karten bei jedem Kostenpunkt zaehlen (0, 1, 2, 3, 4, 5+)
   - Verifizieren dass die Kurve zum Archetyp passt:
     - Aggro: Maximum bei 1-2, faellt nach 3 steil ab
     - Midrange: Maximum bei 2-3, moderate Praesenz bei 4-5
     - Control: Flachere Kurve, mehr teure Finisher
     - Combo: Konzentriert bei den Kosten der Kombostuecke
2. **Farb-/Typverteilung** pruefen (MTG: Farbbalance; Pokemon: Energietypabdeckung):
   - Kann die Ressourcenbasis zuverlaessig Karten auf der Kurve ausspielen?
   - Gibt es farbintensive Karten die dedizierte Ressourcenunterstuetzung brauchen?
3. **Kartentyp-Balance** verifizieren:
   - Genuegend Kreaturen/Angreifer um Druck auszuueben
   - Genuegend Zauber/Trainer fuer Interaktion und Konsistenz
   - Keine kritische Kategorie komplett fehlend
4. Anpassen wenn die Kurve die Strategie nicht unterstuetzt

**Erwartet:** Eine gleichmaessige Kurve die dem Deck erlaubt seine Strategie rechtzeitig auszufuehren. Aggro spielt schnell aus, Control ueberlebt die Fruehphase, Combo stellt planmaessig zusammen.

**Bei Fehler:** Wenn die Kurve ungleichmaessig ist (zu viele teure Karten, zu wenig fruehe Spielzuege), teure Unterstuetzungskarten gegen guenstigere Alternativen tauschen. Die Kurve ist wichtiger als jede einzelne Karte.

### Schritt 4: Metagame-Positionierung

Das Deck gegen das erwartete Feld evaluieren.

1. Die Top-5-Decks im aktuellen Metagame identifizieren (Turnierergebnisse, Tierlisten nutzen)
2. Fuer jedes Top-Deck bewerten:
   - **Guenstig**: Die eigene Strategie kontert deren natuerlich (Bewertung: +1)
   - **Ausgeglichen**: Keines der Decks hat einen strukturellen Vorteil (Bewertung: 0)
   - **Unguenstig**: Deren Strategie kontert die eigene natuerlich (Bewertung: -1)
3. Die erwartete Gewinnrate gegen das Feld berechnen:
   - Matchups nach dem Metagame-Anteil des Gegners gewichten
   - Ein Deck mit 60%+ erwarteter Gewinnrate gegen die Top 5 ist gut positioniert
4. Wenn die Positionierung schlecht ist, erwaegen:
   - Interaktionskarten aendern um die schlechtesten Matchups zu adressieren
   - Sideboard hinzufuegen (wenn das Format es erlaubt) fuer unguenstige Matchups
   - Ob ein anderer Archetyp besser positioniert ist

**Erwartet:** Ein klares Bild wo das Deck im Metagame steht. Guenstige und unguenstige Matchups mit spezifischen Gruenden identifiziert.

**Bei Fehler:** Wenn keine Metagame-Daten verfuegbar sind, auf Vielseitigkeit setzen -- sicherstellen dass das Deck mit mehreren Strategien interagieren kann statt auf ein Matchup optimiert zu sein.

### Schritt 5: Das Sideboard bauen

Sideboard/Nebendeck fuer formatspezifische Anpassung zusammenstellen (falls zutreffend).

1. Fuer jedes unguenstige Matchup aus Schritt 4:
   - 2-4 Karten identifizieren die das Matchup erheblich verbessern
   - Diese sollten wirkungsstarke Karten sein, keine marginalen Verbesserungen
2. Fuer jede Karte im Sideboard wissen:
   - Gegen welche(s) Matchup(s) sie hereinkommt
   - Was sie aus dem Hauptdeck ersetzt
   - Ob ihr Einbringen die Kurve des Decks erheblich veraendert
3. Verifizieren dass das Sideboard die Formatgrenzen nicht ueberschreitet (MTG: 15 Karten, FaB: variiert)
4. Sicherstellen dass keine Sideboard-Karte nur gegen ein einziges Randdeck relevant ist
   - Jeder Sideboard-Platz sollte nach Moeglichkeit mindestens 2 Matchups abdecken

**Erwartet:** Ein fokussiertes Sideboard das die schlechtesten Matchups sinnvoll verbessert ohne die Hauptstrategie zu verwaessern.

**Bei Fehler:** Wenn das Sideboard die schlechtesten Matchups nicht beheben kann, ist das Deck moeglicherweise im aktuellen Metagame schlecht positioniert. Erwaegen ob die Kernstrategie angepasst werden muss statt Sideboard-Pflaster anzulegen.

## Validierung

- [ ] Archetyp und Siegbedingungen klar definiert
- [ ] Deck erfuellt die Formatlegalitaet (Verbotsliste, Rotation, Kartenzahl)
- [ ] Jede Karte hat eine definierte Rolle (Kern, Unterstuetzung, Interaktion, Ressource)
- [ ] Mana-/Energiekurve unterstuetzt die Geschwindigkeit der Strategie
- [ ] Ressourcenbasis kann zuverlaessig Karten auf der Kurve ausspielen
- [ ] Metagame-Matchups mit spezifischer Begruendung evaluiert
- [ ] Sideboard adressiert die schlechtesten Matchups mit klaren Tauschplaenen
- [ ] Budgetbeschraenkungen erfuellt (falls zutreffend)

## Haeufige Stolperfallen

- **Zu viele Siegbedingungen**: Ein Deck mit 3 verschiedenen Wegen zu gewinnen macht normalerweise keinen davon gut. Auf 1-2 konzentrieren
- **Kurvenblindheit**: Starke teure Karten hinzufuegen ohne zu pruefen ob das Deck sie rechtzeitig ausspielen kann
- **Das Metagame ignorieren**: Im Vakuum bauen. Das theoretisch beste Deck verliert gegen das in der Praxis haeufigste Deck
- **Emotionale Karteneinbindung**: Eine Lieblingskarte behalten die der Strategie nicht dient. Jeder Platz muss seinen Platz verdienen
- **Sideboard als Nebensache**: Das Sideboard zuletzt mit Restkarten bauen. Das Sideboard ist Teil des Decks, kein Anhang
- **Ueber-Spezialisierung**: Das Deck mit engen Antworten auf bestimmte Decks fuellen statt proaktiver Strategie

## Verwandte Skills

- `grade-tcg-card` -- Kartenzustandsbewertung fuer Turnierlegalitaet und Sammlungswert
- `manage-tcg-collection` -- Bestandsverwaltung um zu verfolgen welche Karten fuer den Deckbau verfuegbar sind
