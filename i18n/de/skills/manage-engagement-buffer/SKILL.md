---
name: manage-engagement-buffer
description: >
  Manage an engagement buffer that ingests, prioritizes, rate-limits,
  deduplicates, and tracks state for incoming engagement items across
  platforms. Generates periodic digests and enforces cooldown periods.
  Composes with du-dum: du-dum sets the observation/action cadence,
  this skill manages the queue between beats.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: engagement, buffer, queue, rate-limiting, deduplication, digest, cooldown, autonomous-agents
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Engagement-Buffer verwalten

Eingehende Engagement-Items ueber Plattformen hinweg aufnehmen, deduplizieren, priorisieren und ratenbegrenzen, dann einen kompakten Digest an die Aktions-Uhr uebergeben. Der Buffer sitzt zwischen rohen Plattform-Signalen und absichtlicher Aktion: er absorbiert Schuebe, fusioniert Duplikate, erzwingt Cooldowns und stellt sicher dass der Agent zuerst auf die wertvollsten Items handelt. Ohne Buffer verarbeitet ein autonomer Agent entweder Items in Ankunftsreihenfolge (verfehlt dringliche die im Rauschen vergraben sind) oder versucht alles auf einmal (trifft Rate-Limits und erscheint spammig).

Dieser Skill komponiert mit `du-dum`: du-dum entscheidet *wann* zu beobachten und zu handeln; dieser Skill entscheidet *was* Aktion verdient. Der Buffer ist die Queue die zwischen du-dums Schlaegen akkumuliert.

## Wann verwenden

- Ein autonomer Agent erhaelt mehr Engagement als er pro Zyklus verarbeiten kann
- Doppelte oder beinahe-doppelte Items verschwenden das Aktionsbudget
- Engagement braucht Prioritaets-Reihenfolge bevor die Aktions-Uhr feuert
- Cooldown-Perioden noetig um Ueber-Engagement oder Rate-Limiting zu verhindern
- Mehrere Plattform-Quellen (GitHub, Slack, E-Mail) speisen in eine einzelne Agent-Aktions-Loop

## Eingaben

- **Erforderlich**: `buffer_path` — Pfad zur JSONL-Buffer-Datei
- **Optional**: `platform_config` — Pro-Plattform-Rate-Limits und Cooldown-Einstellungen
- **Optional**: `digest_size` — Anzahl Top-Items im Digest (Standard: 5)
- **Optional**: `ttl_hours` — Time-to-Live fuer ungehandelte Items (Standard: 48)
- **Optional**: `cooldown_minutes` — Per-Thread-Cooldown nach Aktion (Standard: 60)

## Vorgehensweise

### Schritt 1: Buffer-Schema definieren

Die Engagement-Item-Struktur entwerfen. Jedes Item im Buffer ist eine einzelne JSON-Zeile mit diesen Feldern:

```json
{
  "id": "gh-notif-20260408-001",
  "source": "github:pjt222/agent-almanac",
  "timestamp": "2026-04-08T09:15:00Z",
  "content_summary": "PR #218 review requested by contributor",
  "priority": 4,
  "state": "new",
  "dedup_key": "github:pjt222/agent-almanac:pr-218:contributor-name",
  "thread_id": "pr-218",
  "ttl_hours": 48
}
```

Feld-Definitionen:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Einzigartiger Identifikator (Quell-Praefix + Datum + Sequenz) |
| `source` | string | Plattform und Kanal (`github:repo`, `slack:channel`, `email:inbox`) |
| `timestamp` | ISO 8601 | Wann das Item aufgenommen wurde |
| `content_summary` | string | Einzeilige Beschreibung des Engagement-Items |
| `priority` | int 1-5 | Composite-Prioritaet (siehe Schritt 4) |
| `state` | enum | `new`, `acknowledged`, `acted`, `cooldown`, `merged`, `expired` |
| `dedup_key` | string | Composite-Schluessel: source + thread + author |
| `thread_id` | string | Konversations-Thread-Identifikator fuer Cooldown-Tracking |
| `ttl_hours` | int | Stunden bis Item ablaeuft wenn ungehandelt (Standard: 48) |

Als JSON-Lines-Datei speichern (ein JSON-Objekt pro Zeile). Dieses Format unterstuetzt Append-Only-Writes, Line-by-Line-Verarbeitung und einfaches Pruning durch Neuschreiben ohne die abgelaufenen Zeilen.

