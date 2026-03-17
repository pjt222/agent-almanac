---
name: solve-trigonometric-problem
description: >
  Resolver ecuaciones trigonométricas y problemas de resolución de triángulos
  mediante identidades fundamentales, transformaciones de ángulo, ley de
  senos, ley de cosenos, y análisis de dominio/período. Cubre ecuaciones
  lineales y cuadráticas en funciones trigonométricas, sistemas trigonométricos,
  y resolución completa de triángulos oblicuos con verificación de caso ambiguo.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: intermediate
  language: natural
  tags: geometry, trigonometry, triangles, identities, law-of-sines
---

# Resolver Problema Trigonométrico

Resolver ecuaciones trigonométricas y problemas de resolución de triángulos clasificando el tipo de problema, seleccionando las identidades y leyes aplicables, transformando a una forma resoluble, encontrando todas las soluciones dentro del dominio especificado, y verificando cada solución contra las restricciones del problema original.

## Cuándo Usar

- Resolver ecuaciones trigonométricas para todos los valores de la variable dentro de un dominio dado
- Resolver triángulos (encontrar lados y ángulos desconocidos) dados elementos parciales
- Simplificar expresiones trigonométricas usando identidades
- Analizar funciones periódicas para amplitud, período, desplazamiento de fase y desplazamiento vertical
- Resolver problemas aplicados que involucran ángulos de elevación/depresión, navegación o movimiento circular

## Entradas

- **Requerido**: Ecuación o problema trigonométrico a resolver
- **Requerido**: Dominio para las soluciones (p.ej., [0, 2pi), todos los reales, un intervalo específico)
- **Opcional**: Unidades de ángulo (radianes o grados) -- por defecto: radianes
- **Opcional**: Precisión requerida para soluciones numéricas

## Procedimiento

### Paso 1: Clasificar y Analizar el Problema

Determinar el tipo de problema y seleccionar la estrategia de solución:

1. **Clasificar el tipo**:
   - **Ecuación trigonométrica lineal**: Una sola función trigonométrica igualada a una constante (p.ej., sin(x) = 1/2)
   - **Ecuación trigonométrica cuadrática**: Cuadrática en una función trigonométrica (p.ej., 2cos^2(x) - cos(x) - 1 = 0)
   - **Ecuación de múltiples funciones**: Involucra diferentes funciones trigonométricas (p.ej., sin(x) + cos(x) = 1)
   - **Ecuación de ángulo múltiple**: Involucra argumentos como 2x, 3x (p.ej., sin(2x) = cos(x))
   - **Resolución de triángulo**: Dados algunos lados/ángulos, encontrar los restantes

2. **Identificar identidades necesarias**:

| Identidad | Fórmula |
|-----------|---------|
| Pitagórica | sin^2(x) + cos^2(x) = 1 |
| Ángulo doble | sin(2x) = 2 sin(x) cos(x); cos(2x) = cos^2(x) - sin^2(x) |
| Suma/diferencia | sin(A +/- B) = sin(A)cos(B) +/- cos(A)sin(B) |
| Producto a suma | 2 sin(A)cos(B) = sin(A+B) + sin(A-B) |
| Medio ángulo | sin^2(x/2) = (1 - cos(x))/2 |

3. **Analizar el dominio**: Notar el dominio de solución y las funciones involucradas. Recordar las restricciones de dominio: tan(x) no definida en x = pi/2 + n*pi; sec(x) y csc(x) tienen restricciones similares.

**Esperado:** Tipo de problema clasificado, identidades seleccionadas, y dominio analizado con restricciones documentadas.

**En caso de fallo:** Si la clasificación es ambigua (p.ej., una ecuación que involucra tanto seno como tangente), intentar convertir todo a seno y coseno usando las definiciones fundamentales antes de reclasificar.

### Paso 2: Transformar y Resolver

Aplicar las identidades y técnicas algebraicas para encontrar las soluciones:

1. **Ecuaciones lineales**: Aislar la función trigonométrica y resolver:
   - sin(x) = a tiene soluciones x = arcsin(a) + 2n*pi y x = pi - arcsin(a) + 2n*pi
   - cos(x) = a tiene soluciones x = +/- arccos(a) + 2n*pi
   - tan(x) = a tiene soluciones x = arctan(a) + n*pi

2. **Ecuaciones cuadráticas**: Sustituir u = sin(x) (o cos, tan), resolver la cuadrática en u, luego resolver para x:
   - Resolver au^2 + bu + c = 0
   - Descartar soluciones donde |u| > 1 (para sin y cos)
   - Resolver x para cada u válido

3. **Ecuaciones de múltiples funciones**: Convertir a una sola función usando identidades, luego resolver como en (1) o (2).

4. **Ecuaciones de ángulo múltiple**: Resolver para el argumento completo primero (p.ej., si sin(2x) = 1/2, resolver 2x = pi/6 + 2n*pi o 2x = 5pi/6 + 2n*pi), luego dividir por el coeficiente.

