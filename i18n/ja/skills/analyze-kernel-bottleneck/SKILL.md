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
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Analyze Kernel Bottleneck

GPU カーネルが compute-bound、memory-bound、latency-bound のいずれであるかを体系的に特定する。ベースライン性能の測定、ルーフライン上での分類、占有率（occupancy）とタイルあたりの compute/load 比の計算、SASS 命令ミックスとストールコードの検査、共有メモリのクリフ確認、そして適切な最適化戦略を選択する決定マトリクスの適用を行う。

## 使用タイミング

- 任意の CUDA カーネルを最適化する前 — ベースラインを確立し、ボトルネック種別を分類する
- カーネルの最初の動作版を書いた後で、最適化経路を特定する
- 理論ピークに対してカーネルの性能が期待を下回っているとき
- cp.async、より大きなタイル、アルゴリズムの再構築のいずれを採るかを決めるとき

## 入力

- **必須**: コンパイル済みカーネル（`.cubin`、またはビルドコマンド付きの `.cu` ソース）
- **必須**: CUDA イベント計時でカーネルを起動するベンチマークハーネス
- **必須**: 問題の次元（例: GEMM の M, N, K; アテンションの seq_len, heads, head_dim）
- **任意**: 対象 GPU アーキテクチャ（既定: GA104 / sm_86 / RTX 3070 Ti）
- **任意**: 比較用の期待ピーク利用率
- **任意**: 過去のプロファイリングデータ（Nsight Compute レポート）

## 手順

### ステップ1: ベースライン性能を測定する

CUDA イベント（`BenchTimer`）でカーネルを実行し、ミリ秒単位の時間を記録する。実効スループット指標を計算する:

1. **コンパイル**（未ビルドの場合）:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu
   nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common
   ```
2. **実行**: 代表的な問題サイズで、計測前にウォームアップ実行が先行することを保証する:
   ```bash
   ./bench 4096 4096 4096
   ```
3. **記録**: CUDA イベント由来のカーネル時間（ms）を記録する（ウォールクロックではない）。
4. **計算**: 実効 GFLOPS と実効帯域幅:
   - GEMM: `effective_gflops = (2 * M * N * K) / (time_ms / 1000) / 1e9`
   - 帯域律速カーネル: `effective_bw = total_bytes / (time_ms / 1000) / 1e9`
   - Flash Attention: `effective_gflops = (4 * batch * heads * seq_len^2 * head_dim) / (time_ms / 1000) / 1e9`

**期待結果：** ベースライン値: カーネル時間（ms）、実効 GFLOPS、実効帯域幅。

**失敗時：** カーネルがエラーなく起動することを確認する（`CHECK_CU` マクロ）。ウォームアップ実行が計測前にあることを検証する。問題次元が GPU を飽和させるのに十分大きいことを確認する（小さい問題は起動オーバーヘッドで律速されうる）。

### ステップ2: ルーフライン上で分類する

算術強度を計算し、マシンのバランス点と比較してカーネルを分類する:

1. **算術強度を計算**: `AI = FLOPs / bytes_loaded_from_global_memory`。DRAM からロードされる一意なバイト数のみを数える（共有メモリやレジスタ再利用は数えない）。
2. **マシンのバランス点を参照**: `balance = peak_compute / peak_bandwidth`。
3. **分類**: `AI < balance` ならカーネルは memory-bound。`AI > balance` ならカーネルは compute-bound。

**GA104 (RTX 3070 Ti) リファレンス値:**

| Resource | Peak | Unit |
|----------|------|------|
| FP32 FFMA | 21.7 | TFLOPS |
| FP16 Tensor Core (HMMA) | 174 | TFLOPS |
| INT8 Tensor Core (IMMA) | 696 | TOPS |
| DRAM Bandwidth | 608 | GB/s |
| L2 Cache | 4 | MB |
| SMs | 48 | |

**導出されるバランス点:**

| Precision | Balance Point (FLOP/byte) |
|-----------|--------------------------|
| FP32 FFMA | 21700 / 608 = 35.7 |
| FP16 TC | 174000 / 608 = 286.2 |
| INT8 TC | 696000 / 608 = 1144.7 |

4. **達成率を計算**: `attained = effective_throughput / peak_throughput`。memory-bound なら実効帯域幅を 608 GB/s と比較。compute-bound なら実効 GFLOPS を該当ピークと比較。

**期待結果：** compute-bound、memory-bound、latency-bound（占有率の低さで計算も帯域も飽和していない）のいずれかへの分類と、その数値的根拠。

**失敗時：** バイト数の数え方を再確認する。冗長な再読み込みに注意する（例: im2col なしの直接 conv2d は 9 倍）。計算も帯域も飽和していなければ、おそらく latency-bound である（ステップ3を参照）。

### ステップ3: 占有率を計算する

起動構成とリソース使用量から、SM あたりのアクティブ warp 数を求める:

1. **リソース使用量を抽出**:
   ```bash
   nvcc --cubin -arch=sm_86 -O2 --resource-usage -o kernel.sm_86.cubin kernel.cu 2>&1 | grep -E 'registers|smem'
   ```
2. **起動構成から**: `warps_per_block = threads_per_block / 32`。
3. **各制約から blocks/SM を計算**:
   - レジスタ制約: `floor(65536 / (registers_per_thread * threads_per_block))`
   - smem 制約: `floor(available_smem_per_SM / smem_per_block)` — クリフはステップ6を参照
   - warp 制約: `floor(48 / warps_per_block)`（GA104 最大: 48 warps/SM）
   - block 制約: GA104 で最大 16 blocks/SM
4. **実際の blocks/SM** = `min(register_limit, smem_limit, warp_limit, block_limit)`。
5. **アクティブ warps/SM** = `blocks_per_SM * warps_per_block`。
6. **重要な閾値**: GA104 では 8 warps/SM がレイテンシ隠蔽に十分。8 未満は構造的問題で latency-bound 挙動を引き起こす。

**期待結果：** blocks/SM、アクティブ warps/SM、制約要因（レジスタ、smem、warp）を示す占有率テーブル。

**失敗時：** 動的共有メモリには `cuFuncSetAttribute` を確認する。`--resource-usage` レポートが実際の起動構成と一致することを検証する。レジスタ数が予想外に多ければ、`--maxrregcount=N` でレジスタを制限してみる（レジスタスピルと占有率のトレードオフ）。

### ステップ4: タイルあたりの Compute/Load 比を計算する

ソースコードではなく SASS から、K タイルあたりの compute 命令とロードバイト数を数える:

1. **逆アセンブル**:
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **タイルあたりの compute 命令を数える**（1 つの K タイルにわたる内側ループ）:
   - `grep -c 'HMMA' kernel.sass` — FP16 Tensor Core 演算
   - `grep -c 'IMMA' kernel.sass` — INT8 Tensor Core 演算
   - `grep -c 'FFMA' kernel.sass` — FP32 fused multiply-add
3. **タイルあたりのグローバルロードを数える**:
   - `grep -c 'LDG' kernel.sass` — グローバルメモリロード
   - ロードあたりのバイト数を掛ける（典型的に LDG.128 では 16 バイト）
4. **比を計算**: タイルあたり `compute_ops / load_ops`。
5. **分類**: cp.async の決定閾値（gpu_reflections.md Insight 2 より）を使用:
   - **High** (>20:1): cp.async は正味マイナス。warp インタリーブが既に DRAM レイテンシを隠蔽している。アルゴリズム変更に注力する。参考: Flash Attention はタイルあたり 64 HMMA = 高比、cp.async 計測は -5%。
   - **Medium** (5-20:1): cp.async は助けになるかもしれない、両経路をベンチマークせよ。
   - **Low** (<5:1): cp.async は強く有益。ロードが支配的で非同期コピーがレイテンシを隠す。参考: IGEMM はタイルあたり 8 IMMA = 低比、cp.async 計測は +35%。

**期待結果：** Compute/load 比とその分類（high/medium/low）、そして cp.async の推奨。

**失敗時：** ソースではなく SASS 逆アセンブルから数える — コンパイラが命令を融合・除去・並べ替えする可能性がある。内側ループ（K タイル反復）内の命令だけを数えていることを確認する、カーネル全体ではない。

### ステップ5: SASS 命令を検査する

完全な SASS 命令ミックスとストールコードを精査する:

1. **逆アセンブル**（ステップ4で行っていない場合）:
   ```bash
   cuobjdump -sass kernel.sm_86.cubin > kernel.sass
   ```
2. **主要な命令タイプを数える**:
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
3. **クリティカル命令のストールコードを確認**:
   ```bash
   grep 'HMMA' kernel.sass | head -5     # Expect S08 minimum (hardware constraint)
   grep 'IMMA' kernel.sass | head -5     # Compiler emits S04, reducible to S02 via CuAssembler
   grep 'FFMA' kernel.sass | head -5     # Check for S04 (reducible to S01 on independent FFMAs)
   ```
4. **最適化対象を特定**:
   - HMMA S08 ストール: Ampere のハードウェア最小値、削減不能。他に注力。
   - IMMA S04 ストール: コンパイラが保守的。CuAssembler で S02 に締められる（計測 15-20% 改善）。
   - FFMA S04 ストール: 独立な場合、CuAssembler で S01 に削減可能。
   - 過剰な BAR.SYNC: パイプライン段間の過同期を示すかもしれない。

**期待結果：** 命令カウント表とストールコード概要、特定された最適化対象。

**失敗時：** `cuobjdump` のアーキテクチャがカーネルのコンパイル対象に一致することを保証する（両方とも sm_86 でなければならない）。SASS 出力が空なら cubin が壊れている可能性がある — 再コンパイルする。

### ステップ6: Smem クリフを確認する

共有メモリ使用量がアーキテクチャ固有の占有率クリフを跨ぐかを判定する:

1. **smem/block を読む**: `--resource-usage` 出力（ステップ3）または `cuobjdump --res-usage kernel.sm_86.cubin` から。
2. **クリフ閾値と比較**:
   - GA104 (sm_86): 100 KB max smem/SM。クリフは 50 KB/block。
   - 経験的に確認: 48 KB/block -> 2 blocks/SM（良）、56 KB/block -> 1 block/SM（2x 後退）。
3. **クリフ超過時** (smem > 50 KB/block):
   - blocks/SM が 1 に落ち、アクティブ warp は warps_per_block（典型的に 4）に落ちる。
   - 露出した DRAM ストールから 2x の性能後退が予想される。
4. **ダブルバッファリングの影響を確認**: ダブルバッファリングは smem 使用量を倍にする。現状 30 KB なら倍で 60 KB となりクリフを跨ぐ。非同期の利益が占有率損失に見合うかを評価する。
5. **記録**: smem/block、blocks/SM、クリフ超過の有無。

**期待結果：** smem/block 値、blocks/SM、50 KB クリフ超過の明示的記述。

**失敗時：** クリフを跨いでおり占有率がボトルネックなら、最適化戦略を変えなければならない: タイルサイズを減らして smem を 50 KB 未満にする、または 1 block/SM を受け入れてタイルあたりの compute/load 比を上げて補償する（より多くのレジスタ再利用、より長い K タイル）。

### ステップ7: 決定マトリクスを構築する

ステップ2-6の発見を最適化戦略へと統合する:

| Condition | Strategy |
|-----------|----------|
| Memory-bound + low compute/load ratio (<5:1) + smem under cliff | Software pipelining with cp.async (LDGSTS). Overlap global loads with compute. |
| Memory-bound + high compute/load ratio (>20:1) + 8+ warps | Warp interleaving already hides latency. Focus on algorithmic changes: implicit GEMM, split-Q, im2col. |
| Compute-bound + FFMA-heavy | CuAssembler stall code tightening: S04 -> S01 on independent FFMAs. |
| Compute-bound + HMMA-heavy | S08 is hardware minimum, cannot reduce. Increase tile reuse (larger M/N tiles, longer K-loop). |
| Compute-bound + IMMA-heavy | CuAssembler: S04 -> S02 on IMMA instructions (compiler is conservative). |
| Latency-bound (low occupancy, neither saturated) | Reduce smem or registers to get more blocks/SM. Get above 8 warps/SM. |
| Smem above cliff | Reduce tile size or restructure to get smem/block under 50 KB (GA104). |

1. **ランク付け**: 適用可能な戦略を期待利得順に、compute/load 比と占有率データを使って並べる。
2. **利得幅を見積もる**: 各戦略について、関連天井までの距離に基づいて。
3. **コンフリクトを示す**: 例: cp.async は smem を倍にする（クリフを跨ぐかも）、より大きなタイルはレジスタ圧を増やす（占有率を下げるかも）。

**期待結果：** 推奨最適化のランク付きリスト、予測利得幅、潜在的コンフリクト。

**失敗時：** 明確な勝者が出てこない場合、各戦略を分離したマイクロベンチマーク（例: cp.async 単独テスト、タイル縮小単独テスト）を実行し、組み合わせ前に実際の影響を計測する。

### ステップ8: 発見を文書化する

構造化されたボトルネックレポートを作成する:

1. **ベースライン**: カーネル時間、実効 GFLOPS、実効帯域幅、問題次元。
2. **ルーフライン位置**: 算術強度、分類、ピークに対する達成率。
3. **占有率**: blocks/SM、アクティブ warps/SM、制約要因。
4. **Compute/load 比**: 比の値、分類（high/medium/low）、cp.async 推奨。
5. **SASS 概要**: 命令カウント表、ストールコード発見、CuAssembler 対象。
6. **Smem クリフ**: smem/block、blocks/SM、クリフ状態。
7. **推奨**: 利得見積もり付きのランク付き最適化戦略。

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

**期待結果：** kernel-optimizer エージェントまたは人間開発者が消費可能な、完全な markdown レポート。

**失敗時：** 異なる問題サイズ（例: 1024、2048、4096、8192）で再実行し、発見がサイズ固有でないことを確認する。小さい問題は latency-bound に見えても、スケール時の真のボトルネックがメモリ帯域であることがある。

## バリデーション

- [ ] CUDA イベントでベースラインを計測（ウォールクロックではない）
- [ ] ルーフライン分類が決定された（compute/memory/latency bound）
- [ ] 占有率を計算し、制約要因を特定
- [ ] SASS からタイルあたり compute/load 比を計算
- [ ] SASS 命令ミックスとストールコードを文書化
- [ ] Smem クリフをアーキテクチャ閾値と照合
- [ ] 戦略推奨と共に決定マトリクスを適用
- [ ] 発見を構造化レポートに文書化

## よくある落とし穴

- **再読み込みの倍増**: im2col なしの直接 conv2d は各重みを 9 回読み、バイトカウントを 9 倍に膨張させる。算術強度を計算する際は、総ロード命令数ではなく、DRAM からの実際の一意なバイト数を使う。
- **FP16 Tensor Core ピークを FP32 ピークと混同する**: FP16 TC ピークは 174 TFLOPS、FP32 FFMA ピークは 21.7 TFLOPS — 8 倍の違い。誤ったピークを使うとルーフライン分類は無意味になる。
- **GA104 で smem クリフを 50 KB ではなく 64 KB と扱う**: GA104 (sm_86) は 100 KB max smem/SM。クリフは 100/2 = 50 KB/block であり、64 KB ではない。これはアーキテクチャ固有で、他の GPU では異なる。
- **cp.async 評価時に warp インタリーブを無視する**: 長い計算フェーズ（高い compute/load 比）を持つ 8 warp は、warp スケジューリングを通じて既に DRAM レイテンシを隠している。この領域で cp.async を加えると smem 圧とバリアオーバーヘッドが増えるだけで利得はない（Flash Attention で計測 -5%）。
- **SASS ではなくソースから命令を数える**: コンパイラは演算を融合し、デッドコードを除去し、ループの展開を変え、命令を並べ替える可能性がある。常に `cuobjdump -sass` 出力から数える。
- **ウォームアップ反復を実行しない**: 最初のカーネル起動は JIT コンパイルオーバーヘッドとコールドキャッシュ効果を含む。計測実行の前に必ず 2-5 回のウォームアップを行う。

## 関連スキル

- `pipeline-gpu-kernel` — 解析が低い compute/load 比の memory-bound カーネルを特定したとき、cp.async によるソフトウェアパイプライニングを実装する
- `simulate-cpu-architecture` — ホスト・デバイス間ワークフローにおける CPU 側ボトルネックの相補的アーキテクチャ解析
