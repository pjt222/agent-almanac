---
name: heal-guidance
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
description: >
  Eine Person durch Heilungsmodalitaeten fuehren einschliesslich Energiearbeit
  (Reiki, Chakra-Ausgleich), Kraeuterheilmittel, grundlegende Erste-Hilfe-
  Stabilisierung und ganzheitliche Techniken (Atemarbeit, Visualisierung,
  Koerperscan). KI begleitet den Praktizierenden durch Bewertungstriage,
  Modalitaetsauswahl, energetische Verbindung, Mittelzubereitung und
  Integration. Verwenden wenn eine Person ein koerperliches Leiden oder eine
  Verletzung beschreibt, ein energetisches Ungleichgewicht berichtet (Ermuedung,
  emotionale Stagnation), eine Begleitung durch eine ganzheitliche Atemarbeit-
  oder Visualisierungssitzung wuenscht, oder nach der Meditationsintegration
  gezielte Heilungsaufmerksamkeit benoetigt.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, energy-work, reiki, herbalism, holistic, guidance
---

# Heal (Guidance)

Eine Person durch einen mehrschichtigen Heilungsansatz fuehren, der energetische, kraeuter-, koerperliche und ganzheitliche Techniken kombiniert, um Erholung, Balance und Wohlbefinden zu unterstuetzen. Die KI agiert als informierter Coach — sie beansprucht nicht, Energie zu uebertragen, sondern bietet strukturierte Fuehrung durch jede Modalitaet.

## Wann verwenden

- Eine Person beschreibt ein koerperliches Leiden oder eine Verletzung und moechte strukturierte Fuehrung zur Stabilisierung und Unterstuetzung
- Jemand berichtet von energetischem Ungleichgewicht (anhaltende Ermuedung, emotionale Stagnation, gestoerter Schlaf) und moechte Begleitung durch Selbstheilungstechniken
- Kraeuterheilmittel sind angebracht und die Person hat Zugang zu Pflanzenmaterial (siehe `forage-plants`)
- Eine Person bittet um Fuehrung durch eine ganzheitliche Sitzung mit Atemarbeit, Visualisierung und Koerperscan
- Nach der Meditationsintegration zeigen sich Bereiche, die gezielte Heilungsaufmerksamkeit benoetigen (siehe `meditate-guidance`)

## Eingaben

- **Erforderlich**: Beschreibung des Zustands oder der Intention der Person (koerperlich, energetisch, emotional oder allgemeines Wohlbefinden)
- **Erforderlich**: Verfuegbare Ressourcen (Kraeuter, sauberes Wasser, Erste-Hilfe-Material, ruhiger Raum)
- **Optional**: Erfahrungsniveau der Person mit Energiearbeit (Standard: keine Vorerfahrung angenommen)
- **Optional**: Bekannte Kontraindikationen (Allergien, Medikamente, Verletzungen, Schwangerschaft)
- **Optional**: Verfuegbare Zeit fuer die Sitzung (Standard: 30-60 Minuten)

## Vorgehensweise

### Schritt 1: Ganzheitliche Beurteilung anleiten

Bevor eine Modalitaet ausgewaehlt wird, der Person helfen, das vollstaendige Bild ueber koerperliche, energetische und emotionale Dimensionen zu beurteilen.

```
Assessment Triage Matrix:
┌────────────────┬──────────────────────────┬──────────────────────────┐
│ Dimension      │ Ask About                │ Action Priority          │
├────────────────┼──────────────────────────┼──────────────────────────┤
│ Physical       │ Visible injury, bleeding,│ HIGH — stabilize first   │
│                │ breathing difficulty,     │ (Step 6)                 │
│                │ pain location/intensity  │                          │
├────────────────┼──────────────────────────┼──────────────────────────┤
│ Energetic      │ Temperature variations,  │ MEDIUM — address after   │
│                │ tingling, heaviness,     │ physical stability       │
│                │ numbness in body regions │ (Steps 3-4)              │
├────────────────┼──────────────────────────┼──────────────────────────┤
│ Emotional      │ Mood state, anxiety,     │ MEDIUM — weave through   │
│                │ grief, agitation,        │ all steps via presence   │
│                │ withdrawal               │ and breathwork (Step 7)  │
├────────────────┼──────────────────────────┼──────────────────────────┤
│ Environmental  │ Safety of location,      │ HIGH — secure space      │
│                │ temperature, noise,      │ before beginning any     │
│                │ available materials      │ modality                 │
└────────────────┴──────────────────────────┴──────────────────────────┘
```

