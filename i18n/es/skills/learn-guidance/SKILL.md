---
name: learn-guidance
description: >
  Guiar a una persona a través del aprendizaje estructurado de un nuevo tema,
  tecnología o habilidad. La IA actúa como coach de aprendizaje — evaluando
  el conocimiento actual, diseñando una ruta de aprendizaje, recorriendo el
  material, probando la comprensión, adaptando la dificultad y planificando
  sesiones de repaso para la retención. Usar cuando una persona quiere aprender
  una nueva tecnología y no sabe por dónde empezar, cuando alguien se siente
  abrumado por la documentación, cuando una persona sigue olvidando el material
  y necesita repetición espaciada, o al hacer la transición entre dominios y
  necesitar un análisis de brechas.
license: MIT
allowed-tools: Read WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, learning, coaching, education, structured-learning, guidance
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Learn (Guidance)

Guiar a una persona a través de un proceso de aprendizaje estructurado para un nuevo tema, tecnología o habilidad. La IA actúa como coach de aprendizaje — ayudando a evaluar el conocimiento inicial, planificar una ruta de estudio, recorrer el material al ritmo adecuado, probar la comprensión con preguntas, adaptar el enfoque basándose en la retroalimentación y consolidar para la retención.

## Cuándo Usar

- Una persona quiere aprender una nueva tecnología, framework, lenguaje o concepto y no sabe por dónde empezar
- Alguien se siente abrumado por la documentación o los recursos de aprendizaje y necesita una ruta estructurada
- Una persona sigue olvidando el material y necesita orientación sobre repetición espaciada
- Alguien está haciendo la transición entre dominios (ej., backend a frontend) y necesita un análisis de brechas
- Una persona quiere responsabilidad y estructura para el aprendizaje autodirigido
- Después de que `meditate-guidance` ha limpiado el ruido mental, creando espacio para el aprendizaje enfocado

## Entradas

- **Requerido**: Lo que la persona quiere aprender (tema, tecnología, habilidad o concepto)
- **Requerido**: Su propósito para aprender (requisito laboral, interés personal, necesidad de proyecto, cambio de carrera)
- **Opcional**: Nivel de conocimiento actual en esta área (autoevaluado o demostrado)
- **Opcional**: Tiempo disponible para aprender (horas por día/semana, fecha límite si existe)
- **Opcional**: Estilo de aprendizaje preferido (lectura, práctico, video, discusión)
- **Opcional**: Intentos previos fallidos de aprender este tema (qué no funcionó antes)

## Procedimiento

### Paso 1: Evaluar — Determinar la posición inicial

Antes de diseñar una ruta de aprendizaje, comprender dónde se encuentra actualmente la persona.

1. Preguntar sobre su experiencia con el tema: "¿Qué sabes ya sobre X?"
2. Preguntar sobre conocimiento adyacente: "¿Qué temas relacionados conoces?" (estos se convierten en puentes)
3. Si afirman tener algún conocimiento, hacer una pregunta de calibración que revele profundidad vs. familiaridad superficial
4. Notar su vocabulario: ¿usan los términos del dominio correctamente, aproximadamente o no los usan en absoluto?
5. Identificar su objetivo de aprendizaje específicamente: "Después de aprender esto, ¿qué quieres ser capaz de hacer?"
6. Identificar su motivación principal: curiosidad, necesidad práctica, avance profesional o proyecto creativo

```
Starting Position Assessment:
┌───────────────┬────────────────────────────┬──────────────────────────┐
│ Level Found   │ Indicators                 │ Path Approach            │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ No exposure   │ No vocabulary, no mental   │ Start with "what" and    │
│               │ model, everything is new   │ "why" before "how"       │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Surface       │ Has heard terms, no hands- │ Fill vocabulary gaps,    │
│ awareness     │ on experience, vague model │ then move to hands-on    │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Partial       │ Some experience, gaps in   │ Identify specific gaps   │
│ knowledge     │ understanding, can do some │ and target them directly │
│               │ things but not others      │                          │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Refresher     │ Knew it before, now rusty  │ Quick review + practice  │
│ needed        │                            │ to reactivate knowledge  │
└───────────────┴────────────────────────────┴──────────────────────────┘
```

**Esperado:** Una imagen clara de la posición inicial, objetivo y restricciones de la persona. La evaluación debe ser cálida y alentadora, no como un examen — enmarcar las preguntas como curiosidad sobre su experiencia.

**En caso de fallo:** Si la persona no puede articular su nivel actual, pedirle que describa un intento reciente de usar o comprender el tema. Las historias concretas revelan el nivel con más precisión que la autoevaluación. Si están avergonzados por su nivel, normalizar: "Todos empiezan en algún punto — saber dónde estás me ayuda a diseñar la mejor ruta para ti."

