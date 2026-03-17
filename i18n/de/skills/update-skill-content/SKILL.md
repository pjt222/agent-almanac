---
name: update-skill-content
description: >
  Aktualisiert den Inhalt einer bestehenden SKILL.md zur Verbesserung von
  Genauigkeit, Vollstaendigkeit und Klarheit. Umfasst Versions-Bump,
  Prozedur-Verfeinerung, Pitfall-Erweiterung und Related-Skills-
  Synchronisation. Verwenden wenn Prozeduren eines Skills veraltete Tools
  oder APIs referenzieren, der Common-Pitfalls-Abschnitt duenn ist, Related
  Skills defekte Querverweise aufweist oder nach Feedback, dass Prozeduren
  eines Skills unklar oder unvollstaendig sind.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, content, update, maintenance, quality
---

# Skill-Inhalt aktualisieren

Eine bestehende SKILL.md verbessern durch Verfeinerung der Prozedurschritte, Erweiterung der Haeufigen Stolperfallen mit echten Fehlermodi, Synchronisation des Related-Skills-Abschnitts und Erhoehen der Versionsnummer. Verwenden nachdem ein Skill die Formatvalidierung bestanden hat, aber Inhaltslucken, veraltete Referenzen oder unvollstaendige Prozeduren aufweist.

## Wann verwenden

- Prozedurschritte eines Skills referenzieren veraltete Tools, APIs oder Versionsnummern
- Common-Pitfalls-Abschnitt ist duenn (weniger als 3 Pitfalls) oder fehlen echte Fehlermodi
- Related-Skills-Abschnitt hat defekte Querverweise oder fehlt relevante Links
- Prozedurschritte fehlen konkreter Code-Beispiele oder haben vage Anweisungen
- Ein neuer Skill wurde zur Bibliothek hinzugefuegt, der von bestehenden Skills quer-referenziert werden sollte
- Nach Feedback, dass die Prozeduren eines Skills unklar oder unvollstaendig sind

## Eingaben

- **Erforderlich**: Pfad zur zu aktualisierenden SKILL.md-Datei
- **Optional**: Spezifische Abschnitte fuer den Fokus (z. B. "procedure", "pitfalls", "related-skills")
- **Optional**: Quelle der Aktualisierungen (Changelog, Issue-Bericht, Nutzer-Feedback)
- **Optional**: Ob Version erhoehen werden soll (Standard: ja, kleiner Sprung)

## Vorgehensweise

### Schritt 1: Aktuellen Skill lesen und Inhaltsqualitaet einschaetzen

Die gesamte SKILL.md lesen und jeden Abschnitt auf Vollstaendigkeit und Genauigkeit bewerten.

Bewertungskriterien pro Abschnitt:
- **When to Use**: Sind Ausloser konkret und umsetzbar? (3-5 Punkte erwartet)
- **Inputs**: Sind Typen, Standards und Erforderlich/Optional klar getrennt?
- **Procedure**: Hat jeder Schritt konkreten Code, Expected und On failure?
- **Validation**: Sind Checklisten-Punkte objektiv testbar? (5+ Punkte erwartet)
- **Common Pitfalls**: Sind Pitfalls spezifisch mit Symptomen und Loesungen? (3-6 erwartet)
- **Related Skills**: Existieren referenzierte Skills? Fehlen offensichtlich verwandte Skills?

**Erwartet:** Ein klares Bild, welche Abschnitte Verbesserung benoetigen, mit spezifisch identifizierten Luecken.

**Bei Fehler:** Wenn der Skill nicht gelesen werden kann (Pfadfehler), den Pfad verifizieren. Wenn die SKILL.md defektes YAML-Frontmatter hat, zuerst das Frontmatter mit `review-skill-format` beheben, bevor Inhaltsaktualisierungen versucht werden.

### Schritt 2: Auf veraltete Referenzen pruefen

Prozedurschritte auf versionsspezifische Referenzen, Tool-Namen, URLs und API-Muster scannen, die sich moeglicherweise geaendert haben.

Haeufige Veraltungs-Indikatoren:
- Spezifische Versionsnummern (z. B. `v1.24`, `R 4.3.0`, `Node 18`)
- URLs, die moeglicherweise verschoben oder abgelaufen sind
- CLI-Flags oder Befehlssyntax, die sich geaendert haben
- Paketnamen, die umbenannt oder veraltet sind
- Konfigurationsdatei-Formate, die sich weiterentwickelt haben

```bash
# Auf versionsspezifische Referenzen pruefen
grep -nE '[vV][0-9]+\.[0-9]+' skills/<skill-name>/SKILL.md

# Auf URLs pruefen
grep -nE 'https?://' skills/<skill-name>/SKILL.md
```

