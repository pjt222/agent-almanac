---
name: adapt-architecture
description: >
  Execute structural metamorphosis using strangler fig migration, chrysalis
  phases, and interface preservation. Covers transformation planning, parallel
  running, progressive cutover, rollback design, and post-metamorphosis
  stabilization for system architecture evolution. Use when assess-form has
  classified the system as READY for transformation, when migrating from
  monolith to microservices, when replacing a core subsystem while dependents
  continue operating, or when any architectural change must be gradual rather
  than big-bang.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, adaptation, architecture, migration, strangler-fig
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Adaptar Arquitectura

Ejecutar una metamorfosis estructural — transformando la arquitectura de un sistema desde su forma actual a una forma objetivo mientras se mantiene la continuidad operativa. Utiliza migración strangler fig, fases de crisálida y preservación de interfaces para asegurar que el sistema nunca deje de funcionar durante la transformación.

## Cuándo Usar

- La evaluación de forma (ver `assess-form`) clasificó el sistema como LISTO
- Un sistema debe evolucionar su arquitectura para cumplir nuevos requisitos sin tiempo de inactividad
- Migración de monolito a microservicios (o viceversa)
- Reemplazo de un subsistema central mientras los sistemas dependientes continúan operando
- Evolución de un modelo de datos manteniendo compatibilidad retroactiva
- Cualquier cambio arquitectónico que deba ser gradual en lugar de big-bang

## Entradas

- **Requerido**: Evaluación de la forma actual (de `assess-form` o análisis equivalente)
- **Requerido**: Arquitectura objetivo (en qué debe convertirse el sistema)
- **Requerido**: Requisitos de continuidad operativa (qué no debe romperse durante la transformación)
- **Opcional**: Presupuesto de transformación disponible (tiempo, personas, cómputo)
- **Opcional**: Requisitos de rollback (¿hasta dónde debemos poder retroceder?)
- **Opcional**: Duración de ejecución paralela (¿cuánto tiempo ejecutar el antiguo y el nuevo simultáneamente?)

## Procedimiento

### Paso 1: Diseñar el Plan de Transformación

Planificar la ruta de metamorfosis desde la forma actual a la forma objetivo.

1. Mapear la transformación como una secuencia de formas intermedias:
   - Forma actual → Forma intermedia 1 → ... → Forma objetivo
   - Cada forma intermedia debe ser operativamente viable (puede servir tráfico, pasar pruebas)
   - Ninguna forma intermedia debe ser más difícil de mantener que la forma actual
2. Identificar las costuras de transformación:
   - ¿Dónde se puede "cortar" la forma actual para insertar la nueva arquitectura?
   - Costuras naturales: interfaces existentes, límites de módulos, particiones de datos
   - Costuras artificiales: interfaces creadas específicamente para habilitar el corte (capas anticorrupción)
3. Elegir el patrón de metamorfosis:
   - **Strangler fig**: el nuevo sistema crece alrededor del antiguo, reemplazándolo gradualmente
   - **Crisálida**: el sistema antiguo se envuelve en una nueva capa; los internos se reemplazan mientras la capa preserva la interfaz externa
   - **Gemación**: el nuevo sistema crece junto al antiguo; el tráfico se desplaza gradualmente (ver `scale-colony` para gemación de colonias)
   - **Migración metamórfica**: reemplazo por fases de componentes en orden de dependencia (hojas primero, raíces al final)
4. Diseñar la capa de preservación de interfaces:
   - Los consumidores externos no deben experimentar interrupción
   - Versionado de API, contratos retrocompatibles, patrones adaptador
   - La capa de preservación es andamiaje temporal — planificar su eliminación

```
Metamorphosis Patterns:
┌───────────────┬───────────────────────────────────────────────────┐
│ Strangler Fig │ New code intercepts routes one by one;            │
│               │ old code handles everything else until replaced   │
│               │ ┌──────────┐                                     │
│               │ │ Old ████ │ → │ Old ██ New ██ │ → │ New ████ │  │
│               │ └──────────┘                                     │
├───────────────┼───────────────────────────────────────────────────┤
│ Chrysalis     │ Wrap old system in new interface; replace         │
│               │ internals while external shell stays stable       │
│               │ ┌──────────┐     ┌──[new]───┐     ┌──[new]───┐  │
│               │ │ old core │ → │ old core │ → │ new core │  │
│               │ └──────────┘     └──────────┘     └──────────┘  │
├───────────────┼───────────────────────────────────────────────────┤
│ Budding       │ New system runs in parallel; traffic shifts       │
│               │ ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐         │
│               │ │ Old  │ │ New  │  →  │ Old  │ │ New  │         │
│               │ │ 100% │ │  0%  │     │  0%  │ │ 100% │         │
│               │ └──────┘ └──────┘     └──────┘ └──────┘         │
└───────────────┴───────────────────────────────────────────────────┘
```

**Esperado:** Un plan de transformación que muestre formas intermedias, costuras, el patrón de metamorfosis elegido y la estrategia de preservación de interfaces. Cada paso es concreto y verificable.

