---
name: optimize-cloud-costs
description: >
  Implementa estrategias de optimización de costos en la nube para cargas de trabajo de Kubernetes
  usando herramientas como Kubecost para visibilidad, recomendaciones de dimensionamiento correcto,
  escalado automático horizontal y vertical de pods, instancias spot/preemptibles y cuotas de
  recursos. Cubre la asignación de costos, informes de showback y prácticas de optimización
  continua. Útil cuando los costos de la nube crecen sin el correspondiente valor de negocio,
  cuando las solicitudes de recursos no están alineadas con el uso real, cuando el escalado manual
  lleva al sobreaprovisionamiento, o cuando se implementan showback y chargeback para la
  responsabilidad interna de costos.
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
  tags: cost-optimization, kubecost, hpa, vpa, spot-instances, resource-management, kubernetes
---

# Optimizar Costos en la Nube

Implementa estrategias integrales de optimización de costos para clústeres Kubernetes para reducir el gasto en la nube.

## Cuándo Usar

- Cuando los costos de infraestructura en la nube crecen sin el correspondiente aumento del valor de negocio
- Al necesitar visibilidad sobre la asignación de costos por equipo, aplicación o entorno
- Cuando las solicitudes/límites de recursos no están alineados con los patrones de uso real
- Cuando el escalado manual lleva al sobreaprovisionamiento y el desperdicio
- Al querer aprovechar instancias spot/preemptibles para cargas de trabajo no críticas
- Al necesitar implementar showback o chargeback para la asignación interna de costos
- Al buscar establecer una cultura FinOps con conciencia y responsabilidad de costos

## Entradas

- **Requerido**: Clúster Kubernetes con cargas de trabajo en ejecución
- **Requerido**: Acceso a la API de facturación del proveedor de la nube
- **Requerido**: Servidor de métricas o Prometheus para métricas de recursos
- **Opcional**: Datos históricos de uso para análisis de tendencias
- **Opcional**: Requisitos de asignación de costos (por namespace, etiqueta, equipo)
- **Opcional**: Objetivos de nivel de servicio (SLOs) para restricciones de rendimiento
- **Opcional**: Límites de presupuesto u objetivos de reducción de costos

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.


### Paso 1: Desplegar Herramientas de Visibilidad de Costos

Instala Kubecost u OpenCost para el monitoreo y la asignación de costos.

**Instalar Kubecost:**
```bash
# Add Kubecost Helm repository
helm repo add kubecost https://kubecost.github.io/cost-analyzer/
helm repo update

# Install Kubecost with Prometheus integration
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set kubecostToken="your-token-here" \
  --set prometheus.server.global.external_labels.cluster_id="production-cluster" \
  --set prometheus.nodeExporter.enabled=true \
  --set prometheus.serviceAccounts.nodeExporter.create=true

# For existing Prometheus, configure Kubecost to use it
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set prometheus.enabled=false \
  --set global.prometheus.fqdn="http://prometheus-server.monitoring.svc.cluster.local" \
  --set global.prometheus.enabled=true

# Verify installation
kubectl get pods -n kubecost
kubectl get svc -n kubecost

# Access Kubecost UI
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090
# Open http://localhost:9090
```

