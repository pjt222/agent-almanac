---
name: evolve-agent
description: >
  Evoluciona una definición de agente existente refinando su persona en el
  lugar o creando una variante avanzada. Cubre la evaluación del agente actual
  frente a las mejores prácticas, la recopilación de requisitos de evolución,
  la elección del alcance (refinamiento vs. variante), la aplicación de cambios
  a las habilidades, herramientas, capacidades y limitaciones, la actualización
  de metadatos de versión y la sincronización del registro y las referencias
  cruzadas. Usar cuando la lista de habilidades de un agente está desactualizada,
  los comentarios de usuarios revelan brechas de capacidad, los requisitos de
  herramientas han cambiado, se necesita una variante avanzada junto a la
  original, o el alcance del agente necesita ajuste tras el uso en el mundo real.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, agent, evolution, maintenance, versioning
  locale: es
  source_locale: en
  source_commit: 971b2bdc
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Evolucionar un Agente Existente

Mejora, extiende o crea una variante avanzada de un agente que fue creado originalmente con `create-agent`. Este procedimiento cubre el lado de mantenimiento del ciclo de vida del agente: evaluar brechas frente a las mejores prácticas, aplicar mejoras específicas a la definición de la persona, actualizar versiones y mantener sincronizados el registro y las referencias cruzadas.

## Cuándo Usar

- La lista de habilidades de un agente está desactualizada tras añadir nuevas habilidades a la biblioteca
- Los comentarios de usuarios revelan capacidades faltantes, propósito poco claro o ejemplos débiles
- Los requisitos de herramientas han cambiado (nuevo servidor MCP, herramienta eliminada, reducción de privilegios necesaria)
- El alcance de un agente necesita ajuste — se superpone con otro agente o es demasiado amplio
- Se necesita una variante avanzada junto a la original (p.ej., `r-developer` y `r-developer-advanced`)
- Se añadieron agentes o equipos relacionados y las referencias cruzadas en Ver También están obsoletas

## Entradas

- **Requerido**: Ruta al archivo de agente existente que se va a evolucionar (p.ej., `agents/r-developer.md`)
- **Requerido**: Disparador de evolución (comentario, nuevas habilidades, cambio de herramienta, solapamiento de alcance, integración en equipo, limitaciones descubiertas)
- **Opcional**: Magnitud objetivo del incremento de versión (parche, menor, mayor)
- **Opcional**: Si crear una variante avanzada en lugar de refinar en el lugar (por defecto: refinar en el lugar)

## Procedimiento

### Paso 1: Evaluar el Agente Actual

Leer el archivo de agente existente y evaluar cada sección frente a la lista de verificación de calidad de `guides/agent-best-practices.md`:

| Sección | Qué verificar | Problemas comunes |
|---------|--------------|------------------|
| Frontmatter | Todos los campos requeridos presentes (`name`, `description`, `tools`, `model`, `version`, `author`) | Falta `tags`, `version` obsoleta, `priority` incorrecta |
| Purpose | Declaración de problema específica, no genérica "ayuda con X" | Vaga o superpuesta con otro agente |
| Capabilities | Capacidades concretas y verificables con encabezados en negrita | Genérico ("maneja el desarrollo"), sin agrupación |
| Available Skills | Coincide con la lista `skills` del frontmatter, todos los IDs existen en el registro | IDs obsoletos, faltan nuevas habilidades, lista habilidades por defecto innecesariamente |
| Usage Scenarios | 2-3 escenarios realistas con patrones de invocación | Texto de marcador, ejemplos poco realistas |
| Examples | Muestra la solicitud del usuario y el comportamiento del agente | Faltantes o triviales |
| Limitations | 3-5 restricciones honestas | Muy pocas, demasiado vagas o completamente faltantes |
| See Also | Referencias cruzadas válidas a agentes, guías, equipos | Enlaces obsoletos a archivos renombrados o eliminados |

```bash
# Leer el archivo del agente
cat agents/<agent-name>.md

# Verificar que el frontmatter se analiza
head -20 agents/<agent-name>.md

# Verificar las habilidades en el frontmatter existen en el registro
grep "skills:" -A 20 agents/<agent-name>.md

# Comprobar si algún equipo referencia este agente
grep -r "<agent-name>" teams/*.md
```

