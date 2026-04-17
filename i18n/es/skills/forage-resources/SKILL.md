---
name: forage-resources
description: >
  Aplicar optimización de colonia de hormigas y teoría de forrajeo a la búsqueda
  de recursos, compensaciones de exploración-explotación y descubrimiento
  distribuido. Cubre despliegue de exploradores, refuerzo de rastros, detección
  de rendimientos decrecientes y selección adaptativa de estrategia de forrajeo.
  Usar al buscar en un espacio de soluciones grande donde la enumeración por
  fuerza bruta es impráctica, al equilibrar inversión entre explorar nuevos
  enfoques y profundizar los buenos conocidos, al optimizar asignación de
  recursos entre oportunidades inciertas, o al diagnosticar convergencia
  prematura en óptimos locales.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, foraging, ant-colony-optimization, exploration-exploitation
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Forage Resources

Aplicar teoría de forrajeo y optimización de colonia de hormigas para buscar, evaluar y explotar recursos distribuidos sistemáticamente — equilibrando la exploración de territorio desconocido con la explotación de rendimientos conocidos.

## Cuándo Usar

- Buscar en un espacio de soluciones grande donde la enumeración por fuerza bruta es impráctica
- Equilibrar inversión entre explorar nuevos enfoques y profundizar los buenos conocidos
- Optimizar asignación de recursos entre múltiples oportunidades inciertas
- Diseñar estrategias de búsqueda para equipos distribuidos o agentes automatizados
- Diagnosticar convergencia prematura (atrapado en óptimos locales) o vagabundeo perpetuo (nunca comprometerse)
- Complementar `coordinate-swarm` con patrones específicos de descubrimiento de recursos

## Entradas

- **Requerido**: Descripción del recurso buscado (información, cómputo, talento, soluciones, oportunidades)
- **Requerido**: Descripción del espacio de búsqueda (tamaño, estructura, características conocidas)
- **Opcional**: Estrategia de búsqueda actual y su modo de fallo
- **Opcional**: Número de exploradores/buscadores disponibles
- **Opcional**: Costo de exploración vs. costo de fallo en explotación
- **Opcional**: Horizonte temporal (explotación a corto plazo vs. exploración a largo plazo)

## Procedimiento

### Paso 1: Mapear el paisaje de forrajeo

Caracterizar el entorno de recursos para seleccionar la estrategia de forrajeo apropiada.

1. Identificar el tipo de recurso y su distribución:
   - **Concentrado**: los recursos se agrupan en parches ricos (ej., talento en comunidades específicas)
   - **Distribuido**: los recursos se dispersan uniformemente (ej., bugs a través de un código base)
   - **Efímero**: los recursos aparecen y desaparecen (ej., oportunidades de mercado)
   - **Anidado**: los parches ricos contienen sub-parches a diferentes escalas
2. Evaluar el paisaje de información:
   - ¿Cuánto se sabe sobre las ubicaciones de recursos antes de comenzar el forrajeo?
   - ¿Pueden los exploradores compartir información con los recolectores? (ver `coordinate-swarm` para diseño de señales)
   - ¿Es el paisaje estático o cambia mientras se forrajea?
3. Determinar la estructura de costos:
   - Costo por explorador desplegado (tiempo, cómputo, dinero)
   - Costo de explotar un recurso de baja calidad (costo de oportunidad)
   - Costo de perder un recurso de alta calidad (arrepentimiento)

**Esperado:** Un paisaje de forrajeo caracterizado con tipo de distribución de recursos, disponibilidad de información y estructura de costos. Esto determina qué modelo de forrajeo aplicar.

**En caso de fallo:** Si el paisaje es completamente desconocido, comenzar con exploración máxima (todos exploradores, sin explotación) durante un presupuesto de tiempo fijo para construir un mapa inicial. Cambiar al modelo apropiado una vez que el carácter del paisaje se aclare.

### Paso 2: Desplegar exploradores con marcado de rastros

Enviar agentes exploratorios al espacio de búsqueda con instrucciones de marcar lo que encuentren.

1. Asignar porcentaje de exploradores (comenzar con 20-30% de los agentes disponibles como exploradores)
2. Definir comportamiento de exploradores:
   - Moverse a través del espacio de búsqueda usando patrones aleatorios o sistemáticos
   - Evaluar cada ubicación encontrada (evaluación rápida, no análisis profundo)
   - Marcar descubrimientos con intensidad de señal proporcional a la calidad:
     - Alta calidad → señal de rastro fuerte
     - Calidad media → señal moderada
     - Baja calidad → señal débil o sin señal
   - Devolver información al colectivo (depósito de señal, informe, difusión)
