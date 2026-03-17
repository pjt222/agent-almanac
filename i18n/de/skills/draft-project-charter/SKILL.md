---
name: draft-project-charter
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Einen Projektauftrag erstellen der Umfang, Stakeholder, Erfolgskriterien
  und ein erstes Risikoregister definiert. Behandelt Problemdarstellung,
  RACI-Matrix, Meilensteinplanung und Umfangsgrenzen fuer agile und
  klassische Methoden. Anwenden beim Start eines neuen Projekts oder einer
  Initiative, bei der Formalisierung des Umfangs nach einem informellen
  Beginn, bei der Abstimmung der Stakeholder vor Beginn der Detailplanung
  oder beim Uebergang von der Erkundung zur aktiven Projektarbeit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, charter, scope, stakeholders, raci, risk-register
---

# Projektauftrag erstellen

Erstellt einen strukturierten Projektauftrag der Projektgrenzen, Stakeholder-Vereinbarungen und Erfolgskriterien festlegt bevor die Detailplanung beginnt. Erzeugt ein umfassendes Dokument zu Umfang, RACI-Zuweisungen, Meilensteinplanung und einem anfaenglichen Risikoregister das fuer agile, klassische oder hybride Projektmethoden geeignet ist.

## Wann verwenden

- Start eines neuen Projekts oder einer Initiative
- Formalisierung des Umfangs nach einem informellen Projektbeginn
- Abstimmung der Stakeholder vor Beginn der Detailplanung
- Erstellung eines Referenzdokuments fuer Umfangsentscheidungen waehrend der Ausfuehrung
- Uebergang von Erkundung/Ideenfindung zu aktiver Projektarbeit

## Eingaben

- **Erforderlich**: Projektname und Kurzbeschreibung
- **Erforderlich**: Primaerer Stakeholder oder Sponsor
- **Optional**: Vorhandene Dokumentation (Vorschlaege, Briefings, E-Mails)
- **Optional**: Bekannte Einschraenkungen (Budget, Termin, Teamgroesse)
- **Optional**: Methodenvorliebe (agil, klassisch, hybrid)

## Vorgehensweise

### Schritt 1: Projektkontext sammeln und Auftragsvorlage erstellen

Vorhandene Dokumentation (Vorschlaege, E-Mails, Briefings) lesen um den Projekthintergrund zu verstehen. Das Kernproblem oder die Kernchance identifizieren die das Projekt adressiert. Die Auftragsdatei mit einer strukturierten Vorlage erstellen die in den nachfolgenden Schritten bevoelkert wird.

Eine Datei namens `PROJECT-CHARTER-[PROJECT-NAME].md` mit dieser Vorlage erstellen:

```markdown
# Projektauftrag: [Projektname]
## Dokument-ID: PA-[PROJEKT]-[JJJJ]-[NNN]

### 1. Problemdarstellung
[2-3 Saetze die das Problem oder die Chance beschreiben die dieses Projekt adressiert]

### 2. Projektzweck
[Was das Projekt erreichen wird und warum es wichtig ist]

### 3. Umfang
#### Im Umfang
- [Liefergegenstand 1]
- [Liefergegenstand 2]

#### Ausserhalb des Umfangs
- [Ausschluss 1]
- [Ausschluss 2]

### 4. Liefergegenstaende
| # | Liefergegenstand | Abnahmekriterien | Zieldatum |
|---|------------------|------------------|-----------|
| 1 | | | |

### 5. Stakeholder & RACI
| Stakeholder | Rolle | L1 | L2 | L3 |
|-------------|-------|----|----|----|
| | | | | |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

### 6. Erfolgskriterien
| # | Kriterium | Messung | Zielwert |
|---|-----------|---------|----------|
| 1 | | | |

### 7. Meilensteine
| Meilenstein | Zieldatum | Abhaengigkeiten |
|-------------|-----------|-----------------|
| | | |

### 8. Risikoregister
| ID | Risiko | Wahrscheinlichkeit | Auswirkung | Schwere | Massnahme | Verantwortlich |
|----|--------|---------------------|------------|---------|-----------|----------------|
| R1 | | | | | | |

*Wahrscheinlichkeit/Auswirkung: Niedrig, Mittel, Hoch*
*Schwere = Wahrscheinlichkeit x Auswirkung*

### 9. Annahmen und Einschraenkungen
#### Annahmen
- [Schluesselannahme 1]

#### Einschraenkungen
- [Schluesseleinschraenkung 1]

### 10. Freigabe
| Rolle | Name | Datum |
|-------|------|-------|
| Sponsor | | |
| Projektleiter | | |
```

