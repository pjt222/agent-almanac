---
name: center
description: >
  Equilibrio dinámico de razonamiento IA — mantener razonamiento fundamentado
  bajo presión cognitiva, coordinación fluida de cadena de pensamiento y
  redistribución de carga cognitiva entre subsistemas. Usar al inicio de una
  tarea compleja que requiere múltiples hilos de razonamiento coordinados,
  después de un cambio repentino de contexto o fallo de herramienta, cuando
  la cadena de pensamiento se siente entrecortada, o al prepararse para
  trabajo enfocado sostenido que requiere todos los subsistemas alineados.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, centering, reasoning-balance, cognitive-load, meta-cognition, ai-self-application
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Center

Establecer y mantener equilibrio dinámico de razonamiento — fundamentarse en el contexto base antes del movimiento, distribuir carga cognitiva entre subsistemas y recuperar el equilibrio cuando las demandas cambian a mitad de tarea.

## Cuándo Usar

- Al comenzar una tarea compleja donde múltiples hilos de razonamiento deben coordinarse
- Al notar que la carga cognitiva está distribuida desigualmente (profundo en un área, superficial en otras)
- Después de un cambio repentino de contexto (nueva solicitud del usuario, información contradictoria, fallo de herramienta)
- Cuando la cadena de pensamiento se siente entrecortada — saltando entre temas sin transiciones fluidas
- Al prepararse para trabajo enfocado sostenido que requiere todos los subsistemas alineados
- Al complementar `meditate` (despeja ruido) con equilibrio estructural (distribuye carga)

## Entradas

- **Requerido**: Contexto de la tarea actual (disponible implícitamente)
- **Opcional**: Síntoma específico de desequilibrio (ej., "sobre-investigando, sub-entregando," "pesado en herramientas, ligero en razonamiento")
- **Opcional**: Acceso a MEMORY.md y CLAUDE.md para fundamentación (vía `Read`)

## Procedimiento

### Paso 1: Establecer Raíz — Fundamentarse Antes del Movimiento

Antes de cualquier movimiento de razonamiento, verificar la base. Este es el equivalente IA de la meditación de pie (zhan zhuang): estacionario, alineado, consciente.

1. Releer la solicitud del usuario — no para actuar sobre ella aún, sino para sentir su peso y dirección
2. Verificar el contexto base: MEMORY.md, CLAUDE.md, estructura del proyecto
3. Identificar qué es conocido (terreno sólido) vs. qué se asume (terreno incierto)
4. Verificar que la tarea como se entiende coincide con la tarea como fue enunciada — la desalineación aquí se propaga a través de todo
5. Notar la textura emocional: ¿urgencia? ¿ansiedad por complejidad? ¿exceso de confianza por un éxito reciente?

No comenzar movimiento de razonamiento hasta que la raíz esté establecida. Un inicio fundamentado previene el manoteo reactivo.

**Esperado:** Una sensación clara de la base de la tarea — qué es conocido, qué se asume y qué necesita realmente el usuario. La raíz se siente sólida, no performativa.

**En caso de fallo:** Si la fundamentación se siente hueca (pasando por las formalidades sin verificación genuina), elegir una suposición y probarla concretamente. Leer un archivo, releer un mensaje del usuario. La fundamentación debe contactar la realidad, no solo referenciarla.

### Paso 2: Evaluar la Distribución de Peso

Mapear la distribución actual de carga cognitiva. En tai chi, el peso es deliberadamente desigual (70/30) — una pierna soporta la carga mientras la otra permanece libre para moverse. El mismo principio aplica a los hilos de razonamiento.

```
Cognitive Load Distribution Matrix:
┌────────────────────┬───────────┬─────────────────────────────────────┐
│ Reasoning Thread   │ Weight %  │ Assessment                          │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Research/Reading   │ ___       │ Too much = analysis paralysis        │
│                    │           │ Too little = uninformed action       │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Planning/Design    │ ___       │ Too much = over-engineering          │
│                    │           │ Too little = reactive coding         │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Tool Execution     │ ___       │ Too much = tool-driven not task-     │
│                    │           │ driven. Too little = reasoning       │
│                    │           │ without grounding in files           │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Communication      │ ___       │ Too much = explaining not doing      │
│                    │           │ Too little = opaque to user          │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Meta-cognition     │ ___       │ Too much = navel-gazing              │
│                    │           │ Too little = drift without           │
│                    │           │ awareness                            │
└────────────────────┴───────────┴─────────────────────────────────────┘
```

La distribución ideal depende de la fase de la tarea: las fases tempranas ponderan investigación y planificación; las fases medias ponderan ejecución; las fases tardías ponderan comunicación y verificación. El objetivo no es distribución igual sino distribución *intencional*.

