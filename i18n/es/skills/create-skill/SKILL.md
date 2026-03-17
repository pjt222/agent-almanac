---
name: create-skill
description: >
  Crea un nuevo archivo SKILL.md siguiendo el estándar abierto Agent Skills
  (agentskills.io). Cubre el esquema de frontmatter, la estructura de secciones,
  la escritura de procedimientos efectivos con pares Esperado/En caso de fallo,
  listas de verificación de validación, referencias cruzadas e integración en
  el registro. Usar al codificar un procedimiento repetible para agentes, al
  añadir una nueva capacidad a la biblioteca de habilidades, al convertir una
  guía o manual de operaciones en formato consumible por agentes, o al
  estandarizar un flujo de trabajo entre proyectos o equipos.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, standard, authoring
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Crear una Nueva Habilidad

Crea un archivo SKILL.md que los sistemas agénticos puedan consumir para ejecutar un procedimiento específico.

## Cuándo Usar

- Al codificar un procedimiento repetible que los agentes deben seguir
- Al añadir una nueva capacidad a la biblioteca de habilidades
- Al convertir una guía, manual de operaciones o lista de verificación en formato consumible por agentes
- Al estandarizar un flujo de trabajo entre proyectos o equipos

## Entradas

- **Requerido**: Tarea que la habilidad debe realizar
- **Requerido**: Clasificación de dominio — uno de los 48 dominios en `skills/_registry.yml`:
  `r-packages`, `jigsawr`, `containerization`, `reporting`, `compliance`, `mcp-integration`,
  `web-dev`, `git`, `general`, `citations`, `data-serialization`, `review`, `bushcraft`,
  `esoteric`, `design`, `defensive`, `project-management`, `devops`, `observability`, `mlops`,
  `workflow-visualization`, `swarm`, `morphic`, `alchemy`, `tcg`, `intellectual-property`,
  `gardening`, `shiny`, `animal-training`, `mycology`, `prospecting`, `crafting`,
  `library-science`, `travel`, `relocation`, `a2a-protocol`, `geometry`, `number-theory`,
  `stochastic-processes`, `theoretical-science`, `diffusion`, `hildegard`, `maintenance`,
  `blender`, `visualization`, `3d-printing`, `lapidary`, `versioning`
- **Requerido**: Nivel de complejidad (basic, intermediate, advanced)
- **Opcional**: Material fuente (guía existente, manual de operaciones o ejemplo funcional)
- **Opcional**: Habilidades relacionadas para referencias cruzadas

## Procedimiento

### Paso 1: Crear el Directorio

Cada habilidad reside en su propio directorio:

```bash
mkdir -p skills/<skill-name>/
```

Convenciones de nomenclatura:
- Usar kebab-case en minúsculas: `submit-to-cran`, no `SubmitToCRAN`
- Comenzar con un verbo: `create-`, `setup-`, `write-`, `deploy-`, `configure-`
- Ser específico: `create-r-dockerfile` no `create-dockerfile`

**Esperado:** El directorio `skills/<skill-name>/` existe y el nombre sigue el kebab-case en minúsculas comenzando con un verbo.

**En caso de fallo:** Si el nombre no comienza con un verbo, renombrar el directorio. Verificar conflictos de nombres: `ls skills/ | grep <keyword>` para asegurarse de que ninguna habilidad existente tenga un nombre superpuesto.

### Paso 2: Escribir el Frontmatter YAML

```yaml
---
name: skill-name-here
description: >
  Una a tres oraciones más los disparadores clave de activación. Debe ser
  suficientemente claro para que un agente decida si activar esta habilidad
  solo a partir de la descripción. Máx. 1024 caracteres. Comenzar con un verbo.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob  # opcional, experimental
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: R | TypeScript | Python | Docker | Rust | multi
  tags: comma, separated, lowercase, tags
---
```

**Campos requeridos**: `name`, `description`

**Campos opcionales**: `license`, `allowed-tools` (experimental), `metadata`, `compatibility`

**Convenciones de metadata**:
- `complexity`: basic (< 5 pasos, sin casos extremos), intermediate (5-10 pasos, algo de juicio), advanced (10+ pasos, conocimiento de dominio significativo)
- `language`: lenguaje principal; usar `multi` para habilidades entre lenguajes
- `tags`: 3-6 etiquetas para descubrimiento; incluir el nombre del dominio

**Esperado:** El frontmatter YAML se analiza sin errores, `name` coincide con el nombre del directorio, y `description` tiene menos de 1024 caracteres con disparadores de activación claros.

