---
name: model-markov-chain
description: >
  Construir y analizar cadenas de Markov discretas o continuas incluyendo
  construcción de matriz de transición, clasificación de estados, cálculo de
  distribución estacionaria y tiempos medios de primer paso. Usar al modelar
  un sistema sin memoria con conteos o tasas de transición observados, al
  calcular probabilidades de estado estacionario a largo plazo, al determinar
  tiempos de golpe esperados o probabilidades de absorción, al clasificar
  estados como transitorios o recurrentes, o al construir una base para
  modelos ocultos de Markov o MDPs de aprendizaje por refuerzo.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: intermediate
  language: multi
  tags: stochastic, markov-chain, transition-matrix, stationary-distribution
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Model Markov Chain

Construir, clasificar y analizar cadenas de Markov de tiempo discreto o continuo a partir de datos de transición crudos o especificaciones de dominio, produciendo distribuciones estacionarias, tiempos medios de primer paso y validación basada en simulación. Cubre flujos de trabajo DTMC y CTMC de principio a fin.

## Cuándo Usar

- Necesitas modelar un sistema cuyo estado futuro depende solo de su estado actual (propiedad sin memoria)
- Tienes conteos o tasas de transición observados entre un conjunto finito de estados
- Quieres calcular probabilidades de estado estacionario a largo plazo para un proceso
- Necesitas determinar tiempos de golpe esperados o probabilidades de absorción
- Estás clasificando estados como transitorios, recurrentes o absorbentes para análisis estructural
- Quieres comparar modelos de Markov alternativos para el mismo sistema
- Estás construyendo una base para modelos más avanzados (modelos ocultos de Markov, MDPs de aprendizaje por refuerzo)

## Entradas

### Requerido

| Entrada | Tipo | Descripción |
|---------|------|-------------|
| `state_space` | list/vector | Enumeración exhaustiva de todos los estados en la cadena |
| `transition_data` | matrix, data frame, o edge list | Conteos de transición crudos, una matriz de probabilidad, o una matriz de tasas (para CTMC) |
| `chain_type` | string | Ya sea `"discrete"` (DTMC) o `"continuous"` (CTMC) |

### Opcional

| Entrada | Tipo | Predeterminado | Descripción |
|---------|------|----------------|-------------|
| `initial_distribution` | vector | uniforme | Probabilidades del estado inicial |
| `time_horizon` | integer/float | 100 | Número de pasos (DTMC) o unidades de tiempo (CTMC) para simulación |
| `tolerance` | float | 1e-10 | Tolerancia de convergencia para cálculos iterativos |
| `absorbing_states` | list | auto-detección | Estados explícitamente marcados como absorbentes |
| `labels` | list | índices de estado | Nombres legibles para cada estado |
| `method` | string | `"eigen"` | Método de resolución: `"eigen"`, `"power"`, o `"linear_system"` |

## Procedimiento

### Paso 1: Definir espacio de estados y transiciones

1.1. Enumerar todos los estados distintos. Confirmar que la lista es exhaustiva y mutuamente excluyente.

1.2. Si se trabaja desde observaciones crudas, tabular conteos de transición en una matriz de conteos `n x n` `C` donde `C[i,j]` es el número de transiciones observadas del estado `i` al estado `j`.

1.3. Para cadenas de tiempo continuo, recopilar tiempos de permanencia en cada estado junto con los destinos de transición.

1.4. Verificar que ningún estado falta de la enumeración comprobando que cada origen y destino observado aparece en el espacio de estados.

1.5. Documentar la fuente de datos, período de observación, y cualquier filtrado aplicado. Este registro de procedencia es esencial para reproducir el análisis y explicar anomalías.

**Esperado:** Un espacio de estados bien definido de tamaño `n` y ya sea una matriz de conteos o una lista de tuplas (origen, destino, tasa/conteo) cubriendo todas las transiciones observadas. El espacio de estados debe ser suficientemente pequeño para operaciones matriciales (típicamente `n < 10000` para métodos densos).

