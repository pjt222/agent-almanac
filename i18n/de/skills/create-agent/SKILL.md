---
name: create-agent
description: >
  Erstellt eine neue Agentendefinitionsdatei gemaess der agent-almanac-
  Agentenvorlage und Registry-Konventionen. Behandelt Persona-Design,
  Werkzeugauswahl, Skill-Zuweisung, Modellwahl, Frontmatter-Schema,
  Pflichtabschnitte, Registry-Integration und Verifikation der
  Erkennungs-Symlinks. Verwenden beim Hinzufuegen eines neuen
  spezialisierten Agenten zur Bibliothek, beim Definieren einer Persona
  fuer einen Claude-Code-Subagenten oder beim Erstellen eines
  domaenspezifischen Assistenten mit kuratierten Skills und Werkzeugen.
locale: de
source_locale: en
source_commit: b4dd42cd
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
  tags: meta, agent, creation, persona, agentskills
---

# Neuen Agenten erstellen

Eine Claude-Code-Subagenten-Persona mit einem klar fokussierten Zweck, kuratierten Werkzeugen, zugewiesenen Skills und vollstaendiger Dokumentation definieren, gemaess der Agentenvorlage und Registry-Konventionen.

## Wann verwenden

- Hinzufuegen eines neuen Spezialisten-Agenten zur Bibliothek fuer eine noch nicht abgedeckte Domain
- Umwandlung eines wiederkehrenden Workflows oder Promptmusters in eine wiederverwendbare Agenten-Persona
- Erstellen eines domaenspezifischen Assistenten mit kuratierten Skills und eingeschraenkten Werkzeugen
- Aufteilen eines zu breiten Agenten in fokussierte, Single-Responsibility-Agenten
- Entwurf eines neuen Teammitglieds vor der Zusammenstellung eines Multi-Agenten-Teams

## Eingaben

- **Erforderlich**: Agentenname (Kleinbuchstaben-Kebab-Case, z.B. `data-engineer`)
- **Erforderlich**: Einzeilige Beschreibung des primaeren Zwecks des Agenten
- **Erforderlich**: Zweckerklaerung, die das Problem beschreibt, das der Agent loest
- **Optional**: Modellauswahl (Standard: `sonnet`; Alternativen: `opus`, `haiku`)
- **Optional**: Prioritaetsstufe (Standard: `normal`; Alternativen: `high`, `low`)
- **Optional**: Liste von Skills aus `skills/_registry.yml` zur Zuweisung
- **Optional**: MCP-Server, die der Agent benoetigt (z.B. `r-mcptools`, `hf-mcp-server`)

## Vorgehensweise

### Schritt 1: Agenten-Persona entwerfen

Eine klare, fokussierte Identitaet fuer den Agenten waehlen:

- **Name**: Kleinbuchstaben-Kebab-Case, beschreibend fuer die Rolle. Mit einem Substantiv oder Domain-Qualifier beginnen: `security-analyst`, `r-developer`, `tour-planner`. Generische Namen wie `helper` oder `assistant` vermeiden.
- **Zweck**: Ein Absatz, der das spezifische Problem erklaert, das dieser Agent loest. Fragen: "Was tut dieser Agent, was kein bestehender Agent abdeckt?"
- **Kommunikationsstil**: Domain beachten. Technische Agenten sollten praezise und zitatschwer sein. Kreative Agenten koennen explorativer sein. Compliance-Agenten sollten formal und pruefungsorientiert sein.

Vor dem Fortfahren auf Ueberschneidungen mit den bestehenden 53 Agenten pruefen:

```bash
grep -i "description:" agents/_registry.yml | grep -i "<eigene-domain-schluesselwoerter>"
```

**Erwartet:** Kein bestehender Agent deckt dieselbe Nische ab. Falls ein bestehender Agent teilweise ueberlappt, erwaegen diesen zu erweitern anstatt einen neuen zu erstellen.

**Bei Fehler:** Falls ein Agent mit erheblicher Ueberschneidung existiert, entweder dessen Skills-Liste erweitern oder den neuen Agenten eingrenzen, um ihn zu ergaenzen statt zu duplizieren.

### Schritt 2: Werkzeuge auswaehlen

Den minimalen Satz an Werkzeugen waehlen, die der Agent benoetigt. Prinzip der minimalen Berechtigungen anwenden:

| Werkzeugset | Wann verwenden | Beispielagenten |
|-------------|---------------|-----------------|
| `[Read, Grep, Glob]` | Nur-Lese-Analyse, Pruefung, Auditierung | code-reviewer, security-analyst, auditor |
| `[Read, Grep, Glob, WebFetch]` | Analyse plus externe Lookups | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | Vollstaendige Entwicklung — Code erstellen/aendern | r-developer, web-developer, devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | Entwicklung plus externe Recherche | polymath, shapeshifter |

