---
name: coordinate-swarm
description: >
  Aplicar patrones de coordinación de inteligencia colectiva — estigmergia, reglas
  locales y detección de quórum — para organizar sistemas distribuidos, equipos o
  flujos de trabajo sin control centralizado. Cubre diseño de señales, límites de
  autonomía de agentes, cultivo de comportamiento emergente y ajuste de bucles de
  retroalimentación. Usar al diseñar sistemas distribuidos sin cuello de botella
  de coordinación, al organizar equipos que deben auto-coordinarse, al construir
  arquitecturas dirigidas por eventos con comunicación de estado compartido, o al
  reemplazar orquestación centralizada frágil con coordinación emergente resiliente.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: basic
  language: natural
  tags: swarm, coordination, stigmergy, emergent-behavior
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Coordinate Swarm

Establecer coordinación entre agentes distribuidos usando estigmergia (comunicación indirecta a través de modificación del entorno), reglas de interacción local y detección de quórum — permitiendo comportamiento colectivo coherente sin un controlador central.

## Cuándo Usar

- Al diseñar sistemas distribuidos donde ningún nodo individual debería ser un cuello de botella de coordinación
- Al organizar equipos o flujos de trabajo que deben auto-coordinarse sin supervisión constante de gestión
- Al construir arquitecturas dirigidas por eventos donde los componentes se comunican a través de estado compartido en lugar de mensajería directa
- Al escalar un proceso que funciona bien con 3 agentes pero se rompe con 30
- Al inicializar patrones de coordinación para un nuevo dominio estilo enjambre (ver `forage-resources`, `build-consensus`)
- Al reemplazar orquestación centralizada frágil con coordinación emergente resiliente

## Entradas

- **Requerido**: Descripción de los agentes (trabajadores, servicios, miembros del equipo) que necesitan coordinación
- **Requerido**: El objetivo colectivo o comportamiento emergente deseado
- **Opcional**: Mecanismo de coordinación actual y sus modos de fallo
- **Opcional**: Número de agentes (afecta la selección de patrón — enjambres pequeños vs. colonias grandes)
- **Opcional**: Tolerancia a la latencia (coordinación en tiempo real vs. eventual)
- **Opcional**: Restricciones ambientales (disponibilidad de estado compartido, ancho de banda de comunicación)

## Procedimiento

### Paso 1: Identificar la clase de problema de coordinación

Clasificar el desafío de coordinación para seleccionar los patrones apropiados.

1. Mapear el estado actual: ¿quiénes son los agentes, qué hacen individualmente, dónde se rompe la coordinación?
2. Clasificar el problema:
   - **Forrajeo** — los agentes buscan y explotan recursos distribuidos (ver `forage-resources`)
   - **Consenso** — los agentes deben acordar una decisión colectiva (ver `build-consensus`)
   - **Construcción** — los agentes construyen o mantienen una estructura compartida incrementalmente
   - **Defensa** — los agentes detectan y responden a amenazas colectivamente (ver `defend-colony`)
   - **División del trabajo** — los agentes deben auto-organizarse en roles especializados
3. Identificar el modo de fallo de la coordinación actual:
   - Punto único de fallo (controlador centralizado)
   - Cuello de botella de comunicación (demasiados mensajes directos)
   - Pérdida de coherencia (los agentes se desincronizan sin retroalimentación)
   - Rigidez (no puede adaptarse a condiciones cambiantes)

**Esperado:** Una clasificación clara del tipo de problema de coordinación y el modo de fallo específico a abordar. Esto determina qué patrones de enjambre aplicar.

**En caso de fallo:** Si el problema no encaja en una sola clase, puede ser compuesto. Descomponer en subproblemas y abordar cada uno con el patrón apropiado. Si los agentes son demasiado heterogéneos para un solo modelo de coordinación, considerar coordinación en capas — clusters homogéneos coordinados mediante estigmergia inter-cluster.

### Paso 2: Diseñar señales estigmérgicas

Crear los canales de comunicación indirecta a través de los cuales los agentes influyen en el comportamiento de los demás.

1. Definir el entorno compartido (base de datos, cola de mensajes, sistema de archivos, espacio físico, tablero compartido)
2. Diseñar señales que los agentes depositan en el entorno:
   - **Señales de rastro**: marcadores que se acumulan a lo largo de caminos exitosos (como feromonas de hormigas)
   - **Señales de umbral**: contadores que disparan cambios de comportamiento cuando cruzan umbrales
   - **Señales de inhibición**: marcadores que repelen a los agentes de áreas agotadas
3. Definir propiedades de las señales:
   - **Tasa de decaimiento**: qué tan rápido se desvanecen las señales (previene que el estado obsoleto domine)
   - **Refuerzo**: cómo los resultados exitosos fortalecen las señales
   - **Radio de visibilidad**: qué tan lejos se propaga una señal
