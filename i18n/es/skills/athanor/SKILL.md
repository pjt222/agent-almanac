---
name: athanor
description: >
  Transmutación alquímica de código en cuatro etapas — nigredo (descomposición),
  albedo (purificación), citrinitas (iluminación), rubedo (síntesis) — con puntos
  de control de meditate y heal entre etapas. Transforma código enredado o
  heredado en salida optimizada y bien estructurada mediante análisis sistemático
  de material. Usar al transformar código heredado en equivalentes modernos, al
  refactorizar módulos profundamente enredados donde las correcciones incrementales
  siguen fallando, al convertir una base de código entre paradigmas, o cuando
  enfoques de refactorización más simples se han estancado y se necesita una
  transformación de ciclo completo.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: multi
  tags: alchemy, transmutation, refactoring, transformation, four-stages, nigredo, albedo, citrinitas, rubedo
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Athanor

Ejecutar una transmutación alquímica de código o datos en cuatro etapas — descomponiendo la prima materia, purificando su esencia, iluminando su forma objetivo, y sintetizando la salida refinada. El athanor es el horno que mantiene calor constante a lo largo de todas las etapas.

## Cuándo Usar

- Transformar código heredado en equivalentes modernos y bien estructurados
- Refactorizar módulos profundamente enredados donde las correcciones incrementales siguen fallando
- Convertir una base de código de un paradigma a otro (procedimental a funcional, monolito a modular)
- Procesar datos crudos y desordenados en conjuntos de datos analíticos limpios
- Cuando enfoques de refactorización más simples se han estancado y se necesita una transformación de ciclo completo

## Entradas

- **Requerido**: El material a transformar (rutas de archivos, nombres de módulos o fuentes de datos)
- **Requerido**: El estado final deseado (arquitectura objetivo, paradigma o formato)
- **Opcional**: Restricciones conocidas (debe preservar API, no puede cambiar esquema de base de datos, etc.)
- **Opcional**: Intentos de transformación previos fallidos y por qué se estancaron

## Procedimiento

### Paso 1: Nigredo — Descomposición

Descomponer la prima materia en sus elementos constituyentes. Nada es sagrado; todo se cataloga.

1. Inventariar el material completamente:
   - Listar cada función, clase, módulo o entidad de datos
   - Mapear todas las dependencias (importaciones, llamadas, flujos de datos)
   - Identificar acoplamiento oculto (variables globales compartidas, estado implícito, efectos secundarios)
2. Hacer explícitas las suposiciones ocultas:
   - ¿En qué comportamientos no documentados se apoya el código?
   - ¿Qué condiciones de error se tragan silenciosamente?
   - ¿Qué dependencias de orden existen?
3. Catalogar anti-patrones y deuda técnica:
   - Objetos dios, dependencias circulares, duplicación de copiar y pegar
   - Caminos de código muerto, ramas inalcanzables, características vestigiales
   - Valores codificados en duro, números mágicos, configuración embebida
4. Producir el **Inventario Nigredo**: un catálogo estructurado de cada elemento, dependencia, suposición y anti-patrón

**Esperado:** Un inventario completo e implacable del material. El inventario debe sentirse incómodo — si no lo hace, la descomposición no es suficientemente profunda. Cada suposición oculta es ahora explícita.

**En caso de fallo:** Si el material es demasiado grande para inventariar completamente, descomponer por límite de módulo y tratar cada módulo como una ejecución separada del athanor. Si las dependencias están demasiado enredadas para mapear, usar `grep`/`Grep` para rastrear los sitios de llamada reales en lugar de confiar en la documentación.

### Paso 2: Meditate — Punto de control de calcinación

Ejecutar la habilidad `meditate` para limpiar las suposiciones acumuladas durante el nigredo.

1. Dejar de lado el inventario nigredo y limpiar el contexto mental
2. Anclarse en el objetivo de transformación declarado en las Entradas
3. Observar qué sesgos introdujo el nigredo — ¿la descomposición hizo que ciertos enfoques parecieran inevitables?
4. Etiquetar cualquier idea de solución prematura como "tangente" y volver al objetivo

**Esperado:** Un estado claro y sin sesgos listo para evaluar el material sin estar anclado a su forma actual. El objetivo se siente fresco en lugar de restringido por lo que se encontró.

