---
name: analyze-magnetic-levitation
description: >
  Analizar sistemas de levitación magnética aplicando el teorema de Earnshaw
  para determinar si la levitación estática pasiva es posible, luego
  identificando el mecanismo de elusión apropiado (diamagnético, superconductor,
  retroalimentación activa o estabilizado por giro). Usar al evaluar transporte
  maglev, rodamientos magnéticos, levitación superconductora, suspensión
  diamagnética o dispositivos tipo Levitron. Cubre cálculos de balance de
  fuerzas, análisis de estabilidad en todos los modos espaciales y de
  inclinación, y distinciones entre efecto Meissner y anclaje de flujo.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: levitation
  complexity: advanced
  language: natural
  tags: levitation, magnetic-levitation, earnshaw-theorem, superconducting, diamagnetic, maglev
  locale: es
  source_locale: en
  source_commit: f39534628ba4bfee67e410b2b9856a7764214b26
  translator: claude
  translation_date: "2026-03-17"
---

# Analyze Magnetic Levitation

Determinar si un sistema magnético dado puede lograr levitación estable, identificar qué mecanismo físico lo permite o lo prohíbe, calcular las condiciones para el balance de fuerzas y la estabilidad, y verificar que la levitación es estable frente a perturbaciones en todos los grados de libertad espaciales incluyendo modos de inclinación.

## Cuándo Usar

- Evaluar si un diseño de levitación magnética propuesto es físicamente viable
- Determinar por qué una disposición de imanes permanentes no logra levitar e identificar una solución alternativa
- Analizar sistemas de levitación superconductora (efecto Meissner, anclaje de flujo, atrapamiento de estado mixto)
- Diseñar o solucionar problemas de levitación electromagnética con retroalimentación activa (trenes maglev, rodamientos magnéticos)
- Evaluar la viabilidad de levitación diamagnética para un material y fuerza de campo dados
- Comprender la dinámica de levitación magnética estabilizada por giro (Levitron)

## Entradas

- **Requerido**: Descripción del objeto levitado (masa, geometría, momento magnético o susceptibilidad)
- **Requerido**: Descripción de la fuente de campo (imanes permanentes, electroimanes, bobinas superconductoras, geometría de la disposición)
- **Opcional**: Ambiente de operación (temperatura, vacío, restricciones de vibración)
- **Opcional**: Altura de levitación o separación deseada
- **Opcional**: Requisitos de estabilidad (rigidez, amortiguamiento, ancho de banda para sistemas activos)

## Procedimiento

### Paso 1: Caracterizar el Sistema

Establecer la descripción física completa del objeto y la fuente de campo antes de cualquier análisis:

1. **Propiedades del objeto**: Registrar la masa m, geometría (esfera, disco, varilla), momento magnético mu (para objetos de imán permanente), susceptibilidad magnética volumétrica chi_v (para materiales paramagnéticos, diamagnéticos o ferromagnéticos), y conductividad eléctrica sigma (relevante para efectos de corrientes de Foucault).
2. **Propiedades de la fuente de campo**: Describir la configuración de la fuente -- arreglo de imanes permanentes (Halbach, dipolo, cuadrupolo), electroimán con parámetros de bobina (vueltas, corriente, material del núcleo), o bobina superconductora (corriente crítica, campo crítico).
3. **Geometría del campo**: Determinar el perfil espacial del campo magnético B(r). Identificar el gradiente de campo dB/dz a lo largo del eje de levitación y la curvatura d^2B/dz^2 que gobierna la estabilidad.
4. **Restricciones ambientales**: Anotar el rango de temperatura (criogénico para superconductores), atmósfera (el vacío reduce el amortiguamiento) y espectro de vibración.

```markdown
## System Characterization
- **Object**: [mass, geometry, mu or chi_v, sigma]
- **Field source**: [type, configuration, key parameters]
- **Field profile**: [B(r) functional form or measured map]
- **Gradient**: [dB/dz at intended levitation point]
- **Environment**: [temperature, pressure, vibration]
```

