---
name: prepare-print-model
description: >
  Exportar y optimizar modelos 3D para impresión FDM/SLA incluyendo exportación
  STL/3MF, verificación de integridad de malla, comprobación de grosor de pared,
  generación de soportes y laminado. Usar al exportar desde software CAD o de
  modelado para impresión 3D, verificar que archivos STL/3MF sean imprimibles
  antes del laminado, resolver problemas de modelos que fallan al laminar
  correctamente, optimizar la orientación de piezas para resistencia o acabado
  superficial, o convertir entre formatos de modelo preservando la imprimibilidad.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: 3d-printing
  complexity: intermediate
  language: multi
  tags: 3d-printing, fdm, sla, slicing, mesh-repair, supports
  locale: es
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# Prepare Print Model

Exportar y optimizar modelos 3D para manufactura aditiva. Esta habilidad cubre el flujo de trabajo completo desde la exportación del software CAD/modelado hasta la reparación de malla, análisis de imprimibilidad, generación de soportes y configuración del slicer. Asegura que los modelos sean manifold, tengan grosor de pared adecuado y estén correctamente orientados para resistencia y calidad de impresión.

## Cuándo Usar

- Exportar modelos desde software CAD (Fusion 360, SolidWorks, Onshape) o herramientas de modelado 3D (Blender, Maya) para impresión 3D
- Verificar que archivos STL/3MF existentes sean imprimibles antes de enviarlos al slicer
- Resolver problemas de modelos que fallan al laminar o imprimir correctamente
- Optimizar la orientación de piezas para resistencia, acabado superficial o mínimo material de soporte
- Preparar piezas mecánicas con requisitos específicos de resistencia o tolerancia
- Convertir entre formatos de modelo (STL, 3MF, OBJ) preservando la imprimibilidad

## Entradas

- **Requerido**: **source_model** — Ruta al archivo CAD o modelo 3D (STEP, F3D, STL, OBJ, 3MF)
- **Requerido**: **target_process** — Tipo de proceso de impresión (`fdm`, `sla`, `sls`)
- **Requerido**: **material** — Material de impresión previsto (ej., `pla`, `petg`, `abs`, `standard-resin`)
- **Opcional**: **functional_requirements** — Dirección de carga, requisitos de tolerancia, necesidades de acabado superficial
- **Opcional**: **printer_specs** — Volumen de construcción, diámetro de boquilla (FDM), capacidades de altura de capa
- **Opcional**: **slicer_tool** — Slicer objetivo (`cura`, `prusaslicer`, `orcaslicer`, `chitubox`)

## Procedimiento

### 1. Exportar Modelo desde el Software Fuente

Exportar el modelo 3D en un formato adecuado para impresión:

**For FDM/SLA**:
```bash
# If starting from CAD (Fusion 360, SolidWorks)
# Export as: STL (binary) or 3MF
# Resolution: High (triangle count sufficient for detail)
# Units: mm (verify scale)

# Example export settings:
# STL: Binary format, refinement 0.1mm
# 3MF: Include color/material data if using multi-material printer
```

**Esperado:** Archivo de modelo exportado con resolución apropiada (tolerancia de cuerda de 0.1mm para piezas mecánicas, 0.05mm para formas orgánicas).

**En caso de fallo:** Verificar que el modelo esté completamente definido (sin geometría de construcción), sin caras faltantes, todos los componentes visibles.

### 2. Verificar la Integridad de la Malla

Verificar que la malla sea manifold e imprimible:

```bash
# Install mesh repair tools if needed
# sudo apt install meshlab admesh

# Check STL file for errors
admesh --check model.stl

# Look for:
# - Non-manifold edges: 0 (every edge connects exactly 2 faces)
# - Holes: 0
# - Backwards/inverted normals: 0
# - Degenerate facets: 0
```

**Problemas comunes**:
- **Aristas no manifold**: Múltiples caras comparten una arista, o la arista tiene solo una cara
- **Agujeros**: Huecos en la superficie de la malla
- **Normales invertidas**: Interior/exterior del modelo invertidos
- **Caras intersectantes**: Geometría auto-intersectante

