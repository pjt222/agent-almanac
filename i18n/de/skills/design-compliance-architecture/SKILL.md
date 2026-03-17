---
name: design-compliance-architecture
description: >
  Compliance-Architektur erstellen, die anwendbare Vorschriften
  computergestuetzten Systemen zuordnet. Umfasst Systeminventar,
  Kritikalitaetsklassifizierung (GxP-kritisch, GxP-unterstuetzend, nicht-GxP),
  GAMP-5-Kategorienzuweisung, regulatorische Anforderungsrueckverfolgbarkeit
  und Definition der Governance-Struktur. Anzuwenden bei Etablierung einer
  neuen regulierten Einrichtung, Formalisierung der Konformitaet ueber mehrere
  Systeme, Bearbeitung einer regulatorischen Lueckenanalyse, Harmonisierung
  der Konformitaet nach Fusionen oder Reorganisationen oder Vorbereitung eines
  Standortmasterdokuments mit Referenzen auf computergestuetzte Systeme.
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
  complexity: advanced
  language: multi
  tags: gxp, compliance, architecture, regulatory, gamp-5, governance
---

# Compliance-Architektur entwerfen

Den uebergeordneten Compliance-Rahmen erstellen, der Vorschriften Systemen zuordnet, Kritikalitaet klassifiziert und Governance fuer ein reguliertes Umfeld definiert.

## Wann verwenden

- Eine neue regulierte Einrichtung, Abteilung oder ein neues Programm wird aufgebaut
- Eine bestehende Organisation muss ihre Compliance-Postur ueber mehrere Systeme formalisieren
- Eine regulatorische Lueckenanalyse zeigt fehlende Systemklassifizierung oder Validierungsstrategie
- Fusionen, Akquisitionen oder Reorganisationen erfordern Harmonisierung der Compliance ueber Einheiten
- Vorbereitung eines Standortmasterdokuments oder Qualitaetshandbuchs mit Referenzen auf computergestuetzte Systeme

## Eingaben

- **Erforderlich**: Liste der computergestuetzten Systeme im Umfang (Name, Zweck, Anbieter/individuell)
- **Erforderlich**: Anwendbare regulatorische Rahmen (21 CFR Part 11, EU Annex 11, GMP, GLP, GCP, ICH Q7, ICH Q10)
- **Erforderlich**: Organisatorischer Kontext (Abteilung, Standort, Produkttypen)
- **Optional**: Vorhandener Validierungsmasterplan oder Qualitaetshandbuch
- **Optional**: Fruehere Auditbefunde oder regulatorische Inspektionsbeobachtungen
- **Optional**: Organigramm mit Qualitaets- und IT-Berichtslinien

## Vorgehensweise

### Schritt 1: Systeminventar aufbauen

Ein umfassendes Inventar aller computergestuetzten Systeme erstellen:

```markdown
# System Inventory
## Document ID: SI-[SITE]-[YYYY]-[NNN]

| ID | System Name | Version | Vendor | Purpose | Department | Data Types | Users |
|----|-------------|---------|--------|---------|------------|------------|-------|
| SYS-001 | LabWare LIMS | 8.1 | LabWare Inc. | Sample management and testing | QC | Test results, COA | 45 |
| SYS-002 | SAP ERP | S/4HANA | SAP SE | Batch release and inventory | Production | Batch records, BOM | 120 |
| SYS-003 | Custom R/Shiny | 2.1.0 | Internal | Statistical analysis | Biostatistics | Clinical data | 8 |
| SYS-004 | Windows Server | 2022 | Microsoft | File server | IT | Documents | 200 |
```

**Erwartet:** Jedes System, das GxP-relevante Daten erstellt, aendert, speichert, abruft oder uebertraegt, ist aufgelistet.
**Bei Fehler:** Koennen Systemeigentuemer keine vollstaendigen Informationen liefern, die Luecke dokumentieren und einen Entdeckungsworkshop anberaumen. Fehlende Systeme sind ein kritisches Compliance-Risiko.

### Schritt 2: Systemkritikalitaet klassifizieren

Jedem System eine Kritikalitaetsstufe zuweisen:

