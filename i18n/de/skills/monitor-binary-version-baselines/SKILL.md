---
name: monitor-binary-version-baselines
description: >
  Längsgerichtete Baselines des Inhalts von CLI-Binaries über Versionen
  hinweg etablieren und pflegen. Behandelt Markerauswahl nach Kategorie
  (API / Identität / Config / Telemetrie / Flag / Funktion), gewichtete
  Bewertung, schwellenbasierte System-Präsenzerkennung und versions-
  spezifische Baseline-Einträge. Einzusetzen, wenn der Lebenszyklus eines
  Features über Releases hinweg verfolgt wird, wenn auf dunkel ausgerollte
  oder entfernte Fähigkeiten geprüft wird oder wenn verifiziert werden
  soll, dass ein Scanning-Werkzeug selbst auch auf alten Binaries noch
  bekannte-gute Marker findet.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, baseline, binary-analysis, version-tracking, markers
  locale: de
  source_locale: en
  source_commit: b9570f58
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# Monitor Binary Version Baselines

Vergleichbare, versionsgeschlüsselte Einträge darüber aufbauen und pflegen, welche Feature-System-Marker im Binary eines CLI-Harness erscheinen — damit Hinzufügungen, Entfernungen und dunkel ausgerollte Fähigkeiten maschinell über Releases hinweg erkannt werden können.

## Wann verwenden

- Verfolgen des Lebenszyklus eines Features über mehrere Releases eines Closed-Source-CLI-Harness hinweg
- Prüfen auf dunkel ausgerollte Fähigkeiten (ausgeliefert, aber abgeschaltet) oder stillschweigend entfernte Fähigkeiten
- Verifizieren, dass ein Marker-Scanner weiterhin bekannte-gute Marker in alten Binaries findet (Regressionstest des Scanners selbst)
- Aufbau des Phase-1-Substrats, das spätere Phasen (Flag-Entdeckung, Dark-Launch-Erkennung, Wire Capture) konsumieren
- Jeder Kontext, in dem ad-hoc `grep` die Frage „ist X heute vorhanden" beantwortet, tatsächlich aber benötigt wird: „wie hat sich das aus X, Y, Z bestehende System über Versionen hinweg bewegt"

## Eingaben

- **Erforderlich**: Eine oder mehrere installierte Binary-Versionen desselben CLI-Harness (oder extrahierte Bundles)
- **Erforderlich**: Eine Katalogdatei für die Markerdefinitionen (beim Erstlauf angelegt, über Versionen hinweg erweitert)
- **Optional**: Eine zuvor aufgezeichnete Baseline-Datei aus früheren Läufen (an Ort und Stelle erweitert, niemals umgeschrieben)
- **Optional**: Eine Liste von Versionen, die bekanntermaßen nie veröffentlicht wurden (ausgelassene Releases, zurückgezogene Builds)
- **Optional**: Eine Liste bereits verfolgter Feature-Systeme, die erweitert statt neu entdeckt werden sollen

## Vorgehen

### Schritt 1: Marker nach Kategorie auswählen

Strings wählen, die Rebuilds überstehen. Stabile, semantisch bedeutsame Identifikatoren nehmen — keine minifizierten Namen, die der Bundler im nächsten Release umbenennt.

Sechs empfohlene Kategorien:

- **API** — Endpunktpfade, Methodennamen, die in der Netzwerkoberfläche des Harness sichtbar sind
- **Identity** — interne Produktnamen, Codenamen, Versions-Sentinels
- **Config** — erkannte Schlüssel in nutzerorientierten Konfigurationsdateien
- **Telemetry** — Ereignisnamen, die an die Analytics-Pipeline emittiert werden
- **Flag** — Feature-Gate-Schlüssel, die von Gate-Prädikaten konsumiert werden
- **Function** — wohlbekannte String-Konstanten innerhalb spezifischer Handler (Fehlermeldungen, Log-Labels)

Vermeiden: kurze Identifikatoren, die minifiziert aussehen (z. B. `_a1`, `bX`, Zweibuchstabennamen gefolgt von Ziffern), Inline-Literale, die sich mit jeder Textüberarbeitung ändern würden, alles, was dem hauseigenen Namensschema des Bundlers entspricht.

**Expected:** Jeder Kandidat-Marker hat ein Kategorie-Tag und eine kurze Begründung („taucht in nutzerorientierten Docs auf", „stabil über N vorherige Releases" o. ä.). Ein typischer erster Durchlauf liefert 20–50 Marker pro System.

**On failure:** Verschwinden Marker über aufeinanderfolgende Minor-Versionen, hat der Katalog rebuild-volatile Strings statt stabiler Identifikatoren erfasst. Solche Einträge fallen lassen; auf längere, semantisch stärker verankerte Teilstrings ausweiten.

