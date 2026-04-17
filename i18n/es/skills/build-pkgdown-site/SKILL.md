---
name: build-pkgdown-site
description: >
  Compilar y desplegar un sitio de documentación pkgdown para un paquete R
  en GitHub Pages. Cubre la configuración de _pkgdown.yml, temas, organización
  de artículos, personalización del índice de referencia y métodos de
  despliegue. Usar al crear un sitio de documentación para un paquete nuevo
  o existente, personalizar la disposición o la navegación, corregir errores
  404 en un sitio desplegado, o migrar entre métodos de despliegue basados
  en ramas y GitHub Actions.
locale: es
source_locale: en
source_commit: acc252e6
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
  tags: r, pkgdown, documentation, github-pages, website
---

# Compilar Sitio pkgdown

Configurar y desplegar un sitio web de documentación pkgdown para un paquete R.

## Cuándo Usar

- Crear un sitio de documentación para un paquete R
- Personalizar la disposición, el tema o la navegación de pkgdown
- Corregir errores 404 en un sitio pkgdown desplegado
- Migrar entre métodos de despliegue

## Entradas

- **Obligatorio**: Paquete R con documentación roxygen2
- **Obligatorio**: Repositorio de GitHub
- **Opcional**: Tema o marca personalizada
- **Opcional**: Viñetas a incluir como artículos

## Procedimiento

### Paso 1: Inicializar pkgdown

```r
usethis::use_pkgdown()
```

Esto crea `_pkgdown.yml` y añade pkgdown a `.Rbuildignore`.

**Esperado:** `_pkgdown.yml` existe en la raíz del proyecto. `.Rbuildignore` contiene entradas relacionadas con pkgdown.

**En caso de fallo:** Instalar pkgdown con `install.packages("pkgdown")`. Si `_pkgdown.yml` ya existe, la función actualizará `.Rbuildignore` sin sobrescribir la configuración.

### Paso 2: Configurar `_pkgdown.yml`

```yaml
url: https://username.github.io/packagename/

development:
  mode: release

template:
  bootstrap: 5
  bootswatch: flatly

navbar:
  structure:
    left: [intro, reference, articles, news]
    right: [search, github]
  components:
    github:
      icon: fa-github
      href: https://github.com/username/packagename

reference:
  - title: Core Functions
    desc: Primary package functionality
    contents:
      - main_function
      - helper_function
  - title: Utilities
    desc: Helper and utility functions
    contents:
      - starts_with("util_")

articles:
  - title: Getting Started
    contents:
      - getting-started
  - title: Advanced Usage
    contents:
      - advanced-features
      - customization
```

**Crítico**: Configurar `development: mode: release`. El `mode: auto` predeterminado provoca errores 404 en GitHub Pages porque añade `/dev/` a las URLs.

**Esperado:** `_pkgdown.yml` contiene YAML válido con secciones `url`, `template`, `navbar`, `reference` y `articles` apropiadas para el paquete.

**En caso de fallo:** Validar la sintaxis YAML con un validador YAML en línea. Asegurarse de que todos los nombres de funciones en `reference.contents` coinciden con funciones exportadas reales.

### Paso 3: Compilar Localmente

```r
pkgdown::build_site()
```

**Esperado:** Directorio `docs/` creado con un sitio completo incluyendo `index.html`, páginas de referencia de funciones y artículos.

**En caso de fallo:** Problemas frecuentes: pandoc faltante (configurar `RSTUDIO_PANDOC` en `.Renviron`), dependencias de viñetas faltantes (instalar paquetes sugeridos), o ejemplos rotos (corregir o envolver en `\dontrun{}`).

### Paso 4: Previsualizar el Sitio

```r
pkgdown::preview_site()
```

Verificar que la navegación, la referencia de funciones, los artículos y la búsqueda funcionan correctamente.

**Esperado:** El sitio se abre en el navegador en localhost. Todos los enlaces de navegación funcionan, las páginas de referencia de funciones se renderizan y la búsqueda devuelve resultados.

