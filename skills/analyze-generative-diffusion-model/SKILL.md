---
name: analyze-generative-diffusion-model
description: >
  Analyze pre-trained generative diffusion models (Stable Diffusion, DALL-E,
  Flux) by computing quality metrics (FID, IS, CLIP score, precision/recall),
  inspecting noise schedules, extracting and visualizing attention maps, and
  probing latent spaces. Use when evaluating a pre-trained generative diffusion
  model's output quality, comparing noise schedule variants, analyzing
  cross-attention patterns for text-conditioned generation, interpolating
  between latent codes, or detecting out-of-distribution inputs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: advanced
  language: python
  tags: diffusion, generative-ai, evaluation, FID, attention, latent-space
---

# Analyze a Generative Diffusion Model

Evaluate pre-trained generative diffusion models through quantitative quality metrics, noise schedule inspection, cross-attention map analysis, and latent space probing to understand model behavior, diagnose failure modes, and guide fine-tuning decisions.

## When to Use

- Evaluating a pre-trained generative diffusion model's output quality with standard metrics
- Computing FID, IS, CLIP score, or precision/recall for generated image sets
- Inspecting and comparing noise schedules (linear, cosine, learned) via SNR curves
- Extracting cross-attention maps to understand text-to-image token-region correspondences
- Interpolating between latent codes or discovering semantic directions in the latent space
- Detecting out-of-distribution inputs for a diffusion model pipeline

## Inputs

- **Required**: Pre-trained model identifier or checkpoint path (e.g., `stabilityai/stable-diffusion-2-1`)
- **Required**: Analysis mode — one or more of: `metrics`, `schedule`, `attention`, `latent`
- **Required**: Reference dataset for metric computation (real images or dataset name)
- **Optional**: Text prompts for attention analysis (default: model-appropriate test prompts)
- **Optional**: Number of generated samples for metric computation (default: 10000)
- **Optional**: Device configuration (default: `cuda` if available, else `cpu`)

## Procedure

### Step 1: Quantitative Evaluation

Compute standard generative quality metrics against a reference dataset.

1. Set up the evaluation pipeline:

```python
import torch
from diffusers import StableDiffusionPipeline
from torchmetrics.image.fid import FrechetInceptionDistance
from torchmetrics.image.inception import InceptionScore

device = "cuda" if torch.cuda.is_available() else "cpu"
pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1", torch_dtype=torch.float16
).to(device)

fid = FrechetInceptionDistance(feature=2048, normalize=True).to(device)
inception = InceptionScore(normalize=True).to(device)
```

2. Feed real images into the metric accumulators:

```python
from torch.utils.data import DataLoader

for batch in DataLoader(real_dataset, batch_size=64):
    imgs = (batch * 255).byte().to(device)
    fid.update(imgs, real=True)
```

3. Generate samples and accumulate fake statistics:

```python
prompts = load_evaluation_prompts("prompts.txt")  # one prompt per line
n_generated = 0
while n_generated < 10000:
    prompt_batch = prompts[n_generated:n_generated + 8]
    images = pipe(prompt_batch, num_inference_steps=50).images
    tensors = torch.stack([to_tensor(img) for img in images]).to(device)
    byte_imgs = (tensors * 255).byte()
    fid.update(byte_imgs, real=False)
    inception.update(byte_imgs)
    n_generated += len(images)
```

4. Compute CLIP score for text-image alignment:

```python
from torchmetrics.multimodal.clip_score import CLIPScore

clip_metric = CLIPScore(model_name_or_path="openai/clip-vit-large-patch14").to(device)
for prompt, image_tensor in zip(sampled_prompts, sampled_tensors):
    clip_metric.update(image_tensor.unsqueeze(0), [prompt])

print(f"FID: {fid.compute():.2f}")
print(f"IS:  {inception.compute()[0]:.2f} +/- {inception.compute()[1]:.2f}")
print(f"CLIP: {clip_metric.compute():.2f}")
```

