---
name: implement-diffusion-network
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Implement a generative diffusion model (DDPM or score-based) with noise
  scheduling, U-Net architecture, training loop, and sampling procedures
  including DDIM acceleration. Use when building a generative model for
  image, audio, or molecular synthesis; implementing DDPM from a research
  paper; adding a custom noise schedule or conditioning mechanism; replacing
  a GAN-based generator with a diffusion alternative; or prototyping before
  scaling with production frameworks like diffusers.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: advanced
  language: multi
  tags: diffusion, ddpm, generative-ai, denoising, score-matching, u-net
---

# 建擴散網路

自零建去噪擴散概率模型（DDPM）或基於分數之生成模型，含前向加噪過程、U-Net 去噪器、訓練目標、反向採樣過程與經 DDIM 或 DPM-Solver 加速推理。

## 適用時機

- 為影像、音訊或分子合成建生成模型
- 依研究論文建 DDPM 或分數基擴散
- 於擴散流水中加自訂加噪計畫或條件機制
- 以擴散為基之生成器代 GAN 基生成器
- 以 diffusers 等生產框架擴展前原型化擴散模型

## 輸入

- **必要**：訓練資料集（影像、頻譜圖、點雲或他連續資料）
- **必要**：目標解析度與通道數
- **必要**：計算預算（GPU 類與數、訓練時限）
- **選擇性**：加噪計畫類（預設：cosine）
- **選擇性**：擴散時步 T 數（預設：1000）
- **選擇性**：條件訊號（類標、文嵌入或他引導）
- **選擇性**：採樣加速法（預設：DDIM 五十步）

## 步驟

### 步驟一：定前向過程（加噪計畫）

配控資料如何漸加噪之變異計畫。

1. 定 beta 計畫（線性、cosine 或學得）：

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

2. 預算訓練與採樣所用之衍生量：

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

3. 實前向加噪函數（q-sample）：

```python
    def q_sample(self, x_0, t, noise=None):
        """Add noise to x_0 at timestep t: q(x_t | x_0)."""
        if noise is None:
            noise = torch.randn_like(x_0)
        sqrt_alpha = self.sqrt_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        return sqrt_alpha * x_0 + sqrt_one_minus_alpha * noise
```

4. 視覺驗計畫：

```python
schedule = DiffusionSchedule(cosine_beta_schedule(1000))
print(f"alpha_cumprod at t=0:   {schedule.alphas_cumprod[0]:.4f}")    # ~1.0 (clean)
print(f"alpha_cumprod at t=500: {schedule.alphas_cumprod[500]:.4f}")   # ~0.5 (half noise)
print(f"alpha_cumprod at t=999: {schedule.alphas_cumprod[999]:.4f}")   # ~0.0 (pure noise)
```

**預期：** `alphas_cumprod` 自近 1.0 單調降至近 0.0。Cosine 計畫中間時步應較線性漸降。

**失敗時：** 若 `alphas_cumprod` 於 t=T 時未至近零，模型不能從純噪學生成。增 T 或調計畫。若值變負，核 betas 之截斷界。

### 步驟二：設計去噪網路架構

建附時間條件、於噪輸入下預測噪之 U-Net。

1. 定時間嵌入模組：

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

2. 定帶時間條件之殘差區塊：

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

3. 以編碼、瓶頸與解碼組成 U-Net：

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

4. 驗架構接受目標解析度之輸入：

```python
model = UNet(in_channels=3, base_channels=64)
x_test = torch.randn(2, 3, 64, 64)
t_test = torch.randint(0, 1000, (2,))
out = model(x_test, t_test)
assert out.shape == x_test.shape, f"Output shape {out.shape} != input shape {x_test.shape}"
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
```

**預期：** 模型輸出與輸入同形之張量（預測匹配維度之噪）。參數數應比於解析度：64x64 約三千萬至六千萬、256x256 約一至三億。

**失敗時：** 形不配常示下/上採樣比不正。驗每編碼階半空間維度、每解碼階倍之。GroupNorm 需通道數可除於組數。

### 步驟三：實訓練迴圈

訓去噪器以預測每時步所加之噪。

1. 設訓練目標（簡化 DDPM 損失）：

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

2. 配優化器與學習率計畫：

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100000)
```

3. 執訓練迴圈附日誌：

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

4. 定期存檢查點：

```python
    if (epoch + 1) % 10 == 0:
        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "loss": avg_loss
        }, f"checkpoint_epoch_{epoch+1}.pt")
