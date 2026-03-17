---
name: deploy-shiny-app
description: >
  Desplegar aplicaciones Shiny en shinyapps.io, Posit Connect o contenedores
  Docker. Cubre la configuración de rsconnect, generación de manifiestos,
  creación de Dockerfiles y verificación del despliegue. Úsalo al publicar
  una app Shiny para usuarios externos o internos, al pasar del desarrollo
  local a un entorno alojado, al containerizar una app Shiny para despliegue
  en Kubernetes o Docker, o al configurar pipelines de despliegue automatizados.
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
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, deployment, shinyapps-io, posit-connect, docker, rsconnect
---

# Deploy Shiny App

Desplegar una aplicación Shiny en shinyapps.io, Posit Connect o un contenedor Docker.

## Cuándo Usar

- Al publicar una app Shiny para usuarios externos o internos
- Al pasar del desarrollo local a un entorno alojado
- Al containerizar una app Shiny para despliegue en Kubernetes o Docker
- Al configurar pipelines de despliegue automatizados

## Entradas

- **Requerido**: Ruta a la aplicación Shiny
- **Requerido**: Destino de despliegue (shinyapps.io, Posit Connect o Docker)
- **Opcional**: Nombre de cuenta y token (para shinyapps.io/Connect)
- **Opcional**: Preferencia de tamaño de instancia
- **Opcional**: Dominio personalizado o ruta de URL

## Procedimiento

### Paso 1: Preparar la Aplicación

Asegúrate de que la app sea autocontenida y desplegable:

```r
# Verificar dependencias faltantes
rsconnect::appDependencies("path/to/app")

# Para apps golem, asegúrate de que DESCRIPTION liste todos los Imports
devtools::check()

# Verificar que la app se ejecuta limpiamente
shiny::runApp("path/to/app")
```

Verifica que estos archivos existen:
- `app.R` (o `ui.R` + `server.R`)
- `renv.lock` (recomendado para despliegues reproducibles)
- `.Rprofile` NO llama a `mcptools::mcp_session()` en producción

**Esperado:** La app se ejecuta localmente sin errores y todas las dependencias están capturadas.

**En caso de fallo:** Si `appDependencies()` reporta paquetes faltantes, instálalos y actualiza `renv.lock`. Si la app usa bibliotecas del sistema (p.ej., gdal, curl), anótalas para el camino de Docker.

### Paso 2a: Desplegar en shinyapps.io

```r
# Configuración de cuenta (una vez)
rsconnect::setAccountInfo(
  name = "your-account",
  token = Sys.getenv("SHINYAPPS_TOKEN"),
  secret = Sys.getenv("SHINYAPPS_SECRET")
)

# Desplegar
rsconnect::deployApp(
  appDir = "path/to/app",
  appName = "my-app",
  appTitle = "My Application",
  account = "your-account",
  forceUpdate = TRUE
)
```

Almacena las credenciales en `.Renviron` (nunca en el código):

```bash
# .Renviron
SHINYAPPS_TOKEN=your_token_here
SHINYAPPS_SECRET=your_secret_here
```

**Esperado:** App desplegada y accesible en `https://your-account.shinyapps.io/my-app/`.

**En caso de fallo:** Si la autenticación falla, regenera los tokens en el panel de shinyapps.io > Account > Tokens. Si la instalación del paquete falla en el servidor, verifica que todos los paquetes estén disponibles en CRAN — shinyapps.io no puede instalar desde GitHub por defecto.

### Paso 2b: Desplegar en Posit Connect

```r
# Registrar servidor (una vez)
rsconnect::addServer(
  url = "https://connect.example.com",
  name = "production"
)

# Autenticar (una vez)
rsconnect::connectApiUser(
  account = "your-username",
  server = "production",
  apiKey = Sys.getenv("CONNECT_API_KEY")
)

# Desplegar
rsconnect::deployApp(
  appDir = "path/to/app",
  appName = "my-app",
  server = "production",
  account = "your-username"
)
```

**Esperado:** App desplegada y accesible en la instancia de Posit Connect.

**En caso de fallo:** Si el servidor rechaza la conexión, verifica la clave API y la URL del servidor. Si los paquetes no se instalan, verifica que Connect tenga acceso a los repositorios requeridos (CRAN, repos internos tipo CRAN).

### Paso 2c: Desplegar con Docker

Crea un `Dockerfile`:

```dockerfile
FROM rocker/shiny-verse:4.4.0

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar paquetes R
RUN R -e "install.packages(c('shiny', 'bslib', 'DT', 'plotly'))"

# Copiar la app
COPY . /srv/shiny-server/myapp/

# Configurar Shiny Server
COPY shiny-server.conf /etc/shiny-server/shiny-server.conf

# Exponer puerto
EXPOSE 3838

# Ejecutar
CMD ["/usr/bin/shiny-server"]
```

Crea `shiny-server.conf`:

```
run_as shiny;

server {
  listen 3838;

  location / {
    site_dir /srv/shiny-server/myapp;
    log_dir /var/log/shiny-server;
    directory_index on;
  }
}
```

Compilar y ejecutar:

```bash
docker build -t myapp:latest .
docker run -p 3838:3838 myapp:latest
```

**Esperado:** App accesible en `http://localhost:3838`.

**En caso de fallo:** Si la compilación falla en la instalación del paquete, añade las bibliotecas del sistema faltantes a la línea `apt-get install`. Si la app no carga, verifica los registros de Shiny Server: `docker exec <container> cat /var/log/shiny-server/*.log`.

### Paso 3: Verificar el Despliegue

```r
# Verificar que la URL desplegada responde
response <- httr::GET("https://your-app-url/")
httr::status_code(response)  # Debe ser 200

# Para Docker
response <- httr::GET("http://localhost:3838/")
httr::status_code(response)
```

Lista de verificación manual:
1. La app carga sin errores
2. Todos los elementos interactivos responden
3. Las conexiones de datos funcionan en el entorno desplegado
4. La autenticación/autorización funciona (si aplica)

**Esperado:** La app responde con HTTP 200 y todas las funcionalidades funcionan.

**En caso de fallo:** Revisa los registros del servidor para la plataforma de despliegue específica. Problemas comunes: variables de entorno no configuradas en producción, conexiones de base de datos usando localhost en lugar de URLs de producción, o rutas de archivos que solo existen localmente.

### Paso 4: Configurar el Monitoreo (Opcional)

#### shinyapps.io

Monitoriza a través del panel en `https://www.shinyapps.io/admin/#/applications`.

#### Posit Connect

```r
# Verificar el estado del despliegue via API
connectapi::connect(
  server = "https://connect.example.com",
  api_key = Sys.getenv("CONNECT_API_KEY")
)
```

#### Docker

Añade verificación de estado al Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3838/ || exit 1
```

**Esperado:** Monitoreo configurado para el destino de despliegue.

**En caso de fallo:** Si las verificaciones de estado fallan intermitentemente, aumenta los valores de tiempo de espera. Las apps Shiny pueden ser lentas para responder durante la carga inicial.

## Validación

- [ ] La app se despliega sin errores
- [ ] La URL desplegada responde con HTTP 200
- [ ] Todas las funcionalidades interactivas funcionan en producción
- [ ] Las variables de entorno/secretos están configurados (no hardcodeados)
- [ ] Las credenciales almacenadas en `.Renviron` o secretos de CI, no en el código
- [ ] renv.lock confirmado para resolución reproducible de dependencias

## Errores Comunes

- **Rutas de archivos hardcodeadas**: Reemplaza las rutas absolutas con `system.file()` (para datos del paquete) o variables de entorno (para recursos externos).
- **Dependencias solo de desarrollo**: No despliegues `.Rprofile` que carga `mcptools::mcp_session()` o `devtools`. Usa carga condicional o perfiles separados.
- **Bibliotecas del sistema faltantes en Docker**: Los paquetes R como sf, curl y xml2 necesitan bibliotecas del sistema. Añádelas a la línea `apt-get install` del Dockerfile.
- **Paquetes solo de CRAN en shinyapps.io**: shinyapps.io solo instala desde CRAN por defecto. Los paquetes solo de GitHub necesitan el paquete `remotes` e instalación explícita en el despliegue.
- **Variables de entorno olvidadas**: Las credenciales de base de datos, claves API y otros secretos deben configurarse en el entorno de despliegue separadamente del código.

## Habilidades Relacionadas

- `scaffold-shiny-app` — crear la estructura de la app antes del despliegue
- `create-r-dockerfile` — configuración detallada de Docker para proyectos R
- `setup-docker-compose` — configuraciones multi-contenedor para Shiny con bases de datos
- `setup-github-actions-ci` — CI/CD incluyendo despliegue automatizado
- `optimize-shiny-performance` — optimización del rendimiento antes de desplegar en producción
