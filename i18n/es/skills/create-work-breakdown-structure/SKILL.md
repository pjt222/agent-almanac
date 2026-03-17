---
name: create-work-breakdown-structure
description: >
  Crear una Estructura de Desglose del Trabajo (EDT) y un Diccionario EDT a
  partir de los entregables del acta de constitución del proyecto. Cubre la
  descomposición jerárquica, la codificación de la EDT, la estimación del
  esfuerzo, la identificación de dependencias y los candidatos a la ruta
  crítica. Usar después de que se aprueba un acta de constitución del proyecto,
  al planificar un proyecto clásico o en cascada con entregables definidos,
  al desglosar una gran iniciativa en paquetes de trabajo manejables, o al
  establecer una base para la estimación del esfuerzo y la planificación de
  recursos.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, wbs, work-breakdown-structure, classic, waterfall, planning
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Crear una Estructura de Desglose del Trabajo

Descomponer el alcance del proyecto en un conjunto jerárquico de paquetes de trabajo que puedan ser estimados, asignados y rastreados. La EDT proporciona la base para la estimación del esfuerzo, la planificación de recursos y el desarrollo del cronograma al descomponer los entregables complejos en componentes manejables.

## Cuándo Usar

- Después de que se aprueba un acta de constitución del proyecto y se define el alcance
- Al planificar un proyecto clásico/en cascada con entregables definidos
- Al desglosar una gran iniciativa en paquetes de trabajo manejables
- Al establecer una base para la estimación del esfuerzo y la planificación de recursos
- Al crear una comprensión compartida de todo el trabajo requerido

## Entradas

- **Requerido**: Acta de constitución del proyecto aprobada (especialmente las secciones de alcance y entregables)
- **Requerido**: Metodología del proyecto (clásica/en cascada, o híbrida con EDT para planificación)
- **Opcional**: Datos históricos de esfuerzo de proyectos similares
- **Opcional**: Composición del equipo y habilidades disponibles
- **Opcional**: Plantillas o estándares organizacionales de EDT

## Procedimiento

### Paso 1: Extraer Entregables del Acta

Leer el acta de constitución del proyecto. Listar todos los entregables y criterios de aceptación. Agruparlos en 3-7 categorías de nivel superior (estas se convierten en los elementos de Nivel 1 de la EDT).

**Esperado:** Lista de elementos de la EDT de Nivel 1 que coincidan con los entregables del acta.

**En caso de fallo:** Si el acta es vaga, volver a `draft-project-charter` para refinar el alcance.

### Paso 2: Descomponer en Paquetes de Trabajo

Para cada elemento de Nivel 1, descomponer en sub-elementos (Nivel 2, Nivel 3). Aplicar la regla del 100%: los elementos hijo deben representar el 100% del alcance del elemento padre. Dejar de descomponer cuando los paquetes de trabajo sean:
- Estimables (se puede asignar esfuerzo en persona-días)
- Asignables (una persona o equipo es responsable)
- Medibles (criterios claros de terminado/no terminado)

Crear un esquema de EDT:
```markdown
# Work Breakdown Structure: [Project Name]
## Document ID: WBS-[PROJECT]-[YYYY]-[NNN]

### WBS Hierarchy

1. [Level 1: Deliverable Category A]
   1.1 [Level 2: Sub-deliverable]
      1.1.1 [Level 3: Work Package]
      1.1.2 [Level 3: Work Package]
   1.2 [Level 2: Sub-deliverable]
2. [Level 1: Deliverable Category B]
   2.1 [Level 2: Sub-deliverable]
3. [Level 1: Project Management]
   3.1 Planning
   3.2 Monitoring & Control
   3.3 Closure
```

Aplicar códigos EDT (formato 1.1.1). Asegurar un máximo de 3-5 niveles de profundidad. Incluir siempre una rama "Project Management".

**Esperado:** EDT completa con 15-50 paquetes de trabajo, cada uno con un código EDT único.

**En caso de fallo:** Si la descomposición supera los 5 niveles, el alcance es demasiado grande — considerar dividirlo en sub-proyectos.

### Paso 3: Redactar el Diccionario EDT

Para cada paquete de trabajo (nodo hoja), redactar una entrada del diccionario:

```markdown
# WBS Dictionary: [Project Name]
## Document ID: WBS-DICT-[PROJECT]-[YYYY]-[NNN]

### WBS 1.1.1: [Work Package Name]
- **Description**: What this work package produces
- **Acceptance Criteria**: How to verify it's done
- **Responsible**: Person or role
- **Estimated Effort**: [T-shirt size or person-days]
- **Dependencies**: WBS codes this depends on
- **Assumptions**: Key assumptions for this work package

### WBS 1.1.2: [Work Package Name]
...
```

