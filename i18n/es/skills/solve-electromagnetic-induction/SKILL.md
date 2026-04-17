---
name: solve-electromagnetic-induction
description: >
  Resolver problemas que involucran flujo magnético cambiante usando la ley de
  Faraday, la ley de Lenz, FEM motriz, inductancia mutua y propia, y transitorios
  de circuitos RL. Usar al calcular FEM inducida por campos B variables en el
  tiempo o conductores en movimiento, al determinar la dirección de la corriente
  mediante la ley de Lenz, al analizar inductancia y almacenamiento de energía
  en campos magnéticos, o al resolver ecuaciones diferenciales de circuitos RL
  para transitorios de conmutación.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, induction, faraday, lenz, inductance, rl-circuits
  locale: es
  source_locale: en
  source_commit: f39534628ba4bfee67e410b2b9856a7764214b26
  translator: claude
  translation_date: "2026-03-17"
---

# Solve Electromagnetic Induction

Analizar fenómenos de inducción electromagnética identificando la fuente del flujo magnético cambiante, calculando el flujo a través de la superficie relevante, aplicando la ley de Faraday para obtener la FEM inducida, determinando la dirección de la corriente inducida mediante la ley de Lenz, y resolviendo las ecuaciones de circuito resultantes incluyendo transitorios RL y energía almacenada en el campo magnético.

## Cuándo Usar

- Calcular la FEM inducida en un lazo o bobina debido a un campo magnético variable en el tiempo
- Analizar FEM motriz de un conductor moviéndose a través de un campo B estático
- Determinar la dirección de la corriente inducida usando la ley de Lenz
- Calcular inductancia mutua entre bobinas acopladas o autoinductancia de una sola bobina
- Resolver transitorios de circuitos RL (energización, des-energización, conmutación entre estados)
- Calcular energía almacenada en un campo magnético o en un inductor

## Entradas

- **Requerido**: Fuente del flujo cambiante (campo B variable en el tiempo, conductor en movimiento, o área del lazo cambiante)
- **Requerido**: Geometría del circuito o lazo a través del cual se calcula el flujo
- **Requerido**: Parámetros físicos relevantes (magnitud del campo B, velocidad, resistencia, inductancia, o geometría para cálculo de inductancia)
- **Opcional**: Elementos de circuito conectados al lazo de inducción (resistores, inductores adicionales, fuentes)
- **Opcional**: Condiciones iniciales para análisis de transitorios (corriente inicial, energía almacenada inicial)
- **Opcional**: Intervalo de tiempo de interés para soluciones transitorias

## Procedimiento

### Paso 1: Identificar la Fuente del Flujo Cambiante

Clasificar el mecanismo físico que produce un flujo magnético variable en el tiempo:

1. **Campo B cambiante**: El campo magnético mismo varía en el tiempo (ej., electroimán AC, imán acercándose, rampa de corriente en una bobina cercana). El lazo es estacionario.
2. **Área cambiante**: El área del lazo cambia (ej., lazo expandiéndose o contrayéndose, bobina rotando en un campo estático). El campo B puede ser estático.
3. **Conductor en movimiento (FEM motriz)**: Un conductor recto se mueve a través de un campo B estático. El cambio de flujo surge del conductor barriendo área.
4. **Combinado**: Tanto el campo como la geometría cambian simultáneamente (ej., una bobina rotando en un campo variable en el tiempo). Separar las contribuciones para claridad.

Para cada mecanismo, identificar la superficie relevante S delimitada por el lazo del circuito C:

```markdown
## Flux Change Classification
- **Mechanism**: [changing B / changing area / motional / combined]
- **Surface S**: [description of the surface bounded by the loop]
- **Time dependence**: [which quantities vary: B(t), A(t), v(t), theta(t)]
- **Relevant parameters**: [B magnitude, loop dimensions, velocity, angular frequency]
```

**Esperado:** Una identificación clara de por qué el flujo cambia, sobre qué superficie integrar, y qué cantidades físicas portan la dependencia temporal.

**En caso de fallo:** Si la fuente del flujo cambiante es ambigua (ej., un lazo deformándose en un campo no uniforme), descomponer el problema en una suma de contribuciones: una del cambio de campo a geometría fija, y una del cambio de geometría en el campo instantáneo. Esta descomposición es siempre válida.

### Paso 2: Calcular el Flujo Magnético a Través de la Superficie Relevante

Calcular el flujo magnético Phi_B = integral de B . dA sobre la superficie S:

1. **Campo uniforme, lazo plano**: Phi_B = B * A * cos(theta), donde theta es el ángulo entre B y el vector normal al área n_hat. Este es el caso más común en libros de texto.

