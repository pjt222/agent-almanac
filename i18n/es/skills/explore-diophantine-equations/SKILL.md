---
name: explore-diophantine-equations
description: >
  Resolver ecuaciones diofánticas (soluciones solo enteras) incluyendo lineales,
  cuadráticas y ecuaciones de Pell. Cubre el algoritmo euclidiano extendido,
  métodos de descenso y pruebas de existencia. Usar al encontrar todas las
  soluciones enteras de ax + by = c, resolver la ecuación de Pell, generar
  tripletas pitagóricas, demostrar que no existen soluciones enteras mediante
  restricciones modulares, o encontrar la solución fundamental a partir de la
  cual se generan todas las demás.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: advanced
  language: multi
  tags: number-theory, diophantine, integer-solutions, pell-equation, euclidean
  locale: es
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# Explore Diophantine Equations

Resolver ecuaciones diofánticas — ecuaciones polinomiales donde solo se buscan soluciones enteras. Clasificar la ecuación por tipo, probar la solubilidad, encontrar soluciones particulares y generales, y generar familias de soluciones. Cubre ecuaciones lineales, ecuaciones de Pell, tripletas pitagóricas y formas cuadráticas generales.

## Cuándo Usar

- Encontrar todas las soluciones enteras de una ecuación lineal ax + by = c
- Resolver la ecuación de Pell x^2 - Dy^2 = 1 (o = -1)
- Generar tripletas pitagóricas u otras familias enteras paramétricas
- Demostrar que una ecuación dada no tiene soluciones enteras (mediante restricciones modulares)
- Probar la solubilidad de una ecuación diofántica cuadrática general
- Encontrar la solución fundamental a partir de la cual se generan todas las demás

## Entradas

- **Requerido**: La ecuación diofántica a resolver (en forma explícita, ej., 3x + 5y = 17 o x^2 - 7y^2 = 1)
- **Opcional**: Si encontrar todas las soluciones, solo una solución particular, o demostrar la no existencia
- **Opcional**: Restricciones en los rangos de variables (ej., solo enteros positivos)
- **Opcional**: Si expresar la solución general paramétricamente
- **Opcional**: Técnica de demostración preferida (constructiva, descenso, obstrucción modular)

## Procedimiento

### Paso 1: Clasificar el Tipo de Ecuación

Determinar la estructura de la ecuación diofántica para seleccionar el método de resolución apropiado.

1. **Lineal**: ax + by = c donde a, b, c son enteros dados y x, y son incógnitas.
   - Método de resolución: Algoritmo euclidiano extendido.

2. **Ecuación de Pell**: x^2 - Dy^2 = 1 (o = -1, o = N) donde D es un entero positivo no cuadrado perfecto.
   - Método de resolución: Expansión en fracción continua de sqrt(D).

3. **Pitagórica**: x^2 + y^2 = z^2.
   - Método de resolución: Familia paramétrica x = m^2 - n^2, y = 2mn, z = m^2 + n^2.

4. **Cuadrática general**: ax^2 + bxy + cy^2 + dx + ey + f = 0.
   - Método de resolución: Completar el cuadrado, reducir a Pell o forma más simple, o aplicar restricciones modulares.

5. **Orden superior o especial**: Tipo Fermat (x^n + y^n = z^n para n > 2), suma de cuadrados, u otros.
   - Método de resolución: Obstrucción modular, descenso, o resultados de imposibilidad conocidos.

Registrar la clasificación y el método elegido.

**Esperado:** Una clasificación precisa con la estrategia de resolución identificada.

**En caso de fallo:** Si la ecuación no encaja en un tipo estándar, intentar sustitución o transformación para reducirla a una forma conocida. Por ejemplo, x^2 + y^2 + z^2 = n puede abordarse mediante el teorema de los tres cuadrados de Legendre. Si no hay reducción aparente, aplicar restricciones modulares (Paso 4) para probar obstrucciones.

### Paso 2: Resolver Ecuaciones Diofánticas Lineales (si tipo = lineal)

Resolver ax + by = c para enteros x, y.

1. **Calcular g = mcd(a, b)** usando el algoritmo euclidiano.

