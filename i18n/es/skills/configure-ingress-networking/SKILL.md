---
name: configure-ingress-networking
description: >
  Configura redes Ingress de Kubernetes con el controlador NGINX Ingress, cert-manager para
  gestión automatizada de certificados TLS, enrutamiento basado en rutas, limitación de velocidad
  y alojamiento multidominios con terminación SSL y balanceo de carga. Útil al exponer múltiples
  servicios Kubernetes a través de un único balanceador de carga, implementar enrutamiento basado
  en rutas o hosts, automatizar la emisión de certificados TLS con Let's Encrypt, o configurar
  despliegues azul-verde y canary con distribución de tráfico.
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
  tags: ingress, nginx, cert-manager, tls, networking
---

# Configurar Redes Ingress

Configura Kubernetes Ingress de nivel productivo con el controlador NGINX, certificados TLS automatizados y capacidades avanzadas de enrutamiento.

## Cuándo Usar

- Al exponer múltiples servicios Kubernetes a través de un único balanceador de carga
- Al implementar enrutamiento basado en rutas o hosts para microservicios
- Al automatizar la emisión y renovación de certificados TLS con Let's Encrypt
- Al implementar limitación de velocidad, autenticación y políticas WAF
- Al configurar despliegues azul-verde o canary con distribución de tráfico
- Al configurar páginas de error personalizadas y modificación de solicitudes/respuestas

## Entradas

- **Requerido**: Clúster Kubernetes con soporte de LoadBalancer o MetalLB
- **Requerido**: Registros DNS apuntando a la IP del LoadBalancer del clúster
- **Opcional**: Certificados TLS existentes o cuenta de Let's Encrypt
- **Opcional**: Proveedor OAuth2 para autenticación
- **Opcional**: Reglas WAF (ModSecurity)
- **Opcional**: Prometheus para recolección de métricas

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.


### Paso 1: Instalar el Controlador NGINX Ingress

Despliega el controlador NGINX Ingress con Helm y configura la integración con el proveedor de la nube.

```bash
# Add NGINX Ingress Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Create namespace
kubectl create namespace ingress-nginx

# Install for cloud providers (AWS, GCP, Azure)
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer \
  --set controller.metrics.enabled=true \
  --set controller.metrics.serviceMonitor.enabled=true \
  --set controller.podAnnotations."prometheus\.io/scrape"=true \
  --set controller.podAnnotations."prometheus\.io/port"=10254

# Or install for bare-metal with NodePort
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=30080 \
  --set controller.service.nodePorts.https=30443

# AWS-specific configuration with NLB
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"=nlb \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-backend-protocol"=tcp \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-cross-zone-load-balancing-enabled"=true

# Verify installation
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx

# Wait for LoadBalancer external IP
kubectl get svc ingress-nginx-controller -n ingress-nginx -w

# Get external IP/hostname
INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
INGRESS_HOST=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Ingress IP: $INGRESS_IP"
echo "Ingress Hostname: $INGRESS_HOST"

# Test controller
curl http://$INGRESS_IP
# Should return 404 (no backend configured yet)
```

**Esperado:** Pods del controlador NGINX Ingress en ejecución en el namespace ingress-nginx. El servicio LoadBalancer tiene IP externa asignada. El punto de conexión de métricas es accesible en el puerto 10254. La verificación de salud en `/healthz` devuelve 200 OK.

**En caso de fallo:** Para LoadBalancer pendiente, verifica la integración con el proveedor de la nube y las cuotas de servicio. Para CrashLoopBackOff, comprueba los registros del controlador con `kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller`. Para errores de webhook, verifica que el certificado del webhook de admisión sea válido. Para ninguna IP externa en bare-metal, instala MetalLB o usa el tipo de servicio NodePort.

### Paso 2: Instalar cert-manager para TLS Automatizado

Despliega cert-manager y configura el ClusterIssuer de Let's Encrypt.

```bash
# Install cert-manager CRDs
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.crds.yaml

# Add cert-manager Helm repository
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set prometheus.enabled=true \
  --set webhook.timeoutSeconds=30

# Verify installation
kubectl get pods -n cert-manager
kubectl get apiservice v1beta1.webhook.cert-manager.io -o yaml

# Create Let's Encrypt staging issuer (for testing)
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-staging-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Create Let's Encrypt production issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
    - dns01:
        route53:
          region: us-east-1
          hostedZoneID: Z1234567890ABC
          # IAM role for EKS with IRSA
          role: arn:aws:iam::123456789012:role/cert-manager
EOF

# Verify ClusterIssuer ready
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-prod
```

**Esperado:** Pods de cert-manager en ejecución en el namespace cert-manager. ClusterIssuers creados con estado Ready. Cuenta ACME registrada con Let's Encrypt. Webhook respondiendo a solicitudes de certificado.

