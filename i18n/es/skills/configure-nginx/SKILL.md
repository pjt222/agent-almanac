---
name: configure-nginx
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Configurar Nginx como servidor web y proxy inverso con terminación TLS, balanceo de
  carga, caché, y cabeceras de seguridad. Cubrir la configuración de hosts virtuales,
  upstreams, rate limiting, y optimización de rendimiento. Usar cuando se necesite servir
  contenido estático, hacer proxy de aplicaciones backend, o configurar HTTPS.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: nginx, web-server, reverse-proxy, tls, load-balancing
---

# Configurar Nginx

Configurar Nginx como servidor web y proxy inverso con mejores prácticas de seguridad y rendimiento.

## Cuándo Usar

- Sirviendo contenido estático con alto rendimiento
- Configurando proxy inverso para aplicaciones backend
- Habilitando terminación TLS/HTTPS
- Implementando balanceo de carga entre múltiples instancias
- Configurando rate limiting y cabeceras de seguridad
- Haciendo proxy de aplicaciones WebSocket

## Entradas

- **Requerido**: Servicios backend a los que hacer proxy (direcciones y puertos)
- **Requerido**: Nombres de dominio para hosts virtuales
- **Opcional**: Certificados TLS (o usar Let's Encrypt)
- **Opcional**: Reglas de caché para contenido estático
- **Opcional**: Configuración de rate limiting

## Procedimiento

### Paso 1: Instalar y Configurar Nginx Base

```bash
# Instalar Nginx
sudo apt-get update && sudo apt-get install -y nginx

# O usar Docker
docker run -d -p 80:80 -p 443:443 \
  -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
  -v ./ssl:/etc/nginx/ssl:ro \
  nginx:1.25-alpine
```

Configuración principal (`/etc/nginx/nginx.conf`):

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    # Rendimiento
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Incluir configuraciones de sitios
    include /etc/nginx/conf.d/*.conf;
}
```

**Esperado:** Nginx instalado y ejecutándose, configuración base optimizada para rendimiento.

**En caso de fallo:** Validar configuración con `nginx -t`, revisar logs de error.

### Paso 2: Configurar Proxy Inverso

```nginx
# /etc/nginx/conf.d/app.conf
upstream backend {
    server app1:8000;
    server app2:8000;
    server app3:8000;
}

server {
    listen 80;
    server_name ejemplo.com www.ejemplo.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ejemplo.com www.ejemplo.com;

    # TLS
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Cabeceras de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy al backend
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Contenido estático
    location /static/ {
        alias /var/www/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Esperado:** El proxy inverso enruta tráfico al backend, TLS configurado, cabeceras de seguridad presentes.

**En caso de fallo:** Verificar resolución DNS de upstreams, comprobar certificados TLS, probar con `curl -v`.

### Paso 3: Configurar Rate Limiting

```nginx
http {
    # Definir zonas de rate limit
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        # Rate limiting general para API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
        }

        # Rate limiting estricto para login
        location /api/login {
            limit_req zone=login burst=5;
            proxy_pass http://backend;
        }
    }
}
```

**Esperado:** Los rate limits protegen el backend de abuso, las respuestas 429 se envían cuando se excede el límite.

**En caso de fallo:** Ajustar tasas según el tráfico real, monitorizar respuestas 429 en logs.

### Paso 4: Verificar Configuración

```bash
# Validar sintaxis
sudo nginx -t

# Recargar configuración (sin tiempo de inactividad)
sudo nginx -s reload

# Verificar respuesta
curl -I https://ejemplo.com

# Verificar cabeceras de seguridad
curl -sI https://ejemplo.com | grep -E "X-Frame|X-Content|Strict"
```

**Esperado:** Nginx valida y recarga sin errores, las cabeceras de seguridad están presentes.

**En caso de fallo:** Revisar logs de error (`/var/log/nginx/error.log`), verificar permisos de archivos.

## Validación

- [ ] Nginx inicia sin errores (`nginx -t` pasa)
- [ ] El proxy inverso enruta correctamente al backend
- [ ] TLS/HTTPS funciona con certificados válidos
- [ ] Las cabeceras de seguridad están presentes en las respuestas
- [ ] El rate limiting funciona según la configuración
- [ ] El contenido estático se sirve con caché adecuada
- [ ] Los logs capturan solicitudes y errores

## Errores Comunes

- **Olvidar `proxy_set_header Host`**: El backend no recibe el hostname correcto. Siempre establecer cabeceras de proxy.
- **Certificados TLS expirados**: Configurar renovación automática con Let's Encrypt/certbot.
- **Rate limiting demasiado agresivo**: Usuarios legítimos bloqueados. Comenzar conservador y ajustar.
- **No habilitar gzip**: El tráfico de texto sin comprimir desperdicia ancho de banda. Habilitar gzip.
- **Resolver DNS de upstreams al inicio**: Usar `resolver` para DNS dinámico con servicios en contenedores.

## Habilidades Relacionadas

- `configure-reverse-proxy` - Patrones avanzados de proxy inverso con Traefik
- `setup-compose-stack` - Integrar Nginx en stacks Docker Compose
- `deploy-searxng` - Ejemplo práctico de Nginx como proxy para SearXNG
