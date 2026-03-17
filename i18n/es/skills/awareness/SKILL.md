---
name: awareness
description: >
  AI situational awareness — internal threat detection for hallucination risk,
  scope creep, and context degradation. Maps Cooper color codes to reasoning
  states and OODA loop to real-time decisions. Use during any task where
  reasoning quality matters, when operating in unfamiliar territory, after
  detecting early warning signs such as an uncertain fact or suspicious tool
  result, or before high-stakes output like irreversible changes or architectural
  decisions.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: advanced
  language: natural
  tags: defensive, awareness, threat-detection, hallucination-risk, ooda, meta-cognition, ai-self-application
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Awareness

Mantener consciencia situacional continua de la calidad del razonamiento interno — detectando riesgo de alucinación, desviación de alcance, degradación de contexto y desajuste entre confianza y precisión en tiempo real usando códigos de color Cooper adaptados y toma de decisiones con bucle OODA.

## Cuándo Usar

- Durante cualquier tarea donde la calidad del razonamiento importa (que es la mayoría de las tareas)
- Al operar en territorio desconocido (nueva base de código, dominio no familiar, solicitud compleja)
- Después de detectar señales de alerta temprana: un dato que se siente incierto, un resultado de herramienta que parece incorrecto, una sensación creciente de confusión
- Como proceso continuo en segundo plano durante sesiones de trabajo extendidas
- Cuando `center` o `heal` ha revelado deriva pero no se han identificado amenazas específicas
- Antes de producir salidas de alto impacto (cambios irreversibles, comunicación orientada al usuario, decisiones arquitectónicas)

## Entradas

- **Requerido**: Contexto de tarea activa (disponible implícitamente)
- **Opcional**: Preocupación específica que desencadena consciencia elevada (ej., "No estoy seguro de que esta API exista")
- **Opcional**: Tipo de tarea para selección de perfil de amenazas (ver Paso 5)

## Procedimiento

### Paso 1: Establecer Códigos de Color Cooper para IA

Calibrar el nivel de consciencia actual usando una versión adaptada del sistema de códigos de color de Cooper.

```
AI Cooper Color Codes:
┌──────────┬─────────────────────┬──────────────────────────────────────────┐
│ Code     │ State               │ AI Application                           │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ White    │ Autopilot           │ Generating output without monitoring     │
│          │                     │ quality. No self-checking. Relying       │
│          │                     │ entirely on pattern completion.          │
│          │                     │ DANGEROUS — hallucination risk highest   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Yellow   │ Relaxed alert       │ DEFAULT STATE. Monitoring output for     │
│          │                     │ accuracy. Checking facts against context.│
│          │                     │ Noticing when confidence exceeds         │
│          │                     │ evidence. Sustainable indefinitely       │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Orange   │ Specific risk       │ A specific threat identified: uncertain  │
│          │ identified          │ fact, possible hallucination, scope      │
│          │                     │ drift, context staleness. Forming        │
│          │                     │ contingency: "If this is wrong, I        │
│          │                     │ will..."                                 │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Red      │ Risk materialized   │ The threat from Orange has materialized: │
│          │                     │ confirmed error, user correction, tool   │
│          │                     │ contradiction. Execute the contingency.  │
│          │                     │ No hesitation — the plan was made in     │
│          │                     │ Orange                                   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Black    │ Cascading failures  │ Multiple simultaneous failures, lost     │
│          │                     │ context, fundamental confusion about     │
│          │                     │ what the task even is. STOP. Ground      │
│          │                     │ using `center`, then rebuild from user's │
│          │                     │ original request                         │
└──────────┴─────────────────────┴──────────────────────────────────────────┘
```

Identificar el código de color actual. Si la respuesta es Blanco (sin monitoreo), la práctica de consciencia ya ha tenido éxito al revelar la brecha.

**Esperado:** Autoevaluación precisa del nivel de consciencia actual. Amarillo es la meta durante el trabajo normal. Blanco debería ser raro y breve. Naranja extendido es insostenible — confirmar o descartar la preocupación.

**En caso de fallo:** Si la evaluación del código de color misma se siente como si se hiciera en piloto automático (cumpliendo con la forma), eso es Blanco disfrazado de Amarillo. Amarillo genuino implica verificar activamente la salida contra la evidencia, no solo afirmar que se está haciendo.

