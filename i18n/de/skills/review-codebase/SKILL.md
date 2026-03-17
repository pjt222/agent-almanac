---
name: review-codebase
description: >
  Mehrphasiger eingehender Codebasis-Review mit Schweregradbewertungen und
  strukturierter Ausgabe. Umfasst Architektur, Sicherheit, Codequalitaet und
  UX/Zugaenglichkeit in einem einzigen koordinierten Durchgang. Erzeugt eine
  priorisierte Befundtabelle, die direkt in GitHub-Issues mit dem
  create-github-issues-Skill umgewandelt werden kann.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: review, code-quality, architecture, security, accessibility, codebase
---

# Codebasis reviewen

Mehrphasiger eingehender Codebasis-Review, der schweregradbasierte Befunde mit Empfehlungen zur Reparaturreihenfolge erzeugt. Im Gegensatz zu `review-pull-request` (auf einen Diff beschraenkt) oder Einzeldomaenen-Reviews (`security-audit-codebase`, `review-software-architecture`) deckt dieser Skill ein gesamtes Projekt oder Teilprojekt in einem Durchgang ueber alle Qualitaetsdimensionen ab.

## Wann verwenden

- Gesamtprojekt- oder Teilprojekt-Review (nicht PR-beschraenkt)
- Onboarding einer neuen Codebasis — Aufbau eines mentalen Modells dessen, was existiert und was Aufmerksamkeit benoetigt
- Regelmaessige Gesundheitspruefungen nach anhaltender Entwicklung
- Pre-Release-Qualitaetssicherung ueber Architektur, Sicherheit, Codequalitaet und UX
- Wenn die Ausgabe direkt in Issue-Erstellung oder Sprint-Planung einfliessen soll

## Eingaben

- **Erforderlich**: `target_path` — Stammverzeichnis der zu reviewenden Codebasis oder des Teilprojekts
- **Optional**:
  - `scope` — welche Phasen ausfuehren: `full` (Standard), `security`, `architecture`, `quality`, `ux`
  - `output_format` — `findings` (nur Tabelle), `report` (narrativ), `both` (Standard)
  - `severity_threshold` — minimaler einzuschliessender Schweregrad: `LOW` (Standard), `MEDIUM`, `HIGH`, `CRITICAL`

## Vorgehensweise

### Schritt 1: Bestandsaufnahme

Die Codebasis inventarisieren, um Umfang festzulegen und Review-Ziele zu identifizieren.

1. Dateien nach Sprache/Typ zaehlen: `find target_path -type f | sort by extension`
2. Gesamtzeilenzahlen pro Sprache messen
3. Testverzeichnisse identifizieren und Test-Abdeckung abschaetzen (Dateien mit Tests vs. Dateien ohne)
4. Abhaengigkeitszustand pruefen: Lock-Dateien vorhanden, veraltete Abhaengigkeiten, bekannte Schwachstellen
5. Build-System, CI/CD-Konfiguration und Dokumentationszustand vermerken
6. Die Bestandsaufnahme als Eroeffnungsabschnitt des Berichts festhalten

**Erwartet:** Ein sachliches Inventar — Dateianzahlen, Sprachen, Test-Praesenz, Abhaengigkeits-Gesundheit. Noch keine Urteile.

**Bei Fehler:** Wenn der Zielpfad leer oder nicht zugaenglich ist, stoppen und melden. Wenn spezifische Unterverzeichnisse nicht zugaenglich sind, diese vermerken und mit dem Verfuegbaren fortfahren.

### Schritt 2: Architektur-Review

Strukturelle Gesundheit bewerten: Kopplung, Duplikation, Datenfluss und Trennung der Belange.

1. Modul-/Verzeichnisstruktur kartieren und das primaere Architekturmuster identifizieren
2. Code-Duplikation pruefen — wiederholte Logik ueber Dateien, Copy-Paste-Muster
3. Kopplung bewerten — wie viele Dateien muessen fuer eine einzelne Funktionserweiterung geaendert werden
4. Datenfluss bewerten — gibt es klare Grenzen zwischen Schichten (UI, Logik, Daten)?
5. Toten Code, ungenutzte Exporte und verwaiste Dateien identifizieren
6. Auf konsistente Muster pruefen — folgt die Codebasis ihren eigenen Konventionen?
7. Jeden Befund bewerten: CRITICAL, HIGH, MEDIUM oder LOW

**Erwartet:** Eine Liste architektonischer Befunde mit Schweregradbewertungen und Datei-Referenzen. Haeufige Befunde: Modusdispatch-Duplikation, fehlende Abstraktionsschichten, zirkulaere Abhaengigkeiten.

