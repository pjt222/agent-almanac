---
name: circuit-breaker-pattern
description: >
  Circuit-Breaker-Logik fuer agentische Tool-Aufrufe implementieren —
  Tool-Gesundheit tracken, zwischen Closed/Open/Half-Open-Zustaenden
  wechseln, Aufgabenumfang bei Tool-Ausfaellen reduzieren, ueber
  Faehigkeitskarten zu Alternativen routen und Fehlerbudgets durchsetzen,
  um Fehlerakkumulation zu verhindern. Trennt Orchestrierung (entscheiden
  was versucht werden soll) von Ausfuehrung (Tools aufrufen), gemaess dem
  Expeditor-Muster. Verwenden beim Aufbau von Agenten, die von mehreren
  Tools mit unterschiedlicher Zuverlaessigkeit abhaengen, beim Entwurf
  fehlertoleranter agentischer Workflows, bei der Wiederherstellung nach
  Tool-Ausfaellen mitten in einer Aufgabe oder beim Haerten bestehender
  Agenten gegen kaskadende Tool-Fehler.
locale: de
source_locale: en
source_commit: b092becc
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: resilience, circuit-breaker, error-handling, graceful-degradation, tool-reliability, fault-tolerance
---

# Circuit-Breaker-Muster

Graceful Degradation bei Tool-Ausfaellen. Ein Agent, der fuenf Tools aufruft und eines defekt ist, sollte nicht vollstaendig versagen — er sollte das defekte Tool erkennen, aufhoeren es aufzurufen, den Umfang auf das verbleibend Erreichbare reduzieren und ehrlich berichten, was uebersprungen wurde. Dieser Skill kodifiziert diese Logik mit dem Circuit-Breaker-Muster aus verteilten Systemen, angepasst an agentische Tool-Orchestrierung.

Die Kernidee, aus kirapixelads' "Kuechen-Brandproblem": Der Expeditor (Orchestrierungsschicht) darf nicht selbst kochen. Die Trennung von Belangen zwischen dem Entscheiden *was* versucht werden soll und *wie* es versucht werden soll verhindert, dass der Orchestrator in der Wiederholungsschleife eines fehlerhaften Tools gefangen wird.

## Wann verwenden

- Agenten aufbauen, die von mehreren Tools mit unterschiedlicher Zuverlaessigkeit abhaengen
- Fehlertolerante agentische Workflows entwerfen, bei denen Teilergebnisse besser als Totalversagen sind
- Ein Agent steckt in einer Wiederholungsschleife bei einem defekten Tool fest statt mit funktionierenden Tools weiterzumachen
- Von Tool-Ausfaellen mitten in einer Aufgabe wiederherstellen
- Bestehende Agenten gegen kaskadende Tool-Fehler haerten
- Veraltete oder gecachte Tool-Ausgaben werden als aktuelle Daten behandelt

## Eingaben

- **Erforderlich**: Liste der Tools, von denen der Agent abhaengt (Namen und Zwecke)
- **Erforderlich**: Die Aufgabe, die der Agent zu erledigen versucht
- **Optional**: Bekannte Tool-Zuverlaessigkeitsprobleme oder vergangene Fehlermuster
- **Optional**: Fehlerschwelle (Standard: 3 aufeinanderfolgende Fehler bevor Schaltkreis oeffnet)
- **Optional**: Fehlerbudget pro Zyklus (Standard: 5 Gesamtfehler bevor Pause-und-Bericht)
- **Optional**: Half-Open-Sondenintervall (Standard: jeder 3. Versuch nach dem Oeffnen)

## Vorgehensweise

### Schritt 1: Faehigkeitskarte erstellen

Dokumentieren, was jedes Tool bereitstellt und welche Alternativen existieren. Diese Karte ist die Grundlage fuer Umfangsreduzierung — ohne sie laesst ein Tool-Ausfall den Agenten raten, was als naechstes zu tun ist.

