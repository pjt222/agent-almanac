---
name: du-dum
description: >
  Separate expensive observation from cheap decision-making in autonomous agent
  loops using a two-clock architecture. A fast clock accumulates data into a
  digest file; a slow clock reads the digest and acts only when something is
  pending. Idle cycles cost nothing because the action clock returns immediately
  after reading an empty digest. Use when building autonomous agents that must
  observe continuously but can only afford to act occasionally, when API or LLM
  costs dominate and most cycles have nothing to do, when designing cron-based
  agent architectures with observation and action phases, or when an existing
  heartbeat loop is too expensive because it calls the LLM on every tick.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: autonomous-agents, cost-optimization, two-clock, digest, heartbeat, batch-then-act, cron
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Du-Dum: Batch-Then-Act-Muster

Beobachtung von Aktion mit zwei Uhren trennen die mit unterschiedlichen Frequenzen laufen. Die schnelle Uhr (Analyse) sammelt Daten guenstig und schreibt einen kompakten Digest. Die langsame Uhr (Aktion) liest den Digest und entscheidet ob zu handeln ist. Wenn der Digest sagt dass nichts ansteht, beendet die Aktions-Uhr sofort -- null Kosten fuer Idle-Zyklen.

Der Name kommt vom Herzschlag-Rhythmus: du-dum, du-dum. Der erste Schlag (du) beobachtet; der zweite Schlag (dum) handelt. Meistens feuert nur der erste Schlag.

## Wann verwenden

- Bauen autonomer Agents die mit Budget laufen und oefter beobachten als handeln muessen
- Eine bestehende Heartbeat-Loop ruft die LLM bei jedem Tick auf, auch wenn sich nichts geaendert hat
- Beobachtung ist guenstig (API-Reads, Datei-Parsing, Log-Scanning) aber Aktion ist teuer (LLM-Calls, Schreib-Operationen, Benachrichtigungen)
- Entkoppeltes Versagen noetig: wenn Beobachtung scheitert, sollte der letzte gute Digest fuer die Aktions-Uhr noch gueltig sein
- Entwerfen cron-basierter Agent-Architekturen wo Analyse und Aktion als separate Jobs laufen

## Eingaben

- **Erforderlich**: Liste von Datenquellen die die schnelle Uhr beobachten soll (APIs, Dateien, Logs, Feeds)
- **Erforderlich**: Aktion die die langsame Uhr nehmen soll wenn der Digest anstehende Arbeit anzeigt
- **Optional**: Schnelles-Uhr-Intervall (Standard: alle 4 Stunden)
- **Optional**: Langsames-Uhr-Intervall (Standard: einmal pro Tag)
- **Optional**: Kostenobergrenze pro Tag (zur Validierung der Uhr-Konfiguration)
- **Optional**: Digest-Format-Praeferenz (Markdown, JSON, YAML)

## Vorgehensweise

### Schritt 1: Die zwei Uhren identifizieren

Alle Arbeit in Beobachtung (guenstig, haeufig) und Aktion (teuer, selten) trennen.

1. Jede Operation in der aktuellen Loop oder geplantem Workflow auflisten
2. Jede als Beobachtung (liest Daten, produziert Zusammenfassung) oder Aktion (ruft LLM auf, schreibt Ausgabe, sendet Nachrichten) klassifizieren
3. Die Aufteilung verifizieren: Beobachtungen sollten null oder nahe-null marginale Kosten haben; Aktionen sollten die teuren Operationen sein
4. Frequenzen zuweisen: die schnelle Uhr laeuft oft genug um Ereignisse zu erfassen; die langsame Uhr laeuft oft genug um Antwortzeit-Anforderungen zu erfuellen

| Uhr | Kosten-Profil | Frequenz | Beispiel |
|-----|---------------|----------|----------|
| Schnell (Analyse) | Guenstig: API-Reads, Datei-Parsing, kein LLM | 4-6x/Tag | GitHub-Notifications scannen, RSS parsen, Logs lesen |
| Langsam (Aktion) | Teuer: LLM-Inferenz, Schreib-Operationen | 1x/Tag | Antwort komponieren, Dashboard aktualisieren, Alarme senden |

