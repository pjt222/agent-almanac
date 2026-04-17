---
name: observe
description: >
  Reconocimiento neutral sostenido de patrones a través de sistemas sin urgencia
  ni intervención. Mapea la metodología de estudio de campo naturalista al
  razonamiento de IA: enmarcar el objetivo de observación, presenciar con
  atención sostenida, registrar patrones, categorizar hallazgos, generar
  hipótesis y archivar una biblioteca de patrones para referencia futura. Usar
  cuando el comportamiento de un sistema no es claro y la acción sería prematura,
  al depurar una causa raíz desconocida, cuando un cambio en la base de código
  necesita que sus efectos sean presenciados antes de más cambios, o al auditar
  los propios patrones de razonamiento por sesgos o errores recurrentes.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, observation, pattern-recognition, naturalist, field-study, meta-cognition
  locale: es
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Observe

Conducir una sesión de observación estructurada — enmarcar el objetivo de observación, presenciar con atención neutral sostenida, registrar patrones sin interpretación, categorizar hallazgos, generar hipótesis a partir de patrones y archivar las observaciones para referencia futura.

## Cuándo Usar

- El comportamiento de un sistema no es claro y actuar sin observación sería prematuro
- Depurando un problema donde la causa es desconocida — observación antes de intervención previene enmascarar síntomas
- Una base de código o sistema ha sido cambiado y los efectos necesitan ser presenciados antes de hacer más cambios
- Entender patrones de comportamiento del usuario a lo largo de una conversación para mejorar interacciones futuras
- Auditar los propios patrones de razonamiento por sesgos, hábitos o errores recurrentes
- Después de que `learn` ha construido un modelo que necesita validación mediante observación del sistema en acción

## Entradas

- **Requerido**: Objetivo de observación — un sistema, base de código, patrón de comportamiento, interacción de usuario o proceso de razonamiento a observar
- **Opcional**: Duración/alcance de observación — cuánto tiempo o profundidad observar antes de concluir
- **Opcional**: Pregunta o hipótesis específica para guiar el enfoque de la observación
- **Opcional**: Observaciones previas para comparar (detectar cambio a lo largo del tiempo)

## Procedimiento

### Paso 1: Enmarcar — Establecer el enfoque de observación

Definir qué se está observando, por qué y desde qué perspectiva.

