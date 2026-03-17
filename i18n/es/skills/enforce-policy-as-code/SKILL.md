---
name: enforce-policy-as-code
description: >
  Implementa la aplicación de políticas como código usando OPA Gatekeeper o Kyverno para validar
  y mutar recursos de Kubernetes según las políticas organizacionales. Cubre plantillas de
  restricciones, control de admisión, modo de auditoría, reporte de violaciones e integración con
  pipelines CI/CD para la validación de políticas con enfoque shift-left. Útil al aplicar
  estándares de configuración de recursos, prevenir configuraciones incorrectas de seguridad como
  contenedores privilegiados, garantizar el cumplimiento antes del despliegue, estandarizar
  convenciones de nomenclatura, o auditar recursos existentes del clúster contra políticas.
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
  tags: opa, gatekeeper, kyverno, policy, admission-control, compliance, kubernetes
---

# Aplicar Políticas como Código

Implementa la aplicación declarativa de políticas usando OPA Gatekeeper o Kyverno para la validación y mutación de recursos Kubernetes.

## Cuándo Usar

- Al aplicar estándares organizacionales para la configuración de recursos (etiquetas, anotaciones, límites)
- Al prevenir configuraciones incorrectas de seguridad (contenedores privilegiados, namespaces del host, imágenes inseguras)
- Al garantizar que los requisitos de cumplimiento se cumplen antes de desplegar los recursos
- Al estandarizar convenciones de nomenclatura y metadatos de recursos
- Al implementar corrección automática mediante políticas de mutación
- Al auditar recursos existentes del clúster contra políticas sin bloquear
- Al integrar la validación de políticas en pipelines CI/CD para un enfoque shift-left

## Entradas

- **Requerido**: Clúster Kubernetes con acceso de administrador
- **Requerido**: Elección del motor de políticas (OPA Gatekeeper o Kyverno)
- **Requerido**: Lista de políticas a aplicar (seguridad, cumplimiento, operaciones)
- **Opcional**: Recursos existentes para auditar
- **Opcional**: Patrones de exención/exclusión para namespaces o recursos específicos
- **Opcional**: Configuración del pipeline CI/CD para la validación previa al despliegue

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.


### Paso 1: Instalar el Motor de Políticas

Despliega OPA Gatekeeper o Kyverno como controlador de admisión.

**Para OPA Gatekeeper:**
```bash
# Install Gatekeeper using Helm
helm repo add gatekeeper https://open-policy-agent.github.io/gatekeeper/charts
helm repo update

# Install with audit enabled
helm install gatekeeper gatekeeper/gatekeeper \
  --namespace gatekeeper-system \
  --create-namespace \
  --set audit.replicas=2 \
  --set replicas=3 \
  --set validatingWebhookFailurePolicy=Fail \
  --set auditInterval=60

# Verify installation
kubectl get pods -n gatekeeper-system
kubectl get crd | grep gatekeeper

# Check webhook configuration
kubectl get validatingwebhookconfigurations gatekeeper-validating-webhook-configuration -o yaml
```

**Para Kyverno:**
```bash
# Install Kyverno using Helm
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update

# Install with HA setup
helm install kyverno kyverno/kyverno \
  --namespace kyverno \
  --create-namespace \
  --set replicaCount=3 \
  --set admissionController.replicas=3 \
  --set backgroundController.replicas=2 \
  --set cleanupController.replicas=2

# Verify installation
kubectl get pods -n kyverno
kubectl get crd | grep kyverno

# Check webhook configurations
kubectl get validatingwebhookconfigurations kyverno-resource-validating-webhook-cfg
kubectl get mutatingwebhookconfigurations kyverno-resource-mutating-webhook-cfg
```

Crea exclusiones de namespace:
```yaml
# gatekeeper-config.yaml
apiVersion: config.gatekeeper.sh/v1alpha1
kind: Config
metadata:
  name: config
  namespace: gatekeeper-system
spec:
  match:
    - excludedNamespaces:
      - kube-system
      - kube-public
      - kube-node-lease
      - gatekeeper-system
      processes:
      - audit
      - webhook
  validation:
    traces:
      - user: system:serviceaccount:gatekeeper-system:gatekeeper-admin
        kind:
          group: ""
          version: v1
          kind: Namespace
```

