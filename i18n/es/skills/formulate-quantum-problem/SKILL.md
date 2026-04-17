---
name: formulate-quantum-problem
description: >
  Formular un problema de mecánica cuántica o química cuántica con el marco
  matemático apropiado incluyendo espacio de Hilbert, operadores, condiciones
  de frontera, y selección de método de aproximación. Usar al plantear un
  problema de mecánica cuántica para solución analítica o numérica, al formular
  un cálculo de química cuántica, al traducir un escenario físico al formalismo
  de Schrodinger o Dirac, o al elegir entre teoría de perturbaciones, métodos
  variacionales, DFT y diagonalización exacta.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: advanced
  language: natural
  tags: theoretical, quantum-mechanics, quantum-chemistry, hilbert-space, formulation
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Formulate Quantum Problem

Traducir un sistema físico en un problema cuántico bien planteado identificando los grados de libertad relevantes, construyendo el Hamiltoniano y el espacio de estados, especificando condiciones de frontera, seleccionando un método de aproximación apropiado, y validando la formulación contra límites conocidos.

## Cuándo Usar

- Plantear un problema de mecánica cuántica para solución analítica o numérica
- Formular un cálculo de química cuántica (orbitales moleculares, estructura electrónica)
- Traducir un escenario físico al formalismo de Dirac o Schrodinger
- Elegir entre teoría de perturbaciones, métodos variacionales, DFT o diagonalización exacta
- Preparar un modelo teórico para comparación con datos experimentales espectroscópicos o de dispersión

## Entradas

- **Requerido**: Descripción del sistema físico (átomo, molécula, sólido, campo, etc.)
- **Requerido**: Observable(s) de interés (espectro de energía, tasas de transición, propiedades del estado fundamental)
- **Opcional**: Restricciones experimentales o datos a reproducir (líneas espectrales, energías de enlace)
- **Opcional**: Nivel de precisión deseado o presupuesto computacional
- **Opcional**: Formalismo preferido (mecánica ondulatoria, mecánica matricial, segunda cuantización, integral de camino)

## Procedimiento

### Paso 1: Identificar el sistema físico y grados de libertad relevantes

Caracterizar el sistema completamente antes de escribir cualquier ecuación:

1. **Contenido de partículas**: Listar todas las partículas (electrones, núcleos, fotones, fonones) y sus números cuánticos (espín, carga, masa).
2. **Simetrías**: Identificar simetrías espaciales (esférica, cilíndrica, traslacional, grupo cristalino), simetrías internas (rotación de espín, gauge), y simetrías discretas (paridad, inversión temporal).
3. **Escalas de energía**: Determinar las escalas de energía relevantes para decidir qué grados de libertad están activos y cuáles pueden congelarse o tratarse adiabáticamente.
4. **Reducción de grados de libertad**: Aplicar la aproximación de Born-Oppenheimer si las escalas temporales nucleares y electrónicas se separan. Identificar coordenadas colectivas si aplican simplificaciones de muchos cuerpos.

```markdown
## System Characterization
- **Particles**: [list with quantum numbers]
- **Active degrees of freedom**: [coordinates, spins, fields]
- **Frozen degrees of freedom**: [and justification for freezing]
- **Symmetry group**: [continuous and discrete]
- **Energy scale hierarchy**: [e.g., electronic >> vibrational >> rotational]
```

**Esperado:** Un inventario completo de partículas, números cuánticos, simetrías, y una selección justificada de grados de libertad activos versus congelados.

**En caso de fallo:** Si la jerarquía de escalas de energía no es clara, retener todos los grados de libertad inicialmente y marcar la necesidad de un análisis de escala. La truncación prematura conduce a física cualitativamente incorrecta.

### Paso 2: Construir el Hamiltoniano y el espacio de estados

Construir el marco matemático a partir de los grados de libertad identificados en el Paso 1:

1. **Espacio de Hilbert**: Definir el espacio de estados. Para sistemas de dimensión finita, especificar la base (ej., base de espín-1/2 |arriba>, |abajo>). Para sistemas de dimensión infinita, especificar el espacio funcional (ej., L2(R^3) para una partícula individual en 3D).
2. **Términos cinéticos**: Escribir el operador de energía cinética para cada partícula. En representación de posición, T = -hbar^2/(2m) nabla^2.
3. **Términos de potencial**: Escribir todos los potenciales de interacción (Coulomb, armónico, espín-órbita, campos externos). Ser explícito sobre la forma funcional y las constantes de acoplamiento.
4. **Hamiltoniano compuesto**: Ensamblar H = T + V, agrupando términos por tipo de interacción. Para sistemas de múltiples partículas, incluir términos de intercambio y correlación o notar dónde entrarán vía aproximación.
5. **Álgebra de operadores**: Verificar que el Hamiltoniano es Hermítico. Identificar constantes de movimiento ([H, O] = 0) que pueden usarse para diagonalizar por bloques el problema.

