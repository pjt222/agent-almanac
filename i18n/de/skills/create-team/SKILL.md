---
name: create-team
description: >
  Erstellt eine neue Teamzusammensetzungsdatei gemaess der agent-almanac-
  Teamvorlage und Registry-Konventionen. Behandelt Definition des Teamzwecks,
  Mitgliederauswahl, Wahl des Koordinationsmusters, Aufgabenzerlegungsdesign,
  maschinenlesbaren Konfigurationsblock, Registry-Integration und
  README-Automatisierung. Verwenden beim Definieren eines Multi-Agenten-
  Workflows, beim Zusammenstellen von Agenten fuer einen komplexen
  Pruefungsprozess oder beim Erstellen einer koordinierten Gruppe fuer
  wiederkehrende kollaborative Aufgaben.
locale: de
source_locale: en
source_commit: b4dd42cd # stale — source updated for teams infrastructure fix
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
  tags: meta, team, creation, composition, coordination
---

# Neues Team erstellen

Eine Multi-Agenten-Teamzusammensetzung definieren, die zwei oder mehr Agenten koordiniert, um Aufgaben zu erledigen, die mehrere Perspektiven, Spezialgebiete oder Phasen erfordern. Die resultierende Teamdatei wird in die Teams-Registry integriert und kann in Claude Code namentlich aktiviert werden.

## Wann verwenden

- Eine Aufgabe erfordert mehrere Perspektiven, die ein einzelner Agent nicht liefern kann (z.B. Code-Review plus Sicherheitspruefung plus Architektur-Review)
- Ein wiederkehrender kollaborativer Workflow mit konsistenten Rollenzuweisungen und Uebergabemustern wird benoetigt
- Eine bestehende Agenten-Zusammensetzung wird wiederholt verwendet und soll formalisiert werden
- Ein komplexer Prozess zergliedert sich natuerlich in Phasen oder Spezialgebiete, die von verschiedenen Agenten behandelt werden
- Eine koordinierte Gruppe fuer sprint-basierte, pipeline-basierte oder parallele Arbeit definiert werden soll

## Eingaben

- **Erforderlich**: Teamname (Kleinbuchstaben-Kebab-Case, z.B. `data-pipeline-review`)
- **Erforderlich**: Teamzweck (ein Absatz der beschreibt, welches Problem mehrere Agenten erfordert)
- **Erforderlich**: Lead-Agent (muss in `agents/_registry.yml` existieren)
- **Optional**: Koordinationsmuster (Standard: hub-and-spoke). Eines von: `hub-and-spoke`, `sequential`, `parallel`, `timeboxed`, `adaptive`
- **Optional**: Anzahl der Mitglieder (Standard: 3-4; empfohlener Bereich: 2-5)
- **Optional**: Quellmaterial (bestehender Workflow, Runbook oder Ad-hoc-Teamzusammensetzung zur Formalisierung)

## Vorgehensweise

### Schritt 1: Teamzweck definieren

Artikulieren, welches Problem mehrere gemeinsam arbeitende Agenten erfordert. Ein gueltiger Teamzweck muss antworten:

1. **Welches Ergebnis** liefert dieses Team? (z.B. ein umfassender Pruefbericht, eine bereitgestellte Anwendung, ein Sprint-Inkrement)
2. **Warum kann ein einzelner Agent dies nicht tun?** Mindestens zwei unterschiedliche Spezialgebiete oder Perspektiven identifizieren.
3. **Wann sollte dieses Team aktiviert werden?** Ausloesebedingungen definieren.

Den Zweck als einen Absatz schreiben, den ein Mensch oder Agent lesen kann, um zu entscheiden, ob dieses Team aktiviert werden soll.

**Erwartet:** Ein klarer Absatz, der das Wertangebot des Teams erklaert, mit mindestens zwei identifizierten unterschiedlichen Spezialgebieten.

**Bei Fehler:** Falls keine zwei unterschiedlichen Spezialgebiete identifiziert werden koennen, braucht die Aufgabe wahrscheinlich kein Team. Stattdessen einen einzelnen Agenten mit mehreren Skills verwenden.

