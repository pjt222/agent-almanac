---
name: analyze-prime-numbers
description: >
  Analizar números primos usando pruebas de primalidad, algoritmos de
  factorización, análisis de distribución de primos y métodos de criba.
  Cubre división por tentativa, Miller-Rabin, Criba de Eratóstenes y el
  Teorema de los Números Primos. Usar al determinar si un entero es primo
  o compuesto, al encontrar factorizaciones primas, al contar o listar
  primos hasta un límite, o al investigar propiedades de primos dentro
  de una demostración o cómputo de teoría de números.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: multi
  tags: number-theory, primes, primality, factorization, sieve
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Analyze Prime Numbers

Analizar números primos seleccionando y aplicando el algoritmo apropiado para la tarea en cuestión: prueba de primalidad, factorización de enteros, o análisis de distribución de primos. Verificar resultados computacionalmente y relacionar los hallazgos con el Teorema de los Números Primos.

## Cuándo Usar

- Determinar si un entero dado es primo o compuesto
- Encontrar la factorización prima completa de un entero
- Contar o listar primos hasta un límite dado
- Verificar la aproximación del Teorema de los Números Primos para un rango específico
- Investigar propiedades de primos en una demostración o cómputo de teoría de números

## Entradas

- **Requerido**: El/los entero(s) a analizar, o un límite para análisis de distribución
- **Requerido**: Tipo de tarea -- uno de: prueba de primalidad, factorización, o análisis de distribución
- **Opcional**: Algoritmo preferido (división por tentativa, Miller-Rabin, Criba de Eratóstenes, rho de Pollard)
- **Opcional**: Si producir una demostración formal de primalidad o solo un veredicto computacional
- **Opcional**: Formato de salida (árbol de factores, lista de primos, conteo, tabla)

## Procedimiento

### Paso 1: Determinar el Tipo de Tarea

Clasificar la solicitud en una de tres categorías y seleccionar la ruta algorítmica apropiada.

1. **Prueba de primalidad**: Dado un entero n, determinar si n es primo.
2. **Factorización**: Dado un entero compuesto n, encontrar su factorización prima completa.
3. **Análisis de distribución**: Dado un límite N, analizar los primos hasta N (conteo, lista, brechas, densidad).

Registrar el tipo de tarea y el/los valor(es) de entrada.

**Esperado:** Una clasificación clara con los valores de entrada registrados.

**En caso de fallo:** Si la entrada es ambigua (ej., "analiza 60"), pedir al usuario que clarifique si quiere una prueba de primalidad, factorización, o análisis de distribución. Por defecto usar factorización para números compuestos y confirmación de primalidad para primos sospechados.

### Paso 2: Aplicar Prueba de Primalidad (si tarea = primalidad)

Probar si n es primo usando un algoritmo ajustado al tamaño de n.

1. **Manejar casos triviales**: n < 2 no es primo. n = 2 o n = 3 es primo. Si n es par y n > 2, es compuesto.

2. **n pequeño (n < 10^6)**: Usar división por tentativa.
   - Probar divisibilidad por todos los primos p hasta floor(sqrt(n)).
   - Optimización: probar 2, luego impares 3, 5, 7, ... o usar una rueda 6k +/- 1.
   - Si no se encuentra divisor, n es primo.

3. **n grande (n >= 10^6)**: Usar prueba probabilística de Miller-Rabin.
   - Escribir n - 1 = 2^s * d donde d es impar.
   - Para cada testigo a en {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}:
     - Calcular x = a^d mod n.
     - Si x = 1 o x = n - 1, este testigo pasa.
     - De lo contrario, elevar al cuadrado x hasta s - 1 veces. Si x alguna vez es igual a n - 1, pasa.
     - Si no pasa, n es compuesto (a es un testigo).
   - Para n < 3.317 * 10^24, los testigos {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} dan un resultado determinista.

4. **Registrar el veredicto**: primo o compuesto, con el testigo o certificado.

**Small primes reference (first 25):**

| Index | Prime | Index | Prime | Index | Prime |
|-------|-------|-------|-------|-------|-------|
| 1     | 2     | 10    | 29    | 19    | 67    |
| 2     | 3     | 11    | 31    | 20    | 71    |
| 3     | 5     | 12    | 37    | 21    | 73    |
| 4     | 7     | 13    | 41    | 22    | 79    |
| 5     | 11    | 14    | 43    | 23    | 83    |
| 6     | 13    | 15    | 47    | 24    | 89    |
| 7     | 17    | 16    | 53    | 25    | 97    |
| 8     | 19    | 17    | 59    |       |       |
| 9     | 23    | 18    | 61    |       |       |