**En caso de fallo:** Validar el YAML comprobando los delimitadores `---` coincidentes, las comillas correctas en los strings de versión (p.ej., `"1.0"` no `1.0`), y la sintaxis correcta de plegado multilínea `>` para el campo de descripción.

### Paso 3: Escribir el Título y la Introducción

```markdown
# Título de la Habilidad (Forma Verbal Imperativa)

Un párrafo: qué logra esta habilidad y el valor que proporciona.
```

El título debe coincidir con el `name` pero en forma legible por humanos. "Submit to CRAN" no "submit-to-cran".

**Esperado:** Un encabezado `#` de nivel superior en forma imperativa seguido de un párrafo conciso que indica qué logra la habilidad.

**En caso de fallo:** Si el título se lee como una frase nominal en lugar de una frase verbal, reescribirlo. "Package Submission" se convierte en "Submit to CRAN."

### Paso 4: Escribir "Cuándo Usar"

Listar 3-5 condiciones desencadenantes — escenarios concretos donde un agente debe activar esta habilidad:

```markdown
## When to Use

- Starting a new R package from scratch
- Converting loose R scripts into a package
- Setting up a package skeleton for collaborative development
```

Escribir desde la perspectiva del agente. Estas son las condiciones que el agente verifica para decidir la activación.

> **Nota**: Los disparadores más importantes también deben aparecer en el campo `description` del frontmatter, ya que se lee durante la fase de descubrimiento antes de que se cargue el cuerpo completo. La sección `## When to Use` proporciona detalles y contexto adicionales.

**Esperado:** 3-5 puntos que describen condiciones concretas y observables bajo las cuales un agente debe activar esta habilidad.

**En caso de fallo:** Si los disparadores se sienten vagos ("cuando algo necesita hacerse"), reescribir desde la perspectiva del agente: ¿qué estado observable o solicitud del usuario desencadenaría la activación?

### Paso 5: Escribir "Entradas"

Separar requeridas de opcionales. Ser específico sobre tipos y valores por defecto:

```markdown
## Inputs

- **Required**: Package name (lowercase, no special characters except `.`)
- **Required**: One-line description of the package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Whether to initialize renv (default: yes)
```

**Esperado:** La sección de Entradas separa claramente los parámetros requeridos de los opcionales, cada uno con una pista de tipo y valor por defecto donde corresponda.

**En caso de fallo:** Si el tipo de un parámetro es ambiguo, añadir un ejemplo concreto entre paréntesis: "Package name (lowercase, no special characters except `.`)".

### Paso 6: Escribir "Procedimiento"

Este es el núcleo de la habilidad. Cada paso sigue este patrón:

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific — file created, output matches pattern, command exits 0.

**On failure:** Recovery steps. Don't just say "fix it" — provide the most common failure cause and its resolution.
```

**Escritura de pasos efectivos**:
- Cada paso debe ser verificable de forma independiente
- Incluir código real, no pseudocódigo
- Poner el camino más común primero, los casos extremos en "On failure"
- 5-10 pasos es el punto óptimo. Menos de 5 puede ser demasiado vago; más de 12 debe dividirse en múltiples habilidades.
- Referenciar herramientas reales y comandos reales, no descripciones abstractas

**Esperado:** La sección de Procedimiento contiene de 5 a 12 pasos numerados, cada uno con código concreto, un resultado `**Expected:**` y una acción de recuperación `**On failure:**`.

**En caso de fallo:** Si a un paso le falta código, añadir el comando o configuración real. Si falta Expected/On failure, escribirlos ahora — cada paso que puede fallar necesita ambos.

### Paso 7: Escribir "Validación"

Una lista de verificación que el agente ejecuta tras completar el procedimiento:

```markdown
## Validation

- [ ] Criterion 1 (testable, binary pass/fail)
- [ ] Criterion 2
- [ ] No errors or warnings in output
```

Cada elemento debe ser verificable objetivamente. "El código está limpio" es malo. "`devtools::check()` devuelve 0 errores" es bueno.

**Esperado:** Una lista de verificación markdown (`- [ ]`) con 3-8 criterios binarios de paso/fallo que un agente puede verificar programáticamente o por inspección.

**En caso de fallo:** Reemplazar criterios subjetivos con criterios medibles. "Bien documentado" se convierte en "Todas las funciones exportadas tienen etiquetas roxygen `@param`, `@return` y `@examples`."

### Paso 8: Escribir "Errores Comunes"

3-6 errores con causa y cómo evitarlos:

```markdown
## Common Pitfalls