Die Person durch die Selbstbeurteilung fuehren: "Wo liegt das Unbehagen? Wann hat es begonnen? Was lindert oder verschlimmert es? Bekannte Ursachen?" Aktiv zuhoeren und das Gehoerte spiegeln, um das Verstaendnis zu bestaetigen.

**Erwartet:** Ein klares Bild der Hauptbeschwerden, ihrer Dimension (koerperlich/energetisch/emotional) und ein priorisierter Plan, welche Schritte betont werden sollen. Die Person fuehlt sich gehoert und verstanden.

**Bei Fehler:** Wenn der Zustand unklar ist, die Person durch den Koerperscan in Schritt 7 fuehren, um Bereiche mit Anspannung, Waerme oder blockierter Energie zu lokalisieren, bevor eine Modalitaet ausgewaehlt wird.

### Schritt 2: Modalitaeten empfehlen

Basierend auf der Beurteilung eine oder mehrere der Situation angemessene Modalitaeten empfehlen und erklaeren, warum.

```
Modality Selection Guide:
┌────────────────────┬──────────────────────────┬──────────────────────┐
│ Modality           │ Best For                 │ Prerequisites        │
├────────────────────┼──────────────────────────┼──────────────────────┤
│ Energy healing     │ Energetic imbalance,     │ Quiet space, focused │
│ (Reiki/laying on)  │ emotional processing,    │ intention, grounded  │
│                    │ stress, recovery support  │ practitioner state   │
├────────────────────┼──────────────────────────┼──────────────────────┤
│ Herbal remedies    │ Digestive issues, minor  │ Identified plants,   │
│                    │ wounds, inflammation,     │ clean water, fire    │
│                    │ sleep support, immune     │ (see `make-fire`)    │
├────────────────────┼──────────────────────────┼──────────────────────┤
│ First aid          │ Bleeding, burns, sprains,│ First aid supplies   │
│                    │ fracture stabilization,   │ or improvised        │
│                    │ shock prevention          │ materials            │
├────────────────────┼──────────────────────────┼──────────────────────┤
│ Holistic           │ General wellness, anxiety,│ No materials needed  │
│ (breath/visual.)   │ grounding, integration,  │ beyond a quiet space │
│                    │ pain management           │                      │
└────────────────────┴──────────────────────────┴──────────────────────┘
```

Erklaeren, wie Modalitaeten kombiniert werden koennen: "Wir koennten mit Atemarbeit zum Erden beginnen, dann zu Energiearbeit fuer das Hauptanliegen uebergehen und mit einem Kraeutertee zur Integration abschliessen."

**Erwartet:** Ein Sitzungsplan mit 1-3 nach Prioritaet geordneten Modalitaeten, geschaetzter Zeit pro Modalitaet und benoedigten Materialien. Die Person versteht die Begruendung und stimmt dem Vorgehen zu.

**Bei Fehler:** Wenn die Person unsicher ist, standardmaessig zur ganzheitlichen Sequenz (Schritt 7) uebergehen — Atemarbeit und Visualisierung sind universell sicher und erfordern keine Materialien. Als sanften Einstiegspunkt formulieren.

### Schritt 3: Energetische Verbindung anleiten

Die Person in einen geerdeteten, zentrierten Zustand begleiten, bevor Energiearbeit beginnt.

1. Einladen, mit flachen Fuessen und geradem Ruecken zu sitzen oder zu stehen
2. Langsames Atmen anleiten: "Einatmen fuer 4 Zaehler, halten fuer 2, ausatmen fuer 6 Zaehler"
3. Eine Erdungsvisualisierung fuehren: "Stell dir vor, wie Wurzeln von deinen Fuessen in die Erde reichen und stabile, warme Energie heraufziehen"
4. Aufmerksamkeit auf die Haende lenken: "Beachte jede Waerme, Kribbeln oder Pulsieren in deinen Handflaechen"
5. Helfen, eine klare Intention zu setzen: "Formuliere innerlich, wofuer du Heilung beabsichtigst"
6. Wenn sie an einer anderen Person arbeiten werden, daran erinnern, vor dem Beruehren um Erlaubnis zu bitten

**Erwartet:** Die Person berichtet von Waerme oder Aktivierung in den Haenden. Sie wirkt ruhiger und konzentrierter. Die Intention wird klar gehalten.

**Bei Fehler:** Wenn sie sich nicht erden koennen, die Atemarbeit aus Schritt 7 verlaengern, bevor hierher zurueckgekehrt wird. Versichern, dass Schwierigkeiten normal sind und kein Zeichen von Unfahigkeit. Vorschlagen, sich einfach auf den Atemrhythmus zu konzentrieren, ohne Ruhe zu erzwingen.

### Schritt 4: Energieheilung begleiten

