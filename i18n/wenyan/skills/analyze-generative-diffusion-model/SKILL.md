---
name: analyze-generative-diffusion-model
locale: wenyan
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

# 析生成擴散模

評預訓生成擴散模以量質指、噪排察、交注圖析、潛空探，以解模行、診敗式、引微調之決。

## 用時

- 評預訓生成擴散模之出質以標指乃用
- 算生圖集之 FID、IS、CLIP 分、精/召乃用
- 察比噪排（線、餘、習）以 SNR 線乃用
- 取交注圖以解文至圖之符應乃用
- 插潛碼或發潛空之語向乃用
- 察擴散模管之分布外入乃用

## 入

- **必要**：預訓模之識或檢點徑（如 `stabilityai/stable-diffusion-2-1`）
- **必要**：析之式——一或多：`metrics`、`schedule`、`attention`、`latent`
- **必要**：指算之參數集（真圖或數集名）
- **可選**：注析之文提示（默：模適之試提示）
- **可選**：指算之生樣數（默：10000）
- **可選**：裝之設（默：`cuda` 若可，否 `cpu`）

## 法

### 第一步：量評

對參集算標生質指。

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

2. 送真圖於指累器：

```python
from torch.utils.data import DataLoader

for batch in DataLoader(real_dataset, batch_size=64):
    imgs = (batch * 255).byte().to(device)
    fid.update(imgs, real=True)
```

3. 生樣且累偽計：

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

4. 算文圖對齊之 CLIP 分：

```python
from torchmetrics.multimodal.clip_score import CLIPScore

clip_metric = CLIPScore(model_name_or_path="openai/clip-vit-large-patch14").to(device)
for prompt, image_tensor in zip(sampled_prompts, sampled_tensors):
    clip_metric.update(image_tensor.unsqueeze(0), [prompt])

print(f"FID: {fid.compute():.2f}")
print(f"IS:  {inception.compute()[0]:.2f} +/- {inception.compute()[1]:.2f}")
print(f"CLIP: {clip_metric.compute():.2f}")
```

5. 算模覆之精與召：

```python
from torchmetrics.image import FrechetInceptionDistance

# Precision: fraction of generated images near real manifold
# Recall: fraction of real images near generated manifold
# Use improved precision/recall (Kynkaanniemi et al., 2019) via
# feature embeddings from the Inception network
```

**得：** 良訓 Stable Diffusion 於標基 FID 低於 30。ImageNet 類提示之 IS 逾 50。文條之 CLIP 分逾 25。精與召皆逾 0.6。

**敗則：** 若 FID 逾 100，驗真圖與生圖同解與同歸一。若 CLIP 分低而 FID 可，模生貌合之圖而不合提示——察文編。確至少萬樣以穩 FID 估。

### 第二步：察噪排

視比前後之噪排。

1. 自模取排參：

```python
scheduler = pipe.scheduler
betas = torch.tensor(scheduler.betas) if hasattr(scheduler, 'betas') else None
alphas_cumprod = torch.tensor(scheduler.alphas_cumprod)
timesteps = torch.arange(len(alphas_cumprod))
```

2. 算信噪比線：

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

3. 比多排類：

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

**得：** 餘排於中時步示比線更漸之 SNR 降。log-SNR 線由約 +10（淨）至 -10（純噪）。習排單調降。

**敗則：** 若 alphas_cumprod 非單調降，排配錯。若值恆，察排器正以模配初始乎。自定排器驗 `set_timesteps()` 已呼。

### 第三步：交注圖析

自文條模取視交注圖。

1. 於 U-Net 交注層注鉤：

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

2. 行推且集特時之注：

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

3. 視符應：

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

**得：** 內容符（「car」、「house」）激局部之空域。風/色符（「red」、「blue」）激其物之重域。早時（高噪）注散；晚時注銳而局。

**敗則：** 若諸注圖皆均，鉤或捕自注而非交注——驗層名含 `attn2`（交）非 `attn1`（自）。若注捕而維誤，察出張索對層之頭與空解。

### 第四步：潛空之探

以插與向發探潛空之構。

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

2. 行球面線插（slerp）：

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

3. 以提對差發語向：

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

4. 察分布外潛：

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

**得：** 插圖顯順且語有義之轉無疵。語向於異潛碼生恆之屬變。分布內圖之 OOD 分聚，外者顯高。

**敗則：** 若插生中模糊或不貫，用 slerp 代線插——線插於高維潛空行過低密之殼。若語向無可見之效，增向之幅或驗文編同於訓時者。

## 驗

- [ ] FID 於至少萬生樣與等真樣
- [ ] CLIP 分以訓同之 CLIP 模算（若適）
- [ ] 噪排視示單調降之 alphas_cumprod
- [ ] log-SNR 跨全時約 +10 至 -10
- [ ] 注圖於中解層顯符之空激
- [ ] 注由早（散）至晚（局）銳化
- [ ] 潛插順無跳無疵
- [ ] OOD 察以至少百參樣立基

## 陷

- **解不合之 FID**：真生圖送 Inception 前必同解。同調其大，否 FID 虛高
- **忘歸於 torchmetrics**：`FrechetInceptionDistance(normalize=True)` 期 [0, 1] 浮。`normalize=False` 則期 [0, 255] uint8。混則 FID 無義
- **鉤自注代交注**：U-Net 中 `attn1` 為自注（圖至圖）。用 `attn2` 為交注（文至圖）。混之生無益之均圖
- **高維之線插**：二高維 Gaussian 之線插過低密殼。擴散模潛空插必用 slerp
- **忽 VAE 放縮**：Stable Diffusion 潛經編後以 `vae.config.scaling_factor` 放縮。忘施或除之致解亂圖
- **精召之樣過少**：各集少於五千之精召估不可信。至少萬以穩估

## 參

- `implement-diffusion-network` — 建此所評之擴散模
- `analyze-diffusion-dynamics` — 此所察噪程之數基
- `fit-drift-diffusion-model` — 共 SDE 基之別擴散模族
