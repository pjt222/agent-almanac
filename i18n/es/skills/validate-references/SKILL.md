---
name: validate-references
description: >
  Validar la integridad y corrección de una colección de referencias
  bibliográficas verificando la resolución de DOIs, la accesibilidad de URLs,
  la consistencia de metadatos contra fuentes autoritativas, y la completitud
  de campos requeridos. Genera un informe de salud con problemas categorizados
  y correcciones sugeridas.
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
  language: r
  tags: citations, validation, doi, bibtex, reference-integrity
---

# Validar Referencias

Verificar la integridad de una colección de referencias bibliográficas comprobando la resolución de DOIs, la accesibilidad de URLs, la consistencia de metadatos contra registros autoritativos (CrossRef, OpenAlex), la completitud de campos requeridos, y produciendo un informe de salud categorizado con correcciones sugeridas.

## Cuándo Usar

- Auditar un archivo `.bib` antes de enviar un manuscrito para publicación
- Verificar que los DOIs se resuelven y apuntan a los artículos correctos
- Detectar enlaces rotos (URLs, DOIs) en una lista de referencias
- Comparar metadatos locales (títulos, autores, año) contra registros editoriales para detectar errores tipográficos
- Generar un informe de calidad de bibliografía para un equipo de investigación o revisor
- Preparar referencias para un paquete R que requiere citas verificables

## Entradas

- **Requerido**: Archivo de bibliografía (`.bib`) o colección de referencias como objeto R
- **Requerido**: Nivel de validación (básico: solo campos; estándar: campos + DOIs; completo: campos + DOIs + URLs + verificación de metadatos)
- **Opcional**: Estilo de cita objetivo (para validar campos requeridos específicos del estilo)
- **Opcional**: Límite de tasa para consultas API (por defecto: 1 solicitud/segundo para cortesía con las APIs)
- **Opcional**: Lista de campos a ignorar en la validación (p.ej., `abstract`, `keywords`)

## Procedimiento

### Paso 1: Cargar y Analizar la Colección Bibliográfica

Importar las referencias y preparar para validación:

1. **Analizar archivo `.bib`**: Usar `RefManageR::ReadBib()` o `bibtex::read.bib()`. Registrar errores de análisis: entradas malformadas, llaves sin cerrar, caracteres ilegales.
2. **Catálogo inicial**: Para cada entrada, registrar: clave de cita, tipo de entrada, campos presentes, campos vacíos.
3. **Extraer DOIs**: Recopilar DOIs del campo `doi`. Normalizar formatos: eliminar prefijos `https://doi.org/`, `doi:` o `DOI:`. Validar el formato regex: `10\.\d{4,}/.*`.
4. **Extraer URLs**: Recopilar URLs de los campos `url`, `howpublished` y el propio DOI (como `https://doi.org/...`).
5. **Informe de análisis**: Documentar el total de entradas, entradas analizadas exitosamente, errores de análisis, y un resumen de tipos de entrada.

```r
library(RefManageR)

bib <- ReadBib("references.bib", check = FALSE)
n_total <- length(bib)
cat(sprintf("Analizadas %d entradas de %d tipos\n", n_total,
            length(unique(sapply(bib, function(x) x$bibtype)))))
```

**Esperado:** Todas las entradas analizadas exitosamente con una lista de DOIs y URLs extraídas para verificación. Los errores de análisis están documentados con números de línea.

**En caso de fallo:** Si el análisis falla completamente, el archivo `.bib` tiene errores de sintaxis graves. Usar un linter BibTeX (p.ej., `biber --validate-datamodel`) para localizar el error. Los problemas más comunes: comillas sin cerrar, llaves desequilibradas, carácter `#` sin escapar en los valores de campo.

### Paso 2: Verificar Resolución de DOIs

Comprobar que cada DOI se resuelve a una publicación válida:

1. **Consultar la API de DOI**: Para cada DOI, enviar una solicitud HEAD a `https://doi.org/{doi}`. Un código HTTP 200 (con redirección) confirma la resolución. Un 404 indica DOI inválido o no registrado.
2. **Obtener metadatos**: Para DOIs que se resuelven, obtener metadatos de CrossRef (`rcrossref::cr_works(dois = doi)`) para verificación cruzada en el Paso 3.
3. **Limitación de tasa**: Respetar los límites de la API (CrossRef permite ~50 solicitudes/segundo con `mailto`, pero usar 1/segundo como cortesía por defecto).
4. **Registrar resultados**:
   - DOI resuelve correctamente
   - DOI no se resuelve (404)
   - DOI tiene formato malformado (no coincide con regex)
   - DOI ausente (campo no presente)
   - Error de red (timeout, rechazo de conexión)

