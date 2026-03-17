---
name: deploy-to-kubernetes
description: >
  Despliega aplicaciones en clústeres de Kubernetes usando manifiestos kubectl para
  Deployments, Services, ConfigMaps, Secrets y recursos Ingress. Implementa verificaciones
  de salud, límites de recursos, actualizaciones progresivas y empaquetado de charts Helm
  para despliegues en producción. Útil al desplegar nuevas aplicaciones en EKS, GKE, AKS
  o clústeres autohospedados, migrar de Docker Compose a orquestación de contenedores,
  implementar actualizaciones progresivas sin tiempo de inactividad, o configurar despliegues
  multientorno entre dev, staging y producción.
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
  tags: kubernetes, k8s, kubectl, deployment, service
---

# Desplegar en Kubernetes

Despliega aplicaciones contenerizadas en Kubernetes con configuraciones listas para producción, incluyendo verificaciones de salud, gestión de recursos y despliegues automatizados.

## Cuándo Usar

- Al desplegar nuevas aplicaciones en clústeres de Kubernetes (EKS, GKE, AKS, autohospedados)
- Al migrar de Docker Compose o VMs tradicionales a orquestación de contenedores
- Al implementar actualizaciones progresivas sin tiempo de inactividad y reversiones
- Al gestionar la configuración de aplicaciones y secretos en Kubernetes
- Al configurar despliegues multientorno (dev, staging, producción)
- Al crear charts Helm reutilizables para distribución de aplicaciones

## Entradas

- **Requerido**: Acceso al clúster de Kubernetes (`kubectl cluster-info`)
- **Requerido**: Imágenes de contenedor subidas al registro (Docker Hub, ECR, GCR, Harbor)
- **Requerido**: Requisitos de la aplicación (puertos, variables de entorno, volúmenes)
- **Opcional**: Certificados TLS para ingress HTTPS
- **Opcional**: Requisitos de almacenamiento persistente (StatefulSets, PVCs)
- **Opcional**: CLI de Helm para despliegues basados en charts

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.


### Paso 1: Crear Namespace y Cuotas de Recursos

Organiza las aplicaciones en namespaces con límites de recursos y RBAC.

```bash
# Create namespace
kubectl create namespace myapp-prod

# Apply resource quota
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: myapp-prod
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
    persistentvolumeclaims: "5"
    services.loadbalancers: "2"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: myapp-prod
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    type: Container
EOF

# Create service account
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp
  namespace: myapp-prod
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: myapp-role
  namespace: myapp-prod
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: myapp-rolebinding
  namespace: myapp-prod
subjects:
- kind: ServiceAccount
  name: myapp
  namespace: myapp-prod
roleRef:
  kind: Role
  name: myapp-role
  apiGroup: rbac.authorization.k8s.io
EOF

# Verify namespace setup
kubectl get resourcequota -n myapp-prod
kubectl get limitrange -n myapp-prod
kubectl get sa -n myapp-prod
```

**Esperado:** Namespace creado con cuotas de recursos limitando el cómputo y el almacenamiento. LimitRange establece solicitudes y límites predeterminados de CPU/memoria. ServiceAccount configurado con RBAC de mínimo privilegio.

**En caso de fallo:** Para errores de cuota, verifica que el clúster tiene recursos suficientes con `kubectl describe nodes`. Para errores de RBAC, comprueba los permisos de cluster-admin con `kubectl auth can-i create role --namespace myapp-prod`. Usa `kubectl describe` en los recursos rechazados para ver las violaciones de cuota/límite.

### Paso 2: Configurar Secretos y ConfigMaps de la Aplicación

Externaliza la configuración y los datos sensibles usando ConfigMaps y Secrets.

```bash
# Create ConfigMap from literal values
kubectl create configmap myapp-config \
  --namespace=myapp-prod \
  --from-literal=LOG_LEVEL=info \
  --from-literal=API_TIMEOUT=30s \
  --from-literal=FEATURE_FLAGS='{"newUI":true,"betaAPI":false}'

# Create ConfigMap from file
cat > app.properties <<EOF
database.pool.size=20
cache.ttl=3600
retry.attempts=3
EOF

kubectl create configmap myapp-properties \
  --namespace=myapp-prod \
  --from-file=app.properties

# Create Secret for database credentials
kubectl create secret generic myapp-db-secret \
  --namespace=myapp-prod \
  --from-literal=username=appuser \
  --from-literal=password='sup3rs3cr3t!' \
  --from-literal=connection-string='postgresql://db.example.com:5432/myapp'

# Create TLS secret for ingress
kubectl create secret tls myapp-tls \
  --namespace=myapp-prod \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key

# Verify secrets/configmaps
kubectl get configmap -n myapp-prod
kubectl get secret -n myapp-prod
kubectl describe configmap myapp-config -n myapp-prod
```

