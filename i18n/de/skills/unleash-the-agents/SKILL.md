---
name: unleash-the-agents
description: >
  Launch all available agents in parallel waves for open-ended hypothesis
  generation on problems where the correct domain is unknown. Use when facing
  a cross-domain problem with no clear starting point, when single-agent
  approaches have stalled, or when diverse perspectives are more valuable
  than deep expertise. Produces a ranked hypothesis set with convergence
  analysis and adversarial refinement.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent ToolSearch TeamCreate TaskCreate TaskUpdate TaskList SendMessage
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: swarm
  complexity: advanced
  language: multi
  tags: swarm, parallel, hypothesis-generation, multi-agent, brainstorming, convergence
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Die Agents entfesseln

Alle verfuegbaren Agents in parallelen Wellen konsultieren um diverse Hypothesen fuer offene Probleme zu generieren. Jeder Agent denkt durch seine einzigartige Domaenen-Linse — ein Kabbalist findet Muster via Gematria, ein Martial-Artist schlaegt bedingte Verzweigung vor, ein Contemplative bemerkt Struktur indem er bei den Daten sitzt. Konvergenz ueber unabhaengige Perspektiven ist das primaere Signal dass eine Hypothese Wert hat.

## Wann verwenden

- Konfrontiert mit einem domaeneuebergreifenden Problem wo der korrekte Ansatz unbekannt ist
- Ein Single-Agent- oder Single-Domaenen-Ansatz hat gestockt oder kein Signal produziert
- Das Problem profitiert von genuein diversen Perspektiven (nicht nur mehr Compute)
- Hypothesen-Generierung noetig, keine Ausfuehrung (Teams fuer Ausfuehrung nutzen)
- Hochriskante Entscheidungen wo das Verfehlen eines nicht-offensichtlichen Winkels echte Kosten traegt

## Eingaben

- **Erforderlich**: Problem-Brief — eine klare Beschreibung des Problems, 5+ konkrete Beispiele und was als Loesung zaehlt
- **Erforderlich**: Verifikations-Methode — wie zu testen ist ob eine Hypothese korrekt ist (programmatischer Test, Experten-Review oder Null-Modell-Vergleich)
- **Optional**: Agent-Subset — spezifische Agents zum Einbeziehen oder Ausschliessen (Standard: alle registrierten Agents)
- **Optional**: Wellen-Groesse — Anzahl Agents pro Welle (Standard: 10)
- **Optional**: Ausgabe-Format — strukturiertes Template fuer Agent-Antworten (Standard: Hypothese + Reasoning + Konfidenz + testbare Vorhersage)

## Vorgehensweise

### Schritt 1: Den Brief vorbereiten

Einen Problem-Brief schreiben den jeder Agent verstehen kann unabhaengig von Domaenen-Expertise. Einbeziehen:

1. **Problem-Aussage**: Was du zu entdecken oder entscheiden versuchst (1-2 Saetze)
2. **Beispiele**: Mindestens 5 konkrete Eingabe-/Ausgabe-Beispiele oder Datenpunkte (mehr ist besser — 3 sind zu wenige fuer die meisten Agents um Muster zu finden)
3. **Bekannte Beschraenkungen**: Was du bereits weisst, was bereits versucht wurde
4. **Erfolgskriterien**: Wie eine korrekte Hypothese zu erkennen ist
5. **Ausgabe-Template**: Das exakte Format in dem Antworten gewuenscht sind

```markdown
## Brief: [Problem Title]

**Problem**: [1-2 sentence statement]

**Examples**:
1. [Input] → [Output]  (explain what's known)
2. [Input] → [Output]
3. [Input] → [Output]
4. [Input] → [Output]
5. [Input] → [Output]

**Already tried**: [List failed approaches to avoid rediscovery]

**Success looks like**: [Testable criterion]

**Respond with**:
- Hypothesis: [Your proposed mechanism in one sentence]
- Reasoning: [Why your domain expertise suggests this]
- Confidence: [low/medium/high]
- Testable prediction: [If my hypothesis is correct, then X should be true]
```

**Erwartet:** Ein Brief der selbsterklaerend ist — ein Agent der nur diesen Text empfaengt hat alles noetige um ueber das Problem zu reasoning.

