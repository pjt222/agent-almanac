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
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# GPU-Kernel pipelinen

Software-Pipelining (Double-Buffering) auf einen tiled GPU-Kernel anwenden damit globale Speicher-Loads fuer Tile N+1 mit Tensor-Core-Berechnung auf Tile N ueberlappen. Eine sequenzielle Load-Sync-Compute-Sync-K-Schleife in eine Prolog-/Schleife-/Epilog-Struktur transformieren, zwischen LDG-Register- und cp.async-(LDGSTS)-Varianten basierend auf Compute-Load-Ratio waehlen, verifizieren dass Shared Memory unter dem Architektur-Occupancy-Cliff bleibt und Load-/Compute-Ueberlappung im finalen SASS bestaetigen.

## Wann verwenden

- Wenn `analyze-kernel-bottleneck` einen speicherbegrenzten Kernel mit niedriger Compute-Load-Ratio pro Tile identifiziert
- Wenn Warp-Interleaving allein DRAM-Latenz nicht verstecken kann (~300 Zyklen auf GA104)
- Wenn der Kernel eine sequenzielle Load-Sync-Compute-Sync-K-Schleife hat die restrukturiert werden kann
- Nicht noetig wenn Compute-Load-Ratio hoch (>20:1) und 8+ Warps aktiv sind

## Eingaben

- **Erforderlich**: CUDA-Kernel-Quelldatei (`.cu`) mit einer tiled K-Schleife die separate Load- und Compute-Phasen enthaelt
- **Erforderlich**: Ziel-GPU-Architektur (z.B. GA104 / sm_86 — bestimmt smem-Cliff und Occupancy-Limits)
- **Erforderlich**: Aktuelle Tile-Groessen (BM, BN, BK) und Datentyp (FP16, FP32, INT8)
- **Optional**: Compute-Load-Ratio pro Tile (aus `analyze-kernel-bottleneck`; wird geschaetzt wenn nicht bereitgestellt)
- **Optional**: Benchmark-Baseline (nicht-pipelined Performance bei Ziel-Problemgroesse)

## Vorgehensweise

### Schritt 1: Voraussetzungen verifizieren

Bestaetigen dass der Kernel eine tiled K-Schleife mit distinkten Load- und Compute-Phasen separiert durch `__syncthreads()` hat. Die verdoppelten Shared-Memory-Kosten berechnen und verifizieren dass sie unter dem Architektur-Occupancy-Cliff bleiben.

1. Die K-Schleife im Kernel lokalisieren. Sie muss diese sequenzielle Struktur haben: A- und B-Tiles aus Global zu Shared-Memory laden, `__syncthreads()`, Berechnung (HMMA/IMMA/FFMA) auf den Shared-Memory-Tiles, `__syncthreads()`.
2. Die Single-Buffer-Shared-Memory-Groessen aufzeichnen: `smem_a_size = BM * BK * sizeof(T)` und `smem_b_size = BK * BN * sizeof(T)`.
3. Die Double-Buffer-Kosten berechnen: `smem_doubled = smem_a_size * 2 + smem_b_size * 2`.
4. Mit dem Architektur-Cliff vergleichen. GA104 (sm_86): 100 KB max smem/SM, Cliff bei 50 KB/Block (ueber 50 KB = 1 Block/SM = 4 Warps, 2x Occupancy-Kollaps).

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. Die Schleifen-Iterations-Anzahl verifizieren: `num_tiles = K / BK`. Pipelining erfordert `num_tiles >= 2` (mindestens ein Prolog + eine Hauptschleifen-Iteration).

**Erwartet:** Eine Shared-Memory-Budget-Tabelle die Single-Buffer- und Double-Buffer-Kosten zeigt und bestaetigt dass die verdoppelte Allokation unter dem Architektur-Cliff mit mindestens 2 Bloecken/SM Occupancy bleibt.

