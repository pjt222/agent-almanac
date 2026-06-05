---
name: create-pull-request
description: >
  Crear y gestionar pull requests usando GitHub CLI. Cubre la preparación
  de ramas, escritura de títulos y descripciones de PR, creación de PRs,
  manejo de retroalimentación de revisión y flujos de trabajo de merge
  y limpieza. Utilizar al proponer cambios desde una rama de funcionalidad
  o corrección para revisión, al fusionar trabajo completado en la rama
  principal, al solicitar revisión de código de colaboradores, o al
  documentar el propósito y alcance de un conjunto de cambios.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, pull-request, code-review, gh-cli, collaboration
  locale: es
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: 2026-03-13
---

# Crear Pull Request

Crear un pull request en GitHub con un título claro, descripción estructurada y configuración adecuada de rama.

## Cuándo Usar

- Al proponer cambios desde una rama de funcionalidad o corrección para revisión
- Al fusionar trabajo completado en la rama principal
- Al solicitar revisión de código de colaboradores
- Al documentar el propósito y alcance de un conjunto de cambios

## Entradas

- **Requerido**: Rama de funcionalidad con cambios confirmados
- **Requerido**: Rama base para fusionar (normalmente `main`)
- **Opcional**: Revisores a solicitar
- **Opcional**: Etiquetas o hito
- **Opcional**: Estado de borrador

## Procedimiento

### Paso 1: Asegurar que la Rama Esté Lista

Verificar que la rama esté actualizada con la rama base y que todos los cambios estén confirmados:

```bash
# Verificar cambios sin confirmar
git status

# Obtener lo último del remoto
git fetch origin

# Rebase sobre el último main (o merge)
git rebase origin/main
```

**Esperado:** La rama está por delante de `origin/main` sin cambios sin confirmar y sin conflictos.

**En caso de fallo:** Si ocurren conflictos durante el rebase, resolverlos (ver la habilidad `resolve-git-conflicts`), luego `git rebase --continue`. Si la rama ha divergido significativamente, considerar `git merge origin/main` en su lugar.

### Paso 2: Revisar Todos los Cambios en la Rama

Examinar la diferencia completa y el historial de commits que se incluirán en el PR:

```bash
# Ver todos los commits en esta rama (que no están en main)
git log origin/main..HEAD --oneline

# Ver la diferencia completa contra main
git diff origin/main...HEAD

# Verificar si la rama rastrea el remoto y está enviada
git status -sb
```

**Esperado:** Todos los commits son relevantes para el PR. La diferencia muestra solo los cambios previstos.

**En caso de fallo:** Si hay commits no relacionados, considerar un rebase interactivo para limpiar el historial antes de crear el PR.

### Paso 3: Enviar la Rama

```bash
# Enviar la rama al remoto (establecer seguimiento upstream)
git push -u origin HEAD
```

**Esperado:** La rama aparece en el remoto de GitHub.

**En caso de fallo:** Si el envío es rechazado, primero hacer pull con `git pull --rebase origin <branch>` y resolver cualquier conflicto.

### Paso 4: Escribir Título y Descripción del PR

Mantener el título por debajo de 70 caracteres. Usar el cuerpo para los detalles:

```bash
gh pr create --title "Add weighted mean calculation" --body "$(cat <<'EOF'
## Summary
- Implement `weighted_mean()` with NA handling and zero-weight filtering
- Add input validation for mismatched vector lengths
- Include unit tests covering edge cases

## Test plan
- [ ] `devtools::test()` passes with no failures
- [ ] Manual verification with example data
- [ ] Edge cases: empty vectors, all-NA weights, zero-length input

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Para PRs en borrador:

```bash
gh pr create --title "WIP: Add authentication" --body "..." --draft
```

**Esperado:** PR creado en GitHub con una URL devuelta. La descripción comunica claramente qué cambió y cómo verificarlo.

**En caso de fallo:** Si `gh` no está autenticado, ejecutar `gh auth login`. Si la rama base es incorrecta, especificarla con `--base main`.

### Paso 5: Manejar la Retroalimentación de Revisión

Responder a comentarios de revisión y enviar actualizaciones:

```bash
# Ver comentarios del PR
gh api repos/{owner}/{repo}/pulls/{number}/comments

# Ver el estado de revisión del PR
gh pr checks

# Después de hacer cambios, confirmar y enviar
git add <files>
git commit -m "$(cat <<'EOF'
fix: address review feedback on input validation

EOF
)"
git push
```

**Esperado:** Los nuevos commits aparecen en el PR. Los comentarios de revisión están atendidos.

**En caso de fallo:** Si las verificaciones de CI fallan después de enviar, leer la salida de verificación con `gh pr checks` y corregir los problemas antes de solicitar nueva revisión.

### Paso 6: Fusionar y Limpiar

Después de la aprobación:

```bash
# Fusionar el PR (squash merge mantiene el historial limpio)
gh pr merge --squash --delete-branch

# O fusionar con todos los commits preservados
gh pr merge --merge --delete-branch

# O rebase merge (historial lineal)
gh pr merge --rebase --delete-branch
```

Después de fusionar, actualizar el main local:

```bash
git checkout main
git pull origin main
```

**Esperado:** El PR está fusionado, la rama remota está eliminada y el main local está actualizado.

**En caso de fallo:** Si la fusión está bloqueada por verificaciones fallidas o aprobaciones faltantes, atender esos problemas primero. No forzar la fusión sin resolver los bloqueos.

## Validación

- [ ] El título del PR es conciso (menos de 70 caracteres) y descriptivo
- [ ] El cuerpo del PR incluye resumen de cambios y plan de pruebas
- [ ] Todos los commits en la rama son relevantes para el PR
- [ ] Las verificaciones de CI pasan
- [ ] La rama está actualizada con la rama base
- [ ] Los revisores están asignados (si lo requiere la configuración del repositorio)
- [ ] No hay datos sensibles en la diferencia

## Errores Comunes

- **PR demasiado grande**: Mantener los PRs enfocados en una sola funcionalidad o corrección. PRs grandes son más difíciles de revisar y más propensos a conflictos de fusión.
- **Plan de pruebas faltante**: Siempre describir cómo se pueden verificar los cambios, incluso para PRs de documentación.
- **Rama desactualizada**: Si la rama base ha avanzado significativamente, hacer rebase antes de crear el PR para minimizar conflictos de fusión.
- **Forzar envío durante revisión**: Evitar force-push a una rama con comentarios de revisión abiertos. Enviar nuevos commits para que los revisores puedan ver los cambios incrementales.
- **No leer la salida de CI**: Verificar `gh pr checks` antes de pedir nueva revisión. CI fallido desperdicia el tiempo de los revisores.
- **Olvidar eliminar la rama**: Usar `--delete-branch` con merge para mantener el remoto limpio.

## Habilidades Relacionadas

- `commit-changes` - crear commits para el PR
- `manage-git-branches` - creación de ramas y convenciones de nomenclatura
- `resolve-git-conflicts` - manejo de conflictos durante rebase/merge
- `create-github-release` - publicar un release después de fusionar
