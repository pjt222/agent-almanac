---
name: manage-tcg-collection
description: >
  Organizar, rastrear y valorar una colección de juego de cartas coleccionables.
  Cubre métodos de inventario, mejores prácticas de almacenamiento, valoración
  basada en grado, gestión de listas de deseos y analíticas de colección para
  cartas de Pokemon, MTG, Flesh and Blood y Kayou. Usar al iniciar una nueva
  colección y configurar el seguimiento de inventario, al catalogar una
  colección existente que ha crecido más allá del conocimiento casual, al
  valorar una colección para seguro o venta, o al decidir qué cartas enviar
  para calificación profesional basada en potencial de valor.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: basic
  language: natural
  tags: tcg, collection, inventory, storage, valuation, pokemon, mtg, fab, kayou
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Manage TCG Collection

Organizar, inventariar y valorar una colección de juego de cartas coleccionables con seguimiento estructurado, almacenamiento adecuado y valoración basada en datos.

## Cuándo Usar

- Iniciar una nueva colección y configurar el seguimiento de inventario desde el principio
- Catalogar una colección existente que ha crecido más allá del conocimiento casual
- Valorar una colección para seguro, venta o herencia
- Gestionar listas de deseos y carpetas de intercambio para adquirir cartas específicas
- Decidir qué cartas enviar para calificación profesional basada en potencial de valor

## Entradas

- **Requerido**: Juego(s) de cartas en la colección (Pokemon, MTG, FaB, Kayou, etc.)
- **Requerido**: Alcance de la colección (colección completa, sets específicos o cartas específicas)
- **Opcional**: Sistema de inventario actual (hoja de cálculo, aplicación, organización de carpeta física)
- **Opcional**: Objetivo de la colección (sets completos, juego competitivo, inversión, nostalgia)
- **Opcional**: Presupuesto para suministros de almacenamiento y calificación

## Procedimiento

### Paso 1: Establecer el Sistema de Inventario

Configurar un sistema de seguimiento apropiado al tamaño de la colección.

1. Elegir un método de inventario basado en el tamaño de la colección:

```
Collection Size Guide:
+-----------+-------+-------------------------------------------+
| Size      | Cards | Recommended System                        |
+-----------+-------+-------------------------------------------+
| Small     | <200  | Spreadsheet (Google Sheets, Excel)         |
| Medium    | 200-  | Dedicated app (TCGPlayer, Moxfield,        |
|           | 2000  | PokeCollector, Collectr)                   |
| Large     | 2000+ | Database + app combo with barcode scanning |
+-----------+-------+-------------------------------------------+
```

2. Definir los campos de datos a rastrear para cada carta:
   - **Identidad**: Set, número de carta, nombre, variante (holo, reverso, arte completo)
   - **Condición**: Estimación de grado crudo (NM, LP, MP, HP, DMG) o grado numérico
   - **Cantidad**: Cuántas copias se poseen
   - **Ubicación**: Dónde está almacenada la carta (página de carpeta, etiqueta de caja, losa calificada)
   - **Adquisición**: Fecha de adquisición, precio pagado, fuente (sobre, compra, intercambio)
   - **Valor**: Valor de mercado actual según condición, fecha de última actualización
3. Configurar el sistema elegido con estos campos
4. Establecer una cadencia de actualización (semanal para coleccionistas activos, mensual para colecciones estables)

**Esperado:** Un sistema de inventario funcional con campos definidos, listo para ingreso de datos. El sistema coincide con la escala de la colección — no sobredimensionado para una colección pequeña, no subdimensionado para una grande.

**En caso de fallo:** Si la aplicación ideal no está disponible para tu juego/plataforma, usar una hoja de cálculo. El formato importa menos que la consistencia. Una hoja de cálculo simple actualizada regularmente supera a una aplicación sofisticada abandonada después de una semana.

### Paso 2: Catalogar la Colección

Ingresar las cartas existentes en el sistema de inventario.

1. Ordenar las cartas físicamente antes de ingresar digitalmente:
   - Por set (todas las cartas de un set juntas)
   - Dentro del set, por número de carta (ascendente)
   - Variantes agrupadas con su carta base
