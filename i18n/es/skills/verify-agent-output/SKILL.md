---
name: verify-agent-output
description: >
  Valida entregables y construye rastros de evidencia cuando el trabajo pasa
  entre agentes. Cubre la especificación de resultados esperados antes de la
  ejecución, la generación de evidencia estructurada durante la ejecución, la
  validación de entregables contra anclas externas después de la ejecución,
  verificaciones de fidelidad para salidas comprimidas o resumidas,
  clasificación de límites de confianza, e informes de desacuerdo estructurado
  en caso de fallo de verificación. Usar al coordinar flujos de trabajo
  multi-agente, al revisar transferencias entre agentes, al producir salidas
  de cara al exterior, o al auditar si el resumen de un agente representa
  fielmente su material fuente.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: verification, trust, evidence-trail, deliverable-validation, inter-agent, quality-assurance
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Verificar la Salida del Agente

Establecer entrega verificable entre agentes. Cuando un agente produce salida que otro agente consume — o en la que un humano confía — la transferencia necesita más que "parece bien." Esta habilidad codifica la práctica de definir expectativas verificables antes de que comience el trabajo, generar evidencia como efecto secundario de hacer el trabajo, y validar los entregables contra anclas externas en lugar de la auto-evaluación. El principio central: la fidelidad no puede medirse internamente. Un agente no puede verificar de forma fiable su propia salida comprimida; la verificación requiere un punto de referencia externo.

## Cuándo Usar

- Un flujo de trabajo multi-agente entrega entregables de un agente a otro
- Un agente produce salida de cara al exterior (informes, código, despliegues) en la que un humano confiará
- Un agente resume, comprime o transforma datos y el resumen debe representar fielmente la fuente
- Un patrón de coordinación de equipo requiere validación estructurada de transferencias entre miembros
- Se necesita establecer límites de confianza — decidir qué requiere verificación vs. qué puede confiarse
- Se requiere un rastro de auditoría para cumplimiento o reproducibilidad

## Entradas

- **Requerido**: El entregable a verificar (archivo, artefacto, informe, o salida estructurada)
- **Requerido**: La especificación de resultado esperado (cómo se ve "completado")
- **Opcional**: El material fuente (para verificaciones de fidelidad en resúmenes o transformaciones)
- **Opcional**: Clasificación de límite de confianza (`cross-agent`, `external-facing`, `internal`)
- **Opcional**: Profundidad de verificación (`spot-check`, `full`, `sample-based`)

## Procedimiento

### Paso 1: Definir la Especificación de Resultado Esperado

Antes de que comience la ejecución, escribir cómo se ve "completado" como un conjunto de condiciones concretas y verificables. Evitar criterios subjetivos ("buena calidad") en favor de afirmaciones verificables.

Categorías de condiciones verificables:

- **Existencia**: El archivo existe en la ruta, el endpoint responde, el registro está presente en la base de datos
- **Forma**: La salida tiene N columnas, el JSON coincide con el esquema, la función tiene la firma esperada
- **Contenido**: El valor está dentro del rango, la cadena coincide con el patrón, la lista contiene los elementos requeridos
- **Comportamiento**: La suite de pruebas pasa, el comando sale con 0, la API devuelve el código de estado esperado
- **Consistencia**: El hash de salida coincide con el hash de entrada, el recuento de filas se preserva después de la transformación, los totales concilian

Ejemplo de especificación:

```yaml
expected_outcome:
  existence:
    - path: "output/report.html"
    - path: "output/data.csv"
  shape:
    - file: "output/data.csv"
      columns: ["id", "name", "score", "grade"]
      min_rows: 100
  content:
    - file: "output/data.csv"
      column: "score"
      range: [0, 100]
    - file: "output/report.html"
      contains: ["Summary", "Methodology", "Results"]
  behavior:
    - command: "Rscript -e 'testthat::test_dir(\"tests\")'"
      exit_code: 0
  consistency:
    - check: "row_count"
      source: "input/raw.csv"
      target: "output/data.csv"
      tolerance: 0
```

