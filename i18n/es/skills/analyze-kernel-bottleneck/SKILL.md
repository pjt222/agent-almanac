---
name: analyze-kernel-bottleneck
description: >
  Systematically identify whether a GPU kernel is compute-bound, memory-bound,
  or latency-bound using roofline analysis, occupancy calculations, compute/load
  ratio per tile, and SASS instruction inspection. Produces a decision matrix
  for optimization strategy selection (cp.async, warp interleaving, tiling,
  double-buffering, or CuAssembler hand-tuning).
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gpu-optimization
  complexity: advanced
  language: CUDA
  tags: gpu, roofline, occupancy, sass, tensor-core, bottleneck-analysis, compute-load-ratio
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Analyze Kernel Bottleneck

Identifica sistemáticamente si un kernel de GPU está limitado por cómputo, memoria o latencia midiendo el rendimiento de referencia, clasificándolo en el roofline, calculando la ocupación y la razón cómputo/carga por tile, inspeccionando la mezcla de instrucciones SASS y los códigos de stall, verificando el acantilado de memoria compartida, y aplicando una matriz de decisión para seleccionar la estrategia de optimización correcta.

## Cuándo Usar

- Antes de optimizar cualquier kernel CUDA -- establecer la línea base y clasificar el tipo de cuello de botella
- Después de escribir una primera versión funcional de un kernel para identificar la ruta de optimización
- Cuando un kernel rinde por debajo de las expectativas relativas al pico teórico
- Al decidir entre cp.async, tiles más grandes o reestructuración algorítmica

## Entradas

- **Requerido**: Kernel compilado (`.cubin` o fuente `.cu` con comando de build)
- **Requerido**: Arnés de benchmark que lanza el kernel con temporización por eventos CUDA
- **Requerido**: Dimensiones del problema (p. ej., M, N, K para GEMM; seq_len, heads, head_dim para attention)
- **Opcional**: Arquitectura de GPU objetivo (predeterminado: GA104 / sm_86 / RTX 3070 Ti)
- **Opcional**: Porcentaje de utilización pico esperado para comparación
- **Opcional**: Datos de profiling previos (informes de Nsight Compute)

## Procedimiento

### Paso 1: Medir Rendimiento de Referencia

Ejecutar el kernel con eventos CUDA (`BenchTimer`), registrar tiempo en milisegundos. Calcular métricas efectivas de rendimiento:

1. **Compilar** el kernel si aún no está construido:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **Ejecutar** con tamaños de problema representativos, asegurando que las ejecuciones de calentamiento precedan a la medición:
   ```bash
   ./bench 4096 4096 4096
   ```
