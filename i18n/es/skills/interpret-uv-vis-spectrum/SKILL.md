---
name: interpret-uv-vis-spectrum
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretar espectros de absorción UV-Vis para identificar cromóforos,
  aplicar la ley de Beer-Lambert para cuantificación, predecir longitudes de
  onda de absorción usando las reglas de Woodward-Fieser, y diagnosticar
  efectos solvatocrómicos. Usar cuando se identifiquen cromóforos en compuestos
  orgánicos desconocidos, se determine la concentración de un analito por
  espectrofotometría, se evalúe la conjugación del sistema π, o se monitorice
  el avance de una reacción química mediante cambios de absorbancia.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, uv-vis, chromophore, beer-lambert, woodward-fieser
---

# Interpretar Espectro UV-Vis

Obtener información cualitativa y cuantitativa de espectros de absorción UV-Vis mediante la identificación de cromóforos, la aplicación de la ley de Beer-Lambert, la predicción de absorciones con reglas de Woodward-Fieser y el análisis de efectos solvatocrómicos.

## Cuándo Usar

- Identificar cromóforos y el grado de conjugación en compuestos orgánicos desconocidos
- Determinar la concentración de un analito mediante espectrofotometría de absorción
- Predecir longitudes de onda de absorción para dienos y sistemas enona usando las reglas de Woodward-Fieser
- Evaluar el efecto del disolvente sobre las absorciones UV (solvatocromismo)
- Monitorizar el avance de una reacción siguiendo cambios de absorbancia en el tiempo

## Entradas

- **Requerido**: Espectro UV-Vis (absorbancia o transmitancia frente a longitud de onda en nm)
- **Requerido**: Disolvente usado y concentración de la muestra (si se conoce)
- **Opcional**: Coeficiente de extinción molar (ε) del compuesto de referencia para cuantificación
- **Opcional**: Estructura molecular del compuesto (para aplicación de reglas de Woodward-Fieser)
- **Opcional**: Espectro en distintos disolventes para análisis solvatocrómico

## Procedimiento

### Paso 1: Localizar y Caracterizar los Máximos de Absorción

Identificar sistemáticamente todos los máximos de absorción (λmax):

1. **Registrar todos los λmax**: Anotar la longitud de onda en nm y la absorbancia o coeficiente de extinción molar (ε, M⁻¹·cm⁻¹) de cada máximo.
2. **Clasificar por región espectral**:
   - 200–280 nm: transiciones π→π* (dobles enlaces aislados, aromáticos simples) y n→π* (grupos carbonilo, nitro)
   - 280–400 nm: sistemas conjugados extendidos, compuestos con n→π* de carbonilo
   - > 400 nm: sistemas altamente conjugados, colorantes, grupos con metales de transición
3. **Evaluar la intensidad de las bandas**:
   - ε > 10 000: transición π→π* (permitida por simetría)
   - ε 100–10 000: transición n→π* (parcialmente permitida) o bandas de transferencia de carga
   - ε < 100: transición prohibida por simetría o spin
4. **Identificar bandas características**:
   - Banda B del benceno (vibrónica, 250–270 nm, ε ~200–300): aromático sustituido con simetría baja
   - Banda K (dieno conjugado, ~230 nm): transición π→π* intensa
   - Banda R (carbonilo n→π*, ~300 nm, ε ~20–100): grupo C=O

**Esperado:** Lista de todos los λmax con sus ε, clasificados por tipo de transición electrónica.

**En caso de fallo:** Si el espectro tiene ruido excesivo o línea base inestable, re-registrar verificando que las celdas estén limpias, el disolvente no absorba en la región de interés y la concentración sea apropiada (absorbancia ideal 0.1–1.0).

### Paso 2: Aplicar la Ley de Beer-Lambert

Cuantificar la concentración del analito a partir de la absorbancia:

1. **Ley de Beer-Lambert**: A = ε × l × c, donde A es la absorbancia, ε el coeficiente de extinción molar (M⁻¹·cm⁻¹), l el paso óptico (cm) y c la concentración molar (M).
2. **Seleccionar la longitud de onda de trabajo**: Usar el λmax de mayor ε para máxima sensibilidad y mínima interferencia de la pendiente espectral.
3. **Verificar la linealidad de Beer**: Preparar al menos 5 concentraciones y graficar A frente a c. La linealidad se mantiene típicamente hasta A < 1.0. Las desviaciones indican: disociación del soluto, reacciones de asociación, o contaminación de la celda.
4. **Calcular ε o c**:
   - Si ε es conocido: c = A / (ε × l)
   - Si c es conocida: ε = A / (l × c)
5. **Informar el resultado con incertidumbre**: Incluir el error de medición de A y la propagación de errores en c.

**Esperado:** Concentración determinada con su incertidumbre, o ε medido con la concentración conocida.

**En caso de fallo:** Si la linealidad de Beer falla, investigar posible disociación, agregación o fluorescencia del soluto. Ajustar la concentración para mantener A dentro del rango 0.1–1.0.

### Paso 3: Predecir λmax Mediante las Reglas de Woodward-Fieser

Para dienos y sistemas carbonílicos conjugados, predecir la longitud de onda de absorción:

1. **Para dienos y polienos** (reglas de Woodward):
   - Base: dieno heteroanaular (s-trans) = 214 nm; dieno homoanaular (s-cis) = 253 nm
   - Sustituyentes: +5 nm por doble enlace extendido; +5 nm por sustituyente alquilo en el dieno; +30 nm por grupo exocíclico
   - Disolvente: las reglas de Woodward se establecieron en etanol