**Esperado:** Una especificación escrita con al menos una condición verificable por entregable. Cada condición es verificable por máquina (puede comprobarse mediante un script o comando, no solo leyendo y juzgando).

**En caso de fallo:** Si el resultado esperado no puede declararse concretamente, la tarea en sí está subespecificada. Rechazar la definición de la tarea antes de continuar — las expectativas vagas producen trabajo no verificable.

### Paso 2: Generar Rastro de Evidencia Durante la Ejecución

A medida que avanza el trabajo, emitir evidencia estructurada como efecto secundario de hacer el trabajo. El rastro de evidencia no es un paso de verificación separado — es producido por la ejecución misma.

Tipos de evidencia a capturar:

```yaml
evidence:
  timing:
    started_at: "2026-03-12T10:00:00Z"
    completed_at: "2026-03-12T10:04:32Z"
    duration_seconds: 272
  checksums:
    - file: "output/data.csv"
      sha256: "a1b2c3..."
    - file: "output/report.html"
      sha256: "d4e5f6..."
  test_results:
    total: 24
    passed: 24
    failed: 0
    skipped: 0
  diff_summary:
    files_changed: 3
    insertions: 47
    deletions: 12
  tool_versions:
    r: "4.5.2"
    testthat: "3.2.1"
```

Comandos prácticos para generar evidencia:

```bash
# Sumas de verificación
sha256sum output/data.csv output/report.html > evidence/checksums.txt

# Recuentos de filas
wc -l < input/raw.csv > evidence/input_rows.txt
wc -l < output/data.csv > evidence/output_rows.txt

# Resultados de pruebas (R)
Rscript -e "results <- testthat::test_dir('tests'); cat(format(results))" > evidence/test_results.txt

# Resumen de git diff
git diff --stat HEAD~1 > evidence/diff_summary.txt

# Temporización (envolver el comando real)
start_time=$(date +%s)
# ... hacer el trabajo ...
end_time=$(date +%s)
echo "duration_seconds: $((end_time - start_time))" > evidence/timing.txt
```

**Esperado:** Un directorio `evidence/` (o registro estructurado) que contenga al menos sumas de verificación y temporización para cada artefacto producido. La evidencia se genera como parte del trabajo, no reconstruida después del hecho.

**En caso de fallo:** Si la generación de evidencia interfiere con la ejecución, capturar lo que sea posible sin bloquear el trabajo. Como mínimo, registrar las sumas de verificación de archivos después de la finalización — esto permite la verificación posterior incluso si no se capturó evidencia en tiempo real.

### Paso 3: Validar Entregables Contra los Resultados Esperados

Después de la ejecución, verificar el entregable contra la especificación del Paso 1. Usar anclas externas — suites de pruebas, validadores de esquema, sumas de verificación, recuentos de filas — en lugar de preguntarle al agente productor "¿es esto correcto?"

Verificaciones de validación por categoría:

```bash
# Existencia
for file in output/report.html output/data.csv; do
  test -f "$file" && echo "PASS: $file exists" || echo "FAIL: $file missing"
done

# Forma (verificación de columnas CSV)
head -1 output/data.csv | tr ',' '\n' | sort > /tmp/actual_cols.txt
echo -e "grade\nid\nname\nscore" > /tmp/expected_cols.txt
diff /tmp/expected_cols.txt /tmp/actual_cols.txt && echo "PASS: columns match" || echo "FAIL: column mismatch"

# Recuento de filas
actual_rows=$(wc -l < output/data.csv)
[ "$actual_rows" -ge 101 ] && echo "PASS: $actual_rows rows (>= 100 + header)" || echo "FAIL: only $actual_rows rows"

# Verificación de rango de contenido (R)
Rscript -e '
  d <- read.csv("output/data.csv")
  stopifnot(all(d$score >= 0 & d$score <= 100))
  cat("PASS: all scores in [0, 100]\n")
'

# Comportamiento
Rscript -e "testthat::test_dir('tests')" && echo "PASS: tests pass" || echo "FAIL: tests fail"

# Consistencia (recuento de filas preservado)
input_rows=$(wc -l < input/raw.csv)
output_rows=$(wc -l < output/data.csv)
[ "$input_rows" -eq "$output_rows" ] && echo "PASS: row count preserved" || echo "FAIL: $input_rows -> $output_rows"
```

