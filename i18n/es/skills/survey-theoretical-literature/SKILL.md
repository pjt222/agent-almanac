---
name: survey-theoretical-literature
description: >
  Realizar un relevamiento y síntesis de la literatura teórica sobre un tema
  específico, identificando artículos seminales, resultados clave, problemas
  abiertos y conexiones entre dominios. Usar al comenzar investigación sobre
  un tema teórico desconocido, al escribir una revisión de literatura para un
  artículo o tesis, al identificar problemas abiertos y brechas de investigación,
  al encontrar conexiones entre dominios, o al evaluar la novedad de una
  contribución teórica propuesta contra el trabajo existente.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: intermediate
  language: natural
  tags: theoretical, literature, survey, synthesis, review, research
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Survey Theoretical Literature

Realizar un relevamiento estructurado de la literatura teórica sobre un tema definido, produciendo una síntesis que mapee las contribuciones seminales, trace el desarrollo cronológico de las ideas clave, identifique problemas abiertos y fronteras de investigación activas, y destaque conexiones entre dominios.

## Cuándo Usar

- Comenzar investigación sobre un tema teórico desconocido y necesitar mapear el panorama
- Escribir una sección de revisión de literatura para un artículo, tesis o propuesta de subvención
- Identificar problemas abiertos y brechas en un campo teórico
- Encontrar conexiones entre un resultado teórico y trabajo en campos adyacentes
- Evaluar la novedad de una contribución teórica propuesta contra el trabajo existente

## Entradas

- **Requerido**: Descripción del tema (lo suficientemente específica para acotar la búsqueda; ej., "fases topológicas en sistemas no hermitianos" no solo "topología")
- **Requerido**: Restricciones de alcance (período temporal, subcampos a incluir/excluir, enfoque teórico vs. experimental)
- **Opcional**: Artículos semilla conocidos (artículos que el solicitante ya conoce, para anclar la búsqueda)
- **Opcional**: Audiencia objetivo y profundidad (panorama introductorio vs. relevamiento de nivel experto)
- **Opcional**: Formato de salida deseado (bibliografía anotada, revisión narrativa, mapa conceptual)

## Procedimiento

### Paso 1: Definir Alcance y Términos de Búsqueda

Acotar el relevamiento con precisión antes de buscar:

1. **Declaración del tema central**: Escribir una sola oración que defina lo que cubre el relevamiento. Esta oración es el criterio de aceptación para determinar si un artículo pertenece al relevamiento.
2. **Términos de búsqueda**: Generar términos de búsqueda primarios y secundarios:
   - Términos primarios: las frases técnicas exactas usadas por los practicantes (ej., "ecuaciones de Kohn-Sham", "fase de Berry", "grupo de renormalización")
   - Términos secundarios: frases más amplias o adyacentes que podrían capturar trabajo relevante de otras comunidades (ej., "fase geométrica" como sinónimo de "fase de Berry")
   - Términos de exclusión: frases que atraerían resultados irrelevantes (ej., excluir "Berry" en el sentido botánico)
3. **Alcance temporal**: Definir la ventana de tiempo. Para un campo maduro, los artículos seminales pueden tener décadas pero los avances recientes pueden acotarse a los últimos 5-10 años. Para un campo emergente, toda la historia puede abarcar solo unos pocos años.
4. **Límites del dominio**: Declarar explícitamente qué subcampos están dentro del alcance y cuáles no. Por ejemplo, un relevamiento sobre corrección cuántica de errores podría incluir códigos topológicos pero excluir la teoría de codificación clásica.

```markdown
## Survey Scope
- **Core topic**: [one-sentence definition]
- **Primary search terms**: [list]
- **Secondary search terms**: [list]
- **Exclusion terms**: [list]
- **Time window**: [start year] to [end year]
- **In scope**: [subfields]
- **Out of scope**: [subfields]
```

