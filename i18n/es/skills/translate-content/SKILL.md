---
name: translate-content
description: >
  Traducir contenido de agent-almanac (habilidades, agentes, equipos, guías) a un
  idioma objetivo preservando bloques de código, IDs y estructura técnica. Cubre
  scaffolding, configuración de frontmatter, traducción de prosa, preservación de
  código y seguimiento de frescura. Usar al localizar contenido para un nuevo
  idioma, actualizar traducciones obsoletas después de cambios en la fuente, o
  traducir por lotes un dominio.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: i18n
  complexity: intermediate
  language: multi
  tags: i18n, translation, localization, multilingual, l10n
  locale: es
  source_locale: en
  source_commit: c7ff09ca
  translator: claude
  translation_date: "2026-03-17"
---

# Translate Content

Traducir contenido fuente en inglés a un idioma objetivo, preservando la precisión técnica y la integridad estructural.

## Cuándo Usar

- Localizar una habilidad, agente, equipo o guía a un idioma soportado
- Actualizar una traducción que se ha vuelto obsoleta después de cambios en la fuente
- Traducir por lotes múltiples elementos dentro de un dominio o tipo de contenido
- Crear traducciones iniciales para un nuevo idioma

## Entradas

- **Requerido**: Tipo de contenido — `skills`, `agents`, `teams` o `guides`
- **Requerido**: ID del elemento — el nombre/identificador del contenido (ej., `create-r-package`)
- **Requerido**: Idioma objetivo — código IETF BCP 47 (ej., `de`, `zh-CN`, `ja`, `es`)
- **Opcional**: Lista de lote — múltiples IDs para traducir en secuencia

## Procedimiento

### Paso 1: Leer la fuente en inglés

1.1. Determinar la ruta del archivo fuente:
   - Skills: `skills/<id>/SKILL.md`
   - Agents: `agents/<id>.md`
   - Teams: `teams/<id>.md`
   - Guides: `guides/<id>.md`

1.2. Leer el archivo fuente completo para comprender el contexto, estructura y contenido.

1.3. Identificar las secciones que deben permanecer en inglés:
   - Todos los bloques de código (delimitados con triple comilla invertida)
   - Código en línea (envuelto en comillas invertidas)
   - Nombres de campos YAML del frontmatter y valores técnicos (`name`, `tools`, `model`, `priority`, entradas de lista `skills`, `allowed-tools`, `tags`, `domain`, `language`)
   - Rutas de archivos, URLs, ejemplos de comandos
   - Bloques `<!-- CONFIG:START -->` / `<!-- CONFIG:END -->` en equipos

**Esperado:** Comprensión completa del contenido fuente con separación mental clara entre prosa traducible y contenido técnico preservado.

**En caso de fallo:** Si el archivo fuente no se encuentra, verificar que el ID existe en el registro. Verificar errores tipográficos en el tipo de contenido o ID.

### Paso 2: Crear el scaffolding del archivo de traducción

2.1. Ejecutar el script de scaffolding:
```bash
npm run translate:scaffold -- <content-type> <id> <locale>
```

2.2. Si el archivo ya existe, leerlo para verificar si necesita actualización (obsoleto) o ya está actualizado.

2.3. Verificar que el archivo scaffolded tenga los campos de frontmatter de traducción:
   - `locale` — coincide con el idioma objetivo
   - `source_locale` — `en`
   - `source_commit` — hash git corto actual
   - `translator` — cadena de atribución
   - `translation_date` — fecha de hoy

**Esperado:** Archivo scaffolded en `i18n/<locale>/<content-type>/<id>/SKILL.md` (o `.md` para otros tipos) con frontmatter correcto.

**En caso de fallo:** Si el script de scaffold falla, crear el directorio manualmente con `mkdir -p` y copiar el archivo fuente. Agregar los campos de frontmatter manualmente.

### Paso 3: Traducir la descripción

3.1. Traducir el campo `description` en el frontmatter YAML al idioma objetivo.

3.2. Para habilidades, la descripción está dentro del frontmatter de nivel superior. Para agentes/equipos/guías, también está en el frontmatter de nivel superior.

3.3. Mantener la traducción concisa — igualar la longitud y estilo del original.

**Esperado:** El campo de descripción contiene una traducción idiomática que transmite con precisión el significado original.

**En caso de fallo:** Si la descripción es ambigua, mantenerla más cercana a la traducción literal en lugar de arriesgarse a una mala interpretación.

### Paso 4: Traducir las secciones de prosa

4.1. Traducir todo el contenido de prosa sección por sección:
   - Encabezados de sección (ej., "## When to Use" → "## Cuándo Usar" en español)
   - Texto de párrafos
   - Texto de elementos de lista (pero no código/rutas en elementos de lista)
   - Texto de celdas de tabla (pero no código/valores en celdas de tabla)

