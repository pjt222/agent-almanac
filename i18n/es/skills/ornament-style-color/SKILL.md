---
name: ornament-style-color
description: >
  Diseñar patrones ornamentales policromáticos fundamentados en la taxonomía clásica
  de ornamentación de Alexander Speltz. Se basa en el análisis estructural monocromo
  añadiendo paletas de color auténticas del período, mapeo color-a-motivo, y estilos
  de renderizado adecuados para ornamentación pintada, iluminada y esmaltada. Usar
  al crear diseños decorativos donde el color es integral a la tradición (azulejos
  islámicos, manuscritos iluminados, Art Nouveau), explorar cómo los períodos
  históricos usaban el color en la ornamentación, o producir imágenes de referencia
  coloreadas para diseño, ilustración o materiales educativos.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: natural
  tags: design, ornament, polychromatic, color, art-history, speltz, generative-ai, z-image
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Ornament Style — Color

Diseñar patrones ornamentales policromáticos combinando conocimiento histórico-artístico del color con generación de imágenes asistida por IA. Se construye sobre la base estructural de `ornament-style-mono` añadiendo paletas de color auténticas del período, principios de armonía cromática y estilos de renderizado adecuados para ornamentación pintada, iluminada y esmaltada.

## Cuándo Usar

- Crear diseños decorativos donde el color es integral a la tradición ornamental (ej., azulejos islámicos, manuscritos iluminados, carteles Art Nouveau)
- Explorar cómo los períodos históricos usaban el color en la ornamentación — paleta, distribución y significado simbólico
- Producir imágenes de referencia coloreadas para diseño, ilustración o materiales educativos
- Generar renderizados de motivos clásicos pintados, iluminados, de cerámica esmaltada o de vitral
- Estudiar la relación entre color y forma en las tradiciones ornamentales

## Entradas

- **Requerido**: Período histórico o estilo deseado (o "sorpréndeme" para selección aleatoria)
- **Requerido**: Contexto de aplicación (borde, medallón, friso, panel, azulejo, motivo independiente)
- **Opcional**: Preferencia de paleta de color (auténtica del período, personalizada o colores específicos)
- **Opcional**: Preferencia de motivo específico (acanto, arabesco, roseta, etc.)
- **Opcional**: Preferencia de estilo de renderizado (pintado, iluminado, cerámica esmaltada, vitral, acuarela)
- **Opcional**: Ambiente cromático (apagado/antiguo, equilibrado/natural, vívido/saturado)
- **Opcional**: Resolución y relación de aspecto objetivo
- **Opcional**: Valor de semilla para generación reproducible

## Procedimiento

### Paso 1: Seleccionar Período Histórico y Paleta de Color

Elegir un período e identificar su lenguaje cromático característico. El color en la ornamentación nunca es arbitrario — cada período tiene una paleta enraizada en pigmentos disponibles, simbolismo cultural y contexto material.