**Bei Fehler:** Wenn 5 Beispiele oder eine Verifikations-Methode nicht artikuliert werden koennen, ist das Problem nicht bereit fuer Multi-Agent-Konsultation. Den Scope zuerst verengen.

### Schritt 2: Die Wellen planen

Alle verfuegbaren Agents auflisten und sie in Wellen von ~10 aufteilen. Reihenfolge ist fuer die ersten 2 Wellen unwichtig; fuer nachfolgende Wellen verbessert Inter-Wellen-Wissens-Injektion Ergebnisse.

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

Agents zu Wellen zuweisen. Anfangs fuer 4 Wellen planen — moeglicherweise sind nicht alle noetig (siehe Early-Stopping in Schritt 4).

| Welle | Agents | Brief-Variante |
|-------|--------|----------------|
| 1-2 | 20 Agents | Standard-Brief |
| 3 | 10 Agents + advocatus-diaboli | Brief + entstehender Konsens + adversariale Herausforderung |
| 4+ | 10 Agents je | Brief + "X ist bestaetigt. Auf Grenzfaelle und Versagen fokussieren." |

**Erwartet:** Eine Wellen-Zuordnungs-Tabelle mit allen Agents alloziert. `advocatus-diaboli` in Welle 3 (nicht spaeter) einbeziehen damit der adversariale Pass nachfolgende Wellen informiert.

**Bei Fehler:** Wenn weniger als 20 Agents verfuegbar sind, auf 2-3 Wellen reduzieren. Das Muster funktioniert immer noch mit so wenigen wie 10 Agents, obwohl Konvergenz-Signale schwaecher sind.

### Schritt 3: Wellen starten

Jede Welle als parallele Agents starten. `sonnet`-Modell fuer Kosteneffizienz nutzen (der Wert kommt von Perspektivenvielfalt, nicht individueller Tiefe).

#### Option A: TeamCreate (empfohlen fuer volle Entfesselung)

Claude Codes `TeamCreate`-Tool nutzen um ein koordiniertes Team mit Aufgaben-Tracking aufzusetzen. TeamCreate ist ein deferred Tool — zuerst via `ToolSearch("select:TeamCreate")` abrufen.

1. Das Team erstellen:
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. Eine Aufgabe pro Agent mit `TaskCreate` erstellen mit dem Brief und domaenen-spezifischer Rahmung
3. Jeden Agent als Teammate spawnen mit dem `Agent`-Tool mit `team_name: "unleash-wave-1"` und `subagent_type` auf den Agent-Typ gesetzt (z.B. `kabalist`, `geometrist`)
4. Aufgaben den Teammates via `TaskUpdate` mit `owner` zuweisen
5. Fortschritt via `TaskList` ueberwachen — Teammates markieren Aufgaben als abgeschlossen wenn sie fertig sind
6. Zwischen Wellen das aktuelle Team via `SendMessage({ type: "shutdown_request" })` herunterfahren und das naechste Team mit dem aktualisierten Brief erstellen (Schritt 4)

Das gibt eingebaute Koordination: eine geteilte Aufgabenliste verfolgt welche Agents geantwortet haben, Teammates koennen fuer Follow-ups bemessagt werden und der Lead verwaltet Wellen-Uebergaenge durch Aufgaben-Zuweisung.

#### Option B: Rohes Agent-Spawning (einfacher, fuer kleinere Laeufe)

Fuer jeden Agent in der Welle ihn mit dem Brief und einer domaenen-spezifischen Rahmung spawnen:

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

Alle Agents in einer Welle gleichzeitig mit dem Agent-Tool mit `run_in_background: true` starten. Auf die Welle zum Abschluss warten bevor die naechste Welle gestartet wird (um Inter-Wellen-Wissens-Injektion in Schritt 4 zu ermoeglichen).

#### Zwischen Optionen waehlen

| | TeamCreate | Rohes Agent |
|---|------------|-------------|
| Am besten fuer | Tier 3 volle Entfesselung (40+ Agents) | Tier 2 Panel (5-10 Agents) |
| Koordination | Aufgabenliste, Messaging, Eigentum | Fire-and-Forget, manuelle Sammlung |
| Inter-Wellen-Handoff | Aufgaben-Status uebertraegt sich | Muss manuell verfolgt werden |
| Overhead | Hoeher (Team-Setup pro Welle) | Niedriger (einzelner Tool-Call pro Agent) |