**Erwartet:** Eine JSONL-Buffer-Datei initialisiert bei `buffer_path` mit dem Schema dokumentiert in einem Begleitkommentar oder Header. Das Schema ist stabil genug um alle nachgelagerten Schritte zu unterstuetzen.

**Bei Fehler:** Wenn die Buffer-Datei nicht erstellt werden kann (Berechtigungen, Pfad-Probleme), auf eine In-Memory-Liste fuer den aktuellen Zyklus zurueckfallen und den Dateisystem-Fehler loggen. Items nicht still fallen lassen — sie irgendwo buffern, auch temporaer.

### Schritt 2: Ingestion implementieren

Items von Plattform-Adaptern akzeptieren und an den Buffer mit initialen Prioritaets-Zuweisungen anhaengen.

Prioritaets-Zuweisung nach Item-Typ:

| Typ | Prioritaet | Begruendung |
|-----|------------|-------------|
| Direkter Mention (@agent) | 5 | Jemand hat explizit nach Aufmerksamkeit gefragt |
| Review-Anfrage | 4 | Blockiert die Arbeit eines anderen |
| Antwort in verfolgtem Thread | 3 | Aktive Konversation an der der Agent teilnimmt |
| Notification (zugewiesen, abonniert) | 2 | Informativ, kann Aktion erfordern |
| Broadcast (Release, Ankuendigung) | 1 | Nur Bewusstsein, selten umsetzbar |

Fuer jedes eingehende Item:

1. Das Item-JSON mit Feldern aus dem Schema konstruieren
2. Initiale Prioritaet basierend auf der Typ-Tabelle oben zuweisen
3. `state` auf `new` setzen
4. `timestamp` auf aktuelle UTC-Zeit setzen
5. `dedup_key` aus source + thread + author generieren
6. Die JSON-Zeile an die Buffer-Datei anhaengen

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

**Erwartet:** Neue Items erscheinen in der Buffer-Datei mit korrekten Prioritaeten und `state=new`. Jeder Adapter produziert wohlgeformte Items unabhaengig — Adapter-Versagen blockiert keine anderen Adapter.

**Bei Fehler:** Wenn ein Plattform-Adapter scheitert (Auth abgelaufen, Rate-limited, Netzwerk down), das Versagen loggen und diese Quelle fuer diesen Zyklus ueberspringen. Existierende Buffer-Items nicht loeschen — veraltete Items aus einem vorigen erfolgreichen Fetch sind besser als ein leerer Buffer.

### Schritt 3: Deduplizieren

Den Buffer nach Items mit demselben `dedup_key` innerhalb eines konfigurierbaren Fensters scannen (Standard: 24 Stunden). Die hoechste-Prioritaet-Instanz behalten und andere als merged markieren.

1. Items nach `dedup_key` gruppieren
2. Innerhalb jeder Gruppe nach Prioritaet absteigend, dann Zeitstempel absteigend sortieren
3. Das erste Item behalten (hoechste Prioritaet, neueste); den Rest als `state=merged` markieren
4. Thread-Schuebe erkennen: derselbe `thread_id` mit unterschiedlichen Autoren innerhalb 1 Stunde indiziert einen Aktivitaets-Schub — in ein einzelnes Item mit angehaengter Teilnehmer-Anzahl an `content_summary` konsolidieren

```
# Dedup logic
groups = group_by(buffer, "dedup_key", window_hours=24)
for key, items in groups:
    if len(items) > 1:
        keeper = max(items, key=lambda i: (i.priority, i.timestamp))
        for item in items:
            if item.id != keeper.id:
                item.state = "merged"

# Thread burst detection
thread_groups = group_by(buffer, "thread_id", window_hours=1)
for thread_id, items in thread_groups:
    active_items = [i for i in items if i.state == "new"]
    if len(active_items) >= 3:
        keeper = max(active_items, key=lambda i: i.priority)
        keeper.content_summary += f" ({len(active_items)} participants)"
        for item in active_items:
            if item.id != keeper.id:
                item.state = "merged"
```

