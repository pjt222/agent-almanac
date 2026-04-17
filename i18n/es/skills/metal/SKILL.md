---
name: metal
description: >
  Extract the conceptual essence of a repository as skills, agents, and teams —
  the project's roles, procedures, and coordination patterns expressed as
  agentskills.io-standard definitions. Reads an arbitrary codebase and produces
  generalized definitions that capture WHAT the project does and WHO operates it,
  without replicating HOW it does it. Use when onboarding to a new codebase and
  wanting to understand its conceptual architecture, when bootstrapping an
  agentic system from an existing project, when studying a project's organizational
  DNA for cross-pollination, or when creating a skill/agent/team library inspired
  by a reference implementation.
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: natural
  tags: alchemy, extraction, essence, meta, skills, agents, teams, conceptual, metallurgy
  locale: es
  source_locale: en
  source_commit: 82164ccfe1cf7e9c42dd8a45e4f1a8df950350fc
  translator: claude
  translation_date: "2026-03-17"
---

# Metal

Extraer el ADN conceptual de un repositorio — sus roles, procedimientos y patrones de coordinación — como definiciones generalizadas de agentskills.io. Como extraer metal noble del mineral, la habilidad separa lo que un proyecto ES (su esencia) de lo que HACE (su implementación), produciendo definiciones reutilizables de habilidades, agentes y equipos que capturan el genoma organizativo del proyecto sin reproducir su base de código.

## Cuándo Usar

- Al incorporarse a una nueva base de código y querer mapear su arquitectura conceptual antes de sumergirse en el código
- Al arrancar un sistema agéntico desde un proyecto existente — convirtiendo flujos de trabajo implícitos en definiciones explícitas de habilidad/agente/equipo
- Al estudiar el ADN organizativo de un proyecto para polinización cruzada hacia otros proyectos
- Al crear una biblioteca de habilidades/agentes/equipos inspirada en una implementación de referencia sin copiarla
- Al comprender lo que la estructura de un proyecto revela sobre los modelos mentales y la experiencia de dominio de sus creadores

## Entradas

- **Requerido**: Ruta al repositorio o directorio raíz del proyecto
- **Requerido**: Declaración de propósito — ¿por qué se extrae la esencia? (incorporación, arranque, estudio o polinización cruzada)
- **Opcional**: Dominios de enfoque — áreas específicas del proyecto en las que concentrarse (por defecto: todos)
- **Opcional**: Profundidad de salida — `survey` (solo prospección + ensayo), `extract` (procedimiento completo) o `report` (extracción + informe escrito) (por defecto: `extract`)
- **Opcional**: Máximo de extracciones — límite del total de habilidades + agentes + equipos a producir (por defecto: 15)

## La Prueba del Mineral

El criterio central de calidad para toda extracción:

> **¿Podría este concepto existir en una implementación completamente diferente?**
>
> Si SÍ — es **metal** (esencia). Extraerlo.
> Si NO — es **ganga** (detalle de implementación). Dejarlo atrás.

Ejemplo: El concepto de una aplicación meteorológica "integrar fuente de datos externa" es metal — se aplica a cualquier proyecto que obtenga datos de terceros. Pero "parsear la respuesta JSON de OpenWeatherMap v3" es ganga — es específico de una API.

Las habilidades extraídas deben describir la CLASE de tarea, no la instancia específica. Los agentes extraídos deben describir el ROL, no la persona. Los equipos extraídos deben describir el PATRÓN DE COORDINACIÓN, no el organigrama.

## Procedimiento

### Paso 1: Prospectar — Reconocer el Cuerpo Mineral

Reconocer la estructura del repositorio sin juzgar. Mapear el terreno antes de minar.

