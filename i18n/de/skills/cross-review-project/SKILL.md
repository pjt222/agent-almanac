---
name: cross-review-project
description: >
  Conduct a structured cross-project code review between two Claude Code
  instances via the cross-review-mcp broker. Each agent reads its own
  codebase, reviews the peer's code, and engages in evidence-backed
  dialogue — with QSG scaling laws enforcing review quality through
  minimum bandwidth constraints and phase-gated progression.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, cross-review, multi-agent, code-review, qsg, a2a
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Projekt-Cross-Review

Zwei Claude-Code-Instanzen pruefen die Projekte des jeweils anderen durch strukturierten Artefakt-Austausch via den `cross-review-mcp`-Broker. Der Broker erzwingt Quantized-Simplex-Gossip-(QSG)-Skalengesetze — Review-Buendel muessen mindestens 5 Befunde enthalten um im Selektionsregime zu bleiben (Γ_h ≈ 1,67), was verhindert dass oberflaechlicher Konsens als Uebereinstimmung durchgeht.

## Wann verwenden

- Zwei Projekte teilen architektonische Anliegen und koennten voneinander lernen
- Unabhaengiges Code-Review erwuenscht das ueber das hinausgeht was ein einzelner Reviewer sieht
- Cross-Pollination ist das Ziel: Muster in einem Projekt finden die im anderen fehlen
- Strukturiertes, evidenzbasiertes Review mit accept/reject/discuss-Verdicts noetig

## Eingaben

- **Erforderlich**: Zwei Projektpfade die zwei Claude-Code-Instanzen zugaenglich sind
- **Erforderlich**: `cross-review-mcp`-Broker laeuft und ist als MCP-Server in beiden Instanzen konfiguriert
- **Optional**: Fokusbereiche — spezifische Verzeichnisse, Muster oder Anliegen zu priorisieren
- **Optional**: Agent-IDs — Identifikatoren fuer jede Instanz (Standard: Projektverzeichnisname)

## Vorgehensweise

### Schritt 1: Voraussetzungen verifizieren

Bestaetigen dass der Broker laeuft und beide Instanzen ihn erreichen koennen.

1. Pruefen dass der Broker als MCP-Server konfiguriert ist:
   ```bash
   claude mcp list | grep cross-review
   ```
2. `get_status` aufrufen um zu verifizieren dass der Broker antwortet und keine veralteten Agents registriert sind
3. Die Protokoll-Resource bei `cross-review://protocol` lesen — dies ist ein Markdown-Dokument das die Review-Dimensionen und QSG-Beschraenkungen beschreibt

**Erwartet:** Der Broker antwortet auf `get_status` mit einer leeren Agent-Liste. Die Protokoll-Resource ist als Markdown lesbar.

**Bei Fehler:** Wenn der Broker nicht konfiguriert ist, hinzufuegen: `claude mcp add cross-review-mcp -- npx cross-review-mcp`. Wenn veraltete Agents aus einer vorigen Session existieren, fuer jeden `deregister` aufrufen bevor fortgefahren wird.

### Schritt 2: Registrieren

Diesen Agent beim Broker registrieren.

1. `register` aufrufen mit:
   - `agentId`: ein kurzer, einzigartiger Identifikator (z.B. Projektverzeichnisname)
   - `project`: der Projektname
   - `capabilities`: `["review", "suggest"]`
2. Registrierung verifizieren mit `get_status` — der Agent sollte mit Phase `"registered"` erscheinen
3. Auf Registrierung des Peer-Agents warten: `wait_for_phase` mit der Agent-ID des Peers und Phase `"registered"` aufrufen

**Erwartet:** Beide Agents beim Broker registriert. `get_status` zeigt 2 Agents in Phase `"registered"`.

**Bei Fehler:** Wenn `register` mit "already registered" scheitert, ist die Agent-ID aus einer vorigen Session belegt. Zuerst `deregister` aufrufen, dann erneut registrieren.

### Schritt 3: Briefing-Phase

Eigene Codebasis lesen und ein strukturiertes Briefing an den Peer senden.

1. Systematisch lesen:
   - Einstiegspunkte (Hauptdateien, Index, CLI-Befehle)
   - Abhaengigkeitsgraph (package.json, DESCRIPTION, go.mod)
   - Architektonische Muster (Verzeichnisstruktur, Modulgrenzen)
   - Bekannte Probleme (TODO-Kommentare, offene Issues, Tech Debt)
   - Test-Coverage (Test-Verzeichnisse, CI-Konfiguration)
2. Ein `Briefing`-Artefakt komponieren — eine strukturierte Zusammenfassung die der Peer nutzen kann um deine Codebasis effizient zu navigieren
3. `send_task` aufrufen mit:
   - `from`: deine Agent-ID
   - `to`: Peer-Agent-ID
   - `type`: `"briefing"`
   - `payload`: JSON-kodiertes Briefing