**Esperado:** Una definición de alcance lo suficientemente ajustada para que dos investigadores independientemente acuerden si un artículo dado pertenece al relevamiento.

**En caso de fallo:** Si el alcance es demasiado amplio (más de ~200 artículos potencialmente relevantes), acotar agregando restricciones de subcampo o ajustando la ventana temporal. Si es demasiado estrecho (menos de ~10 artículos), ampliar los términos de búsqueda secundarios o extender la ventana temporal.

### Paso 2: Identificar Artículos Seminales y Resultados Clave

Construir la columna vertebral del relevamiento a partir de las contribuciones más influyentes:

1. **Descubrimiento basado en semillas**: Comenzar desde los artículos semilla (si se proporcionan) o desde el artículo de revisión más reciente sobre el tema. Rastrear referencias hacia atrás y citas hacia adelante para identificar los artículos que aparecen repetidamente.
2. **Heurística de conteo de citas**: Usar conteos de citas como proxy aproximado de influencia, pero ponderar más los artículos recientes (últimos 5 años) ya que han tenido menos tiempo para acumular citas.
3. **Criterios de artículo seminal**: Un artículo califica como seminal si cumple al menos uno de:
   - Introdujo un concepto, formalismo o método fundacional
   - Demostró un resultado que redirigió el campo
   - Unificó hebras de trabajo previamente dispares
   - Es citado por la mayoría de artículos subsiguientes en el campo
4. **Extracción de resultados clave**: Para cada artículo seminal, extraer:
   - El resultado principal (teorema, ecuación, predicción o método)
   - Las suposiciones o aproximaciones requeridas
   - El impacto en el trabajo subsiguiente

```markdown
## Seminal Papers
| # | Authors (Year) | Title | Main Result | Impact |
|---|---------------|-------|-------------|--------|
| 1 | [authors] ([year]) | [title] | [one-sentence result] | [influence on field] |
| 2 | ... | ... | ... | ... |
```

**Esperado:** Una tabla de 5-15 artículos seminales que forman la columna vertebral intelectual del tema, con el resultado principal e impacto de cada artículo claramente declarados.

**En caso de fallo:** Si la búsqueda no produce artículos seminales claros, el tema puede ser demasiado nuevo o demasiado nicho. En ese caso, identificar los artículos más tempranos y los más citados como anclas, y notar que las referencias canónicas del campo aún no han emergido.

### Paso 3: Mapear el Desarrollo de Ideas Cronológicamente

Rastrear cómo evolucionó el campo desde sus orígenes hasta el presente:

1. **Fase de origen**: Identificar cuándo y dónde aparecieron las ideas centrales por primera vez. Notar si las ideas se originaron dentro del campo objetivo o fueron importadas de otro dominio.
2. **Fase de crecimiento**: Rastrear cómo los resultados iniciales fueron generalizados, aplicados o cuestionados. Identificar puntos de inflexión clave donde la dirección del campo cambió (ej., una nueva técnica de demostración, un contraejemplo inesperado, una confirmación experimental).
3. **Puntos de ramificación**: Mapear dónde la literatura se ramifica en subtemas. Para cada rama, caracterizar brevemente su enfoque y su relación con el tronco principal.
4. **Estado actual**: Caracterizar dónde se encuentra el campo hoy. ¿Está maduro (los resultados se están consolidando), activo (desarrollo rápido), o estancado (pocos artículos recientes)?
5. **Construcción de línea temporal**: Construir una línea temporal cronológica de los desarrollos más importantes.

```markdown
## Chronological Development

### Origin ([decade])
- [event/paper]: [description of foundational contribution]

### Key Developments
- **[year]**: [milestone and its significance]
- **[year]**: [milestone and its significance]
- ...

### Branching Points
- **[year]**: Field splits into [branch A] and [branch B]
  - Branch A focuses on [topic]
  - Branch B focuses on [topic]

### Current State ([year])
- **Activity level**: [mature / active / emerging / stagnant]
- **Dominant approach**: [current mainstream methodology]
- **Recent trend**: [direction of latest work]
```