5. Compute precision and recall for mode coverage:

```python
from torchmetrics.image import FrechetInceptionDistance

# Precision: fraction of generated images near real manifold
# Recall: fraction of real images near generated manifold
# Use improved precision/recall (Kynkaanniemi et al., 2019) via
# feature embeddings from the Inception network
```

**Expected:** FID below 30 for a well-trained Stable Diffusion model on standard benchmarks. IS above 50 on ImageNet-class prompts. CLIP score above 25 for text-conditioned models. Precision and recall both above 0.6.

**On failure:** If FID is above 100, verify that real and generated images share the same resolution and normalization. If CLIP score is low but FID is acceptable, the model generates plausible images that do not match the text prompt -- check the text encoder. Ensure at least 10,000 samples for stable FID estimates.

### Step 2: Noise Schedule Inspection

Visualize and compare the forward and reverse noise schedules.

1. Extract schedule parameters from the model:

```python
scheduler = pipe.scheduler
betas = torch.tensor(scheduler.betas) if hasattr(scheduler, 'betas') else None
alphas_cumprod = torch.tensor(scheduler.alphas_cumprod)
timesteps = torch.arange(len(alphas_cumprod))
```

2. Compute the signal-to-noise ratio curve:

```python
import numpy as np
import matplotlib.pyplot as plt

snr = alphas_cumprod / (1 - alphas_cumprod)
log_snr = torch.log(snr)

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
axes[0].plot(timesteps.numpy(), alphas_cumprod.numpy())
axes[0].set_xlabel("Timestep"); axes[0].set_ylabel("alpha_cumprod")
axes[0].set_title("Cumulative Signal Retention")

axes[1].plot(timesteps.numpy(), log_snr.numpy())
axes[1].set_xlabel("Timestep"); axes[1].set_ylabel("log(SNR)")
axes[1].set_title("Log Signal-to-Noise Ratio")

if betas is not None:
    axes[2].plot(timesteps.numpy(), betas.numpy())
    axes[2].set_xlabel("Timestep"); axes[2].set_ylabel("beta")
    axes[2].set_title("Beta Schedule")
fig.tight_layout()
fig.savefig("noise_schedule.png", dpi=150)
```

3. Compare multiple schedule types:

```python
from diffusers import DDPMScheduler

schedules = {
    "linear": DDPMScheduler(beta_schedule="linear", num_train_timesteps=1000),
    "cosine": DDPMScheduler(beta_schedule="squaredcos_cap_v2", num_train_timesteps=1000),
}

fig, ax = plt.subplots(figsize=(10, 6))
for name, sched in schedules.items():
    ac = torch.tensor(sched.alphas_cumprod)
    snr = torch.log(ac / (1 - ac))
    ax.plot(snr.numpy(), label=name)
ax.set_xlabel("Timestep"); ax.set_ylabel("log(SNR)")
ax.set_title("Schedule Comparison"); ax.legend()
fig.savefig("schedule_comparison.png", dpi=150)
```

**Expected:** Cosine schedule shows a more gradual SNR decrease in mid-timesteps compared to linear. The log-SNR curve should span from approximately +10 (clean) to -10 (pure noise). Learned schedules should be monotonically decreasing.

**On failure:** If alphas_cumprod is not monotonically decreasing, the schedule is misconfigured. If values are constant, check that the scheduler was properly initialized with the model's config. For custom schedulers, verify that `set_timesteps()` has been called.

### Step 3: Attention Map Analysis

Extract and visualize cross-attention maps from text-conditioned models.

1. Register attention hooks on the U-Net cross-attention layers:

```python
attention_maps = {}

def hook_fn(name):
    def fn(module, input, output):
        # Cross-attention: Q from image, K/V from text
        if hasattr(module, 'processor'):
            attention_maps[name] = output.detach().cpu()
    return fn

for name, module in pipe.unet.named_modules():
    if 'attn2' in name and hasattr(module, 'processor'):
        module.register_forward_hook(hook_fn(name))
```

