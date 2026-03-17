---
name: setup-local-kubernetes
description: >
  Configura un entorno de desarrollo local de Kubernetes usando kind, k3d o minikube para el
  desarrollo de ciclo interno rápido. Cubre la creación de clústeres, configuración de Ingress,
  configuración del registro local e integración con herramientas de desarrollo como Skaffold y
  Tilt para flujos de trabajo automáticos de recompilación y redespliegue. Útil al necesitar un
  entorno Kubernetes local para desarrollo, probar manifiestos o gráficos Helm antes del
  despliegue en producción, querer ciclos rápidos de recompilación y redespliegue, o aprender
  Kubernetes sin costos de nube.
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
  complexity: basic
  language: multi
  tags: kind, k3d, minikube, local-development, skaffold, tilt, docker, kubernetes
---

# Configurar Kubernetes Local

Crea un entorno de desarrollo local de Kubernetes para una iteración y pruebas rápidas.

## Cuándo Usar

- Al necesitar un entorno Kubernetes local para el desarrollo de aplicaciones
- Al querer probar manifiestos Kubernetes y gráficos Helm antes de desplegar en producción
- Al requerir un desarrollo de ciclo interno rápido con recompilación y redespliegue automáticos
- Al probar aplicaciones multi-servicio con dependencias de servicios
- Al aprender Kubernetes sin costos de nube
- Al realizar pruebas del pipeline CI/CD localmente antes de enviar cambios
- Al necesitar un entorno aislado para experimentación y depuración

## Entradas

- **Requerido**: Docker Desktop o Docker Engine instalado
- **Requerido**: Al menos 4GB de RAM disponibles para el clúster
- **Requerido**: Elección de la herramienta de clúster local (kind, k3d o minikube)
- **Opcional**: Código fuente de la aplicación a desplegar
- **Opcional**: Preferencia de versión de Kubernetes
- **Opcional**: Preferencia de herramienta de desarrollo (Skaffold, Tilt o manual)
- **Opcional**: Número de nodos trabajadores necesarios

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.

### Paso 1: Instalar la Herramienta de Clúster Kubernetes Local

Elige e instala kind, k3d o minikube según tus requisitos.

**Instalar kind (Kubernetes in Docker):**
```bash
# Linux example
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Verify installation
kind version
```

**Instalar k3d (k3s in Docker):**
```bash
# Linux/macOS
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Verify installation
k3d version
```

**Instalar minikube:**
```bash
# Linux example
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

Instala kubectl si no está presente:
```bash
# Linux example
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

> Consulta references/EXAMPLES.md para los comandos de instalación en macOS y Windows.

**Esperado:** Binario de la herramienta instalado y en el PATH. El comando de versión devuelve la versión esperada. kubectl disponible para la interacción con el clúster.

**En caso de fallo:**
- Asegúrate de que Docker está en ejecución: `docker ps`
- Comprueba que el PATH del sistema incluye el directorio de instalación
- Para problemas de permisos, verifica los derechos de sudo/administrador
- En macOS, puede ser necesario permitir el binario en Seguridad y privacidad
- Usuarios de Windows: asegúrate de ejecutar la terminal como Administrador

### Paso 2: Crear el Clúster Local con Configuración

Crea un clúster multi-nodo con soporte de Ingress y registro local.

**Crear clúster kind:**
```yaml
# kind-config.yaml (abbreviated)
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: dev-cluster
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
  - containerPort: 443
    hostPort: 443
- role: worker
- role: worker
```

```bash
# Create cluster
kind create cluster --config kind-config.yaml

# Install ingress-nginx
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Create local registry
docker run -d --restart=always -p 5000:5000 --name kind-registry registry:2
docker network connect kind kind-registry
```

> Consulta references/EXAMPLES.md para el kind-config.yaml completo con espejos de registro y configuración de Ingress.

**Crear clúster k3d:**
```bash
# Create cluster with ingress and registry
k3d cluster create dev-cluster \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer" \
  --agents 2 \
  --registry-create k3d-registry:5000
```

**Crear clúster minikube:**
```bash
# Create cluster with multiple nodes
minikube start \
  --nodes=3 \
  --cpus=2 \
  --memory=4096 \
  --driver=docker \
  --addons=ingress,registry,metrics-server
```

