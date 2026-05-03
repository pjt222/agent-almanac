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
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Pipeline GPU Kernel

タイル化された GPU カーネルにソフトウェアパイプライニング（double-buffering）を適用し、tile N+1 のグローバルメモリロードを tile N の Tensor Core 計算と重ねる。順次の load-sync-compute-sync K ループを prologue/loop/epilogue 構造に変換し、タイルあたりの compute/load 比に基づいて LDG-register と cp.async（LDGSTS）バリアントの間で選択し、共有メモリがアーキテクチャ占有率クリフ未満に留まるか検証し、最終 SASS でロード/計算の重ねを確認する。

## 使用タイミング

- `analyze-kernel-bottleneck` がタイルあたり低 compute/load 比の memory-bound カーネルを特定したとき
- warp インタリーブ単独では DRAM レイテンシ（GA104 で ~300 サイクル）を隠せないとき
- カーネルが再構築可能な順次 load-sync-compute-sync K ループを持つとき
- compute/load 比が高い（>20:1）で 8+ warp がアクティブなときは不要

## 入力

- **必須**: 別個のロードと計算フェーズを含むタイル化された K ループを持つ CUDA カーネルソースファイル（`.cu`）
- **必須**: ターゲット GPU アーキテクチャ（例: GA104 / sm_86 — smem クリフと占有率制限を決定）
- **必須**: 現在のタイルサイズ（BM、BN、BK）とデータ型（FP16、FP32、INT8）
- **任意**: タイルあたり compute/load 比（`analyze-kernel-bottleneck` から; 提供されなければ推定される）
- **任意**: ベンチマークベースライン（ターゲット問題サイズでの非パイプライン性能）

## 手順

### ステップ1: 前提条件を検証する

カーネルが `__syncthreads()` で分離された別個のロードと計算フェーズを持つタイル化された K ループを持つことを確認する。倍にされた共有メモリコストを計算しアーキテクチャ占有率クリフ未満に留まるか検証する。

1. カーネル内の K ループを位置特定する。順次構造を持たねばならない: グローバルから共有メモリへ A と B タイルをロード、`__syncthreads()`、共有メモリタイル上で計算（HMMA/IMMA/FFMA）、`__syncthreads()`。
2. 単一バッファ共有メモリサイズを記録: `smem_a_size = BM * BK * sizeof(T)` と `smem_b_size = BK * BN * sizeof(T)`。
3. 倍バッファコストを計算: `smem_doubled = smem_a_size * 2 + smem_b_size * 2`。
4. アーキテクチャクリフと比較。GA104 (sm_86): 100 KB max smem/SM、クリフは 50 KB/block（50 KB 超 = 1 block/SM = 4 warp、2x 占有率崩壊）。

```
Single buffer: smem_a[BM*BK] + smem_b[BK*BN] = 2 KB + 2 KB = 4 KB
Double buffer: smem_a[2][BM*BK] + smem_b[2][BK*BN] = 4 KB + 4 KB = 8 KB
8 KB << 50 KB cliff -> 2 blocks/SM -> 8 warps
```

5. ループ反復カウントを検証: `num_tiles = K / BK`。パイプライニングは `num_tiles >= 2`（少なくとも一つの prologue + 一つのメインループ反復）を要求する。

**期待結果：** 単一バッファと倍バッファコストを示す共有メモリ予算表、倍にされた割り当てがアーキテクチャクリフ未満に少なくとも 2 blocks/SM 占有率で留まることを確認。

**失敗時：** 倍バッファがクリフを超えるなら、`smem_doubled <= 50 KB`（GA104）になるまでタイルサイズを減らす（BK または BM を半分に）。代替として、共有メモリを倍にせずレジスタのみのプリフェッチ（LDG バリアント）を使う — プリフェッチデータをレジスタに保存し、`__syncthreads()` 後に同じ単一バッファに書く。

### ステップ2: バリアントを選ぶ

タイルあたりの compute/load 比に基づいて LDG-register と cp.async（LDGSTS）の間で選択する。

1. compute/load 比を計算: GEMM ライクカーネルには `ratio = (2 * BM * BN * BK) / ((BM * BK + BK * BN) * sizeof(T))`（multiply-add ごとに 2 FLOPs、タイルあたりロードバイト）。
2. 決定ルールを適用:

**LDG-register バリアント**（ratio >= 5 または CUDA < 11.0）:
- LDG tile N+1 をレジスタへ（非ブロッキンググローバルロード）。
- `buf[N % 2]` 上で計算（未処理 LDG と重なる）。
- `__syncthreads()`、それから STS レジスタを `buf[(N+1) % 2]` へ、`__syncthreads()`。
- より単純な実装、パイプライン API 依存なし。
- レジスタ圧を加える: ステージング用にスレッドごと ~`(BM * BK + BK * BN) / BLOCK_SIZE` レジスタ。

**cp.async（LDGSTS）バリアント**（ratio < 5、CUDA >= 11.0）:
- `__pipeline_memcpy_async` tile N+1 を `buf[(N+1) % 2]` に直接（async、レジスタファイルバイパス）。
- 計算前に `__pipeline_commit()`。
- `buf[N % 2]` 上で計算。
- 計算後に `__pipeline_wait_prior(0)` + `__syncthreads()`。
- より良い重ね、プリフェッチ用ゼロレジスタ圧。`#include <cuda_pipeline.h>` を要求。

3. 決定閾値（4096x4096x4096 で IGEMM を使い GA104 で計測）:
   - Ratio < 5:1 — cp.async を選好（IGEMM で +35% 計測）。
   - Ratio 5-20:1 — 両方を実装してベンチマークで決定。
   - Ratio > 20:1 — パイプライニングはおそらく有益でない（warp インタリーブで十分）。

**期待結果：** compute/load 比とターゲットアーキテクチャに基づく根拠付きで選ばれたバリアント。

**失敗時：** 比が曖昧（5-20:1 範囲）なら、両バリアントを実装してベンチマークする。CUDA バージョンがサポートするとき cp.async バリアントが安全な既定。

### ステップ3: K ループを再構築する

順次 load-sync-compute-sync ループをパイプライン prologue/loop/epilogue 構造に変換する。

1. **3 つのセクションを特定**: 元のループ本体は 3 つの部分になる:
   - **Prologue**: tile 0 を `buf[0]` にロード、同期、それからメインループに入る。
   - **Main loop**: tile 1 から `num_tiles - 1` まで、tile N+1 のロードを tile N の計算と重ねる。
   - **Epilogue**: 最後のタイルを計算（最後のメインループ反復で既にロード済み）。

2. **LDG-register バリアント構造**:

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

3. **cp.async バリアント構造**:

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

4. ループカウントを検証: メインループは `num_tiles - 1` 反復走る（tile 0 から `num_tiles - 2` がどのタイルを計算するかをインデックス、tile 1 から `num_tiles - 1` をロード）。Epilogue が最後の反復でロードされたタイルを計算する。

**期待結果：** 選ばれたバリアント用に明確な prologue、メインループ、epilogue セクションを持つ再構築された K ループソースコード。

**失敗時：** 最も一般的なバグはバッファインデックスでの off-by-one または epilogue 計算パスを忘れること。検証: prologue は `buf[0]` にロード、最初のメインループ反復は `buf[0]` で計算し `buf[1]` にロード、二番目反復は `buf[1]` で計算し `buf[0]` にロード、等。Epilogue は `buf[(num_tiles - 1) & 1]` を計算する。

### ステップ4: 倍バッファを実装する

倍バッファ共有メモリを宣言しロード関数を実装する。

1. 単一バッファ共有メモリ宣言を倍バッファ配列で置換:

```c
// Before (single buffer)
__shared__ half smem_a[BM * BK];
__shared__ half smem_b[BK * BN];

// After (double buffer)
__shared__ half smem_a[2][BM * BK];
__shared__ half smem_b[2][BK * BN];
```

2. cp.async バリアントには、パイプライン API を使って async ロード関数を実装:

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

3. LDG バリアントには、レジスタステージング配列とストア関数を実装:

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

4. コンパイラに正確な占有率情報を与えるためカーネルに `__launch_bounds__(BLOCK_SIZE)` を保つ。
5. コンパイル: `nvcc --cubin -arch=sm_86 -O2 -o kernel.sm_86.cubin kernel.cu`。

**期待結果：** 倍バッファ共有メモリと選ばれたロード機構を持つコンパイル可能なカーネル。エラーなしの成功 cubin 生成。

**失敗時：** パイプライン API 呼び出しでコンパイルが失敗したら、`#include <cuda_pipeline.h>` が存在し CUDA toolkit が >= 11.0 か保証する。レジスタスピルが起こる（`nvcc --resource-usage` を確認）なら、BLOCK_SIZE を増やすか BK を減らしてレジスタステージング配列サイズを減らす。

