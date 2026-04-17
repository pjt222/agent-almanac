---
name: review-skill-format
description: >
  Revisar un archivo SKILL.md para verificar su conformidad con el estándar
  agentskills.io. Comprueba los campos del frontmatter YAML, las secciones
  obligatorias, los límites de recuento de líneas, el formato de los pasos
  del procedimiento y la sincronización con el registro. Usar cuando una nueva
  habilidad necesite validación de formato antes de fusionarse, una habilidad
  existente haya sido modificada y requiera revalidación, al realizar una
  auditoría por lotes de todas las habilidades en un dominio, o al revisar
  la contribución de una habilidad de un colaborador en una pull request.
locale: es
source_locale: en
source_commit: c7ff09ca
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, format, validation, agentskills, quality
---

# Revisar Formato de Habilidad

Validar un archivo SKILL.md frente al estándar abierto agentskills.io. Esta habilidad verifica la completitud del frontmatter YAML, la presencia de las secciones obligatorias, el formato de los pasos del procedimiento (bloques Esperado/En caso de fallo), los límites de recuento de líneas y la sincronización con el registro. Úsela antes de fusionar cualquier habilidad nueva o modificada.

## Cuándo Usar

- Una nueva habilidad ha sido creada y necesita validación de formato antes de fusionarse
- Una habilidad existente ha sido modificada y necesita revalidación
- Realizar una auditoría por lotes de todas las habilidades en un dominio
- Verificar una habilidad creada por la metahabilidad `create-skill`
- Revisar la contribución de una habilidad de un colaborador en una pull request

## Entradas

- **Obligatorio**: Ruta al archivo SKILL.md (p. ej., `skills/setup-vault/SKILL.md`)
- **Opcional**: Nivel de estrictez (`lenient` o `strict`, predeterminado: `strict`)
- **Opcional**: Si verificar la sincronización con el registro (predeterminado: sí)

## Procedimiento

### Paso 1: Verificar que el Archivo Existe y Leer su Contenido

Confirmar que el archivo SKILL.md existe en la ruta esperada y leer su contenido completo.

```bash
# Verificar que el archivo existe
test -f skills/<skill-name>/SKILL.md && echo "EXISTS" || echo "MISSING"

# Contar líneas
wc -l < skills/<skill-name>/SKILL.md
```

**Esperado:** El archivo existe y su contenido es legible. Se muestra el recuento de líneas.

**En caso de fallo:** Si el archivo no existe, verifique la ruta en busca de errores tipográficos. Verifique que el directorio de la habilidad existe con `ls skills/<skill-name>/`. Si falta el directorio, la habilidad aún no se ha creado — use primero `create-skill`.

### Paso 2: Verificar los Campos del Frontmatter YAML

Analizar el bloque de frontmatter YAML (entre los delimitadores `---`) y verificar que todos los campos obligatorios y recomendados están presentes.

Campos obligatorios:
- `name` — coincide con el nombre del directorio (kebab-case)
- `description` — menos de 1024 caracteres, comienza con un verbo
- `license` — típicamente `MIT`
- `allowed-tools` — lista separada por comas o espacios

Campos de metadatos recomendados:
- `metadata.author` — nombre del autor
- `metadata.version` — cadena de versión semántica
- `metadata.domain` — uno de los dominios listados en `skills/_registry.yml`
- `metadata.complexity` — uno de: `basic`, `intermediate`, `advanced`
- `metadata.language` — idioma principal o `multi`
- `metadata.tags` — separado por comas, 3-6 etiquetas, incluye el nombre del dominio

```bash
# Verificar que los campos obligatorios del frontmatter existen
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: MISSING"
```

**Esperado:** Los cuatro campos obligatorios presentes. Los seis campos de metadatos presentes. `name` coincide con el nombre del directorio. `description` tiene menos de 1024 caracteres.

**En caso de fallo:** Reportar cada campo faltante como BLOQUEANTE. Si `name` no coincide con el nombre del directorio, reportar como BLOQUEANTE con el valor esperado. Si `description` supera los 1024 caracteres, reportar como SUGERENCIA con la longitud actual.

### Step 3: Locale-Specific Validation (Translations Only)

If the frontmatter contains a `locale` field, the file is a translated SKILL.md. Perform these additional checks. If no `locale` field is present, skip this step.

1. **Translation frontmatter fields** — Verify these five fields are present:
   - `locale` — target locale code (e.g., `de`, `ja`, `zh-CN`, `es`)
   - `source_locale` — origin locale (typically `en`)
   - `source_commit` — commit hash of the English source used for translation
   - `translator` — who or what produced the translation
   - `translation_date` — ISO 8601 date of translation

2. **Prose language scan** — Sample 3-5 body paragraphs (outside code blocks, frontmatter, and headings). Verify the prose is written in the target locale, not English.

3. **Code block identity check** — Compare code blocks in the translated file against the English source. Code blocks must be identical (code is never translated).

**Expected:** All five translation fields present. Body paragraphs are in the target locale. Code blocks match the English source exactly.

**On failure:** Report missing translation fields as BLOCKING. If body paragraphs are in English despite a non-English `locale`, report as BLOCKING.

### Paso 3: Verificar las Secciones Obligatorias

Verificar que las seis secciones obligatorias están presentes en el cuerpo de la habilidad (después del frontmatter).

Secciones obligatorias:
1. `## When to Use`
2. `## Inputs`
3. `## Procedure` (con subsecciones `### Step N:`)
4. `## Validation` (también puede aparecer como `## Validation Checklist`)
5. `## Common Pitfalls`
6. `## Related Skills`