**Esperado:** Pods del motor de políticas en ejecución con múltiples réplicas. CRDs instalados (ConstraintTemplate, Constraint para Gatekeeper; ClusterPolicy, Policy para Kyverno). Webhooks de validación/mutación activos. Controlador de auditoría en ejecución.

**En caso de fallo:**
- Comprueba los registros del pod: `kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- Verifica que los puntos de conexión del webhook son accesibles: `kubectl get endpoints -n gatekeeper-system`
- Comprueba conflictos de puertos o problemas de certificado en los registros del webhook
- Asegúrate de que el clúster tiene recursos suficientes (los motores de políticas necesitan ~500MB por réplica)
- Revisa los permisos RBAC: `kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### Paso 2: Definir Plantillas de Restricciones y Políticas

Crea plantillas de políticas reutilizables y restricciones específicas.

**Plantilla de Restricciones de OPA Gatekeeper:**
```yaml
# required-labels-template.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
  annotations:
# ... (see EXAMPLES.md for complete configuration)
```

**ClusterPolicy de Kyverno:**
```yaml
# kyverno-policies.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
  annotations:
# ... (see EXAMPLES.md for complete configuration)
```

Aplica las políticas:
```bash
# Apply Gatekeeper templates and constraints
kubectl apply -f required-labels-template.yaml

# Apply Kyverno policies
kubectl apply -f kyverno-policies.yaml

# Verify constraint/policy status
kubectl get constraints
kubectl get clusterpolicies

# Check for any policy errors
kubectl describe k8srequiredlabels require-app-labels
kubectl describe clusterpolicy require-labels
```

**Esperado:** ConstraintTemplates/ClusterPolicies creados correctamente. Las restricciones muestran estado "True" para la aplicación. Sin errores en las definiciones de políticas. El webhook comienza a evaluar nuevos recursos contra las políticas.

**En caso de fallo:**
- Valida la sintaxis Rego (Gatekeeper): usa `opa test` localmente o comprueba el estado de la restricción
- Comprueba la sintaxis YAML de la política: `kubectl apply --dry-run=client -f policy.yaml`
- Revisa el estado de la restricción: `kubectl get constraint -o yaml | grep -A 10 status`
- Prueba con una política simple primero, luego agrega complejidad
- Verifica que los criterios de coincidencia (kinds, namespaces) son correctos

### Paso 3: Probar la Aplicación de Políticas

Valida que las políticas bloquean los recursos no conformes y permiten los conformes.

Crea manifiestos de prueba:
```yaml
# test-non-compliant.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-no-labels
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

Prueba las políticas:
```bash
# Attempt to create non-compliant resource (should fail)
kubectl apply -f test-non-compliant.yaml
# Expected: Error with policy violation message

# Create compliant resource (should succeed)
kubectl apply -f test-compliant.yaml
# Expected: deployment.apps/test-compliant created

# Test with dry-run for validation
kubectl apply -f test-non-compliant.yaml --dry-run=server
# Shows policy violations without actually creating resource

# Clean up
kubectl delete -f test-compliant.yaml
```

Prueba con informes de políticas (Kyverno):
```bash
# Check policy reports
kubectl get policyreports -A
kubectl get clusterpolicyreports

# View detailed report
kubectl get policyreport -n production -o yaml

# Check policy rule results
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

**Esperado:** Los recursos no conformes son rechazados con mensajes claros de violación. Los recursos conformes se crean correctamente. Los informes de políticas muestran resultados de aprobación/fallo. La validación en modo simulado funciona sin crear recursos.

