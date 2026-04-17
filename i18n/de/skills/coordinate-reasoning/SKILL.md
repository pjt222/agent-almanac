---
name: coordinate-reasoning
description: >
  KI-interne Koordination mittels stigmergischer Signale — Verwaltung von
  Informationsfrische im Kontext und Gedaechtnis, Verfallsraten fuer
  Annahmenveralterung und emergentes kohaerentes Verhalten aus einfachen
  lokalen Protokollen. Verwenden bei komplexen Aufgaben, bei denen mehrere
  Teilaufgaben koordiniert werden muessen, wenn der Kontext lang geworden
  ist und die Informationsfrische unsicher ist, nach Kontextkompression
  wenn Informationen verloren gegangen sein koennten, oder wenn
  Teilaufgaben-Ergebnisse sauber ineinander greifen muessen ohne
  Qualitaetsverlust.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coordination, stigmergy, context-management, information-decay, ai-self-application
  locale: de
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Argumentation koordinieren

Die interne Koordination von Denkprozessen mittels stigmergischer Prinzipien verwalten — den Kontext als Umgebung behandeln, in der Informationssignale Frische, Verfallsraten und Interaktionsregeln haben, die aus einfachen lokalen Protokollen kohaerentes Verhalten erzeugen.

## Wann verwenden

- Bei komplexen Aufgaben, bei denen mehrere Teilaufgaben koordiniert werden muessen (Multi-Datei-Bearbeitungen, mehrstufiges Refactoring)
- Wenn der Kontext lang geworden ist und die Informationsfrische unsicher ist
- Nach Kontextkompression, wenn einige Informationen verloren gegangen sein koennten
- Wenn Teilaufgaben-Ergebnisse sauber ineinander greifen muessen
- Wenn fruehere Denkergebnisse ohne Qualitaetsverlust weitergefuehrt werden muessen
- Ergaenzend zu `forage-solutions` (Exploration) und `build-coherence` (Entscheidung) mit Ausfuehrungskoordination

## Eingaben

- **Erforderlich**: Aktuelle Aufgabenzerlegung (welche Teilaufgaben existieren und wie haengen sie zusammen?)
- **Optional**: Bekannte Bedenken zur Informationsfrische (z.B. "Ich habe diese Datei vor 20 Nachrichten gelesen")
- **Optional**: Teilaufgaben-Abhaengigkeitskarte (welche Teilaufgaben speisen in welche?)
- **Optional**: Verfuegbare Koordinationswerkzeuge (MEMORY.md, Aufgabenliste, Inline-Notizen)

## Vorgehensweise

### Schritt 1: Das Koordinationsproblem klassifizieren

Verschiedene Koordinationsherausforderungen erfordern verschiedene Signaldesigns.

```
AI Coordination Problem Types:
┌─────────────────────┬──────────────────────────────────────────────────┐
│ Type                │ Characteristics                                  │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Foraging            │ Multiple independent searches running in         │
│ (scattered search)  │ parallel or sequence. Coordination need: share   │
│                     │ findings, avoid duplicate work, converge on      │
│                     │ best trail                                       │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Consensus           │ Multiple approaches evaluated, one must be       │
│ (competing paths)   │ selected. Coordination need: independent         │
│                     │ evaluation, unbiased comparison, commitment      │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Construction        │ Building a complex output incrementally (multi-  │
│ (incremental build) │ file edit, long document). Coordination need:    │
│                     │ consistency across parts, progress tracking,     │
│                     │ dependency ordering                              │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Defense             │ Maintaining quality under pressure (tight time,  │
│ (quality under      │ complex requirements). Coordination need:        │
│ pressure)           │ monitoring for errors, rapid correction,         │
│                     │ awareness of degradation                         │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Division of labor   │ Task decomposed into sub-tasks with              │
│ (sub-task mgmt)     │ dependencies. Coordination need: ordering,       │
│                     │ handoff, result integration                      │
└─────────────────────┴──────────────────────────────────────────────────┘
```

