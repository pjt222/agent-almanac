---
name: create-github-issues
description: >
  Creación estructurada de issues en GitHub a partir de hallazgos de revisión
  o desgloses de tareas. Agrupa hallazgos relacionados en issues lógicos, aplica
  etiquetas y produce issues con plantillas estándar que incluyen resumen,
  hallazgos y criterios de aceptación. Diseñado para consumir la salida de
  review-codebase u habilidades de revisión similares.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, github, project-management, issues, review, automation
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# Crear Issues en GitHub

Creación estructurada de issues en GitHub a partir de hallazgos de revisión o desgloses de tareas. Convierte una lista de hallazgos (de `review-codebase`, `security-audit-codebase`, o análisis manual) en issues de GitHub bien formados con etiquetas, criterios de aceptación y referencias cruzadas.

## Cuándo Usar

- Después de una revisión de código que produce una tabla de hallazgos que necesita seguimiento
- Después de una sesión de planificación que identifica elementos de trabajo que deben convertirse en issues
- Al convertir una lista de TODO o un backlog en issues rastreables de GitHub
- Al crear en lote issues relacionados que requieren formato y etiquetado consistente

## Entradas

- **Requerido**: `findings` — una lista de elementos, cada uno con al menos un título y descripción. Idealmente también incluye: gravedad, archivos afectados y etiquetas sugeridas
- **Opcional**:
  - `group_by` — cómo agrupar los hallazgos en issues: `severity`, `file`, `theme` (por defecto: `theme`)
  - `label_prefix` — prefijo para etiquetas creadas automáticamente (por defecto: ninguno)
  - `create_labels` — si se crean etiquetas faltantes (por defecto: `true`)
  - `dry_run` — previsualizar issues sin crearlos (por defecto: `false`)

## Procedimiento

### Paso 1: Preparar Etiquetas

Asegúrate de que todas las etiquetas necesarias existan en el repositorio.

1. Lista las etiquetas existentes: `gh label list --limit 100`
2. Identifica las etiquetas necesarias por los hallazgos (según gravedad, fase o campos de etiqueta explícitos)
3. Mapea las gravedades a etiquetas si aún no están mapeadas: `critical`, `high-priority`, `medium-priority`, `low-priority`
4. Mapea fases/temas a etiquetas: `security`, `architecture`, `code-quality`, `accessibility`, `testing`, `performance`
5. Si `create_labels` es true, crea las etiquetas faltantes: `gh label create "name" --color "hex" --description "desc"`
6. Usa colores consistentes: rojo para crítico/seguridad, naranja para alto, amarillo para medio, azul para arquitectura, verde para pruebas

**Esperado:** Todas las etiquetas referenciadas por los hallazgos existen en el repositorio. No se crean etiquetas duplicadas.

**En caso de fallo:** Si el CLI `gh` no está autenticado, indica al usuario que ejecute `gh auth login`. Si la creación de etiquetas es denegada (permisos insuficientes), procede sin crearlas y anota cuáles faltan.

### Paso 2: Agrupar Hallazgos

Agrupa los hallazgos relacionados en issues lógicos para evitar la proliferación de issues.

1. Si `group_by` es `theme`: agrupa los hallazgos por fase o categoría (todos los hallazgos de seguridad → 1-2 issues, todos los de accesibilidad → 1 issue)
2. Si `group_by` es `severity`: agrupa los hallazgos por nivel de gravedad (todos los CRITICAL → 1 issue, todos los HIGH → 1 issue)
3. Si `group_by` es `file`: agrupa los hallazgos por archivo afectado principal
4. Dentro de cada grupo, ordena los hallazgos por gravedad (CRITICAL primero)
5. Si un grupo tiene más de 8 hallazgos, divídelo en subgrupos por subtema
6. Cada grupo se convierte en un issue de GitHub

**Esperado:** Un conjunto de grupos de issues, cada uno conteniendo 1-8 hallazgos relacionados. El número total de issues debe ser manejable (típicamente 5-15 para una revisión completa del código).