3. Diseñar el patrón de exploración:
   - **Caminata aleatoria**: buena para paisajes desconocidos y uniformes
   - **Vuelo de Lévy**: saltos largos con agrupamiento local ocasional — bueno para recursos parcheados
   - **Barrido sistemático**: cuadrícula o espiral — bueno para espacios acotados y bien definidos
   - **Aleatorio sesgado**: inclinarse hacia áreas similares a hallazgos previos — bueno para recursos agrupados

**Esperado:** Exploradores desplegados a través del espacio de búsqueda, depositando señales de rastro proporcionales a la calidad del recurso. El mapa inicial del paisaje comienza a emerger de los informes de exploradores.

**En caso de fallo:** Si los exploradores no encuentran nada en el barrido inicial, el porcentaje de exploradores es muy bajo (aumentar al 50%), el patrón de búsqueda es incorrecto (cambiar de caminata aleatoria a vuelo de Lévy para recursos parcheados), o la evaluación de calidad está mal calibrada (bajar el umbral de detección).

### Paso 3: Establecer refuerzo de rastros

Crear bucles de retroalimentación positiva que amplifiquen caminos exitosos y dejen desvanecerse los no exitosos.

1. Cuando un recolector sigue un rastro y encuentra un buen recurso:
   - Reforzar la señal del rastro (aumentar intensidad)
   - La señal reforzada atrae más recolectores → más refuerzo → explotación
2. Cuando un recolector sigue un rastro y no encuentra nada:
   - No reforzar (dejar que el rastro decaiga naturalmente)
   - La señal debilitada atrae menos recolectores → el rastro se desvanece → se reanuda la exploración
3. Establecer parámetros de refuerzo:
   - **Cantidad de depósito**: proporcional a la calidad del recurso encontrado
   - **Tasa de decaimiento**: los rastros pierden X% de intensidad por unidad de tiempo
   - **Tope de saturación**: intensidad máxima del rastro (previene explotación descontrolada de un solo camino)