**En caso de fallo:** Para errores de tiempo de espera del webhook, aumenta `webhook.timeoutSeconds` o comprueba las políticas de red que bloquean cert-manager hacia el servidor API. Para fallos de registro ACME, verifica que el correo electrónico sea válido y la URL del servidor sea correcta. Para fallos de DNS01, comprueba que los permisos IAM de Route53 permitan route53:ChangeResourceRecordSets. Prueba la propagación DNS con `dig +short _acme-challenge.example.com TXT`.

### Paso 3: Crear Ingress Básico con TLS

Despliega la aplicación y expónla mediante Ingress con emisión automática de certificados.

```bash
# Deploy sample application
kubectl create deployment web --image=nginx:alpine
kubectl expose deployment web --port=80 --target-port=80

# Create Ingress resource with TLS
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-staging"  # Use staging for testing
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - web.example.com
    secretName: web-tls-secret  # cert-manager will create this
  rules:
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
EOF

# Watch certificate creation
kubectl get certificate -w
kubectl describe certificate web-tls-secret

# Verify certificate issued
kubectl get secret web-tls-secret
kubectl get secret web-tls-secret -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout

# Check cert-manager logs if issues
kubectl logs -n cert-manager -l app=cert-manager -f

# Test HTTP to HTTPS redirect
curl -I http://web.example.com
# Should return 308 Permanent Redirect to https://

# Test HTTPS
curl -v https://web.example.com
# Should return 200 OK with valid certificate

# Once tested successfully, switch to production issuer
kubectl patch ingress web-ingress -p '{"metadata":{"annotations":{"cert-manager.io/cluster-issuer":"letsencrypt-prod"}}}'
kubectl delete certificate web-tls-secret
kubectl delete secret web-tls-secret
# cert-manager will recreate with production certificate
```

**Esperado:** Recurso Ingress creado. cert-manager detecta la anotación y crea el recurso Certificate. El desafío HTTP-01 se completa correctamente. El Secret TLS se crea con un certificado válido. Las solicitudes HTTPS se realizan correctamente con un certificado de confianza. HTTP redirige a HTTPS.

**En caso de fallo:** Para fallos de desafío, verifica que el DNS resuelve a la IP del LoadBalancer del Ingress con `dig web.example.com`. Para errores de límite de velocidad, usa el emisor de staging hasta que la configuración sea correcta. Para que el certificado no se emita, comprueba los eventos con `kubectl describe certificate web-tls-secret` y `kubectl get challenges`. Para el error "demasiados certificados", se han alcanzado los límites de velocidad de Let's Encrypt (50 certificados/dominio/semana); espera o usa staging.

### Paso 4: Implementar Enrutamiento Avanzado y Balanceo de Carga

Configura el enrutamiento basado en rutas, enrutamiento basado en encabezados y distribución de tráfico.

```bash
# Deploy multiple services
kubectl create deployment api --image=hashicorp/http-echo --replicas=3 -- -text="API Service"
kubectl create deployment admin --image=hashicorp/http-echo --replicas=2 -- -text="Admin Service"
kubectl expose deployment api --port=5678
kubectl expose deployment admin --port=5678

# Create Ingress with path-based routing
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rewrite-target: /\$2
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 5678
      - path: /admin(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 5678
EOF

# Canary deployment with traffic splitting
kubectl create deployment api-v2 --image=hashicorp/http-echo -- -text="API Service v2"
kubectl expose deployment api-v2 --port=5678

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "20"  # 20% traffic to v2
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 5678
EOF

# Header-based canary routing (for testing)
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary-header
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "X-Canary"
    nginx.ingress.kubernetes.io/canary-by-header-value: "always"
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 5678
EOF

# Test routing
curl https://app.example.com/            # -> web service
curl https://app.example.com/api/        # -> 80% api, 20% api-v2
curl https://app.example.com/admin/      # -> admin service
curl -H "X-Canary: always" https://app.example.com/api/  # -> api-v2 (100%)
```

**Esperado:** Un solo Ingress enruta a múltiples servicios basándose en la ruta. rewrite-target elimina el prefijo de ruta. El Ingress canary divide el tráfico por peso. El enrutamiento basado en encabezados envía solicitudes específicas al canary. El TLS termina en el Ingress, los backends usan HTTP.

**En caso de fallo:** Para errores 404, verifica los nombres de servicio y los puertos. Para problemas de reescritura, prueba la regex con el depurador de `nginx.ingress.kubernetes.io/rewrite-target`. Para que el canary no funcione, verifica que solo un Ingress tenga `canary: "false"` (principal) y los demás tengan `canary: "true"`. Para desequilibrios de tráfico, comprueba los recuentos de pods backend y las sondas de disponibilidad.

### Paso 5: Configurar Limitación de Velocidad y Autenticación

Implementa limitación de velocidad, autenticación básica y autenticación OAuth2.