```markdown
# System Criticality Classification
## Document ID: SCC-[SITE]-[YYYY]-[NNN]

### Classification Criteria

| Tier | Definition | Validation Required | Examples |
|------|-----------|-------------------|----------|
| **GxP-Critical** | Directly impacts product quality, patient safety, or data integrity. Generates or processes GxP records. | Full CSV per GAMP 5 | LIMS, ERP (batch), CDMS, MES |
| **GxP-Supporting** | Supports GxP processes but does not directly generate GxP records. Failure has indirect impact. | Risk-based qualification | Email, document management, scheduling |
| **Non-GxP** | No impact on product quality, safety, or data integrity. | IT standard controls only | HR systems, cafeteria, general web |

### System Classification Matrix

| System ID | System | Tier | Rationale |
|-----------|--------|------|-----------|
| SYS-001 | LabWare LIMS | GxP-Critical | Generates test results used for batch release |
| SYS-002 | SAP ERP | GxP-Critical | Manages batch records and material traceability |
| SYS-003 | R/Shiny App | GxP-Critical | Performs statistical analysis for regulatory submissions |
| SYS-004 | Windows Server | GxP-Supporting | Stores controlled documents but does not generate GxP data |
```

**Erwartet:** Jedes System hat eine Stufenzuweisung mit dokumentierter Begruendung.
**Bei Fehler:** Wird die Kritikalitaet eines Systems beanstandet, an den Qualitaetsrat eskalieren. Im Zweifel eine Stufe hoeher klassifizieren und nach einer formalen Risikobewertung neu beurteilen.

### Schritt 3: GAMP-5-Softwarekategorien zuweisen

Fuer jedes GxP-kritische und GxP-unterstuetzende System die GAMP-5-Kategorie zuweisen:

```markdown
# GAMP 5 Category Assignment

| System ID | System | GAMP Category | Rationale | Validation Effort |
|-----------|--------|---------------|-----------|-------------------|
| SYS-001 | LabWare LIMS | 4 — Configured Product | COTS with extensive workflow configuration | Medium-High |
| SYS-002 | SAP ERP | 4 — Configured Product | COTS with custom transactions | Medium-High |
| SYS-003 | R/Shiny App | 5 — Custom Application | Internally developed | High — Full lifecycle |
| SYS-004 | Windows Server | 1 — Infrastructure | Operating system, no custom configuration | Low — Verify installation |
```

Kategoriereferenz:
- **Kategorie 1**: Infrastruktur (Betriebssystem, Firmware) — Installation verifizieren
- **Kategorie 3**: Nicht-konfiguriertes COTS — Funktionalitaet wie vorhanden pruefen
- **Kategorie 4**: Konfiguriertes Produkt — alle Konfigurationen pruefen
- **Kategorie 5**: Benutzerdefinierte Anwendung — vollstaendige Lebenszyklusvalidierung

**Erwartet:** Kategorienzuweisung entspricht der Nutzung des Systems, nicht nur dem, was es ist.
**Bei Fehler:** Umfasst ein System mehrere Kategorien (z. B. COTS mit benutzerdefinierten Erweiterungen), die benutzerdefinierten Teile als Kategorie 5 und die Basis als Kategorie 4 klassifizieren.

### Schritt 4: Regulatorische Anforderungen Systemen zuordnen

Eine Matrix zur Rueckverfolgbarkeit regulatorischer Anforderungen erstellen:

```markdown
# Regulatory Requirements Traceability Matrix
## Document ID: RRTM-[SITE]-[YYYY]-[NNN]

| Regulation | Clause | Requirement | Applicable Systems | Control Type |
|-----------|--------|-------------|-------------------|--------------|
| 21 CFR 11 | 11.10(a) | Validation | SYS-001, SYS-002, SYS-003 | Procedural + Technical |
| 21 CFR 11 | 11.10(d) | Access controls | SYS-001, SYS-002, SYS-003, SYS-004 | Technical |
| 21 CFR 11 | 11.10(e) | Audit trail | SYS-001, SYS-002, SYS-003 | Technical |
| 21 CFR 11 | 11.50 | Signature manifestation | SYS-001, SYS-002 | Technical |
| EU Annex 11 | §4 | Validation | SYS-001, SYS-002, SYS-003 | Procedural + Technical |
| EU Annex 11 | §7 | Data storage and backup | All | Technical |
| EU Annex 11 | §9 | Audit trail | SYS-001, SYS-002, SYS-003 | Technical |
| EU Annex 11 | §12 | Security and access | All | Technical |
| ICH Q10 | §3.2 | Change management | All GxP-Critical | Procedural |
| ICH Q10 | §1.8 | Knowledge management | SYS-001, SYS-003 | Procedural |
```

