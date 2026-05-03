---
name: choose-loop-wakeup-interval
description: >
  Select a `delaySeconds` value when scheduling a loop wakeup via the
  `ScheduleWakeup` tool or the `/loop` slash command. Covers the three-tier
  cache-aware decision (cache-warm under 5 minutes, cache-miss 5 minutes to
  1 hour, idle default 20 to 30 minutes), the 300-second anti-pattern, the
  [60, 3600] runtime clamp, the minute-boundary rounding quirk, and writing
  a telemetry-worthy `reason` field. Use when designing an autonomous loop,
  when a heartbeat cadence is being planned, when polling cadence is being
  tuned, or when post-hoc review of loop costs reveals interval mis-sizing.
license: MIT
allowed-tools: ""
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: loop, wakeup, cache, scheduling, delay, decision
  locale: de
  source_locale: en
  source_commit: 9c546edf
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Loop-Wakeup-Intervall waehlen

Einen `delaySeconds`-Wert fuer `ScheduleWakeup` waehlen der die 5-Minuten-TTL des Prompt-Caches, die Ganz-Minuten-Granularitaet des Schedulers und den `[60, 3600]`-Laufzeit-Clamp respektiert. Die Entscheidung ist strukturell nicht trivial: der haeufige Instinkt "etwa 5 Minuten warten" landet in der Worst-of-Both-Zone — den Cache-Miss bezahlen ohne die Wartezeit zu amortisieren.

Die Begruendung reist mit der `ScheduleWakeup`-Tool-Beschreibung zur Tool-Aufruf-Zeit, aber dann ist der Loop bereits geplant. Dieser Skill hebt diese Begruendung auf die Planungszeit, wo sie hingehoert.

## Wann verwenden

- Eine autonome `/loop`- oder `ScheduleWakeup`-getriebene Fortsetzung entwerfen und das Pro-Tick-Delay waehlen
- Eine Heartbeat-Kadenz fuer einen lang laufenden Agenten planen der pollen, beobachten oder iterieren wird
- Polling-Kadenz gegen Kosten- oder Cache-Waerme-Druck abstimmen
- Post-hoc Loop-Kosten pruefen und entdecken dass das Intervall falsch dimensioniert war
- Einen Guide, Runbook oder Beispiel schreiben das die Wahl von `delaySeconds` betrifft

## Eingaben

- **Erforderlich**: Worauf der Loop wartet (ein spezifisches Ereignis, ein Zustandsuebergang, ein Idle-Tick, eine periodische Pruefung)
- **Erforderlich**: Ob der Leser dieses Ticks frischen Kontext braucht (cache-warm) oder ein kaltes erneutes Lesen tolerieren kann (cache-miss akzeptabel)
- **Optional**: Bekannte untere Grenze fuer wann das erwartete Ereignis ueberhaupt eintreten koennte (z.B. "der Build dauert mindestens 4 Minuten")
- **Optional**: Eine Kostendecke fuer den Gesamtloop (Anzahl Ticks × Pro-Tick-Kosten)

## Vorgehensweise

### Schritt 1: Die Wartezeit klassifizieren

Entscheiden welcher Stufe die Wartezeit angehoert:

- **Aktive Beobachtung (cache-warm)**: etwas wird sich innerhalb der naechsten 5 Minuten aendern — ein Build kurz vor Abschluss, ein Zustandsuebergang der gepollt wird, ein Prozess der gerade gestartet wurde
- **Cache-Miss-Wartezeit**: nichts ist es wert frueher als 5 Minuten von jetzt geprueft zu werden; der Kontext-Cache wird kalt und das ist akzeptabel
- **Idle**: kein spezifisches Signal zu beobachten; der Loop checkt ein weil er etwas finden koennte, nicht weil er es wird

**Erwartet:** Eine klare Klassifikation: active-watch, cache-miss oder idle.

