---
name: update-skill-content
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Den Inhalt einer bestehenden SKILL.md aktualisieren um Genauigkeit,
  Vollstaendigkeit und Klarheit zu verbessern. Behandelt Versions-Bump,
  Verfeinerung der Vorgehensweise, Erweiterung der Stolperfallen und
  Synchronisierung der verwandten Skills. Anwenden wenn die Vorgehensweisen
  eines Skills veraltete Werkzeuge oder APIs referenzieren, der Abschnitt
  Haeufige Stolperfallen duenn ist, Verwandte Skills fehlerhafte
  Querverweise enthaelt, oder nach Rueckmeldung dass die Vorgehensweisen
  eines Skills unklar oder unvollstaendig sind.
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

Eine bestehende SKILL.md verbessern durch Verfeinerung der Vorgehensweisenschritte, Erweiterung der Haeufigen Stolperfallen mit realen Fehlermodi, Synchronisierung des Abschnitts Verwandte Skills und Erhoehung der Versionsnummer. Anwenden nachdem ein Skill die Formatvalidierung besteht aber inhaltliche Luecken, veraltete Referenzen oder unvollstaendige Vorgehensweisen aufweist.

## Wann verwenden

- Vorgehensweisenschritte eines Skills referenzieren veraltete Werkzeuge, APIs oder Versionsnummern
- Der Abschnitt Haeufige Stolperfallen ist duenn (weniger als 3 Stolperfallen) oder es fehlen reale Fehlermodi
- Der Abschnitt Verwandte Skills hat fehlerhafte Querverweise oder es fehlen relevante Verknuepfungen
- Vorgehensweisenschritte fehlen konkrete Codebeispiele oder haben vage Anweisungen
- Ein neuer Skill wurde zur Bibliothek hinzugefuegt der von bestehenden Skills querverwiesen werden sollte
- Nach Rueckmeldung dass die Vorgehensweisen eines Skills unklar oder unvollstaendig sind

## Eingaben

- **Erforderlich**: Pfad zur zu aktualisierenden SKILL.md-Datei
- **Optional**: Bestimmte Abschnitte auf die sich konzentriert werden soll (z.B. "vorgehensweise", "stolperfallen", "verwandte-skills")
- **Optional**: Quelle der Aktualisierungen (Aenderungsprotokoll, Fehlerbericht, Benutzerrueckmeldung)
- **Optional**: Ob die Version erhoeht werden soll (Standard: ja, Minor-Erhoehung)

## Vorgehensweise

### Schritt 1: Aktuellen Skill lesen und Inhaltsqualitaet bewerten

Die gesamte SKILL.md lesen und jeden Abschnitt auf Vollstaendigkeit und Genauigkeit evaluieren.

Bewertungskriterien pro Abschnitt:
- **Wann verwenden**: Sind Ausloeser konkret und umsetzbar? (3-5 Eintraege erwartet)
- **Eingaben**: Sind Typen, Standardwerte und Erforderlich/Optional klar getrennt?
- **Vorgehensweise**: Hat jeder Schritt konkreten Code, Erwartet und Bei Fehler?
- **Validierung**: Sind Checklistenpunkte objektiv pruefbar? (5+ Eintraege erwartet)
- **Haeufige Stolperfallen**: Sind Stolperfallen spezifisch mit Symptomen und Loesungen? (3-6 erwartet)
- **Verwandte Skills**: Existieren referenzierte Skills? Fehlen offensichtlich verwandte Skills?

**Erwartet:** Ein klares Bild welche Abschnitte Verbesserung brauchen, mit identifizierten spezifischen Luecken.

**Bei Fehler:** Wenn der Skill nicht gelesen werden kann (Pfadfehler), den Pfad verifizieren. Wenn die SKILL.md fehlerhafte YAML-Frontmatter hat, zuerst die Frontmatter mit `review-skill-format` reparieren bevor Inhaltsaktualisierungen versucht werden.

### Schritt 2: Auf veraltete Referenzen pruefen

Vorgehensweisenschritte nach versionsspezifischen Referenzen, Werkzeugnamen, URLs und API-Mustern durchsuchen die sich geaendert haben koennten.

Haeufige Veraltungsindikatoren:
- Spezifische Versionsnummern (z.B. `v1.24`, `R 4.3.0`, `Node 18`)
- URLs die verschoben oder abgelaufen sein koennten
- CLI-Flags oder Befehlssyntax die sich geaendert hat
- Paketnamen die umbenannt oder veraltet sind
- Konfigurationsdateiformate die sich weiterentwickelt haben

```bash
# Nach versionsspezifischen Referenzen suchen
grep -nE '[vV][0-9]+\.[0-9]+' skills/<skill-name>/SKILL.md

# Nach URLs suchen
grep -nE 'https?://' skills/<skill-name>/SKILL.md
```

