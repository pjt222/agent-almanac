---
name: search-prior-art
description: >
  Buscar arte previo relevante para una invención o reivindicación de patente
  específica. Cubre literatura de patentes, literatura no patentaria (artículos
  académicos, productos, código abierto), publicaciones defensivas y patentes
  esenciales de estándares. Usar al evaluar si una invención es novedosa y no
  obvia antes de presentar, al desafiar la validez de una patente existente,
  al apoyar un análisis de libertad de operación, al documentar una publicación
  defensiva, o al responder a una acción de oficina de patentes que cuestiona
  novedad u obviedad.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: intermediate
  language: natural
  tags: intellectual-property, prior-art, patents, novelty, obviousness, invalidity, fto
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Search Prior Art

Realizar una búsqueda estructurada de arte previo para encontrar publicaciones, patentes, productos o divulgaciones que sean anteriores a una invención específica. Se usa para evaluar la patentabilidad (¿se puede patentar esto?), desafiar la validez (¿debería haberse concedido esta patente?), o establecer libertad de operación (¿está este diseño cubierto por derechos existentes?).

## Cuándo Usar

- Evaluar si una invención es novedosa y no obvia antes de presentar una solicitud de patente
- Desafiar la validez de una patente existente encontrando arte previo que el examinador pasó por alto
- Apoyar un análisis de libertad de operación encontrando arte previo que limite el alcance de una patente bloqueante
- Documentar una publicación defensiva para evitar que otros patenten un concepto
- Responder a una acción de oficina de patentes que cuestiona novedad u obviedad

## Entradas

- **Requerido**: Descripción de la invención (qué hace, cómo funciona, qué problema resuelve)
- **Requerido**: Propósito de la búsqueda (patentabilidad, invalidez, libertad de operación, defensivo)
- **Requerido**: Fecha crítica (fecha de presentación de la solicitud de patente, o fecha de invención para arte previo)
- **Opcional**: Patentes o publicaciones relacionadas conocidas
- **Opcional**: Códigos de clasificación tecnológica (IPC, CPC)
- **Opcional**: Inventores o empresas clave en el campo

## Procedimiento

### Paso 1: Descomponer la Invención en Elementos Buscables

Dividir la invención en sus características técnicas constituyentes.

1. Leer la descripción de la invención (o las reivindicaciones de la patente si se busca contra una patente existente)
2. Extraer los **elementos esenciales** — cada característica técnica independiente:
   - ¿Qué componentes tiene?
   - ¿Qué pasos sigue el proceso?
   - ¿Qué efecto técnico logra?
   - ¿Qué problema resuelve y cómo?
3. Identificar la **combinación novedosa** — qué la diferencia del arte conocido:
   - ¿Es un nuevo elemento añadido a elementos conocidos?
   - ¿Es una nueva combinación de elementos conocidos?
   - ¿Es un elemento conocido aplicado en un campo nuevo?
4. Generar términos de búsqueda para cada elemento:
   - Términos técnicos, sinónimos y abreviaturas
   - Términos más amplios y más estrechos (jerarquía)
   - Descripciones alternativas del mismo concepto
5. Documentar el **Mapa de Búsqueda**: elementos, términos y relaciones

```
Search Map Example:
+------------------+-----------------------------------+-----------+
| Element          | Search Terms                      | Priority  |
+------------------+-----------------------------------+-----------+
| Attention layer  | attention mechanism, self-         | High      |
|                  | attention, multi-head attention    |           |
| Sparse routing   | mixture of experts, sparse MoE,   | High      |
|                  | top-k routing, expert selection    |           |
| Training method  | knowledge distillation, teacher-   | Medium    |
|                  | student, progressive training      |           |
+------------------+-----------------------------------+-----------+
```

**Esperado:** Una descomposición completa con términos de búsqueda para cada elemento. La combinación novedosa está identificada — esto es lo que la búsqueda debe encontrar (para invalidar) o confirmar que está ausente (para apoyar la novedad).

**En caso de fallo:** Si la invención es demasiado abstracta para descomponer, solicitar una descripción más específica. Si las reivindicaciones no son claras, enfocarse en la interpretación razonable más amplia de cada elemento de reivindicación.

### Paso 2: Buscar Literatura de Patentes

Buscar en bases de datos de patentes de manera sistemática.

1. Construir consultas combinando términos de elementos:
   - Buscar cada elemento individualmente primero (amplio)
   - Luego combinar elementos para encontrar arte más cercano (estrecho)
   - Usar códigos de clasificación para filtrar por área tecnológica
2. Buscar en múltiples bases de datos:
   - **Google Patents**: Bueno para búsqueda de texto completo, gratuito, corpus amplio
   - **USPTO PatFT/AppFT**: Patentes y solicitudes estadounidenses, fuente oficial
   - **Espacenet**: Patentes europeas, excelente búsqueda por clasificación
   - **WIPO Patentscope**: Solicitudes PCT, cobertura global
