---
name: evolve-team
description: >
  Entwickelt eine bestehende Teamzusammensetzung weiter, indem ihre Struktur
  direkt verfeinert oder eine spezialisierte Variante erstellt wird. Behandelt
  die Bewertung des aktuellen Teams anhand von Vorlage und Koordinationsmustern,
  das Sammeln von Weiterentwicklungsanforderungen, die Wahl des Umfangs
  (Mitglieder anpassen, Koordinationsmuster aendern, Teams aufteilen/zusammenfuehren),
  das Anwenden von Aenderungen an Teamdatei und CONFIG-Block, das Aktualisieren
  von Versions-Metadaten sowie die Synchronisierung der Registry und Querverweise.
  Verwenden wenn das Mitglieder-Roster eines Teams veraltet ist, das
  Koordinationsmuster nicht mehr passt, Nutzer-Feedback Workflow-Luecken zeigt,
  eine spezialisierte Variante benoetigt wird, oder Agenten der Bibliothek
  hinzugefuegt oder entfernt wurden.
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
  tags: meta, team, evolution, coordination, maintenance
---

# Bestehendes Team weiterentwickeln

Ein Team verbessern, umstrukturieren oder eine spezialisierte Variante eines Teams erstellen, das urspruenglich mit `create-team` verfasst wurde. Dieses Verfahren behandelt die Wartungsseite des Team-Lebenszyklus: Luecken anhand der Vorlage und der Koordinationsmuster bewerten, gezielte Verbesserungen an Zusammensetzung und Workflow anwenden, Versionen erhoehen und Registry sowie Querverweise synchron halten.

## Wann verwenden

- Das Mitglieder-Roster eines Teams ist veraltet, nachdem Agenten hinzugefuegt, entfernt oder weiterentwickelt wurden
- Nutzer-Feedback zeigt Workflow-Engpaesse, unklare Uebergaben oder fehlende Perspektiven
- Das Koordinationsmuster passt nicht mehr zum tatsaechlichen Workflow des Teams (z.B. hub-and-spoke sollte parallel sein)
- Eine spezialisierte Variante wird neben dem Original benoetigt (z.B. `r-package-review` und `r-package-review-security-focused`)
- Die Verantwortlichkeiten der Teammitglieder ueberschneiden sich und benoetigen schaerfere Grenzen
- Der CONFIG-Block ist nicht mehr synchron mit der Prosa-Beschreibung oder der Mitgliederliste
- Ein Team muss in zwei kleinere Teams aufgeteilt oder zwei Teams muessen zusammengefuehrt werden

## Eingaben

- **Erforderlich**: Pfad zur bestehenden Teamdatei zur Weiterentwicklung (z.B. `teams/r-package-review.md`)
- **Erforderlich**: Weiterentwicklungsausloser (Feedback, neue Agenten, Koordinationsfehler, Umfangsueberschneidung, Leistungsprobleme, Agenten-Weiterentwicklung)
- **Optional**: Ziel-Versions-Bump-Groesse (patch, minor, major)
- **Optional**: Ob stattdessen eine spezialisierte Variante erstellt werden soll (Standard: direkt verfeinern)

## Vorgehensweise

### Schritt 1: Das aktuelle Team bewerten

Die bestehende Teamdatei lesen und jeden Abschnitt gegen die Teamvorlage (`teams/_template.md`) bewerten:

