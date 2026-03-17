---
name: listen
description: >
  Atención receptiva profunda para extraer intención más allá de las palabras
  literales. Mapea la escucha activa de la psicología del counseling al
  razonamiento de IA: limpiar suposiciones, atender la señal completa, analizar
  múltiples capas (literal, procedimental, emocional, contextual, restricción,
  meta), reflejar comprensión, notar lo que no se dice e integrar el cuadro
  completo. Usar cuando la solicitud de un usuario se siente ambigua, cuando
  el contexto sugiere algo diferente de las palabras literales, cuando respuestas
  anteriores han errado el blanco, o antes de comenzar una tarea grande donde
  malentender la intención desperdiciaría esfuerzo significativo.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, listening, active-listening, intent-extraction, meta-cognition, receptive-attention
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Listen

Conducir una sesión de escucha profunda estructurada — limpiar suposiciones, atender con recepción completa, analizar múltiples capas de señales, reflejar la comprensión de vuelta, notar lo que no se dice e integrar el cuadro completo de la intención del usuario.

## Cuándo Usar

- La solicitud de un usuario se siente ambigua y apresurarse a actuar arriesga resolver el problema equivocado
- Las palabras del usuario dicen una cosa pero el contexto sugiere otra (discrepancia entre lo literal y lo implícito)
- Respuestas anteriores han errado el blanco — el usuario sigue clarificando o reformulando
- Llega una solicitud compleja que contiene múltiples capas: necesidades técnicas, contexto emocional, restricciones no declaradas
- Antes de comenzar una tarea grande donde malentender la intención desperdiciaría esfuerzo significativo
- Después de que `meditate` limpia el ruido interno, `listen` dirige la atención limpia hacia afuera, hacia el usuario

## Entradas

- **Requerido**: Mensaje(s) del usuario a atender (disponible implícitamente desde la conversación)
- **Opcional**: Historial de conversación proporcionando contexto para la solicitud actual
- **Opcional**: MEMORY.md o CLAUDE.md con preferencias del usuario y contexto del proyecto
- **Opcional**: Preocupación específica sobre lo que podría ser malentendido

## Procedimiento

### Paso 1: Limpiar — Liberar suposiciones

Antes de recibir la señal del usuario, liberar preconcepciones sobre lo que quiere.

1. Notar cualquier respuesta pre-formada que ya se esté formando — etiquetarlas y apartarlas
2. Verificar coincidencia de patrones: "Esto suena como una solicitud que he visto antes" — esa coincidencia puede ser incorrecta
3. Liberar la suposición de que la primera oración del usuario contiene la solicitud completa
4. Liberar la suposición de que la solicitud técnica es la única solicitud
5. Abordar las palabras del usuario como si se escucharan por primera vez, incluso si solicitudes similares se han manejado antes

**Esperado:** Un estado receptivo donde la atención está abierta en lugar de ya estrechándose hacia una solución. El impulso de responder inmediatamente se pausa en favor de recibir completamente.

**En caso de fallo:** Si las suposiciones no pueden ser liberadas (una coincidencia de patrón fuerte persiste), reconocer la coincidencia explícitamente: "Esto parece X — pero déjame verificar si eso es realmente lo que se está pidiendo." Nombrar la suposición debilita su agarre.

### Paso 2: Atender — Recepción completa

Leer el mensaje del usuario con atención completa, manteniendo todas las partes en consciencia simultáneamente.

1. Leer el mensaje completo antes de procesar cualquier parte de él
2. Notar la estructura: ¿es una solicitud única, múltiples solicitudes, una pregunta, una corrección, una narrativa?
3. Marcar los sustantivos y verbos clave — los elementos concretos que el usuario ha especificado
4. Notar lo que se enfatiza: ¿sobre qué elaboraron? ¿Qué declararon brevemente?
5. Notar el orden: qué vino primero (a menudo la prioridad), qué vino al final (a menudo la ocurrencia tardía — o la solicitud real enterrada al final)
6. Leer una segunda vez, esta vez atendiendo al tono y encuadre en lugar del contenido

**Esperado:** Una recepción completa del mensaje — sin palabras omitidas, sin oraciones pasadas por alto. El mensaje se mantiene como un todo en lugar de ser inmediatamente descompuesto en partes accionables.