```
Historical Ornament Periods with Characteristic Palettes:
┌───────────────────┬─────────────────┬────────────────────────────────────────────────────────┐
│ Period            │ Date Range      │ Characteristic Palette                                  │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Egyptian          │ 3100–332 BCE    │ Lapis blue, gold/ochre, terracotta red, black, white   │
│                   │                 │ Mineral pigments: flat, unmodulated, high contrast      │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Greek             │ 800–31 BCE      │ Terracotta red, black, ochre, white, blue (rare)       │
│                   │                 │ Pottery palette; architectural color largely lost        │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Roman             │ 509 BCE–476 CE  │ Pompeii red, ochre yellow, black, white, verdigris     │
│                   │                 │ Fresco palette: warm earth tones, strong red dominant    │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Byzantine         │ 330–1453 CE     │ Gold (dominant), deep blue, crimson, purple, white      │
│                   │                 │ Mosaic tesserae: jewel tones, gold ground, luminous      │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Islamic           │ 7th–17th c.     │ Turquoise/cobalt blue, white, gold, emerald green       │
│                   │                 │ Tile glazes: luminous, saturated, geometric precision    │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Romanesque        │ 1000–1200 CE    │ Ochre, rust red, deep green, dark blue, cream           │
│                   │                 │ Manuscript and stone: earthy, muted, mineral-derived     │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Gothic            │ 1150–1500 CE    │ Ultramarine blue, ruby red, emerald green, gold, white  │
│                   │                 │ Stained glass + illumination: saturated, luminous        │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Renaissance       │ 1400–1600 CE    │ Rich earth tones, azure blue, gold leaf, warm greens    │
│                   │                 │ Oil and fresco: naturalistic, modulated, subtle          │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Baroque/Rococo    │ 1600–1780 CE    │ Pastel pink, powder blue, cream, gold, soft green       │
│                   │                 │ (Rococo) vs deep burgundy, gold, forest green (Baroque) │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Art Nouveau       │ 1890–1910 CE    │ Sage green, dusty rose, amber/gold, muted purple,      │
│                   │                 │ teal. Organic, muted, nature-derived palette             │
└───────────────────┴─────────────────┴────────────────────────────────────────────────────────┘
```

1. Si el usuario especificó un período, confirmar y notar su paleta característica
2. Si dijo "sorpréndeme", seleccionar aleatoriamente — ponderar hacia períodos con ricas tradiciones cromáticas (islámico, bizantino, gótico, Art Nouveau)
3. Notar el contexto material (fresco, mosaico, azulejo, vitral, impreso) ya que esto afecta cómo se renderiza el color

**Esperado:** Un período claramente identificado con su paleta característica y contexto material comprendidos.

**En caso de fallo:** Si el usuario solicita un período que no está en la tabla, investigar su lenguaje cromático usando WebSearch para "[período] ornament color palette pigments" y construir una entrada equivalente. La disponibilidad histórica de pigmentos es una guía confiable para colores auténticos del período.

### Paso 2: Definir la Paleta de Color

Traducir la paleta histórica en un conjunto específico de 3-5 colores con roles definidos.

**Color Role Framework:**
```
Color Distribution (60/30/10 Rule):
┌──────────────┬────────────┬──────────────────────────────────────────┐
│ Role         │ Proportion │ Function                                  │
├──────────────┼────────────┼──────────────────────────────────────────┤
│ Dominant     │ ~60%       │ Ground color or primary structural color  │
│ Secondary    │ ~30%       │ Motif fill or supporting structural color │
│ Accent       │ ~10%       │ Highlights, details, focal points         │
│ (Optional)   │ —          │ Additional accent or metallic (gold)      │
│ (Optional)   │ —          │ Background / ground if different from     │
│              │            │ dominant                                   │
└──────────────┴────────────┴──────────────────────────────────────────┘
```

**Color Harmony Approaches:**
- **Period-Authentic**: Use only colors available to the historical period's pigments and materials
- **Complementary**: Opposing colors on the color wheel (e.g., blue and gold/orange) — high contrast
- **Analogous**: Adjacent colors (e.g., sage green, teal, muted blue) — harmonious, subtle
- **Triadic**: Three equally spaced colors (e.g., red, blue, gold) — vibrant, balanced

1. Seleccionar 3-5 colores con roles nombrados (dominante, secundario, acento, opcional)
2. Elegir el enfoque de armonía
3. Asignar valores hex aproximados o nombres descriptivos de color
4. Notar el ambiente cromático: apagado/antiguo, equilibrado/natural, o vívido/saturado

**Example Palette Definitions:**
- **Islamic Tilework**: turquoise (dominant), white (secondary), cobalt blue (accent), gold (detail) — analogous + metallic — vivid
- **Art Nouveau Poster**: sage green (dominant), dusty rose (secondary), amber gold (accent) — analogous — muted
- **Byzantine Mosaic**: gold (dominant), deep blue (secondary), crimson (accent), white (detail) — complementary — vivid

