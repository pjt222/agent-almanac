---
name: sweep-flag-namespace
description: >
  Bulk-extract every candidate flag from a binary namespace, build an
  extraction inventory with occurrence counts and call-type tags, cross-
  reference against a documented set, and track completeness across probe
  campaigns until the undocumented remainder reaches zero. Covers namespace
  prefix harvesting, gate-vs-telemetry disambiguation at the call-site
  level, completeness metrics, DEFAULT-TRUE population reporting, and a
  final completion confirmation scan. Use upstream of probe-feature-flag-
  state when you need a complete catalog rather than a sample, or when a
  prior wave-based campaign needs a verifiable end condition.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: de
  source_locale: en
  source_commit: 90b159ab
  translator: "Claude + human review"
  translation_date: "2026-05-04"
---

# Sweep Flag Namespace

Extrahiere erschoepfend jeden Flag-Kandidaten aus dem Namespace eines Binaries, trenne Gate-Aufrufe von Telemetrie und verfolge die Vollstaendigkeit gegen eine laufende Dokumentationsmenge, bis der undokumentierte Rest null ist. Waehrend `probe-feature-flag-state` jeweils ein Flag klassifiziert, erzeugt dieser Skill den Katalog, gegen den jene Probes arbeiten — und bestaetigt, wann der Katalog vollstaendig ist.

## Wann verwenden

- Eine Flag-Discovery-Kampagne laeuft und du brauchst eine ueberpruefbare Abbruchbedingung, statt zu raten, ob du "genug" Flags hast.
- Der Flag-Namespace eines Binaries ist gross (hunderte von Kandidaten-Strings) und ein stichprobenbasiertes Vorgehen riskiert, wesentliche Gates zu uebersehen.
- Du musst DEFAULT-TRUE-Flags getrennt von DEFAULT-FALSE berichten — typischerweise die signalstarke Teilmenge eines jeden Namespaces.
- Du fuehrst eine Mehrwellen-Dokumentation gegen ein Binary durch und willst die Abschlussmetrik jeder Welle schriftlich festhalten.
- Du vermutest, dass eine frueher Kampagne vorzeitig endete, und musst das mit einem frischen Sweep bestaetigen oder widerlegen.

## Eingaben

- **Erforderlich**: die Binary- oder Bundle-Datei, die du lesen kannst.
- **Erforderlich**: ein Namespace-Praefix (synthetisches Beispiel: `acme_*`), das Flags des untersuchten Systems identifiziert.
- **Erforderlich**: eine laufende Dokumentationsmenge — die fortlaufende Liste von Flag-Beschreibungen, die deine Kampagne bisher produziert hat.
- **Optional**: Funktionsnamen der Gate-Reader (synthetisch: `gate(...)`, `flag(...)`, `isEnabled(...)`) — vorab bekannt beschleunigt das Schritt 2.
- **Optional**: Funktionsnamen fuer Telemetrie/Emit — gleicher Grund, umgekehrtes Vorzeichen.
- **Optional**: vorherige Sweep-Ausgabe fuer dieses Binary in einer frueheren Version, fuer eine Delta-Analyse.

## Vorgehensweise

### Step 1: Alle Strings ernten, die zum Namespace-Praefix passen

Extrahiere jedes Literal im Binary, das zum Namespace-Praefix passt — unabhaengig von der Rolle der Aufrufstelle. Das Ziel in diesem Schritt ist *Abdeckung*, nicht Klassifikation.

```bash
BUNDLE=/path/to/cli/bundle.js
PREFIX=acme_                       # synthetic placeholder

# Pull every quoted string starting with the prefix
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort -u > /tmp/sweep-candidates.txt
wc -l /tmp/sweep-candidates.txt    # unique candidate count

# Per-string occurrence count (gives a first hint at gate-call density)
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort | uniq -c | sort -rn > /tmp/sweep-occurrences.txt
head /tmp/sweep-occurrences.txt
```

**Erwartet:** eine deduplizierte Kandidatenliste und eine nach Haeufigkeit sortierte Vorkommensdatei. Sehr hohe Zahlen (>=10) deuten auf gate-lastige Strings hin; Strings mit nur einem Vorkommen sind wahrscheinlicher Telemetrie-Eventnamen oder statische Labels.

