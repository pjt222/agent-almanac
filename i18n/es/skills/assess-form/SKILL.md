---
name: assess-form
description: >
  Evaluate a system's current structural form, identify transformation pressure,
  and classify transformation readiness. Covers structural inventory, pressure
  mapping, rigidity assessment, change capacity estimation, and readiness
  classification for architectural metamorphosis. Use before any significant
  architectural change to understand the starting point, when a system feels
  stuck without clear reasons, when external pressure from growth or tech debt
  is mounting, or as periodic health checks for long-lived systems.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: basic
  language: natural
  tags: morphic, assessment, architecture, transformation-readiness
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Assess Form

Evaluar la forma estructural actual de un sistema — su arquitectura, rigidez, puntos de presión y capacidad de cambio — para determinar la preparación para la transformación antes de iniciar la metamorfosis.

## Cuándo Usar

- Antes de cualquier cambio arquitectónico significativo para comprender el punto de partida
- Cuando un sistema se siente "atascado" pero las razones no están claras
- Cuando la presión externa (crecimiento, cambio de mercado, deuda técnica) está aumentando pero la respuesta es incierta
- Al evaluar si una transformación propuesta es factible dada la forma actual
- Verificaciones periódicas de salud para sistemas de larga vida (evaluación de forma anual)
- Complementando `adapt-architecture` — evaluar primero, luego transformar

## Entradas

- **Requerido**: El sistema a evaluar (base de código, organización, infraestructura, proceso)
- **Opcional**: Dirección de transformación propuesta (¿en qué podría necesitar convertirse el sistema?)
- **Opcional**: Puntos de dolor conocidos o fuentes de presión
- **Opcional**: Intentos previos de transformación y sus resultados
- **Opcional**: Horizonte temporal para la transformación potencial
- **Opcional**: Recursos disponibles para el esfuerzo de transformación

## Procedimiento

### Paso 1: Inventariar la Forma Actual

Catalogar los elementos estructurales del sistema sin juicio — entender lo que existe antes de evaluarlo.

1. Mapear los componentes estructurales:
   - **Módulos**: unidades funcionales distintas (servicios, equipos, paquetes, departamentos)
   - **Interfaces**: cómo se conectan los módulos (APIs, protocolos, contratos, líneas de reporte)
   - **Flujos de datos**: cómo se mueve la información a través del sistema
   - **Dependencias**: qué depende de qué (directa, transitiva, circular)
   - **Estructuras portantes**: componentes de los que todo lo demás depende
2. Documentar la edad e historia de la forma:
   - ¿Cuándo se introdujo cada componente principal?
   - ¿Qué componentes han cambiado recientemente vs. permanecido estáticos?
   - ¿Cuál es la estructura de "capas geológicas" (núcleo antiguo, adiciones más nuevas, parches recientes)?
3. Identificar el "esqueleto" vs. "carne" de la forma:
   - Esqueleto: decisiones estructurales que son extremadamente costosas de cambiar (lenguaje, base de datos, modelo de despliegue)
   - Carne: decisiones funcionales que pueden cambiar más fácilmente (lógica de negocio, UI, configuración)

```
Structural Inventory Template:
┌──────────────┬──────────┬────────────┬───────────────────┬──────────┐
│ Component    │ Age      │ Last       │ Dependencies      │ Type     │
│              │          │ Modified   │ (in / out)        │          │
├──────────────┼──────────┼────────────┼───────────────────┼──────────┤
│ Auth service │ 3 years  │ 6 months   │ In: 12 / Out: 3  │ Skeleton │
│ Dashboard UI │ 1 year   │ 2 weeks    │ In: 2 / Out: 5   │ Flesh    │
│ Data pipeline│ 4 years  │ 1 year     │ In: 3 / Out: 8   │ Skeleton │
│ Config store │ 2 years  │ 3 months   │ In: 0 / Out: 15  │ Skeleton │
└──────────────┴──────────┴────────────┴───────────────────┴──────────┘
```

