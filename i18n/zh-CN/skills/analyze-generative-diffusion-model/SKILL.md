---
name: analyze-generative-diffusion-model
description: >
  分析预训练的生成式扩散模型（Stable Diffusion、DALL-E、Flux），通过计算质量指标
  （FID、IS、CLIP 分数、精确率/召回率）、检查噪声调度、提取和可视化注意力图以及
  探测潜在空间。适用于评估预训练生成式扩散模型的输出质量、比较噪声调度变体、
  分析文本条件生成的交叉注意力模式、在潜在编码之间进行插值，或检测分布外输入时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: advanced
  language: python
  tags: diffusion, generative-ai, evaluation, FID, attention, latent-space
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 分析生成式扩散模型

通过定量质量指标、噪声调度检查、交叉注意力图分析和潜在空间探测来评估预训练的生成式扩散模型，以理解模型行为、诊断失败模式并指导微调决策。

## 适用场景

- 使用标准指标评估预训练生成式扩散模型的输出质量
- 为生成的图像集计算 FID、IS、CLIP 分数或精确率/召回率
- 通过 SNR 曲线检查和比较噪声调度（线性、余弦、学习型）
- 提取交叉注意力图以理解文本到图像的词元-区域对应关系
- 在潜在编码之间进行插值或在潜在空间中发现语义方向
- 检测扩散模型管道的分布外输入

## 输入

- **必需**：预训练模型标识符或检查点路径（例如 `stabilityai/stable-diffusion-2-1`）
- **必需**：分析模式——以下一种或多种：`metrics`、`schedule`、`attention`、`latent`
- **必需**：用于指标计算的参考数据集（真实图像或数据集名称）
- **可选**：用于注意力分析的文本提示词（默认：适合模型的测试提示词）
- **可选**：用于指标计算的生成样本数量（默认：10000）
- **可选**：设备配置（默认：如有 `cuda` 则使用，否则使用 `cpu`）

## 步骤

### 第 1 步：定量评估

针对参考数据集计算标准生成质量指标。

1. 设置评估管道：

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

2. 将真实图像送入指标累加器：

```python
from torch.utils.data import DataLoader

for batch in DataLoader(real_dataset, batch_size=64):
    imgs = (batch * 255).byte().to(device)
    fid.update(imgs, real=True)
```

3. 生成样本并累加伪统计量：

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

4. 计算 CLIP 分数以衡量文本-图像对齐度：

```python
from torchmetrics.multimodal.clip_score import CLIPScore

clip_metric = CLIPScore(model_name_or_path="openai/clip-vit-large-patch14").to(device)
for prompt, image_tensor in zip(sampled_prompts, sampled_tensors):
    clip_metric.update(image_tensor.unsqueeze(0), [prompt])

print(f"FID: {fid.compute():.2f}")
print(f"IS:  {inception.compute()[0]:.2f} +/- {inception.compute()[1]:.2f}")
print(f"CLIP: {clip_metric.compute():.2f}")
```

5. 计算精确率和召回率以衡量模式覆盖：

```python
from torchmetrics.image import FrechetInceptionDistance

# Precision: fraction of generated images near real manifold
# Recall: fraction of real images near generated manifold
# Use improved precision/recall (Kynkaanniemi et al., 2019) via
# feature embeddings from the Inception network
```

**预期结果：** 对于在标准基准上训练良好的 Stable Diffusion 模型，FID 低于 30。在 ImageNet 类提示词上 IS 高于 50。文本条件模型的 CLIP 分数高于 25。精确率和召回率均高于 0.6。

**失败处理：** 如果 FID 高于 100，验证真实图像和生成图像是否共享相同的分辨率和归一化方式。如果 CLIP 分数低但 FID 可接受，说明模型生成了合理的图像但不匹配文本提示词——检查文本编码器。确保至少 10,000 个样本以获得稳定的 FID 估计值。

### 第 2 步：噪声调度检查

可视化并比较前向和反向噪声调度。

1. 从模型中提取调度参数：

```python
scheduler = pipe.scheduler
betas = torch.tensor(scheduler.betas) if hasattr(scheduler, 'betas') else None
alphas_cumprod = torch.tensor(scheduler.alphas_cumprod)
timesteps = torch.arange(len(alphas_cumprod))
```