```yaml
capability_map:
  - tool: Grep
    provides: Inhaltssuche ueber Dateien
    alternatives:
      - tool: Bash
        method: "rg oder grep Befehl"
        degradation: "verliert Greps eingebaute Ausgabeformatierung"
      - tool: Read
        method: "vermutete Dateien direkt lesen"
        degradation: "erfordert zu wissen welche Dateien zu pruefen; keine breite Suche"
    fallback: "Nutzer fragen, welche Dateien untersucht werden sollen"

  - tool: Bash
    provides: Befehlsausfuehrung, Build-Tools, Git-Operationen
    alternatives: []
    fallback: "Befehle berichten, die manuell ausgefuehrt werden muessen"

  - tool: Read
    provides: Dateiinhalt-Inspektion
    alternatives:
      - tool: Bash
        method: "cat oder head Befehl"
        degradation: "verliert Zeilennummerierung und Kuerzungssicherheit"
    fallback: "Nutzer bitten, Dateiinhalte einzufuegen"

  - tool: Write
    provides: Dateierstellung
    alternatives:
      - tool: Edit
        method: "ueber vollstaendige Datei-Edit erstellen"
        degradation: "erfordert, dass die Datei bereits fuer Edit existiert"
      - tool: Bash
        method: "echo/cat heredoc"
        degradation: "verliert Writes atomare Dateierstellung"
    fallback: "Dateiinhalte ausgeben, damit Nutzer manuell speichert"

  - tool: WebSearch
    provides: Externe Informationsabfrage
    alternatives: []
    fallback: "Benoettigte Informationen benennen; Nutzer bitten sie bereitzustellen"
```

Fuer jedes Tool dokumentieren:
1. Welche Faehigkeit es bereitstellt (eine Zeile)
2. Welche alternativen Tools es teilweise abdecken koennen (mit Degradierungshinweisen)
3. Was der manuelle Fallback ist, wenn keine Tool-Alternative existiert

**Erwartet:** Eine vollstaendige Faehigkeitskarte, die jedes vom Agenten genutzte Tool abdeckt. Jeder Eintrag hat mindestens einen Fallback, auch wenn keine Tool-Alternative existiert. Die Karte macht explizit, was sonst implizit ist: welche Tools kritisch (keine Alternativen) und welche substituierbar sind.

**Bei Fehler:** Wenn die Tool-Liste unklar ist, mit den `allowed-tools` aus dem Skill-Frontmatter beginnen. Wenn Alternativen unsicher sind, als `degradation: "unbekannt — vor Verwendung testen"` markieren statt sie wegzulassen.

### Schritt 2: Circuit-Breaker-Zustand initialisieren

Den Zustandstracker fuer jedes Tool einrichten. Jedes Tool startet im CLOSED-Zustand (gesund, normaler Betrieb).

```
Circuit-Breaker-Zustandstabelle:
+------------+--------+-------------------+------------------+-----------------+
| Tool       | Zustand| Aufeinanderfolgend | Letzter Fehler   | Letzter Erfolg  |
+------------+--------+-------------------+------------------+-----------------+
| Grep       | CLOSED | 0                 | —                | —               |
| Bash       | CLOSED | 0                 | —                | —               |
| Read       | CLOSED | 0                 | —                | —               |
| Write      | CLOSED | 0                 | —                | —               |
| Edit       | CLOSED | 0                 | —                | —               |
| WebSearch  | CLOSED | 0                 | —                | —               |
+------------+--------+-------------------+------------------+-----------------+

Fehlerbudget: 0 / 5 verbraucht
```

**Zustandsdefinitionen:**

- **CLOSED** — Tool ist gesund. Normal verwenden. Aufeinanderfolgende Fehler tracken.
- **OPEN** — Tool ist bekannt defekt. Nicht aufrufen. Zu Alternativen routen oder Umfang reduzieren.
- **HALF-OPEN** — Tool war defekt, koennte sich erholt haben. Einzelnen Sonden-Aufruf senden. Bei Erfolg zu CLOSED wechseln. Bei Fehler zu OPEN zurueckkehren.

**Zustandsuebergaenge:**

- CLOSED -> OPEN: Wenn aufeinanderfolgende Fehler die Schwelle erreichen (Standard: 3)
- OPEN -> HALF-OPEN: Nach konfigurierbarem Intervall (z. B. jeder 3. Aufgabenschritt)
- HALF-OPEN -> CLOSED: Bei erfolgreichem Sonden-Aufruf
- HALF-OPEN -> OPEN: Bei fehlgeschlagenem Sonden-Aufruf

**Erwartet:** Eine Zustandstabelle fuer alle Tools mit CLOSED-Zustand und null Fehleranzahlen initialisiert. Fehlerschwelle und Budget explizit deklariert.

