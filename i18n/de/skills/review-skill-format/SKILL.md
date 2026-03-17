---
name: review-skill-format
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Eine SKILL.md-Datei auf Konformitaet mit dem agentskills.io-Standard pruefen.
  Ueberprueft YAML-Frontmatter-Felder, erforderliche Abschnitte,
  Zeilenzahlbeschraenkungen, Format der Vorgehensweisenschritte und
  Registry-Synchronisierung. Anwenden wenn ein neuer Skill vor dem Merge
  Formatvalidierung braucht, ein bestehender Skill geaendert wurde und
  Revalidierung erfordert, bei einer Chargenauditierung aller Skills einer
  Domain oder bei der Pruefung einer Skill-Einreichung eines Mitwirkenden
  in einem Pull Request.
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

# Skill-Format pruefen

Eine SKILL.md-Datei gegen den agentskills.io-Standard validieren. Dieser Skill prueft Vollstaendigkeit der YAML-Frontmatter, Vorhandensein erforderlicher Abschnitte, Format der Vorgehensweisenschritte (Erwartet/Bei-Fehler-Blocks), Zeilenzahlbeschraenkungen und Registry-Synchronisierung. Vor dem Merge jedes neuen oder geaenderten Skills anwenden.

## Wann verwenden

- Ein neuer Skill wurde verfasst und braucht Formatvalidierung vor dem Merge
- Ein bestehender Skill wurde geaendert und braucht Revalidierung
- Chargenauditierung aller Skills einer Domain durchfuehren
- Einen vom `create-skill`-Meta-Skill erstellten Skill verifizieren
- Die Skill-Einreichung eines Mitwirkenden in einem Pull Request pruefen

## Eingaben

- **Erforderlich**: Pfad zur SKILL.md-Datei (z.B. `skills/setup-vault/SKILL.md`)
- **Optional**: Strenge-Stufe (`nachsichtig` oder `streng`, Standard: `streng`)
- **Optional**: Ob Registry-Synchronisierung geprueft werden soll (Standard: ja)

## Vorgehensweise

### Schritt 1: Datei verifizieren und Inhalt lesen

Bestaetigen dass die SKILL.md-Datei am erwarteten Pfad existiert und ihren gesamten Inhalt lesen.

```bash
# Dateiexistenz verifizieren
test -f skills/<skill-name>/SKILL.md && echo "EXISTIERT" || echo "FEHLT"

# Zeilen zaehlen
wc -l < skills/<skill-name>/SKILL.md
```

**Erwartet:** Datei existiert und Inhalt ist lesbar. Zeilenzahl wird angezeigt.

**Bei Fehler:** Wenn die Datei nicht existiert, den Pfad auf Tippfehler pruefen. Verifizieren dass das Skill-Verzeichnis existiert mit `ls skills/<skill-name>/`. Wenn das Verzeichnis fehlt, wurde der Skill noch nicht erstellt -- zuerst `create-skill` verwenden.

### Schritt 2: YAML-Frontmatter-Felder pruefen

Den YAML-Frontmatter-Block (zwischen `---`-Begrenzern) parsen und verifizieren dass alle erforderlichen und empfohlenen Felder vorhanden sind.

Erforderliche Felder:
- `name` -- stimmt mit Verzeichnisname ueberein (Kebab-Case)
- `description` -- unter 1024 Zeichen, beginnt mit einem Verb
- `license` -- typischerweise `MIT`
- `allowed-tools` -- komma- oder leerzeichengetrennte Werkzeugliste

Empfohlene Metadatenfelder:
- `metadata.author` -- Autorenname
- `metadata.version` -- semantische Versionszeichenkette
- `metadata.domain` -- eine der in `skills/_registry.yml` aufgefuehrten Domains
- `metadata.complexity` -- eine von: `basic`, `intermediate`, `advanced`
- `metadata.language` -- Primaersprache oder `multi`
- `metadata.tags` -- kommagetrennt, 3-6 Tags, enthaelt Domaenname

```bash
# Erforderliche Frontmatter-Felder pruefen
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: FEHLT"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: FEHLT"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: FEHLT"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: FEHLT"
```

