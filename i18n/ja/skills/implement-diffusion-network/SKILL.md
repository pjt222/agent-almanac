---
name: implement-diffusion-network
description: >
  ノイズスケジューリング、U-Netアーキテクチャ、訓練ループ、およびDDIM加速を含む
  サンプリング手順を備えた生成的拡散モデル（DDPMまたはスコアベース）を実装する。
  画像、音声、または分子合成の生成モデルを構築する時、研究論文からDDPMを実装する時、
  カスタムノイズスケジュールまたは条件付けメカニズムを追加する時、GANベースの
  ジェネレータを拡散ベースの代替に置き換える時、またはdiffusersのようなプロダクション
  フレームワークでスケーリングする前にプロトタイピングする時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: advanced
  language: multi
  tags: diffusion, ddpm, generative-ai, denoising, score-matching, u-net
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 拡散ネットワークの実装

順方向ノイジングプロセス、U-Netデノイザー、訓練目的関数、逆サンプリング手順、およびDDIMまたはDPM-Solverによる加速推論を含む、ノイズ除去拡散確率モデル（DDPM）またはスコアベース生成モデルをゼロから構築する。

## 使用タイミング

- 画像、音声、または分子合成の生成モデルを構築する時
- 研究論文からDDPMまたはスコアベース拡散を実装する時
- 拡散パイプラインにカスタムノイズスケジュールまたは条件付けメカニズムを追加する時
- GANベースのジェネレータを拡散ベースの代替に置き換える時
- diffusersのようなフレームワークでプロダクションにスケーリングする前に拡散モデルをプロトタイピングする時

## 入力

- **必須**: 訓練データセット（画像、スペクトログラム、点群、またはその他の連続データ）
- **必須**: 目標解像度とチャネル数
- **必須**: 計算予算（GPUの種類と数、訓練時間の制限）
- **任意**: ノイズスケジュールの種類（デフォルト: cosine）
- **任意**: 拡散タイムステップ数T（デフォルト: 1000）
- **任意**: 条件付け信号（クラスラベル、テキスト埋め込み、またはその他のガイダンス）
- **任意**: サンプリング加速方法（デフォルト: 50ステップのDDIM）

## 手順

### ステップ1: 順方向プロセスの定義（ノイズスケジュール）

データが段階的にノイズ化される方法を制御する分散スケジュールを設定する。

1. ベータスケジュール（線形、cosine、または学習型）を定義する:

```python
import torch
import numpy as np

def cosine_beta_schedule(timesteps, s=0.008):
    """Cosine schedule from Nichol & Dhariwal (2021)."""
    steps = timesteps + 1
    t = torch.linspace(0, timesteps, steps) / timesteps
    alphas_cumprod = torch.cos((t + s) / (1 + s) * np.pi / 2) ** 2
    alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
    betas = 1 - (alphas_cumprod[1:] / alphas_cumprod[:-1])
    return torch.clip(betas, 0.0001, 0.9999)

def linear_beta_schedule(timesteps, beta_start=1e-4, beta_end=0.02):
    """Original DDPM linear schedule."""
    return torch.linspace(beta_start, beta_end, timesteps)
```

2. 訓練とサンプリング中に使用される導出量を事前計算する:

```python
class DiffusionSchedule:
    def __init__(self, betas):
        self.betas = betas
        self.alphas = 1.0 - betas
        self.alphas_cumprod = torch.cumprod(self.alphas, dim=0)
        self.alphas_cumprod_prev = torch.cat([torch.tensor([1.0]), self.alphas_cumprod[:-1]])
        self.sqrt_alphas_cumprod = torch.sqrt(self.alphas_cumprod)
        self.sqrt_one_minus_alphas_cumprod = torch.sqrt(1.0 - self.alphas_cumprod)
        self.posterior_variance = (
            betas * (1.0 - self.alphas_cumprod_prev) / (1.0 - self.alphas_cumprod)
        )
```

3. 順方向ノイジング関数（q-sample）を実装する:

