---
name: polish-claw-project
description: >
  Contribute to OpenClaw ecosystem projects (OpenClaw, NemoClaw, NanoClaw)
  through a structured 9-step workflow: target verification, codebase
  exploration, parallel audit, finding cross-reference, and pull request
  creation. Emphasizes false positive prevention and project convention
  adherence.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, contribution, security, code-review, pull-request, claw, nvidia
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Polish Claw Project

Flujo de trabajo estructurado para contribuir a proyectos del ecosistema OpenClaw. El valor novedoso está en los Pasos 5-7: auditoría paralela, prevención de falsos positivos y referencia cruzada de hallazgos contra issues abiertos para seleccionar contribuciones de alto impacto. Los pasos mecánicos (fork, creación de PR) delegan a habilidades existentes.

## Cuándo Usar

- Contribuir a NVIDIA/OpenClaw, NVIDIA/NemoClaw, NVIDIA/NanoClaw o repos similares del ecosistema Claw
- Primeras contribuciones a un proyecto open-source desconocido con arquitectura sensible a la seguridad
- Cuando quieres un flujo de contribución repetible y auditable en lugar de fixes ad-hoc
- Después de identificar un proyecto Claw que acepta contribuciones externas (verificar CONTRIBUTING.md)

## Entradas

- **Requerido**: `repo_url` — URL de GitHub del proyecto Claw objetivo (p. ej., `https://github.com/NVIDIA/NemoClaw`)
- **Opcional**:
  - `contribution_count` — Número de contribuciones a apuntar (predeterminado: 1-3)
  - `focus` — Tipo de contribución preferido: `security`, `tests`, `docs`, `bugs`, `any` (predeterminado: `any`)
  - `fork_org` — Org/usuario de GitHub para hacer fork (predeterminado: usuario autenticado)

## Procedimiento

### Paso 1: Identificar y Verificar el Objetivo

Confirmar que el proyecto acepta contribuciones externas y está activamente mantenido.

1. Abrir la URL del repositorio y leer `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` y `LICENSE`
2. Verificar la actividad reciente de commits (últimos 30 días) y la tasa de merge de PRs abiertos
3. Verificar que el proyecto usa una licencia permisiva o amigable para contribuciones
4. Leer `SECURITY.md` o política de seguridad si está presente — anotar reglas de divulgación responsable
5. Identificar el lenguaje primario, framework de tests y sistema de CI

**Esperado:** CONTRIBUTING.md existe, commits dentro de los últimos 30 días, pautas claras de contribución.

**En caso de fallo:** Si no hay CONTRIBUTING.md o no hay actividad reciente, documentar por qué y detenerse — los proyectos obsoletos raramente mergean PRs externos.

### Paso 2: Hacer Fork y Clonar

Crear una copia de trabajo del repositorio.

1. Fork: `gh repo fork <repo_url> --clone`
2. Establecer remote upstream: `git remote add upstream <repo_url>`
3. Verificar: `git remote -v` muestra ambos `origin` (fork) y `upstream`
4. Sincronizar: `git fetch upstream && git checkout main && git merge upstream/main`

**Esperado:** Clon local con ambos remotes configurados y actualizados.

**En caso de fallo:** Si el fork falla, verificar autenticación de GitHub (`gh auth status`). Si el clon es lento, probar `--depth=1` para exploración inicial.

### Paso 3: Explorar la Base de Código

Construir un modelo mental de la arquitectura del proyecto.

1. Leer `README.md` para resumen de arquitectura y objetivos del proyecto
2. Identificar puntos de entrada, módulos centrales y superficie de API pública
3. Mapear la estructura de pruebas: dónde viven las pruebas, qué framework, nivel de cobertura
4. Anotar convenciones de estilo de código: config de linter, patrones de nombrado, estilo de import
5. Verificar configuración Docker/contenedor, configuración CI y patrones de despliegue

