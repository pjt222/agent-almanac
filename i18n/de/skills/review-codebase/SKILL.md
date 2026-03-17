---
name: review-codebase
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Mehrphasiger eingehender Codebasis-Review mit Schweregradbewertungen und
  strukturierter Ausgabe. Umfasst Architektur, Sicherheit, Codequalitaet und
  UX/Barrierefreiheit in einem einzelnen koordinierten Durchlauf. Erzeugt
  eine priorisierte Befundtabelle die direkt ueber den Skill
  create-github-issues in GitHub-Issues umgewandelt werden kann.
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

# Codebasis ueberpruefen

Mehrphasiger eingehender Codebasis-Review der schweregradbewertete Befunde mit Empfehlungen zur Behebungsreihenfolge erzeugt. Anders als `review-pull-request` (auf einen Diff beschraenkt) oder einzelne Domaenen-Reviews (`security-audit-codebase`, `review-software-architecture`) deckt dieser Skill ein gesamtes Projekt oder Teilprojekt ueber alle Qualitaetsdimensionen in einem Durchlauf ab.

## Wann verwenden

- Gesamtprojekt- oder Teilprojekt-Review (nicht PR-bezogen)
- Onboarding fuer eine neue Codebasis — ein mentales Modell aufbauen was existiert und was Aufmerksamkeit braucht
- Periodische Gesundheitspruefungen nach anhaltendem Entwickeln
- Qualitaetstor vor der Veroeffentlichung ueber Architektur, Sicherheit, Codequalitaet und UX
- Wenn die Ausgabe direkt in Issue-Erstellung oder Sprint-Planung einfliessen soll

## Eingaben

- **Erforderlich**: `target_path` — Stammverzeichnis der zu ueberpruefenden Codebasis oder des Teilprojekts
- **Optional**:
  - `scope` — welche Phasen ausgefuehrt werden: `full` (Standard), `security`, `architecture`, `quality`, `ux`
  - `output_format` — `findings` (nur Tabelle), `report` (Erzaehlung), `both` (Standard)
  - `severity_threshold` — Mindestschweregrad fuer die Aufnahme: `LOW` (Standard), `MEDIUM`, `HIGH`, `CRITICAL`

## Vorgehensweise

### Schritt 1: Bestandsaufnahme

Die Codebasis inventarisieren um den Umfang festzustellen und Review-Ziele zu identifizieren.

1. Dateien nach Sprache/Typ zaehlen: `find target_path -type f | nach Endung sortieren`
2. Gesamtzeilenzahlen pro Sprache messen
3. Testverzeichnisse identifizieren und Testabdeckung schaetzen (Dateien mit Tests vs. Dateien ohne)
4. Abhaengigkeitszustand pruefen: Lockfiles vorhanden, veraltete Abhaengigkeiten, bekannte Schwachstellen
5. Build-System, CI/CD-Konfiguration und Dokumentationszustand erfassen
6. Die Bestandsaufnahme als Eroeffnungsabschnitt des Berichts festhalten

**Erwartet:** Ein sachliches Inventar — Dateianzahlen, Sprachen, Vorhandensein von Tests, Abhaengigkeitsgesundheit. Noch keine Urteile.

**Bei Fehler:** Wenn der Zielpfad leer oder nicht zugaenglich ist, stoppen und berichten. Wenn bestimmte Unterverzeichnisse nicht zugaenglich sind, sie vermerken und mit dem Verfuegbaren fortfahren.

### Schritt 2: Architektur-Review

Strukturelle Gesundheit bewerten: Kopplung, Duplizierung, Datenfluss und Trennung der Zustaendigkeiten.

1. Die Modul-/Verzeichnisstruktur kartieren und das primaere Architekturmuster identifizieren
2. Auf Code-Duplizierung pruefen — wiederholte Logik ueber Dateien hinweg, Kopier-Einfuege-Muster
3. Kopplung bewerten — wie viele Dateien muessen sich fuer eine einzelne Funktionsaenderung aendern
4. Datenfluss evaluieren — gibt es klare Grenzen zwischen Schichten (UI, Logik, Daten)?
5. Toten Code, ungenutzte Exporte und verwaiste Dateien identifizieren
6. Auf einheitliche Muster pruefen — folgt die Codebasis ihren eigenen Konventionen?
7. Jeden Befund bewerten: CRITICAL, HIGH, MEDIUM oder LOW

**Erwartet:** Eine Liste von Architekturbefunden mit Schweregradbewertungen und Dateireferenzen. Haeufige Befunde: Modus-Dispatch-Duplizierung, fehlende Abstraktionsschichten, zirkulaere Abhaengigkeiten.