2. **Probar solubilidad**: Existen soluciones si y solo si g | c.
   - Si g no divide a c, demostrar no existencia: "Dado que mcd(a, b) = g y g no divide a c, la ecuación ax + by = c no tiene soluciones enteras."
   - Detenerse si no existe solución.

3. **Simplificar**: Dividir todo por g para obtener (a/g)x + (b/g)y = c/g, donde ahora mcd(a/g, b/g) = 1.

4. **Encontrar una solución particular** usando el algoritmo euclidiano extendido:
   - Expresar 1 = (a/g)*s + (b/g)*t mediante retro-sustitución.
   - Multiplicar por c/g: (c/g) = (a/g)*(s*c/g) + (b/g)*(t*c/g).
   - Solución particular: x0 = s * (c/g), y0 = t * (c/g).

5. **Escribir la solución general**:
   - x = x0 + (b/g)*k
   - y = y0 - (a/g)*k
   - para todos los enteros k.

6. **Aplicar restricciones** (si se requieren soluciones positivas):
   - Resolver x0 + (b/g)*k > 0 y y0 - (a/g)*k > 0 para k.
   - Reportar el rango de valores válidos de k o declarar que no existe solución positiva.

**Example (15x + 21y = 39):**
```
gcd(15, 21) = 3. Does 3 | 39? Yes.
Simplify: 5x + 7y = 13.
Extended Euclidean: 1 = 3*5 - 2*7.
Multiply by 13: 13 = 39*5 - 26*7.
Particular: x0 = 39, y0 = -26.
General: x = 39 + 7k, y = -26 - 5k, k in Z.
Check (k=0): 5*39 + 7*(-26) = 195 - 182 = 13. Correct.
```

**Esperado:** La familia de solución general (x, y) parametrizada por un entero k, con verificación de la solución particular.

**En caso de fallo:** Si la solución particular es incorrecta, re-verificar la retro-sustitución euclidiana extendida paso a paso. El error más común es un error de signo. Verificar: a * x0 + b * y0 debe ser igual a c exactamente (no solo módulo algo).

### Paso 3: Resolver Ecuaciones de Pell (si tipo = Pell)

Resolver x^2 - Dy^2 = 1 donde D es un entero positivo no cuadrado perfecto.

1. **Verificar que D no es un cuadrado perfecto**: Si D = k^2, entonces x^2 - k^2*y^2 = (x - ky)(x + ky) = 1, lo que obliga a x - ky = x + ky = +/-1, dando y = 0, x = +/-1 (trivial). La ecuación es interesante solo para D no cuadrado.

2. **Calcular la expansión en fracción continua de sqrt(D)**:
   - Inicializar: a0 = floor(sqrt(D)), m0 = 0, d0 = 1.
   - Iterar: m_{i+1} = d_i * a_i - m_i, d_{i+1} = (D - m_{i+1}^2) / d_i, a_{i+1} = floor((a0 + m_{i+1}) / d_{i+1}).
   - Continuar hasta que la secuencia de a_i se repita (la expansión es periódica después de a0).
   - Registrar la longitud del período r.

3. **Extraer la solución fundamental de los convergentes**:
   - Calcular los convergentes p_i / q_i de la fracción continua.
   - El convergente p_{r-1} / q_{r-1} (al final del primer período) da la solución fundamental:
     - Si r es par: (x1, y1) = (p_{r-1}, q_{r-1}) resuelve x^2 - Dy^2 = 1.
     - Si r es impar: (p_{r-1}, q_{r-1}) resuelve x^2 - Dy^2 = -1 (la ecuación de Pell negativa). Entonces (p_{2r-1}, q_{2r-1}) resuelve la ecuación positiva.

4. **Generar soluciones adicionales** a partir de la solución fundamental (x1, y1):
   - La recurrencia: x_{n+1} + y_{n+1} * sqrt(D) = (x1 + y1 * sqrt(D))^{n+1}.
   - Equivalentemente: x_{n+1} = x1 * x_n + D * y1 * y_n, y_{n+1} = x1 * y_n + y1 * x_n.

5. **Presentar** la solución fundamental y la recurrencia para generar todas las soluciones.

**Fundamental solutions for small D:**