**Erwartet:** Jede Welle gibt ~10 strukturierte Antworten innerhalb 2-5 Minuten zurueck. Agents die nicht antworten oder off-format-Ausgabe zurueckgeben werden vermerkt aber blockieren die Pipeline nicht.

**Bei Fehler:** Wenn mehr als 50% einer Welle scheitern, die Brief-Klarheit pruefen. Haeufige Ursache: das Ausgabe-Template ist mehrdeutig oder die Beispiele sind unzureichend fuer Nicht-Domaenen-Agents zum Reasoning.

### Schritt 4: Inter-Wellen-Wissen injizieren (und Early-Stopping evaluieren)

Nach Wellen 1-2 das entstehende Signal vor Start der naechsten Welle extrahieren.

1. Antworten von abgeschlossenen Wellen nach wiederkehrenden Themen scannen
2. Die haeufigste Hypothesen-Familie identifizieren (das Konvergenz-Signal)
3. **Den Early-Stopping-Schwellwert pruefen**: wenn die Top-Familie bereits 3x die Null-Modell-Erwartung nach 20 Agents ueberschreitet, hast du starkes Signal. Welle 3 als adversariale + Verfeinerungs-Welle planen und in Erwaegung ziehen danach zu stoppen
4. Den Brief fuer die naechste Welle aktualisieren:

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**Early-Stopping-Anleitung**: Nicht jede Entfesselung braucht alle Agents. Fuer wohldefinierte Problem-Domaenen (z.B. Codebasis-Analyse) stabilisiert sich Konvergenz oft bei 30-40 Agents. Fuer abstrakte oder offene Probleme (z.B. unbekannte mathematische Transformationen) fuegt das volle Roster Wert hinzu weil die korrekte Domaene genuein unvorhersagbar ist. Konvergenz nach jeder Welle pruefen — wenn die Anzahl der Top-Familie und das Null-Modell-Verhaeltnis plateauiert haben, geben zusaetzliche Wellen abnehmende Renditen.

Dies verhindert Wiederentdeckung (wo spaetere Wellen unabhaengig wieder ableiten was fruehere Wellen bereits gefunden haben) und richtet spaetere Agents zu den Raendern des Problems.

**Erwartet:** Spaetere Wellen produzieren nuanciertere, gezieltere Hypothesen die Luecken im entstehenden Konsens adressieren.

**Bei Fehler:** Wenn nach 2 Wellen keine Konvergenz erscheint, kann das Problem zu unbeschraenkt sein. Den Scope verengen oder mehr Beispiele bereitstellen.

### Schritt 5: Sammeln und deduplizieren

Nachdem alle Wellen abgeschlossen sind, alle Antworten in ein einzelnes Dokument sammeln. Deduplizieren indem Hypothesen in Familien gruppiert werden:

1. Alle Hypothesen-Aussagen extrahieren
2. Nach Mechanismus clustern (nicht nach Wortwahl — "modulare Arithmetik mod 94" und "zyklische Gruppe ueber Z_94" sind dieselbe Familie)
3. Unabhaengige Entdeckungen pro Familie zaehlen
4. Nach Konvergenz rangieren: Familien die von mehr Agents unabhaengig entdeckt wurden rangieren hoeher

**Erwartet:** Eine rangierte Liste von Hypothesen-Familien mit Konvergenz-Anzahlen, beitragenden Agents und repraesentativen testbaren Vorhersagen.

**Bei Fehler:** Wenn jede Hypothese einzigartig ist (keine Konvergenz), ist das Signal-Rausch-Verhaeltnis zu niedrig. Entweder braucht das Problem mehr Beispiele oder die Agents brauchen ein engeres Ausgabe-Format.

### Schritt 6: Gegen Null-Modell verifizieren

Die Top-Hypothese gegen ein Null-Modell testen um sicherzustellen dass die Konvergenz bedeutungsvoll ist, kein Artefakt geteilter Trainingsdaten.

