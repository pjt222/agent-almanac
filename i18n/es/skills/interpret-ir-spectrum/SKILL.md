---
name: interpret-ir-spectrum
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretar espectros de infrarrojo (IR) para identificar grupos funcionales
  en compuestos orgánicos e inorgánicos mediante el análisis sistemático de la
  región de grupos funcionales (4000–1500 cm⁻¹) y la región de huella digital
  (1500–400 cm⁻¹). Usar cuando se identifiquen grupos funcionales en un
  compuesto desconocido, se verifique la presencia de funcionalidades específicas
  en un producto de reacción, se diferencien isómeros estructurales mediante
  patrones de absorción, o se evalúe la pureza de una muestra detectando
  impurezas.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, ir, infrared, functional-groups, organic-chemistry
---

# Interpretar Espectro IR

Identificar grupos funcionales y obtener información estructural de compuestos orgánicos e inorgánicos mediante el análisis sistemático de espectros de infrarrojo, centrándose en frecuencias de estiramiento y flexión características y sus correlaciones con entornos químicos específicos.

## Cuándo Usar

- Identificar grupos funcionales presentes en un compuesto desconocido
- Confirmar la presencia de una funcionalidad específica en un producto de reacción
- Distinguir entre isómeros estructurales mediante sus patrones de absorción
- Evaluar la compleción de una reacción siguiendo la desaparición o aparición de bandas
- Detectar contaminantes o disolventes residuales como control de calidad

## Entradas

- **Requerido**: Espectro IR (número de onda en cm⁻¹ frente a transmitancia o absorbancia)
- **Requerido**: Información sobre el estado físico de la muestra (KBr, nujol, film, ATR)
- **Opcional**: Fórmula molecular o masa molecular del compuesto
- **Opcional**: Historial sintético (reactivos usados, tipo de reacción)
- **Opcional**: Espectro de referencia de compuestos relacionados para comparación

## Procedimiento

### Paso 1: Evaluar la Calidad del Espectro

Antes de interpretar, verificar que el espectro sea adecuado para el análisis:

1. **Verificar la línea base**: Debe estar cerca del 100% T (o absorbancia ~ 0) en regiones sin absorción. Una línea base descendente indica dispersión o interferencia del instrumento.
2. **Comprobar la concentración de la muestra**: La transmitancia mínima debe estar entre 5–15% T para las bandas más intensas. Bandas saturadas (0% T) pierden información de posición.
3. **Identificar el método de preparación**: ATR (reflectancia total atenuada) da espectros con intensidades relativas diferentes a los de transmisión; las bandas de baja frecuencia pueden ser más intensas.
4. **Señalar artefactos conocidos**: El vapor de agua produce bandas anchas y múltiples alrededor de 3700–3500 cm⁻¹ y 1600 cm⁻¹. El CO2 absorbe a 2350 cm⁻¹. El aceite nujol absorbe a 2930, 1460 y 1380 cm⁻¹.

**Esperado:** Evaluación de la calidad espectral con notas sobre posibles interferencias o limitaciones.

**En caso de fallo:** Si el espectro tiene calidad insuficiente, re-preparar la muestra (concentración diferente, soporte diferente) o compensar el fondo de disolvente digitalmente.

### Paso 2: Examinar la Región de OH y NH (4000–2500 cm⁻¹)

Esta región proporciona la primera información crítica sobre grupos funcionales polares:

1. **Banda O–H ancha, 3600–3200 cm⁻¹**: Indica alcohol u ácido carboxílico. Los alcoholes libres muestran una banda aguda a ~3620 cm⁻¹; los alcoholes con enlace de hidrógeno muestran una banda ancha centrada en 3300–3400 cm⁻¹.
2. **Banda N–H, 3500–3300 cm⁻¹**: Las aminas primarias dan dos bandas (estiramiento asimétrico y simétrico); las aminas secundarias dan una banda; las amidas tienen bandas N–H más anchas, frecuentemente solapadas con O–H.
3. **Picos C–H, 3000 cm⁻¹**: Las absorciones por encima de 3000 cm⁻¹ indican C–H insaturado o aromático (sp2/sp); las absorciones por debajo de 3000 cm⁻¹ corresponden a C–H sp3.
4. **Banda C≡N o C≡C, 2260–2100 cm⁻¹**: Los nitrilos aparecen como una banda aguda intensa a 2200–2260 cm⁻¹; los alquinos terminales aparecen a 2120–2140 cm⁻¹; los alquinos internos pueden ser muy débiles.
5. **O–H de ácido carboxílico, 3300–2500 cm⁻¹ (muy ancha)**: Banda característica muy ancha que puede enmascarar absorciones C–H en ácidos carboxílicos.

**Esperado:** Lista de grupos X–H y grupos de triple enlace identificados, con sus frecuencias y anchos de banda.

**En caso de fallo:** Si las bandas son ambiguas, registrar el espectro en otro disolvente o estado físico (por ej., cambiar de ATR a KBr para reducir artefactos de superficie).

### Paso 3: Analizar la Región del Grupo Carbonilo (1850–1650 cm⁻¹)

El estiramiento C=O es la banda más diagnóstica del espectro IR:

1. **Ácido carboxílico**: 1710–1725 cm⁻¹ (dimero); puede ser más alta si está muy diluido.
2. **Aldehído**: 1720–1740 cm⁻¹, típicamente acompañado de dos bandas C–H aldehídico a ~2720 y 2820 cm⁻¹.
3. **Cetona**: 1705–1725 cm⁻¹ para cetonas simples; las α,β-insaturadas se desplazan a 1675–1700 cm⁻¹.
4. **Éster**: 1735–1750 cm⁻¹ (acompañado de banda C–O–C fuerte a 1150–1300 cm⁻¹).
5. **Amida**: 1630–1690 cm⁻¹ (amida primaria más baja); también muestra banda N–H bend a 1550–1640 cm⁻¹.
6. **Anhídrido**: Dos bandas carbonilo a 1800–1850 y 1750–1790 cm⁻¹.
7. **Clorhídrico de ácido**: 1800 cm⁻¹ (muy alta).

**Esperado:** Identificación del tipo de grupo carbonilo con la frecuencia de estiramiento medida.

**En caso de fallo:** Si hay múltiples bandas carbonilo, considerar la presencia de dos grupos funcionales, quelación o artefactos de Fermi. Comparar con el espectro de un estándar del grupo funcional propuesto.

### Paso 4: Examinar la Región de Huella Digital (1500–400 cm⁻¹)

Esta región es compleja pero proporciona información de identificación única:

1. **C–O estiramiento, 1000–1300 cm⁻¹**: Banda intensa en éteres (1000–1150 cm⁻¹), ésteres (1150–1300 cm⁻¹), alcoholes (1050–1200 cm⁻¹).
2. **Patrones aromáticos, 600–900 cm⁻¹**: La sustitución del anillo se identifica por el número y posición de bandas de flexión C–H fuera del plano. Monosustituido: 750 y 700 cm⁻¹; orto: 750 cm⁻¹; meta: 880, 780, 690 cm⁻¹; para: 830 cm⁻¹.
3. **S=O estiramiento, 1030–1350 cm⁻¹**: Sulfóxidos a 1030–1070 cm⁻¹; sulfonas a 1120–1160 y 1300–1350 cm⁻¹.
4. **C–X estiramiento, < 800 cm⁻¹**: C–Cl a 600–800 cm⁻¹; C–Br a 500–600 cm⁻¹; C–I a 500 cm⁻¹.
5. **Comparar con la biblioteca espectral**: Usar la región de huella digital para confirmar la identidad mediante búsqueda en base de datos (SDBS, NIST, SpectraBase).

**Esperado:** Información adicional sobre el tipo y patrón de sustitución, heteroátomos distintos al oxígeno y nitrógeno, y patrones de confirmación de identidad.

**En caso de fallo:** Si la región de huella digital es demasiado compleja para interpretarla sin referencia, buscar en bibliotecas espectrales los compuestos candidatos y comparar visualmente.

### Paso 5: Sintetizar la Interpretación

Combinar la información de todas las regiones en una conclusión estructural coherente:

1. **Listar grupos funcionales confirmados**: Con las bandas de absorción que los respaldan y sus frecuencias.
2. **Excluir grupos funcionales**: Señalar qué grupos funcionales quedan descartados por la ausencia de bandas características (por ej., ausencia de banda > 1700 cm⁻¹ excluye grupos carbonilo).
3. **Proponer estructura parcial**: Combinar la información de grupos funcionales con la fórmula molecular (si está disponible) para proponer estructuras candidatas.
4. **Identificar necesidad de datos adicionales**: Si la IR es ambigua, especificar qué experimentos adicionales resolverían la ambigüedad (RMN 1H, espectrometría de masas).

**Esperado:** Informe de interpretación completo con grupos funcionales identificados, excluidos y propuesta de estructura parcial.

**En caso de fallo:** Si los datos IR son insuficientes para la asignación estructural definitiva, emitir un informe preliminar con la lista de posibilidades y recomendar el análisis complementario.

## Validación

- [ ] Todas las bandas intensas (< 30% T) están asignadas o explicadas
- [ ] La presencia/ausencia de bandas carbonilo está evaluada
- [ ] La región O–H/N–H está analizada para grupos polares
- [ ] Se verificó la consistencia con la fórmula molecular (si está disponible)
- [ ] Se examinó la región aromática/olefínica (3100–2990 cm⁻¹ y 900–650 cm⁻¹) para evaluar insaturación
- [ ] Los artefactos de disolvente o soporte están identificados y excluidos de la interpretación

## Errores Comunes

- **Asignar todas las bandas anchas en 3000–3600 cm⁻¹ a O–H**: El vapor de agua, NH, y algunos artefactos del instrumento también absorben en esta región. Verificar con el fondo y con un espectro en disolvente distinto.
- **Ignorar la frecuencia exacta del carbonilo**: La diferencia de 20–30 cm⁻¹ entre un éster y una cetona es diagnóstica; no tratar el grupo carbonilo como categoría única.
- **Sobrestimar la región de huella digital**: Esta región es diagnóstica solo cuando se compara con un espectro de referencia; la interpretación aislada lleva a conclusiones incorrectas.
- **Confundir el patrón de sustitución aromática**: Los patrones C–H fuera del plano son sensibles a la concentración y al estado físico. Confirmar con datos de RMN 1H.
- **Pasar por alto bandas débiles pero diagnósticas**: Las bandas débiles del alquino (C≡C) o del aldehído (dos bandas C–H a 2720 y 2820 cm⁻¹) pueden perderse si se buscan solo las más intensas.

## Habilidades Relacionadas

- `interpret-nmr-spectrum` — complementar la identificación de grupos funcionales IR con asignación estructural detallada
- `interpret-mass-spectrum` — confirmar la masa molecular y detectar fragmentos específicos de los grupos funcionales identificados por IR
- `plan-spectroscopic-analysis` — seleccionar la combinación más eficiente de técnicas espectroscópicas para el problema analítico
