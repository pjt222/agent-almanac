---
name: solve-modular-arithmetic
description: >
  Resolver problemas de aritmética modular incluyendo congruencias, sistemas
  mediante el Teorema Chino del Resto, inversos modulares y aplicaciones del
  teorema de Euler. Cubre enfoques tanto manuales como computacionales. Usar
  al resolver congruencias lineales, calcular inversos modulares, evaluar
  exponenciaciones modulares grandes, trabajar con congruencias simultáneas
  (TCR) u operar en grupos cíclicos y contextos de logaritmo discreto.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: multi
  tags: number-theory, modular-arithmetic, congruences, crt, euler
  locale: es
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# Solve Modular Arithmetic

Resolver problemas de aritmética modular analizando sistemas de congruencias, aplicando el algoritmo euclidiano extendido para inversos, usando el Teorema Chino del Resto para congruencias simultáneas y aprovechando el teorema de Euler para exponenciación modular. Verificar cada solución por sustitución.

## Cuándo Usar

- Resolver una congruencia lineal simple ax = b (mod m)
- Resolver un sistema de congruencias simultáneas (Teorema Chino del Resto)
- Calcular un inverso modular a^{-1} (mod m)
- Evaluar exponenciaciones modulares grandes a^k (mod m)
- Determinar el orden de un elemento en Z/mZ
- Trabajar con grupos cíclicos, raíces primitivas o contextos de logaritmo discreto

## Entradas

- **Requerido**: La(s) congruencia(s) o ecuación modular a resolver
- **Opcional**: Si se deben mostrar los pasos del algoritmo euclidiano extendido explícitamente
- **Opcional**: Si se debe aplicar el teorema de Euler o el pequeño teorema de Fermat
- **Opcional**: Si se deben encontrar raíces primitivas u órdenes de elementos
- **Opcional**: Formato de salida (paso a paso, compacto o estilo demostración)

## Procedimiento

### Paso 1: Analizar el Sistema de Congruencias o Ecuación Modular

Extraer la estructura matemática del enunciado del problema.

1. **Identificar el tipo**:
   - Congruencia lineal simple: ax = b (mod m)
   - Sistema de congruencias: x = a1 (mod m1), x = a2 (mod m2), ...
   - Exponenciación modular: a^k (mod m)
   - Inverso modular: encontrar a^{-1} (mod m)

2. **Normalizar**: Reducir todos los coeficientes módulo sus respectivos módulos. Asegurar que a, b, m sean enteros no negativos con m > 0.

3. **Registrar** el problema analizado en notación estándar.

**Esperado:** Un problema modular claramente analizado y normalizado con todos los valores reducidos.

**En caso de fallo:** Si la notación es ambigua (ej., "resolver 3x + 5 = 2 mod 7" podría significar 3x + 5 = 2 (mod 7) o 3x + (5 = 2 mod 7)), aclarar con el usuario. Por defecto, interpretar mod como aplicándose a toda la ecuación.

### Paso 2: Resolver una Congruencia Simple (si aplica)

Resolver ax = b (mod m) usando el algoritmo euclidiano extendido.

1. **Calcular g = mcd(a, m)** usando el algoritmo euclidiano:
   - Aplicar división repetida: m = q1*a + r1, a = q2*r1 + r2, ... hasta que el residuo = 0.
   - El último residuo no nulo es mcd(a, m).

2. **Verificar solubilidad**: ax = b (mod m) tiene solución si y solo si g | b.
   - Si g no divide a b, la congruencia no tiene solución. Detenerse.

3. **Reducir**: Dividir entre g para obtener (a/g)x = (b/g) (mod m/g). Ahora mcd(a/g, m/g) = 1.

4. **Encontrar el inverso modular** de a/g módulo m/g usando el algoritmo euclidiano extendido:
   - Retro-sustituir a través de los pasos del algoritmo euclidiano para expresar el mcd como combinación lineal: 1 = (a/g)*s + (m/g)*t.
   - El coeficiente s (reducido mod m/g) es el inverso.

5. **Calcular la solución particular**: x0 = s * (b/g) mod (m/g).

6. **Escribir la solución general**: x = x0 + (m/g)*k para k = 0, 1, ..., g - 1 da todas las g soluciones incongruentes módulo m.

