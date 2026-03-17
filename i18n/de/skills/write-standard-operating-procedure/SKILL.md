---
name: write-standard-operating-procedure
description: >
  GxP-konforme Standardarbeitsanweisung (SOP) erstellen. Umfasst regulatorische
  SOP-Vorlagenstruktur (Zweck, Umfang, Definitionen, Verantwortlichkeiten,
  Verfahren, Referenzen, Revisionshistorie), Gestaltung des Genehmigungsworkflows,
  Planung regelmaessiger Ueberpruefungen und Betriebsverfahren fuer die
  Systemnutzung. Anzuwenden wenn ein neues validiertes System Betriebsverfahren
  benoetigt, wenn informelle Verfahren formalisiert werden muessen, wenn ein
  Auditbefund fehlende Verfahren zitiert, wenn eine Aenderungskontrolle
  SOP-Aktualisierungen ausloest oder wenn eine regelmaessige Ueberpruefung
  veralteten Verfahrensinhalt identifiziert.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, sop, procedure, documentation, compliance, quality-management
---

# Standardarbeitsanweisung erstellen

Eine GxP-konforme Standardarbeitsanweisung erstellen, die klare, pruefbare Anweisungen fuer regulierte Aktivitaeten bereitstellt.

## Wann verwenden

- Ein neues validiertes System benoetigt Betriebsverfahren
- Bestehende Verfahren muessen in SOP-Format formalisiert werden
- Ein Auditbefund zitiert fehlende oder unzureichende Verfahren
- Eine Aenderungskontrolle loest SOP-Aktualisierungen aus
- Eine regelmaessige Ueberpruefung identifiziert veralteten Verfahrensinhalt

## Eingaben

- **Erforderlich**: Prozess oder System, den/das die SOP abdeckt
- **Erforderlich**: Regulatorischer Kontext (GMP, GLP, GCP, 21 CFR Part 11, EU Annex 11)
- **Erforderlich**: Zielgruppe (Rollen, die diese SOP befolgen werden)
- **Optional**: Vorhandene informelle Verfahren, Arbeitsanweisungen oder Schulungsmaterialien
- **Optional**: Verwandte SOPs, die mit diesem Verfahren schnittstellen
- **Optional**: Auditbefunde oder regulatorische Beobachtungen, die die SOP-Erstellung vorantreiben

## Vorgehensweise

### Schritt 1: Dokumentenkontrollmetadaten zuweisen

```markdown
# Standard Operating Procedure
## Document ID: SOP-[DEPT]-[NNN]
## Title: [Descriptive Title of the Procedure]

| Field | Value |
|-------|-------|
| Document ID | SOP-[DEPT]-[NNN] |
| Version | 1.0 |
| Effective Date | [YYYY-MM-DD] |
| Review Date | [YYYY-MM-DD + review period] |
| Department | [Department name] |
| Author | [Name, Title] |
| Reviewer | [Name, Title] |
| Approver | [Name, Title] |
| Classification | [GxP-Critical / GxP-Supporting] |
| Supersedes | [Previous SOP ID or "N/A — New"] |
```

**Erwartet:** Jede SOP hat eine eindeutige ID gemaess der Dokumentnummerierungskonvention der Organisation.
**Bei Fehler:** Existiert keine Nummerierungskonvention, eine festlegen, bevor weitergemacht wird: [TYP]-[ABTEIL]-[3-stellig sequenziell].

### Schritt 2: Zweck und Umfang formulieren

```markdown
### 1. Purpose
This SOP defines the procedure for [specific activity] to ensure [regulatory objective].

### 2. Scope
**In scope:**
- [System, process, or activity covered]
- [Applicable departments or roles]
- [Specific regulatory requirements addressed]

**Out of scope:**
- [Related activities covered by other SOPs — reference them]
- [Systems or departments not covered]
```

**Erwartet:** Zweck hat ein bis zwei Saetze. Umfang definiert Grenzen klar.
**Bei Fehler:** Ueberschneidet sich der Umfang mit einer bestehenden SOP, entweder den ueberschneidenden Abschnitt auf die bestehende SOP verweisen oder beide SOPs ueberarbeiten, um die Ueberschneidung zu beseitigen.

