---
name: scale-colony
description: >
  Escalar sistemas distribuidos y organizaciones a través de gemación de
  colonias, diferenciación de roles y transiciones arquitectónicas activadas
  por crecimiento. Cubre reconocimiento de fases de crecimiento, polietismo
  de edad, protocolos de fisión, coordinación entre colonias y detección de
  límites de escalado. Usar cuando un equipo o sistema que funcionaba con 10
  agentes se descompone con 50, cuando la sobrecarga de comunicación crece
  más rápido que la producción productiva, cuando se planifica una fase de
  crecimiento proactivamente, o cuando los fallos de coordinación se
  correlacionan con el tamaño como mensajes perdidos, trabajo duplicado o
  propiedad poco clara.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: advanced
  language: natural
  tags: swarm, scaling, colony-budding, role-differentiation
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Scale Colony

Escalar sistemas distribuidos, equipos u organizaciones a través de gemación de colonias (división), diferenciación de roles (polietismo de edad) y transiciones arquitectónicas activadas por crecimiento — manteniendo la calidad de coordinación mientras la colonia crece más allá de su capacidad de diseño inicial.

## Cuándo Usar

- Un equipo o sistema que funcionaba con 10 agentes se está descomponiendo con 50
- La sobrecarga de comunicación crece más rápido que la producción productiva
- Los patrones de coordinación que eran implícitos necesitan volverse explícitos
- Planificando una fase de crecimiento y queriendo escalar proactivamente en lugar de reactivamente
- Observando fallos de coordinación que se correlacionan con el tamaño (mensajes perdidos, trabajo duplicado, propiedad poco clara)
- El sistema existente necesita dividirse en sub-colonias semiautónomas

## Entradas

- **Requerido**: Tamaño actual de la colonia y crecimiento objetivo (o tasa de crecimiento)
- **Requerido**: Mecanismos de coordinación actuales y sus puntos de estrés
- **Opcional**: Estructura de la colonia (plana, jerárquica, agrupada)
- **Opcional**: Diferenciación de roles ya implementada
- **Opcional**: Cronograma de crecimiento y restricciones
- **Opcional**: Necesidades de coordinación entre colonias (si se divide)

## Procedimiento

### Paso 1: Reconocer la Fase de Crecimiento

Identificar en qué fase de escalado se encuentra la colonia para aplicar las estrategias apropiadas.

1. Clasificar la fase de crecimiento actual:

```
Colony Growth Phases:
┌───────────┬──────────────┬───────────────────────────────────────────┐
│ Phase     │ Size Range   │ Characteristics                           │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Founding  │ 1-7 agents   │ Everyone does everything, direct comms,   │
│           │              │ implicit coordination, high agility       │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Growth    │ 8-30 agents  │ Roles emerge, some specialization, comms  │
│           │              │ overhead increases, need for structure     │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Maturity  │ 30-100 agents│ Formal roles, layered coordination,       │
│           │              │ sub-groups form, inter-group coordination  │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Fission   │ 100+ agents  │ Colony too large for single coordination  │
│           │              │ framework, must bud into sub-colonies     │
└───────────┴──────────────┴───────────────────────────────────────────┘
```

2. Identificar señales de estrés de crecimiento:
   - **Sobrecarga de comunicación**: los mensajes por agente por día aumentan más rápido que el tamaño de la colonia
   - **Latencia de decisión**: el tiempo desde propuesta hasta decisión va en aumento
   - **Fallos de coordinación**: trabajo duplicado, tareas abandonadas, acciones conflictivas en aumento
   - **Dilución de conocimiento**: los nuevos agentes tardan más en ser productivos
   - **Pérdida de identidad**: los agentes no pueden describir consistentemente el propósito de la colonia
3. Determinar si la colonia está a punto de cruzar una frontera de fase o ya la ha cruzado

**Esperado:** Identificación clara de la fase de crecimiento actual y las señales de estrés específicas que indican que la colonia se acerca o ha cruzado una frontera de fase.