### Schritt 2: Marker nach Feature-System gruppieren

Marker in jeweils eine **Systemtabelle** pro unabhängig evolvierender Fähigkeit bündeln. Ein „System" ist ein zusammenhängender Satz von Markern, deren An-/Abwesenheit sich gemeinsam bewegt, weil sie einen Feature-Lebenszyklus teilen (z. B. alle Marker, die zu einer hypothetischen Fähigkeit `acme_widget_v3` gehören).

Warum Gruppierung zählt: systemweise Bewertung verhindert Kreuzkontamination. Das Fehlen der Marker eines Systems darf die Erkennung eines anderen nicht unterdrücken, und aggregierte Zählungen über nicht zusammenhängende Systeme sind aussagelos.

Form eines Arbeitskatalogs (Pseudocode):

```
catalog:
  acme_widget_v3:
    markers:
      - { id: "acme_widget_v3_init",         category: function, weight: 10 }
      - { id: "acme.widget.v3.dialog.open",  category: telemetry, weight: 5 }
      - { id: "ACME_WIDGET_V3_DISABLE",      category: flag,     weight: 10 }
  acme_other_system:
    markers:
      - ...
```

**Expected:** Jedes System hat seine eigene Markerliste; kein Marker erscheint in zwei Systemen. Ein neues System hinzuzufügen bedeutet, einen neuen Top-Level-Eintrag anzulegen — niemals Marker nachträglich zwischen Systemen verschieben.

**On failure:** Lassen sich Marker schwer einem System zuordnen (Überlappung, Mehrdeutigkeit), sind die Systemdefinitionen zu grob. System aufteilen, oder akzeptieren, dass manche Marker „geteiltes Substrat" sind, und sie von der systemweisen Bewertung ausschließen.

### Schritt 3: Marker nach Signalstärke gewichten

Jedem Marker ein Gewicht zuweisen, das widerspiegelt, wie stark seine Anwesenheit allein das System bestätigt:

- **10 = allein diagnostisch** — einzigartig genug, dass das Auffinden dieses Markers für sich genommen ausreicht, das Vorhandensein des Systems zu bestätigen (z. B. ein langer, systemspezifischer String, den kein anderer Codepfad emittieren würde)
- **3–5 = nur bestätigend** — zu generisch, um allein zu bestätigen, trägt aber zu einer Gesamtbewertung bei (z. B. ein kurzes Telemetrie-Suffix, das der Harness über Features hinweg wiederverwendet)

Die Konvention lehren, nicht die konkreten Zahlen. Der Abstand zwischen „diagnostisch" und „bestätigend" zählt mehr als die exakt gewählten Ganzzahlen — entscheidend ist, dass die Schwellen in Schritt 5 zwischen „einem starken Signal" und „vielen schwachen Signalen" unterscheiden können.

**Expected:** Jeder Marker hat ein Gewicht. Die Gewichtsverteilung des Katalogs neigt zu bestätigenden Markern (3–5), mit einer geringen Anzahl allein-diagnostischer Marker (10) pro System.

**On failure:** Ist jeder Marker mit 10 gewichtet, verliert die Bewertung Auflösung — Teil-Präsenzbefunde werden unmöglich. Marker abstufen, die über mehrere Systeme wiederkehren oder in unverwandten Handlern erscheinen.

### Schritt 4: Versionsspezifische Baselines aufzeichnen

Für jede gescannte Version sowohl **vorhandene** als auch **abwesende** Marker aufzeichnen, nach Version geschlüsselt. Beides ist Evidenz: ein abwesender Marker in Version N ist genauso informativ wie ein vorhandener, wenn Version N+1 ihn wieder einführt.

Form der Baseline:

```
baselines:
  "1.4.0":
    acme_widget_v3:
      present: ["acme_widget_v3_init", "ACME_WIDGET_V3_DISABLE"]
      absent:  ["acme.widget.v3.dialog.open"]
      score:   20
  "1.5.0":
    acme_widget_v3:
      present: ["acme_widget_v3_init", "ACME_WIDGET_V3_DISABLE", "acme.widget.v3.dialog.open"]
      absent:  []
      score:   25
  "1.4.1":
    _annotation: "never-published; skipped from upstream release timeline"
```

Nie veröffentlichte Versionen erhalten eine explizite Annotation statt stillschweigender Auslassung. Stillschweigend übersprungene Versionen wirken für den nächsten Leser wie Datenverlust.

**Expected:** Jede Version erzeugt einen Eintrag pro verfolgtem System, mit ausgefüllten `present`, `absent` und `score`, oder eine explizite `_annotation`, falls nie veröffentlicht.