### Schritt 3: Begriffe und Abkuerzungen definieren

```markdown
### 3. Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| ALCOA+ | Attributable, Legible, Contemporaneous, Original, Accurate + Complete, Consistent, Enduring, Available |
| CCB | Change Control Board |
| GxP | Good [Manufacturing/Laboratory/Clinical] Practice — umbrella for all regulated quality standards |
| SOP | Standard Operating Procedure |
| [Add terms specific to this SOP] | [Definition] |
```

**Erwartet:** Jede Abkuerzung und jeder Fachbegriff, der in der SOP verwendet wird, ist definiert.
**Bei Fehler:** Ist ein Begriff mehrdeutig oder fachspezifisch, das Glossar der Organisation oder die relevante regulatorische Leitlinie fuer die massgebliche Definition konsultieren.

### Schritt 4: Verantwortlichkeiten zuweisen

```markdown
### 4. Responsibilities

| Role | Responsibilities |
|------|-----------------|
| System Owner | Ensure SOP compliance, approve changes, conduct periodic review |
| System Administrator | Execute daily operations per this SOP, report deviations |
| Quality Assurance | Review SOP for regulatory compliance, approve new versions |
| End Users | Follow procedures as written, report issues to system administrator |
| Training Coordinator | Ensure all affected personnel are trained before SOP effective date |
```

**Erwartet:** Jede Handlung im Abschnitt "Verfahren" laesst sich auf eine verantwortliche Rolle zurueckverfolgen.
**Bei Fehler:** Hat ein Verfahrensschritt keine zugewiesene Rolle, handelt es sich um eine verwaiste Verantwortung. Vor SOP-Genehmigung einen Eigentuemer zuweisen.

### Schritt 5: Verfahrensabschnitt schreiben

Dies ist der Kern der SOP. Schritt-fuer-Schritt-Anweisungen verfassen:

```markdown
### 5. Procedure

#### 5.1 [First Major Activity]
1. [Action verb] [specific instruction]. Reference: [form, system screen, tool].
2. [Action verb] [specific instruction].
   - If [condition], then [action].
   - If [alternative condition], then [alternative action].
3. [Action verb] [specific instruction].
4. Record the result in [form/system/log].

#### 5.2 [Second Major Activity]
1. [Action verb] [specific instruction].
2. Verify [specific criterion].
3. If verification fails, initiate [deviation procedure — reference SOP-XXX].

#### 5.3 Deviation Handling
1. If any step cannot be performed as written, STOP and document the deviation.
2. Notify [role] within [timeframe].
3. Complete Deviation Form [form reference].
4. Do not proceed until [role] provides disposition.
```

Schreibregeln fuer GxP-SOPs:
- Jeden Schritt mit einem Aktionsverb beginnen (pruefen, dokumentieren, eingeben, genehmigen, benachrichtigen)
- So spezifisch sein, dass ausgebildete Bediener die Schritte ohne Interpretation befolgen koennen
- Entscheidungspunkte mit klaren Kriterien fuer jeden Pfad einschliessen
- Genaue Formularnamen, Systembildschirme oder Werkzeugkenner referenzieren
- Haltepunkte einschliessen, an denen die Arbeit bis zur Genehmigung oder Verifizierung gestoppt werden muss

**Erwartet:** Eine geschulte Person, die den spezifischen Prozess nicht kennt, koennte diese Schritte korrekt befolgen.
**Bei Fehler:** Bezeichnen Fachexperten das Verfahren als mehrdeutig, Details hinzufuegen oder den Schritt in Teilschritte aufteilen. Mehrdeutigkeit in SOPs ist ein wiederkehrender Auditbefund.

### Schritt 6: Referenzen, Anhaenge und Revisionshistorie hinzufuegen

```markdown
### 6. References
| Document ID | Title |
|-------------|-------|
| SOP-QA-001 | Document Control |
| SOP-IT-015 | User Access Management |
| [Regulation reference] | [e.g., 21 CFR Part 11] |

### 7. Attachments
| Attachment | Description |
|-----------|-------------|
| Form-001 | [Form name and purpose] |
| Template-001 | [Template name and purpose] |

### 8. Revision History
| Version | Date | Author | Change Description |
|---------|------|--------|--------------------|
| 1.0 | [Date] | [Name] | Initial release |
```

