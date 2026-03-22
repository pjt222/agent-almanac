---
name: manage-memory
description: >
  Organiza, extrae, poda y verifica los archivos de memoria persistente de
  Claude Code. Cubre MEMORY.md como índice conciso, extracción de temas a
  archivos dedicados, detección de obsolescencia, verificación de precisión
  frente al estado del proyecto, y la restricción de truncamiento a 200 líneas.
  Usar cuando MEMORY.md se acerca al límite de 200 líneas, tras una sesión que
  produce perspectivas duraderas que vale la pena preservar, cuando una sección
  de tema ha crecido más allá de 10-15 líneas y debe extraerse, o cuando el
  estado del proyecto ha cambiado y las entradas de memoria pueden estar
  desactualizadas.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: memory, claude-code, organization, maintenance, auto-memory
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Gestionar la Memoria

Mantiene el directorio de memoria persistente de Claude Code para que permanezca preciso, conciso y útil entre sesiones. MEMORY.md se carga en el prompt del sistema en cada conversación — las líneas después de 200 se truncan, por lo que este archivo debe ser un índice conciso que apunte a archivos de tema para los detalles.

## Cuándo Usar

- MEMORY.md se acerca al umbral de truncamiento de 200 líneas
- Una sesión produjo perspectivas duraderas que vale la pena preservar (nuevos patrones, decisiones de arquitectura, soluciones de depuración)
- Una sección de tema en MEMORY.md ha crecido más allá de 10-15 líneas y debe extraerse
- El estado del proyecto ha cambiado (archivos renombrados, nuevos dominios, conteos actualizados) y las entradas de memoria pueden estar desactualizadas
- Se inicia un nuevo área de trabajo y se verifica si ya existe memoria relevante
- Mantenimiento periódico entre sesiones para mantener el directorio de memoria saludable

## Entradas

- **Requerido**: Acceso al directorio de memoria (típicamente `~/.claude/projects/<project-path>/memory/`)
- **Opcional**: Disparador específico (p.ej., "MEMORY.md es demasiado largo," "acabo de terminar una refactorización importante")
- **Opcional**: Tema a añadir, actualizar o extraer

## Procedimiento

### Paso 1: Evaluar el Estado Actual

Leer MEMORY.md y listar todos los archivos en el directorio de memoria:

```bash
wc -l <memory-dir>/MEMORY.md
ls -la <memory-dir>/
```

Verificar el recuento de líneas frente al límite de 200 líneas. Hacer un inventario de los archivos de tema existentes.

**Esperado:** Imagen clara del total de líneas, número de archivos de tema y qué secciones existen en MEMORY.md.

**En caso de fallo:** Si el directorio de memoria no existe, crearlo. Si MEMORY.md no existe, crear uno mínimo con un encabezado `# Project Memory` y una sección `## Topic Files`.

### Paso 2: Identificar Entradas Obsoletas

Comparar las afirmaciones de la memoria frente al estado actual del proyecto. Patrones comunes de obsolescencia:

1. **Desviación de conteos**: Recuentos de archivos, habilidades, dominios que cambiaron tras adiciones/eliminaciones
2. **Rutas renombradas**: Archivos o directorios que fueron movidos o renombrados
3. **Patrones superados**: Soluciones alternativas que ya no son necesarias tras correcciones
4. **Contradicciones**: Dos entradas que dicen cosas diferentes sobre el mismo tema

Usar Grep para verificar afirmaciones clave:

```bash
# Ejemplo: verificar una afirmación de recuento de habilidades
grep -c "^      - id:" skills/_registry.yml
# Ejemplo: verificar que un archivo aún existe
ls path/claimed/in/memory.md
```

**Esperado:** Una lista de entradas que están obsoletas, con los valores actuales correctos.

**En caso de fallo:** Si no puedes verificar una afirmación (p.ej., hace referencia a un estado externo que no puedes comprobar), déjala pero añade una nota `(unverified)` en lugar de preservar silenciosamente información potencialmente incorrecta.