4.2. Preservar estos elementos exactamente como están:
   - Bloques de código (delimitados con ``` e indentados)
   - Código en línea (envuelto en `comillas invertidas`)
   - Rutas de archivos y URLs
   - IDs de habilidades/agentes/equipos en referencias cruzadas
   - Ejemplos de configuración YAML/JSON
   - Ejemplos de línea de comandos
   - Marcadores `**Esperado:**` y `**En caso de fallo:**` (traducir la etiqueta, mantener la estructura)

4.3. Para habilidades, traducir los nombres de sección estandarizados:
   - "When to Use" → equivalente en el idioma
   - "Inputs" → equivalente en el idioma
   - "Procedure" → equivalente en el idioma
   - "Validation" → equivalente en el idioma
   - "Common Pitfalls" → equivalente en el idioma
   - "Related Skills" → equivalente en el idioma

4.4. Para agentes, traducir:
   - Purpose, Capabilities, Available Skills (solo el nombre de sección — los IDs de habilidades permanecen en inglés), Usage Scenarios, Best Practices, Examples, Limitations, See Also

4.5. Para equipos, traducir:
   - Purpose, Team Composition (solo prosa — los IDs permanecen en inglés), Coordination Pattern, Task Decomposition, Usage Scenarios, Limitations

4.6. Para guías, traducir:
   - Todas las secciones de prosa, texto de resolución de problemas, descripciones de tablas
   - Mantener ejemplos de comandos, bloques de código y fragmentos de configuración en inglés

**Esperado:** Todas las secciones de prosa traducidas idiomáticamente. Bloques de código idénticos a la fuente en inglés. Las referencias cruzadas usan IDs en inglés.

**En caso de fallo:** Si hay incertidumbre sobre un término técnico, mantener el término en inglés con una traducción entre paréntesis. Ejemplo: "Área de preparación (Staging Area)" en español.

### Paso 5: Verificar la integridad estructural

5.1. Confirmar que el archivo traducido tiene el mismo número de secciones que la fuente.

5.2. Para habilidades, verificar que todas las secciones requeridas están presentes:
   - Frontmatter YAML con `name`, `description`, `allowed-tools`, `metadata`
   - Cuándo Usar, Entradas, Procedimiento, Validación, Errores Comunes, Habilidades Relacionadas

5.3. Verificar que los bloques de código son idénticos a la fuente en inglés (hacer diff de los bloques delimitados).

5.4. Verificar el conteo de líneas: las habilidades deben ser de 500 líneas o menos.

5.5. Verificar que el campo `name` coincide exactamente con la fuente en inglés (es el ID, nunca se traduce).

**Esperado:** Archivo traducido estructuralmente válido que pasa la validación.

**En caso de fallo:** Comparar sección por sección con la fuente en inglés. Restaurar cualquier sección faltante.

### Paso 5.5: Verificar que la prosa está traducida

5.5.1. Muestrea 3 párrafos de prosa del cuerpo del archivo traducido. Elige párrafos de diferentes secciones — no encabezados, no bloques de código, no metadatos frontales.

5.5.2. Confirma que cada párrafo muestreado está escrito en el idioma de destino, no en inglés.

5.5.3. Si algún párrafo muestreado todavía está en inglés, la traducción está incompleta. Vuelve al Paso 4 y traduce la prosa en inglés restante antes de continuar.

**Esperado:** Los 3 párrafos de prosa muestreados están en el idioma de destino, confirmando que el texto del cuerpo ha sido traducido, no solo los encabezados y los metadatos frontales.

**En caso de fallo:** Identifica qué secciones todavía contienen prosa en inglés. Tradúcelas antes de continuar con el Paso 6.

### Paso 6: Escribir el archivo traducido

6.1. Escribir el contenido traducido completo en la ruta objetivo usando la herramienta Write o Edit.

6.2. Verificar que el archivo existe en la ruta esperada:
   - Skills: `i18n/<locale>/skills/<id>/SKILL.md`
   - Agents: `i18n/<locale>/agents/<id>.md`
   - Teams: `i18n/<locale>/teams/<id>.md`
   - Guides: `i18n/<locale>/guides/<id>.md`

**Esperado:** Archivo traducido escrito en disco en la ruta correcta.

**En caso de fallo:** Verificar que el directorio existe. Crear con `mkdir -p` si es necesario.

## Validación

- [ ] El archivo traducido existe en `i18n/<locale>/<type>/<id>`
- [ ] El campo `name` coincide exactamente con la fuente en inglés
- [ ] El campo `locale` coincide con el idioma objetivo
- [ ] El campo `source_commit` está configurado con un hash git corto válido
- [ ] Todos los bloques de código son idénticos a la fuente en inglés
- [ ] Todos los IDs de referencias cruzadas (habilidades, agentes, equipos) están en inglés
- [ ] El archivo tiene menos de 500 líneas (para habilidades)
- [ ] `npm run validate:translations` no reporta problemas para este archivo
- [ ] La prosa se lee idiomáticamente en el idioma objetivo

## Errores Comunes

- **Traducir bloques de código**: El código, comandos y configuración deben permanecer en inglés. Solo traducir la prosa circundante.
- **Traducir el campo `name`**: El campo `name` es el ID canónico. Nunca traducirlo.
- **Traducir valores de etiquetas**: Las etiquetas en `metadata.tags` permanecen en inglés para consistencia entre idiomas.
- **Terminología inconsistente**: Usar la misma traducción para un término técnico en todo el archivo y entre archivos del mismo idioma.
- **Traducción literal de modismos**: Traducir el significado, no las palabras. "Common Pitfalls" debe convertirse en el equivalente natural del idioma, no una traducción palabra por palabra.
- **Falta de `source_commit`**: Sin este campo, el seguimiento de frescura se rompe. Siempre incluirlo.
- **Exceder 500 líneas**: Las traducciones pueden expandirse ~10-20% respecto al inglés. Si se acerca al límite, ajustar la prosa en lugar de eliminar contenido.

## Habilidades Relacionadas

- [create-skill](../create-skill/SKILL.md) — comprender la estructura SKILL.md que se está traduciendo
- [review-skill-format](../review-skill-format/SKILL.md) — validar la estructura de la habilidad traducida
- [evolve-skill](../evolve-skill/SKILL.md) — actualizar habilidades que han cambiado desde la traducción
- **Rendimiento en lote sobre calidad**: La salida solo de andamiaje, donde los encabezados están traducidos pero el texto del cuerpo permanece en inglés, no es una traducción válida. Prefiere menos traducciones completas en lugar de muchas parciales.
