---
name: metal
description: >
  Die konzeptuelle Essenz eines Repositorys als Skills, Agents und Teams
  extrahieren — die Rollen, Prozeduren und Koordinationsmuster des Projekts
  als agentskills.io-Standarddefinitionen ausdruecken. Liest eine beliebige
  Codebasis und produziert generalisierte Definitionen, die erfassen, WAS
  das Projekt tut und WER es betreibt, ohne zu replizieren, WIE es das tut.
  Verwenden beim Onboarding in eine neue Codebasis und dem Wunsch, ihre
  konzeptuelle Architektur zu verstehen, beim Bootstrapping eines agentischen
  Systems aus einem bestehenden Projekt, beim Studium der organisatorischen
  DNA eines Projekts zur Kreuzbestaeubung, oder beim Erstellen einer
  Skill/Agent/Team-Bibliothek, inspiriert von einer Referenzimplementierung.
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: natural
  tags: alchemy, extraction, essence, meta, skills, agents, teams, conceptual, metallurgy
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Metall

Die konzeptuelle DNA eines Repositorys extrahieren — seine Rollen, Prozeduren und Koordinationsmuster — als generalisierte agentskills.io-Definitionen. Wie das Extrahieren von Edelmetall aus Erz trennt dieser Skill, was ein Projekt IST (seine Essenz) von dem, was es TUT (seine Implementierung), und produziert wiederverwendbare Skill-, Agent- und Team-Definitionen, die das organisatorische Genom des Projekts erfassen, ohne seine Codebasis zu reproduzieren.

## Wann verwenden

- Beim Onboarding in eine neue Codebasis und dem Wunsch, ihre konzeptuelle Architektur zu kartieren, bevor in Code eingetaucht wird
- Beim Bootstrapping eines agentischen Systems aus einem bestehenden Projekt — implizite Workflows in explizite Skill/Agent/Team-Definitionen verwandeln
- Beim Studium der organisatorischen DNA eines Projekts zur Kreuzbestaeubung in andere Projekte
- Beim Erstellen einer Skill/Agent/Team-Bibliothek, inspiriert von einer Referenzimplementierung, ohne sie zu kopieren
- Zum Verstehen, was die Struktur eines Projekts ueber die mentalen Modelle und Domaenenexpertise seiner Ersteller offenbart

## Eingaben

- **Erforderlich**: Pfad zum Repository oder Projektwurzelverzeichnis
- **Erforderlich**: Zweckerklaerung — warum wird Essenz extrahiert? (Onboarding, Bootstrapping, Studium oder Kreuzbestaeubung)
- **Optional**: Fokusdomaenen — spezifische Bereiche des Projekts zum Konzentrieren (Standard: alle)
- **Optional**: Ausgabetiefe — `survey` (nur Prospektion + Assay), `extract` (vollstaendige Prozedur) oder `report` (Extraktion + geschriebener Bericht) (Standard: `extract`)
- **Optional**: Maximale Extraktionen — Obergrenze fuer Gesamt-Skills + Agents + Teams (Standard: 15)

## Der Erztest

Das zentrale Qualitaetskriterium fuer alle Extraktion:

> **Koennte dieses Konzept in einer voellig anderen Implementierung existieren?**
>
> Wenn JA — es ist **Metall** (Essenz). Extrahieren.
> Wenn NEIN — es ist **Gangart** (Implementierungsdetail). Zuruecklassen.

Beispiel: Das Konzept einer Wetter-App "externe Datenquelle integrieren" ist Metall — es gilt fuer jedes Projekt, das Drittanbieterdaten abruft. Aber "OpenWeatherMap v3 JSON-Antwort parsen" ist Gangart — es ist spezifisch fuer eine API.

Extrahierte Skills sollten die KLASSE der Aufgabe beschreiben, nicht die spezifische Instanz. Extrahierte Agents sollten die ROLLE beschreiben, nicht die Person. Extrahierte Teams sollten das KOORDINATIONSMUSTER beschreiben, nicht das Organigramm.

## Vorgehensweise

### Schritt 1: Prospektion — Den Erzkoerper erkunden

Die Repository-Struktur ohne Urteil erkunden. Das Terrain kartieren, bevor abgebaut wird.