**En caso de fallo:**
- Comprueba si la política está en modo de auditoría en lugar de aplicación: `validationFailureAction: audit`
- Verifica que el webhook está procesando solicitudes: `kubectl logs -n gatekeeper-system -l app=gatekeeper`
- Comprueba las exclusiones de namespace que podrían eximir el namespace de prueba
- Prueba la conectividad del webhook: `kubectl run test --rm -it --image=busybox --restart=Never`
- Revisa la política de fallo del webhook (Ignore vs Fail)

### Paso 4: Implementar Políticas de Mutación

Configura la corrección automática mediante mutación.

**Mutación de Gatekeeper:**
```yaml
# gatekeeper-mutations.yaml
apiVersion: mutations.gatekeeper.sh/v1beta1
kind: Assign
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Políticas de mutación de Kyverno:**
```yaml
# kyverno-mutations.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

Aplicar y probar mutaciones:
```bash
# Apply mutation policies
kubectl apply -f gatekeeper-mutations.yaml
# OR
kubectl apply -f kyverno-mutations.yaml

# Test mutation with a deployment
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Las mutaciones añaden automáticamente etiquetas, recursos o modifican imágenes. Los recursos desplegados muestran los valores mutados. Las mutaciones se registran en los registros del motor de políticas. Sin errores durante la aplicación de mutaciones.

**En caso de fallo:**
- Comprueba que el webhook de mutación está habilitado: `kubectl get mutatingwebhookconfiguration`
- Verifica la sintaxis de la política de mutación: especialmente las rutas JSON y las condiciones
- Revisa los registros: `kubectl logs -n kyverno deploy/kyverno-admission-controller`
- Prueba que las mutaciones no entran en conflicto (múltiples mutaciones en el mismo campo)
- Asegúrate de que la mutación se aplica antes de la validación (el orden importa)

### Paso 5: Habilitar el Modo de Auditoría y los Informes

Configura la auditoría para identificar violaciones en los recursos existentes sin bloquear.

**Auditoría de Gatekeeper:**
```bash
# Audit runs automatically based on auditInterval setting
# Check audit results
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# Get detailed violation information
# ... (see EXAMPLES.md for complete configuration)
```

**Auditoría e informes de Kyverno:**
```bash
# Generate policy reports for existing resources
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# View policy reports
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (see EXAMPLES.md for complete configuration)
```

Crea un panel de cumplimiento de políticas:
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** La auditoría identifica violaciones en los recursos existentes sin bloquear los despliegues. Los informes de políticas se generan con recuentos de aprobación/fallo. Las violaciones se pueden exportar para revisión. Las métricas se exponen para el monitoreo. Las alertas se activan ante un aumento de violaciones.

**En caso de fallo:**
- Verifica que el controlador de auditoría está en ejecución: `kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- Comprueba la configuración del intervalo de auditoría en la instalación
- Revisa los registros de auditoría en busca de errores: `kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- Asegúrate de que los permisos RBAC permiten leer todos los tipos de recursos para la auditoría
- Verifica que el campo de estado del CRD se está rellenando: `kubectl get constraint -o yaml | grep -A 20 status`

### Paso 6: Integrar con el Pipeline CI/CD

Agrega la validación de políticas previa al despliegue para un enfoque shift-left.

**Script de integración CI/CD:**
```bash
#!/bin/bash
# validate-policies.sh

set -e

echo "=== Policy Validation for CI/CD ==="
# ... (see EXAMPLES.md for complete configuration)
```

**Flujo de trabajo de GitHub Actions:**
```yaml
# .github/workflows/policy-validation.yaml
name: Policy Validation

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Hook de pre-commit:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate Kubernetes manifests against policies
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** El pipeline CI/CD valida los manifiestos antes del despliegue. Las violaciones de políticas fallan el pipeline con mensajes claros. Los informes de políticas se adjuntan al PR. Los hooks de pre-commit detectan violaciones de forma temprana. Los desarrolladores son notificados de los problemas de políticas antes de llegar al clúster.