3. **Registrar** el tiempo del kernel en ms desde eventos CUDA (no reloj de pared).
4. **Calcular** GFLOPS efectivos y ancho de banda efectivo:
   - GEMM: `effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - Kernels limitados por ancho de banda: `effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention: `effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

**Esperado:** Números de referencia: tiempo del kernel en ms, GFLOPS efectivos y ancho de banda efectivo.

**En caso de fallo:** Verificar que el kernel se lanza sin error (macro `CHECK_CU`). Verificar que las ejecuciones de calentamiento preceden a la medición. Asegurar que las dimensiones del problema son lo suficientemente grandes para saturar la GPU (problemas pequeños pueden tener cuello de botella en la sobrecarga de lanzamiento).

### Paso 2: Clasificar en el Roofline

Calcular la intensidad aritmética y compararla con el punto de equilibrio de la máquina para clasificar el kernel:

1. **Calcular intensidad aritmética**: `AI = FLOPs / bytes_loaded_from_global_memory`. Contar solo bytes únicos cargados desde DRAM (no memoria compartida ni reuso de registros).
2. **Buscar el punto de equilibrio de la máquina**: `balance = peak_compute / peak_bandwidth`.
3. **Clasificar**: Si `AI < balance`, el kernel está limitado por memoria. Si `AI > balance`, el kernel está limitado por cómputo.

**Valores de Referencia GA104 (RTX 3070 Ti):**

| Recurso | Pico | Unidad |
|----------|------|------|
| FP32 FFMA | 21.7 | TFLOPS |
| FP16 Tensor Core (HMMA) | 174 | TFLOPS |
| INT8 Tensor Core (IMMA) | 696 | TOPS |
| Ancho de banda DRAM | 608 | GB/s |
| Caché L2 | 4 | MB |
| SMs | 48 | |

**Puntos de Equilibrio Derivados:**

| Precisión | Punto de Equilibrio (FLOP/byte) |
|-----------|--------------------------|
| FP32 FFMA | 21700 / 608 = 35.7 |
| FP16 TC | 174000 / 608 = 286.2 |
| INT8 TC | 696000 / 608 = 1144.7 |

4. **Calcular fracción alcanzada**: `attained = effective_throughput / peak_throughput`. Si está limitado por memoria: comparar el ancho de banda efectivo con 608 GB/s. Si está limitado por cómputo: comparar GFLOPS efectivos con el pico relevante.

**Esperado:** Clasificación como limitado por cómputo, memoria o latencia (baja ocupación que causa que ni el cómputo ni la memoria se saturen) con justificación numérica.

**En caso de fallo:** Recontar bytes. Atención a re-lecturas redundantes (p. ej., 9x en conv2d directo sin im2col). Si ni el cómputo ni la memoria están saturados, el kernel probablemente está limitado por latencia (ver Paso 3).

### Paso 3: Calcular la Ocupación

Determinar warps activos por SM a partir de la configuración de lanzamiento y el uso de recursos:

1. **Extraer uso de recursos**:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **Desde la configuración de lanzamiento**: `warps_per_block = threads_per_block / 32`.
3. **Calcular blocks/SM** desde cada factor limitante:
   - Límite de registros: `floor(65536 / (registers_per_thread * threads_per_block))`
   - Límite de smem: `floor(available_smem_per_SM / smem_per_block)` -- ver Paso 6 para el acantilado
   - Límite de warps: `floor(48 / warps_per_block)` (GA104 max: 48 warps/SM)
   - Límite de bloques: 16 bloques/SM máximo en GA104
4. **Bloques/SM reales** = `min(register_limit, smem_limit, warp_limit, block_limit)`.
5. **Warps activos/SM** = `blocks_per_SM * warps_per_block`.
6. **Umbral clave**: 8 warps/SM es suficiente para ocultar latencia en GA104. Por debajo de 8 = problema estructural que causa comportamiento limitado por latencia.

**Esperado:** Tabla de ocupación que muestra blocks/SM, warps activos/SM y el factor limitante (registros, smem o warps).

**En caso de fallo:** Verificar `cuFuncSetAttribute` para memoria compartida dinámica. Verificar que los reportes de `--resource-usage` coincidan con la configuración de lanzamiento real. Si el conteo de registros es inesperadamente alto, probar `--maxrregcount=N` para limitar registros (intercambiando spills de registros por ocupación).

### Paso 4: Calcular la Razón Cómputo/Carga Por Tile

Contar instrucciones de cómputo y bytes de carga por K-tile desde SASS (no código fuente):

1. **Desensamblar**:
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **Contar instrucciones de cómputo por tile** (el bucle interno sobre un K-tile):
   - `grep -c 'HMMA' kernel.sass` -- ops FP16 Tensor Core
   - `grep -c 'IMMA' kernel.sass` -- ops INT8 Tensor Core
   - `grep -c 'FFMA' kernel.sass` -- multiplicación-suma fusionada FP32
3. **Contar cargas globales por tile**:
   - `grep -c 'LDG' kernel.sass` -- cargas de memoria global
   - Multiplicar por bytes por carga (típicamente 16 bytes para LDG.128)
4. **Calcular razón**: `compute_ops / load_ops` por tile.
5. **Clasificar** usando el umbral de decisión cp.async (de gpu_reflections.md Insight 2):
   - **Alto** (>20:1): cp.async es netamente negativo; warp interleaving ya oculta la latencia DRAM. Enfocarse en cambios algorítmicos. Referencia: Flash Attention tiene 64 HMMA por tile = razón alta, cp.async medido -5%.
   - **Medio** (5-20:1): cp.async puede ayudar, hacer benchmark de ambas rutas.
   - **Bajo** (<5:1): cp.async fuertemente beneficioso; las cargas dominan y la copia asíncrona oculta la latencia. Referencia: IGEMM tiene 8 IMMA por tile = razón baja, cp.async medido +35%.

**Esperado:** Razón cómputo/carga con clasificación (alto/medio/bajo) y recomendación de cp.async.

**En caso de fallo:** Contar desde el desensamblado SASS, no desde el código fuente -- el compilador puede fusionar, eliminar o reordenar instrucciones. Asegurarse de contar instrucciones únicamente dentro del bucle interno (la iteración del K-tile), no del kernel completo.

### Paso 5: Inspeccionar Instrucciones SASS

Examinar la mezcla completa de instrucciones SASS y los códigos de stall:

1. **Desensamblar** (si no se hizo en el Paso 4):
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **Contar tipos de instrucciones clave**:
   ```bash
   grep -c 'HMMA.16816' kernel.sass      # FP16 Tensor Core
   grep -c 'IMMA.16816' kernel.sass      # INT8 Tensor Core
   grep -c 'FFMA' kernel.sass            # FP32 fused multiply-add
   grep -c 'LDGSTS' kernel.sass          # cp.async (global->shared)
   grep -c 'LDG' kernel.sass             # Global load
   grep -c 'STS' kernel.sass             # Shared store
   grep -c 'LDS' kernel.sass             # Shared load
   grep -c 'BAR.SYNC' kernel.sass        # Barrier synchronization
   grep -c 'SHFL' kernel.sass            # Warp shuffle (reductions)
   grep -c 'MUFU' kernel.sass            # Special function unit
   ```
3. **Verificar códigos de stall** en instrucciones críticas:
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **Identificar objetivos de optimización**:
   - Stalls HMMA S08: mínimo de hardware en Ampere, no se puede reducir. Enfocarse en otra parte.
   - Stalls IMMA S04: el compilador es conservador. CuAssembler puede ajustar a S02 (15-20% de ganancia medida).
   - Stalls FFMA S04: si son independientes, reducibles a S01 vía CuAssembler.
   - BAR.SYNC excesivo: puede indicar sobre-sincronización entre etapas del pipeline.

**Esperado:** Tabla de conteo de instrucciones y resumen de códigos de stall con objetivos de optimización identificados.

**En caso de fallo:** Asegurar que la arquitectura de `cuobjdump` coincide con el objetivo de compilación del kernel (ambos deben ser sm_86). Si la salida SASS está vacía, el cubin puede estar corrupto -- recompilar.

### Paso 6: Verificar el Acantilado de Smem

Determinar si el uso de memoria compartida cruza el acantilado de ocupación específico de la arquitectura:

1. **Leer smem/block** desde la salida de `--resource-usage` (Paso 3) o `cuobjdump --res-usage kernel.sm_86.cubin`.
2. **Comparar con el umbral del acantilado**:
   - GA104 (sm_86): 100 KB max smem/SM. Acantilado en 50 KB/block.
   - Confirmado empíricamente: 48 KB/block -> 2 blocks/SM (bueno), 56 KB/block -> 1 block/SM (regresión 2x).
3. **Si está por encima del acantilado** (smem > 50 KB/block):
   - Blocks/SM cae a 1, warps activos caen a warps_per_block (típicamente 4).
   - Se espera regresión de rendimiento 2x por stalls de DRAM expuestos.
4. **Verificar el impacto del double-buffering**: El double-buffering duplica el uso de smem. Si la smem actual es 30 KB, double-buffered = 60 KB, lo cual cruza el acantilado. Evaluar si el beneficio asíncrono supera la pérdida de ocupación.
5. **Registrar** smem/block, blocks/SM y si el acantilado se cruza.

**Esperado:** Valor smem/block con conteo blocks/SM y declaración explícita de si el acantilado de 50 KB se cruza.

**En caso de fallo:** Si está por encima del acantilado y la ocupación es el cuello de botella, la estrategia de optimización debe cambiar: reducir el tamaño del tile para tener smem por debajo de 50 KB, o aceptar 1 block/SM y compensar con una razón cómputo/carga más alta por tile (más reuso de registros, K-tiles más largos).

### Paso 7: Construir la Matriz de Decisión

Sintetizar los hallazgos de los Pasos 2-6 en una estrategia de optimización:

| Condición | Estrategia |
|-----------|----------|
| Limitado por memoria + razón cómputo/carga baja (<5:1) + smem bajo el acantilado | Software pipelining con cp.async (LDGSTS). Solapar cargas globales con cómputo. |
| Limitado por memoria + razón cómputo/carga alta (>20:1) + 8+ warps | Warp interleaving ya oculta latencia. Enfocarse en cambios algorítmicos: implicit GEMM, split-Q, im2col. |
| Limitado por cómputo + pesado en FFMA | Ajuste de códigos de stall con CuAssembler: S04 -> S01 en FFMAs independientes. |
| Limitado por cómputo + pesado en HMMA | S08 es mínimo de hardware, no se puede reducir. Aumentar reuso de tile (tiles M/N más grandes, K-loop más largo). |
| Limitado por cómputo + pesado en IMMA | CuAssembler: S04 -> S02 en instrucciones IMMA (el compilador es conservador). |
| Limitado por latencia (baja ocupación, ninguno saturado) | Reducir smem o registros para obtener más blocks/SM. Subir por encima de 8 warps/SM. |
| Smem por encima del acantilado | Reducir el tamaño del tile o reestructurar para tener smem/block bajo 50 KB (GA104). |

1. **Clasificar** las estrategias aplicables por ganancia esperada, usando los datos de razón cómputo/carga y ocupación.
2. **Estimar el rango de ganancia** para cada estrategia basándose en cuán lejos está el kernel del techo relevante.
3. **Marcar conflictos**: p. ej., cp.async duplica smem (puede cruzar el acantilado), tiles más grandes aumentan la presión de registros (puede reducir la ocupación).

**Esperado:** Lista clasificada de optimizaciones recomendadas con rango de ganancia predicho y conflictos potenciales.

**En caso de fallo:** Si no emerge un ganador claro, ejecutar micro-benchmarks aislando cada estrategia (p. ej., probar cp.async solo, probar tamaño de tile reducido solo) para medir el impacto real antes de combinar.

### Paso 8: Documentar Hallazgos

Producir un reporte estructurado del cuello de botella:

1. **Línea base**: tiempo del kernel, GFLOPS efectivos, ancho de banda efectivo, dimensiones del problema.
2. **Posición en el roofline**: intensidad aritmética, clasificación, fracción alcanzada del pico.
3. **Ocupación**: blocks/SM, warps activos/SM, factor limitante.
4. **Razón cómputo/carga**: valor de la razón, clasificación (alto/medio/bajo), recomendación de cp.async.
5. **Resumen SASS**: tabla de conteo de instrucciones, hallazgos de códigos de stall, objetivos de CuAssembler.
6. **Acantilado smem**: smem/block, blocks/SM, estado del acantilado.
7. **Recomendación**: estrategias de optimización clasificadas con estimaciones de ganancia.

```markdown
## Bottleneck Analysis Report: [kernel_name]