**Esperado:** Una especificación completa del objeto y la fuente de campo suficiente para determinar fuerzas y estabilidad sin suposiciones adicionales.

**En caso de fallo:** Si la susceptibilidad magnética o el momento son desconocidos, medirlos o estimarlos a partir de tablas de datos de materiales. Sin esta cantidad, los cálculos de fuerza son imposibles. Para objetos compuestos, calcular una susceptibilidad efectiva a partir del promedio ponderado por volumen.

### Paso 2: Aplicar el Teorema de Earnshaw

Determinar si la levitación estática pasiva es posible para el sistema dado:

1. **Enunciar el teorema de Earnshaw**: En una región libre de corrientes y campos variables en el tiempo, ninguna disposición estática de cargas o imanes permanentes puede producir un punto de equilibrio estable para un cuerpo paramagnético o ferromagnético. Matemáticamente, el Laplaciano de la energía potencial magnética satisface nabla^2 U >= 0 (para paramagnético/ferromagnético), por lo que U no tiene mínimo local.
2. **Clasificar la respuesta del objeto**: Determinar si el objeto levitado es paramagnético (chi_v > 0), diamagnético (chi_v < 0), ferromagnético (chi_v >> 0, no lineal), superconductor (diamagneto perfecto, chi_v = -1), o un imán permanente (mu fijo).
3. **Aplicar el teorema**:
   - Para objetos paramagnéticos, ferromagnéticos o de imán permanente en un campo estático de imanes permanentes o corrientes fijas: Earnshaw prohíbe la levitación estable. Al menos una dirección espacial será inestable.
   - Para objetos diamagnéticos: Earnshaw NO prohíbe la levitación. nabla^2 U <= 0 permite un mínimo local de energía. La levitación estática pasiva está permitida.
   - Para superconductores: El efecto Meissner proporciona diamagnetismo perfecto, y el anclaje de flujo puede proporcionar tanto levitación como estabilidad lateral.
4. **Documentar el veredicto**: Declarar claramente si el sistema está prohibido por Earnshaw o permitido por Earnshaw, y qué propiedad material determina la clasificación.

```markdown
## Earnshaw Analysis
- **Object magnetic classification**: [paramagnetic / diamagnetic / ferromagnetic / superconducting / permanent magnet]
- **Susceptibility**: chi_v = [value with units]
- **Earnshaw verdict**: [FORBIDDEN / PERMITTED]
- **Reasoning**: [which condition of the theorem applies or fails]
```

**Esperado:** Una clasificación definitiva de si la levitación propuesta está prohibida o permitida por Earnshaw, con el razonamiento físico específico documentado.

**En caso de fallo:** Si el objeto tiene carácter magnético mixto (ej., un núcleo ferromagnético con una capa diamagnética), analizar cada componente por separado. La estabilidad general depende del paisaje energético neto, que puede requerir cálculo numérico del campo.

### Paso 3: Identificar el Mecanismo de Elusión

Si el teorema de Earnshaw prohíbe la levitación estática pasiva, identificar cuál de los cuatro mecanismos estándar de elusión aplica:

1. **Levitación diamagnética**: El objeto levitado en sí es diamagnético (chi_v < 0). Ejemplos: grafito pirolítico sobre imanes NdFeB, gotas de agua y ranas en electroimanes Bitter de 16 T. Requiere gradientes de campo fuertes; la condición es (chi_v / mu_0) * B * (dB/dz) >= rho * g, donde rho es la densidad.

2. **Levitación superconductora**: El objeto es un superconductor tipo I o tipo II por debajo de T_c.
   - **Levitación Meissner**: La expulsión completa de flujo proporciona una fuerza repulsiva. Estable pero con capacidad de carga limitada y requiere que el superconductor permanezca en el estado Meissner (B < B_c1).
   - **Anclaje de flujo** (superconductores tipo II): Los vórtices de flujo magnético se anclan en sitios de defectos en el material. Esto proporciona tanto fuerza de levitación vertical como fuerza restauradora lateral, permitiendo que el superconductor se suspenda debajo o encima del imán. El objeto queda bloqueado en posición 3D relativa a la fuente de campo.

