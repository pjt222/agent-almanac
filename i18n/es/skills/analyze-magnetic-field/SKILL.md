---
name: analyze-magnetic-field
description: >
  Calcular y visualizar campos magnéticos producidos por distribuciones de
  corriente usando la ley de Biot-Savart, la ley de Ampère y aproximaciones
  de dipolo magnético. Usar al calcular campos B de geometrías de corriente
  arbitrarias, al explotar simetría con la ley de Ampère, al analizar
  superposición de múltiples fuentes, o al caracterizar materiales magnéticos
  mediante permeabilidad, curvas B-H y comportamiento de histéresis.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, magnetic-fields, biot-savart, ampere, magnetic-materials
  locale: es
  source_locale: en
  source_commit: f39534628ba4bfee67e410b2b9856a7764214b26
  translator: claude
  translation_date: "2026-03-17"
---

# Analyze Magnetic Field

Calcular el campo magnético producido por una distribución de corriente dada, caracterizando la geometría de la fuente, seleccionando la ley apropiada (Biot-Savart para geometrías arbitrarias, ley de Ampère para configuraciones de alta simetría), evaluando integrales de campo, verificando casos límite, incorporando efectos de materiales magnéticos donde sea relevante, y visualizando la topología de líneas de campo resultante.

## Cuándo Usar

- Calcular el campo B de un conductor arbitrario portador de corriente (espira de alambre, hélice, trayectoria irregular)
- Explotar simetría cilíndrica, planar o toroidal para aplicar la ley de Ampère directamente
- Estimar comportamiento de campo lejano vía la aproximación de dipolo magnético
- Superponer campos de múltiples fuentes de corriente
- Analizar materiales magnéticos: permeabilidad lineal, curvas B-H, histéresis, saturación

## Entradas

- **Requerido**: Especificación de la distribución de corriente (geometría, magnitud y dirección de corriente)
- **Requerido**: Región de interés donde se necesita el campo (puntos de observación o volumen)
- **Opcional**: Propiedades del material (permeabilidad relativa, datos de curva B-H, coercitividad, remanencia)
- **Opcional**: Nivel de precisión deseado (integral exacta, orden de expansión multipolar, resolución numérica)
- **Opcional**: Requisitos de visualización (corte transversal 2D, líneas de campo 3D, mapa de contornos de magnitud)

## Procedimiento

### Paso 1: Caracterizar la Distribución de Corriente y Geometría

Especificar completamente la fuente antes de seleccionar un método:

1. **Trayectoria de corriente**: Describir la geometría de cada elemento portador de corriente. Para corrientes de línea, especificar la trayectoria como una curva paramétrica r'(t). Para corrientes de superficie, especificar la densidad de corriente superficial K (A/m). Para corrientes de volumen, especificar J (A/m^2).
2. **Sistema de coordenadas**: Elegir coordenadas alineadas con la simetría dominante. Cilíndricas (rho, phi, z) para alambres y solenoides. Esféricas (r, theta, phi) para dipolos y espiras a grandes distancias. Cartesianas para láminas planas.
3. **Análisis de simetría**: Identificar simetrías traslacionales, rotacionales y de reflexión. Una simetría de la fuente es una simetría del campo. Documentar qué componentes de B son no nulas por simetría y cuáles se anulan.
4. **Continuidad de corriente**: Verificar que la distribución de corriente satisface div(J) = 0 (estado estacionario) o div(J) = -d(rho)/dt (variable en el tiempo). Las distribuciones de corriente inconsistentes producen campos no físicos.

```markdown
## Source Characterization
- **Current type**: [line I / surface K / volume J]
- **Geometry**: [parametric description]
- **Coordinate system**: [and justification]
- **Symmetries**: [translational / rotational / reflection]
- **Nonzero B-components by symmetry**: [list]
- **Current continuity**: [verified / issue noted]
```

**Esperado:** Una descripción geométrica completa de la distribución de corriente con sistema de coordenadas elegido, simetrías catalogadas y continuidad de corriente verificada.

**En caso de fallo:** Si la geometría es demasiado compleja para una descripción paramétrica de forma cerrada, discretizar en segmentos rectos cortos (Biot-Savart numérico). Si la continuidad de corriente es violada, agregar corriente de desplazamiento o términos de acumulación de carga de retorno antes de proceder.

### Paso 2: Seleccionar la Ley Apropiada

