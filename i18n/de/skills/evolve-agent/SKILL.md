---
name: evolve-agent
description: >
  Entwickelt eine bestehende Agentendefinition weiter, indem ihre Persona direkt
  verfeinert oder eine fortgeschrittene Variante erstellt wird. Behandelt die
  Bewertung des aktuellen Agenten anhand von Best Practices, das Sammeln von
  Weiterentwicklungsanforderungen, die Wahl des Umfangs (Verfeinerung vs. Variante),
  das Anwenden von Aenderungen an Skills, Werkzeugen, Faehigkeiten und
  Einschraenkungen, das Aktualisieren von Versions-Metadaten sowie die
  Synchronisierung der Registry und Querverweise. Verwenden wenn die Skills-Liste
  eines Agenten veraltet ist, Nutzer-Feedback Faehigkeitsluecken zeigt, sich
  Werkzeuganforderungen geaendert haben, eine fortgeschrittene Variante benoetigt
  wird, oder der Umfang des Agenten nach realem Einsatz geschaerft werden muss.
locale: de
source_locale: en
source_commit: 971b2bdc
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
  tags: meta, agent, evolution, maintenance, versioning
---

# Bestehenden Agenten weiterentwickeln

Einen Agenten verbessern, erweitern oder eine fortgeschrittene Variante eines Agenten erstellen, der urspruenglich mit `create-agent` verfasst wurde. Dieses Verfahren behandelt die Wartungsseite des Agenten-Lebenszyklus: Luecken anhand von Best Practices bewerten, gezielte Verbesserungen an der Persona-Definition anwenden, Versionen erhoehen und Registry sowie Querverweise synchron halten.

## Wann verwenden

- Die Skills-Liste eines Agenten ist veraltet, nachdem neue Skills der Bibliothek hinzugefuegt wurden
- Nutzer-Feedback zeigt fehlende Faehigkeiten, unklaren Zweck oder schwache Beispiele
- Werkzeuganforderungen haben sich geaendert (neuer MCP-Server, Werkzeug entfernt, Rechteeinschraenkung erforderlich)
- Der Umfang eines Agenten muss geschaerft werden -- er ueberschneidet sich mit einem anderen Agenten oder ist zu breit
- Eine fortgeschrittene Variante wird neben dem Original benoetigt (z.B. `r-developer` und `r-developer-advanced`)
- Verwandte Agenten oder Teams wurden hinzugefuegt und Querverweise in Siehe-auch sind veraltet

## Eingaben

- **Erforderlich**: Pfad zur bestehenden Agentendatei zur Weiterentwicklung (z.B. `agents/r-developer.md`)
- **Erforderlich**: Weiterentwicklungsausloser (Feedback, neue Skills, Werkzeugaenderung, Umfangsueberschneidung, Teamintegration, entdeckte Einschraenkungen)
- **Optional**: Ziel-Versions-Bump-Groesse (patch, minor, major)
- **Optional**: Ob stattdessen eine fortgeschrittene Variante erstellt werden soll (Standard: direkt verfeinern)

## Vorgehensweise

### Schritt 1: Den aktuellen Agenten bewerten

Die bestehende Agentendatei lesen und jeden Abschnitt gegen die Qualitaetscheckliste aus `guides/agent-best-practices.md` bewerten:

| Abschnitt | Was pruefen | Haeufige Probleme |
|-----------|-------------|-------------------|
| Frontmatter | Alle Pflichtfelder vorhanden (`name`, `description`, `tools`, `model`, `version`, `author`) | Fehlende `tags`, veraltete `version`, falsche `priority` |
| Zweck | Spezifische Problemformulierung, nicht generisch "hilft bei X" | Vage oder ueberlappend mit einem anderen Agenten |
| Faehigkeiten | Konkrete, pruefbare Faehigkeiten mit fettgedruckten Vorsaetzen | Generisch ("behandelt Entwicklung"), keine Gruppierung |
| Verfuegbare Skills | Stimmt mit Frontmatter-`skills`-Liste ueberein, alle IDs existieren in der Registry | Veraltete IDs, fehlende neue Skills, Standard-Skills unnoetig aufgelistet |
| Verwendungsszenarien | 2-3 realistische Szenarien mit Aufrufmustern | Platzhaltertext, unrealistische Beispiele |
| Beispiele | Zeigt Benutzeranfrage und Agentenverhalten | Fehlend oder trivial |
| Einschraenkungen | 3-5 ehrliche Beschraenkungen | Zu wenige, zu vage oder voellig fehlend |
| Siehe auch | Gueltige Querverweise auf Agenten, Leitfaeden, Teams | Veraltete Links zu umbenannten oder entfernten Dateien |