```

**預期：** 損失隨訓練穩降。資料歸一化於 [-1, 1]，初始損失應近 1.0（預測隨機噪）。收斂後，損失應於 0.01-0.10 範圍依資料複雜度。

**失敗時：** 若損失早平（> 0.5），核：(a) 資料歸一化（須 [-1, 1] 或 [0, 1] 配最終激活），(b) 學習率（試 3e-4 或 5e-5），(c) 梯度截斷（1.0 為標準）。若損失為 NaN，降學習率並核計畫中除零。

### 步驟四：實採樣（反向過程）

自純高斯噪疊去噪以生新樣本。

1. 實標準 DDPM 採樣迴圈：

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

2. 生並視覺化樣本：

```python
samples = ddpm_sample(model, schedule, shape=(16, 3, 64, 64), device=device)
samples = (samples.clamp(-1, 1) + 1) / 2  # rescale to [0, 1]
```

**預期：** 生樣本現可辨結構（非純噪或均勻色）。64x64 解析度於十萬以上訓練步後，輸出視覺應似訓練分布。

**失敗時：** 若樣本模糊，訓更久或增模型容量。若樣本噪雜，反向過程或有錯——驗計畫索引配訓練。若所有樣本似同，核模式崩潰（試不同隨機種）。

### 步驟五：加採樣加速

以 DDIM 或 DPM-Solver 減採樣步數。

1. 實 DDIM 採樣（確定性、較少步）：

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

2. 較跨步數之樣本品質：

```python
for n_steps in [10, 25, 50, 100, 250]:
    samples = ddim_sample(model, schedule, shape=(16, 3, 64, 64), device=device, num_steps=n_steps)
    print(f"DDIM {n_steps} steps: generated {samples.shape[0]} samples")
    # Save grid for visual comparison
```

3. 基準採樣速度：

```python
import time

for method, n_steps in [("DDPM", 1000), ("DDIM-50", 50), ("DDIM-25", 25)]:
    start = time.time()
    _ = ddim_sample(model, schedule, (1, 3, 64, 64), device, num_steps=n_steps if "DDIM" in method else 1000)
    elapsed = time.time() - start
    print(f"{method}: {elapsed:.2f}s per sample")
```

**預期：** DDIM 五十步生視覺上可比於 DDPM 一千步之樣本，速二十倍改善。品質於約二十至二十五步和緩降。

**失敗時：** 若同步數下 DDIM 樣本劣於 DDPM，驗 alpha 索引。DDIM 直用 `alphas_cumprod`，非 `alphas`。若低步數之樣本極噪，先試 eta=0.0（全確定性）。

### 步驟六：評樣本品質

以標準指標量生品質。

1. 算 FID（Frechet Inception Distance）：

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

2. 評樣本多樣性（核模式崩潰）：

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

3. 記結果：

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

**預期：** 標準基準（CIFAR-10、CelebA）上訓練良好之模型 FID 低於五十。LPIPS 多樣性高於 0.4 示無模式崩潰。SOTA 模型於 CIFAR-10 達 FID 2-10。

**失敗時：** 高 FID（>100）示訓練問題或訓不足。低多樣性（LPIPS < 0.2）示模式崩潰——增模型容量、核資料增強或訓更久。於至少一萬樣本上算 FID 以得穩定估計。

## 驗證

- [ ] 前向過程於 t=T 產純噪（視覺核與數值：均值近 0、標準差近 1）
- [ ] U-Net 輸出形於所有目標解析度下配輸入形
- [ ] 訓練損失於首千步單調降
- [ ] DDPM 採樣於充分訓練後產可辨輸出
- [ ] DDIM 五十步產可比於 DDPM 一千步之品質
- [ ] 目標資料集上 FID 分低於五十（依領域調閾）
- [ ] 樣本多樣性（LPIPS）確無模式崩潰
- [ ] 檢查點已存且可無錯載

## 常見陷阱

- **資料歸一化錯**：DDPM 假設資料於 [-1, 1]。若影像於 [0, 255]，損失將極大且訓練發散。訓前歸一化、採樣後反歸一化。
- **計畫索引差一**：前向過程用 `alphas_cumprod[t]` 為 t 步之噪樣本。採樣中差一錯（用 t+1 或 t-1）產視覺降級之樣本。
- **忘梯度截斷**：無 `clip_grad_norm_(1.0)`，大模型訓練不穩。早期尤關鍵。
- **DDIM 採樣步過少**：二十步以下 DDIM 品質速降。至少二十五步以得可接受結果；五十步以得近 DDPM 品質。
- **FID 於樣本過少上評**：FID 估計於小樣本量有偏。用至少一萬生影像與一萬真影像以得穩定 FID 計算。
- **忽視 EMA**：模型權重之指數移動平均顯著改樣本品質。用 0.9999 之衰減率並自 EMA 模型採樣，非訓練模型。

## 相關技能

- `analyze-diffusion-dynamics` - DDPM 離散化之擴散 SDE 之數學基
- `fit-drift-diffusion-model` - 擴散過程於認知建模之不同應用
- `setup-gpu-training` - 為擴散模型訓練配 GPU 環境
- `containerize-application` - 於 Docker 中封裝擴散推理流水