**Esperado:** Una paleta de 3-5 colores nombrados con roles, proporciones, enfoque de armonía y ambiente definidos.

**En caso de fallo:** Si la selección de color se siente arbitraria, anclar al contexto material del período. Preguntar: "¿Qué pigmentos estaban físicamente disponibles?" y "¿Cuál era el material base?" (pan de oro sobre vitela, esmalte sobre cerámica, pintura sobre yeso). El material restringe y autentica la paleta.

### Paso 3: Analizar la Estructura del Motivo

Comprender la gramática estructural del motivo elegido, extendiendo el análisis monocromo con mapeo color-a-estructura.

1. Realizar el mismo análisis estructural que `ornament-style-mono` Paso 2:
   - Tipo de simetría (bilateral, radial, traslacional, puntual)
   - Andamiaje geométrico (círculo, rectángulo, triángulo, banda)
   - Patrón de relleno (sólido, con líneas, abierto, mixto)
   - Tratamiento de bordes (limpio, orgánico, entrelazado)

2. Agregar **mapeo color-a-estructura**:
   - ¿Qué elementos estructurales reciben qué colores?
   - ¿El color sigue la forma (cada figura recibe un color) o fluye (gradientes de color cruzan límites estructurales)?
   - ¿Dónde aparece el color de acento? (Típicamente en puntos focales, intersecciones o pequeños elementos de detalle)
   - ¿Cuál es el color del fondo/base?

**Example Mapping:**
```
Islamic Star Pattern:
- Star forms: turquoise (dominant)
- Interlocking geometric ground: white (secondary)
- Star center details: cobalt blue (accent)
- Outline/border: gold (detail)
→ Color follows form strictly — each geometric shape is one flat color
```

**Esperado:** Una descripción estructural con asignaciones de color explícitas para cada elemento estructural.

**En caso de fallo:** Si el mapeo color-a-estructura no es claro, estudiar ejemplos históricos usando WebSearch para "[período] [motivo] ornament color" y observar cómo se usaba realmente el color. La ornamentación histórica casi siempre usa el color para clarificar la estructura, no para oscurecerla.

### Paso 4: Construir el Prompt de Color

Construir el prompt de texto para la generación con Z-Image, incorporando paleta de color y estilo de renderizado.