**Erwartet:** Eine Liste potenziell veralteter Referenzen mit Zeilennummern. Jede Referenz wird als aktuell verifiziert oder zur Aktualisierung gekennzeichnet.

**Bei Fehler:** Wenn zu viele Referenzen manuell zu pruefen sind, priorisieren: zuerst Codeblocks in der Vorgehensweise (verursachen am ehesten Laufzeitfehler), dann Haeufige Stolperfallen (koennten alte Workarounds referenzieren), dann informativen Text.

### Schritt 3: Vorgehensweisenschritte auf Genauigkeit aktualisieren

Fuer jeden Vorgehensweisenschritt der als verbesserungsbeduerftig identifiziert wurde:

1. Verifizieren dass Codeblocks noch korrekt ausfuehrbar sind oder aktuelle Best Practices widerspiegeln
2. Fehlende Kontextsaetze hinzufuegen die erklaeren *warum* der Schritt noetig ist
3. Sicherstellen dass konkrete Befehle echte Pfade, echte Flags und echte Ausgaben verwenden
4. Erwartet-Blocks aktualisieren um aktuelles Werkzeugverhalten widerzuspiegeln
5. Bei-Fehler-Blocks mit aktuellen Fehlermeldungen und Loesungen aktualisieren

Beim Aktualisieren von Codeblocks die urspruengliche Struktur beibehalten:
- Schrittnummerierung konsistent halten
- Das Format `### Schritt N: Titel` beibehalten
- Schritte nicht umordnen es sei denn die urspruengliche Reihenfolge war falsch

**Erwartet:** Alle Vorgehensweisenschritte enthalten aktuellen, ausfuehrbaren Code. Erwartet/Bei-Fehler-Blocks spiegeln das tatsaechliche aktuelle Verhalten wider.

**Bei Fehler:** Wenn unsicher ob ein Codeblock noch korrekt ist, einen Vermerk hinzufuegen: `<!-- TODO: Diesen Befehl gegen aktuelle Version verifizieren -->`. Keine funktionierenden Codeblocks entfernen um sie durch ungetestete Alternativen zu ersetzen.

### Schritt 4: Haeufige Stolperfallen erweitern

Den Abschnitt Haeufige Stolperfallen ueberpruefen und bei Luecken erweitern.

Qualitaetskriterien fuer Stolperfallen:
- Jede Stolperfalle hat einen **fettgedruckten Namen** gefolgt von einer spezifischen Beschreibung
- Die Beschreibung enthaelt das *Symptom* (was schiefgeht) und die *Loesung* (wie man es vermeidet oder behebt)
- Stolperfallen stammen aus realen Fehlermodi, nicht hypothetischen Bedenken
- 3-6 Stolperfallen ist der Zielbereich

Quellen fuer neue Stolperfallen:
- Vorgehensweisenschritte mit komplexen Bei-Fehler-Blocks (diese sind wahrscheinlich Stolperfallen)
- Verwandte Skills die vor denselben Werkzeugen oder Mustern warnen
- Haeufige von Benutzern der Vorgehensweise berichtete Probleme

**Erwartet:** 3-6 Stolperfallen, jede mit spezifischem Symptom und Loesung. Keine generischen Stolperfallen wie "vorsichtig sein" oder "gruendlich testen".

**Bei Fehler:** Wenn nur 1-2 Stolperfallen identifiziert werden koennen, ist das fuer Skills mit Grundkomplexitaet akzeptabel. Fuer Fortgeschrittene- und Experten-Skills deuten weniger als 3 Stolperfallen darauf hin dass der Autor Fehlermodi nicht vollstaendig erkundet hat -- zur zukuenftigen Erweiterung kennzeichnen.

### Schritt 5: Abschnitt Verwandte Skills synchronisieren

Alle Querverweise im Abschnitt Verwandte Skills verifizieren und fehlende Verknuepfungen hinzufuegen.

1. Fuer jeden referenzierten Skill verifizieren dass er existiert:
   ```bash
   # Pruefen ob referenzierter Skill existiert
   test -d skills/referenced-skill-name && echo "EXISTIERT" || echo "NICHT GEFUNDEN"
   ```
2. Nach Skills suchen die diesen Skill referenzieren (diese sollten querverknuepft sein):
   ```bash
   # Skills finden die diesen Skill referenzieren
   grep -rl "skill-name" skills/*/SKILL.md
   ```
3. Auf offensichtlich verwandte Skills basierend auf Domain und Tags pruefen
4. Das Format verwenden: `- \`skill-id\` — einzeilige Beschreibung der Beziehung`

