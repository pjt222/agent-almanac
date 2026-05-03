---
name: evaluate-agent-framework
description: >
  Assess an open-source agent framework for investment readiness by evaluating
  community health, supersession risk, architecture alignment, and governance
  sustainability. Produces a four-tier classification (INVEST / EVALUATE-FURTHER /
  CONTRIBUTE-CAUTIOUSLY / AVOID) to guide resource allocation decisions before
  committing engineering effort.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, framework-evaluation, risk-assessment, community-health, supersession, investment
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Evaluate Agent Framework

Evaluación estructurada de la madurez para inversión de un framework agentic open-source. El valor novedoso está en los Pasos 2-3: cuantificar la salud de la comunidad mediante tasas de supervivencia de contribuciones y medir el riesgo de supersesión — la razón más común por la que el esfuerzo de ingeniería externo se desperdicia. La clasificación final (INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID) calibra la asignación de recursos antes de comprometer ciclos de desarrollo.

## Cuándo Usar

- Evaluar si adoptar un framework agentic para uso en producción
- Evaluar el riesgo de dependencia en un framework del que tu proyecto depende
- Decidir si contribuir esfuerzo de ingeniería a un proyecto externo
- Comparar frameworks competidores para una decisión de construir-vs-adoptar
- Re-evaluar un framework después de un release mayor, cambio de gobernanza o adquisición

## Entradas

- **Requerido**: `framework_url` — URL de GitHub del repositorio del framework
- **Opcional**:
  - `comparison_frameworks` — lista de URLs de frameworks alternativos para benchmark
  - `use_case` — caso de uso previsto para evaluación de alineamiento arquitectónico (p. ej., "orquestación multi-agente", "pipelines de uso de herramientas")
  - `contribution_budget` — horas de ingeniería planificadas, para calibrar el nivel de inversión

## Procedimiento

### Paso 1: Reunir Censo del Framework

Recolectar datos fundacionales sobre el tamaño, actividad y posición en el panorama del proyecto antes del análisis más profundo.

1. Obtener y leer `README.md`, `CONTRIBUTING.md`, `LICENSE` y cualquier doc de arquitectura (`docs/`, `ARCHITECTURE.md`)
2. Recolectar métricas cuantitativas:
   - Stars, forks, issues abiertos, PRs abiertos: `gh repo view <repo> --json stargazerCount,forkCount,issues,pullRequests`
   - Repositorios dependientes: verificar el conteo "Used by" de GitHub o `gh api repos/<owner>/<repo>/dependents`
   - Cadencia de releases: `gh release list --limit 10` — anotar frecuencia y si los releases siguen semver
3. Calcular bus factor: identificar los top 5 contribuyentes por conteo de commits sobre los últimos 12 meses. Si el contribuyente top representa >60% de los commits, el bus factor es críticamente bajo
4. Mapear posición en el panorama:
   - **Pioneer**: primero en moverse, define la categoría (alta influencia, alto riesgo de supersesión para los seguidores)
   - **Fast-follower**: lanzado dentro de 6 meses del pioneer, iterando sobre el concepto
   - **Late entrant**: llegó después de que la categoría se estabilizara, compitiendo en características o gobernanza
5. Si se proporciona `comparison_frameworks`, reunir las mismas métricas para cada alternativa

**Esperado:** Tabla de censo con stars, forks, dependientes, cadencia de releases, bus factor y posición en el panorama para el objetivo (y comparaciones si se proporcionan).

**En caso de fallo:** Si el repositorio es privado o tiene rate-limit en la API, recurrir al análisis manual del README. Si las métricas no están disponibles (p. ej., GitLab self-hosted), anotar la brecha y proceder con evaluación cualitativa.

### Paso 2: Evaluar la Salud de la Comunidad

Cuantificar si el proyecto da la bienvenida, apoya y retiene a contribuyentes externos.

1. Calcular la **tasa de supervivencia de contribuciones externas**:
   - Tirar los últimos 50 PRs cerrados: `gh pr list --state closed --limit 50 --json author,mergedAt,closedAt,labels`
   - Clasificar cada autor de PR como interno (miembro de la org) o externo
   - Calcular: `survival_rate = merged_external_PRs / total_external_PRs`
   - Umbral saludable: >50% tasa de supervivencia; preocupante: <30%
2. Medir capacidad de respuesta:
   - **Tiempo de primera respuesta a issues**: tiempo mediano desde creación del issue hasta el primer comentario del mantenedor
   - **Latencia de merge de PRs**: tiempo mediano desde apertura del PR hasta merge para PRs externos
   - Saludable: <7 días primera respuesta, <30 días merge; preocupante: >30 días primera respuesta
