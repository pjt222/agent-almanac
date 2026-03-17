---
name: setup-github-actions-ci
description: >
  Configurar GitHub Actions CI/CD para paquetes R, incluyendo R CMD check
  en múltiples plataformas, informes de cobertura de pruebas y despliegue
  del sitio pkgdown. Usa r-lib/actions para flujos de trabajo estándar.
  Usar al configurar CI/CD para un nuevo paquete R, añadir pruebas
  multiplataforma a un paquete existente, configurar el despliegue automático
  del sitio pkgdown, o añadir informes de cobertura de código a un repositorio.
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
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, github-actions, ci-cd, testing, automation
---

# Configurar GitHub Actions CI para Paquetes R

Configurar R CMD check automatizado, cobertura de pruebas y despliegue de documentación mediante GitHub Actions.

## Cuándo Usar

- Configurar CI/CD para un nuevo paquete R en GitHub
- Añadir pruebas multiplataforma a un paquete existente
- Configurar el despliegue automático del sitio pkgdown
- Añadir informes de cobertura de código

## Entradas

- **Obligatorio**: Paquete R con DESCRIPTION válido y pruebas
- **Obligatorio**: Repositorio de GitHub (público o privado)
- **Opcional**: Si incluir el despliegue de pkgdown (predeterminado: no)
- **Opcional**: Si incluir informes de cobertura (predeterminado: no)

## Procedimiento

### Paso 1: Crear el Flujo de Trabajo de R CMD Check

Crear `.github/workflows/R-CMD-check.yaml`:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

name: R-CMD-check

permissions: read-all

jobs:
  R-CMD-check:
    runs-on: ${{ matrix.config.os }}

    name: ${{ matrix.config.os }} (${{ matrix.config.r }})

    strategy:
      fail-fast: false
      matrix:
        config:
          - {os: macos-latest, r: 'release'}
          - {os: windows-latest, r: 'release'}
          - {os: ubuntu-latest, r: 'devel', http-user-agent: 'release'}
          - {os: ubuntu-latest, r: 'release'}
          - {os: ubuntu-latest, r: 'oldrel-1'}

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}
      R_KEEP_PKG_SOURCE: yes

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-pandoc@v2

      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: ${{ matrix.config.r }}
          http-user-agent: ${{ matrix.config.http-user-agent }}
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::rcmdcheck
          needs: check

      - uses: r-lib/actions/check-r-package@v2
        with:
          upload-snapshots: true
          build_args: 'c("--no-manual", "--compact-vignettes=gs+qpdf")'
```

**Esperado:** Archivo de flujo de trabajo `.github/workflows/R-CMD-check.yaml` creado con una matriz multiplataforma (macOS, Windows, Ubuntu) que cubre release, devel y oldrel.

**En caso de fallo:** Si el directorio `.github/workflows/` no existe, crearlo con `mkdir -p .github/workflows`. Verificar la sintaxis YAML con un validador YAML.

### Paso 2: Crear el Flujo de Trabajo de Cobertura de Pruebas (Opcional)

Crear `.github/workflows/test-coverage.yaml`:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

name: test-coverage

permissions: read-all

jobs:
  test-coverage:
    runs-on: ubuntu-latest

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::covr, any::xml2
          needs: coverage

      - name: Test coverage
        run: |
          cov <- covr::package_coverage(
            quiet = FALSE,
            clean = FALSE,
            install_path = file.path(normalizePath(Sys.getenv("RUNNER_TEMP"), winslash = "/"), "package")
          )
          covr::to_cobertura(cov)
        shell: Rscript {0}

      - uses: codecov/codecov-action@v4
        with:
          fail_ci_if_error: ${{ github.event_name != 'pull_request' && true || false }}
          file: ./cobertura.xml
          plugin: noop
          token: ${{ secrets.CODECOV_TOKEN }}
```

**Esperado:** Archivo de flujo de trabajo `.github/workflows/test-coverage.yaml` creado. Los informes de cobertura se subirán a Codecov en cada push y PR.

**En caso de fallo:** Si la subida a Codecov falla, verificar que el secreto `CODECOV_TOKEN` está configurado en los ajustes del repositorio. Para repositorios públicos, el token puede ser opcional.

### Paso 3: Crear el Flujo de Trabajo de Despliegue pkgdown (Opcional)

Crear `.github/workflows/pkgdown.yaml`:

```yaml
on:
  push:
    branches: [main, master]
  release:
    types: [published]
  workflow_dispatch:

name: pkgdown

permissions:
  contents: write
  pages: write

jobs:
  pkgdown:
    runs-on: ubuntu-latest

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-pandoc@v2

      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::pkgdown, local::.
          needs: website

      - name: Build site
        run: pkgdown::build_site_github_pages(new_process = FALSE, install = FALSE)
        shell: Rscript {0}

      - name: Deploy to GitHub pages
        if: github.event_name != 'pull_request'
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          clean: false
          branch: gh-pages
          folder: docs
```

**Esperado:** Archivo de flujo de trabajo `.github/workflows/pkgdown.yaml` creado. El sitio se compila y despliega en la rama `gh-pages` al hacer push a main o al publicar una versión.

**En caso de fallo:** Si el despliegue falla, asegurarse de que el repositorio tiene habilitados los permisos `contents: write`. Verificar que `_pkgdown.yml` tiene `development: mode: release` configurado.

### Paso 4: Añadir Insignia de Estado al README

Añadir a `README.md`:

```markdown
[![R-CMD-check](https://github.com/USERNAME/REPO/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/R-CMD-check.yaml)
```

**Esperado:** El README muestra una insignia de estado de CI activa que se actualiza automáticamente tras cada ejecución del flujo de trabajo.

**En caso de fallo:** Si la insignia muestra "no status", verificar que el nombre del archivo de flujo de trabajo en la URL de la insignia coincide con el archivo real. Hacer un push para activar la primera ejecución del flujo.

### Paso 5: Configurar los Ajustes del Repositorio de GitHub

1. Activar GitHub Pages (Configuración > Pages) apuntando a la rama `gh-pages` si se usa pkgdown
2. Añadir el secreto `CODECOV_TOKEN` si se usa informes de cobertura
3. Asegurarse de que `GITHUB_TOKEN` tiene los permisos apropiados

**Esperado:** GitHub Pages está configurado para el despliegue de pkgdown. Los secretos requeridos están configurados. Los permisos del token son suficientes para los flujos de trabajo.

**En caso de fallo:** Si el despliegue de Pages falla, revisar Configuración > Pages para asegurarse de que la fuente está configurada en la rama `gh-pages`. Si faltan secretos, añadirlos en Configuración > Secretos y variables > Actions.

### Paso 6: Hacer Push y Verificar

```bash
git add .github/
git commit -m "Add GitHub Actions CI workflows"
git push
```

Revisar la pestaña Actions en GitHub para verificar que los flujos de trabajo se ejecutan correctamente.

**Esperado:** Marcas de verificación verdes en todos los trabajos de la pestaña de GitHub Actions. Los flujos de trabajo se activan tanto en eventos de push como de PR.

**En caso de fallo:** Revisar los registros del flujo de trabajo en la pestaña Actions. Problemas frecuentes: dependencias de sistema faltantes (añadir a `extra-packages`), fallos en la compilación de viñetas (asegurarse de que el paso de configuración de pandoc está presente), errores de sintaxis YAML.

## Validación

- [ ] R CMD check pasa en todas las plataformas de la matriz
- [ ] Se genera el informe de cobertura (si está configurado)
- [ ] El sitio pkgdown se despliega (si está configurado)
- [ ] La insignia de estado aparece en el README
- [ ] Los flujos de trabajo se activan tanto en push como en PR

## Errores Comunes

- **Falta `permissions`**: GitHub Actions ahora requiere permisos explícitos. Añadir `permissions: read-all` como mínimo
- **Dependencias de sistema**: Algunos paquetes R necesitan bibliotecas del sistema. Usar `r-lib/actions/setup-r-dependencies` que gestiona la mayoría de los casos
- **Viñetas sin pandoc**: Incluir siempre `r-lib/actions/setup-pandoc@v2`
- **Modo de desarrollo de pkgdown**: Asegurarse de que `_pkgdown.yml` tiene `development: mode: release` para GitHub Pages
- **Problemas de caché**: `r-lib/actions/setup-r-dependencies` gestiona la caché automáticamente

## Habilidades Relacionadas

- `create-r-package` - configuración inicial del paquete incluyendo flujo de trabajo CI
- `build-pkgdown-site` - configuración detallada de pkgdown
- `submit-to-cran` - las verificaciones de CI deben reflejar las expectativas de CRAN
- `release-package-version` - activar el despliegue al publicar una versión
