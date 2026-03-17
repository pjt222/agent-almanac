---
name: develop-gc-method
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Desarrollar un método de cromatografía de gases (GC) para la separación y
  cuantificación de compuestos volátiles mediante la selección de columna,
  rampa de temperatura, gas portador y parámetros del detector. Usar cuando se
  separen mezclas de compuestos volátiles u orgánicos de punto de ebullición
  bajo, se desarrolle un método GC de control de calidad, se optimice una
  separación GC existente que muestra solapamiento de picos o tiempos de
  análisis excesivos, o se transfieran métodos GC entre instrumentos.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, gc, gas-chromatography, method-development, volatile-analysis
---

# Desarrollar Método GC

Diseñar y optimizar un método de cromatografía de gases para la separación y cuantificación de analitos volátiles, seleccionando la columna, el programa de temperatura, el gas portador y los parámetros del detector apropiados.

## Cuándo Usar

- Separar mezclas de compuestos volátiles o de bajo punto de ebullición
- Desarrollar un método GC de control de calidad para producción o cumplimiento
- Optimizar una separación existente que muestra solapamiento de picos o tiempos de análisis largos
- Transferir un método GC entre instrumentos o laboratorios
- Analizar muestras ambientales (VOCs), alimentos, o productos farmacéuticos por GC

## Entradas

- **Requerido**: Lista de analitos objetivo con propiedades físico-químicas (punto de ebullición, polaridad, estabilidad térmica)
- **Requerido**: Tipo de muestra (gaseosa, líquida, sólida con headspace) y matriz
- **Opcional**: Método GC de referencia o condiciones iniciales de partida
- **Opcional**: Requisitos de sensibilidad (límite de cuantificación objetivo)
- **Opcional**: Tiempo máximo de análisis y restricciones de coste

## Procedimiento

### Paso 1: Seleccionar la Columna GC

La columna es el corazón del método GC y determina la selectividad:

1. **Seleccionar la fase estacionaria según la polaridad de los analitos**:
   - **No polar (100% polidimetilsiloxano, DB-1, HP-1)**: Ideal para hidrocarburos, compuestos apolares; elución en orden de punto de ebullición; alta estabilidad térmica (hasta 320–350°C).
   - **Ligeramente polar (5% fenilo-PDMS, DB-5, HP-5)**: Columna de uso general más frecuente; buena para mezclas de analitos mixtos; alta estabilidad (hasta 300°C).
   - **Moderadamente polar (50% fenilo o cianopropilo, DB-17, DB-225)**: Mejor selectividad para compuestos polares y aromáticos; temperatura máxima 240–280°C.
   - **Polar (polietilenglicol, DB-WAX, Stabilwax)**: Excelente para alcoholes, ácidos grasos, compuestos polares; temperatura máxima 250°C; sensible a humedad y oxígeno.
2. **Seleccionar las dimensiones de la columna**:
   - Longitud: 15–30 m (análisis de rutina), 60 m (separaciones complejas)
   - Diámetro interno: 0.25 mm (alta resolución, mayor presión) o 0.32 mm (uso general) o 0.53 mm (alta capacidad, megabore)
   - Grosor de film: 0.25 μm (amplio rango de volatilidad), 1–5 μm (analitos muy volátiles o mejor capacidad de muestra)
3. **Verificar la compatibilidad de temperatura**: La temperatura máxima de la columna debe superar al menos 20–30°C el punto de ebullición del analito más alto.

**Esperado:** Especificación de columna (longitud, diámetro, film, fase estacionaria) justificada por las propiedades de los analitos.

**En caso de fallo:** Si los analitos tienen rangos de volatilidad extremadamente amplios (punto de ebullición diferencia > 200°C), considerar una columna de 60 m con un programa de temperatura amplio, o dividir el análisis en dos métodos separados.

### Paso 2: Diseñar el Programa de Temperatura

El programa de temperatura controla la velocidad de elución y la resolución:

