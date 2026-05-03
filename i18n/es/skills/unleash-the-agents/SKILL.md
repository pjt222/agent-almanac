---
name: unleash-the-agents
description: >
  Launch all available agents in parallel waves for open-ended hypothesis
  generation on problems where the correct domain is unknown. Use when facing
  a cross-domain problem with no clear starting point, when single-agent
  approaches have stalled, or when diverse perspectives are more valuable
  than deep expertise. Produces a ranked hypothesis set with convergence
  analysis and adversarial refinement.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent ToolSearch TeamCreate TaskCreate TaskUpdate TaskList SendMessage
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: swarm
  complexity: advanced
  language: multi
  tags: swarm, parallel, hypothesis-generation, multi-agent, brainstorming, convergence
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Unleash the Agents

Consultar todos los agentes disponibles en olas paralelas para generar hipótesis diversas para problemas abiertos. Cada agente razona a través de su lente de dominio único — un kabalist encuentra patrones vía gematría, un martial-artist propone branching condicional, un contemplative nota la estructura sentándose con los datos. La convergencia entre perspectivas independientes es la señal primaria de que una hipótesis tiene mérito.

## Cuándo Usar

- Enfrentar un problema cross-dominio donde el enfoque correcto es desconocido
- Un enfoque de un solo agente o un solo dominio se ha estancado o no ha producido señal
- El problema se beneficia de perspectivas genuinamente diversas (no solo más cómputo)
- Necesitas generación de hipótesis, no ejecución (usar equipos para ejecución)
- Decisiones de alto riesgo donde perder un ángulo no obvio carga costo real

## Entradas

- **Requerido**: Brief del problema — descripción clara del problema, 5+ ejemplos concretos y qué cuenta como solución
- **Requerido**: Método de verificación — cómo probar si una hipótesis es correcta (prueba programática, revisión por experto o comparación con modelo nulo)
- **Opcional**: Subconjunto de agentes — agentes específicos a incluir o excluir (predeterminado: todos los agentes registrados)
- **Opcional**: Tamaño de ola — número de agentes por ola (predeterminado: 10)
- **Opcional**: Formato de salida — plantilla estructurada para respuestas de agente (predeterminado: hipótesis + razonamiento + confianza + predicción comprobable)

## Procedimiento

### Paso 1: Preparar el Brief

Escribir un brief de problema que cualquier agente pueda entender independientemente de la experticia de dominio. Incluir:

1. **Declaración del problema**: Lo que estás tratando de descubrir o decidir (1-2 oraciones)
2. **Ejemplos**: Al menos 5 ejemplos concretos de input/output o puntos de datos (más es mejor — 3 es muy pocos para que la mayoría de los agentes encuentre patrones)
3. **Restricciones conocidas**: Lo que ya sabes, lo que ya se ha intentado
4. **Criterios de éxito**: Cómo reconocer una hipótesis correcta
5. **Plantilla de salida**: El formato exacto que quieres en las respuestas

```markdown
## Brief: [Problem Title]

**Problem**: [1-2 sentence statement]

**Examples**:
1. [Input] → [Output]  (explain what's known)
2. [Input] → [Output]
3. [Input] → [Output]
4. [Input] → [Output]
5. [Input] → [Output]

**Already tried**: [List failed approaches to avoid rediscovery]

**Success looks like**: [Testable criterion]

**Respond with**:
- Hypothesis: [Your proposed mechanism in one sentence]
- Reasoning: [Why your domain expertise suggests this]
- Confidence: [low/medium/high]
- Testable prediction: [If my hypothesis is correct, then X should be true]
```

**Esperado:** Un brief que es self-contained — un agente recibiendo solo este texto tiene todo lo necesario para razonar sobre el problema.

**En caso de fallo:** Si no puedes articular 5 ejemplos o un método de verificación, el problema no está listo para consulta multi-agente. Estrechar el alcance primero.

### Paso 2: Planificar las Olas

Listar todos los agentes disponibles y dividirlos en olas de ~10. El orden no importa para las primeras 2 olas; para olas subsiguientes, la inyección de conocimiento entre olas mejora los resultados.

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

Asignar agentes a olas. Planificar 4 olas inicialmente — puede que no necesites todas (ver early stopping en el Paso 4).

