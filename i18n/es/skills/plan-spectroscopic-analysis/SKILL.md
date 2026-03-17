---
name: plan-spectroscopic-analysis
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Diseñar una estrategia de análisis espectroscópico seleccionando las técnicas
  más apropiadas (IR, Raman, UV-Vis, RMN, EM) para un problema analítico dado,
  estableciendo el orden de adquisición de datos, estimando el tiempo y los
  recursos necesarios, y definiendo los criterios de éxito. Usar cuando se
  aborde la caracterización de un compuesto desconocido, cuando se necesite
  confirmar la estructura de un producto de síntesis con recursos limitados,
  cuando se establezca un procedimiento de control de calidad para una serie de
  compuestos, o cuando se optimice la elucidación estructural minimizando el
  número de experimentos necesarios.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, analysis-planning, structure-elucidation, analytical-strategy
---

# Planificar el Análisis Espectroscópico

Diseñar una estrategia de caracterización espectroscópica eficiente seleccionando, secuenciando y combinando las técnicas analíticas más apropiadas para responder preguntas estructurales o analíticas específicas dentro de las limitaciones de tiempo, muestra y equipamiento disponibles.

## Cuándo Usar

- Caracterizar un compuesto desconocido con la menor cantidad posible de experimentos
- Confirmar la estructura de un producto de síntesis con acceso limitado a instrumentación
- Establecer un protocolo de control de calidad para una serie de compuestos similares
- Resolver ambigüedades estructurales que quedan sin resolver con datos espectroscópicos parciales
- Diseñar el plan de análisis antes de una campaña de síntesis para anticipar los datos necesarios

## Entradas

- **Requerido**: Descripción del problema analítico (¿qué se necesita saber del compuesto?)
- **Requerido**: Información disponible (fórmula molecular, historial sintético, clase de compuesto)
- **Requerido**: Instrumentación disponible y restricciones de tiempo/muestra
- **Opcional**: Pureza estimada y cantidad de muestra disponible (en mg)
- **Opcional**: Nivel de confianza estructural requerido (identificación preliminar vs. publicación)

## Procedimiento

### Paso 1: Definir la Pregunta Analítica

Formular con precisión qué información estructural o analítica se necesita:

1. **Determinar el nivel de caracterización requerido**:
   - Identificación de compuesto (¿es el compuesto esperado?): comparar con referencia
   - Confirmación de grupos funcionales (¿el grupo funcional clave está presente?): IR o RMN selectivo
   - Elucidación estructural completa (compuesto desconocido): conjunto completo de técnicas
   - Cuantificación de pureza: RMN cuantitativo o HPLC con detección DAD/RMN
2. **Identificar las ambigüedades clave**: Listar las preguntas estructurales específicas que los datos deben responder (¿es Z o E? ¿qué regioisómero? ¿está completa la reacción?).
3. **Definir los criterios de éxito**: Especificar qué condiciones deben cumplirse para considerar la caracterización completa (por ej., todos los carbonos asignados, error de masa < 5 ppm, constantes de acoplamiento asignadas).

**Esperado:** Declaración clara de la pregunta analítica con criterios de éxito medibles.

**En caso de fallo:** Si la pregunta analítica es demasiado vaga, solicitar más información sobre el contexto del compuesto y el nivel de caracterización requerido antes de continuar con el plan.

### Paso 2: Evaluar las Técnicas Disponibles

Mapear las capacidades de cada técnica espectroscópica frente a la pregunta analítica:

1. **Espectroscopía IR**: Ideal para identificar grupos funcionales (especialmente C=O, O–H, N–H, C≡N), verificar la compleción de reacciones, y análisis de muestras sólidas o líquidas. Requiere poca cantidad de muestra (< 1 mg para ATR).
2. **Espectroscopía Raman**: Complemento del IR; superior para muestras acuosas, materiales carbonosos, y sistemas con alta simetría. No requiere preparación de muestra. Menos informativo que IR para grupos polares.
3. **Espectroscopía UV-Vis**: Cuantificación de analitos con cromóforos; identificación del grado de conjugación; monitorización de cinéticas. Muy sensible (nM), pero da poca información estructural detallada.
4. **RMN**: Técnica más informativa estructuralmente. RMN 1H da información de conectividad; 13C/DEPT identifica carbonos; 2D (COSY, HSQC, HMBC) permite elucidación completa. Requiere cantidad mayor de muestra (1–10 mg en disolvente deuterado).
5. **Espectrometría de masas**: Masa molecular y fórmula molecular (EMAR). Información de fragmentación para grupos funcionales. Alta sensibilidad (μg). Esencial para confirmar la fórmula molecular.

```markdown
## Matriz de Capacidades Técnicas
| Técnica | Información | Cantidad mínima | Tiempo | Limitaciones |
|---------|-------------|----------------|--------|-------------|
| ATR-IR | Grupos funcionales | < 1 mg | 5 min | Poca información de conectividad |
| Raman | Igual que IR + alta simetría | < 1 mg | 10 min | Fluorescencia puede interferir |
| UV-Vis | Cromóforos, concentración | μg (en solución) | 5 min | Poca info estructural |
| RMN 1H | Conectividad H-H | 1–5 mg | 15 min | Requiere disolvente deuterado |
| RMN 13C/DEPT | Tipo de carbono | 5–20 mg | 30–60 min | Insensible, necesita más muestra |
| EMAR | Fórmula molecular exacta | < 0.1 mg | 10 min | No da información conectividad |
```

**Esperado:** Tabla de capacidades técnicas completada con las opciones disponibles marcadas y sus limitaciones anotadas.

