---
name: review-software-architecture
description: >
  Bewertet Softwarearchitektur auf Kopplung, Kohaesion, SOLID-Prinzipien,
  API-Design, Skalierbarkeit und technische Schulden. Umfasst systemweite
  Bewertung, Review von Architecture Decision Records und
  Verbesserungsempfehlungen. Verwenden bei der Bewertung einer vorgeschlagenen
  Architektur vor der Implementierung, beim Assessment eines bestehenden Systems
  auf Skalierbarkeit oder Sicherheit, beim Review von ADRs, bei einer
  Technische-Schulden-Bestandsaufnahme oder bei der Bewertung der Bereitschaft
  fuer einen wesentlichen Skalierungsschritt.
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
  tags: architecture, solid, coupling, cohesion, api-design, scalability, tech-debt, adr
---

# Softwarearchitektur reviewen

Softwarearchitektur auf Systemebene hinsichtlich Qualitaetsattribute, Einhaltung von Designprinzipien und langfristiger Wartbarkeit bewerten.

## Wann verwenden

- Bewertung einer vorgeschlagenen Architektur vor Beginn der Implementierung
- Einschaetzung eines bestehenden Systems auf Skalierbarkeit, Wartbarkeit oder Sicherheit
- Review von Architecture Decision Records (ADRs) fuer ein Projekt
- Durchfuehrung einer Technische-Schulden-Bestandsaufnahme
- Bewertung, ob ein System bereit fuer einen signifikanten Skalierungs- oder Funktionserweiterungsschritt ist
- Abgrenzung vom zeilenbasierten Code-Review (der sich auf Aenderungen auf PR-Ebene konzentriert)

## Eingaben

- **Erforderlich**: System-Codebasis oder Architekturdokumentation (Diagramme, ADRs, README)
- **Erforderlich**: Kontext ueber Zweck, Groessenordnung und Einschraenkungen des Systems
- **Optional**: Nichtfunktionale Anforderungen (Latenz-, Durchsatz-, Verfuegbarkeitsziele)
- **Optional**: Teamgroesse und Kompetenzverteilung
- **Optional**: Technologische Einschraenkungen oder Praeferenzen
- **Optional**: Bekannte Schwachstellen oder Problembereiche

## Vorgehensweise

### Schritt 1: Systemkontext verstehen

Systemgrenzen und Schnittstellen erfassen:

```markdown
## Systemkontext
- **Name**: [Systemname]
- **Zweck**: [Einzeilige Beschreibung]
- **Nutzer**: [Wer es nutzt und wie]
- **Groessenordnung**: [Anfragen/Sek., Datenvolumen, Nutzerzahl]
- **Alter**: [Jahre im Produktionsbetrieb, Hauptversionen]
- **Team**: [Groesse, Zusammensetzung]

## Externe Abhaengigkeiten
| Abhaengigkeit | Typ | Kritikalitaet | Anmerkungen |
|-----------|------|-------------|-------|
| PostgreSQL | Datenbank | Kritisch | Primaerer Datenspeicher |
| Redis | Cache | Hoch | Session-Speicher + Caching |
| Stripe | Externe API | Kritisch | Zahlungsabwicklung |
| S3 | Objektspeicher | Hoch | Datei-Uploads |
```

**Erwartet:** Klares Bild davon, was das System tut und wovon es abhaengt.
**Bei Fehler:** Wenn die Architekturdokumentation fehlt, den Kontext aus Codestruktur, Konfigurationen und Deployment-Dateien ableiten.

### Schritt 2: Strukturelle Qualitaet bewerten

#### Kopplungsbewertung
Untersuchen, wie stark Module voneinander abhaengen:

- [ ] **Abhaengigkeitsrichtung**: Fliessen Abhaengigkeiten in eine Richtung (geschichtet) oder sind sie zirkulaer?
- [ ] **Schnittstellengrenzen**: Sind Module ueber definierte Schnittstellen/Vertraege oder direkte Implementierungsreferenzen verbunden?
- [ ] **Geteilter Zustand**: Wird veraenderlicher Zustand zwischen Modulen geteilt?
- [ ] **Datenbankkopplung**: Lesen/schreiben mehrere Services direkt in dieselben Tabellen?
- [ ] **Zeitliche Kopplung**: Muessen Operationen in einer bestimmten Reihenfolge stattfinden ohne explizite Orchestrierung?