2. Ingresar cartas en el sistema:
   - Usar ingreso masivo donde esté disponible (escaneo de código de barras, listas de verificación de set)
   - Registrar la condición honestamente — sobrecalificar tus propias cartas lleva a errores de valoración
   - Anotar cualquier carta con procedencia especial (firmada, primera edición, premios de torneo)
3. Para colecciones grandes, trabajar en sesiones:
   - Procesar un set o una caja de almacenamiento por sesión
   - Marcar el progreso claramente (qué cajas/carpetas están listas)
   - Verificar una muestra aleatoria de cada sesión para precisión
4. Verificar cruzadamente contra listas de verificación de set para identificar porcentajes de completitud

**Esperado:** Cada carta en la colección ingresada con datos precisos de condición y ubicación. Porcentajes de completitud conocidos para cada set que se colecciona.

**En caso de fallo:** Si la colección es demasiado grande para ingreso manual, priorizar: ingresar todas las cartas raras/valiosas primero, luego ingresar masivamente las comunes por set con cantidades estimadas. Un inventario 80% preciso es mucho mejor que ningún inventario.

### Paso 3: Organizar el Almacenamiento Físico

Almacenar las cartas apropiadamente según su valor y uso.

1. Aplicar el **sistema de niveles de almacenamiento**:

```
Storage Tiers:
+----------+---------------+----------------------------------------------+
| Tier     | Card Value    | Storage Method                               |
+----------+---------------+----------------------------------------------+
| Premium  | >$50          | Top-loader + team bag, or penny sleeve in    |
|          |               | magnetic case. Stored upright in a box.       |
| Standard | $5-$50        | Penny sleeve + top-loader or binder with      |
|          |               | side-loading pages.                          |
| Bulk     | <$5           | Row box (BCW 800-count or similar), sorted    |
|          |               | by set. No individual sleeves needed.         |
| Graded   | Any (slabbed) | Upright in graded card box. Never stack heavy.|
+----------+---------------+----------------------------------------------+
```

2. Controles ambientales:
   - Almacenar en un lugar fresco, seco y oscuro (no ático, no sótano)
   - Evitar luz solar directa, humedad y cambios de temperatura
   - Usar paquetes de gel de sílice en cajas de almacenamiento para control de humedad
3. Etiquetar todo:
   - Cada caja etiquetada con contenido (nombre del set, rango de cartas, fecha de almacenamiento)
   - Cada página de carpeta corresponde a códigos de ubicación del inventario
   - Cartas calificadas etiquetadas con ID de inventario coincidiendo con el sistema digital
4. Actualizar el sistema de inventario con ubicaciones de almacenamiento

**Esperado:** Cada carta almacenada apropiadamente para su valor con datos de ubicación en el inventario. Las cartas premium están protegidas, las cartas masivas están organizadas y accesibles.

**En caso de fallo:** Si los suministros de almacenamiento premium no están disponibles inmediatamente, fundas penny + top-loaders son siempre el mínimo para cualquier carta con valor >$10. Mejorar el almacenamiento a medida que los suministros estén disponibles; la prioridad es conseguir que las cartas valiosas tengan alguna forma de protección.

### Paso 4: Valorar la Colección

Calcular los valores de mercado actuales.

1. Elegir una fuente de precios:
   - **TCGPlayer Market Price**: Más común para el mercado estadounidense (MTG, Pokemon)
   - **CardMarket**: Estándar para el mercado europeo
   - **eBay Sold Listings**: Mejor para artículos raros/únicos sin precios estándar
   - **PSA/BGS Price Guide**: Para cartas calificadas específicamente
2. Actualizar valores para todas las cartas de nivel Estándar y Premium
3. Para cartas masivas, usar precios por set en lugar de búsquedas individuales
4. Calcular el resumen de la colección:

```
Collection Value Summary:
+------------------+--------+--------+
| Category         | Count  | Value  |
+------------------+--------+--------+
| Graded cards     |        | $      |
| Premium ungraded |        | $      |
| Standard cards   |        | $      |
| Bulk cards       |        | $      |
+------------------+--------+--------+
| TOTAL            |        | $      |
+------------------+--------+--------+
```

