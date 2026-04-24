---
name: implement-diffusion-network
locale: wenyan-ultra
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

# 實擴散網

從頭建去噪擴散概率模（DDPM）或分數生成模，含正向加噪、U-Net 去噪器、訓目標、反向採樣、經 DDIM 或 DPM-Solver 加速推理。

## 用

- 建像、音、分子之生成模
- 由論文實 DDPM 或分數擴散
- 加自定噪表或條件機於擴散管線
- 以擴散替 GAN 生成器
- 擴散模原型，後以 diffusers 等生產框擴

## 入

- **必**：訓數據集（像、譜圖、點雲或他續數據）
- **必**：目標分辨率與通道數
- **必**：算預算（GPU 型數、訓時限）
- **可**：噪表型（默 cosine）
- **可**：擴散時步 T（默 1000）
- **可**：條件信號（類標、文嵌或他導）
- **可**：採樣加速法（默 DDIM 50 步）

## 行

### 一：定正向程（噪表）

配控數據漸噪之變量表。

1. 定 beta 表（線、cosine 或學）：

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

2. 預算訓與採用之衍量：

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

3. 實正向加噪函（q-sample）：

```python
    def q_sample(self, x_0, t, noise=None):
        """Add noise to x_0 at timestep t: q(x_t | x_0)."""
        if noise is None:
            noise = torch.randn_like(x_0)
        sqrt_alpha = self.sqrt_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        return sqrt_alpha * x_0 + sqrt_one_minus_alpha * noise
```

4. 視察表：

```python
schedule = DiffusionSchedule(cosine_beta_schedule(1000))
print(f"alpha_cumprod at t=0:   {schedule.alphas_cumprod[0]:.4f}")    # ~1.0 (clean)
print(f"alpha_cumprod at t=500: {schedule.alphas_cumprod[500]:.4f}")   # ~0.5 (half noise)
print(f"alpha_cumprod at t=999: {schedule.alphas_cumprod[999]:.4f}")   # ~0.0 (pure noise)
```

得：`alphas_cumprod` 由近 1.0 單降至近 0.0。cosine 表於中時步較線性更緩降。

敗：`alphas_cumprod` 於 t=T 未至近零→模不能由純噪生。增 T 或調表。若為負→察 betas 之剪邊。

### 二：設去噪網架構

建具時條件之 U-Net，於噪入予下預噪。

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

2. 定具時條件之殘差塊：

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

3. 組 U-Net 含編、瓶、解三部：

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

4. 驗架構接目標分辨率之入：

```python
model = UNet(in_channels=3, base_channels=64)
x_test = torch.randn(2, 3, 64, 64)
t_test = torch.randint(0, 1000, (2,))
out = model(x_test, t_test)
assert out.shape == x_test.shape, f"Output shape {out.shape} != input shape {x_test.shape}"
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
```

得：模出與入同形（預相符維之噪）。參數數應與分辨率成比：64x64 約 30-60M，256x256 約 100-300M。

敗：形失配常示下/上採樣比誤。驗各編階半空維，各解階雙。GroupNorm 需通道為群數之倍。

### 三：實訓迴

訓去噪器於各時步預所加噪。

1. 立訓目標（簡 DDPM 損）：

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

2. 配優化器與學率表：

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100000)
```

3. 行訓迴並記：

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

4. 定期存檢點：

```python
    if (epoch + 1) % 10 == 0:
        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "loss": avg_loss
        }, f"checkpoint_epoch_{epoch+1}.pt")
