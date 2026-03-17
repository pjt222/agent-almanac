---
name: create-dockerfile
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Crear Dockerfiles generales de propósito general para múltiples lenguajes (Node.js,
  Python, Go, Java, Rust) con mejores prácticas de seguridad, optimización de capas,
  y configuración de producción. Usar cuando se necesite contenerizar cualquier aplicación
  para despliegue consistente y reproducible.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: basic
  language: multi
  tags: docker, dockerfile, containerization, multi-language, best-practices
---

# Crear Dockerfile

Crear Dockerfiles de producción para aplicaciones en cualquier lenguaje con mejores prácticas.

## Cuándo Usar

- Contenerizando una aplicación para despliegue en producción
- Necesitando un Dockerfile con mejores prácticas de seguridad
- Creando entornos de desarrollo reproducibles
- Estandarizando la contenerización en un equipo
- Preparando aplicaciones para despliegue en Kubernetes

## Entradas

- **Requerido**: Código fuente de la aplicación
- **Requerido**: Lenguaje y framework utilizado
- **Requerido**: Archivo de dependencias (package.json, requirements.txt, go.mod, etc.)
- **Opcional**: Requisitos de compilación específicos
- **Opcional**: Variables de entorno necesarias
- **Opcional**: Archivos de configuración de la aplicación

## Procedimiento

### Paso 1: Seleccionar Imagen Base Apropiada

Elegir la imagen base según el lenguaje y los requisitos.

```dockerfile
# Node.js
FROM node:20-alpine

# Python
FROM python:3.11-slim

# Go
FROM golang:1.21-alpine

# Java
FROM eclipse-temurin:17-jre-alpine

# Rust
FROM rust:1.74-alpine AS builder
```

Principios de selección:
- Preferir variantes `alpine` o `slim` para producción
- Anclar versiones mayores y menores (no usar `latest`)
- Usar imágenes oficiales de Docker Hub

**Esperado:** Imagen base seleccionada que minimiza el tamaño y la superficie de ataque.

**En caso de fallo:** Verificar compatibilidad de la imagen con la arquitectura del host (amd64 vs arm64), comprobar disponibilidad en Docker Hub.

### Paso 2: Configurar Estructura del Dockerfile

Seguir la estructura recomendada para máxima eficiencia de caché.

```dockerfile
# 1. Imagen base
FROM python:3.11-slim

# 2. Metadatos
LABEL maintainer="equipo@ejemplo.com"
LABEL version="1.0"

# 3. Crear usuario no-root
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 4. Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 5. Establecer directorio de trabajo
WORKDIR /app

# 6. Copiar e instalar dependencias (caché de capas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 7. Copiar código fuente
COPY . .

# 8. Cambiar a usuario no-root
USER appuser

# 9. Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8000/health || exit 1

# 10. Exponer puertos
EXPOSE 8000

# 11. Punto de entrada
CMD ["python", "main.py"]
```

**Esperado:** Dockerfile sigue las mejores prácticas de seguridad y optimización de capas.

**En caso de fallo:** Revisar errores de sintaxis Docker, verificar que los archivos referenciados existen en el contexto de compilación.

### Paso 3: Agregar .dockerignore

Excluir archivos innecesarios del contexto de compilación.

```
.git
.gitignore
node_modules
__pycache__
*.pyc
.env
.venv
README.md
docker-compose*.yml
.dockerignore
Dockerfile
.github
tests/
docs/
*.md
```

**Esperado:** El contexto de compilación es mínimo, las compilaciones son más rápidas, no se incluyen secretos.

**En caso de fallo:** Verificar que no se excluyen archivos necesarios para la compilación.

### Paso 4: Compilar y Probar

```bash
# Compilar
docker build -t mi-app:latest .

# Ejecutar
docker run -p 8000:8000 mi-app:latest

# Verificar que se ejecuta como no-root
docker run mi-app:latest whoami
# Debe imprimir: appuser

# Verificar tamaño de imagen
docker images mi-app:latest
```

**Esperado:** La imagen se compila exitosamente, se ejecuta como usuario no-root, el tamaño es razonable.

**En caso de fallo:** Revisar logs de compilación, verificar permisos de archivos dentro del contenedor, comprobar healthcheck.

## Validación

- [ ] La imagen se compila sin errores ni advertencias
- [ ] La aplicación se ejecuta correctamente dentro del contenedor
- [ ] Se ejecuta como usuario no-root
- [ ] El healthcheck funciona correctamente
- [ ] El .dockerignore excluye archivos innecesarios
- [ ] El tamaño de la imagen es razonable para el lenguaje
- [ ] No se incluyen secretos ni credenciales en la imagen

## Errores Comunes

- **Ejecutar como root**: Siempre crear y usar un usuario no-root para seguridad.
- **Usar `latest` como tag**: Anclar versiones específicas para reproducibilidad.
- **No limpiar caché de apt**: Siempre agregar `rm -rf /var/lib/apt/lists/*` después de `apt-get install`.
- **Copiar todo antes de dependencias**: Las dependencias deben copiarse e instalarse antes del código fuente.
- **Secretos en la imagen**: Nunca incluir archivos .env, claves API o credenciales en la imagen.
- **Imagen demasiado grande**: Usar variantes alpine/slim, compilación multi-etapa, y .dockerignore.

## Habilidades Relacionadas

- `create-multistage-dockerfile` - Compilaciones multi-etapa para imágenes más pequeñas
- `optimize-docker-build-cache` - Optimizar caché de compilación Docker
- `create-r-dockerfile` - Dockerfiles específicos para R
- `setup-docker-compose` - Orquestación multi-contenedor