`Bash` nicht fuer Agenten einbeziehen, die nur Code analysieren. `WebFetch` oder `WebSearch` nicht einbeziehen, wenn der Agent nicht genuinen Bedarf hat, externe Ressourcen abzufragen.

**Erwartet:** Die Werkzeugliste enthaelt nur Werkzeuge, die der Agent tatsaechlich in seinen primaeren Workflows verwenden wird.

**Bei Fehler:** Die Faehigkeitsliste des Agenten ueberpruefen — falls eine Faehigkeit kein Werkzeug erfordert, das Werkzeug entfernen.

### Schritt 3: Modell waehlen

Das Modell basierend auf der Aufgabenkomplexitaet auswaehlen:

- **`sonnet`** (Standard): Die meisten Agenten. Gutes Gleichgewicht zwischen Reasoning und Geschwindigkeit. Fuer Entwicklung, Pruefung, Analyse und Standard-Workflows verwenden.
- **`opus`**: Komplexes Reasoning, mehrstufige Planung, differenziertes Urteil. Fuer Senior-Level-Agenten, Architekturentscheidungen oder Aufgaben mit tiefer Domainexpertise verwenden.
- **`haiku`**: Einfache, schnelle Antworten. Fuer Agenten verwenden, die unkomplizierte Lookups, Formatierungen oder Vorlagenausfuellungen durchfuehren.

**Erwartet:** Das Modell entspricht den kognitiven Anforderungen der primaeren Anwendungsfaelle des Agenten.

**Bei Fehler:** Im Zweifel `sonnet` verwenden. Nur auf `opus` upgraden, wenn Tests eine unzureichende Reasoning-Qualitaet aufzeigen.

### Schritt 4: Skills zuweisen

Die Skills-Registry durchsuchen und fuer die Domain des Agenten relevante Skills auswaehlen:

```bash
# Alle Skills in einer Domain auflisten
grep -A3 "domain-name:" skills/_registry.yml

# Nach Skills mit Schluesselbegriffen suchen
grep -i "keyword" skills/_registry.yml
```

Die Skills-Liste fuer das Frontmatter erstellen:

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**Wichtig**: Alle Agenten erben automatisch die Standard-Skills (`meditate`, `heal`) aus dem `default_skills`-Feld der Registry. Diese NICHT im Frontmatter des Agenten aufführen, es sei denn, sie sind Kern der Methodik des Agenten (z.B. listet der Agent `mystic` `meditate` auf, weil Meditationsbegleitung sein primaerer Zweck ist).

**Erwartet:** Die Skills-Liste enthaelt 3-15 Skill-IDs, die in `skills/_registry.yml` existieren.

**Bei Fehler:** Pruefen ob jede Skill-ID existiert: `grep "id: skill-name" skills/_registry.yml`. Alle entfernen, die nicht uebereinstimmen.

### Schritt 5: Die Agentendatei schreiben

Vorlage kopieren und Frontmatter ausfuellen:

```bash
cp agents/_template.md agents/<agent-name>.md
```

Das YAML-Frontmatter ausfuellen:

```yaml
---
name: agent-name
description: Ein bis zwei Saetze zur primaeren Faehigkeit und Domain
tools: [Read, Write, Edit, Bash, Grep, Glob]
model: sonnet
version: "1.0.0"
author: Philipp Thoss
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [domain, specialty, relevant-keywords]
priority: normal
max_context_tokens: 200000
skills:
  - assigned-skill-one
  - assigned-skill-two
# Hinweis: Alle Agenten erben Standard-Skills (meditate, heal) aus der Registry.
# Diese nur hier aufführen, wenn sie Kern der Methodik dieses Agenten sind.
# mcp_servers: []  # Bei Bedarf auskommentieren und befuellen
---
```

**Erwartet:** YAML-Frontmatter wird fehlerfrei geparst. Alle Pflichtfelder (`name`, `description`, `tools`, `model`, `version`, `author`) vorhanden.

**Bei Fehler:** YAML-Syntax validieren. Haeufige Probleme: fehlende Anfuehrungszeichen um Versionsstrings, falsche Einrueckung, nicht geschlossene Klammern in Werkzeuglisten.

### Schritt 6: Zweck und Faehigkeiten schreiben

Die Abschnittsplatzhalter der Vorlage ersetzen:

**Zweck**: Ein Absatz, der das spezifische Problem erklaert, das dieser Agent loest und den Mehrwert den er bietet. Konkret sein — Domain, Workflow und Ergebnis benennen.

**Faehigkeiten**: Aufzaehlungsliste mit fettgedruckten Vorsaetzen. Bei vielen Faehigkeiten nach Kategorie gruppieren:

```markdown
## Capabilities

- **Primaere Faehigkeit**: Was der Agent am besten kann
- **Sekundaere Faehigkeit**: Zusaetzliche Funktionalitaet
- **Werkzeugintegration**: Wie er seine Werkzeuge nutzt
```

**Verfuegbare Skills**: Jeden zugewiesenen Skill mit einer kurzen Beschreibung auflisten. Bare Skill-IDs verwenden (die Slash-Command-Namen):

```markdown
## Available Skills

- `skill-id` - Kurze Beschreibung was der Skill tut
```

**Erwartet:** Zweck ist spezifisch (nicht "hilft bei der Entwicklung"), Faehigkeiten sind konkret und pruefbar, Skills-Liste stimmt mit Frontmatter ueberein.

**Bei Fehler:** Falls der Zweck vage wirkt, beantworten: "Welche spezifische Aufgabe wuerde ein Benutzer diesen Agenten bitten zu erledigen?" Diese Antwort als Zweck verwenden.

### Schritt 7: Verwendungsszenarien und Beispiele schreiben

2-3 Verwendungsszenarien bereitstellen, die zeigen, wie der Agent gestartet wird:

```markdown
### Szenario 1: Primaerer Anwendungsfall
Kurze Beschreibung des Hauptszenarios.

> "Verwende den agent-name-Agenten fuer [spezifische Aufgabe]."

### Szenario 2: Alternativer Anwendungsfall
Beschreibung eines anderen gaengigen Anwendungsfalls.

> "Starte den agent-name fuer [andere Aufgabe]."
```

1-2 konkrete Beispiele hinzufuegen, die eine Benutzeranfrage und das erwartete Agentenverhalten zeigen:

```markdown
### Beispiel 1: Grundlegende Nutzung
**Benutzer**: [Spezifische Anfrage]
**Agent**: [Erwartetes Antwortmuster und durchgefuehrte Aktionen]
```

**Erwartet:** Szenarien sind realistisch, Beispiele zeigen echten Mehrwert, Aufrufmuster entsprechen Claude-Code-Konventionen.

**Bei Fehler:** Beispiele gedanklich testen — waere der Agent mit seinen zugewiesenen Werkzeugen und Skills tatsaechlich in der Lage, die Anfrage zu erfuellen?

### Schritt 8: Einschraenkungen und Siehe-auch schreiben

**Einschraenkungen**: 3-5 ehrliche Beschraenkungen. Was der Agent nicht kann, wofuer er nicht verwendet werden sollte, oder wo er schlechte Ergebnisse liefern koennte:

```markdown
## Limitations

- Kann keinen Code in Sprache X ausfuehren (keine Laufzeitumgebung verfuegbar)
- Nicht geeignet fuer Aufgaben die Y erfordern — stattdessen Agent Z verwenden
- Benoetigt MCP-Server ABC zum Laufen fuer volle Funktionalitaet
```

**Siehe auch**: Ergnzende Agenten, relevante Leitfaeden und verwandte Teams querverweisen:

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - behandelt die X-Seite dieses Workflows
- [relevant-guide](../guides/guide-name.md) - Hintergrundwissen fuer diese Domain
- [relevant-team](../teams/team-name.md) - Team das diesen Agenten einschliesst
```

**Erwartet:** Einschraenkungen sind ehrlich und spezifisch. See-Also-Referenzen zeigen auf existierende Dateien.

**Bei Fehler:** Pruefen ob referenzierte Dateien existieren: `ls agents/complementary-agent.md`.

### Schritt 9: Zur Registry hinzufuegen

`agents/_registry.yml` bearbeiten und den neuen Agenteneintrag in alphabetischer Position hinzufuegen:

```yaml
  - id: agent-name
    path: agents/agent-name.md
    description: Dieselbe einzeilige Beschreibung wie im Frontmatter
    tags: [domain, specialty]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

Den `total_agents`-Zaehler am Anfang der Datei hochzaehlen.

**Erwartet:** Registry-Eintrag stimmt mit Agentendatei-Frontmatter ueberein. `total_agents` entspricht der tatsaechlichen Anzahl der Agenteneintraege.

**Bei Fehler:** Eintraege zaehlen mit `grep -c "^  - id:" agents/_registry.yml` und pruefen ob es `total_agents` entspricht.

### Schritt 10: Erkennbarkeit pruefen

Claude Code entdeckt Agenten aus dem Verzeichnis `.claude/agents/`. In diesem Repository ist dieses Verzeichnis ein Symlink zu `agents/`:

```bash
# Pruefen ob der Symlink existiert und aufloest
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

Falls der Symlink `.claude/agents/` intakt ist, sind keine weiteren Massnahmen erforderlich — die neue Agentendatei ist automatisch erkennbar.

README-Automatisierung ausfuehren, um das Agenten-README zu aktualisieren:

```bash
npm run update-readmes
```

**Erwartet:** `.claude/agents/<agent-name>.md` loest sich zur neuen Agentendatei auf. `agents/README.md` beinhaltet den neuen Agenten.

**Bei Fehler:** Falls der Symlink defekt ist, neu erstellen: `ln -sf ../agents .claude/agents`. Falls `npm run update-readmes` fehlschlaegt, pruefen ob `scripts/generate-readmes.js` existiert und `js-yaml` installiert ist.

### Schritt 11: Uebersetzungen anlegen

> **Erforderlich fuer alle Agenten.** Dieser Schritt gilt sowohl fuer menschliche Autoren als auch fuer KI-Agenten, die dieser Vorgehensweise folgen. Nicht ueberspringen — fehlende Uebersetzungen sammeln sich zu einem veralteten Backlog an.

Unmittelbar nach dem Committen des neuen Agenten Uebersetzungsdateien fuer alle 4 unterstuetzten Locales anlegen:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- agents <agent-name> "$locale"
done
```

Anschliessend die angelegte Prosa in jeder Datei uebersetzen (Code-Bloecke und IDs bleiben auf Englisch). Abschliessend die Statusdateien neu generieren:

```bash
npm run translation:status
```

**Erwartet:** 4 Dateien unter `i18n/{de,zh-CN,ja,es}/agents/<agent-name>.md` erstellt, alle mit `source_commit`, der dem aktuellen HEAD entspricht. `npm run validate:translations` zeigt 0 Stale-Warnungen fuer den neuen Agenten.

**Bei Fehler:** Falls das Scaffolding fehlschlaegt, pruefen ob der Agent in `agents/_registry.yml` existiert. Falls sich die Statusdateien nicht aktualisieren, `npm run translation:status` explizit ausfuehren — es wird nicht automatisch von CI ausgeloest.

## Validierung

- [ ] Agentendatei existiert unter `agents/<agent-name>.md`
- [ ] YAML-Frontmatter wird fehlerfrei geparst
- [ ] Alle Pflichtfelder vorhanden: `name`, `description`, `tools`, `model`, `version`, `author`
- [ ] `name`-Feld stimmt mit dem Dateinamen (ohne `.md`) ueberein
- [ ] Alle Abschnitte vorhanden: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Skills im Frontmatter existieren in `skills/_registry.yml`
- [ ] Standard-Skills (`meditate`, `heal`) sind NICHT aufgefuehrt, es sei denn sie sind Kern der Agentenmethodik
- [ ] Werkzeugliste folgt dem Prinzip der minimalen Berechtigungen
- [ ] Agent ist in `agents/_registry.yml` mit korrektem Pfad und passenden Metadaten aufgefuehrt
- [ ] `total_agents`-Zaehler in der Registry ist aktualisiert
- [ ] `.claude/agents/`-Symlink loest sich zur neuen Agentendatei auf
- [ ] Keine wesentliche Ueberschneidung mit bestehenden Agenten

## Haeufige Stolperfallen

- **Werkzeug-Ueberversorgung**: `Bash`, `Write` oder `WebFetch` einbeziehen, wenn der Agent nur lesen und analysieren muss. Dies verletzt das Prinzip der minimalen Berechtigungen und kann zu unbeabsichtigten Nebeneffekten fuehren.
- **Fehlende oder falsche Skill-Zuweisungen**: Skill-IDs auflisten, die nicht in der Registry existieren, oder vergessen Skills zuzuweisen. Immer jede Skill-ID mit `grep "id: skill-name" skills/_registry.yml` pruefen.
- **Standard-Skills unnoetig auflisten**: `meditate` oder `heal` zum Agenten-Frontmatter hinzufuegen, obwohl sie bereits aus der Registry geerbt werden. Nur auflisten wenn sie Kern der Agentenmethodik sind.
- **Umfangs-Ueberschneidung mit bestehenden Agenten**: Einen neuen Agenten erstellen, der Funktionalitaet dupliziert, die bereits von einem der 53 bestehenden Agenten abgedeckt wird. Immer zuerst die Registry durchsuchen und erwaegen einen bestehenden Agenten zu erweitern.
- **Vager Zweck und vage Faehigkeiten**: "Hilft bei der Entwicklung" schreiben statt "Geruest fuer R-Pakete mit vollstaendiger Struktur, Dokumentation und CI/CD-Konfiguration". Spezifitaet macht einen Agenten nuetzlich und auffindbar.

## Verwandte Skills

- `create-skill` - Parallelverfahren zum Erstellen von SKILL.md-Dateien anstatt von Agentendateien
- `create-team` - mehrere Agenten zu einem koordinierten Team zusammenstellen
- `commit-changes` - die neue Agentendatei und Registry-Aktualisierung committen
