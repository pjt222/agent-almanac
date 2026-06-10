# Extended Examples for Setup Local Kubernetes

This file contains complete configuration files and extended code examples referenced in the main SKILL.md procedure.

## Step 1: Installation Commands

### Install kind (Complete)
```bash
# Linux
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# macOS (using Homebrew)
brew install kind

# Windows (using Chocolatey)
choco install kind

# Verify installation
kind version
```

### Install k3d (Complete)
```bash
# Linux/macOS
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Windows (using Chocolatey)
choco install k3d

# Verify installation
k3d version
```

### Install minikube (Complete)
```bash
# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# macOS (using Homebrew)
brew install minikube

# Windows (using Chocolatey)
choco install minikube

# Verify installation
minikube version
```

### Install kubectl (Complete)
```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# macOS (using Homebrew)
brew install kubectl

# Windows (using Chocolatey)
choco install kubernetes-cli

# Verify installation
kubectl version --client
```

## Step 2: Cluster Configuration Files

### kind-config.yaml (Complete Multi-Node Configuration)
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: dev-cluster
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:5000"]
    endpoint = ["http://kind-registry:5000"]
```

### kind Cluster Creation Commands (Complete)
```bash
# Create cluster
kind create cluster --config kind-config.yaml

# Verify cluster
kubectl cluster-info --context kind-dev-cluster
kubectl get nodes

# Install ingress-nginx
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress controller
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# Create local registry
docker run -d --restart=always -p 5000:5000 --name kind-registry registry:2

# Connect registry to kind network
docker network connect kind kind-registry

# Document registry
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:5000"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF
```

### k3d Cluster Creation (Complete)
```bash
# Create cluster with ingress and registry
k3d cluster create dev-cluster \
  --api-port 6550 \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer" \
  --agents 2 \
  --registry-create k3d-registry:5000 \
  --registry-use k3d-registry:5000

# Verify cluster
kubectl cluster-info
kubectl get nodes

# Install ingress-nginx (if not using Traefik)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.hostPort.enabled=true
```

### minikube Cluster Creation (Complete)
```bash
# Create cluster with multiple nodes
minikube start \
  --nodes=3 \
  --cpus=2 \
  --memory=4096 \
  --driver=docker \
  --kubernetes-version=v1.28.0 \
  --addons=ingress,registry,metrics-server

# Verify cluster
kubectl cluster-info
kubectl get nodes

# Access built-in registry
minikube addons enable registry
docker run --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$(minikube ip):5000"

# Or use minikube docker daemon directly
eval $(minikube docker-env)
```

## Step 3: Development Workflow Tool Configurations

### Skaffold Configuration (Complete)
```yaml
# skaffold.yaml
apiVersion: skaffold/v4beta7
kind: Config
metadata:
  name: my-app
build:
  local:
    push: false  # Don't push to remote registry
    useBuildkit: true
  artifacts:
  - image: localhost:5000/my-app
    context: .
    docker:
      dockerfile: Dockerfile
    sync:
      manual:
      - src: "src/**/*.js"
        dest: /app/src
      - src: "src/**/*.html"
        dest: /app/src
  - image: localhost:5000/my-worker
    context: ./worker
    docker:
      dockerfile: Dockerfile
deploy:
  kubectl:
    manifests:
    - k8s/deployment.yaml
    - k8s/service.yaml
    - k8s/ingress.yaml
portForward:
- resourceType: service
  resourceName: my-app
  port: 8080
  localPort: 8080
profiles:
- name: dev
  activation:
  - command: dev
  build:
    artifacts:
    - image: localhost:5000/my-app
      sync:
        auto: true
  deploy:
    kubectl:
      flags:
        apply:
        - --force
- name: debug
  activation:
  - command: debug
  build:
    artifacts:
    - image: localhost:5000/my-app
      docker:
        buildArgs:
          DEBUG: "true"
  patches:
  - op: add
    path: /deploy/kubectl/manifests/-
    value: k8s/debug-config.yaml
