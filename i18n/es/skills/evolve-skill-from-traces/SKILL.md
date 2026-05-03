---
name: evolve-skill-from-traces
description: >
  Evolve SKILL.md files from agent execution traces using a three-stage pipeline:
  trajectory collection from observed runs, parallel multi-agent patch proposal
  for error and success analysis, and conflict-free consolidation of overlapping
  edits via prevalence-weighting. Based on the Trace2Skill methodology.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: meta, skill-evolution, traces, multi-agent, consolidation, trace2skill
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Evolve a Skill from Execution Traces

Transformar trazas crudas de ejecución de agentes en un SKILL.md validado a través de un pipeline de tres etapas: recolección de trayectorias, propuesta de parches multi-agente paralela y consolidación libre de conflictos. Esta habilidad cierra la brecha entre el comportamiento observado del agente y los procedimientos documentados, convirtiendo ejecuciones exitosas en habilidades reproducibles.

## Cuándo Usar

- Las trazas de ejecución revelan patrones recurrentes no capturados en habilidades existentes
- El comportamiento observado del agente supera al procedimiento documentado
- Construir habilidades desde cero grabando demostraciones de expertos
- Múltiples agentes proponen mejoras conflictivas a la misma habilidad

## Entradas

- **Requerido**: `traces` -- conjunto de logs de ejecución de agentes o transcripciones de sesión (mínimo 10 ejecuciones exitosas recomendadas)
- **Requerido**: `target_skill` -- ruta a un SKILL.md existente para evolucionar, o `"new"` para extracción de habilidad desde cero
- **Opcional**: `analyst_count` -- número de agentes analistas paralelos a generar (predeterminado: 4)
- **Opcional**: `held_out_ratio` -- fracción de trazas reservadas para validación, no usadas en el borrador (predeterminado: 0.2)

## Procedimiento

### Paso 1: Recolectar Trazas de Ejecución

Reunir logs de sesión de agente, secuencias de llamadas a herramientas o transcripciones de conversación que demuestren el comportamiento objetivo. Filtrar por ejecuciones etiquetadas como exitosas. Normalizar a un formato de traza estándar: una secuencia de tripletes (estado, acción, resultado) con timestamps.

1. Identificar la fuente de trazas: logs de sesión, historial de llamadas a herramientas o exportaciones de conversación
2. Filtrar trazas por criterios de éxito (código de salida 0, flag de tarea completada, confirmación del usuario)
3. Normalizar cada traza en una lista de tripletes estructurados:

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. Particionar trazas: reservar `held_out_ratio` (predeterminado 20%) para validación en el Paso 7, usar el resto para los Pasos 2-6

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

**Esperado:** Un conjunto de trazas normalizado particionado en subconjuntos de borrador (80%) y reservado (20%). Cada entrada de traza contiene campos state, action, outcome y timestamp.

**En caso de fallo:** Si hay menos de 10 trazas exitosas disponibles, recolectar más antes de proceder. Conjuntos pequeños de trazas producen habilidades sobreajustadas que fallan en entradas novedosas. Si las trazas carecen de timestamps, asignar números de secuencia ordinales en su lugar.

### Paso 2: Agrupar Trayectorias

Agrupar trazas normalizadas por patrón de resultado. Identificar el núcleo invariante (pasos presentes en todas las trayectorias exitosas) versus las ramas variantes (pasos que difieren entre ejecuciones). El núcleo invariante se convierte en el esqueleto del procedimiento de la habilidad.

1. Alinear trazas por tipo de acción -- mapear cada traza a una secuencia de etiquetas de acción
2. Encontrar la subsecuencia común más larga entre todas las trazas para identificar el núcleo invariante
3. Clasificar las acciones restantes como ramas variantes, anotando qué trazas las incluyen y bajo qué condiciones
4. Registrar la frecuencia de la rama: qué porcentaje de trazas exitosas incluyen cada paso variante

```
invariant_core:
  - action: "read_input_file"
    frequency: 100%
  - action: "validate_schema"
    frequency: 100%
  - action: "transform_data"
    frequency: 100%

variant_branches:
  - action: "retry_on_timeout"
    frequency: 35%
    condition: "network latency > 2s"
  - action: "fallback_to_cache"
    frequency: 15%
    condition: "API returns 503"
```

