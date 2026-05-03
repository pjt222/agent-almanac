---
name: write-continue-here
description: >
  Write a CONTINUE_HERE.md file capturing current session state so a fresh
  Claude Code session can pick up where this one left off. Covers assessing
  recent work, structuring the continuation file with objective, completed,
  in-progress, next-steps, and context sections, and verifying the file is
  actionable. Use when ending a session with unfinished work, handing off
  context between sessions, or preserving task state that git alone cannot
  capture.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, write
  locale: es
  source_locale: en
  source_commit: 025eea68
  translator: scaffold
  translation_date: "2026-05-03"
---

# Write Continue Here

Escribir un archivo de continuación estructurado para que la siguiente sesión comience con contexto completo.

## Cuándo Usar

- Terminar una sesión con trabajo aún en progreso
- Entregar una tarea compleja entre sesiones
- Preservar la intención, los enfoques fallidos y los siguientes pasos que git no puede capturar
- Antes de cerrar Claude Code en mitad de una tarea

## Entradas

- **Requerido**: Una sesión activa con trabajo reciente para resumir
- **Opcional**: Instrucciones específicas sobre qué enfatizar en el handoff

## Procedimiento

### Paso 1: Evaluar el Estado de la Sesión

Reunir hechos sobre el trabajo reciente:

```bash
git log --oneline -5
git status
git diff --stat
```

Revisar el contexto de la conversación: cuál era el objetivo, qué se completó, qué está parcialmente hecho, qué se intentó y falló, qué decisiones se tomaron.

**Esperado:** Comprensión clara del estado actual de la tarea — items completados, items en progreso y siguientes pasos planeados.

**En caso de fallo:** Si no estás en un repositorio git, saltar comandos git. El archivo de continuación aún puede capturar contexto conversacional y estado de tarea.

### Paso 2: Escribir CONTINUE_HERE.md

Escribir el archivo a la raíz del proyecto usando la estructura abajo. Cada sección debe contener contenido accionable, no placeholders.

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
- **Objective**: Capturar el PORQUÉ — git log muestra qué cambió, no por qué
- **Completed**: Marcar items claramente hechos para prevenir re-trabajo
- **In Progress**: Esta es la sección de mayor valor — el estado parcial es lo más difícil de reconstruir
- **Next Steps**: Numerar por prioridad. Prefijar items dependientes del usuario con `**[USER]**`
- **Context**: Registrar el espacio negativo — qué se intentó y se rechazó, y por qué

**Esperado:** Un archivo CONTINUE_HERE.md en la raíz del proyecto con las 5 secciones pobladas con contenido real de la sesión actual. El timestamp y la rama son precisos.

**En caso de fallo:** Si Write falla, verificar permisos de archivo. El archivo debe crearse en la raíz del proyecto (mismo directorio que `.git/`). Verificar que `.gitignore` contenga `CONTINUE_HERE.md` — si no, añadirlo.

### Paso 3: Verificar el Archivo

Releer CONTINUE_HERE.md y confirmar:
- El timestamp es actual (dentro de los últimos minutos)
- El nombre de la rama coincide con `git branch --show-current`
- Las 5 secciones contienen contenido real (sin placeholders de plantilla)
- Next Steps están numerados y son accionables
- Items de In Progress describen el estado actual con suficiente especificidad para reanudar

**Esperado:** El archivo se lee como un handoff claro y accionable que una sesión fresca podría usar para reanudar el trabajo inmediatamente.

**En caso de fallo:** Editar secciones que contienen texto placeholder o son demasiado vagas. Cada sección debe pasar la prueba: "¿Podría una sesión fresca actuar sobre esto sin hacer preguntas aclaratorias?"

## Validación

- [ ] CONTINUE_HERE.md existe en la raíz del proyecto
- [ ] El archivo contiene las 5 secciones con contenido real (no placeholders)
- [ ] Timestamp y rama son precisos
- [ ] `.gitignore` incluye `CONTINUE_HERE.md`
- [ ] Next Steps están numerados y son accionables
- [ ] Items de In Progress especifican suficiente detalle para reanudar sin preguntas

## Errores Comunes

- **Escribir placeholders en lugar de contenido**: "TODO: rellenar después" derrota el propósito. Cada sección debe contener información real de la sesión actual.
- **Duplicar el estado de git**: No listar cada archivo cambiado — git ya rastrea eso. Enfocarse en intención, estado parcial y siguientes pasos.
- **Olvidar la sección Context**: Los enfoques fallidos son la cosa más valiosa de registrar. Sin ellos, la siguiente sesión reintentará los mismos callejones sin salida.
- **Sobrescribir sin leer**: Si CONTINUE_HERE.md ya existe de una sesión anterior, leerlo primero — puede contener trabajo no terminado de un handoff anterior.
- **Dejar archivos obsoletos**: CONTINUE_HERE.md es efímero. Después de que la siguiente sesión lo consuma, eliminarlo. Los archivos obsoletos causan confusión.

## Habilidades Relacionadas

- `read-continue-here` — el complemento: leer y actuar sobre el archivo de continuación al inicio de la sesión
- `bootstrap-agent-identity` — reconstrucción de identidad cold-start que consume el archivo de continuación que esta habilidad produce
- `manage-memory` — conocimiento durable cross-sesión (complementa este handoff efímero)
- `commit-changes` — guardar el trabajo a git antes de escribir el archivo de continuación
- `write-claude-md` — instrucciones del proyecto donde vive la guía opcional de continuidad
