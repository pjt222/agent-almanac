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
ls -la CONTINUE_HERE.md 2>/dev/null
```

Si está ausente, salir elegantemente — no hay nada de qué continuar.

Si está presente, leer los contenidos del archivo. Parsear las 5 secciones: Objective, Completed, In Progress, Next Steps, Context. Extraer el timestamp y la rama de la línea de encabezado.

**Esperado:** El archivo se lee y sus secciones se parsean en un modelo mental claro del estado de la sesión anterior.

**En caso de fallo:** Si el archivo existe pero está malformado (secciones faltantes, vacío), tratarlo como una señal parcial — extraer lo que sea esté presente y notar lo que falta al usuario.

### Paso 2: Evaluar la Frescura

Comparar el timestamp del archivo contra el tiempo actual:

```bash
# File modification time
stat -c '%Y' CONTINUE_HERE.md 2>/dev/null || stat -f '%m' CONTINUE_HERE.md
# Current time
date +%s
```

Clasificar la frescura:
- **Fresco** (< 24 horas, misma rama): seguro para actuar directamente
- **Obsoleto** (> 24 horas o rama diferente): marcar al usuario antes de proceder
- **Superseded** (existen nuevos commits después del timestamp del handoff): alguien trabajó en el proyecto desde el handoff

Verificar la alineación de la rama:

```bash
git branch --show-current
git log --oneline --since="$(stat -c '%Y' CONTINUE_HERE.md | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
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

Después de que el handoff es consumido y el trabajo está en marcha, eliminar CONTINUE_HERE.md:

```bash
rm CONTINUE_HERE.md
```

Los archivos de continuación obsoletos causan confusión en sesiones futuras.

**Esperado:** El archivo es eliminado. La raíz del proyecto está limpia.

**En caso de fallo:** Si el usuario quiere mantener el archivo (p. ej., como referencia durante la sesión), dejarlo pero anotar que debe eliminarse antes del fin de sesión para prevenir que la siguiente sesión lo re-consuma.

### Paso 6: Configurar Hook SessionStart (Opcional)

Si no está ya configurado, configurar la lectura automática de CONTINUE_HERE.md al inicio de sesión.

Crear el script del hook:

```bash
mkdir -p ~/.claude/hooks/continue-here

cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'
#!/bin/bash
# SessionStart hook: inject CONTINUE_HERE.md into session context
# OS-aware: works on native Linux, WSL, macOS, and Windows (Git Bash/MSYS)
set -uo pipefail

# --- Platform detection ---
detect_platform() {
  case "$(uname -s)" in
    Darwin) echo "mac" ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}
PLATFORM=${PLATFORM:-$(detect_platform)}

CONTINUE_FILE="$PWD/CONTINUE_HERE.md"

if [ ! -f "$CONTINUE_FILE" ]; then
  exit 0
fi

# Strip CRLF (files on NTFS often have Windows line endings)
CONTENT=$(sed 's/\r$//' "$CONTINUE_FILE")

# JSON-escape: prefer jq, fall back to portable awk
if command -v jq >/dev/null 2>&1; then
  ESCAPED=$(printf '%s' "$CONTENT" | jq -Rsa .)
else
  ESCAPED=$(printf '%s' "$CONTENT" | awk '
    BEGIN { ORS=""; print "\"" }
    {
      gsub(/\\/, "\\\\")
      gsub(/"/, "\\\"")
      gsub(/\t/, "\\t")
      if (NR > 1) print "\\n"
      print
    }
    END { print "\"" }
  ')
fi

cat << EOF
{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":$ESCAPED}}}
EOF
SCRIPT

chmod +x ~/.claude/hooks/continue-here/read-continuation.sh
```

Añadir a `~/.claude/settings.json` en el array de hooks SessionStart:

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

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