### Schritt 2: Lead-Agenten auswaehlen

Der Lead-Agent orchestriert das Team. Einen Agenten aus `agents/_registry.yml` waehlen, der:

- Ueber Domain-Expertise relevant fuer den primaeren Output des Teams verfuegt
- Eingehende Anfragen in Teilaufgaben fuer andere Mitglieder zerlegen kann
- Ergebnisse von mehreren Pruefern zu einem kohaerenten Lieferobjekt zusammenfuehren kann

```bash
# Alle verfuegbaren Agenten auflisten
grep "^  - id:" agents/_registry.yml
```

Der Lead muss auch als Mitglied in der Teamzusammensetzung erscheinen (der Lead ist immer ein Mitglied).

**Erwartet:** Ein Agent als Lead ausgewaehlt, dessen Existenz in der Agenten-Registry bestaetigt.

**Bei Fehler:** Falls kein bestehender Agent fuer die Lead-Rolle passt, zuerst einen erstellen mit dem Skill `create-agent`. Kein Team mit einem Lead erstellen, der nicht als Agentendefinition existiert.

### Schritt 3: Mitglieder-Agenten auswaehlen

2-5 Mitglieder (einschliesslich des Leads) mit klaren, nicht ueberlappenden Verantwortlichkeiten waehlen. Fuer jedes Mitglied definieren:

- **id**: Agentenname aus der Agenten-Registry
- **role**: Ein kurzer Titel (z.B. "Qualitaetspruefer", "Sicherheitsauditor", "Architektur-Reviewer")
- **responsibilities**: Ein Satz der beschreibt, was dieses Mitglied tut, was kein anderes tut

```bash
# Pruefen ob jeder Kandidat-Agent existiert
grep "id: agent-name-here" agents/_registry.yml
```

Nicht-Ueberschneidung pruefen: keine zwei Mitglieder sollten dieselbe primaere Verantwortlichkeit haben. Falls Verantwortlichkeiten sich ueberschneiden, entweder die Rollen zusammenfuehren oder die Grenzen schaerfen.

**Erwartet:** 2-5 Mitglieder ausgewaehlt, jeweils mit einer einzigartigen Rolle und klaren Verantwortlichkeiten, alle in der Agenten-Registry bestaetigt.

**Bei Fehler:** Falls ein benotigter Agent nicht existiert, zuerst einen erstellen. Falls Verantwortlichkeiten zwischen zwei Mitgliedern ueberlappen, sie umschreiben, um Grenzen zu klaeren, oder ein Mitglied entfernen.

### Schritt 4: Koordinationsmuster waehlen

Das Muster waehlen, das am besten zum Workflow des Teams passt. Die fuenf Muster und ihre Anwendungsfaelle:

| Muster | Wann verwenden | Beispielteams |
|--------|---------------|--------------|
| **hub-and-spoke** | Lead verteilt Aufgaben, sammelt Ergebnisse, synthetisiert. Am besten fuer Review- und Audit-Workflows. | r-package-review, gxp-compliance-validation |
| **sequential** | Jeder Agent baut auf der Ausgabe des vorherigen auf. Am besten fuer Pipelines und phasenweise Workflows. | fullstack-web-dev, tending |
| **parallel** | Alle Agenten arbeiten gleichzeitig an unabhaengigen Teilaufgaben. Am besten wenn Teilaufgaben keine Abhaengigkeiten haben. | devops-platform-engineering |
| **timeboxed** | Arbeit in feste Iterationen unterteilt. Am besten fuer laufende Projektarbeit mit einem Backlog. | scrum-team |
| **adaptive** | Team selbst-organisiert sich basierend auf der Aufgabe. Am besten fuer unbekannte oder hochvariable Aufgaben. | opaque-team |

**Entscheidungshilfe:**
- Falls der Lead alle Ergebnisse sehen muss, bevor er Output liefert: **hub-and-spoke**
- Falls Agent B die Ausgabe von Agent A benoetigt, um zu beginnen: **sequential**
- Falls alle Agenten ohne Ergebnisse der anderen arbeiten koennen: **parallel**
- Falls die Arbeit mehrere Iterationen mit Planungszeremonien umfasst: **timeboxed**
- Falls die Aufgabenstruktur nicht im Voraus vorhersagbar ist: **adaptive**