**Esperado:** Un inventario estructural completo mostrando componentes, sus edades, recencia de modificación, perfiles de dependencia y clasificación como esqueleto o carne. Esta es la "radiografía" de la forma actual.

**En caso de fallo:** Si el inventario está incompleto (componentes desconocidos o no documentados), eso en sí mismo es un hallazgo — la forma tiene opacidad, lo cual es un riesgo de transformación. Documentar lo que se pueda, marcar las incógnitas y planificar descubrimiento para las brechas.

### Paso 2: Mapear la Presión de Transformación

Identificar las fuerzas que empujan al sistema hacia el cambio y las fuerzas que lo resisten.

1. Catalogar presiones externas (fuerzas que demandan cambio):
   - Presión de crecimiento: la forma actual no puede manejar la carga creciente
   - Presión de mercado: competidores o usuarios demandan capacidades que la forma actual no puede soportar
   - Presión tecnológica: la tecnología subyacente se está volviendo obsoleta o sin soporte
   - Presión regulatoria: requisitos de cumplimiento que la forma actual no satisface
   - Presión de integración: debe conectarse con sistemas para los que la forma actual no fue diseñada
2. Catalogar presiones internas (fuerzas que demandan cambio desde dentro):
   - Deuda técnica: atajos acumulados que ralentizan el desarrollo
   - Concentración de conocimiento: conocimiento crítico en manos de muy pocas personas
   - Presión moral: frustración del equipo con la forma actual
   - Carga operacional: costo de mantenimiento consumiendo recursos que deberían ir al desarrollo
3. Catalogar fuerzas de resistencia (fuerzas que se oponen al cambio):
   - Inercia: la forma existente funciona "suficientemente bien"
   - Bloqueo por dependencias: demasiadas cosas dependen de la forma actual
   - Riesgo de pérdida de conocimiento: la transformación podría destruir conocimiento institucional
   - Costo: la transformación requiere inversión con retorno incierto
   - Miedo: intentos previos de transformación fallaron

**Esperado:** Un mapa de presión mostrando la dirección y magnitud de las fuerzas que actúan sobre el sistema. Si la presión de transformación excede significativamente la resistencia, la transformación está atrasada. Si la resistencia excede significativamente la presión, la transformación fallará sin reducir primero la resistencia.

**En caso de fallo:** Si el mapeo de presión produce un panorama equilibrado (ni presión fuerte ni resistencia fuerte), el sistema puede no necesitar transformación — o el análisis es superficial. Profundizar: entrevistar a las partes interesadas, medir puntos de dolor específicos, proyectar 12-18 meses hacia adelante. ¿Qué presiones se intensificarán?

### Paso 3: Evaluar la Rigidez Estructural

Determinar qué tan flexible o rígida es la forma actual — ¿puede doblarse, o se romperá?

1. Probar flexibilidad de interfaces:
   - ¿Se pueden reemplazar módulos sin cambios en cascada? (acoplamiento débil = flexible)
   - ¿Las interfaces están bien definidas y son estables? (claridad de contrato = flexible)
   - ¿Cuántos "módulos dios" existen (módulos de los que todo depende)? (concentración = rígido)
2. Probar flexibilidad de datos:
   - ¿Es sencilla la migración de datos? (herramientas de evolución de esquema, versionado)
   - ¿Los formatos de datos son estandarizados o a medida? (a medida = rígido)
   - ¿Qué tan enredada está la lógica de negocio con la estructura de datos? (enredada = rígido)
3. Probar flexibilidad de procesos:
   - ¿Puede el equipo enviar cambios rápidamente? (salud del pipeline de despliegue)
   - ¿Es la suite de pruebas completa? (red de seguridad para el cambio)
   - ¿Cuántos componentes "no tocar" existen? (zonas prohibidas = rígido)
4. Calcular la puntuación de rigidez:

