---
name: mineral-identification
description: >
  Identificación de minerales y menas en campo usando dureza, raya, brillo,
  clivaje, hábito cristalino y pruebas químicas simples. Cubre la metodología
  de eliminación sistemática, aplicación de la escala de Mohs e indicadores
  comunes de menas para metales preciosos, piedras preciosas y minerales
  industriales. Usar al encontrar un espécimen de roca o mineral desconocido,
  al prospectar y evaluar si un sitio muestra indicadores de minerales
  valiosos, al distinguir roca portadora de mena de roca estéril en campo,
  o al desarrollar alfabetización geológica mediante observación sistemática.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: prospecting
  complexity: intermediate
  language: natural
  tags: prospecting, minerals, geology, identification, hardness, streak, field-geology
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Mineral Identification

Identificar minerales en campo usando propiedades físicas, eliminación sistemática y pruebas de campo simples.

## Cuándo Usar

- Encuentras un espécimen de roca o mineral desconocido y quieres identificarlo
- Estás prospectando y necesitas evaluar si un sitio muestra indicadores de minerales valiosos
- Quieres distinguir roca portadora de mena de roca estéril en campo
- Estás desarrollando alfabetización geológica mediante observación sistemática

## Entradas

- **Requerido**: Un espécimen mineral o afloramiento para examinar
- **Opcional**: Placa de raya (azulejo de porcelana sin esmaltar o reverso de azulejo de baño)
- **Opcional**: Clavo de acero o hoja de cuchillo (dureza ~5.5)
- **Opcional**: Placa de vidrio (dureza ~5.5)
- **Opcional**: Moneda de cobre (dureza ~3.5)
- **Opcional**: Lupa de mano (10x)
- **Opcional**: Ácido clorhídrico diluido (10% HCl) para prueba de carbonatos

## Procedimiento

### Paso 1: Observar Sin Tocar

Antes de manipular, observar el espécimen en contexto.

```
Field Context:
+--------------------+------------------------------------------+
| Observation        | Record                                   |
+--------------------+------------------------------------------+
| Host rock          | What type of rock is it in/on?           |
|                    | (granite, basite, sandstone, schist...)   |
+--------------------+------------------------------------------+
| Geological setting | Vein, disseminated, massive, placer,     |
|                    | weathering surface, cave deposit          |
+--------------------+------------------------------------------+
| Associated         | What other minerals are nearby?           |
| minerals           | (quartz veins often host gold; iron       |
|                    | staining suggests oxidation zone)        |
+--------------------+------------------------------------------+
| Crystal form       | Visible crystals? Habit? Size?           |
| (if visible)       | (cubic, prismatic, tabular, massive)     |
+--------------------+------------------------------------------+
```

**Esperado:** Contexto de campo registrado antes de manipular el espécimen.

**En caso de fallo:** Si el contexto geológico no es claro (espécimen suelto, hallazgo urbano), proceder solo con las propiedades físicas — el contexto habría ayudado a reducir candidatos pero no es estrictamente requerido.

### Paso 2: Probar Propiedades Físicas

Aplicar las pruebas diagnósticas sistemáticamente.

```
Diagnostic Property Tests:

LUSTER (how it reflects light):
- Metallic: reflects like metal (pyrite, galena, gold)
- Vitreous: glassy (quartz, feldspar)
- Pearly: like a pearl (muscovite, talc surfaces)
- Silky: like silk fibers (asbestos, satin spar gypsum)
- Earthy/dull: no reflection (kaolin, limonite)
- Adamantine: brilliant, diamond-like (diamond, zircon)

HARDNESS (Mohs scale — scratch test):
+------+-----------+----------------------------------+
| Mohs | Reference | Can Be Scratched By              |
+------+-----------+----------------------------------+
| 1    | Talc      | Fingernail                       |
| 2    | Gypsum    | Fingernail (barely)              |
| 3    | Calcite   | Copper coin                      |
| 4    | Fluorite  | Steel nail (easily)              |
| 5    | Apatite   | Steel nail (just)                |
| 6    | Feldspar  | Steel nail cannot scratch        |
| 7    | Quartz    | Scratches glass                  |
| 8    | Topaz     | Scratches quartz                 |
| 9    | Corundum  | Scratches topaz                  |
| 10   | Diamond   | Scratches everything             |
+------+-----------+----------------------------------+

Test: try to scratch the specimen with each reference tool,
starting from soft to hard. The hardness is between the tool
that fails and the tool that succeeds.

STREAK (powder colour on porcelain):
- Drag the specimen firmly across an unglazed porcelain tile
- Record the colour of the powder line
- Streak colour is often different from specimen colour
- Critical: hematite is grey-black but streaks RED
- Critical: pyrite is gold but streaks BLACK
- Minerals harder than the streak plate (~7) will not leave a streak

CLEAVAGE AND FRACTURE:
- Cleavage: breaks along flat planes (mica: 1 direction, feldspar: 2)
- Fracture: breaks irregularly (conchoidal = curved like glass, uneven, fibrous)
- Note number of cleavage directions and angles between them

SPECIFIC GRAVITY (heft test):
- Hold the specimen and assess: does it feel heavier or lighter
  than expected for its size?
- Heavy: possible metallic ore (galena, gold, magnetite)
- Light: possible pumice, sulfur, or organic material
```