**Erwartet:** Eine Liste potenziell veralteter Referenzen mit Zeilennummern. Jede Referenz wird als aktuell verifiziert oder zur Aktualisierung markiert.

**Bei Fehler:** Wenn zu viele Referenzen manuell zu pruefen sind, priorisieren: zuerst Prozedur-Code-Bloecke (am wahrscheinlichsten Laufzeitfehler zu verursachen), dann Common Pitfalls (koennen alte Workarounds referenzieren), dann Informationstext.

### Schritt 3: Prozedurschritte auf Genauigkeit aktualisieren

Fuer jeden als verbesserungsbeduerftig identifizierten Prozedurschritt:

1. Pruefen ob Code-Bloecke noch korrekt ausgefuehrt werden oder aktuellen Best Practices entsprechen
2. Fehlenden Kontextsaetzen hinzufuegen, die erklaeren *warum* der Schritt benoetigt wird
3. Sicherstellen, dass konkrete Befehle echte Pfade, echte Flags und echte Ausgaben verwenden
4. Expected-Bloecke aktualisieren, um aktuelles Tool-Verhalten widerzuspiegeln
5. On-failure-Bloecke mit aktuellen Fehlermeldungen und Loesungen aktualisieren

Beim Aktualisieren von Code-Bloecken die urspruengliche Struktur beibehalten:
- Schritt-Nummerierung konsistent halten
- Format `### Step N: Titel` beibehalten
- Schritte nicht neu anordnen, ausser die urspruengliche Reihenfolge war falsch

**Erwartet:** Alle Prozedurschritte enthalten aktuellen, ausfuehrbaren Code. Expected/On-failure-Bloecke spiegeln tatsaechliches aktuelles Verhalten wider.

**Bei Fehler:** Wenn unklar ist, ob ein Code-Block noch korrekt ist, einen Hinweis hinzufuegen: `<!-- TODO: Diesen Befehl gegen aktuelle Version verifizieren -->`. Keine funktionierenden Code-Bloecke entfernen, um sie durch ungetestete Alternativen zu ersetzen.

### Schritt 4: Haeufige Stolperfallen erweitern

Den Common-Pitfalls-Abschnitt ueberpruefen und bei Bedarf erweitern.

Qualitaetskriterien fuer Pitfalls:
- Jeder Pitfall hat einen **fett** gedruckten Namen gefolgt von einer spezifischen Beschreibung
- Die Beschreibung enthaelt das *Symptom* (was schieflaeuft) und die *Loesung* (wie zu vermeiden oder zu beheben)
- Pitfalls entstammen echten Fehlermodi, nicht hypothetischen Bedenken
- 3-6 Pitfalls ist der Zielbereich

Quellen fuer neue Pitfalls:
- Prozedurschritte mit komplexen On-failure-Bloecken (dies sind wahrscheinlich Pitfalls)
- Verwandte Skills, die vor denselben Tools oder Mustern warnen
- Haeufig von Nutzern der Prozedur gemeldete Probleme

**Erwartet:** 3-6 Pitfalls, jeder mit spezifischem Symptom und Loesung. Keine generischen Pitfalls wie "vorsichtig sein" oder "gruendlich testen".

**Bei Fehler:** Wenn nur 1-2 Pitfalls identifiziert werden koennen, ist das fuer Skills mit basic-Komplexitaet akzeptabel. Fuer intermediate- und advanced-Skills legt weniger als 3 Pitfalls nahe, dass der Autor Fehlermodi nicht vollstaendig erkundet hat — fuer spaeteren Ausbau markieren.

### Schritt 5: Related-Skills-Abschnitt synchronisieren

Alle Querverweise im Related-Skills-Abschnitt verifizieren und fehlende Links hinzufuegen.

1. Fuer jeden referenzierten Skill pruefen ob er existiert:
   ```bash
   # Pruefen ob referenzierter Skill existiert
   test -d skills/referenced-skill-name && echo "EXISTIERT" || echo "NICHT GEFUNDEN"
   ```
2. Nach Skills suchen, die diesen Skill referenzieren (sie sollten gegenseitig verlinkt sein):
   ```bash
   # Skills finden, die diesen Skill referenzieren
   grep -rl "skill-name" skills/*/SKILL.md
   ```
3. Auf offensichtlich verwandte Skills anhand von Domain und Tags pruefen
4. Format verwenden: `- \`skill-id\` — einzeilige Beschreibung der Beziehung`