**En caso de fallo:** Si los hallazgos del nigredo siguen atrayendo la atención (un anti-patrón particularmente malo, un hack ingenioso que es tentador preservar), escribirlo y dejarlo de lado explícitamente. Proceder solo cuando el objetivo sea más claro que la forma actual.

### Paso 3: Albedo — Purificación

Separar lo esencial de lo accidental. Eliminar todo lo que no sirva a la forma objetivo.

1. Del inventario nigredo, clasificar cada elemento:
   - **Esencial**: Lógica de negocio central, algoritmos irremplazables, transformaciones de datos críticas
   - **Accidental**: Boilerplate de framework, soluciones alternativas para bugs antiguos, shims de compatibilidad
   - **Tóxico**: Anti-patrones, vulnerabilidades de seguridad, código muerto
2. Extraer los elementos esenciales en aislamiento:
   - Extraer la lógica central de los wrappers del framework
   - Separar la transformación de datos de la E/S
   - Extraer interfaces de las implementaciones
3. Eliminar los elementos tóxicos completamente — documentar lo que se eliminó y por qué
4. Para elementos accidentales, determinar si existen equivalentes en la forma objetivo
5. Producir el **Extracto Albedo**: lógica esencial purificada con interfaces limpias

**Esperado:** Un conjunto de funciones/módulos puros y aislados que representan el valor central del material original. Cada pieza es testeable en aislamiento. El extracto es significativamente más pequeño que el original.

**En caso de fallo:** Si lo esencial y lo accidental están demasiado entrelazados para separar, introducir puntos de costura (interfaces) primero. Si el material resiste la purificación, puede necesitar `dissolve-form` antes de que el athanor pueda continuar.

### Paso 4: Heal — Evaluación de purificación

Ejecutar la habilidad `heal` para evaluar si la purificación fue minuciosa.

1. Triaje del extracto albedo: ¿algo todavía lleva residuo tóxico?
2. Verificar desviación: ¿la purificación se desvió del objetivo de transformación original?
3. Evaluar completitud: ¿todos los elementos esenciales están contabilizados, o algunos fueron descartados prematuramente?
4. Reequilibrar si es necesario: restaurar cualquier elemento esencial que fue clasificado incorrectamente como accidental

**Esperado:** Confianza en que el extracto albedo está completo, limpio y listo para la iluminación. Ninguna lógica esencial se perdió; ningún patrón tóxico permanece.

**En caso de fallo:** Si la evaluación revela brechas significativas, volver al Paso 3 con las brechas específicas identificadas. No proceder al citrinitas con material incompleto.

### Paso 5: Citrinitas — Iluminación

Ver la forma objetivo. Mapear los elementos purificados a su estructura óptima.

1. Reconocimiento de patrones: identificar qué patrones de diseño sirven a los elementos purificados
   - ¿El flujo de datos sugiere pipes/filters, event sourcing, CQRS?
   - ¿Las interfaces sugieren strategy, adapter, facade?
   - ¿La estructura de módulos sugiere hexagonal, por capas, micro-kernel?
2. Diseñar la arquitectura objetivo:
   - Mapear cada elemento esencial a su nueva ubicación
   - Definir las interfaces entre componentes
   - Especificar el flujo de datos a través de la nueva estructura
3. Identificar lo que debe crearse nuevo (no tiene equivalente en el original):
   - Nuevas abstracciones que unifican lógica duplicada
   - Nuevas interfaces que reemplazan acoplamiento implícito
   - Nuevo manejo de errores que reemplaza fallos silenciosos
4. Producir el **Plano Citrinitas**: un mapeo completo del extracto albedo a la forma objetivo

**Esperado:** Un plano claro y detallado donde cada elemento esencial tiene un hogar y cada interfaz está definida. El plano debe sentirse inevitable — dados los elementos purificados, esta estructura es el ajuste natural.

**En caso de fallo:** Si múltiples arquitecturas válidas compiten, evaluar cada una contra las restricciones de las Entradas. Si no emerge un claro ganador, preferir la opción más simple y documentar las alternativas como opciones futuras.

### Paso 6: Meditate — Punto de control pre-síntesis

Ejecutar la habilidad `meditate` para prepararse para la síntesis final.

1. Limpiar el contexto analítico del citrinitas
2. Anclarse en el plano citrinitas como guía de síntesis
3. Observar cualquier ansiedad sobre la transformación — ¿se está apresurando algo?
4. Confirmar preparación: el plano es claro, el material está purificado, las restricciones son conocidas