### Paso 2: Planificar — Diseñar la ruta de aprendizaje

Crear una ruta estructurada desde su posición actual hasta su objetivo.

1. Dividir el tema en 4-7 hitos de aprendizaje (ni demasiado granulares, ni demasiado vagos)
2. Ordenar los hitos por dependencia: ¿qué debe entenderse antes de qué?
3. Para cada hito, identificar el concepto central (lo que necesitan entender) y la habilidad central (lo que necesitan poder hacer)
4. Estimar el tiempo por hito basándose en sus horas disponibles
5. Identificar el primer hito — aquí es donde comienza el aprendizaje
6. Incorporar victorias tempranas: el primer hito debe ser alcanzable rápidamente para generar impulso
7. Presentar la ruta visualmente: una lista numerada con descripciones breves

**Esperado:** Una ruta de aprendizaje que la persona pueda ver y entender. Debe sentirse manejable — no abrumadora. La persona debe poder señalar cualquier hito y entender por qué está ahí.

**En caso de fallo:** Si la ruta se siente demasiado larga, el objetivo puede ser demasiado ambicioso para el tiempo disponible — discutir la reducción de alcance. Si la ruta se siente demasiado corta, el tema puede ser más simple de lo esperado — o los hitos son demasiado amplios y necesitan descomposición.

### Paso 3: Guiar — Recorrer el material

Para cada hito, guiar a la persona a través del material al ritmo adecuado.

1. Introducir el concepto del hito con una breve descripción general: "En esta sección, aprenderemos X, que te permite hacer Y"
2. Presentar el material en fragmentos pequeños — un concepto por fragmento
3. Usar el estilo de aprendizaje preferido de la persona: lectura → proporcionar texto; práctico → proporcionar ejercicios; discusión → usar preguntas socráticas
4. Conectar cada nuevo concepto con algo que ya conocen (de la evaluación)
5. Proporcionar ejemplos concretos antes de definiciones abstractas
6. Si se usa documentación, guiarlos a través de las secciones relevantes en lugar de enviarlos a leer solos
7. Pausar después de cada fragmento: "¿Tiene sentido hasta aquí?"

**Esperado:** La persona progresa a través del material con comprensión, no solo exposición. Deben poder explicar cada concepto con sus propias palabras antes de pasar al siguiente. El ritmo se siente correcto — ni apresurado, ni arrastrado.

**En caso de fallo:** Si están teniendo dificultades, reducir la velocidad y verificar prerrequisitos faltantes. Si están avanzando rápidamente, acelerar — no desperdiciar su tiempo en lo que ya dominan. Si el material en sí es confuso (mala documentación), proporcionar una explicación más clara y notar la calidad del recurso para referencia futura.

### Paso 4: Probar — Verificar la comprensión

Verificar el aprendizaje con preguntas que requieran aplicación, no solo recuerdo.

1. Hacer preguntas de predicción: "¿Qué pasaría si cambiaras X?"
2. Hacer preguntas de comparación: "¿En qué se diferencia esto de Y, que aprendiste antes?"
3. Hacer preguntas de aplicación: "¿Cómo usarías esto para resolver Z?"
4. Hacer preguntas de depuración: "Este código tiene un error relacionado con lo que acabamos de aprender — ¿puedes encontrarlo?"
5. Celebrar las respuestas correctas específicamente: "Sí — y la razón por la que funciona es..."
6. Para respuestas incorrectas, explorar su razonamiento: "Interesante — guíame a través de tu pensamiento"
7. Nunca enmarcar las respuestas incorrectas como fracaso — son información diagnóstica

**Esperado:** Las pruebas revelan si la persona tiene un modelo mental funcional o un recuerdo superficial. Los modelos funcionales pueden manejar variaciones; el recuerdo superficial no puede. Las pruebas deben sentirse como un ejercicio colaborativo, no como un examen.

**En caso de fallo:** Si la persona no puede responder preguntas de aplicación, el aprendizaje fue demasiado pasivo — necesitan práctica con las manos antes de más material. Si responden preguntas de recuerdo pero no de aplicación, los conceptos fueron entendidos individualmente pero no integrados — enfocarse en las conexiones entre conceptos.

### Paso 5: Adaptar — Ajustar la ruta

Basándose en los resultados de las pruebas y la retroalimentación de la persona, ajustar la ruta de aprendizaje.

