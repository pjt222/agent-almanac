---
name: dissolve-form
description: >
  Perform controlled dismantling of rigid system structures while preserving
  essential capabilities (imaginal discs). Covers rigidity mapping, dissolution
  sequencing, knowledge extraction, interface archaeology, and safe decomposition
  of technical debt and organizational calcification. Use when assess-form
  classified the system as PREPARE or CRITICAL, when a system is so calcified
  that incremental change is impossible, when technical debt blocks all forward
  progress, or before adapt-architecture when the current form must be softened
  before it can be reshaped.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: advanced
  language: natural
  tags: morphic, dissolution, decomposition, technical-debt
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Dissolve Form

Realizar desmantelamiento controlado de estructuras rígidas del sistema — disolviendo arquitectura calcificada, deuda técnica acumulada y rigidez organizacional mientras se preservan las capacidades esenciales ("discos imaginales") que sembrarán la nueva forma.

## Cuándo Usar

- La evaluación de forma (ver `assess-form`) clasificó el sistema como PREPARE o CRITICAL (demasiado rígido para transformarse directamente)
- Un sistema está tan calcificado que el cambio incremental es imposible
- La deuda técnica se ha acumulado hasta el punto donde bloquea todo avance
- Una estructura organizacional se ha vuelto tan rígida que no puede adaptarse a nuevos requisitos
- Antes de `adapt-architecture` cuando la forma actual debe ablandarse antes de poder ser remodelada
- Desmantelamiento de sistemas heredados donde se debe extraer valor antes del cierre

## Entradas

- **Requerido**: Evaluación de forma mostrando alta rigidez (de `assess-form`)
- **Requerido**: Identificación de capacidades esenciales a preservar (discos imaginales)
- **Opcional**: Forma objetivo (lo que debería emerger después de la disolución; puede ser desconocido)
- **Opcional**: Cronograma y restricciones de disolución
- **Opcional**: Preocupaciones de las partes interesadas sobre componentes específicos
- **Opcional**: Intentos previos de disolución y sus resultados

## Procedimiento

### Paso 1: Identificar Discos Imaginales

En la metamorfosis biológica, los discos imaginales son grupos de células dentro de la oruga que sobreviven a la disolución y se convierten en los órganos de la mariposa. Identificar las capacidades esenciales que deben sobrevivir.

1. Catalogar cada capacidad que el sistema actual proporciona:
   - Funcionalidades orientadas al usuario
   - Funciones de procesamiento de datos
   - Puntos de integración con sistemas externos
   - Conocimiento institucional incorporado en el código/proceso
   - Reglas de negocio (a menudo implícitas, no documentadas)
2. Clasificar cada capacidad:
   - **Disco imaginal** (debe sobrevivir): lógica de negocio central, integraciones críticas, datos irremplazables
   - **Tejido reemplazable** (puede reconstruirse): UI, infraestructura, algoritmos estándar
   - **Tejido muerto** (no debería sobrevivir): soluciones temporales para bugs que ya no existen, adaptadores de compatibilidad para sistemas extintos, funcionalidades que nadie usa
3. Extraer discos imaginales a formato portátil:
   - Documentar reglas de negocio explícitamente (pueden existir solo como comentarios de código o conocimiento tribal)
   - Extraer algoritmos críticos en módulos independientes y probados
   - Exportar datos esenciales en representaciones independientes del formato
   - Registrar contratos de integración y su comportamiento real (no documentado)

**Esperado:** Un inventario claro de capacidades clasificadas como esenciales (preservar), reemplazables (reconstruir) o muertas (descartar). Las capacidades esenciales se extraen en formato portátil antes de que comience la disolución.

**En caso de fallo:** Si la identificación de discos imaginales es incierta (las partes interesadas no están de acuerdo sobre qué es esencial), errar hacia el lado de la preservación. Extraer más capacidades de las que se cree necesitar — descartar después de la disolución es fácil; recuperar conocimiento perdido es a menudo imposible.

### Paso 2: Mapear Secuencia de Disolución

Determinar el orden en el que los elementos estructurales serán disueltos — capas externas primero, núcleo al final.

1. Ordenar por profundidad de dependencia:
   - Capa 1 (más externa): componentes sin dependientes — nada se rompe cuando se eliminan
   - Capa 2: componentes cuyos dependientes son solo elementos de Capa 1 (ya disueltos)
   - Capa 3: componentes con dependencias más profundas — eliminarlos requiere gestión cuidadosa de interfaces
   - Capa N (núcleo): componentes portantes de los que todo depende — se disuelven al final