| Ola | Agentes | Variante de brief |
|------|--------|---------------|
| 1-2 | 20 agentes | Brief estándar |
| 3 | 10 agentes + advocatus-diaboli | Brief + consenso emergente + desafío adversarial |
| 4+ | 10 agentes cada una | Brief + "X está confirmado. Enfocarse en casos límite y fallos." |

**Esperado:** Una tabla de asignación de olas con todos los agentes asignados. Incluir `advocatus-diaboli` en la Ola 3 (no después) para que el pase adversarial informe a las olas subsiguientes.

**En caso de fallo:** Si menos de 20 agentes están disponibles, reducir a 2-3 olas. El patrón aún funciona con tan pocos como 10 agentes, aunque las señales de convergencia son más débiles.

### Paso 3: Lanzar Olas

Lanzar cada ola como agentes paralelos. Usar el modelo `sonnet` para eficiencia de costo (el valor viene de la diversidad de perspectivas, no de la profundidad individual).

#### Opción A: TeamCreate (recomendado para unleash completo)

Usar la herramienta `TeamCreate` de Claude Code para configurar un equipo coordinado con rastreo de tareas. TeamCreate es una herramienta diferida — primero hacer fetch vía `ToolSearch("select:TeamCreate")`.

1. Crear el equipo:
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. Crear una tarea por agente usando `TaskCreate` con el brief y encuadre específico de dominio
3. Generar cada agente como teammate usando la herramienta `Agent` con `team_name: "unleash-wave-1"` y `subagent_type` establecido al tipo del agente (p. ej., `kabalist`, `geometrist`)
4. Asignar tareas a teammates vía `TaskUpdate` con `owner`
5. Monitorear el progreso vía `TaskList` — los teammates marcan tareas como completadas conforme terminan
6. Entre olas, apagar el equipo actual vía `SendMessage({ type: "shutdown_request" })` y crear el siguiente equipo con el brief actualizado (Paso 4)

Esto te da coordinación built-in: una lista de tareas compartida rastrea qué agentes han respondido, los teammates pueden ser mensajeados para seguimiento, y el lead gestiona transiciones de ola a través de la asignación de tareas.

#### Opción B: Spawning crudo de Agent (más simple, para ejecuciones más pequeñas)

Para cada agente en la ola, generarlo con el brief y un encuadre específico de dominio:

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

Lanzar todos los agentes en una ola simultáneamente usando la herramienta Agent con `run_in_background: true`. Esperar que la ola se complete antes de lanzar la siguiente ola (para habilitar la inyección de conocimiento entre olas en el Paso 4).

#### Eligiendo entre opciones

| | TeamCreate | Raw Agent |
|---|---|---|
| Mejor para | Tier 3 unleash completo (40+ agentes) | Tier 2 panel (5-10 agentes) |
| Coordinación | Lista de tareas, mensajería, propiedad | Disparar-y-olvidar, recolección manual |
| Handoff entre olas | El estado de tareas se traslada | Debe rastrearse manualmente |
| Sobrecarga | Mayor (configuración de equipo por ola) | Menor (una sola llamada de herramienta por agente) |

**Esperado:** Cada ola retorna ~10 respuestas estructuradas dentro de 2-5 minutos. Los agentes que fallan en responder o retornan salida fuera de formato son anotados pero no bloquean el pipeline.

**En caso de fallo:** Si más del 50% de una ola falla, verificar la claridad del brief. Causa común: la plantilla de salida es ambigua, o los ejemplos son insuficientes para que agentes no-de-dominio razonen sobre.

### Paso 4: Inyectar Conocimiento Entre Olas (y Evaluar Early Stopping)

Después de las olas 1-2, extraer la señal emergente antes de lanzar la siguiente ola.

1. Escanear respuestas de olas completadas por temas recurrentes
2. Identificar la familia de hipótesis más común (la señal de convergencia)
3. **Verificar el umbral de early stopping**: si la familia top ya excede 3x la expectativa del modelo nulo después de 20 agentes, tienes señal fuerte. Planificar la Ola 3 como una ola adversarial + refinamiento y considerar detenerse después de ella
4. Actualizar el brief para la siguiente ola:

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**Guía de early stopping**: No todo unleash necesita todos los agentes. Para dominios de problema bien definidos (p. ej., análisis de base de código), la convergencia a menudo se estabiliza en 30-40 agentes. Para problemas abstractos o abiertos (p. ej., transformaciones matemáticas desconocidas), el roster completo añade valor porque el dominio correcto es genuinamente impredecible. Verificar la convergencia después de cada ola — si el conteo de la familia top y el ratio del modelo nulo se han estabilizado, las olas adicionales producen retornos decrecientes.