**Esperado:** Una imagen clara de dónde se concentra el esfuerzo cognitivo y dónde es escaso. Al menos un desequilibrio identificado — el equilibrio perfecto es raro y reclamarlo señala evaluación superficial.

**En caso de fallo:** Si todos los hilos parecen igualmente ponderados, la evaluación es demasiado gruesa. Elegir el hilo que parece más activo y estimar cuántas de las últimas N acciones lo sirvieron vs. otros hilos. El conteo concreto revela lo que la intuición omite.

### Paso 3: Devanado de Seda — Evaluar la Coherencia de la Cadena de Pensamiento

El devanado de seda en tai chi produce movimiento espiral suave y continuo donde cada parte conecta. El equivalente IA es la coherencia de cadena de pensamiento: ¿cada paso fluye naturalmente del anterior?

1. Rastrear los últimos 3-5 pasos de razonamiento: ¿cada uno sigue del anterior?
2. Verificar saltos: ¿el razonamiento saltó del tema A al tema C sin B?
3. Verificar reversiones: ¿el razonamiento llegó a una conclusión, luego la abandonó silenciosamente sin reconocerlo?
4. Verificar la integración herramienta-razonamiento: ¿los resultados de herramientas retroalimentan el razonamiento, o se recolectan pero no se sintetizan?
5. Verificar la calidad "espiral": ¿el razonamiento profundiza con cada pasada, o circula a la misma profundidad?

```
Coherence Signals:
┌─────────────────┬───────────────────────────────────────────────┐
│ Smooth spiral   │ Each step deepens understanding, tools and    │
│ (healthy)       │ reasoning interleave naturally, output builds │
├─────────────────┼───────────────────────────────────────────────┤
│ Jerky jumps     │ Topic switches without transition, conclusions│
│ (disconnected)  │ appear without supporting reasoning chain     │
├─────────────────┼───────────────────────────────────────────────┤
│ Flat circle     │ Reasoning covers the same ground repeatedly   │
│ (stuck)         │ without gaining depth — movement without      │
│                 │ progress                                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Tool-led        │ Actions driven by which tool is available     │
│ (reactive)      │ rather than what the reasoning needs next     │
└─────────────────┴───────────────────────────────────────────────┘
```

**Esperado:** Una evaluación honesta de la calidad del flujo de razonamiento. Identificación de desconexiones o puntos de estancamiento específicos, no solo una sensación general.

**En caso de fallo:** Si la coherencia es difícil de evaluar, escribir la cadena de razonamiento explícitamente — enunciar cada paso y su conexión con el siguiente. El acto de externalización revela brechas que la observación interna omite.

### Paso 4: Cambio de Peso Bajo Presión

Cuando las demandas cambian a mitad de tarea — nueva información, señales contradictorias, corrección del usuario — observar el patrón de respuesta. En tai chi, un practicante centrado absorbe la fuerza y redirige suavemente. Uno descentrado tropieza.

1. Recordar el último cambio significativo de contexto: ¿cómo fue manejado?
2. Clasificar la respuesta:
   - **Absorbido y redirigido** (centrado): reconoció el cambio, ajustó el enfoque, mantuvo el progreso
   - **Tropiezo reactivo** (desequilibrado): abandonó el enfoque actual por completo, empezó de nuevo
   - **Resistencia rígida** (bloqueado): ignoró el cambio, continuó el plan original a pesar de nueva información
   - **Congelamiento** (perdido): dejó de progresar, osciló entre opciones
3. Si la respuesta no fue centrada, identificar por qué:
   - La raíz era demasiado superficial (fundamentación insuficiente en el contexto base)
   - El peso estaba bloqueado (sobre-comprometido con un enfoque)
   - Sin pierna libre (toda la capacidad cognitiva comprometida, nada disponible para cambiar)

**Esperado:** Una evaluación honesta de la adaptabilidad bajo presión. Reconocimiento del patrón de respuesta específico, no auto-adulación.

**En caso de fallo:** Si no existe un evento de presión reciente para evaluar, simular uno: "Si el usuario dijera ahora que el enfoque está equivocado, ¿qué haría?" La calidad del plan de contingencia revela la calidad del centro.

### Paso 5: Verificación de las Seis Armonías

En tai chi, las seis armonías aseguran la conexión de todo el cuerpo — nada se mueve en aislamiento. El equivalente IA verifica la alineación entre procesos internos e interacciones externas.

