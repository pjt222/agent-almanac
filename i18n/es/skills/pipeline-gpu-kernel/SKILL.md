---
name: pipeline-gpu-kernel
description: >
  Apply software pipelining (double-buffering) to a tiled GPU kernel to overlap
  global memory loads with Tensor Core computation. Covers prologue/loop/epilogue
  restructuring, LDG-register vs cp.async (LDGSTS) variant selection based on
  compute/load ratio, shared memory budget verification against architecture-specific
  occupancy cliffs, and SASS-level verification of load/compute overlap.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gpu-optimization
  complexity: advanced
  language: CUDA
  tags: gpu, software-pipelining, double-buffer, cp-async, ldgsts, tensor-core, smem, occupancy
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Pipeline GPU Kernel

Aplicar software pipelining (double-buffering) a un kernel de GPU tileado para que las cargas de memoria global del tile N+1 se solapen con la computación de Tensor Core en el tile N. Transformar un K-loop secuencial load-sync-compute-sync en una estructura prologue/loop/epilogue, elegir entre variantes LDG-register y cp.async (LDGSTS) basándose en la razón cómputo/carga, verificar que la memoria compartida se mantiene bajo el acantilado de ocupación de la arquitectura y confirmar el solapamiento carga/cómputo en el SASS final.

## Cuándo Usar

- Cuando `analyze-kernel-bottleneck` identifica un kernel limitado por memoria con razón cómputo/carga baja por tile
- Cuando el warp interleaving solo no puede ocultar la latencia DRAM (~300 ciclos en GA104)
- Cuando el kernel tiene un K-loop secuencial load-sync-compute-sync que puede reestructurarse
- No es necesario cuando la razón cómputo/carga es alta (>20:1) y 8+ warps están activos

## Entradas

- **Requerido**: Archivo fuente del kernel CUDA (`.cu`) con un K-loop tileado conteniendo fases de carga y cómputo separadas
- **Requerido**: Arquitectura de GPU objetivo (p. ej., GA104 / sm_86 — determina el acantilado smem y los límites de ocupación)
- **Requerido**: Tamaños actuales de tile (BM, BN, BK) y tipo de dato (FP16, FP32, INT8)
- **Opcional**: Razón cómputo/carga por tile (de `analyze-kernel-bottleneck`; se estimará si no se proporciona)
- **Opcional**: Línea base de benchmark (rendimiento no-pipelined al tamaño de problema objetivo)

## Procedimiento

### Paso 1: Verificar Precondiciones

Confirmar que el kernel tiene un K-loop tileado con fases distintas de carga y cómputo separadas por `__syncthreads()`. Calcular el costo doblado de memoria compartida y verificar que se mantiene bajo el acantilado de ocupación de la arquitectura.

1. Localizar el K-loop en el kernel. Debe tener esta estructura secuencial: cargar tiles A y B desde global a memoria compartida, `__syncthreads()`, computar (HMMA/IMMA/FFMA) en los tiles de memoria compartida, `__syncthreads()`.
2. Registrar los tamaños de memoria compartida de un solo buffer: `smem_a_size = BM * BK * sizeof(T)` y `smem_b_size = BK * BN * sizeof(T)`.
3. Calcular el costo de double-buffer: `smem_doubled = smem_a_size * 2 + smem_b_size * 2`.
4. Comparar contra el acantilado de la arquitectura. GA104 (sm_86): 100 KB max smem/SM, acantilado en 50 KB/block (por encima de 50 KB = 1 block/SM = 4 warps, colapso de ocupación 2x).

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. Verificar el conteo de iteraciones del loop: `num_tiles = K / BK`. El pipelining requiere `num_tiles >= 2` (al menos un prologue + una iteración del main loop).

**Esperado:** Una tabla de presupuesto de memoria compartida mostrando los costos de single-buffer y double-buffer, confirmando que la asignación doblada se mantiene bajo el acantilado de la arquitectura con al menos 2 blocks/SM de ocupación.

**En caso de fallo:** Si double-buffer excede el acantilado, reducir el tamaño del tile (dividir a la mitad BK o BM) hasta que `smem_doubled <= 50 KB` para GA104. Alternativamente, usar prefetch solo-de-registros (variante LDG) sin doblar memoria compartida — almacenar datos pre-cargados en registros y escribir al mismo buffer único después de `__syncthreads()`.

