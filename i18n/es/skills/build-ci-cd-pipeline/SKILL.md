---
name: build-ci-cd-pipeline
description: >
  Diseña e implementa pipelines de CI/CD multietapa usando GitHub Actions con construcciones
  matriciales, caché de dependencias, gestión de artefactos y manejo de secretos. Crea flujos
  de trabajo que abarcan etapas de linting, pruebas, construcción y despliegue con ejecución
  paralela y lógica condicional. Útil al configurar pruebas y despliegues automáticos para un
  proyecto nuevo, migrar de Jenkins o CircleCI a GitHub Actions, implementar construcciones
  matriciales entre plataformas, agregar caché de compilación, o crear pipelines multietapa
  con análisis de seguridad y puertas de calidad.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
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

# Construir Pipeline CI/CD

Diseña e implementa pipelines de integración y despliegue continuo de nivel productivo con GitHub Actions.

## Cuándo Usar

- Al configurar pruebas y despliegues automáticos para un proyecto nuevo
- Al migrar de Jenkins, Travis CI o CircleCI a GitHub Actions
- Al implementar construcciones matriciales en múltiples plataformas o versiones de lenguaje
- Al agregar caché de compilación para acelerar el tiempo de ejecución de CI/CD
- Al crear pipelines multietapa con despliegues específicos por entorno
- Al implementar análisis de seguridad y puertas de calidad de código

## Entradas

- **Requerido**: Repositorio con código para probar/construir/desplegar
- **Requerido**: Directorio de flujos de trabajo de GitHub Actions (`.github/workflows/`)
- **Opcional**: Secretos para destinos de despliegue (AWS, Azure, registros Docker)
- **Opcional**: Configuración de ejecutores autohospedados para construcciones especializadas
- **Opcional**: Reglas de protección de rama y verificaciones de estado requeridas

## Procedimiento

### Paso 1: Crear la Estructura Base del Flujo de Trabajo

Crea `.github/workflows/ci.yml` con la configuración de disparadores y la estructura básica de trabajos.

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

**Esperado:** Archivo de flujo de trabajo creado con sintaxis YAML correcta, disparadores configurados y trabajo básico de lint definido.

**En caso de fallo:** Valida la sintaxis YAML con `yamllint .github/workflows/ci.yml`. Comprueba la indentación (usa espacios, no tabuladores). Verifica que las versiones de acciones sean actuales revisando el Marketplace de GitHub.

### Paso 2: Implementar la Estrategia de Construcción Matricial

Agrega construcciones matriciales para probar en múltiples plataformas, versiones de lenguaje o configuraciones.

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

**Esperado:** La matriz genera 8 trabajos paralelos (3 SO × 3 versiones de Node - 1 exclusión). Todas las pruebas pasan entre plataformas. El informe de cobertura se sube desde un único trabajo canónico.

**En caso de fallo:** Si ocurren errores de sintaxis matricial, verifica la indentación correcta y la notación de arrays. Para pruebas inestables, agrega lógica de reintento con `uses: nick-invision/retry@v2`. Para fallos específicos de plataforma, agrega condicionales de SO o amplía las exclusiones.

### Paso 3: Configurar el Caché de Dependencias y la Gestión de Artefactos

Optimiza la velocidad de compilación con caché inteligente y preserva los artefactos de construcción.

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

**Esperado:** La primera ejecución descarga dependencias (lenta), las ejecuciones posteriores restauran desde caché (rápida). Los artefactos de construcción se suben exitosamente con nombres únicos basados en SHA.

**En caso de fallo:** Si el caché falla frecuentemente, verifica que la clave incluya todos los hashes de archivos relevantes. Para fallos de subida, comprueba que la ruta existe y los patrones glob coinciden con la salida real. Verifica que `retention-days` cumple las políticas de la organización.

### Paso 4: Implementar Análisis de Seguridad y Puertas de Calidad

Agrega análisis de vulnerabilidades de seguridad y aplicación de calidad de código.

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

**Esperado:** Los análisis de seguridad se completan y los resultados se suben a la pestaña de Seguridad de GitHub. Las vulnerabilidades críticas bloquean la fusión si la protección de rama está configurada. No se detectan secretos en los commits.

**En caso de fallo:** Para falsos positivos, crea el archivo `.trivyignore` con IDs de CVE y justificaciones. Para fallos de auditoría, revisa las sugerencias de `npm audit fix`. Para falsos positivos de detección de secretos, agrega patrones a la lista de exclusión de `.trufflehog.yml`.