4. `signal_phase` mit Phase `"briefing"` aufrufen

**Erwartet:** Briefing gesendet und Phase signalisiert. Der Broker erzwingt dass ein Briefing gesendet werden muss bevor zu Review uebergegangen werden kann.

**Bei Fehler:** Wenn `send_task` das Briefing ablehnt, pruefen dass das `from`-Feld mit deiner registrierten Agent-ID uebereinstimmt. Self-Sends werden abgelehnt.

### Schritt 4: Review-Phase

Auf das Briefing des Peers warten, dann seinen Code pruefen und Befunde senden.

1. `wait_for_phase` mit der Peer-ID und Phase `"briefing"` aufrufen
2. `poll_tasks` aufrufen um das Briefing des Peers abzurufen
3. `ack_tasks` mit den empfangenen Task-IDs aufrufen — dies ist erforderlich (Peek-then-Ack-Muster)
4. Den tatsaechlichen Quellcode des Peers lesen, informiert durch sein Briefing
5. Befunde ueber 6 Kategorien produzieren:
   - `pattern_transfer` — ein Muster in deinem Projekt das der Peer uebernehmen koennte
   - `missing_practice` — eine Praxis die dem Peer fehlt (Testing, Validierung, Fehlerbehandlung)
   - `inconsistency` — interner Widerspruch innerhalb der Codebasis des Peers
   - `simplification` — unnoetige Komplexitaet die reduziert werden koennte
   - `bug_risk` — potenzieller Laufzeitfehler oder Grenzfall
   - `documentation_gap` — fehlende oder irrefuehrende Dokumentation
6. Jeder Befund muss enthalten:
   - `id`: einzigartiger Identifikator (z.B. `"F-001"`)
   - `category`: eine der 6 Kategorien oben
   - `targetFile`: Pfad im Projekt des Peers
   - `description`: was du gefunden hast
   - `evidence`: warum dies ein gueltiger Befund ist (Code-Referenzen, Muster)
   - `sourceAnalog` (empfohlen): das Aequivalent in deinem eigenen Projekt das das Muster demonstriert — dies ist der einzige Mechanismus fuer genuine Cross-Pollination
7. Mindestens **5 Befunde** buendeln (QSG-Beschraenkung: m ≥ 5 haelt Γ_h ≈ 1,67 im Selektionsregime)
8. `send_task` mit Type `"review_bundle"` und dem JSON-kodierten Findings-Array aufrufen
9. `signal_phase` mit Phase `"review"` aufrufen

**Erwartet:** Review-Bundle vom Broker akzeptiert. Weniger als 5 Befunde werden abgelehnt.

**Bei Fehler:** Wenn das Bundle wegen unzureichender Befunde abgelehnt wird, tiefer pruefen. Die Beschraenkung existiert um zu verhindern dass oberflaechliche Reviews dominieren. Wenn genuein keine 5 Probleme gefunden werden koennen, neu pruefen ob Cross-Review das richtige Werkzeug fuer dieses Projektpaar ist.

### Schritt 5: Dialog-Phase

Befunde ueber das eigene Projekt empfangen und mit evidenzbasierten Verdicts antworten.

1. `wait_for_phase` mit der Peer-ID und Phase `"review"` aufrufen
2. `poll_tasks` aufrufen um Befunde zum eigenen Projekt abzurufen
3. `ack_tasks` mit den empfangenen Task-IDs aufrufen
4. Fuer jeden Befund eine `FindingResponse` produzieren:
   - `findingId`: entspricht der Befund-ID
   - `verdict`: `"accept"` (gueltig, wird gehandelt), `"reject"` (ungueltig, mit Gegenevidenz) oder `"discuss"` (braucht Klaerung)
   - `evidence`: warum du akzeptierst oder ablehnst — muss nicht-leer sein
   - `counterEvidence` (optional): spezifische Code-Referenzen die dem Befund widersprechen
5. Alle Antworten via `send_task` mit Type `"response"` senden
6. `signal_phase` mit Phase `"dialogue"` aufrufen

Hinweis: das `"discuss"`-Verdict ist nicht durch das Protokoll gesperrt — als Flag fuer manuelle Nachverfolgung behandeln, nicht als automatisierten Sub-Austausch.

**Erwartet:** Auf alle Befunde wurde mit Verdicts geantwortet. Leere Antworten werden vom Broker abgelehnt.

**Bei Fehler:** Wenn keine Meinung zu einem Befund gebildet werden kann, auf `"discuss"` defaulten mit Evidenz die erklaert welcher zusaetzliche Kontext gebraucht wird.

### Schritt 6: Synthese-Phase

