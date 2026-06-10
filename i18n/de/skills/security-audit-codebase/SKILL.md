---
name: security-audit-codebase
description: >
  Ein Sicherheitsaudit einer Codebasis durchfuehren und auf offengelegte
  Geheimnisse, verwundbare Abhaengigkeiten, Injection-Schwachstellen,
  unsichere Konfigurationen und OWASP-Top-10-Probleme pruefen. Verwenden
  vor der Veroeffentlichung oder dem Deployment eines Projekts, bei
  periodischen Sicherheitspruefungen, nach dem Hinzufuegen von
  Authentifizierung oder API-Integration, vor dem Open-Sourcing eines
  privaten Repositories oder bei der Vorbereitung auf ein
  Sicherheits-Compliance-Audit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: security, audit, owasp, secrets, vulnerability
  locale: de
  source_locale: en
  source_commit: 6a868d56
  translator: claude-opus-4-6
  translation_date: 2026-03-13
---

# Sicherheitsaudit der Codebasis

Eine systematische Sicherheitsueberpruefung einer Codebasis durchfuehren, um Schwachstellen und offengelegte Geheimnisse zu identifizieren.

## Wann verwenden

- Vor der Veroeffentlichung oder dem Deployment eines Projekts
- Periodische Sicherheitsueberpruefung bestehender Projekte
- Nach dem Hinzufuegen von Authentifizierung, API-Integration oder Benutzereingabeverarbeitung
- Vor dem Open-Sourcing eines privaten Repositories
- Bei der Vorbereitung auf ein Sicherheits-Compliance-Audit

## Eingaben

- **Erforderlich**: Zu auditierende Codebasis
- **Optional**: Spezifischer Fokusbereich (Geheimnisse, Abhaengigkeiten, Injection, Authentifizierung)
- **Optional**: Compliance-Framework (OWASP, ISO 27001, SOC 2)
- **Optional**: Ergebnisse frueherer Audits zum Vergleich

## Vorgehensweise

### Schritt 1: Nach offengelegten Geheimnissen suchen

Nach Mustern suchen, die auf hartcodierte Geheimnisse hindeuten:

```bash
# API-Schluessel und Token
grep -rn "sk-\|ghp_\|gho_\|github_pat_\|hf_\|AKIA" --include="*.{md,js,ts,py,R,json,yml,yaml}" .

# Allgemeine Geheimnis-Muster
grep -rn "password\s*=\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "api[_-]key\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "secret\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .

# Verbindungszeichenfolgen
grep -rn "postgresql://\|mysql://\|mongodb://" .

# Private Schluessel
grep -rn "BEGIN.*PRIVATE KEY" .
```

**Erwartet:** Keine echten Geheimnisse gefunden -- nur Platzhalter wie `YOUR_TOKEN_HERE` oder `your.email@example.com`.

**Bei Fehler:** Falls echte Geheimnisse gefunden werden, sie sofort entfernen, die offengelegten Zugangsdaten rotieren und die Git-Historie mit `git filter-branch` oder `git-filter-repo` bereinigen. Jedes offengelegte Geheimnis als kompromittiert betrachten.

### Schritt 2: .gitignore-Abdeckung pruefen

Sicherstellen, dass sensible Dateien ausgeschlossen sind:

```bash
# Pruefen, dass diese Dateien git-ignoriert werden
git check-ignore .env .Renviron credentials.json node_modules/

# Nach verfolgten sensiblen Dateien suchen
git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

**Erwartet:** Alle sensiblen Dateien (`.env`, `.Renviron`, `credentials.json`) sind in `.gitignore` aufgefuehrt und `git ls-files` liefert keine verfolgten sensiblen Dateien.

**Bei Fehler:** Falls sensible Dateien verfolgt werden, `git rm --cached <file>` ausfuehren, um die Verfolgung zu beenden, zur `.gitignore` hinzufuegen und committen. Die Datei bleibt auf der Festplatte, wird aber nicht mehr versionskontrolliert.

### Schritt 3: Abhaengigkeiten auditieren

**Node.js**:

```bash
npm audit
npx audit-ci --moderate
```

**Python**:

```bash
pip-audit
safety check
```

**R**:

```r
# Auf bekannte Schwachstellen in Paketen pruefen
# Kein eingebautes Werkzeug, aber Paketquellen verifizieren
renv::status()
```

**Erwartet:** Keine hohen oder kritischen Schwachstellen in Abhaengigkeiten. Mittlere und niedrige Schwachstellen zur Ueberpruefung dokumentiert.

**Bei Fehler:** Falls kritische Schwachstellen gefunden werden, die betroffenen Pakete sofort aktualisieren mit `npm audit fix` oder `pip install --upgrade`. Falls Aktualisierungen Breaking Changes einfuehren, die Schwachstelle dokumentieren und einen Behebungsplan erstellen.

### Schritt 4: Auf Injection-Schwachstellen pruefen

**SQL-Injection**:

```bash
# Nach String-Verkettung in Abfragen suchen
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

Alle Datenbankabfragen sollten parametrisierte Abfragen verwenden, keine String-Verkettung.

**Command-Injection**:

```bash
# Nach Shell-Ausfuehrung mit Benutzereingabe suchen
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS (Cross-Site-Scripting)**:

```bash
# Nach nicht escaptem Benutzerinhalt in HTML suchen
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

**Erwartet:** Keine SQL-, Command- oder XSS-Injection-Vektoren gefunden. Alle Datenbankabfragen verwenden parametrisierte Anweisungen, Shell-Befehle vermeiden benutzergesteuerte Eingaben, und HTML-Ausgabe ist ordnungsgemaess escaped.