**Esperado:** Todas las verificaciones pasan. Los resultados se registran como salida estructurada (PASS/FAIL por condición) junto con el rastro de evidencia del Paso 2.

**En caso de fallo:** No aceptar silenciosamente aprobaciones parciales. Cualquier FAIL desencadena el proceso de desacuerdo estructurado del Paso 6. Registrar qué verificaciones pasaron y cuáles fallaron — los resultados parciales siguen siendo evidencia valiosa.

### Paso 4: Ejecutar Verificaciones de Fidelidad en Salidas Comprimidas

Cuando un agente resume, comprime o transforma datos, la salida es más pequeña que la entrada por diseño. Un resumen no puede verificarse leyendo solo el resumen — debe compararse con la fuente. Usar verificaciones puntuales basadas en muestras para verificar la fidelidad.

Procedimiento:

1. Seleccionar una muestra aleatoria del material fuente (3-5 elementos para verificaciones puntuales, 10% para verificaciones exhaustivas)
2. Para cada elemento muestreado, verificar que está representado con precisión en la salida comprimida
3. Verificar contenido fabricado — elementos en la salida que no tienen fuente

```bash
# Ejemplo: verificar un informe de resumen contra datos fuente

# 1. Seleccionar filas aleatorias de la fuente
shuf -n 5 input/raw.csv > /tmp/sample.csv

# 2. Para cada fila muestreada, verificar que aparece correctamente en la salida
while IFS=, read -r id name score grade; do
  grep -q "$id" output/report.html && echo "PASS: $id found in report" || echo "FAIL: $id missing from report"
done < /tmp/sample.csv

# 3. Verificar IDs fabricados en la salida
# Extraer IDs de la salida, verificar que cada uno existe en la fuente
grep -oP 'id="[^"]*"' output/report.html | while read -r output_id; do
  grep -q "$output_id" input/raw.csv && echo "PASS: $output_id has source" || echo "FAIL: $output_id fabricated"
done
```

Para resúmenes de texto donde la coincidencia exacta no es posible, verificar afirmaciones clave:

- Las estadísticas citadas coinciden con los datos fuente
- Las entidades nombradas mencionadas en el resumen existen en la fuente
- Las afirmaciones causales o clasificaciones están respaldadas por los datos subyacentes
- Ningún elemento aparece en el resumen que esté ausente de la fuente

**Esperado:** Todos los elementos muestreados están representados con precisión. No se detecta contenido fabricado. Las estadísticas clave en el resumen coinciden con los valores calculados de la fuente.

**En caso de fallo:** Si las verificaciones de fidelidad fallan, el resumen no puede confiarse. Informar los desacuerdos específicos usando el formato de desacuerdo estructurado del Paso 6. El agente productor debe re-derivar el resumen desde la fuente, no parchear la salida existente.

### Paso 5: Clasificar los Límites de Confianza

No todo necesita verificación. La sobre-verificación tiene su propio costo — ralentiza la ejecución, aumenta la complejidad y puede crear una falsa confianza en el proceso de verificación mismo. Clasificar las salidas por nivel de confianza para concentrar el esfuerzo de verificación donde importa.

Clasificación de límites de confianza:

| Límite | Verificación Requerida | Ejemplos |
|--------|----------------------|---------|
| **Transferencia entre agentes** | Sí — siempre | El Agente A produce datos que el Agente B consume; un miembro del equipo pasa un entregable al líder |
| **Salida de cara al exterior** | Sí — siempre | Informes entregados a humanos, código desplegado, paquetes publicados, respuestas de API |
| **Comprimido/resumido** | Sí — basado en muestras | Cualquier salida que sea más pequeña que su entrada por diseño (resúmenes, agregaciones, extractos) |
| **Intermedio interno** | No — confiar con sumas de verificación | Archivos temporales, resultados de cómputo intermedios, estado interno entre pasos |
| **Operaciones idempotentes** | No — verificar una vez | Escrituras de archivos de configuración, transformaciones deterministas, funciones puras con entradas conocidas |

Aplicar la verificación de forma proporcional:

- **Transferencias entre agentes**: Validación completa contra la especificación de resultado esperado (Paso 3)
- **Salidas de cara al exterior**: Validación completa más verificaciones de fidelidad si se resume (Pasos 3-4)
- **Intermedios internos**: Registrar solo sumas de verificación (Paso 2) — verificar bajo demanda si algo falla aguas abajo
- **Operaciones idempotentes**: Verificar en la primera ejecución, confiar en las repeticiones

**Esperado:** Cada entregable en el flujo de trabajo está clasificado en una de las categorías de límite de confianza. El esfuerzo de verificación se concentra en los límites entre agentes y de cara al exterior.

**En caso de fallo:** Ante la duda, verificar. El costo de la confianza falsa (aceptar mala salida) casi siempre supera el costo de la verificación innecesaria. Por defecto verificar y relajar solo cuando hay evidencia de que un límite es seguro.

### Paso 6: Informar Desacuerdos Estructurados en Caso de Fallo

Cuando la verificación falla, producir un desacuerdo estructurado en lugar de aceptar o rechazar silenciosamente la salida. Un desacuerdo estructurado hace que el fallo sea accionable — le dice al agente productor (o al humano) exactamente qué se esperaba, qué se recibió, y dónde está la brecha.

Formato de desacuerdo:

```yaml
verification_result: FAIL
deliverable: "output/data.csv"
timestamp: "2026-03-12T10:04:32Z"
failures:
  - check: "row_count"
    expected: 500
    actual: 487
    severity: warning
    note: "13 rows dropped — investigate filter logic"
  - check: "score_range"
    expected: "[0, 100]"
    actual: "[-3, 100]"
    severity: error
    note: "3 negative scores found — data validation missing"
  - check: "column_presence"
    expected: "grade"
    actual: null
    severity: error
    note: "grade column missing from output"
passes:
  - check: "file_exists"
  - check: "checksum_stable"
  - check: "test_suite"
recommendation: >
  Re-run with input validation enabled. The score_range and column_presence
  failures suggest the transform step is not handling edge cases. Do not
  patch the output — fix the transform and re-execute from source.
```

Principios clave para informar desacuerdos:

- **Ser específico**: "3 puntuaciones negativas encontradas en las filas 42, 187, 301" en lugar de "algunos valores son incorrectos"
- **Incluir tanto el esperado como el real**: La brecha entre ellos es lo que importa
- **Clasificar la gravedad**: `error` (bloquea la aceptación), `warning` (aceptar con advertencia), `info` (anotado para el registro)
- **Recomendar acción**: Corregir y volver a ejecutar vs. aceptar con advertencia vs. rechazar completamente
- **Nunca aceptar silenciosamente**: La confianza social ("el otro agente dijo que está bien") es un vector de ataque. Confiar en la evidencia, no en la afirmación.

**Esperado:** Cada fallo de verificación produce un desacuerdo estructurado con al menos: la verificación que falló, el valor esperado, el valor real y una clasificación de gravedad.

**En caso de fallo:** Si el proceso de verificación en sí falla (p.ej., el script de validación produce un error), informar eso como un meta-fallo. La incapacidad de verificar es en sí misma un hallazgo — significa que el entregable no es verificable en su forma actual, lo cual es peor que un fallo conocido.

## Validación

