---
name: format-citations
description: >
  Formatear citas y bibliografías según estilos académicos específicos (APA 7,
  Chicago, Vancouver, IEEE) usando el ecosistema CSL/citeproc. Cubre la
  selección de archivos CSL, configuración de citeproc en flujos de trabajo
  LaTeX, R Markdown y Quarto, resolución de casos extremos de formato, y
  verificación de la salida renderizada contra el manual de estilo.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: multi
  tags: citations, csl, citeproc, apa, formatting
---

# Formatear Citas

Formatear citas en el texto y entradas de bibliografía según un estilo académico específico usando archivos CSL (Citation Style Language) con el procesador citeproc, cubriendo la selección del estilo, configuración del flujo de trabajo, manejo de casos extremos (múltiples autores, fechas faltantes, fuentes no estándar), y verificación contra el manual de estilo.

## Cuándo Usar

- Formateando un manuscrito para envío a una revista con requisitos de estilo específicos
- Cambiando entre estilos de cita (p.ej., de APA a Vancouver) para diferentes envíos
- Resolviendo casos extremos de formato que citeproc no maneja automáticamente
- Configurando la canalización de citas en R Markdown, Quarto o LaTeX por primera vez
- Verificando que las citas renderizadas coinciden exactamente con las especificaciones del manual de estilo

## Entradas

- **Requerido**: Archivo de bibliografía (`.bib`, `.json`, `.yaml`) con entradas de referencia
- **Requerido**: Estilo de cita objetivo (nombre del estilo o archivo `.csl`)
- **Requerido**: Formato del documento (LaTeX, R Markdown, Quarto, Word, HTML)
- **Opcional**: Requisitos de localización (idioma para "y", "et al.", abreviaturas de meses)
- **Opcional**: Formato de cita requerido por la revista (si difiere del CSL estándar)
- **Opcional**: Listas de requisitos especiales (DOIs en las referencias, URLs para contenido web, fechas de acceso)

## Procedimiento

### Paso 1: Seleccionar y Obtener el Archivo CSL

Identificar el archivo CSL correcto para el estilo objetivo:

1. **Identificar el estilo**: Determinar el estilo de cita exacto requerido. Fuentes comunes: instrucciones para autores de la revista, guía de estilo de la universidad, estándares del campo (APA 7 para psicología, Vancouver para medicina, IEEE para ingeniería, Chicago para humanidades).
2. **Buscar en el repositorio CSL**: Buscar en el repositorio oficial de estilos CSL (github.com/citation-style-language/styles) por nombre de revista o nombre de estilo. Más de 10,000 estilos están disponibles.
3. **Verificar la versión del estilo**: Confirmar que la versión del CSL coincide con el manual de estilo actual (p.ej., APA 7a edición, no la 6a). Los archivos CSL incluyen metadatos de versión en el encabezado XML.
4. **Descargar y ubicar**: Colocar el archivo `.csl` en el directorio del proyecto o en un directorio de estilos compartido. Documentar la ruta en la configuración del proyecto.
5. **Verificación de localización**: Si el documento no está en inglés, verificar si el estilo CSL soporta la localización requerida. La mayoría de los estilos usan cadenas localizables (p.ej., "y" / "and", "et al.") que se adaptan según el atributo `default-locale` del archivo CSL.

```yaml
# Configuración YAML de R Markdown / Quarto
bibliography: references.bib
csl: apa-7th-edition.csl
lang: es-ES
```

**Esperado:** El archivo CSL correcto está identificado, descargado y configurado en el flujo de trabajo del proyecto, con la localización verificada.

**En caso de fallo:** Si no existe CSL para la revista objetivo, buscar un estilo de la misma editorial (los estilos a menudo se comparten entre revistas de la misma editorial). Como último recurso, personalizar el CSL más cercano -- los archivos CSL son XML legible y los cambios comunes (puntuación, orden de autor) están bien documentados.

### Paso 2: Configurar la Canalización de Citas

Conectar el archivo de bibliografía, el estilo CSL y el sistema de documentos:

1. **R Markdown / Quarto**:
   - Agregar `bibliography:` y `csl:` al encabezado YAML
   - Las citas en el texto usan la sintaxis `[@claveAutor2024]` para paréntesis o `@claveAutor2024` para narrativa
   - La bibliografía se renderiza automáticamente al final del documento o en un div `{#refs}`
   - Para múltiples archivos `.bib`: `bibliography: [refs1.bib, refs2.bib]`

