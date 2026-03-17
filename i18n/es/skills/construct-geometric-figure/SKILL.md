---
name: construct-geometric-figure
description: >
  Realizar una construcción con regla y compás traduciendo una especificación
  geométrica en una secuencia de operaciones primitivas (trazar línea entre
  dos puntos, trazar círculo con centro y radio), rastrear los puntos de
  intersección resultantes, y demostrar que la figura construida satisface
  las propiedades requeridas.
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
  complexity: basic
  language: natural
  tags: geometry, constructions, compass, straightedge, euclidean
---

# Construir Figura Geométrica

Ejecutar una construcción con regla y compás descomponiendo una especificación geométrica en operaciones primitivas (trazar segmento de línea, trazar arco/círculo), rastrear cada punto de intersección resultante, y verificar que la figura final satisface las propiedades requeridas.

## Cuándo Usar

- Biseccionar un ángulo o segmento de línea usando solo regla y compás
- Construir perpendiculares, paralelas, o ángulos específicos (60, 90, 45 grados)
- Inscribir o circunscribir polígonos regulares en círculos
- Encontrar centros geométricos (circuncentro, incentro, centroide, ortocentro)
- Enseñar o revisar la geometría euclidiana clásica a través de construcciones

## Entradas

- **Requerido**: Figura objetivo (p.ej., "bisectriz perpendicular de un segmento", "triángulo equilátero inscrito en un círculo", "tangente a un círculo desde un punto externo")
- **Requerido**: Elementos dados (puntos, segmentos, círculos ya existentes)
- **Opcional**: Propiedades específicas a satisfacer (longitudes, ángulos, relaciones)
- **Opcional**: Restricciones sobre los elementos dados (p.ej., "el segmento AB tiene longitud 5")

## Procedimiento

### Paso 1: Analizar la Especificación e Identificar Primitivas Necesarias

Descomponer el objetivo de construcción en sub-construcciones estándar:

1. **Catalogar elementos dados**: Listar todos los puntos, líneas y círculos proporcionados con sus relaciones.
2. **Identificar la figura objetivo**: Determinar exactamente qué debe construirse y qué propiedades debe tener.
3. **Descomponer en sub-construcciones**: Mapear la construcción a una secuencia de operaciones primitivas estándar:
   - Bisectriz perpendicular de un segmento
   - Bisectriz de un ángulo
   - Perpendicular a una línea por un punto (sobre o fuera de la línea)
   - Paralela a una línea por un punto
   - Transferir una longitud
   - Copiar un ángulo
4. **Verificar constructibilidad**: Confirmar que la figura puede construirse con regla y compás. Los problemas clásicamente imposibles incluyen: trisección general de un ángulo, duplicación del cubo, cuadratura del círculo.
5. **Planificar el orden**: Ordenar las sub-construcciones de modo que cada paso use puntos ya construidos.

**Esperado:** Un plan de construcción con sub-construcciones identificadas, orden establecido, y constructibilidad confirmada.

**En caso de fallo:** Si la construcción es imposible con regla y compás, declarar la imposibilidad y explicar por qué (generalmente involucra números no constructibles). Sugerir una aproximación o un método alternativo si es apropiado.

### Paso 2: Ejecutar la Secuencia de Construcción

Realizar cada operación primitiva en orden, registrando todos los nuevos puntos:

1. **Para cada operación primitiva**:
   - **Trazar línea**: Especificar los dos puntos y la línea resultante. Notar si se extiende infinitamente o es un segmento.
   - **Trazar círculo/arco**: Especificar el centro y el punto del radio (o la longitud del radio transferida). Notar el arco o círculo completo.
   - **Marcar intersección**: Donde dos objetos se cruzan, etiquetar los puntos de intersección. Una línea y un círculo producen 0 o 2 puntos; dos círculos producen 0, 1 o 2 puntos; dos líneas producen 0 o 1 punto.
2. **Etiquetar sistemáticamente**: Asignar letras a cada nuevo punto en orden de creación (o usar el esquema de nomenclatura especificado).
3. **Registrar cada paso**: Documentar cada operación con formato:
   - Paso N: [Operación] usando [elementos]. Resultado: [nuevo punto/línea/arco].

```markdown
## Secuencia de Construcción
1. Trazar segmento AB (dado)
2. Trazar círculo C1 con centro A, radio AB
3. Trazar círculo C2 con centro B, radio BA
4. Marcar intersecciones de C1 y C2: puntos P y Q
5. Trazar línea PQ (bisectriz perpendicular de AB)
```

**Esperado:** Una secuencia completa de operaciones donde cada paso es una única primitiva de regla o compás, y cada nuevo punto está etiquetado.

**En caso de fallo:** Si una intersección esperada no existe (p.ej., dos círculos que no se cruzan), verificar los radios y centros. Ajustar la construcción si las medidas iniciales estaban incorrectas.

### Paso 3: Verificar las Propiedades de la Construcción

Demostrar que la figura construida satisface las propiedades requeridas:

1. **Verificación geométrica**: Para cada propiedad requerida, proporcionar una justificación:
   - Congruencia: Citar que los radios del compás son iguales por construcción
   - Perpendicularidad: Citar que puntos equidistantes de los extremos de un segmento determinan la bisectriz perpendicular
   - Bisección: Citar el teorema relevante (p.ej., lugar geométrico de puntos equidistantes)
2. **Verificación numérica** (si se dan medidas): Calcular longitudes y ángulos de la figura construida y confirmar que coinciden con los valores objetivo.
3. **Verificación por coordenadas** (opcional): Colocar la construcción en un plano coordenado, calcular las coordenadas de cada punto construido, y verificar las propiedades algebraicamente.

**Esperado:** Cada propiedad requerida está verificada con una justificación geométrica, numérica o algebraica.

**En caso de fallo:** Si una propiedad no se cumple, rastrear la construcción hacia atrás para encontrar el paso donde se introdujo el error. Los errores más comunes: usar el punto de intersección incorrecto (p.ej., elegir la intersección superior en vez de la inferior), o transferir un radio equivocado.

## Validación

- [ ] Todos los elementos dados están correctamente identificados y etiquetados
- [ ] La constructibilidad con regla y compás está confirmada
- [ ] Cada paso es una operación primitiva única (línea por dos puntos, o círculo con centro y radio)
- [ ] Todos los puntos de intersección están etiquetados y contabilizados
- [ ] Las propiedades requeridas están verificadas con justificación
- [ ] Ningún paso usa mediciones o marcas en la regla (solo borde recto)

## Errores Comunes

- **Usar la regla como instrumento de medición**: En la geometría clásica, la regla solo puede trazar líneas rectas a través de dos puntos existentes. No se puede marcar una longitud en ella. Si se necesita transferir una longitud, usar el compás.
- **Olvidar las dos intersecciones**: Cuando una línea corta un círculo o dos círculos se cortan, generalmente hay dos puntos de intersección. Elegir el incorrecto produce una figura diferente. Especificar siempre cuál se elige (p.ej., "el punto de intersección por encima de la línea AB").
- **Asumir que una construcción aproximada es exacta**: Un ángulo que "parece" ser un tercio no es una trisección válida. La verificación debe ser rigurosa, no visual.
- **No verificar los casos degenerados**: Si dos puntos dados coinciden, o si un punto está sobre una línea cuando se asumió que estaba fuera, la construcción puede fallar o producir un resultado diferente.

## Habilidades Relacionadas

- `prove-geometric-theorem` -- demostrar formalmente por qué la construcción funciona
- `solve-trigonometric-problem` -- calcular ángulos y longitudes para verificar construcciones