```bash
# Agentendatei lesen
cat agents/<agent-name>.md

# Frontmatter-Parsing pruefen
head -20 agents/<agent-name>.md

# Skills im Frontmatter auf Registry-Existenz pruefen
grep "skills:" -A 20 agents/<agent-name>.md

# Pruefen ob der Agent von einem Team referenziert wird
grep -r "<agent-name>" teams/*.md
```

**Erwartet:** Eine Liste spezifischer Luecken, Schwachstellen oder Verbesserungsmoeglichkeiten, nach Abschnitt geordnet.

**Bei Fehler:** Falls die Agentendatei nicht existiert oder kein Frontmatter hat, ist dieser Skill nicht anwendbar — stattdessen `create-agent` verwenden, um sie von Grund auf zu erstellen.

### Schritt 2: Weiterentwicklungsanforderungen sammeln

Identifizieren und kategorisieren, was die Weiterentwicklung ausgeloest hat:

| Ausloser | Beispiel | Typischer Umfang |
|----------|---------|-----------------|
| Nutzer-Feedback | "Agent hat XSS im Review uebersehen" | Skill oder Faehigkeit hinzufuegen |
| Neue Skills verfuegbar | Bibliothek hat `analyze-api-security` gewonnen | Skills-Liste aktualisieren |
| Werkzeugaenderung | Neuer MCP-Server verfuegbar | Zu tools/mcp_servers hinzufuegen |
| Umfangsueberschneidung | Zwei Agenten beanspruchen beide "Code-Review" | Zweck und Einschraenkungen schaerfen |
| Teamintegration | Agent zu einem neuen Team hinzugefuegt | Siehe-auch aktualisieren, Faehigkeiten pruefen |
| Modell-Upgrade | Aufgabe benoetigt tieferes Reasoning | Modellfeld aendern |
| Rechteeinschraenkung | Agent hat Bash, liest aber nur Dateien | Unnoetige Werkzeuge entfernen |

Die spezifischen Aenderungen vor der Bearbeitung dokumentieren:

```
- Frontmatter: `new-skill-id` zur Skills-Liste hinzufuegen
- Faehigkeiten: Faehigkeit "API-Sicherheitsanalyse" hinzufuegen
- Verfuegbare Skills: `new-skill-id` mit Beschreibung hinzufuegen
- Einschraenkungen: veraltete Einschraenkung ueber fehlenden Skill entfernen
- Siehe auch: Link zu neuem Team hinzufuegen, das diesen Agenten beinhaltet
```

**Erwartet:** Eine konkrete Liste von Aenderungen, jede einem spezifischen Abschnitt der Agentendatei zugeordnet.

**Bei Fehler:** Falls die Aenderungen unklar sind, den Benutzer um Klaerung bitten, bevor fortgefahren wird. Vage Weiterentwicklungsziele erzeugen vage Verbesserungen.

### Schritt 3: Weiterentwicklungsumfang waehlen

Diese Entscheidungsmatrix verwenden, um zu bestimmen, ob direkt verfeinert oder eine Variante erstellt werden soll:

| Kriterium | Verfeinerung (direkt) | Fortgeschrittene Variante (neuer Agent) |
|-----------|----------------------|----------------------------------------|
| Agenten-ID | Unveraendert | Neue ID: `<agent>-advanced` oder `<agent>-<specialty>` |
| Dateipfad | Dieselbe `.md`-Datei | Neue Datei in `agents/` |
| Versions-Bump | Patch oder Minor | Beginnt bei 1.0.0 |
| Modell | Kann sich aendern | Oft hoeher (z.B. sonnet -> opus) |
| Registry | Bestehenden Eintrag aktualisieren | Neuer Eintrag hinzugefuegt |
| Urspruenglicher Agent | Direkt modifiziert | Unveraendert, erhaelt Querverweise in Siehe-auch |

