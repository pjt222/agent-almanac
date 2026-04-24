---
name: implement-diffusion-network
locale: wenyan
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

# 擴散網絡之實

自零建去噪擴散概率模型（DDPM）或分數生成模型，含前向加噪過程、U-Net 去噪器、訓練目標、逆向採樣過程、以 DDIM 或 DPM-Solver 加速推斷。

## 用時

- 為影像、音、分子合成建生成模型
- 自研究論文實 DDPM 或分數擴散
- 為擴散管線加自訂噪程或條件機制
- 以擴散代 GAN 生成器
- 規模化於 diffusers 等框架前原型擴散模

## 入

- **必要**：訓資料集（影、譜、點雲或他連續資料）
- **必要**：目標解析度與通道數
- **必要**：算預算（GPU 型與數、訓時限）
- **可選**：噪程類（默：余弦）
- **可選**：擴散時步數 T（默：1000）
- **可選**：條件信號（類標、文嵌、或他引導）
- **可選**：採樣加速法（默：DDIM 五十步）

## 法

### 第一步：定前向過程（噪程）

配控資料漸噪之變異程。

1. 定 beta 程（線、余弦、或學）：

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

2. 預算訓與採樣所用之派生量：

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

3. 實前向加噪函（q-sample）：

```python
    def q_sample(self, x_0, t, noise=None):
        """Add noise to x_0 at timestep t: q(x_t | x_0)."""
        if noise is None:
            noise = torch.randn_like(x_0)
        sqrt_alpha = self.sqrt_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        return sqrt_alpha * x_0 + sqrt_one_minus_alpha * noise
```

4. 目視驗程：

```python
schedule = DiffusionSchedule(cosine_beta_schedule(1000))
print(f"alpha_cumprod at t=0:   {schedule.alphas_cumprod[0]:.4f}")    # ~1.0 (clean)
print(f"alpha_cumprod at t=500: {schedule.alphas_cumprod[500]:.4f}")   # ~0.5 (half noise)
print(f"alpha_cumprod at t=999: {schedule.alphas_cumprod[999]:.4f}")   # ~0.0 (pure noise)
```

**得：** `alphas_cumprod` 自近 1.0 單調降至近 0.0。余弦程於中段時步比線性降較緩。

**敗則：** 若 `alphas_cumprod` 於 t=T 未達近零，模型不能學自純噪生成。增 T 或調程。若值為負，察 betas 裁限。

### 第二步：設去噪網絡結構

建時條件之 U-Net，於噪入預噪。

1. 定時嵌模：

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

2. 定帶時條件之殘差塊：

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

3. 以編碼、瓶頸、解碼組 U-Net：

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

4. 驗結構受目標解析度之入：

```python
model = UNet(in_channels=3, base_channels=64)
x_test = torch.randn(2, 3, 64, 64)
t_test = torch.randint(0, 1000, (2,))
out = model(x_test, t_test)
assert out.shape == x_test.shape, f"Output shape {out.shape} != input shape {x_test.shape}"
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
```

**得：** 模輸出同入形狀之張量（預配維噪）。參數數應比例於解析度：64x64 約 30-60M，256x256 約 100-300M。

**敗則：** 形不配常示下採/上採比例誤。驗每編碼階減半空間維，每解碼階倍之。GroupNorm 需通道可除以組數。

### 第三步：實訓練迴圈

訓去噪器預每時步所加之噪。

1. 設訓目標（簡化 DDPM 損）：

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

2. 配優化器與學率程：

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100000)
```

3. 行訓迴圈附日志：

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

4. 週期存檢查點：

```python
    if (epoch + 1) % 10 == 0:
        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "loss": avg_loss
        }, f"checkpoint_epoch_{epoch+1}.pt")
