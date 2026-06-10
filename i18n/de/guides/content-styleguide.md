---
title: "Content Styleguide"
description: "Canonical markdown formatting conventions for skills, agents, teams, and guides — tables, code fences, headings, lists, and links"
category: reference
agents: [skill-reviewer]
teams: []
skills: [create-skill, review-skill-format]
locale: de
source_locale: en
source_commit: 3a22685a
translator: "Claude + human review"
translation_date: "2026-06-04"
---

# Inhalts-Styleguide

Dieser Leitfaden definiert die kanonischen Konventionen für die **Markdown-Formatierung** jeder Inhaltsdatei im Repository — Skills (`skills/*/SKILL.md`), Agenten (`agents/*.md`), Teams (`teams/*.md`) und Leitfäden (`guides/*.md`). Die vier `_template.md`-Dateien decken die *Struktur* ab (erforderliche Abschnitte, Frontmatter-Felder); dieser Leitfaden deckt die *Formatierung* ab (wie das Markdown innerhalb dieser Abschnitte geschrieben wird).

Die nachfolgenden Regeln kodifizieren den **vorherrschenden bestehenden Stil**, damit der Korpus einheitlich liest und überall sauber gerendert wird, wo er konsumiert wird — auf GitHub, auf der statischen Website und im CLI-Seitenrenderer. Sie sind nicht aspirativ: Wo eine Konvention bereits nahezu universell ist (Tabellen mit führendem Pipe, `-`-Aufzählungspunkte), hält dieser Leitfaden sie fest, anstatt eine neue zu erfinden.

## Wann diesen Leitfaden verwenden

- Beim Verfassen eines neuen Skills, Agenten, Teams oder Leitfadens, wenn man die Formatierung gleich beim ersten Mal richtig haben möchte
- Beim Überprüfen eines Inhalts-PR, wenn eine objektive Formatierungsreferenz benötigt wird
- Beim Bearbeiten einer bestehenden Datei, wenn man sich über den zu verwendenden Tabellen- oder Fence-Stil unsicher ist
- Beim Schreiben oder Erweitern einer CI-Prüfung, die die Inhaltsformatierung validiert
- Beim Beilegen einer Meinungsverschiedenheit darüber, „welcher Stil korrekt ist“

## Voraussetzungen