2. **LaTeX con BibLaTeX**:
   ```latex
   \usepackage[style=apa,backend=biber]{biblatex}
   \addbibresource{references.bib}
   % En el cuerpo: \parencite{clave} o \textcite{clave}
   % Al final: \printbibliography
   ```

3. **LaTeX con BibTeX (legado)**:
   ```latex
   \bibliographystyle{plain}  % o apalike, ieeetr, etc.
   \bibliography{references}
   % En el cuerpo: \cite{clave}
   ```

4. **Pandoc directo**: `pandoc input.md --citeproc --bibliography=references.bib --csl=style.csl -o output.docx`

5. **Compilación de prueba**: Renderizar el documento con un subconjunto de citas para verificar que la canalización funciona antes de procesar el documento completo.

**Esperado:** La canalización de citas está configurada y una compilación de prueba produce citas formateadas y una bibliografía sin errores.

**En caso de fallo:** Si las citas aparecen como `[@clave]` sin formato en la salida, citeproc no se está ejecutando. En R Markdown, asegurar que `pandoc-citeproc` o `--citeproc` está habilitado. En Quarto, la cita es automática. En LaTeX, ejecutar la secuencia completa de compilación: `pdflatex` -> `biber` (o `bibtex`) -> `pdflatex` -> `pdflatex`.

### Paso 3: Manejar Casos Extremos de Formato

Resolver los problemas de formato de citas más comunes que la automatización no resuelve completamente:

1. **Múltiples autores**:
   - APA: 1-2 autores: siempre listar todos. 3+ autores: usar "et al." desde la primera cita.
   - Vancouver: listar hasta 6, luego "et al."
   - Chicago: listar hasta 3 en nota, abreviar en notas subsecuentes
   - Verificar que el CSL implementa la regla correcta de truncamiento de autores

2. **Autores corporativos**: Proteger los nombres para evitar que se analicen como `Apellido, Nombre`: en BibTeX usar `author = {{Organización Mundial de la Salud}}` (doble llave).

3. **Fechas faltantes o parciales**: Usar `year = {s.f.}` para sin fecha (APA) o `year = {en prensa}`. Verificar que el CSL maneja estas cadenas especiales correctamente.

4. **Contenido web y URLs**: Agregar `url` y `urldate` (fecha de acceso) para recursos en línea. APA requiere formato "Recuperado el [fecha] de [URL]"; Vancouver usa "Disponible en: [URL]".

5. **DOI como enlace**: Formatear DOIs como URLs completas (`https://doi.org/10.1234/example`) según las directrices actuales. Algunos estilos prefieren `doi:10.1234/example`.

6. **Citas secundarias**: Para citas "como se citó en", citar solo la fuente secundaria en la bibliografía pero mencionar la primaria en el texto: `(Estudio original, como se citó en @fuenteSecundaria2024)`.

7. **Múltiples trabajos del mismo autor/año**: Agregar sufijos de letra: `miller2024a`, `miller2024b`. La mayoría de los procesadores CSL manejan esto automáticamente si las entradas `.bib` tienen años idénticos y autores coincidentes.

**Esperado:** Todos los casos extremos están resueltos con un formato que coincide con las especificaciones del manual de estilo.

**En caso de fallo:** Si citeproc no produce la salida correcta para un caso extremo, considerar: (1) editar el archivo CSL para el caso específico, (2) agregar texto estático en el documento para anular la cita automática, o (3) contactar al mantenedor del estilo CSL con un informe de error.

### Paso 4: Verificar Contra el Manual de Estilo

Comparar la salida renderizada con ejemplos del manual de estilo:

1. **Citas en el texto**: Para cada tipo de cita (paréntesis, narrativa, con página, múltiples fuentes), verificar:
   - Puntuación correcta (comas, punto y coma, ampersand vs. "y")
   - Orden correcto de autores
   - Regla correcta de "et al."
   - Formato de número de página ("pp. 23-45" vs. "23-45")

2. **Entradas de bibliografía**: Para cada tipo de referencia (artículo, libro, capítulo, web, tesis), verificar:
   - Orden de los elementos (autor, año, título, revista, volumen, páginas, DOI)
   - Formato de puntuación entre elementos
   - Cursiva/negrita aplicada correctamente (títulos de revistas en cursiva en APA, títulos de artículos en cursiva en Chicago notas)
   - Sangría francesa (si es requerida por el estilo)