- **Pitfall name**: What goes wrong and how to avoid it. Be specific about the symptom and the fix.
```

Basarse en experiencia real. Los mejores errores son los que desperdician tiempo significativo y no son obvios.

**Esperado:** 3-6 errores, cada uno con un nombre en negrita, una descripción de qué sale mal y cómo evitarlo.

**En caso de fallo:** Si los errores se sienten genéricos ("tener cuidado con X"), hacerlos específicos: nombrar el síntoma, la causa y la solución. Basarse en escenarios de fallo reales encontrados durante el desarrollo o las pruebas.

### Paso 9: Escribir "Habilidades Relacionadas"

Referenciar cruzadamente 2-5 habilidades que se usan comúnmente antes, después o junto con esta:

```markdown
## Related Skills

- `prerequisite-skill` - must be done before this skill
- `follow-up-skill` - commonly done after this skill
- `alternative-skill` - alternative approach to the same goal
```

Usar el campo `name` de la habilidad (kebab-case), no el título.

**Esperado:** 2-5 habilidades relacionadas listadas con IDs en kebab-case y breves descripciones de la relación (prerequisito, seguimiento, alternativa).

**En caso de fallo:** Verificar que cada habilidad referenciada existe: `ls skills/<skill-name>/SKILL.md`. Eliminar cualquier referencia a habilidades que han sido renombradas o eliminadas.

### Paso 10: Añadir al Registro

Editar `skills/_registry.yml` y añadir la nueva habilidad bajo el dominio apropiado:

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

Actualizar el recuento `total_skills` al inicio del registro.

**Esperado:** La nueva entrada aparece en `skills/_registry.yml` bajo el dominio correcto, y el recuento `total_skills` coincide con el número real de directorios de habilidades en disco.

**En caso de fallo:** Contar las habilidades en disco con `find skills -name SKILL.md | wc -l` y comparar con `total_skills` en el registro. Verificar que el campo `id` coincide exactamente con el nombre del directorio.

### Paso 11: Añadir Citas (Opcional)

Si la habilidad se basa en metodologías establecidas, artículos de investigación, paquetes de software o estándares, añadir subarchivos de citas al directorio `references/`:

```bash
mkdir -p skills/<skill-name>/references/
```

Crear dos archivos:

- **`references/CITATIONS.bib`** — BibTeX legible por máquinas (fuente de verdad)
- **`references/CITATIONS.md`** — Referencias renderizadas legibles por humanos para navegación en GitHub

```bibtex
% references/CITATIONS.bib
@article{author2024title,
  author  = {Author, First and Other, Second},
  title   = {Paper Title},
  journal = {Journal Name},
  year    = {2024},
  doi     = {10.xxxx/xxxxx}
}
```

```markdown
<!-- references/CITATIONS.md -->
# Citations

References underpinning the **skill-name** skill.

1. Author, F., & Other, S. (2024). *Paper Title*. Journal Name. https://doi.org/10.xxxx/xxxxx
```

Las citas son opcionales — añadirlas cuando el seguimiento de la procedencia sea importante (métodos académicos, estándares publicados, marcos regulatorios).

**Esperado:** Ambos archivos existen y `.bib` se analiza como BibTeX válido.

**En caso de fallo:** Validar la sintaxis BibTeX con `bibtool -d references/CITATIONS.bib` o un validador en línea.

### Paso 12: Validar la Habilidad

Ejecutar verificaciones de validación local antes de confirmar:

```bash
# Verificar el recuento de líneas (debe ser ≤500)
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# Verificar los campos de frontmatter requeridos
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**Esperado:** Recuento de líneas ≤500, todos los campos requeridos presentes.

**En caso de fallo:** Si supera las 500 líneas, aplicar divulgación progresiva — extraer bloques de código grandes (>15 líneas) a `references/EXAMPLES.md`:

```bash
mkdir -p skills/<skill-name>/references/
```

Mover ejemplos de código extendidos, archivos de configuración completos y ejemplos de múltiples variantes a `references/EXAMPLES.md`. Añadir referencia cruzada en SKILL.md: `See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` Mantener fragmentos en línea breves (3-10 líneas) en el SKILL.md principal. El flujo de trabajo CI en `.github/workflows/validate-skills.yml` aplica estos límites en todos los PRs.

### Paso 13: Crear Symlinks de Comandos Slash

Crear symlinks para que Claude Code descubra la habilidad como un `/slash-command`:

```bash
# A nivel de proyecto (disponible en este proyecto)
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# Global (disponible en todos los proyectos)
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**Esperado:** `ls -la .claude/skills/<skill-name>/SKILL.md` resuelve al archivo de habilidad.

**En caso de fallo:** Verificar que la ruta relativa es correcta. Desde `.claude/skills/`, la ruta `../../skills/<skill-name>` debe llegar al directorio de la habilidad. Usar `readlink -f` para depurar la resolución de symlinks. Claude Code espera una estructura plana en `.claude/skills/<name>/SKILL.md`.

## Validación

- [ ] SKILL.md existe en `skills/<skill-name>/SKILL.md`
- [ ] El frontmatter YAML se analiza sin errores
- [ ] El campo `name` coincide con el nombre del directorio
- [ ] `description` tiene menos de 1024 caracteres
- [ ] Todas las secciones requeridas presentes: When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills
- [ ] Cada paso del procedimiento tiene código concreto y pares Expected/On failure
- [ ] Las Habilidades Relacionadas hacen referencia a nombres de habilidades válidos
- [ ] La habilidad está listada en `_registry.yml` con la ruta correcta
- [ ] El recuento `total_skills` en el registro está actualizado
- [ ] SKILL.md tiene ≤500 líneas (extraer a `references/EXAMPLES.md` si supera)
- [ ] Citas añadidas a `references/CITATIONS.bib` + `CITATIONS.md` si la habilidad se basa en métodos publicados
- [ ] El symlink existe en `.claude/skills/<skill-name>` apuntando al directorio de la habilidad
- [ ] El symlink global existe en `~/.claude/skills/<skill-name>` (si está disponible globalmente)

## Errores Comunes

- **Procedimientos vagos**: "Configurar el sistema apropiadamente" es inútil para un agente. Proporcionar comandos exactos, rutas de archivo y valores de configuración.
- **On failure faltante**: Cada paso que puede fallar necesita orientación de recuperación. Los agentes no pueden improvisar — necesitan el plan alternativo especificado.
- **Alcance demasiado amplio**: Una habilidad que intenta cubrir "Configurar todo el entorno de desarrollo" debería ser 3-5 habilidades enfocadas. Una habilidad = un procedimiento.
- **Validación no comprobable**: "La calidad del código es buena" no puede verificarse. "El linter pasa con 0 advertencias" sí puede.
- **Referencias cruzadas obsoletas**: Al renombrar o eliminar habilidades, buscar el nombre antiguo en todas las secciones de Habilidades Relacionadas.
- **Descripción demasiado larga**: El campo de descripción es lo que los agentes leen para decidir la activación. Mantenerlo por debajo de 1024 caracteres y anteponer la información clave.
- **Evitar `git mv` en rutas montadas en NTFS (WSL)**: En rutas `/mnt/`, `git mv` para directorios puede crear permisos rotos (`d?????????`). Usar `mkdir -p` + copiar archivos + `git rm` la ruta antigua en su lugar. Ver la sección de solución de problemas de la [guía del entorno](../../guides/setting-up-your-environment.md).

## Ejemplos

Una habilidad bien estructurada sigue esta lista de verificación de calidad:
1. Un agente puede decidir si usarla solo a partir de la descripción
2. El procedimiento puede seguirse mecánicamente sin ambigüedad
3. Cada paso tiene un resultado verificable
4. Los modos de fallo tienen caminos de recuperación concretos
5. La habilidad puede componerse con habilidades relacionadas

Referencia de tamaño de esta biblioteca:
- Habilidades básicas: ~80-120 líneas (p.ej., `write-vignette`, `configure-git-repository`)
- Habilidades intermedias: ~120-180 líneas (p.ej., `write-testthat-tests`, `manage-renv-dependencies`)
- Habilidades avanzadas: ~180-250 líneas (p.ej., `submit-to-cran`, `setup-gxp-r-project`)
- Habilidades con ejemplos extendidos: SKILL.md ≤500 líneas + `references/EXAMPLES.md` para configuraciones grandes

## Habilidades Relacionadas

- `evolve-skill` - evolucionar y refinar habilidades creadas con este procedimiento
- `create-agent` - procedimiento paralelo para crear definiciones de agentes
- `create-team` - procedimiento paralelo para crear composiciones de equipos
- `write-claude-md` - CLAUDE.md puede referenciar habilidades para flujos de trabajo específicos del proyecto
- `configure-git-repository` - las habilidades deben estar bajo control de versiones
- `commit-changes` - confirmar la nueva habilidad y sus symlinks
- `security-audit-codebase` - revisar las habilidades para detectar secretos o credenciales incluidos accidentalmente
