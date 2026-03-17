---
name: build-ci-cd-pipeline
description: >
  Mehrstufige CI/CD-Pipelines mit GitHub Actions entwerfen und implementieren — mit
  Matrix-Builds, Dependency-Caching, Artefaktverwaltung und Secret-Behandlung. Workflows
  erstellen, die Linting, Tests, Build und Deployment mit Parallelausfuehrung und
  bedingter Logik abdecken. Einsatz beim Einrichten automatisierter Tests und Deployments
  fuer neue Projekte, bei der Migration von Jenkins oder CircleCI zu GitHub Actions,
  beim Implementieren von Matrix-Builds ueber Plattformen hinweg, beim Hinzufuegen von
  Build-Caching oder beim Erstellen mehrstufiger Pipelines mit Sicherheits-Scans und
  Quality-Gates.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: ci-cd, github-actions, pipeline, automation, testing
---

# CI/CD-Pipeline aufbauen

Produktionsreife Pipelines fuer kontinuierliche Integration und Deployment mit GitHub Actions entwerfen und implementieren.

## Wann verwenden

- Automatisierte Tests und Deployments fuer ein neues Projekt einrichten
- Von Jenkins, Travis CI oder CircleCI zu GitHub Actions migrieren
- Matrix-Builds ueber mehrere Plattformen oder Sprachversionen implementieren
- Build-Caching hinzufuegen, um die CI/CD-Ausfuehrungszeit zu verkuerzen
- Mehrstufige Pipelines mit umgebungsspezifischen Deployments erstellen
- Sicherheits-Scans und Code-Quality-Gates implementieren

## Eingaben

- **Erforderlich**: Repository mit zu testendem/bauendem/deployen Code
- **Erforderlich**: GitHub Actions-Workflow-Verzeichnis (`.github/workflows/`)
- **Optional**: Secrets fuer Deployment-Ziele (AWS, Azure, Docker-Registries)
- **Optional**: Self-hosted-Runner-Konfiguration fuer spezialisierte Builds
- **Optional**: Branch-Schutzregeln und erforderliche Statuspruefungen

## Vorgehensweise

### Schritt 1: Grundlegende Workflow-Struktur erstellen

`.github/workflows/ci.yml` mit Trigger-Konfiguration und grundlegender Job-Struktur anlegen.

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:  # Manual trigger

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check
```

**Erwartet:** Workflow-Datei mit korrekter YAML-Syntax erstellt, Trigger konfiguriert und grundlegender Lint-Job definiert.

**Bei Fehler:** YAML-Syntax mit `yamllint .github/workflows/ci.yml` pruefen. Einrueckung pruefen (Leerzeichen, keine Tabs). Aktionsversionen im GitHub Marketplace auf Aktualitaet pruefen.

### Schritt 2: Matrix-Build-Strategie implementieren

Matrix-Builds hinzufuegen, um ueber mehrere Plattformen, Sprachversionen oder Konfigurationen zu testen.

```yaml
  test:
    name: Test (${{ matrix.os }}, Node ${{ matrix.node }})
    runs-on: ${{ matrix.os }}
    needs: lint
    strategy:
      fail-fast: false  # Continue testing other matrix combinations on failure
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: ['16', '18', '20']
        exclude:
          - os: macos-latest
            node: '16'  # Skip old Node on macOS

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        if: matrix.os == 'ubuntu-latest' && matrix.node == '18'
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

**Erwartet:** Matrix erzeugt 8 parallele Jobs (3 OS x 3 Node-Versionen - 1 Ausschluss). Alle Tests bestehen plattformubergreifend. Coverage-Bericht wird von einem einzigen kanonischen Job hochgeladen.

**Bei Fehler:** Bei Matrix-Syntaxfehlern korrekte Einrueckung und Array-Notation pruefen. Bei instabilen Tests Retry-Logik mit `uses: nick-invision/retry@v2` hinzufuegen. Bei plattformspezifischen Fehlern OS-Konditionale oder Ausschluesse erweitern.

### Schritt 3: Dependency-Caching und Artefaktverwaltung konfigurieren

Build-Geschwindigkeit mit intelligentem Caching optimieren und Build-Artefakte sichern.

```yaml
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Cache build output
        uses: actions/cache@v3
        with:
          path: |
            .next/cache
            dist/
            build/
          key: ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json') }}-
            ${{ runner.os }}-build-

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-${{ github.sha }}
          path: |
            dist/
            build/
          retention-days: 7
          if-no-files-found: error
```