**Erwartet:** Alle referenzierten Skills existieren auf der Festplatte. Bidirektionale Querverweise sind vorhanden. Keine verwaisten Verknuepfungen.

**Bei Fehler:** Wenn ein referenzierter Skill nicht existiert, entweder die Referenz entfernen oder als geplanten zukuenftigen Skill mit Kommentar vermerken. Wenn viele Skills diesen referenzieren aber nicht in Verwandte Skills aufgefuehrt sind, die relevantesten 2-3 hinzufuegen.

### Schritt 6: Version in der Frontmatter erhoehen

Das Feld `metadata.version` nach semantischer Versionierung aktualisieren:
- **Patch-Erhoehung** (1.0 auf 1.1): Tippfehlerkorrekturen, kleine Klaerungen, URL-Aktualisierungen
- **Minor-Erhoehung** (1.0 auf 2.0): Neue Vorgehensweisenschritte, erhebliche Inhaltsergaenzungen, strukturelle Aenderungen
- **Hinweis**: Skills verwenden vereinfachte zweiteilige Versionierung (Major.Minor)

Ebenfalls etwaige Datumsfelder in der Frontmatter aktualisieren falls vorhanden.

**Erwartet:** Version ist angemessen erhoeht. Das Ausmass der Aenderung entspricht dem Umfang der Aktualisierung.

**Bei Fehler:** Wenn die aktuelle Version nicht geparst werden kann, auf `"1.1"` setzen und einen Kommentar zur Luecke in der Versionshistorie hinzufuegen.

## Validierung

- [ ] Alle Vorgehensweisenschritte enthalten aktuellen, ausfuehrbaren Code oder konkrete Anweisungen
- [ ] Keine veralteten Versionsreferenzen, URLs oder veralteten Werkzeugnamen verbleiben
- [ ] Jeder Vorgehensweisenschritt hat **Erwartet:**- und **Bei Fehler:**-Blocks
- [ ] Abschnitt Haeufige Stolperfallen hat 3-6 spezifische Stolperfallen mit Symptomen und Loesungen
- [ ] Alle Querverweise in Verwandte Skills zeigen auf existierende Skills
- [ ] Bidirektionale Querverweise sind fuer eng verwandte Skills vorhanden
- [ ] Version in der Frontmatter wurde angemessen erhoeht
- [ ] Zeilenzahl bleibt nach Aktualisierungen unter 500
- [ ] SKILL.md besteht nach Aenderungen weiterhin die `review-skill-format`-Validierung

## Haeufige Stolperfallen

- **Code aktualisieren ohne zu testen**: Einen Befehl in einem Vorgehensweisenschritt aendern ohne zu verifizieren dass er funktioniert ist schlimmer als den alten Befehl zu belassen. Bei Unsicherheit einen Verifikationskommentar hinzufuegen statt einen ungetesteten Ersatz.
- **Stolperfallen uebermaessig erweitern**: 10+ Stolperfallen hinzufuegen verwaessert den Abschnitt. Die 3-6 wirkungsvollsten Stolperfallen behalten; Randfaelle in eine `references/`-Datei verschieben falls noetig.
- **Querverweise bei Aktualisierungen brechen**: Beim Umbenennen eines Skills oder Aendern seiner Domain die gesamte Skills-Bibliothek nach Referenzen auf den alten Namen durchsuchen. `grep -rl "alter-name" skills/` verwenden um alle Vorkommen zu finden.
- **Versionsinkrement vergessen**: Jede Inhaltsaktualisierung, egal wie klein, sollte die Version erhoehen. Dies ermoeglicht Konsumenten zu erkennen wann sich ein Skill geaendert hat.
- **Umfangserweiterung in Richtung Refactoring**: Inhaltsaktualisierungen verbessern *was* der Skill sagt. Wenn Sie feststellen dass Sie Abschnitte umstrukturieren oder nach `references/` extrahieren, stattdessen zum Skill `refactor-skill-structure` wechseln.

## Verwandte Skills

- `review-skill-format` -- Formatvalidierung vor Inhaltsaktualisierungen ausfuehren um sicherzustellen dass die Grundstruktur solide ist
- `refactor-skill-structure` -- Wenn Inhaltsaktualisierungen den Skill ueber 500 Zeilen bringen, Struktur refaktorieren um Platz zu schaffen
- `evolve-skill` -- Fuer tiefergehende Aenderungen die ueber Inhaltsaktualisierungen hinausgehen (z.B. Erstellen einer fortgeschrittenen Variante)
- `create-skill` -- Die kanonische Formatspezifikation referenzieren beim Hinzufuegen neuer Abschnitte oder Vorgehensweisenschritte
- `repair-broken-references` -- Fuer Massen-Querverweis-Reparatur in der gesamten Skills-Bibliothek verwenden