```
Rigidity Assessment:
┌──────────────────────┬─────┬──────────┬──────┬──────────────────────┐
│ Dimension            │ Low │ Moderate │ High │ Your Assessment      │
├──────────────────────┼─────┼──────────┼──────┼──────────────────────┤
│ Interface coupling   │ 1   │ 2        │ 3    │ ___                  │
│ God module count     │ 1   │ 2        │ 3    │ ___                  │
│ Data entanglement    │ 1   │ 2        │ 3    │ ___                  │
│ Deployment friction  │ 1   │ 2        │ 3    │ ___                  │
│ Test coverage gaps   │ 1   │ 2        │ 3    │ ___                  │
│ "Don't touch" zones  │ 1   │ 2        │ 3    │ ___                  │
├──────────────────────┼─────┴──────────┴──────┼──────────────────────┤
│ Total (max 18)       │ 6-9: flexible         │ ___                  │
│                      │ 10-13: moderate        │                      │
│                      │ 14-18: rigid           │                      │
└──────────────────────┴───────────────────────┴──────────────────────┘
```

**Esperado:** Una puntuación de rigidez que cuantifica cuánta resistencia estructural encontrará la transformación. Los sistemas flexibles (6-9) pueden transformarse incrementalmente. Los sistemas rígidos (14-18) necesitan disolución antes de reconstrucción (ver `dissolve-form`).

**En caso de fallo:** Si la evaluación de rigidez es inconclusa (puntuación moderada pero no está claro dónde están los problemas reales), enfocarse en las dimensiones con puntuación más alta. Un sistema puede ser flexible en general pero tener un componente extremadamente rígido que bloquea la transformación. Abordar ese componente específicamente.

### Paso 4: Estimar la Capacidad de Cambio

Evaluar la capacidad del sistema (y del equipo) para absorber y ejecutar la transformación.

1. Energía de transformación disponible:
   - ¿Qué porcentaje de la capacidad del equipo puede asignarse a la transformación?
   - ¿Hay soporte organizacional (presupuesto, mandato, paciencia)?
   - ¿Están disponibles las habilidades correctas (arquitectura, migración, pruebas)?
2. Tasa de absorción de cambios:
   - ¿Cuántos cambios puede absorber el sistema por unidad de tiempo sin desestabilizarse?
   - ¿Cuál es el tiempo de recuperación después de un cambio significativo?
   - ¿Existe un mecanismo de staging/canary para transformación incremental?
3. Experiencia en transformación:
   - ¿Ha transformado el equipo sistemas similares exitosamente antes?
   - ¿Existen herramientas y prácticas de transformación (feature flags, strangler fig, blue-green)?
   - ¿Cuál es la tolerancia al riesgo del equipo?
4. Calcular capacidad de cambio:
   - Alta capacidad: equipo dedicado, herramientas sólidas, experiencia previa, soporte organizacional
   - Capacidad moderada: asignación a tiempo parcial, algunas herramientas, experiencia limitada
   - Baja capacidad: sin recursos dedicados, sin herramientas, sin experiencia, organización resistente

**Esperado:** Una evaluación de capacidad de cambio que indica si el sistema/equipo puede ejecutar la transformación propuesta dados los recursos, habilidades y soporte organizacional actuales.

**En caso de fallo:** Si la capacidad de cambio es baja pero la presión de transformación es alta, la primera transformación no es del sistema — es de la capacidad del equipo. Invertir en herramientas, capacitación y aceptación organizacional antes de intentar la transformación arquitectónica.

### Paso 5: Clasificar la Preparación para la Transformación

Combinar las evaluaciones de presión, rigidez y capacidad en una clasificación de preparación.

1. Ubicar el sistema en la matriz de preparación:

```
Transformation Readiness Matrix:
┌─────────────────┬────────────────────────┬────────────────────────┐
│                  │ Low Rigidity           │ High Rigidity          │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ READY — Transform now  │ PREPARE — Reduce       │
│ + High Capacity │ using adapt-architecture│ rigidity first, then   │
│                 │                        │ use dissolve-form       │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ INVEST — Build capacity│ CRITICAL — Invest in   │
│ + Low Capacity  │ first, then transform  │ capacity AND reduce    │
│                 │                        │ rigidity before change │
├─────────────────┼────────────────────────┼────────────────────────┤
│ Low Pressure    │ OPTIONAL — Transform   │ DEFER — No urgency,    │
│ + Any Capacity  │ if strategic value is  │ monitor pressure and   │
│                 │ clear, otherwise defer │ reassess quarterly     │
└─────────────────┴────────────────────────┴────────────────────────┘
```

