---
name: implement-diffusion-network
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

Build a denoising diffusion probabilistic model (DDPM) or score-based generative model from scratch, including the forward noising process, U-Net denoiser, training objective, reverse sampling procedure, and accelerated inference via DDIM or DPM-Solver.

## When to Use

- Building a generative model for image, audio, or molecular synthesis
- Implementing DDPM or score-based diffusion from a research paper
- Adding a custom noise schedule or conditioning mechanism to a diffusion pipeline
- Replacing a GAN-based generator with a diffusion-based alternative
- Prototyping a diffusion model before scaling to production with frameworks like diffusers

## Inputs

- **Required**: Training dataset (images, spectrograms, point clouds, or other continuous data)
- **Required**: Target resolution and number of channels
- **Required**: Compute budget (GPU type and count, training time limit)
- **Optional**: Noise schedule type (default: cosine)
- **Optional**: Number of diffusion timesteps T (default: 1000)
- **Optional**: Conditioning signal (class labels, text embeddings, or other guidance)
- **Optional**: Sampling acceleration method (default: DDIM with 50 steps)

## Procedure

### Step 1: Define the Forward Process (Noise Schedule)

Configure the variance schedule that controls how data is progressively noised.

1. Define the beta schedule (linear, cosine, or learned):

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

2. Pre-compute the derived quantities used during training and sampling:

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

3. Implement the forward noising function (q-sample):

```python
    def q_sample(self, x_0, t, noise=None):
        """Add noise to x_0 at timestep t: q(x_t | x_0)."""
        if noise is None:
            noise = torch.randn_like(x_0)
        sqrt_alpha = self.sqrt_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t].reshape(-1, 1, 1, 1)
        return sqrt_alpha * x_0 + sqrt_one_minus_alpha * noise
```

4. Verify the schedule visually:

```python
schedule = DiffusionSchedule(cosine_beta_schedule(1000))
print(f"alpha_cumprod at t=0:   {schedule.alphas_cumprod[0]:.4f}")    # ~1.0 (clean)
print(f"alpha_cumprod at t=500: {schedule.alphas_cumprod[500]:.4f}")   # ~0.5 (half noise)
print(f"alpha_cumprod at t=999: {schedule.alphas_cumprod[999]:.4f}")   # ~0.0 (pure noise)
```

**Expected:** `alphas_cumprod` decreases monotonically from near 1.0 to near 0.0. The cosine schedule should decrease more gradually than linear in the middle timesteps.

**On failure:** If `alphas_cumprod` does not reach near zero at t=T, the model will not learn to generate from pure noise. Increase T or adjust the schedule. If values go negative, check the clipping bounds on betas.

### Step 2: Design the Denoising Network Architecture

Build a U-Net with time conditioning that predicts noise given a noisy input.

1. Define the time embedding module:

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

2. Define a residual block with time conditioning:

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

3. Assemble the U-Net with encoder, bottleneck, and decoder:

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

4. Verify the architecture accepts inputs of the target resolution:

```python
model = UNet(in_channels=3, base_channels=64)
x_test = torch.randn(2, 3, 64, 64)
t_test = torch.randint(0, 1000, (2,))
out = model(x_test, t_test)
assert out.shape == x_test.shape, f"Output shape {out.shape} != input shape {x_test.shape}"
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
```

**Expected:** The model outputs a tensor with the same shape as the input (predicting noise of matching dimensions). Parameter count should be proportional to resolution: approximately 30-60M for 64x64, 100-300M for 256x256.

**On failure:** Shape mismatches usually indicate incorrect downsampling/upsampling ratios. Verify that each encoder stage halves spatial dimensions and each decoder stage doubles them. GroupNorm requires channels to be divisible by the group count.

### Step 3: Implement the Training Loop

Train the denoiser to predict the noise added at each timestep.

1. Set up the training objective (simplified DDPM loss):

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

2. Configure the optimizer and learning rate schedule:

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100000)
```

3. Run the training loop with logging:

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

4. Save checkpoints periodically:

```python
    if (epoch + 1) % 10 == 0:
        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "loss": avg_loss
        }, f"checkpoint_epoch_{epoch+1}.pt")
