---
name: transmute
description: >
  Transformar una sola función, módulo o estructura de datos de una forma a
  otra preservando su comportamiento esencial. Más ligero que el ciclo completo
  de athanor, adecuado para conversiones específicas donde las formas de entrada
  y salida son bien conocidas. Usar al convertir una función entre lenguajes,
  cambiar un módulo entre paradigmas, migrar un consumidor de API a una nueva
  versión, convertir formatos de datos o reemplazar una dependencia — cuando el
  alcance de la transformación es una sola función, clase o módulo en lugar de
  un sistema completo.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, transmutation, conversion, refactoring, transformation, targeted
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Transmute

Transformar una pieza específica de código o datos de una forma a otra — traducción de lenguaje, cambio de paradigma, conversión de formato o migración de API — preservando el comportamiento y la semántica esenciales.

## Cuándo Usar

- Convertir una función de un lenguaje a otro (Python a R, JavaScript a TypeScript)
- Cambiar un módulo de un paradigma a otro (basado en clases a funcional, callbacks a async/await)
- Migrar un consumidor de API de v1 a v2 de un servicio externo
- Convertir datos entre formatos (CSV a Parquet, REST a esquema GraphQL)
- Reemplazar una dependencia con un equivalente (moment.js a date-fns, jQuery a vanilla JS)
- Cuando el alcance de la transformación es una sola función, clase o módulo (no un sistema completo)

## Entradas

- **Requerido**: Material fuente (ruta de archivo, nombre de función o muestra de datos)
- **Requerido**: Forma objetivo (lenguaje, paradigma, formato o versión de API)
- **Opcional**: Contrato de comportamiento (pruebas, firmas de tipo o pares de E/S esperados)
- **Opcional**: Restricciones (debe mantener compatibilidad hacia atrás, presupuesto de rendimiento)

## Procedimiento

### Paso 1: Analizar el Material Fuente

Comprender exactamente qué hace la fuente antes de intentar la transformación.

1. Leer la fuente completamente — cada rama, caso límite y ruta de error
2. Identificar el **contrato de comportamiento**:
   - ¿Qué entradas acepta? (tipos, rangos, casos límite)
   - ¿Qué salidas produce? (valores de retorno, efectos secundarios, señales de error)
   - ¿Qué invariantes mantiene? (ordenamiento, unicidad, integridad referencial)
3. Catalogar dependencias: ¿qué importa, llama o de qué depende la fuente?
4. Si existen pruebas, leerlas para comprender el comportamiento esperado
5. Si no existen pruebas, escribir pruebas de caracterización del comportamiento antes de transmutar

**Esperado:** Una comprensión completa de qué hace la fuente (no cómo lo hace). El contrato de comportamiento es explícito y verificable.

**En caso de fallo:** Si la fuente es demasiado compleja para una sola transmutación, considerar dividirla en piezas más pequeñas o escalar al procedimiento completo de `athanor`. Si el comportamiento es ambiguo, solicitar aclaración en lugar de adivinar.

### Paso 2: Mapear Fuente a Forma Objetivo

Diseñar el mapeo de transformación.

1. Para cada elemento en la fuente, identificar el equivalente objetivo:
   - Constructos del lenguaje: bucles → map/filter, clases → closures, etc.
   - Llamadas a API: endpoint antiguo → endpoint nuevo, cambios en la forma de request/response
   - Tipos de datos: columnas de data frame → campos de esquema, JSON anidado → tablas planas
2. Identificar elementos **sin equivalente directo**:
   - Características de la fuente ausentes en el objetivo (ej., pattern matching en un lenguaje sin ello)
   - Modismos del objetivo que no existen en la fuente (ej., vectorización de R vs. bucles de Python)
3. Para cada brecha, elegir una estrategia de adaptación:
   - Emular: reproducir el comportamiento con constructos nativos del objetivo
   - Simplificar: si el constructo fuente era una solución alternativa, usar la solución nativa del objetivo
   - Documentar: si el comportamiento cambia ligeramente, anotar la diferencia explícitamente
4. Escribir el **mapa de transformación**: elemento fuente → elemento objetivo, para cada pieza

**Esperado:** Un mapeo completo donde cada elemento fuente tiene un destino objetivo. Las brechas están identificadas y las estrategias de adaptación elegidas.

