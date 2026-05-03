---
name: analyze-tensegrity-system
description: >
  Analyze a tensegrity system by identifying compression struts and tension
  cables, classifying type (class 1/2, biological/architectural), computing
  prestress equilibrium, verifying stability via Maxwell's rigidity criterion,
  and mapping biological tensegrity (microtubules, actin, intermediate
  filaments). Use when evaluating tensegrity in architecture, robotics,
  cell biology, or any system with isolated compression in continuous tension.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tensegrity
  complexity: advanced
  language: natural
  tags: tensegrity, structural-integrity, prestress, biomechanics, cytoskeleton, force-balance
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Analyze Tensegrity System

Analiza un sistema de tensegridad (integridad tensional) -- una estructura donde elementos de compresión aislados (puntales) son estabilizados por una red continua de tensión (cables/tendones). Determina el balance de fuerzas del sistema, el equilibrio de pretensión, la estabilidad estructural, y la coherencia entre escalas desde el citoesqueleto molecular hasta la forma arquitectónica.

## Cuándo Usar

- Evaluar si una estructura exhibe verdadera tensegridad (separación compresión-tensión) o es un marco convencional
- Analizar la estabilidad estructural de un diseño de tensegridad en arquitectura, robótica o estructuras desplegables
- Aplicar el modelo de tensegridad celular de Donald Ingber a la mecánica del citoesqueleto (microtúbulos, actina, filamentos intermedios)
- Evaluar la capacidad de carga y los modos de falla de un sistema de tensegridad existente
- Determinar si una estructura biológica (célula, tejido, sistema musculoesquelético) puede modelarse como tensegridad
- Calcular requerimientos de pretensión para que una tensegridad logre rigidez a pesar de tener más mecanismos que un truss convencional

## Entradas

- **Requerido**: Descripción del sistema (estructura física, célula biológica, modelo arquitectónico o mecanismo robótico)
- **Requerido**: Identificación de elementos candidatos de compresión y tensión
- **Opcional**: Propiedades del material (módulo de Young, sección transversal, longitud para cada elemento)
- **Opcional**: Cargas externas y condiciones de frontera
- **Opcional**: Escala de interés (molecular, celular, tisular, arquitectónica)
- **Opcional**: Familia topológica conocida (prisma, octaedro, icosaedro, X-module)

## Procedimiento

### Paso 1: Caracterizar el Sistema

Establecer la descripción física completa identificando cada elemento de compresión (puntal) y elemento de tensión (cable), su conectividad y las condiciones de frontera.

1. **Inventario de compresión**: Listar todos los puntales -- elementos rígidos que resisten compresión. Registrar la longitud de cada puntal, sección transversal, material y módulo de Young. En sistemas biológicos, identificar microtúbulos (cilindros huecos, ~25 nm diámetro exterior, 14 nm diámetro interior, E ~ 1.2 GPa, longitud de persistencia ~ 5 mm).
2. **Inventario de tensión**: Listar todos los cables -- elementos que resisten solo tensión y se aflojan bajo compresión. Registrar longitud de reposo, área de sección transversal y rigidez a tensión. En sistemas biológicos: filamentos de actina (helicoidales, ~7 nm diámetro, E ~ 2.6 GPa, longitud de persistencia ~ 17 um) y filamentos intermedios (IFs, ~10 nm diámetro, altamente extensibles, endurecimiento por deformación).
3. **Topología de conectividad**: Documentar qué puntales se conectan a qué cables en qué nodos (juntas). Construir la matriz de incidencia C (filas = miembros, columnas = nodos) codificando la topología.
4. **Condiciones de frontera**: Identificar nodos fijos (juntas con tierra), nodos libres y cargas externas. Anotar dirección y magnitud de carga gravitacional.
5. **Identificación de escala**: Clasificar como molecular (nm), celular (um), arquitectónica (m) o robótica (cm-m).

```markdown
## System Characterization
| ID | Type  | Length   | Cross-section | Material       | Stiffness     |
|----|-------|----------|---------------|----------------|---------------|
| S1 | strut | [value]  | [value]       | [material]     | E = [value]   |
| C1 | cable | [value]  | [value]       | [material]     | EA = [value]  |
- **Nodes**: [count], [fixed vs. free]
- **Scale**: [molecular / cellular / architectural / robotic]
- **Boundary conditions**: [description]
```