```bash
# Zirkulaere Abhaengigkeiten erkennen (JavaScript/TypeScript)
npx madge --circular src/

# Importmuster erkennen (Python)
# Nach tiefen paketuebergreifenden Importen suchen
grep -r "from app\." --include="*.py" | sort | uniq -c | sort -rn | head -20
```

#### Kohaesionsbewertung
Bewerten, ob jedes Modul eine einzige, klare Verantwortung hat:

- [ ] **Modulbenennung**: Beschreibt der Name genau, was das Modul tut?
- [ ] **Dateigroesse**: Sind Dateien oder Klassen uebermaeßig gross (>500 Zeilen legt mehrere Verantwortlichkeiten nahe)?
- [ ] **Aenderungshaeufigkeit**: Erfordern nicht zusammenhaengende Features Aenderungen am selben Modul?
- [ ] **God Objects**: Gibt es Klassen/Module, von denen alles abhaengt?

| Kopplungsniveau | Beschreibung | Beispiel |
|---------------|-------------|---------|
| Niedrig (gut) | Module kommunizieren ueber Schnittstellen | Service A ruft die API von Service B auf |
| Mittel | Module teilen Datenstrukturen | Gemeinsame DTO/Modell-Bibliothek |
| Hoch (Bedenken) | Module referenzieren Interna des anderen | Direkter Datenbankzugriff ueber Module |
| Pathologisch | Module veraendern den internen Zustand des anderen | Globaler veraenderlicher Zustand |

**Erwartet:** Kopplung und Kohaesion mit spezifischen Beispielen aus der Codebasis bewertet.
**Bei Fehler:** Wenn die Codebasis fuer ein manuelles Review zu gross ist, 3-5 Schluesselmodule und die am haeufigsten geaenderten Dateien stichprobenartig pruefen.

### Schritt 3: SOLID-Prinzipien bewerten

| Prinzip | Frage | Warnzeichen |
|-----------|----------|-----------|
| **S**ingle Responsibility | Hat jede Klasse/jedes Modul einen einzigen Aenderungsgrund? | Klassen mit >5 oeffentlichen Methoden zu unzusammenhaengenden Belangen |
| **O**pen/Closed | Kann Verhalten erweitert werden, ohne bestehenden Code zu aendern? | Haeufige Aenderungen an Kernklassen fuer jedes neue Feature |
| **L**iskov-Substitution | Koennen Untertypen ihre Basistypen ersetzen, ohne das Verhalten zu brechen? | Typprüfungen (`instanceof`) ueber Consumer-Code verstreut |
| **I**nterface Segregation | Sind Schnittstellen fokussiert und minimal? | "Fette" Schnittstellen, bei denen Konsumenten ungenutzte Methoden implementieren |
| **D**ependency Inversion | Haengen hochwertige Module von Abstraktionen ab, nicht von Details? | Direkte Instanziierung von Infrastrukturklassen in der Geschaeftslogik |

```markdown
## SOLID-Bewertung
| Prinzip | Status | Nachweis | Auswirkung |
|-----------|--------|----------|--------|
| SRP | Bedenken | UserService behandelt Auth, Profil, Benachrichtigungen und Abrechnung | Hoch — Aenderungen an der Abrechnung riskieren, Auth zu brechen |
| OCP | Gut | Plugin-System fuer Zahlungsanbieter | Niedrig |
| LSP | Gut | Keine Typ-Check-Anti-Patterns gefunden | Niedrig |
| ISP | Bedenken | IRepository hat 15 Methoden, die meisten Implementierungen nutzen 3-4 | Mittel |
| DIP | Bedenken | Controller instanziieren Datenbankrepositories direkt | Mittel |
```

**Erwartet:** Jedes Prinzip mit mindestens einem spezifischen Beispiel bewertet.
**Bei Fehler:** Nicht alle Prinzipien gelten gleich fuer jeden Architekturstil. Vermerken, wenn ein Prinzip weniger relevant ist (z. B. ISP weniger wichtig in funktionalen Codebases).

