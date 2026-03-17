---
name: setup-gxp-r-project
description: >
  R-Projektstruktur gemaess GxP-Vorschriften einrichten
  (21 CFR Part 11, EU Annex 11). Umfasst validierte Umgebungen,
  Qualifizierungsdokumentation, Aenderungskontrolle und Anforderungen
  an elektronische Aufzeichnungen. Anzuwenden beim Start eines R-Analyseprojekts
  in einem regulierten Umfeld (Pharma, Biotech, Medizinprodukte), beim Einrichten
  von R fuer klinische Studienanalysen, beim Erstellen einer validierten
  Rechenumgebung fuer Behoerdeneinreichungen oder bei der Implementierung
  von 21 CFR Part 11 oder EU Annex 11.
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
  language: R
  tags: gxp, validation, regulatory, pharma, 21-cfr-part-11
---

# GxP-R-Projekt einrichten

Eine R-Projektstruktur erstellen, die GxP-regulatorische Anforderungen fuer validiertes Rechnen erfuellt.

## Wann verwenden

- Start eines R-Analyseprojekts in einem regulierten Umfeld (Pharma, Biotech, Medizinprodukte)
- Einrichten von R fuer klinische Studienanalysen
- Erstellen einer validierten Rechenumgebung fuer Behoerdeneinreichungen
- Implementierung von 21 CFR Part 11 oder EU Annex 11

## Eingaben

- **Erforderlich**: Projektumfang und regulatorischer Rahmen (FDA, EMA oder beide)
- **Erforderlich**: R-Version und Paketversionen zur Validierung
- **Erforderlich**: Validierungsstrategie (risikobasierter Ansatz)
- **Optional**: Vorhandene SOPs fuer computergestuetzte Systeme
- **Optional**: Anforderungen an die Integration des Qualitaetsmanagementsystems

## Vorgehensweise

### Schritt 1: Validierte Projektstruktur erstellen

```
gxp-project/
├── R/                          # Analysis scripts
│   ├── 01_data_import.R
│   ├── 02_data_processing.R
│   └── 03_analysis.R
├── validation/                 # Validation documentation
│   ├── validation_plan.md      # VP: scope, strategy, roles
│   ├── risk_assessment.md      # Risk categorization
│   ├── iq/                     # Installation Qualification
│   │   ├── iq_protocol.md
│   │   └── iq_report.md
│   ├── oq/                     # Operational Qualification
│   │   ├── oq_protocol.md
│   │   └── oq_report.md
│   ├── pq/                     # Performance Qualification
│   │   ├── pq_protocol.md
│   │   └── pq_report.md
│   └── traceability_matrix.md  # Requirements to tests mapping
├── tests/                      # Automated test suite
│   ├── testthat.R
│   └── testthat/
│       ├── test-data_import.R
│       └── test-analysis.R
├── data/                       # Input data (controlled)
│   ├── raw/                    # Immutable raw data
│   └── derived/                # Processed datasets
├── output/                     # Analysis outputs
├── docs/                       # Supporting documentation
│   ├── sop_references.md       # Links to relevant SOPs
│   └── change_log.md           # Manual change documentation
├── renv.lock                   # Locked dependencies
├── DESCRIPTION                 # Project metadata
├── .Rprofile                   # Session configuration
└── CLAUDE.md                   # AI assistant instructions
```

**Erwartet:** Die vollstaendige Verzeichnisstruktur existiert mit den Ordnern `R/`, `validation/` (einschliesslich der Unterverzeichnisse `iq/`, `oq/`, `pq/`), `tests/testthat/`, `data/raw/`, `data/derived/`, `output/` und `docs/`.

**Bei Fehler:** Fehlende Verzeichnisse mit `mkdir -p` anlegen. Pruefen, ob man sich im richtigen Projektstammverzeichnis befindet. Bei bestehenden Projekten nur fehlende Verzeichnisse erstellen, nicht die vorhandene Struktur ueberschreiben.

### Schritt 2: Validierungsplan erstellen

`validation/validation_plan.md` erstellen:

```markdown
# Validation Plan

## 1. Purpose
This plan defines the validation strategy for [Project Name] using R [version].

## 2. Scope
- R version: 4.5.0
- Packages: [list with versions]
- Analysis: [description]
- Regulatory framework: 21 CFR Part 11 / EU Annex 11

## 3. Risk Assessment Approach
Using GAMP 5 risk-based categories:
- Category 3: Non-configured products (R base)
- Category 4: Configured products (R packages with default settings)
- Category 5: Custom applications (custom R scripts)

## 4. Validation Activities
| Activity | Category 3 | Category 4 | Category 5 |
|----------|-----------|-----------|-----------|
| IQ | Required | Required | Required |
| OQ | Reduced | Standard | Enhanced |
| PQ | N/A | Standard | Enhanced |

## 5. Roles and Responsibilities
- Validation Lead: [Name]
- Developer: [Name]
- QA Reviewer: [Name]
- Approver: [Name]

## 6. Acceptance Criteria
All tests must pass with documented evidence.
```

**Erwartet:** `validation/validation_plan.md` ist vollstaendig mit Umfang, GAMP-5-Risikokategorien, Matrix der Validierungsaktivitaeten, Rollen und Verantwortlichkeiten sowie Abnahmekriterien. Der Plan referenziert die spezifische R-Version und den regulatorischen Rahmen.

**Bei Fehler:** Ist der regulatorische Rahmen unklar, die QA-Abteilung der Organisation konsultieren. Validierungsaktivitaeten erst fortsetzen, nachdem der Plan geprueft und genehmigt wurde.

### Schritt 3: Abhaengigkeiten mit renv sperren

```r
# Initialize renv with exact versions
renv::init()

# Install specific validated versions
renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

# Snapshot
renv::snapshot()
```

Die `renv.lock`-Datei dient als kontrolliertes Paketinventar.

**Erwartet:** `renv.lock` existiert mit exakten Versionsnummern fuer alle erforderlichen Pakete. `renv::status()` meldet keine Probleme. Jede Paketversion ist fixiert (z. B. `dplyr@1.1.4`), nicht variabel.

**Bei Fehler:** Schlaegt `renv::install()` fuer eine bestimmte Version fehl, pruefen, ob die Version in CRAN-Archiven existiert. Archivierte Versionen mit `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")` installieren.

### Schritt 4: Versionskontrolle implementieren

```bash
git init
git add .
git commit -m "Initial validated project structure"

# Use signed commits for traceability
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

**Erwartet:** Das Projekt steht unter git-Versionskontrolle mit aktivierten signierten Commits. Der erste Commit enthaelt die validierte Projektstruktur und `renv.lock`.

**Bei Fehler:** Schlaegt die GPG-Signierung fehl, den GPG-Schluessel mit `gpg --list-secret-keys` pruefen. In Umgebungen ohne GPG die Abweichung dokumentieren und unsignierte Commits mit manuellen Auditpfad-Eintraegen in `docs/change_log.md` verwenden.

### Schritt 5: IQ-Protokoll erstellen

`validation/iq/iq_protocol.md`:

```markdown
# Installation Qualification Protocol

## Objective
Verify that R and required packages are correctly installed.

## Test Cases

### IQ-001: R Version Verification
- **Requirement**: R 4.5.0 installed
- **Procedure**: Execute `R.version.string`
- **Expected:** "R version 4.5.0 (date)"
- **Result**: [ PASS / FAIL ]

### IQ-002: Package Installation Verification
- **Requirement**: All packages in renv.lock installed
- **Procedure**: Execute `renv::status()`
- **Expected:** "No issues found"
- **Result**: [ PASS / FAIL ]

