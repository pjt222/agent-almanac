---
name: review-research
description: >
  Realizar una revisión por pares de la metodología de investigación, el diseño
  experimental y la calidad del manuscrito. Cubre la evaluación metodológica,
  la idoneidad estadística, la evaluación de reproducibilidad, la identificación
  de sesgos y la retroalimentación constructiva. Usar al revisar un manuscrito,
  preimpresión o informe de investigación interno, evaluar una propuesta de
  investigación o protocolo de estudio, valorar la calidad de la evidencia
  detrás de una afirmación, o revisar un capítulo de tesis o sección de disertación.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: natural
  tags: peer-review, methodology, research, reproducibility, bias, manuscript
---

# Revisar Investigación

Realizar una revisión por pares estructurada del trabajo de investigación, evaluando la metodología, las elecciones estadísticas, la reproducibilidad y el rigor científico general.

## Cuándo Usar

- Revisar un manuscrito, preimpresión o informe de investigación interno
- Evaluar una propuesta de investigación o protocolo de estudio
- Valorar la calidad de la evidencia detrás de una afirmación o recomendación
- Proporcionar retroalimentación sobre el diseño de investigación de un colega antes de la recolección de datos
- Revisar un capítulo de tesis o sección de disertación

## Entradas

- **Obligatorio**: Documento de investigación (manuscrito, informe, propuesta o protocolo)
- **Obligatorio**: Contexto de campo/disciplina (afecta los estándares metodológicos)
- **Opcional**: Directrices de la revista o el lugar (si se revisa para publicación)
- **Opcional**: Materiales suplementarios (datos, código, apéndices)
- **Opcional**: Comentarios previos de revisores (si se revisa una revisión)

## Procedimiento

### Paso 1: Primera Lectura — Alcance y Estructura

Leer el documento completo una vez para comprender:
1. **Pregunta de investigación**: ¿Está claramente formulada y es específica?
2. **Afirmación de contribución**: ¿Qué es novedoso o nuevo?
3. **Estructura general**: ¿Sigue el formato esperado (IMRaD u otro específico del lugar)?
4. **Adecuación del alcance**: ¿Es el trabajo apropiado para la audiencia/lugar objetivo?

```markdown
## Evaluación de Primera Lectura
- **Pregunta de investigación**: [Clara / Vaga / Ausente]
- **Afirmación de novedad**: [Formulada y respaldada / Exagerada / Poco clara]
- **Estructura**: [Completa / Secciones faltantes: ___]
- **Adecuación del alcance**: [Apropiada / Marginal / No apropiada]
- **Recomendación tras primera lectura**: [Continuar revisión / Preocupaciones mayores a señalar]
```

**Esperado:** Comprensión clara de las afirmaciones y contribución del artículo.
**En caso de fallo:** Si la pregunta de investigación sigue sin estar clara tras una lectura completa, anótelo como preocupación mayor y continúe.

### Paso 2: Evaluar la Metodología

Evaluar el diseño de la investigación según los estándares del campo:

#### Investigación Cuantitativa
- [ ] Diseño del estudio apropiado para la pregunta de investigación (experimental, cuasiexperimental, observacional, encuesta)
- [ ] Tamaño muestral justificado (análisis de potencia o justificación práctica)
- [ ] Método de muestreo descrito y apropiado (aleatorio, estratificado, por conveniencia)
- [ ] Variables claramente definidas (independientes, dependientes, de control, de confusión)
- [ ] Instrumentos de medición validados y fiabilidad reportada
- [ ] Procedimiento de recolección de datos reproducible a partir de la descripción
- [ ] Consideraciones éticas abordadas (aprobación IRB/comité ético, consentimiento)

#### Investigación Cualitativa
- [ ] Metodología explícita (teoría fundamentada, fenomenología, estudio de caso, etnografía)
- [ ] Criterios de selección de participantes y saturación discutidos
- [ ] Métodos de recolección de datos descritos (entrevistas, observaciones, documentos)
- [ ] Posicionamiento del investigador reconocido
- [ ] Estrategias de rigor reportadas (triangulación, verificación con participantes, pista de auditoría)
- [ ] Consideraciones éticas abordadas

#### Métodos Mixtos
- [ ] Justificación del diseño mixto explicada
- [ ] Estrategia de integración descrita (convergente, explicativo secuencial, exploratorio secuencial)
- [ ] Tanto el componente cuantitativo como el cualitativo cumplen sus respectivos estándares

**Esperado:** Lista de verificación metodológica completada con observaciones específicas para cada elemento.
**En caso de fallo:** Si falta información metodológica crítica, señálelo como preocupación mayor en lugar de asumir.

### Paso 3: Valorar las Elecciones Estadísticas y Analíticas

- [ ] Métodos estadísticos apropiados para el tipo de datos y la pregunta de investigación
- [ ] Supuestos de las pruebas estadísticas verificados y reportados (normalidad, homocedasticidad, independencia)
- [ ] Tamaños del efecto reportados junto con los valores p
- [ ] Intervalos de confianza proporcionados donde sea apropiado
- [ ] Correcciones por comparaciones múltiples aplicadas cuando sea necesario (Bonferroni, FDR, etc.)
- [ ] Manejo de datos faltantes descrito y apropiado
- [ ] Análisis de sensibilidad realizados para supuestos clave
- [ ] Interpretación de resultados coherente con el análisis (sin exagerar los hallazgos)

