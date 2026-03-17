---
name: interpret-chromatogram
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Interpretar cromatogramas de GC o HPLC para identificar picos, evaluar la
  calidad de la separación, detectar problemas de integración, cuantificar
  analitos y diagnosticar artefactos. Usar cuando se evalúe la calidad de una
  separación cromatográfica, se identifiquen picos desconocidos, se verifique
  la identidad de analitos por tiempo de retención o espectro, se cuantifiquen
  analitos mediante curvas de calibración o estándar interno, o se detecten
  problemas instrumentales a partir del perfil del cromatograma.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, interpretation, peak-integration, quantification, retention-time
---

# Interpretar Cromatograma

Extraer información cualitativa y cuantitativa de cromatogramas de GC y HPLC mediante la evaluación de la calidad de la separación, la identificación de picos, la verificación de la integración y la cuantificación de analitos.

## Cuándo Usar

- Evaluar la calidad de una separación cromatográfica (resolución, eficiencia, forma de pico)
- Identificar picos por comparación de tiempos de retención con estándares o espectros de referencia
- Cuantificar analitos usando curvas de calibración externas o estándar interno
- Detectar problemas instrumentales o de muestra a partir del perfil del cromatograma
- Verificar la pureza de un pico en métodos HPLC-DAD

## Entradas

- **Requerido**: Cromatograma (señal del detector frente al tiempo)
- **Requerido**: Tipo de análisis (GC o HPLC) y método utilizado
- **Opcional**: Estándares de referencia con tiempos de retención conocidos
- **Opcional**: Datos de calibración para cuantificación
- **Opcional**: Espectros de pico (DAD para HPLC, MS para GC-MS o LC-MS)

## Procedimiento

### Paso 1: Evaluar la Calidad General del Cromatograma

Antes de interpretar picos individuales, realizar una evaluación global:

1. **Verificar la línea base**: Debe ser estable y plana en ausencia de picos. Una línea base con deriva (ascendente/descendente) indica: en GC → sangrado de columna o temperatura demasiado alta; en HPLC → sistema no equilibrado o contaminación de la fase móvil.
2. **Evaluar el ruido de la línea base**: Ruido regular periódico → interferencia eléctrica o bomba; ruido aleatorio alto → problemas de detector o muestra. El ruido debe ser < 1% de la señal del pico más pequeño de interés.
3. **Verificar la presencia del pico del disolvente o frente de disolvente**: En GC, el pico del disolvente debe aparecer al principio, bien separado de los analitos. En HPLC, el frente de disolvente (tiempo muerto t0) no debe solapar con el primer pico de analito.
4. **Comprobar que todos los picos esperados están presentes**: Comparar con el cromatograma de referencia o la mezcla estándar. Picos ausentes pueden indicar problemas de preparación de muestra, inyección o pérdidas en el sistema.
5. **Detectar picos inusuales**: Picos extra, hombros o picos muy anchos pueden indicar impurezas, productos de degradación o problemas del sistema.

**Esperado:** Evaluación documentada de la calidad del cromatograma con la línea base y el ruido evaluados, y todos los picos esperados identificados.

**En caso de fallo:** Si la calidad del cromatograma es inaceptable (línea base inestable, picos deformados), investigar y corregir el problema instrumental antes de continuar con la interpretación.

### Paso 2: Identificar y Asignar Picos

Confirmar la identidad de los picos cromatográficos:

1. **Comparar tiempos de retención con estándares**: La identidad se confirma cuando el t_R del analito en la muestra coincide con el t_R del estándar puro dentro de ± 0.5% (GC) o ± 0.2 min (HPLC) en las mismas condiciones de análisis.
2. **Calcular el factor de retención k'** (o factor de capacidad k):
   - k' = (t_R – t_0) / t_0, donde t_0 es el tiempo muerto
   - k' debe estar entre 2 y 10 para picos bien retenidos y apropiadamente separados
   - Compuestos con k' < 1 pueden coincidir con el frente del disolvente
3. **Confirmar identidad por espectro (si se dispone de detector espectral)**:
   - GC-MS: Comparar el espectro de masas del pico con la biblioteca NIST; un match score > 85 es indicativo, > 95 es confirmatorio
   - HPLC-DAD: Comparar el espectro UV con el del estándar; una coincidencia del espectro normalizado > 99% confirma pureza espectral
   - HPLC-MS: Verificar el ion molecular y los fragmentos diagnóstico
4. **Documentar picos sin identificar**: Picos no identificados deben documentarse con su t_R y área relativa; si su abundancia supera el 0.1% del área total, investigar su origen.

**Esperado:** Tabla de asignación de picos con t_R, k', identidad confirmada y, si aplica, score de coincidencia espectral.

**En caso de fallo:** Si los tiempos de retención de la muestra y el estándar no coinciden, verificar que el método y las condiciones son idénticos. Diferencias en pH de fase móvil, temperatura o lote de columna pueden desplazar t_R.

### Paso 3: Evaluar la Calidad de la Separación

Cuantificar el rendimiento cromatográfico:

1. **Calcular la resolución Rs**:
   - Rs = 2 × (t_R2 – t_R1) / (w_b1 + w_b2), donde w_b es el ancho de pico en la base
   - Rs ≥ 1.5 indica separación de línea base; Rs ≥ 1.0 indica separación parcial (picos solapados en < 1%)
2. **Calcular la eficiencia de la columna N** (platos teóricos):
   - N = 16 × (t_R / w_b)² o N = 5.54 × (t_R / w_0.5)²
   - Valores típicos: N ≥ 50 000 para columna de 30 m GC; N ≥ 10 000 para columna HPLC de 150 mm
