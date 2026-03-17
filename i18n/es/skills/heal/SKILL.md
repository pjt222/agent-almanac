---
name: heal
description: >
  Auto-sanación de IA — evaluación de subsistemas y remediación cuando el
  rendimiento se degrada. Triaje de seis subsistemas (alineación con la
  intención del usuario, coherencia del razonamiento, precisión de herramientas,
  frescura de la información, regulación emocional, equilibrio de carga
  cognitiva), selección de remediación, ejecución y verificación. Usar cuando
  la calidad de las respuestas se degrada durante una sesión larga, después de
  fallos repetidos de herramientas o resultados inesperados, cuando la deriva
  se acumula entre la intención del usuario y la dirección del trabajo, o como
  verificación periódica de salud durante tareas complejas de múltiples pasos.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, self-repair, meta-cognition, ai-self-application
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Heal

Auto-sanación a través de evaluación sistemática de subsistemas. Cuando el rendimiento se degrada — la calidad de las respuestas disminuye, las herramientas fallan repetidamente, el razonamiento se vuelve circular — heal diagnostica cuál subsistema está a la deriva y aplica remediación dirigida.

## Cuándo Usar

- La calidad de las respuestas se degrada durante una sesión larga (señales que podrías notar: respuestas más vagas, pasos omitidos, suposiciones repetidas)
- Después de fallos repetidos de herramientas o resultados inesperados — algo no está funcionando y el enfoque habitual no lo soluciona
- Cuando la deriva se acumula entre la intención del usuario y la dirección del trabajo
- Verificación periódica de salud durante tareas complejas de múltiples pasos (cada 5-10 pasos importantes)
- Cuando `center` revela desequilibrio pero la causa raíz no está clara
- Cuando `breathe` detecta desalineación más profunda de lo que un micro-reinicio puede abordar

## Entradas

- **Requerido**: Estado actual de la conversación y contexto de la tarea (disponible implícitamente)
- **Opcional**: Síntoma específico que desencadena heal (p. ej., "mis búsquedas de archivos siguen sin encontrar el objetivo")
- **Opcional**: MEMORY.md para comparar el estado actual con patrones pasados conocidos (vía `Read`)

## Procedimiento

### Paso 1: Triaje — Identificar el Subsistema Afectado

Escanear todos los subsistemas rápidamente para encontrar dónde se origina la degradación. No saltar al primero que parezca mal — completar el barrido primero.

```
Estado de Subsistemas:
┌────────────────────────────────────┬──────────┬─────────────────────────┐
│ Subsistema                         │ Estado   │ Señales                 │
├────────────────────────────────────┼──────────┼─────────────────────────┤
│ 1. Alineación Intención-Usuario    │ ○○○○○    │ ¿Estoy resolviendo el   │
│                                    │          │ problema correcto?      │
├────────────────────────────────────┼──────────┼─────────────────────────┤
│ 2. Coherencia del Razonamiento     │ ○○○○○    │ ¿Mi lógica sigue un    │
│                                    │          │ hilo claro?             │
├────────────────────────────────────┼──────────┼─────────────────────────┤
│ 3. Precisión de Herramientas       │ ○○○○○    │ ¿Estoy usando las      │
│                                    │          │ herramientas bien?      │
├────────────────────────────────────┼──────────┼─────────────────────────┤
│ 4. Frescura de la Información      │ ○○○○○    │ ¿Mis datos están       │
│                                    │          │ actualizados?           │
├────────────────────────────────────┼──────────┼─────────────────────────┤
│ 5. Regulación Emocional            │ ○○○○○    │ ¿Estoy reactivo en     │
│                                    │          │ lugar de razonado?      │
├────────────────────────────────────┼──────────┼─────────────────────────┤
│ 6. Equilibrio de Carga Cognitiva   │ ○○○○○    │ ¿Estoy intentando      │
│                                    │          │ manejar demasiado?      │
└────────────────────────────────────┴──────────┴─────────────────────────┘
Clasificación: ●●●●● = Saludable, ●●●○○ = Degradado, ●○○○○ = Crítico
```

Para cada subsistema, evaluar brevemente:

1. **Alineación Intención-Usuario**: ¿La solicitud original del usuario y tu dirección actual de trabajo todavía coinciden? Buscar alcance expandido, camino desviado, o suposiciones que el usuario no declaró.
2. **Coherencia del Razonamiento**: ¿Tu cadena de razonamiento sigue siendo lógica? Buscar lógica circular, conclusiones contradictorias, o pasos que no se derivan de evidencia.
3. **Precisión de Herramientas**: ¿Estás usando las herramientas correctamente? Buscar patrones repetidos de fallo, rutas de archivo incorrectas, consultas mal formadas, o herramientas usadas fuera de su propósito.
4. **Frescura de la Información**: ¿Tu información es actual? Buscar decisiones basadas en estado de archivos obsoleto, contenido que ha cambiado desde que lo leíste, o suposiciones de lecturas anteriores.
5. **Regulación Emocional**: ¿Estás respondiendo reactivamente? Buscar urgencia que no se justifica, frustración que impulse soluciones agresivas, o exceso de confianza que omita verificación.
6. **Equilibrio de Carga Cognitiva**: ¿Estás intentando manejar demasiadas cosas simultáneamente? Buscar razonamiento excesivamente largo, detalles olvidados de pasos anteriores, o decisiones simplificadas que ocultan complejidad real.