**En caso de fallo:** Si la previsualización no se abre, abrir manualmente `docs/index.html` en un navegador. Si faltan páginas, verificar que se ejecutó `devtools::document()` antes de compilar el sitio.

### Paso 5: Desplegar en GitHub Pages

**Método A: GitHub Actions (Recomendado)**

Ver la habilidad `setup-github-actions-ci` para el flujo de trabajo pkgdown.

**Método B: Despliegue Manual por Rama**

```bash
# Compilar el sitio
Rscript -e "pkgdown::build_site()"

# Crear la rama gh-pages si no existe
git checkout --orphan gh-pages
git rm -rf .
cp -r docs/* .
git add .
git commit -m "Deploy pkgdown site"
git push origin gh-pages

# Volver a main
git checkout main
```

**Esperado:** La rama `gh-pages` existe en el remoto con los archivos del sitio en el nivel raíz.

**En caso de fallo:** Si el push es rechazado, asegurarse de tener acceso de escritura al repositorio. Si se usa el despliegue con GitHub Actions, omitir este paso y seguir la habilidad `setup-github-actions-ci`.

### Paso 6: Configurar GitHub Pages

1. Ir a Configuración del repositorio > Pages
2. Establecer la Fuente en "Deploy from a branch"
3. Seleccionar la rama `gh-pages`, carpeta `/ (root)`
4. Guardar

**Esperado:** Sitio disponible en `https://username.github.io/packagename/` en pocos minutos.

**En caso de fallo:** Si el sitio devuelve 404, verificar que la fuente de Pages coincide con el método de despliegue (el despliegue por rama requiere "Deploy from a branch"). Comprobar que `development: mode: release` está configurado en `_pkgdown.yml`.

### Paso 7: Añadir URL a DESCRIPTION

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**Esperado:** El campo `URL` de DESCRIPTION contiene tanto la URL del sitio pkgdown como la URL del repositorio de GitHub, separadas por una coma.

**En caso de fallo:** Si `R CMD check` advierte sobre URLs inválidas, verificar que el sitio pkgdown está realmente desplegado y accesible antes de añadir la URL.

## Validación

- [ ] El sitio se compila localmente sin errores
- [ ] Todas las páginas de referencia de funciones se renderizan correctamente
- [ ] Los artículos y viñetas son accesibles y se renderizan correctamente
- [ ] La funcionalidad de búsqueda funciona
- [ ] Los enlaces de navegación son correctos
- [ ] El sitio se despliega con éxito en GitHub Pages
- [ ] Sin errores 404 en el sitio desplegado
- [ ] `development: mode: release` está configurado en `_pkgdown.yml`

## Errores Comunes

- **Errores 404 tras el despliegue**: Casi siempre causados por `development: mode: auto` (el predeterminado). Cambiar a `mode: release`.
- **Páginas de referencia faltantes**: Las funciones deben estar exportadas y documentadas. Ejecutar primero `devtools::document()`.
- **Enlaces de viñetas rotos**: Usar la sintaxis `vignette("name")` en referencias cruzadas, no rutas de archivo.
- **Logo no visible**: Colocar el logo en `man/figures/logo.png` y referenciarlo en `_pkgdown.yml`.
- **Búsqueda no funciona**: Requiere que el campo `url` en `_pkgdown.yml` esté correctamente configurado.

- **Binario R incorrecto en sistemas híbridos**: En WSL o Docker, `Rscript` puede resolverse a un contenedor multiplataforma en lugar de R nativo. Comprueba con `which Rscript && Rscript --version`. Prefiere el binario R nativo (p. ej., `/usr/local/bin/Rscript` en Linux/WSL) para mayor fiabilidad. Consulta [Setting Up Your Environment](../../guides/setting-up-your-environment.md) para la configuración de la ruta de R.

## Habilidades Relacionadas

- `setup-github-actions-ci` - flujo de trabajo de despliegue automatizado de pkgdown
- `write-roxygen-docs` - documentación de funciones que aparece en el sitio
- `write-vignette` - artículos que aparecen en la navegación del sitio
- `release-package-version` - activar la recompilación del sitio al publicar una versión