```

### Tiltfile (Complete)
```python
# Tiltfile
# Allow Tilt to use local Kubernetes
allow_k8s_contexts('kind-dev-cluster')

# Build and deploy main app
docker_build(
  'localhost:5000/my-app',
  '.',
  dockerfile='Dockerfile',
  live_update=[
    sync('./src', '/app/src'),
    run('npm install', trigger='./package.json'),
  ]
)

# Build worker
docker_build(
  'localhost:5000/my-worker',
  './worker',
  dockerfile='Dockerfile'
)

# Deploy manifests
k8s_yaml(['k8s/deployment.yaml', 'k8s/service.yaml', 'k8s/ingress.yaml'])

# Port forward for local access
k8s_resource('my-app', port_forwards='8080:8080')

# Resource dependencies
k8s_resource(
  'my-app',
  resource_deps=['my-database'],
  labels=['frontend']
)

k8s_resource(
  'my-worker',
  labels=['backend']
)

# Local resource for running tests
local_resource(
  'unit-tests',
  'npm test',
  deps=['src'],
  trigger_mode=TRIGGER_MODE_AUTO,
  auto_init=False,
  labels=['tests']
)

# Helm chart deployment
helm_repo('bitnami', 'https://charts.bitnami.com/bitnami')
helm_resource(
  'postgresql',
  'bitnami/postgresql',
  flags=['--set', 'auth.postgresPassword=devpassword'],
  labels=['database']
)

# Add custom button
button = Button(
  name='run-migrations',
  text='Run DB Migrations',
  location='main',
  argv=['kubectl', 'exec', '-it', 'deploy/my-app', '--', 'npm', 'run', 'migrate']
)

# Configure Tilt UI
config.define_string('app-version', args=False, usage='App version to deploy')
cfg = config.parse()
if cfg.get('app-version'):
  k8s_yaml(helm('charts/my-app', set=['image.tag=' + cfg['app-version']]))
```

### Kubernetes Sample Manifests (Complete)
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: localhost:5000/my-app
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: development
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector:
    app: my-app
  ports:
  - port: 8080
    targetPort: 8080
---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: my-app.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app
            port:
              number: 8080
```

## Step 4: Storage and Database Configurations

### Local Storage Configuration (Complete)
```yaml
# local-storage.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
provisioner: rancher.io/local-path
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
---
# For kind (uses hostPath)
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-pv-1
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /tmp/local-pv-1
    type: DirectoryOrCreate
  storageClassName: local-path
---
# Sample PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: local-path
```

### PostgreSQL Development Setup (Complete)
```yaml
# postgres-dev.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_PASSWORD: devpassword
  POSTGRES_USER: devuser
  POSTGRES_DB: devdb
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        envFrom:
        - secretRef:
            name: postgres-secret
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: local-path
      resources:
        requests:
          storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
  clusterIP: None
```

### Redis Deployment (Complete)
```yaml
# redis-dev.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            cpu: 50m
            memory: 64Mi
---
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
  - port: 6379
```

## Step 5: Observability Configuration

### Development Dashboard ConfigMap (Complete)
```yaml
# dev-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dev-dashboard
data:
  dashboard.sh: |
    #!/bin/bash
    clear
    echo "=== Development Cluster Status ==="
    echo ""
    echo "Nodes:"
    kubectl get nodes
    echo ""
    echo "Pods:"
    kubectl get pods -A
    echo ""
    echo "Services:"
    kubectl get svc -A
    echo ""
    echo "Resource Usage:"
    kubectl top nodes
    kubectl top pods -A
    echo ""
    echo "Recent Events:"
    kubectl get events --sort-by='.lastTimestamp' | tail -10
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: useful-aliases
data:
  aliases.sh: |
    alias k='kubectl'
    alias kg='kubectl get'
    alias kd='kubectl describe'
    alias kl='kubectl logs'
    alias kx='kubectl exec -it'
    alias ka='kubectl apply -f'
    alias kdel='kubectl delete'
    alias kgp='kubectl get pods'
    alias kgs='kubectl get svc'
    alias kctx='kubectl config current-context'
```

