---
name: review-codebase
description: >
  Revisión profunda de base de código en múltiples fases con clasificaciones
  de gravedad y resultados estructurados. Cubre arquitectura, seguridad,
  calidad del código y UX/accesibilidad en un único pase coordinado. Produce
  una tabla de hallazgos priorizada apta para su conversión directa a issues
  de GitHub mediante la habilidad create-github-issues.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: review, code-quality, architecture, security, accessibility, codebase
---

# Revisar Base de Código

Revisión profunda de base de código en múltiples fases que produce hallazgos con clasificación de gravedad y recomendaciones de orden de corrección. A diferencia de `review-pull-request` (limitado a un diff) o revisiones de un solo dominio (`security-audit-codebase`, `review-software-architecture`), esta habilidad cubre un proyecto completo o subproyecto en todas las dimensiones de calidad en un solo pase.

## Cuándo Usar

- Revisión de todo el proyecto o subproyecto (no limitada a una PR)
- Incorporación a una nueva base de código — construyendo un modelo mental de lo que existe y lo que necesita atención
- Comprobaciones periódicas de salud después de un desarrollo sostenido
- Control de calidad previo al lanzamiento en arquitectura, seguridad, calidad del código y UX
- Cuando el resultado debe alimentar directamente la creación de issues o la planificación de sprints

## Entradas

- **Obligatorio**: `target_path` — directorio raíz de la base de código o subproyecto a revisar
- **Opcional**:
  - `scope` — qué fases ejecutar: `full` (predeterminado), `security`, `architecture`, `quality`, `ux`
  - `output_format` — `findings` (solo tabla), `report` (narrativa), `both` (predeterminado)
  - `severity_threshold` — gravedad mínima a incluir: `LOW` (predeterminado), `MEDIUM`, `HIGH`, `CRITICAL`

## Procedimiento

### Paso 1: Censo

Inventariar la base de código para establecer el alcance e identificar los objetivos de revisión.

1. Contar archivos por lenguaje/tipo: `find target_path -type f | sort by extension`
2. Medir los recuentos totales de líneas por lenguaje
3. Identificar directorios de pruebas y estimar la cobertura de pruebas (archivos con pruebas vs. sin pruebas)
4. Verificar el estado de dependencias: archivos de bloqueo presentes, dependencias desactualizadas, vulnerabilidades conocidas
5. Anotar el sistema de construcción, la configuración CI/CD y el estado de la documentación
6. Registrar el censo como la sección inicial del informe

**Esperado:** Un inventario factual — recuentos de archivos, lenguajes, presencia de pruebas, salud de dependencias. Sin juicios aún.

**En caso de fallo:** Si la ruta objetivo está vacía o es inaccesible, detenerse e informar. Si subdirectorios específicos son inaccesibles, anotarlos y continuar con lo que está disponible.

### Paso 2: Revisión Arquitectónica

Evaluar la salud estructural: acoplamiento, duplicación, flujo de datos y separación de responsabilidades.

1. Mapear la estructura de módulos/directorios e identificar el patrón arquitectónico principal
2. Verificar la duplicación de código — lógica repetida en archivos, patrones de copia-pega
3. Evaluar el acoplamiento — cuántos archivos deben cambiar para una sola modificación de característica
4. Evaluar el flujo de datos — ¿hay límites claros entre capas (UI, lógica, datos)?
5. Identificar código muerto, exportaciones no utilizadas y archivos huérfanos
6. Verificar patrones consistentes — ¿sigue la base de código sus propias convenciones?
7. Clasificar cada hallazgo: CRITICAL, HIGH, MEDIUM o LOW

**Esperado:** Una lista de hallazgos arquitectónicos con clasificaciones de gravedad y referencias a archivos. Hallazgos comunes: duplicación de despacho de modo, capas de abstracción faltantes, dependencias circulares.

**En caso de fallo:** Si la base de código es demasiado pequeña para una revisión arquitectónica significativa (< 5 archivos), anótelo y pase al Paso 3. La revisión arquitectónica requiere suficiente código para tener estructura.

### Paso 3: Auditoría de Seguridad

Identificar vulnerabilidades de seguridad y lagunas en la codificación defensiva.

1. Escanear en busca de vectores de inyección: inyección HTML (`innerHTML`), inyección SQL, inyección de comandos
2. Revisar los patrones de autenticación y autorización (si aplica)
3. Revisar el manejo de errores — ¿los errores se tragan silenciosamente? ¿Los mensajes de error filtran datos internos?
4. Auditar las versiones de dependencias contra CVEs conocidas
5. Verificar secretos hardcodeados, claves de API o credenciales
6. Revisar la seguridad de Docker/contenedores: usuario root, puertos expuestos, secretos de construcción
7. Verificar localStorage/sessionStorage para almacenamiento de datos sensibles
8. Clasificar cada hallazgo: CRITICAL, HIGH, MEDIUM o LOW

**Esperado:** Una lista de hallazgos de seguridad con gravedad, archivos afectados y orientación de remediación. Los hallazgos CRITICAL incluyen vulnerabilidades de inyección y secretos expuestos.

**En caso de fallo:** Si no existe código relevante para la seguridad (proyecto de documentación pura), anótelo y pase al Paso 4.

### Paso 4: Calidad del Código

Evaluar la mantenibilidad, legibilidad y la codificación defensiva.

1. Identificar números mágicos y valores hardcodeados que deberían ser constantes con nombre
2. Verificar convenciones de nomenclatura consistentes en toda la base de código
3. Encontrar validación de entrada faltante en los límites del sistema
4. Evaluar los patrones de manejo de errores — ¿son consistentes? ¿Proporcionan mensajes útiles?
5. Verificar código comentado, marcadores TODO/FIXME e implementaciones incompletas
6. Revisar la calidad de las pruebas — ¿están probando el comportamiento o los detalles de implementación?
7. Clasificar cada hallazgo: CRITICAL, HIGH, MEDIUM o LOW