| Abschnitt | Was pruefen | Haeufige Probleme |
|-----------|-------------|-------------------|
| Frontmatter | Alle Pflichtfelder (`name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`) | Fehlende `tags`, veraltete `version`, falsches `coordination` |
| Zweck | Klare Multi-Agenten-Begruendung (mindestens zwei unterschiedliche Spezialgebiete) | Koennte von einem einzelnen Agenten erledigt werden |
| Teamzusammensetzung | Tabelle stimmt mit Frontmatter-Mitgliedern ueberein, keine ueberlappenden Verantwortlichkeiten | Veraltete Tabelle, duplizierte Schwerpunkte |
| Koordinationsmuster | Stimmt mit tatsaechlichem Workflow ueberein, ASCII-Diagramm vorhanden | Falsches Muster fuer den Workflow |
| Aufgabenzerlegung | Phasengliederung mit konkreten Aufgaben pro Mitglied | Vage Aufgaben, fehlende Phasen |
| CONFIG-Block | Gueltiges YAML zwischen Markierungen, stimmt mit Frontmatter und Prosa ueberein | Nicht synchron, fehlendes `blocked_by`, ungueltiges YAML |
| Verwendungsszenarien | 2-3 realistische Aktivierungsaufforderungen | Platzhaltertext |
| Einschraenkungen | 3-5 ehrliche Beschraenkungen | Fehlend oder zu generisch |
| Siehe auch | Gueltige Links zu Mitglieder-Agenten, verwandten Teams, Leitfaeden | Veraltete Links |

```bash
# Teamdatei lesen
cat teams/<team-name>.md

# Pruefen ob alle Mitglieder-Agenten noch existieren
grep "id:" teams/<team-name>.md | while read line; do
  agent=$(echo "$line" | grep -oP '(?<=id: )[\w-]+')
  grep "id: $agent" agents/_registry.yml || echo "MISSING: $agent"
done

# Pruefen ob das Team von einem Leitfaden referenziert wird
grep -r "<team-name>" guides/*.md
```

**Erwartet:** Eine Liste spezifischer Luecken, Schwachstellen oder Verbesserungsmoeglichkeiten, nach Abschnitt geordnet.

**Bei Fehler:** Falls die Teamdatei nicht existiert oder kein Frontmatter hat, ist dieser Skill nicht anwendbar — stattdessen `create-team` verwenden, um sie von Grund auf zu erstellen.

### Schritt 2: Weiterentwicklungsanforderungen sammeln

Identifizieren und kategorisieren, was die Weiterentwicklung ausgeloest hat:

| Ausloser | Beispiel | Typischer Umfang |
|----------|---------|-----------------|
| Nutzer-Feedback | "Reviews dauern zu lang, Agenten duplizieren Aufwand" | Verantwortlichkeiten schaerfen oder Muster aendern |
| Neuer Agent verfuegbar | Agent `api-security-analyst` wurde erstellt | Mitglied hinzufuegen |
| Agent weiterentwickelt | `code-reviewer` hat neue Skills bekommen | Mitglieder-Verantwortlichkeiten aktualisieren |
| Agent entfernt | `deprecated-agent` wurde eingestellt | Mitglied entfernen, Aufgaben neu zuweisen |
| Koordinationsfehler | Sequenzielles Team hat unabhaengige Teilaufgaben | Auf parallel wechseln |
| Umfangserweiterung | Team muss auch Deployment abdecken, nicht nur Review | Mitglied hinzufuegen oder Variante erstellen |
| Team zu gross | 6+ Mitglieder verursachen Koordinationsaufwand | In zwei Teams aufteilen |
| Team zu klein | Einzelnes Mitglied erledigt den Grossteil der Arbeit | Mit anderem Team zusammenfuehren oder Mitglieder hinzufuegen |

Die spezifischen Aenderungen vor der Bearbeitung dokumentieren:

```
- Frontmatter: neues Mitglied `api-security-analyst` mit Rolle "API Security Reviewer" hinzufuegen
- Teamzusammensetzung: Zeile zur Zusammensetzungstabelle hinzufuegen
- Aufgabenzerlegung: API-Sicherheits-Review-Aufgaben zur Ausfuehrungsphase hinzufuegen
- CONFIG-Block: Mitglieds- und Aufgabeneintraege hinzufuegen
- Siehe auch: Link zur neuen Agentendatei hinzufuegen
```

**Erwartet:** Eine konkrete Liste von Aenderungen, jede einem spezifischen Abschnitt der Teamdatei zugeordnet.

**Bei Fehler:** Falls die Aenderungen unklar sind, den Benutzer um Klaerung bitten, bevor fortgefahren wird.

### Schritt 3: Weiterentwicklungsumfang waehlen