**Esperado:** Un inventario completo de todos los elementos de compresión y tensión con propiedades de material, una matriz de incidencia y condiciones de frontera suficientes para plantear las ecuaciones de equilibrio.

**En caso de fallo:** Si las propiedades de los elementos son desconocidas (común en sistemas biológicos), usar valores publicados: microtúbulos (E ~ 1.2 GPa, longitud de persistencia ~ 5 mm), actina (E ~ 2.6 GPa, longitud de persistencia ~ 17 um), filamentos intermedios (altamente no lineal, endurecimiento por deformación con módulo inicial bajo ~1 MPa subiendo a ~1 GPa con alta deformación). Si la conectividad no está clara, reducir el sistema a la topología más simple que capture las rutas de fuerza esenciales.

### Paso 2: Clasificar el Tipo de Tensegridad

Determinar a qué clase de tensegridad pertenece el sistema y si es biológica o de ingeniería.

1. **Determinación de clase**:
   - **Clase 1**: Los puntales no se tocan entre sí -- todos los puntales están aislados, conectados solo a través de la red de tensión. La mayoría de las estructuras de Fuller/Snelson son clase 1.
   - **Clase 2**: Los puntales pueden contactar en nodos compartidos. Muchos sistemas biológicos son clase 2 (los microtúbulos comparten puntos de unión al centrosoma).
2. **Identificación de topología**: Contar b = miembros totales (puntales + cables), j = nodos. Identificar si la topología coincide con una familia conocida: prisma de tensegridad (3 puntales, 6 cables, antiprisma triangular), octaedro expandido (6 puntales, 24 cables), tensegridad icosaédrica (30 puntales, 90 cables), o X-module (celda unitaria 2D básica).
3. **Biológica vs. de ingeniería**: La tensegridad biológica tiene características específicas: los elementos de compresión son discretos y rígidos (microtúbulos), la red de tensión es continua (córtex de actina + IFs), la pretensión se genera activamente (contractilidad actomiosina vía hidrólisis de ATP) y el sistema exhibe mecanotransducción (conversión de fuerza a señal). Documentar qué características están presentes.
4. **Dimensión**: Clasificar como 2D (planar) o 3D.

```markdown
## Tensegrity Classification
- **Class**: [1 (isolated struts) / 2 (strut-strut contact)]
- **Dimension**: [2D / 3D]
- **Topology**: [prism / octahedron / icosahedron / X-module / irregular]
- **Category**: [biological / architectural / robotic / artistic]
- **b** (members): [value], **j** (nodes): [value]

### Biological Tensegrity Mapping (if applicable)
| Cell Component          | Tensegrity Role       | Key Properties                              |
|-------------------------|-----------------------|---------------------------------------------|
| Microtubules            | Compression struts    | 25 nm OD, E~1.2 GPa, dynamic instability    |
| Actin filaments         | Tension cables        | 7 nm, cortical network, actomyosin contract. |
| Intermediate filaments  | Deep tension/prestress| 10 nm, strain-stiffening, nucleus-to-membrane|
| Extracellular matrix    | External anchor       | Collagen/fibronectin, integrin attachment     |
| Focal adhesions         | Ground nodes          | Mechanosensitive, connect cytoskeleton to ECM |
| Nucleus                 | Internal compression  | Lamina network forms sub-tensegrity           |
```

**Esperado:** Una clasificación clara (clase, dimensión, categoría) con la tabla de mapeo biológico completada para sistemas biológicos. Para sistemas de ingeniería, se identifica la familia topológica.

**En caso de fallo:** Si el sistema no encaja claramente en clase 1 o clase 2, puede ser un híbrido o un marco convencional. Una verdadera tensegridad requiere que al menos algunos elementos trabajen únicamente en tensión (cables que se aflojan bajo compresión). Si ningún elemento es solo de tensión, el sistema no es una tensegridad -- reclasificar como un truss o marco convencional y aplicar análisis estructural estándar.

