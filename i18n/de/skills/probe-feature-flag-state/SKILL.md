---
name: probe-feature-flag-state
description: >
  Den Laufzeitzustand eines benannten Feature-Flags in einem CLI-Binary
  prüfen. Behandelt das vierzweigige Evidenzprotokoll (Binary-Strings,
  Live-Aufruf, On-Disk-Zustand, Plattform-Cache), die vier Zustands-
  klassen (LIVE / DARK / INDETERMINATE / UNKNOWN), die Unterscheidung
  Gate vs. Event, den Umgang mit Konjunktions-Gates sowie Skill-
  Substitutionsszenarien, in denen ein Flag DARK erscheint, die Fähigkeit
  aber auf anderem Wege bereitgestellt wird. Einzusetzen, wenn geprüft
  werden soll, ob eine dokumentierte oder inferierte Fähigkeit ausgerollt
  ist, wenn dunkel ausgerollte Features auditiert werden oder wenn die
  Schlussfolgerungen einer früheren Prüfung an einer neuen Binary-Version
  aufgefrischt werden müssen.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, dark-launch, classification, evidence
  locale: de
  source_locale: en
  source_commit: f74b59bd
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# Probe Feature-Flag State

Bestimmen, ob ein benanntes Feature-Flag in einem ausgelieferten CLI-Binary LIVE, DARK, INDETERMINATE oder UNKNOWN ist, mittels eines vierzweigigen Evidenzprotokolls, das jede Zustandsaussage mit einer konkreten Beobachtung paart.

## Wann verwenden

- Eine Fähigkeit wird gerüchtehalber, in der Dokumentation oder durch Inferenz angenommen, und es muss geprüft werden, ob das Gate für die laufende Sitzung tatsächlich feuert.
- Es werden dunkel ausgerollte Features auditiert — Code, der im Bundle ausgeliefert, aber abgeschaltet ist —, um Integrationen verantwortungsvoll zu planen.
- Die Schlussfolgerungen einer früheren Prüfung müssen an einer neuen Binary-Version aufgefrischt werden (das Flag kann geflippt, entfernt oder in eine Konjunktion eingegangen sein).
- Phase-1-Marker (`monitor-binary-version-baselines`) werden nachverfolgt, und jedes Kandidaten-Flag muss vor dem Übergang zu Phase-4-Wire-Capture hinsichtlich seines Rollout-Zustands klassifiziert werden.
- Ein für Nutzer sichtbares Verhalten hat sich geändert, und es muss geklärt werden, ob ein Flag-Flip oder eine Codeänderung die Ursache war.

## Eingaben

- **Erforderlich**: der Flag-Name in der Form, wie er im Binary erscheint (String-Literal-Form).
- **Erforderlich**: das CLI-Binary oder die Bundle-Datei, die gelesen und ausgeführt werden kann.
- **Erforderlich**: eine authentifizierte Sitzung gegen das normale Backend des Harness (eigenes Konto; niemals das eines anderen Nutzers).
- **Optional**: die Binary-Versionskennung — dringend empfohlen, damit die Evidenztabelle gegen künftige Prüfungen diff-fähig ist.
- **Optional**: eine Liste verdächtiger Mit-Gates (andere Flag-Namen, die mit diesem in Konjunktion stehen können).
- **Optional**: ein früheres Prüf-Artefakt zum selben Flag in einer anderen Version, für Delta-Analyse.

## Vorgehen

### Schritt 1: Bestätigen, dass der Flag-Name im Binary vorhanden ist (Zweig A — Binary-Strings)

Den Kandidaten-Flag-Namen aus dem Bundle extrahieren, um zu bestätigen, dass er tatsächlich als String-Literal existiert. Ohne diesen Schritt zielen alle späteren Zweige ins Leere.

```bash
# Locate the bundle (common shapes: .js, .mjs, .bun, packaged binary)
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3   # synthetic placeholder — replace with the candidate

# Confirm the literal exists
grep -c "$FLAG" "$BUNDLE"

# Capture every line where it appears, with surrounding context for Step 2
grep -n -C 3 "$FLAG" "$BUNDLE" > /tmp/flag-context.txt
wc -l /tmp/flag-context.txt
```

`/tmp/flag-context.txt` inspizieren und jedes Vorkommen als eines der folgenden taggen:

- **gate-call** — erscheint als erstes Argument einer gate-förmigen Funktion (`gate("$FLAG", default)`, `isEnabled("$FLAG")`, `flag("$FLAG", ...)`).
- **telemetry-call** — erscheint als erstes Argument einer Emit-/Log-/Track-Funktion.
- **env-var-check** — erscheint in einem `process.env.X` (oder Äquivalent).
- **string-table** — erscheint in einer statischen Map oder einem Register, dessen Rolle unklar ist.