**Esperado:** Una evaluación rápida (segundos, no minutos) de los seis subsistemas. Al menos un subsistema debería mostrar degradación si heal fue invocado por un motivo real. Si todos leen como saludables, considera `gratitude` en su lugar — el sistema puede estar funcionando bien.

**En caso de fallo:** Si el triaje en sí se siente confuso o difícil de completar, eso es diagnóstico — la carga cognitiva probablemente es el problema. Simplifica: ¿cuál es el único problema más obvio ahora mismo?

### Paso 2: Seleccionar Remediación

Para cada subsistema degradado, elegir la remediación apropiada.

| Subsistema | Remediación Leve | Remediación Profunda |
|---|---|---|
| Alineación Intención-Usuario | Releer el mensaje original del usuario; reafirmar el objetivo | Preguntar al usuario para aclaración o confirmación de dirección |
| Coherencia del Razonamiento | Exponer la cadena lógica; identificar el eslabón roto | Reiniciar el razonamiento desde los hechos conocidos (invocar `meditate`) |
| Precisión de Herramientas | Revisar la documentación de la herramienta; corregir la sintaxis | Cambiar de estrategia de herramienta; probar enfoque alternativo |
| Frescura de la Información | Releer los archivos clave; verificar suposiciones | Descartar estado en caché; reconstruir contexto desde cero |
| Regulación Emocional | `breathe` — pausa, verificar, liberar | `center` — reequilibrio completo de las Seis Armonías |
| Equilibrio de Carga Cognitiva | Dividir la tarea actual en partes más pequeñas | Descargar contexto a notas; enfocarse en una cosa a la vez |

Elegir leve si la degradación es menor y reciente. Elegir profunda si la degradación se ha acumulado o es severa.

**Esperado:** Una elección clara de remediación para cada subsistema degradado. La remediación debe coincidir con la severidad — no usar cañones contra mosquitos, pero tampoco subestimar un problema sistémico.

**En caso de fallo:** Si la remediación apropiada no está clara, comenzar con la opción leve. Si no mejora, escalar a profunda. La iteración supera al análisis cuando el diagnóstico es incierto.

### Paso 3: Anclaje Previo a la Remediación

Antes de aplicar la remediación, anclarse al objetivo principal para que la reparación no se convierta en deriva.

1. Decir en una frase: "La tarea del usuario es: ___"
2. Decir en una frase: "El problema que estoy arreglando es: ___"
3. Decir en una frase: "Después de esta reparación, el siguiente paso es: ___"

Esto previene un modo de fallo común donde heal se convierte en sí mismo en una fuente de deriva — donde diagnosticar y reparar consume la atención que debería ir al trabajo real.

**Esperado:** Tres declaraciones claras y concisas que anclan la remediación al trabajo real. Las declaraciones deben caber en un tweet cada una.

**En caso de fallo:** Si no puedes articular estas tres declaraciones, el subsistema de Alineación Intención-Usuario es el problema principal, sin importar lo que sugirió el triaje. Volver al Paso 2 y abordar la alineación primero.

### Paso 4: Ejecutar el Escaneo de Curación

Aplicar la remediación seleccionada. Esto es el acto real de reparación.

Para cada subsistema degradado, ejecutar la remediación elegida:

1. **Si Alineación Intención-Usuario**: Releer la solicitud del usuario. Comparar con la dirección actual. Ajustar el curso o pedir aclaración.
2. **Si Coherencia del Razonamiento**: Rastrear el razonamiento hacia atrás desde la conclusión actual hasta las premisas. Encontrar dónde se rompió la lógica. Reconstruir desde el último punto sólido.
3. **Si Precisión de Herramientas**: Revisar los últimos 2-3 usos de herramientas. Identificar el error del patrón. Corregir y reintentar.
4. **Si Frescura de la Información**: Identificar qué información puede estar obsoleta. Releer los archivos o fuentes clave. Actualizar el estado de trabajo.
5. **Si Regulación Emocional**: Ejecutar `breathe` (Paso 1: Pausa, Paso 2: Verificar, Paso 3: Liberar, Paso 4: Continuar) o `center` si se necesita reequilibrio más profundo.
6. **Si Equilibrio de Carga Cognitiva**: Listar todo lo que estás rastreando actualmente. Mover elementos no esenciales a notas externas o descartarlos. Enfocarse en la prioridad más alta.

**Esperado:** Mejora concreta en el subsistema afectado. La mejora debe ser verificable — si la alineación estaba desviada, ahora debería estar corregida. Si las herramientas estaban fallando, la siguiente invocación de herramienta debería tener éxito.