Prueba el clúster:
```bash
# Deploy test application
kubectl create deployment hello --image=k8s.gcr.io/echoserver:1.4
kubectl expose deployment hello --type=NodePort --port=8080
kubectl port-forward service/hello 8080:8080

# Clean up test
kubectl delete deployment,service hello
```

**Esperado:** Clúster multi-nodo en ejecución con nodo de control y nodos trabajadores. Controlador Ingress instalado y listo. Registro local accesible en localhost:5000. Contexto kubectl configurado para el nuevo clúster. Despliegue de prueba exitoso.

**En caso de fallo:**
- Comprueba que Docker tiene recursos suficientes (se recomiendan 4GB+ de memoria)
- Verifica que no hay conflictos de puertos: `lsof -i :80,443,5000,6550`
- Para kind: asegúrate de que Kubernetes de Docker desktop está deshabilitado (causa conflictos)
- Para k3d: comprueba la conectividad de red de Docker
- Para minikube: prueba un controlador diferente (virtualbox, hyperv, kvm2)
- Revisa los registros de creación del clúster: `kind get clusters`, `k3d cluster list`, `minikube logs`

### Paso 3: Configurar las Herramientas del Flujo de Trabajo de Desarrollo

Configura Skaffold o Tilt para la recompilación y el redespliegue automatizados.

**Instalar Skaffold:**
```bash
# Linux example
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
chmod +x skaffold
sudo mv skaffold /usr/local/bin
skaffold version
```

**Crear configuración de Skaffold:**
```yaml
# skaffold.yaml (abbreviated)
apiVersion: skaffold/v4beta7
kind: Config
metadata:
  name: my-app
build:
# ... (see EXAMPLES.md for complete configuration)
```

> Consulta references/EXAMPLES.md para el skaffold.yaml completo con perfiles, sincronización de archivos y reenvío de puertos.

**Instalar Tilt:**
```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
tilt version
```

**Crear Tiltfile:**
```python
# Tiltfile (abbreviated)
allow_k8s_contexts('kind-dev-cluster')

docker_build(
  'localhost:5000/my-app',
  '.',
  live_update=[
    sync('./src', '/app/src'),
  ]
)

k8s_yaml(['k8s/deployment.yaml', 'k8s/service.yaml'])
k8s_resource('my-app', port_forwards='8080:8080')
```

> Consulta references/EXAMPLES.md para el Tiltfile completo con actualizaciones en tiempo real, gráficos Helm y botones personalizados.

Crea manifiestos Kubernetes de ejemplo:
```yaml
# k8s/deployment.yaml (abbreviated)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: app
        image: localhost:5000/my-app
        ports:
        - containerPort: 8080
```

> Consulta references/EXAMPLES.md para los manifiestos completos con servicio, Ingress y límites de recursos.

Prueba el flujo de trabajo de desarrollo:
```bash
# Using Skaffold
skaffold dev --port-forward

# Using Tilt
tilt up

# Add entry to /etc/hosts for ingress
echo "127.0.0.1 my-app.local" | sudo tee -a /etc/hosts
curl http://my-app.local
```

**Esperado:** Skaffold o Tilt observando los cambios en los archivos. Los cambios de código activan la recompilación y el redespliegue automáticos. La recarga en caliente funciona para los lenguajes compatibles. El reenvío de puertos permite el acceso local. Los registros se transmiten en el terminal/interfaz. El caché de compilación hace que las recompilaciones sean rápidas.

**En caso de fallo:**
- Verifica que el daemon Docker es accesible: `docker ps`
- Comprueba si el registro local es accesible: `curl http://localhost:5000/v2/_catalog`
- Para problemas de sincronización de archivos, asegúrate de que las rutas en la configuración coinciden con la estructura real
- Revisa los registros de Skaffold/Tilt en busca de errores de compilación
- Asegúrate de que el Dockerfile tiene la imagen base correcta y se compila correctamente: `docker build .`
- Comprueba que los límites de recursos no causan OOMKills: `kubectl describe pod -l app=my-app`

### Paso 4: Configurar el Almacenamiento Local y las Bases de Datos

Configura el almacenamiento persistente y despliega servicios de base de datos para pruebas.

