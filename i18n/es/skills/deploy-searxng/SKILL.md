---
name: deploy-searxng
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Desplegar una instancia auto-alojada de SearXNG con Docker Compose, proxy inverso Nginx,
  y configuración personalizada de motores de búsqueda. Cubrir seguridad, rendimiento,
  y personalización de la interfaz. Usar cuando se necesite un metabuscador privado,
  búsqueda agregada sin rastreo, o una alternativa auto-alojada a buscadores comerciales.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: searxng, search-engine, self-hosted, docker, privacy
---

# Desplegar SearXNG

Desplegar un metabuscador SearXNG auto-alojado con Docker y configuración personalizada.

## Cuándo Usar

- Necesitando un metabuscador privado sin rastreo
- Queriendo agregar resultados de múltiples motores de búsqueda
- Desplegando una alternativa auto-alojada a buscadores comerciales
- Requiriendo búsqueda personalizable para un equipo u organización
- Integrando búsqueda privada con otras herramientas (MCP, API)

## Entradas

- **Requerido**: Servidor con Docker y Docker Compose instalados
- **Requerido**: Nombre de dominio (para acceso externo) o acceso localhost
- **Opcional**: Certificados TLS para HTTPS
- **Opcional**: Configuración de motores de búsqueda preferidos
- **Opcional**: Personalización de interfaz (tema, idioma)

## Procedimiento

### Paso 1: Configurar Estructura del Proyecto

```bash
mkdir -p searxng/{config,data}
cd searxng
```

Crear `docker-compose.yml`:

```yaml
version: '3.8'

services:
  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    ports:
      - "8080:8080"
    volumes:
      - ./config:/etc/searxng:rw
      - ./data:/var/log/searxng:rw
    environment:
      - SEARXNG_BASE_URL=https://busqueda.ejemplo.com/
      - SEARXNG_SECRET_KEY=clave_secreta_larga_y_aleatoria
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    restart: unless-stopped
```

**Esperado:** Estructura de directorios creada, docker-compose.yml configurado.

**En caso de fallo:** Verificar permisos de escritura en los directorios, asegurar que Docker está instalado.

### Paso 2: Configurar SearXNG

Crear `config/settings.yml`:

```yaml
use_default_settings: true

general:
  debug: false
  instance_name: "Mi Buscador"

search:
  safe_search: 0
  autocomplete: "google"
  default_lang: "es"

server:
  secret_key: "clave_secreta_larga_y_aleatoria"
  bind_address: "0.0.0.0"
  port: 8080
  limiter: true

ui:
  default_theme: simple
  default_locale: es
  query_in_title: true

engines:
  - name: google
    engine: google
    shortcut: g
    disabled: false

  - name: duckduckgo
    engine: duckduckgo
    shortcut: ddg
    disabled: false

  - name: wikipedia
    engine: wikipedia
    shortcut: wp
    disabled: false
```

**Esperado:** SearXNG configurado con motores de búsqueda, idioma predeterminado, y seguridad.

**En caso de fallo:** Validar sintaxis YAML, verificar que el secret_key es único y largo.

### Paso 3: Configurar Proxy Inverso (Opcional)

Para acceso externo con HTTPS, configurar Nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name busqueda.ejemplo.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Limitar acceso (opcional)
        # allow 192.168.0.0/16;
        # deny all;
    }
}
```

**Esperado:** SearXNG accesible vía HTTPS a través de Nginx.

**En caso de fallo:** Verificar certificados TLS, comprobar que Nginx puede resolver el upstream.

### Paso 4: Iniciar y Verificar

```bash
# Iniciar SearXNG
docker compose up -d

# Verificar estado
docker compose ps
docker compose logs searxng

# Probar búsqueda
curl "http://localhost:8080/search?q=test&format=json"
```

**Esperado:** SearXNG ejecutándose y respondiendo a consultas de búsqueda.

**En caso de fallo:** Revisar logs del contenedor, verificar configuración de motores de búsqueda, comprobar conectividad de red.

## Validación

- [ ] SearXNG se inicia sin errores
- [ ] La interfaz web es accesible y funcional
- [ ] Las búsquedas devuelven resultados de múltiples motores
- [ ] El idioma predeterminado es el configurado
- [ ] Las capacidades de seguridad están limitadas (cap_drop: ALL)
- [ ] HTTPS funciona a través del proxy inverso (si está configurado)

## Errores Comunes

- **Secret key débil o predeterminada**: Usar una clave aleatoria larga. SearXNG rechaza claves débiles.
- **Rate limiting de motores**: Los motores de búsqueda pueden bloquear IPs con muchas solicitudes. Habilitar el limiter integrado.
- **Motores deshabilitados silenciosamente**: Algunos motores requieren configuración adicional. Verificar en la página de preferencias.
- **Permisos de directorio**: Los directorios montados deben ser escribibles por el usuario del contenedor.
- **Base URL incorrecta**: Debe coincidir exactamente con la URL de acceso, incluyendo el protocolo y la barra final.

## Habilidades Relacionadas

- `configure-nginx` - Configuración detallada de Nginx como proxy
- `configure-reverse-proxy` - Patrones de proxy inverso con Traefik
- `setup-compose-stack` - Stacks Docker Compose multi-servicio