2. **Para enonas** (reglas de Woodward-Fieser):
   - Base: enona de 6 miembros = 215 nm; enona de 5 miembros = 202 nm
   - Sustituyentes en alfa: +10 nm; en beta: +12 nm; en delta: +18 nm
   - Cada doble enlace conjugado adicional: +30 nm; cada grupo OH: +35 nm (OH libre); grupo OR: +35 nm
3. **Comparar la predicción con el λmax observado**: Una diferencia < 5 nm confirma la estructura conjugada propuesta.

**Esperado:** Longitud de onda predicha con la suma detallada de correcciones, comparada con el valor observado.

**En caso de fallo:** Si la discrepancia entre predicción y observación supera los 10 nm, reconsiderar la geometría de la conjugación (s-cis vs. s-trans) o la presencia de efectos conformacionales que rompan la planaridad del cromóforo.

### Paso 4: Analizar Efectos Solvatocrómicos

Interpretar el desplazamiento de λmax con el cambio de disolvente:

1. **Solvatocromismo positivo (batocrómica)**: El λmax se desplaza hacia mayor longitud de onda al aumentar la polaridad del disolvente. Común en transiciones π→π* donde el estado excitado es más polar que el fundamental.
2. **Solvatocromismo negativo (hipsocrómico)**: El λmax se desplaza hacia menor longitud de onda con mayor polaridad. Típico de transiciones n→π* (el enlace de hidrógeno del disolvente estabiliza el orbital n del estado fundamental más que el excitado).
3. **Identificar el tipo de transición por solvatocromismo**: Un desplazamiento hipsocrómico con disolventes próticos confirma n→π*; un desplazamiento batocrómico confirma π→π*.
4. **Documentar el disolvente en los datos espectrales**: El λmax varía hasta 20–30 nm entre disolventes no polares y muy polares. Indicar siempre el disolvente en la descripción espectral.

**Esperado:** Clasificación del tipo de transición electrónica mediante análisis solvatocrómico y documentación del efecto del disolvente.

**En caso de fallo:** Si el compuesto reacciona con el disolvente, los datos solvatocrómicos son inválidos. Usar disolventes inertes y verificar la estabilidad de la muestra antes del análisis.

### Paso 5: Integrar la Información Estructural

Combinar la información UV-Vis con otros datos para obtener conclusiones estructurales:

1. **Relacionar con datos de RMN e IR**: Los cromóforos identificados por UV deben ser consistentes con los grupos funcionales detectados por IR y los protones vinílicos/aromáticos observados por RMN.
2. **Estimar la extensión del sistema conjugado**: El número de unidades de conjugación se relaciona con el λmax: cada doble enlace adicional en el sistema conjugado desplaza λmax aproximadamente +30 nm.
3. **Identificar transiciones de transferencia de carga**: Bandas intensas por encima de 400 nm en compuestos donor-aceptor indican transferencia de carga intramolecular.
4. **Documentar en formato estándar**: λmax (nm) [ε (M⁻¹·cm⁻¹)], disolvente; por ej., 280 (15 000), 330 (80) en EtOH.

**Esperado:** Descripción estructural completa del cromóforo con todos los λmax documentados en el formato estándar.

**En caso de fallo:** Si el compuesto no absorbe en la región 200–800 nm, el compuesto carece de grupos cromóforos; considerar derivatización para introducir un grupo que absorba UV, o utilizar técnicas de detección alternativas.

## Validación

- [ ] Todos los máximos de absorción están listados con sus ε y el tipo de transición asignado
- [ ] La ley de Beer-Lambert se verificó con al menos 5 concentraciones (si se usa para cuantificación)
- [ ] La predicción de Woodward-Fieser concuerda con el valor observado dentro de ±10 nm
- [ ] El efecto del disolvente está documentado e interpretado
- [ ] Los datos UV-Vis son consistentes con los grupos funcionales detectados por IR y RMN
- [ ] El disolvente y la concentración de la muestra están informados junto con los datos espectrales

## Errores Comunes

- **Omitir el disolvente en el informe**: El λmax puede variar hasta 30 nm según el disolvente. Siempre especificar las condiciones de medida.
- **Trabajar fuera del rango lineal de Beer**: A > 1.0 o < 0.05 dan errores significativos de cuantificación. Ajustar la concentración.
- **Confundir bandas del disolvente con del compuesto**: Muchos disolventes orgánicos absorben por debajo de 250 nm (acetonitrilos, 190 nm; MeOH, 205 nm; CHCl3, 245 nm). Registrar el espectro del disolvente solo para comparación.
- **Aplicar reglas de Woodward fuera de su dominio**: Las reglas de Woodward-Fieser se establecieron para compuestos simples; en sistemas policiclicos complejos o sistemas donador-aceptor, la predicción puede ser inexacta.
- **Ignorar la contribución de impurezas altamente extintas**: Pequeñas cantidades de impurezas con ε>>10 000 pueden dominar el espectro. Verificar la pureza por HPLC o RMN antes del análisis UV.

## Habilidades Relacionadas

- `interpret-nmr-spectrum` — confirmar la naturaleza del sistema conjugado con datos de RMN vinílicos y aromáticos
- `interpret-ir-spectrum` — identificar grupos funcionales carbonílicos y olefínicos complementarios a UV
- `plan-spectroscopic-analysis` — diseñar la combinación de técnicas para la caracterización completa del cromóforo
