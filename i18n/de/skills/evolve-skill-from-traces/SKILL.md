---
name: evolve-skill-from-traces
description: >
  Evolve SKILL.md files from agent execution traces using a three-stage pipeline:
  trajectory collection from observed runs, parallel multi-agent patch proposal
  for error and success analysis, and conflict-free consolidation of overlapping
  edits via prevalence-weighting. Based on the Trace2Skill methodology.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: meta, skill-evolution, traces, multi-agent, consolidation, trace2skill
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Skill aus Ausfuehrungs-Traces evolvieren

Rohe Agent-Ausfuehrungs-Traces in eine validierte SKILL.md durch eine dreistufige Pipeline transformieren: Trajektorien-Sammlung, parallele Multi-Agent-Patch-Vorschlaege und konfliktfreie Konsolidierung. Dieser Skill ueberbrueckt die Luecke zwischen beobachtetem Agent-Verhalten und dokumentierten Verfahren und verwandelt erfolgreiche Laeufe in reproduzierbare Skills.

## Wann verwenden

- Ausfuehrungs-Traces zeigen wiederkehrende Muster die nicht in existierenden Skills erfasst sind
- Beobachtetes Agent-Verhalten uebertrifft das dokumentierte Verfahren
- Skills von Grund auf bauen indem Experten-Demonstrationen aufgezeichnet werden
- Mehrere Agents schlagen widerspruechliche Verbesserungen am selben Skill vor

## Eingaben

- **Erforderlich**: `traces` -- Satz von Agent-Ausfuehrungs-Logs oder Sitzungs-Transkripten (Minimum 10 erfolgreiche Laeufe empfohlen)
- **Erforderlich**: `target_skill` -- Pfad zu existierender SKILL.md zum Evolvieren oder `"new"` fuer Skill-Extraktion von Grund auf
- **Optional**: `analyst_count` -- Anzahl paralleler Analyst-Agents zum Spawnen (Standard: 4)
- **Optional**: `held_out_ratio` -- Anteil der Traces fuer Validierung reserviert, nicht beim Drafting verwendet (Standard: 0.2)

## Vorgehensweise

### Schritt 1: Ausfuehrungs-Traces sammeln

Agent-Sitzungs-Logs, Tool-Call-Sequenzen oder Konversations-Transkripte sammeln die das Ziel-Verhalten demonstrieren. Auf als erfolgreich markierte Laeufe filtern. In ein Standard-Trace-Format normalisieren: eine Sequenz von (Zustand, Aktion, Ergebnis)-Triples mit Zeitstempeln.

1. Die Trace-Quelle identifizieren: Sitzungs-Logs, Tool-Call-Historie oder Konversations-Exporte
2. Traces nach Erfolgskriterien filtern (Exit-Code 0, Aufgaben-Komplettierungs-Flag, Benutzer-Bestaetigung)
3. Jeden Trace in eine Liste strukturierter Triples normalisieren:

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. Traces partitionieren: `held_out_ratio` (Standard 20%) fuer Validierung in Schritt 7 reservieren, den Rest fuer Schritte 2-6 nutzen

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

**Erwartet:** Ein normalisierter Trace-Satz partitioniert in Drafting- (80%) und Held-out- (20%) Subsets. Jeder Trace-Eintrag enthaelt state, action, outcome und timestamp Felder.

**Bei Fehler:** Wenn weniger als 10 erfolgreiche Traces verfuegbar sind, mehr sammeln bevor fortgefahren wird. Kleine Trace-Saetze produzieren ueberangepasste Skills die bei neuen Eingaben scheitern. Wenn Traces Zeitstempel fehlen, stattdessen ordinale Sequenznummern zuweisen.

### Schritt 2: Trajektorien clustern

Normalisierte Traces nach Ergebnis-Muster gruppieren. Den invarianten Kern (Schritte die in allen erfolgreichen Trajektorien praesent sind) versus variante Branches (Schritte die ueber Laeufe variieren) identifizieren. Der invariante Kern wird das Skelett fuer das Skill-Verfahren.

