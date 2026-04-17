---
name: evolve-skill
description: >
  Evoluciona una habilidad existente refinando su contenido en el lugar o
  creando una variante avanzada. Cubre la evaluación de la habilidad actual,
  la recopilación de requisitos de evolución, la elección del alcance
  (refinamiento vs. variante), la aplicación de cambios, la actualización de
  metadatos de versión y la sincronización del registro y las referencias
  cruzadas. Usar cuando los pasos del procedimiento de una habilidad están
  desactualizados, los comentarios de usuarios revelan brechas, una habilidad
  necesita una actualización de complejidad, se necesita una variante avanzada
  junto a la original, o las habilidades relacionadas se añaden y las
  referencias cruzadas están obsoletas.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, maintenance, evolution, versioning
  locale: es
  source_locale: en
  source_commit: b4dd42cd
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Evolucionar una Habilidad Existente

Mejora, extiende o crea una variante avanzada de una habilidad que fue creada originalmente con `create-skill`. Este procedimiento cubre el lado de mantenimiento del ciclo de vida de la habilidad: evaluar brechas, aplicar mejoras específicas, actualizar versiones y mantener sincronizados el registro y las referencias cruzadas.

## Cuándo Usar

- Los pasos del procedimiento de una habilidad están desactualizados o incompletos tras cambios en las herramientas
- Los comentarios de usuarios revelan errores faltantes, pasos poco claros o validación débil
- Una habilidad necesita crecer de básica a intermedia (o de intermedia a avanzada)
- Se necesita una variante avanzada junto a la original (p.ej., `create-r-package` y `create-r-package-advanced`)
- Se añadieron o eliminaron habilidades relacionadas y las referencias cruzadas están obsoletas

## Entradas

- **Requerido**: Ruta al SKILL.md existente que se va a evolucionar
- **Requerido**: Disparador de evolución (comentario, cambio de herramienta, actualización de complejidad, nuevas habilidades relacionadas, errores descubiertos)
- **Opcional**: Nivel de complejidad objetivo si cambia (basic, intermediate, advanced)
- **Opcional**: Si crear una variante avanzada en lugar de refinar en el lugar (por defecto: refinar en el lugar)

## Procedimiento

### Paso 1: Evaluar la Habilidad Actual

Leer el SKILL.md existente y evaluar cada sección frente a la lista de verificación de calidad:

| Sección | Qué verificar | Problemas comunes |
|---------|--------------|------------------|
| Frontmatter | Todos los campos requeridos presentes, `description` < 1024 chars | Falta `tags`, `version` obsoleta |
| When to Use | 3-5 condiciones de activación concretas | Disparadores vagos o superpuestos |
| Inputs | Requeridos vs. opcionales claramente separados | Faltan valores por defecto para entradas opcionales |
| Procedure | Cada paso tiene código + Expected + On failure | Faltan bloques On failure, pseudocódigo en lugar de comandos reales |
| Validation | Cada elemento es de paso/fallo binario | Criterios subjetivos ("el código está limpio") |
| Common Pitfalls | 3-6 con causa y cómo evitarlos | Demasiado genéricos ("tener cuidado") |
| Related Skills | 2-5 referencias de habilidades válidas | Referencias obsoletas a habilidades renombradas/eliminadas |

```bash
# Leer la habilidad
cat skills/<skill-name>/SKILL.md

# Verificar que el frontmatter se analiza
head -20 skills/<skill-name>/SKILL.md

# Verificar que las habilidades relacionadas aún existen
grep -oP '`[\w-]+`' skills/<skill-name>/SKILL.md | sort -u
```

**Esperado:** Una lista de brechas específicas, debilidades u oportunidades de mejora.

**En caso de fallo:** Si el SKILL.md no existe o no tiene frontmatter, esta habilidad no aplica — usar `create-skill` en su lugar para crearlo desde cero.

### Paso 2: Reunir los Requisitos de Evolución

Identificar y categorizar qué desencadenó la evolución:

| Disparador | Ejemplo | Alcance típico |
|-----------|---------|---------------|
| Comentario del usuario | "El paso 3 no está claro" | Refinamiento |
| Cambio de herramienta | Nueva versión de API, comando obsoleto | Refinamiento |
| Error descubierto | Fallo común no documentado | Refinamiento |
| Actualización de complejidad | La habilidad es demasiado superficial para uso real | Refinamiento o variante |
| Nuevas habilidades relacionadas | Se añadió una habilidad adyacente | Refinamiento (referencias cruzadas) |
| Caso de uso avanzado | Los usuarios avanzados necesitan mayor cobertura | Variante |

Documentar los cambios específicos necesarios antes de editar. Listar cada cambio con su sección objetivo.

**Esperado:** Una lista concreta de cambios (p.ej., "Añadir On failure al Paso 4", "Añadir nuevo Paso 6 para caso extremo X", "Actualizar Related Skills para incluir `new-skill`").