Die Dokument-ID im Format PA-[PROJEKT]-[JJJJ]-[NNN] eintragen (z.B. PA-WEBSITE-2026-001). Eine Problemdarstellung (2-3 Saetze) verfassen die die aktuelle Situation, die Luecke und die Auswirkung beschreibt. Einen Projektzweck (1 Absatz) formulieren der erklaert was erreicht werden soll.

**Erwartet:** Auftragsdatei erstellt mit Dokument-ID, Problemdarstellung und Zweck. Die Problemdarstellung ist spezifisch und beschreibt eine messbare Luecke.

**Bei Fehler:** Wenn der Projektkontext unklar ist, spezifische Fragen an den Sponsor in einem FRAGEN-Abschnitt oben im Auftrag dokumentieren. Wenn vorhandene Dokumente sich widersprechen, Widersprueche in einem OFFENE PUNKTE-Abschnitt vermerken und zur Stakeholder-Klaerung kennzeichnen.

### Schritt 2: Umfangsgrenzen definieren

Explizite Listen erstellen was im Projektumfang enthalten ist und was nicht. 3-5 Liefergegenstaende im Umfang mit spezifischen Abnahmekriterien fuer jeden formulieren. 3-5 Punkte ausserhalb des Umfangs formulieren um Umfangserweiterung zu verhindern. Die Liefergegenstandstabelle mit jedem Liefergegenstand, seinen Abnahmekriterien und einem Zieldatum bevoelkern.

**Erwartet:** Umfangsabschnitt hat ausgewogene Listen fuer innerhalb und ausserhalb des Umfangs. Liefergegenstandstabelle enthaelt 3-5 Eintraege mit spezifischen, pruefbaren Abnahmekriterien. Zieldaten sind realistisch und logisch sequenziert.

**Bei Fehler:** Wenn Liefergegenstaende vage sind, jeden in Teilliefergegenstaende mit konkreten Ergebnissen aufgliedern. Wenn Abnahmekriterien fehlen, fragen: "Wie wuerden wir nachweisen dass dieser Liefergegenstand vollstaendig ist?" Wenn Zieldaten nicht verfuegbar sind, als offen markieren und fuer eine Meilensteinplanungssitzung kennzeichnen.

### Schritt 3: Stakeholder identifizieren und RACI zuweisen

Alle Personen oder Gruppen auflisten die vom Projekt betroffen sein werden, dazu beitragen oder Entscheidungsbefugnis darueber haben. Deren organisatorische Rolle angeben. Eine RACI-Matrix erstellen die jeden Stakeholder jedem Liefergegenstand zuordnet unter Verwendung von:
- **R** (Responsible): Fuehrt die Arbeit aus
- **A** (Accountable): Endgueltige Entscheidungsbefugnis (nur ein A pro Liefergegenstand)
- **C** (Consulted): Gibt vor Entscheidungen Input
- **I** (Informed): Wird ueber den Fortschritt auf dem Laufenden gehalten

Sicherstellen dass jeder Liefergegenstand genau ein A und mindestens ein R hat.

**Erwartet:** Stakeholder-Tabelle listet 5-10 Personen mit ihren Rollen. RACI-Matrix hat ein A pro Liefergegenstandsspalte. Kein Liefergegenstand hat kein R oder mehrere As. Der Sponsor ist A fuer die endgueltige Freigabe.

**Bei Fehler:** Wenn die Stakeholder-Liste unvollstaendig ist, mit Organigramm und Teilnehmerlisten aus der Erkundungsphase abgleichen. Wenn mehrere As identifiziert werden, den Konflikt an den Sponsor zur Klaerung der Entscheidungsbefugnis eskalieren. Wenn kein R existiert, den Liefergegenstand als nicht zugewiesen kennzeichnen mit Bedarf an Ressourcenzuweisung.

### Schritt 4: Erfolgskriterien und Meilensteine definieren

3-5 messbare Erfolgskriterien im SMART-Format formulieren (Spezifisch, Messbar, Erreichbar, Relevant, Terminiert). Jedes Kriterium sollte an einen quantifizierbaren Messwert und Zielwert gebunden sein. 4-6 Schluessel-Meilensteine definieren die grosse Projektphasen oder Liefergegenstandsabschluesse darstellen, mit Zieldaten und Abhaengigkeiten von vorherigen Meilensteinen.