**Esperado:** Una lista de hallazgos de calidad enfocada en la mantenibilidad. Hallazgos comunes: números mágicos, patrones inconsistentes, guardias faltantes.

**En caso de fallo:** Si la base de código es generada o minificada, anótelo y ajuste las expectativas. El código generado tiene criterios de calidad diferentes al código escrito a mano.

### Paso 5: UX y Accesibilidad (si existe frontend)

Evaluar la experiencia de usuario y el cumplimiento de accesibilidad.

1. Verificar roles ARIA, etiquetas y landmarks en elementos interactivos
2. Verificar la navegación con teclado — ¿se pueden alcanzar todos los elementos interactivos mediante Tab?
3. Probar la gestión del foco — ¿se mueve el foco lógicamente cuando se abren/cierran paneles?
4. Verificar el diseño responsivo — probar en puntos de quiebre comunes (320px, 768px, 1024px)
5. Verificar que los ratios de contraste de color cumplen los estándares WCAG 2.1 AA
6. Verificar la compatibilidad con lectores de pantalla — ¿se anuncian los cambios de contenido dinámico?
7. Clasificar cada hallazgo: CRITICAL, HIGH, MEDIUM o LOW

**Esperado:** Una lista de hallazgos UX/a11y con referencias WCAG donde sea aplicable. Si no existe frontend, este paso produce "N/A — no frontend code detected."

**En caso de fallo:** Si existe código frontend pero no puede renderizarse (falta paso de construcción), auditar el código fuente estáticamente y anotar que las pruebas en tiempo de ejecución no fueron posibles.

### Paso 6: Síntesis de Hallazgos

Compilar todos los hallazgos en un resumen priorizado.

1. Fusionar los hallazgos de todas las fases en una sola tabla
2. Ordenar por gravedad (CRITICAL primero, luego HIGH, MEDIUM, LOW)
3. Dentro de cada nivel de gravedad, agrupar por tema (seguridad, arquitectura, calidad, UX)
4. Para cada hallazgo, incluir: gravedad, fase, archivo(s), descripción en una línea, corrección sugerida
5. Producir un orden de corrección recomendado que tenga en cuenta las dependencias entre correcciones
6. Resumir: total de hallazgos por gravedad, las 3 prioridades principales, nivel de esfuerzo estimado

**Esperado:** Una tabla de hallazgos con columnas: `#`, `Gravedad`, `Fase`, `Archivo(s)`, `Hallazgo`, `Corrección`. Una recomendación de orden de corrección que tenga en cuenta las dependencias (p. ej., "refactorizar la arquitectura antes de añadir pruebas").

**En caso de fallo:** Si no se produjeron hallazgos, esto en sí mismo es un hallazgo — ya sea que la base de código sea excepcionalmente limpia o que la revisión fuera demasiado superficial. Reexaminar al menos una fase con una inspección más profunda.

## Validación

- [ ] Todas las fases solicitadas fueron completadas (o explícitamente omitidas con justificación)
- [ ] Cada hallazgo tiene una clasificación de gravedad (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Cada hallazgo hace referencia a al menos un archivo o directorio
- [ ] La tabla de hallazgos está ordenada por gravedad
- [ ] Las recomendaciones de orden de corrección tienen en cuenta las dependencias entre hallazgos
- [ ] El resumen incluye recuentos totales por gravedad
- [ ] Si `output_format` incluye `report`, las secciones narrativas acompañan la tabla

## Escalado con Descanso

Entre fases de revisión, use `/rest` como punto de control — especialmente entre las fases 2-5, que requieren diferentes perspectivas analíticas. Un descanso de punto de control (breve, de transición) evita que el impulso de una fase sesgue la siguiente. Consulte la sección "Scaling Rest" de la habilidad `rest` para orientación sobre el descanso de punto de control frente al descanso completo.

## Errores Comunes

- **Hervir el océano**: Revisar cada línea de una base de código grande produce ruido. Enfóquese en las áreas de alto impacto: puntos de entrada, límites de seguridad y costuras arquitectónicas
- **Inflación de gravedad**: No todo hallazgo es CRITICAL. Reserve CRITICAL para vulnerabilidades explotables y riesgos de pérdida de datos. La mayoría de los problemas arquitectónicos son MEDIUM
- **Perder el bosque por los árboles**: Los problemas individuales de calidad del código importan menos que los patrones sistémicos. Si los números mágicos aparecen en 20 archivos, ese es un hallazgo arquitectónico, no 20 hallazgos de calidad
- **Saltarse el censo**: El censo (Paso 1) parece burocrático pero evita revisar código que no existe o pasar por alto directorios completos
- **Sangrado entre fases**: Hallazgos de seguridad durante la revisión arquitectónica, o hallazgos de calidad durante la auditoría de seguridad. Anótelos para la fase correcta en lugar de mezclar preocupaciones — produce una tabla de hallazgos más limpia

## Habilidades Relacionadas

- `security-audit-codebase` — auditoría de seguridad profunda cuando la fase de seguridad de review-codebase revela vulnerabilidades complejas
- `review-software-architecture` — revisión arquitectónica detallada para subsistemas específicos
- `review-ux-ui` — auditoría exhaustiva de UX/accesibilidad más allá de lo que cubre la fase 5
- `review-pull-request` — revisión limitada al diff para cambios individuales
- `clean-codebase` — implementa las correcciones de calidad del código identificadas por esta revisión
- `create-github-issues` — convierte la tabla de hallazgos en issues de GitHub rastreados
