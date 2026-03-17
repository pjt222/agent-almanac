---
name: setup-docker-compose
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Configurar Docker Compose para entornos R con servicios de base de datos, volúmenes
  persistentes y redes. Usar cuando se necesite ejecutar aplicaciones R junto con
  PostgreSQL, Redis u otros servicios, o cuando se gestionen entornos de desarrollo
  multi-contenedor.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: basic
  language: multi
  tags: docker-compose, r, multi-container, orchestration
---

# Configurar Docker Compose

Configurar Docker Compose para orquestar entornos R multi-contenedor con servicios y redes.

## Cuándo Usar

- Ejecutando aplicaciones R con servicios de base de datos (PostgreSQL, MySQL)
- Configurando entornos de desarrollo con múltiples contenedores
- Orquestando aplicaciones Shiny con servicios de soporte
- Creando pipelines de análisis reproducibles con dependencias externas
- Gestionando servicios interconectados para proyectos de ciencia de datos

## Entradas

- **Requerido**: Dockerfile para la aplicación R
- **Requerido**: Lista de servicios necesarios (base de datos, caché, etc.)
- **Opcional**: Archivos de configuración para cada servicio
- **Opcional**: Esquemas de base de datos o scripts de inicialización
- **Opcional**: Variables de entorno específicas por servicio

## Procedimiento

### Paso 1: Crear Estructura del Proyecto

Organizar archivos del proyecto para Docker Compose.

```bash
mkdir -p mi-proyecto/{app,db/init,config}
cd mi-proyecto

# Estructura:
# mi-proyecto/
#   docker-compose.yml
#   app/
#     Dockerfile
#     renv.lock
#     app.R
#   db/
#     init/
#       01-schema.sql
#   config/
#     .Renviron
```

**Esperado:** Estructura de directorios creada con separación clara entre servicios.

**En caso de fallo:** Verificar permisos de escritura, asegurar que los paths no contienen caracteres especiales.

### Paso 2: Escribir docker-compose.yml

Definir servicios, redes y volúmenes.

```yaml
version: '3.8'

services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    ports:
      - "3838:3838"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=mibase
      - DB_USER=postgres
      - DB_PASSWORD=secreto
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./app:/app
      - r-libs:/usr/local/lib/R/site-library
    networks:
      - app-network

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: mibase
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secreto
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

volumes:
  postgres-data:
  r-libs:

networks:
  app-network:
    driver: bridge
```

**Esperado:** Los servicios se definen con dependencias claras, healthchecks configurados, volúmenes para persistencia.

**En caso de fallo:** Validar sintaxis YAML, verificar que las imágenes existen en Docker Hub, comprobar que los puertos no están en uso.

### Paso 3: Configurar Variables de Entorno

Usar archivos `.env` para configuración sensible.

```bash
# .env (gitignored)
POSTGRES_PASSWORD=mi_secreto_seguro
DB_NAME=mibase
SHINY_PORT=3838
```

```yaml
# docker-compose.yml - referenciar variables
services:
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

**Esperado:** Variables de entorno separadas del código, archivo .env excluido de Git.

**En caso de fallo:** Verificar que .env está en .gitignore, comprobar sintaxis de variables con `docker compose config`.

### Paso 4: Iniciar y Verificar Servicios

Compilar y ejecutar todos los servicios.

```bash
# Compilar e iniciar
docker compose up -d --build

# Verificar estado
docker compose ps

# Ver logs
docker compose logs -f app

# Verificar conectividad de red
docker compose exec app R -e "DBI::dbConnect(RPostgres::Postgres(), host='db', dbname='mibase')"

# Detener servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

**Esperado:** Todos los servicios en estado saludable, la aplicación R se conecta a la base de datos, los logs no muestran errores.

**En caso de fallo:** Revisar logs de servicios individuales (`docker compose logs db`), verificar healthchecks, comprobar resolución DNS entre contenedores.

## Validación

- [ ] `docker compose up` inicia todos los servicios sin errores
- [ ] La aplicación R se conecta exitosamente a los servicios dependientes
- [ ] Los volúmenes persisten datos entre reinicios
- [ ] Los healthchecks reportan servicios saludables
- [ ] Las variables de entorno se inyectan correctamente
- [ ] La red permite comunicación entre servicios

## Errores Comunes

- **Orden de inicio incorrecto**: Usar `depends_on` con `condition: service_healthy` en lugar de solo `depends_on`.
- **Datos perdidos al detener**: Usar volúmenes nombrados, no binds anónimos, para datos persistentes.
- **Conexión rechazada entre servicios**: Usar nombres de servicio como hostnames, no `localhost`.
- **Puerto ya en uso**: Verificar puertos disponibles antes de iniciar, usar puertos alternativos si es necesario.
- **Credenciales en repositorio**: Nunca commit de archivos .env con secretos reales.

## Habilidades Relacionadas

- `create-r-dockerfile` - Crear Dockerfiles base para aplicaciones R
- `setup-compose-stack` - Stacks Docker Compose generales multi-servicio
- `optimize-docker-build-cache` - Optimizar tiempos de compilación Docker
