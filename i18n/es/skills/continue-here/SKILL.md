---
name: continue-here
description: >
  Escribe un archivo CONTINUE_HERE.md capturando el estado de la sesión actual
  para que una sesión de Claude Code nueva pueda retomar donde esta se quedó.
  Cubre la evaluación del trabajo reciente, la estructuración del archivo de
  continuación, y la configuración opcional de un hook SessionStart para la
  retoma automática. Usar al finalizar una sesión con trabajo incompleto, al
  transferir contexto entre sesiones, o al preservar el estado de una tarea
  que git solo no puede capturar.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Continuar Aquí

Escribir un archivo de continuación estructurado para que la próxima sesión comience con contexto completo.

## Cuándo Usar

- Al finalizar una sesión con trabajo todavía en progreso
- Al transferir una tarea compleja entre sesiones
- Al preservar la intención, enfoques fallidos y próximos pasos que git no puede capturar
- Antes de cerrar Claude Code cuando se está a mitad de una tarea

## Entradas

- **Requerido**: Una sesión activa con trabajo reciente para resumir
- **Opcional**: Instrucciones específicas sobre qué enfatizar en la transferencia

## Procedimiento

### Paso 1: Evaluar el Estado de la Sesión

Recopilar hechos sobre el trabajo reciente:

```bash
git log --oneline -5
git status
git diff --stat
```

Revisar el contexto de la conversación: cuál era el objetivo, qué se completó, qué está parcialmente hecho, qué se intentó y falló, qué decisiones se tomaron.

**Esperado:** Comprensión clara del estado actual de la tarea — elementos completados, elementos en progreso y próximos pasos planificados.

**En caso de fallo:** Si no se está en un repositorio git, omitir los comandos de git. El archivo de continuación puede igualmente capturar el contexto conversacional y el estado de la tarea.

### Paso 2: Escribir CONTINUE_HERE.md

Escribir el archivo en la raíz del proyecto usando la estructura siguiente. Cada sección debe contener contenido accionable, no marcadores de posición.

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: current-branch-name

## Objective
One-paragraph description of what we are trying to accomplish and why.

## Completed
- [x] Finished item with key file paths (e.g., `src/feature.R`)
- [x] Decisions made and their rationale

## In Progress
- [ ] Partially complete work — describe current state (branch, file:line)
- [ ] Known issues with partial work

## Next Steps
1. Immediate next action (most important)
2. Subsequent actions in priority order
3. **[USER]** Items needing user input or decision

## Context
- Failed approaches and why they did not work
- Key constraints or trade-offs discovered
- Relevant issue/PR links
```

Pautas:
- **Objective**: Capturar el POR QUÉ — git log muestra qué cambió, no por qué
- **Completed**: Marcar claramente los elementos terminados para prevenir retrabajos
- **In Progress**: Esta es la sección de mayor valor — el estado parcial es el más difícil de reconstruir
- **Next Steps**: Numerar por prioridad. Prefijar los elementos dependientes del usuario con `**[USER]**`
- **Context**: Registrar el espacio negativo — qué se intentó y rechazó, y por qué

**Esperado:** Un archivo CONTINUE_HERE.md en la raíz del proyecto con las 5 secciones completadas con contenido real de la sesión actual. La marca de tiempo y la rama son precisas.

**En caso de fallo:** Si Write falla, verificar los permisos de archivo. El archivo debe crearse en la raíz del proyecto (mismo directorio que `.git/`). Verificar que `.gitignore` contiene `CONTINUE_HERE.md` — si no, añadirlo.

### Paso 3: Verificar el Archivo

Leer de vuelta CONTINUE_HERE.md y confirmar:
- La marca de tiempo es actual (dentro de los últimos minutos)
- El nombre de la rama coincide con `git branch --show-current`
- Las 5 secciones contienen contenido real (sin marcadores de posición de plantilla)
- Los próximos pasos están numerados y son accionables
- Los elementos En Progreso describen el estado actual con suficiente especificidad para retomar

**Esperado:** El archivo se lee como una transferencia clara y accionable que una sesión nueva podría usar para retomar el trabajo inmediatamente.

**En caso de fallo:** Editar las secciones que contienen texto de marcador de posición o son demasiado vagas. Cada sección debe pasar la prueba: "¿Podría una sesión nueva actuar sobre esto sin hacer preguntas de aclaración?"

### Paso 4: Configurar el Hook SessionStart (Opcional)

Si no está ya configurado, establecer la lectura automática de CONTINUE_HERE.md al inicio de la sesión.

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

**Esperado:** El script del hook existe, es ejecutable y está registrado en settings.json. Al próximo inicio de sesión, si existe CONTINUE_HERE.md, su contenido se inyecta en el contexto de la sesión.

**En caso de fallo:** Verificar que settings.json es JSON válido después de editar. Probar el hook manualmente: `cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`. El script recurre a `awk` si `jq` no está instalado, por lo que `jq` es recomendado pero no requerido.

### Paso 5: Añadir Instrucción en CLAUDE.md (Opcional)

Añadir una breve instrucción al CLAUDE.md del proyecto para que Claude comprenda el propósito del archivo:

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**Esperado:** CLAUDE.md contiene la instrucción. Las sesiones futuras leerán y actuarán sobre CONTINUE_HERE.md incluso si el hook SessionStart no está configurado.

**En caso de fallo:** Si CLAUDE.md no existe, crearlo con solo esta sección. Si el archivo es demasiado largo, añadir la instrucción cerca de la parte superior donde no será truncada.

## Validación

- [ ] CONTINUE_HERE.md existe en la raíz del proyecto
- [ ] El archivo contiene las 5 secciones con contenido real (sin marcadores de posición)
- [ ] La marca de tiempo y la rama son precisas
- [ ] `.gitignore` incluye `CONTINUE_HERE.md`
- [ ] Los próximos pasos están numerados y son accionables
- [ ] Los elementos En Progreso especifican suficiente detalle para retomar sin preguntas
- [ ] (Opcional) El script del hook SessionStart existe y es ejecutable
- [ ] (Opcional) CLAUDE.md contiene la instrucción de continuidad de sesión

## Errores Comunes

- **Escribir marcadores de posición en lugar de contenido**: "TODO: completar más tarde" derrota el propósito. Cada sección debe contener información real de la sesión actual.
- **Duplicar el estado de git**: No listar cada archivo cambiado — git ya rastrea eso. Concentrarse en la intención, el estado parcial y los próximos pasos.
- **Olvidar la sección Context**: Los enfoques fallidos son lo más valioso que registrar. Sin ellos, la próxima sesión volverá a intentar los mismos callejones sin salida.
- **Sobrescribir sin leer**: Si ya existe CONTINUE_HERE.md de una sesión anterior, leerlo primero — puede contener trabajo incompleto de una transferencia anterior.
- **Dejar archivos obsoletos**: CONTINUE_HERE.md es efímero. Después de que la próxima sesión lo consuma, eliminarlo. Los archivos obsoletos causan confusión.

## Habilidades Relacionadas

- `bootstrap-agent-identity` — reconstrucción de identidad en arranque en frío que consume el archivo de continuación que esta habilidad produce
- `manage-memory` — conocimiento duradero entre sesiones (complementa esta transferencia efímera)
- `commit-changes` — guardar el trabajo en git antes de escribir el archivo de continuación
- `write-claude-md` — instrucciones del proyecto donde vive la orientación opcional de continuidad