### IQ-003: Package Version Verification
- **Procedure**: Execute `installed.packages()[, c("Package", "Version")]`
- **Expected:** Versions match renv.lock exactly
- **Result**: [ PASS / FAIL ]
```

**Erwartet:** `validation/iq/iq_protocol.md` enthaelt Testfaelle fuer die R-Versionsverifizierung, die Paketinstallationspruefung und die Paketversionspruefung, jeweils mit klaren Erwartungswerten und Bestanden/Fehlgeschlagen-Feldern.

**Bei Fehler:** Entspricht die IQ-Protokollvorlage nicht den SOP-Anforderungen der Organisation, das Format anpassen und dabei die Pflichtfelder (Anforderung, Vorgehensweise, Erwartetes Ergebnis, Tatsaechliches Ergebnis, Bestanden/Fehlgeschlagen) beibehalten. QA nach genehmigten Vorlagen befragen.

### Schritt 6: Automatisierte OQ/PQ-Tests schreiben

```r
# tests/testthat/test-analysis.R
test_that("primary analysis produces validated results", {
  # Known input -> known output (double programming validation)
  test_data <- read.csv(test_path("fixtures", "validation_dataset.csv"))

  result <- primary_analysis(test_data)

  # Compare against independently calculated expected values
  expect_equal(result$estimate, 2.345, tolerance = 1e-3)
  expect_equal(result$p_value, 0.012, tolerance = 1e-3)
  expect_equal(result$ci_lower, 1.234, tolerance = 1e-3)
})
```

**Erwartet:** Automatisierte Testdateien existieren in `tests/testthat/` mit Abdeckung fuer OQ (Funktionspruefung jeder Funktion) und PQ (End-to-End-Validierung gegen unabhaengig berechnete Referenzwerte). Tests verwenden explizite numerische Toleranzen.

**Bei Fehler:** Sind Referenzwerte aus unabhaengiger Berechnung (z. B. SAS) noch nicht vorhanden, Platzhaltertests mit `skip("Awaiting independent reference values")` erstellen und in der Rueckverfolgbarkeitsmatrix dokumentieren.

### Schritt 7: Rueckverfolgbarkeitsmatrix erstellen

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

**Erwartet:** `validation/traceability_matrix.md` verknuepft jede Anforderung mit mindestens einem Testfall und jeden Testfall mit einer Anforderung. Keine verwaisten Anforderungen oder Tests.

**Bei Fehler:** Sind Anforderungen ungetestet, Testfaelle dafuer erstellen oder eine risikobasierte Begruendung fuer den Ausschluss dokumentieren. Haben Tests keine verknuepfte Anforderung, entweder mit einer vorhandenen Anforderung verknuepfen oder als ausserhalb des Umfangs entfernen.

## Validierung

- [ ] Projektstruktur entspricht der dokumentierten Vorlage
- [ ] renv.lock enthaelt alle Abhaengigkeiten mit exakten Versionen
- [ ] Validierungsplan ist vollstaendig und genehmigt
- [ ] IQ-Protokoll wird erfolgreich ausgefuehrt
- [ ] OQ-Testfaelle decken alle konfigurierten Funktionen ab
- [ ] PQ-Tests validieren gegen unabhaengig berechnete Ergebnisse
- [ ] Rueckverfolgbarkeitsmatrix verknuepft Anforderungen mit Tests
- [ ] Aenderungskontrollprozess ist dokumentiert

## Haeufige Stolperfallen

- **`install.packages()` ohne Versionsverankerung verwenden**: Immer renv mit gesperrten Versionen nutzen
- **Fehlender Auditpfad**: Jede Aenderung muss dokumentiert werden. Signierte git-Commits verwenden.
- **Uebervalidierung**: Risikobasierten Ansatz anwenden. Nicht jedes CRAN-Paket benoetigt Category-5-Validierung.
- **Vergessen der systemseitigen Qualifizierung**: Auch Betriebssystem und R-Installation benoetigen IQ
- **Keine unabhaengige Verifizierung**: PQ sollte gegen Ergebnisse aus unabhaengiger Berechnung (SAS, manuelle Berechnung) verglichen werden

## Verwandte Skills

- `write-validation-documentation` - detaillierte Erstellung von Validierungsdokumenten
- `implement-audit-trail` - elektronische Aufzeichnungen und Auditpfade
- `validate-statistical-output` - Doppelprogrammierung und Ausgabevalidierung
- `manage-renv-dependencies` - Abhaengigkeitssperrung fuer validierte Umgebungen