3. **Retroalimentación electromagnética activa**: Sensores miden la posición del objeto, y un controlador ajusta las corrientes del electroimán para mantener el equilibrio. Ejemplos: trenes maglev EMS (Transrapid), rodamientos magnéticos activos. Requiere fuente de alimentación, sensores y un sistema de control con ancho de banda que exceda la frecuencia de resonancia mecánica.

4. **Levitación estabilizada por giro**: Un imán permanente giratorio (Levitron) logra una estabilización giroscópica del modo de inclinación que el teorema de Earnshaw de otra manera hace inestable. El giro debe exceder una frecuencia crítica omega_c para que la rigidez giroscópica supere el par magnético. El objeto también debe permanecer dentro de una ventana de masa estrecha.

```markdown
## Circumvention Mechanism
- **Mechanism**: [diamagnetic / superconducting (Meissner or flux pinning) / active feedback / spin-stabilized]
- **Physical basis**: [why this mechanism evades Earnshaw's theorem]
- **Key requirements**: [material property, field strength, temperature, spin rate, or control bandwidth]
- **Limitations**: [load capacity, power consumption, cryogenics, mass window]
```

**Esperado:** Identificación del mecanismo específico con su base física claramente explicada, incluyendo requisitos cuantitativos para que el mecanismo funcione.

**En caso de fallo:** Si el sistema no encaja claramente en ninguno de los cuatro mecanismos, verificar enfoques híbridos (ej., imanes permanentes para la fuerza principal con amortiguamiento por corrientes de Foucault para estabilidad, o estabilización diamagnética de un sistema paramagnético). También considerar si el sistema usa levitación electrodinámica (conductores en movimiento en un campo magnético), que es un mecanismo distinto basado en la ley de Lenz.

### Paso 4: Calcular las Condiciones de Levitación

Calcular el balance de fuerzas y las condiciones cuantitativas para la levitación estable:

1. **Balance de fuerza vertical**: La fuerza magnética debe igualar la gravedad.
   - Para un dipolo magnético en un gradiente de campo: F_z = mu * (dB/dz) = m * g.
   - Para un objeto diamagnético: F_z = (chi_v * V / mu_0) * B * (dB/dz) = m * g.
   - Para un superconductor (método de imagen): Modelar el superconductor como un espejo y calcular la repulsión entre el imán y su imagen.
   - Para retroalimentación activa: F_z = k_coil * I(t), donde I(t) es la corriente controlada por retroalimentación.

2. **Resolver la altura de levitación**: La ecuación de balance de fuerzas F_z(z) = m * g determina la altura de equilibrio z_0. Para perfiles de campo analíticos, resolver algebraicamente. Para campos medidos o calculados numéricamente, resolver gráfica o numéricamente.

3. **Gradiente de fuerza restauradora (rigidez)**: Calcular k_z = -dF_z/dz evaluado en z_0. Para levitación estable, k_z > 0 (la fuerza disminuye con el aumento de altura). La frecuencia natural de oscilación vertical es omega_z = sqrt(k_z / m).

4. **Rigidez lateral**: Calcular el gradiente de fuerza restauradora en el plano horizontal, k_x = -dF_x/dx. Para sistemas permitidos por Earnshaw (diamagnéticos, superconductores), esto debería ser positivo. Para sistemas de retroalimentación, depende de la geometría sensor-actuador.

5. **Capacidad de carga**: Determinar la masa máxima que puede levitarse encontrando el gradiente de campo en el cual el equilibrio se vuelve marginalmente estable (k_z -> 0 en el desplazamiento máximo).