3. Evaluar diversidad de contribuyentes:
   - Ratio externo/interno de contribuyentes sobre los últimos 6 meses
   - Número de contribuyentes externos únicos con >=2 PRs mergeados (contribuyentes recurrentes señalan un ecosistema saludable)
4. Verificar artefactos de gobernanza:
   - `CONTRIBUTING.md` existe y es accionable (no solo "envía un PR")
   - `CODE_OF_CONDUCT.md` existe
   - Docs de gobernanza describen el proceso de toma de decisiones
   - Plantillas de issues/PRs guían a los contribuyentes

**Esperado:** Scorecard de salud comunitaria con tasa de supervivencia, tiempos de respuesta, ratio de diversidad y checklist de artefactos de gobernanza.

**En caso de fallo:** Si los datos de PRs son insuficientes (proyecto nuevo con <20 PRs cerrados), anotar la limitación de tamaño de muestra y ponderar otras señales más fuertemente. Si el proyecto usa una plataforma no-GitHub, adaptar las consultas a la API de esa plataforma.

### Paso 3: Calcular el Riesgo de Supersesión

Determinar qué tan probable es que las contribuciones externas sean dejadas obsoletas por el desarrollo interno — el mayor riesgo individual para adoptantes y contribuyentes del framework.

1. Muestrear los últimos 50-100 PRs externos mergeados (o todos si existen menos)
2. Para cada PR externo mergeado, verificar si el código contribuido fue después:
   - **Revertido**: commit explícito de revert referenciando el PR
   - **Reescrito**: el mismo archivo/módulo cambió sustancialmente dentro de 90 días por un contribuyente interno
   - **Obsoletado**: característica eliminada o reemplazada en un release subsiguiente
3. Calcular: `supersession_rate = (reverted + rewritten + obsoleted) / total_merged_external`
4. Mapear el roadmap publicado (si está disponible) contra áreas donde los contribuyentes externos están activos:
   - Alto solapamiento = alto riesgo de supersesión (los internos construirán sobre el trabajo externo)
   - Bajo solapamiento = menor riesgo de supersesión (los externos llenan brechas que los internos no)
5. Verificar "trampas de contribución": áreas que parecen amigables a contribuciones pero están programadas para reescritura interna
6. Punto de referencia: análisis de NemoClaw mostró 71% de PRs externos superseidos dentro de 6 meses — usar como punto de calibración

**Esperado:** Tasa de supersesión como porcentaje, con desglose por tipo (revertido/reescrito/obsoletado). Evaluación de solapamiento con roadmap.

**En caso de fallo:** Si la historia de commits es superficial o squash-merged (perdiendo atribución), estimar la supersesión comparando rutas de archivos de PRs externos contra archivos cambiados en releases subsiguientes. Anotar confianza reducida en la estimación.

### Paso 4: Evaluar el Alineamiento Arquitectónico

Evaluar si la arquitectura del framework soporta tu caso de uso sin lock-in excesivo.

1. Mapear puntos de extensión:
   - API de plugin/extensión: ¿el framework expone una interfaz de plugin documentada?
   - Superficie de configuración: ¿se puede personalizar el comportamiento sin hacer fork?
   - Sistema de hooks/callbacks: ¿puedes interceptar y modificar el comportamiento del framework en puntos clave?
2. Evaluar el riesgo de lock-in:
   - **Costo de reescritura**: estimar esfuerzo de ingeniería para migrar fuera (días/semanas/meses)
   - **Portabilidad de datos**: ¿se pueden exportar datos/estado en formatos estándar?
   - **Cumplimiento de estándares**: ¿el framework usa estándares abiertos (agentskills.io, MCP, A2A) o protocolos propietarios?
3. Evaluar la estabilidad de la API:
   - Contar cambios disruptivos por release mayor (CHANGELOG, guías de migración)
   - Verificar política de deprecación (advertencia anticipada antes de eliminación)
   - Evaluar cumplimiento de semver (cambios disruptivos solo en versiones mayores)
4. Verificar alineamiento con tu caso de uso específico:
   - Si se proporciona `use_case`, evaluar si la arquitectura del framework lo soporta naturalmente
   - Identificar cualquier desalineamiento arquitectónico que requeriría workarounds
5. Evaluar interoperabilidad:
   - Compatibilidad con agentskills.io (alineamiento del modelo de skill)
   - Soporte MCP (integración de herramientas)
   - Soporte del protocolo A2A (comunicación agente-a-agente)

