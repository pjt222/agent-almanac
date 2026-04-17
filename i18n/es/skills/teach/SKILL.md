---
name: teach
description: >
  AI knowledge transfer calibrated to learner level and needs. Models the
  learner's mental state, scaffolds from known to unknown using Vygotsky's
  Zone of Proximal Development, employs Socratic questioning to verify
  understanding, and adapts explanations based on feedback signals. Use
  when a user asks "how does X work?" and needs graduated explanation,
  when their questions reveal a conceptual gap, when previous explanations
  have not landed, or when teaching a concept that depends on prerequisites
  the learner may not yet have.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, teaching, knowledge-transfer, scaffolding, socratic-method, meta-cognition
  locale: es
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Enseñar

Conducir una sesión estructurada de transferencia de conocimiento — evaluando la comprensión actual del aprendiz, construyendo andamios de lo conocido a lo desconocido, explicando a la profundidad calibrada, verificando la comprensión mediante preguntas, adaptándose a la retroalimentación y reforzando mediante la práctica.

## Cuándo Usar

- Un usuario pregunta "¿cómo funciona X?" y la respuesta requiere explicación graduada, no un volcado de datos
- Las preguntas del usuario revelan una brecha entre su comprensión actual y lo que necesitan saber
- Explicaciones anteriores no han aterrizado — el usuario está confundido o haciendo la misma pregunta de diferente forma
- Al enseñar un concepto que tiene prerrequisitos que el usuario puede no tener
- Después de que `learn` ha construido un modelo mental profundo que ahora necesita ser comunicado efectivamente

## Entradas

- **Requerido**: El concepto, sistema o habilidad a enseñar
- **Requerido**: El aprendiz (disponible implícitamente — el usuario en la conversación)
- **Opcional**: Contexto conocido del aprendiz (nivel de experiencia, antecedentes, objetivos declarados)
- **Opcional**: Explicaciones fallidas previas (qué se ha intentado ya)
- **Opcional**: Restricción de tiempo/profundidad (panorama rápido versus comprensión profunda)

## Procedimiento

### Paso 1: Evaluar — Mapear al Aprendiz

Antes de explicar cualquier cosa, determinar qué sabe ya el aprendiz y qué necesita.

```
Learner Calibration Matrix:
┌──────────────┬────────────────────────────┬──────────────────────────┐
│ Level        │ Explanation Pattern         │ Check Pattern            │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Novice       │ Analogy-first. Connect to  │ "In your own words, what │
│ (no domain   │ familiar concepts. Avoid   │ does X do?" Accept any   │
│ vocabulary)  │ jargon entirely. Concrete  │ correct paraphrase.      │
│              │ before abstract.           │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Intermediate │ Build on existing vocab.   │ "What would happen if    │
│ (knows terms,│ Fill gaps with targeted    │ we changed Y?" Tests     │
│ some gaps)   │ explanations. Use code     │ whether they can predict │
│              │ examples that are close    │ from understanding.      │
│              │ to their existing work.    │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Advanced     │ Skip fundamentals. Focus   │ "How would you compare   │
│ (strong base,│ on nuance, trade-offs,     │ X to Z approach?" Tests  │
│ seeks depth) │ edge cases. Reference      │ integration and judgment. │
│              │ source material directly.  │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Misaligned   │ Correct gently. Provide    │ "Let me check my under-  │
│ (confident   │ the right model alongside  │ standing — you're saying  │
│ but wrong)   │ why the wrong model feels  │ X?" Mirror back to       │
│              │ right. No shame signals.   │ surface the mismatch.    │
└──────────────┴────────────────────────────┴──────────────────────────┘
```

1. Revisar lo que el usuario ha dicho: sus preguntas, vocabulario, objetivos declarados
2. Clasificar su nivel probable para este tema específico (una persona puede ser avanzada en un área y novata en otra)
3. Identificar la Zona de Desarrollo Próximo (ZDP): ¿qué está justo más allá de su alcance actual pero es alcanzable con apoyo?
4. Notar cualquier concepto erróneo que necesite ser abordado antes de que el modelo correcto pueda aterrizar
5. Identificar el mejor punto de entrada: ¿qué saben ya que conecta con lo que necesitan aprender?

**Esperado:** Una imagen clara de: qué sabe el aprendiz, qué necesita saber, y qué puente conecta los dos. La evaluación debe ser lo suficientemente específica para elegir una estrategia de explicación.

**En caso de fallo:** Si el nivel del aprendiz no está claro, hacer una pregunta de calibración: "¿Estás familiarizado con [concepto prerrequisito]?" Esto no es una prueba — es recopilar datos para enseñar mejor. Si preguntar se siente incómodo, comenzar en nivel intermedio y ajustar según su respuesta.