```

**Expected:** Loss decreases steadily over training. For image data normalized to [-1, 1], initial loss should be near 1.0 (predicting random noise). After convergence, loss should be in the range 0.01-0.10 depending on data complexity.

**On failure:** If loss plateaus early (> 0.5), check: (a) data normalization (must be [-1, 1] or [0, 1] with matching final activation), (b) learning rate (try 3e-4 or 5e-5), (c) gradient clipping (1.0 is standard). If loss is NaN, reduce learning rate and check for division by zero in the schedule.

### Step 4: Implement Sampling (Reverse Process)

Generate new samples by iteratively denoising from pure Gaussian noise.

1. Implement the standard DDPM sampling loop:

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

2. Generate and visualize samples:

```python
samples = ddpm_sample(model, schedule, shape=(16, 3, 64, 64), device=device)
samples = (samples.clamp(-1, 1) + 1) / 2  # rescale to [0, 1]
```

**Expected:** Generated samples show recognizable structure (not pure noise or uniform color). At 64x64 resolution with 100K+ training steps, outputs should visually resemble the training distribution.

**On failure:** If samples are blurry, train longer or increase model capacity. If samples are noisy, the reverse process may have a bug -- verify that the schedule indexing matches training. If all samples look identical, check for mode collapse (try different random seeds).

### Step 5: Add Sampling Acceleration

Reduce the number of sampling steps using DDIM or DPM-Solver.

1. Implement DDIM sampling (deterministic, fewer steps):

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

2. Compare sample quality across step counts:

```python
for n_steps in [10, 25, 50, 100, 250]:
    samples = ddim_sample(model, schedule, shape=(16, 3, 64, 64), device=device, num_steps=n_steps)
    print(f"DDIM {n_steps} steps: generated {samples.shape[0]} samples")
    # Save grid for visual comparison
```

3. Benchmark sampling speed:

```python
import time

for method, n_steps in [("DDPM", 1000), ("DDIM-50", 50), ("DDIM-25", 25)]:
    start = time.time()
    _ = ddim_sample(model, schedule, (1, 3, 64, 64), device, num_steps=n_steps if "DDIM" in method else 1000)
    elapsed = time.time() - start
    print(f"{method}: {elapsed:.2f}s per sample")
```

**Expected:** DDIM with 50 steps produces samples visually comparable to DDPM with 1000 steps at 20x speed improvement. Quality degrades gracefully down to approximately 20-25 steps.

**On failure:** If DDIM samples are worse than DDPM at the same step count, verify the alpha indexing. DDIM uses `alphas_cumprod` directly, not `alphas`. If samples at low step counts are very noisy, try eta=0.0 (fully deterministic) first.

### Step 6: Evaluate Sample Quality

Quantify generation quality using standard metrics.

1. Compute FID (Frechet Inception Distance):

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

2. Assess sample diversity (check for mode collapse):

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

3. Log results:

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

**Expected:** FID below 50 for a well-trained model on standard benchmarks (CIFAR-10, CelebA). LPIPS diversity above 0.4 indicates no mode collapse. State-of-the-art models achieve FID 2-10 on CIFAR-10.

**On failure:** High FID (>100) indicates training issues or insufficient epochs. Low diversity (LPIPS < 0.2) suggests mode collapse -- increase model capacity, check data augmentation, or train longer. Compute FID on at least 10K samples for stable estimates.

## Validation

- [ ] Forward process produces pure noise at t=T (visual check and numeric: mean near 0, std near 1)
- [ ] U-Net output shape matches input shape for all target resolutions
- [ ] Training loss decreases monotonically over the first 1000 steps
- [ ] DDPM sampling produces recognizable outputs after sufficient training
- [ ] DDIM with 50 steps produces quality comparable to DDPM with 1000 steps
- [ ] FID score is below 50 on the target dataset (adjust threshold for domain)
- [ ] Sample diversity (LPIPS) confirms no mode collapse
- [ ] Checkpoints are saved and loadable without errors

## Common Pitfalls

- **Wrong data normalization**: DDPM assumes data in [-1, 1]. If your images are in [0, 255], the loss will be enormous and training will diverge. Normalize before training and denormalize after sampling.
- **Schedule indexing off by one**: The forward process uses `alphas_cumprod[t]` for the noised sample at step t. Off-by-one errors in sampling (using t+1 or t-1) produce visibly degraded samples.
- **Forgetting gradient clipping**: Without `clip_grad_norm_(1.0)`, training is unstable for large models. This is especially critical in the early epochs.
- **Too few sampling steps for DDIM**: Below 20 steps, DDIM quality degrades rapidly. Use at least 25 steps for acceptable results; 50 steps for near-DDPM quality.
- **Evaluating FID on too few samples**: FID estimates are biased with small sample sizes. Use at least 10,000 generated images and 10,000 real images for stable FID computation.
- **Ignoring EMA**: Exponential moving average of model weights significantly improves sample quality. Use a decay rate of 0.9999 and sample from the EMA model, not the training model.

## Related Skills

- `analyze-diffusion-dynamics` - mathematical foundations of the diffusion SDE that DDPM discretizes
- `fit-drift-diffusion-model` - a different application of diffusion processes to cognitive modeling
- `setup-gpu-training` - configuring GPU environments for diffusion model training
- `containerize-application` - packaging diffusion inference pipelines in Docker
