---
name: fit-hidden-markov-model
description: >
  Ajustar modelos ocultos de Markov usando el algoritmo de Baum-Welch (EM) con
  selección de modelo, decodificación de Viterbi para secuencias de estados y
  probabilidades forward-backward. Usar cuando las observaciones son generadas
  por estados latentes no observables, se necesita segmentar una serie temporal
  en regímenes latentes (regímenes de mercado, fonemas del habla, secuencias
  biológicas), calcular probabilidades de secuencia, decodificar la ruta de
  estados ocultos más probable, o comparar modelos con diferentes números de
  estados ocultos.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: advanced
  language: multi
  tags: stochastic, hmm, baum-welch, viterbi, em-algorithm
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Fit Hidden Markov Model

Ajustar un modelo oculto de Markov (HMM) a datos de observación secuenciales usando el algoritmo de expectativa-maximización de Baum-Welch, decodificar la secuencia de estados ocultos más probable vía Viterbi, y seleccionar el número óptimo de estados ocultos mediante criterios de información.

## Cuándo Usar

- Observas una secuencia de emisiones pero los estados generativos subyacentes no son directamente observables
- Sospechas que tus datos son generados por un sistema que alterna entre un número finito de regímenes
- Necesitas segmentar una serie temporal en fases latentes (ej., regímenes de mercado, fonemas del habla, anotación de secuencias biológicas)
- Quieres calcular la probabilidad de una secuencia observada bajo un modelo generativo
- Necesitas la secuencia de estados ocultos más probable dadas las observaciones (decodificación)
- Estás comparando modelos con diferentes números de estados ocultos para el mejor compromiso complejidad-ajuste

## Entradas

### Requerido

| Entrada | Tipo | Descripción |
|---------|------|-------------|
| `observations` | secuencia/matriz | Secuencia de datos observados (univariante o multivariante) |
| `n_hidden_states` | entero | Número de estados ocultos a ajustar (o un rango para selección de modelo) |
| `emission_type` | cadena | Familia de distribución para emisiones: `"gaussian"`, `"discrete"`, `"poisson"`, `"multinomial"` |

### Opcional

| Entrada | Tipo | Defecto | Descripción |
|---------|------|---------|-------------|
| `initial_params` | dict | aleatorio/heurístico | Matriz de transición inicial, parámetros de emisión y probabilidades iniciales |
| `n_restarts` | entero | 10 | Número de reinicios aleatorios para mitigar óptimos locales |
| `max_iterations` | entero | 500 | Iteraciones EM máximas por reinicio |
| `convergence_tol` | flotante | 1e-6 | Umbral de convergencia de log-verosimilitud para EM |
| `state_range` | lista de enteros | `[n_hidden_states]` | Rango de conteos de estados para selección de modelo |
| `covariance_type` | cadena | `"full"` | Para emisiones gaussianas: `"full"`, `"diagonal"`, `"spherical"` |
| `regularization` | flotante | 1e-6 | Constante pequeña añadida a la diagonal de matrices de covarianza para prevenir singularidad |

## Procedimiento

### Paso 1: Definir Estados Ocultos y Modelo de Observación

1.1. Especificar el número de estados ocultos `K` (o un rango candidato para selección de modelo en el Paso 5).

1.2. Elegir la familia de distribución de emisión basándose en el tipo de datos:
   - Datos continuos: Gaussiana (univariante o multivariante)
   - Datos de conteo: Poisson o binomial negativa
   - Datos categóricos: discreta/multinomial

1.3. Definir los componentes del modelo:
   - **Matriz de transición** `A` de tamaño `K x K`: `A[i,j] = P(z_t = j | z_{t-1} = i)`
   - **Parámetros de emisión** `theta_k` para cada estado `k`: específicos de la distribución (ej., media y covarianza para gaussiana)
   - **Distribución de estado inicial** `pi`: `pi[k] = P(z_1 = k)`

1.4. Verificar que los datos de observación estén correctamente formateados: sin valores faltantes en la secuencia, dimensionalidad consistente y longitud suficiente relativa al número de parámetros.

**Esperado:** Una arquitectura HMM claramente especificada con `K` estados, una familia de emisión elegida y datos de observación limpios de longitud `T >> K^2`.