**Configurar la integración con el proveedor de la nube:**
```yaml
# kubecost-cloud-integration.yaml
apiVersion: v1
kind: Secret
metadata:
  name: cloud-integration
  namespace: kubecost
type: Opaque
stringData:
  # For AWS
  cloud-integration.json: |
    {
      "aws": [
        {
          "serviceKeyName": "AWS_ACCESS_KEY_ID",
          "serviceKeySecret": "AWS_SECRET_ACCESS_KEY",
          "athenaProjectID": "cur-query-results",
          "athenaBucketName": "s3://your-cur-bucket",
          "athenaRegion": "us-east-1",
          "athenaDatabase": "athenacurcfn_my_cur",
          "athenaTable": "my_cur"
        }
      ]
    }
---
# For GCP
apiVersion: v1
kind: Secret
metadata:
  name: gcp-key
  namespace: kubecost
type: Opaque
data:
  key.json: <base64-encoded-service-account-key>
---
# For Azure
apiVersion: v1
kind: ConfigMap
metadata:
  name: azure-config
  namespace: kubecost
data:
  azure.json: |
    {
      "azureSubscriptionID": "your-subscription-id",
      "azureClientID": "your-client-id",
      "azureClientSecret": "your-client-secret",
      "azureTenantID": "your-tenant-id",
      "azureOfferDurableID": "MS-AZR-0003P"
    }
```

Aplica la integración con la nube:
```bash
kubectl apply -f kubecost-cloud-integration.yaml

# Verify cloud costs are being imported
kubectl logs -n kubecost -l app=cost-analyzer -c cost-model --tail=100 | grep -i "cloud"

# Check Kubecost API for cost data
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
curl http://localhost:9090/model/allocation\?window\=7d | jq .
```

**Esperado:** Pods de Kubecost en ejecución correctamente. Interfaz accesible mostrando el desglose de costos por namespace, despliegue, pod. Los costos del proveedor de la nube se importan (puede tardar 24-48 horas para la sincronización inicial). La API devuelve datos de asignación.

**En caso de fallo:**
- Comprueba que Prometheus está en ejecución y accesible: `kubectl get svc -n monitoring prometheus-server`
- Verifica que las credenciales de la nube tienen acceso a la API de facturación
- Revisa los registros del modelo de costos: `kubectl logs -n kubecost -l app=cost-analyzer -c cost-model`
- Asegúrate de que el servidor de métricas o el exportador de nodos de Prometheus está recopilando métricas de recursos
- Comprueba las políticas de red que bloquean el acceso a las API de facturación de la nube

### Paso 2: Analizar la Utilización Actual de Recursos

Identifica los recursos sobreaprovisionados y las oportunidades de optimización.

**Consulta la utilización de recursos:**
```bash
# Get resource requests vs usage for all pods
kubectl top pods --all-namespaces --containers | \
  awk 'NR>1 {print $1,$2,$3,$4,$5}' > current-usage.txt

# Compare requests to actual usage
cat <<'EOF' > analyze-utilization.sh
#!/bin/bash
echo "Pod,Namespace,CPU-Request,CPU-Usage,Memory-Request,Memory-Usage"
for ns in $(kubectl get ns -o jsonpath='{.items[*].metadata.name}'); do
  kubectl get pods -n $ns -o json | jq -r '
    .items[] |
    select(.status.phase == "Running") |
    {
      name: .metadata.name,
      namespace: .metadata.namespace,
      containers: [
        .spec.containers[] |
        {
          name: .name,
          cpuReq: .resources.requests.cpu,
          memReq: .resources.requests.memory
        }
      ]
    } |
    "\(.name),\(.namespace),\(.containers[].cpuReq // "none"),\(.containers[].memReq // "none")"
  ' 2>/dev/null
done
EOF

chmod +x analyze-utilization.sh
./analyze-utilization.sh > resource-requests.csv

# Get actual usage from metrics server
kubectl top pods --all-namespaces --containers > actual-usage.txt
```

**Usa las recomendaciones de Kubecost:**
```bash
# Get right-sizing recommendations via API
curl "http://localhost:9090/model/savings/requestSizing?window=7d" | jq . > recommendations.json

# Extract top wasteful resources
jq '.data[] | select(.totalRecommendedSavings > 10) | {
  cluster: .clusterID,
# ... (see EXAMPLES.md for complete configuration)
```

