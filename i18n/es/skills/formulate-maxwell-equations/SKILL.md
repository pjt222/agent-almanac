---
name: formulate-maxwell-equations
description: >
  Trabajar con el conjunto completo de las ecuaciones de Maxwell en forma
  integral y diferencial para analizar campos electromagnéticos, ondas y
  transporte de energía. Usar al aplicar la ley de Gauss, la ley de Faraday
  o la ley de Ampère-Maxwell a problemas de valores de frontera, al derivar
  la ecuación de onda electromagnética, al calcular el vector de Poynting y
  la presión de radiación, al resolver campos en interfaces de materiales,
  o al conectar la electrostática y la magnetostática con el marco
  electromagnético unificado dependiente del tiempo.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: advanced
  language: natural
  tags: electromagnetism, maxwell-equations, electromagnetic-waves, poynting-vector, boundary-conditions
  locale: es
  source_locale: en
  source_commit: f39534628ba4bfee67e410b2b9856a7764214b26
  translator: claude
  translation_date: "2026-03-17"
---

# Formulate Maxwell Equations

Analizar fenómenos electromagnéticos enunciando las ecuaciones de Maxwell relevantes en la forma apropiada (integral o diferencial), aplicando condiciones de frontera y simetría para reducir el sistema, resolviendo las ecuaciones diferenciales parciales resultantes para los campos, calculando cantidades derivadas como el vector de Poynting, la presión de radiación y la impedancia de onda, y verificando la solución contra límites estáticos y de onda conocidos.

## Cuándo Usar

- Resolver un problema de valores de frontera para campos E y B en una región con fuentes e interfaces de materiales
- Derivar la ecuación de onda electromagnética desde primeros principios
- Calcular el flujo de energía (vector de Poynting) y la densidad de momento de campos electromagnéticos
- Aplicar condiciones de frontera en interfaces entre diferentes medios (dieléctricos, conductores, materiales magnéticos)
- Analizar la corriente de desplazamiento y su papel en completar la ecuación de Ampère-Maxwell
- Conectar los límites estáticos (ley de Coulomb, Biot-Savart) con el marco unificado dependiente del tiempo

## Entradas

- **Requerido**: Configuración física (geometría, cargas y corrientes fuente, propiedades de materiales)
- **Requerido**: Cantidad a resolver (campo E, campo B, solución de onda, flujo de energía, o valores de campo en frontera)
- **Opcional**: Información de simetría (planar, cilíndrica, esférica, o sin simetría especial)
- **Opcional**: Especificación de dependencia temporal (estática, armónica a frecuencia omega, o general dependiente del tiempo)
- **Opcional**: Condiciones de frontera en interfaces de materiales o superficies de conductores

## Procedimiento

### Paso 1: Enunciar las Cuatro Ecuaciones de Maxwell e Identificar el Subconjunto Relevante

Escribir el conjunto completo y seleccionar qué ecuaciones restringen el problema:

1. **Ley de Gauss para E**: div(E) = rho / epsilon_0 (diferencial) o closed_surface_integral(E . dA) = Q_enc / epsilon_0 (integral). Relaciona la divergencia del campo E con la densidad de carga. Usar para encontrar E a partir de distribuciones de carga con simetría.

2. **Ley de Gauss para B**: div(B) = 0 (diferencial) o closed_surface_integral(B . dA) = 0 (integral). No existen monopolos magnéticos. Toda línea de campo magnético es un bucle cerrado. Usar como verificación de consistencia en campos B calculados.

3. **Ley de Faraday**: curl(E) = -dB/dt (diferencial) o contour_integral(E . dl) = -d(Phi_B)/dt (integral). Un campo B cambiante genera un campo E rotacional. Usar para problemas de inducción y derivación de ondas.

4. **Ley de Ampère-Maxwell**: curl(B) = mu_0 J + mu_0 epsilon_0 dE/dt (diferencial) o contour_integral(B . dl) = mu_0 I_enc + mu_0 epsilon_0 d(Phi_E)/dt (integral). La corriente y el campo E cambiante generan un campo B rotacional. El término de corriente de desplazamiento mu_0 epsilon_0 dE/dt es esencial para la propagación de ondas y la continuidad de corriente.