1. Si un hito fue fácil: considerar combinarlo con el siguiente, o profundizar el contenido
2. Si un hito fue difícil: dividirlo en pasos más pequeños, o agregar repaso de prerrequisitos
3. Si el interés de la persona cambia durante el aprendizaje: ajustar la ruta para seguir su curiosidad donde sea posible — el compromiso impulsa la retención
4. Si están fatigados: sugerir un descanso y una sesión de repaso posterior en lugar de insistir
5. Si un enfoque particular de enseñanza no está funcionando: probar una modalidad diferente (cambiar de lectura a práctica, o de abstracto a concreto)
6. Actualizar la ruta de aprendizaje y comunicar los cambios: "Basándome en cómo fue esto, sugiero que ajustemos..."

**Esperado:** La ruta de aprendizaje evoluciona basándose en datos reales. Ningún currículo fijo sobrevive al contacto con un aprendiz real — la adaptación es el valor.

**En caso de fallo:** Si las adaptaciones repetidas siguen dejando a la persona con dificultades, puede haber una brecha fundamental de prerrequisitos que no fue detectada en la evaluación. Regresar al Paso 1 y profundizar más. Si la persona está perdiendo motivación, discutir el objetivo original — a veces ajustar el objetivo es más apropiado que cambiar la ruta.

### Paso 6: Repasar — Consolidar y planificar la siguiente sesión

Solidificar lo aprendido y preparar para el aprendizaje continuo.

1. Resumir lo cubierto: "Hoy aprendimos X, Y y Z"
2. Pedirles que expresen la conclusión clave con sus propias palabras
3. Proporcionar un breve ejercicio de práctica para trabajo independiente (no tarea — refuerzo opcional)
4. Recomendar 2-3 recursos para exploración adicional (documentación, tutoriales, ejemplos)
5. Si se usa repetición espaciada: programar puntos de repaso — "Repasa estos conceptos de nuevo en 2 días, luego en una semana"
6. Preparar el siguiente hito: "La próxima vez, abordaremos..."
7. Pedir retroalimentación: "¿Qué funcionó bien? ¿Qué podría hacer diferente?"

**Esperado:** La persona se va con una comprensión clara de lo que aprendió, lo que puede practicar y lo que viene después. La sesión tiene un cierre limpio, no una parada abrupta.

**En caso de fallo:** Si la persona no puede expresar una conclusión clave, la sesión cubrió demasiado o muy poco quedó grabado. Identificar el concepto que más necesita refuerzo y enfocar el repaso en eso. Si no tienen motivación para la práctica independiente, la ruta de aprendizaje puede necesitar ser más autónoma (todo el aprendizaje dentro de las sesiones).

## Validación

- [ ] La posición inicial fue evaluada antes de diseñar la ruta de aprendizaje
- [ ] La ruta de aprendizaje tiene hitos claros ordenados por dependencia
- [ ] El material fue presentado en fragmentos pequeños con verificaciones de comprensión entre ellos
- [ ] Las pruebas usaron preguntas de aplicación, no solo de recuerdo
- [ ] La ruta fue adaptada al menos una vez basándose en el progreso real de la persona
- [ ] La sesión terminó con un resumen, sugerencia de práctica y próximos pasos
- [ ] La persona se sintió alentada durante todo el proceso, no examinada ni juzgada

## Errores Comunes

- **Sobrecarga de información**: Proporcionar todo el material de una vez en lugar de dosificarlo a través de hitos. La sobrecarga mata el aprendizaje
- **Omitir la evaluación**: Asumir el nivel de la persona en lugar de verificarlo. Un experto en frontend aprendiendo backend puede conocer conceptos adyacentes pero no los que esperas
- **Enseñar al promedio**: Si la persona es más rápida o más lenta de lo esperado, el ritmo debe cambiar — mantener el plan a pesar de la retroalimentación desperdicia su tiempo o los pierde
- **Todo teoría, nada de práctica**: La comprensión requiere hacer, no solo escuchar. Cada hito debe incluir un elemento práctico
- **Ignorar la motivación**: Una persona que no ve por qué un concepto importa no lo retendrá. Conectar cada concepto con su objetivo declarado
- **Sobrecargar las sesiones**: Intentar cubrir demasiado en una sola sesión. Es mejor cubrir menos con retención que más con olvido
- **Coach como conferencista**: El coach guía la exploración del aprendiz, no entrega un monólogo. Hacer más preguntas de las que se responden

## Habilidades Relacionadas

- `learn` — la variante autodirigida de la IA para adquisición sistemática de conocimiento
- `teach-guidance` — coaching para que una persona enseñe a otros; complementario al coaching de aprendizaje
- `meditate-guidance` — limpiar el ruido mental antes de una sesión de aprendizaje mejora el enfoque y la retención
- `remote-viewing-guidance` — comparte el enfoque de observación estructurada que apoya el aprendizaje desde la experiencia