**Erwartet:** Erster Durchlauf laedt Abhaengigkeiten herunter (langsam), folgende Durchlaeufe stellen aus dem Cache wieder her (schnell). Build-Artefakte werden erfolgreich mit eindeutiger SHA-basierter Benennung hochgeladen.

**Bei Fehler:** Bei haeufigen Cache-Misses pruefen, ob der Cache-Key alle relevanten Datei-Hashes enthaelt. Bei Upload-Fehlern pruefen, ob der Pfad vorhanden ist und Glob-Muster mit der tatsaechlichen Build-Ausgabe uebereinstimmen.

### Schritt 4: Sicherheits-Scans und Quality-Gates implementieren

Sicherheitsschwachstellen-Scans und Code-Quality-Durchsetzung hinzufuegen.

```yaml
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: lint
    permissions:
      security-events: write  # Required for uploading SARIF results
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()  # Upload even if scan finds vulnerabilities
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Dependency audit
        run: npm audit --audit-level=high
        continue-on-error: true  # Don't fail build, but show warnings

      - name: Check for leaked secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

**Erwartet:** Sicherheits-Scans abgeschlossen, Ergebnisse in den GitHub-Security-Tab hochgeladen. Kritische Schwachstellen blockieren den Merge, wenn Branch-Schutz konfiguriert ist. Keine Secrets in Commits erkannt.

**Bei Fehler:** Fuer falsch-positive Ergebnisse eine `.trivyignore`-Datei mit CVE-IDs und Begruendungen erstellen. Bei Audit-Fehlern `npm audit fix`-Vorschlaege pruefen.

### Schritt 5: Umgebungsspezifische Deployments konfigurieren

Deployment-Stufen mit Umgebungsschutzregeln und Genehmigungsprozessen einrichten.

```yaml
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, security]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist-${{ github.sha }}
          path: ./dist

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_STAGING }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: |
          aws s3 sync ./dist s3://${{ secrets.S3_BUCKET_STAGING }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_STAGING }} --paths "/*"

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, security]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist-${{ github.sha }}
          path: ./dist

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_PRODUCTION }}
          aws-region: us-east-1

      - name: Deploy to S3 with blue-green
        run: |
          # Deploy to new version
          aws s3 sync ./dist s3://${{ secrets.S3_BUCKET_PRODUCTION }}/releases/${{ github.sha }} --delete

          # Update symlink to new version
          aws s3 cp s3://${{ secrets.S3_BUCKET_PRODUCTION }}/releases/${{ github.sha }} s3://${{ secrets.S3_BUCKET_PRODUCTION }}/current --recursive

          # Invalidate CloudFront
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_PRODUCTION }} --paths "/*"

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: ./dist/**/*
          generate_release_notes: true
