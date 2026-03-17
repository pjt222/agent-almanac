---
name: manage-token-budget
description: >
  Token-Verbrauch in agentischen Systemen ueberwachen, begrenzen und nach
  Ueberschreitung wiederherstellen. Umfasst zyklusbasiertes Kostentracking,
  Kontextfenster-Audits, Budgeobergrenzen mit Durchsetzungsrichtlinien,
  Notfall-Pruning beim Naehern an Grenzen und Progressive-Disclosure-Integration
  zur Token-Minimierung beim Routing. Verwenden bei langlebigen Agent-Schleifen
  (Heartbeats, Polling, autonome Workflows), bei unvorhersehbar wachsenden
  Kontextfenstern zwischen Zyklen, bei unerwartet gestiegenen API-Kosten, beim
  Entwurf neuer agentischer Workflows oder bei der Post-mortem-Analyse eines
  Kostenvorfalls.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: token-management, cost-optimization, context-window, budget, progressive-disclosure
---

# Token-Budget verwalten

Kosten und Kontext-Fussabdruck agentischer Systeme kontrollieren: Token-Verbrauch pro Zyklus tracken, den Kontextbedarf der einzelnen Komponenten ermitteln, Budgetobergrenzen durchsetzen, geringwertigen Kontext unter Druck prunen und ueber Metadaten routen, bevor vollstaendige Verfahren geladen werden. Das Kernprinzip: Jedes Token im Kontextfenster muss seinen Platz verdienen. Tokens, die Entscheidungen beeinflussen, bleiben; Tokens, die Platz belegen ohne die Ausgabe zu beeinflussen, werden entfernt.

Community-Evidenz: Eine 37-stuendige autonome Sitzung kostete 13,74 $ — verursacht durch ein 30-minuetiges Heartbeat-Intervall kombiniert mit ausfuehrlichen Systemanweisungen und unkontrollierter Kontextakkumulation. Die Loesung war, den Heartbeat auf 4-Stunden-Intervalle umzustellen, in den Benachrichtigungsmodus zu wechseln und Feed-Browsing aus der Schleife zu entfernen. Dieser Skill kodifiziert die Muster, die solche Vorfaelle verhindern.

## Wann verwenden

- Langlebige Agent-Schleifen (Heartbeats, Polling-Zyklen, autonome Workflows) betreiben, bei denen sich Kosten im Laufe der Zeit summieren
- Kontextfenster wachsen zwischen Ausfuehrungszyklen unvorhersehbar
- API-Kosten haben die erwarteten Richtwerte ueberschritten und eine Post-mortem-Analyse ist erforderlich
- Neuen agentischen Workflow entwerfen und von Anfang an Kostenbremsen einbauen
- Nach einem Kostenvorfall zur Ursachenanalyse und Praevention
- Wenn Systemaufforderungen, Speicherdateien oder Tool-Schemas gross genug geworden sind, um das Kontextfenster zu dominieren

## Eingaben

- **Erforderlich**: Das zu budgetierende agentische System oder der Workflow (laufend oder geplant)
- **Erforderlich**: Budgetobergrenze (Dollarbetrag pro Zeitraum oder Token-Limit pro Zyklus)
- **Optional**: Aktuelle Kostendaten (API-Logs, Abrechnungsdashboard-Exporte)
- **Optional**: Kontextfenstergroe des Zielmodells (Standard: Modelldokumentation pruefen)
- **Optional**: Akzeptable Degradierungsrichtlinie (was weggelassen werden kann, wenn Grenzen erreicht werden)

## Vorgehensweise

### Schritt 1: Zyklusbasiertes Kostentracking einrichten

Die agentische Schleife instrumentieren, um Token-Verbrauch an jeder Ausfuehrungsgrenze zu protokollieren.

Fuer jeden Zyklus (Heartbeat, Poll, Aufgabenausfuehrung) erfassen:

1. **Input-Tokens**: Systemaufforderung + Speicher + Tool-Schemas + Konversationsverlauf + neue Nutzer-/Systeminhalte
2. **Output-Tokens**: die Antwort des Modells einschliesslich Tool-Aufrufe
3. **Gesamtkosten**: Input-Tokens × Eingabepreis + Output-Tokens × Ausgabepreis
4. **Zyklus-Zeitstempel**: wann der Zyklus lief
5. **Zyklus-Ausloser**: was ihn initiiert hat (Timer, Ereignis, Nutzeraktion)