**Erwartet:** Jede anwendbare regulatorische Klausel ist mindestens einem System zugeordnet, und jedes GxP-kritische System ist den relevanten regulatorischen Klauseln zugeordnet.
**Bei Fehler:** Nicht zugeordnete Klauseln stellen Compliance-Luecken dar. Einen Sanierungsplan mit Zeitplaenen fuer jede Luecke erstellen.

### Schritt 5: Validierungsstrategie pro System definieren

Basierend auf Kritikalitaet, Kategorie und regulatorischer Zuordnung:

```markdown
# Validation Strategy Summary

| System | Category | Criticality | Validation Approach | Key Deliverables |
|--------|----------|------------|--------------------|--------------------|
| LabWare LIMS | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, PQ, TM, VSR |
| SAP ERP | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, TM, VSR |
| R/Shiny App | 5 | Critical | Prospective CSV + code review | URS, RA, VP, IQ, OQ, PQ, TM, VSR, code audit |
| Windows Server | 1 | Supporting | Installation qualification | IQ checklist |
```

Abkuerzungen: URS (Benutzeranforderungen), RA (Risikobewertung), VP (Validierungsplan), IQ/OQ/PQ (Installations-/Operations-/Leistungsqualifizierung), TM (Rueckverfolgbarkeitsmatrix), VSR (Validierungszusammenfassungsbericht).

**Erwartet:** Validierungsaufwand ist proportional zum Risiko — Kategorie-5-GxP-kritische Systeme erhalten vollstaendigen Lebenszyklus; Kategorie-1-Infrastruktur erhaelt vereinfachte IQ.
**Bei Fehler:** Druecken Stakeholder auf reduzierte Validierung kritischer Systeme, die Risikoakzeptanz mit QA-Genehmigung dokumentieren.

### Schritt 6: Governance-Struktur entwerfen

Den organisatorischen Rahmen zur Aufrechterhaltung der Konformitaet definieren:

```markdown
# Compliance Governance Structure

## Roles and Responsibilities
| Role | Responsibility | Authority |
|------|---------------|-----------|
| Quality Director | Overall compliance accountability | Approve validation strategies, accept risks |
| System Owner | Day-to-day system compliance | Approve changes, ensure validated state |
| Validation Lead | Plan and coordinate validation activities | Define validation scope and approach |
| IT Operations | Technical infrastructure and security | Implement technical controls |
| QA Reviewer | Independent review of validation deliverables | Accept or reject validation evidence |

## Governance Committees
| Committee | Frequency | Purpose | Members |
|-----------|-----------|---------|---------|
| Change Control Board | Weekly | Review and approve system changes | System owners, QA, IT, validation |
| Periodic Review Committee | Quarterly | Review system compliance status | Quality director, system owners, QA |
| Audit Programme Committee | Annual | Plan internal audit schedule | Quality director, lead auditor, QA |

## Escalation Matrix
| Issue | First Escalation | Second Escalation | Timeline |
|-------|-----------------|-------------------|----------|
| Critical audit finding | System Owner → QA Director | QA Director → Site Director | 24 hours |
| Validated state breach | Validation Lead → System Owner | System Owner → Quality Director | 48 hours |
| Data integrity incident | System Owner → QA Director | QA Director → Regulatory Affairs | 24 hours |
```

**Erwartet:** Klare Verantwortlichkeit fuer jede Compliance-Aktivitaet ohne verwaiste Zustaendigkeiten.
**Bei Fehler:** Ueberlappen oder fehlen Rollen, einen RACI-Workshop einberufen. Unklare Eigentuemeschaft ist eine wiederkehrende regulatorische Zitation.