**En caso de fallo:** Si faltan estados, re-examinar los datos fuente y expandir la enumeración. Si el espacio de estados es demasiado grande para métodos matriciales, considerar agrupar estados raros en un estado agregado "otro" o cambiar a análisis basado en simulación. Si la matriz de conteos es extremadamente dispersa, verificar que el período de observación es suficientemente largo para capturar transiciones típicas.

### Paso 2: Construir la matriz de transición o generador

2.1. **Tiempo discreto (DTMC):** Normalizar cada fila de la matriz de conteos para obtener la matriz de probabilidad de transición `P`:
   - `P[i,j] = C[i,j] / sum(C[i,])`
   - Verificar que cada fila suma 1 (dentro de la tolerancia).

2.2. **Tiempo continuo (CTMC):** Construir la matriz de tasas (generador) `Q`:
   - Fuera de diagonal: `Q[i,j] = tasa de transición de i a j`
   - Diagonal: `Q[i,i] = -sum(Q[i,j] para j != i)`
   - Verificar que cada fila suma 0 (dentro de la tolerancia).

2.3. Manejar filas con conteo cero (estados nunca observados como orígenes) decidiendo una estrategia de suavizado: suavizado de Laplace, convención de absorción, o marcado para revisión.

2.4. Almacenar la matriz en un formato adecuado para cómputo posterior (denso para cadenas pequeñas, disperso para grandes).

**Esperado:** Una matriz estocástica válida `P` (filas suman 1) o matriz generadora `Q` (filas suman 0) sin entradas negativas fuera de diagonal en `P` y sin entradas diagonales positivas en `Q`.

**En caso de fallo:** Si las sumas de filas se desvían más allá de la tolerancia, verificar corrupción de datos o problemas de punto flotante. Re-normalizar o re-examinar los datos fuente.

### Paso 3: Clasificar estados

3.1. Calcular las clases de comunicación encontrando componentes fuertemente conectados del grafo dirigido inducido por la matriz de transición (solo aristas con probabilidad positiva).

3.2. Para cada clase de comunicación, determinar:
   - **Recurrente** si la clase no tiene aristas salientes hacia otras clases.
   - **Transitoria** si tiene aristas salientes.
   - **Absorbente** si la clase consiste en un solo estado con `P[i,i] = 1`.

3.3. Verificar periodicidad para cada clase recurrente calculando el MCD de todas las longitudes de ciclo alcanzables desde cualquier estado en la clase.
   - Período = 1 significa aperiódico.

3.4. Determinar si la cadena es **irreducible** (una sola clase de comunicación) o **reducible** (múltiples clases).

3.5. Resumir: listar cada clase, su tipo (transitoria/recurrente), su período, y si existen estados absorbentes.

**Esperado:** Una clasificación completa: cada estado asignado a una clase de comunicación con etiquetas (transitoria, positivamente recurrente, nulamente recurrente, absorbente) y periodicidad.

**En caso de fallo:** Si el análisis del grafo es inconsistente, verificar que la matriz de transición no tiene entradas negativas y las filas suman correctamente. Para cadenas muy grandes, usar algoritmos de grafos iterativos en lugar de potencias de matriz completas.

### Paso 4: Calcular la distribución estacionaria

4.1. **Cadena irreducible aperiódica:** Resolver `pi * P = pi` sujeto a `sum(pi) = 1`.
   - Reformular como `pi * (P - I) = 0` con la restricción de normalización.
   - Usar descomposición de eigenvalores: `pi` es el eigenvector izquierdo de `P` correspondiente al eigenvalor 1, normalizado para sumar 1.

4.2. **Cadena irreducible periódica:** La distribución estacionaria todavía existe pero la cadena no converge a ella desde estados iniciales arbitrarios. Calcularla de la misma manera que 4.1.