```python
    def q_sample(self, x_0, t, noise=None):
        """Add noise to x_0 at timestep t: q(x_t | x_0)."""
        if noise is None:
            noise = torch.randn_like(x_0)
        sqrt_alpha = self.sqrt_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        return sqrt_alpha * x_0 + sqrt_one_minus_alpha * noise
```

4. スケジュールを視覚的に検証する:

```python
schedule = DiffusionSchedule(cosine_beta_schedule(1000))
print(f"alpha_cumprod at t=0:   {schedule.alphas_cumprod[0]:.4f}")    # ~1.0 (clean)
print(f"alpha_cumprod at t=500: {schedule.alphas_cumprod[500]:.4f}")   # ~0.5 (half noise)
print(f"alpha_cumprod at t=999: {schedule.alphas_cumprod[999]:.4f}")   # ~0.0 (pure noise)
```

**期待結果:** `alphas_cumprod`が1.0付近から0.0付近まで単調に減少すること。cosineスケジュールは中間のタイムステップで線形よりも緩やかに減少するべきである。

**失敗時:** `alphas_cumprod`がt=Tで0付近に到達しない場合、モデルは純粋なノイズからの生成を学習しない。Tを増やすかスケジュールを調整する。値が負になる場合、ベータのクリッピング境界を確認する。

### ステップ2: デノイジングネットワークアーキテクチャの設計

ノイズ入力が与えられた時にノイズを予測する、時間条件付きのU-Netを構築する。

1. 時間埋め込みモジュールを定義する:

```python
import torch.nn as nn
import math

class SinusoidalTimeEmbedding(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.dim = dim

    def forward(self, t):
        half_dim = self.dim // 2
        emb = math.log(10000) / (half_dim - 1)
        emb = torch.exp(torch.arange(half_dim, device=t.device) * -emb)
        emb = t[:, None].float() * emb[None, :]
        return torch.cat([emb.sin(), emb.cos()], dim=-1)
```

2. 時間条件付きの残差ブロックを定義する:

```python
class ResBlock(nn.Module):
    def __init__(self, in_ch, out_ch, time_dim):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, 3, padding=1)
        self.conv2 = nn.Conv2d(out_ch, out_ch, 3, padding=1)
        self.time_mlp = nn.Linear(time_dim, out_ch)
        self.norm1 = nn.GroupNorm(8, out_ch)
        self.norm2 = nn.GroupNorm(8, out_ch)
        self.skip = nn.Conv2d(in_ch, out_ch, 1) if in_ch != out_ch else nn.Identity()

    def forward(self, x, t_emb):
        h = self.norm1(torch.nn.functional.silu(self.conv1(x)))
        h = h + self.time_mlp(torch.nn.functional.silu(t_emb))[:, :, None, None]
        h = self.norm2(torch.nn.functional.silu(self.conv2(h)))
        return h + self.skip(x)
```

3. エンコーダ、ボトルネック、デコーダでU-Netを組み立てる:

```python
class UNet(nn.Module):
    def __init__(self, in_channels=3, base_channels=64, channel_mults=(1, 2, 4, 8)):
        super().__init__()
        time_dim = base_channels * 4
        self.time_embed = nn.Sequential(
            SinusoidalTimeEmbedding(base_channels),
            nn.Linear(base_channels, time_dim),
            nn.SiLU(),
            nn.Linear(time_dim, time_dim)
        )
        # Encoder, bottleneck, and decoder built from ResBlocks
        # with skip connections between encoder and decoder stages
        # (full implementation depends on resolution and channel config)
```

4. アーキテクチャが目標解像度の入力を受け入れることを検証する:

```python
model = UNet(in_channels=3, base_channels=64)
x_test = torch.randn(2, 3, 64, 64)
t_test = torch.randint(0, 1000, (2,))
out = model(x_test, t_test)
assert out.shape == x_test.shape, f"Output shape {out.shape} != input shape {x_test.shape}"
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
```

**期待結果:** モデルが入力と同じ形状のテンソルを出力すること（一致する次元のノイズを予測）。パラメータ数は解像度に比例するべき: 64x64で約30-60M、256x256で100-300M。