5. **Selección de forma**: Elegir la forma diferencial para cálculos locales de campo, ecuaciones de onda y EDPs. Elegir la forma integral para problemas con alta simetría donde el campo puede extraerse directamente de la integral.

6. **Identificar ecuaciones activas**: No todas las cuatro ecuaciones son restricciones independientes en cada problema. Para electrostática (dB/dt = 0, J = 0), solo importan la ley de Gauss para E y curl(E) = 0. Para magnetostática, la ley de Gauss para B y la ley de Ampère (sin corriente de desplazamiento) son suficientes.

```markdown
## Maxwell Equations for This Problem
- **Form**: [differential / integral / both]
- **Active equations**: [list which of the four are non-trivial constraints]
- **Source terms**: rho = [charge density], J = [current density]
- **Time dependence**: [static / harmonic / general]
- **Displacement current**: [negligible / essential -- with justification]
```

**Esperado:** Las cuatro ecuaciones están enunciadas, el subconjunto relevante está identificado con justificación, y la corriente de desplazamiento está incluida o se argumenta explícitamente que es despreciable.

**En caso de fallo:** Si no está claro si la corriente de desplazamiento importa, estimar la razón |epsilon_0 dE/dt| / |J|. Si esta razón es comparable o mayor que 1, la corriente de desplazamiento debe conservarse. En el vacío sin cargas libres, la corriente de desplazamiento es siempre esencial para la propagación de ondas.

### Paso 2: Aplicar Condiciones de Frontera y Simetría

Reducir el sistema usando interfaces de materiales y simetría geométrica:

1. **Condiciones de frontera en interfaces de materiales**: En la interfaz entre medios 1 y 2 con carga superficial sigma_f y corriente superficial K_f:
   - E normal: epsilon_1 E_1n - epsilon_2 E_2n = sigma_f
   - E tangencial: E_1t = E_2t (continuo)
   - B normal: B_1n = B_2n (continuo)
   - H tangencial: n_hat x (H_1 - H_2) = K_f (donde n_hat apunta del medio 2 al 1)

2. **Condiciones de frontera en conductores**: En la superficie de un conductor perfecto:
   - E_tangencial = 0 (dentro del conductor E = 0)
   - B_normal = 0 (dentro del conductor B = 0 para campos variables en el tiempo)
   - Carga superficial: sigma = epsilon_0 E_normal
   - Corriente superficial: K = (1/mu_0) n_hat x B

3. **Reducción por simetría**: Usar las simetrías identificadas para reducir el número de variables independientes:
   - Simetría planar: los campos dependen de una sola coordenada (ej., z), reduciendo EDPs a EDOs
   - Simetría cilíndrica: los campos dependen de (rho, z) o solo de rho
   - Simetría esférica: los campos dependen solo de r
   - Invariancia traslacional: transformada de Fourier en la dirección invariante

4. **Elección de gauge** (si se usan potenciales): Seleccionar un gauge para el potencial escalar phi y el potencial vectorial A:
   - Gauge de Coulomb: div(A) = 0 (separa contribuciones electrostáticas y de radiación)
   - Gauge de Lorenz: div(A) + mu_0 epsilon_0 d(phi)/dt = 0 (manifiestamente covariante de Lorentz, desacopla las ecuaciones de onda)

```markdown
## Boundary Conditions and Symmetry
- **Interfaces**: [list with media properties on each side]
- **Boundary conditions applied**: [normal E, tangential E, normal B, tangential H]
- **Symmetry**: [planar / cylindrical / spherical / none]
- **Reduced coordinates**: [independent variables after symmetry reduction]
- **Gauge** (if using potentials): [Coulomb / Lorenz / other]
```

**Esperado:** Todas las condiciones de frontera están enunciadas en cada interfaz, la simetría se ha explotado para reducir la dimensionalidad, y el problema está listo para la solución de la EDP.

**En caso de fallo:** Si las condiciones de frontera están sobredeterminadas (más ecuaciones que incógnitas en una interfaz), verificar que el número de componentes de campo coincida con el número de condiciones. Si están subdeterminadas, se ha omitido una condición de frontera — frecuentemente la condición de H tangencial o la condición de radiación en el infinito.

### Paso 3: Resolver las EDPs Resultantes

Resolver las ecuaciones de Maxwell o sus formas derivadas para las cantidades de campo:

1. **Derivación de la ecuación de onda**: En un medio sin fuentes, lineal y homogéneo:
   - Tomar el rotacional de la ley de Faraday: curl(curl(E)) = -d/dt(curl(B))
   - Sustituir Ampère-Maxwell: curl(curl(E)) = -mu epsilon d^2E/dt^2
   - Usar la identidad vectorial: curl(curl(E)) = grad(div(E)) - nabla^2(E)
   - Con div(E) = 0 (sin cargas libres): nabla^2(E) = mu epsilon d^2E/dt^2
   - Velocidad de onda: v = 1/sqrt(mu epsilon); en el vacío c = 1/sqrt(mu_0 epsilon_0)
   - La ecuación idéntica se cumple para B

2. **Soluciones de onda plana**: Para una onda propagándose en la dirección z:
   - E(z, t) = E_0 exp[i(kz - omega t)] con k = omega/v = omega * sqrt(mu epsilon)
   - B = (1/v) k_hat x E (perpendicular a E y a la dirección de propagación)
   - |B| = |E|/v
   - Polarización: lineal, circular o elíptica dependiendo de las componentes de E_0

3. **Ecuaciones de Laplace y Poisson** (caso estático):
   - Sin dependencia temporal: nabla^2(phi) = -rho/epsilon_0 (Poisson) o nabla^2(phi) = 0 (Laplace)
   - Resolver por separación de variables en el sistema de coordenadas apropiado
   - Ajustar las condiciones de frontera para determinar los coeficientes de expansión

4. **Ondas guiadas y cavidades**: Para guías de onda y cavidades resonantes:
   - Descomponer en modos TE (eléctrico transversal) y TM (magnético transversal)
   - Aplicar condiciones de frontera de paredes conductoras
   - Resolver el problema de autovalores para las constantes de propagación permitidas o frecuencias resonantes
   - Frecuencia de corte: omega_c = v * pi * sqrt((m/a)^2 + (n/b)^2) para una guía rectangular con dimensiones a x b

5. **Profundidad de penetración en conductores**: Para campos variables en el tiempo penetrando un conductor con conductividad sigma_c:
   - delta = sqrt(2 / (omega mu sigma_c))
   - Los campos decaen como exp(-z/delta) dentro del conductor
   - A 60 Hz en cobre: delta aproximadamente 8.5 mm; a 1 GHz: delta aproximadamente 2 micrómetros

```markdown
## Field Solution
- **Equation solved**: [wave equation / Laplace / Poisson / eigenvalue]
- **Solution method**: [separation of variables / Fourier transform / Green's function / numerical]
- **Result**: E(r, t) = [expression], B(r, t) = [expression]
- **Dispersion relation**: omega(k) = [if wave solution]
- **Characteristic scales**: [wavelength, skin depth, decay length]
```

**Esperado:** Expresiones explícitas de campo que satisfacen las ecuaciones de Maxwell y todas las condiciones de frontera, con la relación de dispersión o el espectro de autovalores si corresponde.

**En caso de fallo:** Si la EDP no puede separarse en el sistema de coordenadas elegido, intentar un sistema diferente o recurrir a métodos numéricos (diferencias finitas, elementos finitos). Si la solución no satisface una de las ecuaciones de Maxwell al sustituir de vuelta, hay un error algebraico en la derivación — re-verificar las operaciones de rotacional y divergencia.

### Paso 4: Calcular Cantidades Derivadas

Extraer cantidades físicamente significativas de la solución de campo:

1. **Vector de Poynting**: S = (1/mu_0) E x B (flujo de energía instantáneo, W/m^2):
   - Para ondas planas: S = (1/mu_0) |E|^2 / v en la dirección de propagación
   - Vector de Poynting promediado en el tiempo: <S> = (1/2) Re(E x H*) para campos armónicos
   - Intensidad: I = |<S>| (potencia por unidad de área)

2. **Densidad de energía electromagnética**:
   - u = (1/2)(epsilon_0 |E|^2 + |B|^2/mu_0) en el vacío
   - u = (1/2)(E . D + B . H) en medios lineales
   - Conservación de energía: du/dt + div(S) = -J . E (teorema de Poynting)