**Erwartet:** Eine klare Zwei-Spalten-Aufteilung wo jede Operation genau einer Uhr zugewiesen ist. Die schnelle Uhr hat keine LLM-Calls; die langsame Uhr hat keine Datensammlung.

**Bei Fehler:** Wenn eine Operation sowohl Lesen als auch LLM-Inferenz braucht (z.B. "neue Issues zusammenfassen"), aufteilen: die schnelle Uhr sammelt die rohen Issues in den Digest; die langsame Uhr fasst sie zusammen. Der Digest ist die Grenze.

### Schritt 2: Das Digest-Format entwerfen

Der Digest ist die Low-Bandwidth-Botschaft die die zwei Uhren ueberbrueckt. Er muss kompakt, menschlich lesbar und maschinen-parsebar sein.

1. Den Digest-Dateipfad und das Format definieren (Markdown empfohlen fuer menschliches Debugging)
2. Einen Header mit Zeitstempel und Quell-Metadaten einschliessen
3. Einen "pending"-Abschnitt definieren der Eintraege auflistet die Aktion erfordern
4. Einen "status"-Abschnitt mit aktuellem Zustand definieren (fuer Dashboards oder Logging)
5. Einen klaren Leerzustands-Indikator einschliessen (z.B. `pending: none` oder leerer Abschnitt)

Beispiel-Digest-Struktur:

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

- PR #42 needs review response (opened 2h ago, author requested feedback)
- Issue #99 has new comment from maintainer (action: reply)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 14
- Items pending: 2
```

Wenn nichts ansteht:

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

(none)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 8
- Items pending: 0
```

**Erwartet:** Ein Digest-Template mit klaren Pending-/Leer-Zustaenden. Die Aktions-Uhr kann durch Pruefen eines einzelnen Feldes oder Abschnitts entscheiden ob fortzufahren ist.

**Bei Fehler:** Wenn der Digest zu gross wird (>50 Zeilen), enthaelt die schnelle Uhr zu viele Rohdaten. Details in eine separate Datendatei verschieben und den Digest als Zusammenfassung mit Zeigern halten.

### Schritt 3: Die schnelle Uhr (Analyse) implementieren

Die Beobachtungs-Skripte bauen die nach dem schnellen Schedule laufen.

1. Ein Skript pro Datenquelle erstellen (haelt Versagen unabhaengig)
2. Jedes Skript liest seine Quelle, extrahiert relevante Ereignisse und haengt an oder schreibt den Digest neu
3. File-Locking oder atomare Writes nutzen um partielle Digests zu verhindern
4. Den Analyse-Lauf (Zeitstempel, gefundene Eintraege, Fehler) in eine separate Log-Datei loggen
5. Niemals die LLM aufrufen oder Schreib-Operationen jenseits der Digest-Aktualisierung durchfuehren

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

Schedule-Beispiel (cron):
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

**Erwartet:** Ein oder mehrere Analyse-Skripte, jedes produziert oder aktualisiert die Digest-Datei. Skripte laufen unabhaengig -- wenn eines scheitert, aktualisieren die anderen weiterhin ihre Abschnitte.

**Bei Fehler:** Wenn eine Datenquelle vorruebergehend nicht verfuegbar ist, sollte das Skript den Fehler loggen und die vorigen Digest-Eintraege intakt lassen. Den Digest nicht bei Quell-Versagen leeren -- veraltete Daten sind besser als fehlende Daten fuer die Aktions-Uhr.

### Schritt 4: Die langsame Uhr (Aktion) implementieren

Das Aktions-Skript bauen das den Digest liest und entscheidet ob zu handeln ist.

1. Die Digest-Datei lesen (Schritt 0 jedes Aktions-Zyklus)
2. Den Pending-Abschnitt pruefen: wenn leer oder "none", sofort mit Log-Eintrag beenden
3. Wenn Eintraege anstehen, die teure Operation aufrufen (LLM-Call, Nachrichten-Komposition, etc.)
4. Nach dem Handeln die verarbeiteten Digest-Eintraege loeschen oder archivieren
5. Den Aktions-Lauf (verarbeitete Eintraege, Kosten, Dauer) loggen