**失敗時:** 形状の不一致は通常、ダウンサンプリング/アップサンプリング比率の誤りを示す。各エンコーダステージが空間次元を半分にし、各デコーダステージが倍にしていることを検証する。GroupNormではチャネル数がグループ数で割り切れる必要がある。

### ステップ3: 訓練ループの実装

各タイムステップで追加されたノイズを予測するようにデノイザーを訓練する。

1. 訓練目的関数を設定する（簡略化されたDDPM損失）:

```python
def training_loss(model, schedule, x_0):
    batch_size = x_0.shape[0]
    t = torch.randint(0, len(schedule.betas), (batch_size,), device=x_0.device)
    noise = torch.randn_like(x_0)
    x_t = schedule.q_sample(x_0, t, noise)
    predicted_noise = model(x_t, t)
    loss = torch.nn.functional.mse_loss(predicted_noise, noise)
    return loss
```

2. オプティマイザと学習率スケジュールを設定する:

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100000)
```

3. ロギング付きの訓練ループを実行する:

```python
from torch.utils.data import DataLoader

dataloader = DataLoader(dataset, batch_size=64, shuffle=True, num_workers=4, pin_memory=True)

for epoch in range(num_epochs):
    model.train()
    epoch_loss = 0.0
    for batch_idx, x_0 in enumerate(dataloader):
        x_0 = x_0.to(device)
        loss = training_loss(model, schedule, x_0)
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()
        epoch_loss += loss.item()
    avg_loss = epoch_loss / len(dataloader)
    print(f"Epoch {epoch}: loss={avg_loss:.4f}, lr={scheduler.get_last_lr()[0]:.6f}")
```

4. チェックポイントを定期的に保存する:

```python
    if (epoch + 1) % 10 == 0:
        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "loss": avg_loss
        }, f"checkpoint_epoch_{epoch+1}.pt")
```

**期待結果:** 訓練全体を通じて損失が着実に減少すること。[-1, 1]に正規化された画像データの場合、初期損失は1.0付近（ランダムノイズの予測）であるべきである。収束後、損失はデータの複雑さに応じて0.01-0.10の範囲であるべきである。

**失敗時:** 損失が早期に停滞する場合（> 0.5）、以下を確認する: (a) データの正規化（[-1, 1]または[0, 1]で最終活性化と一致する必要がある）、(b) 学習率（3e-4または5e-5を試す）、(c) 勾配クリッピング（1.0が標準）。損失がNaNの場合、学習率を下げ、スケジュール内のゼロ除算を確認する。

### ステップ4: サンプリングの実装（逆プロセス）

純粋なガウスノイズから反復的にデノイジングして新しいサンプルを生成する。

1. 標準DDPMサンプリングループを実装する:

```python
@torch.no_grad()
def ddpm_sample(model, schedule, shape, device):
    """Sample via the full DDPM reverse process (T steps)."""
    x = torch.randn(shape, device=device)
    T = len(schedule.betas)

    for t in reversed(range(T)):
        t_batch = torch.full((shape[0],), t, device=device, dtype=torch.long)
        predicted_noise = model(x, t_batch)

        alpha = schedule.alphas[t]
        alpha_cumprod = schedule.alphas_cumprod[t]
        beta = schedule.betas[t]

        mean = (1 / torch.sqrt(alpha)) * (
            x - (beta / torch.sqrt(1 - alpha_cumprod)) * predicted_noise
        )

        if t > 0:
            noise = torch.randn_like(x)
            sigma = torch.sqrt(schedule.posterior_variance[t])
            x = mean + sigma * noise
        else:
            x = mean

    return x
