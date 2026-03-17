---
name: prove-geometric-theorem
description: >
  Demostrar teoremas geométricos usando métodos euclidianos de prueba
  (directo, por contradicción, por contraejemplo), geometría analítica,
  y transformaciones. Cubre la selección de axiomas, lemas y teoremas
  conocidos; la construcción de líneas auxiliares; y la escritura de
  pruebas rigurosas paso a paso con justificación de cada inferencia.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: intermediate
  language: natural
  tags: geometry, proofs, euclidean, theorems, reasoning
---

# Demostrar Teorema Geométrico

Demostrar un teorema geométrico seleccionando un método de prueba apropiado (directo, por contradicción, por coordenadas, por transformación), identificando los axiomas, definiciones y teoremas previos necesarios, construyendo líneas o puntos auxiliares cuando sea necesario, y escribiendo una demostración rigurosa paso a paso donde cada inferencia está justificada.

## Cuándo Usar

- Demostrar propiedades de triángulos (congruencia, semejanza, puntos notables)
- Demostrar propiedades de círculos (ángulos inscritos, potencia de un punto, tangentes)
- Demostrar propiedades de cuadriláteros y polígonos
- Verificar que una construcción con regla y compás produce el resultado afirmado
- Demostrar desigualdades geométricas o relaciones de proporcionalidad

## Entradas

- **Requerido**: Enunciado del teorema a demostrar (hipótesis y conclusión claramente separadas)
- **Requerido**: Sistema axiomático (geometría euclidiana plana, por defecto)
- **Opcional**: Sugerencia de método de prueba preferido
- **Opcional**: Teoremas conocidos que se pueden usar sin demostración

## Procedimiento

### Paso 1: Analizar el Enunciado del Teorema

Descomponer el teorema en hipótesis y conclusión, y evaluar las estrategias de prueba:

1. **Separar hipótesis y conclusión**: Escribir explícitamente qué se asume (dado) y qué se debe demostrar.
2. **Identificar objetos geométricos**: Listar todos los puntos, líneas, círculos, ángulos y regiones mencionados.
3. **Dibujar una figura**: Crear un diagrama preciso que represente las hipótesis. Incluir todas las relaciones dadas. Un buen diagrama sugiere la estrategia de prueba.
4. **Evaluar métodos de prueba**:
   - **Prueba directa**: Deducir la conclusión de las hipótesis usando una cadena de implicaciones.
   - **Prueba por contradicción**: Asumir la negación de la conclusión y derivar una contradicción.
   - **Prueba por coordenadas**: Colocar la figura en un sistema de coordenadas y usar álgebra.
   - **Prueba por transformación**: Mostrar que una transformación geométrica (reflexión, rotación, homotecia) mapea una parte de la figura en otra.
5. **Identificar herramientas necesarias**: Listar teoremas, axiomas y definiciones que se necesitarán (p.ej., criterios de congruencia LAL/LLL/ALA, teorema de Tales, teorema del ángulo inscrito).

**Esperado:** Hipótesis y conclusión claramente separadas, figura dibujada, y método de prueba seleccionado con justificación.

**En caso de fallo:** Si ningún método parece conducir a la demostración, buscar construcciones auxiliares (líneas, puntos, círculos adicionales no mencionados en el enunciado) que revelen relaciones ocultas. Las construcciones auxiliares más comunes: trazar alturas, bisectrices, medianas; extender líneas; conectar puntos no adyacentes.

### Paso 2: Construir la Demostración

Escribir la demostración paso a paso con justificación rigurosa:

1. **Formato de dos columnas** (para claridad):
   - Columna izquierda: afirmación
   - Columna derecha: justificación (axioma, definición, teorema, o paso anterior)
2. **Reglas de inferencia válidas**: Cada paso debe seguir de los pasos anteriores por:
   - Aplicación directa de un axioma o definición
   - Aplicación de un teorema previamente demostrado o dado como conocido
   - Sustitución algebraica
   - Transitividad de igualdad o congruencia
3. **Construcciones auxiliares**: Si se requieren, introducirlas al principio de la prueba con justificación de su existencia (p.ej., "Sea M el punto medio de AB; existe por el teorema de bisectriz perpendicular").
4. **Encadenar razonamiento**: Conectar las hipótesis con la conclusión a través de pasos intermedios, asegurando que no haya saltos lógicos.
5. **Concluir**: Declarar explícitamente que la conclusión se ha demostrado.