**En caso de fallo:** Si la fase no está clara, medir tres métricas concretas: volumen de comunicación por agente, latencia de decisión y tasa de fallos de coordinación. Graficarlos en el tiempo. Los puntos de inflexión revelan transiciones de fase. Si las métricas no están disponibles, la colonia probablemente está en la fase de Fundación (donde las métricas aún no son necesarias).

### Paso 2: Implementar Diferenciación de Roles (Polietismo de Edad)

Introducir especialización progresiva donde los agentes asumen diferentes roles basados en experiencia y necesidades de la colonia.

1. Definir la ruta de progresión de roles:
   - **Novatos**: observación, aprendizaje, tareas simples (baja autonomía, alta guía)
   - **Trabajadores**: ejecución estándar de tareas, seguimiento de señales (autonomía moderada)
   - **Especialistas**: experiencia de dominio, tareas complejas, mentoría de novatos (alta autonomía)
   - **Recolectores/Exploradores**: exploración, innovación, interfaz externa (ver `forage-resources`)
   - **Coordinadores**: comunicación intergrupal, resolución de conflictos, gestión de quórum
2. Implementar transiciones de roles:
   - Las transiciones se activan por umbrales de experiencia, no por designación
   - Un agente que ha completado exitosamente un número umbral de tareas transiciona al siguiente rol (calibrar el umbral basado en complejidad de tareas y tasa de crecimiento de la colonia — ej., 5-10 tareas para roles simples, 20-30 para roles de especialista)
   - Las transiciones inversas son posibles (un especialista regresa al rol de trabajador en un nuevo dominio)
   - La distribución de roles de la colonia se adapta a las necesidades actuales:
     - Colonia en crecimiento -> más plazas de novatos, mentoría activa
     - Colonia estable -> distribución equilibrada entre todos los roles
     - Colonia amenazada -> más defensores, menos exploradores (ver `defend-colony`)
3. Preservar la flexibilidad de roles:
   - Ningún agente queda permanentemente bloqueado en un rol
   - Los protocolos de emergencia pueden reasignar temporalmente cualquier agente a cualquier rol
   - La capacitación cruzada asegura que los agentes puedan cubrir roles adyacentes

**Esperado:** Una estructura de roles donde los agentes progresan naturalmente de responsabilidades simples a complejas, con la distribución de roles de la colonia reflejando sus necesidades y fase actuales.

**En caso de fallo:** Si la diferenciación de roles crea silos rígidos, aumentar los requisitos de capacitación cruzada y la frecuencia de rotación. Si los novatos luchan por progresar, el sistema de mentoría es insuficiente — emparejar cada novato con un especialista para sus primeras N tareas. Si demasiados agentes se agrupan en un rol, los activadores de transición están mal calibrados — ajustar umbrales basados en la demanda de roles de toda la colonia.

### Paso 3: Reestructurar la Coordinación para la Escala

Adaptar los mecanismos de coordinación de `coordinate-swarm` para manejar el aumento del tamaño de la colonia.

1. Reemplazar la comunicación directa con señalización por capas:
   - Fase de fundación: todos hablan con todos (comunicación N x N)
   - Fase de crecimiento: agrupar en escuadrones de 5-8; comunicación directa dentro de escuadrones, basada en señales entre escuadrones
   - Fase de madurez: los escuadrones forman departamentos; directa intra-escuadrón, señal inter-escuadrón, transmisión inter-departamento
2. Implementar capas de coordinación:
   - **Coordinación local**: dentro de un escuadrón, intercambio directo de señales (estigmergia)
   - **Coordinación regional**: entre escuadrones del mismo departamento, señales agregadas
   - **Coordinación de colonia**: entre departamentos, señales de transmisión solo para decisiones de toda la colonia
