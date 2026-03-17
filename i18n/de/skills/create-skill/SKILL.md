---
name: create-skill
description: >
  Erstellt eine neue SKILL.md-Datei gemaess dem Agent Skills Open Standard
  (agentskills.io). Behandelt Frontmatter-Schema, Abschnittsstruktur, das
  Verfassen effektiver Vorgehensweisen mit Erwartet/Bei-Fehler-Paaren,
  Validierungschecklisten, Querverweise und Registry-Integration. Verwenden
  beim Kodifizieren eines wiederholbaren Verfahrens fuer Agenten, beim
  Hinzufuegen einer neuen Faehigkeit zur Skills-Bibliothek, beim Konvertieren
  eines Leitfadens oder Runbooks in agentenlesbares Format oder beim
  Standardisieren eines Workflows ueber Projekte oder Teams hinweg.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, standard, authoring
---

# Neuen Skill erstellen

Eine SKILL.md-Datei verfassen, die Agentensysteme verwenden koennen, um ein bestimmtes Verfahren auszufuehren.

## Wann verwenden

- Kodifizierung eines wiederholbaren Verfahrens, dem Agenten folgen sollen
- Hinzufuegen einer neuen Faehigkeit zur Skills-Bibliothek
- Konvertierung eines Leitfadens, Runbooks oder einer Checkliste in agentenlesbares Format
- Standardisierung eines Workflows ueber Projekte oder Teams hinweg

## Eingaben

- **Erforderlich**: Aufgabe, die der Skill erledigen soll
- **Erforderlich**: Domain-Klassifizierung — eine der 48 Domains in `skills/_registry.yml`:
  `r-packages`, `jigsawr`, `containerization`, `reporting`, `compliance`, `mcp-integration`,
  `web-dev`, `git`, `general`, `citations`, `data-serialization`, `review`, `bushcraft`,
  `esoteric`, `design`, `defensive`, `project-management`, `devops`, `observability`, `mlops`,
  `workflow-visualization`, `swarm`, `morphic`, `alchemy`, `tcg`, `intellectual-property`,
  `gardening`, `shiny`, `animal-training`, `mycology`, `prospecting`, `crafting`,
  `library-science`, `travel`, `relocation`, `a2a-protocol`, `geometry`, `number-theory`,
  `stochastic-processes`, `theoretical-science`, `diffusion`, `hildegard`, `maintenance`,
  `blender`, `visualization`, `3d-printing`, `lapidary`, `versioning`
- **Erforderlich**: Komplexitaetsstufe (basic, intermediate, advanced)
- **Optional**: Quellmaterial (bestehender Leitfaden, Runbook oder funktionierendes Beispiel)
- **Optional**: Verwandte Skills als Querverweise

## Vorgehensweise

### Schritt 1: Verzeichnis erstellen

Jeder Skill lebt in seinem eigenen Verzeichnis:

```bash
mkdir -p skills/<skill-name>/
```

Benennungskonventionen:
- Kleinbuchstaben-Kebab-Case verwenden: `submit-to-cran`, nicht `SubmitToCRAN`
- Mit einem Verb beginnen: `create-`, `setup-`, `write-`, `deploy-`, `configure-`
- Spezifisch sein: `create-r-dockerfile`, nicht `create-dockerfile`

**Erwartet:** Verzeichnis `skills/<skill-name>/` existiert und der Name folgt Kleinbuchstaben-Kebab-Case beginnend mit einem Verb.

**Bei Fehler:** Falls der Name nicht mit einem Verb beginnt, das Verzeichnis umbenennen. Auf Namenskonflikte pruefen: `ls skills/ | grep <keyword>`, um sicherzustellen, dass kein bestehender Skill einen ueberlappenden Namen hat.

### Schritt 2: YAML-Frontmatter schreiben

```yaml
---
name: skill-name-here
description: >
  Ein bis drei Saetze plus wichtige Aktivierungsausloser. Muss klar genug
  sein, damit ein Agent allein anhand der Beschreibung entscheiden kann,
  ob er diesen Skill aktivieren soll. Max. 1024 Zeichen. Mit einem Verb beginnen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob  # optional, experimentell
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: R | TypeScript | Python | Docker | Rust | multi
  tags: komma, getrennt, kleinbuchstaben, tags
---
```

