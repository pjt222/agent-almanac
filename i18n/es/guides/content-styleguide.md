---
title: "Content Styleguide"
description: "Canonical markdown formatting conventions for skills, agents, teams, and guides — tables, code fences, headings, lists, and links"
category: reference
agents: [skill-reviewer]
teams: []
skills: [create-skill, review-skill-format]
locale: es
source_locale: en
source_commit: 3a22685a
translator: "Claude + human review"
translation_date: "2026-06-04"
---

# Content Styleguide

Esta guía define las convenciones canónicas de **formato markdown** para cada archivo de contenido del repositorio — skills (`skills/*/SKILL.md`), agents (`agents/*.md`), teams (`teams/*.md`) y guides (`guides/*.md`). Los cuatro archivos `_template.md` cubren la *estructura* (secciones requeridas, campos del frontmatter); esta guía cubre el *formato* (cómo se escribe el markdown dentro de esas secciones).

Las reglas siguientes codifican el **estilo dominante ya existente** para que el corpus se lea de forma consistente y se renderice correctamente en todos los lugares donde se consume — GitHub, el sitio estático y el renderizador de páginas de la CLI. No son aspiracionales: donde una convención ya es casi universal (tablas con pipe inicial, viñetas con `-`), esta guía la registra en lugar de inventar una nueva.

## Cuándo Usar Esta Guía

- Al crear un nuevo skill, agent, team o guide y querer acertar con el formato a la primera
- Al revisar un PR de contenido y necesitar una referencia objetiva de formato
- Al editar un archivo existente sin tener claro qué estilo de tabla o de fence usar
- Al escribir o ampliar una verificación de CI que valida el formato del contenido
- Al resolver un desacuerdo sobre "qué estilo es el correcto"

## Requisitos Previos