**Esperado:** Reporte de alineamiento arquitectónico con inventario de puntos de extensión, evaluación de riesgo de lock-in (bajo/medio/alto), score de estabilidad de API y evaluación de ajuste de caso de uso.

**En caso de fallo:** Si la documentación de arquitectura es escasa, derivar la evaluación de la estructura del código y la superficie de API pública. Si el framework es demasiado joven para historia de estabilidad, anotar esto y ponderar las señales de gobernanza más fuertemente.

### Paso 5: Evaluar Gobernanza y Sostenibilidad

Evaluar si el modelo de gobernanza del proyecto soporta viabilidad a largo plazo y trato justo de contribuyentes externos.

1. Clasificar el modelo de gobernanza:
   - **BDFL** (Benevolent Dictator for Life): un solo tomador de decisiones — decisiones rápidas, riesgo de bus factor
   - **Comité/Equipo central**: toma de decisiones distribuida — más lento pero más resiliente
   - **Respaldado por fundación**: gobernanza formal (Apache, Linux Foundation, CNCF) — más sostenible
   - **Controlado por corporación**: una sola empresa impulsa el desarrollo — atento a riesgo de rug-pull
2. Evaluar financiamiento y sostenibilidad:
   - Fuentes de financiamiento: VC-backed, patrocinio corporativo, becas, financiado por la comunidad, sin financiamiento
   - Conteo de mantenedores a tiempo completo: >=2 es saludable; 0 es bandera roja
   - Modelo de ingresos (si existe): ¿cómo se sostiene el proyecto a sí mismo?
3. Evaluar protecciones para contribuyentes:
   - Tipo de licencia: permisiva (MIT, Apache-2.0) vs copyleft (GPL) vs personalizada
   - Requisitos de CLA: ¿firmar un CLA transfiere derechos que perjudican a los contribuyentes?
   - Reconocimiento de contribuyentes: ¿los contribuyentes externos son acreditados en releases, changelogs, docs?
4. Verificar postura de seguridad:
   - Política de divulgación de seguridad (`SECURITY.md` o equivalente)
   - Tiempo mediano desde divulgación de CVE hasta release de parche
   - Prácticas de actualización de dependencias (Dependabot, Renovate, manual)
5. Evaluar trayectoria:
   - ¿El modelo de gobernanza está evolucionando (p. ej., moviéndose hacia una fundación)?
   - ¿Ha habido un cambio reciente de liderazgo, adquisición o re-licenciamiento?
   - ¿Hay conflictos públicos entre mantenedores y contribuyentes?

**Esperado:** Evaluación de gobernanza con clasificación del modelo, calificación de sostenibilidad (sostenible/en-riesgo/crítico), evaluación de protección de contribuyentes y resumen de postura de seguridad.

**En caso de fallo:** Si la información de gobernanza no está documentada, tratar la ausencia misma como una bandera amarilla. Verificar gobernanza implícita examinando quién mergea PRs, quién cierra issues y quién toma decisiones de release.

### Paso 6: Clasificar la Madurez para Inversión

Sintetizar todos los hallazgos en una clasificación de cuatro niveles con justificaciones específicas y recomendaciones accionables.

1. Puntuar cada dimensión (escala 1-5):
   - **Salud de la comunidad**: tasa de supervivencia, capacidad de respuesta, diversidad
   - **Riesgo de supersesión**: tasa, solapamiento con roadmap, trampas de contribución (invertir: menor es mejor)
   - **Alineamiento arquitectónico**: puntos de extensión, lock-in, estabilidad, ajuste de caso de uso
   - **Sostenibilidad de gobernanza**: modelo, financiamiento, protecciones, seguridad
2. Aplicar umbrales de clasificación:
   - **INVEST** (todas las dimensiones >=4): Comunidad saludable, baja supersesión (<20%), arquitectura alineada, gobernanza sostenible. Seguro adoptar y contribuir esfuerzo de ingeniería.
   - **EVALUATE-FURTHER** (mixto, ninguna dimensión <2): Señales mixtas que requieren seguimientos específicos. Documentar qué necesita aclaración y establecer una fecha de re-evaluación.
   - **CONTRIBUTE-CAUTIOUSLY** (cualquier dimensión 2, ninguna <2): Alta supersesión (>40%) o preocupaciones de gobernanza. Limitar contribuciones a trabajo solicitado explícitamente, scope aprobado por mantenedores o desarrollo de plugin/extensión que esté desacoplado del core.
   - **AVOID** (cualquier dimensión 1): Banderas rojas críticas — proyecto abandonado, hostil a externos (tasa de supervivencia <15%), licencia incompatible o indicadores de rug-pull inminente. No invertir esfuerzo de ingeniería.