**Erwartet:** Alle referenzierten Dokumente sind fuer Nutzer zugaenglich, und die Revisionshistorie beginnt mit Version 1.0.
**Bei Fehler:** Existieren referenzierte Dokumente noch nicht, entweder erstellen oder den Verweis entfernen und die Luecke im SOP-Review vermerken.

### Schritt 7: Zur Pruefung und Genehmigung weiterleiten

```markdown
### Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Author | [Name] | | |
| Technical Reviewer | [Name] | | |
| QA Reviewer | [Name] | | |
| Approver (Department Head) | [Name] | | |

### Training Requirement
All personnel listed in Section 4 must complete training on this SOP before the effective date. Training must be documented in the training management system.

### Periodic Review
This SOP must be reviewed at least every [2 years / annually] or when triggered by:
- Change control affecting the covered process or system
- Audit finding related to the covered process
- Regulatory guidance update affecting the covered requirements
```

**Erwartet:** SOP wird von einem Fachexperten geprueft und von Qualitaet genehmigt, bevor sie wirksam wird.
**Bei Fehler:** Verzoegert sich der Genehmigungsworkflow, muss das Inkrafttreten verschoben werden. Eine SOP kann ohne abgeschlossene Genehmigungen nicht wirksam sein.

## Validierung

- [ ] Dokument-ID folgt der Nummerierungskonvention der Organisation
- [ ] Zweck ist spezifisch und praegnant (1-2 Saetze)
- [ ] Umfang definiert klar In-Scope- und Out-of-Scope-Grenzen
- [ ] Alle Abkuerzungen und Fachbegriffe sind definiert
- [ ] Jede Rolle im Abschnitt Verantwortlichkeiten ist Verfahrensschritten zugeordnet
- [ ] Verfahrensschritte beginnen mit Aktionsverben und sind spezifisch genug zum Befolgen ohne Interpretation
- [ ] Entscheidungspunkte haben klare Kriterien fuer jeden Pfad
- [ ] Abweichungsbehandlung ist definiert
- [ ] Alle referenzierten Dokumente existieren und sind zugaenglich
- [ ] Revisionshistorie ist vollstaendig ab Version 1.0
- [ ] Genehmigungsunterschriften umfassen Autor, Pruefer und Genehmiger
- [ ] Regelmaessiger Pruefungsrhythmus ist definiert

## Haeufige Stolperfallen

- **Zu vage**: "Datenqualitaet sicherstellen" ist kein Verfahrensschritt. "Pruefen, ob alle 15 Felder in Formular-001 ausgefuellt und gemaess Anhang A im Gueltigkeitsbereich sind" ist einer.
- **Zu detailliert**: Fehlerbehebung fuer jeden moeglichen Fehler aufzulisten macht die SOP unleserlich. Komplexe Fehlerbehebung in einer separaten Arbeitsanweisung referenzieren.
- **Keine Abweichungsbehandlung**: Jede SOP muss definieren, was zu tun ist, wenn das Verfahren nicht wie geschrieben befolgt werden kann. Stillschweigen zu Abweichungen impliziert, dass keine moeglich sind.
- **Inkrafttreten vor Schulung**: Eine SOP, die wirksam wird, bevor alle Nutzer geschult sind, schafft sofort eine Compliance-Luecke.
- **Verwaiste SOPs**: SOPs, die nie geprueft werden, werden veraltet und unzuverlaessig. Pruefungstermine festlegen und im Dokumentenmanagementsystem verfolgen.

## Verwandte Skills

- `design-compliance-architecture` — identifiziert, welche Systeme und Prozesse SOPs benoetigen
- `manage-change-control` — loest SOP-Aktualisierungen bei Prozessaenderungen aus
- `design-training-program` — stellt sicher, dass Nutzer in neuen und aktualisierten SOPs geschult sind
- `conduct-gxp-audit` — Audits bewerten SOP-Angemessenheit und Einhaltung
- `write-validation-documentation` — SOPs und Validierungsdokumente teilen Genehmigungsworkflows
