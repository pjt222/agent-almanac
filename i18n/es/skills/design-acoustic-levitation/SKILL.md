---
name: design-acoustic-levitation
description: >
  Diseñar un sistema de levitación acústica que utiliza ondas estacionarias para
  atrapar y suspender objetos pequeños en nodos de presión. Cubre selección de
  transductores ultrasónicos, formación de ondas estacionarias entre transductor
  y reflector, cálculo de espaciado de nodos y posición de atrapamiento, análisis
  de presión de radiación acústica, y configuraciones de arreglos de fase para
  manipulación multi-eje. Usar al diseñar manipulación de muestras sin contacto
  para química, biología, ciencia de materiales o propósitos demostrativos.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: levitation
  complexity: intermediate
  language: natural
  tags: levitation, acoustic-levitation, standing-waves, ultrasonic, radiation-pressure
  locale: es
  source_locale: en
  source_commit: f3953462
  translator: claude
  translation_date: "2026-03-17"
---

# Design Acoustic Levitation

Diseñar y validar un sistema de levitación acústica determinando la presión de radiación acústica necesaria para equilibrar la gravedad, seleccionando la geometría del transductor y reflector para formar una onda estacionaria estable, calculando las posiciones y la fuerza de atrapamiento de los nodos de presión, y verificando que el objeto atrapado sea estable frente a perturbaciones laterales y axiales.

## Cuándo Usar

- Diseñar un portamuestras sin contacto para experimentos químicos o biológicos
- Construir un demostrador de levitación acústica para educación o divulgación
- Evaluar si un objeto dado puede ser levitado acústicamente (restricciones de tamaño, densidad y frecuencia)
- Seleccionar entre configuraciones de eje único (transductor-reflector) y arreglo de fases
- Calcular las posiciones de nodos y fuerzas de atrapamiento para una frecuencia y geometría de transductor dadas
- Extender un levitador de eje único a manipulación multi-eje usando arreglos de fases

## Entradas

- **Requerido**: Propiedades del objeto (masa, densidad, radio o dimensión característica, compresibilidad si se conoce)
- **Requerido**: Medio de levitación objetivo (aire, agua, gas inerte) con su densidad y velocidad del sonido
- **Opcional**: Frecuencia de transductor disponible (predeterminado: 40 kHz, común para sistemas de laboratorio y aficionados)
- **Opcional**: Potencia o clasificación de voltaje del transductor
- **Opcional**: Capacidad de manipulación deseada (solo atrapamiento estático, o reposicionamiento dinámico)

## Procedimiento

### Paso 1: Determinar propiedades del objeto y contraste acústico

Caracterizar el objeto y el medio para establecer la viabilidad fundamental de la levitación acústica:

1. **Parámetros del objeto**: Registrar la masa m, densidad rho_p, radio a (o radio de esfera equivalente para objetos no esféricos), y módulo volumétrico K_p (compresibilidad kappa_p = 1/K_p). Para objetos rígidos como esferas metálicas, K_p es efectivamente infinito.
2. **Parámetros del medio**: Registrar la densidad rho_0, velocidad del sonido c_0, y módulo volumétrico K_0 = rho_0 * c_0^2 para el medio huésped.
3. **Factor de contraste acústico**: Calcular los factores de contraste de Gor'kov que determinan si el objeto migra hacia nodos de presión o antinodos:
   - Coeficiente monopolar: f_1 = 1 - (K_0 / K_p) = 1 - (rho_0 * c_0^2) / (rho_p * c_p^2)
   - Coeficiente dipolar: f_2 = 2 * (rho_p - rho_0) / (2 * rho_p + rho_0)
   - Para la mayoría de objetos sólidos en aire, f_1 ~ 1 y f_2 ~ 1, por lo que el objeto queda atrapado en nodos de presión (antinodos de velocidad).
4. **Restricción de tamaño**: Verificar que el radio del objeto a sea mucho menor que la longitud de onda acústica lambda = c_0 / f. La teoría de Gor'kov requiere a << lambda (típicamente a < lambda/4). Si esta condición no se cumple, se necesita acústica de rayos o simulación numérica completa.

