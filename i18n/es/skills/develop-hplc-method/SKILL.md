---
name: develop-hplc-method
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Desarrollar un método de cromatografía líquida de alta eficiencia (HPLC) para
  la separación y cuantificación de compuestos no volátiles en fase inversa,
  fase normal o intercambio iónico. Cubre la selección de columna, optimización
  de la fase móvil (gradiente vs. isocrático), control de pH, temperatura y
  detección UV/DAD/MS. Usar cuando se separen mezclas de compuestos no
  volátiles, polares o iónicos; cuando se desarrolle un método de control de
  calidad farmacéutico; cuando se optimice la selectividad de la separación
  ajustando las condiciones de la fase móvil; o cuando se transfieran métodos
  HPLC entre equipos.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, hplc, liquid-chromatography, method-development, reversed-phase
---

# Desarrollar Método HPLC

Diseñar y optimizar un método de HPLC para la separación y cuantificación de analitos no volátiles, seleccionando el modo cromatográfico, la columna, la composición y el gradiente de la fase móvil, y los parámetros del detector.

## Cuándo Usar

- Separar mezclas de compuestos no volátiles, polares o iónicos
- Desarrollar un método de control de calidad para farmacéuticos, alimentos o productos químicos
- Optimizar la selectividad de una separación HPLC existente
- Transferir un método entre equipos HPLC o convertirlo a UHPLC
- Determinar la pureza de un producto de síntesis por HPLC-DAD

## Entradas

- **Requerido**: Lista de analitos con propiedades de ionización (pKa), polaridad (log P) y estructura química
- **Requerido**: Tipo de muestra y matriz (solvente de disolución, posibles interferentes)
- **Opcional**: Método de referencia o condiciones iniciales de partida
- **Opcional**: Detector disponible y longitudes de onda de detección preferidas
- **Opcional**: Requisitos de tiempo de análisis y sensibilidad (LOQ objetivo)

## Procedimiento

### Paso 1: Seleccionar el Modo Cromatográfico

Determinar el mecanismo de separación apropiado para los analitos:

1. **Fase inversa (RP-HPLC)**: Para la mayoría de compuestos orgánicos con alguna hidrofobicidad (log P > –1). Fase estacionaria no polar (C18, C8); fase móvil acuosa/orgánica. Modo más versátil y reproducible. Apropiado para fármacos, pesticidas, metabolitos, colorantes.
2. **Fase normal (NP-HPLC)**: Para compuestos muy apolares o que se retienen mal en RP. Fase estacionaria polar (sílice, aminopropilo, cianopropilo); fase móvil orgánica no polar. Separación de isómeros estructurales con diferente polaridad; lípidos, vitaminas liposolubles.
3. **Intercambio iónico (IC)**: Para aniones y cationes inorgánicos u orgánicos cargados. Aplicaciones: análisis de agua, ácidos de azúcar, aminoácidos con derivatización.
4. **HILIC (cromatografía de interacción hidrofílica)**: Para compuestos muy polares o iónicos que se retienen mal en RP. Fase estacionaria polar; fase móvil con alto contenido orgánico (> 70% ACN). Aminoácidos, nucleósidos, sacáridos, compuestos zwitteriónicos.
5. **Cromatografía por exclusión de tamaño (SEC)**: Para polímeros, proteínas o nanopartículas separadas por tamaño molecular. No implica interacción con la fase estacionaria; la columna actúa como tamiz molecular.

**Esperado:** Modo cromatográfico seleccionado con justificación basada en las propiedades de los analitos.

**En caso de fallo:** Si los analitos tienen propiedades muy dispares (mezcla de compuestos polares y apolares), considerar un gradiente amplio en RP-HPLC o usar dos métodos separados para los analitos de diferentes polaridades.

### Paso 2: Seleccionar la Columna HPLC

La columna determina la selectividad y la eficiencia de la separación:

1. **Fase estacionaria para RP-HPLC**:
   - **C18 (octadecil)**: La más retentiva y versátil; para analitos de polaridad media-baja; muchas variantes (protegida frente a pH, con grupos polar-embedded, endcapped).
   - **C8 (octil)**: Menor retención que C18; útil para compuestos muy hidrofóbicos que eluyen demasiado tarde en C18.
   - **Fenilo o pentafluorofenilo (PFP)**: Mayor selectividad para compuestos aromáticos y halogenados; interacciones π-π adicionales.
   - **C18 con polar-embedded**: Para analitos muy polares o básicos; mayor estabilidad a pH bajo.