5. **Resolución de triángulos**:
   - **LAL** (Lado-Ángulo-Lado): Ley de cosenos para el tercer lado, luego ley de senos para los ángulos
   - **LLL** (Lado-Lado-Lado): Ley de cosenos para cada ángulo
   - **ALA** (Ángulo-Lado-Ángulo): Tercer ángulo por suma = 180, luego ley de senos
   - **LLA** (Lado-Lado-Ángulo): Caso ambiguo -- verificar 0, 1 o 2 soluciones
   - Ley de senos: a/sin(A) = b/sin(B) = c/sin(C)
   - Ley de cosenos: c^2 = a^2 + b^2 - 2ab*cos(C)

**Esperado:** Todas las soluciones encontradas en términos de los parámetros del dominio (p.ej., x = pi/6 + 2n*pi).

**En caso de fallo:** Si la ecuación transformada no tiene solución analítica cerrada, usar métodos numéricos (Newton-Raphson) o métodos gráficos para aproximar las soluciones. Documentar que las soluciones son numéricas.

### Paso 3: Filtrar y Verificar Soluciones

Seleccionar las soluciones válidas dentro del dominio y verificar cada una:

1. **Filtrar por dominio**: De las soluciones generales (con parámetro n), seleccionar los valores de n que producen soluciones dentro del dominio especificado.
2. **Verificar restricciones**: Eliminar soluciones que caen en puntos donde alguna función del problema original no está definida (p.ej., tangente en pi/2).
3. **Verificar por sustitución**: Sustituir cada solución en la ecuación original y confirmar que ambos lados son iguales.
4. **Verificar caso ambiguo** (triángulos LLA): Si se encontraron dos soluciones, verificar que ambos triángulos son geométricamente válidos (todos los ángulos positivos, suma = 180).
5. **Presentar soluciones**: Listar todas las soluciones verificadas, en orden creciente, con unidades consistentes.

```markdown
## Soluciones
- **Dominio**: [especificado]
- **Solución general**: x = [expresión con parámetro n]
- **Soluciones en el dominio**: x = [lista de valores]
- **Verificación**: [resultado de la sustitución para cada solución]
```

**Esperado:** Todas y solo las soluciones válidas dentro del dominio, cada una verificada por sustitución en la ecuación original.

**En caso de fallo:** Si la verificación falla para alguna solución, es probable que se introdujo una solución extraña durante las transformaciones (p.ej., al elevar al cuadrado ambos lados). Descartar las soluciones extrañas y documentar dónde se introdujeron.

## Validación

- [ ] Tipo de problema correctamente clasificado
- [ ] Identidades aplicadas correctamente con pasos documentados
- [ ] Soluciones generales incluyen todos los casos (p.ej., ambas familias de soluciones para sin(x) = a)
- [ ] Soluciones filtradas al dominio especificado
- [ ] Restricciones de dominio de las funciones trigonométricas verificadas
- [ ] Cada solución verificada por sustitución en la ecuación original
- [ ] Caso ambiguo analizado correctamente para problemas LLA
- [ ] Unidades (radianes/grados) consistentes en toda la solución

## Errores Comunes

- **Perder familias de soluciones**: sin(x) = 1/2 tiene DOS familias de soluciones: x = pi/6 + 2n*pi Y x = 5pi/6 + 2n*pi. Olvidar la segunda familia pierde la mitad de las soluciones.
- **Dividir por una función trigonométrica**: Dividir ambos lados por sin(x) pierde la solución sin(x) = 0. En su lugar, factorizar: sin(x) * [algo] = 0 da sin(x) = 0 O [algo] = 0.
- **No verificar el caso ambiguo LLA**: Cuando se dan dos lados y el ángulo opuesto al menor, pueden existir dos triángulos, uno o ninguno. Siempre verificar sin(B) <= 1 y considerar ambos ángulos B y 180 - B.
- **Mezclar radianes y grados**: Usar pi/6 (radianes) junto con 30 (grados) en el mismo cálculo produce resultados incorrectos. Estandarizar antes de comenzar.
- **Introducir soluciones extrañas al elevar al cuadrado**: Elevar al cuadrado sin(x) = cos(x) + 1 introduce soluciones de -(sin(x)) = cos(x) + 1. Siempre verificar contra la ecuación original.
- **Ignorar las restricciones de rango**: arcsin(x) solo está definida para |x| <= 1. Si después de resolver una cuadrática se obtiene sin(x) = 2, esa solución es inválida.

## Habilidades Relacionadas

- `construct-geometric-figure` -- construir los triángulos y ángulos resueltos en este procedimiento
- `prove-geometric-theorem` -- demostrar las identidades trigonométricas usadas aquí
- `derive-theoretical-result` -- derivar identidades trigonométricas desde principios fundamentales
