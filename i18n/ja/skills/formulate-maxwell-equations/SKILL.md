---
name: formulate-maxwell-equations
description: >
  積分形式と微分形式のマクスウェル方程式の完全なセットを使用して電磁場、波動、
  エネルギー輸送を解析する。ガウスの法則、ファラデーの法則、またはアンペール-
  マクスウェルの法則を境界値問題に適用する時、電磁波動方程式を導出する時、
  ポインティングベクトルと放射圧を計算する時、材料界面での場を求める時、または
  静電気学と静磁気学を統一電磁気学的枠組みに接続する時に使用する。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: advanced
  language: natural
  tags: electromagnetism, maxwell-equations, electromagnetic-waves, poynting-vector, boundary-conditions
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# マクスウェル方程式の定式化

関連するマクスウェル方程式を適切な形式（積分形式または微分形式）で記述し、境界条件と対称性を適用して系を簡約化し、結果として得られる偏微分方程式を場について解き、ポインティングベクトル、放射圧、波動インピーダンスなどの導出量を計算し、既知の静的極限と波動極限に対して解を検証することで、電磁気現象を解析する。

## 使用タイミング

- 電源と材料界面のある領域でEおよびB場の境界値問題を解く時
- 第一原理から電磁波動方程式を導出する時
- 電磁場のエネルギー流（ポインティングベクトル）と運動量密度を計算する時
- 異なる媒質間（誘電体、導体、磁性体）の界面で境界条件を適用する時
- 変位電流とアンペール-マクスウェル方程式の完成におけるその役割を解析する時
- 静的極限（クーロンの法則、ビオ-サバールの法則）を統一的な時間依存枠組みに接続する時

## 入力

- **必須**: 物理的構成（幾何学、電源電荷と電流、材料特性）
- **必須**: 求める量（E場、B場、波動解、エネルギー流束、または境界場の値）
- **任意**: 対称性情報（平面、円筒、球、または特別な対称性なし）
- **任意**: 時間依存性の指定（静的、周波数omegaの調和的、または一般的な時間依存）
- **任意**: 材料界面または導体表面での境界条件

## 手順

### ステップ1: 4つのマクスウェル方程式の記述と関連する部分集合の特定

完全なセットを記述し、どの方程式が問題を制約するかを選択する:

1. **Eに対するガウスの法則**: div(E) = rho / epsilon_0（微分形式）またはclosed_surface_integral(E . dA) = Q_enc / epsilon_0（積分形式）。E場の発散を電荷密度に関連付ける。対称性を持つ電荷分布からEを求める時に使用する。

2. **Bに対するガウスの法則**: div(B) = 0（微分形式）またはclosed_surface_integral(B . dA) = 0（積分形式）。磁気単極子は存在しない。すべての磁力線は閉じたループである。計算されたB場の整合性チェックに使用する。

3. **ファラデーの法則**: curl(E) = -dB/dt（微分形式）またはcontour_integral(E . dl) = -d(Phi_B)/dt（積分形式）。変化するB場がカールするE場を生成する。誘導問題と波動導出に使用する。

4. **アンペール-マクスウェルの法則**: curl(B) = mu_0 J + mu_0 epsilon_0 dE/dt（微分形式）またはcontour_integral(B . dl) = mu_0 I_enc + mu_0 epsilon_0 d(Phi_E)/dt（積分形式）。電流と変化するE場がカールするB場を生成する。変位電流項mu_0 epsilon_0 dE/dtは波動伝播と電流の連続性に不可欠である。

5. **形式の選択**: 局所的な場の計算、波動方程式、偏微分方程式には微分形式を選択する。場を積分から直接抽出できる高対称性問題には積分形式を選択する。

6. **活性方程式の特定**: すべての問題ですべての4つの方程式が独立な制約となるわけではない。静電気学（dB/dt = 0、J = 0）では、Eに対するガウスの法則とcurl(E) = 0のみが重要である。静磁気学では、Bに対するガウスの法則とアンペールの法則（変位電流なし）で十分である。

```markdown
## Maxwell Equations for This Problem
- **Form**: [differential / integral / both]
- **Active equations**: [list which of the four are non-trivial constraints]
- **Source terms**: rho = [charge density], J = [current density]
- **Time dependence**: [static / harmonic / general]
- **Displacement current**: [negligible / essential -- with justification]
```

**期待結果:** 4つの方程式が記述され、関連する部分集合が根拠とともに特定され、変位電流が含まれるか明示的に無視可能と論じられていること。

**失敗時:** 変位電流が重要かどうか不明な場合、比率|epsilon_0 dE/dt| / |J|を推定する。この比率が1と同程度かそれ以上であれば、変位電流を保持しなければならない。自由電荷のない真空中では、変位電流は波動伝播に常に不可欠である。