3. **Elementos especiales**: Verificar el formato de ediciones traducidas, reimpresiones, artículos con número de artículo en lugar de páginas, conjuntos de datos, software y redes sociales (si se citan).

4. **Documentar desviaciones**: Si el procesador CSL no puede reproducir exactamente el estilo manual para ciertos tipos de entrada, documentar la desviación y decidir si es aceptable o requiere corrección manual.

**Esperado:** Las citas renderizadas coinciden con los ejemplos del manual de estilo para todos los tipos de referencia encontrados en el documento.

**En caso de fallo:** Para desviaciones menores (una coma en lugar de un punto en un lugar), evaluar si la revista/institución acepta la salida del procesador CSL tal cual. Muchas revistas aceptan CSL estándar aunque difiera ligeramente de su guía. Para desviaciones mayores, editar el CSL o aplicar correcciones manuales en la etapa de prueba final.

### Paso 5: Producir Bibliografía Final

Generar la bibliografía final lista para publicación:

1. **Renderizar documento completo**: Compilar el documento completo y examinar la bibliografía en su totalidad.
2. **Verificar completitud**: Asegurar que cada referencia citada en el texto aparece en la bibliografía y viceversa (sin referencias huérfanas ni citas no citadas).
3. **Orden de clasificación**: Verificar que la bibliografía está ordenada según el estilo (alfabético por autor en APA, numérico en orden de aparición en Vancouver).
4. **Formato consistente**: Escanear visualmente toda la lista buscando inconsistencias (mezcla de puntos y comas, mayúsculas inconsistentes en títulos, DOIs parcialmente formateados).
5. **Exportar para envío**: Generar el formato requerido por la revista (.docx, .pdf, .tex). Si se requiere un archivo `.bib` separado para envío, incluirlo con solo las entradas citadas.

**Esperado:** Una bibliografía completa, correctamente formateada y lista para envío que coincide con los requisitos de estilo del destino.

**En caso de fallo:** Si se descubren errores después del renderizado final, corregir en el archivo `.bib` fuente (no en el documento de salida) y volver a renderizar. Las correcciones manuales en el documento de salida se perderán al recompilar.

## Validación

- [ ] Archivo CSL correcto identificado y verificado contra la versión actual del manual de estilo
- [ ] Canalización de citas configurada y verificada con compilación de prueba
- [ ] Casos extremos de formato resueltos (múltiples autores, autores corporativos, fechas faltantes, URLs)
- [ ] Citas en el texto verificadas contra los ejemplos del manual de estilo
- [ ] Entradas de bibliografía verificadas contra los ejemplos del manual de estilo para cada tipo de referencia
- [ ] Sin referencias huérfanas ni citas faltantes
- [ ] Orden de clasificación de la bibliografía correcto
- [ ] Documento final renderizado y verificado visualmente

## Errores Comunes

- **Usar un CSL desactualizado**: Los manuales de estilo se actualizan (APA 6 a 7, Chicago 16 a 17). Usar un CSL viejo produce un formato que no cumple con los requisitos actuales. Siempre verificar que la versión del CSL coincide con la edición requerida.
- **Ignorar la localización**: Un CSL en inglés en un documento en español producirá "and" en lugar de "y", "Retrieved from" en lugar de "Recuperado de". Establecer `lang:` en el YAML o `default-locale` en el CSL.
- **Protección excesiva con llaves en títulos**: `title = {{Cada Palabra en Llaves}}` evita que BibTeX ajuste las mayúsculas, pero también evita que el estilo de cita aplique sus reglas de capitalización. Proteger solo acrónimos y nombres propios.
- **No distinguir paréntesis de narrativa**: `[@clave]` produce "(Autor, 2024)" mientras que `@clave` produce "Autor (2024)". Usar la forma incorrecta causa errores gramaticales en el texto.
- **Corregir manualmente la salida en lugar del fuente**: Las correcciones en el archivo Word o PDF renderizado se pierden al recompilar. Siempre corregir en el archivo `.bib` o `.csl` fuente.
- **Mezclar sistemas de citas**: Usar tanto BibTeX como citeproc en el mismo documento causa conflictos. Elegir un sistema y usarlo exclusivamente.

## Habilidades Relacionadas

- `manage-bibliography` -- gestionar la colección bibliográfica que alimenta este flujo de trabajo de formato
- `validate-references` -- verificar la integridad de las referencias antes del formato
- `write-roxygen-docs` -- documentación R con citas integradas