4. Mapear señales a comportamientos de agentes:
   - Cuando un agente detecta la señal X por encima del umbral T, realiza la acción A
   - Cuando un agente completa la acción A exitosamente, deposita la señal Y
   - Cuando no se detecta señal, el agente sigue su comportamiento de exploración por defecto

```
Signal Design Template:
┌──────────────┬───────────────────┬──────────────┬────────────────────┐
│ Signal Name  │ Deposited When    │ Decay Rate   │ Agent Response     │
├──────────────┼───────────────────┼──────────────┼────────────────────┤
│ success-trail│ Task completed OK │ 50% per hour │ Follow toward      │
│ busy-marker  │ Agent starts task │ On completion│ Avoid / pick other │
│ help-signal  │ Agent stuck >5min │ 25% per hour │ Assist if nearby   │
│ danger-flag  │ Error detected    │ 10% per hour │ Retreat & report   │
└──────────────┴───────────────────┴──────────────┴────────────────────┘
```

**Esperado:** Una tabla de señales que mapea marcadores ambientales a condiciones de depósito de agentes, tasas de decaimiento y comportamientos de respuesta. Las señales deben ser simples, componibles e independientemente significativas.

**En caso de fallo:** Si el diseño de señales se siente excesivamente complejo, reducir a dos señales: una positiva (rastro de éxito) y una negativa (señal de peligro). La mayoría de los problemas de coordinación pueden inicializarse con dinámicas de atracción/repulsión. Agregar matices solo después de que el sistema básico esté funcionando.

### Paso 3: Definir reglas de interacción local

Especificar las reglas simples que cada agente sigue, usando solo información local (su propio estado + señales cercanas).

1. Definir el radio de percepción del agente (¿qué puede percibir?)
2. Escribir 3-7 reglas locales en orden de prioridad:
   - Regla 1 (seguridad): Si se detecta señal de peligro, alejarse
   - Regla 2 (respuesta): Si se detecta señal de ayuda y está inactivo, acercarse
   - Regla 3 (explotación): Si se detecta rastro de éxito, seguir hacia la señal más fuerte
   - Regla 4 (exploración): Si no se detectan señales, moverse aleatoriamente con sesgo hacia áreas no exploradas
   - Regla 5 (depósito): Después de completar tarea, depositar rastro de éxito en la ubicación
3. Cada regla debe ser:
   - **Local**: depende solo de lo que el agente individual puede percibir
   - **Simple**: expresable en una declaración si-entonces
   - **Sin estado** (preferiblemente): no requiere que el agente recuerde estados pasados
4. Probar las reglas mentalmente: si cada agente sigue estas reglas, ¿emerge el comportamiento colectivo deseado?

**Esperado:** Un conjunto de reglas priorizado que cada agente ejecuta independientemente. Cuando se aplican a través del enjambre, estas reglas locales producen el comportamiento colectivo objetivo (forrajeo, construcción, defensa, etc.).

**En caso de fallo:** Si la simulación mental no produce el comportamiento emergente deseado, las reglas probablemente necesitan un bucle de retroalimentación — los agentes deben poder observar las consecuencias de sus acciones colectivas. Agregar una señal que represente el estado colectivo (ej., "tasa de completación de tareas") y una regla que ajuste el comportamiento basándose en ella.

### Paso 4: Calibrar la detección de quórum

Establecer umbrales que disparen cambios de estado colectivo cuando suficientes agentes estén de acuerdo.

1. Identificar decisiones que requieren acuerdo colectivo (no solo respuesta individual):
   - Cambiar del modo de exploración al de explotación
   - Comprometerse con un nuevo sitio de trabajo o abandonar uno antiguo
   - Escalar de respuesta normal a respuesta de emergencia
2. Para cada decisión colectiva, definir:
   - **Umbral de quórum**: número o porcentaje de agentes que deben señalar acuerdo
   - **Ventana de detección**: período de tiempo durante el cual se cuentan las señales
   - **Histéresis**: umbrales diferentes para activación vs. desactivación (previene oscilación)
3. Implementar el quórum como acumulación de señales:
   - Cada agente que favorece la decisión deposita una señal de voto
   - Cuando los votos acumulados exceden el umbral de quórum dentro de la ventana de detección, la decisión se activa
   - Cuando los votos caen por debajo del umbral de desactivación, la decisión se revierte

**Esperado:** Umbrales de quórum que permiten al enjambre tomar decisiones colectivas sin un líder. La brecha de histéresis previene la oscilación rápida entre estados.

