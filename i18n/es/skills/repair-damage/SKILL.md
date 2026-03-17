---
name: repair-damage
description: >
  Implementar recuperación regenerativa usando triaje, andamiaje y reconstrucción
  progresiva. Cubre evaluación de daños, clasificación de heridas, estabilización
  de emergencia, gestión de tejido cicatricial y fortalecimiento de resiliencia
  para sistemas que han sufrido daño estructural. Usar cuando un sistema ha
  sufrido un incidente que necesita recuperación estructurada, cuando una
  transformación fallida dejó el sistema en un estado intermedio dañado, cuando
  la deuda técnica acumulada ha causado falla parcial, o cuando un sistema es
  funcional pero degradado y la degradación está empeorando.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, repair, regeneration, resilience, wound-healing
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Repair Damage

Implementar recuperación regenerativa para sistemas que han sufrido daño estructural — ya sea por incidentes, migraciones fallidas, negligencia acumulada o disrupciones externas. Usa la cicatrización biológica de heridas como marco: triaje, estabilización, andamiaje, reconstrucción progresiva y gestión de tejido cicatricial.

## Cuándo Usar

- Un sistema ha sufrido un incidente y necesita recuperación estructurada más allá de "solo arréglalo"
- Una transformación fallida (ver `adapt-architecture`) dejó el sistema en un estado intermedio dañado
- La deuda técnica acumulada ha causado falla parcial del sistema
- El daño organizacional (partidas del equipo, pérdida de conocimiento, colapso moral) necesita reparación estructurada
- Recuperación post-defensa (ver `defend-colony`) cuando la colonia sufrió daño
- Un sistema es funcional pero degradado, y la degradación está empeorando

## Entradas

- **Requerido**: Descripción del daño (qué se rompió, cuándo, con qué gravedad)
- **Requerido**: Estado actual del sistema (qué sigue funcionando, qué no)
- **Opcional**: Causa raíz (si se conoce — puede no estar clara aún)
- **Opcional**: Estado del sistema pre-daño (para comparación)
- **Opcional**: Recursos disponibles para reparación (tiempo, personas, presupuesto)
- **Opcional**: Urgencia (¿el sistema se está degradando activamente o está estable pero dañado?)

## Procedimiento

### Paso 1: Triaje — Evaluar y Clasificar Heridas

Evaluar rápidamente todo el daño y clasificar por gravedad y urgencia.

1. Catalogar cada punto de daño conocido:
   - ¿Qué componente, función o capacidad específica está afectada?
   - ¿El daño es completo (no funcional) o parcial (degradado)?
   - ¿El daño se está propagando (afectando componentes adyacentes) o está contenido?
2. Clasificar cada herida:

```
Wound Classification:
┌──────────┬──────────────────────┬────────────────────────────────────┐
│ Class    │ Severity             │ Response                           │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Critical │ Core function lost,  │ Immediate: stop bleeding, activate │
│          │ data at risk,        │ backup, redirect traffic, page     │
│          │ actively spreading   │ on-call team                       │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Serious  │ Important function   │ Urgent: fix within hours/days,     │
│          │ degraded, no spread  │ workarounds acceptable short-term  │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Moderate │ Non-critical function│ Scheduled: fix within sprint,      │
│          │ affected, contained  │ prioritize against other work      │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Minor    │ Cosmetic or edge     │ Backlog: fix when convenient,      │
│          │ case, no user impact │ may self-resolve                   │
└──────────┴──────────────────────┴────────────────────────────────────┘
```

3. Priorizar el orden de reparación:
   - Heridas críticas primero (detener la hemorragia)
   - Luego heridas serias (restaurar función importante)
   - Heridas moderadas y menores pueden esperar reparación programada
4. Verificar interacción entre heridas:
   - ¿Algunas heridas se amplifican mutuamente? (A es peor porque B también está rota)
   - ¿Reparar una herida arreglaría automáticamente otras? (causa raíz compartida)
   - ¿Reparar una herida empeoraría otra? (estrategias de reparación en conflicto)

**Esperado:** Un inventario completo de heridas clasificadas por gravedad, con un orden de reparación priorizado que tiene en cuenta las interacciones entre heridas.

**En caso de fallo:** Si el triaje toma demasiado tiempo (el sistema se está degradando activamente), omitir la clasificación detallada y enfocarse en: "¿Cuál es la única cosa más crítica a estabilizar?" Arreglar eso primero, luego volver al triaje completo.

### Paso 2: Estabilización de Emergencia

Detener la propagación del daño antes de comenzar la reparación.

1. Contener la herida:
   - Aislar componentes dañados (circuit breakers, segmentación de red, redireccionamiento de tráfico)
   - Prevenir cascada: deshabilitar funcionalidades no esenciales que dependen de componentes dañados
   - Preservar evidencia: tomar snapshots, guardar logs, capturar el estado actual antes de cualquier cambio
