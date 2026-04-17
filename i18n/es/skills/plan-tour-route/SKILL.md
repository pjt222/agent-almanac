---
name: plan-tour-route
description: >
  Planificar una ruta turística multi-parada con optimización de puntos
  intermedios, estimación de tiempos de conducción/caminata, y descubrimiento de
  POI a lo largo de la ruta usando datos de OSM. Cubre geocodificación,
  ordenamiento basado en vecino más cercano y TSP, cálculo de matriz de
  tiempo/distancia, y generación de itinerario con puntos de interés. Usar al
  planificar un viaje por carretera o recorrido a pie con múltiples destinos, al
  optimizar el orden de visitas para minimizar tiempo de viaje, al descubrir
  sitios a lo largo de una ruta, o al comparar opciones de conducción versus
  caminata versus transporte público.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: intermediate
  language: multi
  tags: travel, routing, waypoints, osm, itinerary
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Plan Tour Route

Planificar y optimizar una ruta turística multi-parada con estimaciones de tiempo, cálculos de distancia y puntos de interés a lo largo del camino.

## Cuándo Usar

- Planificar un viaje por carretera o recorrido a pie con múltiples destinos
- Optimizar el orden de visitas para minimizar el tiempo total de viaje o la distancia
- Descubrir restaurantes, miradores o sitios culturales a lo largo de una ruta
- Generar un itinerario día por día con presupuestos de tiempo realistas
- Comparar opciones de conducción vs. caminata vs. transporte público

## Entradas

- **Requerido**: Lista de puntos intermedios (nombres de lugares, direcciones o coordenadas)
- **Requerido**: Modo de viaje (conducción, caminata, ciclismo, transporte público)
- **Opcional**: Puntos de inicio y fin (si son diferentes del primer/último punto intermedio)
- **Opcional**: Restricciones de tiempo (hora de salida, hora límite de llegada, horarios de apertura)
- **Opcional**: Categorías de POI a descubrir (comida, miradores, museos, combustible)
- **Opcional**: Tipo de ruta preferido (más rápida, más corta, escénica)

## Procedimiento

### Paso 1: Definir Puntos Intermedios

Recopilar y estructurar todas las paradas que el recorrido debe incluir.

```
Waypoint Schema:
┌──────────┬────────────────────────────────────────────┐
│ Field    │ Description                                │
├──────────┼────────────────────────────────────────────┤
│ name     │ Human-readable label for the stop          │
│ address  │ Street address or place name               │
│ lat/lon  │ Coordinates (if known; otherwise geocode)  │
│ duration │ Time to spend at this stop (minutes)       │
│ priority │ Must-visit vs. nice-to-have                │
│ hours    │ Opening/closing times (if applicable)      │
│ notes    │ Parking, accessibility, booking required    │
└──────────┴────────────────────────────────────────────┘
```

Separar los puntos intermedios de orden fijo (ej., hotel al inicio y fin) de los puntos intermedios reordenables.

**Esperado:** Una lista estructurada de todos los puntos intermedios con al menos un nombre y ya sea una dirección o coordenadas para cada uno.

**En caso de fallo:** Si un punto intermedio es ambiguo (ej., "el castillo"), usar WebSearch para resolverlo a una ubicación específica. Si se necesitan coordenadas pero solo hay un nombre disponible, diferir al Paso 2 para geocodificación.

### Paso 2: Geocodificar y Validar

Convertir todos los puntos intermedios a coordenadas de latitud/longitud y verificar que son alcanzables.

```
Geocoding Sources (in preference order):
1. Nominatim (OpenStreetMap) - free, no key required
   https://nominatim.openstreetmap.org/search?q=QUERY&format=json

2. Overpass API - for POI-type queries
   https://overpass-api.de/api/interpreter

3. Manual coordinates from mapping services
```

Para cada punto intermedio:
1. Consultar el servicio de geocodificación con la dirección o nombre del lugar
2. Verificar que las coordenadas devueltas están en la región esperada
3. Comprobar que los resultados múltiples se desambigüen (elegir el correcto)
4. Almacenar las coordenadas junto con los datos originales del punto intermedio