**Erwartet:** Alle vier erforderlichen Felder vorhanden. Alle sechs Metadatenfelder vorhanden. `name` stimmt mit Verzeichnisname ueberein. `description` ist unter 1024 Zeichen.

**Bei Fehler:** Jedes fehlende Feld als BLOCKIEREND melden. Wenn `name` nicht mit dem Verzeichnisnamen uebereinstimmt, als BLOCKIEREND mit dem erwarteten Wert melden. Wenn `description` 1024 Zeichen ueberschreitet, als VORSCHLAG mit aktueller Laenge melden.

### Schritt 3: Erforderliche Abschnitte pruefen

Verifizieren dass alle sechs erforderlichen Abschnitte im Skill-Koerper vorhanden sind (nach Frontmatter).

Erforderliche Abschnitte:
1. `## Wann verwenden`
2. `## Eingaben`
3. `## Vorgehensweise` (mit `### Schritt N:`-Unterabschnitten)
4. `## Validierung` (kann auch als `## Validierungscheckliste` erscheinen)
5. `## Haeufige Stolperfallen`
6. `## Verwandte Skills`

```bash
# Jeden erforderlichen Abschnitt pruefen
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: FEHLT"
done

# Validierungsabschnitt kann beide Ueberschriften verwenden
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: FEHLT"
```

**Erwartet:** Alle sechs Abschnitte vorhanden. Vorgehensweisesabschnitt enthaelt mindestens eine `### Step`-Unterueberschrift.

**Bei Fehler:** Jeden fehlenden Abschnitt als BLOCKIEREND melden. Ein Skill ohne alle sechs Abschnitte ist nicht konform mit dem agentskills.io-Standard. Die Abschnittsvorlage aus dem `create-skill`-Meta-Skill bereitstellen.

### Schritt 4: Format der Vorgehensweisenschritte pruefen