- Vertrautheit mit [GitHub-Flavored Markdown](https://github.github.com/gfm/) (GFM)
- Das relevante `_template.md` für den Inhaltstyp, den man schreibt (Struktur kommt zuerst; dieser Leitfaden verfeinert die Formatierung)
- Für Skills: [create-skill](../skills/create-skill/SKILL.md) und [creating-skills](creating-skills.md)
- Für Agenten und Teams: [agent-best-practices](agent-best-practices.md) und [creating-agents-and-teams](creating-agents-and-teams.md)

## Workflow-Überblick

Wende diese Konventionen beim Schreiben an, nicht als nachträgliche Aufräumarbeit. Die CI-Prüfung (`validate-content-style.yml`) erzwingt die maschinell erkennbaren Regeln bei Inhalts-PRs — siehe [Durchsetzung](#durchsetzung). Die Struktur (Frontmatter, erforderliche Abschnitte) gehört den Templates und den typspezifischen Validatoren; dieser Leitfaden besitzt die Markdown-Formatierung, die innerhalb dieser Struktur sitzt.

## Tabellen

Verwende GFM-Pipe-Tabellen. Drei Regeln, die alle bereits von der Mehrheit des Korpus befolgt werden:

1. **Kompakte Trennzeile** — exakt drei Bindestriche pro Spalte: `|---|---|---|`. Fülle die Bindestriche **nicht** auf, um sie an die Spaltenbreite anzupassen. Die gerenderte Ausgabe ignoriert die Anzahl der Bindestriche, daher blähen breitenangepasste „dekorative“ Trennzeilen nur den Quelltext auf und erzeugen unübersichtliche Diffs.
2. **Verwende immer führende und abschließende Pipes** — `| a | b |`, niemals `a | b`. Beides ist GFM-konform; die Form mit führendem Pipe ist der Korpus-Standard.
3. **Ausrichtungsmarkierungen nur, wenn sie sinnvoll sind** — füge `:---` (links), `---:` (rechts) oder `:---:` (zentriert) nur hinzu, wenn die Ausrichtung eine Bedeutung trägt (z. B. das Rechtsbündig-Ausrichten einer numerischen Spalte). Lass sie ansonsten weg.

Richtig:

```markdown
| Input | Type | Description |
|---|---|---|
| Layout spec | Configuration | Canvas dimensions and margins |
| Style params | CSS | Colors, fonts, stroke widths |
```

Falsch:

```markdown
| Input        | Type          | Description                    |
|--------------|---------------|--------------------------------|
| Layout spec  | Configuration | Canvas dimensions and margins  |
Style params | CSS | Colors, fonts, stroke widths
```

Das „Falsch“-Beispiel zeigt beide Anti-Muster: breitenangepasste dekorative Bindestriche (Zeile 2) und einen fehlenden führenden Pipe (Zeile 4).

## Code-Fences

- **Tagge immer die Sprache** auf dem öffnenden Fence: `bash`, `r`, `yaml`, `json`, `python`, `markdown`, `text`, `console`, `diff`. Verwende `text` (oder `console` für Shell-Sitzungen mit Prompts/Ausgaben), wenn keine Sprache passt — lass das Tag niemals leer.
- **Verwende eingezäunte Blöcke** (` ``` `), keine eingerückten (4-Leerzeichen-)Codeblöcke. Eingezäunte Blöcke tragen ein Sprach-Tag und sind eindeutig.
- **R-Code** verwendet paketqualifizierte Aufrufe — `devtools::check()`, nicht `library(devtools); check()` — gemäß der repository-weiten R-Konvention. Dieser Leitfaden wiederholt die R-Regeln nicht; siehe [creating-skills](creating-skills.md).
- Um einen eingezäunten Block *innerhalb* eines Beispiels zu zeigen, umschließe das Beispiel mit einem Fence aus vier Backticks, damit die inneren dreifachen Backticks wörtlich gerendert werden.

Richtig:

```bash
npm run update-readmes
```

Falsch (ohne Tag — verliert Syntaxhervorhebung und ist schwerer zu überblicken):

````markdown
```
npm run update-readmes
```
````

## Überschriften

- **ATX-Stil** (`#`), mit einem einzelnen Leerzeichen nach den Rauten: `## Section`, niemals `##Section` oder Setext-Unterstreichungen.
- **Ein `#` (H1) pro Datei**, reserviert für den Dokumenttitel. Alle anderen Überschriften sind H2 oder tiefer.
- **Keine übersprungenen Ebenen** — auf ein H2 folgt H2 oder H3, niemals ein direkter Sprung zu H4.
- **Keine abschließenden Rauten** — `## Section`, nicht `## Section ##`.
- Übernimm die Abschnittsnamen, die das relevante `_template.md` vorschreibt; dieser Leitfaden regelt ihre *Form*, nicht ihre *Namen*.

## Listen, Hervorhebung & Inline-Code

- **Ungeordnete Listen verwenden `-`** (Bindestrich), nicht `*` oder `+`. Der Bindestrich ist mit großem Abstand der Korpus-Standard.
- **Geordnete Listen verwenden `1.`** mit einem Punkt. Folge bei Prozedurschritten dem nummerierten Schrittmuster des Templates.
- **Verschachtelte Listenelemente werden um zwei Leerzeichen** unter ihrem übergeordneten Element eingerückt.
- **Fett** ist `**text**`; *kursiv* ist `*text*`. Verwende nicht `__` oder `_` zur Hervorhebung.
- **Inline-Code** verwendet einfache Backticks für Dateipfade, Befehle, Bezeichner und Feldnamen: `skills/_registry.yml`, `total_skills`, `devtools::check()`.
- Skill-Prozedurschritte behalten die Blockkonvention `**Expected:**` / `**On failure:**` bei, die vom Skill-Template definiert wird — dieser Leitfaden ändert sie nicht.

## Links

- **Inline-Links** sind die Vorgabe: `[label](path)`. Links im Referenzstil sind nur akzeptabel, wenn dasselbe Ziel innerhalb eines Dokuments mehrfach wiederverwendet wird.
- **Verwende relative Pfade** für Links innerhalb des Repositories, verankert am Speicherort der jeweiligen Datei:
  - Skill → Skill: `[name](../other-skill/SKILL.md)`
  - Leitfaden → Agent: `[name](../agents/name.md)`
  - Leitfaden → Skill: `[name](../skills/name/SKILL.md)`
  - Leitfaden → Leitfaden: `[name](other-guide.md)`
- **Stelle sicher, dass das Ziel existiert**, bevor du verlinkst. Defekte relative Links sind ein Inhaltsfehler.
- Verwende beschreibenden Linktext, keine nackten URLs oder „hier klicken“.

## Blockzitate & Hinweise

- Verwende `>`-Blockzitate sparsam — für echte Zitate oder kurze Nebenbemerkungen.
- Bevorzuge **fette Inline-Labels** zur Hervorhebung (`**Note:**`, `**Warning:**`) gegenüber schwergewichtiger Hinweis-Syntax, im Einklang mit der bestehenden Verwendung.

## Zeilen- & Datei-Konventionen

- **Zeilenenden sind LF** (`\n`). Die `.gitattributes` des Repositories schreibt `*.md text eol=lf` vor; der Clean-Filter von git normalisiert CRLF bei jedem `git add` zu LF. Das Verfassen mit CRLF erzeugt beim ersten Commit einen Diff über nahezu die gesamte Datei (den „CRLF→LF-Normalisierungs“-Diff) — verfasse in LF, um das zu vermeiden.
- **Beende jede Datei mit einem einzelnen abschließenden Zeilenumbruch.**
- **Frontmatter** ist YAML, abgegrenzt durch `---`, gehalten in der vom Template vorgeschriebenen Reihenfolge. Ordne erforderliche Felder nicht um und entferne sie nicht.
- **Keine harten Tabs** im Markdown-Fließtext; verwende Leerzeichen.
- Umbreche Fließtext weich an natürlichen Satzgrenzen. Es gibt **keine feste Spaltenbegrenzung und keine Ein-Satz-pro-Zeile-Regel** — breche bestehende Absätze nicht allein wegen der Zeilenlänge neu um.

## Durchsetzung

Der Workflow `validate-content-style.yml` läuft bei PRs, die `skills/`, `agents/`, `teams/`, `guides/` oder `i18n/` berühren. Er ist bewusst danach aufgeteilt, wie zuverlässig jede Regel aus einem Diff erkannt werden kann:

| Rule | Mode | Why |
|---|---|---|
| Dekorative Bindestrich-Trennzeilen | **Blockieren** (bei hinzugefügten Zeilen) | Trennzeilen sind selbstidentifizierend und kontextfrei — die zeilenlokale Erkennung ist zuverlässig |
| Code-Fences ohne Tag | **Warnen** | Ein öffnender vs. schließender Fence lässt sich aus einer einzelnen Diff-Zeile nicht unterscheiden; zuverlässige Erkennung erfordert den vollständigen Fence-Zustand der Datei |
| Fehlender führender Pipe | Dokumentiert, nicht erzwungen | Wird im gesamten Korpus bereits zu 100 % befolgt |

Blockierende Prüfungen bewerten **nur hinzugefügte Zeilen**, sodass das Bearbeiten einer Altdatei nicht erzwingt, deren bereits bestehende Verstöße zu normalisieren. Die vollständige Korpus-Normalisierung — das Umschreiben aller bestehenden Tabellen und das Hinzufügen von Sprach-Tags zu ~280 Dateien — wird separat verfolgt; wenn sie eintrifft, steigt die Prüfung auf Fences-ohne-Tag von „Warnen“ zu „Blockieren“ mit dateiweiter Fence-Zustands-Analyse auf.

## Fehlerbehebung

| Problem | Cause | Solution |
|---|---|---|
| Riesiger Diff bei einer einzeiligen Bearbeitung | CRLF-Blob bei `git add` zu LF normalisiert | Erwartet; vermerke es als Fußnote im PR. Verfasse in LF |
| CI bemängelt eine Tabelle, die du nicht geändert hast | Eine hinzugefügte Zeile ist zufällig eine dekorative Trennzeile | Wandle diese Trennzeile in `\|---\|---\|` um; nur hinzugefügte Zeilen werden geprüft |
| Eingezäuntes Beispiel rendert als ein einzelner Block | Inneres ` ``` ` nicht escaped | Umschließe das Beispiel mit einem Fence aus vier Backticks |
| Defekter relativer Link | Falsche Anzahl von `../`-Segmenten | Zähle die Segmente ausgehend vom eigenen Verzeichnis der Datei |

## Verwandte Ressourcen

- [create-skill](../skills/create-skill/SKILL.md) -- Skills verfassen (Struktur + Prozedur)
- [review-skill-format](../skills/review-skill-format/SKILL.md) -- Skill-Formatierung validieren
- [creating-skills](creating-skills.md) -- Skill-Erstellungs-Workflow und R-Konventionen
- [creating-agents-and-teams](creating-agents-and-teams.md) -- Workflow zum Erstellen von Agenten und Teams
- [agent-best-practices](agent-best-practices.md) -- Anleitung zu Agentendesign und -qualität
- [skill-reviewer](../agents/skill-reviewer.md) -- Agent, der die Inhaltsformatierung überprüft