**En caso de fallo:** Si los hallazgos no tienen metadatos de agrupación, recurre a un issue por hallazgo. Esto es aceptable para conjuntos pequeños de hallazgos (< 10) pero produce demasiados issues para conjuntos más grandes.

### Paso 3: Redactar Issues

Construye cada issue usando una plantilla estándar.

1. **Título**: `[Severity] Theme: Brief description` — por ejemplo, `[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. Estructura del **cuerpo**:
   ```
   ## Summary
   One-paragraph overview of what this issue addresses and why it matters.

   ## Findings
   1. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation
   2. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation

   ## Acceptance Criteria
   - [ ] Criterion derived from finding 1
   - [ ] Criterion derived from finding 2
   - [ ] All changes pass existing tests

   ## Context
   Generated from codebase review on YYYY-MM-DD.
   Related: #issue_numbers (if applicable)
   ```
3. Aplica etiquetas: etiqueta de gravedad + etiqueta de tema + etiquetas personalizadas adicionales
4. Si los hallazgos hacen referencia a archivos específicos, mencionarlos en el cuerpo (no como asignados)

**Esperado:** Cada issue tiene un título claro, hallazgos numerados con insignias de gravedad, criterios de aceptación en casillas de verificación y etiquetas apropiadas.

**En caso de fallo:** Si el cuerpo supera el límite de tamaño de issue de GitHub (65536 caracteres), divide el issue en partes y haz referencias cruzadas entre ellas.

### Paso 4: Crear Issues

Crea los issues usando el CLI `gh` e informa de los resultados.

1. Si `dry_run` es true, imprime el título y cuerpo de cada issue sin crearlo y detente
2. Para cada issue redactado, créalo:
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. Registra la URL de cada issue creado
4. Después de crear todos los issues, imprime una tabla resumen: `#número | Título | Etiquetas | Cantidad de hallazgos`
5. Si los issues deben estar secuenciados, añade referencias cruzadas: edita el primer issue para mencionar "Blocked by #X" o "See also #Y"

**Esperado:** Todos los issues creados con éxito. Se imprime una tabla resumen con los números de issue y URLs.

**En caso de fallo:** Si un issue individual falla al crearse, registra el error y continúa con los issues restantes. Informa de los fallos al final. Fallos comunes: autenticación expirada, etiqueta no encontrada (si `create_labels` era false), tiempo de espera de red agotado.

## Validación

- [ ] Todos los hallazgos están representados en al menos un issue
- [ ] Cada issue tiene al menos una etiqueta
- [ ] Cada issue tiene criterios de aceptación con casillas de verificación
- [ ] No se crearon issues duplicados (comprueba los títulos contra los issues abiertos existentes)
- [ ] El número de issues es razonable para la cantidad de hallazgos (no 1:1 para conjuntos grandes)
- [ ] Se imprimió la tabla resumen con todas las URLs de los issues

## Errores Comunes

- **Proliferación de issues**: Crear un issue por hallazgo produce más de 20 issues difíciles de gestionar. Agrupa de forma agresiva — 5-10 issues de una revisión completa es lo ideal
- **Criterios de aceptación faltantes**: Los issues sin casillas de verificación no pueden verificarse como completos. Cada hallazgo debe corresponder al menos a una casilla
- **Caos de etiquetas**: Crear demasiadas etiquetas hace inútil el filtrado. Cíñete a gravedad + tema, no etiquetas por hallazgo individual
- **Referencias desactualizadas**: Al crear issues a partir de una revisión antigua, verifica que los hallazgos aún aplican antes de crear los issues. El código puede haber cambiado
- **Olvidar el modo de prueba**: Para conjuntos grandes de hallazgos, previsualiza siempre con `dry_run: true` primero. Es mucho más fácil editar un plan que cerrar 15 issues incorrectos

## Habilidades Relacionadas

- `review-codebase` — produce la tabla de hallazgos que esta habilidad consume
- `review-pull-request` — produce hallazgos con alcance de PR que también pueden convertirse en issues
- `manage-backlog` — organiza los issues en sprints y prioridades tras la creación
- `create-pull-request` — crea PRs que referencian y cierran los issues
- `commit-changes` — hace commit de las correcciones que resuelven los issues