**Bei Fehler:** Wenn die Codebasis fuer ein sinnvolles Architektur-Review zu klein ist (weniger als 5 Dateien), dies vermerken und zu Schritt 3 springen. Architektur-Review erfordert genuegend Code fuer Struktur.

### Schritt 3: Sicherheits-Audit

Sicherheitsschwachstellen und Luecken im defensiven Coding identifizieren.

1. Injektionsvektoren scannen: HTML-Injektion (`innerHTML`), SQL-Injektion, Befehlsinjektion
2. Authentifizierungs- und Autorisierungsmuster pruefen (falls zutreffend)
3. Fehlerbehandlung reviewen — werden Fehler stillschweigend verschluckt? Lecken Fehlermeldungen interne Details?
4. Abhaengigkeitsversionen gegen bekannte CVEs pruefen
5. Auf hartcodierte Secrets, API-Schluessel oder Anmeldedaten pruefen
6. Docker-/Container-Sicherheit pruefen: Root-Nutzer, exponierte Ports, Build-Secrets
7. localStorage/sessionStorage auf sensible Datenspeicherung pruefen
8. Jeden Befund bewerten: CRITICAL, HIGH, MEDIUM oder LOW

**Erwartet:** Eine Liste von Sicherheitsbefunden mit Schweregrad, betroffenen Dateien und Behebungsempfehlungen. CRITICAL-Befunde umfassen Injektionsschwachstellen und exponierte Secrets.

**Bei Fehler:** Wenn kein sicherheitsrelevanter Code vorhanden ist (reines Dokumentationsprojekt), dies vermerken und zu Schritt 4 springen.

### Schritt 4: Codequalitaet

Wartbarkeit, Lesbarkeit und defensives Coding bewerten.

1. Magische Zahlen und hartcodierte Werte identifizieren, die benannte Konstanten sein sollten
2. Konsistente Namenskonventionen in der Codebasis pruefen
3. Fehlende Eingabevalidierung an Systemgrenzen finden
4. Fehlerbehandlungsmuster bewerten — sind sie konsistent? Liefern sie nuetzliche Meldungen?
5. Auskommentierten Code, TODO-/FIXME-Markierungen und unvollstaendige Implementierungen pruefen
6. Testqualitaet reviewen — testen Tests Verhalten oder Implementierungsdetails?
7. Jeden Befund bewerten: CRITICAL, HIGH, MEDIUM oder LOW

**Erwartet:** Eine Liste von Qualitaetsbefunden, die sich auf Wartbarkeit konzentrieren. Haeufige Befunde: magische Zahlen, inkonsistente Muster, fehlende Eingabepruefungen.

**Bei Fehler:** Wenn die Codebasis generiert oder minifiziert ist, dies vermerken und Erwartungen anpassen. Generierter Code hat andere Qualitaetskriterien als handgeschriebener Code.

### Schritt 5: UX und Zugaenglichkeit (wenn Frontend vorhanden)

User Experience und Zugaenglichkeitskonformitaet bewerten.

1. ARIA-Rollen, -Labels und -Landmarks auf interaktiven Elementen pruefen
2. Tastaturnavigation verifizieren — koennen alle interaktiven Elemente per Tab erreicht werden?
3. Fokusverwaltung pruefen — bewegt sich der Fokus logisch, wenn Panels oeffnen/schliessen?
4. Responsives Design testen — an gaengigen Breakpoints testen (320px, 768px, 1024px)
5. Farbkontrastverhaaltnisse auf Einhaltung von WCAG 2.1 AA pruefen
6. Screenreader-Kompatibilitaet pruefen — werden dynamische Inhaltaenderungen angezeigt?
7. Jeden Befund bewerten: CRITICAL, HIGH, MEDIUM oder LOW

**Erwartet:** Eine Liste von UX-/Zugaenglichkeits-Befunden mit WCAG-Referenzen wo zutreffend. Wenn kein Frontend vorhanden ist, erzeugt dieser Schritt "N/A — kein Frontend-Code erkannt."

**Bei Fehler:** Wenn Frontend-Code vorhanden ist, aber nicht gerendert werden kann (fehlender Build-Schritt), den Quellcode statisch pruefen und vermerken, dass Laufzeittests nicht moeglich waren.

### Schritt 6: Befunde zusammenfassen

Alle Befunde in eine priorisierte Zusammenfassung zusammenstellen.

