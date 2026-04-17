---
name: forage-solutions
description: >
  Exploración de soluciones por IA usando optimización de colonia de hormigas —
  desplegando hipótesis exploradoras, reforzando enfoques prometedores, detectando
  rendimientos decrecientes y sabiendo cuándo abandonar una estrategia. Usar al
  enfrentar un problema con múltiples enfoques plausibles y ningún ganador claro,
  cuando el primer enfoque no está funcionando pero las alternativas no son claras,
  al depurar sin causa raíz obvia requiriendo investigación paralela de hipótesis,
  o cuando intentos previos han convergido prematuramente en un enfoque subóptimo.
license: MIT
allowed-tools: Read Glob Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, foraging, solution-search, exploration-exploitation, meta-cognition, ai-self-application
  locale: es
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# Forage Solutions

Explorar un espacio de soluciones usando principios de optimización de colonia de hormigas — desplegando hipótesis independientes como exploradores, reforzando enfoques prometedores a través de la evidencia, detectando rendimientos decrecientes y sabiendo cuándo abandonar una estrategia y explorar en otro lugar.

## Cuándo Usar

- Enfrentar un problema con múltiples enfoques plausibles y ningún ganador claro
- Cuando el primer enfoque intentado no está funcionando pero las alternativas no son claras
- Depurar sin causa raíz obvia — múltiples hipótesis necesitan investigación paralela
- Buscar en un código base la fuente de un comportamiento cuando la ubicación es desconocida
- Cuando intentos previos de solución han convergido prematuramente en un enfoque subóptimo
- Complementar `build-coherence` cuando el espacio de soluciones debe explorarse antes de tomar una decisión

## Entradas

- **Requerido**: Descripción del problema u objetivo (¿qué estamos buscando?)
- **Requerido**: Estado actual de conocimiento (¿qué se sabe ya?)
- **Opcional**: Enfoques previos intentados y sus resultados
- **Opcional**: Restricciones en la exploración (presupuesto de tiempo, disponibilidad de herramientas)
- **Opcional**: Nivel de urgencia (afecta el equilibrio exploración-explotación)

## Procedimiento

### Paso 1: Mapear el paisaje de soluciones

Antes de desplegar exploradores, caracterizar la forma del espacio de soluciones.

```
Solution Distribution Types:
┌────────────────────┬──────────────────────────────────────────────────┐
│ Type               │ Characteristics and Strategy                     │
├────────────────────┼──────────────────────────────────────────────────┤
│ Concentrated       │ One correct answer exists (bug fix, syntax       │
│ (one right fix)    │ error). Deploy many scouts quickly to locate     │
│                    │ it. Exploit immediately when found               │
├────────────────────┼──────────────────────────────────────────────────┤
│ Distributed        │ Multiple valid approaches (architecture choice,  │
│ (many valid paths) │ implementation strategy). Scouts assess quality  │
│                    │ of each. Use `build-coherence` to choose         │
├────────────────────┼──────────────────────────────────────────────────┤
│ Ephemeral          │ Solutions depend on timing or sequence (race     │
│ (time-sensitive)   │ conditions, order-dependent bugs). Fast scouting │
│                    │ with immediate exploitation. Cannot revisit       │
├────────────────────┼──────────────────────────────────────────────────┤
│ Nested             │ Solving the surface problem reveals a deeper one │
│ (layers of cause)  │ (config issue masking an architecture problem).  │
│                    │ Scout at each layer before committing to depth   │
└────────────────────┴──────────────────────────────────────────────────┘
```

Clasificar el problema actual. El tipo de distribución determina cuántos exploradores desplegar y qué tan rápido cambiar de exploración a explotación.

**Esperado:** Una caracterización clara del paisaje de soluciones que informa la estrategia de exploración. La clasificación debe sentirse precisa para el problema, no forzada.

**En caso de fallo:** Si el paisaje es completamente desconocido, esa misma es la clasificación — tratarlo como potencialmente distribuido y desplegar exploradores amplios. La primera ronda de exploración revelará el carácter del paisaje.

### Paso 2: Desplegar hipótesis exploradoras

Generar hipótesis independientes como exploradores. Cada explorador sondea el espacio de soluciones en una dirección diferente.

1. Generar 3-5 hipótesis independientes sobre el problema o su solución
2. Para cada hipótesis, definir una prueba barata — una sola lectura de archivo, un grep, una verificación específica
3. Calificar la promesa inicial basándose en evidencia disponible (no en intuición)
4. Desplegar exploradores independientemente: no dejar que la evaluación de la hipótesis A influya la prueba de la hipótesis B

