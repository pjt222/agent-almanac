---
name: analyze-codebase-workflow
description: >
  Analizar un codebase arbitrario para auto-detectar flujos de trabajo,
  pipelines de datos y dependencias de archivos usando el motor put_auto() de
  putior. Produce un plan de anotación que mapea los patrones de E/S detectados
  a archivos fuente en más de 30 lenguajes soportados con 902 patrones de
  auto-detección. Úsalo al incorporarse a un codebase desconocido para entender
  el flujo de datos, al iniciar la integración de putior en un proyecto sin
  anotaciones existentes, al auditar el pipeline de datos de un proyecto antes
  de documentarlo, o al preparar un plan de anotación antes de ejecutar
  annotate-source-files.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: multi
  tags: putior, workflow, analysis, auto-detect, polyglot, data-pipeline
---

# Analyze Codebase Workflow

Examinar un repositorio arbitrario para auto-detectar flujos de datos, E/S de archivos y dependencias entre scripts, y luego producir un plan de anotación estructurado para refinamiento manual.

## Cuándo Usar

- Al incorporarse a un codebase desconocido y necesitar entender el flujo de datos
- Al iniciar la integración de putior en un proyecto que no tiene anotaciones PUT aún
- Al auditar el pipeline de datos de un proyecto existente antes de documentarlo
- Al preparar un plan de anotación antes de ejecutar `annotate-source-files`

## Entradas

- **Requerido**: Ruta al repositorio o directorio fuente a analizar
- **Opcional**: Subdirectorios específicos en los que centrarse (predeterminado: todo el repositorio)
- **Opcional**: Lenguajes a incluir o excluir (predeterminado: todos los detectados)
- **Opcional**: Alcance de detección: solo entradas, solo salidas, o ambas (predeterminado: ambas + dependencias)

## Procedimiento

### Paso 1: Examinar la Estructura del Repositorio

Identifica los archivos fuente y sus lenguajes para entender qué puede analizar putior.

```r
library(putior)

# Listar todos los lenguajes soportados y sus extensiones
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Solo lenguajes con auto-detección

# Obtener extensiones soportadas
exts <- get_supported_extensions()
```

Usa el listado de archivos para entender la composición del repositorio:

```bash
# Contar archivos por extensión en el directorio objetivo
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

**Esperado:** Una lista de extensiones de archivos presentes en el repositorio, con conteos. Mapea estos contra `get_supported_extensions()` para conocer la cobertura.

**En caso de fallo:** Si el repositorio no tiene archivos que coincidan con las extensiones soportadas, putior no puede auto-detectar flujos de trabajo. Considera si el lenguaje es soportado pero los archivos usan extensiones no estándar.

### Paso 2: Verificar la Cobertura de Detección por Lenguaje

Para cada lenguaje detectado, verifica la disponibilidad de patrones de auto-detección.

```r
# Verificar qué lenguajes tienen patrones de auto-detección (18 lenguajes, 902 patrones)
detection_langs <- list_supported_languages(detection_only = TRUE)
cat("Languages with auto-detection:\n")
print(detection_langs)

# Obtener conteos de patrones para lenguajes específicos encontrados en el repositorio
for (lang in c("r", "python", "javascript", "sql", "dockerfile", "makefile")) {
  patterns <- get_detection_patterns(lang)
  cat(sprintf("%s: %d input, %d output, %d dependency patterns\n",
    lang,
    length(patterns$input),
    length(patterns$output),
    length(patterns$dependency)
  ))
}
```

**Esperado:** Conteos de patrones impresos para cada lenguaje. R tiene 124 patrones, Python 159, JavaScript 71, etc.

**En caso de fallo:** Si un lenguaje no devuelve patrones, soporta anotaciones manuales pero no auto-detección. Planifica anotar esos archivos manualmente.

### Paso 3: Ejecutar la Auto-Detección

Ejecuta `put_auto()` en el directorio objetivo para descubrir elementos del flujo de trabajo.

```r
# Auto-detección completa
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE
)

# Excluir scripts de compilación y ayudantes de prueba del escaneo
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE,
  exclude = c("build-", "test_helper")
)

# Ver los nodos del flujo de trabajo detectados
print(workflow)

# Verificar el conteo de nodos
cat(sprintf("Detected %d workflow nodes\n", nrow(workflow)))
```

Para repositorios grandes, analiza subdirectorios de forma incremental:

```r
# Analizar subdirectorios específicos
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

**Esperado:** Un data frame con columnas que incluyen `id`, `label`, `input`, `output`, `source_file`. Cada fila representa un paso del flujo de trabajo detectado.

