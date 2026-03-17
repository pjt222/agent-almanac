---
name: troubleshoot-separation
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Diagnosticar y resolver problemas de separación cromatográfica en GC y HPLC,
  incluyendo resolución insuficiente, forma de pico deficiente, problemas de
  línea base, pérdida de presión, contaminación de columna y pérdida de
  eficiencia. Usar cuando un método cromatográfico deja de funcionar
  correctamente, cuando se observe degradación progresiva del rendimiento a lo
  largo del tiempo, cuando aparezcan picos extra o artefactos inesperados, o
  cuando el método no cumpla los criterios de aceptación durante la validación.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: chromatography
  complexity: intermediate
  language: natural
  tags: chromatography, troubleshooting, peak-shape, resolution, column, HPLC, GC
---

# Resolver Problemas de Separación

Diagnosticar sistemáticamente y resolver los problemas de separación cromatográfica en GC y HPLC mediante la identificación de la causa raíz a partir de los síntomas observados en el cromatograma y en el sistema instrumental.

## Cuándo Usar

- Un método cromatográfico previamente válido muestra degradación de rendimiento
- Los picos muestran cola, frente, anchura excesiva o división
- La línea base es inestable, ruidosa o presenta una deriva persistente
- La presión del sistema es anormalmente alta o baja (HPLC)
- Aparecen picos extra o los picos esperados desaparecen
- El método falla los criterios de aceptación durante la validación o el control de calidad

## Entradas

- **Requerido**: Descripción detallada del problema observado (síntoma específico con los parámetros afectados)
- **Requerido**: Cromatograma mostrando el problema frente al cromatograma de referencia (si está disponible)
- **Requerido**: Condiciones del método (columna, fase móvil/gas portador, programa de temperatura/gradiente)
- **Opcional**: Historial de uso de la columna y mantenimiento del sistema
- **Opcional**: Información sobre la muestra (concentración, disolvente, complejidad de la matriz)

## Procedimiento

### Paso 1: Identificar y Clasificar el Síntoma

Categorizar el problema observado para guiar el diagnóstico:

1. **Problemas de forma de pico**:
   - Cola (tailing, As > 1.5): Interacción secundaria con la fase estacionaria, sitios activos en la columna, pH incorrecto, columna vieja o dañada
   - Frente (fronting, As < 0.8): Sobrecarga de columna, efecto de disolvente de la muestra, extracolumna
   - Pico dividido: Obstrucción parcial de la columna, contaminación de la frita, efecto de disolvente
   - Pico muy ancho: Efecto extracolumna, eficiencia de columna degradada, temperatura demasiado baja (GC)
2. **Problemas de resolución**:
   - Resolución insuficiente entre picos críticos: Selectividad o eficiencia inadecuadas
   - Picos que co-eluyen: Cambio en la selectividad de la fase móvil, degradación de la columna, cambio de pH
3. **Problemas de línea base**:
   - Deriva ascendente: Equilibrado incompleto (HPLC gradiente), sangrado de columna (GC a alta temperatura)
   - Ruido: Interferencia eléctrica, contaminación de la fase móvil, burbujas en el flujo
   - Picos de fantasma/fantasma: Contaminantes de inyecciones anteriores, efecto de memoria
4. **Problemas de presión (HPLC)**:
   - Presión alta: Obstrucción en columna, frita, tubing o válvulas
   - Presión baja o variable: Fuga en el sistema, problema con la bomba, burbujas

**Esperado:** Clasificación del problema con el síntoma específico documentado, referenciando los parámetros cuantitativos afectados (Rs, As, N, presión).

**En caso de fallo:** Si el problema no encaja claramente en ninguna categoría, describir el síntoma en términos de los parámetros cromatográficos observados y comparar el cromatograma actual con el de referencia.

### Paso 2: Aislar la Causa mediante Tests Diagnósticos

Aplicar pruebas de diagnóstico sistemáticas para localizar la causa raíz:

1. **Test con estándar puro** (para problemas de forma de pico y resolución):
   - Inyectar un estándar simple puro en condiciones idénticas. Si la forma de pico del estándar es buena pero la muestra muestra problemas, la causa es la muestra (efecto de matriz, interacción química).
   - Si el estándar también muestra problemas, la causa es el sistema (columna, fase móvil, instrumento).