### ステップ2: 境界条件と対称性の適用

材料界面と幾何学的対称性を使用して系を簡約化する:

1. **材料界面での境界条件**: 表面電荷sigma_fと表面電流K_fを持つ媒質1と媒質2の界面で:
   - 法線E: epsilon_1 E_1n - epsilon_2 E_2n = sigma_f
   - 接線E: E_1t = E_2t（連続）
   - 法線B: B_1n = B_2n（連続）
   - 接線H: n_hat x (H_1 - H_2) = K_f（n_hatは2から1に向く）

2. **導体境界条件**: 完全導体の表面で:
   - E_接線 = 0（導体内部でE = 0）
   - B_法線 = 0（時間変化する場では導体内部でB = 0）
   - 表面電荷: sigma = epsilon_0 E_法線
   - 表面電流: K = (1/mu_0) n_hat x B

3. **対称性の簡約**: 特定された対称性を使用して独立変数の数を減らす:
   - 平面対称性: 場は1つの座標のみに依存（例えばz）、偏微分方程式が常微分方程式に簡約
   - 円筒対称性: 場は(rho, z)またはrhoのみに依存
   - 球対称性: 場はrのみに依存
   - 並進不変性: 不変な方向でフーリエ変換

4. **ゲージの選択**（ポテンシャルを使用する場合）: スカラーポテンシャルphiとベクトルポテンシャルAのゲージを選択する:
   - クーロンゲージ: div(A) = 0（静電的寄与と放射寄与を分離）
   - ローレンツゲージ: div(A) + mu_0 epsilon_0 d(phi)/dt = 0（明示的にローレンツ共変、波動方程式を分離）

```markdown
## Boundary Conditions and Symmetry
- **Interfaces**: [list with media properties on each side]
- **Boundary conditions applied**: [normal E, tangential E, normal B, tangential H]
- **Symmetry**: [planar / cylindrical / spherical / none]
- **Reduced coordinates**: [independent variables after symmetry reduction]
- **Gauge** (if using potentials): [Coulomb / Lorenz / other]
```

**期待結果:** すべての界面ですべての境界条件が記述され、対称性が次元を減らすために活用され、問題が偏微分方程式の解法の準備ができていること。

**失敗時:** 境界条件が過剰決定（界面での方程式が未知数より多い）の場合、場の成分数が条件数と一致しているか確認する。不足決定の場合、境界条件が欠落している — 多くの場合、接線Hの条件または無限遠での放射条件である。

### ステップ3: 結果として得られる偏微分方程式の解法

マクスウェル方程式またはその導出形式を場の量について解く:

1. **波動方程式の導出**: 電源のない線形均質媒質中で:
   - ファラデーの法則のカールを取る: curl(curl(E)) = -d/dt(curl(B))
   - アンペール-マクスウェルを代入: curl(curl(E)) = -mu epsilon d^2E/dt^2
   - ベクトル恒等式を使用: curl(curl(E)) = grad(div(E)) - nabla^2(E)
   - div(E) = 0（自由電荷なし）として: nabla^2(E) = mu epsilon d^2E/dt^2
   - 波動速度: v = 1/sqrt(mu epsilon); 真空中 c = 1/sqrt(mu_0 epsilon_0)
   - Bについても同一の方程式が成立

2. **平面波解**: z方向に伝播する波について:
   - E(z, t) = E_0 exp[i(kz - omega t)]、k = omega/v = omega * sqrt(mu epsilon)
   - B = (1/v) k_hat x E（Eと伝播方向に垂直）
   - |B| = |E|/v
   - 偏光: E_0の成分に応じて直線、円、または楕円

3. **ラプラスおよびポアソン方程式**（静的な場合）:
   - 時間依存性なし: nabla^2(phi) = -rho/epsilon_0（ポアソン）またはnabla^2(phi) = 0（ラプラス）
   - 適切な座標系で変数分離法により解く
   - 展開係数を決定するために境界条件を合わせる

4. **導波路と共振器**: 導波路と共振空洞について:
   - TE（横電界）とTM（横磁界）モードに分解
   - 導体壁の境界条件を適用
   - 許容伝播定数または共振周波数の固有値問題を解く
   - カットオフ周波数: 寸法a x bの矩形導波路でomega_c = v * pi * sqrt((m/a)^2 + (n/b)^2)

5. **導体中の表皮深さ**: 導電率sigma_cの導体に浸透する時間変化する場について:
   - delta = sqrt(2 / (omega mu sigma_c))
   - 場は導体内部でexp(-z/delta)として減衰
   - 銅中60 Hzで: delta約8.5 mm; 1 GHzで: delta約2マイクロメートル

