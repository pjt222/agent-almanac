---
name: manage-bibliography
description: >
  Gestionar colecciones bibliográficas en formato BibTeX/BibLaTeX: importar
  referencias desde DOI, CrossRef o entradas manuales, detectar y fusionar
  duplicados, validar campos requeridos por estilo de cita, organizar con
  palabras clave y grupos, y exportar bibliotecas limpias compatibles con
  LaTeX, R Markdown y Quarto.
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
  complexity: basic
  language: r
  tags: citations, bibtex, bibliography, reference-management, deduplication
---

# Gestionar Bibliografía

Crear, mantener y depurar una colección bibliográfica BibTeX/BibLaTeX mediante importación automatizada de metadatos, detección de duplicados, validación de campos requeridos por el estilo de cita objetivo, y exportación de un archivo `.bib` limpio listo para LaTeX, R Markdown o Quarto.

## Cuándo Usar

- Iniciar una nueva bibliografía de proyecto e importar referencias desde DOIs o bases de datos
- Fusionar múltiples archivos `.bib` de diferentes colaboradores o proyectos
- Detectar y resolver entradas duplicadas antes de la publicación
- Validar que cada entrada tenga todos los campos requeridos por un estilo de cita dado (APA, Chicago, Vancouver, etc.)
- Organizar referencias con palabras clave, grupos o categorías para facilitar la recuperación
- Exportar un subconjunto de referencias para un manuscrito, capítulo o presentación específicos

## Entradas

- **Requerido**: Fuente de referencias (DOIs, archivo `.bib` existente, resultados de búsqueda de base de datos o entradas manuales)
- **Requerido**: Estilo de cita objetivo (APA, Chicago, Vancouver, IEEE, personalizado `.csl`)
- **Opcional**: Estructura organizativa deseada (palabras clave, grupos, carpetas)
- **Opcional**: Archivo `.bib` existente para fusionar
- **Opcional**: Requisitos de formato de clave de cita (p.ej., `autorAño`, `autor:año:titulo`)

## Procedimiento

### Paso 1: Importar y Normalizar Referencias

Recopilar metadatos de referencia y convertir al formato BibTeX canónico:

1. **Importación por DOI**: Para cada DOI, consultar la API de CrossRef o usar `rcrossref::cr_works()` en R para obtener metadatos estructurados. Convertir la respuesta JSON a una entrada BibTeX con todos los campos disponibles.
2. **Importación desde archivo**: Analizar archivos `.bib` existentes con `bibtex::read.bib()` o `RefManageR::ReadBib()`. Registrar advertencias de análisis para entradas malformadas.
3. **Entrada manual**: Para fuentes sin DOI (libros, informes, sitios web), crear entradas BibTeX manualmente asegurando que los campos requeridos para el tipo de entrada estén presentes.
4. **Normalizar tipos de entrada**: Mapear tipos no estándar a tipos BibTeX estándar (`@article`, `@book`, `@inproceedings`, `@incollection`, `@phdthesis`, `@techreport`, `@misc`).
5. **Generar claves de cita**: Asignar claves de cita consistentes según la convención elegida. Las claves comunes incluyen `apellidoAño` (p.ej., `miller2024`) o `apellido:año:palabraTitulo`.
6. **Estandarizar codificación**: Asegurar codificación UTF-8 en todo el archivo. Convertir acentos LaTeX (`{\"u}`) a Unicode (`ü`) o viceversa, según los requisitos del flujo de trabajo.

```r
library(RefManageR)
library(rcrossref)

# Importar desde DOI
doi_metadata <- cr_works(dois = c("10.1234/example.2024"))
bib_entry <- as.BibEntry(doi_metadata$data)

# Importar desde archivo existente
existing_bib <- ReadBib("references.bib", check = FALSE)

# Fusionar
combined <- c(existing_bib, bib_entry)
```

**Esperado:** Una colección unificada de entradas BibTeX con claves de cita consistentes, tipos de entrada normalizados y codificación estandarizada.

**En caso de fallo:** Si la búsqueda por DOI falla (DOI no encontrado, API no disponible), intentar buscar por título a través de CrossRef o registrar la entrada para creación manual. Si el análisis de un archivo `.bib` falla, aislar la entrada malformada y corregir la sintaxis (corchetes sin cerrar, comas faltantes) antes de reintentar.

### Paso 2: Detectar y Resolver Duplicados