```markdown
## Object and Medium Parameters
- **Object**: [material, mass, density, radius, bulk modulus]
- **Medium**: [gas/liquid, rho_0, c_0, K_0]
- **Contrast factors**: f_1 = [value], f_2 = [value]
- **Wavelength**: lambda = [value] at f = [frequency]
- **Size ratio**: a / lambda = [value] (must be << 1)
- **Trapping location**: [pressure node / pressure antinode]
```

**Esperado:** Caracterización completa del objeto y medio con factores de contraste calculados. Se debe confirmar que el objeto migra hacia nodos de presión (caso típico para sólidos en aire). La restricción de tamaño a << lambda se satisface.

**En caso de fallo:** Si a / lambda > 0.25, la teoría de partícula puntual de Gor'kov deja de ser válida. Usar métodos numéricos (simulación acústica por elementos finitos) o calibración experimental en su lugar. Si f_1 y f_2 tienen signos opuestos, el objeto puede quedar atrapado en una posición intermedia en lugar de un nodo o antinodo limpio — esto requiere un mapeo cuidadoso del potencial de Gor'kov.

### Paso 2: Calcular la presión de radiación acústica requerida

Determinar la intensidad del campo acústico necesaria para equilibrar la gravedad:

1. **Fuerza de radiación acústica**: Para una esfera pequeña en un nodo de presión en una onda estacionaria unidimensional, la fuerza axial promediada en el tiempo es:
   - F_ax = -(4 * pi / 3) * a^3 * [f_1 * (1 / (2 * rho_0 * c_0^2)) * d(p^2)/dz - (3 * f_2 * rho_0 / 4) * d(v^2)/dz]
   - En una onda estacionaria plana p(z,t) = P_0 * cos(kz) * cos(omega*t), esto se simplifica cerca de un nodo a:
   - F_ax = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi * sin(2kz)
   - donde Phi = f_1 + (3/2) * f_2 es el factor de contraste acústico y k = 2*pi/lambda.
2. **Balance de fuerzas**: Igualar la fuerza de radiación máxima (en sin(2kz) = 1, que ocurre a lambda/8 del nodo) con la gravedad:
   - F_ax_max = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi = m * g = (4/3) * pi * a^3 * rho_p * g
   - Resolver para la amplitud de presión requerida:
   - P_0 = sqrt(4 * rho_p * rho_0 * c_0^2 * g / (k * Phi))
3. **Intensidad acústica**: Convertir amplitud de presión a intensidad: I = P_0^2 / (2 * rho_0 * c_0). Comparar con la salida nominal del transductor.
4. **Nivel de presión sonora**: Expresar en dB SPL: L = 20 * log10(P_0 / 20e-6). La levitación acústica típica en aire requiere 150-165 dB SPL.

```markdown
## Acoustic Requirements
- **Required pressure amplitude**: P_0 = [value] Pa
- **Required intensity**: I = [value] W/m^2
- **Sound pressure level**: L = [value] dB SPL
- **Safety note**: [hearing protection required if > 120 dB at audible frequencies]
```

**Esperado:** Una determinación cuantitativa de la amplitud de presión acústica mínima para lograr la levitación, expresada en Pa, W/m^2 y dB SPL. La intensidad requerida debe ser alcanzable con el transductor especificado o uno disponible comercialmente.

**En caso de fallo:** Si la amplitud de presión requerida excede lo que los transductores disponibles pueden producir, reducir la masa o densidad del objeto, usar un material más ligero, o cambiar a un medio de mayor densidad (ej., levitar en un gas denso como SF6 para aumentar la fuerza de radiación). Alternativamente, usar múltiples transductores en un arreglo enfocado para concentrar la energía acústica en el punto de atrapamiento.

### Paso 3: Diseñar la geometría transductor-reflector

Configurar el hardware físico para producir una onda estacionaria estable:

1. **Selección de transductor**: Elegir un transductor ultrasónico a frecuencia f (común: 28 kHz, 40 kHz, o 60-80 kHz transductores piezoeléctricos). Mayor frecuencia da menor longitud de onda y atrapamiento más ajustado, pero reduce el tamaño máximo del objeto. Verificar que el transductor puede producir el P_0 requerido a la distancia de operación.
2. **Diseño del reflector**: Colocar un reflector plano o cóncavo opuesto al transductor. La superficie del reflector debe ser acústicamente dura (alta desadaptación de impedancia acústica con el medio). Placas de metal o vidrio funcionan bien en aire. Un reflector cóncavo concentra el campo sonoro y aumenta la amplitud de presión en el eje.
3. **Longitud de cavidad**: Establecer la distancia transductor-reflector L a un número entero de medias longitudes de onda: L = n * lambda/2, donde n es un entero positivo. Esto crea n nodos de presión entre el transductor y reflector, espaciados lambda/2.
4. **Posiciones de nodos**: Los nodos de presión se ubican en z_j = (2j - 1) * lambda/4 desde la superficie del reflector, para j = 1, 2, ..., n. El nodo más cercano al centro de la cavidad es típicamente el sitio de atrapamiento más estable.
5. **Sintonización de resonancia**: Ajustar finamente L variando la distancia transductor-reflector con una platina micrométrica mientras se monitorea la fuerza de levitación o la presión acústica con un micrófono. La distancia óptima produce la onda estacionaria más fuerte.

```markdown
## Geometry Design
- **Transducer**: [model, frequency, rated power or SPL]
- **Reflector**: [material, shape (flat/concave), dimensions]
- **Cavity length**: L = [n] x lambda/2 = [value] mm
- **Number of nodes**: [n]
- **Node positions from reflector**: z_1 = [value], z_2 = [value], ...
- **Selected trapping node**: z_[j] = [value]
```

**Esperado:** Una especificación de hardware completa con transductor, reflector y longitud de cavidad determinados. Las posiciones de nodos están calculadas y el nodo de atrapamiento está seleccionado.

**En caso de fallo:** Si no se forma una onda estacionaria estable (común cuando L no es precisamente n * lambda/2), ajustar la longitud de cavidad en incrementos de 0.1 mm. Los cambios de temperatura desplazan c_0 y por lo tanto lambda, requiriendo re-sintonización. Si el haz del transductor diverge demasiado para la longitud de cavidad, agregar una bocina o guía de onda para colimar el haz, o reducir L.

### Paso 4: Calcular el potencial de atrapamiento y fuerzas restauradoras

Cuantificar la fuerza y extensión espacial de la trampa acústica:

1. **Potencial de Gor'kov**: Para una esfera pequeña en el campo de onda estacionaria, calcular el potencial de Gor'kov:
   - U(r) = (4/3) * pi * a^3 * [(f_1 / (2 * rho_0 * c_0^2)) * <p^2> - (3 * f_2 * rho_0 / 4) * <v^2>]
   - donde <p^2> y <v^2> son los campos cuadráticos de presión y velocidad promediados en el tiempo.
   - El objeto queda atrapado en el mínimo de U(r) + m*g*z (incluyendo gravedad).
2. **Fuerza restauradora axial**: Cerca del nodo de atrapamiento, expandir F_z a primer orden:
   - F_z ~ -k_z * delta_z, donde k_z = (2 * pi * a^3 * P_0^2 * k^2) / (3 * rho_0 * c_0^2) * Phi
   - La frecuencia natural axial es omega_z = sqrt(k_z / m).
3. **Fuerza restauradora lateral**: En un haz de ancho finito, la fuerza de radiación lateral surge del gradiente de intensidad transversal. Para un perfil de haz gaussiano con cintura w:
   - k_r ~ k_z * (a / w)^2 (aproximado, la rigidez lateral es más débil que la axial)
   - El atrapamiento lateral es más débil que el axial; este es el factor limitante para la estabilidad.