**Esperado:** Cada punto intermedio tiene coordenadas válidas de latitud/longitud, y todos los puntos caen dentro de una región geográfica plausible (sin valores atípicos en continentes incorrectos).

**En caso de fallo:** Si la geocodificación no devuelve resultados, intentar grafías alternativas, agregar calificadores de región/país, o buscar puntos de referencia cercanos. Si un punto intermedio está en un área remota con pobre cobertura de OSM, usar WebSearch para encontrar coordenadas de blogs de viaje o sitios de turismo.

### Paso 3: Optimizar el Orden de la Ruta

Determinar la secuencia de visitas que minimiza el tiempo total de viaje o la distancia.

```
Optimization Strategies:
┌─────────────────────┬────────────────────────────────────────┐
│ Strategy            │ When to use                            │
├─────────────────────┼────────────────────────────────────────┤
│ Fixed order         │ Stops must be visited in given sequence│
│ Nearest neighbor    │ Quick approximation for 5-15 stops     │
│ TSP solver          │ Optimal ordering for any number        │
│ Time-window aware   │ Stops have opening hours constraints   │
│ Cluster-then-route  │ Stops span multiple days/regions       │
└─────────────────────┴────────────────────────────────────────┘
```

Para la heurística de vecino más cercano:
1. Comenzar en el origen designado
2. Desde la posición actual, seleccionar el punto intermedio no visitado más cercano por tiempo de viaje
3. Moverse a ese punto intermedio y marcarlo como visitado
4. Repetir hasta que todos los puntos intermedios estén visitados
5. Regresar al punto final designado (si es viaje de ida y vuelta)

Para recorridos de varios días, agrupar puntos intermedios por proximidad geográfica primero, luego optimizar dentro de cada día.

**Esperado:** Una secuencia ordenada de puntos intermedios que produce una ruta sin retrocesos excesivos. La distancia total debería estar dentro del 20% del óptimo teórico para menos de 10 paradas.

**En caso de fallo:** Si el resultado del vecino más cercano tiene retrocesos obvios (paradas posteriores están más cerca de paradas anteriores), intentar invertir la ruta o usar una mejora 2-opt: intercambiar pares de aristas y mantener el intercambio si acorta la ruta. Para restricciones de ventanas de tiempo, verificar que los tiempos de llegada a cada parada caigan dentro de los horarios de apertura.

### Paso 4: Calcular Tiempos y Distancias

Calcular el tiempo de viaje y la distancia para cada tramo de la ruta.

```
Time Estimation Methods:
┌──────────────┬────────────┬────────────────────────────────┐
│ Mode         │ Avg Speed  │ Notes                          │
├──────────────┼────────────┼────────────────────────────────┤
│ Highway      │ 100 km/h   │ Varies by country/road type    │
│ Rural road   │ 60 km/h    │ Add 20% for winding roads      │
│ City driving │ 30 km/h    │ Add time for parking            │
│ Walking      │ 4.5 km/h   │ Flat terrain; reduce for hills │
│ Cycling      │ 15 km/h    │ Touring pace with luggage      │
│ Hiking       │ 3-4 km/h   │ Use Munter formula for accuracy│
└──────────────┴────────────┴────────────────────────────────┘
```

Para cada par consecutivo de puntos intermedios:
1. Calcular la distancia en línea recta (haversine) como referencia base
2. Aplicar un factor de desvío (1.3 para carreteras, 1.4 para urbano, 1.2 para autopistas)
3. Estimar el tiempo de viaje a partir de la distancia ajustada y la velocidad del modo
4. Agregar tiempo de margen: 10% para conducción, 15% para transporte público
5. Sumar los tiempos de tramo más los tiempos de permanencia en cada parada para la duración total del recorrido

**Esperado:** Una matriz de tiempo/distancia para todos los tramos, con un tiempo acumulado que tiene en cuenta tanto el viaje como el tiempo de permanencia en cada parada. La duración total del recorrido debería ser realista (no exceder las horas de luz disponibles para recorridos a pie).