2. **Campo no uniforme**: Parametrizar la superficie S y evaluar la integral:
   - Elegir coordenadas alineadas con la superficie (ej., polares para un lazo circular)
   - Expresar B(r) en cada punto de la superficie
   - Calcular el producto punto B . dA = B . n_hat dA
   - Integrar sobre la superficie

3. **Bobinas acopladas (inductancia mutua)**: Para la bobina 2 enlazada a la bobina 1:
   - Calcular B_1 (campo de la bobina 1) en la ubicación de la bobina 2
   - Integrar B_1 sobre el área de cada espira de la bobina 2
   - Multiplicar por N_2 (número de espiras en la bobina 2) para el enlace de flujo total: Lambda_21 = N_2 * Phi_21
   - Inductancia mutua: M = Lambda_21 / I_1

4. **Autoinductancia**: Para una sola bobina portando corriente I:
   - Calcular B dentro de la bobina a partir de la corriente propia de la bobina
   - Integrar B sobre la sección transversal de una espira y multiplicar por N
   - Autoinductancia: L = N * Phi / I = Lambda / I
   - Resultados conocidos: solenoide L = mu_0 * n^2 * A * l; toroide L = mu_0 * N^2 * A / (2 pi R)

5. **Dependencia temporal**: Expresar Phi_B(t) explícitamente sustituyendo las cantidades variables en el tiempo identificadas en el Paso 1.

```markdown
## Flux Calculation
- **Flux expression**: Phi_B(t) = [formula]
- **Evaluation**: [analytic / numeric]
- **Flux linkage** (if multi-turn): Lambda = N * Phi_B = [formula]
- **Inductance** (if applicable): L = [value with units] or M = [value with units]
```

**Esperado:** Una expresión explícita para Phi_B(t) con unidades correctas (Weber = T . m^2) y, si aplica, valores de inductancia con unidades de Henry.

**En caso de fallo:** Si la integral de flujo no puede evaluarse analíticamente (ej., campo no uniforme sobre una superficie no trivial), usar cuadratura numérica. Para inductancia mutua de geometrías complejas, considerar la fórmula de Neumann: M = (mu_0 / 4 pi) * doble_integral_de_contorno de (dl_1 . dl_2) / |r_1 - r_2|.

### Paso 3: Aplicar la Ley de Faraday para la FEM Inducida

Calcular la FEM inducida a partir de la derivada temporal del flujo:

1. **Ley de Faraday**: EMF = -d(Lambda)/dt = -N * d(Phi_B)/dt. El signo negativo codifica la ley de Lenz (oposición al cambio).

2. **Diferenciación**: Tomar la derivada temporal total de Phi_B(t):
   - Si B = B(t) y A, theta son constantes: EMF = -N * A * cos(theta) * dB/dt
   - Si theta = omega * t (bobina rotando en B estático): EMF = N * B * A * omega * sin(omega * t)
   - Si el área cambia (ej., riel deslizante): EMF = -B * l * v (FEM motriz, donde l es la longitud del riel y v la velocidad)
   - Para el caso general: usar la regla integral de Leibniz para diferenciar bajo el signo de integral

3. **FEM motriz (derivación alternativa)**: Para un conductor de longitud l moviéndose con velocidad v en campo B:
   - La fuerza de Lorentz sobre cargas en el conductor: F = q(v x B)
   - EMF = integral de (v x B) . dl a lo largo del conductor
   - Esto es equivalente a la ley de Faraday pero puede ser más intuitivo para conductores en movimiento

4. **Verificación de signo y magnitud**: La magnitud de la FEM debe ser físicamente razonable. Para configuraciones típicas de laboratorio: rango de mV a V. Para generación de energía: rango de V a kV.

```markdown
## Induced EMF
- **EMF expression**: EMF(t) = [formula]
- **Peak EMF** (if AC): EMF_0 = [value with units]
- **RMS EMF** (if AC): EMF_rms = EMF_0 / sqrt(2) = [value]
- **Derivation method**: [Faraday's law / motional EMF / Leibniz rule]
```

**Esperado:** Una expresión explícita para EMF(t) con unidades correctas (Volts) y magnitud físicamente razonable.

**En caso de fallo:** Si la FEM tiene unidades incorrectas, rastrear hasta el cálculo de flujo -- un factor de área faltante o un sistema de unidades inconsistente (ej., mezclando CGS y SI) es la causa más probable. Si el signo de la FEM parece incorrecto, re-examinar la orientación del vector normal a la superficie relativa a la dirección del lazo del circuito (regla de la mano derecha).

