---
name: prune-agent-memory
description: >
  Audita, clasifica y elimina selectivamente memorias almacenadas. Cubre la
  enumeración y clasificación de memorias por tipo/antigüedad/frecuencia de
  acceso, detección de obsolescencia para referencias desactualizadas,
  verificaciones de fidelidad mediante anclas externas, un árbol de decisión
  para la eliminación selectiva, reglas de filtrado preventivo sobre lo que
  nunca debe convertirse en memoria, y un registro de auditoría para que el
  olvido sea revisable. Usar cuando la memoria ha crecido y no ha sido curada,
  cuando el estado del proyecto ha cambiado significativamente desde que se
  escribieron las memorias, cuando la calidad de recuperación ha degradado,
  o como mantenimiento periódico junto con manage-memory.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, pruning, forgetting, retention-policy, maintenance, auto-memory
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Podar la Memoria del Agente

Audita, clasifica y elimina selectivamente memorias almacenadas. La memoria es infraestructura. El olvido es política. Esta habilidad define la política.

Donde `manage-memory` se centra en organizar y hacer crecer la memoria (qué conservar, cómo estructurarla), esta habilidad se centra en el proceso inverso: qué descartar, cómo detectar la degradación, y cómo garantizar que el olvido sea deliberado en lugar de accidental. Las dos habilidades son complementarias y deben usarse juntas durante el mantenimiento periódico.

## Cuándo Usar

- Los archivos de memoria han crecido y nadie los ha auditado para evaluar su relevancia
- El estado del proyecto ha cambiado significativamente (refactorizaciones mayores, repositorios renombrados, hitos completados) y las memorias probablemente referencian contexto desactualizado
- La calidad de recuperación ha degradado — las memorias están generando ruido en lugar de señal
- Tras un período de actividad intensa que generó muchas entradas de memoria sin curación
- Como tarea de mantenimiento programada (p.ej., cada 10-20 sesiones o en hitos del proyecto)
- Cuando múltiples entradas de memoria cubren el mismo tema con variaciones leves (deriva por duplicación)
- Antes de incorporar a un nuevo colaborador que heredará el contexto de memoria

## Entradas

- **Requerido**: Ruta al directorio de memoria (típicamente `~/.claude/projects/<project-path>/memory/`)
- **Opcional**: Sobrescrituras de política de retención (p.ej., "conservar todo sobre despliegue," "podar agresivamente las notas de depuración")
- **Opcional**: Cambios de estado del proyecto conocidos desde la última auditoría (p.ej., "el repositorio fue renombrado," "migrado de Jest a Vitest")
- **Opcional**: Registro de auditoría de podas anteriores para análisis de tendencias

## Procedimiento

### Paso 1: Enumerar y Clasificar Memorias

Leer todos los archivos de memoria y clasificar cada entrada en cuatro dimensiones.

```bash
# Inventariar el directorio de memoria
ls -la <memory-dir>/
wc -l <memory-dir>/*.md

# Contar entradas totales (aproximación contando viñetas y encabezados de nivel superior)
grep -c "^- \|^## " <memory-dir>/MEMORY.md
for f in <memory-dir>/*.md; do echo "$f: $(grep -c '^- \|^## ' "$f") entries"; done
```

Clasificar cada entrada de memoria en uno de estos tipos:

| Tipo | Descripción | Ejemplo | Retención por defecto |
|------|-------------|---------|----------------------|
| **Proyecto** | Hechos sobre la estructura del proyecto, arquitectura, convenciones | "skills/ tiene 310 archivos SKILL.md en 55 dominios" | Conservar hasta verificar que está obsoleta |
| **Decisión** | Elecciones tomadas y su justificación | "Se eligió hub-and-spoke sobre sequential para equipos de revisión porque..." | Conservar indefinidamente |
| **Patrón** | Soluciones de depuración, perspectivas de flujo de trabajo, comportamientos recurrentes | "El código de salida 5 significa error de comillas — usar archivos temporales" | Conservar hasta que sea superado |
| **Referencia** | Links, números de versión, recursos externos | "Docs de mcptools: https://..." | Conservar hasta verificar que está obsoleta |
| **Retroalimentación** | Preferencias del usuario, correcciones, orientación de estilo | "El usuario prefiere kebab-case para nombres de archivos" | Conservar indefinidamente |
| **Efímero** | Contexto específico de sesión que se filtró a la memoria persistente | "Actualmente trabajando en issue #42" | Eliminar inmediatamente |