**Esperado:** Comprensión clara de la estructura del proyecto, convenciones y dónde encajarían las contribuciones.

**En caso de fallo:** Si la arquitectura no está clara, enfocarse en un subsistema específico en lugar del proyecto completo.

### Paso 4: Leer Issues Abiertos

Encuestar issues existentes para entender las necesidades del proyecto y evitar trabajo duplicado.

1. Listar issues abiertos: `gh issue list --state open --limit 50`
2. Categorizar por tipo: bugs, características, docs, seguridad, good-first-issue
3. Anotar issues etiquetados como `help wanted`, `good first issue` o `hacktoberfest`
4. Verificar issues obsoletos (>90 días abiertos, sin comentarios recientes) — pueden estar abandonados
5. Leer cualquier PR vinculado para entender soluciones intentadas

**Esperado:** Lista categorizada de issues no reclamados con etiquetas de tipo.

**En caso de fallo:** Si no existen issues abiertos, proceder al Paso 5 — la auditoría puede descubrir mejoras no listadas.

### Paso 5: Auditoría Paralela

Ejecutar auditorías de seguridad y calidad de código en paralelo. Aquí es donde emergen hallazgos novedosos.

1. Ejecutar la habilidad `security-audit-codebase` contra la raíz del proyecto
2. Simultáneamente ejecutar la habilidad `review-codebase` con scope `quality`
3. **Crítico: verificar cada hallazgo contra el modelo de amenaza y arquitectura del proyecto**
   - Un "secreto hardcoded" en un script de bootstrap de sandbox no es una vulnerabilidad
   - Una validación de entrada faltante en una función solo-interna es de severidad baja
   - Una dependencia marcada como vulnerable puede ya estar mitigada por la arquitectura del proyecto
4. Calificar los hallazgos verificados: CRITICAL, HIGH, MEDIUM, LOW
5. Documentar falsos positivos con razonamiento — informan los Errores Comunes para futuras ejecuciones

**Esperado:** Lista de hallazgos verificados con calificaciones de severidad y anotaciones de falsos positivos.

**En caso de fallo:** Si no emergen hallazgos, cambiar el enfoque a brechas de cobertura de tests, mejoras de documentación o mejoras de experiencia del desarrollador.

### Paso 6: Referencia Cruzada de Hallazgos

Mapear hallazgos verificados de auditoría a issues abiertos — el paso de juicio central.

1. Para cada hallazgo verificado, buscar issues abiertos por discusiones relacionadas
2. Categorizar cada hallazgo como:
   - **Coincide con issue abierto** — vincular el hallazgo al issue
   - **Hallazgo nuevo** — ningún issue existente cubre esto
   - **Ya arreglado en PR** — verificar PRs abiertos por fixes en progreso
3. Priorizar hallazgos que coinciden con issues existentes (mayor probabilidad de merge)
4. Para hallazgos nuevos, evaluar si los mantenedores darían la bienvenida al fix basándose en las prioridades del proyecto

**Esperado:** Lista priorizada con mapeo hallazgo-a-issue y evaluación de probabilidad de merge.

**En caso de fallo:** Si todos los hallazgos ya están abordados, regresar al Paso 4 y buscar contribuciones de documentación, tests o experiencia del desarrollador.

### Paso 7: Seleccionar Contribuciones

Elegir 1-3 contribuciones basándose en impacto, esfuerzo y experticia.

1. Puntuar cada candidato en:
   - **Impacto**: ¿Cuánto mejora esto al proyecto? (seguridad > bugs > tests > docs)
   - **Esfuerzo**: ¿Se puede hacer bien en una sesión enfocada? (preferir PRs pequeños y completos)
   - **Experticia**: ¿El contribuyente tiene conocimiento de dominio para este fix?
   - **Probabilidad de merge**: ¿Esto coincide con las prioridades declaradas del proyecto?