Die aktuelle Aufgabe klassifizieren. Die meisten komplexen Aufgaben sind Construction oder Division of Labor; die meisten Debugging-Aufgaben sind Foraging; die meisten Design-Entscheidungen sind Consensus.

**Erwartet:** Eine klare Klassifikation, die bestimmt, welche Koordinationssignale zu verwenden sind. Die Klassifikation sollte dazu passen, wie sich die Aufgabe tatsaechlich anfuehlt, nicht wie sie beschrieben wurde.

**Bei Fehler:** Wenn die Aufgabe mehrere Typen umfasst (haeufig bei grossen Aufgaben), den dominanten Typ fuer die aktuelle Phase identifizieren. Construction waehrend der Implementierung, Foraging waehrend des Debuggings, Consensus waehrend des Designs. Der Typ kann sich im Aufgabenverlauf aendern.

### Schritt 2: Kontextsignale entwerfen

Informationen im Gespraechskontext als Signale mit Frische- und Verfallseigenschaften behandeln.

```
Information Decay Rate Table:
┌───────────────────────────┬──────────┬──────────────────────────────┐
│ Information Source        │ Decay    │ Refresh Action               │
│                           │ Rate     │                              │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ User's explicit statement │ Slow     │ Re-read if >30 messages ago  │
│ (direct instruction)      │          │ or after compression         │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ File contents read N      │ Moderate │ Re-read if file may have     │
│ messages ago              │          │ been modified, or if >15     │
│                           │          │ messages since reading        │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Own earlier reasoning     │ Fast     │ Re-derive rather than trust. │
│ (conclusions, plans)      │          │ Earlier reasoning may have   │
│                           │          │ been based on now-stale info  │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Inferred facts (not       │ Very     │ Verify before relying on.    │
│ directly stated or read)  │ fast     │ Inferences compound error    │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ MEMORY.md / CLAUDE.md     │ Very     │ Loaded at session start,     │
│ (persistent context)      │ slow     │ treat as stable unless user  │
│                           │          │ indicates changes             │
└───────────────────────────┴──────────┴──────────────────────────────┘
```

Zusaetzlich Inhibitionssignale entwerfen — Markierungen fuer versuchte und gescheiterte Ansaetze:

- Nach einem gescheiterten Tool-Aufruf: den Fehlermodus notieren (verhindert erneutes Versuchen desselben Aufrufs)
- Nach einem verworfenen Ansatz: den Grund notieren (verhindert erneutes Aufgreifen ohne neue Erkenntnisse)
- Nach einer Benutzerkorrektur: den Fehler notieren (verhindert Wiederholung des Fehlers)

**Erwartet:** Ein mentales Modell der Informationsfrische im aktuellen Kontext. Identifikation, welche Informationen frisch sind und welche vor der Nutzung aufgefrischt werden muessen.

**Bei Fehler:** Wenn die Informationsfrische schwer einzuschaetzen ist, standardmaessig "vor der Nutzung erneut lesen" fuer alles, was nicht in den letzten 5-10 Aktionen verifiziert wurde. Ueberfluessiges Auffrischen verschwendet etwas Aufwand, verhindert aber Fehler durch veraltete Informationen.

### Schritt 3: Lokale Protokolle definieren

Einfache Regeln aufstellen, wie das Denken bei jedem Schritt vorgehen soll, nur unter Verwendung lokal verfuegbarer Informationen.

