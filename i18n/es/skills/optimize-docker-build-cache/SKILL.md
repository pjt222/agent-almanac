---
name: optimize-docker-build-cache
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Optimizar la caché de compilación de Docker para reducir tiempos de compilación y tamaños
  de imagen. Cubrir el orden de capas, compilaciones multi-etapa, BuildKit, y estrategias
  de caché para diferentes lenguajes. Usar cuando las compilaciones Docker son lentas,
  las imágenes son innecesariamente grandes, o cuando se necesita optimizar pipelines CI/CD.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: docker, build-cache, optimization, multi-stage, buildkit
---

# Optimizar Caché de Compilación Docker

Optimizar las compilaciones Docker con estrategias de caché de capas, compilaciones multi-etapa y BuildKit.

## Cuándo Usar

- Las compilaciones Docker son lentas (>5 minutos para cambios de código)
- Las imágenes Docker son innecesariamente grandes (>1GB)
- Los pipelines CI/CD gastan mucho tiempo en compilaciones Docker
- Recompilando dependencias sin cambios cada vez
- Necesitando optimizar costos de infraestructura CI/CD

## Entradas

- **Requerido**: Dockerfile existente a optimizar
- **Requerido**: Conocimiento de los patrones de cambio del proyecto (qué cambia frecuentemente)
- **Opcional**: Infraestructura CI/CD utilizada (GitHub Actions, GitLab CI, etc.)
- **Opcional**: Registry de imágenes para caché remota

## Procedimiento

### Paso 1: Ordenar Capas por Frecuencia de Cambio

Organizar las instrucciones del Dockerfile de menos a más frecuentemente cambiadas.

```dockerfile
# CORRECTO: Dependencias antes del código
FROM node:20-alpine

# 1. Dependencias del sistema (cambian raramente)
RUN apk add --no-cache python3 make g++

# 2. Archivos de dependencias (cambian ocasionalmente)
COPY package.json package-lock.json ./
RUN npm ci --production

# 3. Código fuente (cambia frecuentemente)
COPY . .

# 4. Compilación (depende del código)
RUN npm run build
```

```dockerfile
# INCORRECTO: Todo junto (invalida caché en cada cambio)
FROM node:20-alpine
COPY . .
RUN npm ci && npm run build
```

**Esperado:** Las recompilaciones solo reejecutarán las capas afectadas por los cambios, no todas las capas.

**En caso de fallo:** Analizar qué archivos cambian frecuentemente con `git log --stat`, reestructurar COPY para separar archivos estables de los que cambian.

### Paso 2: Usar Compilaciones Multi-Etapa

Separar las dependencias de compilación de la imagen final.

```dockerfile
# Etapa de compilación
FROM golang:1.21 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

# Etapa de producción
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /usr/local/bin/server
CMD ["server"]
```

**Esperado:** La imagen final contiene solo el binario y dependencias de runtime, reduciendo significativamente el tamaño.

**En caso de fallo:** Verificar que todos los archivos necesarios se copian desde la etapa de compilación, probar la imagen final exhaustivamente.

### Paso 3: Habilitar BuildKit

Usar BuildKit para caché avanzada y compilaciones paralelas.

```bash
# Habilitar BuildKit
export DOCKER_BUILDKIT=1

# O en docker compose
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker compose build

# Compilar con caché de montaje (para gestores de paquetes)
```

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.11-slim

# Caché de pip con montaje
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

**Esperado:** BuildKit habilitado, las compilaciones usan caché de montaje para gestores de paquetes, compilaciones paralelas cuando es posible.

**En caso de fallo:** Verificar versión de Docker (BuildKit requiere 18.09+), agregar `# syntax=docker/dockerfile:1` al inicio del Dockerfile.

### Paso 4: Configurar Caché Remota para CI/CD

Usar caché de registry para persistir la caché entre compilaciones CI.

```bash
# Compilar con caché en registry
docker buildx build \
  --cache-from type=registry,ref=myregistry.com/myapp:cache \
  --cache-to type=registry,ref=myregistry.com/myapp:cache,mode=max \
  -t myapp:latest .
```

```yaml
# GitHub Actions
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Esperado:** La caché persiste entre ejecuciones CI/CD, las compilaciones subsecuentes son significativamente más rápidas.

**En caso de fallo:** Verificar permisos del registry, comprobar que la caché se descarga correctamente, monitorizar el tamaño de la caché.

## Validación

- [ ] Las compilaciones con cambios solo de código no reinstalan dependencias
- [ ] Las compilaciones multi-etapa producen imágenes significativamente más pequeñas
- [ ] BuildKit está habilitado y la caché de montaje funciona
- [ ] La caché CI/CD reduce los tiempos de compilación en >50%
- [ ] Las imágenes de producción no contienen herramientas de compilación

## Errores Comunes

- **COPY . . antes de dependencias**: Invalida la caché de dependencias en cada cambio de código. Siempre copiar archivos de bloqueo primero.
- **No usar .dockerignore**: Archivos innecesarios (node_modules, .git) invalidan la caché. Crear .dockerignore apropiado.
- **Caché no persiste en CI**: Las compilaciones CI comienzan limpias. Usar caché de registry o caché específica del CI.
- **Imagen final demasiado grande**: Olvidar la compilación multi-etapa. Nunca instalar compiladores en la imagen final.
- **Capas RUN separadas innecesarias**: Combinar comandos relacionados con `&&` para reducir capas.

## Habilidades Relacionadas

- `create-dockerfile` - Crear Dockerfiles generales con mejores prácticas
- `create-r-dockerfile` - Optimización específica para proyectos R
- `build-ci-cd-pipeline` - Integrar compilaciones Docker optimizadas en CI/CD
- `create-multistage-dockerfile` - Patrones avanzados de compilación multi-etapa