1. Traces nach Aktionstyp ausrichten -- jeden Trace auf eine Sequenz von Aktions-Labels mappen
2. Die laengste gemeinsame Subsequenz ueber alle Traces finden um den invarianten Kern zu identifizieren
3. Verbleibende Aktionen als variante Branches klassifizieren, vermerken welche Traces sie enthalten und unter welchen Bedingungen
4. Branch-Frequenz aufzeichnen: welcher Prozentsatz erfolgreicher Traces enthaelt jeden varianten Schritt

```
invariant_core:
  - action: "read_input_file"
    frequency: 100%
  - action: "validate_schema"
    frequency: 100%
  - action: "transform_data"
    frequency: 100%

variant_branches:
  - action: "retry_on_timeout"
    frequency: 35%
    condition: "network latency > 2s"
  - action: "fallback_to_cache"
    frequency: 15%
    condition: "API returns 503"
```

**Erwartet:** Eine klare Trennung zwischen invarianten Kern-Aktionen (in allen erfolgreichen Traces praesent) und varianten Branches (bedingt, in einer Teilmenge praesent). Jeder variante Branch hat eine Frequenz-Anzahl und ausloesende Bedingung.

**Bei Fehler:** Wenn kein invarianter Kern auftaucht (Traces zu heterogen sind), kann das Ziel-Verhalten tatsaechlich mehrere unterschiedliche Skills sein. Traces in kohaerente Untergruppen nach Ergebnis-Typ aufteilen und jede Gruppe separat verarbeiten.

### Schritt 3: Skill-Skelett entwerfen

Aus dem invarianten Kern eine initiale SKILL.md mit Frontmatter, Wann verwenden (abgeleitet aus Eintrittsbedingungen ueber Traces), Eingaben (Parameter die ueber Laeufe variierten) und einem Verfahrens-Abschnitt mit einem Schritt pro invarianter Aktion erzeugen.

1. Eintrittsbedingungen aus dem ersten Zustand jedes Traces extrahieren um Wann verwenden zu fuellen
2. Parameter identifizieren die ueber Laeufe variierten (Dateipfade, Schwellwerte, Optionen) um Eingaben zu fuellen
3. Einen Verfahrens-Schritt pro invarianter Kern-Aktion erstellen, mit der haeufigsten Formulierung ueber Traces
4. Platzhalter-Erwartet/Bei-Fehler-Bloecke basierend auf beobachteten Ergebnissen hinzufuegen

```bash
# Scaffold the skeleton if creating a new skill
mkdir -p skills/<skill-name>/
```

```markdown
# Skeleton structure
## When to Use
- <derived from common entry conditions>

## Inputs
- **Required**: <parameters present in all traces>
- **Optional**: <parameters present in some traces>

## Procedure
### Step N: <invariant action label>
<most common implementation from traces>

**Expected:** <most common success outcome>
**On failure:** <placeholder -- refined in Steps 4-6>
```

**Erwartet:** Ein syntaktisch gueltiges SKILL.md-Skelett mit Frontmatter, Wann verwenden, Eingaben und einem Verfahrens-Abschnitt der einen Schritt pro invarianter Kern-Aktion enthaelt. Erwartet-Bloecke reflektieren beobachtete Ergebnisse; Bei-Fehler-Bloecke sind Platzhalter.

**Bei Fehler:** Wenn das Skelett 500 Zeilen ueberschreitet bevor variante Branches hinzugefuegt sind, ist der invariante Kern zu granular. Benachbarte Aktionen die immer zusammen vorkommen zu einzelnen Schritten verschmelzen. 5-10 Verfahrens-Schritte anvisieren.

### Schritt 4: Paralleler Multi-Agent-Patch-Vorschlag

N Analyst-Agents spawnen (4-6 empfohlen), jeder reviewed den vollen Trace-Satz gegen das Entwurfs-Skelett aus einer anderen analytischen Linse. Jeder Agent produziert einen strukturierten Patch: Abschnitt, alter Text, neuer Text, Begruendung.