### Paso 5: Configurar Despliegues Específicos por Entorno

Configura etapas de despliegue con reglas de protección de entorno y puertas de aprobación.

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

**Esperado:** Staging se despliega automáticamente en la rama develop. Producción requiere aprobación manual (configurada en la configuración de Entornos de GitHub). La invalidación de CloudFront borra el caché de CDN. Se crea un release para los commits etiquetados.

**En caso de fallo:** Para errores de credenciales AWS, verifica que la relación de confianza OIDC permita `role-to-assume`. Para fallos de sincronización S3, comprueba las políticas de bucket y los permisos IAM. Para problemas de aprobación de entorno, verifica las reglas de protección en Configuración > Entornos.

### Paso 6: Agregar Notificaciones e Integración de Monitoreo

Integra notificaciones de Slack, seguimiento de despliegues y monitoreo de rendimiento.

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

**Esperado:** Slack recibe una notificación formateada con el estado del despliegue, detalles del repositorio y un enlace clicable al flujo de trabajo. El evento de Datadog se registra para despliegues exitosos a producción con las etiquetas apropiadas.

**En caso de fallo:** Para fallos de Slack, verifica que la URL del webhook sea válida y que el espacio de trabajo permita webhooks entrantes. Prueba con `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'`. Para fallos de Datadog, verifica que la clave API tenga permisos de envío de eventos.

## Validación

- [ ] La sintaxis del flujo de trabajo se valida con `yamllint` o el editor de flujos de trabajo de GitHub
- [ ] Todos los trabajos tienen dependencias explícitas (`needs:`) para controlar el orden de ejecución
- [ ] Las construcciones matriciales cubren todas las plataformas y versiones de destino
- [ ] El caché reduce el tiempo de construcción en más del 50% en ejecuciones posteriores
- [ ] Los secretos se almacenan en Secretos de GitHub, nunca codificados en los archivos de flujo de trabajo
- [ ] Los análisis de seguridad suben resultados a la pestaña de Seguridad de GitHub
- [ ] Las reglas de protección de entorno requieren aprobación para despliegues a producción
- [ ] Los despliegues fallidos no dejan el sistema en un estado inconsistente
- [ ] Las notificaciones llegan a los canales apropiados (Slack, correo, herramientas de monitoreo)
- [ ] El flujo de trabajo se completa en menos de 10 minutos para cambios típicos

## Errores Comunes

- **Clave de caché demasiado amplia**: Usar `${{ runner.os }}-build-` como clave de caché causa aciertos falsos cuando cambian las dependencias. Incluye `hashFiles('**/package-lock.json')` en la clave.

- **Colisiones de nombres de artefactos**: Usar nombres estáticos de artefactos como `dist` causa sobreescrituras en construcciones concurrentes. Incluye `${{ github.sha }}` o `${{ matrix.os }}-${{ matrix.node }}` en los nombres.

- **Secretos en registros**: Evita `echo $SECRET` u comandos similares. GitHub enmascara los secretos registrados, pero los valores derivados pueden filtrarse. Usa `::add-mask::` para secretos dinámicos.

- **Permisos insuficientes**: El `GITHUB_TOKEN` predeterminado tiene permisos limitados. Agrega un bloque explícito `permissions:` para eventos de seguridad, paquetes, issues, etc.

- **Condicionales faltantes**: Los trabajos se ejecutan en todos los disparadores a menos que estén protegidos con `if: github.ref == 'refs/heads/main'`. Previene despliegues accidentales a producción desde PRs.

- **Sin estrategia de reversión**: Los fallos de despliegue dejan el sistema en estado roto. Implementa despliegues azul-verde o canary con reversión automática ante fallos en las verificaciones de salud.

- **Valores codificados**: El flujo de trabajo contiene URLs, nombres de bucket o endpoints de API específicos del entorno. Usa variables de entorno y Secretos de GitHub.

- **Sin límites de tiempo de espera**: Los trabajos se cuelgan indefinidamente en problemas de red o bucles infinitos. Agrega `timeout-minutes: 15` a todos los trabajos.

## Habilidades Relacionadas

- `setup-github-actions-ci` - Configuración inicial de GitHub Actions para paquetes R y proyectos básicos
- `commit-changes` - Integración correcta del flujo de trabajo Git con disparadores de CI/CD
- `configure-git-repository` - Configuración del repositorio y reglas de protección de rama
- `setup-container-registry` - Construcciones de imágenes Docker en pipelines CI/CD
- `implement-gitops-workflow` - Integración de ArgoCD/Flux con CI/CD