Elegir el método que coincida con la simetría y complejidad del problema:

1. **Ley de Ampère** (alta simetría): Usar cuando la distribución de corriente tiene suficiente simetría para que B pueda extraerse de la integral de línea. Casos aplicables:
   - Alambre recto infinito (simetría cilíndrica) -> espira amperiana circular
   - Solenoide infinito (traslacional + rotacional) -> espira amperiana rectangular
   - Toroide (rotacional alrededor del eje del anillo) -> espira amperiana circular
   - Lámina de corriente plana infinita (traslacional en dos direcciones) -> espira rectangular

2. **Ley de Biot-Savart** (general): Usar para geometrías arbitrarias donde la ley de Ampère no puede simplificar:
   - dB = (mu_0 / 4 pi) * (I dl' x r_hat) / r^2
   - Para corrientes de volumen: B(r) = (mu_0 / 4 pi) * integral de (J(r') x r_hat) / r^2 dV'

3. **Aproximación de dipolo magnético** (campo lejano): Usar cuando el punto de observación está lejos de la fuente (r >> dimensión de la fuente d):
   - Calcular el momento de dipolo magnético: m = I * A * n_hat (para una espira plana de área A)
   - B_dipolo(r) = (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3
   - Válido cuando r/d > 5 para ~1% de precisión

4. **Superposición**: Para múltiples fuentes, calcular B de cada una independientemente y sumar vectorialmente. La linealidad de las ecuaciones de Maxwell garantiza que esto es exacto.

```markdown
## Method Selection
- **Primary method**: [Ampere / Biot-Savart / dipole]
- **Justification**: [symmetry argument or distance criterion]
- **Expected complexity**: [closed-form / single integral / numerical]
- **Fallback method**: [if primary fails or for cross-validation]
```

**Esperado:** Una elección justificada de método con una declaración clara de por qué la ley elegida es apropiada para el nivel de simetría del problema.

**En caso de fallo:** Si se elige la ley de Ampère pero la simetría es insuficiente (B no puede extraerse de la integral), recurrir a Biot-Savart. Si la geometría de la fuente es demasiado compleja para Biot-Savart analítico, discretizar numéricamente.

### Paso 3: Configurar y Evaluar Integrales de Campo

Ejecutar el cálculo usando el método seleccionado en el Paso 2:

1. **Trayectoria de la ley de Ampère**: Para cada espira amperiana:
   - Parametrizar la trayectoria de la espira y calcular la integral de línea de B . dl
   - Calcular la corriente encerrada I_enc contando todas las corrientes que atraviesan la espira
   - Resolver: integral_de_contorno(B . dl) = mu_0 * I_enc
   - Extraer B de la integral usando la simetría establecida en el Paso 1

2. **Integración de Biot-Savart**: Para cada punto de campo r:
   - Parametrizar la fuente: dl' = (dr'/dt) dt o expresar J(r') sobre el volumen
   - Calcular el vector de desplazamiento: r - r' y su magnitud |r - r'|
   - Evaluar el producto vectorial: dl' x (r - r') o J x (r - r')
   - Integrar sobre la fuente (línea, superficie o volumen)
   - Para evaluación analítica: explotar simetría para reducir dimensionalidad (ej., el campo en el eje de una espira involucra solo una integral)
   - Para evaluación numérica: discretizar en N segmentos, calcular la suma y verificar convergencia duplicando N

3. **Cálculo de dipolo**:
   - Calcular el momento magnético total: m = (1/2) integral de (r' x J) dV' para corrientes de volumen, o m = I * A * n_hat para una espira plana
   - Aplicar la fórmula del campo dipolar en cada punto de observación
   - Estimar el error: la siguiente corrección multipolar (cuadrupolar) escala como (d/r)^4

4. **Ensamblaje de superposición**: Sumar contribuciones de todas las fuentes en cada punto de observación. Rastrear componentes separadamente para preservar la precisión de cancelación.

```markdown
## Field Calculation
- **Integral setup**: [explicit expression]
- **Evaluation method**: [analytic / numeric with N segments]
- **Result**: B(r) = [expression with units]
- **Convergence check** (if numerical): [N vs. 2N comparison]
```

**Esperado:** Una expresión explícita para B(r) en los puntos de observación, con unidades correctas (Tesla o Gauss) y una verificación de convergencia para resultados numéricos.

**En caso de fallo:** Si la integral diverge, verificar si falta una regularización (ej., el campo en el alambre mismo diverge para un alambre infinitamente delgado -- usar radio de alambre finito). Si los resultados numéricos oscilan con N, el integrando tiene una casi-singularidad que requiere cuadratura adaptativa o sustracción analítica de la parte singular.

### Paso 4: Verificar Casos Límite

Verificar el resultado contra la física conocida antes de confiar en él:

1. **Límite de dipolo de campo lejano**: A gran r, cualquier distribución de corriente localizada debería producir un campo que coincida con la fórmula del dipolo magnético. Calcular B del resultado en el límite r -> infinito y comparar con (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3.

2. **Límite de alambre infinito de campo cercano**: Cerca de un segmento recto largo del conductor (distancia rho << longitud L), el campo debería aproximarse a B = mu_0 I / (2 pi rho). Verificar esto para la porción relevante de la geometría.

3. **Casos especiales en el eje**: Para espiras y solenoides, el campo en el eje tiene formas cerradas simples:
   - Espira circular única de radio R a distancia z en el eje: B_z = mu_0 I R^2 / [2 (R^2 + z^2)^(3/2)]
   - Solenoide de longitud L, n vueltas por longitud: B_interior = mu_0 n I (para L >> R)

4. **Consistencia de simetría**: Verificar que los componentes predichos como nulos por simetría (Paso 1) sean efectivamente cero en el resultado calculado. Un componente prohibido no nulo indica un error.

5. **Análisis dimensional**: Verificar que B tiene unidades de Tesla. Cada término debería llevar mu_0 * [corriente] / [longitud] o equivalente.

```markdown
## Limiting Case Verification
| Case | Condition | Expected | Computed | Match |
|------|-----------|----------|----------|-------|
| Far-field dipole | r >> d | mu_0 m / (4 pi r^3) scaling | [result] | [Yes/No] |
| Near-field wire | rho << L | mu_0 I / (2 pi rho) | [result] | [Yes/No] |
| On-axis formula | [geometry] | [known result] | [result] | [Yes/No] |
| Symmetry zeros | [component] | 0 | [result] | [Yes/No] |
| Units | -- | Tesla | [check] | [Yes/No] |
```

**Esperado:** Todos los casos límite coinciden. El campo tiene las unidades correctas, la simetría y el comportamiento asintótico correctos.

**En caso de fallo:** Un caso límite fallido indica un error en la configuración o evaluación de la integral. Las causas más comunes son: signo incorrecto en el producto vectorial, factor faltante de 2 o pi, límites de integración incorrectos, o una discrepancia de sistema de coordenadas entre las parametrizaciones de la fuente y el punto de campo.

### Paso 5: Incorporar Materiales Magnéticos y Visualizar

Extender el análisis para incluir efectos de materiales y producir visualizaciones del campo:

1. **Materiales magnéticos lineales**: Reemplazar mu_0 con mu = mu_r * mu_0 dentro del material. Aplicar condiciones de contorno en interfaces de materiales:
   - Componente normal: B1_n = B2_n (continuo)
   - Componente tangencial: H1_t - H2_t = K_libre (corriente libre superficial)
   - En ausencia de corrientes libres superficiales: H1_t = H2_t

2. **Materiales no lineales (curvas B-H)**: Para núcleos ferromagnéticos:
   - Usar la curva B-H del material para relacionar B y H en cada punto
   - Para propósitos de diseño, aproximar con segmentos lineales por tramos: región lineal (B = mu H), región de rodilla, y región de saturación (B aproximadamente constante)
   - Tener en cuenta la histéresis si el punto de operación es cíclico: la magnetización remanente B_r y el campo coercitivo H_c definen el lazo

3. **Efectos de desmagnetización**: Para materiales magnéticos de geometría finita (ej., barras cortas, esferas), el campo interno se reduce por el factor de desmagnetización N_d: H_interno = H_aplicado - N_d * M.

4. **Visualización del campo**:
   - Graficar líneas de campo usando la función de flujo o integrando dB/ds a lo largo de la dirección del campo
   - Graficar contornos de magnitud (|B| como un mapa de color)
   - Para cortes transversales 2D, indicar la dirección de la corriente (puntos para fuera de la página, cruces para dentro de la página)
   - Verificar que las líneas de campo formen lazos cerrados (div B = 0) -- líneas de campo abiertas indican un error de visualización o cálculo

5. **Verificación de intuición física**: Confirmar que el patrón del campo tiene sentido cualitativo. El campo debería ser más fuerte cerca de la fuente de corriente, debería circular alrededor de las corrientes (regla de la mano derecha), y debería decaer con la distancia.

```markdown
## Material Effects and Visualization
- **Material model**: [vacuum / linear mu_r / nonlinear B-H / hysteretic]
- **Boundary conditions applied**: [list interfaces]
- **Visualization**: [field lines / magnitude contour / both]
- **Div B = 0 check**: [field lines close / verified numerically]
```

**Esperado:** Una solución de campo completa incluyendo efectos de materiales donde sea relevante, con una visualización que muestre líneas de campo cerradas consistentes con div B = 0 y comportamiento cualitativo que coincida con la intuición física.

**En caso de fallo:** Si las líneas de campo no se cierran, el cálculo tiene un error de divergencia -- revisar la integral o el método numérico. Si el material introduce amplificación de campo inesperada, verificar que mu_r se aplique solo dentro del volumen del material y que las condiciones de contorno estén correctamente aplicadas en cada interfaz.

## Validación

- [ ] La distribución de corriente está completamente especificada con geometría, magnitud y dirección
- [ ] La continuidad de corriente (div J = 0 para estado estacionario) está verificada
- [ ] El sistema de coordenadas está alineado con la simetría dominante
- [ ] La selección de método (Ampère / Biot-Savart / dipolo) está justificada por análisis de simetría
- [ ] Las integrales de campo están configuradas con productos vectoriales y límites correctos
- [ ] Los resultados numéricos muestran convergencia (prueba N vs. 2N)
- [ ] El límite de dipolo de campo lejano está verificado
- [ ] Los límites de campo cercano y en el eje coinciden con fórmulas conocidas
- [ ] Los componentes de simetría prohibidos son cero
- [ ] Las unidades son Tesla en todo el resultado
- [ ] Las condiciones de contorno de materiales están correctamente aplicadas (si aplica)
- [ ] Las líneas de campo forman lazos cerrados (div B = 0)

## Errores Comunes

- **Dirección incorrecta del producto vectorial**: El producto vectorial de Biot-Savart es dl' x r_hat (fuente a campo), no r_hat x dl'. Invertir esto invierte toda la dirección del campo. Usar la regla de la mano derecha como verificación rápida.
- **Confundir B y H**: En el vacío B = mu_0 H, pero dentro de materiales magnéticos B = mu H. La ley de Ampère en términos de H usa solo corriente libre; en términos de B incluye corrientes ligadas (de magnetización). Mezclar convenciones produce errores de factores de mu_r.
- **Aplicar la ley de Ampère sin simetría suficiente**: La ley de Ampère siempre es verdadera pero solo es útil cuando la simetría permite extraer B de la integral. Si B varía a lo largo de la espira amperiana, la ley da una sola ecuación escalar para una función que varía espacialmente -- subdeterminada.
- **Ignorar la longitud finita de alambres "infinitos"**: Los solenoides y alambres reales tienen extremos. La fórmula de alambre infinito o solenoide infinito es válida solo lejos de los extremos (distancia al extremo >> radio). Cerca de los extremos, usar la integral completa de Biot-Savart o correcciones de solenoide finito.
- **Descuidar la desmagnetización en geometrías finitas**: Una esfera o barra corta magnetizada no tiene el mismo campo interno que una barra larga en el mismo campo aplicado. El factor de desmagnetización puede reducir el campo interno efectivo entre 30-100% dependiendo de la relación de aspecto.
- **Líneas de campo no físicas**: Si una visualización muestra líneas de campo que comienzan o terminan en el espacio libre (no en una fuente de corriente o en el infinito), el cálculo o algoritmo de graficado tiene un error. Las líneas de campo magnético siempre forman lazos cerrados.

## Habilidades Relacionadas

- `solve-electromagnetic-induction` -- usar el campo B calculado para analizar flujo variable en el tiempo y FEM inducida
- `formulate-maxwell-equations` -- generalizar al conjunto completo de ecuaciones de Maxwell incluyendo corriente de desplazamiento y propagación de ondas
- `design-electromagnetic-device` -- aplicar análisis de campo magnético al diseño de electroimanes, motores y transformadores
- `formulate-quantum-problem` -- tratamiento cuántico de interacciones magnéticas (efecto Zeeman, acoplamiento espín-órbita)