**Erwartet:** Ein Koordinationsmuster mit einer klaren Begruendung fuer die Wahl.

**Bei Fehler:** Im Zweifel hub-and-spoke verwenden. Es ist das haeufigste Muster und funktioniert fuer die meisten Review- und Analyse-Workflows.

### Schritt 5: Aufgabenzerlegung entwerfen

Definieren, wie eine typische eingehende Anfrage auf die Teammitglieder aufgeteilt wird. Als Phasen strukturieren:

1. **Einrichtungsphase**: Was der Lead tut, um die Anfrage zu analysieren und Aufgaben zu erstellen
2. **Ausfuehrungsphase**: Woran jedes Mitglied arbeitet (parallel, sequenziell oder pro Sprint je nach Koordinationsmuster)
3. **Synthesephase**: Wie Ergebnisse gesammelt und das endgueltige Lieferobjekt erstellt wird

Fuer jedes Mitglied 3-5 konkrete Aufgaben auflisten, die sie bei einer typischen Anfrage erledigen wuerden.

**Erwartet:** Eine phasenbezogene Zerlegung mit konkreten Aufgaben pro Mitglied, die dem gewahlten Koordinationsmuster entspricht.

**Bei Fehler:** Falls Aufgaben zu vage sind (z.B. "prueft Dinge"), sie spezifischer machen (z.B. "prueft Code-Stil gegen den tidyverse Style Guide, prueft Testabdeckung, bewertet Fehlermeldungsqualitaet").

### Schritt 6: Die Teamdatei schreiben

Vorlage kopieren und alle Abschnitte ausfuellen:

```bash
cp teams/_template.md teams/<team-name>.md
```

Folgende Abschnitte in dieser Reihenfolge ausfuellen:

1. **YAML-Frontmatter**: `name`, `description`, `lead`, `version` ("1.0.0"), `author`, `created`, `updated`, `tags`, `coordination`, `members[]` (jeweils mit id, role, responsibilities)
2. **Titel**: `# Team Name` (menschenlesbar, Titelschreibweise)
3. **Einfuehrung**: Zusammenfassender Absatz
4. **Zweck**: Warum dieses Team existiert, welche Spezialgebiete es vereint
5. **Teamzusammensetzung**: Tabelle mit Spalten Mitglied, Agent, Rolle, Schwerpunkte
6. **Koordinationsmuster**: Prosabeschreibung plus ASCII-Diagramm des Ablaufs
7. **Aufgabenzerlegung**: Phasengliederung mit konkreten Aufgaben pro Mitglied
8. **Konfiguration**: Maschinenlesbarer CONFIG-Block (siehe Schritt 7)
9. **Verwendungsszenarien**: 2-3 konkrete Szenarien mit Beispiel-Benutzeranfragen
10. **Einschraenkungen**: 3-5 bekannte Beschraenkungen
11. **Siehe auch**: Links zu Mitglieder-Agentendateien und verwandten Skills/Teams

**Erwartet:** Eine vollstaendige Teamdatei mit allen ausgefuellten Abschnitten, ohne verbleibenden Platzhaltertext aus der Vorlage.

**Bei Fehler:** Mit einer bestehenden Teamdatei vergleichen (z.B. `teams/r-package-review.md`), um die Struktur zu pruefen. Nach Vorlage-Platzhalterstrings wie "your-team-name" oder "another-agent" suchen.

### Schritt 7: Den CONFIG-Block schreiben

Der CONFIG-Block zwischen `<!-- CONFIG:START -->` und `<!-- CONFIG:END -->` liefert maschinenlesbares YAML fuer Werkzeuge. So strukturieren:

    <!-- CONFIG:START -->
    ```yaml
    team:
      name: <team-name>
      lead: <lead-agent-id>
      coordination: <pattern>
      members:
        - agent: <agent-id>
          role: <role-title>
          subagent_type: <agent-id>
        # ... fuer jedes Mitglied wiederholen
      tasks:
        - name: <task-name>
          assignee: <agent-id>
          description: <einzeilige Beschreibung>
        # ... fuer jede Aufgabe wiederholen
        - name: synthesize-report
          assignee: <lead-agent-id>
          description: <Synthesebeschreibung>
          blocked_by: [<prior-task-names>]
    ```
    <!-- CONFIG:END -->

