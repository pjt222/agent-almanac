---
name: decode-minified-js-gates
description: >
  Classify gate call variants in a minified JavaScript bundle. Covers
  context-window extraction around a flag occurrence, identification of
  4–6 reader variants (sync boolean, sync config-object, bootstrap-aware
  TTL, truthy-only, async bootstrap, async bridge), default-value
  extraction (boolean / null / numeric / config-object literal),
  conjunction detection across `&&` predicates, kill-switch inversion
  detection, and production of a gate-mechanics record that feeds probe-
  feature-flag-state. Use when a flag's behavior cannot be inferred from
  its name alone, when the binary uses multiple reader libraries, or when
  config-object gates carry structured schemas distinct from boolean
  gates.
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: de
  source_locale: en
  source_commit: 90b159ab
  translator: "Claude + human review"
  translation_date: "2026-05-04"
---

# Decode Minified JS Gates

Lies den Aufrufstellen-Kontext rund um einen Flag-String in einem minifizierten JavaScript-Bundle und erzeuge einen Gate-Mechanik-Eintrag: welche Reader-Variante, welcher Default, welche Konjunktion, welche Rolle. Waehrend `probe-feature-flag-state` die Frage "ist dieses Gate an oder aus?" beantwortet, beantwortet dieser Skill die vorgelagerte Frage — "was tut dieses Gate eigentlich?"

## Wann verwenden

- Ein durch `sweep-flag-namespace` aufgetauchtes Flag laesst sich nicht allein aus dem Namen klassifizieren.
- Das Binary verwendet mehr als eine Gate-Reader-Funktion und du musst wissen, welche ein bestimmtes Flag aufruft.
- Der "Default" eines Gates erscheint nicht-boolsch (`{}`, `null`, ein numerisches Literal) und du musst die tatsaechliche Reader-Variante dekodieren.
- Du vermutest einen Kill-Switch (invertiertes Gate), kannst es aber aus dem Flag-Namen nicht bestaetigen.
- Ein Praedikat kombiniert mehrere Gates per `&&` und du musst die Co-Gates aufzaehlen, bevor du eines davon probst.

## Eingaben

- **Erforderlich**: eine minifizierte JavaScript-Bundle-Datei (`.js`, `.mjs`, `.bun`).
- **Erforderlich**: ein Ziel-Flag-String, der dekodiert werden soll, in literaler Form.
- **Optional**: eine Liste bekannter Reader-Funktionsnamen aus einem vorherigen Decode-Durchlauf — beschleunigt Schritt 2.
- **Optional**: eine ueberschriebene Kontextfenstergroesse; Default ist 300 Zeichen davor, 200 Zeichen nach dem Flag-Vorkommen.

## Vorgehensweise

### Step 1: Das Kontextfenster extrahieren

Lokalisiere den Flag-String und erfasse pro Vorkommen ein asymmetrisches Fenster. Der Vor-Kontext (vor dem Flag) ist der Ort, an dem der Reader-Funktionsname steht; der Nach-Kontext (nach dem Flag) ist der Ort, an dem der Default-Wert und die Konjunktion stehen.

```bash
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3                   # synthetic placeholder
PRE=300
POST=200

# All byte offsets where the flag string occurs
grep -boE "\"${FLAG}\"" "$BUNDLE" | cut -d: -f1 > /tmp/decode-offsets.txt
wc -l /tmp/decode-offsets.txt

# Capture an asymmetric window per occurrence
while read -r offset; do
  start=$((offset - PRE))
  [ "$start" -lt 0 ] && start=0
  length=$((PRE + POST))
  echo "=== offset $offset ==="
  dd if="$BUNDLE" bs=1 skip="$start" count="$length" 2>/dev/null
  echo
done < /tmp/decode-offsets.txt > /tmp/decode-windows.txt

less /tmp/decode-windows.txt
```

Fuer einen schnellen ersten Durchlauf faengt `grep -oE` mit Negative-Lookbehind ueber Perl-kompatible Regex dieselben Fenster in einer einzigen Pipe ein.

**Erwartet:** ein oder mehrere Kontextfenster pro Flag-Vorkommen, jedes ~500 Zeichen lang. Mehrere Vorkommen teilen typischerweise dieselbe Reader-Funktion, koennen sich aber bei Default oder Konjunktion unterscheiden — pruefe jedes unabhaengig.