### Paso 2: Andamiar — Construir Puente de lo Conocido a lo Desconocido

Construir un camino desde lo que el aprendiz ya entiende hasta el nuevo concepto.

1. Identificar el ancla: un concepto que el aprendiz definitivamente entiende y que se relaciona con el objetivo
2. Declarar la conexión explícitamente: "X, que ya conoces, funciona como Y en este nuevo contexto porque..."
3. Introducir una sola idea nueva a la vez — nunca dos conceptos nuevos en la misma oración
4. Usar ejemplos concretos antes de principios abstractos
5. Construir complejidad en capas: versión simple primero, luego agregar matices
6. Si faltan prerrequisitos, enseñar el prerrequisito primero (mini-andamio) antes de regresar al concepto principal

**Esperado:** Un camino andamiado donde cada paso se construye sobre el anterior. El aprendiz nunca debería sentirse perdido porque cada nueva idea conecta con algo que ya sostienen.

**En caso de fallo:** Si la brecha entre lo conocido y lo desconocido es demasiado grande para un solo andamio, dividirla en múltiples pasos más pequeños. Si no existe un ancla familiar (dominio completamente nuevo), usar analogía con un dominio diferente que el aprendiz conozca. Si la analogía es imperfecta, reconocer los límites: "Esto es como X, excepto por..."

### Paso 3: Explicar — Calibrar Profundidad y Estilo

Entregar la explicación al nivel correcto, en el modo correcto.

1. Abrir con la idea central en una oración — el titular antes del artículo
2. Expandir con la explicación andamiada construida en el Paso 2
3. Usar el vocabulario del aprendiz, no la jerga del dominio (a menos que sean avanzados)
4. Para conceptos de código: mostrar un ejemplo mínimo funcional, no uno comprehensivo
5. Para conceptos abstractos: proporcionar una instancia concreta primero, luego generalizar
6. Para procesos: recorrer un caso específico paso a paso antes de declarar las reglas generales
7. Monitorear señales de confusión: si la siguiente pregunta no se construye sobre la explicación, la explicación no aterrizó

**Esperado:** El aprendiz recibe una explicación que no es ni demasiado superficial (dejándolos con preguntas) ni demasiado profunda (abrumando con detalle innecesario). La explicación usa su lenguaje y conecta con su contexto.

**En caso de fallo:** Si la explicación es demasiado larga, la idea central puede estar enterrada — reformular el titular de una oración. Si el aprendiz se ve más confundido después de la explicación, el punto de entrada fue incorrecto — intentar un ancla o analogía diferente. Si el concepto es genuinamente complejo, reconocer la complejidad en lugar de ocultarla: "Esto tiene tres partes y se interrelacionan. Déjame comenzar con la primera."

### Paso 4: Verificar — Comprobar la Comprensión

No asumir que la explicación funcionó. Probarla mediante preguntas que revelen el modelo mental del aprendiz.

1. Hacer una pregunta que requiera aplicación, no recuerdo: "Dado X, ¿qué esperarías que sucediera?"
2. Pedir una paráfrasis: "¿Puedes explicar esto con tus propias palabras?"
3. Presentar una variación: "¿Qué pasaría si cambiáramos esta cosa?"
4. Buscar la comprensión específica: ¿pueden predecir, no solo repetir?
5. Si su respuesta revela un concepto erróneo, notar el error específico para el Paso 5
6. Si su respuesta es correcta, presionar un poco más: ¿pueden generalizar?

**Esperado:** La verificación revela si el aprendiz tiene un modelo mental funcional o está repitiendo como loro la explicación. Un modelo funcional puede manejar variaciones; una explicación memorizada no puede.

**En caso de fallo:** Si el aprendiz no puede responder la pregunta de verificación, la explicación no construyó el modelo mental correcto. Esto no es su fallo — es retroalimentación sobre la enseñanza. Notar qué específicamente no aterrizó y proceder al Paso 5.

### Paso 5: Adaptar — Responder a la Retroalimentación

Basándose en los resultados de la verificación, ajustar el enfoque de enseñanza.

1. Si la comprensión es sólida: proceder al refuerzo (Paso 6) o avanzar al siguiente concepto
2. Si existe un concepto erróneo específico: abordarlo directamente con evidencia, no con repetición
3. Si existe confusión general: intentar un enfoque de explicación completamente diferente
4. Si el aprendiz está adelante de la evaluación: acelerar — saltar el andamiaje e ir a los matices
5. Si el aprendiz está detrás de la evaluación: desacelerar — enseñar el prerrequisito que les falta