**Bei Fehler:** Wenn die Codebasis zu klein fuer einen aussagekraeftigen Architektur-Review ist (< 5 Dateien), dies vermerken und zu Schritt 3 springen. Architektur-Review braucht genug Code um Struktur zu haben.

### Schritt 3: Sicherheitsaudit

Sicherheitsschwachstellen und Luecken in der defensiven Programmierung identifizieren.

1. Auf Injektionsvektoren scannen: HTML-Injektion (`innerHTML`), SQL-Injektion, Befehlsinjektion
2. Authentifizierungs- und Autorisierungsmuster pruefen (falls zutreffend)
3. Fehlerbehandlung ueberpruefen — werden Fehler stillschweigend verschluckt? Legen Fehlermeldungen interne Details offen?
4. Abhaengigkeitsversionen gegen bekannte CVEs auditieren
5. Auf hartcodierte Geheimnisse, API-Schluessel oder Zugangsdaten pruefen
6. Docker-/Container-Sicherheit pruefen: Root-Benutzer, offene Ports, Build-Geheimnisse
7. localStorage/sessionStorage auf Speicherung sensibler Daten pruefen
8. Jeden Befund bewerten: CRITICAL, HIGH, MEDIUM oder LOW

**Erwartet:** Eine Liste von Sicherheitsbefunden mit Schweregrad, betroffenen Dateien und Hinweisen zur Behebung. CRITICAL-Befunde umfassen Injektionsschwachstellen und offengelegte Geheimnisse.

**Bei Fehler:** Wenn kein sicherheitsrelevanter Code existiert (reines Dokumentationsprojekt), dies vermerken und zu Schritt 4 springen.

### Schritt 4: Codequalitaet

Wartbarkeit, Lesbarkeit und defensive Programmierung evaluieren.

1. Magische Zahlen und hartcodierte Werte identifizieren die benannte Konstanten sein sollten
2. Auf einheitliche Benennungskonventionen ueber die Codebasis pruefen
3. Fehlende Eingabevalidierung an Systemgrenzen finden
4. Fehlerbehandlungsmuster bewerten — sind sie einheitlich? Liefern sie nuetzliche Meldungen?
5. Auf auskommentierten Code, TODO/FIXME-Markierungen und unvollstaendige Implementierungen pruefen
6. Testqualitaet ueberpruefen — testen die Tests Verhalten oder Implementierungsdetails?
7. Jeden Befund bewerten: CRITICAL, HIGH, MEDIUM oder LOW

**Erwartet:** Eine Liste von Qualitaetsbefunden mit Fokus auf Wartbarkeit. Haeufige Befunde: magische Zahlen, uneinheitliche Muster, fehlende Schutzpruefungen.

**Bei Fehler:** Wenn die Codebasis generiert oder minifiziert ist, dies vermerken und Erwartungen anpassen. Generierter Code hat andere Qualitaetskriterien als handgeschriebener Code.

### Schritt 5: UX und Barrierefreiheit (falls Frontend vorhanden)

Benutzererfahrung und Barrierefreiheitskonformitaet evaluieren.

1. ARIA-Rollen, -Labels und -Landmarks an interaktiven Elementen pruefen
2. Tastaturnavigation verifizieren — koennen alle interaktiven Elemente per Tab erreicht werden?
3. Fokusverwaltung testen — bewegt sich der Fokus logisch wenn Panels geoeffnet/geschlossen werden?
4. Responsives Design pruefen — an gaengigen Breakpoints testen (320px, 768px, 1024px)
5. Farbkontrastverhaeltnisse gegen WCAG 2.1 AA-Standards pruefen
6. Screenreader-Kompatibilitaet pruefen — werden dynamische Inhaltsaenderungen angekuendigt?
7. Jeden Befund bewerten: CRITICAL, HIGH, MEDIUM oder LOW

**Erwartet:** Eine Liste von UX/Barrierefreiheitsbefunden mit WCAG-Referenzen wo zutreffend. Wenn kein Frontend existiert, erzeugt dieser Schritt "N/A — kein Frontend-Code erkannt."

**Bei Fehler:** Wenn Frontend-Code existiert aber nicht gerendert werden kann (fehlender Build-Schritt), den Quellcode statisch auditieren und vermerken dass Laufzeittests nicht moeglich waren.

### Schritt 6: Befundsynthese

Alle Befunde in eine priorisierte Zusammenfassung zusammenfuehren.

