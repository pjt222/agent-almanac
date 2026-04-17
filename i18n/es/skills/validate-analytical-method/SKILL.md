---
name: validate-analytical-method
description: >
  Validar un método analítico cromatográfico según las directrices ICH Q2(R2):
  definir el alcance de validación por categoría de método, establecer especificidad
  mediante degradación forzada, determinar linealidad y rango, evaluar exactitud
  y precisión, y establecer límites de detección y robustez para presentación
  regulatoria.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: advanced
  language: natural
  tags: chromatography, validation, ich-q2, accuracy, precision, linearity, regulatory
  locale: es
  source_locale: en
  source_commit: b91a8191
  translator: claude
  translation_date: "2026-03-17"
---

# Validate an Analytical Method

Validación formal de un método analítico cromatográfico siguiendo las directrices ICH Q2(R2), cubriendo la definición del alcance de validación por categoría de método, establecimiento de especificidad/selectividad, determinación de linealidad y rango, evaluación de exactitud y precisión, y estudios de LOD/LOQ y robustez para cumplimiento regulatorio.

## Cuándo Usar

- Se ha desarrollado un nuevo método cromatográfico y debe validarse antes del uso rutinario
- Se está verificando un método compendial para su idoneidad en un laboratorio específico
- Un método validado existente ha sufrido cambios significativos que requieren re-validación parcial o completa
- Preparar un paquete de validación para presentación regulatoria (NDA, ANDA, MAA, IND)
- Transferir un método a un nuevo laboratorio o plataforma instrumental

## Entradas

### Requerido

- **Método desarrollado**: Método cromatográfico completamente optimizado y documentado (columna, fase móvil, gradiente, detector, etc.)
- **Categoría del método**: Ensayo de ingrediente activo, prueba cuantitativa de impurezas, prueba límite de impurezas, o prueba de identificación
- **Estándares de referencia del analito**: Estándares de referencia primarios con certificados de análisis y pureza asignada
- **Matriz de muestra**: Muestras representativas incluyendo matriz placebo/blanco para estudios de especificidad

### Opcional

- **Guía regulatoria**: Requisitos regulatorios específicos más allá de ICH Q2 (ej., USP <1225>, guías FDA, directrices EMA)
- **Muestras de degradación forzada**: Muestras pre-estresadas (ácido, base, oxidación, calor, luz) si aún no están preparadas
- **Protocolo de validación**: Protocolo pre-aprobado especificando criterios de aceptación (requerido en entornos GMP)
- **Paquete de transferencia**: Si se valida como parte de una transferencia de método, el informe de validación del laboratorio de origen

## Procedimiento

### Paso 1: Definir el Alcance de Validación según ICH Q2(R2)

Identificar la categoría del método y determinar qué parámetros de validación son requeridos.

| Parameter | Cat I: Assay | Cat II: Impurity (Quant) | Cat III: Impurity (Limit) | Cat IV: Identification |
|---|---|---|---|---|
| Specificity | Yes | Yes | Yes | Yes |
| Linearity | Yes | Yes | No | No |
| Range | Yes | Yes | No | No |
| Accuracy | Yes | Yes | No | No |
| Precision (repeatability) | Yes | Yes | No | No |
| Precision (intermediate) | Yes | Yes | No | No |
| LOD | No | May be needed | Yes | No |
| LOQ | No | Yes | No | No |
| Robustness | Yes | Yes | Yes | No |

1. Clasificar el método en una de las cuatro categorías ICH según su propósito previsto.
2. De la tabla, identificar todos los parámetros de validación requeridos.
3. Definir criterios de aceptación para cada parámetro antes de comenzar el trabajo experimental. Criterios típicos:
   - Linealidad: R^2 >= 0.999 (ensayo), >= 0.99 (impurezas)
   - Exactitud: recuperación 98.0-102.0% (ensayo), 80-120% a nivel de LOQ
   - Repetibilidad: RSD <= 2.0% (ensayo), <= 10% a nivel de LOQ
   - Precisión intermedia: RSD <= 3.0% (ensayo)
4. Redactar un protocolo de validación documentando todos los parámetros, diseños experimentales y criterios de aceptación.
5. Obtener aprobación del protocolo (en entornos GMP) antes de comenzar el trabajo experimental.

**Esperado:** Protocolo de validación aprobado especificando categoría del método, parámetros requeridos, diseños experimentales y criterios de aceptación predefinidos.

**En caso de fallo:** Si la categoría del método es ambigua (ej., un método combinado de ensayo e impurezas), validar para la categoría más estricta que aplique. Consultar la guía regulatoria específica para el tipo de presentación.