**Bei Fehler:** Wenn Double-Buffer den Cliff ueberschreitet, Tile-Groesse reduzieren (BK oder BM halbieren) bis `smem_doubled <= 50 KB` fuer GA104. Alternativ Register-only Prefetch (LDG-Variante) ohne Verdoppelung von Shared Memory nutzen — vorgefetchte Daten in Registern speichern und nach `__syncthreads()` in denselben Single-Buffer schreiben.

### Schritt 2: Variante waehlen

Zwischen LDG-Register und cp.async (LDGSTS) basierend auf der Compute-Load-Ratio pro Tile auswaehlen.

1. Die Compute-Load-Ratio berechnen: `ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))` fuer GEMM-aehnliche Kernels (2 FLOPs pro Multiply-Add, geladene Bytes pro Tile).
2. Die Entscheidungsregel anwenden:

**LDG-Register-Variante** (ratio >= 5 oder CUDA < 11.0):
- Tile N+1 mit LDG in Register laden (nicht-blockierende globale Loads).
- Auf `buf[N % 2]` berechnen (ueberlappt mit ausstehenden LDGs).
- `__syncthreads()`, dann STS Register in `buf[(N+1) % 2]`, `__syncthreads()`.
- Einfachere Implementation, keine Pipeline-API-Abhaengigkeit.
- Fuegt Register-Druck hinzu: ~`(BM * BK + BK * BN) / BLOCK_SIZE` Register pro Thread fuer Staging.

**cp.async (LDGSTS) Variante** (ratio < 5, CUDA >= 11.0):
- `__pipeline_memcpy_async` Tile N+1 direkt zu `buf[(N+1) % 2]` (async, umgeht das Register-File).
- `__pipeline_commit()` vor Berechnung.
- Auf `buf[N % 2]` berechnen.
- `__pipeline_wait_prior(0)` + `__syncthreads()` nach Berechnung.
- Bessere Ueberlappung, null Register-Druck fuer Prefetch. Erfordert `#include <cuda_pipeline.h>`.

3. Entscheidungs-Schwellwerte (gemessen auf GA104 mit IGEMM bei 4096x4096x4096):
   - Ratio < 5:1 — cp.async bevorzugen (+35% gemessen auf IGEMM).
   - Ratio 5-20:1 — beide implementieren und benchmarken um zu entscheiden.
   - Ratio > 20:1 — Pipelining wahrscheinlich nicht vorteilhaft (Warp-Interleaving ausreichend).

**Erwartet:** Ausgewaehlte Variante mit Begruendung basierend auf Compute-Load-Ratio und Ziel-Architektur.

**Bei Fehler:** Wenn die Ratio mehrdeutig ist (5-20:1-Bereich), beide Varianten implementieren und benchmarken. Die cp.async-Variante ist der sicherere Default wenn die CUDA-Version sie unterstuetzt.

### Schritt 3: Die K-Schleife restrukturieren

Die sequenzielle Load-Sync-Compute-Sync-Schleife in eine pipelined Prolog-/Schleife-/Epilog-Struktur transformieren.

1. **Die drei Abschnitte identifizieren**: Der originale Schleifen-Body wird drei Stuecke:
   - **Prolog**: Tile 0 in `buf[0]` laden, synchronisieren, dann in die Hauptschleife eintreten.
   - **Hauptschleife**: Fuer Tiles 1 bis `num_tiles - 1` Laden von Tile N+1 mit Berechnung von Tile N ueberlappen.
   - **Epilog**: Das letzte Tile berechnen (bereits durch die finale Hauptschleifen-Iteration geladen).

2. **LDG-Register-Variantenstruktur**:

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

3. **cp.async-Variantenstruktur**:

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

4. Den Schleifen-Count verifizieren: die Hauptschleife laeuft `num_tiles - 1` Iterationen (Tiles 0 bis `num_tiles - 2` indizieren welche Tiles zu berechnen, ladet Tiles 1 bis `num_tiles - 1`). Der Epilog berechnet das in der letzten Iteration geladene Tile.