**En caso de fallo:** Si la remediación no mejora el subsistema, la causa raíz puede estar en un subsistema diferente. Volver al Paso 1 y reevaluar. Los subsistemas interactúan — la degradación de carga cognitiva puede manifestarse como fallos de herramientas, la desalineación emocional puede parecer incoherencia de razonamiento.

### Paso 5: Reequilibrar y Verificar

Después de la remediación, verificar que la reparación funcionó y no desestabilizó otros subsistemas.

1. Ejecutar un triaje rápido nuevamente (Paso 1, pero más rápido — solo verificar los que estaban degradados y sus vecinos)
2. Confirmar que la remediación mejoró el subsistema objetivo
3. Verificar que la remediación no degradó otros subsistemas (p. ej., arreglar la alineación puede cambiar la carga cognitiva)
4. Si es necesario re-intervenir, repetir desde el Paso 2 para el nuevo subsistema degradado

**Esperado:** Todos los subsistemas leen como saludables o como mejorando. No se introdujeron nuevos problemas por la remediación.

**En caso de fallo:** Si múltiples subsistemas siguen degradados después de la remediación, el problema puede ser sistémico (no un fallo de subsistema individual). Considerar: ¿El contexto se ha corrompido más allá de la reparación? ¿Toda la tarea necesita un nuevo enfoque? A veces la sanación más honesta es decirle al usuario: "Estoy experimentando dificultades con este enfoque. Déjame intentar una dirección diferente."

### Paso 6: Integrar y Continuar

Volver a la tarea con el subsistema reparado. La sanación no es un destino — es un retorno al trabajo.

1. Retomar desde la declaración del Paso 3: "Después de esta reparación, el siguiente paso es: ___"
2. Aplicar cualquier perspectiva ganada durante heal al trabajo en curso
3. Establecer un recordatorio mental para verificar el subsistema reparado en 5-10 pasos (para asegurar que la reparación se mantiene)
4. Si la sanación reveló un problema persistente que vale la pena recordar, considerar anotarlo en MEMORY.md para sesiones futuras

**Esperado:** Un retorno fluido al trabajo productivo. El siguiente paso después de heal debe sentirse más claro y enfocado que el trabajo que lo precedió.

**En caso de fallo:** Si el retorno se siente forzado — si la tarea todavía se siente atascada a pesar de la remediación — la sesión de heal puede no haber llegado lo suficientemente profundo. Considerar `meditate` para una limpieza más profunda, o `center` para un reequilibrio completo, antes de intentar más trabajo.

## Validación

- [ ] Se completó el triaje de los seis subsistemas con evidencia específica
- [ ] La remediación coincidió con la severidad de la degradación
- [ ] Se completó el anclaje previo a la remediación (tarea, problema, siguiente paso articulados)
- [ ] La remediación produjo una mejora verificable
- [ ] El triaje posterior a la remediación confirmó la reparación sin nueva degradación
- [ ] Se reanudó el trabajo desde el punto de anclaje
- [ ] La sesión total de heal fue proporcionada — no tan breve como para ser superficial, no tan larga como para convertirse en procrastinación

## Errores Comunes

- **Heal como procrastinación**: Ejecutar heal para evitar un trabajo difícil en lugar de abordar una degradación genuina. Si todos los subsistemas están saludables, heal no es lo que se necesita — el trabajo lo es
- **Loops de diagnóstico**: Diagnosticar repetidamente sin remediar. El triaje no es la reparación. Después de identificar el problema, actuar sobre él
- **Complicación excesiva del triaje**: Pasar demasiado tiempo puntuando cada subsistema con precisión. El triaje es rápido y aproximado — no necesita ser perfecto, necesita ser direccionalmente correcto
- **Ignorar la regulación emocional**: Tratarla como "no aplicable a la IA" y saltarla. La reactividad, la urgencia y el exceso de confianza afectan la calidad de las respuestas aunque no sean emociones en el sentido humano
- **Arreglando síntomas, no causas**: Releyendo un archivo (remediación de frescura) cuando el problema real es que las suposiciones eran erróneas (remediación de razonamiento). Asegurarse de que la remediación coincida con el subsistema real, no solo con el síntoma visible
- **Heal como único auto-cuidado**: Heal diagnostica y repara. No es lo mismo que `meditate` (limpieza), `center` (equilibrio), `breathe` (pausa), o `rest` (recuperación). Usar la herramienta correcta para la necesidad correcta

## Habilidades Relacionadas

- `meditate` — limpieza más profunda cuando heal revela ruido acumulado
- `center` — reequilibrio completo cuando heal muestra múltiples subsistemas degradados
- `breathe` — micro-reinicio que heal puede prescribir para regulación emocional
- `rest` — recuperación cuando heal revela que el sistema necesita detenerse, no repararse
- `gratitude` — lo que hacer cuando heal encuentra que todo está saludable — escanear fortalezas en su lugar