### Paso 4: Determinar la Dirección de la Corriente Mediante la Ley de Lenz

Establecer la dirección de la corriente inducida y sus consecuencias físicas:

1. **Enunciado de la ley de Lenz**: La corriente inducida fluye en la dirección que se opone al cambio en flujo magnético que la produjo. Esta es una consecuencia de la conservación de energía.

2. **Procedimiento de aplicación**:
   - Determinar si el flujo a través del lazo está aumentando o disminuyendo
   - Si el flujo aumenta: la corriente inducida crea un campo B que se opone al aumento (oponiéndose a la dirección del campo externo a través del lazo)
   - Si el flujo disminuye: la corriente inducida crea un campo B que soporta el flujo decreciente (misma dirección que el campo externo a través del lazo)
   - Usar la regla de la mano derecha para convertir la dirección de campo B requerida en una dirección de corriente

3. **Consecuencias de fuerza**: La corriente inducida en presencia del campo B externo experimenta una fuerza:
   - Frenado por corrientes de Foucault: la fuerza se opone al movimiento relativo (siempre desacelerando)
   - Levitación magnética: la fuerza repulsiva soporta el peso cuando la geometría es apropiada
   - Estas fuerzas son una manifestación directa de la ley de Lenz a nivel mecánico

4. **Verificación cualitativa**: Los efectos inducidos siempre deben resistir el cambio. Un imán cayendo a través de un tubo conductor cae más lento que en caída libre. Un generador requiere entrada de trabajo mecánico para producir energía eléctrica.

```markdown
## Current Direction
- **Flux change**: [increasing / decreasing]
- **Induced B direction**: [opposing increase / supporting decrease]
- **Current direction**: [CW / CCW as viewed from specified direction]
- **Mechanical consequence**: [braking force / levitation / energy transfer]
```

**Esperado:** Una dirección de corriente claramente enunciada que sea consistente con la ley de Lenz, con la consecuencia física (fuerza, frenado, transferencia de energía) identificada.

**En caso de fallo:** Si la dirección de corriente parece amplificar el cambio de flujo en lugar de oponerse, la orientación del vector normal a la superficie o la aplicación de la regla de la mano derecha está invertida. Re-examinar la convención de orientación del lazo. Una corriente que refuerza el cambio de flujo violaría la conservación de energía.

### Paso 5: Resolver la Ecuación del Circuito Resultante

Formular y resolver la ecuación del circuito incluyendo la inductancia:

1. **Formación del circuito RL**: Cuando la FEM inducida impulsa corriente a través de un circuito con resistencia R e inductancia L, la ley de voltaje de Kirchhoff da:
   - Energización (interruptor cierra sobre fuente DC V_0): V_0 = L dI/dt + R I
   - Des-energización (fuente removida, lazo cerrado): 0 = L dI/dt + R I
   - General (FEM variable en el tiempo): EMF(t) = L dI/dt + R I

2. **Solución de la EDO de primer orden**:
   - Energización: I(t) = (V_0 / R) * [1 - exp(-t / tau)], donde tau = L / R es la constante de tiempo
   - Des-energización: I(t) = I_0 * exp(-t / tau)
   - Excitación AC EMF = EMF_0 sin(omega t): resolver usando métodos fasoriales o solución particular + homogénea
   - Duración del transitorio: la corriente alcanza ~63% del valor final después de 1 tau, ~95% después de 3 tau, ~99.3% después de 5 tau

3. **Análisis de energía**:
   - Energía almacenada en el inductor: U_L = (1/2) L I^2
   - Energía almacenada en el campo magnético por unidad de volumen: u_B = B^2 / (2 mu_0) en vacío, o u_B = (1/2) B . H en materiales magnéticos
   - Potencia disipada en la resistencia: P_R = I^2 R
   - Conservación de energía: tasa de entrada de energía = tasa de almacenamiento de energía + tasa de disipación

4. **Acoplamiento por inductancia mutua**: Para dos bobinas acopladas con inductancia mutua M:
   - V_1 = L_1 dI_1/dt + M dI_2/dt + R_1 I_1
   - V_2 = M dI_1/dt + L_2 dI_2/dt + R_2 I_2
   - Coeficiente de acoplamiento: k = M / sqrt(L_1 L_2), donde 0 <= k <= 1
   - Resolver las EDOs acopladas simultáneamente (exponencial matricial o transformada de Laplace)

5. **Separación de estado estacionario y transitorio**: Para circuitos excitados por AC, descomponer la solución en un transitorio (exponencial decreciente) y estado estacionario (sinusoidal a la frecuencia de excitación). Reportar impedancia Z_L = j omega L y ángulo de fase.