**Bei Fehler:** wenn das Bundle fuer `dd`-pro-Vorkommen zu gross ist (Binary > 100 MB oder sehr viele Vorkommen), nutze `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` als strukturierte Naeherung. Wenn die Fenster verstuemmelt aussehen, ist das Bundle moeglicherweise UTF-16 oder hat Nicht-ASCII-Trennzeichen; nutze `iconv` oder behandle es als binaer.

### Step 2: Die Reader-Variante identifizieren

Minifizierte Gate-Bibliotheken stellen typischerweise 4–6 Reader-Varianten mit unterschiedlicher Semantik bereit. Der Reader-Funktionsname ist der erste Hinweis; die Aufrufsignatur ist der Verifikator.

Die Varianten-Taxonomie (synthetische Namen — ersetze sie durch die tatsaechlichen minifizierten Identifikatoren aus deinem Bundle):

| Variante | Synthetische Form | Liefert | Uebliche Verwendung |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` oder `gate("flag", true)` | `boolean` | Standard-On/Off-Feature-Switches |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON-Objekt | Strukturierte Konfiguration (Verzoegerungen, Allowlists, Modellnamen) |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean` (gecached) | Gates auf dem Startup-Pfad, bevor Remote-Konfiguration eintrifft |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | Schnelle Pruefungen; kein expliziter Default |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | Gates, die nach dem Bootstrap aufgeloest werden |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | Bridge/Relay-Channel-Gates mit eigenem Auswertungspfad |

Gleiche jedes Kontextfenster mit den Variantenmustern ab:

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

Wenn mehrere Varianten fuer dasselbe Flag auftauchen (selten, aber real — ein Flag wird sowohl synchron beim Start als auch asynchron nach dem Bootstrap gelesen), erfasse die Variante jedes Vorkommens separat. Probe-Ergebnisse koennen sich unterscheiden.

**Erwartet:** jedem Gate-Call-Vorkommen ist genau eine Variante zugeordnet. Variantenanzahlen ueber den gesamten Sweep ergeben eine Verteilung auf Binary-Ebene (z. B. "60 % Sync boolean, 30 % Config-Object, 10 % TTL").

**Bei Fehler:** wenn ein Kontextfenster kein erkennbares Reader-Muster enthaelt, ist das Flag moeglicherweise gar nicht gate-aufgerufen — pruefe die Aufrufstellen-Klassifikation aus `sweep-flag-namespace` Schritt 2 erneut. Enthaelt ein Fenster einen Reader-Namen, der nicht in dieser Taxonomie steht, dokumentiere ihn als neue Variante in deinen Forschungsartefakten und entscheide, ob er einen eigenen Behandlungspfad rechtfertigt.

### Step 3: Den Default-Wert extrahieren

Der Default ist das zweite positionale Argument des Readers (oder fehlt bei Truthy-only-/Async-Varianten). Erfasse das exakte Literal — `false`, `true`, `null`, `0`, einen String oder ein JSON-Konfigurationsobjekt.

```bash
# Boolean default extraction (sync boolean and TTL variants)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*(true|false)' /tmp/decode-windows.txt

# Config-object default — match the opening brace and capture until the
# matching brace at the same nesting depth. For minified bundles this is
# usually safe with a non-greedy match because objects rarely span lines.
grep -oE 'fvReader\("acme_widget_v3",\s*\{[^}]*\}' /tmp/decode-windows.txt

# Numeric default (rare but real for TTL or threshold gates)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*[0-9]+' /tmp/decode-windows.txt
```

Bei Konfigurationsobjekt-Defaults pruefe die JSON-Struktur — Schluessel deuten oft auf den Zweck des Gates hin (z. B. ist `{maxRetries: 3, timeoutMs: 5000}` eine Retry-Policy-Konfiguration, kein Feature-Toggle).

**Erwartet:** ein exaktes literales Default pro Vorkommen. Booleans sind eindeutig; Konfigurationsobjekte verlangen ein manuelles Lesen der Struktur.

**Bei Fehler:** wenn die schliessende Klammer eines Konfigurationsobjekts ausserhalb des Kontextfensters liegt, vergroessere die Nach-Kontext-Groesse in Schritt 1. Erscheint ein Default als Variablenreferenz (z. B. `gate("flag", x)`), wird der Default zur Laufzeit berechnet — markiere ihn als DYNAMIC und probe den tatsaechlich zurueckgelieferten Wert ueber `probe-feature-flag-state`.

### Step 4: Konjunktionen und Kill-Switches erkennen