3. **Presión de radiación**: Para una onda plana incidente sobre una superficie:
   - Absorbedor perfecto: P_rad = I/c = <S>/c
   - Reflector perfecto: P_rad = 2I/c = 2<S>/c
   - Esta es la densidad de flujo de momento del campo electromagnético

4. **Impedancia de onda**:
   - En un medio: eta = sqrt(mu/epsilon) = mu * v
   - En el vacío: eta_0 = sqrt(mu_0/epsilon_0) aproximadamente 377 Ohms
   - Relaciona las amplitudes de E y H: |E| = eta |H|
   - Coeficiente de reflexión en incidencia normal: r = (eta_2 - eta_1)/(eta_2 + eta_1)

5. **Disipación de potencia y factor de calidad**:
   - Pérdida óhmica por unidad de volumen: p_loss = sigma |E|^2 / 2 (en un conductor)
   - Factor de calidad de una cavidad: Q = omega * (energía almacenada) / (potencia disipada por ciclo)
   - Se relaciona con el ancho de banda de las resonancias: Delta_omega = omega / Q

```markdown
## Derived Quantities
- **Poynting vector**: S = [expression], <S> = [time-averaged]
- **Energy density**: u = [expression]
- **Radiation pressure**: P_rad = [value]
- **Wave impedance**: eta = [value]
- **Reflection/transmission**: r = [value], t = [value]
- **Q-factor** (if resonant): Q = [value]
```

**Esperado:** Todas las cantidades derivadas calculadas con unidades correctas, conservación de energía verificada mediante el teorema de Poynting, y magnitudes físicamente razonables.

**En caso de fallo:** Si el teorema de Poynting no balancea (du/dt + div(S) no es igual a -J . E), hay una inconsistencia entre las soluciones de E y B. Re-verificar que ambos campos satisfacen las cuatro ecuaciones de Maxwell simultáneamente. Un error común es calcular E y B a partir de aproximaciones diferentes que no son mutuamente consistentes.

### Paso 5: Verificar Contra Límites Conocidos

Comprobar que la solución completa se reduce correctamente en casos límite:

1. **Límite estático (omega -> 0)**: La solución debe reducirse al resultado electrostático o magnetostático:
   - El campo E debe satisfacer la ley de Coulomb o la ecuación de Laplace/Poisson
   - El campo B debe satisfacer la ley de Biot-Savart o la ley de Ampère (sin corriente de desplazamiento)
   - La corriente de desplazamiento se anula: mu_0 epsilon_0 dE/dt -> 0

2. **Límite de onda plana**: En un medio sin fuentes e ilimitado, la solución debe reducirse a ondas planas con v = 1/sqrt(mu epsilon) y la polarización correcta.

3. **Límite de conductor perfecto (sigma -> infinito)**:
   - Profundidad de penetración delta -> 0 (los campos no penetran)
   - E tangencial -> 0 en la superficie
   - Coeficiente de reflexión r -> -1 (reflexión perfecta con inversión de fase)

4. **Límite de vacío (epsilon_r = 1, mu_r = 1)**: Las cantidades dependientes del material deben reducirse a sus valores de vacío. La velocidad de onda debe ser igual a c. La impedancia debe ser igual a eta_0 aproximadamente 377 Ohms.

5. **Verificación de conservación de energía**: Integrar el teorema de Poynting sobre un volumen cerrado. La tasa de cambio de la energía total del campo más la potencia que fluye hacia afuera a través de la superficie debe ser igual al negativo de la potencia entregada por las corrientes dentro del volumen. Cualquier desequilibrio indica un error.

```markdown
## Limiting Case Verification
| Limit | Condition | Expected | Obtained | Match |
|-------|-----------|----------|----------|-------|
| Static | omega -> 0 | Coulomb / Biot-Savart | [result] | [Yes/No] |
| Plane wave | unbounded medium | v = c/n, eta = eta_0/n | [result] | [Yes/No] |
| Perfect conductor | sigma -> inf | delta -> 0, r -> -1 | [result] | [Yes/No] |
| Vacuum | epsilon_r = mu_r = 1 | c, eta_0 | [result] | [Yes/No] |
| Energy conservation | Poynting's theorem | balanced | [check] | [Yes/No] |
```

**Esperado:** Todos los límites producen los resultados conocidos correctos. La conservación de energía se satisface dentro de la precisión numérica.

