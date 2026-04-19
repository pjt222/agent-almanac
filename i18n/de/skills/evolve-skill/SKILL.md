---
name: evolve-skill
description: >
  Entwickelt einen bestehenden Skill weiter, indem sein Inhalt direkt verfeinert
  oder eine fortgeschrittene Variante erstellt wird. Behandelt die Bewertung des
  aktuellen Skills, das Sammeln von Anforderungen, die Wahl des Umfangs
  (Verfeinerung vs. Variante), das Anwenden von Aenderungen, das Aktualisieren
  von Versions-Metadaten und die Synchronisierung der Registry und Querverweise.
  Verwenden wenn Verfahrensschritte eines Skills veraltet sind, Nutzer-Feedback
  Luecken aufzeigt, ein Skill ein Komplexitaets-Upgrade benoetigt, eine
  fortgeschrittene Variante neben dem Original benoetigt wird, oder verwandte
  Skills hinzugefuegt wurden und Querverweise veraltet sind.
locale: de
source_locale: en
source_commit: b4dd42cd
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
  tags: meta, skill, agentskills, maintenance, evolution, versioning
---

# Bestehenden Skill weiterentwickeln

Einen Skill verbessern, erweitern oder eine fortgeschrittene Variante eines Skills erstellen, der urspruenglich mit `create-skill` verfasst wurde. Dieses Verfahren behandelt die Wartungsseite des Skill-Lebenszyklus: Luecken bewerten, gezielte Verbesserungen anwenden, Versionen erhoehen und Registry sowie Querverweise synchron halten.

## Wann verwenden

- Verfahrensschritte eines Skills sind nach Werkzeugaenderungen veraltet oder unvollstaendig
- Nutzer-Feedback zeigt fehlende Fallstricke, unklare Schritte oder schwache Validierung
- Ein Skill muss von basic zu intermediate (oder intermediate zu advanced) wachsen
- Eine fortgeschrittene Variante wird neben dem Original benoetigt (z.B. `create-r-package` und `create-r-package-advanced`)
- Verwandte Skills wurden hinzugefuegt oder entfernt und Querverweise sind veraltet

## Eingaben

- **Erforderlich**: Pfad zur bestehenden SKILL.md zur Weiterentwicklung
- **Erforderlich**: Weiterentwicklungsausloser (Feedback, Werkzeugaenderung, Komplexitaets-Upgrade, neue verwandte Skills, entdeckte Fallstricke)
- **Optional**: Ziel-Komplexitaetsstufe bei Aenderung (basic, intermediate, advanced)
- **Optional**: Ob stattdessen eine fortgeschrittene Variante erstellt werden soll (Standard: direkt verfeinern)

## Vorgehensweise

### Schritt 1: Den aktuellen Skill bewerten

Die bestehende SKILL.md lesen und jeden Abschnitt gegen die Qualitaetscheckliste bewerten:

| Abschnitt | Was pruefen | Haeufige Probleme |
|-----------|-------------|-------------------|
| Frontmatter | Alle Pflichtfelder vorhanden, `description` < 1024 Zeichen | Fehlende `tags`, veraltete `version` |
| When to Use | 3-5 konkrete Ausloesebedingungen | Vage oder ueberlappende Ausloser |
| Inputs | Erforderlich vs. optional klar getrennt | Fehlende Standards fuer optionale Eingaben |
| Procedure | Jeder Schritt hat Code + Expected + On failure | Fehlende On-failure-Bloecke, Pseudocode statt echter Befehle |
| Validation | Jedes Element ist binaer bestanden/nicht bestanden | Subjektive Kriterien ("Code ist sauber") |
| Common Pitfalls | 3-6 mit Ursache und Vermeidung | Zu generisch ("sei vorsichtig") |
| Related Skills | 2-5 gueltige Skill-Referenzen | Veraltete Verweise auf umbenannte/entfernte Skills |