```markdown
## Hamiltonian Structure
- **Hilbert space**: [definition and basis]
- **H = T + V decomposition**:
  - T = [kinetic terms]
  - V = [potential terms, grouped by type]
- **Constants of motion**: [operators commuting with H]
- **Symmetry-adapted basis**: [if block diagonalization is possible]
```

**Esperado:** Un Hamiltoniano completo y Hermítico con todos los términos escritos explícitamente, el espacio de Hilbert definido, y las constantes de movimiento identificadas.

**En caso de fallo:** Si el Hamiltoniano no es manifiestamente Hermítico, verificar si faltan términos conjugados o fases dependientes del gauge. Si el espacio de Hilbert es ambiguo (ej., para partículas relativistas), especificar el formalismo explícitamente y notar el problema.

### Paso 3: Especificar condiciones de frontera e iniciales

Restringir el problema para que tenga una solución única:

1. **Condiciones de frontera**: Para problemas de estados ligados, requerir normalizabilidad (psi -> 0 en el infinito). Para problemas de dispersión, especificar condiciones de frontera de onda entrante. Para sistemas periódicos, aplicar condiciones de Bloch o Born-von Karman.
2. **Restricciones de dominio**: Especificar el dominio espacial. Para una partícula en una caja, definir las paredes. Para un átomo de hidrógeno, definir los dominios radial y angular. Para modelos de red, definir la red y su topología.
3. **Estado inicial** (problemas dependientes del tiempo): Definir el estado en t=0 como una expansión en la base de eigenestados de energía o como un paquete de ondas con centro y ancho especificados.
4. **Ecuaciones de restricción**: Para partículas indistinguibles, imponer simetrización (bosones) o antisimetrización (fermiones). Para teorías gauge, imponer condiciones de fijación de gauge.

```markdown
## Boundary and Initial Conditions
- **Spatial domain**: [definition]
- **Boundary type**: [Dirichlet / Neumann / periodic / scattering]
- **Normalization**: [condition]
- **Particle statistics**: [bosonic / fermionic / distinguishable]
- **Initial state** (if time-dependent): [specification]
```

**Esperado:** Condiciones de frontera que son físicamente motivadas, matemáticamente consistentes con el dominio del Hamiltoniano, y suficientes para determinar una solución única (o una matriz de dispersión bien definida).

**En caso de fallo:** Si las condiciones de frontera están sobre- o sub-determinadas, verificar la auto-adjunción del Hamiltoniano en el dominio elegido. Los Hamiltonianos no auto-adjuntos requieren tratamiento cuidadoso de índices de deficiencia.

### Paso 4: Seleccionar método de aproximación

Elegir una estrategia de solución apropiada a la estructura del problema:

1. **Evaluar solubilidad exacta**: Verificar si el problema se reduce a un modelo exactamente soluble conocido (oscilador armónico, átomo de hidrógeno, modelo de Ising, etc.). Si es así, usar la solución exacta como resultado principal y teoría de perturbaciones para correcciones.

2. **Teoría de perturbaciones** (acoplamiento débil):
   - Dividir H = H0 + lambda V donde H0 es exactamente soluble
   - Verificar que lambda V es pequeño comparado con el espaciado de niveles de H0
   - Verificar degeneración; usar teoría de perturbaciones degenerada si es necesario
   - Adecuada cuando: la interacción es débil, sistema de pocos cuerpos, se necesitan resultados analíticos

3. **Métodos variacionales** (enfoque en estado fundamental):
   - Elegir una función de onda de prueba con parámetros ajustables
   - Asegurar que la función de prueba satisface condiciones de frontera y simetría
   - Adecuada cuando: la energía del estado fundamental es el objetivo principal, sistema de muchos cuerpos

4. **Teoría del Funcional de la Densidad** (sistemas de muchos electrones):
   - Elegir el funcional de intercambio-correlación (LDA, GGA, híbrido)
   - Definir el conjunto de bases (ondas planas, gaussianas, orbitales atómicos numéricos)
   - Adecuada cuando: sistema de muchos electrones, se necesitan densidad y energía del estado fundamental

5. **Métodos numéricos exactos** (sistemas pequeños, benchmarking):
   - Diagonalización exacta para espacios de Hilbert pequeños
   - Monte Carlo cuántico para muestreo del estado fundamental
   - DMRG para sistemas unidimensionales o cuasi-unidimensionales
   - Adecuada cuando: se necesita alta precisión y el sistema es suficientemente pequeño