**Ejemplo del algoritmo euclidiano extendido (encontrando 17^{-1} mod 43):**
```
43 = 2*17 + 9
17 = 1*9  + 8
 9 = 1*8  + 1
 8 = 8*1  + 0

Back-substitute:
1 = 9 - 1*8
  = 9 - 1*(17 - 1*9) = 2*9 - 17
  = 2*(43 - 2*17) - 17 = 2*43 - 5*17

So 17*(-5) = 1 (mod 43), i.e., 17^{-1} = -5 = 38 (mod 43).
```

**Esperado:** El conjunto completo de soluciones para la congruencia, o una demostración de que no existe solución.

**En caso de fallo:** Si la retro-sustitución del euclidiano extendido produce un resultado incorrecto, verificar cada paso de división. El error más común es un error de signo durante la retro-sustitución. Verificar: a * inverso mod m debe igualar 1.

### Paso 3: Resolver un Sistema mediante el Teorema Chino del Resto (si aplica)

Resolver x = a1 (mod m1), x = a2 (mod m2), ..., x = ak (mod mk).

1. **Verificar coprimalidad por pares**: Para cada par (mi, mj), verificar mcd(mi, mj) = 1.
   - Si todos los pares son coprimos, el TCR aplica directamente.
   - Si algunos pares no son coprimos, verificar compatibilidad: para cada par no coprimo, verificar ai = aj (mod mcd(mi, mj)). Si son compatibles, reducir usando mcm. Si son incompatibles, no existe solución.

2. **Calcular M = m1 * m2 * ... * mk** (el producto de todos los módulos).

3. **Para cada i, calcular Mi = M / mi** (el producto de todos los módulos excepto mi).

4. **Para cada i, encontrar yi = Mi^{-1} (mod mi)** usando el algoritmo euclidiano extendido del Paso 2.

5. **Calcular la solución**: x = sum(ai * Mi * yi para i = 1..k) mod M.

6. **Enunciar el resultado**: x = [valor] (mod M). Esta es la solución única módulo M.

**Referencia de totientes comunes:**

| n    | phi(n) | n    | phi(n) | n    | phi(n) |
|------|--------|------|--------|------|--------|
| 2    | 1      | 10   | 4      | 20   | 8      |
| 3    | 2      | 11   | 10     | 24   | 8      |
| 4    | 2      | 12   | 4      | 25   | 20     |
| 5    | 4      | 13   | 12     | 30   | 8      |
| 6    | 2      | 14   | 6      | 36   | 12     |
| 7    | 6      | 15   | 8      | 48   | 16     |
| 8    | 4      | 16   | 8      | 60   | 16     |
| 9    | 6      | 18   | 6      | 100  | 40     |

**Esperado:** Una solución única módulo M, o una demostración de incompatibilidad.

**En caso de fallo:** Si el cálculo del TCR produce un resultado que no pasa la verificación, revisar los cálculos de inverso modular en el paso 4. Un error común es calcular Mi^{-1} mod M en lugar de Mi^{-1} mod mi. Cada inverso se calcula módulo el módulo *individual*, no el producto.

### Paso 4: Aplicar el Teorema de Euler o el Pequeño Teorema de Fermat (si aplica)

Evaluar exponenciaciones modulares o simplificar expresiones usando el teorema de Euler.

1. **Teorema de Euler**: Si mcd(a, m) = 1, entonces a^{phi(m)} = 1 (mod m).
   - Calcular phi(m) usando la fórmula del totiente: si m = p1^e1 * p2^e2 * ... * pk^ek, entonces phi(m) = m * producto((1 - 1/pi) para cada primo pi que divide a m).

2. **Pequeño teorema de Fermat** (caso especial): Si p es primo y mcd(a, p) = 1, entonces a^{p-1} = 1 (mod p).

3. **Reducir el exponente**: Para calcular a^k (mod m):
   - Calcular r = k mod phi(m).
   - Entonces a^k = a^r (mod m).

4. **Calcular a^r (mod m)** usando cuadratura repetida (exponenciación binaria):
   - Escribir r en binario: r = b_n * 2^n + ... + b_1 * 2 + b_0.
   - Comenzar con resultado = 1.
   - Para cada bit del más significativo al menos: resultado = resultado^2 mod m; si el bit es 1, resultado = resultado * a mod m.

5. **Manejar el caso mcd(a, m) > 1**: El teorema de Euler no aplica directamente. Factorizar m y usar TCR para combinar resultados de módulos potencia de primos, usando elevación del exponente o cálculo directo.