4. **Profundidad de atrapamiento**: El desplazamiento máximo antes de que el objeto escape de la trampa está determinado por la profundidad del pozo de potencial. Para la dirección axial, la profundidad del pozo es Delta_U = F_ax_max * lambda / (2 * pi). Expresar como múltiplo de la energía térmica k_B * T si es relevante (siempre relevante para partículas de escala micrométrica, despreciable para objetos de escala milimétrica en aire).

```markdown
## Trapping Analysis
- **Axial stiffness**: k_z = [value] N/m
- **Axial natural frequency**: omega_z / (2*pi) = [value] Hz
- **Lateral stiffness**: k_r = [value] N/m
- **Lateral natural frequency**: omega_r / (2*pi) = [value] Hz
- **Axial well depth**: Delta_U = [value] J = [value] x k_B*T
- **Stiffness ratio**: k_z / k_r = [value] (lateral is weaker)
```

**Esperado:** Valores cuantitativos de rigidez para direcciones axial y lateral, frecuencias naturales calculadas, y profundidad del pozo de potencial de atrapamiento determinada. Se confirma que la rigidez lateral es positiva (aunque más débil que la axial).

**En caso de fallo:** Si la rigidez lateral es negativa o despreciablemente pequeña, el objeto se desplazará lateralmente fuera del haz. Las soluciones incluyen usar un transductor más ancho (mayor cintura de haz), agregar transductores laterales, cambiar a una configuración de arreglo de fases, o usar un reflector cóncavo para crear un frente de onda convergente que proporcione confinamiento lateral más fuerte.

### Paso 5: Verificar estabilidad frente a perturbaciones

Confirmar que el sistema diseñado atrapará y sostendrá el objeto de manera fiable:

1. **Desplazamiento gravitatorio**: La posición de equilibrio se desplaza por debajo del nodo de presión en delta_z = m * g / k_z. Verificar que delta_z << lambda/4 (la distancia al máximo del potencial). Si delta_z se acerca a lambda/4, el objeto cae fuera de la trampa.
2. **Sensibilidad a corrientes de aire**: Estimar la fuerza de arrastre de corrientes de aire ambientales. Para una esfera, F_drag = 6 * pi * eta * a * v_air (arrastre de Stokes). Comparar con la fuerza restauradora lateral: la velocidad máxima de aire tolerable es v_max = k_r * a / (6 * pi * eta * a) = k_r / (6 * pi * eta).
3. **Flujo acústico**: La onda estacionaria impulsa flujos circulatorios estacionarios (flujo de Rayleigh) con velocidad v_stream ~ P_0^2 / (4 * rho_0 * c_0^3 * eta) * lambda. Estos flujos ejercen arrastre sobre el objeto levitado. Verificar que el arrastre del flujo es menor que la fuerza restauradora lateral.
4. **Efectos térmicos**: La absorción acústica calienta el medio, cambiando c_0 y desplazando las posiciones de los nodos. Para operación de alta intensidad (> 160 dB SPL), estimar el aumento de temperatura y el desplazamiento resultante de nodos durante el tiempo de operación.
5. **Extensión de arreglo de fases** (si se necesita manipulación): Para reposicionamiento dinámico del objeto, reemplazar el par transductor-reflector único con un arreglo de fases de transductores. Ajustando las fases relativas, las posiciones de los nodos de presión pueden moverse continuamente, transportando el objeto atrapado con ellas. La resolución de fase determina la precisión de posicionamiento: delta_z ~ lambda / (2 * pi * N_phase_bits).

```markdown
## Stability Verification
| Perturbation | Magnitude | Restoring Force | Margin | Stable? |
|-------------|-----------|----------------|--------|---------|
| Gravity offset | delta_z = [val] | k_z * delta_z | delta_z / (lambda/4) = [val] | [Yes/No] |
| Air currents | v_air = [val] m/s | F_lat = [val] N | F_lat / F_drag = [val] | [Yes/No] |
| Acoustic streaming | v_stream = [val] | F_lat = [val] N | F_lat / F_stream_drag = [val] | [Yes/No] |
| Thermal drift | Delta_T = [val] K | Re-tune interval | [time] | [Acceptable/No] |
```

