---
name: test-team-coordination
description: >
  Ejecutar un escenario de prueba contra un equipo, observando los
  comportamientos del patrón de coordinación, evaluando los criterios de
  aceptación y generando un RESULT.md estructurado. Usar al validar que
  el patrón de coordinación de un equipo produce los comportamientos
  esperados durante una tarea realista, comparar patrones de coordinación
  en cargas de trabajo equivalentes, o establecer el rendimiento base para
  una composición de equipo.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: natural
  tags: review, testing, teams, coordination, validation
---

# Probar Coordinación de Equipos

Ejecutar un escenario de prueba de `tests/scenarios/teams/` contra el equipo
objetivo. Observar los comportamientos del patrón de coordinación, evaluar los
criterios de aceptación, puntuar el rúbrica y producir un `RESULT.md` en
`tests/results/`.

## Cuándo Usar

- Validar que el patrón de coordinación de un equipo produce los comportamientos esperados
- Ejecutar una prueba estructurada después de modificar una definición de equipo o agente
- Comparar patrones de coordinación ejecutando el mismo escenario con diferentes equipos
- Establecer métricas de rendimiento base para una composición de equipo
- Pruebas de regresión después de añadir nuevos agentes o cambiar la membresía del equipo

## Entradas

- **Obligatorio**: Ruta al archivo de escenario de prueba (p. ej., `tests/scenarios/teams/test-opaque-team-cartographers-audit.md`)
- **Opcional**: Anulación del ID de ejecución (predeterminado: `YYYY-MM-DD-<target>-NNN` generado automáticamente)
- **Opcional**: Anulación del tamaño del equipo (predeterminado: del frontmatter del escenario)
- **Opcional**: Omitir cambio de alcance (predeterminado: false — inyectar cambio de alcance si está definido)

## Procedimiento

### Paso 1: Cargar y Validar el Escenario de Prueba

1.1. Leer el archivo de escenario de prueba especificado en la entrada.

1.2. Analizar el frontmatter YAML y extraer:
   - `target` — el equipo a probar
   - `coordination-pattern` — el patrón esperado
   - `team-size` — número de miembros a instanciar
   - Tabla de criterios de aceptación
   - Rúbrica de puntuación (si está presente)
   - Datos de referencia (si están presentes)

1.3. Verificar que el archivo de escenario tiene todas las secciones obligatorias:
   - Objective (Objetivo)
   - Pre-conditions (Precondiciones)
   - Task (Tarea, con subsección Primary Task)
   - Expected Behaviors (Comportamientos Esperados)
   - Acceptance Criteria (Criterios de Aceptación)
   - Observation Protocol (Protocolo de Observación)

**Esperado:** El archivo de escenario se carga, analiza y contiene todas las secciones obligatorias.

**En caso de fallo:** Si el archivo falta o no puede analizarse, abortar con un mensaje de error que identifique el archivo faltante o la sección malformada. Si faltan secciones opcionales (Rubric, Ground Truth, Variants), anotar su ausencia y continuar.

### Paso 2: Verificar las Precondiciones

2.1. Recorrer cada casilla de precondición en el escenario.

2.2. Para las verificaciones de existencia de archivos, usar Glob para verificar.

2.3. Para las verificaciones de recuento del registro, analizar el `_registry.yml` relevante y comparar `total_*` con los recuentos reales de archivos en disco.

2.4. Para las verificaciones de estado de rama/git, ejecutar `git status --porcelain` y `git branch --show-current`.

**Esperado:** Se satisfacen todas las precondiciones.

**En caso de fallo:** Si alguna precondición falla, registrarla como BLOQUEADA en los resultados. Decidir si continuar (precondición blanda) o abortar (precondición estricta como el archivo del equipo objetivo faltante). Documentar la decisión.

### Paso 3: Cargar los Criterios del Patrón de Coordinación

3.1. Leer `tests/_registry.yml` y localizar la entrada `coordination_patterns` que coincide con el valor `coordination-pattern` del escenario.

3.2. Extraer la lista `key_behaviors` para este patrón.