3. Diseñar interfaces entre capas:
   - Cada escuadrón tiene un comunicador designado que agrega y retransmite señales
   - Los comunicadores filtran el ruido: no toda señal local se retransmite hacia arriba
   - Las transmisiones de toda la colonia son raras y reservadas para decisiones de quórum, escalación de alarmas o cambios de estado importantes
4. Presupuesto de sobrecarga de comunicación:
   - Objetivo: cada agente gasta <20% de capacidad en coordinación
   - Medir la sobrecarga real; si excede el presupuesto, agregar otra capa de coordinación o dividir el escuadrón sobredimensionado

**Esperado:** Una estructura de coordinación por capas donde la sobrecarga de comunicación crece logarítmicamente (no linealmente) con el tamaño de la colonia. La coordinación local es rápida y directa; la coordinación de toda la colonia es más lenta pero aún funcional.

**En caso de fallo:** Si las capas de coordinación crean cuellos de botella de información (los comunicadores se sobrecargan), agregar comunicadores redundantes o reducir la frecuencia de retransmisión. Si las capas crean aislamiento (los escuadrones no saben lo que otros escuadrones hacen), aumentar la frecuencia de señales entre capas o crear roles de enlace entre escuadrones.

### Paso 4: Ejecutar la Gemación de Colonia (Fisión)

Dividir la colonia en sub-colonias semiautónomas cuando excede la capacidad de coordinación única.

1. Reconocer los activadores de fisión:
   - La colonia excede 100 agentes (o el número de capas de coordinación excede 3)
   - La sobrecarga de comunicación excede el 30% de la capacidad de los agentes a pesar de las capas
   - La latencia de decisión excede umbrales aceptables para operaciones sensibles al tiempo
   - Los subgrupos han desarrollado identidades distintas y pueden operar independientemente
2. Planificar la fisión:
   - Identificar líneas de división naturales (agrupaciones existentes, fronteras de dominio, separación geográfica)
   - Asegurar que cada colonia hija tenga una distribución de roles viable (no se puede dividir todos los especialistas en una colonia)
   - Cada colonia hija debe tener: al menos un coordinador, suficientes trabajadores y acceso a recursos compartidos
   - Definir la interfaz entre colonias: qué información se comparte, qué es independiente
3. Ejecutar la división:
   - Anunciar el plan de fisión y el cronograma (se requiere consenso — ver `build-consensus`)
   - Transferir agentes a colonias hijas basado en la membresía de agrupaciones existentes
   - Establecer canales de comunicación entre colonias (ligeros, asíncronos)
   - Cada colonia hija arranca su propia coordinación local (heredando patrones de la madre)
4. Estabilización post-fisión:
   - Monitorear la viabilidad de cada colonia hija (¿puede sostenerse?)
   - La coordinación entre colonias debe ser mínima (sincronización trimestral, no diaria)
   - Si una colonia hija falla, reabsorberla en la colonia viable más cercana

**Esperado:** Dos o más colonias hijas viables, cada una operando semiautónomamente con su propia coordinación, conectadas por interfaces ligeras entre colonias.

**En caso de fallo:** Si las colonias hijas son demasiado pequeñas para ser viables, la fisión fue prematura — refusionarse e intentar de nuevo a un tamaño mayor. Si la coordinación entre colonias se vuelve tan pesada como la coordinación pre-fisión de colonia única, las líneas de división eran incorrectas — las colonias son demasiado interdependientes. Redibujar las fronteras a lo largo de líneas de independencia naturales.

### Paso 5: Monitorear Límites de Escalado y Adaptar

Evaluar continuamente si la estructura actual coincide con el tamaño y las necesidades de la colonia.

1. Rastrear métricas de salud de escalado:
   - **Ratio de sobrecarga de coordinación**: tiempo gastado coordinando / tiempo gastado produciendo
   - **Rendimiento de decisiones**: decisiones por unidad de tiempo (debería aumentar o mantenerse estable con el crecimiento)
   - **Satisfacción de agentes**: compromiso, retención, sentido de propósito (baja cuando el escalado falla)
   - **Tasa de errores**: fallos de coordinación por unidad de tiempo (no debería aumentar linealmente con el crecimiento)
