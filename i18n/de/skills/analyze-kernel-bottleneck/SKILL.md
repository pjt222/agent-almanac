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
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Kernel-Engpass analysieren

Systematisch identifizieren ob ein GPU-Kernel rechen-, speicher- oder latenzbegrenzt ist, indem die Baseline-Performance gemessen, auf der Roofline klassifiziert, Occupancy und Compute-Load-Ratio pro Tile berechnet, SASS-Instruktionsmix und Stall-Codes inspiziert, der Shared-Memory-Cliff geprueft und eine Entscheidungsmatrix angewendet wird um die richtige Optimierungsstrategie zu waehlen.

## Wann verwenden

- Vor der Optimierung jedes CUDA-Kernels -- Baseline etablieren und Engpasstyp klassifizieren
- Nachdem eine erste funktionierende Version eines Kernels geschrieben wurde, um den Optimierungspfad zu identifizieren
- Wenn ein Kernel die Erwartungen relativ zum theoretischen Peak unterschreitet
- Bei der Entscheidung zwischen cp.async, groesseren Tiles oder algorithmischer Restrukturierung

## Eingaben

- **Erforderlich**: Kompilierter Kernel (`.cubin` oder `.cu`-Quelle mit Build-Befehl)
- **Erforderlich**: Benchmark-Harness der den Kernel mit CUDA-Event-Timing startet
- **Erforderlich**: Problemdimensionen (z.B. M, N, K fuer GEMM; seq_len, heads, head_dim fuer Attention)
- **Optional**: Ziel-GPU-Architektur (Standard: GA104 / sm_86 / RTX 3070 Ti)
- **Optional**: Erwarteter Peak-Auslastungsprozentsatz fuer Vergleich
- **Optional**: Frueher Profiling-Daten (Nsight-Compute-Berichte)

## Vorgehensweise

### Schritt 1: Baseline-Performance messen

Den Kernel mit CUDA-Events (`BenchTimer`) ausfuehren, Zeit in Millisekunden aufzeichnen. Effektive Durchsatzmetriken berechnen:

1. **Kompilieren** des Kernels falls noch nicht gebaut:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **Ausfuehren** mit repraesentativen Problemgroessen, sicherstellen dass Warmup-Laeufe der Messung vorausgehen:
   ```bash
   ./bench 4096 4096 4096
   ```