**Erwartet:** Der Buffer enthaelt keine doppelten `dedup_key`-Eintraege innerhalb des Fensters. Thread-Schuebe sind in einzelne Items mit Teilnehmer-Anzahlen kollabiert. Die merged Items bleiben in der Datei (fuer Audit) aber sind von nachgelagerter Verarbeitung ausgeschlossen.

**Bei Fehler:** Wenn Deduplizierung unerwartete Merges produziert (legitime distinkte Items teilen einen Schluessel), das Dedup-Fenster verengen oder die Schluessel-Konstruktion verfeinern. Einen Content-Hash zum Dedup-Schluessel hinzuzufuegen kann Items unterscheiden die source + thread + author teilen aber genuein unterschiedlichen Inhalt haben.

### Schritt 4: Priorisieren

Den Buffer nach Composite-Score neu sortieren der Recency-Decay und Eskalation einbezieht.

Composite-Score-Formel:

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

Verhalten:

- Ein Prioritaet-3-Item vor 0 Stunden aufgenommen: `3 * 1,0 * 1,0 = 3,0`
- Ein Prioritaet-3-Item vor 8 Stunden aufgenommen: `3 * 0,43 * 1,0 = 1,29` (zerfallen unter Prioritaet-2-Items)
- Ein Prioritaet-2-Item zweimal neu eingereicht: `2 * 1,0 * 1,4 = 2,8` (eskaliert nahe Prioritaet-3)

Alle `state=new`-Items nach `effective_priority` absteigend sortieren. Diese sortierte Reihenfolge ist was der Digest (Schritt 6) du-dum praesentiert.

**Erwartet:** Der Buffer ist nach Composite-Score sortiert. Frische hoch-prioritaere Items sind oben. Alte Items sind zerfallen. Neu eingereichte Items sind eskaliert. Kein Item ueberschreitet Prioritaet 5.

**Bei Fehler:** Wenn die Scoring-Formel unintuitive Rangordnungen produziert (z.B. ein 1-Stunden-altes Prioritaet-2-Item rangiert ueber einem frischen Prioritaet-3-Item), die Decay-Rate anpassen. Ein Decay von 0,95 pro Stunde ist sanfter; 0,85 pro Stunde ist aggressiver. Auf Engagement-Tempo abstimmen.

### Schritt 5: Rate-Limits und Cooldowns erzwingen

Verhindern dass der Agent ueber-engagiert durch Erzwingen von Pro-Plattform-Schreib-Limits und Per-Thread-Cooldowns.

**Pro-Plattform-Rate-Limits** (konfigurierbar via `platform_config`):

| Plattform | Default-Limit | Fenster |
|-----------|---------------|---------|
| GitHub-Kommentare | 1 pro 20 Sekunden | rolling |
| GitHub-Reviews | 3 pro Stunde | rolling |
| Slack-Nachrichten | 1 pro 10 Sekunden | rolling |
| E-Mail-Antworten | 5 pro Stunde | rolling |

**Per-Thread-Cooldown:** Nachdem der Agent auf einem Thread handelt, tritt dieser Thread fuer `cooldown_minutes` (Standard: 60) in Cooldown. Waehrend Cooldown werden neue Items fuer diesen Thread aufgenommen aber nicht im Digest gezeigt.

**Fehler-Backoff:** Beim Erhalten einer 429/Rate-Limit-Antwort von irgendeiner Plattform den Cooldown fuer diese Plattform verdoppeln. Auf Default zuruecksetzen nach erfolgreicher Aktion.

```
# Rate limit check before action
def can_act(platform, thread_id):
    if rate_limit_exceeded(platform):
        return False, "rate limited"
    if thread_in_cooldown(thread_id):
        return False, "thread cooldown active"
    return True, "clear"

# After action
def record_action(platform, thread_id):
    increment_rate_counter(platform)
    set_cooldown(thread_id, cooldown_minutes)

# After rate-limit error
def handle_rate_error(platform):
    current_cooldown = get_platform_cooldown(platform)
    set_platform_cooldown(platform, current_cooldown * 2)
```

**Erwartet:** Der Agent ueberschreitet Plattform-Rate-Limits nie. Threads haben erzwungene Cooldown-Perioden. Rate-Limit-Fehler triggern automatischen Backoff. Der Buffer akkumuliert Items waehrend Cooldown ohne sie zu verlieren.