```bash
# Verificar cada sección obligatoria
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done

# La sección de validación puede usar cualquiera de los dos encabezados
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

**Esperado:** Las seis secciones presentes. La sección de procedimiento contiene al menos un subencabezado `### Step`.

**En caso de fallo:** Reportar cada sección faltante como BLOQUEANTE. Una habilidad sin las seis secciones no cumple con el estándar agentskills.io. Proporcionar la plantilla de sección de la metahabilidad `create-skill`.

### Paso 4: Verificar el Formato de los Pasos del Procedimiento

Verificar que cada paso del procedimiento sigue el patrón requerido: título del paso numerado, contexto, bloques de código y bloques **Expected:**/**On failure:**.

Para cada subsección `### Step N:`, verificar:
1. El paso tiene un título descriptivo (no solo "Step N")
2. Existe al menos un bloque de código o instrucción concreta
3. Un bloque `**Expected:**` está presente
4. Un bloque `**On failure:**` está presente

**Esperado:** Cada paso del procedimiento tiene los bloques **Expected:** y **On failure:**. Los pasos contienen código concreto o instrucciones, no descripciones vagas.

**En caso de fallo:** Reportar cada paso al que le falten Expected/On failure como BLOQUEANTE. Si los pasos contienen solo instrucciones vagas ("configurar el sistema apropiadamente"), reportar como SUGERENCIA con una nota para añadir comandos concretos.

### Paso 5: Verificar el Recuento de Líneas

Verificar que el SKILL.md está dentro del límite de 500 líneas.

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "OVER LIMIT ($lines lines > 500)"
```

**Esperado:** El recuento de líneas es 500 o menos.

**En caso de fallo:** Si supera las 500 líneas, reportar como BLOQUEANTE. Recomendar usar la habilidad `refactor-skill-structure` para extraer bloques de código de más de 15 líneas a `references/EXAMPLES.md`. Reducción típica: 20-40% extrayendo ejemplos extendidos.

### Paso 6: Verificar la Sincronización con el Registro

Verificar que la habilidad está listada en `skills/_registry.yml` bajo el dominio correcto con metadatos coincidentes.

Verificar:
1. El `id` de la habilidad existe bajo la sección de dominio correcta
2. El `path` coincide con `<skill-name>/SKILL.md`
3. La `complexity` coincide con el frontmatter
4. La `description` está presente (puede estar abreviada)
5. El recuento `total_skills` en la parte superior del registro coincide con el recuento real de habilidades

```bash
# Verificar si la habilidad está en el registro
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: FOUND" || echo "Registry: NOT FOUND"

# Verificar la ruta
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Path: OK" || echo "Path: MISMATCH"
```

**Esperado:** La habilidad está listada en el registro bajo el dominio correcto con ruta y metadatos coincidentes. El recuento total es preciso.

**En caso de fallo:** Si no se encuentra en el registro, reportar como BLOQUEANTE. Proporcionar la plantilla de entrada del registro:
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: Descripción en una línea
```

## Validación

- [ ] El archivo SKILL.md existe en la ruta esperada
- [ ] El frontmatter YAML se analiza sin errores
- [ ] Los cuatro campos obligatorios del frontmatter presentes (`name`, `description`, `license`, `allowed-tools`)
- [ ] Los seis campos de metadatos presentes (`author`, `version`, `domain`, `complexity`, `language`, `tags`)
- [ ] El campo `name` coincide con el nombre del directorio
- [ ] La `description` tiene menos de 1024 caracteres
- [ ] Las seis secciones obligatorias presentes (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- [ ] Cada paso del procedimiento tiene los bloques **Expected:** y **On failure:**
- [ ] El recuento de líneas es 500 o menos
- [ ] La habilidad está listada en `_registry.yml` con el dominio, ruta y metadatos correctos
- [ ] El recuento `total_skills` en el registro es preciso

## Errores Comunes

- **Verificar el frontmatter solo con regex**: El análisis YAML puede ser sutil. Un bloque multilínea `description: >` se ve diferente de `description: "inline"`. Verifique ambos patrones al buscar campos.
- **No encontrar la variante de la sección de validación**: Algunas habilidades usan `## Validation Checklist` en lugar de `## Validation`. Ambas son aceptables; verifique cualquiera de los dos encabezados.
- **Olvidar el recuento total del registro**: Después de añadir una habilidad al registro, el número `total_skills` en la parte superior también debe incrementarse. Este es un error común en las PRs.
- **Confusión entre nombre y título**: El campo `name` debe estar en kebab-case coincidiendo con el nombre del directorio. El encabezado `# Título` es legible por humanos y puede diferir (p. ej., name: `review-skill-format`, título: `# Revisar Formato de Habilidad`).
- **El modo lenient omite bloqueantes**: Incluso en modo lenient, los campos del frontmatter y las secciones obligatorias faltantes deben seguir siendo señalados. El modo lenient solo relaja las recomendaciones de estilo y metadatos.

## Habilidades Relacionadas

- `create-skill` — La especificación de formato canónico; úsela como referencia autoritativa de cómo se ve un SKILL.md válido
- `update-skill-content` — Después de que pasa la validación de formato, use esto para mejorar la calidad del contenido
- `refactor-skill-structure` — Cuando una habilidad falla la comprobación de recuento de líneas, use esto para extraer y reorganizar
- `review-pull-request` — Al revisar una PR que agrega o modifica habilidades, combine la revisión de PR con la validación de formato
- [ ] (Translations only) All five translation frontmatter fields present (`locale`, `source_locale`, `source_commit`, `translator`, `translation_date`)
- [ ] (Translations only) Body paragraphs are in the target locale, not English
- [ ] (Translations only) Code blocks are identical to the English source
