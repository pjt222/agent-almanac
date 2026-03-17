---
name: argumentation
description: >
  Konstruiert gut strukturierte Argumente mithilfe der Hypothese-Argument-Beispiel-
  Triade. Behandelt die Formulierung falsifizierbarer Hypothesen, den Aufbau
  logischer Argumente (deduktiv, induktiv, analogisch, evidenzbasiert), die
  Bereitstellung konkreter Beispiele und das Stahlmann-artige Auseinandersetzen
  mit Gegenargumenten. Verwenden beim Schreiben oder Pruefen von PR-Beschreibungen
  die technische Aenderungen vorschlagen, beim Begruenden von Entwurfsentscheidungen
  in ADRs, beim Konstruieren substantieller Code-Review-Rueckmeldungen oder beim
  Aufbauen eines Forschungsarguments oder technischen Vorschlags.
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
  tags: argumentation, reasoning, hypothesis, logic, rhetoric, critical-thinking
---

# Argumente konstruieren

Rigorose Argumente von der Hypothese ueber das Reasoning bis zu konkreten Belegen aufbauen. Jede ueberzeugende technische Behauptung folgt derselben Triade: Eine klare Hypothese beschreibt *was* man glaubt, ein Argument erklaert *warum* es gilt, und Beispiele beweisen *dass* es gilt. Dieser Skill lehrt, diese Struktur auf Code-Reviews, Entwurfsentscheidungen, Forschungsschreiben und jeden Kontext anzuwenden, in dem Behauptungen einer Begruendung beduerfen.

## Wann verwenden

- Schreiben oder Pruefen einer PR-Beschreibung, die eine technische Aenderung vorschlaegt
- Begruenden einer Entwurfsentscheidung in einem ADR (Architecture Decision Record)
- Konstruieren von Rueckmeldungen in einem Code-Review, der ueber "Ich mag das nicht" hinausgeht
- Schreiben eines Forschungsarguments oder technischen Vorschlags
- Anfechten oder Verteidigen eines Ansatzes in einer technischen Diskussion

## Eingaben

- **Erforderlich**: Eine Behauptung oder Position, die einer Begruendung bedarf
- **Erforderlich**: Kontext (Code-Review, Entwurfsentscheidung, Forschung, Dokumentation)
- **Optional**: Zielgruppe (Peer-Entwickler, Reviewer, Stakeholder, Forscher)
- **Optional**: Gegenargumente oder alternative Positionen, die anzusprechen sind
- **Optional**: Verfuegbare Beweise oder Daten zur Untermauerung der Behauptung

## Vorgehensweise

### Schritt 1: Die Hypothese formulieren

Die Behauptung als klare, falsifizierbare Hypothese formulieren. Eine Hypothese ist keine Meinung oder Praeferenz -- es ist eine spezifische Behauptung, die anhand von Beweisen getestet werden kann.

1. Die Behauptung in einem Satz schreiben
2. Den Falsifizierbarkeitstests anwenden: kann jemand dies mit Beweisen widerlegen?
3. Eng begrenzen: auf einen spezifischen Kontext, eine Codebasis oder eine Domain einschraenken
4. Von Meinungen unterscheiden, indem auf pruefbare Kriterien geprueft wird

**Falsifizierbar vs. nicht falsifizierbar:**

| Nicht falsifizierbar (Meinung) | Falsifizierbar (Hypothese) |
|--------------------------------|---------------------------|
| "Dieser Code ist schlecht" | "Diese Funktion hat O(n^2)-Komplexitaet, wo O(n) erreichbar waere" |
| "Wir sollten TypeScript verwenden" | "TypeScripts Typsystem wird die Klasse von Null-Referenz-Bugs abfangen, die 4 von 6 unserer letzten Produktionsvorfaelle verursacht haben" |
| "Das API-Design ist sauberer" | "Das Ersetzen der 5 Endpunkt-Varianten durch einen einzigen parametrisierten Endpunkt reduziert die oeffentliche API-Oberflaeche um 60%" |
| "Dieser Forschungsansatz ist besser" | "Methode A erreicht hoehere Praezision als Methode B auf Datensatz X auf dem 95%-Konfidenzniveau" |

**Erwartet:** Eine einzeilige Hypothese, die spezifisch, eingegrenzt und falsifizierbar ist. Jemand, der sie liest, kann sich sofort vorstellen, welche Beweise sie bestaetigen oder widerlegen wuerden.

**Bei Fehler:** Falls die Hypothese vage wirkt, den Test "Wie wuerde ich das widerlegen?" anwenden. Falls keine Gegenbeweis vorstellbar ist, ist die Behauptung eine Meinung, keine Hypothese. Den Umfang einengen oder messbare Kriterien hinzufuegen, bis sie pruefbar ist.

