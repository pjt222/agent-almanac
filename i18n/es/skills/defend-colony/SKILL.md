---
name: defend-colony
description: >
  Implementar defensa colectiva por capas usando señalización de alarma,
  movilización de roles y respuesta proporcional. Cubre detección de amenazas,
  propagación de alertas, patrones de respuesta inmune, niveles de escalación
  y recuperación post-incidente para sistemas distribuidos y organizaciones.
  Usar al diseñar defensa en profundidad donde ningún guardián único cubre
  todas las amenazas, al construir respuesta a incidentes que escala con la
  severidad, o cuando la defensa actual es sobre-reactiva a cada alerta o
  sub-reactiva ante amenazas genuinas.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: advanced
  language: natural
  tags: swarm, defense, immune-response, threat-detection
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Defend Colony

Implementar defensa colectiva por capas para sistemas distribuidos, equipos u organizaciones — usando señalización de alarma, movilización de roles, respuesta proporcional y patrones de memoria inmune inspirados en la defensa de colonias de insectos sociales y sistemas inmunes biológicos.

## Cuándo Usar

- Diseñar defensa en profundidad para sistemas distribuidos donde ningún guardián único puede cubrir todas las amenazas
- Construir procesos de respuesta a incidentes que escalen con la severidad de la amenaza
- Proteger un sistema donde los componentes individuales no pueden defenderse solos
- La defensa actual es sobre-reactiva (cada alerta dispara movilización completa) o sub-reactiva (las amenazas pasan desapercibidas hasta que el daño está hecho)
- Construir resiliencia organizacional donde los equipos deben auto-organizarse en respuesta a incidentes
- Complementar `coordinate-swarm` con patrones específicos de coordinación de respuesta a amenazas

## Entradas

- **Requerido**: Descripción de la colonia (sistema, organización, equipo) a defender
- **Requerido**: Categorías de amenazas conocidas (ataques, fallos, competidores, riesgos ambientales)
- **Opcional**: Mecanismos de defensa actuales y sus modos de fallo
- **Opcional**: Tipos de defensores disponibles y sus capacidades
- **Opcional**: Latencia de respuesta aceptable por nivel de amenaza
- **Opcional**: Requisitos de recuperación post-incidente

## Procedimiento

### Paso 1: Mapear el Panorama de Amenazas y el Perímetro de Defensa

Identificar qué necesita ser defendido, de qué y dónde está el perímetro.

1. Definir los activos críticos de la colonia:
   - ¿Qué debe protegerse a toda costa? (datos centrales, sistemas de producción, personas clave)
   - ¿Qué puede sostener daño temporal? (entornos de prueba, servicios no críticos)
   - ¿Qué es prescindible bajo amenaza extrema? (cachés, réplicas, funcionalidades no esenciales)
2. Clasificar amenazas por tipo y severidad:
   - **Sondeos**: reconocimiento o pruebas de bajo nivel (escaneo de puertos, intentos de inicio de sesión fallidos repetidos)
   - **Incursiones**: violaciones activas del perímetro (acceso no autorizado, intentos de inyección)
   - **Infestaciones**: amenazas persistentes ya dentro del perímetro (nodos comprometidos, amenazas internas)
   - **Existenciales**: amenazas a la supervivencia de la colonia (corrupción de datos, fallo catastrófico, DDoS)
3. Mapear el perímetro de defensa:
   - Perímetro exterior: primera oportunidad de detección (firewalls, límites de tasa, monitoreo)
   - Perímetro interior: fronteras de activos críticos (controles de acceso, cifrado, aislamiento)
   - Núcleo: defensas de último recurso (respaldos, interruptores de emergencia, disyuntores)

**Esperado:** Un mapa claro de activos (priorizados), amenazas (clasificadas por severidad) y perímetros de defensa (por capas). Este mapa guía todo el diseño de defensa subsiguiente.