Das Feld `subagent_type` ordnet Claude Code-Agententypen zu. Fuer Agenten in `.claude/agents/` die Agenten-ID als `subagent_type` verwenden. `blocked_by` zur Ausdrueckung von Aufgabenabhaengigkeiten verwenden.

**Erwartet:** CONFIG-Block ist gueltiges YAML, alle Agenten stimmen mit denen in der Frontmatter-Mitgliederliste ueberein und Aufgabenabhaengigkeiten bilden einen gueltigen DAG (keine Zyklen).

**Bei Fehler:** YAML-Syntax pruefen. Sicherstellen, dass jeder `assignee` in der Aufgabenliste einem `agent` in der Mitgliederliste entspricht. Pruefen ob `blocked_by` nur Aufgabennamen referenziert, die frueher in der Liste definiert wurden.

### Schritt 8: Zur Registry hinzufuegen

`teams/_registry.yml` bearbeiten, um das neue Team hinzuzufuegen:

```yaml
- id: <team-name>
  path: <team-name>.md
  lead: <lead-agent-id>
  members: [<agent-id-1>, <agent-id-2>, ...]
  coordination: <pattern>
  description: <einzeilige Beschreibung, die dem Frontmatter entspricht>
```

Den `total_teams`-Zaehler am Anfang der Registry aktualisieren.

```bash
# Pruefen ob der Eintrag hinzugefuegt wurde
grep "id: <team-name>" teams/_registry.yml
```

**Erwartet:** Neuer Eintrag erscheint in der Registry, `total_teams`-Zaehler ist um eins erhoeht.

**Bei Fehler:** Falls der Teamname bereits in der Registry existiert, einen anderen Namen waehlen oder den bestehenden Eintrag aktualisieren. Pruefen ob die YAML-Einrueckung mit bestehenden Eintraegen uebereinstimmt.

### Schritt 9: README-Automatisierung ausfuehren

README-Dateien aus der aktualisierten Registry neu generieren:

```bash
npm run update-readmes
```

**Erwartet:** Befehl beendet mit 0, `teams/README.md` listet jetzt das neue Team auf.

**Bei Fehler:** `npm run check-readmes` ausfuehren, um zu sehen, welche Dateien veraltet sind. Falls das Skript fehlschlaegt, pruefen ob `package.json` im Repository-Stamm existiert und `js-yaml` installiert ist (`npm install`).

### Schritt 10: Team-Aktivierung pruefen

Testen, ob das Team in Claude Code aktiviert werden kann:

```
User: Verwende das <team-name>-Team fuer <typische Aufgabenbeschreibung>
```

Claude Code sollte:
1. Die Teamdatei unter `teams/<team-name>.md` finden
2. Lead und Mitglieder identifizieren
3. Das in der Datei beschriebene Koordinationsmuster befolgen

**Erwartet:** Claude Code erkennt den Teamnamen, identifiziert den korrekten Lead und die Mitglieder und befolgt das Koordinationsmuster.

**Bei Fehler:** Pruefen ob die Teamdatei unter `teams/<team-name>.md` liegt (nicht in einem Unterverzeichnis). Pruefen ob alle Mitglieder-Agenten in `.claude/agents/` existieren (das auf `agents/` verweist). Bestaetigen, dass das Team in `teams/_registry.yml` aufgefuehrt ist.

### Schritt 11: Uebersetzungen anlegen

> **Erforderlich fuer alle Teams.** Dieser Schritt gilt sowohl fuer menschliche Autoren als auch fuer KI-Agenten, die dieser Vorgehensweise folgen. Nicht ueberspringen — fehlende Uebersetzungen sammeln sich zu einem veralteten Backlog an.

