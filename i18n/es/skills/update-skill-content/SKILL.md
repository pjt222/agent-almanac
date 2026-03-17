---
name: update-skill-content
description: >
  Actualizar el contenido de un SKILL.md existente para mejorar su precisión,
  completitud y claridad. Cubre el incremento de versión, el refinamiento de
  procedimientos, la expansión de errores comunes y la sincronización de
  habilidades relacionadas. Usar cuando los procedimientos de una habilidad
  hacen referencia a herramientas o APIs desactualizadas, la sección de
  Errores Comunes es escasa, las Referencias Relacionadas tienen
  referencias cruzadas rotas, o después de recibir retroalimentación de que
  los procedimientos de una habilidad son poco claros o incompletos.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, content, update, maintenance, quality
---

# Actualizar Contenido de Habilidad

Mejorar un SKILL.md existente refinando los pasos del procedimiento, ampliando los Errores Comunes con modos de fallo reales, sincronizando la sección de Habilidades Relacionadas e incrementando el número de versión. Úsela después de que una habilidad supere la validación de formato pero tenga lagunas de contenido, referencias desactualizadas o procedimientos incompletos.

## Cuándo Usar

- Los pasos del procedimiento de una habilidad hacen referencia a herramientas, APIs o números de versión desactualizados
- La sección de Errores Comunes es escasa (menos de 3 errores) o carece de modos de fallo reales
- La sección de Habilidades Relacionadas tiene referencias cruzadas rotas o le faltan enlaces relevantes
- Los pasos del procedimiento carecen de ejemplos de código concretos o tienen instrucciones vagas
- Se ha añadido una nueva habilidad a la biblioteca que debería referenciarse cruzadamente desde habilidades existentes
- Después de recibir retroalimentación de que los procedimientos de una habilidad son poco claros o incompletos

## Entradas

- **Obligatorio**: Ruta al archivo SKILL.md a actualizar
- **Opcional**: Sección(es) específica(s) en las que enfocarse (p. ej., "procedure", "pitfalls", "related-skills")
- **Opcional**: Fuente de las actualizaciones (registro de cambios, informe de incidencia, retroalimentación del usuario)
- **Opcional**: Si incrementar la versión (predeterminado: sí, incremento menor)

## Procedimiento

### Paso 1: Leer la Habilidad Actual y Evaluar la Calidad del Contenido

Leer el SKILL.md completo y evaluar cada sección en cuanto a completitud y precisión.

Criterios de evaluación por sección:
- **When to Use**: ¿Son los desencadenantes concretos y accionables? (se esperan 3-5 elementos)
- **Inputs**: ¿Están los tipos, valores predeterminados y obligatorio/opcional claramente separados?
- **Procedure**: ¿Tiene cada paso código concreto, Expected y On failure?
- **Validation**: ¿Son los elementos de la lista de verificación objetivamente verificables? (se esperan 5+ elementos)
- **Common Pitfalls**: ¿Son los errores específicos con síntomas y soluciones? (se esperan 3-6)
- **Related Skills**: ¿Existen las habilidades referenciadas? ¿Faltan habilidades relacionadas obvias?

**Esperado:** Una imagen clara de qué secciones necesitan mejora, con lagunas específicas identificadas.

**En caso de fallo:** Si la habilidad no puede leerse (error de ruta), verifique la ruta. Si el SKILL.md tiene frontmatter YAML roto, corrija primero el frontmatter usando `review-skill-format` antes de intentar actualizaciones de contenido.

### Paso 2: Verificar las Referencias Desactualizadas

Escanear los pasos del procedimiento en busca de referencias a versiones específicas, nombres de herramientas, URLs y patrones de API que puedan haber cambiado.

Indicadores comunes de desactualización:
- Números de versión específicos (p. ej., `v1.24`, `R 4.3.0`, `Node 18`)
- URLs que puedan haberse movido o expirado
- Indicadores CLI o sintaxis de comandos que hayan cambiado
- Nombres de paquetes que hayan sido renombrados o descontinuados
- Formatos de archivos de configuración que hayan evolucionado