**En caso de fallo:** Si el panorama de amenazas se siente abrumador, comenzar con los 3 activos críticos principales y los 3 tipos de amenaza principales. La cobertura perfecta es menos importante que la cobertura de lo que más importa. Si los límites del perímetro no están claros, aplicar por defecto "no confiar en nada, verificar todo" (postura de confianza cero) y definir los límites a medida que se observan los patrones de tráfico reales.

### Paso 2: Diseñar la Red de Señalización de Alarma

Construir el sistema de comunicación que detecta amenazas y propaga alertas.

1. Desplegar centinelas en cada capa de defensa:
   - Centinelas exteriores: detectores ligeros de alta sensibilidad (pueden producir falsos positivos)
   - Centinelas interiores: detectores más pesados de alta especificidad (menos falsos positivos, más lentos)
   - Centinelas del núcleo: monitores de activos críticos (tolerancia cero para amenazas no detectadas)
2. Definir señales de alarma con intensidad graduada:
   - **Amarillo**: anomalía detectada, monitoreo aumentado, sin movilización
   - **Naranja**: patrón de amenaza confirmado, defensores locales se movilizan, exploradores investigan
   - **Rojo**: brecha activa o amenaza severa, movilización completa de defensa, actividad no esencial pausada
   - **Negro**: amenaza existencial, todos los recursos a defensa, sacrificar activos prescindibles si es necesario
3. Implementar propagación de alarma:
   - Local: centinelas alertan a defensores cercanos directamente
   - Regional: grupos de centinelas agregan señales y escalan si se alcanza el umbral
   - Toda la colonia: la escalación regional dispara alarma de difusión
   - Cada paso de propagación agrega confirmación — un solo centinela no puede disparar alarma de toda la colonia
4. Incorporar prevención de fatiga de alarma:
   - Suprimir automáticamente alarmas idénticas repetidas (deduplicación con ventana temporal)
   - Requerir que la escalación sea confirmada por centinelas independientes
   - Rastrear la relación alarma-amenaza — si la tasa de falsos positivos excede el 50%, recalibrar centinelas

```
Alarm Propagation:
┌──────────────────────────────────────────────────────────┐
│ Sentinel detects anomaly ──→ Yellow alert (local)        │
│        │                                                 │
│        ↓ (confirmed by 2nd sentinel)                     │
│ Orange alert ──→ Local defenders mobilize                │
│        │                                                 │
│        ↓ (pattern matches known threat + 3rd sentinel)   │
│ Red alert ──→ Full defense mobilization                  │
│        │                                                 │
│        ↓ (critical asset under active attack)            │
│ Black alert ──→ All resources to defense, circuit break  │
└──────────────────────────────────────────────────────────┘
```

**Esperado:** Un sistema de alarma graduado donde la severidad de la amenaza determina la intensidad de la respuesta. Las confirmaciones de múltiples centinelas independientes previenen falsas alarmas de punto único. La fatiga de alarma se gestiona mediante deduplicación y calibración.

**En caso de fallo:** Si el sistema de alarma produce demasiados falsos positivos, elevar los umbrales de los centinelas o requerir más confirmaciones antes de la escalación. Si las amenazas se filtran sin ser detectadas, agregar centinelas en la capa penetrada o bajar los umbrales de detección. Si la propagación de alarma es demasiado lenta, reducir los requisitos de confirmación — pero aceptar una mayor tasa de falsos positivos como compensación.

### Paso 3: Movilizar Defensores Basados en Roles

Asignar roles de defensa y protocolos de movilización proporcionales al nivel de amenaza.

1. Definir roles de defensores:
   - **Centinelas**: especialistas en detección (siempre activos, bajo costo de recursos)
   - **Guardias**: primeros respondedores (inactivos hasta ser movilizados, respuesta rápida)
   - **Soldados**: defensores pesados (costosos de movilizar, alta capacidad)
   - **Sanadores**: especialistas en reparación de daños y recuperación (ver `repair-damage`)
   - **Mensajeros**: coordinan la defensa entre regiones de la colonia