1. **Temperatura del inyector**: Típicamente 20–50°C por encima del punto de ebullición del componente más alto. Para mezclas amplias: 250–300°C.
2. **Temperatura inicial del horno**: 20–40°C por debajo del punto de ebullición del analito más volátil (pero por encima de la temperatura del gas portador para evitar condensación).
3. **Rampas de temperatura**:
   - Rápida (10–20°C/min): Para métodos cortos, analitos con propiedades similares.
   - Lenta (2–5°C/min): Para mejorar la resolución de analitos con puntos de ebullición similares.
   - Etapas isotérmicas: Útiles para grupos de analitos con propiedades muy diferentes.
4. **Temperatura final y tiempo de retención**: La temperatura final debe ser 20–30°C por encima del punto de ebullición del analito más alto para asegurar elución completa. El tiempo de retención a temperatura final (post-run) limpia los compuestos residuales de la columna.
5. **Regla práctica para rampas**: Una rampa de 10°C/min es un buen punto de partida. Cada 20°C de temperatura inicial más baja añade ~2 minutos al tiempo de análisis pero mejora la resolución de los primeros picos.

**Esperado:** Programa de temperatura completo (temperatura inicial, rampa(s), temperatura final, tiempo de retención) estimado para todos los analitos.

**En caso de fallo:** Si el tiempo de análisis estimado es demasiado largo, aumentar la velocidad de rampa o implementar un método rápido con columna corta (15 m) y alta velocidad de gas portador.

### Paso 3: Optimizar el Gas Portador y el Caudal

El gas portador afecta la eficiencia de la separación y la sensibilidad del detector:

1. **Seleccionar el gas portador**:
   - **Helio (He)**: Gas portador más común; da la mejor eficiencia (platos teóricos) a velocidades lineales prácticas (20–40 cm/s); compatible con todos los detectores.
   - **Hidrógeno (H2)**: Mayor velocidad óptima (40–60 cm/s) → análisis más rápidos; mejor difusividad → curva de van Deemter más plana; riesgo de seguridad (inflamable); no compatible con detectores de ionización de llama en algunas configuraciones.
   - **Nitrógeno (N2)**: Bajo coste; menor eficiencia (óptimo a ~10 cm/s → muy lento para uso práctico); solo recomendado para métodos simples o equipos antiguos.
2. **Establecer el caudal o velocidad lineal**:
   - Para columnas de 0.25 mm id: velocidad lineal 25–35 cm/s (He) o 40–55 cm/s (H2)
   - Para columnas de 0.32 mm id: velocidad lineal 25–40 cm/s (He)
   - Para columnas de 0.53 mm id (megabore): velocidad lineal 15–20 cm/s
3. **Presión vs. caudal constante**: El modo de caudal constante (control electrónico de presión, EPC) mantiene el caudal estable durante los cambios de temperatura, lo que mejora la reproducibilidad de los tiempos de retención.

**Esperado:** Gas portador seleccionado con velocidad lineal inicial y modo de control especificados.

**En caso de fallo:** Si He no está disponible, H2 es una alternativa válida con velocidades más altas; si se usa H2, verificar los protocolos de seguridad del laboratorio y la compatibilidad del detector.

### Paso 4: Seleccionar y Configurar el Detector

Elegir el detector adecuado para los analitos y la sensibilidad requerida:

1. **FID (detector de ionización de llama)**:
   - Universal para compuestos orgánicos con C–H (no responde a agua, CO2, N2)
   - Rango lineal: 10⁷; LOD: 1–10 pg de carbono
   - Caudales de gas: H2 30–40 mL/min, aire 300–400 mL/min
   - Temperatura: 25–50°C por encima del punto de ebullición máximo (min 300°C)
2. **TCD (detector de conductividad térmica)**:
   - Universal (responde a todos los compuestos incluyendo H2O, CO2, gases permanentes)
   - Menor sensibilidad que FID (LOD ~ng); usa He como gas de referencia
   - Para análisis de gases permanentes, disolventes en alta concentración o aditivos alimentarios
3. **ECD (detector de captura de electrones)**:
   - Muy selectivo y sensible para halogenados, pesticidas, PCBs (LOD fg-pg)
   - Rango lineal estrecho (10⁴); requiere gas de purga de N2 o Ar/CH4
   - Regulado: requiere fuente radiactiva (63Ni) y licencia especial