**Verfeinerung**: Waehlen beim Aktualisieren von Skills, Beheben von Dokumentation, Schaerfen des Umfangs oder Anpassen von Werkzeugen. Der Agent behaelt seine Identitaet.

**Variante**: Waehlen wenn die weiterentwickelte Version einer wesentlich anderen Zielgruppe dient, ein anderes Modell erfordert oder Faehigkeiten hinzufuegt, die das Original zu breit machen wuerden. Das Original bleibt fuer einfachere Anwendungsfaelle unveraendert.

**Erwartet:** Eine klare Entscheidung — Verfeinerung oder Variante — mit Begruendung.

**Bei Fehler:** Im Zweifel Verfeinerung verwenden. Eine Variante kann spaeter immer extrahiert werden; es ist schwieriger, eine wieder zusammenzufuehren.

### Schritt 4: Aenderungen an der Agentendatei anwenden

#### Fuer Verfeinerungen

Die bestehende Agentendatei direkt bearbeiten:

- **Frontmatter**: `skills`, `tools`, `tags`, `model`, `priority`, `mcp_servers` nach Bedarf aktualisieren
- **Zweck/Faehigkeiten**: Ueberarbeiten, um neuen Umfang oder hinzugefuegte Funktionalitaet widerzuspiegeln
- **Verfuegbare Skills**: Neue Skills mit Beschreibungen hinzufuegen, veraltete entfernen
- **Verwendungsszenarien**: Hinzufuegen oder ueberarbeiten, um neue Faehigkeiten zu demonstrieren
- **Einschraenkungen**: Nicht mehr geltende entfernen, neue ehrliche hinzufuegen
- **Siehe auch**: Querverweise aktualisieren, um aktuelle Agenten-/Team-/Leitfaden-Landschaft widerzuspiegeln

Diese Bearbeitungsregeln befolgen:
- Alle bestehenden Abschnitte erhalten — Inhalte hinzufuegen, keine Abschnitte entfernen
- Abschnitt "Verfuegbare Skills" mit Frontmatter-`skills`-Liste synchron halten
- Standard-Skills (`meditate`, `heal`) nicht zum Frontmatter hinzufuegen, es sei denn sie sind Kern der Agentenmethodik
- Jede Skill-ID pruefen: `grep "id: skill-name" skills/_registry.yml`

#### Fuer Varianten

```bash
# Original als Ausgangspunkt kopieren
cp agents/<agent-name>.md agents/<agent-name>-advanced.md

# Variante bearbeiten:
# - `name` in `<agent-name>-advanced` aendern
# - `description` aktualisieren um fortgeschrittenen Umfang widerzuspiegeln
# - `model` bei Bedarf erhoehen (z.B. sonnet -> opus)
# - `version` auf "1.0.0" zuruecksetzen
# - Skills, Faehigkeiten und Beispiele fuer fortgeschrittenen Anwendungsfall erweitern
# - Original in Siehe-auch als einfachere Alternative referenzieren
```

**Erwartet:** Die Agentendatei (verfeinert oder neue Variante) besteht die Bewertungscheckliste aus Schritt 1.

**Bei Fehler:** Falls eine Bearbeitung die Dokumentstruktur beschaedigt, `git diff` verwenden, um Aenderungen zu ueberpruefen und partielle Bearbeitungen mit `git checkout -- <file>` rueckgaengig zu machen.

### Schritt 5: Version und Metadaten aktualisieren

Das Feld `version` im Frontmatter gemaess semantischer Versionierung erhoehen:

| Aenderungstyp | Versions-Bump | Beispiel |
|---------------|--------------|---------|
| Tippfehler, Formulierungspraezisierung | Patch: 1.0.0 -> 1.0.1 | Unklare Einschraenkung korrigiert |
| Neue Skills hinzugefuegt, Faehigkeit erweitert | Minor: 1.0.0 -> 1.1.0 | 3 neue Skills aus Bibliothek hinzugefuegt |
| Zweck umstrukturiert, Modell geaendert | Major: 1.0.0 -> 2.0.0 | Umfang eingegrenzt, auf opus upgraded |

Auch aktualisieren:
- `updated`-Datum auf das aktuelle Datum
- `tags` falls sich der Domain-Abdeckungsbereich des Agenten geaendert hat
- `description` falls der Zweck wesentlich anders ist
- `priority` falls sich die Wichtigkeit des Agenten relativ zu anderen geaendert hat

**Erwartet:** Frontmatter-`version` und `updated` spiegeln Groesse und Datum der Aenderungen wider. Neue Varianten beginnen bei `"1.0.0"`.

**Bei Fehler:** Falls die Version vergessen wird zu erhoehen, gibt es keine Moeglichkeit, den aktuellen Stand vom vorherigen zu unterscheiden. Immer vor dem Committen erhoehen.

### Schritt 6: Registry und Querverweise aktualisieren

#### Fuer Verfeinerungen

Den bestehenden Eintrag in `agents/_registry.yml` aktualisieren, um das ueberarbeitete Frontmatter widerzuspiegeln:

```bash
# Registry-Eintrag des Agenten finden
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

Felder `description`, `tags`, `tools` und `skills` aktualisieren, um der Agentendatei zu entsprechen. Keine Zaehleraenderung erforderlich.

Querverweise in anderen Dateien aktualisieren, falls sich Faehigkeiten oder Name des Agenten geaendert haben:

```bash
# Pruefen ob ein Team diesen Agenten referenziert
grep -r "<agent-name>" teams/*.md

# Pruefen ob ein Leitfaden diesen Agenten referenziert
grep -r "<agent-name>" guides/*.md
```

#### Fuer Varianten

Den neuen Agenten in `agents/_registry.yml` in alphabetischer Position hinzufuegen:

```yaml
  - id: <agent-name>-advanced
    path: agents/<agent-name>-advanced.md
    description: Einzeilige Beschreibung der fortgeschrittenen Variante
    tags: [domain, specialty, advanced]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

Dann:
1. `total_agents` am Anfang der Registry hochzaehlen
2. Querverweis in Siehe-auch des urspruenglichen Agenten hinzufuegen, der auf die Variante zeigt
3. Querverweis in Siehe-auch der Variante hinzufuegen, der auf das Original zeigt
4. Der Symlink `.claude/agents/` zu `agents/` bedeutet, dass die Variante automatisch erkennbar ist

**Erwartet:** Registry-Eintrag stimmt mit Agentendatei-Frontmatter ueberein. Fuer Varianten entspricht `total_agents` der tatsaechlichen Anzahl der Agenteneintraege.

**Bei Fehler:** Eintraege zaehlen mit `grep -c "^  - id:" agents/_registry.yml` und pruefen ob es `total_agents` entspricht.

### Schritt 7: Den weiterentwickelten Agenten validieren

Die vollstaendige Validierungscheckliste durchfuehren:

- [ ] Agentendatei existiert am erwarteten Pfad
- [ ] YAML-Frontmatter wird fehlerfrei geparst
- [ ] `version` wurde erhoehen (Verfeinerung) oder auf "1.0.0" gesetzt (Variante)
- [ ] `updated`-Datum spiegelt heute wider
- [ ] Alle Pflichtabschnitte vorhanden: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Skills im Frontmatter stimmen mit dem Abschnitt "Verfuegbare Skills" ueberein
- [ ] Alle Skill-IDs existieren in `skills/_registry.yml`
- [ ] Standard-Skills (`meditate`, `heal`) sind nicht aufgefuehrt, es sei denn sie sind Kern der Methodik
- [ ] Werkzeugliste folgt dem Prinzip der minimalen Berechtigungen
- [ ] Registry-Eintrag existiert und stimmt mit Frontmatter ueberein
- [ ] Fuer Varianten: `total_agents`-Zaehler stimmt mit tatsaechlicher Anzahl auf der Festplatte ueberein
- [ ] Querverweise sind bidirektional (Original <-> Variante)
- [ ] `git diff` zeigt keine versehentlichen Loeschungen aus dem urspruenglichen Inhalt

```bash
# Frontmatter pruefen
head -20 agents/<agent-name>.md

# Skills auf Existenz pruefen
for skill in skill-a skill-b; do
  grep "id: $skill" skills/_registry.yml
done

# Agenten auf Festplatte vs. Registry zaehlen
ls agents/*.md | grep -v template | wc -l
grep total_agents agents/_registry.yml

# Alle Aenderungen ueberpruefen
git diff
```

**Erwartet:** Alle Checklistenelemente bestanden. Der weiterentwickelte Agent ist bereit zum Committen.

**Bei Fehler:** Jeden fehlschlagenden Punkt einzeln adressieren. Die haeufigsten Post-Weiterentwicklungs-Probleme sind veraltete Skill-IDs im Abschnitt "Verfuegbare Skills" und ein vergessenes `updated`-Datum.

## Validierung

- [ ] Agentendatei existiert und hat gueltiges YAML-Frontmatter
- [ ] `version`-Feld spiegelt die vorgenommenen Aenderungen wider
- [ ] `updated`-Datum ist aktuell
- [ ] Alle Abschnitte vorhanden und intern konsistent
- [ ] Frontmatter-`skills`-Array stimmt mit dem Abschnitt "Verfuegbare Skills" ueberein
- [ ] Alle Skill-IDs existieren in `skills/_registry.yml`
- [ ] Standard-Skills nicht unnoetig aufgefuehrt
- [ ] Registry-Eintrag stimmt mit der Agentendatei ueberein
- [ ] Fuer Varianten: neuer Eintrag in `agents/_registry.yml` mit korrektem Pfad
- [ ] Fuer Varianten: `total_agents`-Zaehler aktualisiert
- [ ] Querverweise sind gueltig (keine fehlerhaften Links in Siehe-auch)
- [ ] `git diff` bestaetigt keine versehentliche Inhaltsentfernung

## Haeufige Stolperfallen

- **Version zu erhoehen vergessen**: Ohne Versions-Bumps gibt es keine Moeglichkeit zu verfolgen, was sich wann geaendert hat. `version` und `updated` immer im Frontmatter vor dem Committen aktualisieren.
- **Skills-Listen-Abweichung**: Das Frontmatter-`skills`-Array und der Abschnitt `## Available Skills` muessen synchron bleiben. Eines zu aktualisieren ohne das andere schafft Verwirrung fuer Menschen und Werkzeuge.
- **Standard-Skills unnoetig aufzaehlen**: `meditate` oder `heal` zum Frontmatter hinzufuegen, obwohl sie bereits aus der Registry geerbt werden. Nur auflisten wenn sie Kern der Agentenmethodik sind.
- **Werkzeug-Ueberversorgung bei der Weiterentwicklung**: `Bash` oder `WebFetch` waehrend einer Weiterentwicklung "nur fuer den Fall" hinzufuegen. Jede Werkzeugergaenzung sollte durch eine spezifische neue Faehigkeit gerechtfertigt sein.
- **Veraltete Siehe-auch nach Variantenerstellung**: Beim Erstellen einer Variante muessen sowohl das Original als auch die Variante aufeinander verweisen. Einseitige Verweise lassen den Graphen unvollstaendig.
- **Registry-Eintrag nicht aktualisiert**: Nach der Aenderung von Skills, Werkzeugen oder Beschreibung eines Agenten muss der `agents/_registry.yml`-Eintrag aktualisiert werden. Veraltete Registry-Eintraege verursachen Erkennungs- und Werkzeugfehler.

## Verwandte Skills

- `create-agent` — Grundlage fuer das Verfassen neuer Agenten; evolve-agent setzt voraus, dass dies urspruenglich befolgt wurde
- `evolve-skill` — das Parallelverfahren fuer das Weiterentwickeln von SKILL.md-Dateien
- `commit-changes` — den weiterentwickelten Agenten mit einer beschreibenden Nachricht committen