### Schritt 2: Den Argumenttyp identifizieren

Die logische Struktur auswaehlen, die die Hypothese am besten unterstuetzt. Verschiedene Behauptungen erfordern verschiedene Reasoning-Strategien.

1. Die vier Argumenttypen pruefen:

| Typ | Struktur | Am besten fuer |
|-----|---------|----------------|
| Deduktiv | Wenn A dann B; A ist wahr; daher B | Formale Beweise, Typsicherheitsbehauptungen |
| Induktiv | Beobachtetes Muster ueber N Faelle; daher wahrscheinlich allgemein | Performance-Daten, Testergebnisse |
| Analogisch | X ist Y in relevanter Hinsicht aehnlich; Y hat Eigenschaft P; daher hat X wahrscheinlich P | Entwurfsentscheidungen, Technologieauswahl |
| Evidenzbasiert | Beweis E ist unter Hypothese H1 wahrscheinlicher als H2; daher wird H1 unterstuetzt | Forschungsergebnisse, A/B-Testergebnisse |

2. Die Hypothese dem staerksten Argumenttyp zuordnen:
   - Behauptet etwas *muss* wahr sein? **Deduktiv** verwenden
   - Behauptet etwas *neigt* dazu wahr zu sein basierend auf Beobachtungen? **Induktiv** verwenden
   - Behauptet etwas *wird wahrscheinlich funktionieren* basierend auf aehnlichen Vorfaellen? **Analogisch** verwenden
   - Behauptet eine Erklaerung *passt besser zu den Daten* als Alternativen? **Evidenzbasiert** verwenden

3. Typen fuer staerkere Argumente kombinieren (z.B. analogisches Reasoning durch induktive Beweise unterstuetzt)

**Erwartet:** Ein gewahlter Argumenttyp (oder eine Kombination) mit einer klaren Begruendung, warum er zur Hypothese passt.

**Bei Fehler:** Falls kein einzelner Typ sauber passt, muss die Hypothese moeglicherweise in Teilbehauptungen aufgeteilt werden. Sie in Teile aufteilen, die jeweils eine natuerliche Argumentstruktur haben.

### Schritt 3: Das Argument konstruieren

Die logische Kette aufbauen, die die Hypothese mit ihrer Begruendung verbindet.

1. Die Praemissen formulieren (Fakten oder Annahmen, von denen ausgegangen wird)
2. Die logische Verbindung zeigen (wie Praemissen zur Schlussfolgerung fuehren)
3. Das staerkste Gegenargument "stahlmaezig" formulieren: den besten Gegenfall *vor* der Widerlegung darlegen
4. Das Gegenargument direkt mit Beweisen oder Reasoning ansprechen

**Gearbeitetes Beispiel -- Code-Review (deduktiv + induktiv):**