**Prompt Template:**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], [color palette description],
[color mood], [structural details from Step 3],
[application context], [additional qualifiers]
```

**Color-Appropriate Rendering Styles:**
- `painted ornament` — brushwork visible, opaque colors, fresco or oil quality
- `illuminated manuscript` — gold leaf, rich jewel tones, vellum ground
- `glazed ceramic tile` — glossy surface, flat color, precise edges
- `stained glass` — translucent color, dark leading lines between shapes
- `watercolor illustration` — transparent washes, soft edges, paper visible
- `enamel on metal` — hard glossy color, metallic ground
- `mosaic` — small tesserae, visible gaps between pieces, luminous
- `printed poster` — flat color areas, Art Nouveau or Arts & Crafts quality

**Color Description in Prompts:**
- Name specific colors: "turquoise blue and gold on white ground"
- Describe the mood: "muted antique tones" or "vivid saturated jewel colors"
- Specify distribution: "blue dominant with gold accents" or "warm earth tones with red details"

**Example Prompts:**
- `glazed ceramic tile ornament in the Islamic style, geometric star pattern, turquoise blue and white with cobalt blue accents and gold outlines, vivid saturated colors, repeating tessellation, Iznik tilework quality`
- `illuminated manuscript border in the Gothic style, vine and trefoil ornament, ultramarine blue and ruby red with gold leaf details on cream vellum, rich jewel tones, vertical panel, medieval book of hours quality`
- `watercolor illustration of Art Nouveau floral ornament, whiplash curves with lily motif, sage green and dusty rose with amber gold accents, muted organic tones, vertical panel, Alphonse Mucha influence`

**Esperado:** Un prompt de 25-50 palabras que especifique estilo de renderizado, motivo, período, composición e información de color explícita.

**En caso de fallo:** Si el prompt produce color que no coincide con la paleta, cargar la descripción del color al inicio del prompt (ponerla antes de la descripción del motivo). Z-Image pondera más los tokens iniciales del prompt. También intentar nombrar colores hex específicos o nombres de pigmentos conocidos (ultramarino, bermellón, ocre).

### Paso 5: Configurar Parámetros de Generación

Seleccionar resolución y parámetros de generación. La ornamentación en color a menudo se beneficia de ligeramente más pasos de inferencia que la monocroma.

```
Resolution by Application (same as ornament-style-mono):
┌────────────────────┬─────────────────────┬────────────────────────────────┐
│ Application        │ Recommended         │ Rationale                      │
├────────────────────┼─────────────────────┼────────────────────────────────┤
│ Medallion / Roundel│ 1024x1024 (1:1)     │ Radial symmetry needs square   │
│ Tile / Repeat Unit │ 1024x1024 (1:1)     │ Square for seamless tiling     │
│ Horizontal Frieze  │ 1280x720 (16:9)     │ Wide format for running border │
│ Vertical Panel     │ 720x1280 (9:16)     │ Portrait format for columns    │
│ Wide Border        │ 1344x576 (21:9)     │ Ultrawide for architectural    │
│ General / Flexible │ 1152x896 (9:7)      │ Balanced landscape format      │
│ Large Detail       │ 1536x1536 (1:1)     │ Higher res for fine color work │
└────────────────────┴─────────────────────┴────────────────────────────────┘
```

1. Seleccionar resolución basada en el contexto de aplicación
2. Establecer `steps` en 10-12 para trabajo en color (el detalle cromático y la precisión de la paleta se benefician de más pasos)
3. Establecer `shift` en 3 (por defecto)
4. Elegir `random_seed: true` para exploración o `random_seed: false` con una semilla específica para reproducibilidad
5. Registrar todos los parámetros para documentación

**Esperado:** Un conjunto de parámetros completo. Notar que la ornamentación en color generalmente necesita 10+ pasos para buena fidelidad de paleta.

**En caso de fallo:** Si no se está seguro, usar 1024x1024 a 10 pasos. Este es un valor por defecto confiable para la mayoría de contextos de ornamentación en color.

### Paso 6: Generar la Imagen

Invocar la herramienta MCP Z-Image para producir el ornamento.

1. Llamar a `mcp__hf-mcp-server__gr1_z_image_turbo_generate` con:
   - `prompt`: el prompt construido en el Paso 4
   - `resolution`: del Paso 5
   - `steps`: del Paso 5 (se recomiendan 10-12)
   - `shift`: del Paso 5
   - `random_seed`: del Paso 5
   - `seed`: semilla específica si `random_seed` es false
2. Registrar el valor de semilla devuelto para reproducibilidad
3. Anotar el tiempo de generación

**Esperado:** Una imagen generada con formas ornamentales reconocibles y color visible. El color puede no coincidir perfectamente con la paleta especificada — esto se aborda en la evaluación.

**En caso de fallo:** Si la herramienta MCP no está disponible, verificar que hf-mcp-server esté configurado (ver `configure-mcp-server` o `troubleshoot-mcp-connection`). Si la imagen generada es enteramente abstracta, el prompt necesita lenguaje estructural más específico — volver al Paso 4. Si los colores están completamente equivocados, cargar los nombres de colores al inicio del prompt.

### Paso 7: Evaluar la Fidelidad del Color

Evaluar la imagen generada contra cinco criterios, extendiendo la rúbrica monocroma con evaluación específica de color.

```
Polychromatic Ornament Evaluation Rubric:
┌─────────────────────┬───────────────────────────────────────────────────────┐
│ Criterion           │ Evaluation Questions                                  │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 1. Palette Match    │ Do the colors in the image approximate the specified  │
│                     │ palette? Are the named colors present? Are there      │
│                     │ unwanted colors that break the palette?               │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Color            │ Does the color distribution roughly follow the        │
│    Distribution     │ 60/30/10 allocation? Is the dominant color actually   │
│                     │ dominant? Does the accent appear sparingly?           │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Rendering Style  │ Does the image look like the specified rendering      │
│                     │ style? Does a "glazed tile" look glossy and flat?     │
│                     │ Does "illuminated manuscript" show gold and vellum?   │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Period Accuracy  │ Would this design be recognizable as belonging to     │
│                     │ the specified period? Are motifs period-appropriate?   │
│                     │ Does the color usage match period conventions?        │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Form-Color       │ Does color clarify the ornamental structure or        │
│    Balance          │ obscure it? Can you "read" the motifs through the     │
│                     │ color? Does color follow form as intended?            │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

