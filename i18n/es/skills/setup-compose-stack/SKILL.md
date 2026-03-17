---
name: setup-compose-stack
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Configurar stacks Docker Compose multi-servicio de propósito general con redes,
  volúmenes, healthchecks, y perfiles de entorno. Cubrir patrones para aplicaciones
  web con bases de datos, colas de mensajes, cachés, y proxies inversos. Usar cuando
  se necesite orquestar múltiples servicios interconectados para desarrollo o producción.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: docker-compose, stack, multi-service, orchestration, networking
---

# Configurar Stack Compose

Configurar stacks Docker Compose multi-servicio con redes, volúmenes y healthchecks.

## Cuándo Usar

- Orquestando aplicaciones web con bases de datos y servicios de soporte
- Configurando entornos de desarrollo que replican producción
- Gestionando stacks con colas de mensajes, cachés y proxies
- Necesitando reproducibilidad en entornos multi-servicio
- Creando entornos de demostración o staging locales

## Entradas

- **Requerido**: Lista de servicios y sus relaciones
- **Requerido**: Dockerfiles o imágenes para cada servicio
- **Opcional**: Esquemas de base de datos para inicialización
- **Opcional**: Archivos de configuración por servicio
- **Opcional**: Certificados TLS para HTTPS local

## Procedimiento

### Paso 1: Diseñar la Arquitectura del Stack

Mapear servicios, dependencias y redes.

```yaml
# Arquitectura típica:
# frontend -> api -> database
#                 -> cache (Redis)
#                 -> queue (RabbitMQ)
# proxy (nginx) -> frontend, api
```

**Esperado:** Diagrama claro de servicios y sus interacciones.

**En caso de fallo:** Comenzar con los servicios mínimos necesarios y agregar más iterativamente.

### Paso 2: Escribir docker-compose.yml Completo

```yaml
version: '3.8'

services:
  proxy:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      frontend:
        condition: service_healthy
      api:
        condition: service_healthy
    networks:
      - frontend-net
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      target: production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 15s
      timeout: 5s
      retries: 3
    networks:
      - frontend-net
    restart: unless-stopped

  api:
    build:
      context: ./api
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - REDIS_URL=redis://cache:6379
      - RABBITMQ_URL=amqp://user:pass@queue:5672
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
      queue:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 15s
      timeout: 5s
      retries: 3
    networks:
      - frontend-net
      - backend-net
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend-net
    restart: unless-stopped

  cache:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - backend-net
    restart: unless-stopped

  queue:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: user
      RABBITMQ_DEFAULT_PASS: pass
    ports:
      - "15672:15672"
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 15s
      timeout: 10s
      retries: 5
    networks:
      - backend-net
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  rabbitmq-data:

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
```

**Esperado:** Todos los servicios definidos con healthchecks, redes segmentadas, y volúmenes para persistencia.

**En caso de fallo:** Validar sintaxis con `docker compose config`, verificar que las imágenes existen.

### Paso 3: Configurar Entornos Múltiples

```yaml
# docker-compose.override.yml (desarrollo - se aplica automáticamente)
services:
  api:
    volumes:
      - ./api/src:/app/src
    environment:
      - DEBUG=true
    command: ["npm", "run", "dev"]

  db:
    ports:
      - "5432:5432"
```

```yaml
# docker-compose.prod.yml
services:
  api:
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

```bash
# Desarrollo (usa override automáticamente)
docker compose up

# Producción
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Esperado:** Los archivos de override permiten configuración específica por entorno sin duplicar la configuración base.

**En caso de fallo:** Verificar el orden de precedencia de archivos con `docker compose config`.

### Paso 4: Gestionar Ciclo de Vida

```bash
# Iniciar todos los servicios
docker compose up -d

# Ver estado y logs
docker compose ps
docker compose logs -f api

# Escalar un servicio
docker compose up -d --scale api=3

# Reiniciar un servicio específico
docker compose restart api

# Detener sin eliminar datos
docker compose stop

# Detener y eliminar todo (incluyendo volúmenes)
docker compose down -v
```

**Esperado:** Los servicios se gestionan de forma independiente, los datos persisten entre reinicios.

**En caso de fallo:** Revisar logs de servicios individuales, verificar healthchecks, comprobar uso de recursos.

## Validación

- [ ] Todos los servicios inician y alcanzan estado saludable
- [ ] Las redes segmentan correctamente el tráfico (backend no accesible desde frontend)
- [ ] Los volúmenes persisten datos entre reinicios
- [ ] Los healthchecks detectan servicios no saludables
- [ ] Las variables de entorno se inyectan correctamente
- [ ] Los archivos de override funcionan para cada entorno

## Errores Comunes

- **Red plana sin segmentación**: Segmentar frontend y backend en redes separadas para seguridad.
- **Healthchecks faltantes**: Sin healthchecks, `depends_on` no espera a que los servicios estén listos.
- **Volúmenes anónimos**: Usar volúmenes nombrados para persistencia predecible.
- **Credenciales hardcodeadas**: Usar archivos .env o Docker secrets para credenciales.
- **No usar restart policy**: Agregar `restart: unless-stopped` para recuperación automática.
- **Puertos innecesariamente expuestos**: Solo exponer puertos al host cuando sea necesario.

## Habilidades Relacionadas

- `setup-docker-compose` - Docker Compose para entornos R específicos
- `configure-nginx` - Configuración detallada de Nginx como proxy
- `configure-reverse-proxy` - Patrones de proxy inverso con Nginx/Traefik
- `create-dockerfile` - Crear Dockerfiles para cada servicio del stack