### Paso 3: Analizar el Balance de Fuerzas y Equilibrio de Pretensión

Calcular el equilibrio estático en cada nodo, determinar el estado de pretensión (tensión/compresión interna sin carga externa) y verificar que todos los cables permanecen en tensión.

1. **Construir la matriz de equilibrio**: Para b miembros y j nodos en d dimensiones, construir la matriz de equilibrio A (tamaño dj x b). Cada columna codifica los cosenos directores de la contribución de fuerza de un miembro en sus dos nodos extremos. La ecuación de equilibrio es A * t = f_ext, donde t es el vector de densidades de fuerza por miembro (fuerza/longitud) y f_ext es el vector de carga externa.
2. **Resolver para auto-tensión**: Con f_ext = 0, encontrar el espacio nulo de A. Cada vector base de null(A) es un estado de auto-tensión -- fuerzas internas que satisfacen el equilibrio sin carga externa. El número de estados de auto-tensión independientes es s = b - rank(A).
3. **Verificar tensión de cables**: En cualquier auto-tensión válida de tensegridad, todos los cables deben tener densidad de fuerza positiva (tensión) y todos los puntales deben tener densidad de fuerza negativa (compresión). Una auto-tensión que pone un cable en compresión no es físicamente realizable (el cable se aflojaría).
4. **Calcular nivel de pretensión**: La pretensión real es una combinación lineal de vectores base de auto-tensión elegidos para que todas las tensiones de cables sean positivas. Registrar la tensión mínima de cable t_min (el margen antes de que algún cable se afloje).
5. **Capacidad de carga**: Añadir cargas externas y resolver A * t = f_ext. La carga a la cual la primera tensión de cable alcanza cero es la carga crítica F_crit.

```markdown
## Prestress Equilibrium
- **Equilibrium matrix A**: [dj] x [b] = [size]
- **Rank of A**: [value]
- **Self-stress states (s)**: s = b - rank(A) = [value]
- **Self-stress feasibility**: [all cables in tension? Yes/No]
- **Minimum cable tension**: t_min = [value]
- **Critical external load**: F_crit = [value]

| Member | Type  | Force Density | Force   | Status      |
|--------|-------|---------------|---------|-------------|
| S1     | strut | [negative]    | [value] | compression |
| C1     | cable | [positive]    | [value] | tension     |
```

**Esperado:** Los estados de auto-tensión están calculados, se encuentra una pretensión físicamente realizable (todos los cables en tensión, todos los puntales en compresión) y se estima la capacidad de carga.

**En caso de fallo:** Si ningún estado de auto-tensión mantiene todos los cables en tensión, la topología no soporta una pretensión de tensegridad. O bien (a) la matriz de incidencia tiene errores, (b) el sistema necesita cables adicionales, o (c) es un mecanismo en lugar de una tensegridad. Para sistemas grandes, usar el método de densidad de fuerzas (Schek, 1974) o cómputo numérico del espacio nulo en lugar de cálculo manual.

### Paso 4: Verificar Estabilidad Usando el Criterio de Maxwell

Determinar si la tensegridad es rígida (estable contra perturbaciones infinitesimales) o un mecanismo (tiene modos de deformación de energía cero).

1. **Aplicar la regla extendida de Maxwell**: Para un marco articulado en d dimensiones con b barras, j nodos, k restricciones cinemáticas (apoyos), s estados de auto-tensión y m mecanismos infinitesimales:

   **b - dj + k + s = m**

   Esto relaciona barras, juntas y restricciones con el balance entre estados de auto-tensión y mecanismos.

