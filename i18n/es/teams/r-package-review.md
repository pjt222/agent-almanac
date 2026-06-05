---
name: r-package-review
description: Equipo multiagente para revisión integral de calidad de paquetes R que cubre calidad de código, arquitectura y seguridad
lead: r-developer
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [R, code-review, quality, package-development]
coordination: hub-and-spoke
members:
  - id: r-developer
    role: Lead
    responsibilities: Distribuye tareas de revisión, verifica convenciones específicas de R (roxygen2, NAMESPACE, testthat), sintetiza el informe final de revisión
  - id: code-reviewer
    role: Quality Reviewer
    responsibilities: Revisa estilo de código, cobertura de pruebas, calidad de pull requests y buenas prácticas generales
  - id: senior-software-developer
    role: Architecture Reviewer
    responsibilities: Evalúa estructura del paquete, diseño de API, gestión de dependencias, principios SOLID y deuda técnica
  - id: security-analyst
    role: Security Reviewer
    responsibilities: Audita secretos expuestos, validación de entrada, operaciones seguras de archivos y vulnerabilidades de dependencias
locale: es
source_locale: en
source_commit: 6a868d56
translator: Claude Opus 4.6
translation_date: 2026-03-13
---

# Equipo de Revisión de Paquetes R

Un equipo de cuatro agentes que realiza una revisión integral de calidad de paquetes R. El líder (r-developer) orquesta revisiones paralelas en calidad de código, arquitectura y seguridad, y luego sintetiza los hallazgos en un informe unificado.

## Propósito

El desarrollo de paquetes R se beneficia de múltiples perspectivas de revisión que un solo agente no puede proporcionar simultáneamente. Este equipo descompone la revisión de paquetes en cuatro especialidades complementarias:

- **Convenciones R**: documentación roxygen2, exportaciones NAMESPACE, patrones testthat, cumplimiento CRAN
- **Calidad de código**: consistencia de estilo, cobertura de pruebas, manejo de errores, higiene de pull requests
- **Arquitectura**: estructura del paquete, superficie de API, grafo de dependencias, adherencia a SOLID
- **Seguridad**: exposición de secretos, sanitización de entrada, patrones seguros de eval, CVEs de dependencias

Al ejecutar estas revisiones en paralelo y sintetizar los resultados, el equipo entrega retroalimentación completa más rápido que una revisión secuencial con un solo agente.

## Composición del Equipo

| Miembro | Agente | Rol | Áreas de Enfoque |
|---------|--------|-----|-------------------|
| Líder | `r-developer` | Líder | Convenciones R, cumplimiento CRAN, síntesis final |
| Calidad | `code-reviewer` | Revisor de Calidad | Estilo, pruebas, manejo de errores, calidad de PR |
| Arquitectura | `senior-software-developer` | Revisor de Arquitectura | Estructura, diseño de API, dependencias, deuda técnica |
| Seguridad | `security-analyst` | Revisor de Seguridad | Secretos, validación de entrada, CVEs, patrones seguros |

## Patrón de Coordinación

Hub-and-spoke (centro y radios): el líder r-developer distribuye las tareas de revisión, cada revisor trabaja de forma independiente, y el líder recopila y sintetiza todos los hallazgos.

```
            r-developer (Líder)
           /       |        \
          /        |         \
   code-reviewer   |    security-analyst
                   |
     senior-software-developer
```

**Flujo:**

1. El líder analiza la estructura del paquete y crea tareas de revisión
2. Tres revisores trabajan en paralelo en sus especialidades
3. El líder recopila todos los hallazgos y produce un informe unificado
4. El líder señala conflictos o hallazgos superpuestos

## Descomposición de Tareas

### Fase 1: Configuración (Líder)
El líder r-developer examina el paquete y crea tareas dirigidas:

- Identificar archivos clave: `DESCRIPTION`, `NAMESPACE`, `R/`, `tests/`, `man/`, `vignettes/`
- Crear tareas de revisión con alcance definido para la especialidad de cada revisor
- Anotar cualquier preocupación específica del paquete (ej., integración Rcpp, componentes Shiny)

### Fase 2: Revisión en Paralelo

Tareas de **code-reviewer**:
- Revisar estilo de código contra la guía de estilo tidyverse
- Verificar cobertura de pruebas y patrones testthat
- Evaluar mensajes de error y uso de `stop()`/`warning()`
- Revisar `.Rbuildignore` e higiene de archivos de desarrollo