4. **MS (espectrometría de masas, GC-MS)**:
   - Universal y da información estructural; confirma identidad por espectro de masas
   - Modos: full scan (identificación de desconocidos) o SIM/MRM (cuantificación de bajo nivel)
   - Temperatura de la línea de transferencia: igual o superior a la temperatura final del horno

**Esperado:** Detector seleccionado con sus parámetros de configuración (temperaturas, caudales de gas) especificados.

**En caso de fallo:** Si la sensibilidad del FID no es suficiente para los niveles requeridos, pasar a GC-MS en modo SIM o a un detector selectivo (ECD, NPD) apropiado para la clase de analitos.

### Paso 5: Validar el Método y Optimizar

Verificar la separación y optimizar los parámetros:

1. **Inyectar una mezcla estándar** de todos los analitos objetivo a concentración media del rango de trabajo.
2. **Verificar la resolución**: Rs = 2(t_R2 – t_R1) / (w_b1 + w_b2) ≥ 1.5 entre picos críticos. Si Rs < 1.5, ajustar: reducir la velocidad de rampa, cambiar la columna o modificar la temperatura inicial.
3. **Verificar la eficiencia de la columna**: N = 5.54 × (t_R / w_0.5)² ≥ 50 000–100 000 platos para una columna nueva de 30 m.
4. **Construir la curva de calibración**: 5–7 puntos en el rango de trabajo previsto; verificar linealidad (R² ≥ 0.9995); calcular el LOD y el LOQ.
5. **Verificar la reproducibilidad**: Inyectar 6 veces el mismo estándar; CV de tiempos de retención < 0.5%; CV de áreas de pico < 2%.

**Esperado:** Método validado con resolución ≥ 1.5 entre todos los pares de picos críticos, linealidad demostrada y reproducibilidad verificada.

**En caso de fallo:** Si la resolución es insuficiente entre picos críticos, primero intentar reducir la temperatura inicial o la velocidad de rampa. Si esto no es suficiente, probar una fase estacionaria de diferente polaridad o selectividad.

## Validación

- [ ] La fase estacionaria de la columna es apropiada para la polaridad de los analitos
- [ ] El programa de temperatura incluye temperaturas de inyector, horno y detector
- [ ] El gas portador y la velocidad lineal están especificados con el modo de control
- [ ] El detector seleccionado es apropiado para la clase de analitos y la sensibilidad requerida
- [ ] Rs ≥ 1.5 para todos los pares de picos críticos en la mezcla estándar
- [ ] La curva de calibración muestra linealidad con R² ≥ 0.9995
- [ ] La reproducibilidad de tiempos de retención muestra CV < 0.5%

## Errores Comunes

- **Temperatura del inyector demasiado alta para compuestos sensibles al calor**: Las temperaturas de inyector > 250°C pueden degradar pesticidas organofosfados, terpenos y muchos compuestos naturales. Usar splitless con temperatura de inyector moderada y rampa lenta de horno.
- **Ignorar el tiempo de sangrado de la columna**: Toda columna sangra algo de fase estacionaria a alta temperatura. El sangrado contribuye al ruido de fondo en FID y puede dar picos fantasma en GC-MS. Usar el mínimo de temperatura final necesario.
- **No equilibrar la columna antes de inyectar**: Una columna nueva o recién instalada requiere acondicionamiento (hornear a temperatura máxima durante 1–2 horas con flujo de gas portador) para estabilizar la línea base.
- **Caudal de gas mal ajustado en el inyector split**: Un ratio de split demasiado bajo puede sobrecargar la columna; demasiado alto reduce la sensibilidad. Optimizar el split ratio para la concentración de la muestra.
- **No compensar los cambios de temperatura en tiempos de retención**: En métodos con temperatura programada, los tiempos de retención son muy sensibles a la velocidad de rampa y a la temperatura inicial. Documentar exactamente las condiciones para garantizar la transferibilidad del método.

## Habilidades Relacionadas

- `interpret-chromatogram` — interpretar los cromatogramas obtenidos con el método desarrollado
- `troubleshoot-separation` — diagnosticar y corregir problemas de separación GC
- `validate-analytical-method` — validar formalmente el método GC desarrollado
