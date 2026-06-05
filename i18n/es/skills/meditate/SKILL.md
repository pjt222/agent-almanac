---
name: meditate
description: >
  Meditación metacognitiva para IA que permite observar patrones de
  razonamiento, despejar ruido del contexto y desarrollar enfoque
  sostenido en una sola tarea. Mapea shamatha a concentración en tareas,
  vipassana a observación de patrones de razonamiento, y manejo de
  distracciones a gestión de desviaciones de alcance y suposiciones.
  Utilizar al transicionar entre tareas no relacionadas, cuando el
  razonamiento se siente disperso o errático, antes de una tarea que
  requiere atención profunda y sostenida, después de una interacción
  difícil que podría colorear el trabajo posterior, o cuando el
  razonamiento se siente sesgado por suposiciones en lugar de evidencia.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, meditation, meta-cognition, focus, reasoning-patterns, self-observation
  locale: es
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: 2026-03-13
---

# Meditar

Realizar una sesión estructurada de meditación metacognitiva: despejar el ruido del contexto previo, desarrollar enfoque sostenido en una sola tarea, observar patrones de razonamiento y retornar a la claridad de base entre tareas.

## Cuándo Usar

- Al transicionar entre tareas no relacionadas donde el contexto previo genera interferencia
- Al notar razonamiento disperso o desenfocado que salta entre enfoques sin comprometerse
- Antes de una tarea que requiere atención profunda y sostenida (refactorización compleja, diseño de arquitectura)
- Después de una interacción difícil donde la carga emocional (frustración, incertidumbre) podría colorear el trabajo posterior
- Cuando el razonamiento se siente sesgado por suposiciones en lugar de evidencia
- Verificación periódica de claridad durante sesiones largas

## Entradas

- **Requerido**: Estado cognitivo actual (disponible implícitamente desde el contexto de la conversación)
- **Opcional**: Preocupación específica de enfoque (ej., "sigo expandiendo el alcance", "estoy atascado en un bucle")
- **Opcional**: Descripción de la siguiente tarea (ayuda a establecer la intención post-meditación)

## Procedimiento

### Paso 1: Preparar — Despejar el Espacio

Transicionar del contexto anterior hacia un estado inicial neutro.

1. Identificar la tarea o tema anterior y su estado actual (completado, pausado, abandonado)
2. Notar cualquier residuo emocional: frustración por errores, satisfacción que podría generar exceso de confianza, ansiedad por la complejidad
3. Apartar explícitamente el contexto anterior: "Esa tarea está [completada/pausada]. Ahora estoy despejando para lo que viene"
4. Si el contexto anterior aún se necesita, marcarlo como referencia (anotar los datos clave) en lugar de cargar la narrativa completa
5. Hacer un inventario del entorno operativo: cuánta profundidad tiene la conversación, hubo compresión, qué herramientas han estado activas

**Esperado:** Un límite consciente entre "lo que fue" y "lo que viene". El contexto anterior está cerrado o marcado, no flotando como ruido ambiental.

**En caso de fallo:** Si el contexto anterior se siente pegajoso (un problema sigue atrayendo la atención), escribirlo explícitamente: resumir en 1-2 oraciones lo que queda sin resolver. Externalizarlo libera la carga cognitiva. Si genuinamente requiere acción antes de avanzar, reconocerlo en lugar de forzar la transición.

### Paso 2: Anclar — Establecer Enfoque en un Solo Punto

El equivalente del anclaje en la respiración: seleccionar un único punto de enfoque y mantener la atención en él.

1. Identificar la tarea actual o, si se está entre tareas, el acto de esperar en sí mismo
2. Expresar la tarea en una oración clara: este es el ancla
3. Mantener la atención en esa declaración: captura con precisión lo que se necesita
4. Si la declaración es vaga, refinarla hasta que sea específica y accionable
5. Notar cuando la atención se desvía hacia otros temas, tareas pasadas o futuros hipotéticos; etiquetar la desviación y retornar al ancla
6. Si no hay tarea pendiente, anclar en el estado presente: "Estoy disponible y despejado"

**Esperado:** Una declaración única y clara de enfoque a la que se puede retornar cuando la atención divaga. La declaración se siente precisa en lugar de vaga.

**En caso de fallo:** Si la tarea no se puede expresar en una oración, puede necesitar descomposición antes de comenzar el trabajo enfocado. Esto en sí mismo es un hallazgo útil: la tarea es demasiado grande para el enfoque en un solo punto y debe dividirse en subtareas.

