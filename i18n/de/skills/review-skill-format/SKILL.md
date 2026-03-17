---
name: review-skill-format
description: >
  Prueft eine SKILL.md-Datei auf Konformitaet mit dem agentskills.io-Standard.
  Ueberprueft YAML-Frontmatter-Felder, erforderliche Abschnitte, Zeilenzahl-
  Limits, Prozedurschritt-Format und Registry-Synchronisation. Verwenden wenn
  ein neuer Skill vor dem Merge auf Format validiert werden muss, ein bestehender
  Skill nach Aenderungen neu validiert werden muss, bei einem Batch-Audit aller
  Skills in einer Domain oder beim Review einer Skill-Einreichung eines
  Mitwirkenden in einem Pull Request.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, format, validation, agentskills, quality
---

# Skill-Format reviewen

Eine SKILL.md-Datei gegen den agentskills.io-Open-Standard validieren. Dieser Skill prueft YAML-Frontmatter-Vollstaendigkeit, Anwesenheit erforderlicher Abschnitte, Prozedurschritt-Format (Expected/On-failure-Bloecke), Zeilenzahl-Limits und Registry-Synchronisation. Vor dem Zusammenfuehren eines neuen oder geaenderten Skills verwenden.

## Wann verwenden

- Ein neuer Skill wurde erstellt und muss vor dem Merge auf Format validiert werden
- Ein bestehender Skill wurde geaendert und muss neu validiert werden
- Batch-Audit aller Skills in einer Domain
- Verifizierung eines mit dem `create-skill`-Meta-Skill erstellten Skills
- Review einer Skill-Einreichung eines Mitwirkenden in einem Pull Request

## Eingaben

- **Erforderlich**: Pfad zur SKILL.md-Datei (z. B. `skills/setup-vault/SKILL.md`)
- **Optional**: Strenge-Niveau (`lenient` oder `strict`, Standard: `strict`)
- **Optional**: Ob Registry-Synchronisation geprueft werden soll (Standard: ja)

## Vorgehensweise

### Schritt 1: Datei verifizieren und Inhalt lesen

Bestaetigen, dass die SKILL.md-Datei am erwarteten Pfad existiert, und den vollstaendigen Inhalt lesen.

```bash
# Datei-Existenz pruefen
test -f skills/<skill-name>/SKILL.md && echo "EXISTIERT" || echo "FEHLT"

# Zeilen zaehlen
wc -l < skills/<skill-name>/SKILL.md
```

**Erwartet:** Datei existiert und Inhalt ist lesbar. Zeilenanzahl wird angezeigt.

**Bei Fehler:** Wenn die Datei nicht existiert, den Pfad auf Tippfehler pruefen. Skill-Verzeichnis mit `ls skills/<skill-name>/` verifizieren. Wenn das Verzeichnis fehlt, wurde der Skill noch nicht erstellt — zuerst `create-skill` verwenden.

### Schritt 2: YAML-Frontmatter-Felder pruefen

Den YAML-Frontmatter-Block (zwischen `---`-Trennzeichen) parsen und pruefen, ob alle erforderlichen und empfohlenen Felder vorhanden sind.

Erforderliche Felder:
- `name` — entspricht dem Verzeichnisnamen (kebab-case)
- `description` — unter 1024 Zeichen, beginnt mit einem Verb
- `license` — typischerweise `MIT`
- `allowed-tools` — durch Komma oder Leerzeichen getrennte Tool-Liste

Empfohlene Metadaten-Felder:
- `metadata.author` — Autorenname
- `metadata.version` — semantische Versionszeichenkette
- `metadata.domain` — eine der in `skills/_registry.yml` aufgelisteten Domains
- `metadata.complexity` — eines von: `basic`, `intermediate`, `advanced`
- `metadata.language` — primaere Sprache oder `multi`
- `metadata.tags` — durch Komma getrennt, 3-6 Tags, enthaelt Domain-Namen