```markdown
## Levitation Conditions
- **Force balance equation**: [F_z(z) = m*g, explicit form]
- **Equilibrium height**: z_0 = [value]
- **Vertical stiffness**: k_z = [value, units N/m]
- **Vertical natural frequency**: omega_z = [value, units rad/s]
- **Lateral stiffness**: k_x = k_y = [value, units N/m]
- **Maximum load**: m_max = [value, units kg]
```

**Esperado:** Un balance de fuerzas completo con la posición de equilibrio determinada, valores de rigidez calculados para direcciones vertical y lateral, y la capacidad de carga estimada.

**En caso de fallo:** Si el balance de fuerzas no tiene solución (fuerza magnética demasiado débil para superar la gravedad), el sistema no puede levitar el objeto especificado. O aumentar el gradiente de campo (imanes más fuertes, espaciado más cercano), reducir la masa del objeto, o cambiar a un material con mayor susceptibilidad. Si la rigidez es negativa en cualquier dirección, el equilibrio es inestable en esa dirección — volver al Paso 3 para identificar un mecanismo de estabilización apropiado.

### Paso 5: Verificar la Estabilidad en Todos los Grados de Libertad

Confirmar que la levitación es estable frente a perturbaciones en los seis grados de libertad de cuerpo rígido (tres traslaciones, tres rotaciones):

1. **Estabilidad traslacional**: Verificar k_z > 0, k_x > 0, k_y > 0. Para sistemas axialmente simétricos, k_x = k_y por simetría. Calcular la fuerza restauradora para pequeños desplazamientos delta_x, delta_y, delta_z desde el equilibrio.

2. **Estabilidad de inclinación**: Calcular el par restaurador para pequeñas deflexiones angulares theta_x, theta_y alrededor de los ejes horizontales. Para un dipolo magnético, el par depende de la curvatura del campo y el momento de inercia del objeto. La inestabilidad de inclinación es el modo de fallo principal de la levitación pasiva con imanes permanentes (y el modo que aborda la estabilización por giro en el Levitron).

3. **Estabilidad de giro** (si aplica): Para sistemas estabilizados por giro, verificar que la tasa de giro excede la frecuencia crítica omega > omega_c. La frecuencia crítica está determinada por la relación entre el par magnético y el momento angular. Por debajo de omega_c, la precesión conduce a inestabilidad de inclinación.

4. **Estabilidad dinámica**: Para sistemas de retroalimentación activa, verificar que el lazo de control tiene margen de fase suficiente (> 30 grados) y margen de ganancia (> 6 dB) en todas las frecuencias de resonancia. Comprobar que el ruido del sensor no excita inestabilidad.

5. **Perturbaciones térmicas y externas**: Evaluar el efecto de fluctuaciones de temperatura (crítico para superconductores cerca de T_c), corrientes de aire (significativo para levitación diamagnética de objetos ligeros) y vibración mecánica (transmitida a través del montaje de la fuente de campo).

```markdown
## Stability Analysis
| Degree of Freedom | Stiffness / Restoring | Stable? | Notes |
|-------------------|----------------------|---------|-------|
| Vertical (z)      | k_z = [value]        | [Yes/No] | [primary levitation axis] |
| Lateral (x)       | k_x = [value]        | [Yes/No] | |
| Lateral (y)       | k_y = [value]        | [Yes/No] | |
| Tilt (theta_x)    | tau_x = [value]      | [Yes/No] | [most common failure mode] |
| Tilt (theta_y)    | tau_y = [value]      | [Yes/No] | |
| Spin (theta_z)    | [N/A or value]       | [Yes/No] | [only relevant for spin-stabilized] |
```

**Esperado:** Los seis grados de libertad son inherentemente estables (fuerza/par restaurador positivo) o estabilizados por un mecanismo identificado (retroalimentación, giroscópico, anclaje de flujo). Se confirma que el sistema es viable para levitación.