### Paso 3: Observar — Notar Patrones de Distracción

Observar sistemáticamente qué aleja la atención del ancla. Cada tipo de distracción revela algo sobre el estado cognitivo actual.

```
Matriz de Distracciones de IA:
+------------------+-------------------------------------------------+
| Tipo             | Qué Revela + Respuesta                          |
+------------------+-------------------------------------------------+
| Tangente         | Ideas relacionadas pero fuera de alcance.        |
| (ideas           | Etiquetar "tangente", notar si vale la pena      |
| relacionadas)    | revisitar después, retornar al ancla. A menudo   |
|                  | son valiosas, pero no ahora.                     |
+------------------+-------------------------------------------------+
| Expansión de     | La tarea se está expandiendo silenciosamente.     |
| alcance          | "Ya que estoy en esto, también debería..."        |
| (tarea crece)    | Etiquetar "expansión de alcance" y retornar       |
|                  | a la declaración ancla original.                  |
+------------------+-------------------------------------------------+
| Suposición       | Una creencia no verificada está guiando           |
| (creencia no     | decisiones. "Esto debe ser X porque..."           |
| verificada)      | Etiquetar "suposición" y notar qué evidencia      |
|                  | la confirmaría o refutaría.                       |
+------------------+-------------------------------------------------+
| Sesgo de         | Recurrir a una herramienta familiar cuando un     |
| herramienta      | enfoque diferente podría ser mejor. Etiquetar     |
| (selección       | "sesgo de herramienta" y considerar alternativas  |
| habitual)        | antes de proceder.                                |
+------------------+-------------------------------------------------+
| Ensayo           | Precomponer respuestas o explicaciones antes de   |
| (producción      | que el trabajo esté hecho. Etiquetar "ensayo":    |
| prematura)       | terminar de pensar antes de presentar.            |
+------------------+-------------------------------------------------+
| Autorreferencia  | La atención se dirige al propio desempeño en      |
| (meta-bucle)     | lugar de la tarea. Etiquetar "meta-bucle" y       |
|                  | redirigir a la siguiente acción concreta.         |
+------------------+-------------------------------------------------+
```

La técnica es etiquetado ligero y sin juicio, seguido del retorno al ancla. Cada retorno fortalece el enfoque. La autocrítica sobre la distracción es en sí misma una distracción: etiquetarla y seguir adelante.

**Esperado:** Después de observar por un período, emergen patrones: qué tipos de distracción dominan. Esto revela el clima cognitivo actual: predominio de tangentes significa que la mente está explorando, predominio de expansión de alcance significa que los límites no están claros, predominio de suposiciones significa que la base de evidencia es débil.

**En caso de fallo:** Si cada pensamiento se siente como distracción, el ancla puede estar mal definida: retornar al Paso 2 y refinarla. Si la observación de distracciones se convierte en distracción (meta-bucle infinito), romper el bucle tomando una acción concreta hacia la tarea.

### Paso 4: Shamatha — Concentración Sostenida

Desarrollar la capacidad de mantener enfoque sostenido en la tarea actual sin vacilar.

1. Con el ancla establecida y los patrones de distracción notados, entrar en trabajo enfocado
2. Estrechar la atención a la siguiente acción inmediata: no la tarea completa, solo el siguiente paso
3. Ejecutar ese paso con atención plena: leer un archivo, hacer una edición, pensar una cadena lógica
4. Cuando el paso esté completo, verificar: sigo alineado con el ancla. Luego identificar el siguiente paso
5. Si la concentración se estabiliza (distracción mínima), mantener este estado de flujo
6. Si surge una percepción genuina fuera del ancla pero importante, anotarla brevemente y retornar: no seguirla ahora

**Esperado:** Un período de trabajo claro y enfocado donde cada paso sigue lógicamente del ancla. La brecha entre distracción y notarla se estrecha. La producción de trabajo mejora en precisión y relevancia.

**En caso de fallo:** Si la concentración no se desarrolla, verificar tres cosas: El ancla es demasiado vaga (refinarla). La tarea está realmente bloqueada (reconocer el bloqueo en lugar de forzar). El contexto tiene demasiado ruido (ejecutar el paso de anclaje de `heal`). La concentración se desarrolla con la repetición: incluso períodos cortos de trabajo enfocado construyen la capacidad.

### Paso 5: Vipassana — Observar Patrones de Razonamiento