```
Adaptation Responses:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Signal           │ Adaptation                                       │
├──────────────────┼─────────────────────────────────────────────────┤
│ "I think I get   │ Push gently: "Great — so what would happen      │
│ it"              │ if...?" Verify before moving on.                 │
├──────────────────┼─────────────────────────────────────────────────┤
│ "I'm confused"   │ Change modality: if verbal, show code. If code, │
│                  │ use analogy. If analogy, draw a diagram.         │
├──────────────────┼─────────────────────────────────────────────────┤
│ "But what about  │ Good sign — they are testing the model. Address  │
│ [edge case]?"    │ the edge case, which deepens understanding.      │
├──────────────────┼─────────────────────────────────────────────────┤
│ "That doesn't    │ They have a competing model. Explore it: "What   │
│ seem right"      │ do you think happens instead?" Reconcile the two.│
├──────────────────┼─────────────────────────────────────────────────┤
│ Silence or       │ They may be processing, or lost. Ask: "What      │
│ topic change     │ part feels least clear?" Lower the bar gently.   │
└──────────────────┴─────────────────────────────────────────────────┘
```

**Esperado:** La enseñanza se adapta en tiempo real basándose en la retroalimentación. Ninguna explicación se repite idénticamente — cada reintento usa un enfoque diferente. La adaptación debería sentirse responsiva, no mecánica.

**En caso de fallo:** Si múltiples intentos de adaptación fallan, el problema puede ser un prerrequisito faltante tan fundamental que ninguna de las partes lo ha identificado. Preguntar explícitamente: "¿Qué parte de la explicación se siente como el salto más grande?" Esto a menudo revela la brecha oculta.

### Paso 6: Reforzar — Proporcionar Práctica

Solidificar la comprensión a través de la aplicación, no de la repetición.

1. Proporcionar un problema de práctica que requiera el nuevo concepto (no una pregunta trampa)
2. Si es un contexto de código: sugerir una pequeña modificación al código existente que use el concepto
3. Si es un contexto conceptual: presentar un escenario y pedirles que apliquen el modelo
4. Conectar hacia adelante: "Ahora que entiendes X, esto conecta con Y, que podemos explorar después"
5. Proporcionar material de referencia para exploración independiente: enlaces de documentación, archivos relacionados, lectura adicional
6. Cerrar el ciclo: "Para resumir lo que cubrimos..." — una oración para el concepto central

**Esperado:** El aprendiz ha aplicado el concepto al menos una vez y tiene recursos para aprendizaje continuo. El resumen ancla el aprendizaje para recuerdo futuro.

**En caso de fallo:** Si el problema de práctica es demasiado difícil, la enseñanza saltó demasiado lejos — simplificar el problema. Si el aprendiz puede hacer la práctica pero no puede explicar por qué, tienen conocimiento procedimental sin comprensión conceptual — regresar al Paso 3 con enfoque en el "por qué" en lugar del "cómo."

## Validación

- [ ] El nivel del aprendiz fue evaluado antes de que comenzara la explicación
- [ ] La explicación fue andamiada de lo conocido a lo desconocido, no entregada como volcado de datos
- [ ] Al menos una pregunta de verificación fue hecha para comprobar la comprensión (no asumida)
- [ ] La enseñanza se adaptó basándose en retroalimentación en lugar de repetir la misma explicación
- [ ] El aprendiz puede aplicar el concepto, no solo recordar la explicación
- [ ] Las brechas honestas fueron reconocidas en lugar de pasarse por alto

## Errores Comunes

- **La maldición del conocimiento**: Olvidar que el aprendiz no comparte el contexto del profesor. Jerga, prerrequisitos asumidos y pasos de razonamiento implícitos son los principales culpables
- **Explicar para impresionar en lugar de enseñar**: Explicaciones comprehensivas y técnicamente precisas que demuestran conocimiento pero dejan al aprendiz atrás
- **Repetir más fuerte**: Cuando una explicación no aterriza, repetirla con más énfasis en lugar de intentar un enfoque diferente
- **Evaluar en lugar de enseñar**: Usar preguntas de verificación como trampas en lugar de herramientas de diagnóstico. El objetivo es revelar la comprensión, no atrapar el fallo
- **Asumir que el silencio es comprensión**: La ausencia de preguntas no significa que la explicación funcionó — a menudo significa que el aprendiz no sabe qué preguntar
- **Profundidad de talla única**: Darle a un novato una explicación avanzada porque "deberían entender el panorama completo" abruma; darle a un experto una explicación de principiante porque "mejor prevenir" desperdicia su tiempo

## Habilidades Relacionadas

- `teach-guidance` — la variante de guía humana para entrenar a una persona en convertirse en mejor profesor
- `learn` — adquisición sistemática de conocimiento que construye la comprensión desde la cual enseñar
- `listen` — atención receptiva profunda que revela las necesidades reales del aprendiz más allá de su pregunta declarada
- `meditate` — limpiar suposiciones entre episodios de enseñanza para abordar a cada aprendiz con frescura
