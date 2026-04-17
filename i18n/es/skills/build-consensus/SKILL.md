---
name: build-consensus
description: >
  Lograr acuerdo distribuido sin autoridad central usando democracia de abejas,
  votación por umbral y detección de quórum. Cubre generación de propuestas,
  dinámicas de defensa, umbrales de compromiso, resolución de bloqueos y
  evaluación de calidad del consenso. Usar cuando un grupo debe decidir entre
  opciones sin un líder designado, cuando la toma de decisiones centralizada es
  un cuello de botella, cuando las partes interesadas tienen diferentes
  perspectivas para integrar, o al diseñar sistemas automatizados que deben
  alcanzar consenso como bases de datos distribuidas o IA multi-agente.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, consensus, quorum-sensing, distributed-agreement
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Build Consensus

Lograr acuerdo colectivo entre agentes distribuidos sin una autoridad central — usando defensa de exploradores, detección de quórum por umbral y dinámicas de compromiso modeladas en la toma de decisiones de enjambre de abejas melíferas.

## Cuándo Usar

- Un grupo debe decidir colectivamente entre múltiples opciones sin un líder designado
- La toma de decisiones centralizada es un cuello de botella o un punto único de fallo
- Las partes interesadas tienen información y perspectivas diferentes que deben integrarse
- Decisiones pasadas sufrieron de pensamiento grupal (convergencia prematura) o parálisis por análisis (sin convergencia)
- Diseñar sistemas automatizados que deben alcanzar consenso (bases de datos distribuidas, IA multi-agente)
- Complementar `coordinate-swarm` cuando la coordinación requiere decisiones colectivas explícitas

## Entradas

- **Requerido**: La decisión a tomar (elección binaria, selección entre N opciones, configuración de parámetro)
- **Requerido**: Los agentes participantes (miembros del equipo, servicios, votantes)
- **Opcional**: Opciones conocidas con evaluaciones preliminares de calidad
- **Opcional**: Urgencia de la decisión (presupuesto de tiempo)
- **Opcional**: Tasa de error aceptable (¿puede el grupo ocasionalmente elegir la segunda mejor opción?)
- **Opcional**: Modo de fallo actual de la toma de decisiones (pensamiento grupal, bloqueo, indecisión)

## Procedimiento

### Paso 1: Generar propuestas mediante exploración independiente

Asegurar que el espacio de decisión se explore adecuadamente antes de que comience cualquier defensa.

1. Asignar exploradores para investigar independientemente el espacio de opciones:
   - Cada explorador evalúa opciones sin conocer los hallazgos de otros exploradores
   - La evaluación independiente previene el arrastre temprano hacia opciones populares pero mediocres
   - Conteo de exploradores: al mínimo, 3 exploradores por opción seria (para confiabilidad)
2. Los exploradores producen evaluaciones estructuradas:
   - Identificador de la opción
   - Puntuación de calidad (normalizada 0-100 o categórica: pobre/regular/buena/excelente)
   - Fortalezas clave y riesgos identificados
   - Nivel de confianza (¿qué tan exhaustivamente fue evaluada esta opción?)
3. Agregar los informes de los exploradores sin filtrar — todas las opciones por encima de un umbral mínimo de calidad entran en la fase de defensa

**Esperado:** Un conjunto de propuestas evaluadas independientemente con puntuaciones de calidad y evaluaciones. Ninguna opción ha sido eliminada por un solo evaluador; la diversidad de perspectiva se preserva.

**En caso de fallo:** Si los exploradores convergen en la misma opción sin evaluación independiente, la exploración no fue verdaderamente independiente. Repetir con barreras de información explícitas. Si demasiadas opciones sobreviven a la fase de defensa, elevar el umbral mínimo de calidad. Si muy pocas sobreviven, bajarlo o agregar más exploradores.

### Paso 2: Ejecutar dinámicas de defensa (danza waggle)

Permitir que los exploradores defiendan sus opciones preferidas, con intensidad de defensa proporcional a la calidad.

1. Cada explorador defiende su opción mejor calificada:
   - La intensidad de defensa es proporcional a la puntuación de calidad (mejores opciones reciben defensa más vigorosa)
   - La defensa es pública — todos los agentes observan todas las señales de defensa
   - Los defensores presentan evidencia y evaluación de calidad, no solo preferencia
2. Los agentes no comprometidos observan la defensa y evalúan:
   - Dan seguimiento a las opciones defendidas inspeccionándolas independientemente
   - Si la inspección propia del agente confirma la calidad, se unen a la defensa
   - Si la inspección revela menor calidad de la anunciada, no se unen
3. Dinámicas de inspección cruzada:
   - Los defensores de opciones más débiles pierden seguidores naturalmente cuando los agentes verifican independientemente
   - Los defensores de opciones más fuertes ganan seguidores a través de calidad confirmada
   - El proceso es autocorrectivo: la defensa exagerada falla en el paso de verificación