2. **Calcular desde la matriz de equilibrio**: rank(A) = b - s. El número de mecanismos es m = dj - k - rank(A). Si m = 0, la estructura es rígida de primer orden. Si m > 0, debe verificarse la estabilidad por pretensión.
3. **Test de estabilidad por pretensión**: Para cada modo de mecanismo q, calcular la energía de segundo orden E_2 = q^T * G * q, donde G es la matriz de rigidez geométrica (matriz de tensión). Si E_2 > 0 para todos los modos de mecanismo, la tensegridad es estable por pretensión (Connelly y Whiteley, 1996). Así es como la tensegridad logra rigidez -- no a través del conteo de barras, sino mediante estabilización de mecanismos por pretensión.
4. **Clasificar rigidez**:
   - **Cinemáticamente determinada**: m = 0, s = 0 (raro para tensegridad)
   - **Estáticamente indeterminada y rígida**: m = 0, s > 0
   - **Estable por pretensión**: m > 0, pero todos los mecanismos estabilizados por pretensión
   - **Mecanismo**: m > 0, no estabilizado (la estructura puede deformarse)

```markdown
## Stability Analysis (Maxwell's Criterion)
- **Bars (b)**: [value]
- **Joints (j)**: [value]
- **Dimension (d)**: [2 or 3]
- **Kinematic constraints (k)**: [value]
- **Rank of A**: [value]
- **Self-stress states (s)**: [value]
- **Mechanisms (m)**: [value]
- **Maxwell check**: b - dj + k + s = m --> [values]
- **Prestress stability**: [stable / unstable / N/A]
- **Rigidity class**: [determinate / indeterminate / prestress-stable / mechanism]
```

**Esperado:** Conteo de Maxwell realizado, mecanismos determinados y, para m > 0, evaluada la estabilidad por pretensión. La estructura se clasifica como rígida, estable por pretensión o mecanismo.

**En caso de fallo:** Si la estructura es un mecanismo (m > 0 y no estable por pretensión), opciones: (a) añadir cables para aumentar b y reducir m, (b) aumentar pretensión, (c) modificar topología. En sistemas biológicos, la contractilidad actomiosina activa ajusta continuamente la pretensión para mantener estabilidad -- la célula es una tensegridad auto-ajustable.

### Paso 5: Mapear Tensegridad Biológica (Análisis Cross-Escala)

Si el sistema tiene una interpretación biológica, mapear el análisis al modelo de tensegridad celular de Ingber y verificar coherencia cross-escala. Saltar este paso para sistemas puramente de ingeniería.

1. **Escala molecular (nm)**: Identificar filamentos proteicos como elementos de tensegridad. Microtúbulos (heterodímeros alfa/beta-tubulina, polimerización dependiente de GTP, inestabilidad dinámica con catástrofe/rescate). Actina (G-actina → polimerización F-actina, treadmilling). Filamentos intermedios (dependientes del tipo: vimentina, queratina, desmina, laminas nucleares).
2. **Escala celular (um)**: Mapear la tensegridad celular completa. Córtex de actina = capa de tensión continua. Microtúbulos irradiando desde el centrosoma = puntales de compresión apoyándose contra el córtex. IFs = ruta de tensión secundaria conectando el núcleo con las adhesiones focales. Contractilidad actomiosina (proteínas motoras miosina II) = generador activo de pretensión.
3. **Escala tisular (mm-cm)**: Las células forman una tensegridad de orden superior. Cada célula actúa como un elemento portador de compresión, conectada por una red continua de tensión de ECM (colágeno, elastina). Las uniones célula-célula (cadherinas) y uniones célula-ECM (integrinas) sirven como nodos.
4. **Coherencia cross-escala**: Verificar que la perturbación en una escala se propaga a otras. La fuerza externa en ECM se transmite a través de integrinas al citoesqueleto y al núcleo -- esta vía de mecanotransducción es la firma de la tensegridad cross-escala.

```markdown
## Cross-Scale Biological Tensegrity
| Scale      | Compression        | Tension              | Prestress Source      | Nodes              |
|------------|--------------------|----------------------|-----------------------|--------------------|
| Molecular  | Tubulin dimers     | Actin/IF subunits    | ATP/GTP hydrolysis    | Protein complexes  |
| Cellular   | Microtubules       | Actin cortex + IFs   | Actomyosin            | Focal adhesions    |
| Tissue     | Cells (turgor)     | ECM (collagen)       | Cell contractility    | Cell-ECM junctions |
| Organ      | Bones              | Muscles + fascia     | Muscle tone           | Joints             |

### Mechanotransduction Pathway
ECM --> integrin --> focal adhesion --> actin cortex --> IF --> nuclear lamina --> chromatin
```