3.3. Estos comportamientos se convierten en la lista de verificación de observación — cada uno debe observarse durante la ejecución y registrarse como observado/no observado.

**Esperado:** Los comportamientos clave del patrón cargados y listos para la observación.

**En caso de fallo:** Si el patrón de coordinación no está definido en el registro, usar la sección Expected Behaviors del escenario como única fuente de observación. Registrar una advertencia.

### Paso 4: Ejecutar la Tarea

4.1. Crear el directorio de resultados: `tests/results/YYYY-MM-DD-<target>-NNN/`.

4.2. Registrar T0 (marca de tiempo de inicio de tarea).

4.3. Instanciar el equipo objetivo usando TeamCreate con el tamaño de equipo del escenario. Pasar el prompt de la Tarea Principal literalmente desde la sección Task del escenario.

4.4. Observar las fases de ejecución del equipo. Registrar marcas de tiempo para:
   - T1: Evaluación de forma / descomposición de tareas completa
   - T2: Asignaciones de roles visibles

4.5. Si el escenario define un Desencadenador de Cambio de Alcance y omitir-cambio-de-alcance es false:
   - Esperar hasta que la Fase 2 (asignación de roles) sea visible
   - Registrar T3 (marca de tiempo de inyección del cambio de alcance)
   - Enviar el prompt del cambio de alcance al equipo mediante SendMessage
   - Registrar T4 (cambio de alcance absorbido — ajuste de roles visible)

4.6. Continuar observando hasta que el equipo entregue su resultado.
   - Registrar T5 (comienza la integración)
   - Registrar T6 (informe final entregado)

4.7. Capturar el resultado completo del equipo.

**Esperado:** El equipo ejecuta la tarea a través de las fases de su patrón de coordinación. Las marcas de tiempo se registran para todas las transiciones. El cambio de alcance (si aplica) se inyecta y absorbe.

**En caso de fallo:** Si el equipo no produce resultados, registrar el punto de fallo y cualquier mensaje de error. Si el equipo se detiene, anotar la última fase observada y el tiempo de espera. Proceder a la evaluación con resultados parciales.

### Paso 5: Evaluar los Comportamientos del Patrón

5.1. Para cada comportamiento clave del Paso 3, determinar si fue observado durante la ejecución:
   - **Observado**: Evidencia clara en el resultado o la coordinación del equipo
   - **Parcial**: Alguna evidencia pero incompleta o ambigua
   - **No observado**: Sin evidencia

5.2. Para cada comportamiento específico de la tarea de la sección Expected Behaviors del escenario, aplicar la misma evaluación.

5.3. Registrar los hallazgos en el registro de observación.

**Esperado:** Todos o la mayoría de los comportamientos específicos del patrón y de la tarea son observados.

**En caso de fallo:** Los comportamientos no observados son hallazgos, no fallos del procedimiento de prueba. Registrarlos con precisión — indican que el patrón de coordinación no se manifestó completamente.

### Paso 6: Evaluar los Criterios de Aceptación

6.1. Recorrer cada criterio de aceptación del escenario.

6.2. Para cada criterio, asignar una determinación:
   - **PASS**: Criterio claramente cumplido con evidencia observable
   - **PARTIAL**: Criterio parcialmente cumplido (cuenta hacia el umbral con peso 0.5)
   - **FAIL**: Criterio no cumplido a pesar de la oportunidad
   - **BLOCKED**: No se pudo evaluar (fallo de precondición, tiempo de espera del equipo, etc.)

6.3. Si el escenario incluye datos de Ground Truth, verificar los hallazgos reportados contra ellos:
   - Calcular porcentajes de precisión por categoría
   - Señalar los falsos positivos y los falsos negativos

6.4. Si el escenario incluye una Rúbrica de Puntuación, puntuar cada dimensión del 1 al 5 con breve justificación.

6.5. Calcular métricas de resumen:
   - Aceptación: X/N criterios superados (PARTIAL cuenta como 0.5)
   - Umbral: PASS si >= umbral definido en el escenario
   - Total de rúbrica: X/Y puntos (si aplica)

**Esperado:** Todos los criterios de aceptación tienen una determinación. Se calculan las métricas de resumen.