```
Advocacy Dynamics:
┌─────────────────────────────────────────────────────────┐
│ Scout A advocates Option 1 (quality 85) ──→ ◉◉◉◉◉     │
│ Scout B advocates Option 2 (quality 70) ──→ ◉◉◉        │
│ Scout C advocates Option 3 (quality 45) ──→ ◉           │
│                                                         │
│ Uncommitted agents inspect:                             │
│   Agent D inspects Option 1 → confirms → joins ◉◉◉◉◉◉  │
│   Agent E inspects Option 2 → confirms → joins ◉◉◉◉    │
│   Agent F inspects Option 3 → disagrees → inspects Opt 1│
│                               → confirms → joins ◉◉◉◉◉◉◉│
│                                                         │
│ Over time: Option 1 advocacy grows, Option 3 fades      │
└─────────────────────────────────────────────────────────┘
```

**Esperado:** La defensa de la(s) mejor(es) opción(es) crece con el tiempo a medida que los agentes verifican independientemente la calidad. La defensa de opciones más débiles se desvanece cuando la verificación falla. El grupo converge naturalmente hacia la opción más fuerte sin que ningún agente dicte la elección.

**En caso de fallo:** Si la defensa no converge (dos opciones permanecen empatadas), las opciones pueden ser genuinamente equivalentes — proceder al quórum con cualquiera, o usar una regla de desempate. Si la defensa converge demasiado rápido en una opción mediocre, aumentar la independencia de la evaluación (más exploradores, barreras de información más estrictas) y agregar un paso obligatorio de inspección cruzada.

### Paso 3: Establecer umbral de quórum y comprometerse

Definir el umbral de compromiso que dispara la acción colectiva.

1. Establecer el umbral de quórum:
   - **Decisiones simples**: 50% + 1 de agentes comprometidos con una opción
   - **Decisiones importantes**: 66-75% comprometidos con una opción
   - **Decisiones críticas/irreversibles**: 80%+ comprometidos con una opción
   - Regla general: mayor riesgo → mayor quórum → consenso más lento pero más confiable
2. Monitorear la acumulación de compromisos:
   - Rastrear cuántos agentes se han comprometido con cada opción a lo largo del tiempo
   - Mostrar los niveles de compromiso de manera transparente (todos los agentes pueden ver el estado actual)
   - No permitir retiro de compromiso a mitad de ciclo (previene la oscilación)
3. Cuando se alcanza el quórum:
   - La opción ganadora se adopta como la decisión colectiva
   - Los defensores de las opciones perdedoras reconocen la decisión (sin agentes rebeldes)
   - La implementación comienza inmediatamente — la demora después del consenso erosiona el compromiso

**Esperado:** Un momento de quórum claro donde suficientes agentes se han comprometido independientemente con una opción. La decisión es legítima porque surgió de evaluación independiente, no de autoridad o coerción.

**En caso de fallo:** Si el quórum nunca se alcanza dentro del presupuesto de tiempo, escalar al Paso 4 (resolución de bloqueos). Si el quórum se alcanza pero los agentes están descontentos, la fase de defensa fue demasiado corta — los agentes se comprometieron sin evaluación adecuada. Si el consenso fue incorrecto (descubierto después del hecho), la exploración independiente fue insuficiente — aumentar la diversidad de exploradores y la exhaustividad de evaluación en el siguiente ciclo.

### Paso 4: Resolver bloqueos

Romper el estancamiento de decisión cuando el proceso natural de consenso se detiene.

1. Diagnosticar el tipo de bloqueo:
   - **Empate genuino**: dos opciones son igualmente buenas → lanzar una moneda; el costo de la demora excede el costo de elegir la opción "equivocada" entre iguales
   - **Déficit de información**: los agentes no pueden evaluar las opciones suficientemente bien → invertir en más exploración antes de volver a ejecutar la defensa
   - **Formación de facciones**: subgrupos arraigados se niegan a inspeccionar cruzadamente → introducir rotación obligatoria donde los defensores deben inspeccionar la opción opuesta
   - **Proliferación de opciones**: demasiadas opciones fragmentan el compromiso → eliminar el 50% inferior y volver a ejecutar la defensa
2. Aplicar la resolución apropiada:
   - Empate genuino: selección aleatoria o fusionar opciones si son compatibles
   - Déficit de información: extensión de exploración con tiempo limitado
   - Formación de facciones: ronda de inspección cruzada forzada
   - Proliferación de opciones: torneo de eliminación por ranking
3. Después de la resolución, reiniciar el reloj de quórum y volver a ejecutar el Paso 3

**Esperado:** Bloqueo resuelto mediante la intervención apropiada. La resolución es visible y aceptada por el grupo como proceso justo, incluso si agentes individuales preferían un resultado diferente.