### Schritt 7: Compliance-Architekturdokument zusammenstellen

Alle Komponenten in das Masterdokument zusammenfuehren:

```markdown
# Compliance Architecture
## Document ID: CA-[SITE]-[YYYY]-[NNN]
## Version: 1.0

### 1. Purpose and Scope
[Organisation, site, product scope, regulatory scope]

### 2. System Inventory
[From Step 1]

### 3. Criticality Classification
[From Step 2]

### 4. GAMP 5 Category Assignments
[From Step 3]

### 5. Regulatory Requirements Traceability
[From Step 4]

### 6. Validation Strategy
[From Step 5]

### 7. Governance Structure
[From Step 6]

### 8. Periodic Review Schedule
- System inventory refresh: Annual
- Criticality re-assessment: When new systems added or regulations change
- Regulatory mapping update: When new guidance issued
- Governance review: Annual or after organisational change

### 9. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Director | | | |
| IT Director | | | |
| Regulatory Affairs | | | |
```

**Erwartet:** Ein einzelnes Dokument, das als Compliance-Blaupause fuer die gesamte regulierte Umgebung dient.
**Bei Fehler:** Uebersteigt das Dokument die praktische Groesse, ein Masterdokument mit Referenzen auf Unterlagendokumente pro System oder Bereich erstellen.

## Validierung

- [ ] Systeminventar umfasst jedes System, das GxP-Daten verarbeitet
- [ ] Jedes System hat eine Kritikalitaetsstufe mit dokumentierter Begruendung
- [ ] GAMP-5-Kategorien allen GxP-kritischen und GxP-unterstuetzenden Systemen zugewiesen
- [ ] Matrix zur Rueckverfolgbarkeit regulatorischer Anforderungen deckt alle anwendbaren Klauseln ab
- [ ] Jedes GxP-kritische System hat eine definierte Validierungsstrategie
- [ ] Governance-Struktur definiert Rollen, Ausschuesse und Eskalationspfade
- [ ] Alle Dokumente haben eindeutige IDs und Versionskontrolle
- [ ] Compliance-Architekturdokument von Qualitaets- und IT-Leitung genehmigt

## Haeufige Stolperfallen

- **Unvollstaendiges Inventar**: Fehlende Systeme sind fuer die Compliance unsichtbar. Netzwerkscans, Software-Asset-Management-Tools und Abteilungsinterviews verwenden — nicht nur IT befragen.
- **Binaeres Denken**: Systeme sind nicht einfach "GxP" oder "nicht GxP". Das Drei-Stufen-Modell (Kritisch, Unterstuetzend, Nicht-GxP) vermeidet sowohl Ueber- als auch Untervalidierung.
- **Kategorienverwechslung**: GAMP-5-Kategorie beschreibt, was die Software IST, aber der Validierungsaufwand sollte widerspiegeln, wie sie GENUTZT wird. Ein Kategorie-4-System fuer die Chargenfreigabe benoetigt mehr Tests als ein Kategorie-4-System fuer Terminplanung.
- **Statische Architektur**: Die Compliance-Architektur ist ein lebendes Dokument. Neue Systeme, regulatorische Aenderungen und Auditbefunde erfordern alle Updates.
- **Governance ohne Wirkung**: Ausschuesse, die nur auf dem Papier existieren, aber sich nie treffen, bieten keinen Compliance-Wert. Sitzungsrhythmus und Beschlussfaehigkeit definieren.

## Verwandte Skills

- `perform-csv-assessment` — die hier definierte Validierungsstrategie fuer einzelne Systeme ausfuehren
- `manage-change-control` — den in der Governance definierten Aenderungskontrollprozess operationalisieren
- `implement-electronic-signatures` — in der regulatorischen Matrix zugeordnete e-Signatur-Kontrollen implementieren
- `prepare-inspection-readiness` — diese Architektur als Grundlage fuer die Inspektionsvorbereitung nutzen
- `conduct-gxp-audit` — gegen die Compliance-Architektur als Basislinie auditieren