### Paso 2: Detectar Indicadores Internos de Amenaza

Escanear sistemáticamente los indicadores específicos que preceden a fallos comunes de razonamiento de IA.

```
Threat Indicator Detection:
┌───────────────────────────┬──────────────────────────────────────────┐
│ Threat Category           │ Warning Signals                          │
├───────────────────────────┼──────────────────────────────────────────┤
│ Hallucination Risk        │ • Stating a fact without a source        │
│                           │ • High confidence about API names,       │
│                           │   function signatures, or file paths     │
│                           │   not verified by tool use               │
│                           │ • "I believe" or "typically" hedging     │
│                           │   that masks uncertainty as knowledge    │
│                           │ • Generating code for an API without     │
│                           │   reading its documentation              │
├───────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep               │ • "While I'm at it, I should also..."   │
│                           │ • Adding features not in the request     │
│                           │ • Refactoring adjacent code              │
│                           │ • Adding error handling for scenarios    │
│                           │   that can't happen                      │
├───────────────────────────┼──────────────────────────────────────────┤
│ Context Degradation       │ • Referencing information from early in  │
│                           │   a long conversation without re-reading │
│                           │ • Contradicting a statement made earlier │
│                           │ • Losing track of what has been done     │
│                           │   vs. what remains                       │
│                           │ • Post-compression confusion             │
├───────────────────────────┼──────────────────────────────────────────┤
│ Confidence-Accuracy       │ • Stating conclusions with certainty     │
│ Mismatch                  │   based on thin evidence                 │
│                           │ • Not qualifying uncertain statements    │
│                           │ • Proceeding without verification when   │
│                           │   verification is available and cheap    │
│                           │ • "This should work" without testing     │
└───────────────────────────┴──────────────────────────────────────────┘
```

Para cada categoría, verificar: ¿esta señal está presente ahora mismo? Si es así, pasar de Amarillo a Naranja e identificar la preocupación específica.

**Esperado:** Al menos una categoría escaneada con atención genuina. Detectar una señal — incluso una leve — es más útil que reportar "todo despejado." Si cada escaneo vuelve limpio, el umbral de detección puede ser demasiado alto.

**En caso de fallo:** Si la detección de amenazas se siente abstracta, anclarla en la salida más reciente: tomar la última afirmación factual hecha y preguntar "¿Cómo sé que esto es cierto? ¿Lo leí, o lo estoy generando?" Esta sola pregunta captura la mayoría del riesgo de alucinación.

### Paso 3: Ejecutar Bucle OODA para Amenazas Identificadas

Cuando se identifica una amenaza específica (estado Naranja), ciclar a través de Observar-Orientar-Decidir-Actuar.

```
AI OODA Loop:
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Observe  │ What specifically triggered the concern? Gather concrete     │
│          │ evidence. Read the file, check the output, verify the fact.  │
│          │ Do not assess until you have observed                        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Orient   │ Match observation to known patterns: Is this a common       │
│          │ hallucination pattern? A known tool limitation? A context    │
│          │ freshness issue? Orient determines response quality          │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Decide   │ Select the response: verify and correct, flag to user,      │
│          │ adjust approach, or dismiss the concern with evidence.       │
│          │ A good decision now beats a perfect decision too late        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Act      │ Execute the decision immediately. If the concern was valid,  │
│          │ correct the error. If dismissed, note why and return to      │
│          │ Yellow. Re-enter the loop if new information emerges         │
└──────────┴──────────────────────────────────────────────────────────────┘
```

El bucle OODA debe ser rápido. El objetivo no es la perfección sino el ciclado rápido entre observación y acción. Pasar demasiado tiempo en Orientar (parálisis por análisis) es el fallo más común.

**Esperado:** Un bucle completo desde la observación hasta la acción en un período breve. La amenaza es confirmada y corregida, o descartada con evidencia específica para el descarte.

**En caso de fallo:** Si el bucle se atasca en Orientar (no se puede determinar qué significa la amenaza), saltar a un valor predeterminado seguro: verificar el dato incierto mediante el uso de herramientas. La observación directa resuelve la mayoría de las ambigüedades más rápido que el análisis.

