---
name: setup-service-mesh
description: >
  Despliega y configura una malla de servicios (Istio o Linkerd) para habilitar la comunicación
  segura servicio a servicio, gestión del tráfico, observabilidad y aplicación de políticas en
  clústeres Kubernetes. Cubre instalación, configuración mTLS, enrutamiento de tráfico, disyuntor
  automático e integración con herramientas de monitoreo. Útil cuando los microservicios necesitan
  comunicación cifrada servicio a servicio, control granular del tráfico para despliegues canary
  o pruebas A/B, observabilidad de todas las interacciones de servicio sin cambios en la
  aplicación, o políticas consistentes de disyuntor y reintentos.
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
  complexity: advanced
  language: multi
  tags: service-mesh, istio, linkerd, mtls, traffic-management, observability, kubernetes
---

# Configurar Malla de Servicios

Despliega y configura una malla de servicios para la comunicación segura servicio a servicio y la gestión avanzada del tráfico.

## Cuándo Usar

- La arquitectura de microservicios requiere comunicación cifrada servicio a servicio
- Se necesita control granular del tráfico (despliegues canary, pruebas A/B, división del tráfico)
- Se requiere observabilidad de todas las interacciones de servicio sin cambios en la aplicación
- Se aplican políticas de seguridad (mTLS, autorización) a nivel de infraestructura
- Se implementan disyuntores, reintentos y tiempos de espera de forma consistente entre servicios
- Se necesitan trazas distribuidas y mapeo de dependencias de servicios

## Entradas

- **Requerido**: Clúster Kubernetes con acceso de administrador
- **Requerido**: Elección de malla de servicios (Istio o Linkerd)
- **Requerido**: Namespace(s) para habilitar la malla de servicios
- **Opcional**: Pila de monitoreo (Prometheus, Grafana, Jaeger)
- **Opcional**: Requisitos personalizados de gestión del tráfico
- **Opcional**: Configuración de autoridad certificadora para mTLS

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.

### Paso 1: Instalar el Plano de Control de la Malla de Servicios

Elige e instala el plano de control de la malla de servicios.

**Para Istio:**
```bash
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
istioctl install --set profile=production -y
kubectl get pods -n istio-system
```

**Para Linkerd:**
```bash
curl -sL https://run.linkerd.io/install | sh
linkerd check --pre
linkerd install --ha | kubectl apply -f -
linkerd check
```

Crea una configuración de malla de servicios con límites de recursos y trazas:
```yaml
# service-mesh-config.yaml (abbreviated)
spec:
  profile: production
  meshConfig:
    enableTracing: true
  components:
    pilot:
      k8s:
        resources: { requests: { cpu: 500m, memory: 2Gi } }
# See EXAMPLES.md Step 1 for complete configuration
```

**Esperado:** Pods del plano de control en ejecución en el namespace istio-system (Istio) o linkerd (Linkerd). `istioctl version` o `linkerd version` muestra versiones coincidentes de cliente y servidor.

**En caso de fallo:**
- Verifica que el clúster tiene recursos suficientes (al menos 4 núcleos CPU, 8GB RAM para producción)
- Comprueba la compatibilidad de la versión de Kubernetes (revisa la documentación de la malla)
- Revisa los registros: `kubectl logs -n istio-system -l app=istiod` o `kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- Comprueba CRDs en conflicto: `kubectl get crd | grep istio` o `kubectl get crd | grep linkerd`

### Paso 2: Habilitar la Inyección Automática del Sidecar

Configura los namespaces para la inyección automática del proxy sidecar.

**Para Istio:**
```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**Para Linkerd:**
```bash
# Annotate namespace for injection
kubectl annotate namespace default linkerd.io/inject=enabled
```

Prueba la inyección del sidecar con un despliegue de ejemplo:
```yaml
# test-deployment.yaml (abbreviated)
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: app
        image: nginx:alpine
# See EXAMPLES.md Step 2 for complete test deployment
```

Aplicar y verificar:
```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# Expect 2/2 containers (app + proxy)
```

**Esperado:** Los nuevos pods muestran 2/2 contenedores (aplicación + proxy sidecar). La salida de describe muestra el contenedor istio-proxy o linkerd-proxy. Los registros muestran el inicio correcto del proxy.

**En caso de fallo:**
- Comprueba las etiquetas/anotaciones del namespace: `kubectl get ns default -o yaml`
- Verifica que el webhook de mutación está activo: `kubectl get mutatingwebhookconfiguration`
- Revisa los registros de inyección: `kubectl logs -n istio-system -l app=sidecar-injector` (Istio)
- Inyecta manualmente para probar: `kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### Paso 3: Configurar la Política mTLS

Habilita TLS mutuo para la comunicación segura servicio a servicio.

**Para Istio:**
```yaml
# mtls-policy.yaml (abbreviated)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
# See EXAMPLES.md Step 3 for per-namespace and permissive mode examples
```

**Para Linkerd:**
```bash
# Linkerd enforces mTLS by default for meshed pods
linkerd viz tap deploy/test-app -n default
# Check for lock symbol
```

Aplicar y verificar:
```bash
kubectl apply -f mtls-policy.yaml
# Istio: verify mTLS status
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

