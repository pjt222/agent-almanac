---
name: read-continue-here
description: >
  Read a CONTINUE_HERE.md continuation file at session start and resume
  from where the prior session left off. Covers detecting the file, assessing
  freshness, parsing the structured handoff, confirming the resumption plan
  with the user, and cleaning up after consumption. Optionally configures a
  SessionStart hook and CLAUDE.md instruction for automatic pickup. Use at the
  start of a session when a continuation file exists, when bootstrapping after
  an interrupted session, or when setting up automatic continuation detection.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, read
  locale: es
  source_locale: en
  source_commit: 025eea68
  fence_basis_commit: 9616c3db25dbf24f7586e87fafa15229c28ef8de
  translator: scaffold
  translation_date: "2026-05-03"
---

# Read Continue Here

Leer un archivo de continuación estructurado y reanudar el trabajo desde donde la sesión anterior lo dejó.

## Cuándo Usar

- Iniciando una nueva sesión y CONTINUE_HERE.md existe en la raíz del proyecto
- Después de que un hook SessionStart inyecte contexto de continuación
- Bootstrapping de identidad y detección de artefactos de sesión anterior
- Configurar detección automática de continuación para un proyecto (infraestructura única)

## Entradas

- **Requerido**: Un directorio de proyecto (predeterminado al directorio de trabajo actual)
- **Opcional**: Si configurar la infraestructura (hook SessionStart + instrucción CLAUDE.md)
- **Opcional**: Si eliminar el archivo después del consumo (predeterminado: sí)

## Procedimiento

### Paso 1: Detectar y Leer el Archivo de Continuación

Verificar `CONTINUE_HERE.md` en la raíz del proyecto:

```bash
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || ROOT=$PWD
CONTINUE_FILE=
for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do
  if [ -f "$ROOT/$candidate" ]; then CONTINUE_FILE="$ROOT/$candidate"; break; fi
done
if [ -n "$CONTINUE_FILE" ]; then
  echo "handoff: $CONTINUE_FILE"
else
  ELSEWHERE=$(find "$ROOT" -maxdepth 3 -name 'CONTINUE_HERE.md' \
    -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -5)
  if [ -n "$ELSEWHERE" ]; then
    echo "no handoff at a resolved path, but one exists elsewhere:"
    echo "$ELSEWHERE"
  else
    echo "no handoff"
  fi
fi
```

Si está ausente, salir elegantemente — no hay nada de qué continuar.

Si está presente, leer los contenidos del archivo. Parsear las 5 secciones: Objective, Completed, In Progress, Next Steps, Context. Extraer el timestamp y la rama de la línea de encabezado.

**Esperado:** El archivo se lee y sus secciones se parsean en un modelo mental claro del estado de la sesión anterior.

**En caso de fallo:** Si el archivo existe pero está malformado (secciones faltantes, vacío), tratarlo como una señal parcial — extraer lo que sea esté presente y notar lo que falta al usuario.

### Paso 2: Evaluar la Frescura

Comparar el timestamp del archivo contra el tiempo actual:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

Clasificar la frescura:
- **Fresco** (< 24 horas, misma rama): seguro para actuar directamente
- **Obsoleto** (> 24 horas o rama diferente): marcar al usuario antes de proceder
- **Superseded** (existen nuevos commits después del timestamp del handoff): alguien trabajó en el proyecto desde el handoff

Verificar la alineación de la rama:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

**Esperado:** Una evaluación de frescura con clasificación (fresco, obsoleto o superseded) y evidencia de soporte.

**En caso de fallo:** Si no estás en un repo git, saltar las verificaciones de rama y commit. Confiar solo en el timestamp en el encabezado del archivo.

### Paso 3: Resumir y Confirmar la Reanudación

Presentar el estado de continuación al usuario concisamente:
- "Objetivo de la sesión anterior: [Objective]"
- "Completado: [resumen]"
- "En progreso: [resumen]"
- "Acción siguiente propuesta: [Next Steps item 1]"

Si la frescura es "obsoleta" o "superseded", presentar la evidencia y preguntar si proceder con el handoff o comenzar de nuevo.

Si algún item de Next Steps está etiquetado como `**[USER]**`, surgirlos explícitamente — requieren decisiones del usuario antes de que el trabajo pueda proceder.

**Esperado:** El usuario confirma el plan de reanudación, posiblemente con ajustes. El agente tiene un mandato claro de qué hacer a continuación.

**En caso de fallo:** Si el usuario dice "comenzar de nuevo" o "ignorar ese archivo", reconocer y proceder sin el contexto de continuación. Ofrecer eliminar el archivo para prevenir confusión futura.