2. **Dimensiones de la columna**:
   - Análisis de rutina: 150 × 4.6 mm, 3.5–5 μm
   - Análisis rápido UHPLC: 50–100 mm × 2.1 mm, 1.7–1.8 μm
   - Preparativa o semipreparativa: 250 × 10–20 mm, 5–10 μm
3. **Temperatura de columna**: Mayor temperatura reduce la viscosidad y mejora la eficiencia; puede cambiar la selectividad. Punto de partida: 30–40°C para C18 en RP; hasta 60°C para métodos rápidos.

**Esperado:** Especificación de columna (dimensiones, fase estacionaria, tamaño de partícula) con la temperatura de trabajo.

**En caso de fallo:** Si la columna C18 no da la resolución adecuada entre pares críticos de analitos, probar primero una columna de fase estacionaria diferente (PFP, fenilo) antes de cambiar el modo cromatográfico.

### Paso 3: Optimizar la Fase Móvil

La composición de la fase móvil controla la retención y la selectividad:

1. **Para RP-HPLC — seleccionar el disolvente orgánico modificador**:
   - Acetonitrilo (ACN): Más fuerte que MeOH; baja viscosidad → menor presión; mejor transparencia UV (> 190 nm). Primera elección para UHPLC.
   - Metanol (MeOH): Selectividad diferente a ACN (mayor selectividad para compuestos polares); mayor viscosidad → mayor presión; UV límite ~205 nm.
   - THF: Selectividad especial para algunos analitos; mayor presión; poca compatibilidad con MS.
2. **Ajustar el pH de la fase acuosa** (para analitos ionizables):
   - pH 2–3: Protonación de bases y supresión de ionización de ácidos débiles; buena para bases y ácidos pKa > 4; usar tampones de ácido fórmico (10 mM) o TFA (0.1%).
   - pH 6–7: Para analitos anfotéricos o ácidos de pKa 4–6; usar tampones de fosfato o acetato de amonio.
   - Regla: Trabajar al menos 2 unidades de pH por debajo del pKa de un ácido o por encima del pKa de una base para garantizar el 99% de la forma neutra.
3. **Diseñar el gradiente**:
   - Inicio: Condición de baja fuerza eluotrópica (alta %H2O para RP) para retener todos los analitos.
   - Gradiente: Rampa lineal de 5–10%/min es un buen punto de partida.
   - Final: Condición de alta fuerza (alta %orgánico) para eluir los más retenidos y limpiar la columna.
   - Re-equilibrado: 5–10 volúmenes de columna con condiciones iniciales antes de la siguiente inyección.