**En caso de fallo:** Si los datos contienen valores faltantes, imputar o eliminar los segmentos afectados. Si `T` es demasiado pequeño relativo a `K`, reducir `K` o adquirir más datos.

### Paso 2: Inicializar Parámetros

2.1. Generar parámetros iniciales para cada uno de los `n_restarts` reinicios:
   - **Matriz de transición**: Matriz estocástica aleatoria (cada fila extraída de una distribución de Dirichlet) o una matriz uniforme ligeramente perturbada.
   - **Parámetros de emisión**: Usar clustering K-means sobre las observaciones para inicializar medias; calcular varianzas de clusters para emisiones gaussianas.
   - **Distribución inicial**: Uniforme o proporcional a tamaños de clusters de K-means.

2.2. Para el primer reinicio, usar la inicialización informada por K-means (generalmente el inicio más fuerte). Para reinicios posteriores, usar perturbaciones aleatorias.

2.3. Verificar que todos los parámetros iniciales sean válidos:
   - Las filas de la matriz de transición suman 1 con todas las entradas positivas.
   - Los parámetros de emisión están en el dominio válido (ej., las matrices de covarianza son definidas positivas).
   - La distribución inicial suma 1.

**Esperado:** `n_restarts` conjuntos de parámetros iniciales válidos, con al menos una inicialización basada en datos.

**En caso de fallo:** Si K-means falla en converger, usar inicialización puramente aleatoria con más reinicios. Si las matrices de covarianza son singulares, agregar la constante de regularización a la diagonal.

### Paso 3: Ejecutar Baum-Welch EM para Estimación de Parámetros

3.1. **Paso-E (algoritmo Forward-Backward):**
   - Calcular probabilidades forward `alpha[t,k]` = P(o_1,...,o_t, z_t=k | modelo) usando la recursión:
     - `alpha[1,k] = pi[k] * b_k(o_1)`
     - `alpha[t,k] = sum_j(alpha[t-1,j] * A[j,k]) * b_k(o_t)`
   - Calcular probabilidades backward `beta[t,k]` = P(o_{t+1},...,o_T | z_t=k, modelo):
     - `beta[T,k] = 1`
     - `beta[t,k] = sum_j(A[k,j] * b_j(o_{t+1}) * beta[t+1,j])`
   - Calcular posterior de estado `gamma[t,k]` = P(z_t=k | O, modelo):
     - `gamma[t,k] = alpha[t,k] * beta[t,k] / P(O | modelo)`
   - Calcular posterior de transición `xi[t,i,j]` = P(z_t=i, z_{t+1}=j | O, modelo).

3.2. **Paso-M (Re-estimación de parámetros):**
   - Actualizar matriz de transición: `A[i,j] = sum_t(xi[t,i,j]) / sum_t(gamma[t,i])`
   - Actualizar parámetros de emisión usando estadísticos suficientes ponderados:
     - Media gaussiana: `mu_k = sum_t(gamma[t,k] * o_t) / sum_t(gamma[t,k])`
     - Covarianza gaussiana: matriz de dispersión ponderada más regularización
     - Discreta: `b_k(v) = sum_t(gamma[t,k] * I(o_t=v)) / sum_t(gamma[t,k])`
   - Actualizar distribución inicial: `pi[k] = gamma[1,k]`

3.3. Calcular log-verosimilitud: `log P(O | modelo) = log sum_k(alpha[T,k])`. Usar el truco log-sum-exp para prevenir desbordamiento inferior.

3.4. **Escalado:** Usar variables forward-backward escaladas para prevenir desbordamiento numérico inferior en secuencias largas. Normalizar `alpha` en cada paso temporal y acumular factores de escalado logarítmicos.

3.5. Repetir Paso-E y Paso-M hasta que el cambio en log-verosimilitud esté por debajo de `convergence_tol` o se alcance `max_iterations`.

3.6. A través de todos los reinicios, mantener el conjunto de parámetros con la log-verosimilitud final más alta.

**Esperado:** Log-verosimilitud monótonamente no decreciente a través de las iteraciones, convergiendo dentro de `max_iterations`. Los parámetros finales son válidos (matrices estocásticas, covarianzas definidas positivas).