**En caso de fallo:** Si el resultado está vacío, los archivos fuente pueden no contener patrones de E/S reconocibles. Intenta habilitar el registro de depuración: `workflow <- put_auto("./src/", log_level = "DEBUG")` para ver qué archivos se escanean y qué patrones coinciden.

### Paso 4: Generar el Diagrama Inicial

Visualiza el flujo de trabajo auto-detectado para evaluar la cobertura e identificar brechas.

```r
# Generar diagrama del flujo de trabajo auto-detectado
cat(put_diagram(workflow, theme = "github"))

# Con información del archivo fuente para trazabilidad
cat(put_diagram(workflow, show_source_info = TRUE))

# Guardar en archivo para revisión
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

**Esperado:** Un diagrama de flujo Mermaid que muestra los nodos detectados conectados por aristas de flujo de datos. Los nodos deben estar etiquetados con nombres significativos de funciones/archivos.

**En caso de fallo:** Si el diagrama muestra nodos desconectados, la auto-detección encontró patrones de E/S pero no pudo inferir las conexiones. Esto es normal — las conexiones se derivan de hacer coincidir los nombres de archivos de salida con los nombres de archivos de entrada. El plan de anotación (siguiente paso) abordará las brechas.

### Paso 5: Producir el Plan de Anotación

Genera un plan estructurado que documente qué se encontró y qué necesita anotación manual.

```r
# Generar sugerencias de anotación
put_generate("./src/", style = "single")

# Para estilo multilínea (más legible para flujos de trabajo complejos)
put_generate("./src/", style = "multiline")

# Copiar sugerencias al portapapeles para fácil pegado
put_generate("./src/", output = "clipboard")
```

Documenta el plan con evaluación de cobertura:

```markdown
## Annotation Plan

### Auto-Detected (no manual work needed)
- `src/etl/extract.R` — 3 inputs, 2 outputs detected
- `src/etl/transform.py` — 1 input, 1 output detected

### Needs Manual Annotation
- `src/api/handler.js` — Language supported but no I/O patterns matched
- `src/config/setup.sh` — Only 12 shell patterns; complex logic missed

### Not Supported
- `src/legacy/process.f90` — Fortran not in detection languages

### Recommended Connections
- extract.R output `data.csv` → transform.py input `data.csv` (auto-linked)
- transform.py output `clean.parquet` → load.R input (needs annotation)
```

**Esperado:** Un plan claro que separa los archivos auto-detectados de los que necesitan anotación manual, con recomendaciones específicas para cada archivo.

**En caso de fallo:** Si `put_generate()` no produce salida, asegúrate de que la ruta del directorio sea correcta y contenga archivos fuente en lenguajes soportados.

## Validación

- [ ] `put_auto()` se ejecuta sin errores en el directorio objetivo
- [ ] El flujo de trabajo detectado tiene al menos un nodo (a menos que el repositorio no tenga E/S reconocible)
- [ ] `put_diagram()` produce código Mermaid válido del flujo de trabajo auto-detectado
- [ ] `put_generate()` produce sugerencias de anotación para archivos con patrones detectados
- [ ] Documento del plan de anotación creado con evaluación de cobertura

## Errores Comunes

- **Escaneo demasiado amplio**: Ejecutar `put_auto(".")` en la raíz de un repositorio puede incluir `node_modules/`, `.git/`, `venv/`, etc. Apunta a directorios fuente específicos.
- **Esperar cobertura completa**: La auto-detección encuentra E/S de archivos y llamadas a bibliotecas, no lógica de negocio. Una tasa de cobertura del 40-60% es típica; el resto necesita anotación manual.
- **Ignorar dependencias**: El flag `detect_dependencies = TRUE` captura llamadas `source()`, `import`, `require()` que vinculan scripts entre sí. Deshabilitarlo pierde las conexiones entre archivos.
- **Incompatibilidad de lenguaje**: Los archivos con extensiones no estándar (p.ej., `.R` vs `.r`, `.jsx` vs `.js`) pueden no detectarse. Usa `get_comment_prefix()` para verificar si una extensión es reconocida. Ten en cuenta que los archivos sin extensión como `Dockerfile` y `Makefile` se soportan mediante coincidencia exacta del nombre de archivo.
- **Repositorios grandes**: Para repositorios con más de 100 archivos fuente, analiza por módulo/directorio para mantener los diagramas legibles.

## Habilidades Relacionadas

- `install-putior` — requisito previo: putior debe estar instalado primero
- `annotate-source-files` — siguiente paso: añadir anotaciones manuales basadas en el plan
- `generate-workflow-diagram` — generar el diagrama final después de que la anotación esté completa
- `configure-putior-mcp` — usar herramientas MCP para sesiones de análisis interactivas