1. Puntuar cada criterio: **Fuerte** (cumple claramente), **Adecuado** (cumple parcialmente), **Débil** (no cumple)
2. Anotar observaciones específicas para cada criterio
3. Si 4+ criterios puntúan Fuerte, el diseño es exitoso
4. Si 2+ criterios puntúan Débil, volver al Paso 4 para refinamiento del prompt

**Esperado:** Una evaluación puntuada con observaciones específicas. La ornamentación en color es más difícil de controlar que la monocroma — esperar puntuaciones de Adecuado en la primera generación para coincidencia de paleta y distribución.

**En caso de fallo:** Si la mayoría de los criterios puntúan Débil, el prompt puede necesitar reestructuración fundamental. Correcciones comunes: mover los nombres de colores al inicio del prompt, usar menos colores, especificar el color de fondo explícitamente, aumentar los pasos a 12.

### Paso 8: Iterar o Finalizar

Refinar el diseño mediante iteración dirigida o aceptar el resultado.

**Color-Specific Iteration Strategies:**
1. **Palette correction**: If colors are wrong, put specific color names at the start of the prompt: "turquoise blue and gold: [rest of prompt]"
2. **Distribution correction**: Explicitly state proportions: "mostly turquoise blue with small gold accents"
3. **Rendering correction**: Strengthen the rendering style description: "in the style of Iznik ceramic tiles, glossy glaze surface"
4. **Seed-locked color tuning**: Keep the seed, change only the color description to adjust palette while maintaining composition
5. **Mood shift**: Change "vivid saturated" to "muted antique" or vice versa to adjust overall color intensity

**Iteration Budget:** Limit to 3 iterations per design concept. Color iteration often requires more prompt adjustment than monochrome.

1. Si la evaluación del Paso 7 indica debilidades específicas, aplicar la estrategia de corrección correspondiente
2. Regenerar usando el Paso 6
3. Re-evaluar usando el Paso 7
4. Aceptar cuando 4+ criterios puntúen Fuerte o el presupuesto de iteraciones se haya agotado

**Esperado:** Fidelidad de color mejorada después de 1-2 iteraciones. La coincidencia perfecta de paleta es improbable — apuntar a "reconociblemente en la familia de colores correcta."

**En caso de fallo:** Si la iteración no converge, la paleta de color puede ser demasiado específica para que el modelo la reproduzca confiablemente. Simplificar a menos colores (3 en lugar de 5), usar descripciones de color más amplias ("tonos cálidos terrosos" en lugar de valores hex específicos), o aceptar la aproximación más cercana.

### Paso 9: Documentar el Diseño

Crear un registro completo del diseño final para reproducibilidad y referencia.

1. Registrar lo siguiente:
   - **Period**: Historical period name and date range
   - **Motif**: Primary motif(s) used
   - **Rendering Style**: Painted, illuminated, glazed tile, etc.
   - **Color Palette**: Each color with its role and approximate hex value
     - Dominant: [color name] (~hex) — 60%
     - Secondary: [color name] (~hex) — 30%
     - Accent: [color name] (~hex) — 10%
     - Additional: [color name] (~hex) — detail/metallic
   - **Color Harmony**: Approach used (period-authentic, complementary, analogous, triadic)
   - **Color Mood**: Muted, balanced, or vivid
   - **Final Prompt**: The exact prompt that produced the accepted image
   - **Seed**: The seed value for reproduction
   - **Resolution**: The resolution used
   - **Steps/Shift**: Generation parameters
   - **Evaluation**: Brief notes on the five criteria scores
   - **Iterations**: Number of iterations and key changes made