**Bei Fehler:** Wenn die Tool-Liste nicht im Voraus enumeriert werden kann (dynamische Tool-Entdeckung), Zustand beim ersten Verwenden jedes Tools initialisieren. Das Muster gilt weiterhin — die Tabelle wird nur inkrementell aufgebaut.

### Schritt 3: Aufruf-und-Track-Schleife implementieren

Wenn der Agent ein Tool aufrufen muss, diese Entscheidungssequenz befolgen. Dies ist die Expeditor-Logik — sie entscheidet *ob* der Aufruf versucht werden soll, nicht *wie* er ausgefuehrt werden soll.

```
VOR jedem Tool-Aufruf:
  1. Tool-Zustand in der Circuit-Breaker-Tabelle pruefen
  2. Wenn OPEN:
     a. Pruefen ob Zeit fuer Half-Open-Sonde ist
        - Ja → zu HALF-OPEN wechseln, mit Sonden-Aufruf fortfahren
        - Nein  → Tool ueberspringen, zu Alternative routen (Schritt 4)
  3. Wenn HALF-OPEN:
     a. Einen Sonden-Aufruf machen
     b. Erfolg → zu CLOSED wechseln, aufeinanderfolgende Fehler auf 0 zuruecksetzen
     c. Fehler → zu OPEN wechseln, Fehlerbudget erhoehen
  4. Wenn CLOSED:
     a. Aufruf normal durchfuehren

NACH jedem Tool-Aufruf:
  1. Erfolg:
     - Aufeinanderfolgende Fehler auf 0 zuruecksetzen
     - Zeitstempel letzten Erfolgs aufzeichnen
  2. Fehler:
     - Aufeinanderfolgende Fehler erhoehen
     - Zeitstempel letzten Fehlers und Fehlermeldung aufzeichnen
     - Verbrauchtes Fehlerbudget erhoehen
     - Wenn aufeinanderfolgende Fehler >= Schwelle:
         zu OPEN wechseln
         protokollieren: "Schaltkreis OFFEN fuer [Tool]: [Fehlerzahl] aufeinanderfolgende Fehler"
     - Wenn Fehlerbudget erschoepft:
         PAUSE — Aufgabe nicht fortsetzen
         Nutzer berichten (Schritt 6)
```

Der Expeditor wiederholt einen fehlgeschlagenen Aufruf nie sofort. Er zeichnet den Fehler auf, prueft Schwellen und macht weiter. Wiederholungen erfolgen nur durch den HALF-OPEN-Sondenmechanismus in einem spaeteren Schritt.

**Erwartet:** Eine klare Entscheidungsschleife, die der Agent vor und nach jedem Tool-Aufruf befolgt. Tool-Gesundheit wird kontinuierlich getrackt. Die Expeditor-Schicht blockiert nie bei einem fehlerhaften Tool.

**Bei Fehler:** Wenn Zustand ueber Aufrufe hinweg nicht praktikabel getrackt werden kann (z. B. zustandslose Ausfuehrung), zu einem einfacheren Modell degradieren: Gesamtfehler zaehlen und bei Budget pausieren. Der Drei-Zustands-Circuit-Breaker ist ideal; ein Fehlerzhaler ist das Minimum-viable-Muster.

### Schritt 4: Bei offenem Schaltkreis zu Alternativen routen

Wenn der Schaltkreis eines Tools OPEN ist, die Faehigkeitskarte (Schritt 1) konsultieren und zur besten verfuegbaren Alternative routen.

**Routing-Prioritaet:**

1. **Tool-Alternative mit geringer Degradierung** — Ein anderes Tool verwenden, das aehnliche Faehigkeiten bietet. Die Degradierung in der Aufgabenausgabe vermerken.
2. **Tool-Alternative mit hoher Degradierung** — Ein anderes Tool mit erheblichem Faehigkeitsverlust verwenden. Explizit kennzeichnen, was im Ergebnis fehlt.
3. **Manueller Fallback** — Berichten, was der Agent nicht tun kann und welche Informationen oder Aktionen der Nutzer bereitstellen muss.
4. **Umfangsreduzierung** — Wenn keine Alternative existiert und kein Fallback machbar ist, die abhaengige Unteraufgabe vollstaendig aus dem Umfang entfernen (Schritt 5).