**Esperado:** Tensegridad biológica mapeada en cada escala relevante con compresión, tensión, fuente de pretensión y nodos identificados. Transmisión de fuerza cross-escala documentada.

**En caso de fallo:** Si el mapeo cross-escala se rompe (sin continuidad clara de tensión entre escalas), documentar la brecha. No todas las estructuras biológicas son tensegridad en todas las escalas. La columna vertebral es tensegridad a nivel musculoesquelético (huesos=puntales, músculos/fascia=cables) pero las vértebras individuales son estructuras de compresión convencionales internamente.

### Paso 6: Sintetizar el Análisis y Evaluar la Integridad Estructural

Combinar todos los análisis precedentes en una evaluación final de la integridad tensional del sistema.

1. **Resumen de balance de fuerzas**: Indicar si se logra el equilibrio de pretensión, la clasificación de rigidez y el margen de capacidad de carga.
2. **Análisis de vulnerabilidad**: Identificar el miembro crítico -- el cable cuya falla causa la mayor pérdida de integridad (densidad de fuerza más alta relativa a la resistencia), y el puntal cuyo pandeo causaría colapso (verificar contra pandeo de Euler: P_cr = pi^2 * EI / L^2).
3. **Evaluación de redundancia**: ¿Cuántos cables se pueden quitar antes de que s caiga a 0? ¿Cuántos antes de que el sistema se vuelva un mecanismo no estabilizado?
4. **Recomendaciones de diseño** (sistemas de ingeniería): Niveles de pretensión de cables, dimensionamiento de puntales, modificaciones topológicas para mejores márgenes.
5. **Implicaciones biológicas** (sistemas biológicos): Relacionar con la fisiopatología -- estabilidad reducida de microtúbulos (colchicina/taxol), redes de IF disruptas (laminopatías), pretensión alterada (mecánica de células cancerosas con contractilidad aumentada).
6. **Calificación de integridad**:
   - **ROBUSTO**: s >= 2, todos los cables muy por encima del umbral de aflojamiento, la falla de un miembro crítico no causa colapso
   - **MARGINAL**: s = 1 o tensión mínima de cable cerca de cero bajo cargas esperadas
   - **FRÁGIL**: s = 0, o la falla de un miembro crítico causa colapso del sistema

```markdown
## Structural Integrity Assessment
- **Prestress equilibrium**: [achieved / not achieved]
- **Rigidity**: [determinate / indeterminate / prestress-stable / mechanism]
- **Load capacity margin**: [value or qualitative]
- **Critical member**: [ID] -- failure causes [consequence]
- **Redundancy**: [cables removable before mechanism]
- **Integrity rating**: [ROBUST / MARGINAL / FRAGILE]

### Recommendations
1. [specific recommendation]
2. [specific recommendation]
3. [specific recommendation]
```

**Esperado:** Evaluación completa de integridad estructural con clasificación de rigidez, identificación de vulnerabilidades, análisis de redundancia y calificación de integridad (ROBUSTO/MARGINAL/FRÁGIL) con recomendaciones accionables.

**En caso de fallo:** Si el análisis está incompleto (matriz de equilibrio demasiado grande, parámetros biológicos desconocidos), declarar la evaluación como condicional: "MARGINAL pendiente de verificación numérica" o "la clasificación requiere medición experimental del nivel de pretensión." Una evaluación parcial con brechas explícitas es más valiosa que ninguna evaluación.

## Validación

- [ ] Todos los elementos de compresión (puntales) y elementos de tensión (cables) están inventariados con propiedades
- [ ] La topología de conectividad está documentada (matriz de incidencia o equivalente)
- [ ] La clase de tensegridad (1 o 2) se determina basándose en el contacto entre puntales
- [ ] La matriz de equilibrio está construida y el rango calculado
- [ ] Se encuentra al menos un estado de auto-tensión con todos los cables en tensión
- [ ] La regla extendida de Maxwell se aplica: b - dj + k + s = m
- [ ] Los mecanismos infinitesimales (si los hay) se verifican para estabilidad por pretensión
- [ ] Se asigna la clasificación de rigidez
- [ ] Para sistemas biológicos, la tabla de mapeo cross-escala está completada
- [ ] La integridad estructural se califica como ROBUSTA, MARGINAL o FRÁGIL con justificación