2. Run inference and collect attention at specific timesteps:

```python
prompt = "a red car parked next to a blue house"
timestep_attention = {}

# Custom callback to capture attention at specific timesteps
def callback_fn(pipe, step_index, timestep, callback_kwargs):
    if step_index in [5, 15, 30, 45]:
        timestep_attention[int(timestep)] = {
            k: v.clone() for k, v in attention_maps.items()
        }
    return callback_kwargs

output = pipe(prompt, num_inference_steps=50, callback_on_step_end=callback_fn)
```

3. Visualize token-region correspondences:

```python
tokenizer = pipe.tokenizer
tokens = tokenizer.encode(prompt)
token_strings = [tokenizer.decode([t]) for t in tokens]

# Select a mid-resolution attention layer
layer_key = [k for k in attention_maps if 'mid' in k or 'up.1' in k][0]
attn = attention_maps[layer_key]  # shape: (batch, heads, hw, seq_len)
attn_avg = attn.mean(dim=1)  # average across heads
res = int(attn_avg.shape[1] ** 0.5)
attn_map = attn_avg[0].reshape(res, res, -1)

fig, axes = plt.subplots(2, min(len(token_strings), 6), figsize=(18, 6))
for idx, token in enumerate(token_strings[:6]):
    for row, (ts, ts_attn) in enumerate(list(timestep_attention.items())[:2]):
        a = ts_attn[layer_key].mean(dim=1)[0]
        a_res = int(a.shape[0] ** 0.5)
        axes[row, idx].imshow(a[:, idx].reshape(a_res, a_res), cmap="hot")
        axes[row, idx].set_title(f"t={ts}: '{token}'")
        axes[row, idx].axis("off")
fig.suptitle("Cross-Attention Maps by Token and Timestep")
fig.tight_layout()
fig.savefig("attention_maps.png", dpi=150)
```

**Expected:** Content tokens ("car", "house") activate localized spatial regions. Style/color tokens ("red", "blue") activate regions overlapping with their associated object. Early timesteps (high noise) show diffuse attention; later timesteps show sharp, localized attention.

**On failure:** If all attention maps look uniform, the hook may be capturing self-attention instead of cross-attention -- verify the layer name contains `attn2` (cross) not `attn1` (self). If attention is captured but has wrong dimensions, check that the output tensor indexing matches the layer's head count and spatial resolution.

### Step 4: Latent Space Probing

Explore the structure of the latent space through interpolation and direction discovery.

1. Encode reference images into latent space:

```python
from diffusers import AutoencoderKL
from PIL import Image
import torchvision.transforms as T

vae = pipe.vae
transform = T.Compose([T.Resize(512), T.CenterCrop(512), T.ToTensor(),
                       T.Normalize([0.5], [0.5])])

def encode_image(image_path):
    img = transform(Image.open(image_path).convert("RGB")).unsqueeze(0).to(device)
    with torch.no_grad():
        latent = vae.encode(img.half()).latent_dist.sample() * vae.config.scaling_factor
    return latent

z1 = encode_image("image_a.png")
z2 = encode_image("image_b.png")
```

2. Perform spherical linear interpolation (slerp):

```python
def slerp(z1, z2, alpha):
    """Spherical linear interpolation between two latent codes."""
    z1_flat = z1.flatten()
    z2_flat = z2.flatten()
    omega = torch.acos(torch.clamp(
        torch.dot(z1_flat, z2_flat) / (z1_flat.norm() * z2_flat.norm()), -1, 1
    ))
    if omega.abs() < 1e-6:
        return (1 - alpha) * z1 + alpha * z2
    return (torch.sin((1 - alpha) * omega) * z1 + torch.sin(alpha * omega) * z2) / torch.sin(omega)

alphas = torch.linspace(0, 1, 8)
interpolated = [slerp(z1, z2, a.item()) for a in alphas]
decoded = []
for z in interpolated:
    with torch.no_grad():
        img = vae.decode(z / vae.config.scaling_factor).sample
    decoded.append(img.cpu())
```