```
Beispiel-Routing-Entscheidung:

Benoetiges Tool: Grep (Schaltkreis OPEN)
Aufgabe: Alle Dateien mit "API_KEY" finden

Route 1: Bash mit rg Befehl
  → Degradierung: verliert Greps eingebaute Formatierung
  → Entscheidung: AKZEPTABEL — diese Route verwenden

Wenn Bash auch OPEN:
Route 2: Vermutete Konfigurationsdateien direkt lesen
  → Degradierung: erfordert Raten welche Dateien; keine breite Suche
  → Entscheidung: PARTIELL — nur bekannte Konfigurationspfade versuchen

Wenn Read auch OPEN:
Route 3: Nutzer fragen
  → "Ich muss Dateien mit 'API_KEY' finden, aber meine Such-
     Tools sind nicht verfuegbar. Koennen Sie ausfuehren: grep -r 'API_KEY' ."
  → Entscheidung: FALLBACK — Nutzer stellt die Information bereit

Wenn Nutzer nicht verfuegbar:
Route 4: Umfangsreduzierung
  → "API-Schlussel-Suche" aus Aufgabenumfang entfernen
  → Dokumentieren: "UEBERSPRUNGEN: API-Schlussel-Suche — keine Tools verfuegbar"
```

**Erwartet:** Wenn ein Tool-Schaltkreis oeffnet, routet der Agent transparent zu einer Alternative oder reduziert den Umfang. Routing-Entscheidung und eventuelle Degradierungen sind in der Aufgabenausgabe dokumentiert.

**Bei Fehler:** Wenn die Faehigkeitskarte unvollstaendig ist (keine Alternativen gelistet), standardmaessig auf Umfangsreduzierung zurueckfallen und berichten. Arbeit nie still uebergehen — immer dokumentieren, was uebersprungen wurde und warum.

### Schritt 5: Umfang auf erreichbare Arbeit reduzieren

Wenn Tools offen-geschaltet sind und Alternativen erschoepft sind, die Aufgabe auf das reduzieren, was noch mit funktionierenden Tools erledigt werden kann. Das ist kein Versagen — es ist ehrliches Umfangsmanagement.

**Umfangsreduzierungsprotokoll:**

1. Verbleibende Unteraufgaben auflisten
2. Fuer jede Unteraufgabe pruefen, welche Tools sie benoetigt
3. Wenn alle benoetigen Tools CLOSED sind oder machbare Alternativen haben: Unteraufgabe behalten
4. Wenn ein benoetiges Tool OPEN ohne Alternative ist: Unteraufgabe als ZURUECKGESTELLT markieren
5. Mit reduziertem Umfang fortfahren
6. Zurueckgestellte Unteraufgaben am Ende berichten

```
Umfangsreduzierungsbericht:

Urspruenglicher Umfang: 5 Unteraufgaben
  [x] 1. Konfigurationsdateien lesen          (Read: CLOSED)
  [x] 2. Nach veralteten Mustern suchen       (Grep: CLOSED)
  [ ] 3. Testpakete ausfuehren                (Bash: OPEN — keine Alternative)
  [x] 4. Dokumentation aktualisieren          (Edit: CLOSED)
  [ ] 5. In Staging deployen                  (Bash: OPEN — keine Alternative)

Reduzierter Umfang: 3 Unteraufgaben erreichbar
Zurueckgestellt: 2 Unteraufgaben benoetigen Bash (Schaltkreis OPEN)

Empfehlung: Unteraufgaben 1, 2, 4 jetzt abschliessen.
Unteraufgaben 3 und 5 benoetigen Bash — im naechsten Zyklus
sondieren oder Nutzer kann Befehle manuell ausfuehren.
```

Zurueckgestellte Unteraufgaben nicht versuchen. Open-geschaltete Tools nicht wiederholt aufrufen in der Hoffnung, sie werden funktionieren. Der Circuit Breaker existiert genau dafuer — seinem Zustand vertrauen.

**Erwartet:** Eine klare Aufteilung der Aufgabe in erreichbare und zurueckgestellte Arbeit. Der Agent schliessst alle erreichbare Arbeit ab und berichtet zurueckgestellte Elemente mit Grund und was sie entsperren wuerde.

**Bei Fehler:** Wenn Umfangsreduzierung alle Unteraufgaben entfernt (jedes Tool ist defekt), direkt zu Schritt 6 uebergehen — pausieren und berichten. Ein Agent ohne funktionierende Tools sollte keinen Fortschritt vortaeuschen.

### Schritt 6: Veraltung behandeln und Datenqualitaet kennzeichnen