**Esperado:** El informe muestra 0 errores, o los errores son reparables.

**En caso de fallo:** Reparar la malla automática o manualmente:

```bash
# Automatic repair with admesh
admesh --write-binary-stl=model_fixed.stl \
       --exact \
       --nearby \
       --remove-unconnected \
       --fill-holes \
       --normal-directions \
       model.stl

# Or use meshlab GUI for manual inspection/repair
meshlab model.stl
# Filters → Cleaning and Repairing → Remove Duplicate Vertices
# Filters → Cleaning and Repairing → Remove Duplicate Faces
# Filters → Normals → Re-Orient all faces coherently
```

Si la reparación automática falla, volver al software fuente y corregir errores de modelado (vértices coincidentes, aristas abiertas, cuerpos superpuestos).

### 3. Verificar Grosor de Pared

Verificar el grosor mínimo de pared para el proceso elegido:

**Grosor mínimo de pared por proceso**:

| Process | Min Wall | Recommended Min | Structural Parts |
|---------|----------|-----------------|------------------|
| FDM (0.4mm nozzle) | 0.8mm | 1.2mm | 2.4mm+ |
| FDM (0.6mm nozzle) | 1.2mm | 1.8mm | 3.6mm+ |
| SLA (standard) | 0.4mm | 0.8mm | 2.0mm+ |
| SLA (engineering) | 0.6mm | 1.2mm | 2.5mm+ |
| SLS (nylon) | 0.7mm | 1.0mm | 2.0mm+ |

```bash
# Check wall thickness visually in slicer:
# - Import model
# - Enable "Thin walls" detection
# - Slice with 0 infill to see wall structure

# For precise measurement, use CAD software:
# - Measure distance between parallel surfaces
# - Check in critical load-bearing areas
```

**Esperado:** Todas las paredes cumplen el grosor mínimo para el proceso elegido. Paredes delgadas marcadas para revisión.

**En caso de fallo:** Volver al CAD y engrosar las paredes, o:
- Cambiar a boquilla más pequeña (FDM)
- Usar la configuración "detectar paredes delgadas" del slicer
- Aceptar resistencia reducida para prototipos

### 4. Determinar la Orientación de Impresión

Seleccionar la orientación para optimizar resistencia, acabado superficial y uso de soportes:

**Orientation decision matrix**:

**For strength**:
- Orient so layer lines run perpendicular to primary load direction
- Example: Bracket under tension → print vertically so layers stack along load axis

**For surface finish**:
- Orient largest/most visible surface flat on bed (minimal stair-stepping)
- Critical dimensions aligned with X/Y plane (higher precision than Z)

**For minimal supports**:
- Minimize overhangs >45° (FDM) or >30° (SLA)
- Place flat surfaces on bed when possible

**Load direction analysis**:
```
If part experiences:
- Tensile load along axis → print with layers perpendicular to axis
- Compressive load → layers can be parallel (less critical)
- Bending moment → layers perpendicular to neutral axis
- Shear → avoid layer interfaces parallel to shear direction
```

**Esperado:** Orientación elegida con justificación explícita para compromisos de resistencia, acabado o soportes.

**En caso de fallo:** Si ninguna orientación satisface todos los requisitos, priorizar en orden: resistencia funcional -> precisión dimensional -> acabado superficial -> minimización de soportes.

### 5. Generar Estructuras de Soporte

Configurar soportes automáticos o manuales para voladizos:

**Support angle thresholds**:
- FDM: 45° from vertical (some bridging up to 60° possible)
- SLA: 30° from vertical (less bridging capability)
- SLS: No supports needed (powder bed support)

**Support types**:

**Tree supports** (FDM, recommended):
- Fewer contact points with model
- Easier removal
- Better for organic shapes
- Configure: Branch angle 40-50°, branch density medium

**Linear supports** (FDM, traditional):
- More stable for large overhangs
- More contact points (harder removal)
- Configure: Pattern grid, density 15-20%, interface layers 2-3

**Heavy supports** (SLA):
- Thicker contact points for heavy parts
- Risk of marks on surface
- Configure: Contact diameter 0.5-0.8mm, density based on part weight

