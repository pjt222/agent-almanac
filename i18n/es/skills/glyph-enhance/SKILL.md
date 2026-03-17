---
name: glyph-enhance
description: >
  Mejorar un glifo pictográfico existente basado en R para la capa de
  visualización. Cubre auditoría visual del glifo actual, diagnóstico de
  problemas específicos (proporciones, legibilidad, balance de resplandor),
  modificaciones dirigidas a la función del glifo, re-renderizado, y
  comparación antes/después. Usar cuando un glifo se renderiza mal a tamaños
  pequeños, su metáfora visual no es clara, tiene problemas de proporción, el
  efecto de resplandor neón está desequilibrado, o después de agregar nuevas
  paletas o cambiar el pipeline de renderizado.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, enhancement, icon, ggplot2, visualization, refinement
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Glyph Enhance

Mejorar un glifo pictográfico existente en la capa de visualización `viz/` — auditar su renderizado actual, diagnosticar problemas visuales, aplicar modificaciones dirigidas, re-renderizar, y comparar antes/después.

## Cuándo Usar

- Un glifo se renderiza mal a tamaños pequeños (detalles perdidos, formas se fusionan)
- La metáfora visual de un glifo no es clara o no coincide con la habilidad que representa
- Un glifo tiene problemas de proporción (demasiado grande, demasiado pequeño, descentrado)
- El efecto de resplandor neón domina o es insuficiente para el glifo
- Un glifo se ve bien en una paleta pero mal en otras
- Mejora por lotes después de agregar nuevas paletas o cambiar el pipeline de renderizado

## Entradas

- **Requerido**: ID de habilidad del glifo a mejorar (ej., `commit-changes`)
- **Requerido**: Problema específico a abordar (legibilidad, proporciones, resplandor, compatibilidad de paleta)
- **Opcional**: Glifo de referencia que demuestra el nivel de calidad deseado
- **Opcional**: Paleta(s) objetivo para optimizar (predeterminado: todas las paletas)

## Procedimiento

### Paso 1: Auditoría — Evaluar el estado actual

Examinar el glifo actual e identificar problemas específicos.

1. Localizar la función del glifo:
   - Glifos de habilidades: `viz/R/primitives*.R` y mapeados en `viz/R/glyphs.R`
   - Glifos de agentes: `viz/R/agent_primitives.R` y mapeados en `viz/R/agent_glyphs.R`
2. Leer la función del glifo para entender su estructura:
   - ¿Cuántas capas utiliza?
   - ¿Qué primitivas llama (de `primitives.R`, `primitives_2.R`, etc.)?
   - ¿Cuáles son los factores de escala y posicionamiento?
3. Ver la salida renderizada:
   - Verificar `viz/public/icons/cyberpunk/<domain>/<skillId>.webp` como la paleta de referencia
   - Si está disponible, verificar 2-3 otras paletas para renderizado entre paletas
   - Ver tanto a tamaño de icono (~48px en el grafo) como a tamaño de panel (~160px en el panel de detalles)
4. Puntuar el glifo en las **dimensiones de calidad**:

```
Glyph Quality Dimensions:
+----------------+------+-----------------------------------------------+
| Dimension      | 1-5  | Assessment Criteria                           |
+----------------+------+-----------------------------------------------+
| Readability    |      | Recognizable at 48px? Clear at 160px?         |
| Proportions    |      | Well-centered? Good use of the 100x100 canvas?|
| Metaphor       |      | Does the shape clearly represent the skill?    |
| Glow balance   |      | Glow enhances without overwhelming?            |
| Palette compat |      | Looks good across cyberpunk + viridis palettes?|
| Complexity     |      | Appropriate layer count (not too busy/sparse)? |
+----------------+------+-----------------------------------------------+
```

5. Identificar las 1-2 dimensiones con las puntuaciones más bajas — estos son los objetivos de mejora

**Esperado:** Un diagnóstico claro de lo que está mal con el glifo y qué dimensiones mejorar. La auditoría debe ser específica: "proporciones: el glifo usa solo el 40% del lienzo" no "se ve mal."