**Crea el panel de utilización:**
```yaml
# grafana-utilization-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: utilization-dashboard
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Vista clara de las solicitudes de recursos actuales frente al uso real. Identificación de pods con <30% de utilización (sobreaprovisionados). Lista de oportunidades de optimización con ahorros estimados. Panel mostrando tendencias de utilización a lo largo del tiempo.

**En caso de fallo:**
- Asegúrate de que el servidor de métricas está en ejecución: `kubectl get deployment metrics-server -n kube-system`
- Comprueba si Prometheus tiene métricas del exportador de nodos: `curl http://prometheus:9090/api/v1/query?query=node_cpu_seconds_total`
- Verifica que los pods han estado en ejecución el tiempo suficiente para datos significativos (al menos 24 horas)
- Comprueba las lagunas en la recopilación de métricas: revisa la retención y los intervalos de extracción de Prometheus
- Para Kubecost, asegúrate de que ha recopilado al menos 48 horas de datos

### Paso 3: Implementar el Escalado Automático Horizontal de Pods (HPA)

Configura el escalado automático basado en CPU, memoria o métricas personalizadas.

**Crea HPA para el escalado basado en CPU:**
```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Despliega y verifica el HPA:**
```bash
kubectl apply -f hpa-cpu.yaml

# Check HPA status
kubectl get hpa -n production
kubectl describe hpa api-server-hpa -n production

# Monitor scaling events
kubectl get events -n production --field-selector involvedObject.kind=HorizontalPodAutoscaler --watch

# Generate load to test autoscaling
kubectl run load-generator --rm -it --image=busybox -- /bin/sh -c \
  "while true; do wget -q -O- http://api-server.production.svc.cluster.local; done"

# Watch replicas scale
watch kubectl get hpa,deployment -n production
```

**Esperado:** HPA creado y mostrando las métricas actuales/objetivo. Los pods escalan hacia arriba bajo carga. Los pods escalan hacia abajo cuando la carga disminuye (después del período de estabilización). Los eventos de escalado registrados. Sin comportamiento oscilante (ciclos rápidos de escala arriba/abajo).

**En caso de fallo:**
- Verifica que el servidor de métricas está en ejecución: `kubectl get apiservice v1beta1.metrics.k8s.io`
- Comprueba si el despliegue tiene establecidas las solicitudes de recursos (HPA lo requiere)
- Revisa los eventos de HPA: `kubectl describe hpa api-server-hpa -n production`
- Asegúrate de que el despliegue destino no está en el máximo de réplicas
- Para métricas personalizadas, verifica que el adaptador de métricas está instalado y configurado
- Comprueba los registros del controlador HPA: `kubectl logs -n kube-system -l app=kube-controller-manager | grep horizontal-pod-autoscaler`

### Paso 4: Configurar el Escalado Automático Vertical de Pods (VPA)

Ajusta automáticamente las solicitudes de recursos basándose en los patrones de uso reales.

**Instala VPA:**
```bash
# Clone VPA repository
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler

# Install VPA
./hack/vpa-up.sh

# Verify installation
kubectl get pods -n kube-system | grep vpa

# Check VPA CRDs
kubectl get crd | grep verticalpodautoscaler
```

**Crea políticas VPA:**
```yaml
# vpa-policies.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-server-vpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Despliega y monitorea el VPA:**
```bash
kubectl apply -f vpa-policies.yaml

# Check VPA recommendations
kubectl get vpa -n production
kubectl describe vpa api-server-vpa -n production

# View detailed recommendations
kubectl get vpa api-server-vpa -n production -o jsonpath='{.status.recommendation}' | jq .

# Monitor VPA-initiated pod updates
kubectl get events -n production --field-selector involvedObject.kind=VerticalPodAutoscaler --watch

# Compare recommendations to current requests
kubectl get deployment api-server -n production -o json | \
  jq '.spec.template.spec.containers[].resources.requests'
```