2. **Test sin columna** (para problemas de presión en HPLC):
   - Desconectar la columna y medir la presión del sistema. Si la presión sigue alta, la obstrucción está en el sistema (precolumna, tubing, válvulas, inyector).
   - Si la presión cae a cero, la obstrucción está en la columna.
3. **Test de eficiencia con compuesto de prueba** (para evaluar la columna):
   - En HPLC: inyectar uracilo (t_M) y un compuesto de prueba estándar (naftaleno en RP, acetofenona). Calcular N. Comparar con la eficiencia original de la columna.
   - En GC: inyectar una mezcla de n-alcanos para calcular la altura equivalente a un plato teórico (HETP) y el número de platos.
4. **Test de selectividad** (para problemas de resolución):
   - Cambiar el pH de la fase móvil ± 0.5 unidades. Si la resolución cambia, la causa es la ionización de los analitos.
   - Cambiar el modificador orgánico (ACN→MeOH o viceversa). Si la resolución cambia, hay diferencias de selectividad.

**Esperado:** Resultado de los tests diagnósticos que confirma si el problema está en la columna, el sistema instrumental, o la muestra/fase móvil.

**En caso de fallo:** Si los tests diagnósticos son inconcluyentes, proceder a una revisión sistemática de todos los componentes del sistema (bomba, inyector, columna, detector) en orden desde la muestra hasta el detector.

### Paso 3: Resolver Problemas de Forma de Pico

Implementar soluciones específicas según el tipo de problema de forma:

1. **Para cola en bases (compuestos básicos)**:
   - Reducir el pH de la fase móvil a 2–3 (protona las bases, suprime la ionización y las interacciones con silanoles residuales)
   - Usar una columna C18 de alta pureza o con polar-embedding (menos silanoles activos)
   - Añadir un modificador básico a la fase móvil (0.05–0.1% trietilamina) como supresor de silanoles
2. **Para cola en ácidos**:
   - Aumentar el pH de la fase móvil a 6–7 (ioniza los ácidos débiles → menor retención, mejor forma de pico)
   - Verificar que la temperatura de columna es estable
3. **Para frente (fronting)**:
   - Reducir la cantidad de muestra inyectada (sobrecarga de columna)
   - Disolver la muestra en un disolvente de menor fuerza eluotrópica que la fase móvil inicial
4. **Para picos divididos**:
   - Comprobar la frita del inyector y la precolumna por obstrucción parcial
   - Si el problema es el efecto del disolvente: disolver la muestra en fase móvil inicial o en un disolvente más débil

**Esperado:** Solución implementada con mejora verificada en los parámetros de forma de pico (As objetivo 0.9–1.2).

**En caso de fallo:** Si la cola persiste después de ajustar el pH y cambiar la columna, el problema puede ser quelación con trazas de metales. Usar EDTA en la fase móvil (0.1 mM) o una columna con fase estacionaria de baja retención metálica.

### Paso 4: Resolver Problemas de Línea Base y Presión

Diagnosticar y corregir los problemas de fondo y del sistema:

1. **Para deriva de línea base en gradiente HPLC**:
   - Asegurar que los solventes A y B tienen el mismo tipo y concentración de tampón
   - Aumentar el tiempo de re-equilibrado entre inyecciones (mínimo 5–10 volúmenes de columna)
   - Verificar que la fase móvil está completamente desgasificada
2. **Para ruido de alta frecuencia en HPLC**:
   - Comprobar las burbujas en el fluido (sonido de chasquido): desinflar, usar desgasificador en línea
   - Verificar las conexiones eléctricas del detector y la toma de tierra
3. **Para presión HPLC alta**:
   - Primero: reemplazar la precolumna (guarda-columna) — es la causa más frecuente
   - Segundo: limpiar el inyector con disolvente fuerte
   - Tercero: intentar la limpieza de la columna (back-flush si el fabricante lo permite)
   - Cuarto: reemplazar la columna si la presión sigue alta