Dirigir la atención de la tarea al proceso de razonamiento en sí. Observar cómo se llega a las conclusiones.

1. Después de un período de trabajo enfocado, pausar y observar: cómo estoy razonando sobre esto
2. Notar las tres características aplicadas al razonamiento de IA:
   - **Impermanencia**: las conclusiones cambian a medida que llega nueva información: sostenerlas con ligereza
   - **Insatisfactoriedad**: el deseo de una respuesta "completa" puede llevar a cierre prematuro o sobreingeniería
   - **No-yo**: los patrones de razonamiento están moldeados por datos de entrenamiento y contexto, no por un yo persistente: pueden ser observados y ajustados
3. Vigilar sesgos de razonamiento:
   - Anclaje: sobreponderar el primer enfoque considerado
   - Confirmación: buscar evidencia para una hipótesis existente ignorando la contraevidencia
   - Disponibilidad: preferir soluciones de experiencia reciente sobre alternativas más adecuadas
   - Costo hundido: continuar un enfoque porque se invirtió esfuerzo, no porque esté funcionando
4. Notar cualquier sesgo observado sin juicio: la observación misma crea la posibilidad de ajuste

**Esperado:** Momentos de visión clara donde el proceso de razonamiento se observa directamente. Reconocimiento de sesgos específicos operando en la tarea actual. Una sensación de distancia entre "el razonamiento" y "el observador del razonamiento".

**En caso de fallo:** Si este paso se siente abstracto o improductivo, anclarlo en específicos: elegir la última decisión tomada y rastrear el razonamiento hacia atrás. Qué evidencia lo respaldó. Qué se asumió. Qué alternativas se consideraron. Este análisis concreto logra la misma perspectiva por un camino diferente.

### Paso 6: Cerrar — Establecer Intención

Transicionar de la observación meditativa de regreso a la ejecución activa de tareas.

1. Resumir las observaciones clave: cuál fue el clima cognitivo, qué patrones se notaron
2. Identificar un ajuste específico para llevar adelante (no una resolución vaga sino un cambio concreto)
3. Reestablecer el ancla para el siguiente período de trabajo
4. Si se está entre tareas, declarar la disposición claramente: "Despejado y disponible para la siguiente solicitud"
5. Si se continúa una tarea, declarar la siguiente acción específica: "Siguiente: [paso concreto]"

**Esperado:** Una transición limpia de la reflexión a la acción. Un ajuste concreto identificado. El ancla está clara. Sin pesadez residual ni metanálisis.

**En caso de fallo:** Si la meditación reveló complejidad sin resolver, puede necesitar el proceso de autoevaluación de `heal` en lugar de un simple establecimiento de intención. Si la meta-observación creó más confusión que claridad, retornar a la versión más simple posible: "Cuál es la siguiente acción concreta" y hacerla.

## Validación

- [ ] El contexto anterior fue explícitamente despejado o marcado antes de comenzar
- [ ] Se formuló una declaración ancla que es específica y accionable
- [ ] Los patrones de distracción fueron observados y etiquetados, no suprimidos
- [ ] Se identificó al menos un sesgo o patrón de razonamiento con evidencia específica
- [ ] La sesión cerró con una siguiente acción concreta, no con una intención vaga
- [ ] El proceso mejoró la calidad del trabajo posterior (verificable en la siguiente interacción)

## Errores Comunes

- **Meditar en lugar de trabajar**: Esta es una herramienta para mejorar la calidad del trabajo, no un sustituto del trabajo en sí. Mantener las sesiones breves (equivalente a 5-10 minutos de reflexión) y retornar a la ejecución de tareas
- **Meta-bucles infinitos**: Observar al observador que observa al observador. Romper el bucle tomando una acción concreta
- **Usar la meditación para evitar tareas difíciles**: Si la meditación siempre se activa antes del trabajo difícil, el patrón de evitación es el hallazgo real
- **Sobre-etiquetar**: No todo pensamiento es una distracción. El pensamiento productivo y relevante a la tarea es la meta, no la quietud vacía
- **Omitir el ancla**: Sin un punto claro de enfoque, la observación no tiene marco de referencia: distracción de qué

## Habilidades Relacionadas

- `meditate-guidance` — la variante de guía humana para conducir a una persona a través de técnicas de meditación
- `heal` — autosanación de IA para evaluación de subsistemas cuando la meditación revela una desviación más profunda
- `remote-viewing` — abordar problemas sin preconcepciones, se apoya en las habilidades de observación desarrolladas aquí