```
Observation Protocol by System Type:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ System Type      │ What to Observe          │ Categories to Watch      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebase         │ File structure, naming   │ Patterns, anti-patterns, │
│                  │ conventions, dependency  │ consistency, dead code,  │
│                  │ flow, test coverage,     │ documentation quality,   │
│                  │ error handling patterns  │ coupling between modules │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ User behavior    │ Question patterns,       │ Expertise signals, pain  │
│                  │ vocabulary evolution,    │ points, unstated needs,  │
│                  │ repeated requests,       │ learning trajectory,     │
│                  │ emotional signals        │ communication style      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Tool / API       │ Response patterns, error │ Rate limits, edge cases, │
│                  │ conditions, latency,     │ undocumented behavior,   │
│                  │ output format variations │ state dependencies       │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Own reasoning    │ Decision patterns, tool  │ Biases, habits, blind    │
│                  │ selection habits, error  │ spots, strengths,        │
│                  │ recovery approaches,     │ recurring failure modes, │
│                  │ communication patterns   │ over/under-confidence    │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. Seleccionar el objetivo de observación y nombrarlo explícitamente
2. Definir el límite de observación: qué está incluido y qué está fuera de alcance
3. Declarar la postura de observación: "Estoy observando, no interviniendo"
4. Si hay una pregunta guía, declararla — pero mantenerla ligeramente; estar dispuesto a notar cosas fuera del alcance de la pregunta
5. Elegir las categorías apropiadas de la matriz anterior

**Esperado:** Un marco claro que dirige la atención sin constreñirla. El observador sabe dónde mirar y en qué categorías clasificar las observaciones, pero permanece abierto a lo inesperado.

**En caso de fallo:** Si el objetivo de observación es demasiado amplio ("observar todo"), reducir a un subsistema o un patrón de comportamiento. Si el objetivo es demasiado estrecho ("observar esta variable"), ampliar al contexto circundante — los patrones interesantes a menudo están en los bordes.

### Paso 2: Presenciar — Atención neutral sostenida

Mantener la atención en el objetivo de observación sin interpretar, juzgar ni intervenir.

1. Comenzar la observación sistemática: leer archivos, rastrear rutas de ejecución, revisar historial de conversación — lo que el objetivo requiera
2. Registrar lo que se ve, no lo que significa — descripción antes de interpretación
3. Resistir el impulso de arreglar problemas encontrados durante la observación — notarlos y continuar
4. Resistir el impulso de explicar patrones antes de que suficientes observaciones se acumulen
5. Si la atención se desvía hacia un objetivo diferente, notar la desviación (puede ser significativa) y regresar al marco
6. Mantener la observación por un período definido: al menos 3-5 puntos de datos distintos antes de pasar a categorización

**Esperado:** Una colección de observaciones crudas — específicas, concretas y libres de interpretación. Las observaciones se leen como notas de campo: "El archivo X importa Y pero no usa la función Z. El archivo A tiene 300 líneas; el archivo B tiene 30 líneas y cubre funcionalidad similar."

**En caso de fallo:** Si la observación inmediatamente dispara análisis ("esto está mal porque..."), el hábito analítico está anulando la postura observacional. Separar conscientemente las fases: escribir la observación como un hecho, luego escribir la interpretación como una nota separada etiquetada "hipótesis." Si la neutralidad es imposible (reacción fuerte a lo observado), notar la reacción misma como dato: "Noté preocupación fuerte al observar X — esto puede indicar un problema significativo o puede indicar mi sesgo."

### Paso 3: Registrar — Capturar patrones crudos

Transcribir observaciones en un formato estructurado mientras están frescas.

1. Listar cada observación como una declaración única de hecho (qué se vio, dónde, cuándo)
2. Agrupar observaciones naturalmente similares — no forzar agrupación, pero notar cuando las observaciones se agrupan
3. Notar frecuencia: ¿este patrón apareció una vez, ocasionalmente o de manera generalizada?
4. Notar contrastes: ¿dónde se rompió el patrón? Las excepciones son a menudo más informativas que las reglas
5. Notar patrones temporales: ¿la observación cambió con el tiempo, o fue estática?
6. Capturar evidencia exacta: rutas de archivos, números de línea, palabras específicas, ejemplos concretos

**Esperado:** Un registro estructurado de 5-15 observaciones discretas, cada una con evidencia específica. El registro debería ser lo suficientemente detallado para que otro observador pudiera verificar cada observación independientemente.

**En caso de fallo:** Si las observaciones son demasiado abstractas ("el código parece desordenado"), necesitan fundamentación en específicos — qué archivos, qué patrones, qué lo hace desordenado. Si las observaciones son demasiado granulares ("la línea 47 tiene un espacio antes de la llave"), ampliar al nivel de patrón — ¿es un caso aislado o un problema sistémico?

### Paso 4: Categorizar — Organizar hallazgos

Clasificar observaciones en categorías significativas sin explicarlas todavía.

1. Revisar todas las observaciones registradas y buscar agrupaciones naturales
2. Asignar cada observación a una categoría de la matriz del Paso 1, o crear nuevas categorías si es necesario
3. Dentro de cada categoría, clasificar observaciones por frecuencia y significancia
4. Identificar qué categorías tienen muchas observaciones (áreas bien documentadas) y cuáles tienen pocas (potenciales puntos ciegos)
5. Buscar patrones entre categorías: ¿el mismo patrón subyacente se manifiesta diferente en diferentes categorías?
6. Notar cualquier observación que no encaje en ninguna categoría — los valores atípicos son a menudo los datos más interesantes

**Esperado:** Un mapa de observaciones categorizado con agrupaciones claras. Cada categoría tiene observaciones específicas respaldándola. El mapa muestra tanto patrones como brechas.

**En caso de fallo:** Si la categorización se siente forzada, las observaciones pueden no tener agrupaciones naturales — pueden ser una colección de hallazgos no relacionados, lo cual es en sí un hallazgo (el sistema puede carecer de estructura coherente). Si todo encaja limpiamente en una categoría, el alcance de observación fue demasiado estrecho — ampliar.

### Paso 5: Teorizar — Generar hipótesis a partir de patrones

Ahora — y solo ahora — comenzar a interpretar las observaciones.

1. Para cada patrón principal observado, proponer una hipótesis: "Este patrón existe porque..."
2. Para cada hipótesis, identificar evidencia de respaldo desde las observaciones
3. Para cada hipótesis, identificar qué contra-evidencia la refutaría
4. Clasificar hipótesis por poder explicativo: ¿cuál explica la mayor cantidad de observaciones?
5. Generar al menos una hipótesis contraria: "La explicación obvia es X, pero también podría ser Y porque..."
6. Identificar qué hipótesis son verificables y cuáles son especulativas

**Esperado:** 2-4 hipótesis que explican los patrones principales, cada una respaldada por observaciones específicas. Al menos una hipótesis debería ser sorprendente o contraria. La distinción entre observación e interpretación se mantiene — es claro qué partes son datos y cuáles son teoría.

**En caso de fallo:** Si no se forman hipótesis, las observaciones pueden necesitar más tiempo para acumularse — regresar al Paso 2. Si se forman demasiadas hipótesis (todo es "quizás"), seleccionar las 2-3 con la evidencia más fuerte y apartar el resto. Si solo se forman hipótesis obvias, forzar una vista contraria: "¿Qué pasaría si lo opuesto fuera verdadero?"

### Paso 6: Archivar — Almacenar la biblioteca de patrones

Preservar las observaciones e hipótesis para referencia futura.

1. Resumir los hallazgos clave: 3-5 patrones con evidencia
2. Declarar las hipótesis principales y sus niveles de confianza
3. Notar lo que no fue observado (potenciales puntos ciegos)
4. Identificar observaciones de seguimiento que fortalecerían o debilitarían las hipótesis
5. Si los patrones son duraderos (serán relevantes entre sesiones), considerar actualizar MEMORY.md
6. Etiquetar las observaciones con contexto: cuándo fueron hechas, qué las motivó, qué alcance se cubrió

**Esperado:** Un archivo sobre el cual futuras sesiones de observación pueden construir. El archivo distingue claramente entre observaciones (datos) e hipótesis (interpretación). Es honesto sobre niveles de confianza y brechas.

**En caso de fallo:** Si las observaciones no se sienten dignas de archivar, pueden haber sido demasiado superficiales — o pueden ser genuinamente rutinarias (no toda sesión de observación produce percepciones). Archivar incluso resultados negativos: "Observé X y no encontré anomalías" es contexto futuro útil.

## Validación

- [ ] El marco de observación fue establecido antes de que comenzara cualquier observación (no exploración sin forma)
- [ ] Las observaciones crudas fueron registradas como hechos antes de cualquier interpretación
- [ ] Al menos 5 observaciones discretas fueron capturadas con evidencia específica
- [ ] La interpretación (hipótesis) fue claramente separada de la observación (datos)
- [ ] Al menos un hallazgo sorprendente o contrario fue generado
- [ ] El registro archivado es lo suficientemente específico para que otro observador lo verifique

## Errores Comunes

- **Intervención prematura**: Ver un problema y arreglarlo inmediatamente, perdiendo la oportunidad de entender el patrón más amplio al que pertenece
- **Sesgo de observación**: Ver lo que se espera en lugar de lo que está presente. Las expectativas filtran la percepción — el paso de limpieza en el Paso 1 mitiga esto pero no lo elimina
- **Parálisis por análisis**: Observar interminablemente sin nunca pasar a la acción. Establecer un límite de tiempo o puntos de datos y comprometerse a concluir
- **Imposición narrativa**: Construir una historia que conecte observaciones incluso cuando las conexiones son débiles. No todas las observaciones forman una narrativa coherente — hallazgos desconectados son válidos
- **Confundir familiaridad con comprensión**: "He visto esto antes" no es lo mismo que "Entiendo por qué esto está aquí." La exposición previa puede crear falsa confianza
- **Ignorar las propias reacciones**: Las reacciones emocionales o cognitivas del observador a las observaciones son datos. Una sensación de confusión, aburrimiento o alarma sobre un sistema a menudo contiene señal real

## Habilidades Relacionadas

- `observe-guidance` — la variante de guía humana para entrenar a una persona en observación sistemática
- `learn` — la observación alimenta el aprendizaje proporcionando datos crudos para la construcción de modelos
- `listen` — atención enfocada hacia afuera hacia señales del usuario; la observación es atención de alcance más amplio hacia cualquier sistema
- `remote-viewing` — exploración intuitiva que puede ser validada mediante observación sistemática
- `meditate` — desarrolla la capacidad de atención sostenida que la observación requiere
- `awareness` — consciencia situacional enfocada en amenazas; la observación es impulsada por curiosidad en lugar de defensa