### Paso 2: Elegir Variante

Seleccionar entre LDG-register y cp.async (LDGSTS) basándose en la razón cómputo/carga por tile.

1. Calcular la razón cómputo/carga: `ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))` para kernels tipo GEMM (2 FLOPs por multiply-add, bytes cargados por tile).
2. Aplicar la regla de decisión:

**Variante LDG-register** (ratio >= 5 o CUDA < 11.0):
- LDG tile N+1 a registros (cargas globales no-bloqueantes).
- Computar en `buf[N % 2]` (solapa con LDGs pendientes).
- `__syncthreads()`, luego STS registros a `buf[(N+1) % 2]`, `__syncthreads()`.
- Implementación más simple, sin dependencia de la API de pipeline.
- Añade presión de registros: ~`(BM * BK + BK * BN) / BLOCK_SIZE` registros por thread para staging.

**Variante cp.async (LDGSTS)** (ratio < 5, CUDA >= 11.0):
- `__pipeline_memcpy_async` tile N+1 directamente a `buf[(N+1) % 2]` (async, sortea el archivo de registros).
- `__pipeline_commit()` antes del cómputo.
- Computar en `buf[N % 2]`.
- `__pipeline_wait_prior(0)` + `__syncthreads()` después del cómputo.
- Mejor solapamiento, cero presión de registros para prefetch. Requiere `#include <cuda_pipeline.h>`.

3. Umbrales de decisión (medidos en GA104 con IGEMM a 4096x4096x4096):
   - Razón < 5:1 — preferir cp.async (+35% medido en IGEMM).
   - Razón 5-20:1 — implementar ambos y hacer benchmark para decidir.
   - Razón > 20:1 — pipelining probablemente no beneficioso (warp interleaving suficiente).

**Esperado:** Variante seleccionada con justificación basada en la razón cómputo/carga y la arquitectura objetivo.

**En caso de fallo:** Si la razón es ambigua (rango 5-20:1), implementar ambas variantes y hacer benchmark. La variante cp.async es el predeterminado más seguro cuando la versión de CUDA la soporta.

### Paso 3: Reestructurar el K-Loop

Transformar el loop secuencial load-sync-compute-sync en una estructura pipelined prologue/loop/epilogue.

1. **Identificar las tres secciones**: El cuerpo original del loop se vuelve tres piezas:
   - **Prologue**: Cargar tile 0 en `buf[0]`, sincronizar, luego entrar al main loop.
   - **Main loop**: Para tiles 1 a `num_tiles - 1`, solapar la carga del tile N+1 con el cómputo del tile N.
   - **Epilogue**: Computar el último tile (ya cargado por la iteración final del main loop).

2. **Estructura de la variante LDG-register**:

```c
// === LDG-register variant ===
// Prologue: load tile 0 into buf[0]
cooperative_load_tile(smem_a[0], smem_b[0], global_a, global_b, /*k_offset=*/0);
__syncthreads();

for (int tile = 0; tile < num_tiles - 1; tile++) {
    int cur_buf = tile & 1;
    int next_buf = 1 - cur_buf;

    // Phase 1: LDG next tile into registers (non-blocking)
    float reg_a[ELEMS_PER_THREAD_A], reg_b[ELEMS_PER_THREAD_B];
    prefetch_tile_to_registers(reg_a, reg_b, global_a, global_b,
                               (tile + 1) * BK);

    // Phase 2: Compute on current buffer (overlaps with LDG flight)
    tensor_core_mma(smem_a[cur_buf], smem_b[cur_buf], acc);

    // Phase 3: Drain registers into next buffer
    __syncthreads();
    store_registers_to_smem(smem_a[next_buf], smem_b[next_buf],
                            reg_a, reg_b);
    __syncthreads();
}

// Epilogue: compute last tile
tensor_core_mma(smem_a[(num_tiles - 1) & 1], smem_b[(num_tiles - 1) & 1], acc);
```

3. **Estructura de la variante cp.async**:

```c
// === cp.async variant ===
#include <cuda_pipeline.h>

// Prologue: async load tile 0 into buf[0]
cpasync_load_tile(smem_a[0], smem_b[0], global_a, global_b, /*k_offset=*/0);
__pipeline_commit();
__pipeline_wait_prior(0);
__syncthreads();

for (int tile = 0; tile < num_tiles - 1; tile++) {
    int cur_buf = tile & 1;
    int next_buf = 1 - cur_buf;

    // Phase 1: cp.async next tile into next buffer (async, direct to smem)
    cpasync_load_tile(smem_a[next_buf], smem_b[next_buf],
                      global_a, global_b, (tile + 1) * BK);
    __pipeline_commit();

    // Phase 2: Compute on current buffer (overlaps with LDGSTS in flight)
    tensor_core_mma(smem_a[cur_buf], smem_b[cur_buf], acc);

    // Phase 3: Wait for async copies to complete
    __pipeline_wait_prior(0);
    __syncthreads();
}

// Epilogue: compute last tile
tensor_core_mma(smem_a[(num_tiles - 1) & 1], smem_b[(num_tiles - 1) & 1], acc);
```

4. Verificar el conteo del loop: el main loop ejecuta `num_tiles - 1` iteraciones (tiles 0 a `num_tiles - 2` indexando qué tiles computar, cargando tiles 1 a `num_tiles - 1`). El epilogue computa el tile cargado en la última iteración.

**Esperado:** Código fuente del K-loop reestructurado con secciones claras de prologue, main loop y epilogue para la variante elegida.

**En caso de fallo:** El bug más común es un off-by-one en el indexado de buffer u olvidar el pase de cómputo del epilogue. Verificar: el prologue carga en `buf[0]`, la primera iteración del main loop computa `buf[0]` y carga en `buf[1]`, la segunda iteración computa `buf[1]` y carga en `buf[0]`, y así sucesivamente. El epilogue computa `buf[(num_tiles - 1) & 1]`.

### Paso 4: Implementar Double-Buffer

Declarar la memoria compartida double-buffered e implementar las funciones de carga.

1. Reemplazar las declaraciones de memoria compartida de un solo buffer con arrays double-buffered:

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. Para la variante cp.async, implementar la función de carga async usando la API de pipeline:

```c
__device__ void cpasync_load_tile(half* dst_a, half* dst_b,
                                  const half* src_a, const half* src_b,
                                  int k_offset) {
    // Each thread copies its portion (16 bytes = 8 half values per cp.async)
    int tid = threadIdx.x;
    int bytes_per_thread = 16;  // cp.async.cg supports 4, 8, or 16 bytes

    // A tile: BM * BK elements, distributed across BLOCK_SIZE threads
    int elems_a = BM * BK / BLOCK_SIZE;
    for (int i = 0; i < elems_a; i += 8) {
        int idx = tid * elems_a + i;
        __pipeline_memcpy_async(dst_a + idx,
                                src_a + k_offset * BM + idx,
                                bytes_per_thread);
    }

    // B tile: BK * BN elements, distributed similarly
    int elems_b = BK * BN / BLOCK_SIZE;
    for (int i = 0; i < elems_b; i += 8) {
        int idx = tid * elems_b + i;
        __pipeline_memcpy_async(dst_b + idx,
                                src_b + k_offset * BN + idx,
                                bytes_per_thread);
    }
}
```

3. Para la variante LDG, implementar arrays de staging de registros y funciones de almacenamiento:

```c
// Declare register staging (size = elements per thread)
half reg_a[BM * BK / BLOCK_SIZE];
half reg_b[BK * BN / BLOCK_SIZE];

// Prefetch: LDG from global to registers (non-blocking, issued early)
for (int i = 0; i < BM * BK / BLOCK_SIZE; i++) {
    int idx = threadIdx.x * (BM * BK / BLOCK_SIZE) + i;
    reg_a[i] = global_a[k_offset * BM + idx];
}
// ... similarly for reg_b

// Store: STS from registers to shared memory (after __syncthreads)
for (int i = 0; i < BM * BK / BLOCK_SIZE; i++) {
    int idx = threadIdx.x * (BM * BK / BLOCK_SIZE) + i;
    smem_a[next_buf][idx] = reg_a[i];
}
```

4. Mantener `__launch_bounds__(BLOCK_SIZE)` en el kernel para dar al compilador información precisa de ocupación.
5. Compilar: `nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`.

**Esperado:** Kernel compilable con memoria compartida double-buffered y el mecanismo de carga elegido. Generación exitosa de cubin sin errores.