**Bei Fehler:** Falls Injection-Schwachstellen gefunden werden, String-Verkettung in Abfragen durch parametrisierte Abfragen ersetzen, Benutzereingaben vor der Shell-Ausfuehrung bereinigen oder escapen, und Framework-sichere Rendering-Methoden statt `innerHTML` oder `dangerouslySetInnerHTML` verwenden.

### Schritt 5: Authentifizierung und Autorisierung ueberpruefen

Checkliste:
- [ ] Passwoerter mit bcrypt/argon2 gehasht (nicht MD5/SHA1)
- [ ] Sitzungstoken sind zufaellig und ausreichend lang
- [ ] Authentifizierungstoken haben eine Ablaufzeit
- [ ] API-Endpunkte pruefen die Autorisierung
- [ ] CORS restriktiv konfiguriert
- [ ] CSRF-Schutz fuer zustandsaendernde Operationen aktiviert

**Erwartet:** Alle Checklistenpunkte bestanden: Passwoerter verwenden starkes Hashing, Token sind zufaellig mit Ablaufzeit, Endpunkte erzwingen Autorisierung, CORS ist restriktiv und CSRF-Schutz ist aktiv.

**Bei Fehler:** Korrekturen nach Schweregrad priorisieren: Schwaches Passwort-Hashing und fehlende Autorisierung sind kritisch, CORS- und CSRF-Probleme sind hoch. Alle Ergebnisse mit ihrem Schweregrad dokumentieren.

### Schritt 6: Konfigurationssicherheit pruefen

```bash
# Debug-Modus in Produktionskonfigurationen
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# Zu offenes CORS
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTP statt HTTPS
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

**Erwartet:** Debug-Modus ist in Produktionskonfigurationen deaktiviert, CORS verwendet keine Wildcard-Origins in Produktion, und alle externen URLs verwenden HTTPS.

**Bei Fehler:** Falls der Debug-Modus in Produktionskonfigurationen aktiviert ist, sofort deaktivieren. Wildcard-CORS-Origins durch explizit erlaubte Domains ersetzen. `http://`-URLs zu `https://` aktualisieren, sofern der Endpunkt dies unterstuetzt.

### Schritt 7: Ergebnisse dokumentieren

Einen Auditbericht erstellen:

```markdown
# Security Audit Report

**Date**: YYYY-MM-DD
**Auditor**: [Name]
**Scope**: [Repository/Project]
**Status**: [PASS/FAIL/CONDITIONAL]

## Findings Summary

| Category | Status | Details |
|----------|--------|---------|
| Exposed secrets | PASS | No secrets found |
| .gitignore | PASS | Sensitive files excluded |
| Dependencies | WARN | 2 moderate vulnerabilities |
| Injection | PASS | Parameterized queries used |
| Auth/AuthZ | N/A | No authentication in scope |
| Configuration | PASS | Debug mode disabled |

## Detailed Findings

### Finding 1: [Title]
- **Severity**: Low / Medium / High / Critical
- **Location**: `path/to/file:line`
- **Description**: What was found
- **Recommendation**: How to fix
- **Status**: Open / Resolved

## Recommendations
1. Update dependencies to fix moderate vulnerabilities
2. [Additional recommendations]
```

**Erwartet:** Ein vollstaendiger `SECURITY_AUDIT_REPORT.md` im Projektstammverzeichnis gespeichert, mit nach Schweregrad kategorisierten Ergebnissen, jeweils mit spezifischem Fundort, Beschreibung und Empfehlung.

**Bei Fehler:** Falls zu viele Ergebnisse fuer einzelne Dokumentation, nach Kategorie gruppieren und kritische/hohe Ergebnisse priorisieren. Den Bericht unabhaengig vom Ergebnis erstellen, um eine Baseline zu etablieren.

## Validierung

- [ ] Keine hartcodierten Geheimnisse im Quellcode
- [ ] .gitignore deckt alle sensiblen Dateien ab
- [ ] Keine hohen/kritischen Schwachstellen in Abhaengigkeiten
- [ ] Keine Injection-Schwachstellen
- [ ] Authentifizierung ist ordnungsgemaess implementiert (falls zutreffend)
- [ ] Auditbericht ist vollstaendig und Ergebnisse sind bearbeitet

## Haeufige Stolperfallen

- **Nur aktuelle Dateien pruefen**: Geheimnisse in der Git-Historie sind weiterhin offengelegt. Mit `git log -p --all -S 'secret_pattern'` pruefen.
- **Entwicklungsabhaengigkeiten ignorieren**: Entwicklungsabhaengigkeiten koennen dennoch Supply-Chain-Risiken einfuehren.
- **Falsches Sicherheitsgefuehl durch `.gitignore`**: `.gitignore` verhindert nur kuenftiges Tracking. Bereits committete Dateien benoetigen `git rm --cached`.
- **Konfigurationsdateien uebersehen**: `docker-compose.yml`, CI-Konfigurationen und Deployment-Skripte enthalten haeufig Geheimnisse.
- **Kompromittierte Zugangsdaten nicht rotieren**: Ein Geheimnis zu finden und zu entfernen reicht nicht. Die Zugangsdaten muessen widerrufen und neu generiert werden.

## Verwandte Skills

- `configure-git-repository` - Ordnungsgemaesse .gitignore-Einrichtung
- `write-claude-md` - Sicherheitsanforderungen dokumentieren
- `setup-gxp-r-project` - Sicherheit in regulierten Umgebungen