```bash
# Verificar referencias a versiones específicas
grep -nE '[vV][0-9]+\.[0-9]+' skills/<skill-name>/SKILL.md

# Verificar URLs
grep -nE 'https?://' skills/<skill-name>/SKILL.md
```

**Esperado:** Una lista de referencias potencialmente desactualizadas con números de línea. Cada referencia es verificada como actual o marcada para actualización.

**En caso de fallo:** Si hay demasiadas referencias para verificar manualmente, priorice: bloques de código en el procedimiento primero (los más propensos a causar fallos en tiempo de ejecución), luego Errores Comunes (pueden referenciar soluciones antiguas), luego texto informativo.

### Paso 3: Actualizar los Pasos del Procedimiento para Mayor Precisión

Para cada paso del procedimiento identificado como necesitado de mejora:

1. Verificar que los bloques de código aún se ejecutan correctamente o reflejan las mejores prácticas actuales
2. Añadir oraciones de contexto faltantes que expliquen *por qué* se necesita el paso
3. Asegurarse de que los comandos concretos usan rutas reales, indicadores reales y resultados reales
4. Actualizar los bloques Expected para que coincidan con el comportamiento actual de las herramientas
5. Actualizar los bloques On failure con mensajes de error actuales y soluciones

Al actualizar los bloques de código, preserve la estructura original:
- Mantener la numeración de pasos consistente
- Mantener el formato `### Step N: Título`
- No reordenar los pasos a menos que el orden original fuera incorrecto

**Esperado:** Todos los pasos del procedimiento contienen código actual y ejecutable. Los bloques Expected/On failure reflejan el comportamiento actual real.

**En caso de fallo:** Si no está seguro de si un bloque de código sigue siendo correcto, añada una nota: `<!-- TODO: Verify this command against current version -->`. No elimine bloques de código que funcionen para reemplazarlos con alternativas no probadas.

### Paso 4: Ampliar los Errores Comunes

Revisar la sección de Errores Comunes y ampliarla si existen lagunas.

Criterios de calidad para los errores:
- Cada error tiene un **nombre en negrita** seguido de una descripción específica
- La descripción incluye el *síntoma* (qué sale mal) y la *solución* (cómo evitarlo o recuperarse)
- Los errores provienen de modos de fallo reales, no de preocupaciones hipotéticas
- El rango objetivo es de 3-6 errores

Fuentes para nuevos errores:
- Pasos del procedimiento con bloques On failure complejos (probablemente son errores)
- Habilidades relacionadas que advierten sobre las mismas herramientas o patrones
- Problemas comunes reportados por usuarios del procedimiento

**Esperado:** 3-6 errores, cada uno con un síntoma específico y una solución. Sin errores genéricos como "tenga cuidado" o "pruebe exhaustivamente".

**En caso de fallo:** Si solo se pueden identificar 1-2 errores, esto es aceptable para habilidades de complejidad básica. Para habilidades intermedias y avanzadas, menos de 3 errores sugiere que el autor no ha explorado completamente los modos de fallo — señalarlo para expansión futura.

### Paso 5: Sincronizar la Sección de Habilidades Relacionadas

Verificar que todas las referencias cruzadas en la sección de Habilidades Relacionadas son válidas y añadir los enlaces que falten.

1. Para cada habilidad referenciada, verificar que existe:
   ```bash
   # Verificar si la habilidad referenciada existe
   test -d skills/referenced-skill-name && echo "EXISTS" || echo "NOT FOUND"
   ```
2. Buscar habilidades que hagan referencia a esta habilidad (deberían estar referenciadas cruzadamente):
   ```bash
   # Encontrar habilidades que referencian esta habilidad
   grep -rl "skill-name" skills/*/SKILL.md
   ```
3. Verificar habilidades relacionadas obvias basándose en el dominio y las etiquetas
4. Usar el formato: `- \`skill-id\` — descripción en una línea de la relación`