**Esperado:** Una separación clara entre acciones del núcleo invariante (presentes en todas las trazas exitosas) y ramas variantes (condicionales, presentes en un subconjunto). Cada rama variante tiene un conteo de frecuencia y condición de disparo.

**En caso de fallo:** Si no emerge ningún núcleo invariante (las trazas son demasiado heterogéneas), el comportamiento objetivo puede ser realmente múltiples habilidades distintas. Dividir las trazas en subgrupos coherentes por tipo de resultado y procesar cada grupo por separado.

### Paso 3: Crear Esqueleto de la Habilidad

Desde el núcleo invariante, generar un SKILL.md inicial con frontmatter, When to Use (derivado de las condiciones de entrada en todas las trazas), Inputs (parámetros que variaron entre ejecuciones), y una sección Procedure con un paso por acción invariante.

1. Extraer condiciones de entrada del primer estado de cada traza para poblar When to Use
2. Identificar parámetros que variaron entre ejecuciones (rutas de archivo, umbrales, opciones) para poblar Inputs
3. Crear un paso de procedimiento por cada acción del núcleo invariante, usando la fraseología más común entre trazas
4. Añadir bloques placeholder Expected/On failure basados en resultados observados

```bash
# Scaffold the skeleton if creating a new skill
mkdir -p skills/<skill-name>/
```

```markdown
# Skeleton structure
## When to Use
- <derived from common entry conditions>

## Inputs
- **Required**: <parameters present in all traces>
- **Optional**: <parameters present in some traces>

## Procedure
### Step N: <invariant action label>
<most common implementation from traces>

**Expected:** <most common success outcome>
**On failure:** <placeholder -- refined in Steps 4-6>
```

**Esperado:** Un esqueleto de SKILL.md sintácticamente válido con frontmatter, When to Use, Inputs y una sección Procedure conteniendo un paso por cada acción del núcleo invariante. Los bloques Expected reflejan resultados observados; los bloques On failure son placeholders.

**En caso de fallo:** Si el esqueleto excede 500 líneas antes de añadir ramas variantes, el núcleo invariante es demasiado granular. Fusionar acciones adyacentes que siempre ocurren juntas en pasos únicos. Apuntar a 5-10 pasos de procedimiento.

### Paso 4: Propuesta de Parches Multi-Agente Paralela

Generar N agentes analistas (recomendado 4-6), cada uno revisando el conjunto completo de trazas contra el esqueleto borrador desde una lente analítica diferente. Cada agente produce un parche estructurado: sección, texto antiguo, texto nuevo, justificación.

Asignar una lente por analista:

| Analista | Lente | Enfoque |
|---------|------|-------|
| 1 | Correctitud | ¿El esqueleto captura todos los caminos de éxito? ¿Faltan pasos invariantes? |
| 2 | Eficiencia | ¿Hay pasos redundantes? ¿Se pueden fusionar o paralelizar pasos? |
| 3 | Robustez | ¿Qué modos de fallo no están manejados? ¿Qué deben contener los bloques On failure? |
| 4 | Casos Límite | ¿Qué ramas variantes deberían volverse pasos condicionales o pitfalls? |
| 5 (opcional) | Claridad | ¿Es cada paso inequívoco? ¿Puede un agente seguirlo mecánicamente? |
| 6 (opcional) | Generalizabilidad | ¿Hay artefactos específicos de traza que deberían abstraerse? |

Cada agente analista recibe:
- El esqueleto borrador del Paso 3
- El conjunto completo de trazas de borrador (no las reservadas)
- Su lente asignada y preguntas de enfoque

Cada analista retorna una lista de parches estructurados:

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

**Esperado:** Cada analista retorna 3-10 parches estructurados con referencias de sección, texto antiguo/nuevo, justificación e IDs de trazas de soporte. Todos los parches son recolectados en un conjunto único de parches.

**En caso de fallo:** Si un analista no retorna parches, su lente puede no aplicar a esta habilidad. Esto es aceptable -- no toda lente revela problemas. Si un analista retorna parches vagos sin referencias de trazas, rechazar y re-promptear con el requisito de supporting_traces concretos.

