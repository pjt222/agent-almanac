---
name: interpret-mass-spectrum
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretar espectros de masas de ionización electrónica (IE), ionización
  química (IC) y espectrometría de masas de alta resolución (EMAR) para
  determinar masas moleculares, fórmulas moleculares y vías de fragmentación.
  Usar cuando se determine la masa molecular de un compuesto desconocido, se
  identifique la fórmula molecular exacta a partir de datos de alta resolución,
  se interpreten patrones de fragmentación para obtener información estructural,
  o se confirme la identidad de un producto de síntesis mediante búsqueda en
  biblioteca.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, mass-spectrometry, fragmentation, molecular-formula, HRMS
---

# Interpretar Espectro de Masas

Determinar la masa molecular, la fórmula molecular y la información estructural de compuestos a partir de sus espectros de masas mediante el análisis del ion molecular, el patrón isotópico, los iones de fragmentación y las diferencias de masa características.

## Cuándo Usar

- Determinar la masa molecular de un compuesto desconocido
- Obtener la fórmula molecular exacta a partir de datos de EMAR (espectrometría de masas de alta resolución)
- Interpretar patrones de fragmentación para deducir información estructural
- Confirmar la identidad de un producto de síntesis comparando con datos de referencia
- Identificar impurezas o subproductos en mezclas de reacción

## Entradas

- **Requerido**: Espectro de masas (m/z frente a abundancia relativa)
- **Requerido**: Técnica de ionización utilizada (EI, CI, ESI, APCI, MALDI, FAB)
- **Opcional**: Masa exacta medida (para confirmación de fórmula molecular por EMAR)
- **Opcional**: Datos espectroscópicos complementarios (IR, RMN) del mismo compuesto
- **Opcional**: Historial sintético o información sobre la clase de compuesto esperada

## Procedimiento

### Paso 1: Identificar el Ion Molecular

Localizar el pico de mayor m/z que corresponde al ion molecular intacto:

1. **Para ionización por electrospray (ESI)**: El ion molecular suele aparecer como [M+H]⁺ (m/z = M+1) en modo positivo, o [M–H]⁻ en modo negativo. Los aductos con Na⁺ (M+23) y K⁺ (M+39) son frecuentes.
2. **Para ionización electrónica (EI a 70 eV)**: El ion molecular M⁺• se detecta a la masa monoisotópica. El pico de mayor m/z en el espectro es frecuentemente (pero no siempre) M⁺•.
3. **Para ionización química (CI)**: Produce principalmente [M+H]⁺ o [M+NH4]⁺, con fragmentación mínima. Útil cuando el ion molecular es inestable bajo EI.
4. **Verificar la coherencia del ion molecular**: El ion molecular debe tener mayor m/z que todos los fragmentos; los picos de fragmentación deben representar pérdidas de masas neutrales razonables desde M⁺•.
5. **Identificar el estado de carga**: En ESI, los compuestos grandes pueden aparecer con múltiples cargas ([M+2H]²⁺, etc.); el m/z real es M/z.

**Esperado:** Masa molecular M identificada con la adducción iónica adecuada para la técnica utilizada.

**En caso de fallo:** Si no se observa un ion molecular claro (frecuente con moléculas lábiles bajo EI), usar CI o ESI para obtener información de masa molecular. Si el ion molecular es ambiguo, usar el patrón isotópico para identificarlo.

### Paso 2: Analizar el Patrón Isotópico

El patrón de los picos M, M+1, M+2 revela la composición elemental:

1. **Nitrógeno**: La regla del nitrógeno establece que los compuestos con un número impar de nitrógenos tienen una masa molecular impar (EI). Los compuestos sin nitrógeno o con número par de nitrógenos tienen masa par.
2. **Cloro y bromo**: Cl produce un patrón M:M+2 de ~3:1; Br produce M:M+2 de ~1:1. Dos átomos de Cl dan M:M+2:M+4 de ~9:6:1.
3. **Azufre**: S contribuye ~4.4% al pico M+2 por átomo. Dos átomos de S dan un M+2 notable.
4. **Carbono e hidrógeno**: El pico M+1 crece aproximadamente un 1.1% por átomo de C y 0.015% por átomo de H, permitiendo estimar el número de carbonos.
5. **Silicio**: Patrón isotópico distintivo con M+2 intenso (~5.1% por átomo).

**Esperado:** Información elemental cualitativa (presencia/ausencia de halógenos, azufre, nitrógeno) y estimación del número de carbonos a partir del pico M+1.

**En caso de fallo:** Si el patrón isotópico es complejo o está solapado, adquirir el espectro a resolución más alta o complementar con análisis elemental.

### Paso 3: Determinar la Fórmula Molecular

Para compuestos con datos de masa exacta (EMAR):

1. **Calcular la fórmula molecular a partir de la masa exacta**: La diferencia entre la masa monoisotópica medida y la teórica debe ser < 5 ppm (típicamente < 2 ppm en instrumentos modernos).
2. **Calcular el DBE (grado de insaturación)**: DBE = (2C + 2 + N – H – X) / 2 con la fórmula molecular propuesta.
3. **Verificar la coherencia del DBE**: Un DBE entero y no negativo indica una fórmula molecular plausible.
4. **Usar software de determinación de fórmula**: Herramientas como Xcalibur, MassLynx o ChemCalc generan listas de fórmulas candidatas ordenadas por error de masa.