## Errores Comunes

- **Confundir tensegridad con trusses convencionales**: Una tensegridad requiere que algunos elementos trabajen únicamente en tensión (se aflojan bajo compresión). Si todos los elementos pueden soportar tanto tensión como compresión, es un marco convencional, no una tensegridad. La naturaleza unidireccional de los cables crea la no linealidad que requiere pretensión para estabilidad.
- **Ignorar la pretensión en el análisis de estabilidad**: Una tensegridad sin tensión es siempre un mecanismo -- los cables en su longitud de reposo no proporcionan rigidez. El conteo de Maxwell por sí solo a menudo produce m > 0 para tensegridad, sugiriendo inestabilidad. La verificación de estabilidad por pretensión (Paso 4) es esencial: la pretensión es lo que hace rígida a la tensegridad.
- **Tratar la tensegridad biológica como estática**: La tensegridad celular se mantiene activamente por motores miosina II dependientes de ATP que generan contractilidad sobre la actina. La pretensión es dinámica, no fija. El análisis estático captura el principio estructural pero pierde la regulación activa. Siempre anotar si la pretensión es pasiva (pretensión de cables) o activa (generada por motores).
- **Aplicar la regla de Maxwell sin tener en cuenta el aflojamiento de cables**: La regla de Maxwell asume que todos los miembros están activos. Las cargas externas que causan que los cables se aflojen reducen el b efectivo, cambiando el cálculo de estabilidad. Rastrear qué cables permanecen tensos bajo cada caso de carga.
- **Confundir las esculturas de Snelson con el modelo celular de Ingber**: Las tensegridades artísticas de Snelson usan puntales de metal rígido y cables de acero. La tensegridad celular de Ingber presenta elementos viscoelásticos, regulación activa e inestabilidad dinámica de elementos de compresión (catástrofe de microtúbulos). El principio estructural es el mismo; el comportamiento del material es fundamentalmente diferente.
- **Descuidar el pandeo de puntales**: El análisis de tensegridad trata los puntales como rígidos. Los puntales esbeltos pueden pandearse (Euler: P_cr = pi^2 * EI / L^2). Si la fuerza compresiva se acerca a la carga de pandeo, la suposición de puntal rígido falla y la capacidad de carga real es menor que la predicha.

## Habilidades Relacionadas

- `assess-form` -- inventario estructural y preparación para transformación; assess-form evalúa la forma de un sistema genéricamente, mientras que esta habilidad aplica el marco específico de tensegridad de descomposición compresión-tensión
- `adapt-architecture` -- metamorfosis arquitectónica; el análisis de tensegridad identifica si la integridad depende de la continuidad de tensión, informando qué elementos pueden modificarse de forma segura durante la transformación
- `repair-damage` -- recuperación regenerativa; en tensegridad, la falla de cables y la falla de puntales tienen diferentes consecuencias, y el análisis de miembros críticos (Paso 6) informa directamente la prioridad de reparación
- `center` -- balance dinámico de razonamiento; el principio de tensegridad de estabilidad mediante tensión balanceada (no compresión rígida) es la metáfora estructural subyacente al centrado
- `integrate-gestalt` -- el mapeo tensión-resonancia en la integración gestáltica refleja la dualidad compresión-tensión; ambos encuentran coherencia mediante el juego productivo de fuerzas opuestas
- `analyze-magnetic-levitation` -- habilidad de análisis hermana que comparte el mismo patrón de rigor (caracterizar, clasificar, verificar estabilidad); la levitación logra balance de fuerzas sin contacto, la tensegridad logra balance de fuerzas con contacto mediante continuidad de tensión
- `construct-geometric-figure` -- construcción geométrica de posiciones de nodos de tensegridad; la figura geométrica proporciona la topología inicial que el análisis de tensegridad luego verifica para estabilidad