### Paso 5: Detectar y Clasificar Conflictos

Comparar todos los parches del Paso 4 para ediciones solapadas. Clasificar cada par de parches solapados en una de tres categorías.

1. Indexar parches por sección objetivo
2. Para parches que apuntan a la misma sección, comparar old_text y new_text
3. Clasificar cada solapamiento:

| Tipo de Conflicto | Definición | Resolución |
|---------------|-----------|------------|
| Compatible | Diferentes secciones, sin solapamiento | Fusionar directamente |
| Complementario | Misma sección, aditivo (ambos añaden contenido, sin contradicción) | Combinar texto |
| Contradictorio | Misma sección, mutuamente excluyentes (uno añade X, otro elimina X o añade Y en su lugar) | Necesita resolución en el Paso 6 |

```
conflict_report:
  total_patches: 24
  compatible: 18
  complementary: 4
  contradictory: 2
  contradictions:
    - section: "Procedure > Step 5"
      patch_a: {analyst: "efficiency", action: "remove step"}
      patch_b: {analyst: "robustness", action: "add retry logic"}
      supporting_traces_a: [2, 8, 11]
      supporting_traces_b: [4, 7, 12, 15]
```

**Esperado:** Un reporte de conflicto listando todos los pares de parches, su clasificación, y para contradicciones, los conteos de trazas de soporte para cada lado.

**En caso de fallo:** Si la clasificación es ambigua (un parche tanto añade como modifica texto en la misma sección), dividirlo en dos parches: uno aditivo, uno modificador. Re-clasificar los parches más pequeños.

### Paso 6: Consolidar Parches

Fusionar todos los parches en un único SKILL.md consolidado usando una estrategia de resolución de tres niveles.

1. **Parches compatibles**: Aplicar directamente -- estos tocan diferentes secciones y no pueden conflictuar
2. **Parches complementarios**: Combinar el new_text de ambos parches en un solo bloque coherente, preservando ambas contribuciones
3. **Parches contradictorios**: Resolver usando ponderación por prevalencia:
   - Contar cuántas trazas soportan cada variante
   - Preferir el parche alineado con más trazas
   - Si está empatado (o dentro del 10% el uno del otro), usar la habilidad `argumentation` para evaluar qué parche sirve mejor al propósito declarado de la habilidad
   - Documentar la alternativa rechazada como un Common Pitfall o una nota en el bloque On failure relevante

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