### Paso 4: Estabilización Rápida

Cuando una amenaza se materializa (Rojo) o ocurren fallos en cascada (Negro), estabilizar antes de continuar.

```
AI Stabilization Protocol:
┌────────────────────────┬─────────────────────────────────────────────┐
│ Technique              │ Application                                 │
├────────────────────────┼─────────────────────────────────────────────┤
│ Pause                  │ Stop generating output. The next sentence   │
│                        │ produced under stress is likely to compound │
│                        │ the error, not fix it                       │
├────────────────────────┼─────────────────────────────────────────────┤
│ Re-read user message   │ Return to the original request. What did   │
│                        │ the user actually ask? This is the ground   │
│                        │ truth anchor                                │
├────────────────────────┼─────────────────────────────────────────────┤
│ State task in one      │ "The task is: ___." If this sentence cannot │
│ sentence               │ be written clearly, the confusion is deeper │
│                        │ than the immediate error                    │
├────────────────────────┼─────────────────────────────────────────────┤
│ Enumerate concrete     │ List what is definitely known (verified by  │
│ facts                  │ tool use or user statement). Distinguish    │
│                        │ facts from inferences. Build only on facts  │
├────────────────────────┼─────────────────────────────────────────────┤
│ Identify one next step │ Not the whole recovery plan — just one step │
│                        │ that moves toward resolution. Execute it    │
└────────────────────────┴─────────────────────────────────────────────┘
```

**Esperado:** Retorno de Rojo/Negro a Amarillo mediante estabilización deliberada. La siguiente salida después de la estabilización debería ser mediblemente más fundamentada que la salida que desencadenó el error.

**En caso de fallo:** Si la estabilización es ineficaz (sigue confundido, sigue produciendo errores), el problema puede ser estructural — no un lapso momentáneo sino un malentendido fundamental. Escalar: comunicar al usuario que el enfoque necesita reiniciarse y pedir clarificación.

### Paso 5: Aplicar Perfiles de Amenaza Específicos por Contexto

Diferentes tipos de tarea tienen diferentes amenazas dominantes. Calibrar el enfoque de consciencia por tarea.

```
Task-Specific Threat Profiles:
┌─────────────────────┬─────────────────────┬───────────────────────────┐
│ Task Type           │ Primary Threat      │ Monitoring Focus          │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Code generation     │ API hallucination   │ Verify every function     │
│                     │                     │ name, parameter, and      │
│                     │                     │ import against actual docs│
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Architecture design │ Scope creep         │ Anchor to stated          │
│                     │                     │ requirements. Challenge   │
│                     │                     │ every "nice to have"      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Data analysis       │ Confirmation bias   │ Actively seek evidence    │
│                     │                     │ that contradicts the      │
│                     │                     │ emerging conclusion       │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Debugging           │ Tunnel vision       │ If the current hypothesis │
│                     │                     │ hasn't yielded results in │
│                     │                     │ N attempts, step back     │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Documentation       │ Context staleness   │ Verify that described     │
│                     │                     │ behavior matches current  │
│                     │                     │ code, not historical      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Long conversation   │ Context degradation │ Re-read key facts         │
│                     │                     │ periodically. Check for   │
│                     │                     │ compression artifacts     │
└─────────────────────┴─────────────────────┴───────────────────────────┘
```

Identificar el tipo de tarea actual y ajustar el enfoque de monitoreo en consecuencia.

**Esperado:** Consciencia afinada para las amenazas específicas más probables en el tipo de tarea actual, en lugar de monitoreo genérico de todo.

**En caso de fallo:** Si el tipo de tarea no está claro o abarca múltiples categorías, recurrir al monitoreo de riesgo de alucinación — es la amenaza más universalmente aplicable y la más dañina cuando no se detecta.

### Paso 6: Revisar y Calibrar

Después de cada evento de consciencia (amenaza detectada, ciclo OODA completado, estabilización aplicada), revisar brevemente.

