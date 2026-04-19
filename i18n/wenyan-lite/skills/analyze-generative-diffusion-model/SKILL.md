---
name: analyze-generative-diffusion-model
locale: wenyan-lite
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

# 析生成式擴散模型

藉量化品質指標、噪聲排程檢查、交叉注意力圖分析與潛空間探查，評估預訓練之生成式擴散模型，以解模型行為、診斷失敗模式並指引微調決策。

## 適用時機

- 以標準指標評預訓練之生成式擴散模型之輸出品質
- 為生成圖像集計算 FID、IS、CLIP score 或 precision/recall
- 經 SNR 曲線檢查並比對噪聲排程（線性、餘弦、學習）
- 提取交叉注意力圖以解文圖之 token-區域對應
- 於潛碼間插值，或於潛空間中發現語意方向
- 為擴散模型管線偵測分佈外之輸入

## 輸入

- **必要**：預訓練模型識別碼或檢查點路徑（如 `stabilityai/stable-diffusion-2-1`）
- **必要**：分析模式——一或多：`metrics`、`schedule`、`attention`、`latent`
- **必要**：指標計算之參考資料集（真實圖像或資料集名）
- **選擇性**：注意力分析之文字提詞（預設：模型適用之測試提詞）
- **選擇性**：指標計算之生成樣本數（預設：10000）
- **選擇性**：裝置配置（預設：若可用則 `cuda`，否則 `cpu`）

## 步驟

### 步驟一：量化評估

對參考資料集計算標準生成品質指標。

1. 設置評估管線：

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

2. 將真實圖像饋入指標累積器：

```python
from torch.utils.data import DataLoader

for batch in DataLoader(real_dataset, batch_size=64):
    imgs = (batch * 255).byte().to(device)
    fid.update(imgs, real=True)
```

3. 生成樣本並累積偽統計量：

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

4. 計算文圖對齊之 CLIP score：

```python
from torchmetrics.multimodal.clip_score import CLIPScore

clip_metric = CLIPScore(model_name_or_path="openai/clip-vit-large-patch14").to(device)
for prompt, image_tensor in zip(sampled_prompts, sampled_tensors):
    clip_metric.update(image_tensor.unsqueeze(0), [prompt])

print(f"FID: {fid.compute():.2f}")
print(f"IS:  {inception.compute()[0]:.2f} +/- {inception.compute()[1]:.2f}")
print(f"CLIP: {clip_metric.compute():.2f}")
```

5. 為模式覆蓋計算 precision 與 recall：

```python
from torchmetrics.image import FrechetInceptionDistance

# Precision: fraction of generated images near real manifold
# Recall: fraction of real images near generated manifold
# Use improved precision/recall (Kynkaanniemi et al., 2019) via
# feature embeddings from the Inception network
```

**預期：** 訓練良好之 Stable Diffusion 模型於標準基準上 FID 低於 30。ImageNet 類提詞之 IS 高於 50。文條件模型之 CLIP score 高於 25。Precision 與 recall 皆高於 0.6。

**失敗時：** 若 FID 高於 100，驗真實與生成圖像之解析度與正規化是否一致。若 CLIP score 低而 FID 可接受，模型生成貌似合理之圖像但不合提詞——查文字編碼器。為穩定 FID 估計確保至少 10,000 樣本。

### 步驟二：噪聲排程檢查

視覺化並比對前向與反向之噪聲排程。

1. 自模型提取排程參數：

```python
scheduler = pipe.scheduler
betas = torch.tensor(scheduler.betas) if hasattr(scheduler, 'betas') else None
alphas_cumprod = torch.tensor(scheduler.alphas_cumprod)
timesteps = torch.arange(len(alphas_cumprod))
```

2. 計算信噪比曲線：

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

3. 比對多種排程類型：

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

**預期：** 餘弦排程於中段時步較線性呈更漸進之 SNR 降。log-SNR 曲線應自約 +10（潔）至 -10（純噪）。學習之排程應單調下降。

**失敗時：** 若 alphas_cumprod 非單調下降，排程設置有誤。若值為常，查解算器是否以模型之 config 正確初始化。對自訂解算器，驗 `set_timesteps()` 已被呼叫。

### 步驟三：注意力圖分析

自文條件模型提取並視覺化交叉注意力圖。

1. 於 U-Net 之交叉注意力層註冊注意力 hook：

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

2. 行推論並於特定時步收集注意力：

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

3. 視覺化 token-區域對應：

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

**預期：** 內容 token（"car"、"house"）激活局部空間區域。風格／顏色 token（"red"、"blue"）激活與其關聯物件相疊之區。早時步（高噪）呈瀰散之注意力；晚時步呈銳而局部之注意力。

**失敗時：** 若一切注意力圖呈均勻，hook 或捕到自我注意力而非交叉注意力——驗層名含 `attn2`（交叉）而非 `attn1`（自我）。若注意力捕到然維度有誤，查輸出 tensor 索引是否合該層之 head 數與空間解析度。

### 步驟四：潛空間探查

藉插值與方向發現探潛空間之結構。

1. 將參考圖像編碼至潛空間：

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

2. 行球面線性插值（slerp）：

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

3. 經提詞對之差發現語意方向：

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

4. 偵測分佈外之潛碼：

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

**預期：** 插值圖像呈順、語意有意義之轉換而無產物。語意方向加於多樣潛碼時產一致之屬性變化。分佈內圖像之 OOD 分數聚緊；異常者顯著更高。

**失敗時：** 若插值產糢糊或不連貫之中點，用 slerp 而非線性插值——線性插值橫越高維潛空間之低密度區域。若語意方向無可見效果，增方向幅度或驗文字編碼器與訓練時所用同。

## 驗證

- [ ] FID 於至少 10,000 生成樣本與配對之真實樣本數計算
- [ ] CLIP score 以訓練時所用同一 CLIP 模型計算（若適用）
- [ ] 噪聲排程視覺化呈單調下降之 alphas_cumprod
- [ ] Log-SNR 跨整時步範圍約自 +10 至 -10
- [ ] 注意力圖於中解析度層解出每 token 之空間激活
- [ ] 注意力自早（瀰散）至晚（局部）時步銳化
- [ ] 潛插值順而無突跳或產物
- [ ] OOD 偵測基線自至少 100 參考樣本立

## 常見陷阱

- **解析度不符之 FID**：真實與生成圖像於饋入 Inception 前須同解析度。否則 FID 失真
- **遺正規化於 torchmetrics**：`FrechetInceptionDistance(normalize=True)` 期 [0, 1] float tensor。若 `normalize=False` 則期 [0, 255] uint8。混慣例致 FID 無意義
- **hook 自我注意力而非交叉注意力**：U-Net 中名 `attn1` 之層為自我注意力（圖對圖）。`attn2` 為交叉注意力（文對圖）。混之產無資訊之均勻圖
- **高維中之線性插值**：二高維高斯間之線性插值經低密度殼。擴散模型之潛空間插值恆用 slerp
- **忽 VAE scaling factor**：Stable Diffusion 之潛碼於編碼後乘以 `vae.config.scaling_factor`。遺施或除此因子致解碼圖像錯亂
- **precision/recall 樣本過少**：少於每集 5,000 樣本之 precision 與 recall 估計不可靠。為穩定估計用至少 10,000

## 相關技能

- `implement-diffusion-network` — 構建此技能評估之擴散模型
- `analyze-diffusion-dynamics` — 此處檢查之噪聲過程之數學基礎
- `fit-drift-diffusion-model` — 共享 SDE 基礎之另一擴散模型族