**Esperado:** VPA proporcionando recomendaciones o actualizando automáticamente las solicitudes de recursos. Las recomendaciones basadas en patrones de uso por percentil (típicamente P95). Los pods se reinician con nuevas solicitudes al usar el modo Auto/Recreate. Sin conflictos entre HPA y VPA (usa HPA para réplicas, VPA para recursos por pod).

**En caso de fallo:**
- Asegúrate de que el servidor de métricas tiene datos suficientes (VPA necesita varios días para recomendaciones precisas)
- Comprueba que los componentes VPA están en ejecución: `kubectl get pods -n kube-system | grep vpa`
- Revisa los registros del controlador de admisión VPA: `kubectl logs -n kube-system -l app=vpa-admission-controller`
- Verifica que el webhook está registrado: `kubectl get mutatingwebhookconfigurations vpa-webhook-config`
- No uses VPA y HPA en la misma métrica (CPU/memoria) - causa conflictos
- Comienza con el modo "Off" para revisar las recomendaciones antes de habilitar las actualizaciones automáticas

### Paso 5: Aprovechar las Instancias Spot/Preemptibles

Configura la programación de cargas de trabajo en instancias spot rentables.

**Crea grupos de nodos con instancias spot:**
```yaml
# For AWS (via Karpenter)
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-provisioner
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Configura las cargas de trabajo para instancias spot:**
```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Despliega y monitorea el uso de spot:**
```bash
kubectl apply -f spot-workload.yaml

# Monitor spot node allocation
kubectl get nodes -l node-type=spot

# Check workload distribution
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Las cargas de trabajo programadas en nodos spot correctamente. Reducción significativa de costos (típicamente 60-90% frente a bajo demanda). Manejo gracioso de las interrupciones spot con reprogramación de pods. El monitoreo muestra la tasa de interrupción spot y la recuperación correcta.

**En caso de fallo:**
- Verifica la disponibilidad de instancias spot en tu región/zonas
- Comprueba que las etiquetas y manchas de los nodos coinciden con las tolerancias de la carga de trabajo
- Revisa los registros de Karpenter: `kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter`
- Asegúrate de que las cargas de trabajo son sin estado o tienen una gestión de estado adecuada para las interrupciones
- Prueba el manejo de interrupciones: acorralona y vacía manualmente el nodo spot
- Monitorea la tasa de interrupción: si es demasiado alta, considera el retroceso a nodos bajo demanda

### Paso 6: Implementar Cuotas de Recursos y Alertas de Presupuesto

Establece límites estrictos y alertas para el control de costos.

**Crea cuotas de recursos:**
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Configura alertas de presupuesto:**
```yaml
# kubecost-budget-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: budget-alerts
  namespace: kubecost
# ... (see EXAMPLES.md for complete configuration)
```

Aplica y monitorea:
```bash
kubectl apply -f resource-quotas.yaml
kubectl apply -f kubecost-budget-alerts.yaml

# Check quota usage
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Las cuotas de recursos aplican límites por namespace. La creación de pods se bloquea cuando se supera la cuota. Las alertas de presupuesto se activan cuando se superan los umbrales. La detección de picos de costos funciona. Se envían informes regulares a las partes interesadas.

**En caso de fallo:**
- Verifica que ResourceQuota y LimitRange se aplicaron correctamente: `kubectl get resourcequota,limitrange -A`
- Comprueba los pods fallando debido a la cuota: `kubectl get events -n production | grep quota`
- Revisa la configuración de alertas de Kubecost: `kubectl logs -n kubecost -l app=cost-analyzer | grep alert`
- Asegúrate de que Prometheus tiene métricas de Kubecost: `curl http://prometheus:9090/api/v1/query?query=kubecost_monthly_cost`
- Prueba el enrutamiento de alertas: verifica la configuración de webhook de correo electrónico/Slack

## Validación