Unmittelbar nach dem Committen des neuen Teams Uebersetzungsdateien fuer alle 4 unterstuetzten Locales anlegen:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- teams <team-name> "$locale"
done
```

Anschliessend die angelegte Prosa in jeder Datei uebersetzen (Code-Bloecke und IDs bleiben auf Englisch). Abschliessend die Statusdateien neu generieren:

```bash
npm run translation:status
```

**Erwartet:** 4 Dateien unter `i18n/{de,zh-CN,ja,es}/teams/<team-name>.md` erstellt, alle mit `source_commit`, der dem aktuellen HEAD entspricht. `npm run validate:translations` zeigt 0 Stale-Warnungen fuer das neue Team.

**Bei Fehler:** Falls das Scaffolding fehlschlaegt, pruefen ob das Team in `teams/_registry.yml` existiert. Falls sich die Statusdateien nicht aktualisieren, `npm run translation:status` explizit ausfuehren — es wird nicht automatisch von CI ausgeloest.

## Validierung

- [ ] Teamdatei existiert unter `teams/<team-name>.md`
- [ ] YAML-Frontmatter wird fehlerfrei geparst
- [ ] Alle Pflicht-Frontmatter-Felder vorhanden: `name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`
- [ ] Jedes Mitglied im Frontmatter hat `id`, `role` und `responsibilities`
- [ ] Alle Abschnitte vorhanden: Purpose, Team Composition, Coordination Pattern, Task Decomposition, Configuration, Usage Scenarios, Limitations, See Also
- [ ] CONFIG-Block existiert zwischen `<!-- CONFIG:START -->` und `<!-- CONFIG:END -->` Markierungen
- [ ] CONFIG-Block-YAML ist gueltig und parsebar
- [ ] Alle Mitglieder-Agenten-IDs existieren in `agents/_registry.yml`
- [ ] Lead-Agent erscheint in der Mitgliederliste
- [ ] Keine zwei Mitglieder teilen dieselbe primaere Verantwortlichkeit
- [ ] Team ist in `teams/_registry.yml` mit korrektem Pfad, Lead, Mitgliedern und Koordination aufgefuehrt
- [ ] `total_teams`-Zaehler in der Registry ist erhoeht
- [ ] `npm run update-readmes` wird ohne Fehler abgeschlossen

## Haeufige Stolperfallen

- **Zu viele Mitglieder**: Teams mit mehr als 5 Mitgliedern sind schwer zu koordinieren. Der Overhead des Verteilens von Aufgaben und Synthetisierens von Ergebnissen ueberwiegt den Nutzen zusaetzlicher Perspektiven. In zwei Teams aufteilen oder auf wesentliche Spezialgebiete reduzieren.
- **Ueberlappende Verantwortlichkeiten**: Falls zwei Mitglieder beide "Code-Qualitaet pruefen", werden ihre Ergebnisse in Konflikt stehen. Jedes Mitglied muss einen klar unterschiedlichen Schwerpunktbereich haben.
- **Falsches Koordinationsmuster**: hub-and-spoke verwenden, wenn Agenten die Ausgaben der anderen benoetigen (sollte sequential sein), oder sequential verwenden, wenn Agenten unabhaengig arbeiten koennen (sollte parallel sein).
- **Fehlender CONFIG-Block**: Der CONFIG-Block ist kein optionaler Prosa-Schmuck. Werkzeuge lesen ihn, um Teams automatisch mit `TeamCreate` zu erstellen. Ohne ihn ist die Teamdatei nur menschenlesbar.
- **Lead-Agent nicht in der Mitgliederliste**: Der Lead muss auch als Mitglied mit eigener Rolle und Verantwortlichkeiten erscheinen. Ein Lead, der nur "koordiniert" ohne substantielle Arbeit zu leisten, verschwendet einen Slot.

## Verwandte Skills

- `create-skill` - folgt demselben Meta-Muster fuer das Erstellen von SKILL.md-Dateien
- `create-agent` - Agentendefinitionen erstellen, die als Teammitglieder dienen
- `commit-changes` - die neue Teamdatei und Registry-Aktualisierungen committen