```markdown
## Demostración

| Paso | Afirmación | Justificación |
|------|-----------|---------------|
| 1 | [hipótesis dada] | Dado |
| 2 | [inferencia] | [razón] |
| 3 | [inferencia] | [razón] |
| ... | ... | ... |
| n | [conclusión] | [razón] |

QED
```

**Esperado:** Una cadena completa de razonamiento desde las hipótesis hasta la conclusión, donde cada paso está justificado.

**En caso de fallo:** Si la prueba se estanca (no se puede avanzar), considerar: (1) un método de prueba diferente, (2) un lema intermedio que simplifique el problema, (3) una construcción auxiliar que revele la estructura necesaria. Si el teorema resulta ser falso, buscar un contraejemplo.

### Paso 3: Verificar la Demostración

Validar que la demostración es correcta y completa:

1. **Verificar cada paso**: Releer cada inferencia y confirmar que la justificación citada realmente implica la afirmación.
2. **Verificar completitud**: Asegurar que no se omitieron casos. Si la prueba distingue casos (p.ej., ángulo agudo vs. obtuso), verificar que todos los casos están cubiertos.
3. **Verificar independencia de la figura**: La demostración no debe depender de propiedades específicas del diagrama que no estén en las hipótesis. Una prueba que funciona solo para triángulos acutángulos cuando el teorema afirma "para todo triángulo" es incompleta.
4. **Verificación numérica**: Tomar un ejemplo numérico específico que satisfaga las hipótesis y verificar que la conclusión se cumple. Esto no reemplaza la prueba pero detecta errores.
5. **Verificar el uso correcto de teoremas**: Confirmar que las condiciones de cada teorema citado están satisfechas (p.ej., el criterio LAL requiere que el ángulo esté entre los dos lados dados).

**Esperado:** La demostración está verificada como correcta, completa y libre de dependencias de la figura.

**En caso de fallo:** Si se encuentra un error, corregirlo. Si se descubre que la prueba depende de la figura, generalizar o agregar los casos faltantes. Si la verificación numérica contradice la conclusión, el teorema puede ser incorrecto -- buscar un contraejemplo formal.

## Validación

- [ ] Hipótesis y conclusión están claramente separadas
- [ ] El método de prueba es apropiado para el tipo de teorema
- [ ] Cada paso de la demostración está justificado por un axioma, definición o teorema
- [ ] No hay saltos lógicos (cada paso sigue del anterior)
- [ ] Las construcciones auxiliares están justificadas en su existencia
- [ ] Todos los casos están cubiertos (no hay omisiones)
- [ ] La demostración no depende de propiedades específicas de la figura
- [ ] Un ejemplo numérico confirma la conclusión

## Errores Comunes

- **Asumir lo que se quiere demostrar**: Usar la conclusión (directa o indirectamente) como parte del razonamiento es una falacia circular. Verificar que la conclusión no aparece antes del último paso.
- **Dependencia de la figura**: Asumir que un punto está "dentro" del triángulo porque así se ve en el diagrama, sin demostrarlo. Las pruebas deben funcionar para todas las configuraciones válidas, no solo la dibujada.
- **Aplicar teoremas sin verificar condiciones**: El criterio de congruencia LAL requiere que el ángulo dado sea el ángulo incluido entre los dos lados. Citar LAL cuando el ángulo no está incluido es un error.
- **Olvidar el caso de igualdad**: Si el teorema afirma ">=", la prueba debe cubrir tanto ">" como "=". Omitir el caso de igualdad es una omisión común.
- **Confundir necesidad y suficiencia**: Demostrar que A implica B no demuestra que B implica A. Verificar la dirección de la implicación en cada paso.
- **No justificar las construcciones auxiliares**: Afirmar "sea P el punto de intersección de las líneas l1 y l2" requiere demostrar que l1 y l2 no son paralelas (es decir, que la intersección existe).

## Habilidades Relacionadas

- `construct-geometric-figure` -- construir las figuras cuyas propiedades se demuestran aquí
- `solve-trigonometric-problem` -- resolver las ecuaciones trigonométricas que surgen en pruebas por coordenadas
- `argumentation` -- técnicas generales de razonamiento lógico aplicables a pruebas geométricas