**Bei Fehler:** Wenn Rate-Limits trotz Erzwingung getroffen werden (Clock-Skew, gleichzeitige Agents), die Sicherheits-Marge erhoehen — Limits auf 80% des tatsaechlichen Plattform-Limits setzen. Wenn Cooldowns zu aggressiv sind (verfehlen zeitkritische Threads), `cooldown_minutes` nur fuer hoch-prioritaere Threads reduzieren.

### Schritt 6: Digest erzeugen

Eine kompakte Zusammenfassung fuer du-dums Aktions-Schlag produzieren. Der Digest ist der Uebergabepunkt: du-dum liest dies, nicht den rohen Buffer.

Digest-Inhalte:

1. **Total pending**: Anzahl `state=new`-Items
2. **Top-N-Items**: die hoechst-prioritaeren Items (Standard N=5 aus `digest_size`)
3. **Bald ablaufend**: Items innerhalb 20% ihrer TTL
4. **Threads in Cooldown**: aktive Cooldowns mit verbleibender Zeit
5. **Buffer-Gesundheit**: Total-Items, Merged-Anzahl, Expired-Anzahl

```markdown
# Engagement Digest — 2026-04-08T12:00:00Z

## Pending: 12 items

### Top 5 by Priority
| # | Priority | Source | Summary | Age |
|---|----------|--------|---------|-----|
| 1 | 5.0 | github:pr-218 | Review requested by contributor | 2h |
| 2 | 4.2 | github:issue-99 | Maintainer question (escalated) | 6h |
| 3 | 3.0 | slack:dev | Build failure alert | 1h |
| 4 | 2.8 | github:pr-215 | CI check feedback (3 participants) | 3h |
| 5 | 2.1 | email:inbox | Collaboration inquiry | 8h |

### Expiring Soon
- github:issue-85 — 4h remaining (TTL 48h, ingested 44h ago)

### Cooldowns Active
- pr-210: 22 min remaining
- issue-92: 45 min remaining

### Buffer Health
- Total items: 47 | New: 12 | Merged: 18 | Acted: 11 | Expired: 6
```

Den Digest in einen bekannten Pfad schreiben (z.B. `buffer_path.digest.md`) den du-dums Aktions-Uhr liest.

**Erwartet:** Ein Digest unter 50 Zeilen den du-dum in einem Read parsen kann. Der Digest enthaelt genuegend Information um zu entscheiden worauf zu handeln, aber nicht den vollen Buffer. Wenn nichts ansteht, sagt der Digest das klar.

**Bei Fehler:** Wenn der Digest ueber 50 Zeilen waechst, `digest_size` reduzieren oder die Expiring-/Cooldown-Abschnitte aggressiver zusammenfassen. Der Digest ist eine Zusammenfassung — wenn er sich der Groesse des Buffers naehert, hat er seinen Zweck verloren.

### Schritt 7: State-Uebergaenge verfolgen

Nachdem du-dum Items aus dem Digest verarbeitet, ihre Zustaende aktualisieren und den Audit-Trail pflegen.

State-Machine:

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

Fuer jeden State-Uebergang:

1. Das `state`-Feld des Items in der Buffer-Datei aktualisieren
2. Einen Uebergangs-Log-Eintrag anhaengen: `{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. Nach dem Handeln den Thread-Cooldown setzen (speist zurueck in Schritt 5)

**Retention und Pruning:**

- Items mit `state=acted` oder `state=expired` aelter als 7 Tage archivieren (konfigurierbar)
- Durch Verschieben in eine separate Datei archivieren (`buffer_path.archive.jsonl`), nicht loeschen
- `state=merged`-Items aelter als 24 Stunden prunen (sie haben ihren Dedup-Zweck erfuellt)
- Pruning am Ende jedes Zyklus ausfuehren, nach State-Updates

```
# End-of-cycle maintenance
for item in buffer:
    if item.state == "new" and age_hours(item) > item.ttl_hours:
        transition(item, "expired", reason="TTL exceeded")
    if item.state in ("acted", "expired") and age_days(item) > retention_days:
        archive(item)
    if item.state == "merged" and age_hours(item) > 24:
        archive(item)