**En caso de fallo:** Si los cambios no están claros, consultar al usuario para aclaración antes de proceder. Los objetivos de evolución vagos producen mejoras vagas.

### Paso 3: Elegir el Alcance de la Evolución

Usar esta matriz de decisión para determinar si refinar en el lugar o crear una variante:

| Criterios | Refinamiento (en el lugar) | Variante Avanzada (nueva habilidad) |
|-----------|---------------------------|-------------------------------------|
| ID de habilidad | Sin cambios | Nuevo ID: `<skill>-advanced` |
| Ruta del archivo | Mismo SKILL.md | Nuevo directorio |
| Incremento de versión | Parche o menor | Comienza en 1.0 |
| Complejidad | Puede aumentar | Mayor que la original |
| Registro | Sin nueva entrada | Nueva entrada añadida |
| Symlinks | Sin cambio | Nuevos symlinks necesarios |
| Habilidad original | Modificada directamente | Intacta, gana referencia cruzada |

**Refinamiento**: Elegir al mejorar la calidad, corregir brechas o añadir contenido nuevo modesto. La habilidad mantiene su identidad.

**Variante**: Elegir cuando la versión evolucionada duplicaría la longitud, cambiaría el público objetivo o requeriría entradas sustancialmente diferentes. El original permanece como está para casos de uso más simples.

**Esperado:** Una decisión clara — refinamiento o variante — con justificación.

**En caso de fallo:** Si no estás seguro, por defecto optar por refinamiento. Siempre puedes extraer una variante más tarde; es más difícil fusionarla de vuelta.

### Paso 4: Aplicar los Cambios de Contenido

#### Para Refinamientos

Editar el SKILL.md existente directamente:

```bash
# Abrir para edición
# Añadir/revisar pasos del procedimiento
# Fortalecer pares Expected/On failure
# Añadir tablas o ejemplos
# Actualizar los disparadores de When to Use
# Revisar Inputs si el alcance cambió
```

Seguir estas reglas de edición:
- Preservar todas las secciones existentes — añadir contenido, no eliminar secciones
- Mantener la numeración de pasos secuencial tras las inserciones
- Cada paso nuevo o modificado debe tener tanto Expected como On failure
- Los nuevos errores van al final de la sección Common Pitfalls
- Las nuevas habilidades relacionadas van al final de la sección Related Skills

#### Para Variantes

```bash
# Crear el directorio de variante
mkdir -p skills/<skill-name>-advanced/

# Copiar el original como punto de partida
cp skills/<skill-name>/SKILL.md skills/<skill-name>-advanced/SKILL.md

# Editar la variante:
# - Cambiar `name` a `<skill-name>-advanced`
# - Actualizar `description` para reflejar el alcance avanzado
# - Aumentar `complexity` (p.ej., intermediate → advanced)
# - Restablecer `version` a "1.0"
# - Añadir/expandir pasos del procedimiento para el caso de uso avanzado
# - Referenciar el original en Related Skills como requisito previo
```

**Esperado:** El SKILL.md (refinado o nueva variante) pasa la lista de verificación de evaluación del Paso 1.

**En caso de fallo:** Si una edición rompe la estructura del documento, usar `git diff` para revisar los cambios y revertir ediciones parciales con `git checkout -- <file>`.

### Paso 5: Actualizar la Versión y los Metadatos

Incrementar el campo `version` en el frontmatter siguiendo las convenciones de semver:

| Tipo de cambio | Incremento de versión | Ejemplo |
|---------------|----------------------|---------|
| Corrección tipográfica, aclaración de redacción | Parche: 1.0 → 1.1 | Oración poco clara corregida en el Paso 3 |
| Nuevo paso, nuevo error, nueva tabla | Menor: 1.0 → 2.0 | Añadido Paso 7 para manejo de casos extremos |
| Procedimiento reestructurado, entradas cambiadas | Mayor: 1.0 → 2.0 | Reorganizado de 5 a 8 pasos |

También actualizar:
- `complexity` si el alcance se expandió (p.ej., basic → intermediate)
- `tags` si el área de cobertura cambió
- `description` si el alcance de la habilidad es materialmente diferente

**Esperado:** El `version` del frontmatter refleja la magnitud de los cambios. Las nuevas variantes comienzan en `"1.0"`.

**En caso de fallo:** Si olvidas incrementar la versión, la próxima evolución no tendrá forma de distinguir el estado actual del anterior. Siempre incrementar antes de confirmar.

### Paso 6: Actualizar el Registro y las Referencias Cruzadas

#### Para Refinamientos

No se necesitan cambios en el registro (la ruta no cambia). Actualizar las referencias cruzadas solo si las Habilidades Relacionadas cambiaron en otras habilidades:

```bash
# Comprobar si alguna habilidad referencia la habilidad evolucionada
grep -r "<skill-name>" skills/*/SKILL.md
```

#### Para Variantes

Añadir la nueva habilidad a `skills/_registry.yml`:

```yaml
- id: <skill-name>-advanced
  path: <skill-name>-advanced/SKILL.md
  complexity: advanced
  language: multi
  description: One-line description of the advanced variant
```