```
Local Protocol Rules:
┌──────────────────────┬────────────────────────────────────────────────┐
│ Protocol             │ Rule                                           │
├──────────────────────┼────────────────────────────────────────────────┤
│ Safety               │ Before using a fact, check: when was it last  │
│                      │ verified? If below freshness threshold,        │
│                      │ re-verify before proceeding                    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Response             │ When the user corrects something, update all  │
│                      │ downstream reasoning that depended on the     │
│                      │ corrected fact. Trace the dependency chain    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploitation         │ When a sub-task produces useful output, note  │
│                      │ the output clearly for downstream sub-tasks.  │
│                      │ The note is the trail signal                  │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploration          │ When stuck on a sub-task for >3 actions       │
│                      │ without progress, check under-explored        │
│                      │ channels: different tools, different files,    │
│                      │ different framing                              │
├──────────────────────┼────────────────────────────────────────────────┤
│ Deposit              │ After completing a sub-task, summarize its    │
│                      │ output in 1-2 sentences for future reference. │
│                      │ This deposit serves the next sub-task          │
├──────────────────────┼────────────────────────────────────────────────┤
│ Inhibition           │ Before trying an approach, check: was this    │
│                      │ already tried and failed? If so, what is      │
│                      │ different now that would change the outcome?  │
└──────────────────────┴────────────────────────────────────────────────┘
```

Diese Protokolle sind einfach genug, um bei jedem Schritt ohne wesentlichen Mehraufwand angewendet zu werden.

**Erwartet:** Ein Satz leichtgewichtiger Regeln, die die Koordinationsqualitaet verbessern, ohne die Ausfuehrung zu verlangsamen. Die Regeln sollten sich hilfreich anfuehlen, nicht belastend.

**Bei Fehler:** Wenn die Protokolle sich wie Mehraufwand anfuehlen, auf die zwei wichtigsten fuer den aktuellen Aufgabentyp reduzieren: Safety + Deposit fuer Construction, Safety + Exploration fuer Foraging, Safety + Response fuer Aufgaben mit aktivem Benutzerfeedback.

### Schritt 4: Informationsfrische kalibrieren

Eine aktive Pruefung der Informationsveralterung im aktuellen Kontext durchfuehren.

1. Welche Fakten wurden vor mehr als N Nachrichten festgestellt? Auflisten
2. Fuer jeden: wurde er seitdem aktualisiert, widersprochen oder irrelevant?
3. Auf Kontextkomprimierungsverluste pruefen: gibt es Informationen, an die man sich erinnert, die aber im sichtbaren Kontext nicht mehr zu finden sind?
4. Auf Abdrift zwischen fruehen Plaenen und aktueller Ausfuehrung pruefen: hat sich der Ansatz geaendert, ohne den Plan zu aktualisieren?
5. Die 2-3 kritischsten Fakten erneut verifizieren (diejenigen, von denen die meiste nachgelagerte Argumentation abhaengt)

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**Erwartet:** Ein konkretes Inventar der Informationsfrische mit identifizierten veralteten Elementen zur Auffrischung. Mindestens ein Fakt erneut verifiziert — wenn nichts aufgefrischt werden musste, war die Pruefung zu oberflaechlich oder der Kontext ist tatsaechlich frisch.

**Bei Fehler:** Wenn die Pruefung erheblichen Informationsverlust aufdeckt (mehrere Fakten mit Status "Lost" oder "Unknown"), ist dies ein Signal, `heal` fuer eine vollstaendige Subsystem-Bewertung auszufuehren. Informationsverlust ueber einem Schwellenwert bedeutet, dass die Koordination auf Fundamentalebene beeintraechtigt ist.

### Schritt 5: Emergente Kohaerenz testen

Sicherstellen, dass die Teilaufgaben in Kombination ein kohaerentes Ganzes ergeben.

1. Speist sich jedes Teilaufgaben-Ergebnis sauber in das naechste? Oder gibt es Luecken, Widersprueche oder nicht uebereinstimmende Annahmen?
2. Bauen Tool-Aufrufe auf das Ziel hin oder sind sie repetitiv (dieselbe Datei erneut lesen, dieselbe Suche erneut ausfuehren)?
3. Ist die Gesamtrichtung noch auf die Anfrage des Benutzers ausgerichtet? Oder hat sich inkrementelle Abdrift zu erheblicher Fehlausrichtung angehaeuft?
4. Stresstest: Wenn eine Schluesselannahme falsch ist, wie viel der Arbeit kaskadiert? Hohe Kaskade = fragile Koordination. Niedrige Kaskade = robuste Koordination