**En caso de fallo:** Si la log-verosimilitud decrece, hay un error en el Paso-E o Paso-M — verificar las fórmulas. Si la convergencia es muy lenta, intentar mejor inicialización o aumentar `max_iterations`. Si la covarianza se vuelve singular, aumentar la regularización.

### Paso 4: Aplicar Decodificación de Viterbi para la Secuencia de Estados Más Probable

4.1. Inicializar variables de Viterbi:
   - `delta[1,k] = log(pi[k]) + log(b_k(o_1))`
   - `psi[1,k] = 0` (sin predecesor)

4.2. Recurrir hacia adelante para `t = 2,...,T`:
   - `delta[t,k] = max_j(delta[t-1,j] + log(A[j,k])) + log(b_k(o_t))`
   - `psi[t,k] = argmax_j(delta[t-1,j] + log(A[j,k]))`

4.3. Terminar:
   - `z*_T = argmax_k(delta[T,k])`
   - Log-probabilidad de la mejor ruta: `max_k(delta[T,k])`

4.4. Retroceder para `t = T-1,...,1`:
   - `z*_t = psi[t+1, z*_{t+1}]`

4.5. Generar la secuencia de estados decodificada `z* = (z*_1, ..., z*_T)` y su log-probabilidad.

4.6. Comparar la probabilidad de la ruta de Viterbi con la probabilidad total de la secuencia del algoritmo forward para evaluar cuán dominante es la mejor ruta.

**Esperado:** Una única secuencia de estados más probable de longitud `T` con cada entrada en `{1,...,K}`. La log-probabilidad de Viterbi debería ser menor o igual a la log-verosimilitud total.

**En caso de fallo:** Si la ruta de Viterbi tiene log-probabilidad de infinito negativo, alguna probabilidad de transición o emisión es cero donde no debería serlo. Agregar valores mínimos para prevenir log(0).

### Paso 5: Realizar Selección de Modelo (BIC/AIC a Través de Órdenes de Modelo)

5.1. Para cada número candidato de estados ocultos `K` en `state_range`, ajustar el HMM completo (Pasos 2-4).

5.2. Calcular el número de parámetros libres `p`:
   - Matriz de transición: `K * (K - 1)` (cada fila es un símplex)
   - Parámetros de emisión: depende de la familia (ej., gaussiana con covarianza completa en `d` dimensiones: `K * (d + d*(d+1)/2)`)
   - Distribución inicial: `K - 1`

5.3. Calcular criterios de información:
   - `BIC = -2 * log_verosimilitud + p * log(T)`
   - `AIC = -2 * log_verosimilitud + 2 * p`
   - `AICc = AIC + 2*p*(p+1) / (T - p - 1)` (corrección para muestras pequeñas)

5.4. Seleccionar el modelo con el BIC más bajo (preferido por consistencia) o AIC (preferido para predicción). Reportar ambos.

5.5. Tabular resultados: para cada `K`, mostrar log-verosimilitud, número de parámetros, BIC, AIC y estado de convergencia.

5.6. Si el `K` óptimo está en la frontera de `state_range`, extender el rango y re-ajustar.

**Esperado:** Un mínimo claro en BIC/AIC que identifique el número óptimo de estados ocultos. El modelo seleccionado debería haber convergido y tener significados de estado interpretables.

**En caso de fallo:** Si no existe un mínimo claro (BIC monótonamente decreciente), el modelo puede estar mal especificado — considerar una familia de emisión diferente. Si todos los modelos tienen log-verosimilitud pobre, los datos pueden no seguir una estructura HMM.

### Paso 6: Validar con Datos Retenidos y Decodificación Posterior

6.1. Dividir datos en conjuntos de entrenamiento y validación (ej., 80/20 o usar múltiples secuencias si están disponibles).

6.2. Ajustar el modelo con datos de entrenamiento. Calcular la log-verosimilitud en datos retenidos usando el algoritmo forward (no re-ajustar parámetros).

6.3. **Decodificación posterior** (alternativa a Viterbi):
   - Para cada paso temporal, asignar el estado con la mayor probabilidad posterior: `z^_t = argmax_k(gamma[t,k])`
   - Esto maximiza el número esperado de estados correctamente decodificados (vs. Viterbi que maximiza la probabilidad conjunta de la ruta).

