---
name: escalate-issues
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Wartungsprobleme nach Schweregrad triagieren, Befunde mit Kontext
  dokumentieren, an geeigneten Spezialisten-Agenten oder Menschen weiterleiten
  und umsetzbare Fehlerberichte erstellen. Anwenden wenn eine Wartungsaufgabe
  auf Probleme stoesst die ueber automatisierte Bereinigung hinausgehen:
  Code der unsicher zu loeschen ist, Konfigurationsaenderungen die
  Domaenenwissen erfordern, waehrend der Bereinigung erkannte brechende
  Aenderungen, komplexes Refactoring oder sicherheitsrelevante Befunde
  wie hartcodierte Geheimnisse oder Schwachstellen.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: basic
  language: multi
  tags: maintenance, triage, escalation, routing, issue-reporting
---

# Probleme eskalieren

## Wann verwenden

Diesen Skill verwenden wenn eine Wartungsaufgabe auf Probleme stoesst die ueber automatisierte Bereinigung hinausgehen:

- Unsicher ob Code sicher geloescht werden kann
- Konfigurationsaenderungen erfordern Domaenenwissen (Sicherheit, Performance, Architektur)
- Waehrend der Bereinigung erkannte brechende Aenderungen
- Komplexes Refactoring erforderlich (nicht nur Bereinigung)
- Sicherheitsrelevante Befunde (hartcodierte Geheimnisse, Schwachstellen)

**NICHT verwenden** fuer einfache Probleme mit klaren Loesungen. Nur eskalieren wenn automatisierte Bereinigung riskant oder unzureichend ist.

## Eingaben

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|-------------|
| `issue_description` | string | Ja | Klare Beschreibung des Problems |
| `severity` | enum | Ja | `critical`, `high`, `medium`, `low` |
| `context_files` | array | Nein | Pfade zu relevanten Dateien |
| `specialist` | string | Nein | Zielagent (automatisches Routing wenn nicht angegeben) |
| `blocking` | boolean | Nein | Ob das Problem weitere Bereinigung blockiert (Standard: false) |

## Vorgehensweise

### Schritt 1: Schweregrad bewerten

Das Problem mit Standard-Schweregradstufen klassifizieren.

**KRITISCH** — Blockiert Produktionsfunktionalitaet:
- Defekte Imports in aktiv genutztem Code
- Sicherheitsschwachstellen (offengelegte Geheimnisse, SQL-Injection)
- Datenverlustrisiko durch Bereinigungsoperation
- Produktionsdienstausfaelle

**HOCH** — Beeintraechtigt Wartbarkeit oder Entwicklerproduktivitaet:
- Erheblicher toter Code (>1000 Zeilen)
- Defekte CI/CD-Pipelines
- Grosse Konfigurationsdrift zwischen Umgebungen
- Unreferenzierte Module die moeglicherweise dynamisch geladen werden

**MITTEL** — Geringfuegige Hygieneprobleme:
- Ungenutzte Hilfsfunktionen (<100 Zeilen)
- Veraltete Dokumentation die Aktualisierung erfordert
- Veraltete Konfigurationsdateien (nicht mehr verwendet aber vorhanden)
- Lint-Warnungen in unkritischen Pfaden

**NIEDRIG** — Stilinkonsistenzen:
- Gemischte Einrueckung (funktioniert aber inkonsistent)
- Nachfolgende Leerzeichen
- Inkonsistente Benennung (camelCase vs snake_case)
- Geringfuegige Formatierungsunterschiede

**Schweregrad-Entscheidungsbaum**:
```
Bricht es die Produktion? -> KRITISCH
Blockiert es die Entwicklung? -> HOCH
Beeintraechtigt es die Codequalitaet? -> MITTEL
Ist es rein kosmetisch? -> NIEDRIG
```

**Erwartet:** Problem mit klarem Schweregrad-Label klassifiziert

**Bei Fehler:** Wenn unsicher, Standard HOCH waehlen und zur Neueinschaetzung an einen Menschen eskalieren

### Schritt 2: Befund dokumentieren

Allen relevanten Kontext fuer den Spezialisten zur Pruefung erfassen.

