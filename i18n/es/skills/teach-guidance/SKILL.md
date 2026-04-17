---
name: teach-guidance
description: >
  Guiar a una persona para convertirse en un mejor profesor y comunicador. La IA
  coaching sobre estructuración de contenido, calibración de audiencia, claridad
  de explicación, técnica de preguntas socráticas, interpretación de
  retroalimentación y práctica reflexiva para presentaciones técnicas,
  documentación y mentoría. Usar cuando una persona necesita presentar contenido
  técnico y quiere coaching de preparación, quiere escribir mejor documentación
  o tutoriales, tiene dificultades para explicar conceptos a diferentes niveles
  de expertise, está mentoreando a un colega, o se está preparando para una
  charla o sesión de intercambio de conocimiento.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, teaching, coaching, presentation, documentation, explanation, guidance
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Teach (Guidance)

Guiar a una persona para convertirse en un profesor, comunicador o presentador más efectivo. La IA actúa como coach de enseñanza — ayudando a evaluar qué necesita ser comunicado y a quién, estructurando contenido para claridad, ensayando explicaciones, refinando basándose en retroalimentación, apoyando la entrega y reflexionando sobre qué funcionó.

## Cuándo Usar

- Una persona necesita presentar contenido técnico a una audiencia y quiere prepararse efectivamente
- Alguien quiere escribir mejor documentación, tutoriales o explicaciones
- Una persona tiene dificultades para explicar conceptos a personas con diferentes niveles de expertise
- Alguien está mentoreando a un colega o desarrollador junior y quiere ser más efectivo
- Una persona se está preparando para una charla, taller o sesión de intercambio de conocimiento
- Después de que `learn-guidance` les ayudó a adquirir conocimiento, ahora necesitan transferirlo a otros

## Entradas

- **Requerido**: Lo que la persona necesita enseñar o explicar (tema, concepto, sistema, proceso)
- **Requerido**: Quién es la audiencia (nivel de expertise, contexto, relación con la persona)
- **Opcional**: Formato de entrega (presentación, documentación, mentoría uno a uno, taller)
- **Opcional**: Restricciones de tiempo (explicación de 5 minutos, charla de 30 minutos, documento escrito)
- **Opcional**: Intentos previos de enseñanza y qué no funcionó
- **Opcional**: El nivel de comodidad de la persona con el tema (experto profundo vs. aprendiz reciente)

## Procedimiento

### Paso 1: Evaluar — Comprender el desafío de enseñanza

Antes de estructurar el contenido, comprender el contexto completo de la situación de enseñanza.

1. Preguntar qué necesitan enseñar y por qué: "¿Qué concepto necesita calar, y qué pasa si no lo hace?"
2. Identificar la audiencia: "¿A quién le vas a explicar esto? ¿Qué saben ya?"
3. Evaluar la propia comprensión de la persona: ¿conocen el tema lo suficientemente profundo para enseñarlo? (Si no, sugerir `learn-guidance` primero)
4. Identificar el formato: presentación, documento, conversación, revisión de código, programación en pares
5. Determinar criterios de éxito: "¿Cómo sabrás que la audiencia entendió?"
6. Sacar a la superficie miedos o preocupaciones: "¿Qué parte de esto te pone más nervioso?"