**En caso de fallo:** Si no se encuentra una costura limpia, el sistema puede necesitar una disolución preliminar (ver `dissolve-form`) para crear costuras antes de la transformación. Si las formas intermedias no son operativamente viables, los pasos de transformación son demasiado grandes — descomponer en incrementos más pequeños.

### Paso 2: Construir el Andamiaje

Construir la infraestructura temporal que soporta la metamorfosis.

1. Crear la capa anticorrupción:
   - Una capa delgada de traducción entre los sistemas antiguo y nuevo
   - Enruta solicitudes al sistema apropiado (antiguo o nuevo) según el estado de migración
   - Traduce formatos de datos entre representaciones antiguas y nuevas
   - Esta capa es el "capullo" que protege la transformación
2. Configurar la infraestructura de ejecución paralela:
   - Ambos sistemas, antiguo y nuevo, deben ser desplegables simultáneamente
   - Los feature flags controlan qué sistema maneja qué tráfico
   - Los mecanismos de comparación validan que antiguo y nuevo producen resultados equivalentes
3. Establecer puntos de control de rollback:
   - En cada forma intermedia, verificar que el rollback a la forma anterior es posible
   - El rollback debe ser más rápido que el paso de transformación hacia adelante
   - La migración de datos debe ser reversible (o los datos deben escribirse dualmente durante la transición)
4. Construir el arnés de validación:
   - Pruebas automatizadas que verifican la continuidad operativa en cada forma intermedia
   - Benchmarks de rendimiento que detectan regresión
   - Verificaciones de integridad de datos que capturan errores de migración

**Esperado:** La infraestructura de andamiaje (capa anticorrupción, ejecución paralela, rollback, validación) está en su lugar antes de que comience cualquier transformación. El andamiaje mismo está probado y verificado.

**En caso de fallo:** Si el andamiaje es demasiado costoso, simplificar: el andamiaje mínimo viable es un feature flag y un procedimiento de rollback. Las capas anticorrupción y la ejecución paralela añaden seguridad pero no siempre son necesarias para transformaciones más pequeñas.

### Paso 3: Ejecutar el Traspaso Progresivo

Migrar funcionalidad de la forma antigua a la nueva forma de manera incremental.

1. Ordenar componentes para migración:
   - Comenzar con el componente menos acoplado y de menor riesgo (generar confianza)
   - Progresar hacia componentes más críticos y más acoplados
   - Guardar el componente más acoplado/crítico para el final (para cuando el equipo tenga experiencia)
2. Para cada componente:
   a. Implementar la nueva versión detrás de la capa anticorrupción
   b. Ejecutar en paralelo: tanto el antiguo como el nuevo procesan las mismas entradas
   c. Comparar salidas — deben ser equivalentes (o las diferencias deben ser esperadas y documentadas)
   d. Cuando haya confianza, cambiar el tráfico a la nueva versión (cambio de feature flag)
   e. Monitorear anomalías (aumentar la sensibilidad del monitoreo post-traspaso)
   f. Después de un período de estabilidad, desmantelar la versión antigua de este componente
3. Mantener la entrega continua durante todo el proceso:
   - Cada paso de traspaso es un despliegue normal, no un evento especial
   - El sistema siempre está en un estado conocido, probado y operativo
   - Si un traspaso causa problemas, revertir al estado anterior (que sigue siendo operativo)

**Esperado:** La funcionalidad migra componente por componente con validación en cada paso. El sistema siempre está operativo. Cada traspaso genera confianza para el siguiente.

**En caso de fallo:** Si la ejecución paralela revela discrepancias, la nueva implementación tiene un error — corregirlo antes de hacer el traspaso. Si un traspaso causa degradación del rendimiento, el nuevo componente puede necesitar optimización o la capa anticorrupción está añadiendo demasiada sobrecarga. Si el equipo pierde confianza a mitad de la migración, pausar y estabilizar — un sistema medio migrado en un estado conocido es mucho mejor que una migración completa apresurada.

### Paso 4: Gestionar la Fase de Crisálida

Navegar el período más vulnerable — cuando el sistema está entre formas.

1. Reconocer la realidad de la crisálida:
   - Durante la migración, el sistema es parcialmente antiguo y parcialmente nuevo
   - Este estado híbrido es inherentemente más complejo que cualquiera de los estados puros
   - La complejidad alcanza su pico en el punto medio de la migración, luego disminuye
2. Disciplina de crisálida:
   - Sin nuevas funcionalidades durante la fase de crisálida (solo transformación)
   - Cambios externos mínimos (congelar despliegues no esenciales)
   - Mayor monitoreo y cobertura de guardia
   - Revisiones diarias del progreso de migración y salud del sistema
3. Evaluación a mitad de crisálida:
   - En el punto medio, evaluar: ¿sigue siendo la forma objetivo la meta correcta?
   - ¿Ha cambiado algo (mercado, requisitos, equipo) que afecte el objetivo?
   - ¿Debe la transformación continuar, pausarse o redirigirse?