Ein Synthese-Artefakt produzieren das akzeptierte Befunde und geplante Aktionen zusammenfasst.

1. `wait_for_phase` mit der Peer-ID und Phase `"dialogue"` aufrufen
2. Verbleibende Tasks pollen und bestaetigen
3. Ein `Synthesis`-Artefakt zusammenstellen:
   - Akzeptierte Befunde mit geplanten Aktionen (was du aendern wirst und warum)
   - Abgelehnte Befunde mit Gruenden (bewahrt das Reasoning fuer zukuenftige Reviews)
4. `send_task` mit Type `"synthesis"` und der JSON-kodierten Synthese aufrufen
5. `signal_phase` mit Phase `"synthesis"` aufrufen
6. Optional GitHub-Issues fuer akzeptierte Befunde erstellen
7. `signal_phase` mit Phase `"complete"` aufrufen
8. `deregister` aufrufen zum Aufraeumen

**Erwartet:** Beide Agents erreichen `"complete"`. Der Broker verlangt mindestens 2 registrierte Agents um zu complete vorzurueacken.

**Bei Fehler:** Wenn der Peer bereits deregistriert hat, kann lokal trotzdem komplettiert werden. Die Synthese aus den empfangenen Befunden zusammenstellen.

## Validierung

- [ ] Beide Agents registriert und Phase `"complete"` erreicht
- [ ] Briefings ausgetauscht bevor Reviews begannen (Phasen-Erzwingung)
- [ ] Review-Bundles enthielten jeweils mindestens 5 Befunde
- [ ] Alle Befunde erhielten ein Verdict (accept/reject/discuss) mit Evidenz
- [ ] `ack_tasks` nach jedem `poll_tasks` aufgerufen
- [ ] Synthese produziert mit akzeptierten Befunden auf Aktionen abgebildet
- [ ] Agents nach Komplettierung deregistriert

## Haeufige Stolperfallen

- **Weniger als 5 Befunde**: Der Broker lehnt Bundles mit m < 5 ab. Dies ist nicht willkuerlich — mit N=2 Agents und 6 Kategorien setzt m < 5 Γ_h auf oder unter die kritische Grenze wo Konsens nicht von Rauschen unterscheidbar ist. Tiefer pruefen; wenn 5 Befunde genuein nicht gefunden werden koennen, profitieren die Projekte moeglicherweise nicht vom Cross-Review.
- **`ack_tasks` vergessen**: Der Broker nutzt Peek-then-Ack-Delivery. Tasks bleiben in der Queue bis sie bestaetigt sind. Vergessenes Ack verursacht doppelte Verarbeitung beim naechsten Poll.
- **Den `from`-Parameter vergessen**: `send_task` erfordert ein explizites `from`-Feld das mit der Agent-ID uebereinstimmt. Self-Sends werden abgelehnt.
- **Selbe-Modell epistemische Korrelation**: Zwei Claude-Instanzen teilen Training-Biases. Zeitliche Ordnung stellt sicher dass sie waehrend Review nicht die Ausgabe des anderen lesen, aber ihre Priors sind korreliert. Fuer genuine epistemische Unabhaengigkeit unterschiedliche Modellfamilien ueber Instanzen nutzen.
- **`sourceAnalog` ueberspringen**: Das `sourceAnalog`-Feld ist optional aber der einzige Mechanismus fuer genuine Cross-Pollination — es zeigt *deine* Implementation des Musters das du empfiehlst. Immer befuellen wenn ein Source-Analog existiert.
- **`discuss` als blockierend behandeln**: Nichts im Protokoll sperrt `complete` darauf dass anhaengende Diskussionen geloest werden. `discuss`-Verdicts als Flags fuer manuelle Nachverfolgung nach der Session behandeln.
- **Telemetrie nicht reviewen**: Der Broker loggt alle Events nach JSONL. Nach einer Session das Log pruefen um QSG-Annahmen zu validieren — α empirisch schaetzen (`α ≈ 1 - reject_rate`) und Per-Kategorie-Akzeptanzraten pruefen.

## Verwandte Skills

- `scaffold-mcp-server` — fuer Bauen oder Erweitern des Brokers selbst
- `implement-a2a-server` — A2A-Protokoll-Muster aus denen der Broker schoepft
- `review-codebase` — Single-Agent-Review (dieser Skill erweitert es zu Cross-Agent-strukturiertem Austausch)
- `build-consensus` — Schwarm-Konsens-Muster (QSG ist die theoretische Grundlage)
- `configure-mcp-server` — den Broker als MCP-Server in Claude Code konfigurieren
- `unleash-the-agents` — kann genutzt werden um den Broker selbst zu analysieren (battle-tested: 40 Agents, 10 Hypothesen-Familien)