rewrite_buffer(buffer_path, active_items_only)
```

**Erwartet:** Jeder State-Uebergang ist mit einem Zeitstempel und Grund geloggt. Die Buffer-Datei enthaelt nur aktive Items (new, acknowledged, cooldown). Archivierte Items werden separat fuer Audit erhalten. Der Buffer waechst nicht unbegrenzt.

**Bei Fehler:** Wenn die Buffer-Datei waehrend Rewrite korrupt wird (partieller Write, Crash), aus dem Pre-Rewrite-Backup wiederherstellen. Immer in eine Temp-Datei schreiben und atomar umbenennen — niemals in-place neu schreiben. Wenn das Archiv zu gross wird, monatlich komprimieren oder rotieren.

## Validierung

- [ ] Buffer-Schema enthaelt alle erforderlichen Felder (id, source, timestamp, content_summary, priority, state, dedup_key, thread_id, ttl_hours)
- [ ] Ingestion weist korrekte initiale Prioritaeten nach Item-Typ zu
- [ ] Deduplizierung merged Items die einen dedup_key innerhalb des konfigurierten Fensters teilen
- [ ] Thread-Schuebe werden erkannt und mit Teilnehmer-Anzahlen konsolidiert
- [ ] Composite-Scoring wendet Recency-Decay und Eskalation an, gedeckelt bei Prioritaet 5
- [ ] Pro-Plattform-Rate-Limits werden vor jeder Schreib-Aktion erzwungen
- [ ] Per-Thread-Cooldowns verhindern Re-Engagement innerhalb des Cooldown-Fensters
- [ ] Digest ist kompakt (<50 Zeilen), enthaelt Top-N-Items und hat einen klaren Leerzustand
- [ ] State-Uebergaenge sind mit Zeitstempeln fuer Audit geloggt
- [ ] Abgelaufene und gehandelte Items sind archiviert, nicht geloescht
- [ ] Buffer-Datei waechst nicht unbegrenzt ueber mehrere Zyklen

## Haeufige Stolperfallen

- **Keine TTL auf Items**: Der Buffer waechst unbegrenzt; veraltete Items verdraengen frische. Jedes Item braucht eine TTL und der Pruning-Schritt muss jeden Zyklus laufen.
- **Thread-Cooldowns ignorieren**: Schnellfeuer-Antworten im selben Thread fuehlen sich fuer andere Teilnehmer spammig an. Cooldowns sind eine soziale Norm, nicht nur eine Rate-Limit-Technikalitaet.
- **Prioritaet ohne Decay**: Alte hoch-prioritaere Items blockieren neuere unbegrenzt. Recency-Decay stellt sicher dass der Buffer aktuelle Relevanz reflektiert, keine historische Wichtigkeit.
- **Dedup-Fenster zu eng**: Ein 1-Stunden-Fenster verfehlt Duplikate die Stunden auseinander ankommen (z.B. eine Notification gefolgt von einer Erinnerung). Mit 24 Stunden beginnen und nur verengen wenn legitime Items inkorrekt gemerged werden.
- **Buffer-Logik an einzelne Plattform koppeln**: Von Anfang an fuer das Adapter-Muster entwerfen. Jeder Plattform-Adapter produziert Standard-Buffer-Items; der Buffer selbst ist plattform-agnostisch.
- **Den Digest-Schritt ueberspringen**: Du-dum braucht eine Zusammenfassung, nicht den rohen Buffer. Den vollen Buffer an die Aktions-Uhr zu uebergeben besiegt den Zweck der Zwei-Uhren-Architektur — die Aktions-Uhr sollte einen kompakten Digest lesen und schnell entscheiden.

## Verwandte Skills

- `du-dum` — Kadenz-Muster mit dem dieser Buffer komponiert; du-dum entscheidet *wann* zu beobachten und zu handeln, dieser Skill entscheidet *was* Aktion verdient
- `manage-token-budget` — Kosten-Buchhaltung; der Buffer respektiert Token-Budget-Beschraenkungen beim Dimensionieren von Digests und Limitieren von Aktions-Durchsatz
- `circuit-breaker-pattern` — Versagens-Behandlung fuer Plattform-Adapter die den Buffer speisen; wenn der Adapter-Circuit oeffnet, degradiert Ingestion anmutig
- `coordinate-reasoning` — stigmergische Signale zwischen Buffer- und Aktions-Systemen; die Buffer-Datei selbst ist ein stigmergisches Artefakt
- `forage-resources` — Entdeckung neuer Engagement-Quellen die in die Ingestion-Adapter des Buffers gespeist werden