```

得：損隨訓穩降。像數據規一化至 [-1, 1] 時，初損應近 1.0（預隨噪）。收斂後損依數據複雜性於 0.01-0.10 範。

敗：損早平（>0.5）→察：(a) 數據規一化（必 [-1, 1] 或 [0, 1] 配合末激活）；(b) 學率（試 3e-4 或 5e-5）；(c) 梯剪（1.0 標準）。損為 NaN→減學率並察表中除以零。

### 四：實採樣（反向程）

由純高斯噪迭代去噪以生新樣。

1. 實標 DDPM 採樣迴：

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

2. 生並視樣：

```python
samples = ddpm_sample(model, schedule, shape=(16, 3, 64, 64), device=device)
samples = (samples.clamp(-1, 1) + 1) / 2  # rescale to [0, 1]
```

得：生樣示可識構（非純噪或均色）。64x64 分辨率 100K+ 訓步後，出應視似訓分佈。

敗：樣模糊→訓久或增容量。樣噪→反向程或有蟲；驗表索引合訓。諸樣皆同→察模崩（試異隨種）。

### 五：加採樣加速

用 DDIM 或 DPM-Solver 減採樣步數。

1. 實 DDIM 採樣（確定、少步）：

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

2. 比諸步數之樣品質：

```python
for n_steps in [10, 25, 50, 100, 250]:
    samples = ddim_sample(model, schedule, shape=(16, 3, 64, 64), device=device, num_steps=n_steps)
    print(f"DDIM {n_steps} steps: generated {samples.shape[0]} samples")
    # Save grid for visual comparison
```

3. 測採樣速：

```python
import time

for method, n_steps in [("DDPM", 1000), ("DDIM-50", 50), ("DDIM-25", 25)]:
    start = time.time()
    _ = ddim_sample(model, schedule, (1, 3, 64, 64), device, num_steps=n_steps if "DDIM" in method else 1000)
    elapsed = time.time() - start
    print(f"{method}: {elapsed:.2f}s per sample")
```

得：DDIM 50 步生視似 DDPM 1000 步之樣，速 20 倍。質降至約 20-25 步仍緩。

敗：同步數下 DDIM 劣於 DDPM→驗 alpha 索引。DDIM 直用 `alphas_cumprod`，非 `alphas`。低步數樣極噪→先試 eta=0.0（全確定）。

### 六：評樣品質

用標準指量生成質。

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

2. 評樣多樣（察模崩）：

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

3. 記果：

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

得：標基（CIFAR-10、CelebA）訓佳模 FID 於 50 下。LPIPS 多樣 >0.4 示無模崩。前沿模 CIFAR-10 得 FID 2-10。

敗：FID 高（>100）→訓誤或紀元不足。多樣低（LPIPS <0.2）→模崩；增容量、察數據增強或訓久。FID 至少 10K 樣方穩估。

## 驗

- [ ] 正向程於 t=T 生純噪（視察加數：均近 0、標差近 1）
- [ ] U-Net 出形諸目標分辨率皆符入形
- [ ] 訓損首 1000 步單降
- [ ] DDPM 採樣於充訓後生可識出
- [ ] DDIM 50 步生質比 DDPM 1000 步
- [ ] 目標數據集 FID 於 50 下（依域調閾）
- [ ] 樣多樣（LPIPS）確無模崩
- [ ] 檢點已存且可載無誤

## 忌

- **數據規一化誤**：DDPM 假數據於 [-1, 1]。若像於 [0, 255]→損大訓散。訓前規一化，採後反規
- **表索引差一**：正向程 t 步噪樣用 `alphas_cumprod[t]`。採樣中差一誤（用 t+1 或 t-1）→樣顯劣
- **忘梯剪**：無 `clip_grad_norm_(1.0)` 大模訓不穩。首紀元尤重
- **DDIM 過少步**：20 步下 DDIM 質速降。至少 25 步方可；50 步近 DDPM 質
- **FID 樣少**：FID 於小樣有偏。用至少 10K 生像與 10K 真像方穩
- **略 EMA**：模權之指數移均顯提升樣質。用衰 0.9999 並自 EMA 模採，非自訓模

## 參

- `analyze-diffusion-dynamics`
- `fit-drift-diffusion-model`
- `setup-gpu-training`
- `containerize-application`