**Crea la clase de almacenamiento local:**
```yaml
# local-storage.yaml (abbreviated)
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
provisioner: rancher.io/local-path
# ... (see EXAMPLES.md for complete configuration)
```

> Consulta references/EXAMPLES.md para la configuración de almacenamiento completa con plantillas de PVC.

**Despliega PostgreSQL para desarrollo:**
```yaml
# postgres-dev.yaml (abbreviated)
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        envFrom:
        - secretRef:
            name: postgres-secret
```

> Consulta references/EXAMPLES.md para el StatefulSet de PostgreSQL completo con secretos y plantillas de volúmenes.

**Despliega Redis para caché:**
```bash
# Using Helm
helm install redis bitnami/redis \
  --set auth.enabled=false \
  --set replica.replicaCount=0
```

> Consulta references/EXAMPLES.md para el despliegue de Redis basado en kubectl.

Prueba la conectividad de la base de datos:
```bash
# Apply manifests
kubectl apply -f local-storage.yaml
kubectl apply -f postgres-dev.yaml

# Wait for PostgreSQL
kubectl wait --for=condition=ready pod -l app=postgres --timeout=60s

# Test connection
kubectl exec -it postgres-0 -- psql -U devuser -d devdb -c "SELECT version();"
```

**Esperado:** Clase de almacenamiento configurada para el aprovisionamiento dinámico. Pods de la base de datos en ejecución y listos. Servicios accesibles mediante port-forward o desde otros pods. Los datos persisten entre reinicios de pods. Uso de recursos apropiado para el desarrollo (límites pequeños).

**En caso de fallo:**
- Comprueba si el aprovisionador de almacenamiento está instalado: `kubectl get storageclass`
- Verifica que el PVC está vinculado al PV: `kubectl get pvc,pv`
- Revisa los eventos del pod en busca de errores de montaje: `kubectl describe pod postgres-0`
- Para problemas de permisos, comprueba si el directorio hostPath existe y es escribible
- Prueba el inicio de la base de datos: `kubectl logs postgres-0` para errores de PostgreSQL
- Asegúrate de que no hay conflictos de puertos para el reenvío de puertos

### Paso 5: Configurar la Observabilidad para el Desarrollo Local

Agrega monitoreo y registro mínimos para la depuración.

**Despliega una pila de monitoreo ligera:**
```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For local clusters, disable TLS verification
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}
]'

# Verify metrics
kubectl top nodes
kubectl top pods -A
```

**Configura el registro local:**
```bash
# Install stern (multi-pod log tailing)
curl -Lo stern https://github.com/stern/stern/releases/download/v1.26.0/stern_1.26.0_linux_amd64.tar.gz
tar -xzf stern_1.26.0_linux_amd64.tar.gz
sudo mv stern /usr/local/bin/

# Usage
stern my-app --since 1m
```

> Consulta references/EXAMPLES.md para los ConfigMaps del panel de desarrollo y alias útiles.

**Esperado:** El servidor de métricas proporciona datos de uso de recursos. Los comandos kubectl top funcionan. k9s o el panel muestra el estado del clúster. Los registros accesibles mediante stern o kubectl logs. Monitoreo de baja sobrecarga adecuado para el desarrollo.

**En caso de fallo:**
- Para errores TLS del servidor de métricas, aplica el parche de indicador TLS inseguro
- Comprueba si el pod del servidor de métricas está en ejecución: `kubectl get pods -n kube-system -l k8s-app=metrics-server`
- Verifica que la API de heapster está disponible: `kubectl get apiservices | grep metrics`
- Para stern, asegúrate de que el contexto kubectl está configurado correctamente
- Prueba el acceso básico a kubectl antes de depurar las herramientas de observabilidad

### Paso 6: Documentar el Flujo de Trabajo y Crear Ayudas

Crea scripts y documentación para la incorporación del equipo.

**Crea el script de configuración:**
```bash
#!/bin/bash
# setup-local-cluster.sh (abbreviated)
set -e

echo "=== Local Kubernetes Cluster Setup ==="

# ... (see EXAMPLES.md for complete configuration)
```

> Consulta references/EXAMPLES.md para el script de configuración completo con despliegue y verificación de servicios.