**Esperado:** Todas las conexiones entre servicios en la malla muestran mTLS habilitado. El `tls-check` de Istio muestra STATUS como "OK". La salida de `tap` de Linkerd muestra un icono de candado para todas las conexiones. Los registros del servicio no muestran errores TLS.

**En caso de fallo:**
- Comprueba la emisión de certificados: `kubectl get certificates -A` (cert-manager)
- Verifica que la CA está en buen estado: `kubectl logs -n istio-system -l app=istiod | grep -i cert`
- Prueba primero con el modo PERMISSIVE y luego transiciona a STRICT
- Comprueba los servicios sin sidecars: `kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### Paso 4: Implementar Reglas de Gestión del Tráfico

Configura el enrutamiento inteligente del tráfico, reintentos y disyuntores.

Crea políticas de gestión del tráfico:
```yaml
# traffic-management.yaml (abbreviated)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
  - match:
    - uri: { prefix: /api/v2 }
    route:
    - destination: { host: api-service, subset: v2 }
      weight: 10
    - destination: { host: api-service, subset: v1 }
      weight: 90
    retries: { attempts: 3, perTryTimeout: 2s }
# See EXAMPLES.md Step 4 for complete routing, circuit breaker, and gateway configs
```

**Para la división del tráfico en Linkerd:**
```yaml
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
spec:
  service: api-service
  backends:
  - service: api-service-v1
    weight: 900
  - service: api-service-v2
    weight: 100
```

Aplicar y probar:
```bash
kubectl apply -f traffic-management.yaml
# Test traffic distribution
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
# Monitor: istioctl dashboard kiali or linkerd viz dashboard
```

**Esperado:** El tráfico se divide según los pesos definidos. El disyuntor se activa después de errores consecutivos. Los reintentos ocurren para fallos transitorios. El panel de Kiali/Linkerd muestra la visualización del flujo de tráfico.

**En caso de fallo:**
- Verifica que los hosts de destino se resuelven: `kubectl get svc -n production`
- Comprueba que las etiquetas de subconjunto coincidan con las etiquetas de los pods: `kubectl get pods -n production --show-labels`
- Revisa los registros de pilot: `kubectl logs -n istio-system -l app=istiod`
- Prueba primero sin disyuntor, luego agrégalo incrementalmente
- Usa `istioctl analyze` para comprobar la configuración: `istioctl analyze -n production`

### Paso 5: Integrar la Pila de Observabilidad

Conecta la telemetría de la malla de servicios a los sistemas de monitoreo y trazas.

**Instala los complementos de observabilidad:**
```bash
# Istio: Prometheus, Grafana, Kiali, Jaeger
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# Linkerd
linkerd viz install | kubectl apply -f -
linkerd jaeger install | kubectl apply -f -
```

Configura métricas y paneles personalizados:
```yaml
# service-monitor.yaml (abbreviated)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-mesh-metrics
spec:
  selector: { matchLabels: { app: istiod } }
  endpoints:
  - port: http-monitoring
    interval: 30s
# See EXAMPLES.md Step 5 for Grafana dashboards and telemetry config
```

Accede a los paneles:
```bash
istioctl dashboard grafana  # or: linkerd viz dashboard
istioctl dashboard kiali
istioctl dashboard jaeger
```

**Esperado:** Los paneles muestran la topología del servicio, tasas de solicitud, percentiles de latencia y tasas de error. Las trazas distribuidas están disponibles en Jaeger. Prometheus extrae métricas de la malla correctamente. Las métricas personalizadas aparecen en las consultas.

**En caso de fallo:**
- Verifica la extracción de Prometheus: `kubectl get servicemonitor -A`
- Comprueba que los pods del complemento están en ejecución: `kubectl get pods -n istio-system`
- Revisa la configuración de telemetría: `istioctl proxy-config log <pod-name> -n <namespace>`
- Verifica que la configuración de la malla tiene la telemetría habilitada: `kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`
- Comprueba los conflictos de puertos si falla el port-forward

### Paso 6: Validar y Monitorear el Estado de la Malla

Realiza verificaciones de salud exhaustivas y configura el monitoreo continuo.

```bash
# Istio validation
istioctl analyze --all-namespaces
istioctl verify-install
istioctl proxy-status

# Linkerd validation
linkerd check
linkerd viz check
linkerd diagnostics policy