2. Mapear roles a niveles de alerta:
   - Amarillo: centinelas aumentan frecuencia de monitoreo, guardias en espera
   - Naranja: guardias se movilizan a la ubicación de la amenaza, soldados en espera
   - Rojo: soldados se movilizan, trabajadores no esenciales reasignados a defensa
   - Negro: todos los roles a defensa, actividades de la colonia suspendidas
3. Implementar respuesta proporcional:
   - Nunca desplegar soldados para un sondeo (desperdicio y revela capacidades)
   - Nunca depender solo de centinelas contra una incursión (respuesta insuficiente)
   - Ajustar la respuesta al nivel de amenaza — escalar si el nivel actual falla, desescalar cuando la amenaza retrocede
4. Protocolo de transición de roles:
   - Los trabajadores pueden convertirse en guardias (capacitación temporal para emergencia)
   - Los guardias pueden convertirse en soldados (amenaza sostenida requiere respuesta más pesada)
   - Después de que pasa la amenaza, las transiciones inversas restauran las operaciones normales

**Esperado:** Una fuerza de defensa que escala con la severidad de la amenaza. Las operaciones normales usan recursos de defensa mínimos. Bajo amenaza, la colonia puede movilizar rápidamente defensa proporcional sin sobre-reaccionar ni sub-reaccionar.

**En caso de fallo:** Si la movilización es demasiado lenta, pre-posicionar guardias más cerca de los vectores de amenaza conocidos. Si la movilización es demasiado costosa, reducir la fuerza de guardias permanente y depender más de las transiciones trabajador-a-guardia. Si ocurre confusión de roles durante la movilización, simplificar a 3 roles (detectar, responder, recuperar) en lugar de 5.

### Paso 4: Ejecutar Memoria Inmune y Adaptación

Aprender de cada encuentro con amenazas para mejorar la defensa futura.

1. Después de cada incidente, crear una firma de amenaza:
   - Patrón de ataque (cómo se detectó la amenaza)
   - Vector de ataque (por dónde entró)
   - Respuesta efectiva (qué la detuvo)
   - Respuesta fallida (qué no funcionó)
2. Almacenar firmas en la memoria inmune de la colonia:
   - Biblioteca de patrones de búsqueda rápida para centinelas
   - Manuales de defensores actualizados con respuestas conocidas como efectivas
   - Patrones de falsos positivos marcados para reducir la fatiga de alarma futura
3. Implementar inmunidad adaptativa:
   - Las nuevas firmas de amenaza se propagan a todos los centinelas (aprendizaje de toda la colonia)
   - Los centinelas que detectaron la amenaza reciben actualizaciones prioritarias (aprendizaje local)
   - La revisión periódica elimina firmas obsoletas (amenazas que ya no aplican)
4. Probar la memoria inmune bajo estrés:
   - Re-simular amenazas pasadas periódicamente para verificar que las defensas aún funcionan
   - Ejercicios de equipo rojo introducen amenazas novedosas para probar la adaptación
   - Medir el tiempo de detección para amenazas conocidas vs. desconocidas

**Esperado:** Un sistema de defensa que se fortalece con cada encuentro. Las amenazas conocidas se detectan más rápido y se responde a ellas más efectivamente. Las amenazas novedosas se manejan por el sistema de alarma graduado, y su resolución se agrega a la memoria inmune.

**En caso de fallo:** Si la memoria inmune crece demasiado y ralentiza la detección, priorizar firmas por frecuencia y severidad, archivando amenazas raras/menores. Si la defensa se especializa demasiado contra amenazas conocidas y no detecta las novedosas, mantener una función de "patrulla general" que no dependa del reconocimiento de patrones — detección pura de anomalías como línea base.

### Paso 5: Coordinar la Recuperación Post-Incidente

Transicionar del modo de defensa de vuelta a las operaciones normales con reparación de daños y mejora de resiliencia.