3. **Aufzeichnen** der Kernel-Zeit in ms aus CUDA-Events (nicht Wall-Clock).
4. **Berechnen** effektiver GFLOPS und effektiver Bandbreite:
   - GEMM: `effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - Bandbreitenbegrenzte Kernels: `effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention: `effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

**Erwartet:** Baseline-Zahlen: Kernel-Zeit in ms, effektive GFLOPS und effektive Bandbreite.

**Bei Fehler:** Pruefen dass der Kernel ohne Fehler startet (`CHECK_CU`-Macro). Verifizieren dass Warmup-Laeufe der Messung vorausgehen. Sicherstellen dass Problemdimensionen gross genug sind um die GPU zu saettigen (kleine Probleme koennen am Launch-Overhead haengen bleiben).

### Schritt 2: Auf der Roofline klassifizieren

Arithmetische Intensitaet berechnen und mit dem Maschinen-Balancepunkt vergleichen um den Kernel zu klassifizieren:

1. **Arithmetische Intensitaet berechnen**: `AI = FLOPs / bytes_loaded_from_global_memory`. Nur einzigartige Bytes aus DRAM zaehlen (nicht Shared Memory oder Register-Reuse).
2. **Maschinen-Balancepunkt nachschlagen**: `balance = peak_compute / peak_bandwidth`.
3. **Klassifizieren**: Wenn `AI < balance`, ist der Kernel speicherbegrenzt. Wenn `AI > balance`, ist der Kernel rechenbegrenzt.

**GA104 (RTX 3070 Ti) Referenzwerte:**

| Resource | Peak | Unit |
|----------|------|------|
| FP32 FFMA | 21.7 | TFLOPS |
| FP16 Tensor Core (HMMA) | 174 | TFLOPS |
| INT8 Tensor Core (IMMA) | 696 | TOPS |
| DRAM Bandwidth | 608 | GB/s |
| L2 Cache | 4 | MB |
| SMs | 48 | |

**Abgeleitete Balancepunkte:**

| Precision | Balance Point (FLOP/byte) |
|-----------|--------------------------|
| FP32 FFMA | 21700 / 608 = 35.7 |
| FP16 TC | 174000 / 608 = 286.2 |
| INT8 TC | 696000 / 608 = 1144.7 |

4. **Erreichten Anteil berechnen**: `attained = effective_throughput / peak_throughput`. Bei Speicherbegrenzung: effektive Bandbreite mit 608 GB/s vergleichen. Bei Rechenbegrenzung: effektive GFLOPS mit dem relevanten Peak vergleichen.

**Erwartet:** Klassifikation als rechen-, speicher- oder latenzbegrenzt (geringe Occupancy verursacht weder Rechen- noch Speichersaettigung) mit numerischer Begruendung.

**Bei Fehler:** Byte-Zaehlung erneut pruefen. Auf redundante Reads achten (z.B. 9x bei direkter conv2d ohne im2col). Wenn weder Rechnung noch Speicher gesaettigt sind, ist der Kernel wahrscheinlich latenzbegrenzt (siehe Schritt 3).

### Schritt 3: Occupancy berechnen

Aktive Warps pro SM aus der Launch-Konfiguration und dem Ressourcenverbrauch ermitteln:

1. **Ressourcenverbrauch extrahieren**:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **Aus Launch-Konfig**: `warps_per_block = threads_per_block / 32`.
3. **Bloecke/SM berechnen** aus jedem begrenzenden Faktor:
   - Register-Limit: `floor(65536 / (registers_per_thread * threads_per_block))`
   - Smem-Limit: `floor(available_smem_per_SM / smem_per_block)` -- siehe Schritt 6 fuer Cliff
   - Warp-Limit: `floor(48 / warps_per_block)` (GA104 max: 48 Warps/SM)
   - Block-Limit: 16 Bloecke/SM max auf GA104
4. **Tatsaechliche Bloecke/SM** = `min(register_limit, smem_limit, warp_limit, block_limit)`.
5. **Aktive Warps/SM** = `blocks_per_SM * warps_per_block`.
6. **Schluessel-Schwellwert**: 8 Warps/SM sind ausreichend fuer Latency Hiding auf GA104. Unterhalb 8 = strukturelles Problem das latenzbegrenztes Verhalten verursacht.

**Erwartet:** Occupancy-Tabelle die Bloecke/SM, aktive Warps/SM und den begrenzenden Faktor (Register, smem oder Warps) zeigt.

**Bei Fehler:** `cuFuncSetAttribute` fuer dynamisches Shared Memory pruefen. Verifizieren dass `--resource-usage`-Berichte mit der tatsaechlichen Launch-Konfiguration uebereinstimmen. Wenn Register-Anzahl unerwartet hoch ist, `--maxrregcount=N` versuchen um Register zu deckeln (Register-Spills gegen Occupancy tauschen).

### Schritt 4: Compute-Load-Ratio pro Tile berechnen

Compute-Instruktionen und Load-Bytes pro K-Tile aus SASS zaehlen (nicht Quellcode):

1. **Disassemblieren**:
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **Compute-Instruktionen pro Tile zaehlen** (die innere Schleife ueber ein K-Tile):
   - `grep -c 'HMMA' kernel.sass` -- FP16-Tensor-Core-Ops
   - `grep -c 'IMMA' kernel.sass` -- INT8-Tensor-Core-Ops
   - `grep -c 'FFMA' kernel.sass` -- FP32-Fused-Multiply-Add
3. **Globale Loads pro Tile zaehlen**:
   - `grep -c 'LDG' kernel.sass` -- Global-Memory-Loads
   - Mit Bytes pro Load multiplizieren (typischerweise 16 Bytes fuer LDG.128)
4. **Ratio berechnen**: `compute_ops / load_ops` pro Tile.
5. **Klassifizieren** mit dem cp.async-Entscheidungsschwellwert (aus gpu_reflections.md Insight 2):
   - **Hoch** (>20:1): cp.async ist netto-negativ; Warp-Interleaving versteckt bereits DRAM-Latenz. Auf algorithmische Aenderungen fokussieren. Referenz: Flash Attention hat 64 HMMA pro Tile = hohes Ratio, cp.async gemessen -5%.
   - **Mittel** (5-20:1): cp.async kann helfen, beide Pfade benchmarken.
   - **Niedrig** (<5:1): cp.async stark vorteilhaft; Loads dominieren und Async-Copy versteckt Latenz. Referenz: IGEMM hat 8 IMMA pro Tile = niedriges Ratio, cp.async gemessen +35%.

**Erwartet:** Compute-Load-Ratio mit Klassifikation (hoch/mittel/niedrig) und cp.async-Empfehlung.

**Bei Fehler:** Aus SASS-Disassembly zaehlen, nicht Quellcode -- der Compiler kann fusionieren, eliminieren oder Instruktionen umordnen. Sicherstellen dass nur Instruktionen innerhalb der inneren Schleife gezaehlt werden (die K-Tile-Iteration), nicht der ganze Kernel.

### Schritt 5: SASS-Instruktionen inspizieren

Den vollstaendigen SASS-Instruktionsmix und Stall-Codes pruefen:

1. **Disassemblieren** (falls in Schritt 4 nicht erfolgt):
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **Schluesselinstruktionstypen zaehlen**:
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
3. **Stall-Codes pruefen** auf kritischen Instruktionen:
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **Optimierungsziele identifizieren**:
   - HMMA-S08-Stalls: Hardware-Minimum auf Ampere, kann nicht reduziert werden. Anderswo fokussieren.
   - IMMA-S04-Stalls: Compiler ist konservativ. CuAssembler kann auf S02 verengen (gemessen 15-20% Gewinn).
   - FFMA-S04-Stalls: bei Unabhaengigkeit auf S01 reduzierbar via CuAssembler.
   - Exzessives BAR.SYNC: kann auf Ueber-Synchronisation zwischen Pipeline-Stufen hinweisen.

**Erwartet:** Instruktionsanzahltabelle und Stall-Code-Zusammenfassung mit identifizierten Optimierungszielen.

**Bei Fehler:** Sicherstellen dass die `cuobjdump`-Architektur mit dem Kernel-Kompilierungsziel uebereinstimmt (beide muessen sm_86 sein). Wenn SASS-Ausgabe leer ist, koennte das cubin korrupt sein -- neu kompilieren.

### Schritt 6: Den Smem-Cliff pruefen

Ermitteln ob der Shared-Memory-Verbrauch den architekturspezifischen Occupancy-Cliff ueberschreitet:

1. **Smem/Block lesen** aus `--resource-usage`-Ausgabe (Schritt 3) oder `cuobjdump --res-usage kernel.sm_86.cubin`.
2. **Mit Cliff-Schwellwert vergleichen**:
   - GA104 (sm_86): 100 KB max smem/SM. Cliff bei 50 KB/Block.
   - Empirisch bestaetigt: 48 KB/Block -> 2 Bloecke/SM (gut), 56 KB/Block -> 1 Block/SM (2x Regression).
3. **Wenn ueber Cliff** (smem > 50 KB/Block):
   - Bloecke/SM faellt auf 1, aktive Warps fallen auf warps_per_block (typischerweise 4).
   - 2x Performance-Regression erwartet durch exponierte DRAM-Stalls.
4. **Auswirkung von Double-Buffering pruefen**: Double-Buffering verdoppelt smem-Verbrauch. Bei aktuellen 30 KB smem ist double-buffered = 60 KB, was den Cliff ueberschreitet. Bewerten ob der Async-Vorteil den Occupancy-Verlust ueberwiegt.
5. **Aufzeichnen** smem/Block, Bloecke/SM und ob der Cliff ueberschritten wird.

**Erwartet:** Smem/Block-Wert mit Bloecke/SM-Anzahl und expliziter Aussage ob der 50-KB-Cliff ueberschritten wird.

**Bei Fehler:** Wenn ueber Cliff und Occupancy der Engpass ist, muss sich die Optimierungsstrategie aendern: Tile-Groesse reduzieren um smem unter 50 KB zu bekommen, oder 1 Block/SM akzeptieren und mit hoeherer Compute-Load-Ratio pro Tile kompensieren (mehr Register-Reuse, laengere K-Tiles).

### Schritt 7: Die Entscheidungsmatrix bauen

Befunde aus Schritten 2-6 zu einer Optimierungsstrategie synthetisieren:

| Bedingung | Strategie |
|-----------|-----------|
| Speicherbegrenzt + niedrige Compute-Load-Ratio (<5:1) + smem unter Cliff | Software-Pipelining mit cp.async (LDGSTS). Globale Loads mit Compute ueberlappen. |
| Speicherbegrenzt + hohe Compute-Load-Ratio (>20:1) + 8+ Warps | Warp-Interleaving versteckt bereits Latenz. Auf algorithmische Aenderungen fokussieren: implicit GEMM, split-Q, im2col. |
| Rechenbegrenzt + FFMA-lastig | CuAssembler-Stall-Code-Verengung: S04 -> S01 auf unabhaengigen FFMAs. |
| Rechenbegrenzt + HMMA-lastig | S08 ist Hardware-Minimum, nicht reduzierbar. Tile-Reuse erhoehen (groessere M/N-Tiles, laengere K-Schleife). |
| Rechenbegrenzt + IMMA-lastig | CuAssembler: S04 -> S02 auf IMMA-Instruktionen (Compiler ist konservativ). |
| Latenzbegrenzt (niedrige Occupancy, weder gesaettigt) | Smem oder Register reduzieren um mehr Bloecke/SM zu erhalten. Ueber 8 Warps/SM kommen. |
| Smem ueber Cliff | Tile-Groesse reduzieren oder restrukturieren um smem/Block unter 50 KB zu bekommen (GA104). |

1. **Anwendbare Strategien rangieren** nach erwartetem Gewinn, mit Compute-Load-Ratio und Occupancy-Daten.
2. **Gewinn-Bereich schaetzen** fuer jede Strategie basierend darauf wie weit der Kernel von der relevanten Decke entfernt ist.
3. **Konflikte markieren**: z.B. cp.async verdoppelt smem (kann Cliff ueberschreiten), groessere Tiles erhoehen Register-Druck (koennen Occupancy reduzieren).

**Erwartet:** Rangierte Liste empfohlener Optimierungen mit vorhergesagtem Gewinn-Bereich und potenziellen Konflikten.

**Bei Fehler:** Wenn kein klarer Gewinner auftaucht, Mikro-Benchmarks ausfuehren die jede Strategie isolieren (z.B. cp.async allein testen, reduzierte Tile-Groesse allein testen) um die tatsaechliche Wirkung vor dem Kombinieren zu messen.

### Schritt 8: Befunde dokumentieren

Einen strukturierten Engpass-Bericht erzeugen:

1. **Baseline**: Kernel-Zeit, effektive GFLOPS, effektive Bandbreite, Problemdimensionen.
2. **Roofline-Position**: arithmetische Intensitaet, Klassifikation, erreichter Peak-Anteil.
3. **Occupancy**: Bloecke/SM, aktive Warps/SM, begrenzender Faktor.
4. **Compute-Load-Ratio**: Ratio-Wert, Klassifikation (hoch/mittel/niedrig), cp.async-Empfehlung.
5. **SASS-Zusammenfassung**: Instruktionsanzahltabelle, Stall-Code-Befunde, CuAssembler-Ziele.
6. **Smem-Cliff**: smem/Block, Bloecke/SM, Cliff-Status.
7. **Empfehlung**: rangierte Optimierungsstrategien mit Gewinn-Schaetzungen.

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

**Erwartet:** Vollstaendiger Markdown-Bericht der von einem Kernel-Optimizer-Agenten oder menschlichen Entwickler konsumierbar ist.

**Bei Fehler:** Mit unterschiedlichen Problemgroessen erneut ausfuehren (z.B. 1024, 2048, 4096, 8192) um zu bestaetigen dass Befunde nicht groessenspezifisch sind. Kleine Probleme koennen latenzbegrenzt erscheinen waehrend der echte Engpass im Massstab Speicherbandbreite ist.

## Validierung

- [ ] Baseline mit CUDA-Events gemessen (nicht Wall-Clock)
- [ ] Roofline-Klassifikation ermittelt (rechen-/speicher-/latenzbegrenzt)
- [ ] Occupancy berechnet mit identifiziertem begrenzendem Faktor
- [ ] Compute-Load-Ratio pro Tile aus SASS berechnet
- [ ] SASS-Instruktionsmix und Stall-Codes dokumentiert
- [ ] Smem-Cliff gegen Architektur-Schwellwert geprueft
- [ ] Entscheidungsmatrix angewendet mit Strategie-Empfehlung
- [ ] Befunde in strukturiertem Bericht dokumentiert

## Haeufige Stolperfallen

- **Re-Read-Multiplikation**: Direkte conv2d liest jedes Gewicht 9x ohne im2col, blaeht die Byte-Anzahl um 9x auf. Tatsaechliche einzigartige aus DRAM geladene Bytes nutzen, nicht gesamte Load-Instruktionen, beim Berechnen arithmetischer Intensitaet.
- **FP16-Tensor-Core-Peak mit FP32-Peak verwechseln**: FP16-TC-Peak ist 174 TFLOPS, FP32-FFMA-Peak ist 21,7 TFLOPS -- ein 8x-Unterschied. Mit dem falschen Peak wird Roofline-Klassifikation bedeutungslos.
- **64 KB als smem-Cliff statt 50 KB auf GA104 nutzen**: GA104 (sm_86) hat 100 KB max smem/SM. Der Cliff ist bei 100/2 = 50 KB/Block, nicht 64 KB. Dies ist architekturspezifisch; andere GPUs unterscheiden sich.
- **Warp-Interleaving beim Bewerten von cp.async ignorieren**: 8 Warps mit langen Compute-Phasen (hohe Compute-Load-Ratio) verstecken bereits DRAM-Latenz durch Warp-Scheduling. cp.async in diesem Regime hinzuzufuegen fuegt smem-Druck und Barrier-Overhead ohne Nutzen hinzu (gemessen -5% auf Flash Attention).
- **Instruktionen aus Quellcode statt SASS zaehlen**: Der Compiler kann Operationen fusionieren, toten Code eliminieren, Schleifen anders unrollen oder Instruktionen umordnen. Immer aus `cuobjdump -sass`-Ausgabe zaehlen.
- **Keine Warmup-Iterationen ausfuehren**: Der erste Kernel-Launch enthaelt JIT-Compile-Overhead und Cold-Cache-Effekte. Immer 2-5 Warmup-Iterationen vor dem gemessenen Lauf ausfuehren.

## Verwandte Skills

- `pipeline-gpu-kernel` -- Software-Pipelining mit cp.async implementieren wenn die Analyse einen speicherbegrenzten Kernel mit niedriger Compute-Load-Ratio identifiziert
- `simulate-cpu-architecture` -- ergaenzende Architekturanalyse fuer CPU-seitige Engpaesse in Host-Device-Workflows