## Step 6: Helper Scripts

### Setup Script (Complete)
```bash
#!/bin/bash
# setup-local-cluster.sh

set -e

echo "=== Local Kubernetes Cluster Setup ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker not found. Install Docker first."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "kubectl not found. Install kubectl first."; exit 1; }

# Choose cluster tool
read -p "Choose cluster tool (kind/k3d/minikube) [kind]: " TOOL
TOOL=${TOOL:-kind}

# Create cluster based on choice
case $TOOL in
  kind)
    kind create cluster --config kind-config.yaml
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
    docker run -d --restart=always -p 5000:5000 --name kind-registry registry:2
    docker network connect kind kind-registry
    ;;
  k3d)
    k3d cluster create dev-cluster --port "80:80@loadbalancer" --port "443:443@loadbalancer" --agents 2 --registry-create k3d-registry:5000
    ;;
  minikube)
    minikube start --nodes=3 --cpus=2 --memory=4096 --addons=ingress,registry,metrics-server
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

# Deploy common services
echo "Deploying common services..."
kubectl apply -f local-storage.yaml
kubectl apply -f postgres-dev.yaml

# Wait for services
echo "Waiting for services to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s

echo "Setup complete!"
echo ""
echo "Cluster: $(kubectl config current-context)"
echo "Nodes: $(kubectl get nodes --no-headers | wc -l)"
echo ""
echo "Next steps:"
echo "  1. Run 'skaffold dev' or 'tilt up' to start development"
echo "  2. Access ingress at http://my-app.local (add to /etc/hosts)"
echo "  3. Use 'k9s' for cluster management"
echo ""
```

### Teardown Script (Complete)
```bash
#!/bin/bash
# teardown-local-cluster.sh

echo "=== Tearing Down Local Cluster ==="

# Detect and delete cluster
if kind get clusters 2>/dev/null | grep -q dev-cluster; then
  kind delete cluster --name dev-cluster
  docker stop kind-registry && docker rm kind-registry
elif k3d cluster list 2>/dev/null | grep -q dev-cluster; then
  k3d cluster delete dev-cluster
elif minikube status >/dev/null 2>&1; then
  minikube delete
fi

# Cleanup
rm -f kubeconfig
docker system prune -f

echo "Cluster deleted. All resources cleaned up."
```

### README Template (Complete)
```markdown
# Local Kubernetes Development

## Quick Start

\`\`\`bash
# Setup cluster
./setup-local-cluster.sh

# Start development
skaffold dev
# OR
tilt up

# Access application
echo "127.0.0.1 my-app.local" | sudo tee -a /etc/hosts
curl http://my-app.local
\`\`\`

## Development Workflow

1. Make code changes in `src/`
2. Skaffold/Tilt automatically rebuilds and redeploys
3. Test changes at http://my-app.local
4. Logs visible in terminal/Tilt UI

## Useful Commands

\`\`\`bash
# View all pods
kubectl get pods -A

# View logs
stern my-app

# Execute into pod
kubectl exec -it deploy/my-app -- /bin/sh

# Port forward to service
kubectl port-forward svc/my-app 8080:8080

# Cluster dashboard
k9s
\`\`\`

## Troubleshooting

### Pods not starting
\`\`\`bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
\`\`\`

### Ingress not working
\`\`\`bash
# Check ingress controller
kubectl get pods -n ingress-nginx
# Verify ingress resource
kubectl get ingress
\`\`\`

### Clean slate
\`\`\`bash
./teardown-local-cluster.sh
./setup-local-cluster.sh
\`\`\`

## Resources

- [kind Documentation](https://kind.sigs.k8s.io/)
- [k3d Documentation](https://k3d.io/)
- [Skaffold Documentation](https://skaffold.dev/)
- [Tilt Documentation](https://tilt.dev/)
\`\`\`
```