Identificar y fusionar entradas duplicadas para evitar citas inconsistentes:

1. **Coincidencia por DOI**: Las entradas con DOI idénticos son duplicados definitivos. Fusionarlas conservando la entrada con campos más completos.
2. **Coincidencia por título**: Normalizar títulos (minúsculas, eliminar puntuación, reducir espacios en blanco) y calcular similitud. Títulos con similitud > 90% son probables duplicados.
3. **Coincidencia por autor+año**: Comparar autores normalizados (solo apellido) y año de publicación. Las coincidencias son candidatos a duplicados que requieren verificación por título.
4. **Revisión manual**: Para cada par duplicado candidato, presentar ambas entradas lado a lado. El usuario confirma si son verdaderos duplicados o publicaciones distintas (p.ej., preprint vs. versión publicada, parte I vs. parte II).
5. **Estrategia de fusión**: Al fusionar, preferir campos de la entrada con más metadatos. Nunca sobrescribir un campo con un valor vacío. Conservar la clave de cita más informativa.
6. **Registrar**: Documentar todos los duplicados encontrados y cómo se resolvieron para auditoría.

```r
# Detectar duplicados potenciales por título
titles <- sapply(combined, function(x) tolower(x$title))
dups <- which(duplicated(titles) | duplicated(titles, fromLast = TRUE))
```

**Esperado:** Una biblioteca sin duplicados donde cada publicación única aparece exactamente una vez, con el registro más completo conservado.

**En caso de fallo:** Si la deduplicación automatizada produce falsos positivos (p.ej., publicaciones genuinamente diferentes con títulos similares), refinar los umbrales de coincidencia o requerir coincidencia tanto de autor+año como de título. Si produce falsos negativos (duplicados no detectados), agregar coincidencia por DOI como verificación prioritaria.

### Paso 3: Validar Campos Requeridos

Verificar que cada entrada tenga todos los campos necesarios para el estilo de cita objetivo:

1. **Definir campos requeridos por tipo y estilo**:

| Tipo | Campos Siempre Requeridos | Campos APA Adicionales | Campos Vancouver Adicionales |
|------|--------------------------|----------------------|----------------------------|
| @article | author, title, journal, year | volume, pages, doi | volume, issue, pages |
| @book | author/editor, title, publisher, year | address | address |
| @inproceedings | author, title, booktitle, year | pages, doi | pages |
| @phdthesis | author, title, school, year | -- | -- |

2. **Ejecutar validación**: Para cada entrada, verificar la presencia de cada campo requerido. Registrar los campos faltantes con la clave de cita y el nombre del campo.
3. **Intentar autocompletar**: Para campos faltantes, intentar obtenerlos:
   - DOI faltante: buscar en CrossRef por título+autor
   - Páginas faltantes: consultar los metadatos del DOI
   - Volumen/número faltantes: consultar la API de la revista
4. **Informar los vacíos restantes**: Listar todas las entradas con campos requeridos que faltan después del intento de autocompletar, para corrección manual.

**Esperado:** Cada entrada pasa la validación para el estilo de cita objetivo, o los campos faltantes están documentados con instrucciones claras para resolución.

**En caso de fallo:** Si no se pueden obtener campos requeridos (p.ej., artículo antiguo sin DOI, proceedings sin páginas), documentar la excepción. Algunos estilos de cita permiten valores de respaldo (p.ej., "n.p." para páginas, "s.f." para fecha). Consultar el manual del estilo de cita para los formatos de respaldo permitidos.

### Paso 4: Organizar y Anotar

Estructurar la colección para facilitar la recuperación y el uso:

1. **Asignar palabras clave**: Agregar el campo `keywords` a cada entrada con términos descriptivos. Usar vocabulario controlado cuando sea posible (p.ej., términos MeSH para literatura médica).
2. **Agrupar por tema**: Organizar entradas en grupos lógicos (p.ej., por capítulo, por tema de revisión de literatura, por tipo de método). Implementar como campos `groups` en JabRef o como archivos `.bib` separados.
3. **Agregar anotaciones**: Usar el campo `annote` o `annotation` para notas breves sobre la relevancia de cada referencia para el proyecto actual.
4. **Marcar entradas clave**: Identificar las 5-10 referencias fundamentales y marcarlas para fácil identificación.
5. **Ordenar entradas**: Ordenar el archivo `.bib` alfabéticamente por clave de cita para facilitar la búsqueda manual y los diffs de control de versiones.