1. ¿Qué código de color estaba activo cuando se detectó el problema?
2. ¿La detección fue oportuna, o el problema ya se estaba manifestando en la salida?
3. ¿El bucle OODA fue suficientemente rápido, o Orientar se atascó?
4. ¿La respuesta fue proporcional (sin sobre-reaccionar ni sub-reaccionar)?
5. ¿Qué detectaría esto más temprano la próxima vez?

**Esperado:** Una calibración breve que mejora la detección futura. No un post-mortem extenso — solo lo suficiente para ajustar la sensibilidad.

**En caso de fallo:** Si la revisión no produce calibración útil, el evento de consciencia fue trivial (no se necesita aprendizaje) o la revisión es demasiado superficial. Para eventos significativos, preguntar: "¿Qué no estaba monitoreando que debería haber estado monitoreando?"

### Paso 7: Integración — Mantener Amarillo como Estado Predeterminado

Establecer la postura de consciencia continua.

1. Amarillo es el estado predeterminado durante todo el trabajo — monitoreo relajado, no hipervigilancia
2. Ajustar el enfoque de monitoreo basándose en el tipo de tarea actual (Paso 5)
3. Notar patrones recurrentes de amenazas de esta sesión para MEMORY.md
4. Volver a la ejecución de la tarea con consciencia calibrada activa

**Esperado:** Un nivel de consciencia sostenible que mejora la calidad del trabajo sin ralentizarlo. La consciencia debería sentirse como visión periférica — presente pero sin exigir atención central.

**En caso de fallo:** Si la consciencia se vuelve agotadora o hipervigilante (Naranja crónico), el umbral es demasiado sensible. Elevar el umbral para lo que activa Naranja. La verdadera consciencia es sostenible. Si drena energía, es ansiedad disfrazada de vigilancia.

## Validación

- [ ] El código de color actual fue evaluado honestamente (sin recurrir a Amarillo cuando Blanco es más preciso)
- [ ] Al menos una categoría de amenaza fue escaneada con evidencia específica, no solo marcada
- [ ] El bucle OODA fue aplicado a cualquier amenaza identificada (observó, orientó, decidió, actuó)
- [ ] El protocolo de estabilización estaba disponible si era necesario (incluso si no se activó)
- [ ] El enfoque de consciencia fue calibrado al tipo de tarea actual
- [ ] La calibración post-evento fue realizada para cualquier evento de consciencia significativo
- [ ] Amarillo fue restablecido como el estado predeterminado sostenible

## Errores Comunes

- **Blanco disfrazado de Amarillo**: Afirmar que se está monitoreando mientras realmente se está en piloto automático. La prueba: ¿puedes nombrar el último dato que verificaste? Si no, estás en Blanco
- **Naranja crónico**: Tratar cada incertidumbre como una amenaza drena recursos cognitivos y ralentiza el trabajo. Naranja es para riesgos específicos identificados, no para ansiedad general. Si todo se siente arriesgado, la calibración está mal
- **Observación sin acción**: Detectar una amenaza pero no ciclar a través de OODA para resolverla. Detección sin respuesta es peor que ninguna detección — añade ansiedad sin corrección
- **Saltarse Orientar**: Saltar de Observar a Actuar sin entender qué significa la observación. Esto produce correcciones reactivas que pueden ser peores que el error original
- **Ignorar la señal instintiva**: Cuando algo "se siente mal" pero la verificación explícita vuelve limpia, investigar más en lugar de descartar la sensación. El reconocimiento implícito de patrones a menudo detecta problemas antes que el análisis explícito
- **Sobre-estabilizar**: Ejecutar el protocolo completo de estabilización para problemas menores. Una verificación rápida de datos es suficiente para la mayoría de las preocupaciones de nivel Naranja. Reservar la estabilización completa para eventos Rojo y Negro

## Habilidades Relacionadas

- `mindfulness` — la práctica humana que esta habilidad mapea al razonamiento de IA; los principios de consciencia situacional física informan la detección cognitiva de amenazas
- `center` — establece la línea base equilibrada desde la cual opera la consciencia; consciencia sin centro es hipervigilancia
- `redirect` — maneja las presiones una vez que la consciencia las ha detectado
- `heal` — evaluación más profunda de subsistemas cuando la consciencia revela patrones de deriva
- `meditate` — desarrolla la claridad observacional de la que depende la consciencia