| D  | (x1, y1) | D  | (x1, y1)   | D  | (x1, y1)   |
|----|----------|----|-------------|----|-----------  |
| 2  | (3, 2)   | 7  | (8, 3)      | 13 | (649, 180)  |
| 3  | (2, 1)   | 8  | (3, 1)      | 14 | (15, 4)     |
| 5  | (9, 4)   | 10 | (19, 6)     | 15 | (4, 1)      |
| 6  | (5, 2)   | 11 | (10, 3)     | 17 | (33, 8)     |

**Esperado:** La solución fundamental (x1, y1) verificada por sustitución, más la recurrencia para generar todas las soluciones positivas.

**En caso de fallo:** Si el cálculo de fracción continua no converge a un período, verificar la fórmula de iteración. La longitud del período r puede ser grande (ej., D = 61 tiene r = 11 y solución fundamental (1766319049, 226153980)). Para D grande, usar herramientas computacionales en lugar de cálculo manual.

### Paso 4: Aplicar Restricciones Modulares para Existencia/No Existencia (si tipo = cuadrática general o superior)

Demostrar que una ecuación no tiene soluciones enteras mostrando una obstrucción modular.

1. **Elegir un módulo m** (típicamente m = 2, 3, 4, 5, 7, 8, o 16).

2. **Enumerar todos los residuos**: Calcular el lado izquierdo módulo m para todos los residuos posibles de las variables.

3. **Verificar si alguna combinación da el lado derecho requerido módulo m**.
   - Si ninguna combinación funciona, la ecuación no tiene solución (obstrucción modular).

4. **Obstrucciones comunes**:
   - **Cuadrados mod 4**: n^2 = 0 o 1 (mod 4). Entonces x^2 + y^2 = c no tiene solución si c = 3 (mod 4).
   - **Cuadrados mod 8**: n^2 = 0, 1, o 4 (mod 8). Entonces x^2 + y^2 + z^2 = c no tiene solución si c = 7 (mod 8).
   - **Cubos mod 9**: n^3 = 0, 1, u 8 (mod 9). Entonces x^3 + y^3 + z^3 = c puede estar obstruida para ciertos c mod 9.

5. **Si no se encuentra obstrucción**, un enfoque modular no puede demostrar la no existencia. Las soluciones pueden o no existir; intentar métodos constructivos o descenso.

**Quadratic residues reference:**

| Mod | Squares (residues)         |
|-----|---------------------------|
| 3   | {0, 1}                    |
| 4   | {0, 1}                    |
| 5   | {0, 1, 4}                |
| 7   | {0, 1, 2, 4}             |
| 8   | {0, 1, 4}                |
| 11  | {0, 1, 3, 4, 5, 9}       |
| 13  | {0, 1, 3, 4, 9, 10, 12}  |
| 16  | {0, 1, 4, 9}             |

**Esperado:** Ya sea una demostración de no existencia mediante obstrucción modular, o una declaración de que no se encontró obstrucción en los módulos probados.

**En caso de fallo:** Si los métodos modulares son inconclusos, intentar descenso infinito: asumir que existe una solución, derivar una solución estrictamente menor, y repetir hasta alcanzar una contradicción con la positividad. Esta técnica es clásica para demostrar que x^4 + y^4 = z^2 no tiene soluciones no triviales.

### Paso 5: Generar Familias de Soluciones a partir de la Solución Fundamental

Expresar todas las soluciones en términos de la solución fundamental y parámetros enteros.

1. **Para ecuaciones lineales**: La familia es x = x0 + (b/g)*k, y = y0 - (a/g)*k (del Paso 2).

2. **Para ecuaciones de Pell**: Usar la recurrencia del Paso 3 para generar las primeras varias soluciones:
   ```
   (x1, y1), (x2, y2), (x3, y3), ...
   ```
   Listar al menos 3-5 soluciones como verificación de cordura.

3. **Para tripletas pitagóricas**: Generar tripletas primitivas a partir de parámetros m > n > 0, mcd(m, n) = 1, m - n impar:
   - a = m^2 - n^2, b = 2mn, c = m^2 + n^2.
   - Todas las tripletas primitivas surgen de esta manera (hasta intercambiar a y b).

4. **Para familias generales**: Expresar soluciones en forma paramétrica si es posible. Si la ecuación define una curva de género 0, existe una parametrización racional. Si género >= 1, puede haber finitamente muchas soluciones (teorema de Faltings para género >= 2).