- [ ] Kubecost u OpenCost desplegado y mostrando datos de costos precisos
- [ ] Integración de facturación del proveedor de la nube funcionando (los costos coinciden con las facturas reales)
- [ ] El análisis de utilización de recursos identifica cargas de trabajo sobreaprovisionadas
- [ ] HPA escala los pods según la carga (verificado con prueba de carga)
- [ ] VPA proporcionando recomendaciones o ajustando automáticamente las solicitudes de recursos
- [ ] Las instancias spot manejan las interrupciones de forma graciosa
- [ ] Las cuotas de recursos aplican límites por namespace
- [ ] Las alertas de presupuesto se activan cuando se superan los umbrales
- [ ] El costo mensual tiende a la baja o se mantiene dentro del presupuesto
- [ ] Informes de showback generados para equipos/proyectos
- [ ] Sin degradación del rendimiento por las optimizaciones de costos
- [ ] Documentación actualizada con prácticas de optimización

## Errores Comunes

- **Dimensionamiento correcto agresivo**: No apliques inmediatamente las recomendaciones del VPA. Comienza con el modo "Off", revisa las sugerencias durante una semana, luego aplícalas gradualmente. Los cambios repentinos pueden causar OOMKills o estrangulamiento de CPU.

- **Conflicto HPA + VPA**: Nunca uses HPA y VPA en la misma métrica (CPU/memoria). Usa HPA para el escalado horizontal, VPA para el ajuste de recursos por pod, o HPA en métricas personalizadas + VPA en recursos.

- **Spot sin tolerancia a fallos**: Solo ejecuta cargas de trabajo tolerantes a fallos y sin estado en spot. Nunca bases de datos, servicios con estado o servicios críticos de réplica única. Usa siempre PodDisruptionBudgets.

- **Período de monitoreo insuficiente**: Las decisiones de optimización de costos necesitan datos históricos. Espera al menos 7 días antes de hacer cambios, 30 días para las recomendaciones de VPA, 90 días para el análisis de tendencias.

- **Ignorar los requisitos de ráfaga**: Establecer límites demasiado bajos basándose en el uso promedio causa estrangulamiento durante los picos de tráfico. Usa percentiles P95 o P99, no el promedio, para la planificación de capacidad.

- **Costos de salida de red**: Los costos de cómputo son visibles en Kubecost, pero la salida (transferencia de datos) puede ser significativa. Monitorea el tráfico entre zonas de disponibilidad, usa enrutamiento con conocimiento de la topología, considera los costos de transferencia de datos en la arquitectura.

- **Almacenamiento pasado por alto**: Los costos de PersistentVolume a menudo se olvidan. Audita los PVC no utilizados, ajusta el tamaño de los volúmenes, usa la expansión de volúmenes en lugar del sobreaprovisionamiento, implementa políticas de limpieza de PV.

- **Cuota demasiado restrictiva**: Establecer cuotas demasiado bajas bloquea el crecimiento legítimo. Revisa el uso de cuotas mensualmente, ajusta según las necesidades reales, comunica los límites a los equipos antes de la aplicación.

- **Ahorros falsos por métricas incorrectas**: Usar CPU/memoria como única métrica de optimización pasa por alto los costos de E/S, red y almacenamiento. Considera el costo total de propiedad, no solo el cómputo.

- **Chargeback antes de la confianza**: Implementar el chargeback antes de que los equipos entiendan y confíen en los datos de costos causa fricción. Comienza con showback (informativo), construye una cultura de conciencia de costos, luego pasa al chargeback.

## Habilidades Relacionadas

- `deploy-to-kubernetes` - Despliegue de aplicaciones con solicitudes de recursos apropiadas
- `setup-prometheus-monitoring` - Infraestructura de monitoreo para métricas de costos
- `plan-capacity` - Planificación de capacidad basada en costos y rendimiento
- `setup-local-kubernetes` - Desarrollo local para evitar costos de la nube
- `write-helm-chart` - Plantillas de solicitudes y límites de recursos
- `implement-gitops-workflow` - GitOps para configuraciones optimizadas en costos