### ステップ5: 正確性を検証する

CPU 参照に対してパイプライン化されたカーネルを動かして同一の数値出力を確認する。

1. ベンチマークをコンパイル: `nvcc -arch=sm_86 -O2 -o bench bench.cu -lcuda -I../../phase2/common`。
2. スケールアップ前にインデックスバグを捕まえるため、まず小問題サイズ（512x512x512）で実行する。
3. データ型に正しい公差を適用:
   - INT8 Tensor Core (IMMA): `abs=0.5, rel=0.1`
   - FP16 Tensor Core (HMMA): `abs=1e-2, rel=1e-2`
   - FP32 scalar (FFMA): `abs=1e-3, rel=1e-3`
4. パイプライニングは算術を変えない — ロードを並べ替えるだけ。正確性が失敗したら、バグはバッファインデックスにあり計算ロジックではない。
5. ターゲット問題サイズ（例: 4096x4096x4096）でテストして境界処理を検証する。

**期待結果：** 非パイプラインベースラインと同一のエラー境界で小・ターゲット問題サイズの両方で PASS。

**失敗時：** バッファインデックスバグが最も可能性の高い原因。検証: 計算は `buf[tile & 1]` から読み、ロードは `buf[1 - (tile & 1)]` に書く。Epilogue がバッファインデックス `(num_tiles - 1) & 1`、`num_tiles & 1` ではなく、を処理するか確認する。cp.async については、`__pipeline_wait_prior(0)` が `__syncthreads()` 前に完了することを検証する — そうでないと計算が部分書き込みデータを読みうる。

### ステップ6: ベンチマークと比較

ターゲット問題サイズで非パイプラインベースラインに対してパイプラインカーネルを計測する。

1. 非パイプラインベースラインを実行し GFLOPS または帯域幅（カーネルタイプによる）を記録。
2. 各パイプラインバリアントを実行し同じ指標を記録。
3. スピードアップを計算: `speedup = pipelined_metric / baseline_metric`。
4. compute/load 比による期待利得（GA104 で計測）:
   - 低比（<5:1）: cp.async から +15-35%（IGEMM で計測: LDG +18%、cp.async +35% で 4096x4096x4096）。
   - 中比（5-20:1）: +5-15%。
   - 高比（>20:1）: 0-5% またはリグレッション。
5. 両バリアントが実装されていれば、本番使用には速い方を選ぶ。

```
| Variant          | GFLOPS | Speedup vs Baseline |
|------------------|--------|---------------------|
| Baseline         | XXX    | 1.00x               |
| LDG-register     | XXX    | X.XXx               |
| cp.async (LDGSTS)| XXX    | X.XXx               |
```

**期待結果：** 改善を示す性能比較表。選ばれたバリアントは compute/load 比予測と一致する計測可能なスピードアップを示すべき。

**失敗時：** 性能がリグレッションするなら、3 つを確認: (1) 予期しない命令オーバーヘッドの SASS（余分な BAR.SYNC、レジスタスピル）。(2) 共有メモリが占有率クリフを越えなかった — `nvcc --resource-usage` または `cuobjdump -res-usage` で検証。(3) 問題サイズが prologue/epilogue オーバーヘッドを償却するに十分なタイル（`K / BK >= 4`）を生む。

### ステップ7: SASS 重ねを検証する

コンパイルされた SASS を検査してメインループ本体内でグローバルロードと Tensor Core 命令が重なるか確認する。

1. 逆アセンブル: `cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'`。
2. メインループ本体で、この順序パターンを検証:
   - `LDGSTS` または `LDG` 命令が `HMMA` または `IMMA` 命令の **前** に現れる。
   - ロード命令と計算命令の間に `BAR.SYNC` がない（warp スケジューラで重ねるため自由でなければならない）。
   - `BAR.SYNC` が計算ブロックの **後** に現れ、ロードされたデータの次の反復での使用をゲートする。
3. HMMA/IMMA 命令のストールコードを確認 — HMMA パイプライン遅延の S08 が予想されかつ避けられない。IMMA の S01-S04 は普通。LDG/LDGSTS のストールは低い（S01）はず、warp スケジューラがロードが飛行中に計算に切り替えられるから。
4. ループ反復あたりの総 HMMA/IMMA 命令を数える — これは非パイプラインバージョンと一致するべき（パイプライニングは計算量を変えるべきでない）。