Diese Entscheidungsmatrix verwenden, um zu bestimmen, ob direkt verfeinert oder eine Variante erstellt werden soll:

| Kriterium | Verfeinerung (direkt) | Spezialisierte Variante (neues Team) |
|-----------|----------------------|-------------------------------------|
| Team-ID | Unveraendert | Neue ID: `<team>-<specialty>` |
| Dateipfad | Dieselbe `.md`-Datei | Neue Datei in `teams/` |
| Versions-Bump | Patch oder Minor | Beginnt bei 1.0.0 |
| Koordination | Kann sich aendern | Kann vom Original abweichen |
| Registry | Bestehenden Eintrag aktualisieren | Neuer Eintrag hinzugefuegt |
| Urspruengliches Team | Direkt modifiziert | Unveraendert, erhaelt Querverweise in Siehe-auch |

**Verfeinerung**: Waehlen beim Anpassen von Mitgliedern, Schaerfen von Verantwortlichkeiten, Beheben des CONFIG-Blocks oder Aendern des Koordinationsmusters. Das Team behaelt seine Identitaet.

**Variante**: Waehlen wenn die weiterentwickelte Version einem wesentlich anderen Anwendungsfall dient, ein anderes Koordinationsmuster erfordert oder eine andere Zielgruppe anspricht. Das Original bleibt fuer seinen bestehenden Anwendungsfall unveraendert.

Zusaetzliche Umfangsentscheidungen:

| Situation | Massnahme |
|-----------|----------|
| Team hat 6+ Mitglieder und ist langsam | In zwei fokussierte Teams aufteilen |
| Zwei Teams mit je 2 Mitgliedern decken angrenzende Domains ab | In ein Team mit 3-4 Mitgliedern zusammenfuehren |
| Das Koordinationsmuster des Teams ist falsch | Verfeinerung — Muster direkt aendern |
| Team braucht voellig anderen Lead | Verfeinerung wenn Lead existiert; zuerst Agenten erstellen wenn nicht |

**Erwartet:** Eine klare Entscheidung — Verfeinerung, Variante, Aufteilen oder Zusammenfuehren — mit Begruendung.

**Bei Fehler:** Im Zweifel Verfeinerung verwenden. Aufteilen oder Zusammenfuehren hat groessere Auswirkungen und sollte mit dem Benutzer bestaetigt werden.

### Schritt 4: Aenderungen an der Teamdatei anwenden

#### Fuer Verfeinerungen

Die bestehende Teamdatei direkt bearbeiten. Konsistenz ueber alle Abschnitte hinweg wahren, die die Teamzusammensetzung referenzieren:

1. **Frontmatter `members[]`**: Mitgliedereintraege hinzufuegen, entfernen oder aktualisieren (jeweils mit `id`, `role`, `responsibilities`)
2. **Teamzusammensetzungs-Tabelle**: Muss genau mit Frontmatter-Mitgliedern uebereinstimmen
3. **Koordinationsmuster**: Prosa und ASCII-Diagramm aktualisieren, falls das Muster sich aendert
4. **Aufgabenzerlegung**: Phasen und Aufgaben pro Mitglied ueberarbeiten, um neue Zusammensetzung widerzuspiegeln
5. **CONFIG-Block**: `members`- und `tasks`-Listen aktualisieren (siehe Schritt 5)
6. **Verwendungsszenarien**: Ueberarbeiten, falls sich die Aktivierungsausloser des Teams geaendert haben
7. **Einschraenkungen**: Aktualisieren, um neue Beschraenkungen widerzuspiegeln oder geloeste zu entfernen
8. **Siehe auch**: Agenten-Links aktualisieren und Verweise auf neue verwandte Teams oder Leitfaeden hinzufuegen

Diese Bearbeitungsregeln befolgen:
- Alle bestehenden Abschnitte erhalten — Inhalte hinzufuegen, keine Abschnitte entfernen
- Beim Hinzufuegen eines Mitglieds es zu ALLEN hinzufuegen: Frontmatter, Zusammensetzungstabelle, Aufgabenzerlegung und CONFIG-Block
- Beim Entfernen eines Mitglieds aus ALLEN jenen Stellen entfernen und seine Aufgaben neu zuweisen
- Jedes Mitglied pruefen: `grep "id: agent-name" agents/_registry.yml`
- Lead in der Mitgliederliste behalten — der Lead ist immer ein Mitglied