Diese in einem strukturierten Log speichern (JSON-Zeilen, CSV oder Datenbank) — nicht im Kontextfenster selbst:

```
{"cycle": 47, "ts": "2026-03-12T14:30:00Z", "trigger": "heartbeat",
 "input_tokens": 18420, "output_tokens": 2105, "cost_usd": 0.0891,
 "cumulative_cost_usd": 3.42}
```

Wenn das System keine Instrumentierung hat, aus API-Abrechnung schaetzen:

- Gesamtkosten / Anzahl Zyklen = durchschnittliche Kosten pro Zyklus
- Mit erwartetem Richtwert vergleichen (Modellpreise × erwartete Kontextgroesse)

**Erwartet:** Ein Log mit Token-Anzahlen und Kosten pro Zyklus, mit ausreichender Granularitaet, um teure Zyklen zu identifizieren. Das Log selbst liegt ausserhalb des Kontextfensters.

**Bei Fehler:** Wenn genaue Token-Zahlen nicht verfuegbar sind (manche APIs liefern keine Nutzungsmetadaten), Abrechnungsdashboard fuer Durchschnittswerte verwenden. Selbst grobes Tracking (Tageskosten / Tageszyklusanzahl) zeigt Trends. Wenn kein Tracking moeglich, zu Schritt 2 uebergehen und aus dem Kontext-Audit schaetzen.

### Schritt 2: Kontextfenster auditieren

Messen, was das Kontextfenster belegt, und Verbraucher nach Groesse ranken.

Den Kontext in seine Komponenten zerlegen und jede messen:

1. **Systemaufforderung**: Grundanweisungen, CLAUDE.md-Inhalte, Persoenlichkeitsanweisungen
2. **Speicher**: MEMORY.md, ueber Auto-Memory geladene Themendateien
3. **Tool-Schemas**: MCP-Server-Tool-Definitionen, Function-Calling-Schemas
4. **Skill-Verfahren**: vollstaendige SKILL.md-Inhalte fuer aktive Skills
5. **Konversationsverlauf**: vorherige Gespraechsrunden in der aktuellen Sitzung
6. **Dynamische Inhalte**: Tool-Ausgaben, Dateiinhalte, Suchergebnisse aus dem aktuellen Zyklus

Eine Kontextbudget-Tabelle erstellen:

```
Kontextbudget-Audit:
+------------------------+--------+------+-----------------------------------+
| Komponente             | Tokens | %    | Hinweise                          |
+------------------------+--------+------+-----------------------------------+
| Systemaufforderung     | 4.200  | 21%  | Beinhaltet CLAUDE.md-Kette        |
| Speicher (auto-geladen)| 3.800  | 19%  | MEMORY.md + 4 Themendateien       |
| Tool-Schemas           | 2.600  | 13%  | 3 MCP-Server, 47 Tools            |
| Aktives Skill-Verf.    | 1.900  |  9%  | Vollstaendige SKILL.md geladen    |
| Konversationsverlauf   | 5.100  | 25%  | 12 vorherige Runden               |
| Aktueller Zyklusinhalt | 2.400  | 12%  | Tool-Ausgaben dieses Zyklus       |
+------------------------+--------+------+-----------------------------------+
| GESAMT                 | 20.000 | 100% | Modellgrenze: 200.000            |
| Verbleibender Spielraum|180.000 |      |                                   |
+------------------------+--------+------+-----------------------------------+
```

Komponenten markieren, die im Verhaeltnis zu ihrem Entscheidungswert unverhaltsnismaessig gross sind. Eine 4.000-Token-Speicherdatei, die die aktuelle Aufgabe nie referenziert, ist reiner Overhead.

**Erwartet:** Eine Rangliste-Tabelle mit jedem Kontextverbraucher, seiner Groesse und seinem Prozentsatz des Fensters. Mindestens eine Komponente wird als Reduktionskandidat hervorstechen — am haeufigsten Konversationsverlauf oder ausfuehrliche Tool-Ausgaben.

**Bei Fehler:** Wenn genaue Token-Zahlen pro Komponente schwer zu ermitteln sind, Zeichenanzahl / 4 als Naeherung fuer englischen Text verwenden. Fuer strukturierte Daten (JSON, YAML) Zeichenanzahl / 3. Das Ziel ist relatives Ranking, nicht exakte Messung.

### Schritt 3: Budgetobergrenzen mit Durchsetzungsrichtlinien festlegen

Weiche und harte Grenzen definieren und angeben, was bei Erreichen jeder passiert.