**En caso de fallo:** Si la compilación falla en las llamadas a la API de pipeline, asegurar que `#include <cuda_pipeline.h>` esté presente y CUDA toolkit sea >= 11.0. Si ocurren spills de registros (verificar `nvcc --resource-usage`), reducir los tamaños del array de staging de registros aumentando BLOCK_SIZE o reduciendo BK.

### Paso 5: Verificar Correctitud

Ejecutar el kernel pipelined contra la referencia de CPU para confirmar salida numérica idéntica.

1. Compilar el benchmark: `nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`.
2. Ejecutar a un tamaño de problema pequeño primero (512x512x512) para captar bugs de indexado antes de escalar.
3. Aplicar la tolerancia correcta para el tipo de dato:
   - INT8 Tensor Core (IMMA): `abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA): `abs=1e-2, rel=1e-2`
   - FP32 escalar (FFMA): `abs=1e-3, rel=1e-3`
4. El pipelining no cambia la aritmética — solo reordena cargas. Si la correctitud falla, el bug está en el indexado de buffer, no en la lógica de cómputo.
5. Probar al tamaño de problema objetivo (p. ej., 4096x4096x4096) para verificar el manejo de fronteras.

**Esperado:** PASS en ambos tamaños pequeño y objetivo con límites de error idénticos a la línea base no-pipelined.

**En caso de fallo:** Bug de indexado de buffer es la causa más probable. Verificar: el cómputo lee desde `buf[tile & 1]` mientras las cargas escriben a `buf[1 - (tile & 1)]`. Verificar que el epilogue procesa el índice de buffer `(num_tiles - 1) & 1`, no `num_tiles & 1`. Para cp.async, verificar que `__pipeline_wait_prior(0)` se completa antes de `__syncthreads()` — de otro modo el cómputo puede leer datos parcialmente escritos.

### Paso 6: Hacer Benchmark y Comparar

Medir el kernel pipelined contra la línea base no-pipelined al tamaño de problema objetivo.

1. Ejecutar la línea base no-pipelined y registrar GFLOPS o ancho de banda (dependiendo del tipo de kernel).
2. Ejecutar cada variante pipelined y registrar la misma métrica.
3. Calcular speedup: `speedup = pipelined_metric / baseline_metric`.
4. Ganancias esperadas por razón cómputo/carga (medidas en GA104):
   - Razón baja (<5:1): +15-35% de cp.async (IGEMM medido: LDG +18%, cp.async +35% a 4096x4096x4096).
   - Razón media (5-20:1): +5-15%.
   - Razón alta (>20:1): 0-5% o regresión.
5. Si ambas variantes fueron implementadas, seleccionar la más rápida para uso en producción.

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

**Esperado:** Tabla de comparación de rendimiento mostrando mejora. La variante elegida debe mostrar speedup medible consistente con la predicción de la razón cómputo/carga.

**En caso de fallo:** Si el rendimiento regresa, verificar tres cosas: (1) SASS por overhead inesperado de instrucciones (BAR.SYNC extra, spills de registros). (2) La memoria compartida no cruzó el acantilado de ocupación — verificar con `nvcc --resource-usage` o `cuobjdump -res-usage`. (3) El tamaño del problema produce suficientes tiles (`K / BK >= 4`) para que el pipelining amortice el overhead de prologue/epilogue.

### Paso 7: Verificar Solapamiento SASS

Inspeccionar el SASS compilado para confirmar que las cargas globales y las instrucciones de Tensor Core se solapan dentro del cuerpo del main loop.

1. Desensamblar: `cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`.
2. En el cuerpo del main loop, verificar este patrón de ordenamiento:
   - Las instrucciones `LDGSTS` o `LDG` aparecen **antes** de las instrucciones `HMMA` o `IMMA`.
   - No hay `BAR.SYNC` entre las instrucciones de carga y las de cómputo (deben estar libres para solaparse en el warp scheduler).
   - `BAR.SYNC` aparece **después** del bloque de cómputo, controlando el uso de la siguiente iteración de los datos cargados.
3. Verificar códigos de stall en instrucciones HMMA/IMMA — S08 para retraso de pipeline HMMA es esperado e inevitable. S01-S04 para IMMA es normal. Los stalls en LDG/LDGSTS deben ser bajos (S01) ya que el warp scheduler puede cambiar a cómputo mientras las cargas están en vuelo.
4. Contar el total de instrucciones HMMA/IMMA por iteración del loop — esto debe coincidir con la versión no-pipelined (el pipelining no debe cambiar el volumen de cómputo).

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

**Esperado:** Extracto SASS anotado mostrando el patrón carga-antes-cómputo sin barreras intermedias. Cero spills de registros.

**En caso de fallo:** Si el compilador reordenó cargas después del cómputo (derrotando el solapamiento), probar: (1) `#pragma unroll 1` en el main loop para prevenir desenrollado excesivamente agresivo. (2) Separar cargas y cómputo en funciones inline distintas para crear un hint de secuenciación. (3) Usar `asm volatile("" ::: "memory")` como una valla de compilador entre bloques de carga y cómputo (último recurso — puede inhibir otras optimizaciones).