### Baseline
- Problem: [dimensions]
- Kernel time: [X] ms
- Effective GFLOPS: [Y] | Effective BW: [Z] GB/s

### Roofline Classification
- Arithmetic intensity: [AI] FLOP/byte
- Balance point: [BP] FLOP/byte ([precision])
- Classification: **[compute|memory|latency]-bound**
- Attained fraction: [X]% of peak

### Occupancy
| Resource | Per Block | Limit/SM | Blocks/SM |
|----------|-----------|----------|-----------|
| Registers | [N]/thread | 65536 | [B] |
| Shared mem | [X] KB | 100 KB (cliff: 50 KB) | [B] |
| Warps | [W] | 48 | [B] |
| **Limiting** | | | **[min(B)]** |
- Active warps/SM: [W] ([sufficient|insufficient] for latency hiding)

### Compute/Load Ratio
- Compute ops/tile: [N] [HMMA|IMMA|FFMA]
- Load bytes/tile: [N] bytes ([N] LDG x [N] bytes)
- Ratio: [X]:1 — **[high|medium|low]**
- cp.async recommendation: [beneficial|neutral|detrimental]

### SASS Instruction Mix
| Instruction | Count | Notes |
|-------------|-------|-------|
| HMMA.16816 | [N] | Stall: S08 (hardware min) |
| IMMA.16816 | [N] | Stall: S04 (reducible to S02) |
| FFMA | [N] | Stall: S04 (reducible to S01) |
| LDG | [N] | |
| LDGSTS | [N] | cp.async |
| BAR.SYNC | [N] | |