### Paso 3: Decidir Qué Añadir

Para nuevas entradas, aplicar estos filtros antes de escribir:

1. **Durabilidad**: ¿Será esto verdad en la próxima sesión? Evitar contexto específico de la sesión (tarea actual, trabajo en progreso, estado temporal).
2. **No duplicación**: ¿CLAUDE.md o la documentación del proyecto ya cubre esto? No duplicar — la memoria es para cosas NO capturadas en otro lugar.
3. **Verificado**: ¿Se ha confirmado esto en múltiples interacciones, o es una observación única? Para observaciones únicas, verificar contra los documentos del proyecto antes de escribir.
4. **Accionable**: ¿Saber esto cambia el comportamiento? "El cielo es azul" no es útil. "El código de salida 5 significa error de comillas — usar archivos temporales" cambia la forma de trabajar.

Excepción: Si el usuario pide explícitamente recordar algo, guardarlo inmediatamente — no es necesario esperar múltiples confirmaciones.

**Esperado:** Una lista filtrada de entradas que vale la pena añadir, cumpliendo cada una con los criterios de durabilidad + no duplicación + verificación + accionabilidad.

**En caso de fallo:** Si no estás seguro de si vale la pena mantener una entrada, errar hacia mantenerla brevemente en MEMORY.md — es más fácil podarla después que redescubrirla.

### Paso 4: Extraer Temas Sobredimensionados

Cuando una sección en MEMORY.md supera ~10-15 líneas, extraerla a un archivo de tema dedicado:

1. Crear `<memory-dir>/<topic-name>.md` con un encabezado descriptivo
2. Mover el contenido detallado de MEMORY.md al archivo de tema
3. Reemplazar la sección en MEMORY.md con un resumen de 1-2 líneas y un enlace:

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Breve descripción del contenido
```

Convenciones de nomenclatura para archivos de tema:
- Usar kebab-case en minúsculas: `viz-architecture.md`, no `VizArchitecture.md`
- Nombrar por tema, no por cronología: `patterns.md`, no `session-2024-12.md`
- Agrupar elementos relacionados: combinar "depuración R" y "peculiaridades WSL" en `patterns.md` en lugar de crear un archivo por hecho

**Esperado:** MEMORY.md se mantiene por debajo de 200 líneas. Cada archivo de tema es autónomo y legible sin el contexto de MEMORY.md.

**En caso de fallo:** Si un archivo de tema tendría menos de 5 líneas, probablemente no vale la pena extraerlo — déjalo en línea en MEMORY.md.

### Paso 5: Actualizar MEMORY.md

Aplicar todos los cambios: eliminar entradas obsoletas, añadir nuevas entradas, actualizar conteos, y asegurarse de que la sección Topic Files lista todos los archivos dedicados.

La estructura de MEMORY.md debe seguir este patrón:

```markdown
# Project Memory

## Sección 1 — Contexto de alto nivel
- Puntos clave, concisos

## Sección 2 — Otro tema
- Solo hechos clave

## Topic Files
- [file.md](file.md) — Qué cubre
```

Directrices:
- Mantener cada punto a 1-2 líneas como máximo
- Usar formato en línea (`código`, **negrita**) para facilitar el escaneo
- Poner el contexto más frecuentemente necesario primero
- La sección Topic Files siempre debe ser la última

**Esperado:** MEMORY.md está por debajo de 200 líneas, es preciso y tiene enlaces funcionales a todos los archivos de tema.

**En caso de fallo:** Si no puedes bajar de 200 líneas tras la extracción, identifica la sección menos utilizada y extráela. Cada sección es candidata — incluso el resumen de la estructura del proyecto puede ir a un archivo de tema si es necesario, dejando solo un resumen de 1 línea.

### Paso 6: Verificar la Integridad

Ejecutar una verificación final:

1. **Recuento de líneas**: Confirmar que MEMORY.md está por debajo de 200 líneas
2. **Enlaces**: Verificar que existe cada archivo de tema referenciado en MEMORY.md
3. **Huérfanos**: Comprobar archivos de tema no referenciados en MEMORY.md
4. **Precisión**: Verificar puntualmente 2-3 afirmaciones factuales frente al estado del proyecto

```bash
wc -l <memory-dir>/MEMORY.md
# Comprobar enlaces rotos
for f in $(grep -oP '\[.*?\]\(\K[^)]+' <memory-dir>/MEMORY.md); do
  ls <memory-dir>/$f 2>/dev/null || echo "BROKEN: $f"
