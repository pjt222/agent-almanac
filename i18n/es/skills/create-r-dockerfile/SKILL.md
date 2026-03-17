---
name: create-r-dockerfile
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Crear un Dockerfile para aplicaciones R utilizando imágenes base rocker, gestión de
  dependencias con renv, y mejores prácticas para compilación reproducible. Usar cuando
  se necesite contenerizar un paquete R, una aplicación Shiny, o un pipeline de análisis
  para despliegue reproducible.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: basic
  language: multi
  tags: docker, r, rocker, renv, containerization
---

# Crear R Dockerfile

Crear un Dockerfile para aplicaciones R con imágenes base rocker y gestión de dependencias reproducible.

## Cuándo Usar

- Contenerizando un paquete R para despliegue reproducible
- Desplegando una aplicación Shiny en Docker
- Creando pipelines de análisis reproducibles
- Compartiendo entornos R con miembros del equipo
- Integrando código R en pipelines CI/CD

## Entradas

- **Requerido**: Código fuente R (paquete, script o aplicación Shiny)
- **Requerido**: Lista de dependencias R (DESCRIPTION o renv.lock)
- **Opcional**: Requisitos de paquetes del sistema (libcurl, libxml2, etc.)
- **Opcional**: Archivos de configuración (.Renviron, .Rprofile)
- **Opcional**: Restricciones de imagen base (versión de rocker, variante)

## Procedimiento

### Paso 1: Seleccionar Imagen Base Rocker

Elegir la imagen rocker apropiada según las necesidades del proyecto.

```dockerfile
# Para scripts R y paquetes
FROM rocker/r-ver:4.4.0

# Para aplicaciones Shiny
FROM rocker/shiny-verse:4.4.0

# Para desarrollo con RStudio
FROM rocker/rstudio:4.4.0

# Para ciencia de datos con tidyverse
FROM rocker/tidyverse:4.4.0
```

Criterios de selección de imagen:
- `rocker/r-ver` — R base mínimo (más pequeña, para producción)
- `rocker/tidyverse` — Incluye tidyverse y dependencias del sistema
- `rocker/shiny` — Incluye Shiny Server
- `rocker/shiny-verse` — Shiny + tidyverse
- `rocker/rstudio` — Incluye RStudio Server

**Esperado:** Imagen base seleccionada coincide con los requisitos del proyecto, la versión de R anclada para reproducibilidad.

**En caso de fallo:** Verificar versiones disponibles en Docker Hub (`docker search rocker`), asegurar que la versión de R coincide con el desarrollo local, considerar restricciones de tamaño de imagen.

### Paso 2: Instalar Dependencias del Sistema

Agregar bibliotecas del sistema requeridas por los paquetes R.

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    libfontconfig1-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libfreetype6-dev \
    libpng-dev \
    libtiff5-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*
```

**Esperado:** Todas las dependencias del sistema instaladas, la capa limpia no tiene archivos de caché.

**En caso de fallo:** Identificar bibliotecas faltantes desde errores de instalación de paquetes R (`install.packages()` mostrará qué falta), buscar el nombre del paquete Debian para la biblioteca requerida.

### Paso 3: Configurar Gestión de Dependencias con renv

Usar renv para la instalación reproducible de paquetes.

```dockerfile
# Instalar renv
RUN R -e "install.packages('renv', repos='https://cloud.r-project.org')"

# Copiar archivos de bloqueo primero (caché de capas Docker)
WORKDIR /app
COPY renv.lock renv.lock
COPY .Rprofile .Rprofile
COPY renv/activate.R renv/activate.R
COPY renv/settings.json renv/settings.json

# Restaurar paquetes desde lockfile
RUN R -e "renv::restore()"

# Copiar código de la aplicación (después de paquetes para mejor caché)
COPY . .
```

Sin renv (alternativa):

```dockerfile
RUN R -e "install.packages(c('shiny', 'dplyr', 'ggplot2'), repos='https://cloud.r-project.org')"
```

**Esperado:** Paquetes R instalados de forma reproducible desde renv.lock, caché de capas Docker funciona en compilaciones subsecuentes.

**En caso de fallo:** Ejecutar `renv::snapshot()` localmente antes de compilar, verificar que renv.lock está actualizado, asegurar que la versión de R en Docker coincide con la versión de renv.lock.

### Paso 4: Configurar Punto de Entrada

Definir cómo se ejecuta la aplicación.

Para una aplicación Shiny:

```dockerfile
EXPOSE 3838
CMD ["R", "-e", "shiny::runApp('/app', host='0.0.0.0', port=3838)"]
```

Para un script R:

```dockerfile
CMD ["Rscript", "main.R"]
```

Para un paquete R (ejecución de tests):

```dockerfile
CMD ["R", "CMD", "check", "--no-manual", "."]
```

**Esperado:** El contenedor se inicia y ejecuta la aplicación R correctamente, los puertos expuestos coinciden con la configuración de la aplicación.

**En caso de fallo:** Verificar que la aplicación se ejecuta localmente primero, comprobar los logs del contenedor (`docker logs <container>`), asegurar que los paths de los archivos dentro del contenedor son correctos.

### Paso 5: Compilar y Probar

Compilar la imagen Docker y verificar que funciona.

```bash
# Compilar imagen
docker build -t mi-app-r:latest .

# Ejecutar contenedor
docker run -p 3838:3838 mi-app-r:latest

# Ejecutar con variables de entorno
docker run -e MI_VARIABLE=valor -p 3838:3838 mi-app-r:latest

# Ejecutar interactivamente para depuración
docker run -it mi-app-r:latest R
```

**Esperado:** La imagen se compila exitosamente, el contenedor se ejecuta sin errores, la aplicación es accesible en el puerto configurado.

**En caso de fallo:** Revisar la salida de compilación para errores de instalación de paquetes, verificar la disponibilidad de puertos, comprobar la asignación de memoria del contenedor (R puede necesitar más RAM).

## Validación

- [ ] La imagen Docker se compila sin errores
- [ ] El contenedor se inicia y ejecuta la aplicación correctamente
- [ ] Las dependencias R coinciden con el entorno de desarrollo local
- [ ] La caché de capas Docker funciona (recompilaciones rápidas cuando solo cambia el código)
- [ ] El tamaño de la imagen es razonable (considerar compilación multi-etapa para producción)
- [ ] Las variables de entorno se manejan correctamente

## Errores Comunes

- **Imagen demasiado grande**: Usar compilación multi-etapa o imagen base más pequeña. Limpiar cachés de apt en la misma capa RUN.
- **renv.lock desactualizado**: Siempre ejecutar `renv::snapshot()` localmente antes de compilar la imagen Docker.
- **Fallo de instalación de paquetes**: Generalmente causado por dependencias del sistema faltantes. Revisar mensajes de error para identificar la biblioteca requerida.
- **Caché de capas no funciona**: Copiar archivos de dependencias antes del código fuente. COPY de renv.lock antes de COPY del código de la aplicación.
- **Inconsistencia de versión de R**: Anclar la versión de R en la imagen base para coincidir con el entorno de desarrollo.

## Habilidades Relacionadas

- `setup-docker-compose` - Orquestar contenedores R con servicios de base de datos
- `optimize-docker-build-cache` - Mejorar tiempos de compilación Docker para proyectos R
- `containerize-mcp-server` - Contenerizar servidores MCP basados en R
- `create-dockerfile` - Patrones generales de Dockerfile para otros lenguajes