1. Verificación de eliminación de amenaza:
   - Confirmar que la amenaza está neutralizada (no solo suprimida)
   - Escanear amenazas secundarias que puedan haber entrado durante el incidente primario
   - Verificar que no quedan agentes comprometidos activos
2. Evaluación de daños:
   - Catalogar qué fue dañado, degradado o perdido
   - Priorizar reparación por criticidad (activos centrales primero)
   - Estimar tiempo de recuperación y recursos necesarios
3. Ejecución de recuperación:
   - Desplegar sanadores a las áreas dañadas (ver `repair-damage` para recuperación detallada)
   - Restaurar servicios en orden de prioridad
   - Mantener actividad elevada de centinelas durante la recuperación (período vulnerable)
4. Protocolo de desescalación:
   - Reducir niveles de alerta gradualmente (Rojo -> Naranja -> Amarillo -> Normal)
   - Devolver trabajadores reasignados a sus roles primarios
   - Desmovilizar soldados y devolver guardias a patrullaje
   - Revisión post-incidente dentro de 24 horas mientras la memoria está fresca

**Esperado:** Una transición suave de defensa a recuperación a operaciones normales. El monitoreo elevado durante la recuperación detecta amenazas secundarias. La revisión post-incidente alimenta los aprendizajes en la memoria inmune.

**En caso de fallo:** Si la recuperación es demasiado lenta, pre-construir manuales de recuperación para los escenarios de daño más probables. Si emergen amenazas secundarias durante la recuperación, la desescalación fue demasiado agresiva — mantener niveles de alerta más altos por más tiempo. Si la revisión post-incidente se omite (común bajo presión de tiempo), programarla como un evento de calendario innegociable.

## Validación

- [ ] Los activos críticos están identificados y priorizados
- [ ] Las amenazas están clasificadas por tipo y severidad
- [ ] El perímetro de defensa tiene múltiples capas con centinelas en cada una
- [ ] La señalización de alarma tiene niveles graduados con confirmación multi-centinela
- [ ] Los roles de defensores están definidos con movilización mapeada a niveles de alerta
- [ ] La respuesta proporcional previene sobre-reacción y sub-reacción
- [ ] La memoria inmune captura y aplica lecciones de cada incidente
- [ ] El protocolo de recuperación post-incidente restaura las operaciones normales de forma segura

## Errores Comunes

- **Defensa Línea Maginot**: Sobre-invertir en una sola capa de defensa mientras se dejan otras desprotegidas. La defensa debe ser por capas — cualquier capa individual puede ser vulnerada
- **Fatiga de alerta**: Demasiadas alarmas con muy pocas amenazas reales degrada la atención de los defensores. Calibrar centinelas despiadadamente; un falso positivo no detectado es más barato que una amenaza real no detectada
- **Respuesta simétrica**: Responder a cada amenaza con la misma intensidad desperdicia recursos y revela todas tus capacidades. Ajustar la respuesta a la amenaza — escalar solo cuando sea necesario
- **Sin memoria inmune**: Defenderse contra el mismo tipo de amenaza repetidamente sin aprender es costoso y frágil. Cada incidente debe actualizar el conocimiento de defensa de la colonia
- **Pie de guerra permanente**: Las operaciones sostenidas en alta alerta agotan a los defensores y degradan el funcionamiento normal de la colonia. Desescalar deliberadamente cuando la amenaza pasa

## Habilidades Relacionadas

- `coordinate-swarm` — patrones de coordinación fundamentales que soportan la señalización de alarma y la movilización
- `build-consensus` — consenso rápido para decisiones de defensa colectiva bajo presión de tiempo
- `scale-colony` — los sistemas de defensa deben escalar con el crecimiento de la colonia
- `repair-damage` — habilidad mórfica para recuperación regenerativa después de incidentes de defensa
- `configure-alerting-rules` — configuración práctica de alertas que implementa patrones de señalización de alarma
- `conduct-post-mortem` — análisis post-incidente estructurado para alimentar la memoria inmune