```
# Pseudocode: heartbeat.sh (the slow clock)
digest = read_file(digest_path)

if digest.pending is empty:
    log("heartbeat: nothing pending, exiting")
    exit(0)

# Only reaches here if work exists
response = call_llm(digest.pending, system_prompt)
execute_actions(response)
archive_digest(digest_path)
log("heartbeat: processed {count} items, cost: {tokens} tokens")
```

Schedule-Beispiel (cron):
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

**Erwartet:** Das Aktions-Skript beendet in unter 1 Sekunde bei Idle-Zyklen (nur ein Datei-Read und Leer-Check). Bei aktiven Zyklen verarbeitet es anstehende Eintraege und loescht den Digest.

**Bei Fehler:** Wenn der LLM-Call scheitert, den Digest nicht loeschen. Die anstehenden Eintraege bleiben fuer den naechsten Aktions-Zyklus. Implementation eines Retry-Counters im Digest in Erwaegung ziehen um unendliche Retries auf permanent scheiternden Eintraegen zu vermeiden.

### Schritt 5: Idle-Detection konfigurieren

Die Kostenersparnisse kommen von Idle-Detection -- die Aktions-Uhr muss zuverlaessig "nichts zu tun" von "etwas zu tun" mit minimalem Overhead unterscheiden.

1. Den Idle-Check als einzelne, schnelle Operation definieren (Datei-Read + String-Check)
2. Verifizieren dass der Idle-Pfad null externe Calls hat (kein API, kein LLM, kein Netzwerk)
3. Die Idle-Pfad-Dauer messen -- sie sollte unter 1 Sekunde liegen
4. Idle-Zyklen anders als aktive Zyklen fuer Monitoring loggen

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

**Erwartet:** Der Idle-Pfad ist ein einzelner Datei-Read gefolgt von einem String-Match. Keine Netzwerk-Calls, kein Prozess-Spawning ueber das Skript selbst hinaus.

**Bei Fehler:** Wenn der Idle-Check unzuverlaessig ist (False Positives die verpasste Arbeit verursachen oder False Negatives die unnoetige LLM-Calls verursachen), das Digest-Format vereinfachen. Ein einzelnes Boolean-Feld (`has_pending: true/false`) am Anfang der Datei ist der zuverlaessigste Ansatz.

### Schritt 6: Das Kostenmodell validieren

Die erwarteten Kosten berechnen um zu bestaetigen dass die Zwei-Uhren-Architektur Einsparungen liefert.

1. Schnelle-Uhr-Laeufe pro Tag zaehlen: `fast_runs = 24 / fast_interval_hours`
2. Langsame-Uhr-Laeufe pro Tag zaehlen: typischerweise 1
3. Beobachtungs-Kosten berechnen: `fast_runs * cost_per_analysis_run` (sollte ~$0 sein wenn kein LLM)
4. Aktions-Kosten berechnen: `active_days_fraction * cost_per_action_run`
5. Idle-Kosten berechnen: `(1 - active_days_fraction) * cost_per_idle_check` (sollte ~$0 sein)
6. Mit den Original-Single-Loop-Kosten vergleichen

Beispiel-Kostenvergleich:

| Architektur | Tageskosten (aktiv) | Tageskosten (idle) | Monatskosten (80% idle) |
|-------------|--------------------|--------------------|-----------------------|
| Single-Loop (LLM alle 30min) | $13,74/37h | $13,74/37h | ~$400 |
| Du-dum (6 Analysen + 1 Aktion) | $0,30 | $0,00 | ~$6 |

**Erwartet:** Ein Kostenmodell das zeigt dass die du-dum-Architektur mindestens 10x guenstiger als das Original an Idle-Tagen ist.

**Bei Fehler:** Wenn das Kostenmodell keine signifikanten Einsparungen zeigt, ist eines davon wahrscheinlich wahr: (a) die schnelle Uhr ist zu haeufig, (b) die schnelle Uhr enthaelt versteckte LLM-Calls oder (c) das System ist selten idle. Du-dum profitiert Systeme mit hohen Idle-Anteilen. Wenn das System immer aktiv ist, koennte ein einfacherer Polling-Ansatz angemessener sein.

## Validierung