2. Documentar la clasificación de preparación con:
   - Etiqueta de clasificación (READY / PREPARE / INVEST / CRITICAL / OPTIONAL / DEFER)
   - Hallazgos clave de cada dimensión de evaluación
   - Siguiente paso recomendado
   - Factores de riesgo que podrían cambiar la clasificación
3. Si READY: proceder a `adapt-architecture`
4. Si PREPARE: proceder a `dissolve-form` para reducir rigidez
5. Si INVEST: construir capacidad (capacitación, herramientas, soporte organizacional), luego re-evaluar
6. Si CRITICAL: abordar capacidad y rigidez simultáneamente (puede requerir ayuda externa)
7. Si OPTIONAL/DEFER: documentar la evaluación y establecer una fecha de re-evaluación

**Esperado:** Una clasificación clara y justificada de preparación para la transformación con pasos siguientes específicos. La clasificación permite la toma de decisiones informada sobre cuándo y cómo transformar.

**En caso de fallo:** Si la clasificación es ambigua (ej., presión moderada, rigidez moderada, capacidad moderada), recurrir a PREPARE — reducir rigidez incrementalmente mientras se monitorea la presión. Esto construye capacidad y reduce riesgo independientemente de si la transformación completa se necesita eventualmente.

## Validación

- [ ] El inventario estructural está completo con componentes, edades, dependencias y tipos
- [ ] La presión de transformación está mapeada (fuerzas externas, internas, de resistencia)
- [ ] La puntuación de rigidez está calculada en todas las dimensiones
- [ ] La capacidad de cambio está evaluada (recursos, tasa de absorción, experiencia)
- [ ] La clasificación de preparación está determinada con razonamiento justificado
- [ ] Los pasos siguientes están documentados basándose en la clasificación
- [ ] La fecha de re-evaluación está establecida (incluso si actualmente es READY)

## Errores Comunes

- **Evaluar solo el sistema técnico**: La preparación para la transformación incluye la preparación organizacional. Un sistema técnicamente flexible con un equipo organizacionalmente rígido aún fallará en transformarse
- **Estimación optimista de capacidad**: Los equipos consistentemente sobreestiman su capacidad de cambio mientras mantienen operaciones normales. Usar el 50% de la capacidad declarada como estimación realista
- **Ignorar las fuerzas de resistencia**: El mapeo de presión que solo cataloga fuerzas de cambio pierde la resistencia que ralentizará o detendrá la transformación. La resistencia a menudo es más fuerte de lo que parece
- **Parálisis de evaluación**: La evaluación de forma debería tomar horas a días, no semanas. Si está tomando demasiado tiempo, el sistema es demasiado complejo para evaluar completamente — evaluar a un nivel de abstracción más alto y profundizar en áreas problemáticas
- **Confundir rigidez con estabilidad**: Un sistema rígido no es lo mismo que un sistema estable. La estabilidad proviene de flexibilidad bien diseñada; la rigidez es la ausencia de flexibilidad diseñada

## Habilidades Relacionadas

- `adapt-architecture` — la habilidad de transformación principal; assess-form determina la preparación para ella
- `dissolve-form` — para sistemas clasificados como PREPARE o CRITICAL, reducción de rigidez antes de la transformación
- `repair-damage` — para sistemas que necesitan reparación antes de que la evaluación pueda ser significativa
- `shift-camouflage` — adaptación a nivel superficial que puede resolver la presión sin transformación completa
- `forage-resources` — la exploración de recursos informa la evaluación de forma cuando la pregunta es "¿en qué deberíamos convertirnos?"
- `review-software-architecture` — habilidad complementaria para evaluación detallada de arquitectura técnica
- `assess-context` — variante de autoaplicación de IA; mapea la evaluación estructural a la maleabilidad del contexto de razonamiento, mapeo de rigidez y preparación para la transformación
