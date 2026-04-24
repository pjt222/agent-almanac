---
name: implement-diffusion-network
locale: caveman-ultra
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

# Implement a Diffusion Network

Build DDPM / score-based model from scratch: forward noising + U-Net denoiser + training objective + reverse sampling + DDIM/DPM-Solver acceleration.

## Use When

- Generative model (image, audio, molecular synthesis)
- DDPM / score-based from paper
- Custom noise schedule / conditioning
- Replace GAN generator w/ diffusion
- Prototype pre-scale w/ diffusers

## In

- **Required**: training dataset (images, spectrograms, point clouds, continuous)
- **Required**: target resolution + channels
- **Required**: compute budget (GPU type + count + time)
- **Optional**: noise schedule (default cosine)
- **Optional**: diffusion timesteps T (default 1000)
- **Optional**: conditioning signal (class, text embed, guidance)
- **Optional**: sampling acceleration (default DDIM 50)

## Do

### Step 1: Forward process (noise schedule)

1. Beta schedule (linear, cosine, learned):

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

2. Pre-compute derived quantities:

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

3. Forward noising (q-sample):

```python
    def q_sample(self, x_0, t, noise=None):
        """Add noise to x_0 at timestep t: q(x_t | x_0)."""
        if noise is None:
            noise = torch.randn_like(x_0)
        sqrt_alpha = self.sqrt_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        return sqrt_alpha * x_0 + sqrt_one_minus_alpha * noise
```

4. Verify visually:

```python
schedule = DiffusionSchedule(cosine_beta_schedule(1000))
print(f"alpha_cumprod at t=0:   {schedule.alphas_cumprod[0]:.4f}")    # ~1.0 (clean)
print(f"alpha_cumprod at t=500: {schedule.alphas_cumprod[500]:.4f}")   # ~0.5 (half noise)
print(f"alpha_cumprod at t=999: {schedule.alphas_cumprod[999]:.4f}")   # ~0.0 (pure noise)
```

→ `alphas_cumprod` monotonic decrease ~1.0 → ~0.0. Cosine more gradual than linear in middle.

**If err:** no near-zero at t=T → model won't learn from pure noise. Increase T or adjust schedule. Negative values → check beta clipping.

### Step 2: Denoising network (U-Net w/ time conditioning)

1. Time embedding:

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

2. Residual block w/ time conditioning:

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

3. U-Net w/ encoder + bottleneck + decoder:

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

4. Verify target resolution:

```python
model = UNet(in_channels=3, base_channels=64)
x_test = torch.randn(2, 3, 64, 64)
t_test = torch.randint(0, 1000, (2,))
out = model(x_test, t_test)
assert out.shape == x_test.shape, f"Output shape {out.shape} != input shape {x_test.shape}"
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
```

→ Output shape matches input. Param count: ~30-60M for 64×64, 100-300M for 256×256.

**If err:** shape mismatch → incorrect down/up sample ratios. Each encoder halves, decoder doubles. GroupNorm channels divisible by group count.

### Step 3: Training loop

1. Simplified DDPM loss:

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

2. Optimizer + LR schedule:

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100000)
```

3. Training loop w/ logging:

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

4. Periodic checkpoints:

```python
    if (epoch + 1) % 10 == 0:
        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "loss": avg_loss
        }, f"checkpoint_epoch_{epoch+1}.pt")
```

→ Loss decreases monotonically. Images [-1,1] → initial ~1.0 (random noise pred). Converged → 0.01-0.10 depending on complexity.

**If err:** plateau early (>0.5) → (a) normalization must be [-1,1] or [0,1] w/ matching activation, (b) LR try 3e-4 or 5e-5, (c) grad clip 1.0. NaN → reduce LR, check schedule division by zero.

### Step 4: Sampling (reverse process)

1. Standard DDPM sampling:

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

2. Generate + visualize:

```python
samples = ddpm_sample(model, schedule, shape=(16, 3, 64, 64), device=device)
samples = (samples.clamp(-1, 1) + 1) / 2  # rescale to [0, 1]
```

→ Samples show recognizable structure. 64×64 + 100K+ steps → visually resembles training dist.

**If err:** blurry → train longer / increase capacity. Noisy → reverse bug; verify schedule indexing matches training. Identical samples → mode collapse; try diff seeds.

### Step 5: Sampling acceleration (DDIM / DPM-Solver)

1. DDIM sampling (deterministic, fewer steps):

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

2. Compare across step counts:

```python
for n_steps in [10, 25, 50, 100, 250]:
    samples = ddim_sample(model, schedule, shape=(16, 3, 64, 64), device=device, num_steps=n_steps)
    print(f"DDIM {n_steps} steps: generated {samples.shape[0]} samples")
    # Save grid for visual comparison
```

3. Benchmark speed:

```python
import time

for method, n_steps in [("DDPM", 1000), ("DDIM-50", 50), ("DDIM-25", 25)]:
    start = time.time()
    _ = ddim_sample(model, schedule, (1, 3, 64, 64), device, num_steps=n_steps if "DDIM" in method else 1000)
    elapsed = time.time() - start
    print(f"{method}: {elapsed:.2f}s per sample")
```

→ DDIM 50 ≈ DDPM 1000 quality at 20× speed. Degrades gracefully down to ~20-25 steps.

**If err:** DDIM worse than DDPM at same count → verify alpha indexing. DDIM uses `alphas_cumprod` directly, not `alphas`. Low-step noisy → try eta=0.0 (deterministic) first.

### Step 6: Evaluate quality

1. FID:

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

2. Diversity (mode collapse check):

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

3. Log:

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

→ FID <50 well-trained on std benchmarks (CIFAR-10, CelebA). LPIPS >0.4 = no mode collapse. SOTA: FID 2-10 on CIFAR-10.

**If err:** FID >100 → training issues or insufficient epochs. LPIPS <0.2 → mode collapse. Increase capacity / check augmentation / train longer. FID on ≥10K samples for stable estimates.

## Check

- [ ] Forward → pure noise at t=T (mean ~0, std ~1)
- [ ] U-Net output shape = input shape
- [ ] Training loss monotonic first 1000 steps
- [ ] DDPM sampling → recognizable output
- [ ] DDIM 50 ≈ DDPM 1000 quality
- [ ] FID <50 on target dataset
- [ ] LPIPS confirms no mode collapse
- [ ] Checkpoints saved + loadable

## Traps

- **Wrong normalization**: DDPM assumes [-1,1]. [0,255] → huge loss + divergence. Normalize in + de-normalize out.
- **Schedule indexing off-by-one**: forward uses `alphas_cumprod[t]` for step t. Off-by-one in sampling → visibly degraded.
- **Forget grad clipping**: no `clip_grad_norm_(1.0)` → unstable large models. Critical early epochs.
- **DDIM too few steps**: <20 quality degrades rapidly. ≥25 acceptable, 50 near-DDPM.
- **FID too few samples**: biased estimates. ≥10K gen + 10K real for stable.
- **Ignore EMA**: EMA weights significantly improve quality. Decay 0.9999, sample from EMA not training model.

## →

- `analyze-diffusion-dynamics` — math foundations (SDE DDPM discretizes)
- `fit-drift-diffusion-model` — diffusion for cognitive modeling
- `setup-gpu-training` — GPU envs for training
- `containerize-application` — package inference pipelines in Docker
