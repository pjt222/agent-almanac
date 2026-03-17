---
name: interpret-nmr-spectrum
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretar espectros de resonancia magnética nuclear (RMN) de 1H, 13C, DEPT
  y 2D para determinar la estructura de moléculas orgánicas. Usar cuando se
  asigne la estructura de un compuesto desconocido, se verifique la pureza o
  identidad de un producto de síntesis, se interpreten experimentos de
  correlación 2D (COSY, HSQC, HMBC), o se identifiquen errores en datos
  espectrales informados.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, nmr, structure-elucidation, organic-chemistry, 2d-nmr
---

# Interpretar Espectro de RMN

Determinar la estructura de moléculas orgánicas a partir de datos de RMN de 1H, 13C, DEPT y 2D mediante el análisis sistemático de desplazamientos químicos, multiplicidades, constantes de acoplamiento y correlaciones de largo alcance.

## Cuándo Usar

- Asignar la estructura de un compuesto desconocido a partir de datos espectrales
- Verificar la identidad o pureza de un producto sintetizado
- Interpretar experimentos de correlación 2D (COSY, HSQC, HMBC, NOESY)
- Distinguir entre estructuras propuestas cuando los datos de RMN 1H son ambiguos
- Identificar contaminantes o subproductos en mezclas de reacción

## Entradas

- **Requerido**: Espectro de RMN 1H con desplazamientos químicos, integrales y multiplicidades
- **Requerido**: Fórmula molecular o masa molecular del compuesto
- **Opcional**: Espectro de RMN 13C con datos DEPT
- **Opcional**: Datos de correlación 2D (COSY, HSQC, HMBC, NOESY/ROESY)
- **Opcional**: Disolvente de RMN utilizado (afecta los desplazamientos de referencia)

## Procedimiento

### Paso 1: Calcular el Grado de Insaturación

Antes de asignar señales individuales, determinar el número de dobles enlaces equivalentes (DBE) a partir de la fórmula molecular:

1. **Fórmula DBE**: DBE = (2C + 2 + N - H - X) / 2, donde C = carbonos, H = hidrógenos, N = nitrógenos, X = halógenos.
2. **Interpretar el DBE**: DBE = 0 implica compuesto completamente saturado; DBE = 1 implica un doble enlace o un anillo; DBE = 4 implica un anillo aromático (incluyendo 3 dobles enlaces del anillo).
3. **Orientar la búsqueda de estructura**: Un DBE alto (> 4) sugiere múltiples anillos o grupos carbonilo y dirige la interpretación posterior.

**Esperado:** Un valor DBE entero o semientero que limita el número de posibles estructuras.

**En caso de fallo:** Si la fórmula molecular es desconocida, estimar el DBE a partir de los desplazamientos de RMN 13C (señales > 100 ppm indican insaturaciones) y confirmar con datos de espectrometría de masas.

### Paso 2: Asignar Señales de RMN 1H

Asignar sistemáticamente cada señal 1H a un entorno químico:

1. **Verificar protones de referencia interna**: El TMS (0 ppm) o el disolvente (CDCl3 a 7.26 ppm, DMSO-d6 a 2.50 ppm, D2O a 4.79 ppm) establece la referencia química.
2. **Clasificar por región de desplazamiento**:
   - 0–3 ppm: protones alquílicos (CH3, CH2, CH)
   - 3–5 ppm: protones junto a heteroátomos (O, N), alílicos o vinílicos terminales
   - 5–7 ppm: protones olefínicos
   - 6.5–8.5 ppm: protones aromáticos
   - 8–13 ppm: aldehídos, ácidos carboxílicos, algunos NH/OH
3. **Contar protones por integración**: Normalizar las integrales al número de protones de cada señal.
4. **Asignar multiplicidades**: Aplicar la regla n+1 para protones acoplados. Las señales de dobles o triples anchos sugieren acoplamiento con NH o protones diastereotópicos.
5. **Medir constantes de acoplamiento J**: Las constantes J vecinales típicas son: trans-alqueno 12–18 Hz, cis-alqueno 6–12 Hz, aromáticos 6–9 Hz, geminales –10 a +3 Hz.

**Esperado:** Tabla de asignación 1H con desplazamiento, integral, multiplicidad y J para cada señal.

**En caso de fallo:** Si las señales están solapadas, usar experimentos 2D (COSY, TOCSY) para resolver el solapamiento. Si los protones intercambiables (OH, NH) son ambiguos, agitar con D2O o cambiar el disolvente a DMSO-d6.

### Paso 3: Interpretar Datos de RMN 13C y DEPT

Identificar los tipos de carbono y sus entornos:

1. **Clasificar señales 13C por desplazamiento**:
   - 0–50 ppm: carbonos sp3 alquílicos
   - 50–90 ppm: carbonos sp3 junto a heteroátomos, alquínicos
   - 100–160 ppm: carbonos olefínicos, aromáticos o heteroaromáticos
   - 155–230 ppm: carbonos carbonílicos (C=O de éster/ácido 160–180 ppm, aldehído/cetona 190–220 ppm)
2. **Aplicar multiplicidad DEPT**:
   - DEPT-135: CH y CH3 apuntan hacia arriba; CH2 apunta hacia abajo; C cuaternario ausente
   - DEPT-90: solo señales CH visibles
3. **Contar carbonos cuaternarios**: Restar señales DEPT del espectro 13C completo para identificar los C cuaternarios (incluyendo C aromáticos no protonados, C carbonílico).