- **Programmatische Verifikation**: Wenn die Hypothese eine testbare Formel oder einen Algorithmus produziert, sie gegen ausgehaltene Beispiele ausfuehren
- **Null-Modell**: Die Wahrscheinlichkeit schaetzen dass N Agents auf dieselbe Hypothesen-Familie zufaellig konvergieren wuerden (z.B. wenn es K vernuenftige Hypothesen-Familien gibt, ist zufaellige Konvergenz-Wahrscheinlichkeit ~N/K)
- **Schwellwert**: Signal ist bedeutungsvoll wenn Konvergenz 3x die Null-Modell-Erwartung ueberschreitet

**Erwartet:** Die Top-Hypothesen-Familie ueberschreitet signifikant Zufallsniveau-Konvergenz und/oder besteht programmatische Verifikation.

**Bei Fehler:** Wenn die Top-Hypothese Verifikation scheitert, die zweitplatzierte Familie pruefen. Wenn keine Familie besteht, kann das Problem einen anderen Ansatz erfordern (tiefere Single-Experten-Analyse, mehr Daten oder neu formulierte Beispiele).

### Schritt 7: Adversariale Verfeinerung

**Bevorzugtes Timing: Welle 3, nicht Post-Synthese.** `advocatus-diaboli` in Welle 3 einzubeziehen (neben der Inter-Wellen-Wissens-Injektion) ist effektiver als ein eigenstaendiger adversarialer Pass nach Abschluss aller Wellen. Frueher Herausforderung erlaubt Wellen 4+ gegen die Kritik zu verfeinern statt auf einen unherausgeforderten Konsens zu haeufen.

Wenn der adversariale Pass bereits Teil von Welle 3 war, wird dieser Schritt zu einer finalen Pruefung. Falls nicht (z.B. alle Wellen ohne ihn gelaufen), `advocatus-diaboli` (oder `senior-researcher`) jetzt spawnen. Fuer einen strukturierten Pass `TeamCreate` nutzen um ein Review-Team aufzustellen mit beiden Agents parallel gegen den Konsens arbeitend:

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

**Erwartet:** Ein Satz Gegenargumente, Grenzfaelle und ein Falsifikations-Experiment. Wenn die Hypothese adversariale Pruefung ueberlebt, ist sie bereit fuer Integration. Ein guter adversarialer Pass *verteidigt* manchmal *teilweise* den Konsens — findet dass das Design besser als Alternativen ist auch wenn unvollkommen.

**Bei Fehler:** Wenn der adversariale Agent einen fatalen Fehler findet, die Kritik in eine gezielte Follow-up-Welle zurueckspeisen (Tier 3+ iterativer Modus — 5-10 Agents auswaehlen die am besten positioniert sind die spezifische Kritik zu adressieren).

### Schritt 8: An Teams uebergeben

Entfesselung findet Probleme; Teams loesen sie. Verifizierte Hypothesen-Familien in umsetzbare Issues konvertieren, dann fokussierte Teams zusammenstellen um jedes zu loesen.

1. Ein GitHub-Issue pro verifizierter Hypothesen-Familie erstellen (den `create-github-issues`-Skill nutzen)
2. Issues nach Konvergenz-Staerke und Impact priorisieren
3. Fuer jedes Issue ein kleines Team via `TeamCreate` zusammenstellen:
   - Wenn eine vordefinierte Team-Definition in `teams/` zur Problem-Domaene passt, sie nutzen
   - Wenn kein passendes Team existiert, auf `opaque-team` defaulten (N Shapeshifters mit adaptiver Rollen-Zuweisung) — es behandelt unbekannte Problem-Formen ohne eine custom Komposition zu erfordern
   - Mindestens einen nicht-technischen Agent einbeziehen (z.B. `advocatus-diaboli`, `contemplative`) — sie fangen Implementations-Risiken die technische Agents verfehlen
   - REST-Checkpoints zwischen Phasen nutzen um Hetzen zu verhindern
4. Die Pipeline ist: **Entfesseln → Triagieren → Team-pro-Issue → Loesen**

**Erwartet:** Jede Hypothesen-Familie mappt zu einem getrackten Issue mit zugewiesenem Team. Die Entfesselung produzierte die Diagnose; die Teams produzieren den Fix.

**Bei Fehler:** Wenn die Team-Komposition nicht zum Problem passt, neu zuweisen. Shapeshifter-Agents koennen recherchieren und entwerfen aber haben keine Schreib-Tools — der Team-Lead muss ihre Code-Vorschlaege anwenden.

