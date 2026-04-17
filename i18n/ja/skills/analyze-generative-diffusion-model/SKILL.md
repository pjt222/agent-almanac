---
name: analyze-generative-diffusion-model
description: >
  事前学習済み生成拡散モデル（Stable Diffusion、DALL-E、Flux）を品質メトリクス
  （FID、IS、CLIPスコア、精度/再現率）の計算、ノイズスケジュールの検査、
  アテンションマップの抽出と可視化、潜在空間の探索によって分析する。
  事前学習済み生成拡散モデルの出力品質を評価する時、ノイズスケジュール変種を
  比較する時、テキスト条件付き生成のクロスアテンションパターンを分析する時、
  潜在コード間を補間する時、分布外入力を検出する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: advanced
  language: python
  tags: diffusion, generative-ai, evaluation, FID, attention, latent-space
  locale: ja
  source_locale: en
  source_commit: e19b1658
  translator: claude
  translation_date: "2026-03-17"
---

# 生成拡散モデルの分析

定量的品質メトリクス、ノイズスケジュール検査、クロスアテンションマップ分析、潜在空間探索を通じて事前学習済み生成拡散モデルを評価し、モデルの挙動を理解し、障害モードを診断し、ファインチューニングの判断を導く。

## 使用タイミング

- 標準メトリクスで事前学習済み生成拡散モデルの出力品質を評価する時
- 生成画像セットのFID、IS、CLIPスコア、精度/再現率を計算する時
- SNR曲線によるノイズスケジュール（線形、コサイン、学習済み）の検査と比較をする時
- テキストから画像へのトークン-領域対応を理解するためにクロスアテンションマップを抽出する時
- 潜在コード間の補間や潜在空間での意味方向の発見をする時
- 拡散モデルパイプラインの分布外入力を検出する時

## 入力

- **必須**: 事前学習済みモデル識別子またはチェックポイントパス（例: `stabilityai/stable-diffusion-2-1`）
- **必須**: 分析モード — 1つ以上: `metrics`、`schedule`、`attention`、`latent`
- **必須**: メトリクス計算用の参照データセット（実画像またはデータセット名）
- **任意**: アテンション分析用のテキストプロンプト（デフォルト: モデルに適したテストプロンプト）
- **任意**: メトリクス計算用の生成サンプル数（デフォルト: 10000）
- **任意**: デバイス設定（デフォルト: 利用可能なら`cuda`、そうでなければ`cpu`）

## 手順

### ステップ1: 定量的評価

参照データセットに対して標準的な生成品質メトリクスを計算する。

1. 評価パイプラインをセットアップする:

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

2. 実画像をメトリクスアキュムレータに供給する:

```python
from torch.utils.data import DataLoader

for batch in DataLoader(real_dataset, batch_size=64):
    imgs = (batch * 255).byte().to(device)
    fid.update(imgs, real=True)
```

3. サンプルを生成してフェイク統計を蓄積する:

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

4. テキスト-画像整合性のCLIPスコアを計算する:

```python
from torchmetrics.multimodal.clip_score import CLIPScore

clip_metric = CLIPScore(model_name_or_path="openai/clip-vit-large-patch14").to(device)
for prompt, image_tensor in zip(sampled_prompts, sampled_tensors):
    clip_metric.update(image_tensor.unsqueeze(0), [prompt])

print(f"FID: {fid.compute():.2f}")
print(f"IS:  {inception.compute()[0]:.2f} +/- {inception.compute()[1]:.2f}")
print(f"CLIP: {clip_metric.compute():.2f}")
```

5. モードカバレッジの精度と再現率を計算する:

```python
from torchmetrics.image import FrechetInceptionDistance

# Precision: fraction of generated images near real manifold
# Recall: fraction of real images near generated manifold
# Use improved precision/recall (Kynkaanniemi et al., 2019) via
# feature embeddings from the Inception network
```

**期待結果:** 標準ベンチマークで十分に学習されたStable DiffusionモデルのFIDが30未満。ImageNetクラスのプロンプトでISが50以上。テキスト条件付きモデルでCLIPスコアが25以上。精度と再現率がともに0.6以上。

**失敗時:** FIDが100以上の場合、実画像と生成画像が同じ解像度と正規化を共有しているか確認する。CLIPスコアが低いがFIDは許容範囲内の場合、モデルはもっともらしい画像を生成しているがテキストプロンプトに一致していない -- テキストエンコーダーを確認する。安定したFID推定のために少なくとも10,000サンプルを使用する。

### ステップ2: ノイズスケジュールの検査

順方向および逆方向のノイズスケジュールを可視化して比較する。

1. モデルからスケジュールパラメータを抽出する:

```python
scheduler = pipe.scheduler
betas = torch.tensor(scheduler.betas) if hasattr(scheduler, 'betas') else None
alphas_cumprod = torch.tensor(scheduler.alphas_cumprod)
timesteps = torch.arange(len(alphas_cumprod))
```

2. 信号対雑音比曲線を計算する:

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

