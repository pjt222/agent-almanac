---
name: chrysopoeia
description: >
  Extraer el máximo valor del código existente — optimización de rendimiento,
  refinamiento de superficie de API y eliminación de peso muerto. El arte de
  convertir código base en oro mediante la identificación y amplificación
  sistemática de patrones portadores de valor. Usar al optimizar una base de
  código funcional pero lenta, refinar una superficie de API que ha acumulado
  cruft, reducir el tamaño del bundle o la huella de memoria, o preparar
  código para publicación open-source — cuando el código funciona correctamente
  pero no brilla y necesita pulido en lugar de una reescritura completa.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, optimization, value-extraction, performance, refinement, gold
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Chrysopoeia

Extraer sistemáticamente el máximo valor del código existente — identificar lo que es oro (alto valor, bien diseñado), lo que es plomo (pesado en recursos, mal optimizado) y lo que es escoria (peso muerto). Luego amplificar el oro, transmutar el plomo y eliminar la escoria.

## Cuándo Usar

- Optimizar una base de código funcional pero lenta para mejorar el rendimiento
- Refinar una superficie de API que ha acumulado cruft a lo largo de iteraciones
- Reducir el tamaño del bundle, la huella de memoria o el tiempo de inicio
- Preparar código para publicación open-source (extraer el núcleo valioso)
- Cuando el código funciona correctamente pero no brilla — necesita pulido, no reescritura

## Entradas

- **Requerido**: Base de código o módulo a optimizar (rutas de archivos)
- **Requerido**: Métrica de valor (rendimiento, claridad de API, tamaño del bundle, legibilidad)
- **Opcional**: Datos de perfilado o benchmarks mostrando el rendimiento actual
- **Opcional**: Presupuesto u objetivo (ej., "reducir bundle un 40%", "respuesta sub-100ms")
- **Opcional**: Restricciones (no se puede cambiar la API pública, debe mantener compatibilidad hacia atrás)

## Procedimiento

### Paso 1: Ensayo — Clasificar el material

Clasificar sistemáticamente cada elemento por su contribución de valor.

1. Definir la métrica de valor desde las Entradas (rendimiento, claridad, tamaño, etc.)
2. Inventariar los elementos de la base de código (funciones, módulos, exportaciones, dependencias)
3. Clasificar cada elemento:

```
Value Classification:
+--------+---------------------------------------------------------+
| Gold   | High value, well-designed. Amplify and protect.         |
| Silver | Good value, minor imperfections. Polish.                |
| Lead   | Functional but heavy — poor performance, complex API.   |
|        | Transmute into something lighter.                       |
| Dross  | Dead code, unused exports, vestigial features.          |
|        | Remove entirely.                                        |
+--------+---------------------------------------------------------+
```

4. Para optimización de rendimiento, perfilar primero:
   - Identificar rutas calientes (donde se gasta el tiempo)
   - Identificar rutas frías (código raramente ejecutado que puede ser escoria)
   - Medir patrones de asignación de memoria
5. Producir el **Informe de Ensayo**: clasificación elemento por elemento con evidencia

**Esperado:** Cada elemento significativo clasificado con evidencia. Los elementos de oro están identificados para protección durante la optimización. Los elementos de plomo están priorizados por impacto.

**En caso de fallo:** Si las herramientas de perfilado no están disponibles, usar análisis estático: complejidad de funciones (ciclomática), conteo de dependencias y tamaño de código como indicadores. Si la base de código es demasiado grande, enfocarse en la ruta crítica primero.

### Paso 2: Refinar — Amplificar el oro

Proteger y mejorar los elementos de mayor valor.

1. Para cada elemento de Oro:
   - Asegurar que tiene pruebas exhaustivas (estos son los activos más valiosos)
   - Documentar su interfaz claramente si no se ha hecho ya
   - Considerar si podría extraerse como módulo reutilizable
2. Para cada elemento de Plata:
   - Aplicar mejoras dirigidas (mejor nomenclatura, tipos más claros, optimizaciones menores)
   - Llevar la cobertura de pruebas al nivel de Oro
   - Resolver olores de código menores sin reestructurar
3. No modificar el comportamiento de Oro/Plata — solo mejorar su pulido y protección

**Esperado:** Los elementos de Oro y Plata están mejor probados, documentados y protegidos. Sin cambios de comportamiento, solo mejoras de calidad.

**En caso de fallo:** Si un elemento "Oro" revela problemas ocultos durante una inspección más cercana, reclasificarlo. Es mejor ser honesto sobre el valor que proteger código defectuoso.

### Paso 3: Transmutar — Convertir plomo en oro

Transformar elementos pesados e ineficientes en equivalentes optimizados.