Tareas de **senior-software-developer**:
- Evaluar la superficie de API del paquete (decisiones de `@export`)
- Verificar el peso de dependencias (`Imports` vs `Suggests`)
- Evaluar la organización interna del código y el acoplamiento
- Revisar complejidad innecesaria o abstracción prematura

Tareas de **security-analyst**:
- Buscar secretos expuestos en código y datos
- Verificar uso de `system()`, `eval()` y `source()`
- Revisar E/S de archivos por riesgos de path traversal
- Verificar dependencias por vulnerabilidades conocidas

### Fase 3: Síntesis (Líder)
El líder r-developer:
- Recopila todos los hallazgos de los revisores
- Verifica convenciones específicas de R (roxygen2, NAMESPACE, notas de CRAN)
- Resuelve recomendaciones conflictivas
- Produce un informe priorizado: crítico > alto > medio > bajo

## Configuración

Bloque de configuración legible por máquina para herramientas que crean este equipo automáticamente.

<!-- CONFIG:START -->
```yaml
team:
  name: r-package-review
  lead: r-developer
  coordination: hub-and-spoke
  members:
    - agent: r-developer
      role: Lead
      subagent_type: r-developer
    - agent: code-reviewer
      role: Quality Reviewer
      subagent_type: code-reviewer
    - agent: senior-software-developer
      role: Architecture Reviewer
      subagent_type: senior-software-developer
    - agent: security-analyst
      role: Security Reviewer
      subagent_type: security-analyst
  tasks:
    - name: review-code-quality
      assignee: code-reviewer
      description: Review code style, test coverage, error handling, and PR hygiene
    - name: review-architecture
      assignee: senior-software-developer
      description: Evaluate package structure, API design, dependencies, and tech debt
    - name: review-security
      assignee: security-analyst
      description: Audit for secrets, input validation, safe patterns, and dependency CVEs
    - name: review-r-conventions
      assignee: r-developer
      description: Check roxygen2 docs, NAMESPACE, testthat patterns, CRAN compliance
    - name: synthesize-report
      assignee: r-developer
      description: Collect all findings and produce unified prioritized report
      blocked_by: [review-code-quality, review-architecture, review-security, review-r-conventions]
```
<!-- CONFIG:END -->

## Escenarios de Uso

### Escenario 1: Revisión Pre-envío a CRAN
Antes de enviar a CRAN, ejecutar la revisión completa del equipo para detectar problemas en todas las dimensiones:

```
Usuario: Revisar mi paquete R en /ruta/al/mipaquete antes del envío a CRAN
```

El equipo verificará requisitos específicos de CRAN (ejemplos, \dontrun, validez de URLs) junto con preocupaciones generales de calidad, arquitectura y seguridad.

### Escenario 2: Revisión de Pull Request
Para PRs significativos que tocan múltiples componentes del paquete:

```
Usuario: Revisar PR #42 de mi paquete R — agrega un nuevo endpoint de API e integración Rcpp
```

El equipo distribuye la revisión a través de las áreas modificadas, con el revisor de arquitectura enfocándose en el diseño de API y el analista de seguridad verificando los bindings Rcpp.

### Escenario 3: Auditoría de Paquete
Para paquetes heredados o desconocidos que necesitan una evaluación exhaustiva:

```
Usuario: Auditar este paquete R que heredé — necesito entender su calidad y riesgos
```

El equipo proporciona una evaluación integral que cubre la salud del código, decisiones arquitectónicas y postura de seguridad.

## Limitaciones

- Diseñado específicamente para paquetes R; no para revisión de código de propósito general
- Requiere que los cuatro tipos de agente estén disponibles como subagentes
- El informe sintetizado refleja análisis automatizado; el juicio humano sigue siendo necesario para la lógica específica del dominio
- No ejecuta `R CMD check` ni pruebas directamente — se enfoca en revisión estática
- Paquetes grandes (>100 archivos R) pueden beneficiarse de revisión con alcance delimitado en lugar de revisión completa

## Véase También

- [r-developer](../agents/r-developer.md) — Agente líder con expertise en paquetes R
- [code-reviewer](../agents/code-reviewer.md) — Agente de revisión de calidad
- [senior-software-developer](../agents/senior-software-developer.md) — Agente de revisión de arquitectura
- [security-analyst](../agents/security-analyst.md) — Agente de auditoría de seguridad
- [submit-to-cran](../skills/submit-to-cran/SKILL.md) — Habilidad de envío a CRAN
- [review-software-architecture](../skills/review-software-architecture/SKILL.md) — Habilidad de revisión de arquitectura

---

**Autor**: Philipp Thoss
**Versión**: 1.0.0
**Última Actualización**: 2026-02-16
