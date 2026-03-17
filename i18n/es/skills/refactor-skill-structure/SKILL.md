---
name: refactor-skill-structure
description: >
  Refactorizar un SKILL.md demasiado largo o mal estructurado extrayendo
  ejemplos a references/EXAMPLES.md, dividiendo procedimientos compuestos
  y reorganizando secciones para una divulgación progresiva. Usar cuando
  una habilidad supere el límite de 500 líneas de CI, cuando los bloques
  de código dominen el cuerpo de la habilidad, cuando un paso del procedimiento
  contenga múltiples operaciones no relacionadas, o después de que una
  actualización de contenido haya empujado la habilidad por encima del
  límite de líneas.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: advanced
  language: multi
  tags: review, skills, refactoring, structure, progressive-disclosure
---

# Refactorizar Estructura de Habilidad

Refactorizar un SKILL.md que ha superado el límite de 500 líneas o ha desarrollado problemas estructurales. Esta habilidad extrae ejemplos de código extendidos a `references/EXAMPLES.md`, divide procedimientos compuestos en subprocedimientos enfocados, añade referencias cruzadas para la divulgación progresiva y verifica que la habilidad sigue siendo completa y válida después de la reestructuración.

## Cuándo Usar

- Una habilidad supera el límite de 500 líneas aplicado por CI
- Un solo paso del procedimiento contiene múltiples operaciones no relacionadas que deberían ser pasos separados
- Los bloques de código de más de 15 líneas dominan el SKILL.md y podrían extraerse
- La habilidad ha acumulado secciones ad-hoc que rompen la estructura estándar de seis secciones
- Después de que una actualización de contenido empujó la habilidad por encima del límite de líneas
- Una revisión de la habilidad señaló problemas estructurales que van más allá de la calidad del contenido

## Entradas

- **Obligatorio**: Ruta al archivo SKILL.md a refactorizar
- **Opcional**: Recuento de líneas objetivo (predeterminado: apuntar al 80% del límite de 500 líneas, es decir, ~400 líneas)
- **Opcional**: Si crear `references/EXAMPLES.md` (predeterminado: sí, si existe contenido extraíble)
- **Opcional**: Si dividir en múltiples habilidades (predeterminado: no, preferir primero la extracción)

## Procedimiento

### Paso 1: Medir el Recuento de Líneas Actual e Identificar las Fuentes de Inflación

Leer la habilidad y crear un presupuesto de líneas sección por sección para identificar dónde está la inflación.