**Esperado:** Una lista de brechas específicas, debilidades u oportunidades de mejora organizadas por sección.

**En caso de fallo:** Si el archivo del agente no existe o no tiene frontmatter, esta habilidad no aplica — usar `create-agent` en su lugar para crearlo desde cero.

### Paso 2: Reunir los Requisitos de Evolución

Identificar y categorizar qué desencadenó la evolución:

| Disparador | Ejemplo | Alcance típico |
|-----------|---------|---------------|
| Comentario del usuario | "El agente no detectó XSS en la revisión" | Añadir habilidad o capacidad |
| Nuevas habilidades disponibles | La biblioteca ganó `analyze-api-security` | Actualizar lista de habilidades |
| Cambio de herramienta | Nuevo servidor MCP disponible | Añadir a tools/mcp_servers |
| Solapamiento de alcance | Dos agentes reclaman "revisión de código" | Afinar propósito y limitaciones |
| Integración en equipo | Agente añadido a un nuevo equipo | Actualizar Ver También, verificar capacidades |
| Actualización de modelo | La tarea requiere razonamiento más profundo | Cambiar el campo model |
| Reducción de privilegios | El agente tiene Bash pero solo lee archivos | Eliminar herramientas innecesarias |

Documentar los cambios específicos necesarios antes de editar. Listar cada cambio con su sección objetivo:

```
- Frontmatter: añadir `new-skill-id` a la lista de habilidades
- Capabilities: añadir capacidad "API Security Analysis"
- Available Skills: añadir `new-skill-id` con descripción
- Limitations: eliminar limitación desactualizada sobre habilidad faltante
- See Also: añadir enlace al nuevo equipo que incluye este agente
```

**Esperado:** Una lista concreta de cambios, cada uno mapeado a una sección específica del archivo del agente.

**En caso de fallo:** Si los cambios no están claros, consultar al usuario para aclaración antes de proceder. Los objetivos de evolución vagos producen mejoras vagas.

### Paso 3: Elegir el Alcance de la Evolución

Usar esta matriz de decisión para determinar si refinar en el lugar o crear una variante:

| Criterios | Refinamiento (en el lugar) | Variante Avanzada (nuevo agente) |
|-----------|---------------------------|----------------------------------|
| ID del agente | Sin cambios | Nuevo ID: `<agent>-advanced` o `<agent>-<specialty>` |
| Ruta del archivo | Mismo archivo `.md` | Nuevo archivo en `agents/` |
| Incremento de versión | Parche o menor | Comienza en 1.0.0 |
| Modelo | Puede cambiar | A menudo más alto (p.ej., sonnet → opus) |
| Registro | Actualizar entrada existente | Nueva entrada añadida |
| Agente original | Modificado directamente | Intacto, gana referencia cruzada en Ver También |

**Refinamiento**: Elegir al actualizar habilidades, corregir documentación, afinar alcance o ajustar herramientas. El agente mantiene su identidad.

**Variante**: Elegir cuando la versión evolucionada serviría a una audiencia sustancialmente diferente, requeriría un modelo diferente o añadiría capacidades que harían al original demasiado amplio. El original permanece como está para casos de uso más simples.

**Esperado:** Una decisión clara — refinamiento o variante — con justificación.

**En caso de fallo:** Si no estás seguro, por defecto optar por refinamiento. Siempre puedes extraer una variante más tarde; es más difícil fusionarla de vuelta.

### Paso 4: Aplicar los Cambios al Archivo del Agente

#### Para Refinamientos

Editar el archivo de agente existente directamente:

- **Frontmatter**: Actualizar `skills`, `tools`, `tags`, `model`, `priority`, `mcp_servers` según sea necesario
- **Purpose/Capabilities**: Revisar para reflejar nuevo alcance o funcionalidad añadida
- **Available Skills**: Añadir nuevas habilidades con descripciones, eliminar las obsoletas
- **Usage Scenarios**: Añadir o revisar escenarios para demostrar nuevas capacidades
- **Limitations**: Eliminar restricciones que ya no aplican, añadir nuevas honestas
- **See Also**: Actualizar referencias cruzadas para reflejar el panorama actual de agente/equipo/guía

