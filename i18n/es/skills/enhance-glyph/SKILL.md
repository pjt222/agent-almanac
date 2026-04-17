---
name: enhance-glyph
locale: es
source_locale: en
source_commit: acc252e6
translator: claude
translation_date: "2026-03-18"
description: >
  Mejorar un pictograma (glyph) existente basado en R para la capa de
  visualizacion. Cubre la auditoria visual del glyph actual, el diagnostico de
  problemas especificos (proporciones, legibilidad, balance del resplandor),
  modificaciones dirigidas a la funcion del glyph, re-renderizado y comparacion
  antes/despues. Funciona para glyphs de habilidades, agentes y equipos. Usar
  cuando un glyph se renderiza mal a tamanos pequenos, su metafora visual es
  confusa, tiene problemas de proporcion, el efecto de resplandor neon esta
  desequilibrado, o despues de agregar nuevas paletas o cambiar el pipeline de
  renderizado.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, enhancement, icon, ggplot2, visualization, refinement
---

# Mejorar Glyph

Mejorar un pictograma (glyph) existente en la capa de visualizacion `viz/` — auditar su renderizado actual, diagnosticar problemas visuales, aplicar modificaciones dirigidas, re-renderizar y comparar antes/despues. Funciona para glyphs de habilidades, agentes y equipos.

## Cuando Usar

- Un glyph se renderiza mal a tamanos pequenos (detalles perdidos, formas que se fusionan)
- La metafora visual de un glyph es confusa o no coincide con la entidad que representa
- Un glyph tiene problemas de proporcion (demasiado grande, demasiado pequeno, descentrado)
- El efecto de resplandor neon abruma o resulta insuficiente para el glyph
- Un glyph se ve bien en una paleta pero mal en otras
- Mejora en lote despues de agregar nuevas paletas o cambiar el pipeline de renderizado

## Entradas

- **Requerido**: Tipo de entidad — `skill`, `agent` o `team`
- **Requerido**: ID de la entidad del glyph a mejorar (p. ej., `commit-changes`, `mystic`, `tending`)
- **Requerido**: Problema especifico a abordar (legibilidad, proporciones, resplandor, compatibilidad de paleta)
- **Opcional**: Glyph de referencia que demuestra el nivel de calidad deseado
- **Opcional**: Paleta(s) objetivo para optimizar (predeterminado: todas las paletas)

## Procedimiento

### Paso 1: Auditoria — Evaluar el Estado Actual

Examinar el glyph actual e identificar problemas especificos.

1. Localizar la funcion del glyph segun el tipo de entidad:
   - **Habilidades**: `viz/R/primitives*.R` (19 archivos agrupados por dominio), mapeados en `viz/R/glyphs.R`
   - **Agentes**: `viz/R/agent_primitives.R`, mapeados en `viz/R/agent_glyphs.R`
   - **Equipos**: `viz/R/team_primitives.R`, mapeados en `viz/R/team_glyphs.R`
2. Leer la funcion del glyph para comprender su estructura:
   - Cuantas capas utiliza?
   - Que primitivas invoca?
   - Cuales son los factores de escala y posicionamiento?
3. Ver la salida renderizada:
   - Habilidades: `viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - Agentes: `viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - Equipos: `viz/public/icons/cyberpunk/teams/<teamId>.webp`
   - Si esta disponible, comprobar 2-3 paletas adicionales para renderizado cruzado
   - Ver tanto a tamano de icono (~48px en el grafo) como a tamano de panel (~160px en el panel de detalle)
4. Puntuar el glyph en las **dimensiones de calidad**:

```
Glyph Quality Dimensions:
+----------------+------+-----------------------------------------------+
| Dimension      | 1-5  | Assessment Criteria                           |
+----------------+------+-----------------------------------------------+
| Readability    |      | Recognizable at 48px? Clear at 160px?         |
| Proportions    |      | Well-centered? Good use of the 100x100 canvas?|
| Metaphor       |      | Does the shape clearly represent the entity?   |
| Glow balance   |      | Glow enhances without overwhelming?            |
| Palette compat |      | Looks good across cyberpunk + viridis palettes?|
| Complexity     |      | Appropriate layer count (not too busy/sparse)? |
+----------------+------+-----------------------------------------------+
```