```markdown
## Circuit Solution
- **Circuit type**: [RL energizing / de-energizing / AC driven / coupled coils]
- **Time constant**: tau = L/R = [value with units]
- **Current solution**: I(t) = [expression]
- **Energy stored**: U_L = [value at specified time]
- **Energy dissipated**: [total or rate]
- **Steady-state impedance** (if AC): Z_L = [value]
```

**Esperado:** Una solución temporal completa para la corriente con constantes de tiempo exponenciales correctas, balance de energía verificado, y magnitudes físicamente razonables.

**En caso de fallo:** Si la corriente crece sin límite, es probable un error de signo en la configuración de la EDO (el término de inductancia debe oponerse a cambios en la corriente). Si la constante de tiempo es irrazonablemente grande o pequeña, verificar nuevamente el cálculo de inductancia del Paso 2 y el valor de resistencia. Las constantes de tiempo para circuitos RL típicos de laboratorio van desde microsegundos hasta segundos.

## Validación

- [ ] La fuente de flujo cambiante está claramente identificada (B cambiante, área cambiante, motriz, combinada)
- [ ] La integral de flujo magnético está configurada sobre la superficie correcta con orientación apropiada
- [ ] El flujo tiene unidades correctas (Weber = T . m^2)
- [ ] Los valores de inductancia (propia o mutua) tienen unidades correctas (Henry) y magnitud razonable
- [ ] La FEM tiene unidades correctas (Volts) y magnitud físicamente razonable
- [ ] El signo de la FEM es consistente con la ley de Lenz (se opone al cambio de flujo)
- [ ] La dirección de corriente está determinada por la ley de Lenz y verificada con la regla de la mano derecha
- [ ] La EDO del circuito RL está correctamente configurada con signos apropiados
- [ ] La constante de tiempo tau = L/R tiene unidades correctas (segundos) y magnitud razonable
- [ ] El balance de energía está verificado: energía de entrada = energía almacenada + energía disipada
- [ ] Los casos límite están verificados (t -> 0 para condiciones iniciales, t -> infinito para estado estacionario)

## Errores Comunes

- **Signo incorrecto en la ley de Faraday**: La FEM es EMF = -d(Lambda)/dt, no +d(Lambda)/dt. El signo negativo es esencial -- codifica la ley de Lenz y la conservación de energía. Omitirlo produce una corriente que amplifica el cambio de flujo, violando la termodinámica.
- **Confundir flujo y enlace de flujo**: Para un lazo de una sola espira, Phi_B y Lambda son iguales. Para una bobina de N espiras, Lambda = N * Phi_B. La inductancia se define como L = Lambda / I, no L = Phi_B / I. Omitir el factor N produce valores de inductancia N veces demasiado pequeños.
- **Inconsistencia del vector normal a la superficie**: El vector normal a la superficie n_hat debe estar relacionado con la dirección de circulación del lazo por la regla de la mano derecha. Elegirlos independientemente lleva a errores de signo tanto en el flujo como en la FEM.
- **Ignorar la contra-FEM en circuitos RL**: Cuando la corriente cambia en un inductor, el inductor genera una contra-FEM que se opone al cambio. Omitir este término de la ley de voltaje de Kirchhoff hace la ecuación del circuito algebraica en lugar de diferencial, perdiendo el transitorio completamente.
- **Asumir cambio instantáneo de corriente**: La corriente a través de un inductor ideal no puede cambiar instantáneamente (requeriría voltaje infinito). Las condiciones iniciales para transitorios RL deben satisfacer la continuidad de la corriente del inductor a través de eventos de conmutación.
- **Despreciar corrientes de Foucault en conductores macizos**: La ley de Faraday aplica a cualquier camino cerrado en un conductor, no solo a lazos de alambre discretos. Los campos variables en el tiempo en conductores macizos inducen corrientes de Foucault distribuidas que producen calentamiento (pérdidas) y campos opuestos (blindaje). Estas son críticas en núcleos de transformadores y deben minimizarse con laminación.

## Habilidades Relacionadas

- `analyze-magnetic-field` -- calcular el campo B de distribuciones de corriente que sirven como fuente de flujo
- `formulate-maxwell-equations` -- generalizar la inducción al marco completo de Maxwell incluyendo corriente de desplazamiento
- `design-electromagnetic-device` -- aplicar principios de inducción a motores, generadores y transformadores
- `derive-theoretical-result` -- derivar resultados analíticos para inductancia, FEM o soluciones transitorias desde primeros principios