```bash
# Pruefe ob erforderliche Frontmatter-Felder vorhanden sind
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: FEHLT"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: FEHLT"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: FEHLT"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: FEHLT"
```

**Erwartet:** Alle vier erforderlichen Felder vorhanden. Alle sechs Metadaten-Felder vorhanden. `name` stimmt mit Verzeichnisname ueberein. `description` ist unter 1024 Zeichen.

**Bei Fehler:** Jedes fehlende Feld als BLOCKING melden. Wenn `name` nicht mit dem Verzeichnisnamen uebereinstimmt, als BLOCKING mit dem erwarteten Wert melden. Wenn `description` 1024 Zeichen ueberschreitet, als SUGGEST mit aktueller Laenge melden.

### Schritt 3: Erforderliche Abschnitte pruefen

Verifizieren, dass alle sechs erforderlichen Abschnitte im Skill-Koerper (nach Frontmatter) vorhanden sind.

Erforderliche Abschnitte:
1. `## When to Use`
2. `## Inputs`
3. `## Procedure` (mit `### Step N:`-Unterabschnitten)
4. `## Validation` (kann auch als `## Validation Checklist` erscheinen)
5. `## Common Pitfalls`
6. `## Related Skills`

```bash
# Jeden erforderlichen Abschnitt pruefen
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: FEHLT"
done

# Validierungsabschnitt kann beide Ueberschriften verwenden
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: FEHLT"
```

**Erwartet:** Alle sechs Abschnitte vorhanden. Procedure-Abschnitt enthaelt mindestens eine `### Step`-Unterueberschrift.

**Bei Fehler:** Jeden fehlenden Abschnitt als BLOCKING melden. Ein Skill ohne alle sechs Abschnitte ist nicht konform mit dem agentskills.io-Standard. Abschnittsvorlage aus dem `create-skill`-Meta-Skill bereitstellen.

### Schritt 4: Prozedurschritt-Format pruefen

