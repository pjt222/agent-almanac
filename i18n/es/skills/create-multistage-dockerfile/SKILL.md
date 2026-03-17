---
name: create-multistage-dockerfile
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Crear Dockerfiles multi-etapa que separan las dependencias de compilación de la imagen
  de producción para obtener imágenes más pequeñas, seguras y eficientes. Cubrir patrones
  para Go, Rust, Java, Node.js y Python con compilación de artefactos, prueba, y
  empaquetado final.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: docker, multi-stage, build, optimization, security
---

# Crear Dockerfile Multi-Etapa

Crear Dockerfiles multi-etapa para separar compilación de producción y obtener imágenes mínimas.

## Cuándo Usar

- Las imágenes Docker de producción son demasiado grandes
- Necesitando separar herramientas de compilación de la imagen final
- Compilando binarios estáticos (Go, Rust) para imágenes minimales
- Ejecutando pruebas en la compilación sin incluirlas en producción
- Reduciendo la superficie de ataque eliminando herramientas innecesarias

## Entradas

- **Requerido**: Código fuente de la aplicación
- **Requerido**: Proceso de compilación del proyecto
- **Opcional**: Suite de pruebas para ejecutar durante la compilación
- **Opcional**: Requisitos de imagen base para producción

## Procedimiento

### Paso 1: Diseñar las Etapas de Compilación

Identificar las etapas necesarias según el lenguaje.

```dockerfile
# Patrón general de 3 etapas
# Etapa 1: Dependencias
# Etapa 2: Compilación
# Etapa 3: Producción (imagen final)
```

**Esperado:** Separación clara entre etapas de compilación y producción.

**En caso de fallo:** Comenzar con 2 etapas (compilación + producción) y agregar más si es necesario.

### Paso 2: Implementar para Lenguajes Compilados (Go)

```dockerfile
# Etapa de compilación
FROM golang:1.21-alpine AS builder
RUN apk add --no-cache git ca-certificates
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /server .

# Etapa de producción
FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
```

Para **Rust**:

```dockerfile
FROM rust:1.74-alpine AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
COPY src ./src
RUN cargo build --release

FROM alpine:3.18
COPY --from=builder /app/target/release/myapp /usr/local/bin/myapp
CMD ["myapp"]
```

**Esperado:** La imagen final contiene solo el binario y dependencias mínimas de runtime.

**En caso de fallo:** Verificar que el binario es estáticamente enlazado (para `scratch`), incluir certificados SSL si se necesita HTTPS.

### Paso 3: Implementar para Lenguajes Interpretados (Node.js)

```dockerfile
# Etapa de dependencias
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production

# Etapa de compilación
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa de producción
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json .
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Esperado:** La imagen final no contiene devDependencies, archivos fuente ni herramientas de compilación.

**En caso de fallo:** Verificar que todos los archivos necesarios se copian desde las etapas correctas, probar la imagen final con todas las funcionalidades.

### Paso 4: Agregar Etapa de Pruebas

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Etapa de pruebas (no produce imagen, pero falla la compilación si las pruebas fallan)
FROM builder AS tester
RUN npm test

# Etapa de producción (solo se alcanza si las pruebas pasan)
FROM node:20-alpine
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

```bash
# Compilar hasta la etapa de pruebas
docker build --target tester -t mi-app:test .

# Compilar imagen de producción (ejecuta pruebas automáticamente)
docker build -t mi-app:latest .
```

**Esperado:** Las pruebas se ejecutan durante la compilación, la imagen de producción solo se crea si las pruebas pasan.

**En caso de fallo:** Usar `--target` para compilar etapas individuales y depurar problemas.

## Validación

- [ ] La imagen final es significativamente más pequeña que una compilación de una sola etapa
- [ ] No se incluyen herramientas de compilación en la imagen de producción
- [ ] Las pruebas se ejecutan durante la compilación
- [ ] La aplicación funciona correctamente en la imagen final
- [ ] Las capas de caché funcionan eficientemente entre etapas

## Errores Comunes

- **Copiar demasiado en la etapa final**: Solo copiar artefactos necesarios con `COPY --from=`.
- **No separar dependencias de compilación**: Las devDependencies no deben estar en la imagen final.
- **Olvidar certificados SSL**: Las imágenes `scratch` no tienen certificados; copiarlos explícitamente.
- **Caché de dependencias ineficiente**: Copiar archivos de bloqueo antes del código fuente en cada etapa.
- **No nombrar las etapas**: Usar `AS nombre` para referencia clara en lugar de índices numéricos.

## Habilidades Relacionadas

- `create-dockerfile` - Patrones base de Dockerfile
- `optimize-docker-build-cache` - Estrategias avanzadas de caché
- `create-r-dockerfile` - Dockerfiles específicos para R