**En caso de fallo:** Si el enjambre oscila entre estados, ampliar la brecha de histéresis (ej., activar al 70%, desactivar al 30%). Si el enjambre nunca alcanza el quórum, bajar el umbral o aumentar la ventana de detección. Si las decisiones son demasiado lentas, reducir la ventana de detección — pero cuidado con el consenso prematuro.

### Paso 5: Probar y ajustar el comportamiento emergente

Validar que las reglas locales producen el comportamiento colectivo deseado, luego ajustar parámetros.

1. Ejecutar una simulación o piloto con un número pequeño de agentes (5-10)
2. Observar:
   - ¿Converge el enjambre hacia el comportamiento previsto?
   - ¿Cuánto tiempo toma la convergencia?
   - ¿Qué sucede cuando las condiciones cambian a mitad de tarea?
   - ¿Qué sucede cuando los agentes fallan o se agregan?
3. Ajustar parámetros:
   - Tasa de decaimiento de señales: demasiado rápida → sin memoria de coordinación; demasiado lenta → señales obsoletas dominan
   - Umbral de quórum: demasiado bajo → decisiones colectivas prematuras; demasiado alto → parálisis
   - Balance exploración-explotación: demasiada exploración → ineficiente; demasiada explotación → óptimos locales
4. Prueba de estrés:
   - Remover el 30% de los agentes repentinamente — ¿se recupera el enjambre?
   - Duplicar la cantidad de agentes — ¿sigue coordinándose el enjambre?
   - Introducir señales conflictivas — ¿resuelve el enjambre o se bloquea?

**Esperado:** Un conjunto de parámetros ajustado donde el enjambre se auto-organiza hacia el comportamiento objetivo, se recupera de perturbaciones y escala con gracia.

**En caso de fallo:** Si el enjambre falla las pruebas de estrés, el diseño de señales probablemente está demasiado acoplado. Simplificar: reducir a menos señales, aumentar las tasas de decaimiento (información más fresca) y asegurar que los agentes tengan un comportamiento por defecto robusto cuando no hay señales presentes. Un enjambre que hace algo razonable con cero señales es más resiliente que uno que depende de la disponibilidad de señales.

## Validación

- [ ] El problema de coordinación está clasificado en un patrón reconocido (forrajeo, consenso, construcción, defensa, división del trabajo)
- [ ] La tabla de señales estigmérgicas está definida con condiciones de depósito, tasas de decaimiento y respuestas de agentes
- [ ] Las reglas de interacción local son simples, locales y priorizadas (3-7 reglas)
- [ ] Los umbrales de quórum están establecidos con histéresis para prevenir oscilación
- [ ] La prueba a pequeña escala muestra comportamiento emergente que coincide con el objetivo colectivo
- [ ] La prueba de estrés (remoción de agentes, adición, interrupción de señales) muestra degradación gradual

## Errores Comunes

- **Sobre-ingeniería de señales**: Comenzar con demasiados tipos de señales crea confusión. Empezar con 2 señales (atraer/repeler) y agregar solo cuando esté probadamente necesario
- **Pensamiento centralizado disfrazado**: Si tu "regla local" requiere que un agente conozca el estado global, no es local. Refactorizar hasta que cada regla dependa solo de lo que el agente puede percibir directamente
- **Ignorar el decaimiento**: Las señales que nunca decaen crean un estado de coordinación fosilizado. Cada señal necesita una vida media apropiada a la escala temporal de la tarea
- **Histéresis cero**: Umbrales de quórum sin brecha entre activación y desactivación causan oscilación rápida de estado. Siempre establecer la desactivación más baja que la activación
- **Asumir homogeneidad**: Si los agentes tienen diferentes capacidades, un único conjunto de reglas puede no funcionar. Considerar reglas diferenciadas por rol (ver `scale-colony`)

## Habilidades Relacionadas

- `forage-resources` — aplica la coordinación de enjambre específicamente a la búsqueda de recursos y compensaciones de exploración-explotación
- `build-consensus` — profundización en mecanismos de acuerdo distribuido, extendiendo la detección de quórum de esta habilidad
- `defend-colony` — patrones de defensa colectiva que se construyen sobre el marco de señales y reglas de aquí
- `scale-colony` — estrategias de escalamiento para cuando el enjambre supera su diseño de coordinación inicial
- `adapt-architecture` — habilidad mórfica para transformar la arquitectura del sistema, complementaria cuando la coordinación de enjambre dispara cambios estructurales
- `deploy-to-kubernetes` — despliegue práctico de sistemas distribuidos donde aplican los patrones de coordinación de enjambre
- `plan-capacity` — planificación de capacidad informada por dinámicas de escalamiento de enjambre
- `coordinate-reasoning` — variante de autoaplicación de IA; mapea señales estigmérgicas a gestión de contexto con tasas de decaimiento de información y protocolos locales