### Paso 4: Actuar sobre el Handoff

Comenzar a trabajar desde el item 1 de Next Steps (o donde el usuario haya dirigido):
- Referenciar items de In Progress para entender el estado parcial
- Usar la sección Context para evitar reintentar enfoques fallidos
- Tratar items Completed como hechos — no re-verificar a menos que el usuario lo pida

**Esperado:** El agente está trabajando productivamente en la tarea correcta, informado por el archivo de continuación.

**En caso de fallo:** Si los Next Steps son ambiguos o el estado de In Progress no está claro, preguntar al usuario por aclaración en lugar de adivinar.

### Paso 5: Limpiar

Primero conserva una copia: el próximo `write-continue-here` compara su borrador con esta edición. Una línea `Handoff archive: <dir>` en el CLAUDE.md del proyecto, en el CLAUDE.md de un directorio padre, en el `~/.claude/CLAUDE.md` del usuario o en el README (el más cercano primero) nombra el directorio de archivo; sin ella, un handoff no versionado se conserva a su lado como `CONTINUE_HERE.prev.md`, y uno versionado no necesita copia. Define `ARCHIVE_STATE=consumed`:

```bash
: "${CONTINUE_FILE:?set it to the path of the handoff, as the resolver printed it}"
: "${ARCHIVE_STATE:?set it to consumed when reading, superseded when replacing}"
case "$CONTINUE_FILE" in /*) ;; *) CONTINUE_FILE=$PWD/$CONTINUE_FILE ;; esac
HOME_DIR=${CONTINUE_FILE%/*} ARCHIVED=
ROOT=$(git -C "$HOME_DIR" rev-parse --show-toplevel 2>/dev/null) || ROOT=$HOME_DIR
PROJECT=$(git -C "$HOME_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || PROJECT=$ROOT
PROJECT=${PROJECT%/.git}; PROJECT=${PROJECT##*/} # a linked worktree names its project, not itself
SEARCH=("$ROOT/CLAUDE.md" "$ROOT/.claude/CLAUDE.md") dir=${ROOT%/*} ARCHIVE=
while [ -n "$dir" ]; do SEARCH+=("$dir/CLAUDE.md"); dir=${dir%/*}; done
for f in "${SEARCH[@]}" "$HOME/.claude/CLAUDE.md" "$ROOT/README.md"; do # nearest first, builtins only
  [ -f "$f" ] && while IFS= read -r l || [ -n "$l" ]; do
    l=${l%$'\r'}; case "$l" in "Handoff archive: "*) ARCHIVE=${l#Handoff archive: }; break 2 ;; esac
  done < "$f"
done
case "$ARCHIVE" in '~/'*) ARCHIVE=$HOME/${ARCHIVE#'~/'} ;; ''|/*|'<dir>') ;; *) ARCHIVE=${f%/*}/$ARCHIVE ;; esac
STAMP=$(date -u +%Y-%m-%dT%H%M%SZ) KEEP=cp
[ "$ARCHIVE_STATE" = superseded ] && KEEP=mv
if [ "$ARCHIVE" = '<dir>' ]; then
  echo "REFUSED: $f carries the unedited 'Handoff archive: <dir>'; name a directory there" >&2; false
elif [ -n "$ARCHIVE" ]; then
  DEST=$ARCHIVE/${STAMP%%T*}/$PROJECT-CONTINUE_HERE.$STAMP.$ARCHIVE_STATE.md
  mkdir -p -- "${DEST%/*}" && "$KEEP" -- "$CONTINUE_FILE" "$DEST" && ARCHIVED=$DEST
elif git -C "$HOME_DIR" ls-files --error-unmatch -- "$CONTINUE_FILE" >/dev/null 2>&1; then
  if git -C "$HOME_DIR" diff --quiet HEAD -- "$CONTINUE_FILE"; then ARCHIVED="git history, tracked"
  else echo "REFUSED: $CONTINUE_FILE has uncommitted changes; read them before committing anything" >&2; false; fi
else
  "$KEEP" -- "$CONTINUE_FILE" "$HOME_DIR/CONTINUE_HERE.prev.md" && ARCHIVED=$HOME_DIR/CONTINUE_HERE.prev.md
fi
if [ -n "$ARCHIVED" ]; then echo "archive: $ARCHIVED"
else echo "REFUSED: $CONTINUE_FILE was not archived, so the cleanup will not delete it" >&2; false; fi
```