**Pflichtfelder**: `name`, `description`

**Optionale Felder**: `license`, `allowed-tools` (experimentell), `metadata`, `compatibility`

**Metadatenkonventionen**:
- `complexity`: basic (< 5 Schritte, keine Randfaelle), intermediate (5-10 Schritte, etwas Urteilsvermoegen), advanced (10+ Schritte, erhebliches Domainwissen)
- `language`: Hauptsprache; `multi` fuer sprachenuebergreifende Skills verwenden
- `tags`: 3-6 Tags zur Auffindbarkeit; Domain-Name einbeziehen

**Erwartet:** YAML-Frontmatter wird fehlerfrei geparst, `name` stimmt mit dem Verzeichnisnamen ueberein und `description` ist unter 1024 Zeichen mit klaren Aktivierungsausloesern.

**Bei Fehler:** YAML durch Pruefen auf passende `---`-Begrenzer, korrektes Anzeigen von Versionsstrings (z.B. `"1.0"` nicht `1.0`) und korrekte `>`-Mehrzeilenfaltsyntax fuer das Beschreibungsfeld validieren.

### Schritt 3: Titel und Einfuehrung schreiben

```markdown
# Skill-Titel (Imperativ-Form)

Ein Absatz: was dieser Skill erreicht und den Mehrwert den er bietet.
```

Der Titel sollte dem `name` entsprechen, aber in menschenlesbarer Form. "Submit to CRAN" nicht "submit-to-cran".

**Erwartet:** Eine `#`-Ueberschrift auf oberster Ebene in Imperativform, gefolgt von einem praegnanten Absatz ueber das Ziel des Skills.

**Bei Fehler:** Falls der Titel als Substantivphrase statt als Verbphrase klingt, umschreiben. "Package Submission" wird zu "Submit to CRAN."

### Schritt 4: "Wann verwenden" schreiben

3-5 Ausloesebedingungen auflisten — konkrete Szenarien, in denen ein Agent diesen Skill aktivieren sollte:

```markdown
## When to Use

- Neues R-Paket von Grund auf starten
- Lose R-Skripte in ein Paket konvertieren
- Paketskelett fuer kollaborative Entwicklung einrichten
```

Aus der Perspektive des Agenten schreiben. Dies sind die Bedingungen, die der Agent prueft, um die Aktivierung zu entscheiden.

> **Hinweis**: Die wichtigsten Ausloesebedingungen sollten auch im Frontmatter-Feld `description` erscheinen, da dieses waehrend der Entdeckungsphase gelesen wird, bevor der vollstaendige Hauptteil geladen wird. Der Abschnitt `## When to Use` bietet zusaetzliche Details und Kontext.

**Erwartet:** 3-5 Stichpunkte, die konkrete, beobachtbare Bedingungen beschreiben, unter denen ein Agent diesen Skill aktivieren sollte.

**Bei Fehler:** Falls Ausloser vage wirken ("wenn etwas getan werden muss"), aus der Agentenperspektive neu schreiben: Welcher beobachtbare Zustand oder welche Benutzeranfrage wuerde die Aktivierung ausloesen?

### Schritt 5: "Inputs" schreiben

Erforderliche von optionalen trennen. Typen und Standards genau angeben:

```markdown
## Inputs

- **Required**: Paketname (Kleinbuchstaben, keine Sonderzeichen ausser `.`)
- **Required**: Einzeilige Beschreibung des Paketzwecks
- **Optional**: Lizenztyp (Standard: MIT)
- **Optional**: Ob renv initialisiert werden soll (Standard: ja)
```

**Erwartet:** Der Inputs-Abschnitt trennt klar Erforderliche von optionalen Parametern, jeweils mit einem Typhinweis und Standardwert, wo zutreffend.

**Bei Fehler:** Falls der Typ eines Parameters mehrdeutig ist, ein konkretes Beispiel in Klammern hinzufuegen: "Paketname (Kleinbuchstaben, keine Sonderzeichen ausser `.`)".

### Schritt 6: "Procedure" schreiben

Dies ist das Herzstuck des Skills. Jeder Schritt folgt diesem Muster:

```markdown
### Step N: Aktionstitel

Kontextsatz, der erklaert, was dieser Schritt erreicht.

\```language
konkreter_code("den der Agent ausfuehren kann")
\```

**Expected:** Wie Erfolg aussieht. Spezifisch sein — Datei erstellt, Ausgabe stimmt mit Muster ueberein, Befehl beendet sich mit 0.

**On failure:** Wiederherstellungsschritte. Nicht nur "beheben" sagen — die haeufigste Fehlerursache und deren Loesung angeben.
```

**Effektive Schritte schreiben**:
- Jeder Schritt sollte unabhaengig verifizierbar sein
- Tatsaechlichen Code einbeziehen, keine Pseudocodes
- Den haeufigsten Pfad zuerst, Randfaelle in "On failure"
- 5-10 Schritte sind der optimale Bereich. Unter 5 koennten zu vage sein; ueber 12 sollte in mehrere Skills aufgeteilt werden.
- Auf echte Werkzeuge und echte Befehle verweisen, keine abstrakten Beschreibungen

**Erwartet:** Der Procedure-Abschnitt enthaelt 5-12 nummerierte Schritte, jeweils mit konkretem Code, einem `**Expected:**`-Ergebnis und einer `**On failure:**`-Wiederherstellungsmassnahme.

**Bei Fehler:** Falls einem Schritt Code fehlt, den tatsaechlichen Befehl oder die Konfiguration hinzufuegen. Falls Expected/On failure fehlt, jetzt schreiben — jeder fehlschlagbare Schritt braucht beides.

### Schritt 7: "Validation" schreiben

Eine Checkliste, die der Agent nach Abschluss der Vorgehensweise durchfuehrt:

```markdown
## Validation

- [ ] Kriterium 1 (pruefbar, binaer bestanden/nicht bestanden)
- [ ] Kriterium 2
- [ ] Keine Fehler oder Warnungen in der Ausgabe
```

Jedes Element muss objektiv pruefbar sein. "Code ist sauber" ist schlecht. "`devtools::check()` gibt 0 Fehler zurueck" ist gut.

**Erwartet:** Eine Markdown-Checkliste (`- [ ]`) mit 3-8 binaeren Bestanden/Nicht-bestanden-Kriterien, die ein Agent programmatisch oder durch Inspektion pruefen kann.

**Bei Fehler:** Subjektive Kriterien durch messbare ersetzen. "Gut dokumentiert" wird zu "Alle exportierten Funktionen haben `@param`-, `@return`- und `@examples`-roxygen-Tags."

### Schritt 8: "Common Pitfalls" schreiben

3-6 Fallstricke mit Ursache und Vermeidung:

```markdown
## Common Pitfalls

- **Fallstrickname**: Was schieflaeuft und wie es vermieden wird. Spezifisch ueber Symptom und Loesung sein.
```

Aus echter Erfahrung schoepfen. Die besten Fallstricke sind solche, die erhebliche Zeit vergeuden und nicht offensichtlich sind.

**Erwartet:** 3-6 Fallstricke, jeweils mit einem fettgedruckten Namen, einer Beschreibung was schieflaeuft und wie es vermieden wird.

**Bei Fehler:** Falls Fallstricke generisch wirken ("sei vorsichtig mit X"), sie spezifischer machen: Symptom, Ursache und Loesung benennen. Aus tatsaechlichen Fehlerszenarien waehrend der Entwicklung oder Tests schoepfen.

### Schritt 9: "Related Skills" schreiben

2-5 Skills als Querverweise angeben, die haeufig davor, danach oder zusammen mit diesem verwendet werden:

```markdown
## Related Skills

- `prerequisite-skill` - muss vor diesem Skill durchgefuehrt werden
- `follow-up-skill` - wird haeufig nach diesem Skill durchgefuehrt
- `alternative-skill` - alternativer Ansatz zum gleichen Ziel
```

Das Feld `name` des Skills verwenden (Kebab-Case), nicht den Titel.

**Erwartet:** 2-5 verwandte Skills aufgelistet mit Kebab-Case-IDs und kurzen Beschreibungen der Beziehung (Voraussetzung, Nachfolger, Alternative).