Die Person durch Handauflegen oder Haende-schweben-Technik ueber dem betroffenen Bereich oder Energiezentrum fuehren.

```
Chakra Correspondence (for targeted energy work):
┌──────────┬──────────────┬────────────────────────────────────────┐
│ Chakra   │ Location     │ Associated With                        │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Root     │ Base of spine│ Safety, grounding, physical vitality   │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Sacral   │ Below navel  │ Emotions, creativity, fluid balance    │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Solar    │ Upper abdomen│ Willpower, digestion, confidence       │
│ Plexus   │              │                                        │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Heart    │ Center chest │ Love, grief, compassion, circulation   │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Throat   │ Throat       │ Communication, expression, thyroid     │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Third Eye│ Forehead     │ Intuition, vision, mental clarity      │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Crown    │ Top of head  │ Connection, higher awareness, sleep    │
└──────────┴──────────────┴────────────────────────────────────────┘
```

1. "Halte deine Haende 5-10 cm ueber den Bereich, oder lege sie leicht darauf"
2. "Verbleibe 3-5 Minuten in dieser Position und atme gleichmaessig"
3. "Was nimmst du wahr? Waerme, Kaelte, Kribbeln, Pulsieren oder ein Ziehendes Gefuehl?"
4. Wenn sie blockierte Energie melden (dicht, kalt, statisch): "Visualisiere Licht, das die Blockade aufloest"
5. Wenn sie erschoepfte Energie melden (hohl, kuehlt): "Visualisiere warmes Licht, das den Bereich fuellt"
6. "Folge deiner Intuition — bewege dich zu verwandten Bereichen, wenn du dazu gedraengt fuehst"
7. "Zum Abschluss die Haende von Kopf bis Fuss, 5-10 cm vom Koerper entfernt, dreimal streichen"

**Erwartet:** Die Person berichtet von Waerme, Entspannung, Kribbeln oder emotionaler Entlastung. Haende koennen Temperaturveraenderungen oder Pulsieren wahrnehmen. Sitzungsdauer: 15-30 Minuten.

**Bei Fehler:** Wenn keine Empfindung wahrgenommen wird, den Fokus auf das Herzchakra (universell am ansprechbarsten) lenken und die Haltedauer auf 7-10 Minuten verlaengern. Bei Unbehagen mit Beruehren, Haende-schweben bestaetigen. Versichern, dass Energiearbeit Praesenz erfordert, nicht Glauben — vorschlagen, zur Erdung in Schritt 3 zurueckzukehren, wenn der Fokus verloren gegangen ist.

### Schritt 5: Zubereitung von Kraeuterheilmitteln anleiten

Wenn kraeuter­liche Unterstuetzung angebracht ist, die Zubereitung aus verfuegbaren Materialien anleiten.

```
Herbal First Aid Formulary:
┌───────────────┬─────────────────┬───────────────────────────────────┐
│ Condition     │ Herb/Material   │ Preparation                       │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Minor wound   │ Yarrow leaf     │ Chew or crush to poultice; apply  │
│               │                 │ directly to clean wound            │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Inflammation  │ Willow bark     │ Steep inner bark in hot water     │
│               │                 │ 15 min; drink as tea (contains    │
│               │                 │ salicin — natural aspirin)        │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Digestive     │ Mint, ginger,   │ Steep fresh or dried leaves/root  │
│ upset         │ chamomile       │ in hot water 10 min; sip slowly   │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Anxiety/sleep │ Chamomile,      │ Steep flowers/leaves in hot water │
│               │ lavender        │ 10 min; drink before rest         │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Insect sting  │ Plantain leaf   │ Chew leaf to poultice; apply to   │
│               │                 │ sting site for 10-15 min          │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Immune support│ Elderberry,     │ Simmer berries/root 20 min;       │
│               │ echinacea root  │ drink 1 cup 2-3x daily            │
└───────────────┴─────────────────┴───────────────────────────────────┘

CAUTION: Positive identification is essential before ingesting any plant.
See `forage-plants` for identification protocols.
Use `purify-water` for safe water and `make-fire` for heating.
```

Jeden Zubereitungsschritt begleiten und bei jedem Stadium die Pflanzenidentifikation bestaetigen.

**Erwartet:** Ein der Erkrankung angemessenes Heilmittel, hergestellt aus positiv identifizierten Materialien mit sauberem Wasser.

**Bei Fehler:** Wenn die Pflanzenidentifikation unsicher ist, von Einnahme abraten. Externe Umschlaege tragen weniger Risiko, erfordern aber ebenfalls korrekte Pflanzen-ID. Wenn keine geeigneten Kraeuter verfuegbar sind, diesen Schritt ueberspringen und auf andere Modalitaeten zurueckgreifen.