2. 计算信噪比曲线：

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

3. 比较多种调度类型：

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

**预期结果：** 余弦调度在中间时间步显示比线性调度更平缓的 SNR 下降。log-SNR 曲线应从大约 +10（干净）跨越到 -10（纯噪声）。学习型调度应单调递减。

**失败处理：** 如果 alphas_cumprod 不是单调递减的，说明调度配置错误。如果值是常数，检查调度器是否使用模型的配置正确初始化。对于自定义调度器，验证是否已调用 `set_timesteps()`。

### 第 3 步：注意力图分析

从文本条件模型中提取和可视化交叉注意力图。

1. 在 U-Net 交叉注意力层上注册注意力钩子：

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

2. 运行推理并在特定时间步收集注意力：

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

3. 可视化词元-区域对应关系：

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

**预期结果：** 内容词元（"car"、"house"）激活局部化的空间区域。风格/颜色词元（"red"、"blue"）激活与其关联对象重叠的区域。早期时间步（高噪声）显示分散的注意力；后期时间步显示尖锐、局部化的注意力。

**失败处理：** 如果所有注意力图看起来均匀，钩子可能捕获的是自注意力而非交叉注意力——验证层名称包含 `attn2`（交叉注意力）而非 `attn1`（自注意力）。如果注意力被捕获但维度错误，检查输出张量索引是否与层的头数和空间分辨率匹配。

### 第 4 步：潜在空间探测

通过插值和方向发现探索潜在空间的结构。

1. 将参考图像编码到潜在空间：

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

2. 执行球面线性插值（slerp）：

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

3. 通过提示词对差异发现语义方向：

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

4. 检测分布外潜在编码：

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

**预期结果：** 插值图像显示平滑、语义有意义的过渡，无伪影。语义方向在添加到不同潜在编码时产生一致的属性变化。分布内图像的 OOD 分数紧密聚集；异常值的分数明显更高。

**失败处理：** 如果插值产生模糊或不连贯的中间点，使用 slerp 代替线性插值——线性插值在高维潜在空间中穿越低密度区域。如果语义方向没有可见效果，增加方向幅度或验证文本编码器与模型训练时使用的是否相同。

## 验证清单

- [ ] FID 在至少 10,000 个生成样本和匹配的真实样本数量上计算
- [ ] CLIP 分数使用与训练期间相同的 CLIP 模型计算（如适用）
- [ ] 噪声调度可视化显示单调递减的 alphas_cumprod
- [ ] Log-SNR 在整个时间步范围内大约跨越 +10 到 -10
- [ ] 注意力图在中分辨率层解析每个词元的空间激活
- [ ] 注意力从早期（分散）到后期（局部化）时间步变得更尖锐
- [ ] 潜在插值平滑，无突然跳变或伪影
- [ ] OOD 检测基线从至少 100 个参考样本建立

## 常见问题

- **分辨率不匹配的 FID**：真实图像和生成图像在送入 Inception 之前必须具有相同分辨率。对两组进行相同的缩放，否则 FID 将被人为抬高
- **忘记为 torchmetrics 归一化**：`FrechetInceptionDistance(normalize=True)` 期望 [0, 1] 的浮点张量。`normalize=False` 期望 [0, 255] 的 uint8。混用约定会得到无意义的 FID
- **钩取自注意力而非交叉注意力**：U-Net 中名为 `attn1` 的层是自注意力（图像到图像）。使用 `attn2` 获取交叉注意力（文本到图像）。混淆两者会产生无信息的均匀注意力图
- **高维空间中的线性插值**：两个高维高斯分布之间的线性插值穿过低密度壳层。在扩散模型中始终使用 slerp 进行潜在空间插值
- **忽略 VAE 缩放因子**：Stable Diffusion 的潜在编码在编码后按 `vae.config.scaling_factor` 缩放。忘记应用或移除此因子会产生乱码解码图像
- **精确率/召回率样本太少**：少于 5,000 个样本的精确率和召回率估计不可靠。使用至少 10,000 个以获得稳定估计

## 相关技能

- `implement-diffusion-network` -- 构建本技能所评估的扩散模型
- `analyze-diffusion-dynamics` -- 此处检查的噪声过程的数学基础
- `fit-drift-diffusion-model` -- 共享 SDE 基础的不同扩散模型族