Para cada entrada, también anotar:
- **Antigüedad**: ¿Cuándo fue escrita o actualizada por última vez?
- **Frecuencia de acceso**: ¿Ha sido útil esta entrada en sesiones recientes? (Estimar según la relevancia del tema con el trabajo reciente)

**Esperado:** Un inventario completo con cada entrada de memoria clasificada por tipo, con estimaciones de antigüedad y frecuencia de acceso. Las entradas efímeras ya están marcadas para eliminación inmediata.

**En caso de fallo:** Si los archivos de memoria son demasiado grandes o no estructurados para clasificar entrada por entrada, trabajar a nivel de sección. Clasificar secciones enteras en lugar de viñetas individuales. El objetivo es la cobertura, no la granularidad.

### Paso 2: Detectar Obsolescencia

Comparar las afirmaciones de memoria con el estado actual del proyecto. La obsolescencia es la forma más común de degradación de memoria.

Verificar estos patrones de obsolescencia:

1. **Deriva de conteos**: Conteos de archivos, habilidades, agentes, dominios, miembros del equipo que han cambiado
2. **Deriva de rutas**: Archivos, directorios o URLs que fueron movidos, renombrados o eliminados
3. **Deriva de estado**: Estados (issues resueltos, hitos completados, PRs cerrados) aún descritos como abiertos o en progreso
4. **Reversión de decisiones**: Decisiones que fueron anuladas posteriormente pero la justificación original permanece en memoria
5. **Deriva de herramientas/versiones**: Números de versión, firmas de API o nombres de herramientas que cambiaron (p.ej., renombrado de paquetes)