**Interface layers**:
- Add 2-3 interface layers between support and model
- Reduces surface marks
- Slightly easier removal

```bash
# In slicer (PrusaSlicer example):
# Print Settings → Support material
# - Generate support material: Yes
# - Overhang threshold: 45° (FDM) / 30° (SLA)
# - Pattern: Rectilinear / Tree (auto)
# - Interface layers: 3
# - Interface pattern spacing: 0.2mm
```

**Esperado:** Soportes generados para todos los voladizos que excedan el ángulo umbral, la vista previa no muestra geometría flotante.

**En caso de fallo:** Si los soportes automáticos son inadecuados:
- Agregar refuerzos de soporte manuales en áreas críticas
- Aumentar la densidad de soportes cerca de voladizos delgados
- Dividir el modelo e imprimir en secciones si los soportes son inviables

### 6. Configurar el Perfil del Slicer

Establecer parámetros apropiados para el proceso:

**FDM layer heights**:
- Draft: 0.28-0.32mm (fast, visible layers)
- Standard: 0.16-0.20mm (balanced quality/speed)
- Fine: 0.08-0.12mm (smooth, slow)
- Rule: Layer height = 25-75% of nozzle diameter

**SLA layer heights**:
- Standard: 0.05mm (balanced)
- Fine: 0.025mm (miniatures, high detail)
- Fast: 0.1mm (prototypes)

**Key parameters by process**:

**FDM**:
```yaml
layer_height: 0.2mm
line_width: 0.4mm (= nozzle diameter)
perimeters: 3-4 (structural), 2 (cosmetic)
top_bottom_layers: 5 (0.2mm layers = 1mm solid)
infill_percentage: 20% (cosmetic), 40-60% (functional)
infill_pattern: gyroid (FDM), grid (basic)
print_speed: 50mm/s perimeter, 80mm/s infill
temperature: material-specific (see select-print-material skill)
```

**SLA**:
```yaml
layer_height: 0.05mm
bottom_layers: 6-8 (strong bed adhesion)
exposure_time: material-specific (2-8s per layer)
bottom_exposure_time: 30-60s
lift_speed: 60-80mm/min
retract_speed: 150-180mm/min
```

**Esperado:** Perfil configurado con valores por defecto apropiados para el proceso, modificado para requisitos específicos de material/modelo.

**En caso de fallo:** Si no se está seguro de los parámetros, comenzar con el perfil "Calidad Estándar" por defecto del slicer para el material elegido, luego iterar.

### 7. Previsualizar el Laminado Capa por Capa

Inspeccionar el G-code laminado en busca de problemas:

```bash
# In slicer:
# - Slice model
# - Use layer preview slider to inspect each layer
# - Check for:
#   * Gaps in perimeters (indicates thin walls)
#   * Floating regions (missing supports)
#   * Excessive stringing paths (reduce travel)
#   * First layer: proper squish and adhesion
#   * Top layers: sufficient solid infill
```

**Señales de alerta en la vista previa**:
- **Huecos blancos en regiones sólidas**: Paredes demasiado delgadas para el ancho de línea actual
- **Desplazamientos sobre largas distancias**: Aumentar retracción o agregar z-hop
- **Primera capa sin aplastamiento**: Ajustar Z-offset hacia abajo 0.05mm
- **Capas superiores dispersas**: Aumentar capas sólidas superiores a 5+

**Esperado:** La vista previa muestra perímetros continuos, relleno adecuado, desplazamientos limpios y sin defectos obvios.

**En caso de fallo:** Ajustar configuraciones del slicer y re-laminar. Correcciones comunes:
- Huecos en paredes delgadas -> Habilitar "Detectar paredes delgadas" o reducir ancho de línea
- Mal puenteo -> Reducir velocidad de puente a 30mm/s, aumentar enfriamiento
- Hilos -> Aumentar distancia de retracción +1mm, reducir temperatura -5°C

### 8. Exportar G-code y Verificar

Guardar el G-code laminado con nombre descriptivo:

```bash
# Naming convention:
# <part_name>_<material>_<layer_height>_<profile>.gcode
# Example: bracket_petg_0.2mm_standard.gcode

# Verify G-code:
grep "^;PRINT_TIME:" model.gcode  # Check estimated time
grep "^;Filament used:" model.gcode  # Check material usage
head -n 50 model.gcode | grep "^M104\|^M140"  # Verify temperatures

# Expected first layer temp:
# M140 S85  (bed temp for PETG)
# M104 S245 (hotend temp for PETG)
```

**Lista de verificación pre-impresión**:
- [ ] Cama nivelada y limpia
- [ ] Material correcto cargado y seco
- [ ] Temperaturas coinciden con los requisitos del material
- [ ] Z-offset de primera capa calibrado
- [ ] Filamento/resina suficiente restante
- [ ] Tiempo de impresión aceptable para el plan de monitoreo

**Esperado:** Archivo G-code guardado con metadatos embebidos, temperaturas verificadas, estimación de tiempo/material de impresión razonable.

**En caso de fallo:** Si el tiempo de impresión es excesivo (>12 horas), considerar:
- Aumentar altura de capa (0.2 -> 0.28mm ahorra ~30% de tiempo)
- Reducir perímetros (4 -> 3)
- Reducir relleno (40% -> 20% para no estructurales)
- Reducir escala del modelo si el tamaño no es crítico

## Validación

- [ ] Modelo exportado desde software fuente con unidades correctas (mm) y escala
- [ ] Integridad de malla verificada: manifold, sin agujeros, normales correctas
- [ ] Grosor de pared cumple el mínimo para el proceso elegido (>=0.8mm FDM, >=0.4mm SLA)
- [ ] Orientación de impresión optimizada para compromisos de resistencia, acabado o soportes
- [ ] Soportes generados para todos los voladizos >45° (FDM) o >30° (SLA)
- [ ] Perfil del slicer configurado con altura de capa y parámetros apropiados
- [ ] Vista previa capa por capa inspeccionada, sin huecos ni regiones flotantes
- [ ] G-code exportado con temperaturas verificadas y tiempo de impresión razonable
- [ ] Lista de verificación pre-impresión completada (cama nivelada, material cargado, etc.)

## Errores Comunes

1. **Saltarse la reparación de malla**: Las mallas no manifold pueden laminarse pero fallan al imprimir correctamente con huecos o capas malformadas
2. **Ignorar el grosor de pared**: Las paredes delgadas (< mínimo) tendrán huecos, reduciendo drásticamente la resistencia
3. **Orientación incorrecta para resistencia**: Imprimir piezas bajo tensión con capas paralelas a la dirección de carga crea un plano de delaminación débil
4. **Soportes insuficientes**: Subestimar el ángulo de voladizo lleva a caída, hilos o fallo completo
5. **Descuido de la primera capa**: El 90% de los fallos de impresión ocurren en la primera capa — Z-offset y adhesión a la cama son críticos
6. **Temperatura de Internet**: Cada combinación impresora/material es única; siempre calibrar la temperatura con pruebas de torre
7. **Detalle excesivo para la altura de capa**: Características finas menores que 2x la altura de capa no se resolverán correctamente
8. **No previsualizar el laminado**: Los slicers pueden tomar decisiones inesperadas (huecos en paredes delgadas, relleno extraño); siempre previsualizar antes de imprimir
9. **Higroscopicidad del material**: El filamento húmedo (especialmente Nylon, TPU, PETG) causa mala adhesión entre capas, hilos y fragilidad
10. **Exceso de confianza en soportes**: Piezas pesadas con grandes voladizos aún pueden ceder incluso con soportes — probar primero con modelos más pequeños

## Habilidades Relacionadas

- **[select-print-material](../select-print-material/SKILL.md)**: Elegir material apropiado basado en requisitos mecánicos, térmicos y químicos
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**: Diagnosticar y corregir fallos de impresión si el modelo preparado aún falla
- **Model with Blender** (habilidad futura): Crear modelos 3D optimizados para impresión desde cero
- **Calibrate 3D Printer** (habilidad futura): E-steps, tasa de flujo, torres de temperatura y ajuste de retracción