**Esperado:** Una colección bibliográfica bien organizada con palabras clave consistentes, agrupación lógica y anotaciones que ayuden a la recuperación.

**En caso de fallo:** Si el vocabulario de palabras clave se vuelve inconsistente (sinónimos, variaciones ortográficas), crear una lista de autoridad de términos permitidos y validar contra ella. Si los grupos se superponen excesivamente, reevaluar la taxonomía.

### Paso 5: Exportar y Verificar

Producir el archivo `.bib` final y confirmar que funciona con el flujo de trabajo objetivo:

1. **Exportar a `.bib`**: Escribir la colección limpia y validada en un archivo `.bib`. Usar `RefManageR::WriteBib()` o exportación equivalente con codificación UTF-8.
2. **Compilación de prueba**: Compilar un documento de prueba (LaTeX, R Markdown o Quarto) que cite cada entrada. Verificar que:
   - Cada cita se resuelve sin errores "cita indefinida"
   - El formato de las citas coincide con el estilo objetivo
   - La bibliografía se renderiza correctamente con todos los campos visibles
3. **Verificación cruzada**: Comparar el conteo de entradas exportadas con el conteo original de importación. Asegurar que no se perdieron ni duplicaron entradas durante el procesamiento.
4. **Control de versiones**: Hacer commit del archivo `.bib` en el control de versiones con un mensaje descriptivo. Los archivos `.bib` son texto plano y funcionan bien con diff de Git.

```r
WriteBib(combined, file = "references_clean.bib", biblatex = TRUE)
```

**Esperado:** Un archivo `.bib` limpio que compila sin errores, produce citas correctamente formateadas y está bajo control de versiones.

**En caso de fallo:** Si LaTeX reporta errores "cita indefinida", verificar que la clave de cita en el documento coincide exactamente con la clave en el archivo `.bib` (sensible a mayúsculas). Si el formato de las citas es incorrecto, verificar que se está usando el archivo `.csl` o el paquete BibTeX/BibLaTeX correcto.

## Validación

- [ ] Todas las fuentes de referencia están importadas y convertidas a formato BibTeX
- [ ] Las claves de cita siguen una convención de nomenclatura consistente
- [ ] Los duplicados están detectados y resueltos con decisiones documentadas
- [ ] Cada entrada tiene todos los campos requeridos para el estilo de cita objetivo
- [ ] Las palabras clave y la agrupación están aplicadas de manera consistente
- [ ] El archivo `.bib` exportado compila sin errores en un documento de prueba
- [ ] Las citas se renderizan correctamente en el estilo objetivo
- [ ] El archivo `.bib` está bajo control de versiones

## Errores Comunes

- **Claves de cita inconsistentes**: Mezclar convenciones (p.ej., `Miller2024` y `miller:2024:neural`) en el mismo proyecto causa confusión y dificulta la búsqueda de entradas. Elegir una convención y aplicarla en todas las entradas.
- **Campos de autor malformados**: BibTeX requiere `{Apellido, Nombre and Apellido2, Nombre2}` con `and` literal (no `&` ni `,`) entre autores. Autores con nombres compuestos necesitan protección con llaves: `{Van der Berg, Jan}`.
- **Problemas de codificación**: Mezclar caracteres acentuados LaTeX (`{\'e}`) con Unicode (`é`) en el mismo archivo causa errores de compilación. Estandarizar a una codificación.
- **Ignorar la protección de títulos**: BibTeX convierte títulos a minúsculas en la mayoría de los estilos. Proteger acrónimos y nombres propios con llaves: `title = {Análisis de {RNA} en cáncer de {Hodgkin}}`.
- **No verificar contra el estilo objetivo**: Un archivo `.bib` válido para APA puede faltar campos requeridos por Vancouver. Siempre validar contra el estilo específico que se usará.
- **Ignorar preprints y versiones**: Un artículo puede tener un preprint de arXiv y una versión publicada. Decidir cuál citar y asegurar que no ambas permanezcan como duplicados.

## Habilidades Relacionadas

- `format-citations` -- aplicar formato CSL a las referencias gestionadas en este flujo de trabajo
- `validate-references` -- verificación profunda de la integridad bibliográfica más allá de la validación de campos
- `manage-renv-dependencies` -- gestión de dependencias R que complementa la gestión bibliográfica