**En caso de fallo:** Si menos de la mitad de los criterios pueden evaluarse (demasiados BLOCKED), la ejecución de la prueba es inconclusa. Documentar por qué y recomendar volver a ejecutar después de corregir las precondiciones.

### Paso 7: Generar RESULT.md

7.1. Crear `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md` usando la Plantilla de Registro del Protocolo de Observación del escenario.

7.2. Rellenar todas las secciones:
   - Metadatos de ejecución (observador, marcas de tiempo, duración)
   - Registro de fases con todas las marcas de tiempo registradas
   - Registro de emergencia de roles (para pruebas adaptativas/de equipo)
   - Tabla de resultados de criterios de aceptación
   - Tabla de puntuaciones de rúbrica (si aplica)
   - Tabla de verificación de ground truth (si aplica)
   - Observaciones clave (narrativa)
   - Lecciones aprendidas

7.3. Incluir el resultado completo del equipo como apéndice o en un archivo separado (`team-output.md`) en el mismo directorio de resultados.

7.4. Añadir un veredicto de resumen en la parte superior:
   ```
   **Verdict**: PASS | FAIL | INCONCLUSIVE
   **Score**: X/N criteria (Y/Z rubric points)
   **Duration**: Xm
   ```

**Esperado:** RESULT.md completo con todas las secciones rellenadas y un veredicto claro.

**En caso de fallo:** Si el archivo de resultados no puede escribirse, imprimir los resultados en stdout como alternativa. Los datos de evaluación nunca deben perderse.

## Validación

- [ ] Archivo de escenario de prueba cargado y todas las secciones obligatorias presentes
- [ ] Precondiciones verificadas (o documentadas como BLOCKED)
- [ ] Comportamientos clave del patrón de coordinación cargados desde el registro
- [ ] Equipo instanciado y tarea entregada
- [ ] Cambio de alcance inyectado en el momento correcto (si aplica)
- [ ] Todos los comportamientos específicos del patrón evaluados (observado/parcial/no observado)
- [ ] Todos los criterios de aceptación tienen una determinación (PASS/PARTIAL/FAIL/BLOCKED)
- [ ] Verificación de ground truth completada (si aplica)
- [ ] RESULT.md generado con todas las secciones rellenadas
- [ ] Veredicto de resumen calculado y registrado

## Errores Comunes

- **Evaluar la calidad del resultado en lugar de la coordinación**: Esta habilidad prueba *cómo coordina el equipo*, no si el resultado de la tarea es perfecto. Un equipo que coordina bien pero encuentra solo 7/9 referencias rotas aún demuestra el patrón.
- **Inyectar el cambio de alcance demasiado pronto**: Esperar hasta que la asignación de roles sea claramente visible antes de inyectar el cambio de alcance. Demasiado pronto significa que el equipo aún no se ha diferenciado, por lo que no hay nada que adaptar.
- **Confundir el resultado del miembro del equipo con el resultado del equipo**: El equipo opaco debe presentar un resultado unificado. Si ve informes individuales de los miembros, eso es un hallazgo sobre la opacidad, no un problema de infraestructura de pruebas.
- **Coincidencia exacta de ground truth**: Los recuentos de ground truth son aproximados. Evaluar si los hallazgos están en el rango correcto, no si coinciden exactamente.
- **Olvidar registrar las marcas de tiempo**: Las marcas de tiempo son esenciales para medir las duraciones de las fases y la velocidad de adaptación. Establecerlas a medida que ocurren los eventos, no retroactivamente.

## Habilidades Relacionadas

- `review-codebase` — revisión profunda de base de código que complementa las pruebas a nivel de equipo
- `review-skill-format` — valida el formato de habilidades individuales (esta habilidad valida la coordinación del equipo)
- `create-team` — crea definiciones de equipo que esta habilidad prueba
- `evolve-team` — evoluciona las definiciones de equipo basándose en los hallazgos de las pruebas
- `test-a2a-interop` — patrón de pruebas similar para la conformidad del protocolo A2A
- `assess-form` — la evaluación mórfica que usa internamente el líder del equipo opaco