1. **Weiche Grenze** (Warnungsschwelle): typischerweise 60–75 % der harten Grenze. Bei Erreichen:
   - Warnung mit aktuellem Verbrauch und verbleibendem Budget protokollieren
   - Freiwilliges Pruning beginnen (Schritt 4) fuer Kontext mit geringstem Wert
   - Zyklusfrequenz reduzieren, wenn anwendbar (z. B. Heartbeat-Intervall von 30 Min. auf 2 Std.)
   - Betrieb mit degradiertem Kontext fortsetzen

2. **Harte Grenze** (Stoppschwelle): die absolute maximale Ausgabe oder Kontextgroesse. Bei Erreichen:
   - Autonomen Betrieb sofort einstellen
   - Alert an den menschlichen Operator senden (Benachrichtigung, E-Mail, Logeintrag)
   - Zusammenfassung des aktuellen Zustands fuer Wiederaufnahme speichern
   - Keinen weiteren Zyklus starten, bis ein Mensch geprueft und autorisiert hat

3. **Zyklusobergrenze**: maximale Tokens oder Kosten fuer einen einzelnen Zyklus. Verhindert, dass ein einzelner ausser Kontrolle geratener Zyklus das gesamte Budget verbraucht:
   - Wenn ein Zyklus die Obergrenze ueberschreiten wuerde, Tool-Ausgaben abschneiden oder Aktionen niedriger Prioritaet ueberspringen
   - Die Kuerzung fuer Post-mortem-Analyse protokollieren

Obergrenzen in der Workflow-Konfiguration dokumentieren:

```yaml
token_budget:
  soft_limit_usd: 5.00        # warnen und Pruning beginnen
  hard_limit_usd: 10.00       # anhalten und alarmieren
  per_cycle_cap_usd: 0.50     # max pro einzelnem Zyklus
  soft_limit_pct: 70           # % des Kontextfensters, das Pruning ausloest
  hard_limit_pct: 90           # % des Kontextfensters, das Halt ausloest
  enforcement: strict          # strict = bei harter Grenze anhalten; advisory = nur protokollieren
  alert_channel: notification  # Benachrichtigungskanal fuer Operator
```

**Erwartet:** Dokumentierte Budgetobergrenzen auf drei Ebenen (weich, hart, pro Zyklus) mit expliziten Durchsetzungsaktionen fuer jede. Die Richtlinie beantwortet "Was passiert, wenn wir die Grenze erreichen?" — bevor die Grenze erreicht wird.

**Bei Fehler:** Wenn genaue Dollar-Limits verfrueht sind (neuer Workflow mit unbekanntem Kostenprofil), zuerst nur mit Kontextprozentsatz-Limits beginnen (weich bei 70 %, hart bei 90 %) und Dollar-Limits nach 24–48 Stunden Kostendaten hinzufuegen. Beratungsmodus (protokollieren, aber nicht anhalten) ist waehrend der Kalibrierungsphase akzeptabel.

### Schritt 4: Notfall-Pruning implementieren

Beim Naehern an Grenzen geringwertigen Kontext systematisch entfernen, um im Budget zu bleiben.

Pruning-Prioritaetsreihenfolge (zuerst geringsten Wert entfernen):

1. **Alte Tool-Ausgaben**: ausfuehrliche Suchergebnisse, Dateiinhalte oder API-Antworten aus vorherigen Zyklen, die bereits getroffene Entscheidungen informiert haben. Die Entscheidung bleibt bestehen; die Belege koennen weg.
2. **Redundante Konversationsrunden**: fruehe Runden, die durch spaetere Korrekturen oder Verfeinerungen ueberholt wurden.
3. **Ausfuehrliche Formatierung**: Tabellen, ASCII-Kunst, dekorative Ueberschriften in Tool-Ausgaben. Mit einer einzeiligen Beschreibung des Inhalts zusammenfassen.
4. **Abgeschlossener Unteraufgaben-Kontext**: fuer mehrstufige Aufgaben, Kontext aus vollstaendig abgeschlossenen Unteraufgaben, deren Ausgaben in einer Zusammenfassung oder Datei erfasst sind.
5. **Inaktive Skill-Verfahren**: wenn ein Skill fuer einen vorherigen Schritt geladen wurde, aber nicht mehr befolgt wird, kann sein vollstaendiger Verfahrenstext entfernt werden.
6. **Speicherabschnitte, die fuer die aktuelle Aufgabe irrelevant sind**: automatisch geladene Speicher ueber nicht verwandte Projekte oder vergangene Sitzungen.