```markdown
## Field Solution
- **Equation solved**: [wave equation / Laplace / Poisson / eigenvalue]
- **Solution method**: [separation of variables / Fourier transform / Green's function / numerical]
- **Result**: E(r, t) = [expression], B(r, t) = [expression]
- **Dispersion relation**: omega(k) = [if wave solution]
- **Characteristic scales**: [wavelength, skin depth, decay length]
```

**期待結果:** マクスウェル方程式とすべての境界条件を満たす明示的な場の表現、該当する場合は分散関係または固有値スペクトルが得られること。

**失敗時:** 選択した座標系で偏微分方程式が分離できない場合、別の系を試すか数値解法（有限差分、有限要素）に頼る。代入検証で解がマクスウェル方程式の1つを満たさない場合、導出に代数的な誤りがある — カールと発散の演算を再確認する。

### ステップ4: 導出量の計算

場の解から物理的に意味のある量を抽出する:

1. **ポインティングベクトル**: S = (1/mu_0) E x B（瞬時エネルギー流束、W/m^2）:
   - 平面波: S = (1/mu_0) |E|^2 / v（伝播方向）
   - 時間平均ポインティングベクトル: 調和場で<S> = (1/2) Re(E x H*)
   - 強度: I = |<S>|（単位面積あたりのパワー）

2. **電磁エネルギー密度**:
   - 真空中 u = (1/2)(epsilon_0 |E|^2 + |B|^2/mu_0)
   - 線形媒質中 u = (1/2)(E . D + B . H)
   - エネルギー保存: du/dt + div(S) = -J . E（ポインティングの定理）

3. **放射圧**: 面に入射する平面波について:
   - 完全吸収体: P_rad = I/c = <S>/c
   - 完全反射体: P_rad = 2I/c = 2<S>/c
   - これは電磁場の運動量流束密度である

4. **波動インピーダンス**:
   - 媒質中: eta = sqrt(mu/epsilon) = mu * v
   - 真空中: eta_0 = sqrt(mu_0/epsilon_0)（約377オーム）
   - EとHの振幅を関連付ける: |E| = eta |H|
   - 垂直入射での反射係数: r = (eta_2 - eta_1)/(eta_2 + eta_1)

5. **パワー散逸と品質係数**:
   - 単位体積あたりのオーム損: p_loss = sigma |E|^2 / 2（導体中）
   - 共振器の品質係数: Q = omega * (蓄積エネルギー) / (1サイクルあたりの散逸パワー)
   - 共振のバンド幅と関連: Delta_omega = omega / Q

```markdown
## Derived Quantities
- **Poynting vector**: S = [expression], <S> = [time-averaged]
- **Energy density**: u = [expression]
- **Radiation pressure**: P_rad = [value]
- **Wave impedance**: eta = [value]
- **Reflection/transmission**: r = [value], t = [value]
- **Q-factor** (if resonant): Q = [value]
```

**期待結果:** すべての導出量が正しい単位で計算され、ポインティングの定理によりエネルギー保存が検証され、物理的に妥当な大きさであること。

**失敗時:** ポインティングの定理がバランスしない（du/dt + div(S)が-J . Eに等しくない）場合、EとBの解に不整合がある。両方の場が4つのマクスウェル方程式すべてを同時に満たしていることを再検証する。よくある誤りは、相互に整合しない異なる近似からEとBを計算することである。

### ステップ5: 既知の極限に対する検証

完全な解が極限的な場合に正しく簡約されることを確認する:

1. **静的極限（omega -> 0）**: 解が静電的または静磁的結果に簡約されるべきである:
   - E場はクーロンの法則またはラプラス/ポアソン方程式を満たすべき
   - B場はビオ-サバールの法則またはアンペールの法則（変位電流なし）を満たすべき
   - 変位電流が消失: mu_0 epsilon_0 dE/dt -> 0

2. **平面波極限**: 電源のない無限媒質中で、解がv = 1/sqrt(mu epsilon)と正しい偏光を持つ平面波に簡約されるべきである。

3. **完全導体極限（sigma -> 無限大）**:
   - 表皮深さdelta -> 0（場が浸透しない）
   - 表面で接線E -> 0
   - 反射係数r -> -1（位相反転を伴う完全反射）

4. **真空極限（epsilon_r = 1、mu_r = 1）**: 材料依存量がその真空値に簡約されるべきである。波動速度はcに等しいべきである。インピーダンスはeta_0（約377オーム）に等しいべきである。