### Schritt 4: API-Design reviewen

Fuer Systeme, die APIs exponieren (REST, GraphQL, gRPC):

- [ ] **Konsistenz**: Namenskonventionen, Fehlerformate, Paginierungsmuster einheitlich
- [ ] **Versionierung**: Strategie vorhanden und angewendet (URL, Header, Content-Negotiation)
- [ ] **Fehlerbehandlung**: Fehlerantworten sind strukturiert, konsistent und lecken keine internen Details
- [ ] **Authentifizierung/Autorisierung**: Auf API-Ebene korrekt durchgesetzt
- [ ] **Rate Limiting**: Schutz vor Missbrauch
- [ ] **Dokumentation**: OpenAPI/Swagger, GraphQL-Schema oder Protobuf-Definitionen gepflegt
- [ ] **Idempotenz**: Mutierende Operationen (POST/PUT) behandeln Wiederholungsversuche sicher

```markdown
## API-Design-Review
| Aspekt | Status | Anmerkungen |
|--------|--------|-------|
| Namenskonsistenz | Gut | Durchgaengige RESTful-Ressourcenbenennung |
| Versionierung | Bedenken | Keine Versionierungsstrategie — Breaking Changes betreffen alle Clients |
| Fehlerformat | Gut | RFC 7807 Problem Details konsistent verwendet |
| Auth | Gut | JWT mit rollenbasierten Scopes |
| Rate Limiting | Fehlend | Kein Rate Limiting an irgendeinem Endpunkt |
| Dokumentation | Bedenken | OpenAPI-Spec vorhanden, aber 6 Monate veraltet |
```

**Erwartet:** API-Design gegen gaengige Standards reviewed mit spezifischen Befunden.
**Bei Fehler:** Wenn keine API exponiert wird, diesen Schritt ueberspringen und sich auf interne Modulschnittstellen konzentrieren.

### Schritt 5: Skalierbarkeit und Zuverlaessigkeit bewerten

- [ ] **Zustandslosigkeit**: Kann die Applikation horizontal skalieren (kein lokaler Zustand)?
- [ ] **Datenbankskalierbarkeit**: Sind Abfragen indiziert? Ist das Schema fuer das Datenvolumen geeignet?
- [ ] **Caching-Strategie**: Wird Caching auf geeigneten Ebenen eingesetzt (Datenbank, Anwendung, CDN)?
- [ ] **Fehlerbehandlung**: Was passiert, wenn eine Abhaengigkeit nicht verfuegbar ist (Circuit Breaker, Retry, Fallback)?
- [ ] **Observierbarkeit**: Sind Logs, Metriken und Traces implementiert?
- [ ] **Datenkonsistenz**: Ist eventuelle Konsistenz akzeptabel oder ist starke Konsistenz erforderlich?

**Erwartet:** Skalierbarkeit und Zuverlaessigkeit relativ zu formulierten nichtfunktionalen Anforderungen bewertet.
**Bei Fehler:** Wenn nichtfunktionale Anforderungen undokumentiert sind, deren Definition als ersten Schritt empfehlen.

### Schritt 6: Technische Schulden bewerten

```markdown
## Technische-Schulden-Inventar
| Punkt | Schweregrad | Auswirkung | Geschaetzter Aufwand | Empfehlung |
|------|----------|--------|-----------------|----------------|
| Keine Datenbankmigrationen | Hoch | Schaemaenderungen sind manuell und fehleranfaellig | 1 Sprint | Alembic/Flyway einfuehren |
| Monolithische Test-Suite | Mittel | Tests dauern 45 min, Entwickler ueberspringen sie | 2 Sprints | In Unit/Integration/E2E aufteilen |
| Hartcodierte Konfigurationswerte | Mittel | Umgebungsspezifische Werte im Quellcode | 1 Sprint | In Env-Variablen/Konfigurationsdienst auslagern |
| Keine CI/CD-Pipeline | Hoch | Manuelle Deployments fehleranfaellig | 1 Sprint | GitHub Actions einrichten |
```