5. **Verificar** al menos 3 miembros de la familia por sustitución en la ecuación original.

**Example (Pell, D = 2):**
```
Fundamental: (x1, y1) = (3, 2). Check: 9 - 2*4 = 1. Correct.
(x2, y2) = (3*3 + 2*2*2, 3*2 + 2*3) = (17, 12). Check: 289 - 2*144 = 1.
(x3, y3) = (3*17 + 2*2*12, 3*12 + 2*17) = (99, 70). Check: 9801 - 2*4900 = 1.
```

**Esperado:** Una descripción paramétrica o recursiva de todas las soluciones, con al menos 3 soluciones verificadas.

**En caso de fallo:** Si las soluciones generadas fallan la verificación, la solución fundamental o la fórmula de recurrencia es incorrecta. Para ecuaciones de Pell, re-derivar la solución fundamental de la fracción continua. Para ecuaciones lineales, re-verificar el cálculo euclidiano extendido.

## Validación

- [ ] La ecuación está correctamente clasificada por tipo (lineal, Pell, pitagórica, cuadrática general, orden superior)
- [ ] Para ecuaciones lineales: mcd(a, b) | c se verifica antes de resolver
- [ ] La retro-sustitución euclidiana extendida está verificada: a*x0 + b*y0 = c exactamente
- [ ] La solución general incluye todas las soluciones (parametrizada por entero k o recurrencia)
- [ ] Para Pell: D se verifica como no cuadrado antes de aplicar el método de fracción continua
- [ ] Para Pell: la solución fundamental satisface x1^2 - D*y1^2 = 1 por cálculo directo
- [ ] Las demostraciones de obstrucción modular enumeran todas las combinaciones de residuos, no solo algunas
- [ ] Al menos 3 miembros de cualquier familia de soluciones se verifican por sustitución
- [ ] Las restricciones (enteros positivos, rango acotado) se aplican después de encontrar la solución general
- [ ] Las afirmaciones de no existencia se justifican ya sea por condición de mcd u obstrucción modular

## Errores Comunes

- **Asumir que todas las ecuaciones con mcd | c tienen soluciones positivas**: La solución general x = x0 + (b/g)*k incluye valores negativos. Las soluciones positivas pueden no existir incluso cuando la ecuación es resoluble sobre todos los enteros.

- **Confundir x^2 - Dy^2 = 1 con x^2 - Dy^2 = -1**: La ecuación de Pell negativa tiene soluciones solo cuando la longitud del período de fracción continua es impar. Aplicar la fórmula de la ecuación positiva a un objetivo de ecuación negativa da un resultado incorrecto.

- **Olvidar la solución trivial de la ecuación de Pell**: (x, y) = (1, 0) siempre satisface x^2 - Dy^2 = 1 pero no es útil para generar soluciones no triviales. La solución fundamental es la solución *más pequeña* con y > 0.

- **Obstrucción modular incompleta**: Verificar solo mod 2 o mod 4 puede omitir obstrucciones visibles en módulos más altos. Si los primeros módulos no muestran obstrucción, intentar mod 8, 9, 16, o el discriminante de la forma cuadrática.

- **Error de uno en el período de fracción continua**: Los índices de convergentes deben rastrearse cuidadosamente. La solución fundamental viene de p_{r-1}/q_{r-1} donde r es la longitud del período, no de p_r/q_r.

- **Descenso infinito sin caso base**: Al usar descenso para demostrar no existencia, se debe mostrar que el descenso termina en una contradicción (ej., x = 0 contradice x > 0). Sin este caso base, el argumento está incompleto.

- **Aplicar incorrectamente el Último Teorema de Fermat**: x^n + y^n = z^n no tiene soluciones enteras no triviales para n > 2 (Wiles, 1995), pero esto no aplica a ecuaciones con coeficientes diferentes como 2x^3 + 3y^3 = z^3.

## Habilidades Relacionadas

- `analyze-prime-numbers` -- La factorización y el cálculo de mcd son prerrequisitos para resolver ecuaciones diofánticas
- `solve-modular-arithmetic` -- Las congruencias lineales ax = c (mod b) son equivalentes a ecuaciones diofánticas lineales
- `derive-theoretical-result` -- Técnicas de derivación formal para demostrar resultados de imposibilidad diofántica
