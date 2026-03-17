---
name: review-data-analysis
description: >
  Revisar un análisis de datos en cuanto a calidad, corrección y reproducibilidad.
  Cubre la evaluación de la calidad de los datos, la verificación de supuestos,
  la validación de modelos, la detección de fuga de datos y la verificación de
  reproducibilidad. Usar al revisar el análisis de un colega antes de su
  publicación, validar una canalización de aprendizaje automático antes del
  despliegue en producción, auditar un informe para la toma de decisiones
  regulatoria o empresarial, o realizar una revisión de segundo analista en
  un entorno regulado.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: data-quality, model-validation, leakage, reproducibility, statistics, review
---

# Revisar Análisis de Datos

Evaluar una canalización de análisis de datos en cuanto a corrección, robustez y reproducibilidad.

## Cuándo Usar

- Revisar el cuaderno o script de análisis de un colega antes de su publicación
- Validar una canalización de aprendizaje automático antes del despliegue en producción
- Auditar un informe analítico para la toma de decisiones regulatoria o empresarial
- Valorar si un análisis respalda sus conclusiones declaradas
- Realizar una revisión de segundo analista en un entorno regulado

## Entradas

- **Obligatorio**: Código de análisis (scripts, cuadernos o definiciones de canalización)
- **Obligatorio**: Resultados del análisis (resultados, tablas, figuras, métricas del modelo)
- **Opcional**: Datos brutos o diccionario de datos
- **Opcional**: Plan de análisis o protocolo (prerregistrado o ad-hoc)
- **Opcional**: Audiencia objetivo y contexto de decisión

## Procedimiento

### Paso 1: Evaluar la Calidad de los Datos

Revisar los datos de entrada antes de evaluar el análisis:

```markdown
## Evaluación de Calidad de Datos

### Completitud
- [ ] Datos faltantes cuantificados (% por columna y por fila)
- [ ] Mecanismo de datos faltantes considerado (MCAR, MAR, MNAR)
- [ ] Método de imputación apropiado (si se usa) o análisis de casos completos justificado

### Consistencia
- [ ] Los tipos de datos coinciden con las expectativas (las fechas son fechas, los números son números)
- [ ] Los rangos de valores son plausibles (sin edades negativas, fechas futuras en datos históricos)
- [ ] Las variables categóricas tienen los niveles esperados (sin errores ortográficos, codificación consistente)
- [ ] Las unidades son consistentes entre registros

### Unicidad
- [ ] Registros duplicados identificados y gestionados
- [ ] Las claves primarias son únicas donde se espera
- [ ] Las operaciones de unión producen los conteos de filas esperados (sin multiplicación o pérdida)

### Temporalidad
- [ ] La antigüedad de los datos es apropiada para la pregunta de análisis
- [ ] La cobertura temporal coincide con el período de estudio
- [ ] Sin sesgo de anticipación en datos de series temporales

### Procedencia
- [ ] Fuente de datos documentada
- [ ] Fecha/versión de extracción registrada
- [ ] Cualquier transformación entre la fuente y la entrada del análisis documentada
```

**Esperado:** Problemas de calidad de datos documentados con su impacto potencial en los resultados.
**En caso de fallo:** Si los datos no son accesibles para revisión, evalúe la calidad a partir del código (qué comprobaciones y transformaciones se aplican).

### Paso 2: Verificar Supuestos

Para cada método estadístico o modelo utilizado:

| Método | Supuestos Clave | Cómo Verificar |
|--------|----------------|---------------|
| Regresión lineal | Linealidad, independencia, normalidad de residuos, homocedasticidad | Gráficos de residuos, Q-Q plot, Durbin-Watson, Breusch-Pagan |
| Regresión logística | Independencia, sin multicolinealidad, logit lineal | VIF, Box-Tidwell, diagnósticos de residuos |
| t-test | Independencia, normalidad (o n grande), varianza igual | Shapiro-Wilk, prueba de Levene, inspección visual |
| ANOVA | Independencia, normalidad, homogeneidad de varianza | Shapiro-Wilk por grupo, prueba de Levene |
| Chi-cuadrado | Independencia, frecuencia esperada ≥ 5 | Tabla de frecuencias esperadas |
| Random forest | Datos de entrenamiento suficientes, relevancia de características | Error OOB, importancia de características, curvas de aprendizaje |
| Red neuronal | Datos suficientes, arquitectura apropiada, sin fuga de datos | Curvas de validación, comprobaciones de sobreajuste |