Seguir estas reglas de edición:
- Preservar todas las secciones existentes — añadir contenido, no eliminar secciones
- Mantener la sección Available Skills sincronizada con la lista `skills` del frontmatter
- No añadir habilidades por defecto (`meditate`, `heal`) al frontmatter a menos que sean fundamentales para la metodología del agente
- Verificar que cada ID de habilidad existe: `grep "id: skill-name" skills/_registry.yml`

#### Para Variantes

```bash
# Copiar el original como punto de partida
cp agents/<agent-name>.md agents/<agent-name>-advanced.md

# Editar la variante:
# - Cambiar `name` a `<agent-name>-advanced`
# - Actualizar `description` para reflejar el alcance avanzado
# - Aumentar `model` si es necesario (p.ej., sonnet → opus)
# - Restablecer `version` a "1.0.0"
# - Expandir habilidades, capacidades y ejemplos para el caso de uso avanzado
# - Referenciar el original en Ver También como alternativa más simple
```

**Esperado:** El archivo del agente (refinado o nueva variante) pasa la lista de verificación de evaluación del Paso 1.

**En caso de fallo:** Si una edición rompe la estructura del documento, usar `git diff` para revisar los cambios y revertir ediciones parciales con `git checkout -- <file>`.

### Paso 5: Actualizar la Versión y los Metadatos

Incrementar el campo `version` en el frontmatter siguiendo el versionado semántico:

| Tipo de cambio | Incremento de versión | Ejemplo |
|---------------|----------------------|---------|
| Corrección tipográfica, aclaración de redacción | Parche: 1.0.0 → 1.0.1 | Limitación poco clara corregida |
| Nuevas habilidades añadidas, capacidad expandida | Menor: 1.0.0 → 1.1.0 | 3 nuevas habilidades añadidas de la biblioteca |
| Propósito reestructurado, modelo cambiado | Mayor: 1.0.0 → 2.0.0 | Alcance reducido, actualizado a opus |

También actualizar:
- Fecha `updated` a la fecha actual
- `tags` si la cobertura de dominio del agente cambió
- `description` si el propósito es materialmente diferente
- `priority` si la importancia del agente relativa a otros cambió

**Esperado:** `version` y `updated` del frontmatter reflejan la magnitud y fecha de los cambios. Las nuevas variantes comienzan en `"1.0.0"`.

**En caso de fallo:** Si olvidas incrementar la versión, la próxima evolución no tendrá forma de distinguir el estado actual del anterior. Siempre incrementar antes de confirmar.

### Paso 6: Actualizar el Registro y las Referencias Cruzadas

#### Para Refinamientos

Actualizar la entrada existente en `agents/_registry.yml` para que coincida con el frontmatter revisado:

```bash
# Encontrar la entrada del registro del agente
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

Actualizar los campos `description`, `tags`, `tools` y `skills` para que coincidan con el archivo del agente. No se necesita cambio de recuento.

Actualizar las referencias cruzadas en otros archivos si las capacidades o nombre del agente cambiaron:

```bash
# Comprobar si algún equipo referencia este agente
grep -r "<agent-name>" teams/*.md

# Comprobar si alguna guía referencia este agente
grep -r "<agent-name>" guides/*.md
```

#### Para Variantes

Añadir el nuevo agente a `agents/_registry.yml` en posición alfabética:

```yaml
  - id: <agent-name>-advanced
    path: agents/<agent-name>-advanced.md
    description: One-line description of the advanced variant
    tags: [domain, specialty, advanced]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

Luego:
1. Incrementar `total_agents` al inicio del registro
2. Añadir referencia cruzada Ver También en el agente original apuntando a la variante
3. Añadir referencia cruzada Ver También en la variante apuntando al original
4. El symlink `.claude/agents/` a `agents/` significa que la variante es automáticamente descubrible

**Esperado:** La entrada del registro coincide con el frontmatter del archivo del agente. Para variantes, `total_agents` es igual al número real de entradas de agentes.

**En caso de fallo:** Contar entradas con `grep -c "^  - id:" agents/_registry.yml` y verificar que coincide con `total_agents`.

### Paso 7: Validar el Agente Evolucionado

Ejecutar la lista de verificación de validación completa:

- [ ] El archivo del agente existe en la ruta esperada
- [ ] El frontmatter YAML se analiza sin errores
- [ ] `version` fue incrementada (refinamiento) o establecida en "1.0.0" (variante)
- [ ] La fecha `updated` refleja hoy
- [ ] Todas las secciones requeridas presentes: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Las habilidades en el frontmatter coinciden con la sección Available Skills
- [ ] Todos los IDs de habilidades existen en `skills/_registry.yml`
- [ ] Las habilidades por defecto (`meditate`, `heal`) no están listadas a menos que sean fundamentales para la metodología
- [ ] La lista de herramientas sigue el principio de mínimo privilegio
- [ ] La entrada del registro existe y coincide con el frontmatter
- [ ] Para variantes: el recuento `total_agents` coincide con el recuento real en disco
- [ ] Las referencias cruzadas son bidireccionales (original ↔ variante)
- [ ] `git diff` no muestra eliminaciones accidentales del contenido original

```bash
# Verificar frontmatter
head -20 agents/<agent-name>.md

# Comprobar que las habilidades existen
for skill in skill-a skill-b; do
  grep "id: $skill" skills/_registry.yml
done

# Contar agentes en disco vs registro
ls agents/*.md | grep -v template | wc -l
grep total_agents agents/_registry.yml

# Revisar todos los cambios
git diff
```

**Esperado:** Todos los elementos de la lista de verificación pasan. El agente evolucionado está listo para confirmar.

**En caso de fallo:** Abordar cada elemento fallido individualmente. Los problemas más comunes tras la evolución son IDs de habilidades obsoletos en la sección Available Skills y una fecha `updated` olvidada.

## Validación

- [ ] El archivo del agente existe y tiene frontmatter YAML válido
- [ ] El campo `version` refleja los cambios realizados
- [ ] La fecha `updated` es actual
- [ ] Todas las secciones presentes e internamente consistentes
- [ ] El array `skills` del frontmatter coincide con la sección Available Skills
- [ ] Todos los IDs de habilidades existen en `skills/_registry.yml`
- [ ] Las habilidades por defecto no están listadas innecesariamente
- [ ] La entrada del registro coincide con el archivo del agente
- [ ] Para variantes: nueva entrada en `agents/_registry.yml` con la ruta correcta
- [ ] Para variantes: recuento `total_agents` actualizado
- [ ] Las referencias cruzadas son válidas (sin enlaces rotos en Ver También)
- [ ] `git diff` confirma que no se eliminó contenido accidentalmente

## Errores Comunes

- **Olvidar incrementar la versión**: Sin incrementos de versión, no hay forma de rastrear qué cambió o cuándo. Siempre actualizar `version` y `updated` en el frontmatter antes de confirmar.
- **Desviación de la lista de habilidades**: El array `skills` del frontmatter y la sección `## Available Skills` deben mantenerse sincronizados. Actualizar uno sin el otro crea confusión tanto para humanos como para las herramientas.
- **Listar habilidades por defecto innecesariamente**: Añadir `meditate` o `heal` al frontmatter cuando ya se heredan del registro. Solo listarlas si son fundamentales para la metodología del agente (p.ej., `mystic`, `alchemist`).
- **Sobreprovisión de herramientas durante la evolución**: Añadir `Bash` o `WebFetch` durante una evolución "por si acaso". Cada adición de herramienta debe justificarse por una nueva capacidad específica.
- **Ver También obsoleto tras la creación de variante**: Al crear una variante, tanto el original como la variante necesitan referenciarse mutuamente. Las referencias unidireccionales dejan el grafo incompleto.
- **Entrada del registro no actualizada**: Tras cambiar las habilidades, herramientas o descripción de un agente, la entrada en `agents/_registry.yml` debe actualizarse para que coincida. Las entradas de registro obsoletas causan fallos de descubrimiento y de herramientas.

## Habilidades Relacionadas

- `create-agent` — base para la creación de nuevos agentes; evolve-agent asume que esto se siguió originalmente
- `evolve-skill` — el procedimiento paralelo para evolucionar archivos SKILL.md
- `commit-changes` — confirmar el agente evolucionado con un mensaje descriptivo