**Erwartet:** Alle referenzierten Skills existieren auf dem Datentraeger. Bidirektionale Querverweise sind vorhanden. Keine verwaisten Links.

**Bei Fehler:** Wenn ein referenzierter Skill nicht existiert, entweder die Referenz entfernen oder als geplanten zukuenftigen Skill mit einem Kommentar vermerken. Wenn viele Skills diesen referenzieren, aber nicht in Related Skills aufgelistet sind, die relevantesten 2-3 hinzufuegen.

### Schritt 6: Version im Frontmatter erhoehen

Das Feld `metadata.version` gemaess semantischer Versionierung aktualisieren:
- **Patch-Sprung** (1.0 zu 1.1): Tippfehler-Korrekturen, kleine Klarstellungen, URL-Updates
- **Minor-Sprung** (1.0 zu 2.0): Neue Prozedurschritte, wesentliche Inhaltserweiterungen, strukturelle Aenderungen
- **Hinweis**: Skills verwenden vereinfachte zweiteilige Versionierung (major.minor)

Auch Datumsfelder aktualisieren, wenn im Frontmatter vorhanden.

**Erwartet:** Version angemessen erhoehen. Das Ausmas der Aenderung entspricht dem Aktualisierungsumfang.

**Bei Fehler:** Wenn die aktuelle Version nicht geparst werden kann, auf `"1.1"` setzen und einen Kommentar hinzufuegen, der die Versions-Geschichte-Luecke vermerkt.

## Validierung

- [ ] Alle Prozedurschritte enthalten aktuellen, ausfuehrbaren Code oder konkrete Anweisungen
- [ ] Keine veralteten Versionreferenzen, URLs oder veralteten Tool-Namen verbleiben
- [ ] Jeder Prozedurschritt hat **Expected:**- und **On failure:**-Bloecke
- [ ] Common-Pitfalls-Abschnitt hat 3-6 spezifische Pitfalls mit Symptomen und Loesungen
- [ ] Alle Related-Skills-Querverweise zeigen auf existierende Skills
- [ ] Bidirektionale Querverweise sind fuer eng verwandte Skills vorhanden
- [ ] Version im Frontmatter wurde angemessen erhoehen
- [ ] Zeilenzahl bleibt nach Aktualisierungen unter 500
- [ ] SKILL.md besteht noch `review-skill-format`-Validierung nach Aenderungen

## Haeufige Stolperfallen

- **Code ohne Testen aktualisieren**: Einen Befehl in einem Prozedurschritt zu aendern ohne zu pruefen, ob er funktioniert, ist schlimmer als den alten Befehl zu belassen. Bei Unsicherheit einen Verifikationskommentar statt einer ungetesteten Ersetzung hinzufuegen.
- **Pitfalls uebermaeissig erweitern**: Hinzufuegen von 10+ Pitfalls verwassert den Abschnitt. Die 3-6 wirkungsvollsten Pitfalls behalten; Grenzfaelle bei Bedarf in eine `references/`-Datei verschieben.
- **Querverweise waehrend Aktualisierungen brechen**: Beim Umbenennen eines Skills oder Aendern seiner Domain die gesamte Skills-Bibliothek nach Referenzen auf den alten Namen durchsuchen. `grep -rl "old-name" skills/` verwenden, um alle Vorkommen zu finden.
- **Versions-Erhoehung vergessen**: Jede Inhaltsaktualisierung, egal wie klein, sollte die Version erhoehen. Dies ermoeglicht es Konsumenten zu erkennen, wenn sich ein Skill geaendert hat.
- **Scope-Creep in Refaktorierung**: Inhaltsaktualisierungen verbessern *was* der Skill sagt. Wenn Abschnitte umstrukturiert oder in `references/` ausgelagert werden, stattdessen zum `refactor-skill-structure`-Skill wechseln.

## Verwandte Skills

- `review-skill-format` — Formatvalidierung vor Inhaltsaktualisierungen ausfuehren, um sicherzustellen, dass die Basisstruktur solide ist
- `refactor-skill-structure` — Wenn Inhaltsaktualisierungen den Skill ueber 500 Zeilen schieben, Struktur refaktorieren, um Platz zu machen
- `evolve-skill` — Fuer tiefgreifendere Aenderungen, die ueber Inhaltsaktualisierungen hinausgehen (z. B. Erstellen einer erweiterten Variante)
- `create-skill` — Die kanonische Formatspezifikation beim Hinzufuegen neuer Abschnitte oder Prozedurschritte referenzieren
- `repair-broken-references` — Fuer die Massenereparatur von Querverweisen in der gesamten Skills-Bibliothek verwenden