```
Scout Deployment Template:
┌───────┬──────────────────────┬──────────────────────┬──────────┐
│ Scout │ Hypothesis           │ Test (one action)    │ Promise  │
├───────┼──────────────────────┼──────────────────────┼──────────┤
│ 1     │                      │                      │ High/Med/│
│ 2     │                      │                      │ Low      │
│ 3     │                      │                      │          │
│ 4     │                      │                      │          │
│ 5     │                      │                      │          │
└───────┴──────────────────────┴──────────────────────┴──────────┘
```

Principio clave: los exploradores evalúan, no explotan. El objetivo es una señal rápida sobre cada hipótesis, no una investigación profunda de la primera que se ve prometedora.

**Esperado:** 3-5 hipótesis independientes con pruebas baratas definidas. Ninguna hipótesis ha sido explorada profundamente aún — esta es una pasada de amplitud primero.

**En caso de fallo:** Si se pueden generar menos de 3 hipótesis, el problema es o muy restringido (tipo concentrado — bueno, explorar agresivamente) o la comprensión es demasiado superficial (leer más contexto antes de hipotetizar). Si las hipótesis no son independientes (son todas variaciones de la misma idea), la exploración es demasiado estrecha — forzar al menos una hipótesis que contradiga las otras.

### Paso 3: Refuerzo de rastros — Seguir la evidencia

Después de que los resultados de los exploradores regresen, reforzar rastros prometedores y dejar que los débiles decaigan.

1. Revisar los resultados de los exploradores: ¿qué hipótesis encontraron evidencia de soporte?
2. **Evidencia fuerte encontrada** → reforzar el rastro: invertir más esfuerzo de investigación aquí
3. **Sin evidencia encontrada** → dejar que el rastro decaiga: no investigar más sin nuevas señales
4. **Evidencia contradictoria encontrada** → marcar como señal de inhibición: evitar activamente este camino
5. Monitorear convergencia prematura: si todo el esfuerzo fluye al primer rastro reforzado, forzar un explorador hacia territorio no explorado

```
Trail Reinforcement Decision:
┌───────────────────────────┬──────────────────────────────────────┐
│ Scout Result              │ Action                               │
├───────────────────────────┼──────────────────────────────────────┤
│ Strong supporting evidence│ REINFORCE — deepen investigation     │
│ Weak supporting evidence  │ HOLD — one more cheap test before    │
│                           │ committing                           │
│ No evidence               │ DECAY — deprioritize, scout elsewhere│
│ Contradicting evidence    │ INHIBIT — mark as dead end           │
│ Ambiguous result          │ REFINE — hypothesis was too vague,   │
│                           │ sharpen and re-scout                 │
└───────────────────────────┴──────────────────────────────────────┘
```

**Esperado:** Una priorización clara de rastros basada en evidencia, no en preferencia. El rastro más fuerte recibe la mayor atención, pero al menos una alternativa permanece viva.

**En caso de fallo:** Si todos los exploradores regresan vacíos, las hipótesis estaban equivocadas — no el enfoque. Reformular la pregunta: "¿Qué suposiciones estoy haciendo que podrían estar equivocadas?" Generar nuevas hipótesis desde un ángulo diferente. Si todos los exploradores regresan con señales fuertes, el problema puede ser distribuido (múltiples respuestas válidas) — cambiar a `build-coherence` para selección de enfoque.

### Paso 4: Teorema del valor marginal — Saber cuándo irse

Monitorear el rendimiento del enfoque actual. Cuando la información ganada por unidad de esfuerzo cae por debajo del promedio de todos los enfoques, es hora de cambiar.

```
Marginal Value Assessment:
┌────────────────────────┬──────────────────────────────────────────┐
│ Signal                 │ Action                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ New information per    │ CONTINUE — this trail is productive      │
│ action is high         │                                          │
├────────────────────────┼──────────────────────────────────────────┤
│ New information per    │ PREPARE TO SWITCH — squeeze remaining    │
│ action is declining    │ value, begin scouting alternatives       │
├────────────────────────┼──────────────────────────────────────────┤
│ Last 2-3 actions       │ SWITCH — the trail is depleted. The cost │
│ yielded nothing new    │ of staying exceeds the cost of switching │
├────────────────────────┼──────────────────────────────────────────┤
│ Information contradicts│ SWITCH IMMEDIATELY — not just depleted   │
│ earlier findings       │ but misleading. Cut losses               │
└────────────────────────┴──────────────────────────────────────────┘
```