Verifizieren, dass jeder Prozedurschritt dem erforderlichen Muster folgt: nummerierter Schritttitel, Kontext, Code-Block(e) und **Expected:**/**On failure:**-Bloecke.

Fuer jeden `### Step N:`-Unterabschnitt pruefen:
1. Schritt hat einen beschreibenden Titel (nicht nur "Step N")
2. Mindestens ein Code-Block oder konkrete Anweisung vorhanden
3. Ein `**Expected:**`-Block vorhanden
4. Ein `**On failure:**`-Block vorhanden

**Erwartet:** Jeder Prozedurschritt hat sowohl **Expected:**- als auch **On failure:**-Bloecke. Schritte enthalten konkreten Code oder Anweisungen, keine vagen Beschreibungen.

**Bei Fehler:** Jeden Schritt, dem Expected/On failure fehlt, als BLOCKING melden. Wenn Schritte nur vage Anweisungen enthalten ("das System angemessen konfigurieren"), als SUGGEST mit einem Hinweis melden, konkrete Befehle hinzuzufuegen.

### Schritt 5: Zeilenzahl verifizieren

Pruefen, dass die SKILL.md innerhalb des 500-Zeilen-Limits liegt.

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines Zeilen)" || echo "UEBER LIMIT ($lines Zeilen > 500)"
```

**Erwartet:** Zeilenzahl betraegt 500 oder weniger.

**Bei Fehler:** Wenn ueber 500 Zeilen, als BLOCKING melden. Empfehlen, den `refactor-skill-structure`-Skill zu verwenden, um Code-Bloecke mit mehr als 15 Zeilen in `references/EXAMPLES.md` auszulagern. Typische Reduktion: 20-40% durch Auslagern erweiterter Beispiele.

### Schritt 6: Registry-Synchronisation pruefen

Verifizieren, dass der Skill in `skills/_registry.yml` unter der korrekten Domain mit uebereinstimmenden Metadaten aufgelistet ist.

Pruefen:
1. Skill-`id` existiert unter dem korrekten Domain-Abschnitt
2. `path` stimmt mit `<skill-name>/SKILL.md` ueberein
3. `complexity` stimmt mit Frontmatter ueberein
4. `description` ist vorhanden (kann abgekuerzt sein)
5. `total_skills`-Zaehler oben in der Registry stimmt mit tatsaechlicher Skill-Anzahl ueberein

```bash
# Pruefen ob Skill in der Registry ist
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: GEFUNDEN" || echo "Registry: NICHT GEFUNDEN"

# Pfad pruefen
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Pfad: OK" || echo "Pfad: STIMMT NICHT UEBEREIN"
```

**Erwartet:** Skill in der Registry unter der korrekten Domain mit uebereinstimmendem Pfad und Metadaten aufgelistet. Gesamtanzahl korrekt.

**Bei Fehler:** Wenn nicht in der Registry gefunden, als BLOCKING melden. Registry-Eintragsvorlage bereitstellen:
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: Einzeilige Beschreibung
```

## Validierung

- [ ] SKILL.md-Datei existiert am erwarteten Pfad
- [ ] YAML-Frontmatter wird ohne Fehler geparst
- [ ] Alle vier erforderlichen Frontmatter-Felder vorhanden (`name`, `description`, `license`, `allowed-tools`)
- [ ] Alle sechs Metadaten-Felder vorhanden (`author`, `version`, `domain`, `complexity`, `language`, `tags`)
- [ ] `name`-Feld stimmt mit Verzeichnisname ueberein
- [ ] `description` ist unter 1024 Zeichen
- [ ] Alle sechs erforderlichen Abschnitte vorhanden (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- [ ] Jeder Prozedurschritt hat **Expected:**- und **On failure:**-Bloecke
- [ ] Zeilenzahl betraegt 500 oder weniger
- [ ] Skill ist in `_registry.yml` mit korrekter Domain, Pfad und Metadaten aufgelistet
- [ ] `total_skills`-Zaehler in der Registry ist korrekt

## Haeufige Stolperfallen

- **Frontmatter nur mit Regex pruefen**: YAML-Parsing kann subtil sein. Ein `description: >`-Mehrzeilenblock sieht anders aus als `description: "inline"`. Beide Muster beim Suchen nach Feldern pruefen.
- **Validierungsabschnitt-Variante uebersehen**: Einige Skills verwenden `## Validation Checklist` statt `## Validation`. Beide sind akzeptabel; auf beide Ueberschriften pruefen.
- **Registry-Gesamtanzahl vergessen**: Nach Hinzufuegen eines Skills zur Registry muss die `total_skills`-Zahl oben ebenfalls erhoehen werden. Dies wird haeufig in PRs uebersehen.
- **Name vs. Titel-Verwechslung**: Das `name`-Feld muss kebab-case sein und dem Verzeichnisnamen entsprechen. Die `# Titel`-Ueberschrift ist fuer Menschen lesbar und kann abweichen (z. B. name: `review-skill-format`, Titel: `# Review Skill Format`).
- **Lenient-Modus laesst Blocker durch**: Auch im lenient-Modus sollten fehlende erforderliche Abschnitte und Frontmatter-Felder noch markiert werden. Lenient-Modus lockert nur Stil- und Metadaten-Empfehlungen.

## Verwandte Skills

- `create-skill` — Die kanonische Formatspezifikation; als massgebliche Referenz verwenden, wie eine gueltige SKILL.md aussieht
- `update-skill-content` — Nach bestandener Formatvalidierung diesen Skill verwenden, um Inhaltsqualitaet zu verbessern
- `refactor-skill-structure` — Wenn ein Skill die Zeilenzahl-Pruefung nicht besteht, Struktur refaktorieren, um Platz zu schaffen
- `review-pull-request` — Beim Review eines PRs, der Skills hinzufuegt oder aendert, PR-Review mit Formatvalidierung kombinieren