## Validierung

- [ ] Alle verfuegbaren Agents wurden konsultiert (oder ein absichtliches Subset wurde mit Begruendung gewaehlt)
- [ ] Antworten wurden in einem strukturierten, parsebaren Format gesammelt
- [ ] Hypothesen wurden dedupliziert und nach unabhaengiger Konvergenz rangiert
- [ ] Die Top-Hypothese wurde gegen ein Null-Modell oder programmatischen Test verifiziert
- [ ] Ein adversarialer Pass forderte den Konsens heraus
- [ ] Die finale Hypothese enthaelt testbare Vorhersagen und bekannte Beschraenkungen

## Haeufige Stolperfallen

- **Zu wenige Beispiele im Brief**: Agents brauchen 5+ Beispiele um Muster zu finden. Mit 3 Beispielen greifen die meisten Agents auf Oberflaechen-Muster-Matching oder Template-Echo zurueck (den Brief in unterschiedlichen Worten zurueckwiederholen).
- **Kein Verifikations-Pfad**: Ohne einen Weg Hypothesen zu testen kann man Signal nicht von Rauschen unterscheiden. Konvergenz allein ist notwendig aber nicht ausreichend.
- **Metaphorische Antworten**: Domaenen-Spezialisten-Agents (mystic, shaman, kabalist) koennen mit reichem metaphorischem Reasoning antworten das schwer programmatisch zu parsen ist. "Druecke deine Hypothese als testbare Formel oder Algorithmus aus" im Ausgabe-Template einbeziehen.
- **Wiederentdeckung ueber Wellen**: Ohne Inter-Wellen-Wissens-Injektion entdecken Wellen 3-7 unabhaengig wieder was Wellen 1-2 bereits gefunden haben. Den Brief immer zwischen Wellen aktualisieren.
- **Konvergenz ueberinterpretieren**: 43% Konvergenz auf eine Mechanismus-Familie klingt beeindruckend, aber die Basis-Rate pruefen. Wenn es nur 3 plausible Mechanismus-Familien gibt, waere zufaellige Konvergenz ~33%.
- **Single-Familien-Dominanz erwarten**: Abstrakte Probleme (Mustererkennung, Kryptografie) tendieren dazu eine dominante Hypothesen-Familie zu produzieren. Multi-dimensionale Probleme (Codebasis-Analyse, System-Design) produzieren breitere Konvergenz ueber mehrere gueltige Familien — das ist erwartet und gesund, kein Versagen des Musters.
- **Generische Rahmung fuer nicht-technische Agents**: Die Qualitaet des Beitrags eines nicht-technischen Agents haengt davon ab wie der Brief das Problem in seiner Domaenen-Sprache rahmt. "Was sagt deine Tradition ueber Systeme an dieser Schwelle?" produziert strukturelle Erkenntnis; ein generischer Brief produziert nichts. In domaenen-spezifische Rahmung fuer Agents ausserhalb der natuerlichen Domaene des Problems investieren.
- **Dies fuer Ausfuehrung nutzen**: Dieses Muster generiert Hypothesen, keine Implementationen. Sobald verifizierte Hypothesen vorliegen, sie zu Issues konvertieren und an Teams uebergeben (Schritt 8). Die Pipeline ist Entfesseln → Triagieren → Team-pro-Issue.

## Verwandte Skills

- `forage-solutions` — Ameisenkolonie-Optimierung zum Erkunden von Loesungsraeumen (komplementaer: engerer Scope, tiefere Erkundung)
- `build-coherence` — Bienen-Demokratie zur Auswahl unter konkurrierenden Ansaetzen (nach diesem Skill nutzen um zwischen Top-Hypothesen zu waehlen)
- `coordinate-reasoning` — stigmergische Koordination zum Verwalten von Informationsfluss zwischen Agents
- `coordinate-swarm` — breitere Schwarm-Koordinations-Muster fuer verteilte Systeme
- `expand-awareness` — offene Wahrnehmung vor Verengung (komplementaer: als individuelle Agent-Vorbereitung nutzen)
- `meditate` — Kontext-Rauschen vor Start klaeren (empfohlen vor Schritt 1)