### Paso 2: Establecer Especificidad y Selectividad

1. Preparar las siguientes soluciones:
   - Blanco (solo solvente/diluyente)
   - Placebo (matriz sin analito, ej., excipientes para un producto farmacéutico)
   - Estándar de referencia a concentración de trabajo
   - Placebo dopado (matriz + estándar de referencia)
   - Muestras de degradación forzada (si aún no están disponibles)
2. Realizar degradación forzada para generar posibles productos de degradación:

| Stress Condition | Typical Treatment | Target Degradation |
|---|---|---|
| Acid hydrolysis | 0.1-1 N HCl, 60-80 C, 1-24 h | 5-20% |
| Base hydrolysis | 0.1-1 N NaOH, 60-80 C, 1-24 h | 5-20% |
| Oxidation | 0.3-3% H2O2, RT-60 C, 1-24 h | 5-20% |
| Thermal | 60-80 C, solid state, 1-7 days | 5-20% |
| Photolytic | ICH Q1B (1.2M lux-hours, 200 Wh/m^2 UV) | 5-20% |

3. Inyectar todas las soluciones y evaluar:
   - Sin picos interferentes del blanco o placebo al tiempo de retención del analito
   - Productos de degradación resueltos del pico principal del analito (Rs >= 1.5)
   - Pureza de pico confirmada por índice de pureza espectral DAD o MS
4. Calcular balance de masa: ensayo + impurezas + productos de degradación deben representar 95-105% del contenido inicial.
5. Documentar resultados de especificidad con cromatogramas de todas las condiciones.

**Esperado:** Método demostrado como específico: sin interferencias de blanco/placebo, productos de degradación resueltos del analito, pureza de pico confirmada, balance de masa dentro de 95-105%.

**En caso de fallo:** Si los productos de degradación co-eluyen con el analito, el método no es indicador de estabilidad. Regresar al desarrollo del método para mejorar la selectividad (ajustar pH, gradiente, química de columna) antes de proceder con la validación.

### Paso 3: Determinar Linealidad y Rango

1. Preparar al menos 5 niveles de concentración abarcando el rango previsto:
   - Métodos de ensayo: típicamente 80-120% de la concentración objetivo
   - Métodos de impurezas: desde LOQ hasta 120-200% del límite de especificación
   - Disolución: desde 10-120% de la declaración en etiqueta (o según necesite el perfil de disolución)
2. Preparar cada nivel de concentración independientemente (no por dilución seriada) como mejor práctica.
3. Inyectar cada nivel por triplicado (mínimo duplicado).
4. Realizar regresión lineal de respuesta (área o altura) vs. concentración:
   - Reportar pendiente, intercepto y coeficiente de correlación (R^2)
   - R^2 >= 0.999 para ensayo; R^2 >= 0.99 para cuantificación de impurezas
5. Evaluar gráficos de residuales:
   - Los residuales deben estar distribuidos aleatoriamente alrededor de cero sin patrón sistemático
   - Un patrón de residuales curvado indica no linealidad -- considerar un ajuste cuadrático o rango más estrecho
6. Calcular el intercepto y como porcentaje de la respuesta al 100% de concentración:
   - El intercepto debe ser <= 2% de la respuesta al 100% para métodos de ensayo
7. Establecer el rango validado como el intervalo entre las concentraciones más baja y más alta para las cuales se han demostrado linealidad, exactitud y precisión.

**Esperado:** Regresión lineal con R^2 >= 0.999 (ensayo) o >= 0.99 (impurezas), distribución aleatoria de residuales, intercepto <= 2% de la respuesta objetivo, y rango validado claramente definido.

**En caso de fallo:** Si R^2 está por debajo del criterio, verificar errores de preparación, no linealidad del detector (concentración demasiado alta), o inestabilidad del analito. Repetir con preparaciones frescas. Si la no linealidad es inherente, usar una calibración polinómica o estrechar el rango.

### Paso 4: Evaluar Exactitud

1. Preparar muestras de exactitud a 3 niveles de concentración (típicamente 80%, 100%, 120% del objetivo para ensayo; LOQ, medio y alto para métodos de impurezas).
2. En cada nivel, preparar 3 réplicas independientes (mínimo 9 determinaciones totales).
3. Para sustancia farmacéutica: comparar la concentración encontrada con la cantidad conocida (gravimétrica).
4. Para producto farmacéutico: usar el enfoque de placebo dopado -- añadir cantidades conocidas de analito a la matriz placebo y medir la recuperación.
5. Calcular el porcentaje de recuperación en cada nivel:
   - Recuperación (%) = (cantidad encontrada / cantidad añadida) x 100