**Bei Fehler:** wenn die Anzahl eindeutiger Treffer 0 ist, stimmt das Praefix nicht (Tippfehler, Namespace-Grenzen passen nicht, das Harness verwendet eine andere Konvention als erwartet). Wenn die Anzahl ~5000 uebersteigt, ist das Praefix zu breit gefasst — engere es ein, bevor du fortfaehrst, sonst wird das Inventar unbeherrschbar.

### Step 2: Gate-Aufrufe von Telemetrie und statischen Labels unterscheiden

Gleicher String, verschiedene Rolle. Die Rollen an der Aufrufstelle zu unterscheiden, macht das Inventar erst handlungsfaehig. Verwende die Disambiguierungsdisziplin aus `probe-feature-flag-state` Schritt 2 wieder.

Klassifiziere fuer jeden Kandidaten jedes Vorkommen:

- **gate-call** — der String ist das erste Argument einer Gate-Reader-Funktion (`gate("$FLAG", default)`, `flag("$FLAG", ...)`, `isEnabled("$FLAG")`, etc.).
- **telemetry-call** — der String ist das erste Argument einer Emit-/Log-/Track-Funktion.
- **env-var-check** — der String erscheint in einem `process.env.X`-Lookup oder Aequivalent.
- **static-label** — der String erscheint in einer Registry, Map oder einem Kommentar ohne Verhaltensanbindung.

```bash
# Count gate-call occurrences for the candidate set, using a synthetic
# reader-name pattern. Adapt the regex to the actual reader names found.
GATE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_'
grep -coE "$GATE_PATTERN" "$BUNDLE"

# Per-flag gate-call count
while read -r flag; do
  flag_no_quotes="${flag//\"/}"
  count=$(grep -coE "(gate|flag|isEnabled)\(\s*\"${flag_no_quotes}\"" "$BUNDLE")
  echo -e "${flag_no_quotes}\t${count}"
done < /tmp/sweep-candidates.txt > /tmp/sweep-gate-counts.tsv
```

**Erwartet:** ein Inventareintrag pro eindeutigem String der Form `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}`. Die Gate-Call-Anzahl ist die handlungsleitende Spalte; der Rest sind Rauschfilter.

**Bei Fehler:** wenn jeder Kandidat null Gate-Call-Treffer hat, ist das Gate-Reader-Muster falsch. Entweder verwendet das Binary eine Reader-Funktion, die diese Regex verfehlt, oder der Namespace ist reine Telemetrie (gar kein Flag-Namespace). Fuehre `decode-minified-js-gates` gegen ein paar Kandidaten aus, um die tatsaechlichen Reader-Namen zu lernen, bevor du diesen Schritt erneut ausfuehrst.

### Step 3: Das Extraktionsinventar aufbauen

Konsolidiere die String-spezifischen Eintraege zu einem Inventar-Artefakt. CSV oder JSONL — entscheide dich fuer eines und bleibe dabei, damit Diffs ueber Wellen hinweg moeglich sind.

```bash
# JSONL inventory
{
  while IFS=$'\t' read -r flag gate_count; do
    [ "$gate_count" -gt 0 ] || continue   # skip strings with no gate-call evidence
    total=$(grep -c "\"${flag}\"" "$BUNDLE")
    telem=$((total - gate_count))         # rough; refine if other call types matter
    printf '{"flag":"%s","total":%d,"gate_calls":%d,"telemetry":%d,"documented":false}\n' \
      "$flag" "$total" "$gate_count" "$telem"
  done < /tmp/sweep-gate-counts.tsv
} > /tmp/sweep-inventory.jsonl

wc -l /tmp/sweep-inventory.jsonl    # gate-bearing flag count
```

Zwei abgeleitete Zaehler sind wichtig:

- **`total_unique`**: jeder String, auf den das Praefix passte (vor der Gate-Filterung)
- **`gate_calls`**: die Teilmenge, die mindestens ein Gate-Call-Vorkommen hat — das ist die Arbeitsmenge der Kampagne

**Erwartet:** eine Inventar-Datei mit einem Eintrag pro eindeutigem Gate-tragendem Flag. Die Gate-Anzahl ist typischerweise ein Bruchteil von `total_unique` (haeufig 5–20 %), die beiden Zahlen sollten sich also deutlich unterscheiden.

**Bei Fehler:** wenn das Inventar leer ist oder `gate_calls` ~ `total_unique`, liefert die Gate-vs-Telemetrie-Disambiguierung in Schritt 2 sinnlose Splits. Ueberarbeite das Reader-Namens-Regex.

### Step 4: Querverweis gegen die Dokumentationsmenge