Fuer jedes gepruntete Element einen einzeiligen Grabstein erhalten:

```
[GEPRUNED: 2.400 Tokens npm-Audit-Ausgabe aus Zyklus 12 — 3 Sicherheitsluecken gefunden, alle behoben]
```

Der Grabstein kostet ~20 Tokens, bewahrt aber die entscheidungsrelevante Schlussfolgerung.

**Erwartet:** Kontextfenster-Nutzung faellt nach dem Pruning unter die weiche Grenze. Jedes gepruntete Element hat einen Grabstein, der seine Schlussfolgerung bewahrt. Keine entscheidungskritischen Informationen gehen verloren — nur die Belege hinter bereits getroffenen Entscheidungen.

**Bei Fehler:** Wenn Pruning bis Prioritaet 4 die Nutzung noch ueber der weichen Grenze laesst, ist der Workflow grundlegend zu kontextintensiv fuer die aktuelle Zyklusfrequenz. An den menschlichen Operator eskalieren: "Kontextnutzung bei N % nach Pruning. Optionen: (a) Zyklusintervall verlaengern, (b) Umfang pro Zyklus reduzieren, (c) in Sub-Workflows aufteilen, (d) hoehere Kosten akzeptieren."

### Schritt 5: Progressive Disclosure fuer Skill-Laden integrieren

Ueber Registry-Metadaten routen, bevor vollstaendige Skill-Verfahren geladen werden — Tokens fuer Routing ausgeben, nicht fuer das Lesen.

Das Muster:

1. **Zuerst routen**: Wenn eine Aufgabe einen Skill erfordert, den Registry-Eintrag lesen (id, description, domain, complexity, tags) aus `_registry.yml` — ungefaehr 3–5 Zeilen, ~50 Tokens
2. **Relevanz bestaetigen**: Passt die Registry-Beschreibung zum aktuellen Bedarf? Wenn nicht, den naechsten Kandidaten pruefen. Das kostet ~50 Tokens pro Fehlversuch statt ~500–2000 Tokens fuer das Laden einer falschen SKILL.md
3. **Bei Treffer laden**: Nur wenn der Registry-Eintrag Relevanz bestaetigt, das vollstaendige SKILL.md-Verfahren laden
4. **Nach Verwendung entladen**: Sobald das Verfahren des Skills abgeschlossen ist, kann der vollstaendige Text gepruned werden (Schritt 4, Prioritaet 5) — nur die Zusammenfassung des Erledigten behalten

Dasselbe Muster auf andere grosse Kontext-Payloads anwenden:

- **Speicherdateien**: MEMORY.md-Index-Zeilen zuerst lesen; Themendateien nur laden, wenn das Thema relevant ist
- **Tool-Dokumentation**: Tool-Namen und einzeilige Beschreibungen fuer Routing verwenden; vollstaendige Schemas nur fuer aufgerufene Tools laden
- **Dateiinhalte**: Dateilisten und Funktionssignaturen zuerst lesen; vollstaendige Dateiinhalte nur fuer zu aendernde Funktionen laden

```
Ohne Progressive Disclosure:
  5 Kandidaten-Skills laden → 5 × 1.500 Tokens = 7.500 Tokens → 1 Skill verwenden

Mit Progressive Disclosure:
  Durch 5 Registry-Eintraege routen → 5 × 50 Tokens = 250 Tokens
  1 passenden Skill laden → 1 × 1.500 Tokens = 1.500 Tokens
  Gesamt: 1.750 Tokens (77 % Reduktion)
```

**Erwartet:** Das Laden von Skills folgt einem zweiphasigen Muster: leichtgewichtiges Routing ueber Metadaten, dann vollstaendiges Laden nur bei bestaetiger Uebereinstimmung. Dasselbe Muster wird auf Speicher, Tool-Schemas und Dateiinhalte angewendet.

**Bei Fehler:** Wenn die Registry-Metadaten fuer Routing unzureichend sind (Beschreibungen zu vage, Tags fehlen), die Registry-Eintraege verbessern statt Progressive Disclosure aufzugeben. Die Loesung sind bessere Metadaten, nicht mehr Kontextladen.

### Schritt 6: Kostenorientierte Zyklusintervalle gestalten

Ausfuehrungsintervalle basierend auf Kostendaten festlegen, nicht nach beliebigen Zeitplaenen.