**En caso de fallo:** Si los bloqueos recurren en la misma decisión, el encuadre de la decisión puede ser incorrecto. Retroceder y preguntar: ¿puede la decisión descomponerse en decisiones más pequeñas e independientes? ¿Puede reducirse el alcance? ¿Hay una opción de "probar ambas y ver"? A veces el mejor consenso es "ejecutaremos un experimento con tiempo limitado."

### Paso 5: Evaluar la calidad del consenso

Evaluar si el proceso de consenso produjo una buena decisión, no solo una decisión.

1. Evaluación post-decisión:
   - ¿Fue la opción ganadora verificada independientemente por al menos N agentes?
   - ¿Fue la velocidad de decisión apropiada (no demasiado rápida/pensamiento grupal, no demasiado lenta/parálisis)?
   - ¿El proceso sacó a la superficie información que habría sido perdida por un solo tomador de decisiones?
   - ¿Los agentes están comprometidos con la implementación, o meramente cumpliendo?
2. Rastrear métricas de salud del consenso:
   - **Tiempo hasta el quórum**: disminuyendo en decisiones sucesivas indica aprendizaje; aumentando indica complejidad creciente o disfunción
   - **Ratio exploración-compromiso**: ¿cuánta exploración se necesitó por compromiso? Ratio alto = decisión difícil o baja confianza
   - **Tasa de arrepentimiento post-decisión**: ¿con qué frecuencia el grupo desea haber elegido diferente?
3. Retroalimentar los aprendizajes al proceso:
   - Ajustar umbrales de quórum basándose en la importancia de la decisión y precisión pasada
   - Ajustar el conteo de exploradores basándose en la complejidad de las opciones
   - Ajustar presupuestos de tiempo basándose en el historial de tiempo-hasta-quórum

**Esperado:** Un ciclo de retroalimentación que mejora la calidad del consenso con el tiempo. El grupo aprende a explorar más efectivamente, defender más honestamente y comprometerse más confiadamente.

**En caso de fallo:** Si las métricas de calidad del consenso son pobres (alto arrepentimiento, decisiones lentas), auditar el proceso en busca de fallas estructurales: diversidad de exploración insuficiente, defensa sin verificación, o umbrales configurados demasiado bajos para el tipo de decisión. Reconstruir la etapa específica que falla en lugar de revisar todo el proceso.

## Validación

- [ ] Las propuestas fueron generadas mediante exploración independiente (sin arrastre)
- [ ] La intensidad de defensa fue proporcional a la calidad evaluada
- [ ] Los agentes no comprometidos verificaron independientemente las opciones defendidas
- [ ] El umbral de quórum fue apropiado para la importancia de la decisión
- [ ] El quórum fue alcanzado y la decisión fue implementada prontamente
- [ ] El mecanismo de resolución de bloqueos estaba disponible (incluso si no fue usado)
- [ ] La evaluación de calidad post-decisión fue conducida

## Errores Comunes

- **Omitir la exploración independiente**: Saltar directamente a la defensa produce pensamiento grupal. La calidad del consenso depende enteramente de la calidad de la evaluación independiente
- **Defensa igual para opciones desiguales**: Si cada opción recibe la misma defensa independientemente de la calidad, el proceso degenera en selección aleatoria. La defensa debe ser proporcional a la calidad evaluada
- **Retiro de compromiso**: Permitir que los agentes retiren su compromiso crea oscilación. Una vez comprometidos en un ciclo, los agentes permanecen comprometidos hasta que el ciclo se resuelva
- **Confundir consenso con unanimidad**: El consenso requiere acuerdo suficiente, no acuerdo total. Esperar el 100% crea bloqueo permanente
- **Ignorar al lado perdedor**: Los agentes que defendieron la opción perdedora tienen información que el grupo necesita. Sus preocupaciones deben informar la implementación, incluso si no bloquean la decisión

## Habilidades Relacionadas

- `coordinate-swarm` — marco de coordinación fundacional que soporta el mecanismo de consenso basado en señales
- `defend-colony` — las decisiones de defensa colectiva a menudo requieren consenso rápido bajo amenaza
- `scale-colony` — los mecanismos de consenso deben adaptarse cuando el tamaño del grupo cambia significativamente
- `dissolve-form` — habilidad mórfica para desmantelamiento controlado, donde el consenso antes de la disolución es crítico
- `plan-sprint` — la planificación de sprint involucra consenso del equipo sobre el alcance del compromiso
- `conduct-retrospective` — las retrospectivas son una forma de construcción de consenso sobre mejora de procesos
- `build-coherence` — variante de autoaplicación de IA; mapea la democracia de abejas al razonamiento de múltiples caminos de un solo agente con umbrales de confianza y resolución de bloqueos