```bash
# Recuento total de líneas
wc -l < skills/<skill-name>/SKILL.md

# Recuento de líneas por sección (aproximado)
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

Clasificar las fuentes de inflación:
- **Extraíble**: Bloques de código de más de 15 líneas, ejemplos de configuración completos, ejemplos de múltiples variantes
- **Divisible**: Pasos de procedimiento compuestos que realizan 2+ operaciones no relacionadas
- **Recortable**: Explicaciones redundantes, oraciones de contexto excesivamente largas
- **Estructural**: Secciones ad-hoc que no están en la estructura estándar de seis secciones

**Esperado:** Un presupuesto de líneas que muestre qué secciones están sobredimensionadas y qué categoría de inflación aplica a cada una. Las secciones más grandes son los objetivos principales de refactorización.

**En caso de fallo:** Si la habilidad está por debajo de las 500 líneas y no hay problemas estructurales aparentes, puede que esta habilidad no sea necesaria. Verificar que la solicitud de refactorización está justificada antes de continuar.

### Paso 2: Extraer Bloques de Código a references/EXAMPLES.md

Mover bloques de código de más de 15 líneas a un archivo `references/EXAMPLES.md`, dejando fragmentos breves en línea (3-10 líneas) en el SKILL.md principal.

1. Crear el directorio de referencias:
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. Para cada bloque de código extraíble:
   - Copiar el bloque de código completo a `references/EXAMPLES.md` bajo un encabezado descriptivo
   - Reemplazar el bloque de código en SKILL.md con un fragmento breve de 3-5 líneas
   - Añadir una referencia cruzada: `See [EXAMPLES.md](references/EXAMPLES.md#heading) for the complete configuration.`

3. Estructurar `references/EXAMPLES.md` con encabezados claros:
   ```markdown
   # Examples

   ## Example 1: Full Configuration

   Complete configuration file for [context]:

   \```yaml
   # ... full config here ...
   \```

   ## Example 2: Multi-Variant Setup

   ### Variant A: Development
   \```yaml
   # ... dev config ...
   \```

   ### Variant B: Production
   \```yaml
   # ... prod config ...
   \```
   ```

**Esperado:** Todos los bloques de código de más de 15 líneas están extraídos. El SKILL.md principal retiene fragmentos breves en línea para legibilidad. Las referencias cruzadas enlazan al contenido extraído. `references/EXAMPLES.md` está bien organizado con encabezados descriptivos.

**En caso de fallo:** Si extraer bloques de código no reduce suficientemente el recuento de líneas (sigue por encima de 500), proceda al Paso 3 para la división del procedimiento. Si la habilidad tiene muy pocos bloques de código (p. ej., una habilidad en lenguaje natural), enfóquese en los Pasos 3 y 4 en su lugar.

### Paso 3: Dividir Procedimientos Compuestos en Pasos Enfocados

Identificar pasos del procedimiento que realizan múltiples operaciones no relacionadas y dividirlos.

Señales de un paso compuesto:
- El título del paso contiene "and" (p. ej., "Configure Database and Set Up Caching")
- El paso tiene múltiples bloques Expected/On failure (o debería tenerlos)
- El paso tiene más de 30 líneas
- El paso podría omitirse o realizarse en un orden diferente de sus subpartes

Para cada paso compuesto:
1. Identificar las operaciones distintas dentro del paso
2. Crear un nuevo `### Step N:` para cada operación
3. Renumerar los pasos siguientes
4. Asegurarse de que cada nuevo paso tiene sus propios bloques Expected y On failure
5. Añadir contexto de transición entre los nuevos pasos

**Esperado:** Cada paso del procedimiento hace una sola cosa. Ningún paso supera las 30 líneas. El recuento de pasos puede aumentar pero cada paso es independientemente verificable.

**En caso de fallo:** Si dividir un paso crea pasos demasiado granulares (p. ej., 20+ pasos en total), considere agrupar los micropasos relacionados bajo un solo paso con subpasos numerados. El punto óptimo es de 5-12 pasos de procedimiento.

### Paso 4: Añadir Referencias Cruzadas desde SKILL.md al Contenido Extraído

Asegurarse de que el SKILL.md principal mantiene la legibilidad y la capacidad de descubrimiento después de la extracción.

Para cada extracción:
1. El fragmento en línea en SKILL.md debe ser autosuficiente para el caso común
2. La referencia cruzada debe explicar qué contenido adicional está disponible
3. Usar rutas relativas: `[EXAMPLES.md](references/EXAMPLES.md#section-anchor)`

Patrones de referencia cruzada:
- Después de un fragmento de código breve: `See [EXAMPLES.md](references/EXAMPLES.md#full-configuration) for the complete configuration with all options.`
- Para ejemplos de múltiples variantes: `See [EXAMPLES.md](references/EXAMPLES.md#variants) for development, staging, and production variants.`
- Para solución de problemas extendida: `See [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) for additional error scenarios.`

**Esperado:** Cada extracción tiene una referencia cruzada correspondiente. Un lector puede seguir el SKILL.md principal para el caso común y profundizar en las referencias para obtener detalles.

**En caso de fallo:** Si las referencias cruzadas hacen que el flujo del texto sea incómodo, consolide múltiples referencias en una sola nota al final del paso del procedimiento: `For extended examples including [X], [Y], and [Z], see [EXAMPLES.md](references/EXAMPLES.md).`

### Paso 5: Verificar el Recuento de Líneas Después de la Refactorización

Volver a medir el recuento de líneas del SKILL.md después de todos los cambios.

```bash
# Verificar el SKILL.md principal
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "SKILL.md: OK ($lines lines)" || echo "SKILL.md: STILL OVER ($lines lines)"

# Verificar el archivo de referencias si fue creado
if [ -f skills/<skill-name>/references/EXAMPLES.md ]; then
  ref_lines=$(wc -l < skills/<skill-name>/references/EXAMPLES.md)
  echo "EXAMPLES.md: $ref_lines lines"
fi

# Contenido total
echo "Total content: $((lines + ${ref_lines:-0})) lines"
```

**Esperado:** El SKILL.md está por debajo de las 500 líneas. Idealmente por debajo de las 400 líneas para dejar espacio para el crecimiento futuro. `references/EXAMPLES.md` no tiene límite de líneas.

**En caso de fallo:** Si sigue por encima de las 500 líneas después de la extracción y la división, considere si la habilidad debería descomponerse en dos habilidades separadas. Una habilidad que cubre demasiado terreno es una señal de expansión del alcance. Use `create-skill` para crear la segunda habilidad y actualice las referencias cruzadas de Habilidades Relacionadas en ambas.

### Paso 6: Validar que Todas las Secciones Siguen Presentes

Después de la refactorización, verificar que la habilidad sigue teniendo todas las secciones obligatorias y que el frontmatter está intacto.

Ejecutar la lista de verificación de `review-skill-format`:
1. El frontmatter YAML se analiza correctamente
2. Las seis secciones obligatorias presentes (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
3. Cada paso del procedimiento tiene los bloques Expected y On failure
4. Sin referencias cruzadas huérfanas (todos los enlaces se resuelven)

```bash
# Verificación rápida de secciones
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

**Esperado:** Todas las secciones presentes. Ningún contenido fue eliminado accidentalmente durante la extracción. Las referencias cruzadas en SKILL.md se resuelven a encabezados reales en EXAMPLES.md.

**En caso de fallo:** Si una sección fue eliminada accidentalmente, restáurela desde el historial de git: `git diff skills/<skill-name>/SKILL.md` para ver qué cambió. Si las referencias cruzadas están rotas, verifique que los anclajes de encabezado en EXAMPLES.md coincidan con los enlaces en SKILL.md (reglas de anclaje de markdown con formato GitHub: minúsculas, guiones para espacios, eliminar puntuación).

## Validación

- [ ] El recuento de líneas del SKILL.md es 500 o menos
- [ ] Todos los bloques de código en SKILL.md tienen 15 líneas o menos
- [ ] El contenido extraído está en `references/EXAMPLES.md` con encabezados descriptivos
- [ ] Cada extracción tiene una referencia cruzada en el SKILL.md principal
- [ ] No quedan pasos de procedimiento compuestos (cada paso hace una sola cosa)
- [ ] Las seis secciones obligatorias están presentes después de la refactorización
- [ ] Cada paso del procedimiento tiene los bloques **Expected:** y **On failure:**
- [ ] El frontmatter YAML está intacto y es analizable
- [ ] Los enlaces de referencia cruzada se resuelven a encabezados reales en EXAMPLES.md
- [ ] La validación de `review-skill-format` pasa en la habilidad refactorizada

## Errores Comunes

- **Extraer demasiado agresivamente**: Mover todo el código a referencias hace que el SKILL.md principal sea ilegible. Mantener fragmentos de 3-10 líneas en línea para el caso común. Solo extraer bloques de más de 15 líneas o que muestren múltiples variantes.
- **Anclajes de enlace rotos**: Los anclajes de markdown con formato GitHub distinguen entre mayúsculas y minúsculas en algunos rendizadores. Use encabezados en minúsculas en EXAMPLES.md y haga coincidir exactamente en las referencias cruzadas. Pruebe con `grep -c "heading-text" references/EXAMPLES.md`.
- **Perder Expected/On failure durante las divisiones**: Al dividir pasos compuestos, asegúrese de que cada nuevo paso tenga sus propios bloques Expected y On failure. Es fácil dejar un paso sin estos bloques después de una división.
- **Crear demasiados pasos diminutos**: La división debe producir 5-12 pasos de procedimiento. Si termina con 15+, ha dividido demasiado agresivamente. Fusione los micropasos relacionados de vuelta en grupos lógicos.
- **Olvidar actualizar los encabezados de references/EXAMPLES.md**: Si renombra una sección en EXAMPLES.md, todos los anclajes de referencia cruzada en SKILL.md deben actualizarse. Haga grep del nombre de anclaje antiguo para encontrar todas las referencias.

## Habilidades Relacionadas

- `review-skill-format` — Ejecutar la validación de formato después de la refactorización para confirmar que la habilidad sigue siendo conforme
- `update-skill-content` — Las actualizaciones de contenido son a menudo el desencadenante de la refactorización estructural cuando empujan una habilidad por encima del límite de líneas
- `create-skill` — Referencia la estructura canónica al decidir cómo organizar el contenido extraído
- `evolve-skill` — Cuando una habilidad necesita dividirse en dos habilidades separadas, use la evolución para crear el derivado