**Esperado:** Claridad tranquila sobre lo que necesita construirse. La fase de síntesis debe ser ejecución, no diseño.

**En caso de fallo:** Si la duda persiste sobre el plano, revisitar el Paso 5 con las preocupaciones específicas. Es mejor refinar el plano que comenzar la síntesis con incertidumbre.

### Paso 7: Rubedo — Síntesis

Componer los elementos purificados en su forma objetivo. La piedra filosofal: código funcional y optimizado.

1. Construir la nueva estructura siguiendo el plano citrinitas:
   - Crear archivos, módulos e interfaces según lo especificado
   - Migrar cada elemento esencial a su nueva ubicación
   - Implementar nuevas abstracciones e interfaces
2. Conectar los componentes:
   - Conectar flujos de datos según el diseño
   - Implementar propagación de errores a través de nuevos caminos
   - Configurar inyección de dependencias o carga de módulos
3. Verificar la síntesis:
   - ¿Cada componente funciona en aislamiento? (pruebas unitarias)
   - ¿Los componentes se componen correctamente? (pruebas de integración)
   - ¿El sistema completo produce las mismas salidas que el original? (pruebas de regresión)
4. Remover andamiaje:
   - Eliminar shims de compatibilidad temporales
   - Remover ayudas de migración
   - Limpiar cualquier referencia restante a la estructura antigua
5. Producir la **Salida Rubedo**: el código transmutado, completamente funcional en su nueva forma

**Esperado:** Código funcional que es mediblemente mejor que el original: menos líneas, estructura más clara, mejor cobertura de pruebas, menos dependencias. La transformación está completa y la forma antigua puede retirarse.

**En caso de fallo:** Si la síntesis revela brechas en el plano, no parchear — volver al Paso 5 (citrinitas) para revisar el diseño. Si componentes individuales fallan, aislarlos y corregirlos antes de intentar la integración completa. El rubedo no debe producir una quimera a medio transformar.

## Validación

- [ ] El inventario nigredo está completo (todos los elementos, dependencias, suposiciones catalogadas)
- [ ] El punto de control meditate pasó entre nigredo/albedo (suposiciones limpiadas)
- [ ] El extracto albedo contiene solo elementos esenciales con interfaces limpias
- [ ] La evaluación heal confirma completitud de purificación
- [ ] El plano citrinitas mapea cada elemento esencial a la forma objetivo
- [ ] El punto de control meditate pasó entre citrinitas/rubedo (listo para síntesis)
- [ ] La salida rubedo pasa pruebas de regresión contra el comportamiento original
- [ ] La salida rubedo está mediblemente mejorada (complejidad, acoplamiento, cobertura de pruebas)
- [ ] Ningún elemento tóxico sobrevivió en la salida final
- [ ] Las restricciones de transformación de las Entradas se satisfacen

## Errores Comunes

- **Saltarse la profundidad del nigredo**: Apurar la descomposición significa que el acoplamiento oculto surge durante la síntesis. Invertir completamente en el inventario
- **Preservar complejidad accidental**: Apego a soluciones alternativas ingeniosas o código "funciona, no lo toques". Si no es esencial, se va
- **Saltarse los puntos de control meditate**: El impulso cognitivo de una etapa sesga la siguiente. Las pausas son estructurales, no opcionales
- **Síntesis sin plano**: Comenzar a codificar antes de que el citrinitas esté completo produce remiendo, no transmutación
- **Pruebas de regresión incompletas**: El rubedo debe reproducir el comportamiento original. Los caminos no probados fallarán silenciosamente
- **Expansión del alcance durante citrinitas**: La fase de iluminación revela oportunidades de mejora más allá del objetivo original. Anotarlas pero no perseguirlas — el athanor sirve la transformación declarada, no un ideal hipotético

## Habilidades Relacionadas

- `transmute` — Transformación de menor peso para funciones individuales o módulos pequeños
- `chrysopoeia` — Extracción y optimización de valor (convertir código base en oro)
- `meditate` — Limpieza meta-cognitiva usada como puntos de control entre etapas
- `heal` — Evaluación de subsistemas usada para validación de purificación
- `dissolve-form` — Cuando el material es demasiado rígido para el athanor, disolver primero
- `adapt-architecture` — Enfoque complementario para patrones de migración a nivel de sistema
- `review-software-architecture` — Revisión de arquitectura post-síntesis