Esto previene el redescubrimiento (donde olas posteriores re-derivan independientemente lo que olas anteriores ya encontraron) y dirige a los agentes posteriores hacia los bordes del problema.

**Esperado:** Las olas posteriores producen hipótesis más matizadas y dirigidas que abordan brechas en el consenso emergente.

**En caso de fallo:** Si no aparece convergencia después de 2 olas, el problema puede ser demasiado no restringido. Considerar estrechar el alcance o proveer más ejemplos.

### Paso 5: Recolectar y Deduplicar

Después de que todas las olas se completen, reunir todas las respuestas en un único documento. Deduplicar agrupando hipótesis en familias:

1. Extraer todas las declaraciones de hipótesis
2. Agrupar por mecanismo (no por redacción — "modular arithmetic mod 94" y "cyclic group over Z_94" son la misma familia)
3. Contar descubrimientos independientes por familia
4. Clasificar por convergencia: las familias descubiertas por más agentes independientemente clasifican más alto

**Esperado:** Una lista clasificada de familias de hipótesis con conteos de convergencia, agentes contribuyentes y predicciones comprobables representativas.

**En caso de fallo:** Si cada hipótesis es única (sin convergencia), la relación señal-a-ruido es muy baja. O el problema necesita más ejemplos, o los agentes necesitan un formato de salida más ajustado.

### Paso 6: Verificar Contra Modelo Nulo

Probar la hipótesis top contra un modelo nulo para asegurar que la convergencia es significativa, no un artefacto de datos de entrenamiento compartidos.

- **Verificación programática**: Si la hipótesis produce una fórmula o algoritmo comprobable, ejecutarla contra ejemplos reservados
- **Modelo nulo**: Estimar la probabilidad de que N agentes converjan en la misma familia de hipótesis por azar (p. ej., si hay K familias de hipótesis razonables, la probabilidad de convergencia aleatoria es ~N/K)
- **Umbral**: La señal es significativa si la convergencia excede 3x la expectativa del modelo nulo

**Esperado:** La familia de hipótesis top significativamente excede la convergencia a nivel de azar y/o pasa la verificación programática.

**En caso de fallo:** Si la hipótesis top falla la verificación, verificar la familia clasificada en segundo lugar. Si ninguna familia pasa, el problema puede requerir un enfoque diferente (análisis más profundo de un solo experto, más datos o ejemplos reformulados).

### Paso 7: Refinamiento Adversarial

**Tiempo preferido: Ola 3, no post-síntesis.** Incluir `advocatus-diaboli` en la Ola 3 (junto con la inyección de conocimiento entre olas) es más efectivo que un pase adversarial standalone después de que todas las olas se completen. El desafío temprano deja a las Olas 4+ refinar contra la crítica en lugar de apilarse sobre un consenso no desafiado.

Si el pase adversarial ya fue parte de la Ola 3, este paso se vuelve una verificación final. Si no (p. ej., ejecutaste todas las olas sin él), generar `advocatus-diaboli` (o `senior-researcher`) ahora. Para un pase estructurado, usar `TeamCreate` para levantar un equipo de revisión con ambos agentes trabajando en paralelo contra el consenso:

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

**Esperado:** Un conjunto de contraargumentos, casos límite y un experimento de falsificación. Si la hipótesis sobrevive el escrutinio adversarial, está lista para integración. Un buen pase adversarial a veces *defiende parcialmente* el consenso — encontrando que el diseño es mejor que las alternativas incluso si imperfecto.

**En caso de fallo:** Si el agente adversarial encuentra una falla fatal, alimentar la crítica de vuelta en una ola de seguimiento dirigida (Tier 3+ modo iterativo — seleccionar 5-10 agentes mejor posicionados para abordar la crítica específica).

### Paso 8: Entregar a Equipos

Unleash encuentra problemas; los equipos los resuelven. Convertir las familias de hipótesis verificadas en issues accionables, luego ensamblar equipos enfocados para resolver cada uno.

