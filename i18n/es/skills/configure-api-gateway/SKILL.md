---
name: configure-api-gateway
description: >
  Despliega y configura una puerta de enlace de API (Kong o Traefik) para gestionar el tráfico
  de API, autenticación, limitación de velocidad, transformación de solicitudes/respuestas y
  enrutamiento. Cubre configuración de plugins, servicios ascendentes, gestión de consumidores e
  integración con infraestructura existente. Útil cuando múltiples servicios backend necesitan un
  punto de conexión de API unificado, se requiere autenticación o limitación de velocidad
  centralizada, se implementa versionado de API, o se necesitan análisis detallados y balanceo
  de carga para microservicios.
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
  domain: devops
  complexity: intermediate
  language: multi
  tags: api-gateway, kong, traefik, rate-limiting, authentication, routing, middleware
---

# Configurar Puerta de Enlace de API

Despliega y configura una puerta de enlace de API para la gestión centralizada del tráfico de API y la aplicación de políticas.

## Cuándo Usar

- Cuando múltiples servicios backend necesitan un punto de conexión de API unificado con políticas consistentes
- Se requiere autenticación/autorización centralizada para el acceso a las API
- Se necesita limitación de velocidad y gestión de cuotas entre APIs
- Se desean transformar solicitudes/respuestas sin modificar los servicios backend
- Se implementan estrategias de versionado y deprecación de API
- Se necesitan análisis y monitoreo detallados de API
- Se requiere descubrimiento de servicios y balanceo de carga para microservicios

## Entradas

- **Requerido**: Clúster Kubernetes o entorno Docker
- **Requerido**: Elección de puerta de enlace de API (Kong o Traefik)
- **Requerido**: Puntos de conexión del servicio backend a proxiar
- **Opcional**: Proveedor de autenticación (OAuth2, OIDC, claves API)
- **Opcional**: Requisitos de limitación de velocidad (solicitudes por minuto/hora)
- **Opcional**: Configuraciones de middleware o plugin personalizadas
- **Opcional**: Certificados TLS para puntos de conexión HTTPS

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.

### Paso 1: Instalar la Puerta de Enlace de API

Despliega la puerta de enlace con base de datos (Kong) o configuración basada en archivos (Traefik).

**Para Kong con PostgreSQL:**
```yaml
# kong-deployment.yaml (excerpt - see EXAMPLES.md for complete file)
apiVersion: v1
kind: Namespace
metadata:
  name: kong
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
  namespace: kong
spec:
  replicas: 2
  # ... (PostgreSQL, migrations, services - see EXAMPLES.md)
```

**Para Traefik:**
```yaml
# traefik-deployment.yaml (excerpt - see EXAMPLES.md for complete file)
apiVersion: v1
kind: Namespace
metadata:
  name: traefik
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik
spec:
  replicas: 2
  # ... (RBAC, ConfigMap, services - see EXAMPLES.md)
```