3. Discover semantic directions via prompt-pair differences:

```python
def get_text_embedding(prompt):
    tokens = pipe.tokenizer(prompt, return_tensors="pt", padding="max_length",
                            max_length=77, truncation=True).input_ids.to(device)
    with torch.no_grad():
        emb = pipe.text_encoder(tokens).last_hidden_state
    return emb

pos_emb = get_text_embedding("a happy person smiling")
neg_emb = get_text_embedding("a sad person frowning")
direction = pos_emb - neg_emb  # semantic direction in text embedding space
```

4. Detect out-of-distribution latents:

```python
# Compute latent space statistics from a reference set
ref_latents = torch.stack([encode_image(p) for p in reference_paths])
ref_mean = ref_latents.mean(dim=0)
ref_std = ref_latents.std(dim=0)

def ood_score(z):
    """Mahalanobis-like OOD score (higher = more unusual)."""
    deviation = ((z - ref_mean) / (ref_std + 1e-6)).flatten()
    return deviation.norm().item()

test_z = encode_image("test_image.png")
score = ood_score(test_z)
print(f"OOD score: {score:.2f} (reference mean: {np.mean([ood_score(r) for r in ref_latents]):.2f})")
```

**Expected:** Interpolated images show smooth, semantically meaningful transitions without artifacts. Semantic directions produce consistent attribute changes when added to diverse latent codes. OOD scores for in-distribution images cluster tightly; outliers score significantly higher.

**On failure:** If interpolation produces blurry or incoherent midpoints, use slerp instead of linear interpolation -- linear interpolation traverses low-density regions in high-dimensional latent spaces. If semantic directions have no visible effect, increase the direction magnitude or verify the text encoder is the same one used during model training.

## Validation

- [ ] FID computed on at least 10,000 generated samples and matching real sample count
- [ ] CLIP score computed with the same CLIP model used during training (if applicable)
- [ ] Noise schedule visualization shows monotonically decreasing alphas_cumprod
- [ ] Log-SNR spans approximately +10 to -10 across the full timestep range
- [ ] Attention maps resolve per-token spatial activations at mid-resolution layers
- [ ] Attention sharpens from early (diffuse) to late (localized) timesteps
- [ ] Latent interpolations are smooth with no sudden jumps or artifacts
- [ ] OOD detection baseline established from at least 100 reference samples

## Common Pitfalls

- **FID on mismatched resolutions**: Real and generated images must be the same resolution before feeding to Inception. Resize both sets identically or FID will be inflated.
- **Forgetting to normalize for torchmetrics**: `FrechetInceptionDistance(normalize=True)` expects [0, 1] float tensors. With `normalize=False` it expects [0, 255] uint8. Mixing conventions gives meaningless FID.
- **Hooking self-attention instead of cross-attention**: U-Net layers named `attn1` are self-attention (image-to-image). Use `attn2` for cross-attention (text-to-image). Confusing them produces uninformative uniform maps.
- **Linear interpolation in high dimensions**: Linear interpolation between two high-dimensional Gaussians passes through a low-density shell. Always use slerp for latent space interpolation in diffusion models.
- **Ignoring the VAE scaling factor**: Stable Diffusion latents are scaled by `vae.config.scaling_factor` after encoding. Forgetting to apply or remove this factor produces garbled decoded images.
- **Too few samples for precision/recall**: Precision and recall estimates from fewer than 5,000 samples per set are unreliable. Use at least 10,000 for stable estimates.

## Related Skills

- `implement-diffusion-network` - building diffusion models that this skill evaluates
- `analyze-diffusion-dynamics` - mathematical foundations of the noise processes inspected here
- `fit-drift-diffusion-model` - a different diffusion model family sharing SDE foundations