3. Aplicar filtros de fecha:
   - El arte previo debe ser anterior a la **fecha crítica** (fecha de presentación o fecha de prioridad)
   - Incluir publicaciones hasta 1 año antes de la presentación (el período de gracia varía por jurisdicción)
4. Para cada resultado relevante, registrar:
   - Número de documento, título, fecha de presentación, fecha de publicación
   - Qué elementos divulga (mapear al Mapa de Búsqueda)
   - Si divulga la combinación novedosa
5. Clasificar resultados por relevancia:
   - **Referencia X**: Divulga la invención por sí sola (anticipación)
   - **Referencia Y**: Divulga elementos clave, combinable con otras referencias (obviedad)
   - **Referencia A**: Arte de fondo, define el estado general de la técnica

**Esperado:** Una lista clasificada de referencias de patentes mapeadas a los elementos de la invención. Las referencias X (si se encuentran) son impedimentos para la novedad. Las referencias Y son los componentes para argumentos de obviedad.

**En caso de fallo:** Si no se encuentra arte de patentes relevante, esto no significa que la invención sea novedosa — la literatura no patentaria (Paso 3) puede contener la referencia crítica. La ausencia en una base de datos no significa ausencia en todas partes.

### Paso 3: Buscar Literatura No Patentaria

Buscar artículos académicos, productos, código abierto y otras divulgaciones no patentarias.

1. **Literatura académica**:
   - Google Scholar, arXiv, IEEE Xplore, ACM Digital Library
   - Buscar usando los mismos términos del Paso 1
   - Los artículos de conferencia y actas de talleres a menudo son anteriores a las presentaciones de patentes
2. **Productos y divulgaciones comerciales**:
   - Documentación de productos, manuales de usuario, materiales de marketing
   - Internet Archive (Wayback Machine) para contenido web con fecha verificada
   - Publicaciones comerciales y comunicados de prensa
3. **Código abierto y software**:
   - GitHub, GitLab — buscar implementaciones de las características técnicas
   - Archivos README, documentación e historiales de commits para evidencia de fecha
   - Lanzamientos de software con fechas de versión
4. **Estándares y especificaciones**:
   - IEEE, IETF (RFCs), W3C, estándares ISO
   - Las patentes esenciales de estándares deben ser divulgadas; buscar en las bases de datos de PI de los organismos de estandarización
5. **Publicaciones defensivas**:
   - IBM Technical Disclosure Bulletin
   - Research Disclosure journal
   - IP.com Prior Art Database
6. Para cada resultado, verificar que la **fecha de publicación** sea anterior a la fecha crítica:
   - Páginas web: usar Wayback Machine para evidencia de fecha
   - Software: usar fechas de lanzamiento o timestamps de commits
   - Artículos: usar fecha de publicación, no fecha de envío

**Esperado:** Referencias no patentarias que complementen la búsqueda de patentes. Los artículos académicos y el código abierto son a menudo el arte previo más poderoso porque tienden a describir detalles técnicos más explícitamente que las patentes.

**En caso de fallo:** Si la literatura no patentaria es escasa, la tecnología puede desarrollarse principalmente en I+D corporativo (intensivo en patentes). Cambiar el énfasis a la literatura de patentes y enfocarse en el argumento de obviedad basado en combinación.

### Paso 4: Analizar y Mapear Resultados

Evaluar cómo el arte previo recopilado se relaciona con la invención.

1. Crear un **cuadro de reivindicaciones** mapeando arte previo a elementos de la invención:

```
Claim Element vs. Prior Art Matrix:
+------------------+--------+--------+--------+--------+
| Element          | Ref #1 | Ref #2 | Ref #3 | Ref #4 |
+------------------+--------+--------+--------+--------+
| Element A        |   X    |   X    |        |   X    |
| Element B        |        |   X    |   X    |        |
| Element C        |   X    |        |   X    |        |
| Novel combo A+B+C|        |        |        |        |
+------------------+--------+--------+--------+--------+
X = element disclosed in this reference
```

2. Evaluar **novedad**: ¿Alguna referencia individual divulga todos los elementos?
   - Si sí → la invención está anticipada (no es novedosa)
   - Si no → la invención puede ser novedosa (proceder a obviedad)
3. Evaluar **obviedad**: ¿Se puede combinar un número pequeño de referencias (2-3) para cubrir todos los elementos?
   - ¿Hay motivación para combinar? (¿un experto vería una razón para combinar estas?)
   - ¿Las referencias enseñan en contra de la combinación? (¿sugieren que no funcionaría?)