1. Kosten pro Stunde beim aktuellen Zyklusintervall berechnen:
   - `cost_per_hour = avg_cost_per_cycle × cycles_per_hour`
   - Beispiel: 0,09 $/Zyklus bei 2 Zyklen/Stunde = 0,18 $/Stunde = 4,32 $/Tag

2. Mit Budget vergleichen:
   - `hours_until_hard_limit = (hard_limit - cumulative_cost) / cost_per_hour`
   - Wenn hours_until_hard_limit < beabsichtigte Laufzeit, Zyklusintervall verlaengern

3. Minimales effektives Intervall bestimmen:
   - Wie schnell aendert sich die ueberwachte Datenquelle? Wenn sie alle 4 Stunden aktualisiert wird, verschwenden 7 von 8 Zyklen beim 30-Minuten-Polling Ressourcen
   - Zyklusintervall an Aktualisierungsrate der Daten anpassen, nicht an Sorge um verpasste Ereignisse
   - Fuer ereignisgesteuerte Systeme nach Moeglichkeit Polling durch Webhooks oder Push-Benachrichtigungen ersetzen

4. Intervall anwenden:

```
Vorher: 30-Minuten-Heartbeat, ausfuehrliche Verarbeitung
  → 48 Zyklen/Tag × 0,09 $/Zyklus = 4,32 $/Tag

Nachher: 4-Stunden-Heartbeat, nur Benachrichtigungen
  → 6 Zyklen/Tag × 0,04 $/Zyklus = 0,24 $/Tag
  → 94 % Kostenreduktion
```

**Erwartet:** Zyklusintervall wird durch Kostendaten begruendet und passt zur Aktualisierungsrate des ueberwachten Systems. Der Intervall-Kosten-Kompromiss ist dokumentiert, damit kuenftige Anpassungen eine Ausgangsbasis haben.

**Bei Fehler:** Wenn das System niedrige Latenz erfordert und keine laengeren Intervalle tolerieren kann, stattdessen die Kosten pro Zyklus reduzieren (kleinere Systemaufforderungen, weniger Tool-Schemas geladen, zusammengefasster Verlauf). Die Budgetgleichung hat zwei Hebel: Haeufigkeit und Kosten pro Zyklus.

### Schritt 7: Budgetkontrollen validieren

Bestaetigen, dass alle Kontrollen funktionieren und das System im Budget bleibt.

1. **Tracking-Validierung**: 3–5 Zyklen ausfuehren und pruefen, dass zyklusweise Logs mit genauen Token-Zahlen geschrieben werden
2. **Weiche-Grenze-Test**: Weiche Grenze voruebergehend absenken und pruefen, dass die Warnung ausgeloest wird und Pruning beginnt
3. **Harte-Grenze-Test**: Harte Grenze voruebergehend absenken und pruefen, dass das System haelt und alarmiert
4. **Zyklusobergrenze-Test**: Eine grosse Tool-Ausgabe einspeisen und pruefen, dass sie gekuerzt wird statt die Obergrenze zu sprengen
5. **Progressive-Disclosure-Test**: Eine Skill-Ladesequenz nachverfolgen und bestaetigen, dass sie ueber die Registry routet, bevor die vollstaendige SKILL.md geladen wird
6. **Kostenprojektion**: Aus Validierungsdaten projizieren:
   - Tageskosten bei aktuellen Einstellungen
   - Tage bis harte Grenze bei aktuellem Verbrauchstempo
   - Erwartete Monatskosten

```
Budget-Validierungsbericht:
+--------------------------+----------+--------+
| Pruefung                 | Erwartet | Actual |
+--------------------------+----------+--------+
| Zyklusweises Protokoll   | Vorhanden|        |
| Weiche-Grenze-Warnung    | Ausloest |        |
| Harte-Grenze-Halt        | Haelt    |        |
| Zyklusobergrenze         | Kuerzt   |        |
| Progressive Disclosure   | Routet   |        |
| Tageskosten-Projektion   | < X,XX $ |        |
+--------------------------+----------+--------+
```

**Erwartet:** Alle fuenf Kontrollen (Tracking, weiche Grenze, harte Grenze, Zyklusobergrenze, Progressive Disclosure) sind verifiziert und funktionieren. Kostenprojektion liegt im vorgesehenen Budget.