**En caso de fallo:** Si demasiados elementos carecen de equivalentes directos, la transformación puede ser inapropiada (ej., transmutar un diseño altamente orientado a objetos a un lenguaje sin clases). Reconsiderar la forma objetivo o escalar a `athanor`.

### Paso 3: Ejecutar la Transformación

Escribir la forma objetivo siguiendo el mapa.

1. Crear el/los archivo(s) objetivo con la estructura y el boilerplate apropiados
2. Transmutar cada elemento siguiendo el mapa del Paso 2:
   - Preservar el contrato de comportamiento — las mismas entradas producen las mismas salidas
   - Usar modismos nativos del objetivo en lugar de traducciones literales
   - Mantener o mejorar el manejo de errores
3. Manejar dependencias:
   - Reemplazar dependencias fuente con equivalentes del objetivo
   - Si una dependencia no tiene equivalente, implementar un adaptador mínimo
4. Agregar comentarios en línea solo donde la transformación no fue obvia

**Esperado:** Una implementación objetivo completa que sigue el mapa de transformación. El código se lee como si hubiera sido escrito nativamente en la forma objetivo, no traducido mecánicamente.

**En caso de fallo:** Si un elemento específico resiste la transformación, aislarlo. Transformar todo lo demás primero, luego abordar el elemento resistente con atención enfocada. Si verdaderamente no puede ser transmutado, documentar por qué y proporcionar una solución alternativa.

### Paso 4: Verificar Equivalencia de Comportamiento

Confirmar que la forma transmutada preserva el comportamiento del original.

1. Ejecutar las pruebas del contrato de comportamiento contra la implementación objetivo
2. Para cada caso de prueba, verificar:
   - Mismas entradas → mismas salidas (dentro de la tolerancia aceptable para conversiones numéricas)
   - Mismas condiciones de error → señales de error equivalentes
   - Los efectos secundarios (si los hay) se preservan o se documentan como cambiados
3. Verificar casos límite explícitamente:
   - Manejo de Null/NA/undefined
   - Colecciones vacías
   - Valores límite (max int, cadena vacía, arrays de longitud cero)
4. Si la forma objetivo agrega capacidades (ej., seguridad de tipos), verificar esas también

**Esperado:** Todas las pruebas del contrato de comportamiento pasan. Los casos límite se manejan de manera equivalente. Cualquier diferencia de comportamiento está documentada y es intencional.

**En caso de fallo:** Si las pruebas fallan, comparar el comportamiento fuente y objetivo para encontrar la divergencia. Corregir el objetivo para que coincida con el contrato fuente. Si la divergencia es intencional (ej., corregir un bug en el original), documentarlo explícitamente.

## Validación

- [ ] Material fuente completamente analizado con contrato de comportamiento explícito
- [ ] El mapa de transformación cubre cada elemento fuente
- [ ] Brechas identificadas con estrategias de adaptación documentadas
- [ ] La implementación objetivo usa modismos nativos (no traducción literal)
- [ ] Todas las pruebas del contrato de comportamiento pasan contra el objetivo
- [ ] Casos límite verificados (null, vacío, valores límite)
- [ ] Dependencias resueltas con equivalentes del objetivo
- [ ] Cualquier diferencia de comportamiento documentada e intencional

## Errores Comunes

- **Traducción literal**: Escribir Python-en-R o Java-en-JavaScript en lugar de usar modismos del objetivo. El resultado debe verse nativo
- **Omitir pruebas de comportamiento**: Transmutar sin pruebas significa que no se puede verificar la equivalencia. Escribir pruebas de caracterización primero
- **Ignorar casos límite**: La ruta feliz se transmuta fácilmente; los casos límite son donde se esconden los bugs
- **Sobre-ingeniería del adaptador**: Si una dependencia necesita un adaptador de 200 líneas, el alcance de la transmutación es demasiado grande
- **Transmutar comentarios literalmente**: Los comentarios deben explicar el código objetivo, no repetir la fuente. Reescribirlos

## Habilidades Relacionadas

- `athanor` — Transformación completa de cuatro etapas para sistemas demasiado grandes para una sola transmutación
- `chrysopoeia` — Optimización del código transmutado para máxima extracción de valor
- `review-software-architecture` — Revisión de arquitectura post-transmutación para conversiones mayores
- `serialize-data-formats` — Procedimientos especializados de conversión de formatos de datos