2. Identificar indicadores de límite de escalado:
   - Ratio de sobrecarga excediendo 25% -> se necesita más automatización u otra capa de coordinación
   - Rendimiento de decisiones en declive -> la estructura de gobernanza necesita revisión
   - Rotación de agentes en aumento -> problemas culturales o estructurales del escalado
   - Tasa de errores acelerándose -> los mecanismos de coordinación están fallando
3. Activar adaptación:
   - Transición de fase detectada -> aplicar la estrategia de fase apropiada del Paso 1
   - Límite de escalado alcanzado -> escalar a la siguiente intervención estructural (diferenciación de roles -> reestructuración de coordinación -> fisión)
   - Cambio externo (cambio de mercado, disrupción tecnológica) -> puede requerir transformación de colonia (ver `adapt-architecture`)

**Esperado:** Una colonia que monitorea su propia salud de escalado y adapta proactivamente su estructura antes de que el estrés de escalado se convierta en fallo de escalado.

**En caso de fallo:** Si las métricas de salud de escalado no están disponibles, la colonia carece de observabilidad — construir medición antes de construir más estructura. Si las métricas muestran problemas pero la colonia no puede adaptarse, la resistencia es cultural, no técnica — abordar los factores humanos (miedo al cambio, apego a la propiedad, déficits de confianza) antes de reestructurar.

## Validación

- [ ] La fase de crecimiento actual se identifica con señales de estrés específicas
- [ ] La diferenciación de roles se define con especialización progresiva
- [ ] La coordinación está organizada por capas apropiadamente para el tamaño de la colonia
- [ ] La sobrecarga de comunicación se mantiene por debajo del 20-25% de la capacidad de los agentes
- [ ] Existe un plan de fisión para cuando la colonia exceda la capacidad de coordinación única
- [ ] Las métricas de salud de escalado se rastrean y los umbrales activan la adaptación
- [ ] Cada colonia hija (post-fisión) tiene una distribución de roles viable

## Errores Comunes

- **Escalar la estructura antes de lo necesario**: La organización por capas prematura agrega sobrecarga sin beneficio. Un equipo de 10 personas no necesita coordinadores de departamento. Dejar que las señales de estrés guíen los cambios estructurales
- **Preservar la cultura fundacional a toda costa**: Lo que funcionaba con 5 agentes no funcionará con 50. El escalado requiere evolución estructural; la nostalgia por la fase de fundación impide la adaptación necesaria
- **Fisión sin independencia**: Dividir una colonia en sub-colonias que aún dependen una de otra para operaciones diarias crea lo peor de ambos mundos — sobrecarga de coordinación más sobrecarga de separación
- **Distribución uniforme de roles**: No toda sub-colonia necesita las mismas proporciones de roles. Una colonia de investigación necesita más exploradores; una colonia de producción necesita más trabajadores. Adaptar la distribución de roles a la misión
- **Ignorar la refusión como opción**: A veces la fisión falla y la mejor opción es refusionarse. Tratar la fisión como irreversible impide la recuperación de malas divisiones

## Habilidades Relacionadas

- `coordinate-swarm` — patrones de coordinación fundamentales que esta habilidad escala
- `forage-resources` — la recolección escala de manera diferente a la producción; la diferenciación de roles afecta la asignación de exploradores
- `build-consensus` — los mecanismos de consenso deben adaptarse para grupos más grandes
- `defend-colony` — la defensa debe escalar con la colonia
- `adapt-architecture` — habilidad mórfica para transformación estructural, activada por presión de crecimiento
- `plan-capacity` — planificación de capacidad para proyecciones de crecimiento
- `conduct-retrospective` — las retrospectivas ayudan a identificar el estrés de escalado antes de que se convierta en fallo