**Esperado:** Una línea temporal narrativa que un recién llegado podría leer para comprender cómo el campo llegó a su estado actual, incluyendo el linaje intelectual de las ideas clave.

**En caso de fallo:** Si la cronología no es clara (ej., múltiples descubrimientos independientes, prioridad disputada), documentar la ambigüedad en lugar de imponer una narrativa lineal falsa. Las líneas temporales paralelas son aceptables.

### Paso 4: Identificar Problemas Abiertos y Fronteras Activas

Catalogar lo que aún no se conoce o está resuelto:

1. **Problemas abiertos declarados explícitamente**: Buscar artículos de revisión, listas de problemas y artículos de relevamiento que listen explícitamente preguntas abiertas. Muchos campos mantienen listas canónicas (ej., los Problemas del Milenio de Clay, los problemas de Hilbert, problemas abiertos en información cuántica).
2. **Problemas implícitamente abiertos**: Identificar resultados que están conjeturados pero no demostrados, observaciones numéricas sin explicación teórica, o discrepancias entre teoría y experimento.
3. **Fronteras activas**: Identificar los temas que están recibiendo más atención en los últimos 2-3 años. Estos se caracterizan por una alta tasa de nuevos preprints, sesiones de conferencias y convocatorias de financiamiento.
4. **Barreras al progreso**: Para cada problema abierto importante, describir brevemente por qué es difícil. ¿Qué obstáculo matemático o conceptual se interpone?
5. **Impacto potencial**: Para cada problema abierto, estimar el impacto de su resolución. ¿Sería incremental (llenar una brecha) o transformador (cambiar cómo piensa el campo)?

```markdown
## Open Problems and Frontiers

### Explicitly Open
| # | Problem | Status | Barrier | Potential Impact |
|---|---------|--------|---------|-----------------|
| 1 | [statement] | [conjecture / partial / open] | [why hard] | [incremental / significant / transformative] |
| 2 | ... | ... | ... | ... |

### Active Frontiers
- **[frontier topic]**: [what is happening and why it matters]
- ...

### Implicit Gaps
- [observation without theoretical explanation]
- [conjecture without proof]
- ...
```

**Esperado:** Un catálogo estructurado de al menos 3-5 problemas abiertos con evaluaciones de dificultad, más una caracterización de las fronteras de investigación más activas.

**En caso de fallo:** Si no hay problemas abiertos aparentes, el alcance del relevamiento puede ser demasiado estrecho (el subtema está resuelto) o la búsqueda de literatura omitió los artículos de revisión relevantes. Ampliar el alcance o buscar específicamente "problemas abiertos en [tema]" y "direcciones futuras en [tema]."

### Paso 5: Sintetizar Conexiones entre Dominios y Producir Relevamiento Estructurado

Conectar el campo relevado con áreas adyacentes y ensamblar la salida final:

1. **Conexiones entre dominios**: Identificar dónde el tema relevado conecta con otros campos:
   - Estructuras matemáticas compartidas (ej., la misma ecuación apareciendo en óptica y mecánica cuántica)
   - Analogías y dualidades (ej., AdS/CFT conectando gravedad y teoría de campos)
   - Importaciones metodológicas (ej., técnicas de aprendizaje automático aplicadas a física teórica)
   - Conexiones experimentales (ej., predicciones verificables en sistemas de átomos fríos o fotónicos)

2. **Evaluación de calidad de conexiones**: Para cada conexión, evaluar si es:
   - Profunda (equivalencia estructural, dualidad demostrada)
   - Prometedora (analogía sugestiva, investigación activa)
   - Superficial (similitud de superficie, sin relación demostrada)

3. **Análisis de brechas**: Identificar conexiones que deberían existir pero no han sido exploradas. Estas son oportunidades potenciales de investigación.