4.3. **Cadena reducible:** Calcular la distribución estacionaria para cada clase recurrente independientemente. La distribución estacionaria general es una combinación convexa dependiendo de las probabilidades de absorción desde estados transitorios.

4.4. **CTMC:** Resolver `pi * Q = 0` con `sum(pi) = 1`.

4.5. Verificar: multiplicar el `pi` calculado por `P` (o `Q`) y confirmar que el resultado es igual a `pi` dentro de la tolerancia.

4.6. Para cadenas reducibles, calcular las probabilidades de absorción desde cada estado transitorio a cada clase recurrente. Estas probabilidades, combinadas con las distribuciones estacionarias por clase, dan el comportamiento a largo plazo condicionado al estado inicial.

4.7. Registrar la brecha espectral (diferencia entre las magnitudes del mayor y segundo mayor eigenvalor). Esta cantidad gobierna la tasa de convergencia a la estacionariedad y es útil para determinar cuántos pasos de simulación se necesitan en el Paso 6.

**Esperado:** Un vector de probabilidad `pi` de longitud `n` con todas las entradas no negativas, sumando 1, satisfaciendo las ecuaciones de balance dentro de la tolerancia. La brecha espectral debe ser positiva para cadenas irreducibles aperiódicas.

**En caso de fallo:** Si el solucionador de eigenvalores no converge, intentar el método iterativo de potencias (`pi_k+1 = pi_k * P` hasta convergencia). Si múltiples eigenvalores igualan 1, la cadena es reducible -- manejar según el Paso 4.3. Si la brecha espectral es extremadamente pequeña, la cadena mezcla lentamente y requerirá simulaciones muy largas para validación.

### Paso 5: Calcular tiempos medios de primer paso

5.1. Definir el tiempo medio de primer paso `m[i,j]` como el número esperado de pasos para alcanzar el estado `j` partiendo del estado `i`.

5.2. Para una cadena irreducible, resolver el sistema de ecuaciones lineales:
   - `m[i,j] = 1 + sum(P[i,k] * m[k,j] para k != j)` para todo `i != j`
   - `m[j,j] = 1 / pi[j]` (tiempo medio de recurrencia)

5.3. Para cadenas absorbentes, calcular probabilidades de absorción y tiempos esperados hasta la absorción:
   - Particionar `P` en bloques transitorio (`Q_t`) y absorbente.
   - Matriz fundamental: `N = (I - Q_t)^{-1}`
   - Pasos esperados hasta absorción: `N * 1` (vector columna de unos)
   - Probabilidades de absorción: `N * R` donde `R` es el bloque transitorio-a-absorbente.

5.4. Para CTMC, reemplazar conteos de pasos con tiempos de permanencia esperados usando la matriz generadora.

5.5. Presentar resultados como una matriz o tabla de tiempos de primer paso por pares para pares de estados clave.

**Esperado:** Una matriz de tiempos medios de primer paso donde las entradas diagonales igualan los tiempos medios de recurrencia (`1/pi[j]`) y las entradas fuera de diagonal son finitas para pares de estados comunicantes.

**En caso de fallo:** Si el sistema lineal es singular, la cadena tiene estados transitorios que no pueden alcanzar el objetivo. Reportar pares inalcanzables como infinito. Verificar la estructura de la cadena del Paso 3.

### Paso 6: Validar con simulación

6.1. Simular `K` trayectorias muestrales independientes de la cadena por `T` pasos cada una, partiendo de la distribución inicial.

6.2. Estimar la distribución estacionaria empíricamente contando frecuencias de ocupación de estados en todas las trayectorias después de descartar un período de quemado.

6.3. Comparar frecuencias simuladas con la distribución estacionaria analítica. Calcular la distancia de variación total o el estadístico chi-cuadrado.

6.4. Estimar tiempos medios de primer paso empíricamente registrando el primer tiempo de golpe para cada estado objetivo a través de réplicas.