4. Para **búsquedas de libertad de operación**: ¿El arte previo estrecha las reivindicaciones de la patente bloqueante?
   - El arte previo que se superpone con las reivindicaciones de la patente bloqueante limita su alcance ejecutable
5. Documentar el análisis claramente con citas a pasajes específicos

**Esperado:** Un cuadro de reivindicaciones claro mostrando qué elementos están cubiertos por qué referencias, con una evaluación de novedad y obviedad. Cada mapeo cita pasajes o figuras específicos en las referencias.

**En caso de fallo:** Si el cuadro de reivindicaciones muestra vacíos (elementos no encontrados en ningún arte previo), esos vacíos representan los aspectos potencialmente novedosos. Enfocar las búsquedas de seguimiento en esos vacíos específicos.

### Paso 5: Documentar y Entregar

Empaquetar los resultados de búsqueda para su uso previsto.

1. Escribir el **Informe de Búsqueda de Arte Previo**:
   - Propósito y alcance de la búsqueda
   - Metodología de búsqueda (bases de datos, consultas, rangos de fechas)
   - Resumen de resultados (número de referencias encontradas, desglose por clasificación)
   - Referencias principales con análisis detallado (cuadros de reivindicaciones)
   - Evaluación: novedad, obviedad e implicaciones de libertad de operación
   - Limitaciones y recomendaciones para búsqueda adicional
2. Organizar referencias:
   - Ordenadas por relevancia (referencias X primero, luego Y, luego A)
   - Cada referencia con datos bibliográficos completos y enlace de acceso
   - Pasajes clave resaltados o extraídos
3. Recomendaciones según el propósito de la búsqueda:
   - **Patentabilidad**: Presentar/no presentar, alcance de reivindicaciones sugerido basado en vacíos del arte previo
   - **Invalidez**: Combinación más fuerte de referencias, argumento legal sugerido
   - **Libertad de operación**: Nivel de riesgo, oportunidades de diseño alternativo, consideraciones de licencia
   - **Defensivo**: Si publicar como publicación defensiva basado en el espacio en blanco encontrado

**Esperado:** Un informe de búsqueda completo y bien organizado que apoye directamente la decisión prevista. Las referencias son accesibles y el análisis es rastreable.

**En caso de fallo:** Si la búsqueda es inconclusa (sin referencias X o Y fuertes, pero algo de fondo relevante), declarar la conclusión claramente: "No se encontró arte anticipatorio; el arte más cercano aborda los elementos A y B pero no C. Se recomienda presentar con reivindicaciones enfatizando el elemento C." Un resultado inconcluso es un resultado válido y útil.

## Validación

- [ ] La invención está descompuesta en elementos buscables distintos
- [ ] La combinación novedosa está explícitamente identificada
- [ ] Se buscó en bases de datos de patentes (mínimo 2 bases de datos)
- [ ] Se buscó literatura no patentaria (académica + productos + código abierto)
- [ ] Todas las referencias son anteriores a la fecha crítica (fechas verificadas)
- [ ] El cuadro de reivindicaciones mapea elementos a referencias con citas de pasajes
- [ ] Novedad y obviedad evaluadas con razonamiento
- [ ] Los resultados están clasificados por relevancia (referencias X, Y, A)
- [ ] El informe incluye metodología, limitaciones y recomendaciones
- [ ] La búsqueda es reproducible (consultas y bases de datos documentadas)

## Errores Comunes

- **Visión de túnel de palabras clave**: Buscar solo términos exactos omite sinónimos y descripciones alternativas. Usar la jerarquía de términos del Paso 1
- **Búsqueda solo de patentes**: La literatura no patentaria (artículos, productos, código) es a menudo más explícita que las patentes. No omitir el Paso 3
- **Descuido con las fechas**: El arte previo debe ser anterior a la fecha crítica. Una referencia brillante de un día después de la fecha de presentación no tiene valor
- **Ignorar arte en idiomas extranjeros**: Las invenciones importantes pueden aparecer primero en literatura de patentes en chino, japonés, coreano o alemán. La traducción automática las hace buscables
- **Sesgo de confirmación**: Buscar para confirmar novedad en lugar de buscar arte invalidante. La mejor búsqueda se esfuerza más por encontrar el arte más cercano
- **Detenerse demasiado pronto**: Los primeros resultados rara vez son los mejores. Iterar los términos de búsqueda basándose en lo que los resultados iniciales revelan sobre el vocabulario del campo

## Habilidades Relacionadas

- `assess-ip-landscape` — Mapeo más amplio del panorama que contextualiza búsquedas específicas de arte previo
- `review-research` — La metodología de revisión de literatura se superpone significativamente con la búsqueda de arte previo
- `security-audit-codebase` — Paralelismos en metodología de búsqueda sistemática (exhaustividad, documentación, reproducibilidad)
