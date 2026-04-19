---
name: analyze-generative-diffusion-model
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

# Analyze Generative Diffusion Model

Evaluate pre-trained generative diffusion via quant metrics, noise schedule inspect, cross-attention maps, latent probe → behavior, failure diagnosis, fine-tune decisions.

## Use When

- Eval pre-trained generative diffusion out quality, standard metrics
- Compute FID, IS, CLIP, precision/recall for generated sets
- Inspect + compare noise schedules (linear, cosine, learned) via SNR curves
- Extract cross-attention maps → text-to-image token-region
- Interpolate latent codes or discover semantic directions
- Detect OOD in for diffusion pipeline

## In

- **Required**: Pre-trained model ID or checkpoint path (e.g., `stabilityai/stable-diffusion-2-1`)
- **Required**: Mode — one+: `metrics`, `schedule`, `attention`, `latent`
- **Required**: Reference dataset (real images or name)
- **Optional**: Text prompts for attention (default: model-appropriate test prompts)
- **Optional**: N samples for metrics (default: 10000)
- **Optional**: Device (default: `cuda` if avail, else `cpu`)

## Do

### Step 1: Quant Evaluation

Standard generative quality metrics vs reference dataset.

1. Setup eval pipeline:

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

2. Feed real images:

```python
from torch.utils.data import DataLoader

for batch in DataLoader(real_dataset, batch_size=64):
    imgs = (batch * 255).byte().to(device)
    fid.update(imgs, real=True)
```

3. Generate + accumulate fake stats:

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

4. CLIP score → text-image align:

```python
from torchmetrics.multimodal.clip_score import CLIPScore

clip_metric = CLIPScore(model_name_or_path="openai/clip-vit-large-patch14").to(device)
for prompt, image_tensor in zip(sampled_prompts, sampled_tensors):
    clip_metric.update(image_tensor.unsqueeze(0), [prompt])

print(f"FID: {fid.compute():.2f}")
print(f"IS:  {inception.compute()[0]:.2f} +/- {inception.compute()[1]:.2f}")
print(f"CLIP: {clip_metric.compute():.2f}")
```

5. Precision + recall → mode coverage:

```python
from torchmetrics.image import FrechetInceptionDistance

# Precision: fraction of generated images near real manifold
# Recall: fraction of real images near generated manifold
# Use improved precision/recall (Kynkaanniemi et al., 2019) via
# feature embeddings from the Inception network
```

**→** FID <30 for well-trained SD on benchmarks. IS >50 on ImageNet prompts. CLIP >25 for text-conditioned. Precision + recall both >0.6.

**If err:** FID >100 → verify real + generated same res + normalization. CLIP low but FID OK → model generates plausible no-prompt-match → check text encoder. ≥10K samples for stable FID.

### Step 2: Noise Schedule Inspect

Visualize + compare forward + reverse schedules.

1. Extract schedule params:

```python
scheduler = pipe.scheduler
betas = torch.tensor(scheduler.betas) if hasattr(scheduler, 'betas') else None
alphas_cumprod = torch.tensor(scheduler.alphas_cumprod)
timesteps = torch.arange(len(alphas_cumprod))
```

2. SNR curve:

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

3. Compare schedule types:

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

**→** Cosine → more gradual SNR decrease in mid-timesteps vs linear. Log-SNR span ~+10 (clean) to -10 (pure noise). Learned schedules monotonic decreasing.

**If err:** alphas_cumprod non-monotonic → misconfig. Constant → scheduler not init w/ model config. Custom schedulers → verify `set_timesteps()` called.

### Step 3: Attention Map Analysis

Extract + visualize cross-attention from text-conditioned.

1. Register attention hooks on U-Net cross-attention layers:

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

2. Run inference + collect attention at specific timesteps:

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

3. Visualize token-region:

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

**→** Content tokens ("car", "house") → localized spatial regions. Style/color ("red", "blue") → regions overlapping w/ object. Early (high noise) diffuse; later sharp + localized.

**If err:** All uniform → hook capturing self-attention not cross → verify layer has `attn2` (cross) not `attn1` (self). Wrong dims → check out tensor indexing matches head count + spatial res.

### Step 4: Latent Space Probe

Structure via interpolation + direction discovery.

1. Encode refs into latent space:

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

2. Spherical linear interpolation (slerp):

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

3. Discover semantic directions via prompt-pair diffs:

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

4. Detect OOD latents:

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

**→** Interpolated images smooth semantic transitions no artifacts. Semantic directions → consistent attribute changes across diverse latents. In-dist OOD scores cluster tight; outliers score much higher.

**If err:** Blurry/incoherent midpoints → slerp not linear — linear traverses low-density regions in high-dim latents. Semantic directions no effect → increase magnitude or verify same text encoder as training.

## Check

- [ ] FID ≥10K generated + matching real sample count
- [ ] CLIP computed w/ same CLIP model as training (if applicable)
- [ ] Noise schedule viz shows monotonic decreasing alphas_cumprod
- [ ] Log-SNR spans ~+10 to -10 across timestep range
- [ ] Attention maps resolve per-token spatial at mid-res layers
- [ ] Attention sharpens early (diffuse) → late (localized)
- [ ] Latent interpolations smooth no sudden jumps/artifacts
- [ ] OOD baseline ≥100 ref samples

## Traps

- **FID mismatched res**: Real + generated must be same res pre-Inception. Resize both identically or FID inflated.
- **Forget normalize for torchmetrics**: `FrechetInceptionDistance(normalize=True)` → [0,1] float. `normalize=False` → [0,255] uint8. Mix → meaningless FID.
- **Hook self-attention not cross**: `attn1` = self (image-to-image). Use `attn2` cross (text-to-image). Confuse → uninformative uniform.
- **Linear interp high dims**: Linear between 2 high-dim Gaussians passes low-density shell. Always slerp in diffusion latents.
- **Ignore VAE scaling factor**: SD latents scaled by `vae.config.scaling_factor` post-encode. Forget → garbled decode.
- **Too few samples precision/recall**: <5K samples/set → unreliable. ≥10K for stable.

## →

- `implement-diffusion-network` — build diffusion models this skill evals
- `analyze-diffusion-dynamics` — math foundations of inspected noise procs
- `fit-drift-diffusion-model` — different diffusion family, same SDE foundations