**Erwartet:** Erfolgskriterientabelle hat 3-5 Eintraege mit spezifischen Messwerten (z.B. "Systemverfuegbarkeit" gemessen als "% Verfuegbarkeit" mit Zielwert "99,5%"). Meilensteintabelle zeigt logische Projektphasen mit realistischen Zieldaten. Abhaengigkeiten sind klar vermerkt.

**Bei Fehler:** Wenn Erfolgskriterien vage sind (z.B. "Qualitaet verbessern"), als messbare Ergebnisse mit Basis- und Zielwerten umformulieren. Wenn Meilensteindaten unrealistisch sind, vom Endtermin rueckwaerts arbeiten mit geschaetzten Dauern und Puffern. Wenn Abhaengigkeiten zirkulaere Logik erzeugen, die Meilensteinreihenfolge umstrukturieren oder widerspruechliche Meilensteine aufteilen.

### Schritt 5: Erstes Risikoregister erstellen

5-10 Risiken identifizieren die den Projekterfolg beeintraechtigen koennten. Fuer jedes Risiko Wahrscheinlichkeit (Niedrig/Mittel/Hoch) und Auswirkung (Niedrig/Mittel/Hoch) bewerten, dann die Schwere berechnen. Eine spezifische Gegenmassnahme fuer jedes Risiko definieren und einen Risikoverantwortlichen fuer Ueberwachung und Reaktion zuweisen. Mindestens ein Risiko in jeder Kategorie einbeziehen: Umfang, Zeitplan, Ressourcen, Technik und Extern.

**Erwartet:** Risikoregister hat 5-10 Eintraege die Umfang-, Zeitplan-, Ressourcen-, Technik- und Externrisiken abdecken. Jedes Risiko hat bewertete Wahrscheinlichkeit, Auswirkung und Schwere. Gegenmassnahmen sind umsetzbar und spezifisch. Jedes Risiko hat einen zugewiesenen Verantwortlichen.

**Bei Fehler:** Wenn die Risikoliste unvollstaendig ist, Umfangsgrenzen, Abhaengigkeiten, Stakeholder-Liste und Annahmen auf moegliche Fehlerpunkte ueberpruefen. Wenn Gegenmassnahmen generisch sind ("genau beobachten"), konkretisieren: Was wird ueberwacht? Wie oft? Was loest Handeln aus? Wenn niemand die Risikoverantwortung uebernimmt, voruebergehend dem Projektleiter zuweisen und an den Sponsor eskalieren.

## Validierung

- [ ] Auftragsdatei mit Dokument-ID erstellt
- [ ] Problemdarstellung ist spezifisch und messbar
- [ ] Umfang hat sowohl Punkte innerhalb als auch ausserhalb des Umfangs
- [ ] RACI-Matrix deckt alle Liefergegenstaende ab
- [ ] Erfolgskriterien sind messbar (SMART)
- [ ] Mindestens 5 Risiken mit Gegenmassnahmen identifiziert
- [ ] Meilensteine haben Zieldaten
- [ ] Freigabeabschnitt enthalten

## Haeufige Stolperfallen

- **Umfang ohne Grenzen**: Punkte im Umfang auflisten ohne explizite Punkte ausserhalb des Umfangs fuehrt zu Umfangserweiterung. Immer definieren was man nicht tun wird.
- **Vage Erfolgskriterien**: "Performance verbessern" ist nicht messbar. Jedes Kriterium an eine Zahl mit Basis- und Zielwert binden.
- **Fehlende Stakeholder**: Uebersehene Stakeholder tauchen spaet auf und bringen das Projekt aus der Bahn. Organigramme und fruehere Projektkommunikation gegenpruefen.
- **Risikoregister als Pflichtpunkt**: Risiken auflisten ohne umsetzbare Gegenmassnahmenplaene vermittelt falsches Vertrauen. Jedes Risiko braucht eine spezifische Reaktionsstrategie.
- **Ueberdetaillierter Auftrag**: Der Auftrag ist ein Kompass, keine Karte. Auf 2-4 Seiten halten. Detailplanung erfolgt spaeter.

## Verwandte Skills

- `create-work-breakdown-structure` -- Auftragsliefergegenstaende in Arbeitspakete zerlegen
- `manage-backlog` -- Auftragsumfang in ein priorisiertes Backlog uebersetzen
- `plan-sprint` -- Den ersten Sprint aus Auftragsliefergegenstaenden planen
- `generate-status-report` -- Fortschritt gegen Auftragsmeilensteine berichten
- `conduct-retrospective` -- Auftragsannahmen nach der Ausfuehrung ueberpruefen