```r
library(rcrossref)

validate_doi <- function(doi) {
  tryCatch({
    result <- cr_works(dois = doi)
    if (nrow(result$data) > 0) "válido" else "no_encontrado"
  }, error = function(e) "error")
}
```

**Esperado:** Cada DOI está clasificado como válido, inválido, malformado, ausente o error. Los DOIs válidos tienen metadatos de CrossRef obtenidos para verificación cruzada.

**En caso de fallo:** Si las consultas API fallan consistentemente (errores de red, limitación de tasa), reducir la tasa de consultas o reintentar con retroceso exponencial. Si se bloquean las solicitudes, agregar un encabezado `mailto` a las consultas de CrossRef: `rcrossref::cr_works(dois = doi, .headers = c(mailto = "tu@email.com"))`.

### Paso 3: Verificar Consistencia de Metadatos

Comparar los metadatos locales contra registros autoritativos:

1. **Verificación de título**: Comparar el título local con el título de CrossRef. Normalizar ambos (minúsculas, eliminar puntuación y espacios extra). Calcular la similitud de cadenas. Una similitud < 85% indica una discrepancia que requiere revisión.
2. **Verificación de autores**: Comparar los apellidos de los autores entre los datos locales y de CrossRef. Registrar autores faltantes, autores adicionales y errores ortográficos.
3. **Verificación de año**: Comparar el año de publicación. Una discrepancia de 1 año puede ser legítima (publicación en línea vs. impresa); una discrepancia mayor indica un error.
4. **Verificación de revista/fuente**: Comparar el nombre de la revista. Detectar abreviaturas inconsistentes (p.ej., "J. Am. Chem. Soc." vs. "Journal of the American Chemical Society").
5. **Verificación de volumen/páginas**: Comparar volumen, número y páginas. Los artículos con numeración de artículos (p.ej., e12345) en lugar de páginas requieren manejo especial.
6. **Categorías de discrepancia**:
   - **Crítica**: DOI no coincide con la publicación referenciada (título completamente diferente)
   - **Mayor**: Autores faltantes o año incorrecto
   - **Menor**: Variación ortográfica en el título, abreviatura de revista inconsistente
   - **Informativa**: Datos extra disponibles en CrossRef que no están en la entrada local

**Esperado:** Cada entrada con DOI tiene sus metadatos verificados contra CrossRef, con discrepancias categorizadas por severidad.

**En caso de fallo:** Si CrossRef no tiene metadatos para un DOI válido (raro pero posible para publicadores pequeños), intentar OpenAlex u otro servicio de metadatos. Si la verificación de metadatos produce demasiados falsos positivos (p.ej., diferencias de codificación Unicode), mejorar la normalización antes de la comparación.

### Paso 4: Verificar Accesibilidad de URLs

Comprobar que todos los enlaces web en las referencias son accesibles:

1. **URLs del campo url**: Enviar solicitudes HEAD a cada URL. Clasificar la respuesta:
   - 200: Accesible
   - 301/302: Redirección (seguir y registrar el destino final)
   - 403: Prohibido (puede estar detrás de un muro de pago -- anotar pero no marcar como error)
   - 404: No encontrado (enlace roto)
   - Timeout: El servidor no responde
2. **URLs de DOI**: Verificar que `https://doi.org/{doi}` redirige a la página del artículo (no a una página de error del publicador).
3. **Verificación de contenido web**: Para entradas `@misc` y `@online`, las URLs son la fuente primaria. Un enlace roto en estas entradas es más crítico que en un artículo de revista con DOI.
4. **Fechas de acceso**: Para contenido web, verificar que el campo `urldate` (fecha de acceso) está presente. Si la URL está rota, la fecha de acceso es la última prueba de que el contenido existió.
5. **Sugerencias de Wayback Machine**: Para URLs rotas, buscar una versión archivada en la Wayback Machine (`web.archive.org`) y sugerir la URL archivada como reemplazo.

**Esperado:** Todas las URLs están clasificadas como accesibles, redirigidas, restringidas, rotas o con timeout. Se sugieren URLs archivadas de respaldo para enlaces rotos.

**En caso de fallo:** Si la verificación de URLs produce muchos falsos positivos por restricciones de red (proxy corporativo, bloqueo geográfico), anotar las limitaciones de la red de prueba y recomendar reverificación desde una red diferente.

### Paso 5: Generar Informe de Salud

Producir un informe completo de salud bibliográfica:

1. **Resumen ejecutivo**: Conteos totales: entradas verificadas, sin problemas, con advertencias, con errores.
2. **Problemas por categoría**:
   - Errores de análisis (entradas malformadas)
   - DOIs inválidos o faltantes
   - Discrepancias de metadatos (por severidad)
   - URLs rotas
   - Campos requeridos faltantes
3. **Detalles por entrada**: Para cada entrada con problemas, listar: clave de cita, tipo de problema, descripción, corrección sugerida.
4. **Correcciones automatizadas**: Cuando la corrección es clara (p.ej., año incorrecto con año correcto disponible de CrossRef), generar las correcciones como un parche al archivo `.bib`.
5. **Métricas de calidad**:
   - Porcentaje de entradas con DOI: [valor]%
   - Porcentaje de DOIs válidos: [valor]%
   - Porcentaje de entradas completas (todos los campos requeridos): [valor]%
   - Porcentaje de URLs accesibles: [valor]%

```markdown
## Informe de Salud Bibliográfica

### Resumen
- **Total de entradas**: [N]
- **Sin problemas**: [n] ([%]%)
- **Advertencias**: [n] ([%]%)
- **Errores**: [n] ([%]%)

### Problemas Críticos
| Clave de Cita | Problema | Descripción | Corrección Sugerida |
|---------------|----------|-------------|---------------------|
| smith2024 | DOI inválido | 10.1234/no-existe retorna 404 | Verificar DOI correcto |
| jones2023 | Año incorrecto | Local: 2023, CrossRef: 2022 | Cambiar year a 2022 |

### Métricas de Calidad
| Métrica | Valor | Objetivo |
|---------|-------|----------|
| Cobertura de DOIs | [%]% | > 90% |
| Tasa de resolución de DOIs | [%]% | 100% |
| Completitud de campos | [%]% | 100% |
| Accesibilidad de URLs | [%]% | > 95% |
```

**Esperado:** Un informe de salud completo con problemas categorizados, correcciones sugeridas para errores automatizables, y métricas de calidad.

**En caso de fallo:** Si el informe es abrumadoramente grande (cientos de problemas), priorizar por severidad: corregir primero los errores críticos (DOIs que apuntan al artículo equivocado), luego los mayores (autores faltantes), y finalmente los menores (variaciones ortográficas). Establecer un umbral de calidad mínima y re-auditar después de las correcciones.

## Validación

- [ ] Archivo `.bib` analizado exitosamente con errores de sintaxis documentados
- [ ] Todos los DOIs verificados contra la API de resolución de DOI
- [ ] Metadatos comparados contra CrossRef para entradas con DOI
- [ ] Discrepancias categorizadas por severidad (crítica, mayor, menor, informativa)
- [ ] URLs verificadas por accesibilidad con enlaces rotos documentados
- [ ] Campos requeridos validados contra el estilo de cita objetivo
- [ ] Informe de salud generado con métricas de calidad y correcciones sugeridas
- [ ] Correcciones automatizadas generadas como parche al archivo `.bib`

## Errores Comunes

- **No respetar los límites de tasa de las APIs**: Enviar cientos de solicitudes por segundo a CrossRef o doi.org puede resultar en bloqueo temporal. Siempre implementar limitación de tasa y usar el encabezado `mailto` con CrossRef.
- **Confundir DOIs inválidos con DOIs no registrados**: Un DOI con formato correcto que no se resuelve puede ser un DOI nuevo aún no propagado (publicaciones recientes) o un error tipográfico. Verificar manualmente antes de reportar como inválido.
- **Ignorar la diferencia entre fecha en línea y fecha impresa**: Muchos artículos tienen una fecha de publicación en línea anticipada diferente del año del volumen impreso. Una discrepancia de 1 año no es necesariamente un error.
- **Marcar URLs detrás de muro de pago como rotas**: Una respuesta 403 (prohibido) de una revista con suscripción no significa que la URL está rota. Es inaccesible sin credenciales pero el recurso existe.
- **No normalizar antes de comparar**: Comparar títulos con codificaciones diferentes (LaTeX `{\\"u}` vs. Unicode `ü`) producirá falsos positivos de discrepancia. Normalizar siempre antes de calcular similitud.
- **Asumir que CrossRef siempre tiene razón**: Raramente, los metadatos de CrossRef pueden tener errores (especialmente para publicaciones antiguas o publicadores pequeños). Si los metadatos locales están correctos según el artículo original, documentar la discrepancia pero no sobrescribir automáticamente.

## Habilidades Relacionadas

- `manage-bibliography` -- gestión de la colección bibliográfica que precede a la validación
- `format-citations` -- aplicar formato después de asegurar la integridad de las referencias
- `submit-to-cran` -- paquetes R con citas en DESCRIPTION requieren referencias verificables