```markdown
## Resultados de Verificación de Supuestos
| Paso del Análisis | Método | Supuesto | ¿Verificado? | Resultado |
|-------------------|--------|----------|-------------|---------|
| Modelo principal | Regresión lineal | Normalidad de residuos | Sí | Q-Q plot muestra desviación leve — aceptable para n>100 |
| Modelo principal | Regresión lineal | Homocedasticidad | No | No verificado — se recomienda añadir prueba Breusch-Pagan |
```

**Esperado:** Todos los métodos estadísticos tienen sus supuestos verificados o reconocidos explícitamente.
**En caso de fallo:** Si se violan los supuestos, verifique si los autores lo abordaron (métodos robustos, transformaciones, análisis de sensibilidad).

### Paso 3: Detectar Fuga de Datos

La fuga de datos ocurre cuando información de fuera del conjunto de entrenamiento influye en el modelo, generando un rendimiento demasiado optimista:

#### Patrones de fuga comunes:
- [ ] **Fuga de objetivo**: Característica que codifica directamente la variable objetivo (p. ej., "resultado_tratamiento" usado para predecir "éxito_tratamiento")
- [ ] **Fuga temporal**: Información futura usada para predecir el pasado (características calculadas a partir de datos que no estarían disponibles en el momento de la predicción)
- [ ] **Contaminación entrenamiento-prueba**: Preprocesamiento (escalado, imputación, selección de características) ajustado sobre el conjunto completo antes de dividir
- [ ] **Fuga de grupo**: Observaciones relacionadas (mismo paciente, mismo dispositivo) divididas entre conjuntos de entrenamiento y prueba
- [ ] **Fuga de ingeniería de características**: Agregados calculados sobre todo el conjunto de datos en lugar de dentro del pliegue de entrenamiento

```markdown
## Evaluación de Fuga
| Verificación | Estado | Evidencia |
|-------------|--------|----------|
| Fuga de objetivo | Limpio | Sin características derivadas del objetivo |
| Fuga temporal | PREOCUPACIÓN | La característica X usa promedio móvil de 30 días hacia adelante |
| Contaminación entrenamiento-prueba | Limpio | StandardScaler ajustado solo en entrenamiento |
| Fuga de grupo | PREOCUPACIÓN | IDs de paciente no usados para división estratificada |
```

**Esperado:** Todos los patrones de fuga comunes verificados con estado limpio/preocupación.
**En caso de fallo:** Si se detecta fuga, estime su impacto volviendo a ejecutar sin la característica con fuga (si es posible) o señálelo para que el analista investigue.

### Paso 4: Validar el Rendimiento del Modelo

#### Para modelos predictivos:
- [ ] Métricas apropiadas para el problema (no solo exactitud — considerar precisión, recall, F1, AUC, RMSE, MAE)
- [ ] Estrategia de validación cruzada o de reserva descrita y apropiada
- [ ] Rendimiento en entrenamiento vs. conjunto de prueba/validación comparado (comprobación de sobreajuste)
- [ ] Comparación de referencia proporcionada (modelo naive, azar, enfoque previo)
- [ ] Intervalos de confianza o errores estándar en las métricas de rendimiento
- [ ] Rendimiento evaluado en subgrupos relevantes (equidad, casos extremos)

#### Para modelos inferenciales/explicativos:
- [ ] Estadísticas de ajuste del modelo reportadas (R², AIC, BIC, desvianza)
- [ ] Coeficientes interpretados correctamente (dirección, magnitud, significancia)
- [ ] Multicolinealidad evaluada (VIF < 5-10)
- [ ] Observaciones influyentes identificadas (distancia de Cook, leverage)
- [ ] Comparación de modelos si se probaron múltiples especificaciones