### Schritt 6: Erste-Hilfe-Stabilisierung anleiten

Bei koerperlichen Verletzungen Stabilisierung anleiten, bevor esoterische Modalitaeten angewendet werden.

1. **Blutung**: "Direkten Druck mit einem sauberen Tuch ausueben, wenn moeglich ueber Herzhoehe heben, 10-15 Minuten Druck halten ohne nachzusehen"
2. **Verbrennungen**: "10-20 Minuten mit sauberem fliessendem Wasser kuehlen, locker mit sauberem Tuch bedecken — kein Eis, keine Butter"
3. **Verstauchungen**: "Den Bereich schonen, Eis oder kaltes Wasser auflegen, fest aber nicht zu eng bandagieren, hochlagern"
4. **Schockzeichen** (blass, kalt, schneller Puls, Verwirrtheit): "Flach hinlegen, Beine erhoehen, warm halten, beruhigend mit der Person sprechen"
5. **Atemschwierigkeiten**: "Aufrecht sitzen, Kleidung lockern, langsames Atmen anleiten — 4 Zaehler ein, 6 Zaehler aus"

**Erwartet:** Blutung gestillt, Schmerz behandelt, Schock verhindert und die Person stabil genug fuer Transport oder weitere Versorgung.

**Bei Fehler:** Wenn die Blutung nach 15 Minuten mit direktem Druck nicht stoppt, Druck auf den arteriellen Druckpunkt stromaufwaerts der Wunde anleiten. Bei sich verschlechternden Schocksymptomen Waerme und Bewusstsein aufrechterhalten und Notfallhilfe anfordern. Erste-Hilfe-Stabilisierung hat absolute Prioritaet vor allen anderen Modalitaeten — dies klar kommunizieren.

### Schritt 7: Ganzheitliche Techniken anleiten

Diese Techniken koennen eigenstaendig stehen oder in jede andere Modalitaet eingebettet werden.

**Atemarbeit** (5-10 Minuten):
1. "Einatmen fuer 4 Zaehler, halten fuer 2, ausatmen fuer 6 Zaehler"
2. Bei Schmerz: "Auf den Atem konzentrieren, nicht den Schmerz — bei jedem Ausatmen vorstellen, dass Spannung diesen Bereich verlaesst"
3. Bei Angst: "Das Ausatmen verlaengern — einatmen fuer 4, ausatmen fuer 7 — das aktiviert die Beruhigungsreaktion"
4. Fuer Energie: "Schnelles Atmen durch die Nase versuchen — 30 schnelle Ein-Ausatem-Zyklen, dann halten" (Vorsicht: kann Schwindel verursachen, vorher warnen)

**Visualisierung** (5-10 Minuten):
1. "Heilendes Licht vorstellen — welche Farbe sich richtig anfuehlt — das durch den Scheitel eintritt"
2. "Dieses Licht auf den Bereich lenken, der Aufmerksamkeit benoetigt"
3. "Das Licht dabei zusehen, wie es jede Dunkelheit, Verstopfung oder Schmerz aufloest"
4. "Es sich ausdehnen lassen, bis es den gesamten Koerper fuellt"
5. "Den Koerper in eine schuetzende Sphaere dieses Lichts gehuellt vorstellen"

**Koerperscan** (10-15 Minuten):
1. "Am Scheitel des Kopfes beginnen"
2. "Die Aufmerksamkeit langsam durch jeden Koerperbereich nach unten bewegen"
3. "In jedem Bereich beachten: Anspannung, Temperatur, Empfindung, Emotion"
4. "Wo Blockaden gefunden werden, 3-5 Atemzuege in diesen Bereich atmen"
5. "Weiter bis zu den Fusssohlen"
6. Bereiche notieren, die sie benennen, fuer gezieltes Follow-up

**Erwartet:** Die Person berichtet von zunehmender Entspannung, reduzierter Schmerzwahrnehmung oder emotionaler Entlastung. Koerperscan identifiziert spezifische Bereiche fuer gezielte Nachsorge.

**Bei Fehler:** Wenn sie sich nicht auf Visualisierung konzentrieren koennen, auf reine Atemarbeit vereinfachen. Wenn der Koerperscan emotionalen Stress ausloest, verlangsamen und die Moeglichkeit anbieten, diesen Koerperbereich zu ueberspringen. Versichern, dass das Ziel nie ist, gegen Widerstand zu drucken.

### Schritt 8: Abschluss und Nachsorge