```bash
# Rate limiting by IP
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ratelimit
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** La limitación de velocidad bloquea solicitudes excesivas con 503 Service Temporarily Unavailable. La autenticación básica solicita credenciales, rechaza solicitudes no autorizadas. OAuth2 redirige a la página de inicio de sesión del proveedor, establece cookies de autenticación.

**En caso de fallo:** Para que la limitación de velocidad no funcione, verifica la sintaxis de la anotación y reinicia los pods del controlador Ingress. Para errores 500 de autenticación básica, comprueba el formato del secreto con `kubectl get secret basic-auth -o yaml | grep auth:`. Para fallos de OAuth2, verifica el ID/secreto del cliente y la URL de devolución de llamada registrada con el proveedor. Comprueba los registros de oauth2-proxy para errores detallados.

### Paso 6: Implementar Páginas de Error Personalizadas y Modificación de Solicitudes

Configura páginas de error personalizadas, CORS y encabezados de solicitud/respuesta.

```bash
# Create ConfigMap with custom error pages
kubectl create configmap custom-errors --from-file=404.html --from-file=503.html -n ingress-nginx

# Configure NGINX to use custom error pages
cat <<EOF | kubectl apply -f -
apiVersion: v1
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Las páginas 404 y 503 personalizadas se muestran en lugar de las páginas NGINX predeterminadas. Los encabezados CORS permiten los orígenes y métodos especificados. Los encabezados de seguridad protegen contra XSS y clickjacking. El límite de tamaño del cuerpo de la solicitud permite cargar archivos grandes. La configuración de tiempos de espera evita cierres prematuros de conexión.

**En caso de fallo:** Para páginas de error personalizadas que no se muestran, verifica que el ConfigMap esté montado en los pods del controlador y que el backend predeterminado esté desplegado. Para fallos de comprobación previa de CORS, verifica que las solicitudes OPTIONS estén permitidas en el servicio backend. Para 413 Request Entity Too Large, aumenta la anotación `proxy-body-size`. Para errores de tiempo de espera, aumenta las tres anotaciones de tiempo de espera juntas.

## Validación

- [ ] Controlador NGINX Ingress en ejecución con IP externa asignada
- [ ] cert-manager emite certificados automáticamente a través de Let's Encrypt
- [ ] Las redirecciones HTTPS aplican SSL para todos los Ingresses
- [ ] El enrutamiento basado en rutas dirige solicitudes a los servicios backend correctos
- [ ] Los Ingresses canary dividen el tráfico según las anotaciones de peso
- [ ] La limitación de velocidad bloquea solicitudes excesivas de una sola IP
- [ ] La autenticación (básica u OAuth2) protege las rutas de administración
- [ ] Las páginas de error personalizadas se muestran en errores 404/503
- [ ] Los encabezados CORS permiten solicitudes de origen cruzado desde dominios especificados
- [ ] El punto de conexión de métricas expone métricas de Prometheus para monitoreo

## Errores Comunes

- **Sin ingressClassName**: El Ingress no es recogido por el controlador. Especifica siempre `ingressClassName: nginx` en Kubernetes 1.19+.

- **Fallos en los desafíos de certificados**: El DNS no apunta al LoadBalancer del Ingress. Verifica con `dig tudominio.com` antes de solicitar el certificado.

- **Tiempo de espera del desafío HTTP-01**: El firewall bloquea el puerto 80. Let's Encrypt debe llegar a `http://dominio/.well-known/acme-challenge/` para la validación.

- **El límite de velocidad se aplica globalmente**: La anotación `limit-rps` se aplica por Ingress, no por ruta. Crea Ingresses separados para diferentes límites de velocidad.

- **Regex de rewrite-target incorrecta**: Las capturas no coinciden con el patrón de ruta. Prueba con `echo "/api/users" | sed 's|/api(/\|$)\(.*\)|/\2|'`.

- **Peso canary ignorado**: Múltiples Ingresses canary para el mismo host/ruta entran en conflicto. Crea solo un Ingress canary por ruta.

- **Omisión de autenticación mediante IP**: La autenticación solo está en el Ingress, los servicios backend son accesibles mediante ClusterIP. Implementa políticas de red o una malla de servicios.

- **Riesgo de inyección de configuration-snippet**: La entrada del usuario en configuration-snippet permite la inyección de configuración de NGINX. Valida y sanea todas las anotaciones.

## Habilidades Relacionadas

- `deploy-to-kubernetes` - Creación de Services a los que el Ingress enruta
- `manage-kubernetes-secrets` - Gestión de certificados TLS como Secrets
- `implement-gitops-workflow` - Gestión declarativa del Ingress con Argo CD
- `setup-service-mesh` - Gestión avanzada del tráfico con Istio/Linkerd
- `build-ci-cd-pipeline` - Actualizaciones automatizadas del Ingress en CI/CD