**En caso de fallo:** Un límite fallido es un indicador definitivo de un error. El fallo del límite estático sugiere un problema en los términos fuente o las condiciones de frontera. El fallo del límite de onda plana sugiere un error en la derivación de la ecuación de onda. El fallo de la conservación de energía sugiere inconsistencia entre las soluciones de E y B. Rastrear el fallo hasta el paso específico y corregir antes de aceptar la solución.

## Validación

- [ ] Las cuatro ecuaciones de Maxwell están enunciadas y el subconjunto relevante está identificado
- [ ] La corriente de desplazamiento está incluida o se justifica explícitamente como despreciable
- [ ] Las condiciones de frontera están aplicadas en cada interfaz de materiales
- [ ] La simetría se ha explotado para reducir la dimensionalidad de la EDP
- [ ] La ecuación de onda (o ecuación de Laplace/Poisson) está correctamente derivada
- [ ] Las soluciones de campo satisfacen las cuatro ecuaciones de Maxwell al sustituir de vuelta
- [ ] El vector de Poynting y la densidad de energía están calculados con unidades correctas (W/m^2 y J/m^3)
- [ ] El teorema de Poynting (conservación de energía) está verificado
- [ ] La impedancia de onda y los coeficientes de reflexión/transmisión son físicamente razonables
- [ ] El límite estático reproduce la ley de Coulomb y la ley de Biot-Savart
- [ ] El límite de onda plana produce v = 1/sqrt(mu epsilon) y E, B, k ortogonales
- [ ] La solución es suficientemente completa para que otro investigador la reproduzca

## Errores Comunes

- **Omitir la corriente de desplazamiento**: En la ley de Ampère original (curl B = mu_0 J), tomar la divergencia da div(J) = 0, lo cual contradice la conservación de carga cuando rho cambia en el tiempo. El término de corriente de desplazamiento mu_0 epsilon_0 dE/dt corrige esto y es esencial para la propagación de ondas. Nunca eliminarlo sin verificar que dE/dt es despreciable comparado con J/epsilon_0.
- **Soluciones inconsistentes de E y B**: Resolver E y B independientemente (ej., E de la ley de Gauss y B de la ley de Ampère) sin verificar la ley de Faraday y la ley de Gauss para B puede producir campos que no son mutuamente consistentes. Siempre verificar las cuatro ecuaciones.
- **Dirección incorrecta de la normal en condiciones de frontera**: La convención n_hat x (H_1 - H_2) = K_f requiere que n_hat apunte del medio 2 al medio 1. Invertir la dirección cambia el signo de la condición de corriente superficial.
- **Confundir D, E, B y H en materiales**: En el vacío, D = epsilon_0 E y B = mu_0 H. En medios lineales, D = epsilon E y B = mu H. Las ecuaciones de Maxwell en materia usan D y H para los términos de fuentes libres y E y B para la ley de fuerza. Mezclar relaciones constitutivas lleva a errores por factores de epsilon_r o mu_r.
- **Velocidad de fase versus velocidad de grupo**: La velocidad de onda v = omega/k es la velocidad de fase. La energía y la información se propagan a la velocidad de grupo v_g = d(omega)/dk. En medios dispersivos estas difieren, y usar la velocidad de fase para transporte de energía da resultados incorrectos.
- **Olvidar la condición de radiación**: Para problemas de dispersión y radiación en dominios ilimitados, la solución debe satisfacer la condición de radiación de Sommerfeld (ondas salientes en el infinito). Sin esta condición, la solución no es única y puede incluir ondas entrantes no físicas.

## Habilidades Relacionadas

- `analyze-magnetic-field` -- calcular campos B estáticos que sirven como el límite magnetostático de las ecuaciones de Maxwell
- `solve-electromagnetic-induction` -- aplicar la ley de Faraday a geometrías de inducción específicas y circuitos RL
- `formulate-quantum-problem` -- cuantizar el campo electromagnético para óptica cuántica y QED
- `derive-theoretical-result` -- realizar derivaciones rigurosas de ecuaciones de onda, funciones de Green y relaciones de dispersión
- `analyze-diffusion-dynamics` -- las ecuaciones de difusión surgen de las ecuaciones de Maxwell en medios conductores (efecto piel)