2. Para cada capa, definir:
   - Qué se disuelve (elimina, descomisiona, archiva)
   - Qué lo reemplaza (nuevo componente, nada, o stub temporal)
   - Qué interfaces deben mantenerse para las capas restantes
   - Cómo verificar que el sistema aún funciona después de disolver esta capa
3. Crear puntos de control de disolución:
   - Después de cada capa, el sistema restante debe probarse y verificarse operacional
   - Cada punto de control es un estado estable desde el cual la disolución puede pausarse
   - Si la disolución de una capa causa roturas inesperadas, restaurar desde el punto de control anterior

```
Dissolution Sequence (outside in):
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Dead features, unused integrations, orphaned code      │
│          → Remove. Nothing depends on these.                    │
│                                                                 │
│ Layer 2: Replaceable UI, standard infrastructure                │
│          → Replace with modern equivalents or stubs             │
│                                                                 │
│ Layer 3: Business logic wrappers, data access layers            │
│          → Extract imaginal discs, then dissolve                │
│                                                                 │
│ Layer 4 (core): Load-bearing structures, data stores            │
│          → Dissolve last, with full replacement ready           │
└─────────────────────────────────────────────────────────────────┘
```

**Esperado:** Una secuencia de disolución ordenada por capas donde cada paso es seguro (punto de control verificado) y reversible (punto de control anterior es restaurable). Los componentes más críticos se disuelven al final cuando el equipo tiene más experiencia y confianza.

**En caso de fallo:** Si el mapeo de dependencias revela dependencias circulares (A depende de B depende de A), estos ciclos deben romperse antes de que la disolución secuenciada sea posible. Introducir una interfaz entre A y B, romper el ciclo, luego proceder con la secuencia.

### Paso 3: Realizar Arqueología de Interfaces

Antes de disolver estructuras rígidas, excavar y documentar sus interfaces reales — no lo que está documentado, sino lo que realmente se usa.

1. Instrumentar interfaces actuales:
   - Registrar cada llamada, mensaje o intercambio de datos en cada interfaz
   - Ejecutar durante al menos un ciclo de negocio completo (diario, semanal, mensual — lo que sea relevante)
   - Capturar formas reales de carga útil, no solo esquemas documentados
2. Comparar comportamiento real vs. documentado:
   - ¿Qué interfaces documentadas nunca se llaman? (candidatas para disolución de Capa 1)
   - ¿Qué interfaces no documentadas se usan activamente? (dependencias ocultas — deben preservarse o reemplazarse explícitamente)
   - ¿Qué casos límite revela el tráfico real que la documentación no menciona?
3. Construir un contrato de interfaz a partir del comportamiento real:
   - Este contrato se convierte en la especificación para cualquier reemplazo
   - Incluir ejemplos reales de entradas y salidas
   - Documentar el comportamiento de manejo de errores (lo que realmente sucede, no lo que debería suceder)

**Esperado:** Un contrato de interfaz derivado empíricamente que represente con precisión cómo se comunica realmente el sistema, incluyendo comportamientos no documentados y dependencias ocultas.

**En caso de fallo:** Si la instrumentación es demasiado invasiva (impacta el rendimiento o requiere cambios de código), muestrear el tráfico en lugar de capturarlo todo. Si el ciclo de negocio es demasiado largo para esperar, usar los datos disponibles complementados con entrevistas a las partes interesadas sobre "qué llama a qué en qué situaciones."

### Paso 4: Ejecutar Disolución Controlada

Eliminar sistemáticamente elementos estructurales mientras se mantiene la viabilidad de los discos imaginales.

1. Comenzar con la Capa 1 (más externa, sin dependientes):
   - Eliminar funcionalidades muertas y código no utilizado
   - Archivar (no eliminar) para referencia
   - Verificar: el sistema aún pasa todas las pruebas, sin errores en tiempo de ejecución
2. Progresar a través de cada capa:
   - Para cada componente que se disuelve:
     a. Verificar que los discos imaginales han sido extraídos (Paso 1)
     b. Instalar reemplazo o stub (si quedan dependientes)
     c. Eliminar el componente
     d. Ejecutar suite de validación
     e. Monitorear efectos secundarios inesperados
   - En cada punto de control: documentar el estado actual del sistema, verificar estado operacional
3. Manejar resistencia a la disolución:
   - Algunos componentes resisten la disolución (emergen dependencias ocultas)
   - Cuando una eliminación causa roturas inesperadas:
     a. Restaurar desde el punto de control
     b. Investigar la dependencia oculta
     c. Agregarla a la arqueología de interfaces (Paso 3)
     d. Crear un stub explícito para la dependencia
     e. Re-intentar la disolución