1. Den Verzeichnisbaum per Glob erfassen, um die Form des Projekts zu verstehen:
   - Quellverzeichnisse und ihr Organisationsmuster (nach Feature, nach Schicht, nach Domaene)
   - Konfigurationsdateien: `package.json`, `DESCRIPTION`, `setup.py`, `Cargo.toml`, `go.mod`, `Makefile`
   - Dokumentation: `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, Architekturdokumente
   - CI/CD: `.github/workflows/`, `Dockerfile`, Deployment-Konfigurationen
   - Testverzeichnisse und ihre Struktur
2. Die Selbstbeschreibung des Projekts lesen (README, Paketmanifest), um seinen deklarierten Zweck zu verstehen
3. Dateien nach Typ/Sprache zaehlen, um Umfang abzuschaetzen und die primaere Technologie zu identifizieren
4. Die Grenze des Projekts identifizieren — wo es beginnt und endet, wovon es abhaengt vs. was es bereitstellt
5. Den **Prospektionsbericht** produzieren:

```
Projekt: [Name]
Deklarierter Zweck: [aus README/Manifest]
Sprachen: [primaer, sekundaer]
Groesse: [Dateianzahl, ungefaehre LOC]
Form: [Monorepo/Bibliothek/App/Framework/Docs]
Externe Oberflaeche: [CLI/API/UI/Bibliotheksexports/keine]
```

**Erwartet:** Eine faktische Erhebung — was ist hier, wie gross, was behauptet das Projekt zu sein. Noch keine Klassifikation oder Urteil. Der Bericht liest sich wie eine geologische Erhebung, nicht wie eine Bewertung.

**Bei Fehler:** Wenn das Repository kein README oder Manifest hat, den Zweck aus Verzeichnisnamen, Dateiinhalten und Testbeschreibungen ableiten. Wenn das Projekt zu gross ist (>1000 Quelldateien), den Umfang auf die aktivsten Verzeichnisse eingrenzen (Git-Log-Frequenz oder README-Referenzen verwenden).

### Schritt 2: Assay — Die Zusammensetzung analysieren

Repraesentative Dateien lesen, um zu verstehen, was das Projekt auf konzeptueller Ebene TUT.

1. 5-10 repraesentative Dateien aus verschiedenen Bereichen des Projekts stichprobenartig untersuchen — nicht erschoepfend, aber vielfaeltig:
   - Einstiegspunkte (Hauptdateien, Route-Handler, CLI-Befehle)
   - Kernlogik (die am meisten importierten oder referenzierten Module)
   - Tests (sie offenbaren beabsichtigtes Verhalten klarer als Implementierung)
   - Konfiguration (offenbart betriebliche Belange und Deployment-Kontext)
2. Fuer jeden untersuchten Bereich identifizieren:
   - **Domaenen**: Welche Fachgebiete beruehrt das Projekt? (z.B. "Authentifizierung", "Datentransformation", "Berichtswesen")
   - **Verben**: Welche Aktionen fuehrt das Projekt aus? (z.B. "validieren", "transformieren", "bereitstellen", "benachrichtigen")
   - **Rollen**: Welche menschlichen oder System-Akteure bedient der Code? (z.B. "Dateningenieur", "Endbenutzer", "Pruefer")
   - **Ablaeufe**: Welche Handlungssequenzen bilden Workflows? (z.B. "aufnehmen -> validieren -> transformieren -> speichern")
3. Fuer jede Erkenntnis klassifizieren als:
   - **Essenziell**: Wuerde in jeder Implementierung existieren, die dieses Problem loest
   - **Akzidentell**: Spezifisch fuer die Technologieentscheidungen dieser Implementierung
4. Den **Assay-Bericht** produzieren: eine Tabelle von Domaenen, Verben, Rollen und Ablaeufen mit essenziell/akzidentell-Tags

**Erwartet:** Eine konzeptuelle Karte des Projekts, die sich wie ein Domaenenglossar liest, nicht wie ein Code-Walkthrough. Jemand, der den Tech-Stack nicht kennt, sollte aus diesem Bericht verstehen, was das Projekt tut.

**Bei Fehler:** Wenn die Codebasis undurchsichtig ist (starke Metaprogrammierung, generierter Code oder Verschleierung), sich auf Tests und Dokumentation stuetzen statt auf Quellcode. Wenn keine Tests existieren, Commit-Nachrichten fuer Absichten lesen.

### Schritt 3: Meditieren — Implementierungsverzerrung loslassen

Innehalten, um die kognitive Verankerung durch das Lesen von Code zu loesen.

1. Bemerken, welches Framework, welche Sprache oder welches Architekturmuster das mentale Modell dominiert — es benennen
2. Die Bindung an das WIE loslassen: "Dieses Projekt verwendet React" wird zu "Dieses Projekt hat eine Benutzeroberflaechen-Schicht." "Das verwendet PostgreSQL" wird zu "Das hat persistente strukturierte Speicherung."
3. Fuer jede Erkenntnis im Assay-Bericht den Erztest anwenden:
   - "Externe Datenquelle integrieren" — koennte ueberall existieren? JA -> Metall
   - "Axios-Interceptors konfigurieren" — koennte ueberall existieren? NEIN -> Gangart
4. Alle Erkenntnisse, die den Erztest nicht bestanden haben, auf einer hoeheren Abstraktionsebene umschreiben
5. Wenn mehrere Perspektiven helfen, das Projekt durch diese Linsen betrachten:
   - **Archaeologe**: Was offenbart die Codestruktur ueber die mentalen Modelle seiner Ersteller?
   - **Biologe**: Was ist das replizierbare Genom vs. der spezifische Phaenotyp?
   - **Musiktheoretiker**: Was ist die Form (Sonate, Rondo) vs. die spezifischen Noten?
   - **Kartograph**: Welche Abstraktionsebene erfasst die nuetzliche Topologie?

**Erwartet:** Der Assay-Bericht ist nun frei von framework-spezifischer Sprache. Jede Erkenntnis besteht den Erztest. Die Konzepte fuehlen sich portabel an — sie koennten auf ein Projekt in jeder Sprache oder jedem Framework zutreffen.

**Bei Fehler:** Wenn Verzerrung bestehen bleibt (Erkenntnisse referenzieren weiter spezifische Technologien), durch Umkehrung versuchen: "Wenn dieses Projekt in einem voellig anderen Stack umgeschrieben wuerde, welche Konzepte wuerden ueberleben?" Nur diese sind Metall.

### Schritt 4: Schmelzen — Metall von Schlacke trennen

Der zentrale Extraktionsschritt. Jedes essenzielle Konzept in Skills, Agents oder Teams klassifizieren.

1. Fuer jedes essenzielle Konzept aus dem gereinigten Assay-Bericht den Typ bestimmen:

```
Klassifikationskriterien:
+--------+----------------------------+----------------------------+----------------------------+
| Typ    | Wonach suchen              | Namenskonvention           | Testfrage                  |
+--------+----------------------------+----------------------------+----------------------------+
| SKILL  | Wiederholbare Prozeduren,  | Verb-zuerst Kebab-Case:    | "Koennte ein Agent dem als |
|        | Workflows, Transformationen| validate-input,            | schrittweise Prozedur      |
|        | mit klaren Ein-/Ausgaben   | deploy-artifact            | folgen?"                   |
+--------+----------------------------+----------------------------+----------------------------+
| AGENT  | Persistente Rollen,        | Substantiv/Rolle Kebab-    | "Erfordert das fortlauf-   |
|        | Domaenenexpertise,         | Case: data-engineer,       | enden Kontext, Expertise   |
|        | Urteilsentscheidungen,     | quality-reviewer           | oder einen spezifischen    |
|        | Kommunikationsstile        |                            | Kommunikationsstil?"       |
+--------+----------------------------+----------------------------+----------------------------+
| TEAM   | Mehrrollenkoordination,    | Gruppenbeschreiber:        | "Braucht das mehr als eine |
|        | Uebergaben, Reviews,       | pipeline-ops,              | distinkte Perspektive zur  |
|        | parallele Arbeitsstroeme   | review-board               | Durchfuehrung?"            |
+--------+----------------------------+----------------------------+----------------------------+
```

2. Fuer jedes extrahierte Element:
   - Einen **generalisierten Namen** zuweisen — nicht projektspezifisch. "UserAuthService" wird zu `identity-manager` (Agent). "deployToAWS()" wird zu `deploy-artifact` (Skill).
   - Eine **einzeilige Beschreibung** schreiben, die ohne Kenntnis des Quellprojekts Sinn ergibt
   - Das **Quellkonzept** notieren, von dem es abgeleitet ist (fuer Rueckverfolgbarkeit, nicht Reproduktion)
   - Den Erztest ein letztes Mal anwenden

3. Gegen haeufige Klassifikationsfehler absichern:
   - Nicht jede Funktion ist ein Skill — nach PROZEDUREN suchen, nicht nach einzelnen Operationen
   - Nicht jedes Modul ist ein Agent — nach ROLLEN suchen, die Urteil erfordern
   - Nicht jede Zusammenarbeit ist ein Team — nach KOORDINATIONSMUSTERN mit distinkten Spezialisierungen suchen
   - Die meisten Projekte ergeben 3-8 Skills, 2-4 Agents und 0-2 Teams. Bei 20+ wird zu fein extrahiert.

**Erwartet:** Ein klassifiziertes Inventar, bei dem jeder Eintrag einen Typ (Skill/Agent/Team), einen generalisierten Namen und eine einzeilige Beschreibung hat. Kein Eintrag referenziert die spezifischen Technologien, APIs oder Datenstrukturen des Quellprojekts.

**Bei Fehler:** Wenn die Klassifikation mehrdeutig ist (ist das ein Skill oder ein Agent?), fragen: "Geht es darum, etwas zu TUN (Skill) oder jemand zu SEIN, der Dinge tut (Agent)?" Ein Skill ist ein Rezept; ein Agent ist ein Koch. Wenn immer noch unklar, standardmaessig Skill waehlen — Skills lassen sich spaeter leichter komponieren.

### Schritt 5: Heilen — Extraktionsqualitaet verifizieren

Beurteilen, ob die Extraktion ehrlich ist — weder zu viel noch zu wenig.

1. **Ueberextraktionspruefung**: Jede extrahierte Definition lesen und fragen:
   - Koennte jemand die proprietaere Logik des Originalprojekts hieraus rekonstruieren? -> Zu viel Detail
   - Referenziert dies spezifische Bibliotheken, APIs, Datenbankschemata oder Dateipfade? -> Immer noch Gangart
   - Ist dies eine vollstaendige Implementierungsprozedur oder eine Konzeptskizze? -> Sollte Skizze sein

2. **Unterextraktionspruefung**: Nur die extrahierten Definitionen zeigen (ohne das Quellprojekt) und fragen:
   - Koennte jemand verstehen, welche ART von Projekt diese inspiriert hat? -> Sollte ja sein
   - Erfassen die Definitionen die essenzielle Natur des Projekts? -> Sollte ja sein
   - Gibt es wichtige Projektfaehigkeiten, die nicht repraesentiert sind? -> Sollte nein sein

3. **Generalisierungspruefung**: Fuer jede Definition:
   - Wuerde der Name in einem anderen Tech-Stack Sinn ergeben? -> Sollte ja sein
   - Ist die Beschreibung framework-agnostisch? -> Sollte ja sein
   - Koennte diese Definition fuer ein Projekt in einer voellig anderen Domaene nuetzlich sein? -> Idealerweise ja

4. **Bilanzpruefung**: Die Extraktionsverhaeltnisse ueberpruefen:
   - 3-8 Skills, 2-4 Agents, 0-2 Teams ist typisch fuer ein fokussiertes Projekt
   - Weniger als 3 Gesamt deutet auf Unterextraktion hin
   - Mehr als 15 Gesamt deutet auf Ueberextraktion oder unzureichende Generalisierung hin

**Erwartet:** Konfidenz, dass die Extraktion auf der richtigen Abstraktionsebene liegt. Jede Definition ist ein Samenkorn, das in anderem Boden wachsen koennte, kein Steckling, der nur im Originalgarten ueberlebt.

**Bei Fehler:** Bei Ueberextraktion die Abstraktionsebene erhoehen — spezifische Skills zu breiteren zusammenfuegen, aehnliche Agents zu einer einzelnen Rolle zusammenfassen. Bei Unterextraktion zu Schritt 2 zurueckkehren und zusaetzliche Dateien stichprobenartig untersuchen. Wenn die Generalisierungspruefung fehlschlaegt, Technologiereferenzen entfernen und Beschreibungen umschreiben.

### Schritt 6: Giessen — Das Metall in Formen giessen

Die agentskills.io-Standard-Ausgabedokumente produzieren.

1. Fuer jeden extrahierten **Skill** eine Skelettdefinition schreiben:

```yaml
# Skill: [generalisierter-name]
name: [generalisierter-name]
description: [einzeilig, framework-agnostisch]
domain: [naechste Domaene aus den 52 bestehenden, oder neue vorschlagen]
complexity: [basic/intermediate/advanced]
# Prozedur auf Konzeptebene (3-5 Schritte, KEINE volle Implementierung):
# Schritt 1: [uebergeordnete Aktion]
# Schritt 2: [uebergeordnete Aktion]
# Schritt 3: [uebergeordnete Aktion]
# Abgeleitet von: [Quellkonzept im Originalprojekt]
```

2. Fuer jeden extrahierten **Agent** eine Skelettdefinition schreiben:

```yaml
# Agent: [rollenname]
name: [rollenname]
description: [einzeiliger Zweck]
tools: [minimaler Werkzeugsatz]
skills: [Liste extrahierter Skills, die dieser Agent tragen wuerde]
# Abgeleitet von: [Quellrolle/-modul im Originalprojekt]
```

3. Fuer jedes extrahierte **Team** eine Skelettdefinition schreiben:

```yaml
# Team: [gruppenname]
name: [gruppenname]
description: [einzeiliger Zweck]
lead: [fuehrender Agent aus extrahierten Agents]
members: [Liste der Mitglieder-Agents]
coordination: [hub-and-spoke/sequential/parallel/adaptive]
# Abgeleitet von: [Quell-Workflow/-prozess im Originalprojekt]
```

4. Alle Extraktionen im **Assay-Bericht** zusammenstellen — ein einzelnes Dokument mit Abschnitten fuer Skills, Agents und Teams, plus einer Zusammenfassungstabelle

**Erwartet:** Ein strukturierter Bericht mit allen extrahierten Definitionen im agentskills.io-Format. Jede Definition ist skeletthaft (Konzeptebene, nicht Implementierungsebene) und koennte als Ausgangspunkt fuer die Skills `create-skill`, `create-agent` oder `create-team` zum Ausfuellen dienen.

**Bei Fehler:** Wenn die Ausgabe 15 Eintraege uebersteigt, nach Zentralitaet priorisieren — die Konzepte behalten, die am einzigartigsten fuer die Domaene dieses Projekts sind. Generische Konzepte (wie "manage-configuration"), die in den meisten Projekten existieren, sollten fallen gelassen werden, es sei denn, sie haben eine ungewoehnliche Wendung.

### Schritt 7: Haerten — Abschlussvalidierung

Die vollstaendige Extraktion verifizieren und die Zusammenfassung produzieren.

1. Die Extraktionen zaehlen: N Skills, N Agents, N Teams
2. Abdeckung beurteilen: Umspannen sie die wichtigsten Domaenen des Projekts?
3. Unabhaengigkeit verifizieren: Jede Definition OHNE den Quellprojektkontext lesen — steht sie fuer sich?
4. Den Erztest ein letztes Mal auf den vollstaendigen Satz anwenden:

```
Haertungsbewertung:
+-----+---------------------------+----------+------------------------------------+
| #   | Name                      | Typ      | Erztest-Ergebnis                   |
+-----+---------------------------+----------+------------------------------------+
| 1   | [Name]                    | skill    | BESTANDEN / DURCHGEFALLEN (Grund)  |
| 2   | [Name]                    | agent    | BESTANDEN / DURCHGEFALLEN (Grund)  |
| ... | ...                       | ...      | ...                                |
+-----+---------------------------+----------+------------------------------------+
```

5. Die abschliessende Zusammenfassung produzieren:
   - Gesamt-Extraktionen (Skills / Agents / Teams)
   - Abdeckungsbewertung (welche Projektdomaenen sind repraesentiert)
   - Konfidenzniveau (hoch / mittel / niedrig) mit Begruendung
   - Vorgeschlagene naechste Schritte: welche extrahierten Definitionen sind bereit, zuerst ausgearbeitet zu werden

**Erwartet:** Ein validierter Assay-Bericht mit einer Zusammenfassungstabelle, Konfidenzbewertung und umsetzbaren naechsten Schritten. Der Bericht ist in sich geschlossen — jemand, der das Quellprojekt nie gesehen hat, kann ihn lesen und die extrahierten Konzepte verstehen.

**Bei Fehler:** Wenn mehr als 20% der Eintraege den abschliessenden Erztest nicht bestehen, zu Schritt 4 (Schmelzen) zurueckkehren und auf einer hoeheren Abstraktionsebene neu extrahieren. Wenn die Abdeckung unter 60% der identifizierten Domaenen liegt, zu Schritt 2 (Assay) zurueckkehren und zusaetzliche Dateien stichprobenartig untersuchen.

## Validierung

- [ ] Prospektionsbericht deckt Projektstruktur, Sprachen, Groesse und deklarierten Zweck ab
- [ ] Assay identifiziert Domaenen, Verben, Rollen und Ablaeufe mit essenziell/akzidentell-Klassifikation
- [ ] Meditationspruefpunkt klaert Implementierungsverzerrung — keine framework-spezifische Sprache in Ausgaben
- [ ] Jedes extrahierte Element besteht den Erztest (Essenz, nicht Implementierungsdetail)
- [ ] Skills sind mit Verben benannt, Agents mit Substantiven, Teams mit Gruppenbeschreibern
- [ ] Alle Namen sind generalisiert — keine projektspezifischen Referenzen
- [ ] Extraktionszahl liegt im typischen Bereich (5-15 gesamt, nicht 1 und nicht 30)
- [ ] Ausgabedefinitionen folgen dem agentskills.io-Format (Frontmatter + Abschnitte)
- [ ] Ueberextraktions- und Unterextraktionspruefungen bestehen beide
- [ ] Abschliessende Haertungsbewertung beinhaltet Anzahl, Abdeckung, Konfidenz und naechste Schritte
- [ ] Der vollstaendige Assay-Bericht ist ohne Zugang zum Quellprojekt verstaendlich

## Haeufige Stolperfallen

- **Die Verzeichnisstruktur spiegeln**: Einen Skill pro Quelldatei produzieren statt querschneidende Konzepte zu extrahieren. Das Metall sollte die KONZEPTUELLE Struktur des Projekts widerspiegeln, nicht sein Dateisystem. Ein 20-Dateien-Projekt hat nicht 20 Skills.
- **Framework-Anbetung**: "configure-nextjs-api-routes" extrahieren statt "define-api-endpoints". Das Framework abstreifen; das Muster behalten. Der Erztest erfasst das: "Koennte das ohne Next.js existieren?" Wenn nein, ist es Gangart.
- **Rolleninflation**: Einen Agent fuer jedes Modul erstellen. Die meisten Projekte haben 2-5 echte Rollen, die distinkte Expertise erfordern, nicht 20. Nach URTEILS- und KOMMUNIKATIONSSTIL-Unterschieden suchen, nicht nur nach funktionalen Unterschieden.
- **Den Erztest ueberspringen**: Der groesste einzelne Fehlermodus. Jede Ausgabe muss bestehen: "Koennte dieses Konzept in einer voellig anderen Implementierung existieren?" Wenn es spezifische Bibliotheken, APIs oder Datenschemata referenziert, ist es Schlacke, nicht Metall.
- **Implementierungsanleitungen produzieren**: Extrahierte Skills sollten KONZEPTEBENE-Skizzen sein (3-5 uebergeordnete Schritte), keine vollstaendigen Implementierungsprozeduren. Sie sind Samenkerne, die mit `create-skill` ausgearbeitet werden, keine fertigen Produkte. Eine 50-Schritte-Extraktion ist eine Reproduktion, keine Essenz.
- **Namen untergeneralisieren**: "UserAuthService" ist ein Klassenname, kein Konzept. "identity-manager" ist eine Rolle. "manage-user-identity" ist ein Skill. Vom Spezifischen zum Universellen generalisieren.
- **Koordinationsmuster ignorieren**: Teams sind am schwersten zu extrahieren, weil Koordination oft implizit ist. Nach Code-Review-Workflows, Deployment-Pipelines, Datenuebergaben zwischen Systemen und Genehmigungsketten suchen — diese offenbaren Teamstrukturen.

## Verwandte Skills

- `athanor` — wenn Metall offenbart, dass das Projekt Transformation braucht, nicht nur Essenzextraktion
- `chrysopoeia` — Wertextraktion auf Code-Ebene; Metall arbeitet auf der konzeptuellen Ebene ueber Code
- `transmute` — extrahierte Konzepte zwischen Domaenen oder Paradigmen konvertieren
- `create-skill` — extrahierte Skill-Skizzen zu vollstaendigen SKILL.md-Implementierungen ausarbeiten
- `create-agent` — extrahierte Agent-Skizzen zu vollstaendigen Agent-Definitionen ausarbeiten
- `create-team` — extrahierte Team-Skizzen zu vollstaendigen Team-Kompositionen ausarbeiten
- `observe` — tiefere Beobachtung, wenn die Prospektionsphase eine unbekannte Domaene offenbart
- `analyze-codebase-for-mcp` — komplementaer: Metall extrahiert Konzepte, analyze-codebase-for-mcp extrahiert Werkzeugoberflaechen
- `review-codebase` — komplementaer: Metall extrahiert Essenz, review-codebase bewertet Qualitaet