```bash
# Skill lesen
cat skills/<skill-name>/SKILL.md

# Frontmatter-Parsing pruefen
head -20 skills/<skill-name>/SKILL.md

# Verwandte Skills auf Existenz pruefen
grep -oP '`[\w-]+`' skills/<skill-name>/SKILL.md | sort -u
```

**Erwartet:** Eine Liste spezifischer Luecken, Schwachstellen oder Verbesserungsmoeglichkeiten.

**Bei Fehler:** Falls die SKILL.md nicht existiert oder kein Frontmatter hat, ist dieser Skill nicht anwendbar — stattdessen `create-skill` verwenden, um sie von Grund auf neu zu erstellen.

### Schritt 2: Weiterentwicklungsanforderungen sammeln

Identifizieren und kategorisieren, was die Weiterentwicklung ausgeloest hat:

| Ausloser | Beispiel | Typischer Umfang |
|----------|---------|-----------------|
| Nutzer-Feedback | "Schritt 3 ist unklar" | Verfeinerung |
| Werkzeugaenderung | Neue API-Version, veralteter Befehl | Verfeinerung |
| Entdeckter Fallstrick | Haeufiger Fehler nicht dokumentiert | Verfeinerung |
| Komplexitaets-Upgrade | Skill zu oberflaechlich fuer echte Nutzung | Verfeinerung oder Variante |
| Neue verwandte Skills | Angrenzender Skill wurde hinzugefuegt | Verfeinerung (Querverweise) |
| Fortgeschrittener Anwendungsfall | Erfahrene Nutzer brauchen tiefere Abdeckung | Variante |

Die spezifischen Aenderungen vor der Bearbeitung dokumentieren. Jede Aenderung mit ihrem Zielabschnitt auflisten.

**Erwartet:** Eine konkrete Liste von Aenderungen (z.B. "On failure zu Schritt 4 hinzufuegen", "Neuen Schritt 6 fuer Randfaell X hinzufuegen", "Related Skills um `new-skill` erweitern").

**Bei Fehler:** Falls die Aenderungen unklar sind, den Benutzer um Klaerung bitten, bevor fortgefahren wird. Vage Weiterentwicklungsziele erzeugen vage Verbesserungen.

### Schritt 3: Weiterentwicklungsumfang waehlen

Diese Entscheidungsmatrix verwenden, um zu bestimmen, ob direkt verfeinert oder eine Variante erstellt werden soll:

| Kriterium | Verfeinerung (direkt) | Fortgeschrittene Variante (neuer Skill) |
|-----------|----------------------|----------------------------------------|
| Skill-ID | Unveraendert | Neue ID: `<skill>-advanced` |
| Dateipfad | Dieselbe SKILL.md | Neues Verzeichnis |
| Versions-Bump | Patch oder Minor | Beginnt bei 1.0 |
| Komplexitaet | Kann steigen | Hoeher als das Original |
| Registry | Kein neuer Eintrag | Neuer Eintrag hinzugefuegt |
| Symlinks | Keine Aenderung | Neue Symlinks benoetigt |
| Urspruenglicher Skill | Direkt modifiziert | Unveraendert, erhaelt Querverweis |

**Verfeinerung**: Waehlen wenn Qualitaet verbessert, Luecken behoben oder bescheidene neue Inhalte hinzugefuegt werden. Der Skill behaelt seine Identitaet.

**Variante**: Waehlen wenn die weiterentwickelte Version doppelt so lang waere, die Zielgruppe aendern oder wesentlich andere Eingaben erfordern wuerde. Das Original bleibt fuer einfachere Anwendungsfaelle unveraendert.

**Erwartet:** Eine klare Entscheidung — Verfeinerung oder Variante — mit Begruendung.

**Bei Fehler:** Falls unsicher, Standard-Verfeinerung verwenden. Eine Variante kann spaeter immer extrahiert werden; es ist schwieriger, eine wieder zusammenzufuehren.

### Schritt 4: Inhaltliche Aenderungen anwenden

#### Fuer Verfeinerungen

Die bestehende SKILL.md direkt bearbeiten:

```bash
# Zur Bearbeitung oeffnen
# Verfahrensschritte hinzufuegen/ueberarbeiten
# Expected/On-failure-Paare staerken
# Tabellen oder Beispiele hinzufuegen
# Ausloser fuer "When to Use" aktualisieren
# Inputs ueberarbeiten, falls sich Umfang geaendert hat
```

Diese Bearbeitungsregeln befolgen:
- Alle bestehenden Abschnitte erhalten — Inhalte hinzufuegen, keine Abschnitte entfernen
- Schritt-Nummerierung nach Einfuegungen fortlaufend halten
- Jeder neue oder geaenderte Schritt muss sowohl Expected als auch On failure haben
- Neue Fallstricke ans Ende des Abschnitts Common Pitfalls
- Neue verwandte Skills ans Ende des Abschnitts Related Skills

#### Fuer Varianten

```bash
# Varianten-Verzeichnis erstellen
mkdir -p skills/<skill-name>-advanced/

# Original als Ausgangspunkt kopieren
cp skills/<skill-name>/SKILL.md skills/<skill-name>-advanced/SKILL.md

# Variante bearbeiten:
# - `name` in `<skill-name>-advanced` aendern
# - `description` aktualisieren um fortgeschrittenen Umfang widerzuspiegeln
# - `complexity` erhoehen (z.B. intermediate -> advanced)
# - `version` auf "1.0" zuruecksetzen
# - Verfahrensschritte fuer fortgeschrittenen Anwendungsfall hinzufuegen/erweitern
# - Original in Related Skills als Voraussetzung referenzieren
```

**Erwartet:** Die SKILL.md (verfeinert oder neue Variante) besteht die Bewertungscheckliste aus Schritt 1.

**Bei Fehler:** Falls eine Schrittbearbeitung die Dokumentstruktur beschaedigt, `git diff` verwenden, um Aenderungen zu ueberpruefen und partielle Bearbeitungen mit `git checkout -- <file>` rueckgaengig zu machen.

### Schritt 4.5: Uebersetzte Varianten synchronisieren

> **Erforderlich, wenn Uebersetzungen existieren.** Dieser Schritt gilt sowohl fuer menschliche Autoren als auch fuer KI-Agenten, die dieser Vorgehensweise folgen. Nicht ueberspringen — veraltete `source_commit`-Werte fuehren dazu, dass `npm run validate:translations` falsche Stale-Warnungen ueber alle Locales hinweg meldet.

Pruefen, ob Uebersetzungen fuer den weiterentwickelten Skill existieren, und sie auf den neuen Stand der Quelle aktualisieren:

```bash
# Auf vorhandene Uebersetzungen pruefen
ls i18n/*/skills/<skill-name>/SKILL.md 2>/dev/null
```

#### Falls Uebersetzungen existieren

1. Aktuellen Quell-Commit-Hash ermitteln:

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. `source_commit` im Frontmatter jeder uebersetzten Datei aktualisieren:

```bash
for locale_file in i18n/*/skills/<skill-name>/SKILL.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. Dateien zur Neu-Uebersetzung markieren, indem betroffene Locales in der Commit-Nachricht aufgefuehrt werden:

```
evolve(<skill-name>): <Beschreibung der Aenderungen>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <Liste der geaenderten Abschnitte>
```

4. Uebersetzungs-Statusdateien neu generieren:

```bash
npm run translation:status
```

#### Falls keine Uebersetzungen existieren

Keine Aktion noetig. Mit Schritt 5 fortfahren.

#### Fuer Varianten

Die Uebersetzung neuer Varianten aufschieben, bis sich die Variante stabilisiert hat (1-2 Versionen). Eine v1.0-Variante zu uebersetzen, die sich bis v1.2 erheblich aendern kann, verschwendet Aufwand. Uebersetzungen hinzufuegen, nachdem die Variante mindestens einmal verfeinert wurde.

**Erwartet:** Alle uebersetzten Dateien haben `source_commit` auf den aktuellen Commit aktualisiert. Die Commit-Nachricht vermerkt, welche Locales neu uebersetzt werden muessen und welche Abschnitte sich geaendert haben. `npm run translation:status` beendet mit 0.

**Bei Fehler:** Falls `sed` das Frontmatter-Feld nicht matcht, hat die uebersetzte Datei moeglicherweise eine nicht standardisierte Formatierung. Manuell oeffnen und pruefen, ob `source_commit` in ihrem YAML-Frontmatter vorhanden ist. Falls das Feld fehlt, wurde die Datei nicht korrekt angelegt — mit `npm run translate:scaffold` neu anlegen.

### Schritt 5: Version und Metadaten aktualisieren

Das Feld `version` im Frontmatter gemaess Semver-Konventionen erhoehen:

| Aenderungstyp | Versions-Bump | Beispiel |
|---------------|--------------|---------|
| Tippfehler, Formulierungspraezisierung | Patch: 1.0 -> 1.1 | Unklaren Satz in Schritt 3 korrigiert |
| Neuer Schritt, neuer Fallstrick, neue Tabelle | Minor: 1.0 -> 2.0 | Schritt 7 fuer Randfaelle hinzugefuegt |
| Verfahren umstrukturiert, Eingaben geaendert | Major: 1.0 -> 2.0 | Von 5 auf 8 Schritte umorganisiert |

Auch aktualisieren:
- `complexity` falls der Umfang erweitert wurde (z.B. basic -> intermediate)
- `tags` falls sich der Abdeckungsbereich geaendert hat
- `description` falls sich der Skill-Umfang wesentlich geaendert hat

**Erwartet:** Frontmatter-`version` spiegelt die Groesse der Aenderungen wider. Neue Varianten beginnen bei `"1.0"`.

**Bei Fehler:** Falls die Version vergessen wird zu erhoehen, gibt es keine Moeglichkeit, den aktuellen Stand vom vorherigen zu unterscheiden. Immer vor dem Committen erhoehen.

### Schritt 6: Registry und Querverweise aktualisieren

#### Fuer Verfeinerungen

Keine Registry-Aenderungen erforderlich (Pfad unveraendert). Querverweise nur aktualisieren, wenn sich Related Skills in anderen Skills geaendert haben:

```bash
# Pruefen ob ein Skill den weiterentwickelten Skill referenziert
grep -r "<skill-name>" skills/*/SKILL.md
```

#### Fuer Varianten

Den neuen Skill zu `skills/_registry.yml` hinzufuegen:

```yaml
- id: <skill-name>-advanced
  path: <skill-name>-advanced/SKILL.md
  complexity: advanced
  language: multi
  description: Einzeilige Beschreibung der fortgeschrittenen Variante
```

Dann:
1. `total_skills` am Anfang der Registry hochzaehlen
2. Querverweis zu Related Skills im urspruenglichen Skill hinzufuegen, der auf die Variante zeigt
3. Querverweis zu Related Skills in der Variante hinzufuegen, der auf das Original zeigt
4. Symlinks fuer Slash-Command-Entdeckung erstellen:

```bash
# Projektebene
ln -s ../../skills/<skill-name>-advanced .claude/skills/<skill-name>-advanced

# Global
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name>-advanced ~/.claude/skills/<skill-name>-advanced
```

**Erwartet:** Registry-`total_skills` stimmt mit `find skills -name SKILL.md | wc -l` ueberein. Querverweise sind bidirektional.

**Bei Fehler:** Falls die Registry-Zaehlung falsch ist, `find skills -name SKILL.md | wc -l` ausfuehren, um die wahre Zaehlung zu ermitteln und die Registry zu korrigieren.

### Schritt 7: Den weiterentwickelten Skill validieren

Die vollstaendige Validierungscheckliste durchfuehren:

- [ ] SKILL.md existiert am erwarteten Pfad
- [ ] YAML-Frontmatter wird fehlerfrei geparst
- [ ] `version` wurde erhoehen (Verfeinerung) oder auf "1.0" gesetzt (Variante)
- [ ] Alle Abschnitte vorhanden: When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills
- [ ] Jeder Verfahrensschritt hat Expected- und On-failure-Bloecke
- [ ] Related Skills verweisen auf gueltige, existierende Skill-Namen
- [ ] Registry-Eintrag existiert mit korrektem Pfad (nur Varianten)
- [ ] `total_skills`-Zaehlung stimmt mit tatsaechlicher Skill-Anzahl auf der Festplatte ueberein
- [ ] Symlinks loesen sich korrekt auf (nur Varianten)
- [ ] `git diff` zeigt keine versehentlichen Loeschungen aus dem urspruenglichen Inhalt

```bash
# Frontmatter pruefen
head -20 skills/<skill-name>/SKILL.md

# Skills auf Festplatte vs. Registry zaehlen
find skills -name SKILL.md | wc -l
grep total_skills skills/_registry.yml

# Alle Aenderungen ueberpruefen
git diff
```

**Erwartet:** Alle Checklistenelemente bestanden. Der weiterentwickelte Skill ist bereit zum Committen.

**Bei Fehler:** Jeden fehlschlagenden Punkt einzeln adressieren. Das haeufigste Post-Weiterentwicklungs-Problem ist ein veralteter `total_skills`-Zaehler — immer zuletzt pruefen.

## Validierung

- [ ] SKILL.md existiert und hat gueltiges YAML-Frontmatter
- [ ] `version`-Feld spiegelt die vorgenommenen Aenderungen wider
- [ ] Alle Verfahrensschritte haben Expected- und On-failure-Bloecke
- [ ] Related-Skills-Referenzen sind gueltig (keine fehlerhaften Querverweise)
- [ ] Registry-`total_skills` stimmt mit tatsaechlicher Zaehlung auf der Festplatte ueberein
- [ ] Fuer Varianten: neuer Eintrag in `_registry.yml` mit korrektem Pfad
- [ ] Fuer Varianten: Symlinks erstellt unter `.claude/skills/` und `~/.claude/skills/`
- [ ] `git diff` bestaetigt keine versehentliche Inhaltsentfernung

## Haeufige Stolperfallen

- **Version zu erhoehen vergessen**: Ohne Versions-Bumps gibt es keine Moeglichkeit zu verfolgen, was sich wann geaendert hat. `version` immer im Frontmatter vor dem Committen aktualisieren.
- **Versehentliche Inhaltsloesch**: Beim Umstrukturieren von Schritten ist es leicht, einen On-failure-Block oder eine Tabellenzeile zu verlieren. Immer `git diff` vor dem Committen ueberpruefen.
- **Veraltete Querverweise**: Beim Erstellen einer Variante muessen sowohl das Original als auch die Variante aufeinander verweisen. Einseitige Verweise lassen den Graphen unvollstaendig.
- **Registry-Zaehlerabweichung**: Nach dem Erstellen einer Variante muss der `total_skills`-Zaehler hochgezaehlt werden. Dieses Vergessen verursacht Validierungsfehler in anderen Skills.
- **Umfangs-Creep bei der Verfeinerung**: Eine Verfeinerung, die die Laenge des Skills verdoppelt, sollte wahrscheinlich eine Variante sein. Falls mehr als 3 neue Verfahrensschritte hinzugefuegt werden, die Umfangsentscheidung aus Schritt 3 nochmals ueberdenken.
- **`git mv` auf NTFS-gemounteten Pfaden vermeiden (WSL)**: Auf `/mnt/`-Pfaden kann `git mv` fuer Verzeichnisse fehlerhafte Berechtigungen erstellen. Stattdessen `mkdir -p` + Dateien kopieren + `git rm` des alten Pfades verwenden.

## Verwandte Skills

- `create-skill` — Grundlage fuer das Verfassen neuer Skills; evolve-skill setzt voraus, dass dies urspruenglich befolgt wurde
- `commit-changes` — den weiterentwickelten Skill mit einer beschreibenden Nachricht committen
- `configure-git-repository` — versionskontrollierte Skill-Aenderungen
- `security-audit-codebase` — weiterentwickelte Skills auf versehentlich enthaltene Geheimnisse pruefen