```

**得：** 損於訓中穩降。資料歸一 [-1, 1] 者，初損近 1.0（預隨機噪）。收斂後損依資料複雜於 0.01-0.10。

**敗則：** 若損早平（> 0.5），察：(a) 資料歸一（必 [-1, 1] 或 [0, 1] 配末激活），(b) 學率（試 3e-4 或 5e-5），(c) 梯度裁（1.0 為標）。若損 NaN，減學率並察程中除零。

### 第四步：實採樣（逆向過程）

自純高斯噪迭代去噪以生新樣。

1. 實標 DDPM 採樣迴圈：

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

2. 生並可視化樣：

```python
samples = ddpm_sample(model, schedule, shape=(16, 3, 64, 64), device=device)
samples = (samples.clamp(-1, 1) + 1) / 2  # rescale to [0, 1]
```

**得：** 生樣顯可識結構（非純噪或均色）。64x64 解析度十萬步以上訓者，出應視似訓分佈。

**敗則：** 若樣糊，訓更長或增模容。若樣噪，逆過程或有錯——驗程索引合訓。若所有樣似同，察模式崩（試異種子）。

### 第五步：加採樣加速

以 DDIM 或 DPM-Solver 減採樣步。

1. 實 DDIM 採樣（確定性，少步）：

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

2. 跨步數比樣質：

```python
for n_steps in [10, 25, 50, 100, 250]:
    samples = ddim_sample(model, schedule, shape=(16, 3, 64, 64), device=device, num_steps=n_steps)
    print(f"DDIM {n_steps} steps: generated {samples.shape[0]} samples")
    # Save grid for visual comparison
```

3. 基準採樣速：

```python
import time

for method, n_steps in [("DDPM", 1000), ("DDIM-50", 50), ("DDIM-25", 25)]:
    start = time.time()
    _ = ddim_sample(model, schedule, (1, 3, 64, 64), device, num_steps=n_steps if "DDIM" in method else 1000)
    elapsed = time.time() - start
    print(f"{method}: {elapsed:.2f}s per sample")
```

**得：** DDIM 五十步生樣視可比 DDPM 千步，速快二十倍。質於二十至二十五步下優雅降。

**敗則：** 若同步數下 DDIM 樣劣於 DDPM，驗 alpha 索引。DDIM 直用 `alphas_cumprod`，非 `alphas`。若低步數樣甚噪，先試 eta=0.0（全確定）。

### 第六步：評樣質

以標指標量生質。

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

2. 察樣多樣（察模式崩）：

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

**得：** 良訓模於標基準（CIFAR-10、CelebA）FID 低於 50。LPIPS 多樣高於 0.4 示無模式崩。頂尖模型於 CIFAR-10 達 FID 2-10。

**敗則：** 高 FID（>100）示訓問題或週期不足。低多樣（LPIPS < 0.2）示模式崩——增模容、察資料擴增、或延訓。FID 至少算一萬樣以得穩估。

## 驗

- [ ] 前向過程於 t=T 生純噪（目察與數值：均近 0，標準差近 1）
- [ ] U-Net 輸出形狀合所有目標解析度之入
- [ ] 訓損於首千步單調降
- [ ] 足訓後 DDPM 採樣生可識輸出
- [ ] DDIM 五十步生質可比 DDPM 千步
- [ ] 目標資料集 FID 低於 50（依域調閾）
- [ ] 樣多樣（LPIPS）確無模式崩
- [ ] 檢查點存可無誤載

## 陷

- **資料歸一誤**：DDPM 設資料於 [-1, 1]。若影像於 [0, 255]，損將巨大且訓散。訓前歸一採樣後反歸一
- **程索引差一**：前向用 `alphas_cumprod[t]` 為 t 步之加噪樣。採樣差一誤（用 t+1 或 t-1）生可見劣樣
- **忘梯度裁**：無 `clip_grad_norm_(1.0)` 大模訓不穩。早週期尤要
- **DDIM 步過少**：二十步以下 DDIM 質速降。用至少二十五步得合質；五十步近 DDPM 質
- **FID 樣過少**：小樣數 FID 估有偏。算用至少萬生萬真方得穩
- **忽 EPI**：模型權重之指數移動均值顯提樣質。用衰率 0.9999 並自 EMA 模採，非訓模

## 參

- `analyze-diffusion-dynamics` — DDPM 離散化之擴散 SDE 數學基
- `fit-drift-diffusion-model` — 擴散過程於認知建模之他應用
- `setup-gpu-training` — 為擴散模訓配 GPU 環
- `containerize-application` — 以 Docker 包擴散推斷管線