Wenn ein Tool Daten zurueckgibt, die moeglicherweise veraltet sind (gecachte Ergebnisse, veraltete Snapshots, zuvor abgerufene Inhalte), diese explizit kennzeichnen statt sie als aktuell zu behandeln.

**Veraltungsindikatoren:**

- Tool-Ausgabe stimmt exakt mit einem vorherigen Aufruf ueberein (moeglicher Cache-Treffer)
- Daten referenzieren Zeitstempel vor der aktuellen Aufgabe
- Tool-Dokumentation erwaehnt Caching-Verhalten
- Ergebnisse widersprechen anderen aktuellen Beobachtungen

**Kennzeichnungsprotokoll:**

```
Bei der Praesentation moeglicherweise veralteter Daten:

"[VERALTETE DATEN — abgerufen um {Zeitstempel}, spiegelt moeglicherweise nicht aktuellen Zustand wider]
 Dateiinhalte des letzten erfolgreichen Lesens:
 ..."

"[GECACHTES ERGEBNIS — Grep gab identische Ergebnisse zum vorherigen Aufruf zurueck;
 Dateisystem koennte sich seitdem geaendert haben]"

"[NICHT VERIFIZIERT — WebSearch-Ergebnis vom {Datum}; aktueller Status unbekannt]"
```

Veraltete Daten nie still als aktuell praesentieren. Der Nutzer oder nachgelagerte Agent muss die Datenqualitaet kennen, um fundierte Entscheidungen zu treffen.

**Erwartet:** Alle Tool-Ausgaben, die moeglicherweise veraltet sind, tragen explizite Kennzeichnungen. Frische Daten werden nicht gekennzeichnet (Kennzeichnung ist fuer Unsicherheit reserviert, nicht fuer Bestaetigung).

**Bei Fehler:** Wenn Veraltung nicht bestimmt werden kann (keine Zeitstempel, keine Vergleichsbasis), die Unsicherheit vermerken: "[AKTUALITAET UNBEKANNT — keine Vergleichsbasis]". Unsicherheit ueber Aktualitaet ist selbst Information.

### Schritt 7: Fehlerbudget durchsetzen

Gesamtfehler ueber alle Tools hinweg tracken. Wenn das Budget erschoepft ist, pausiert der Agent und berichtet statt weiter Fehler anzusammeln.

```
Fehlerbudget-Durchsetzung:

Budget: 5 Fehler pro Zyklus
Aktuell: 4 / 5 verbraucht

  Fehler 1: Bash — "Berechtigung verweigert" (Schritt 3)
  Fehler 2: Bash — "Befehl nicht gefunden" (Schritt 3)
  Fehler 3: Bash — "Timeout nach 120s" (Schritt 4)
  Fehler 4: WebSearch — "Verbindung abgelehnt" (Schritt 5)

Status: 1 Fehler verbleibend vor obligatorischer Pause

→ Naechster Tool-Aufruf erfolgt mit erhoehter Vorsicht
→ Wenn er fehlschlaegt: PAUSE und Statusbericht generieren
```

**Bei Budget-Erschoepfung:**

```
FEHLERBUDGET ERSCHOEPFT — PAUSIERE

Abgeschlossene Arbeit:
  - Unteraufgabe 1: Konfigurationsdateien lesen (ERFOLG)
  - Unteraufgabe 2: Nach veralteten Mustern suchen (ERFOLG)

Unvollstaendige Arbeit:
  - Unteraufgabe 3: Testpakete ausfuehren (FEHLGESCHLAGEN — Bash Schaltkreis OPEN)
  - Unteraufgabe 4: Dokumentation aktualisieren (NICHT VERSUCHT — pausiert)
  - Unteraufgabe 5: In Staging deployen (NICHT VERSUCHT — pausiert)

Tool-Gesundheit:
  Grep: CLOSED (gesund)
  Read: CLOSED (gesund)
  Edit: CLOSED (gesund)
  Bash: OPEN (3 aufeinanderfolgende Fehler — Berechtigung/Befehl/Timeout)
  WebSearch: OPEN (1 Fehler — Verbindung abgelehnt)

Fehler: 5 / 5 Budget verbraucht

Empfehlung:
  1. Bash-Fehler untersuchen — wahrscheinlich Umgebungsproblem
  2. Netzwerkkonnektivitaet fuer WebSearch pruefen
  3. Aufgabe nach Behebung von Unteraufgabe 4 fortsetzen
```

