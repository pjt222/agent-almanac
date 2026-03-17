---
name: deploy-to-kubernetes
description: >
  Anwendungen mit kubectl-Manifesten fuer Deployments, Services, ConfigMaps, Secrets
  und Ingress-Ressourcen in Kubernetes-Clustern deployen. Health-Checks, Ressourcenlimits,
  Rolling Updates und Helm-Chart-Paketierung fuer Produktions-Deployments implementieren.
  Einsatz beim Deployen neuer Anwendungen in EKS, GKE, AKS oder selbst-gehosteten
  Clustern, bei der Migration von Docker Compose zu Container-Orchestrierung, beim
  Implementieren von Zero-Downtime-Rolling-Updates oder beim Einrichten
  Multi-Umgebungs-Deployments.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
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

# In Kubernetes deployen

Containerisierte Anwendungen mit produktionsreifen Konfigurationen inklusive Health-Checks, Ressourcenverwaltung und automatisierten Rollouts in Kubernetes deployen.

## Wann verwenden

- Neue Anwendungen in Kubernetes-Cluster deployen (EKS, GKE, AKS, selbst-gehostet)
- Von Docker Compose oder traditionellen VMs zu Container-Orchestrierung migrieren
- Zero-Downtime-Rolling-Updates und Rollbacks implementieren
- Anwendungskonfiguration und Secrets in Kubernetes verwalten
- Multi-Umgebungs-Deployments einrichten (Dev, Staging, Production)
- Wiederverwendbare Helm-Charts fuer Anwendungsverteilung erstellen

## Eingaben

- **Erforderlich**: Kubernetes-Cluster-Zugang (`kubectl cluster-info`)
- **Erforderlich**: Container-Images in Registry gepusht (Docker Hub, ECR, GCR, Harbor)
- **Erforderlich**: Anwendungsanforderungen (Ports, Umgebungsvariablen, Volumes)
- **Optional**: TLS-Zertifikate fuer HTTPS-Ingress
- **Optional**: Anforderungen an persistenten Speicher (StatefulSets, PVCs)
- **Optional**: Helm CLI fuer Chart-basierte Deployments

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

### Schritt 1: Namespace und Ressourcenkontingente erstellen

Anwendungen in Namespaces mit Ressourcenlimits und RBAC organisieren.

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

**Erwartet:** Namespace mit Ressourcenkontingenten erstellt, die Compute und Speicher begrenzen. LimitRange setzt Standard-CPU/Speicher-Anforderungen und -Limits. ServiceAccount mit Least-Privilege-RBAC konfiguriert.

**Bei Fehler:** Bei Kontingentfehlern Cluster-Ressourcen mit `kubectl describe nodes` pruefen. Bei RBAC-Fehlern Cluster-Admin-Berechtigungen mit `kubectl auth can-i create role --namespace myapp-prod` pruefen.

### Schritt 2: Anwendungs-Secrets und ConfigMaps konfigurieren

Konfiguration und sensible Daten mit ConfigMaps und Secrets externalisieren.

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

Fuer komplexere Konfigurationen YAML-Manifeste verwenden:

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

**Erwartet:** ConfigMaps speichern nicht-sensible Konfiguration, Secrets speichern Credentials/Schluessel. Werte sind fuer Pods ueber Umgebungsvariablen oder Volume-Mounts zugaenglich.

**Bei Fehler:** Bei Codierungsproblemen `stringData` statt `data` in YAML verwenden. Bei TLS-Secret-Fehlern Zertifikat- und Schluessel-Format mit `openssl x509 -in tls.crt -text -noout` pruefen.

### Schritt 3: Deployment mit Health-Checks und Ressourcenlimits erstellen

Anwendung mit produktionsreifer Konfiguration inklusive Probes und Ressourcenverwaltung deployen.

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

Deployment anwenden und ueberwachen:

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

**Erwartet:** Deployment erstellt 3 Replikas mit Rolling-Update-Strategie. Pods bestehen Readiness-Probes, bevor sie Traffic empfangen. Liveness-Probes starten ungesunde Pods neu. Ressourcenanforderungen/-limits verhindern OOM-Kills.

**Bei Fehler:** Bei ImagePullBackOff pruefen, ob das Image existiert und imagePullSecret gueltig ist. Bei CrashLoopBackOff Logs mit `kubectl logs pod-name --previous` pruefen. Bei Probe-Fehlern Endpunkte manuell mit `kubectl port-forward` und `curl localhost:8080/healthz` testen.

### Schritt 4: Anwendung mit Services und Load-Balancern exponieren

Service-Ressourcen erstellen, um Anwendungen intern und extern verfuegbar zu machen.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Services anwenden und testen:

```bash
# Apply services
kubectl apply -f service.yaml

# Get service details
kubectl get svc -n myapp-prod

# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** LoadBalancer-Service stellt externen LB mit oeffentlicher IP/Hostname bereit. ClusterIP-Service bietet stabilen internen DNS. Endpoints-Liste zeigt gesunde Pod-IPs.

**Bei Fehler:** Bei ausstehendem LoadBalancer Cloud-Provider-Integration und Kontingente pruefen. Bei keinen Endpoints Pod-Labels mit Service-Selector mit `kubectl get pods --show-labels` abgleichen.

### Schritt 5: Horizontales Pod-Autoscaling konfigurieren

Automatische Skalierung basierend auf CPU/Speicher oder benutzerdefinierten Metriken implementieren.

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

Metrics-Server installieren, falls nicht verfuegbar:

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** HPA ueberwacht CPU/Speicher-Metriken. Wenn Schwellenwerte ueberschritten werden, skalieren Replikas auf maxReplicas hoch. Bei nachlassender Last skalieren Replikas graduell herunter.

**Bei Fehler:** Bei "unknown"-Metriken pruefen, ob metrics-server laeuft und Pods Ressourcenanforderungen haben. Bei fehlender Skalierung aktuelle Auslastung mit `kubectl top pods` pruefen.

### Schritt 6: Anwendung mit Helm-Chart paketieren

Wiederverwendbares Helm-Chart fuer Multi-Umgebungs-Deployments erstellen.

```bash
# Create Helm chart structure
helm create myapp-chart
cd myapp-chart

# Edit Chart.yaml
cat > Chart.yaml <<EOF
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Helm-Chart paketiert alle Kubernetes-Ressourcen mit templatisierten Werten. Dry-Run zeigt gerenderte Manifeste. Install deployt alle Ressourcen in korrekter Reihenfolge. Upgrades fuehren Rolling Updates durch. Rollback kehrt zur vorherigen Revision zurueck.

**Bei Fehler:** Bei Template-Fehlern `helm template .` ausfuehren, um lokal ohne Installation zu rendern. Bei Abhaengigkeitsproblemen `helm dependency update` ausfuehren.

## Validierung

- [ ] Pods im Running-Zustand mit allen bereiten Containern
- [ ] Readiness-Probes bestehen, bevor Pods zu Service-Endpoints hinzugefuegt werden
- [ ] Liveness-Probes starten ungesunde Container automatisch neu
- [ ] Ressourcenanforderungen und -limits verhindern OOM-Kills und Node-Overcommit
- [ ] Secrets und ConfigMaps korrekt gemountet mit erwarteten Werten
- [ ] Services werden via DNS (cluster.local) von anderen Pods aufgeloest
- [ ] LoadBalancer/Ingress von externen Netzwerken erreichbar
- [ ] HPA skaliert Replikas unter Last hoch und im Leerlauf herunter
- [ ] Rolling Updates werden ohne Ausfallzeit abgeschlossen
- [ ] Logs werden gesammelt und ueber kubectl logs oder zentrales Logging zugaenglich

## Haeufige Stolperfallen

- **Fehlende Readiness-Probes**: Pods erhalten Traffic, bevor sie vollstaendig gestartet sind. Readiness-Probes implementieren, die Anwendungsabhaengigkeiten verifizieren.

- **Unzureichende Startzeit**: Schnelle Liveness-Probes beenden langsam startende Apps. startupProbe mit grosszuegigem failureThreshold fuer die Initialisierung verwenden.

- **Keine Ressourcenlimits**: Pods verbrauchen unbegrenzte CPU/Speicher und verursachen Node-Instabilitaet. Immer Anforderungen und Limits setzen.

- **Hartcodierte Konfiguration**: Umgebungsspezifische Werte in Manifesten verhindern Wiederverwendung. ConfigMaps, Secrets und Helm-Werte verwenden.

- **Standard-ServiceAccount**: Pods haben unnoetige Cluster-Berechtigungen. Dedizierte ServiceAccounts mit minimalem RBAC erstellen.

- **Keine Rolling-Update-Strategie**: Deployments erstellen alle Pods gleichzeitig neu und verursachen Ausfallzeiten. RollingUpdate mit maxUnavailable: 0 verwenden.

- **Secrets in der Versionskontrolle**: Sensible Daten in Git committed. Sealed-Secrets, External-Secrets-Operator oder Vault verwenden.

- **Kein Pod-Disruption-Budget**: Cluster-Wartung entleert Nodes und unterbricht den Service. PodDisruptionBudget erstellen, um minimale verfuegbare Replikas sicherzustellen.

## Verwandte Skills

- `setup-docker-compose` - Container-Orchestrierungsgrundlagen vor Kubernetes
- `containerize-mcp-server` - Container-Images fuer das Deployment erstellen
- `write-helm-chart` - Erweiterte Helm-Chart-Entwicklung
- `manage-kubernetes-secrets` - SealedSecrets und External-Secrets-Operator
- `configure-ingress-networking` - NGINX Ingress und cert-manager Setup
- `implement-gitops-workflow` - ArgoCD/Flux fuer deklarative Deployments
- `setup-container-registry` - Image-Registry-Integration