Importante: factorizar el costo de cambio. Moverse a una nueva hipótesis significa cargar nuevo contexto, lo cual tiene un costo. No cambiar por ganancias marginales — cambiar cuando el rastro actual está claramente agotado.

**Esperado:** Una decisión deliberada de continuar o cambiar basada en evaluación de rendimiento, no en hábito o frustración. Los cambios están basados en evidencia, no impulsados por impulso.

**En caso de fallo:** Si el cambio sucede demasiado frecuentemente (oscilación entre hipótesis), el costo de cambio está siendo subvalorado. Comprometerse con el rastro actual por N acciones más antes de reevaluar. Si el cambio nunca sucede (atrapado en un rastro a pesar de rendimiento decreciente), establecer un límite duro: después de N acciones improductivas, cambiar independientemente del costo hundido.

### Paso 5: Adaptar la estrategia a los resultados

Basándose en los resultados del forrajeo, seleccionar la siguiente fase apropiada.

1. **La mayoría de exploradores vacíos, un rastro débil** → el problema probablemente está mal enmarcado. Retroceder y reformular: ¿qué pregunta deberíamos estar haciendo?
2. **Un rastro fuerte, otros vacíos** → problema concentrado. Explotar el rastro fuerte con atención completa
3. **Múltiples rastros compitiendo** → problema distribuido. Aplicar `build-coherence` para seleccionar entre ellos
4. **Ganador claro emergiendo** → transición de exploración a explotación. Reducir presupuesto de exploración al 10-20% (mantener un explorador activo para alternativas), comprometer el esfuerzo principal al enfoque ganador
5. **Todos los rastros agotados** → la solución puede no existir en el espacio de búsqueda actual. Expandir: diferentes herramientas, diferentes suposiciones, preguntar al usuario

**Esperado:** Una decisión estratégica sobre la siguiente fase que se deduce lógicamente de los resultados del forrajeo. La decisión debe sentirse como una conclusión, no como una adivinanza.

**En caso de fallo:** Si ninguna estrategia se siente correcta, el forrajeo ha revelado incertidumbre genuina — y ese es un resultado válido. Comunicar la incertidumbre al usuario: "Exploré N enfoques y encontré X. El más prometedor es Y porque Z. ¿Debo seguirlo, o tienes contexto adicional?"

## Validación

- [ ] El paisaje de soluciones fue caracterizado antes de comenzar la exploración
- [ ] Al menos 3 hipótesis independientes fueron generadas y probadas
- [ ] Las pruebas de exploradores fueron baratas (una acción cada una) e independientes
- [ ] El refuerzo de rastros se basó en evidencia, no en preferencia
- [ ] El valor marginal fue evaluado antes de comprometerse con investigación profunda
- [ ] La estrategia se adaptó a los resultados en lugar de seguir un plan fijo

## Errores Comunes

- **Explotación prematura**: Profundizar en la primera hipótesis que muestra cualquier promesa sin explorar alternativas. Este es el fallo más común — la primera buena idea a menudo no es la mejor idea
- **Exploración perpetua**: Generar hipótesis sin fin sin nunca comprometerse con una. Establecer un presupuesto: después de N exploradores, comprometerse con el mejor rastro independientemente
- **Hipótesis no independientes**: "Quizás está en el archivo A" y "quizás está en el archivo B, que es importado por el archivo A" no son independientes — comparten suposiciones. Forzar diversidad genuina de enfoque
- **Ignorar señales de inhibición**: Cuando la evidencia contradice una hipótesis, dejarla ir. Continuar invirtiendo en un rastro contradecido por el esfuerzo ya invertido es el equivalente de forrajeo de la falacia de costo hundido
- **Explorar sin registrar**: Si los resultados de los exploradores no se registran, exploradores posteriores repetirán trabajo anterior. Anotar brevemente lo que cada explorador encontró antes de pasar al siguiente

## Habilidades Relacionadas

- `forage-resources` — el modelo de forrajeo multi-agente que esta habilidad adapta a la búsqueda de soluciones de un solo agente
- `build-coherence` — usado cuando el forrajeo revela múltiples enfoques válidos que necesitan evaluación
- `coordinate-reasoning` — gestiona el flujo de información entre hipótesis exploradoras y fases de explotación
- `awareness` — monitorea convergencia prematura y visión de túnel durante el forrajeo