**En caso de fallo:** Si los tiempos estimados parecen poco realistas (ej., 2 horas para un recorrido urbano de 10 km), verificar si el factor de desvío es apropiado. Para carreteras de montaña, aumentar el factor de desvío a 1.6-2.0. Para transporte público, usar WebSearch para consultar horarios reales en lugar de estimar.

### Paso 5: Generar Itinerario con POIs

Compilar la ruta optimizada en un itinerario completo con puntos de interés descubiertos.

```
POI Discovery (Overpass API query pattern):
  [out:json];
  (
    node["tourism"="viewpoint"](around:RADIUS,LAT,LON);
    node["amenity"="restaurant"](around:RADIUS,LAT,LON);
    node["amenity"="cafe"](around:RADIUS,LAT,LON);
  );
  out body;

Recommended search radius:
- Along route corridor: 500 m for walking, 2 km for driving
- At waypoints: 1 km radius
```

Construir el documento de itinerario:
1. Encabezado con nombre del recorrido, fechas, distancia total, tiempo total
2. Para cada día (si es de varios días):
   - Resumen del día (inicio, fin, km totales, horas totales)
   - Para cada tramo: hora de salida, modo de viaje, distancia, duración
   - Para cada parada: hora de llegada, tiempo de permanencia, descripción, POIs cercanos
3. Sección de logística: estacionamiento, paradas de combustible, áreas de descanso, contactos de emergencia
4. Referencia del mapa (enlace a la ruta en OpenStreetMap o exportar como GPX)

**Esperado:** Un documento de itinerario completo con horarios realistas, sugerencias de POI en cada parada e información logística práctica.

**En caso de fallo:** Si las consultas de POI devuelven demasiados resultados, filtrar por calificación o relevancia. Si el itinerario excede el tiempo disponible, marcar las paradas de menor prioridad como opcionales o dividir en días adicionales. Si no se encuentran POIs en áreas remotas, anotarlo y sugerir que el viajero investigue localmente al llegar.

## Validación

- [ ] Todos los puntos intermedios están geocodificados con coordenadas válidas
- [ ] El orden de la ruta minimiza retrocesos (sin ineficiencias obvias)
- [ ] Los tiempos de viaje son realistas para el modo elegido
- [ ] Los tiempos de permanencia en cada parada están contabilizados
- [ ] La duración total del recorrido cabe dentro de la ventana de tiempo disponible
- [ ] Los POIs son relevantes y están ubicados cerca de la ruta
- [ ] Los horarios de apertura de las paradas sensibles al tiempo se respetan
- [ ] El itinerario incluye logística práctica (estacionamiento, combustible, paradas de descanso)

## Errores Comunes

- **Ignorar horarios de apertura**: Optimizar puramente por distancia puede dirigirte a un museo después de que cierra. Siempre verificar restricciones de ventana de tiempo para atracciones.
- **Subestimar el viaje urbano**: La conducción y el estacionamiento en la ciudad pueden duplicar el tiempo esperado. Agregar márgenes generosos para paradas urbanas.
- **Sobrecargar el itinerario**: Llenar cada minuto no deja margen para retrasos o descubrimientos espontáneos. Incorporar 30-60 minutos de holgura por medio día.
- **Falacia de distancia en línea recta**: La distancia haversine subestima severamente la distancia real por carretera, especialmente en terreno montañoso o costero. Siempre aplicar un factor de desvío.
- **Olvidar la logística de retorno**: Las rutas de un solo sentido necesitan planes para devolver autos de alquiler, tomar trenes o coordinar recogidas.
- **Cierres estacionales de carreteras**: Los pasos de montaña, transbordadores y rutas escénicas pueden estar cerrados estacionalmente. Verificar las fechas de acceso antes de trazar la ruta.

## Habilidades Relacionadas

- `create-spatial-visualization` — renderizar la ruta planificada en un mapa interactivo
- `generate-tour-report` — compilar el itinerario en un informe formateado de Quarto
- `plan-hiking-tour` — planificación especializada para segmentos de senderismo dentro de un recorrido
- `assess-trail-conditions` — verificar condiciones para cualquier tramo de caminata/senderismo