1. Explorar el árbol de directorios para entender la forma del proyecto:
   - Directorios fuente y su patrón de organización (por funcionalidad, por capa, por dominio)
   - Archivos de configuración: `package.json`, `DESCRIPTION`, `setup.py`, `Cargo.toml`, `go.mod`, `Makefile`
   - Documentación: `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, documentos de arquitectura
   - CI/CD: `.github/workflows/`, `Dockerfile`, configuraciones de despliegue
   - Directorios de pruebas y su estructura
2. Leer la autodescripción del proyecto (README, manifiesto de paquete) para entender su propósito declarado
3. Contar archivos por tipo/lenguaje para estimar el alcance e identificar la tecnología principal
4. Identificar el límite del proyecto — dónde comienza y termina, de qué depende versus qué proporciona
5. Producir el **Informe de Prospección**:

```
Project: [name]
Declared Purpose: [from README/manifest]
Languages: [primary, secondary]
Size: [file count, approx LOC]
Shape: [monorepo/library/app/framework/docs]
External Surface: [CLI/API/UI/library exports/none]
```

**Esperado:** Un reconocimiento factual — qué hay aquí, qué tan grande es, qué dice ser el proyecto. Sin clasificación ni juicio aún. El informe se lee como un estudio geológico, no como una reseña.

**En caso de fallo:** Si el repositorio no tiene README ni manifiesto, inferir el propósito a partir de nombres de directorios, contenido de archivos y descripciones de pruebas. Si el proyecto es demasiado grande (>1000 archivos fuente), reducir el alcance a los directorios más activos (usar frecuencia del log de git o referencias del README).

### Paso 2: Ensayar — Analizar la Composición

Leer archivos representativos para entender qué HACE el proyecto a nivel conceptual.

1. Muestrear 5-10 archivos representativos de diferentes áreas del proyecto — no exhaustivo, sino diverso:
   - Puntos de entrada (archivos principales, manejadores de rutas, comandos CLI)
   - Lógica central (los módulos más importados o más referenciados)
   - Pruebas (revelan el comportamiento previsto más claramente que la implementación)
   - Configuración (revela preocupaciones operativas y contexto de despliegue)
2. Para cada área muestreada, identificar:
   - **Dominios**: ¿Qué áreas temáticas toca el proyecto? (ej., "autenticación", "transformación de datos", "reportes")
   - **Verbos**: ¿Qué acciones realiza el proyecto? (ej., "validar", "transformar", "desplegar", "notificar")
   - **Roles**: ¿A qué actores humanos o de sistema sirve el código? (ej., "ingeniero de datos", "usuario final", "revisor")
   - **Flujos**: ¿Qué secuencias de acciones forman flujos de trabajo? (ej., "ingestar -> validar -> transformar -> almacenar")
3. Para cada hallazgo, clasificar como:
   - **Esencial**: Existiría en cualquier implementación que resuelva este problema
   - **Accidental**: Específico de las elecciones tecnológicas de esta implementación
4. Producir el **Informe de Ensayo**: una tabla de dominios, verbos, roles y flujos con etiquetas esencial/accidental

**Esperado:** Un mapa conceptual del proyecto que se lee como un glosario de dominio, no como un recorrido por el código. Alguien no familiarizado con el stack tecnológico debería entender qué hace el proyecto a partir de este informe.

**En caso de fallo:** Si la base de código es opaca (metaprogramación pesada, código generado u ofuscado), apoyarse en las pruebas y la documentación en lugar del código fuente. Si no existen pruebas, leer los mensajes de commit para entender la intención.

### Paso 3: Meditar — Liberar el Sesgo de Implementación

Hacer una pausa para limpiar el anclaje cognitivo de haber leído código.

1. Notar qué framework, lenguaje o patrón arquitectónico está dominando el modelo mental — etiquetarlo
2. Liberar el apego al CÓMO: "Este proyecto usa React" se convierte en "Este proyecto tiene una capa de interfaz de usuario." "Esto usa PostgreSQL" se convierte en "Esto tiene almacenamiento estructurado persistente."
3. Para cada hallazgo en el Informe de Ensayo, aplicar la Prueba del Mineral:
   - "integrar fuente de datos externa" — ¿podría existir en cualquier lugar? SÍ -> metal
   - "configurar interceptores de Axios" — ¿podría existir en cualquier lugar? NO -> ganga
4. Reescribir cualquier hallazgo que no pase la Prueba del Mineral a un nivel de abstracción superior
5. Si múltiples perspectivas ayudan, considerar el proyecto a través de estas lentes:
   - **Arqueólogo**: ¿Qué revela la estructura del código sobre los modelos mentales de sus creadores?
   - **Biólogo**: ¿Cuál es el genoma replicable versus el fenotipo específico?
   - **Teórico musical**: ¿Cuál es la forma (sonata, rondó) versus las notas específicas?
   - **Cartógrafo**: ¿Qué nivel de abstracción captura la topología útil?

**Esperado:** El Informe de Ensayo ahora está libre de lenguaje específico de framework. Cada hallazgo pasa la Prueba del Mineral. Los conceptos se sienten portables — podrían aplicarse a un proyecto en cualquier lenguaje o framework.

**En caso de fallo:** Si el sesgo persiste (los hallazgos siguen referenciando tecnologías específicas), intentar invertir: "Si este proyecto fuera reescrito en un stack completamente diferente, ¿qué conceptos sobrevivirían?" Solo esos son metal.

### Paso 4: Fundir — Separar el Metal de la Escoria

El paso central de extracción. Clasificar cada concepto esencial en habilidades, agentes o equipos.

1. Para cada concepto esencial del Informe de Ensayo purificado, determinar su tipo:

```
Classification Criteria:
+--------+----------------------------+----------------------------+----------------------------+
| Type   | What to Look For           | Naming Convention          | Test Question              |
+--------+----------------------------+----------------------------+----------------------------+
| SKILL  | Repeatable procedures,     | Verb-first kebab-case:     | "Could an agent follow     |
|        | workflows, transformations | validate-input,            | this as a step-by-step     |
|        | with clear inputs/outputs  | deploy-artifact            | procedure?"                |
+--------+----------------------------+----------------------------+----------------------------+
| AGENT  | Persistent roles, domain   | Noun/role kebab-case:      | "Does this require ongoing |
|        | expertise, judgment calls, | data-engineer,             | context, expertise, or a   |
|        | communication styles       | quality-reviewer           | specific communication     |
|        |                            |                            | style?"                    |
+--------+----------------------------+----------------------------+----------------------------+
| TEAM   | Multi-role coordination,   | Group descriptor:          | "Does this need more than  |
|        | handoffs, reviews,         | pipeline-ops,              | one distinct perspective   |
|        | parallel workstreams       | review-board               | to accomplish?"            |
+--------+----------------------------+----------------------------+----------------------------+
```

2. Para cada elemento extraído:
   - Asignar un **nombre generalizado** — no específico del proyecto. "UserAuthService" se convierte en `identity-manager` (agente). "deployToAWS()" se convierte en `deploy-artifact` (habilidad).
   - Escribir una **descripción de una línea** que tenga sentido sin conocer el proyecto fuente
   - Anotar el **concepto fuente** del que se deriva (para trazabilidad, no reproducción)
   - Aplicar la Prueba del Mineral una última vez

3. Protegerse contra errores comunes de clasificación:
   - No toda función es una habilidad — buscar PROCEDIMIENTOS, no operaciones individuales
   - No todo módulo es un agente — buscar ROLES que requieran juicio
   - No toda colaboración es un equipo — buscar PATRONES DE COORDINACIÓN con especialidades distintas
   - La mayoría de proyectos producen 3-8 habilidades, 2-4 agentes y 0-2 equipos. Si se tienen 20+, se está extrayendo demasiado fino.

**Esperado:** Un inventario clasificado donde cada elemento tiene un tipo (habilidad/agente/equipo), un nombre generalizado y una descripción de una línea. Ningún elemento referencia las tecnologías específicas, APIs o estructuras de datos del proyecto fuente.

**En caso de fallo:** Si la clasificación es ambigua (¿es esto una habilidad o un agente?), preguntar: "¿Se trata de HACER algo (habilidad) o de SER alguien que hace cosas (agente)?" Una habilidad es una receta; un agente es un chef. Si aún no está claro, optar por habilidad — las habilidades son más fáciles de componer después.

### Paso 5: Sanar — Verificar la Calidad de la Extracción

Evaluar si la extracción es honesta — ni demasiado ni demasiado poco.

1. **Verificación de sobre-extracción**: Leer cada definición extraída y preguntar:
   - ¿Podría alguien reconstruir la lógica propietaria del proyecto original a partir de esto? -> Demasiado detalle
   - ¿Esto referencia bibliotecas, APIs, esquemas de base de datos o rutas de archivos específicos? -> Aún es ganga
   - ¿Es un procedimiento de implementación completo o un esbozo a nivel conceptual? -> Debería ser esbozo

2. **Verificación de sub-extracción**: Mostrar solo las definiciones extraídas (sin el proyecto fuente) y preguntar:
   - ¿Podría alguien entender qué TIPO de proyecto inspiró estas? -> Debería ser sí
   - ¿Las definiciones capturan la naturaleza esencial del proyecto? -> Debería ser sí
   - ¿Hay capacidades importantes del proyecto no representadas? -> Debería ser no

3. **Verificación de generalización**: Para cada definición:
   - ¿El nombre tendría sentido en un stack tecnológico diferente? -> Debería ser sí
   - ¿La descripción es agnóstica al framework? -> Debería ser sí
   - ¿Esta definición podría ser útil para un proyecto en un dominio completamente diferente? -> Idealmente sí

4. **Verificación de balance**: Revisar las proporciones de extracción:
   - 3-8 habilidades, 2-4 agentes, 0-2 equipos es típico para un proyecto enfocado
   - Menos de 3 extracciones totales sugiere sub-extracción
   - Más de 15 totales sugiere sobre-extracción o generalización insuficiente

**Esperado:** Confianza en que la extracción está al nivel correcto de abstracción. Cada definición es una semilla que podría crecer en tierra diferente, no un esqueje que solo sobrevive en el jardín original.

**En caso de fallo:** Si hay sobre-extracción, elevar el nivel de abstracción — fusionar habilidades específicas en unas más amplias, colapsar agentes similares en un solo rol. Si hay sub-extracción, regresar al Paso 2 y muestrear archivos adicionales. Si la verificación de generalización falla, eliminar referencias tecnológicas y reescribir descripciones.

### Paso 6: Moldear — Verter el Metal en Moldes

Producir los documentos de salida en estándar agentskills.io.

1. Para cada **habilidad** extraída, escribir una definición esquelética:

```yaml
# Skill: [generalized-name]
name: [generalized-name]
description: [one-line, framework-agnostic]
domain: [closest domain from the 52 existing domains, or suggest a new one]
complexity: [basic/intermediate/advanced]
# Concept-level procedure (3-5 steps, NOT full implementation):
# Step 1: [high-level action]
# Step 2: [high-level action]
# Step 3: [high-level action]
# Derived from: [source concept in original project]
```

2. Para cada **agente** extraído, escribir una definición esquelética:

```yaml
# Agent: [role-name]
name: [role-name]
description: [one-line purpose]
tools: [minimal tool set needed]
skills: [list of extracted skills this agent would carry]
# Derived from: [source role/module in original project]
```

3. Para cada **equipo** extraído, escribir una definición esquelética:

```yaml
# Team: [group-name]
name: [group-name]
description: [one-line purpose]
lead: [lead agent from extracted agents]
members: [list of member agents]
coordination: [hub-and-spoke/sequential/parallel/adaptive]
# Derived from: [source workflow/process in original project]
```

4. Compilar todas las extracciones en el **Informe de Ensayo** — un documento único con secciones para Habilidades, Agentes y Equipos, más una tabla resumen

**Esperado:** Un informe estructurado que contiene todas las definiciones extraídas en formato agentskills.io. Cada definición es esquelética (a nivel conceptual, no a nivel de implementación) y podría servir como punto de partida para que las habilidades `create-skill`, `create-agent` o `create-team` la completen.

**En caso de fallo:** Si la salida excede 15 elementos, priorizar por centralidad — mantener los conceptos más únicos del dominio del proyecto. Los conceptos genéricos (como "manage-configuration") que existen en la mayoría de proyectos deberían descartarse a menos que tengan un giro inusual.

### Paso 7: Templar — Validación Final

Verificar la extracción completa y producir el resumen.

1. Contar las extracciones: N habilidades, N agentes, N equipos
2. Evaluar la cobertura: ¿abarcan los dominios principales del proyecto?
3. Verificar independencia: leer cada definición SIN el contexto del proyecto fuente — ¿se sostiene por sí sola?
4. Ejecutar la Prueba del Mineral una última vez sobre el conjunto completo:

```
Temper Assessment:
+-----+---------------------------+----------+------------------------------------+
| #   | Name                      | Type     | Ore Test Result                    |
+-----+---------------------------+----------+------------------------------------+
| 1   | [name]                    | skill    | PASS / FAIL (reason)               |
| 2   | [name]                    | agent    | PASS / FAIL (reason)               |
| ... | ...                       | ...      | ...                                |
+-----+---------------------------+----------+------------------------------------+
```

5. Producir el resumen final:
   - Total de extracciones (habilidades / agentes / equipos)
   - Evaluación de cobertura (qué dominios del proyecto están representados)
   - Nivel de confianza (alto / medio / bajo) con justificación
   - Próximos pasos sugeridos: qué definiciones extraídas están listas para desarrollar primero

**Esperado:** Un Informe de Ensayo validado con una tabla resumen, evaluación de confianza y próximos pasos accionables. El informe es autocontenido — alguien que nunca ha visto el proyecto fuente puede leerlo y entender los conceptos extraídos.

**En caso de fallo:** Si más del 20% de los elementos fallan la Prueba del Mineral final, regresar al Paso 4 (Fundir) y re-extraer a un nivel de abstracción superior. Si la cobertura está por debajo del 60% de los dominios identificados, regresar al Paso 2 (Ensayar) y muestrear archivos adicionales.

## Validación

- [ ] El informe de prospección cubre estructura del proyecto, lenguajes, tamaño y propósito declarado
- [ ] El ensayo identifica dominios, verbos, roles y flujos con clasificación esencial/accidental
- [ ] El punto de control de meditación limpia el sesgo de implementación — sin lenguaje específico de framework en las salidas
- [ ] Cada elemento extraído pasa la Prueba del Mineral (esencia, no detalle de implementación)
- [ ] Las habilidades se nombran con verbos, los agentes con sustantivos, los equipos con descriptores grupales
- [ ] Todos los nombres están generalizados — sin referencias específicas del proyecto
- [ ] La cantidad de extracciones está dentro del rango típico (5-15 total, no 1 ni 30)
- [ ] Las definiciones de salida siguen el formato agentskills.io (frontmatter + secciones)
- [ ] Las verificaciones de sobre-extracción y sub-extracción pasan
- [ ] La evaluación final de Temple incluye conteo, cobertura, confianza y próximos pasos
- [ ] El Informe de Ensayo completo es comprensible sin acceso al proyecto fuente

## Errores Comunes

- **Espejear la estructura de directorios**: Producir una habilidad por archivo fuente en lugar de extraer conceptos transversales. El metal debería reflejar la estructura CONCEPTUAL del proyecto, no su sistema de archivos. Un proyecto de 20 archivos no tiene 20 habilidades.
- **Culto al framework**: Extraer "configure-nextjs-api-routes" en lugar de "define-api-endpoints". Eliminar el framework; mantener el patrón. La Prueba del Mineral detecta esto: "¿Podría existir sin Next.js?" Si no, es ganga.
- **Inflación de roles**: Crear un agente para cada módulo. La mayoría de proyectos tienen 2-5 roles genuinos que requieren experiencia distinta, no 20. Buscar diferencias de JUICIO y ESTILO DE COMUNICACIÓN, no solo diferencias funcionales.
- **Saltarse la Prueba del Mineral**: El modo de fallo más importante. Cada salida debe pasar: "¿Podría este concepto existir en una implementación completamente diferente?" Si referencia bibliotecas, APIs o esquemas de datos específicos, es escoria, no metal.
- **Producir guías de implementación**: Las habilidades extraídas deben ser esbozos a NIVEL CONCEPTUAL (3-5 pasos de alto nivel), no procedimientos completos de implementación. Son semillas para desarrollar con `create-skill`, no productos terminados. Una extracción de 50 pasos es una reproducción, no una esencia.
- **Sub-generalizar nombres**: "UserAuthService" es un nombre de clase, no un concepto. "identity-manager" es un rol. "manage-user-identity" es una habilidad. Generalizar de lo específico a lo universal.
- **Ignorar patrones de coordinación**: Los equipos son los más difíciles de extraer porque la coordinación a menudo es implícita. Buscar flujos de trabajo de revisión de código, pipelines de despliegue, transferencias de datos entre sistemas y cadenas de aprobación — estos revelan estructuras de equipo.

## Habilidades Relacionadas

- `athanor` — Cuando metal revela que el proyecto necesita transformación, no solo extracción de esencia
- `chrysopoeia` — Extracción de valor a nivel de código; metal trabaja a nivel conceptual por encima del código
- `transmute` — Convertir conceptos extraídos entre dominios o paradigmas
- `create-skill` — Desarrollar esbozos de habilidades extraídas en implementaciones completas de SKILL.md
- `create-agent` — Desarrollar esbozos de agentes extraídos en definiciones completas de agente
- `create-team` — Desarrollar esbozos de equipos extraídos en composiciones completas de equipo
- `observe` — Observación más profunda cuando la fase de prospección revela un dominio no familiar
- `analyze-codebase-for-mcp` — Complementario: metal extrae conceptos, analyze-codebase-for-mcp extrae superficies de herramientas
- `review-codebase` — Complementario: metal extrae esencia, review-codebase evalúa calidad