6.4. Comparar decodificación de Viterbi y posterior:
   - Calcular la tasa de acuerdo entre las dos secuencias decodificadas.
   - Las regiones de desacuerdo indican asignaciones de estado ambiguas.

6.5. Evaluar la interpretabilidad de los estados:
   - Examinar los parámetros de emisión para cada estado (medias, varianzas, distribuciones discretas).
   - Verificar que los estados correspondan a regímenes significativos en el contexto del dominio.
   - Verificar que los tiempos de permanencia en estado (implicados por la diagonal de `A`) sean razonables.

6.6. Calcular la log-verosimilitud de datos retenidos por observación y comparar a través de órdenes de modelo para confirmar la selección de modelo del conjunto de entrenamiento.

**Esperado:** La log-verosimilitud de datos retenidos es razonablemente cercana a la log-verosimilitud de entrenamiento (sin sobreajuste severo). La decodificación de Viterbi y posterior coinciden en 90%+ de los pasos temporales. Los estados tienen distribuciones de emisión distintas e interpretables.

**En caso de fallo:** Si la verosimilitud retenida es mucho peor que la de entrenamiento, el modelo está sobreajustando — reducir `K` o aumentar la regularización. Si los estados no son interpretables, intentar diferentes inicializaciones o una familia de emisión diferente.

## Validación

- [ ] La log-verosimilitud es monótonamente no decreciente a través de las iteraciones de Baum-Welch para cada reinicio
- [ ] La matriz de transición es fila-estocástica (filas suman 1, todas las entradas no negativas)
- [ ] Los parámetros de emisión están en el dominio válido (covarianzas definidas positivas, distribuciones de probabilidad válidas)
- [ ] La log-probabilidad de la ruta de Viterbi no excede la log-probabilidad total de la secuencia
- [ ] Las curvas de BIC/AIC muestran un mínimo claro en el orden de modelo seleccionado
- [ ] La log-verosimilitud de datos retenidos confirma que el modelo generaliza más allá del conjunto de entrenamiento
- [ ] Los cálculos de probabilidad forward y backward concuerdan: `P(O) = sum_k(alpha[T,k]) = sum_k(pi[k] * b_k(o_1) * beta[1,k])`

## Errores Comunes

- **Óptimos locales en EM**: El algoritmo de Baum-Welch converge a un máximo local, no necesariamente al global. Siempre usar múltiples reinicios aleatorios y seleccionar el mejor.
- **Desbordamiento numérico inferior**: Las probabilidades forward-backward se reducen exponencialmente con la longitud de la secuencia. Usar cómputo en espacio logarítmico o variables escaladas para prevenir desbordamiento inferior a cero.
- **Sobreajuste con demasiados estados**: Cada estado oculto adicional agrega `O(K + d^2)` parámetros. Usar BIC (no solo verosimilitud) para selección de modelo y validar con datos retenidos.
- **Intercambio de etiquetas**: Los estados ocultos son identificables solo hasta permutación. Al comparar modelos entre reinicios, emparejar estados por parámetros de emisión, no por índice.
- **Estados degenerados**: Un estado puede colapsar para explicar una única observación (gaussiana con varianza cercana a cero). La regularización en matrices de covarianza previene esto.
- **Confundir Viterbi y decodificación posterior**: Viterbi da la única mejor ruta conjunta; la decodificación posterior da el mejor estado marginal en cada paso temporal. Responden preguntas diferentes y pueden diferir significativamente.
- **Ignorar tiempos de permanencia en estado**: La distribución geométrica de tiempo de permanencia implícita en los HMM estándar puede ser un ajuste pobre para datos con duraciones de régimen largas. Considerar modelos ocultos semi-Markov si los tiempos de permanencia no son geométricos.

## Habilidades Relacionadas

- [Model Markov Chain](../model-markov-chain/SKILL.md) -- prerrequisito para entender la estructura de transición que subyace a la capa oculta
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md) -- puede usarse para generar datos HMM sintéticos para pruebas y para simular a partir de un modelo ajustado para verificaciones predictivas posteriores