5. Identificar candidatas a calificación: cartas donde la prima de calificación excede los costos de calificación
   - Regla general: calificar si (valor calificado esperado - valor crudo) > 2x costo de calificación

**Esperado:** Una valoración actual de la colección con valores por carta para cartas significativas y valores agregados para las masivas. Candidatas a calificación identificadas.

**En caso de fallo:** Si los datos de precios son obsoletos o no están disponibles, anotar la fecha de precios y la fuente. Para cartas muy raras, verificar múltiples fuentes y usar la mediana. Nunca confiar en una sola venta atípica.

### Paso 5: Mantener y Optimizar

Establecer rutinas continuas de gestión de colección.

1. **Actualizaciones regulares** (coincidir con la cadencia del Paso 1):
   - Ingresar nuevas adquisiciones inmediatamente
   - Actualizar valores de nivel Premium trimestralmente, nivel Estándar semestralmente
   - Re-evaluar el nivel de almacenamiento cuando los valores cambien
2. **Gestión de lista de deseos**:
   - Mantener una lista de cartas deseadas con precios máximos
   - Verificar cruzadamente la lista de deseos contra el inventario de la carpeta de intercambio
   - Configurar alertas de precio donde lo soporte la aplicación de inventario
3. **Analíticas de colección**:
   - Rastrear el valor total a lo largo del tiempo (instantáneas mensuales)
   - Monitorear porcentajes de completitud de sets
   - Identificar riesgo de concentración (demasiado valor en una carta/set)
4. **Auditoría periódica** (anualmente):
   - Conteo físico vs. conteo de inventario para una muestra aleatoria
   - Verificar condiciones de almacenamiento (revisar humedad, daño por plagas)
   - Revisar y actualizar candidatas a calificación basado en valores actuales

**Esperado:** Un sistema de gestión de colección vivo que se mantiene actualizado y apoya decisiones informadas sobre comprar, vender, calificar e intercambiar.

**En caso de fallo:** Si el mantenimiento se descuida, priorizar: actualizar valores de nivel Premium primero, luego ponerse al día con nuevas adquisiciones. Lo más importante es saber cuánto valen tus cartas más valiosas hoy.

## Validación

- [ ] Sistema de inventario establecido con campos de datos apropiados
- [ ] Todas las cartas catalogadas con datos de condición y ubicación
- [ ] El almacenamiento físico coincide con los niveles de valor de las cartas
- [ ] Controles ambientales implementados (fresco, seco, oscuro)
- [ ] Colección valorada con precios de mercado actuales y fechas
- [ ] Candidatas a calificación identificadas con análisis de costo/beneficio
- [ ] Cadencia de mantenimiento establecida y seguida
- [ ] Lista de deseos mantenida para objetivos de adquisición

## Errores Comunes

- **Sobrecalificar tus propias cartas**: Los coleccionistas consistentemente califican sus propias cartas 1-2 grados más alto que la realidad. Ser honesto o usar `grade-tcg-card` para evaluación estructurada
- **Ignorar las cartas masivas**: Las cartas masivas acumulan valor colectivamente. Una caja de 800 comunes a $0.10 cada una son $80 — vale la pena rastrear
- **Ambiente de almacenamiento pobre**: La humedad y los cambios de temperatura dañan las cartas más rápido que el manejo. El ambiente importa más que las fundas
- **Valoraciones obsoletas**: Los mercados de cartas se mueven. Una valoración de hace 6 meses puede ser muy imprecisa, especialmente alrededor de lanzamientos de sets o anuncios de prohibiciones
- **Sin respaldo**: El inventario digital sin respaldo es frágil. Exportar a CSV mensualmente. Fotografiar las cartas premium para el seguro

## Habilidades Relacionadas

- `grade-tcg-card` — Calificación estructurada de cartas para evaluación precisa de condición
- `build-tcg-deck` — Construcción de mazos usando el inventario de la colección