Eine Linse pro Analyst zuweisen:

| Analyst | Linse | Fokus |
|---------|-------|-------|
| 1 | Korrektheit | Erfasst das Skelett alle Erfolgs-Pfade? Fehlen invariante Schritte? |
| 2 | Effizienz | Gibt es redundante Schritte? Koennen Schritte verschmolzen oder parallelisiert werden? |
| 3 | Robustheit | Welche Versagens-Modi sind unbehandelt? Was sollten Bei-Fehler-Bloecke enthalten? |
| 4 | Grenzfaelle | Welche varianten Branches sollten bedingte Schritte oder Stolperfallen werden? |
| 5 (optional) | Klarheit | Ist jeder Schritt eindeutig? Kann ein Agent ihm mechanisch folgen? |
| 6 (optional) | Generalisierbarkeit | Gibt es trace-spezifische Artefakte die abstrahiert werden sollten? |

Jeder Analyst-Agent erhaelt:
- Das Entwurfs-Skelett aus Schritt 3
- Den vollen Drafting-Trace-Satz (nicht held-out)
- Seine zugewiesene Linse und Fokus-Fragen

Jeder Analyst gibt eine Liste strukturierter Patches zurueck:

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

**Erwartet:** Jeder Analyst gibt 3-10 strukturierte Patches zurueck mit Abschnitts-Referenzen, alt/neu-Text, Begruendung und unterstuetzenden Trace-IDs. Alle Patches werden in einen einzelnen Patch-Satz gesammelt.

**Bei Fehler:** Wenn ein Analyst keine Patches zurueckgibt, gilt seine Linse moeglicherweise nicht fuer diesen Skill. Dies ist akzeptabel -- nicht jede Linse hebt Probleme hervor. Wenn ein Analyst vage Patches ohne Trace-Referenzen zurueckgibt, ablehnen und mit der Anforderung konkreter supporting_traces erneut prompten.

### Schritt 5: Konflikte erkennen und klassifizieren

Alle Patches aus Schritt 4 auf ueberlappende Edits vergleichen. Jedes Paar ueberlappender Patches in eine von drei Kategorien klassifizieren.

1. Patches nach Ziel-Abschnitt indexieren
2. Fuer Patches die denselben Abschnitt anvisieren old_text und new_text vergleichen
3. Jede Ueberlappung klassifizieren:

| Konflikt-Typ | Definition | Aufloesung |
|---------------|-----------|------------|
| Kompatibel | Unterschiedliche Abschnitte, keine Ueberlappung | Direkt mergen |
| Komplementaer | Selber Abschnitt, additiv (beide fuegen Inhalt hinzu, kein Widerspruch) | Text kombinieren |
| Widerspruechlich | Selber Abschnitt, gegenseitig ausschliessend (einer fuegt X hinzu, anderer entfernt X oder fuegt stattdessen Y hinzu) | Braucht Aufloesung in Schritt 6 |

```
conflict_report:
  total_patches: 24
  compatible: 18
  complementary: 4
  contradictory: 2
  contradictions:
    - section: "Procedure > Step 5"
      patch_a: {analyst: "efficiency", action: "remove step"}
      patch_b: {analyst: "robustness", action: "add retry logic"}
      supporting_traces_a: [2, 8, 11]
      supporting_traces_b: [4, 7, 12, 15]
```

**Erwartet:** Ein Konflikt-Bericht der alle Patch-Paare auflistet, ihre Klassifikation und fuer Widersprueche die unterstuetzenden Trace-Anzahlen fuer jede Seite.

**Bei Fehler:** Wenn die Klassifikation mehrdeutig ist (ein Patch fuegt sowohl Text hinzu als auch modifiziert er Text im selben Abschnitt), ihn in zwei Patches aufteilen: einen additiv, einen modifizierend. Die kleineren Patches neu klassifizieren.

### Schritt 6: Patches konsolidieren

Alle Patches in eine einzelne konsolidierte SKILL.md mergen mit einer dreistufigen Aufloesungsstrategie.

