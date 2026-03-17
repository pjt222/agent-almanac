---
name: manage-renv-dependencies
description: >
  Gestionar dependencias de paquetes R usando renv para entornos reproducibles.
  Cubre la inicialización, el flujo de trabajo snapshot/restore, la resolución
  de problemas comunes y la integración con CI/CD. Usar al inicializar la
  gestión de dependencias para un nuevo proyecto R, añadir o actualizar
  paquetes, restaurar un entorno en una nueva máquina, resolver fallos de
  restauración de renv, o integrar renv con pipelines de CI/CD.
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
  tags: r, renv, dependencies, reproducibility, lockfile
---

# Gestionar Dependencias con renv

Configurar y mantener entornos de paquetes R reproducibles usando renv.

## Cuándo Usar

- Inicializar la gestión de dependencias para un nuevo proyecto R
- Añadir o actualizar dependencias de paquetes
- Restaurar el entorno de un proyecto en una nueva máquina
- Resolver fallos de restauración de renv
- Integrar renv con pipelines de CI/CD

## Entradas

- **Obligatorio**: Directorio del proyecto R
- **Opcional**: Archivo `renv.lock` existente (para restauración)
- **Opcional**: PAT de GitHub para paquetes privados

## Procedimiento

### Paso 1: Inicializar renv

```r
renv::init()
```

Esto crea:
- Directorio `renv/` (biblioteca, configuración, script de activación)
- `renv.lock` (snapshot de dependencias)
- Actualiza `.Rprofile` para activar renv al cargar

**Esperado:** Biblioteca local del proyecto creada. Directorio `renv/` y `renv.lock` presentes. `.Rprofile` actualizado con el script de activación.

**En caso de fallo:** Si se bloquea, verificar la conectividad de red. Si falla en un paquete específico, instalarlo manualmente primero con `install.packages()` y luego volver a ejecutar `renv::init()`.

### Paso 2: Añadir Dependencias

Instalar paquetes de la manera habitual:

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

Luego crear un snapshot para registrar el estado:

```r
renv::snapshot()
```

**Esperado:** `renv.lock` actualizado con los nuevos paquetes y sus versiones. `renv::status()` no muestra paquetes desincronizados.

**En caso de fallo:** Si `renv::snapshot()` reporta errores de validación, ejecutar `renv::dependencies()` para comprobar qué paquetes se usan realmente, luego `renv::snapshot(force = TRUE)` para saltarse la validación.

### Paso 3: Restaurar en Otra Máquina

```r
renv::restore()
```

**Esperado:** Todos los paquetes instalados en las versiones exactas indicadas en `renv.lock`.

**En caso de fallo:** Problemas frecuentes: los paquetes de GitHub fallan (configurar `GITHUB_PAT` en `.Renviron`), dependencias de sistema faltantes (instalar con `apt-get` en Linux), tiempos de espera en paquetes grandes (configurar `options(timeout = 600)` antes de restaurar), o binarios no disponibles (renv compila desde el fuente; asegurarse de que las herramientas de compilación están instaladas).

### Paso 4: Actualizar Dependencias

```r
# Actualizar un paquete específico
renv::update("dplyr")

# Actualizar todos los paquetes
renv::update()

# Crear snapshot tras las actualizaciones
renv::snapshot()
```

**Esperado:** Los paquetes objetivo se actualizan a sus últimas versiones compatibles. `renv.lock` refleja las nuevas versiones tras el snapshot.

**En caso de fallo:** Si `renv::update()` falla para un paquete específico, intentar instalarlo directamente con `renv::install("package@version")` y luego crear el snapshot.

### Paso 5: Verificar el Estado

```r
renv::status()
```

**Esperado:** "No issues found" o una lista clara de paquetes desincronizados con orientación sobre las acciones a tomar.

**En caso de fallo:** Si el estado reporta paquetes usados pero no registrados, ejecutar `renv::snapshot()`. Si hay paquetes registrados pero no instalados, ejecutar `renv::restore()`.

### Paso 6: Configurar `.Rprofile` para Activación Condicional

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

Esto garantiza que el proyecto funciona incluso si renv no está instalado (entornos CI, colaboradores).

**Esperado:** Las sesiones R activan renv automáticamente al iniciarse en el directorio del proyecto. Las sesiones sin renv instalado también arrancan sin errores.

**En caso de fallo:** Si `.Rprofile` provoca errores, asegurarse de que el guard `file.exists()` está presente. Nunca llamar a `source("renv/activate.R")` incondicionalmente.

### Paso 7: Configuración de Git

Rastrear estos archivos:

```
renv.lock           # Siempre confirmar
renv/activate.R     # Siempre confirmar
renv/settings.json  # Siempre confirmar
.Rprofile           # Confirmar (contiene la activación de renv)
```

Ignorar estos (ya en el `.gitignore` de renv):

```
renv/library/       # Específico de la máquina
renv/staging/       # Temporal
renv/cache/         # Caché específica de la máquina
```

**Esperado:** `renv.lock`, `renv/activate.R` y `renv/settings.json` son rastreados por Git. Los directorios específicos de la máquina (`renv/library/`, `renv/cache/`) son ignorados.

**En caso de fallo:** Si `renv/library/` se confirma accidentalmente, eliminarlo con `git rm -r --cached renv/library/` y añadirlo a `.gitignore`.

### Paso 8: Integración con CI/CD

En GitHub Actions, usar la acción de caché de renv:

```yaml
- uses: r-lib/actions/setup-renv@v2
```

Esto restaura automáticamente desde `renv.lock` con caché.

**Esperado:** El pipeline de CI restaura los paquetes desde `renv.lock` con caché activada. Las ejecuciones siguientes son más rápidas gracias a los paquetes en caché.

**En caso de fallo:** Si la restauración en CI falla, verificar que `renv.lock` está confirmado y actualizado. Para paquetes privados de GitHub, asegurarse de que `GITHUB_PAT` está configurado como secreto del repositorio.

## Validación

- [ ] `renv::status()` no reporta problemas
- [ ] `renv.lock` está confirmado en el control de versiones
- [ ] `renv::restore()` funciona en una copia de trabajo limpia
- [ ] `.Rprofile` activa renv condicionalmente
- [ ] CI/CD usa `renv.lock` para la resolución de dependencias

## Errores Comunes

- **Ejecutar `renv::init()` en el directorio equivocado**: Verificar siempre `getwd()` primero
- **Mezclar la biblioteca de renv y la del sistema**: Tras `renv::init()`, usar solo la biblioteca del proyecto
- **Olvidar crear el snapshot**: Tras instalar paquetes, ejecutar siempre `renv::snapshot()`
- **La opción `--vanilla`**: `Rscript --vanilla` omite `.Rprofile`, por lo que renv no se activará
- **Archivos de bloqueo grandes en diffs**: Normal — `renv.lock` está diseñado para ser un JSON con diff legible
- **Paquetes de Bioconductor**: Usar `renv::install("bioc::PackageName")` y asegurarse de que BiocManager está configurado

## Habilidades Relacionadas

- `create-r-package` - incluye la inicialización de renv
- `setup-github-actions-ci` - integración de CI con renv
- `submit-to-cran` - gestión de dependencias para paquetes CRAN