```markdown
## Approximation Method Selection
- **Method chosen**: [name]
- **Justification**: [why this method fits the problem structure]
- **Expected accuracy**: [order of perturbation, variational bound quality, DFT functional accuracy]
- **Computational cost**: [scaling with system size]
- **Alternatives considered**: [and why they were rejected]
```

**Esperado:** Una elección justificada de método de aproximación con una declaración clara de precisión esperada y costo computacional, más documentación de alternativas consideradas.

**En caso de fallo:** Si ningún método individual es claramente apropiado, formular el problema para dos métodos y comparar resultados. El desacuerdo entre métodos revela la dificultad del problema y guía el refinamiento posterior.

### Paso 5: Validar la formulación contra límites conocidos

Antes de resolver, verificar que la formulación reproduce física conocida:

1. **Límite clásico**: Tomar hbar -> 0 (o números cuánticos grandes) y verificar que el Hamiltoniano se reduce a la mecánica clásica correcta.
2. **Límite sin interacción**: Poner las constantes de acoplamiento a cero y verificar que la solución es un producto de estados de una partícula.
3. **Límites de simetría**: Verificar que la formulación respeta todas las simetrías identificadas. Comprobar que el Hamiltoniano se transforma correctamente bajo el grupo de simetría.
4. **Análisis dimensional**: Verificar que cada término en el Hamiltoniano tiene unidades de energía. Comprobar que las escalas características de longitud, energía y tiempo son físicamente razonables.
5. **Resultados exactos conocidos**: Si el sistema tiene soluciones exactas conocidas en casos especiales (ej., átomo de hidrógeno para Z=1, oscilador armónico para potencial cuadrático), verificar que la formulación los reproduce.

```markdown
## Validation Checks
| Check | Expected Result | Status |
|-------|----------------|--------|
| Classical limit (hbar -> 0) | [classical Hamiltonian] | [Pass/Fail] |
| Non-interacting limit | [product states] | [Pass/Fail] |
| Symmetry transformation | [correct representation] | [Pass/Fail] |
| Dimensional analysis | [all terms in energy units] | [Pass/Fail] |
| Known exact case | [reproduced result] | [Pass/Fail] |
```

**Esperado:** Todas las verificaciones de validación pasan. La formulación es autoconsistente y está lista para resolver.

**En caso de fallo:** Una verificación de validación que falla indica un error en la construcción del Hamiltoniano o las condiciones de frontera. Rastrear la falla hasta el término o condición específica y corregirla antes de proceder a resolver.

## Validación

- [ ] Todas las partículas y números cuánticos están listados explícitamente
- [ ] El espacio de Hilbert está definido con una base clara
- [ ] El Hamiltoniano es Hermítico y todos los términos tienen unidades correctas
- [ ] Las constantes de movimiento están identificadas y usadas para simplificación
- [ ] Las condiciones de frontera son físicamente motivadas y matemáticamente suficientes
- [ ] La estadística de partículas (bosónica/fermiónica) se impone correctamente
- [ ] La elección del método de aproximación está justificada con precisión esperada declarada
- [ ] Los límites clásico, sin interacción y de simetría están verificados
- [ ] Los resultados exactos conocidos se reproducen en casos especiales
- [ ] La formulación es suficientemente completa para que otro investigador la implemente

## Errores Comunes

- **Omitir grados de libertad prematuramente**: Congelar un grado de libertad sin verificar la jerarquía de escalas de energía puede perder física cualitativamente importante. Siempre justificar cada reducción con un argumento de escala de energía.
- **Hamiltoniano no Hermítico**: Olvidar términos conjugados en acoplamiento espín-órbita o potenciales complejos. Siempre verificar H = H-daga explícitamente.
- **Condiciones de frontera incorrectas para dispersión**: Usar condiciones de frontera de estados ligados (normalizabilidad) para un problema de dispersión descarta el espectro continuo por completo. Hacer coincidir las condiciones de frontera con la pregunta física.
- **Ignorar degeneración en teoría de perturbaciones**: Aplicar teoría de perturbaciones no degenerada a un nivel degenerado produce correcciones divergentes. Siempre verificar degeneración antes de expandir.
- **Dependencia excesiva de una sola aproximación**: Diferentes métodos tienen modos de fallo complementarios. Los métodos variacionales dan cotas superiores pero pueden perder estados excitados. La teoría de perturbaciones diverge a acoplamiento fuerte. Validar cruzando cuando sea posible.
- **Inconsistencia dimensional**: Mezclar unidades naturales (hbar = 1) con unidades SI en la misma expresión. Adoptar un sistema de unidades consistente al inicio y declararlo explícitamente.

## Habilidades Relacionadas

- `derive-theoretical-result` -- derivar resultados analíticos del problema formulado
- `survey-theoretical-literature` -- encontrar trabajo previo sobre sistemas cuánticos similares