1. **Kompatible Patches**: Direkt anwenden -- diese beruehren unterschiedliche Abschnitte und koennen nicht kollidieren
2. **Komplementaere Patches**: Den new_text aus beiden Patches in einen einzigen kohaerenten Block kombinieren, beide Beitraege erhaltend
3. **Widerspruechliche Patches**: Mit Praevalenz-Gewichtung aufloesen:
   - Zaehlen wie viele Traces jede Variante unterstuetzen
   - Den Patch bevorzugen der mit mehr Traces ausgerichtet ist
   - Bei Gleichstand (oder innerhalb 10% voneinander) den `argumentation`-Skill nutzen um zu evaluieren welcher Patch dem erklaerten Zweck des Skills besser dient
   - Die abgelehnte Alternative als Haeufige Stolperfalle oder als Notiz im relevanten Bei-Fehler-Block dokumentieren

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

Nach der Konsolidierung die resultierende SKILL.md verifizieren:
- Alle Abschnitte sind praesent (Wann verwenden, Eingaben, Vorgehensweise, Validierung, Haeufige Stolperfallen, Verwandte Skills)
- Jeder Verfahrens-Schritt hat Erwartet und Bei Fehler
- Keine duplizierten oder widerspruechlichen Anweisungen verbleiben
- Zeilen-Anzahl ist innerhalb des 500-Zeilen-Limits

**Erwartet:** Eine einzige konsolidierte SKILL.md die Patches von allen Analysts inkorporiert. Widersprueche sind mit dokumentierter Begruendung aufgeloest. Die abgelehnte Alternative fuer jeden Widerspruch erscheint als Stolperfalle oder Notiz.

**Bei Fehler:** Wenn die Konsolidierung ein intern inkonsistentes Dokument produziert (z.B. Schritt 3 nimmt an dass eine Datei existiert aber Schritt 2 wurde durch einen Effizienz-Patch entfernt), den konfliktiven Edit reverten und den originalen Skelett-Text fuer diesen Abschnitt behalten. Die Inkonsistenz fuer manuelle Pruefung markieren.

### Schritt 7: Validieren und registrieren

Den konsolidierten Skill mental gegen Held-out-Traces (die in Schritt 1 reservierten 20%) ausfuehren. Verifizieren dass Erwartet/Bei-Fehler-Bloecke beobachteten Ergebnissen in Traces entsprechen die der Skill nie gesehen hat.

1. Fuer jeden Held-out-Trace durch das Skill-Verfahren Schritt fuer Schritt gehen
2. An jedem Schritt das Erwartet-Ergebnis des Skills mit dem tatsaechlichen Ergebnis des Traces vergleichen
3. Treffer und Fehlanpassungen aufzeichnen:

```
validation_results:
  held_out_traces: 5
  full_match: 4
  partial_match: 1
  no_match: 0
  mismatches:
    - trace_id: 23
      step: 4
      expected: "API returns 200"
      actual: "API returns 429 (rate limited)"
      action: "Add rate-limit handling to On failure block"
```

4. Wenn die Mismatch-Rate 20% ueberschreitet, zu Schritt 4 zurueckkehren mit den Mismatch-Traces dem Drafting-Satz hinzugefuegt
5. Wenn der Skill neu ist, `create-skill` fuer Verzeichnis-Erstellung, Registry-Eintrag und Symlink-Setup folgen
6. Wenn ein existierender Skill evolviert wird, `evolve-skill` fuer Versions-Bumping und Translation-Sync folgen

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

**Erwartet:** Mindestens 80% der Held-out-Traces passen zum Skill-Verfahren End-to-End. Der Skill ist in `skills/_registry.yml` mit korrekten Metadaten registriert.

**Bei Fehler:** Wenn die Validierung scheitert (>20% Mismatch), hat der Skill zu den Drafting-Traces ueberangepasst. Die Mismatch-Traces dem Drafting-Satz hinzufuegen und ab Schritt 2 erneut ausfuehren. Wenn die Validierung nach zwei Iterationen weiter scheitert, kann das Verhalten zu variabel fuer einen einzelnen Skill sein -- in Erwaegung ziehen in mehrere Skills nach Ergebnis-Typ aufzuteilen.