**Esperado:** Validación del modelo apropiada para el caso de uso (predicción vs. inferencia).
**En caso de fallo:** Si el rendimiento en el conjunto de prueba es sospechosamente similar al de entrenamiento, señale posible fuga.

### Paso 5: Evaluar la Reproducibilidad

```markdown
## Lista de Verificación de Reproducibilidad
| Elemento | Estado | Notas |
|---------|--------|-------|
| El código se ejecuta sin errores | [Sí/No] | Probado en [descripción del entorno] |
| Semillas aleatorias establecidas | [Sí/No] | Línea [N] en [archivo] |
| Dependencias documentadas | [Sí/No] | requirements.txt / renv.lock presente |
| Carga de datos reproducible | [Sí/No] | La ruta es [relativa/absoluta/URL] |
| Los resultados coinciden con los valores reportados | [Sí/No] | Verificado: Tabla 1 ✓, Figura 2 ✗ (discrepancia menor) |
| Entorno documentado | [Sí/No] | Python 3.11 / R 4.5.0 especificado |
```

**Esperado:** Reproducibilidad verificada volviendo a ejecutar el análisis (o evaluando desde el código si los datos no están disponibles).
**En caso de fallo:** Si los resultados no se reproducen exactamente, determine si las diferencias están dentro de la tolerancia de punto flotante o indican un problema.

### Paso 6: Redactar la Revisión

```markdown
## Revisión del Análisis de Datos

### Evaluación General
[1-2 oraciones: ¿El análisis es sólido? ¿Respalda las conclusiones?]

### Calidad de los Datos
[Resumen de los hallazgos de calidad de datos, impacto en los resultados]

### Preocupaciones Metodológicas
1. **[Título]**: [Descripción, ubicación en código/informe, sugerencia]
2. ...

### Fortalezas
1. [Lo que se hizo bien]
2. ...

### Reproducibilidad
[Evaluación del nivel: Oro/Plata/Bronce/Opaco con justificación]

### Recomendaciones
- [ ] [Elementos de acción específicos para el analista]
```

**Esperado:** La revisión proporciona retroalimentación accionable con referencias específicas a ubicaciones en el código.
**En caso de fallo:** Si hay limitaciones de tiempo, priorice la calidad de los datos y las verificaciones de fuga sobre los problemas de estilo.

## Validación

- [ ] Calidad de los datos evaluada en completitud, consistencia, unicidad, temporalidad, procedencia
- [ ] Supuestos estadísticos verificados para cada método utilizado
- [ ] Fuga de datos evaluada sistemáticamente
- [ ] Rendimiento del modelo validado con métricas apropiadas y referencias
- [ ] Reproducibilidad evaluada (el código se ejecuta, los resultados coinciden)
- [ ] La retroalimentación es específica, con referencia a líneas de código o secciones del informe
- [ ] El tono es constructivo y colaborativo

## Errores Comunes

- **Revisar solo el código**: El plan de análisis y las conclusiones importan tanto como la implementación.
- **Ignorar la calidad de los datos**: Los modelos sofisticados sobre datos deficientes producen respuestas incorrectas con alta confianza.
- **Asumir corrección a partir de la complejidad**: Un random forest con 95% de exactitud puede tener fuga de datos; una t-test simple puede ser el enfoque correcto.
- **No ejecutar el código**: En la medida de lo posible, ejecute el código para verificar la reproducibilidad. Leer el código no es suficiente.
- **Perder el bosque por los árboles**: No se pierda en problemas de estilo de código mientras pasa por alto un error analítico fundamental.

## Habilidades Relacionadas

- `review-research` — revisión más amplia de la metodología de investigación y el manuscrito
- `validate-statistical-output` — metodología de verificación por doble programación
- `generate-statistical-tables` — tablas estadísticas listas para publicación
- `review-software-architecture` — revisión de estructura y diseño del código