**Bei Fehler:** Wenn die Wartezeit nicht klassifiziert werden kann — wenn es keine ehrliche Antwort auf "worauf warte ich?" gibt — sollte der Loop wahrscheinlich nicht existieren. Zu Schritt 5 ueberspringen und in Erwaegung ziehen ueberhaupt keinen Wakeup zu planen.

### Schritt 2: Die Drei-Stufen-Entscheidung anwenden

Ein `delaySeconds` basierend auf der Klassifikation waehlen:

| Stufe | Bereich | Cache-Verhalten | Verwenden wenn |
|---|---|---|---|
| Cache-warm | **60 – 270 s** | Cache bleibt warm (unter 5-Minuten-TTL) | Aktive Beobachtung — der naechste Tick braucht schnellen, guenstigen Wiedereintritt |
| Cache-miss | **1200 – 3600 s** | Cache wird kalt; ein Miss kauft eine lange Wartezeit | Genuein idle, oder das erwartete Ereignis kann nicht frueher passieren |
| Idle-Standard | **1200 – 1800 s** (20–30 min) | Cache wird kalt | Kein spezifisches Signal; periodische Pruefung mit unterbrechbarem Benutzer |

**Nicht 300 s waehlen.** Es ist das Worst-of-Both-Intervall: der Cache misst, aber die Wartezeit ist zu kurz um den Miss zu amortisieren. Wenn man sich nach "etwa 5 Minuten" greift, auf 270 s fallen (warm bleiben) oder sich auf 1200 s+ festlegen (Miss amortisieren).

**Erwartet:** Ein spezifischer `delaySeconds`-Wert ausgewaehlt aus einer der drei Stufen, kein gewohnheitsmaessig gewaehlter Rund-Minuten-Wert.

**Bei Fehler:** Wenn die Wahl immer wieder bei 300 s landet, lautet die zugrundeliegende Frage meist "sollte dieser Loop ueberhaupt mit dieser Kadenz existieren?" — Schritt 1 erneut pruefen.

### Schritt 3: Fuer die Minutengrenze dimensionieren

Der Scheduler feuert auf Ganz-Minuten-Grenzen. Ein `delaySeconds` von `N` produziert ein tatsaechliches Delay von `N` bis `N + 60` s, abhaengig davon zu welcher Sekunde der Minute man das Tool aufruft.

Beispiel:

> `ScheduleWakeup({delaySeconds: 90})` zu `HH:MM:40` aufrufen produziert ein Ziel von `HH:(MM+2):00` — d.h. eine tatsaechliche Wartezeit von 140 s, nicht 90 s.

Konsequenz: Sub-Minuten-Absicht ist bedeutungslos. Den uebergebenen Wert als **Untergrenze** behandeln, nicht als praezisen Schedule. Wenn eine Minute Skew wichtig ist, ist die Loop-Kadenz zu eng fuer diesen Mechanismus.

**Erwartet:** Es wurde akzeptiert dass die tatsaechliche Wartezeit bis zu 60 s laenger als die angeforderten `delaySeconds` ist. Fuer cache-warme Ticks ist das wichtig — 270 s koennen in der Praxis ~330 s werden und in Cache-Miss-Territorium kippen.

**Bei Fehler:** Wenn nahe-an-der-Decke-Werte (z.B. 265 s beim Anvisieren von Cache-Waerme) haeufig sind, nach unten polstern — 240 s statt 270 s nutzen um die Cache-warm-Garantie auch unter Worst-Case-Minutengrenze-Skew zu erhalten.

### Schritt 4: Den Clamp respektieren

Die Laufzeit clamped `delaySeconds` auf `[60, 3600]` — Werte ausserhalb des Bereichs werden still angepasst. Telemetrie unterscheidet was das Modell angefragt hat (`chosen_delay_seconds`) von dem was tatsaechlich geplant wurde (`clamped_delay_seconds`) und setzt `was_clamped: true` bei jedem Mismatch.