**Fehlerbericht-Vorlage**:
```markdown
# Problem: [Kurzer Titel]

**Schweregrad**: KRITISCH | HOCH | MITTEL | NIEDRIG
**Entdeckt waehrend**: [Skill-Name, z.B. clean-codebase]
**Datum**: JJJJ-MM-TT
**Blockierend**: Ja | Nein

## Beschreibung

Klare Beschreibung des Problems in 2-3 Saetzen.

## Kontext

- **Datei(en)**: [Liste betroffener Dateien mit Zeilennummern]
- **Verwandt**: [Verwandte Issues, Commits oder fruehere Loesungsversuche]
- **Auswirkung**: [Was bricht wenn nicht behoben, oder was wird verschwendet wenn nicht bereinigt]

## Beweismaterial

```sprache
# Code-Ausschnitt oder Log-Auszug der das Problem zeigt
```

## Versuchte Loesungen

- X versucht aber gescheitert wegen Y
- Z in Betracht gezogen aber unsicher wegen W

## Empfehlung

- **Option 1**: [Sicherer konservativer Ansatz]
- **Option 2**: [Aggressivere Loesung mit Risiken]
- **Bevorzugt**: [Welche Option und warum]

## Spezialisten-Routing

**Vorgeschlagener Agent**: [Agentname]
**Begruendung**: [Warum dieser Spezialist geeignet ist]

## Referenzen

- [Link zu verwandter Dokumentation]
- [Link zu aehnlichen frueheren Problemen]
```

**Erwartet:** Problem mit vollstaendigem Kontext in `ESCALATION_REPORTS/issue_JJJJMMTT_HHMM.md` dokumentiert

**Bei Fehler:** (Entfaellt — immer dokumentieren, auch wenn unvollstaendig)

### Schritt 3: Routing bestimmen

Problemtyp dem geeigneten Spezialisten-Agenten oder menschlichen Pruefer zuordnen.

**Routing-Tabelle**:

| Problemtyp | Spezialist | Begruendung |
|------------|-----------|---------|
| Sicherheitsschwachstelle | security-analyst | Sicherheitsexpertise erforderlich |
| GxP-Compliance-Bedenken | gxp-validator | Regulatorisches Wissen noetig |
| Architekturentscheidung | senior-software-developer | Designmuster-Expertise |
| Konfigurationsmanagement | devops-engineer | Infrastrukturwissen |
| Abhaengigkeitskonflikte | devops-engineer | Paketmanagement-Expertise |
| Performance-Engpass | senior-data-scientist | Optimierungswissen |
| Code-Stil-Streit | code-reviewer | Stilrichtlinien-Autoritaet |
| Unsicherheit bei totem Code | r-developer (o. sprachspez.) | Sprachspezifisches Wissen |
| Unklarer defekter Test | code-reviewer | Testdesign-Expertise |
| Dokumentationsgenauigkeit | senior-researcher | Domaenenwissen erforderlich |
| Lizenzkompatibilitaet | auditor | Rechts-/Compliance-Expertise |

**Automatische Routing-Logik**:
```python
def route_issue(severity, issue_type):
    if severity == "CRITICAL":
        # Kritische Probleme immer an Menschen eskalieren
        return "human"

    if "security" in issue_type or "secret" in issue_type:
        return "security-analyst"

    if "gxp" in issue_type or "compliance" in issue_type:
        return "gxp-validator"

    if "architecture" in issue_type or "design" in issue_type:
        return "senior-software-developer"

    if "config" in issue_type or "deployment" in issue_type:
        return "devops-engineer"

    # Standard: code-reviewer fuer allgemeine Code-Probleme
    return "code-reviewer"
```

**Erwartet:** Problem mit Begruendung an geeigneten Spezialisten geroutet

**Bei Fehler:** Wenn kein klarer Spezialist, an Menschen fuer manuelles Routing eskalieren

### Schritt 4: Umsetzbaren Fehlerbericht erstellen

Einen formatierten Bericht erstellen der fuer die Zielgruppe geeignet ist (Agent oder Mensch).

**Fuer Spezialisten-Agenten** (strukturiertes Format fuer MCP-Tools):
```yaml
---
type: escalation
severity: high
from_agent: janitor
to_agent: security-analyst
blocking: false
---

# Sicherheitsbedenken: Hartcodierter API-Schluessel in Konfiguration

**Datei**: config/production.yml:45
**Muster**: API_KEY="sk_live_abc123..."

**Anfrage**: Bitte pruefen ob dies ein gueltiges Geheimnis oder ein
Platzhalter ist. Wenn gueltig, sichere Credential-Management-Strategie
empfehlen.

**Kontext**: Waehrend Konfigurations-Bereinigungsdurchlauf entdeckt.
```

**Fuer menschliche Pruefer** (ausfuehrliches Markdown):
```markdown
# Eskalierungsbericht: Unsichere Loeschung toten Codes

**Von**: Janitor-Agent
**Datum**: 2026-02-16
**Schweregrad**: HOCH

## Problem

Datei `src/legacy_payments.js` (450 Zeilen) erscheint ungenutzt, enthaelt
aber komplexe Zahlungsverarbeitungslogik. Statische Analyse zeigt null
Referenzen, aber der Name deutet auf geschaeftskritische Funktionalitaet.

## Grund der Eskalierung

- Unsicher ob Zahlungscode zur Laufzeit dynamisch geladen wird
- Potenzielles Datenverlustrisiko bei falscher Loeschung
- Erfordert Domaenenwissen um geschaeftliche Auswirkung zu bewerten

## Beweismaterial

- Keine direkten Imports gefunden
- Letzte Aenderung vor 8 Monaten
- Git-Historie zeigt Zugehoerigkeit zum Zahlungs-Refactoring

## Empfehlung

Menschliche Pruefung vor Loeschung anfordern. Wenn als tot bestaetigt:
1. Nach archive/legacy/ archivieren
2. In ARCHIVE_LOG.md dokumentieren
3. Ticket erstellen um Zahlungsablaeufe zu verifizieren

## Naechste Schritte

Warte auf menschliche Bestaetigung vor Fortsetzung der Bereinigung.
```

