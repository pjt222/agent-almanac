---
name: security-audit-codebase
description: >
  Realizar una auditoría de seguridad del código verificando secretos
  expuestos, dependencias vulnerables, vulnerabilidades de inyección,
  configuraciones inseguras y problemas del OWASP Top 10. Utilizar
  antes de publicar o desplegar un proyecto, para revisiones de
  seguridad periódicas, después de agregar autenticación o integración
  con API, antes de hacer público un repositorio privado, o al
  prepararse para una auditoría de cumplimiento de seguridad.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: security, audit, owasp, secrets, vulnerability
  locale: es
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: 2026-03-13
---

# Auditoría de Seguridad del Código

Realizar una revisión de seguridad sistemática del código para identificar vulnerabilidades y secretos expuestos.

## Cuándo Usar

- Antes de publicar o desplegar un proyecto
- Revisión de seguridad periódica de proyectos existentes
- Después de agregar autenticación, integración con API o manejo de entrada de usuario
- Antes de hacer público un repositorio privado
- Al prepararse para una auditoría de cumplimiento de seguridad

## Entradas

- **Requerido**: Código a auditar
- **Opcional**: Área de enfoque específica (secretos, dependencias, inyección, autenticación)
- **Opcional**: Marco de cumplimiento (OWASP, ISO 27001, SOC 2)
- **Opcional**: Hallazgos de auditorías anteriores para comparación

## Procedimiento

### Paso 1: Buscar Secretos Expuestos

Buscar patrones que indiquen secretos codificados directamente:

```bash
# Claves de API y tokens
grep -rn "sk-\|ghp_\|gho_\|github_pat_\|hf_\|AKIA" --include="*.{md,js,ts,py,R,json,yml,yaml}" .

# Patrones genéricos de secretos
grep -rn "password\s*=\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "api[_-]key\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "secret\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .

# Cadenas de conexión
grep -rn "postgresql://\|mysql://\|mongodb://" .

# Claves privadas
grep -rn "BEGIN.*PRIVATE KEY" .
```

**Esperado:** No se encuentran secretos reales, solo marcadores de posición como `YOUR_TOKEN_HERE` o `your.email@example.com`.

**En caso de fallo:** Si se encuentran secretos reales, eliminarlos inmediatamente, rotar la credencial expuesta y limpiar el historial de git con `git filter-branch` o `git-filter-repo`. Tratar cualquier secreto expuesto como comprometido.

### Paso 2: Verificar la Cobertura de .gitignore

Verificar que los archivos sensibles estén excluidos:

```bash
# Verificar que estos están ignorados por git
git check-ignore .env .Renviron credentials.json node_modules/

# Buscar archivos sensibles rastreados
git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

**Esperado:** Todos los archivos sensibles (`.env`, `.Renviron`, `credentials.json`) están listados en `.gitignore`, y `git ls-files` no devuelve archivos sensibles rastreados.

**En caso de fallo:** Si hay archivos sensibles rastreados, ejecutar `git rm --cached <file>` para dejar de rastrearlos, agregar a `.gitignore` y confirmar. El archivo permanece en disco pero ya no está bajo control de versiones.

### Paso 3: Auditar Dependencias

**Node.js**:

```bash
npm audit
npx audit-ci --moderate
```

**Python**:

```bash
pip-audit
safety check
```

**R**:

```r
# Verificar vulnerabilidades conocidas en paquetes
# No hay herramienta integrada, pero verificar las fuentes de los paquetes
renv::status()
```

**Esperado:** No hay vulnerabilidades altas o críticas en las dependencias. Las vulnerabilidades moderadas y bajas están documentadas para revisión.

**En caso de fallo:** Si se encuentran vulnerabilidades críticas, actualizar los paquetes afectados inmediatamente con `npm audit fix` o `pip install --upgrade`. Si las actualizaciones introducen cambios incompatibles, documentar la vulnerabilidad y crear un plan de remediación.

### Paso 4: Verificar Vulnerabilidades de Inyección

**Inyección SQL**:

```bash
# Buscar concatenación de cadenas en consultas
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

Todas las consultas a bases de datos deben usar consultas parametrizadas, no concatenación de cadenas.

**Inyección de Comandos**:

```bash
# Buscar ejecución de shell con entrada de usuario
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS (Cross-Site Scripting)**:

```bash
# Buscar contenido de usuario sin escapar en HTML
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

**Esperado:** No se encuentran vectores de inyección SQL, de comandos ni XSS. Todas las consultas a bases de datos usan sentencias parametrizadas, los comandos de shell evitan entrada controlada por el usuario, y la salida HTML está correctamente escapada.