**Esperado:** Un perfil del espécimen: brillo, rango de dureza, color de raya, tipo de clivaje/fractura y densidad relativa.

**En caso de fallo:** Si una propiedad es ambigua (ej., brillo entre metálico y vítreo — "sub-metálico"), registrar ambas opciones. La ambigüedad reduce la confianza pero no impide la identificación.

### Paso 3: Aplicar Pruebas Especiales

Pruebas adicionales para grupos minerales específicos.

```
Special Field Tests:

MAGNETISM:
- Hold a magnet near the specimen
- Strong attraction: magnetite (or possibly pyrrhotite)
- Weak attraction: some iron-bearing minerals

ACID TEST (10% HCl):
- Drop acid on the specimen surface
- Vigorous fizzing: calcite (CaCO3)
- Fizzing on powder only: dolomite (scratch surface first, then apply acid)
- No fizzing: not a carbonate

TASTE (only for suspected halite):
- Salty taste: halite (NaCl)
- Do NOT taste unknown minerals generally — some are toxic

SMELL:
- Sulfur: rotten egg smell (sulfides when scratched)
- Clay: earthy "petrichor" smell when breathed on (clay minerals)

TENACITY:
- Brittle: shatters when struck (most silicates)
- Malleable: deforms without breaking (gold, copper, silver)
- Flexible: bends and stays (chlorite, some micas)
- Elastic: bends and springs back (muscovite mica)
```

**Esperado:** Datos diagnósticos adicionales que reducen aún más la identificación.

**En caso de fallo:** Si las pruebas especiales no están disponibles (sin imán, sin ácido), proceder con las propiedades básicas — son suficientes para la mayoría de los minerales comunes.

### Paso 4: Identificar por Eliminación

Verificar cruzadamente el perfil de propiedades contra minerales conocidos.

```
Common Mineral Identification Key (simplified):

METALLIC LUSTER:
- Black streak + hard (6+) + cubic crystals = PYRITE
- Black streak + soft (2.5) + heavy + cubic = GALENA
- Red-brown streak + hard (5-6) + heavy = HEMATITE
- Yellow streak + soft (1.5-2.5) + yellow = GOLD (if malleable)
  or CHALCOPYRITE (if brittle, harder, green-black streak)
- Black streak + magnetic = MAGNETITE

NON-METALLIC, LIGHT-COLORED:
- Vitreous + hard (7) + conchoidal fracture = QUARTZ
- Vitreous + hard (6) + 2 cleavage planes = FELDSPAR
- Vitreous + soft (3) + fizzes in acid = CALCITE
- Pearly + very soft (1) + greasy feel = TALC
- Vitreous + soft (2) + 1 perfect cleavage = GYPSUM

NON-METALLIC, DARK-COLORED:
- Vitreous + hard (5-6) + 2 cleavage at ~90 degrees = PYROXENE
- Vitreous + hard (5-6) + 2 cleavage at ~60/120 degrees = AMPHIBOLE
- Vitreous + soft (2.5-3) + 1 perfect cleavage + flexible = BIOTITE (mica)
```

**Esperado:** Una identificación mineral o una lista corta de 2-3 candidatos con la prueba diferenciadora necesaria para distinguirlos.

**En caso de fallo:** Si el espécimen no coincide con ningún mineral común, puede ser una roca (agregado de minerales) en lugar de un mineral único, o puede requerir análisis de laboratorio (sección delgada, DRX).

## Validación

- [ ] El contexto de campo fue registrado antes de la manipulación
- [ ] El brillo fue evaluado bajo luz natural
- [ ] La dureza fue probada contra al menos dos materiales de referencia
- [ ] El color de raya fue registrado (si el espécimen es más blando que la placa de raya)
- [ ] El patrón de clivaje o fractura fue anotado
- [ ] La identificación fue alcanzada por eliminación sistemática, no adivinando
- [ ] Los minerales similares fueron explícitamente considerados y diferenciados

## Errores Comunes

- **Confundir pirita con oro**: El "oro de los tontos" (pirita) es más duro (6 vs 2.5), frágil (el oro es maleable) y raya negro (el oro raya dorado). Las pruebas son definitivas — úsalas
- **Ignorar la raya**: El color del espécimen no es confiable (la hematita puede ser gris, roja o negra). El color de raya es consistente y diagnóstico
- **Rayar con herramientas contaminadas**: Un clavo de acero con óxido produce una raya falsa. Limpiar las herramientas de prueba antes de usar
- **Asumir hábito cristalino**: Muchos minerales raramente muestran cristales bien formados en campo. Las formas masivas o granulares son más comunes — no requerir cristales visibles para la identificación
- **Confundir superficie meteorizada con color verdadero**: Romper el espécimen para exponer una superficie fresca antes de probar. Las costras de meteorización pueden disfrazar completamente el mineral debajo

## Habilidades Relacionadas

- `gold-washing` — la recuperación de oro aluvial usa habilidades de identificación mineral para leer depósitos de arroyos y evaluar gravas auríferas