2. Notar cómo la paleta generada se compara con la paleta de referencia histórica
3. Anotar observaciones específicas de color (colores que el modelo manejó bien o mal)
4. Sugerir aplicaciones potenciales y notas de adaptación cromática (ej., "la paleta se adaptaría bien a visualización en pantalla" o "necesitaría ajuste para impresión CMYK")

**Esperado:** Un registro reproducible con documentación completa de color incluyendo aproximaciones hex y análisis de paleta.

**En caso de fallo:** Si la documentación completa se siente excesiva, como mínimo registrar el prompt final, la semilla, y una lista de colores pretendidos vs. reales. Estos permiten reproducción y ajuste de paleta en futuras iteraciones.

## Validación

- [ ] Se seleccionó un período histórico específico con su paleta de color característica identificada
- [ ] Se definió una paleta de 3-5 colores con roles (dominante/secundario/acento) y proporciones
- [ ] El enfoque de armonía cromática fue elegido conscientemente (auténtico del período, complementario, análogo, triádico)
- [ ] La estructura del motivo fue analizada con mapeo color-a-estructura
- [ ] El prompt incluye nombres de colores explícitos y descripción del ambiente cromático
- [ ] El prompt especifica un estilo de renderizado apropiado para color (pintado, esmaltado, iluminado, etc.)
- [ ] La resolución coincide con el contexto de aplicación
- [ ] Los pasos establecidos en 10+ para fidelidad de color
- [ ] La imagen generada fue evaluada contra la rúbrica de 5 puntos
- [ ] El valor de semilla fue registrado para reproducibilidad
- [ ] El diseño final está documentado con prompt, semilla, paleta (con aproximaciones hex) y parámetros

## Errores Comunes

- **Depender solo de nombres de colores**: "Azul" es ambiguo — especificar "azul turquesa", "azul cobalto" o "azul ultramarino". Diferentes azules evocan períodos y ambientes completamente distintos
- **Demasiados colores**: Más de 5 colores en un prompt confunde al modelo y produce resultados turbios. La ornamentación histórica típicamente usa 3-4 colores más un fondo. La moderación es auténtica
- **Ignorar el color de fondo**: El color de fondo/base es tan importante como los colores del motivo. Vitela crema, cerámica blanca, pan de oro o fondo de piedra oscura cambia fundamentalmente cómo se leen todos los demás colores. Especificarlo explícitamente
- **Color sin base estructural**: Agregar color a ornamentación pobremente estructurada no la mejora. Si la versión monocroma no funciona, agregar color no ayudará — arreglar la estructura primero usando `ornament-style-mono`
- **Paletas anacrónicas**: Magenta brillante, colores neón o pasteles de caramelo no pertenecen a la ornamentación histórica. La disponibilidad de pigmentos restringe las paletas del período — respetar la restricción para resultados auténticos
- **Pasos insuficientes**: El detalle de color necesita más pasos de inferencia que el monocromo. Usar 8 pasos para trabajo en color frecuentemente produce renderizado de paleta lavado o impreciso. Usar 10-12

## Habilidades Relacionadas

- `ornament-style-mono` — la habilidad de base monocroma; siempre disponible como alternativa cuando el color no coopera, y recomendada como primer paso para comprender la estructura del motivo antes de agregar color
- `review-web-design` — los principios de teoría del color (contraste, armonía, ritmo) se aplican directamente a la composición cromática ornamental
- `meditate` — las prácticas de atención enfocada y visualización de color pueden informar el desarrollo de paletas