#### Fuer Varianten

```bash
# Original als Ausgangspunkt kopieren
cp teams/<team-name>.md teams/<team-name>-<specialty>.md

# Variante bearbeiten:
# - `name` in `<team-name>-<specialty>` aendern
# - `description` aktualisieren um spezialisierten Umfang widerzuspiegeln
# - `coordination`-Muster bei Bedarf anpassen
# - `version` auf "1.0.0" zuruecksetzen
# - Mitglieder, Aufgaben und CONFIG-Block fuer spezialisierten Anwendungsfall anpassen
# - Original in Siehe-auch als Allzweck-Alternative referenzieren
```

**Erwartet:** Die Teamdatei (verfeinert oder neue Variante) besteht die Bewertungscheckliste aus Schritt 1, mit intern konsistenten Abschnitten.

**Bei Fehler:** Falls eine Bearbeitung interne Konsistenz bricht (z.B. CONFIG-Block listet ein Mitglied auf, das nicht im Frontmatter steht), das Frontmatter `members[]` mit der Teamzusammensetzungs-Tabelle, Aufgabenzerlegung und CONFIG-Block vergleichen, um die Diskrepanz zu finden.

### Schritt 5: Den CONFIG-Block aktualisieren

Der CONFIG-Block zwischen `<!-- CONFIG:START -->` und `<!-- CONFIG:END -->` muss mit den Prosa-Abschnitten synchron bleiben. Nach jeder Mitglieds- oder Aufgabenaenderung:

1. Pruefen ob jeder `agent` in CONFIG `members` einem Mitglied im Frontmatter entspricht
2. Pruefen ob jeder `assignee` in CONFIG `tasks` einer Mitglieds-Agenten-ID entspricht
3. `blocked_by`-Abhaengigkeiten aktualisieren, falls sich die Aufgabenreihenfolge geaendert hat
4. Sicherstellen, dass die Synthese-/Abschlussaufgabe alle vorausgehenden Aufgaben referenziert

```yaml
team:
  name: <team-name>
  lead: <lead-agent>
  coordination: <pattern>
  members:
    - agent: <agent-id>
      role: <role-title>
      subagent_type: <agent-id>
  tasks:
    - name: <task-name>
      assignee: <agent-id>
      description: <einzeilig>
    - name: synthesize-results
      assignee: <lead-agent>
      description: Alle Mitglieder-Ausgaben sammeln und synthetisieren
      blocked_by: [<prior-task-names>]
```

**Erwartet:** CONFIG-YAML ist gueltig, alle Agenten und Aufgaben stimmen mit dem Rest der Datei ueberein und `blocked_by` bildet einen gueltigen DAG.

**Bei Fehler:** Den CONFIG-Block-YAML separat parsen, um Syntaxfehler zu finden. Jeden `assignee` gegen die `members`-Liste kreuztesten.

### Schritt 6: Version und Metadaten aktualisieren

Das Feld `version` im Frontmatter gemaess semantischer Versionierung erhoehen:

| Aenderungstyp | Versions-Bump | Beispiel |
|---------------|--------------|---------|
| Formulierungskorrektur, Siehe-auch-Aktualisierung | Patch: 1.0.0 -> 1.0.1 | Veralteten Agenten-Link behoben |
| Neues Mitglied hinzugefuegt, Aufgaben ueberarbeitet | Minor: 1.0.0 -> 1.1.0 | security-analyst-Mitglied hinzugefuegt |
| Koordinationsmuster geaendert, Team umstrukturiert | Major: 1.0.0 -> 2.0.0 | Von hub-and-spoke auf parallel gewechselt |

Auch aktualisieren:
- `updated`-Datum auf das aktuelle Datum
- `tags` falls sich der Domain-Abdeckungsbereich des Teams geaendert hat
- `description` falls der Teamzweck wesentlich anders ist
- `coordination` falls das Muster sich geaendert hat