Die Vollstaendigkeitsmetrik haengt von einer Dokumentationsmenge ab — den Flags, die deine Kampagne in Forschungsartefakten bereits beschrieben hat. Bilde den Querverweis und berichte dann, was uebrig bleibt.

```bash
DOCUMENTED=/path/to/research/documented-flags.txt   # one flag name per line

# Extract gate-bearing flag names from the inventory
jq -r '.flag' /tmp/sweep-inventory.jsonl | sort -u > /tmp/sweep-extracted.txt

# Compute the documented and remaining sets
sort -u "$DOCUMENTED" > /tmp/sweep-documented.txt
comm -23 /tmp/sweep-extracted.txt /tmp/sweep-documented.txt > /tmp/sweep-remaining.txt

echo "Extracted (gate-bearing):  $(wc -l < /tmp/sweep-extracted.txt)"
echo "Documented:                $(wc -l < /tmp/sweep-documented.txt)"
echo "Remaining (undocumented):  $(wc -l < /tmp/sweep-remaining.txt)"
```

Die Vollstaendigkeitsmetrik ist `remaining` — wenn sie 0 erreicht, deckt die Dokumentationsmenge jedes Gate-tragende Flag im Namespace ab.

**Erwartet:** drei Zaehler. Frueh in einer Kampagne sollte `remaining` ein erheblicher Anteil von `extracted` sein. Jede Welle reduziert `remaining`, bis es gegen 0 konvergiert. Verfolge die Trajektorie ueber Wellen hinweg, um Plateaus zu erkennen (eine ins Stocken geratene Welle, die immer wieder dieselben dokumentierten Flags untersucht).

**Bei Fehler:** wenn `documented` groesser ist als `extracted`, enthaelt die Dokumentationsmenge veraltete Eintraege (Flags, die in dieser Binary-Version entfernt wurden). Berechne stattdessen `comm -13`, um die obsoleten dokumentierten Namen sichtbar zu machen; archiviere sie als REMOVED im naechsten Kampagnenartefakt.

### Step 5: Die DEFAULT-TRUE-Population berichten

Trenne innerhalb der Gate-tragenden Flag-Menge die Flags mit binaerem Default `true` von denen mit Default `false` (oder nicht-boolschem Default). DEFAULT-TRUE-Flags sind ohne Server-Override fuer alle Nutzer aktiv und damit die signalstaerkste Teilmenge.

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

Fuer Flags mit nicht-boolschen Defaults (Konfigurationsobjekte, TTL-Reader, asynchrone Reader) verwende `decode-minified-js-gates`, um die Reader-Variante zu klassifizieren — sie erzeugen eine andere Default-Form und sollten in einem eigenen Topf berichtet werden.

**Erwartet:** der typische Split liegt bei 10–20 % DEFAULT-TRUE und 80–90 % DEFAULT-FALSE. Ein Binary an den Extremen (90 %+ TRUE oder 90 %+ FALSE) ist ungewoehnlich und untersuchungswuerdig — es kann auf eine Release-Konvention hindeuten (alles default-on zum Testen, alles default-off fuer einen schrittweisen Rollout).

**Bei Fehler:** wenn DEFAULT-TRUE und DEFAULT-FALSE zusammen das Gate-tragende Inventar nicht abdecken, verwendet der Rest nicht-boolsche Reader. Fuehre `decode-minified-js-gates` gegen die Luecke aus, um die genutzten Reader-Varianten zu klassifizieren.

### Step 6: Vollstaendigkeit bestaetigen

Sobald `remaining = 0` aus Schritt 4 erreicht ist, fuehre einen finalen Scan aus: suche nach Gate-Call-Vorkommen von Strings mit Namespace-Treffer, die NICHT in der Dokumentationsmenge stehen. Das faengt jedes Flag ab, das beim Ernten in Schritt 1 verfehlt wurde (z. B. String-Konkatenation, die das Literal vor einem einfachen grep verbirgt).

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

Vergleiche die Gate-Call-Treffer mit `/tmp/sweep-documented.txt`. Wenn ein Treffer auf ein Flag verweist, das nicht in der Dokumentationsmenge enthalten ist, kehre zu Schritt 1 mit verfeinerter Extraktion zurueck (z. B. Behandlung dynamischer Konstruktionen). Wenn leer: Die Kampagne ist abgeschlossen.