5. Identificar las 1-2 dimensiones con las puntuaciones mas bajas — estos son los objetivos de mejora

**Esperado:** Un diagnostico claro de lo que esta mal con el glyph y que dimensiones mejorar. La auditoria debe ser especifica: "proporciones: el glyph usa solo el 40% del lienzo", no "se ve mal".

**En caso de fallo:** Si la funcion del glyph no existe o la entidad no esta en su mapeo `*_glyphs.R`, es posible que el glyph aun no se haya creado — usar `create-glyph` en su lugar.

### Paso 2: Diagnostico — Analisis de Causa Raiz

Determinar por que existen los problemas identificados.

1. Para problemas de **legibilidad**:
   - Demasiados detalles finos que se fusionan a tamanos pequenos?
   - Contraste insuficiente entre elementos del glyph?
   - Lineas demasiado delgadas (< 1.5 `size` a s=1.0)?
   - Elementos demasiado cercanos entre si?
2. Para problemas de **proporcion**:
   - Factor de escala `s` demasiado pequeno o demasiado grande?
   - Desplazamiento del centro respecto a (50, 50)?
   - Elementos que se extienden fuera del area segura (rango 10-90)?
3. Para problemas de **resplandor**:
   - El ancho de trazo del glyph interactua con `ggfx::with_outer_glow()`:
     - Lineas delgadas: el resplandor las hace difusas
     - Rellenos gruesos: el resplandor agrega excesivo brillo
   - Multiples elementos superpuestos: el resplandor compuesto crea puntos calientes
4. Para problemas de **compatibilidad de paleta**:
   - El glyph usa colores codificados directamente en lugar de los parametros `col`/`bright`?
   - Las paletas de bajo contraste (cividis, mako) hacen invisible al glyph?
   - El glyph depende de variacion de color que algunas paletas no proporcionan?
5. Documentar la causa raiz especifica de cada problema

**Esperado:** Causas raiz que apuntan directamente a cambios en el codigo. "El glyph es demasiado pequeno" -> "el factor de escala es 0.6 pero deberia ser 0.8." "El resplandor abruma" -> "tres poligonos rellenos superpuestos, cada uno genera resplandor."

**En caso de fallo:** Si la causa raiz no es obvia desde la inspeccion del codigo, renderizar el glyph aisladamente con diferentes parametros para aislar el problema. Usar `render_glyph()` con un solo glyph para probar.

### Paso 3: Modificar — Aplicar Correcciones Dirigidas

Editar la funcion del glyph para abordar los problemas diagnosticados.

1. Abrir el archivo que contiene la funcion del glyph
2. Aplicar modificaciones especificas al diagnostico:
   - **Escala/proporcion**: Ajustar el multiplicador de `s` o los desplazamientos de elementos
   - **Legibilidad**: Simplificar elementos complejos, aumentar el ancho de trazo, agregar espaciado
   - **Balance de resplandor**: Reducir areas rellenas superpuestas, usar contornos donde los rellenos crean brillo excesivo
   - **Compatibilidad de paleta**: Asegurar que todos los colores deriven de los parametros `col`/`bright`, agregar alfa para profundidad
3. Seguir el **contrato de la funcion del glyph**:
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. Preservar la firma de la funcion — no cambiar los parametros
5. Mantener las modificaciones minimas: corregir los problemas diagnosticados, no redisenar todo el glyph

**Esperado:** Una funcion de glyph modificada que aborda los problemas especificos identificados en los Pasos 1-2. Los cambios son dirigidos y minimos — mejorar, no redisenar.

**En caso de fallo:** Si las modificaciones empeoran otras dimensiones (p. ej., corregir proporciones rompe la legibilidad), revertir e intentar un enfoque diferente. Si el glyph necesita un rediseno completo, usar `create-glyph` en su lugar.

### Paso 4: Re-renderizar — Generar Iconos Actualizados

Renderizar el glyph modificado y verificar la correccion.