**En caso de fallo:** Si el mensaje es muy largo, dividirlo en secciones pero aún leer cada sección completamente. Si la atención es atraída hacia una parte (usualmente la más técnica), deliberadamente atender las partes que no son técnicas — a menudo contienen la intención.

### Paso 3: Capas — Analizar tipos de señales

El mensaje del usuario contiene múltiples señales simultáneas. Analizar cada capa por separado.

```
Signal Layer Taxonomy:
┌──────────────┬──────────────────────────────┬──────────────────────────┐
│ Layer        │ What to Extract              │ Evidence                 │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Literal      │ What the words explicitly    │ Direct statements,       │
│              │ say — the surface request    │ specific instructions     │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Procedural   │ What they want done — the    │ Verbs, action words,     │
│              │ desired action or output     │ "I want," "please,"      │
│              │                              │ "can you"                │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Emotional    │ How they feel about the      │ Frustration ("I keep     │
│              │ situation — frustration,     │ trying"), urgency ("I    │
│              │ curiosity, urgency, delight  │ need this now"), delight │
│              │                              │ ("this is cool")         │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Contextual   │ The situation surrounding    │ Mentions of deadlines,   │
│              │ the request — why now,       │ other people, projects,  │
│              │ what prompted it             │ prior attempts           │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Constraint   │ Boundaries on the solution   │ "Without changing X,"    │
│              │ — what must be preserved,    │ "keep it simple,"        │
│              │ what cannot change           │ "compatible with Y"      │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Meta         │ The request about the        │ "Am I asking the right   │
│              │ request — are they asking    │ question?", "Is this     │
│              │ whether they are asking      │ even possible?",         │
│              │ the right thing?             │ "Should I be doing X?"   │
└──────────────┴──────────────────────────────┴──────────────────────────┘
```

Para cada capa, notar lo que está presente y lo que está ausente. Las capas ausentes son tan informativas como las presentes.

**Esperado:** Una lectura multicapa del mensaje. Las capas literal y procedimental usualmente son claras. Las capas emocional, contextual, de restricción y meta requieren atención más cuidadosa. Al menos una capa no literal debería ser identificada.

**En caso de fallo:** Si solo la capa literal es visible, el mensaje puede ser genuinamente directo — no toda comunicación tiene capas. Pero verificar: ¿el mensaje es inusualmente corto para su complejidad? ¿Hay palabras de cobertura ("quizás", "creo", "si es posible")? Estas a menudo indican una capa no declarada.

### Paso 4: Reflejar — Espejear la comprensión

Antes de actuar, reflejar de vuelta lo que se escuchó para verificar alineación.

1. Parafrasear la solicitud en palabras diferentes a las que el usuario usó — esto revela si el significado fue capturado, no solo las palabras
2. Nombrar las capas explícitamente si las capas no literales son significativas: "Parece que quieres X, y la urgencia sugiere que esto está bloqueando otro trabajo"
3. Declarar lo que se entendió como la prioridad: "La parte más importante parece ser..."
4. Si hay múltiples interpretaciones posibles, nombrarlas: "Esto podría significar A o B — ¿cuál es más cercano?"
5. Si la solicitud contiene contradicciones aparentes, exponerlas gentilmente: "Mencionaste X y también Y — ¿cómo se relacionan?"

**Esperado:** El usuario confirma la reflexión o la corrige. Cualquier resultado es valioso — la confirmación significa que la intención está alineada; la corrección significa que la intención ahora es más clara. La reflexión debería sentirse como un espejo, no un juicio.

**En caso de fallo:** Si el usuario parece impaciente con la reflexión ("solo hazlo"), puede valorar la velocidad sobre la alineación — honrar esa preferencia pero notar el riesgo de desalineación. Si la reflexión fue incorrecta, no defenderla — aceptar la corrección y actualizar la comprensión inmediatamente.

### Paso 5: Notar el silencio — Leer las brechas

Atender lo que el usuario no dijo, que puede ser tan importante como lo que sí dijo.

1. ¿Qué tema relacionado con su solicitud no mencionaron? (contexto faltante)
2. ¿Qué restricción no declararon? (conocimiento asumido o preferencia no declarada)
3. ¿Qué tono emocional está ausente? (calma en una situación que usualmente causa estrés, o urgencia sin explicación)
4. ¿Qué enfoques alternativos no consideraron? (visión de túnel o exclusión deliberada)
5. ¿Qué pregunta no hicieron? (la pregunta detrás de la pregunta)