**Bei Fehler:** Pruefen ob jeder referenzierte Skill existiert: `ls skills/<skill-name>/SKILL.md`. Alle Verweise auf Skills entfernen, die umbenannt oder entfernt wurden.

### Schritt 10: Zur Registry hinzufuegen

`skills/_registry.yml` bearbeiten und den neuen Skill unter der entsprechenden Domain hinzufuegen:

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: Einzeilige Beschreibung, die dem Frontmatter entspricht
```

Den `total_skills`-Zaehler am Anfang der Registry aktualisieren.

**Erwartet:** Neuer Eintrag erscheint in `skills/_registry.yml` unter der korrekten Domain, und `total_skills`-Zaehler stimmt mit der tatsaechlichen Anzahl der Skill-Verzeichnisse auf der Festplatte ueberein.

**Bei Fehler:** Skills auf der Festplatte zaehlen mit `find skills -name SKILL.md | wc -l` und gegen `total_skills` in der Registry pruefen. Sicherstellen, dass das Feld `id` genau mit dem Verzeichnisnamen uebereinstimmt.

### Schritt 11: Zitate hinzufuegen (Optional)

Falls der Skill auf etablierten Methoden, Forschungsarbeiten, Softwarepaketen oder Standards basiert, Zitations-Unterdateien im `references/`-Verzeichnis hinzufuegen:

```bash
mkdir -p skills/<skill-name>/references/
```

Zwei Dateien erstellen:

- **`references/CITATIONS.bib`** — Maschinenlesbares BibTeX (Wahrheitsquelle)
- **`references/CITATIONS.md`** — Menschenlesbare gerenderte Referenzen fuer GitHub-Browsing

```bibtex
% references/CITATIONS.bib
@article{author2024title,
  author  = {Author, First and Other, Second},
  title   = {Paper Title},
  journal = {Journal Name},
  year    = {2024},
  doi     = {10.xxxx/xxxxx}
}
```

Zitate sind optional — hinzufuegen wenn die Herkunftsverfolgung wichtig ist (akademische Methoden, veroffentlichte Standards, Regulierungsrahmen).

**Erwartet:** Beide Dateien existieren und `.bib` wird als gueltiges BibTeX geparst.

**Bei Fehler:** BibTeX-Syntax mit `bibtool -d references/CITATIONS.bib` oder einem Online-Validator pruefen.

### Schritt 12: Skill validieren

Lokale Validierungspruefungen vor dem Committen durchfuehren:

```bash
# Zeilenanzahl pruefen (muss <=500 sein)
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# Erforderliche Frontmatter-Felder pruefen
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**Erwartet:** Zeilenanzahl <=500, alle Pflichtfelder vorhanden.

**Bei Fehler:** Falls ueber 500 Zeilen, progressive Disclosure anwenden — grosse Code-Bloecke (>15 Zeilen) in `references/EXAMPLES.md` extrahieren:

```bash
mkdir -p skills/<skill-name>/references/
```

Erweiterte Code-Beispiele, vollstaendige Konfigurationsdateien und Mehrfachvarianten-Beispiele nach `references/EXAMPLES.md` verschieben. Querverweis in SKILL.md hinzufuegen: `See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` Kurze Inline-Ausschnitte (3-10 Zeilen) im Haupt-SKILL.md behalten.

### Schritt 13: Slash-Command-Symlinks erstellen

Symlinks erstellen, damit Claude Code den Skill als `/slash-command` entdeckt:

```bash
# Projektebene (in diesem Projekt verfuegbar)
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# Global (in allen Projekten verfuegbar)
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**Erwartet:** `ls -la .claude/skills/<skill-name>/SKILL.md` loest sich zur Skill-Datei auf.

**Bei Fehler:** Pruefen ob der relative Pfad korrekt ist. Von `.claude/skills/` aus sollte der Pfad `../../skills/<skill-name>` das Skill-Verzeichnis erreichen. `readlink -f` verwenden, um Symlink-Auflosung zu debuggen.

## Validierung

- [ ] SKILL.md existiert unter `skills/<skill-name>/SKILL.md`
- [ ] YAML-Frontmatter wird fehlerfrei geparst
- [ ] Feld `name` stimmt mit dem Verzeichnisnamen ueberein
- [ ] `description` ist unter 1024 Zeichen
- [ ] Alle Pflichtabschnitte vorhanden: When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills
- [ ] Jeder Vorgehensweise-Schritt hat konkreten Code und Expected/On-failure-Paare
- [ ] Related Skills verweisen auf gueltige Skill-Namen
- [ ] Skill ist in `_registry.yml` mit korrektem Pfad aufgefuehrt
- [ ] `total_skills`-Zaehler in der Registry ist aktualisiert
- [ ] SKILL.md ist <=500 Zeilen (bei Ueberschreitung nach `references/EXAMPLES.md` extrahieren)
- [ ] Zitate zu `references/CITATIONS.bib` + `CITATIONS.md` hinzugefuegt, falls Skill auf veroffentlichten Methoden basiert
- [ ] Symlink existiert unter `.claude/skills/<skill-name>`, der auf das Skill-Verzeichnis zeigt
- [ ] Globaler Symlink existiert unter `~/.claude/skills/<skill-name>` (falls global verfuegbar)

## Haeufige Stolperfallen

- **Vage Vorgehensweisen**: "System entsprechend konfigurieren" ist fuer einen Agenten nutzlos. Genaue Befehle, Dateipfade und Konfigurationswerte angeben.
- **Fehlendes On failure**: Jeder fehlschlagbare Schritt braucht Wiederherstellungsanleitung. Agenten koennen nicht improvisieren — das Fallback muss ausgeschrieben sein.
- **Zu breiter Umfang**: Ein Skill, der "gesamte Entwicklungsumgebung einrichten" abdecken will, sollte 3-5 fokussierte Skills sein. Ein Skill = eine Vorgehensweise.
- **Nicht pruefbare Validierung**: "Codequalitaet ist gut" kann nicht verifiziert werden. "Linter besteht mit 0 Warnungen" kann es.
- **Veraltete Querverweise**: Beim Umbenennen oder Entfernen von Skills nach dem alten Namen in allen Related-Skills-Abschnitten suchen.
- **Beschreibung zu lang**: Das Beschreibungsfeld ist das, was Agenten lesen, um die Aktivierung zu entscheiden. Unter 1024 Zeichen halten und Schluesselinformationen voranzustellen.
- **`git mv` auf NTFS-gemounteten Pfaden vermeiden (WSL)**: Auf `/mnt/`-Pfaden kann `git mv` fuer Verzeichnisse fehlerhafte Berechtigungen erstellen. Stattdessen `mkdir -p` + Dateien kopieren + `git rm` des alten Pfades verwenden.

## Beispiele

Ein gut strukturierter Skill folgt dieser Qualitaetscheckliste:
1. Ein Agent kann anhand der Beschreibung allein entscheiden, ob er ihn verwenden soll
2. Der Vorgehensweise kann mechanisch ohne Mehrdeutigkeit gefolgt werden
3. Jeder Schritt hat ein pruefbares Ergebnis
4. Fehlermodi haben konkrete Wiederherstellungspfade
5. Der Skill kann mit verwandten Skills zusammengestellt werden

Groessensreferenz aus dieser Bibliothek:
- Grundlegende Skills: ~80-120 Zeilen
- Mittlere Skills: ~120-180 Zeilen
- Fortgeschrittene Skills: ~180-250 Zeilen
- Skills mit erweiterten Beispielen: SKILL.md <=500 Zeilen + `references/EXAMPLES.md`

## Verwandte Skills

- `evolve-skill` - Skills weiterentwickeln und verfeinern, die mit dieser Vorgehensweise erstellt wurden
- `create-agent` - Parallelverfahren zum Erstellen von Agentendefinitionen
- `create-team` - Parallelverfahren zum Erstellen von Teamzusammensetzungen
- `write-claude-md` - CLAUDE.md kann Skills fuer projektspezifische Workflows referenzieren
- `configure-git-repository` - Skills sollten versionskontrolliert sein
- `commit-changes` - neuen Skill und seine Symlinks committen
- `security-audit-codebase` - Skills auf versehentlich enthaltene Geheimnisse oder Anmeldedaten pruefen