# Check proxy sync status
kubectl get pods -n production -o json | \
  jq '.items[] | {name: .metadata.name, proxy: .status.containerStatuses[] | select(.name=="istio-proxy").ready}'

# Monitor control plane health
kubectl get pods -n istio-system -w
kubectl top pods -n istio-system
```

Crea un script de verificación de salud y alertas:
```bash
#!/bin/bash
# mesh-health-check.sh (abbreviated)
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
# See EXAMPLES.md Step 6 for complete health check script and alert configs
```

**Esperado:** Todas las verificaciones de análisis pasan sin advertencias. proxy-status muestra todos los proxies sincronizados. La verificación de mTLS confirma el cifrado. Las métricas muestran el flujo de tráfico. Los pods del plano de control son estables con bajo uso de recursos.

**En caso de fallo:**
- Aborda los problemas específicos de la salida de `istioctl analyze`
- Comprueba los registros del proxy para pods individuales: `kubectl logs <pod> -c istio-proxy -n <namespace>`
- Verifica que las políticas de red no bloquean el tráfico de la malla
- Revisa los registros del plano de control en busca de errores: `kubectl logs -n istio-system deploy/istiod --tail=100`
- Reinicia los proxies problemáticos: `kubectl rollout restart deploy/<deployment> -n <namespace>`

## Validación

- [ ] Pods del plano de control en ejecución y en buen estado (istiod/linkerd-controller)
- [ ] Proxies sidecar inyectados en todos los pods de la aplicación (2/2 contenedores)
- [ ] mTLS habilitado y funcionando (verificado con tls-check/tap)
- [ ] Las reglas de gestión del tráfico enrutan las solicitudes correctamente (verificado con pruebas curl)
- [ ] El disyuntor se activa en fallos repetidos (probado con inyección de fallos)
- [ ] Los paneles de observabilidad muestran métricas (Grafana/Kiali/Linkerd Viz)
- [ ] Las trazas distribuidas capturadas en Jaeger para solicitudes de muestra
- [ ] Sin advertencias de configuración de istioctl analyze/linkerd check
- [ ] El estado de sincronización del proxy muestra todos los proxies sincronizados
- [ ] La comunicación servicio a servicio está cifrada (verificado en registros/paneles)

## Errores Comunes

- **Agotamiento de recursos**: La malla de servicios añade 100-200MB de memoria por pod para los sidecars. Asegúrate de que el clúster tiene capacidad suficiente. Establece límites de recursos apropiados en la configuración de inyección.

- **Conflictos de configuración**: Múltiples VirtualServices para el mismo host causan comportamiento indefinido. Usa un único VirtualService por host con múltiples condiciones de coincidencia.

- **Vencimiento de certificados**: Los certificados mTLS se rotan automáticamente, pero la CA raíz debe gestionarse. Monitorea el vencimiento de certificados con: `kubectl get certificate -A` y configura alertas.

- **Sidecar no inyectado**: Los pods creados antes del etiquetado del namespace no tendrán sidecars. Deben recrearse: `kubectl rollout restart deploy/<name> -n <namespace>`.

- **Problemas de resolución DNS**: La malla de servicios intercepta el DNS. Usa nombres completamente calificados (service.namespace.svc.cluster.local) para llamadas entre namespaces.

- **Requisito de nombres de puertos**: Istio requiere puertos nombrados siguiendo el patrón nombre-de-protocolo (p. ej., http-web, tcp-db). Los puertos sin nombre utilizan TCP de paso.

- **Se requiere despliegue gradual**: No habilites mTLS STRICT inmediatamente en producción. Usa el modo PERMISSIVE durante la migración, verifica que todos los servicios están en la malla, luego cambia a STRICT.

- **Sobrecarga de observabilidad**: El muestreo de trazas al 100% causa problemas de rendimiento. Usa 1-10% para producción: `sampling: 1.0` en la configuración de la malla.

- **Confusión entre Gateway y VirtualService**: Gateway configura la entrada (balanceador de carga), VirtualService configura el enrutamiento. Ambos son necesarios para el tráfico externo.

- **Compatibilidad de versiones**: Asegúrate de que la versión de la malla es compatible con la versión de Kubernetes. Istio soporta n-1 versiones menores, Linkerd típicamente soporta las últimas 3 versiones de Kubernetes.

## Habilidades Relacionadas

- `configure-ingress-networking` - La configuración del Gateway complementa el Ingress de la malla
- `deploy-to-kubernetes` - Patrones de despliegue de aplicaciones que funcionan con la malla de servicios
- `setup-prometheus-monitoring` - Integración de Prometheus para métricas de la malla
- `manage-kubernetes-secrets` - Gestión de certificados para mTLS
- `enforce-policy-as-code` - Políticas OPA que funcionan junto con la autorización de la malla