4. **Ensamblaje del relevamiento**: Compilar las salidas de los Pasos 1-5 en un documento estructurado:
   - Resumen ejecutivo (1 párrafo)
   - Alcance y metodología (del Paso 1)
   - Desarrollo histórico (del Paso 3)
   - Resultados clave y artículos seminales (del Paso 2)
   - Problemas abiertos y fronteras (del Paso 4)
   - Conexiones entre dominios (de este paso)
   - Bibliografía

```markdown
## Cross-Domain Connections
| # | Connected Field | Type of Connection | Depth | Key Reference |
|---|----------------|-------------------|-------|---------------|
| 1 | [field] | [shared math / analogy / method import] | [deep / promising / superficial] | [paper] |
| 2 | ... | ... | ... | ... |

## Unexplored Connections (Research Opportunities)
- [potential connection]: [why it might exist and what it could yield]
- ...
```

**Esperado:** Un documento de relevamiento completo y estructurado que mapea el tema desde sus orígenes hasta las fronteras actuales, con conexiones entre dominios identificadas y evaluadas.

**En caso de fallo:** Si el relevamiento se siente desarticulado, revisar la línea temporal cronológica (Paso 3) y usarla como columna organizativa. Cada artículo seminal, problema abierto y conexión entre dominios debería ser localizable en la línea temporal.

## Validación

- [ ] El alcance del relevamiento está definido con precisión con criterios de inclusión y exclusión
- [ ] Los artículos seminales están identificados con resultados principales e impacto declarados
- [ ] El desarrollo cronológico está rastreado con hitos clave
- [ ] Al menos 3-5 problemas abiertos están catalogados con evaluaciones de dificultad e impacto
- [ ] Las conexiones entre dominios están identificadas y su profundidad está evaluada
- [ ] La bibliografía incluye todos los artículos citados con información de referencia completa
- [ ] Un recién llegado al campo podría leer el relevamiento y comprender el panorama
- [ ] El relevamiento distingue resultados establecidos de conjeturas y preguntas abiertas
- [ ] La fecha de escritura del relevamiento está declarada para que los lectores puedan evaluar la vigencia

## Errores Comunes

- **Desviación de alcance**: Comenzar con un tema enfocado y expandirse gradualmente para incluir todo lo tangencialmente relacionado. La oración del tema central del Paso 1 es el criterio de aceptación; aplicarlo sin piedad.
- **Sesgo de recencia**: Sobre-representar trabajo reciente a expensas de contribuciones fundacionales. Un artículo de 2024 con 10 citas puede ser menos importante que uno de 1980 con 5,000 citas. Ponderar influencia, no novedad.
- **Culto al conteo de citas**: Usar conteos de citas como la única medida de importancia. Los artículos altamente citados pueden ser herramientas metodológicas (ampliamente usadas pero no conceptualmente profundas) mientras que artículos transformadores en campos nicho pueden ser menos citados.
- **Omitir los resultados negativos**: Los intentos fallidos y las conjeturas refutadas son parte de la historia del campo. Omitirlos da una narrativa engañosamente suave.
- **Conexiones superficiales entre dominios**: Afirmar una conexión entre dos campos porque usan la misma palabra (ej., "entropía" en termodinámica y teoría de la información están relacionadas, pero "calibre" en física y tejido no lo están). Evaluar la profundidad antes de incluir.
- **Presentismo**: Juzgar artículos históricos por estándares modernos. Un artículo de 1960 debería evaluarse por su contribución dado lo que se conocía en 1960, no por lo que falló en anticipar.

## Habilidades Relacionadas

- `formulate-quantum-problem` -- formular problemas específicos identificados durante el relevamiento de literatura
- `derive-theoretical-result` -- derivar o re-derivar resultados clave encontrados en la literatura relevada
- `review-research` -- evaluar artículos individuales encontrados durante el relevamiento