4. **Condiciones isocráticas** (cuando todos los analitos eluyen en ventana de k' 2–10): Más simples y reproducibles; usar cuando el rango de polaridad es estrecho.

**Esperado:** Composición de la fase móvil (tampón, pH, disolvente orgánico) con el gradiente o condición isocrática optimizada.

**En caso de fallo:** Si algunos analitos eluyen juntos (k' muy similar), cambiar el modificador orgánico (ACN→MeOH) o ajustar el pH para cambiar selectivamente la retención de analitos ionizables.

### Paso 4: Configurar la Detección

Seleccionar y optimizar el sistema de detección:

1. **Detección UV de longitud de onda fija**: Seleccionar λmax del cromóforo del analito. Asegurarse de que la fase móvil no absorbe a esa longitud de onda. ACN: transparente > 190 nm; MeOH: transparente > 205 nm; tampones de fosfato: evitar λ < 220 nm.
2. **Detector DAD (arreglo de diodos)**:
   - Adquirir espectros UV completos de cada pico para confirmación de pureza
   - Seleccionar múltiples longitudes de onda para analitos con diferentes cromóforos en la misma corrida
   - Verificar la pureza del pico por superposición de espectros (pureza espectral)
3. **Espectrometría de masas (LC-MS)**:
   - ESI modo positivo: para bases (aminas, alcaloides) y analitos moderadamente polares
   - ESI modo negativo: para ácidos (carboxílicos, fenoles, fosfatos, nucleótidos)
   - APCI: para analitos menos polares con peso molecular bajo-medio
   - Fase móvil compatible con MS: usar tampones volátiles (acetato de amonio, formiato de amonio); evitar fosfato, TFA > 0.05%

**Esperado:** Sistema de detección configurado con longitudes de onda, parámetros MS o configuración de ión seleccionado según los analitos.

**En caso de fallo:** Si la detección UV es insuficiente por falta de cromóforo (compuestos sin UV), usar derivatización precolumna o poscolumna, o cambiar a MS o detección ELSD (dispersión de luz evaporativa) para compuestos sin cromóforo.

### Paso 5: Verificar el Método y Optimizar

Confirmar el rendimiento del método con inyecciones de prueba:

1. **Inyectar una mezcla de todos los analitos en concentración media** y verificar la resolución de todos los pares de picos críticos (Rs ≥ 1.5).
2. **Comprobar la simetría de los picos**: Factor de cola (As) = distancia del centro del pico a la cola posterior / distancia del frente al centro, ambas medidas al 10% de la altura. As ideal = 1.0–1.2; As > 2.0 indica problemas.
3. **Verificar la eficiencia de la columna**: N ≥ 10 000 platos para columna de 15 cm; N ≥ 50 000 para UHPLC de 5 cm.
4. **Construir la curva de calibración**: 5–7 puntos en el rango de trabajo; R² ≥ 0.9995 para cuantificación.
5. **Prueba de robustez preliminar**: Variar pH ± 0.2, temperatura ± 5°C, y % orgánico ± 2% para identificar los parámetros más críticos del método.

**Esperado:** Método con Rs ≥ 1.5, As ≤ 2.0, N adecuado para la columna y linealidad demostrada en el rango de trabajo.

**En caso de fallo:** Si la forma del pico es asimétrica (cola) para analitos básicos, ajustar el pH de la fase móvil o usar una columna específicamente diseñada para bases (C18 con polar-embedded o C18 de alta pureza). Para ácidos que pierden forma, verificar el pH y la temperatura.

## Validación

- [ ] El modo cromatográfico es apropiado para la polaridad y estado de ionización de los analitos
- [ ] La fase estacionaria y las dimensiones de la columna son consistentes con los requisitos de separación
- [ ] El pH de la fase móvil está al menos 2 unidades del pKa de los analitos ionizables
- [ ] El gradiente o condición isocrática da k' entre 2 y 10 para todos los analitos
- [ ] Rs ≥ 1.5 para todos los pares de picos críticos
- [ ] El factor de cola está en el rango 0.8–2.0 para todos los picos
- [ ] La linealidad de la calibración muestra R² ≥ 0.9995

## Errores Comunes

- **No controlar el pH en analitos ionizables**: Pequeños cambios de pH alrededor del pKa dan grandes variaciones de retención. Usar tampones de capacidad adecuada y verificar el pH con electrodo calibrado.
- **Ignorar la compatibilidad con MS de la fase móvil**: El tampón de fosfato es excelente para HPLC-UV pero destruye la fuente de iones del MS. Si existe posibilidad de análisis por MS, planificar desde el inicio con tampones volátiles.
- **Inyectar muestras en disolvente más fuerte que la fase móvil inicial**: Esto causa ensanchamiento del pico o picos divididos. El disolvente de inyección debe tener fuerza eluotrópica igual o menor que la fase móvil inicial.
- **No equilibrar la columna con condiciones suficientes**: Un equilibrado insuficiente (< 5 volúmenes de columna con condiciones iniciales) causa tiempos de retención no reproducibles entre inyecciones en análisis por gradiente.
- **Sobrecargar la columna con demasiada masa de muestra**: Cada columna tiene una capacidad de masa; sobrepasarla causa ensanchamiento de picos y pérdida de resolución. En columnas analíticas convencionales, la cantidad máxima de analito es 1–50 μg.

## Habilidades Relacionadas

- `interpret-chromatogram` — interpretar los cromatogramas obtenidos con el método desarrollado
- `troubleshoot-separation` — diagnosticar y corregir problemas de la separación HPLC
- `validate-analytical-method` — validar formalmente el método HPLC según guías ICH