**Esperado:** Todas las habilidades referenciadas existen en disco. Las referencias cruzadas bidireccionales están en su lugar. Sin enlaces huérfanos.

**En caso de fallo:** Si una habilidad referenciada no existe, elimine la referencia o anótela como una habilidad futura planificada con un comentario. Si muchas habilidades referencian esta pero no están listadas en Habilidades Relacionadas, añada las 2-3 más relevantes.

### Paso 6: Incrementar la Versión en el Frontmatter

Actualizar el campo `metadata.version` siguiendo el versionado semántico:
- **Incremento de parche** (1.0 a 1.1): Correcciones de errores tipográficos, aclaraciones menores, actualizaciones de URLs
- **Incremento menor** (1.0 a 2.0): Nuevos pasos de procedimiento, adiciones significativas de contenido, cambios estructurales
- **Nota**: Las habilidades usan versionado simplificado de dos partes (mayor.menor)

También actualice cualquier campo de fecha si está presente en el frontmatter.

**Esperado:** La versión se incrementa apropiadamente. La magnitud del cambio coincide con el alcance de la actualización.

**En caso de fallo:** Si la versión actual no puede analizarse, establézcala en `"1.1"` y añada un comentario señalando la brecha en el historial de versiones.

## Validación

- [ ] Todos los pasos del procedimiento contienen código actual y ejecutable o instrucciones concretas
- [ ] Sin referencias de versión desactualizadas, URLs o nombres de herramientas descontinuadas
- [ ] Cada paso del procedimiento tiene los bloques **Expected:** y **On failure:**
- [ ] La sección de Errores Comunes tiene 3-6 errores específicos con síntomas y soluciones
- [ ] Todas las referencias cruzadas de Habilidades Relacionadas apuntan a habilidades existentes
- [ ] Las referencias cruzadas bidireccionales están en su lugar para habilidades estrechamente relacionadas
- [ ] La versión en el frontmatter ha sido incrementada apropiadamente
- [ ] El recuento de líneas permanece por debajo de 500 después de las actualizaciones
- [ ] El SKILL.md sigue superando la validación de `review-skill-format` después de los cambios

## Errores Comunes

- **Actualizar código sin probarlo**: Cambiar un comando en un paso del procedimiento sin verificar que funciona es peor que dejar el comando antiguo. Cuando no esté seguro, añada un comentario de verificación en lugar de un reemplazo no probado.
- **Exceder en errores**: Añadir 10+ errores diluye la sección. Mantenga los 3-6 más impactantes; mueva los casos extremos a un archivo `references/` si es necesario.
- **Romper referencias cruzadas durante las actualizaciones**: Al renombrar una habilidad o cambiar su dominio, haga grep en toda la biblioteca de habilidades en busca de referencias al nombre antiguo. Use `grep -rl "old-name" skills/` para encontrar todas las ocurrencias.
- **Olvidar incrementar la versión**: Cada actualización de contenido, por pequeña que sea, debe incrementar la versión. Esto permite a los consumidores detectar cuándo ha cambiado una habilidad.
- **Expansión del alcance hacia la refactorización**: Las actualizaciones de contenido mejoran *lo que dice* la habilidad. Si se encuentra restructurando secciones o extrayendo a `references/`, cambie a la habilidad `refactor-skill-structure` en su lugar.

## Habilidades Relacionadas

- `review-skill-format` — Ejecutar la validación de formato antes de las actualizaciones de contenido para asegurar que la estructura base es sólida
- `refactor-skill-structure` — Cuando las actualizaciones de contenido empujan la habilidad por encima de las 500 líneas, refactorizar la estructura para hacer espacio
- `evolve-skill` — Para cambios más profundos que van más allá de las actualizaciones de contenido (p. ej., crear una variante avanzada)
- `create-skill` — Referencia la especificación de formato canónico al añadir nuevas secciones o pasos de procedimiento
- `repair-broken-references` — Usar para reparación masiva de referencias cruzadas en toda la biblioteca de habilidades