**On failure:** Liefert ein Baseline-Scan null Marker für ein zuvor vorhandenes System, keine Entfernung unterstellen, ohne zuvor bestätigt zu haben, dass der Binary-Pfad korrekt war, `strings` tatsächlich Ausgabe lieferte und die Marker-IDs exakt mit dem Katalog übereinstimmen. Falsche Nullwerte korrumpieren den längsgerichteten Datensatz.

### Schritt 5: Schwellen für Voll- und Teil-Erkennung festlegen

Pro System zwei Gates auf den Gesamtscore definieren:

- **`full`** — Score, oberhalb dessen das System in dieser Version als vorhanden-und-aktiv gilt
- **`partial`** — Score, oberhalb dessen das System als ausgeliefert-aber-unvollständig gilt (einige Marker vorhanden, aber unterhalb der `full`-Schwelle)

Unterhalb `partial` = abwesend (oder noch-nicht-vorhanden, je nach Richtung der Entwicklung).

```
thresholds:
  acme_widget_v3:
    full:    25
    partial: 10
```

Schwellen wählen: `full` auf die Summe der Gewichte setzen, die eine gesunde Installation emittieren würde; `partial` auf einen diagnostischen Marker plus ein bestätigendes Signal. Nachjustieren, sobald Evidenz aus mehreren Versionen vorliegt.

**Expected:** Jeder Scan erzeugt einen beschrifteten Befund pro System: `full | partial | absent`. Befunde mit `partial` verdienen Untersuchung — sie sind die Dark-Launch- und Entfernungs-Kandidaten.

**On failure:** Meldet jedes System über jede Version hinweg `partial`, sind die Schwellen zu empfindlich (vermutlich höher gesetzt, als die Marker jemals in Summe ergeben können). Gegen eine bekannt-gute Version neu kalibrieren, in der das System nachweislich aktiv ist.

### Schritt 6: Scannen mit `strings -n 8`

`strings` mit einem Mindestlängenfilter als Extraktionsprimitiv verwenden. Der Boden `-n 8` filtert den meisten Lärm heraus (kurze Fragmente, Padding, Adresstabellen-Müll), ohne bedeutsame Identifikatoren zu verlieren, die fast immer länger als 8 Zeichen sind.

```bash
strings -n 8 path/to/binary > /tmp/binary-strings.txt
```

Dann den Katalog-Match gegen `/tmp/binary-strings.txt` laufen lassen (ein beliebiger zeilenorientierter Matcher: `grep -F -f markers.txt`, `ripgrep` oder ein kleines Skript).

Vorbehalte:

- Niedrigere Mindestwerte (`-n 4`, `-n 6`) überfluten die Ausgabe mit Binärmüll und Minified-Symbol-Lärm; die Unterscheidung diagnostisch/bestätigend bricht zusammen
- Höhere Mindestwerte (`-n 12+`) übersehen kurze Flag-Identifikatoren und Config-Keys
- Einige Bundler komprimieren oder kodieren Strings; liefert `strings` nahezu leere Ausgabe, muss das Binary möglicherweise zuerst aus dem Bundle extrahiert werden (außerhalb des Geltungsbereichs dieses Skills)

**Expected:** Eine Ausgabe mit einer Zeile pro String, 1k–100k Zeilen je nach Binary-Größe. Eine manuelle Inspektion sollte in den ersten 100 Zeilen erkennbare Identifikatoren zeigen.

**On failure:** Ist die Ausgabe leer oder unlesbar, ist das Binary vermutlich gepackt, verschlüsselt oder in einem Bytecode-Format ausgeliefert, das `strings` nicht lesen kann. Auf Extraktionsebene anhalten und lösen; keine Baseline aus einem unlesbaren Scan eintragen.

### Schritt 7: Baselines vorwärts erweitern, ohne vergangene Einträge umzuschreiben

Wird ein neues System oder ein neuer Marker zum Katalog hinzugefügt, **werden nur zukünftige Versionen** darauf gescannt. Vergangene Versionseinträge bleiben wie ursprünglich geschrieben.

Warum: Baselines früherer Versionen sind empirische Evidenz dessen, was damals gescannt wurde — nicht ein aktuelles Modell dessen, was die vergangene Version enthielt. Sie nachträglich mit neu entdeckten Markern umzuschreiben, vermischt „was wir heute wissen" mit „was wir damals beobachteten". Beides ist nützlich; nur eines gehört in die Baseline-Datei.

Wird ein nachträglicher Scan tatsächlich benötigt (z. B. um zu prüfen, ob ein neuer Marker in Version N-3 vorhanden war), diesen als **separates Addendum** aufzeichnen:

```
addenda:
  "1.4.0":
    scan_date: "2026-04-15"
    catalog_revision: "v7"
    findings:
      acme_new_system:
        present: ["..."]
```

Der ursprüngliche `baselines["1.4.0"]`-Eintrag bleibt unberührt. Der Leser sieht sowohl den originalen Eintrag als auch den späteren nachträglichen Scan mitsamt seiner jeweiligen Katalog-Revision.

