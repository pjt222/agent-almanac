---
name: configure-reverse-proxy
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Configurar patrones de proxy inverso con Nginx y Traefik para enrutamiento de tráfico,
  terminación TLS, descubrimiento de servicios, y balanceo de carga. Cubrir configuración
  estática y dinámica, middleware, y patrones de despliegue. Usar cuando se necesite
  exponer múltiples servicios bajo un único dominio, implementar enrutamiento basado en
  paths, o automatizar la gestión de certificados TLS.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: nginx, traefik, reverse-proxy, tls, service-discovery, load-balancing
---

# Configurar Proxy Inverso

Configurar patrones de proxy inverso con Nginx y Traefik para enrutamiento y seguridad.

## Cuándo Usar

- Exponiendo múltiples servicios bajo un único dominio con enrutamiento por paths
- Necesitando terminación TLS automática con Let's Encrypt
- Implementando descubrimiento dinámico de servicios con Docker
- Balanceando carga entre múltiples instancias de un servicio
- Configurando middleware para autenticación, rate limiting, o redirecciones

## Entradas

- **Requerido**: Servicios backend con sus puertos y paths
- **Requerido**: Nombres de dominio para enrutamiento
- **Opcional**: Certificados TLS o configuración de Let's Encrypt
- **Opcional**: Reglas de middleware (autenticación, rate limiting)
- **Opcional**: Configuración de healthchecks para upstreams

## Procedimiento

### Paso 1: Elegir entre Nginx y Traefik

**Nginx**: Mejor para configuración estática, alto rendimiento, flexibilidad total.
**Traefik**: Mejor para descubrimiento dinámico con Docker, certificados automáticos, dashboard integrado.

**Esperado:** Proxy seleccionado según los requisitos del proyecto.

**En caso de fallo:** Comenzar con Nginx si se necesita control total, Traefik si se prioriza la automatización.

### Paso 2: Configurar Nginx como Proxy Inverso

```nginx
# Enrutamiento basado en paths
server {
    listen 443 ssl http2;
    server_name api.ejemplo.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # API principal
    location /api/v1/ {
        proxy_pass http://api-service:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Servicio de autenticación
    location /auth/ {
        proxy_pass http://auth-service:8001/;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://ws-service:8002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Esperado:** Las solicitudes se enrutan al servicio correcto basándose en el path.

**En caso de fallo:** Verificar barras finales en `proxy_pass` (afectan el reescritura de paths), comprobar resolución DNS de upstreams.

### Paso 3: Configurar Traefik con Docker

```yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@ejemplo.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  api:
    image: mi-api:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.ejemplo.com`)"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=8000"

volumes:
  letsencrypt:
```

**Esperado:** Traefik descubre automáticamente servicios Docker, genera certificados TLS con Let's Encrypt.

**En caso de fallo:** Verificar acceso al socket de Docker, comprobar que las etiquetas son correctas, revisar el dashboard de Traefik.

### Paso 4: Verificar y Probar

```bash
# Probar enrutamiento
curl -v https://api.ejemplo.com/api/v1/health
curl -v https://api.ejemplo.com/auth/status

# Verificar certificados TLS
openssl s_client -connect api.ejemplo.com:443 -servername api.ejemplo.com

# Probar balanceo de carga
for i in $(seq 1 10); do curl -s https://api.ejemplo.com/api/v1/instance; done
```

**Esperado:** Las solicitudes se enrutan correctamente, TLS funciona, el balanceo de carga distribuye tráfico.

**En caso de fallo:** Revisar logs del proxy, verificar resolución DNS, comprobar reglas de firewall.

## Validación

- [ ] Las solicitudes se enrutan al servicio correcto por path/host
- [ ] TLS funciona con certificados válidos
- [ ] El balanceo de carga distribuye tráfico entre instancias
- [ ] Las cabeceras de proxy se pasan correctamente al backend
- [ ] WebSocket funciona a través del proxy
- [ ] Los healthchecks detectan backends no disponibles

## Errores Comunes

- **Barras finales en proxy_pass**: `proxy_pass http://backend/` (con barra) reescribe el path; sin barra no lo reescribe.
- **WebSocket sin upgrade headers**: Requiere `proxy_http_version 1.1` y cabeceras Upgrade/Connection.
- **Timeout de conexión**: Backends lentos causan 504. Aumentar `proxy_read_timeout` y `proxy_connect_timeout`.
- **Socket Docker expuesto sin protección**: El socket Docker da acceso root. Usar modo lectura (`:ro`) y considerar Docker socket proxy.
- **Certificados Let's Encrypt fallando**: Verificar que el puerto 80 es accesible desde Internet para el desafío HTTP.

## Habilidades Relacionadas

- `configure-nginx` - Configuración detallada de Nginx como servidor web
- `setup-compose-stack` - Integrar proxy en stacks Docker Compose
- `configure-ingress-networking` - Ingress controllers en Kubernetes