**Erwartet:** Technische Schulden mit Schweregrad, Auswirkung und Aufwandsschaetzungen katalogisiert.
**Bei Fehler:** Wenn das Schuldeninventar ueberwaetigend ist, die 5 wichtigsten Punkte nach Auswirkungs-/Aufwandsverhaeltnis priorisieren.

### Schritt 7: Architecture Decision Records (ADRs) reviewen

Wenn ADRs vorhanden sind, beurteilen:
- [ ] Entscheidungen haben klaren Kontext (welches Problem geloest wurde)
- [ ] Alternativen wurden beruecksichtigt und dokumentiert
- [ ] Kompromisse sind explizit
- [ ] Entscheidungen sind noch aktuell (nicht ohne Dokumentation abgeloest)
- [ ] Neue wesentliche Entscheidungen haben ADRs

Wenn ADRs nicht vorhanden sind, deren Einfuehrung fuer Schluesselelentscheidungen empfehlen.

### Schritt 8: Den Architektur-Review verfassen

```markdown
## Architektur-Review-Bericht

### Zusammenfassung
[2-3 Saetze: Gesamtzustand, wesentliche Bedenken, empfohlene Massnahmen]

### Staerken
1. [Spezifische architektonische Staerke mit Nachweis]
2. ...

### Bedenken (nach Schweregrad)

#### Kritisch
1. **[Titel]**: [Beschreibung, Auswirkung, Empfehlung]

#### Wesentlich
1. **[Titel]**: [Beschreibung, Auswirkung, Empfehlung]

#### Geringfuegig
1. **[Titel]**: [Beschreibung, Empfehlung]

### Zusammenfassung technischer Schulden
[Top-5-Schulden mit priorisierten Empfehlungen]

### Empfohlene naechste Schritte
1. [Umsetzbare Empfehlung mit klarem Umfang]
2. ...
```

**Erwartet:** Review-Bericht ist umsetzbar mit priorisierten Empfehlungen.
**Bei Fehler:** Wenn der Review zeitlich begrenzt ist, klar angeben, was abgedeckt wurde und was unbewertet bleibt.

## Validierung

- [ ] Systemkontext dokumentiert (Zweck, Groessenordnung, Abhaengigkeiten, Team)
- [ ] Kopplung und Kohaesion mit spezifischen Codebeispielen bewertet
- [ ] SOLID-Prinzipien wo zutreffend ausgewertet
- [ ] API-Design reviewed (wenn zutreffend)
- [ ] Skalierbarkeit und Zuverlaessigkeit gegen Anforderungen bewertet
- [ ] Technische Schulden katalogisiert und priorisiert
- [ ] ADRs reviewed oder deren Fehlen vermerkt
- [ ] Empfehlungen sind spezifisch, priorisiert und umsetzbar

## Haeufige Stolperfallen

- **Code statt Architektur reviewen**: Dieser Skill befasst sich mit systemweitem Design, nicht mit zeilenweiser Code-Qualitaet. `code-reviewer` fuer PR-Feedback verwenden.
- **Spezifische Technologie vorschreiben**: Architektur-Reviews sollten Probleme identifizieren, nicht bestimmte Tools vorschreiben, ausser es gibt einen klaren technischen Grund.
- **Teamkontext ignorieren**: Die "beste" Architektur fuer ein 3-koepfiges Team unterscheidet sich von der fuer ein 30-koepfiges Team. Organisatorische Einschraenkungen beruecksichtigen.
- **Perfektionismus**: Jedes System hat technische Schulden. Auf Schulden konzentrieren, die aktiv Schmerzen verursachen oder kuenftige Arbeit blockieren.
- **Skalierung annehmen**: Keine verteilten Systeme fuer eine App mit 100 Nutzern empfehlen. Architektur an tatsaechliche Anforderungen anpassen.

## Verwandte Skills

- `security-audit-codebase` — sicherheitsfokussiertes Code- und Konfigurationsreview
- `configure-git-repository` — Repository-Struktur und Konventionen
- `design-serialization-schema` — Datenschema-Design und -Entwicklung
- `review-data-analysis` — Review auf analytische Korrektheit (ergaenzende Perspektive)