**Erwartet:** Bericht fuer die Zielgruppe angemessen formatiert

**Bei Fehler:** (Entfaellt — Bericht im generischen Markdown generieren wenn unsicher)

### Schritt 5: Eskalierungsstatus verfolgen

Ein Protokoll aller Eskalierungen fuehren um doppelte Berichte zu vermeiden.

```markdown
# Eskalierungsprotokoll

| ID | Datum | Schweregrad | Problem | Spezialist | Status |
|----|-------|-------------|---------|-----------|--------|
| ESC-001 | 2026-02-16 | KRITISCH | Defekter Prod-Import | Mensch | Geloest |
| ESC-002 | 2026-02-16 | HOCH | Toter Zahlungscode | Mensch | Ausstehend |
| ESC-003 | 2026-02-16 | MITTEL | Konfigurationsdrift | devops-engineer | In Arbeit |
```

**Erwartet:** `ESCALATION_LOG.md` mit neuem Eintrag aktualisiert

**Bei Fehler:** Wenn das Protokoll nicht existiert, erstellen

### Schritt 6: Benachrichtigen und blockieren (falls erforderlich)

Wenn das Problem weitere Wartung blockiert, benachrichtigen und Bereinigung pausieren.

**Blockierungslogik**:
- KRITISCHE Probleme blockieren immer
- HOHE Probleme blockieren wenn im kritischen Pfad
- MITTLERE/NIEDRIGE Probleme blockieren nicht

**Benachrichtigung**:
```markdown
WARTUNG BLOCKIERT

Problem ESC-002 (HOHER Schweregrad) erfordert menschliche Pruefung
vor Fortsetzung.

**Betroffene Operation**: clean-codebase (Schritt 5: Toten Code entfernen)
**Grund**: Unsicher ob src/legacy_payments.js wirklich tot ist

**Erforderliche Aktion**: ESCALATION_REPORTS/ESC-002_2026-02-16.md pruefen

Nach Loesung Wartung ab Schritt 5 erneut ausfuehren.
```

**Erwartet:** Wartung pausiert; klare Benachrichtigung generiert

**Bei Fehler:** Wenn der Benachrichtigungsmechanismus nicht verfuegbar ist, im Bericht dokumentieren

## Validierung

Nach der Eskalierung:

- [ ] Schweregrad des Problems korrekt bewertet
- [ ] Vollstaendiger Kontext dokumentiert (Dateien, Beweise, Versuche)
- [ ] Geeigneter Spezialist identifiziert
- [ ] Eskalierungsbericht in ESCALATION_REPORTS/ erstellt
- [ ] ESCALATION_LOG.md aktualisiert
- [ ] Blockierungsstatus kommuniziert falls zutreffend
- [ ] Keine sensiblen Informationen im Bericht offengelegt

## Haeufige Stolperfallen

1. **Uebereskalierung**: Einfache Probleme eskalieren verschwendet Spezialisten-Zeit. Nur eskalieren wenn wirklich unsicher oder riskant.

2. **Untereskalierung**: Code loeschen "um zu sehen ob die Tests bestehen" ohne Eskalierung kann Produktionsausfaelle verursachen.

3. **Unzureichender Kontext**: Ohne Beweise eskalieren zwingt Spezialisten zur erneuten Untersuchung. Dateipfade, Zeilennummern, Fehlermeldungen beifuegen.

4. **Vage Beschreibungen**: "Irgendwas stimmt nicht mit der Config" ist nicht umsetzbar. Spezifisch sein: "Konfigurationsdrift: Dev nutzt API v1, Prod nutzt v2".

5. **Status nicht verfolgen**: Bereits gepruefte Probleme erneut eskalieren. Zuerst ESCALATION_LOG.md pruefen.

6. **Geheimnisse offenlegen**: Tatsaechliche API-Schluessel oder Passwoerter in Eskalierungsberichte aufnehmen. Sensible Werte schwaerzen.

## Verwandte Skills

- `clean-codebase` — Loest haeufig Eskalierungen aus wenn Unsicherheit besteht
- `tidy-project-structure` — Kann komplexe organisatorische Probleme aufdecken
- `repair-broken-references` — Eskalieren wenn unklar ob Referenz behoben oder entfernt werden soll