```
Coherence Test:
┌────────────────────────────────────┬─────────────────────────────────┐
│ Check                              │ Result                          │
├────────────────────────────────────┼─────────────────────────────────┤
│ Sub-task outputs compatible?       │ Yes / No / Partially            │
│ Tool calls non-redundant?          │ Yes / No (list repeats)         │
│ Direction aligned with request?    │ Yes / Drifted (describe)        │
│ Single-assumption cascade risk?    │ Low / Medium / High             │
└────────────────────────────────────┴─────────────────────────────────┘
```

**Erwartet:** Eine konkrete Bewertung der Gesamtkohaerenz mit spezifisch identifizierten Problemen. Kohaerente Koordination sollte sich anfuehlen wie Teile, die ineinandergreifen; inkohaerente Koordination fuehlt sich an wie Puzzleteile, die erzwungen werden.

**Bei Fehler:** Wenn die Kohaerenz schlecht ist, den spezifischen Punkt identifizieren, an dem Teilaufgaben divergieren. Oft ist es eine einzelne veraltete Annahme oder eine unverarbeitete Benutzerkorrektur, die sich durch nachgelagerte Arbeit fortgepflanzt hat. Den Divergenzpunkt beheben, dann nachgelagerte Ergebnisse erneut verifizieren.

## Validierung

- [ ] Koordinationsproblem nach Typ klassifiziert
- [ ] Informationsverfallsraten fuer verwendete Fakten beruecksichtigt
- [ ] Lokale Protokolle angewendet (insbesondere Safety und Deposit)
- [ ] Frische-Pruefung hat veraltete Informationen identifiziert (oder Frische mit Belegen bestaetigt)
- [ ] Emergente Kohaerenz ueber Teilaufgaben hinweg getestet
- [ ] Inhibitionssignale respektiert (versuchte und gescheiterte Ansaetze nicht wiederholt)

## Haeufige Stolperfallen

- **Signale ueberentwickeln**: Komplexe Koordinationsprotokolle verlangsamen die Arbeit mehr als sie helfen. Mit Safety + Deposit beginnen; weitere nur bei auftretenden Problemen hinzufuegen
- **Veraltetem Kontext vertrauen**: Der haeufigste Koordinationsfehler ist das Vertrauen auf Informationen, die vor 20 Nachrichten stimmten, aber seitdem aktualisiert oder ungueltig wurden. Im Zweifel erneut lesen
- **Inhibitionssignale ignorieren**: Einen gescheiterten Ansatz ohne Aenderung erneut zu versuchen ist keine Ausdauer — es ist das Ignorieren des Fehlersignals. Etwas muss anders sein, damit ein erneuter Versuch Erfolg hat
- **Keine Deposits**: Teilaufgaben abschliessen, ohne deren Ergebnisse zu notieren, zwingt spaetere Teilaufgaben zur erneuten Ableitung oder erneutem Lesen. Kurze Zusammenfassungen sparen erheblichen Mehraufwand
- **Kohaerenz annehmen**: Nicht testen, ob Teilaufgaben tatsaechlich ein kohaerentes Ganzes ergeben. Jede Teilaufgabe kann einzeln korrekt, aber kollektiv inkoharent sein — die Integration ist der Punkt, an dem Koordination scheitert

## Verwandte Skills

- `coordinate-swarm` — Das Multi-Agenten-Koordinationsmodell, das dieser Skill fuer die Einzelagenten-Argumentation adaptiert
- `forage-solutions` — Koordiniert Exploration ueber mehrere Hypothesen
- `build-coherence` — Koordiniert Bewertung ueber konkurrierende Ansaetze
- `heal` — Tiefere Bewertung, wenn Koordinationsfehler Subsystem-Abdrift aufdecken
- `awareness` — Ueberwacht Signale fuer Koordinationszusammenbruch waehrend der Ausfuehrung