**Erwartet:** Restrukturierter K-Schleifen-Quellcode mit klaren Prolog-, Hauptschleifen- und Epilog-Abschnitten fuer die gewaehlte Variante.

**Bei Fehler:** Der haeufigste Bug ist ein Off-by-One in Buffer-Indexierung oder Vergessen des Epilog-Compute-Pass. Verifizieren: Prolog laedt in `buf[0]`, erste Hauptschleifen-Iteration berechnet `buf[0]` und laedt in `buf[1]`, zweite Iteration berechnet `buf[1]` und laedt in `buf[0]` und so weiter. Der Epilog berechnet `buf[(num_tiles - 1) & 1]`.

### Schritt 4: Double-Buffer implementieren

Den double-buffered Shared Memory deklarieren und die Load-Funktionen implementieren.

1. Single-Buffer-Shared-Memory-Deklarationen mit double-buffered Arrays ersetzen:

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. Fuer die cp.async-Variante die Async-Load-Funktion mit der Pipeline-API implementieren:

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

3. Fuer die LDG-Variante Register-Staging-Arrays und Store-Funktionen implementieren:

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

4. `__launch_bounds__(BLOCK_SIZE)` auf dem Kernel halten um dem Compiler akkurate Occupancy-Information zu geben.
5. Kompilieren: `nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`.

**Erwartet:** Kompilierbarer Kernel mit double-buffered Shared Memory und dem gewaehlten Lade-Mechanismus. Erfolgreiche cubin-Generierung ohne Fehler.

**Bei Fehler:** Wenn Kompilierung an Pipeline-API-Calls scheitert, sicherstellen dass `#include <cuda_pipeline.h>` praesent ist und CUDA-Toolkit >= 11.0. Wenn Register-Spills auftreten (mit `nvcc --resource-usage` pruefen), die Register-Staging-Array-Groessen reduzieren indem BLOCK_SIZE erhoeht oder BK reduziert wird.

### Schritt 5: Korrektheit verifizieren

Den pipelinedKernel gegen die CPU-Referenz ausfuehren um identische numerische Ausgabe zu bestaetigen.