1. Befunde aus allen Phasen in eine einzelne Tabelle zusammenfuehren
2. Nach Schweregrad sortieren (CRITICAL zuerst, dann HIGH, MEDIUM, LOW)
3. Innerhalb jedes Schweregrads nach Thema gruppieren (Sicherheit, Architektur, Qualitaet, UX)
4. Fuer jeden Befund angeben: Schweregrad, Phase, Datei(en), Einzeiler-Beschreibung, vorgeschlagene Behebung
5. Eine empfohlene Behebungsreihenfolge erstellen die Abhaengigkeiten zwischen Behebungen beruecksichtigt
6. Zusammenfassen: Gesamtbefunde nach Schweregrad, Top 3 Prioritaeten, geschaetztes Aufwandsniveau

**Erwartet:** Eine Befundtabelle mit Spalten: `#`, `Schweregrad`, `Phase`, `Datei(en)`, `Befund`, `Behebung`. Eine Empfehlung zur Behebungsreihenfolge die Abhaengigkeiten beruecksichtigt (z.B. "Architektur umstrukturieren bevor Tests hinzugefuegt werden").

**Bei Fehler:** Wenn keine Befunde erzeugt wurden, ist das selbst ein Befund — entweder ist die Codebasis aussergewoehnlich sauber oder der Review war zu oberflaechlich. Mindestens eine Phase mit tieferer Inspektion erneut untersuchen.

## Validierung

- [ ] Alle angeforderten Phasen wurden abgeschlossen (oder explizit mit Begruendung uebersprungen)
- [ ] Jeder Befund hat eine Schweregradbewertung (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Jeder Befund referenziert mindestens eine Datei oder ein Verzeichnis
- [ ] Die Befundtabelle ist nach Schweregrad sortiert
- [ ] Empfehlungen zur Behebungsreihenfolge beruecksichtigen Abhaengigkeiten zwischen Befunden
- [ ] Die Zusammenfassung enthaelt Gesamtzahlen nach Schweregrad
- [ ] Wenn `output_format` `report` einschliesst, begleiten erzaehlende Abschnitte die Tabelle

## Skalierung mit Ruhe

Zwischen Review-Phasen `/rest` als Kontrollpunkt verwenden — besonders zwischen den Phasen 2-5 die verschiedene analytische Perspektiven erfordern. Eine Kontrollpunkt-Ruhe (kurz, uebergangsartig) verhindert dass der Schwung einer Phase die naechste verzerrt. Siehe den Abschnitt "Abstufungen der Ruhe" im `rest`-Skill fuer Hinweise zu Kontrollpunkt- vs. voller Ruhe.

## Haeufige Stolperfallen

- **Den Ozean kochen**: Jede Zeile einer grossen Codebasis ueberpruefen erzeugt Rauschen. Auf wirkungsstarke Bereiche konzentrieren: Einstiegspunkte, Sicherheitsgrenzen und architektonische Naehte
- **Schweregrad-Inflation**: Nicht jeder Befund ist CRITICAL. CRITICAL fuer ausnutzbare Schwachstellen und Datenverlustrisiken reservieren. Die meisten Architekturprobleme sind MEDIUM
- **Den Wald vor lauter Baeumen nicht sehen**: Einzelne Codequalitaetsprobleme sind weniger wichtig als systemische Muster. Wenn magische Zahlen in 20 Dateien auftauchen, ist das ein Architekturbefund, nicht 20 Qualitaetsbefunde
- **Die Bestandsaufnahme ueberspringen**: Die Bestandsaufnahme (Schritt 1) wirkt buerokratisch aber verhindert das Ueberpruefen von Code der nicht existiert oder das Uebersehen ganzer Verzeichnisse
- **Phasenuebergriff**: Sicherheitsbefunde waehrend des Architektur-Reviews, oder Qualitaetsbefunde waehrend des Sicherheitsaudits. Sie fuer die korrekte Phase vermerken statt die Anliegen zu vermischen — das erzeugt eine sauberere Befundtabelle

## Verwandte Skills

- `security-audit-codebase` — tiefgehendes Sicherheitsaudit wenn die Sicherheitsphase des review-codebase komplexe Schwachstellen aufdeckt
- `review-software-architecture` — detaillierter Architektur-Review fuer spezifische Teilsysteme
- `review-ux-ui` — umfassendes UX/Barrierefreiheitsaudit ueber das hinaus was Phase 5 abdeckt
- `review-pull-request` — auf Diffs beschraenkter Review fuer einzelne Aenderungen
- `clean-codebase` — implementiert die durch diesen Review identifizierten Codequalitaetsbehebungen
- `create-github-issues` — wandelt die Befundtabelle in nachverfolgte GitHub-Issues um