```
Trail Reinforcement Dynamics:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Strong trail ──→ More foragers ──→ If good: reinforce ──→ EXPLOIT │
│       ↑                                                      │      │
│       │                              If bad: no reinforce    │      │
│       │                                     │                │      │
│       │                                     ↓                │      │
│  Decay ←── Weak trail ←── Fewer foragers ←── Trail fades    │      │
│       │                                                      │      │
│       ↓                                                      │      │
│  No trail ──→ Scouts explore ──→ New discovery ──→ New trail ↗      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Esperado:** Un bucle de retroalimentación auto-regulado donde los buenos recursos atraen atención creciente y los recursos pobres son abandonados naturalmente. El sistema equilibra explotación y exploración a través de la dinámica de rastros solamente.

**En caso de fallo:** Si todos los recolectores convergen en un solo rastro (convergencia prematura), la tasa de decaimiento es demasiado lenta o el tope de saturación es demasiado alto. Aumentar el decaimiento, bajar el tope, o introducir mandatos de exploración aleatoria (ej., 10% de los recolectores siempre ignoran los rastros). Si los rastros se desvanecen demasiado rápido y nada se explota, reducir la tasa de decaimiento.

### Paso 4: Detectar rendimientos decrecientes

Monitorear los rendimientos de recursos para saber cuándo cambiar de explotación de vuelta a exploración.

1. Rastrear rendimiento por unidad de esfuerzo para cada sitio de forrajeo activo:
   - Rendimiento aumentando → explotación saludable, continuar
   - Rendimiento plano → acercándose a la saturación, comenzar a explorar alternativas
   - Rendimiento disminuyendo → rendimientos decrecientes, reducir recolectores, aumentar exploradores
2. Implementar el teorema del valor marginal:
   - Comparar la tasa de rendimiento del sitio actual con la tasa de rendimiento promedio de todos los sitios conocidos
   - Cuando el sitio actual cae por debajo del promedio, es hora de irse
   - Factorizar el costo de viaje (el costo de cambiar a un nuevo sitio)
3. Disparar oleadas de exploración cuando:
   - El rendimiento general de todos los sitios cae por debajo de un umbral
   - El sitio de mejor rendimiento ha sido explotado por más tiempo que su vida útil esperada
   - Se detecta cambio ambiental (nuevas señales de exploradores en áreas no exploradas)

**Esperado:** El enjambre de forrajeo cambia naturalmente entre fases de explotación (concentradas en sitios conocidos como buenos) y fases de exploración (exploradores dispersos), impulsado por monitoreo de rendimiento en lugar de programas arbitrarios.

**En caso de fallo:** Si el enjambre permanece en sitios agotados demasiado tiempo, el umbral de valor marginal está configurado demasiado bajo o la estimación de costo de viaje es demasiado alta. Recalibrar comparando tasas de rendimiento reales. Si el enjambre abandona buenos sitios demasiado pronto, el umbral es demasiado sensible — agregar una ventana de suavizado a la medición de rendimiento.

### Paso 5: Adaptar la estrategia de forrajeo a las condiciones

Seleccionar y cambiar entre estrategias de forrajeo basándose en la retroalimentación ambiental.

1. Emparejar estrategia con paisaje:
   - **Rico, agrupado**: comprometerse fuertemente con los parches descubiertos (alta explotación)
   - **Escaso, disperso**: mantener alto ratio de exploradores (alta exploración)
   - **Volátil, cambiante**: decaimiento corto de rastros, oleadas frecuentes de exploración (adaptativo)
   - **Competitivo**: refuerzo más rápido, marcado preventivo de rastros (territorial)
2. Monitorear desajuste estrategia-entorno:
   - Alto esfuerzo, bajo rendimiento → estrategia demasiado explotadora para el paisaje
   - Alta tasa de descubrimiento, bajo seguimiento → estrategia demasiado exploradora
   - Rendimiento oscilante → cambio de estrategia demasiado agresivo
3. Implementar cambio adaptativo:
   - Rastrear un promedio móvil de la proporción exploración-explotación
   - Si la proporción se desvía demasiado del óptimo (determinado por el tipo de paisaje), corregirla
   - Permitir transiciones graduales — cambios abruptos de estrategia causan caos de coordinación

**Esperado:** Un sistema de forrajeo que adapta su equilibrio exploración-explotación al entorno actual, manteniendo efectividad mientras las condiciones cambian.

**En caso de fallo:** Si la adaptación de estrategia misma se vuelve inestable (oscilando entre exploración y explotación), agregar amortiguamiento: requerir que la señal de desajuste persista por N unidades de tiempo antes de disparar un cambio de estrategia. Si ninguna estrategia parece funcionar, reevaluar la caracterización del paisaje del Paso 1 — la distribución de recursos puede ser más compleja de lo asumido inicialmente.

## Validación

- [ ] El paisaje de forrajeo está caracterizado (tipo de distribución, disponibilidad de información, estructura de costos)
- [ ] El porcentaje de exploradores y el patrón de búsqueda están definidos y desplegados
- [ ] El bucle de refuerzo de rastros es funcional con parámetros de depósito, decaimiento y saturación
- [ ] La detección de rendimientos decrecientes dispara rebalanceo de explotación a exploración
- [ ] El ajuste estrategia-entorno es monitoreado y el cambio adaptativo está configurado
- [ ] El sistema se recupera de cambios en el paisaje (nuevos recursos, recursos agotados)

## Errores Comunes

- **Convergencia prematura**: Todos los recolectores se acumulan en el primer buen hallazgo, ignorando opciones potencialmente mejores. Cura: porcentaje de exploración obligatorio, topes de saturación de rastros y decaimiento
- **Exploración perpetua**: Los exploradores siguen encontrando nuevas opciones pero el enjambre nunca se compromete. Cura: bajar el umbral de calidad para refuerzo de rastros, reducir porcentaje de exploradores
- **Ignorar costos de viaje**: Cambiar de sitio tiene un costo. Los recolectores que constantemente saltan entre sitios de calidad similar desperdician más en viaje de lo que ganan. Factorizar el costo de viaje en el cálculo de valor marginal
- **Estrategia estática en paisaje dinámico**: Una estrategia optimizada para las condiciones de ayer falla mañana. Construir adaptación dentro del bucle de forrajeo, no como una ocurrencia tardía
- **Confundir calidad de explorador con calidad de recolector**: Buenos exploradores (evaluación amplia y rápida) y buenos recolectores (explotación profunda y exhaustiva) requieren habilidades diferentes. No forzar a todos los agentes en ambos roles

## Habilidades Relacionadas

- `coordinate-swarm` — patrones de coordinación fundacionales que sustentan el diseño de señales de forrajeo
- `build-consensus` — usado cuando el enjambre debe acordar colectivamente qué parches de recursos priorizar
- `scale-colony` — escalar operaciones de forrajeo cuando el paisaje de recursos o el tamaño del enjambre crece
- `assess-form` — habilidad mórfica para evaluar el estado actual de un sistema, complementaria a la evaluación del paisaje
- `configure-alerting-rules` — patrones de alertas aplicables a la detección de rendimientos decrecientes
- `plan-capacity` — la planificación de capacidad comparte el marco de explorar-explotar con la teoría de forrajeo
- `forage-solutions` — variante de autoaplicación de IA; mapea el forrajeo de colonia de hormigas a la exploración de soluciones de un solo agente con hipótesis exploradoras y refuerzo de rastros