```

2. サンプルを生成して可視化する:

```python
samples = ddpm_sample(model, schedule, shape=(16, 3, 64, 64), device=device)
samples = (samples.clamp(-1, 1) + 1) / 2  # rescale to [0, 1]
```

**期待結果:** 生成されたサンプルが認識可能な構造を示すこと（純粋なノイズや均一な色ではない）。100K以上の訓練ステップによる64x64解像度では、出力が訓練分布に視覚的に似ているべきである。

**失敗時:** サンプルがぼやけている場合、より長く訓練するかモデル容量を増やす。サンプルがノイズっぽい場合、逆プロセスにバグがある可能性がある — スケジュールのインデックスが訓練と一致していることを検証する。すべてのサンプルが同一に見える場合、モード崩壊を確認する（異なるランダムシードを試す）。

### ステップ5: サンプリング加速の追加

DDIMまたはDPM-Solverを使用してサンプリングステップ数を減らす。

1. DDIMサンプリングを実装する（決定論的、ステップ数削減）:

```python
@torch.no_grad()
def ddim_sample(model, schedule, shape, device, num_steps=50, eta=0.0):
    """DDIM sampling with configurable step count and stochasticity."""
    T = len(schedule.betas)
    step_indices = torch.linspace(0, T - 1, num_steps, dtype=torch.long)

    x = torch.randn(shape, device=device)

    for i in reversed(range(len(step_indices))):
        t = step_indices[i]
        t_batch = torch.full((shape[0],), t, device=device, dtype=torch.long)
        predicted_noise = model(x, t_batch)

        alpha_t = schedule.alphas_cumprod[t]
        alpha_prev = schedule.alphas_cumprod[step_indices[i - 1]] if i > 0 else torch.tensor(1.0)

        predicted_x0 = (x - torch.sqrt(1 - alpha_t) * predicted_noise) / torch.sqrt(alpha_t)
        predicted_x0 = predicted_x0.clamp(-1, 1)

        sigma = eta * torch.sqrt((1 - alpha_prev) / (1 - alpha_t) * (1 - alpha_t / alpha_prev))
        direction = torch.sqrt(1 - alpha_prev - sigma**2) * predicted_noise

        x = torch.sqrt(alpha_prev) * predicted_x0 + direction
        if i > 0 and eta > 0:
            x = x + sigma * torch.randn_like(x)

    return x
```

2. ステップ数間でサンプル品質を比較する:

```python
for n_steps in [10, 25, 50, 100, 250]:
    samples = ddim_sample(model, schedule, shape=(16, 3, 64, 64), device=device, num_steps=n_steps)
    print(f"DDIM {n_steps} steps: generated {samples.shape[0]} samples")
    # Save grid for visual comparison
```

3. サンプリング速度をベンチマークする:

```python
import time

for method, n_steps in [("DDPM", 1000), ("DDIM-50", 50), ("DDIM-25", 25)]:
    start = time.time()
    _ = ddim_sample(model, schedule, (1, 3, 64, 64), device, num_steps=n_steps if "DDIM" in method else 1000)
    elapsed = time.time() - start
    print(f"{method}: {elapsed:.2f}s per sample")
```

**期待結果:** 50ステップのDDIMが1000ステップのDDPMと視覚的に同等のサンプルを20倍の速度改善で生成すること。品質は約20-25ステップまで緩やかに劣化する。

**失敗時:** DDIMサンプルが同じステップ数のDDPMより悪い場合、アルファのインデックスを検証する。DDIMは`alphas`ではなく`alphas_cumprod`を直接使用する。低ステップ数でサンプルが非常にノイズっぽい場合、まずeta=0.0（完全に決定論的）を試す。

### ステップ6: サンプル品質の評価

標準的なメトリクスを使用して生成品質を定量化する。

1. FID（Frechet Inception Distance）を計算する:

```python
from torchmetrics.image.fid import FrechetInceptionDistance

fid_metric = FrechetInceptionDistance(feature=2048, normalize=True)

# Add real images
for batch in real_dataloader:
    fid_metric.update(batch.to(device), real=True)

# Add generated images
n_generated = 0
while n_generated < 10000:
    samples = ddim_sample(model, schedule, (64, 3, 64, 64), device, num_steps=50)
    samples = ((samples.clamp(-1, 1) + 1) / 2 * 255).byte()
    fid_metric.update(samples, real=False)
    n_generated += samples.shape[0]

fid_score = fid_metric.compute()
print(f"FID: {fid_score:.2f}")
```

2. サンプルの多様性を評価する（モード崩壊の確認）:

```python
# Compute pairwise LPIPS distances among generated samples
from torchmetrics.image.lpip import LearnedPerceptualImagePatchSimilarity