2. Aplicar parches de emergencia:
   - Estos no son arreglos permanentes — son torniquetes
   - Medidas de emergencia aceptables:
     - Redirigir tráfico a una réplica saludable
     - Deshabilitar completamente la funcionalidad dañada
     - Aplicar una configuración conocida que funcione desde respaldo
     - Escalar componentes saludables para absorber carga redirigida
   - Medidas de emergencia inaceptables:
     - Modificar código sin probar (crea nuevas heridas)
     - Eliminar datos para "resetear" el problema (destruye opciones de recuperación)
     - Ocultar el daño (deshabilitar alertas, suprimir errores)
3. Verificar estabilización:
   - ¿El daño sigue propagándose? Si sí, la contención falló — intentar un aislamiento más amplio
   - ¿El sistema es funcional (posiblemente degradado)? Si sí, proceder a reparación
   - ¿Los parches de emergencia se mantienen? Si sí, hay tiempo para reparación deliberada

**Esperado:** El sistema está estable (no se degrada activamente) aunque esté degradado. El daño está contenido y no se propaga. La evidencia está preservada para análisis de causa raíz.

**En caso de fallo:** Si la estabilización falla (el daño sigue propagándose a pesar de la contención), escalar a respaldo completo del sistema: activar recuperación ante desastres, cambiar a sistema de respaldo, o degradar graciosamente a operación mínima viable. Una estabilización que toma demasiado tiempo se convierte en el desastre.

### Paso 3: Construir Andamiaje de Reparación

Construir las estructuras temporales que soportan el proceso de reparación.

1. Configurar un entorno de reparación:
   - Crear rama o copia del sistema dañado para trabajo de reparación
   - Asegurar que los cambios de reparación puedan probarse antes de aplicarlos a producción
   - Crear un plan de reversión para cada paso de reparación
2. Construir infraestructura de diagnóstico:
   - Monitoreo mejorado en áreas dañadas (detectar regresión inmediatamente)
   - Registro que capture el proceso de reparación (qué se cambió, cuándo, por qué)
   - Herramientas de comparación: estado pre-daño vs. actual vs. post-reparación
3. Diseñar la secuencia de reparación:
   - Para cada herida (en orden de prioridad del triaje):
     a. Identificación de causa raíz (¿por qué se rompió esto?)
     b. Enfoque de reparación (arreglar la causa, no solo el síntoma)
     c. Método de verificación (¿cómo confirmar que la reparación funcionó?)
     d. Verificación de regresión (¿la reparación rompió algo más?)
4. Identificar riesgo de tejido cicatricial:
   - Las reparaciones hechas bajo presión frecuentemente introducen tejido cicatricial (soluciones temporales, casos especiales, deuda técnica)
   - Planificar la gestión del tejido cicatricial (Paso 5) desde el inicio

**Esperado:** Un entorno de reparación con capacidad de diagnóstico, un plan de reparación secuenciado y conciencia del riesgo de tejido cicatricial.

**En caso de fallo:** Si configurar un entorno de reparación adecuado es demasiado lento (la urgencia del sistema demanda cambios inmediatos en producción), aplicar cambios directamente pero con disciplina extrema: un cambio a la vez, probado con los medios disponibles, revertido si no ayuda.

### Paso 4: Ejecutar Reconstrucción Progresiva

Reparar daños sistemáticamente, verificando cada corrección antes de proceder.

1. Para cada herida (en orden de prioridad del triaje):
   a. Identificar causa raíz:
      - ¿Es un error de código? ¿Error de configuración? ¿Corrupción de datos? ¿Fallo de dependencia?
      - ¿Es esto un síntoma de un problema estructural más profundo?
      - ¿Arreglar la causa raíz también abordaría otras heridas?
   b. Implementar la reparación:
      - Arreglar la causa raíz, no solo el síntoma
      - Si la causa raíz no puede arreglarse inmediatamente, implementar una solución temporal deliberada y documentarla
      - Mantener las reparaciones mínimas — arreglar lo que está roto, no refactorizar el vecindario
   c. Verificar la reparación:
      - ¿La función específica dañada funciona correctamente ahora?
      - ¿La reparación pasa las pruebas automatizadas?
      - ¿La salud general del sistema mejoró o al menos no cambió?
   d. Verificar regresión:
      - ¿Esta reparación rompió algo más?
      - ¿Los parches de emergencia del Paso 2 siguen siendo necesarios, o algunos pueden removerse?
2. Después de que todas las heridas críticas y serias estén reparadas:
   - Remover parches de emergencia que ya no sean necesarios
   - Restaurar funcionalidades deshabilitadas
   - Retornar el tráfico a enrutamiento normal
3. Programar reparación de heridas moderadas y menores:
   - Estas entran en el flujo de trabajo de desarrollo normal
   - Rastrearlas hasta completarse (no dejar que se conviertan en daño "aceptado")