### Smem Cliff
- Smem/block: [X] KB — [under|over] 50 KB cliff
- Blocks/SM: [B] — [no occupancy loss|occupancy halved]

### Recommended Optimizations (ranked)
1. [Strategy] — estimated [X-Y]% gain
2. [Strategy] — estimated [X-Y]% gain
3. [Strategy] — estimated [X-Y]% gain
```

**Esperado:** Reporte markdown completo consumible por un agente kernel-optimizer o desarrollador humano.

**En caso de fallo:** Re-ejecutar con diferentes tamaños de problema (p. ej., 1024, 2048, 4096, 8192) para confirmar que los hallazgos no son específicos del tamaño. Problemas pequeños pueden parecer limitados por latencia cuando el cuello de botella real a escala es el ancho de banda de memoria.

## Validación

- [ ] Línea base medida con eventos CUDA (no reloj de pared)
- [ ] Clasificación en el roofline determinada (limitado por cómputo/memoria/latencia)
- [ ] Ocupación calculada con factor limitante identificado
- [ ] Razón cómputo/carga por tile calculada desde SASS
- [ ] Mezcla de instrucciones SASS y códigos de stall documentados
- [ ] Acantilado smem verificado contra el umbral de la arquitectura
- [ ] Matriz de decisión aplicada con recomendación de estrategia
- [ ] Hallazgos documentados en reporte estructurado

## Errores Comunes

- **Multiplicación de re-lecturas**: Conv2d directo lee cada peso 9x sin im2col, inflando el conteo de bytes 9x. Usar bytes únicos reales cargados desde DRAM, no instrucciones de carga totales, al calcular la intensidad aritmética.
- **Confundir el pico FP16 Tensor Core con el pico FP32**: El pico FP16 TC es 174 TFLOPS, el pico FP32 FFMA es 21.7 TFLOPS -- una diferencia de 8x. Usar el pico equivocado hace la clasificación del roofline carezca de sentido.
- **Usar 64 KB como acantilado smem en lugar de 50 KB en GA104**: GA104 (sm_86) tiene 100 KB max smem/SM. El acantilado está en 100/2 = 50 KB/block, no 64 KB. Esto es específico de la arquitectura; otras GPUs difieren.
- **Ignorar warp interleaving al evaluar cp.async**: 8 warps con fases de cómputo largas (razón cómputo/carga alta) ya ocultan la latencia DRAM mediante el scheduling de warps. Añadir cp.async en este régimen añade presión de smem y sobrecarga de barrera sin beneficio (medido -5% en Flash Attention).
- **Contar instrucciones desde código fuente en lugar de SASS**: El compilador puede fusionar operaciones, eliminar código muerto, desenrollar bucles de manera diferente o reordenar instrucciones. Siempre contar desde la salida de `cuobjdump -sass`.
- **No ejecutar iteraciones de calentamiento**: El primer lanzamiento del kernel incluye sobrecarga de compilación JIT y efectos de caché frío. Siempre ejecutar 2-5 iteraciones de calentamiento antes de la ejecución medida.

## Habilidades Relacionadas

- `pipeline-gpu-kernel` -- implementar software pipelining con cp.async cuando el análisis identifica un kernel limitado por memoria con razón cómputo/carga baja
- `simulate-cpu-architecture` -- análisis de arquitectura complementario para cuellos de botella del lado CPU en flujos de trabajo host-device