3. **Evaluar la simetría del pico (factor de cola)**:
   - As = b / a donde a es la distancia del frente al máximo y b la distancia del máximo a la cola, ambas medidas al 10% de la altura
   - As ideal: 0.9–1.2; As > 2.0 indica colas (tailing) por adsorción secundaria; As < 0.7 indica frentes (fronting) por sobrecarga o efecto de solvente
4. **Identificar pares de picos críticos**: El par de picos con Rs mínima determina la adecuación de la separación para su propósito. Documentar Rs para cada par de picos adyacentes.

**Esperado:** Tabla de parámetros de rendimiento (Rs, N, As) para todos los picos principales, con identificación del par de picos críticos.

**En caso de fallo:** Si Rs < 1.5 entre picos críticos, implementar las acciones correctivas recomendadas en la skill `troubleshoot-separation`.

### Paso 4: Verificar y Corregir la Integración

La integración automática requiere verificación manual:

1. **Comprobar las líneas de integración**: El software de integración puede cometer errores con picos solapados, picos sobre hombros o líneas base con deriva. Verificar visualmente que las líneas de integración tienen sentido físico.
2. **Integrar picos solapados**: Usar la función de tangente o de gaussiana del software para separar picos que no están completamente resueltos. Si Rs > 0.8, la integración tangente puede separar las áreas con < 5% de error.
3. **Verificar la integración de picos pequeños**: Los picos cuya altura es < 5× el ruido de la línea base deben integrarse manualmente si el resultado cuantitativo es crítico.
4. **Documentar las modificaciones de integración**: Cualquier cambio manual de la integración automática debe documentarse con justificación en el registro analítico.
5. **Consistencia de integración**: Los mismos parámetros de integración (ancho mínimo de pico, sensibilidad) deben aplicarse a todos los cromatogramas de una serie de análisis para garantizar la comparabilidad.

**Esperado:** Informe de integración verificado con todas las áreas de pico revisadas y las modificaciones manuales documentadas.

**En caso de fallo:** Si un pico no puede integrarse correctamente por solapamiento severo (Rs < 0.5), la cuantificación no es fiable con integración estándar. Recurrir a deconvolución matemática de picos o mejorar la separación cromatográfica.

### Paso 5: Cuantificar Analitos

Calcular las concentraciones de los analitos a partir de las áreas de pico integradas:

1. **Calibración externa**: Preparar 5–7 estándares en el rango de trabajo; graficar área vs. concentración; verificar linealidad (R² ≥ 0.9995). Calcular la concentración de la muestra por interpolación en la curva.
2. **Estándar interno**: Añadir una cantidad conocida de un compuesto similar (mismo grupo funcional, t_R diferente, no presente en la muestra) a la muestra y al estándar. La ratio área_analito/área_estándar_interno compensa variaciones de inyección.
3. **Normalización por área**: Suma de todas las áreas de pico = 100%; calcular la proporción de cada componente. Válido solo cuando todos los componentes tienen respuesta similar al detector (mismo grupo funcional en GC-FID, mismo cromóforo en HPLC-UV).
4. **Estándar de adición**: Agregar cantidades conocidas del analito a la muestra para construir la curva de calibración en la misma matriz. Compensa efectos de matriz. Requiere al menos 3 niveles de adición.
5. **Propagar la incertidumbre**: Incluir la incertidumbre de calibración, de integración y de preparación de muestra en el resultado final.

**Esperado:** Resultado cuantitativo con concentración, unidades, incertidumbre expandida y trazabilidad al método de calibración utilizado.

**En caso de fallo:** Si la curva de calibración no es lineal (R² < 0.999), investigar: exceso de concentración (salir del rango lineal del detector), efecto de matriz, o variabilidad en la preparación de estándares. Considerar calibración con función cuadrática o ampliar el número de puntos de calibración.

## Validación

- [ ] La línea base y el ruido del cromatograma son aceptables para el análisis
- [ ] Todos los picos de interés están identificados con sus t_R y k'
- [ ] La resolución Rs ≥ 1.5 entre todos los pares de picos críticos
- [ ] La integración ha sido verificada visualmente y documentada
- [ ] La curva de calibración muestra R² ≥ 0.9995 en el rango de trabajo
- [ ] Los resultados cuantitativos incluyen las unidades y la incertidumbre

## Errores Comunes

- **No verificar la integración automática**: El software de integración puede asignar líneas de integración incorrectas, especialmente en picos solapados o en líneas base con deriva. La verificación visual es obligatoria.
- **Comparar tiempos de retención absolutos entre días diferentes**: Los t_R varían con la temperatura, el lote de columna y el pH de la fase móvil. Usar tiempos de retención relativos al estándar interno o al patrón de referencia en la misma corrida.
- **Usar normalización por área cuando los factores de respuesta son diferentes**: En HPLC-UV, compuestos con diferente ε dan áreas muy distintas para la misma concentración. La normalización por área solo es válida cuando todos los analitos tienen respuesta equivalente.
- **Ignorar el efecto de matriz en la cuantificación**: La matriz de la muestra puede suprimir o potenciar la señal del detector (especialmente en LC-MS con ESI). Si la matriz es compleja, usar estándar de adición o estándar interno análogo.
- **Asignar picos solo por tiempo de retención**: Un pico en el mismo t_R que un estándar no siempre es el mismo compuesto. Confirmar siempre por espectro (MS o DAD) cuando la identidad sea crítica.

## Habilidades Relacionadas

- `develop-gc-method` y `develop-hplc-method` — desarrollar el método que produce los cromatogramas a interpretar
- `troubleshoot-separation` — resolver problemas de separación identificados durante la interpretación
- `validate-analytical-method` — validar formalmente el método usando los cromatogramas interpretados
