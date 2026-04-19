---
name: analyze-generative-diffusion-model
locale: wenyan-ultra
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

# 析生擴散模

評預訓生擴散模：質量、噪表、注意圖、潛空。

## 用

- 以標量評預訓生擴散模出之質→用
- 算 FID、IS、CLIP 分、精召於生圖→用
- 視比噪表（線、餘、學）以 SNR 曲→用
- 取交注意圖以解文圖標域配→用
- 於潛碼間插或發潛空語向→用
- 察擴散模管線之分外入→用

## 入

- **必**：預訓模識或檢點路（如 `stabilityai/stable-diffusion-2-1`）
- **必**：析模——`metrics`、`schedule`、`attention`、`latent` 之一或多
- **必**：度算之參數（真圖或集名）
- **可**：注意析之文提（默：模適測提）
- **可**：度算之生樣數（默 10000）
- **可**：器設（默：`cuda` 若可，否 `cpu`）

## 行

### 一：量評

對參集算標生質度。

1. 設評管：

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

2. 真圖入度累：

```python
from torch.utils.data import DataLoader

for batch in DataLoader(real_dataset, batch_size=64):
    imgs = (batch * 255).byte().to(device)
    fid.update(imgs, real=True)
```

3. 生樣累偽計：

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

4. 算 CLIP 分為文圖配：

```python
from torchmetrics.multimodal.clip_score import CLIPScore

clip_metric = CLIPScore(model_name_or_path="openai/clip-vit-large-patch14").to(device)
for prompt, image_tensor in zip(sampled_prompts, sampled_tensors):
    clip_metric.update(image_tensor.unsqueeze(0), [prompt])

print(f"FID: {fid.compute():.2f}")
print(f"IS:  {inception.compute()[0]:.2f} +/- {inception.compute()[1]:.2f}")
print(f"CLIP: {clip_metric.compute():.2f}")
```

5. 算精召為模覆：

```python
from torchmetrics.image import FrechetInceptionDistance

# Precision: fraction of generated images near real manifold
# Recall: fraction of real images near generated manifold
# Use improved precision/recall (Kynkaanniemi et al., 2019) via
# feature embeddings from the Inception network
```

得：訓善 SD 模於標基 FID <30。ImageNet 類提 IS >50。文條模 CLIP >25。精召皆 >0.6。

敗：FID >100→驗真生圖同分辨同正規。CLIP 低而 FID 可→模生似像不配文，察文編。為穩 FID 至少 10000 樣。

### 二：察噪表

視比正反噪表。

1. 自模取表參：

```python
scheduler = pipe.scheduler
betas = torch.tensor(scheduler.betas) if hasattr(scheduler, 'betas') else None
alphas_cumprod = torch.tensor(scheduler.alphas_cumprod)
timesteps = torch.arange(len(alphas_cumprod))
```

2. 算信噪比曲：

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

3. 比多表類：

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

得：餘表中時較線漸 SNR 減。log-SNR 曲應自約 +10（清）至 -10（純噪）。學表應單調減。

敗：alphas_cumprod 非單調減→表設誤。值常→察解以模設正初。客解須驗 `set_timesteps()` 已呼。

### 三：析注意圖

於文條模取繪交注意。

1. 於 U-Net 交注意層註鉤：

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

2. 行推而於定時收注意：

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

3. 視標域配：

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

得：內標（「車」、「屋」）激局空。色標（「紅」、「藍」）激物相疊域。早時（高噪）注散；晚時注銳局。

敗：注皆均→鉤或捕自注非交，驗層名含 `attn2`（交）非 `attn1`（自）。捕注而維誤→察出張索符層頭數與空辨。

### 四：探潛空

以插與向發探潛空構。

1. 編參圖入潛空：

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

2. 球面線插（slerp）：

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

3. 由提對差發語向：

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

4. 察分外潛：

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

得：插圖滑、語有意、無偽。語向加多樣潛碼致一致屬變。分內 OOD 分聚緊；外者顯高。

敗：插中模或亂→用 slerp 非線插——線插穿高維潛空之低密。語向無見效→增向值或驗文編同訓所用。

## 驗

- [ ] FID 算於至少 10000 生樣與配真樣
- [ ] CLIP 分用訓所用之 CLIP 模（若可）
- [ ] 噪表視示 alphas_cumprod 單調減
- [ ] log-SNR 跨全時約 +10 至 -10
- [ ] 注意圖於中辨層解標空激
- [ ] 注由早（散）至晚（局）銳
- [ ] 潛插滑、無突跳或偽
- [ ] OOD 察基立於至少 100 參樣

## 忌

- **FID 於不配辨**：真生圖入 Inception 前須同辨。同一調整或 FID 漲
- **忘 torchmetrics 正規**：`FrechetInceptionDistance(normalize=True)` 期 [0,1] 浮張。`normalize=False` 期 [0,255] uint8。混則無意 FID
- **鉤自注非交注**：U-Net 名 `attn1` 為自注（圖對圖）。用 `attn2` 為交（文對圖）。混致無資均圖
- **高維線插**：兩高維高斯間線插穿低密殼。潛空插恆用 slerp
- **忽 VAE 縮係**：SD 潛經編後縮以 `vae.config.scaling_factor`。忘加減致解圖亂
- **精召樣太少**：每集少於 5000 之精召估不可靠。為穩用至少 10000

## 參

- `implement-diffusion-network` — 建此技所評之擴散模
- `analyze-diffusion-dynamics` — 此察之噪程之數基
- `fit-drift-diffusion-model` — 共 SDE 基之他擴散模族