Viele Gates beteiligen sich an zusammengesetzten Praedikaten. Konjunktionen (`&&`) und Inversionen (`!`) veraendern die effektive Rolle des Gates.

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

Liste fuer jede erkannte Konjunktion die Co-Gate-Flag-Namen auf. Sie sind nun Teil des Probe-Bereichs — wenn die Auswertung des Ziel-Flags von Co-Gates abhaengt, liefert ein Probe nur des Ziels einen unvollstaendigen Zustand.

Markiere fuer jede erkannte Inversion das Flag als Kill-Switch im Gate-Mechanik-Eintrag. Kill-Switches kehren die Bedeutung des Defaults um: ein Kill-Switch mit `default=false` heisst "Feature standardmaessig an" (denn `!false === true`), waehrend ein normales Gate mit `default=false` heisst "Feature standardmaessig aus".

**Erwartet:** eine Konjunktionsliste (moeglicherweise leer) und ein Inversionsindikator (boolesch) pro Vorkommen.

**Bei Fehler:** umfasst eine Konjunktion mehr als 2 Co-Gates, ist das Praedikat komplex genug, dass die Regex die Struktur verfehlt. Lies das Kontextfenster manuell und dokumentiere die Praedikatform woertlich im Gate-Mechanik-Eintrag.

### Step 5: Die Rolle des Gates klassifizieren

Synthetisiere die Schritte 2–4 zu einer Rollenklassifikation. Rollen treiben unterschiedliche Probe-Strategien und unterschiedliche Integrationsrisiken.

| Rolle | Signatur | Implikation |
|---|---|---|
| **Feature switch** | sync boolean, keine Inversion, keine Konjunktion | Standard on/off; direkt proben |
| **Config provider** | sync config-object (`fvReader`) | Liefert ein Objekt; default-leeres `{}` ≠ Feature aus |
| **Lifecycle guard** | bootstrap-aware TTL oder async bootstrap | Zustand haengt vom Bootstrap-Timing ab; an mehreren Punkten proben |
| **Kill switch** | invertiertes Gate, default-false | Feature standardmaessig an fuer Nutzer; Flag schaltet es AUS |
| **Conjunction member** | beliebige Variante mit `&&` Co-Gate | Allein nicht auswertbar; Co-Gates gehoeren zum Probe-Bereich |
| **Bridge gate** | async bridge variant | Probe muss ueber den Bridge-Channel erfolgen, nicht ueber den Hauptpfad |

**Erwartet:** jedes Gate-Call-Vorkommen hat genau eine Primaerrolle. Manche Flags treten in mehreren Rollen ueber Vorkommen hinweg auf (z. B. Feature-Switch an einer Aufrufstelle, Conjunction-Member an einer anderen) — erfasse jede Rolle unabhaengig.

**Bei Fehler:** passt eine Rolle nicht in die Tabelle, verwendet das Binary eine in diesem Skill noch nicht dokumentierte Gate-Bibliothek. Fuege eine Zeile mit synthetischen Identifikatoren hinzu und fuehre die Variante in den Skill (oder eine projektspezifische Erweiterung) zurueck — fuer kuenftige Untersuchungen.

### Step 6: Den Gate-Mechanik-Eintrag erzeugen

Kombiniere die Befunde pro Flag zu einem strukturierten Eintrag. JSONL ist praktisch, weil jedes Flag zu einer Zeile wird, leicht mit dem Inventar von `sweep-flag-namespace` zu mergen.

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

Der Gate-Mechanik-Eintrag fliesst in `probe-feature-flag-state` Schritt 2 (Gate-vs-Event-Disambiguierung): die Variante + Rolle + Konjunktionsliste bestimmt, welche Beobachtungen als Beweis fuer den Zustand LIVE / DARK / INDETERMINATE zaehlen.

**Erwartet:** ein JSONL-Eintrag pro Flag (oder pro Flag-Vorkommen, wenn ein einzelnes Flag mehrere unterschiedliche Mechaniken hat). Der Eintrag ist reproduzierbar — die Prozedur erneut gegen dasselbe Binary ausgefuehrt liefert denselben Eintrag.

**Bei Fehler:** schwanken die Eintraege zwischen Laeufen, ist ein vorgelagerter Schritt nicht-deterministisch. Meist verfehlt oder ueberzaehlt die Regex aus Schritt 1 Vorkommen. Friere die Regexe fuer die Dauer einer Kampagne ein.