- Familiaridad con [GitHub-Flavored Markdown](https://github.github.com/gfm/) (GFM)
- El `_template.md` correspondiente al tipo de contenido que estás escribiendo (la estructura va primero; esta guía afina el formato)
- Para skills: [create-skill](../skills/create-skill/SKILL.md) y [creating-skills](creating-skills.md)
- Para agents y teams: [agent-best-practices](agent-best-practices.md) y [creating-agents-and-teams](creating-agents-and-teams.md)

## Resumen del Flujo de Trabajo

Aplica estas convenciones mientras escribes, no como una limpieza posterior. La verificación de CI (`validate-content-style.yml`) impone las reglas detectables mecánicamente en los PR de contenido — consulta [Cumplimiento](#cumplimiento). La estructura (frontmatter, secciones requeridas) corresponde a las plantillas y a los validadores específicos de cada tipo; esta guía rige el formato markdown que reside dentro de esa estructura.

## Tablas

Usa tablas con pipes de GFM. Tres reglas, todas ya seguidas por la mayoría del corpus:

1. **Fila separadora compacta** — exactamente tres guiones por columna: `|---|---|---|`. **No** rellenes los guiones para igualar el ancho de columna. La salida renderizada ignora el número de guiones, así que los separadores "decorativos" igualados al ancho solo inflan la fuente y generan diffs ruidosos.
2. **Usa siempre pipes inicial y final** — `| a | b |`, nunca `a | b`. Ambos son válidos en GFM; la forma con pipe inicial es el estándar del corpus.
3. **Marcadores de alineación solo cuando aporten significado** — añade `:---` (izquierda), `---:` (derecha) o `:---:` (centro) únicamente cuando la alineación tenga significado (p. ej. alinear a la derecha una columna numérica). En caso contrario, omítelos.

Correcto:

```markdown
| Input | Type | Description |
|---|---|---|
| Layout spec | Configuration | Canvas dimensions and margins |
| Style params | CSS | Colors, fonts, stroke widths |
```

Incorrecto:

```markdown
| Input        | Type          | Description                    |
|--------------|---------------|--------------------------------|
| Layout spec  | Configuration | Canvas dimensions and margins  |
Style params | CSS | Colors, fonts, stroke widths
```

El ejemplo "incorrecto" muestra ambos antipatrones: guiones decorativos igualados al ancho (fila 2) y un pipe inicial ausente (fila 4).

## Code Fences (Bloques de Código Delimitados)

- **Etiqueta siempre el lenguaje** en el fence de apertura: `bash`, `r`, `yaml`, `json`, `python`, `markdown`, `text`, `console`, `diff`. Usa `text` (o `console` para sesiones de shell con prompts/salida) cuando ningún lenguaje encaje — nunca dejes la etiqueta vacía.
- **Usa bloques delimitados** (` ``` `), no bloques de código indentados (con 4 espacios). Los bloques delimitados llevan una etiqueta de lenguaje y son inequívocos.
- **El código R** usa llamadas cualificadas con el paquete — `devtools::check()`, no `library(devtools); check()` — según la convención de R de todo el repositorio. Esta guía no reformula las reglas de R; consulta [creating-skills](creating-skills.md).
- Para mostrar un bloque delimitado *dentro* de un ejemplo, envuelve el ejemplo en un fence de cuatro backticks para que los triples backticks internos se rendericen literalmente.

Correcto:

```bash
npm run update-readmes
```

Incorrecto (sin etiqueta — pierde el resaltado de sintaxis y es más difícil de leer):

````markdown
```
npm run update-readmes
```
````

## Encabezados

- **Estilo ATX** (`#`), con un único espacio tras las almohadillas: `## Section`, nunca `##Section` ni subrayados Setext.
- **Un único `#` (H1) por archivo**, reservado para el título del documento. Todos los demás encabezados son H2 o inferiores.
- **Sin saltarse niveles** — un H2 va seguido de H2 o H3, nunca saltando directamente a H4.
- **Sin almohadillas finales** — `## Section`, no `## Section ##`.
- Respeta los nombres de sección que prescribe el `_template.md` correspondiente; esta guía rige su *forma*, no sus *nombres*.

## Listas, Énfasis y Código en Línea

- **Las listas no ordenadas usan `-`** (guion), no `*` ni `+`. El guion es el estándar del corpus por amplio margen.
- **Las listas ordenadas usan `1.`** con un punto. Para los pasos de procedimiento, sigue el patrón de pasos numerados de la plantilla.
- **Los elementos de lista anidados se indentan con dos espacios** bajo su elemento padre.
- **La negrita** es `**text**`; la *cursiva* es `*text*`. No uses `__` ni `_` para el énfasis.
- **El código en línea** usa backticks simples para rutas de archivo, comandos, identificadores y nombres de campo: `skills/_registry.yml`, `total_skills`, `devtools::check()`.
- Los pasos de procedimiento de los skills conservan la convención de bloques `**Expected:**` / `**On failure:**` definida por la plantilla de skills — esta guía no la modifica.

## Enlaces

- **Los enlaces en línea** son la opción por defecto: `[label](path)`. Los enlaces de estilo referencia solo son aceptables cuando el mismo destino se reutiliza muchas veces en un mismo documento.
- **Usa rutas relativas** para los enlaces internos del repositorio, ancladas a la propia ubicación del archivo:
  - skill → skill: `[name](../other-skill/SKILL.md)`
  - guide → agent: `[name](../agents/name.md)`
  - guide → skill: `[name](../skills/name/SKILL.md)`
  - guide → guide: `[name](other-guide.md)`
- **Verifica que el destino exista** antes de enlazar. Los enlaces relativos rotos son un error de contenido.
- Usa texto de enlace descriptivo, no URLs desnudas ni "haz clic aquí".

## Citas y Avisos

- Usa las citas con `>` con moderación — para citas genuinas o apartes breves.
- Prefiere las **etiquetas en línea en negrita** para el énfasis (`**Note:**`, `**Warning:**`) frente a una sintaxis de aviso recargada, en consonancia con el uso existente.

## Convenciones de Línea y de Archivo

- **Los finales de línea son LF** (`\n`). El `.gitattributes` del repositorio exige `*.md text eol=lf`; el filtro de limpieza de git normaliza CRLF a LF en cada `git add`. Escribir con CRLF produce un diff de casi todo el archivo en el primer commit (el diff de "normalización CRLF→LF") — escribe en LF para evitarlo.
- **Termina cada archivo con un único salto de línea final.**
- **El frontmatter** es YAML delimitado por `---`, mantenido en el orden que prescribe la plantilla. No reordenes ni elimines campos requeridos.
- **Sin tabulaciones duras** en el texto del cuerpo markdown; usa espacios.
- Ajusta el texto de forma flexible en los límites naturales de las frases. **No hay un límite de columna fijo ni una regla de una-frase-por-línea** — no reajustes párrafos existentes solo por la longitud de línea.

## Cumplimiento

El workflow `validate-content-style.yml` se ejecuta en los PR que tocan `skills/`, `agents/`, `teams/`, `guides/` o `i18n/`. Está deliberadamente dividido según la fiabilidad con que cada regla puede detectarse a partir de un diff:

| Regla | Modo | Por qué |
|---|---|---|
| Separadores con guiones decorativos | **Bloquea** (en líneas añadidas) | Las filas separadoras se autoidentifican y no dependen del contexto — la detección línea a línea es fiable |
| Code fences sin etiqueta | **Avisa** | Un fence de apertura no se distingue de uno de cierre a partir de una sola línea de diff; la detección fiable requiere el estado de fences de todo el archivo |
| Pipe inicial ausente | Documentado, no impuesto | Ya seguido al 100% en todo el corpus |

Las verificaciones de bloqueo evalúan **solo las líneas añadidas**, de modo que editar un archivo heredado no obliga a normalizar sus infracciones preexistentes. La normalización de todo el corpus — reescribir todas las tablas existentes y añadir etiquetas de lenguaje a ~280 archivos — se rastrea por separado; cuando se aplique, la verificación de fences sin etiqueta pasará de avisar a bloquear con análisis del estado de fences de todo el archivo.

## Resolución de Problemas

| Problema | Causa | Solución |
|---|---|---|
| Diff enorme en una edición de una línea | El blob CRLF se normaliza a LF en `git add` | Es lo esperado; añade una nota al pie en el PR. Escribe en LF |
| CI marca una tabla que no cambiaste | La línea añadida resulta ser un separador decorativo | Convierte ese separador a `|---|---|`; solo se revisan las líneas añadidas |
| El ejemplo delimitado se renderiza como un único bloque | Los ` ``` ` internos no están escapados | Envuelve el ejemplo en un fence de cuatro backticks |
| Enlace relativo roto | Número incorrecto de segmentos `../` | Cuenta los segmentos desde el propio directorio del archivo |

## Recursos Relacionados

- [create-skill](../skills/create-skill/SKILL.md) -- creación de skills (estructura + procedimiento)
- [review-skill-format](../skills/review-skill-format/SKILL.md) -- validación del formato de skills
- [creating-skills](creating-skills.md) -- flujo de trabajo de creación de skills y convenciones de R
- [creating-agents-and-teams](creating-agents-and-teams.md) -- flujo de trabajo de creación de agents y teams
- [agent-best-practices](agent-best-practices.md) -- diseño de agents y orientación sobre calidad
- [skill-reviewer](../agents/skill-reviewer.md) -- agent que revisa el formato del contenido