```
Teaching Challenge Matrix:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Challenge Type   │ Indicators               │ Focus Area               │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Knowledge gap    │ "I sort of know it       │ Deepen their own under-  │
│                  │ but can't explain it"     │ standing first (learn)   │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Audience gap     │ "I don't know what       │ Build audience empathy   │
│                  │ they already know"        │ and calibration          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Structure gap    │ "I know it all but       │ Organize content into    │
│                  │ don't know where to       │ a narrative arc          │
│                  │ start"                    │                          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Confidence gap   │ "What if they ask        │ Practice and preparation │
│                  │ something I can't         │ for edge cases           │
│                  │ answer?"                  │                          │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

**Esperado:** Una imagen clara del desafío de enseñanza: qué, a quién, en qué formato, con qué restricciones y dónde la persona se siente menos segura.

**En caso de fallo:** Si la persona no puede articular su audiencia, ayudarle a crear una persona: "Imagina a una persona específica que escuchará esto. ¿Qué saben? ¿Qué les importa?" Si no pueden articular el tema, puede que necesiten aprenderlo más profundamente primero.

### Paso 2: Estructurar — Organizar el contenido para claridad

Ayudar a la persona a construir una estructura narrativa clara para su explicación.

1. Identificar el mensaje central único: "Si la audiencia recuerda solo una cosa, ¿cuál debería ser?"
2. Construir hacia afuera desde el centro: ¿qué contexto se necesita antes del mensaje central, y qué detalles siguen después?
3. Aplicar la pirámide invertida: la información más importante primero, detalles de soporte después
4. Para contenido técnico, elegir un patrón estructural:
   - **Explicación de concepto**: Qué → Por qué → Cómo → Ejemplo → Casos límite
   - **Tutorial**: Objetivo → Prerrequisitos → Pasos → Verificación → Próximos pasos
   - **Visión general de arquitectura**: Problema → Restricciones → Solución → Compensaciones → Alternativas consideradas
   - **Recorrido de depuración**: Síntoma → Investigación → Causa raíz → Corrección → Prevención
5. Asegurar que cada sección tenga un propósito claro: si una sección no sirve al mensaje central, cortarla
6. Planificar transiciones: "Cubrimos X. Ahora, construyendo sobre eso, necesitamos entender Y porque..."

**Esperado:** Un esquema estructurado donde cada elemento sirve al mensaje central. La estructura debe sentirse lógica e inevitable — cada sección conduce naturalmente a la siguiente.

**En caso de fallo:** Si la estructura sigue creciendo, el alcance es demasiado amplio — ayudarles a recortar. Si la estructura se siente plana (todo al mismo nivel), la jerarquía necesita trabajo — identificar qué puntos son principales y cuáles son de soporte. Si resisten la estructura ("lo explicaré naturalmente"), notar que las explicaciones naturales funcionan para temas simples pero fallan para los complejos — la estructura es el andamio.

### Paso 3: Practicar — Ensayar la explicación

Hacer que la persona practique explicando el concepto, con la IA actuando como audiencia.

1. Pedirles que expliquen el concepto como lo harían ante su audiencia real
2. Escuchar sin interrumpir en la primera pasada — dejarlos encontrar su flujo natural
3. Notar dónde la explicación es clara y dónde se vuelve confusa o vaga
4. Notar dónde usan jerga que la audiencia podría no conocer
5. Notar dónde saltan pasos o asumen conocimiento que la audiencia puede no tener
6. Notar dónde pasan demasiado tiempo en las partes fáciles y apresuran las difíciles
7. Cronometrar la explicación si hay una restricción de tiempo

**Esperado:** Una explicación de primer borrador que revela los patrones naturales de enseñanza de la persona — fortalezas sobre las cuales construir y hábitos por ajustar. La práctica debe sentirse de bajo riesgo: "Esto es un borrador, no una actuación."

**En caso de fallo:** Si la persona se bloquea o dice "No sé por dónde empezar," regresar a la estructura del Paso 2 y hacer que expliquen una sección a la vez en lugar de todo completo. Si son excesivamente autocríticos ("eso fue terrible"), redirigir a específicos: "En realidad, la forma en que explicaste X fue muy clara — enfoquémonos en que Y iguale esa calidad."

### Paso 4: Refinar — Mejorar basándose en retroalimentación

Proporcionar retroalimentación específica y accionable sobre la explicación de práctica.

1. Empezar con las fortalezas: "La parte donde explicaste X usando la analogía de Y fue muy efectiva porque..."
2. Identificar la mayor oportunidad de mejora (no todos los problemas — enfocarse en uno o dos)
3. Sugerir alternativas específicas: "En lugar de decir [versión compleja], intenta: [versión más simple]"
4. Verificar la maldición del conocimiento: ¿hay lugares donde su expertise los hace saltar pasos que la audiencia necesita?
5. Verificar la calibración de audiencia: ¿la profundidad es correcta para la audiencia, o es demasiado superficial/profunda?
6. Si usan analogías, verificar si las analogías son precisas (las analogías engañosas son peores que no tener analogía)
7. Hacer que re-expliquen la sección refinada para probar la mejora

**Esperado:** Retroalimentación dirigida que mejora la explicación de manera medible. La persona puede sentir la diferencia entre el primer y segundo intento. La retroalimentación se enmarca constructivamente — qué hacer, no solo qué evitar.

**En caso de fallo:** Si la persona está a la defensiva con la retroalimentación, reformular de "esto no fue claro" a "la audiencia podría no seguir aquí — ¿cómo podríamos hacerlo aún más claro?" Si la versión refinada no es mejor, el problema puede ser estructural (Paso 2) en lugar de de presentación — regresar al esquema.

### Paso 5: Entregar — Apoyar durante la enseñanza

Si la enseñanza ocurre en tiempo real, proporcionar apoyo durante la entrega.

1. Para presentaciones en vivo: ayudar a preparar respuestas a preguntas probables por anticipado
2. Para documentación: revisar la versión escrita para claridad, estructura y calibración de audiencia
3. Ayudarles a prepararse para el momento del "no lo sé": "Si te preguntan algo que no puedes responder, di: 'Excelente pregunta — lo investigaré y daré seguimiento.' Esto siempre es aceptable."
4. Fomentar la interacción: ayudarles a preparar preguntas de verificación para la audiencia
5. Preparar planes de recuperación: qué hacer si la audiencia se pierde, se aburre o va adelante de la explicación
6. Si se hace coaching durante la entrega: proporcionar indicaciones breves y específicas ("ve más lento aquí," "parecen confundidos — verifica con ellos")

**Esperado:** La persona se siente preparada y apoyada. Tienen respuestas para preguntas probables, estrategias para situaciones inesperadas y confianza en que no saberlo todo es aceptable.

**En caso de fallo:** Si la ansiedad es el bloqueador principal, abordarla directamente: la preparación reduce la ansiedad, y reconocer el nerviosismo ante la audiencia a menudo crea conexión. Si el formato de entrega sigue cambiando, ayudarles a aceptar el formato y adaptarse en lugar de intentar controlar las condiciones.

### Paso 6: Reflexionar — Analizar qué funcionó

Después del evento de enseñanza, guiar la reflexión para la mejora continua.

1. Preguntar: "¿Qué salió bien? ¿De qué estás orgulloso?"
2. Preguntar: "¿Dónde notaste que la audiencia estaba más comprometida? ¿Menos comprometida?"
3. Preguntar: "¿Algo te sorprendió sobre la respuesta de la audiencia?"
4. Preguntar: "Si pudieras cambiar una cosa, ¿cuál sería?"
5. Conectar la reflexión con principios: "La parte que funcionó usó [técnica]. Puedes aplicar eso más ampliamente."
6. Identificar un objetivo de mejora específico para la próxima vez
7. Celebrar el logro: enseñar es una habilidad que mejora con la práctica

**Esperado:** La persona obtiene una percepción concreta sobre su efectividad como profesor — no sentimientos vagos sino observaciones específicas sobre qué funcionó y por qué. Se van con una mejora accionable para la próxima vez.

**En caso de fallo:** Si solo ven aspectos negativos, redirigir a momentos específicos que funcionaron. Si solo ven aspectos positivos, sondear gentilmente las áreas donde la audiencia estaba confundida. Si no ocurre reflexión (pasan a otra cosa inmediatamente), notar que la reflexión es donde ocurre la mejora más duradera — incluso 5 minutos de repaso importan.

## Validación

- [ ] El desafío de enseñanza fue evaluado antes de comenzar la estructuración (audiencia, formato, restricciones)
- [ ] Un mensaje central fue identificado y la estructura organizada alrededor de él
- [ ] La persona practicó la explicación al menos una vez antes de la entrega
- [ ] La retroalimentación fue específica, accionable y condujo a mejora medible
- [ ] La persona estaba preparada para preguntas, incertidumbre y adaptación a la audiencia
- [ ] La reflexión post-entrega identificó al menos una mejora específica para la próxima vez
- [ ] El coaching fue alentador durante todo el proceso — enseñar es difícil y debe ser reconocido

## Errores Comunes

- **Hacer coaching del contenido, no de la enseñanza**: Ayudarles a aprender el material en lugar de ayudarles a presentarlo. Si necesitan aprender, usar `learn-guidance` primero
- **Sobre-estructurar**: Hacer la estructura tan rígida que la voz natural de enseñanza de la persona se pierde. La estructura debe apoyar su estilo, no reemplazarlo
- **Trampa del perfeccionismo**: Ensayar interminablemente en lugar de entregar. En algún punto, la práctica tiene rendimientos decrecientes — impulsar hacia la entrega
- **Ignorar la diversidad de audiencia**: Una audiencia mixta necesita explicación por capas — idea central para todos, detalles para expertos, analogías para novatos
- **Sobrecarga de retroalimentación**: Dar demasiadas notas a la vez abruma. Enfocarse en el uno o dos cambios con mayor impacto
- **Descuidar la preparación emocional**: La ansiedad de enseñar es real. Abordar la confianza es tan importante como abordar el contenido

## Habilidades Relacionadas

- `teach` — la variante autodirigida de la IA para transferencia calibrada de conocimiento
- `learn-guidance` — coaching para que una persona aprenda; el prerrequisito para enseñar efectivamente
- `listen-guidance` — las habilidades de escucha activa ayudan a los profesores a responder a las necesidades de la audiencia en tiempo real
- `meditate-guidance` — calmar la ansiedad y lograr enfoque antes de un evento de enseñanza