6. Criterios de aceptación:

| Method Type | Recovery Range | RSD at Each Level |
|---|---|---|
| Assay (drug substance) | 98.0-102.0% | <= 2.0% |
| Assay (drug product) | 98.0-102.0% | <= 2.0% |
| Impurity (quantitation) | 80-120% at LOQ, 90-110% at higher levels | <= 10% at LOQ, <= 5% at higher |
| Cleaning validation | 70-130% (or tighter per company SOP) | <= 15% |

7. Reportar recuperaciones individuales, recuperación media y RSD en cada nivel.

**Esperado:** Recuperación media dentro de los criterios de aceptación en todos los niveles de concentración, con RSD dentro de los límites.

**En caso de fallo:** Si la recuperación es consistentemente alta o baja en todos los niveles, sospechar de un error sistemático en el estándar de referencia, preparación de muestra, o método (ej., efecto de matriz causando supresión iónica en LC-MS). Si la recuperación varía erráticamente, investigar la técnica de preparación de muestra y la estabilidad del analito.

### Paso 5: Determinar Precisión

Evaluar tres niveles de precisión:

1. **Repetibilidad (intra-día)**:
   - Un analista, un instrumento, un día
   - Inyectar 6 determinaciones al 100% o 3 niveles x 3 réplicas (mismos datos que exactitud)
   - Calcular RSD de resultados: <= 2.0% para ensayo, <= 10% al LOQ para impurezas
2. **Precisión intermedia (inter-día / inter-analista)**:
   - Repetir el estudio de repetibilidad con un analista diferente, día diferente, y (si está disponible) instrumento diferente
   - Calcular RSD general combinando ambos conjuntos de datos
   - RSD general <= 3.0% para ensayo
   - Si la precisión intermedia es significativamente peor que la repetibilidad, investigar la fuente de variación (técnica del analista, calibración del instrumento, condiciones ambientales)
3. **Reproducibilidad** (para transferencia de método o validación multi-sitio):
   - Realizada en el laboratorio receptor siguiendo el mismo protocolo
   - Comparar resultados entre laboratorios
   - Evaluada mediante prueba F (comparación de varianzas) y prueba t (comparación de medias) o prueba de equivalencia

| Precision Level | Design | Acceptance (Assay) | Acceptance (Impurity Quant) |
|---|---|---|---|
| Repeatability | n >= 6 at 100%, 1 analyst, 1 day | RSD <= 2.0% | RSD <= 10% at LOQ, <= 5% above |
| Intermediate | 2 analysts, 2 days (or 2 instruments) | RSD <= 3.0% | RSD <= 15% at LOQ, <= 10% above |
| Reproducibility | Multi-laboratory | Per protocol / transfer criteria | Per protocol / transfer criteria |

**Esperado:** RSDs de repetibilidad y precisión intermedia dentro de los criterios de aceptación. Sin diferencia estadísticamente significativa entre analistas/días/instrumentos más allá del RSD permitido.

**En caso de fallo:** Si la precisión intermedia es mucho peor que la repetibilidad, identificar la variable que impulsa la varianza adicional (técnica de preparación del analista, temperatura ambiente, deriva de calibración del instrumento) y controlarla antes de repetir.

### Paso 6: Establecer LOD, LOQ y Robustez

**Límite de Detección (LOD)** y **Límite de Cuantificación (LOQ)**:

1. Calcular LOD y LOQ usando el enfoque de señal-ruido o el enfoque de desviación estándar:
   - LOD = 3.3 x (sigma / S) donde sigma = desviación estándar de la respuesta a baja concentración, S = pendiente de calibración
   - LOQ = 10 x (sigma / S)
   - Alternativa: enfoque S/N -- LOD corresponde a S/N >= 3, LOQ a S/N >= 10
2. Confirmar experimentalmente: preparar soluciones a las concentraciones calculadas de LOD y LOQ e inyectar.
   - Al LOD: el pico debe ser detectable pero no necesariamente cuantificable con precisión aceptable
   - Al LOQ: inyectar 6 réplicas y confirmar RSD <= 10% y exactitud dentro de 80-120%
3. Reportar LOD y LOQ con el método utilizado para su determinación.

**Robustez**:

4. Identificar parámetros críticos del método (típicamente 5-7 factores):
   - Composición de fase móvil (+/- 2% orgánico)
   - pH de fase móvil (+/- 0.2 unidades)
   - Temperatura de columna (+/- 5 C)
   - Velocidad de flujo (+/- 10%)
   - Longitud de onda de detección (+/- 2 nm)
   - Lote/partida de columna (si está disponible)