**En caso de fallo:** Si algún grado de libertad es inestable y no se identifica un mecanismo de estabilización, el diseño de levitación no es viable como se especificó. La corrección más común es agregar un lazo de retroalimentación activa para la dirección inestable, agregar material diamagnético para estabilización pasiva de un modo lateral, o aumentar la tasa de giro para estabilización giroscópica. Volver al Paso 3 para incorporar el mecanismo adicional.

## Validación

- [ ] Las propiedades del objeto (masa, susceptibilidad o momento magnético, geometría) están completamente especificadas
- [ ] La fuente de campo y el perfil espacial están caracterizados con gradientes calculados
- [ ] El teorema de Earnshaw se aplica correctamente a la clasificación magnética del objeto
- [ ] El mecanismo de elusión se identifica con su base física explicada
- [ ] El balance de fuerzas se resuelve con la posición de equilibrio determinada
- [ ] La rigidez se calcula para las tres direcciones de traslación
- [ ] La estabilidad de inclinación se analiza para ambos ejes horizontales de inclinación
- [ ] Para sistemas estabilizados por giro, la tasa crítica de giro se calcula y verifica
- [ ] Para sistemas activos, el ancho de banda de control y los márgenes de estabilidad se verifican
- [ ] Los límites de capacidad de carga se estiman

## Errores Comunes

- **Asumir que imanes permanentes pueden levitarse mutuamente de forma estática**: El teorema de Earnshaw lo prohíbe para objetos paramagnéticos y ferromagnéticos, sin embargo es la concepción errónea más común. La atracción o repulsión a lo largo de un eje siempre produce inestabilidad a lo largo de un eje perpendicular. Siempre aplicar el teorema antes de intentar cálculos de balance de fuerzas.
- **Confundir levitación Meissner con anclaje de flujo**: El efecto Meissner (tipo I) produce repulsión pura y solo funciona con el superconductor debajo del imán. El anclaje de flujo (tipo II) bloquea el superconductor en una posición fija relativa al campo, permitiendo suspensión en cualquier orientación. La física y las implicaciones de diseño son fundamentalmente diferentes.
- **Ignorar los modos de inclinación**: Muchos análisis verifican solo la estabilidad traslacional y declaran el sistema estable. La inestabilidad de inclinación es el modo de fallo principal para la levitación magnética pasiva y requiere análisis separado. Un sistema puede tener rigidez traslacional positiva en todas las direcciones mientras es inestable en inclinación.
- **Subestimar los requisitos de campo para levitación diamagnética**: Las susceptibilidades diamagnéticas son muy pequeñas (chi_v ~ -10^-5 para la mayoría de materiales, -4.5 x 10^-4 para grafito pirolítico). Levitar incluso objetos de escala miligramos requiere gradientes de campo fuertes, típicamente B * dB/dz > 1000 T^2/m para materiales que no son grafito.
- **Descuidar los efectos de corrientes de Foucault**: Campos variables en el tiempo o conductores en movimiento generan corrientes de Foucault que producen tanto fuerzas como calentamiento. En sistemas de retroalimentación activa, las corrientes de Foucault en el objeto levitado crean retardo de fase que puede desestabilizar el lazo de control.
- **Tratar superconductores como diamagnetos perfectos en todas las condiciones**: Los superconductores tipo II en el estado mixto (B_c1 < B < B_c2) tienen penetración parcial de flujo. La fuerza de levitación depende de la historia de magnetización (histéresis), no solo del campo instantáneo.

## Habilidades Relacionadas

- `evaluate-levitation-mechanism` -- análisis comparativo para seleccionar el mejor enfoque de levitación para una aplicación
- `analyze-magnetic-field` -- cálculo detallado de perfiles de campo magnético necesarios como entrada para esta habilidad
- `formulate-maxwell-equations` -- derivar las ecuaciones de campo electromagnético que gobiernan el sistema de levitación
- `design-acoustic-levitation` -- enfoque alternativo de levitación no magnética para comparación
- `formulate-quantum-problem` -- tratamiento de mecánica cuántica para levitación superconductora (teoría BCS, Ginzburg-Landau)