Die Pause-und-Bericht-Funktion erfuellt dieselbe Funktion wie ein Sicherungsautomat in elektrischen Systemen: Sie verhindert die Anhaefung von Schaeden. Ein Agent, der weiterhin kaputte Tools aufruft, verschwendet Kontextfenster, verwirrt den Nutzer mit wiederholten Fehlern und kann inkonsistente Teilergebnisse produzieren.

**Erwartet:** Der Agent stoppt sauber, wenn das Fehlerbudget erschoepft ist. Der Bericht umfasst abgeschlossene Arbeit, unvollstaendige Arbeit, Tool-Gesundheit und handlungsrelevante naechste Schritte.

**Bei Fehler:** Wenn der Agent keinen sauberen Bericht generieren kann (z. B. Zustandstracking ging verloren), alle verfuegbaren Informationen ausgeben. Ein partieller Bericht ist besser als stille Fortsetzung.

### Schritt 8: Trennung von Belangen — Expeditor vs. Ausfuehrender

Pruefen, dass die Orchestrierungslogik (Schritte 2–7) sauber von der Tool-Ausfuehrung getrennt ist.

**Was der Expeditor (Orchestrierung) tut:**
- Tool-Gesundheitszustand tracken
- Entscheiden, ob ein Tool aufgerufen, uebersprungen oder sondiert werden soll
- Bei offenem Schaltkreis zu Alternativen routen
- Fehlerbudget durchsetzen
- Statusberichte generieren

**Was der Expeditor NICHT tut:**
- Fehlgeschlagene Tool-Aufrufe sofort wiederholen
- Tool-Aufruf-Parameter anpassen, um Fehler zu umgehen
- Tool-Fehler abfangen und unterdruecken
- Annahmen treffen, warum ein Tool fehlgeschlagen ist
- Fallback-Logik ausfuehren, die selbst Tools benoetigt

Wenn der Expeditor "kocht" (Tool-Aufrufe macht, um andere Tool-Fehler zu umgehen), ist die Trennung gebrochen. Der Expeditor sollte zu einem alternativen Tool routen oder den Umfang reduzieren — nicht versuchen, das defekte Tool zu reparieren.

**Erwartet:** Eine klare Grenze zwischen Orchestrierungsentscheidungen und Tool-Ausfuehrung. Die Expeditor-Schicht kann beschrieben werden ohne auf spezifische Tool-APIs oder Fehlertypen zu verweisen.

**Bei Fehler:** Wenn Orchestrierung und Ausfuehrung verflochten sind, durch Extrahieren der Entscheidungslogik in einen separaten Schritt refaktorieren, der vor jedem Tool-Aufruf laeuft. Der Entscheidungsschritt produziert eine von vier Ausgaben: AUFRUFEN, UEBERSPRINGEN, SONDIEREN oder PAUSIEREN. Der Ausfuehrungsschritt handelt auf diese Ausgabe.

### Schritt 9: Kaskadende Fehler erkennen

Wenn mehrere Tools Infrastruktur teilen (Netzwerk, Dateisystem, Berechtigungen), kann eine einzelne Ursache mehrere Sicherungsautomaten gleichzeitig ausloesen. Dieses korrelierte Muster erkennen und behandeln statt jeden Sicherungsautomaten unabhaengig zu behandeln.

**Indikatoren fuer kaskadende Fehler:**

- 3+ Tools wechseln im selben Aufgabenschritt oder in einem engen Fenster zu OPEN
- Fehler teilen eine gemeinsame Fehlersignatur (z. B. "Verbindung abgelehnt", "Berechtigung verweigert")
- Tools, die zuvor unabhaengige Fehlerverlaeufe hatten, schlagen ploetzlich zusammen fehl

**Antwortprotokoll:**

1. Wenn ein zweiter Sicherungsautomat oeffnet, pruefen ob die Fehlerkategorie mit dem ersten uebereinstimmt
2. Wenn korreliert: als **systemischen Fehler** markieren — alle Tool-Aufrufe pausieren, nicht nur die defekten
3. Die vermutete Ursache berichten: "Mehrere Tools schlagen mit [gemeinsamem Muster] fehl — wahrscheinlich [Netzwerk-/Dateisystem-/Berechtigungs-]Problem"
4. Half-Open-Tools waehrend eines systemischen Fehlers nicht sondieren — Sonden werden ebenfalls scheitern und Budget verschwenden
5. Sondierung erst nach Bestaetigung durch den Nutzer, dass das Infrastrukturproblem behoben ist, wieder aufnehmen