Después de que el handoff es consumido y el trabajo está en marcha, eliminar CONTINUE_HERE.md:

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
: "${ARCHIVED:?run the archive fence first in this shell call, or set ARCHIVED to the path it printed}"
SCOPE_LINE=$(while IFS= read -r l; do
  case "$l" in "Nobody runs:"*) printf '%s' "$l"; break ;; esac
done < "$CONTINUE_FILE")
if [ -n "$SCOPE_LINE" ]; then
  echo "WARNING: $CONTINUE_FILE carries a peer-session scope declaration the peer will no longer find:" >&2
  echo "  $SCOPE_LINE" >&2
  echo "Copy it where the peer will see it (an issue comment, a message to the peer)." >&2
fi
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  # The pathspec is load-bearing: without it, the commit also takes a peer's staged work.
  git rm -q "$CONTINUE_FILE" &&
    git commit -qm 'chore: consume the session handoff' -- "$CONTINUE_FILE"
else
  rm -- "$CONTINUE_FILE" # untracked, ignored, or no repository: an ordinary delete
fi
```

Los archivos de continuación obsoletos causan confusión en sesiones futuras.

**Esperado:** El archivo es eliminado. La raíz del proyecto está limpia.

**En caso de fallo:** Si el usuario quiere mantener el archivo (p. ej., como referencia durante la sesión), dejarlo pero anotar que debe eliminarse antes del fin de sesión para prevenir que la siguiente sesión lo re-consuma.

### Paso 6: Configurar Hook SessionStart (Opcional)

El hook inyecta el handoff resuelto en cada sesión nueva. El script, su entrada en `settings.json` y cómo comprobar su salida están en [references/session-start-hook.md](references/session-start-hook.md).

**Esperado:** El script del hook existe, es ejecutable y está registrado en settings.json. En el siguiente inicio de sesión, si CONTINUE_HERE.md existe, su contenido es inyectado en el contexto de sesión.

**En caso de fallo:** Verificar que settings.json sea JSON válido después de editar. Probar el hook manualmente: `cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`. El script recurre a `awk` si `jq` no está instalado, así que `jq` es recomendado pero no requerido.

### Paso 7: Añadir Instrucción CLAUDE.md (Opcional)

Añadir una instrucción breve al CLAUDE.md del proyecto para que Claude entienda el propósito del archivo:

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**Esperado:** CLAUDE.md contiene la instrucción. Sesiones futuras leerán y actuarán sobre CONTINUE_HERE.md incluso si el hook SessionStart no está configurado.

**En caso de fallo:** Si CLAUDE.md no existe, crearlo con solo esta sección. Si el archivo es demasiado largo, añadir la instrucción cerca del top donde no será truncada.

## Validación

- [ ] CONTINUE_HERE.md fue detectado (o la ausencia fue manejada elegantemente)
- [ ] La frescura fue evaluada (timestamp, rama, commits posteriores al handoff)
- [ ] El plan de reanudación fue presentado a y confirmado por el usuario
- [ ] El trabajo comenzó desde el item correcto de Next Steps
- [ ] El archivo fue limpiado después del consumo
- [ ] (Opcional) El script del hook SessionStart existe y es ejecutable
- [ ] (Opcional) CLAUDE.md contiene la instrucción de continuidad de sesión

## Errores Comunes

- **Actuar sin confirmar**: Siempre presentar el plan de reanudación al usuario. Pueden haber cambiado de opinión sobre en qué trabajar, incluso si el archivo es fresco.
- **Confiar ciegamente en archivos obsoletos**: Un archivo de continuación más antiguo que 24 horas o de una rama diferente es una sugerencia, no un mandato. Siempre verificar la frescura.
- **Ignorar la sección Context**: La parte más valiosa del archivo a menudo son los enfoques fallidos. Saltar esta sección lleva a reintentar callejones sin salida.
- **Olvidar limpiar**: Dejar CONTINUE_HERE.md después del consumo causa confusión en la siguiente sesión, que intentará actuar sobre él de nuevo.
- **Tratar items Completed como no verificados**: A menos que el usuario lo pida específicamente, no rehacer trabajo completado. Confiar en la evaluación de la sesión anterior.

## Habilidades Relacionadas

- `write-continue-here` — el complemento: escribir el archivo de continuación al fin de sesión
- `bootstrap-agent-identity` — reconstrucción completa de identidad que incluye detección de continuación como una heurística
- `manage-memory` — conocimiento durable cross-sesión (complementa este handoff efímero)
- `write-claude-md` — instrucciones del proyecto donde vive la guía opcional de continuidad