1. Crear un issue de GitHub por familia de hipótesis verificada (usar la habilidad `create-github-issues`)
2. Priorizar issues por fuerza de convergencia e impacto
3. Para cada issue, ensamblar un equipo pequeño vía `TeamCreate`:
   - Si una definición de equipo predefinida en `teams/` coincide con el dominio del problema, usarla
   - Si no existe ningún equipo apropiado, predeterminar a `opaque-team` (N shapeshifters con asignación adaptiva de rol) — maneja formas de problema desconocidas sin requerir una composición personalizada
   - Incluir al menos un agente no-técnico (p. ej., `advocatus-diaboli`, `contemplative`) — atrapan riesgos de implementación que los agentes técnicos pierden
   - Usar checkpoints REST entre fases para prevenir apresurarse
4. El pipeline es: **unleash → triage → team-per-issue → resolve**

**Esperado:** Cada familia de hipótesis mapea a un issue rastreado con un equipo asignado. El unleash produjo el diagnóstico; los equipos producen el fix.

**En caso de fallo:** Si la composición del equipo no coincide con el problema, reasignar. Los agentes shapeshifter pueden investigar y diseñar pero carecen de herramientas de escritura — el lead del equipo debe aplicar sus sugerencias de código.

## Validación

- [ ] Todos los agentes disponibles fueron consultados (o un subconjunto deliberado fue elegido con justificación)
- [ ] Las respuestas fueron recolectadas en un formato estructurado y parseable
- [ ] Las hipótesis fueron deduplicadas y clasificadas por convergencia independiente
- [ ] La hipótesis top fue verificada contra un modelo nulo o prueba programática
- [ ] Un pase adversarial desafió el consenso
- [ ] La hipótesis final incluye predicciones comprobables y limitaciones conocidas

## Errores Comunes

- **Demasiado pocos ejemplos en el brief**: Los agentes necesitan 5+ ejemplos para encontrar patrones. Con 3 ejemplos, la mayoría de los agentes recurren a coincidencia de patrones de nivel superficial o eco de plantilla (repetir el brief con palabras diferentes).
- **Sin camino de verificación**: Sin una manera de probar hipótesis, no puedes distinguir señal de ruido. La convergencia sola es necesaria pero no suficiente.
- **Respuestas metafóricas**: Los agentes especialistas de dominio (mystic, shaman, kabalist) pueden responder con razonamiento metafórico rico que es difícil de parsear programáticamente. Incluir "Expresa tu hipótesis como una fórmula o algoritmo comprobable" en la plantilla de salida.
- **Redescubrimiento entre olas**: Sin inyección de conocimiento entre olas, las olas 3-7 redescubren independientemente lo que las olas 1-2 ya encontraron. Siempre actualizar el brief entre olas.
- **Sobre-interpretar la convergencia**: 43% de convergencia en una familia de mecanismo suena impresionante, pero verificar la tasa base. Si solo hay 3 familias plausibles de mecanismo, la convergencia aleatoria sería ~33%.
- **Esperar dominancia de una sola familia**: Los problemas abstractos (reconocimiento de patrones, criptografía) tienden a producir una familia dominante de hipótesis. Los problemas multi-dimensionales (análisis de base de código, diseño de sistema) producen convergencia más amplia entre múltiples familias válidas — esto es esperado y saludable, no un fallo del patrón.
- **Encuadre genérico para agentes no-técnicos**: La calidad de la contribución de un agente no-técnico depende de cómo el brief encuadra el problema en su lenguaje de dominio. "¿Qué dice tu tradición sobre sistemas en este umbral?" produce perspectiva estructural; un brief genérico no produce nada. Invertir en encuadre específico de dominio para agentes fuera del dominio natural del problema.
- **Usar esto para ejecución**: Este patrón genera hipótesis, no implementaciones. Una vez que tienes hipótesis verificadas, convertirlas a issues y entregar a equipos (Paso 8). El pipeline es unleash → triage → team-per-issue.

## Habilidades Relacionadas

- `forage-solutions` — optimización de colonias de hormigas para explorar espacios de solución (complementaria: alcance más estrecho, exploración más profunda)
- `build-coherence` — democracia de abejas para seleccionar entre enfoques competidores (usar después de esta habilidad para elegir entre hipótesis top)
- `coordinate-reasoning` — coordinación estigmérgica para gestionar el flujo de información entre agentes
- `coordinate-swarm` — patrones más amplios de coordinación de enjambre para sistemas distribuidos
- `expand-awareness` — percepción abierta antes de estrechar (complementaria: usar como preparación de agente individual)
- `meditate` — limpiar el ruido de contexto antes de lanzar (recomendado antes del Paso 1)