**Expected:** Die Baseline-Datei wächst monoton vorwärts; vergangene Einträge sind append-only mit optionalen Addenda-Blöcken. Katalog-Revisionen sind versioniert, sodass jeder Scan auf den zum Zeitpunkt verwendeten Katalogstand zurückgeführt werden kann.

**On failure:** Wann immer der Impuls aufkommt, die `present`-Liste einer vergangenen Version direkt zu editieren, anhalten. Stattdessen ein Addendum anfügen. Die Mutation vergangener Einträge zerstört die Fähigkeit, Scanner-Regressionen zu erkennen (Schritt 8 jeder späteren Scanner-Validierung stützt sich auf die Unveränderlichkeit des historischen Eintrags).

## Validierung

- [ ] Katalog hat explizite Kategorie-Tags auf jedem Marker (eines von API / Identity / Config / Telemetry / Flag / Function)
- [ ] Jeder Marker ist genau einem System zugeordnet; kein Marker erscheint in zwei Systemen
- [ ] Gewichte spannen einen tatsächlichen Bereich (einige 10er, einige 3–5er); nicht alle Gewichte identisch
- [ ] Jede gescannte Version hat einen Eintrag mit `present`, `absent` und `score` pro verfolgtem System
- [ ] Nie veröffentlichte Versionen sind explizit annotiert, nicht stillschweigend ausgelassen
- [ ] Jedes System hat sowohl `full`- als auch `partial`-Schwellen; Befunde entsprechend beschriftet
- [ ] `strings -n 8` ist das Extraktionsprimitiv (oder ein dokumentiertes Äquivalent für nicht-textuelle Binaries)
- [ ] Vergangene Versionseinträge wurden vom letzten Scan nicht verändert; neue Befunde leben in Addenda-Blöcken, falls nachträglich

## Häufige Fallstricke

- **Konkrete Befunde als Katalog aufzeichnen.** Der Katalog soll Marker-Kategorien und -Formen beschreiben, nicht versionsgebundene Literale auflisten. Kataloge voller befundförmiger Einträge verfallen schnell und sind bei versehentlicher Veröffentlichung das höchste Leckrisiko.
- **Minifizierte Identifikatoren erfassen.** Namen wie `_p3a` oder `q9X` werden bei jedem Rebuild umbenannt. Auch wenn sie heute passen, sind sie morgen Rauschen. Bei semantisch bedeutsamen Identifikatoren bleiben.
- **Telemetrie-Ereignisse mit Feature-Flags vermischen.** In vielen Harnessen teilen sie Namenskonventionen, erfüllen aber unterschiedliche Rollen. Nach Kategorie taggen (Schritt 1), damit die kategorieweise Analyse sauber bleibt.
- **Nie veröffentlichte Versionen stillschweigend überspringen.** Eine Lücke in der Versionsreihe ohne Annotation sieht aus wie ein verpasster Scan. Explizit annotieren: `_annotation: "never-published"`.
- **Schwellen festlegen, bevor Baseline-Daten existieren.** Der erste Scan etabliert die empirischen Gewichtssummen; die Schwellen daran ausrichten, nicht vorab.
- **Frühere Versionseinträge umschreiben, wenn der Katalog wächst.** Vergangene Einträge sind Evidenz; Addenda sind das unterstützte Muster für nachträgliche Scans.
- **Leerer Scan-Ausgabe vertrauen.** „Null Marker gefunden" bedeutet nicht immer „abwesend". Vor einer Entfernungs-Erklärung bestätigen, dass das Binary lesbar ist und die Katalog-IDs exakt übereinstimmen.
- **`strings -n 4` für gründlicher halten als `-n 8`.** Niedrigere Mindestwerte fügen Lärm schneller hinzu als Signal. Diagnostische Marker sind praktisch immer 8+ Zeichen lang.

## Verwandte Skills

- `security-audit-codebase` — geteilte Disziplin; beide Pipelines behandeln Marker-Präsenz als Befund, mit unterschiedlichen nachgelagerten Konsumenten
- `audit-dependency-versions` — überträgt dieselbe Versionsverfolgungs-Strenge auf externe Abhängigkeits-Manifeste; dieser Skill wendet sie auf Binär-Artefakte an
- `probe-feature-flag-state` — Phase-2-3-Folgeschritt; konsumiert Baselines, um den Flag-Rollout-Zustand zu klassifizieren (live / opt-in / dark / removed)
- `conduct-empirical-wire-capture` — Phase-4-Folgeschritt; validiert inferiertes Verhalten gegen tatsächlichen Harness-Verkehr
- `redact-for-public-disclosure` — Phase-5-Folgeschritt; regelt, welche Befunde den privaten Arbeitsbereich verlassen dürfen