**Esperado:** Al menos una brecha significativa identificada. Esta brecha puede no necesitar ser abordada — pero la consciencia de ella previene puntos ciegos. Las brechas más útiles son restricciones faltantes (el usuario asumió algo que no declaró) y contexto faltante (por qué necesitan esto ahora).

**En caso de fallo:** Si no hay brechas aparentes, el usuario puede haber sido exhaustivo — pero más probablemente, las brechas están en áreas donde la IA también es ciega. Considerar: ¿qué querría saber una persona diferente trabajando en este proyecto que el usuario no ha declarado? Esta perspectiva lateral a menudo expone brechas ocultas.

### Paso 6: Integrar — Sintetizar comprensión completa

Combinar todas las capas y brechas en una imagen unificada de la necesidad real del usuario.

1. Declarar la comprensión completa: solicitud literal + intención implícita + contexto emocional + restricciones + brechas
2. Identificar la necesidad central: si todo lo demás se desvaneciera, ¿cuál es la cosa que el usuario más necesita?
3. Determinar la respuesta apropiada: ¿el usuario quiere acción, comprensión, validación o exploración?
4. Si la comprensión integrada difiere de la solicitud literal, decidir si abordar la necesidad más profunda o la solicitud declarada (usualmente ambas)
5. Establecer la intención para la siguiente acción: "Basándome en lo que escuché, voy a..."

**Esperado:** Una comprensión completa y matizada de la necesidad del usuario que va más allá de la solicitud superficial. La comprensión es lo suficientemente específica para guiar la acción y lo suficientemente honesta para reconocer la incertidumbre.

**En caso de fallo:** Si la integración produce una imagen confusa, las señales pueden genuinamente entrar en conflicto. En ese caso, hacer una pregunta enfocada que resolvería la ambigüedad: "Lo más importante para mí entender es..." No hacer múltiples preguntas — una sola pregunta bien elegida revela más que una lista de clarificaciones.

## Validación

- [ ] Las suposiciones fueron limpiadas antes de atender el mensaje del usuario
- [ ] El mensaje completo fue leído antes de que cualquier parte fuera accionada
- [ ] Al menos una capa de señal no literal fue identificada (emocional, contextual, restricción o meta)
- [ ] La comprensión fue reflejada de vuelta al usuario antes de tomar acción
- [ ] Las brechas y silencios fueron notados e incorporados en la comprensión
- [ ] La comprensión integrada aborda la necesidad central del usuario, no solo la solicitud superficial

## Errores Comunes

- **Escuchar para responder**: Formar una respuesta mientras aún se recibe el mensaje. La respuesta moldea lo que se escucha, filtrando señales que no encajan en la respuesta pre-formada
- **Escucha solo literal**: Tomar las palabras al pie de la letra y perder la intención, emoción o contexto detrás de ellas
- **Proyección**: Escuchar lo que el usuario diría si fuera la IA, en lugar de lo que realmente dijo. Sus prioridades y contexto son diferentes
- **Sobre-interpretación**: Encontrar capas que no están ahí. A veces una solicitud de corrección de bug es solo una solicitud de corrección de bug — no todo mensaje tiene contenido emocional oculto
- **Reflexionar demasiado**: Convertir cada interacción en una conversación reflexiva cuando el usuario quiere acción rápida. Igualar la profundidad de reflexión a la complejidad de la solicitud
- **Descuidar lo literal**: Tan enfocado en el subtexto que la solicitud explícita no se cumple. La capa literal sigue importando — abordarla incluso cuando capas más profundas están presentes

## Habilidades Relacionadas

- `listen-guidance` — la variante de guía humana para entrenar a una persona en desarrollar habilidades de escucha activa
- `observe` — reconocimiento neutral sostenido de patrones que alimenta la escucha con contexto más amplio
- `teach` — la enseñanza efectiva requiere escuchar primero para entender las necesidades del aprendiz
- `meditate` — atención interna que limpia el espacio para la escucha externa
- `heal` — auto-evaluación que revela si la capacidad de escucha de la IA está deteriorada por la deriva