4. **Para picos extra o de memoria**:
   - En GC: aumentar el tiempo de retención a temperatura alta (post-run bake-out)
   - En HPLC: aumentar el tiempo de lavado con disolvente fuerte al final del gradiente
   - Verificar la limpieza del inyector y las agujas de jeringa

**Esperado:** Problema de línea base o presión resuelto con los parámetros del sistema restaurados a los valores de referencia.

**En caso de fallo:** Si la presión HPLC sigue alta después de reemplazar la precolumna y limpiar el inyector, la frita del extremo de entrada de la columna puede estar obstruida. Si el fabricante no permite la limpieza con flujo inverso, la columna debe reemplazarse.

### Paso 5: Evaluar y Regenerar o Reemplazar la Columna

Determinar el estado de la columna y las acciones correctivas apropiadas:

1. **Calcular la degradación de eficiencia**: Comparar el N actual con el N original de la columna (del certificado de análisis o de la primera caracterización). Pérdida de N > 30% indica degradación significativa.
2. **Intentar la regeneración de la columna HPLC**:
   - Lavar con 20 volúmenes de columna de disolvente fuerte (100% ACN o MeOH)
   - Para columnas C18 con depósitos de proteínas o lípidos: lavar con isopropanol, luego hexano, luego re-equilibrar con fase móvil acuosa
   - Para eliminar metales (causa de cola de bases): lavar con EDTA 0.1 M, luego agua, luego re-equilibrar
3. **Criterios para reemplazar la columna**: Reemplazar la columna si: N < 50% del valor original, la forma de pico no mejora con la regeneración, o la presión sigue siendo demasiado alta después de las acciones correctivas.
4. **Registrar el historial de la columna**: Documentar el número de inyecciones, los tipos de muestra, los procedimientos de limpieza y el rendimiento a lo largo del tiempo para predecir la vida útil y planificar los reemplazos.

**Esperado:** Decisión documentada de regeneración o reemplazo de columna con el fundamento en los parámetros de rendimiento medidos.

**En caso de fallo:** Si la regeneración de la columna restaura el rendimiento solo temporalmente, la causa raíz puede ser la muestra (impurezas que contaminan la columna). Implementar una precolumna de sacrificio o mejorar la preparación de la muestra.

## Validación

- [ ] El problema ha sido clasificado y documentado con parámetros cuantitativos
- [ ] Se realizaron tests diagnósticos para aislar la causa raíz (sistema vs. columna vs. muestra)
- [ ] La solución implementada ha mejorado el parámetro afectado hasta los criterios de aceptación
- [ ] Se verificó con un cromatograma de control después de la intervención
- [ ] Las acciones correctivas y los resultados están documentados en el registro de mantenimiento

## Errores Comunes

- **Cambiar múltiples parámetros simultáneamente**: Cambiar al mismo tiempo la columna, el pH y el gradiente hace imposible identificar qué cambio resolvió el problema. Cambiar un parámetro a la vez.
- **No verificar el sistema antes de culpar a la columna**: La mayoría de los problemas de alta presión en HPLC son debidos a la precolumna o al inyector, no a la columna principal. Siempre verificar el sistema primero.
- **Ignorar el historial de la columna**: Una columna con 5000 inyecciones de muestras complejas de proteínas tiene una vida útil agotada. Registrar el número y tipo de inyecciones desde el inicio del uso de la columna.
- **Aplicar soluciones de GC a problemas de HPLC y viceversa**: Los mecanismos de degradación son diferentes. Las soluciones de forma de pico en GC (temperatura más alta, columna más corta) no aplican directamente a HPLC.
- **No filtrar las muestras antes de la inyección**: Las partículas en la muestra obstruyen la frita de la precolumna y la columna. Filtrar siempre a través de filtros de 0.2–0.45 μm antes de inyectar.

## Habilidades Relacionadas

- `interpret-chromatogram` — diagnosticar problemas a partir del cromatograma antes de aplicar soluciones
- `develop-gc-method` y `develop-hplc-method` — rediseñar el método si la solución requiere cambios fundamentales
- `validate-analytical-method` — re-validar el método después de las acciones correctivas
