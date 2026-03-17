---
name: deploy-shinyproxy
description: >
  Desplegar ShinyProxy para alojar múltiples aplicaciones Shiny
  containerizadas. Cubre el despliegue de ShinyProxy con Docker, configuración
  de application.yml, imágenes Docker de apps Shiny, autenticación, backends
  de contenedores, seguimiento de uso y escalado. Úsalo al alojar múltiples
  apps Shiny detrás de un único punto de entrada, al necesitar autenticación y
  control de acceso por app, al desplegar apps Shiny como contenedores Docker
  aislados, o al escalar más allá del despliegue de app única con analíticas de
  uso y registro de auditoría.
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
  complexity: advanced
  language: R
  tags: shinyproxy, shiny, docker, deployment, multi-app, authentication, self-hosted
---

# Deploy ShinyProxy

Desplegar ShinyProxy para alojar múltiples aplicaciones Shiny containerizadas con autenticación y seguimiento de uso.

## Cuándo Usar

- Al alojar múltiples apps Shiny detrás de un único punto de entrada
- Al necesitar autenticación y control de acceso por app
- Al desplegar apps Shiny como contenedores Docker aislados
- Al escalar más allá del despliegue de app única (shinyapps.io o Docker independiente)
- Al requerir analíticas de uso y registro de auditoría

## Entradas

- **Requerido**: Una o más apps Shiny a desplegar
- **Requerido**: Servidor con Docker instalado
- **Opcional**: Proveedor de autenticación (LDAP, OpenID, social)
- **Opcional**: Nombre de dominio y certificado SSL
- **Opcional**: Orquestador de contenedores (Docker o Kubernetes)

## Procedimiento

### Paso 1: Crear Imágenes Docker de las Apps Shiny

Cada app Shiny necesita su propia imagen Docker. Ejemplo de `Dockerfile` para una app Shiny:

```dockerfile
FROM rocker/shiny:4.5.0

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN R -e "install.packages(c('shiny', 'bslib', 'DT', 'dplyr'), \
    repos='https://cloud.r-project.org/')"

COPY app/ /srv/shiny-server/app/

RUN chown -R shiny:shiny /srv/shiny-server/app

USER shiny
EXPOSE 3838
CMD ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
```

Compila y prueba cada app:

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

**Esperado:** Cada app Shiny se ejecuta de forma independiente en su propio contenedor.

### Paso 2: Configurar ShinyProxy

`application.yml`:

```yaml
proxy:
  title: "Shiny Applications"
  port: 8080
  container-backend: docker
  docker:
    internal-networking: true
  authentication: simple
  admin-groups: admins

  users:
    - name: admin
      password: admin_password
      groups: admins
    - name: analyst
      password: analyst_password
      groups: users

  specs:
    - id: dashboard
      display-name: "Analytics Dashboard"
      description: "Interactive data analysis dashboard"
      container-image: myorg/dashboard:latest
      container-cmd: ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
      container-network: shinyproxy-net
      port: 3838
      access-groups: [admins, users]

    - id: report-builder
      display-name: "Report Builder"
      description: "Generate custom reports"
      container-image: myorg/report-builder:latest
      container-cmd: ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
      container-network: shinyproxy-net
      port: 3838
      access-groups: [admins]

logging:
  file:
    name: /opt/shinyproxy/log/shinyproxy.log

server:
  forward-headers-strategy: native
```

### Paso 3: Desplegar ShinyProxy con Docker Compose

`docker-compose.yml`:

```yaml
services:
  shinyproxy:
    image: openanalytics/shinyproxy:3.1.1
    container_name: shinyproxy
    ports:
      - "8080:8080"
    volumes:
      - ./application.yml:/opt/shinyproxy/application.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - shinyproxy-logs:/opt/shinyproxy/log
    networks:
      - shinyproxy-net
    restart: unless-stopped

networks:
  shinyproxy-net:
    name: shinyproxy-net
    driver: bridge

volumes:
  shinyproxy-logs:
```

```bash
# Crear la red primero (ShinyProxy lanza contenedores en esta red)
docker network create shinyproxy-net

# Iniciar ShinyProxy
docker compose up -d

# Verificar registros
docker compose logs -f shinyproxy
```

**Esperado:** ShinyProxy arranca en el puerto 8080, muestra la página de inicio de sesión y lista las apps configuradas.

**En caso de fallo:** Verifica `docker compose logs shinyproxy`. Verifica que las imágenes de las apps estén disponibles localmente (`docker images`).