2. Seleccionar los candidatos top (predeterminado: 1-3)
3. Para cada uno, definir: nombre de rama, límite de scope, criterios de aceptación, plan de pruebas

**Esperado:** 1-3 contribuciones seleccionadas con scope claro y criterios de aceptación.

**En caso de fallo:** Si ninguna contribución puntúa bien, considerar archivar issues bien escritos en lugar de PRs.

### Paso 8: Implementar

Crear una rama por contribución e implementar el fix.

1. Para cada contribución: `git checkout -b fix/<description>`
2. Seguir las convenciones del proyecto exactamente (linter, nombrado, estilo de import)
3. Añadir o actualizar pruebas cubriendo el cambio
4. Ejecutar la suite de pruebas del proyecto: verificar que todas las pruebas pasan
5. Ejecutar el linter del proyecto: verificar que no hay nuevas advertencias
6. Mantener cada PR enfocado — un cambio lógico por rama

**Esperado:** Implementación limpia con pruebas pasando y sin advertencias del linter.

**En caso de fallo:** Si las pruebas fallan en problemas pre-existentes, documentarlas y asegurar que el PR no introduce nuevos fallos.

### Paso 9: Crear Pull Requests

Enviar contribuciones siguiendo el CONTRIBUTING.md del proyecto.

1. Push de la rama: `git push origin fix/<description>`
2. Crear PR usando la habilidad `create-pull-request`
3. Referenciar el issue relacionado en el cuerpo del PR (p. ej., "Fixes #123")
4. Seguir la plantilla de PR del proyecto si existe
5. Ser responsivo al feedback del revisor — iterar rápidamente

**Esperado:** PRs creados, vinculados a issues, siguiendo las convenciones del proyecto.

**En caso de fallo:** Si la creación de PR falla, verificar reglas de protección de rama y acuerdos de licencia de contribuyente.

## Validación

1. Todas las contribuciones seleccionadas han sido implementadas y enviadas como PRs
2. Cada PR referencia el issue relacionado (si existe uno)
3. Todas las pruebas del proyecto pasan en cada rama de PR
4. No se enviaron hallazgos de falsos positivos como issues reales
5. Las descripciones de PR siguen la plantilla del CONTRIBUTING.md del proyecto

## Errores Comunes

- **Sobre-reclamación de falsos positivos**: Los proyectos Claw usan arquitecturas de sandbox — una "vulnerabilidad" dentro de un entorno sandboxed puede ser por diseño. Siempre verificar contra el modelo de amenaza del proyecto antes de reportar.
- **Disrupción de la cadena de digest/firma**: Los proyectos Claw a menudo usan cadenas de verificación para la integridad del modelo. Los cambios deben preservar estas cadenas o el PR será rechazado.
- **Desajuste de convenciones**: Los proyectos Claw aplican estilo estricto. Ejecutar el linter del proyecto, no uno genérico. Coincidir con el ordenamiento de imports, formato de docstrings y patrones de tests exactamente.
- **Scope creep**: 3 PRs enfocados se mergean más rápido que 1 PR extenso. Mantener cada contribución atómica.
- **Fork obsoleto**: Siempre sincronizar con upstream antes de comenzar el trabajo (`git fetch upstream && git merge upstream/main`).

## Habilidades Relacionadas

- [security-audit-codebase](../security-audit-codebase/SKILL.md) — usado en el Paso 5 para hallazgos de seguridad
- [review-codebase](../review-codebase/SKILL.md) — usado en el Paso 5 para revisión de calidad de código
- [create-pull-request](../create-pull-request/SKILL.md) — usado en el Paso 9 para creación de PR
- [create-github-issues](../create-github-issues/SKILL.md) — para archivar issues de hallazgos no abordados como PRs
- [manage-git-branches](../manage-git-branches/SKILL.md) — gestión de ramas durante la implementación
- [commit-changes](../commit-changes/SKILL.md) — flujo de trabajo de commit