**Erwartet:** Frontmatter-`version` und `updated` spiegeln Groesse und Datum der Aenderungen wider. Neue Varianten beginnen bei `"1.0.0"`.

**Bei Fehler:** Falls die Version vergessen wird zu erhoehen, gibt es keine Moeglichkeit, den aktuellen Stand vom vorherigen zu unterscheiden. Immer vor dem Committen erhoehen.

### Schritt 7: Registry und Querverweise aktualisieren

#### Fuer Verfeinerungen

Den bestehenden Eintrag in `teams/_registry.yml` aktualisieren, um das ueberarbeitete Frontmatter widerzuspiegeln:

```bash
# Registry-Eintrag des Teams finden
grep -A 10 "id: <team-name>" teams/_registry.yml
```

Felder `description`, `lead`, `members` und `coordination` aktualisieren, um der Teamdatei zu entsprechen. Keine Zaehleraenderung erforderlich.

#### Fuer Varianten

Das neue Team zu `teams/_registry.yml` hinzufuegen:

```yaml
- id: <team-name>-<specialty>
  path: <team-name>-<specialty>.md
  lead: <lead-agent>
  members: [agent-1, agent-2, agent-3]
  coordination: <pattern>
  description: Einzeilige Beschreibung der spezialisierten Variante
```

Dann:
1. `total_teams` am Anfang der Registry hochzaehlen
2. Querverweis in Siehe-auch des urspruenglichen Teams hinzufuegen, der auf die Variante zeigt
3. Querverweis in Siehe-auch der Variante hinzufuegen, der auf das Original zeigt

README-Automatisierung ausfuehren:

```bash
npm run update-readmes
```

**Erwartet:** Registry-Eintrag stimmt mit Teamdatei-Frontmatter ueberein. `npm run update-readmes` beendet mit 0. Fuer Varianten entspricht `total_teams` der tatsaechlichen Anzahl der Teameintraege.

**Bei Fehler:** Falls die Registry-Zaehlung falsch ist, Eintraege mit `grep -c "^  - id:" teams/_registry.yml` zaehlen und die Zaehlung korrigieren.

### Schritt 8: Das weiterentwickelte Team validieren

Die vollstaendige Validierungscheckliste durchfuehren:

- [ ] Teamdatei existiert am erwarteten Pfad
- [ ] YAML-Frontmatter wird fehlerfrei geparst
- [ ] `version` wurde erhoehen (Verfeinerung) oder auf "1.0.0" gesetzt (Variante)
- [ ] `updated`-Datum spiegelt heute wider
- [ ] Alle Pflichtabschnitte vorhanden: Purpose, Team Composition, Coordination Pattern, Task Decomposition, Configuration, Usage Scenarios, Limitations, See Also
- [ ] Frontmatter `members[]` stimmt mit Teamzusammensetzungs-Tabelle ueberein
- [ ] CONFIG-Block-Mitglieder stimmen mit Frontmatter-Mitgliedern ueberein
- [ ] CONFIG-Block-Aufgaben haben gueltige Zugewiesene und `blocked_by`-Referenzen
- [ ] Alle Mitglieder-Agenten-IDs existieren in `agents/_registry.yml`
- [ ] Lead-Agent erscheint in der Mitgliederliste
- [ ] Keine zwei Mitglieder teilen dieselbe primaere Verantwortlichkeit
- [ ] Registry-Eintrag existiert und stimmt mit Frontmatter ueberein
- [ ] Fuer Varianten: `total_teams`-Zaehler stimmt mit tatsaechlicher Anzahl auf der Festplatte ueberein
- [ ] Querverweise sind bidirektional (Original <-> Variante)
- [ ] `git diff` zeigt keine versehentlichen Loeschungen aus dem urspruenglichen Inhalt