lpips = LearnedPerceptualImagePatchSimilarity(net_type="alex")
n_pairs = 50
diversity_scores = []
for i in range(n_pairs):
    s1 = ddim_sample(model, schedule, (1, 3, 64, 64), device, num_steps=50)
    s2 = ddim_sample(model, schedule, (1, 3, 64, 64), device, num_steps=50)
    score = lpips(s1.clamp(-1, 1), s2.clamp(-1, 1))
    diversity_scores.append(score.item())
print(f"Mean pairwise LPIPS: {np.mean(diversity_scores):.4f} (higher = more diverse)")
```

3. 結果をログする:

```python
results = {
    "fid": fid_score.item(),
    "mean_lpips_diversity": float(np.mean(diversity_scores)),
    "sampling_method": "DDIM-50",
    "training_epochs": num_epochs,
    "model_params": sum(p.numel() for p in model.parameters())
}
print("Evaluation results:", results)
```

**期待結果:** 標準ベンチマーク（CIFAR-10、CelebA）で十分に訓練されたモデルのFIDが50未満。LPIPS多様性が0.4以上であればモード崩壊なしを示す。最先端のモデルはCIFAR-10でFID 2-10を達成する。

**失敗時:** 高いFID（>100）は訓練の問題またはエポック不足を示す。低い多様性（LPIPS < 0.2）はモード崩壊を示唆する — モデル容量を増やす、データ拡張を確認する、またはより長く訓練する。安定したFID推定のために少なくとも10Kサンプルで計算する。

## バリデーション

- [ ] 順方向プロセスがt=Tで純粋なノイズを生成する（視覚的確認と数値: 平均が0付近、標準偏差が1付近）
- [ ] U-Netの出力形状がすべての目標解像度で入力形状と一致する
- [ ] 訓練損失が最初の1000ステップで単調に減少する
- [ ] DDPMサンプリングが十分な訓練後に認識可能な出力を生成する
- [ ] 50ステップのDDIMが1000ステップのDDPMと同等の品質を生成する
- [ ] 目標データセットでFIDスコアが50未満（ドメインに応じて閾値を調整）
- [ ] サンプルの多様性（LPIPS）がモード崩壊なしを確認する
- [ ] チェックポイントが保存されエラーなしで読み込み可能

## よくある落とし穴

- **データ正規化の誤り**: DDPMは[-1, 1]のデータを前提とする。画像が[0, 255]の場合、損失が巨大になり訓練が発散する。訓練前に正規化し、サンプリング後に逆正規化する。
- **スケジュールインデックスのオフバイワン**: 順方向プロセスはステップtでのノイズ化サンプルに`alphas_cumprod[t]`を使用する。サンプリングでのオフバイワンエラー（t+1またはt-1の使用）は視覚的に劣化したサンプルを生成する。
- **勾配クリッピングの忘却**: `clip_grad_norm_(1.0)`なしでは、大きなモデルの訓練が不安定になる。初期エポックでは特に重要。
- **DDIMのステップ数が少なすぎる**: 20ステップ未満ではDDIMの品質が急速に劣化する。許容可能な結果には少なくとも25ステップ、DDPMに近い品質には50ステップを使用する。
- **少なすぎるサンプルでのFID評価**: FID推定は小さなサンプルサイズではバイアスがかかる。安定したFID計算には少なくとも10,000の生成画像と10,000の実画像を使用する。
- **EMAの無視**: モデル重みの指数移動平均はサンプル品質を大幅に改善する。減衰率0.9999を使用し、訓練モデルではなくEMAモデルからサンプリングする。

## 関連スキル

- `analyze-diffusion-dynamics` - DDPMが離散化する拡散SDEの数学的基礎
- `fit-drift-diffusion-model` - 認知モデリングへの拡散プロセスの異なる応用
- `setup-gpu-training` - 拡散モデル訓練のためのGPU環境の設定
- `containerize-application` - 拡散推論パイプラインのDockerパッケージング