```bash
# Full SASS pipeline verification
cuobjdump -sass kernel.sm_86.cubin | grep -E 'IMMA|HMMA|LDGSTS|LDG|BAR'

# Count compute instructions per loop
cuobjdump -sass kernel.sm_86.cubin | grep -c 'HMMA\|IMMA'

# Check for register spills
nvcc --resource-usage --cubin -arch=sm_86 -O2 kernel.cu 2>&1 | grep -i spill
```

**期待結果：** 介在バリアなしで load-before-compute パターンを示す注釈付き SASS 抜粋。レジスタスピルゼロ。

**失敗時：** コンパイラが計算後にロードを並べ替えた（重ねを破る）なら試す: (1) 過攻撃的な展開を防ぐためメインループに `#pragma unroll 1`。(2) シーケンシングヒントを作るためロードと計算を別個のインライン関数に分ける。(3) ロードと計算ブロック間のコンパイラフェンスとして `asm volatile("" ::: "memory")` を使う（最後の手段 — 他の最適化を阻害するかも）。

## バリデーション

- [ ] 倍バッファ smem がアーキテクチャクリフ未満に留まる（GA104: 50 KB/block）
- [ ] 両バッファが交互に使われる（`buf[tile & 1]` パターン）
- [ ] Prologue が tile 0 を `buf[0]` にロード
- [ ] Epilogue が `buf[(num_tiles - 1) & 1]` から最後のタイルを計算
- [ ] CPU 参照に対し小・ターゲットサイズの両方で正確性 PASS
- [ ] SASS がロード/計算重ねを確認（LDGSTS/LDG と IMMA/HMMA 間に `BAR.SYNC` なし）
- [ ] 性能が非パイプラインベースラインを超えて改善
- [ ] LDG バリアントからレジスタスピルなし（`nvcc --resource-usage` を確認）

## よくある落とし穴

- **バッファ倍化で smem クリフを越える** — GA104 クリフは 50 KB/block、64 KB ではない。実装前に常に `smem_doubled` を計算する。28 KB 単一バッファのカーネルが倍で 56 KB に跳ね、クリフを越え占有率を半減する。これがパイプライニング +20% 利得を -50% 占有率リグレッションに変えうる。
- **Epilogue 計算パスを忘れる** — 最後のメインループ反復でロードされた最後のタイルはループ外で自身の計算フェーズを必要とする。それなしでは、K 次元の最後の BK 列が静かに落とされ、明らかな失敗ではなく小さな数値エラーとして現れうる誤った結果を生む。
- **バッファインデックス off-by-one** — 現在の計算バッファに `buf[tile & 1]` を、次のロードバッファに `buf[1 - (tile & 1)]` を使う。一般的な誤りは次のバッファに `buf[(tile + 1) & 1]` を使うこと。これはバッファ数が 2 のときのみ `buf[1 - (tile & 1)]` と等価 — しかし計算インデックスに誤って適用されると間違って読む。
- **cp.async commit/wait 順序** — `__pipeline_commit()` は計算フェーズの **前** に呼ばねばならない（async コピーのバッチを封印する）。`__pipeline_wait_prior(0)` は計算フェーズの **後** に呼ばねばならない（コミットされたコピーすべてが完了するまでブロックする）。これらを入れ替えると async コピーが同期的になり、すべての重ね利益を排除する。
- **__syncthreads が欠落** — LDG バリアントでは、計算と STS ドレインの間に `__syncthreads()` が必要（計算が現バッファの読み取りを終えてから上書きされる）。STS ドレイン後にもう一つ `__syncthreads()` が必要（次の反復が読む前にすべてのスレッドが書き終える）。cp.async バリアントでは、`__pipeline_wait_prior(0)` の後の `__syncthreads()` がすべてのスレッドが完了した async コピーを見ることを保証する。
- **cp.async での境界処理** — `__pipeline_memcpy_async` はソースアドレスが有効でアラインメントされていることを要求する。`K` が `BK` の倍数でない行列エッジでは、最後のタイルが境界外を読みうる。最終タイルには境界チェック付きスカラーロードにフォールバックするか、入力行列を BK の倍数までパディングする。

## 関連スキル

- `analyze-kernel-bottleneck` — カーネルが memory-bound かを特定し、バリアント選択を駆動する compute/load 比を計算する