5. Variar cada parámetro deliberadamente dentro del rango especificado manteniendo los demás constantes (o usar un diseño factorial fraccionado para eficiencia).
6. Evaluar el impacto en los parámetros de aptitud del sistema (tiempo de retención, resolución, asimetría, área).
7. Los parámetros que causen fallo de aptitud del sistema dentro del rango probado deben controlarse estrictamente y documentarse como parámetros críticos del método.
8. Resumir los resultados de robustez en una tabla mostrando cada parámetro variado, el rango probado, y el impacto en las respuestas clave.

**Esperado:** LOD y LOQ confirmados experimentalmente. Estudio de robustez completado con parámetros críticos del método identificados y límites de control establecidos.

**En caso de fallo:** Si la precisión del LOQ excede 10% RSD, la sensibilidad del método es insuficiente a esa concentración. Opciones: aumentar el volumen de inyección, concentrar la muestra, mejorar la limpieza de muestra, o usar un detector más sensible. Si un parámetro muestra que el método no es robusto (falla SST con variación deliberada pequeña), ajustar el control de ese parámetro en el método y señalarlo durante la transferencia del método.

## Validación

- [ ] Categoría del método identificada y todos los parámetros requeridos determinados según ICH Q2(R2)
- [ ] Protocolo de validación escrito con criterios de aceptación predefinidos
- [ ] Especificidad demostrada: sin interferencias, productos de degradación resueltos, pureza de pico confirmada
- [ ] Balance de masa dentro de 95-105% para el estudio de degradación forzada
- [ ] Linealidad establecida con R^2 >= 0.999 (ensayo) o >= 0.99 (impurezas), residuales aleatorios
- [ ] Exactitud demostrada a 3 niveles con recuperación dentro de los criterios de aceptación
- [ ] RSD de repetibilidad dentro de los límites (ej., <= 2.0% para ensayo)
- [ ] RSD de precisión intermedia dentro de los límites (ej., <= 3.0% para ensayo)
- [ ] LOD y LOQ confirmados experimentalmente (precisión del LOQ <= 10% RSD)
- [ ] Estudio de robustez completado con parámetros críticos del método identificados
- [ ] Todos los datos crudos, cálculos y cromatogramas compilados en el informe de validación

## Errores Comunes

- **Comenzar experimentos antes de la aprobación del protocolo**: En entornos GMP, los datos de validación generados antes de la aprobación del protocolo pueden no ser aceptables para los reguladores. Obtener siempre la aprobación primero.
- **Usar diluciones seriadas para linealidad**: Las diluciones seriadas propagan errores de pipeteo. Preparar cada nivel de concentración independientemente desde una solución madre común para la evaluación de linealidad más precisa.
- **Degradación forzada insuficiente**: Generar muy poca degradación (< 5%) puede omitir productos de degradación importantes. Generar demasiada (> 30%) produce productos de degradación secundarios que complican la interpretación. Apuntar a 5-20% de degradación por condición.
- **Confundir repetibilidad con precisión intermedia**: La repetibilidad es mismo día, mismo analista, mismo instrumento. La precisión intermedia debe variar al menos uno de estos factores. Ambas son requeridas para métodos de Categoría I y II.
- **Descuidar el paso de verificación del LOQ**: Calcular el LOQ desde la curva de calibración no es suficiente. El LOQ calculado debe confirmarse experimentalmente demostrando precisión y exactitud aceptables a esa concentración.
- **Omitir robustez hasta tarde en la validación**: Descubrir que el método no es robusto después de los estudios de exactitud y precisión desperdicia tiempo y materiales. Realizar un cribado rápido de robustez temprano en la validación para detectar parámetros frágiles.
- **Informes de validación incompletos**: Los revisores regulatorios esperan ver todos los datos crudos, cromatogramas (no solo números tabulados), análisis estadístico, y conclusiones explícitas de aprobado/no aprobado para cada parámetro. Los datos faltantes conducen a cartas de deficiencia.

## Habilidades Relacionadas

- `develop-gc-method` -- Desarrollo de método de GC que precede a la validación
- `develop-hplc-method` -- Desarrollo de método de HPLC que precede a la validación
- `interpret-chromatogram` -- Lectura de cromatogramas generados durante los experimentos de validación
- `troubleshoot-separation` -- Resolución de problemas descubiertos durante los estudios de validación
- `conduct-gxp-audit` -- Auditoría de la validación completada para cumplimiento GxP
- `write-standard-operating-procedure` -- Documentación del método validado como un SOP