Después de consolidar, verificar el SKILL.md resultante:
- Todas las secciones están presentes (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- Cada paso del procedimiento tiene Expected y On failure
- No quedan instrucciones duplicadas o contradictorias
- El conteo de líneas está dentro del límite de 500 líneas

**Esperado:** Un único SKILL.md consolidado incorporando parches de todos los analistas. Las contradicciones se resuelven con justificación documentada. La alternativa rechazada para cada contradicción aparece como un pitfall o nota.

**En caso de fallo:** Si la consolidación produce un documento internamente inconsistente (p. ej., el Paso 3 asume que un archivo existe pero el Paso 2 fue eliminado por un parche de eficiencia), revertir la edición conflictiva y mantener el texto original del esqueleto para esa sección. Marcar la inconsistencia para revisión manual.

### Paso 7: Validar y Registrar

Ejecutar la habilidad consolidada mentalmente contra trazas reservadas (el 20% reservado en el Paso 1). Verificar que los bloques Expected/On failure coinciden con los resultados observados en trazas que la habilidad nunca ha visto.

1. Para cada traza reservada, recorrer el procedimiento de la habilidad paso a paso
2. En cada paso, comparar el resultado Expected de la habilidad contra el resultado real de la traza
3. Registrar coincidencias y desajustes:

```
validation_results:
  held_out_traces: 5
  full_match: 4
  partial_match: 1
  no_match: 0
  mismatches:
    - trace_id: 23
      step: 4
      expected: "API returns 200"
      actual: "API returns 429 (rate limited)"
      action: "Add rate-limit handling to On failure block"
```

4. Si la tasa de desajuste excede 20%, volver al Paso 4 con las trazas desajustadas añadidas al conjunto de borrador
5. Si la habilidad es nueva, seguir `create-skill` para creación de directorio, entrada de registry y configuración de symlink
6. Si se está evolucionando una habilidad existente, seguir `evolve-skill` para incremento de versión y sincronización de traducciones

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

**Esperado:** Al menos el 80% de las trazas reservadas coinciden con el procedimiento de la habilidad de extremo a extremo. La habilidad está registrada en `skills/_registry.yml` con metadatos correctos.

**En caso de fallo:** Si la validación falla (>20% desajuste), la habilidad ha sobreajustado a las trazas de borrador. Añadir las trazas desajustadas al conjunto de borrador y re-ejecutar desde el Paso 2. Si la validación sigue fallando después de dos iteraciones, el comportamiento puede ser demasiado variable para una sola habilidad -- considerar dividir en múltiples habilidades por tipo de resultado.

## Validación

- [ ] Se recolectaron al menos 10 trazas exitosas antes del borrador
- [ ] Las trazas se particionan en subconjuntos de borrador (80%) y reservadas (20%)
- [ ] El núcleo invariante y las ramas variantes están explícitamente documentadas
- [ ] Al menos 4 agentes analistas revisaron el esqueleto desde lentes distintas
- [ ] Todos los conflictos de parches están clasificados (compatible, complementario, contradictorio)
- [ ] Los parches contradictorios se resuelven con justificación documentada
- [ ] El SKILL.md consolidado tiene todas las secciones requeridas con pares Expected/On failure
- [ ] La validación con reservadas alcanza al menos 80% de tasa de coincidencia
- [ ] El conteo de líneas está dentro del límite de 500 líneas
- [ ] La habilidad se registra (nueva) o se incrementa la versión (existente) según los procedimientos estándar

## Errores Comunes

- **Demasiado pocas trazas**: Con menos de 10 ejecuciones exitosas, la extracción de patrones no es confiable. El núcleo invariante puede incluir pasos accidentales, y las ramas variantes carecerán de datos suficientes de frecuencia. Recolectar más trazas antes de comenzar.
- **Sobreajuste a artefactos de traza**: Comportamientos específicos de herramienta (p. ej., el patrón de retry de un cliente API en particular) pueden no generalizar. Durante el Paso 3, abstraer acciones específicas de herramienta en descripciones agnósticas de herramienta. La habilidad debe describir *qué* hacer, no *qué herramienta* usar.
- **Ignorar trazas de fallo**: Las trazas de fallo revelan sobre qué debe advertir la habilidad en los bloques On failure. Durante el Paso 1, también recolectar ejecuciones fallidas y etiquetarlas. Usarlas en el Paso 4 cuando el analista de robustez evalúa modos de fallo no manejados.
- **Análisis de lente única**: Usar solo 1-2 analistas pierde perspectivas importantes. Un analista de eficiencia solo despojará verificaciones de seguridad que un analista de robustez preservaría. Usar al menos 4 lentes distintas para cobertura balanceada.
- **Fusionar parches contradictorios sin resolución**: Aplicar ambos lados de una contradicción produce una habilidad internamente inconsistente (p. ej., "haz X" en un paso y "salta X" en otro). Siempre clasificar y resolver contradicciones explícitamente en el Paso 6.
- **No validar contra trazas reservadas**: Sin validación reservada, la habilidad consolidada puede ajustarse perfectamente a las trazas de borrador pero fallar en ejecuciones novedosas. Siempre reservar 20% de trazas y probar la habilidad final contra ellas.

## Habilidades Relacionadas

- `evolve-skill` -- evolución dirigida por humano más simple (complementaria: usar cuando las trazas no están disponibles)
- `create-skill` -- para habilidades recién extraídas que aún no existen; usado en el Paso 7 para registro
- `review-skill-format` -- validación después de la consolidación para asegurar cumplimiento con agentskills.io
- `argumentation` -- usado en el Paso 6 para resolver parches contradictorios cuando la prevalencia está empatada
- `verify-agent-output` -- rastros de evidencia para propuestas de parches; valida salidas de analistas en el Paso 4