```bash
# Verificar conteos contra la fuente de verdad
grep -oP '\d+ skills' <memory-dir>/MEMORY.md
grep -c "^      - id:" skills/_registry.yml

# Verificar referencias a archivos que ya no existen
grep -oP '`[^`]+\.(md|yml|R|js|ts)`' <memory-dir>/MEMORY.md | sort -u | while read f; do
  path="${f//\`/}"
  [ ! -f "$path" ] && echo "STALE: $path referenced but not found"
done

# Verificar referencias a nombres/rutas antiguas
grep -i "old-name\|previous-name\|renamed-from" <memory-dir>/*.md
```

Marcar cada entrada obsoleta con el tipo de obsolescencia y el valor correcto actual.

**Esperado:** Una lista de entradas obsoletas con evidencia específica de lo que cambió. Cada entrada obsoleta tiene una acción recomendada: actualizar (si el valor correcto es conocido), verificar (si hay incertidumbre), o eliminar (si toda la entrada está obsoleta).

**En caso de fallo:** Si no se puede verificar una afirmación porque referencia estado externo (APIs, documentos de terceros, estado de despliegue), marcarla como `unverifiable` en lugar de asumir que es correcta. Las entradas no verificables son candidatas para eliminar si no son activamente útiles.

### Paso 3: Ejecutar Verificaciones de Fidelidad

Comprobar si las memorias aún producen contexto útil cuando se recuperan. Este es el paso más difícil porque un agente no puede verificar si sus propias memorias comprimidas son fieles — se necesitan anclas externas.

Métodos de verificación de fidelidad:

1. **Verificación de ida y vuelta**: Leer una entrada de memoria, luego verificar el estado actual del proyecto que describe. ¿La memoria lleva al archivo correcto, al patrón correcto, a la conclusión correcta?

2. **Detección de pérdida por compresión**: Comparar resúmenes de memoria con el material fuente original. Cuando una discusión de 50 líneas fue comprimida a una memoria de 2 líneas, ¿la compresión preservó la perspectiva accionable o solo la etiqueta del tema?

   ```bash
   # Encontrar la fuente de la que se derivó una entrada de memoria
   # (git log, PRs antiguos, archivos originales)
   git log --oneline --all --grep="<keyword from memory entry>" | head -5
   ```

3. **Escaneo de contradicciones**: Buscar memorias que se contradigan entre sí o que contradigan CLAUDE.md / la documentación del proyecto.

   ```bash
   # Buscar posibles contradicciones en conteos
   grep -n "total" <memory-dir>/MEMORY.md
   grep -n "total" CLAUDE.md
   # Comparar los valores — deben coincidir
   ```

4. **Prueba de utilidad**: Para cada entrada de memoria, preguntar: "Si esta entrada fuera eliminada, ¿algo saldría mal en las próximas 5 sesiones?" Si la respuesta es "probablemente no," la entrada tiene bajo valor de fidelidad independientemente de su precisión.

**Esperado:** Cada entrada de memoria tiene ahora una evaluación de fidelidad: **alta** (verificada como precisa y útil), **media** (probablemente precisa, ocasionalmente útil), **baja** (no verificada o raramente útil), o **fallida** (verificada como imprecisa o contradictoria).

**En caso de fallo:** Si las verificaciones de fidelidad son inconcluyentes para muchas entradas, concentrarse en las de mayor impacto potencial. Una memoria incorrecta sobre la arquitectura del proyecto es más peligrosa que una memoria incorrecta sobre un truco de depuración. Priorizar la verificación de hechos a nivel de esqueleto sobre los detalles de nivel de detalle.

### Paso 4: Aplicar Eliminación Selectiva

Usar este árbol de decisión para determinar qué podar, en orden de prioridad:

```
Árbol de Decisión de Poda (aplicar en orden):

1. Entradas EFÍMERAS (clasificación del Paso 1)
   → Eliminar inmediatamente. Estas nunca deberían haberse persistido.

2. Entradas de fidelidad FALLIDA (Paso 3)
   → Eliminar inmediatamente. Las memorias imprecisas son peores que ninguna memoria.

3. DUPLICADOS
   → Conservar la versión más completa/precisa, eliminar las demás.
   → Si los duplicados abarcan MEMORY.md y un archivo de tema, conservar la versión del archivo de tema.

4. Entradas OBSOLETAS con correcciones conocidas (Paso 2)
   → ACTUALIZAR si la entrada es útil en otros aspectos (cambiar el valor obsoleto por el actual).
   → ELIMINAR si toda la entrada está obsoleta (el tema ya no importa).

5. Entradas de baja fidelidad y baja frecuencia de acceso
   → Eliminar. Están ocupando espacio sin proporcionar valor.

6. Entradas de fidelidad MEDIA sobre trabajo completado/cerrado
   → Archivar o eliminar. Detalles de sprints pasados, incidentes resueltos, PRs fusionados.
   → Excepción: conservar si la resolución contiene un patrón reutilizable.

7. Entradas de REFERENCIA con fuentes disponibles libremente
   → Eliminar si la referencia está a una búsqueda en Google de distancia.
   → Conservar si la referencia es difícil de encontrar o tiene contexto específico del proyecto.
```

Para cada eliminación, registrar la entrada, su clasificación y el motivo de la eliminación (usado en el Paso 6).

**Esperado:** Una lista clara de entradas a eliminar, entradas a actualizar y entradas a conservar — cada una con un motivo documentado. La proporción conservar/eliminar depende del estado de salud de la memoria; una memoria bien mantenida podría podar un 5-10%, una descuidada podría podar un 30-50%.

**En caso de fallo:** Si el árbol de decisión produce resultados ambiguos para muchas entradas, aplicar un filtro más estricto: "¿Escribiría esta entrada hoy, sabiendo lo que sé ahora?" Si no, es candidata para eliminación. Errar hacia la poda — es más fácil reaprender un hecho que trabajar con una memoria incorrecta.

### Paso 5: Aplicar Filtros Preventivos

Definir reglas de "qué NO guardar" para prevenir la contaminación futura de la memoria. Revisar las memorias existentes para detectar patrones que deberían haberse filtrado al momento de escritura.

Patrones que **nunca** deben convertirse en memorias persistentes:

| Patrón | Por qué | Ejemplo |
|--------|---------|---------|
| Estado de tarea específico de sesión | Obsoleto en la próxima sesión | "Actualmente depurando el issue #42" |
| Razonamiento intermedio | No es una conclusión | "Probé el enfoque A, no funcionó porque..." |
| Salida de depuración / trazas de pila | Datos de diagnóstico efímeros | "El error fue: TypeError en línea 234..." |
| Secuencias exactas de comandos | Frágil, dependiente de la versión | "Ejecutar `npm install foo@3.2.1 && ...`" |
| Notas emocionales/tonales | No accionables | "El usuario parecía frustrado" |
| Duplicados de CLAUDE.md | Ya en el prompt del sistema | "El proyecto usa renv para dependencias" |
| Observaciones únicas no verificadas | Pueden ser incorrectas | "Creo que el límite de tasa de la API es 100/min" |

Si alguno de estos patrones se encuentra en la memoria existente, agregarlos a la lista de eliminación del Paso 4.

Documentar las reglas de filtro en MEMORY.md o en un archivo de tema `retention-policy.md` para que las sesiones futuras puedan consultarlas antes de escribir nuevas memorias.

**Esperado:** Un conjunto de reglas de filtro preventivo documentadas en el directorio de memoria. Cualquier entrada existente que coincida con estos patrones está marcada para eliminación.

**En caso de fallo:** Si documentar las reglas de filtro parece prematuro (la memoria es pequeña, la contaminación es mínima), omitir la documentación pero igualmente aplicar los filtros para detectar cualquier violación existente. Las reglas pueden formalizarse más adelante cuando el directorio de memoria sea más maduro.

### Paso 6: Escribir Registro de Auditoría

Registrar cada eliminación para que el olvido en sí sea revisable. Crear o actualizar un registro de poda.

```markdown
<!-- En <memory-dir>/pruning-log.md o añadido al final de MEMORY.md -->

## Pruning Log

### YYYY-MM-DD Audit
- **Entries audited**: N
- **Entries pruned**: M (X%)
- **Entries updated**: K
- **Staleness found**: [list of stale patterns detected]
- **Fidelity failures**: [list of entries that failed verification]

#### Deletions
| Entry (summary) | Type | Reason |
|-----------------|------|--------|
| "Currently working on issue #42" | Ephemeral | Session-specific, stale |
| "skills/ has 280 SKILL.md files" | Project | Count drift: actual is 310 |
| "Use acquaint::mcp_session()" | Pattern | Package renamed to mcptools |
```

Mantener el registro de poda conciso. Existe para la rendición de cuentas, no para la arqueología. Si el registro en sí crece mucho, resumir las entradas más antiguas: "2025: 3 auditorías, 47 entradas totales podadas (principalmente deriva de conteos y filtraciones efímeras)."

**Esperado:** Una entrada de registro de poda con marca de tiempo que documenta qué fue eliminado y por qué. El registro se almacena en el directorio de memoria junto con las memorias mismas.

**En caso de fallo:** Si crear un archivo de registro separado parece excesivo (solo 1-2 entradas podadas), agregar una nota breve a MEMORY.md en su lugar: `<!-- Last pruned: YYYY-MM-DD, removed 2 stale entries -->`. Cualquier registro es mejor que la eliminación silenciosa.

### Paso 7: Designar Memorias Protegidas

Ciertas entradas de memoria deben ser inmunes a la poda independientemente de su antigüedad, frecuencia de acceso o puntuación de fidelidad. Estas representan contexto irremplazable que, si se perdiera, requeriría un esfuerzo significativo para reconstruirse.

**Criterios de memoria protegida:**

| Categoría | Ejemplos | Por qué está protegida |
|-----------|----------|----------------------|
| Decisiones de arquitectura | "Se eligió directorio de habilidades plano en lugar de anidado" | La justificación se pierde si se rederiva más tarde |
| Preferencias de identidad del usuario | "Siempre usar kebab-case," "Nunca auto-confirmar" | Intención explícita del usuario, no inferible |
| Resultados de auditoría de seguridad | "Última auditoría: 2025-12-13 — APROBADA" | Evidencia de cumplimiento con marcas de tiempo |
| Registros de renombrado/migración | "Repositorio renombrado: X a Y en fecha Z" | La integridad de las referencias cruzadas depende de esto |

**Método de designación:** Marcar entradas protegidas con `<!-- PROTECTED -->` en línea o mantener una lista `protected` en el registro de poda. El árbol de decisión del Paso 4 debe verificar el estado de protección antes de aplicar cualquier regla de eliminación.

**Eliminación de protección:** Para podar una entrada protegida, eliminar primero la designación explícitamente y documentar el motivo en el registro de poda. Este proceso de dos pasos previene la eliminación accidental de memorias de alto valor.

**Esperado:** Las entradas protegidas sobreviven todos los pases de poda. El registro de poda registra cualquier adición o eliminación de protección.

**En caso de fallo:** Si el conjunto protegido crece demasiado (>30% del total de entradas), revisar los criterios — la protección es para contexto irremplazable, no para entradas "importantes". Los hechos importantes pero reconstruibles deben permanecer sujetos a la poda normal.

### Paso 8: Re-Sintetizar Después de la Poda

Después de la eliminación, las memorias restantes pueden estar fragmentadas — las referencias cruzadas apuntan a entradas eliminadas, los archivos de tema pierden coherencia y MEMORY.md puede tener lagunas. La re-síntesis restaura la integridad estructural.

**Lista de verificación de re-síntesis:**

1. **Resolver referencias rotas**: Escanear las entradas restantes en busca de links a contenido eliminado. Eliminar o redirigir la referencia.
2. **Fusionar fragmentos relacionados**: Si la poda dejó dos entradas que cubren aspectos superpuestos del mismo tema, fusionarlas en una entrada coherente.
3. **Actualizar la estructura de archivos de tema**: Si un archivo de tema perdió >50% de su contenido, considerar incorporar el resto de vuelta a MEMORY.md y eliminar el archivo de tema.
4. **Clasificar memorias frías**: Revisar las entradas que sobrevivieron la poda pero no han sido accedidas recientemente:
   - **Frías por desuso**: El tema se alinea con los objetivos activos del proyecto pero la fase específica que las generó ha pasado. Retener — puede volver a ser relevante cuando esa fase se reanude (p.ej., notas de envío a CRAN durante el desarrollo activo).
   - **Frías por irrelevancia**: El tema siempre fue marginal — un experimento puntual, una investigación tangencial, o un enfoque superado. Marcar para eliminación en el próximo ciclo de poda.
5. **Verificar la coherencia de MEMORY.md**: Leer MEMORY.md de principio a fin. Debe contar una historia coherente sobre el proyecto, no leerse como una colección aleatoria de hechos.

**Esperado:** La memoria post-poda es estructuralmente sólida — sin referencias huérfanas, sin fragmentos redundantes, sin archivos de tema incoherentes. Las entradas frías están clasificadas para futuras decisiones de poda.

**En caso de fallo:** Si la re-síntesis revela que la poda fue demasiado agresiva (se perdió contexto crítico), verificar el registro de poda y reconstruir a partir del rastro de auditoría. Por eso existe el rastro de auditoría.

### Paso 9: Recuperarse de la Deriva de Memoria

La deriva de memoria ocurre cuando los hechos almacenados se vuelven silenciosamente incorrectos — no porque siempre estuvieran mal, sino porque la realidad subyacente cambió y la memoria no fue actualizada. La recuperación de la deriva intenta corregir las memorias en su lugar en lugar de podarlas.

**Desencadenantes de detección de deriva:**

- Una afirmación de memoria contradice la salida actual de herramientas o el contenido de archivos
- Un conteo o número de versión en memoria no coincide con el registro o el archivo de bloqueo
- Una ruta en memoria devuelve "archivo no encontrado"
- Una memoria sobre una dependencia referencia un paquete renombrado o desaprobado

**Procedimiento de recuperación:**

1. **Identificar la deriva**: Comparar la afirmación de memoria con la verdad actual del proyecto (git log, registro, archivos reales)
2. **Evaluar la recuperabilidad**: ¿Puede el valor correcto determinarse a partir del estado actual del proyecto?
   - Sí → Actualizar la entrada de memoria en su lugar con el valor actual y una anotación `[corrected YYYY-MM-DD]`
   - No → Marcar la entrada como `unverifiable` y señalarla para poda
3. **Rastrear la causa**: ¿Fue esta una deriva gradual (el conteo divergió lentamente) o un evento discreto (renombrado, migración)? Los eventos discretos a menudo afectan múltiples entradas — escanear en busca de entradas hermanas.
4. **Prevenir la recurrencia**: Si la deriva afecta un valor que cambia frecuentemente (conteos, versiones), considerar si la memoria debería rastrear el valor en absoluto o en su lugar referenciar la fuente de verdad: "Ver skills/_registry.yml para el conteo actual" en lugar de "317 habilidades."

**Esperado:** Las memorias con deriva se corrigen en su lugar donde sea posible, preservando el contexto. Las entradas que no pueden corregirse están marcadas para poda. Las reglas de prevención reducen la deriva futura.

**En caso de fallo:** Si la deriva es generalizada (>20% de las entradas), la memoria puede necesitar una reconstrucción completa en lugar de corrección incremental. En ese caso, archivar el directorio de memoria actual, comenzar de nuevo y reimportar selectivamente las entradas que pasen la verificación.

## Validación

- [ ] Todos los archivos de memoria fueron inventariados y las entradas clasificadas por tipo
- [ ] Se ejecutaron verificaciones de obsolescencia contra el estado actual del proyecto
- [ ] Se aplicó al menos un método de verificación de fidelidad (ida y vuelta, pérdida por compresión, escaneo de contradicciones, o prueba de utilidad)
- [ ] Las decisiones de eliminación siguen el orden de prioridad en el árbol de decisión
- [ ] Ninguna entrada fue eliminada sin un motivo documentado
- [ ] Las reglas de filtro preventivo están documentadas o aplicadas
- [ ] El registro de poda registra qué fue eliminado, cuándo y por qué
- [ ] MEMORY.md permanece bajo 200 líneas después de la poda
- [ ] Las memorias restantes son precisas (verificadas con muestreo contra el estado del proyecto)
- [ ] Ningún archivo de tema huérfano fue creado al podar referencias de MEMORY.md
- [ ] Las entradas protegidas están designadas y sobreviven todos los pases de poda
- [ ] La re-síntesis post-poda resuelve referencias cruzadas rotas y fusiona fragmentos
- [ ] Las entradas frías están clasificadas como desuso vs. irrelevancia para futuras decisiones de poda
- [ ] Las entradas con deriva se corrigen en su lugar donde sea posible, no solo eliminadas

## Errores Comunes

- **Podar sin verificación**: Eliminar entradas porque "parecen viejas" sin comprobar si aún son precisas y útiles. La antigüedad por sí sola no es un criterio de eliminación — algunas de las memorias más valiosas son decisiones arquitectónicas antiguas que siguen siendo verdaderas.
- **Auto-verificación de fidelidad**: Un agente leyendo su propia memoria comprimida y concluyendo "sí, esto parece correcto" no es una verificación de fidelidad. La fidelidad requiere anclas externas: archivos del proyecto, historial de git, conteos del registro, salida real de herramientas. Sin anclas, se está verificando consistencia, no precisión.
- **Poda agresiva sin rastro de auditoría**: Eliminar entradas sin registrar qué fue eliminado. Cuando una sesión futura necesita un hecho que fue podado, el rastro de auditoría explica qué ocurrió y puede contener suficiente contexto para reconstruir la memoria.
- **Decisiones de poda como memorias**: No escribir "Decidí podar X porque Y" como una entrada de memoria regular. Eso va solo en el registro de poda. Las entradas de memoria sobre la gestión de memoria son meta-contaminación.
- **Ignorar los filtros preventivos**: Podar las entradas existentes pero no establecer reglas para evitar que los mismos patrones se repitan. Sin filtros, las próximas 10 sesiones recrearán las mismas entradas efímeras que acaba de eliminar.
- **Tratar todos los tipos por igual**: Las memorias de decisión y las memorias de retroalimentación casi nunca deben podarse — representan la intención y la justificación del usuario. Las memorias de proyecto y de referencia son los principales objetivos de poda porque rastrean el estado que cambia.
- **Confundir compresión con corrupción**: Una memoria que resume un tema complejo en una línea está comprimida, no corrompida. Solo marcarla como fallo de fidelidad si la compresión perdió la perspectiva accionable, no meramente el detalle.
- **Sobre-proteger**: Marcar demasiadas entradas como protegidas derrota el propósito de la poda. Si >30% de las entradas están protegidas, los criterios son demasiado laxos. Proteger el contexto irremplazable, no meramente los hechos importantes.
- **Bucles de re-síntesis**: Fusionar fragmentos durante la re-síntesis puede crear nuevas entradas que a su vez necesiten poda en el próximo ciclo. Mantener las fusiones mínimas — combinar solo las entradas que claramente cubren el mismo tema. No sintetizar nuevas perspectivas durante un pase de poda.

## Habilidades Relacionadas

- `manage-memory` — la habilidad complementaria para organizar y hacer crecer la memoria; usar juntas para un mantenimiento completo de la memoria
- `meditate` — limpieza y fundamentación que puede revelar qué memorias están creando ruido
- `rest` — a veces el mejor mantenimiento de memoria es no hacer mantenimiento de memoria
- `assess-context` — evaluar el estado de salud del contexto de razonamiento, que la calidad de la memoria afecta directamente