**Crea el script de desmontaje:**
```bash
#!/bin/bash
# teardown-local-cluster.sh (abbreviated)
echo "=== Tearing Down Local Cluster ==="

if kind get clusters 2>/dev/null | grep -q dev-cluster; then
  kind delete cluster --name dev-cluster
  docker stop kind-registry && docker rm kind-registry
fi

docker system prune -f
```

> Consulta references/EXAMPLES.md para el script de desmontaje completo y la plantilla README.

**Esperado:** El script de configuración crea el clúster con un solo comando. El script de desmontaje limpia todo. El README proporciona instrucciones claras para las tareas comunes. Los miembros del equipo pueden ser productivos rápidamente.

**En caso de fallo:**
- Prueba los scripts manualmente antes de distribuirlos
- Agrega manejo de errores para cada paso
- Proporciona una sección de solución de problemas en el README
- Crea un tutorial en vídeo para configuraciones complejas
- Mantén los scripts a medida que las versiones de las herramientas del clúster se actualicen

## Validación

- [ ] Clúster local creado con múltiples nodos
- [ ] Controlador Ingress instalado y respondiendo
- [ ] Registro local accesible y aceptando envíos
- [ ] La aplicación de muestra se despliega correctamente
- [ ] La sincronización de archivos funciona (los cambios se reflejan sin recompilación completa)
- [ ] El reenvío de puertos permite el acceso local a los servicios
- [ ] Los servicios de base de datos están en ejecución y son accesibles
- [ ] El servidor de métricas proporciona datos de uso de recursos
- [ ] Los registros accesibles mediante kubectl/stern/Tilt
- [ ] Los scripts de configuración/desmontaje funcionan de manera fiable
- [ ] La documentación es clara y está actualizada
- [ ] Los miembros del equipo pueden incorporarse en menos de 30 minutos

## Errores Comunes

- **Recursos insuficientes**: Los clústeres locales necesitan 4GB+ de RAM, 2+ núcleos CPU. Comprueba la configuración de Docker Desktop. Reduce las réplicas y las solicitudes de recursos para el desarrollo.

- **Conflictos de puertos**: Los puertos 80, 443 y 5000 se usan comúnmente. Comprueba con `lsof -i :<puerto>` antes de crear el clúster. Ajusta las asignaciones de puertos si es necesario.

- **Compilaciones lentas**: Sin caché adecuado, las compilaciones de Docker son lentas. Usa compilaciones multi-etapa, .dockerignore y BuildKit. Habilita el caché de Skaffold/Tilt.

- **Confusión de contexto**: Múltiples contextos kubectl causan confusión. Usa `kubectl config current-context` y la herramienta `kubectx` para cambiar con claridad.

- **Sincronización de archivos no funciona**: Las incompatibilidades de rutas entre el host y el contenedor rompen la sincronización. Verifica que las rutas en skaffold.yaml/Tiltfile coinciden con el WORKDIR del Dockerfile.

- **Ingress no resuelve**: Olvidaste añadir la entrada a /etc/hosts. O el controlador Ingress no está listo. Espera a que los pods del controlador estén listos antes de probar.

- **Pérdida de datos de la base de datos**: El almacenamiento predeterminado es efímero. Usa PersistentVolumes para los datos que deben sobrevivir a los reinicios. Sé explícito sobre la clase de almacenamiento.

- **Límites de recursos demasiado altos**: No copies las especificaciones de recursos de producción al entorno local. Reduce los límites significativamente para el desarrollo local para que quepan en Docker Desktop.

- **Aislamiento de red**: El clúster local no siempre puede llegar a los servicios del host. Usa `host.docker.internal` (Docker Desktop) o ngrok para el proxying inverso.

- **Diferencia de versiones**: La versión del clúster local difiere de la de producción. Establece explícitamente la versión de Kubernetes durante la creación para que coincida con la de producción.

## Habilidades Relacionadas

- `deploy-to-kubernetes` - Patrones de despliegue de aplicaciones probados localmente primero
- `write-helm-chart` - Gráficos Helm probados en el clúster local
- `setup-prometheus-monitoring` - Configuración de monitoreo probada localmente
- `configure-ingress-networking` - Configuración de Ingress validada localmente
- `implement-gitops-workflow` - GitOps probado con clúster local
- `optimize-cloud-costs` - Estrategias de optimización de costos desarrolladas localmente