**Expected:** mindestens ein Vorkommen des Flag-Strings im Bundle, und jedes Vorkommen mit seiner Aufrufstellen-Rolle getaggt.

**On failure:** liefert `grep -c` 0, ist das Flag nicht in diesem Build. Entweder ist der Eingabename falsch (Tippfehler, falscher Namespace) oder das Flag wurde in dieser Version entfernt. Die Phase-1-Marker-Ausgabe erneut prüfen, dann entweder die Eingabe korrigieren oder als `REMOVED` klassifizieren und anhalten.

### Schritt 2: Gate von Event und Umgebungsvariable unterscheiden

Derselbe String kann als Gate, als Name eines Telemetrie-Ereignisses, als Umgebungsvariable oder alle drei erscheinen. Die Klassifizierung hängt von der Aufrufstelle ab, nicht vom String. Einen Telemetrie-Namen für ein Gate zu halten, erzeugt sinnlose Schlussfolgerungen („dieses Gate muss aus sein") über etwas, das nie ein Gate war.

Für jedes in Schritt 1 getaggte Vorkommen:

- Ein **gate-call**-Vorkommen macht diesen String für die Klassifizierung LIVE / DARK / INDETERMINATE infrage. Den an das Gate übergebenen **Default-Wert** erfassen (`gate("$FLAG", false)` setzt das Flag standardmäßig auf aus; `gate("$FLAG", true)` standardmäßig auf ein). Sowohl den Literal-Default als auch den Gate-Funktionsnamen aufzeichnen.
- Ein **telemetry-call**-Vorkommen macht den String **nicht** zu einem Gate. Es ist ein Label, das ausgelöst wird, nachdem ein anderes Gate bereits passiert wurde. Sind die *einzigen* Vorkommen telemetry-call, ist der String eventbezogen und die finale Klassifizierung lautet `UNKNOWN` (Name vorhanden, aber kein Gate).
- Ein **env-var-check**-Vorkommen deutet üblicherweise auf einen Kill-Switch hin (eine default-aktive Fähigkeit, die per Umgebungsvariable deaktiviert wird) oder auf ein explizites Opt-in (eine default-deaktivierte Fähigkeit, die per Umgebungsvariable aktiviert wird). Die Polarität notieren — `if (process.env.X) { return null; }` ist ein Kill-Switch; `if (process.env.X) { enable(); }` ist ein Opt-in.
- Ein **string-table**-Vorkommen muss querreferenziert werden — prüfen, wie die Tabelle nachgelagert konsumiert wird.

**Expected:** für jedes Vorkommen eine eindeutige Aufrufstellen-Rolle und (für gate-calls) der aufgezeichnete Default-Wert.

**On failure:** ist der umgebende Kontext eines gate-call zu minifiziert, um den Default zu lesen, den grep-Kontext erweitern (`-C 10`) und den vollständigen Callee inspizieren. Lässt sich der Default weiterhin nicht bestimmen, als `default=?` festhalten und jede LIVE/DARK-Schlussfolgerung auf INDETERMINATE herabstufen.

### Schritt 3: Live-Aufrufverhalten beobachten (Zweig B — Laufzeitprüfung)

Den Harness in einer kontrollierten, authentifizierten Sitzung ausführen und beobachten, ob die gegatete Fähigkeit an die Oberfläche kommt. Dies ist der signalstärkste Einzelzweig: das Bundle sagt, was passieren *kann*; die Laufzeit zeigt, was *tatsächlich* passiert.

Eine Prüfaktion wählen, die den Gate-Pass aufdecken würde — typischerweise das nutzersichtbare Verhalten, das das Gate bewacht (ein Werkzeug, das in einer Werkzeugliste erscheint, ein Kommando-Flag, das gültig wird, ein UI-Element, das gerendert wird, ein Ausgabefeld, das in einer Antwort erscheint).

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

Eines von drei Ergebnissen aufzeichnen:

- **gate-pass beobachtet** — die Fähigkeit kam in der Sitzung an die Oberfläche. Klassifizierungskandidat: `LIVE`.
- **gate-pass nicht beobachtet** — die Fähigkeit kam nicht zum Vorschein. Der Klassifizierungskandidat hängt vom Default aus Schritt 2 ab (default-false → `DARK`; default-true → nochmals prüfen, das ist verdächtig).
- **gate-pass abhängig von einer hier nicht reproduzierbaren Eingabe oder Kontextbedingung** — die Bedingung aufzeichnen; Klassifizierungskandidat: `INDETERMINATE`.

**Expected:** eine aufgezeichnete Prüfaktion, das beobachtete Ergebnis und der Klassifizierungskandidat, auf den es hinweist.

**On failure:** fehlschlägt die Prüfaktion selbst (Auth-Fehler, Netzwerk nicht erreichbar, falsches Subkommando), ist der Laufzeitzweig für diese Runde unbrauchbar. Sitzung reparieren oder eine andere Prüfaktion wählen; niemals DARK aus einer Laufzeit herleiten, die nie gelaufen ist.

### Schritt 4: Zustand auf Platte inspizieren (Zweig C — Config, Cache, Sitzung)

Viele Harnesse persistieren Gate-Auswertungen oder Override-Werte auf die Platte, damit sie nicht erneut abgerufen werden müssen. Die Inspektion dieses Zustands zeigt, was der Harness zum letzten Auswertungszeitpunkt über das Flag glaubte.

Gängige Orte (dem Harness anpassen — dies sind Formen, keine konkreten Pfade):

```bash
# User-level config
ls ~/.config/<harness>/ 2>/dev/null
ls ~/.<harness>/ 2>/dev/null

# Per-project state
ls .<harness>/ 2>/dev/null

# Cache directories
ls ~/.cache/<harness>/ 2>/dev/null

# Search any of these for the flag name
grep -r "$FLAG" ~/.config/<harness>/ ~/.cache/<harness>/ .<harness>/ 2>/dev/null
```

Für jeden Treffer Pfad, den mit dem Flag verknüpften Wert und den Zeitstempel der letzten Änderung aufzeichnen. Ein kürzlich modifizierter Cache-Eintrag, der einen Binary-Default überschreibt, ist in beide Richtungen die stärkstmögliche Evidenz.

**Expected:** entweder ein bestätigter Override-Wert mit Zeitstempel oder eine bestätigte Abwesenheit (kein On-Disk-Zustand nennt dieses Flag).

**On failure:** wird das Flag erwähnt, aber es ist unklar, ob der aufgezeichnete Wert eine gecachte Serverantwort, ein Nutzer-Override oder ein veralteter Wert ist, den Eintrag für die Reconciliation in Schritt 5 (Plattform-Cache) markieren, statt zu raten.

### Schritt 5: Plattform-Flag-Service-Cache inspizieren (Zweig D)

Nutzt der Harness einen externen Feature-Flag-Dienst (LaunchDarkly, Statsig, GrowthBook, herstellerintern usw.), ist die lokal gecachte Dienstantwort der autoritative aktuelle Rollout-Zustand. Wo verfügbar, inspizieren.

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

Den gecachten Wert, den Cache-Zeitstempel und (falls vorhanden) die Cache-TTL aufzeichnen. Ein Plattform-Cache, der `false` sagt, überstimmt einen Binary-Default von `true`; ein Plattform-Cache, der `true` sagt, überstimmt einen Binary-Default von `false`.

**Expected:** entweder ein eindeutig gecachter Wert mit Zeitstempel oder eine bestätigte Abwesenheit eines Flag-Service-Caches für diesen Harness.

**On failure:** hat der Harness keinen Flag-Service oder lässt sich der Cache nicht lokalisieren, trägt dieser Zweig nichts bei — das ist akzeptabel. „Zweig D: nicht anwendbar" in der Evidenztabelle vermerken; nicht raten.

### Schritt 6: Konjunktions-Gates behandeln

Einige Fähigkeiten werden durch mehrere Flags bewacht, die alle wahr sein müssen: `gate("A") && gate("B") && gate("C")`. Dass auch nur eines DARK ist, reicht, um die Fähigkeit DARK zu machen, aber die flagspezifische Klassifizierung gehört weiterhin zu jedem Flag einzeln.

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

Für jeden aufgetauchten Mit-Gate-String:

- Schritte 1–5 für dieses Flag wiederholen (jedes als eigene Prüfung behandeln).
- Die flagspezifische Klassifizierung aufzeichnen.
- Die **fähigkeitsebene** Klassifizierung berechnen: LIVE genau dann, wenn alle Konjunkte LIVE sind; DARK, wenn irgendein Konjunkt DARK ist; INDETERMINATE, wenn kein Konjunkt DARK und mindestens eines INDETERMINATE ist.

**Expected:** jedes Konjunkt identifiziert und einzeln klassifiziert, dazu eine abgeleitete Fähigkeitsebenen-Klassifizierung.

**On failure:** ist das Prädikat zu minifiziert, um sauber aufgezählt zu werden (Aufrufstelle inliniert oder verpackt), die Konjunktion als „≥1 zusätzliches Gate, Struktur unlesbar" aufzeichnen und die Fähigkeitsebenen-Klassifizierung auf INDETERMINATE herabstufen, selbst wenn das primäre Flag LIVE aussieht.

### Schritt 7: Auf Skill-Substitution prüfen

Ein Flag kann legitim DARK sein, während die nutzerorientierte Fähigkeit, die es freischalten würde, auf einem anderen, vollständig unterstützten Weg erreichbar ist — ein anderes Kommando, ein vom Nutzer aufrufbarer Skill, eine alternative API. Der ehrliche Befund „Flag DARK, Fähigkeit LIVE via Substitution" ist häufig und wichtig; ihn zu übersehen erzeugt panische Dark-Launch-Berichte über Fähigkeiten, die Nutzer tatsächlich besitzen.

Für jeden Klassifizierungskandidaten DARK oder INDETERMINATE fragen:

- Gibt es ein dokumentiertes, vom Nutzer aufrufbares Kommando, Slash-Kommando oder einen Skill, der das gleiche Endnutzer-Ergebnis liefert?
- Gibt es eine alternative API-Oberfläche (anderer Endpunkt, anderer Tool-Name), die äquivalente Daten liefert?
- Veröffentlicht der Harness eine nutzerorientierte Erweiterungsstelle (Plugins, eigene Werkzeuge, Hooks), mit der Nutzer das Äquivalent selbst zusammensetzen können?

Wenn bei einer dieser Fragen ja, eine `substitution:`-Notiz an der Evidenzzeile anfügen, die den Alternativweg und dessen Beobachtbarkeit aufzeichnet (wie ein Nutzer ihn erreicht, ob er dokumentiert ist).

**Expected:** für jede DARK-/INDETERMINATE-Klassifizierung eine explizite Substitutionsprüfung — entweder der Alternativweg oder die ausdrückliche Notiz „kein Substitutionsweg identifiziert".

**On failure:** besteht der Verdacht auf eine Substitution, ohne dass sich der Weg bestätigen lässt, „Substitution vermutet; nicht bestätigt" festhalten, statt in die eine oder andere Richtung zu behaupten.

### Schritt 8: Evidenztabelle zusammenstellen und finale Klassifizierung

Die vier Zweige zu einer einzigen Tabelle zusammenführen. Jede Zustandsaussage muss mit der sie stützenden Beobachtung gepaart sein; das erneute Ausführen der Prüfung an einer neuen Version erzeugt ein diff-fähiges Artefakt.

| Field | Value |
|---|---|
| Flag | `acme_widget_v3` (synthetic placeholder) |
| Binary version | `<version-id>` |
| Probe date | `YYYY-MM-DD` |
| Prong A — strings | present (3 occurrences: 1 gate-call default=`false`, 2 telemetry) |
| Prong B — runtime | gate-pass not observed in capability list |
| Prong C — on-disk | no override found in `~/.config/<harness>/` |
| Prong D — platform cache | service cache absent / not applicable |
| Conjunction | none — single-gate predicate |
| Substitution | user-invokable `widget` slash command delivers equivalent UX |
| **Final state** | **DARK (capability LIVE via substitution)** |

Die Klassifizierungsregeln anwenden:

- **LIVE** — mindestens ein Zweig hat einen Gate-Pass in dieser Sitzung beobachtet UND kein Zweig widerspricht.
- **DARK** — Flag-String vorhanden, gate-call-Default ist `false`, kein Zweig hat einen Gate-Pass beobachtet, kein Override schaltet es ein.
- **INDETERMINATE** — Gate-Pass hängt von einer Eingabe oder einem Kontext ab, der in dieser Prüfung nicht reproduzierbar ist, ODER der Gate-Default konnte nicht bestimmt werden, ODER ein Konjunkt ist INDETERMINATE.
- **UNKNOWN** — String vorhanden, aber nicht als Gate verwendet (nur Telemetrie, nur String-Tabelle, nur Umgebungsvariablen-Label).

Die Tabelle als Prüf-Artefakt speichern (z. B. `probes/<flag>-<version>.md`), damit künftige Prüfungen dagegen diffen können.

**Expected:** eine vollständige Evidenztabelle, die alle vier Zweige, den Konjunktionsstatus, den Substitutionsstatus und eine einzige finale Klassifizierung abdeckt.

**On failure:** liefert kein Zweig ein verwertbares Signal (Binary nicht lesbar, Laufzeit nicht aufrufbar, On-Disk und Plattform-Cache beide abwesend), keine Klassifizierung erfinden. `INDETERMINATE` mit der Begründung „kein Zweig lieferte Signal" eintragen und anhalten.

## Validierung

- [ ] Jede Zustandsaussage in der Evidenztabelle ist mit einer konkreten Beobachtung gepaart (keine nackten Behauptungen).
- [ ] Der gate-call-Default-Wert des Flags ist aufgezeichnet (oder explizit als unlesbar vermerkt).
- [ ] Telemetrie-Ereignis-Vorkommen werden nicht als Gate-Evidenz gezählt.
- [ ] Konjunktions-Gates haben flagspezifische Klassifizierungen **und** eine fähigkeitsebene Klassifizierung.
- [ ] Jede DARK-/INDETERMINATE-Zeile hat eine explizite Substitutionsprüfung.
- [ ] Das Artefakt hält die Binary-Version fest, damit künftige Prüfungen diff-fähig sind.
- [ ] Keine echten Produktnamen, versionsgebundenen Identifikatoren oder dunkel-exklusiven Flag-Namen erscheinen in einem für die Veröffentlichung gedachten Artefakt (siehe `redact-for-public-disclosure`).

## Häufige Fallstricke

- **Telemetrie-Ereignisse mit Gates verwechseln.** Ein String, der in `emit("$FLAG", ...)` erscheint, ist ein Label, kein Gate. Ein Flag, das „nur Telemetrie" ist, hat keinen Rollout-Zustand und gehört zu UNKNOWN, nicht zu DARK.
- **Zweig B (Live-Aufruf) überspringen.** Statische Evidenz allein (das Binary sagt `default=false`) ist nicht dasselbe wie Laufzeit-Evidenz (die Fähigkeit tauchte nicht auf). Ein Flag mit Default-false im Binary kann durch ein serverseitiges Override auf true geflippt sein; nur die Laufzeitprüfung zeigt, was die Sitzung tatsächlich bekam.
- **Die Konjunktion übersehen.** Das primäre Flag als LIVE zu klassifizieren, weil sein einziges Vorkommen `default=true` zeigt, während das umgebende `&& gate("B") && gate("C")` ignoriert wird, erzeugt ein fälschlich selbstbewusstes LIVE für eine Fähigkeit, die in Wahrheit durch B oder C gegatet ist.
- **DARK ohne Substitutionsprüfung erklären.** Viele DARK-Flags sind tatsächlich unerreichbar, aber viele andere haben einen vollständig unterstützten, nutzerseitig aufrufbaren Weg. Die Substitutionsprüfung ist das, was aus „alarmierendem Dark-Launch" einen „ehrlichen Befund" macht.
- **Eine veraltete Binary-Version prüfen.** Ein Prüf-Artefakt ohne Versionsstempel ist wertlos — man kann nicht sagen, ob es den aktuellen Zustand oder den des letzten Quartals wiedergibt. Stets die Version aufzeichnen und künftige Prüfungen gegen das Artefakt diffen.
- **Das Gate aktivieren, um es zu bestätigen.** Ein Flag zu flippen, um es zu testen, gehört nicht zu diesem Skill. Manche dunklen Gates sind aus Sicherheitsgründen aus (unvollständige Fähigkeit, regulatorische Sperre, unfertige Migration). Dokumentieren, niemals umgehen.
- **Zustand anderer Nutzer erfassen.** Zweig C und Zweig D inspizieren *eigenen* On-Disk-Zustand und *eigenen* Cache. Den Cache eines anderen Nutzers zu lesen ist Exfiltration und liegt außerhalb des Geltungsbereichs.
- **INDETERMINATE als Fehler behandeln.** Ist es nicht — es ist die ehrliche Klassifizierung bei partieller Evidenz. INDETERMINATE-Ergebnisse zu LIVE oder DARK zu drücken, damit der Bericht entschiedener klingt, ist der schnellste Weg, falsch zu liegen.

## Verwandte Skills

- `monitor-binary-version-baselines` — Phase 1 des übergeordneten Leitfadens; das hier aufbauende Marker-Tracking liefert den Kandidaten-Flag-Bestand.
- `conduct-empirical-wire-capture` — Phase 4; tiefere Laufzeitevidenz (Netzwerk-Capture, Lifecycle-Hooks), wenn die oberflächliche Prüfung aus Zweig B nicht ausreicht.
- `security-audit-codebase` — dunkel ausgerollter Code gehört zur Archäologie der Angriffsfläche; dieser Skill ist die Entdeckungshälfte jenes Audits.
- `redact-for-public-disclosure` — Phase 5; die Redaktionsdisziplin, die entscheidet, welche Prüf-Artefakte den privaten Arbeitsbereich verlassen dürfen.