**Bei Fehler:** Wenn Kontrollen nicht ausloesen, pruefen, ob der Durchsetzungsmechanismus tatsaechlich in die Ausfuehrungsschleife eingebunden ist und nicht nur dokumentiert. Konfiguration ohne Durchsetzung ist ein Plan, keine Kontrolle. Wenn Kostenprojektion Budget ueberschreitet, zu Schritt 6 zurueckkehren und Zyklusintervall oder Kosten pro Zyklus anpassen.

## Validierung

- [ ] Zyklusweises Kostentracking protokolliert Input-Tokens, Output-Tokens, Kosten und Zeitstempel fuer jeden Zyklus
- [ ] Kontextfenster-Audit identifiziert alle Verbraucher mit ungefaehren Token-Zahlen und Prozentsaetzen
- [ ] Budgetobergrenzen sind auf drei Ebenen definiert: weiche Grenze, harte Grenze und Zyklusobergrenze
- [ ] Jede Obergrenze hat eine explizite Durchsetzungsaktion (warnen, prunen, anhalten, alarmieren)
- [ ] Notfall-Pruning folgt der Prioritaetsreihenfolge und bewahrt Grabsteine
- [ ] Progressive Disclosure routet ueber Metadaten, bevor vollstaendige Inhalte geladen werden
- [ ] Zyklusintervall wird durch Kostendaten begruendet und entspricht der Aktualisierungsrate des ueberwachten Systems
- [ ] Validierungstests bestaetigen, dass alle Kontrollen korrekt ausloesen
- [ ] Kostenprojektion liegt im definierten Budget
- [ ] Nach Vorfall: Ursache identifiziert und spezifische Praeventitonsmassnahme vorhanden

## Haeufige Stolperfallen

- **Tracking im Kontextfenster**: Zyklusweisige Logs innerhalb des Konversationsverlaufs speichern blaest genau das auf, was kontrolliert werden soll. Extern protokollieren (Datei, Datenbank, API) und nur die aktuelle Zusammenfassung im Kontext behalten.
- **Weiche Grenzen ohne Durchsetzung**: Eine Warnung, die niemand sieht, ist keine Kontrolle. Weiche Grenzen muessen eine sichtbare Aktion ausloesen — Pruning, Intervallerweiterung oder Operator-Benachrichtigung.
- **Entscheidungen vor Daten prunen**: Tool-Ausgaben droppen, bevor Entscheidungen getroffen sind, verliert Informationen. Belege NACH der Entscheidung, die sie informiert haben, prunen, nicht davor. Das Grabstein-Muster bewahrt Schlussfolgerungen beim Entfernen der Belege.
- **Zyklusintervall an Sorge statt an Datenerneuerungsrate anpassen**: Eine Quelle alle 30 Minuten pollen, wenn sie alle 4 Stunden aktualisiert, verschwendet 87,5 % der Zyklen.
- **Vollstaendige Skills fuer Routing laden**: Eine 400-zeilige SKILL.md zu lesen um zu entscheiden "Ist das der richtige Skill?" kostet 10–20 Mal mehr als den 3-zeiligen Registry-Eintrag zu lesen. Zuerst ueber Metadaten routen; Verfahren nur bei bestaetiger Uebereinstimmung laden.
- **Systemaufforderung ignorieren**: Systemaufforderungen, CLAUDE.md-Ketten und automatisch geladene Speicher sind unsichtbare Kosten — sie werden bei jedem einzelnen Zyklus bezahlt. Eine 5.000-Token-Systemaufforderung in einer 48-Zyklen/Tag-Schleife kostet 240.000 Input-Tokens/Tag nur fuer Anweisungen. Zuerst diese pruefen und kuerzen.
- **Budgetobergrenzen ohne menschliche Eskalation**: Autonome Systeme, die Budgetgrenzen erreichen und still degradieren (statt einen Menschen zu alarmieren), koennen Schaeden anhaeufen. Harte Grenzen muessen einen menschlichen Benachrichtigungskanal einschliessen.

## Verwandte Skills

- `assess-context` — Reasoning-Kontext auf strukturelle Gesundheit bewerten; ergaenzt das Kontextfenster-Audit in Schritt 2
- `metal` — konzeptionelle Essenz aus Codebasen extrahieren; das Progressive-Disclosure-Muster gilt fuer metals Prospektionsphase
- `chrysopoeia` — Wertextraktion und Eliminierung toten Gewichts; dieselbe Wert-pro-Token-Denkweise auf Code-Ebene anwenden
- `manage-memory` — persistente Speicherdateien organisieren und prunen; reduziert direkt die Speicherkomponente der Kontextbudgets