6.5. Reportar métricas de concordancia:
   - Desviación absoluta máxima entre probabilidades estacionarias analíticas y simuladas.
   - Intervalos de confianza del 95% para tiempos de primer paso simulados vs. valores analíticos.

6.6. Si las discrepancias exceden la tolerancia, re-examinar los pasos de construcción de la matriz de transición y clasificación.

**Esperado:** Distribución estacionaria simulada dentro de 0.01 de distancia de variación total de la solución analítica (para ejecuciones suficientemente largas). Tiempos medios de primer paso simulados dentro del 10% de los valores analíticos.

**En caso de fallo:** Aumentar la longitud de simulación `T` o el número de réplicas `K`. Si las discrepancias persisten, la solución analítica puede tener errores numéricos -- recalcular con mayor precisión.

## Validación

- La matriz de transición `P` tiene todas las entradas no negativas y cada fila suma 1 (o las filas de `Q` suman 0 para CTMC)
- La distribución estacionaria `pi` es un vector de probabilidad válido que satisface `pi * P = pi`
- Los tiempos medios de recurrencia igualan `1/pi[j]` para cada estado recurrente `j`
- Las frecuencias de estado simuladas convergen a la distribución estacionaria analítica
- La clasificación de estados es consistente: ningún estado recurrente tiene aristas saliendo de su clase de comunicación
- Todos los eigenvalores de `P` tienen magnitud a lo sumo 1, con exactamente un eigenvalor igual a 1 por clase recurrente
- Para cadenas absorbentes: las probabilidades de absorción desde cada estado transitorio suman 1 en todas las clases absorbentes
- La matriz fundamental `N = (I - Q_t)^{-1}` tiene todas las entradas positivas (los conteos de visitas esperados son positivos)
- El balance detallado se cumple si y solo si la cadena es reversible: `pi[i] * P[i,j] = pi[j] * P[j,i]` para todo `i,j`

## Errores Comunes

- **Espacio de estados no exhaustivo**: Los estados faltantes producen una matriz sub-estocástica (filas suman menos de 1). Siempre verificar las sumas de filas antes del análisis.
- **Confundir DTMC y CTMC**: Una matriz de tasas debe tener diagonal no positiva y filas sumando 0. Aplicar fórmulas de DTMC a una matriz de tasas produce sinsentido.
- **Ignorar periodicidad**: Una cadena periódica tiene una distribución estacionaria válida pero no converge a ella en el sentido usual. El análisis de tiempo de mezcla debe considerar el período.
- **Inestabilidad numérica para cadenas grandes**: La descomposición de eigenvalores de matrices densas grandes es costosa y puede perder precisión. Usar solucionadores dispersos o métodos iterativos para cadenas con más de unos cientos de estados.
- **Transiciones de probabilidad cero**: Los ceros estructurales en la matriz de transición pueden hacer la cadena reducible. Verificar irreducibilidad antes de calcular una distribución estacionaria única.
- **Longitud de simulación insuficiente**: Simulaciones cortas con mezcla pobre producen estimaciones sesgadas. Siempre calcular tamaño de muestra efectivo y verificar gráficos de traza.
- **Asumir reversibilidad sin verificar**: Muchos atajos analíticos (ej., balance detallado) aplican solo a cadenas reversibles. Verificar `pi[i] * P[i,j] = pi[j] * P[j,i]` antes de usar resultados dependientes de reversibilidad.
- **Acumulación de punto flotante en método de potencias**: Iterar `pi * P` muchas veces acumula errores de redondeo. Re-normalizar periódicamente `pi` para sumar 1 durante la iteración de potencias.

## Habilidades Relacionadas

- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) -- extiende cadenas de Markov a modelos de estados latentes con emisiones observadas
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md) -- marco general de simulación aplicable a trayectorias muestrales de cadenas de Markov y validación Monte Carlo