Para configuraciones más complejas, usa manifiestos YAML:

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  namespace: myapp-prod
data:
  nginx.conf: |
    server {
      listen 8080;
      location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
      }
    }
  app-config.json: |
    {
      "logLevel": "info",
      "features": {
        "authentication": true,
        "metrics": true
      }
    }
---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
  namespace: myapp-prod
type: Opaque
stringData:  # Automatically base64 encoded
  api-key: "sk-1234567890abcdef"
  jwt-secret: "my-jwt-signing-key"
```

**Esperado:** Los ConfigMaps almacenan configuración no sensible, los Secrets almacenan credenciales/claves. Los valores son accesibles para los Pods mediante variables de entorno o montajes de volumen. Los secrets TLS tienen el formato correcto para recursos Ingress.

**En caso de fallo:** Para problemas de codificación, usa `stringData` en lugar de `data` en YAML. Para errores de secret TLS, verifica el formato del certificado y la clave con `openssl x509 -in tls.crt -text -noout`. Para problemas de acceso, comprueba los permisos RBAC de la ServiceAccount. Muestra el secret decodificado con `kubectl get secret myapp-secret -o jsonpath='{.data.api-key}' | base64 -d`.

### Paso 3: Crear Deployment con Verificaciones de Salud y Límites de Recursos

Despliega la aplicación con configuración lista para producción, incluyendo sondas y gestión de recursos.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: myapp-prod
  labels:
    app: myapp
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero-downtime updates
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: myapp
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: myapp
        image: myregistry.io/myapp:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: myapp-config
              key: LOG_LEVEL
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: myapp-db-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: myapp-db-secret
              key: password
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /healthz
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        startupProbe:
          httpGet:
            path: /healthz
            port: http
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30  # 5 minutes for slow startup
        volumeMounts:
        - name: config
          mountPath: /etc/myapp
          readOnly: true
        - name: cache
          mountPath: /var/cache/myapp
      volumes:
      - name: config
        configMap:
          name: myapp-properties
      - name: cache
        emptyDir: {}
      imagePullSecrets:
      - name: registry-credentials
```

Aplica y monitorea el despliegue:

```bash
# Apply deployment
kubectl apply -f deployment.yaml

# Watch rollout status
kubectl rollout status deployment/myapp -n myapp-prod

# Check pod status
kubectl get pods -n myapp-prod -l app=myapp

# View pod logs
kubectl logs -n myapp-prod -l app=myapp --tail=50 -f

# Describe deployment for events
kubectl describe deployment myapp -n myapp-prod

# Check resource usage
kubectl top pods -n myapp-prod -l app=myapp
```

**Esperado:** El Deployment crea 3 réplicas con estrategia de actualización progresiva. Los Pods pasan las sondas de disponibilidad antes de recibir tráfico. Las sondas de vida reinician los pods no saludables. Las solicitudes/límites de recursos previenen los OOM kills. Los registros muestran un inicio exitoso de la aplicación.

**En caso de fallo:** Para ImagePullBackOff, verifica que la imagen existe y que imagePullSecret es válido con `kubectl get secret registry-credentials -o yaml`. Para CrashLoopBackOff, comprueba los registros con `kubectl logs pod-name --previous`. Para fallos de sonda, prueba los endpoints manualmente con `kubectl port-forward` y `curl localhost:8080/healthz`. Para pods OOMKilled, aumenta los límites de memoria o investiga las fugas de memoria.

### Paso 4: Exponer la Aplicación con Services y Balanceadores de Carga

Crea recursos Service para exponer aplicaciones interna y externamente.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Aplica y prueba los servicios:

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** El Service LoadBalancer aprovisiona un LB externo con IP/hostname público. El Service ClusterIP proporciona DNS interno estable. La lista de endpoints muestra las IPs de Pods saludables. Las solicitudes curl tienen éxito con las respuestas esperadas.

**En caso de fallo:** Para LoadBalancer pendiente, comprueba la integración del proveedor de nube y las cuotas. Para ausencia de endpoints, verifica que las etiquetas del Pod coinciden con el selector del Service con `kubectl get pods --show-labels`. Para conexión rechazada, verifica que targetPort coincide con el puerto del contenedor. Usa `kubectl port-forward` para omitir la capa Service al depurar.