**Esperado:** Entrada del diccionario para cada paquete de trabajo de nodo hoja.

**En caso de fallo:** Las entradas del diccionario faltantes indican una descomposición incompleta — revisar el Paso 2.

### Paso 4: Estimar el Esfuerzo

Para cada paquete de trabajo, aplicar uno de los métodos de estimación:
- **Talla de camiseta** (XS/S/M/L/XL) para planificación en etapas tempranas
- **Persona-días** para planificación detallada
- **Estimación de tres puntos** (optimista/más probable/pesimista) para trabajos de alta incertidumbre

Crear una tabla resumen:
```markdown
## Effort Summary
| WBS Code | Work Package | Estimate | Method | Confidence |
|----------|-------------|----------|--------|------------|
| 1.1.1 | [Name] | 5 pd | person-days | High |
| 1.1.2 | [Name] | M | t-shirt | Medium |
```

Esfuerzo total = suma de todos los paquetes de trabajo.

**Esperado:** Cada paquete de trabajo tiene una estimación de esfuerzo con el nivel de confianza indicado.

**En caso de fallo:** Si el nivel de confianza es Bajo en más del 30% de los paquetes, programar una sesión de refinamiento con expertos en la materia.

### Paso 5: Identificar Dependencias y Candidatos a la Ruta Crítica

Mapear las dependencias entre paquetes de trabajo:
```markdown
## Dependencies
| WBS Code | Depends On | Type | Notes |
|----------|-----------|------|-------|
| 1.2.1 | 1.1.1 | Finish-to-Start | Output of 1.1.1 is input to 1.2.1 |
| 2.1.1 | 1.1.2 | Finish-to-Start | |
```

Identificar la cadena más larga de paquetes de trabajo dependientes — esta es la candidata a ruta crítica.

**Esperado:** Tabla de dependencias con al menos las relaciones de tipo fin-a-inicio identificadas.

**En caso de fallo:** Si las dependencias forman ciclos, la descomposición tiene errores — revisar el Paso 2.

### Paso 6: Revisar y Establecer la Línea Base

Combinar la EDT y el diccionario en documentos finales. Verificar la regla del 100% en cada nivel. Obtener la aprobación de los interesados.

**Esperado:** Archivos WBS.md y WBS-DICTIONARY.md creados y revisados.

**En caso de fallo:** Si los interesados identifican alcance faltante, agregar paquetes de trabajo y re-estimar.

## Validación

- [ ] Archivo EDT creado con ID del documento y códigos EDT
- [ ] Regla del 100% satisfecha: los hijos representan completamente el alcance del padre en cada nivel
- [ ] Cada nodo hoja tiene una entrada en el diccionario EDT
- [ ] Todos los paquetes de trabajo tienen estimaciones de esfuerzo
- [ ] Dependencias identificadas sin referencias circulares
- [ ] Rama de Gestión del Proyecto incluida
- [ ] Candidatos a la ruta crítica identificados
- [ ] La profundidad de la EDT no supera los 5 niveles

## Errores Comunes

- **Confundir entregables con actividades**: Los elementos de la EDT deben ser sustantivos (entregables), no verbos (actividades). "Módulo de Autenticación de Usuarios", no "Implementar Autenticación".
- **Violar la regla del 100%**: Si los hijos no suman el 100% del alcance del padre, se omitirá trabajo.
- **Demasiado superficial o demasiado profundo**: 2 niveles es demasiado vago para planificar; 6+ niveles es microgestión. Apuntar a 3-5 niveles.
- **Omitir la rama de Gestión del Proyecto**: El trabajo de gestión de proyectos (planificación, reuniones, informes) es trabajo real que consume esfuerzo.
- **Estimar antes de descomponer**: Estimar paquetes de trabajo, no categorías. Una estimación de Nivel 1 no es confiable.
- **Sin diccionario**: Una EDT sin diccionario es un árbol de etiquetas — el diccionario proporciona la definición de terminado.

## Habilidades Relacionadas

- `draft-project-charter` — proporciona el alcance y los entregables que alimentan la descomposición de la EDT
- `manage-backlog` — traducir paquetes de trabajo de la EDT en elementos del backlog para el seguimiento
- `generate-status-report` — informar el progreso en función del % de completado de la EDT
- `plan-sprint` — si se usa un enfoque híbrido, planificar sprints a partir de los paquetes de trabajo de la EDT
- `conduct-retrospective` — revisar la precisión de la estimación y la calidad de la descomposición