Gegen den geclampten Wert planen, nicht den angefragten:

- Anfrage unter 60 → tatsaechliche Wartezeit ist 60 s plus Minutengrenze-Skew (in der Praxis bis zu 120 s)
- Anfrage ueber 3600 → tatsaechliche Wartezeit ist 3600 s (1 Stunde)
- Keine Laufzeit erweitert die Decke; Mehrstunden-Wartezeiten brauchen mehrere Ticks

**Erwartet:** Der gewaehlte Wert faellt in `[60, 3600]`, oder das geclampte Verhalten wurde absichtlich akzeptiert.

**Bei Fehler:** Wenn der Bedarf genuein mehrstuendig ist (z.B. "in 4 Stunden wecken"), Wakeups verketten — einen 3600-s-Tick planen der sich selbst neu plant — oder einen cron-basierten Loop nutzen (`CronCreate` mit `kind: "loop"`).

### Schritt 5: Eine spezifische `reason` schreiben

Das `reason`-Feld ist Telemetrie, benutzersichtbarer Status und Prompt-Cache-Waerme-Begruendung in einer Zeile. Es wird auf 200 Zeichen abgeschnitten. Spezifisch sein.

- Gut: `checking long bun build`, `polling for EC2 instance running-state`, `idle heartbeat — watching the feed`
- Schlecht: `waiting`, `loop`, `next tick`, `continuing`

Der Leser dieses Feldes ist ein Benutzer der versucht zu verstehen was der Loop tut ohne die Kadenz im Voraus vorhersagen zu muessen. Fuer ihn schreiben.

**Erwartet:** Ein konkreter, einphrasiger Grund der einem Benutzer beim Blick auf den Status sinnvoll erscheinen wuerde.

**Bei Fehler:** Wenn kein spezifischer Grund gegeben werden kann, erneut pruefen ob der Loop existieren sollte (Schritt 1 und Schritt 6).

### Schritt 6: Den Don't-Loop-Fall erkennen

Nicht jeder "komme spaeter zurueck"-Impuls rechtfertigt einen geplanten Wakeup. Tick NICHT planen wenn:

- Der Benutzer aktiv beobachtet — seine Eingabe ist der richtige Trigger, kein Timer
- Es kein Konvergenzkriterium gibt — der Loop hat keine Definition von "fertig"
- Die Aufgabe interaktiv ist (stellt dem Benutzer zwischen Ticks Fragen)
- Die benoetigte Kadenz kuerzer als der Clamp-Boden ist (60 s) — derart enges Polling gehoert zu einem ereignisgetriebenen Mechanismus, nicht einem Loop

**Erwartet:** Eine bewusste Wahl zwischen Wakeup-Planung und gar kein Loop. "Weil ich konnte" ist kein Grund zu loopen.

**Bei Fehler:** Wenn man immer wieder Wakeups plant die der Benutzer vor dem Feuern unterbricht, ist das Muster falsch — nicht das Intervall.

## Validierung

- [ ] Die Wartezeit wurde als active-watch, cache-miss oder idle klassifiziert (eine von drei)
- [ ] Das gewaehlte `delaySeconds` faellt in einen der drei Stufen-Bereiche (60–270, 1200–3600 oder 1200–1800 fuer idle)
- [ ] Der Wert ist nicht 300 (worst-of-both)
- [ ] Der Wert ist innerhalb `[60, 3600]` oder das geclampte Verhalten ist explizit akzeptiert
- [ ] Minutengrenze-Skew wurde beruecksichtigt (Wert als Untergrenze behandeln)
- [ ] `reason` ist konkret und unter 200 Zeichen
- [ ] Die Don't-Loop-Pruefung wurde durchgefuehrt — der Wakeup ist tatsaechlich gerechtfertigt

## Haeufige Stolperfallen