1. Re-renderizar segun el tipo de entidad:

   **Para habilidades:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-icons.R --only <domain> --no-cache
   ```

   **Para agentes:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-agent-icons.R --only <agent-id> --no-cache
   ```

   **Para equipos:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-team-icons.R --only <team-id> --no-cache
   ```

2. Verificar que los archivos de salida existen en la ruta esperada para cada paleta
3. Comprobar tamanos de archivo — los iconos deben ser de 2-15 KB (WebP):
   - Menos de 2 KB: el glyph puede ser demasiado simple o el renderizado fallo
   - Mas de 15 KB: el glyph puede ser demasiado complejo (demasiadas capas)

**Esperado:** Archivos de iconos frescos generados para todas las paletas. Los tamanos de archivo estan en el rango esperado.

**En caso de fallo:** Si el script de construccion produce errores, revisar la salida de la consola R para el error especifico. Causas comunes: parentesis de cierre faltante en la funcion del glyph, referencia a primitivas indefinidas, o devolver algo que no es una lista desde la funcion. Si el renderizado tiene exito pero la salida esta en blanco, las capas del glyph pueden estar fuera de los limites del lienzo.

### Paso 5: Comparar — Verificacion Antes/Despues

Verificar que la mejora realmente mejoro las dimensiones objetivo.

1. Comparar renderizados antiguos y nuevos:
   - Ver la version de la paleta cyberpunk tanto a tamano de icono (48px) como de panel (160px)
   - Ver al menos 2 paletas adicionales (una clara como turbo, una oscura como mako)
2. Re-puntuar las dimensiones de calidad del Paso 1:
   - Las dimensiones objetivo deben mejorar al menos 1 punto
   - Las dimensiones no objetivo no deben disminuir
3. Si el glyph se usa en el grafo de fuerzas, probarlo ahi:
   - Iniciar el servidor HTTP: `python3 -m http.server 8080` desde `viz/`
   - Cargar el grafo y encontrar el nodo de la entidad
   - Verificar que el icono se renderiza correctamente al zoom predeterminado y al hacer zoom
4. Documentar los cambios realizados y la mejora lograda

**Esperado:** Mejora medible en las dimensiones objetivo sin regresion en las demas. El glyph se ve mejor en ambos tamanos y entre paletas.

**En caso de fallo:** Si la mejora es marginal o hay regresion, revertir los cambios y reconsiderar el diagnostico. A veces las limitaciones del glyph original son inherentes a la metafora, no a la implementacion — en ese caso, la metafora misma puede necesitar cambiar (escalar a `create-glyph`).

## Lista de Validacion

- [ ] Glyph actual auditado con diagnostico especifico de problemas
- [ ] Causa raiz identificada para cada problema
- [ ] Modificaciones dirigidas a los problemas diagnosticados (sin edicion excesiva)
- [ ] Contrato de la funcion del glyph preservado (firma sin cambios)
- [ ] Iconos re-renderizados para todas las paletas
- [ ] Comparacion antes/despues muestra mejora en las dimensiones objetivo
- [ ] Sin regresion en las dimensiones no objetivo
- [ ] Tamanos de archivo en el rango esperado (2-15 KB WebP)
- [ ] El glyph se renderiza correctamente en el contexto del grafo de fuerzas (si aplica)

## Errores Comunes

- **Sobre-mejora**: Corregir un problema y luego retocar todo lo demas. Ceñirse a los problemas diagnosticados
- **Romper el contrato**: Cambiar la firma de la funcion rompe el pipeline de renderizado. El contrato de 5 parametros es inmutable
- **Optimizacion especifica de paleta**: Hacer que el glyph quede perfecto para cyberpunk pero deficiente para viridis. Siempre comprobar 3+ paletas
- **Ignorar el renderizado a tamano pequeno**: Un hermoso icono de 160px que se convierte en una mancha a 48px es una mejora fallida
- **Olvidar re-renderizar**: Editar la funcion sin ejecutar el comando de construccion significa que los cambios no son visibles
- **Comando de construccion incorrecto**: Las habilidades usan `build-icons.R`, los agentes usan `build-agent-icons.R`, los equipos usan `build-team-icons.R`

## Habilidades Relacionadas

- [create-glyph](../create-glyph/SKILL.md) — crear un nuevo glyph desde cero (usar cuando la mejora no es suficiente)
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — detectar que glyphs necesitan mejora en todo el pipeline
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — ejecutar el pipeline de renderizado completo despues de las mejoras
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — principios de diseno visual aplicables a la composicion de glyphs
- [chrysopoeia](../chrysopoeia/SKILL.md) — la metodologia de extraccion de valor es paralela a la optimizacion de glyphs (amplificar el oro, eliminar la escoria)