## Validierung

- [ ] Schritt 1 erzeugt ein Kontextfenster pro Flag-Vorkommen; Fenster sind ~500 Zeichen
- [ ] Schritt 2 markiert jedes Vorkommen mit genau einer Reader-Variante aus der Taxonomie
- [ ] Schritt 3 erfasst das exakte Default-Literal (boolesch, Konfigurationsobjekt oder DYNAMIC)
- [ ] Schritt 4 deckt alle Konjunktionen und Kill-Switch-Inversionen in den Fenstern auf
- [ ] Schritt 5 weist jedem Vorkommen eine Rolle aus der Rollentabelle zu
- [ ] Schritt 6 erzeugt einen JSONL-Gate-Mechanik-Eintrag, der ueber Wiederholungslaeufe sauber diffbar ist
- [ ] Alle ausgearbeiteten Beispiele verwenden synthetische Platzhalter (`acme_*`, `gate`, `fvReader`, etc.) — keine echten Flag-Namen, Reader-Namen oder Konfigurationsobjekt-Schemata
- [ ] Der Eintrag ist von `probe-feature-flag-state` konsumierbar (gleiche Flag-Identifikatoren, kompatible Feldnamen)

## Haeufige Stolperfallen

- **"Default" als "Verhalten" lesen**: ein Gate mit `default=true` ist *in diesem Binary* standardmaessig an, aber serverseitige Overrides koennen es kippen. Der Default sagt dir die Baseline; der Laufzeit-Probe (`probe-feature-flag-state`) sagt dir den Zustand.
- **Leeres Konfigurationsobjekt-Default mit "Feature aus" verwechseln**: `fvReader("flag", {})` liefert ein leeres Objekt als Default — aber das Flag ist *an* (das Gate wertet truthy aus). `{}` als "aus" zu behandeln, klassifiziert Config-Provider faelschlich als Feature-Switches.
- **Kill-Switches uebersehen**: ein vorangestelltes `!` vor dem Gate-Call invertiert die Bedeutung. Schritt 4 zu ueberspringen erzeugt einen Eintrag, der "default=false, Feature standardmaessig aus" sagt, obwohl die Wahrheit "default=false, Feature standardmaessig AN wegen der Inversion" ist.
- **Eine Haelfte einer Konjunktion proben**: ist `acme_widget_v3 && acme_user_in_cohort` das Praedikat, bedeutet ein Probe von nur `acme_widget_v3` mit Ergebnis LIVE nicht, dass das Feature live ist — die Konjunktion kann es weiterhin ueber das Cohort-Flag absperren.
- **Reader-Namen ueber Versionen vertrauen**: minifizierte Identifikatoren koennen sich zwischen Major-Versionen aendern. Die Taxonomie in Schritt 2 ist nach *Signatur* (Aufrufform, Rueckgabetyp, Default-Position) sortiert, nicht nach Name. Wenn sich eine Binary-Version aendert, leite die Reader-Namen aus einem frischen Decode-Durchlauf neu ab.
- **Fenster zu schmal**: ein 200/100-Split verfehlt Konfigurationsobjekt-Defaults, die 300+ Zeichen umspannen. Defaults von 300/200 oder 400/300 sind sicherer; verkleinere nur, wenn das Bundle riesig ist und die Fensterkosten eine Rolle spielen.
- **Echte Reader-Namen leaken**: minifizierte Reader-Namen sehen manchmal wie Unsinn aus (`a`, `b`, `Yc1`) und fuehlen sich sicher an, woertlich kopiert zu werden. Sie sind dennoch Befunde — ersetze sie vor Veroeffentlichung der Methodik durch synthetische Platzhalter.

## Verwandte Skills

- `probe-feature-flag-state` — verwendet den Gate-Mechanik-Eintrag, um Laufzeitbeobachtungen zu interpretieren
- `sweep-flag-namespace` — produziert die Kandidaten-Flag-Menge, die dieser Skill dekodiert
- `monitor-binary-version-baselines` — verfolgt Reader-Namens-Aenderungen ueber Binary-Versionen; leite die Muster aus Schritt 2 neu ab, wenn Baselines wechseln
- `redact-for-public-disclosure` — wie man Gate-Decoding-Methodik veroeffentlicht, ohne echte Reader-Namen oder Schemata preiszugeben
- `conduct-empirical-wire-capture` — validiert den Gate-Mechanik-Eintrag gegen das Laufzeitverhalten