**Erwartet:** der finale Scan liefert entweder ein leeres Ergebnis (Kampagne abgeschlossen) oder einen kleinen Restbestand (typischerweise <5 Flags, meist mit dynamischen Konstruktionen oder alternativen Readern).

**Bei Fehler:** wenn der finale Scan einen grossen Rest liefert, obwohl Schritt 4 `remaining = 0` meldete, hat Schritt 1 systematisch zu wenig extrahiert. Untersuche die verfehlten Muster (dynamische Strings, alternative Quote-Zeichen, alternative Reader-Funktionen) und starte ab Schritt 1 mit einer praeziseren Regex neu.

## Validierung

- [ ] Die Anzahl eindeutiger Treffer in Schritt 1 ist groesser null und liegt innerhalb einer Groessenordnung der Erwartung
- [ ] Schritt 2 liefert einen sinnvollen Gate-vs-Telemetrie-Split (Gate-Call-Anzahl ist ein Bruchteil, nicht alles oder nichts der Gesamtvorkommen)
- [ ] Inventar aus Schritt 3 hat einen Eintrag pro Gate-tragendem Flag, in CSV oder JSONL
- [ ] Schritt 4 berichtet `total_unique`, `gate_calls`, `documented`, `remaining` — und die Metrik erreicht 0 zum Kampagnenende
- [ ] Schritt 5 berichtet DEFAULT-TRUE und DEFAULT-FALSE separat
- [ ] Schritt 6 final scan liefert leeres Ergebnis, bevor die Kampagne als abgeschlossen erklaert wird
- [ ] Alle ausgearbeiteten Beispiele verwenden synthetische Platzhalter (`acme_*`, `gate(...)`, etc.); keine echten Flag- oder Reader-Namen sind ins Artefakt geleakt
- [ ] Die Sweep-Ausgabe ist gegen einen Sweep einer frueheren Version diffbar (gleiche Form, gleiche Felder)

## Haeufige Stolperfallen

- **Aufhoeren bei Stichprobe statt Sweep**: eine Kampagne, die mit "wir haben genug Flags dokumentiert" endet, ohne `remaining` zu berechnen, ist Sampling, kein Sweep. Der Witz dieses Skills ist genau die ueberpruefbare Abbruchbedingung.
- **Gate-tragend mit allen Extrahierten verwechseln**: die meisten Strings in einem Namespace sind keine Gates. `total_unique` als Kampagnen-Nenner zu berichten, blaeht den Aufwand auf und drueckt die scheinbare Abschlussrate. Verwende `gate_calls` als Nenner.
- **Einer Regex ueber Versionen vertrauen**: Funktionsnamen der Gate-Reader aendern sich manchmal zwischen Major-Versionen. Validiere das Muster aus Schritt 2 erneut, wenn du einen Sweep gegen ein neues Binary startest.
- **Schritt 6 ueberspringen**: Abschluss bei `remaining = 0` zu erklaeren, ohne den finalen Dynamik-Scan, kann Flags uebersehen, die per String-Konkatenation gebaut werden. Der finale Scan ist billig und faengt die Peinlichkeit ab.
- **Echte Namen leaken**: es ist leicht, versehentlich einen echten Flag-Namen aus deinem Inventar in die ausgearbeiteten Beispiele des Skills zu kleben. Die Platzhalterdisziplin (`acme_*`) existiert aus gutem Grund — halte Methodik von Befunden getrennt.
- **Gegen eine veraltete Dokumentationsmenge querverweisen**: wurde die Dokumentationsmenge gegen ein aelteres Binary gebaut, erscheinen entfernte Flags weiterhin als "dokumentiert", aber nicht mehr extrahiert, waehrend echt undokumentierte Flags als verbleibend auftauchen. Aktualisiere die Dokumentationsmenge gegen das aktuelle Binary, bevor du den Querverweis bildest.

## Verwandte Skills

- `probe-feature-flag-state` — Klassifikation pro Flag (nachgelagert zum Inventar dieses Skills)
- `decode-minified-js-gates` — wenn waehrend eines Sweeps Reader-Varianten klassifiziert werden muessen
- `monitor-binary-version-baselines` — Laengsschnittverfolgung ueber Binary-Versionen; Sweeps lassen sich gegen jede Baseline erneut ausfuehren
- `redact-for-public-disclosure` — wie Methodik aus einem Sweep veroeffentlicht wird, ohne das Inventar selbst zu leaken
- `conduct-empirical-wire-capture` — empirische Validierung der vom Sweep aufgedeckten Flags