**En caso de fallo:** Si la instrumentación disponible es insuficiente para responder la pregunta analítica, identificar qué servicios externos se pueden contratar o qué información adicional puede obtenerse con las técnicas disponibles.

### Paso 3: Diseñar la Secuencia de Análisis

Ordenar los experimentos de manera eficiente, de los más rápidos e informativos a los más costosos:

1. **Primera etapa — datos de bajo coste de muestra**: IR (ATR), UV-Vis, y análisis de punto de fusión (si sólido). Estos dan orientación rápida sobre grupos funcionales y pureza.
2. **Segunda etapa — determinación de masa molecular**: EM (ESI o EI) para obtener la masa molecular y el patrón isotópico. Con EMAR, se determina la fórmula molecular antes de invertir en RMN.
3. **Tercera etapa — asignación estructural por RMN**: Comenzar con RMN 1H para obtener multiplicidades e integrales. Seguir con 13C/DEPT. Solo realizar experimentos 2D si quedan ambigüedades.
4. **Cuarta etapa — confirmación o resolución de ambigüedades**: Raman (para sistemas de alta simetría), NOESY (para estereoquímica), o técnicas adicionales según la ambigüedad específica.
5. **Criterio de parada**: Detener el análisis cuando los criterios de éxito definidos en el Paso 1 estén cumplidos. No adquirir más datos de los necesarios.

**Esperado:** Plan secuencial con el orden de experimentos, el tiempo estimado para cada uno y los criterios para pasar al siguiente.

**En caso de fallo:** Si el tiempo o la cantidad de muestra son extremadamente limitados, priorizar el experimento que responde directamente la pregunta más crítica, aunque eso signifique saltarse el orden optimal.

### Paso 4: Estimar Recursos y Tiempo

Cuantificar los recursos necesarios para el plan propuesto:

1. **Cantidad de muestra por experimento**: Calcular el total de muestra necesario considerando que ciertos experimentos son destructivos (EM) y otros recuperables (RMN, IR).
2. **Tiempo total de instrumentación**: Estimar el tiempo de medida y de preparación de muestra para cada técnica.
3. **Consideraciones de pureza**: Si la pureza es < 90%, priorizar la purificación antes del análisis estructural completo o incluir un análisis de pureza (HPLC analítica) en el plan.
4. **Orden de prioridad si los recursos son insuficientes**: Definir qué experimentos son esenciales (pueden responder la pregunta solos) y cuáles son confirmatorios.

**Esperado:** Lista de recursos con cantidades de muestra, tiempo estimado y costes de servicio si aplica.

**En caso de fallo:** Si la cantidad de muestra es insuficiente para el plan completo, modificar el plan para usar técnicas de microescala (RMN en tubo Shigemi, EM en nanoinfusión) o priorizar solo los experimentos clave.

### Paso 5: Definir el Protocolo de Interpretación

Establecer el método de integración de datos de múltiples técnicas:

1. **Orden de integración**: Procesar los datos de cada técnica de manera independiente antes de combinarlos, para evitar sesgos en la interpretación.
2. **Tabla de consistencia**: Crear una tabla que lista las propiedades estructurales propuestas y qué técnica proporciona la evidencia para cada una.
3. **Gestión de inconsistencias**: Si dos técnicas dan resultados contradictorios, priorizar la de mayor resolución (RMN frente a IR para conectividad) y re-examinar el experimento de menor resolución.
4. **Documentación de incertidumbres**: Identificar explícitamente los aspectos estructurales que quedan sin confirmar y proponer experimentos adicionales o condiciones de publicación (por ej., "estructura propuesta, no confirmada por cristalografía").

**Esperado:** Protocolo de interpretación documentado que guiará el análisis integrado de todos los datos espectrales.

**En caso de fallo:** Si el protocolo de integración produce conclusiones contradictorias, revisar la calidad de los datos de cada técnica individualmente antes de buscar errores de interpretación.

## Validación

- [ ] La pregunta analítica está formulada con criterios de éxito medibles
- [ ] Las técnicas seleccionadas son apropiadas para la pregunta planteada
- [ ] El plan respeta las limitaciones de cantidad de muestra disponible
- [ ] El orden de los experimentos maximiza la información obtenida con el mínimo coste
- [ ] Los criterios de parada están definidos para evitar experimentos redundantes
- [ ] El protocolo de integración de datos está documentado antes del inicio del análisis

## Errores Comunes

- **Adquirir todos los datos posibles sin plan**: Acumular datos de todas las técnicas disponibles sin un plan previo resulta en tiempo y muestra desperdiciados, y en dificultades de interpretación por exceso de información.
- **Ignorar la pureza antes de la elucidación estructural**: Intentar elucidar la estructura de una mezcla es mucho más difícil que purificar primero el compuesto. Incluir un paso de verificación de pureza al inicio del plan.
- **No aprovechar la complementariedad IR-Raman**: Tratar IR y Raman como técnicas redundantes en lugar de complementarias pierde la información adicional de la regla de exclusión mutua.
- **Subestimar el tiempo de preparación de muestra para RMN**: La disolución en disolvente deuterado, filtración, y preparación del tubo puede tomar más tiempo que la medida misma.
- **Confundir confirmación con elucidación**: Si el compuesto esperado es conocido, bastan IR y un espectro comparativo; un programa completo de elucidación con experimentos 2D es un despilfarro de recursos en ese contexto.

## Habilidades Relacionadas

- `interpret-nmr-spectrum` — ejecutar la interpretación de RMN planificada en esta skill
- `interpret-ir-spectrum` — ejecutar la identificación de grupos funcionales por IR
- `interpret-mass-spectrum` — determinar la fórmula molecular como primer paso del plan
- `validate-analytical-method` — validar el método analítico derivado del plan espectroscópico