**Esperado:** Una respuesta definitiva (primo o compuesto) con el algoritmo usado y cualquier testigo o divisor encontrado.

**En caso de fallo:** Si Miller-Rabin reporta "probablemente primo" pero se requiere certeza, escalar a una prueba determinista (ej., AKS o ECPP). Para división por tentativa, si el cómputo es demasiado lento, cambiar a Miller-Rabin.

### Paso 3: Aplicar Factorización (si tarea = factorización)

Factorizar n completamente en su descomposición en potencias de primos.

1. **Extraer factores pequeños por división por tentativa**:
   - Dividir por 2 tantas veces como sea posible, registrando el exponente.
   - Dividir por primos impares 3, 5, 7, 11, ... hasta un corte (ej., 10^4 o sqrt(n) si n es pequeño).
   - Después de cada división, actualizar n al cofactor restante.

2. **Si cofactor > 1 y cofactor < 10^12**: Continuar división por tentativa hasta sqrt(cofactor).

3. **Si cofactor > 1 y cofactor >= 10^12**: Aplicar el algoritmo rho de Pollard.
   - Elegir f(x) = x^2 + c (mod n) con c aleatorio.
   - Usar detección de ciclos de Floyd: x = f(x), y = f(f(y)).
   - Calcular d = mcd(|x - y|, n) en cada paso.
   - Si 1 < d < n, d es un factor no trivial. Recursar sobre d y n/d.
   - Si d = n, reintentar con un c diferente.

4. **Verificar**: Multiplicar todos los factores primos encontrados (con exponentes) y confirmar que el producto es igual al n original. Probar la primalidad de cada factor.

5. **Presentar el resultado** en forma estándar: n = p1^a1 * p2^a2 * ... * pk^ak con p1 < p2 < ... < pk.

**Algorithm complexity notes:**

| Algorithm       | Complexity                  | Best for              |
|-----------------|-----------------------------|-----------------------|
| Trial division  | O(sqrt(n))                  | n < 10^12             |
| Pollard's rho   | O(n^{1/4}) expected         | n up to ~10^18        |
| Quadratic sieve | L(n)^{1+o(1)}              | n up to ~10^50        |
| GNFS            | L(n)^{(64/9)^{1/3}+o(1)}  | n > 10^50             |

**Esperado:** A complete prime factorization in canonical form, verified by multiplication.

**En caso de fallo:** If Pollard's rho fails to find a factor after many iterations (cycle detected without a non-trivial gcd), try different values of c (at least 5 attempts). If all fail, the cofactor may be prime -- confirm with a primality test.

### Paso 4: Aplicar Análisis de Distribución (si tarea = distribución)

Analizar la distribución de primos hasta un límite dado N.

1. **Generar primos usando la Criba de Eratóstenes**:
   - Crear un arreglo booleano de tamaño N + 1, inicializado en verdadero.
   - Establecer los índices 0 y 1 en falso (no primos).
   - Para cada p desde 2 hasta floor(sqrt(N)):
     - Si p sigue marcado como verdadero, marcar todos los múltiplos p^2, p^2 + p, p^2 + 2p, ... como falsos.
   - Recopilar todos los índices que siguen marcados como verdaderos.

2. **Contar primos**: Calcular pi(N) = número de primos hasta N.

3. **Comparar con el Teorema de los Números Primos**:
   - Aproximación del TNP: pi(N) ~ N / ln(N).
   - Aproximación por integral logarítmica: Li(N) = integral de 2 a N de 1/ln(t) dt.
   - Calcular el error relativo: |pi(N) - N/ln(N)| / pi(N).

4. **Analizar brechas entre primos** (opcional):
   - Calcular las brechas entre primos consecutivos.
   - Reportar la brecha máxima, la brecha promedio y cualquier primo gemelo (brecha = 2).
   - La brecha promedio cerca de N es aproximadamente ln(N).

5. **Presentar hallazgos** en una tabla resumen:

```
Bound N:       1,000,000
pi(N):         78,498
N/ln(N):       72,382
Li(N):         78,628
Relative error (N/ln(N)):  7.79%
Relative error (Li(N)):    0.17%
Max prime gap:  148 (between 492113 and 492227)
Twin primes:    8,169 pairs
```