1. Den Benchmark kompilieren: `nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`.
2. Bei einer kleinen Problemgroesse zuerst ausfuehren (512x512x512) um Indexierungs-Bugs vor dem Hochskalieren abzufangen.
3. Die korrekte Toleranz fuer den Datentyp anwenden:
   - INT8 Tensor Core (IMMA): `abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA): `abs=1e-2, rel=1e-2`
   - FP32 Skalar (FFMA): `abs=1e-3, rel=1e-3`
4. Pipelining aendert die Arithmetik nicht — es ordnet nur Loads neu. Wenn Korrektheit scheitert, ist der Bug in Buffer-Indexierung, nicht in der Compute-Logik.
5. Bei der Ziel-Problemgroesse testen (z.B. 4096x4096x4096) um Boundary-Handhabung zu verifizieren.

**Erwartet:** PASS bei beiden kleinen und Ziel-Problemgroessen mit Fehlergrenzen identisch zur nicht-pipelined Baseline.

**Bei Fehler:** Buffer-Indexierungs-Bug ist die wahrscheinlichste Ursache. Verifizieren: Compute liest aus `buf[tile & 1]` waehrend Loads in `buf[1 - (tile & 1)]` schreiben. Pruefen dass der Epilog Buffer-Index `(num_tiles - 1) & 1` verarbeitet, nicht `num_tiles & 1`. Fuer cp.async verifizieren dass `__pipeline_wait_prior(0)` vor `__syncthreads()` abschliesst — sonst kann Compute teilweise-geschriebene Daten lesen.

### Schritt 6: Benchmarken und vergleichen

Den pipelined Kernel gegen die nicht-pipelined Baseline bei der Ziel-Problemgroesse messen.

1. Die nicht-pipelined Baseline ausfuehren und GFLOPS oder Bandbreite aufzeichnen (abhaengig vom Kernel-Typ).
2. Jede pipelined Variante ausfuehren und dieselbe Metrik aufzeichnen.
3. Speedup berechnen: `speedup = pipelined_metric / baseline_metric`.
4. Erwartete Gewinne nach Compute-Load-Ratio (gemessen auf GA104):
   - Niedrige Ratio (<5:1): +15-35% von cp.async (IGEMM gemessen: LDG +18%, cp.async +35% bei 4096x4096x4096).
   - Mittlere Ratio (5-20:1): +5-15%.
   - Hohe Ratio (>20:1): 0-5% oder Regression.
5. Wenn beide Varianten implementiert wurden, die schnellere fuer Production-Use auswaehlen.

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

**Erwartet:** Performance-Vergleichstabelle die Verbesserung zeigt. Die gewaehlte Variante sollte messbaren Speedup konsistent mit der Compute-Load-Ratio-Vorhersage zeigen.

**Bei Fehler:** Wenn Performance regrediert, drei Dinge pruefen: (1) SASS auf unerwarteten Instruktions-Overhead (extra BAR.SYNC, Register-Spills). (2) Shared Memory hat den Occupancy-Cliff nicht ueberschritten — mit `nvcc --resource-usage` oder `cuobjdump -res-usage` verifizieren. (3) Die Problemgroesse produziert genug Tiles (`K / BK >= 4`) damit Pipelining den Prolog-/Epilog-Overhead amortisieren kann.

### Schritt 7: SASS-Ueberlappung verifizieren

Das kompilierte SASS inspizieren um zu bestaetigen dass globale Loads und Tensor-Core-Instruktionen innerhalb des Hauptschleifen-Body ueberlappen.

1. Disassemblieren: `cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`.
2. Im Hauptschleifen-Body diese Reihenfolge verifizieren:
   - `LDGSTS`- oder `LDG`-Instruktionen erscheinen **vor** `HMMA`- oder `IMMA`-Instruktionen.
   - Kein `BAR.SYNC` zwischen den Load-Instruktionen und den Compute-Instruktionen (sie muessen frei sein im Warp-Scheduler zu ueberlappen).
   - `BAR.SYNC` erscheint **nach** dem Compute-Block, sperrt die Nutzung der geladenen Daten der naechsten Iteration.
3. Stall-Codes auf HMMA-/IMMA-Instruktionen pruefen — S08 fuer HMMA-Pipeline-Delay ist erwartet und unvermeidbar. S01-S04 fuer IMMA ist normal. Stalls auf LDG-/LDGSTS sollten niedrig sein (S01) da der Warp-Scheduler zu Compute wechseln kann waehrend Loads in Flight sind.
4. Total HMMA-/IMMA-Instruktionen pro Schleifen-Iteration zaehlen — dies sollte mit der nicht-pipelined Version uebereinstimmen (Pipelining sollte Compute-Volumen nicht aendern).

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

**Erwartet:** Annotierter SASS-Auszug der das Load-vor-Compute-Muster ohne dazwischenliegende Barriers zeigt. Null Register-Spills.

**Bei Fehler:** Wenn der Compiler Loads nach Compute reordnet (was die Ueberlappung besiegt), versuchen: (1) `#pragma unroll 1` auf der Hauptschleife um zu aggressives Unrolling zu verhindern. (2) Load und Compute in distinkte Inline-Funktionen separieren um einen Sequenzierungs-Hint zu schaffen. (3) `asm volatile("" ::: "memory")` als Compiler-Fence zwischen Load- und Compute-Bloecken nutzen (letzter Ausweg — kann andere Optimierungen hemmen).

## Validierung