Para datos de baja resolución:
1. Usar el método M+1 para estimar el número de carbonos.
2. Combinar con análisis elemental (si está disponible) para desambiguar.
3. Proponer fórmulas moleculares compatibles con la masa nominal y el patrón isotópico.

**Esperado:** Una fórmula molecular con error de masa < 5 ppm (EMAR) o una lista corta de candidatos (baja resolución) con los DBE correspondientes.

**En caso de fallo:** Si ninguna fórmula razonable encaja dentro del error permitido, verificar la calibración del instrumento y la pureza de la muestra. Los aductos con disolvente (MeOH, ACN, formiato) pueden dar masas inesperadas.

### Paso 4: Interpretar Pérdidas Neutras y Fragmentos Diagnóstico

Los patrones de fragmentación revelan información estructural:

1. **Pérdidas neutras comunes desde M⁺•**:
   - –15 (CH3): metilo terminal
   - –17 (OH o NH3): alcohol, amina
   - –18 (H2O): alcohol, ácido carboxílico
   - –28 (CO o C2H4): cetona, aldehído, éster
   - –31 (OCH3): metil éster o éter
   - –45 (OEt o COOH): etil éster o ácido carboxílico
2. **Iones diagnóstico de grupos funcionales**:
   - m/z 77 (C6H5⁺): catión fenilo
   - m/z 91 (C7H7⁺): catión tropilio (bencilo)
   - m/z 105 (C6H5CO⁺): catión benzoilo
   - m/z 149: fragmento ftalato (contaminante de plasticizante)
3. **Patrones de fragmentación alfa**: Los carbonilos se fragmentan en alfa al C=O (escisión alfa), dando iones acilo y iones de hidrocarburo.
4. **Reordenamientos de McLafferty**: Cuando existe un hidrógeno gamma al carbonilo, se produce un reordenamiento de 6 miembros que da picos característicos.

**Esperado:** Lista de fragmentos principales con sus masas de pérdida y estructuras iónicas propuestas, conectadas a elementos estructurales específicos.

**En caso de fallo:** Si los fragmentos no corresponden a pérdidas neutras conocidas, consultar tablas de fragmentación o buscar en la base de datos NIST. Los rearreglos complejos pueden dar fragmentos difíciles de predecir ab initio.

### Paso 5: Proponer e Identificar la Estructura

Sintetizar todos los datos de EM para una propuesta estructural:

1. **Comparar con espectros de referencia**: Buscar en NIST, SDBS o Wiley para compuestos con la misma masa molecular y patrón de fragmentación.
2. **Confirmar con datos complementarios**: Verificar la consistencia de los grupos funcionales identificados por EM con los datos de IR y RMN.
3. **Documentar la asignación**: Proporcionar una tabla con m/z observado, composición iónica propuesta y justificación estructural para cada fragmento principal.

**Esperado:** Estructura propuesta o lista corta de candidatos con la asignación de los fragmentos principales documentada.

**En caso de fallo:** Si la identificación por búsqueda en biblioteca falla, realizar un análisis de datos no objetivo: buscar todos los fragmentos por pérdidas neutrales consistentes y construir la estructura de fragmento en fragmento.

## Validación

- [ ] El ion molecular está identificado con la adducción iónica correcta para la técnica de ionización
- [ ] El patrón isotópico es consistente con la composición elemental propuesta
- [ ] La fórmula molecular da un DBE entero y no negativo
- [ ] El error de masa para EMAR es < 5 ppm
- [ ] Los fragmentos principales están asignados a pérdidas neutras o iones diagnóstico razonables
- [ ] La estructura propuesta es consistente con los datos de IR y RMN disponibles

## Errores Comunes

- **Confundir [M+H]⁺ con M⁺•**: En ESI, el ion observado suele ser [M+H]⁺; restar 1 Da para obtener M. Este error lleva a fórmulas moleculares incorrectas.
- **Ignorar la regla del nitrógeno**: Un ion molecular de masa impar en EI indica un número impar de nitrógenos. Pasar esto por alto genera propuestas de fórmula molecular incorrectas.
- **Asignar el pico base a M⁺•**: El pico más intenso (base) no es el ion molecular; puede ser el fragmento más estable. El ion molecular es el de mayor m/z en espectros EI (excluyendo picos isotópicos).
- **Pasar por alto contaminantes comunes**: m/z 149 (ftalato), m/z 355 (siliconas), m/z 279 (tricosano, grasa) son contaminantes frecuentes. Comprobar si los picos mayores corresponden a estos antes de asignarlos al compuesto en estudio.
- **No compensar el efecto de masa exacta de EM de alta resolución**: La masa monoisotópica difiere de la masa nominal para compuestos con muchos átomos; usar siempre masas exactas de tablas o software.

## Habilidades Relacionadas

- `interpret-nmr-spectrum` — complementar la información de fórmula molecular con asignación de estructura completa
- `interpret-ir-spectrum` — confirmar grupos funcionales identificados por EM con datos de IR
- `plan-spectroscopic-analysis` — diseñar la estrategia analítica más eficiente para la caracterización del compuesto