1. 5-10 Minuten ruhige Erholung nach der Sitzung ermoeglichen
2. Wasser anbieten (siehe `purify-water` in der Wildnis)
3. Fragen: "Wie fuehlen Sie sich im Vergleich zum Beginn?"
4. Bereiche notieren, die sich verschoben haben, und solche, die unveraendert blieben
5. Fortlaufende Selbstpflege empfehlen: weitergehende Atemarbeit, Kraeutertee, Ruhe
6. Fuer Energiearbeit: extra Wasser und Ruhe fuer den Rest des Tages empfehlen
7. Fuer Kraeuterheilmittel: Dosierung und Haeufigkeit angeben (typischerweise 2-3 mal taeglich fuer Tees)
8. Follow-up bei anhaltenden Beschwerden vorschlagen

**Erwartet:** Die Person berichtet von Verbesserung oder zumindest keiner Verschlechterung. Ein Nachsorgeplan ist fuer anhaltende Erkrankungen vorhanden.

**Bei Fehler:** Wenn der Zustand sich verschlechtert hat, neu beurteilen (zu Schritt 1 zurueckkehren) und eine andere Modalitaet in Betracht ziehen. Bei anhaltenden oder ernsten koerperlichen Beschwerden konventionelle medizinische Behandlung empfehlen — diese Modalitaeten sind komplementaer, kein Ersatz fuer professionelle Versorgung.

## Validierung

- [ ] Ganzheitliche Beurteilung wurde vor der Modalitaetsauswahl abgeschlossen
- [ ] Koerperliche Verletzungen wurden stabilisiert, bevor esoterische Modalitaeten angewendet wurden
- [ ] Die Person war geerdet und zentriert, bevor Energiearbeit begann
- [ ] Verwendete Kraeuter wurden positiv identifiziert (siehe `forage-plants`)
- [ ] Wasser fuer Heilmittel war sicher (siehe `purify-water`)
- [ ] Einverstaendnis wurde vor Handauflegen oder energiegeleiteter Arbeit eingeholt
- [ ] Sitzung umfasste eine abschliessende Integrationsperiode und Nachsorgeplan
- [ ] Keine Modalitaet wurde gegen den Widerstand der Person erzwungen
- [ ] KI hat begleitet, ohne zu beanspruchen, selbst Energie zu uebertragen oder zu kanalisieren

## Haeufige Stolperfallen

- **Koerperliche Stabilisierung ueberspringen**: Energiearbeit bei einer blutenden Wunde ist unverantwortlich — immer zuerst Stabilisierung anleiten
- **Falsch identifizierte Kraeuter**: Falsche Pflanzenidentifikation kann Vergiftung verursachen — im Zweifel von Einnahme abraten
- **Erdung ueberhastet**: Eine nicht geerdetete Person, die Energiearbeit versucht, uebertraegt Unruhe — die Zeit in Schritt 3 investieren
- **Autonomie der Person uebergehen**: Nie auf einer Technik bestehen, die sie als unangenehm empfinden — Heilung erfordert Vertrauen
- **Fuer professionelle Versorgung einsetzen**: Diese Modalitaeten ergaenzen, ersetzen aber nicht Notfallmedizin oder medikamentoese Behandlung
- **Emotionale Entlastung ignorieren**: Energiearbeit kann Trauer, Wut oder Erinnerungen an die Oberflaeche bringen — Raum halten ohne zu versuchen zu beheben oder zu interpretieren
- **KI ueberschreitet Grenzen**: Die KI leitet Prozesse an und stellt Wissen bereit, beansprucht jedoch nicht zu diagnostizieren, zu verschreiben oder Heilenergie zu uebertragen

## Verwandte Skills

- `heal` — die KI-selbstgesteuerte Variante fuer interne Teilsystembewertung und -neuausrichtung
- `meditate-guidance` — Meditation baut das fokussierte Gewahrsein auf, das effektive Heilungsarbeit traegt
- `remote-viewing-guidance` — teilt nichtlokale Gewahrseins-Coaching-Techniken, die fuer intuitive Beurteilung nuetzlich sind
- `mindfulness` — situative Aufmerksamkeit und schnelle Erdungstechniken unterstuetzen die Praktiziendenpraesenz
- `tai-chi` — Qi-Kultivierung durch Tai Chi ergaenzt energetische Heilungsmodalitaeten
- `forage-plants` — Quellmaterial fuer Kraeuterheilmittel; deckt sichere Pflanzenidentifikation ab
- `purify-water` — sicheres Wasser ist fuer Kraeuterzubereitungen und Hydratation nach der Sitzung erforderlich
- `make-fire` — benoetigt zum Erhitzen von Wasser fuer Kraeutertees und Aufguesse