**Esperado:** Un conteo de primos con comparación del TNP y análisis de brechas opcional.

**En caso de fallo:** Si N es demasiado grande para cribar en memoria (N > 10^9), usar una criba segmentada que procese el rango en bloques. Si solo se necesita un conteo (no una lista), usar el algoritmo de Meissel-Lehmer para pi(N) directamente.

### Paso 5: Verificar Resultados Computacionalmente

Verificar cruzadamente todos los resultados usando un método de cómputo independiente.

1. **Para primalidad**: Si se usó división por tentativa, verificar con un pase rápido de Miller-Rabin (o viceversa). Para primos conocidos, contrastar con tablas de primos publicadas o secuencias de OEIS.

2. **Para factorización**: Multiplicar todos los factores y confirmar la igualdad con la entrada original. Probar independientemente la primalidad de cada factor primo declarado.

3. **Para distribución**: Verificar por muestreo probando la primalidad de 3-5 números individuales de la salida de la criba. Comparar pi(N) contra valores publicados para referencias estándar (pi(10^k) para k = 1, ..., 9).

**Published values of pi(N):**

| N       | pi(N)        |
|---------|-------------|
| 10      | 4           |
| 100     | 25          |
| 1,000   | 168         |
| 10,000  | 1,229       |
| 100,000 | 9,592       |
| 10^6    | 78,498      |
| 10^7    | 664,579     |
| 10^8    | 5,761,455   |
| 10^9    | 50,847,534  |

4. **Documentar la verificación** con el método usado y el resultado.

**Esperado:** Todos los resultados verificados independientemente sin discrepancias.

**En caso de fallo:** Si la verificación revela una discrepancia, re-ejecutar el cómputo original con verificaciones extra habilitadas (ej., registro detallado de división por tentativa). Los errores más comunes son errores de uno en los límites de la criba, desbordamiento de enteros en aritmética modular y confundir un pseudoprimo con un primo.

## Validación

- [ ] El tipo de tarea está correctamente clasificado (primalidad, factorización o distribución)
- [ ] El algoritmo es apropiado para el tamaño de la entrada
- [ ] Los casos triviales (n < 2, n = 2, n par) se manejan antes de los algoritmos generales
- [ ] Los veredictos de primalidad son definitivos (no "probablemente primo" sin calificación)
- [ ] Las factorizaciones multiplican de vuelta al número original
- [ ] Cada factor primo declarado ha sido probado para primalidad
- [ ] Los límites de la criba incluyen cobertura de sqrt(N) para marcar compuestos
- [ ] La comparación con el TNP usa la fórmula correcta (N/ln(N) o Li(N))
- [ ] Los resultados están verificados por un método independiente o contra valores publicados
- [ ] Los casos extremos (n = 0, 1, 2, entradas negativas) están abordados

## Errores Comunes

- **Olvidar que n = 1 no es primo**: Por convención, 1 no es primo ni compuesto. Muchos algoritmos lo clasifican erróneamente de forma silenciosa.

- **Desbordamiento de enteros en exponenciación modular**: Al calcular a^d mod n para Miller-Rabin, la exponenciación ingenua desborda. Usar exponenciación modular (cuadrado repetido con mod en cada paso).

- **Errores de uno en la criba**: La criba debe marcar compuestos comenzando desde p^2, no desde 2p. Comenzar desde 2p desperdicia tiempo pero es correcto; comenzar desde p+1 es incorrecto.

- **Ciclo de rho de Pollard con d = n**: Si mcd(|x - y|, n) = n, el algoritmo encontró el factor trivial. Reintentar con una constante polinómica c diferente, no solo un punto de partida diferente.

- **Números de Carmichael engañando la prueba de Fermat**: Números como 561 = 3 * 11 * 17 pasan la prueba de primalidad de Fermat para todas las bases coprimas. Usar siempre Miller-Rabin, no Fermat simple.

- **Confundir pi(n) con la constante pi**: La función contadora de primos pi(n) y la constante del círculo 3.14159... comparten notación. El contexto debe ser inequívoco.

## Habilidades Relacionadas

- `solve-modular-arithmetic` -- La aritmética modular sustenta Miller-Rabin y muchos métodos de factorización
- `explore-diophantine-equations` -- La factorización prima es un prerrequisito para resolver muchas ecuaciones diofánticas
- `formulate-quantum-problem` -- El algoritmo de Shor para factorización de enteros conecta los primos con la computación cuántica