- [ ] La especificación de resultado esperado existe antes de que comience la ejecución
- [ ] La especificación contiene solo condiciones verificables por máquina (sin criterios subjetivos)
- [ ] El rastro de evidencia se genera durante la ejecución (sumas de verificación, temporización, resultados de pruebas)
- [ ] La evidencia es un efecto secundario de hacer el trabajo, no un paso separado post-hoc
- [ ] Los entregables se validan contra anclas externas (pruebas, esquemas, sumas de verificación)
- [ ] Ningún entregable se verifica preguntándole a su productor "¿es esto correcto?"
- [ ] Las salidas comprimidas o resumidas incluyen verificaciones de fidelidad basadas en muestras
- [ ] Las verificaciones de fidelidad se comparan contra el material fuente, no contra el resumen mismo
- [ ] Los límites de confianza están clasificados (entre agentes, externo, interno)
- [ ] El esfuerzo de verificación es proporcional a la gravedad del límite de confianza
- [ ] Los fallos de verificación producen desacuerdos estructurados (esperado vs. real)
- [ ] Ningún fallo de verificación se acepta o rechaza silenciosamente

## Errores Comunes

- **Verificar la salida preguntándole al productor**: Un agente no puede verificar de forma fiable su propio trabajo. "Lo verifiqué y parece correcto" no es verificación — las anclas externas (pruebas, sumas de verificación, esquemas) son verificación. Como observa rtamind: la fidelidad no puede medirse internamente.
- **Sobre-verificar intermedios internos**: Verificar cada archivo temporal y resultado intermedio añade sobrecarga sin mejorar la fiabilidad. Clasificar los límites de confianza (Paso 5) y concentrar la verificación en las salidas entre agentes y de cara al exterior.
- **Resultados esperados subjetivos**: "El informe debe ser de alta calidad" no es verificable. "El informe contiene las secciones Resumen, Metodología y Resultados, y todas las estadísticas citadas coinciden con los valores calculados de la fuente" es verificable. Si no se puede escribir una verificación para ello, no se puede verificar.
- **Reconstrucción post-hoc de evidencia**: Generar evidencia después del hecho ("déjame calcular la suma de verificación de lo que creo que produje") es poco fiable. La evidencia debe ser un efecto secundario de la ejecución, capturada en tiempo real. La evidencia reconstruida solo prueba lo que existe ahora, no lo que fue producido.
- **Tratar la verificación como infalible**: La verificación en sí puede tener errores. Una suite de pruebas que pasa no significa que el código es correcto — significa que el código satisface las pruebas. Mantener la verificación proporcional y reconocer sus límites en lugar de tratar las verificaciones en verde como verdad absoluta.
- **Aceptar silenciosamente aprobaciones parciales**: Si 9 de 10 verificaciones pasan, el entregable igualmente falla. Informar el único fallo como un desacuerdo estructurado. El crédito parcial es para calificaciones; la entrega es binaria.
- **La confianza social como sustituto**: "El Agente A es fiable, así que omitiré la verificación" es un vector de ataque. Como señala Sentinel_Orol, la confianza sin verificación es explotable. Verificar basándose en la clasificación del límite, no en la reputación del productor.

## Habilidades Relacionadas

- `fail-early-pattern` — complementaria: fail-early detecta mala entrada al inicio; verify-agent-output detecta mala salida al final
- `security-audit-codebase` — preocupación superpuesta: las auditorías de seguridad verifican que el código cumple las expectativas de seguridad, un caso específico de validación de entregables
- `honesty-humility` — complementaria: los agentes honestos reconocen la incertidumbre, haciendo visibles las brechas de verificación en lugar de ocultarlas
- `review-skill-format` — verify-agent-output puede validar que un SKILL.md producido cumple los requisitos de formato, una instancia concreta de validación de entregables
- `create-team` — los equipos que coordinan múltiples agentes se benefician de la validación estructurada de transferencias en cada paso de coordinación
- `test-team-coordination` — prueba si las transferencias del equipo producen entregables verificables, ejercitando los procedimientos de esta habilidad de principio a fin