### Paso 5: Configurar el Escalado Automático Horizontal de Pods

Implementa escalado automático basado en CPU/memoria o métricas personalizadas.

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Instala metrics-server si no está disponible:

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** HPA monitorea las métricas de CPU/memoria. Cuando se superan los umbrales, las réplicas escalan hasta maxReplicas. Cuando la carga disminuye, las réplicas se reducen gradualmente (la ventana de estabilización previene el aleteo). Las métricas son visibles con `kubectl top`.

**En caso de fallo:** Para métricas "unknown", verifica que metrics-server está en ejecución y que los Pods tienen solicitudes de recursos definidas. Para ausencia de escalado, comprueba que la utilización actual supera los objetivos con `kubectl top pods`. Para aleteo, aumenta stabilizationWindowSeconds. Para escalado lento, reduce periodSeconds en las políticas de scaleUp.

### Paso 6: Empaquetar la Aplicación con un Chart Helm

Crea un chart Helm reutilizable para despliegues multientorno.

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** El chart Helm empaqueta todos los recursos de Kubernetes con valores con plantilla. El dry-run muestra los manifiestos renderizados. La instalación despliega todos los recursos en el orden correcto. Las actualizaciones realizan actualizaciones progresivas. La reversión vuelve a la revisión anterior.

**En caso de fallo:** Para errores de plantilla, ejecuta `helm template .` para renderizar localmente sin instalar. Para problemas de dependencias, ejecuta `helm dependency update`. Para fallos de anulación de valores, verifica que la ruta YAML existe en values.yaml. Usa `helm get manifest myapp -n myapp-prod` para ver los recursos desplegados reales.

## Validación

- [ ] Pods en estado Running con todos los contenedores listos
- [ ] Las sondas de disponibilidad pasan antes de que los Pods se agreguen a los endpoints del Service
- [ ] Las sondas de vida reinician automáticamente los contenedores no saludables
- [ ] Las solicitudes y límites de recursos previenen los OOM kills y el sobrecompromiso del nodo
- [ ] Los Secrets y ConfigMaps están montados correctamente con los valores esperados
- [ ] Los Services se resuelven vía DNS (cluster.local) desde otros Pods
- [ ] LoadBalancer/Ingress es accesible desde redes externas
- [ ] HPA escala las réplicas hacia arriba bajo carga y hacia abajo cuando está inactivo
- [ ] Las actualizaciones progresivas se completan sin tiempo de inactividad
- [ ] Los registros se recopilan y son accesibles vía kubectl logs o registro centralizado

## Errores Comunes

- **Sondas de disponibilidad faltantes**: Los Pods reciben tráfico antes de iniciarse completamente. Siempre implementa sondas de disponibilidad que verifiquen las dependencias de la aplicación.

- **Tiempo de inicio insuficiente**: Las sondas de vida rápidas matan las aplicaciones de inicio lento. Usa startupProbe con un failureThreshold generoso para la inicialización.

- **Sin límites de recursos**: Los Pods consumen CPU/memoria ilimitada causando inestabilidad del nodo. Siempre establece solicitudes y límites.

- **Configuración codificada**: Los valores específicos del entorno en los manifiestos impiden la reutilización. Usa ConfigMaps, Secrets y valores de Helm.

- **Cuenta de servicio predeterminada**: Los Pods tienen permisos de clúster innecesarios. Crea ServiceAccounts dedicados con RBAC mínimo.

- **Sin estrategia de actualización progresiva**: Los Deployments recrean todos los Pods simultáneamente causando tiempo de inactividad. Usa RollingUpdate con maxUnavailable: 0.

- **Secretos en control de versiones**: Datos sensibles confirmados en Git. Usa sealed-secrets, external-secrets-operator o vault.

- **Sin presupuesto de interrupción de pods**: El mantenimiento del clúster drena nodos y rompe el servicio. Crea PodDisruptionBudget para garantizar réplicas disponibles mínimas.

## Habilidades Relacionadas

- `setup-docker-compose` - Fundamentos de orquestación de contenedores antes de Kubernetes
- `containerize-mcp-server` - Creación de imágenes de contenedor para el despliegue
- `write-helm-chart` - Desarrollo avanzado de charts Helm
- `manage-kubernetes-secrets` - SealedSecrets y external-secrets-operator
- `configure-ingress-networking` - Configuración de NGINX Ingress y cert-manager
- `implement-gitops-workflow` - ArgoCD/Flux para despliegues declarativos
- `setup-container-registry` - Integración del registro de imágenes