## Validierung

- [ ] Mindestens 10 erfolgreiche Traces wurden vor dem Drafting gesammelt
- [ ] Traces sind in Drafting- (80%) und Held-out- (20%) Subsets partitioniert
- [ ] Invarianter Kern und variante Branches sind explizit dokumentiert
- [ ] Mindestens 4 Analyst-Agents haben das Skelett aus distinkten Linsen reviewed
- [ ] Alle Patch-Konflikte sind klassifiziert (kompatibel, komplementaer, widerspruechlich)
- [ ] Widerspruechliche Patches sind mit dokumentierter Begruendung aufgeloest
- [ ] Konsolidierte SKILL.md hat alle erforderlichen Abschnitte mit Erwartet/Bei-Fehler-Paaren
- [ ] Held-out-Validierung erreicht mindestens 80% Trefferrate
- [ ] Zeilen-Anzahl ist innerhalb des 500-Zeilen-Limits
- [ ] Skill ist registriert (neu) oder Versions-bumped (existierend) gemaess Standard-Verfahren

## Haeufige Stolperfallen

- **Zu wenige Traces**: Mit weniger als 10 erfolgreichen Laeufen ist Muster-Extraktion unzuverlaessig. Der invariante Kern kann zufaellige Schritte enthalten und varianten Branches fehlt ausreichende Frequenz-Daten. Mehr Traces sammeln bevor begonnen wird.
- **Ueberanpassung an Trace-Artefakte**: Tool-spezifische Verhaltensweisen (z.B. das Retry-Muster eines bestimmten API-Clients) generalisieren moeglicherweise nicht. Waehrend Schritt 3 tool-spezifische Aktionen in tool-agnostische Beschreibungen abstrahieren. Der Skill sollte beschreiben *was* zu tun ist, nicht *welches Tool* zu nutzen.
- **Versagens-Traces ignorieren**: Versagens-Traces zeigen wovor der Skill in Bei-Fehler-Bloecken warnen sollte. Waehrend Schritt 1 auch fehlgeschlagene Laeufe sammeln und markieren. Sie in Schritt 4 nutzen wenn der Robustheits-Analyst unbehandelte Versagens-Modi evaluiert.
- **Single-Lens-Analyse**: Nur 1-2 Analysts zu nutzen verfehlt wichtige Perspektiven. Ein Effizienz-Analyst allein wird Sicherheitspruefungen entfernen die ein Robustheits-Analyst erhalten wuerde. Mindestens 4 distinkte Linsen fuer ausgewogene Abdeckung nutzen.
- **Widerspruechliche Patches ohne Aufloesung mergen**: Beide Seiten eines Widerspruchs anzuwenden produziert einen intern inkonsistenten Skill (z.B. "tu X" in einem Schritt und "ueberspringe X" in einem anderen). Widersprueche immer in Schritt 6 explizit klassifizieren und aufloesen.
- **Nicht gegen Held-out-Traces validieren**: Ohne Held-out-Validierung kann der konsolidierte Skill perfekt zu den Drafting-Traces passen aber bei neuen Laeufen scheitern. Immer 20% der Traces reservieren und den finalen Skill gegen sie testen.

## Verwandte Skills

- `evolve-skill` -- einfachere menschen-gelenkte Evolution (komplementaer: nutzen wenn Traces nicht verfuegbar sind)
- `create-skill` -- fuer neu extrahierte Skills die noch nicht existieren; in Schritt 7 fuer Registrierung verwendet
- `review-skill-format` -- Validierung nach Konsolidierung um agentskills.io-Compliance sicherzustellen
- `argumentation` -- in Schritt 6 zum Aufloesen widerspruechlicher Patches verwendet wenn Praevalenz unentschieden ist
- `verify-agent-output` -- Evidenz-Spuren fuer Patch-Vorschlaege; validiert Analyst-Ausgaben in Schritt 4