4. Proteger la crisálida:
   - Mantener la ruta de rollback despejada en todo momento
   - Documentar el estado híbrido actual exhaustivamente (los futuros depuradores lo necesitarán)
   - Resistir la tentación de "limpiar" el andamiaje temporal antes de que la migración esté completa

**Esperado:** La fase de crisálida se gestiona como un período deliberado y acotado en el tiempo con mayor disciplina y monitoreo. El equipo entiende que la complejidad temporal es el costo de una transformación segura.

**En caso de fallo:** Si la fase de crisálida se prolonga demasiado, el estado híbrido se convierte en la nueva normalidad — lo cual es peor que el antiguo o el nuevo. Establecer un límite de tiempo. Si se alcanza el límite, ya sea acelerar la migración restante o aceptar el estado híbrido como la "nueva forma" y estabilizarlo.

### Paso 5: Completar la Metamorfosis y Estabilizar

Finalizar la transformación y eliminar el andamiaje.

1. Traspaso final:
   - Migrar los últimos componentes a la nueva forma
   - Ejecutar la suite completa de validación contra el nuevo sistema completo
   - Prueba de rendimiento bajo carga equivalente a producción
2. Eliminar andamiaje:
   - Desmantelar la capa anticorrupción (ya no es necesaria)
   - Eliminar los feature flags relacionados con la migración
   - Limpiar la infraestructura de ejecución paralela
   - Archivar (no eliminar) el código del sistema antiguo como referencia
3. Estabilización post-metamorfosis:
   - Ejecutar en la nueva forma durante 2-4 semanas con monitoreo mejorado
   - Abordar cualquier problema que surja en condiciones reales
   - Actualizar la documentación para reflejar la nueva arquitectura
4. Retrospectiva:
   - ¿Qué salió bien en la transformación?
   - ¿Qué fue más difícil de lo esperado?
   - ¿Qué haríamos diferente la próxima vez?
   - Actualizar el manual de transformación del equipo

**Esperado:** La transformación está completa. El sistema opera en su nueva forma. El andamiaje está eliminado. La documentación está actualizada. El equipo ha capturado aprendizajes para futuras transformaciones.

**En caso de fallo:** Si la nueva forma es inestable después del traspaso, mantener la ruta de rollback y continuar la estabilización. Si la estabilización toma más del período planificado, puede haber un problema de diseño en la nueva arquitectura — considerar si correcciones dirigidas o un rollback parcial del componente más problemático es apropiado.

## Validación

- [ ] El plan de transformación muestra formas intermedias viables
- [ ] El andamiaje (capa anticorrupción, rollback, arnés de validación) está en su lugar antes de que comience la migración
- [ ] Los componentes migran en orden de menor a mayor riesgo
- [ ] La ejecución paralela valida equivalencia en cada paso
- [ ] La fase de crisálida está acotada en el tiempo con disciplina de congelación de funcionalidades
- [ ] Todo el andamiaje se elimina después de completar la transformación
- [ ] El período de estabilización post-metamorfosis pasa sin problemas críticos
- [ ] La retrospectiva captura aprendizajes

## Errores Comunes

- **Migración big-bang**: Intentar transformar todo de una vez. Esto abandona la seguridad del traspaso incremental y maximiza el radio de explosión. Siempre migrar incrementalmente
- **Andamiaje permanente**: Las capas anticorrupción y feature flags que nunca se eliminan se convierten en deuda técnica. Planificar la eliminación del andamiaje como parte de la transformación, no como algo posterior
- **Negación de la crisálida**: Pretender que el estado híbrido es normal lleva al desarrollo de funcionalidades sobre cimientos inestables. Reconocer la fase de crisálida y hacer cumplir su disciplina
- **Fijación en el objetivo**: Comprometerse tanto con la arquitectura objetivo que se ignoran señales de una mejor alternativa. La evaluación a mitad de crisálida existe por esta razón
- **Fatiga de transformación**: Las migraciones largas agotan a los equipos. Mantener cada paso de transformación lo suficientemente pequeño para completarse en días, no semanas. Celebrar hitos para mantener el impulso

## Habilidades Relacionadas

- `assess-form` — evaluación prerrequisito que determina si el sistema está listo para la transformación
- `dissolve-form` — para sistemas demasiado rígidos para transformar directamente; la disolución crea las costuras necesarias aquí
- `repair-damage` — habilidad de recuperación para cuando la transformación introduce daño
- `shift-camouflage` — adaptación superficial que puede ser suficiente sin un cambio arquitectónico profundo
- `coordinate-swarm` — la coordinación de enjambre informa la secuenciación de la transformación en sistemas distribuidos
- `scale-colony` — la presión de crecimiento es un desencadenante común para la adaptación arquitectónica
- `implement-gitops-workflow` — GitOps proporciona la infraestructura de despliegue para el traspaso progresivo
- `review-software-architecture` — habilidad de revisión complementaria para evaluar la arquitectura objetivo