### Paso 4: Configurar la Autenticación

#### Simple (incorporada)

Como se muestra en el Paso 2 con `authentication: simple` y usuarios en línea.

#### LDAP

```yaml
proxy:
  authentication: ldap
  ldap:
    url: ldap://ldap.example.com:389/dc=example,dc=com
    manager-dn: cn=admin,dc=example,dc=com
    manager-password: ldap_admin_password
    user-search-base: ou=users
    user-search-filter: (uid={0})
    group-search-base: ou=groups
    group-search-filter: (member={0})
```

#### OpenID Connect (Keycloak, Auth0, etc.)

```yaml
proxy:
  authentication: openid
  openid:
    auth-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/auth
    token-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/token
    jwks-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/certs
    client-id: shinyproxy
    client-secret: your_client_secret
    roles-claim: realm_access.roles
```

### Paso 5: Añadir Proxy Inverso con Nginx

Para producción, coloca Nginx delante de ShinyProxy:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name shiny.example.com;

    ssl_certificate /etc/letsencrypt/live/shiny.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shiny.example.com/privkey.pem;

    location / {
        proxy_pass http://shinyproxy:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;
        proxy_buffering off;
    }
}
```

El soporte de WebSocket es crítico — ShinyProxy y Shiny usan WebSockets ampliamente.

### Paso 6: Seguimiento de Uso

ShinyProxy registra eventos de uso en su archivo de registro. Para seguimiento estructurado, configura InfluxDB:

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

Añade InfluxDB al stack de compose:

```yaml
services:
  influxdb:
    image: influxdb:1.8
    environment:
      INFLUXDB_DB: shinyproxy
      INFLUXDB_ADMIN_USER: admin
      INFLUXDB_ADMIN_PASSWORD: admin_password
    volumes:
      - influxdata:/var/lib/influxdb
    networks:
      - shinyproxy-net

volumes:
  influxdata:
```

### Paso 7: Límites de Recursos de las Apps

```yaml
specs:
  - id: dashboard
    container-image: myorg/dashboard:latest
    container-memory-limit: 1g
    container-cpu-limit: 1.0
    max-instances: 5
    container-env:
      R_MAX_MEM_SIZE: 768m
```

### Paso 8: Verificar el Despliegue

```bash
# Verificar el estado de ShinyProxy
curl -s http://localhost:8080/actuator/health

# Probar inicio de sesión
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# Listar apps via API
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

**Esperado:** El endpoint de estado devuelve `UP`. El inicio de sesión tiene éxito. Las apps se lanzan en contenedores aislados.

## Validación

- [ ] ShinyProxy arranca y muestra la página de inicio de sesión
- [ ] La autenticación funciona para todos los usuarios configurados
- [ ] Cada app Shiny se lanza en su propio contenedor
- [ ] Las conexiones WebSocket funcionan (la reactividad de Shiny funciona)
- [ ] Los grupos de acceso restringen la visibilidad de las apps correctamente
- [ ] La limpieza de contenedores funciona cuando los usuarios se desconectan
- [ ] Los registros capturan los eventos de uso

## Errores Comunes

- **Permisos del socket Docker**: ShinyProxy necesita acceso al socket Docker para lanzar contenedores. Ejecútalo como usuario en el grupo `docker` o monta el socket.
- **Red incorrecta**: Los contenedores de las apps deben estar en la misma red Docker que ShinyProxy (`container-network` en specs debe coincidir).
- **Proxy WebSocket**: Nginx u otros proxies delante de ShinyProxy deben reenviar las cabeceras de actualización de WebSocket.
- **Imagen no encontrada**: Las imágenes de las apps deben ser descargadas o compiladas localmente en el host Docker antes de que ShinyProxy intente usarlas.
- **Limpieza de contenedores**: Si ShinyProxy se cuelga, pueden quedar contenedores de apps huérfanos. Usa `docker ps` para verificar y limpiar.
- **Límites de memoria**: Las apps Shiny pueden consumir memoria significativa. Establece `container-memory-limit` para evitar que una sola app prive a las demás.

## Habilidades Relacionadas

- `deploy-shiny-app` — despliegue de app única en shinyapps.io, Posit Connect o Docker
- `configure-reverse-proxy` — patrones de proxy inverso incluyendo proxy WebSocket
- `create-dockerfile` — creación general de Dockerfiles para imágenes de apps
- `create-r-dockerfile` — Dockerfiles específicos de R con imágenes rocker