> **Hypothese**: "Das Extrahieren der Validierungslogik in ein gemeinsames Modul wird Bug-Duplikation ueber die drei API-Handler hinweg reduzieren."
>
> **Praemissen**:
> - Die drei Handler (`createUser`, `updateUser`, `deleteUser`) implementieren jeweils dieselbe Eingabevalidierung mit leichten Variationen (in `src/handlers/` beobachtet)
> - In den letzten 6 Monaten wurden 3 von 5 Validierungs-Bugs in einem Handler behoben, aber nicht auf die anderen uebertragen (siehe Issues #42, #57, #61)
> - Gemeinsame Module erzwingen eine einzige Wahrheitsquelle fuer Logik (deduktiv: wenn eine Implementierung, dann ein Ort zum Beheben)
>
> **Logische Kette**: Da die drei Handler dieselbe Validierung duplizieren (Praemisse 1), werden in einem Handler behobene Bugs in anderen uebersehen (Praemisse 2, induktiv aus 3/5 Faellen). Ein gemeinsames Modul bedeutet, Korrekturen gelten einmal fuer alle Aufrufer (deduktiv aus gemeinsamer Modulsemantik). Daher wird Extraktion Bug-Duplikation reduzieren.
>
> **Gegenargument (stahlmaessig)**: "Gemeinsame Module fuehren Kopplung ein -- eine Aenderung der Validierung fuer einen Handler koennte die anderen beeintraechigen."
>
> **Widerlegung**: Die Handler teilen bereits identische Validierungs-*Absicht*; die Kopplung ist implizit und schwieriger zu warten. Sie durch ein gemeinsames Modul mit parametrisierten Optionen explizit zu machen (z.B. `validate(input, { requireEmail: true })`) macht die Kopplung sichtbar und testbar. Die aktuelle implizite Duplikation ist riskanter, weil sie die Abhaengigkeit verbirgt.

**Erwartet:** Eine vollstaendige Argumentkette mit Praemissen, logischer Verbindung, einem stahlmaessigen Gegenargument und einer Widerlegung. Der Leser kann dem Reasoning Schritt fuer Schritt folgen.

**Bei Fehler:** Falls das Argument schwach wirkt, die Praemissen pruefen. Schwache Argumente entstehen meist aus ungestuetzten Praemissen, nicht aus fehlerhafter Logik. Beweise fuer jede Praemisse finden oder sie als Annahme anerkennen. Falls das Gegenargument staerker ist als die Widerlegung, muss die Hypothese moeglicherweise ueberarbeitet werden.

### Schritt 4: Konkrete Beispiele bereitstellen

Das Argument mit unabhaengig pruefbaren Belegen unterstuetzen. Beispiele sind keine Illustrationen -- sie sind die empirische Grundlage, die das Argument pruefbar macht.

1. Mindestens ein **positives Beispiel** bereitstellen, das die Hypothese bestaetigt
2. Mindestens ein **Randfall- oder Grenzbeispiel** bereitstellen, das Grenzen testet
3. Sicherstellen, dass jedes Beispiel **unabhaengig pruefbar** ist: eine andere Person kann es reproduzieren oder pruefen, ohne auf die eigene Interpretation angewiesen zu sein
4. Fuer Code-Behauptungen auf spezifische Dateien, Zeilennummern oder Commits verweisen
5. Fuer Forschungsbehauptungen spezifische Paper, Datensaetze oder experimentelle Ergebnisse zitieren

**Beispielauswahlkriterien:**

| Kriterium | Gutes Beispiel | Schlechtes Beispiel |
|-----------|----------------|---------------------|
| Unabhaengig pruefbar | "Issue #42 zeigt, dass der Bug in Handler A aber nicht B behoben wurde" | "Wir haben diese Art von Bug schon mal gesehen" |
| Spezifisch | "`createUser` in Zeile 47 implementiert denselben Regex wie `updateUser` in Zeile 23" | "Es gibt Duplikation in der Codebasis" |
| Repraesentativ | "3 von 5 Validierungs-Bugs in den letzten 6 Monaten folgten diesem Muster" | "Ich habe mal einen aoehnlichen Bug gesehen" |
| Enthalt Randfaelle | "Dieses Muster gilt fuer String-Eingaben, aber nicht fuer Datei-Upload-Validierung, die handler-spezifische Einschraenkungen hat" | (keine Einschraenkungen erwaehnt) |

**Erwartet:** Konkrete Beispiele, die ein Leser unabhaengig pruefen kann. Mindestens ein positives und ein Randfall-Beispiel. Jedes verweist auf ein spezifisches Artefakt (Datei, Zeile, Issue, Paper, Datensatz).

**Bei Fehler:** Falls Beispiele schwer zu finden sind, ist die Hypothese moeglicherweise zu breit oder nicht in beobachtbarer Realitaet verankert. Den Umfang auf das einengen, was tatsaechlich referenziert werden kann. Das Fehlen von Beispielen ist ein Signal, keine Luecke, die mit vagen Verweisen ueberbrueckt werden sollte.

### Schritt 5: Das vollstaendige Argument zusammenstellen

Hypothese, Argument und Beispiele in das angemessene Format fuer den Kontext kombinieren.

1. **Fuer Code-Reviews** -- den Kommentar strukturieren als:
   ```
   [S] <einzeilige Zusammenfassung des Vorschlags>

   **Hypothese**: <was man glaubt sich aendern sollte und warum>

   **Argument**: <der logische Fall, mit Praemissen>

   **Beweis**: <spezifische Dateien, Zeilen, Issues oder Metriken>

   **Vorschlag**: <konkrete Code-Aenderung oder Ansatz>
   ```

2. **Fuer PR-Beschreibungen** -- den Hauptteil strukturieren als:
   ```markdown
   ## Warum

   <Hypothese: welches Problem dies loest und die spezifische Verbesserungsbehauptung>

   ## Ansatz

   <Argument: warum dieser Ansatz gegenueber Alternativen gewaehlt wurde>

   ## Beweis

   <Beispiele: Benchmarks, Bug-Verweise, Vorher/Nachher-Vergleiche>
   ```

3. **Fuer ADRs (Architecture Decision Records)** -- das Standard-ADR-Format verwenden mit der Triade, die auf Kontext (Hypothese), Entscheidung (Argument) und Konsequenzen (Beispiele/Beweis erwarteter Ergebnisse) abgebildet wird

4. **Fuer Forschungsschreiben** -- auf Standardstruktur abbilden: Einfuehrung formuliert die Hypothese, Methoden/Ergebnisse liefern Argument und Beispiele, Diskussion adressiert Gegenargumente

5. Das zusammengestellte Argument pruefen auf:
   - Logische Luecken (folgt die Schlussfolgerung tatsaechlich aus den Praemissen?)
   - Fehlende Beweise (gibt es ungestuetzte Praemissen?)
   - Unadressierte Gegenargumente (wird der staerkste Einwand beantwortet?)
   - Umfangs-Creep (bleibt das Argument innerhalb der Hypothesengrenzen?)

**Erwartet:** Ein vollstaendiges, fuer den Kontext geeignet formatiertes Argument. Der Leser kann die Hypothese bewerten, dem Reasoning folgen, die Beweise pruefen und Gegenargumente abwaegen -- alles in einer kohaerenten Struktur.

**Bei Fehler:** Falls das zusammengestellte Argument zusammenhangslos wirkt, ist die Hypothese moeglicherweise zu breit. In fokussierte Teilargumente aufteilen, jedes mit seiner eigenen Hypothese-Argument-Beispiel-Triade. Zwei enge Argumente sind staerker als eines weitschweifiges.

## Validierung

- [ ] Hypothese ist falsifizierbar (jemand koennte sie mit Beweisen widerlegen)
- [ ] Hypothese ist auf einen spezifischen Kontext eingegrenzt, keine universelle Behauptung
- [ ] Argumenttyp ist identifiziert und angemessen fuer die Behauptung
- [ ] Praemissen sind explizit formuliert, nicht als geteiltes Wissen angenommen
- [ ] Logische Kette verbindet Praemissen mit der Schlussfolgerung ohne Luecken
- [ ] Staerkstes Gegenargument wird "stahlmaessig" formuliert und adressiert
- [ ] Mindestens ein positives Beispiel unterstuetzt die Hypothese
- [ ] Mindestens ein Randfall oder eine Einschraenkung ist anerkannt
- [ ] Alle Beispiele sind unabhaengig pruefbar (Referenzen bereitgestellt)
- [ ] Ausgabeformat entspricht dem Kontext (Code-Review, PR, ADR, Forschung)
- [ ] Keine logischen Trugschluesse (Autoritaetsargument, falsche Dichotomie, Strohmann)

## Haeufige Stolperfallen

- **Meinungen als Hypothesen formulieren**: "Dieser Code ist unordentlich" ist eine Praeferenz, keine Hypothese. Als pruefbare Behauptung umformulieren: "Dieses Modul hat 4 Verantwortlichkeiten, die laut dem Single-Responsibility-Prinzip getrennt werden sollten, wie durch seine 6 oeffentlichen Methoden in 3 unverwandten Domains belegt."
- **Gegenargument uebergehen**: Unbehandelte Einwaende schwaerchen das Argument, auch wenn der Leser sie nie ausspricht. Immer "stahlmaessig" vorgehen -- den staerksten Gegenfall in seiner besten Form darstellen, bevor er widerlegt wird.
- **Vage Beispiele**: "Wir haben dieses Muster schon gesehen" ist kein Beweis. Auf spezifische Issues, Commits, Zeilen, Paper oder Datensaetze verweisen. Falls kein konkretes Beispiel gefunden werden kann, ist die Hypothese moeglicherweise nicht gut begruendet.
- **Autoritaetsargument**: "Der leitende Ingenieur hat es gesagt" oder "Google macht es so" ist kein logisches Argument. Autoritaet kann Untersuchungen *motivieren*, aber das Argument muss auf eigenen Beweisen und eigenem Reasoning beruhen.
- **Umfangs-Creep in Schlussfolgerungen**: Breitere Schlussfolgerungen ziehen als die Beweise stuetzen. Falls Beispiele 3 API-Handler abdecken, nicht ueber die gesamte Codebasis schlussfolgern. Schlussfolgerungsumfang dem Beweisumfang anpassen.
- **Argumenttypen vermischen**: Induktive Sprache ("neigt zu") fuer deduktive Behauptungen ("muss sein") oder umgekehrt verwenden. Praezise ueber die Staerke der Schlussfolgerung sein -- deduktive Argumente geben Gewissheit, induktive Argumente geben Wahrscheinlichkeit.

## Verwandte Skills

- `review-pull-request` -- Argumentation auf strukturiertes Code-Review-Feedback anwenden
- `review-research` -- evidenzbasierte Argumente in Forschungskontexten konstruieren
- `review-software-architecture` -- Architekturentscheidungen mit der Hypothese-Argument-Beispiel-Triade begruenden
- `create-skill` -- Skills selbst sind strukturierte Argumente dafuer, wie eine Aufgabe zu erledigen ist
- `write-claude-md` -- Konventionen und Entscheidungen dokumentieren, die von klarer Begruendung profitieren