**En caso de fallo:** Si la función del glifo falta o la habilidad no está en `glyphs.R`, el glifo puede no haber sido creado todavía — usar `create-skill-glyph` en su lugar.

### Paso 2: Diagnóstico — Análisis de causa raíz

Determinar por qué existen los problemas identificados.

1. Para problemas de **legibilidad**:
   - ¿Demasiados detalles finos que se fusionan a tamaños pequeños?
   - ¿Contraste insuficiente entre elementos del glifo?
   - ¿Líneas demasiado delgadas (< 1.5 `size` a s=1.0)?
   - ¿Elementos demasiado cercanos?
2. Para problemas de **proporción**:
   - ¿Factor de escala `s` demasiado pequeño o demasiado grande?
   - ¿Desplazamiento del centro desde (50, 50)?
   - ¿Elementos extendiéndose más allá del área segura (rango 10-90)?
3. Para problemas de **resplandor**:
   - El ancho de trazo del glifo interactúa con `ggfx::with_outer_glow()`:
     - Líneas delgadas: el resplandor las hace borrosas
     - Rellenos gruesos: el resplandor agrega exceso de bloom
   - Múltiples elementos superpuestos: el resplandor compuesto crea puntos calientes
4. Para problemas de **compatibilidad de paleta**:
   - ¿El glifo usa colores codificados en duro en lugar de parámetros `col`/`bright`?
   - ¿Las paletas de bajo contraste (cividis, mako) hacen al glifo invisible?
   - ¿El glifo depende de variación de color que algunas paletas no proporcionan?
5. Documentar la causa raíz específica para cada problema

**Esperado:** Causas raíz que apuntan directamente a cambios de código. "El glifo es demasiado pequeño" -> "el factor de escala es 0.6 pero debería ser 0.8." "El resplandor domina" -> "tres polígonos rellenos superpuestos cada uno genera resplandor."

**En caso de fallo:** Si la causa raíz no es obvia por inspección de código, renderizar el glifo en aislamiento con diferentes parámetros para aislar el problema. Usar `render_glyph()` con un solo glifo para probar.

### Paso 3: Modificar — Aplicar correcciones dirigidas

Editar la función del glifo para abordar los problemas diagnosticados.

1. Abrir el archivo que contiene la función del glifo
2. Aplicar modificaciones específicas al diagnóstico:
   - **Escala/proporción**: Ajustar el multiplicador `s` o desplazamientos de elementos
   - **Legibilidad**: Simplificar elementos complejos, aumentar ancho de trazo, agregar espaciado
   - **Balance de resplandor**: Reducir áreas rellenas superpuestas, usar contornos donde los rellenos crean bloom
   - **Compatibilidad de paleta**: Asegurar que todos los colores deriven de parámetros `col`/`bright`, agregar alpha para profundidad
3. Seguir el **contrato de función de glifo**:
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. Preservar la firma de la función — no cambiar parámetros
5. Mantener las modificaciones mínimas: corregir los problemas diagnosticados, no rediseñar todo el glifo

**Esperado:** Una función de glifo modificada que aborda los problemas específicos identificados en los Pasos 1-2. Los cambios son dirigidos y mínimos — mejorar, no rediseñar.

**En caso de fallo:** Si las modificaciones empeoran otras dimensiones (ej., corregir proporciones rompe legibilidad), revertir e intentar un enfoque diferente. Si el glifo necesita un rediseño completo, usar `create-skill-glyph` en su lugar.

### Paso 4: Re-renderizar — Generar iconos actualizados

Renderizar el glifo modificado y verificar la corrección.

