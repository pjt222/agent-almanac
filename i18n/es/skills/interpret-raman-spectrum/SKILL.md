---
name: interpret-raman-spectrum
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretar espectros Raman para identificar modos vibracionales, explotar la
  regla de exclusión mutua con IR para determinar la simetría molecular, asignar
  las bandas D y G de materiales carbonosos, y combinar datos Raman e IR para
  una caracterización vibracional completa. Usar cuando se caracterice la
  estructura de materiales carbonosos (grafeno, nanotubos, diamante), se
  determinen tensiones en materiales mediante desplazamientos Raman, se analicen
  muestras en entornos donde el IR es poco práctico (muestras acuosas,
  materiales minerales), o se aplique espectroscopía Raman potenciada por
  superficie (SERS).
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, raman, vibrational, carbon-materials, SERS, symmetry
---

# Interpretar Espectro Raman

Asignar bandas en espectros Raman a modos vibracionales específicos usando reglas de selección, complementar los datos de IR para obtener una caracterización vibracional completa, e interpretar bandas características de materiales carbonosos y otros sistemas con alta simetría.

## Cuándo Usar

- Caracterizar la estructura de materiales carbonosos (grafeno, grafito, nanotubos de carbono, diamante)
- Analizar muestras en entornos donde el IR es poco práctico (muestras acuosas, a alta presión, in situ)
- Explotar la regla de exclusión mutua para determinar la simetría molecular
- Detectar tensiones mecánicas en materiales mediante desplazamientos de frecuencia Raman
- Aplicar espectroscopía Raman potenciada por superficie (SERS) para análisis de trazas

## Entradas

- **Requerido**: Espectro Raman (desplazamiento Raman en cm⁻¹ frente a intensidad)
- **Requerido**: Longitud de onda del láser excitador y potencia utilizada
- **Opcional**: Espectro IR del mismo compuesto para análisis complementario
- **Opcional**: Información sobre la simetría molecular (grupo puntual)
- **Opcional**: Espectros de referencia de materiales de la misma clase para comparación

## Procedimiento

### Paso 1: Verificar la Calidad del Espectro y Corregir la Fluorescencia

Antes de asignar bandas, asegurar la integridad del espectro:

1. **Verificar la ausencia de fluorescencia**: La fluorescencia eleva la línea base de manera amplia y puede enmascarar las bandas Raman. Si la fluorescencia es severa, intentar: cambiar la longitud de onda del láser (excitación en el NIR reduce fluorescencia), usar reducción computacional de fluorescencia, o fotobleaquear la muestra con exposición previa al láser.
2. **Comprobar la calibración**: La posición de las bandas Raman debe verificarse con un estándar (Si a 520 cm⁻¹, naftaleno, ciclohexano). Una desviación > 2 cm⁻¹ indica necesidad de recalibración.
3. **Evaluar la relación señal/ruido**: La relación S/R mínima debe ser > 10:1 para las bandas más intensas. Aumentar el tiempo de acumulación o la potencia del láser (con cuidado de no dañar la muestra fotosensible).
4. **Identificar bandas del soporte o sustrato**: El soporte de muestra (vidrio, cuarzo, Si) puede contribuir con señales propias. Registrar el espectro del soporte solo para identificar estas contribuciones.

**Esperado:** Espectro con línea base corregida, calibrado y con señal/ruido adecuada para la asignación.

**En caso de fallo:** Si la fluorescencia es irremediable con el láser disponible, cambiar a espectroscopía Raman dispersiva de NIR (785 nm o 1064 nm) o considerar el análisis por IR como alternativa.

### Paso 2: Aplicar las Reglas de Selección Raman

Determinar qué modos vibracionales son activos en Raman:

1. **Regla de selección Raman**: Un modo vibracional es activo en Raman si cambia la polarizabilidad de la molécula durante el movimiento nuclear. Formalmente, al menos un componente del tensor de polarizabilidad debe ser no nulo.
2. **Regla de exclusión mutua**: En moléculas con centro de inversión (grupo puntual que contiene la operación de inversión i), los modos activos en IR son inactivos en Raman, y viceversa. Esta regla es diagnóstica de simetría: si un modo aparece en ambos espectros, la molécula no tiene centro de inversión.
3. **Modos especialmente activos en Raman**:
   - Modos de estiramiento simétrico (mayor cambio de polarizabilidad)
   - Modos de baja frecuencia de grupos pesados (estiramiento C–S, C–halógeno)
   - Modos de respiración de anillos (aromáticos, ciclohexano)
4. **Modos generalmente débiles en Raman** (pero activos en IR):
   - Estiramiento asimétrico de O–H y N–H
   - Modos de deformación de H

**Esperado:** Lista de modos observados clasificados como activos/inactivos en Raman y en IR, con implicaciones para la simetría molecular.

**En caso de fallo:** Si no se puede determinar si los modos son activos en IR (por falta de datos IR), el análisis de simetría será incompleto. Registrar el espectro IR del mismo compuesto para la comparación completa.

### Paso 3: Asignar Bandas Características

Identificar las bandas Raman con sus asignaciones vibracionales:

1. **Bandas de materiales carbonosos (región 1000–2000 cm⁻¹)**:
   - Banda G (~1580 cm⁻¹): modo E2g del grafito; estiramiento C=C de carbono sp2; presente en todos los materiales carbonosos sp2
   - Banda D (~1350 cm⁻¹): modo A1g; activado por defectos o bordes; indica desorden estructural; intensidad relativa D/G mide el grado de desorden
   - Banda 2D (~2700 cm⁻¹, también llamada G'): sobretono de la banda D; muy sensible al número de capas en grafeno; forma y posición varían con el número de capas
2. **Compuestos orgánicos generales**:
   - 400–800 cm⁻¹: modos de esqueleto (torsiones, deformaciones C–C–C)
   - 800–1500 cm⁻¹: modos mezclados (deformaciones C–H, estiramientos C–C)
   - 1500–1700 cm⁻¹: estiramientos C=C y C=O (carbonilo puede ser débil en Raman si está flanqueado por grupos electrón-dadores)
   - 2800–3100 cm⁻¹: estiramientos C–H
3. **Minerales y materiales inorgánicos**: Identificar por comparación con bases de datos de referencia (RRUFF, SLOOC).

**Esperado:** Tabla de asignación con desplazamiento Raman, intensidad relativa, ancho de banda (FWHM) y modo vibracional asignado.

**En caso de fallo:** Para materiales complejos o sin referencia, usar software de análisis de espectros (Crystal Sleuth, ProcessMaker) y comparar con espectros de la base de datos RRUFF.

### Paso 4: Analizar la Información Cuantitativa

Extraer parámetros cuantitativos de las posiciones y anchuras de banda:

1. **Relación D/G para materiales carbonosos**: Cuantifica el grado de desorden. En carbono amorfo, D/G ~ 1; en grafito cristalino, D/G < 0.1. La evolución de D/G con el tratamiento térmico refleja la grafitización.
2. **Posición y anchura de la banda 2D para grafeno**:
   - Monocapa de grafeno: 2D única y estrecha a ~2680 cm⁻¹, I(2D)/I(G) > 2
   - Bicapa: 2D se desdobla en cuatro componentes
   - Multicapa (> 5 capas): espectro similar al grafito masivo
3. **Desplazamiento de frecuencia por tensión**: En silicio, grafeno y otros materiales, las tensiones mecánicas desplazan las frecuencias Raman. La sensibilidad es aproximadamente –2 cm⁻¹/GPa para grafeno monocapa.
4. **Temperatura de la muestra por la relación Stokes/anti-Stokes**: La intensidad relativa de las bandas Stokes e anti-Stokes permite calcular la temperatura local de la muestra: I(anti-Stokes)/I(Stokes) = exp(–ħω/kBT).

**Esperado:** Parámetros cuantitativos extraídos con sus valores y la información estructural o de estado que representan.

**En caso de fallo:** Si los picos están solapados y no se puede extraer la posición exacta, ajustar el espectro con funciones Voigt o Lorentz usando software de ajuste (OriginPro, PeakFit) antes de calcular los parámetros.

### Paso 5: Combinar con Datos IR para Análisis Completo

Integrar los datos Raman e IR para una caracterización vibracional completa:

1. **Construir la tabla de correlación vibracional**: Listar todos los modos vibracionales predichos por el análisis de simetría y anotar si son activos en Raman, IR o ambos.
2. **Aplicar la regla de exclusión mutua**: Verificar que los modos que aparecen en Raman e IR no comparten bandas si la molécula tiene centro de inversión. Inconsistencias indican error de asignación o baja simetría real.
3. **Completar la asignación**: Las bandas visibles solo en IR o solo en Raman son complementarias; combinadas, dan cobertura espectral completa de los modos vibracionales.
4. **Documentar en formato estándar**: ν̃ (cm⁻¹), intensidad relativa (mv, d, m, f, mf), actividad (Raman/IR), asignación simbólica (ν, δ, γ para estiramiento, deformación en plano y fuera del plano).

**Esperado:** Tabla de asignación vibracional completa que cubre todos los modos activos en Raman e IR, con la actividad de cada modo justificada por la simetría molecular.

**En caso de fallo:** Si la asignación vibracional completa no es posible sin cálculos DFT, reportar la asignación empírica de las bandas más características y anotar los modos no asignados para análisis computacional posterior.

## Validación

- [ ] El espectro tiene línea base corregida y está calibrado con un estándar
- [ ] Las reglas de selección Raman están aplicadas correctamente y el análisis de simetría es consistente
- [ ] Las bandas D, G y 2D en materiales carbonosos están asignadas con los parámetros cuantitativos extraídos
- [ ] La regla de exclusión mutua se verificó (para moléculas con centro de inversión)
- [ ] La asignación es consistente con datos IR disponibles
- [ ] El informe incluye longitud de onda del láser, potencia y tiempo de acumulación

## Errores Comunes

- **No corregir la fluorescencia**: Un fondo de fluorescencia elevado puede hacer que picos de baja intensidad parezcan absentes o desplazados. Siempre corregir la línea base antes de medir posiciones de pico.
- **Confundir bandas del sustrato con del compuesto**: El silicio (520 cm⁻¹) y el cuarzo (465 cm⁻¹) son contribuyentes comunes. Registrar el espectro del sustrato vacío.
- **Dañar la muestra por exceso de potencia del láser**: Muestras orgánicas, nanomateriales y muestras coloreadas pueden fotodegradarse o calentarse con potencias excesivas. Comenzar con la potencia mínima.
- **Interpretar la banda D como defecto sin cuantificar**: La intensidad de la banda D sola no cuantifica el desorden; usar la relación D/G y comparar con materiales de referencia conocidos.
- **Aplicar la regla de exclusión mutua a moléculas sin centro de inversión**: La regla solo aplica a moléculas con simetría de inversión (grupos puntuales Ci, Cnh, Dnh, Oh, etc.); en moléculas de baja simetría, los modos pueden ser activos en ambas técnicas simultáneamente.

## Habilidades Relacionadas

- `interpret-ir-spectrum` — complementar el análisis vibracional Raman con el espectro IR para cobertura completa
- `plan-spectroscopic-analysis` — determinar cuándo el Raman es preferible al IR y cómo combinar ambas técnicas
- `interpret-nmr-spectrum` — confirmar la estructura molecular propuesta mediante la espectroscopía de RMN