1. Priorizar elementos de Plomo por impacto (mayor consumo de recursos primero)
2. Para cada elemento de Plomo, elegir una estrategia de transmutación:
   - **Optimización de algoritmo**: Reemplazar O(n^2) con O(n log n), eliminar cómputo redundante
   - **Caché/memoización**: Almacenar resultados costosos que se solicitan repetidamente
   - **Evaluación perezosa**: Diferir el cómputo hasta que los resultados sean realmente necesarios
   - **Procesamiento por lotes**: Combinar muchas operaciones pequeñas en menos operaciones grandes
   - **Simplificación estructural**: Reducir complejidad ciclomática, aplanar anidamiento profundo
3. Aplicar la estrategia y medir la mejora:
   - Benchmarks antes/después para cambios de rendimiento
   - Conteo de líneas antes/después para cambios de complejidad
   - Conteo de dependencias antes/después para cambios de acoplamiento
4. Verificar equivalencia de comportamiento después de cada transmutación

**Esperado:** Mejora medible en la métrica de valor objetivo. Cada elemento transmutado rinde mejor que su predecesor de Plomo manteniendo comportamiento idéntico.

**En caso de fallo:** Si un elemento de Plomo resiste la optimización dentro de su interfaz actual, considerar si la interfaz misma es el problema. A veces la transmutación requiere cambiar cómo se llama al elemento, no solo cómo está implementado.

### Paso 4: Purgar — Eliminar la escoria

Eliminar el peso muerto sistemáticamente.

1. Para cada elemento de Escoria, verificar que realmente no se usa:
   - Buscar todas las referencias (grep, búsqueda de usos del IDE)
   - Verificar referencias dinámicas (despacho basado en cadenas, reflexión)
   - Verificar consumidores externos (si el código es una biblioteca)
2. Eliminar la escoria confirmada:
   - Borrar código muerto, exportaciones no usadas, características vestigiales
   - Eliminar dependencias no usadas de los manifiestos de paquetes
   - Limpiar configuración de características eliminadas
3. Verificar que nada se rompe después de cada eliminación (ejecutar pruebas)
4. Documentar lo que se eliminó y por qué (en mensajes de commit, no en código)

**Esperado:** La base de código es más ligera. Tamaño del bundle, conteo de dependencias o volumen de código mediblemente reducidos. Todas las pruebas siguen pasando.

**En caso de fallo:** Si eliminar un elemento rompe algo, no era escoria — reclasificarlo. Si las referencias dinámicas dificultan verificar el uso, agregar registro temporal antes de la eliminación para confirmar que no hay acceso en tiempo de ejecución.

### Paso 5: Verificar — Pesar el oro

Medir la mejora general.

1. Ejecutar los mismos benchmarks/métricas usados en el Paso 1
2. Comparar antes/después en la métrica de valor objetivo
3. Documentar los resultados de la chrysopoeia:
   - Elementos refinados (mejoras de Oro/Plata)
   - Elementos transmutados (conversiones de Plomo a Oro con mediciones)
   - Elementos purgados (Escoria eliminada con impacto en tamaño/conteo)
   - Mejora general de la métrica (ej., "47% más rápido", "32% menos en bundle")

**Esperado:** Mejora medible y documentada en la métrica de valor objetivo. La base de código es demostrablemente más valiosa que antes.

**En caso de fallo:** Si la mejora general es marginal, el código original puede haber sido mejor de lo supuesto. Documentar lo aprendido — saber que el código ya está cerca del óptimo es en sí mismo valioso.

## Validación

- [ ] El informe de ensayo clasifica todos los elementos significativos con evidencia
- [ ] Los elementos de Oro tienen pruebas y documentación exhaustivas
- [ ] Las transmutaciones de Plomo muestran mejora medible antes/después
- [ ] La eliminación de Escoria verificada con revisión de referencias antes de la eliminación
- [ ] Todas las pruebas pasan después de cada etapa
- [ ] La mejora general medida y documentada
- [ ] No se introdujeron regresiones de comportamiento
- [ ] Las restricciones de las Entradas están satisfechas

## Errores Comunes

- **Optimización prematura**: Optimizar sin perfilar. Siempre medir primero, optimizar las rutas calientes
- **Pulir escoria**: Gastar esfuerzo mejorando código que debería ser eliminado. Clasificar antes de refinar
- **Romper el Oro**: Optimización que degrada el mejor código. Los elementos de Oro solo deben mejorar, nunca empeorar
- **Afirmaciones sin medir**: "Se siente más rápido" no es chrysopoeia. Cada mejora debe ser cuantificada
- **Optimizar rutas frías**: Gastar esfuerzo en código que se ejecuta una vez al inicio cuando el cuello de botella es el bucle de solicitudes

## Habilidades Relacionadas

- `athanor` — Transformación completa de cuatro etapas cuando la chrysopoeia revela que el código necesita reestructuración, no solo optimización
- `transmute` — Conversión dirigida cuando un elemento de Plomo necesita un cambio de paradigma
- `review-software-architecture` — Evaluación a nivel de arquitectura que complementa la chrysopoeia a nivel de código
- `review-data-analysis` — La optimización de pipelines de datos es paralela a la optimización de código