Luego:
1. Incrementar `total_skills` al inicio del registro
2. Añadir referencia cruzada de Related Skills en la habilidad original apuntando a la variante
3. Añadir referencia cruzada de Related Skills en la variante apuntando al original
4. Crear symlinks para el descubrimiento de comandos slash:

```bash
# A nivel de proyecto
ln -s ../../skills/<skill-name>-advanced .claude/skills/<skill-name>-advanced

# Global
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name>-advanced ~/.claude/skills/<skill-name>-advanced
```

**Esperado:** El `total_skills` del registro coincide con `find skills -name SKILL.md | wc -l`. Las referencias cruzadas son bidireccionales.

**En caso de fallo:** Si el recuento del registro es incorrecto, ejecutar `find skills -name SKILL.md | wc -l` para obtener el recuento verdadero y corregir el registro. Para symlinks rotos, usar `readlink -f` para depurar la resolución.

### Paso 7: Validar la Habilidad Evolucionada

Ejecutar la lista de verificación de validación completa:

- [ ] SKILL.md existe en la ruta esperada
- [ ] El frontmatter YAML se analiza sin errores
- [ ] `version` fue incrementada (refinamiento) o establecida en "1.0" (variante)
- [ ] Todas las secciones presentes: When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills
- [ ] Cada paso del procedimiento tiene bloques Expected y On failure
- [ ] Las Habilidades Relacionadas hacen referencia a nombres de habilidades válidos y existentes
- [ ] La entrada del registro existe con la ruta correcta (solo variantes)
- [ ] El recuento `total_skills` coincide con el recuento real de habilidades en disco
- [ ] Los symlinks se resuelven correctamente (solo variantes)
- [ ] `git diff` no muestra eliminaciones accidentales del contenido original

```bash
# Verificar frontmatter
head -20 skills/<skill-name>/SKILL.md

# Contar habilidades en disco vs registro
find skills -name SKILL.md | wc -l
grep total_skills skills/_registry.yml

# Comprobar symlinks (para variantes)
ls -la .claude/skills/<skill-name>-advanced
readlink -f .claude/skills/<skill-name>-advanced/SKILL.md

# Revisar todos los cambios
git diff
```

**Esperado:** Todos los elementos de la lista de verificación pasan. La habilidad evolucionada está lista para confirmar.

**En caso de fallo:** Abordar cada elemento fallido individualmente. El problema más común tras la evolución es un recuento `total_skills` obsoleto — siempre verificarlo al final.

## Validación

- [ ] SKILL.md existe y tiene frontmatter YAML válido
- [ ] El campo `version` refleja los cambios realizados
- [ ] Todos los pasos del procedimiento tienen bloques Expected y On failure
- [ ] Las referencias de Related Skills son válidas (sin referencias cruzadas rotas)
- [ ] El `total_skills` del registro coincide con el recuento real en disco
- [ ] Para variantes: nueva entrada en `_registry.yml` con la ruta correcta
- [ ] Para variantes: symlinks creados en `.claude/skills/` y `~/.claude/skills/`
- [ ] `git diff` confirma que no se eliminó contenido accidentalmente

## Errores Comunes

- **Olvidar incrementar la versión**: Sin incrementos de versión, no hay forma de rastrear qué cambió o cuándo. Siempre actualizar `version` en el frontmatter antes de confirmar.
- **Eliminación accidental de contenido**: Al reestructurar pasos, es fácil perder un bloque On failure o una fila de tabla. Siempre revisar `git diff` antes de confirmar.
- **Referencias cruzadas obsoletas**: Al crear una variante, tanto el original como la variante necesitan referenciarse mutuamente. Las referencias unidireccionales dejan el grafo incompleto.
- **Desviación del recuento del registro**: Tras crear una variante, el recuento `total_skills` debe incrementarse. Olvidarlo causa fallos de validación en otras habilidades que comprueban el registro.
- **Aumento de alcance durante el refinamiento**: Un refinamiento que duplica la longitud de la habilidad debería ser probablemente una variante en su lugar. Si añades más de 3 nuevos pasos del procedimiento, reconsiderar la decisión de alcance del Paso 3.
- **Evitar `git mv` en rutas montadas en NTFS (WSL)**: En rutas `/mnt/`, `git mv` para directorios puede crear permisos rotos (`d?????????`). Usar `mkdir -p` + copiar archivos + `git rm` la ruta antigua en su lugar. Ver la sección de solución de problemas de la [guía del entorno](../../guides/setting-up-your-environment.md).

## Habilidades Relacionadas

- `create-skill` — base para la creación de nuevas habilidades; evolve-skill asume que esto se siguió originalmente
- `commit-changes` — confirmar la habilidad evolucionada con un mensaje descriptivo
- `configure-git-repository` — cambios de habilidades bajo control de versiones
- `security-audit-codebase` — revisar habilidades evolucionadas para detectar secretos incluidos accidentalmente