**Esperado:** Lista completa de carbonos clasificados como C, CH, CH2 o CH3 con sus desplazamientos.

**En caso de fallo:** Si las señales 13C son menos que los carbonos esperados, algunos carbonos pueden ser equivalentes por simetría o estar solapados. Comparar con el número de protones para detectar simetrías.

### Paso 4: Analizar Correlaciones 2D

Usar experimentos de correlación para conectar fragmentos de la estructura:

1. **COSY (correlación 1H–1H)**: Identifica protones acoplados vecinalemente. Cada punto de cruce conecta dos protones en átomos adyacentes.
2. **HSQC (correlación 1H–13C de un enlace)**: Empareja cada señal 1H con su carbono directamente unido. Usar para resolver solapamientos 1H usando la dimensión 13C.
3. **HMBC (correlación 1H–13C de dos a tres enlaces)**: Conecta protones con carbonos a 2–3 enlaces de distancia. Crucial para definir conectividad a través de heteroátomos y carbonos cuaternarios.
4. **NOESY/ROESY (correlación 1H–1H en espacio)**: Indica proximidad espacial (< 5 Å). Usar para asignación estereoquímica y conformacional.

```markdown
## Tabla de Correlaciones 2D
| Protón (δ 1H) | COSY con | HSQC (δ 13C) | HMBC con 13C | Asignación |
|--------------|----------|--------------|--------------|------------|
| [despl.]     | [H adj.]  | [C directo]  | [C distante] | [grupo]    |
```

**Esperado:** Tabla de conectividad que conecta todos los fragmentos moleculares en una estructura completa.

**En caso de fallo:** Si las correlaciones HMBC son ambiguas (puntos de cruce débiles o ausentes a través de 4 enlaces), orientarse principalmente en los datos COSY e HSQC y proponer estructuras parciales.

### Paso 5: Proponer y Verificar la Estructura

Ensamblar los fragmentos en una estructura completa y verificarla:

1. **Combinar fragmentos**: Usar las correlaciones COSY para construir cadenas de protones continuos; usar HMBC para conectar fragmentos a través de carbonos cuaternarios o heteroátomos.
2. **Verificar el ajuste del DBE**: Confirmar que la estructura propuesta tiene el DBE calculado.
3. **Verificar los desplazamientos**: Comprobar que todos los desplazamientos 1H y 13C son consistentes con los valores predichos por los programas de predicción de RMN (por ej., ChemDraw, ACD/CNMR) o con tablas de referencia publicadas.
4. **Considerar estructuras alternativas**: Si el DBE permite isómeros, descartar sistemáticamente las alternativas usando el conjunto completo de datos 2D.
5. **Informe final**: Documentar la estructura con todas las asignaciones de señal, la tabla de correlaciones y los valores calculados frente a los observados.

**Esperado:** Estructura molecular uívoca con todas las señales de RMN asignadas y consistentes con los datos espectrales.

**En caso de fallo:** Si persiste la ambigüedad estructural, adquirir datos adicionales (NOESY para estereoquímica, espectro en otro disolvente para señales ocultas) o recurrir a datos de espectrometría de masas de alta resolución para confirmar la fórmula molecular.

## Validación

- [ ] El DBE calculado es consistente con las insaturaciones observadas en el espectro
- [ ] La suma de integrales 1H coincide con el número total de protones de la fórmula molecular
- [ ] Todos los carbonos 13C están asignados y clasificados por DEPT
- [ ] Las correlaciones HMBC clave explican la conectividad a través de cada fragmento
- [ ] Los desplazamientos químicos predichos para la estructura propuesta coinciden con los observados (± 0.5 ppm para 1H, ± 5 ppm para 13C)
- [ ] No existen señales sin asignar en ningún espectro
- [ ] La estereoquímica (si es relevante) está respaldada por datos NOESY o constantes de acoplamiento

## Errores Comunes

- **Ignorar el DBE**: Empezar la asignación sin calcular el grado de insaturación conduce a propuestas de estructura que no son consistentes con la fórmula molecular.
- **Confundir multiplicidades**: Un quintuplete puede confundirse con un multiplete. Medir siempre las constantes de acoplamiento J para confirmar la multiplicidad.
- **Pasar por alto protones intercambiables**: Los protones OH, NH y COOH pueden desaparecer, desplazarse o ensancharse según el disolvente y la temperatura.
- **Sobraintrepretar correlaciones HMBC débiles**: Los acoplamientos a 4 enlaces y los artefactos a larga distancia pueden aparecer como puntos de cruce HMBC. Usar solo correlaciones intensas para la asignación primaria.
- **Olvidar los efectos del disolvente**: Los desplazamientos de referencia varían según el disolvente. DMSO-d6 desplaza los protones aromáticos y carbonilos de manera diferente a CDCl3.
- **Confundir DEPT-135 con DEPT-90**: Un CH2 aparece negativo en DEPT-135 pero ausente en DEPT-90; un CH3 aparece positivo en ambos.

## Habilidades Relacionadas

- `interpret-ir-spectrum` — identificar grupos funcionales que restringen las posibles estructuras antes de la asignación de RMN
- `interpret-mass-spectrum` — confirmar la fórmula molecular y detectar fragmentos clave
- `plan-spectroscopic-analysis` — seleccionar la combinación óptima de experimentos espectroscópicos para la elucidación estructural