## Validación

- [ ] La smem double-buffer se mantiene bajo el acantilado de la arquitectura (GA104: 50 KB/block)
- [ ] Ambos buffers se usan alternativamente (patrón `buf[tile & 1]`)
- [ ] El prologue carga tile 0 en `buf[0]`
- [ ] El epilogue computa el último tile desde `buf[(num_tiles - 1) & 1]`
- [ ] Correctitud PASS contra referencia de CPU en tamaños pequeño y objetivo
- [ ] El SASS confirma solapamiento carga/cómputo (sin `BAR.SYNC` entre LDGSTS/LDG y IMMA/HMMA)
- [ ] El rendimiento mejoró sobre la línea base no-pipelined
- [ ] Sin spill de registros desde la variante LDG (verificar `nvcc --resource-usage`)

## Errores Comunes

- **Cruzar el acantilado smem doblando buffers** — El acantilado de GA104 es 50 KB/block, no 64 KB. Siempre calcular `smem_doubled` antes de implementar. Un kernel usando 28 KB single-buffered salta a 56 KB doblado, cruzando el acantilado y dividiendo a la mitad la ocupación. Esto puede convertir una ganancia de pipelining de +20% en una regresión de ocupación de -50%.
- **Olvidar el pase de cómputo del epilogue** — El último tile cargado en la iteración final del main loop necesita su propia fase de cómputo fuera del loop. Sin él, las últimas BK columnas de la dimensión K son silenciosamente descartadas, produciendo resultados incorrectos que pueden aparecer como pequeños errores numéricos en lugar de fallos obvios.
- **Indexado de buffer off-by-one** — Usar `buf[tile & 1]` para el buffer de cómputo actual y `buf[1 - (tile & 1)]` para el buffer de siguiente carga. Un error común es usar `buf[(tile + 1) & 1]` para el siguiente buffer, lo cual es equivalente a `buf[1 - (tile & 1)]` solo cuando el conteo de buffers es 2 — pero lee mal si se aplica accidentalmente al índice de cómputo.
- **Ordenamiento commit/wait de cp.async** — `__pipeline_commit()` debe ser llamado ANTES de la fase de cómputo (sella el batch de copias async). `__pipeline_wait_prior(0)` debe ser llamado DESPUÉS de la fase de cómputo (bloquea hasta que todas las copias comprometidas se completen). Intercambiar estos hace las copias async síncronas, eliminando todo beneficio de solapamiento.
- **Falta de __syncthreads** — En la variante LDG, se necesita un `__syncthreads()` entre el cómputo y el drenaje STS (para que el cómputo termine de leer el buffer actual antes de que sea sobrescrito). Otro `__syncthreads()` se necesita después del drenaje STS (para que todos los threads terminen de escribir antes de que la siguiente iteración lea). En la variante cp.async, `__syncthreads()` después de `__pipeline_wait_prior(0)` asegura que todos los threads vean las copias async completadas.
- **Manejo de fronteras en cp.async** — `__pipeline_memcpy_async` requiere que la dirección fuente sea válida y alineada. En los bordes de la matriz donde `K` no es un múltiplo de `BK`, el último tile puede leer fuera de los límites. Recurrir a cargas escalares con verificación de límites para el tile final, o paddear las matrices de entrada a un múltiplo de BK.

## Habilidades Relacionadas

- `analyze-kernel-bottleneck` — identificar si el kernel está limitado por memoria y calcular la razón cómputo/carga que impulsa la selección de variante