5. **エネルギー保存チェック**: ポインティングの定理を閉じた体積上で積分する。全場エネルギーの変化率と表面を通って流出するパワーの和は、体積内の電流により供給されるパワーの負に等しくなければならない。不均衡は誤りを示す。

```markdown
## Limiting Case Verification
| Limit | Condition | Expected | Obtained | Match |
|-------|-----------|----------|----------|-------|
| Static | omega -> 0 | Coulomb / Biot-Savart | [result] | [Yes/No] |
| Plane wave | unbounded medium | v = c/n, eta = eta_0/n | [result] | [Yes/No] |
| Perfect conductor | sigma -> inf | delta -> 0, r -> -1 | [result] | [Yes/No] |
| Vacuum | epsilon_r = mu_r = 1 | c, eta_0 | [result] | [Yes/No] |
| Energy conservation | Poynting's theorem | balanced | [check] | [Yes/No] |
```

**期待結果:** すべての極限が正しい既知の結果を生成すること。エネルギー保存が数値精度の範囲内で満たされること。

**失敗時:** 極限の失敗は誤りの決定的な指標である。静的極限の失敗は電源項または境界条件の問題を示唆する。平面波極限の失敗は波動方程式の導出における誤りを示唆する。エネルギー保存の失敗はEとBの解の間の不整合を示唆する。特定のステップまで失敗を遡り、解を受け入れる前に修正する。

## バリデーション

- [ ] 4つのマクスウェル方程式すべてが記述され、関連する部分集合が特定された
- [ ] 変位電流が含まれるか明示的に無視可能と根拠が示された
- [ ] すべての材料界面で境界条件が適用された
- [ ] 対称性が偏微分方程式の次元を減らすために活用された
- [ ] 波動方程式（またはラプラス/ポアソン方程式）が正しく導出された
- [ ] 場の解が代入検証ですべてのマクスウェル方程式を満たす
- [ ] ポインティングベクトルとエネルギー密度が正しい単位（W/m^2とJ/m^3）で計算された
- [ ] ポインティングの定理（エネルギー保存）が検証された
- [ ] 波動インピーダンスと反射/透過係数が物理的に妥当である
- [ ] 静的極限がクーロンの法則とビオ-サバールの法則を再現する
- [ ] 平面波極限がv = 1/sqrt(mu epsilon)と直交するE、B、kを生成する
- [ ] 解が他の研究者が再現できるほど完全である

## よくある落とし穴

- **変位電流の省略**: 元のアンペールの法則（curl B = mu_0 J）で発散を取るとdiv(J) = 0となるが、これはrhoが時間変化する場合に電荷保存に矛盾する。変位電流項mu_0 epsilon_0 dE/dtがこれを修正し、波動伝播に不可欠である。dE/dtがJ/epsilon_0に比べて無視可能であることを検証せずに省略してはならない。
- **不整合なEとBの解**: EとBを独立に解く（例えばガウスの法則からE、アンペールの法則からB）際に、ファラデーの法則とBに対するガウスの法則を検証しないと、相互に整合しない場が得られる可能性がある。常にすべての4つの方程式を検証する。
- **境界条件の法線方向の誤り**: 規約n_hat x (H_1 - H_2) = K_fはn_hatが媒質2から媒質1に向くことを要求する。方向を逆にすると表面電流条件の符号が反転する。
- **材料中のD、E、B、Hの混同**: 真空中ではD = epsilon_0 EかつB = mu_0 H。線形媒質中ではD = epsilon EかつB = mu H。物質中のマクスウェル方程式は自由電源項にDとHを、力の法則にEとBを使用する。構成関係を混同するとepsilon_rまたはmu_rの因子の誤りにつながる。
- **位相速度と群速度の混同**: 波動速度v = omega/kは位相速度である。エネルギーと情報は群速度v_g = d(omega)/dkで伝播する。分散媒質中ではこれらが異なり、エネルギー輸送に位相速度を使用すると誤った結果になる。
- **放射条件の忘却**: 無限領域での散乱問題と放射問題では、解がゾンマーフェルトの放射条件（無限遠での出射波）を満たさなければならない。この条件なしでは解が一意でなく、非物理的な入射波を含む可能性がある。

## 関連スキル

- `analyze-magnetic-field` -- マクスウェル方程式の静磁的極限としての静的B場の計算
- `solve-electromagnetic-induction` -- ファラデーの法則を特定の誘導幾何学とRL回路に適用
- `formulate-quantum-problem` -- 量子光学とQEDのための電磁場の量子化
- `derive-theoretical-result` -- 波動方程式、グリーン関数、分散関係の厳密な導出
- `analyze-diffusion-dynamics` -- 導体媒質中のマクスウェル方程式から拡散方程式が生じる（表皮効果）