Consulta [EXAMPLES.md](references/EXAMPLES.md#step-1-install-api-gateway) para los manifiestos de despliegue completos.

Desplegar:
```bash
kubectl apply -f kong-deployment.yaml  # OR traefik-deployment.yaml
kubectl wait --for=condition=ready pod -l app=kong -n kong --timeout=300s
kubectl get svc -n kong kong-proxy  # Get load balancer IP
```

**Esperado:** Pods de la puerta de enlace en ejecución con 2 réplicas. El servicio LoadBalancer tiene IP externa asignada. API de administración accesible (Kong: puerto 8001, Traefik: panel en puerto 8080). Verificaciones de salud pasando.

**En caso de fallo:**
- Comprueba los registros del pod: `kubectl logs -n kong -l app=kong`
- Verifica la conexión a la base de datos (Kong): `kubectl logs -n kong kong-migrations-<hash>`
- Comprueba los permisos de la cuenta de servicio (Traefik): `kubectl get clusterrolebinding traefik -o yaml`
- Asegúrate de que los puertos no estén ya ocupados: `kubectl get svc --all-namespaces | grep 8000`

### Paso 2: Configurar los Servicios Backend y las Rutas

Define los servicios ascendentes y crea rutas para exponer las API.

**Para Kong (usando decK para configuración declarativa):**
```bash
# Install decK CLI
curl -sL https://github.com/Kong/deck/releases/download/v1.28.0/deck_1.28.0_linux_amd64.tar.gz | tar -xz
sudo mv deck /usr/local/bin/

# Create kong.yaml with services, routes, upstreams
# (see EXAMPLES.md for complete configuration)
deck sync --kong-addr http://localhost:8001 -s kong.yaml
curl -i http://localhost:8001/routes  # Verify routes
```

**Para Traefik (usando IngressRoute CRD):**
```yaml
# traefik-routes.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: user-api-route
spec:
  entryPoints: [websecure]
  routes:
  - match: Host(`api.example.com`) && PathPrefix(`/api/users`)
    # ... (see EXAMPLES.md for full configuration)
```

Aplicar rutas:
```bash
kubectl apply -f traefik-routes.yaml
curl -H "Host: api.example.com" https://GATEWAY_IP/api/users
```

Consulta [EXAMPLES.md](references/EXAMPLES.md#step-2-configure-backend-services-and-routes) para las configuraciones de enrutamiento completas.

**Esperado:** Las rutas proxytan correctamente el tráfico a los servicios backend. El enrutamiento ponderado distribuye el tráfico según la configuración. Las verificaciones de salud monitorizan la disponibilidad del servicio backend.

**En caso de fallo:**
- Verifica que los servicios backend están en ejecución: `kubectl get svc -n default`
- Comprueba la resolución DNS: `kubectl run test --rm -it --image=busybox -- nslookup user-service.default.svc.cluster.local`
- Revisa los registros de la puerta de enlace: `kubectl logs -n kong -l app=kong --tail=50`
- Valida la configuración: `deck validate -s kong.yaml`

### Paso 3: Implementar Autenticación y Autorización

Configura plugins/middleware de autenticación para la seguridad de la API.

**Para Kong (autenticación con clave API y JWT):**
```yaml
# kong-auth-config.yaml (excerpt)
consumers:
- username: mobile-app
  custom_id: app-001

keyauth_credentials:
- consumer: mobile-app
  key: mobile-secret-key-123

plugins:
- name: key-auth
  service: user-api
  # ... (see EXAMPLES.md for full configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-auth-config.yaml
curl -i -H "apikey: mobile-secret-key-123" http://GATEWAY_IP/api/users
```

**Para Traefik (BasicAuth y middleware ForwardAuth):**
```yaml
# traefik-auth-middleware.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: basic-auth-middleware
spec:
  basicAuth:
    secret: basic-auth
    removeHeader: true
# ... (see EXAMPLES.md for OAuth2, rate limiting)
```

```bash
kubectl apply -f traefik-auth-middleware.yaml
curl -u user1:password https://GATEWAY_IP/api/protected
```

Consulta [EXAMPLES.md](references/EXAMPLES.md#step-3-implement-authentication-and-authorization) para las configuraciones de autenticación completas.

**Esperado:** Las solicitudes no autenticadas devuelven 401. Las credenciales válidas permiten el acceso. La limitación de velocidad devuelve 429 después del umbral. Los tokens JWT se validan correctamente. ACL aplica permisos de grupo.

**En caso de fallo:**
- Verifica la creación del consumidor: `curl http://localhost:8001/consumers`
- Comprueba que el plugin está habilitado: `curl http://localhost:8001/plugins | jq .`
- Prueba con verbose: `curl -v` para ver los encabezados de respuesta
- Valida el JWT: usa jwt.io para decodificar el token

### Paso 4: Configurar la Transformación de Solicitudes/Respuestas

Agrega middleware para transformar solicitudes y respuestas.

**Para Kong:**
```yaml
# kong-transformations.yaml (excerpt)
plugins:
- name: request-transformer
  service: user-api
  config:
    add:
      headers: [X-Gateway-Version:1.0, X-Request-ID:$(uuid)]
    remove:
      headers: [X-Internal-Token]
- name: correlation-id
  # ... (see EXAMPLES.md for full configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-transformations.yaml
```

**Para Traefik:**
```yaml
# traefik-transformations.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: add-headers
spec:
  headers:
    customRequestHeaders:
      X-Gateway-Version: "1.0"
    # ... (see EXAMPLES.md for circuit breaker, retry, chain)
```

```bash
kubectl apply -f traefik-transformations.yaml
curl -v https://GATEWAY_IP/api/users | grep X-Gateway
```

Consulta [EXAMPLES.md](references/EXAMPLES.md#step-4-configure-requestresponse-transformation) para las configuraciones de transformación completas.

**Esperado:** Los encabezados de solicitud se añaden/eliminan según la configuración. Los encabezados de respuesta incluyen metadatos de la puerta de enlace. Las solicitudes grandes se rechazan con 413. El disyuntor se activa en fallos repetidos. Los reintentos ocurren para errores transitorios.

**En caso de fallo:**
- Verifica el orden del middleware en la cadena
- Comprueba los conflictos de encabezados con los servicios backend
- Prueba las transformaciones individualmente antes de encadenarlas
- Revisa los registros en busca de errores de transformación

### Paso 5: Habilitar el Monitoreo y los Análisis

Configura métricas, registro y paneles para la visibilidad de la API.

**Configuración de monitoreo de Kong:**
```yaml
# kong-monitoring.yaml (excerpt)
plugins:
- name: prometheus
  config:
    per_consumer: true
- name: http-log
  service: user-api
  # ... (see EXAMPLES.md for Datadog, file-log configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-monitoring.yaml

# Deploy ServiceMonitor (see EXAMPLES.md)
kubectl apply -f kong-servicemonitor.yaml
curl http://localhost:8100/metrics
```

**Monitoreo de Traefik (incorporado):**
```yaml
# ServiceMonitor (excerpt - see EXAMPLES.md for Grafana dashboard)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: traefik-metrics
spec:
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
```

```bash
kubectl port-forward -n traefik svc/traefik-dashboard 8080:8080
# Open http://localhost:8080/dashboard/
```

Consulta [EXAMPLES.md](references/EXAMPLES.md#step-5-enable-monitoring-and-analytics) para las configuraciones de monitoreo completas.

**Esperado:** Prometheus extrae métricas de la puerta de enlace correctamente. Los paneles muestran tasas de solicitud, percentiles de latencia y tasas de error. Los registros se reenvían al sistema de agregación. Las métricas segmentadas por servicio, ruta y consumidor.

**En caso de fallo:**
- Verifica el ServiceMonitor: `kubectl get servicemonitor -A`
- Comprueba los destinos de Prometheus en la interfaz
- Asegúrate de que el puerto de métricas es accesible: `kubectl port-forward -n kong svc/kong-metrics 8100:8100`
- Valida la accesibilidad del punto de conexión de registros

### Paso 6: Implementar el Versionado y la Deprecación de API

Configura la gestión de versiones y la deprecación gradual de API.

**Estrategia de versionado de Kong:**
```yaml
# kong-versioning.yaml (excerpt)
services:
- name: user-api-v1
  url: http://user-service-v1.default.svc.cluster.local:8080
  routes:
  - name: user-v1-route
    paths: [/api/v1/users]
  plugins:
  - name: response-transformer
    config:
      add:
        headers:
        - X-Deprecation-Notice:"API v1 deprecated on 2024-12-31"
        - Sunset:"Wed, 31 Dec 2024 23:59:59 GMT"
# ... (see EXAMPLES.md for v2, default routing, rate limits)
```

**Versionado de Traefik:**
```yaml
# traefik-versioning.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: v1-deprecation-headers
spec:
  headers:
    customResponseHeaders:
      X-Deprecation-Notice: "API v1 deprecated on 2024-12-31"
# ... (see EXAMPLES.md for complete IngressRoutes)
```

Prueba el versionado:
```bash
curl -i https://api.example.com/api/v1/users  # Deprecated
curl -i https://api.example.com/api/v2/users  # Current
curl -i https://api.example.com/api/users     # Routes to v2
```

Consulta [EXAMPLES.md](references/EXAMPLES.md#step-6-implement-api-versioning-and-deprecation) para las configuraciones de versionado completas.

**Esperado:** Las diferentes versiones enrutan a los servicios backend apropiados. Los encabezados de deprecación están presentes en las respuestas de v1. Los límites de velocidad son más estrictos para las versiones deprecadas. La ruta predeterminada enruta a la última versión. Las métricas segmentadas por versión de API.

**En caso de fallo:**
- Verifica la configuración de precedencia/prioridad de rutas (mayor prioridad = evaluada primero)
- Comprueba los patrones de ruta que se superponen
- Prueba la ruta de cada versión de forma independiente
- Revisa los registros de enrutamiento para la coincidencia de rutas
- Asegúrate de que los servicios backend para cada versión están en ejecución

## Validación

- [ ] Pods de la puerta de enlace de API en ejecución con múltiples réplicas para HA
- [ ] El servicio LoadBalancer tiene IP externa asignada
- [ ] Las rutas proxytan correctamente el tráfico a los servicios backend
- [ ] La autenticación/autorización aplica el control de acceso (respuestas 401/403)
- [ ] La limitación de velocidad devuelve 429 después de exceder las cuotas
- [ ] La transformación de solicitudes/respuestas añade/elimina encabezados correctamente
- [ ] El disyuntor se activa en fallos repetidos del backend
- [ ] Las métricas expuestas y extraídas por Prometheus
- [ ] Los paneles muestran tasas de solicitud, latencia y errores
- [ ] El versionado de API enruta solicitudes a las versiones backend correctas
- [ ] Los encabezados de deprecación están presentes en versiones anteriores de la API
- [ ] Las verificaciones de salud monitorizan la disponibilidad del servicio backend

## Errores Comunes

- **Dependencia de base de datos (Kong)**: Kong con base de datos requiere PostgreSQL/Cassandra. El modo sin base de datos está disponible pero limita algunas características (cambios de configuración en tiempo de ejecución). Usa el modo con base de datos para producción con múltiples instancias de la puerta de enlace.

- **Orden de coincidencia de rutas**: Las rutas/IngressRoutes se evalúan en un orden específico. Las rutas más específicas deben tener mayor prioridad. Las rutas superpuestas causan enrutamiento impredecible. Prueba con `curl -v` para verificar qué ruta se alcanza realmente.

- **Omisión de autenticación**: Asegúrate de que los plugins de autenticación se aplican a todas las rutas. Es fácil añadir una ruta sin autenticación. Usa plugins predeterminados a nivel de servicio, luego anúlalos por ruta según sea necesario.

- **Ámbito de la limitación de velocidad**: La limitación de velocidad `policy: local` cuenta por pod de la puerta de enlace. Para límites consistentes entre réplicas, usa política centralizada (Redis) o sesiones pegajosas.

- **Configuración de CORS**: La puerta de enlace de API debe gestionar CORS, no los servicios individuales. Añade el plugin/middleware CORS de forma temprana para evitar fallos de comprobación previa del navegador.

- **Terminación SSL/TLS**: La puerta de enlace típicamente termina SSL. Asegúrate de que los certificados sean válidos y que la renovación automática esté configurada. Usa cert-manager para la gestión de certificados en Kubernetes.

- **Verificaciones de salud ascendentes**: Configura verificaciones de salud activas para detectar rápidamente los fallos del backend. Las verificaciones pasivas dependen del tráfico real y pueden ser más lentas para detectar problemas.

- **Orden de ejecución de plugins/middleware**: El orden importa. Autenticación antes de la limitación de velocidad (evita desperdiciar cuota para solicitudes no válidas). Transformación antes del registro (registra los valores transformados).

- **Límites de recursos**: Los pods de la puerta de enlace pueden consumir CPU significativa bajo carga. Establece solicitudes/límites de recursos apropiados. Monitorea el estrangulamiento de CPU en producción.

- **Estrategia de migración**: No habilites todos los plugins a la vez. Despliega incrementalmente: enrutamiento → autenticación → limitación de velocidad → transformaciones → características avanzadas.

## Habilidades Relacionadas

- `configure-ingress-networking` - La configuración del controlador Ingress complementa la puerta de enlace de API
- `setup-service-mesh` - La malla de servicios proporciona gestión complementaria del tráfico este-oeste
- `manage-kubernetes-secrets` - Gestión de certificados y credenciales para la puerta de enlace
- `setup-prometheus-monitoring` - Integración de monitoreo para métricas de la puerta de enlace
- `enforce-policy-as-code` - La aplicación de políticas que complementa la autorización de la puerta de enlace