3. Escribir el reporte de clasificación:
   - Liderar con la clasificación de nivel y justificación de una oración
   - Resumir cada score de dimensión con evidencia clave
   - Si se proporcionó `contribution_budget`, recomendar cómo asignar esas horas dado el nivel
   - Para EVALUATE-FURTHER, listar preguntas específicas que necesitan respuestas y proponer una línea de tiempo
   - Para CONTRIBUTE-CAUTIOUSLY, especificar qué tipos de contribución son seguros (plugins, docs, pruebas) vs riesgosos (características core)
4. Si se evaluaron `comparison_frameworks`, producir una matriz de comparación clasificando todos los frameworks

**Esperado:** Reporte de clasificación con nivel, scores de dimensión, resumen de evidencia y recomendaciones accionables adaptadas al contexto de inversión.

**En caso de fallo:** Si las brechas de datos previenen la clasificación con confianza, predeterminar a EVALUATE-FURTHER con documentación explícita de qué datos faltan y cómo obtenerlos. Nunca predeterminar a INVEST cuando hay incertidumbre.

## Validación

- [ ] Datos de censo recolectados: stars, forks, dependientes, cadencia de releases, bus factor, posición en el panorama
- [ ] Salud de la comunidad cuantificada: tasa de supervivencia, tiempos de respuesta, diversidad de contribuyentes, artefactos de gobernanza
- [ ] Riesgo de supersesión calculado con desglose por tipo (revertido/reescrito/obsoletado)
- [ ] Alineamiento arquitectónico evaluado: puntos de extensión, riesgo de lock-in, estabilidad de API, ajuste de caso de uso
- [ ] Gobernanza evaluada: modelo, financiamiento, protecciones de contribuyentes, postura de seguridad
- [ ] Clasificación producida: una de INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID
- [ ] Cada score de dimensión justificado con evidencia específica del análisis
- [ ] Las recomendaciones son accionables y calibradas al budget de contribución (si se proporciona)
- [ ] Brechas de datos y limitaciones de confianza documentadas explícitamente

## Errores Comunes

- **Confundir popularidad con salud**: Altas stars pero baja diversidad de contribuyentes significa un punto único de falla. Un proyecto de 50k stars con un mantenedor es menos saludable que un proyecto de 2k stars con 15 contribuyentes activos.
- **Ignorar el riesgo de supersesión**: La razón más común por la que las contribuciones externas fallan. Una comunidad acogedora no significa nada si el desarrollo interno rutinariamente sobrescribe el trabajo externo.
- **Ponderar demasiado la arquitectura sin verificar la gobernanza**: Un framework hermosamente diseñado puede aún fallar si el modelo de gobernanza es insostenible u hostil a externos.
- **Tratar EVALUATE-FURTHER como AVOID**: Las señales mixtas requieren investigación, no rechazo. Establecer una fecha concreta de re-evaluación y listar las preguntas específicas a responder.
- **Sesgo de instantánea**: Todas las métricas son punto-en-tiempo. Un proyecto en declive con grandes métricas actuales es peor que un proyecto mejorando con métricas actuales mediocres. Siempre verificar la dirección de tendencia sobre 6-12 meses.
- **Complacencia con CLA**: Algunos CLAs transfieren copyright al propietario del proyecto, lo que significa que tus contribuciones se vuelven su activo propietario. Leer el texto del CLA, no solo el checkbox.
- **Anclar en un solo framework**: Sin frameworks de comparación, cualquier proyecto se ve genial o terrible. Siempre hacer benchmark contra al menos una alternativa, incluso informalmente.

## Habilidades Relacionadas

- [polish-claw-project](../polish-claw-project/SKILL.md) — flujo de trabajo de contribución que esta evaluación informa
- [review-software-architecture](../review-software-architecture/SKILL.md) — usado en el Paso 4 para evaluación de arquitectura
- [forage-solutions](../forage-solutions/SKILL.md) — descubrimiento de frameworks alternativos para comparación
- [search-prior-art](../search-prior-art/SKILL.md) — mapeo del panorama y análisis de trabajo previo
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — evaluación de postura de seguridad referenciada en el Paso 5
- [assess-ip-landscape](../assess-ip-landscape/SKILL.md) — análisis de licencia y riesgo de IP