**Backoff-Compounding:** Bei kaskadierenden Fehlern exponentielle Verzoegerung fuer Half-Open-Sonden verwenden: bei Schritt 3 sondieren, dann Schritt 6, dann Schritt 12. Maximales Intervall bei 20 Schritten kappen, um permanente Schaltkreissperrung zu verhindern. Das verhindert, dass schnelle Sonden ein sich erholendes System ueberstrapazieren.

**Erwartet:** Korrelierte Fehler werden als einzelnes systemisches Ereignis erkannt und behandelt statt als N unabhaengige Sicherungsautomaten-Ausloesungen. Das Fehlerbudget zaehlt das systemische Ereignis einmal, nicht N-mal.

**Bei Fehler:** Wenn Korrelationserkennung nicht praktikabel ist (Fehler haben unterschiedliche Fehlersignaturen trotz gemeinsamer Ursache), auf unabhaengige Einzel-Tool-Sicherungsautomaten zurueckfallen. Das System degradiert weiterhin graceful — es verbraucht das Budget nur schneller.

### Schritt 10: Pre-Call-Tool-Auswahlschicht

Bevor die Circuit-Breaker-Schleife (Schritt 3) eingesetzt wird, optional pruefen, ob ein Tool verfuegbar ist und wahrscheinlich erfolgreich sein wird. Das reduziert unnoetige Sicherungsautomaten-Ausloesungen durch vorhersehbare Fehler.

**Pre-Call-Pruefungen:**

| Pruefung | Methode | Aktion bei Fehler |
|----------|--------|-----------------|
| Tool existiert | Pruefen ob Tool in allowed-tools-Liste ist | Ueberspringen — nicht mal versuchen |
| MCP-Server-Gesundheit | Server-Prozess/Verbindungsstatus pruefen | Sofort zu Alternative routen |
| Ressourcenverfuegbarkeit | Pruefen ob Zieldatei/URL/Endpunkt existiert | Routen oder Umfang reduzieren |

**Entscheidungstabelle:**

```
Pre-Call-Bewertung:
  VERFUEGBAR   → mit Circuit-Breaker-Schleife fortfahren (Schritt 3)
  DEGRADIERT   → mit Vorsicht fortfahren, Fehlerschwelle um 1 verringern
  NICHT VERFUEGBAR → Tool ueberspringen, zu Alternative routen (Schritt 4) ohne Budget zu verbrauchen
```

Pre-Call-Pruefungen sind beratend, nicht massgeblich. Ein Tool, das Pre-Call-Pruefungen besteht, kann waehrend der Ausfuehrung immer noch fehlschlagen. Der Circuit Breaker bleibt der primaere Zuverlaessigkeitsmechanismus.

**Erwartet:** Vorhersehbare Fehler (fehlende Tools, nicht erreichbare Server) werden abgefangen, bevor sie das Fehlerbudget verbrauchen. Der Circuit Breaker behandelt nur echte Laufzeitfehler.

**Bei Fehler:** Wenn Pre-Call-Pruefungen nicht verfuegbar sind oder zu viel Overhead hinzufuegen, diesen Schritt vollstaendig ueberspringen. Die Circuit-Breaker-Schleife in Schritt 3 behandelt alle Fehler — Pre-Call-Auswahl ist eine Optimierung, kein Erfordernis.

## Validierung