1. Re-renderizar el glifo específico usando el pipeline de compilación:
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-icons.R --only <domain> --no-cache
   ```
   Para glifos de agentes:
   ```bash
   Rscript build-agent-icons.R --only <agent-id> --no-cache
   ```
2. Verificar que los archivos de salida existen:
   - `viz/public/icons/<palette>/<domain>/<skillId>.webp` para cada paleta
3. Verificar tamaños de archivo — los iconos deben ser 2-15 KB (WebP):
   - Menos de 2 KB: el glifo puede ser demasiado simple o el renderizado falló
   - Más de 15 KB: el glifo puede ser demasiado complejo (demasiadas capas)

**Esperado:** Archivos de icono frescos generados para todas las paletas. Los tamaños de archivo están en el rango esperado.

**En caso de fallo:** Si `build-icons.R` da error, verificar la salida de la consola R para el error específico. Causas comunes: paréntesis de cierre faltante en la función del glifo, referencia a primitivas indefinidas, o devolver algo que no es una lista desde la función. Si el renderizado tiene éxito pero la salida está en blanco, las capas del glifo pueden estar fuera de los límites del lienzo.

### Paso 5: Comparar — Verificación antes/después

Verificar que la mejora mejoró las dimensiones objetivo.

1. Comparar renderizados anteriores y nuevos:
   - Ver la versión de paleta cyberpunk tanto a tamaño de icono (48px) como de panel (160px)
   - Ver al menos 2 otras paletas (una clara como turbo, una oscura como mako)
2. Re-puntuar las dimensiones de calidad del Paso 1:
   - Las dimensiones objetivo deben mejorar al menos 1 punto
   - Las dimensiones no objetivo no deben disminuir
3. Si el glifo se usa en el grafo de fuerzas, probarlo allí:
   - Iniciar el servidor HTTP: `python3 -m http.server 8080` desde `viz/`
   - Cargar el grafo y encontrar el nodo de la habilidad
   - Verificar que el icono se renderiza correctamente con zoom predeterminado y al hacer zoom
4. Documentar los cambios realizados y la mejora lograda

**Esperado:** Mejora medible en las dimensiones objetivo sin regresión en las demás. El glifo se ve mejor a ambos tamaños y en todas las paletas.

**En caso de fallo:** Si la mejora es marginal o hay regresión, revertir los cambios y reconsiderar el diagnóstico. A veces las limitaciones del glifo original son inherentes a la metáfora, no a la implementación — en ese caso, la metáfora misma puede necesitar cambiar (escalar a `create-skill-glyph`).

## Validación

- [ ] Glifo actual auditado con diagnóstico de problema específico
- [ ] Causa raíz identificada para cada problema
- [ ] Modificaciones dirigidas a problemas diagnosticados (no sobre-editado)
- [ ] Contrato de función de glifo preservado (firma sin cambios)
- [ ] Iconos re-renderizados para todas las paletas
- [ ] Comparación antes/después muestra mejora en dimensiones objetivo
- [ ] Sin regresión en dimensiones no objetivo
- [ ] Tamaños de archivo en rango esperado (2-15 KB WebP)
- [ ] Glifo se renderiza correctamente en contexto de grafo de fuerzas (si aplica)

## Errores Comunes

- **Sobre-mejora**: Corregir un problema y luego ajustar todo lo demás. Atenerse a los problemas diagnosticados
- **Romper el contrato**: Cambiar la firma de la función rompe el pipeline de renderizado. El contrato de 5 parámetros es inmutable
- **Optimización específica de paleta**: Hacer el glifo perfecto para cyberpunk pero pobre para viridis. Siempre verificar 3+ paletas
- **Ignorar renderizado a tamaño pequeño**: Un hermoso icono de 160px que se convierte en un borrón a 48px es una mejora fallida
- **Olvidar re-renderizar**: Editar la función sin ejecutar `build-icons.R` significa que los cambios no son visibles

## Habilidades Relacionadas

- `create-skill-glyph` — Crear un nuevo glifo desde cero (usar cuando la mejora no es suficiente)
- `ornament-style-mono` — Principios de diseño visual que aplican a la composición de glifos
- `chrysopoeia` — Metodología de extracción de valor paralela a la optimización de glifos (amplificar el oro, remover la escoria)