4. Rastrear el progreso de la disolución:
   - Componentes restantes vs. disueltos
   - Discos imaginales extraídos y verificados como portátiles
   - Dependencias inesperadas descubiertas y manejadas

**Esperado:** Disolución sistemática y verificada de estructura no esencial. Después de cada capa, el sistema restante es más pequeño, más simple y aún operacional. Los discos imaginales se preservan en formato portátil.

**En caso de fallo:** Si la disolución causa fallos en cascada, el ordenamiento de capas está mal — hay dependencias ocultas más profundas de lo esperado. Detenerse, restaurar, remapear dependencias y re-secuenciar. Si la disolución revela que un "disco imaginal" es más complejo de lo esperado, asignar más tiempo de extracción para esa capacidad.

### Paso 5: Preparar la Base para la Reconstrucción

Después de la disolución, el sistema restante debería ser un núcleo mínimo viable más discos imaginales extraídos listos para la reconstrucción.

1. Evaluar el estado post-disolución:
   - ¿Qué queda? (núcleo operacional mínimo + capacidades extraídas)
   - ¿Es mantenible el sistema restante? (¿puede el equipo entenderlo y modificarlo?)
   - ¿Todos los discos imaginales son accesibles y están verificados? (portátiles, probados, documentados)
2. Crear el manifiesto de reconstrucción:
   - Listar cada disco imaginal con su contrato, datos y suite de pruebas
   - Especificar la arquitectura objetivo para la reconstrucción (o marcar como "por determinar")
   - Identificar brechas: capacidades que se extrajeron parcialmente o tienen preocupaciones de calidad
3. Transferir a la reconstrucción:
   - Si la forma objetivo es conocida: proceder a `adapt-architecture` con el núcleo mínimo como punto de partida
   - Si la forma objetivo es desconocida: operar sobre el núcleo mínimo mientras se diseña el objetivo
   - En cualquier caso: el sistema ahora es suficientemente flexible para ser remodelado

**Esperado:** Un sistema mínimo y mantenible con capacidades extraídas claramente documentadas. La base está limpia y lista para la reconstrucción en cualquier forma que se elija.

**En caso de fallo:** Si el sistema post-disolución es menos mantenible de lo esperado, alguna estructura esencial fue disuelta que debería haberse preservado. Verificar el inventario de discos imaginales — si falta una capacidad crítica, puede aún ser recuperable del archivo. Si el núcleo mínimo es demasiado mínimo para operar, algún "tejido reemplazable" era realmente esencial — restaurarlo desde el punto de control.

## Validación

- [ ] Los discos imaginales están identificados, extraídos y verificados en formato portátil
- [ ] La secuencia de disolución está ordenada por capas desde la más externa (sin dependientes) hasta el núcleo
- [ ] La arqueología de interfaces ha capturado el comportamiento real (no solo documentado)
- [ ] Cada capa de disolución tiene un punto de control verificado
- [ ] Ninguna capacidad esencial se perdió durante la disolución
- [ ] El sistema post-disolución es mínimo, mantenible y operacional
- [ ] El manifiesto de reconstrucción documenta las capacidades extraídas y las brechas

## Errores Comunes

- **Disolver sin extraer**: Eliminar un componente rígido antes de que se extraigan sus capacidades esenciales destruye conocimiento irremplazable. Siempre extraer los discos imaginales primero
- **Confiar en la documentación sobre la observación**: Las interfaces documentadas a menudo divergen del comportamiento real. La arqueología de interfaces (Paso 3) revela la verdad; la documentación muestra la intención
- **Disolver el núcleo primero**: Eliminar estructuras portantes antes de que sus dependientes se disuelvan causa fallos en cascada. Siempre trabajar de afuera hacia adentro
- **Disolución completa**: Disolver todo para empezar de cero suena limpio pero pierde conocimiento institucional, manejo de casos límite probado en batalla y continuidad operacional. Preservar los discos imaginales
- **Disolución como castigo**: Disolver un sistema "porque es malo" sin un plan de reconstrucción crea un vacío. La disolución es la preparación para la reconstrucción, no un fin en sí mismo

## Habilidades Relacionadas

- `assess-form` — evaluación prerrequisito que identifica la rigidez y activa la disolución
- `adapt-architecture` — la habilidad de reconstrucción que sigue a la disolución
- `repair-damage` — para sistemas que necesitan reparación dirigida en lugar de disolución completa
- `build-consensus` — el consenso antes de una disolución mayor previene la fragmentación del equipo
- `decommission-validated-system` — proceso formal de desmantelamiento para sistemas regulados
- `conduct-post-mortem` — el análisis post-mortem comparte el rigor investigativo de la disolución