**Esperado:** Todas las fuentes de perturbación están cuantificadas y se demuestra que están dentro de los márgenes de atrapamiento. El desplazamiento gravitatorio es una fracción pequeña de lambda/4. Los efectos de corrientes de aire y flujo acústico no superan la trampa lateral.

**En caso de fallo:** Si el desplazamiento gravitatorio es demasiado grande (objeto pesado, campo débil), aumentar P_0 o usar una frecuencia más alta (gradiente más fuerte por longitud de onda). Si las corrientes de aire son un problema, encerrar el levitador en un escudo contra corrientes. Si el flujo acústico desestabiliza el objeto, reducir la amplitud de excitación y usar una geometría de reflector que minimice los vórtices de flujo (ej., un reflector cóncavo poco profundo).

## Validación

- [ ] El tamaño del objeto satisface a << lambda (teoría de Gor'kov aplicable)
- [ ] Los factores de contraste acústico están calculados y la ubicación de atrapamiento (nodo/antinodo) está identificada
- [ ] La amplitud de presión requerida P_0 está calculada y es alcanzable con el hardware especificado
- [ ] La longitud de cavidad transductor-reflector está configurada a n * lambda/2 con posiciones de nodos calculadas
- [ ] Las rigideces axial y lateral son ambas positivas
- [ ] El desplazamiento gravitatorio delta_z es una fracción pequeña de lambda/4
- [ ] Las perturbaciones por corrientes de aire y flujo acústico están dentro de los márgenes de atrapamiento
- [ ] Las consideraciones de seguridad para operación de alto SPL están documentadas
- [ ] Si se usa arreglo de fases, la resolución de control de fase y precisión de posicionamiento están especificadas

## Errores Comunes

- **Violar la suposición de partícula pequeña**: La fórmula de fuerza de radiación de Gor'kov asume a << lambda. Para objetos que se acercan a lambda/4 en tamaño, la aproximación de partícula puntual deja de ser válida y la fuerza real puede diferir significativamente (tanto en magnitud como en dirección) de la predicción de Gor'kov. Usar simulación de onda completa para objetos grandes.
- **Ignorar el confinamiento lateral**: La mayoría de tratamientos introductorios se enfocan en la fuerza de atrapamiento axial (vertical) y descuidan la fuerza restauradora lateral mucho más débil. En la práctica, la inestabilidad lateral es el modo de fallo primario, especialmente para objetos cerca del límite superior de tamaño.
- **Olvidar el flujo acústico**: Las ondas estacionarias de alta intensidad siempre impulsan flujos estacionarios. Estos flujos ejercen arrastre sobre el objeto levitado que compite con la fuerza de radiación. El flujo no es un efecto pequeño — puede ser la influencia desestabilizadora dominante a alto SPL.
- **Sensibilidad a la temperatura**: La velocidad del sonido en aire cambia aproximadamente 0.6 m/s por grado Celsius. En una variación de temperatura de 10 grados, la longitud de onda se desplaza aproximadamente 2%, lo que mueve las posiciones de los nodos milímetros en una cavidad típica. Experimentos de larga duración necesitan compensación activa de longitud o control de temperatura.
- **Confundir nodos de presión con nodos de velocidad**: Los nodos de presión son antinodos de velocidad y viceversa. Los objetos sólidos con factores de contraste positivos quedan atrapados en nodos de presión (donde la oscilación de presión es mínima y la oscilación de velocidad es máxima). Invertir esto lleva a atrapar en la posición incorrecta.
- **Descuidar efectos no lineales a alta amplitud**: Por encima de aproximadamente 155-160 dB SPL, los efectos acústicos no lineales (generación de armónicos, formación de choques) se vuelven significativos y reducen la fuerza de atrapamiento efectiva comparada con las predicciones de la teoría lineal.

## Habilidades Relacionadas

- `evaluate-levitation-mechanism` -- comparar levitación acústica con alternativas magnéticas, electrostáticas y aerodinámicas
- `analyze-magnetic-levitation` -- análisis complementario de levitación magnética para comparación
- `derive-theoretical-result` -- derivar la presión de radiación acústica desde primeros principios