Verifizieren dass jeder Vorgehensweisenschritt dem erforderlichen Muster folgt: nummerierter Schritttitel, Kontext, Codeblock(s) und **Erwartet:**/**Bei Fehler:**-Blocks.

Fuer jeden `### Step N:`-Unterabschnitt pruefen:
1. Der Schritt hat einen beschreibenden Titel (nicht nur "Step N")
2. Mindestens ein Codeblock oder eine konkrete Anweisung existiert
3. Ein `**Erwartet:**`-Block ist vorhanden
4. Ein `**Bei Fehler:**`-Block ist vorhanden

**Erwartet:** Jeder Vorgehensweisenschritt hat sowohl **Erwartet:**- als auch **Bei Fehler:**-Blocks. Schritte enthalten konkreten Code oder Anweisungen, keine vagen Beschreibungen.

**Bei Fehler:** Jeden Schritt dem Erwartet/Bei Fehler fehlt als BLOCKIEREND melden. Wenn Schritte nur vage Anweisungen enthalten ("das System geeignet konfigurieren"), als VORSCHLAG mit Hinweis auf Hinzufuegen konkreter Befehle melden.

### Schritt 5: Zeilenzahl verifizieren

Pruefen dass die SKILL.md innerhalb der 500-Zeilen-Grenze liegt.

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines Zeilen)" || echo "UEBER LIMIT ($lines Zeilen > 500)"
```

**Erwartet:** Zeilenzahl ist 500 oder weniger.

**Bei Fehler:** Wenn ueber 500 Zeilen, als BLOCKIEREND melden. Empfehlen den Skill `refactor-skill-structure` zu verwenden um Codeblocks >15 Zeilen nach `references/EXAMPLES.md` zu extrahieren. Typische Reduktion: 20-40% durch Extraktion erweiterter Beispiele.

### Schritt 6: Registry-Synchronisierung pruefen

Verifizieren dass der Skill in `skills/_registry.yml` unter der korrekten Domain mit uebereinstimmenden Metadaten aufgefuehrt ist.

Pruefen:
1. Skill-`id` existiert unter dem korrekten Domain-Abschnitt
2. `path` stimmt mit `<skill-name>/SKILL.md` ueberein
3. `complexity` stimmt mit Frontmatter ueberein
4. `description` ist vorhanden (kann abgekuerzt sein)
5. `total_skills`-Zahl oben in der Registry stimmt mit tatsaechlicher Skill-Zahl ueberein

```bash
# Pruefen ob Skill in Registry ist
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: GEFUNDEN" || echo "Registry: NICHT GEFUNDEN"

# Pfad pruefen
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Pfad: OK" || echo "Pfad: STIMMT NICHT"
```

**Erwartet:** Skill ist in der Registry unter der korrekten Domain mit uebereinstimmendem Pfad und Metadaten aufgefuehrt. Gesamtzahl ist korrekt.

**Bei Fehler:** Wenn nicht in Registry gefunden, als BLOCKIEREND melden. Die Registry-Eintragsvorlage bereitstellen:
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: Einzeilige Beschreibung
```

## Validierung

- [ ] SKILL.md-Datei existiert am erwarteten Pfad
- [ ] YAML-Frontmatter parst fehlerfrei
- [ ] Alle vier erforderlichen Frontmatter-Felder vorhanden (`name`, `description`, `license`, `allowed-tools`)
- [ ] Alle sechs Metadatenfelder vorhanden (`author`, `version`, `domain`, `complexity`, `language`, `tags`)
- [ ] `name`-Feld stimmt mit Verzeichnisname ueberein
- [ ] `description` ist unter 1024 Zeichen
- [ ] Alle sechs erforderlichen Abschnitte vorhanden (Wann verwenden, Eingaben, Vorgehensweise, Validierung, Haeufige Stolperfallen, Verwandte Skills)
- [ ] Jeder Vorgehensweisenschritt hat **Erwartet:**- und **Bei Fehler:**-Blocks
- [ ] Zeilenzahl ist 500 oder weniger
- [ ] Skill ist in `_registry.yml` mit korrekter Domain, Pfad und Metadaten aufgefuehrt
- [ ] `total_skills`-Zahl in Registry ist korrekt

## Haeufige Stolperfallen

- **Frontmatter nur mit Regex pruefen**: YAML-Parsing kann subtil sein. Ein `description: >`-Mehrzeilenblock sieht anders aus als `description: "inline"`. Beide Muster pruefen wenn nach Feldern gesucht wird.
- **Die Validierungs-Abschnittsvariante uebersehen**: Einige Skills verwenden `## Validierungscheckliste` statt `## Validierung`. Beide sind akzeptabel; auf beide Ueberschriften pruefen.
- **Registry-Gesamtzahl vergessen**: Nach dem Hinzufuegen eines Skills zur Registry muss auch die `total_skills`-Zahl oben inkrementiert werden. Dies wird haeufig in PRs uebersehen.
- **Name vs. Titel Verwechslung**: Das `name`-Feld muss Kebab-Case sein und mit dem Verzeichnisnamen uebereinstimmen. Die `# Titel`-Ueberschrift ist menschenlesbar und kann sich unterscheiden (z.B. name: `review-skill-format`, Titel: `# Skill-Format pruefen`).
- **Nachsichtiger Modus ueberspringt Blockierer**: Auch im nachsichtigen Modus sollten fehlende erforderliche Abschnitte und Frontmatter-Felder weiterhin gemeldet werden. Der nachsichtige Modus lockert nur Stil- und Metadatenempfehlungen.

## Verwandte Skills

- `create-skill` -- Die kanonische Formatspezifikation; als massgebliche Referenz verwenden wie eine gueltige SKILL.md aussieht
- `update-skill-content` -- Nach bestandener Formatvalidierung verwenden um die Inhaltsqualitaet zu verbessern
- `refactor-skill-structure` -- Wenn ein Skill die Zeilenzahlpruefung nicht besteht, zur Extraktion und Neuorganisation verwenden
- `review-pull-request` -- Bei der Pruefung eines PR der Skills hinzufuegt oder aendert, PR-Pruefung mit Formatvalidierung kombinieren