**Esperado:** Las heridas críticas y serias están reparadas con correcciones verificadas. Los parches de emergencia están removidos. El sistema está restaurado a operación funcional.

**En caso de fallo:** Si un intento de reparación falla o causa regresión, revertir al estado anterior y reevaluar. Si múltiples intentos de reparación fallan para la misma herida, el daño puede ser demasiado profundo para reparación local — considerar si el componente afectado necesita reemplazo completo en lugar de reparación (ver `dissolve-form`).

### Paso 5: Gestionar Tejido Cicatricial y Fortalecer

Abordar las soluciones temporales y atajos introducidos durante la reparación de emergencia, y fortalecer contra recurrencia.

1. Inventariar tejido cicatricial:
   - Parches de emergencia que se volvieron permanentes
   - Soluciones temporales que nunca se reemplazaron con arreglos adecuados
   - Casos especiales agregados para manejar casos límite relacionados con el daño
   - Funcionalidades deshabilitadas que nunca se reactivaron
2. Para cada pieza de tejido cicatricial, decidir:
   - **Remover**: la solución temporal ya no es necesaria (el daño está completamente reparado)
   - **Reemplazar**: la solución temporal aborda una necesidad real pero debería implementarse correctamente
   - **Aceptar**: la solución temporal es la solución a largo plazo más práctica (raro, documentar por qué)
3. Fortalecer contra recurrencia:
   - Análisis de causa raíz: ¿por qué ocurrió este daño?
   - Prevención: ¿qué lo habría prevenido? (monitoreo, pruebas, cambio de arquitectura)
   - Detección: ¿cómo podríamos detectar esto más rápido la próxima vez? (alertas, verificaciones de salud)
   - Recuperación: ¿cómo podríamos recuperarnos más rápido? (runbooks, procedimientos de respaldo, automatización)
4. Actualizar memoria inmunológica:
   - Agregar el patrón del incidente al monitoreo y alertas (ver memoria inmunológica de `defend-colony`)
   - Actualizar runbooks con el procedimiento de reparación que funcionó
   - Compartir aprendizajes con el equipo/organización

**Esperado:** El tejido cicatricial está gestionado (removido, reemplazado o aceptado con documentación). El sistema no solo está reparado sino más resiliente que antes del daño. Los aprendizajes están capturados para futuros incidentes.

**En caso de fallo:** Si la gestión del tejido cicatricial se desprioritiza ("funciona, no lo toques"), programarla explícitamente. El tejido cicatricial no gestionado se acumula y eventualmente contribuye al siguiente incidente. Si la causa raíz no puede identificarse, fortalecer la velocidad de detección y recuperación como controles compensatorios.

## Validación

- [ ] Todo el daño está inventariado y clasificado por gravedad
- [ ] La estabilización de emergencia detuvo la propagación del daño
- [ ] La evidencia está preservada para análisis de causa raíz
- [ ] Las heridas críticas y serias están reparadas con correcciones verificadas
- [ ] Los parches de emergencia están removidos después de la reparación adecuada
- [ ] El tejido cicatricial está inventariado y gestionado (removido, reemplazado o documentado)
- [ ] El análisis de causa raíz identifica mejoras de prevención y detección
- [ ] La resiliencia del sistema está mejorada comparada con el estado pre-daño

## Errores Comunes

- **Reparar sin estabilizar**: Intentar arreglar la causa raíz mientras el sistema sangra activamente. Estabilizar primero, luego reparar. Torniquetes antes de cirugía
- **Parches de emergencia permanentes**: Las medidas de emergencia que se convierten en la solución permanente crean deuda técnica compuesta. Siempre dar seguimiento con reparación adecuada
- **Suposición de causa raíz**: Asumir que la causa raíz es conocida sin investigación. Muchas causas "obvias" son síntomas de problemas más profundos. Investigar antes de comprometerse con una estrategia de reparación
- **Daño inducido por reparación**: Acelerar reparaciones sin probar crea nuevas heridas. Una corrección verificada por iteración — nunca agrupar cambios no probados
- **Ignorar tejido cicatricial**: "Funciona ahora" no es lo mismo que "está saludable." El tejido cicatricial de reparaciones apresuradas es la semilla del siguiente incidente

## Habilidades Relacionadas

- `assess-form` — la evaluación de daños comparte metodología con la evaluación de forma
- `adapt-architecture` — la adaptación arquitectónica puede ser necesaria si el daño revela debilidad estructural
- `dissolve-form` — para componentes demasiado dañados para reparar; disolver y reconstruir
- `defend-colony` — la defensa activa la reparación; la recuperación post-incidente retroalimenta la defensa
- `shift-camouflage` — la adaptación superficial puede enmascarar el daño mientras la reparación procede (con precaución)
- `conduct-post-mortem` — el análisis post-incidente estructurado complementa la identificación de causa raíz
- `write-incident-runbook` — los procedimientos de reparación deben capturarse como runbooks para futuros incidentes