- [ ] Double-Buffer smem bleibt unter Architektur-Cliff (GA104: 50 KB/Block)
- [ ] Beide Buffer alternierend verwendet (`buf[tile & 1]`-Muster)
- [ ] Prolog laedt Tile 0 in `buf[0]`
- [ ] Epilog berechnet letztes Tile aus `buf[(num_tiles - 1) & 1]`
- [ ] Korrektheit PASS gegen CPU-Referenz bei beiden kleinen und Ziel-Groessen
- [ ] SASS bestaetigt Load-/Compute-Ueberlappung (kein `BAR.SYNC` zwischen LDGSTS/LDG und IMMA/HMMA)
- [ ] Performance verbessert ueber nicht-pipelined Baseline
- [ ] Kein Register-Spill aus LDG-Variante (mit `nvcc --resource-usage` pruefen)

## Haeufige Stolperfallen

- **Den smem-Cliff durch Verdoppelung von Buffern ueberschreiten** — GA104-Cliff ist 50 KB/Block, nicht 64 KB. Immer `smem_doubled` vor Implementation berechnen. Ein Kernel der 28 KB single-buffered nutzt springt auf 56 KB doubled, ueberschreitet den Cliff und halbiert Occupancy. Dies kann einen +20%-Pipelining-Gewinn in eine -50%-Occupancy-Regression verwandeln.
- **Den Epilog-Compute-Pass vergessen** — Das letzte in der finalen Hauptschleifen-Iteration geladene Tile braucht seine eigene Compute-Phase ausserhalb der Schleife. Ohne sie werden die letzten BK-Spalten der K-Dimension still fallen gelassen, was inkorrekte Ergebnisse produziert die als kleine numerische Fehler statt offensichtlichen Versagen erscheinen koennen.
- **Buffer-Indexierungs-Off-by-One** — `buf[tile & 1]` fuer den aktuellen Compute-Buffer und `buf[1 - (tile & 1)]` fuer den naechsten Load-Buffer nutzen. Ein haeufiger Fehler ist die Nutzung von `buf[(tile + 1) & 1]` fuer den naechsten Buffer, was nur dann aequivalent zu `buf[1 - (tile & 1)]` ist wenn die Buffer-Anzahl 2 ist — aber falsch liest wenn versehentlich auf den Compute-Index angewendet.
- **cp.async-Commit-/Wait-Reihenfolge** — `__pipeline_commit()` muss VOR der Compute-Phase aufgerufen werden (es siegelt den Batch von Async-Kopien). `__pipeline_wait_prior(0)` muss NACH der Compute-Phase aufgerufen werden (es blockiert bis alle commiteten Kopien abschliessen). Diese zu vertauschen macht die Async-Kopien synchron und eliminiert allen Ueberlappungs-Vorteil.
- **Fehlende __syncthreads** — In der LDG-Variante wird ein `__syncthreads()` zwischen Compute und dem STS-Drain benoetigt (damit Compute das Lesen des aktuellen Buffers beendet bevor er ueberschrieben wird). Ein weiteres `__syncthreads()` wird nach dem STS-Drain benoetigt (damit alle Threads das Schreiben beenden bevor die naechste Iteration liest). In der cp.async-Variante stellt `__syncthreads()` nach `__pipeline_wait_prior(0)` sicher dass alle Threads die abgeschlossenen Async-Kopien sehen.
- **Boundary-Handhabung in cp.async** — `__pipeline_memcpy_async` erfordert dass die Quelladresse gueltig und ausgerichtet ist. An Matrix-Raendern wo `K` kein Vielfaches von `BK` ist, kann das letzte Tile out-of-bounds lesen. Auf Skalar-Loads mit Bounds-Pruefung fuer das finale Tile zurueckfallen oder die Eingabe-Matrizen auf ein Vielfaches von BK paddern.

## Verwandte Skills

- `analyze-kernel-bottleneck` — identifizieren ob der Kernel speicherbegrenzt ist und die Compute-Load-Ratio berechnen die die Variantenauswahl treibt