**En caso de fallo:**
- Verifica que las herramientas CLI están instaladas y en el PATH
- Comprueba que las credenciales de kubeconfig son válidas para obtener políticas
- Prueba la validación de políticas localmente primero: `kyverno apply policy.yaml --resource manifest.yaml`
- Asegúrate de que las políticas sincronizadas desde el clúster están completas
- Revisa los registros CLI de políticas para errores de validación específicos

## Validación

- [ ] Pods del motor de políticas en ejecución con configuración de HA
- [ ] Webhooks de validación y mutación activos y accesibles
- [ ] Plantillas de restricciones y políticas creadas sin errores
- [ ] Los recursos no conformes son rechazados con mensajes claros de violación
- [ ] Los recursos conformes se despliegan correctamente
- [ ] Las políticas de mutación corrigen automáticamente los recursos
- [ ] El modo de auditoría identifica violaciones en los recursos existentes
- [ ] Los informes de políticas generados y accesibles
- [ ] Las métricas expuestas para el monitoreo de cumplimiento de políticas
- [ ] El pipeline CI/CD valida los manifiestos antes del despliegue
- [ ] Los hooks de pre-commit previenen las violaciones de políticas
- [ ] Las exclusiones de namespace configuradas apropiadamente

## Errores Comunes

- **Política de fallo del webhook**: `failurePolicy: Fail` bloquea todos los recursos si el webhook no está disponible. Usa `Ignore` para políticas no críticas, pero comprende las implicaciones de seguridad. Prueba la disponibilidad del webhook antes de aplicar.

- **Políticas iniciales demasiado restrictivas**: Comenzar con el modo de aplicación en políticas estrictas rompe las cargas de trabajo existentes. Comienza con el modo de auditoría, revisa las violaciones, comunícate con los equipos y luego aplica gradualmente.

- **Especificaciones de recursos faltantes**: Las políticas deben especificar correctamente los grupos de API, versiones y tipos. Usa `kubectl api-resources` para encontrar los valores exactos. Los comodines (`*`) son convenientes pero pueden causar problemas de rendimiento.

- **Orden de mutación**: Las mutaciones se aplican antes que las validaciones. Asegúrate de que las mutaciones no entran en conflicto y que las validaciones tienen en cuenta los valores mutados. Prueba la mutación+validación juntas.

- **Exclusiones de namespace**: Excluir los namespaces del sistema es necesario, pero ten cuidado de no excluir en exceso. Revisa las exclusiones regularmente a medida que las políticas maduran.

- **Complejidad de Rego (Gatekeeper)**: Las políticas Rego complejas son difíciles de depurar. Comienza simple, prueba con `opa test` localmente, agrega registro con `trace()`, usa gator para pruebas sin conexión.

- **Impacto en el rendimiento**: La evaluación de políticas añade latencia a la admisión. Mantén las políticas eficientes, usa criterios de coincidencia apropiados, monitorea las métricas de latencia del webhook.

- **Conflictos de políticas**: Múltiples políticas que modifican el mismo campo causan problemas. Coordina las políticas entre equipos, usa bibliotecas de políticas para patrones comunes, prueba las combinaciones.

- **Escaneo en segundo plano**: La auditoría en segundo plano escanea todo el clúster. Puede consumir muchos recursos en clústeres grandes. Ajusta el intervalo de auditoría según el tamaño del clúster y el número de políticas.

- **Compatibilidad de versiones**: Las versiones de los CRD de políticas cambian. Gatekeeper v3 usa restricciones `v1beta1`, Kyverno v1.11 usa `kyverno.io/v1`. Comprueba la documentación de tu versión.

## Habilidades Relacionadas

- `manage-kubernetes-secrets` - Políticas de validación de secretos
- `security-audit-codebase` - Escaneo de seguridad complementario
- `deploy-to-kubernetes` - Despliegue de aplicaciones con validación de políticas
- `setup-service-mesh` - Las políticas de autorización de la malla de servicios complementan las políticas de admisión
- `configure-api-gateway` - Las políticas de la puerta de enlace funcionan junto con las políticas de admisión
- `implement-gitops-workflow` - GitOps con validación de políticas en el pipeline