- **Rund-Minuten-Standard (300 s)**: Der haeufigste Fehler. "Etwa 5 Minuten" fuehlt sich natuerlich an und ist genau falsch. Auf 270 s fallen oder auf 1200 s+ festlegen.
- **Minutengrenze-Skew ignorieren**: 60 s nahe Ende einer Minute anzufordern kann ~120 s tatsaechliches Delay produzieren. Bei cache-warmen Ticks kann das den Tick unerwartet ueber die 5-Minuten-TTL schieben.
- **Sub-Minuten-Praezision verfolgen**: Der Scheduler hat Minuten-Granularitaet. 85 s vs. 90 s vs. 95 s zu fragen ist Rauschen — einen Wert waehlen und weitermachen.
- **Opake `reason`-Felder**: `"waiting"` sagt dem Benutzer nichts und macht Telemetrie weniger nuetzlich. Den Grund schreiben als wuerde der Benutzer ihn auf einer Statuszeile lesen.
- **Diesen Skill nutzen um einen unnoetigen Loop zu rechtfertigen**: Wenn die ehrliche Antwort auf "worauf beobachte ich?" vage ist, hilft keine Intervall-Wahl — der Loop sollte nicht existieren.
- **Hand-Clamping im Prompt**: Nicht im Modell-Reasoning clampen ("ich begrenze auf 3600 zur Sicherheit"). Die Laufzeit clampt. Sie das machen lassen.
- **Die 7-Tage-Veralterung vergessen**: Ein dynamischer Loop wird standardmaessig nach 7 Tagen geerntet (benutzerkonfigurierbar bis 30 Tage). Lang laufende Loops sollten so entworfen werden dass sie deutlich vor dieser Decke enden, nicht gegen sie rennen.

## Beispiele

### Beispiel 1 — Cache-warme aktive Beobachtung

Ein `bun build` wurde gestartet; der Agent will schnell einchecken damit der Cache noch warm ist wenn Ergebnisse ankommen.

- Klassifikation: aktive Beobachtung (Schritt 1)
- Stufe: cache-warm (Schritt 2), **240 s** waehlen
- Minutengrenze (Schritt 3): Worst-Case tatsaechliche Wartezeit ~300 s — immer noch unter der 5-Minuten-TTL mit dem 60-s-Puffer
- Grund (Schritt 5): `checking long bun build`

### Beispiel 2 — Idle-Heartbeat

Ein autonomer Agent beobachtet einen Low-Volume-Feed einmal pro Stunde fuer alles was eine Aktion wert ist.

- Klassifikation: idle (Schritt 1)
- Stufe: Idle-Standard (Schritt 2), **1800 s** waehlen (30 min)
- Minutengrenze (Schritt 3): irrelevant — 60 s Skew ist bei dieser Kadenz vernachlaessigbar
- Grund (Schritt 5): `idle heartbeat — watching the feed`

### Beispiel 3 — Das Antimuster

Ein Agent will "5 Minuten warten" waehrend ein Remote-API neu versucht. Die Anfrage ist 300 s.

- Problem: der Cache wird bei 5 Minuten kalt, also bezahlt 300 s den Miss — aber 300 s ist zu kurz um den Miss zu amortisieren
- Fix: entweder auf 270 s fallen (warm bleiben) oder auf 1500 s festlegen (Miss amortisieren). Nicht 300 waehlen.

## Verwandte Skills

- `manage-token-budget` — Kostendecken fuer langlebige Agenten-Loops; cache-bewusste Dimensionierung ist ein Hebel
- `du-dum` — observe/act-Trennungsmuster; dieser Skill dimensioniert das observe-Clock-Intervall wenn der Loop cron-los ist
- `read-continue-here` — sitzungsuebergreifender Handoff; dieser Skill deckt Innerhalb-Sitzung-Wakeups ab
- `write-continue-here` — das Komplement zu `read-continue-here`

<!-- Keep under 500 lines. Current: ~200 lines. -->