- [ ] Faehigkeitskarte deckt alle Tools mit dokumentierten Alternativen und Fallbacks ab
- [ ] Circuit-Breaker-Zustandstabelle ist fuer alle Tools initialisiert
- [ ] Zustandsuebergaenge folgen dem CLOSED -> OPEN -> HALF-OPEN -> CLOSED-Zyklus
- [ ] Fehlerschwelle ist explizit deklariert (nicht implizit)
- [ ] Alternatives-Routing wird vor Umfangsreduzierung versucht
- [ ] Umfangsreduzierung ist mit zurueckgestellten Unteraufgaben und Gruenden dokumentiert
- [ ] Veraltete Daten sind explizit gekennzeichnet — nie als aktuell praesentiert
- [ ] Fehlerbudget wird mit Pause-und-Bericht bei Erschoepfung durchgesetzt
- [ ] Expeditor-Logik fuehrt keine Tool-Aufrufe aus oder wiederholt fehlgeschlagene Aufrufe
- [ ] Statusbericht enthaelt abgeschlossene Arbeit, unvollstaendige Arbeit und Tool-Gesundheit
- [ ] Keine stillen Fehler — jedes Ueberspringen, jede Zurueckstellung und Degradierung ist dokumentiert
- [ ] Kaskadende Fehler werden erkannt, wenn 3+ Tools gleichzeitig oeffnen
- [ ] Systemischer Fehlermodus pausiert alle Sonden bis Infrastruktur als erholt bestaetigt
- [ ] Pre-Call-Pruefungen (falls verwendet) verbrauchen kein Fehlerbudget bei vorhersehbaren Fehlern

## Haeufige Stolperfallen

- **Wiederholen statt Circuit-Breaken**: Ein defektes Tool wiederholt aufrufen verschwendet das Fehlerbudget und das Kontextfenster. Drei aufeinanderfolgende Fehler sind ein Muster, kein Pech. Den Schaltkreis oeffnen.
- **Im Expeditor kochen**: Die Orchestrierungsschicht sollte entscheiden *was* versucht werden soll, nicht *wie* defekte Tools repariert werden. Wenn der Expeditor Workaround-Befehle fuer Bash-Fehler erstellt, hat er die Trennungsgrenze ueberschritten.
- **Stille Umfangsreduzierung**: Unteraufgaben weglassen ohne sie zu dokumentieren produziert Ergebnisse, die vollstaendig aussehen aber es nicht sind. Immer berichten, was uebersprungen wurde.
- **Veraltete Daten als aktuell behandeln**: Gecachte oder zuvor abgerufene Ergebnisse spiegeln moeglicherweise nicht den aktuellen Zustand wider. Unsicherheit kennzeichnen statt sie zu ignorieren.
- **Schaltkreise zu schnell oeffnen**: Ein einzelner vorueberhgehender Fehler sollte den Schaltkreis nicht oeffnen. Eine Schwelle (Standard: 3) verwenden, um Rauschen von Signal zu trennen.
- **Nach dem Oeffnen nie sondieren**: Ein dauerhaft offener Schaltkreis bedeutet, dass der Agent nie entdeckt, dass sich ein Tool erholt hat. Half-Open-Sonden sind fuer die Erholung unerlasslich.
- **Fehlerbudget ignorieren**: Ohne Budget kann ein Agent Dutzende von Fehlern ueber verschiedene Tools anhaeufen, waehrend er auf dem Papier noch "Fortschritt macht". Das Budget erzwingt einen ehrlichen Pruefpunkt.
- **Kaskadierendes Backoff-Multiplizieren**: Wenn mehrere Tools in einer Abhaengigkeitskette jeweils ihren eigenen exponentiellen Backoff anwenden, waechst die Gesamtverzoegerung multiplikativ. Gesamtkumulative Verzoegerung ueber die Kette kappen, nicht nur pro Tool.
- **Veraltete Entdeckungs-Scores**: Pre-Call-Auswahl (Schritt 10) cached Tool-Verfuegbarkeitsbewertungen. Wenn der Cache nicht invalidiert wird, wenn sich Bedingungen aendern, koennte der Agent ein erhol-tes Tool ueberspringen oder ein nicht verfuegbares versuchen. Scores nach jedem systemischen Fehlerereignis neu pruefen.

## Verwandte Skills

- `fail-early-pattern` — komplementaeres Muster: fail-early validiert Eingaben vor Arbeitsbeginn; circuit-breaker verwaltet Fehler waehrend der Arbeit
- `escalate-issues` — wenn das Fehlerbudget erschoepft oder die Umfangsreduzierung erheblich ist, an einen Spezialisten oder Menschen eskalieren
- `write-incident-runbook` — wiederkehrende Tool-Ausfall-Muster als Runbooks fuer schnellere Diagnose dokumentieren
- `assess-context` — bewerten ob der aktuelle Ansatz angepasst werden kann, wenn mehrere Tools degradiert sind; paart mit Umfangsreduzierungsentscheidungen
- `du-dum` — Zweig-Uhr-Architektur trennt Beobachtung von Entscheidung; komplementaeres Muster zur Reduzierung der Beobachtungskosten in Agentschleifen