done
# Comprobar archivos huérfanos
ls <memory-dir>/*.md | grep -v MEMORY.md
```

**Esperado:** Recuento de líneas por debajo de 200, sin enlaces rotos, sin archivos huérfanos, las afirmaciones verificadas puntualmente son precisas.

**En caso de fallo:** Corregir los enlaces rotos (actualizar o eliminar). Para archivos huérfanos, o bien añadir una referencia en MEMORY.md o eliminarlos si ya no son relevantes.

## Validación

- [ ] MEMORY.md está por debajo de 200 líneas
- [ ] Todos los archivos de tema referenciados en MEMORY.md existen en disco
- [ ] No hay archivos `.md` huérfanos en el directorio de memoria (cada archivo está enlazado desde MEMORY.md)
- [ ] No hay conteos obsoletos ni rutas renombradas en ningún archivo de memoria
- [ ] Las nuevas entradas cumplen los criterios de durabilidad/no duplicación/verificado/accionable
- [ ] Los archivos de tema tienen encabezados descriptivos y son autónomos
- [ ] MEMORY.md se lee como una referencia rápida útil, no como un registro de cambios

## Errores Comunes

- **Contaminación de archivos de memoria**: Escribir cada observación de sesión en la memoria. La mayoría de los hallazgos son específicos de la sesión y no necesitan persistir. Aplicar los cuatro filtros (Paso 3) antes de escribir.
- **Conteos obsoletos**: Actualizar el código pero no la memoria. Los conteos (habilidades, agentes, dominios, archivos) se desvían silenciosamente. Siempre verificar los conteos frente a la fuente de verdad antes de confiar en la memoria.
- **Organización cronológica**: Organizar por "cuándo lo aprendí" en lugar de "de qué trata". La organización basada en temas (`patterns.md`, `viz-architecture.md`) es mucho más útil para la recuperación que los archivos basados en fechas.
- **Duplicar CLAUDE.md**: CLAUDE.md es el archivo de instrucciones autoritativo del proyecto. La memoria debe capturar cosas que NO están en CLAUDE.md — perspectivas de depuración, decisiones de arquitectura, preferencias de flujo de trabajo, patrones entre proyectos.
- **Sobre-extracción**: Crear un archivo de tema para cada sección de 3 líneas. Solo extraer cuando una sección supera ~10-15 líneas. Las secciones pequeñas funcionan bien en línea.
- **Olvidar el límite de 200 líneas**: MEMORY.md se carga en cada prompt del sistema. Las líneas después de 200 se truncan silenciosamente. Si el archivo crece más allá de esto, el contenido del final es efectivamente invisible.

## Habilidades Relacionadas

- `write-claude-md` — CLAUDE.md captura las instrucciones del proyecto; la memoria captura el aprendizaje entre sesiones
- `prune-agent-memory` — el inverso de manage-memory: auditar, clasificar y olvidar selectivamente memorias almacenadas
- `write-continue-here` — escribir un archivo de continuación estructurado para el traspaso entre sesiones; complementa la memoria como puente de contexto a corto plazo
- `read-continue-here` — leer y actuar sobre el archivo de continuación al inicio de sesión; el lado consumidor del traspaso
- `create-skill` — las nuevas habilidades pueden producir patrones dignos de memoria
- `heal` — la auto-curación puede actualizar la memoria como parte del paso de integración
- `meditate` — las sesiones de meditación pueden revelar perspectivas que vale la pena persistir