3. 複数のスケジュールタイプを比較する:

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

**期待結果:** コサインスケジュールは線形と比較して中間タイムステップでより緩やかなSNR減少を示す。log-SNR曲線は約+10（クリーン）から-10（純粋なノイズ）にわたるべき。学習済みスケジュールは単調に減少すべき。

**失敗時:** alphas_cumprodが単調に減少していない場合、スケジュールが誤設定されている。値が一定の場合、スケジューラーがモデルの設定で適切に初期化されたか確認する。カスタムスケジューラーの場合、`set_timesteps()`が呼ばれたことを確認する。

### ステップ3: アテンションマップの分析

テキスト条件付きモデルからクロスアテンションマップを抽出して可視化する。

1. U-Netのクロスアテンション層にアテンションフックを登録する:

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

2. 推論を実行して特定のタイムステップでアテンションを収集する:

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

3. トークン-領域対応を可視化する:

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

**期待結果:** コンテンツトークン（"car"、"house"）が局所的な空間領域を活性化する。スタイル/色トークン（"red"、"blue"）が関連するオブジェクトと重なる領域を活性化する。初期タイムステップ（高ノイズ）は拡散的なアテンションを示し、後期タイムステップは鋭い局所的アテンションを示す。

**失敗時:** すべてのアテンションマップが均一に見える場合、フックがクロスアテンションではなくセルフアテンションをキャプチャしている可能性がある -- レイヤー名に`attn1`（セルフ）ではなく`attn2`（クロス）が含まれていることを確認する。アテンションはキャプチャされたが次元が間違っている場合、出力テンソルのインデックスがレイヤーのヘッド数と空間解像度に一致しているか確認する。

### ステップ4: 潜在空間の探索

補間と方向発見を通じて潜在空間の構造を探索する。

1. 参照画像を潜在空間にエンコードする:

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

2. 球面線形補間（slerp）を実行する:

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

3. プロンプトペアの差分による意味方向を発見する:

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

4. 分布外の潜在コードを検出する:

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

**期待結果:** 補間された画像がアーティファクトなしにスムーズで意味のある遷移を示す。意味方向が多様な潜在コードに追加された時に一貫した属性変化を生む。分布内画像のOODスコアが密集し、外れ値は大幅に高いスコアとなる。

**失敗時:** 補間がぼやけたまたは一貫性のない中間点を生成する場合、線形補間の代わりにslerpを使用する -- 線形補間は高次元潜在空間の低密度領域を横断する。意味方向に目に見える効果がない場合、方向の大きさを増やすか、テキストエンコーダーがモデル学習時に使用されたものと同じか確認する。

## バリデーション

- [ ] FIDが少なくとも10,000の生成サンプルと同数の実サンプルで計算されている
- [ ] CLIPスコアが学習時に使用されたのと同じCLIPモデルで計算されている（該当する場合）
- [ ] ノイズスケジュールの可視化が単調に減少するalphas_cumprodを示している
- [ ] log-SNRがフルタイムステップ範囲で約+10から-10にわたっている
- [ ] アテンションマップが中解像度レイヤーでトークンごとの空間活性化を解像している
- [ ] アテンションが初期（拡散的）から後期（局所的）タイムステップにかけて鋭くなっている
- [ ] 潜在補間が突然のジャンプやアーティファクトなしにスムーズである
- [ ] OOD検出ベースラインが少なくとも100の参照サンプルから確立されている

## よくある落とし穴

- **解像度不一致のFID**: 実画像と生成画像はInceptionに供給する前に同じ解像度でなければならない。両セットを同一にリサイズしなければFIDが膨張する。
- **torchmetricsの正規化の忘れ**: `FrechetInceptionDistance(normalize=True)`は[0, 1]のfloatテンソルを期待する。`normalize=False`では[0, 255]のuint8を期待する。規約を混在させると無意味なFIDになる。
- **クロスアテンションの代わりにセルフアテンションをフックする**: `attn1`という名前のU-Netレイヤーはセルフアテンション（画像対画像）である。クロスアテンション（テキスト対画像）には`attn2`を使用する。混同すると情報のない均一なマップが生成される。
- **高次元での線形補間**: 2つの高次元ガウシアン間の線形補間は低密度のシェルを通過する。拡散モデルの潜在空間補間には常にslerpを使用する。
- **VAEスケーリングファクターの無視**: Stable Diffusionの潜在コードはエンコード後に`vae.config.scaling_factor`でスケーリングされる。このファクターの適用や除去を忘れると、デコードされた画像が壊れる。
- **精度/再現率のサンプル数不足**: セットあたり5,000未満のサンプルからの精度と再現率の推定は信頼性が低い。安定した推定のために少なくとも10,000を使用する。

## 関連スキル

- `implement-diffusion-network` - このスキルが評価する拡散モデルの構築
- `analyze-diffusion-dynamics` - ここで検査されるノイズプロセスの数学的基礎
- `fit-drift-diffusion-model` - SDE基盤を共有する異なる拡散モデルファミリー