```

**Erwartet:** Staging wird automatisch auf dem develop-Branch deployed. Production erfordert manuelle Genehmigung (in GitHub-Umgebungseinstellungen konfiguriert). CloudFront-Invalidierung loescht den CDN-Cache. Release wird fuer getaggte Commits erstellt.

**Bei Fehler:** Bei AWS-Credential-Fehlern die OIDC-Vertrauensbeziehung fuer `role-to-assume` pruefen. Bei S3-Sync-Fehlern Bucket-Richtlinien und IAM-Berechtigungen pruefen.

### Schritt 6: Benachrichtigungs- und Monitoring-Integration hinzufuegen

Slack-Benachrichtigungen, Deployment-Tracking und Performance-Monitoring integrieren.

```yaml
  notify:
    name: Notify Results
    runs-on: ubuntu-latest
    needs: [deploy-staging, deploy-production]
    if: always()  # Run even if previous jobs fail
    steps:
      - name: Check job status
        id: status
        run: |
          if [ "${{ needs.deploy-production.result }}" == "success" ]; then
            echo "status=success" >> $GITHUB_OUTPUT
            echo "color=#00FF00" >> $GITHUB_OUTPUT
          else
            echo "status=failure" >> $GITHUB_OUTPUT
            echo "color=#FF0000" >> $GITHUB_OUTPUT
          fi

      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "Deployment ${{ steps.status.outputs.status }}",
              "blocks": [
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "🚀 Deployment Status: ${{ steps.status.outputs.status }}"
                  }
                },
                {
                  "type": "section",
                  "fields": [
                    {"type": "mrkdwn", "text": "*Repository:*\n${{ github.repository }}"},
                    {"type": "mrkdwn", "text": "*Branch:*\n${{ github.ref_name }}"},
                    {"type": "mrkdwn", "text": "*Commit:*\n${{ github.sha }}"},
                    {"type": "mrkdwn", "text": "*Actor:*\n${{ github.actor }}"}
                  ]
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {"type": "plain_text", "text": "View Workflow"},
                      "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK

      - name: Record deployment in Datadog
        if: steps.status.outputs.status == 'success'
        run: |
          curl -X POST "https://api.datadoghq.com/api/v1/events" \
            -H "Content-Type: application/json" \
            -H "DD-API-KEY: ${{ secrets.DD_API_KEY }}" \
            -d @- <<EOF
          {
            "title": "Deployment: ${{ github.repository }}",
            "text": "Deployed commit ${{ github.sha }} to production",
            "tags": ["env:production", "service:${{ github.event.repository.name }}"],
            "alert_type": "info"
          }
          EOF
```

**Erwartet:** Slack erhaelt eine formatierte Benachrichtigung mit Deployment-Status, Repository-Details und einem klickbaren Workflow-Link. Datadog-Ereignis wird fuer erfolgreiche Production-Deployments mit entsprechenden Tags protokolliert.

**Bei Fehler:** Bei Slack-Fehlern pruefen, ob die Webhook-URL gueltig ist. Mit `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'` testen.

## Validierung

- [ ] Workflow-Syntax wird mit `yamllint` oder dem GitHub-Workflow-Editor validiert
- [ ] Alle Jobs haben explizite Abhaengigkeiten (`needs:`) zur Steuerung der Ausfuehrungsreihenfolge
- [ ] Matrix-Builds decken alle Zielplattformen und Versionen ab
- [ ] Caching reduziert die Build-Zeit bei nachfolgenden Laeufen um >50%
- [ ] Secrets sind in GitHub Secrets gespeichert, niemals hartcodiert in Workflow-Dateien
- [ ] Sicherheits-Scans laden Ergebnisse in den GitHub-Security-Tab hoch
- [ ] Umgebungsschutzregeln erfordern Genehmigung fuer Production-Deployments
- [ ] Fehlgeschlagene Deployments lassen das System nicht in einem inkonsistenten Zustand zurueck
- [ ] Benachrichtigungen erreichen geeignete Kanaele (Slack, E-Mail, Monitoring-Tools)
- [ ] Workflow wird fuer typische Aenderungen in unter 10 Minuten abgeschlossen

## Haeufige Stolperfallen

- **Cache-Key zu weit gefasst**: `${{ runner.os }}-build-` als Cache-Key verursacht falsche Treffer, wenn sich Abhaengigkeiten aendern. `hashFiles('**/package-lock.json')` in den Key aufnehmen.

- **Artefaktnamen-Kollisionen**: Statische Artefaktnamen wie `dist` verursachen Ueberschreibungen bei gleichzeitigen Builds. `${{ github.sha }}` oder `${{ matrix.os }}-${{ matrix.node }}` in Namen aufnehmen.

- **Secrets in Logs**: `echo $SECRET` und aehnliche Befehle vermeiden. GitHub maskiert registrierte Secrets, aber abgeleitete Werte koennen durchsickern. `::add-mask::` fuer dynamische Secrets verwenden.

- **Unzureichende Berechtigungen**: Standard-`GITHUB_TOKEN` hat eingeschraenkte Berechtigungen. Expliziten `permissions:`-Block fuer Security-Events, Pakete, Issues usw. hinzufuegen.

- **Fehlende if-Konditionale**: Jobs laufen bei allen Triggern, wenn nicht mit `if: github.ref == 'refs/heads/main'` gesichert. Versehentliche Production-Deploys aus PRs verhindern.

- **Keine Rollback-Strategie**: Deployment-Fehler lassen das System in einem defekten Zustand. Blue-Green- oder Canary-Deployments mit automatischem Rollback bei Health-Check-Fehlern implementieren.

- **Hartcodierte Werte**: Workflow enthaelt umgebungsspezifische URLs, Bucket-Namen oder API-Endpunkte. Umgebungsvariablen und GitHub Secrets verwenden.

- **Keine Timeout-Limits**: Jobs haengen bei Netzwerkproblemen oder Endlosschleifen unbegrenzt. Zu allen Jobs `timeout-minutes: 15` hinzufuegen.

## Verwandte Skills

- `setup-github-actions-ci` - Erste GitHub Actions-Konfiguration fuer R-Pakete und einfache Projekte
- `commit-changes` - Korrekte Git-Workflow-Integration mit CI/CD-Triggern
- `configure-git-repository` - Repository-Einstellungen und Branch-Schutzregeln
- `setup-container-registry` - Docker-Image-Builds in CI/CD-Pipelines
- `implement-gitops-workflow` - ArgoCD/Flux-Integration mit CI/CD