- [ ] Schnelle und langsame Uhren sind sauber getrennt ohne LLM-Calls im schnellen Pfad
- [ ] Digest-Format hat einen klaren Leerzustands-Indikator
- [ ] Idle-Detection beendet in unter 1 Sekunde mit null externen Calls
- [ ] Schnelle-Uhr-Versagen korrumpiert den Digest nicht (veraltete Daten erhalten)
- [ ] Langsame-Uhr-Versagen loescht anstehende Eintraege nicht (Retry beim naechsten Zyklus)
- [ ] Kostenmodell zeigt mindestens 10x Einsparungen an Idle-Tagen vs. Single-Loop-Architektur
- [ ] Beide Uhren loggen ihre Laeufe fuer Monitoring und Debugging
- [ ] Digest waechst nicht unbegrenzt (alte Eintraege archiviert oder geloescht nach Verarbeitung)

## Haeufige Stolperfallen

- **Digest waechst unbegrenzt**: Wenn die schnelle Uhr anhaengt aber die langsame Uhr nie loescht, wird der Digest zu einem wachsenden Log. Verarbeitete Eintraege immer loeschen oder archivieren nachdem der Aktions-Zyklus abgeschlossen ist.
- **Schnelle Uhr zu schnell**: Analyse alle 5 Minuten zu fahren wenn Ereignisse taeglich ankommen verschwendet API-Quota und Disk-I/O. Die Schnelle-Uhr-Frequenz an die tatsaechliche Ereignis-Rate der Datenquellen anpassen.
- **Langsame Uhr zu langsam**: Wenn das Aktions-Fenster einmal pro Tag ist aber Ereignisse Selbe-Stunde-Antwort brauchen, ist die langsame Uhr zu langsam. Ihre Frequenz erhoehen oder einen Urgent-Event-Shortcut hinzufuegen der sofortige Aktion ausloest.
- **LLM-Calls in der schnellen Uhr**: Das gesamte Kostenmodell bricht wenn die schnelle Uhr LLM-Inferenz enthaelt. Jedes Schnelle-Uhr-Skript auditieren um null LLM-Calls zu bestaetigen. Wenn Zusammenfassung noetig ist, sie auf die langsame Uhr verschieben.
- **Schnelle-Uhr-Skripte koppeln**: Wenn ein Analyse-Skript von der Ausgabe eines anderen abhaengt, kaskadiert ein Versagen im ersten. Schnelle-Uhr-Skripte unabhaengig halten -- jedes liest seine eigene Quelle und schreibt seinen eigenen Digest-Abschnitt.
- **Stilles Idle-Logging**: Wenn Idle-Zyklen keine Log-Ausgabe produzieren, kann "laufend und idle" nicht von "abgestuerzt und nicht laufend" unterschieden werden. Idle-Zyklen immer loggen, selbst wenn nur ein Zeitstempel.
- **Digest bei Analyse-Versagen loeschen**: Wenn eine Datenquelle ausgefallen ist, keinen leeren Digest schreiben. Die langsame Uhr wuerde "nichts ansteht" sehen und Arbeit ueberspringen die tatsaechlich ansteht. Den letzten guten Digest bei Versagen erhalten.

## Verwandte Skills

- `manage-token-budget` -- Kostenkontroll-Framework das du-dum praktisch macht; du-dum ist das Architekturmuster, Token-Budget ist die Buchhaltungsschicht
- `circuit-breaker-pattern` -- behandelt den Versagensfall (Tools brechen); du-dum behandelt den Normalfall (nichts zu tun). Zusammen nutzen: du-dum fuer Idle-Detection, Circuit-Breaker fuer Versagens-Recovery
- `observe` -- Beobachtungs-Methodologie fuer die schnelle Uhr; du-dum strukturiert wann und wie Beobachtungen handlungsfaehig werden via den Digest
- `forage-resources` -- strategische Erkundungs-Schicht; du-dum ist der Ausfuehrungs-Rhythmus innerhalb dessen forage-resources operiert
- `coordinate-reasoning` -- stigmergische Signal-Muster; die Digest-Datei ist eine Form von Stigmergie (indirekte Koordination durch Umweltartefakte)