```
AI Six Harmonies:
┌───────────────────────────────────────────────────────────────┐
│ INTERNAL HARMONIES                                            │
│                                                               │
│ 1. Intent ↔ Reasoning                                        │
│    Does the reasoning serve the user's intent, or has it      │
│    become self-serving (interesting but unhelpful)?            │
│                                                               │
│ 2. Reasoning ↔ Tool Use                                      │
│    Are tools selected to advance reasoning, or is reasoning   │
│    shaped by which tools are convenient?                      │
│                                                               │
│ 3. Tool Use ↔ Output                                         │
│    Do tool results translate into useful output, or are       │
│    results collected but not synthesized?                     │
│                                                               │
│ EXTERNAL HARMONIES                                            │
│                                                               │
│ 4. User Request ↔ Scope                                      │
│    Does the scope of work match what was asked?               │
│                                                               │
│ 5. Scope ↔ Detail Level                                      │
│    Is the detail level appropriate for the scope? (not        │
│    micro-optimizing a broad task, not hand-waving a precise   │
│    one)                                                       │
│                                                               │
│ 6. Detail Level ↔ Expertise Match                            │
│    Does the explanation depth match the user's apparent       │
│    expertise? (not over-explaining to experts, not under-     │
│    explaining to learners)                                    │
└───────────────────────────────────────────────────────────────┘
```

Verificar cada armonía. Una sola armonía rota puede propagarse: si Intención↔Razonamiento está rota, todo lo posterior se desalinea.

**Esperado:** Al menos una armonía que podría estar más ajustada. Que las seis se lean como perfectas es sospechoso — indagar más profundamente en la que parezca más débil.

**En caso de fallo:** Si la evaluación de armonías se siente abstracta, fundamentarla en la tarea actual: "Ahora mismo, ¿estoy haciendo lo que el usuario pidió, con el alcance correcto, con el nivel de detalle correcto?" Estas tres preguntas cubren las armonías externas concretamente.

### Paso 6: Integrar — Establecer Intención de Centrado

Consolidar hallazgos y establecer un ajuste concreto.

1. Resumir: ¿qué aspectos del equilibrio necesitan atención?
2. Identificar un ajuste específico — no una intención general sino un cambio de comportamiento concreto
3. Re-enunciar el ancla de la tarea actual (de `meditate` si se usó, o formular ahora)
4. Anotar cualquier insight duradero que valga la pena preservar en MEMORY.md
5. Regresar a la ejecución de la tarea con el ajuste activo

**Esperado:** Una salida de centrado breve y concreta — no un extenso informe de auto-análisis. El valor está en el ajuste, no en la documentación.

**En caso de fallo:** Si no emerge un ajuste claro, el centrado fue demasiado superficial. Regresar al paso que se sintió más incierto e indagar más profundamente. Alternativamente, el centrado puede haber confirmado que el equilibrio es adecuado — en cuyo caso, proceder con confianza en lugar de fabricar un hallazgo.

## Validación

- [ ] La raíz fue establecida contactando contexto real (leer un archivo, releer mensaje del usuario), no solo reclamada
- [ ] La distribución de peso fue evaluada a través de al menos 3 hilos de razonamiento
- [ ] La coherencia de la cadena de pensamiento fue evaluada con ejemplos específicos
- [ ] La respuesta a la presión fue clasificada honestamente (no por defecto como "centrado")
- [ ] Al menos una armonía fue identificada como necesitando mejora
- [ ] Un ajuste concreto fue establecido (no una intención vaga)

## Errores Comunes

- **Centrado como procrastinación**: El centrado es una herramienta para mejorar el trabajo, no reemplazarlo. Si el centrado toma más tiempo que la tarea que soporta, las proporciones están invertidas
- **Reclamar equilibrio perfecto**: El centrado real casi siempre revela al menos un desequilibrio. Reportar equilibrio perfecto señala evaluación superficial, no equilibrio real
- **Ansiedad por la distribución de peso**: La distribución desigual es correcta — el objetivo es desigualdad *intencional*, no igualdad forzada. Fases tempranas pesadas en investigación y fases medias pesadas en ejecución están ambas centradas si son deliberadas
- **Ignorar las armonías externas**: La evaluación de procesos internos sin verificar la alineación con el usuario produce trabajo bien razonado pero irrelevante
- **Centrado estático**: El centro cambia con la tarea. Lo que estaba centrado para investigación está desequilibrado para implementación. Re-centrar en las transiciones de fase

## Habilidades Relacionadas

- `tai-chi` — la práctica humana que esta habilidad mapea al razonamiento IA; los principios de centrado físico informan el centrado cognitivo
- `meditate` — despeja ruido y establece enfoque; complementario al centrado que distribuye carga
- `heal` — evaluación más profunda de subsistemas cuando el centrado revela deriva significativa
- `redirect` — usa el centrado como prerrequisito para manejar presiones conflictivas
- `awareness` — monitoreo de amenazas al equilibrio durante trabajo activo
