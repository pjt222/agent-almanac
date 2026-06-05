---
name: commit-changes
description: >
  Preparar, confirmar y enmendar cambios con mensajes de commit convencionales.
  Incluye la revisión de cambios, la preparación selectiva, la escritura de
  mensajes descriptivos usando formato HEREDOC y la verificación del historial
  de commits. Utilizar al guardar una unidad lógica de trabajo en el control
  de versiones, al crear un commit con mensaje convencional, al enmendar el
  commit más reciente, o al revisar cambios preparados antes de confirmar.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, commit, staging, conventional-commits, version-control
  locale: es
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: 2026-03-13
---

# Confirmar Cambios

Preparar archivos de forma selectiva, escribir mensajes de commit claros y verificar el historial de commits.

## Cuándo Usar

- Al guardar una unidad lógica de trabajo en el control de versiones
- Al crear un commit con un mensaje descriptivo y convencional
- Al enmendar el commit más reciente (mensaje o contenido)
- Al revisar qué se va a confirmar antes de hacerlo

## Entradas

- **Requerido**: Uno o más archivos modificados para confirmar
- **Opcional**: Mensaje de commit (se redactará uno si no se proporciona)
- **Opcional**: Si se debe enmendar el commit anterior
- **Opcional**: Atribución de coautor

## Procedimiento

### Paso 1: Revisar los Cambios Actuales

Verificar el estado del árbol de trabajo e inspeccionar las diferencias:

```bash
# Ver qué archivos están modificados, preparados o sin seguimiento
git status

# Ver cambios no preparados
git diff

# Ver cambios preparados
git diff --staged
```

**Esperado:** Visión clara de todos los archivos modificados, preparados y sin seguimiento.

**En caso de fallo:** Si `git status` falla, verificar que se está dentro de un repositorio git (`git rev-parse --is-inside-work-tree`).

### Paso 2: Preparar Archivos de Forma Selectiva

Preparar archivos específicos en lugar de usar `git add .` o `git add -A` para evitar incluir accidentalmente archivos sensibles o cambios no relacionados:

```bash
# Preparar archivos específicos por nombre
git add src/feature.R tests/test-feature.R

# Preparar todos los cambios en un directorio específico
git add src/

# Preparar partes de un archivo de forma interactiva (no soportado en contextos no interactivos)
# git add -p filename
```

Revisar lo preparado antes de confirmar:

```bash
git diff --staged
```

**Esperado:** Solo los archivos y cambios previstos están preparados. Sin `.env`, credenciales ni binarios grandes.

**En caso de fallo:** Quitar archivos añadidos por accidente con `git reset HEAD <file>`. Si se prepararon datos sensibles, quitarlos inmediatamente antes de confirmar.

### Paso 3: Escribir un Mensaje de Commit

Usar el formato de commits convencionales. Siempre pasar el mensaje mediante HEREDOC para un formato correcto:

```bash
git commit -m "$(cat <<'EOF'
feat: add weighted mean calculation

Implements weighted_mean() with support for NA handling and
zero-weight filtering. Includes input validation for mismatched
vector lengths.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

Tipos de commit convencionales:

| Tipo | Cuándo usar |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de error |
| `docs` | Solo documentación |
| `test` | Agregar o actualizar pruebas |
| `refactor` | Cambio de código que no corrige ni agrega |
| `chore` | Build, CI, actualización de dependencias |
| `style` | Formato, espacios en blanco (sin cambio de lógica) |

**Esperado:** Commit creado con un mensaje descriptivo que explica el *por qué*, no solo el *qué*.

**En caso de fallo:** Si un hook de pre-commit falla, corregir el problema, volver a preparar con `git add` y crear un commit **nuevo** (no usar `--amend` ya que el commit fallido nunca se creó).

### Paso 4: Enmendar el Último Commit (Opcional)

Solo enmendar si el commit **no** ha sido enviado a un remoto compartido:

```bash
# Enmendar solo el mensaje
git commit --amend -m "$(cat <<'EOF'
fix: correct weighted mean edge case for empty vectors

EOF
)"

# Enmendar con cambios preparados adicionales
git add forgotten-file.R
git commit --amend --no-edit
```

**Esperado:** El commit anterior se actualiza en el lugar. `git log -1` muestra el contenido enmendado.

**En caso de fallo:** Si el commit ya fue enviado, no enmendar. Crear un nuevo commit en su lugar. Forzar el envío de commits enmendados a ramas compartidas causa divergencia en el historial.

### Paso 5: Verificar el Commit

```bash
# Ver el último commit
git log -1 --stat

# Ver el historial reciente de commits
git log --oneline -5

# Verificar el contenido del commit
git show HEAD
```

**Esperado:** El commit aparece en el historial con el mensaje, autor y cambios de archivos correctos.

**En caso de fallo:** Si el commit contiene archivos incorrectos, usar `git reset --soft HEAD~1` para deshacer el commit manteniendo los cambios preparados, y luego confirmar correctamente.

## Validación

- [ ] Solo los archivos previstos están incluidos en el commit
- [ ] No se confirmaron datos sensibles (tokens, contraseñas, archivos `.env`)
- [ ] El mensaje de commit sigue el formato de commits convencionales
- [ ] El cuerpo del mensaje explica *por qué* se hizo el cambio
- [ ] `git log` muestra el commit con los metadatos correctos
- [ ] Los hooks de pre-commit (si existen) pasaron correctamente

## Errores Comunes

- **Confirmar demasiado a la vez**: Cada commit debe representar un cambio lógico. Separar cambios no relacionados en commits distintos.
- **Usar `git add .` a ciegas**: Siempre revisar `git status` primero. Preferir preparar archivos específicos por nombre.
- **Enmendar commits enviados**: Nunca enmendar commits que ya se enviaron a una rama compartida. Esto reescribe el historial y causa problemas a los colaboradores.
- **Mensajes de commit vagos**: "fix bug" o "update" no dice nada. Describir qué cambió y por qué.
- **Olvidar `--no-edit` al enmendar contenido**: Al agregar archivos olvidados al último commit, usar `--no-edit` para mantener el mensaje existente.
- **Fallo de hook que lleva a `--amend`**: Cuando un hook de pre-commit falla, el commit nunca se creó. Usar `--amend` modificaría el commit *anterior*. Siempre crear un nuevo commit después de corregir problemas con hooks.

## Habilidades Relacionadas

- `manage-git-branches` - flujo de trabajo con ramas antes de confirmar
- `create-pull-request` - siguiente paso después de confirmar
- `resolve-git-conflicts` - manejo de conflictos durante merge/rebase
- `configure-git-repository` - configuración y convenciones del repositorio