Señales de alerta estadísticas comunes:
- Indicadores de p-hacking (muchas comparaciones, reporte selectivo, "marginalmente significativo")
- Pruebas inapropiadas (t-test en datos no normales sin justificación, pruebas paramétricas en datos ordinales)
- Confundir significancia estadística con significancia práctica
- Sin reporte de tamaño del efecto
- Hipótesis post-hoc presentadas como a priori

**Esperado:** Elecciones estadísticas evaluadas con preocupaciones específicas documentadas.
**En caso de fallo:** Si el revisor carece de experiencia en un método específico, reconózcalo y recomiende un revisor especialista.

### Paso 4: Evaluar la Reproducibilidad

- [ ] Disponibilidad de datos declarada (datos abiertos, enlace al repositorio, disponible bajo solicitud)
- [ ] Disponibilidad del código de análisis declarada
- [ ] Versiones de software y entornos documentados
- [ ] Semillas aleatorias o mecanismos de reproducibilidad descritos
- [ ] Parámetros e hiperparámetros clave reportados
- [ ] Entorno computacional descrito (hardware, SO, dependencias)

Niveles de reproducibilidad:
| Nivel | Descripción | Evidencia |
|-------|-------------|----------|
| Oro | Totalmente reproducible | Datos abiertos + código abierto + entorno en contenedor |
| Plata | Sustancialmente reproducible | Datos disponibles, análisis descrito en detalle |
| Bronce | Potencialmente reproducible | Métodos descritos pero sin compartir datos/código |
| Opaco | No reproducible | Detalle metodológico insuficiente o datos propietarios |

**Esperado:** Nivel de reproducibilidad asignado con justificación.
**En caso de fallo:** Si los datos no pueden compartirse (privacidad, datos propietarios), los datos sintéticos o el pseudocódigo detallado son alternativas aceptables — anote si se proporcionan.

### Paso 5: Identificar Sesgos Potenciales

- [ ] Sesgo de selección: ¿Eran los participantes representativos de la población objetivo?
- [ ] Sesgo de medición: ¿Podría el proceso de medición haber distorsionado sistemáticamente los resultados?
- [ ] Sesgo de reporte: ¿Se reportan todos los resultados, incluidos los no significativos?
- [ ] Sesgo de confirmación: ¿Buscaron los autores solo evidencia que respaldara su hipótesis?
- [ ] Sesgo de supervivencia: ¿Se contabilizaron las abandonos, los datos excluidos o los experimentos fallidos?
- [ ] Sesgo de financiación: ¿Se divulga la fuente de financiamiento y podría influir en los hallazgos?
- [ ] Sesgo de publicación: ¿Es esta una imagen completa o podrían faltar resultados negativos?

**Esperado:** Sesgos potenciales identificados con ejemplos específicos del manuscrito.
**En caso de fallo:** Si los sesgos no pueden evaluarse a partir de la información disponible, recomiende que los autores lo aborden explícitamente.

### Paso 6: Redactar la Revisión

Estructurar la revisión de forma constructiva:

```markdown
## Resumen
[2-3 oraciones resumiendo la contribución del artículo y su evaluación general]

## Preocupaciones Mayores
[Cuestiones que deben abordarse antes de que el trabajo pueda considerarse sólido]

1. **[Título de la preocupación]**: [Descripción específica con referencia a sección/página/figura]
   - *Sugerencia*: [Cómo podrían los autores abordar esto]

2. ...

## Preocupaciones Menores
[Cuestiones que mejoran la calidad pero no son fundamentales]

1. **[Título de la preocupación]**: [Descripción específica]
   - *Sugerencia*: [Cambio recomendado]

## Preguntas para los Autores
[Aclaraciones necesarias para completar la evaluación]

1. ...

## Observaciones Positivas
[Puntos fuertes específicos que vale la pena reconocer]

1. ...

## Recomendación
[Aceptar / Revisión menor / Revisión mayor / Rechazar]
[Breve justificación de la recomendación]
```

**Esperado:** La revisión es específica, constructiva y hace referencia a ubicaciones exactas en el manuscrito.
**En caso de fallo:** Si la revisión se está alargando demasiado, priorice las preocupaciones mayores y anote los problemas menores en una lista resumida.

## Validación

- [ ] Cada preocupación mayor hace referencia a una sección, figura o afirmación específica
- [ ] La retroalimentación es constructiva — los problemas están acompañados de sugerencias
- [ ] Los aspectos positivos reconocidos junto con las preocupaciones
- [ ] La evaluación estadística corresponde a los métodos de análisis utilizados
- [ ] La reproducibilidad está explícitamente evaluada
- [ ] La recomendación es coherente con la gravedad de las preocupaciones planteadas
- [ ] El tono es profesional, respetuoso y colegial

## Errores Comunes

- **Crítica vaga**: "La metodología es débil" no es útil. Especifique qué es débil y por qué.
- **Exigir un estudio diferente**: Revise la investigación que se realizó, no la que usted habría realizado.
- **Ignorar el alcance**: Un artículo de conferencia tiene expectativas diferentes a un artículo de revista.
- **Ad hominem**: Revise el trabajo, no a los autores. Nunca haga referencia a la identidad del autor.
- **Perfeccionismo**: Ningún estudio es perfecto. Céntrese en las preocupaciones que cambiarían las conclusiones.

## Habilidades Relacionadas

- `review-data-analysis` — enfoque más profundo en la calidad de los datos y la validación de modelos
- `format-apa-report` — estándares de formato APA para informes de investigación
- `generate-statistical-tables` — tablas estadísticas listas para publicación
- `validate-statistical-output` — verificación de resultados estadísticos