**Esperado:** El valor de a^k (mod m), calculado mediante reducción de exponente y cuadratura repetida.

**En caso de fallo:** Si mcd(a, m) > 1 y el resultado parece incorrecto, no aplicar el teorema de Euler. En su lugar, calcular directamente o factorizar m en partes coprimas donde al menos algunas partes sean coprimas con a, resolver módulo cada parte y recombinar con TCR.

### Paso 5: Verificar la Solución por Sustitución

Comprobar cada solución sustituyéndola en las ecuaciones originales.

1. **Para congruencias simples**: Calcular a * x mod m y verificar que iguala b.

2. **Para sistemas TCR**: Para cada congruencia x = ai (mod mi), verificar x mod mi = ai.

3. **Para exponenciaciones modulares**: Si es posible, verificar con un segundo método computacional (ej., cálculo directo para valores pequeños, o implementación independiente de cuadratura repetida).

4. **Documentar la verificación** explícitamente:
```
Solution: x = 23
Check 1: 23 mod 3 = 2 = a1. Correct.
Check 2: 23 mod 5 = 3 = a2. Correct.
Check 3: 23 mod 7 = 2 = a3. Correct.
All congruences satisfied.
```

**Esperado:** Todas las ecuaciones originales verificadas con cálculo explícito mostrado.

**En caso de fallo:** Si la verificación falla, rastrear el procedimiento hacia atrás para encontrar el error computacional. Fuentes comunes: errores aritméticos en el algoritmo euclidiano extendido, signo incorrecto en la retro-sustitución, u olvidar reducir módulo M en el paso final del TCR.

## Validación

- [ ] El tipo de problema está correctamente identificado (congruencia simple, sistema, exponenciación, inverso)
- [ ] Todos los coeficientes están reducidos módulo sus respectivos módulos
- [ ] Para ax = b (mod m): mcd(a, m) | b se verifica antes de resolver
- [ ] La retro-sustitución del euclidiano extendido se verifica: a * inverso mod m = 1
- [ ] Para TCR: la coprimalidad por pares se verifica antes de aplicar el teorema
- [ ] Para TCR con módulos no coprimos: se verifica la compatibilidad
- [ ] El teorema de Euler se aplica solo cuando mcd(a, m) = 1
- [ ] El totiente phi(m) se calcula a partir de la factorización prima, no se adivina
- [ ] La cuadratura repetida usa reducción modular en cada paso (sin desbordamiento)
- [ ] Cada solución se verifica por sustitución en las ecuaciones originales

## Errores Comunes

- **Aplicar TCR sin verificación de coprimalidad**: La fórmula estándar del TCR requiere módulos coprimos por pares. Aplicarla a módulos no coprimos da una respuesta incorrecta, no un error. Siempre verificar mcd(mi, mj) = 1 primero.

- **Calcular el inverso incorrecto**: Mi^{-1} debe calcularse módulo mi (el módulo *individual*), no módulo M (el producto). Este es el error de implementación del TCR más común.

- **Aplicar el teorema de Euler cuando mcd(a, m) > 1**: a^{phi(m)} = 1 (mod m) requiere mcd(a, m) = 1. Si esto falla, el teorema no aplica y el resultado es incorrecto.

- **Errores de signo en la retro-sustitución del euclidiano extendido**: Mantener un seguimiento cuidadoso de los signos en cada paso. El inverso final puede ser negativo; siempre reducir módulo m para obtener un representante positivo.

- **Desbordamiento en exponenciación modular**: Incluso con cuadratura repetida, los productos intermedios pueden desbordar. Siempre reducir módulo m después de cada multiplicación, no solo al final.

- **Olvidar múltiples soluciones**: ax = b (mod m) con g = mcd(a, m) > 1 y g | b tiene exactamente g soluciones incongruentes módulo m, no solo una.

## Habilidades Relacionadas

- `analyze-prime-numbers` -- la factorización prima es necesaria para calcular phi(m) y verificar coprimalidad
- `explore-diophantine-equations` -- las ecuaciones diofánticas lineales ax + by = c son equivalentes a congruencias lineales ax = c (mod b)
- `prove-geometric-theorem` -- la aritmética modular aparece en demostraciones de constructibilidad (ej., qué n-gonos regulares son constructibles)