1. Befunde aus allen Phasen in eine einzige Tabelle zusammenfuehren
2. Nach Schweregrad sortieren (CRITICAL zuerst, dann HIGH, MEDIUM, LOW)
3. Innerhalb jedes Schweregrads nach Thema gruppieren (Sicherheit, Architektur, Qualitaet, UX)
4. Fuer jeden Befund einschliessen: Schweregrad, Phase, Datei(en), einzeilige Beschreibung, vorgeschlagene Loesung
5. Empfohlene Reparaturreihenfolge erstellen, die Abhaengigkeiten zwischen Fixes beruecksichtigt
6. Zusammenfassen: Gesamtbefunde nach Schweregrad, Top-3-Prioritaeten, geschaetztes Aufwandsniveau

**Erwartet:** Eine Befundtabelle mit den Spalten: `#`, `Schweregrad`, `Phase`, `Datei(en)`, `Befund`, `Fix`. Eine Reparaturreihenfolge-Empfehlung, die Abhaengigkeiten beruecksichtigt (z. B. "Architektur refaktorieren bevor Tests hinzugefuegt werden").

**Bei Fehler:** Wenn keine Befunde erzeugt wurden, ist das selbst ein Befund — entweder ist die Codebasis aussergewoehnlich sauber oder der Review war zu oberflaechlich. Mindestens eine Phase mit tieferer Untersuchung erneut pruefen.

## Validierung

- [ ] Alle angeforderten Phasen wurden abgeschlossen (oder explizit mit Begruendung uebersprungen)
- [ ] Jeder Befund hat eine Schweregradbewertung (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Jeder Befund referenziert mindestens eine Datei oder ein Verzeichnis
- [ ] Die Befundtabelle ist nach Schweregrad sortiert
- [ ] Reparaturreihenfolge-Empfehlungen beruecksichtigen Abhaengigkeiten zwischen Befunden
- [ ] Die Zusammenfassung enthaelt Gesamtanzahlen nach Schweregrad
- [ ] Wenn `output_format` `report` einschliesst, begleiten narrative Abschnitte die Tabelle

## Skalierung mit Pause

Zwischen Review-Phasen `/rest` als Kontrollpunkt verwenden — besonders zwischen Phasen 2-5, die unterschiedliche analytische Perspektiven erfordern. Eine Kontrollpunkt-Pause (kurz, uebergangsbezogen) verhindert, dass der Schwung einer Phase die naechste beeinflusst. Der Abschnitt "Skalierung der Pause" im `rest`-Skill fuer Leitlinien zu Kontrollpunkt- vs. vollstaendiger Pause lesen.

## Haeufige Stolperfallen

- **Den Ozean auskochen**: Jede Zeile einer grossen Codebasis zu reviewen erzeugt Rauschen. Auf Bereiche mit grosser Wirkung konzentrieren: Einstiegspunkte, Sicherheitsgrenzen und architektonische Nahtstellen
- **Schweregrad-Inflation**: Nicht jeder Befund ist CRITICAL. CRITICAL fuer ausnutzbare Schwachstellen und Datenverlust-Risiken reservieren. Die meisten architektonischen Probleme sind MEDIUM
- **Den Wald vor lauter Baeumen nicht sehen**: Einzelne Codequalitaets-Probleme sind weniger wichtig als systemische Muster. Wenn magische Zahlen in 20 Dateien erscheinen, ist das ein architektonischer Befund, nicht 20 Qualitaetsbefunde
- **Die Bestandsaufnahme ueberspringen**: Die Bestandsaufnahme (Schritt 1) erscheint buerokratisch, verhindert aber das Review von Code, der nicht existiert, oder das Verpassen ganzer Verzeichnisse
- **Phasen-Blutung**: Sicherheitsbefunde waehrend des Architektur-Reviews oder Qualitaetsbefunde waehrend des Sicherheits-Audits. Sie fuer die korrekte Phase vermerken statt Belange zu mischen — dies ergibt eine sauberere Befundtabelle

## Verwandte Skills

- `security-audit-codebase` — eingehender Sicherheits-Audit wenn die Sicherheitsphase des review-codebase-Skills komplexe Schwachstellen aufdeckt
- `review-software-architecture` — detailliertes Architektur-Review fuer spezifische Teilsysteme
- `review-ux-ui` — umfassender UX-/Zugaenglichkeits-Audit ueber das hinaus, was Phase 5 abdeckt
- `review-pull-request` — diff-beschraenktes Review fuer einzelne Aenderungen
- `clean-codebase` — implementiert die durch diesen Review identifizierten Codequalitaets-Fixes
- `create-github-issues` — konvertiert Befundtabelle in nachverfolgte GitHub-Issues