```bash
# Frontmatter pruefen
head -25 teams/<team-name>.md

# Alle Mitglieder-Agenten pruefen
for agent in agent-a agent-b agent-c; do
  grep "id: $agent" agents/_registry.yml
done

# Teams auf Festplatte vs. Registry zaehlen
ls teams/*.md | grep -v template | wc -l
grep total_teams teams/_registry.yml

# Alle Aenderungen ueberpruefen
git diff
```

**Erwartet:** Alle Checklistenelemente bestanden. Das weiterentwickelte Team ist bereit zum Committen.

**Bei Fehler:** Jeden fehlschlagenden Punkt einzeln adressieren. Die haeufigsten Post-Weiterentwicklungs-Probleme sind CONFIG-Block-Drift und ein vergessenes `updated`-Datum.

## Validierung

- [ ] Teamdatei existiert und hat gueltiges YAML-Frontmatter
- [ ] `version`-Feld spiegelt die vorgenommenen Aenderungen wider
- [ ] `updated`-Datum ist aktuell
- [ ] Alle Abschnitte vorhanden und intern konsistent
- [ ] Frontmatter `members[]`, Teamzusammensetzungs-Tabelle und CONFIG-Block sind synchron
- [ ] Alle Mitglieder-Agenten-IDs existieren in `agents/_registry.yml`
- [ ] Lead-Agent ist in der Mitgliederliste
- [ ] CONFIG-Block-YAML ist gueltig und parsebar
- [ ] Registry-Eintrag stimmt mit der Teamdatei ueberein
- [ ] Fuer Varianten: neuer Eintrag in `teams/_registry.yml` mit korrektem Pfad
- [ ] Fuer Varianten: `total_teams`-Zaehler aktualisiert
- [ ] Querverweise sind gueltig (keine fehlerhaften Links in Siehe-auch)
- [ ] `git diff` bestaetigt keine versehentliche Inhaltsentfernung

## Haeufige Stolperfallen

- **CONFIG-Block-Drift**: CONFIG-Block, Frontmatter und Prosa-Abschnitte muessen alle ueber Mitglieder und Aufgaben uebereinstimmen. Eines ohne die anderen zu aktualisieren ist der haeufigste Team-Weiterentwicklungsfehler. Nach jeder Aenderung alle drei kreuztesten.
- **Version zu erhoehen vergessen**: Ohne Versions-Bumps gibt es keine Moeglichkeit zu verfolgen, was sich wann geaendert hat. `version` und `updated` immer im Frontmatter vor dem Committen aktualisieren.
- **Verwaiste Mitgliederreferenzen**: Beim Entfernen eines Mitglieds muessen seine Aufgaben in der Aufgabenzerlegung und im CONFIG-Block neu zugewiesen oder entfernt werden. Verwaiste Zugewiesene verursachen Aktivierungsfehler.
- **Falsches Koordinationsmuster nach der Weiterentwicklung**: Parallel-faehige Mitglieder zu einem sequenziellen Team hinzufuegen oder ein Hub-and-Spoke-Team machen, bei dem Agenten die Ausgaben der anderen benoetigen. Die Musterentscheidung aus Schritt 4 von `create-team` nach jeder strukturellen Aenderung neu bewerten.
- **Team nach dem Hinzufuegen von Mitgliedern zu gross**: Teams mit mehr als 5 Mitgliedern sind schwer zu koordinieren. Falls die Weiterentwicklung das Team ueber 5 treibt, erwaegen in zwei fokussierte Teams aufzuteilen.
- **Veraltete Siehe-auch nach Variantenerstellung**: Beim Erstellen einer Variante muessen sowohl das Original als auch die Variante aufeinander verweisen. Einseitige Verweise lassen den Graphen unvollstaendig.

## Verwandte Skills

- `create-team` — Grundlage fuer das Verfassen neuer Teams; evolve-team setzt voraus, dass dies urspruenglich befolgt wurde
- `evolve-skill` — das Parallelverfahren fuer das Weiterentwickeln von SKILL.md-Dateien
- `evolve-agent` — das Parallelverfahren fuer das Weiterentwickeln von Agentendefinitionen
- `commit-changes` — das weiterentwickelte Team mit einer beschreibenden Nachricht committen