**En caso de fallo:** Si se encuentran vulnerabilidades de inyección, reemplazar la concatenación de cadenas en consultas con consultas parametrizadas, sanitizar o escapar la entrada del usuario antes de la ejecución en shell, y usar métodos de renderizado seguros del framework en lugar de `innerHTML` o `dangerouslySetInnerHTML`.

### Paso 5: Revisar Autenticación y Autorización

Lista de verificación:
- [ ] Contraseñas hasheadas con bcrypt/argon2 (no MD5/SHA1)
- [ ] Tokens de sesión son aleatorios y suficientemente largos
- [ ] Tokens de autenticación tienen expiración
- [ ] Los endpoints de API verifican autorización
- [ ] CORS configurado de forma restrictiva
- [ ] Protección CSRF habilitada para operaciones que modifican estado

**Esperado:** Todos los elementos de la lista pasan: las contraseñas usan hash fuerte, los tokens son aleatorios con expiración, los endpoints aplican autorización, CORS es restrictivo y la protección CSRF está activa.

**En caso de fallo:** Priorizar las correcciones por severidad: hash de contraseñas débil y autorización faltante son críticos, mientras que los problemas de CORS y CSRF son altos. Documentar todos los hallazgos con su nivel de severidad.

### Paso 6: Verificar Seguridad de la Configuración

```bash
# Modo debug en configuraciones de producción
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# CORS permisivo
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTP en lugar de HTTPS
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

**Esperado:** El modo debug está deshabilitado en configuraciones de producción, CORS no usa orígenes comodín en producción, y todas las URLs externas usan HTTPS.

**En caso de fallo:** Si el modo debug está habilitado en configuraciones de producción, deshabilitarlo inmediatamente. Reemplazar orígenes CORS comodín con dominios permitidos explícitos. Actualizar URLs `http://` a `https://` donde el endpoint lo soporte.

### Paso 7: Documentar los Hallazgos

Crear un informe de auditoría:

```markdown
# Security Audit Report

**Date**: YYYY-MM-DD
**Auditor**: [Name]
**Scope**: [Repository/Project]
**Status**: [PASS/FAIL/CONDITIONAL]

## Findings Summary

| Category | Status | Details |
|----------|--------|---------|
| Exposed secrets | PASS | No secrets found |
| .gitignore | PASS | Sensitive files excluded |
| Dependencies | WARN | 2 moderate vulnerabilities |
| Injection | PASS | Parameterized queries used |
| Auth/AuthZ | N/A | No authentication in scope |
| Configuration | PASS | Debug mode disabled |

## Detailed Findings

### Finding 1: [Title]
- **Severity**: Low / Medium / High / Critical
- **Location**: `path/to/file:line`
- **Description**: What was found
- **Recommendation**: How to fix
- **Status**: Open / Resolved

## Recommendations
1. Update dependencies to fix moderate vulnerabilities
2. [Additional recommendations]
```

**Esperado:** Un `SECURITY_AUDIT_REPORT.md` completo guardado en la raíz del proyecto con hallazgos categorizados por severidad, cada uno con ubicación específica, descripción y recomendación.

**En caso de fallo:** Si hay demasiados hallazgos para documentar individualmente, agrupar por categoría y priorizar los hallazgos críticos/altos. Generar el informe independientemente del resultado para establecer una línea base.

## Validación

- [ ] No hay secretos codificados directamente en el código fuente
- [ ] .gitignore cubre todos los archivos sensibles
- [ ] No hay vulnerabilidades altas/críticas en dependencias
- [ ] No hay vulnerabilidades de inyección
- [ ] La autenticación está correctamente implementada (si aplica)
- [ ] El informe de auditoría está completo y los hallazgos están atendidos

## Errores Comunes

- **Solo verificar archivos actuales**: Los secretos en el historial de git siguen estando expuestos. Verificar con `git log -p --all -S 'secret_pattern'`.
- **Ignorar dependencias de desarrollo**: Las dependencias de desarrollo también pueden introducir riesgos en la cadena de suministro.
- **Falsa sensación de seguridad por `.gitignore`**: `.gitignore` solo previene el rastreo futuro. Los archivos ya confirmados necesitan `git rm --cached`.
- **Pasar por alto archivos de configuración**: `docker-compose.yml`, configuraciones de CI y scripts de despliegue frecuentemente contienen secretos.
- **No rotar credenciales comprometidas**: Encontrar y eliminar un secreto no es suficiente. La credencial debe ser revocada y regenerada.

## Habilidades Relacionadas

- `configure-git-repository` - configuración adecuada de .gitignore
- `write-claude-md` - documentar requisitos de seguridad
- `setup-gxp-r-project` - seguridad en entornos regulados
